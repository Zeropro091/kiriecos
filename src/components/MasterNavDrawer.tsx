import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MASTER_PAGES, REFERENCE_IMAGES } from '../data/mockData';
import { PageId } from '../types';
import {
  X,
  Compass,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

export const MasterNavDrawer: React.FC = () => {
  const { isMasterNavOpen, setIsMasterNavOpen, currentPage, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'pages' | 'references'>('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isMasterNavOpen) return null;

  const groups = ['All', 'Public Experience', 'Entity Showcase', 'Onboarding & Registration', 'Authentication & Dashboards', 'Collaboration Flow', 'Admin & Operations'];

  const filteredPages = MASTER_PAGES.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.num.includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-kiri-dark-900 h-full shadow-2xl flex flex-col border-l border-kiri-green-900/10 dark:border-kiri-gold-500/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-kiri-dark-700 flex items-center justify-between bg-kiri-ivory-warm dark:bg-kiri-dark-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-kiri-green-800 text-kiri-gold-300">
                UI/UX Foundation
              </span>
              <h2 className="text-xl font-serif font-bold text-kiri-green-950 dark:text-white">
                Master Page Navigator
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Panduan {MASTER_PAGES.length} Halaman & Alur Ekosistem Sesuai Dokumen Resmi KIRI PROJECT
            </p>
          </div>
          <button
            onClick={() => setIsMasterNavOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-kiri-dark-750 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-kiri-dark-700 px-6 pt-3 bg-white dark:bg-kiri-dark-900 gap-4">
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pages'
                ? 'border-kiri-green-800 dark:border-kiri-gold-400 text-kiri-green-950 dark:text-kiri-gold-400'
                : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Master Pages ({MASTER_PAGES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'references'
                ? 'border-kiri-green-800 dark:border-kiri-gold-400 text-kiri-green-950 dark:text-kiri-gold-400'
                : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Asset Referensi Visual ({REFERENCE_IMAGES.length})</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'pages' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari halaman (contoh: Creator, Admin, Member, Payment)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-800 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              {/* Group Chips */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {groups.map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedGroup === grp
                        ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900 font-bold'
                        : 'bg-gray-100 dark:bg-kiri-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Pages */}
            <div className="space-y-2">
              {filteredPages.map((page) => {
                const isActive = currentPage === page.id;
                return (
                  <div
                    key={page.id}
                    onClick={() => {
                      navigateTo(page.id as PageId);
                      setIsMasterNavOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                      isActive
                        ? 'bg-kiri-green-50 dark:bg-kiri-dark-800 border-kiri-green-700 dark:border-kiri-gold-500 shadow-sm'
                        : 'bg-white dark:bg-kiri-dark-850 border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-400/60 hover:bg-gray-50/50 dark:hover:bg-kiri-dark-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-900'
                          : 'bg-gray-100 dark:bg-kiri-dark-750 text-gray-700 dark:text-gray-300'
                      }`}>
                        {page.num}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${
                            isActive
                              ? 'text-kiri-green-950 dark:text-kiri-gold-300'
                              : 'text-gray-900 dark:text-white group-hover:text-kiri-green-900 dark:group-hover:text-kiri-gold-300'
                          }`}>
                            {page.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-kiri-dark-700 text-gray-500 dark:text-gray-400">
                            {page.group}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {page.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center pt-1">
                      {isActive ? (
                        <span className="px-2 py-1 rounded text-[10px] bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-bold">
                          Sedang Aktif
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-kiri-green-900 dark:group-hover:text-kiri-gold-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Visual reference wireframe & mockups hasil ekstraksi resmi dari dokumen UI/UX Foundation.
              Klik pada gambar untuk memperbesar referensi.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {REFERENCE_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImage(`/assets/references/${img.name}`)}
                  className="rounded-xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden group cursor-pointer hover:border-kiri-gold-500 transition-all bg-gray-50 dark:bg-kiri-dark-800"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-900">
                    <img
                      src={`/assets/references/${img.name}`}
                      alt={img.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-90 group-hover:opacity-100"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white">
                      REF {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {img.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{img.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 flex items-center justify-between text-xs text-gray-500">
          <span>KIRI PROJECT UI/UX Guide Compliance</span>
          <button
            onClick={() => setIsMasterNavOpen(false)}
            className="px-4 py-2 rounded-lg bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-semibold"
          >
            Tutup Navigator
          </button>
        </div>
      </div>

      {/* Lightbox for References */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 p-4 flex flex-col items-center justify-center animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Reference Mockup Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg border border-white/20 shadow-2xl"
          />
          <p className="text-white text-xs mt-3 opacity-70">
            Klik di mana saja untuk menutup pratinjau referensi visual
          </p>
        </div>
      )}
    </div>
  );
};
