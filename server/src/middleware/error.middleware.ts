import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Envia um erro 500 ao cliente. Em produção, oculta a mensagem interna
 * (ex.: detalhes de erro do Prisma) e usa o fallback genérico; em dev,
 * expõe error.message para facilitar o debug.
 */
export const sendServerError = (res: Response, error: any, fallback: string): void => {
  console.error('💥 Server Error:', error);
  const message = !isProduction && error?.message ? error.message : fallback;
  res.status(500).json({ error: message });
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('💥 Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = statusCode !== 500 || !isProduction
    ? err.message || 'Erro interno no servidor Ekoz'
    : 'Erro interno no servidor Ekoz';

  res.status(statusCode).json({
    error: message,
    ...(!isProduction && { stack: err.stack }),
  });
};
