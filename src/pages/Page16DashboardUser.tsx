import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  Eye,
  MessageSquare,
  FileCheck2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Page16DashboardUser: React.FC = () => {
  const { currentUser, collabRequests, navigateTo, openCollabModalFor, entities } = useApp();

  const userCollabs = collabRequests.filter(
    (req) => req.targetId === currentUser?.entityId || req.requesterId === currentUser?.entityId
  );

  const creatorEntity = entities.find((e) => e.id === currentUser?.entityId) || entities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 sm:p-10 border border-kiri-gold-500/30 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={currentUser?.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-kiri-gold-400 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {currentUser?.name || 'Raka Dewantara'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-kiri-gold-500 text-kiri-dark-950">
                {currentUser?.membershipTier || 'Creator Pro'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Akun Privat Terverifikasi KIRI PROJECT • ID: KP-USR-2026-041
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-kiri-gold-300">
              <span>Kekuatan Profil: <strong>88%</strong> (Lengkap)</span>
              <span>•</span>
              <button
                onClick={() => navigateTo('page-04-creator-profile', creatorEntity.id)}
                className="underline hover:text-white flex items-center gap-1"
              >
                Lihat Tampilan Publik <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigateTo('page-17-profile-editor')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
          >
            Edit Profil & Portofolio
          </button>
          <button
            onClick={() => navigateTo('page-02-directory')}
            className="px-5 py-2.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eksplor Kolaborasi</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Kunjungan Profil</span>
            <Eye className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
            1.420
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">↑ +24% bulan ini</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Permintaan Masuk</span>
            <MessageSquare className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
            {userCollabs.length} Brief
          </p>
          <span className="text-[11px] text-gray-400">Terkurasi via KIRI</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Proyek Berjalan</span>
            <FileCheck2 className="w-4 h-4 text-kiri-green-700 dark:text-kiri-green-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
            {userCollabs.filter((c) => c.status === 'in_progress').length || 1} Proyek
          </p>
          <span className="text-[11px] text-amber-600 font-medium">1 deliverable minggu ini</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Estimasi Revenue</span>
            <DollarSign className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
            Rp 10.5M
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Terlindungi Escrow</span>
        </div>
      </div>

      {/* Main Dashboard Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Collaborations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                Status Kolaborasi Aktif Anda
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Semua proyek diawasi langsung oleh tim kurasi KIRI PROJECT
              </p>
            </div>
            <button
              onClick={() => navigateTo('page-23-my-collaborations')}
              className="text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua (PAGE 23)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {userCollabs.slice(0, 3).map((collab) => (
              <div
                key={collab.id}
                className="p-5 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400 font-bold">
                        {collab.trackingCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        collab.status === 'in_progress'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : collab.status === 'matched'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {collab.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white mt-1">
                      {collab.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Partner: <strong>{collab.requesterName}</strong> • Kategori: {collab.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-xs text-kiri-green-900 dark:text-kiri-gold-400">
                      {collab.budget}
                    </p>
                    <p className="text-[10px] text-gray-400">{collab.timeline}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                  <span>{collab.adminNotes || 'Brief disetujui kurator KIRI.'}</span>
                  <button
                    onClick={() => navigateTo('page-23-my-collaborations')}
                    className="font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline shrink-0 ml-3"
                  >
                    Detail Brief →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Ecosystem Notices */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white">
              Aksi Cepat Dasbor
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => navigateTo('page-17-profile-editor')}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 hover:bg-gray-100 dark:hover:bg-kiri-dark-700 text-left font-medium text-gray-800 dark:text-gray-200 flex items-center justify-between transition-all"
              >
                <span>Perbarui Rate Card & Layanan</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => navigateTo('page-02-directory')}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 hover:bg-gray-100 dark:hover:bg-kiri-dark-700 text-left font-medium text-gray-800 dark:text-gray-200 flex items-center justify-between transition-all"
              >
                <span>Cari Mitra Brand / UMKM</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => navigateTo('page-27-request-flowchart')}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 hover:bg-gray-100 dark:hover:bg-kiri-dark-700 text-left font-medium text-gray-800 dark:text-gray-200 flex items-center justify-between transition-all"
              >
                <span>Simulasi Alur Proyek KIRI</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Agenda KIRI Academy Notice */}
          <div className="p-6 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-800 border border-kiri-gold-500/30 space-y-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-kiri-gold-500 text-kiri-dark-950 uppercase">
              Agenda KIRI Academy
            </span>
            <h4 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white">
              Workshop: Standar Rate Card & Kontrak Hak Cipta Kreator Bali
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Jumat, 25 September 2026 • Bersama Kak Rini & DGT Team di Denpasar Creative Hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
