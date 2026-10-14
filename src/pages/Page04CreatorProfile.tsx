import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  MapPin,
  Instagram,
  Youtube,
  Globe,
  Share2,
  Star,
  Eye,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

export const Page04CreatorProfile: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, openCollabModalFor } = useApp();

  const creator =
    entities.find((e) => e.id === selectedEntityId && e.type === 'creator') ||
    entities.find((e) => e.id === selectedEntityId) ||
    entities.find((e) => e.type === 'creator') ||
    entities[0];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to Directory Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('page-02-directory')}
          className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Direktori</span>
        </Button>
        <Badge variant="outline" className="text-xs border-olive-500/40 text-olive-700 dark:text-olive-300">
          ID: {creator.id}
        </Badge>
      </div>

      {/* Cover & Creator Header */}
      <Card className="overflow-hidden border-border shadow-md bg-card">
        <div className="h-64 sm:h-80 relative overflow-hidden bg-granite-900">
          <img
            src={creator.coverImage || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=80'}
            alt={creator.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/60 text-olive-300 backdrop-blur-md border border-olive-500/40 flex items-center gap-1.5 shadow-md">
            <Star className="w-3.5 h-3.5 text-olive-400 fill-olive-400" />
            <span>{creator.badge || 'KIRI Registered Creator'}</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-5">
            <div className="flex items-end gap-5">
              <Avatar className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-background ring-2 ring-olive-500/50 shadow-2xl">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback className="bg-granite-900 text-olive-300 text-xl font-bold">
                  {getInitials(creator.name)}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    {creator.name}
                  </h1>
                  {creator.verified && <CheckCircle2 className="w-5 h-5 text-olive-600 dark:text-olive-400" />}
                </div>
                <p className="text-sm font-semibold text-olive-700 dark:text-olive-400">
                  {creator.handle} • {creator.category}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-olive-600" />
                  <span>{creator.location || 'Indonesia'}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo('page-17-profile-editor')}
                className="text-xs font-semibold"
              >
                Edit Profil Saya
              </Button>
              <Button
                size="sm"
                onClick={() => openCollabModalFor(creator)}
                className="bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 text-xs font-bold shadow-sm gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ajak Kolaborasi (KIRI Escrow)</span>
              </Button>
            </div>
          </div>

          {/* Bio and Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-border">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-olive-700 dark:text-olive-400 mb-2">
                  Biografi & Pendekatan Kreatif
                </h3>
                <p className="text-sm sm:text-base text-foreground leading-relaxed font-normal">
                  {creator.bio}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {creator.tags.map((t, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-medium px-2.5 py-1 bg-muted text-foreground border border-border"
                  >
                    #{t}
                  </Badge>
                ))}
              </div>

              {/* Social Channels */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Kanal Media Sosial Terverifikasi
                </h4>
                <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
                  {creator.instagram && (
                    <a
                      href={`https://instagram.com/${creator.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-olive-500/60 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>@{creator.instagram.replace(/^@/, '')}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
                    </a>
                  )}
                  {creator.tiktok && (
                    <a
                      href={`https://tiktok.com/@${creator.tiktok.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-olive-500/60 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-500" />
                      <span>TikTok: @{creator.tiktok.replace(/^@/, '')}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
                    </a>
                  )}
                  {creator.youtube && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>{creator.youtube}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Looking For Collaborations */}
              {creator.lookingFor && (
                <div className="p-4 rounded-xl bg-olive-500/10 border border-olive-500/25">
                  <h4 className="text-xs font-bold text-olive-800 dark:text-olive-300 uppercase tracking-wider mb-2">
                    🎯 Terbuka Untuk Proyek & Kerja Sama:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {creator.lookingFor.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar Stats & Verification */}
            <div className="space-y-4">
              <Card className="p-5 border-border bg-card space-y-3.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Metrik Audiens Terverifikasi
                </h4>
                {creator.stats.map((st, i) => (
                  <div key={i} className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">{st.label}</span>
                    <span className="font-bold text-foreground">{st.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-muted-foreground">Domisili</span>
                  <span className="font-bold text-foreground">{creator.location}</span>
                </div>
              </Card>

              {/* Escrow Guarantee Box */}
              <div className="p-4 rounded-xl bg-olive-500/15 border border-olive-500/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-olive-800 dark:text-olive-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-olive-600 dark:text-olive-400" />
                  <span>Jaminan KIRI Escrow</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Semua transaksi proyek dengan kreator ini dilindungi oleh kontrak digital dan sistem pembayaran aman KIRI PROJECT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Services & Rate Cards */}
      {creator.services && creator.services.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Paket Layanan & Rate Card Resmi
            </h3>
            <p className="text-xs text-muted-foreground">
              Tarif terstandardisasi untuk kampanye brand & UMKM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creator.services.map((srv) => (
              <Card
                key={srv.id}
                className="p-6 border-border hover:border-olive-500/60 transition-all flex flex-col justify-between shadow-xs bg-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-serif text-lg font-bold text-foreground">
                      {srv.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs font-bold text-olive-700 dark:text-olive-300 bg-olive-500/15 border-olive-500/30 shrink-0">
                      {srv.price}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {srv.description}
                  </p>
                  <div className="space-y-1.5 border-t border-border pt-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Deliverables Termasuk:</p>
                    {srv.deliverables.map((d, i) => (
                      <div key={i} className="text-xs text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    onClick={() => openCollabModalFor(creator)}
                    className="w-full bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <span>Pilih Paket Ini (Request Through KIRI)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {creator.portfolio && creator.portfolio.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Portofolio & Karya Terpilih
            </h3>
            <p className="text-xs text-muted-foreground">
              Dokumentasi kampanye visual komersial yang telah selesai dikerjakan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creator.portfolio.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-border shadow-xs group bg-card"
              >
                <div className="aspect-video relative overflow-hidden bg-granite-900">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-white/90 text-granite-950 text-xs font-bold">
                      Lihat Detail Karya
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    {item.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-olive-600" />
                        {item.views} Views
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
