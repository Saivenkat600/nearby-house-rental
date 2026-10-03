import { Link } from 'react-router-dom';

export function Button({ children, className = '', variant = 'primary', ...props }) {
  const styles = variant === 'secondary'
    ? 'bg-white text-forest-800 border border-forest-100 hover:bg-forest-50'
    : variant === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-700'
      : 'bg-forest-800 text-white hover:bg-forest-700';
  return <button className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50 ${styles} ${className}`} {...props}>{children}</button>;
}

export function Input({ label, className = '', ...props }) {
  return <label className={`block text-sm font-medium text-slate-700 ${className}`}>{label && <span className="mb-1.5 block">{label}</span>}<input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" {...props} /></label>;
}

export function Select({ label, children, className = '', ...props }) {
  return <label className={`block text-sm font-medium text-slate-700 ${className}`}>{label && <span className="mb-1.5 block">{label}</span>}<select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100" {...props}>{children}</select></label>;
}

export function Loader({ label = 'Loading...' }) {
  return <div className="flex min-h-40 items-center justify-center gap-3 text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" />{label}</div>;
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{children}</div>;
}

export function EmptyState({ title = 'Nothing to show yet', children }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-slate-500">{children}</p></div>;
}

export function SectionTitle({ eyebrow, title, description }) {
  return <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-forest-600">{eyebrow}</p><h1 className="text-3xl font-extrabold tracking-tight text-forest-800 md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-slate-500">{description}</p>}</div>;
}

export function PageContainer({ children, className = '' }) {
  return <main className={`page-shell mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${className}`}>{children}</main>;
}

export function TextLink({ to, children, ...props }) {
  return <Link to={to} className="font-semibold text-forest-700 hover:text-forest-600" {...props}>{children}</Link>;
}
