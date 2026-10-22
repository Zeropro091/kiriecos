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
import { Reveal, RevealGroup } from '../components/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const ITEMS_PER_PAGE = 12;

/**
 * Maps an entity to its public profile page. Every entity type needs an
 * explicit branch — routing by a trailing `else` silently sent `strategic`
 * partners to the media profile, making page-07-partner-profile unreachable
 * from the directory.
 */
const PROFILE_PAGE_BY_TYPE: Record<EntityType, string> = {
  creator: 'page-04-creator-profile',
  community: 'page-03-community-profile',
  business: 'page-05-business-profile',
  media: 'page-06-media-profile',
  strategic: 'page-07-partner-profile',
};

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

  // S11: consume the search handoff from the homepage hero (keyed after reading
  // so navigating back to the directory doesn't re-apply a stale query).
  React.useEffect(() => {
    try {
      const handoff = sessionStorage.getItem('kiri.directory.search');
      if (handoff) {
        setSearchQuery(handoff);
        sessionStorage.removeItem('kiri.directory.search');
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

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
    media: 'Media Partner',
    strategic: 'Mitra Strategis'
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
    <div className="mx-auto max-w-[1180px] px-5 lg:px-8 py-12 lg:py-16 space-y-10">
      <section>
        <RevealGroup className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-primary mb-4">
              Direktori Ekosistem
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] text-foreground text-balance">
              Katalog talenta &amp; mitra terkurasi
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {entities.length} profil kreator, UMKM, komunitas, media partner, dan mitra strategis
              di seluruh Nusantara.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-lg border border-border bg-card shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Katalog ({filteredEntities.length})</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm transition-colors ${
                viewMode === 'map'
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta ({totalGeoCreators})</span>
            </button>
          </div>
        </RevealGroup>
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
                {(['all', 'creator', 'business', 'community', 'media', 'strategic'] as const).map((type) => (
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
            <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEntities.map((entity) => (
                <Card
                  key={entity.id}
                  className="lift overflow-hidden border-border hover:border-primary/40 flex flex-col justify-between bg-card"
                >
                  <div>
                    <div className="aspect-[16/9] bg-secondary overflow-hidden">
                      <img
                        src={entity.coverImage || entity.avatar}
                        alt={entity.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <Avatar className="w-12 h-12 border border-border">
                          <AvatarImage src={entity.avatar} alt={entity.name} />
                          <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                            {getInitials(entity.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5">
                          {entity.verified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Terverifikasi</span>
                            </span>
                          )}
                          <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                            {entity.category}
                          </Badge>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigateTo(PROFILE_PAGE_BY_TYPE[entity.type] as any, entity.id)}
                        className="font-medium text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {entity.name}
                      </h3>

                      <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{entity.location}</span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {entity.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {entity.tags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[11px] font-normal text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <CardFooter className="p-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateTo(PROFILE_PAGE_BY_TYPE[entity.type] as any, entity.id)}
                      className="gap-1"
                    >
                      <span>Lihat Profil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => openCollabModalFor(entity)}
                    >
                      Kolaborasi
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </RevealGroup>
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
