import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Compass,
  Layers,
  FileCheck2,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  SlidersHorizontal,
  Radio,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    currentUser,
    logout,
    themeMode,
    toggleTheme,
    isMasterNavOpen,
    setIsMasterNavOpen,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'page-02-directory', label: 'Direktori', icon: <Compass className="w-4 h-4" /> },
    { id: 'page-29-broadcast', label: 'Siaran', icon: <Radio className="w-4 h-4" /> },
    { id: 'page-27-request-flowchart', label: 'Alur Kerja', icon: <Layers className="w-4 h-4" /> },
    { id: 'page-23-my-collaborations', label: 'Kolaborasi', icon: <FileCheck2 className="w-4 h-4" /> },
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

  const goDashboard = () => {
    setIsUserDropdownOpen(false);
    if (currentUser?.role === 'admin') navigateTo('page-25-dashboard-admin');
    else if (currentUser?.role === 'community_lead') navigateTo('page-18-dashboard-community');
    else navigateTo('page-16-dashboard-user');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('page-01-home')}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Ke beranda KIRI PROJECT"
          >
            <img
              src="/assets/logo/kiri-logo.png"
              alt="KIRI PROJECT"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-serif text-[1.05rem] font-semibold tracking-tight text-foreground">
              KIRI <span className="text-primary">Project</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as any)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMasterNavOpen(true)}
              aria-label="Peta semua halaman"
              title="Peta semua halaman"
            >
              <Layers className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label="Ganti mode terang/gelap"
              title="Mode terang / gelap"
            >
              {themeMode === 'nocturnal' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              onClick={() => navigateTo('page-08-join-select')}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Bergabung
            </Button>

            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-0.5 pl-1 pr-1.5 rounded-full border border-border hover:border-foreground/25 transition-colors"
                  aria-label="Menu akun"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-secondary text-foreground text-[10px] font-semibold">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ) : (
                <Button onClick={() => navigateTo('page-15-login')} variant="outline" size="sm">
                  Masuk
                </Button>
              )}

              {isUserDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-elevated bg-card border border-border py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2.5 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={goDashboard}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        navigateTo('page-17-profile-editor');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary flex items-center gap-2.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                      <span>Edit Profil</span>
                    </button>
                  </div>

                  <div className="p-1.5 border-t border-border">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
              aria-label="Menu navigasi"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-5 py-3 space-y-1 animate-in fade-in">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              navigateTo('page-08-join-select');
              setIsMobileMenuOpen(false);
            }}
            className="icon-nudge w-full mt-2 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150"
          >
            <span>Bergabung</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsMasterNavOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full h-10 rounded-lg border border-border text-sm text-foreground flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Peta Semua Halaman</span>
          </button>
        </div>
      )}
    </header>
  );
};
