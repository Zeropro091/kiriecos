import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  MapPin,
  Instagram,
  Youtube,
  Globe,
  Share2,
  Star,
  Eye,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Page04CreatorProfile: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, openCollabModalFor } = useApp();

  const creator =
    entities.find((e) => e.id === selectedEntityId && e.type === 'creator') ||
    entities.find((e) => e.type === 'creator') ||
    entities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
        <span>PAGE 04 — Public Creator Profile & Portfolio</span>
      </div>

      {/* Cover & Creator Header */}
      <div className="rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="h-64 sm:h-80 relative overflow-hidden bg-kiri-green-950">
          <img
            src={creator.coverImage}
            alt={creator.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/60 text-kiri-gold-300 backdrop-blur-md border border-kiri-gold-500/40 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-kiri-gold-400 fill-kiri-gold-400" />
            <span>{creator.badge}</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-4">
            <div className="flex items-end gap-5">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-xl"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
                    {creator.name}
                  </h1>
                  {creator.verified && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                </div>
                <p className="text-sm font-medium text-kiri-gold-700 dark:text-kiri-gold-400">
                  {creator.handle} • {creator.category}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('page-17-profile-editor')}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-kiri-dark-600 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
              >
                Edit Profil Saya
              </button>
              <button
                onClick={() => openCollabModalFor(creator)}
                className="px-6 py-2.5 rounded-xl bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400 dark:text-kiri-dark-900" />
                <span>Request Through KIRI Project</span>
              </button>
            </div>
          </div>

          {/* Bio and Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400 mb-2">
                  Biografi & Pendekatan Kreatif
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                  {creator.bio}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {creator.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-kiri-ivory-warm dark:bg-kiri-dark-750 text-kiri-green-950 dark:text-kiri-ivory border border-gray-200 dark:border-kiri-dark-700 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Looking For Collaborations */}
              {creator.lookingFor && (
                <div className="p-4 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-750 border border-kiri-green-200 dark:border-kiri-dark-700">
                  <h4 className="text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-300 uppercase tracking-wider mb-2">
                    🎯 Terbuka Untuk Proyek:
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    {creator.lookingFor.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-kiri-green-700 dark:text-kiri-gold-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar Stats & Verification */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 space-y-3.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white">
                  Metrik Audiens Terverifikasi
                </h4>
                {creator.stats.map((st, i) => (
                  <div key={i} className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-kiri-dark-700">
                    <span className="text-gray-500 dark:text-gray-400">{st.label}</span>
                    <span className="font-bold text-kiri-green-950 dark:text-kiri-gold-300">{st.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-kiri-dark-700">
                  <span className="text-gray-500 dark:text-gray-400">Domisili</span>
                  <span className="font-bold text-kiri-green-950 dark:text-white">{creator.location}</span>
                </div>
              </div>

              {/* Escrow Guarantee Box */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Jaminan KIRI Escrow</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                  Semua transaksi proyek dengan kreator ini dilindungi oleh kontrak digital dan sistem pembayaran aman KIRI PROJECT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services & Rate Cards */}
      {creator.services && creator.services.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white">
                Paket Layanan & Rate Card Resmi
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tarif terstandardisasi untuk kampanye brand & UMKM
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creator.services.map((srv) => (
              <div
                key={srv.id}
                className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 transition-all flex flex-col justify-between shadow-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white">
                      {srv.name}
                    </h4>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-950 dark:text-kiri-gold-400 shrink-0">
                      {srv.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {srv.description}
                  </p>
                  <div className="space-y-1.5 border-t border-gray-100 dark:border-kiri-dark-700 pt-3">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Deliverables Termasuk:</p>
                    {srv.deliverables.map((d, i) => (
                      <div key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-kiri-green-700 dark:text-kiri-gold-400 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
                  <button
                    onClick={() => openCollabModalFor(creator)}
                    className="w-full py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Pilih Paket Ini (Request Through KIRI)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {creator.portfolio && creator.portfolio.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white">
              Portofolio & Karya Terpilih
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dokumentasi kampanye visual komersial yang telah selesai dikerjakan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creator.portfolio.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle group"
              >
                <div className="aspect-video relative overflow-hidden bg-gray-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-white/90 text-kiri-green-950 text-xs font-bold">
                      Lihat Detail Karya
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="capitalize">{item.type}</span>
                    {item.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-kiri-gold-600" />
                        {item.views} Views
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-kiri-green-950 dark:text-white">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
