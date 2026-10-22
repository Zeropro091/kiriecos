import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createAccountForRegistration } from '../lib/registration';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

export const Page13RegisterPartner: React.FC = () => {
  const { navigateTo, submitRegistration, showToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    institutionName: 'Inkubator Bisnis Kreatif Universitas Udayana',
    picName: 'Dr. Wayan Sudira, M.M.',
    email: 'inkubator@unud.ac.id',
    phone: '081233445566',
    city: 'Denpasar & Badung, Bali',
    institutionType: 'Universitas / Inkubator Bisnis Kampus',
    partnershipScope: 'Program pendampingan komersialisasi riset mahasiswa, kurasi talenta digital, dan workshop bersama KIRI Academy.',
    mouIntent: 'MoU Kerjasama Strategis Tri Dharma Perguruan Tinggi & Ekonomi Kreatif',
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
          type: 'strategic',
          name: formData.institutionName,
          contactPerson: formData.picName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          category: formData.institutionType,
          socialLink: formData.email,
          details: `Ruang Lingkup: ${formData.partnershipScope} | Intensi MoU: ${formData.mouIntent}`,
        });
        entityId = saved.entityId ?? null;
        setCreatedEntityId(entityId);
      }
      const account = await createAccountForRegistration({
        email: formData.email.trim(),
        password,
        name: formData.picName,
        phone: formData.phone,
        entityType: 'strategic',
        entityId: entityId ?? undefined,
      });
      if (account.error) {
        setFormError(account.error);
        return;
      }
      showToast('Pengajuan kemitraan strategis diterima — akun institusi aktif!', 'success');
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
          Inisiasi Kemitraan Strategis
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kolaborasi kelembagaan untuk memperkuat daya saing ekosistem kreatif nusantara
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nama Lengkap Institusi / Lembaga / Badan Usaha *
            </label>
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) => handleChange('institutionName', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Pejabat Berwenang / PIC Kemitraan *
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
              Email Resmi Lembaga *
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
              Kontak WhatsApp Resmi *
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
              Tipe Institusi *
            </label>
            <input
              type="text"
              value={formData.institutionType}
              onChange={(e) => handleChange('institutionType', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Rencana Ruang Lingkup Kolaborasi & Komitmen Sumber Daya
            </label>
            <textarea
              rows={3}
              value={formData.partnershipScope}
              onChange={(e) => handleChange('partnershipScope', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Intensi Perjanjian / Dokumen Legal (MoU / PKS)
            </label>
            <input
              type="text"
              value={formData.mouIntent}
              onChange={(e) => handleChange('mouIntent', e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
            />
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
              Kata sandi ini dipakai untuk masuk ke dashboard kemitraan (bisa juga dengan nomor WhatsApp terdaftar).
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
            <span>{isSubmitting ? 'Memproses...' : 'Lanjut ke Review & Aktivasi'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
