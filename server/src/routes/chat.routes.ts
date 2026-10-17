import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';
import {
  createChatMessage,
  listChatMessagesByThread,
  markThreadMessagesRead,
  listChatThreads,
  profileExists,
} from '../repositories/chatMessages.js';

export const chatRouter = Router();

/**
 * GET /api/chat/messages (member view)
 * Returns the caller's own thread, oldest -> newest, and marks
 * admin->member messages as read.
 */
chatRouter.get(
  '/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profileId = req.user!.id;
    const messages = await listChatMessagesByThread(profileId);
    await markThreadMessagesRead(profileId);
    res.json({ messages });
  })
);

const postSchema = z.object({
  body: z.string().min(1).max(4000),
  // Only used by admins replying into another member's thread.
  thread_profile_id: z.string().uuid().optional(),
});

chatRouter.post(
  '/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message ?? 'Pesan tidak valid.',
      });
      return;
    }

    const isAdmin = req.user!.role === 'admin';
    let threadProfileId: string;
    let senderRole: 'member' | 'admin';

    if (isAdmin && parsed.data.thread_profile_id) {
      threadProfileId = parsed.data.thread_profile_id;
      senderRole = 'admin';
      if (!(await profileExists(threadProfileId))) {
        res.status(404).json({ error: 'Profil tujuan tidak ditemukan.' });
        return;
      }
    } else {
      threadProfileId = req.user!.id;
      senderRole = 'member';
    }

    const message = await createChatMessage({
      threadProfileId,
      senderRole,
      senderProfileId: req.user!.id,
      body: parsed.data.body,
    });
    res.status(201).json({ message });
  })
);

/** GET /api/chat/threads (admin): all threads with last message + unread count. */
chatRouter.get(
  '/threads',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const threads = await listChatThreads();
    res.json({ threads });
  })
);

/** GET /api/chat/threads/:profileId (admin): one thread's messages, oldest -> newest. */
chatRouter.get(
  '/threads/:profileId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const profileId = req.params.profileId;
    if (!z.string().uuid().safeParse(profileId).success) {
      res.status(400).json({ error: 'ID profil tidak valid.' });
      return;
    }
    if (!(await profileExists(profileId))) {
      res.status(404).json({ error: 'Profil tidak ditemukan.' });
      return;
    }
    const messages = await listChatMessagesByThread(profileId);
    res.json({ messages });
  })
);
