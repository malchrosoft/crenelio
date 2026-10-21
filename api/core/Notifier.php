<?php
/**
 * Notifier — Orchestration des notifications email d'un rendez-vous.
 *
 * Contrat volontairement défensif : une panne d'envoi ne doit jamais faire
 * échouer une réservation déjà enregistrée. Chaque tentative est donc
 * journalisée en `pending` *avant* l'appel SMTP, puis basculée en `sent`
 * ou `failed`. L'artisan voit le résultat dans l'espace Pro et peut
 * relancer manuellement.
 */

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/ICalendar.php';
require_once __DIR__ . '/EmailTemplates.php';

class Notifier
{
    /**
     * Envoie les deux confirmations d'une réservation (client puis artisan).
     *
     * @return array<int, array{type: string, status: string}> Résumé par notification.
     */
    public static function sendBookingConfirmations(array $appointment, array $config): array
    {
        $results = [];

        // Rendez-vous saisi par l'artisan sans email client : seule la fiche artisan part
        if (trim((string)$appointment['client_email']) !== '') {
            $results[] = self::dispatch(
                $appointment,
                'client_confirmation',
                $appointment['client_email'],
                $appointment['client_name'],
                EmailTemplates::clientConfirmation($appointment, $config)
            );
        }

        $proEmail = trim((string)($config['pro_email'] ?? ''));
        if ($proEmail !== '') {
            $results[] = self::dispatch(
                $appointment,
                'pro_confirmation',
                $proEmail,
                (string)($config['pro_name'] ?? ''),
                EmailTemplates::proConfirmation($appointment, $config),
                [
                    'filename' => 'rendez-vous-' . (int)$appointment['id'] . '.ics',
                    'mime'     => 'text/calendar; charset=utf-8; method=REQUEST',
                    'content'  => ICalendar::forAppointment($appointment, $config),
                ]
            );
        }

        return $results;
    }

    /**
     * Demande exceptionnelle : accusé de réception au client, demande à valider à l'artisan
     * (réponse directe au client via Reply-To).
     *
     * @return array<int, array{type: string, status: string}>
     */
    public static function sendExceptionRequest(array $appointment, array $config): array
    {
        $results = [
            self::dispatch(
                $appointment,
                'exception_client_ack',
                $appointment['client_email'],
                $appointment['client_name'],
                EmailTemplates::exceptionClientAck($appointment, $config)
            ),
        ];

        $proEmail = trim((string)($config['pro_email'] ?? ''));
        if ($proEmail !== '') {
            $results[] = self::dispatch(
                $appointment,
                'exception_pro_request',
                $proEmail,
                (string)($config['pro_name'] ?? ''),
                EmailTemplates::exceptionProRequest($appointment, $config),
                null,
                $appointment['client_email']
            );
        }

        return $results;
    }

    /**
     * Demande exceptionnelle refusée : information du client.
     *
     * @return array{type: string, status: string}
     */
    public static function sendExceptionRefused(array $appointment, array $config): array
    {
        return self::dispatch(
            $appointment,
            'exception_client_refused',
            $appointment['client_email'],
            $appointment['client_name'],
            EmailTemplates::exceptionClientRefused($appointment, $config)
        );
    }

    /**
     * Rejoue une notification d'un type donné (bouton « Renvoyer » de l'IHM Pro).
     *
     * @return array{type: string, status: string}
     */
    public static function resend(array $appointment, array $config, string $type): array
    {
        if ($type === 'pro_confirmation') {
            $proEmail = trim((string)($config['pro_email'] ?? ''));
            if ($proEmail === '') {
                throw new InvalidArgumentException("Aucune adresse professionnelle n'est renseignée dans la configuration");
            }

            return self::dispatch(
                $appointment,
                $type,
                $proEmail,
                (string)($config['pro_name'] ?? ''),
                EmailTemplates::proConfirmation($appointment, $config),
                [
                    'filename' => 'rendez-vous-' . (int)$appointment['id'] . '.ics',
                    'mime'     => 'text/calendar; charset=utf-8; method=REQUEST',
                    'content'  => ICalendar::forAppointment($appointment, $config),
                ]
            );
        }

        if ($type === 'client_confirmation') {
            return self::dispatch(
                $appointment,
                $type,
                $appointment['client_email'],
                $appointment['client_name'],
                EmailTemplates::clientConfirmation($appointment, $config)
            );
        }

        throw new InvalidArgumentException("Type de notification inconnu : $type");
    }

    /**
     * Journalise puis tente un envoi unitaire. Ne propage aucune exception.
     *
     * @param array{subject: string, html: string, text: string}            $message
     * @param array{filename: string, mime: string, content: string}|null   $attachment
     *
     * @return array{type: string, status: string}
     */
    private static function dispatch(
        array $appointment,
        string $type,
        string $recipient,
        string $recipientName,
        array $message,
        ?array $attachment = null,
        ?string $replyTo = null
    ): array {
        $notificationId = Notification::createPending(
            (int)$appointment['id'],
            $type,
            $recipient,
            $message['subject']
        );

        try {
            Mailer::send(
                $recipient,
                $recipientName,
                $message['subject'],
                $message['html'],
                $message['text'],
                $attachment,
                $replyTo
            );

            Notification::markSent($notificationId);
            return ['type' => $type, 'status' => 'sent'];
        } catch (Throwable $e) {
            Notification::markFailed($notificationId, $e->getMessage());
            error_log('[Crenelio] Envoi ' . $type . ' échoué : ' . $e->getMessage());

            return ['type' => $type, 'status' => 'failed'];
        }
    }
}
