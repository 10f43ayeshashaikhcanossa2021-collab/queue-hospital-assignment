import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle2, LocateFixed, Clock3, Users } from 'lucide-react';
import api from '../lib/api';
import useQueueSocket from '../hooks/useQueueSocket';
import { Badge, Panel, StatCard } from '../components/Common';

function TrackPage({ queryClient }) {
  const { token } = useParams();
  const [activeToken, setActiveToken] = useState(token || 'T-105');
  useQueueSocket(queryClient);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { tokenNumber: activeToken }
  });

  const tokenNumber = watch('tokenNumber');

  useEffect(() => {
    if (token) {
      setActiveToken(token);
      setValue('tokenNumber', token);
    }
  }, [setValue, token]);

  const patientQuery = useQuery({
    queryKey: ['patient-token', activeToken],
    queryFn: () => api.getPatientByToken(activeToken),
    enabled: Boolean(activeToken)
  });

  const patient = patientQuery.data || null;
  const statusTone = useMemo(() => {
    if (!patient) return 'warning';
    if (patient.status === 'COMPLETED') return 'success';
    if (patient.status === 'CALLED' || patient.status === 'IN_CONSULTATION') return 'info';
    if (patient.status === 'NO_SHOW' || patient.status === 'SKIPPED') return 'danger';
    return 'warning';
  }, [patient]);

  const onSubmit = ({ tokenNumber: submittedToken }) => setActiveToken(submittedToken.trim().toUpperCase());

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <Panel title="Track your queue status" description="Enter your token number to see queue position, wait time, and live updates.">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row">
            <input {...register('tokenNumber')} placeholder="Enter token number e.g. T-105" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-slate-800 dark:bg-slate-950" />
            <button type="submit" className="rounded-2xl hero-gradient px-5 py-3 text-sm font-bold text-white">Track Token</button>
          </form>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard label="Token" value={tokenNumber.toUpperCase()} hint="Current lookup value" />
          <StatCard label="Position" value={patient ? `${patient.estimatedWaitTime || 0} min` : '--'} hint="Estimated waiting time" />
          <StatCard label="Ahead" value={patient ? patient.status : 'Waiting'} hint="Current queue state" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Live queue status" description="The same view updates from Socket.IO without a refresh.">
            {patient ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone}>{patient.status}</Badge>
                  <Badge>{patient.reasonForVisit}</Badge>
                </div>
                <h2 className="text-5xl font-black text-brand-primary">{patient.tokenNumber}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{patient.name} · {patient.phone}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TrackMetric icon={<Clock3 className="h-4 w-4" />} label="Estimated wait" value={`${patient.estimatedWaitTime || 0} min`} />
                  <TrackMetric icon={<Users className="h-4 w-4" />} label="Queue ahead" value={patient.status === 'WAITING' ? 'In queue' : 'Called'} />
                </div>
                <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">The clinic is keeping your position updated in real time. Please stay nearby.</p>
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-100 p-6 text-sm text-slate-500 dark:bg-slate-900">No patient found for token <strong>{tokenNumber}</strong>.</div>
            )}
          </Panel>

          <Panel title="Quick actions" description="Use the QR or keep this page pinned on your phone.">
            <div className="space-y-3">
              <MiniCard icon={<LocateFixed className="h-4 w-4" />} title="Open by QR" text="Scan the code from the receptionist desk or TV screen." />
              <MiniCard icon={<CheckCircle2 className="h-4 w-4" />} title="Stay informed" text="This page refreshes itself when the queue changes." />
              <MiniCard icon={<Clock3 className="h-4 w-4" />} title="No manual refresh" text="Socket.IO pushes updates instantly." />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TrackMetric({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function MiniCard({ icon, title, text }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
      <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export default TrackPage;