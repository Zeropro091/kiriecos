import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { localAuth } from '../lib/localAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Phone,
  AtSign,
  Lock
} from 'lucide-react';

export const Page15Login: React.FC = () => {
  const { loginAs, navigateTo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const term = identifier.trim();
    if (!term) {
      setError('Masukkan Username, Email, atau ID Akun Anda.');
      return;
    }

    const { session, error: authError } = await localAuth.verify(term, password);
    if (session) {
      loginAs(session);
      return;
    }
    setError(authError ?? 'Login gagal.');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="border-olive-500/40 text-olive-700 dark:text-olive-300 gap-1.5 py-1 px-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KIRI Project Authentication</span>
        </Badge>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Masuk ke Akun
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Masuk ke dashboard personal Anda menggunakan Username, Email, atau Nomor WhatsApp terdaftar.
        </p>
      </div>

      {/* Clean Production-Ready Login Card */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">Kredensial Akun</CardTitle>
          <CardDescription className="text-xs">
            Masukkan kredensial Anda untuk melanjutkan ke dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Username / Email / ID Akun</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username Instagram/TikTok, Email, atau ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400" />
                  <span>Kata Sandi</span>
                </label>
                <a
                  href="#bantuan"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Bantuan: Gunakan nomor WhatsApp yang terdaftar pada akun Anda sebagai kata sandi verifikasi.');
                  }}
                  className="text-[11px] text-olive-700 dark:text-olive-400 hover:underline"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Nomor WhatsApp terdaftar"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 font-bold text-xs py-2.5 shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Link */}
      <div className="text-center text-xs text-muted-foreground">
        Belum memiliki akun terdaftar?{' '}
        <button
          onClick={() => navigateTo('page-08-join-select')}
          className="font-bold text-olive-700 dark:text-olive-400 hover:underline"
        >
          Daftar ke Ekosistem KIRI
        </button>
      </div>
    </div>
  );
};
