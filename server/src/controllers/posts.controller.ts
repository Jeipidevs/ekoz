import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { SocketService } from '../services/socket.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class PostsController {
  public static async listPosts(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const currentUserId = req.user?.id;

      const where: any = {};
      if (category && typeof category === 'string' && category !== 'Todos') {
        where.category = category;
      }

      const posts = await prisma.post.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              headline: true,
              company: true,
              avatar: true,
              verified: true,
              plan: true,
              skills: true,
              location: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  headline: true,
                  company: true,
                  avatar: true,
                  verified: true,
                  plan: true,
                  skills: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      const formattedPosts = posts.map((post) => ({
        id: post.id,
        author: {
          ...post.author,
          skills: JSON.parse(post.author.skills || '[]'),
        },
        content: post.content,
        timestamp: post.createdAt.toISOString(),
        pinned: post.pinned,
        category: post.category,
        mediaUrl: post.mediaUrl || undefined,
        likesCount: post.likes.length,
        userLiked: currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false,
        comments: post.comments.map((c) => ({
          id: c.id,
          author: {
            ...c.author,
            skills: JSON.parse(c.author.skills || '[]'),
          },
          content: c.content,
          timestamp: c.createdAt.toISOString(),
        })),
      }));

      res.json(formattedPosts);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar publicações');
    }
  }

  public static async createPost(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { content, category, mediaUrl } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Conteúdo da publicação é obrigatório' });
        return;
      }

      const post = await prisma.post.create({
        data: {
          authorId: req.user.id,
          content: content.trim(),
          category: category || 'Negócios',
          mediaUrl: mediaUrl || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              headline: true,
              company: true,
              avatar: true,
              verified: true,
              plan: true,
              skills: true,
              location: true,
            },
          },
        },
      });

      const formatted = {
        id: post.id,
        author: {
          ...post.author,
          skills: JSON.parse(post.author.skills || '[]'),
        },
        content: post.content,
        timestamp: post.createdAt.toISOString(),
        pinned: post.pinned,
        category: post.category as any,
        mediaUrl: post.mediaUrl || undefined,
        likesCount: 0,
        userLiked: false,
        comments: [],
      };

      SocketService.broadcastPost(formatted);

      res.status(201).json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao criar publicação');
    }
  }

  public static async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const id = String(req.params.id);
      const userId = req.user.id;

      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: userId,
          },
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
      } else {
        await prisma.like.create({
          data: {
            postId: id,
            userId: userId,
          },
        });
      }

      const likesCount = await prisma.like.count({
        where: { postId: id },
      });

      res.json({
        liked: !existingLike,
        likesCount,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao curtir publicação');
    }
  }

  public static async addComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const id = String(req.params.id);
      const { content } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
        return;
      }

      const comment = await prisma.comment.create({
        data: {
          postId: id,
          authorId: req.user.id,
          content: content.trim(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              headline: true,
              company: true,
              avatar: true,
              verified: true,
              plan: true,
              skills: true,
              location: true,
            },
          },
        },
      });

      res.status(201).json({
        id: comment.id,
        author: {
          ...comment.author,
          skills: JSON.parse(comment.author.skills || '[]'),
        },
        content: comment.content,
        timestamp: comment.createdAt.toISOString(),
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao adicionar comentário');
    }
  }

  public static async togglePin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'CEO' && req.user.role !== 'Admin')) {
        res.status(403).json({ error: 'Permissão exclusiva para CEO ou Admin' });
        return;
      }

      const id = String(req.params.id);
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) {
        res.status(404).json({ error: 'Publicação não encontrada' });
        return;
      }

      const updated = await prisma.post.update({
        where: { id },
        data: { pinned: !post.pinned },
      });

      res.json({ pinned: updated.pinned });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao fixar publicação');
    }
  }
}
