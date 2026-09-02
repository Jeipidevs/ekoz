import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class AcademyController {
  public static async listCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      const courses = await prisma.course.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                include: {
                  userProgress: userId ? { where: { userId } } : false,
                },
              },
            },
          },
        },
      });

      // Mapa aula -> curso, usado para calcular popularidade real (learnersCount)
      // sem precisar de agregação SQL crua.
      const lessonToCourseId = new Map<string, string>();
      courses.forEach((course) => {
        course.modules.forEach((mod) => {
          mod.lessons.forEach((les) => {
            lessonToCourseId.set(les.id, course.id);
          });
        });
      });

      const allProgress = await prisma.userLessonProgress.findMany({
        select: { userId: true, lessonId: true },
      });

      const learnersByCourse = new Map<string, Set<string>>();
      allProgress.forEach((p) => {
        const courseId = lessonToCourseId.get(p.lessonId);
        if (!courseId) return;
        if (!learnersByCourse.has(courseId)) learnersByCourse.set(courseId, new Set());
        learnersByCourse.get(courseId)!.add(p.userId);
      });

      const formatted = courses.map((course) => {
        let totalLessons = 0;
        let completedLessons = 0;

        const modules = course.modules.map((mod) => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map((les) => {
            totalLessons++;
            const isCompleted = les.userProgress && les.userProgress.length > 0 && les.userProgress[0].completed;
            if (isCompleted) completedLessons++;

            return {
              id: les.id,
              title: les.title,
              duration: les.duration,
              videoUrl: les.videoUrl,
              summary: les.summary,
              completed: isCompleted || false,
              resources: JSON.parse(les.resources || '[]'),
            };
          }),
        }));

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: course.id,
          title: course.title,
          instructor: course.instructorName,
          instructorRole: course.instructorRole,
          instructorAvatar: course.instructorAvatar,
          coverImage: course.coverImage,
          backdropImage: course.backdropImage || course.coverImage,
          category: course.category as any,
          duration: course.duration,
          lessonsCount: totalLessons,
          description: course.description,
          modules,
          progress,
          isFeatured: course.isFeatured,
          tags: JSON.parse(course.tags || '[]'),
          learnersCount: learnersByCourse.get(course.id)?.size || 0,
        };
      });

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar masterclasses da Academy');
    }
  }

  public static async toggleLessonProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const lessonId = String(req.params.lessonId);
      const userId = req.user.id;

      const existingProgress = await prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      let updated;
      if (existingProgress) {
        updated = await prisma.userLessonProgress.update({
          where: { id: existingProgress.id },
          data: {
            completed: !existingProgress.completed,
            completedAt: !existingProgress.completed ? new Date() : null,
          },
        });
      } else {
        updated = await prisma.userLessonProgress.create({
          data: {
            userId,
            lessonId,
            completed: true,
            completedAt: new Date(),
          },
        });
      }

      res.json({
        lessonId: updated.lessonId,
        completed: updated.completed,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar progresso da aula');
    }
  }

  public static async getLessonComments(req: Request, res: Response): Promise<void> {
    try {
      const lessonId = String(req.params.lessonId);

      const comments = await prisma.lessonComment.findMany({
        where: { lessonId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              avatar: true,
              headline: true,
              company: true,
            },
          },
        },
      });

      res.json(comments);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao buscar discussões da aula');
    }
  }

  public static async addLessonComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const lessonId = String(req.params.lessonId);
      const { content } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Comentário não pode ser vazio' });
        return;
      }

      const comment = await prisma.lessonComment.create({
        data: {
          lessonId,
          userId: req.user.id,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              avatar: true,
              headline: true,
              company: true,
            },
          },
        },
      });

      res.status(201).json(comment);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao comentar na aula');
    }
  }
}
