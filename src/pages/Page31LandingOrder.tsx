import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { CheckCircle2, Loader2, Send, Sparkles, LayoutTemplate, Columns2, PanelsTopLeft } from 'lucide-react';

/**
 * Page31 — Landing Page template ordering.
 * Shows 3 minimalist template previews (pure CSS/JSX mockups):
 *   minimal-01 typographic, minimal-02 grid gallery, minimal-03 split hero.
 * "Pesan Template Ini" POSTs to /api/landing-orders; custom notes included.
 */

interface LandingOrder {
  id: number | string;
  template_id: string;
  status?: string;
  created_at?: string;
}

type OrderState = 'idle' | 'submitting' | 'done';

const TEMPLATES: { id: 'minimal-01' | 'minimal-02' | 'minimal-03'; name: string; desc: string }[] = [
  { id: 'minimal-01', name: 'Minimal 01 — Typographic', desc: 'Fokus pada tipografi besar & pesan utama bisnis Anda.' },
  { id: 'minimal-02', name: 'Minimal 02 — Grid Gallery', desc: 'Galeri produk/layanan dalam grid rapi yang bersih.' },
  { id: 'minimal-03', name: 'Minimal 03 — Split Hero', desc: 'Hero terbagi dua: perkenalan bisnis & visual unggulan.' },
];

/* ---------- Pure CSS/JSX template mockups (no images) ---------- */

const MockupMinimal01: React.FC = () => (
  <div className="h-44 w-full bg-white rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 p-4">
    <div className="h-2 w-16 rounded-full bg-gray-200" />
    <div className="h-5 w-4/5 rounded-md bg-gray-900" />
    <div className="h-5 w-3/5 rounded-md bg-gray-900" />
    <div className="h-1.5 w-1/2 rounded-full bg-gray-300 mt-1" />
    <div className="h-6 w-24 rounded-full bg-kiri-gold-500/80 mt-3" />
  </div>
);

const MockupMinimal02: React.FC = () => (
  <div className="h-44 w-full bg-white rounded-xl overflow-hidden p-3 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="h-2.5 w-14 rounded-full bg-gray-900" />
      <div className="h-1.5 w-10 rounded-full bg-gray-300" />
    </div>
    <div className="grid grid-cols-3 gap-2 flex-1">
      {['bg-amber-100', 'bg-emerald-100', 'bg-gray-200', 'bg-stone-200', 'bg-kiri-gold-500/20', 'bg-teal-100'].map((c, i) => (
        <div key={i} className={`rounded-md ${c}`} />
      ))}
    </div>
  </div>
);

const MockupMinimal03: React.FC = () => (
  <div className="h-44 w-full bg-white rounded-xl overflow-hidden flex">
    <div className="w-1/2 p-4 flex flex-col justify-center gap-2">
      <div className="h-4 w-4/5 rounded-md bg-gray-900" />
      <div className="h-1.5 w-full rounded-full bg-gray-300" />
      <div className="h-1.5 w-2/3 rounded-full bg-gray-300" />
      <div className="h-6 w-20 rounded-full bg-gray-900 mt-2" />
    </div>
    <div className="w-1/2 p-2">
      <div className="h-full rounded-lg bg-gradient-to-br from-emerald-100 via-amber-50 to-stone-200" />
    </div>
  </div>
);

const MOCKUPS: Record<string, React.FC> = {
  'minimal-01': MockupMinimal01,
  'minimal-02': MockupMinimal02,
  'minimal-03': MockupMinimal03,
};

const MOCKUP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'minimal-01': PanelsTopLeft,
  'minimal-02': LayoutTemplate,
  'minimal-03': Columns2,
};

