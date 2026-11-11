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
require_once __DIR__ . '/LegalTexts.php';
require_once __DIR__ . '/QuotePdf.php';

class EmailTemplates
{
    /** Couleur principale par défaut ; le thème choisi dans l'espace Artisan la remplace (theme_primary). */
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
            ? 'Le rendez-vous est joint à ce message (fichier .ics) : ajoutez-le à votre agenda depuis ce message, pour qu\'un éventuel changement d\'horaire ou une annulation s\'y reporte automatiquement. Un empêchement ? Vous pouvez consulter ou annuler votre rendez-vous à tout moment depuis le lien ci-dessus.'
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
     * Code de connexion à l'espace Artisan (second facteur), envoyé à `pro_email`.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function adminCode(string $code, int $minutes, array $config, string $purpose = 'login'): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        // Libellé, phrase d'introduction et conséquence de la validation, selon l'usage du code
        [$label, $lead, $after] = match ($purpose) {
            'reset' => [
                'Réinitialisation du mot de passe',
                'Voici votre code pour réinitialiser le mot de passe de l\'espace Artisan :',
                'Une fois validé, vous choisirez un nouveau mot de passe et toutes les autres sessions seront fermées.',
            ],
            'email' => [
                'Confirmation de l\'email professionnel',
                'Voici votre code pour confirmer cette adresse comme email professionnel de l\'espace Artisan :',
                'Elle recevra ensuite les fiches d\'intervention et les codes de connexion.',
            ],
            default => [
                'Code de connexion',
                'Voici votre code de connexion à l\'espace Artisan :',
                'Une fois validé, cet appareil sera reconnu pendant 10 jours.',
            ],
        };
        $intro = sprintf(
            '%s<br><strong style="display:inline-block;margin-top:12px;font-size:30px;letter-spacing:6px;color:%s;">%s</strong>',
            self::escape($lead),
            self::GRAY_800,
            self::escape($code)
        );
        $outro = sprintf(
            'Il est valable %d minutes. %s Si vous n\'êtes pas à l\'origine de cette demande, ne communiquez ce code à personne.',
            $minutes,
            $after
        );

