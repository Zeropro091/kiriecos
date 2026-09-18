import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS } from '../data/mockData';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Check,
  Zap,
  Lock
} from 'lucide-react';

export const Page14MembershipPayment: React.FC = () => {
  const { navigateTo, loginAs, showToast } = useApp();
  const [subStep, setSubStep] = useState<'tier' | 'terms' | 'payment' | 'active'>('tier');
  const [selectedTier, setSelectedTier] = useState<string>('creator_pro');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'card'>('qris');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const tiers = [
    {
      id: 'free_explorer',
      name: 'Free Explorer',
      price: 'Gratis',
      period: 'Akses Terbuka',
      desc: 'Mulai menjelajahi ekosistem, mengikuti workshop publik, dan memantau direktori.',
      features: ['Akses direktori umum', 'Melihat profil & showcase', 'Menerima newsletter ekosistem'],
    },
    {
      id: 'creator_pro',
      name: 'Creator Pro',
      price: 'Rp 149.000',
      period: '/ bulan',
      recommended: true,
      desc: 'Paket keanggotaan terverifikasi untuk kreator yang siap menerima brief proyek komersial brand.',
      features: [
        'Lencana Terverifikasi KIRI Creator',
        'Prioritas matching kampanye brand & UMKM',
        'Perlindungan KIRI Escrow tanpa fee tersembunyi',
        'Akses mentoring bulanan KIRI Academy',
        'Showcase rate card resmi & profil publik terindeks'
      ],
    },
    {
      id: 'umkm_growth',
      name: 'UMKM Growth Pilot',
      price: 'Rp 399.000',
      period: '/ kuartal',
      desc: 'Paket untuk brand lokal & UMKM yang ingin pendampingan kurasi brief kreatif profesional.',
      features: [
        'Konsultasi brief gratis bersama kurator KIRI',
        'Akses matchmaking ke 500+ kreator terverifikasi',
        'Fasilitasi kontrak digital & sistem pembayaran aman',
        'Laporan performa dan dokumentasi kampanye'
      ],
    }
  ];

  const handlePaySimulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSubStep('active');
      showToast('Pembayaran keanggotaan berhasil! Akun Anda telah AKTIF.', 'success');
    }, 1200);
  };

  const handleFinishToDashboard = () => {
    // Login as default creator Raka Dewantara
    loginAs(DEFAULT_USERS[0]);
    navigateTo('page-16-dashboard-user');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 14 — Keanggotaan, Terms, Pembayaran & Aktivasi</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kiri-green-950 dark:text-white">
          Aktivasi Keanggotaan Ekosistem
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Status: {subStep === 'tier' ? 'Pilih Paket' : subStep === 'terms' ? 'Persetujuan Syarat & Ketentuan' : subStep === 'payment' ? 'Simulasi Pembayaran' : 'Akun Aktif Berhasil!'}
        </p>
      </div>

      {/* 4-Step Flow Stepper Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
        <div className={`flex items-center gap-1.5 ${subStep === 'tier' ? 'text-kiri-green-900 dark:text-kiri-gold-400 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-kiri-green-900/10 dark:bg-kiri-gold-500/20 flex items-center justify-center text-[10px]">1</span>
          <span>Pilih Paket</span>
        </div>
        <span className="text-gray-300">→</span>
        <div className={`flex items-center gap-1.5 ${subStep === 'terms' ? 'text-kiri-green-900 dark:text-kiri-gold-400 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-kiri-green-900/10 dark:bg-kiri-gold-500/20 flex items-center justify-center text-[10px]">2</span>
          <span>Ketentuan</span>
        </div>
        <span className="text-gray-300">→</span>
        <div className={`flex items-center gap-1.5 ${subStep === 'payment' ? 'text-kiri-green-900 dark:text-kiri-gold-400 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-kiri-green-900/10 dark:bg-kiri-gold-500/20 flex items-center justify-center text-[10px]">3</span>
          <span>Pembayaran</span>
        </div>
        <span className="text-gray-300">→</span>
        <div className={`flex items-center gap-1.5 ${subStep === 'active' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">4</span>
          <span>Aktif</span>
        </div>
      </div>

      {/* SubStep 1: Tier Selection */}
      {subStep === 'tier' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedTier === t.id
                    ? 'bg-kiri-ivory-warm dark:bg-kiri-dark-800 border-kiri-gold-500 shadow-elevated'
                    : 'bg-white dark:bg-kiri-dark-850 border-gray-200 dark:border-kiri-dark-700 hover:border-gray-300'
                }`}
              >
                {t.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-kiri-gold-500 text-kiri-dark-950 shadow-sm">
                    Rekomendasi
                  </span>
                )}

                <div>
                  <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                    {t.name}
                  </h3>
                  <div className="mt-2 mb-3">
                    <span className="font-serif text-3xl font-bold text-kiri-green-900 dark:text-kiri-gold-400">
                      {t.price}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{t.period}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {t.desc}
                  </p>

                  <div className="space-y-2 border-t border-gray-100 dark:border-kiri-dark-700 pt-4">
                    {t.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-2">
                  <div
                    className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition-all ${
                      selectedTier === t.id
                        ? 'bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950'
                        : 'bg-gray-100 dark:bg-kiri-dark-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {selectedTier === t.id ? 'Paket Terpilih ✓' : 'Pilih Paket'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-bold text-kiri-green-950 dark:text-white">Catatan Aturan Handoff:</span>{' '}
            Membership fee adalah biaya pengelolaan keanggotaan dan akses fitur platform. Biaya ini terpisah dari campaign / service fee proyek komersial yang difasilitasi kemudian.
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setSubStep('terms')}
              className="px-6 py-3 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2"
            >
              <span>Lanjut ke Syarat & Ketentuan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SubStep 2: Terms and Conditions */}
      {subStep === 'terms' && (
        <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6 animate-in fade-in">
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
              Syarat & Ketentuan Keanggotaan KIRI PROJECT
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Harap baca dan setujui kode etik ekosistem sebelum melakukan aktivasi akun.
            </p>
          </div>

          <div className="h-56 overflow-y-auto p-4 rounded-2xl bg-gray-50 dark:bg-kiri-dark-850 border border-gray-200 dark:border-kiri-dark-700 text-xs text-gray-700 dark:text-gray-300 space-y-3 font-light leading-relaxed">
            <p><strong>1. Prinsip Ekosistem:</strong> Seluruh anggota KIRI PROJECT menjunjung tinggi integritas, kolaborasi beretika, dan komitmen menghasilkan dampak positif bagi industri kreatif Indonesia.</p>
            <p><strong>2. Alur Permintaan Proyek:</strong> Seluruh inisiasi kolaborasi komersial antar entitas ekosistem wajib dicatat dan difasilitasi melalui tombol "Request Through KIRI Project" guna mendapatkan perlindungan hukum dan sistem escrow aman.</p>
            <p><strong>3. Orisinalitas & Hak Kekayaan Intelektual:</strong> Setiap karya visual, video, maupun tulisan yang diproduksi wajib merupakan karya orisinal bebas dari pelanggaran hak cipta pihak ketiga.</p>
            <p><strong>4. Perlindungan Data Komunitas:</strong> Database anggota komunitas dikelola secara terkontrol dan dilarang untuk disebarluaskan sebagai daftar kontak publik bebas tanpa izin resmi.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-kiri-green-900 rounded focus:ring-kiri-gold-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Saya telah membaca, memahami, dan menyetujui seluruh <strong>Syarat & Ketentuan serta Kode Etik KIRI PROJECT</strong>.
            </span>
          </label>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
            <button
              onClick={() => setSubStep('tier')}
              className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
            >
              Ganti Paket
            </button>
            <button
              disabled={!agreedTerms}
              onClick={() => setSubStep('payment')}
              className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 shadow-subtle disabled:opacity-50 flex items-center gap-2"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SubStep 3: Payment Gateway Simulation */}
      {subStep === 'payment' && (
        <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-kiri-dark-700">
            <div>
              <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                Simulasi Gerbang Pembayaran Resmi
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pilih metode pembayaran untuk aktivasi instan
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase">Total Tagihan:</span>
              <p className="font-serif text-2xl font-bold text-kiri-green-900 dark:text-kiri-gold-400">
                Rp 149.000
              </p>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('qris')}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'qris'
                  ? 'border-kiri-gold-500 bg-kiri-gold-500/10 text-kiri-green-950 dark:text-kiri-gold-300 font-bold'
                  : 'border-gray-200 dark:border-kiri-dark-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <QrCode className="w-5 h-5 text-kiri-green-900 dark:text-kiri-gold-400" />
              <span>QRIS Instan</span>
            </button>
            <button
              onClick={() => setPaymentMethod('va')}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'va'
                  ? 'border-kiri-gold-500 bg-kiri-gold-500/10 text-kiri-green-950 dark:text-kiri-gold-300 font-bold'
                  : 'border-gray-200 dark:border-kiri-dark-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Zap className="w-5 h-5 text-kiri-green-900 dark:text-kiri-gold-400" />
              <span>Virtual Account</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'card'
                  ? 'border-kiri-gold-500 bg-kiri-gold-500/10 text-kiri-green-950 dark:text-kiri-gold-300 font-bold'
                  : 'border-gray-200 dark:border-kiri-dark-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <CreditCard className="w-5 h-5 text-kiri-green-900 dark:text-kiri-gold-400" />
              <span>Kartu Debit/Kredit</span>
            </button>
          </div>

          {/* QRIS / VA Content */}
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-kiri-dark-850 border border-gray-200 dark:border-kiri-dark-700 flex flex-col items-center justify-center text-center space-y-3">
            {paymentMethod === 'qris' && (
              <div className="space-y-3">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm mx-auto flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-mono p-4 text-center">
                    [QRIS CODE SIMULATOR]
                    <br />
                    KIRI PROJECT ESCROW
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Scan kode QRIS menggunakan GoPay, OVO, Dana, BCA Mobile, atau mobile banking apapun.
                </p>
              </div>
            )}

            {paymentMethod === 'va' && (
              <div className="space-y-2 text-xs">
                <p className="text-gray-500">Nomor Virtual Account BCA:</p>
                <p className="font-mono text-xl font-bold text-kiri-green-950 dark:text-white">
                  8809 1234 5678 9901
                </p>
                <p className="text-[11px] text-gray-400">Atas Nama: KIRI PROJECT ESCROW PT</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2 text-xs">
                <p className="text-gray-600 dark:text-gray-300">
                  Simulasi otorisasi kartu debit/kredit dengan proteksi 3D Secure aktif.
                </p>
              </div>
            )}
          </div>

          {/* Action to Simulate Success */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-kiri-dark-700">
            <button
              onClick={() => setSubStep('terms')}
              className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
            >
              Kembali
            </button>

            <button
              disabled={isProcessing}
              onClick={handlePaySimulation}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-subtle flex items-center gap-2"
            >
              {isProcessing ? (
                <span>Memproses Verifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulasikan Pembayaran Berhasil (1-Click)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SubStep 4: Account Active Celebration Screen */}
      {subStep === 'active' && (
        <div className="bg-gradient-to-b from-kiri-green-950 to-kiri-green-900 text-white rounded-3xl p-10 text-center space-y-6 shadow-elevated border border-kiri-gold-500/40 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-kiri-gold-500/20 border-2 border-kiri-gold-400 flex items-center justify-center mx-auto text-kiri-gold-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="px-3 py-1 rounded-full bg-kiri-gold-500/20 text-kiri-gold-300 text-xs font-bold uppercase tracking-wider">
              Status Akun: AKTIF TERVERIFIKASI
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">
              Selamat Datang di KIRI PROJECT!
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Keanggotaan Anda telah aktif. Anda kini dapat mengakses dasbor privat, mempublikasikan portofolio resmi, dan menerima permintaan kolaborasi terkurasi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 max-w-sm mx-auto text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">Tipe Anggota:</span>
              <span className="font-bold text-kiri-gold-300">Creator Pro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID Keanggotaan:</span>
              <span className="font-mono font-bold text-white">KP-MEM-2026-9812</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status Validasi:</span>
              <span className="font-bold text-emerald-400">Aktif s/d Sep 2027</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleFinishToDashboard}
              className="px-8 py-3.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-sm shadow-gold-glow flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <span>Buka Dashboard Saya (PAGE 16)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
