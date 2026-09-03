import { config } from '../config/index.js';

export interface WhatsAppNotificationPayload {
  toPhone: string;
  type: 'announcement' | 'lesson' | 'message' | 'event' | 'payment' | 'alert';
  title: string;
  body: string;
  actionUrl?: string;
}

export class WhatsAppService {
  /**
   * Format phone number to international E.164 without non-digit chars
   */
  private static cleanPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('55') && cleaned.length === 11) {
      // Formato BR 55 + DDD + 9 dígitos
      return cleaned;
    }
    if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
      return `55${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Format message body with Ekoz luxury aesthetics and emojis
   */
  private static formatMessage(payload: WhatsAppNotificationPayload): string {
    let header = '🏛️ *EKOZ ECOSYSTEM*';
    switch (payload.type) {
      case 'announcement':
        header = '🏛️ *EKOZ — COMUNICADO OFICIAL DA LIDERANÇA*';
        break;
      case 'lesson':
        header = '🎓 *EKOZ ACADEMY — NOVA MASTERCLASS DISPONÍVEL*';
        break;
      case 'message':
        header = '💬 *EKOZ NETWORKING — NOVA MENSAGEM DIRETA*';
        break;
      case 'event':
        header = '📅 *EKOZ SUMMITS & EXPEDIÇÕES — CONFIRMAÇÃO*';
        break;
      case 'payment':
        header = '👑 *EKOZ — ACESSO CONFIRMADO*';
        break;
      case 'alert':
        header = '⚠️ *EKOZ — ALERTA ADMINISTRATIVO*';
        break;
    }

    const divider = '━━━━━━━━━━━━━━━━━━━━━━';
    const link = payload.actionUrl ? `\n\n🔗 *Acesse agora na plataforma:* ${payload.actionUrl}` : '';
    const footer = `\n${divider}\n_"Viva a vida que você nunca VIVEU!"_ — *Ezekiel Dall'Bello*`;

    return `${header}\n${divider}\n\n*${payload.title}*\n\n${payload.body}${link}${footer}`;
  }

  /**
   * Send WhatsApp message via Evolution API (instância dedicada "Ekoz")
   */
  public static async sendNotification(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const cleanPhone = this.cleanPhone(payload.toPhone);
    const message = this.formatMessage(payload);

    console.log(`📲 [WhatsApp Push] Dispatching to ${cleanPhone}:`);
    console.log(message);

    if (!config.evolutionApiUrl || !config.evolutionInstanceName || !config.evolutionApiKey) {
      console.error('❌ Evolution API não configurada (EVOLUTION_API_URL/INSTANCE_NAME/API_KEY) — mensagem NÃO enviada.');
      return { success: false, error: 'Evolution API não configurada' };
    }

    try {
      const response = await fetch(
        `${config.evolutionApiUrl}/message/sendText/${config.evolutionInstanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: config.evolutionApiKey,
          },
          body: JSON.stringify({
            number: cleanPhone,
            text: message,
          }),
        }
      );

      const data: any = await response.json();
      if (!response.ok) {
        console.error('❌ Evolution API respondeu com erro:', response.status, data);
        return { success: false, error: data?.message || `HTTP ${response.status}` };
      }

      return { success: true, messageId: data?.key?.id || data?.messageId };
    } catch (err: any) {
      console.error('❌ Error sending WhatsApp notification:', err.message);
      return { success: false, error: err.message };
    }
  }
}
