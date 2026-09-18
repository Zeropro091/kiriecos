import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export const CollabRequestModal: React.FC = () => {
  const {
    isCollabModalOpen,
    setIsCollabModalOpen,
    collabTargetEntity,
    navigateTo,
  } = useApp();

  if (!isCollabModalOpen || !collabTargetEntity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-kiri-dark-850 rounded-2xl max-w-xl w-full border border-kiri-green-900/20 dark:border-kiri-gold-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-kiri-green-950 to-kiri-green-900 text-white p-6 relative">
          <button
            onClick={() => setIsCollabModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-kiri-gold-500 text-kiri-dark-950">
              PAGE 20 — Official Collab Gateway
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            Request Through KIRI Project
          </h3>
          <p className="text-xs text-kiri-gold-200 mt-1">
            Menghubungkan Anda dengan <strong>{collabTargetEntity.name}</strong> melalui sistem kurasi aman terpercaya.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-kiri-ivory-warm dark:bg-kiri-dark-800 border border-kiri-gold-500/20">
            <img
              src={collabTargetEntity.avatar}
              alt={collabTargetEntity.name}
              className="w-14 h-14 rounded-xl object-cover border border-kiri-gold-500/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-kiri-green-950 dark:text-white truncate">
                  {collabTargetEntity.name}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-kiri-green-800/10 text-kiri-green-800 dark:text-kiri-gold-300 dark:bg-kiri-gold-500/20 capitalize shrink-0">
                  {collabTargetEntity.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {collabTargetEntity.handle} • {collabTargetEntity.category}
              </p>
              <p className="text-xs text-kiri-green-800 dark:text-kiri-gold-400 font-medium mt-1">
                📍 {collabTargetEntity.location}
              </p>
            </div>
          </div>

          {/* Why Request Through KIRI Project? (Handoff Rule Explanation) */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-kiri-green-900 dark:text-kiri-gold-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-kiri-gold-600" />
              <span>Standar Ekosistem KIRI PROJECT</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700">
                <p className="font-bold text-kiri-green-950 dark:text-white">1. Kurasi & Proteksi</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                  Brief Anda ditelaah tim ahli untuk menjamin output profesional & kepatuhan hak cipta.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700">
                <p className="font-bold text-kiri-green-950 dark:text-white">2. Keamanan Dana</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                  Sistem escrow terpercaya. Pembayaran hanya cair setelah deliverables disetujui.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700">
                <p className="font-bold text-kiri-green-950 dark:text-white">3. Fasilitasi Admin</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                  Kak Rini & Tim kurasi mendampingi matchmaking dari kickoff hingga pelaporan dampak.
                </p>
              </div>
            </div>
          </div>

          {/* Available Services Sample */}
          {collabTargetEntity.services && collabTargetEntity.services.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Pilihan Layanan Terdaftar:
              </p>
              <div className="space-y-1.5">
                {collabTargetEntity.services.slice(0, 2).map((srv) => (
                  <div
                    key={srv.id}
                    className="p-2.5 rounded-lg border border-gray-200 dark:border-kiri-dark-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-kiri-green-950 dark:text-white">{srv.name}</p>
                      <p className="text-[11px] text-gray-400">{srv.deliverables.slice(0, 2).join(' • ')}</p>
                    </div>
                    <span className="font-bold text-kiri-green-900 dark:text-kiri-gold-400 shrink-0 ml-2">
                      {srv.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-gray-50 dark:bg-kiri-dark-900 border-t border-gray-100 dark:border-kiri-dark-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Siap mengisi brief proyek? Lanjutkan ke formulir terstruktur.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsCollabModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-kiri-dark-700 hover:bg-gray-100 dark:hover:bg-kiri-dark-800 text-gray-700 dark:text-gray-300 flex-1 sm:flex-none"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setIsCollabModalOpen(false);
                navigateTo('page-21-collab-brief-form', collabTargetEntity.id);
              }}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-95 shadow flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <span>Lanjut ke Formulir Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
