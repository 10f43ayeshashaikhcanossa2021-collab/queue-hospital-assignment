import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlayCircle, Square, TimerReset, Activity, CheckCircle2 } from 'lucide-react';
import getSocket from '../lib/socket';
import api from '../lib/api';
import useQueueSocket from '../hooks/useQueueSocket';
import DashboardShell from '../components/DashboardShell';
import { Badge, Button, Panel, StatCard } from '../components/Common';

function DoctorDashboard({ queryClient }) {
  const socket = getSocket();
  useQueueSocket(queryClient);
  const queueQuery = useQuery({ queryKey: ['current-queue'], queryFn: api.getCurrentQueue });
  const patientsQuery = useQuery({ queryKey: ['patients'], queryFn: api.getPatients });
  const [elapsed, setElapsed] = useState('00:00');

  const currentPatient = queueQuery.data?.current || null;
  const completedPatients = useMemo(() => (patientsQuery.data || []).filter((patient) => patient.status === 'COMPLETED'), [patientsQuery.data]);

  useEffect(() => {
    if (!currentPatient?.consultationStartTime) {
      setElapsed('00:00');
      return undefined;
    }

    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(currentPatient.consultationStartTime).getTime()) / 1000));
      const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setElapsed(`${minutes}:${seconds}`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [currentPatient?.consultationStartTime]);

  const startConsultation = useMutation({
    mutationFn: () =>
      new Promise((resolve) => {
        socket.emit('consultation-started', { patientId: currentPatient?._id }, (result) => resolve(result));
      })
  });

  const completeConsultation = useMutation({
    mutationFn: () =>
      new Promise((resolve) => {
        socket.emit('consultation-ended', { patientId: currentPatient?._id }, (result) => resolve(result));
      })
  });

  return (
    <DashboardShell title="Doctor Console" subtitle="Track the current patient, measure consultation time, and close visits with one click.">
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Current patient" value={currentPatient?.tokenNumber || 'Idle'} hint={currentPatient?.name || 'No one is in consultation'} />
        <StatCard label="Timer" value={elapsed} hint="Consultation duration" />
        <StatCard label="Completed today" value={completedPatients.length} hint="Automatically calculated from queue state" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Current patient" description="Start and end the consultation without leaving the dashboard.">
          {currentPatient ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{currentPatient.status}</Badge>
                <Badge>{currentPatient.reasonForVisit}</Badge>
              </div>
              <h2 className="text-5xl font-black tracking-tight text-brand-primary">{currentPatient.tokenNumber}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{currentPatient.name} · Age {currentPatient.age} · {currentPatient.phone}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Elapsed</p>
                  <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{elapsed}</p>
                </div>
                <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Estimated wait</p>
                  <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{currentPatient.estimatedWaitTime || 0} min</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => startConsultation.mutateAsync()}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Consultation
                </Button>
                <Button variant="ghost" onClick={() => completeConsultation.mutateAsync()}>
                  <Square className="mr-2 h-4 w-4" />
                  End Consultation
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-100 p-6 text-sm text-slate-500 dark:bg-slate-900">No current patient. Ask reception to call the next token.</div>
          )}
        </Panel>

        <Panel title="Operational stats" description="Consultation flow at a glance.">
          <div className="space-y-3">
            <DoctorStat icon={<Activity className="h-4 w-4" />} label="Patients completed" value={completedPatients.length} />
            <DoctorStat icon={<TimerReset className="h-4 w-4" />} label="Avg consultation time" value={`${Math.round((completedPatients.reduce((sum, patient) => sum + (patient.actualConsultationDuration || 0), 0) / (completedPatients.length || 1)) || 0)} min`} />
            <DoctorStat icon={<CheckCircle2 className="h-4 w-4" />} label="Ready state" value={currentPatient ? 'Active consultation' : 'Awaiting token'} />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}

function DoctorStat({ icon, label, value }) {
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

export default DoctorDashboard;