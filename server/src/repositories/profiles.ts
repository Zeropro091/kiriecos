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

/** Digits-only normalization so "+62 812…" and "0812…" match the same profile. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62') && digits.length > 10) return `0${digits.slice(2)}`;
  return digits;
}

export async function findByEmail(email: string): Promise<ProfileRow | undefined> {
  const res = await query<ProfileRow>(
    'SELECT * FROM profiles WHERE lower(email) = lower($1) LIMIT 1',
    [email]
  );
  return res.rows[0];
}

/** Login lookup: matches an email address OR a registered phone number. */
export async function findByLoginIdentifier(identifier: string): Promise<ProfileRow | undefined> {
  const trimmed = identifier.trim();
  const phone = normalizePhone(trimmed);
  const res = await query<ProfileRow>(
    `SELECT * FROM profiles
     WHERE lower(email) = lower($1)
        OR ($2 <> '' AND phone = $2)
     LIMIT 1`,
    [trimmed, phone]
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
  phone?: string;
  avatar?: string;
  membershipTier?: string;
  isVerified?: boolean;
}): Promise<ProfileRow> {
  const res = await query<ProfileRow>(
    `INSERT INTO profiles (email, password_hash, name, role, entity_type, entity_id, phone, avatar, membership_tier, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      input.email.toLowerCase(),
      input.passwordHash,
      input.name,
      input.role ?? 'creator',
      input.entityType ?? null,
      input.entityId ?? null,
      input.phone ? normalizePhone(input.phone) : null,
      input.avatar ?? '',
      input.membershipTier ?? 'basic',
      input.isVerified ?? false,
    ]
  );
  return res.rows[0];
}

/**
 * Binds a freshly registered profile to the entity created by its registration
 * application, so the owner can later edit it (PATCH /entities/:id isOwn check).
 * Only claims entities that have no owner yet — an entity can never be stolen.
 */
export async function claimEntityOwnership(profileId: string, entityId: string): Promise<void> {
  await query(
    `UPDATE entities
     SET owner_profile_id = $1
     WHERE id = $2 AND (owner_profile_id IS NULL OR owner_profile_id = $1)`,
    [profileId, entityId]
  );
  await query(
    `UPDATE profiles
     SET entity_id = $2
     WHERE id = $1 AND (entity_id IS NULL OR entity_id = $2)`,
    [profileId, entityId]
  );
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
