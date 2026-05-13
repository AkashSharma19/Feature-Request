import { FileText, Clock, Calendar, Code2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../lib/utils';

const CARDS = [
  {
    key: 'total',
    label: 'Total Requests',
    icon: FileText,
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    fn: (reqs) => reqs.length,
  },
  {
    key: 'pending',
    label: 'Open Requests',
    icon: Clock,
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    fn: (reqs) => reqs.filter((r) => r.status === 'Open').length,
  },
  {
    key: 'planning',
    label: 'In Design/Review',
    icon: Calendar,
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    fn: (reqs) => reqs.filter((r) => r.status === 'In Design' || r.status === 'Under Review' || r.status === 'In Progress').length,
  },
  {
    key: 'development',
    label: 'In Development',
    icon: Code2,
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    fn: (reqs) => reqs.filter((r) => r.status === 'Development' || r.status === 'Testing').length,
  },
  {
    key: 'completed',
    label: 'Tested/Closed',
    icon: CheckCircle,
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-900',
    fn: (reqs) => reqs.filter((r) => r.status === 'Tested' || r.status === 'Closed').length,
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertCircle,
    lightBg: 'bg-red-50',
    textColor: 'text-red-600',
    fn: (reqs) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return reqs.filter((r) => r.deadline && new Date(r.deadline) < today && !['Closed', 'Tested', 'Cancelled'].includes(r.status)).length;
    },
  },
];

export default function SummaryCards({ requests, isAdmin }) {
  const displayCards = isAdmin ? CARDS : CARDS.filter((c) => c.key !== 'overdue');

  return (
    <div className={cn("grid grid-cols-2 gap-4", isAdmin ? "lg:grid-cols-6" : "lg:grid-cols-5")}>
      {displayCards.map((card, i) => {
        const Icon = card.icon;
        const value = card.fn(requests);
        return (
          <Card
            key={card.key}
            className="p-4 feature-card cursor-default"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.lightBg)}>
                <Icon size={16} className={card.textColor} />
              </div>

            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{card.label}</p>

          </Card>
        );
      })}
    </div>
  );
}
