import { config } from '../config/index.js';

export interface WhatsAppNotificationPayload {
  toPhone: string;
  type: 'announcement' | 'lesson' | 'message' | 'event' | 'payment';
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
        header = '👑 *EKOZ BLACK — ASSINATURA CONFIRMADA*';
        break;
    }

    const divider = '━━━━━━━━━━━━━━━━━━━━━━';
    const link = payload.actionUrl ? `\n\n🔗 *Acesse agora na plataforma:* ${payload.actionUrl}` : '';
    const footer = `\n${divider}\n_"Viva a vida que você nunca VIVEU!"_ — *Ezekiel Dall'Bello*`;

    return `${header}\n${divider}\n\n*${payload.title}*\n\n${payload.body}${link}${footer}`;
  }

  /**
   * Send WhatsApp message via configured gateway (Z-API / Evolution / Mock)
   */
  public static async sendNotification(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const cleanPhone = this.cleanPhone(payload.toPhone);
    const message = this.formatMessage(payload);

    console.log(`📲 [WhatsApp Push] Dispatching to ${cleanPhone}:`);
    console.log(message);

    // If using real API gateway:
    if (config.whatsappApiUrl && !config.whatsappApiUrl.includes('sample')) {
      try {
        const response = await fetch(config.whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': config.whatsappApiToken,
          },
          body: JSON.stringify({
            phone: cleanPhone,
            message: message,
          }),
        });

        const data: any = await response.json();
        return { success: response.ok, messageId: data.messageId || data.id };
      } catch (err: any) {
        console.error('❌ Error sending WhatsApp notification:', err.message);
        return { success: false, error: err.message };
      }
    }

    // In development or demo mode, simulate successful dispatch
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
    };
  }
}
