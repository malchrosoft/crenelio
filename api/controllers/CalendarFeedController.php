<?php
/**
 * CalendarFeedController — Abonnement d'agenda de l'artisan, optionnel (Item 33).
 *
 * Routes de gestion (session Pro) : état, activation / régénération, réglage, désactivation.
 * Route publique : le flux iCal, accessible seulement avec le jeton secret.
 */

require_once __DIR__ . '/../core/CalendarFeed.php';
require_once __DIR__ . '/../core/Response.php';

class CalendarFeedController
{
    /** GET /admin/calendar-feed — État (le chemin du flux n'est renvoyé qu'à l'artisan connecté). */
    public function status(): void
    {
        Response::json(self::describe(CalendarFeed::settings()));
    }

    /** POST /admin/calendar-feed — Active l'abonnement ou régénère son adresse. */
    public function enable(): void
    {
        $include = (bool)(Response::body()['include_unavailabilities'] ?? false);
        Response::json(self::describe(CalendarFeed::enable($include)));
    }

    /** PUT /admin/calendar-feed — Réglage (indisponibilités incluses ou non). */
    public function update(): void
    {
        $settings = CalendarFeed::setIncludeUnavailabilities((bool)(Response::body()['include_unavailabilities'] ?? false));
        if ($settings === null) {
            Response::json(['error' => "L'abonnement d'agenda n'est pas activé"], 400);
        }
        Response::json(self::describe($settings));
    }

    /** DELETE /admin/calendar-feed — Désactive : l'adresse cesse aussitôt de fonctionner. */
    public function disable(): void
    {
        CalendarFeed::disable();
        Response::json(self::describe(null));
    }

    /** GET /calendar/:token — Flux iCal (404 si désactivé ou jeton inconnu). */
    public function feed(array $params): void
    {
        $token = preg_replace('/\.ics$/', '', (string)($params['token'] ?? ''));
        if (!CalendarFeed::matches($token)) {
            Response::json(['error' => 'Agenda introuvable'], 404);
        }

        $ics = CalendarFeed::render();
        header('Content-Type: text/calendar; charset=utf-8');
        header('Content-Disposition: inline; filename="interventions.ics"');
        // Données clients : jamais en cache partagé, jamais indexé
        header('Cache-Control: private, no-store, max-age=0');
        header('X-Robots-Tag: noindex, nofollow');
        echo $ics;
        exit;
    }

    private static function describe(?array $settings): array
    {
        return [
            'enabled'                  => $settings !== null,
            'path'                     => $settings ? '/api/calendar/' . $settings['token'] . '.ics' : null,
            'include_unavailabilities' => (bool)($settings['include_unavailabilities'] ?? false),
            'created_at'               => $settings['created_at'] ?? null,
            'last_access'              => $settings['last_access'] ?? null,
        ];
    }
}
