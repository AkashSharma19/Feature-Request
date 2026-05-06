import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Map, BarChart3, Settings,
  ChevronLeft, ChevronRight, Zap, Star, Megaphone, Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/changelogs', label: 'Changelogs', icon: Megaphone },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },

  { to: '/settings', label: 'Settings', icon: Settings },
];


import { useAdmin } from '../../lib/useAdmin';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = useAdmin();
  const { orgId } = useParams();
  const location = useLocation();

  const getPath = (path) => {
    if (isAdmin) {
      if (path === '/dashboard') return '/admin';
      return `/admin${path}`;
    }
    // For Guests, we need to preserve the orgId context
    if (orgId) {
      if (path === '/dashboard') return `/b/${orgId}/all`; // Fallback to a 'all' boards view if they click dashboard
      return `/b/${orgId}${path}`;
    }
    return path;
  };


  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out shadow-sm',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm">
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-700 text-gray-900 leading-tight font-bold">Coach</p>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">ADMIN PANEL</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[84px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} className="text-gray-500" /> : <ChevronLeft size={12} className="text-gray-500" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest animate-fade-in">
            Main Menu
          </p>
        )}
        {NAV_ITEMS.filter(item => {
          if (!isAdmin) {
            return !['Analytics', 'Settings'].includes(item.label);
          }
          return true;
        }).map(({ to, label, icon: Icon }) => {


          const path = getPath(to);
          const current = location.pathname;
          
          let isActive = false;
          if (label === 'Dashboard') {
            if (isAdmin) {
              isActive = current === '/admin' || current.startsWith('/admin/requests/');
            } else if (orgId) {
              isActive = current === `/b/${orgId}/all` || current.includes('/requests/');
            }
          } else {
            isActive = current.startsWith(path);
          }

          return (
            <NavLink
              key={to}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-teal-600' : 'text-gray-400'
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 animate-fade-in" />
              )}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}
