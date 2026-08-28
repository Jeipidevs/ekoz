import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';

export class ExperiencesController {
  public static async listExperiences(_req: Request, res: Response): Promise<void> {
    try {
      const experiences = await prisma.experience.findMany({
        orderBy: { createdAt: 'asc' },
      });

      const formatted = experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        subtitle: exp.subtitle,
        destination: exp.destination,
        dates: exp.dates,
        coverImage: exp.coverImage,
        gallery: JSON.parse(exp.gallery || '[]'),
        highlights: JSON.parse(exp.highlights || '[]'),
        description: exp.description,
        status: exp.status as any,
        investment: exp.investment,
      }));

      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar expedições' });
    }
  }

  public static async applyForExperience(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const id = String(req.params.id);
      const { notes } = req.body;

      const application = await prisma.experienceApplication.upsert({
        where: {
          experienceId_userId: {
            experienceId: id,
            userId: req.user.id,
          },
        },
        update: {
          notes: notes || null,
          status: 'PENDING',
        },
        create: {
          experienceId: id,
          userId: req.user.id,
          notes: notes || null,
          status: 'PENDING',
        },
      });

      res.status(201).json({
        message: 'Candidatura enviada com sucesso para a comissão executiva Ekoz',
        applicationId: application.id,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao submeter candidatura para expedição' });
    }
  }
}
