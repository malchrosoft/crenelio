-- =====================================================
-- Sample CRUD Schema: Users table
-- For OVH MySQL databases (phpMyAdmin or MySQL CLI)
-- =====================================================

CREATE TABLE IF NOT EXISTS `technibook_users` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `name`       VARCHAR(255)    NOT NULL,
    `email`      VARCHAR(255)    NOT NULL UNIQUE,
    `role`       ENUM('member', 'admin', 'guest') NOT NULL DEFAULT 'member',
    `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: seed with sample data
INSERT INTO `technibook_users` (`name`, `email`, `role`) VALUES
    ('Alice Dupont',   'alice@example.com',   'admin'),
    ('Bob Martin',     'bob@example.com',     'member'),
    ('Charlie Petit',  'charlie@example.com', 'guest');
