import { query, withTransaction } from '../db/pool.js';
import type { PaymentStatus } from '../types.js';

/**
 * Maps a payment `tier` value to a tier allowed by the
 * `profiles_membership_tier_check` constraint (002_launch_features.sql).
 * Accepts both plain tiers ("exclusive") and the checkout format
 * ("creator:exclusive" / "business:platinum"). Returns null when the value
 * cannot be safely mapped — the payment is still verified, the tier just
 * is not changed.
 */
export function mapPaymentTier(tier: string): string | null {
  const raw = (tier.includes(':') ? tier.split(':').pop()! : tier).trim().toLowerCase();
  if (raw === 'basic') return 'basic';
  if (raw === 'exclusive') return 'exclusive';
  if (raw === 'platinum') return 'platinum';
  if (raw === 'system master') return 'System Master';
  return null;
}

export interface PaymentDto {
  id: string;
  userId: string;
  userName: string;
  entityId?: string;
  tier: string;
  amount: number;
  bankName: string;
  senderAccountName: string;
  receiptImageUrl: string;
  status: PaymentStatus;
  adminNotes?: string;
  submittedAt: string;
}

interface PaymentRow {
  id: string;
  profile_id: string | null;
  user_id: string;
  user_name: string;
  entity_id: string | null;
  tier: string;
  amount: number;
  bank_name: string;
  sender_account_name: string;
  receipt_image_url: string;
  status: PaymentStatus;
  admin_notes: string | null;
  submitted_at: string;
}

function toDto(row: PaymentRow): PaymentDto {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    entityId: row.entity_id ?? undefined,
    tier: row.tier,
    amount: row.amount,
    bankName: row.bank_name,
    senderAccountName: row.sender_account_name,
    receiptImageUrl: row.receipt_image_url,
    status: row.status,
    adminNotes: row.admin_notes ?? undefined,
    submittedAt: row.submitted_at,
  };
}

export async function listPayments(status?: PaymentStatus): Promise<PaymentDto[]> {
  const res = status
    ? await query<PaymentRow>(
        'SELECT * FROM payment_receipts WHERE status = $1 ORDER BY submitted_at DESC LIMIT 500',
        [status]
      )
    : await query<PaymentRow>('SELECT * FROM payment_receipts ORDER BY submitted_at DESC LIMIT 500');
  return res.rows.map(toDto);
}

export async function createPayment(input: {
  profileId: string;
  userId: string;
  userName: string;
  entityId?: string;
  tier: string;
  amount: number;
  bankName: string;
  senderAccountName: string;
  receiptImageUrl: string;
}): Promise<PaymentDto> {
  const res = await query<PaymentRow>(
    `INSERT INTO payment_receipts
      (profile_id, user_id, user_name, entity_id, tier, amount, bank_name, sender_account_name, receipt_image_url, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending_verification')
     RETURNING *`,
    [
      input.profileId,
      input.userId,
      input.userName,
      input.entityId ?? null,
      input.tier,
      input.amount,
      input.bankName,
      input.senderAccountName,
      input.receiptImageUrl,
    ]
  );
  return toDto(res.rows[0]);
}

export async function verifyPayment(
  id: string,
  action: 'verify' | 'reject',
  adminNotes?: string
): Promise<PaymentDto | undefined> {
  return withTransaction(async (client) => {
    const res = await client.query<PaymentRow>(
      `UPDATE payment_receipts
       SET status = $2, admin_notes = COALESCE($3, admin_notes)
       WHERE id = $1
       RETURNING *`,
      [id, action === 'verify' ? 'verified' : 'rejected', adminNotes ?? null]
    );
    const row = res.rows[0];
    if (!row) return undefined;

    // K2/K3: a verified payment must actually upgrade the member's tier.
    if (action === 'verify' && row.profile_id) {
      const tier = mapPaymentTier(row.tier);
      if (tier) {
        await client.query('UPDATE profiles SET membership_tier = $2 WHERE id = $1', [
          row.profile_id,
          tier,
        ]);
      }
    }

    return toDto(row);
  });
}
