import React from 'react';
import { EkozProvider, useEkoz } from './context/EkozContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastNotification } from './components/layout/ToastNotification';
import { FeedView } from './components/feed/FeedView';
import { AcademyView } from './components/academy/AcademyView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { EventsView } from './components/events/EventsView';
import { ExperiencesView } from './components/experiences/ExperiencesView';
import { VideoCallRoom } from './components/videocall/VideoCallRoom';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { WhatsAppPushModal } from './components/notifications/WhatsAppPushModal';
import { CaktoCheckoutModal } from './components/checkout/CaktoCheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

const AppContent: React.FC = () => {
  const { activeTab, authModalOpen, setAuthModalOpen } = useEkoz();

  return (
    <div className="ekoz-app-root">
      <Navbar />

      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <div className="page-wrapper">
            {activeTab === 'feed' && <FeedView />}
            {activeTab === 'academy' && <AcademyView />}
            {activeTab === 'marketplace' && <MarketplaceView />}
            {activeTab === 'events' && <EventsView />}
            {activeTab === 'experiences' && <ExperiencesView />}
            {activeTab === 'videocall' && <VideoCallRoom />}
          </div>
        </main>
      </div>

      {/* Persistent Global Modals & Drawers */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ChatDrawer />
      <WhatsAppPushModal />
      <CaktoCheckoutModal />
      <ToastNotification />
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EkozProvider>
      <AppContent />
    </EkozProvider>
  );
};

export default App;
