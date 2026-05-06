import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import RoadmapColumn from '../components/roadmap/RoadmapColumn';
import RoadmapCard from '../components/roadmap/RoadmapCard';
import { Card, Button, Select } from '../components/ui';
import { cn, getQuarterFromDate } from '../lib/utils';
import { useAdmin } from '../lib/useAdmin';

const QUARTER_COLORS = {
  Q1: 'bg-blue-400',
  Q2: 'bg-teal-500',
  Q3: 'bg-purple-500',
  Q4: 'bg-orange-500',
};

const generateQuarterColumns = () => {
  const currentYear = new Date().getFullYear();
  const cols = [{ id: 'Backlog', label: 'Backlog', color: 'bg-slate-400' }];
  
  // 1 year back to 1 year forward
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    for (let q = 1; q <= 4; q++) {
      cols.push({
        id: `${y}-Q${q}`,
        label: `Q${q} ${y}`,
        color: QUARTER_COLORS[`Q${q}`],
        year: y,
        quarter: `Q${q}`
      });
    }
  }
  return cols;
};

const STATUS_COLUMNS = [
  { id: 'Open',         label: 'Open',         color: 'bg-slate-400' },
  { id: 'In Progress',  label: 'In Progress',  color: 'bg-blue-500' },
  { id: 'In Design',    label: 'In Design',    color: 'bg-purple-500' },
  { id: 'Under Review', label: 'Under Review', color: 'bg-indigo-500' },
  { id: 'Development',  label: 'Development',  color: 'bg-orange-500' },
  { id: 'Testing',      label: 'Testing',      color: 'bg-yellow-500' },
  { id: 'Tested',       label: 'Tested',       color: 'bg-emerald-500' },
  { id: 'Closed',       label: 'Closed',       color: 'bg-green-500' },
];

