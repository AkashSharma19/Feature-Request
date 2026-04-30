import { FileText, Clock, Calendar, Code2, CheckCircle } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../lib/utils';

const CARDS = [
  {
    key: 'total',
    label: 'Total Requests',
    icon: FileText,
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50',
    textColor: 'text-teal-700',
    fn: (reqs) => reqs.length,
  },
  {
    key: 'pending',
    label: 'Open Requests',
    icon: Clock,
    gradient: 'from-slate-500 to-slate-600',
    lightBg: 'bg-slate-50',
    textColor: 'text-slate-700',
    fn: (reqs) => reqs.filter((r) => r.status === 'Open').length,
  },
  {
    key: 'planning',
    label: 'In Design/Review',
    icon: Calendar,
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-700',
    fn: (reqs) => reqs.filter((r) => r.status === 'In Design' || r.status === 'Under Review' || r.status === 'In Progress').length,
  },
  {
    key: 'development',
    label: 'In Development',
    icon: Code2,
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
    fn: (reqs) => reqs.filter((r) => r.status === 'Development' || r.status === 'Testing').length,
  },
  {
    key: 'completed',
    label: 'Tested/Closed',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    textColor: 'text-green-700',
    fn: (reqs) => reqs.filter((r) => r.status === 'Tested' || r.status === 'Closed').length,
  },
];

export default function SummaryCards({ requests }) {
  const total = requests.length || 1;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {CARDS.map((card, i) => {
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
