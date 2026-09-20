import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CollabRequestModal } from './components/CollabRequestModal';
import { ToastContainer } from './components/ToastContainer';
import { MasterNavDrawer } from './components/MasterNavDrawer';

// Import all 27 Pages
import { Page01Home } from './pages/Page01Home';
import { Page02Directory } from './pages/Page02Directory';
import { Page03CommunityProfile } from './pages/Page03CommunityProfile';
import { Page04CreatorProfile } from './pages/Page04CreatorProfile';
import { Page05BusinessProfile } from './pages/Page05BusinessProfile';
import { Page06MediaProfile } from './pages/Page06MediaProfile';
import { Page07PartnerProfile } from './pages/Page07PartnerProfile';
import { Page08JoinSelect } from './pages/Page08JoinSelect';
import { Page09RegisterCreator } from './pages/Page09RegisterCreator';
import { Page10RegisterCommunity } from './pages/Page10RegisterCommunity';
import { Page11RegisterBusiness } from './pages/Page11RegisterBusiness';
import { Page12RegisterMedia } from './pages/Page12RegisterMedia';
import { Page13RegisterPartner } from './pages/Page13RegisterPartner';
import { Page14MembershipPayment } from './pages/Page14MembershipPayment';
import { Page15Login } from './pages/Page15Login';
import { Page16DashboardUser } from './pages/Page16DashboardUser';
import { Page17ProfileEditor } from './pages/Page17ProfileEditor';
import { Page18DashboardCommunity } from './pages/Page18DashboardCommunity';
import { Page19CommunityMembers } from './pages/Page19CommunityMembers';
import { Page20CollabGateway } from './pages/Page20CollabGateway';
import { Page21CollabBriefForm } from './pages/Page21CollabBriefForm';
import { Page22CollabSuccess } from './pages/Page22CollabSuccess';
import { Page23MyCollaborations } from './pages/Page23MyCollaborations';
import { Page24LoginAdmin } from './pages/Page24LoginAdmin';
import { Page25DashboardAdmin } from './pages/Page25DashboardAdmin';
import { Page26AdminReviews } from './pages/Page26AdminReviews';
import { Page27RequestFlowchart } from './pages/Page27RequestFlowchart';
import { Page28BrandLandingPage } from './pages/Page28BrandLandingPage';

import { FolderGit2, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentPage, setIsMasterNavOpen } = useApp();

  const renderCurrentPage = () => {
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
      default:
        return <Page01Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-kiri-ivory dark:bg-kiri-dark-900 text-kiri-dark-900 dark:text-kiri-ivory transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {renderCurrentPage()}
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
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
