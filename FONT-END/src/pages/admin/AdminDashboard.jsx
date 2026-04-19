import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { fetchStatistiques } from "../../services/statsService.js";
import { fetchUtilisateurs, fetchSites } from "../../services/adminService.js";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({ users: null, sites: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, users, sites] = await Promise.all([
          fetchStatistiques(),
          fetchUtilisateurs().catch(() => []),
          fetchSites().catch(() => [])
        ]);
        if (!cancelled) {
          setStats(s);
          setCounts({
            users: Array.isArray(users) ? users.length : 0,
            sites: Array.isArray(sites) ? sites.length : 0
          });
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setCounts({ users: null, sites: null });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Tableau de bord — Administrateur"
        subtitle="Supervision globale du système de gestion de collecte."
        action={
          <Link
            to="/admin/statistiques"
            className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Voir les statistiques
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Signalements</p>
          <p className="mt-2 text-3xl font-bold">{stats?.signalementsTotal ?? "—"}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Collectes</p>
          <p className="mt-2 text-3xl font-bold">{stats?.collectesTotal ?? "—"}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Collectes en cours</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {stats?.collectesEnCours ?? "—"}
          </p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Agents actifs (GPS)</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">
            {stats?.agentsActifs ?? "—"}
          </p>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-base font-semibold text-slate-900">Administration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gérez les comptes utilisateurs et les sites de collecte (CRUD complet, actualisation en direct).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="!p-5">
            <p className="text-sm font-medium text-slate-900">Utilisateurs</p>
            <p className="mt-1 text-sm text-slate-600">
              {counts.users != null ? `${counts.users} compte(s)` : "—"}
            </p>
            <Link
              to="/admin/utilisateurs"
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Ouvrir la gestion
            </Link>
          </Card>
          <Card className="!p-5">
            <p className="text-sm font-medium text-slate-900">Sites</p>
            <p className="mt-1 text-sm text-slate-600">
              {counts.sites != null ? `${counts.sites} site(s)` : "—"}
            </p>
            <Link
              to="/admin/sites"
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Ouvrir la gestion
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
