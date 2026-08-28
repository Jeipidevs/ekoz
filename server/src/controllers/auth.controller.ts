import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.service.js';
import { config } from '../config/index.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, company, headline, role, plan, whatsapp, instagram, linkedin } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(400).json({ error: 'E-mail já cadastrado no ecossistema Ekoz' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          company: company || '',
          headline: headline || `${role || 'Membro'} na ${company || 'Ekoz'}`,
          role: role || 'Member',
          plan: plan || 'Membro Ekoz',
          whatsapp,
          instagram,
          linkedin,
          verified: true,
          skills: JSON.stringify(['Liderança', 'Gestão', 'Estratégia']),
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwtRefreshSecret,
        { expiresIn: '30d' }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          headline: user.headline,
          company: user.company,
          avatar: user.avatar,
          bio: user.bio,
          verified: user.verified,
          skills: JSON.parse(user.skills || '[]'),
          location: user.location,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          linkedin: user.linkedin,
          plan: user.plan,
        },
        token,
        refreshToken,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao registrar membro');
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwtRefreshSecret,
        { expiresIn: '30d' }
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          headline: user.headline,
          company: user.company,
          avatar: user.avatar,
          bio: user.bio,
          verified: user.verified,
          skills: JSON.parse(user.skills || '[]'),
          location: user.location,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          linkedin: user.linkedin,
          plan: user.plan,
        },
        token,
        refreshToken,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao realizar login');
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          headline: user.headline,
          company: user.company,
          avatar: user.avatar,
          bio: user.bio,
          verified: user.verified,
          skills: JSON.parse(user.skills || '[]'),
          location: user.location,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          linkedin: user.linkedin,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao buscar perfil');
    }
  }

  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const { name, headline, company, avatar, bio, location, whatsapp, instagram, linkedin, skills } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(headline !== undefined && { headline }),
          ...(company !== undefined && { company }),
          ...(avatar && { avatar }),
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(whatsapp !== undefined && { whatsapp }),
          ...(instagram !== undefined && { instagram }),
          ...(linkedin !== undefined && { linkedin }),
          ...(skills && { skills: JSON.stringify(skills) }),
        },
      });

      res.json({
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          headline: updated.headline,
          company: updated.company,
          avatar: updated.avatar,
          bio: updated.bio,
          verified: updated.verified,
          skills: JSON.parse(updated.skills || '[]'),
          location: updated.location,
          whatsapp: updated.whatsapp,
          instagram: updated.instagram,
          linkedin: updated.linkedin,
          plan: updated.plan,
        },
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao atualizar perfil');
    }
  }
}
