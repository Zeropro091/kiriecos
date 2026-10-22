import { query, withTransaction } from '../db/pool.js';
import type { EntityType, VerificationStatus } from '../types.js';

export interface ServiceRateDto {
  name: string;
  price?: string;
  description?: string;
  deliverables?: string[];
}

export interface PortfolioItemDto {
  title: string;
  type?: string;
  imageUrl?: string;
  caption?: string;
  views?: string;
  likes?: string;
  link?: string;
}

export interface EntityDto {
  id: string;
  type: EntityType;
  name: string;
  handle: string;
  category: string;
  badge?: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  tags: string[];
  lookingFor: string[];
  membersCount?: number;
  featured: boolean;
  ownerProfileId?: string;
  stats: { label: string; value: string }[];
  portfolio: unknown[];
  services: unknown[];
  customLandingPageActive: boolean;
  customHtml?: string;
  customCss?: string;
  customJs?: string;
}

interface EntityRow {
  id: string;
  type: EntityType;
  name: string;
  handle: string;
  category: string;
  badge: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  avatar: string;
  cover_image: string;
  bio: string;
  location: string;
  website: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  tags: string[];
  looking_for: string[];
  members_count: number | null;
  featured: boolean;
  owner_profile_id: string | null;
  custom_landing_page_active: boolean;
  custom_html: string | null;
  custom_css: string | null;
  custom_js: string | null;
  stats: { label: string; value: string }[] | null;
  portfolio: unknown[] | null;
  services: unknown[] | null;
}

function toDto(row: EntityRow): EntityDto {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    handle: row.handle,
    category: row.category,
    badge: row.badge ?? undefined,
    verified: row.verified,
    verificationStatus: row.verification_status,
    avatar: row.avatar,
    coverImage: row.cover_image,
    bio: row.bio,
    location: row.location,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    tiktok: row.tiktok ?? undefined,
    youtube: row.youtube ?? undefined,
    tags: row.tags ?? [],
    lookingFor: row.looking_for ?? [],
    membersCount: row.members_count ?? undefined,
    featured: row.featured,
    ownerProfileId: row.owner_profile_id ?? undefined,
    stats: row.stats ?? [],
    portfolio: row.portfolio ?? [],
    services: row.services ?? [],
    customLandingPageActive: row.custom_landing_page_active,
    customHtml: row.custom_html ?? undefined,
    customCss: row.custom_css ?? undefined,
    customJs: row.custom_js ?? undefined,
  };
}

const SELECT_WITH_RELATIONS = `
  SELECT e.*,
    COALESCE(
      (SELECT json_agg(json_build_object('label', s.label, 'value', s.value) ORDER BY s.sort_order)
       FROM entity_stats s WHERE s.entity_id = e.id),
      '[]'::json
    ) AS stats,
    COALESCE(
      (SELECT json_agg(json_build_object(
          'id', p.id, 'title', p.title, 'type', p.type, 'imageUrl', p.image_url,
          'caption', p.caption, 'views', p.views, 'likes', p.likes, 'link', p.link
        ) ORDER BY p.sort_order)
       FROM portfolios p WHERE p.entity_id = e.id),
      '[]'::json
    ) AS portfolio,
    COALESCE(
      (SELECT json_agg(json_build_object(
          'id', sv.id, 'name', sv.name, 'price', sv.price,
          'description', sv.description, 'deliverables', sv.deliverables
        ) ORDER BY sv.sort_order)
       FROM services sv WHERE sv.entity_id = e.id),
      '[]'::json
    ) AS services
  FROM entities e
`;

export async function listEntities(filter: {
  status?: VerificationStatus;
  type?: EntityType;
  category?: string;
  search?: string;
}): Promise<EntityDto[]> {
  const where: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (filter.status) {
    where.push(`e.verification_status = $${i}`);
    values.push(filter.status);
    i += 1;
  }
  if (filter.type) {
    where.push(`e.type = $${i}`);
    values.push(filter.type);
    i += 1;
  }
  if (filter.category) {
    where.push(`lower(e.category) = lower($${i})`);
    values.push(filter.category);
    i += 1;
  }
  if (filter.search) {
    where.push(`(e.name ILIKE $${i} OR e.bio ILIKE $${i} OR e.category ILIKE $${i})`);
    values.push(`%${filter.search}%`);
    i += 1;
  }

  const sql = `${SELECT_WITH_RELATIONS} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY e.featured DESC, e.name ASC`;
  const res = await query<EntityRow>(sql, values);
  return res.rows.map(toDto);
}

export async function getEntity(id: string): Promise<EntityDto | undefined> {
  const res = await query<EntityRow>(`${SELECT_WITH_RELATIONS} WHERE e.id = $1 LIMIT 1`, [id]);
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}

/** Approve/reject an entity (admin action). */
export async function setVerification(
  id: string,
  status: VerificationStatus,
  rejectionReason?: string
): Promise<EntityDto | undefined> {
  const res = await query<EntityRow>(
    `UPDATE entities
     SET verification_status = $2,
         verified = ($2 = 'approved'),
         rejection_reason = $3
     WHERE id = $1
     RETURNING *`,
    [id, status, rejectionReason ?? null]
  );
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}

export interface EntityProfileUpdates {
  name?: string;
  handle?: string;
  category?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  cover_image?: string;
  services?: ServiceRateDto[];
  portfolio?: PortfolioItemDto[];
}

/** Update scalar entity fields and (when provided) replace the services/portfolio rows. */
export async function updateEntity(id: string, updates: EntityProfileUpdates): Promise<EntityDto | undefined> {
  const { services, portfolio, ...scalarUpdates } = updates;

  await withTransaction(async (client) => {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(scalarUpdates)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${i}`);
      values.push(value);
      i += 1;
    }
    if (fields.length > 0) {
      values.push(id);
      await client.query(`UPDATE entities SET ${fields.join(', ')} WHERE id = $${i}`, values);
    }

    if (services !== undefined) {
      await client.query('DELETE FROM services WHERE entity_id = $1', [id]);
      for (let s = 0; s < services.length; s += 1) {
        const item = services[s];
        await client.query(
          `INSERT INTO services (entity_id, name, price, description, deliverables, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, item.name, item.price ?? '', item.description ?? '', item.deliverables ?? [], s]
        );
      }
    }

    if (portfolio !== undefined) {
      await client.query('DELETE FROM portfolios WHERE entity_id = $1', [id]);
      for (let p = 0; p < portfolio.length; p += 1) {
        const item = portfolio[p];
        await client.query(
          `INSERT INTO portfolios (entity_id, title, type, image_url, caption, views, likes, link, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            id,
            item.title,
            item.type ?? 'photo',
            item.imageUrl ?? '',
            item.caption ?? null,
            item.views ?? null,
            item.likes ?? null,
            item.link ?? null,
            p,
          ]
        );
      }
    }
  });

  return getEntity(id);
}
