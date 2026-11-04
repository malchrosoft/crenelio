<?php
/**
 * QuotePdf — Documents PDF d'un devis (Item 22, écart 13) produits avec `SimplePdf` :
 * - formulaire type de rétractation **remplissable** (annexe R221-1, mot pour mot), prérempli avec les
 *   références du contrat, joint à l'email d'accord (L221-9 : contrat « accompagné du formulaire type ») ;
 * - déclaration de rétractation **validée en ligne** (contenu, date et heure : L221-21, D221-5) ;
 * - **devis complet** et **mandat de débours** : même contenu que la version imprimable (`QuotePrintPage`),
 *   avec le logo et la couleur principale du thème, mise en page sobre.
 */

require_once __DIR__ . '/SimplePdf.php';
require_once __DIR__ . '/LegalTexts.php';
require_once __DIR__ . '/Branding.php';
require_once __DIR__ . '/EmailTemplates.php';

class QuotePdf
{
    /** Information du client sur le formulaire prérempli en ligne (écart 13, d). */
    public const ONLINE_FORM_NOTICE = 'Pour vous rétracter plus simplement, un formulaire déjà rempli avec les références de votre contrat vous attend en ligne : il vous suffit de le vérifier puis de le valider. Un accusé de réception vous est aussitôt envoyé par email (Code de la consommation, articles L221-21 et D221-5).';

    /** Formulaire type remplissable ; `$onlineUrl` : adresse du formulaire prérempli en ligne. */
    public static function withdrawalForm(array $quote, array $config, ?string $onlineUrl): string
    {
        $pdf = new SimplePdf('Formulaire de rétractation — devis ' . $quote['number']);
        self::header($pdf, $config, 'Formulaire de rétractation', 'Devis n° ' . $quote['number']);

        // Annexe à l'article R221-1, mot pour mot ; zones à compléter en champs remplissables
        $lines = LegalTexts::withdrawalForm($config, $quote);
        $pdf->paragraph($lines[0], 12, true, 6);
        $pdf->paragraph($lines[1], 10, false, 8);
        $pdf->paragraph($lines[2], 10, false, 8);
        $pdf->paragraph($lines[3], 10, false, 8);
        $pdf->paragraph($lines[4], 10, true, 10);
        $pdf->field('commande_le', 'Commandé le (*)/reçu le (*) :', !empty($quote['decided_at']) ? date('d/m/Y', strtotime((string)$quote['decided_at'])) : '');
        $pdf->field('nom', 'Nom du (des) consommateur(s) :', (string)$quote['client_name']);
        $address = trim(implode(', ', array_filter([(string)$quote['address'], trim($quote['postal_code'] . ' ' . $quote['city'])])));
        $pdf->field('adresse', 'Adresse du (des) consommateur(s) :', $address, 36, true);
        $pdf->field('signature', 'Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :', '', 40, true);
        $pdf->field('date', 'Date :');
        $pdf->paragraph($lines[10], 9, false, 14);

        if ($onlineUrl) {
            $pdf->rule();
            $pdf->paragraph(self::ONLINE_FORM_NOTICE, 9, false, 4);
            $pdf->paragraph($onlineUrl, 9, false, 0);
        }
        return $pdf->output();
    }

    /** Déclaration de rétractation envoyée en ligne (preuve remise au client et à l'artisan). */
    public static function withdrawalDeclaration(array $quote, array $config): string
    {
        $pdf = new SimplePdf('Déclaration de rétractation — devis ' . $quote['number']);
        self::header($pdf, $config, 'Déclaration de rétractation', 'Devis n° ' . $quote['number']);
        $sent = strtotime((string)$quote['withdrawn_at']);
        $pdf->paragraph(
            sprintf(
                'Je/nous vous notifie/notifions par la présente ma/notre rétractation du contrat pour la prestation de services ci-dessous, transmise en ligne le %s à %s.',
                date('d/m/Y', $sent),
                date('H:i', $sent)
            ),
            10,
            false,
            10
        );
        foreach ([
            'Contrat' => 'Devis n° ' . $quote['number'] . (!empty($quote['title']) ? ' — ' . $quote['title'] : ''),
            'Accepté le' => !empty($quote['decided_at']) ? date('d/m/Y', strtotime((string)$quote['decided_at'])) : '',
            'Nom' => (string)$quote['withdrawal_name'],
            'Adresse' => (string)($quote['withdrawal_address'] ?? ''),
            'Email de l\'accusé de réception' => (string)$quote['withdrawal_email'],
            'Envoyée le' => date('d/m/Y', $sent) . ' à ' . date('H:i:s', $sent),
        ] as $label => $value) {
            if ($value !== '') {
                $pdf->paragraph($label, 9, true, 0);
                $pdf->paragraph($value, 10, false, 8);
            }
        }
        $pdf->rule();
        $pdf->paragraph('Déclaration envoyée au moyen de la fonctionnalité de rétractation en ligne (Code de la consommation, articles L221-21 et D221-5). Toute somme versée est remboursée dans les quatorze jours (article L221-24).', 9, false, 0);
        return $pdf->output();
    }

