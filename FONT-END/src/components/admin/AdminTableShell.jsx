export function AdminTableShell({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}
