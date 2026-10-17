/**
 * KIRI PROJECT — Admin inbox helpers.
 *
 * Types + normalizers for the admin-only chat inbox and landing-page order
 * management sections on Page25. The backend may return either a bare array
 * or an object wrapper ({ threads: [...] } / { orders: [...] } /
 * { messages: [...] }); these helpers accept both shapes so the UI never
 * crashes on a slightly different payload.
 */

export interface AdminChatThread {
  /** Profile id used for GET /chat/threads/:profileId and POST /chat/messages. */
  profileId: string;
  name: string;
  email: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt?: string;
}

export interface AdminChatMessage {
  id: number | string;
  body: string;
  senderRole: string;
  senderName?: string;
  createdAt?: string;
}

export type LandingOrderStatus =
  | 'pending'
  | 'in_review'
  | 'in_progress'
  | 'done'
  | 'rejected';

export const LANDING_ORDER_STATUSES: LandingOrderStatus[] = [
  'pending',
  'in_review',
  'in_progress',
  'done',
  'rejected',
];

export const LANDING_ORDER_STATUS_LABELS: Record<LandingOrderStatus, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  in_progress: 'In Progress',
  done: 'Done',
  rejected: 'Rejected',
};

export interface AdminLandingOrder {
  id: number | string;
  template_id: string;
  custom_notes?: string;
  admin_note?: string;
  status: LandingOrderStatus | string;
  created_at?: string;
}

const pick = (obj: any, ...keys: string[]): any => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return undefined;
};

const asArray = <T,>(res: unknown, listKey: string): T[] => {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object') {
    const inner = (res as Record<string, unknown>)[listKey];
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
};

export const normalizeThread = (raw: any): AdminChatThread => ({
  profileId: String(pick(raw, 'profile_id', 'profileId', 'thread_profile_id', 'id') ?? ''),
  name: String(pick(raw, 'name', 'member_name', 'full_name') ?? 'Tanpa Nama'),
  email: String(pick(raw, 'email', 'member_email') ?? ''),
  lastMessage: String(pick(raw, 'last_message', 'lastMessage', 'last_message_preview', 'preview') ?? ''),
  unreadCount: Number(pick(raw, 'unread_count', 'unreadCount') ?? 0) || 0,
  updatedAt: pick(raw, 'updated_at', 'last_message_at', 'lastActivityAt', 'created_at'),
});

export const normalizeMessage = (raw: any): AdminChatMessage => ({
  id: pick(raw, 'id', 'message_id') ?? Math.random().toString(36).slice(2),
  body: String(raw?.body ?? ''),
  senderRole: String(pick(raw, 'sender_role', 'role', 'sender') ?? ''),
  senderName: pick(raw, 'sender_name', 'senderName'),
  createdAt: pick(raw, 'created_at', 'createdAt'),
});

export const normalizeLandingOrder = (raw: any): AdminLandingOrder => ({
  id: pick(raw, 'id', 'order_id') ?? '',
  template_id: String(raw?.template_id ?? ''),
  custom_notes: pick(raw, 'custom_notes', 'customNotes'),
  admin_note: pick(raw, 'admin_note', 'adminNote'),
  status: String(raw?.status ?? 'pending'),
  created_at: pick(raw, 'created_at', 'createdAt'),
});

export const isAdminMessage = (m: AdminChatMessage): boolean =>
  m.senderRole.toLowerCase().includes('admin');

export const formatDateTime = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
};

export const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ---------- Fetchers ---------- */

export const fetchAdminChatThreads = async (
  api: { get: <T>(path: string) => Promise<T> }
): Promise<AdminChatThread[]> => {
  const res = await api.get<unknown>('/chat/threads');
  return asArray<any>(res, 'threads').map(normalizeThread);
};

export const fetchAdminThreadMessages = async (
  api: { get: <T>(path: string) => Promise<T> },
  profileId: string
): Promise<AdminChatMessage[]> => {
  const res = await api.get<unknown>(`/chat/threads/${encodeURIComponent(profileId)}`);
  return asArray<any>(res, 'messages').map(normalizeMessage);
};

export const fetchAdminLandingOrders = async (
  api: { get: <T>(path: string) => Promise<T> }
): Promise<AdminLandingOrder[]> => {
  const res = await api.get<unknown>('/landing-orders');
  return asArray<any>(res, 'orders').map(normalizeLandingOrder);
};
