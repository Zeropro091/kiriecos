import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import { listPayments, createPayment, verifyPayment } from '../repositories/payments.js';
import { saveDataUrl, UnsupportedMediaTypeError, PayloadTooLargeError } from '../storage/files.js';
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
  amount: z.number().int().nonnegative(),
  bankName: z.string().min(1),
  senderAccountName: z.string().min(1),
  entityId: z.string().uuid().optional(),
  receiptImageDataUrl: z.string().startsWith('data:'),
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

    let receiptImageUrl: string;
    try {
      receiptImageUrl = await saveDataUrl(parsed.data.receiptImageDataUrl, 'receipts');
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

    const payment = await createPayment({
      profileId: req.user!.id,
      userId: req.user!.id,
      userName: req.user!.name,
      entityId: parsed.data.entityId,
      tier: parsed.data.tier,
      amount: parsed.data.amount,
      bankName: parsed.data.bankName,
      senderAccountName: parsed.data.senderAccountName,
      receiptImageUrl,
    });
    res.status(201).json({ payment });
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
