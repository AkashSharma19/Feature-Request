import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAdmin } from '../../lib/useAdmin';
import { cn } from '../../lib/utils';


export default function Layout() {
  const isAdmin = useAdmin();
  const { boardId, orgId: urlOrgId } = useParams();
  const { pathname } = useLocation();
  const isWelcome = pathname === '/welcome';
  const { activeOrgId, requests, user } = useStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  const showNav = isAdmin || boardId || urlOrgId;


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {showNav && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showNav && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showNav && (
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        )}
        <main 
          ref={mainRef}
          className={cn("flex-1 overflow-y-auto", !showNav && "bg-white")}
        >
          <div className={cn(!showNav && "max-w-7xl mx-auto w-full")}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

