import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { prisma } from '../services/prisma.service.js';

export class WhatsAppController {
  public static async sendPush(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'CEO' && req.user.role !== 'Admin')) {
        res.status(403).json({ error: 'Permissão exclusiva para CEO ou Admin' });
        return;
      }

      const { target, type, title, body, actionUrl } = req.body;

      if (!title || !body) {
        res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
        return;
      }

      // Fetch users to dispatch
      let users;
      if (target === 'all') {
        users = await prisma.user.findMany({ where: { whatsapp: { not: null } } });
      } else if (target === 'black') {
        users = await prisma.user.findMany({
          where: {
            OR: [{ plan: 'Ekoz Black' }, { plan: 'Founding Partner' }, { role: 'Black Member' }],
            whatsapp: { not: null },
          },
        });
      } else if (target === 'me') {
        users = await prisma.user.findMany({ where: { id: req.user.id } });
      } else {
        users = await prisma.user.findMany({ where: { id: target } });
      }

      const results = [];
      for (const user of users) {
        if (user.whatsapp) {
          const result = await WhatsAppService.sendNotification({
            toPhone: user.whatsapp,
            type: type || 'announcement',
            title,
            body,
            actionUrl,
          });
          results.push({ userId: user.id, phone: user.whatsapp, ...result });
        }
      }

      res.json({
        totalDispatched: results.length,
        results,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao disparar WhatsApp Push' });
    }
  }

  public static async testDispatch(req: Request, res: Response): Promise<void> {
    try {
      const { phone, title, body } = req.body;

      if (!phone) {
        res.status(400).json({ error: 'Número de telefone é obrigatório' });
        return;
      }

      const result = await WhatsAppService.sendNotification({
        toPhone: phone,
        type: 'announcement',
        title: title || 'Teste de Notificação Executiva Ekoz',
        body: body || 'Este é um teste de transmissão em tempo real do ecossistema Ekoz.',
        actionUrl: 'https://ekoz.jpstudio.tech',
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro no teste de disparo WhatsApp' });
    }
  }
}
