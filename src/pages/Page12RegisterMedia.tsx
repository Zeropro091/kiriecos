import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Newspaper,
  CheckCircle2,
  Radio
} from 'lucide-react';

export const Page12RegisterMedia: React.FC = () => {
  const { navigateTo, submitRegistration, showToast } = useApp();

  const [formData, setFormData] = useState({
    mediaName: 'Suara Kreatif Nusantara',
    picName: 'Dian Permana',
    email: 'redaksi@suarakreatif.id',
    phone: '081122334455',
    city: 'Jakarta & Bali',
    channels: 'Portal Web, Instagram News, Podcast',
    monthlyTraffic: '150K - 300K Pembaca',
    coverageFocus: 'Kreator digital, inovasi budaya, profil UMKM inspiratif.',
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRegistration({
      type: 'media',
      name: formData.mediaName,
      contactPerson: formData.picName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      category: formData.channels,
      socialLink: formData.email,
      details: `Traffic: ${formData.monthlyTraffic} | Fokus: ${formData.coverageFocus}`,
    });
    showToast('Registrasi Media Partner berhasil diajukan untuk verifikasi KIRI Project!', 'success');
    navigateTo('page-14-membership-payment');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 12 — Registrasi Media Partner</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Registrasi Media Partner
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Bergabung dalam jaringan distribusi siaran pers dan liputan kreator resmi KIRI PROJECT
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nama Media / Publikasi *
            </label>
            <input
              type="text"
              value={formData.mediaName}
              onChange={(e) => handleChange('mediaName', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nama Pemimpin Redaksi / PIC *
            </label>
            <input
              type="text"
              value={formData.picName}
              onChange={(e) => handleChange('picName', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Redaksi *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nomor WhatsApp Redaksi *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kanal Distribusi Utama *
            </label>
            <input
              type="text"
              value={formData.channels}
              onChange={(e) => handleChange('channels', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Estimasi Jangkauan / Traffic Bulanan
            </label>
            <input
              type="text"
              value={formData.monthlyTraffic}
              onChange={(e) => handleChange('monthlyTraffic', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Fokus Rubrik / Kriteria Penerimaan Siaran Pers
            </label>
            <textarea
              rows={3}
              value={formData.coverageFocus}
              onChange={(e) => handleChange('coverageFocus', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-kiri-dark-700">
          <button
            type="button"
            onClick={() => navigateTo('page-08-join-select')}
            className="px-5 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-gray-700 dark:text-gray-300"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 shadow-subtle flex items-center gap-2"
          >
            <span>Lanjut ke Aktivasi Akun</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
