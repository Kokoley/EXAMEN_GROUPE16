import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader, Spinner } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchNotifications, readNotification } from "../../services/notificationService.js";

const REFRESH_MS = 12000;

export function NotificationsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [silentBusy, setSilentBusy] = useState(false);

  const load = useCallback(
    async (silent) => {
      if (silent) setSilentBusy(true);
      try {
        const data = await fetchNotifications(user.id);
        setList(data);
      } catch (e) {
        if (!silent) toast.error(e?.message || "Chargement impossible");
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

  const marquerLu = async (id) => {
    try {
      await readNotification(id, user.id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
      toast.success("Notification mise à jour");
    } catch (e) {
      toast.error(e?.message || "Action impossible");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Dès qu’une collecte liée à votre signalement change d’état (agent ou opérateur), une alerte apparaît ici et le statut du signalement est mis à jour partout."
        action={
          <div className="flex items-center gap-2">
            {silentBusy ? <Spinner className="h-5 w-5" /> : null}
            <Button type="button" variant="secondary" disabled={silentBusy} onClick={() => load(true)}>
              Actualiser
            </Button>
          </div>
        }
      />
      <div className="space-y-3">
        {list.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Aucune notification pour le moment.</p>
          </Card>
        ) : (
          list.map((n) => (
            <Card
              key={n.id}
              className={`!p-4 ${n.lu ? "opacity-80" : "border-brand-100 bg-brand-50/40"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{n.titre}</p>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(n.creeLe).toLocaleString("fr-FR")}
                  </p>
                </div>
                {!n.lu ? (
                  <Button type="button" variant="secondary" onClick={() => marquerLu(n.id)}>
                    Marquer comme lu
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Lu</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
