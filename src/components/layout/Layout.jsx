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

  const showNav = isAdmin || boardId || orgId;


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showNav && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showNav && <Header />}
        <main className={cn("flex-1 overflow-y-auto", !showNav && "bg-white")}>
          <div className={cn(!showNav && "max-w-7xl mx-auto w-full")}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

