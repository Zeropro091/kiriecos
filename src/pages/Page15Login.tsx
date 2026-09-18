import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS } from '../data/mockData';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Building2,
  Users
} from 'lucide-react';

export const Page15Login: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [email, setEmail] = useState('raka@dewantara.id');
  const [password, setPassword] = useState('••••••••');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to first user or matched email
    const found = DEFAULT_USERS.find((u) => u.email === email) || DEFAULT_USERS[0];
    loginAs(found);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
          <span>PAGE 15 — Portal Masuk Anggota Ekosistem</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Akses area privat dasbor kreator, UMKM, komunitas, atau admin
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-6">
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Kata Sandi
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-kiri-gold-700 dark:text-kiri-gold-400 hover:underline">
                Lupa Sandi?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none focus:border-kiri-gold-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold text-xs hover:opacity-90 shadow-subtle transition-all flex items-center justify-center gap-2"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Belum memiliki akun terdaftar?{' '}
          <button
            onClick={() => navigateTo('page-08-join-select')}
            className="font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
