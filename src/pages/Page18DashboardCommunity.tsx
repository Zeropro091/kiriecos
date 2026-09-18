import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  FileCheck2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Award,
  Bell
} from 'lucide-react';

export const Page18DashboardCommunity: React.FC = () => {
  const { communityMembers, navigateTo, entities } = useApp();

  const community = entities.find((e) => e.type === 'community') || entities[3];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-kiri-green-950 via-kiri-green-900 to-kiri-green-950 text-white rounded-3xl p-8 sm:p-10 border border-kiri-gold-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-subtle">
        <div className="flex items-center gap-5">
          <img
            src={community.avatar}
            alt={community.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-kiri-gold-400 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {community.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-kiri-gold-500 text-kiri-dark-950">
                Community Lead Dashboard
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Dipimpin oleh <strong>Kak Rini</strong> • 1.240 Anggota Terdaftar
            </p>
            <p className="text-xs text-kiri-gold-300 mt-2">
              Status Ekosistem: Partner Komunitas Resmi KIRI PROJECT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigateTo('page-19-community-members')}
            className="px-5 py-2.5 rounded-xl bg-kiri-gold-500 hover:bg-kiri-gold-400 text-kiri-dark-950 text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Database Anggota (PAGE 19)</span>
          </button>
          <button
            onClick={() => navigateTo('page-03-community-profile', community.id)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
          >
            Lihat Profil Publik
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Anggota Database</span>
            <Users className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            {communityMembers.length * 200 + 40}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Data Terkontrol Aman</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Proyek Selesai</span>
            <FileCheck2 className="w-4 h-4 text-kiri-green-700 dark:text-kiri-green-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            54 Proyek
          </p>
          <span className="text-[11px] text-gray-400">Total Ekosistem</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Workshop Diadakan</span>
            <Calendar className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            38 Sesi
          </p>
          <span className="text-[11px] text-amber-600 font-medium">2 sesi bulan ini</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-kiri-dark-800 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Kemitraan Brand</span>
            <Award className="w-4 h-4 text-kiri-gold-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            25 Brand
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Sponsor Terverifikasi</span>
        </div>
      </div>

      {/* Member Roster Preview & Announcement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-kiri-green-950 dark:text-white">
                Roster Anggota Inti Komunitas
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pekerja kreatif dan talenta yang aktif dalam kegiatan komunitas
              </p>
            </div>
            <button
              onClick={() => navigateTo('page-19-community-members')}
              className="text-xs font-bold text-kiri-green-900 dark:text-kiri-gold-400 hover:underline flex items-center gap-1"
            >
              <span>Kelola Seluruh Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
            <div className="divide-y divide-gray-100 dark:divide-kiri-dark-700">
              {communityMembers.slice(0, 4).map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl object-cover border border-kiri-gold-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-kiri-green-950 dark:text-white">
                          {member.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-900 dark:text-kiri-gold-400 font-bold">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {member.category} • {member.instagram}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    member.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {member.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Bulletins */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-kiri-green-950 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-kiri-gold-600" />
              <span>Papan Pengumuman Komunitas</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700 space-y-1">
                <p className="font-bold text-kiri-green-950 dark:text-white">
                  Kurasi Proyek Pilot UMKM Kintamani
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Brief kolaborasi video komersial telah dibuka. Anggota yang tertarik dapat mendaftar melalui admin KIRI.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-kiri-dark-750 border border-gray-100 dark:border-kiri-dark-700 space-y-1">
                <p className="font-bold text-kiri-green-950 dark:text-white">
                  Meetup Rutin Jumat Depan
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                  Diskusi portofolio dan bedah kontrak komersial bersama Kak Rifky & Kak Rini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
