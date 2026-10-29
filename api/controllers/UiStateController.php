<?php
/**
 * UiStateController — Préférences d'affichage de l'espace Pro (disposition des grilles…).
 *
 * Une clé `config` par élément : `ui_state_<id>`, contenant un objet JSON. Routes protégées
 * (session Pro) ; ces clés sont exclues de la configuration publique (Config::getPublic) et
 * refusées par PUT /admin/config.
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/Response.php';

class UiStateController
{
    /** Taille maximale d'un état enregistré (octets). */
    private const MAX_BYTES = 20000;

    /** GET /admin/ui-state/:id — État enregistré, `null` si aucun (réglages par défaut). */
    public function show(array $params): void
    {
        $value = Config::get($this->key($params));
        Response::json(['state' => $value !== null ? json_decode($value, true) : null]);
    }

    /** PUT /admin/ui-state/:id — Enregistre l'état (objet JSON). */
    public function update(array $params): void
    {
        $state = Response::body()['state'] ?? null;
        if (!is_array($state)) {
            Response::json(['error' => 'État attendu : objet JSON'], 400);
        }
        $json = json_encode($state, JSON_UNESCAPED_UNICODE);
        if ($json === false || strlen($json) > self::MAX_BYTES) {
            Response::json(['error' => 'État trop volumineux'], 400);
        }
        Config::set($this->key($params), $json);
        Response::json(['state' => $state]);
    }

    /** DELETE /admin/ui-state/:id — Retour aux réglages par défaut. */
    public function destroy(array $params): void
    {
        Config::delete($this->key($params));
        Response::json(['state' => null]);
    }

    private function key(array $params): string
    {
        $id = (string)($params['id'] ?? '');
        if (!preg_match('/^[a-z0-9_]{1,40}$/', $id)) {
            Response::json(['error' => 'Identifiant invalide'], 400);
        }
        return Config::UI_STATE_PREFIX . $id;
    }
}
