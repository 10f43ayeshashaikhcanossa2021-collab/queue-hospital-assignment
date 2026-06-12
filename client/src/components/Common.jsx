import { motion } from 'framer-motion';

function StatCard({ label, value, hint, accent = 'from-brand-primary to-brand-secondary' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-3xl p-5"
    >
      <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{value}</div>
      {hint ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </motion.div>
  );
}

function Panel({ title, description, children, className = '' }) {
  return (
    <section className={`glass-panel rounded-3xl p-5 ${className}`}>
      {(title || description) && (
        <div className="mb-5">
          {title ? <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3> : null}
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone] || tones.default}`}>{children}</span>;
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'hero-gradient text-white shadow-soft hover:opacity-95',
    ghost: 'bg-white text-slate-700 border border-slate-200 hover:border-brand-primary hover:text-brand-primary dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600'
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { StatCard, Panel, Badge, Button };