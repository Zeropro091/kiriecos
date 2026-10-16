import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  Search,
  Users,
  Building2,
  Radio,
  Film,
  Handshake,
  ShieldCheck,
  FileCheck2,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Reveal, RevealGroup } from '../components/Reveal';

const PILLARS = [
  {
    n: '01',
    title: 'Kolektif Kreator',
    desc: 'Videografer, fotografer, desainer, dan kreator konten dalam satu direktori terkurasi.',
    icon: Film,
    page: 'page-04-creator-profile' as const,
    id: 'creator-1',
  },
  {
    n: '02',
    title: 'Komunitas Kreatif',
    desc: 'Kolektif seni, perajin, dan asosiasi budaya dengan database anggota terkontrol.',
    icon: Users,
    page: 'page-03-community-profile' as const,
    id: 'comm-1',
  },
  {
    n: '03',
    title: 'Bisnis & UMKM',
    desc: 'Brand lokal, kafe, dan usaha produk kreatif yang mencari kolaborasi bermakna.',
    icon: Building2,
    page: 'page-05-business-profile' as const,
    id: 'biz-1',
  },
  {
    n: '04',
    title: 'Media Partner',
    desc: 'Portal berita, majalah, dan kanal publikasi untuk jangkauan lebih luas.',
    icon: Radio,
    page: 'page-06-media-profile' as const,
    id: 'media-1',
  },
  {
    n: '05',
    title: 'Mitra Strategis',
    desc: 'Perusahaan teknologi dan inkubator yang mendukung pertumbuhan ekosistem.',
    icon: Handshake,
    page: 'page-07-partner-profile' as const,
    id: 'strat-1',
  },
];

const STEPS = [
  {
    icon: Search,
    title: 'Temukan',
    desc: 'Jelajahi direktori talenta dan entitas terverifikasi sesuai kebutuhan proyekmu.',
  },
  {
    icon: FileCheck2,
    title: 'Ajukan Brief',
    desc: 'Kirim brief terstruktur: deliverable, anggaran, dan tenggat dalam satu formulir.',
  },
  {
    icon: ShieldCheck,
    title: 'Kurasi & Sepakati',
    desc: 'Tim KIRI mencocokkan ekspektasi kedua pihak sebelum kontrak dikunci.',
  },
  {
    icon: Wallet,
    title: 'Produksi & Cairkan',
    desc: 'Karya dikerjakan dengan perlindungan pembayaran, dana cair setelah disetujui.',
  },
];

export const Page01Home: React.FC = () => {
  const { navigateTo, entities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const featured = entities.filter((e) => e.type === 'creator').slice(0, 3);
  const totalEntities = entities.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('page-02-directory');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <RevealGroup className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-primary mb-5">
              Bali Creative Talent &amp; Enterprise Hub
            </p>
            <h1 className="font-serif text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-[3.4rem] text-foreground text-balance">
              Platform kolaborasi untuk kreator, komunitas &amp; bisnis lokal.
            </h1>
            <p className="mt-6 text-base lg:text-[1.05rem] text-muted-foreground leading-relaxed max-w-xl text-pretty">
              Satu ruang terkurasi untuk menemukan talenta, menyusun brief, dan menuntaskan
              proyek — transparan, terlindungi, dan terdokumentasi.
            </p>

            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-md">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 focus-within:border-primary/50 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                <input
                  type="text"
                  placeholder="Cari videografer, kuliner, UMKM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Cari
                </Button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigateTo('page-02-directory')} className="gap-2">
                <span>Jelajahi Direktori</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigateTo('page-08-join-select')}>
                Bergabung
              </Button>
            </div>

            <dl className="mt-12 pt-8 border-t border-border grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="text-xs text-muted-foreground">Entitas terdaftar</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">{totalEntities || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pilar ekosistem</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">5</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Biaya bergabung</dt>
                <dd className="mt-1 font-serif text-2xl text-foreground">Gratis</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary">
              <img
                src="/assets/references/image1.png"
                alt="Kreator KIRI Project"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </RevealGroup>
      </section>

      {/* ── Pillars ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8 py-20 lg:py-24">
          <Reveal className="max-w-2xl mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl text-foreground text-balance">
              Lima pilar ekosistem KIRI
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Setiap peran punya tempatnya. Bersama-sama mereka membentuk rantai kolaborasi
              yang utuh.
            </p>
          </Reveal>

          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.n}
                  onClick={() => navigateTo(p.page, p.id)}
                  className={`lift group text-left rounded-xl border border-border bg-background p-6 hover:border-primary/40 ${
                    i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-primary">
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{p.n}</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Lihat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 lg:px-8 py-20 lg:py-24">
        <Reveal className="max-w-2xl mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl text-foreground text-balance">
            Bagaimana kolaborasi bekerja
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Empat langkah, dari menemukan talenta sampai karya selesai.
          </p>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-primary">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-medium text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </RevealGroup>
      </section>

      {/* ── Featured creators ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8 py-20 lg:py-24">
            <Reveal className="flex items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl text-foreground">
                  Talenta pilihan
                </h2>
                <p className="mt-3 text-muted-foreground">Sebagian kreator terkurasi di ekosistem.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateTo('page-02-directory')} className="shrink-0">
                Lihat semua
              </Button>
            </Reveal>

            <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigateTo('page-04-creator-profile', c.id)}
                  className="lift group text-left rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40"
                >
                  <div className="aspect-[16/10] bg-secondary overflow-hidden">
                    <img
                      src={c.coverImage || c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-foreground text-xs font-semibold shrink-0">
                        {getInitials(c.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.category} · {c.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 lg:px-8 py-20 lg:py-24">
        <div className="rounded-2xl border border-border bg-primary text-primary-foreground px-8 py-14 lg:px-16 lg:py-16">
          <Reveal className="max-w-2xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-balance">
              Siap memulai kolaborasi pertamamu?
            </h2>
            <p className="mt-4 text-primary-foreground/80 leading-relaxed">
              Bergabung gratis, lengkapi profil, dan temukan proyek yang cocok dengan keahlianmu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigateTo('page-08-join-select')}
                className="bg-background text-foreground hover:bg-background/90 gap-2"
              >
                <span>Bergabung</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigateTo('page-27-request-flowchart')}
                className="text-primary-foreground hover:bg-white/10"
              >
                Lihat alur kerja sama
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
