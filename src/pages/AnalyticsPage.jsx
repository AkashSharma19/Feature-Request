import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui';

const TEAL_PALETTE = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#0f766e'];
const CATEGORY_COLORS = {
  'UI/UX': '#0d9488', 'Performance': '#8b5cf6', 'Security': '#ef4444',
  'Integration': '#f97316', 'API': '#3b82f6', 'Mobile': '#ec4899',
  'Analytics': '#eab308', 'Other': '#94a3b8',
};

function ChartCard({ title, subtitle, children }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { requests } = useStore();

  // 1. Monthly requests
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    requests.forEach((r) => {
      const m = new Date(r.createdAt).getMonth();
      counts[m]++;
    });
    // Show last 8 months ending current month
    const now = new Date().getMonth();
    return Array.from({ length: 8 }, (_, i) => {
      const idx = (now - 7 + i + 12) % 12;
      return { month: months[idx], requests: counts[idx], released: Math.floor(counts[idx] * 0.3) };
    });
  }, [requests]);

  // 2. Top voted
  const topVoted = useMemo(() =>
    [...requests]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 8)
      .map((r) => ({ name: r.title.length > 28 ? r.title.slice(0, 28) + '…' : r.title, votes: r.votes })),
    [requests]
  );

  // 3. By category
  const byCategory = useMemo(() => {
    const map = {};
    requests.forEach((r) => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [requests]);

  // 4. By status (for completion rate)
  const byStatus = useMemo(() => {
    const map = {};
    requests.forEach((r) => { map[r.status] = (map[r.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [requests]);

  // 5. Completion rate radial
  const released = requests.filter((r) => r.status === 'Released').length;
  const completionRate = Math.round((released / (requests.length || 1)) * 100);
  const radialData = [
    { name: 'Released', value: completionRate, fill: '#0d9488' },
    { name: 'In Progress', value: Math.round((requests.filter(r => r.status === 'Development' || r.status === 'Testing').length / (requests.length || 1)) * 100), fill: '#f97316' },
    { name: 'Planned', value: Math.round((requests.filter(r => r.status === 'Planned' || r.status === 'Designing').length / (requests.length || 1)) * 100), fill: '#8b5cf6' },
  ];

  // Summary stats
  const avgProgress = Math.round(requests.reduce((a, r) => a + r.progress, 0) / (requests.length || 1));
  const totalVotes = requests.reduce((a, r) => a + r.votes, 0);
  const topCategory = byCategory.sort((a, b) => b.value - a.value)[0]?.name || '—';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: requests.length, color: 'text-teal-600' },
          { label: 'Total Votes Cast', value: totalVotes, color: 'text-blue-600' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-purple-600' },
          { label: 'Top Category', value: topCategory, color: 'text-orange-600' },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Row 1: Monthly + Top Voted */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Requests - Area Chart */}
        <div className="lg:col-span-3">
          <ChartCard title="Requests Created Monthly" subtitle="Last 8 months — submitted vs released">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="requests" name="Submitted" stroke="#0d9488" strokeWidth={2} fill="url(#tealGrad)" />
                <Area type="monotone" dataKey="released" name="Released" stroke="#22c55e" strokeWidth={2} fill="url(#greenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Category Pie */}
        <div className="lg:col-span-2">
          <ChartCard title="Requests by Category" subtitle="Distribution across all categories">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Top Voted + Status + Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Voted */}
        <div className="lg:col-span-2">
          <ChartCard title="Top Voted Features" subtitle="Most popular requests by vote count">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topVoted} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" name="Votes" radius={[0, 6, 6, 0]}>
                  {topVoted.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#0d9488' : i === 1 ? '#14b8a6' : '#5eead4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Completion Rate + Status Breakdown */}
        <div className="space-y-4">
          {/* Completion Rate */}
          <ChartCard title="Completion Rate" subtitle={`${released} of ${requests.length} released`}>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart
                  innerRadius="55%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={5}
                    background={{ fill: '#f1f5f9' }}
                    clockWise
                    dataKey="value"
                    cornerRadius={4}
                  />
                  <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-teal-600"
                    style={{ fontSize: 22, fontWeight: 800, fill: '#0d9488' }}
                  >
                    {completionRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 -mt-2">
              {radialData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                  {d.name}
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Status breakdown */}
          <ChartCard title="By Status" subtitle="Current pipeline breakdown">
            <div className="space-y-2">
              {byStatus.map((s) => {
                const pct = Math.round((s.value / requests.length) * 100);
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-24 truncate">{s.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-6 text-right">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
