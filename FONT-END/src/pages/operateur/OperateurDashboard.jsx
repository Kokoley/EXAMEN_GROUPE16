import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { fetchSignalements } from "../../services/signalementService.js";
import { fetchCollectes } from "../../services/collecteService.js";

const REFRESH_MS = 12000;

export function OperateurDashboard() {
  const [signalements, setSignalements] = useState([]);
  const [collectes, setCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [silentBusy, setSilentBusy] = useState(false);

  const loadData = useCallback(async (silent) => {
    if (silent) setSilentBusy(true);
    try {
      const [s, c] = await Promise.all([fetchSignalements(), fetchCollectes()]);
      setSignalements(s);
      setCollectes(c);
    } catch {
      if (!silent) {
        setSignalements([]);
        setCollectes([]);
      }
    } finally {
      if (silent) setSilentBusy(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const id = setInterval(() => loadData(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [loadData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    const onFocus = () => loadData(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadData]);

  if (loading) return <PageLoader />;

  const nouveaux = signalements.filter((x) => x.statut === "NOUVEAU").length;
  const collectesAttente = collectes.filter((c) => c.statut === "PLANIFIEE").length;
  const collectesEnCours = collectes.filter((c) => c.statut === "EN_COURS").length;
  const collectesTerminees = collectes.filter((c) => c.statut === "TERMINEE").length;

  return (
    <div>
      <PageHeader
        title="Tableau de bord — Opérateur"
        subtitle="Les états des collectes se mettent à jour automatiquement (agent sur le terrain) et toutes les 12 s."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              {silentBusy ? <Spinner className="h-5 w-5" /> : null}
              <Button
                type="button"
                variant="secondary"
                disabled={silentBusy}
                onClick={() => loadData(true)}
              >
                Actualiser
              </Button>
            </span>
            <Link
              to="/operateur/collectes"
              className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Organiser une collecte
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Signalements</p>
          <p className="mt-2 text-3xl font-bold">{signalements.length}</p>
          <p className="text-xs text-slate-500">{nouveaux} nouveaux</p>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Collectes — suivi des états</p>
          <p className="mt-2 text-3xl font-bold">{collectes.length}</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            <li>
              <span className="font-medium text-slate-800">{collectesAttente}</span> en attente
              (planifiée)
            </li>
            <li>
              <span className="font-medium text-amber-700">{collectesEnCours}</span> en cours
              <span className="text-slate-400"> — mis à jour par l’agent</span>
            </li>
            <li>
              <span className="font-medium text-emerald-700">{collectesTerminees}</span> terminées
            </li>
          </ul>
        </Card>
        <Card className="!p-5">
          <p className="text-sm text-slate-500">Actions rapides</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link className="font-medium text-brand-600 hover:underline" to="/operateur/signalements">
              Consulter les signalements
            </Link>
            <Link className="font-medium text-brand-600 hover:underline" to="/operateur/equipe">
              Affecter une équipe
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
