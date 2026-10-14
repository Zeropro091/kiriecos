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
  Award,
  Zap,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-24 pb-28">
      {/* 1. HERO SECTION: Minimalist Matte Granite with Clean Whites & Subtle Olive Glow */}
      <section className="relative overflow-hidden bg-granite-900 text-white pt-20 pb-28 sm:pt-28 sm:pb-36 min-h-[640px] flex items-center">
        {/* Right side background image overlay */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 pointer-events-none z-0">
          <img
            src="/assets/references/image1.png"
            alt="KIRI Heritage Creative"
            className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-granite-900 via-granite-900/95 to-transparent lg:via-granite-900/85"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-granite-900 via-transparent to-granite-900/50"></div>
        </div>

        {/* Subtle Ambient Orbs */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-olive-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-granite-700/20 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#729E62_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-2xl text-left space-y-6">
            <Badge variant="outline" className="border-olive-500/50 bg-olive-500/15 text-olive-300 font-bold px-3 py-1 gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-olive-400" />
              <span>BALI CREATIVE TALENT & ENTERPRISE HUB</span>
            </Badge>

            {/* Display Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.14]">
              Menghubungkan Kreator, Komunitas &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-300 via-olive-400 to-olive-200">
                Bisnis Lokal
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
              KIRI PROJECT menyatukan talenta kreator independen, komunitas seni budaya, dan UMKM dalam satu ruang kolaborasi terkurasi, transparan, dan terlindungi kontrak resmi.
            </p>

            {/* Smart Search Bar with Shadcn Input & Button */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg">
              <div className="p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl focus-within:border-olive-400 transition-all duration-300">
                <div className="flex items-center gap-2 bg-white dark:bg-granite-850 rounded-xl px-2.5 py-1.5 shadow-inner">
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    placeholder="Cari videografer, kuliner, UMKM Bali..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs sm:text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none placeholder:text-gray-500 font-medium"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-olive-700 text-white hover:bg-olive-600 font-bold text-xs shrink-0"
                  >
                    Cari Talenta
                  </Button>
                </div>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                onClick={() => navigateTo('page-02-directory')}
                size="lg"
                className="rounded-full bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs sm:text-sm gap-2.5 shadow-lg shadow-olive-600/30 transition-transform hover:-translate-y-0.5"
              >
                <span>Jelajahi Direktori Ekosistem</span>
                <Compass className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => navigateTo('page-08-join-select')}
                variant="outline"
                size="lg"
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md font-bold text-xs sm:text-sm gap-2 transition-transform hover:-translate-y-0.5"
              >
                <span>Bergabung dengan KIRI</span>
                <ArrowRight className="w-4 h-4 text-olive-300" />
              </Button>
            </div>
          </div>

          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/15">
            <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15 hover:border-olive-500/50 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-olive-300">500+</p>
              <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-wider font-bold">Kreator Terkurasi</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15 hover:border-olive-500/50 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">50+</p>
              <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-wider font-bold">Komunitas Seni</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15 hover:border-olive-500/50 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-olive-300">120+</p>
              <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-wider font-bold">Brand & UMKM</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15 hover:border-olive-500/50 transition-colors text-left sm:text-center">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white">100%</p>
              <p className="text-[11px] text-gray-300 mt-1 uppercase tracking-wider font-bold">Terfasilitasi Aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 5 CORE ECOSYSTEM PILLARS (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="border-olive-600/30 text-olive-700 dark:text-olive-300 px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-olive-500/10">
            Fondasi Ekosistem
          </Badge>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            5 Pilar Kolaborasi <span className="text-olive-600 dark:text-olive-400">KIRI PROJECT</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed">
            Membangun infrastruktur terintegrasi untuk mempertemukan talenta dengan peluang bisnis nyata.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Pillar 1: Creator Community (Hero Bento Card - 8 Cols) */}
          <div
            onClick={() => navigateTo('page-04-creator-profile', 'creator-1')}
            className="md:col-span-12 lg:col-span-8 p-1 rounded-3xl bg-gradient-to-br from-olive-500/20 via-granite-800/10 to-transparent border border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <Card className="p-7 sm:p-9 h-full flex flex-col justify-between relative overflow-hidden bg-card border-none">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-bold text-xs bg-olive-500/15 text-foreground">
                    <Users className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400" />
                    <span>01 &bull; Kolektif Talenta</span>
                  </Badge>

                  <div className="flex items-center gap-2 bg-muted/70 border border-border px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-olive-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-foreground">500+ Member Aktif</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  Creator Community
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-normal max-w-xl mb-6">
                  Wadah talenta visual, videografer, fotografer, dan kreator konten untuk bertumbuh bersama, berjejaring lintas disiplin, dan menjangkau proyek komersial.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="font-semibold">Visual Art</Badge>
                  <Badge variant="outline" className="font-semibold">Videografi & Reels</Badge>
                  <Badge variant="outline" className="font-semibold">Brand Identity</Badge>
                  <Badge variant="outline" className="font-semibold">Motion Graphics</Badge>
                </div>
              </div>

              <div className="pt-5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-bold">ECOSYSTEM DIRECTORY</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-olive-600 dark:text-olive-400 group-hover:translate-x-1 transition-transform">
                  <span>Lihat Direktori</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </div>

          {/* Pillar 2: Creator Academy (4 Cols) */}
          <div
            onClick={() => navigateTo('page-03-community-profile', 'comm-1')}
            className="md:col-span-12 lg:col-span-4 p-1 rounded-3xl bg-muted/40 border border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <Card className="p-7 h-full flex flex-col justify-between bg-card border-none">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-granite-900 dark:bg-granite-800 text-olive-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Sparkles className="w-5 h-5 text-olive-400" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold">02 &bull; Academy</Badge>
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  Creator Academy
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal mb-4">
                  Standardisasi kompetensi, lokakarya produksi kreatif, dan inkubasi talenta lokal siap industri.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-bold">KURIKULUM</span>
                <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>

          {/* Pillar 3: Brand & UMKM (4 Cols) */}
          <div
            onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
            className="md:col-span-12 lg:col-span-4 p-1 rounded-3xl bg-muted/40 border border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <Card className="p-7 h-full flex flex-col justify-between bg-card border-none">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-granite-900 dark:bg-granite-800 text-olive-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Building2 className="w-5 h-5 text-olive-400" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold">03 &bull; Bisnis</Badge>
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  Bisnis & UMKM
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal mb-4">
                  Jembatan komersial bagi UMKM lokal untuk bermitra dengan kreator terpercaya secara aman dan transparan.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-bold">SHOWCASE</span>
                <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>

          {/* Pillar 4: Media Partner (4 Cols) */}
          <div
            onClick={() => navigateTo('page-06-media-profile', 'media-1')}
            className="md:col-span-12 lg:col-span-4 p-1 rounded-3xl bg-muted/40 border border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <Card className="p-7 h-full flex flex-col justify-between bg-card border-none">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-granite-900 dark:bg-granite-800 text-olive-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Newspaper className="w-5 h-5 text-olive-400" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold">04 &bull; Media</Badge>
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  Media Partner
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal mb-4">
                  Jaringan distribusi siaran pers, amplifikasi berita, dan sorotan liputan editorial terpadu.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-bold">PRESS WIRE</span>
                <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>

          {/* Pillar 5: Strategic Partner (4 Cols) */}
          <div
            onClick={() => navigateTo('page-07-partner-profile', 'strat-1')}
            className="md:col-span-12 lg:col-span-4 p-1 rounded-3xl bg-muted/40 border border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <Card className="p-7 h-full flex flex-col justify-between bg-card border-none">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-granite-900 dark:bg-granite-800 text-olive-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-olive-400" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold">05 &bull; Strategic</Badge>
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  Strategic Partner
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal mb-4">
                  Aliansi strategis bersama institusi pemerintah, hub teknologi, dan asosiasi industri terdepan.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono font-bold">ALLIANCE</span>
                <ChevronRight className="w-4 h-4 text-olive-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CREATORS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <Badge variant="outline" className="border-olive-500/40 text-olive-700 dark:text-olive-300 px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-olive-500/10">
              Talenta Terkurasi
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-3">
              Kreator Unggulan KIRI PROJECT
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('page-02-directory')}
            className="text-xs font-bold text-foreground hover:text-olive-600 dark:hover:text-olive-400 gap-1 mt-3 sm:mt-0"
          >
            <span>Lihat Semua Direktori</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.slice(0, 3).map((creator) => (
            <Card
              key={creator.id}
              className="overflow-hidden border-border hover:border-olive-500/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 bg-card"
            >
              <div>
                <div className="h-44 relative overflow-hidden bg-muted">
                  <img
                    src={creator.coverImage}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-black/75 text-olive-300 backdrop-blur-md border border-olive-500/40 text-[10px] font-bold">
                      {creator.badge}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-end justify-between -mt-8 mb-3">
                      <Avatar className="w-16 h-16 border-2 border-background ring-2 ring-olive-500/50 shadow-md">
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                        <AvatarFallback className="bg-granite-900 text-olive-300 font-bold text-sm">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-olive-500" />
                        {creator.location}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                      {creator.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                      {creator.handle} &bull; {creator.category}
                    </p>

                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed font-normal">
                      {creator.bio}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-muted/50 border border-border text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Jangkauan</p>
                        <p className="font-bold text-foreground">
                          {creator.stats[0]?.value}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Engagement</p>
                        <p className="font-bold text-foreground">
                          {creator.stats[1]?.value}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardFooter className="p-4 bg-muted/30 border-t border-border flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo('page-04-creator-profile', creator.id)}
                  className="flex-1 text-xs font-semibold"
                >
                  Lihat Profil
                </Button>
                <Button
                  size="sm"
                  onClick={() => openCollabModalFor(creator)}
                  className="flex-1 bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs gap-1 shadow-2xs border border-olive-600/30"
                >
                  <Sparkles className="w-3 h-3 text-olive-300" />
                  <span>Ajak Collab</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. HOW KIRI WORKS: 4-Step Curated Workflow */}
      <section className="bg-card py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="outline" className="border-olive-500/40 text-olive-700 dark:text-olive-300 px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-olive-500/10">
              Transparan & Terkurasi
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Bagaimana KIRI PROJECT Bekerja?
            </h2>
            <p className="text-sm text-muted-foreground font-normal">
              Satu alur terstruktur untuk menjamin kesepakatan adil dan hasil karya yang berdampak nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Temukan Talenta', desc: 'Jelajahi profil kreator, portofolio karya, rate card terverifikasi, dan komunitas dalam direktori.' },
              { step: '02', title: 'Ajukan Brief', desc: 'Kirimkan brief kolaborasi melalui sistem KIRI Project dengan rincian target, budget, dan timeline.' },
              { step: '03', title: 'Kurasi & Matching', desc: 'Tim KIRI mereview brief, memastikan kecocokan talenta, mengunci kontrak, dan memfasilitasi alur kerja.' },
              { step: '04', title: 'Eksekusi & Dampak', desc: 'Produksi konten berjalan lancar, deliverables diverifikasi, dan dampak kampanye dilaporkan terukur.' }
            ].map((s) => (
              <Card key={s.step} className="p-6 border-border hover:border-olive-500/50 transition-colors bg-background">
                <span className="w-10 h-10 rounded-xl bg-granite-900 text-olive-300 dark:bg-granite-800 dark:text-olive-400 font-serif font-bold text-sm flex items-center justify-center mb-4 shadow-xs border border-border">
                  {s.step}
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="link"
              onClick={() => navigateTo('page-27-request-flowchart')}
              className="text-xs font-bold text-foreground hover:text-olive-600 dark:hover:text-olive-400 gap-1.5"
            >
              <span>Pelajari Diagram Alur Kemitraan Selengkapnya</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. PILOT PARTNERSHIP SHOWCASE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-1 rounded-3xl bg-gradient-to-br from-olive-500/30 via-granite-800/20 to-granite-950/40">
          <div className="rounded-[1.4rem] bg-gradient-to-r from-granite-900 via-granite-850 to-granite-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="max-w-2xl relative z-10 space-y-6">
              <Badge variant="outline" className="border-olive-500/40 bg-olive-500/20 text-olive-300 px-3.5 py-1 text-xs font-semibold gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-olive-400" />
                <span>Pilot Partnership Showcase &bull; Bali UMKM</span>
              </Badge>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Kopi Kintamani Organic x Raka Dewantara
              </h2>

              <p className="text-sm sm:text-base text-gray-200 font-normal leading-relaxed">
                Melalui fasilitasi kurasi KIRI PROJECT, kampanye visual cold brew Batur berhasil meningkatkan awareness produk sebesar <span className="text-olive-300 font-bold">300%</span> dan mendatangkan 80+ kemitraan cafe baru dalam waktu 1 bulan.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Button
                  onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
                  className="bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs sm:text-sm px-6 py-5 rounded-xl shadow-md"
                >
                  Lihat Studi Kasus UMKM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo('page-08-join-select')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold text-xs sm:text-sm px-6 py-5 rounded-xl backdrop-blur-sm"
                >
                  Daftarkan Brand Anda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
