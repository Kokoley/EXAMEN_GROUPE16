export function Spinner({ className = "h-8 w-8", label }) {
  return (
    <span className="inline-flex flex-col items-center gap-2" role="status">
      <svg
        className={`animate-spin text-brand-600 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label ? (
        <span className="text-sm text-slate-600">{label}</span>
      ) : null}
    </span>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <Spinner className="h-10 w-10" label="Chargement…" />
    </div>
  );
}
