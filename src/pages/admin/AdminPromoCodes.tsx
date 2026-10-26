import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Tag,
  Plus,
  Loader2,
  Trash2,
  Power,
  Gift,
  Percent,
  Banknote,
  Users,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  createPromoCode,
  deletePromoCode,
  fetchPromoCodes,
  fetchRedemptions,
  updatePromoCode,
  formatRupiah,
  type AdminPromoCode,
  type AdminPromoRedemption,
} from '../../lib/promos';

/**
 * Admin Promo Codes — buat & kelola kode voucher keanggotaan.
 * Jenis: percent (potongan %), fixed (potongan nominal), free (akses gratis 100%).
 * Kode `free`/`percent 100` langsung mengaktifkan keanggotaan tanpa pembayaran.
 */

type DiscountType = 'percent' | 'fixed' | 'free';

const typeLabel = (t: DiscountType) =>
  t === 'percent' ? 'Potongan %' : t === 'fixed' ? 'Potongan Rp' : 'Gratis 100%';

const typeIcon = (t: DiscountType) =>
  t === 'percent' ? Percent : t === 'fixed' ? Banknote : Gift;

export const AdminPromoCodes: React.FC = () => {
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<AdminPromoRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // form
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [track, setTrack] = useState<'any' | 'creator' | 'business'>('any');
  const [tierScope, setTierScope] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('1');
  const [validUntil, setValidUntil] = useState('');
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, reds] = await Promise.all([fetchPromoCodes(), fetchRedemptions()]);
      setPromos(list);
      setRedemptions(reds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat kode promo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const active = promos.filter((p) => p.active).length;
    const used = promos.reduce((sum, p) => sum + p.usedCount, 0);
    return { active, total: promos.length, used };
  }, [promos]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3) {
      setFormMsg({ kind: 'err', text: 'Kode minimal 3 karakter.' });
      return;
    }
    const value = discountType === 'free' ? 0 : Number(discountValue);
    if (discountType !== 'free' && (!Number.isFinite(value) || value <= 0)) {
      setFormMsg({ kind: 'err', text: 'Nilai potongan harus lebih dari 0.' });
      return;
    }
    if (discountType === 'percent' && value > 100) {
      setFormMsg({ kind: 'err', text: 'Potongan persen maksimal 100%.' });
      return;
    }

    setCreating(true);
    try {
      await createPromoCode({
        code: cleanCode,
        description: description.trim() || undefined,
        discountType,
        discountValue: value,
        track,
        tierScope: tierScope.trim() || null,
        maxUses: maxUses.trim() ? Number(maxUses) : null,
        maxUsesPerUser: maxUsesPerUser.trim() ? Number(maxUsesPerUser) : 1,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      });
      setFormMsg({ kind: 'ok', text: `Kode ${cleanCode} berhasil dibuat.` });
      setCode('');
      setDescription('');
      await load();
    } catch (err) {
      setFormMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Gagal membuat kode promo.' });
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (promo: AdminPromoCode) => {
    setBusyId(promo.id);
    try {
      const updated = await updatePromoCode(promo.id, { active: !promo.active });
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status kode.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (promo: AdminPromoCode) => {
    if (!window.confirm(`Hapus kode ${promo.code}? Riwayat pemakaiannya juga ikut terhapus.`)) return;
    setBusyId(promo.id);
    try {
      await deletePromoCode(promo.id);
      setPromos((prev) => prev.filter((p) => p.id !== promo.id));
      setRedemptions((prev) => prev.filter((r) => r.code !== promo.code));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kode.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Kode', value: stats.total, icon: Tag },
          { label: 'Kode Aktif', value: stats.active, icon: CheckCircle2 },
          { label: 'Total Pemakaian', value: stats.used, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="p-5 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700"
          >
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-medium uppercase">{label}</span>
              <Icon className="w-4 h-4 text-kiri-gold-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* Form buat kode */}
        <form
          onSubmit={submit}
          className="xl:col-span-2 p-5 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-kiri-gold-500/15 text-kiri-gold-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">Buat Kode Baru</h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Kode</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9._-]/g, ''))}
              placeholder="KIRI2026"
              spellCheck={false}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm font-mono tracking-wider text-kiri-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-kiri-gold-500/40"
            />
            <p className="text-[11px] text-gray-400">Huruf besar/angka. Tidak peka huruf besar-kecil saat dipakai.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Jenis Potongan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['percent', 'fixed', 'free'] as DiscountType[]).map((t) => {
                const Icon = typeIcon(t);
                const active = discountType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiscountType(t)}
                    className={`px-2 py-2 rounded-xl text-[11px] font-bold border flex flex-col items-center gap-1 transition-all ${
                      active
                        ? 'bg-kiri-green-900 text-white border-kiri-green-900 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 dark:border-kiri-gold-500'
                        : 'bg-gray-50 dark:bg-kiri-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-kiri-dark-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-center leading-tight">{typeLabel(t)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {discountType !== 'free' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                {discountType === 'percent' ? 'Besar Potongan (%)' : 'Potongan (Rp)'}
              </label>
              <input
                type="number"
                min={1}
                max={discountType === 'percent' ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-kiri-gold-500/40"
              />
            </div>
          )}

          {discountType === 'free' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300">
              <Gift className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Pemakai kode ini langsung jadi member aktif tanpa transfer dan tanpa verifikasi admin.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Berlaku Untuk</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as typeof track)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
              >
                <option value="any">Semua</option>
                <option value="creator">Creator</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Paket (opsional)</label>
              <input
                value={tierScope}
                onChange={(e) => setTierScope(e.target.value.toLowerCase())}
                placeholder="exclusive,platinum"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Kuota total</label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Tanpa batas"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Per member</label>
              <input
                type="number"
                min={1}
                value={maxUsesPerUser}
                onChange={(e) => setMaxUsesPerUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Berlaku sampai (opsional)</label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Catatan (opsional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Promo launching komunitas"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 bg-white dark:bg-kiri-dark-900 text-sm text-kiri-green-950 dark:text-white focus:outline-none"
            />
          </div>

          {formMsg && (
            <p
              className={`text-[11px] flex items-start gap-1.5 ${
                formMsg.kind === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formMsg.kind === 'ok' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
              )}
              <span>{formMsg.text}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 rounded-xl bg-kiri-green-900 hover:bg-kiri-green-800 dark:bg-kiri-gold-500 dark:hover:bg-kiri-gold-400 text-white dark:text-kiri-dark-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{creating ? 'Menyimpan...' : 'Buat Kode Promo'}</span>
          </button>
        </form>

        {/* Daftar kode */}
        <div className="xl:col-span-3 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-kiri-dark-700">
            <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">Daftar Kode</h3>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="text-[11px] font-semibold text-gray-500 hover:text-kiri-gold-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Muat ulang
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat…
            </div>
          ) : promos.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Belum ada kode promo. Buat yang pertama di formulir sebelah.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-kiri-dark-900 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Kode</th>
                    <th className="px-4 py-2.5 font-semibold">Potongan</th>
                    <th className="px-4 py-2.5 font-semibold">Kuota</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-kiri-dark-700">
                  {promos.map((p) => {
                    const Icon = typeIcon(p.discountType);
                    const expired = p.validUntil ? new Date(p.validUntil).getTime() < Date.now() : false;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-kiri-dark-750/40">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-kiri-green-950 dark:text-white tracking-wider">
                            {p.code}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {p.track === 'any' ? 'Semua track' : p.track}
                            {p.tierScope ? ` · ${p.tierScope}` : ''}
                            {p.description ? ` · ${p.description}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-kiri-green-900 dark:text-kiri-gold-300">
                            <Icon className="w-3.5 h-3.5" />
                            {p.discountType === 'free'
                              ? 'Gratis'
                              : p.discountType === 'percent'
                                ? `${p.discountValue}%`
                                : formatRupiah(p.discountValue)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {p.usedCount}
                          {p.maxUses !== null ? ` / ${p.maxUses}` : ' / ∞'}
                          <div className="text-[10px] text-gray-400">maks {p.maxUsesPerUser}/member</div>
                        </td>
                        <td className="px-4 py-3">
                          {!p.active ? (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-kiri-dark-900 text-gray-500 text-[10px] font-bold">
                              Nonaktif
                            </span>
                          ) : expired ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              Kedaluwarsa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              Aktif
                            </span>
                          )}
                          {p.validUntil && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              s.d. {new Date(p.validUntil).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => void toggle(p)}
                              disabled={busyId === p.id}
                              title={p.active ? 'Nonaktifkan' : 'Aktifkan'}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-kiri-gold-700 hover:bg-gray-100 dark:hover:bg-kiri-dark-900 disabled:opacity-40"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => void remove(p)}
                              disabled={busyId === p.id}
                              title="Hapus"
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat pemakaian */}
      <div className="rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-kiri-dark-700">
          <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">Riwayat Pemakaian</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">200 pemakaian terakhir</p>
        </div>
        {redemptions.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">Belum ada kode promo yang dipakai.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-kiri-dark-900 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Kode</th>
                  <th className="px-4 py-2.5 font-semibold">Member</th>
                  <th className="px-4 py-2.5 font-semibold">Paket</th>
                  <th className="px-4 py-2.5 font-semibold">Harga</th>
                  <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-kiri-dark-700">
                {redemptions.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-mono font-bold text-kiri-green-950 dark:text-white">{r.code}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      {r.member_name ?? '—'}
                      <div className="text-[10px] text-gray-400">{r.member_email ?? ''}</div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      {r.track}:{r.tier}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      <span className="line-through text-gray-400 mr-1.5">{formatRupiah(r.amount_before)}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(r.amount_after)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {new Date(r.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
