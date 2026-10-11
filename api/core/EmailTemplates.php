<?php
/**
 * EmailTemplates — Composition des emails de confirmation.
 *
 * Note : contrairement au front React, les styles sont ici volontairement
 * en ligne. Les clients de messagerie ignorent largement les feuilles de
 * style externes et les sélecteurs complexes ; c'est la seule mise en forme
 * fiable. Le gabarit reste en tableau pour Outlook.
 *
 * Chaque fabrique renvoie `['subject' => ..., 'html' => ..., 'text' => ...]`.
 */

class EmailTemplates
{
    private const PRIMARY = '#2563eb';
    private const GRAY_50 = '#f8fafc';
    private const GRAY_200 = '#e2e8f0';
    private const GRAY_500 = '#64748b';
    private const GRAY_800 = '#1e293b';

    /**
     * Email adressé au client : récapitulatif et lien de gestion.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function clientConfirmation(array $appointment, array $config): array
    {
        $company   = $config['company_name'] ?? 'Crénelio';
        $manageUrl = self::manageUrl($appointment);
        $rows      = self::summaryRows($appointment);

        $subject = sprintf(
            'Rendez-vous confirmé le %s à %s — %s',
            self::formatDate($appointment['start_datetime']),
            self::formatTime($appointment['start_datetime']),
            $company
        );

        $intro = sprintf(
            'Bonjour %s, votre rendez-vous est confirmé. Voici le récapitulatif de votre intervention.',
            self::escape($appointment['client_name'])
        );

        $outro = $manageUrl !== null
            ? 'Un empêchement ? Vous pouvez consulter ou annuler votre rendez-vous à tout moment depuis le lien ci-dessus.'
            : sprintf(
                'Un empêchement ? Contactez-nous au %s.',
                self::escape($config['pro_phone'] ?? '')
            );

        $html = self::layout(
            $company,
            'Rendez-vous confirmé',
            $intro,
            $rows,
            $outro,
            $manageUrl !== null ? ['label' => 'Gérer mon rendez-vous', 'url' => $manageUrl] : null,
            $config
        );

        $text = self::plainText("Rendez-vous confirmé", $intro, $rows, $outro, $manageUrl, $config);

        return ['subject' => $subject, 'html' => $html, 'text' => $text];
    }

    /**
     * Email adressé à l'artisan : fiche d'intervention complète.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function proConfirmation(array $appointment, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';

        $subject = sprintf(
            'Nouvelle intervention le %s à %s — %s',
            self::formatDate($appointment['start_datetime']),
            self::formatTime($appointment['start_datetime']),
            $appointment['client_name']
        );

        $intro = 'Une nouvelle réservation vient d\'être enregistrée. Le fichier .ics joint permet de l\'ajouter directement à votre agenda.';

        $rows = array_merge(
            self::summaryRows($appointment),
            [
                'Client'    => self::escape($appointment['client_name']),
                'Téléphone' => sprintf(
                    '<a href="tel:%s" style="color:%s;text-decoration:none;">%s</a>',
                    self::escape(preg_replace('/\s+/', '', $appointment['client_phone'])),
                    self::PRIMARY,
                    self::escape($appointment['client_phone'])
                ),
                'Email'     => sprintf(
                    '<a href="mailto:%1$s" style="color:%2$s;text-decoration:none;">%1$s</a>',
                    self::escape($appointment['client_email']),
                    self::PRIMARY
                ),
            ]
        );

        if (!empty($appointment['notes'])) {
            $rows["Notes d'accès"] = nl2br(self::escape($appointment['notes']));
        }

        $outro = 'Pensez à vérifier le temps de trajet : le créneau du fichier iCal inclut déjà votre temps de battement habituel.';

        $html = self::layout($company, 'Nouvelle intervention', $intro, $rows, $outro, null, $config);
        $text = self::plainText('Nouvelle intervention', $intro, $rows, $outro, null, $config);

        return ['subject' => $subject, 'html' => $html, 'text' => $text];
    }

    // -----------------------------------------------------------------
    // Fabrication du contenu
    // -----------------------------------------------------------------

    /**
     * Lignes communes aux deux emails : prestation, date, créneau, lieu, tarifs.
     *
     * @return array<string, string> Libellé => valeur HTML déjà échappée.
     */
    private static function summaryRows(array $appointment): array
    {
        $price     = (float)($appointment['service_price'] ?? 0);
        $travelFee = (float)($appointment['travel_fee'] ?? 0);

        $rows = [
            'Référence'  => '#' . (int)$appointment['id'],
            'Prestation' => self::escape($appointment['service_name'] ?? '—'),
            'Date'       => self::escape(self::ucfirstFr(self::formatDate($appointment['start_datetime']))),
            'Créneau'    => sprintf(
                '%s – %s (%s min)',
                self::formatTime($appointment['start_datetime']),
                self::formatTime($appointment['end_datetime']),
                (int)($appointment['duration_minutes'] ?? 0)
            ),
            'Lieu'       => self::escape(sprintf(
                '%s, %s %s',
                $appointment['address'],
                $appointment['postal_code'],
                $appointment['city']
            )),
            'Tarif de la prestation' => self::formatEuro($price),
        ];

        if ($travelFee > 0) {
            $distance = $appointment['distance_km'] ?? null;
            $rows['Frais de déplacement'] = self::formatEuro($travelFee)
                . ($distance !== null ? ' <span style="color:' . self::GRAY_500 . ';">(' . self::formatKm((float)$distance) . ')</span>' : '');
            $rows['Total estimé'] = '<strong>' . self::formatEuro($price + $travelFee) . '</strong>';
        }

        return $rows;
    }