    /** En-tête : entreprise (identité légale) puis titre du document. */
    private static function header(SimplePdf $pdf, array $config, string $title, string $reference): void
    {
        foreach (LegalTexts::companyLines($config) as $i => $line) {
            $pdf->paragraph($line, $i === 0 ? 11 : 9, $i === 0, 0);
        }
        $pdf->moveDown(8);
        $pdf->rule(12);
        $pdf->paragraph(mb_strtoupper($title, 'UTF-8'), 15, true, 2);
        $pdf->paragraph($reference, 10, false, 14);
    }

    // -----------------------------------------------------------------
    // Devis complet et mandat de débours
    // -----------------------------------------------------------------

    private const LABEL = [0.39, 0.45, 0.55];
    private const LINE = [0.85, 0.88, 0.92];

    /** Devis complet : mentions de l'arrêté du 24 janvier 2017 et de L221-5, rétractation, signatures. */
    public static function quote(array $quote, array $config): string
    {
        $primary = SimplePdf::rgb((string)($config['theme_primary'] ?? ''), [0.15, 0.39, 0.92]);
        $pdf = new SimplePdf('Devis ' . $quote['number']);
        $pdf->setFooter(($config['company_name'] ?? '') . ' — Devis n° ' . $quote['number']);
        $vat = $quote['vat_mode'] === 'vat';
        $lines = array_values(array_filter($quote['lines'] ?? [], fn($l) => $l['kind'] !== 'debours'));

        self::documentHeader($pdf, $config, $primary, 'DEVIS', array_filter([
            'N° ' . $quote['number'],
            !empty($quote['sent_at']) ? 'Établi le ' . self::day($quote['sent_at']) : '',
            !empty($quote['valid_until']) ? 'Valable jusqu\'au ' . self::day($quote['valid_until']) : '',
        ]));
        self::parties($pdf, $primary, 'Client', array_values(array_filter([
            (string)$quote['client_name'],
            (string)($quote['client_company'] ?? ''),
            !empty($quote['client_siren']) ? 'SIREN/SIRET ' . $quote['client_siren'] : '',
            trim(implode(', ', array_filter([(string)$quote['address'], trim($quote['postal_code'] . ' ' . $quote['city'])]))),
        ])), 'Intervention', array_filter([
            (string)($quote['title'] ?: 'Travaux'),
            !empty($quote['execution_terms']) ? 'Exécution : ' . $quote['execution_terms'] : '',
            (int)$quote['urgent'] ? 'Intervention urgente expressément demandée' : '',
        ]));
        if (!empty($quote['notes'])) {
            self::small($pdf, (string)$quote['notes']);
        }

        self::table($pdf, $primary, $lines, $vat);
        if (!empty($quote['time_counting']) && array_filter($lines, fn($l) => $l['kind'] === 'labour')) {
            self::small($pdf, (string)$quote['time_counting']);
        }
        $totals = $vat
            ? ['Total HT' => (float)$quote['total_ht'], 'TVA' => (float)$quote['total_vat'], 'Total TTC' => (float)$quote['total_ttc']]
            : ['Total TTC' => (float)$quote['total_ttc']];
        self::totals($pdf, $primary, $totals);
        if (!$vat) {
            self::small($pdf, (string)(($config['quote_vat_exemption'] ?? '') ?: 'TVA non applicable, article 293 B du CGI'), 'right');
        }
        if ((float)$quote['total_debours'] > 0) {
            self::small($pdf, sprintf(
                'Pièces achetées au nom et pour le compte du client : voir le mandat de débours (document distinct), estimées à %s, dans la limite de %s. Non comprises dans le total du devis.',
                self::money((float)$quote['total_debours']), self::money((float)($quote['debours_budget'] ?: $quote['total_debours']))
            ));
        }

        self::section($pdf, $primary, 'Conditions');
        foreach (array_filter([
            !empty($quote['payment_terms']) ? 'Paiement : ' . $quote['payment_terms'] : '',
            sprintf('Devis valable jusqu\'au %s (%d jours) · %s', self::day((string)$quote['valid_until']), (int)$quote['validity_days'],
                $quote['quote_price'] === null ? 'Devis gratuit' : 'Devis payant : ' . self::money((float)$quote['quote_price'])),
            !empty($config['legal_complaints']) ? 'Réclamations : ' . $config['legal_complaints'] : '',
            !empty($config['legal_mediator']) ? 'Médiation de la consommation : ' . $config['legal_mediator'] : '',
        ]) as $text) {
            self::small($pdf, $text);
        }

        // Pièces remplacées : annexe 2 de l'arrêté du 24 janvier 2017, mot pour mot
        self::section($pdf, $primary, 'Pièces remplacées');
        self::small($pdf, 'Souhaitez-vous conserver les pièces, éléments ou appareils remplacés ?');
        self::small($pdf, $quote['keep_parts'] !== null
            ? sprintf('Réponse du client en ligne le %s : %s.', self::moment((string)$quote['decided_at']), (int)$quote['keep_parts'] ? 'OUI' : 'NON (décharge)')
            : 'OUI □ NON □   Signature du consommateur précédée de la mention manuscrite " Lu et approuvé ".');

        if ((int)$quote['builder_works']) {
            self::section($pdf, $primary, 'Garanties légales des constructeurs');
            foreach (LegalTexts::builderGuarantees() as $text) {
                self::small($pdf, '• ' . $text);
            }
            self::small($pdf, "Attestation d'assurance de responsabilité décennale jointe (Code des assurances, art. L243-2).");
        }

        self::section($pdf, $primary, 'Droit de rétractation');
        if ((int)$quote['urgent']) {
            self::small($pdf, "Intervention urgente expressément demandée par le client : pas de droit de rétractation (article L221-28 du Code de la consommation), dans la limite des pièces de rechange et travaux strictement nécessaires pour répondre à l'urgence.");
        } else {
            $notice = LegalTexts::withdrawalNotice($config, (string)(EmailTemplates::quoteWithdrawalUrl($quote) ?? ''), (bool)(int)$quote['sale']);
            self::small($pdf, $notice['title'], 'left', true);
            foreach ($notice['sections'] as $title => $paragraphs) {
                self::small($pdf, $title, 'left', true);
                foreach ($paragraphs as $text) {
                    self::small($pdf, $text);
                }
            }
            if (!empty($quote['decided_at'])) {
                if ((int)$quote['early_execution']) {
                    self::small($pdf, "Le client a expressément demandé que l'intervention commence avant la fin du délai de rétractation et reconnu qu'une fois la prestation entièrement exécutée, il ne disposera plus du droit de rétractation.");
                }
            } else {
                self::small($pdf, "□ Je demande expressément que l'intervention commence avant la fin du délai de rétractation. Si je me rétracte ensuite, je paierai un montant proportionnel au service déjà fourni. Je reconnais qu'une fois la prestation entièrement exécutée, je ne disposerai plus du droit de rétractation.");
            }
            self::small($pdf, self::ONLINE_FORM_NOTICE);
        }

        $accepted = in_array($quote['status'], ['accepted', 'withdrawn'], true);
        self::signatures($pdf, $primary,
            ['Bon pour accord (client)', $accepted ? 'Accepté en ligne le ' . self::moment((string)$quote['decided_at']) : null],
            ['Le professionnel : ' . ($config['company_name'] ?? ''), null]
        );
        if ($quote['status'] === 'withdrawn') {
            self::small($pdf, 'Rétractation déclarée en ligne le ' . self::moment((string)$quote['withdrawn_at']) . ' : contrat annulé.', 'left', true);
        }
        return $pdf->output();
    }

