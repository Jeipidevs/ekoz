import { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { config } from '../config/index.js';
import { sendServerError } from '../middleware/error.middleware.js';

// Sala única compartilhada por todos os membros — mesma proposta da UI
// original ("Mentoria Executiva & Alinhamento Estratégico"), agora real.
const MAIN_ROOM = 'ekoz-sala-principal';

export class VideoCallController {
  public static async getToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      if (!config.livekitApiKey || !config.livekitApiSecret || !config.livekitWsUrl) {
        res.status(503).json({ error: 'Videochamada não configurada no servidor' });
        return;
      }

      const at = new AccessToken(config.livekitApiKey, config.livekitApiSecret, {
        identity: req.user.id,
        name: req.user.name,
      });
      at.addGrant({ roomJoin: true, room: MAIN_ROOM, canPublish: true, canSubscribe: true });

      const token = await at.toJwt();

      res.json({ token, url: config.livekitWsUrl, room: MAIN_ROOM });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao gerar token de videochamada');
    }
  }
}
