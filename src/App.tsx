import React, { useEffect, useState, lazy, Suspense } from 'react';
import { EkozProvider, useEkoz } from './context/EkozContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastNotification } from './components/layout/ToastNotification';
import { FeedView } from './components/feed/FeedView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { EventsView } from './components/events/EventsView';
import { ExperiencesView } from './components/experiences/ExperiencesView';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { WhatsAppPushModal } from './components/notifications/WhatsAppPushModal';
import { CaktoCheckoutModal } from './components/checkout/CaktoCheckoutModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LoginScreen } from './components/auth/LoginScreen';
import { api } from './services/api';
import { User } from './types';
import { ACADEMY_ENABLED } from './config/features';

// Views pesadas ou pouco usadas ficam em chunks separados, carregados só
// quando abertas — corta o bundle inicial (o VideoCallRoom puxa o LiveKit
// inteiro; o AdminView só interessa a staff; a Academy está em stand-by).
const VideoCallRoom = lazy(() =>
  import('./components/videocall/VideoCallRoom').then((m) => ({ default: m.VideoCallRoom })),
);
const AdminView = lazy(() =>
  import('./components/admin/AdminView').then((m) => ({ default: m.AdminView })),
);
const AcademyView = lazy(() =>
  import('./components/academy/AcademyView').then((m) => ({ default: m.AcademyView })),
);

const AppContent: React.FC = () => {
  const { activeTab } = useEkoz();

  return (
    <div className="ekoz-app-root">
      <Navbar />

      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <div className="page-wrapper">
            <Suspense fallback={<div className="lazy-view-loading">Carregando...</div>}>
              {activeTab === 'feed' && <FeedView />}
              {ACADEMY_ENABLED && activeTab === 'academy' && <AcademyView />}
              {activeTab === 'marketplace' && <MarketplaceView />}
              {activeTab === 'events' && <EventsView />}
              {activeTab === 'experiences' && <ExperiencesView />}
              {activeTab === 'videocall' && <VideoCallRoom />}
              {activeTab === 'admin' && <AdminView />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Persistent Global Modals & Drawers */}
      <ChatDrawer />
      <WhatsAppPushModal />
      <CaktoCheckoutModal />
      <EditProfileModal />
      <ToastNotification />
      <MobileBottomNav />
    </div>
  );
};

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

export const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [authedUser, setAuthedUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const token = api.getToken();
      if (!token) {
        setAuthState('unauthenticated');
        return;
      }
      try {
        const res = await api.getMe();
        setAuthedUser(res.user);
        setAuthState('authenticated');
      } catch {
        api.logout();
        setAuthState('unauthenticated');
      }
    };
    checkSession();
  }, []);

  if (authState === 'checking') {
    return (
      <div className="login-screen-root">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando...</span>
      </div>
    );
  }

  if (authState === 'unauthenticated' || !authedUser) {
    return (
      <LoginScreen
        onSuccess={(user) => {
          setAuthedUser(user);
          setAuthState('authenticated');
        }}
      />
    );
  }

  return (
    <EkozProvider initialUser={authedUser}>
      <AppContent />
    </EkozProvider>
  );
};

export default App;
