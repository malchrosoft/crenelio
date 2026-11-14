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
                address, postal_code, city, latitude, longitude,
                travel_fee, distance_km, is_out_of_zone, notes,
                start_datetime, end_datetime, status, cancel_token, decision_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                (int)$data['service_id'],
                trim($data['client_name']),
                trim($data['client_email']),
                trim($data['client_phone']),
                trim($data['address']),
                trim($data['postal_code']),
                trim($data['city']),
                // Position calculée à la réservation (frais de déplacement), conservée pour la carte
                isset($data['latitude']) ? (float)$data['latitude'] : null,
                isset($data['longitude']) ? (float)$data['longitude'] : null,
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

    /** Position du lieu d'intervention (localisation après coup, cf. AppointmentController::locate). */
    public static function setCoordinates(int $id, float $latitude, float $longitude): void
    {
        Database::execute('UPDATE `appointments` SET latitude = ?, longitude = ? WHERE id = ?', [$latitude, $longitude, $id]);
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
    /**
     * Nom porté par un rendez-vous réduit (contrat conservé) : ses données de contact sont effacées. Pas
     * « anonymisé » : la ligne garde sa date (docs/legal/fr/conservation-effacement.md). Identique à privacy.ts.
     */
    public const ANONYMIZED_NAME = 'Client (données effacées)';

    /** Durée de conservation par défaut après l'intervention (mois). */
    public const DEFAULT_RETENTION_MONTHS = 36;

    /**
     * Contrats conclus (devis acceptés, puis éventuellement rétractés) : conservés dix ans à compter de
     * l'exécution, accès du client garanti (C. consom. L213-1, D213-1 et D213-2 dès 120 € ; en deçà, même
     * durée par prudence, cf. C. com. L123-22) ; l'effacement ne s'y applique pas pendant ce délai (RGPD,
     * art. 17, 3, b). docs/legal/fr/conservation-effacement.md.
     */
    public const CONTRACT_RETENTION_YEARS = 10;

    /** Devis `q` (rendez-vous `a`, éventuellement absent) encore à conserver comme contrat. */
    public static function keptContractSql(): string
    {
        return "(q.status IN ('accepted', 'withdrawn') AND DATE_ADD(COALESCE(q.withdrawn_at, a.end_datetime, q.decided_at), INTERVAL "
            . self::CONTRACT_RETENTION_YEARS . ' YEAR) > NOW())';
    }

    /** Le rendez-vous `a` a-t-il un devis encore à conserver comme contrat ? (condition SQL corrélée) */
    private static function hasKeptContractSql(): string
    {
        return 'EXISTS (SELECT 1 FROM `quotes` q WHERE q.appointment_id = a.id AND ' . self::keptContractSql() . ')';
    }

    /**
     * Effacement à la demande du client (RGPD, art. 17). Une ligne gardée avec sa date, sa prestation, son
     * montant et sa commune n'est pas anonyme (groupe de l'article 29, avis 05/2014, p. 9-10) : le rendez-vous
     * et ses devis non conclus sont **supprimés**. Un rendez-vous dont un devis est conservé comme contrat
     * (`CONTRACT_RETENTION_YEARS`) est seulement réduit au strict nécessaire, le contrat restant intact.
     *
     * @return string `deleted` ou `minimised`
     */
    public static function erase(int $id): string
    {
        $kept = self::keptContractSql();
        Database::execute("DELETE q FROM `quotes` q JOIN `appointments` a ON a.id = q.appointment_id WHERE a.id = ? AND NOT $kept", [$id]);
        if (Database::fetchOne('SELECT a.id FROM `appointments` a WHERE a.id = ? AND ' . self::hasKeptContractSql(), [$id])) {
            self::minimiseWhere('a.id = ?', [$id]);
            return 'minimised';
        }
        Database::execute('DELETE FROM `appointments` WHERE id = ?', [$id]);
        return 'deleted';
    }

    /**
     * Fin de la durée de conservation (`rgpd_retention_months` après l'intervention) : rendez-vous et devis
     * non conclus **supprimés** ; un rendez-vous lié à un contrat conservé est réduit (archivage intermédiaire,
     * CNIL) et supprimé avec lui à son terme (`purgeQuotes`). Les demandes à venir ne sont jamais concernées.
     *
     * @return int Nombre de rendez-vous supprimés.
     */
    public static function purgeOlderThan(int $months): int
    {
        $old = 'a.end_datetime < DATE_SUB(NOW(), INTERVAL ? MONTH)';
        $kept = self::keptContractSql();
        Database::execute("DELETE q FROM `quotes` q JOIN `appointments` a ON a.id = q.appointment_id WHERE $old AND NOT $kept", [$months]);
        $deleted = Database::execute("DELETE a FROM `appointments` a WHERE $old AND NOT " . self::hasKeptContractSql(), [$months]);
        self::minimiseWhere($old, [$months]);
        return $deleted;
    }

    /**
     * Devis hors rendez-vous et contrats échus : devis non conclus sans rendez-vous inactifs depuis `$months`
     * mois, et contrats dont les dix ans sont écoulés, **supprimés** (leur rendez-vous l'est ensuite par
     * `purgeOlderThan`).
     *
     * @return int Nombre de devis supprimés.
     */
    public static function purgeQuotes(int $months): int
    {
        $kept = self::keptContractSql();
        $standalone = 'q.appointment_id IS NULL AND COALESCE(q.withdrawn_at, q.cancelled_at, q.decided_at, q.sent_at, q.created_at) < DATE_SUB(NOW(), INTERVAL ? MONTH)';
        return Database::execute(
            "DELETE q FROM `quotes` q LEFT JOIN `appointments` a ON a.id = q.appointment_id
             WHERE NOT $kept AND (($standalone) OR q.status IN ('accepted', 'withdrawn'))",
            [$months]
        );
    }

    /** Devis acceptés d'un rendez-vous, conservés comme contrats (numéros), pour l'avertir avant un effacement. */
    public static function keptContracts(int $id): array
    {
        return array_column(Database::fetchAll(
            'SELECT q.number FROM `quotes` q JOIN `appointments` a ON a.id = q.appointment_id WHERE a.id = ? AND ' . self::keptContractSql(),
            [$id]
        ), 'number');
    }

    /**
     * Réduit au strict nécessaire un rendez-vous lié à un contrat conservé (archivage intermédiaire) : plus
     * de coordonnées ni de notes, journal des emails sans destinataire ; le rendez-vous ne garde que ce qui
     * date l'exécution du contrat. Côté devis conservé, seul le téléphone est retiré (tri des données : il ne
     * constate pas le contrat).
     */
    private static function minimiseWhere(string $condition, array $params): void
    {
        Database::execute(
            "UPDATE `appointment_notifications` n
             JOIN `appointments` a ON a.id = n.appointment_id
             SET n.recipient = IF(n.type IN ('pro_confirmation', 'exception_pro_request'), n.recipient, ''),
                 n.subject = '(données effacées)'
             WHERE a.client_name <> ? AND $condition",
            [self::ANONYMIZED_NAME, ...$params]
        );
        Database::execute(
            "UPDATE `quotes` q JOIN `appointments` a ON a.id = q.appointment_id SET q.client_phone = '' WHERE $condition AND " . self::keptContractSql(),
            $params
        );
        Database::execute(
            "UPDATE `appointments` a
             SET a.client_name = ?, a.client_email = '', a.client_phone = '', a.address = '',
                 a.latitude = NULL, a.longitude = NULL,
                 a.notes = NULL, a.cancellation_reason = NULL
             WHERE a.client_name <> ? AND $condition",
            [self::ANONYMIZED_NAME, self::ANONYMIZED_NAME, ...$params]
        );
    }
}
