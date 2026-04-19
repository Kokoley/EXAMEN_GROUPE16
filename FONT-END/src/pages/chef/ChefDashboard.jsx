import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { labelSignalementStatut } from "../../constants/signalementStatuts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchSignalements } from "../../services/signalementService.js";
import { fetchNotifications } from "../../services/notificationService.js";

const REFRESH_MS = 12000;

export function ChefDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [silentBusy, setSilentBusy] = useState(false);
  const [signalements, setSignalements] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const load = useCallback(
    async (silent) => {
      if (silent) setSilentBusy(true);
      try {
        const [s, n] = await Promise.all([fetchSignalements(), fetchNotifications(user.id)]);
        setSignalements(s);
        setNotifs(n);
      } catch {
        if (!silent) {
          setSignalements([]);
          setNotifs([]);
        }
      } finally {
        if (silent) setSilentBusy(false);
        setLoading(false);
      }
    },
    [user.id]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load(true);
    };
    const onFocus = () => load(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  if (loading) return <PageLoader />;

  const nonLues = notifs.filter((x) => !x.lu).length;
  const mesSignalements = signalements
    .filter((s) => s.creeParId === user.id)
    .sort((a, b) => new Date(b.creeLe) - new Date(a.creeLe));

  return (
    <div>
      <PageHeader
        title="Tableau de bord — Chef de site"
        subtitle="Suivez l’évolution de vos signalements : statuts synchronisés avec les collectes, notifications à chaque changement d’état."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {silentBusy ? <Spinner className="h-5 w-5" /> : null}
            <Button type="button" variant="secondary" disabled={silentBusy} onClick={() => load(true)}>
              Actualiser
            </Button>
            <Link
              to="/chef-site/signalement"
              className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700"
            >
              Nouveau signalement
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Signalements enregistrés</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{mesSignalements.length}</p>
          <p className="mt-1 text-xs text-slate-500">dont vous êtes l’auteur</p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Notifications non lues</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{nonLues}</p>
          <Link
            to="/chef-site/notifications"
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Voir les notifications
          </Link>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Dernier signalement</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {mesSignalements[0] ? `#${mesSignalements[0].id}` : "—"}
          </p>
          {mesSignalements[0] ? (
            <p className="mt-1 text-xs font-medium text-brand-700">
              {labelSignalementStatut(mesSignalements[0].statut)}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            {mesSignalements[0]?.description?.slice(0, 80) || "Aucun"}
          </p>
        </Card>
      </div>

      <Card className="mt-6 !p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Vos signalements — état de suivi</h2>
          <Link
            to="/chef-site/notifications"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Notifications
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Le statut se met à jour automatiquement selon la collecte qui inclut votre signalement
          (planifiée, en cours, terminée).
        </p>
        {mesSignalements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucun signalement pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {mesSignalements.slice(0, 8).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <span className="font-mono text-xs text-slate-500">#{s.id}</span>
                  <p className="text-slate-800">{s.description?.slice(0, 100)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                  {labelSignalementStatut(s.statut)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
