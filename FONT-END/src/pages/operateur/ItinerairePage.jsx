import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Label, Select } from "../../components/ui/Input.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { fetchCollectes, patchCollecte } from "../../services/collecteService.js";

export function ItinerairePage() {
  const [collectes, setCollectes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const c = await fetchCollectes();
      setCollectes(c);
      if (!activeId && c[0]) setActiveId(c[0].id);
    } catch (e) {
      toast.error(e?.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const active = collectes.find((c) => c.id === activeId);

  useEffect(() => {
    if (active) setDraft((active.itineraire || []).join("\n"));
  }, [active]);

  const proposerOrdre = () => {
    if (!active?.signalementIds?.length) {
      toast.error("Aucun signalement lié à cette collecte");
      return;
    }
    const ordered = active.signalementIds.map((id) => `SIG-${id} (optimisé)`);
    setDraft([...ordered, "Dépôt central"].join("\n"));
    toast.success("Ordre proposé (simulation)");
  };

  const enregistrer = async () => {
    if (!active) return;
    const itineraire = draft
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await patchCollecte(active.id, { itineraire });
      setCollectes((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, itineraire } : c))
      );
      toast.success("Itinéraire enregistré");
    } catch (e) {
      toast.error(e?.message || "Sauvegarde impossible");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Itinéraire"
        subtitle="Proposez un ordre de passage et ajustez-le avant la mission."
        action={
          <Button type="button" variant="secondary" onClick={load}>
            Actualiser
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <Label htmlFor="coll">Collecte</Label>
          <Select
            id="coll"
            value={activeId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setActiveId(v === "" ? null : Number(v));
            }}
          >
            {collectes.length === 0 ? (
              <option value="">Aucune collecte</option>
            ) : (
              collectes.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.titre}
                </option>
              ))
            )}
          </Select>
          {collectes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Créez d’abord une collecte.</p>
          ) : null}
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">Étapes (une par ligne)</h3>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={proposerOrdre}>
                Proposer un ordre
              </Button>
              <Button type="button" onClick={enregistrer}>
                Enregistrer
              </Button>
            </div>
          </div>
          <textarea
            className="mt-4 min-h-[220px] w-full rounded-xl border border-slate-200 p-3 font-mono text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"SIG-101\nPoint de triage\nDépôt central"}
          />
        </Card>
      </div>
    </div>
  );
}
