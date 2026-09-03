import { prisma } from './prisma.service.js';
import { SocketService } from './socket.service.js';
import { PushService } from './push.service.js';

export interface NotifyInput {
  type?: 'whatsapp' | 'lesson' | 'announcement' | 'connection' | string;
  title: string;
  description: string;
  actionUrl?: string;
}

/** Ponto único de criação de notificação: persiste no banco, emite ao vivo
 *  via Socket.IO (sino in-app) e dispara o push nativo no celular. Assim os
 *  três canais nunca saem de sincronia. */
export class NotificationService {
  public static async notify(userId: string, input: NotifyInput): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: input.type || 'announcement',
        title: input.title,
        description: input.description,
        actionUrl: input.actionUrl || null,
      },
    });

    const formatted = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      timestamp: notification.createdAt.toISOString(),
      read: notification.isRead,
      actionUrl: notification.actionUrl || undefined,
    };

    // Ao vivo no app (sino) — não bloqueia caso o socket não esteja pronto.
    try {
      SocketService.emitNotification(userId, formatted);
    } catch {
      /* socket opcional */
    }

    // Push nativo no celular (best-effort; falha não derruba o fluxo).
    void PushService.sendToUser(userId, {
      title: input.title,
      body: input.description,
      url: input.actionUrl,
      tag: notification.type,
    });
  }
}
