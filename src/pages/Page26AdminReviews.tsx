import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Users,
  Building2,
  CreditCard,
  ArrowLeft,
  FileCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { PaymentReceipt } from '../types';

export const Page26AdminReviews: React.FC = () => {
  const { registrations, reviewRegistration, navigateTo, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'registrations' | 'payments'>('registrations');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const list = await dataService.getPendingPayments();
    setPayments(list);
  };

  const handleVerifyPayment = async (id: string, action: 'verify' | 'reject') => {
    const success = await dataService.verifyPayment(id, action);
    if (success) {
      showToast(action === 'verify' ? 'Pembayaran berhasil diverifikasi!' : 'Pembayaran ditolak.', 'success');
      loadPayments();
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KIRI Admin Verification Center</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Kurasi Pendaftaran & Pembayaran Member
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validasi profil kreator/UMKM Bali serta verifikasi bukti transfer manual sebelum status akun diaktifkan.
          </p>
        </div>

        <button
          onClick={() => navigateTo('page-25-dashboard-admin')}
          className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Request Center</span>
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'registrations'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Antrean Registrasi Entitas ({registrations.filter(r => r.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Bukti Transfer Manual ({payments.filter(p => p.status === 'pending_verification').length})
        </button>
      </div>

      {/* Content for Registrations */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === tab
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'Semua Permohonan' : tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl p-6 bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-emerald-400 border border-slate-700">
                      {app.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{app.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PIC: <strong className="text-slate-200">{app.contactPerson}</strong> • 📍 {app.city}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium mt-1">Kategori: {app.category}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    {app.details}
                  </div>

                  <div className="mt-3 pt-2 text-xs space-y-1 text-slate-400 border-t border-slate-800/60">
                    <p>Email: <span className="font-mono text-slate-200">{app.email}</span></p>
                    <p>WA: <span className="font-mono text-slate-200">{app.phone}</span></p>
                    <p>Kanal: <span className="text-emerald-400 font-medium">{app.socialLink}</span></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => reviewRegistration(app.id, 'rejected')}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => reviewRegistration(app.id, 'approved')}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                      >
                        Setujui & Aktifkan
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center text-xs text-slate-500 font-medium py-1">
                      Status: {app.status.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content for Manual Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {payments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Tidak ada bukti transfer manual yang sedang menunggu verifikasi saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-6 bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {p.tier} Tier
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{p.submittedAt}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base">{p.userName}</h4>
                      <p className="text-xs text-slate-400">Pengirim: <strong className="text-slate-200">{p.senderAccountName}</strong></p>
                      <p className="text-xs text-slate-400">Bank: <strong className="text-slate-200">{p.bankName}</strong></p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                      <span className="text-slate-400">Nominal Transfer:</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        {p.receiptImageUrl}
                      </span>
                      <span className="text-emerald-400 text-[10px] font-semibold cursor-pointer underline">
                        Lihat Lampiran
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyPayment(p.id, 'reject')}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(p.id, 'verify')}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                    >
                      Verifikasi & Upgrade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
