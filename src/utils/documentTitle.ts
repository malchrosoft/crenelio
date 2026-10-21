/** Titre de l'onglet : nom de l'entreprise configuré, « Crénelio » à défaut. */
export function applyDocumentTitle(companyName: string | null | undefined): void {
  document.title = `${companyName?.trim() || 'Crénelio'} — Prise de rendez-vous en ligne`;
}
