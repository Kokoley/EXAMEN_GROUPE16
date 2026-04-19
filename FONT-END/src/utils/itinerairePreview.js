/** Proposition d’itinéraire (même logique que le backend / mock : lat décroissante puis dépôt). */
export function buildItinerairePreview(signalements, signalementIds) {
  const ids = [...new Set(signalementIds.map(Number))];
  const rows = ids
    .map((id) => signalements.find((s) => s.id === id))
    .filter(Boolean);
  const sorted = [...rows].sort((a, b) => Number(b.latitude) - Number(a.latitude));
  const steps = sorted.map(
    (s) =>
      `Signalement #${s.id} (${Number(s.latitude).toFixed(3)}, ${Number(s.longitude).toFixed(3)})`
  );
  return [...steps, "Dépôt central — triage"];
}
