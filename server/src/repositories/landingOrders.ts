import { query } from '../db/pool.js';
import type { LandingPageOrderRow, LandingOrderStatus } from '../types.js';

export interface CreateLandingOrderInput {
  profileId: string;
  templateId: string;
  customNotes: string;
}

export async function createLandingOrder(input: CreateLandingOrderInput): Promise<LandingPageOrderRow> {
  const res = await query<LandingPageOrderRow>(
    `INSERT INTO landing_page_orders (profile_id, template_id, custom_notes)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.profileId, input.templateId, input.customNotes]
  );
  return res.rows[0];
}

export async function listLandingOrdersByProfile(profileId: string): Promise<LandingPageOrderRow[]> {
  const res = await query<LandingPageOrderRow>(
    'SELECT * FROM landing_page_orders WHERE profile_id = $1 ORDER BY created_at DESC, id DESC',
    [profileId]
  );
  return res.rows;
}

export async function listLandingOrders(status?: LandingOrderStatus): Promise<LandingPageOrderRow[]> {
  if (status) {
    const res = await query<LandingPageOrderRow>(
      'SELECT * FROM landing_page_orders WHERE status = $1 ORDER BY created_at DESC, id DESC',
      [status]
    );
    return res.rows;
  }
  const res = await query<LandingPageOrderRow>(
    'SELECT * FROM landing_page_orders ORDER BY created_at DESC, id DESC'
  );
  return res.rows;
}

export interface UpdateLandingOrderInput {
  id: number;
  status?: LandingOrderStatus;
  adminNote?: string;
}

export async function updateLandingOrder(
  input: UpdateLandingOrderInput
): Promise<LandingPageOrderRow | undefined> {
  const res = await query<LandingPageOrderRow>(
    `UPDATE landing_page_orders
     SET
       status = COALESCE($2, status),
       admin_note = COALESCE($3, admin_note),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [input.id, input.status ?? null, input.adminNote ?? null]
  );
  return res.rows[0];
}
