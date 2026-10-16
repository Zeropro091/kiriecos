import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  Entity,
  CommunityMember,
  CollaborationRequest,
  RegistrationApplication,
  UserSession,
  BroadcastMessage,
} from '../types';
import { dataService } from '../services/dataService';
import { localAuth } from '../lib/localAuth';
import { canBroadcast, canManageCollaborations } from '../lib/access';

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentPage: PageId;
  navigateTo: (page: PageId, entityId?: string) => void;
  selectedEntityId: string;
  selectedEntity: Entity | undefined;
  currentUser: UserSession | null;
  loginAs: (user: UserSession) => void;
  logout: () => void;
  themeMode: 'heritage' | 'nocturnal';
  toggleTheme: () => void;
  entities: Entity[];
  communityMembers: CommunityMember[];
  collabRequests: CollaborationRequest[];
  registrations: RegistrationApplication[];
  selectedCollabId: string | null;
  setSelectedCollabId: (id: string | null) => void;
  isCollabModalOpen: boolean;
  setIsCollabModalOpen: (open: boolean) => void;
  collabTargetEntity: Entity | null;
  openCollabModalFor: (entity: Entity) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  // Actions
  submitCollabRequest: (data: Partial<CollaborationRequest>) => string;
  updateCollabStatus: (id: string, status: CollaborationRequest['status'], adminNotes?: string) => void;
  addCommunityMember: (member: Partial<CommunityMember>) => void;
  importCommunityMembers: (members: Partial<CommunityMember>[]) => void;
  updateMemberStatus: (id: string, status: CommunityMember['status']) => void;
  deleteMember: (id: string) => void;
  submitRegistration: (data: Partial<RegistrationApplication>) => void;
  reviewRegistration: (id: string, status: 'approved' | 'rejected') => void;
  updateEntityProfile: (entityId: string, updates: Partial<Entity>) => void;
  broadcastMessages: BroadcastMessage[];
  sendBroadcastMessage: (data: { scope: 'indonesia' | 'regional'; region?: string; content: string }) => void;
  likeBroadcastMessage: (id: string) => void;
  isMasterNavOpen: boolean;
  setIsMasterNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('page-01-home');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => localAuth.loadSession());
  const [themeMode, setThemeMode] = useState<'heritage' | 'nocturnal'>('heritage');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationApplication[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState<boolean>(false);
  const [collabTargetEntity, setCollabTargetEntity] = useState<Entity | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isMasterNavOpen, setIsMasterNavOpen] = useState<boolean>(false);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);

  // Handle Theme class on body
  useEffect(() => {
    if (themeMode === 'nocturnal') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Hydrate every collection from the backend on boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [approved, broadcasts, members] = await Promise.all([
          dataService.getApprovedEntities(),
          dataService.getBroadcasts().catch(() => [] as BroadcastMessage[]),
          dataService.getMembers().catch(() => [] as CommunityMember[]),
        ]);
        if (cancelled) return;
        setEntities(approved);
        setBroadcastMessages(broadcasts);
        setCommunityMembers(members);
      } catch (err) {
        if (!cancelled) {
          console.error('[KIRI] Gagal memuat data dari server:', err);
          showToast('Tidak dapat memuat data dari server KIRI. Pastikan backend berjalan.', 'error');
        }
      } finally {
        if (!cancelled) setDirectoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCollabRequests([]);
      setRegistrations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [collabs, regs] = await Promise.all([
        dataService.getCollaborationRequests().catch(() => [] as CollaborationRequest[]),
        dataService.getRegistrations().catch(() => [] as RegistrationApplication[]),
      ]);
      if (cancelled) return;
      setCollabRequests(collabs);
      setRegistrations(regs);
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const navigateTo = (page: PageId, entityId?: string) => {
    if (entityId) {
      setSelectedEntityId(entityId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginAs = (user: UserSession) => {
    setCurrentUser(user);
    localAuth.saveSession(user);
    showToast(`Selamat datang kembali, ${user.name}! (${user.membershipTier})`, 'success');
    if (user.role === 'admin') {
      navigateTo('page-25-dashboard-admin');
    } else if (user.role === 'community_lead') {
      navigateTo('page-18-dashboard-community');
    } else {
      navigateTo('page-16-dashboard-user');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localAuth.clearSession();
    showToast('Anda telah keluar dari sesi.', 'info');
    navigateTo('page-01-home');
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'heritage' ? 'nocturnal' : 'heritage'));
    showToast(`Mode dialihkan ke ${themeMode === 'heritage' ? 'Nocturnal Prestige' : 'Heritage Modernism'}`, 'info');
  };

  const openCollabModalFor = (entity: Entity) => {
    if (!currentUser) {
      showToast('Masuk atau daftar terlebih dahulu untuk mengajukan kolaborasi.', 'warning');
      navigateTo('page-15-login');
      return;
    }
    setCollabTargetEntity(entity);
    setIsCollabModalOpen(true);
  };

  const submitCollabRequest = (data: Partial<CollaborationRequest>): string => {
    if (!currentUser) {
      showToast('Sesi tidak ditemukan. Silakan masuk kembali sebelum mengirim brief.', 'error');
      navigateTo('page-15-login');
      return '';
    }

    const trackingCode = `KP-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: CollaborationRequest = {
      id: `req-${Date.now()}`,
      trackingCode,
      title: data.title || 'Inisiatif Kolaborasi Ekosistem',
      category: data.category || 'Creative Campaign',
      requesterId: currentUser.entityId || currentUser.id,
      requesterName: currentUser.name,
      requesterType: (currentUser.entityType as any) || 'creator',
      targetId: data.targetId || (collabTargetEntity?.id ?? 'creator-1'),
      targetName: data.targetName || (collabTargetEntity?.name ?? 'Talenta KIRI'),
      targetType: data.targetType || (collabTargetEntity?.type ?? 'creator'),
      budget: data.budget || 'Rp 5.000.000',
      timeline: data.timeline || '2 Minggu',
      scope: data.scope || 'Deskripsi brief kerja sama',
      deliverables: data.deliverables || ['1x Video Konten', '1x Publikasi Sosial'],
      status: 'submitted',
      createdAt: 'Hari ini',
      adminNotes: 'Permintaan baru masuk. Menunggu verifikasi tim kurasi KIRI Project.',
    };

    dataService
      .submitCollaboration({
        title: newReq.title,
        category: newReq.category,
        targetId: newReq.targetId,
        targetName: newReq.targetName,
        targetType: newReq.targetType,
        budget: newReq.budget,
        timeline: newReq.timeline,
        scope: newReq.scope,
        deliverables: newReq.deliverables,
      })
      .then((saved) => {
        setCollabRequests((prev) =>
          prev.map((r) => (r.id === newReq.id ? { ...r, id: saved.id, trackingCode: saved.trackingCode } : r))
        );
        setSelectedCollabId(saved.id);
      })
      .catch(() => showToast('Brief tersimpan lokal, tetapi gagal dikirim ke server KIRI.', 'warning'));

    setCollabRequests((prev) => [newReq, ...prev]);
    setSelectedCollabId(newReq.id);
    showToast(`Pengajuan berhasil dikirim! Kode Pelacakan: ${trackingCode}`, 'success');
    return newReq.id;
  };

  const updateCollabStatus = (id: string, status: CollaborationRequest['status'], adminNotes?: string) => {
    if (!canManageCollaborations(currentUser)) {
      showToast('Hanya admin KIRI yang dapat mengubah status kolaborasi.', 'error');
      return;
    }
    setCollabRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status,
              adminNotes: adminNotes || req.adminNotes,
            }
          : req
      )
    );
    dataService.updateCollaboration(id, { status, adminNotes }).catch(() => {
      showToast('Gagal menyimpan perubahan status ke server.', 'error');
    });
    showToast(`Status kolaborasi diperbarui menjadi: ${status.toUpperCase()}`, 'info');
  };

  const addCommunityMember = (member: Partial<CommunityMember>) => {
    dataService
      .addMember({
        entityId: currentUser?.entityId,
        name: member.name,
        role: member.role,
        category: member.category,
        avatar: member.avatar,
        email: member.email,
        instagram: member.instagram,
        joinedDate: 'Hari ini',
        status: 'active',
      })
      .then((saved) => {
        setCommunityMembers((prev) => [saved, ...prev]);
        showToast(`Anggota "${saved.name}" berhasil ditambahkan ke database komunitas.`, 'success');
      })
      .catch(() => showToast('Gagal menambahkan anggota ke server.', 'error'));
  };

  const importCommunityMembers = (importedList: Partial<CommunityMember>[]) => {
    Promise.all(
      importedList.map((m) =>
        dataService
          .addMember({
            entityId: currentUser?.entityId,
            name: m.name,
            role: m.role,
            category: m.category,
            avatar: m.avatar,
            email: m.email,
            instagram: m.instagram,
            joinedDate: 'Import',
            status: 'active',
          })
          .catch(() => null)
      )
    ).then((savedList) => {
      const ok = savedList.filter((m): m is CommunityMember => m !== null);
      setCommunityMembers((prev) => [...ok, ...prev]);
      showToast(`Berhasil mengimpor ${ok.length} data anggota.`, 'success');
    });
  };

  const updateMemberStatus = (id: string, status: CommunityMember['status']) => {
    setCommunityMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    dataService.updateMemberStatus(id, status).catch(() => showToast('Gagal menyimpan status anggota.', 'error'));
    showToast('Status anggota diperbarui.', 'info');
  };

  const deleteMember = (id: string) => {
    setCommunityMembers((prev) => prev.filter((m) => m.id !== id));
    dataService.deleteMember(id).catch(() => showToast('Gagal menghapus anggota dari server.', 'error'));
    showToast('Anggota dihapus dari database terkontrol.', 'warning');
  };

  const submitRegistration = (data: Partial<RegistrationApplication>) => {
    const payload = {
      type: (data.type || 'creator') as RegistrationApplication['type'],
      name: data.name || 'Pendaftar Baru',
      contactPerson: data.contactPerson || data.name || 'Pemohon',
      email: data.email || 'applicant@kiri.id',
      phone: data.phone || '081234567890',
      city: data.city || 'Denpasar, Bali',
      category: data.category || 'Creative',
      socialLink: data.socialLink || 'instagram.com/kiri',
      details: data.details || 'Permohonan pendaftaran akun ekosistem KIRI Project.',
    };

    dataService
      .submitRegistration(payload)
      .then((saved) => {
        setRegistrations((prev) => {
          const exists = prev.some((r) => r.id === saved.id);
          return exists ? prev : [saved, ...prev];
        });
        showToast('Pendaftaran Anda telah diterima untuk verifikasi kurasi KIRI Project.', 'success');
      })
      .catch(() => {
        showToast('Gagal mengirim pendaftaran ke server KIRI.', 'error');
      });
  };

  const reviewRegistration = (id: string, status: 'approved' | 'rejected') => {
    if (!canManageCollaborations(currentUser)) {
      showToast('Hanya admin KIRI yang dapat memutuskan moderasi pendaftaran.', 'error');
      return;
    }
    dataService.reviewEntity(id, status === 'approved' ? 'approve' : 'reject').then((ok) => {
      if (!ok) {
        showToast('Gagal menyimpan keputusan moderasi.', 'error');
        return;
      }
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, status } : reg))
      );
      setEntities((prev) =>
        prev.map((ent) =>
          ent.id === id
            ? { ...ent, verified: status === 'approved', verificationStatus: status === 'approved' ? 'approved' as const : 'rejected' as const }
            : ent
        )
      );
      showToast(`Pendaftaran telah di-${status === 'approved' ? 'SETUJUI & DIAKTIFKAN' : 'TOLAK'}.`, status === 'approved' ? 'success' : 'warning');
    }).catch(() => {
      showToast('Gagal menyimpan keputusan moderasi.', 'error');
    });
  };

  const updateEntityProfile = (entityId: string, updates: Partial<Entity>) => {
    setEntities((prev) => prev.map((ent) => (ent.id === entityId ? { ...ent, ...updates } : ent)));
    dataService
      .updateEntity(entityId, {
        name: updates.name,
        handle: updates.handle,
        category: updates.category,
        bio: updates.bio,
        location: updates.location,
        website: updates.website,
      })
      .catch(() => showToast('Gagal menyimpan profil ke server.', 'error'));
    showToast('Perubahan profil berhasil disimpan!', 'success');
  };

  const sendBroadcastMessage = (data: { scope: 'indonesia' | 'regional'; region?: string; content: string }) => {
    if (!currentUser || !canBroadcast(currentUser)) {
      showToast('Anda tidak memiliki hak untuk mengirim siaran komunitas.', 'error');
      return;
    }

    dataService
      .sendBroadcast({
        scope: data.scope,
        region: data.scope === 'regional' ? data.region : undefined,
        content: data.content,
      })
      .then((saved) => {
        setBroadcastMessages((prev) => [...prev, saved]);
        showToast('Pesan siaran berhasil dikirim!', 'success');
      })
      .catch(() => showToast('Gagal mengirim siaran ke server.', 'error'));
  };

  const likeBroadcastMessage = (id: string) => {
    setBroadcastMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, likesCount: (msg.likesCount || 0) + 1 } : msg))
    );
    dataService.likeBroadcast(id).catch(() => undefined);
  };

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        selectedEntityId,
        selectedEntity,
        currentUser,
        loginAs,
        logout,
        themeMode,
        toggleTheme,
        entities,
        communityMembers,
        collabRequests,
        registrations,
        selectedCollabId,
        setSelectedCollabId,
        isCollabModalOpen,
        setIsCollabModalOpen,
        collabTargetEntity,
        openCollabModalFor,
        toasts,
        showToast,
        submitCollabRequest,
        updateCollabStatus,
        addCommunityMember,
        importCommunityMembers,
        updateMemberStatus,
        deleteMember,
        submitRegistration,
        reviewRegistration,
        updateEntityProfile,
        broadcastMessages,
        sendBroadcastMessage,
        likeBroadcastMessage,
        isMasterNavOpen,
        setIsMasterNavOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
