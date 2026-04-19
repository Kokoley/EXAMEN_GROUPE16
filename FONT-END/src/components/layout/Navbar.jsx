import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ROLE_LABELS } from "../../constants/roles.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../ui/Button.jsx";

export function Navbar({ user, onMenuClick }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!user) return null;

  const display = [user.prenom, user.nom].filter(Boolean).join(" ") || user.email;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">{display}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 sm:inline">
          {user.email}
        </span>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            logout();
            toast.success("Déconnexion réussie");
            navigate("/login", { replace: true });
          }}
        >
          Déconnexion
        </Button>
      </div>
    </header>
  );
}
