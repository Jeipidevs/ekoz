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
  public static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { plan, paymentMethod, installments } = req.body;

      if (!plan || !paymentMethod) {
        res.status(400).json({ error: 'Plano e forma de pagamento são obrigatórios' });
        return;
      }

      const order = await CaktoService.createOrder({
        userId: req.user.id,
        plan,
        paymentMethod,
        installments,
      });

      res.status(201).json(order);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao processar pedido Cakto');
    }
  }

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
