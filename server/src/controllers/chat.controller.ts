import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';

export class ChatController {
  public static async listConversations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const userId = req.user.id;

      const conversations = await prisma.chatConversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });

      // Fetch member profiles for each conversation
      const result = await Promise.all(
        conversations.map(async (c) => {
          const partnerId = c.user1Id === userId ? c.user2Id : c.user1Id;
          const partner = await prisma.user.findUnique({
            where: { id: partnerId },
            select: {
              id: true,
              name: true,
              role: true,
              headline: true,
              company: true,
              avatar: true,
              verified: true,
              plan: true,
            },
          });

          return {
            id: c.id,
            partner,
            lastMessage: c.messages[0] || null,
            lastMessageAt: c.lastMessageAt,
          };
        })
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar conversas' });
    }
  }

  public static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const currentUserId = req.user.id;
      const partnerId = String(req.params.partnerId);

      const [u1, u2] = [currentUserId, partnerId].sort();
      const conversation = await prisma.chatConversation.findUnique({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });

      if (!conversation) {
        res.json([]);
        return;
      }

      const formatted = conversation.messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderAvatar: m.sender.avatar,
        text: m.text,
        timestamp: m.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === currentUserId,
      }));

      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao buscar mensagens' });
    }
  }
}
