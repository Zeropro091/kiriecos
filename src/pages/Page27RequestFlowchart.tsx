import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  FileCheck2,
  Clock,
  Layers,
  Calculator,
  Compass
} from 'lucide-react';

export const Page27RequestFlowchart: React.FC = () => {
  const { navigateTo, openCollabModalFor, entities } = useApp();

  const [projectCategory, setProjectCategory] = useState('reels');
  const [targetReach, setTargetReach] = useState('medium');

  const getEstimatedTimeline = () => {
    if (projectCategory === 'press') return '3 - 5 Hari Kerja';
    if (projectCategory === 'reels') return '7 - 14 Hari Kerja';
    return '14 - 30 Hari Kerja';
  };

  const getEstimatedBudget = () => {
    if (projectCategory === 'press') return 'IDR 2.000.000 - IDR 4.000.000';
    if (projectCategory === 'reels') {
      return targetReach === 'high' ? 'IDR 8.000.000 - IDR 15.000.000' : 'IDR 3.500.000 - IDR 7.000.000';
    }
    return 'IDR 12.000.000 - IDR 35.000.000';
  };

  const flowStages = [
    {
      step: '01',
      title: 'Ecosystem Discovery',
      actor: 'Brand / Client / Partner',
      desc: 'Menemukan talenta kreator, komunitas, atau media melalui Direktori KIRI PROJECT terverifikasi.',
      output: 'Kandidat Talenta Terpilih'
    },
    {
      step: '02',
      title: 'Request Through KIRI',
      actor: 'Platform Gateway (PAGE 20 & 21)',
      desc: 'Mengisi brief kampanye terstruktur meliputi deliverables, batas anggaran, dan timeline pelaksanaan.',
      output: 'Kode Pelacakan Resmi (KP-REQ)'
    },
    {
      step: '03',
      title: 'Kurasi & Matching',
      actor: 'Admin KIRI (Kak Rini & Tim)',
      desc: 'Tim kurasi mengecek ketersediaan talenta, mengunci scope of work, dan mencocokkan ekspektasi brand.',
      output: 'Persetujuan Kedua Pihak'
    },
    {
      step: '04',
      title: 'Escrow & Kontrak Digital',
      actor: 'KIRI Escrow System',
      desc: 'Penandatanganan kontrak digital mengikat hak cipta dan penguncian dana aman di rekening bersama.',
      output: 'Dana Terlindungi 100%'
    },
    {
      step: '05',
      title: 'Produksi & Verifikasi',
      actor: 'Kreator / Media Partner',
      desc: 'Eksekusi karya sesuai brief, proses review hasil (drafting), revisi terfasilitasi, hingga persetujuan final.',
      output: 'Deliverables Disetujui'
    },
    {
      step: '06',
      title: 'Pencairan & Laporan Dampak',
      actor: 'KIRI Platform Analytics',
      desc: 'Pencairan honor kreator secara otomatis dan penerbitan ringkasan metrik performa kampanye.',
      output: 'Kemitraan Sukses Berdampak'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 sm:p-12 border border-kiri-gold-500/30 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400" />
          <span>PAGE 27 — Diagram Alur Lengkap Permintaan Layanan & Kemitraan</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
          Partner / Service Request Flow
        </h1>
        <p className="text-sm text-gray-300 max-w-xl mx-auto font-light leading-relaxed">
          Arsitektur terpadu alur kolaborasi ekosistem KIRI PROJECT yang menjamin kepastian bagi brand, kreator, komunitas, dan mitra institusi.
        </p>
      </div>

      {/* Visual Workflow Diagram (Flowchart Cards) */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-kiri-gold-700 dark:text-kiri-gold-400">
            Arsitektur 6 Tahap
          </span>
          <h2 className="font-serif text-2xl font-bold text-kiri-green-950 dark:text-white mt-0.5">
            Siklus Ekosistem Kolaborasi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowStages.map((st) => (
            <div
              key={st.step}
              className="p-6 rounded-3xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle flex flex-col justify-between relative group hover:border-kiri-gold-500 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif font-bold text-2xl text-kiri-gold-600 dark:text-kiri-gold-400">
                    {st.step}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-kiri-green-50 dark:bg-kiri-dark-750 text-kiri-green-900 dark:text-kiri-gold-300">
                    {st.actor}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-kiri-green-950 dark:text-white mb-2">
                  {st.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {st.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-kiri-dark-700 flex items-center justify-between text-xs">
                <span className="text-gray-400">Output Kunci:</span>
                <span className="font-bold text-kiri-green-950 dark:text-white">{st.output}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Project Estimator Sandbox */}
      <div className="bg-kiri-ivory-warm dark:bg-kiri-dark-850 rounded-3xl p-8 border border-kiri-gold-500/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-kiri-green-900 text-kiri-gold-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
              Simulator Estimasi Anggaran & Timeline Proyek
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kalkulasikan perkiraan investasi kampanye Anda di ekosistem KIRI PROJECT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Tipe Kebutuhan Kolaborasi:
            </label>
            <select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-white dark:bg-kiri-dark-800 focus:outline-none"
            >
              <option value="reels">Cinematic Video Reels / TikTok</option>
              <option value="campaign">Full Brand Showcase Campaign</option>
              <option value="press">Distribusi Siaran Pers Media</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Target Jangkauan Audiens:
            </label>
            <select
              value={targetReach}
              onChange={(e) => setTargetReach(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-white dark:bg-kiri-dark-800 focus:outline-none"
            >
              <option value="medium">Micro-Creators (50K - 150K)</option>
              <option value="high">Macro / Top Creators (200K+)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Estimasi Durasi:</span>
            <p className="font-bold text-sm text-kiri-green-950 dark:text-white mt-1">
              {getEstimatedTimeline()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-kiri-dark-800 border border-kiri-gold-500/40">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Estimasi Investasi:</span>
            <p className="font-bold text-xs text-kiri-green-900 dark:text-kiri-gold-400 mt-1">
              {getEstimatedBudget()}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200/60 dark:border-kiri-dark-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Setiap nilai proyek difasilitasi kontrak tertulis dan garansi revisi terarah.
          </p>
          <button
            onClick={() => navigateTo('page-02-directory')}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Pilih Talenta di Direktori (PAGE 02)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
