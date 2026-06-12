import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock3, QrCode, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/api';
import useQueueSocket from '../hooks/useQueueSocket';
import { Panel, StatCard, Badge } from '../components/Common';

function PatientDisplayPage({ queryClient }) {
  useQueueSocket(queryClient);
  const queueQuery = useQuery({ queryKey: ['current-queue'], queryFn: api.getCurrentQueue });

  const current = queueQuery.data?.current || null;
  const upcoming = queueQuery.data?.upcoming || [];

  const waitText = useMemo(() => current?.estimatedWaitTime || 0, [current?.estimatedWaitTime]);

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary">Waiting Room</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Live queue display</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Patients can glance at the TV screen and know exactly what is happening now.</p>
            </div>
            <div className="hero-gradient rounded-3xl p-4 text-white shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Serving now</p>
              <p className="mt-2 text-3xl font-black">{current?.tokenNumber || 'No patients waiting'}</p>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Current token</p>
            <div className="mt-4 rounded-[2rem] bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50 dark:text-slate-500">Now serving</p>
                  <h2 className="mt-2 text-6xl font-black tracking-tight text-brand-secondary">{current?.tokenNumber || '---'}</h2>
                </div>
                <Badge tone={current ? 'info' : 'warning'}>{current ? current.status : 'Idle'}</Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoCard icon={<Clock3 className="h-5 w-5" />} label="Estimated wait" value={current ? `${waitText} min` : '0 min'} />
                <InfoCard icon={<Sparkles className="h-5 w-5" />} label="Tokens ahead" value={upcoming.length ? `${upcoming.length} in view` : 'None'} />
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Scan this screen</p>
            <div className="mt-4 flex flex-col items-center gap-4 rounded-[2rem] bg-slate-100 p-6 dark:bg-slate-900">
              <QRCodeSVG value={`${window.location.origin}/display`} size={180} bgColor="transparent" fgColor="currentColor" />
              <div className="text-center">
                <p className="text-sm font-bold">Remote status page</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patients can open the same live view from a QR scan.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard label="Next patients" value={upcoming.length} hint="Showing the next five only" />
          <StatCard label="Live updates" value="On" hint="Socket.IO updates without refresh" />
          <StatCard label="QR tracking" value="Enabled" hint="Scan to track queue remotely" />
        </div>

        <Panel title="Upcoming tokens" description="A TV-friendly list of the next five patients.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {upcoming.map((patient) => (
              <article key={patient._id} className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Token</p>
                <p className="mt-2 text-2xl font-black text-brand-primary">{patient.tokenNumber}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{patient.name}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{patient.estimatedWaitTime || 0} min wait</p>
              </article>
            ))}
            {!upcoming.length ? <p className="col-span-full py-8 text-center text-sm text-slate-500">No patients waiting.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 dark:bg-slate-950/40">
      <div className="flex items-center gap-2 text-white/70 dark:text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-[0.25em]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default PatientDisplayPage;