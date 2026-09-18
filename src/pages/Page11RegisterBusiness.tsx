import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const Page11RegisterBusiness: React.FC = () => {
  const { navigateTo, submitRegistration, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    businessName: 'Bali Artisan Roasters',
    picName: 'Wayan Sudarma',
    email: 'sudarma@baliartisan.com',
    phone: '081288990011',
    city: 'Denpasar, Bali',
    industry: 'Food & Beverage / Specialty Cafe',
    budgetBracket: 'Rp 5.000.000 - Rp 15.000.000 / bulan',
    marketingNeeds: 'Mencari kreator videografi Reels untuk review outlet baru dan fotografi menu signature.',
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      submitRegistration({
        type: 'business',
        name: formData.businessName,
        contactPerson: formData.picName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        category: formData.industry,
        socialLink: formData.email,
        details: `Budget: ${formData.budgetBracket} | Kebutuhan: ${formData.marketingNeeds}`,
      });
      showToast('Pendaftaran bisnis/UMKM tersimpan! Lanjut ke pemilihan paket membership.', 'success');
      navigateTo('page-14-membership-payment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 11 — Pendaftaran Brand & UMKM</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Daftarkan Bisnis / UMKM Anda
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Temukan kreator terkurasi dan optimalkan pemasaran digital brand Anda melalui KIRI PROJECT
        </p>
      </div>

      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              1. Informasi Usaha & PIC
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Brand / Usaha *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Pemilik / PIC Marketing *
                </label>
                <input
                  type="text"
                  value={formData.picName}
                  onChange={(e) => handleChange('picName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Bisnis *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp Narahubung *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Sektor Industri *
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kota Lokasi Usaha *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-2">
              2. Target Pemasaran & Alokasi Budget
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Estimasi Alokasi Anggaran Kolaborasi Kreator
              </label>
              <select
                value={formData.budgetBracket}
                onChange={(e) => handleChange('budgetBracket', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="Rp 2.000.000 - Rp 5.000.000 / proyek">Rp 2.000.000 - Rp 5.000.000 / proyek</option>
                <option value="Rp 5.000.000 - Rp 15.000.000 / bulan">Rp 5.000.000 - Rp 15.000.000 / bulan</option>
                <option value="Rp 15.000.000 - Rp 30.000.000 / kampanye">Rp 15.000.000 - Rp 30.000.000 / kampanye</option>
                <option value="Di atas Rp 30.000.000">Kebutuhan Skala Besar (Custom Pilot)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi Kebutuhan Kolaborasi / Produk yang Ingin Dipromosikan
              </label>
              <textarea
                rows={4}
                value={formData.marketingNeeds}
                onChange={(e) => handleChange('marketingNeeds', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              ></textarea>
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
            <span>{step === 2 ? 'Kirim Data & Pilih Membership' : 'Lanjutkan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
