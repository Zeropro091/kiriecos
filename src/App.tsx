import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { isAdmin } from './lib/access';
import { PageId } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CollabRequestModal } from './components/CollabRequestModal';
import { ToastContainer } from './components/ToastContainer';
import { MasterNavDrawer } from './components/MasterNavDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Home + directory load eagerly (first paint); every other page is split into
// its own chunk so the initial bundle stays small and the app stays responsive.
import { Page01Home } from './pages/Page01Home';
import { Page02Directory } from './pages/Page02Directory';

const Page03CommunityProfile = lazyPage(() => import('./pages/Page03CommunityProfile'), 'Page03CommunityProfile');
const Page04CreatorProfile = lazyPage(() => import('./pages/Page04CreatorProfile'), 'Page04CreatorProfile');
const Page05BusinessProfile = lazyPage(() => import('./pages/Page05BusinessProfile'), 'Page05BusinessProfile');
const Page06MediaProfile = lazyPage(() => import('./pages/Page06MediaProfile'), 'Page06MediaProfile');
const Page07PartnerProfile = lazyPage(() => import('./pages/Page07PartnerProfile'), 'Page07PartnerProfile');
const Page08JoinSelect = lazyPage(() => import('./pages/Page08JoinSelect'), 'Page08JoinSelect');
const Page09RegisterCreator = lazyPage(() => import('./pages/Page09RegisterCreator'), 'Page09RegisterCreator');
const Page10RegisterCommunity = lazyPage(() => import('./pages/Page10RegisterCommunity'), 'Page10RegisterCommunity');
const Page11RegisterBusiness = lazyPage(() => import('./pages/Page11RegisterBusiness'), 'Page11RegisterBusiness');
const Page12RegisterMedia = lazyPage(() => import('./pages/Page12RegisterMedia'), 'Page12RegisterMedia');
const Page13RegisterPartner = lazyPage(() => import('./pages/Page13RegisterPartner'), 'Page13RegisterPartner');
const Page14MembershipPayment = lazyPage(() => import('./pages/Page14MembershipPayment'), 'Page14MembershipPayment');
const Page14ACreatorPricing = lazyPage(() => import('./pages/Page14ACreatorPricing'), 'Page14ACreatorPricing');
const Page14BBusinessPricing = lazyPage(() => import('./pages/Page14BBusinessPricing'), 'Page14BBusinessPricing');
const Page15Login = lazyPage(() => import('./pages/Page15Login'), 'Page15Login');
const Page16DashboardUser = lazyPage(() => import('./pages/Page16DashboardUser'), 'Page16DashboardUser');
const Page17ProfileEditor = lazyPage(() => import('./pages/Page17ProfileEditor'), 'Page17ProfileEditor');
const Page18DashboardCommunity = lazyPage(() => import('./pages/Page18DashboardCommunity'), 'Page18DashboardCommunity');
const Page19CommunityMembers = lazyPage(() => import('./pages/Page19CommunityMembers'), 'Page19CommunityMembers');
const Page20CollabGateway = lazyPage(() => import('./pages/Page20CollabGateway'), 'Page20CollabGateway');
const Page21CollabBriefForm = lazyPage(() => import('./pages/Page21CollabBriefForm'), 'Page21CollabBriefForm');
const Page22CollabSuccess = lazyPage(() => import('./pages/Page22CollabSuccess'), 'Page22CollabSuccess');
const Page23MyCollaborations = lazyPage(() => import('./pages/Page23MyCollaborations'), 'Page23MyCollaborations');
const Page24LoginAdmin = lazyPage(() => import('./pages/Page24LoginAdmin'), 'Page24LoginAdmin');
const Page25DashboardAdmin = lazyPage(() => import('./pages/Page25DashboardAdmin'), 'Page25DashboardAdmin');
const Page26AdminReviews = lazyPage(() => import('./pages/Page26AdminReviews'), 'Page26AdminReviews');
const Page27RequestFlowchart = lazyPage(() => import('./pages/Page27RequestFlowchart'), 'Page27RequestFlowchart');
const Page28BrandLandingPage = lazyPage(() => import('./pages/Page28BrandLandingPage'), 'Page28BrandLandingPage');
const Page29Broadcast = lazyPage(() => import('./pages/Page29Broadcast'), 'Page29Broadcast');
const Page30MemberCard = lazyPage(() => import('./pages/Page30MemberCard'), 'Page30MemberCard');
const Page31LandingOrder = lazyPage(() => import('./pages/Page31LandingOrder'), 'Page31LandingOrder');
const Page32Chat = lazyPage(() => import('./pages/Page32Chat'), 'Page32Chat');

import { FolderGit2, Sparkles, ShieldAlert } from 'lucide-react';

function lazyPage<K extends string>(
  loader: () => Promise<Record<K, React.ComponentType>>,
  name: K,
) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

const PageFallback: React.FC = () => (
  <div className="max-w-lg mx-auto px-4 py-24 text-center text-sm text-muted-foreground" role="status">
    Memuat halaman…
  </div>
);

const ADMIN_PAGES: PageId[] = ['page-25-dashboard-admin', 'page-26-admin-reviews'];

