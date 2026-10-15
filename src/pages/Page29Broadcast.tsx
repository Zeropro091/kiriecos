import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { canBroadcast } from '../lib/access';
import { INDONESIA_REGIONS } from '../data/broadcastData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Radio,
  Send,
  Globe2,
  MapPin,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  SlidersHorizontal,
  Flame,
  CheckCheck,
  Search,
  Users,
  ShieldAlert,
  Lock,
  AlertCircle
} from 'lucide-react';

export const Page29Broadcast: React.FC = () => {
  const { broadcastMessages, sendBroadcastMessage, likeBroadcastMessage, currentUser, navigateTo } = useApp();

  const [activeScope, setActiveScope] = useState<'indonesia' | 'regional'>('indonesia');
  const [selectedRegion, setSelectedRegion] = useState<string>('Jawa Barat');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const canBroadcastNow = canBroadcast(currentUser);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [broadcastMessages, activeScope, selectedRegion]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !canBroadcastNow) return;

    sendBroadcastMessage({
      scope: activeScope,
      region: activeScope === 'regional' ? selectedRegion : undefined,
      content: inputText
    });

    setInputText('');
  };

  // Filter messages based on scope & region & search query
  const displayedMessages = broadcastMessages.filter((msg) => {
    if (activeScope === 'indonesia' && msg.scope !== 'indonesia') return false;
    if (activeScope === 'regional') {
      if (msg.scope !== 'regional') return false;
      if (selectedRegion !== 'Semua Daerah' && msg.region !== selectedRegion) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = msg.content.toLowerCase().includes(q);
      const matchSender = msg.senderName.toLowerCase().includes(q);
      const matchRegion = (msg.region || '').toLowerCase().includes(q);
      if (!matchContent && !matchSender && !matchRegion) return false;
    }
    return true;
  });

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Banner with Matte Granite and Olive Accent */}
      <section className="relative overflow-hidden rounded-3xl bg-granite-900 text-white p-6 sm:p-8 border border-granite-800 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-olive-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-500/15 text-olive-300 border border-olive-500/30 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-olive-400 animate-pulse" />
              <span>KIRI BROADCAST NETWORK — LIVE FEED</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Siaran & Peluang Kolaborasi Real-Time
            </h1>
            <p className="text-xs sm:text-sm text-granite-200 max-w-xl">
              Pusat siaran langsung se-Indonesia dan per-daerah. Semua pengumuman tersimpan bertingkat seperti feed komunitas WhatsApp, tidak akan hilang saat reload.
            </p>
          </div>

          {/* Quick Scope Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-granite-950 border border-granite-800 shrink-0">
            <button
              onClick={() => setActiveScope('indonesia')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeScope === 'indonesia'
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'text-granite-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Indonesia Siaran</span>
            </button>
            <button
              onClick={() => setActiveScope('regional')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeScope === 'regional'
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'text-granite-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Per-Daerah Siaran</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Channel Controls & Region Filter */}
      <Card className="p-4 border-border shadow-xs bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeScope === 'regional' ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
                  <MapPin className="w-4 h-4 text-olive-600 dark:text-olive-400" />
                  <span>Pilih Daerah:</span>
                </span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full sm:w-auto text-xs rounded-xl bg-background border border-border text-foreground px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-olive-500"
                >
                  {INDONESIA_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-olive-700 dark:text-olive-300">
                <Globe2 className="w-4 h-4" />
                <span>Saluran Publik Terbuka: Seluruh Kreator & Brand Nusantara</span>
              </div>
            )}
          </div>

          {/* Search in Broadcast */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari pesan atau kreator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 font-medium"
            />
          </div>
        </div>
      </Card>

      {/* 3. Broadcast Chat Timeline (WhatsApp Group style feed) */}
      <Card className="border-border shadow-md bg-card overflow-hidden flex flex-col h-[560px]">
        {/* Chat Feed Header */}
        <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-olive-500/20 text-olive-700 dark:text-olive-300 border border-olive-500/40 flex items-center justify-center font-bold">
              {activeScope === 'indonesia' ? <Globe2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {activeScope === 'indonesia' ? 'KIRI Broadcast Nasional' : `Kanal Daerah: ${selectedRegion}`}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {displayedMessages.length} siaran tersimpan • Riwayat permanen tersinkron
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] uppercase font-bold border-olive-500/40 text-olive-700 dark:text-olive-300">
            Aktif
          </Badge>
        </div>

        {/* Scrollable Message List */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-muted/20"
        >
          {displayedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
              <Radio className="w-10 h-10 text-muted-foreground/30 animate-pulse" />
              <p className="text-sm font-bold text-foreground">Belum ada siaran di kanal ini.</p>
              <p className="text-xs max-w-sm">
                Jadilah yang pertama mengirimkan pengumuman peluang proyek, ajakan kolaborasi, atau info meetup!
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isMe = currentUser?.id === msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} group animate-in fade-in duration-200`}
                >
                  {/* Sender Avatar */}
                  <Avatar className="w-9 h-9 border border-border ring-1 ring-olive-500/30 shrink-0">
                    <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                    <AvatarFallback className="bg-granite-900 text-olive-300 text-xs font-bold">
                      {getInitials(msg.senderName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble (WhatsApp style) */}
                  <div
                    className={`max-w-[85%] sm:max-w-lg rounded-2xl p-4 shadow-xs border transition-all ${
                      isMe
                        ? 'bg-olive-700 text-white border-olive-600 rounded-tr-xs'
                        : 'bg-card text-foreground border-border rounded-tl-xs hover:border-olive-500/50'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10 dark:border-border">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-foreground'}`}>
                          {msg.senderName}
                        </span>
                        {msg.senderBadge && (
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1.5 py-0 shrink-0 font-bold ${
                              isMe ? 'bg-white/20 text-white' : 'bg-muted text-olive-700 dark:text-olive-300'
                            }`}
                          >
                            {msg.senderBadge}
                          </Badge>
                        )}
                      </div>

                      {msg.region && (
                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${isMe ? 'text-olive-200' : 'text-olive-600'}`}>
                          <MapPin className="w-2.5 h-2.5" />
                          {msg.region}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isMe ? 'text-white' : 'text-foreground'}`}>
                      {msg.content}
                    </p>

                    {/* Footer Info & Likes */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-1 text-[10px]">
                      <button
                        onClick={() => likeBroadcastMessage(msg.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
                          isMe
                            ? 'bg-white/15 hover:bg-white/25 text-white'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                        <span className="font-bold">{msg.likesCount || 0}</span>
                      </button>

                      <div className={`flex items-center gap-1.5 ${isMe ? 'text-olive-200' : 'text-muted-foreground'}`}>
                        <span>{msg.timeFormatted}</span>
                        <CheckCheck className={`w-3.5 h-3.5 ${isMe ? 'text-olive-200' : 'text-olive-500'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar or Restricted Notice */}
            {canBroadcastNow ? (
          <div className="p-3 sm:p-4 border-t border-border bg-card">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={
                    activeScope === 'indonesia'
                      ? 'Ketik siaran resmi ke seluruh Indonesia...'
                      : `Ketik siaran resmi untuk wilayah ${selectedRegion}...`
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="text-xs py-2.5 pl-3.5 pr-10 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 font-bold text-xs px-4 rounded-xl shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <span>Siarkan</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 px-1">
              <span className="flex items-center gap-1.5">
                <Badge variant="outline" className="border-olive-500/40 text-[9px] px-1.5 py-0 text-olive-700 dark:text-olive-300 font-bold">
                  Otoritas Siaran Aktif
                </Badge>
                <span>Mengirim sebagai: <strong className="text-foreground">{currentUser?.name}</strong></span>
              </span>
              <span className="text-olive-700 dark:text-olive-400 font-medium">
                Jangkauan: {activeScope === 'indonesia' ? 'Nasional (Seluruh Indonesia)' : `Daerah ${selectedRegion}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-olive-600 dark:text-olive-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Kanal Siaran Terverifikasi (Admin & Otoritas Khusus)</p>
                <p className="text-[11px]">Hanya Administrator KIRI dan Community Lead terverifikasi yang memiliki izin mempublikasikan siaran ke publik.</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('page-24-login-admin')}
              className="text-xs font-semibold shrink-0 gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-olive-600" />
              <span>Login Akses Otoritas</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
