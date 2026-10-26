import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Tag,
  Loader2,
  X,
  Gift,
} from 'lucide-react';
import {
  formatRupiah,
  validatePromo,
  type PromoEvaluation,
  type PromoTier,
} from '../lib/promos';

/**
 * Page14A — Creator Pricing (annual, per poster spec).
 * Poster is the source of truth: BASIC Rp 49.000/thn, EXCLUSIVE Rp 99.000/thn,
 * PLATINUM Rp 199.000/thn. CTA hands the selection to page-14 (payment flow)
 * via a sessionStorage handshake.
 *
 * Kode promo: satu kode bisa memberi potongan persen, potongan nominal, atau
 * akses gratis penuh. Validasi per tier dilakukan ke server (sumber kebenaran),
 * lalu hasilnya ikut dikirim ke halaman pembayaran.
 */

const CREATOR_FEATURES: string[] = [
  'Terdaftar sebagai Member KIRI Project',
  'Creator ID/Digital Membership Card',
  'Profil di Creator Directory',
  'Akses informasi campaign & job',
  'Akses komunitas creator (grup khusus)',
  'Event & networking',
  'Creator Clinic (materi edukasi)',
  'Special member rate (event & program)',
  'Portfolio/Media Kit di profil',
  'Link sosial media (IG/TikTok/YouTube)',
  'Creator-Brand Matching',
  'Kesempatan direkomendasikan ke brand',
  'Priority campaign information',
  'Creator Showcase di channel KIRI',
  'Masuk Talent Pool KIRI Project',
  'Project invitation (sesuai kebutuhan)',
  'Mentoring/sesi eksklusif',
];

interface CreatorTier {
  key: PromoTier;
  label: string;
  tagline: string;
  price: number;
  featureCount: number;
  badge?: string;
  highlighted?: boolean;
}

const TIERS: CreatorTier[] = [
  { key: 'basic', label: 'BASIC', tagline: 'GET CONNECTED', price: 49000, featureCount: 8 },
  { key: 'exclusive', label: 'EXCLUSIVE', tagline: 'GET DISCOVERED', price: 99000, featureCount: 14, highlighted: true },
  { key: 'platinum', label: 'PLATINUM', tagline: 'GET FEATURED', price: 199000, featureCount: 17, badge: 'BEST VALUE' },
];

