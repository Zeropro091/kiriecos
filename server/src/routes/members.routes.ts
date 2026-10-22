import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth } from '../auth/middleware.js';
import {
  listMembers,
  createMember,
  updateMemberStatus,
  deleteMember,
  getMember,
  entityExists,
} from '../repositories/members.js';

export const memberRouter = Router();

/**
 * Controlled/private member database.
 * - admin: may list every member, or filter with ?entityId=
 * - everyone else: only the members of the entity they own. An account that
 *   is not linked to any entity gets an empty list (never the global one).
 */
memberRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin) {
      const ownEntityId = req.user!.entityId;
      if (!ownEntityId) {
        res.json({ members: [] });
        return;
      }
      const members = await listMembers(ownEntityId);
      res.json({ members });
      return;
    }
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

    const isAdmin = req.user!.role === 'admin';
    let entityId = parsed.data.entityId;

    if (!isAdmin) {
      // Non-admins can only write into their own entity; the client-supplied
      // entityId is ignored so members can never be planted into other entities.
      const ownEntityId = req.user!.entityId;
      if (!ownEntityId) {
        res.status(403).json({ error: 'Akun Anda belum tertaut ke entitas komunitas.' });
        return;
      }
      entityId = ownEntityId;
    }

    if (entityId && !(await entityExists(entityId))) {
      res.status(404).json({ error: 'Entitas tidak ditemukan.' });
      return;
    }

    const member = await createMember({ ...parsed.data, entityId });
    res.status(201).json({ member });
  })
);

const statusSchema = z.object({ status: z.enum(['active', 'pending', 'inactive']) });

memberRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Status anggota tidak valid.' });
      return;
    }
    const member = await getMember(req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      return;
    }
    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && member.entityId !== req.user!.entityId) {
      res.status(403).json({ error: 'Anda hanya dapat mengubah anggota komunitas milik sendiri.' });
      return;
    }
    const updated = await updateMemberStatus(req.params.id, parsed.data.status);
    res.json({ member: updated });
  })
);

memberRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = await getMember(req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Anggota tidak ditemukan.' });
      return;
    }
    const isAdmin = req.user!.role === 'admin';
    if (!isAdmin && member.entityId !== req.user!.entityId) {
      res.status(403).json({ error: 'Anda hanya dapat menghapus anggota komunitas milik sendiri.' });
      return;
    }
    await deleteMember(req.params.id);
    res.status(204).end();
  })
);
