import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAdmin } from '../../lib/useAdmin';
import { Select } from '../ui';

export default function Header({ onSearch }) {
  const isAdmin = useAdmin();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between min-h-[64px]">
      <div>
        {/* Placeholder for left side elements if needed in future (e.g., breadcrumbs) */}
      </div>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded uppercase tracking-wider">
            Admin View
          </span>
        )}
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
