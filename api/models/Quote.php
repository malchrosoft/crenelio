<?php
/**
 * Quote model — Devis (Item 22) et leurs lignes.
 *
 * Références (fiches et extraits : docs/legal/ ; à revérifier à chaque évolution, cf. Item 39) :
 * - Arrêté du 24 janvier 2017 (dépannage, réparation, entretien), art. 4 et annexe 2 :
 *   https://www.legifrance.gouv.fr/jorf/id/JORFSCTA000033935539
 * - Débours (CGI art. 267 II 2°) : pièce achetée au nom et pour le compte du client, sur mandat
 *   écrit (nature et budget maximum), facture du fournisseur au nom du client, refacturée au montant
 *   exact, hors chiffre d'affaires et hors base de TVA :
 *   https://www.portail-autoentrepreneur.fr/academie/gestion-auto-entreprise/facturation/frais-de-debours
 * - Contrat à distance ou hors établissement (C. consom. L221-18, L221-25, L221-28 8°) : rétractation de
 *   14 jours sauf travaux urgents expressément demandés, dans la limite du strictement nécessaire ;
 *   fiche DGCCRF « Dépannage à domicile » (2018).
 */

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/Config.php';

class Quote
{
    /** Types de ligne ; `supply` (achat-revente) n'est accepté que si `quote_allow_supply` vaut 1. */
    public const KINDS = ['labour', 'service', 'travel', 'debours', 'supply'];

    /** Statuts dans lesquels le devis n'est plus modifiable (envoyé au client ou décidé). */
    private const LOCKED = ['sent', 'accepted', 'refused', 'expired'];

    /** Liste, avec passage en « expiré » des devis envoyés dont la validité est dépassée. */
    public static function all(): array
    {
        self::expireOutdated();
        return Database::fetchAll(
            'SELECT q.*, a.start_datetime AS appointment_start
             FROM `quotes` q LEFT JOIN `appointments` a ON a.id = q.appointment_id
             ORDER BY q.created_at DESC'
        );
    }

    public static function find(int $id): ?array
    {
        self::expireOutdated();
        return self::withLines(Database::fetchOne('SELECT * FROM `quotes` WHERE id = ?', [$id]));
    }

    public static function findByToken(string $token): ?array
    {
        if ($token === '') {
            return null;
        }
        self::expireOutdated();
        return self::withLines(Database::fetchOne('SELECT * FROM `quotes` WHERE token = ?', [$token]));
    }

    /** Brouillon prérempli depuis un rendez-vous : client, prestation et frais de déplacement. */
    public static function draftFromAppointment(array $appointment): array
    {
        // Taux normal (premier des taux réglés) ; ramené à 0 en franchise par validate()
        $rate = (float)explode(',', (string)Config::get('quote_vat_rates', '20,10,5.5'))[0];
        $lines = [[
            'kind' => 'service', 'label' => $appointment['service_name'], 'quantity' => 1,
            'unit' => 'forfait', 'unit_price' => (float)$appointment['service_price'], 'vat_rate' => $rate,
        ]];
        if ((float)$appointment['travel_fee'] > 0) {
            $lines[] = [
                'kind' => 'travel', 'label' => 'Frais de déplacement', 'quantity' => 1,
                'unit' => 'forfait', 'unit_price' => (float)$appointment['travel_fee'], 'vat_rate' => $rate,
            ];
        }
        return [
            'appointment_id' => (int)$appointment['id'],
            'client_name'    => $appointment['client_name'],
            'client_email'   => $appointment['client_email'],
            'client_phone'   => $appointment['client_phone'],
            'address'        => $appointment['address'],
            'postal_code'    => $appointment['postal_code'],
            'city'           => $appointment['city'],
            'title'          => $appointment['service_name'],
            'lines'          => $lines,
        ];
    }

    /**
     * Contrôle et normalise les champs d'un devis ; renvoie un message d'erreur ou null.
     * Taux de TVA : 0 en franchise et pour un débours, sinon l'un des taux réglés (`quote_vat_rates`).
     */
    public static function validate(array &$data, string $vatMode): ?string
    {
        if (trim((string)($data['client_name'] ?? '')) === '') {
            return 'Le nom du client est obligatoire.';
        }
        if (trim((string)($data['address'] ?? '')) === '') {
            return "Le lieu d'intervention est obligatoire.";
        }
        $email = trim((string)($data['client_email'] ?? ''));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "L'adresse email du client est invalide.";
        }
        $validity = (int)($data['validity_days'] ?? Config::get('quote_validity_days', '30'));
        if ($validity < 1 || $validity > 365) {
            return 'La durée de validité doit être comprise entre 1 et 365 jours.';
        }
        $data['validity_days'] = $validity;
        $price = $data['quote_price'] ?? null;
        if ($price !== null && $price !== '' && (!is_numeric($price) || (float)$price < 0)) {
            return 'Le prix du devis est invalide.';
        }
        $data['quote_price'] = ($price === null || $price === '' || (float)$price == 0) ? null : round((float)$price, 2);

