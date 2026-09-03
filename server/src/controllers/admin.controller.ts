import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

const ASSIGNABLE_ROLES = ['CEO', 'Mentor', 'Admin', 'Member', 'Black Member'];

export class AdminController {
  public static async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { search, role, active } = req.query as { search?: string; role?: string; active?: string };

      const users = await prisma.user.findMany({
        where: {
          ...(role ? { role } : {}),
          ...(active !== undefined ? { active: active === 'true' } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          active: true,
          whatsapp: true,
          createdAt: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { plan: true, status: true, expiresAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ users });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar membros');
    }
  }

  public static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body;

      if (!ASSIGNABLE_ROLES.includes(role)) {
        res.status(400).json({ error: 'Cargo inválido' });
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });

      res.json({ user });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar cargo do membro');
    }
  }

  public static async updateActive(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        res.status(400).json({ error: '"active" deve ser true ou false' });
        return;
      }

      if (userId === req.user?.id && !active) {
        res.status(400).json({ error: 'Você não pode desativar a própria conta' });
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { active },
        select: { id: true, email: true, name: true, active: true },
      });

      res.json({ user });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar status do membro');
    }
  }

  public static async listSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query as { status?: string };

      const subscriptions = await prisma.subscription.findMany({
        where: status ? { status } : {},
        select: {
          id: true,
          plan: true,
          status: true,
          amount: true,
          paymentMethod: true,
          caktoOrderId: true,
          expiresAt: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ subscriptions });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar assinaturas');
    }
  }

  public static async revokeSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = req.params.subscriptionId as string;

      const subscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'CANCELLED' },
        select: {
          id: true,
          status: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      res.json({ subscription });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao revogar assinatura');
    }
  }
}
