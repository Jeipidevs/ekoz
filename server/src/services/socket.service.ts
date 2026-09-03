import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from './prisma.service.js';
import { PushService } from './push.service.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private static io: SocketIOServer | null = null;
  private static userSockets: Map<string, Set<string>> = new Map();

  public static initialize(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Allow all origins for dev and prod
        methods: ['GET', 'POST'],
      },
    });

    // Authentication Middleware for WebSocket
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow guest or read-only connection
        return next();
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch {
        next();
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId;

      if (userId) {
        console.log(`🔌 [Socket.IO] Member connected: ${userId} (Socket ID: ${socket.id})`);

        // Track user socket
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)?.add(socket.id);

        // Join personal user room
        socket.join(`user:${userId}`);

        // Broadcast online presence
        socket.broadcast.emit('user:online', { userId });
      }

      // Join feed room for live posts
      socket.join('room:feed');

      // Handle Direct Message
      socket.on('chat:send_message', async (data: { recipientId: string; text: string }) => {
        try {
          if (!socket.userId) return;

          const senderId = socket.userId;
          const { recipientId, text } = data;

          // Find or create conversation
          const [u1, u2] = [senderId, recipientId].sort();
          let conversation = await prisma.chatConversation.findUnique({
            where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
          });

          if (!conversation) {
            conversation = await prisma.chatConversation.create({
              data: { user1Id: u1, user2Id: u2, lastMessageAt: new Date() },
            });
          } else {
            await prisma.chatConversation.update({
              where: { id: conversation.id },
              data: { lastMessageAt: new Date() },
            });
          }

          // Create message
          const message = await prisma.chatMessage.create({
            data: {
              conversationId: conversation.id,
              senderId: senderId,
              text: text,
            },
            include: {
              sender: {
                select: { id: true, name: true, avatar: true, role: true, headline: true },
              },
            },
          });

          // Emit to recipient and sender
          this.io?.to(`user:${recipientId}`).emit('chat:new_message', message);
          socket.emit('chat:message_sent', message);

          // Se o destinatário está offline, entrega um push nativo no celular
          // dele — é justamente quando o push importa (app fechado).
          if (!this.isOnline(recipientId)) {
            const preview = text.length > 90 ? `${text.slice(0, 90)}…` : text;
            void PushService.sendToUser(recipientId, {
              title: `💬 ${message.sender?.name || 'Nova mensagem'}`,
              body: preview,
              url: '/',
              tag: `chat-${senderId}`,
            });
          }

          console.log(`💬 Message sent from ${senderId} to ${recipientId}`);
        } catch (err) {
          console.error('❌ Error handling chat:send_message', err);
        }
      });

      // Typing Indicator
      socket.on('chat:typing', (data: { recipientId: string; isTyping: boolean }) => {
        if (!socket.userId) return;
        this.io?.to(`user:${data.recipientId}`).emit('chat:user_typing', {
          userId: socket.userId,
          isTyping: data.isTyping,
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (userId) {
          console.log(`🔌 [Socket.IO] Member disconnected: ${userId}`);
          const userSocketSet = this.userSockets.get(userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
              this.userSockets.delete(userId);
              socket.broadcast.emit('user:offline', { userId });
            }
          }
        }
      });
    });

    return this.io;
  }

  /** True se o usuário tem ao menos um socket conectado agora. */
  public static isOnline(userId: string): boolean {
    const set = this.userSockets.get(userId);
    return !!set && set.size > 0;
  }

  public static emitNotification(userId: string, notification: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification:new', notification);
    }
  }

  public static broadcastPost(post: any) {
    if (this.io) {
      this.io.to('room:feed').emit('feed:new_post', post);
    }
  }
}
