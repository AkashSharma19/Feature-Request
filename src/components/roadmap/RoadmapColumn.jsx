import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import RoadmapCard from './RoadmapCard';
import { cn } from '../../lib/utils';

export default function RoadmapColumn({ id, label, color, items, requests, isAdmin }) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    disabled: !isAdmin
  });

  return (
    <div
      className={cn(
        'flex flex-col min-w-[260px] w-[260px] lg:min-w-[280px] lg:w-[280px] bg-gray-50 rounded-2xl border transition-all',
        isOver ? 'border-gray-900 bg-gray-50' : 'border-gray-100'
      )}
    >
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
            <h3 className="text-sm font-bold text-gray-700">{label}</h3>
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-2 min-h-[120px]"
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => {
            const feature = requests.find((r) => r.id === item.featureId);
            return (
              <RoadmapCard key={item.id} item={item} feature={feature} isAdmin={isAdmin} />
            );
          })}
        </SortableContext>
        {items.length === 0 && (
          <div className={cn(
            'flex items-center justify-center h-16 border-2 border-dashed rounded-xl text-xs text-gray-300 transition-all',
            isOver ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-gray-200'
          )}>
            {isOver ? 'Drop here' : 'No items'}
          </div>
        )}
      </div>
    </div>
  );
}
