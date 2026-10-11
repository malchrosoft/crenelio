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
