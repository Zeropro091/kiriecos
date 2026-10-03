import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  ArrowRight,
  Search,
  Sparkles,
  Users,
  Building2,
  Newspaper,
  ShieldCheck,
  ChevronRight,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

export const Page01Home: React.FC = () => {
  const { navigateTo, entities, openCollabModalFor } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredCreators = entities.filter((e) => e.type === 'creator');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('page-02-directory');
    }
  };

  return (
    <div className="space-y-24 pb-28">
      {/* 1. HERO SECTION: Editorial Luxury with Left-Aligned Content & Image Gradient */}
      <section className="relative overflow-hidden bg-[#001710] text-white pt-20 pb-28 sm:pt-28 sm:pb-36 min-h-[620px] flex items-center">
        {/* Right side background image */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 pointer-events-none z-0">
          <img
            src="/assets/references/image1.png"
            alt="KIRI Heritage Creative"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          {/* Gradient Overlay: Deep Solid Green on Left to Transparent Image on Right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001710] via-[#001710]/90 to-transparent lg:via-[#001710]/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#001710] via-transparent to-[#001710]/40"></div>
        </div>

        {/* Subtle Ambient Orbs & Mesh */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-kiri-gold-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D8AE5A_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-2xl text-left space-y-6">
            {/* Main Display Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              Menghubungkan Kreator, Komunitas &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
                Bisnis Lokal
              </span>
            </h1>

            {/* Value Subtitle */}
            <p className="text-base sm:text-lg text-gray-300/90 font-normal leading-relaxed">
              KIRI PROJECT menyatukan talenta kreator independen, komunitas kreatif, dan UMKM dalam satu ruang kolaborasi yang terkurasi, transparan, dan terlindungi kontrak.
            </p>

            {/* Quick Search Bar: Double-Bezel Frame */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg">
              <div className="p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl focus-within:border-kiri-gold-500/60 transition-all duration-300">
                <div className="flex items-center bg-white dark:bg-kiri-dark-900 rounded-xl px-3 py-1.5 shadow-inner">
                  <Search className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    placeholder="Cari kreator visual, kuliner, UMKM Bali..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold text-xs hover:opacity-95 transition-all shrink-0 shadow-sm"
                  >
                    Cari Talenta
                  </button>
                </div>
              </div>
            </form>

            {/* Island CTAs with Button-in-Button Architecture */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigateTo('page-02-directory')}
                className="group pl-6 pr-2.5 py-2.5 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-sm transition-all duration-300 shadow-[0_6px_24px_rgba(216,174,90,0.35)] flex items-center gap-3 transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Jelajahi Direktori Ekosistem</span>
                <div className="w-8 h-8 rounded-full bg-kiri-dark-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <Compass className="w-4 h-4 text-kiri-dark-950" />
                </div>
              </button>

              <button
                onClick={() => navigateTo('page-08-join-select')}
                className="group pl-6 pr-2.5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 backdrop-blur-md font-semibold text-sm transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Bergabung dengan KIRI</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4 text-kiri-gold-300" />
                </div>
              </button>
            </div>
          </div>

          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-kiri-gold-500/40 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-kiri-gold-300">500+</p>
              <p className="text-[11px] text-gray-300/80 mt-1 uppercase tracking-wider font-semibold">Kreator Terkurasi</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-kiri-gold-500/40 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">50+</p>
              <p className="text-[11px] text-gray-300/80 mt-1 uppercase tracking-wider font-semibold">Komunitas Kreatif</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-kiri-gold-500/40 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-kiri-gold-300">120+</p>
              <p className="text-[11px] text-gray-300/80 mt-1 uppercase tracking-wider font-semibold">Brand & UMKM</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-kiri-gold-500/40 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">100%</p>
              <p className="text-[11px] text-gray-300/80 mt-1 uppercase tracking-wider font-semibold">Terfasilitasi Aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 5 CORE ECOSYSTEM PILLARS: Asymmetrical High-End Bento Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-kiri-green-900/10 dark:bg-kiri-gold-500/10 text-kiri-green-950 dark:text-kiri-gold-300 border border-kiri-green-900/15 dark:border-kiri-gold-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-kiri-gold-500 animate-pulse"></span>
            Fondasi Ekosistem
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-kiri-green-950 dark:text-white mt-4 tracking-tight">
            5 Pilar Kolaborasi <span className="text-kiri-gold-600 dark:text-kiri-gold-400">KIRI PROJECT</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3 font-light max-w-xl mx-auto leading-relaxed">
            Membangun infrastruktur terintegrasi untuk mempertemukan talenta dengan peluang bisnis nyata.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Pillar 1: Creator Community (Hero Anchor Card - 8 Cols) */}
          <div
            onClick={() => navigateTo('page-04-creator-profile', 'creator-1')}
            className="md:col-span-12 lg:col-span-8 p-1.5 rounded-[1.75rem] bg-gradient-to-br from-kiri-green-900/15 via-kiri-gold-500/10 to-transparent dark:from-kiri-dark-700 dark:via-kiri-dark-800/80 dark:to-kiri-dark-900 border border-kiri-green-900/10 dark:border-kiri-dark-700 hover:border-kiri-gold-500/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
          >
            <div className="p-7 sm:p-9 rounded-[1.4rem] bg-white dark:bg-kiri-dark-800/90 h-full flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
              {/* Subtle Atmospheric Gradient */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-kiri-gold-500/10 dark:bg-kiri-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                {/* Header Badge & Active Talents Counter */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-900/10 dark:bg-kiri-dark-700 border border-kiri-green-900/15 dark:border-white/10 text-xs font-semibold text-kiri-green-950 dark:text-kiri-gold-300">
                    <Users className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
                    <span>01 &bull; Kolektif Talenta</span>
                  </div>

                  {/* Creator Avatars Pill Stack */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/30 border border-gray-200/80 dark:border-white/10 px-3 py-1 rounded-full">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-kiri-green-800 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-kiri-dark-800">AR</div>
                      <div className="w-6 h-6 rounded-full bg-kiri-gold-600 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-kiri-dark-800">MD</div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-kiri-dark-800">SC</div>
                    </div>
                    <span className="text-[11px] font-bold text-kiri-green-950 dark:text-kiri-gold-300">500+ Member</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-kiri-green-950 dark:text-white mb-2 tracking-tight group-hover:text-kiri-gold-600 dark:group-hover:text-kiri-gold-300 transition-colors">
                  Creator Community
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light max-w-xl mb-6">
                  Wadah talenta visual, videografer, fotografer, dan kreator konten untuk bertumbuh bersama, berjejaring lintas disiplin, dan menjangkau proyek komersial.
                </p>

                {/* Sub-category tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-kiri-dark-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5">Visual Art</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-kiri-dark-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5">Videografi & Reels</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-kiri-dark-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5">Brand Identity</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-kiri-dark-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5">Motion Graphic</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                <span className="text-xs text-gray-400 font-mono">ECOSYSTEM DIRECTORY</span>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-kiri-gold-600 dark:text-kiri-gold-400 group-hover:translate-x-1 transition-all">
                  <span>Lihat Direktori</span>
                  <div className="w-6 h-6 rounded-full bg-kiri-gold-500/10 dark:bg-kiri-gold-500/20 flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Creator Academy (4 Cols - Progress & Quality Bar Widget) */}
          <div
            onClick={() => navigateTo('page-03-community-profile', 'comm-1')}
            className="md:col-span-12 lg:col-span-4 p-1.5 rounded-[1.75rem] bg-gray-100 dark:bg-kiri-dark-800/60 border border-gray-200/80 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
          >
            <div className="p-7 rounded-[1.4rem] bg-white dark:bg-kiri-dark-800 h-full flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-kiri-green-950 dark:bg-kiri-dark-700 text-kiri-gold-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-kiri-gold-500/10 text-kiri-gold-700 dark:text-kiri-gold-300">02 &bull; Upskill</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white mb-2 tracking-tight group-hover:text-kiri-gold-600 dark:group-hover:text-kiri-gold-300 transition-colors">
                  Creator Academy
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light mb-5">
                  Workshop intensif, kurasi portofolio, dan standardisasi kualitas industri untuk talenta muda.
                </p>

                {/* Visual Widget: Portfolio Readiness Meter */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200/70 dark:border-white/5 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Standar Portofolio Industri</span>
                    <span className="text-kiri-gold-600 dark:text-kiri-gold-400 font-bold">94% Siap Deal</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-kiri-gold-500 to-amber-400 w-[94%] rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-0.5">
                    <span>Batch 4</span>
                    <span>Terkurasi</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">ACADEMY_PROG</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-kiri-gold-600 dark:text-kiri-gold-400 group-hover:translate-x-1 transition-transform">
                  <span>Program Komunitas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Brand Partnership (4 Cols - Brief Matchmaking Radar Widget) */}
          <div
            onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
            className="md:col-span-12 lg:col-span-4 p-1.5 rounded-[1.75rem] bg-gray-100 dark:bg-kiri-dark-800/60 border border-gray-200/80 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
          >
            <div className="p-7 rounded-[1.4rem] bg-white dark:bg-kiri-dark-800 h-full flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-kiri-green-950 dark:bg-kiri-dark-700 text-kiri-gold-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">03 &bull; Business</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white mb-2 tracking-tight group-hover:text-kiri-gold-600 dark:group-hover:text-kiri-gold-300 transition-colors">
                  Brand Partnership
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light mb-5">
                  Menghubungkan UMKM lokal & brand nasional dengan kreator yang tepat melalui kurasi brief akurat.
                </p>

                {/* Visual Widget: Matchmaking Accuracy */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200/70 dark:border-white/5 flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Brief Match Rate</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      99.2% Terkurasi
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold">UMKM &bull; BRAND</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">CATALOG_DEALS</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-kiri-gold-600 dark:text-kiri-gold-400 group-hover:translate-x-1 transition-transform">
                  <span>Katalog Bisnis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Media Partner (4 Cols - Live Editorial Wave Widget) */}
          <div
            onClick={() => navigateTo('page-06-media-profile', 'media-1')}
            className="md:col-span-12 lg:col-span-4 p-1.5 rounded-[1.75rem] bg-gray-100 dark:bg-kiri-dark-800/60 border border-gray-200/80 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
          >
            <div className="p-7 rounded-[1.4rem] bg-white dark:bg-kiri-dark-800 h-full flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-kiri-green-950 dark:bg-kiri-dark-700 text-kiri-gold-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">04 &bull; Media</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white mb-2 tracking-tight group-hover:text-kiri-gold-600 dark:group-hover:text-kiri-gold-300 transition-colors">
                  Media Partner
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light mb-5">
                  Jaringan distribusi siaran pers, amplifikasi berita, dan sorotan liputan editorial terpadu.
                </p>

                {/* Visual Widget: Media Wave Broadcast */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200/70 dark:border-white/5 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Amplifikasi Editorial</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">DISTRO_ACTIVE</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-6 pt-1">
                    <div className="w-1/6 bg-blue-500/30 h-2 rounded-t"></div>
                    <div className="w-1/6 bg-blue-500/50 h-4 rounded-t"></div>
                    <div className="w-1/6 bg-blue-500 h-6 rounded-t"></div>
                    <div className="w-1/6 bg-blue-500/70 h-3.5 rounded-t"></div>
                    <div className="w-1/6 bg-blue-500/90 h-5 rounded-t"></div>
                    <div className="w-1/6 bg-blue-500/40 h-3 rounded-t"></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">PRESS_WIRE</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-kiri-gold-600 dark:text-kiri-gold-400 group-hover:translate-x-1 transition-transform">
                  <span>Jejaring Media</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 5: Strategic Partner (4 Cols - Mesh Alliance Node Widget) */}
          <div
            onClick={() => navigateTo('page-07-partner-profile', 'strat-1')}
            className="md:col-span-12 lg:col-span-4 p-1.5 rounded-[1.75rem] bg-gray-100 dark:bg-kiri-dark-800/60 border border-gray-200/80 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
          >
            <div className="p-7 rounded-[1.4rem] bg-white dark:bg-kiri-dark-800 h-full flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-kiri-green-950 dark:bg-kiri-dark-700 text-kiri-gold-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-400">05 &bull; Strategic</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white mb-2 tracking-tight group-hover:text-kiri-gold-600 dark:group-hover:text-kiri-gold-300 transition-colors">
                  Strategic Partner
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light mb-5">
                  Aliansi strategis bersama institusi pemerintah, hub teknologi, dan asosiasi industri terdepan.
                </p>

                {/* Visual Widget: Institutional Node Mesh */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200/70 dark:border-white/5 flex items-center justify-around mb-4">
                  <div className="text-center">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300 font-bold text-[9px] flex items-center justify-center mx-auto mb-1">GOV</div>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Regulasi</span>
                  </div>
                  <div className="h-px w-4 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="text-center">
                    <div className="w-6 h-6 rounded-full bg-kiri-gold-500/20 text-kiri-gold-600 dark:text-kiri-gold-300 font-bold text-[9px] flex items-center justify-center mx-auto mb-1">HUB</div>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Teknologi</span>
                  </div>
                  <div className="h-px w-4 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="text-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[9px] flex items-center justify-center mx-auto mb-1">ASSN</div>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Industri</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">STRAT_ALLIANCE</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-kiri-gold-600 dark:text-kiri-gold-400 group-hover:translate-x-1 transition-transform">
                  <span>Partner Strategis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED CREATORS: Double-Bezel High-End Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-kiri-gold-500/10 text-kiri-gold-700 dark:text-kiri-gold-300 border border-kiri-gold-500/20">
              Talenta Terkurasi
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white mt-3">
              Kreator Unggulan KIRI PROJECT
            </h2>
          </div>
          <button
            onClick={() => navigateTo('page-02-directory')}
            className="text-xs font-bold text-kiri-green-950 dark:text-kiri-gold-400 hover:underline flex items-center gap-1 mt-3 sm:mt-0"
          >
            <span>Lihat Semua Direktori</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.slice(0, 3).map((creator) => (
            <div
              key={creator.id}
              className="group p-1.5 rounded-[1.75rem] bg-gray-100 dark:bg-kiri-dark-800/80 border border-gray-200/80 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col transform hover:-translate-y-1.5"
            >
              <div className="rounded-[1.35rem] bg-white dark:bg-kiri-dark-800 overflow-hidden flex-1 flex flex-col justify-between">
                {/* Cover & Badge */}
                <div className="h-40 relative overflow-hidden bg-gray-100">
                  <img
                    src={creator.coverImage}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-black/70 text-kiri-gold-300 backdrop-blur-md border border-kiri-gold-500/30">
                    {creator.badge}
                  </div>
                </div>

                <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                  <div>
                    {/* Avatar & Location */}
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-16 h-16 rounded-xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-md ring-1 ring-black/5"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kiri-gold-600" />
                        {creator.location}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                      {creator.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {creator.handle} • {creator.category}
                    </p>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed font-light">
                      {creator.bio}
                    </p>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Jangkauan</p>
                        <p className="font-bold text-kiri-green-950 dark:text-kiri-gold-300">
                          {creator.stats[0]?.value}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Engagement</p>
                        <p className="font-bold text-kiri-green-950 dark:text-kiri-gold-300">
                          {creator.stats[1]?.value}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
                    <button
                      onClick={() => navigateTo('page-04-creator-profile', creator.id)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 transition-all text-center"
                    >
                      Lihat Profil
                    </button>
                    <button
                      onClick={() => openCollabModalFor(creator)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 hover:opacity-95 shadow-sm transition-all text-center"
                    >
                      Request Collab
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW KIRI WORKS: 4-Step Curated Workflow */}
      <section className="bg-white dark:bg-kiri-dark-900/60 py-20 border-y border-gray-200/80 dark:border-kiri-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-kiri-gold-500/10 text-kiri-gold-700 dark:text-kiri-gold-300 border border-kiri-gold-500/20">
              Transparan & Terkurasi
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white mt-3">
              Bagaimana KIRI PROJECT Bekerja?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Satu alur terstruktur untuk menjamin kesepakatan adil dan hasil karya yang berdampak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200/60 dark:border-kiri-dark-700 relative hover:border-kiri-gold-500/40 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-serif font-bold text-sm flex items-center justify-center mb-4">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Temukan Talenta
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Jelajahi profil kreator, portofolio karya, rate card terverifikasi, dan komunitas dalam direktori.
              </p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200/60 dark:border-kiri-dark-700 relative hover:border-kiri-gold-500/40 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-serif font-bold text-sm flex items-center justify-center mb-4">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Ajukan Brief Terstruktur
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Kirimkan brief kolaborasi melalui sistem KIRI Project dengan rincian target, budget, dan timeline.
              </p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200/60 dark:border-kiri-dark-700 relative hover:border-kiri-gold-500/40 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-serif font-bold text-sm flex items-center justify-center mb-4">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Kurasi & Matching
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Tim KIRI mereview brief, memastikan kecocokan talenta, mengunci kontrak, dan memfasilitasi alur kerja.
              </p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200/60 dark:border-kiri-dark-700 relative hover:border-kiri-gold-500/40 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-kiri-green-950 text-kiri-gold-300 dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-serif font-bold text-sm flex items-center justify-center mb-4">
                04
              </span>
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white mb-2">
                Eksekusi & Dampak
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Produksi konten berjalan lancar, deliverables diverifikasi, dan dampak kampanye dilaporkan terukur.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigateTo('page-27-request-flowchart')}
              className="inline-flex items-center gap-2 text-xs font-bold text-kiri-green-950 dark:text-kiri-gold-400 hover:underline"
            >
              <span>Pelajari Diagram Alur Kemitraan Selengkapnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PILOT UMKM SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-1.5 rounded-[2rem] bg-gradient-to-br from-kiri-gold-500/30 via-transparent to-kiri-green-900/30">
          <div className="rounded-[1.75rem] bg-gradient-to-r from-[#001710] via-[#00261A] to-[#001710] text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(#D8AE5A_2px,transparent_2px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="max-w-2xl relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-kiri-gold-500/20 text-kiri-gold-300 border border-kiri-gold-500/40 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400" />
                <span>Pilot Partnership Showcase — Bali UMKM</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Kopi Kintamani Organic x Raka Dewantara
              </h2>

              <p className="text-sm sm:text-base text-gray-300/90 leading-relaxed font-light">
                Melalui fasilitasi kurasi KIRI PROJECT, kampanye visual cold brew Batur berhasil meningkatkan awareness produk sebesar <span className="text-kiri-gold-300 font-semibold">300%</span> dan mendatangkan 80+ kemitraan cafe baru dalam waktu 1 bulan.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
                  className="px-6 py-3.5 rounded-xl bg-kiri-gold-500 text-kiri-dark-950 font-bold text-xs hover:bg-kiri-gold-400 transition-all shadow-md active:scale-95"
                >
                  Lihat Studi Kasus UMKM
                </button>
                <button
                  onClick={() => navigateTo('page-08-join-select')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all backdrop-blur-sm active:scale-95"
                >
                  Daftarkan Brand Anda
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
