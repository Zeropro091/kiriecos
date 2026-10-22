import { query, withTransaction } from '../db/pool.js';
import type { BroadcastScope } from '../types.js';

export interface BroadcastDto {
  id: string;
  scope: BroadcastScope;
  region?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  senderBadge?: string;
  content: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  likesCount: number;
}

interface BroadcastRow {
  id: string;
  scope: BroadcastScope;
  region: string | null;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  sender_badge: string | null;
  content: string;
  likes_count: number;
  created_at: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDto(row: BroadcastRow): BroadcastDto {
  const d = new Date(row.created_at);
  return {
    id: row.id,
    scope: row.scope,
    region: row.region ?? undefined,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    senderAvatar: row.sender_avatar,
    senderBadge: row.sender_badge ?? undefined,
    content: row.content,
    timestamp: d.toISOString(),
    timeFormatted: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    dateFormatted: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    likesCount: row.likes_count,
  };
}

export async function listBroadcasts(scope?: BroadcastScope, region?: string): Promise<BroadcastDto[]> {
  const where: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (scope) {
    where.push(`scope = $${i}`);
    values.push(scope);
    i += 1;
  }
  if (region) {
    where.push(`region = $${i}`);
    values.push(region);
    i += 1;
  }
  const sql = `SELECT * FROM broadcast_messages ${
    where.length ? `WHERE ${where.join(' AND ')}` : ''
  } ORDER BY created_at DESC LIMIT 300`;
  const res = await query<BroadcastRow>(sql, values);
  return res.rows.map(toDto);
}

export async function createBroadcast(input: {
  scope: BroadcastScope;
  region?: string;
  senderProfileId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  senderBadge?: string;
  content: string;
}): Promise<BroadcastDto> {
  const res = await query<BroadcastRow>(
    `INSERT INTO broadcast_messages
      (scope, region, sender_profile_id, sender_id, sender_name, sender_role, sender_avatar, sender_badge, content)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      input.scope,
      input.region ?? null,
      input.senderProfileId,
      input.senderId,
      input.senderName,
      input.senderRole,
      input.senderAvatar,
      input.senderBadge ?? null,
      input.content,
    ]
  );
  return toDto(res.rows[0]);
}

/**
 * One like per profile per broadcast (broadcast_likes ledger). Re-liking is a
 * no-op, so the count can no longer be inflated by repeat calls.
 */
export async function likeBroadcast(
  id: string,
  profileId: string
): Promise<BroadcastDto | undefined> {
  return withTransaction(async (client) => {
    const msg = await client.query<BroadcastRow>(
      'SELECT * FROM broadcast_messages WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!msg.rows[0]) return undefined;

    const inserted = await client.query(
      `INSERT INTO broadcast_likes (broadcast_id, profile_id)
       VALUES ($1, $2)
       ON CONFLICT (broadcast_id, profile_id) DO NOTHING`,
      [id, profileId]
    );

    if ((inserted.rowCount ?? 0) > 0) {
      const updated = await client.query<BroadcastRow>(
        'UPDATE broadcast_messages SET likes_count = likes_count + 1 WHERE id = $1 RETURNING *',
        [id]
      );
      return toDto(updated.rows[0]);
    }
    return toDto(msg.rows[0]);
  });
}
