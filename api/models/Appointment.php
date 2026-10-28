<?php
/**
 * Appointment model — Réservations d'interventions chez les clients.
 */

require_once __DIR__ . '/../core/Database.php';

class Appointment
{
    /**
     * Get all appointments with service information, optionally filtered by date range or status.
     */
    public static function all(?string $startDate = null, ?string $endDate = null, ?string $status = null): array
    {
        $sql = 'SELECT a.*, s.name AS service_name, s.duration_minutes, s.price AS service_price
                FROM `appointments` a
                JOIN `services` s ON a.service_id = s.id
                WHERE 1=1';
        $params = [];

        if ($startDate !== null) {
            $sql .= ' AND a.start_datetime >= ?';
            $params[] = $startDate;
        }

        if ($endDate !== null) {
            $sql .= ' AND a.end_datetime <= ?';
            $params[] = $endDate;
        }

        if ($status !== null) {
            $sql .= ' AND a.status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY a.start_datetime ASC';

        return Database::fetchAll($sql, $params);
    }

    /**
     * Find an appointment by ID with service info.
     */
    public static function find(int $id): ?array
    {
        $sql = 'SELECT a.*, s.name AS service_name, s.duration_minutes, s.price AS service_price
                FROM `appointments` a
                JOIN `services` s ON a.service_id = s.id
                WHERE a.id = ?';

        return Database::fetchOne($sql, [$id]);
    }

    /**
     * Find an appointment by its secret cancel_token.
     */
    public static function findByToken(string $token): ?array
    {
        $sql = 'SELECT a.*, s.name AS service_name, s.duration_minutes, s.price AS service_price
                FROM `appointments` a
                JOIN `services` s ON a.service_id = s.id
                WHERE a.cancel_token = ?';

        return Database::fetchOne($sql, [$token]);
    }

    /**
     * Demande exceptionnelle en attente, retrouvée par le jeton du lien envoyé à l'artisan.
     */
    public static function findByDecisionToken(string $token): ?array
    {
        $sql = 'SELECT a.*, s.name AS service_name, s.duration_minutes, s.price AS service_price
                FROM `appointments` a
                JOIN `services` s ON a.service_id = s.id
                WHERE a.decision_token = ?';

        return Database::fetchOne($sql, [$token]);
    }

    /**
     * Décision de l'artisan sur une demande exceptionnelle : statut final, jeton invalidé.
     */
    public static function decide(int $id, string $status, ?string $reason = null): bool
    {
        return Database::execute(
            'UPDATE `appointments` SET status = ?, cancellation_reason = ?, decision_token = NULL
             WHERE id = ? AND status = "pending" AND decision_token IS NOT NULL',
            [$status, $reason, $id]
        ) > 0;
    }

    /**
     * Find overlapping active appointments within a datetime window.
     */
    public static function getOverlapping(string $startDatetime, string $endDatetime, ?int $excludeId = null): array
    {
        $sql = 'SELECT * FROM `appointments`
                WHERE status != "cancelled"
                  AND start_datetime < ?
                  AND end_datetime > ?';
        $params = [$endDatetime, $startDatetime];

        if ($excludeId !== null) {
            $sql .= ' AND id != ?';
            $params[] = $excludeId;
        }

        return Database::fetchAll($sql, $params);
    }

    /**
     * Create a new appointment.
     */
    public static function create(array $data): array
    {
        $token = bin2hex(random_bytes(24));

        Database::execute(
            'INSERT INTO `appointments` (
                service_id, client_name, client_email, client_phone,
                address, postal_code, city,
                travel_fee, distance_km, is_out_of_zone, notes,
                start_datetime, end_datetime, status, cancel_token, decision_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                (int)$data['service_id'],
                trim($data['client_name']),
                trim($data['client_email']),
                trim($data['client_phone']),
                trim($data['address']),
                trim($data['postal_code']),
                trim($data['city']),
                (float)($data['travel_fee'] ?? 0),
                isset($data['distance_km']) ? $data['distance_km'] : null,
                !empty($data['is_out_of_zone']) ? 1 : 0,
                isset($data['notes']) ? trim($data['notes']) : null,
                $data['start_datetime'],
                $data['end_datetime'],
                $data['status'] ?? 'confirmed',
                $token,
                $data['decision_token'] ?? null
            ]
        );

        $id = (int)Database::lastInsertId();
        return self::find($id);
    }

    /**
     * Update appointment status.
     */
    public static function updateStatus(int $id, string $status, ?string $reason = null): bool
    {
        return Database::execute(
            'UPDATE `appointments` SET status = ?, cancellation_reason = ? WHERE id = ?',
            [$status, $reason, $id]
        ) > 0;
    }

    /**
     * Reschedule an appointment (change start and end datetime).
     */
    public static function reschedule(int $id, string $startDatetime, string $endDatetime): bool
    {
        return Database::execute(
            'UPDATE `appointments` SET start_datetime = ?, end_datetime = ? WHERE id = ?',
            [$startDatetime, $endDatetime, $id]
        ) > 0;
    }

    // -----------------------------------------------------------------
    // RGPD (Item 5) : anonymisation et durée de conservation
    // -----------------------------------------------------------------

    /** Nom affiché à la place du client une fois ses données effacées. */
    public const ANONYMIZED_NAME = 'Client anonymisé';

    /** Durée de conservation par défaut après l'intervention (mois). */
    public const DEFAULT_RETENTION_MONTHS = 36;

    /**
     * Efface les données personnelles du client (nom, email, téléphone, adresse, notes, motif
     * d'annulation) et celles du journal des emails. Restent : prestation, date, statut, montants,
     * code postal et commune (statistiques de la zone d'intervention).
     */
    public static function anonymize(int $id): bool
    {
        return self::anonymizeWhere('a.id = ?', [$id]) > 0;
    }

    /**
     * Anonymise les rendez-vous terminés depuis plus de $months mois.
     * Les demandes « En attente » à venir ne sont jamais concernées.
     *
     * @return int Nombre de rendez-vous anonymisés.
     */
    public static function purgeOlderThan(int $months): int
    {
        return self::anonymizeWhere('a.end_datetime < DATE_SUB(NOW(), INTERVAL ? MONTH)', [$months]);
    }

    private static function anonymizeWhere(string $condition, array $params): int
    {
        // Journal des emails : adresses des clients et sujets (ceux de l'artisan citent le client)
        Database::execute(
            "UPDATE `appointment_notifications` n
             JOIN `appointments` a ON a.id = n.appointment_id
             SET n.recipient = IF(n.type IN ('pro_confirmation', 'exception_pro_request'), n.recipient, ''),
                 n.subject = '(données anonymisées)'
             WHERE a.client_name <> ? AND $condition",
            [self::ANONYMIZED_NAME, ...$params]
        );

        return Database::execute(
            "UPDATE `appointments` a
             SET a.client_name = ?, a.client_email = '', a.client_phone = '', a.address = '',
                 a.notes = NULL, a.cancellation_reason = NULL
             WHERE a.client_name <> ? AND $condition",
            [self::ANONYMIZED_NAME, self::ANONYMIZED_NAME, ...$params]
        );
    }
}
