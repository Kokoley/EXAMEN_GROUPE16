import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart as ReBarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { fetchStatistiques } from "../../services/statsService.js";

const COLORS = ["#2563eb", "#0f172a", "#f59e0b", "#059669", "#7c3aed", "#ef4444", "#0891b2"];
const formatInt = (n) => new Intl.NumberFormat("fr-FR").format(Number(n) || 0);

export function StatistiquesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setStats(await fetchStatistiques());
    } catch (e) {
      const msg = e?.message || "Chargement impossible";
      setLoadError(msg);
      setStats(null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rep = stats?.repartitionStatuts || {};
  const volumes = useMemo(
    () => [
      { name: "Signalements", value: Number(stats?.signalementsTotal) || 0 },
      { name: "Collectes", value: Number(stats?.collectesTotal) || 0 },
      { name: "Collectes en cours", value: Number(stats?.collectesEnCours) || 0 },
      { name: "Agents actifs (GPS)", value: Number(stats?.agentsActifs) || 0 }
    ],
    [stats]
  );
  const repSeries = useMemo(() => {
    const entries = Object.entries(rep).map(([k, v]) => ({ k, v: Number(v) || 0 }));
    return entries.sort((a, b) => b.v - a.v);
  }, [rep]);
  const repChartData = useMemo(
    () => repSeries.filter((x) => x.v > 0).map((x) => ({ name: x.k, value: x.v })),
    [repSeries]
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Statistiques globales"
        subtitle="Indicateurs consolidés pour le pilotage de la collecte."
        action={
          <Button type="button" variant="secondary" onClick={load}>
            Actualiser
          </Button>
        }
      />
      <p className="mt-2 text-xs text-slate-500">
        Données chargées: {stats ? "oui" : "non"}
      </p>
      {loadError ? (
        <Card className="!p-5">
          <p className="text-sm font-semibold text-slate-900">Impossible de charger les statistiques</p>
          <p className="mt-1 text-sm text-slate-600">{loadError}</p>
          <p className="mt-4 text-xs text-slate-500">
            Vérifiez que le back-end tourne, que vous êtes connecté avec un rôle autorisé (Admin/Opérateur),
            et que la base de données est accessible.
          </p>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-slate-900">Volumes</h3>
          <div className="mt-4 w-full" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={volumes} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatInt(v)} />
                <Legend />
                <Bar dataKey="value" name="Total">
                  {volumes.map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {volumes.map((v) => (
              <li key={v.name} className="flex items-baseline justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-700">{v.name}</span>
                <span className="font-semibold text-slate-900">{formatInt(v.value)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-900">Signalements par statut</h3>
          {repChartData.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Pas de données.</p>
          ) : (
            <div className="mt-4 w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(v) => formatInt(v)} />
                  <Legend />
                  <Pie data={repChartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {repChartData.map((_, i) => (
                      <Cell key={`p-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            {repSeries.map(({ k, v }) => (
              <div key={k} className="flex items-baseline justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-700">{k}</span>
                <span className="font-semibold text-slate-900">{formatInt(v)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
