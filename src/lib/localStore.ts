/**
 * KIRI PROJECT — persistent local record store.
 *
 * This is the database. It replaces every Postgres table the app used to reach
 * through PostgREST: entities, collaboration_requests, payment_receipts,
 * registrations, community_members and broadcast_messages.
 *
 * Storage choice: localStorage, not IndexedDB. These are small JSON records
 * (largest realistic row is a few KB) and we need SYNCHRONOUS seed reads on
 * first paint so the directory never flashes empty. Binary payloads — the
 * things that actually need IndexedDB — live in lib/idb.ts instead.
 *
 * Every collection is written through `write()` which serialises once and
 * guards against QuotaExceededError, so a full disk surfaces as a toast
 * rather than a silent data loss.
 */

import type {
  Entity,
  CollaborationRequest,
  RegistrationApplication,
  PaymentReceipt,
  CommunityMember,
  BroadcastMessage,
} from '../types';
import {
  INITIAL_ENTITIES,
  INITIAL_COLLAB_REQUESTS,
  INITIAL_REGISTRATIONS,
  INITIAL_COMMUNITY_MEMBERS,
} from '../data/mockData';
import { INITIAL_BROADCAST_MESSAGES } from '../data/broadcastData';
import { pendingEntityFromRegistration } from './entityFactory';

/** Bump when a change to seed shape would break existing installs. */
const SCHEMA_VERSION = 3;

const KEY_PREFIX = 'kiri.db';
const VERSION_KEY = `${KEY_PREFIX}.schema_version`;

export const KEYS = {
  entities: `${KEY_PREFIX}.entities`,
  collabs: `${KEY_PREFIX}.collaboration_requests`,
  registrations: `${KEY_PREFIX}.registrations`,
  payments: `${KEY_PREFIX}.payment_receipts`,
  members: `${KEY_PREFIX}.community_members`,
  broadcasts: `${KEY_PREFIX}.broadcast_messages`,
} as const;

export interface StoreShape {
  entities: Entity[];
  collabs: CollaborationRequest[];
  registrations: RegistrationApplication[];
  payments: PaymentReceipt[];
  members: CommunityMember[];
  broadcasts: BroadcastMessage[];
}

function seed(): StoreShape {
  return {
    entities: [...INITIAL_ENTITIES],
    collabs: [...INITIAL_COLLAB_REQUESTS],
    registrations: [...INITIAL_REGISTRATIONS],
    payments: [],
    members: [...INITIAL_COMMUNITY_MEMBERS],
    broadcasts: [...INITIAL_BROADCAST_MESSAGES],
  };
}

function readRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Guard against a truncated write or a hand-edited value: must be an array.
    if (!Array.isArray(parsed)) {
      console.warn(`[KIRI] ${key} is not an array, reseeding.`);
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.error(`[KIRI] Failed to read ${key}, reseeding:`, err);
    return fallback;
  }
}

/**
 * Persist one collection. Returns false when the browser refused the write so
 * the caller can warn the user instead of pretending the save succeeded.
 */
function writeRaw<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    const quotaExceeded =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    console.error(
      quotaExceeded
        ? `[KIRI] Local storage is full — could not save ${key}. Free space or reset local data.`
        : `[KIRI] Failed to save ${key}:`,
      err
    );
    return false;
  }
}

