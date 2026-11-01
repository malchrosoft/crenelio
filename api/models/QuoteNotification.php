<?php
/**
 * QuoteNotification model — Journal des emails d'un devis (envoi, réponses, rétractation), sur le
 * modèle de `Notification` : une ligne par tentative, consultable depuis l'Espace Artisan.
 */

require_once __DIR__ . '/../core/Database.php';

class QuoteNotification
{
    public static function forQuote(int $quoteId): array
    {
        return Database::fetchAll(
            'SELECT id, type, recipient, subject, status, error_message, sent_at, created_at
             FROM `quote_notifications` WHERE quote_id = ? ORDER BY created_at DESC, id DESC',
            [$quoteId]
        );
    }

    public static function createPending(int $quoteId, string $type, string $recipient, string $subject): int
    {
        Database::execute(
            'INSERT INTO `quote_notifications` (quote_id, type, recipient, subject, status) VALUES (?, ?, ?, ?, "pending")',
            [$quoteId, $type, $recipient, mb_substr($subject, 0, 255)]
        );
        return (int)Database::lastInsertId();
    }

    public static function markSent(int $id): void
    {
        Database::execute('UPDATE `quote_notifications` SET status = "sent", sent_at = NOW(), error_message = NULL WHERE id = ?', [$id]);
    }

    public static function markFailed(int $id, string $errorMessage): void
    {
        Database::execute(
            'UPDATE `quote_notifications` SET status = "failed", error_message = ? WHERE id = ?',
            [mb_substr($errorMessage, 0, 2000), $id]
        );
    }
}
