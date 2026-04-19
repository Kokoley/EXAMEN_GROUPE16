import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminModal } from "../../components/admin/AdminModal.jsx";
import { AdminTableShell } from "../../components/admin/AdminTableShell.jsx";
import { CamionForm, camionToFormValues, emptyCamionForm } from "../../components/admin/CamionForm.jsx";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import {
  createCamion,
  fetchCamionsAdmin,
  removeCamion,
  updateCamion
} from "../../services/adminService.js";

export function CamionsPage() {
  const [camions, setCamions] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [busy, setBusy] = useState(false);

  const [camionModal, setCamionModal] = useState(null);
  const [camionForm, setCamionForm] = useState(emptyCamionForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      setCamions(await fetchCamionsAdmin());
    } catch (e) {
      toast.error(e?.message || "Chargement impossible");
    } finally {
      setBusy(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = () => {
    setCamionForm(emptyCamionForm());
    setCamionModal({ mode: "create" });
  };

  const openEdit = (camion) => {
    setCamionForm(camionToFormValues(camion));
    setCamionModal({ mode: "edit", camion });
  };

  const closeModal = () => {
    if (saving) return;
    setCamionModal(null);
  };

  const patchForm = (field, value) => {
    setCamionForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!camionModal) return;
    setSaving(true);
    try {
      const payload = {
        immatriculation: camionForm.immatriculation.trim(),
        libelle: camionForm.libelle.trim()
      };
      if (camionModal.mode === "create") {
        await createCamion(payload);
        toast.success("Camion créé.");
      } else {
        await updateCamion(camionModal.camion.id, payload);
        toast.success("Camion mis à jour.");
      }
      setCamionModal(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "L’opération a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeCamion(deleteTarget.id);
      toast.success("Camion supprimé.");
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "Suppression impossible.");
    } finally {
      setDeleting(false);
    }
  };

  if (initialLoad) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Camions"
        subtitle="Gestion des camions : immatriculation et libellé."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={refresh} disabled={busy}>
              {busy ? "Actualisation…" : "Actualiser"}
            </Button>
            <Button type="button" onClick={openCreate} disabled={busy}>
              Nouveau camion
            </Button>
          </div>
        }
      />

      <div className="relative">
        {busy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]">
            <Spinner className="h-9 w-9" label="Chargement…" />
          </div>
        ) : null}

        <AdminTableShell>
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Immatriculation</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {camions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-600">
                  Aucun camion enregistré.
                </td>
              </tr>
            ) : (
              camions.map((c) => (
                <tr key={c.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.immatriculation}</td>
                  <td className="px-4 py-3 text-slate-700">{c.libelle || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => openEdit(c)}
                        disabled={busy}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => setDeleteTarget(c)}
                        disabled={busy}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableShell>
      </div>

      <AdminModal
        open={Boolean(camionModal)}
        title={camionModal?.mode === "create" ? "Nouveau camion" : "Modifier le camion"}
        onClose={closeModal}
        widthClass="max-w-lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="camion-admin-form" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="camion-admin-form" onSubmit={submit}>
          <CamionForm values={camionForm} onChange={patchForm} disabled={saving} />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer ce camion ?"
        message={
          deleteTarget
            ? `Confirmer la suppression du camion « ${deleteTarget.immatriculation} » ?`
            : ""
        }
        confirmLabel="Supprimer"
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
      />
    </div>
  );
}

