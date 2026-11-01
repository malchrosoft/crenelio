<?php
/**
 * QuoteNotifier — Emails d'un devis (Item 22) : envoi au client, réponses, rétractation.
 *
 * Même contrat que `Notifier` : chaque tentative est journalisée (`quote_notifications`) avant
 * l'envoi, puis marquée `sent` ou `failed` ; aucune exception n'est propagée (une panne d'envoi ne
 * doit jamais annuler une réponse ou une rétractation déjà enregistrée).
 */

require_once __DIR__ . '/../models/QuoteNotification.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/EmailTemplates.php';

class QuoteNotifier
{
    /** Devis envoyé au client, avec le lien de réponse. */
    public static function sendQuote(array $quote, array $config): array
    {
        return [self::toClient($quote, 'quote_client', EmailTemplates::quoteClient($quote, $config))];
    }

    /** Réponse du client : exemplaire au client (accepté) ou accusé (refusé), et avis à l'artisan. */
    public static function sendDecision(array $quote, array $config): array
    {
        return array_values(array_filter([
            self::toClient($quote, 'decision_client', EmailTemplates::quoteDecisionClient($quote, $config)),
            self::toPro($quote, 'decision_pro', EmailTemplates::quoteDecisionPro($quote, $config)),
        ]));
    }

    /** Rétractation : accusé de réception à l'adresse choisie par le client, et avis à l'artisan. */
    public static function sendWithdrawal(array $quote, array $config): array
    {
        return array_values(array_filter([
            self::dispatch($quote, 'withdrawal_client', (string)$quote['withdrawal_email'], (string)$quote['withdrawal_name'],
                EmailTemplates::quoteWithdrawal($quote, $config, false), self::proAddress()),
            self::toPro($quote, 'withdrawal_pro', EmailTemplates::quoteWithdrawal($quote, $config, true)),
        ]));
    }

    private static function toClient(array $quote, string $type, array $message): ?array
    {
        $email = trim((string)$quote['client_email']);
        return $email === '' ? null : self::dispatch($quote, $type, $email, (string)$quote['client_name'], $message, self::proAddress());
    }

    private static function toPro(array $quote, string $type, array $message): ?array
    {
        $pro = self::proAddress();
        $client = trim((string)$quote['client_email']);
        return $pro === null ? null : self::dispatch($quote, $type, $pro, '', $message,
            filter_var($client, FILTER_VALIDATE_EMAIL) ? $client : null);
    }

    private static function proAddress(): ?string
    {
        $email = trim((string)(Config::get('pro_email') ?? ''));
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    /**
     * Journalise puis tente l'envoi. Ne propage aucune exception.
     *
     * @return array{type: string, status: string}
     */
    private static function dispatch(array $quote, string $type, string $recipient, string $name, array $message, ?string $replyTo): array
    {
        $id = QuoteNotification::createPending((int)$quote['id'], $type, $recipient, $message['subject']);
        try {
            $replyTo = $replyTo !== null && strcasecmp($replyTo, MAIL_FROM) !== 0 ? $replyTo : null;
            Mailer::send($recipient, $name, $message['subject'], $message['html'], $message['text'], null, $replyTo,
                EmailTemplates::inlineImages($message['html']));
            QuoteNotification::markSent($id);
            return ['type' => $type, 'status' => 'sent'];
        } catch (Throwable $e) {
            QuoteNotification::markFailed($id, $e->getMessage());
            error_log('[Crenelio] Envoi ' . $type . ' échoué : ' . $e->getMessage());
            return ['type' => $type, 'status' => 'failed'];
        }
    }
}
