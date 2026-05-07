import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import ChangelogsPage from './pages/ChangelogsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import { useStore } from './store/useStore';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userOrg, isAuthLoading } = useStore();

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !userOrg) return <Navigate to="/onboarding" replace />;

  return children;
}

export default function App() {
  const { initAuth } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Landing */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Guest Board Portal */}
        <Route element={<Layout />}>
          <Route path="/b/:orgId" element={<Navigate to="all" replace />} />
          <Route path="/b/:orgId/all" element={<DashboardPage />} />
          <Route path="/b/:orgId/roadmap" element={<RoadmapPage />} />
          <Route path="/b/:orgId/changelogs" element={<ChangelogsPage />} />
          <Route path="/b/:orgId/requests/:id" element={<RequestDetailPage />} />
          <Route path="/b/:orgId/:boardId" element={<DashboardPage />} />
        </Route>

        {/* Admin / Authenticated Workspace */}
        <Route element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/roadmap" element={<RoadmapPage />} />
          <Route path="/admin/changelogs" element={<ChangelogsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/requests/:id" element={<RequestDetailPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
