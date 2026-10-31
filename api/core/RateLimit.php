<?php
/**
 * RateLimit — Plafond de requêtes par fenêtre glissante, stocké dans un fichier (Item 32).
 *
 * Protège les formulaires publics qui envoient des emails (réservation, demande hors zone) : sans
 * plafond, un robot inonderait la boîte de l'artisan et épuiserait le quota horaire d'envoi de
 * l'hébergement (codes de connexion compris). Aucune table : `api/storage/auth/ratelimit.json`,
 * clés hachées (pas d'adresse IP en clair).
 */

class RateLimit
{
    /**
     * Enregistre une tentative pour `$bucket` et dit si elle reste sous le plafond.
     * Une tentative refusée n'est pas comptée.
     */
    public static function hit(string $bucket, int $max, int $windowSeconds): bool
    {
        $dir = __DIR__ . '/../storage/auth';
        if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
            return true; // stockage indisponible : on ne bloque pas les clients
        }
        $handle = @fopen($dir . '/ratelimit.json', 'c+');
        if (!$handle) {
            return true;
        }

        flock($handle, LOCK_EX);
        $all = json_decode((string)stream_get_contents($handle), true);
        $all = is_array($all) ? $all : [];
        $now = time();

        // Purge des tentatives sorties de leur fenêtre (toutes clés confondues, fenêtre max 1 jour)
        foreach ($all as $key => $times) {
            $all[$key] = array_values(array_filter((array)$times, fn($t) => $t > $now - 86400));
            if (!$all[$key]) {
                unset($all[$key]);
            }
        }

        $key = hash('sha256', $bucket);
        $recent = array_values(array_filter($all[$key] ?? [], fn($t) => $t > $now - $windowSeconds));
        $allowed = count($recent) < $max;
        if ($allowed) {
            $recent[] = $now;
        }
        $all[$key] = $recent;

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($all));
        flock($handle, LOCK_UN);
        fclose($handle);

        return $allowed;
    }

    /** Clé « par adresse IP » d'un formulaire. */
    public static function ipBucket(string $form): string
    {
        return $form . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    }
}
