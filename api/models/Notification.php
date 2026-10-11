<?php
/**
 * Notification model — Journal des emails rattachés à un rendez-vous.
 *
 * Chaque tentative d'envoi laisse une trace consultable depuis l'espace Pro,
 * afin de répondre immédiatement à un client qui n'a rien reçu.
 */

require_once __DIR__ . '/../core/Database.php';

class Notification
{
    /** Types de notifications émises par l'application. */
    public const TYPES = ['client_confirmation', 'pro_confirmation'];

    /**
     * Journal complet d'un rendez-vous, du plus récent au plus ancien.
     */
    public static function forAppointment(int $appointmentId): array
    {
        return Database::fetchAll(
            'SELECT * FROM `appointment_notifications`
             WHERE appointment_id = ?
             ORDER BY created_at DESC, id DESC',
            [$appointmentId]
        );
    }

    /**
     * Compte les notifications par rendez-vous et par statut, pour pastiller
     * la liste du planning sans recharger chaque journal individuellement.
     *
     * @return array<int, array{total: int, sent: int, failed: int, pending: int}>
     */
    public static function countsByAppointment(): array
    {
        $rows = Database::fetchAll(
            'SELECT appointment_id, status, COUNT(*) AS total
             FROM `appointment_notifications`
             GROUP BY appointment_id, status'
        );

        $counts = [];
        foreach ($rows as $row) {
            $id = (int)$row['appointment_id'];
            $counts[$id] ??= ['total' => 0, 'sent' => 0, 'failed' => 0, 'pending' => 0];

            $total = (int)$row['total'];
            $counts[$id]['total'] += $total;
            $counts[$id][$row['status']] = $total;
        }

        return $counts;
    }

    /**
     * Crée une entrée « pending » avant toute tentative d'envoi : une panne
     * du SMTP laisse ainsi une trace au lieu de disparaître silencieusement.
     */
    public static function createPending(int $appointmentId, string $type, string $recipient, string $subject): int
    {
        Database::execute(
            'INSERT INTO `appointment_notifications` (appointment_id, type, recipient, subject, status)
             VALUES (?, ?, ?, ?, "pending")',
            [$appointmentId, $type, $recipient, mb_substr($subject, 0, 255)]
        );

        return (int)Database::lastInsertId();
    }

    /** Marque une notification comme envoyée. */
    public static function markSent(int $id): void
    {
        Database::execute(
            'UPDATE `appointment_notifications`
             SET status = "sent", sent_at = NOW(), error_message = NULL
             WHERE id = ?',
            [$id]
        );
    }

    /** Marque une notification en échec et conserve le motif pour l'IHM Pro. */
    public static function markFailed(int $id, string $errorMessage): void
    {
        Database::execute(
            'UPDATE `appointment_notifications`
             SET status = "failed", error_message = ?
             WHERE id = ?',
            [mb_substr($errorMessage, 0, 2000), $id]
        );
    }
}
