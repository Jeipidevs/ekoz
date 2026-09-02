import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.service.js';
import { WhatsAppService } from './whatsapp.service.js';
import { config } from '../config/index.js';

// Formato real dos eventos/payload da Cakto — ver https://docs.cakto.com.br/conceitos/webhooks
export interface CaktoWebhookPayload {
  secret?: string;
  event:
    | 'purchase_approved'
    | 'subscription_renewed'
    | 'subscription_canceled'
    | 'refund'
    | 'chargeback'
    | string;
  data: {
    id: string;
    refId?: string;
    status?: string;
    baseAmount?: number;
    checkoutUrl?: string;
    name?: string;
    email?: string;
    docNumber?: string;
    phone?: string;
    product?: { id?: string; name?: string };
    offer?: { id?: string; name?: string; price?: number };
  };
}

// Acesso anual: renovação só ocorre na próxima compra, então damos margem de 1 ano
// + alguns dias. Acesso mensal recorrente é mantido vivo pelo evento subscription_renewed.
const ANNUAL_ACCESS_DAYS = 370;
const MONTHLY_RENEWAL_GRACE_DAYS = 35;

export class CaktoService {
  public static async handleWebhook(payload: CaktoWebhookPayload) {
    const { event, data } = payload;
    console.log(`💳 [Cakto Webhook] ${event} — pedido ${data?.id}`);

    if (!data?.email) {
      console.warn('⚠️  Webhook Cakto sem e-mail no payload, evento ignorado.');
      return { success: true, message: 'Sem e-mail no payload, evento ignorado' };
    }

    switch (event) {
      case 'purchase_approved':
        return CaktoService.grantAccess(payload);
      case 'subscription_renewed':
        return CaktoService.renewAccess(payload);
      case 'subscription_canceled':
      case 'refund':
      case 'chargeback':
        return CaktoService.revokeAccess(payload);
      default:
        return { success: true, message: `Evento ${event} não tratado` };
    }
  }

  private static async grantAccess(payload: CaktoWebhookPayload) {
    const { data } = payload;
    const email = data.email!.toLowerCase();
    const planName = data.offer?.name || data.product?.name || 'Ekoz';

    let user = await prisma.user.findUnique({ where: { email } });
    let temporaryPassword: string | null = null;

    if (!user) {
      temporaryPassword = crypto.randomBytes(6).toString('hex');
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: data.name || email.split('@')[0],
          role: 'Member',
          plan: planName,
          whatsapp: data.phone || null,
          verified: true,
          skills: JSON.stringify([]),
        },
      });
    } else if (user.plan !== planName) {
      user = await prisma.user.update({ where: { id: user.id }, data: { plan: planName } });
    }

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: planName,
        status: 'ACTIVE',
        caktoOrderId: data.id,
        amount: data.baseAmount || 0,
        paymentMethod: 'cakto',
        expiresAt: new Date(Date.now() + ANNUAL_ACCESS_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'announcement',
        title: 'Acesso Ekoz liberado!',
        description: 'Seu pagamento foi confirmado e seu acesso ao ecossistema Ekoz já está ativo.',
      },
    });

    await CaktoService.notifyAccessGranted({ user, email, planName, phone: data.phone, temporaryPassword });

    console.log(`✨ Acesso concedido para ${email} (${planName})`);
    return { success: true, userId: user.id, plan: planName, accountCreated: !!temporaryPassword };
  }

  private static async notifyAccessGranted(params: {
    user: { id: string; name: string };
    email: string;
    planName: string;
    phone?: string;
    temporaryPassword: string | null;
  }) {
    const { user, email, planName, phone, temporaryPassword } = params;

    if (phone) {
      const passwordLine = temporaryPassword
        ? `\nSua senha temporária: *${temporaryPassword}*\n(recomendamos trocar assim que entrar)`
        : '';
      await WhatsAppService.sendNotification({
        toPhone: phone,
        type: 'payment',
        title: `Bem-vindo(a) à Ekoz, ${user.name}!`,
        body: `Seu pagamento (${planName}) foi confirmado.\n\nAcesse com o e-mail *${email}*${passwordLine}`,
        actionUrl: 'https://ekoz.jpstudio.tech',
      });
      return;
    }

    if (config.adminWhatsappNumber) {
      await WhatsAppService.sendNotification({
        toPhone: config.adminWhatsappNumber,
        type: 'alert',
        title: 'Nova compra sem telefone no payload',
        body: `Comprador: ${user.name} (${email})\nOferta: ${planName}\nO webhook da Cakto não trouxe telefone — contate manualmente para repassar o acesso.${
          temporaryPassword ? `\nSenha gerada: ${temporaryPassword}` : ''
        }`,
      });
    }
  }

  private static async renewAccess(payload: CaktoWebhookPayload) {
    const { data } = payload;
    const email = data.email!.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn(`⚠️  subscription_renewed para e-mail sem conta: ${email}`);
      return { success: true, message: 'Usuário não encontrado' };
    }

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: data.offer?.name || user.plan,
        status: 'ACTIVE',
        caktoOrderId: data.id,
        amount: data.baseAmount || 0,
        paymentMethod: 'cakto',
        expiresAt: new Date(Date.now() + MONTHLY_RENEWAL_GRACE_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`🔄 Assinatura renovada para ${email}`);
    return { success: true, userId: user.id };
  }

  private static async revokeAccess(payload: CaktoWebhookPayload) {
    const { data, event } = payload;
    const email = data.email!.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true, message: 'Usuário não encontrado' };
    }

    await prisma.subscription.updateMany({
      where: { userId: user.id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'announcement',
        title: 'Acesso Ekoz encerrado',
        description: `Seu acesso foi encerrado (${event}). Entre em contato caso isso seja um engano.`,
      },
    });

    console.log(`🚫 Acesso revogado para ${email} (${event})`);
    return { success: true, userId: user.id };
  }
}
