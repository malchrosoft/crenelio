<?php
/**
 * Service model — Prestations proposées par l'artisan.
 */

require_once __DIR__ . '/../core/Database.php';

class Service
{
    /** Modes de facturation du déplacement acceptés (cf. `services.travel_fee_mode`). */
    public const TRAVEL_FEE_MODES = ['none', 'fixed', 'distance_tiers'];

    /**
     * Normalise le mode de déplacement fourni par le client de l'API.
     */
    public static function normalizeTravelFeeMode(mixed $mode): string
    {
        return in_array($mode, self::TRAVEL_FEE_MODES, true) ? $mode : 'none';
    }

    /**
     * Get all services, ordered by display_order.
     */
    public static function all(bool $activeOnly = true): array
    {
        $sql = 'SELECT * FROM `services`';
        if ($activeOnly) {
            $sql .= ' WHERE is_active = 1';
        }
        $sql .= ' ORDER BY display_order ASC, name ASC';

        return Database::fetchAll($sql);
    }

    /**
     * Find a service by ID.
     */
    public static function find(int $id): ?array
    {
        return Database::fetchOne('SELECT * FROM `services` WHERE id = ?', [$id]);
    }

    /**
     * Create a new service.
     */
    public static function create(array $data): int
    {
        Database::execute(
            'INSERT INTO `services`
                (name, description, duration_minutes, price, travel_fee_mode, travel_fee_amount, is_active, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $data['name'],
                $data['description'] ?? null,
                $data['duration_minutes'] ?? 60,
                $data['price'] ?? 0.00,
                self::normalizeTravelFeeMode($data['travel_fee_mode'] ?? 'none'),
                (float)($data['travel_fee_amount'] ?? 0.00),
                isset($data['is_active']) ? (int)$data['is_active'] : 1,
                $data['display_order'] ?? 0
            ]
        );

        return (int)Database::lastInsertId();
    }

    /**
     * Update an existing service.
     */
    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [];

        $editable = [
            'name', 'description', 'duration_minutes', 'price',
            'travel_fee_mode', 'travel_fee_amount', 'is_active', 'display_order'
        ];

        foreach ($editable as $field) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            $fields[] = "`$field` = ?";
            $params[] = match ($field) {
                'travel_fee_mode'   => self::normalizeTravelFeeMode($data[$field]),
                'travel_fee_amount' => (float)$data[$field],
                default             => $data[$field],
            };
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = 'UPDATE `services` SET ' . implode(', ', $fields) . ' WHERE id = ?';

        return Database::execute($sql, $params) > 0;
    }

    /**
     * Delete a service.
     */
    public static function delete(int $id): bool
    {
        return Database::execute('DELETE FROM `services` WHERE id = ?', [$id]) > 0;
    }
}
