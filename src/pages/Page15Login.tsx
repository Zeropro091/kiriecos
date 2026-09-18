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

        {/* 1-Click Fast Demo Role Switcher */}
        <div className="pt-4 border-t border-gray-100 dark:border-kiri-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-kiri-gold-700 dark:text-kiri-gold-400 tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-kiri-gold-500" />
              1-Click Demo Login (Pilih Peran):
            </span>
          </div>

          <div className="space-y-2">
            {DEFAULT_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => loginAs(u)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-kiri-dark-700 hover:border-kiri-gold-500/60 bg-gray-50 dark:bg-kiri-dark-750 flex items-center justify-between text-left text-xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover border border-kiri-gold-500/30"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-kiri-green-900 dark:group-hover:text-kiri-gold-300">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {u.membershipTier} • {u.role.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-white dark:bg-kiri-dark-850 text-kiri-green-900 dark:text-kiri-gold-400 border border-gray-100 dark:border-kiri-dark-700 group-hover:bg-kiri-green-900 group-hover:text-white dark:group-hover:bg-kiri-gold-500 dark:group-hover:text-kiri-dark-900 transition-all">
                  Login →
                </span>
              </button>
            ))}
          </div>
        </div>

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
