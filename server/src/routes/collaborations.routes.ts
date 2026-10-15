import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import {
  listCollaborations,
  createCollaboration,
  updateCollaboration,
} from '../repositories/collaborations.js';
import type { CollaborationStatus, EntityType } from '../types.js';

export const collaborationRouter = Router();

function makeTrackingCode(): string {
  return `KP-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
}

collaborationRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user!.role === 'admin';
    const collabs = await listCollaborations({
      requesterProfileId: isAdmin ? undefined : req.user!.id,
      status: req.query.status as CollaborationStatus | undefined,
    });
    res.json({ collaborations: collabs });
  })
);

const createSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  targetId: z.string().min(1),
  targetName: z.string().min(1),
  targetType: z.enum(['creator', 'community', 'business', 'media', 'strategic']),
  budget: z.string().min(1),
  timeline: z.string().min(1),
  scope: z.string().min(1),
  deliverables: z.array(z.string()).min(1),
});

collaborationRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Brief tidak valid.' });
      return;
    }

    const collab = await createCollaboration({
      trackingCode: makeTrackingCode(),
      title: parsed.data.title,
      category: parsed.data.category,
      requesterProfileId: req.user!.id,
      requesterId: req.user!.entityId ?? req.user!.id,
      requesterName: req.user!.name,
      requesterType: (req.user!.entityType as EntityType) ?? 'creator',
      targetId: parsed.data.targetId,
      targetName: parsed.data.targetName,
      targetType: parsed.data.targetType,
      budget: parsed.data.budget,
      timeline: parsed.data.timeline,
      scope: parsed.data.scope,
      deliverables: parsed.data.deliverables,
    });
    res.status(201).json({ collaboration: collab });
  })
);

const updateSchema = z.object({
  status: z
    .enum(['submitted', 'in_review', 'matched', 'connected', 'in_progress', 'completed'])
    .optional(),
  adminNotes: z.string().optional(),
  matchedTalentName: z.string().optional(),
});

collaborationRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Perubahan status tidak valid.' });
      return;
    }
    const collab = await updateCollaboration(req.params.id, parsed.data);
    if (!collab) {
      res.status(404).json({ error: 'Kolaborasi tidak ditemukan.' });
      return;
    }
    res.json({ collaboration: collab });
  })
);
