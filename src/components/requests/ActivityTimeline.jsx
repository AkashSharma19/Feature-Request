import { cn, timeAgo } from '../../lib/utils';
import {
  Plus, GitBranch, TrendingUp, MessageSquare, CheckCircle, AlertCircle
} from 'lucide-react';

const TYPE_CONFIG = {
  created:  { icon: Plus,          color: 'bg-gray-900 text-white', dot: 'bg-gray-900' },
  status:   { icon: GitBranch,     color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-700' },
  progress: { icon: TrendingUp,    color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-700' },
  comment:  { icon: MessageSquare, color: 'bg-gray-50 text-gray-400', dot: 'bg-gray-400' },
  priority: { icon: AlertCircle,   color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-700' },
  released: { icon: CheckCircle,   color: 'bg-gray-900 text-white', dot: 'bg-gray-900' },
};

export default function ActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No activity yet.</p>;
  }

  return (
    <div className="space-y-0">
      {[...activities].reverse().map((activity, i) => {
        const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.status;
        const Icon = cfg.icon;
        const isLast = i === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', cfg.color)}>
                <Icon size={13} />
              </div>
              {!isLast && <div className="w-0.5 h-full min-h-[20px] bg-gray-100 my-1" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm text-gray-700 font-medium leading-snug">{activity.text}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{timeAgo(activity.date)}</span>
                {activity.user && (
                  <>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{activity.user}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
