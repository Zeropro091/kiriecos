import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import {
  createLandingOrder,
  listLandingOrdersByProfile,
  listLandingOrders,
  updateLandingOrder,
} from '../repositories/landingOrders.js';
import type { LandingOrderStatus } from '../types.js';

export const landingOrderRouter = Router();

const createSchema = z.object({
  template_id: z.enum(['minimal-01', 'minimal-02', 'minimal-03']),
  custom_notes: z.string().max(2000).optional(),
});

landingOrderRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message ?? 'Data pesanan landing page tidak valid.',
      });
      return;
    }
    const order = await createLandingOrder({
      profileId: req.user!.id,
      templateId: parsed.data.template_id,
      customNotes: parsed.data.custom_notes ?? '',
    });
    res.status(201).json({ order });
  })
);

landingOrderRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await listLandingOrdersByProfile(req.user!.id);
    res.json({ orders });
  })
);

const statusValues = ['pending', 'in_review', 'in_progress', 'done', 'rejected'] as const;

landingOrderRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    let status: LandingOrderStatus | undefined;
    if (statusParam !== undefined) {
      const parsedStatus = z.enum(statusValues).safeParse(statusParam);
      if (!parsedStatus.success) {
        res.status(400).json({ error: 'Status tidak valid.' });
        return;
      }
      status = parsedStatus.data;
    }
    const orders = await listLandingOrders(status);
    res.json({ orders });
  })
);

const patchSchema = z
  .object({
    status: z.enum(statusValues).optional(),
    admin_note: z.string().max(4000).optional(),
  })
  .refine((data) => data.status !== undefined || data.admin_note !== undefined, {
    message: 'Setidaknya satu field (status atau admin_note) harus dikirim.',
  });

landingOrderRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'ID pesanan tidak valid.' });
      return;
    }
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message ?? 'Data pembaruan tidak valid.',
      });
      return;
    }
    const order = await updateLandingOrder({
      id,
      status: parsed.data.status,
      adminNote: parsed.data.admin_note,
    });
    if (!order) {
      res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
      return;
    }
    res.json({ order });
  })
);
