import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class UsersController {
  public static async listMembers(req: Request, res: Response): Promise<void> {
    try {
      const { search, role, plan } = req.query;

      const where: any = {};
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { headline: { contains: search } },
          { company: { contains: search } },
        ];
      }
      if (role && typeof role === 'string') {
        where.role = role;
      }
      if (plan && typeof plan === 'string') {
        where.plan = plan;
      }

      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          headline: true,
          company: true,
          avatar: true,
          bio: true,
          verified: true,
          skills: true,
          location: true,
          whatsapp: true,
          instagram: true,
          linkedin: true,
          plan: true,
        },
      });

      const formatted = users.map((u) => ({
        ...u,
        skills: JSON.parse(u.skills || '[]'),
      }));

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar membros');
    }
  }

  public static async getMemberById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          headline: true,
          company: true,
          avatar: true,
          bio: true,
          verified: true,
          skills: true,
          location: true,
          whatsapp: true,
          instagram: true,
          linkedin: true,
          plan: true,
          businesses: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Membro não encontrado' });
        return;
      }

      res.json({
        ...user,
        skills: JSON.parse(user.skills || '[]'),
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao buscar membro');
    }
  }
}
