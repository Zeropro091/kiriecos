import React, { useState } from 'react';
import { ProvinceGeoData } from '../data/geoTalentData';
import { X, MapPin, Phone, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GeoProfileModalProps {
  province: ProvinceGeoData | null;
  onClose: () => void;
}

export const GeoProfileModal: React.FC<GeoProfileModalProps> = ({ province, onClose }) => {
  const { openCollabModalFor, entities } = useApp();
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleCollabKiri = (creatorName: string) => {
    const creator = entities.find((e) => e.name.toLowerCase().includes(creatorName.toLowerCase())) || entities[0];
    openCollabModalFor(creator);
  };

  const isOpen = !!province;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-md bg-white dark:bg-kiri-dark-900 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out border-l border-kiri-green-900/10 dark:border-kiri-gold-500/20 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {province && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white px-6 py-5 flex items-center justify-between shadow-md border-b border-kiri-gold-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-kiri-gold-500/20 border border-kiri-gold-500/40 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-kiri-gold-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-white tracking-tight">{province.name}</h2>
                  <p className="text-[11px] text-kiri-gold-300 font-mono">
                    {province.cities.reduce((acc, c) => acc + c.creators.length, 0)} Talenta Terdaftar
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                aria-label="Tutup panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 dark:bg-kiri-dark-850/50 space-y-6">
              <p className="text-xs text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-kiri-dark-700 pb-3">
                Daftar talenta kreator dari provinsi <strong className="text-kiri-green-900 dark:text-kiri-gold-300">{province.name}</strong> yang terkurasi oleh KIRI PROJECT.
              </p>

              <div className="space-y-5">
                {province.cities.map((city, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-kiri-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-kiri-dark-700 transition-all"
                  >
                    <h3 className="text-sm font-bold text-kiri-green-950 dark:text-kiri-gold-400 mb-4 flex items-center border-b border-gray-100 dark:border-kiri-dark-700/60 pb-2">
                      <span className="w-2 h-2 bg-kiri-gold-500 rounded-full mr-2.5 shrink-0"></span>
                      {city.name}
                      <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-kiri-dark-700 text-gray-600 dark:text-gray-300 font-normal">
                        {city.creators.length} Kreator
                      </span>
                    </h3>

                    <div className="space-y-4">
                      {city.creators.map((creator, idx) => (
                        <div key={idx} className="flex gap-3.5 pt-1">
                          {/* Profile Avatar */}
                          {creator.profilePic ? (
                            <img
                              src={creator.profilePic.replace('open?id=', 'uc?id=')}
                              alt={creator.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-kiri-gold-500/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://ui-avatars.com/api/?name=' +
                                  encodeURIComponent(creator.name) +
                                  '&background=001710&color=d8ae5a';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl shrink-0 border border-kiri-gold-500/30 bg-kiri-green-950 text-kiri-gold-300 flex items-center justify-center font-bold text-sm">
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Creator Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate">
                                {creator.name}
                              </h4>
                              {creator.niche && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-kiri-gold-500/10 text-kiri-gold-700 dark:text-kiri-gold-300 shrink-0">
                                  {creator.niche}
                                </span>
                              )}
                            </div>

                            {creator.social && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-1">
                                {creator.social}
                              </p>
                            )}

                            {creator.followers && (
                              <p className="text-[11px] text-kiri-green-800 dark:text-kiri-gold-400 font-medium mb-2">
                                👥 {String(creator.followers)}
                              </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-kiri-dark-700/50">
                              {creator.whatsapp && (
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`https://wa.me/${String(creator.whatsapp).replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                                  >
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>WA</span>
                                  </a>
                                  <button
                                    onClick={() => handleCopy(String(creator.whatsapp))}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-kiri-dark-700"
                                    title="Salin nomor WhatsApp"
                                  >
                                    {copiedNumber === String(creator.whatsapp) ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {creator.portfolio && (
                                <a
                                  href={
                                    String(creator.portfolio).startsWith('http')
                                      ? String(creator.portfolio)
                                      : `https://${creator.portfolio}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-kiri-gold-600 dark:text-kiri-gold-400 hover:underline"
                                >
                                  <span>Portofolio</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}

                              {/* Request Through KIRI Direct Trigger */}
                              <button
                                onClick={() => handleCollabKiri(creator.name)}
                                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-kiri-green-950 dark:bg-kiri-gold-500 text-kiri-gold-300 dark:text-kiri-dark-950 hover:opacity-90 shadow-sm transition-all"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Request KIRI</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
