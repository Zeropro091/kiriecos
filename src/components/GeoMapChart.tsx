import React, { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { ProvinceGeoData } from '../data/geoTalentData';

const geoUrl = 'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';

interface MapChartProps {
  mapData: Record<string, ProvinceGeoData>;
  onSelectRegion: (provinceId: string) => void;
  selectedRegionId: string | null;
}

const MapChart: React.FC<MapChartProps> = ({ mapData, onSelectRegion, selectedRegionId }) => {
  const selectedProvince = selectedRegionId ? mapData[selectedRegionId] : null;
  const mapCenter = selectedProvince
    ? [selectedProvince.coordinates[0] + 3.0, selectedProvince.coordinates[1]]
    : [118, -2];
  const mapZoom = selectedProvince ? 4.2 : 1;

  return (
    <div className="w-full h-[400px] sm:h-[460px] bg-kiri-dark-950 rounded-2xl overflow-hidden flex items-center justify-center relative border border-kiri-gold-500/20 shadow-inner">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1050,
          center: [118, -2] // Base center over Indonesia
        }}
        width={800}
        height={400}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup
          zoom={mapZoom}
          center={mapCenter as [number, number]}
          filterZoomEvent={(e) => {
            if (e.type === 'wheel') return false;
            return true;
          }}
          minZoom={1}
          maxZoom={6}
          style={{ transition: 'transform 800ms ease-in-out' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provinceId = (geo.properties as any)?.Propinsi ?? '';
                const isHighlight = Object.keys(mapData).includes(provinceId);
                const isSelected = selectedRegionId === provinceId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isHighlight) {
                        onSelectRegion(provinceId);
                      }
                    }}
                    fill={isSelected ? '#D8AE5A' : isHighlight ? '#F5B041' : '#162E25'}
                    stroke="#001710"
                    strokeWidth={0.7}
                    style={{
                      outline: 'none',
                      cursor: isHighlight ? 'pointer' : 'default',
                      transition: 'fill 300ms ease'
                    }}
                    className={isHighlight ? 'hover:brightness-125' : ''}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(MapChart);
