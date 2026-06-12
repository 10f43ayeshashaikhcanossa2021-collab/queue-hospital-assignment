import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClipboardPlus, Clock3, Search, SkipForward, UserRoundCheck } from 'lucide-react';
import getSocket from '../lib/socket';
import api from '../lib/api';
import useQueueSocket from '../hooks/useQueueSocket';
import DashboardShell from '../components/DashboardShell';
import { Badge, Button, Panel, StatCard } from '../components/Common';
import { QRCodeSVG } from 'qrcode.react';

function ReceptionistDashboard({ queryClient }) {
  const socket = getSocket();
  useQueueSocket(queryClient);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const patientsQuery = useQuery({ queryKey: ['patients'], queryFn: api.getPatients });
  const queueQuery = useQuery({ queryKey: ['current-queue'], queryFn: api.getCurrentQueue });
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', age: 0, phone: '', reasonForVisit: '' }
  });

  const addPatient = useMutation({
    mutationFn: (payload) =>
      new Promise((resolve, reject) => {
        socket.emit('add-patient', payload, (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to add patient'));
          }
        });
      })
  });

  const callNext = useMutation({
    mutationFn: () =>
      new Promise((resolve) => {
        socket.emit('call-next', {}, (result) => resolve(result));
      })
  });

  const updateAverage = useMutation({
    mutationFn: (averageConsultationTime) =>
      new Promise((resolve) => {
        socket.emit('average-time-updated', { averageConsultationTime }, (result) => resolve(result));
      })
  });

  const selectedPatient = useMemo(
    () => patientsQuery.data?.find((patient) => patient._id === selectedPatientId) || queueQuery.data?.current || null,
    [patientsQuery.data, queueQuery.data?.current, selectedPatientId]
  );

  const filteredPatients = useMemo(() => {
    const patients = patientsQuery.data || [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.tokenNumber, patient.name, patient.phone, patient.reasonForVisit].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [patientsQuery.data, searchTerm]);

  const onSubmit = async (values) => {
    await addPatient.mutateAsync({
      ...values,
      age: Number(values.age)
    });
    reset();
  };

  const handleNoShow = async (patientId) => {
    await api.updatePatientStatus(patientId, 'NO_SHOW');
    await callNext.mutateAsync();
  };

  const handleSkip = async (patientId) => {
    await api.updatePatientStatus(patientId, 'SKIPPED');
    await callNext.mutateAsync();
  };

  const currentToken = queueQuery.data?.current?.tokenNumber || 'No active token';
  const upcoming = queueQuery.data?.upcoming || [];
  const averageConsultationTime = settingsQuery.data?.averageConsultationTime || 12;

  return (
    <DashboardShell
      title="Receptionist Command Center"
      subtitle="Add patients, call the next token, manage no-shows, and keep the queue transparent in real time."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Current token" value={currentToken} hint="Live serving status" accent="from-brand-primary to-brand-secondary" />
        <StatCard label="Waiting patients" value={queueQuery.data?.upcoming?.length || 0} hint="Visible in current window" accent="from-brand-secondary to-cyan-400" />
        <StatCard label="Average time" value={`${averageConsultationTime} min`} hint="Updates from consultations" accent="from-amber-500 to-orange-400" />
        <StatCard label="Total patients" value={patientsQuery.data?.length || 0} hint="Today in this clinic" accent="from-emerald-500 to-green-400" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Patient intake" description="Generate tokens automatically and keep the queue moving without manual slips.">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
            <input {...register('name', { required: true })} placeholder="Patient name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-slate-800 dark:bg-slate-950" />
            <input {...register('age', { required: true })} type="number" placeholder="Age" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-slate-800 dark:bg-slate-950" />
            <input {...register('phone', { required: true })} placeholder="Phone" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-slate-800 dark:bg-slate-950" />
            <input {...register('reasonForVisit', { required: true })} placeholder="Reason for visit" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-slate-800 dark:bg-slate-950" />
            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <Button type="submit" className="min-w-44">
                <ClipboardPlus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
              <Button type="button" variant="ghost" onClick={() => callNext.mutateAsync()} className="min-w-44">
                <UserRoundCheck className="mr-2 h-4 w-4" />
                Call Next
              </Button>
              <Button type="button" variant="ghost" onClick={() => updateAverage.mutateAsync(averageConsultationTime + 1)}>
                <Clock3 className="mr-2 h-4 w-4" />
                Increase Avg Time
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="Current token QR" description="Scan to open patient tracking on mobile.">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
            <QRCodeSVG value={`${window.location.origin}/track/${selectedPatient?.tokenNumber || currentToken}`} size={180} bgColor="transparent" fgColor="currentColor" />
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55 dark:text-slate-500">Scan</p>
              <p className="mt-2 text-2xl font-black">{selectedPatient?.tokenNumber || currentToken}</p>
              <p className="text-sm text-white/70 dark:text-slate-600">Remote live queue status</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Queue table" description="Search tokens and manage statuses from a single view.">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by token, name, phone" className="w-full bg-transparent text-sm outline-none" />
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient._id}
                type="button"
                onClick={() => setSelectedPatientId(patient._id)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-primary dark:border-slate-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-black text-slate-950 dark:text-white">{patient.tokenNumber}</p>
                      <Badge tone={statusTone(patient.status)}>{patient.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patient.name} · {patient.phone}</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-primary">{patient.estimatedWaitTime || 0} min wait</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="ghost" className="px-3 py-2 text-xs" onClick={(event) => { event.stopPropagation(); handleNoShow(patient._id); }}>No-show</Button>
                  <Button variant="ghost" className="px-3 py-2 text-xs" onClick={(event) => { event.stopPropagation(); handleSkip(patient._id); }}>Skip</Button>
                </div>
              </button>
            ))}
            {!filteredPatients.length ? <p className="py-8 text-center text-sm text-slate-500">No patients found.</p> : null}
          </div>
        </Panel>

        <Panel title="Upcoming tokens" description="Next five patients in order.">
          <div className="space-y-3">
            {upcoming.map((patient, index) => (
              <div key={patient._id} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-bold">{index + 1}. {patient.tokenNumber}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{patient.name}</p>
                </div>
                <p className="text-sm font-semibold text-brand-secondary">{patient.estimatedWaitTime || 0} min</p>
              </div>
            ))}
            {!upcoming.length ? <p className="py-8 text-center text-sm text-slate-500">No patients waiting.</p> : null}
          </div>
        </Panel>
      </div>

      <Panel title="Patient profile" description="Selected record with live queue information.">
        {selectedPatient ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Token</p>
              <h3 className="mt-2 text-4xl font-black text-brand-primary">{selectedPatient.tokenNumber}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{selectedPatient.name} · {selectedPatient.reasonForVisit}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={statusTone(selectedPatient.status)}>{selectedPatient.status}</Badge>
                <Badge>{selectedPatient.estimatedWaitTime || 0} min estimate</Badge>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">QR preview</p>
              <div className="mt-4 flex justify-center">
                <QRCodeSVG value={`${window.location.origin}/track/${selectedPatient.tokenNumber}`} size={160} bgColor="transparent" fgColor="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a patient to inspect details.</p>
        )}
      </Panel>
    </DashboardShell>
  );
}

function statusTone(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CALLED' || status === 'IN_CONSULTATION') return 'info';
  if (status === 'NO_SHOW' || status === 'SKIPPED') return 'danger';
  return 'warning';
}

export default ReceptionistDashboard;