import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { Download, Gauge, Shield, Users } from 'lucide-react';
import api from '../lib/api';
import useQueueSocket from '../hooks/useQueueSocket';
import DashboardShell from '../components/DashboardShell';
import { Panel, StatCard } from '../components/Common';

const COLORS = ['#2563EB', '#14B8A6', '#22C55E', '#F59E0B', '#EF4444'];

function AdminDashboard({ queryClient }) {
  useQueueSocket(queryClient);
  const analyticsQuery = useQuery({ queryKey: ['analytics'], queryFn: api.getAnalytics });
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const patientsQuery = useQuery({ queryKey: ['patients'], queryFn: api.getPatients });

  const analytics = analyticsQuery.data || {};

  const waitSeries = (patientsQuery.data || []).slice(-8).map((patient, index) => ({
    name: patient.tokenNumber,
    wait: patient.estimatedWaitTime || 0,
    index: index + 1
  }));

  return (
    <DashboardShell title="Admin Analytics" subtitle="See how the clinic is performing and where to improve throughput.">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Patients served" value={analytics.totalServed || 0} hint="Completed queue entries" />
        <StatCard label="Average wait" value={`${analytics.averageWaitTime || 0} min`} hint="Live queue prediction" />
        <StatCard label="Average consult" value={`${settingsQuery.data?.averageConsultationTime || 12} min`} hint="Current planning baseline" />
        <StatCard label="Peak hours" value={analytics.peakHours?.length || 0} hint="Hours with the most demand" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Wait time trend" description="Recent queue estimates based on actual activity.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitSeries}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="wait" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Peak hours" description="Distribution of patient check-ins across the day.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peakHours || []}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" radius={[14, 14, 0, 0]}>
                  {(analytics.peakHours || []).map((entry, index) => (
                    <Cell key={`cell-${entry.hour}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Clinic intelligence" description="Export-ready metrics and management actions.">
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat icon={<Users className="h-4 w-4" />} title="Total patients" value={analytics.totalPatients || 0} />
          <MiniStat icon={<Gauge className="h-4 w-4" />} title="Waiting count" value={analytics.waitingCount || 0} />
          <MiniStat icon={<Shield className="h-4 w-4" />} title="Completed count" value={analytics.completedCount || 0} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="inline-flex items-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </button>
        </div>
      </Panel>
    </DashboardShell>
  );
}

function MiniStat({ icon, title, value }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default AdminDashboard;