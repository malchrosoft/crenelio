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
                start_datetime, end_datetime, status, cancel_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                $token
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
}
