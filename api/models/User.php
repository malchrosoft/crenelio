<?php
/**
 * User model — handles database operations for the technibook_users table.
 * This is a simple active-record-style model using the Database helper.
 */

require_once __DIR__ . '/../core/Database.php';

class User
{
    public static function all(): array
    {
        return Database::fetchAll('SELECT * FROM technibook_users ORDER BY id DESC');
    }

    public static function find(int $id): ?array
    {
        return Database::fetchOne('SELECT * FROM technibook_users WHERE id = :id', ['id' => $id]);
    }

    public static function create(array $data): int
    {
        Database::execute(
            'INSERT INTO technibook_users (name, email, role) VALUES (:name, :email, :role)',
            [
                'name'  => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
                'role'  => $data['role'] ?? 'member',
            ]
        );
        return (int) Database::lastInsertId();
    }

    public static function update(int $id, array $data): int
    {
        return Database::execute(
            'UPDATE technibook_users SET name = :name, email = :email, role = :role WHERE id = :id',
            [
                'id'    => $id,
                'name'  => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
                'role'  => $data['role'] ?? 'member',
            ]
        );
    }

    public static function delete(int $id): int
    {
        return Database::execute('DELETE FROM technibook_users WHERE id = :id', ['id' => $id]);
    }
}
