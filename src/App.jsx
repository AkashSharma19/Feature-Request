import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import RequestDetailPage from './pages/RequestDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WelcomePage from './pages/WelcomePage';
import ChangelogsPage from './pages/ChangelogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
