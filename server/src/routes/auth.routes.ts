import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { createProfile, findByEmail, toPublicUser } from '../repositories/profiles.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
  name: z.string().min(1),
  entityType: z.enum(['creator', 'community', 'business', 'media', 'strategic']).optional(),
});

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' });
      return;
    }
    const { email, password, name, entityType } = parsed.data;

    const existing = await findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email ini sudah terdaftar.' });
      return;
    }

    const row = await createProfile({
      email,
      passwordHash: await hashPassword(password),
      name,
      role: 'creator',
      entityType,
      membershipTier: 'free',
      isVerified: false,
    });

    const user = toPublicUser(row);
    res.status(201).json({ user, token: signToken(user) });
  })
);

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    const row = await findByEmail(parsed.data.email);
    if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
      res.status(401).json({ error: 'Email atau kata sandi salah.' });
      return;
    }

    const user = toPublicUser(row);
    res.json({ user, token: signToken(user) });
  })
);

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
