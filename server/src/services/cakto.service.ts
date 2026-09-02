import { prisma } from './prisma.service.js';
import { WhatsAppService } from './whatsapp.service.js';

export interface CaktoOrderRequest {
  userId: string;
  plan: 'Membro Ekoz' | 'Ekoz Black';
  paymentMethod: 'pix' | 'credit_card';
  installments?: number;
}

export interface CaktoWebhookPayload {
  secret?: string;
  event: 'order.paid' | 'order.approved' | 'order.refunded' | 'subscription.canceled';
  data: {
    id: string;
    amount: number;
    customer: {
      email: string;
      name: string;
      phone?: string;
    };
    metadata?: {
      userId?: string;
      plan?: string;
    };
    payment_method: string;
    status: string;
    paid_at?: string;
  };
}

export class CaktoService {
  /**
   * Create or simulate a Cakto checkout order
   */
  public static async createOrder(order: CaktoOrderRequest) {
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const orderId = `cakto_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const amount = order.plan === 'Ekoz Black' ? 1250.0 : 297.0;

    // Generate mock PIX copy-paste code or transaction token
    const pixCode = `00020126580014br.gov.bcb.pix0136${orderId}520400005303986540${amount.toFixed(2)}5802BR5915EKOZ_ECOSYSTEM6009SAO_PAULO62070503***6304CA12`;

    // Save pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: order.plan,
        status: 'PENDING',
        caktoOrderId: orderId,
        amount: amount,
        paymentMethod: order.paymentMethod,
      },
    });

    return {
      orderId,
      subscriptionId: subscription.id,
      amount,
      plan: order.plan,
      pixCode: order.paymentMethod === 'pix' ? pixCode : undefined,
      qrCodeUrl: order.paymentMethod === 'pix' ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}` : undefined,
      checkoutUrl: `https://checkout.cakto.com.br/pay/${orderId}`,
    };
  }

  /**
   * Process Cakto Webhook and automatically upgrade user
   */
  public static async handleWebhook(payload: CaktoWebhookPayload) {
    console.log('💳 [Cakto Webhook] Received event:', payload.event, payload.data.id);

    const { event, data } = payload;
    const email = data.customer?.email;
    const planName = data.metadata?.plan || (data.amount >= 1000 ? 'Ekoz Black' : 'Membro Ekoz');

    if (event === 'order.paid' || event === 'order.approved') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { id: data.metadata?.userId || '' },
          ],
        },
      });

      if (user) {
        // Upgrade user plan and role if applicable
        const updatedRole = planName === 'Ekoz Black' && user.role !== 'CEO' && user.role !== 'Mentor' && user.role !== 'Admin' 
          ? 'Black Member' 
          : user.role;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: planName,
            role: updatedRole,
          },
        });

        // Update or create subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: planName,
            status: 'ACTIVE',
            caktoOrderId: data.id,
            amount: data.amount / 100 || data.amount,
            paymentMethod: data.payment_method,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'announcement',
            title: `Assinatura ${planName} Ativada!`,
            description: `Seu pagamento via Cakto foi confirmado com sucesso. Todos os benefícios exclusivos do plano ${planName} já estão disponíveis.`,
          },
        });

        // Send WhatsApp Push Celebration
        if (user.whatsapp) {
          await WhatsAppService.sendNotification({
            toPhone: user.whatsapp,
            type: 'payment',
            title: `Assinatura ${planName} Confirmada com Sucesso!`,
            body: `Parabéns, ${user.name}! Seu acesso exclusivo ao plano *${planName}* foi liberado. Prepare-se para vivenciar o mais alto nível de conexões executivas.`,
            actionUrl: 'https://ekoz.jpstudio.tech',
          });
        }

        console.log(`✨ User ${user.email} successfully upgraded to ${planName}!`);
        return { success: true, userId: user.id, plan: planName };
      }
    }

    return { success: true, message: 'Event ignored or user not found' };
  }
}
