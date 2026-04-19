import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Label, Select } from "../../components/ui/Input.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { fetchOperateurAgents } from "../../services/operateurService.js";
import { fetchCollectes, patchCollecte } from "../../services/collecteService.js";

export function EquipePage() {
  const [agents, setAgents] = useState([]);
  const [collectes, setCollectes] = useState([]);
  const [collecteId, setCollecteId] = useState(null);
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([fetchOperateurAgents(), fetchCollectes()]);
      setAgents(u);
      setCollectes(c);
      if (!collecteId && c[0]) setCollecteId(c[0].id);
    } catch (e) {
      toast.error(e?.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const affecter = async () => {
    if (!collecteId || !agentId) {
      toast.error("Choisissez une collecte et un agent");
      return;
    }
    const coll = collectes.find((c) => c.id === collecteId);
    const idNum = Number(agentId);
    const equipeIds = Array.from(new Set([...(coll?.equipeIds || []), idNum]));
    try {
      await patchCollecte(collecteId, { equipeIds });
      setCollectes((prev) =>
        prev.map((c) => (c.id === collecteId ? { ...c, equipeIds } : c))
      );
      toast.success("Équipe mise à jour");
      setAgentId("");
    } catch (e) {
      toast.error(e?.message || "Affectation impossible");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Affecter une équipe"
        subtitle="Associez des agents collecteurs aux missions planifiées."
        action={
          <Button type="button" variant="secondary" onClick={load}>
            Actualiser
          </Button>
        }
      />
      <Card className="max-w-xl">
        <div className="space-y-4">
          <div>
            <Label htmlFor="c">Collecte</Label>
            <Select
              id="c"
              value={collecteId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setCollecteId(v === "" ? null : Number(v));
              }}
            >
              {collectes.length === 0 ? (
                <option value="">Aucune collecte disponible</option>
              ) : (
                collectes.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.titre}
                  </option>
                ))
              )}
            </Select>
          </div>
          <div>
            <Label htmlFor="a">Agent à ajouter</Label>
            <Select id="a" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">— Choisir —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom} ({a.email})
                </option>
              ))}
            </Select>
          </div>
          <Button type="button" onClick={affecter}>
            Affecter à la collecte
          </Button>
        </div>
      </Card>
      <Card className="mt-6">
        <h3 className="text-base font-semibold text-slate-900">Récapitulatif</h3>
        <ul className="mt-3 space-y-3 text-sm">
          {collectes.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-100 p-3">
              <p className="font-medium text-slate-900">{c.titre}</p>
              <p className="text-xs text-slate-500">Collecte #{c.id}</p>
              <p className="mt-2 text-slate-600">
                Équipe :{" "}
                {(c.equipeIds || [])
                  .map((id) => {
                    const u = agents.find((x) => x.id === id);
                    return u ? `${u.prenom} ${u.nom}` : `#${id}`;
                  })
                  .join(", ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
