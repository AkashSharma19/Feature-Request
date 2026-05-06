import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Flame, Layout, ChevronDown, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import SummaryCards from '../components/dashboard/SummaryCards';
import FilterBar from '../components/dashboard/FilterBar';
import RequestTable from '../components/dashboard/RequestTable';
import CreateRequestModal from '../components/requests/CreateRequestModal';
import { Button, Card, Select } from '../components/ui';
import { useAdmin } from '../lib/useAdmin';
import { cn } from '../lib/utils';


const DEFAULT_FILTERS = { search: '', status: '', category: '', sort: 'votes', scope: 'all' };

export default function DashboardPage() {
  const isAdmin = useAdmin();
  const { orgId: urlOrgId, boardId } = useParams();
  const navigate = useNavigate();
  const { requests, user, boards, userOrg, subscribeToAll, activeOrgId } = useStore();

  // Handle subscription switching
  useEffect(() => {
    const targetOrgId = urlOrgId || userOrg?.id;
    if (targetOrgId && activeOrgId !== targetOrgId) {
      const unsub = subscribeToAll(targetOrgId);
      return () => unsub && unsub();
    }
  }, [urlOrgId, userOrg, subscribeToAll, activeOrgId]);


  const { pathname } = useLocation();
  const isRestricted = !isAdmin && !boardId && !urlOrgId;
  // If we have an orgId but no boardId, we are in 'All Boards' mode, which is allowed for guests.


  if (isRestricted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <Layout size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Board Portal</h1>
        <p className="text-gray-500 max-w-md mb-8">
          To view and submit feedback, please use the specific board link provided by your administrator.
        </p>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-400 italic">
          Are you an admin? Navigate to the <button onClick={() => navigate('/admin/settings')} className="text-teal-600 font-bold hover:underline">Admin Settings</button> to manage boards.
        </div>
      </div>
    );
  }

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [showCreate, setShowCreate] = useState(false);
  const [editData, setEditData] = useState(null);

  const activeBoard = useMemo(() => {
    if (!boardId) return null;
    return boards.find(b => b.id === boardId);
  }, [boardId, boards]);

  const filtered = useMemo(() => {
    let res = [...requests];

    // Board Filter (Include unassigned requests in board views, but show all if boardId is 'all')
    if (boardId && boardId !== 'all') {
      res = res.filter(r => r.boardId === boardId || !r.boardId);
    }

    // Scope (My Requests)
    if (filters.scope === 'mine') {
      res = res.filter((r) => r.userId === user?.uid || r.requestedBy === 'Admin User' || r.requestedBy === 'Guest User');
      // Note: Since this is a demo, we match against multiple placeholders if userId is missing
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      res = res.filter(
        (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }

    // Status
    if (filters.status) {
      if (filters.status === 'Overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        res = res.filter((r) => r.deadline && new Date(r.deadline) < today && !['Closed', 'Tested', 'Cancelled'].includes(r.status));
      } else {
        res = res.filter((r) => r.status === filters.status);
      }
    }


    // Category
    if (filters.category) res = res.filter((r) => r.category === filters.category);

    // Sort
    switch (filters.sort) {
      case 'newest': res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': res.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'progress': res.sort((a, b) => b.progress - a.progress); break;
      default: res.sort((a, b) => b.votes - a.votes); // votes
    }

    // Pinned always on top
    res.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return res;
  }, [requests, filters, boardId, user]);

  const handleEdit = (req) => {
    setEditData(req);
    setShowCreate(true);
  };

  const handleModalClose = () => {
    setShowCreate(false);
    setEditData(null);
  };



  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all",
            activeBoard ? "bg-teal-50 text-teal-600" : "bg-indigo-50 text-indigo-600"
          )}>
            {activeBoard ? <Layout size={24} /> : <Flame size={24} />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeBoard ? activeBoard.name : 'Main Feedback Feed'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeBoard ? `Viewing requests for ${activeBoard.name}` : 'Explore and upvote the best ideas across all boards.'}
            </p>
          </div>
        </div>
        
        {(isAdmin || urlOrgId) && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active View</p>
              <p className="text-xs font-semibold text-gray-700">{boardId ? 'Switch Board' : 'Organization View'}</p>
            </div>
            <div className="w-48">
              <Select 
                value={boardId || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  const org = urlOrgId || userOrg?.id;
                  navigate(val ? `/b/${org}/${val}` : `/b/${org}/all`);
                }}
                className="py-1.5 text-xs font-bold text-gray-700 bg-white border-gray-200 shadow-sm hover:border-teal-300 transition-all cursor-pointer"
              >
                <option value="">All Boards</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

      </div>


      {/* Summary Cards */}
      <SummaryCards requests={filtered} />

      {/* Main Card */}
      <Card>
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
            <button
              onClick={() => setFilters(f => ({ ...f, scope: 'all' }))}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                filters.scope === 'all' 
                  ? "bg-white text-teal-700 shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              All Requests
            </button>
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                setFilters(f => ({ ...f, scope: 'mine' }));
              }}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                filters.scope === 'mine' 
                  ? "bg-white text-teal-700 shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              My Requests
              {filters.scope === 'mine' && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500"></span>
              )}
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setShowCreate(true);
            }}
            id="new-request-btn"
          >
            <Plus size={15} />
            {activeBoard ? 'Submit Feedback' : 'New Feature Request'}
          </Button>
        </div>

        <div className="px-6 py-4 border-b border-gray-50">
          <FilterBar
            filters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-fade-in">
              <Layout size={40} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-sm font-bold text-gray-900">No Feedback Yet</h3>
              <p className="text-xs text-gray-500 mt-1">This organization doesn't have any requests in its database yet.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-fade-in">
              <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-sm font-bold text-gray-900">No Matches Found</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your filters to see more requests.</p>
            </div>
          ) : (
            <RequestTable requests={filtered} onEdit={handleEdit} />
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateRequestModal
        open={showCreate}
        onClose={handleModalClose}
        editData={editData}
        forcedBoardId={boardId}
      />
    </div>
  );
}