export const Page14ACreatorPricing: React.FC = () => {
  const { navigateTo } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoResults, setPromoResults] = useState<Record<string, PromoEvaluation> | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);

  const activePromoCode = promoResults
    ? Object.values(promoResults).find((r) => r.valid)?.code ?? ''
    : '';

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim();
    if (!code) return;
    setCheckingPromo(true);
    setPromoError('');
    setPromoResults(null);

    // Satu kode bisa dibatasi ke tier tertentu, jadi cek per tier.
    const entries = await Promise.all(
      TIERS.map(async (tier) => {
        const result = await validatePromo(code, 'creator', tier.key, { preview: true });
        return [tier.key, result] as const;
      })
    );
    const map = Object.fromEntries(entries) as Record<string, PromoEvaluation>;
    setCheckingPromo(false);

    if (!Object.values(map).some((r) => r.valid)) {
      const reason = Object.values(map).find((r) => r.reason)?.reason;
      setPromoError(reason ?? 'Kode promo tidak berlaku untuk paket Creator.');
      return;
    }
    setPromoResults(map);
  };

  const clearPromo = () => {
    setPromoResults(null);
    setPromoInput('');
    setPromoError('');
  };

  const priceFor = (tier: CreatorTier): { final: number; base: number; evaluation?: PromoEvaluation } => {
    const evaluation = promoResults?.[tier.key];
    if (!evaluation?.valid) return { final: tier.price, base: tier.price };
    return { final: evaluation.amountAfter, base: evaluation.amountBefore || tier.price, evaluation };
  };

  const chooseTier = (tier: CreatorTier) => {
    const { final, evaluation } = priceFor(tier);
    try {
      sessionStorage.setItem(
        'kiri.membership.selection',
        JSON.stringify({
          track: 'creator',
          tier: tier.key,
          promoCode: evaluation?.valid ? evaluation.code : undefined,
        })
      );
      // Simpan juga nominal hasil validasi supaya halaman pembayaran bisa
      // menampilkan ringkasan tanpa menunggu request ulang.
      if (evaluation?.valid) {
        sessionStorage.setItem('kiri.membership.promo', JSON.stringify({ ...evaluation, amountAfter: final }));
      } else {
        sessionStorage.removeItem('kiri.membership.promo');
      }
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
            Creator Pricing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              KIRI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300/90 text-base sm:text-lg font-light leading-relaxed">
            Keanggotaan untuk kreator & talenta kreatif. Semua paket berlaku{' '}
            <span className="font-semibold text-kiri-gold-300">1 tahun (per tahun)</span>.
          </p>
        </div>

        {/* Promo code box */}
        <div className="max-w-xl mx-auto -mt-4">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 sm:p-5">
            {!promoResults ? (
              <form onSubmit={applyPromo} className="space-y-2">
                <label htmlFor="creator-promo" className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <Tag className="w-3.5 h-3.5 text-kiri-gold-400" />
                  Punya kode promo?
                </label>
                <div className="flex gap-2">
                  <input
                    id="creator-promo"
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    placeholder="Contoh: KIRI2026"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 min-w-0 bg-[#001710] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm tracking-wider text-white placeholder:text-gray-500 placeholder:tracking-normal focus:outline-none focus:border-kiri-gold-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={checkingPromo || !promoInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                  >
                    {checkingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                    <span>{checkingPromo ? 'Cek...' : 'Terapkan'}</span>
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-red-300 flex items-start gap-1.5 pt-0.5">
                    <X className="w-3.5 h-3.5 shrink-0 mt-px" />
                    <span>{promoError}</span>
                  </p>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Gift className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="font-mono tracking-wider">{activePromoCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                        {Object.values(promoResults).find((r) => r.valid)?.label ?? 'Aktif'}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Potongan otomatis diterapkan pada harga paket di bawah.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearPromo}
                  className="text-[11px] font-semibold text-gray-400 hover:text-white underline shrink-0"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Tier Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const { final, base, evaluation } = priceFor(tier);
            const isFree = Boolean(evaluation?.valid) && final === 0;
            return (
              <div
                key={tier.key}
                className={`group rounded-[2rem] p-1.5 transition-all duration-300 flex flex-col relative ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-kiri-gold-400 via-kiri-gold-500 to-amber-600 shadow-[0_12px_40px_rgba(216,174,90,0.3)] lg:-translate-y-2'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-kiri-gold-400 text-kiri-dark-950 font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
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
                      Creator {tier.label.charAt(0) + tier.label.slice(1).toLowerCase()}
                    </h3>

                    <div className="mt-6">
                      {evaluation?.valid && !isFree && (
                        <span className="block text-xs text-gray-400 line-through decoration-red-400/60">
                          {formatRupiah(base)}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-serif text-4xl font-bold ${
                            isFree
                              ? 'text-emerald-300'
                              : tier.highlighted || evaluation?.valid
                                ? 'text-kiri-gold-300'
                                : 'text-white'
                          }`}
                        >
                          {isFree ? 'GRATIS' : formatRupiah(final)}
                        </span>
                        {!isFree && <span className="text-xs text-gray-400">/ tahun</span>}
                      </div>
                      {evaluation?.valid && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                          <Tag className="w-2.5 h-2.5" />
                          {isFree
                            ? 'Akses gratis dengan kode promo'
                            : `Hemat ${formatRupiah(base - final)}`}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-px bg-white/10 my-6" />

                    <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-3">
                      {tier.featureCount} Benefit Termasuk:
                    </p>
                    <ul className="space-y-2.5 text-xs text-gray-200 max-h-72 overflow-y-auto pr-1">
                      {CREATOR_FEATURES.slice(0, tier.featureCount).map((feature) => (
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
                      tier.highlighted || isFree
                        ? 'bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 shadow-[0_4px_16px_rgba(216,174,90,0.3)] font-extrabold'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span>
                      {isFree
                        ? `Aktifkan ${tier.label.charAt(0) + tier.label.slice(1).toLowerCase()} Gratis`
                        : `Pilih ${tier.label.charAt(0) + tier.label.slice(1).toLowerCase()}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          Pembayaran dilakukan manual via transfer bank/QRIS dan diverifikasi langsung oleh tim admin
          KIRI Project (maks. 1x24 jam kerja). Kode promo dengan akses gratis langsung aktif tanpa
          pembayaran.
        </p>
      </div>
    </div>
  );
};
