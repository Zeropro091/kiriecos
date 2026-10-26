import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import {
  listPayments,
  createPayment,
  verifyPayment,
  mapPaymentTier,
  setMembershipTier,
} from '../repositories/payments.js';
import { evaluatePromo, redeemPromo } from '../repositories/promos.js';
import { saveDataUrl, UnsupportedMediaTypeError, PayloadTooLargeError } from '../storage/files.js';
import { withTransaction } from '../db/pool.js';
import { parseTierParam, priceOf } from '../pricing.js';
import type { PaymentStatus } from '../types.js';

export const paymentRouter = Router();

paymentRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payments = await listPayments(req.query.status as PaymentStatus | undefined);
    res.json({ payments });
  })
);

const createSchema = z.object({
  tier: z.string().min(1),
  /** Diabaikan bila `tier` bisa dipetakan — server menghitung ulang dari harga resmi. */
  amount: z.number().int().nonnegative().optional(),
  promoCode: z.string().max(64).optional(),
  bankName: z.string().min(1).optional(),
  senderAccountName: z.string().min(1).optional(),
  entityId: z.string().uuid().optional(),
  receiptImageDataUrl: z.string().startsWith('data:').optional(),
});

paymentRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Data pembayaran tidak valid.' });
      return;
    }
    const d = parsed.data;
    const user = req.user!;

    const { track, tier } = parseTierParam(d.tier);
    // Harga resmi hanya bisa dihitung kalau track + tier dikenali. Kalau tidak
    // (payload lama), pakai nominal klien seperti sebelumnya.
    const priced = Boolean(track && tier);
    const amountBefore = priced ? priceOf(track!, tier!) : (d.amount ?? 0);

    // ---- kode promo -------------------------------------------------------
    let promo: Awaited<ReturnType<typeof evaluatePromo>> | null = null;
    if (d.promoCode && priced) {
      promo = await evaluatePromo({ code: d.promoCode, track: track!, tier: tier!, profileId: user.id });
      if (!promo.valid) {
        res.status(422).json({ error: promo.reason ?? 'Kode promo tidak valid.', promo });
        return;
      }
    }

    const discountAmount = promo?.valid ? promo.discountAmount : 0;
    const amountAfter = promo?.valid ? promo.amountAfter : amountBefore;
    const isFree = priced && amountAfter === 0;

    // ---- jalur gratis: tanpa bukti transfer, langsung aktif -----------------
    if (isFree && promo?.valid) {
      const result = await withTransaction(async (client) => {
        const payment = await createPayment(
          {
            profileId: user.id,
            userId: user.id,
            userName: user.name,
            entityId: d.entityId,
            tier: `${track}:${tier}`,
            amount: 0,
            bankName: d.bankName ?? 'PROMO',
            senderAccountName: d.senderAccountName ?? user.name,
            receiptImageUrl: '',
            promoCode: promo!.code,
            discountAmount,
            amountBeforeDiscount: amountBefore,
            status: 'verified',
          },
          client as never
        );
        const redeemed = await redeemPromo(client, {
          code: promo!.code!,
          profileId: user.id,
          track: track!,
          tier: tier!,
          amountBefore,
          amountAfter,
          paymentId: payment.id,
        });
        if (!redeemed) throw new Error('Kode promo baru saja habis dipakai. Coba kode lain.');
        const mapped = mapPaymentTier(payment.tier);
        if (mapped) await setMembershipTier(client, user.id, mapped);
        return payment;
      });

      res.status(201).json({ payment: result, activated: true, promo, discountAmount });
      return;
    }

    // ---- jalur normal: wajib bukti transfer -------------------------------
    if (!d.receiptImageDataUrl) {
      res.status(400).json({ error: 'Harap unggah bukti transfer (resi / screenshot) terlebih dahulu.' });
      return;
    }
    if (!d.bankName || !d.senderAccountName) {
      res.status(400).json({ error: 'Bank pengirim dan nama pemilik rekening wajib diisi.' });
      return;
    }

    let receiptImageUrl: string;
    try {
      receiptImageUrl = await saveDataUrl(d.receiptImageDataUrl, 'receipts');
    } catch (err) {
      if (err instanceof UnsupportedMediaTypeError) {
        res.status(415).json({ error: err.message });
        return;
      }
      if (err instanceof PayloadTooLargeError) {
        res.status(413).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err instanceof Error ? err.message : 'Gagal menyimpan bukti transfer.' });
      return;
    }

    const payment = await withTransaction(async (client) => {
      const created = await createPayment(
        {
          profileId: user.id,
          userId: user.id,
          userName: user.name,
          entityId: d.entityId,
          tier: priced ? `${track}:${tier}` : d.tier,
          amount: amountAfter,
          bankName: d.bankName!,
          senderAccountName: d.senderAccountName!,
          receiptImageUrl,
          promoCode: promo?.valid ? promo.code : null,
          discountAmount,
          amountBeforeDiscount: promo?.valid ? amountBefore : null,
        },
        client as never
      );

      if (promo?.valid && priced) {
        const redeemed = await redeemPromo(client, {
          code: promo.code!,
          profileId: user.id,
          track: track!,
          tier: tier!,
          amountBefore,
          amountAfter,
          paymentId: created.id,
        });
        if (!redeemed) throw new Error('Kode promo baru saja habis dipakai. Silakan kirim ulang tanpa kode.');
      }
      return created;
    });

    res.status(201).json({ payment, activated: false, promo, discountAmount });
  })
);

const verifySchema = z.object({
  action: z.enum(['verify', 'reject']),
  adminNotes: z.string().optional(),
});

paymentRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Aksi verifikasi tidak valid.' });
      return;
    }
    const payment = await verifyPayment(req.params.id, parsed.data.action, parsed.data.adminNotes);
    if (!payment) {
      res.status(404).json({ error: 'Pembayaran tidak ditemukan.' });
      return;
    }
    res.json({ payment });
  })
);
