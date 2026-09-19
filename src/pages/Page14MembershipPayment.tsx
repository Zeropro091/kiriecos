import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  QrCode,
  Building2,
  Lock,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';

export const Page14MembershipPayment: React.FC = () => {
  const { navigateTo, currentUser, showToast } = useApp();
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'qris'>('bank_transfer');

  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const calculateAmount = () => {
    if (selectedTier === 'free') return 0;
    if (selectedTier === 'pro') return billingCycle === 'annual' ? 1490000 : 149000;
    return billingCycle === 'annual' ? 4990000 : 499000;
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTier === 'free') {
      showToast('Paket Freemium langsung aktif tanpa pembayaran.', 'info');
      navigateTo('page-16-dashboard-user');
      return;
    }

    if (!accountName.trim()) {
      showToast('Harap masukkan nama pemilik rekening pengirim.', 'warning');
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
        showToast('Bukti transfer berhasil diunggah! Menunggu verifikasi admin.', 'success');
      }
    } catch {
      setIsSubmitting(false);
      showToast('Gagal mengunggah bukti transfer.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Keanggotaan Terverifikasi Bali Ecosystem
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Pilih Lisensi Keanggotaan KIRI
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg">
            Dapatkan lencana Verified Badge, akses kolaborasi tanpa batas, dan integrasi katalog bisnis di seluruh ekosistem Bali.
          </p>
        </div>

        {/* Pricing Cards & Payment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Plan Selector */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div 
                onClick={() => setSelectedTier('free')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedTier === 'free' 
                    ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <h3 className="text-lg font-bold text-white">Freemium Member</h3>
                <p className="text-sm text-slate-400 mt-1">Untuk individu & talenta baru</p>
                <div className="mt-4 text-2xl font-extrabold text-white">Gratis</div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Profil Katalog Publik KIRI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Maksimal 3 Pengajuan Kolaborasi/Bulan
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div 
                onClick={() => setSelectedTier('pro')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedTier === 'pro' 
                    ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase">
                  Rekomendasi
                </span>
                <h3 className="text-lg font-bold text-white">Verified Pro Member</h3>
                <p className="text-sm text-slate-400 mt-1">Creator, Komunitas & UMKM Aktif</p>
                <div className="mt-4 text-2xl font-extrabold text-amber-400">
                  Rp 149.000 <span className="text-xs text-slate-400 font-normal">/bulan</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Lencana Verified Badge Emas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Pengajuan Kolaborasi Tanpa Batas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Prioritas Tampil di Katalog Bali
                  </li>
                </ul>
              </div>
            </div>

            {/* Rekening Info & Manual Upload Form */}
            {selectedTier !== 'free' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Metode Pembayaran Transfer Manual & QRIS (Verifikasi Admin)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Bank Tujuan</span>
                    <p className="text-sm font-bold text-slate-200">BCA (Bank Central Asia)</p>
                    <span className="text-xs text-slate-500 uppercase font-semibold mt-2 block">Nomor Rekening</span>
                    <p className="text-base font-mono font-bold text-emerald-400">7700-1288-9900</p>
                    <span className="text-xs text-slate-400">a.n. PT KIRI PROJECT BALI</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Nominal Transfer</span>
                    <p className="text-xl font-extrabold text-amber-400 mt-1">
                      Rp {calculateAmount().toLocaleString('id-ID')}
                    </p>
                    <span className="text-xs text-slate-400 mt-2 block">
                      Status: <span className="text-emerald-400 font-semibold">Menunggu Transfer</span>
                    </span>
                  </div>
                </div>

                {!isSubmittedSuccess ? (
                  <form onSubmit={handleUploadReceipt} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Bank / E-Wallet Pengirim</label>
                        <select 
                          value={bankName} 
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BNI">BNI</option>
                          <option value="BRI">BRI</option>
                          <option value="GoPay/QRIS">GoPay / QRIS</option>
                          <option value="OVO/Dana">OVO / DANA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pemilik Rekening</label>
                        <input 
                          type="text"
                          required
                          placeholder="Nama Pemilik Rekening"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Unggah Bukti Transfer (Resi / Screenshot)</label>
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {isSubmitting ? 'Mengunggah Bukti...' : 'Kirim Bukti Pembayaran Ke Admin'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
                    <FileCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="font-bold text-emerald-400">Bukti Transfer Berhasil Terkirim</h5>
                    <p className="text-xs text-slate-300">
                      Tim Admin KIRI Project sedang memverifikasi bukti pembayaran Anda. Akun Anda akan di-upgrade maksimal 1x24 jam kerja.
                    </p>
                    <button 
                      onClick={() => navigateTo('page-16-dashboard-user')}
                      className="mt-3 inline-block text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
                    >
                      Kembali ke Dashboard Member
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-white text-base">Ringkasan Pesanan</h3>
            <div className="space-y-3 text-sm divide-y divide-slate-800">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Paket Lisensi</span>
                <span className="font-semibold text-white capitalize">{selectedTier} Tier</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold text-white">Rp {calculateAmount().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-bold text-emerald-400">
                <span>Total Biaya</span>
                <span>Rp {calculateAmount().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Garansi Kurasi Resmi
              </div>
              <p>Setiap pembayaran dikonfirmasi langsung oleh Kurator KIRI Project untuk menjaga integritas ekosistem komunitas dan bisnis Bali.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
