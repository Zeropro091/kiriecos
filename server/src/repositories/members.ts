import { query } from '../db/pool.js';

export interface MemberDto {
  id: string;
  name: string;
  role: string;
  category: string;
  avatar: string;
  joinedDate: string;
  email: string;
  instagram: string;
  status: string;
  entityId?: string;
}

interface MemberRow {
  id: string;
  entity_id: string | null;
  name: string;
  role: string;
  category: string;
  avatar: string;
  joined_date: string;
  email: string;
  instagram: string;
  status: string;
}

function toDto(row: MemberRow): MemberDto {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    category: row.category,
    avatar: row.avatar,
    joinedDate: row.joined_date,
    email: row.email,
    instagram: row.instagram,
    status: row.status,
    entityId: row.entity_id ?? undefined,
  };
}

export async function listMembers(entityId?: string): Promise<MemberDto[]> {
  const res = entityId
    ? await query<MemberRow>(
        'SELECT * FROM community_members WHERE entity_id = $1 ORDER BY created_at DESC LIMIT 1000',
        [entityId]
      )
    : await query<MemberRow>('SELECT * FROM community_members ORDER BY created_at DESC LIMIT 1000');
  return res.rows.map(toDto);
}

export async function createMember(input: {
  entityId?: string;
  name: string;
  role?: string;
  category?: string;
  avatar?: string;
  joinedDate?: string;
  email?: string;
  instagram?: string;
  status?: string;
}): Promise<MemberDto> {
  const res = await query<MemberRow>(
    `INSERT INTO community_members
      (entity_id, name, role, category, avatar, joined_date, email, instagram, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      input.entityId ?? null,
      input.name,
      input.role ?? 'Contributor',
      input.category ?? '',
      input.avatar ?? '',
      input.joinedDate ?? '',
      input.email ?? '',
      input.instagram ?? '',
      input.status ?? 'active',
    ]
  );
  return toDto(res.rows[0]);
}

export async function updateMemberStatus(id: string, status: string): Promise<MemberDto | undefined> {
  const res = await query<MemberRow>(
    'UPDATE community_members SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}

export async function deleteMember(id: string): Promise<boolean> {
  const res = await query('DELETE FROM community_members WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}
