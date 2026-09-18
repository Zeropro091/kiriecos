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
  const [activeSandboxTab, setActiveSandboxTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');

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
        <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
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
            {/* Sandbox Tabs */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveSandboxTab('preview')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeSandboxTab === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveSandboxTab('html')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeSandboxTab === 'html' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveSandboxTab('css')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeSandboxTab === 'css' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                CSS
              </button>
              <button
                onClick={() => setActiveSandboxTab('js')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeSandboxTab === 'js' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
              >
                JS
              </button>
            </div>
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

        {/* Dynamic Sandbox Display */}
        {activeSandboxTab === 'preview' && (
          <iframe
            title={`Custom Landing Page - ${entity.name}`}
            srcDoc={sandboxedDocument}
            sandbox="allow-scripts allow-forms"
            className="w-full h-[calc(100vh-42px)] border-none"
          />
        )}

        {activeSandboxTab === 'html' && (
          <div className="p-4 font-mono text-xs text-emerald-400 bg-slate-950 overflow-auto h-[calc(100vh-42px)] border-t border-slate-800">
            <pre>{entity.customHtml}</pre>
          </div>
        )}

        {activeSandboxTab === 'css' && (
          <div className="p-4 font-mono text-xs text-sky-400 bg-slate-950 overflow-auto h-[calc(100vh-42px)] border-t border-slate-800">
            <pre>{entity.customCss || '/* Multi-class Custom CSS / Tailwind overrides */'}</pre>
          </div>
        )}

        {activeSandboxTab === 'js' && (
          <div className="p-4 font-mono text-xs text-amber-300 bg-slate-950 overflow-auto h-[calc(100vh-42px)] border-t border-slate-800">
            <pre>{entity.customJs || '// Custom Interactive Client Script'}</pre>
          </div>
        )}
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Top Header Bar */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigateTo('page-02-directory')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Directory KIRI</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Salin URL Brand</span>
          </button>
          <button
            onClick={() => setIsAdminContactOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Custom Domain</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
        <img
          src={entity.coverImage}
          alt={entity.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Main Profile & Showcase Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-20 z-10 space-y-8">
        {/* Brand Main Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={entity.avatar}
              alt={entity.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-950 shadow-xl"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                  {entity.type.toUpperCase()} BRAND
                </span>
                {entity.verified && (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {entity.name}
              </h1>
              <p className="text-xs text-amber-400/90 font-mono font-medium">
                https://kiriproject.id/{entity.handle.replace('@', '')}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {entity.bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollabModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request Kolaborasi</span>
            </button>
          </div>
        </div>

        {/* Content Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Showcase & Services (Left 2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Katalog Portofolio & Campaign Showcase</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entity.portfolio?.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden group">
                    <div className="h-36 overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h4>
                      {item.caption && <p className="text-[11px] text-slate-400 line-clamp-2">{item.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar & Admin Contact CTA (Right 1 Col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Punya Custom Domain / Web Sendiri?</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingin mengubah tampilan halaman ini dengan **Custom Domain** (`brandkamu.com`) atau memasukkan **Custom HTML/CSS/JS** buatan tim dev kamu?
              </p>
              <button
                onClick={() => setIsAdminContactOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Hubungi Admin KIRI</span>
              </button>
            </div>
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
    </div>
  );
};
