export function Button({
  children,
  className = "",
  variant = "primary",
  disabled,
  type = "button",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600",
    secondary:
      "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-brand-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
