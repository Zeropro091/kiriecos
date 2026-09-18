import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EntityType, Entity, PageId } from '../types';
import { IndonesiaMapInteractive } from '../components/IndonesiaMapInteractive';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Users,
  Building2,
  Newspaper,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Page02Directory: React.FC = () => {
  const { entities, navigateTo, openCollabModalFor } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const entityTypeMap: Record<string, { label: string; icon: React.ReactNode }> = {
    all: { label: 'Semua Entitas', icon: <Sparkles className="w-3.5 h-3.5" /> },
    creator: { label: 'Kreator Konten', icon: <Users className="w-3.5 h-3.5" /> },
    community: { label: 'Komunitas Kreatif', icon: <Users className="w-3.5 h-3.5" /> },
    business: { label: 'Bisnis & UMKM', icon: <Building2 className="w-3.5 h-3.5" /> },
    media: { label: 'Media Partner', icon: <Newspaper className="w-3.5 h-3.5" /> },
    strategic: { label: 'Mitra Strategis', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  };

  const filteredEntities = entities.filter((e) => {
    const matchesType = selectedType === 'all' || e.type === selectedType;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLoc = selectedLocation === 'all' || e.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesType && matchesSearch && matchesLoc;
  });

  const getProfilePageForType = (type: EntityType): PageId => {
    switch (type) {
      case 'community':
        return 'page-03-community-profile';
      case 'creator':
        return 'page-04-creator-profile';
      case 'business':
        return 'page-05-business-profile';
      case 'media':
        return 'page-06-media-profile';
      case 'strategic':
        return 'page-07-partner-profile';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 sm:p-10 border border-kiri-gold-500/30 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-kiri-gold-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400" />
            <span>PAGE 02 — Direktori Ekosistem Terkurasi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ecosystem Directory
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed font-light">
            Eksplorasi seluruh talenta kreator, komunitas seni, brand UMKM, dan kanal media yang telah diverifikasi dan siap berkolaborasi melalui sistem KIRI PROJECT.
          </p>
        </div>
      </div>

      {/* Interactive Indonesia Regional Map */}
      <IndonesiaMapInteractive
        entities={entities}
        selectedLocation={selectedLocation}
        onSelectLocation={(locName) => setSelectedLocation(locName)}
      />

      {/* Filter and Controls Toolbar */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
        {/* Entity Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-kiri-dark-700 pb-4">
          {Object.entries(entityTypeMap).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedType === key
                  ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 shadow-sm'
                  : 'bg-gray-100 dark:bg-kiri-dark-750 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-kiri-dark-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Search, Location, View Mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, niche, keahlian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">Semua Lokasi</option>
              <option value="bali">Bali (Semua Wilayah)</option>
              <option value="ubud">Ubud</option>
              <option value="denpasar">Denpasar</option>
              <option value="canggu">Canggu</option>
              <option value="jakarta">Jakarta</option>
            </select>

            {/* Grid / List switcher */}
            <div className="flex items-center bg-gray-100 dark:bg-kiri-dark-750 rounded-xl p-1 border border-gray-200 dark:border-kiri-dark-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-kiri-dark-850 shadow text-kiri-green-900 dark:text-kiri-gold-400'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-kiri-dark-850 shadow text-kiri-green-900 dark:text-kiri-gold-400'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Menampilkan {filteredEntities.length} entitas terverifikasi dalam ekosistem</span>
        <span className="font-semibold text-kiri-gold-700 dark:text-kiri-gold-400">
          Kurasi Resmi KIRI PROJECT
        </span>
      </div>

      {/* Grid or List Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity) => {
            const profilePage = getProfilePageForType(entity.type);
            return (
              <div
                key={entity.id}
                className="rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle hover:shadow-elevated hover:border-kiri-gold-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cover */}
                  <div className="h-36 relative overflow-hidden bg-gray-200">
                    <img
                      src={entity.coverImage}
                      alt={entity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-kiri-gold-300 backdrop-blur-sm border border-kiri-gold-500/30">
                      {entity.badge || entity.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 pt-0 relative">
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      <img
                        src={entity.avatar}
                        alt={entity.name}
                        className="w-16 h-16 rounded-xl object-cover border-4 border-white dark:border-kiri-dark-800 shadow-md"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kiri-gold-600" />
                        {entity.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white truncate">
                        {entity.name}
                      </h3>
                      {entity.verified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-kiri-green-800 dark:text-kiri-gold-400 font-medium">
                      {entity.handle} • {entity.category}
                    </p>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {entity.bio}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entity.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-kiri-ivory-warm dark:bg-kiri-dark-750 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-kiri-dark-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700 text-xs">
                      {entity.stats.slice(0, 2).map((s, idx) => (
                        <div key={idx}>
                          <p className="text-[10px] text-gray-400 uppercase truncate">{s.label}</p>
                          <p className="font-bold text-kiri-green-900 dark:text-kiri-gold-300 truncate">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 border-t border-gray-100 dark:border-kiri-dark-700 mt-4 flex items-center gap-2">
                  <button
                    onClick={() => navigateTo(profilePage, entity.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 transition-all text-center"
                  >
                    Buka Profil
                  </button>
                  <button
                    onClick={() => openCollabModalFor(entity)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-90 shadow-sm transition-all text-center"
                  >
                    Request Collab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {filteredEntities.map((entity) => {
            const profilePage = getProfilePageForType(entity.type);
            return (
              <div
                key={entity.id}
                className="p-5 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-kiri-gold-500/50 transition-all shadow-subtle"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={entity.avatar}
                    alt={entity.name}
                    className="w-14 h-14 rounded-xl object-cover border border-kiri-gold-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">
                        {entity.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-kiri-green-50 dark:bg-kiri-dark-700 text-kiri-green-800 dark:text-kiri-gold-400 capitalize">
                        {entity.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entity.handle} • {entity.category} • 📍 {entity.location}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1 max-w-xl">
                      {entity.bio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => navigateTo(profilePage, entity.id)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 transition-all"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => openCollabModalFor(entity)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-semibold bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-90 shadow-sm transition-all"
                  >
                    Request Collab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
