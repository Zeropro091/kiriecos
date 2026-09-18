import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Mail, Phone, ExternalLink, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setIsMasterNavOpen } = useApp();

  const waNumber = '6285724262527';
  const waText = encodeURIComponent('Halo Kak Rini & Tim KIRI PROJECT, saya ingin berkonsultasi mengenai kolaborasi ekosistem kreator...');
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <footer className="bg-kiri-green-950 text-white pt-16 pb-12 border-t border-kiri-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-kiri-gold-500/40">
                <img
                  src="/assets/logo/kiri-logo.png"
                  alt="KIRI PROJECT"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white tracking-tight">
                  KIRI <span className="text-kiri-gold-400">PROJECT</span>
                </span>
                <p className="text-xs text-kiri-gold-300 font-medium tracking-wide">
                  Connect. Collaborate. Impact.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Ekosistem kolaborasi kreator, brand UMKM, komunitas, dan mitra strategis Indonesia.
              Menghubungkan talenta berkualitas dengan peluang komersial nyata secara aman, transparan, dan berdampak.
            </p>

            {/* Official Contact Person Card */}
            <div className="p-4 rounded-xl bg-white/5 border border-kiri-gold-500/30 max-w-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-kiri-gold-300 uppercase tracking-wider">
                  Contact Person Resmi
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-kiri-green-800 text-kiri-gold-200 font-medium">
                  Founder Liaison
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Kak Rini</p>
                  <p className="text-xs text-gray-400">drini562@gmail.com</p>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Direktori Ekosistem */}
          <div>
            <h4 className="text-xs font-bold text-kiri-gold-400 uppercase tracking-wider mb-4">
              Direktori Ekosistem
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => navigateTo('page-02-directory')}
                  className="hover:text-white transition-colors"
                >
                  Semua Talenta & Entitas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-04-creator-profile', 'creator-1')}
                  className="hover:text-white transition-colors"
                >
                  Profil Kreator Unggulan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-03-community-profile', 'comm-1')}
                  className="hover:text-white transition-colors"
                >
                  Profil Komunitas Kreatif
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-05-business-profile', 'biz-1')}
                  className="hover:text-white transition-colors"
                >
                  Katalog Brand / UMKM
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-06-media-profile', 'media-1')}
                  className="hover:text-white transition-colors"
                >
                  Publikasi Media Partner
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-07-partner-profile', 'strat-1')}
                  className="hover:text-white transition-colors"
                >
                  Mitra Strategis & Teknologi
                </button>
              </li>
            </ul>
          </div>

          {/* Onboarding & Membership */}
          <div>
            <h4 className="text-xs font-bold text-kiri-gold-400 uppercase tracking-wider mb-4">
              Bergabung & Registrasi
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => navigateTo('page-08-join-select')}
                  className="hover:text-white transition-colors"
                >
                  Pilih Peran Entitas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-09-register-creator')}
                  className="hover:text-white transition-colors"
                >
                  Daftar Sebagai Kreator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-10-register-community')}
                  className="hover:text-white transition-colors"
                >
                  Daftarkan Komunitas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-11-register-business')}
                  className="hover:text-white transition-colors"
                >
                  Daftarkan Bisnis / UMKM
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-14-membership-payment')}
                  className="hover:text-white transition-colors"
                >
                  Paket Keanggotaan & Aktivasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-27-request-flowchart')}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400" />
                  <span>Alur Permintaan Layanan</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Area Pengguna & Admin */}
          <div>
            <h4 className="text-xs font-bold text-kiri-gold-400 uppercase tracking-wider mb-4">
              Area Khusus
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <button
                  onClick={() => navigateTo('page-15-login')}
                  className="hover:text-white transition-colors"
                >
                  Login Pengguna
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-16-dashboard-user')}
                  className="hover:text-white transition-colors"
                >
                  Dashboard Kreator / UMKM
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-18-dashboard-community')}
                  className="hover:text-white transition-colors"
                >
                  Dashboard Komunitas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-19-community-members')}
                  className="hover:text-white transition-colors"
                >
                  Database Member Terkontrol
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('page-24-login-admin')}
                  className="text-amber-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Portal Admin KIRI</span>
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setIsMasterNavOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-kiri-gold-300 text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <span>27 Master Pages Guide</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 KIRI PROJECT. All rights reserved. Heritage Modernism Design System.</p>
          <div className="flex items-center gap-6">
            <span>Kolaborasi Strategis bersama DGT Team</span>
            <span>Bali, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