    /** Mandat de débours : document distinct du devis, accord séparé du client (docs/legal/fr/debours.md). */
    public static function mandate(array $quote, array $config): string
    {
        $primary = SimplePdf::rgb((string)($config['theme_primary'] ?? ''), [0.15, 0.39, 0.92]);
        $pdf = new SimplePdf('Mandat de débours — devis ' . $quote['number']);
        $pdf->setFooter(($config['company_name'] ?? '') . ' — Mandat de débours lié au devis n° ' . $quote['number']);
        $debours = array_values(array_filter($quote['lines'] ?? [], fn($l) => $l['kind'] === 'debours'));
        $budget = self::money((float)($quote['debours_budget'] ?: $quote['total_debours']));

        self::documentHeader($pdf, $config, $primary, 'MANDAT DE DÉBOURS', ['Lié au devis n° ' . $quote['number']]);
        self::parties($pdf, $primary, 'Mandant (client)', [
            (string)$quote['client_name'],
            trim(implode(', ', array_filter([(string)$quote['address'], trim($quote['postal_code'] . ' ' . $quote['city'])]))),
        ], 'Mandataire', [(string)($config['company_name'] ?? ''), LegalTexts::legalIdentity($config)]);

        $pdf->setColor([0.12, 0.16, 0.23]);
        $pdf->paragraph(sprintf(
            'Je soussigné(e) %s donne mandat à %s d\'acheter, en mon nom et pour mon compte, les pièces désignées ci-dessous, nécessaires aux travaux du devis n° %s, dans la limite d\'un budget maximum de %s.',
            $quote['client_name'], $config['company_name'] ?? '', $quote['number'], $budget
        ), 10, false, 10);
        self::table($pdf, $primary, $debours, false);
        self::totals($pdf, $primary, ['Montant estimé' => (float)$quote['total_debours'], 'Budget maximum' => (float)($quote['debours_budget'] ?: $quote['total_debours'])]);

        self::section($pdf, $primary, 'Conditions');
        foreach ([
            'Les pièces sont achetées au nom du mandant : la facture ou le ticket du fournisseur est établi à son nom.',
            'Le mandant rembourse le montant exact figurant sur le justificatif, sans marge ; une copie du justificatif lui est remise.',
            'Ces sommes sont des débours : elles ne constituent pas une vente par le mandataire et figurent sur une ligne distincte de la facture.',
            'Toute dépense au-delà du budget maximum nécessite un nouvel accord du mandant.',
        ] as $text) {
            self::small($pdf, '• ' . $text);
        }

        $given = $quote['debours_mandate'] === null ? null : (int)$quote['debours_mandate'] === 1;
        self::signatures($pdf, $primary,
            ['Bon pour mandat (mandant)', $given === null ? null : ($given
                ? 'Mandat donné en ligne le ' . self::moment((string)$quote['mandate_decided_at'])
                : 'Mandat refusé en ligne le ' . self::moment((string)$quote['mandate_decided_at']) . ' : le client fournit les pièces')],
            ['Le mandataire : ' . ($config['company_name'] ?? ''), null]
        );
        return $pdf->output();
    }

