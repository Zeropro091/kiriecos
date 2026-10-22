import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PoolClient } from 'pg';
import { closePool, pool, withTransaction } from './db/pool.js';
import { env } from './config.js';
import { hashPassword } from './auth/password.js';
import { runMigrations } from './db/migrate.js';

const here = dirname(fileURLToPath(import.meta.url));
const seedDir = join(here, 'seed-data');

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(seedDir, `${name}.json`), 'utf8')) as T;
}

interface SeedEntity {
  id: string;
  type: string;
  name: string;
  handle: string;
  category: string;
  badge?: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  tags?: string[];
  lookingFor?: string[];
  membersCount?: number;
  featured?: boolean;
  customLandingPageActive?: boolean;
  stats?: { label: string; value: string }[];
  portfolio?: { title: string; type?: string; imageUrl?: string; caption?: string; views?: string; likes?: string; link?: string }[];
  services?: { name: string; price?: string; description?: string; deliverables?: string[] }[];
}

async function seedAdmin(client: PoolClient): Promise<void> {
  const hash = await hashPassword(env.SEED_ADMIN_PASSWORD);
  await client.query(
    `INSERT INTO profiles (email, password_hash, name, role, membership_tier, is_verified)
     VALUES ($1, $2, 'Admin KIRI', 'admin', 'System Master', true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = 'admin',
           membership_tier = 'System Master', is_verified = true`,
    [env.SEED_ADMIN_EMAIL, hash]
  );
  console.log(`[seed] admin ready: ${env.SEED_ADMIN_EMAIL}`);
}

async function seedEntities(client: PoolClient): Promise<Map<string, string>> {
  const entities = load<SeedEntity[]>('entities');
  const idMap = new Map<string, string>();

  for (const e of entities) {
    const res = await client.query<{ id: string }>(
      `INSERT INTO entities
        (type, name, handle, category, badge, verified, verification_status, avatar, cover_image, bio, location,
         website, instagram, tiktok, youtube, tags, looking_for, members_count, featured, custom_landing_page_active)
       VALUES ($1,$2,$3,$4,$5,true,'approved',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id`,
      [
        e.type, e.name, e.handle, e.category, e.badge ?? null, e.avatar, e.coverImage, e.bio, e.location,
        e.website ?? null, e.instagram ?? null, e.tiktok ?? null, e.youtube ?? null,
        e.tags ?? [], e.lookingFor ?? [], e.membersCount ?? null, e.featured ?? false, e.customLandingPageActive ?? false,
      ]
    );
    const newId = res.rows[0].id;
    idMap.set(e.id, newId);

    for (let s = 0; s < (e.stats ?? []).length; s += 1) {
      await client.query(
        'INSERT INTO entity_stats (entity_id, label, value, sort_order) VALUES ($1,$2,$3,$4)',
        [newId, e.stats![s].label, e.stats![s].value, s]
      );
    }
    for (let p = 0; p < (e.portfolio ?? []).length; p += 1) {
      const item = e.portfolio![p];
      await client.query(
        `INSERT INTO portfolios (entity_id, title, type, image_url, caption, views, likes, link, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [newId, item.title, item.type ?? 'photo', item.imageUrl ?? '', item.caption ?? null, item.views ?? null, item.likes ?? null, item.link ?? null, p]
      );
    }
    for (let sv = 0; sv < (e.services ?? []).length; sv += 1) {
      const item = e.services![sv];
      await client.query(
        `INSERT INTO services (entity_id, name, price, description, deliverables, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [newId, item.name, item.price ?? '', item.description ?? '', item.deliverables ?? [], sv]
      );
    }
  }

  console.log(`[seed] entities: ${idMap.size}`);
  return idMap;
}

async function main(): Promise<void> {
  await pool.query('SELECT 1');
  await runMigrations();

  await withTransaction(async (client) => {
    await client.query(
      'TRUNCATE broadcast_messages, collaboration_requests, registrations, community_members, services, portfolios, entity_stats, entities, payment_receipts, profiles RESTART IDENTITY CASCADE'
    );

    await seedAdmin(client);
    const idMap = await seedEntities(client);

    const members = load<Array<Record<string, string>>>('members');
    for (const m of members) {
      await client.query(
        `INSERT INTO community_members (name, role, category, avatar, joined_date, email, instagram, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [m.name, m.role, m.category, m.avatar, m.joinedDate, m.email, m.instagram, m.status]
      );
    }
    console.log(`[seed] community members: ${members.length}`);

    const registrations = load<Array<Record<string, string>>>('registrations');
    for (const r of registrations) {
      // Mirror createRegistrationWithEntity: every registration owns a backing
      // pending entity so admin review (approve/reject) has a real target.
      const handle = `${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'entity'}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const entityRes = await client.query<{ id: string }>(
        `INSERT INTO entities (type, name, handle, category, bio, location, instagram, verification_status, verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_review',false)
         RETURNING id`,
        [r.type, r.name, handle, r.category, r.details, r.city, r.socialLink]
      );
      await client.query(
        `INSERT INTO registrations (entity_id, type, name, contact_person, email, phone, city, category, social_link, details, status, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          entityRes.rows[0].id,
          r.type, r.name, r.contactPerson, r.email, r.phone, r.city,
          r.category, r.socialLink, r.details, r.status, r.submittedAt,
        ]
      );
    }
    console.log(`[seed] registrations: ${registrations.length}`);

    const collabs = load<Array<Record<string, unknown>>>('collaborations');
    for (const c of collabs) {
      await client.query(
        `INSERT INTO collaboration_requests
          (tracking_code, title, category, requester_id, requester_name, requester_type, target_id, target_name,
           target_type, budget, timeline, scope, deliverables, status, admin_notes, matched_talent_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          c.trackingCode, c.title, c.category,
          idMap.get(c.requesterId as string) ?? c.requesterId,
          c.requesterName, c.requesterType,
          idMap.get(c.targetId as string) ?? c.targetId,
          c.targetName, c.targetType, c.budget, c.timeline, c.scope, c.deliverables,
          c.status, c.adminNotes ?? null, c.matchedTalentName ?? null,
        ]
      );
    }
    console.log(`[seed] collaborations: ${collabs.length}`);

    const broadcasts = load<Array<Record<string, unknown>>>('broadcasts');
    for (const b of broadcasts) {
      await client.query(
        `INSERT INTO broadcast_messages
          (scope, region, sender_id, sender_name, sender_role, sender_avatar, sender_badge, content, likes_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [b.scope, b.region ?? null, b.senderId, b.senderName, b.senderRole, b.senderAvatar, b.senderBadge ?? null, b.content, b.likesCount ?? 0]
      );
    }
    console.log(`[seed] broadcasts: ${broadcasts.length}`);
  });

  console.log('[seed] complete');
}

main()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed] failed:', err);
    await closePool();
    process.exit(1);
  });
