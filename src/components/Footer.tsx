import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  const waNumber = '6285724262527';
  const waText = encodeURIComponent('Halo Kak Rini & Tim KIRI PROJECT, saya ingin berkonsultasi mengenai kolaborasi ekosistem kreator...');
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const columns: { title: string; links: { label: string; onClick: () => void }[] }[] = [
    {
      title: 'Direktori',
      links: [
        { label: 'Semua Talenta & Entitas', onClick: () => navigateTo('page-02-directory') },
        { label: 'Profil Kreator', onClick: () => navigateTo('page-04-creator-profile', 'creator-1') },
        { label: 'Profil Komunitas', onClick: () => navigateTo('page-03-community-profile', 'comm-1') },
        { label: 'Katalog UMKM', onClick: () => navigateTo('page-05-business-profile', 'biz-1') },
        { label: 'Media Partner', onClick: () => navigateTo('page-06-media-profile', 'media-1') },
        { label: 'Mitra Strategis', onClick: () => navigateTo('page-07-partner-profile', 'strat-1') },
      ],
    },
    {
      title: 'Bergabung',
      links: [
        { label: 'Pilih Peran', onClick: () => navigateTo('page-08-join-select') },
        { label: 'Daftar Kreator', onClick: () => navigateTo('page-09-register-creator') },
        { label: 'Daftarkan Komunitas', onClick: () => navigateTo('page-10-register-community') },
        { label: 'Daftarkan UMKM', onClick: () => navigateTo('page-11-register-business') },
        { label: 'Keanggotaan', onClick: () => navigateTo('page-14-membership-payment') },
        { label: 'Alur Kerja Sama', onClick: () => navigateTo('page-27-request-flowchart') },
      ],
    },
    {
      title: 'Akun',
      links: [
        { label: 'Masuk', onClick: () => navigateTo('page-15-login') },
        { label: 'Dashboard Kreator / UMKM', onClick: () => navigateTo('page-16-dashboard-user') },
        { label: 'Dashboard Komunitas', onClick: () => navigateTo('page-18-dashboard-community') },
        { label: 'Database Member', onClick: () => navigateTo('page-19-community-members') },
        { label: 'Portal Admin', onClick: () => navigateTo('page-24-login-admin') },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo/kiri-logo.png"
                alt="KIRI PROJECT"
                className="w-8 h-8 object-contain"
              />
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
                KIRI <span className="text-primary">Project</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Ekosistem kolaborasi kreator, UMKM, komunitas, dan mitra strategis Indonesia.
              Menghubungkan talenta dengan peluang nyata.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Kak Rini</span>
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-foreground/75 hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 KIRI PROJECT</p>
          <p>Bali, Indonesia · Kolaborasi bersama DGT Team</p>
        </div>
      </div>
    </footer>
  );
};
