import { query } from '../db/pool.js';
import { withTransaction } from '../db/pool.js';
import type { ApplicationStatus, EntityType } from '../types.js';

export interface RegistrationDto {
  id: string;
  entityId?: string;
  type: EntityType;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  socialLink: string;
  details: string;
  status: ApplicationStatus;
  submittedAt: string;
  rejectionReason?: string;
}

interface RegistrationRow {
  id: string;
  entity_id: string | null;
  type: EntityType;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  social_link: string;
  details: string;
  status: ApplicationStatus;
  submitted_at: string;
  rejection_reason: string | null;
}

function toDto(row: RegistrationRow): RegistrationDto {
  return {
    id: row.id,
    entityId: row.entity_id ?? undefined,
    type: row.type,
    name: row.name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    city: row.city,
    category: row.category,
    socialLink: row.social_link,
    details: row.details,
    status: row.status,
    submittedAt: row.submitted_at,
    rejectionReason: row.rejection_reason ?? undefined,
  };
}

export async function listRegistrations(status?: ApplicationStatus): Promise<RegistrationDto[]> {
  const res = status
    ? await query<RegistrationRow>(
        'SELECT * FROM registrations WHERE status = $1 ORDER BY submitted_at DESC LIMIT 500',
        [status]
      )
    : await query<RegistrationRow>('SELECT * FROM registrations ORDER BY submitted_at DESC LIMIT 500');
  return res.rows.map(toDto);
}

export async function getRegistration(id: string): Promise<RegistrationDto | undefined> {
  const res = await query<RegistrationRow>('SELECT * FROM registrations WHERE id = $1', [id]);
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}

/**
 * Create the registration and its backing pending entity atomically, so an
 * approved registration always has the entity the directory needs.
 */
export async function createRegistrationWithEntity(input: {
  type: EntityType;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  socialLink: string;
  details: string;
}): Promise<RegistrationDto> {
  return withTransaction(async (client) => {
    const handle = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'entity'}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const entityRes = await client.query<{ id: string }>(
      `INSERT INTO entities (type, name, handle, category, bio, location, instagram, verification_status, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_review',false)
       RETURNING id`,
      [input.type, input.name, handle, input.category, input.details, input.city, input.socialLink]
    );
    const entityId = entityRes.rows[0].id;

    const regRes = await client.query<RegistrationRow>(
      `INSERT INTO registrations
        (entity_id, type, name, contact_person, email, phone, city, category, social_link, details, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
       RETURNING *`,
      [
        entityId,
        input.type,
        input.name,
        input.contactPerson,
        input.email,
        input.phone,
        input.city,
        input.category,
        input.socialLink,
        input.details,
      ]
    );
    return toDto(regRes.rows[0]);
  });
}

export async function reviewRegistration(
  id: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<RegistrationDto | undefined> {
  return withTransaction(async (client) => {
    const regRes = await client.query<RegistrationRow>(
      `UPDATE registrations SET status = $2, rejection_reason = $3 WHERE id = $1 RETURNING *`,
      [id, status, rejectionReason ?? null]
    );
    const reg = regRes.rows[0];
    if (!reg) return undefined;

    if (reg.entity_id) {
      await client.query(
        `UPDATE entities
         SET verification_status = $2, verified = ($2 = 'approved'), rejection_reason = $3
         WHERE id = $1`,
        [reg.entity_id, status === 'approved' ? 'approved' : 'rejected', rejectionReason ?? null]
      );
    }
    return toDto(reg);
  });
}
