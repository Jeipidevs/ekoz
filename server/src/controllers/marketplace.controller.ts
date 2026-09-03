import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service.js';
import { sendServerError } from '../middleware/error.middleware.js';

export class MarketplaceController {
  public static async listCores(_req: Request, res: Response): Promise<void> {
    try {
      const cores = await prisma.thematicCore.findMany({
        include: {
          _count: {
            select: { businesses: true },
          },
        },
      });

      const formatted = cores.map((core) => ({
        id: core.id,
        name: core.name,
        slug: core.slug,
        icon: core.icon,
        description: core.description,
        count: core._count.businesses,
      }));

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar núcleos temáticos');
    }
  }

  public static async listBusinesses(req: Request, res: Response): Promise<void> {
    try {
      const { coreId, search } = req.query;

      const where: any = {};
      if (coreId && typeof coreId === 'string' && coreId !== 'all') {
        where.coreId = coreId;
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { headline: { contains: search } },
          { description: { contains: search } },
          { founderName: { contains: search } },
        ];
      }

      const businesses = await prisma.marketplaceBusiness.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      });

      const formatted = businesses.map((b) => ({
        id: b.id,
        name: b.name,
        coreId: b.coreId,
        headline: b.headline,
        description: b.description,
        founder: b.founderName,
        founderRole: b.founderRole,
        avatar: b.avatar,
        coverImage: b.coverImage || undefined,
        tags: JSON.parse(b.tags || '[]'),
        whatsapp: b.whatsapp,
        website: b.website || undefined,
        location: b.location,
        verified: b.verified,
        featured: b.featured,
      }));

      res.json(formatted);
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao listar empresas do Marketplace');
    }
  }

  public static async registerBusiness(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        coreId,
        headline,
        description,
        founder,
        founderRole,
        avatar,
        coverImage,
        tags,
        whatsapp,
        website,
        location,
      } = req.body;

      if (!name || !coreId || !headline || !founder || !whatsapp || !location) {
        res.status(400).json({ error: 'Preencha todos os campos obrigatórios da empresa' });
        return;
      }

      const business = await prisma.marketplaceBusiness.create({
        data: {
          name,
          coreId,
          headline,
          description: description || '',
          founderName: founder,
          founderRole: founderRole || 'Fundador(a)',
          avatar: avatar || '/default-avatar.svg',
          coverImage: coverImage || null,
          tags: JSON.stringify(tags || []),
          whatsapp,
          website: website || null,
          location,
          verified: true,
          featured: false,
          ownerId: req.user?.id || null,
        },
      });

      res.status(201).json({
        id: business.id,
        name: business.name,
        coreId: business.coreId,
        headline: business.headline,
        description: business.description,
        founder: business.founderName,
        founderRole: business.founderRole,
        avatar: business.avatar,
        coverImage: business.coverImage || undefined,
        tags: JSON.parse(business.tags || '[]'),
        whatsapp: business.whatsapp,
        website: business.website || undefined,
        location: business.location,
        verified: business.verified,
        featured: business.featured,
      });
    } catch (error: any) {
      sendServerError(res, error, 'Erro ao cadastrar negócio no Marketplace');
    }
  }
}
