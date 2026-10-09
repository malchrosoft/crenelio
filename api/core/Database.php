<?php
/**
 * Database connection using PDO (singleton).
 * OVH MySQL databases are typically on a dedicated host
 * like: your-db-name.mysql.db (not localhost).
 */

require_once __DIR__ . '/../config/config.php';

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                if (APP_DEBUG) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Database connection failed', 'detail' => $e->getMessage()]);
                } else {
                    error_log('DB connection error: ' . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Internal server error']);
                }
                exit;
            }
        }

        return self::$instance;
    }

    /** Execute a query and return all rows. */
    public static function fetchAll(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Execute a query and return a single row (or null). */
    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /** Execute an INSERT/UPDATE/DELETE and return the affected row count. */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /** Get the last inserted ID. */
    public static function lastInsertId(): string
    {
        return self::getConnection()->lastInsertId();
    }
}
