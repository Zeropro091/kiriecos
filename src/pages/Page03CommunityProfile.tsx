import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  MapPin,
  Globe,
  Instagram,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2
} from 'lucide-react';

export const Page03CommunityProfile: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, openCollabModalFor, communityMembers } = useApp();

  const community =
    entities.find((e) => e.id === selectedEntityId && e.type === 'community') ||
    entities.find((e) => e.type === 'community') ||
    entities[3];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
        <span>PAGE 03 — Public Community Profile (Landing Entity)</span>
      </div>

      {/* Cover & Profile Header */}
      <div className="rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="h-64 sm:h-80 relative overflow-hidden bg-kiri-green-950">
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/60 text-kiri-gold-300 backdrop-blur-md border border-kiri-gold-500/40">
            {community.badge}
          </div>
        </div>

        <div className="p-6 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-4">
            <div className="flex items-end gap-5">
              <img
                src={community.avatar}
                alt={community.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-xl"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white">
                    {community.name}
                  </h1>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-kiri-gold-700 dark:text-kiri-gold-400">
                  {community.handle} • {community.category}
                </p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('page-10-register-community')}
                className="px-5 py-2.5 rounded-xl border border-kiri-green-900/30 dark:border-kiri-gold-500/30 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-800 dark:text-gray-200"
              >
                Gabung Komunitas Ini
              </button>
              <button
                onClick={() => openCollabModalFor(community)}
                className="px-6 py-2.5 rounded-xl bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400 dark:text-kiri-dark-900" />
                <span>Request Through KIRI Project</span>
              </button>
            </div>
          </div>

          {/* Bio & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400 mb-2">
                  Tentang Komunitas
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                  {community.bio}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {community.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-kiri-ivory-warm dark:bg-kiri-dark-750 text-kiri-green-950 dark:text-kiri-ivory border border-gray-200 dark:border-kiri-dark-700 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Ecosystem Service Offerings */}
              {community.services && community.services.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400">
                    Opsi Kolaborasi Komunitas
                  </h3>
                  <div className="space-y-2.5">
                    {community.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-750 flex items-start justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-kiri-green-950 dark:text-white">
                            {srv.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {srv.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {srv.deliverables.map((d, i) => (
                              <span key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                • {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="font-bold text-xs text-kiri-green-900 dark:text-kiri-gold-400 shrink-0">
                          {srv.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats and Info Sidebar */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white">
                  Metrik & Informasi Resmi
                </h4>
                <div className="space-y-3 text-xs">
                  {community.stats.map((st, i) => (
                    <div key={i} className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-kiri-dark-700">
                      <span className="text-gray-500 dark:text-gray-400">{st.label}</span>
                      <span className="font-bold text-kiri-green-950 dark:text-kiri-gold-300">{st.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/50 dark:border-kiri-dark-700">
                    <span className="text-gray-500 dark:text-gray-400">Lokasi Pusat</span>
                    <span className="font-bold text-kiri-green-950 dark:text-white">{community.location}</span>
                  </div>
                  {community.website && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500 dark:text-gray-400">Situs Resmi</span>
                      <a
                        href={community.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-kiri-green-800 dark:text-kiri-gold-400 font-medium hover:underline flex items-center gap-1"
                      >
                        Kunjungi Web <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Controlled Database Notice */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Aturan Keamanan Data</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                  Database anggota komunitas ini dikelola secara terkontrol. Kontak individu hanya dapat dihubungi melalui mediasi KIRI Project.
                </p>
                <button
                  onClick={() => navigateTo('page-19-community-members')}
                  className="text-amber-800 dark:text-amber-300 font-bold underline text-[11px] block pt-1"
                >
                  Kelola Database Anggota (PAGE 19) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Curated Members Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
              Talenta Inti Terkurasi di Komunitas Ini
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Daftar anggota inti yang diverifikasi oleh tim kurasi KIRI PROJECT
            </p>
          </div>
          <button
            onClick={() => navigateTo('page-19-community-members')}
            className="text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline flex items-center gap-1"
          >
            <span>Buka Roster Lengkap (PAGE 19)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityMembers.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 flex items-center gap-3 shadow-sm"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-xl object-cover border border-kiri-gold-500/30 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white truncate">
                    {member.name}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-900 dark:text-kiri-gold-400 font-bold shrink-0">
                    {member.role}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {member.category} • {member.instagram}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
