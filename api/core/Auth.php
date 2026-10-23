<?php
/**
 * Auth — Authentification de l'espace Pro, vérifiée côté serveur.
 *
 * - Session PHP dans un cookie HttpOnly / SameSite=Strict : aucun jeton n'est exposé au JavaScript.
 * - Appareil de confiance : cookie signé (HMAC) valable 10 jours ; il dispense du code par email.
 *   Changer le mot de passe invalide tous les appareils de confiance.
 * - Code à 6 chiffres envoyé à `pro_email` : 15 minutes, 3 essais, lié à la session qui l'a demandé.
 * - Limitation des échecs de mot de passe par adresse IP.
 *
 * La clé de signature est générée au premier besoin dans `api/storage/auth/secret.key`
 * (jamais en base : la table `config` n'est pas un coffre).
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/EmailTemplates.php';
require_once __DIR__ . '/Response.php';

class Auth
{
    private const SESSION_NAME   = 'crenelio_admin';
    private const DEVICE_COOKIE  = 'crenelio_device';
    private const DEVICE_DAYS    = 10;

    /** Session inactive au-delà de 2 h, et close dans tous les cas après 12 h. */
    private const IDLE_SECONDS     = 2 * 3600;
    private const ABSOLUTE_SECONDS = 12 * 3600;

    private const OTP_SECONDS  = 15 * 60;
    private const OTP_ATTEMPTS = 3;
    /** Délai minimal entre deux envois de code. */
    private const OTP_RESEND_SECONDS = 60;

    /** Échecs de mot de passe tolérés par IP sur la fenêtre, avant blocage. */
    private const MAX_FAILURES   = 5;
    private const FAILURE_WINDOW = 15 * 60;

    // -----------------------------------------------------------------
    // Garde des routes
    // -----------------------------------------------------------------

    /** Enveloppe un gestionnaire de route : 401 si l'espace Pro n'est pas ouvert. */
    public static function guard(callable $handler): callable
    {
        return function (array $params) use ($handler) {
            if (!self::isAuthenticated()) {
                Response::json(['error' => 'Session expirée, reconnectez-vous'], 401);
            }
            $handler($params);
        };
    }

    public static function isAuthenticated(): bool
    {
        // Pas de cookie de session : inutile d'en créer une pour un simple visiteur
        if (session_status() !== PHP_SESSION_ACTIVE && !isset($_COOKIE[self::SESSION_NAME])) {
            return false;
        }
        self::startSession();
        $at   = $_SESSION['admin_at'] ?? null;
        $seen = $_SESSION['admin_seen'] ?? null;
        $now  = time();

        if ($at === null || $seen === null
            || $now - $seen > self::IDLE_SECONDS
            || $now - $at > self::ABSOLUTE_SECONDS
            || ($_SESSION['admin_ph'] ?? '') !== self::passwordFingerprint()
        ) {
            unset($_SESSION['admin_at'], $_SESSION['admin_seen'], $_SESSION['admin_ph']);
            return false;
        }

        $_SESSION['admin_seen'] = $now;
        return true;
    }

    /** Le second facteur n'est possible que si un email peut partir vers l'artisan. */
    public static function twoFactorAvailable(): bool
    {
        return Mailer::isConfigured() && filter_var(Config::get('pro_email') ?? '', FILTER_VALIDATE_EMAIL) !== false;
    }

    // -----------------------------------------------------------------
    // Étapes de connexion
    // -----------------------------------------------------------------

    /**
     * Mot de passe vérifié : ouvre la session si l'appareil est de confiance (ou si le second
     * facteur est indisponible), sinon envoie un code.
     *
     * @return array{status: 'authenticated'|'otp_required', email_hint?: string}
     */
    public static function afterPassword(): array
    {
        if (!self::twoFactorAvailable() || self::isTrustedDevice()) {
            self::open();
            return ['status' => 'authenticated'];
        }

        self::startSession();
        $pending = $_SESSION['otp'] ?? null;
        if ($pending && time() - $pending['sent_at'] < self::OTP_RESEND_SECONDS) {
            // Code récent toujours valable : pas de nouvel envoi
            return ['status' => 'otp_required', 'email_hint' => self::maskEmail(Config::get('pro_email'))];
        }

        $code = (string)random_int(100000, 999999);
        $config = Config::getAll();
        $message = EmailTemplates::adminCode($code, self::OTP_SECONDS / 60, $config);
        try {
            Mailer::send(
                $config['pro_email'],
                $config['company_name'] ?? '',
                $message['subject'],
                $message['html'],
                $message['text'],
                null,
                null,
                EmailTemplates::inlineImages($message['html'])
            );
        } catch (Throwable $e) {
            error_log('[Crenelio] Envoi du code de connexion échoué : ' . $e->getMessage());
            Response::json(['error' => "Envoi du code de connexion impossible. Réessayez dans quelques instants."], 503);
        }

        $_SESSION['otp'] = [
            'hash'     => password_hash($code, PASSWORD_DEFAULT),
            'expires'  => time() + self::OTP_SECONDS,
            'attempts' => 0,
            'sent_at'  => time(),
        ];
        return ['status' => 'otp_required', 'email_hint' => self::maskEmail($config['pro_email'])];
    }

    /** Vérifie le code reçu par email ; ouvre la session et mémorise l'appareil. */
    public static function verifyCode(string $code): void
    {
        self::startSession();
        $pending = $_SESSION['otp'] ?? null;
        if (!$pending) {
            Response::json(['error' => 'Aucun code en attente, reconnectez-vous'], 400);
        }
        if (time() > $pending['expires']) {
            unset($_SESSION['otp']);
            Response::json(['error' => 'Code expiré, reconnectez-vous pour en recevoir un nouveau'], 400);
        }

        if (!password_verify($code, $pending['hash'])) {
            $_SESSION['otp']['attempts']++;
            $left = self::OTP_ATTEMPTS - $_SESSION['otp']['attempts'];
            if ($left <= 0) {
                unset($_SESSION['otp']);
                Response::json(['error' => 'Trop de codes erronés, reconnectez-vous pour en recevoir un nouveau'], 429);
            }
            Response::json(['error' => "Code incorrect ($left essai" . ($left > 1 ? 's' : '') . ' restant' . ($left > 1 ? 's' : '') . ')'], 401);
        }

        unset($_SESSION['otp']);
        self::open();
        self::trustDevice();
    }

    public static function logout(): void
    {
        self::startSession();
        $_SESSION = [];
        session_destroy();
        setcookie(self::SESSION_NAME, '', self::cookieOptions(time() - 3600));
    }

    // -----------------------------------------------------------------
    // Limitation des échecs de mot de passe (par IP)
    // -----------------------------------------------------------------

    /** Répond 429 si l'IP a trop d'échecs récents. */
    public static function checkThrottle(): void
    {
        $failures = self::failures(self::clientKey());
        if (count($failures) >= self::MAX_FAILURES) {
            $wait = (int)ceil((min($failures) + self::FAILURE_WINDOW - time()) / 60);
            Response::json(['error' => "Trop de tentatives. Réessayez dans $wait min."], 429);
        }
    }

    public static function recordFailure(): void
    {
        self::updateThrottle(function (array $all) {
            $key = self::clientKey();
            $all[$key] = [...self::recent($all[$key] ?? []), time()];
            return $all;
        });
    }

    public static function clearFailures(): void
    {
        self::updateThrottle(function (array $all) {
            unset($all[self::clientKey()]);
            return $all;
        });
    }

    // -----------------------------------------------------------------
    // Interne
    // -----------------------------------------------------------------

    private static function open(): void
    {
        self::startSession();
        session_regenerate_id(true);
        $_SESSION['admin_at']   = time();
        $_SESSION['admin_seen'] = time();
        $_SESSION['admin_ph']   = self::passwordFingerprint();
    }

    private static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_name(self::SESSION_NAME);
        session_set_cookie_params(self::cookieOptions(0));
        session_start();
    }

    private static function cookieOptions(int $expires): array
    {
        return [
            'expires'  => $expires,
            'path'     => '/',
            'secure'   => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Strict',
        ];
    }

    private static function isHttps(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }

    private static function trustDevice(): void
    {
        $payload = base64_encode(json_encode([
            'exp' => time() + self::DEVICE_DAYS * 86400,
            'ph'  => self::passwordFingerprint(),
        ]));
        $value = $payload . '.' . hash_hmac('sha256', $payload, self::secret());
        setcookie(self::DEVICE_COOKIE, $value, self::cookieOptions(time() + self::DEVICE_DAYS * 86400));
    }

    private static function isTrustedDevice(): bool
    {
        $parts = explode('.', $_COOKIE[self::DEVICE_COOKIE] ?? '', 2);
        if (count($parts) !== 2 || !hash_equals(hash_hmac('sha256', $parts[0], self::secret()), $parts[1])) {
            return false;
        }
        $data = json_decode((string)base64_decode($parts[0], true), true);
        return is_array($data)
            && ($data['exp'] ?? 0) > time()
            && hash_equals(self::passwordFingerprint(), (string)($data['ph'] ?? ''));
    }

    /** Empreinte du hash du mot de passe : la changer révoque sessions et appareils de confiance. */
    private static function passwordFingerprint(): string
    {
        return substr(hash_hmac('sha256', Config::get('admin_password_hash') ?? '', self::secret()), 0, 32);
    }

    private static function dir(): string
    {
        return __DIR__ . '/../storage/auth';
    }

    private static function secret(): string
    {
        static $secret = null;
        if ($secret !== null) {
            return $secret;
        }
        $path = self::dir() . '/secret.key';
        if (!is_file($path)) {
            if (!is_dir(self::dir())) {
                mkdir(self::dir(), 0700, true);
            }
            // `x` : échoue si un autre processus vient de le créer, on relit alors le sien
            $handle = @fopen($path, 'x');
            if ($handle) {
                fwrite($handle, bin2hex(random_bytes(32)));
                fclose($handle);
                chmod($path, 0600);
            }
        }
        $secret = trim((string)@file_get_contents($path));
        if (strlen($secret) < 64) {
            error_log('[Crenelio] Clé api/storage/auth/secret.key illisible ou absente');
            Response::json(['error' => "Dossier api/storage/auth inaccessible en écriture"], 500);
        }
        return $secret;
    }

    private static function clientKey(): string
    {
        return hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }

    /** @return list<int> */
    private static function recent(array $timestamps): array
    {
        return array_values(array_filter($timestamps, fn($t) => $t > time() - self::FAILURE_WINDOW));
    }

    /** @return list<int> */
    private static function failures(string $key): array
    {
        $path = self::dir() . '/throttle.json';
        $all = is_file($path) ? json_decode((string)file_get_contents($path), true) : [];
        return self::recent(is_array($all) ? ($all[$key] ?? []) : []);
    }

    private static function updateThrottle(callable $update): void
    {
        if (!is_dir(self::dir())) {
            mkdir(self::dir(), 0700, true);
        }
        $handle = fopen(self::dir() . '/throttle.json', 'c+');
        if (!$handle) {
            return;
        }
        flock($handle, LOCK_EX);
        $all = json_decode((string)stream_get_contents($handle), true);
        $all = $update(is_array($all) ? $all : []);
        // Purge des IP sans échec récent
        $all = array_filter(array_map(fn($t) => self::recent($t), $all));
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($all));
        flock($handle, LOCK_UN);
        fclose($handle);
    }

    private static function maskEmail(?string $email): string
    {
        [$local, $domain] = array_pad(explode('@', (string)$email, 2), 2, '');
        return mb_substr($local, 0, 1) . '•••@' . $domain;
    }
}
