/**
 * KIRI PROJECT — helper kode promo untuk halaman pricing & pembayaran.
 *
 * Server adalah sumber kebenaran: harga dan potongan dihitung ulang di backend,
 * jadi angka di UI hanya untuk tampilan. Semua fungsi di sini mengembalikan
 * objek hasil yang aman dipakai langsung oleh state React.
 */
import { api, ApiError } from './api';

export type PromoTrack = 'creator' | 'business';
export type PromoTier = 'basic' | 'exclusive' | 'platinum';

export interface PromoEvaluation {
  valid: boolean;
  reason?: string;
  code?: string;
  label?: string;
  discountType?: 'percent' | 'fixed' | 'free';
  discountValue?: number;
  amountBefore: number;
  discountAmount: number;
  amountAfter: number;
  isFree: boolean;
  track?: PromoTrack;
  tier?: PromoTier;
}

export const formatRupiah = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;

/**
 * Cek kode promo.
 * - `preview: true` → boleh dipanggil sebelum login (hanya menampilkan harga coret)
 * - `preview: false` → butuh sesi login; sekaligus mengecek kuota per member
 */
export async function validatePromo(
  code: string,
  track: PromoTrack,
  tier: PromoTier,
  opts: { preview?: boolean } = {}
): Promise<PromoEvaluation> {
  const path = opts.preview ? '/promos/preview' : '/promos/validate';
  try {
    return await api.post<PromoEvaluation>(path, { code, track, tier });
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        valid: false,
        reason: err.message,
        amountBefore: 0,
        discountAmount: 0,
        amountAfter: 0,
        isFree: false,
      };
    }
    return {
      valid: false,
      reason: 'Tidak bisa memeriksa kode promo. Coba lagi.',
      amountBefore: 0,
      discountAmount: 0,
      amountAfter: 0,
      isFree: false,
    };
  }
}

/** Harga setelah promo untuk satu tier, dipakai untuk mencoret harga di kartu. */
export function discountedPrice(base: number, evaluation: PromoEvaluation | null): number {
  if (!evaluation?.valid) return base;
  if (evaluation.discountType === 'free') return 0;
  if (evaluation.discountType === 'percent') {
    return Math.max(0, base - Math.round((base * Math.min(evaluation.discountValue ?? 0, 100)) / 100));
  }
  return Math.max(0, base - (evaluation.discountValue ?? 0));
}

// ---------------------------------------------------------------- admin

export interface AdminPromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed' | 'free';
  discountValue: number;
  track: 'any' | PromoTrack;
  tierScope: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
  createdAt: string;
  label: string;
}

export interface AdminPromoRedemption {
  id: string;
  code: string;
  track: string;
  tier: string;
  amount_before: number;
  amount_after: number;
  created_at: string;
  member_name?: string | null;
  member_email?: string | null;
}

export const fetchPromoCodes = async (): Promise<AdminPromoCode[]> => {
  const res = await api.get<{ promos: AdminPromoCode[] }>('/promos');
  return res.promos ?? [];
};

export const createPromoCode = async (input: {
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed' | 'free';
  discountValue: number;
  track: 'any' | PromoTrack;
  tierScope?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  validUntil?: string | null;
}): Promise<AdminPromoCode> => {
  const res = await api.post<{ promo: AdminPromoCode }>('/promos', input);
  return res.promo;
};

export const updatePromoCode = async (
  id: string,
  patch: Partial<Pick<AdminPromoCode, 'active' | 'description' | 'maxUses' | 'tierScope' | 'validUntil'>>
): Promise<AdminPromoCode> => {
  const res = await api.patch<{ promo: AdminPromoCode }>(`/promos/${id}`, patch);
  return res.promo;
};

export const deletePromoCode = (id: string): Promise<void> => api.delete<void>(`/promos/${id}`);

export const fetchRedemptions = async (): Promise<AdminPromoRedemption[]> => {
  const res = await api.get<{ redemptions: AdminPromoRedemption[] }>('/promos/redemptions');
  return res.redemptions ?? [];
};
