import { NavLink } from "react-router-dom";
import { NAV_BY_ROLE } from "../../config/navConfig.jsx";
import { ROLE_LABELS } from "../../constants/roles.js";

export function Sidebar({ role, onNavigate }) {
  const items = NAV_BY_ROLE[role] ?? [];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          CollectePro
        </div>
        <p className="mt-1 text-sm text-slate-500">{ROLE_LABELS[role] ?? "Utilisateur"}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ to, label, icon: IconCmp }) => (
          <NavLink
            key={to}
            to={to}
            className={linkClass}
            onClick={() => onNavigate?.()}
          >
            <IconCmp />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