export default function RoadmapPage() {
  const { orgId: urlOrgId } = useParams();
  const navigate = useNavigate();
  const { 
    requests, 
    roadmapItems, 
    moveRoadmapItem, 
    updateRequest, 
    addToRoadmap, 
    removeFromRoadmap,
    userOrg,
    subscribeToAll,
    boards,
    activeOrgId
  } = useStore();

  const [view, setView] = useState('quarterly');
  const [activeId, setActiveId] = useState(null);
  const scrollContainerRef = useRef(null);
  const isAdmin = useAdmin();

  // Handle subscription switching
  useEffect(() => {
    const targetOrgId = urlOrgId || userOrg?.id;
    if (targetOrgId && activeOrgId !== targetOrgId) {
      const unsub = subscribeToAll(targetOrgId);
      return () => unsub && unsub();
    }
  }, [urlOrgId, userOrg, subscribeToAll, activeOrgId]);

  const quarterColumns = useMemo(() => generateQuarterColumns(), []);
  
  const currentQId = useMemo(() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-Q${q}`;
  }, []);


  // Auto-scroll to current quarter
  useEffect(() => {
    if (view === 'quarterly' && scrollContainerRef.current) {
      const currentElement = document.getElementById(`col-${currentQId}`);
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [view, currentQId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = view === 'quarterly' ? quarterColumns : STATUS_COLUMNS;

  // For quarterly view, items per quarter
  // For status view, items per status (using feature status)
  const getColumnItems = (colId) => {
    if (view === 'quarterly') {
      const assignedIds = roadmapItems.map(i => i.featureId);
      const col = quarterColumns.find(c => c.id === colId);
      
      // Get manually assigned items for this column
      const manualItems = roadmapItems
        .filter((i) => {
          if (colId === 'Backlog') return i.quarter === 'Backlog';
          return i.quarter === col.quarter && i.year === col.year;
        })
        .sort((a, b) => a.position - b.position);

      // Get virtual items (not manually assigned) that match this quarter/year by dueDate
      const virtualItems = requests
        .filter((r) => !assignedIds.includes(r.id))
        .filter((r) => {
          const res = getQuarterFromDate(r.dueDate);
          const q = res?.quarter || 'Backlog';
          const y = res?.year || (col?.year);
          
          if (colId === 'Backlog') return q === 'Backlog';
          return q === col.quarter && y === col.year;
        })
        .map((r) => ({ 
          id: `virtual-${r.id}`, 
          featureId: r.id, 
          quarter: col?.quarter || 'Backlog', 
          year: col?.year, 
          position: 0 
        }));

      return [...manualItems, ...virtualItems];
    } else {
      // Status view: show all requests with matching status
      return requests
        .filter((r) => r.status === colId)
        .map((r) => {
          const existing = roadmapItems.find((i) => i.featureId === r.id);
          return existing || { id: `virtual-${r.id}`, featureId: r.id, quarter: colId, position: 0 };
        });
    }
  };

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    if (view === 'quarterly') {
      const activeFeatureId = active.id.toString().startsWith('virtual-') 
        ? active.id.replace('virtual-', '') 
        : roadmapItems.find(i => i.id === active.id)?.featureId;

      if (!activeFeatureId) return;

      const overItem = roadmapItems.find((i) => i.id === over.id);
      const overColumn = quarterColumns.find((c) => c.id === over.id);
      
      // Target determination
      let targetQuarter, targetYear;
      if (overColumn) {
        targetQuarter = overColumn.quarter;
        targetYear = overColumn.year;
      } else if (overItem) {
        targetQuarter = overItem.quarter;
        targetYear = overItem.year;
      }

      if (targetQuarter === 'Backlog') {
        removeFromRoadmap(activeFeatureId);
        updateRequest(activeFeatureId, { dueDate: '' });
      } else if (targetQuarter) {
        addToRoadmap(activeFeatureId, targetQuarter, targetYear);
      }
    } else {
      // Status view: update feature status
      const activeItem = roadmapItems.find((i) => i.id === active.id) ||
                         { featureId: active.id.replace('virtual-', '') };
      const overStatus = STATUS_COLUMNS.find((c) => c.id === over.id);
      const overItem = roadmapItems.find((i) => i.id === over.id);
      const targetStatus = overStatus?.id || (overItem && requests.find(r => r.id === overItem.featureId)?.status);
      if (targetStatus && activeItem.featureId) {
        updateRequest(activeItem.featureId, { status: targetStatus });
      }
    }
  };

  const activeFeatureId = activeId?.toString().startsWith('virtual-') 
    ? activeId.replace('virtual-', '') 
    : roadmapItems.find((i) => i.id === activeId)?.featureId;
  const activeFeature = activeFeatureId ? requests.find((r) => r.id === activeFeatureId) : null;

  const activeItem = roadmapItems.find((i) => i.id === activeId) || { id: activeId, featureId: activeFeatureId };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Roadmap</h1>
          <p className="text-sm text-gray-500 mt-1">
            Drag cards between columns to reorganize. {view === 'quarterly' ? 'Showing quarterly timeline.' : 'Showing by development status.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div className="w-48">
              <Select 
                value="" 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) navigate(`/b/${userOrg?.id}/${val}`);
                }}
                className="py-1.5 text-xs font-bold text-gray-700 bg-white border-gray-200 shadow-sm hover:border-teal-300 transition-all cursor-pointer"
              >
                <option value="">Switch Board...</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('quarterly')}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                view === 'quarterly' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Quarterly
            </button>
            <button
              onClick={() => setView('status')}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                view === 'status' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              By Status
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={isAdmin ? sensors : []}
        collisionDetection={closestCenter}
        onDragStart={isAdmin ? handleDragStart : undefined}
        onDragEnd={isAdmin ? handleDragEnd : undefined}
      >
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide relative"
        >
          {columns.map((col) => (
            <div 
              key={col.id} 
              id={`col-${col.id}`} 
              className={cn(
                "flex-shrink-0",
                col.id === 'Backlog' && "sticky left-0 z-20 bg-[#F9FAFB] pr-4 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.05)]"
              )}
            >
              <RoadmapColumn
                id={col.id}
                label={col.label}
                color={col.color}
                items={getColumnItems(col.id)}
                requests={requests}
                isAdmin={isAdmin}
              />
            </div>
          ))}
        </div>


        <DragOverlay dropAnimation={null}>
          {activeFeature && activeItem ? (
            <div className="w-[236px] opacity-95 rotate-2">
              <RoadmapCard item={activeItem} feature={activeFeature} isOverlay={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {columns.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
            <span className="text-xs text-gray-500">{col.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
