import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Globe,
  Award,
  Layers,
  FileText,
  ArrowRight
} from 'lucide-react';

export const Page07PartnerProfile: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, openCollabModalFor } = useApp();

  const partner =
    entities.find((e) => e.id === selectedEntityId && e.type === 'strategic') ||
    entities.find((e) => e.type === 'strategic') ||
    entities[7];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
        <span>PAGE 07 — Public Strategic Partner Profile</span>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="h-64 sm:h-80 relative overflow-hidden bg-kiri-green-950">
          <img
            src={partner.coverImage}
            alt={partner.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/60 text-kiri-gold-300 backdrop-blur-md border border-kiri-gold-500/40">
            {partner.badge}
          </div>
        </div>

        <div className="p-6 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-4">
            <div className="flex items-end gap-5">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-xl"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
                    {partner.name}
                  </h1>
                  {partner.verified && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                </div>
                <p className="text-sm font-medium text-kiri-gold-700 dark:text-kiri-gold-400">
                  {partner.handle} • {partner.category}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('page-13-register-partner')}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-kiri-dark-600 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
              >
                Ajukan Kemitraan Institusi
              </button>
              <button
                onClick={() => openCollabModalFor(partner)}
                className="px-6 py-2.5 rounded-xl bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400 dark:text-kiri-dark-900" />
                <span>Inisiasi Kerjasama Strategis</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400 mb-2">
                  Peran Strategis Dalam Ekosistem
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                  {partner.bio}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {partner.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-kiri-ivory-warm dark:bg-kiri-dark-750 text-kiri-green-950 dark:text-kiri-ivory border border-gray-200 dark:border-kiri-dark-700 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Strategic Programs */}
              <div className="p-6 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-kiri-gold-600" />
                  <span>Program Kerja Sama Aktif 2026:</span>
                </h4>
                <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  <li className="p-2.5 rounded-lg bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700">
                    <strong>1. Bali UMKM Pilot Acceleration:</strong> Digitalisasi pemasaran 3–5 UMKM percontohan di Bali kuartal akhir 2026.
                  </li>
                  <li className="p-2.5 rounded-lg bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700">
                    <strong>2. Creator Infrastructure & Escrow:</strong> Pengembangan arsitektur transaksi yang transparan dan perlindungan hak cipta talenta kreatif.
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 space-y-3.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white">
                  Data Kemitraan Resmi
                </h4>
                {partner.stats.map((st, i) => (
                  <div key={i} className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-kiri-dark-700">
                    <span className="text-gray-500 dark:text-gray-400">{st.label}</span>
                    <span className="font-bold text-kiri-green-950 dark:text-kiri-gold-300">{st.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
