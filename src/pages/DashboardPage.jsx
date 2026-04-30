import { useState, useMemo } from 'react';
import { Plus, Flame } from 'lucide-react';
import { useStore } from '../store/useStore';
import SummaryCards from '../components/dashboard/SummaryCards';
import FilterBar from '../components/dashboard/FilterBar';
import RequestTable from '../components/dashboard/RequestTable';
import CreateRequestModal from '../components/requests/CreateRequestModal';
import { Button, Card, Select } from '../components/ui';
import { useAdmin } from '../lib/useAdmin';

const DEFAULT_FILTERS = { search: '', status: '', category: '', sort: 'votes', scope: 'all' };

export default function DashboardPage() {
  const { requests, currentUser } = useStore();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [showCreate, setShowCreate] = useState(false);
  const [editData, setEditData] = useState(null);

  const filtered = useMemo(() => {
    let res = [...requests];

    // Scope (My Requests)
    if (filters.scope === 'mine') {
      res = res.filter((r) => r.userId === currentUser || r.requestedBy === 'Admin User' || r.requestedBy === 'Guest User');
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
  }, [requests, filters]);

  const handleEdit = (req) => {
    setEditData(req);
    setShowCreate(true);
  };

  const handleModalClose = () => {
    setShowCreate(false);
    setEditData(null);
  };

  const isAdmin = useAdmin();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all feature requests.</p>
        </div>
        <div className="w-48">
          <Select className="py-1.5 text-xs font-medium text-gray-700 bg-white border-gray-200">
            <option>All Organizations</option>
            <option>Masters' Union</option>
            <option>TETR</option>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards requests={requests} />

      {/* Main Card */}
      <Card>
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Feature Requests</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreate(true)}
            id="new-request-btn"
          >
            <Plus size={15} />
            New Feature Request
          </Button>
        </div>

        <div className="px-6 py-4 border-b border-gray-50">
          <FilterBar
            filters={filters}
            onChange={setFilters}
          />
        </div>

        <div className="p-6">
          <RequestTable requests={filtered} onEdit={handleEdit} />
        </div>
      </Card>

      {/* Modals */}
      <CreateRequestModal
        open={showCreate}
        onClose={handleModalClose}
        editData={editData}
      />
    </div>
  );
}
