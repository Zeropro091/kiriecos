import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  Entity,
  CommunityMember,
  CollaborationRequest,
  RegistrationApplication,
  UserSession,
} from '../types';
import {
  INITIAL_ENTITIES,
  INITIAL_COMMUNITY_MEMBERS,
  INITIAL_COLLAB_REQUESTS,
  INITIAL_REGISTRATIONS,
  DEFAULT_USERS,
} from '../data/mockData';

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
  isMasterNavOpen: boolean;
  setIsMasterNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('page-01-home');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('creator-1');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('kiri_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0]; // default logged in as Raka Dewantara for rich demo
  });
  const [themeMode, setThemeMode] = useState<'heritage' | 'nocturnal'>('heritage');
  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('kiri_entities');
    return saved ? JSON.parse(saved) : INITIAL_ENTITIES;
  });
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>(() => {
    const saved = localStorage.getItem('kiri_members');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_MEMBERS;
  });
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(() => {
    const saved = localStorage.getItem('kiri_collabs');
    return saved ? JSON.parse(saved) : INITIAL_COLLAB_REQUESTS;
  });
  const [registrations, setRegistrations] = useState<RegistrationApplication[]>(() => {
    const saved = localStorage.getItem('kiri_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState<boolean>(false);
  const [collabTargetEntity, setCollabTargetEntity] = useState<Entity | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isMasterNavOpen, setIsMasterNavOpen] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('kiri_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kiri_entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    localStorage.setItem('kiri_members', JSON.stringify(communityMembers));
  }, [communityMembers]);

  useEffect(() => {
    localStorage.setItem('kiri_collabs', JSON.stringify(collabRequests));
  }, [collabRequests]);

  useEffect(() => {
    localStorage.setItem('kiri_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Handle Theme class on body
  useEffect(() => {
    if (themeMode === 'nocturnal') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

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
    showToast('Anda telah keluar dari sesi.', 'info');
    navigateTo('page-01-home');
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'heritage' ? 'nocturnal' : 'heritage'));
    showToast(`Mode dialihkan ke ${themeMode === 'heritage' ? 'Nocturnal Prestige' : 'Heritage Modernism'}`, 'info');
  };

  const openCollabModalFor = (entity: Entity) => {
    setCollabTargetEntity(entity);
    setIsCollabModalOpen(true);
  };

  const submitCollabRequest = (data: Partial<CollaborationRequest>): string => {
    const trackingCode = `KP-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: CollaborationRequest = {
      id: `req-${Date.now()}`,
      trackingCode,
      title: data.title || 'Inisiatif Kolaborasi Ekosistem',
      category: data.category || 'Creative Campaign',
      requesterId: currentUser?.entityId || 'biz-user',
      requesterName: currentUser?.name || 'Partner Pengaju',
      requesterType: (currentUser?.entityType as any) || 'business',
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

    setCollabRequests((prev) => [newReq, ...prev]);
    setSelectedCollabId(newReq.id);
    showToast(`Pengajuan berhasil dikirim! Kode Pelacakan: ${trackingCode}`, 'success');
    return newReq.id;
  };

  const updateCollabStatus = (id: string, status: CollaborationRequest['status'], adminNotes?: string) => {
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
    showToast(`Status kolaborasi diperbarui menjadi: ${status.toUpperCase()}`, 'info');
  };

  const addCommunityMember = (member: Partial<CommunityMember>) => {
    const newMember: CommunityMember = {
      id: `mem-${Date.now()}`,
      name: member.name || 'Anggota Baru',
      role: member.role || 'Active Creator',
      category: member.category || 'Visual Art',
      avatar: member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      joinedDate: 'Hari ini',
      email: member.email || 'member@kiri.id',
      instagram: member.instagram || '@memberkiri',
      status: member.status || 'active',
    };
    setCommunityMembers((prev) => [newMember, ...prev]);
    showToast(`Anggota "${newMember.name}" berhasil ditambahkan ke database komunitas.`, 'success');
  };

  const importCommunityMembers = (importedList: Partial<CommunityMember>[]) => {
    const formatted = importedList.map((m, idx) => ({
      id: `mem-${Date.now()}-${idx}`,
      name: m.name || 'Member Terimpor',
      role: m.role || 'Contributor',
      category: m.category || 'Creative General',
      avatar: m.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      joinedDate: 'Import 2026',
      email: m.email || `imported${idx}@kiri.id`,
      instagram: m.instagram || '@kiri.creator',
      status: 'active' as const,
    }));
    setCommunityMembers((prev) => [...formatted, ...prev]);
    showToast(`Berhasil mengimpor ${formatted.length} data anggota secara simultan!`, 'success');
  };

  const updateMemberStatus = (id: string, status: CommunityMember['status']) => {
    setCommunityMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    showToast('Status anggota diperbarui.', 'info');
  };

  const deleteMember = (id: string) => {
    setCommunityMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Anggota dihapus dari database terkontrol.', 'warning');
  };

  const submitRegistration = (data: Partial<RegistrationApplication>) => {
    const newApp: RegistrationApplication = {
      id: `reg-${Date.now()}`,
      type: data.type || 'creator',
      name: data.name || 'Pendaftar Baru',
      contactPerson: data.contactPerson || data.name || 'Pemohon',
      email: data.email || 'applicant@kiri.id',
      phone: data.phone || '081234567890',
      city: data.city || 'Denpasar, Bali',
      category: data.category || 'Creative',
      socialLink: data.socialLink || 'instagram.com/kiri',
      details: data.details || 'Permohonan pendaftaran akun ekosistem KIRI Project.',
      status: 'pending',
      submittedAt: 'Hari ini',
    };
    setRegistrations((prev) => [newApp, ...prev]);
    showToast('Pendaftaran Anda telah diterima untuk verifikasi kurasi KIRI Project.', 'success');
  };

  const reviewRegistration = (id: string, status: 'approved' | 'rejected') => {
    setRegistrations((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, status } : reg))
    );
    showToast(`Pendaftaran telah di-${status === 'approved' ? 'SETUJUI & DIAKTIFKAN' : 'TOLAK'}.`, status === 'approved' ? 'success' : 'warning');
  };

  const updateEntityProfile = (entityId: string, updates: Partial<Entity>) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.id === entityId ? { ...ent, ...updates } : ent))
    );
    showToast('Perubahan profil berhasil disimpan!', 'success');
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
