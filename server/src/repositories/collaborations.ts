import { query } from '../db/pool.js';
import type { CollaborationStatus, EntityType } from '../types.js';

export interface CollaborationDto {
  id: string;
  trackingCode: string;
  title: string;
  category: string;
  requesterId: string;
  requesterName: string;
  requesterType: EntityType;
  targetId: string;
  targetName: string;
  targetType: EntityType;
  budget: string;
  timeline: string;
  scope: string;
  deliverables: string[];
  status: CollaborationStatus;
  adminNotes?: string;
  matchedTalentName?: string;
  createdAt: string;
}

interface CollabRow {
  id: string;
  tracking_code: string;
  title: string;
  category: string;
  requester_id: string;
  requester_name: string;
  requester_type: EntityType;
  target_id: string;
  target_name: string;
  target_type: EntityType;
  budget: string;
  timeline: string;
  scope: string;
  deliverables: string[];
  status: CollaborationStatus;
  admin_notes: string | null;
  matched_talent_name: string | null;
  created_at: string;
}

function toDto(row: CollabRow): CollaborationDto {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    title: row.title,
    category: row.category,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterType: row.requester_type,
    targetId: row.target_id,
    targetName: row.target_name,
    targetType: row.target_type,
    budget: row.budget,
    timeline: row.timeline,
    scope: row.scope,
    deliverables: row.deliverables ?? [],
    status: row.status,
    adminNotes: row.admin_notes ?? undefined,
    matchedTalentName: row.matched_talent_name ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listCollaborations(opts: {
  requesterProfileId?: string;
  status?: CollaborationStatus;
}): Promise<CollaborationDto[]> {
  const where: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (opts.requesterProfileId) {
    where.push(`requester_profile_id = $${i}`);
    values.push(opts.requesterProfileId);
    i += 1;
  }
  if (opts.status) {
    where.push(`status = $${i}`);
    values.push(opts.status);
    i += 1;
  }
  const sql = `SELECT * FROM collaboration_requests ${
    where.length ? `WHERE ${where.join(' AND ')}` : ''
  } ORDER BY created_at DESC LIMIT 500`;
  const res = await query<CollabRow>(sql, values);
  return res.rows.map(toDto);
}

export async function createCollaboration(input: {
  trackingCode: string;
  title: string;
  category: string;
  requesterProfileId: string;
  requesterId: string;
  requesterName: string;
  requesterType: EntityType;
  targetId: string;
  targetName: string;
  targetType: EntityType;
  budget: string;
  timeline: string;
  scope: string;
  deliverables: string[];
}): Promise<CollaborationDto> {
  const res = await query<CollabRow>(
    `INSERT INTO collaboration_requests
      (tracking_code, title, category, requester_profile_id, requester_id, requester_name,
       requester_type, target_id, target_name, target_type, budget, timeline, scope, deliverables)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      input.trackingCode,
      input.title,
      input.category,
      input.requesterProfileId,
      input.requesterId,
      input.requesterName,
      input.requesterType,
      input.targetId,
      input.targetName,
      input.targetType,
      input.budget,
      input.timeline,
      input.scope,
      input.deliverables,
    ]
  );
  return toDto(res.rows[0]);
}

export async function updateCollaboration(
  id: string,
  updates: { status?: CollaborationStatus; adminNotes?: string; matchedTalentName?: string }
): Promise<CollaborationDto | undefined> {
  const res = await query<CollabRow>(
    `UPDATE collaboration_requests
     SET status = COALESCE($2, status),
         admin_notes = COALESCE($3, admin_notes),
         matched_talent_name = COALESCE($4, matched_talent_name)
     WHERE id = $1
     RETURNING *`,
    [id, updates.status ?? null, updates.adminNotes ?? null, updates.matchedTalentName ?? null]
  );
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}