    /** En-tête : logo et entreprise à gauche, titre du document en couleur principale à droite, filet. */
    private static function documentHeader(SimplePdf $pdf, array $config, array $primary, string $title, array $meta): void
    {
        $m = SimplePdf::MARGIN;
        $right = SimplePdf::WIDTH - $m;
        $y = 40.0;
        // Copie allégée du logo (celle des emails) si elle existe : PDF plus léger
        $light = Branding::dir() . '/' . Branding::EMAIL_LOGO_FILE;
        $logo = is_file($light) ? $light : Branding::find('logo', 'png');
        $size = $logo ? $pdf->image((string)file_get_contents($logo), $m, $y, 150, 46) : null;
        $left = $y + ($size ? $size[1] + 8 : 0);
        foreach (LegalTexts::companyLines($config) as $i => $line) {
            $pdf->textAt($line, $m, $left, $i === 0 ? 10 : 8, $i === 0, 'left', $i === 0 ? [0.12, 0.16, 0.23] : self::LABEL);
            $left += $i === 0 ? 13 : 10.5;
        }
        $pdf->textAt($title, $right, $y, 20, true, 'right', $primary);
        $top = $y + 28;
        foreach ($meta as $line) {
            $pdf->textAt($line, $right, $top, 9, false, 'right', self::LABEL);
            $top += 12;
        }
        $bottom = max($left, $top) + 6;
        $pdf->hline($m, $right, $bottom, $primary, 1.5);
        $pdf->setY($bottom + 16);
    }

