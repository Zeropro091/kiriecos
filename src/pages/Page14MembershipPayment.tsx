import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import {
  Sparkles,
  CheckCircle2,
  CreditCard,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Clock,
  Lock,
  UserRound,
  Briefcase,
  UploadCloud,
  ChevronRight,
  Tag,
  Loader2,
  X,
  Gift,
} from 'lucide-react';
import {
  formatRupiah,
  validatePromo,
  discountedPrice,
  type PromoEvaluation,
  type PromoTier,
} from '../lib/promos';

/**
 * Page14 — Membership payment flow.
 * Pricing follows the official KIRI poster (source of truth), ALL ANNUAL:
 *   Creator:  Basic Rp 49.000/thn, Exclusive Rp 99.000/thn, Platinum Rp 199.000/thn
 *   Business: Basic Rp 97.000/thn, Exclusive Rp 257.000/thn, Platinum Rp 1.299.000/thn
 * Pricing pages (Page14A / Page14B) hand their selection over via sessionStorage.
 */

type Track = 'creator' | 'business';
type TierKey = 'basic' | 'exclusive' | 'platinum';

const PRICES: Record<Track, Record<TierKey, number>> = {
  creator: { basic: 49000, exclusive: 99000, platinum: 199000 },
  business: { basic: 97000, exclusive: 257000, platinum: 1299000 },
};

const TIER_LABELS: Record<TierKey, string> = {
  basic: 'Basic',
  exclusive: 'Exclusive',
  platinum: 'Platinum',
};

