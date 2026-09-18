import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Save,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Upload,
  ExternalLink
} from 'lucide-react';

export const Page17ProfileEditor: React.FC = () => {
  const { entities, currentUser, updateEntityProfile, navigateTo, showToast } = useApp();

  const currentEntity = entities.find((e) => e.id === currentUser?.entityId) || entities[0];

  const [name, setName] = useState(currentEntity.name);
  const [handle, setHandle] = useState(currentEntity.handle);
  const [category, setCategory] = useState(currentEntity.category);
  const [bio, setBio] = useState(currentEntity.bio);
  const [location, setLocation] = useState(currentEntity.location);
  const [website, setWebsite] = useState(currentEntity.website || '');
  const [services, setServices] = useState(currentEntity.services || []);
  const [portfolio, setPortfolio] = useState(currentEntity.portfolio || []);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortImage, setNewPortImage] = useState('');
  const [newPortCaption, setNewPortCaption] = useState('');

  const handleSave = () => {
    updateEntityProfile(currentEntity.id, {
      name,
      handle,
      category,
      bio,
      location,
      website,
      services,
      portfolio,
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const srv = {
      id: `srv-${Date.now()}`,
      name: newServiceName,
      price: newServicePrice,
      description: newServiceDesc || 'Paket layanan komersial terverifikasi KIRI PROJECT',
      deliverables: ['1x Konten Utama', 'Revisi 1x', 'Hak Pakai Komersial 6 Bulan'],
    };
    setServices([...services, srv]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
    showToast('Layanan baru ditambahkan ke daftar!', 'info');
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortTitle) return;
    const port = {
      id: `port-${Date.now()}`,
      title: newPortTitle,
      type: 'photo' as const,
      imageUrl: newPortImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      caption: newPortCaption || 'Dokumentasi karya kolaborasi',
      views: '12K',
    };
    setPortfolio([...portfolio, port]);
    setNewPortTitle('');
    setNewPortImage('');
    setNewPortCaption('');
    showToast('Karya baru ditambahkan ke portofolio!', 'info');
  };

  const handleDeletePortfolio = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
            <span>PAGE 17 — Edit Profil, Portofolio & Preview Publik</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            Kelola Profil Publik Anda
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pastikan portofolio dan rate card selalu mutakhir agar matching dengan brand berjalan optimal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('page-04-creator-profile', currentEntity.id)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Profil Publik</span>
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              Informasi Umum & Identitas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Tampilan Publik
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Username Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Niche / Kategori Utama
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lokasi / Domisili
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bio Kreator / Filosofi Karya
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Rate Card Services */}
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              Paket Layanan & Rate Card Resmi
            </h3>

            <div className="space-y-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white">
                        {srv.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400">
                        {srv.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {srv.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Hapus Layanan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Service Sub-Form */}
            <form onSubmit={handleAddService} className="pt-3 border-t border-gray-100 dark:border-kiri-dark-700 space-y-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                + Tambah Paket Layanan Baru:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama Paket (e.g. 1x 4K Drone Highlight)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tarif (e.g. IDR 3.500.000)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Rincian deliverables singkat..."
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90"
              >
                Tambahkan Paket
              </button>
            </form>
          </div>

          {/* Section 3: Portfolio Items */}
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
            <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              Portofolio & Karya Unggulan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 space-y-2 relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{item.caption}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Portfolio Form */}
            <form onSubmit={handleAddPortfolio} className="pt-3 border-t border-gray-100 dark:border-kiri-dark-700 space-y-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                + Tambah Karya ke Portofolio:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Judul Proyek / Kampanye"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="URL Gambar Sampul Karya"
                  value={newPortImage}
                  onChange={(e) => setNewPortImage(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Highlight dampak proyek (e.g. 150K views, 2x engagement)"
                value={newPortCaption}
                onChange={(e) => setNewPortCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 text-xs font-bold hover:opacity-90"
              >
                Tambahkan Karya
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Live Preview Snippet */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4 sticky top-28">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white">
                Pratinjau Live Profil
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Aktif
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden bg-gray-50 dark:bg-kiri-dark-850">
              <div className="h-20 bg-kiri-green-950 relative">
                <img
                  src={currentEntity.coverImage}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
              <div className="p-4 pt-0 -mt-8 relative space-y-2">
                <img
                  src={currentEntity.avatar}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-kiri-dark-800 shadow"
                />
                <div>
                  <h5 className="font-serif font-bold text-sm text-kiri-green-950 dark:text-white">{name}</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{handle} • {category}</p>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">{bio}</p>
                <div className="pt-2 border-t border-gray-200 dark:border-kiri-dark-700 text-[11px] flex justify-between">
                  <span className="text-gray-400">Total Paket:</span>
                  <span className="font-bold">{services.length} Paket Layanan</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateTo('page-28-brand-landing-page', currentEntity.id)}
              className="w-full py-2.5 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Buka Landing Page Brand (`kiriproject.id`)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
