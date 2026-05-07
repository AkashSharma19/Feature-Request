import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Flame, Layout, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import SummaryCards from '../components/dashboard/SummaryCards';
import FilterBar from '../components/dashboard/FilterBar';
import RequestTable from '../components/dashboard/RequestTable';
import RequestCard from '../components/dashboard/RequestCard';
import CreateRequestModal from '../components/requests/CreateRequestModal';
import { Button, Card, Select, Skeleton } from '../components/ui';
import { useAdmin } from '../lib/useAdmin';
import { cn } from '../lib/utils';


function DashboardSkeleton({ isAdmin }) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="w-9 h-9 rounded-xl mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
      )}

      {/* Filter Bar Skeleton */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </Card>

      {/* Table Skeleton */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const DEFAULT_FILTERS = { search: '', status: '', category: '', sort: 'votes', scope: 'all' };

export default function DashboardPage() {
  const isAdmin = useAdmin();
  const { orgId: urlOrgId, boardId } = useParams();
  const [searchParams] = useSearchParams();
  const adminBoardId = searchParams.get('board');
  const effectiveBoardId = boardId || adminBoardId;
  
  const navigate = useNavigate();
  const { 
    requests, user, boards, userOrg, subscribeToAll, 
    activeOrgId, isLoading, syncAllClickUpTasks 
  } = useStore();

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
        <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Layout size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Board Portal</h1>
        <p className="text-gray-500 max-w-md mb-8">
          To view and submit feedback, please use the specific board link provided by your administrator.
        </p>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-400 italic">
          Are you an admin? Navigate to the <button onClick={() => navigate('/admin/settings')} className="text-gray-900 font-bold hover:underline">Admin Settings</button> to manage boards.
        </div>
      </div>
    );
  }

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [showCreate, setShowCreate] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const count = await syncAllClickUpTasks();
      toast.success(`Successfully synced ${count} tasks from ClickUp!`);
    } catch (error) {
      toast.error(error.message || "Failed to sync");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const activeBoard = useMemo(() => {
    if (!effectiveBoardId) return null;
    return boards.find(b => b.id === effectiveBoardId);
  }, [effectiveBoardId, boards]);

  const boardName = activeBoard ? activeBoard.name : 'Main Feedback Feed';

  const filtered = useMemo(() => {
    let res = [...requests];

    // Board Filter
    if (effectiveBoardId && effectiveBoardId !== 'all') {
      res = res.filter(r => r.boardId === effectiveBoardId || !r.boardId);
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

  if (isLoading) return <DashboardSkeleton isAdmin={isAdmin} />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all bg-gray-900 text-white"
          )}>
            {activeBoard ? <Layout size={24} /> : <Flame size={24} />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {boardName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeBoard ? `Viewing requests for ${activeBoard.name}` : 'Explore and upvote the best ideas across all boards.'}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active View</p>
              <p className="text-xs font-semibold text-gray-700">{effectiveBoardId ? 'Switch Board' : 'Organization View'}</p>
            </div>
            <div className="w-40 md:w-48">
              <Select 
                value={effectiveBoardId || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  const org = urlOrgId || userOrg?.id;
                  if (isAdmin) {
                    navigate(val ? `/admin?board=${val}` : `/admin`);
                  } else {
                    navigate(val ? `/b/${org}/${val}` : `/b/${org}/all`);
                  }
                }}
                className="py-1.5 text-xs font-bold text-gray-700 bg-white border-gray-200 shadow-sm hover:border-gray-900 transition-all cursor-pointer"
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
      {isAdmin && <SummaryCards requests={filtered} />}

      {/* Main Card */}
      <Card>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilters(f => ({ ...f, scope: 'all' }))}
              className={cn(
                "px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                filters.scope === 'all' 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                "px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap",
                filters.scope === 'mine' 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              My Requests
              {filters.scope === 'mine' && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-white"></span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="h-[42px]"
              >
                <RefreshCw size={14} className={isSyncingAll ? 'animate-spin' : ''} />
                <span className="hidden md:inline">Sync ClickUp</span>
              </Button>
            )}
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
              className="flex-1 sm:flex-none justify-center h-[42px]"
            >
              <Plus size={15} />
              <span className="truncate">{activeBoard ? 'Submit Feedback' : 'New Feature Request'}</span>
            </Button>
          </div>
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
            <>
              <div className="hidden lg:block">
                <RequestTable requests={filtered} onEdit={handleEdit} />
              </div>
              <div className="lg:hidden space-y-4">
                {filtered.map((req, i) => (
                  <RequestCard key={req.id} request={req} rank={i + 1} />
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateRequestModal
        open={showCreate || !!editData}
        onClose={handleModalClose}
        editData={editData}
        forcedBoardId={effectiveBoardId}
      />
    </div>
  );
}