interface TierCardConfig {
  key: TierKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const TIER_CARDS: Record<Track, TierCardConfig[]> = {
  creator: [
    {
      key: 'basic',
      eyebrow: 'Basic — Get Connected',
      title: 'Creator Basic',
      subtitle: 'Awal terhubung ke ekosistem kreatif KIRI Project.',
      features: [
        'Terdaftar sebagai Member KIRI Project',
        'Creator ID / Digital Membership Card',
        'Profil di Creator Directory',
        'Akses informasi campaign & job',
      ],
    },
    {
      key: 'exclusive',
      eyebrow: 'Exclusive — Get Discovered',
      title: 'Creator Exclusive',
      subtitle: 'Kreator yang ingin ditemukan brand & komunitas.',
      highlighted: true,
      badge: 'Paling Populer',
      features: [
        'Lencana Resmi Verified Badge Emas',
        'Semua benefit Creator Basic (1–8)',
        'Creator-Brand Matching & rekomendasi ke brand',
        'Priority campaign information',
      ],
    },
    {
      key: 'platinum',
      eyebrow: 'Platinum — Get Featured',
      title: 'Creator Platinum',
      subtitle: 'Kreator yang ingin ditampilkan di channel KIRI.',
      badge: 'Best Value',
      features: [
        'Semua benefit Creator Exclusive (1–14)',
        'Creator Showcase di channel KIRI',
        'Masuk Talent Pool & project invitation',
        'Mentoring / sesi eksklusif',
      ],
    },
  ],
  business: [
    {
      key: 'basic',
      eyebrow: 'Basic — Terhubung',
      title: 'Business Basic',
      subtitle: 'Awal terhubung dengan ekosistem bisnis KIRI.',
      features: [
        'Terdaftar sebagai member KIRI Project',
        'Profil bisnis di direktori KIRI',
        'Kartu member digital (berlaku 1 tahun)',
        'Informasi peluang promo, campaign, dan kolaborasi',
      ],
    },
    {
      key: 'exclusive',
      eyebrow: 'Exclusive — Lebih Terlihat',
      title: 'Business Exclusive',
      subtitle: 'Bisnis yang ingin lebih terlihat & terhubung ke creator.',
      highlighted: true,
      badge: 'Paling Populer',
      features: [
        'Profil bisnis lebih lengkap (foto, produk, kontak, sosial media, lokasi)',
        'Rekomendasi ke calon partner yang sesuai',
        'Terbit di media online (media partner KIRI): 1x',
        'Optimasi visibilitas bisnis di Google & AI',
      ],
    },
    {
      key: 'platinum',
      eyebrow: 'Platinum — Diutamakan',
      title: 'Business Platinum',
      subtitle: 'Bisnis yang ingin diprioritaskan dalam program KIRI.',
      badge: 'Special Launching',
      features: [
        'Terbit di media online (media partner KIRI): 2x',
        'Landing page sederhana (template KIRI Project)',
        'Lebih diprioritaskan dalam program, peluang, dan kerjasama',
        'Semua benefit Business Exclusive (1–10)',
      ],
    },
  ],
};

export const Page14MembershipPayment: React.FC = () => {
  const { currentUser, navigateTo, showToast } = useApp();

  const [track, setTrack] = useState<Track>('creator');
  const [selectedTier, setSelectedTier] = useState<TierKey>('exclusive');
  const [bankName, setBankName] = useState('BCA');
  const [accountName, setAccountName] = useState(currentUser?.name || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [wasFreeActivation, setWasFreeActivation] = useState(false);

  // Kode promo
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<PromoEvaluation | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);

  // Pick up selection handed off by the pricing pages (Page14A / Page14B).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('kiri.membership.selection');
      if (raw) {
        const parsed = JSON.parse(raw) as { track?: Track; tier?: TierKey; promoCode?: string };
        const nextTrack = parsed.track === 'business' ? 'business' : parsed.track === 'creator' ? 'creator' : null;
        const nextTier = parsed.tier && parsed.tier in PRICES.creator ? parsed.tier : null;
        if (nextTrack) setTrack(nextTrack);
        if (nextTier) setSelectedTier(nextTier);
        if (parsed.promoCode) {
          setPromoCode(parsed.promoCode);
          // Validasi langsung dengan pilihan yang baru dibaca, bukan state lama.
          void applyPromoCode(parsed.promoCode, nextTrack ?? 'creator', nextTier ?? 'exclusive');
        }
        sessionStorage.removeItem('kiri.membership.selection');
        sessionStorage.removeItem('kiri.membership.promo');
      }
    } catch {
      /* ignore malformed selection */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPromoCode = async (
    rawCode: string,
    targetTrack: Track = track,
    targetTier: TierKey = selectedTier
  ) => {
    const code = rawCode.trim();
    if (!code) return;
    setCheckingPromo(true);
    setPromoError('');
    const result = await validatePromo(code, targetTrack, targetTier, { preview: !currentUser });
    setCheckingPromo(false);
    if (!result.valid) {
      setPromo(null);
      setPromoError(result.reason ?? 'Kode promo tidak valid.');
      return;
    }
    setPromo(result);
    setPromoCode(result.code ?? code);
  };

  // Kode bisa dibatasi ke tier tertentu — validasi ulang saat paket berganti.
  useEffect(() => {
    if (!promoCode.trim()) return;
    if (promo?.valid && promo.tier === selectedTier && promo.track === track) return;
    void applyPromoCode(promoCode, track, selectedTier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, selectedTier]);

  const baseAmount = PRICES[track][selectedTier] ?? 0;
  const calculateAmount = () => (promo?.valid ? promo.amountAfter : baseAmount);
  const discountAmount = promo?.valid ? promo.discountAmount : 0;
  const isFree = Boolean(promo?.valid) && calculateAmount() === 0;

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Masuk terlebih dahulu untuk mengirim bukti pembayaran.', 'warning');
      navigateTo('page-15-login');
      return;
    }
    if (selectedTier === 'basic' && !isFree) {
      showToast('Paket Basic dipilih. Hubungi admin KIRI untuk aktivasi keanggotaan.', 'success');
      navigateTo('page-16-dashboard-user');
      return;
    }

    if (!isFree && !accountName.trim()) {
      showToast('Harap masukkan nama pemilik rekening.', 'error');
      return;
    }

    // K5: a real receipt is mandatory — the old fallback silently attached a
    // placeholder image so admins had nothing to verify.
    // Kode promo gratis tidak butuh bukti transfer sama sekali.
    if (!isFree && !receiptFile) {
      showToast('Harap unggah bukti transfer (resi / screenshot) terlebih dahulu.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedProofUrl = '';
      if (!isFree && receiptFile) {
        try {
          uploadedProofUrl = await dataService.uploadReceiptImage(receiptFile);
        } catch {
          setIsSubmitting(false);
          showToast('Gagal mengunggah gambar bukti transfer. Cek koneksi lalu coba lagi.', 'error');
          return;
        }
      }

      const saved = await dataService.submitPaymentReceipt({
        userId: currentUser.id,
        userName: currentUser.name || accountName,
        tier: `${track}:${selectedTier}`,
        amount: calculateAmount(),
        promoCode: promo?.valid ? promo.code : undefined,
        receiptImageUrl: uploadedProofUrl,
        senderAccountName: accountName || currentUser.name,
        bankName: isFree ? 'PROMO' : bankName,
        entityId: currentUser.entityId,
      });

      setIsSubmitting(false);
      setWasFreeActivation(Boolean(saved.activated));
      setIsSubmittedSuccess(true);
      if (saved.activated) {
        showToast('Kode promo berhasil! Keanggotaanmu langsung aktif.', 'success');
      } else if (saved.syncError) {
        showToast('Bukti tersimpan lokal — sinkronisasi ke server gagal. Hubungi admin via WhatsApp.', 'warning');
      } else {
        showToast('Bukti transfer berhasil dikirim! Tim kurasi KIRI akan memverifikasi dalam 1x24 jam.', 'success');
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(err instanceof Error ? err.message : 'Gagal mengunggah bukti transfer.', 'error');
    }
  };

  const cards = TIER_CARDS[track];

  return (
    <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Light Orbs */}
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D8AE5A_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Pilih Keanggotaan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              KIRI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300/90 text-base sm:text-lg font-light leading-relaxed">
            Semua paket berlaku <span className="font-semibold text-kiri-gold-300">1 tahun (per tahun)</span>.
            Pembayaran diverifikasi manual oleh tim admin KIRI Project.
          </p>

          {/* Track toggle: Creator / Business */}
          <div className="inline-flex items-center gap-1 mt-4 p-1 rounded-full bg-white/[0.06] border border-white/10">
            <button
              type="button"
              onClick={() => setTrack('creator')}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                track === 'creator' ? 'bg-kiri-gold-500 text-kiri-dark-950 shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <UserRound className="w-3.5 h-3.5" />
              <span>Creator</span>
            </button>
            <button
              type="button"
              onClick={() => setTrack('business')}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                track === 'business' ? 'bg-kiri-gold-500 text-kiri-dark-950 shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Business</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards: 3-Tier Double-Bezel Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {cards.map((card) => {
            const selected = selectedTier === card.key;
            return (
              <div
                key={`${track}-${card.key}`}
                onClick={() => setSelectedTier(card.key)}
                className={`group rounded-[2rem] p-1.5 transition-all duration-300 cursor-pointer flex flex-col relative ${
                  card.highlighted
                    ? 'bg-gradient-to-b from-kiri-gold-400 via-kiri-gold-500 to-amber-600 shadow-[0_12px_40px_rgba(216,174,90,0.3)] lg:-translate-y-2'
                    : selected
                      ? 'bg-gradient-to-b from-white/30 to-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                      : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10'
                }`}
              >
                {card.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-kiri-gold-400 text-kiri-dark-950 font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 fill-kiri-dark-950" />
                    {card.badge}
                  </div>
                )}

                <div className={`h-full rounded-[calc(2rem-0.375rem)] p-7 flex flex-col justify-between transition-colors ${
                  selected || card.highlighted ? 'bg-[#002b1e]' : 'bg-[#001c13]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase tracking-widest font-semibold ${
                        card.highlighted ? 'text-kiri-gold-300' : 'text-gray-400'
                      }`}>
                        {card.eyebrow}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selected ? 'border-kiri-gold-400 bg-kiri-gold-400 text-kiri-dark-950' : 'border-gray-600'
                      }`}>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mt-3">{card.title}</h3>
                    <p className="text-xs text-gray-300/80 mt-1 leading-relaxed">{card.subtitle}</p>

                    <div className="mt-6">
                      {(() => {
                        const basePrice = PRICES[track][card.key];
                        const finalPrice = discountedPrice(basePrice, promo);
                        const discounted = finalPrice < basePrice;
                        return (
                          <>
                            {discounted && (
                              <span className="block text-xs text-gray-400 line-through decoration-red-400/60">
                                {formatRupiah(basePrice)}
                              </span>
                            )}
                            <div className="flex items-baseline gap-1">
                              <span
                                className={`font-serif text-4xl font-bold ${
                                  finalPrice === 0
                                    ? 'text-emerald-300'
                                    : card.highlighted || discounted
                                      ? 'text-kiri-gold-300'
                                      : 'text-white'
                                }`}
                              >
                                {finalPrice === 0 ? 'GRATIS' : formatRupiah(finalPrice)}
                              </span>
                              {finalPrice !== 0 && <span className="text-xs text-gray-400">/ tahun</span>}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="w-full h-px bg-white/10 my-6"></div>

                    <ul className="space-y-3.5 text-xs text-gray-200">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${card.highlighted ? 'text-kiri-gold-400' : 'text-emerald-400'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(card.key);
                    }}
                    className={`w-full mt-8 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      card.highlighted || selected
                        ? 'bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 shadow-[0_4px_16px_rgba(216,174,90,0.3)] font-extrabold'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span>Pilih {TIER_LABELS[card.key]}</span>
                    {!card.highlighted && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Basic (admin activation) note */}
        {selectedTier === 'basic' && !isFree && (
          <div className="text-center pt-4">
            <button
              onClick={() => {
                showToast('Paket Basic dipilih. Hubungi admin KIRI untuk aktivasi keanggotaan.', 'success');
                navigateTo('page-16-dashboard-user');
              }}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-gray-100 text-kiri-dark-950 font-bold text-sm transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Lanjut sebagai {track === 'creator' ? 'Creator' : 'Business'} Basic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Payment & Transfer Area */}
        {(selectedTier !== 'basic' || isFree) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
            {/* Left: Bank Details & Upload Form */}
            <div className="lg:col-span-8 rounded-[2rem] p-1.5 bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl">
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-kiri-gold-500/20 border border-kiri-gold-500/30 flex items-center justify-center text-kiri-gold-300">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">Instruksi Pembayaran Manual</h4>
                      <p className="text-xs text-gray-400">Transfer via Bank atau QRIS terdaftar</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Rekening Resmi
                  </span>
                </div>

                {/* Bank Account Info Card — tidak perlu saat kode promo membuat harga Rp 0 */}
                {isFree ? (
                  <div className="rounded-2xl p-5 border border-emerald-400/40 bg-emerald-500/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <Gift className="w-4 h-4" /> Akses gratis dengan kode promo
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      Kode <span className="font-mono font-bold text-emerald-200">{promo?.code}</span> membuat
                      keanggotaan {track === 'creator' ? 'Creator' : 'Business'} {TIER_LABELS[selectedTier]} gratis.
                      Tidak perlu transfer atau unggah bukti — klik tombol di bawah dan akses langsung aktif.
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] p-5 rounded-2xl border border-white/10">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Bank Tujuan</span>
                    <p className="text-base font-bold text-white">BCA (Bank Central Asia)</p>
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block pt-2">Nomor Rekening</span>
                    <p className="text-lg font-mono font-bold text-kiri-gold-300 tracking-wider">7700-1288-9900</p>
                    <span className="text-xs text-gray-300 font-medium">a.n. PT KIRI PROJECT BALI</span>
                  </div>
                  <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Nominal yang Ditransfer</span>
                      <p className="font-serif text-2xl font-extrabold text-kiri-gold-300 mt-1">
                        {formatRupiah(calculateAmount())}
                      </p>
                      <span className="text-[11px] text-gray-400">
                        {track === 'creator' ? 'Creator' : 'Business'} {TIER_LABELS[selectedTier]} — per tahun
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                      <span>Verifikasi manual oleh tim admin, maks. 1x24 jam kerja</span>
                    </div>
                  </div>
                </div>
                )}

                {!isSubmittedSuccess ? (
                  <form onSubmit={handleUploadReceipt} className="space-y-5 pt-2">
                    {!isFree && (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-300">Bank / E-Wallet Pengirim</label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-[#001710] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-kiri-gold-500 transition-colors"
                        >
                          <option value="BCA">BCA (Bank Central Asia)</option>
                          <option value="Mandiri">Bank Mandiri</option>
                          <option value="BNI">BNI (Bank Negara Indonesia)</option>
                          <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                          <option value="BPD Bali">BPD Bali</option>
                          <option value="GoPay/QRIS">GoPay / QRIS</option>
                          <option value="OVO/Dana">OVO / DANA</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-300">Nama Pemilik Rekening Pengirim</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Putu Ari Wijaya"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full bg-[#001710] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-kiri-gold-500 transition-colors placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-300">Unggah Bukti Transfer (Resi / Screenshot)</label>
                      <div className="relative border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-kiri-gold-500/50 transition-colors bg-white/[0.02]">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UploadCloud className="w-7 h-7 text-kiri-gold-400" />
                          <p className="text-xs text-gray-300">
                            {receiptFile ? (
                              <span className="font-semibold text-kiri-gold-300">{receiptFile.name}</span>
                            ) : (
                              'Klik untuk memilih file resi transfer (PNG, JPG, atau PDF)'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    </>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(216,174,90,0.35)] active:scale-[0.99] disabled:opacity-50"
                    >
                      <span>
                        {isSubmitting
                          ? 'Memproses...'
                          : isFree
                            ? 'Aktifkan Keanggotaan Gratis'
                            : 'Konfirmasi & Kirim Bukti Pembayaran'}
                      </span>
                      {isFree ? <Gift className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <h5 className="font-serif text-lg font-bold text-emerald-300">
                      {wasFreeActivation ? 'Keanggotaan Aktif — Gratis' : 'Bukti Pembayaran Diterima'}
                    </h5>
                    <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                      {wasFreeActivation
                        ? `Kode promo ${promo?.code ?? ''} berhasil dipakai. Akses ${track === 'creator' ? 'Creator' : 'Business'} ${TIER_LABELS[selectedTier]} kamu sudah aktif sekarang — tidak perlu menunggu verifikasi.`
                        : 'Tim Admin KIRI Project sedang memverifikasi pembayaran Anda. Keanggotaan dan lencana Verified Badge akan aktif maksimal dalam 1x24 jam kerja.'}
                    </p>
                    <button
                      onClick={() => navigateTo('page-16-dashboard-user')}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-kiri-gold-300 hover:underline"
                    >
                      <span>Buka Dashboard Member</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Security & Summary Widget */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo code */}
              <div className="rounded-[2rem] p-1.5 bg-white/10 backdrop-blur-xl border border-white/15">
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-kiri-gold-400" />
                    <h4 className="font-serif text-base font-bold text-white">Kode Promo</h4>
                  </div>

                  {promo?.valid ? (
                    <div className="flex items-start justify-between gap-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-300 font-mono tracking-wider truncate">
                          {promo.code}
                        </p>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {promo.isFree ? 'Akses gratis 100%' : promo.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPromo(null);
                          setPromoCode('');
                          setPromoError('');
                        }}
                        className="text-gray-400 hover:text-white shrink-0"
                        aria-label="Hapus kode promo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void applyPromoCode(promoCode);
                      }}
                      className="space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          placeholder="Masukkan kode"
                          autoComplete="off"
                          spellCheck={false}
                          className="flex-1 min-w-0 bg-[#001710] border border-white/15 rounded-xl px-3 py-2 text-xs tracking-wider text-white placeholder:text-gray-500 placeholder:tracking-normal focus:outline-none focus:border-kiri-gold-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={checkingPromo || !promoCode.trim()}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all disabled:opacity-40 flex items-center gap-1 shrink-0"
                        >
                          {checkingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                          <span>Cek</span>
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-red-300 flex items-start gap-1.5">
                          <X className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{promoError}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] p-1.5 bg-white/10 backdrop-blur-xl border border-white/15">
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-6 space-y-5">
                  <h4 className="font-serif text-base font-bold text-white">Ringkasan Keanggotaan</h4>
                  <div className="space-y-3 text-xs divide-y divide-white/10">
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Jenis Keanggotaan</span>
                      <span className="font-semibold text-white capitalize">
                        {track === 'creator' ? 'Creator' : 'Business'} {TIER_LABELS[selectedTier]}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="text-gray-400">Durasi Akses</span>
                      <span className="font-semibold text-white">1 Tahun (Aktif Seketika)</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="text-gray-400">Harga Normal</span>
                      <span className={`font-semibold ${discountAmount > 0 ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {formatRupiah(baseAmount)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between pt-3">
                        <span className="text-gray-400">Potongan ({promo?.code})</span>
                        <span className="font-semibold text-emerald-300">− {formatRupiah(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 text-sm font-bold text-kiri-gold-300">
                      <span>Total Investasi</span>
                      <span className={isFree ? 'text-emerald-300' : ''}>
                        {isFree ? 'GRATIS' : formatRupiah(calculateAmount())}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 text-xs text-gray-300 space-y-2">
                    <div className="flex items-center gap-2 text-kiri-gold-300 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isFree ? 'Aktivasi Instan dengan Kode Promo' : 'Verifikasi Pembayaran Manual oleh Tim Admin'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                      {isFree
                        ? 'Kode promo gratis langsung mengaktifkan keanggotaan tanpa menunggu verifikasi admin.'
                        : 'Setiap pembayaran diperiksa langsung oleh tim admin KIRI Project sebelum keanggotaan Anda diaktifkan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
