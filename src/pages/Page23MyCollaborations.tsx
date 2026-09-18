import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CollaborationRequest } from '../types';
import {
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  X,
  ShieldCheck,
  Send,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const Page23MyCollaborations: React.FC = () => {
  const { collabRequests, updateCollabStatus, navigateTo, showToast } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeCollab, setActiveCollab] = useState<CollaborationRequest | null>(
    collabRequests[0] || null
  );

  const [checkedDeliverables, setCheckedDeliverables] = useState<Record<string, boolean>>({
    '1x Instagram 4K Reel': true,
    '1x TikTok Cut (9:16)': true,
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([
    'Kak Rini (Kurator): Brief telah disetujui. Tim kreator siap melakukan pengambilan video tanggal 18 September.',
    'Wayan (Brand): Baik Kak, sampel biji kopi arabika cold brew sudah kami kirimkan ke studio Ubud.',
  ]);

  const filtered = collabRequests.filter((c) => {
    if (selectedStatus === 'all') return true;
    return c.status === selectedStatus;
  });

  const toggleDeliverable = (item: string) => {
    setCheckedDeliverables((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
    showToast('Progres deliverable diperbarui!', 'info');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    setChatLog([...chatLog, `Anda: ${chatMessage}`]);
    setChatMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
            <span>PAGE 23 — Manajemen Kolaborasi & Deliverables</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            Kolaborasi Saya (My Collaborations)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pantau progres proyek, checklist deliverables, pencairan rekening escrow, dan komunikasi kurasi.
          </p>
        </div>

        <button
          onClick={() => navigateTo('page-02-directory')}
          className="px-5 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mulai Inisiasi Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-kiri-dark-700 pb-3">
        {['all', 'in_progress', 'matched', 'submitted', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === st
                ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-950 shadow-sm'
                : 'bg-gray-100 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {st === 'all'
              ? 'Semua Proyek'
              : st === 'in_progress'
              ? 'Sedang Berjalan'
              : st === 'matched'
              ? 'Talenta Dikonfirmasi'
              : st === 'submitted'
              ? 'Menunggu Review'
              : 'Selesai'}
          </button>
        ))}
      </div>

      {/* 2-Column Layout: Left Collab List, Right Collab Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Collab Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((collab) => {
            const isSelected = activeCollab?.id === collab.id;
            return (
              <div
                key={collab.id}
                onClick={() => setActiveCollab(collab)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-kiri-ivory-warm dark:bg-kiri-dark-750 border-kiri-gold-500 shadow-elevated'
                    : 'bg-white dark:bg-kiri-dark-800 border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-gray-400 font-bold">
                      {collab.trackingCode}
                    </span>
                    <h3 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white mt-0.5">
                      {collab.title}
                    </h3>
                    <p className="text-xs text-kiri-gold-700 dark:text-kiri-gold-400 font-medium">
                      {collab.category}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    collab.status === 'in_progress'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : collab.status === 'matched'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {collab.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-kiri-dark-700 text-gray-500">
                  <span>Talenta: <strong>{collab.targetName}</strong></span>
                  <span className="font-bold text-kiri-green-950 dark:text-white">{collab.budget}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Collab Detail Drawer */}
        <div className="lg:col-span-7">
          {activeCollab ? (
            <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6 sticky top-24">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-kiri-dark-700 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400">
                      {activeCollab.trackingCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-kiri-gold-500/20 text-kiri-gold-800 dark:text-kiri-gold-300">
                      {activeCollab.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white mt-1">
                    {activeCollab.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pengaju: <strong>{activeCollab.requesterName}</strong> ➔ Talenta: <strong>{activeCollab.targetName}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 uppercase">Nilai Kontrak:</span>
                  <p className="font-serif text-xl font-bold text-kiri-green-900 dark:text-kiri-gold-400">
                    {activeCollab.budget}
                  </p>
                  <p className="text-[10px] text-gray-400">{activeCollab.timeline}</p>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">
                  Brief & Ruang Lingkup:
                </h4>
                <p className="p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-kiri-dark-700">
                  {activeCollab.scope}
                </p>
              </div>

              {/* Interactive Deliverables Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Checklist Deliverables Proyek:</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    Klik untuk centang penyelesaian
                  </span>
                </div>

                <div className="space-y-2">
                  {activeCollab.deliverables.map((item, idx) => {
                    const isDone = checkedDeliverables[item] ?? false;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDeliverable(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                            : 'bg-white dark:bg-kiri-dark-850 border-gray-200 dark:border-kiri-dark-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span>{item}</span>
                        </span>
                        <span className="text-[10px] font-bold">
                          {isDone ? 'SELESAI ✓' : 'MENUNGGU'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Escrow Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">
                      Dana Aman di KIRI Escrow
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Pencairan otomatis setelah seluruh deliverables diverifikasi.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {activeCollab.budget} Terkunci
                </span>
              </div>

              {/* Communication Feed with Kurator & Partner */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-kiri-dark-700">
                <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-kiri-gold-600" />
                  <span>Komunikasi Proyek & Catatan Kurasi:</span>
                </h4>

                <div className="h-40 overflow-y-auto p-3.5 rounded-2xl bg-gray-50 dark:bg-kiri-dark-850 border border-gray-200 dark:border-kiri-dark-700 space-y-2 text-xs">
                  {chatLog.map((msg, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700 text-gray-700 dark:text-gray-300">
                      {msg}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tulis pesan atau update progres..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold text-xs"
                  >
                    Kirim
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-gray-50 dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700">
              Pilih salah satu kolaborasi di sisi kiri untuk melihat rincian lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