        $lines = $data['lines'] ?? [];
        if (!is_array($lines) || !$lines) {
            return 'Le devis doit contenir au moins une ligne.';
        }
        $rates = array_map('floatval', explode(',', (string)Config::get('quote_vat_rates', '20,10,5.5')));
        $allowSupply = Config::get('quote_allow_supply', '0') === '1';
        foreach ($lines as $i => &$line) {
            $n = $i + 1;
            $kind = $line['kind'] ?? '';
            if (!in_array($kind, self::KINDS, true)) {
                return "Ligne $n : type invalide.";
            }
            if ($kind === 'supply' && !$allowSupply) {
                return "Ligne $n : la revente de fournitures est désactivée (achat-revente). Utilisez une pièce achetée au nom du client.";
            }
            $line['label'] = trim((string)($line['label'] ?? ''));
            if ($line['label'] === '') {
                return "Ligne $n : la désignation est obligatoire.";
            }
            if (!is_numeric($line['quantity'] ?? null) || (float)$line['quantity'] <= 0) {
                return "Ligne $n : quantité invalide.";
            }
            if (!is_numeric($line['unit_price'] ?? null) || (float)$line['unit_price'] < 0) {
                return "Ligne $n : prix invalide.";
            }
            $rate = (float)($line['vat_rate'] ?? 0);
            if ($vatMode === 'franchise' || $kind === 'debours') {
                $rate = 0.0;
            } elseif (!in_array($rate, $rates, true)) {
                return "Ligne $n : taux de TVA non proposé (" . implode(' %, ', $rates) . ' %).';
            }
            $line['vat_rate'] = $rate;
            $line['unit'] = mb_substr(trim((string)($line['unit'] ?? 'u')) ?: 'u', 0, 20);
        }
        unset($line);
        $data['lines'] = array_values($lines);
        $data['urgent'] = !empty($data['urgent']);
        return null;
    }

    /** Totaux : HT et TVA arrondis par ligne ; débours à part (hors chiffre d'affaires, sans TVA). */
    public static function totals(array $lines): array
    {
        $ht = $vat = $debours = 0.0;
        foreach ($lines as $line) {
            $amount = round((float)$line['quantity'] * (float)$line['unit_price'], 2);
            if ($line['kind'] === 'debours') {
                $debours += $amount;
                continue;
            }
            $ht += $amount;
            $vat += round($amount * (float)$line['vat_rate'] / 100, 2);
        }
        return [
            'total_ht'      => round($ht, 2),
            'total_vat'     => round($vat, 2),
            'total_debours' => round($debours, 2),
            'total_ttc'     => round($ht + $vat + $debours, 2),
        ];
    }

    /** Crée un brouillon (données déjà validées) ; renvoie son identifiant. */
    public static function create(array $data, string $vatMode): int
    {
        $totals = self::totals($data['lines']);
        Database::execute(
            'INSERT INTO `quotes` (appointment_id, client_name, client_email, client_phone, address, postal_code, city,
                title, notes, vat_mode, validity_days, quote_price, urgent, total_ht, total_vat, total_debours, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $data['appointment_id'] ?? null, ...self::clientFields($data), $vatMode, $data['validity_days'],
                $data['quote_price'], (int)$data['urgent'], ...array_values($totals),
            ]
        );
        $id = (int)Database::lastInsertId();
        self::saveLines($id, $data['lines']);
        return $id;
    }

    /** Met à jour un brouillon ; false s'il n'est plus modifiable. */
    public static function update(int $id, array $data): bool
    {
        $totals = self::totals($data['lines']);
        $changed = Database::execute(
            "UPDATE `quotes` SET client_name = ?, client_email = ?, client_phone = ?, address = ?, postal_code = ?,
                city = ?, title = ?, notes = ?, validity_days = ?, quote_price = ?, urgent = ?,
                total_ht = ?, total_vat = ?, total_debours = ?, total_ttc = ?
             WHERE id = ? AND status = 'draft'",
            [...self::clientFields($data), $data['validity_days'], $data['quote_price'], (int)$data['urgent'], ...array_values($totals), $id]
        );
        if ($changed === 0 && !self::isDraft($id)) {
            return false;
        }
        self::saveLines($id, $data['lines']);
        return true;
    }

    public static function isDraft(int $id): bool
    {
        return (bool)Database::fetchOne("SELECT 1 FROM `quotes` WHERE id = ? AND status = 'draft'", [$id]);
    }

    public static function deleteDraft(int $id): bool
    {
        return Database::execute("DELETE FROM `quotes` WHERE id = ? AND status = 'draft'", [$id]) > 0;
    }

    /**
     * Envoi : numéro chronologique propre aux devis (préfixe-année-rang), lien client, échéance.
     * Le numéro n'est attribué qu'ici : un brouillon supprimé ne laisse pas de trou.
     */
    public static function markSent(int $id): bool
    {
        $pdo = Database::getConnection();
        $pdo->beginTransaction();
        try {
            $quote = Database::fetchOne("SELECT * FROM `quotes` WHERE id = ? AND status = 'draft' FOR UPDATE", [$id]);
            if (!$quote) {
                $pdo->rollBack();
                return false;
            }
            $prefix = trim((string)Config::get('quote_number_prefix', 'D')) ?: 'D';
            $year = date('Y');
            $last = Database::fetchOne(
                'SELECT number FROM `quotes` WHERE number LIKE ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
                ["$prefix-$year-%"]
            );
            $rank = $last ? (int)substr($last['number'], strrpos($last['number'], '-') + 1) + 1 : 1;
            Database::execute(
                "UPDATE `quotes` SET status = 'sent', number = ?, token = ?, sent_at = NOW(),
                    valid_until = DATE_ADD(CURDATE(), INTERVAL validity_days DAY)
                 WHERE id = ?",
                [sprintf('%s-%s-%04d', $prefix, $year, $rank), bin2hex(random_bytes(32)), $id]
            );
            $pdo->commit();
            return true;
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Réponse du client (preuve : date et IP). Accepté hors urgence : fin du délai de rétractation
     * (14 jours, L221-18) ; exécution anticipée seulement sur sa demande expresse (L221-25).
     * false si le devis n'attend plus de réponse.
     */
    public static function decide(int $id, bool $accepted, ?bool $keepParts, bool $mandate, bool $earlyExecution, ?string $reason): bool
    {
        return Database::execute(
            "UPDATE `quotes` SET status = ?, decided_at = NOW(), decision_ip = ?, keep_parts = ?,
                debours_mandate = ?, early_execution = ?, refusal_reason = ?,
                withdrawal_until = IF(? AND NOT urgent, DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL)
             WHERE id = ? AND status = 'sent' AND valid_until >= CURDATE()",
            [
                $accepted ? 'accepted' : 'refused', $_SERVER['REMOTE_ADDR'] ?? null,
                $keepParts === null ? null : (int)$keepParts, (int)$mandate, (int)$earlyExecution, $reason,
                (int)$accepted, $id,
            ]
        ) > 0;
    }

    public static function isLocked(array $quote): bool
    {
        return in_array($quote['status'], self::LOCKED, true);
    }

    private static function expireOutdated(): void
    {
        Database::execute("UPDATE `quotes` SET status = 'expired' WHERE status = 'sent' AND valid_until < CURDATE()");
    }

    private static function clientFields(array $data): array
    {
        return [
            trim((string)$data['client_name']), trim((string)($data['client_email'] ?? '')),
            trim((string)($data['client_phone'] ?? '')), trim((string)$data['address']),
            trim((string)($data['postal_code'] ?? '')), trim((string)($data['city'] ?? '')),
            trim((string)($data['title'] ?? '')), ($data['notes'] ?? '') !== '' ? (string)$data['notes'] : null,
        ];
    }

    private static function saveLines(int $quoteId, array $lines): void
    {
        Database::execute('DELETE FROM `quote_lines` WHERE quote_id = ?', [$quoteId]);
        foreach ($lines as $position => $line) {
            Database::execute(
                'INSERT INTO `quote_lines` (quote_id, position, kind, label, quantity, unit, unit_price, vat_rate)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $quoteId, $position, $line['kind'], $line['label'], round((float)$line['quantity'], 2),
                    $line['unit'] ?? 'u', round((float)$line['unit_price'], 2), (float)($line['vat_rate'] ?? 0),
                ]
            );
        }
    }

    private static function withLines(?array $quote): ?array
    {
        if ($quote) {
            $quote['lines'] = Database::fetchAll(
                'SELECT kind, label, quantity, unit, unit_price, vat_rate FROM `quote_lines` WHERE quote_id = ? ORDER BY position',
                [(int)$quote['id']]
            );
        }
        return $quote;
    }
}
