import { query } from '../db/pool.js';
import type { EntityType, ProfileRow, PublicUser, UserRole } from '../types.js';

export function toPublicUser(row: ProfileRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    entityType: row.entity_type ?? undefined,
    entityId: row.entity_id ?? undefined,
    avatar: row.avatar,
    membershipTier: row.membership_tier,
    isVerified: row.is_verified,
  };
}

export async function findByEmail(email: string): Promise<ProfileRow | undefined> {
  const res = await query<ProfileRow>(
    'SELECT * FROM profiles WHERE lower(email) = lower($1) LIMIT 1',
    [email]
  );
  return res.rows[0];
}

export async function findById(id: string): Promise<ProfileRow | undefined> {
  const res = await query<ProfileRow>('SELECT * FROM profiles WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0];
}

export async function createProfile(input: {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
  entityType?: EntityType;
  entityId?: string;
  avatar?: string;
  membershipTier?: string;
  isVerified?: boolean;
}): Promise<ProfileRow> {
  const res = await query<ProfileRow>(
    `INSERT INTO profiles (email, password_hash, name, role, entity_type, entity_id, avatar, membership_tier, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.email.toLowerCase(),
      input.passwordHash,
      input.name,
      input.role ?? 'creator',
      input.entityType ?? null,
      input.entityId ?? null,
      input.avatar ?? '',
      input.membershipTier ?? 'basic',
      input.isVerified ?? false,
    ]
  );
  return res.rows[0];
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<ProfileRow, 'name' | 'avatar' | 'membership_tier' | 'is_verified' | 'entity_id' | 'entity_type'>>
): Promise<ProfileRow | undefined> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${i}`);
    values.push(value);
    i += 1;
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  const res = await query<ProfileRow>(
    `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.rows[0];
}
