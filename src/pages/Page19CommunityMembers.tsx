import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommunityMember } from '../types';
import {
  Sparkles,
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const Page19CommunityMembers: React.FC = () => {
  const {
    communityMembers,
    addCommunityMember,
    importCommunityMembers,
    updateMemberStatus,
    deleteMember,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<CommunityMember['role']>('Active Creator');
  const [newCategory, setNewCategory] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInstagram, setNewInstagram] = useState('');

  const filteredMembers = communityMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.instagram.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addCommunityMember({
      name: newName,
      role: newRole,
      category: newCategory || 'Creative',
      email: newEmail || 'member@kiri.id',
      instagram: newInstagram || '@kiri.member',
      status: 'active',
    });
    setNewName('');
    setNewCategory('');
    setNewEmail('');
    setNewInstagram('');
    setIsAddModalOpen(false);
  };

  const handleSimulateImport = () => {
    const mockImport = [
      { name: 'Ketut Widiastuti', role: 'Active Creator' as const, category: 'Photography & Styling', email: 'ketut.widi@gmail.com', instagram: '@ketutstyling' },
      { name: 'Bagus Panji Putra', role: 'Contributor' as const, category: 'Audio Production & Scoring', email: 'bagus.panji@gmail.com', instagram: '@baguspanjimusic' },
      { name: 'Kadek Sinta Devi', role: 'Active Creator' as const, category: 'Fashion & Hand-weave', email: 'kadek.sinta@gmail.com', instagram: '@kadeksinta' },
    ];
    importCommunityMembers(mockImport);
    setIsImportModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Role,Category,Email,Instagram,Status,JoinedDate\n';
    const rows = communityMembers
      .map(
        (m) =>
          `"${m.id}","${m.name}","${m.role}","${m.category}","${m.email}","${m.instagram}","${m.status}","${m.joinedDate}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KIRI_Community_Members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diekspor!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kiri-green-800/10 dark:bg-kiri-gold-500/20 text-kiri-green-900 dark:text-kiri-gold-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kiri-gold-600 dark:text-kiri-gold-400" />
            <span>PAGE 19 — Database Anggota Komunitas Terkontrol</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-kiri-green-950 dark:text-white">
            Community Members Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sesuai Developer Handoff Rules: Database anggota adalah data privat terkontrol, bukan daftar kontak publik terbuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-kiri-dark-600 hover:bg-gray-50 dark:hover:bg-kiri-dark-750 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-kiri-gold-500/40 hover:bg-kiri-gold-500/10 text-xs font-semibold text-kiri-green-900 dark:text-kiri-gold-400 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV/Excel</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-950 text-xs font-bold shadow-subtle hover:opacity-90 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-2xl p-4 border border-gray-200 dark:border-kiri-dark-700 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, instagram, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">Semua Peran</option>
            <option value="Leader">Leader</option>
            <option value="Core Team">Core Team</option>
            <option value="Active Creator">Active Creator</option>
            <option value="Contributor">Contributor</option>
            <option value="New Member">New Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-kiri-dark-850 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100 dark:border-kiri-dark-700">
              <tr>
                <th className="p-4 pl-6">Anggota</th>
                <th className="p-4">Peran Komunitas</th>
                <th className="p-4">Spesialisasi</th>
                <th className="p-4">Kontak Terkontrol</th>
                <th className="p-4">Bergabung</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-kiri-dark-700 text-gray-700 dark:text-gray-300">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-kiri-dark-750 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-xl object-cover border border-kiri-gold-500/30 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-[10px] text-gray-400">{member.instagram}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-kiri-green-100 dark:bg-kiri-dark-700 text-kiri-green-900 dark:text-kiri-gold-400">
                      {member.role}
                    </span>
                  </td>

                  <td className="p-4 font-medium">{member.category}</td>

                  <td className="p-4">
                    <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{member.email}</span>
                  </td>

                  <td className="p-4 text-gray-500">{member.joinedDate}</td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        updateMemberStatus(member.id, member.status === 'active' ? 'pending' : 'active')
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                      title="Klik untuk ubah status"
                    >
                      {member.status.toUpperCase()}
                    </button>
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Hapus dari database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-kiri-green-900/20 dark:border-kiri-gold-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white">
                Tambah Anggota ke Database
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Anggota *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Peran dalam Komunitas</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                >
                  <option value="Active Creator">Active Creator</option>
                  <option value="Core Team">Core Team</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Spesialisasi / Niche</label>
                <input
                  type="text"
                  placeholder="e.g. Graphic Design, Drone, Ceramic"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Anggota</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={newInstagram}
                  onChange={(e) => setNewInstagram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-kiri-dark-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-kiri-dark-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-bold"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-kiri-green-900/20 dark:border-kiri-gold-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-kiri-dark-700 pb-3">
              <h3 className="font-serif text-lg font-bold text-kiri-green-950 dark:text-white">
                Import Anggota (CSV/Excel)
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-kiri-dark-600 bg-gray-50 dark:bg-kiri-dark-850 text-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-kiri-gold-600 mx-auto" />
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Tarik file CSV/Excel ke sini atau klik untuk memilih
              </p>
              <p className="text-[11px] text-gray-400">
                Format kolom: Nama, Role, Spesialisasi, Email, Instagram
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={handleExportCSV}
                className="text-kiri-green-800 dark:text-kiri-gold-400 underline font-semibold"
              >
                Unduh Template CSV
              </button>
              <button
                onClick={handleSimulateImport}
                className="px-5 py-2 rounded-xl bg-kiri-green-900 text-white dark:bg-kiri-gold-500 dark:text-kiri-dark-900 font-bold"
              >
                Simulasikan Import (3 Baris)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
