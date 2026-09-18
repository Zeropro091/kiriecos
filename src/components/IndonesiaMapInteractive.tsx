import React, { useState } from 'react';
import { Entity } from '../types';
import { MapPin, Users, Sparkles, Building2, CheckCircle2, ChevronRight } from 'lucide-react';

interface RegionData {
  id: string;
  name: string;
  island: string;
  coordinates: { cx: number; cy: number };
  pathD?: string;
  description: string;
}

const INDONESIA_REGIONS: RegionData[] = [
  { id: 'bali', name: 'Bali (HQ Hub)', island: 'Nusa Tenggara', coordinates: { cx: 520, cy: 260 }, description: 'Pusat Kreator & Hub Utama KIRI Project (Ubud, Denpasar, Canggu, Tabanan, Bangli)' },
  { id: 'jakarta', name: 'DKI Jakarta', island: 'Jawa', coordinates: { cx: 270, cy: 230 }, description: 'Hub Brand & Media Partner Strategis' },
  { id: 'jabar', name: 'Jawa Barat (Bandung)', island: 'Jawa', coordinates: { cx: 295, cy: 240 }, description: 'Komunitas Desain & Artisan Fashion' },
  { id: 'jateng_diy', name: 'DI Yogyakarta & Jateng', island: 'Jawa', coordinates: { cx: 375, cy: 245 }, description: 'Kolektif Seni Budaya & Content Creator Heritage' },
  { id: 'jatim', name: 'Jawa Timur (Surabaya/Malang)', island: 'Jawa', coordinates: { cx: 450, cy: 250 }, description: 'Jaringan Kreator Kuliner & UMKM Olahan' },
  { id: 'sumut', name: 'Sumatera Utara (Medan)', island: 'Sumatera', coordinates: { cx: 120, cy: 110 }, description: 'Kanal Media Regional & Travel Creator' },
  { id: 'sumbar', name: 'Sumatera Barat', island: 'Sumatera', coordinates: { cx: 160, cy: 170 }, description: 'Artisan Kopi & Komunitas Fotografi' },
  { id: 'sulsel', name: 'Sulawesi Selatan (Makassar)', island: 'Sulawesi', coordinates: { cx: 620, cy: 195 }, description: 'Kreator Sinematografi & Digital Media Hub' },
  { id: 'kalbar', name: 'Kalimantan Barat', island: 'Kalimantan', coordinates: { cx: 370, cy: 155 }, description: 'Komunitas Eco-Tourism & Kriya' },
  { id: 'ntb', name: 'Nusa Tenggara Barat (Lombok)', island: 'Nusa Tenggara', coordinates: { cx: 565, cy: 265 }, description: 'Destinasi Content Creator & Hospitality Partner' },
  { id: 'papua', name: 'Papua (Jayapura)', island: 'Papua', coordinates: { cx: 900, cy: 180 }, description: 'Jaringan Narasi Budaya & Alam Ekosistem' },
];

interface IndonesiaMapInteractiveProps {
  entities: Entity[];
  onSelectLocation?: (locationName: string) => void;
  selectedLocation?: string;
}

