import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../lib/useAdmin';
import { Select, Button } from '../ui';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';

export default function Header({ onSearch, onMenuClick }) {
  const isAdmin = useAdmin();
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between min-h-[64px]">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded uppercase tracking-wider hidden sm:inline">
            Admin View
          </span>
        )}

        {user ? (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.displayName?.[0] || user.email?.[0] || 'A'}
              </div>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform", showUserMenu && "rotate-180")} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in z-50">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/settings');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon size={14} />
                  View Profile
                </button>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 gap-2"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        )}
      </div>
    </header>
  );
}

// Internal helper for cn since it might not be imported in every component file
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