/** True when the browser has no usable localStorage (some strict privacy modes). */
export function isLocalStorageUsable(): boolean {
  try {
    const probe = `${KEY_PREFIX}.__probe__`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

let initialised = false;

/**
 * Seed once, then no-op. Callers never need to call this directly — `store.read`
 * invokes it — but it stays exported for an explicit boot-time call.
 *
 * This MUST run before any read is trusted. React renders the provider before
 * its effects fire, so a read that raced ahead of seeding would return `[]`,
 * and the write-back effect would then persist that empty array over the seed.
 * Guarding every read closes that window.
 */
export function initStore(): void {
  if (initialised) return;

  if (!isLocalStorageUsable()) {
    console.warn('[KIRI] localStorage unusable — running in memory-only mode.');
    initialised = true;
    return;
  }

  const storedVersion = Number(localStorage.getItem(VERSION_KEY) ?? 0);

  if (storedVersion === SCHEMA_VERSION) {
    initialised = true;
    return;
  }

  if (storedVersion === 0) {
    const fresh = seed();

    const legacyEntities = readRaw<Entity[]>('kiri_entities', []);
    const legacyMembers = readRaw<CommunityMember[]>('kiri_members', []);
    const legacyCollabs = readRaw<CollaborationRequest[]>('kiri_collabs', []);
    const legacyRegistrations = readRaw<RegistrationApplication[]>('kiri_registrations', []);
    const legacyBroadcasts = readRaw<BroadcastMessage[]>('kiri_broadcasts', []);

    if (legacyEntities.length) fresh.entities = legacyEntities;
    if (legacyMembers.length) fresh.members = legacyMembers;
    if (legacyCollabs.length) fresh.collabs = legacyCollabs;
    if (legacyRegistrations.length) fresh.registrations = legacyRegistrations;
    if (legacyBroadcasts.length) fresh.broadcasts = legacyBroadcasts;

    fresh.entities = reconcileRegistrationsWithEntities(fresh.registrations, fresh.entities);

    writeRaw(KEYS.entities, fresh.entities);
    writeRaw(KEYS.collabs, fresh.collabs);
    writeRaw(KEYS.registrations, fresh.registrations);
    writeRaw(KEYS.payments, fresh.payments);
    writeRaw(KEYS.members, fresh.members);
    writeRaw(KEYS.broadcasts, fresh.broadcasts);
    localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    initialised = true;
    console.info('[KIRI] Local store initialised (schema v' + SCHEMA_VERSION + ').');
    return;
  }

  if (storedVersion < SCHEMA_VERSION) {
    // v2 → v3: earlier installs stored registrations with no backing entity, so
    // the admin queue reported 0 pending while registrations sat unreviewable.
    const entities = readRaw<Entity[]>(KEYS.entities, []);
    const registrations = readRaw<RegistrationApplication[]>(KEYS.registrations, []);
    writeRaw(KEYS.entities, reconcileRegistrationsWithEntities(registrations, entities));
    localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    initialised = true;
    console.info('[KIRI] Migrated local store to schema v' + SCHEMA_VERSION + '.');
    return;
  }

  localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
  initialised = true;
}

/**
 * Guarantees every non-rejected registration has a backing entity.
 *
 * The directory reads `entities` while moderation reviews `registrations`, so a
 * registration without an entity is invisible to admins — it never appears in
 * the approval queue and can never be approved. This runs at seed and migration
 * time so pre-existing data heals instead of staying stuck.
 */
function reconcileRegistrationsWithEntities(
  registrations: RegistrationApplication[],
  entities: Entity[]
): Entity[] {
  const existingIds = new Set(entities.map((e) => e.id));
  const repaired = [...entities];

  for (const app of registrations) {
    if (app.status === 'rejected' || existingIds.has(app.id)) continue;

    const entity = pendingEntityFromRegistration(app);
    if (app.status === 'approved') {
      entity.verified = true;
      entity.verificationStatus = 'approved';
    }
    repaired.push(entity);
    existingIds.add(app.id);
  }

  return repaired;
}

/** Every read goes through here so the store can never be observed unseeded. */
function read<T>(key: string, fallback: T): T {
  initStore();
  return readRaw<T>(key, fallback);
}

export const store = {
  read: {
    entities: () => read<Entity[]>(KEYS.entities, []),
    collabs: () => read<CollaborationRequest[]>(KEYS.collabs, []),
    registrations: () => read<RegistrationApplication[]>(KEYS.registrations, []),
    payments: () => read<PaymentReceipt[]>(KEYS.payments, []),
    members: () => read<CommunityMember[]>(KEYS.members, []),
    broadcasts: () => read<BroadcastMessage[]>(KEYS.broadcasts, []),
  },
  write: {
    entities: (v: Entity[]) => writeRaw(KEYS.entities, v),
    collabs: (v: CollaborationRequest[]) => writeRaw(KEYS.collabs, v),
    registrations: (v: RegistrationApplication[]) => writeRaw(KEYS.registrations, v),
    payments: (v: PaymentReceipt[]) => writeRaw(KEYS.payments, v),
    members: (v: CommunityMember[]) => writeRaw(KEYS.members, v),
    broadcasts: (v: BroadcastMessage[]) => writeRaw(KEYS.broadcasts, v),
  },
};

/** Remove every KIRI key. Used by the "reset local data" action. */
export function resetStore(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(VERSION_KEY);
  initialised = false;
  initStore();
}
