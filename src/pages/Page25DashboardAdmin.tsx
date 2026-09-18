import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CollaborationRequest } from '../types';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Search,
  Filter,
  X,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react';

export const Page25DashboardAdmin: React.FC = () => {
  const {
    collabRequests,
    updateCollabStatus,
    navigateTo,
    registrations,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [matchingModalCollab, setMatchingModalCollab] = useState<CollaborationRequest | null>(null);

  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [selectedStatusInput, setSelectedStatusInput] = useState<CollaborationRequest['status']>('matched');

  const pendingRegistrationsCount = registrations.filter((r) => r.status === 'pending').length;

  const filteredRequests = collabRequests.filter((req) => {
    const matchesSearch =
      req.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.targetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenMatchingModal = (collab: CollaborationRequest) => {
    setMatchingModalCollab(collab);
    setAdminNoteInput(collab.adminNotes || '');
    setSelectedStatusInput(collab.status);
  };

  const handleSaveMatching = () => {
    if (!matchingModalCollab) return;
    updateCollabStatus(matchingModalCollab.id, selectedStatusInput, adminNoteInput);
    setMatchingModalCollab(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Operations Banner */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 border border-kiri-gold-500/40 shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-gold-500/20 text-kiri-gold-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-kiri-gold-400" />
            <span>PAGE 25 — Pusat Kurasi & Matching Ekosistem</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Admin Dashboard & Request Center
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl font-light">
            Pengawasan alur mediasi resmi KIRI PROJECT: Review Pengajuan ➔ Matching Talenta ➔ Otorisasi Kontrak & Escrow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateTo('page-26-admin-reviews')}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-2"
          >
            <span>Review Pendaftar ({pendingRegistrationsCount} Baru)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateTo('page-27-request-flowchart')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
          >
            Diagram Alur (PAGE 27)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Total Request Masuk</span>
            <FileText className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            {collabRequests.length}
          </p>
          <span className="text-[11px] text-gray-400">Seluruh Ekosistem</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Menunggu Matching</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-600">
            {collabRequests.filter((r) => r.status === 'submitted' || r.status === 'in_review').length}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Perlu Kurasi Kak Rini</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Proyek Aktif Berjalan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            {collabRequests.filter((r) => r.status === 'in_progress').length || 1}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Escrow Terkunci</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Nilai Transaksi</span>
            <DollarSign className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white">
            Rp 14.5M
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Aman di Rekening Bersama</span>
        </div>
      </div>

      {/* Request Center Management Table */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle space-y-4 p-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-kiri-dark-700">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode, nama brand, kreator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Submitted (Baru)</option>
              <option value="in_review">In Review (Kurasi)</option>
              <option value="matched">Matched (Talenta Setuju)</option>
              <option value="connected">Connected (Kickoff)</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-kiri-dark-850 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100 dark:border-kiri-dark-700">
              <tr>
                <th className="p-3 pl-4">Kode Request</th>
                <th className="p-3">Kampanye / Brief</th>
                <th className="p-3">Pengaju (Client)</th>
                <th className="p-3">Talenta Dituju</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Status Saat Ini</th>
                <th className="p-3 pr-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-kiri-dark-700 text-gray-700 dark:text-gray-300">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-kiri-dark-750 transition-colors">
                  <td className="p-3 pl-4 font-mono font-bold text-gray-900 dark:text-white">
                    {req.trackingCode}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-kiri-green-950 dark:text-white">{req.title}</p>
                    <p className="text-[10px] text-gray-400">{req.category}</p>
                  </td>
                  <td className="p-3 font-medium">{req.requesterName}</td>
                  <td className="p-3 font-semibold text-kiri-gold-700 dark:text-kiri-gold-400">
                    {req.targetName}
                  </td>
                  <td className="p-3 font-mono font-bold text-gray-900 dark:text-white">
                    {req.budget}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.status === 'in_progress'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                        : req.status === 'matched'
                        ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                        : req.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <button
                      onClick={() => handleOpenMatchingModal(req)}
                      className="px-3 py-1.5 rounded-lg bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold text-[11px] hover:opacity-90 transition-all shadow-sm"
                    >
                      Kurasi & Matching
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Matching Modal */}
      {matchingModalCollab && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-kiri-green-900/20 dark:border-kiri-gold-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              <div>
                <span className="font-mono text-xs text-gray-400">
                  {matchingModalCollab.trackingCode}
                </span>
                <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white">
                  Fasilitasi Kurasi & Update Status
                </h3>
              </div>
              <button
                onClick={() => setMatchingModalCollab(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 space-y-1">
                <p className="font-bold text-gray-900 dark:text-white">
                  {matchingModalCollab.title}
                </p>
                <p className="text-gray-500">
                  Dari: {matchingModalCollab.requesterName} ➔ Menuju: {matchingModalCollab.targetName}
                </p>
                <p className="font-mono font-bold text-kiri-green-900 dark:text-kiri-gold-400">
                  Budget: {matchingModalCollab.budget} • {matchingModalCollab.timeline}
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Perbarui Status Kolaborasi:</label>
                <select
                  value={selectedStatusInput}
                  onChange={(e) => setSelectedStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 font-bold text-kiri-green-900 dark:text-kiri-gold-400"
                >
                  <option value="submitted">1. Submitted (Baru Diterima)</option>
                  <option value="in_review">2. In Review (Sedang Diteliti Kurator)</option>
                  <option value="matched">3. Matched (Talenta Telah Mengonfirmasi)</option>
                  <option value="connected">4. Connected (Kontrak & Escrow Aktif)</option>
                  <option value="in_progress">5. In Progress (Produksi Berjalan)</option>
                  <option value="completed">6. Completed (Selesai & Dana Cair)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Catatan Kurasi Admin KIRI (Terlihat di Dasbor Pengguna):</label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Kak Rini telah memvalidasi jadwal talenta. Kontrak siap dikirim."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-kiri-dark-700 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMatchingModalCollab(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMatching}
                className="px-5 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold shadow"
              >
                Simpan & Sinkronkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
