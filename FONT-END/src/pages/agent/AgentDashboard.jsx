import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchMissionsAgent } from "../../services/collecteService.js";

const REFRESH_MS = 15000;

export function AgentDashboard() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [silentBusy, setSilentBusy] = useState(false);

  const loadMissions = useCallback(
    async (silent) => {
      if (silent) setSilentBusy(true);
      try {
        const m = await fetchMissionsAgent(user.id);
        setMissions(m);
      } catch {
        if (!silent) setMissions([]);
      } finally {
        if (silent) setSilentBusy(false);
        setLoading(false);
      }
    },
    [user.id]
  );

  useEffect(() => {
    loadMissions(false);
  }, [loadMissions]);

  useEffect(() => {
    const id = setInterval(() => loadMissions(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [loadMissions]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadMissions(true);
    };
    const onFocus = () => loadMissions(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadMissions]);

  const stats = useMemo(() => {
    const total = missions.length;
    const planifiees = missions.filter((m) => m.statut === "PLANIFIEE").length;
    const enCours = missions.filter((m) => m.statut === "EN_COURS").length;
    const terminees = missions.filter((m) => m.statut === "TERMINEE").length;
    const autres = total - planifiees - enCours - terminees;
    return { total, planifiees, enCours, terminees, autres };
  }, [missions]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Tableau de bord — Agent collecteur"
        subtitle="Nombre de collectes auxquelles vous êtes affecté, et accès rapide aux missions et au GPS."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2">
              {silentBusy ? <Spinner className="h-5 w-5" /> : null}
              <Button
                type="button"
                variant="secondary"
                disabled={silentBusy}
                onClick={() => loadMissions(true)}
              >
                Actualiser
              </Button>
            </span>
            <Link
              to="/agent/missions"
              className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Voir les missions
            </Link>
            <Link
              to="/agent/gps"
              className="inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Envoyer position
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="!p-5 lg:col-span-1">
          <p className="text-sm text-slate-500">Collectes assignées</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{stats.total}</p>
          <p className="mt-2 text-sm text-slate-600">
            Vous êtes affecté à <strong>{stats.total}</strong>{" "}
            {stats.total <= 1 ? "collecte" : "collectes"} au total (historique des missions où vous
            figurez dans l’équipe).
          </p>
        </Card>
        <Card className="!p-5 lg:col-span-2">
          <p className="text-sm font-medium text-slate-800">Répartition par état</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <li className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-900">{stats.planifiees}</span> en attente
              (planifiée)
            </li>
            <li className="rounded-lg bg-amber-50 px-3 py-2">
              <span className="font-semibold text-amber-900">{stats.enCours}</span> en cours
            </li>
            <li className="rounded-lg bg-emerald-50 px-3 py-2">
              <span className="font-semibold text-emerald-900">{stats.terminees}</span> terminées
            </li>
            {stats.autres > 0 ? (
              <li className="rounded-lg bg-slate-100 px-3 py-2">
                <span className="font-semibold text-slate-800">{stats.autres}</span> autre(s) statut
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
      <Card className="mt-4 !p-5">
        <p className="text-sm text-slate-500">Prochaine mission (ordre de la liste)</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {missions[0]?.titre ?? "Aucune mission assignée pour l’instant"}
        </p>
        {missions[0]?.datePrevu ? (
          <p className="text-xs text-slate-500">Prévue le {missions[0].datePrevu}</p>
        ) : null}
      </Card>
    </div>
  );
}
