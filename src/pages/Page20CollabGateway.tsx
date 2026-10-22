import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  FileText,
  Users,
  Compass
} from 'lucide-react';

export const Page20CollabGateway: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, openCollabModalFor } = useApp();

  // S2: no arbitrary "first entity" fallback — ask the user to pick a target.
  const targetEntity = entities.find((e) => e.id === selectedEntityId);

  if (!targetEntity) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white">
          Target kolaborasi belum dipilih
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pilih dulu entitas atau talenta yang ingin Anda ajak kolaborasi dari direktori KIRI.
        </p>
        <button
          onClick={() => navigateTo('page-02-directory')}
          className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90"
        >
          Buka Direktori
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white">
          Request Through KIRI Project
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Setiap kolaborasi di ekosistem KIRI PROJECT melalui kurasi brief terpusat untuk menjamin kejelasan brief, verifikasi pembayaran, dan output profesional.
        </p>
      </div>

      {/* Target Preview */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={targetEntity.avatar}
            alt={targetEntity.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-kiri-gold-500/40 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-900 dark:text-kiri-gold-400">
                Target Kolaborasi
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white mt-1">
              {targetEntity.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {targetEntity.handle} • {targetEntity.category} • 📍 {targetEntity.location}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('page-02-directory')}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 shrink-0"
        >
          Ganti Target Entitas
        </button>
      </div>

      {/* Why Request Through KIRI Project? (Core Rules Guarantee) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white">
            1. Kurasi & Verifikasi Tim Admin
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Scope of work, batas revisi, hak cipta komersial, dan hak penayangan dikunci dalam klausul resmi yang mengikat kedua belah pihak.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white">
            2. Pembayaran Terverifikasi Admin
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Dana kampanye aman di rekening penampung KIRI PROJECT. Dana hanya diteruskan kepada kreator setelah hasil kerja disetujui.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white">
            3. Pendampingan Kurator KIRI
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Kak Rini & Tim Kurasi KIRI mengawal brief Anda dari awal hingga pelaporan akhir dampak komersial kampanye.
          </p>
        </div>
      </div>

      {/* CTA to Form */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white">
            Siap Memulai Kolaborasi?
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Langkah selanjutnya: Lengkapi formulir brief proyek terstruktur.
          </p>
        </div>
        <button
          onClick={() => navigateTo('page-21-collab-brief-form', targetEntity.id)}
          className="px-8 py-3.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 shrink-0 transition-all"
        >
          <span>Lanjut ke Formulir Brief Proyek</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
