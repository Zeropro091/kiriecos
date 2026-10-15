import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAdmin } from '../auth/middleware.js';
import {
  listRegistrations,
  createRegistrationWithEntity,
  reviewRegistration,
} from '../repositories/registrations.js';
import type { ApplicationStatus } from '../types.js';

export const registrationRouter = Router();

registrationRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const registrations = await listRegistrations(req.query.status as ApplicationStatus | undefined);
    res.json({ registrations });
  })
);

const createSchema = z.object({
  type: z.enum(['creator', 'community', 'business', 'media', 'strategic']),
  name: z.string().min(1),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  category: z.string().min(1),
  socialLink: z.string().min(1),
  details: z.string().min(1),
});

registrationRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Formulir tidak valid.' });
      return;
    }
    const registration = await createRegistrationWithEntity(parsed.data);
    res.status(201).json({ registration });
  })
);

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

registrationRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Keputusan moderasi tidak valid.' });
      return;
    }
    const registration = await reviewRegistration(
      req.params.id,
      parsed.data.status,
      parsed.data.rejectionReason
    );
    if (!registration) {
      res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
      return;
    }
    res.json({ registration });
  })
);
