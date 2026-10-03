import React, { useState } from 'react';
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
  Zap,
  Lock,
  Building,
  UploadCloud,
  ChevronRight
} from 'lucide-react';

export const Page14MembershipPayment: React.FC = () => {
  const { currentUser, navigateTo, showToast } = useApp();

  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [bankName, setBankName] = useState('BCA');
  const [accountName, setAccountName] = useState(currentUser?.name || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const calculateAmount = () => {
    if (selectedTier === 'free') return 0;
    if (selectedTier === 'pro') return 149000;
    if (selectedTier === 'enterprise') return 499000;
    return 0;
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTier === 'free') {
      showToast('Anda telah terdaftar sebagai Freemium Member!', 'success');
      navigateTo('page-16-dashboard-user');
      return;
    }

    if (!accountName.trim()) {
      showToast('Harap masukkan nama pemilik rekening.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedProofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500';
      if (receiptFile) {
        try {
          uploadedProofUrl = await dataService.uploadReceiptImage(receiptFile);
        } catch (uploadErr) {
          setIsSubmitting(false);
          showToast('Gagal mengunggah gambar bukti transfer. Cek koneksi lalu coba lagi.', 'error');
          return;
        }
      }

      const saved = await dataService.submitPaymentReceipt({
        userId: currentUser?.id || 'guest-user',
        userName: currentUser?.name || accountName || 'Member Bali',
        tier: selectedTier,
        amount: calculateAmount(),
        receiptImageUrl: uploadedProofUrl,
        senderAccountName: accountName,
        bankName,
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      if (saved.syncError) {
        showToast('Bukti tersimpan lokal — sinkronisasi ke server gagal. Hubungi admin via WhatsApp.', 'warning');
      } else {
        showToast('Bukti transfer berhasil dikirim! Tim kurasi KIRI akan memverifikasi dalam 1x24 jam.', 'success');
      }
    } catch {
      setIsSubmitting(false);
      showToast('Gagal mengunggah bukti transfer.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Light Orbs */}
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D8AE5A_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header: Editorial Style without generic eyebrow pills */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Pilih Lisensi Keanggotaan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              KIRI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-300/90 text-base sm:text-lg font-light leading-relaxed">
            Dapatkan lencana Verified Badge resmi, akses kolaborasi aman tanpa batas, dan integrasi katalog bisnis di seluruh ekosistem kreatif Bali.
          </p>
        </div>

        {/* Pricing Cards: 3-Tier Double-Bezel Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Tier 1: Freemium */}
          <div
            onClick={() => setSelectedTier('free')}
            className={`group rounded-[2rem] p-1.5 transition-all duration-300 cursor-pointer flex flex-col ${
              selectedTier === 'free'
                ? 'bg-gradient-to-b from-white/30 to-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10'
            }`}
          >
            <div className={`h-full rounded-[calc(2rem-0.375rem)] p-7 flex flex-col justify-between transition-colors ${
              selectedTier === 'free' ? 'bg-[#002419] border border-white/20' : 'bg-[#001c13]'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Starter</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'free' ? 'border-kiri-gold-400 bg-kiri-gold-400 text-kiri-dark-950' : 'border-gray-600'
                  }`}>
                    {selectedTier === 'free' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mt-3">Freemium Member</h3>
                <p className="text-xs text-gray-300/80 mt-1 leading-relaxed">Eksplorasi awal untuk talenta & kreator pendatang baru di Bali.</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-white">Gratis</span>
                  <span className="text-xs text-gray-400">/ selamanya</span>
                </div>

                <div className="w-full h-px bg-white/10 my-6"></div>

                <ul className="space-y-3.5 text-xs text-gray-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Profil Katalog Direktori Publik</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Maksimal 3 Pengajuan Kolaborasi/Bulan</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-500">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Tanpa Lencana Verified Badge</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTier('free')}
                className={`w-full mt-8 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedTier === 'free'
                    ? 'bg-white text-[#001710] shadow-md font-extrabold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>Pilih Freemium</span>
              </button>
            </div>
          </div>

          {/* Tier 2: Verified Pro (Signature Highlight) */}
          <div
            onClick={() => setSelectedTier('pro')}
            className={`group rounded-[2rem] p-1.5 transition-all duration-300 cursor-pointer flex flex-col relative transform lg:-translate-y-2 ${
              selectedTier === 'pro'
                ? 'bg-gradient-to-b from-kiri-gold-400 via-kiri-gold-500 to-amber-600 shadow-[0_12px_40px_rgba(216,174,90,0.3)]'
                : 'bg-gradient-to-b from-kiri-gold-500/40 to-transparent border border-kiri-gold-500/30 hover:border-kiri-gold-500/60'
            }`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-kiri-gold-400 text-kiri-dark-950 font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
              <Sparkles className="w-3 h-3 fill-kiri-dark-950" />
              Paling Populer
            </div>

            <div className={`h-full rounded-[calc(2rem-0.375rem)] p-7 flex flex-col justify-between transition-colors ${
              selectedTier === 'pro' ? 'bg-[#002b1e]' : 'bg-[#001f15]'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-kiri-gold-300 font-bold">Kreator & UMKM</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'pro' ? 'border-kiri-gold-400 bg-kiri-gold-400 text-kiri-dark-950' : 'border-gray-600'
                  }`}>
                    {selectedTier === 'pro' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mt-3">Verified Pro Member</h3>
                <p className="text-xs text-kiri-gold-200/80 mt-1 leading-relaxed">Kreator, fotografer, komunitas & UMKM yang ingin eksposur terpercaya.</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-kiri-gold-300">Rp 149.000</span>
                  <span className="text-xs text-gray-400">/ bulan</span>
                </div>

                <div className="w-full h-px bg-kiri-gold-500/20 my-6"></div>

                <ul className="space-y-3.5 text-xs text-gray-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                    <span className="font-semibold text-white">Lencana Resmi Verified Badge Emas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                    <span>Pengajuan Kolaborasi & Kontrak Tanpa Batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                    <span>Prioritas Kurasi di Top Search Direktori Bali</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                    <span>Akses Fasilitas Rekening Escrow & Legal Template</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTier('pro')}
                className="w-full mt-8 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 shadow-[0_4px_16px_rgba(216,174,90,0.3)] font-extrabold"
              >
                <span>Pilih Lisensi Pro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tier 3: Enterprise / Agency */}
          <div
            onClick={() => setSelectedTier('enterprise')}
            className={`group rounded-[2rem] p-1.5 transition-all duration-300 cursor-pointer flex flex-col ${
              selectedTier === 'enterprise'
                ? 'bg-gradient-to-b from-white/40 to-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10'
            }`}
          >
            <div className={`h-full rounded-[calc(2rem-0.375rem)] p-7 flex flex-col justify-between transition-colors ${
              selectedTier === 'enterprise' ? 'bg-[#002419] border border-white/20' : 'bg-[#001c13]'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Institutional</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'enterprise' ? 'border-kiri-gold-400 bg-kiri-gold-400 text-kiri-dark-950' : 'border-gray-600'
                  }`}>
                    {selectedTier === 'enterprise' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mt-3">Strategic Partner</h3>
                <p className="text-xs text-gray-300/80 mt-1 leading-relaxed">Brand besar, agensi pemasaran & sponsor korporasi institusional.</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-white">Rp 499.000</span>
                  <span className="text-xs text-gray-400">/ bulan</span>
                </div>

                <div className="w-full h-px bg-white/10 my-6"></div>

                <ul className="space-y-3.5 text-xs text-gray-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Seluruh Fitur Verified Pro</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Account Manager KIRI</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-Creator Campaign Matching</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>MOU Kemitraan Resmi & Faktur Pajak</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTier('enterprise')}
                className={`w-full mt-8 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedTier === 'enterprise'
                    ? 'bg-white text-[#001710] shadow-md font-extrabold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>Pilih Strategic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payment & Transfer Area */}
        {selectedTier !== 'free' ? (
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

                {/* Bank Account Info Card */}
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
                        Rp {calculateAmount().toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-kiri-gold-400 shrink-0" />
                      <span>Verifikasi otomatis maks. 1x24 jam</span>
                    </div>
                  </div>
                </div>

                {!isSubmittedSuccess ? (
                  <form onSubmit={handleUploadReceipt} className="space-y-5 pt-2">
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

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(216,174,90,0.35)] active:scale-[0.99] disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Mengirim Data...' : 'Konfirmasi & Kirim Bukti Pembayaran'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <h5 className="font-serif text-lg font-bold text-emerald-300">Bukti Pembayaran Diterima</h5>
                    <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                      Tim Kurasi KIRI Project sedang memverifikasi pembayaran Anda. Lisensi dan lencana Verified Badge akan aktif maksimal dalam 1x24 jam kerja.
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
              <div className="rounded-[2rem] p-1.5 bg-white/10 backdrop-blur-xl border border-white/15">
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-6 space-y-5">
                  <h4 className="font-serif text-base font-bold text-white">Ringkasan Lisensi</h4>
                  <div className="space-y-3 text-xs divide-y divide-white/10">
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Jenis Keanggotaan</span>
                      <span className="font-semibold text-white capitalize">{selectedTier} Tier</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="text-gray-400">Durasi Akses</span>
                      <span className="font-semibold text-white">1 Bulan (Aktif Seketika)</span>
                    </div>
                    <div className="flex justify-between pt-3 text-sm font-bold text-kiri-gold-300">
                      <span>Total Investasi</span>
                      <span>Rp {calculateAmount().toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 text-xs text-gray-300 space-y-2">
                    <div className="flex items-center gap-2 text-kiri-gold-300 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Garansi Ekosistem Resmi</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                      Setiap profil terverifikasi mendapatkan proteksi identitas dan akses legal standardisasi kolaborasi di Bali.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center pt-4">
            <button
              onClick={() => {
                showToast('Akun Anda telah diaktifkan sebagai Freemium Member.', 'success');
                navigateTo('page-16-dashboard-user');
              }}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-gray-100 text-kiri-dark-950 font-bold text-sm transition-all shadow-lg inline-flex items-center gap-2"
            >
              <span>Lanjutkan dengan Freemium</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
