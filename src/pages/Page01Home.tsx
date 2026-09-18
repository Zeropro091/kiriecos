import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Users,
  Building2,
  Newspaper,
  ShieldCheck,
  Search,
  CheckCircle2,
  Star,
  ChevronRight,
  TrendingUp,
  MapPin,
  Play
} from 'lucide-react';

export const Page01Home: React.FC = () => {
  const { navigateTo, entities, openCollabModalFor } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredCreators = entities.filter((e) => e.type === 'creator');
  const featuredCommunities = entities.filter((e) => e.type === 'community');
  const featuredBusinesses = entities.filter((e) => e.type === 'business');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('page-02-directory');
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white pt-20 pb-28">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D8AE5A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-kiri-gold-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-kiri-green-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-kiri-gold-500/40 text-kiri-gold-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400 animate-spin-slow" />
              <span>PAGE 01 — Ekosistem Resmi Kreator & Kolaborasi Indonesia</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Connect. Collaborate. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-kiri-gold-200">
                Impact.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-light max-w-2xl mx-auto">
              KIRI PROJECT menghubungkan kreator bertalenta, komunitas kreatif, brand UMKM, dan partner strategis untuk membangun kolaborasi bermakna dan berdampak nyata.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
              <div className="flex items-center bg-white/95 dark:bg-kiri-dark-800 p-2 rounded-2xl shadow-elevated border border-kiri-gold-500/30">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Cari kreator, komunitas, kuliner, UMKM Bali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 font-semibold text-xs hover:opacity-90 transition-all shrink-0"
                >
                  Cari Talenta
                </button>
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigateTo('page-02-directory')}
                className="px-6 py-3.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-sm transition-all shadow-gold-glow flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                <span>Jelajahi Direktori Ekosistem</span>
              </button>

              <button
                onClick={() => navigateTo('page-08-join-select')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <span>Bergabung dengan KIRI</span>
                <ArrowRight className="w-4 h-4 text-kiri-gold-300" />
              </button>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10 max-w-4xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-kiri-gold-300">500+</p>
              <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Kreator Terkurasi</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">50+</p>
              <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Komunitas Kreatif</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-kiri-gold-300">120+</p>
              <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Kolaborasi Brand & UMKM</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">100%</p>
              <p className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-medium">Aman & Terfasilitasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Ecosystem Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400">
            Fondasi Ekosistem
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white mt-1">
            5 Pilar Kolaborasi KIRI PROJECT
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Membangun ekosistem yang terintegrasi untuk mempertemukan talenta dengan peluang nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Pillar 1: Creator Community */}
          <div
            onClick={() => navigateTo('page-04-creator-profile', 'creator-1')}
            className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
              Creator Community
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Wadah talenta visual, videografer, dan kreator konten untuk bertumbuh dan mendapatkan proyek komersial.
            </p>
            <span className="text-xs font-semibold text-kiri-gold-700 dark:text-kiri-gold-400 flex items-center gap-1">
              Lihat Profil Kreator <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 2: Creator Academy */}
          <div
            onClick={() => navigateTo('page-03-community-profile', 'comm-1')}
            className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
              Creator Academy
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Workshop intensif, inkubasi skill, kurasi portofolio, dan standardisasi kualitas industri kreatif.
            </p>
            <span className="text-xs font-semibold text-kiri-gold-700 dark:text-kiri-gold-400 flex items-center gap-1">
              Program Komunitas <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 3: Brand & UMKM Partnership */}
          <div
            onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
            className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400 mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
              Brand Partnership
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Menghubungkan UMKM lokal & brand nasional dengan kreator yang tepat melalui kurasi brief yang akurat.
            </p>
            <span className="text-xs font-semibold text-kiri-gold-700 dark:text-kiri-gold-400 flex items-center gap-1">
              Katalog Bisnis/UMKM <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 4: Media Partner */}
          <div
            onClick={() => navigateTo('page-06-media-profile', 'media-1')}
            className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400 mb-4 group-hover:scale-110 transition-transform">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
              Media Partner
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Jaringan publikasi siaran pers, amplifikasi berita, dan sorotan liputan editorial berskala luas.
            </p>
            <span className="text-xs font-semibold text-kiri-gold-700 dark:text-kiri-gold-400 flex items-center gap-1">
              Jejaring Media <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 5: Strategic Partner */}
          <div
            onClick={() => navigateTo('page-07-partner-profile', 'strat-1')}
            className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-700 flex items-center justify-center text-kiri-green-900 dark:text-kiri-gold-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
              Strategic Partner
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Aliansi strategis bersama institusi pemerintah, hub teknologi, dan asosiasi industri (DGT Team, dsb).
            </p>
            <span className="text-xs font-semibold text-kiri-gold-700 dark:text-kiri-gold-400 flex items-center gap-1">
              Partner Strategis <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400">
              Talenta Terkurasi
            </span>
            <h2 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white mt-1">
              Kreator Unggulan KIRI PROJECT
            </h2>
          </div>
          <button
            onClick={() => navigateTo('page-02-directory')}
            className="text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Lihat Semua Kreator</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.slice(0, 3).map((creator) => (
            <div
              key={creator.id}
              className="rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle hover:shadow-elevated hover:border-kiri-gold-500/50 transition-all flex flex-col"
            >
              {/* Cover & Avatar */}
              <div className="h-36 relative overflow-hidden bg-gray-100">
                <img
                  src={creator.coverImage}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-kiri-gold-300 backdrop-blur-sm border border-kiri-gold-500/30">
                  {creator.badge}
                </div>
              </div>

              <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-end justify-between -mt-10 mb-3">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-md"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-kiri-gold-600" />
                      {creator.location}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                    {creator.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {creator.handle} • {creator.category}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                    {creator.bio}
                  </p>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Jangkauan</p>
                      <p className="font-bold text-kiri-green-900 dark:text-kiri-gold-300">
                        {creator.stats[0]?.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Engagement</p>
                      <p className="font-bold text-kiri-green-900 dark:text-kiri-gold-300">
                        {creator.stats[1]?.value}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
                  <button
                    onClick={() => navigateTo('page-04-creator-profile', creator.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 transition-all text-center"
                  >
                    Lihat Profil
                  </button>
                  <button
                    onClick={() => openCollabModalFor(creator)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-90 shadow-sm transition-all text-center"
                  >
                    Request Collab
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How KIRI Project Works (4-Step Workflow) */}
      <section className="bg-kiri-ivory-warm dark:bg-kiri-dark-850 py-16 border-y border-gray-200 dark:border-kiri-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400">
              Transparan & Terkurasi
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white mt-1">
              Bagaimana KIRI PROJECT Bekerja?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Satu alur terstruktur untuk menjamin kesepakatan adil dan hasil karya yang berdampak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700 relative">
              <span className="w-9 h-9 rounded-full bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-serif font-bold text-sm flex items-center justify-center mb-4">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Temukan Talenta
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Jelajahi profil kreator, portofolio karya, rate card terverifikasi, dan komunitas dalam direktori.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700 relative">
              <span className="w-9 h-9 rounded-full bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-serif font-bold text-sm flex items-center justify-center mb-4">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Request Through KIRI
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Kirimkan brief kolaborasi melalui sistem KIRI Project dengan rincian target, budget, dan timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700 relative">
              <span className="w-9 h-9 rounded-full bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-serif font-bold text-sm flex items-center justify-center mb-4">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Kurasi & Matching
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Admin KIRI mereview brief, memastikan kecocokan talenta, mengunci kontrak, dan mengaktifkan escrow.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-100 dark:border-kiri-dark-700 relative">
              <span className="w-9 h-9 rounded-full bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-serif font-bold text-sm flex items-center justify-center mb-4">
                04
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Eksekusi & Dampak
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Produksi konten berjalan lancar, deliverables diverifikasi, dan dampak kampanye dilaporkan secara terukur.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigateTo('page-27-request-flowchart')}
              className="inline-flex items-center gap-2 text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline"
            >
              <span>Pelajari Diagram Alur Kemitraan Selengkapnya (PAGE 27)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Pilot UMKM Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-[radial-gradient(#D8AE5A_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="max-w-2xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-gold-500/20 text-kiri-gold-300 border border-kiri-gold-500/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400" />
              <span>Pilot Partnership Showcase — Bali UMKM</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Kopi Kintamani Organic x Raka Dewantara
            </h2>

            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Melalui fasilitasi kurasi KIRI PROJECT, kampanye visual cold brew Batur berhasil meningkatkan awareness produk sebesar 300% dan mendatangkan 80+ kemitraan cafe baru dalam waktu 1 bulan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
                className="px-6 py-3 rounded-xl bg-kiri-gold-500 text-kiri-dark-950 font-bold text-xs hover:bg-kiri-gold-400 transition-all shadow-subtle"
              >
                Lihat Studi Kasus UMKM
              </button>
              <button
                onClick={() => navigateTo('page-08-join-select')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all"
              >
                Daftarkan Brand Anda
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
