import { Request, Response } from 'express';
import crypto from 'crypto';
import { CaktoService } from '../services/cakto.service.js';
import { sendServerError } from '../middleware/error.middleware.js';
import { config } from '../config/index.js';

const isValidCaktoSecret = (received?: string): boolean => {
  const expected = config.caktoWebhookSecret;
  if (!received || !expected) return false;

  const receivedBuf = Buffer.from(received);
  const expectedBuf = Buffer.from(expected);
  if (receivedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
};

export class CaktoController {
  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      if (!isValidCaktoSecret(payload?.secret)) {
        res.status(401).json({ error: 'Webhook não autorizado' });
        return;
      }

      const result = await CaktoService.handleWebhook(payload);

      res.status(200).json(result);
    } catch (error: any) {
      sendServerError(res, error, 'Erro interno no processamento de webhook');
    }
  }
}
