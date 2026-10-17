import { Router } from 'express';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth } from '../auth/middleware.js';
import { getOrCreateMemberCard } from '../repositories/memberCards.js';

export const cardRouter = Router();

/**
 * GET /api/me/card
 * Returns the caller's membership card, creating it on first access.
 */
cardRouter.get(
  '/card',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = req.user!;
    const card = await getOrCreateMemberCard(profile.id, profile.membershipTier);

    const issuedAt = new Date(card.issued_at);
    const expiresAt = card.expires_at
      ? new Date(card.expires_at)
      : new Date(issuedAt.getTime());
    if (!card.expires_at) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    res.json({
      card_number: card.card_number,
      tier: profile.membershipTier,
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: card.status,
    });
  })
);
