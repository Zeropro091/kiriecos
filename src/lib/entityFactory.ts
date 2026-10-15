/**
 * KIRI PROJECT — entity construction from a registration.
 *
 * The directory reads `entities`, while the admin queue reviews
 * `registrations`. A registration that never produced an entity is invisible to
 * moderation, so both the runtime submit path and the seed/reconcile path must
 * build the entity the exact same way — hence this single factory.
 */

import type { Entity, RegistrationApplication } from '../types';

/** URL-safe unique handle. The random suffix keeps duplicate names from colliding. */
export function makeHandle(name: string): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'entity';
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}_${suffix}`.substring(0, 40);
}

/**
 * Build the pending entity that backs a registration. `pending_review` keeps it
 * out of public listings until an admin approves it.
 */
export function pendingEntityFromRegistration(app: RegistrationApplication): Entity {
  return {
    id: app.id,
    type: app.type,
    name: app.name,
    handle: makeHandle(app.name),
    category: app.category,
    verified: false,
    verificationStatus: 'pending_review',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    bio: app.details,
    location: app.city || 'Bali, Indonesia',
    instagram: app.socialLink || undefined,
    stats: [{ label: 'Kolaborasi Aktif', value: '0' }],
    tags: [app.category],
  };
}
