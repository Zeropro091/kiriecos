import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Zap,
  AlertCircle
} from 'lucide-react';

interface UserSessionLike {
  name?: string;
  role?: string;
  entityType?: string;
  entityId?: string;
  avatar?: string;
  membershipTier?: string;
}

const ADMIN_PASSWORD = (import.meta as any).env?.VITE_KIRI_ADMIN_PASSWORD || '';
const DEMO_MODE = !isSupabaseConfigured;

export const Page24LoginAdmin: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [email, setEmail] = useState(DEMO_MODE ? 'admin@kiriproject.id' : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const adminUser = DEFAULT_USERS.find((u) => u.role === 'admin') || DEFAULT_USERS[3];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSupabaseConfigured && supabase) {
      // Production path: real Auth + server-side role check.
      setBusy(true);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      setBusy(false);

      if (authError || !data.user) {
        setError('Email atau kata sandi admin salah.');
        return;
      }
      // Server-side gate: only profiles flagged is_admin may proceed.
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (!prof || (prof as any).role !== 'admin') {
        await supabase.auth.signOut();
        setError('Akun ini tidak memiliki hak akses administrator KIRI.');
        return;
      }
      const meta = (data.user.user_metadata || {}) as UserSessionLike;
      loginAs({
        id: data.user.id,
        name: meta.name || 'Administrator KIRI',
        email: data.user.email || email,
        role: 'admin',
        entityType: 'admin' as any,
        entityId: 'admin',
        avatar: meta.avatar || '',
        membershipTier: 'Admin Ops',
        isVerified: true,
      } as any);
      navigateTo('page-25-dashboard-admin');
      return;
    }

    // Local Mock Mode only.
    if (!DEMO_MODE) {
      setError('Backend belum terkonfigurasi. Hubungi super-admin KIRI.');
      return;
    }
    if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
      setError('Kunci akses admin tidak valid.');
      return;
    }
    if (!password.trim()) {
      setError('Masukkan kunci akses admin.');
      return;
    }
    if (email.trim().toLowerCase() !== adminUser.email.toLowerCase()) {
      setError('Email admin tidak dikenali.');
      return;
    }
    loginAs(adminUser);
    navigateTo('page-25-dashboard-admin');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>PAGE 24 — Gerbang Otoritas Admin KIRI</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
          Portal Operasional Admin
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Area terbatas untuk Kak Rini & Tim Kurasi KIRI PROJECT
        </p>
      </div>

      {/* Admin Card */}
      <div className="bg-gradient-to-b from-kiri-green-950 to-kiri-green-900 text-white rounded-3xl p-8 border border-kiri-gold-500/40 shadow-elevated space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-kiri-gold-500/20 border border-kiri-gold-400 flex items-center justify-center text-kiri-gold-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-white">
              Sistem Kurasi & Matching
            </h3>
            <p className="text-xs text-kiri-gold-300">Akses Pengawasan Ekosistem</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-kiri-gold-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-kiri-gold-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-xs shadow-gold-glow transition-all flex items-center justify-center gap-2"
          >
            <span>Masuk ke Admin Request Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="pt-2 border-t border-white/10 text-[11px] text-center text-gray-400 leading-relaxed">
          Akses admin diverifikasi lewat kunci server-side. Tidak ada jalur masuk instan —
          hubungi super-admin KIRI bila Anda kehilangan kunci.
        </p>
      </div>
    </div>
  );
};
