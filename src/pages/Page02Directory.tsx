import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Users,
  Grid,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { EntityType } from '../types';
import MapChart from '../components/GeoMapChart';
import { GeoProfileModal } from '../components/GeoProfileModal';
import {
  getFilteredGeoMapData,
  geoNiches,
  ProvinceGeoData
} from '../data/geoTalentData';

export const Page02Directory: React.FC = () => {
  const { entities, navigateTo, openCollabModalFor } = useApp();

  // Directory Grid state
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Interactive Geo-Map State (from Zeropro091/map integration)
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

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    entities.forEach((e) => cats.add(e.category));
    return Array.from(cats);
  }, [entities]);

  const totalGeoCreators = useMemo(() => {
    return Object.values(filteredGeoMap).reduce(
      (acc, prov) => acc + prov.cities.reduce((cAcc, city) => cAcc + city.creators.length, 0),
      0
    );
  }, [filteredGeoMap]);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. DIRECTORY HEADER */}
      <section className="bg-gradient-to-br from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-6 sm:p-10 border border-kiri-gold-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-kiri-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-kiri-gold-500/10 border border-kiri-gold-500/30 text-kiri-gold-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KIRI PROJECT TALENT ECOSYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 tracking-tight">
            Direktori & Peta Talenta Indonesia
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Eksplorasi direktori talenta terkurasi, UMKM, dan kreator regional dari Bali hingga Sulawesi Tengah. Temukan kreator yang tepat atau jelajahi peta interaktif daerah.
          </p>

          {/* Quick Toggle Mode */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="bg-kiri-dark-950/80 p-1 rounded-xl border border-kiri-gold-500/30 inline-flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-kiri-gold-500 text-kiri-dark-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid Direktori ({filteredEntities.length})</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-kiri-gold-500 text-kiri-dark-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Interaktif Daerah ({totalGeoCreators} Terdaftar)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAP VIEW SECTION (Integrated Zeropro091/map) */}
      {viewMode === 'map' && (
        <section className="bg-white dark:bg-kiri-dark-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-kiri-gold-500/20 shadow-md space-y-6">
          {/* Map Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-kiri-dark-700 pb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 font-serif">
                <MapPin className="w-5 h-5 text-kiri-gold-500" />
                <span>Peta Sebaran Kreator Nusantara</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Klik provinsi berwarna emas (gold) untuk zoom in dan melihat daftar kreator per kabupaten/kota.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Niche Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Niche:</label>
                <select
                  value={geoNicheFilter}
                  onChange={(e) => setGeoNicheFilter(e.target.value)}
                  className="text-xs rounded-xl bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:border-kiri-gold-500"
                >
                  {geoNiches.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Followers Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Followers:</label>
                <select
                  value={geoMinFollowers}
                  onChange={(e) => setGeoMinFollowers(Number(e.target.value))}
                  className="text-xs rounded-xl bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:border-kiri-gold-500"
                >
                  <option value={0}>Semua Ukuran</option>
                  <option value={1000}>&gt; 1,000</option>
                  <option value={5000}>&gt; 5,000</option>
                  <option value={10000}>&gt; 10,000</option>
                  <option value={50000}>&gt; 50,000</option>
                </select>
              </div>

              {/* Reset Zoom / Selection */}
              {selectedProvinceId && (
                <button
                  onClick={() => setSelectedProvinceId(null)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 hover:bg-kiri-gold-500 hover:text-black font-semibold transition-colors"
                >
                  Reset Zoom Peta
                </button>
              )}
            </div>
          </div>

          {/* Interactive Map Component */}
          <div className="relative">
            <MapChart
              mapData={filteredGeoMap}
              selectedRegionId={selectedProvinceId}
              onSelectRegion={(provId) => setSelectedProvinceId(provId)}
            />

            {/* Quick Stat Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-kiri-gold-500/30 text-white text-[11px] flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5B041]"></span>
                Provinsi Aktif ({Object.keys(filteredGeoMap).length})
              </span>
              <span className="text-kiri-gold-300 font-mono">|</span>
              <span>{totalGeoCreators} Kreator Terverifikasi</span>
            </div>
          </div>

          {/* Side Drawer Profile Modal */}
          <GeoProfileModal
            province={activeSelectedProvince}
            onClose={() => setSelectedProvinceId(null)}
          />
        </section>
      )}

      {/* 3. GRID VIEW SECTION (Default KIRI Directory) */}
      {viewMode === 'grid' && (
        <>
          {/* Filters Bar */}
          <section className="bg-white dark:bg-kiri-dark-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-kiri-dark-700 shadow-sm flex flex-col md:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari talenta, videografer, UMKM, nama kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-kiri-gold-500 transition-colors"
              />
            </div>

            {/* Type Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
              {(['all', 'creator', 'business', 'community', 'media'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedType === type
                      ? 'bg-kiri-green-950 dark:bg-kiri-gold-500 text-kiri-gold-300 dark:text-kiri-dark-950 shadow-sm'
                      : 'bg-gray-100 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-kiri-dark-700'
                  }`}
                >
                  {type === 'all'
                    ? 'Semua'
                    : type === 'creator'
                    ? 'Kreator'
                    : type === 'business'
                    ? 'UMKM / Brand'
                    : type === 'community'
                    ? 'Komunitas'
                    : 'Media Partner'}
                </button>
              ))}
            </div>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-kiri-gold-500 focus:ring-0 w-4 h-4 bg-gray-100 dark:bg-kiri-dark-800 border-gray-300 dark:border-kiri-dark-700"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Terkurasi KIRI Only
              </span>
            </label>
          </section>

          {/* Cards Grid */}
          <section>
            {filteredEntities.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-kiri-dark-900 rounded-2xl border border-gray-200 dark:border-kiri-dark-700">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Tidak ditemukan talenta yang cocok dengan filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSearchQuery('');
                    setVerifiedOnly(false);
                  }}
                  className="mt-3 text-xs text-kiri-gold-600 dark:text-kiri-gold-400 font-bold hover:underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className="bg-white dark:bg-kiri-dark-900 rounded-2xl border border-gray-200 dark:border-kiri-dark-700/80 hover:border-kiri-gold-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Card Header & Avatar */}
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={entity.avatar}
                              alt={entity.name}
                              className="w-12 h-12 rounded-xl object-cover border border-kiri-gold-500/20 group-hover:scale-105 transition-transform"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                  {entity.name}
                                </h3>
                                {entity.verified && (
                                  <ShieldCheck className="w-4 h-4 text-kiri-gold-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {entity.category}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-400">
                            {entity.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          {entity.bio}
                        </p>

                        <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-kiri-gold-500" />
                          <span>
                            {entity.location}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {entity.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-50 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-kiri-dark-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-kiri-dark-850 border-t border-gray-100 dark:border-kiri-dark-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (entity.type === 'creator') navigateTo('page-04-creator-profile');
                          else if (entity.type === 'business') navigateTo('page-05-business-profile');
                          else if (entity.type === 'community') navigateTo('page-03-community-profile');
                          else navigateTo('page-06-media-profile');
                        }}
                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-kiri-gold-600 dark:hover:text-kiri-gold-400 flex items-center gap-1"
                      >
                        <span>Lihat Profil</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openCollabModalFor(entity)}
                        className="px-3 py-1.5 rounded-xl bg-kiri-green-950 dark:bg-kiri-gold-500 text-kiri-gold-300 dark:text-kiri-dark-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Request KIRI</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
