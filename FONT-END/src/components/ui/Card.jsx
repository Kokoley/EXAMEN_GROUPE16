export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h2>
  );
}
