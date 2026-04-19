import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminModal } from "../../components/admin/AdminModal.jsx";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog.jsx";
import { AdminTableShell } from "../../components/admin/AdminTableShell.jsx";
import {
  UserForm,
  emptyUserForm,
  userToFormValues
} from "../../components/admin/UserForm.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { ROLE_LABELS } from "../../constants/roles.js";
import {
  createUtilisateur,
  fetchSites,
  fetchUtilisateurs,
  removeUtilisateur,
  updateUtilisateur
} from "../../services/adminService.js";

function siteLabel(sites, siteId) {
  if (siteId == null) return "—";
  const s = sites.find((x) => x.id === siteId);
  return s?.nom ?? `Site #${siteId}`;
}

export function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userModal, setUserModal] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [u, s] = await Promise.all([fetchUtilisateurs(), fetchSites()]);
      setUsers(u);
      setSites(s);
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
    setUserForm(emptyUserForm());
    setUserModal({ mode: "create" });
  };

  const openEdit = (user) => {
    setUserForm(userToFormValues(user));
    setUserModal({ mode: "edit", user });
  };

  const closeUserModal = () => {
    if (savingUser) return;
    setUserModal(null);
  };

  const patchForm = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitUser = async (e) => {
    e.preventDefault();
    if (!userModal) return;

    if (userModal.mode === "create" && !userForm.password?.trim()) {
      toast.error("Le mot de passe est requis pour un nouvel utilisateur.");
      return;
    }

    setSavingUser(true);
    try {
      const siteId =
        userForm.siteId === "" || userForm.siteId === undefined
          ? null
          : Number(userForm.siteId);

      if (userModal.mode === "create") {
        await createUtilisateur({
          prenom: userForm.prenom.trim(),
          nom: userForm.nom.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          role: userForm.role,
          siteId
        });
        toast.success("Utilisateur créé avec succès.");
      } else {
        const id = userModal.user.id;
        const payload = {
          prenom: userForm.prenom.trim(),
          nom: userForm.nom.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          siteId
        };
        if (userForm.password?.trim()) {
          payload.password = userForm.password;
        }
        await updateUtilisateur(id, payload);
        toast.success("Utilisateur mis à jour.");
      }
      setUserModal(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "L’opération a échoué.");
    } finally {
      setSavingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setDeletingUser(true);
    try {
      await removeUtilisateur(deleteUserTarget.id);
      toast.success("Utilisateur supprimé.");
      setDeleteUserTarget(null);
      await refresh();
    } catch (err) {
      toast.error(err?.message || "Suppression impossible.");
    } finally {
      setDeletingUser(false);
    }
  };

  if (initialLoad) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Création, consultation et gestion des agents, opérateurs et chefs de site."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={refresh} disabled={busy}>
              {busy ? "Actualisation…" : "Actualiser"}
            </Button>
            <Button type="button" onClick={openCreate} disabled={busy}>
              Nouvel utilisateur
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                  Aucun utilisateur à afficher.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.prenom} {u.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{siteLabel(sites, u.siteId)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => openEdit(u)}
                        disabled={busy}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => setDeleteUserTarget(u)}
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
        open={Boolean(userModal)}
        title={userModal?.mode === "create" ? "Nouvel utilisateur" : "Modifier l’utilisateur"}
        onClose={closeUserModal}
        widthClass="max-w-lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeUserModal} disabled={savingUser}>
              Annuler
            </Button>
            <Button type="submit" form="user-admin-form" disabled={savingUser}>
              {savingUser ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="user-admin-form" onSubmit={submitUser}>
          <UserForm
            mode={userModal?.mode ?? "create"}
            values={userForm}
            onChange={patchForm}
            sites={sites}
            disabled={savingUser}
          />
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteUserTarget)}
        title="Supprimer cet utilisateur ?"
        message={
          deleteUserTarget
            ? `Confirmer la suppression de ${deleteUserTarget.prenom} ${deleteUserTarget.nom} (${deleteUserTarget.email}) ? Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        onCancel={() => !deletingUser && setDeleteUserTarget(null)}
        onConfirm={confirmDeleteUser}
        loading={deletingUser}
        danger
      />
    </div>
  );
}
