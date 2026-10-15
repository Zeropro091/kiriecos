import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth } from '../auth/middleware.js';
import { listBroadcasts, createBroadcast, likeBroadcast } from '../repositories/broadcasts.js';
import type { BroadcastScope, PublicUser } from '../types.js';

export const broadcastRouter = Router();

const BROADCAST_EMAILS = new Set(['drini562@gmail.com']);

function canBroadcast(user: PublicUser): boolean {
  const email = user.email.toLowerCase();
  return (
    user.role === 'admin' ||
    user.role === 'community_lead' ||
    BROADCAST_EMAILS.has(email) ||
    user.membershipTier === 'System Master' ||
    user.membershipTier === 'Community Verified'
  );
}

broadcastRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const messages = await listBroadcasts(
      req.query.scope as BroadcastScope | undefined,
      req.query.region as string | undefined
    );
    res.json({ broadcasts: messages });
  })
);

const createSchema = z.object({
  scope: z.enum(['indonesia', 'regional']),
  region: z.string().optional(),
  content: z.string().min(1).max(2000),
});

broadcastRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!canBroadcast(req.user!)) {
      res.status(403).json({ error: 'Anda tidak memiliki hak untuk mengirim siaran komunitas.' });
      return;
    }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Isi siaran tidak valid.' });
      return;
    }
    const message = await createBroadcast({
      scope: parsed.data.scope,
      region: parsed.data.scope === 'regional' ? parsed.data.region ?? 'Jawa Barat' : undefined,
      senderProfileId: req.user!.id,
      senderId: req.user!.id,
      senderName: req.user!.name,
      senderRole: req.user!.role,
      senderAvatar: req.user!.avatar,
      senderBadge: req.user!.membershipTier,
      content: parsed.data.content.trim(),
    });
    res.status(201).json({ broadcast: message });
  })
);

broadcastRouter.post(
  '/:id/like',
  asyncHandler(async (req, res) => {
    const message = await likeBroadcast(req.params.id);
    if (!message) {
      res.status(404).json({ error: 'Siaran tidak ditemukan.' });
      return;
    }
    res.json({ broadcast: message });
  })
);
