import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { asyncHandler } from '../http/asyncHandler.js';
import {
  claimEntityOwnership,
  createProfile,
  findByEmail,
  findByLoginIdentifier,
  normalizePhone,
  toPublicUser,
  updateProfile,
} from '../repositories/profiles.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signToken } from '../auth/jwt.js';
import { attachUser, requireAuth } from '../auth/middleware.js';
import { saveDataUrl, UnsupportedMediaTypeError, PayloadTooLargeError } from '../storage/files.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
  name: z.string().min(1),
  entityType: z.enum(['creator', 'community', 'business', 'media', 'strategic']).optional(),
  entityId: z.string().uuid().optional(),
  phone: z.string().min(8).optional(),
});

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' });
      return;
    }
    const { email, password, name, entityType, entityId, phone } = parsed.data;

    const existing = await findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email ini sudah terdaftar.' });
      return;
    }

    if (phone) {
      const dup = await query('SELECT 1 FROM profiles WHERE phone = $1 LIMIT 1', [normalizePhone(phone)]);
      if (dup.rowCount) {
        res.status(409).json({ error: 'Nomor WhatsApp ini sudah terdaftar.' });
        return;
      }
    }

    const row = await createProfile({
      email,
      passwordHash: await hashPassword(password),
      name,
      role: 'creator',
      entityType,
      entityId,
      phone,
      membershipTier: 'basic',
      isVerified: false,
    });

    if (entityId) {
      await claimEntityOwnership(row.id, entityId);
    }

    const user = toPublicUser({ ...row, entity_id: entityId ?? row.entity_id });
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
      res.status(400).json({ error: 'Email/nomor WhatsApp dan kata sandi wajib diisi.' });
      return;
    }

    const row = await findByLoginIdentifier(parsed.data.email);
    if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
      res.status(401).json({ error: 'Email/nomor WhatsApp atau kata sandi salah.' });
      return;
    }

    const user = toPublicUser(row);
    res.json({ user, token: signToken(user) });
  })
);

// /api/auth is mounted before the global attachUser (app.ts), so decode the JWT here.
authRouter.get('/me', attachUser, requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().optional(),
});

/**
 * PATCH /api/auth/me
 * Updates the caller's ACCOUNT profile (the one shown in the navbar and
 * dashboard). Unlike /entities/:id this works for every account, including
 * admins that own no entity. An uploaded photo arrives as a data: URL and is
 * persisted to storage; a `/uploads/...` path is accepted as-is so the
 * entity photo and the account photo can point at the same file.
 */
authRouter.patch(
  '/me',
  attachUser,
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Data profil tidak valid.' });
      return;
    }

    const updates: { name?: string; avatar?: string } = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;

    const avatar = parsed.data.avatar;
    if (avatar !== undefined) {
      if (avatar.startsWith('data:')) {
        try {
          updates.avatar = await saveDataUrl(avatar, 'avatars');
        } catch (err) {
          const message =
            err instanceof UnsupportedMediaTypeError || err instanceof PayloadTooLargeError
              ? err.message
              : 'Gagal menyimpan foto profil.';
          res.status(400).json({ error: message });
          return;
        }
      } else if (avatar === '' || avatar.startsWith('/uploads/') || /^https?:\/\//.test(avatar)) {
        updates.avatar = avatar;
      } else {
        res.status(400).json({ error: 'Format foto profil tidak valid.' });
        return;
      }
    }

    const row = await updateProfile(req.user!.id, updates);
    if (!row) {
      res.status(404).json({ error: 'Akun tidak ditemukan.' });
      return;
    }

    const user = toPublicUser(row);
    res.json({ user, token: signToken(user) });
  })
);
