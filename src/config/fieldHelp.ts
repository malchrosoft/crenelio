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

  // Réglages (clés de la table `config`, affichées par `ConfigGroupForm`)
  quote_vat_mode: {
    title: 'Régime de TVA',
    how: 'Franchise en base : vous ne facturez pas de TVA (micro-entreprise le plus souvent). Assujetti : vos devis indiquent la TVA ligne par ligne. Un devis déjà créé garde son régime.',
    why: 'En franchise, aucune TVA ne doit apparaître sur vos devis et factures, et une mention de franchise est obligatoire. Assujetti, votre numéro de TVA doit être communiqué au client.',
    refs: ['CGI, art. 293 B et 293 E', 'Code de la consommation, art. R111-2, 5°'],
    doc: 'fr/note-facture.md',
  },
  quote_vat_exemption: {
    title: 'Mention de franchise',
    how: '« article 293 B » pour la franchise en base ; « article 293 B bis » pour la franchise à destination d’un autre État membre. « Autre » seulement sur avis de votre comptable.',
    why: 'Le texte impose une mention correspondant à la base légale de la franchise, mot pour mot, sur les factures et les documents qui en tiennent lieu.',
    refs: ['CGI, art. 293 E, II'],
    doc: 'fr/note-facture.md',
  },
  quote_labour_rate: {
    title: 'Taux horaire de main-d’œuvre',
    how: 'Saisissez votre taux hors taxes : il préremplit les lignes de main-d’œuvre des devis, et la vitrine le publie TTC (TVA ajoutée si vous y êtes assujetti).',
    why: 'Le client doit connaître le taux horaire de main-d’œuvre TTC avant de conclure, et cette information doit être aisément accessible sur votre site.',
    refs: ['Arrêté du 24 janvier 2017, art. 2 et 3', 'Arrêté du 3 décembre 1987, art. 1'],
    doc: 'fr/devis-depannage.md',
  },
  quote_default_price: {
    title: 'Coût d’établissement d’un devis',
    how: 'Vide ou 0 : devis gratuit. Sinon, son prix TTC, publié dans les tarifs de la vitrine et prérempli sur chaque nouveau devis.',
    why: 'Le caractère gratuit ou payant du devis, et son coût, font partie des informations à donner avant la conclusion du contrat.',
    refs: ['Arrêté du 24 janvier 2017, art. 2'],
    doc: 'fr/devis-depannage.md',
  },
  pricing_exclusions: {
    title: 'Ce que les prix ne comprennent pas',
    how: 'Indiquez ce qui n’est pas compris dans vos prix affichés et qui sera nécessaire (ex. : les pièces, chiffrées sur devis).',
    why: 'Lorsqu’un prix annoncé ne comprend pas un élément indispensable au service, cette particularité doit être indiquée explicitement.',
    refs: ['Arrêté du 3 décembre 1987, art. 3'],
    doc: 'fr/devis-depannage.md',
  },
  quote_payment_terms: {
    title: 'Modalités de paiement par défaut',
    how: 'Moment du paiement et moyens acceptés ; reprises sur chaque nouveau devis, modifiables devis par devis.',
    why: 'Information obligatoire avant la conclusion du contrat.',
    refs: ['Code de la consommation, art. R111-1, 2° et R221-2, 4°'],
    doc: 'fr/devis-depannage.md',
  },
  quote_time_counting: {
    title: 'Décompte du temps estimé',
    how: 'Comment le temps de main-d’œuvre est compté (ex. : « par quart d’heure entamé »). Repris sur les devis et dans les tarifs de la vitrine.',
    why: 'Information à donner au client avant la conclusion du contrat, avec le taux horaire TTC.',
    refs: ['Arrêté du 24 janvier 2017, art. 2'],
    doc: 'fr/devis-depannage.md',
  },
  quote_allow_supply: {
    title: 'Revente de fournitures',
    how: 'N’activez que si la revente de pièces fait partie de votre activité déclarée. Sinon, utilisez les pièces achetées au nom du client (débours).',
    why: 'Revendre une pièce est une vente : le devis devient un contrat assimilé à une vente (délai de rétractation à compter de la remise du bien), et la TVA des pièces suit des règles propres si vous y êtes assujetti.',
    refs: ['Code de la consommation, art. L221-1, II et L221-18, 2°', 'BOI-TVA-BASE-10-20-40-20, § 140 et 150'],
    doc: 'fr/achat-revente.md',
  },
  quote_builder_guarantees: {
    title: 'Garanties des constructeurs',
    how: 'Cochez si certains de vos travaux constituent un ouvrage ou touchent un élément d’équipement indissociable (à qualifier avec votre assureur). Chaque devis propose alors la case correspondante.',
    why: 'Ces travaux engagent votre responsabilité décennale, qui doit être assurée ; l’attestation d’assurance est jointe aux devis et factures.',
    refs: ['Code civil, art. 1792 à 1792-7', 'Code des assurances, art. L241-1 et L243-2'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_form: {
    title: 'Forme juridique',
    how: 'Entreprise individuelle (micro-entreprise comprise) ou forme de votre société.',
    why: 'Le statut et la forme juridique sont communiqués au client ; ils déterminent la mention « EI » ou la forme et le capital imprimés sur vos documents.',
    refs: ['Code de la consommation, art. R111-2, 1°', 'Code de commerce, art. R526-27 et R123-238'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_ei_mention: {
    title: 'Appellation « EI »',
    how: '« EI » ou « Entrepreneur individuel », accolé immédiatement à votre nom.',
    why: 'L’entrepreneur individuel utilise une dénomination incorporant son nom suivi ou précédé de ces mots, sur tous ses documents et correspondances professionnels.',
    refs: ['Code de commerce, art. R526-27'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_rm: {
    title: 'Immatriculation',
    how: 'Registre où vous êtes inscrit : Registre national des entreprises (métiers de l’artisanat) ou RCS et sa ville.',
    why: 'Le numéro d’inscription au RNE ou au RCS est communiqué au client et figure sur vos documents commerciaux.',
    refs: ['Code de la consommation, art. R111-2, 3°', 'Code de commerce, art. R123-237'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_vat_number: {
    title: 'N° de TVA intracommunautaire',
    how: 'Seulement si vous êtes assujetti à la TVA. Laissez vide en franchise en base.',
    why: 'Le professionnel assujetti communique son numéro individuel d’identification à la TVA.',
    refs: ['Code de la consommation, art. R111-2, 5°'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_complaints: {
    title: 'Traitement des réclamations',
    how: 'Comment le client vous adresse une réclamation (email, courrier) et sous quel délai vous répondez.',
    why: 'Les modalités de traitement des réclamations font partie des informations à donner au client ; une réclamation préalable conditionne aussi le recours au médiateur.',
    refs: ['Code de la consommation, art. R111-1, 2° et L616-1'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_mediator: {
    title: 'Médiateur de la consommation',
    how: 'Nom, coordonnées et adresse du site internet du médiateur dont vous relevez (souvent proposé par votre organisation professionnelle).',
    why: 'Tout professionnel communique les coordonnées du médiateur dont il relève, de façon visible sur son site, et l’adresse du site du médiateur.',
    refs: ['Code de la consommation, art. L616-1 et R616-1'],
    doc: 'fr/mentions-entreprise.md',
  },
  legal_assurance: {
    title: 'Assurance professionnelle',
    how: 'Assureur, ses coordonnées et la couverture géographique du contrat.',
    why: 'Information à communiquer au client lorsque vous avez souscrit une assurance de responsabilité professionnelle.',
    refs: ['Code de la consommation, art. R111-2, 9°'],
    doc: 'fr/mentions-entreprise.md',
  },
} satisfies Record<string, FieldHelpEntry>;

export type FieldHelpKey = keyof typeof FIELD_HELP;

export const hasFieldHelp = (key: string): key is FieldHelpKey => key in FIELD_HELP;
