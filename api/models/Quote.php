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

    /** Devis avec le statut de son rendez-vous (prestation exécutée : L221-28 1°). */
    private const SELECT = 'SELECT q.*, a.status AS appointment_status
        FROM `quotes` q LEFT JOIN `appointments` a ON a.id = q.appointment_id';

    /** Statuts dans lesquels le devis n'est plus modifiable (envoyé au client ou décidé). */
    private const LOCKED = ['sent', 'accepted', 'refused', 'expired', 'withdrawn'];

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
        return self::withLines(Database::fetchOne(self::SELECT . ' WHERE q.id = ?', [$id]));
    }

    public static function findByToken(string $token): ?array
    {
        if ($token === '') {
            return null;
        }
        self::expireOutdated();
        return self::withLines(Database::fetchOne(self::SELECT . ' WHERE q.token = ?', [$token]));
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

        // Budget maximum du mandat de débours : au moins le montant estimé des pièces
        $debours = self::totals($data['lines'])['total_debours'];
        $budget = $data['debours_budget'] ?? null;
        if ($debours <= 0) {
            $data['debours_budget'] = null;
        } elseif ($budget === null || $budget === '') {
            $data['debours_budget'] = $debours;
        } elseif (!is_numeric($budget) || round((float)$budget, 2) < $debours) {
            return 'Le budget du mandat de débours doit couvrir au moins le montant estimé des pièces (' . number_format($debours, 2, ',', ' ') . ' €).';
        } else {
            $data['debours_budget'] = round((float)$budget, 2);
        }
        return null;
    }

    /**
     * Totaux : HT et TVA arrondis par ligne. `total_ttc` ne couvre que les prestations : les débours
     * relèvent du mandat séparé (hors chiffre d'affaires, sans TVA de l'artisan), totalisés à part.
     */
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
            'total_ttc'     => round($ht + $vat, 2),
        ];
    }

    /** Crée un brouillon (données déjà validées) ; renvoie son identifiant. */
    public static function create(array $data, string $vatMode): int
    {
        $totals = self::totals($data['lines']);
        Database::execute(
            'INSERT INTO `quotes` (appointment_id, client_name, client_email, client_phone, address, postal_code, city,
                title, notes, vat_mode, validity_days, quote_price, urgent, debours_budget,
                total_ht, total_vat, total_debours, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $data['appointment_id'] ?? null, ...self::clientFields($data), $vatMode, $data['validity_days'],
                $data['quote_price'], (int)$data['urgent'], $data['debours_budget'], ...array_values($totals),
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
                city = ?, title = ?, notes = ?, validity_days = ?, quote_price = ?, urgent = ?, debours_budget = ?,
                total_ht = ?, total_vat = ?, total_debours = ?, total_ttc = ?
             WHERE id = ? AND status = 'draft'",
            [...self::clientFields($data), $data['validity_days'], $data['quote_price'], (int)$data['urgent'], $data['debours_budget'], ...array_values($totals), $id]
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
     * Réponses du client (preuve : date et IP de chacune).
     * - Devis : accepté hors urgence ⇒ fin du délai de rétractation (`withdrawalDeadline`, L221-18 et
     *   L221-19) ; exécution anticipée seulement sur sa demande expresse (L221-25).
     * - Mandat de débours, accord distinct : `$mandate` null s'il n'y a pas de débours ; false si le client
     *   fournit lui-même les pièces.
     * false si le devis n'attend plus de réponse.
     */
    public static function decide(int $id, bool $accepted, ?bool $keepParts, ?bool $mandate, bool $earlyExecution, ?string $reason): bool
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $deadline = $accepted ? self::withdrawalDeadline(new DateTimeImmutable('today')) : null;
        return Database::execute(
            "UPDATE `quotes` SET status = ?, decided_at = NOW(), decision_ip = ?, keep_parts = ?,
                debours_mandate = ?, mandate_decided_at = IF(? IS NULL, NULL, NOW()), mandate_ip = IF(? IS NULL, NULL, ?),
                early_execution = ?, refusal_reason = ?,
                withdrawal_until = IF(urgent, NULL, ?)
             WHERE id = ? AND status = 'sent' AND valid_until >= CURDATE()",
            [
                $accepted ? 'accepted' : 'refused', $ip, $keepParts === null ? null : (int)$keepParts,
                $mandate === null ? null : (int)$mandate, $mandate, $mandate, $ip,
                (int)$earlyExecution, $reason, $deadline, $id,
            ]
        ) > 0;
    }

    /**
     * Rétractation en ligne (« Renoncer au contrat ici », C. consom. L221-18 ; fonction de rétractation
     * obligatoire depuis le 19 juin 2026) : devis accepté, hors intervention urgente, jusqu'à la fin du
     * délai inclus. Conserve la déclaration (nom, email de l'accusé de réception, date, IP).
     */
    public static function withdraw(int $id, string $name, string $email): bool
    {
        return Database::execute(
            "UPDATE `quotes` SET status = 'withdrawn', withdrawn_at = NOW(), withdrawal_name = ?,
                withdrawal_email = ?, withdrawal_ip = ?
             WHERE id = ? AND status = 'accepted' AND NOT urgent AND withdrawal_until >= CURDATE()
               AND NOT (early_execution AND EXISTS (SELECT 1 FROM `appointments` a
                   WHERE a.id = `quotes`.appointment_id AND a.status = 'completed'))",
            [$name, $email, $_SERVER['REMOTE_ADDR'] ?? null, $id]
        ) > 0;
    }

    /**
     * Rétractation encore possible (même règle que `withdraw`) : pas après une prestation entièrement
     * exécutée à la demande expresse du client (L221-28 1°, rendez-vous « terminé »).
     */
    public static function canWithdraw(array $quote): bool
    {
        $executed = (int)$quote['early_execution'] && ($quote['appointment_status'] ?? null) === 'completed';
        return $quote['status'] === 'accepted' && !(int)$quote['urgent'] && !$executed
            && $quote['withdrawal_until'] !== null && $quote['withdrawal_until'] >= date('Y-m-d');
    }

    /**
     * Dernier jour du délai de rétractation (C. consom. L221-18 et L221-19) : le jour de la conclusion
     * n'est pas compté ; le délai expire à la fin du quatorzième jour, prorogé au premier jour ouvrable
     * suivant s'il tombe un samedi, un dimanche ou un jour férié.
     */
    public static function withdrawalDeadline(DateTimeImmutable $conclusion): string
    {
        $day = $conclusion->modify('+14 days');
        while ((int)$day->format('N') >= 6 || in_array($day->format('m-d'), self::holidays((int)$day->format('Y')), true)) {
            $day = $day->modify('+1 day');
        }
        return $day->format('Y-m-d');
    }

    /** Jours fériés légaux (C. trav. L3133-1), dont ceux qui dépendent de Pâques (sans extension PHP). */
    private static function holidays(int $year): array
    {
        // Pâques (algorithme de Meeus, calendrier grégorien)
        $a = $year % 19; $b = intdiv($year, 100); $c = $year % 100;
        $d = intdiv($b, 4); $e = $b % 4; $f = intdiv($b + 8, 25); $g = intdiv($b - $f + 1, 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30; $i = intdiv($c, 4); $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7; $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $month = intdiv($h + $l - 7 * $m + 114, 31); $dayOfMonth = (($h + $l - 7 * $m + 114) % 31) + 1;
        $easter = new DateTimeImmutable(sprintf('%d-%02d-%02d', $year, $month, $dayOfMonth));
        return [
            '01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25',
            $easter->modify('+1 day')->format('m-d'),  // lundi de Pâques
            $easter->modify('+39 days')->format('m-d'), // Ascension
            $easter->modify('+50 days')->format('m-d'), // lundi de Pentecôte
        ];
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
