import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAdmin } from '../../lib/useAdmin';
import { Select } from '../ui';

const PAGE_TITLES = {
  '/': { title: 'Welcome', subtitle: 'Help us shape the future of our product' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Manage and track all feature requests' },
  '/roadmap': { title: 'Roadmap', subtitle: 'Plan and visualize your product roadmap' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights into your feature pipeline' },
};

export default function Header({ onSearch }) {
  const location = useLocation();
  const isAdmin = useAdmin();
  
  // Strip /admin from path for lookup
  const baseOuterPath = location.pathname.replace(/^\/admin/, '') || '/';
  const isDetail = baseOuterPath.startsWith('/requests/');
  
  const info = isDetail
    ? { title: 'Feature Detail', subtitle: 'View and manage feature request details' }
    : PAGE_TITLES[baseOuterPath] || { title: 'FeatureFlow', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between min-h-[64px]">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{info.title}</h1>
            {isAdmin && (
              <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Organization Switcher */}
        <div className="hidden md:block w-40">
          <Select className="py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border-gray-200">
            <option>Acme Corporation</option>
            <option>Globex Inc.</option>
            <option>Soylent Corp</option>
            <option>Initech</option>
          </Select>
        </div>
        
        <button className="relative w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100">
          <Bell size={15} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}
