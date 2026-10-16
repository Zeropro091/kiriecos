import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  Eye,
  MessageSquare,
  FileCheck2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export const Page16DashboardUser: React.FC = () => {
  const { currentUser, collabRequests, navigateTo, openCollabModalFor, entities } = useApp();

  const userCollabs = collabRequests.filter(
    (req) => req.targetId === currentUser?.entityId || req.requesterId === currentUser?.entityId
  );

  const creatorEntity = entities.find((e) => e.id === currentUser?.entityId) || entities[0];

  const profileChecks = creatorEntity
    ? [
        Boolean(creatorEntity.bio && creatorEntity.bio.length > 40),
        Boolean(creatorEntity.avatar),
        Boolean(creatorEntity.coverImage),
        (creatorEntity.tags?.length ?? 0) > 0,
        (creatorEntity.services?.length ?? 0) > 0,
        (creatorEntity.portfolio?.length ?? 0) > 0,
        Boolean(creatorEntity.location),
        Boolean(creatorEntity.website || creatorEntity.instagram),
      ]
    : [];
  const profileStrength = profileChecks.length
    ? Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100)
    : 0;

  const incomingRequests = userCollabs.filter((c) => c.status === 'submitted' || c.status === 'in_review').length;
  const activeProjects = userCollabs.filter((c) => c.status === 'connected' || c.status === 'in_progress').length;
  const completedProjects = userCollabs.filter((c) => c.status === 'completed').length;

  const parseRupiah = (value: string) => {
    const digits = (value || '').replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
  };
  const escrowValue = userCollabs
    .filter((c) => c.status === 'connected' || c.status === 'in_progress')
    .reduce((sum, c) => sum + parseRupiah(c.budget), 0);
  const escrowLabel = escrowValue > 0 ? `Rp ${escrowValue.toLocaleString('id-ID')}` : '—';

  const getInitials = (name?: string) => {
    if (!name) return 'KP';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary with Matte Granite */}
      <section className="relative overflow-hidden rounded-3xl bg-granite-900 text-white p-8 sm:p-10 border border-granite-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-olive-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <Avatar className="w-20 h-20 rounded-2xl border-2 border-olive-400 ring-2 ring-olive-500/30 shadow-md shrink-0">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback className="bg-granite-950 text-olive-300 font-bold text-xl">
              {getInitials(currentUser?.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {currentUser?.name || 'Raka Dewantara'}
              </h1>
              <Badge variant="outline" className="bg-olive-500/20 text-olive-300 border-olive-500/40 text-[10px] font-bold">
                {currentUser?.membershipTier || 'Creator Pro'}
              </Badge>
            </div>
            <p className="text-xs text-granite-300 mt-1">
              Akun Privat Terverifikasi KIRI PROJECT • Role: <span className="font-semibold text-white uppercase">{currentUser?.role}</span>
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-olive-300 font-medium">
              <span>Kekuatan Profil: <strong className="text-white">{profileStrength}%</strong></span>
              <span>•</span>
              <button
                onClick={() => navigateTo('page-04-creator-profile', creatorEntity.id)}
                className="underline hover:text-white flex items-center gap-1 font-bold text-white transition-colors"
              >
                Lihat Tampilan Publik <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('page-17-profile-editor')}
            className="border-granite-700 bg-granite-800/80 hover:bg-granite-700 text-white text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            <span>Edit Profil & Portofolio</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigateTo('page-02-directory')}
            className="bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eksplor Kolaborasi</span>
          </Button>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase">Permintaan Masuk</span>
            <MessageSquare className="w-4 h-4 text-olive-600 dark:text-olive-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{incomingRequests}</p>
          <span className="text-[11px] text-muted-foreground font-medium">Menunggu kurasi</span>
        </Card>

        <Card className="p-6 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase">Proyek Aktif</span>
            <FileCheck2 className="w-4 h-4 text-olive-600 dark:text-olive-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{activeProjects}</p>
          <span className="text-[11px] text-muted-foreground font-medium">Dalam escrow KIRI</span>
        </Card>

        <Card className="p-6 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-olive-600 dark:text-olive-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{completedProjects}</p>
          <span className="text-[11px] text-muted-foreground font-medium">Total {userCollabs.length} kolaborasi</span>
        </Card>

        <Card className="p-6 border-border shadow-xs bg-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase">Nilai Escrow</span>
            <DollarSign className="w-4 h-4 text-olive-600 dark:text-olive-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{escrowLabel}</p>
          <span className="text-[11px] text-muted-foreground font-medium">Dana proyek berjalan</span>
        </Card>
      </div>

      {/* Main Collaborations Management Card */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Kolaborasi & Proyek Terkini
            </CardTitle>
            <CardDescription className="text-xs">
              Status mediasi, alur escrow, dan pengiriman karya
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('page-23-my-collaborations')}
            className="text-xs font-semibold gap-1.5"
          >
            <span>Buka Hub Kolaborasi Penuh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {userCollabs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
              <FolderGit2 className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-foreground">Belum ada proyek kolaborasi aktif.</p>
              <p>Mulai tawarkan keahlianmu atau ajak kolaborasi brand di katalog direktori.</p>
            </div>
          ) : (
            userCollabs.map((collab) => (
              <div
                key={collab.id}
                className="p-4 rounded-xl border border-border hover:border-olive-500/50 bg-background transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                      {collab.trackingCode}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-olive-700 dark:text-olive-400 border-olive-500/40">
                      {collab.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    {collab.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Klien / Mitra: <strong className="text-foreground">{collab.requesterName}</strong> • Anggaran: <strong className="text-foreground">{collab.budget}</strong>
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigateTo('page-23-my-collaborations')}
                  className="bg-granite-900 hover:bg-granite-800 text-white dark:bg-olive-500 dark:text-granite-950 font-semibold text-xs shrink-0"
                >
                  <span>Detail & Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
