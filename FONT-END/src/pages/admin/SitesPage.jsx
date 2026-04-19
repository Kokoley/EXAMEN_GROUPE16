import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminModal } from "../../components/admin/AdminModal.jsx";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog.jsx";
import { AdminTableShell } from "../../components/admin/AdminTableShell.jsx";
import {
  SiteForm,
  emptySiteForm,
  siteToFormValues
} from "../../components/admin/SiteForm.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import {
  createSiteApi,
  fetchSites,
  removeSite,
  updateSiteApi
} from "../../services/adminService.js";

export function SitesPage() {
  const [sites, setSites] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [siteModal, setSiteModal] = useState(null);
  const [siteForm, setSiteForm] = useState(emptySiteForm);
  const [savingSite, setSavingSite] = useState(false);
  const [deleteSiteTarget, setDeleteSiteTarget] = useState(null);
  const [deletingSite, setDeletingSite] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      setSites(await fetchSites());
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
    setSiteForm(emptySiteForm());
    setSiteModal({ mode: "create" });
  };

  const openEdit = (site) => {
    setSiteForm(siteToFormValues(site));
    setSiteModal({ mode: "edit", site });
  };

  const closeSiteModal = () => {
    if (savingSite) return;
    setSiteModal(null);
  };

  const patchForm = (field, value) => {
    setSiteForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitSite = async (e) => {
    e.preventDefault();
    if (!siteModal) return;

    setSavingSite(true);
    try {
      if (siteModal.mode === "create") {
        await createSiteApi({
          nom: siteForm.nom.trim(),
          localisation: siteForm.localisation.trim(),
          description: siteForm.description.trim(),
          actif: siteForm.actif
        });
        toast.success("Site créé avec succès.");
      } else {
        await updateSiteApi(siteModal.site.id, {
          nom: siteForm.nom.trim(),
          localisation: siteForm.localisation.trim(),
          description: siteForm.description.trim(),
          actif: siteForm.actif
        });
        toast.success("Site mis à jour.");
      }
      setSiteModal(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "L’opération a échoué.");
    } finally {
      setSavingSite(false);
    }
  };

  const confirmDeleteSite = async () => {
    if (!deleteSiteTarget) return;
    setDeletingSite(true);
    try {
      await removeSite(deleteSiteTarget.id);
      toast.success("Site supprimé.");
      setDeleteSiteTarget(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "Suppression impossible.");
    } finally {
      setDeletingSite(false);
    }
  };

  if (initialLoad) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Sites"
        subtitle="Gestion des sites de collecte : nom, localisation et description."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={refresh} disabled={busy}>
              {busy ? "Actualisation…" : "Actualiser"}
            </Button>
            <Button type="button" onClick={openCreate} disabled={busy}>
              Nouveau site
            </Button>
          </div>
        }
      />

      <div className="relative">
        {busy ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[1px]"
            aria-busy="true"
          >
            <Spinner className="h-9 w-9" label="Chargement…" />
          </div>
        ) : null}

        <AdminTableShell>
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sites.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                  Aucun site enregistré.
                </td>
              </tr>
            ) : (
              sites.map((s) => {
                const loc = s.localisation ?? s.adresse ?? "";
                const desc = s.description ?? "";
                return (
                  <tr key={s.id} className="bg-white hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.nom}</td>
                    <td className="px-4 py-3 text-slate-700">{loc || "—"}</td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      <span className="line-clamp-2 break-words" title={desc || undefined}>
                        {desc || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.actif !== false
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.actif !== false ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => openEdit(s)}
                          disabled={busy}
                        >
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => setDeleteSiteTarget(s)}
                          disabled={busy}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTableShell>
      </div>

      <AdminModal
        open={Boolean(siteModal)}
        title={siteModal?.mode === "create" ? "Nouveau site" : "Modifier le site"}
        onClose={closeSiteModal}
        widthClass="max-w-lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeSiteModal} disabled={savingSite}>
              Annuler
            </Button>
            <Button type="submit" form="site-admin-form" disabled={savingSite}>
              {savingSite ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="site-admin-form" onSubmit={submitSite}>
          <SiteForm values={siteForm} onChange={patchForm} disabled={savingSite} />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteSiteTarget)}
        title="Supprimer ce site ?"
        message={
          deleteSiteTarget
            ? `Confirmer la suppression de « ${deleteSiteTarget.nom} » ? Les utilisateurs ne pourront plus y être rattachés.`
            : ""
        }
        confirmLabel="Supprimer"
        onCancel={() => !deletingSite && setDeleteSiteTarget(null)}
        onConfirm={confirmDeleteSite}
        loading={deletingSite}
        danger
      />
    </div>
  );
}
