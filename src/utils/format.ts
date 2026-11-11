/**
 * Helpers de formatage partagés (affichage français).
 */

/** Montant en euros (« 59,00 € »), « Gratuit » si nul ou négatif. */
export function formatEuro(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Gratuit';
  }
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

/** Distance en kilomètres (« 23,4 km »). */
export function formatKm(km: number): string {
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/**
 * Nom d'un fichier exporté : date du jour inversée puis application, triable et reconnaissable
 * (« 2026-11-11_crenelio_export_clients.csv »).
 */
export function exportFileName(subject: string): string {
  const today = new Date();
  const day = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  return `${day}_crenelio_export_${subject}.csv`;
}
