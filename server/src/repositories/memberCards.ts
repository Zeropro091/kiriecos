import { randomBytes } from 'node:crypto';
import { query } from '../db/pool.js';
import type { MemberCardRow } from '../types.js';

const CARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCardNumber(): string {
  const bytes = randomBytes(8);
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += CARD_ALPHABET[bytes[i] % CARD_ALPHABET.length];
  }
  return `KIRI-${suffix}`;
}

/** Returns the member's card, inserting one on first access.
 *  Retries with a fresh number on card_number unique collisions. */
export async function getOrCreateMemberCard(profileId: string, tier: string): Promise<MemberCardRow> {
  const existing = await query<MemberCardRow>(
    'SELECT * FROM member_cards WHERE profile_id = $1',
    [profileId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const cardNumber = generateCardNumber();
    try {
      const inserted = await query<MemberCardRow>(
        `INSERT INTO member_cards (profile_id, card_number, tier)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [profileId, cardNumber, tier]
      );
      return inserted.rows[0];
    } catch (err) {
      // 23505 = unique_violation (card_number collision): retry with a new number.
      if ((err as { code?: string }).code === '23505') continue;
      throw err;
    }
  }
  throw new Error('Gagal membuat kartu member setelah beberapa percobaan.');
}