    /** Deux blocs côte à côte (client / intervention, mandant / mandataire) sur fond teinté. */
    private static function parties(SimplePdf $pdf, array $primary, string $leftTitle, array $leftLines, string $rightTitle, array $rightLines): void
    {
        $m = SimplePdf::MARGIN;
        $gap = 14;
        $w = (SimplePdf::WIDTH - 2 * $m - $gap) / 2;
        $y = $pdf->y();
        $height = 22 + 12 * max(count($leftLines), count($rightLines), 1);
        foreach ([[$m, $leftTitle, $leftLines], [$m + $w + $gap, $rightTitle, $rightLines]] as [$x, $title, $lines]) {
            $pdf->rect($x, $y, $w, $height, SimplePdf::tint($primary, 0.06));
            $pdf->textAt(mb_strtoupper($title, 'UTF-8'), $x + 10, $y + 8, 7.5, true, 'left', $primary);
            $line = $y + 21;
            foreach ($lines as $i => $text) {
                foreach (self::wrap($pdf, (string)$text, $w - 20, 9.5, $i === 0) as $part) {
                    $pdf->textAt($part, $x + 10, $line, 9.5, $i === 0);
                    $line += 12;
                }
            }
        }
        $pdf->setY($y + $height + 16);
    }

    /** Tableau des lignes : désignation (sur plusieurs lignes si besoin), quantité, prix, TVA, montant. */
    private static function table(SimplePdf $pdf, array $primary, array $lines, bool $vat): void
    {
        $m = SimplePdf::MARGIN;
        $right = SimplePdf::WIDTH - $m;
        // Bords droits des colonnes chiffrées
        $cols = $vat ? ['amount' => $right - 6, 'vat' => $right - 92, 'price' => $right - 140, 'qty' => $right - 216] : ['amount' => $right - 6, 'price' => $right - 92, 'qty' => $right - 168];
        $labelWidth = $cols['qty'] - 60 - $m - 8;
        $pdf->keep(40);
        $y = $pdf->y();
        $pdf->rect($m, $y, $right - $m, 20, SimplePdf::tint($primary, 0.12));
        $pdf->textAt('Désignation', $m + 8, $y + 6, 8.5, true, 'left', $primary);
        $pdf->textAt('Quantité', $cols['qty'], $y + 6, 8.5, true, 'right', $primary);
        $pdf->textAt($vat ? 'Prix unitaire HT' : 'Prix unitaire', $cols['price'], $y + 6, 8.5, true, 'right', $primary);
        if ($vat) {
            $pdf->textAt('TVA', $cols['vat'], $y + 6, 8.5, true, 'right', $primary);
        }
        $pdf->textAt('Montant', $cols['amount'], $y + 6, 8.5, true, 'right', $primary);
        $y += 20;
        foreach ($lines as $line) {
            $label = self::wrap($pdf, (string)$line['label'], $labelWidth, 9.5);
            $height = 10 + 12 * count($label) + 9;
            $pdf->setY($y);
            $pdf->keep($height);
            $y = $pdf->y();
            $top = $y + 7;
            foreach ($label as $i => $part) {
                $pdf->textAt($part, $m + 8, $top + 12 * $i, 9.5);
            }
            $pdf->textAt(self::KIND[$line['kind']] ?? '', $m + 8, $top + 12 * count($label), 7.5, false, 'left', self::LABEL);
            $amount = round((float)$line['quantity'] * (float)$line['unit_price'], 2);
            $qty = rtrim(rtrim(number_format((float)$line['quantity'], 2, ',', ' '), '0'), ',') . ' ' . $line['unit'];
            $pdf->textAt($qty, $cols['qty'], $top, 9.5, false, 'right');
            $pdf->textAt(self::money((float)$line['unit_price']), $cols['price'], $top, 9.5, false, 'right');
            if ($vat) {
                $pdf->textAt(rtrim(rtrim(number_format((float)$line['vat_rate'], 2, ',', ''), '0'), ',') . ' %', $cols['vat'], $top, 9.5, false, 'right');
            }
            $pdf->textAt(self::money($amount), $cols['amount'], $top, 9.5, true, 'right');
            $y += $height;
            $pdf->hline($m, $right, $y, self::LINE);
        }
        $pdf->setY($y + 10);
    }

    /** Totaux alignés à droite ; le dernier en couleur principale. */
    private static function totals(SimplePdf $pdf, array $primary, array $totals): void
    {
        $right = SimplePdf::WIDTH - SimplePdf::MARGIN;
        $pdf->keep(18 * count($totals) + 6);
        $y = $pdf->y();
        $last = array_key_last($totals);
        foreach ($totals as $label => $value) {
            $final = $label === $last;
            if ($final) {
                $pdf->rect($right - 210, $y - 4, 210, 20, SimplePdf::tint($primary, 0.12));
            }
            $pdf->textAt($label, $right - 96, $y + ($final ? 1 : 0), $final ? 10.5 : 9.5, $final, 'right', $final ? $primary : self::LABEL);
            $pdf->textAt(self::money($value), $right - 6, $y + ($final ? 1 : 0), $final ? 10.5 : 9.5, true, 'right', $final ? $primary : null);
            $y += $final ? 22 : 16;
        }
        $pdf->setY($y + 4);
    }

