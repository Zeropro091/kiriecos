import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Users,
  Building2,
  Newspaper,
  Video,
  ArrowLeft
} from 'lucide-react';

export const Page26AdminReviews: React.FC = () => {
  const { registrations, reviewRegistration, navigateTo } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredRegistrations = registrations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
            <span>PAGE 26 — Antrean Verifikasi Pendaftaran Entitas</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            Admin Registration Review
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kurasi dan verifikasi permohonan bergabung calon kreator, komunitas, dan brand UMKM sebelum dipublikasikan ke direktori.
          </p>
        </div>

        <button
          onClick={() => navigateTo('page-25-dashboard-admin')}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Request Center</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-kiri-dark-700 pb-3">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-950 shadow-sm'
                : 'bg-gray-100 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {tab === 'all' ? 'Semua Permohonan' : tab}
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegistrations.map((app) => (
          <div
            key={app.id}
            className="rounded-3xl p-6 bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-900 dark:text-kiri-gold-400">
                  {app.type}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    app.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                {app.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PIC: <strong>{app.contactPerson}</strong> • 📍 {app.city}
              </p>
              <p className="text-xs text-kiri-gold-700 dark:text-kiri-gold-400 font-medium mt-1">
                Kategori: {app.category}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-kiri-dark-700">
                {app.details}
              </div>

              <div className="mt-3 pt-2 text-xs space-y-1 text-gray-500">
                <p>Email: <span className="font-mono text-gray-800 dark:text-gray-200">{app.email}</span></p>
                <p>WA: <span className="font-mono text-gray-800 dark:text-gray-200">{app.phone}</span></p>
                <p>Kanal: <span className="text-kiri-green-800 dark:text-kiri-gold-400 font-medium">{app.socialLink}</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-kiri-dark-700 flex items-center gap-2">
              {app.status === 'pending' ? (
                <>
                  <button
                    onClick={() => reviewRegistration(app.id, 'rejected')}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => reviewRegistration(app.id, 'approved')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                  >
                    Setujui & Aktifkan
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-xs text-gray-400 font-medium py-1">
                  Keputusan Telah Difinalisasi ({app.status.toUpperCase()})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
