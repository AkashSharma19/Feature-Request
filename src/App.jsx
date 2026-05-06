import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import RequestDetailPage from './pages/RequestDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WelcomePage from './pages/WelcomePage';
import ChangelogsPage from './pages/ChangelogsPage';
import EmailsPage from './pages/EmailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/changelogs" element={<ChangelogsPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/requests/:id" element={<RequestDetailPage />} />
          <Route path="/admin/roadmap" element={<RoadmapPage />} />
          <Route path="/admin/changelogs" element={<ChangelogsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/emails" element={<EmailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
