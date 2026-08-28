import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';

export class NotificationsController {
  public static async listNotifications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const formatted = notifications.map((n) => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        description: n.description,
        timestamp: n.createdAt.toISOString(),
        read: n.isRead,
        actionUrl: n.actionUrl || undefined,
      }));

      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar notificações' });
    }
  }

  public static async markRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const id = String(req.params.id);

      await prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao marcar notificação como lida' });
    }
  }

  public static async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao marcar notificações como lidas' });
    }
  }
}
