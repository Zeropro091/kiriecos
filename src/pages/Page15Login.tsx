import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { localAuth } from '../lib/localAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertCircle, ArrowRight, KeyRound, AtSign } from 'lucide-react';

export const Page15Login: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const term = identifier.trim();
    if (!term) {
      setError('Masukkan Username, Email, atau ID Akun Anda.');
      return;
    }

    setBusy(true);
    try {
      const { session, error: authError } = await localAuth.verify(term, password);
      if (session) {
        loginAs(session);
        return;
      }
      setError(authError ?? 'Login gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-16 lg:py-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Masuk ke akun</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gunakan username, email, atau nomor WhatsApp terdaftar.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-identifier" className="block text-sm font-medium text-foreground">
              Username / Email / ID Akun
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-identifier"
                type="text"
                autoComplete="username"
                placeholder="contoh: rakadewantara"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Kata sandi
              </label>
              <button
                type="button"
                onClick={() =>
                  setError('Bantuan: gunakan nomor WhatsApp yang terdaftar sebagai kata sandi verifikasi.')
                }
                className="text-xs text-primary hover:underline"
              >
                Lupa sandi?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Nomor WhatsApp terdaftar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={busy} className="icon-nudge w-full gap-2">
            {busy && <span className="spinner" />}
            <span>{busy ? 'Memproses…' : 'Masuk'}</span>
            {!busy && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <button
          onClick={() => navigateTo('page-08-join-select')}
          className="font-medium text-primary hover:underline"
        >
          Daftar ke ekosistem KIRI
        </button>
      </p>
    </div>
  );
};
