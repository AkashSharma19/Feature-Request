import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select, Button } from '../ui';
import { CATEGORIES, STATUSES } from '../../lib/utils';

export default function FilterBar({ filters, onChange }) {
  const hasFilters = filters.search || filters.status || filters.category;

  const clear = () => onChange({
    search: '', status: '', category: '', sort: 'votes', scope: 'all'
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Scope Toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'mine', label: 'My Requests' }
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => onChange({ ...filters, scope: s.id })}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filters.scope === s.id
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search feature requests…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <div className="relative min-w-[140px]">
          <Select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Overdue" className="text-red-600 font-medium">Overdue</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>


        {/* Category */}
        <div className="relative min-w-[140px]">
          <Select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>

        {/* Sort */}
        <div className="relative min-w-[140px]">
          <Select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          >
            <option value="votes">Sort: Most Voted</option>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="progress">Sort: Progress</option>
          </Select>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-gray-400 hover:text-gray-600">
            <X size={14} /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