    /** Titre de section en couleur principale, souligné d'un filet clair. */
    private static function section(SimplePdf $pdf, array $primary, string $title): void
    {
        $pdf->keep(40);
        $pdf->moveDown(6);
        $y = $pdf->y();
        $pdf->textAt(mb_strtoupper($title, 'UTF-8'), SimplePdf::MARGIN, $y, 9, true, 'left', $primary);
        $pdf->hline(SimplePdf::MARGIN, SimplePdf::WIDTH - SimplePdf::MARGIN, $y + 14, SimplePdf::tint($primary, 0.35));
        $pdf->setY($y + 22);
    }

    /** Texte courant de petite taille, gris foncé ; `$align` right pour une mention sous les totaux. */
    private static function small(SimplePdf $pdf, string $text, string $align = 'left', bool $bold = false): void
    {
        if ($align === 'right') {
            $pdf->keep(14);
            $pdf->textAt($text, SimplePdf::WIDTH - SimplePdf::MARGIN - 6, $pdf->y(), 8, false, 'right', self::LABEL);
            $pdf->moveDown(14);
            return;
        }
        $pdf->setColor([0.2, 0.25, 0.33]);
        $pdf->paragraph($text, 8.5, $bold, 4);
    }

    /** Deux cadres de signature, ou la trace de l'accord en ligne. */
    private static function signatures(SimplePdf $pdf, array $primary, array $left, array $right): void
    {
        $m = SimplePdf::MARGIN;
        $gap = 14;
        $w = (SimplePdf::WIDTH - 2 * $m - $gap) / 2;
        $pdf->keep(96);
        $pdf->moveDown(8);
        $y = $pdf->y();
        foreach ([[$m, $left], [$m + $w + $gap, $right]] as [$x, [$label, $online]]) {
            $pdf->rect($x, $y, $w, 78, null, SimplePdf::tint($primary, 0.4), 0.8);
            $title = self::wrap($pdf, $label, $w - 20, 9, true);
            foreach ($title as $i => $part) {
                $pdf->textAt($part, $x + 10, $y + 9 + 11 * $i, 9, true);
            }
            $top = $y + 26 + 11 * (count($title) - 1);
            if ($online) {
                foreach (self::wrap($pdf, $online, $w - 20, 8.5) as $i => $part) {
                    $pdf->textAt($part, $x + 10, $top + 11 * $i, 8.5, false, 'left', self::LABEL);
                }
            } else {
                $pdf->textAt('Date :', $x + 10, $top + 2, 8.5, false, 'left', self::LABEL);
                $pdf->textAt('Signature :', $x + 10, $top + 18, 8.5, false, 'left', self::LABEL);
            }
        }
        $pdf->setY($y + 90);
    }

    /** Découpe un texte en lignes tenant dans `$width`. */
    private static function wrap(SimplePdf $pdf, string $text, float $width, float $size, bool $bold = false): array
    {
        $lines = [];
        $line = '';
        foreach (preg_split('/\s+/', trim($text)) as $word) {
            $candidate = $line === '' ? $word : "$line $word";
            if ($line !== '' && $pdf->textWidth($candidate, $size, $bold) > $width) {
                $lines[] = $line;
                $line = $word;
            } else {
                $line = $candidate;
            }
        }
        return $line === '' ? $lines : [...$lines, $line];
    }

    private const KIND = [
        'labour' => "Main-d'œuvre", 'service' => 'Forfait', 'travel' => 'Déplacement',
        'debours' => 'Pièce au nom du client (débours)', 'supply' => 'Fourniture revendue',
    ];

    private static function money(float $amount): string
    {
        return number_format($amount, 2, ',', ' ') . ' €';
    }

    private static function day(string $date): string
    {
        return $date === '' ? '' : date('d/m/Y', strtotime($date));
    }

    private static function moment(string $date): string
    {
        return $date === '' ? '' : date('d/m/Y', strtotime($date)) . ' à ' . date('H:i', strtotime($date));
    }
}
