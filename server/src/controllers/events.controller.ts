import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class EventsController {
  public static async listEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          registrations: {
            where: { status: 'CONFIRMED' },
            select: { userId: true },
          },
        },
      });

      const formatted = events.map((event) => {
        const confirmedCount = event.registrations.length;
        const spotsLeft = Math.max(0, event.totalSpots - confirmedCount);
        const isRegistered = userId ? event.registrations.some((r) => r.userId === userId) : false;

        return {
          id: event.id,
          title: event.title,
          type: event.type as any,
          date: event.date,
          time: event.time,
          location: event.location,
          speaker: event.speakerName,
          speakerRole: event.speakerRole,
          description: event.description,
          image: event.image,
          spotsLeft,
          totalSpots: event.totalSpots,
          isRegistered,
        };
      });

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar eventos');
    }
  }

  public static async toggleRegistration(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const id = String(req.params.id);
      const userId = req.user.id;

      const existing = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: userId,
          },
        },
      });

      let isRegistered = false;
      if (existing) {
        await prisma.eventRegistration.delete({
          where: { id: existing.id },
        });
        isRegistered = false;
      } else {
        await prisma.eventRegistration.create({
          data: {
            eventId: id,
            userId: userId,
            status: 'CONFIRMED',
          },
        });
        isRegistered = true;
      }

      res.json({
        eventId: id,
        isRegistered,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao confirmar presença no evento');
    }
  }
}
