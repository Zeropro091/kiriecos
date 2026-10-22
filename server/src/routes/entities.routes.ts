import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { listEntities, getEntity, setVerification, updateEntity } from '../repositories/entities.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import type { EntityType, VerificationStatus } from '../types.js';

export const entityRouter = Router();

entityRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const isAdminRequest = req.user?.role === 'admin';
    const requestedStatus = req.query.status as VerificationStatus | undefined;
    const status = isAdminRequest ? requestedStatus : 'approved';

    const entities = await listEntities({
      status,
      type: req.query.type as EntityType | undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ entities });
  })
);

entityRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const entity = await getEntity(req.params.id);
    if (!entity) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }
    const isOwn =
      req.user?.entityId === entity.id || entity.ownerProfileId === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (entity.verificationStatus !== 'approved' && !isOwn && !isAdmin) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }
    res.json({ entity });
  })
);

const serviceSchema = z.object({
  name: z.string().min(1),
  price: z.string().optional(),
  description: z.string().optional(),
  deliverables: z.array(z.string()).max(50).optional(),
});

const portfolioItemSchema = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  caption: z.string().optional(),
  views: z.string().optional(),
  likes: z.string().optional(),
  link: z.string().optional(),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  handle: z.string().min(1).optional(),
  category: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  avatar: z.string().optional(),
  cover_image: z.string().optional(),
  services: z.array(serviceSchema).max(100).optional(),
  portfolio: z.array(portfolioItemSchema).max(200).optional(),
});

entityRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Data profil tidak valid.' });
      return;
    }
    const entity = await getEntity(req.params.id);
    if (!entity) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }
    const isOwn =
      req.user?.entityId === entity.id || entity.ownerProfileId === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwn && !isAdmin) {
      res.status(403).json({ error: 'Anda hanya dapat mengubah profil milik sendiri.' });
      return;
    }
    const updated = await updateEntity(req.params.id, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }
    res.json({ entity: updated });
  })
);

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended', 'pending_review']),
  rejectionReason: z.string().optional(),
});

entityRouter.post(
  '/:id/verify',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Status verifikasi tidak valid.' });
      return;
    }
    const entity = await setVerification(req.params.id, parsed.data.status, parsed.data.rejectionReason);
    if (!entity) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }
    res.json({ entity });
  })
);
