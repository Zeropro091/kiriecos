import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Users,
  Grid,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { EntityType } from '../types';
import MapChart from '../components/GeoMapChart';
import { GeoProfileModal } from '../components/GeoProfileModal';
import {
  getFilteredGeoMapData,
  geoNiches,
  ProvinceGeoData
} from '../data/geoTalentData';

import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const ITEMS_PER_PAGE = 12;

export const Page02Directory: React.FC = () => {
  const { entities, navigateTo, openCollabModalFor } = useApp();

  // Directory Grid state
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [currentPageNum, setCurrentPageNum] = useState(1);

  // Interactive Geo-Map State
  const [geoNicheFilter, setGeoNicheFilter] = useState('Semua Niche');
  const [geoMinFollowers, setGeoMinFollowers] = useState<number>(0);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);

  // Filtered Map Data
  const filteredGeoMap = useMemo(() => {
    return getFilteredGeoMapData(geoNicheFilter, geoMinFollowers);
  }, [geoNicheFilter, geoMinFollowers]);

  const activeSelectedProvince: ProvinceGeoData | null = useMemo(() => {
    if (!selectedProvinceId) return null;
    return filteredGeoMap[selectedProvinceId] || null;
  }, [selectedProvinceId, filteredGeoMap]);

  // Filtered Directory Entities
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      if (selectedType !== 'all' && entity.type !== selectedType) return false;
      if (verifiedOnly && !entity.verified) return false;
      if (
        selectedCategory !== 'all' &&
        entity.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = entity.name.toLowerCase().includes(query);
        const matchBio = entity.bio.toLowerCase().includes(query);
        const matchTags = entity.tags.some((t) => t.toLowerCase().includes(query));
        const matchLocation = (entity.location || '').toLowerCase().includes(query);
        if (!matchName && !matchBio && !matchTags && !matchLocation) {
          return false;
        }
      }
      return true;
    });
  }, [entities, selectedType, searchQuery, selectedCategory, verifiedOnly]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPageNum(1);
  }, [selectedType, searchQuery, selectedCategory, verifiedOnly]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE) || 1;
  const paginatedEntities = useMemo(() => {
    const start = (currentPageNum - 1) * ITEMS_PER_PAGE;
    return filteredEntities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntities, currentPageNum]);

  const totalGeoCreators = useMemo(() => {
    return Object.values(filteredGeoMap).reduce(
      (acc, prov) => acc + prov.cities.reduce((cAcc, city) => cAcc + city.creators.length, 0),
      0
    );
  }, [filteredGeoMap]);

  const entityTypeLabels: Record<string, string> = {
    all: 'Semua Talenta',
    creator: 'Kreator',
    business: 'UMKM & Brand',
    community: 'Komunitas',
    media: 'Media Partner'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. HERO HEADER WITH MATTE GRANITE & REFINED OLIVE ACCENT */}
      <section className="relative overflow-hidden rounded-3xl bg-granite-900 text-white p-8 sm:p-12 border border-granite-800 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-olive-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-olive-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-500/15 text-olive-300 border border-olive-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-olive-400" />
              <span>DIREKTORI RESMI EKOSISTEM KIRI</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Katalog Talenta Kreatif & Mitra Terkurasi
            </h1>

            <p className="text-sm sm:text-base text-granite-200 leading-relaxed font-normal max-w-2xl">
              Jelajahi <strong className="text-white font-bold">{entities.length} profil talenta kreatif</strong>, UMKM terverifikasi, komunitas lokal, dan media partner di seluruh Nusantara dengan jaminan kontrak dan escrow KIRI Project.
            </p>
          </div>

          {/* Toggle View: Grid vs Interactive Map */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="inline-flex p-1 rounded-xl bg-granite-950/80 border border-granite-800 shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`text-xs font-semibold gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-olive-600 text-white font-bold shadow-sm hover:bg-olive-600'
                    : 'text-granite-300 hover:text-white hover:bg-granite-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Katalog ({filteredEntities.length})</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('map')}
                className={`text-xs font-semibold gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-olive-600 text-white font-bold shadow-sm hover:bg-olive-600'
                    : 'text-granite-300 hover:text-white hover:bg-granite-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Interaktif Daerah ({totalGeoCreators})</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE MAP VIEW */}
      {viewMode === 'map' && (
        <Card className="p-6 sm:p-8 border-border shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 font-serif">
                <MapPin className="w-5 h-5 text-olive-600 dark:text-olive-400" />
                <span>Peta Sebaran Kreator Nusantara</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1 font-normal">
                Klik provinsi berwarna untuk menjelajahi detail talenta per kabupaten/kota.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Niche:</span>
                <select
                  value={geoNicheFilter}
                  onChange={(e) => setGeoNicheFilter(e.target.value)}
                  className="text-xs rounded-lg bg-background border border-border text-foreground px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-olive-500 font-medium"
                >
                  {geoNiches.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Followers:</span>
                <select
                  value={geoMinFollowers}
                  onChange={(e) => setGeoMinFollowers(Number(e.target.value))}
                  className="text-xs rounded-lg bg-background border border-border text-foreground px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-olive-500 font-medium"
                >
                  <option value={0}>Semua Ukuran</option>
                  <option value={1000}>&gt; 1,000</option>
                  <option value={5000}>&gt; 5,000</option>
                  <option value={10000}>&gt; 10,000</option>
                  <option value={50000}>&gt; 50,000</option>
                </select>
              </div>

              {selectedProvinceId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProvinceId(null)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Zoom</span>
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <MapChart
              mapData={filteredGeoMap}
              selectedRegionId={selectedProvinceId}
              onSelectRegion={(provId) => setSelectedProvinceId(provId)}
            />
            <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-white text-[11px] flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-olive-400"></span>
                Provinsi Aktif ({Object.keys(filteredGeoMap).length})
              </span>
              <span className="text-gray-400 font-mono">|</span>
              <span className="font-semibold">{totalGeoCreators} Kreator Terverifikasi</span>
            </div>
          </div>

          <GeoProfileModal
            province={activeSelectedProvince}
            onClose={() => setSelectedProvinceId(null)}
          />
        </Card>
      )}

      {/* 3. DIRECTORY GRID VIEW (Matte Granite + Studio White) */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {/* Filter Bar with Search & Segmented Controls */}
          <Card className="p-4 border-border shadow-xs">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari talenta, keahlian, nama kreator, atau kota domisili..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 text-xs font-medium w-full"
                />
              </div>

              {/* Entity Type Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                {(['all', 'creator', 'business', 'community', 'media'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={`text-xs font-semibold ${
                      selectedType === type
                        ? 'bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:text-granite-950 font-bold border-transparent'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {entityTypeLabels[type]}
                  </Button>
                ))}
              </div>

              {/* Verified Filter Toggle */}
              <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                <Button
                  variant={verifiedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`text-xs font-semibold gap-1.5 ${
                    verifiedOnly
                      ? 'bg-granite-900 text-white dark:bg-white dark:text-granite-950'
                      : 'text-muted-foreground'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-olive-500" />
                  <span>Terverifikasi</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Result Count and Current Range */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <p>
              Menampilkan <span className="font-bold text-foreground">{Math.min(filteredEntities.length, (currentPageNum - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredEntities.length, currentPageNum * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-foreground">{filteredEntities.length}</span> entitas terdaftar
            </p>
            {totalPages > 1 && (
              <p>Halaman <strong className="text-foreground">{currentPageNum}</strong> dari <strong className="text-foreground">{totalPages}</strong></p>
            )}
          </div>

          {/* Cards Grid */}
          {filteredEntities.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-border bg-card">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm font-bold text-foreground">
                Tidak ditemukan talenta yang cocok dengan filter pencarian.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coba sesuaikan kata kunci atau atur ulang opsi filter.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                    setVerifiedOnly(false);
                  }}
                  className="gap-2 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEntities.map((entity) => (
                <Card
                  key={entity.id}
                  className="overflow-hidden border-border/90 hover:border-olive-500/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 bg-card"
                >
                  <div>
                    {/* Top Accent Strip & Avatar Header */}
                    <div className="h-20 bg-gradient-to-r from-granite-900 via-granite-850 to-granite-800 relative p-4 flex items-start justify-between">
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/60 text-white backdrop-blur-md border border-white/20"
                      >
                        {entity.type}
                      </Badge>
                      {entity.verified && (
                        <Badge
                          variant="outline"
                          className="bg-olive-500/25 text-olive-300 border-olive-500/50 text-[10px] font-bold gap-1 px-2 py-0.5 backdrop-blur-md"
                        >
                          <ShieldCheck className="w-3 h-3 text-olive-400" />
                          <span>TERVERIFIKASI</span>
                        </Badge>
                      )}
                    </div>

                    {/* Avatar Overlap & Identity */}
                    <div className="px-5 pt-0 pb-4">
                      <div className="flex items-end justify-between -mt-8 mb-3">
                        <Avatar className="w-16 h-16 border-2 border-background ring-2 ring-olive-500/50 shadow-md">
                          <AvatarImage src={entity.avatar} alt={entity.name} />
                          <AvatarFallback className="bg-granite-900 text-olive-300 font-bold text-sm">
                            {getInitials(entity.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border bg-muted/40">
                          {entity.category}
                        </Badge>
                      </div>

                      <h3
                        onClick={() => {
                          if (entity.type === 'creator') navigateTo('page-04-creator-profile', entity.id);
                          else if (entity.type === 'business') navigateTo('page-05-business-profile', entity.id);
                          else if (entity.type === 'community') navigateTo('page-03-community-profile', entity.id);
                          else navigateTo('page-06-media-profile', entity.id);
                        }}
                        className="font-serif font-bold text-base text-foreground group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors cursor-pointer"
                      >
                        {entity.name}
                      </h3>

                      <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1 mb-2.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400 shrink-0" />
                        <span className="truncate">{entity.location}</span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                        {entity.bio}
                      </p>

                      {/* Tags in Shadcn Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {entity.tags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] font-semibold bg-muted/70 text-foreground border border-border/60 hover:bg-muted"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <CardFooter className="p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (entity.type === 'creator') navigateTo('page-04-creator-profile', entity.id);
                        else if (entity.type === 'business') navigateTo('page-05-business-profile', entity.id);
                        else if (entity.type === 'community') navigateTo('page-03-community-profile', entity.id);
                        else navigateTo('page-06-media-profile', entity.id);
                      }}
                      className="text-xs font-semibold text-foreground hover:text-olive-600 dark:hover:text-olive-400 gap-1 px-2.5"
                    >
                      <span>Lihat Profil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => openCollabModalFor(entity)}
                      className="bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 font-bold text-xs gap-1.5 shadow-2xs border border-olive-600/30"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kolaborasi</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Halaman <strong className="text-foreground">{currentPageNum}</strong> dari <strong className="text-foreground">{totalPages}</strong> ({filteredEntities.length} total)
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum(1)}
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1 px-2 text-xs font-bold text-foreground">
                  <span className="w-8 h-8 rounded-lg bg-olive-500/20 text-olive-700 dark:text-olive-300 border border-olive-500/40 flex items-center justify-center">
                    {currentPageNum}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                  className="gap-1 text-xs"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum(totalPages)}
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
