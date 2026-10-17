import { query } from '../db/pool.js';
import type { ChatMessageRow, ChatThreadSummaryRow } from '../types.js';

export interface CreateChatMessageInput {
  threadProfileId: string;
  senderRole: 'member' | 'admin';
  senderProfileId: string;
  body: string;
}

export async function createChatMessage(input: CreateChatMessageInput): Promise<ChatMessageRow> {
  const res = await query<ChatMessageRow>(
    `INSERT INTO chat_messages (thread_profile_id, sender_role, sender_profile_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.threadProfileId, input.senderRole, input.senderProfileId, input.body]
  );
  return res.rows[0];
}

export async function listChatMessagesByThread(threadProfileId: string): Promise<ChatMessageRow[]> {
  const res = await query<ChatMessageRow>(
    'SELECT * FROM chat_messages WHERE thread_profile_id = $1 ORDER BY created_at ASC, id ASC',
    [threadProfileId]
  );
  return res.rows;
}

/** Mark admin->member messages in a thread as read (read_at = now()). */
export async function markThreadMessagesRead(threadProfileId: string): Promise<void> {
  await query(
    `UPDATE chat_messages
     SET read_at = now()
     WHERE thread_profile_id = $1
       AND sender_role = 'admin'
       AND read_at IS NULL`,
    [threadProfileId]
  );
}

export interface ChatThreadRow extends ChatThreadSummaryRow {
  last_message_body: string | null;
  last_message_at: string | null;
  last_message_role: string | null;
}

/** Distinct threads with last message info and unread (admin->member) count. */
export async function listChatThreads(): Promise<ChatThreadRow[]> {
  const res = await query<ChatThreadRow>(
    `SELECT
       p.id AS profile_id,
       p.name AS profile_name,
       p.email AS profile_email,
       last_msg.body AS last_message_body,
       last_msg.created_at AS last_message_at,
       last_msg.sender_role AS last_message_role,
       COALESCE(unread.unread_count, 0) AS unread_count
     FROM (
       SELECT DISTINCT thread_profile_id FROM chat_messages
     ) t
     JOIN profiles p ON p.id = t.thread_profile_id
     LEFT JOIN LATERAL (
       SELECT body, created_at, sender_role
       FROM chat_messages m
       WHERE m.thread_profile_id = t.thread_profile_id
       ORDER BY created_at DESC, id DESC
       LIMIT 1
     ) last_msg ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS unread_count
       FROM chat_messages m
       WHERE m.thread_profile_id = t.thread_profile_id
         AND m.sender_role = 'admin'
         AND m.read_at IS NULL
     ) unread ON TRUE
     ORDER BY last_message_at DESC NULLS LAST, p.id`
  );
  return res.rows;
}

export interface ProfileExistsResult {
  exists: boolean;
}

export async function profileExists(profileId: string): Promise<boolean> {
  const res = await query<ProfileExistsResult>(
    'SELECT EXISTS(SELECT 1 FROM profiles WHERE id = $1) AS exists',
    [profileId]
  );
  return Boolean(res.rows[0]?.exists);
}