export const IndonesiaMapInteractive: React.FC<IndonesiaMapInteractiveProps> = ({
  entities,
  onSelectLocation,
  selectedLocation = 'all',
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

  // Helper to count active entities per region
  const getRegionStats = (regionId: string) => {
    return entities.filter((e) => {
      const loc = e.location.toLowerCase();
      if (regionId === 'bali') return loc.includes('bali') || loc.includes('ubud') || loc.includes('denpasar') || loc.includes('canggu') || loc.includes('tabanan');
      if (regionId === 'jakarta') return loc.includes('jakarta');
      if (regionId === 'jabar') return loc.includes('bandung') || loc.includes('jawa barat');
      if (regionId === 'jateng_diy') return loc.includes('jogja') || loc.includes('yogyakarta') || loc.includes('semarang');
      if (regionId === 'jatim') return loc.includes('surabaya') || loc.includes('malang');
      if (regionId === 'sumut') return loc.includes('medan') || loc.includes('sumatera utara');
      if (regionId === 'sulsel') return loc.includes('makassar') || loc.includes('sulawesi');
      return false;
    });
  };

  return (
    <div className="bg-gradient-to-b from-kiri-dark-950 via-kiri-green-950 to-kiri-dark-900 rounded-3xl p-6 sm:p-8 border border-kiri-gold-500/30 shadow-2xl text-white relative overflow-hidden space-y-6">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-kiri-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-kiri-green-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-kiri-gold-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-kiri-gold-500 text-kiri-dark-950">
              Interactive Regional Coverage
            </span>
            <span className="text-xs text-kiri-gold-300 font-serif italic">Nusantara Ecosystem Map</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Peta Persebaran Kreator KIRI PROJECT
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Daerah berwarna <span className="text-kiri-gold-400 font-bold">EMAS TERANG (GOLD)</span> menandakan wilayah yang telah aktif memiliki talenta kreator, komunitas terverifikasi, dan jaringan mitra KIRI.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-kiri-dark-850/80 p-3 rounded-2xl border border-kiri-gold-500/20 text-xs backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-kiri-gold-400 to-amber-300 shadow-gold-glow animate-pulse"></span>
            <span className="text-gray-200 font-medium">Aktif Kreator KIRI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-kiri-green-800/80 border border-kiri-green-600"></span>
            <span className="text-gray-400">Ekspansi Prospektif</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual (SVG Canvas) */}
      <div className="relative w-full overflow-x-auto py-4">
        <div className="min-w-[800px] relative">
          <svg
            viewBox="0 0 1000 400"
            className="w-full h-auto drop-shadow-2xl select-none"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
          >
            {/* Background Map Grid & Decorative Lines */}
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(216, 174, 90, 0.05)" strokeWidth="1" />
            </pattern>
            <rect width="1000" height="400" fill="url(#mapGrid)" rx="16" />

            {/* Stylized Indonesia Archipelago SVG Paths */}
            <g fill="#162E25" stroke="#2D5A4A" strokeWidth="1.5" opacity="0.6">
              {/* Sumatra */}
              <path d="M 70 80 L 140 50 L 220 140 L 250 190 L 210 220 L 150 180 L 100 130 Z" />
              {/* Java */}
              <path d="M 260 230 L 330 235 L 420 245 L 490 255 L 490 265 L 400 260 L 320 250 L 260 245 Z" />
              {/* Kalimantan */}
              <path d="M 330 110 L 420 90 L 460 140 L 430 195 L 360 190 L 320 150 Z" />
              {/* Sulawesi */}
              <path d="M 580 140 L 610 120 L 630 160 L 660 150 L 630 180 L 620 230 L 600 220 L 590 180 L 570 170 Z" />
              {/* Nusa Tenggara / Bali */}
              <path d="M 505 258 L 535 260 L 535 268 L 505 268 Z" /> {/* Bali */}
              <path d="M 545 260 L 585 262 L 585 270 L 545 268 Z" /> {/* Lombok/Sumbawa */}
              <path d="M 595 262 L 650 265 L 650 275 L 595 270 Z" /> {/* Flores */}
              {/* Maluku */}
              <path d="M 680 140 L 710 130 L 720 170 L 690 180 Z" />
              {/* Papua */}
              <path d="M 770 160 L 850 130 L 940 140 L 950 220 L 870 210 L 830 200 L 780 180 Z" />
            </g>

            {/* Connecting Arc Lines from Bali HQ */}
            <g stroke="rgba(216, 174, 90, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
              {INDONESIA_REGIONS.filter(r => r.id !== 'bali').map((r) => (
                <path
                  key={`line-${r.id}`}
                  d={`M 520 260 Q ${(520 + r.coordinates.cx) / 2} ${Math.min(260, r.coordinates.cy) - 40} ${r.coordinates.cx} ${r.coordinates.cy}`}
                />
              ))}
            </g>

            {/* Region Interactive Pins */}
            {INDONESIA_REGIONS.map((region) => {
              const matchedEntities = getRegionStats(region.id);
              const isActiveRegion = matchedEntities.length > 0 || region.id === 'bali' || region.id === 'jakarta';
              const isSelected = selectedLocation.toLowerCase().includes(region.name.split(' ')[0].toLowerCase());

              return (
                <g
                  key={region.id}
                  transform={`translate(${region.coordinates.cx}, ${region.coordinates.cy})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectLocation && onSelectLocation(region.name.split(' ')[0])}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Outer Pulsing Glow Ring for Active Regions */}
                  {isActiveRegion && (
                    <circle
                      r="18"
                      className="fill-kiri-gold-500/20 animate-ping opacity-75"
                    />
                  )}

                  {/* Main Pin Base Circle */}
                  <circle
                    r={isSelected ? '14' : '11'}
                    className={`transition-all duration-300 ${
                      isActiveRegion
                        ? 'fill-gradient-to-r from-kiri-gold-400 to-amber-500 stroke-kiri-gold-200 stroke-2 drop-shadow-gold-glow'
                        : 'fill-kiri-green-900 stroke-kiri-green-600 stroke-1'
                    }`}
                    style={{
                      fill: isActiveRegion ? '#D8AE5A' : '#0F543F',
                      stroke: isActiveRegion ? '#FFF' : '#3DAB88',
                    }}
                  />

                  {/* Inner Dot Icon */}
                  <circle
                    r="4"
                    fill={isActiveRegion ? '#110E07' : '#A4E3CD'}
                  />

                  {/* Region Label Tag */}
                  <g transform="translate(0, 22)">
                    <rect
                      x="-45"
                      y="-10"
                      width="90"
                      height="18"
                      rx="9"
                      fill={isActiveRegion ? '#110E07' : '#0A0805'}
                      stroke={isActiveRegion ? '#D8AE5A' : '#2D2920'}
                      strokeWidth="1"
                      className="opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isActiveRegion ? '#F5D78B' : '#A5A095'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {region.name.split(' ')[0]} {matchedEntities.length > 0 ? `(${matchedEntities.length})` : ''}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hovered or Featured Region Card Info */}
      <div className="bg-kiri-dark-850/90 rounded-2xl p-5 border border-kiri-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-kiri-gold-400" />
            <h3 className="font-serif font-bold text-lg text-white">
              {hoveredRegion ? hoveredRegion.name : 'Wilayah Fokus Utama: Bali HQ & Jawa'}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-kiri-gold-500/20 text-kiri-gold-300 border border-kiri-gold-500/30">
              {hoveredRegion ? hoveredRegion.island : 'HQ Hub'}
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {hoveredRegion
              ? hoveredRegion.description
              : 'Seluruh kreator Bali & sekitarnya dikurasi melalui pintu terpusat KIRI PROJECT untuk menjamin standar profesionalisme.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Entitas Terdaftar</p>
            <p className="text-sm font-bold text-kiri-gold-300 font-serif">
              {hoveredRegion
                ? `${getRegionStats(hoveredRegion.id).length} Entitas Aktif`
                : `${entities.length} Entitas Nasional`}
            </p>
          </div>

          <button
            onClick={() => onSelectLocation && onSelectLocation(hoveredRegion ? hoveredRegion.name.split(' ')[0] : 'all')}
            className="px-4 py-2 rounded-xl bg-kiri-gold-500 text-kiri-dark-950 font-bold text-xs hover:bg-kiri-gold-400 transition-all flex items-center gap-1.5 shadow"
          >
            <span>Filter Region Ini</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
