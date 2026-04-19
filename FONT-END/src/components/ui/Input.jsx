export function Label({ children, htmlFor, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-slate-700 ${className}`}
    >
      {children}
    </label>
  );
}

export function Input({ className = "", id, ...rest }) {
  return (
    <input
      id={id}
      className={`mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...rest}
    />
  );
}

export function Textarea({ className = "", id, rows = 4, ...rest }) {
  return (
    <textarea
      id={id}
      rows={rows}
      className={`mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...rest}
    />
  );
}

export function Select({ className = "", id, children, ...rest }) {
  return (
    <select
      id={id}
      className={`mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
