import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import { priceOf, parseTierParam, type TierKey, type Track } from '../pricing.js';
import {
  createPromoCode,
  deletePromoCode,
  evaluatePromo,
  listPromoCodes,
  listRedemptions,
  updatePromoCode,
} from '../repositories/promos.js';

export const promoRouter = Router();

const validateSchema = z.object({
  code: z.string().min(1, 'Masukkan kode promo.').max(64),
  // 'creator:exclusive' (format checkout) atau 'exclusive'
  tier: z.string().min(1),
  track: z.enum(['creator', 'business']).optional(),
});

/**
 * POST /api/promos/validate
 * Member mengecek kode sebelum bayar. Tidak mengubah kuota — pemakaian baru
 * dicatat saat pembayaran dikirim / aktivasi gratis berhasil.
 */
promoRouter.post(
  '/validate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ valid: false, reason: parsed.error.issues[0]?.message ?? 'Data tidak valid.' });
      return;
    }

    const fromTier = parseTierParam(parsed.data.tier);
    const track: Track = parsed.data.track ?? fromTier.track ?? 'creator';
    const tier: TierKey = fromTier.tier ?? 'exclusive';

    const evaluation = await evaluatePromo({
      code: parsed.data.code,
      track,
      tier,
      profileId: req.user!.id,
    });

    res
      .status(evaluation.valid ? 200 : 422)
      .json({ ...evaluation, error: evaluation.reason, track, tier });
  })
);

/** POST /api/promos/preview — tanpa login, hanya untuk menampilkan harga coret. */
promoRouter.post(
  '/preview',
  asyncHandler(async (req, res) => {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ valid: false, reason: 'Data tidak valid.' });
      return;
    }
    const fromTier = parseTierParam(parsed.data.tier);
    const track: Track = parsed.data.track ?? fromTier.track ?? 'creator';
    const tier: TierKey = fromTier.tier ?? 'exclusive';

    const evaluation = await evaluatePromo({
      code: parsed.data.code,
      track,
      tier,
      // preview tidak mengecek kuota per member — pakai id nol yang tidak pernah cocok
      profileId: '00000000-0000-0000-0000-000000000000',
    });
    res.status(evaluation.valid ? 200 : 422).json({ ...evaluation, track, tier });
  })
);

// ------------------------------------------------------------------ admin

const createSchema = z.object({
  code: z
    .string()
    .min(3, 'Kode minimal 3 karakter.')
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/, 'Kode hanya boleh huruf, angka, titik, garis bawah, atau strip.'),
  description: z.string().max(280).optional(),
  discountType: z.enum(['percent', 'fixed', 'free']),
  discountValue: z.number().int().min(0).max(100_000_000).optional(),
  track: z.enum(['any', 'creator', 'business']).optional(),
  tierScope: z.string().max(120).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  maxUsesPerUser: z.number().int().min(1).max(100).optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

promoRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json({ promos: await listPromoCodes() });
  })
);

promoRouter.get(
  '/redemptions',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ redemptions: await listRedemptions(req.query.codeId as string | undefined) });
  })
);

promoRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Data promo tidak valid.' });
      return;
    }
    const d = parsed.data;
    if (d.discountType === 'percent' && (d.discountValue ?? 0) < 1) {
      res.status(400).json({ error: 'Potongan persen minimal 1%.' });
      return;
    }
    if (d.discountType === 'percent' && (d.discountValue ?? 0) > 100) {
      res.status(400).json({ error: 'Potongan persen maksimal 100%.' });
      return;
    }
    if (d.discountType === 'fixed' && (d.discountValue ?? 0) < 1) {
      res.status(400).json({ error: 'Potongan nominal minimal Rp 1.' });
      return;
    }
    try {
      const promo = await createPromoCode({
        ...d,
        discountValue: d.discountValue ?? 0,
        createdBy: req.user!.id,
      });
      res.status(201).json({ promo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('idx_promo_codes_code_upper') || msg.includes('duplicate key')) {
        res.status(409).json({ error: 'Kode promo itu sudah ada. Pakai kode lain.' });
        return;
      }
      throw err;
    }
  })
);

const patchSchema = createSchema.partial();

promoRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Data promo tidak valid.' });
      return;
    }
    const promo = await updatePromoCode(req.params.id, parsed.data);
    if (!promo) {
      res.status(404).json({ error: 'Kode promo tidak ditemukan.' });
      return;
    }
    res.json({ promo });
  })
);

promoRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ok = await deletePromoCode(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Kode promo tidak ditemukan.' });
      return;
    }
    res.status(204).end();
  })
);

/** GET /api/promos/price/:track/:tier — harga resmi, dipakai UI untuk validasi. */
promoRouter.get(
  '/price/:track/:tier',
  asyncHandler(async (req, res) => {
    const track = req.params.track as Track;
    const tier = req.params.tier as TierKey;
    if (!['creator', 'business'].includes(track) || !['basic', 'exclusive', 'platinum'].includes(tier)) {
      res.status(400).json({ error: 'Track atau tier tidak dikenal.' });
      return;
    }
    res.json({ track, tier, price: priceOf(track, tier) });
  })
);
