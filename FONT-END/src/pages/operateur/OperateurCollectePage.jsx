import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AdminModal } from "../../components/admin/AdminModal.jsx";
import { AdminTableShell } from "../../components/admin/AdminTableShell.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Label, Input, Select } from "../../components/ui/Input.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { fetchCollectes, patchCollecte, postCollecte } from "../../services/collecteService.js";
import { fetchOperateurAgents, fetchOperateurCamions } from "../../services/operateurService.js";
import { fetchSignalements } from "../../services/signalementService.js";
import { buildItinerairePreview } from "../../utils/itinerairePreview.js";

const AUTO_REFRESH_MS = 12000;

const STATUT_OPTIONS = [
  { value: "PLANIFIEE", label: "En attente (planifiée)" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINEE", label: "Terminé" },
  { value: "ANNULEE", label: "Annulée" }
];

function formatCoords(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return "—";
  return `${la.toFixed(4)}, ${ln.toFixed(4)}`;
}

export function OperateurCollectePage() {
  const [signalements, setSignalements] = useState([]);
  const [collectes, setCollectes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [camions, setCamions] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedSig, setSelectedSig] = useState(() => new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSigIds, setModalSigIds] = useState([]);
  const [titre, setTitre] = useState("");
  const [datePrevu, setDatePrevu] = useState(
    () => new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [agentId, setAgentId] = useState("");
  const [camionId, setCamionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingCollecteId, setUpdatingCollecteId] = useState(null);

  const agentById = useMemo(() => {
    const m = new Map();
    agents.forEach((a) => m.set(a.id, a));
    return m;
  }, [agents]);

  const camionById = useMemo(() => {
    const m = new Map();
    camions.forEach((c) => m.set(c.id, c));
    return m;
  }, [camions]);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setBusy(true);
    try {
      const [sig, coll, ag, cam] = await Promise.all([
        fetchSignalements(),
        fetchCollectes(),
        fetchOperateurAgents(),
        fetchOperateurCamions()
      ]);
      setSignalements(sig);
      setCollectes(coll);
      setAgents(ag);
      setCamions(cam);
    } catch (e) {
      if (!silent) {
        toast.error(e?.message || "Chargement impossible");
      }
    } finally {
      if (!silent) setBusy(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => refresh(true), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh(true);
      }
    };
    const onFocus = () => refresh(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const previewItineraire = useMemo(
    () => buildItinerairePreview(signalements, modalSigIds),
    [signalements, modalSigIds]
  );

  const toggleRowSelect = (id) => {
    setSelectedSig((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openModalWithIds = (ids) => {
    const uniq = [...new Set(ids.map(Number))].filter((id) =>
      signalements.some((s) => s.id === id)
    );
    if (uniq.length === 0) {
      toast.error("Sélectionnez au moins un signalement.");
      return;
    }
    setModalSigIds(uniq);
    setTitre(`Collecte — signalement(s) ${uniq.join(", ")}`);
    setDatePrevu(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    setAgentId("");
    setCamionId("");
    setModalOpen(true);
  };

  const openFromSelection = () => {
    openModalWithIds([...selectedSig]);
  };

  const toggleModalSig = (id) => {
    setModalSigIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length ? next : prev;
      }
      return [...new Set([...prev, id])];
    });
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const submitCollecte = async (e) => {
    e.preventDefault();
    if (modalSigIds.length === 0) {
      toast.error("Gardez au moins un signalement dans la mission.");
      return;
    }
    if (!agentId || !camionId) {
      toast.error("Choisissez un agent et un camion disponibles.");
      return;
    }
    const ag = agents.find((a) => a.id === Number(agentId));
    const cm = camions.find((c) => c.id === Number(camionId));
    if (ag && !ag.disponible) {
      toast.error("Cet agent n’est pas disponible.");
      return;
    }
    if (cm && !cm.disponible) {
      toast.error("Ce camion n’est pas disponible.");
      return;
    }

    setSaving(true);
    try {
      const created = await postCollecte({
        titre: titre.trim(),
        datePrevu,
        signalementIds: modalSigIds,
        agentId: Number(agentId),
        camionId: Number(camionId)
      });
      setCollectes((prev) => [...prev, created]);
      setSelectedSig(new Set());
      setModalOpen(false);
      toast.success("Collecte créée. Itinéraire calculé automatiquement.");
      await refresh(false);
    } catch (err) {
      toast.error(err?.message || "Création impossible");
    } finally {
      setSaving(false);
    }
  };

  const changeCollecteStatut = async (id, statut) => {
    setUpdatingCollecteId(id);
    try {
      const updated = await patchCollecte(id, { statut });
      setCollectes((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      toast.success("État de la collecte mis à jour");
      await refresh(true);
    } catch (e) {
      toast.error(e?.message || "Mise à jour impossible");
    } finally {
      setUpdatingCollecteId(null);
    }
  };

  if (initialLoad) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Signalements & collectes"
        subtitle="Consultez les alertes des chefs de site, lancez une collecte avec itinéraire automatique, affectez agent et camion disponibles, puis suivez les missions."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => refresh(false)} disabled={busy}>
              {busy ? "Actualisation…" : "Actualiser"}
            </Button>
            <Button
              type="button"
              onClick={openFromSelection}
              disabled={busy || selectedSig.size === 0}
            >
              Créer une collecte ({selectedSig.size || 0})
            </Button>
          </div>
        }
      />

      <section className="relative mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Signalements (chefs de site)
        </h2>
        {busy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]">
            <Spinner className="h-9 w-9" />
          </div>
        ) : null}
        <AdminTableShell>
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="w-10 px-2 py-3" aria-label="Sélection" />
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {signalements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-600">
                  Aucun signalement.
                </td>
              </tr>
            ) : (
              signalements.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={selectedSig.has(s.id)}
                      onChange={() => toggleRowSelect(s.id)}
                      aria-label={`Sélectionner signalement ${s.id}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3 text-slate-800">{s.description}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                    {formatCoords(s.latitude, s.longitude)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {s.creeLe ? new Date(s.creeLe).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {s.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-2 !py-1.5 text-xs"
                      onClick={() => openModalWithIds([s.id])}
                      disabled={busy}
                    >
                      Lancer une collecte
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableShell>
      </section>

      <section className="relative">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Collectes créées
        </h2>
        {busy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]">
            <Spinner className="h-9 w-9" />
          </div>
        ) : null}
        <AdminTableShell>
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Date prévue</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Camion</th>
              <th className="px-4 py-3">Itinéraire (aperçu)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {collectes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                  Aucune collecte. Créez-en à partir des signalements ci-dessus.
                </td>
              </tr>
            ) : (
              collectes.map((c) => {
                const aid = c.equipeIds?.[0];
                const agent = aid != null ? agentById.get(aid) : null;
                const cam = c.camionId != null ? camionById.get(c.camionId) : null;
                return (
                  <tr key={c.id} className="bg-white align-top hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{c.titre}</p>
                      <p className="text-xs text-slate-500">#{c.id}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {c.datePrevu}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        className="!mt-0 min-w-[11rem]"
                        value={c.statut}
                        disabled={updatingCollecteId === c.id || busy}
                        onChange={(e) => changeCollecteStatut(c.id, e.target.value)}
                        aria-label={`Statut collecte ${c.id}`}
                      >
                        {STATUT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {agent ? `${agent.prenom} ${agent.nom}` : aid != null ? `#${aid}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {cam ? `${cam.immatriculation} — ${cam.libelle}` : c.camionId != null ? `#${c.camionId}` : "—"}
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs text-slate-600">
                      {(c.itineraire || []).length ? (
                        <ol className="list-decimal space-y-1 pl-4">
                          {(c.itineraire || []).slice(0, 5).map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                          {(c.itineraire || []).length > 5 ? (
                            <li className="list-none text-slate-400">
                              +{(c.itineraire || []).length - 5} étape(s)…
                            </li>
                          ) : null}
                        </ol>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTableShell>
      </section>

      <AdminModal
        open={modalOpen}
        title="Nouvelle collecte"
        onClose={closeModal}
        widthClass="max-w-lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="form-nouvelle-collecte-op" disabled={saving}>
              {saving ? "Création…" : "Créer la collecte"}
            </Button>
          </>
        }
      >
        <form id="form-nouvelle-collecte-op" onSubmit={submitCollecte} className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="dprev">Date prévue</Label>
            <Input
              id="dprev"
              type="date"
              value={datePrevu}
              onChange={(e) => setDatePrevu(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">Signalements inclus</p>
            <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-100 p-2 text-sm">
              {signalements.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-md p-1 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={modalSigIds.includes(s.id)}
                      onChange={() => toggleModalSig(s.id)}
                      disabled={
                        saving || (modalSigIds.length === 1 && modalSigIds[0] === s.id)
                      }
                    />
                    <span>
                      <span className="font-mono text-xs text-slate-500">#{s.id}</span>
                      <span className="mt-0.5 block text-slate-700">{s.description}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Itinéraire proposé</p>
            <p className="mt-1 text-xs text-slate-600">
              Calcul automatique à partir des coordonnées (simulation). Non modifiable ici.
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-800">
              {previewItineraire.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <Label htmlFor="agent-sel">Agent collecteur</Label>
            <Select
              id="agent-sel"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
              disabled={saving}
            >
              <option value="">— Choisir —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id} disabled={!a.disponible}>
                  {a.prenom} {a.nom}
                  {!a.disponible ? " (indisponible)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="cam-sel">Camion</Label>
            <Select
              id="cam-sel"
              value={camionId}
              onChange={(e) => setCamionId(e.target.value)}
              required
              disabled={saving}
            >
              <option value="">— Choisir —</option>
              {camions.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.disponible}>
                  {c.immatriculation} — {c.libelle}
                  {!c.disponible ? " (indisponible)" : ""}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
