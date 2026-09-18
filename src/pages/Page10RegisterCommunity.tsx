import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  ShieldCheck
} from 'lucide-react';

export const Page10RegisterCommunity: React.FC = () => {
  const { navigateTo, submitRegistration, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    communityName: 'Kolektif Seni Rupa Dewata',
    leaderName: 'I Made Dananjaya',
    email: 'kolektif.dewata@gmail.com',
    phone: '081322446688',
    city: 'Gianyar, Bali',
    category: 'Visual Arts & Illustration',
    memberCount: '150 - 300 Anggota',
    socialLink: '@kolektif.dewata',
    communityGoals: 'Menyediakan wadah pameran seni independen dan kolaborasi merchandise dengan brand lokal.',
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      submitRegistration({
        type: 'community',
        name: formData.communityName,
        contactPerson: formData.leaderName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        category: formData.category,
        socialLink: formData.socialLink,
        details: `Anggota: ${formData.memberCount} | Visi: ${formData.communityGoals}`,
      });
      showToast('Formulir komunitas berhasil diajukan! Melanjutkan ke aktivasi.', 'success');
      navigateTo('page-14-membership-payment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 10 — Pendaftaran Komunitas Kreatif</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Daftarkan Komunitas Anda
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Integrasikan komunitas Anda ke dalam jejaring kolaborasi terfasilitasi KIRI PROJECT
        </p>
      </div>

      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              1. Identitas Komunitas & Narahubung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Komunitas *
                </label>
                <input
                  type="text"
                  value={formData.communityName}
                  onChange={(e) => handleChange('communityName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Ketua / PIC Komunitas *
                </label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => handleChange('leaderName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Resmi Komunitas *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp PIC *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Seni / Bidang *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Estimasi Jumlah Anggota Aktif
                </label>
                <select
                  value={formData.memberCount}
                  onChange={(e) => handleChange('memberCount', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="50 - 150 Anggota">50 - 150 Anggota</option>
                  <option value="150 - 300 Anggota">150 - 300 Anggota</option>
                  <option value="300 - 1000 Anggota">300 - 1.000 Anggota</option>
                  <option value="1000+ Anggota">Lebih dari 1.000 Anggota</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              2. Fokus Gerakan & Database Terkontrol
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tujuan & Agenda Utama Komunitas
              </label>
              <textarea
                rows={4}
                value={formData.communityGoals}
                onChange={(e) => handleChange('communityGoals', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              ></textarea>
            </div>

            <div className="p-4 rounded-xl bg-kiri-green-50 dark:bg-kiri-dark-750 border border-kiri-green-200 dark:border-kiri-dark-700 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-kiri-green-950 dark:text-kiri-gold-300">
                <ShieldCheck className="w-4 h-4 text-kiri-gold-600" />
                <span>Ketentuan Database Anggota Komunitas:</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                Sesuai standar pengembang KIRI PROJECT, database anggota komunitas Anda akan dilindungi dan hanya dapat diakses oleh admin komunitas Anda (melalui PAGE 19). Tidak dipublikasikan sebagai kontak terbuka.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-kiri-dark-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('page-08-join-select')}
              className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
            >
              Ganti Peran
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 shadow-subtle flex items-center gap-2"
          >
            <span>{step === 2 ? 'Kirim Pendaftaran & Aktivasi' : 'Langkah Berikutnya'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
