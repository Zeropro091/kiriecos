import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  User,
  Instagram,
  Youtube,
  Globe,
  Film
} from 'lucide-react';

export const Page09RegisterCreator: React.FC = () => {
  const { navigateTo, submitRegistration, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: 'Gede Arya Wijaya',
    stageName: 'Arya Visuals',
    email: 'arya.wijaya@gmail.com',
    phone: '081298765432',
    city: 'Denpasar, Bali',
    niche: 'Cinematography & Travel',
    instagram: '@aryavisuals.bali',
    tiktok: '@aryabali.reels',
    portfolioLink: 'https://behance.net/aryawijaya',
    equipment: 'Sony A7S III, DJI Mavic 3 Pro, Prime Lenses',
    expectedRate: 'Rp 4.000.000 - Rp 8.000.000 / proyek',
    bio: 'Videografer berpengalaman 5 tahun di industri pariwisata dan culinary Bali.',
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      submitRegistration({
        type: 'creator',
        name: formData.stageName || formData.fullName,
        contactPerson: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        category: formData.niche,
        socialLink: formData.instagram,
        details: `${formData.bio} | Equipment: ${formData.equipment} | Rate: ${formData.expectedRate}`,
      });
      showToast('Formulir kreator berhasil disimpan! Melanjutkan ke verifikasi keanggotaan.', 'success');
      navigateTo('page-14-membership-payment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 09 — Formulir Pendaftaran Kreator</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Registrasi Content Creator
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Langkah {step} dari 3: {step === 1 ? 'Data Pribadi' : step === 2 ? 'Kanal Sosial & Portofolio' : 'Preferensi Kolaborasi & Konfirmasi'}
        </p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-kiri-dark-700 -translate-y-1/2 -z-0"></div>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all ${
              step >= s
                ? 'bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-950 shadow-sm'
                : 'bg-white dark:bg-kiri-dark-800 text-gray-400 border border-gray-200 dark:border-kiri-dark-700'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              1. Informasi Personal & Profil
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Panggung / Alias Kreator *
                </label>
                <input
                  type="text"
                  value={formData.stageName}
                  onChange={(e) => handleChange('stageName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Alamat Email Aktif *
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
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Domisili / Kota Basis Kreatif *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bio Singkat / Deskripsi Diri
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              2. Kanal Media Sosial & Portofolio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Niche Utama Konten *
                </label>
                <select
                  value={formData.niche}
                  onChange={(e) => handleChange('niche', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Cinematography & Travel">Cinematography & Travel</option>
                  <option value="Food & Culinary">Food & Culinary Review</option>
                  <option value="Art & Culture">Art, Craft & Culture</option>
                  <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                  <option value="Tech & Creative Digital">Tech & Creative Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Username Instagram *
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Username TikTok
                </label>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => handleChange('tiktok', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tautan Portofolio / Drive / Behance *
                </label>
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => handleChange('portfolioLink', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Peralatan Utama (Kamera, Drone, Audio, Software)
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => handleChange('equipment', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              3. Preferensi Kolaborasi & Konfirmasi
            </h3>

            <div className="p-4 rounded-xl bg-kiri-ivory-warm dark:bg-kiri-dark-750 border border-kiri-gold-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama:</span>
                <span className="font-bold">{formData.fullName} ({formData.stageName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Niche:</span>
                <span className="font-bold">{formData.niche}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Instagram:</span>
                <span className="font-bold">{formData.instagram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Domisili:</span>
                <span className="font-bold">{formData.city}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kisaran Fee Kolaborasi yang Diharapkan
              </label>
              <input
                type="text"
                value={formData.expectedRate}
                onChange={(e) => handleChange('expectedRate', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-200 dark:border-kiri-dark-700 text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <p className="font-bold text-kiri-green-950 dark:text-white">Kode Etik KIRI PROJECT:</p>
              <p>
                Dengan melanjutkan, Anda berkomitmen untuk menjunjung tinggi orisinalitas karya, profesionalisme jadwal produksi, dan mematuhi etika kemitraan bersama brand dan komunitas di ekosistem KIRI PROJECT.
              </p>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-kiri-dark-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
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
            <span>{step === 3 ? 'Lanjut ke Verifikasi & Keanggotaan' : 'Lanjutkan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
