import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { email: 'reception@queuecure.dev', password: 'Password123!' }
  });

  const onSubmit = async (values) => {
    try {
      setError('');
      const user = await login(values);
      const target = user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : '/receptionist';
      navigate(target);
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-slate-950 dark:text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900/70">
            <ShieldCheck className="h-4 w-4 text-brand-primary" />
            Queue Cure '26
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl">Real-time clinic queues that feel calm, transparent, and modern.</h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">Replace paper slips and verbal announcements with live token tracking, wait-time intelligence, and role-based dashboards.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-3xl p-4">
              <Users className="h-5 w-5 text-brand-secondary" />
              <p className="mt-3 text-sm font-bold">Receptionist speed</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quick token generation and no-show handling.</p>
            </div>
            <div className="glass-panel rounded-3xl p-4">
              <Stethoscope className="h-5 w-5 text-brand-primary" />
              <p className="mt-3 text-sm font-bold">Doctor focus</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current patient, timer, and consultation durations.</p>
            </div>
            <div className="glass-panel rounded-3xl p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <p className="mt-3 text-sm font-bold">Secure access</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">JWT auth, protected routes, and role controls.</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60 dark:text-slate-500">Demo Login</p>
            <h2 className="mt-3 text-3xl font-extrabold">Sign in to the clinic dashboard</h2>
            <p className="mt-2 text-sm text-white/70 dark:text-slate-600">Use one of the seeded accounts to explore every role.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Email"
                className="w-full rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-2 focus:ring-brand-secondary dark:bg-slate-100 dark:text-slate-950 dark:placeholder:text-slate-400"
              />
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-2 focus:ring-brand-secondary dark:bg-slate-100 dark:text-slate-950 dark:placeholder:text-slate-400"
              />
              {error ? <p className="text-sm font-semibold text-rose-400 dark:text-rose-600">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-secondary px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Enter Queue Cure'}
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <Credential label="Admin" value="admin@queuecure.dev" />
            <Credential label="Receptionist" value="reception@queuecure.dev" />
            <Credential label="Doctor" value="doctor@queuecure.dev" />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Credential({ label, value }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Password123!</p>
    </div>
  );
}

export default LoginPage;