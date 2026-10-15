import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { localAuth } from '../lib/localAuth';
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

export const Page24LoginAdmin: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [email, setEmail] = useState('admin@kiriproject.id');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { session, error: authError } = await localAuth.verifyAdmin(email, password);
      if (authError || !session) {
        setError(authError ?? 'Email atau kata sandi admin salah.');
        return;
      }
      localAuth.saveSession(session);
      loginAs(session);
      navigateTo('page-25-dashboard-admin');
    } catch (err) {
      console.error('[KIRI] Admin login failed:', err);
      setError('Terjadi kesalahan saat memproses login admin.');
    } finally {
      setBusy(false);
    }
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

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-[11px] leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 font-bold text-xs shadow-gold-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{busy ? 'Memverifikasi…' : 'Masuk ke Admin Request Center'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="pt-2 border-t border-white/10 text-[11px] text-center text-gray-400 leading-relaxed">
          Kredensial diverifikasi terhadap penyimpanan akun lokal di perangkat ini.
          Hubungi super-admin KIRI bila Anda kehilangan akses.
        </p>
      </div>
    </div>
  );
};
