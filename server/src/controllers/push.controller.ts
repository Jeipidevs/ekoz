import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { config } from '../config/index.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class PushController {
  /** Chave pública VAPID — o frontend precisa dela pra criar a inscrição. */
  public static getVapidPublicKey(_req: Request, res: Response): void {
    res.json({ publicKey: config.vapidPublic || null });
  }

  /** Registra (ou atualiza) a inscrição de push do dispositivo atual. */
  public static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { endpoint, keys } = req.body || {};
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        res.status(400).json({ error: 'Inscrição de push inválida' });
        return;
      }

      // upsert pelo endpoint (único): se o mesmo device reinscrever, atualiza
      // o dono e as chaves em vez de duplicar.
      await prisma.pushSubscription.upsert({
        where: { endpoint },
        create: {
          userId: req.user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        update: {
          userId: req.user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      res.status(201).json({ success: true });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao registrar push');
    }
  }

  /** Remove a inscrição do dispositivo (ao desativar as notificações). */
  public static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { endpoint } = req.body || {};
      if (!endpoint) {
        res.status(400).json({ error: 'endpoint é obrigatório' });
        return;
      }

      await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId: req.user.id },
      });

      res.json({ success: true });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao remover push');
    }
  }
}
