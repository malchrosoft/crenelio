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

require_once __DIR__ . '/Branding.php';

class EmailTemplates
{
    /** Couleur principale par défaut ; le thème choisi dans l'espace Pro la remplace (theme_primary). */
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
     * Code de connexion à l'espace Pro (second facteur), envoyé à `pro_email`.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function adminCode(string $code, int $minutes, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $intro = sprintf(
            'Voici votre code de connexion à l\'espace Artisan :<br><strong style="display:inline-block;margin-top:12px;font-size:30px;letter-spacing:6px;color:%s;">%s</strong>',
            self::GRAY_800,
            self::escape($code)
        );
        $outro = sprintf(
            'Il est valable %d minutes. Une fois validé, cet appareil sera reconnu pendant 10 jours. Si vous n\'êtes pas à l\'origine de cette connexion, ne communiquez ce code à personne et changez votre mot de passe.',
            $minutes
        );

        return [
            'subject' => sprintf('%s — code de connexion : %s', $company, $code),
            'html'    => self::layout($company, 'Code de connexion', $intro, [], $outro, null, $config),
            'text'    => self::plainText('Code de connexion', "Votre code de connexion à l'espace Artisan : $code", [], self::stripHtml($outro), null, $config),
        ];
    }

    /**
     * Email de test déclenché depuis l'espace Pro (onglet Configuration).
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function mailTest(string $transport, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $mode = $transport === 'smtp' ? 'serveur SMTP' : 'fonction mail() de l\'hébergement';
        $intro = sprintf(
            'Si vous lisez ce message, l\'envoi des emails fonctionne (%s). Vos clients recevront leurs confirmations et vous recevrez vos codes de connexion.',
            self::escape($mode)
        );
        $outro = 'Pensez à vérifier qu\'il n\'est pas arrivé dans les indésirables. Si c\'est le cas, vérifiez les enregistrements SPF, DKIM et DMARC du domaine.';

        return [
            'subject' => sprintf('Email de test — %s', $company),
            'html'    => self::layout($company, 'L\'envoi des emails fonctionne', $intro, [], $outro, null, $config),
            'text'    => self::plainText('L\'envoi des emails fonctionne', self::stripHtml($intro), [], $outro, null, $config),
        ];
    }

    /**
     * Images intégrées à joindre à un email : le logo, s'il est référencé par le gabarit.
     *
     * @return list<array{cid: string, mime: string, content: string}>
     */
    public static function inlineImages(string $html): array
    {
        if (!str_contains($html, 'cid:' . Branding::EMAIL_LOGO_CID) || !($logo = Branding::emailLogo())) {
            return [];
        }
        return [['cid' => Branding::EMAIL_LOGO_CID, 'mime' => 'image/png', 'content' => $logo['content']]];
    }

    /**
     * Demande exceptionnelle — accusé de réception au client : rien n'est encore confirmé.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function exceptionClientAck(array $appointment, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $subject = sprintf('Demande d\'intervention transmise — %s', $company);
        $intro = sprintf(
            'Bonjour %s, votre adresse se situe juste au-delà de notre zone d\'intervention habituelle. Votre demande a bien été transmise : le créneau ci-dessous est réservé le temps que l\'artisan l\'examine.',
            self::escape($appointment['client_name'])
        );
        $rows = self::summaryRows($appointment);
        $outro = 'Vous recevrez un email de confirmation si la demande est acceptée, ou un email vous informant de son refus. Rien n\'est dû tant que le rendez-vous n\'est pas confirmé.';

        return [
            'subject' => $subject,
            'html'    => self::layout($company, 'Demande transmise', $intro, $rows, $outro, null, $config),
            'text'    => self::plainText('Demande transmise', $intro, $rows, $outro, null, $config),
        ];
    }

    /**
     * Demande exceptionnelle — email à l'artisan avec le bouton menant à la page d'acceptation / refus.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function exceptionProRequest(array $appointment, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $decisionUrl = APP_URL !== '' && !empty($appointment['decision_token'])
            ? APP_URL . '/decision/' . $appointment['decision_token']
            : null;

        $subject = sprintf(
            'Demande hors zone à valider — %s le %s à %s',
            $appointment['client_name'],
            self::formatDate($appointment['start_datetime']),
            self::formatTime($appointment['start_datetime'])
        );
        $intro = 'Un client situé juste au-delà de votre zone d\'intervention demande un rendez-vous. Le créneau est bloqué en « En attente » jusqu\'à votre décision.';

        $rows = array_merge(self::summaryRows($appointment), [
            'Client'    => self::escape($appointment['client_name']),
            'Téléphone' => self::escape($appointment['client_phone']),
            'Email'     => self::escape($appointment['client_email']),
        ]);
        if ($appointment['distance_km'] !== null) {
            $rows['Distance'] = self::formatKm((float)$appointment['distance_km']) . ' du point de départ';
        }
        if (!empty($appointment['notes'])) {
            $rows['Précisions'] = nl2br(self::escape($appointment['notes']));
        }

        $outro = $decisionUrl !== null
            ? 'Accepter envoie la confirmation au client (et le fichier agenda) ; refuser l\'en informe et libère le créneau. Vous pouvez aussi répondre directement à cet email pour échanger avec le client.'
            : 'Validez ou refusez cette demande depuis le planning de l\'espace Artisan (statut « En attente »).';

        return [
            'subject' => $subject,
            'html'    => self::layout(
                $company,
                'Demande hors zone à valider',
                $intro,
                $rows,
                $outro,
                $decisionUrl !== null ? ['label' => 'Accepter ou refuser la demande', 'url' => $decisionUrl] : null,
                $config
            ),
            'text'    => self::plainText('Demande hors zone à valider', $intro, $rows, $outro, $decisionUrl, $config, 'Accepter ou refuser la demande'),
        ];
    }

    /**
     * Demande exceptionnelle refusée — information du client.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function exceptionClientRefused(array $appointment, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $subject = sprintf('Demande d\'intervention non retenue — %s', $company);
        $intro = sprintf(
            'Bonjour %s, nous sommes désolés : votre demande d\'intervention hors de notre zone habituelle n\'a pas pu être acceptée. Le créneau ci-dessous a été libéré.',
            self::escape($appointment['client_name'])
        );
        $rows = self::summaryRows($appointment);
        $outro = !empty($config['pro_phone'])
            ? sprintf('Pour toute question, contactez-nous au %s.', self::escape($config['pro_phone']))
            : 'Merci de votre compréhension.';

        return [
            'subject' => $subject,
            'html'    => self::layout($company, 'Demande non retenue', $intro, $rows, $outro, null, $config),
            'text'    => self::plainText('Demande non retenue', $intro, $rows, $outro, null, $config),
        ];
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
                    self::primary($config),
                    self::escape($appointment['client_phone'])
                ),
                'Email'     => sprintf(
                    '<a href="mailto:%1$s" style="color:%2$s;text-decoration:none;">%1$s</a>',
                    self::escape($appointment['client_email']),
                    self::primary($config)
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
    /** Couleur principale du thème (`theme_primary`, `#rrggbb`), sinon celle par défaut. */
    private static function primary(array $config): string
    {
        $color = (string)($config['theme_primary'] ?? '');
        return preg_match('/^#[0-9a-f]{6}$/i', $color) ? $color : self::PRIMARY;
    }

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
                self::primary($config),
                self::escape($button['url']),
                self::escape($button['label'])
            );
        }

        // En-tête : logo PNG intégré sur fond blanc (un logo peut être illisible sur la couleur
        // principale), sinon nom de l'entreprise en blanc sur la couleur principale
        $logo = Branding::emailLogo();
        $headerHtml = $logo !== null
            ? sprintf(
                '<tr><td style="background:#ffffff;padding:18px 28px;border-bottom:4px solid %s;"><img src="cid:%s" width="%d" height="%d" alt="%s" style="display:block;border:0;width:%3$dpx;height:%4$dpx;"></td></tr>',
                self::primary($config),
                Branding::EMAIL_LOGO_CID,
                $logo['width'],
                $logo['height'],
                self::escape($company)
            )
            : sprintf(
                '<tr><td style="background:%s;padding:22px 28px;color:#ffffff;font-size:18px;font-weight:700;">%s</td></tr>',
                self::primary($config),
                self::escape($company)
            );

        $footerParts = array_filter([
            self::escape($config['pro_phone'] ?? ''),
            self::escape($config['pro_email'] ?? ''),
            self::escape($config['service_area'] ?? ''),
        ]);

        return sprintf(
            '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%1$s</title>
</head>
<body style="margin:0;padding:0;background:%2$s;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%2$s;padding:24px 12px;">
<tr><td align="center">
    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid %3$s;border-radius:12px;overflow:hidden;">
        %5$s
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
            self::primary($config),
            $headerHtml,
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
        array $config,
        string $linkLabel = 'Gérer mon rendez-vous'
    ): string {
        $lines = [mb_strtoupper($title, 'UTF-8'), '', self::stripHtml($intro), ''];

        foreach ($rows as $label => $value) {
            $lines[] = $label . ' : ' . self::stripHtml($value);
        }

        $lines[] = '';
        if ($manageUrl !== null) {
            $lines[] = $linkLabel . ' : ' . $manageUrl;
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
