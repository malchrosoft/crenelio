<?php
/**
 * MailController — État de l'envoi d'emails et email de test (espace Pro).
 *
 * Lecture seule : le mode d'envoi et l'expéditeur viennent de `api/.env`, jamais modifiables
 * depuis l'espace Pro (un réglage erroné couperait l'envoi des codes de connexion).
 * Aucun mot de passe n'est renvoyé.
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/Mailer.php';
require_once __DIR__ . '/../core/EmailTemplates.php';
require_once __DIR__ . '/../core/Response.php';

class MailController
{
    /** GET /admin/mail — Mode d'envoi, serveur, expéditeur et destinataire du test. */
    public function status(): void
    {
        $transport = Mailer::transport();
        Response::json([
            'transport'      => $transport,
            'smtp_host'      => $transport === 'smtp' ? SMTP_HOST . ':' . SMTP_PORT : null,
            'mail_from'      => MAIL_FROM !== '' ? MAIL_FROM : null,
            // Déduit d'APP_URL (MAIL_FROM vide dans api/.env)
            'mail_from_auto' => MAIL_FROM_AUTO,
            'site_domain'    => SITE_DOMAIN !== '' ? SITE_DOMAIN : null,
            'mail_from_name' => MAIL_FROM_NAME,
            'recipient'      => Config::get('pro_email') ?: null,
        ]);
    }

    /** POST /admin/mail/test — Envoie un email de test à l'email professionnel. */
    public function test(): void
    {
        $config = Config::getAll();
        $recipient = $config['pro_email'] ?? '';
        if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => "Renseignez d'abord l'email professionnel (groupe Coordonnées)"], 400);
        }

        $message = EmailTemplates::mailTest(Mailer::transport(), $config);
        try {
            Mailer::send(
                $recipient,
                $config['company_name'] ?? '',
                $message['subject'],
                $message['html'],
                $message['text'],
                null,
                null,
                EmailTemplates::inlineImages($message['html'])
            );
        } catch (Throwable $e) {
            Response::json(['error' => $e->getMessage()], 502);
        }

        Response::json(['message' => "Email de test envoyé à $recipient"]);
    }
}
