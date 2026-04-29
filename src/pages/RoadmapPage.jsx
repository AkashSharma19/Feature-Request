import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import RoadmapColumn from '../components/roadmap/RoadmapColumn';
import { Card, Button } from '../components/ui';
import { cn, getQuarterFromDate } from '../lib/utils';
import { useAdmin } from '../lib/useAdmin';

const QUARTER_COLUMNS = [
  { id: 'Backlog', label: 'Backlog', color: 'bg-slate-400' },
  { id: 'Q1', label: 'Q1 — Jan to Mar', color: 'bg-blue-400' },
  { id: 'Q2', label: 'Q2 — Apr to Jun', color: 'bg-teal-500' },
  { id: 'Q3', label: 'Q3 — Jul to Sep', color: 'bg-purple-500' },
  { id: 'Q4', label: 'Q4 — Oct to Dec', color: 'bg-orange-500' },
];

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
  const { 
    requests, 
    roadmapItems, 
    moveRoadmapItem, 
    updateRequest, 
    addToRoadmap, 
    removeFromRoadmap 
  } = useStore();
  const [view, setView] = useState('quarterly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeId, setActiveId] = useState(null);
  const isAdmin = useAdmin();

  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = view === 'quarterly' ? QUARTER_COLUMNS : STATUS_COLUMNS;

  // For quarterly view, items per quarter
  // For status view, items per status (using feature status)
  const getColumnItems = (colId) => {
    if (view === 'quarterly') {
      const assignedIds = roadmapItems.map(i => i.featureId);
      
      // Get manually assigned items for this quarter and selected year
      const manualItems = roadmapItems
        .filter((i) => i.quarter === colId && (colId === 'Backlog' || i.year === selectedYear))
        .sort((a, b) => a.position - b.position);

      // Get virtual items (not manually assigned) that match this quarter/year by dueDate
      const virtualItems = requests
        .filter((r) => !assignedIds.includes(r.id))
        .filter((r) => {
          const res = getQuarterFromDate(r.dueDate);
          const q = res?.quarter || 'Backlog';
          const y = res?.year || selectedYear;
          return q === colId && (colId === 'Backlog' || y === selectedYear);
        })
        .map((r) => ({ id: `virtual-${r.id}`, featureId: r.id, quarter: colId, year: selectedYear, position: 0 }));

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
      const overColumn = QUARTER_COLUMNS.find((c) => c.id === over.id);
      const targetQuarter = overItem?.quarter || overColumn?.id;

      if (targetQuarter === 'Backlog') {
        removeFromRoadmap(activeFeatureId);
        updateRequest(activeFeatureId, { dueDate: '' });
      } else if (targetQuarter) {
        addToRoadmap(activeFeatureId, targetQuarter, selectedYear);
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

  const activeItem = roadmapItems.find((i) => i.id === activeId);
  const activeFeature = activeItem ? requests.find((r) => r.id === activeItem.featureId) : null;

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Product Roadmap</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Drag cards between columns to reorganize. {view === 'quarterly' ? 'Showing quarterly timeline.' : 'Showing by development status.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view === 'quarterly' && (
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    selectedYear === y ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {y}
                </button>
              ))}
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
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={isAdmin ? handleDragStart : undefined}
        onDragEnd={isAdmin ? handleDragEnd : undefined}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((col) => (
            <RoadmapColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              items={getColumnItems(col.id)}
              requests={requests}
            />
          ))}
        </div>

        <DragOverlay>
          {activeFeature && (
            <div className="bg-white rounded-xl border border-teal-300 shadow-2xl p-3 w-64 rotate-2 opacity-90">
              <p className="text-sm font-bold text-gray-800 line-clamp-2">{activeFeature.title}</p>
              <p className="text-xs text-gray-400 mt-1">{activeFeature.category}</p>
            </div>
          )}
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
