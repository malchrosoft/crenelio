/**
 * Aide contextuelle « ? » des champs délicats (Item 40) : comment remplir, pourquoi, sur quel texte.
 * Contenu tiré des fiches de `docs/legal/fr/` et des extraits officiels de `docs/legal/fr/textes/` :
 * toute évolution d'une fiche se reporte ici (et inversement). Jamais de règle sans texte officiel.
 */

export interface FieldHelpEntry {
  title: string;
  /** Comment le remplir. */
  how: string;
  /** Pourquoi il est demandé. */
  why: string;
  /** Textes officiels (code et article). */
  refs: string[];
  /** Fiche de la Documentation (relative à `docs/legal/`). */
  doc?: string;
}

export const FIELD_HELP = {
  title: {
    title: 'Nature exacte des travaux',
    how: 'Décrivez précisément la réparation ou l’entretien à effectuer (ex. : « Remplacement du groupe de sécurité du chauffe-eau »), pas seulement une catégorie (« Plomberie »).',
    why: 'Mention obligatoire du devis de dépannage, de réparation ou d’entretien : le client doit savoir exactement ce qu’il accepte.',
    refs: ['Arrêté du 24 janvier 2017, art. 4 (« la nature exacte des réparations à effectuer »)'],
    doc: 'fr/devis-depannage.md',
  },
  urgent: {
    title: 'Intervention urgente',
    how: 'Cochez seulement si le client vous a lui-même demandé d’intervenir en urgence chez lui. Le devis se limite alors aux pièces et travaux strictement nécessaires pour répondre à l’urgence.',
    why: 'Dans ce cas, le client n’a pas de droit de rétractation pour ces travaux. Tout ce qui dépasse l’urgence reste soumis au délai de quatorze jours.',
    refs: ['Code de la consommation, art. L221-28, 8°'],
    doc: 'fr/retractation.md',
  },
  builder_works: {
    title: 'Travaux relevant des garanties des constructeurs',
    how: 'Cochez pour des travaux de construction (ouvrage ou éléments d’équipement indissociables). Le devis imprime alors les garanties légales, et l’envoi exige une attestation d’assurance décennale en cours de validité, jointe automatiquement.',
    why: 'Ces travaux engagent votre responsabilité décennale, qui doit être assurée ; l’attestation doit être jointe aux devis et factures.',
    refs: ['Code civil, art. 1792 à 1792-7', 'Code des assurances, art. L241-1, L243-2 et A243-2 à A243-5'],
    doc: 'fr/mentions-entreprise.md',
  },
  client_siren: {
    title: 'SIREN ou SIRET du client',
    how: 'Seulement pour un client professionnel : 9 chiffres (SIREN) ou 14 chiffres (SIRET), espaces acceptés. Laissez vide pour un particulier.',
    why: 'Le numéro d’identification du client professionnel figure sur la facture. Le droit de rétractation reste proposé : il peut bénéficier aux professionnels de cinq salariés au plus, hors de leur activité principale.',
    refs: ['CGI, annexe II, art. 242 nonies A, 1°', 'Code de la consommation, art. L221-3'],
    doc: 'fr/note-facture.md',
  },
  execution_terms: {
    title: 'Date ou délai d’exécution',
    how: 'Indiquez une date ou un délai précis (ex. : « Sous 15 jours après votre accord » ou « Le 12 novembre 2026 »). Obligatoire pour envoyer le devis.',
    why: 'Le professionnel doit indiquer avant la conclusion du contrat la date ou le délai dans lequel il s’engage à fournir le service.',
    refs: ['Code de la consommation, art. L221-5, 3°'],
    doc: 'fr/devis-depannage.md',
  },
  payment_terms: {
    title: 'Modalités de paiement',
    how: 'Précisez le moment du paiement et les moyens acceptés (virement, chèque, espèces…). Valeur reprise des réglages. Obligatoire pour envoyer le devis.',
    why: 'Information précontractuelle obligatoire. Pour un contrat signé chez le client, aucun paiement ne peut être exigé avant sept jours.',
    refs: ['Code de la consommation, art. R111-1, 2°, R221-2, 4° et L221-10'],
    doc: 'fr/devis-depannage.md',
  },
  time_counting: {
    title: 'Décompte du temps estimé',
    how: 'Expliquez comment le temps de main-d’œuvre est compté (ex. : « Temps décompté par quart d’heure entamé »).',
    why: 'Information à donner au client avant la conclusion du contrat, avec le taux horaire TTC.',
    refs: ['Arrêté du 24 janvier 2017, art. 2'],
    doc: 'fr/devis-depannage.md',
  },
  quote_price: {
    title: 'Prix du devis',
    how: 'Laissez vide si le devis est gratuit ; sinon, indiquez son coût TTC. Valeur reprise des réglages.',
    why: 'Le client doit savoir avant tout engagement si le devis est gratuit ou payant, et combien il coûte.',
    refs: ['Arrêté du 24 janvier 2017, art. 2'],
    doc: 'fr/devis-depannage.md',
  },
  debours_budget: {
    title: 'Budget maximum du mandat de débours',
    how: 'Montant maximum que le client vous autorise à dépenser en son nom pour les pièces. Au-delà, il faut un nouvel accord.',
    why: 'Les débours (pièces achetées au nom et pour le compte du client, sur son mandat, refacturées à l’euro près) sont hors de votre chiffre d’affaires et sans votre TVA, à condition de respecter les conditions fixées par l’administration.',
    refs: ['CGI, art. 267 II 2°', 'BOI-TVA-BASE-10-20-40-30, § 130 (quatre conditions)'],
    doc: 'fr/debours.md',
  },
  goods_received: {
    title: 'Remise des pièces vendues',
    how: 'Saisissez le jour où le client a pris possession des pièces revendues, en général le jour de la pose. La fin du délai de rétractation est alors calculée.',
    why: 'Un devis comportant une fourniture revendue est assimilé à une vente : le délai de rétractation court de la prise de possession du bien, et non de l’acceptation.',
    refs: ['Code de la consommation, art. L221-1, II, L221-18, 2° et L221-19'],
    doc: 'fr/achat-revente.md',
  },
} satisfies Record<string, FieldHelpEntry>;

export type FieldHelpKey = keyof typeof FIELD_HELP;
