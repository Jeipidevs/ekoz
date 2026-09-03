import webpush from 'web-push';
import { config } from '../config/index.js';
import { prisma } from './prisma.service.js';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let configured = false;

/** Configura o web-push com as chaves VAPID uma única vez. Retorna false se
 *  as chaves não estiverem definidas (push simplesmente não dispara). */
function ensureConfigured(): boolean {
  if (configured) return true;
  if (!config.vapidPublic || !config.vapidPrivate) {
    return false;
  }
  webpush.setVapidDetails(config.vapidSubject, config.vapidPublic, config.vapidPrivate);
  configured = true;
  return true;
}

export class PushService {
  /** Envia uma notificação push nativa para todos os dispositivos inscritos
   *  de um usuário. Inscrições expiradas (404/410) são removidas do banco. */
  public static async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!ensureConfigured()) {
      console.warn('⚠️  VAPID não configurado — push nativo não enviado.');
      return;
    }

    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
          );
        } catch (err: any) {
          const status = err?.statusCode;
          if (status === 404 || status === 410) {
            // Inscrição morta (app desinstalado / permissão revogada) — limpa.
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          } else {
            console.error('❌ Erro ao enviar push:', status || err?.message);
          }
        }
      }),
    );
  }
}