    /**
     * Gabarit HTML responsive commun (largeur fluide plafonnée à 600 px).
     *
     * @param array<string, string>                 $rows
     * @param array{label: string, url: string}|null $button
     */
    private static function layout(
        string $company,
        string $title,
        string $intro,
        array $rows,
        string $outro,
        ?array $button,
        array $config
    ): string {
        $rowsHtml = '';
        foreach ($rows as $label => $value) {
            $rowsHtml .= sprintf(
                '<tr>
                    <td style="padding:10px 0;border-bottom:1px solid %s;color:%s;font-size:14px;">%s</td>
                    <td style="padding:10px 0;border-bottom:1px solid %s;color:%s;font-size:14px;font-weight:600;text-align:right;">%s</td>
                </tr>',
                self::GRAY_200,
                self::GRAY_500,
                self::escape($label),
                self::GRAY_200,
                self::GRAY_800,
                $value
            );
        }

        $buttonHtml = '';
        if ($button !== null) {
            $buttonHtml = sprintf(
                '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr><td style="border-radius:8px;background:%s;">
                        <a href="%s" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">%s</a>
                    </td></tr>
                </table>',
                self::PRIMARY,
                self::escape($button['url']),
                self::escape($button['label'])
            );
        }

        $footerParts = array_filter([
            self::escape($config['pro_phone'] ?? ''),
            self::escape($config['pro_email'] ?? ''),
            self::escape($config['service_area'] ?? ''),
        ]);

        return sprintf(
            '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%1$s</title>
</head>
<body style="margin:0;padding:0;background:%2$s;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%2$s;padding:24px 12px;">
<tr><td align="center">
    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid %3$s;border-radius:12px;overflow:hidden;">
        <tr><td style="background:%4$s;padding:22px 28px;color:#ffffff;font-size:18px;font-weight:700;">%5$s</td></tr>
        <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;color:%6$s;font-size:21px;">%1$s</h1>
            <p style="margin:0 0 20px;color:%7$s;font-size:15px;line-height:1.6;">%8$s</p>
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">%9$s</table>
            %10$s
            <p style="margin:20px 0 0;color:%7$s;font-size:14px;line-height:1.6;">%11$s</p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:%2$s;border-top:1px solid %3$s;color:%7$s;font-size:12px;line-height:1.6;">%12$s</td></tr>
    </table>
</td></tr>
</table>
</body>
</html>',
            self::escape($title),
            self::GRAY_50,
            self::GRAY_200,
            self::PRIMARY,
            self::escape($company),
            self::GRAY_800,
            self::GRAY_500,
            $intro,
            $rowsHtml,
            $buttonHtml,
            $outro,
            implode(' · ', $footerParts)
        );
    }

    /**
     * Version texte brut, indispensable pour la délivrabilité et les
     * lecteurs qui refusent le HTML.
     *
     * @param array<string, string> $rows
     */
    private static function plainText(
        string $title,
        string $intro,
        array $rows,
        string $outro,
        ?string $manageUrl,
        array $config
    ): string {
        $lines = [mb_strtoupper($title, 'UTF-8'), '', self::stripHtml($intro), ''];

        foreach ($rows as $label => $value) {
            $lines[] = $label . ' : ' . self::stripHtml($value);
        }

        $lines[] = '';
        if ($manageUrl !== null) {
            $lines[] = 'Gérer mon rendez-vous : ' . $manageUrl;
            $lines[] = '';
        }

        $lines[] = self::stripHtml($outro);
        $lines[] = '';
        $lines[] = implode(' · ', array_filter([
            $config['company_name'] ?? '',
            $config['pro_phone'] ?? '',
            $config['pro_email'] ?? '',
        ]));

        return implode("\n", $lines);
    }

    // -----------------------------------------------------------------
    // Utilitaires
    // -----------------------------------------------------------------

    /** Lien public de gestion du rendez-vous, si l'URL du site est connue. */
    private static function manageUrl(array $appointment): ?string
    {
        if (APP_URL === '') {
            return null;
        }

        return APP_URL . '/rdv/' . $appointment['cancel_token'];
    }

    private static function formatDate(string $datetime): string
    {
        $days   = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        $months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

        $date = new DateTime($datetime, new DateTimeZone(APP_TIMEZONE));

        return sprintf(
            '%s %d %s %s',
            $days[(int)$date->format('w')],
            (int)$date->format('j'),
            $months[(int)$date->format('n') - 1],
            $date->format('Y')
        );
    }

    /** Majuscule initiale compatible UTF-8. */
    private static function ucfirstFr(string $value): string
    {
        return mb_strtoupper(mb_substr($value, 0, 1), 'UTF-8') . mb_substr($value, 1);
    }

    private static function formatTime(string $datetime): string
    {
        return (new DateTime($datetime, new DateTimeZone(APP_TIMEZONE)))->format('H:i');
    }

    private static function formatEuro(float $amount): string
    {
        return $amount > 0 ? number_format($amount, 2, ',', ' ') . ' €' : 'Gratuit';
    }

    private static function formatKm(float $km): string
    {
        return number_format($km, 1, ',', ' ') . ' km';
    }

    private static function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function stripHtml(string $value): string
    {
        return html_entity_decode(strip_tags(str_replace('<br />', ' ', $value)), ENT_QUOTES, 'UTF-8');
    }
}
