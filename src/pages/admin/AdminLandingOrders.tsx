import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import {
  AdminLandingOrder,
  LANDING_ORDER_STATUSES,
  LANDING_ORDER_STATUS_LABELS,
  fetchAdminLandingOrders,
  formatDate,
} from '../../lib/adminInbox';

/**
 * Admin Landing Page Orders — table of /api/landing-orders with status filter,
 * per-row status select and editable admin_note (PATCH /api/landing-orders/:id).
 * Row-level save state: idle | saving | saved | error.
 */

type OrderFilter = 'all' | 'pending' | 'in_review' | 'in_progress' | 'done' | 'rejected';

type RowState = 'idle' | 'saving' | 'saved' | 'error';

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'rejected', label: 'Rejected' },
];

const statusPill = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300';
    case 'in_review':
      return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300';
    case 'in_progress':
      return 'bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300';
    case 'done':
      return 'bg-emerald-100 text-emerald-800';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const AdminLandingOrders: React.FC<{ onOrdersRefreshed?: (orders: AdminLandingOrder[]) => void }> = ({
  onOrdersRefreshed,
}) => {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<AdminLandingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>('pending');
  const [draftNote, setDraftNote] = useState('');
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const setRowState = (id: string, state: RowState) =>
    setRowStates((prev) => ({ ...prev, [id]: state }));

  const loadOrders = useCallback(
    async (initial: boolean) => {
      if (initial) setLoading(true);
      try {
        const list = await fetchAdminLandingOrders(api);
        setOrders(list);
        onOrdersRefreshed?.(list);
      } catch {
        if (initial) showToast('Gagal memuat pesanan landing page.', 'error');
      } finally {
        if (initial) setLoading(false);
      }
    },
    [onOrdersRefreshed, showToast]
  );

  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  const startEdit = (order: AdminLandingOrder) => {
    setEditingId(String(order.id));
    setDraftStatus(String(order.status));
    setDraftNote(order.admin_note || '');
    setRowState(String(order.id), 'idle');
  };

  const saveEdit = async (order: AdminLandingOrder) => {
    const id = String(order.id);
    setRowState(id, 'saving');
    try {
      const updated = await api.patch<AdminLandingOrder>(`/landing-orders/${encodeURIComponent(id)}`, {
        status: draftStatus,
        admin_note: draftNote,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: updated?.status ?? draftStatus,
                admin_note: updated?.admin_note ?? draftNote,
              }
            : o
        )
      );
      setRowState(id, 'saved');
      setEditingId(null);
      onOrdersRefreshed?.(
        orders.map((o) =>
          o.id === order.id ? { ...o, status: updated?.status ?? draftStatus, admin_note: updated?.admin_note ?? draftNote } : o
        )
      );
      showToast('Perubahan pesanan tersimpan.', 'success');
      setTimeout(() => setRowStates((prev) => ({ ...prev, [id]: 'idle' })), 2500);
    } catch {
      setRowState(id, 'error');
      showToast('Gagal menyimpan perubahan pesanan.', 'error');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => String(o.status) === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">
            Pesanan Landing Page
          </h3>
          <p className="text-[10px] text-gray-400">
            Kelola status & catatan admin untuk setiap pesanan template.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderFilter)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-kiri-dark-850 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100 dark:border-kiri-dark-700">
              <tr>
                <th className="p-3 pl-4">Template</th>
                <th className="p-3">Catatan Member</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4">Catatan Admin</th>
                <th className="p-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-kiri-dark-700 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-kiri-gold-500 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Belum ada pesanan landing page.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const id = String(order.id);
                  const editing = editingId === id;
                  const state = rowStates[id] ?? 'idle';
                  return (
                    <tr key={id} className="hover:bg-gray-50/50 dark:hover:bg-kiri-dark-750 transition-colors align-top">
                      <td className="p-3 pl-4 font-mono font-bold text-gray-900 dark:text-white">
                        {order.template_id}
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <p className="whitespace-pre-wrap break-words text-gray-600 dark:text-gray-300">
                          {order.custom_notes || <span className="text-gray-400">—</span>}
                        </p>
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="p-3">
                        {editing ? (
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-[11px] font-bold text-kiri-green-900 dark:text-kiri-gold-400 focus:outline-none"
                          >
                            {LANDING_ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {LANDING_ORDER_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusPill(String(order.status))}`}>
                            {String(order.status).replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 pr-4 min-w-[180px]">
                        {editing ? (
                          <textarea
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            rows={2}
                            placeholder="Catatan internal admin…"
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-[11px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-kiri-gold-500 resize-y"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-gray-600 dark:text-gray-300">
                            {order.admin_note || <span className="text-gray-400">—</span>}
                          </p>
                        )}
                      </td>
                      <td className="p-3 pr-4 text-right whitespace-nowrap">
                        {editing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setRowState(id, 'idle');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-kiri-dark-700 text-[11px] font-semibold"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => saveEdit(order)}
                              disabled={state === 'saving'}
                              className="px-3 py-1.5 rounded-lg bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-[11px] font-bold disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {state === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
                              Simpan
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {state === 'saved' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
                              </span>
                            )}
                            {state === 'error' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                                <XCircle className="w-3.5 h-3.5" /> Gagal
                              </span>
                            )}
                            <button
                              onClick={() => startEdit(order)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-kiri-dark-700 text-[11px] font-semibold hover:bg-gray-100 dark:hover:bg-kiri-dark-750 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
