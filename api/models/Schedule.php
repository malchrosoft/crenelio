<?php
/**
 * Schedule model — Horaires d'ouverture hebdomadaires habituels.
 */

require_once __DIR__ . '/../core/Database.php';

class Schedule
{
    /**
     * Get all weekly schedules ordered by day_of_week (1=Monday to 7=Sunday).
     */
    public static function all(): array
    {
        return Database::fetchAll('SELECT * FROM `schedules` ORDER BY day_of_week ASC');
    }

    /**
     * Get schedule for a specific day of week (1=Monday .. 7=Sunday).
     */
    public static function getByDay(int $dayOfWeek): ?array
    {
        return Database::fetchOne('SELECT * FROM `schedules` WHERE day_of_week = ?', [$dayOfWeek]);
    }

    /**
     * Update schedule for a specific day of week.
     */
    public static function updateDay(int $dayOfWeek, array $data): bool
    {
        $sql = 'UPDATE `schedules` SET
                    is_active = ?,
                    morning_start = ?,
                    morning_end = ?,
                    afternoon_start = ?,
                    afternoon_end = ?
                WHERE day_of_week = ?';

        return Database::execute($sql, [
            isset($data['is_active']) ? (int)$data['is_active'] : 1,
            $data['morning_start'] ?? null,
            $data['morning_end'] ?? null,
            $data['afternoon_start'] ?? null,
            $data['afternoon_end'] ?? null,
            $dayOfWeek
        ]) >= 0;
    }
}