        return [
            'subject' => sprintf('%s — %s : %s', $company, mb_strtolower($label), $code),
            'html'    => self::layout($company, $label, $intro, [], $outro, null, $config),
            'text'    => self::plainText($label, "$lead $code", [], self::stripHtml($outro), null, $config),
        ];
    }

    /**
     * Avertissement de sécurité (mot de passe changé ou réinitialisé, email professionnel modifié).
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function securityNotice(string $title, string $message, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $intro = self::escape($message);
        $outro = sprintf(
            'Ce message est envoyé le %s à %s. Si vous n\'êtes pas à l\'origine de ce changement, utilisez « Mot de passe oublié » sur l\'écran de connexion, puis vérifiez l\'email professionnel.',
            self::formatDate(date('Y-m-d H:i:s')),
            date('H:i')
        );

        return [
            'subject' => sprintf('%s — %s', $company, $title),
            'html'    => self::layout($company, $title, $intro, [], $outro, null, $config),
            'text'    => self::plainText($title, $message, [], self::stripHtml($outro), null, $config),
        ];
    }

    /**
     * Email de test déclenché depuis l'espace Artisan (onglet Configuration).
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
            'Bonjour %s, votre adresse se situe juste au-delà de notre zone d\'intervention habituelle. Votre demande a bien été transmise : le créneau ci-dessous est réservé le temps que le professionnel l\'examine.',
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
     * Limite de la mise à jour automatique des agendas, rappelée dans chaque email qui en dépend :
     * seul un événement ajouté depuis un email précédent est relié et suivi.
     */
    private const AGENDA_SYNC_NOTE = 'Si le rendez-vous a été ajouté à votre agenda depuis un email précédent, celui-ci se met à jour automatiquement (selon votre messagerie, il peut falloir ouvrir ce message ou confirmer). Sinon (fichier importé à la main, autre agenda), modifiez ou supprimez vous-même l\'événement.';

    /**
     * Annulation, email au client : confirmation s'il a annulé lui-même, information sinon.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function cancellationClient(array $appointment, array $config, bool $byClient): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $when = sprintf('%s à %s', self::formatDate($appointment['start_datetime']), self::formatTime($appointment['start_datetime']));
        $intro = sprintf(
            $byClient
                ? 'Bonjour %s, votre annulation est bien enregistrée : le rendez-vous du %s est annulé et le créneau libéré.'
                : 'Bonjour %s, nous sommes désolés : le rendez-vous du %s a dû être annulé.',
            self::escape($appointment['client_name']),
            self::escape($when)
        );
        $outro = (!empty($config['pro_phone'])
            ? sprintf('Pour reprendre un rendez-vous ou pour toute question, contactez-nous au %s.', self::escape($config['pro_phone']))
            : 'Vous pouvez reprendre un rendez-vous en ligne à tout moment.')
            . ' ' . self::AGENDA_SYNC_NOTE;
        $rows = self::summaryRows($appointment);

        return [
            'subject' => sprintf('Rendez-vous annulé : %s — %s', $when, $company),
            'html'    => self::layout($company, 'Rendez-vous annulé', $intro, $rows, $outro, null, $config),
            'text'    => self::plainText('Rendez-vous annulé', $intro, $rows, $outro, null, $config),
        ];
    }

    /**
     * Annulation par le client, email à l'artisan (le fichier joint retire l'événement de son agenda).
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function cancellationPro(array $appointment, array $config, bool $byClient = true, ?string $rescheduledAt = null): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $when = sprintf('%s à %s', self::formatDate($appointment['start_datetime']), self::formatTime($appointment['start_datetime']));
        $intro = sprintf(
            $byClient
                ? '%s a annulé son rendez-vous du %s depuis son lien de gestion. Le créneau est de nouveau réservable en ligne.'
                : 'Vous avez annulé le rendez-vous de %s du %s depuis l\'espace Artisan. Ce message met à jour votre agenda.',
            self::escape($appointment['client_name']),
            self::escape($when)
        );
        // Annulation qui suit un déplacement annoncé au client : le nouvel horaire ne lui convenait sans doute pas
        if ($rescheduledAt !== null) {
            $intro .= sprintf(
                ' Cette annulation fait suite au déplacement du rendez-vous que vous lui avez annoncé le %s : le nouvel horaire ne lui convenait peut-être pas.',
                self::escape(self::formatDate($rescheduledAt))
            );
        }
        $rows = self::summaryRows($appointment);
        if (!empty($appointment['cancellation_reason'])) {
            $rows['Motif'] = self::escape($appointment['cancellation_reason']);
        }
        $outro = self::AGENDA_SYNC_NOTE;
        $title = $byClient ? ($rescheduledAt !== null ? 'Annulation après déplacement' : 'Rendez-vous annulé par le client') : 'Annulation enregistrée';

        return [
            'subject' => sprintf($rescheduledAt !== null ? 'Annulation après déplacement : %s, %s' : 'Annulation : %s, %s', $appointment['client_name'], $when),
            'html'    => self::layout($company, $title, $intro, $rows, $outro, null, $config),
            'text'    => self::plainText($title, $intro, $rows, $outro, null, $config),
        ];
    }

    /**
     * Reprogrammation par l'artisan, email au client : nouvelle date, agenda mis à jour.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function rescheduleClient(array $appointment, array $config, string $previousStart): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $manageUrl = self::manageUrl($appointment);
        $when = sprintf('%s à %s', self::formatDate($appointment['start_datetime']), self::formatTime($appointment['start_datetime']));
        $before = sprintf('%s à %s', self::formatDate($previousStart), self::formatTime($previousStart));
        $intro = sprintf(
            'Bonjour %s, votre rendez-vous initialement prévu le %s est déplacé au <strong>%s</strong>.',
            self::escape($appointment['client_name']),
            self::escape($before),
            self::escape($when)
        );
        $rows = self::summaryRows($appointment);
        $outro = self::AGENDA_SYNC_NOTE . ' '
            . ($manageUrl !== null
                ? 'Ce nouvel horaire ne vous convient pas ? Vous pouvez annuler depuis le lien ci-dessus.'
                : sprintf('Ce nouvel horaire ne vous convient pas ? Contactez-nous au %s.', self::escape($config['pro_phone'] ?? '')));

        return [
            'subject' => sprintf('Rendez-vous déplacé au %s — %s', $when, $company),
            'html'    => self::layout(
                $company,
                'Rendez-vous déplacé',
                $intro,
                $rows,
                $outro,
                $manageUrl !== null ? ['label' => 'Gérer mon rendez-vous', 'url' => $manageUrl] : null,
                $config
            ),
            'text'    => self::plainText('Rendez-vous déplacé', $intro, $rows, $outro, $manageUrl, $config),
        ];
    }

    /**
     * Reprogrammation par l'artisan, email à lui-même : met à jour l'intervention dans son agenda.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function reschedulePro(array $appointment, array $config, string $previousStart, bool $clientNotified): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $when = sprintf('%s à %s', self::formatDate($appointment['start_datetime']), self::formatTime($appointment['start_datetime']));
        $before = sprintf('%s à %s', self::formatDate($previousStart), self::formatTime($previousStart));
        $intro = sprintf(
            'L\'intervention de %s, prévue le %s, est déplacée au <strong>%s</strong>. Ce message met à jour votre agenda.',
            self::escape($appointment['client_name']),
            self::escape($before),
            self::escape($when)
        );
        $rows = self::summaryRows($appointment);
        $outro = ($clientNotified
            ? 'Le client a été prévenu par email. '
            : 'Le client n\'a pas été prévenu (option décochée) : pensez à le contacter. ')
            . self::AGENDA_SYNC_NOTE;

        return [
            'subject' => sprintf('Déplacé au %s : %s', $when, $appointment['client_name']),
            'html'    => self::layout($company, 'Intervention déplacée', $intro, $rows, $outro, null, $config),
            'text'    => self::plainText('Intervention déplacée', $intro, $rows, $outro, null, $config),
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

        $intro = 'Un nouveau rendez-vous vient d\'être enregistré. Le fichier .ics joint permet de l\'ajouter directement à votre agenda.';

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
    // Devis (Item 22) — cadre légal : docs/legal/
    // -----------------------------------------------------------------

    /** Formulaire de rétractation en ligne prérempli (/devis/:token/retractation), null sans APP_URL. */
    public static function quoteWithdrawalUrl(array $quote): ?string
    {
        $url = self::quoteUrl($quote);
        return $url === null ? null : $url . '/retractation';
    }

    /** Lien public du devis (/devis/:token), null sans APP_URL. */
    public static function quoteUrl(array $quote): ?string
    {
        return APP_URL !== '' && !empty($quote['token']) ? APP_URL . '/devis/' . $quote['token'] : null;
    }

    /**
     * Devis envoyé au client : lien « Consulter et répondre ». Le devis et le mandat de débours sont
     * présentés séparément sur la page ; la rétractation y est expliquée.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function quoteClient(array $quote, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $subject = sprintf('Votre devis %s — %s', $quote['number'], $company);
        $intro = sprintf(
            'Bonjour %s, voici votre devis pour : <strong>%s</strong>. Consultez-le en ligne pour l\'accepter ou le refuser.',
            self::escape($quote['client_name']),
            self::escape($quote['title'] ?: 'votre intervention')
        );
        $rows = self::quoteRows($quote);
        $guarantees = (int)$quote['builder_works']
            ? ' Travaux relevant des garanties des constructeurs (Code civil, articles 1792 et suivants) : l\'attestation d\'assurance de responsabilité décennale est jointe à ce message.'
            : '';
        $outro = (float)$quote['total_debours'] > 0
            ? 'Les pièces sont présentées dans un <strong>mandat de débours</strong> distinct : vous choisissez de les faire acheter en votre nom par le professionnel, ou de les fournir vous-même.'
            : 'Rien n\'est dû tant que vous n\'avez pas accepté le devis.';
        $outro .= ' Le devis' . ((float)$quote['total_debours'] > 0 ? ' et le mandat de débours sont joints' : ' est joint') . ' à ce message en PDF.';
        // Information précontractuelle : formulaire type de rétractation (L221-5, 7°), hors urgence
        if (!(int)$quote['urgent']) {
            $outro .= ' Le formulaire type de rétractation (PDF remplissable) est également joint.';
        }
        $outro .= $guarantees;
        $url = self::quoteUrl($quote);

        return [
            'subject' => $subject,
            'html'    => self::layout($company, 'Votre devis ' . $quote['number'], $intro, $rows, $outro, $url ? ['url' => $url, 'label' => 'Consulter et répondre au devis'] : null, $config),
            'text'    => self::plainText('Votre devis ' . $quote['number'], $intro, $rows, $outro, $url, $config, 'Consulter et répondre au devis'),
        ];
    }

    /**
     * Réponse enregistrée, au client. Accepté : exemplaire du contrat sur support durable (lignes,
     * mandat, pièces remplacées) et, hors urgence, délai de rétractation avec la fonction en ligne.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function quoteDecisionClient(array $quote, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $accepted = $quote['status'] === 'accepted';
        $subject = sprintf('Devis %s %s — %s', $quote['number'], $accepted ? 'accepté' : 'refusé', $company);
        $url = self::quoteUrl($quote);

        if (!$accepted) {
            $intro = sprintf('Bonjour %s, votre refus du devis %s a bien été enregistré. Aucune somme n\'est due.', self::escape($quote['client_name']), self::escape($quote['number']));
            return [
                'subject' => $subject,
                'html'    => self::layout($company, 'Devis refusé', $intro, [], '', null, $config),
                'text'    => self::plainText('Devis refusé', $intro, [], '', null, $config),
            ];
        }

        $intro = sprintf(
            'Bonjour %s, votre accord sur le devis %s a été enregistré le %s. Ce message en est votre exemplaire : conservez-le.',
            self::escape($quote['client_name']),
            self::escape($quote['number']),
            self::escape(self::formatDate((string)$quote['decided_at']) . ' à ' . self::formatTime((string)$quote['decided_at']))
        );
        $rows = self::quoteRows($quote, true);
        if ((float)$quote['total_debours'] > 0) {
            $rows['Mandat de débours'] = $quote['debours_mandate']
                ? self::escape('Donné : achat des pièces en votre nom, dans la limite de ' . self::money((float)$quote['debours_budget']))
                : 'Refusé : vous fournissez les pièces';
        }
        $rows['Pièces remplacées'] = $quote['keep_parts'] ? 'Vous les conservez' : 'Laissées au professionnel (décharge)';
        if ((int)$quote['urgent']) {
            $outro = 'Intervention urgente demandée par vous : pas de délai de rétractation, dans la limite des pièces et travaux strictement nécessaires.';
        } else {
            $outro = sprintf(
                'Vous pouvez vous rétracter sans motif jusqu\'au %s inclus, depuis la page du devis (« Renoncer au contrat ici ») ; un accusé de réception vous sera envoyé par email.%s',
                self::escape(self::formatDate((string)$quote['withdrawal_until'])),
                $quote['early_execution'] ? ' Vous avez expressément demandé que l\'intervention commence avant la fin de ce délai : en cas de rétractation, le service déjà fourni reste dû à proportion, et une fois la prestation entièrement exécutée, vous ne disposerez plus du droit de rétractation.' : ''
            );
        }

        // Exemplaire du contrat sur support durable : informations de L221-5 et formulaire type (L221-9)
        $outro .= self::quoteContractDetails($quote, $config, $url);

        return [
            'subject' => $subject,
            'html'    => self::layout($company, 'Devis accepté', $intro, $rows, $outro, $url && !(int)$quote['urgent'] ? ['url' => $url, 'label' => 'Voir le devis'] : null, $config),
            'text'    => self::plainText('Devis accepté', $intro, $rows, $outro, $url, $config, 'Voir le devis'),
        ];
    }

    /**
     * Informations du contrat reprises dans l'exemplaire envoyé au client (C. consom. L221-5 et L221-9) :
     * entreprise, exécution, paiement, réclamations, médiateur, garanties, modèle d'information sur la
     * rétractation et formulaire type (textes de `LegalTexts`, identiques à la page et à l'impression).
     */
    private static function quoteContractDetails(array $quote, array $config, ?string $url): string
    {
        $section = fn(string $title, array $paragraphs) => sprintf(
            '<p style="margin:20px 0 6px;font-weight:700;color:%s;">%s</p>%s',
            self::GRAY_800,
            self::escape($title),
            implode('', array_map(fn($p) => '<p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:' . self::GRAY_500 . ';">' . self::escape($p) . '</p>', $paragraphs))
        );
        $html = $section('Entreprise', LegalTexts::companyLines($config));
        $terms = array_filter([
            !empty($quote['execution_terms']) ? 'Exécution : ' . $quote['execution_terms'] : '',
            !empty($quote['payment_terms']) ? 'Paiement : ' . $quote['payment_terms'] : '',
            !empty($quote['time_counting']) ? $quote['time_counting'] : '',
            $quote['vat_mode'] === 'vat' ? '' : (string)(($config['quote_vat_exemption'] ?? '') ?: 'TVA non applicable, article 293 B du CGI'),
            !empty($config['legal_complaints']) ? 'Réclamations : ' . $config['legal_complaints'] : '',
            !empty($config['legal_mediator']) ? 'Médiation de la consommation : ' . $config['legal_mediator'] : '',
        ]);
        $html .= $section('Conditions', $terms);
        if ((int)$quote['builder_works']) {
            $html .= $section('Garanties légales des constructeurs', array_merge(
                LegalTexts::builderGuarantees(),
                ["Attestation d'assurance de responsabilité décennale jointe à l'envoi du devis (Code des assurances, art. L243-2)."]
            ));
        }
        if ((int)$quote['urgent']) {
            $html .= $section('Droit de rétractation', ['Intervention urgente expressément demandée : pas de droit de rétractation (article L221-28, 8°, du Code de la consommation), dans la limite des pièces de rechange et travaux strictement nécessaires.']);
            return $html;
        }
        $notice = LegalTexts::withdrawalNotice($config, $url ?? '', (bool)(int)($quote['sale'] ?? 0));
        $html .= $section($notice['title'], []);
        foreach ($notice['sections'] as $title => $paragraphs) {
            $html .= $section($title, $paragraphs);
        }
        // Formulaire type joint en PDF remplissable (L221-9) ; accès au formulaire prérempli en ligne
        $online = self::quoteWithdrawalUrl($quote);
        return $html . sprintf(
            '<div style="margin:20px 0 0;padding:14px 16px;border:1px solid %s;border-radius:8px;">'
            . '<p style="margin:0 0 6px;font-weight:700;color:%s;">Formulaire de rétractation</p>'
            . '<p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:%s;">Le devis, le cas échéant le mandat de débours, et le formulaire type de rétractation (PDF remplissable) sont joints à ce message.</p>'
            . '<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:%s;">%s</p>%s</div>',
            self::GRAY_200, self::GRAY_800, self::GRAY_500, self::GRAY_500,
            self::escape(QuotePdf::ONLINE_FORM_NOTICE),
            $online ? sprintf('<a href="%s" style="color:%s;font-weight:600;">Remplir le formulaire en ligne</a>', self::escape($online), self::primary($config)) : ''
        );
    }

    /**
     * Réponse du client, à l'artisan : décision, mandat, pièces remplacées, rétractation.
     *
     * @return array{subject: string, html: string, text: string}
     */
    public static function quoteDecisionPro(array $quote, array $config): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $accepted = $quote['status'] === 'accepted';
        $subject = sprintf('Devis %s %s par %s', $quote['number'], $accepted ? 'accepté' : 'refusé', $quote['client_name']);
        $intro = sprintf('%s a %s le devis %s.', self::escape($quote['client_name']), $accepted ? 'accepté' : 'refusé', self::escape($quote['number']));
        $rows = self::quoteRows($quote);
        if ($accepted) {
            if ((float)$quote['total_debours'] > 0) {
                $rows['Mandat de débours'] = $quote['debours_mandate']
                    ? self::escape('Donné, budget ' . self::money((float)$quote['debours_budget']) . ' : pièces à acheter au nom du client')
                    : 'Refusé : le client fournit les pièces';
            }
            $rows['Pièces remplacées'] = $quote['keep_parts'] ? 'Le client les conserve' : 'Laissées au professionnel (décharge)';
            $rows['Rétractation'] = (int)$quote['urgent']
                ? 'Intervention urgente : aucun délai'
                : self::escape('Jusqu\'au ' . self::formatDate((string)$quote['withdrawal_until']) . ($quote['early_execution'] ? ' (exécution anticipée demandée)' : ' : ne pas commencer avant, sauf demande expresse'));
        } elseif (!empty($quote['refusal_reason'])) {
            $rows['Motif'] = self::escape((string)$quote['refusal_reason']);
        }
        $outro = $accepted && (float)$quote['total_debours'] > 0 && $quote['debours_mandate']
            ? 'Pièces : facture ou ticket au nom du client, originaux à conserver, copie au client, montant exact refacturé.'
            : '';

        return [
            'subject' => $subject,
            'html'    => self::layout($company, $accepted ? 'Devis accepté' : 'Devis refusé', $intro, $rows, $outro, null, $config),
            'text'    => self::plainText($accepted ? 'Devis accepté' : 'Devis refusé', $intro, $rows, $outro, null, $config),
        ];
    }

    /**
     * Accusé de réception de la rétractation, sur support durable : contenu de la déclaration, date
     * et heure de son envoi (fonction de rétractation en ligne, depuis le 19 juin 2026).
     *
     * @param bool $forPro Copie destinée à l'artisan.
     * @return array{subject: string, html: string, text: string}
     */
    public static function quoteWithdrawal(array $quote, array $config, bool $forPro): array
    {
        $company = $config['company_name'] ?? 'Crénelio';
        $title = $forPro ? 'Rétractation du client' : 'Accusé de réception de votre rétractation';
        $subject = sprintf('%s — devis %s', $title, $quote['number']);
        $intro = $forPro
            ? sprintf('%s s\'est rétracté du devis %s : ne pas engager l\'intervention ni l\'achat des pièces.', self::escape($quote['client_name']), self::escape($quote['number']))
            : sprintf('Bonjour %s, nous avons bien reçu votre déclaration de rétractation. Le contrat est annulé.', self::escape((string)$quote['withdrawal_name']));
        $rows = [
            'Contrat'                 => self::escape('Devis ' . $quote['number'] . ($quote['title'] ? ' — ' . $quote['title'] : '')),
            'Déclaration de'          => self::escape((string)$quote['withdrawal_name']),
            'Accusé envoyé à'         => self::escape((string)$quote['withdrawal_email']),
            'Envoyée le'              => self::escape(self::formatDate((string)$quote['withdrawn_at']) . ' à ' . self::formatTime((string)$quote['withdrawn_at'])),
        ];
        $outro = $forPro
            ? 'Toute somme déjà versée est à rembourser au client dans les 14 jours (prestation déjà fournie à sa demande expresse : à proportion).'
            : 'Toute somme déjà versée vous sera remboursée dans les 14 jours.';

        return [
            'subject' => $subject,
            'html'    => self::layout($company, $title, $intro, $rows, $outro, null, $config),
            'text'    => self::plainText($title, $intro, $rows, $outro, null, $config),
        ];
    }

    /** Lignes du récapitulatif d'un devis (détail des lignes pour l'exemplaire du contrat). */
    private static function quoteRows(array $quote, bool $detailed = false): array
    {
        $rows = ['Devis' => self::escape((string)$quote['number'])];
        if ($detailed) {
            foreach ($quote['lines'] ?? [] as $line) {
                $amount = round((float)$line['quantity'] * (float)$line['unit_price'], 2);
                $label = sprintf('%s (%s %s)', $line['label'], rtrim(rtrim(number_format((float)$line['quantity'], 2, ',', ''), '0'), ','), $line['unit']);
                $rows[($line['kind'] === 'debours' ? 'Débours : ' : '') . $label] = self::money($amount);
            }
        }
        $rows['Total du devis TTC'] = self::money((float)$quote['total_ttc']);
        if (!empty($quote['execution_terms'])) {
            $rows['Exécution'] = self::escape((string)$quote['execution_terms']);
        }
        if ((float)$quote['total_debours'] > 0) {
            $rows['Pièces (mandat de débours, à part)'] = self::money((float)$quote['total_debours']);
        }
        if (!empty($quote['valid_until']) && $quote['status'] === 'sent') {
            $rows['Valable jusqu\'au'] = self::escape(self::formatDate((string)$quote['valid_until']));
        }
        return $rows;
    }

    /** Montant, zéro compris (un total de devis n'est jamais « Gratuit »). */
    private static function money(float $amount): string
    {
        return number_format($amount, 2, ',', ' ') . ' €';
    }

    // -----------------------------------------------------------------
    // Utilitaires
    // -----------------------------------------------------------------

    /** Lien public de gestion du rendez-vous, si l'URL du site est connue. */
    /** Lien de gestion du rendez-vous par le client (/rdv/:token), null sans APP_URL. */
    public static function manageUrl(array $appointment): ?string
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
