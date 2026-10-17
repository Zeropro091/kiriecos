import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { IdCard, ShieldCheck, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Page30 — Digital Member Card.
 * Fetches GET /api/me/card -> { card_number, tier, issued_at, expires_at, status }
 * and renders a digital membership card with KIRI PROJECT branding.
 */

interface MemberCard {
  card_number: string;
  tier: string;
  issued_at: string;
  expires_at: string;
  status: string;
}

const formatCardNumber = (raw: string): string => {
  // Guarantees display in the KIRI-XXXXXXXX style even if backend returns bare digits.
  if (!raw) return 'KIRI-00000000';
  if (raw.toUpperCase().startsWith('KIRI-')) return raw.toUpperCase();
  const digits = raw.replace(/\D/g, '').padStart(8, '0').slice(-8);
  return `KIRI-${digits}`;
};

const formatDate = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const Page30MemberCard: React.FC = () => {
  const { currentUser } = useApp();
  const [card, setCard] = useState<MemberCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const cardData = await api.get<MemberCard>('/me/card');
      setCard(cardData ?? null);
    } catch {
      setError('Kartu member belum tersedia. Hubungi admin KIRI jika Anda sudah membayar keanggotaan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, []);

  const statusColor =
    card?.status === 'active'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : card?.status === 'pending_review'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        : 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  return (
    <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Kartu Member{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              Digital
            </span>
          </h1>
          <p className="text-gray-300/90 text-sm font-light">
            Identitas digital resmi Anda sebagai anggota ekosistem KIRI Project.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-kiri-gold-400" />
            <span className="text-xs">Memuat kartu member…</span>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-md mx-auto rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs text-amber-200 leading-relaxed">{error}</p>
            <button
              onClick={loadCard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {!loading && !error && card && (
          <div className="space-y-6">
            {/* The Card */}
            <div className="mx-auto w-full max-w-xl">
              <div className="relative rounded-[1.75rem] p-[1.5px] bg-gradient-to-br from-kiri-gold-300 via-kiri-gold-500 to-emerald-700 shadow-[0_20px_60px_rgba(216,174,90,0.25)]">
                <div className="relative rounded-[calc(1.75rem-1.5px)] bg-gradient-to-br from-[#00331f] via-[#001f14] to-[#012b1c] p-7 sm:p-9 overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#D8AE5A_1.5px,transparent_1.5px)] [background-size:22px_22px] pointer-events-none" />
                  <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-kiri-gold-500/20 blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    {/* Brand row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-kiri-gold-300 to-kiri-gold-500 flex items-center justify-center shadow-lg">
                          <span className="font-serif text-lg font-extrabold text-kiri-dark-950">K</span>
                        </div>
                        <div>
                          <p className="font-serif text-lg font-bold tracking-wide text-white">KIRI PROJECT</p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-kiri-gold-300/80">
                            Digital Membership
                          </p>
                        </div>
                      </div>
                      <IdCard className="w-8 h-8 text-kiri-gold-300/70" />
                    </div>

                    {/* Member name */}
                    <div className="mt-10">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
                        Nama Member
                      </p>
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1 truncate">
                        {currentUser?.name || 'Member KIRI'}
                      </p>
                    </div>

                    {/* Card number + tier */}
                    <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
                          Nomor Kartu
                        </p>
                        <p className="font-mono text-xl sm:text-2xl font-bold text-kiri-gold-300 tracking-[0.12em] mt-1">
                          {formatCardNumber(card.card_number)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Tier</p>
                        <p className="inline-block mt-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-kiri-gold-400 to-kiri-gold-500 text-kiri-dark-950 text-xs font-extrabold uppercase tracking-wider shadow-md">
                          {card.tier || 'Member'}
                        </p>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Terbit</p>
                          <p className="text-xs font-semibold text-gray-200 mt-0.5">{formatDate(card.issued_at)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Berlaku Sampai</p>
                          <p className="text-xs font-semibold text-gray-200 mt-0.5">{formatDate(card.expires_at)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                        {card.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust note */}
            <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-kiri-gold-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Tunjukkan kartu ini saat mengikuti event, program, atau klaim special member rate.
                Status keanggotaan dikelola langsung oleh tim admin KIRI Project.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
