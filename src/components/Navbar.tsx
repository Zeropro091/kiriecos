import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_USERS } from '../data/mockData';
import {
  Sparkles,
  Compass,
  Layers,
  FileCheck2,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  LogOut,
  FolderGit2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    currentUser,
    loginAs,
    logout,
    themeMode,
    toggleTheme,
    setIsMasterNavOpen,
    openCollabModalFor,
    entities,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleCollabClick = () => {
    // Default to first creator or target
    const creator = entities.find((e) => e.type === 'creator') || entities[0];
    openCollabModalFor(creator);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-kiri-ivory/90 dark:bg-kiri-dark-900/90 border-b border-kiri-green-900/10 dark:border-kiri-gold-500/20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigateTo('page-01-home')}
          >
            <div className="w-12 h-12 rounded-xl bg-kiri-green-950 dark:bg-kiri-dark-800 p-1.5 flex items-center justify-center border border-kiri-gold-500/30 group-hover:border-kiri-gold-500 transition-all shadow-subtle">
              <img
                src="/assets/logo/kiri-logo.png"
                alt="KIRI PROJECT"
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-kiri-gold-400 font-serif font-bold text-xl hidden group-has-[img:hidden]:inline">KP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-kiri-green-950 dark:text-kiri-ivory">
                  KIRI <span className="text-kiri-gold-600 dark:text-kiri-gold-400">PROJECT</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-800 dark:text-kiri-gold-300">
                  Ecosystem
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-kiri-green-900/70 dark:text-kiri-ivory-sand/60 font-medium tracking-wide">
                Connect. Collaborate. Impact.
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => navigateTo('page-01-home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'page-01-home'
                  ? 'text-kiri-green-950 dark:text-kiri-gold-400 bg-kiri-green-800/5 dark:bg-kiri-dark-800 font-semibold'
                  : 'text-kiri-dark-800/80 dark:text-kiri-ivory-sand/80 hover:text-kiri-green-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => navigateTo('page-02-directory')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                currentPage === 'page-02-directory'
                  ? 'text-kiri-green-950 dark:text-kiri-gold-400 bg-kiri-green-800/5 dark:bg-kiri-dark-800 font-semibold'
                  : 'text-kiri-dark-800/80 dark:text-kiri-ivory-sand/80 hover:text-kiri-green-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-kiri-gold-600" />
              Direktori Ekosistem
            </button>

            <button
              onClick={() => navigateTo('page-27-request-flowchart')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                currentPage === 'page-27-request-flowchart'
                  ? 'text-kiri-green-950 dark:text-kiri-gold-400 bg-kiri-green-800/5 dark:bg-kiri-dark-800 font-semibold'
                  : 'text-kiri-dark-800/80 dark:text-kiri-ivory-sand/80 hover:text-kiri-green-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-kiri-green-700 dark:text-kiri-green-400" />
              Alur Kolaborasi
            </button>

            <button
              onClick={() => navigateTo('page-23-my-collaborations')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                currentPage === 'page-23-my-collaborations'
                  ? 'text-kiri-green-950 dark:text-kiri-gold-400 bg-kiri-green-800/5 dark:bg-kiri-dark-800 font-semibold'
                  : 'text-kiri-dark-800/80 dark:text-kiri-ivory-sand/80 hover:text-kiri-green-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-kiri-gold-600" />
              Kolaborasi Saya
            </button>

            <button
              onClick={() => navigateTo('page-08-join-select')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage.startsWith('page-08') || currentPage.startsWith('page-09') || currentPage.startsWith('page-10') || currentPage.startsWith('page-11') || currentPage.startsWith('page-12') || currentPage.startsWith('page-13') || currentPage.startsWith('page-14')
                  ? 'text-kiri-green-950 dark:text-kiri-gold-400 bg-kiri-green-800/5 dark:bg-kiri-dark-800 font-semibold'
                  : 'text-kiri-dark-800/80 dark:text-kiri-ivory-sand/80 hover:text-kiri-green-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Gabung Ekosistem
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Master Page Switcher Button */}
            <button
              onClick={() => setIsMasterNavOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-kiri-gold-500/15 hover:bg-kiri-gold-500/25 text-kiri-gold-800 dark:text-kiri-gold-300 border border-kiri-gold-500/30 transition-all shadow-sm"
              title="Buka Daftar 27 Halaman UI/UX Foundation"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
              <span className="hidden sm:inline">27 Master Pages</span>
              <span className="sm:hidden">27 Pages</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-kiri-green-950 dark:text-kiri-ivory hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              title={themeMode === 'heritage' ? 'Aktifkan Mode Nocturnal' : 'Aktifkan Mode Heritage'}
            >
              {themeMode === 'heritage' ? (
                <Moon className="w-4 h-4 text-kiri-green-900" />
              ) : (
                <Sun className="w-4 h-4 text-kiri-gold-400" />
              )}
            </button>

            {/* Primary CTA: Request Through KIRI */}
            <button
              onClick={handleCollabClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-kiri-green-900 to-kiri-green-800 hover:from-kiri-green-800 hover:to-kiri-green-700 text-white shadow-subtle border border-kiri-gold-500/40 hover:border-kiri-gold-400 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-kiri-gold-400 animate-pulse" />
              <span>Request Through KIRI</span>
            </button>

            {/* User Session / Demo Account Switcher */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-kiri-green-900/20 dark:border-kiri-gold-500/30 hover:border-kiri-gold-500/60 transition-all bg-kiri-ivory-warm dark:bg-kiri-dark-800 text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-kiri-gold-500/40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div className="hidden md:block">
                    <p className="text-xs font-bold leading-tight text-kiri-green-950 dark:text-kiri-ivory truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-kiri-gold-700 dark:text-kiri-gold-400 font-medium">
                      {currentUser.membershipTier}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-kiri-green-900/60 dark:text-kiri-ivory-sand/60" />
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('page-15-login')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-kiri-green-950 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 hover:opacity-90 transition-all"
                >
                  Masuk
                </button>
              )}

              {/* User Switcher Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-elevated bg-white dark:bg-kiri-dark-800 border border-kiri-green-900/10 dark:border-kiri-gold-500/30 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-kiri-dark-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Akun Aktif:</p>
                    <p className="text-sm font-bold text-kiri-green-950 dark:text-white truncate">
                      {currentUser?.name}
                    </p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] rounded bg-kiri-green-50 dark:bg-kiri-green-900/40 text-kiri-green-800 dark:text-kiri-green-300 font-medium">
                      Peran: {currentUser?.role.toUpperCase()}
                    </span>
                  </div>

                  {/* Dashboard Route */}
                  <div className="px-2 py-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        if (currentUser?.role === 'admin') navigateTo('page-25-dashboard-admin');
                        else if (currentUser?.role === 'community_lead') navigateTo('page-18-dashboard-community');
                        else navigateTo('page-16-dashboard-user');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-kiri-green-900 dark:text-kiri-ivory hover:bg-kiri-green-50 dark:hover:bg-kiri-dark-700 flex items-center justify-between"
                    >
                      <span>Buka Dashboard Saya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigateTo('page-17-profile-editor');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-kiri-green-900 dark:text-kiri-ivory hover:bg-kiri-green-50 dark:hover:bg-kiri-dark-700"
                    >
                      Edit Profil & Portofolio
                    </button>
                  </div>

                  <div className="px-3 py-1.5 border-t border-gray-100 dark:border-kiri-dark-700">
                    <p className="text-[10px] uppercase font-bold text-kiri-gold-700 dark:text-kiri-gold-400 tracking-wider mb-1">
                      Demo Cepat Ganti Peran:
                    </p>
                    {DEFAULT_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          loginAs(user);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 transition-all ${
                          currentUser?.id === user.id
                            ? 'bg-kiri-gold-500/15 text-kiri-green-950 dark:text-kiri-gold-300 font-bold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-kiri-dark-700'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-kiri-gold-500 shrink-0"></span>
                        <span className="truncate">{user.name}</span>
                        <span className="text-[10px] text-gray-400 ml-auto capitalize shrink-0">
                          {user.role.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="px-2 pt-1 border-t border-gray-100 dark:border-kiri-dark-700">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-kiri-green-950 dark:text-kiri-ivory hover:bg-black/5 dark:hover:bg-white/5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-t border-kiri-green-900/10 dark:border-kiri-gold-500/20 bg-kiri-ivory dark:bg-kiri-dark-900 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              navigateTo('page-01-home');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Beranda
          </button>
          <button
            onClick={() => {
              navigateTo('page-02-directory');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Direktori Ekosistem
          </button>
          <button
            onClick={() => {
              navigateTo('page-27-request-flowchart');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Alur Kolaborasi Ekosistem
          </button>
          <button
            onClick={() => {
              navigateTo('page-23-my-collaborations');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Kolaborasi Saya
          </button>
          <button
            onClick={() => {
              navigateTo('page-08-join-select');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-kiri-gold-700 dark:text-kiri-gold-400 font-bold hover:bg-black/5 dark:hover:bg-white/5"
          >
            Gabung KIRI PROJECT
          </button>

          <div className="pt-3 border-t border-gray-200 dark:border-kiri-dark-700">
            <button
              onClick={() => {
                handleCollabClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg bg-kiri-green-900 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-kiri-gold-400" />
              <span>Request Through KIRI Project</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
