import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

/**
 * Page14B — Business Pricing (annual, per poster spec).
 * Poster is the source of truth: BASIC Rp 97.000/thn, EXCLUSIVE Rp 257.000/thn,
 * PLATINUM Rp 1.299.000/thn (special launching, normal Rp 1.800.000).
 * CTA hands the selection to page-14 (payment flow) via sessionStorage.
 */

const BUSINESS_FEATURES: string[] = [
  'Terdaftar sebagai member KIRI Project',
  'Profil bisnis di direktori KIRI (nama, kategori, deskripsi singkat)',
  'Kartu member digital (berlaku 1 tahun)',
  'Informasi peluang promo, campaign, dan kolaborasi',
  'Bisa ikut event dan program KIRI',
  'Bertemu dan terhubung dengan creator, pelaku bisnis, dan partner',
  'Harga khusus untuk layanan KIRI dan partner',
  'Profil bisnis lebih lengkap (foto, produk/layanan, kontak, media sosial, lokasi)',
  'Rekomendasi dan dikenalkan ke calon partner yang sesuai',
  'Terbit di media online (media partner KIRI): Exclusive 1x Platinum 2x',
  'Optimasi visibilitas bisnis di Google & AI',
  'Landing page sederhana untuk bisnis Anda (menggunakan template KIRI Project)',
  'Lebih diprioritaskan dalam program, peluang, dan kerjasama',
];

interface BusinessTier {
  key: 'basic' | 'exclusive' | 'platinum';
  label: string;
  tagline: string;
  price: number;
  normalPrice?: number;
  featureCount: number;
  badge?: string;
  highlighted?: boolean;
}

const TIERS: BusinessTier[] = [
  { key: 'basic', label: 'BASIC', tagline: 'TERHUBUNG', price: 97000, featureCount: 7 },
  { key: 'exclusive', label: 'EXCLUSIVE', tagline: 'LEBIH TERLIHAT', price: 257000, featureCount: 10, highlighted: true },
  {
    key: 'platinum',
    label: 'PLATINUM',
    tagline: 'DIUTAMAKAN',
    price: 1299000,
    normalPrice: 1800000,
    featureCount: 13,
    badge: 'SPECIAL LAUNCHING',
  },
];

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export const Page14BBusinessPricing: React.FC = () => {
  const { navigateTo } = useApp();

  const chooseTier = (tier: BusinessTier) => {
    try {
      sessionStorage.setItem(
        'kiri.membership.selection',
        JSON.stringify({ track: 'business', tier: tier.key })
      );
    } catch {
      /* storage unavailable — page-14 falls back to defaults */
    }
    navigateTo('page-14-membership-payment');
  };

  return (
    <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <button
            onClick={() => navigateTo('page-08-join-select')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-kiri-gold-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke pilihan kategori</span>
          </button>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Business Pricing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              KIRI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300/90 text-base sm:text-lg font-light leading-relaxed">
            Keanggotaan untuk UMKM, brand & pelaku bisnis. Semua paket berlaku{' '}
            <span className="font-semibold text-kiri-gold-300">1 tahun (per tahun)</span>.
          </p>
        </div>

        {/* 3-Tier Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`group rounded-[2rem] p-1.5 transition-all duration-300 flex flex-col relative ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-kiri-gold-400 via-kiri-gold-500 to-amber-600 shadow-[0_12px_40px_rgba(216,174,90,0.3)] lg:-translate-y-2'
                  : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10'
              }`}
            >
              {tier.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20 whitespace-nowrap ${
                    tier.highlighted
                      ? 'bg-kiri-gold-400 text-kiri-dark-950'
                      : 'bg-kiri-gold-400 text-kiri-dark-950'
                  }`}
                >
                  <Sparkles className="w-3 h-3 fill-kiri-dark-950" />
                  {tier.badge}
                </div>
              )}

              <div
                className={`h-full rounded-[calc(2rem-0.375rem)] p-7 flex flex-col justify-between transition-colors ${
                  tier.highlighted ? 'bg-[#002b1e]' : 'bg-[#001c13]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs uppercase tracking-widest font-bold ${
                        tier.highlighted ? 'text-kiri-gold-300' : 'text-gray-400'
                      }`}
                    >
                      {tier.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                      {tier.tagline}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mt-3 capitalize">
                    Business {tier.label.charAt(0) + tier.label.slice(1).toLowerCase()}
                  </h3>

                  <div className="mt-6 flex items-baseline gap-2">
                    {tier.normalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatRupiah(tier.normalPrice)}
                      </span>
                    )}
                    <span
                      className={`font-serif text-4xl font-bold ${
                        tier.highlighted ? 'text-kiri-gold-300' : 'text-white'
                      }`}
                    >
                      {formatRupiah(tier.price)}
                    </span>
                    <span className="text-xs text-gray-400">/ tahun</span>
                  </div>

                  <div className="w-full h-px bg-white/10 my-6" />

                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-3">
                    {tier.featureCount} Benefit Termasuk:
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-200 max-h-72 overflow-y-auto pr-1">
                    {BUSINESS_FEATURES.slice(0, tier.featureCount).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.highlighted ? 'text-kiri-gold-400' : 'text-emerald-400'
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => chooseTier(tier)}
                  className={`w-full mt-8 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? 'bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 shadow-[0_4px_16px_rgba(216,174,90,0.3)] font-extrabold'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span>Pilih {tier.label.charAt(0) + tier.label.slice(1).toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          Pembayaran dilakukan manual via transfer bank/QRIS dan diverifikasi langsung oleh tim admin
          KIRI Project (maks. 1x24 jam kerja).
        </p>
      </div>
    </div>
  );
};
