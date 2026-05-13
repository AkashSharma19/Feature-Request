import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, BarChart3, Settings,
  ChevronLeft, ChevronRight, Zap, Star, Megaphone, Mail, Handshake
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/changelogs', label: 'Changelogs', icon: Megaphone },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },

  { to: '/settings', label: 'Settings', icon: Settings },
];


import { useAdmin } from '../../lib/useAdmin';

export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = useAdmin();
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userOrg } = useStore();

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
        'fixed lg:relative flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out shadow-sm z-50',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'lg:w-16' : 'lg:w-60 w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
          <Handshake size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-bold text-gray-900 leading-tight tracking-tight uppercase">Hand Shake</p>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">ADMIN PANEL</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[84px] w-6 h-6 bg-white border border-gray-200 rounded-full hidden lg:flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
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
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative',
                isActive
                  ? 'bg-gray-900 text-white shadow-md shadow-gray-300 scale-[1.02]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-fade-in" />
              )}
            </NavLink>
          );
        })}

        {/* Workspace Switcher for Admins in Guest Portal */}
        {!isAdmin && userOrg && !collapsed && (
          <div className="mt-8 px-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-gray-900 shadow-lg shadow-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Workspace</p>
              <p className="text-xs font-bold text-white truncate mb-3">{userOrg.name}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full py-1.5 text-[10px] bg-white text-gray-900 hover:bg-gray-100 border-none"
                onClick={() => navigate('/admin')}
              >
                Go to Admin
              </Button>
            </div>
          </div>
        )}
      </nav>

    </aside>
  );
}
