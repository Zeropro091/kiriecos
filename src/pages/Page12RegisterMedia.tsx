import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createAccountForRegistration } from '../lib/registration';
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setFormError('Kata sandi akun minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      // One registration max — retries after a failure only redo the account step.
      let entityId = createdEntityId;
      if (!entityId) {
        const saved = await submitRegistration({
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
        entityId = saved.entityId ?? null;
        setCreatedEntityId(entityId);
      }
      const account = await createAccountForRegistration({
        email: formData.email.trim(),
        password,
        name: formData.picName,
        phone: formData.phone,
        entityType: 'media',
        entityId: entityId ?? undefined,
      });
      if (account.error) {
        setFormError(account.error);
        return;
      }
      showToast('Registrasi Media Partner berhasil — akun aktif untuk verifikasi KIRI Project!', 'success');
      navigateTo('page-14-membership-payment');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran ke server KIRI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
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

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kata Sandi Akun *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Konfirmasi Kata Sandi *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Kata sandi ini dipakai untuk masuk ke dashboard media partner (bisa juga dengan nomor WhatsApp terdaftar).
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {formError}
          </div>
        )}

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
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 shadow-subtle flex items-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Memproses...' : 'Lanjut ke Aktivasi Akun'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
