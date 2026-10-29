<?php
/**
 * Config model — Key-Value settings store.
 */

require_once __DIR__ . '/../core/Database.php';

class Config
{
    /**
     * Get all key-value pairs as an associative array.
     */
    public static function getAll(): array
    {
        $rows = Database::fetchAll('SELECT config_key, config_value FROM `config`');
        $result = [];
        foreach ($rows as $row) {
            $result[$row['config_key']] = $row['config_value'];
        }
        return $result;
    }

    /**
     * Get public settings (excludes sensitive fields like admin password).
     */
    public static function getPublic(): array
    {
        $all = self::getAll();
        unset($all['admin_password_hash']);
        // Préférences d'affichage de l'espace Pro (grilles…) : jamais exposées aux visiteurs
        foreach (array_keys($all) as $key) {
            if (str_starts_with($key, self::UI_STATE_PREFIX)) {
                unset($all[$key]);
            }
        }
        return $all;
    }

    /** Préfixe des préférences d'interface de l'espace Pro, une clé par élément (`ui_state_<id>`). */
    public const UI_STATE_PREFIX = 'ui_state_';

    public static function delete(string $key): void
    {
        Database::execute('DELETE FROM `config` WHERE config_key = ?', [$key]);
    }

    /**
     * Get a single config value.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        $row = Database::fetchOne('SELECT config_value FROM `config` WHERE config_key = ?', [$key]);
        return $row ? $row['config_value'] : $default;
    }

    /**
     * Set a single config value.
     */
    public static function set(string $key, ?string $value): void
    {
        Database::execute(
            'INSERT INTO `config` (config_key, config_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)',
            [$key, $value]
        );
    }

    /**
     * Update multiple config values. A `null` value deletes the key (ex. engagement retiré).
     */
    public static function updateMany(array $data): void
    {
        foreach ($data as $key => $value) {
            if ($value === null && $key !== 'admin_password_hash') {
                Database::execute('DELETE FROM `config` WHERE config_key = ?', [$key]);
            } elseif ($key === 'admin_password' && !empty($value)) {
                self::set('admin_password_hash', password_hash($value, PASSWORD_BCRYPT));
            } elseif ($key !== 'admin_password_hash') {
                self::set($key, (string)$value);
            }
        }
    }

    /**
     * Verify admin password.
     */
    public static function verifyPassword(string $password): bool
    {
        $hash = self::get('admin_password_hash');
        if (!$hash) {
            return false;
        }
        return password_verify($password, $hash);
    }
}
