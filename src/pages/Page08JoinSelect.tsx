import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../types';
import {
  Sparkles,
  Users,
  Building2,
  Newspaper,
  ShieldCheck,
  Video,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const Page08JoinSelect: React.FC = () => {
  const { navigateTo } = useApp();

  const options = [
    {
      id: 'creator',
      page: 'page-09-register-creator' as PageId,
      title: 'Content Creator',
      subtitle: 'Untuk videografer, fotografer, desainer, dan kreator digital',
      icon: <Video className="w-8 h-8 text-kiri-gold-500" />,
      benefits: [
        'Akses proyek komersial brand & UMKM terverifikasi',
        'Sistem pembayaran terlindungi (KIRI Escrow)',
        'Showcase portofolio dan rate card resmi',
        'Pelatihan kurasi di KIRI Academy'
      ],
      badge: 'Paling Populer',
      recommended: true
    },
    {
      id: 'community',
      page: 'page-10-register-community' as PageId,
      title: 'Komunitas Kreatif',
      subtitle: 'Untuk kolektif seni, komunitas desain, asosiasi perajin & komunitas kreator',
      icon: <Users className="w-8 h-8 text-kiri-green-600 dark:text-kiri-gold-400" />,
      benefits: [
        'Database anggota terkontrol & aman',
        'Fasilitasi sponsor acara & workshop',
        'Kolaborasi lintas komunitas se-Indonesia',
        'Dashboard manajemen internal komunitas'
      ],
      badge: 'Kolektif'
    },
    {
      id: 'business',
      page: 'page-11-register-business' as PageId,
      title: 'Bisnis & UMKM',
      subtitle: 'Untuk brand lokal, cafe & resto, hotel, dan usaha produk kreatif',
      icon: <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      benefits: [
        'Matching kreator yang sesuai target pasar',
        'Briefing kampanye terstruktur didampingi tim KIRI',
        'Garansi kepatuhan deliverables & revisi terkelola',
        'Laporan dampak kampanye komersial'
      ],
      badge: 'Brand & UMKM'
    },
    {
      id: 'media',
      page: 'page-12-register-media' as PageId,
      title: 'Media Partner',
      subtitle: 'Untuk portal berita digital, majalah, podcast, dan kanal publikasi',
      icon: <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      benefits: [
        'Menerima siaran pers resmi terkurasi',
        'Akses eksklusif liputan acara kreator',
        'Paket publikasi berbayar transparan',
        'Kemitraan konten berseri'
      ],
      badge: 'Publikasi'
    },
    {
      id: 'strategic',
      page: 'page-13-register-partner' as PageId,
      title: 'Mitra Strategis & Institusi',
      subtitle: 'Untuk dinas pemerintah, lembaga inkubasi, dan institusi teknologi',
      icon: <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      benefits: [
        'Program akselerasi ekonomi kreatif terpadu',
        'Riset & pemetaan data industri kreator',
        'MOU resmi kemitraan berjangka panjang',
        'Integrasi platform teknologi digital'
      ],
      badge: 'Institusi'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 08 — Tahap 1: Identifikasi Peran Anda</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-kiri-green-950 dark:text-white leading-tight">
          Join KIRI PROJECT — Who Are You?
        </h1>

        <p className="text-base text-gray-600 dark:text-gray-300 font-light">
          Pilih kategori yang paling mewakili peran Anda dalam ekosistem. Kami telah merancang alur onboarding terpersonalisasi untuk setiap entitas.
        </p>
      </div>

      {/* Grid of Entity Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => navigateTo(opt.page)}
            className={`rounded-3xl p-8 border transition-all cursor-pointer flex flex-col justify-between group relative ${
              opt.recommended
                ? 'bg-gradient-to-b from-kiri-green-950 to-kiri-green-900 text-white border-kiri-gold-500 shadow-elevated'
                : 'bg-white dark:bg-kiri-dark-800 text-gray-900 dark:text-white border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500 hover:shadow-elevated'
            }`}
          >
            {opt.badge && (
              <span
                className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  opt.recommended
                    ? 'bg-kiri-gold-500 text-kiri-dark-950'
                    : 'bg-gray-100 dark:bg-kiri-dark-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.badge}
              </span>
            )}

            <div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  opt.recommended
                    ? 'bg-white/10'
                    : 'bg-kiri-green-50 dark:bg-kiri-dark-700'
                }`}
              >
                {opt.icon}
              </div>

              <h3
                className={`font-serif text-2xl font-bold mb-2 ${
                  opt.recommended ? 'text-white' : 'text-kiri-green-950 dark:text-white'
                }`}
              >
                {opt.title}
              </h3>

              <p
                className={`text-xs leading-relaxed mb-6 font-light ${
                  opt.recommended ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {opt.subtitle}
              </p>

              <div className="space-y-2 border-t border-gray-100/20 dark:border-kiri-dark-700 pt-4">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    opt.recommended ? 'text-kiri-gold-300' : 'text-kiri-gold-700 dark:text-kiri-gold-400'
                  }`}
                >
                  Keuntungan Anggota:
                </p>
                {opt.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        opt.recommended ? 'text-kiri-gold-400' : 'text-emerald-600'
                      }`}
                    />
                    <span className={opt.recommended ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-4">
              <button
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  opt.recommended
                    ? 'bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 shadow-subtle'
                    : 'bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-90'
                }`}
              >
                <span>Pilih & Isi Formulir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
