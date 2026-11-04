/**
 * Modèle d'information sur le droit de rétractation (annexe à l'article R221-3 du Code de la
 * consommation, version du 19 juin 2026, décret n° 2026-3), complété pour un devis = contrat de service
 * conclu en ligne. Texte réglementaire : ne pas reformuler. Choix des instructions et texte intégral :
 * docs/legal/fr/retractation-modele.md.
 */

export interface WithdrawalNoticeParty {
  /** Nom de l'entreprise (instruction 2). */
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Adresse où se trouve la fonctionnalité de rétractation en ligne (instruction 3). */
  withdrawalUrl: string;
  /** Devis assimilé à une vente (fourniture revendue, L221-1, II) : passages (1) b et (5). */
  sale?: boolean;
}

export interface WithdrawalNotice {
  title: string;
  sections: { heading: string; paragraphs: string[] }[];
}

export function withdrawalNotice(party: WithdrawalNoticeParty): WithdrawalNotice {
  const notifyTo = [party.name, party.address, party.phone, party.email].filter(Boolean).join(', ');
  return {
    title: "INFORMATIONS CONCERNANT L'EXERCICE DU DROIT DE RÉTRACTATION",
    sections: [
      {
        heading: 'Droit de rétractation',
        paragraphs: [
          'Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours.',
          // (1) a) contrat de service ; b) contrat de vente
          `Le délai de rétractation expire quatorze jours après le jour ${party.sale ? "où vous-même, ou un tiers autre que le transporteur et désigné par vous, prend physiquement possession du bien." : 'de la conclusion du contrat.'}`,
          // (2) identité et coordonnées ; (3) fonctionnalité de rétractation en ligne
          `Pour exercer le droit de rétractation, vous devez nous notifier (${notifyTo}) votre décision de rétractation du présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce n'est pas obligatoire. Vous pouvez également exercer votre droit de rétractation en ligne sur ${party.withdrawalUrl}. Si vous utilisez cette fonctionnalité en ligne, nous vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa soumission.`,
          "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.",
        ],
      },
      {
        heading: 'Effets de rétractation',
        paragraphs: [
          // (4) sans objet : en cas de vente, le professionnel récupère le bien ((5) a)
          "En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ; en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous.",
          // (5) a, b, c : vente, bien récupéré par le professionnel à ses frais
          ...(party.sale ? ["Nous récupérerons le bien. Nous prendrons en charge les frais de renvoi du bien. Votre responsabilité n'est engagée qu'à l'égard de la dépréciation du bien résultant de manipulations autres que celles nécessaires pour établir la nature, les caractéristiques et le bon fonctionnement de ce bien."] : []),
          // (6) prestation de services
          'Si vous avez demandé de commencer la prestation de services pendant le délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni jusqu\'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à l\'ensemble des prestations prévues par le contrat.',
        ],
      },
    ],
  };
}

/**
 * Information du client sur le formulaire prérempli en ligne (écart 13), identique à
 * `QuotePdf::ONLINE_FORM_NOTICE` (PHP) : complète le modèle réglementaire sans le modifier.
 */
export const ONLINE_FORM_NOTICE =
  'Pour vous rétracter plus simplement, un formulaire déjà rempli avec les références de votre contrat vous attend en ligne : il vous suffit de le vérifier puis de le valider. Un accusé de réception vous est aussitôt envoyé par email (Code de la consommation, articles L221-21 et D221-5).';

