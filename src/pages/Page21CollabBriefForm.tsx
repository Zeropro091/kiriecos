import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const Page21CollabBriefForm: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, submitCollabRequest, currentUser } = useApp();

  const targetEntity =
    entities.find((e) => e.id === selectedEntityId) || entities[0];

  const [title, setTitle] = useState('Kampanye Visual Cold Brew Batur Organik');
  const [category, setCategory] = useState('Cinematic Reel & Review');
  const [budget, setBudget] = useState('Rp 5.500.000');
  const [timeline, setTimeline] = useState('15 Sep 2026 - 30 Sep 2026');
  const [scope, setScope] = useState(
    'Pembuatan 1x video sinematik 4K reels tentang kebun kopi dan honest review rasa cold brew untuk peluncuran menu baru.'
  );

  const [deliverables, setDeliverables] = useState<string[]>([
    '1x Instagram Reel 4K (60 detik)',
    '1x TikTok Cut (9:16)',
    '3x Live Story Snippets saat kunjungan',
    'Hak Pakai Komersial 6 Bulan',
  ]);

  const [newDeliverable, setNewDeliverable] = useState('');

  const handleAddDeliverable = () => {
    if (!newDeliverable) return;
    setDeliverables([...deliverables, newDeliverable]);
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCollabRequest({
      title,
      category,
      targetId: targetEntity.id,
      targetName: targetEntity.name,
      targetType: targetEntity.type,
      budget,
      timeline,
      scope,
      deliverables,
    });
    navigateTo('page-22-collab-success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 21 — Formulir Brief Kolaborasi & Layanan</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white">
          Formulir Brief Kolaborasi
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Rancang brief proyek terstruktur untuk ditelaah oleh tim kurator KIRI PROJECT sebelum difinalisasi bersama talenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-8">
        {/* Selected Target Entity Banner */}
        <div className="p-4 rounded-2xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-kiri-gold-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={targetEntity.avatar}
              alt={targetEntity.name}
              className="w-12 h-12 rounded-xl object-cover border border-kiri-gold-500/40"
            />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Ditujukan Kepada:</span>
              <h3 className="font-serif font-bold text-base text-kiri-green-950 dark:text-white">
                {targetEntity.name}
              </h3>
              <p className="text-[11px] text-kiri-gold-700 dark:text-kiri-gold-400">
                {targetEntity.handle} • {targetEntity.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('page-02-directory')}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-kiri-dark-600 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100"
          >
            Ganti Talenta
          </button>
        </div>

        {/* Section 1: Project Information */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
            1. Judul & Kategori Proyek
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Judul Kampanye / Nama Proyek *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kategori Layanan *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="Cinematic Reel & Review">Cinematic Reel & Honest Review</option>
                <option value="Product Photography Catalog">Product Photography & Visual Catalog</option>
                <option value="Full Brand Launch Campaign">Full Brand Launch Campaign</option>
                <option value="Press Release & Editorial">Press Release & Media Editorial</option>
                <option value="Workshop & Community Event">Workshop & Community Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Timeline */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
            2. Anggaran & Jadwal Eksekusi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alokasi Anggaran / Tawaran Fee (IDR) *
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Rentang Waktu Pelaksanaan *
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scope of Work & Deliverables */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
            3. Scope of Work & Deliverables Terperinci
          </h3>

          <div className="text-xs space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi Brief & Arahan Kreatif *
              </label>
              <textarea
                rows={4}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500 leading-relaxed"
                required
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Daftar Deliverables yang Wajib Diserahkan:
              </label>

              <div className="space-y-2 mb-3">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-kiri-dark-850 border border-gray-200 dark:border-kiri-dark-700 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-gray-400 hover:text-red-500 text-[11px]"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah deliverable spesifik..."
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-kiri-dark-700 text-gray-800 dark:text-gray-200 font-semibold"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow & Verification Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">
              Jaminan Mediasi Resmi KIRI PROJECT (Kak Rini & Tim):
            </p>
            <p>
              Setelah formulir ini dikirimkan, request akan tercatat di sistem admin KIRI (PAGE 25). Tim kami akan memvalidasi kesiapan target talenta, mengunci rekening escrow, dan menerbitkan kontrak resmi sebelum produksi dimulai.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-kiri-dark-700">
          <button
            type="button"
            onClick={() => navigateTo('page-20-collab-request-modal')}
            className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
          >
            <span>Kirim Brief Proyek ke KIRI Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
