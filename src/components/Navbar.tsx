import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  ArrowRight,
  LogOut,
  User,
  SlidersHorizontal,
  Radio
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
    isMasterNavOpen,
    setIsMasterNavOpen,
    openCollabModalFor,
    entities,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleCollabClick = () => {
    const creator = entities.find((e) => e.type === 'creator') || entities[0];
    openCollabModalFor(creator);
  };

  const navItems = [
    { id: 'page-01-home', label: 'Beranda' },
    { id: 'page-02-directory', label: 'Direktori Talenta', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'page-29-broadcast', label: 'Siaran Komunitas', icon: <Radio className="w-3.5 h-3.5 text-olive-500 animate-pulse" /> },
    { id: 'page-27-request-flowchart', label: 'Alur Kerja Sama', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'page-23-my-collaborations', label: 'Kolaborasi Saya', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
  ];

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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/90 border-b border-border shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => navigateTo('page-01-home')}
          >
            <div className="w-10 h-10 rounded-xl bg-granite-900 dark:bg-granite-800 p-1.5 flex items-center justify-center border border-olive-500/40 shadow-xs group-hover:border-olive-400 group-hover:shadow-[0_0_16px_rgba(92,130,78,0.35)] transition-all duration-300">
              <img
                src="/assets/logo/kiri-logo.png"
                alt="KIRI PROJECT"
                className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-olive-400 font-serif font-bold text-sm hidden group-has-[img:hidden]:inline">KP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                  KIRI <span className="text-olive-600 dark:text-olive-400">PROJECT</span>
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 border-olive-500/40 text-olive-700 dark:text-olive-300 bg-olive-500/10 font-bold">
                  BALI
                </Badge>
              </div>
              <p className="hidden md:block text-[10px] text-muted-foreground font-semibold tracking-wide">
                Connect &bull; Collaborate &bull; Impact
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-foreground bg-muted font-bold border border-border shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Stack */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted"
              title="Ganti Mode Tampilan (Gelap/Terang)"
            >
              {themeMode === 'nocturnal' ? (
                <Sun className="w-4 h-4 text-olive-400" />
              ) : (
                <Moon className="w-4 h-4 text-granite-700" />
              )}
            </Button>

            {/* Primary Action Button (Refined Olive) */}
            <Button
              onClick={handleCollabClick}
              className="hidden sm:inline-flex items-center gap-2 bg-olive-700 hover:bg-olive-600 text-white dark:bg-olive-500 dark:hover:bg-olive-400 dark:text-granite-950 font-bold text-xs shadow-md border border-olive-600/30 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ajak Kolaborasi</span>
            </Button>

            {/* User Profile Pill */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-border hover:border-olive-500/70 bg-card hover:bg-muted/40 transition-all text-left shadow-2xs"
                >
                  <Avatar className="w-7 h-7 border border-olive-500/50">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-granite-900 text-olive-300 text-[10px] font-bold">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block leading-tight">
                    <p className="text-[11px] font-bold text-foreground truncate max-w-[80px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] text-olive-600 dark:text-olive-400 font-bold uppercase tracking-wider">
                      {currentUser.membershipTier}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
                </button>
              ) : (
                <Button
                  onClick={() => navigateTo('page-15-login')}
                  variant="default"
                  size="sm"
                  className="bg-granite-900 hover:bg-granite-800 text-white dark:bg-white dark:text-granite-950 text-xs font-semibold"
                >
                  Masuk
                </Button>
              )}

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl bg-card border border-border py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-olive-500/50">
                      <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                      <AvatarFallback className="bg-granite-900 text-olive-300 text-xs font-bold">
                        {getInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-foreground truncate">
                        {currentUser?.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 font-bold">
                          {currentUser?.role}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 border-olive-500/50 text-olive-700 dark:text-olive-300 font-bold">
                          {currentUser?.membershipTier}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        if (currentUser?.role === 'admin') navigateTo('page-25-dashboard-admin');
                        else if (currentUser?.role === 'community_lead') navigateTo('page-18-dashboard-community');
                        else navigateTo('page-16-dashboard-user');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Dashboard Saya</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigateTo('page-17-profile-editor');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Edit Profil & Portofolio</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-1.5 border-t border-border mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigateTo(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <Button
            onClick={() => {
              handleCollabClick();
              setIsMobileMenuOpen(false);
            }}
            className="w-full bg-olive-700 hover:bg-olive-600 text-white font-bold text-xs mt-2"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Ajak Kolaborasi Sekarang</span>
          </Button>
        </div>
      )}
    </header>
  );
};
