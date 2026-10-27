<?php
/**
 * Mailer — Envoi d'emails en PHP natif, sans dépendance (hébergement mutualisé OVHcloud).
 *
 * Deux modes, selon `api/.env` :
 * - SMTP (`SMTP_HOST` renseigné) : socket, EHLO, STARTTLS ou TLS implicite, AUTH LOGIN.
 *   C'est le mode local (Mailpit, fourni par Docker Compose) ou d'un compte dédié.
 * - `mail()` de l'hébergement (`SMTP_HOST` vide) : aucun identifiant ; OVHcloud exige que le
 *   domaine de `MAIL_FROM` soit attaché à l'hébergement.
 * Dans les deux cas, le même message MIME multipart (pièce jointe, images intégrées).
 *
 * Les paramètres proviennent exclusivement de `api/.env`
 * (cf. `api/config/config.php`) : rien n'est stocké en base.
 *
 * Toute erreur lève une `RuntimeException` ; c'est l'appelant
 * (`Notifier`) qui décide de journaliser sans interrompre le parcours.
 */

require_once __DIR__ . '/../models/Config.php';

class Mailer
{
    /** Délai maximal d'ouverture de socket et de lecture, en secondes. */
    private const TIMEOUT = 15;

    /** @var resource|null */
    private $socket = null;

    /**
     * Mode d'envoi : `smtp`, `mail` (fonction de l'hébergement) ou `none`.
     * Sans `MAIL_FROM`, les notifications sont journalisées en échec explicite
     * plutôt que tentées dans le vide.
     */
    public static function transport(): string
    {
        if (MAIL_FROM === '') {
            return 'none';
        }
        if (SMTP_HOST !== '') {
            return 'smtp';
        }
        return function_exists('mail') ? 'mail' : 'none';
    }

    /** Nom affiché de l'expéditeur : `MAIL_FROM_NAME`, sinon le nom de l'entreprise (Configuration). */
    public static function senderName(): string
    {
        if (MAIL_FROM_NAME !== '') {
            return MAIL_FROM_NAME;
        }
        try {
            return Config::get('company_name') ?: 'Crénelio';
        } catch (Throwable) {
            return 'Crénelio';
        }
    }

    public static function isConfigured(): bool
    {
        return self::transport() !== 'none';
    }

    /**
     * Envoie un message. Lève une RuntimeException en cas d'échec.
     *
     * @param array{filename: string, mime: string, content: string}|null $attachment
     * @param list<array{cid: string, mime: string, content: string}>     $inline Images référencées par `cid:` dans le HTML
     */
    public static function send(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        string $textBody,
        ?array $attachment = null,
        ?string $replyTo = null,
        array $inline = []
    ): void {
        if (!self::isConfigured()) {
            throw new RuntimeException("Envoi d'emails non configuré (MAIL_FROM manquant dans api/.env)");
        }

        if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException("Adresse destinataire invalide : $toEmail");
        }

        $message = self::buildMimeMessage($toEmail, $toName, $subject, $htmlBody, $textBody, $attachment, $replyTo, $inline);

        if (self::transport() === 'mail') {
            self::sendWithMailFunction($toEmail, $message);
            return;
        }

