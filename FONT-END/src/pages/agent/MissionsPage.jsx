import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Label, Select } from "../../components/ui/Input.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchMissionsAgent, patchCollecte } from "../../services/collecteService.js";

const STATUTS = [
  { value: "PLANIFIEE", label: "Planifiée" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "ANNULEE", label: "Annulée" }
];

export function MissionsPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const m = await fetchMissionsAgent(user.id);
      setMissions(m);
    } catch (e) {
      toast.error(e?.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const changeStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await patchCollecte(id, { statut });
      setMissions((prev) => prev.map((c) => (c.id === id ? { ...c, statut } : c)));
      toast.success("État de la collecte mis à jour");
    } catch (e) {
      toast.error(e?.message || "Mise à jour impossible");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Missions"
        subtitle="Collectes auxquelles vous êtes affecté. Mettez à jour l’état sur le terrain."
        action={
          <Button type="button" variant="secondary" onClick={load}>
            Actualiser
          </Button>
        }
      />
      <div className="space-y-4">
        {missions.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Aucune mission pour l’instant.</p>
          </Card>
        ) : (
          missions.map((m) => (
            <Card key={m.id} className="!p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                    Collecte #{m.id}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{m.titre}</h2>
                  <p className="text-sm text-slate-600">
                    Date prévue : <span className="font-medium">{m.datePrevu}</span>
                  </p>
                  {m.itineraire?.length ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Itinéraire : {m.itineraire.join(" → ")}
                    </p>
                  ) : null}
                </div>
                <div className="w-full max-w-xs">
                  <Label htmlFor={`st-${m.id}`}>État de la collecte</Label>
                  <Select
                    id={`st-${m.id}`}
                    value={m.statut}
                    disabled={updating === m.id}
                    onChange={(e) => changeStatut(m.id, e.target.value)}
                  >
                    {STATUTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