export const Page31LandingOrder: React.FC = () => {
  const { showToast, currentUser } = useApp();
  const [myOrders, setMyOrders] = useState<LandingOrder[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [orderedTemplate, setOrderedTemplate] = useState<string | null>(null);
  const [state, setState] = useState<OrderState>('idle');

  useEffect(() => {
    api
      .get<LandingOrder[]>('/landing-orders/mine')
      .then((orders) => setMyOrders(Array.isArray(orders) ? orders : []))
      .catch(() => setMyOrders([]));
  }, []);

  const order = async (templateId: string) => {
    if (state === 'submitting') return;
    setState('submitting');
    try {
      await api.post('/landing-orders', {
        template_id: templateId,
        custom_notes: customNotes.trim() || undefined,
      });
      setOrderedTemplate(templateId);
      setState('done');
      showToast('Pesanan landing page terkirim! Admin akan menghubungi Anda.', 'success');
    } catch {
      setState('idle');
      showToast('Gagal mengirim pesanan. Coba lagi sebentar.', 'error');
    }
  };

  /* -------- Confirmation state -------- */
  if (state === 'done' && orderedTemplate) {
    const chosen = TEMPLATES.find((t) => t.id === orderedTemplate);
    return (
      <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="rounded-[2rem] p-1.5 bg-white/10 border border-white/15">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">Pesanan Diterima</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Terima kasih{currentUser?.name ? `, ${currentUser.name}` : ''}! Permintaan landing page
                Anda (template <span className="font-semibold text-kiri-gold-300">{chosen?.name}</span>)
                sudah kami terima. <span className="text-white font-semibold">Admin KIRI Project akan
                menghubungi Anda</span> untuk proses selanjutnya.
              </p>
              <button
                onClick={() => {
                  setState('idle');
                  setOrderedTemplate(null);
                  setCustomNotes('');
                }}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pesan Template Lain</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001710] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Landing Page{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              Templates
            </span>
          </h1>
          <p className="text-gray-300/90 text-sm sm:text-base font-light leading-relaxed">
            Pilih salah satu template minimalis untuk landing page bisnis Anda. Tim KIRI yang memasang
            dan menyesuaikan konten.
          </p>
        </div>

        {/* Template previews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TEMPLATES.map((tpl) => {
            const Mock = MOCKUPS[tpl.id];
            const Icon = MOCKUP_ICONS[tpl.id];
            const alreadyOrdered = myOrders.some((o) => o.template_id === tpl.id);
            return (
              <div
                key={tpl.id}
                className="rounded-[2rem] p-1.5 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 transition-all duration-300 flex flex-col"
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#001c13] p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-kiri-gold-300">
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{tpl.id}</span>
                    </div>
                    {alreadyOrdered && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        Dipesan
                      </span>
                    )}
                  </div>

                  <Mock />

                  <h3 className="font-serif text-lg font-bold text-white mt-5">{tpl.name}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed flex-1">{tpl.desc}</p>

                  <button
                    type="button"
                    disabled={state === 'submitting'}
                    onClick={() => order(tpl.id)}
                    className="w-full mt-6 py-3 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 disabled:opacity-50 text-kiri-dark-950 text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(216,174,90,0.3)]"
                  >
                    {state === 'submitting' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Pesan Template Ini</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom request */}
        <div className="max-w-2xl mx-auto rounded-[2rem] p-1.5 bg-white/10 border border-white/15">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Catatan Khusus (Opsional)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ceritakan kebutuhan bisnis Anda — nama brand, produk/layanan, kontak, atau warna
              favorit — agar tim KIRI bisa menyesuaikan template dengan cepat.
            </p>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={4}
              placeholder="Contoh: nama brand, produk yang mau ditonjolkan, nomor WhatsApp…"
              className="w-full bg-[#001710] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-kiri-gold-500 transition-colors resize-none"
            />
            {myOrders.length > 0 && (
              <div className="text-[11px] text-gray-400 border-t border-white/10 pt-4">
                Riwayat pesanan Anda: {myOrders.length} template
                {myOrders.length === 1 ? '' : 's'} (status ditangani admin).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
