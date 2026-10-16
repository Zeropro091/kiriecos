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
    <div className="mx-auto max-w-sm px-5 py-16 lg:py-24">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
          <ShieldAlert className="w-4 h-4" />
          <span>Portal Admin</span>
        </div>
        <h1 className="font-serif text-3xl text-foreground">Masuk sebagai Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Area terbatas untuk tim kurasi KIRI Project.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-primary">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-foreground">Sistem Kurasi &amp; Matching</h2>
            <p className="text-xs text-muted-foreground">Akses pengawasan ekosistem</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-sm font-medium text-foreground">
              Email administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-sm font-medium text-foreground">
              Kata sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy && <span className="spinner" />}
            <span>{busy ? 'Memverifikasi…' : 'Masuk'}</span>
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
