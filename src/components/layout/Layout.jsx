import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SupportBot from '../bot/SupportBot';
import { useAdmin } from '../../lib/useAdmin';

export default function Layout() {
  const isAdmin = useAdmin();
  const { pathname } = useLocation();
  const isWelcome = pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {!isAdmin && !isWelcome && <SupportBot />}
    </div>
  );
}
