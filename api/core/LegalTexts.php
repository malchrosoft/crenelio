<?php
/**
 * LegalTexts — Textes réglementaires repris dans les emails des devis (Item 22), identiques à ceux de la
 * page et de la version imprimable : `src/utils/withdrawalNotice.ts`, `src/utils/builderGuarantees.ts`,
 * `src/utils/legalIdentity.ts` et le formulaire de `QuotePrintPage.tsx`. **Toute modification se fait
 * des deux côtés.** Textes officiels : docs/legal/fr/textes/ et docs/legal/fr/retractation-modele.md.
 */

class LegalTexts
{
    /** Formes juridiques dont le capital social figure sur les documents (C. com. R123-238), cf. CAPITAL_FORMS. */
    private const CAPITAL_FORMS = ['EURL', 'SARL', 'SASU', 'SAS'];

    /** « Nom – EI » ou « Raison sociale, SARL au capital de … » (C. com. R526-27, R123-238). */
    public static function legalIdentity(array $config): string
    {
        $form = (string)($config['legal_form'] ?? '') ?: 'ei';
        if ($form === 'ei') {
            return trim(($config['pro_name'] ?? '') ?: ($config['company_name'] ?? '')) . ' – ' . (($config['legal_ei_mention'] ?? '') ?: 'EI');
        }
        $name = ($config['legal_raison_sociale'] ?? '') ?: ($config['company_name'] ?? '');
        $capital = in_array($form, self::CAPITAL_FORMS, true) && !empty($config['legal_capital'])
            ? ' au capital de ' . number_format((float)$config['legal_capital'], 2, ',', ' ') . ' €'
            : '';
        return "$name, $form$capital";
    }

    /** Adresse : siège (mentions légales), sinon locaux. */
    public static function companyAddress(array $config): string
    {
        if (!empty($config['legal_adresse'])) {
            return trim(preg_replace('/\s+/', ' ', (string)$config['legal_adresse']));
        }
        $city = trim(($config['premises_postal_code'] ?? '') . ' ' . ($config['premises_city'] ?? ''));
        return implode(', ', array_filter([(string)($config['premises_address'] ?? ''), $city]));
    }

    /** Lignes d'identification de l'entreprise (R111-1, R111-2, R123-237). */
    public static function companyLines(array $config): array
    {
        return array_values(array_filter([
            (string)($config['company_name'] ?? ''),
            self::legalIdentity($config),
            self::companyAddress($config),
            !empty($config['legal_siret']) ? 'SIRET ' . $config['legal_siret'] : '',
            !empty($config['legal_vat_number']) ? 'N° TVA ' . $config['legal_vat_number'] : '',
            (string)($config['legal_rm'] ?? ''),
            !empty($config['legal_assurance']) ? 'Assurance : ' . $config['legal_assurance'] : '',
            implode(' · ', array_filter([(string)($config['pro_phone'] ?? ''), (string)($config['pro_email'] ?? '')])),
        ]));
    }

    /** Garanties des constructeurs (C. civ. 1792 à 1792-7), cf. `builderGuarantees.ts`. */
    public static function builderGuarantees(): array
    {
        return [
            "Garantie de parfait achèvement : un an à compter de la réception des travaux, pour les désordres signalés (Code civil, art. 1792-6).",
            "Garantie de bon fonctionnement des éléments d'équipement dissociables de l'ouvrage : deux ans minimum à compter de la réception (art. 1792-3).",
            "Garantie décennale : dix ans à compter de la réception, pour les dommages qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination (art. 1792, 1792-2 et 1792-4-1).",
            "Ces garanties ne peuvent être ni exclues ni limitées par le contrat (art. 1792-5).",
        ];
    }

    /**
     * Modèle d'information sur la rétractation (annexe à l'article R221-3, version du 19 juin 2026), complété
     * pour un contrat de service conclu en ligne : instructions (1) a, (2), (3) et (6) ; (4) et (5) omis.
     * Texte réglementaire : ne pas reformuler (cf. `withdrawalNotice.ts`).
     *
     * @return array{title: string, sections: array<string, string[]>}
     */
    public static function withdrawalNotice(array $config, string $withdrawalUrl): array
    {
        $notifyTo = implode(', ', array_filter([
            (string)($config['company_name'] ?? ''), self::companyAddress($config),
            (string)($config['pro_phone'] ?? ''), (string)($config['pro_email'] ?? ''),
        ]));
        return [
            'title' => "INFORMATIONS CONCERNANT L'EXERCICE DU DROIT DE RÉTRACTATION",
            'sections' => [
                'Droit de rétractation' => [
                    'Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours.',
                    'Le délai de rétractation expire quatorze jours après le jour de la conclusion du contrat.',
                    "Pour exercer le droit de rétractation, vous devez nous notifier ($notifyTo) votre décision de rétractation du présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce n'est pas obligatoire. Vous pouvez également exercer votre droit de rétractation en ligne sur $withdrawalUrl. Si vous utilisez cette fonctionnalité en ligne, nous vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa soumission.",
                    "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.",
                ],
                'Effets de rétractation' => [
                    "En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ; en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous.",
                    "Si vous avez demandé de commencer la prestation de services pendant le délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni jusqu'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à l'ensemble des prestations prévues par le contrat.",
                ],
            ],
        ];
    }

    /** Formulaire type de rétractation (annexe à l'article R221-1, décret n° 2022-424), mot pour mot. */
    public static function withdrawalForm(array $config, array $quote): array
    {
        $to = implode(', ', array_filter([
            (string)($config['company_name'] ?? ''), self::companyAddress($config), (string)($config['pro_email'] ?? ''),
        ]));
        return [
            'MODÈLE DE FORMULAIRE DE RÉTRACTATION',
            '(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)',
            "A l'attention de $to :",
            'Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :',
            'Devis n° ' . $quote['number'] . (!empty($quote['title']) ? ' — ' . $quote['title'] : ''),
            'Commandé le (*)/reçu le (*) :',
            'Nom du (des) consommateur(s) :',
            'Adresse du (des) consommateur(s) :',
            'Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :',
            'Date :',
            '(*) Rayez la mention inutile.',
        ];
    }
}