        $mailer = new self();
        try {
            $mailer->connect();
            $mailer->authenticate();
            $mailer->transmit($toEmail, $message);
        } finally {
            $mailer->disconnect();
        }
    }

    // -----------------------------------------------------------------
    // Fonction mail() de l'hébergement
    // -----------------------------------------------------------------

    /**
     * `mail()` ajoute lui-même `To:` et `Subject:` : on les retire des en-têtes composés.
     * L'expéditeur d'enveloppe (`-f`) est aligné sur `MAIL_FROM` pour SPF et les retours.
     */
    private static function sendWithMailFunction(string $toEmail, string $message): void
    {
        [$head, $body] = explode("\r\n\r\n", $message, 2);
        // Dépliage des en-têtes (lignes de continuation) pour isoler To / Subject
        $lines = preg_split('/\r\n(?![ \t])/', $head);

        $subject = '';
        $headers = [];
        foreach ($lines as $line) {
            if (stripos($line, 'Subject:') === 0) {
                $subject = trim(preg_replace('/\r\n[ \t]+/', ' ', substr($line, 8)));
            } elseif (stripos($line, 'To:') !== 0) {
                $headers[] = $line;
            }
        }

        $params = filter_var(MAIL_FROM, FILTER_VALIDATE_EMAIL) ? '-f' . MAIL_FROM : '';
        if (!mail($toEmail, $subject, $body, implode("\r\n", $headers), $params)) {
            throw new RuntimeException(
                "Envoi refusé par la fonction mail() de l'hébergement : vérifiez que le domaine de MAIL_FROM est attaché "
                . "à l'hébergement (Multisite) et l'onglet « Scripts e-mail » de l'espace client OVHcloud"
            );
        }
    }

    // -----------------------------------------------------------------
    // Dialogue SMTP
    // -----------------------------------------------------------------

    private function connect(): void
    {
        // TLS implicite (port 465) : la socket est chiffrée dès l'ouverture.
        $scheme = SMTP_SECURE === 'tls' ? 'ssl://' : '';
        $errno  = 0;
        $errstr = '';

        $socket = @stream_socket_client(
            $scheme . SMTP_HOST . ':' . SMTP_PORT,
            $errno,
            $errstr,
            self::TIMEOUT,
            STREAM_CLIENT_CONNECT
        );

        if ($socket === false) {
            throw new RuntimeException(sprintf('Connexion SMTP impossible à %s:%s (%s)', SMTP_HOST, SMTP_PORT, $errstr ?: "erreur $errno"));
        }

        $this->socket = $socket;
        stream_set_timeout($this->socket, self::TIMEOUT);

        $this->expect([220]);
        $this->ehlo();

        // STARTTLS : la connexion démarre en clair puis bascule en chiffré.
        if (SMTP_SECURE === 'starttls') {
            $this->command('STARTTLS', [220]);

            if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Négociation STARTTLS échouée');
            }

            // Un second EHLO est obligatoire après la bascule TLS.
            $this->ehlo();
        }
    }

    private function ehlo(): void
    {
        $hostname = gethostname() ?: 'localhost';
        $this->command("EHLO $hostname", [250]);
    }

    private function authenticate(): void
    {
        if (SMTP_USER === '') {
            return;
        }

        $this->command('AUTH LOGIN', [334]);
        $this->command(base64_encode(SMTP_USER), [334]);
        $this->command(base64_encode(SMTP_PASS), [235]);
    }

    private function transmit(string $toEmail, string $message): void
    {
        $this->command('MAIL FROM:<' . MAIL_FROM . '>', [250]);
        $this->command('RCPT TO:<' . $toEmail . '>', [250, 251]);
        $this->command('DATA', [354]);

        // Dot-stuffing : une ligne réduite à un point terminerait le message.
        $body = preg_replace('/^\./m', '..', $message);
        $this->write($body . "\r\n.\r\n");
        $this->expect([250]);

        $this->command('QUIT', [221]);
    }

    private function disconnect(): void
    {
        if (is_resource($this->socket)) {
            @fclose($this->socket);
        }
        $this->socket = null;
    }

    /**
     * Envoie une commande et vérifie le code de réponse attendu.
     *
     * @param int[] $expectedCodes
     */
    private function command(string $command, array $expectedCodes): string
    {
        $this->write($command . "\r\n");
        return $this->expect($expectedCodes);
    }

    private function write(string $data): void
    {
        if (!is_resource($this->socket) || fwrite($this->socket, $data) === false) {
            throw new RuntimeException('Écriture sur la socket SMTP impossible');
        }
    }

    /**
     * Lit une réponse SMTP (éventuellement multiligne) et valide son code.
     *
     * @param int[] $expectedCodes
     */
    private function expect(array $expectedCodes): string
    {
        $response = '';

        while (is_resource($this->socket)) {
            $line = fgets($this->socket, 1024);

            if ($line === false) {
                $meta = stream_get_meta_data($this->socket);
                throw new RuntimeException($meta['timed_out'] ? 'Délai dépassé en lecture SMTP' : 'Réponse SMTP illisible');
            }

            $response .= $line;

            // Dernière ligne d'une réponse : « 250 texte » (et non « 250-texte »).
            if (strlen($line) >= 4 && $line[3] === ' ') {
                break;
            }
        }

        $code = (int)substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException('Réponse SMTP inattendue : ' . trim($response));
        }

        return $response;
    }

    // -----------------------------------------------------------------
    // Composition MIME
    // -----------------------------------------------------------------

    /**
     * Structure : mixed → [related → [alternative → [texte, HTML], images intégrées], pièce jointe].
     * La couche `related` n'est ajoutée que s'il y a des images intégrées.
     *
     * @param array{filename: string, mime: string, content: string}|null $attachment
     * @param list<array{cid: string, mime: string, content: string}>     $inline
     */
    private static function buildMimeMessage(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        string $textBody,
        ?array $attachment,
        ?string $replyTo = null,
        array $inline = []
    ): string {
        $mixedBoundary   = 'mixed_' . bin2hex(random_bytes(12));
        $relatedBoundary = 'related_' . bin2hex(random_bytes(12));
        $altBoundary     = 'alt_' . bin2hex(random_bytes(12));
        $domain        = substr(strrchr(MAIL_FROM, '@') ?: '@localhost', 1);

        $headers = [
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domain . '>',
            'From: ' . self::formatAddress(self::senderName(), MAIL_FROM),
            'To: ' . self::formatAddress($toName, $toEmail),
            'Subject: ' . self::encodeHeader($subject),
            'MIME-Version: 1.0',
            'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"',
        ];
        // Réponse directe au client (demande exceptionnelle) ; adresse déjà validée par l'appelant
        if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
            $headers[] = 'Reply-To: ' . $replyTo;
        }

        $alternative = [
            'Content-Type: multipart/alternative; boundary="' . $altBoundary . '"',
            '',
            '--' . $altBoundary,
            'Content-Type: text/plain; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            chunk_split(base64_encode($textBody), 76, "\r\n"),
            '--' . $altBoundary,
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            chunk_split(base64_encode($htmlBody), 76, "\r\n"),
            '--' . $altBoundary . '--',
            '',
        ];

        if ($inline) {
            $related = [
                'Content-Type: multipart/related; type="multipart/alternative"; boundary="' . $relatedBoundary . '"',
                '',
                '--' . $relatedBoundary,
                ...$alternative,
            ];
            foreach ($inline as $image) {
                $related = array_merge($related, [
                    '--' . $relatedBoundary,
                    'Content-Type: ' . $image['mime'],
                    'Content-Transfer-Encoding: base64',
                    'Content-ID: <' . $image['cid'] . '>',
                    'Content-Disposition: inline',
                    '',
                    chunk_split(base64_encode($image['content']), 76, "\r\n"),
                ]);
            }
            $related[] = '--' . $relatedBoundary . '--';
            $related[] = '';
            $alternative = $related;
        }

        $parts = ['--' . $mixedBoundary, ...$alternative];

        if ($attachment !== null) {
            $parts = array_merge($parts, [
                '--' . $mixedBoundary,
                'Content-Type: ' . $attachment['mime'] . '; name="' . $attachment['filename'] . '"',
                'Content-Transfer-Encoding: base64',
                'Content-Disposition: attachment; filename="' . $attachment['filename'] . '"',
                '',
                chunk_split(base64_encode($attachment['content']), 76, "\r\n"),
            ]);
        }

        $parts[] = '--' . $mixedBoundary . '--';

        return implode("\r\n", $headers) . "\r\n\r\n" . implode("\r\n", $parts);
    }

    /** Formate « Nom <adresse> » en neutralisant toute injection d'en-tête. */
    private static function formatAddress(string $name, string $email): string
    {
        $email = str_replace(["\r", "\n"], '', $email);
        $name  = trim(str_replace(["\r", "\n"], '', $name));

        return $name === '' ? $email : self::encodeHeader($name) . ' <' . $email . '>';
    }

    /**
     * Encode un en-tête en Base64 RFC 2047 s'il contient des caractères non ASCII.
     *
     * Un mot encodé ne peut dépasser 75 caractères : les sujets longs sont donc
     * découpés en plusieurs mots repliés, sans jamais couper un caractère
     * multi-octets (ce qui produirait des accents cassés chez le destinataire).
     */
    private static function encodeHeader(string $value): string
    {
        $value = str_replace(["\r", "\n"], '', $value);

        if (preg_match('/^[\x20-\x7E]*$/', $value)) {
            return $value;
        }

        // 42 octets bruts → 56 caractères de Base64, soit 68 avec le balisage
        // « =?UTF-8?B?…?= » : on reste sous la limite même préfixé de « Subject: ».
        $maxBytesPerWord = 42;

        $words = [];
        $chunk = '';

        foreach (mb_str_split($value) as $char) {
            if (strlen($chunk) + strlen($char) > $maxBytesPerWord) {
                $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
                $chunk = '';
            }
            $chunk .= $char;
        }

        if ($chunk !== '') {
            $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
        }

        return implode("\r\n ", $words);
    }
}
