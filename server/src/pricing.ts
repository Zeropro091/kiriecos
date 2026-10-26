/**
 * Harga resmi keanggotaan KIRI (poster = sumber kebenaran), SEMUA TAHUNAN.
 * Server memakai tabel ini untuk menghitung ulang nominal — angka dari browser
 * tidak pernah dipercaya, karena promo membuat klien mudah dimanipulasi.
 */

export type Track = 'creator' | 'business';
export type TierKey = 'basic' | 'exclusive' | 'platinum';

export const MEMBERSHIP_PRICES: Record<Track, Record<TierKey, number>> = {
  creator: { basic: 49000, exclusive: 99000, platinum: 199000 },
  business: { basic: 97000, exclusive: 257000, platinum: 1299000 },
};

export const TRACKS: Track[] = ['creator', 'business'];
export const TIER_KEYS: TierKey[] = ['basic', 'exclusive', 'platinum'];

/** 'creator:exclusive' atau 'exclusive' → { track?, tier }. */
export function parseTierParam(raw: string): { track?: Track; tier?: TierKey } {
  const value = (raw ?? '').trim().toLowerCase();
  const parts = value.split(':');
  const tierCandidate = (parts.length > 1 ? parts[parts.length - 1] : parts[0]) as TierKey;
  const trackCandidate = parts.length > 1 ? (parts[0] as Track) : undefined;
  return {
    track: trackCandidate && TRACKS.includes(trackCandidate) ? trackCandidate : undefined,
    tier: TIER_KEYS.includes(tierCandidate) ? tierCandidate : undefined,
  };
}

export function priceOf(track: Track, tier: TierKey): number {
  return MEMBERSHIP_PRICES[track]?.[tier] ?? 0;
}
