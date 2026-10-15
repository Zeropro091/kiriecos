import { query } from '../db/pool.js';
import type { PaymentStatus } from '../types.js';

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
  const res = await query<PaymentRow>(
    `UPDATE payment_receipts
     SET status = $2, admin_notes = COALESCE($3, admin_notes)
     WHERE id = $1
     RETURNING *`,
    [id, action === 'verify' ? 'verified' : 'rejected', adminNotes ?? null]
  );
  return res.rows[0] ? toDto(res.rows[0]) : undefined;
}
