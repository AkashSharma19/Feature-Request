import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select, Button } from '../ui';
import { CATEGORIES, STATUSES } from '../../lib/utils';

export default function FilterBar({ filters, onChange, isAdmin }) {
  const hasFilters = filters.search || filters.status || filters.category;

  const clear = () => onChange({
    search: '', status: '', category: '', sort: 'votes', scope: 'all'
  });

  return (
    <div className="flex flex-col gap-5">
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
            {isAdmin && <option value="Overdue" className="text-red-600 font-medium">Overdue</option>}
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
