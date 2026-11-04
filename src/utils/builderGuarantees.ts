/**
 * Garanties des constructeurs rappelées sur les devis de travaux qui en relèvent (C. civ. 1792 à 1792-7,
 * textes : docs/legal/fr/textes/code-civil.md). Rappel factuel des articles, sans les reformuler au-delà.
 */
export const BUILDER_GUARANTEES: string[] = [
  "Garantie de parfait achèvement : un an à compter de la réception des travaux, pour les désordres signalés (Code civil, art. 1792-6).",
  "Garantie de bon fonctionnement des éléments d'équipement dissociables de l'ouvrage : deux ans minimum à compter de la réception (art. 1792-3).",
  "Garantie décennale : dix ans à compter de la réception, pour les dommages qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination (art. 1792, 1792-2 et 1792-4-1).",
  "Ces garanties ne peuvent être ni exclues ni limitées par le contrat (art. 1792-5).",
];

/** Lien public de l'attestation d'assurance décennale jointe au devis (C. assur. L243-2). */
export const attestationUrl = (token: string) => `/api/quotes/token/${token}/attestation`;
