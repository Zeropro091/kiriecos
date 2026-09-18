import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Copy,
  ExternalLink,
  Layers,
  FileCheck2
} from 'lucide-react';

export const Page22CollabSuccess: React.FC = () => {
  const { collabRequests, selectedCollabId, navigateTo, updateCollabStatus, showToast } = useApp();

  const currentCollab =
    collabRequests.find((r) => r.id === selectedCollabId) || collabRequests[0];

  const steps = [
    { id: 'submitted', title: 'Submitted', label: 'Brief Diterima', desc: 'Brief masuk antrean kurasi KIRI Project' },
    { id: 'in_review', title: 'In Review', label: 'Kurasi Admin', desc: 'Kak Rini & Tim menelaah kesesuaian brief' },
    { id: 'matched', title: 'Matched', label: 'Konfirmasi Talenta', desc: 'Talenta menyetujui jadwal dan nilai proyek' },
    { id: 'connected', title: 'Connected', label: 'Kickoff & Escrow', desc: 'Kontrak digital ditandatangani & dana diamankan' },
    { id: 'in_progress', title: 'In Progress', label: 'Produksi Konten', desc: 'Kreator memproduksi deliverables sesuai jadwal' },
    { id: 'completed', title: 'Completed', label: 'Selesai & Dampak', desc: 'Karya disetujui, dana cair, laporan terbit' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentCollab.status);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCollab.trackingCode);
    showToast('Kode pelacakan disalin ke clipboard!', 'info');
  };

  const handleSimulateNextStage = () => {
    const nextIndex = Math.min(activeIndex + 1, steps.length - 1);
    const nextStatus = steps[nextIndex].id as any;
    updateCollabStatus(
      currentCollab.id,
      nextStatus,
      `Tahap diperbarui menjadi: ${steps[nextIndex].label} oleh Tim KIRI.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PAGE 22 — Konfirmasi & Pelacakan Status Kolaborasi</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white">
          Permintaan Kolaborasi Berhasil Diajukan!
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Brief proyek Anda telah tersimpan di sistem terpusat KIRI PROJECT.
        </p>
      </div>

      {/* Confirmation Tracking Card */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 border border-kiri-gold-500/40 shadow-elevated space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-kiri-gold-300 tracking-wider">
              Kode Pelacakan Resmi:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-2xl font-bold text-white tracking-wide">
                {currentCollab.trackingCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-kiri-gold-300 transition-all"
                title="Salin Kode"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-gray-400 uppercase">Nilai Proyek:</span>
            <p className="font-serif text-2xl font-bold text-kiri-gold-400">{currentCollab.budget}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Judul Kampanye:</span>
            <p className="font-bold text-white mt-0.5">{currentCollab.title}</p>
          </div>
          <div>
            <span className="text-gray-400">Talenta Target:</span>
            <p className="font-bold text-white mt-0.5">{currentCollab.targetName}</p>
          </div>
          <div>
            <span className="text-gray-400">Timeline Eksekusi:</span>
            <p className="font-bold text-white mt-0.5">{currentCollab.timeline}</p>
          </div>
        </div>
      </div>

      {/* Interactive 5-Stage Stepper Visualizer */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
              Status Alur Ekosistem (Live Stepper)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Proses mediasi terstruktur KIRI PROJECT dari submission hingga delivery
            </p>
          </div>

          <button
            onClick={handleSimulateNextStage}
            className="px-3.5 py-1.5 rounded-lg bg-kiri-gold-500/20 hover:bg-kiri-gold-500/30 text-kiri-green-900 dark:text-kiri-gold-300 font-bold text-xs border border-kiri-gold-500/40 transition-all"
            title="Klik untuk mensimulasikan langkah berikutnya"
          >
            ⚡ Simulasikan Progres Berikutnya
          </button>
        </div>

        {/* Stepper Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {steps.map((st, idx) => {
            const isPassed = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-kiri-green-50 dark:bg-kiri-dark-750 border-kiri-green-800 dark:border-kiri-gold-500 shadow-sm'
                    : isPassed
                    ? 'bg-white dark:bg-kiri-dark-850 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300'
                    : 'bg-gray-50 dark:bg-kiri-dark-850 border-gray-200 dark:border-kiri-dark-700 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-950'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-kiri-dark-700 text-gray-500'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-kiri-gold-500 animate-ping"></span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white">
                    {st.label}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Review Note Box */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 text-xs space-y-1">
          <p className="font-bold text-kiri-green-950 dark:text-white">Catatan Kurasi Admin KIRI Terkini:</p>
          <p className="text-gray-600 dark:text-gray-300">
            {currentCollab.adminNotes || 'Permintaan baru masuk. Menunggu verifikasi tim kurasi KIRI Project.'}
          </p>
        </div>
      </div>

      {/* Bottom Nav Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={() => navigateTo('page-02-directory')}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-kiri-dark-600 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
        >
          ← Kembali ke Direktori
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('page-25-dashboard-admin')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
          >
            Review di Admin Center (PAGE 25)
          </button>
          <button
            onClick={() => navigateTo('page-23-my-collaborations')}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
          >
            <span>Buka Halaman Kolaborasi Saya (PAGE 23)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
