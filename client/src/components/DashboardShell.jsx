import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, CalendarClock, LayoutDashboard, LogOut, MoonStar, Stethoscope, SunMedium, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';

const navigation = {
  RECEPTIONIST: [
    { label: 'Overview', to: '/receptionist', icon: LayoutDashboard },
    { label: 'Patient Display', to: '/display', icon: CalendarClock }
  ],
  DOCTOR: [
    { label: 'Current Queue', to: '/doctor', icon: Stethoscope },
    { label: 'Patient Display', to: '/display', icon: CalendarClock }
  ],
  ADMIN: [
    { label: 'Admin Overview', to: '/admin', icon: BarChart3 },
    { label: 'Receptionist', to: '/receptionist', icon: Users }
  ]
};

function DashboardShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const location = useLocation();
  const links = navigation[user.role] || [];

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="glass-panel flex flex-col rounded-3xl p-5">
          <div className="hero-gradient rounded-3xl p-5 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Queue Cure</p>
            <h1 className="mt-3 text-2xl font-extrabold">Clinic flow, made visible.</h1>
            <p className="mt-2 text-sm text-white/85">Real-time queue management for Indian clinics.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary dark:border-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                {darkMode ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400">Toggle</span>
            </button>

            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/80">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in as</p>
              <p className="mt-2 text-sm font-bold">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] dark:bg-white dark:text-slate-950"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="space-y-4">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary">{user.role}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </motion.header>

          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;