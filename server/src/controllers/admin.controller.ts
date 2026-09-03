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

  // --- Eventos ---
  public static async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const { title, type, date, time, location, speaker, speakerRole, description, image, totalSpots } = req.body;

      if (!title || !type || !date || !location) {
        res.status(400).json({ error: 'Título, tipo, data e local são obrigatórios' });
        return;
      }

      const event = await prisma.event.create({
        data: {
          title,
          type,
          date,
          time: time || '',
          location,
          speakerName: speaker || '',
          speakerRole: speakerRole || '',
          description: description || '',
          image: image || '',
          totalSpots: totalSpots || 50,
        },
      });

      res.status(201).json({ event });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao criar evento');
    }
  }

  public static async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId as string;
      const { title, type, date, time, location, speaker, speakerRole, description, image, totalSpots } = req.body;

      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...(title !== undefined && { title }),
          ...(type !== undefined && { type }),
          ...(date !== undefined && { date }),
          ...(time !== undefined && { time }),
          ...(location !== undefined && { location }),
          ...(speaker !== undefined && { speakerName: speaker }),
          ...(speakerRole !== undefined && { speakerRole }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(totalSpots !== undefined && { totalSpots }),
        },
      });

      res.json({ event });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar evento');
    }
  }

  public static async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId as string;
      await prisma.event.delete({ where: { id: eventId } });
      res.json({ success: true });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao remover evento');
    }
  }

  // --- Marketplace: Núcleos Temáticos ---
  public static async createCore(req: Request, res: Response): Promise<void> {
    try {
      const { name, slug, icon, description } = req.body;

      if (!name || !slug) {
        res.status(400).json({ error: 'Nome e slug são obrigatórios' });
        return;
      }

      const core = await prisma.thematicCore.create({
        data: { name, slug, icon: icon || 'Layers', description: description || '' },
      });

      res.status(201).json({ core });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao criar núcleo temático');
    }
  }

  public static async updateCore(req: Request, res: Response): Promise<void> {
    try {
      const coreId = req.params.coreId as string;
      const { name, slug, icon, description } = req.body;

      const core = await prisma.thematicCore.update({
        where: { id: coreId },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(icon !== undefined && { icon }),
          ...(description !== undefined && { description }),
        },
      });

      res.json({ core });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar núcleo temático');
    }
  }

  public static async deleteCore(req: Request, res: Response): Promise<void> {
    try {
      const coreId = req.params.coreId as string;
      await prisma.thematicCore.delete({ where: { id: coreId } });
      res.json({ success: true });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao remover núcleo temático');
    }
  }

  // --- Marketplace: Negócios ---
  public static async updateBusiness(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.params.businessId as string;
      const { name, headline, description, verified, featured, coreId } = req.body;

      const business = await prisma.marketplaceBusiness.update({
        where: { id: businessId },
        data: {
          ...(name !== undefined && { name }),
          ...(headline !== undefined && { headline }),
          ...(description !== undefined && { description }),
          ...(verified !== undefined && { verified }),
          ...(featured !== undefined && { featured }),
          ...(coreId !== undefined && { coreId }),
        },
      });

      res.json({ business });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar negócio do marketplace');
    }
  }

  public static async deleteBusiness(req: Request, res: Response): Promise<void> {
    try {
      const businessId = req.params.businessId as string;
      await prisma.marketplaceBusiness.delete({ where: { id: businessId } });
      res.json({ success: true });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao remover negócio do marketplace');
    }
  }
}
