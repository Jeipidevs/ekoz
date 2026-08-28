import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../services/prisma.service.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticação não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, plan: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, plan: true, name: true },
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
      return;
    }

    next();
  };
};

export const requireBlackOrLeadership = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const allowedRoles = ['CEO', 'Mentor', 'Admin', 'Black Member'];
  const isBlackPlan = req.user.plan === 'Ekoz Black' || req.user.plan === 'Founding Partner';

  if (!allowedRoles.includes(req.user.role) && !isBlackPlan) {
    res.status(403).json({ error: 'Acesso exclusivo para membros Ekoz Black Mastermind ou Liderança' });
    return;
  }

  next();
};
