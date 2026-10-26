import { query, withTransaction } from '../db/pool.js';
import { priceOf, parseTierParam, type TierKey, type Track } from '../pricing.js';

export type DiscountType = 'percent' | 'fixed' | 'free';

export interface PromoCodeDto {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  track: 'any' | Track;
  tierScope: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
  createdAt: string;
  /** Keterangan singkat untuk ditampilkan di UI, mis. "Potongan 20%" / "Gratis". */
  label: string;
}

interface PromoRow {
  id: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  track: 'any' | Track;
  tier_scope: string | null;
  max_uses: number | null;
  used_count: number;
  max_uses_per_user: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

function labelOf(row: PromoRow): string {
  if (row.discount_type === 'free') return 'Akses gratis (100%)';
  if (row.discount_type === 'percent') return `Potongan ${row.discount_value}%`;
  return `Potongan Rp ${row.discount_value.toLocaleString('id-ID')}`;
}

function toDto(row: PromoRow): PromoCodeDto {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    track: row.track,
    tierScope: row.tier_scope,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    maxUsesPerUser: row.max_uses_per_user,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    active: row.active,
    createdAt: row.created_at,
    label: labelOf(row),
  };
}

export interface PromoEvaluation {
  valid: boolean;
  reason?: string;
  code?: string;
  label?: string;
  discountType?: DiscountType;
  discountValue?: number;
  amountBefore: number;
  discountAmount: number;
  amountAfter: number;
  isFree: boolean;
}

function emptyEval(amountBefore: number, reason: string): PromoEvaluation {
  return { valid: false, reason, amountBefore, discountAmount: 0, amountAfter: amountBefore, isFree: false };
}

/**
 * Menghitung dampak satu kode promo untuk (track, tier) milik satu member.
 * TIDAK mengubah data apa pun — aman dipanggil berkali-kali dari UI.
 */
export async function evaluatePromo(input: {
  code: string;
  track: Track;
  tier: TierKey;
  profileId: string;
}): Promise<PromoEvaluation> {
  const amountBefore = priceOf(input.track, input.tier);
  const code = (input.code ?? '').trim();
  if (!code) return emptyEval(amountBefore, 'Masukkan kode promo terlebih dahulu.');

  const res = await query<PromoRow & { started: boolean; expired: boolean }>(
    `SELECT *,
            (valid_from <= now()) AS started,
            (valid_until IS NOT NULL AND valid_until < now()) AS expired
       FROM promo_codes WHERE upper(code) = upper($1) LIMIT 1`,
    [code]
  );
  const row = res.rows[0];
  if (!row) return emptyEval(amountBefore, 'Kode promo tidak ditemukan.');
  if (!row.active) return emptyEval(amountBefore, 'Kode promo sudah tidak aktif.');

  // Perbandingan tanggal memakai jam database, bukan jam host — selisih beberapa
  // detik antara host dan Neon dulu membuat kode yang baru dibuat "belum berlaku".
  if (!row.started) return emptyEval(amountBefore, 'Kode promo belum bisa dipakai.');
  if (row.expired) return emptyEval(amountBefore, 'Kode promo sudah kedaluwarsa.');
  if (row.track !== 'any' && row.track !== input.track) {
    return emptyEval(amountBefore, `Kode ini hanya berlaku untuk keanggotaan ${row.track}.`);
  }
  if (row.tier_scope) {
    const allowed = row.tier_scope.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(input.tier)) {
      return emptyEval(amountBefore, `Kode ini hanya berlaku untuk paket ${allowed.join(' / ')}.`);
    }
  }
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return emptyEval(amountBefore, 'Kuota kode promo sudah habis.');
  }

  const mine = await query<{ n: number }>(
    'SELECT count(*)::int AS n FROM promo_redemptions WHERE promo_code_id = $1 AND profile_id = $2',
    [row.id, input.profileId]
  );
  if ((mine.rows[0]?.n ?? 0) >= row.max_uses_per_user) {
    return emptyEval(amountBefore, 'Kamu sudah pernah memakai kode promo ini.');
  }

  let discountAmount = 0;
  if (row.discount_type === 'percent') {
    const pct = Math.min(Math.max(row.discount_value, 0), 100);
    discountAmount = Math.round((amountBefore * pct) / 100);
  } else if (row.discount_type === 'fixed') {
    discountAmount = Math.min(row.discount_value, amountBefore);
  } else {
    discountAmount = amountBefore;
  }
  // Pembulatan ke rupiah utuh; nominal tidak boleh negatif.
  const amountAfter = Math.max(0, amountBefore - discountAmount);

  return {
    valid: true,
    code: row.code,
    label: labelOf(row),
    discountType: row.discount_type,
    discountValue: row.discount_value,
    amountBefore,
    discountAmount,
    amountAfter,
    isFree: amountAfter === 0,
  };
}

