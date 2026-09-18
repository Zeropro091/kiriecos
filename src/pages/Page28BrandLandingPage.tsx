import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ExternalLink, 
  Code, 
  Globe, 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft,
  Copy,
  Layers,
  Send,
  Zap,
  ShieldCheck,
  Share2
} from 'lucide-react';

export const Page28BrandLandingPage: React.FC = () => {
  const { entities, selectedEntityId, navigateTo, setIsCollabModalOpen, showToast } = useApp();
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // Find active entity or fallback to first business/creator
  const entity = entities.find(e => e.id === selectedEntityId) || entities[0];

  const handleCopyUrl = () => {
    const fullUrl = `https://kiriproject.id/${entity.handle.replace('@', '')}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`URL ${fullUrl} disalin ke clipboard!`, 'success');
  };

  const handleRequestDomain = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Permintaan custom domain untuk ${entity.name} telah dikirim ke Admin KIRI!`, 'success');
    setIsAdminContactOpen(false);
    setCustomDomainInput('');
  };

  // If custom developer HTML/CSS/JS is provided and active, render inside a secure sandboxed iframe
  const renderCustomDeveloperSandbox = () => {
    if (!entity.customLandingPageActive || !entity.customHtml) return null;

    const sandboxedDocument = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            ${entity.customCss || ''}
          </style>
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen">
          ${entity.customHtml}
          <script>
            try {
              ${entity.customJs || ''}
            } catch (err) {
              console.error('Custom Sandbox JS Error:', err);
            }
          </script>
        </body>
      </html>
    `;

    return (
      <div className="w-full min-h-screen bg-slate-950 relative">
        {/* Top Banner indicating custom developer page */}
        <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('page-02-directory')}
              className="flex items-center gap-1 text-slate-400 hover:text-white font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Code className="w-3.5 h-3.5" />
              <span>kiriproject.id/{entity.handle.replace('@', '')} (Custom Developer View)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Salin Link</span>
            </button>
            <button
              onClick={() => setIsAdminContactOpen(true)}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              <span>Custom Domain</span>
            </button>
          </div>
        </div>

        {/* Sandboxed Iframe */}
        <iframe
          title={`Custom Landing Page - ${entity.name}`}
          srcDoc={sandboxedDocument}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full h-[calc(100vh-42px)] border-none"
        />
      </div>
    );
  };

  if (entity.customLandingPageActive && entity.customHtml) {
    return (
      <>
        {renderCustomDeveloperSandbox()}
        {/* Contact Admin Modal */}
        {isAdminContactOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Hubungi Admin KIRI untuk Custom Domain</span>
                </div>
                <button
                  onClick={() => setIsAdminContactOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestDomain} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Domain yang Diinginkan (misal: brandkamu.com / portal.brand.id)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="nama-brand.com"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Pesan Tambahan ke Tim Dev KIRI
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Saya ingin menghubungkan domain pribadi dan integrasi custom tracking..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Permintaan ke Admin KIRI</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default Standard High-Impact Dedicated Brand Showcase Page
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Brand Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigateTo('page-02-directory')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Direktori</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            kiriproject.id/{entity.handle.replace('@', '')}
          </span>
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
            title="Salin Link Halaman"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Salin URL</span>
          </button>
          <button
            onClick={() => setIsAdminContactOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Custom Domain Hubungi Admin</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={entity.coverImage}
          alt={entity.name}
          className="w-full h-full object-cover opacity-60 filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Profile Info Overlay */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-end gap-5">
            <img
              src={entity.avatar}
              alt={entity.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-slate-950 shadow-2xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {entity.name}
                </h1>
                {entity.verified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <p className="text-amber-400 font-mono text-sm">{entity.handle}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {entity.category}
                </span>
                <span>•</span>
                <span>{entity.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollabModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Kolaborasi</span>
            </button>
          </div>
        </div>

        {/* Bio & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tentang {entity.name}</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {entity.bio}
              </p>
            </div>

            {/* Portfolio Highlights */}
            {entity.portfolio && entity.portfolio.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Karya & Portofolio Unggulan</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {entity.portfolio.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4 space-y-1">
                        <h4 className="text-sm font-bold text-white">{p.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Stats & Services */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Statistik & Impact
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {entity.stats.map((s, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{s.label}</p>
                    <p className="text-base font-extrabold text-white mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Services / Rate Card */}
            {entity.services && entity.services.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Paket Kolaborasi</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <div className="space-y-3">
                  {entity.services.map((srv) => (
                    <div key={srv.id} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{srv.name}</p>
                        <p className="text-xs font-bold text-emerald-400">{srv.price}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">{srv.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Admin Modal */}
      {isAdminContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Globe className="w-4 h-4" />
                <span>Custom Domain & Brand White-Label</span>
              </div>
              <button
                onClick={() => setIsAdminContactOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tim KIRI Project menyediakan layanan setup domain pribadi (misal: <code className="text-amber-300">brandanda.com</code>) terhubung langsung ke profil ekosistem dan custom landing page Anda.
            </p>

            <form onSubmit={handleRequestDomain} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Domain Pribadi yang Diajukan
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: warung-kopi.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Kontak WhatsApp / Catatan
                </label>
                <textarea
                  rows={2}
                  placeholder="08123456789 - Tolong bantu mapping DNS..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Ajukan ke Tim Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
