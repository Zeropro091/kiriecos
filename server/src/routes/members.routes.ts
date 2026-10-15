import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import { listMembers, createMember, updateMemberStatus, deleteMember } from '../repositories/members.js';

export const memberRouter = Router();

memberRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const members = await listMembers(req.query.entityId as string | undefined);
    res.json({ members });
  })
);

const createSchema = z.object({
  entityId: z.string().uuid().optional(),
  name: z.string().min(1),
  role: z.string().optional(),
  category: z.string().optional(),
  avatar: z.string().optional(),
  joinedDate: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
});

memberRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Data anggota tidak valid.' });
      return;
    }
    const member = await createMember(parsed.data);
    res.status(201).json({ member });
  })
);

memberRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = z.object({ status: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Status anggota tidak valid.' });
      return;
    }
    const member = await updateMemberStatus(req.params.id, parsed.data.status);
    if (!member) {
      res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      return;
    }
    res.json({ member });
  })
);

memberRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ok = await deleteMember(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      return;
    }
    res.status(204).end();
  })
);
