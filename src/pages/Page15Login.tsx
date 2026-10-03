import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Sparkles,
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Building2,
  Users
} from 'lucide-react';

/**
 * Demo accounts only exist in Local Mock Mode. Once the real Supabase backend
 * is configured they are disabled so the hardcoded identities in the bundle
 * can never be used to log into production.
 */
const DEMO_MODE = !isSupabaseConfigured;

interface UserSessionLike {
  name?: string;
  role?: string;
  entityType?: string;
  entityId?: string;
  avatar?: string;
  membershipTier?: string;
}

export const Page15Login: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [email, setEmail] = useState(DEMO_MODE ? 'raka@dewantara.id' : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalized = email.trim().toLowerCase();
    const matched = DEFAULT_USERS.find((u) => u.email.toLowerCase() === normalized);

    // 1) Supabase Auth path — real credential verification (when wired).
    if (isSupabaseConfigured && supabase) {
      supabase.auth
        .signInWithPassword({ email: normalized, password })
        .then(({ data, error: authError }) => {
          if (authError) {
            setError(
              authError.message.toLowerCase().includes('invalid')
                ? 'Email atau kata sandi salah.'
                : authError.message
            );
            return;
          }
          const meta = (data.user?.user_metadata || {}) as Partial<UserSessionLike>;
          const identity =
            DEFAULT_USERS.find((u) => u.email.toLowerCase() === normalized) ||
            ({
              id: data.user?.id || `user-${Date.now()}`,
              name: meta.name || normalized.split('@')[0],
              email: normalized,
              role: (meta.role as any) || 'creator',
              entityType: (meta.entityType as any) || 'creator',
              entityId: (meta.entityId as any) || `entity-${data.user?.id || Date.now()}`,
              avatar: meta.avatar || '',
              membershipTier: (meta.membershipTier as any) || 'Free Member',
              isVerified: false,
            } as any);
          loginAs(identity);
        });
      return;
    }

    // 2) Local Mock Mode — demo identities, guarded so it never runs in prod.
    if (!DEMO_MODE) {
      setError('Backend belum terkonfigurasi. Hubungi administrator KIRI.');
      return;
    }
    if (!matched) {
      setError('Akun demo tidak ditemukan. Gunakan salah satu email demo yang tersedia.');
      return;
    }
    if (!password.trim()) {
      setError('Masukkan kata sandi (mode demo: kata sandi apa pun diterima).');
      return;
    }
    loginAs(matched);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
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
