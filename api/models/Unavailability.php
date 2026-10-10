<?php
/**
 * Unavailability model — Congés et indisponibilités exceptionnelles.
 */

require_once __DIR__ . '/../core/Database.php';

class Unavailability
{
    /**
     * Get all unavailabilities.
     */
    public static function all(): array
    {
        return Database::fetchAll('SELECT * FROM `unavailabilities` ORDER BY start_datetime DESC');
    }

    /**
     * Get unavailabilities overlapping with a given datetime range.
     */
    public static function getForRange(string $startDatetime, string $endDatetime): array
    {
        $sql = 'SELECT * FROM `unavailabilities`
                WHERE start_datetime < ? AND end_datetime > ?
                ORDER BY start_datetime ASC';

        return Database::fetchAll($sql, [$endDatetime, $startDatetime]);
    }

    /**
     * Create an unavailability.
     */
    public static function create(array $data): int
    {
        Database::execute(
            'INSERT INTO `unavailabilities` (title, start_datetime, end_datetime) VALUES (?, ?, ?)',
            [
                $data['title'] ?? 'Indisponible',
                $data['start_datetime'],
                $data['end_datetime']
            ]
        );

        return (int)Database::lastInsertId();
    }

    /**
     * Delete an unavailability.
     */
    public static function delete(int $id): bool
    {
        return Database::execute('DELETE FROM `unavailabilities` WHERE id = ?', [$id]) > 0;
    }
}
