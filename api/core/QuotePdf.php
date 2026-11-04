<?php
/**
 * QuotePdf — Documents PDF d'un devis (Item 22, écart 13) produits avec `SimplePdf` :
 * - formulaire type de rétractation **remplissable** (annexe R221-1, mot pour mot), prérempli avec les
 *   références du contrat, joint à l'email d'accord (L221-9 : contrat « accompagné du formulaire type ») ;
 * - déclaration de rétractation **validée en ligne** (contenu, date et heure : L221-21, D221-5).
 */

require_once __DIR__ . '/SimplePdf.php';
require_once __DIR__ . '/LegalTexts.php';

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
}
