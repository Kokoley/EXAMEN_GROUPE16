/** Libellés pour le suivi côté chef (lié aux collectes). */
export const SIGNALEMENT_STATUT_LABELS = {
  NOUVEAU: "Nouveau",
  PLANIFIE: "Pris en charge (collecte planifiée)",
  EN_COURS: "Collecte en cours sur le terrain",
  TRAITE: "Terminé (collecte effectuée)",
  ANNULE: "Annulé"
};

export function labelSignalementStatut(statut) {
  return SIGNALEMENT_STATUT_LABELS[statut] ?? statut ?? "—";
}