/**
 * Menandai kode sudah terpakai. Dipanggil di dalam transaksi pembuatan payment
 * (atau aktivasi gratis) supaya kuota tidak bisa dipakai dua kali.
 */
export async function redeemPromo(
  client: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  input: {
    code: string;
    profileId: string;
    track: Track;
    tier: TierKey;
    amountBefore: number;
    amountAfter: number;
    paymentId?: string | null;
  }
): Promise<boolean> {
  const res = await client.query('SELECT * FROM promo_codes WHERE upper(code) = upper($1) FOR UPDATE', [input.code]);
  const row = (res.rows as PromoRow[])[0];
  if (!row) return false;
  if (row.max_uses !== null && row.used_count >= row.max_uses) return false;

  await client.query('UPDATE promo_codes SET used_count = used_count + 1, updated_at = now() WHERE id = $1', [row.id]);
  await client.query(
    `INSERT INTO promo_redemptions
       (promo_code_id, profile_id, payment_id, track, tier, amount_before, amount_after)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [row.id, input.profileId, input.paymentId ?? null, input.track, input.tier, input.amountBefore, input.amountAfter]
  );
  return true;
}

// ------------------------------------------------------------------ admin CRUD

export async function listPromoCodes(): Promise<PromoCodeDto[]> {
  const res = await query<PromoRow>('SELECT * FROM promo_codes ORDER BY created_at DESC LIMIT 300');
  return res.rows.map(toDto);
}

export async function createPromoCode(input: {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  track?: 'any' | Track;
  tierScope?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  active?: boolean;
  createdBy?: string;
}): Promise<PromoCodeDto> {
  const res = await query<PromoRow>(
    `INSERT INTO promo_codes
       (code, description, discount_type, discount_value, track, tier_scope,
        max_uses, max_uses_per_user, valid_from, valid_until, active, created_by)
     VALUES (upper($1), $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()), $10, $11, $12)
     RETURNING *`,
    [
      input.code.trim(),
      input.description ?? '',
      input.discountType,
      input.discountType === 'free' ? 0 : input.discountValue,
      input.track ?? 'any',
      input.tierScope || null,
      input.maxUses ?? null,
      input.maxUsesPerUser ?? 1,
      input.validFrom || null,
      input.validUntil || null,
      input.active ?? true,
      input.createdBy ?? null,
    ]
  );
  return toDto(res.rows[0]);
}

export async function updatePromoCode(
  id: string,
  patch: Partial<{
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    track: 'any' | Track;
    tierScope: string | null;
    maxUses: number | null;
    maxUsesPerUser: number;
    validFrom: string | null;
    validUntil: string | null;
    active: boolean;
  }>
): Promise<PromoCodeDto | undefined> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  const push = (col: string, value: unknown, transform?: (v: unknown) => unknown) => {
    vals.push(transform ? transform(value) : value);
    sets.push(`${col} = $${vals.length}`);
  };

  if (patch.code !== undefined) push('code', patch.code.trim(), (v) => String(v).toUpperCase());
  if (patch.description !== undefined) push('description', patch.description);
  if (patch.discountType !== undefined) push('discount_type', patch.discountType);
  if (patch.discountValue !== undefined) push('discount_value', patch.discountValue);
  if (patch.track !== undefined) push('track', patch.track);
  if (patch.tierScope !== undefined) push('tier_scope', patch.tierScope || null);
  if (patch.maxUses !== undefined) push('max_uses', patch.maxUses);
  if (patch.maxUsesPerUser !== undefined) push('max_uses_per_user', patch.maxUsesPerUser);
  if (patch.validFrom !== undefined) push('valid_from', patch.validFrom);
  if (patch.validUntil !== undefined) push('valid_until', patch.validUntil);
  if (patch.active !== undefined) push('active', patch.active);

  if (!sets.length) {
    const cur = await query<PromoRow>('SELECT * FROM promo_codes WHERE id = $1', [id]);
    return cur.rows[0] ? toDto(cur.rows[0]) : undefined;
  }

  vals.push(id);
  const res = await query<PromoRow>(
    `UPDATE promo_codes SET ${sets.join(', ')}, updated_at = now()
     WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const res = await query('DELETE FROM promo_codes WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function listRedemptions(codeId?: string) {
  const res = await query(
    `SELECT r.id, r.track, r.tier, r.amount_before, r.amount_after, r.created_at,
            p.name AS member_name, p.email AS member_email, c.code
       FROM promo_redemptions r
       JOIN promo_codes c ON c.id = r.promo_code_id
       LEFT JOIN profiles p ON p.id = r.profile_id
      ${codeId ? 'WHERE r.promo_code_id = $1' : ''}
      ORDER BY r.created_at DESC LIMIT 200`,
    codeId ? [codeId] : []
  );
  return res.rows;
}

export { withTransaction };
export { parseTierParam };