// S12: pages that must never render for a signed-out visitor. Previously the
// dashboards, member card, chat inbox, profile editor, and collaboration pages
// could be opened anonymously (most of them crashing on missing data).
const AUTH_PAGES: PageId[] = [
  'page-14-membership-payment',
  'page-16-dashboard-user',
  'page-17-profile-editor',
  'page-18-dashboard-community',
  'page-19-community-members',
  'page-23-my-collaborations',
  'page-30-member-card',
  'page-31-landing-order',
  'page-32-chat',
];

const AuthRequired: React.FC = () => {
  const { navigateTo } = useApp();
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Masuk Diperlukan</h1>
      <p className="text-sm text-muted-foreground">
        Halaman ini hanya untuk anggota KIRI PROJECT. Silakan masuk atau buat akun terlebih dahulu.
      </p>
      <button
        onClick={() => navigateTo('page-15-login')}
        className="px-6 py-2.5 rounded-xl bg-granite-900 text-white dark:bg-olive-500 dark:text-granite-950 text-xs font-bold"
      >
        Masuk / Daftar
      </button>
    </div>
  );
};

const AdminAccessDenied: React.FC = () => {
  const { navigateTo, currentUser } = useApp();
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Akses Ditolak</h1>
      <p className="text-sm text-muted-foreground">
        {currentUser
          ? 'Akun Anda tidak memiliki hak administrator KIRI untuk membuka halaman ini.'
          : 'Halaman ini hanya untuk administrator KIRI. Silakan masuk dengan akun admin terlebih dahulu.'}
      </p>
      <button
        onClick={() => navigateTo(currentUser ? 'page-01-home' : 'page-24-login-admin')}
        className="px-6 py-2.5 rounded-xl bg-granite-900 text-white dark:bg-olive-500 dark:text-granite-950 text-xs font-bold"
      >
        {currentUser ? 'Kembali ke Beranda' : 'Masuk sebagai Admin'}
      </button>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentPage, currentUser } = useApp();

  const renderCurrentPage = () => {
    if (ADMIN_PAGES.includes(currentPage) && !isAdmin(currentUser)) {
      return <AdminAccessDenied />;
    }

    if (AUTH_PAGES.includes(currentPage) && !currentUser) {
      return <AuthRequired />;
    }

    switch (currentPage) {
      case 'page-01-home':
        return <Page01Home />;
      case 'page-02-directory':
        return <Page02Directory />;
      case 'page-03-community-profile':
        return <Page03CommunityProfile />;
      case 'page-04-creator-profile':
        return <Page04CreatorProfile />;
      case 'page-05-business-profile':
        return <Page05BusinessProfile />;
      case 'page-06-media-profile':
        return <Page06MediaProfile />;
      case 'page-07-partner-profile':
        return <Page07PartnerProfile />;
      case 'page-08-join-select':
        return <Page08JoinSelect />;
      case 'page-09-register-creator':
        return <Page09RegisterCreator />;
      case 'page-10-register-community':
        return <Page10RegisterCommunity />;
      case 'page-11-register-business':
        return <Page11RegisterBusiness />;
      case 'page-12-register-media':
        return <Page12RegisterMedia />;
      case 'page-13-register-partner':
        return <Page13RegisterPartner />;
      case 'page-14-membership-payment':
        return <Page14MembershipPayment />;
      case 'page-14a-creator-pricing':
        return <Page14ACreatorPricing />;
      case 'page-14b-business-pricing':
        return <Page14BBusinessPricing />;
      case 'page-15-login':
        return <Page15Login />;
      case 'page-16-dashboard-user':
        return <Page16DashboardUser />;
      case 'page-17-profile-editor':
        return <Page17ProfileEditor />;
      case 'page-18-dashboard-community':
        return <Page18DashboardCommunity />;
      case 'page-19-community-members':
        return <Page19CommunityMembers />;
      case 'page-20-collab-request-modal':
        return <Page20CollabGateway />;
      case 'page-21-collab-brief-form':
        return <Page21CollabBriefForm />;
      case 'page-22-collab-success':
        return <Page22CollabSuccess />;
      case 'page-23-my-collaborations':
        return <Page23MyCollaborations />;
      case 'page-24-login-admin':
        return <Page24LoginAdmin />;
      case 'page-25-dashboard-admin':
        return <Page25DashboardAdmin />;
      case 'page-26-admin-reviews':
        return <Page26AdminReviews />;
      case 'page-27-request-flowchart':
        return <Page27RequestFlowchart />;
      case 'page-28-brand-landing-page':
        return <Page28BrandLandingPage />;
      case 'page-29-broadcast':
        return <Page29Broadcast />;
      case 'page-30-member-card':
        return <Page30MemberCard />;
      case 'page-31-landing-order':
        return <Page31LandingOrder />;
      case 'page-32-chat':
        return <Page32Chat />;
      default:
        return <Page01Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        <ErrorBoundary resetKey={currentPage}>
          <Suspense fallback={<PageFallback />}>{renderCurrentPage()}</Suspense>
        </ErrorBoundary>
      </main>

      <Footer />

      {/* Global Modals and Notifications */}
      <CollabRequestModal />
      <MasterNavDrawer />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
