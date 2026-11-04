import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createAccountForRegistration } from '../lib/registration';
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
  const { navigateTo, submitRegistration, showToast, refreshSession } = useApp();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    stageName: '',
    email: '',
    phone: '',
    city: '',
    niche: '',
    instagram: '',
    tiktok: '',
    portfolioLink: '',
    equipment: '',
    expectedRate: '',
    bio: '',
    errors: {} as Record<string, string>,
  });

  const requiredByStep: Record<number, string[]> = {
    1: ['fullName', 'stageName', 'email', 'phone', 'city'],
    2: ['niche', 'instagram', 'portfolioLink'],
    3: ['password'],
  };

  const validateStep = (stepNum: number): boolean => {
    const fields = requiredByStep[stepNum] ?? [];
    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      const val = f === 'password' ? password : (formData as unknown as Record<string, string>)[f];
      if (!val || !String(val).trim()) nextErrors[f] = 'Wajib diisi';
    }
    if (stepNum === 1 && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      nextErrors.email = 'Format email tidak valid';
    }
    if (stepNum === 3 && password && password.length < 8) {
      nextErrors.password = 'Minimal 8 karakter';
    }
    if (stepNum === 3 && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi tidak cocok';
    }
    setFormData((prev) => ({ ...prev, errors: nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const fieldError = (f: string) => (formData.errors as Record<string, string>)[f];

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = async () => {
    if (step < 3) {
      if (!validateStep(step)) {
        setFormError('Beberapa kolom wajib belum diisi. Periksa kolom bertanda merah.');
        return;
      }
      setFormError(null);
      setStep(step + 1);
      return;
    }
    if (!validateStep(3)) {
      setFormError('Beberapa kolom wajib belum diisi. Periksa kolom bertanda merah.');
      return;
    }
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
      // The registration is created once; retries after a failure only redo the
      // account step so we never create duplicate registrations.
      let entityId = createdEntityId;
      if (!entityId) {
        const saved = await submitRegistration({
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
        entityId = saved.entityId ?? null;
        setCreatedEntityId(entityId);
      }
      const account = await createAccountForRegistration({
        email: formData.email.trim(),
        password,
        name: formData.fullName,
        phone: formData.phone,
        entityType: 'creator',
        entityId: entityId ?? undefined,
      });
      if (account.error) {
        setFormError(account.error);
        return;
      }
      showToast('Akun kreator aktif! Melanjutkan ke verifikasi keanggotaan.', 'success');
      // Sinkronkan sesi hasil register ke state React dulu — tanpa ini gate
      // "Masuk Diperlukan" muncul walau akun baru saja berhasil dibuat.
      refreshSession();
      navigateTo('page-14-membership-payment');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran ke server KIRI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
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
                  Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('fullName') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('fullName') && <p className="mt-1 text-[10px] text-red-500">{fieldError('fullName')}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Panggung / Alias Kreator <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.stageName}
                  onChange={(e) => handleChange('stageName', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('stageName') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('stageName') && <p className="mt-1 text-[10px] text-red-500">{fieldError('stageName')}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Alamat Email Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('email') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('email') && <p className="mt-1 text-[10px] text-red-500">{fieldError('email')}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('phone') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('phone') && <p className="mt-1 text-[10px] text-red-500">{fieldError('phone')}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Domisili / Kota Basis Kreatif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('city') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('city') && <p className="mt-1 text-[10px] text-red-500">{fieldError('city')}</p>}
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
                  Niche Utama Konten <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.niche}
                  onChange={(e) => handleChange('niche', e.target.value)}
                  placeholder="Ketik niche kamu, mis. Cinematography, Food Review, Fashion..."
                  autoComplete="off"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('niche') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('niche')
                  ? <p className="mt-1 text-[10px] text-red-500">{fieldError('niche')}</p>
                  : <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">Bebas diisi sesuai keahlian — tidak harus salah satu kategori.</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Username Instagram <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('instagram') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('instagram') && <p className="mt-1 text-[10px] text-red-500">{fieldError('instagram')}</p>}
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
                  Tautan Portofolio / Drive / Behance <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => handleChange('portfolioLink', e.target.value)}
                  placeholder="https://..."
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('portfolioLink') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('portfolioLink') && <p className="mt-1 text-[10px] text-red-500">{fieldError('portfolioLink')}</p>}
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
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kata Sandi Akun <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('password') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('password') && <p className="mt-1 text-[10px] text-red-500">{fieldError('password')}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none ${fieldError('confirmPassword') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-kiri-dark-700 focus:border-kiri-gold-500'}`}
                />
                {fieldError('confirmPassword') && <p className="mt-1 text-[10px] text-red-500">{fieldError('confirmPassword')}</p>}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Kata sandi ini dipakai untuk masuk ke dashboard member KIRI (bisa juga dengan nomor WhatsApp terdaftar).
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {formError}
              </div>
            )}


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
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90 shadow-subtle flex items-center gap-2 disabled:opacity-50"
          >
            <span>{step === 3 ? (isSubmitting ? 'Memproses...' : 'Lanjut ke Verifikasi & Keanggotaan') : 'Lanjutkan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
