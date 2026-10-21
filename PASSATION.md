# 📋 Fiche de Passation & Point d'Avancement — Crénelio

**Date :** 21 Octobre 2026
**Dépôt :** `/Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio`
**Dernier commit :** `b7bf2e4` (`main`, poussé) — *Administration de la zone et des rendez-vous*
**Statut Git :** commits directs sur `main` (projet solo), sans ligne d'attribution.
**Non commité :** documentation (`DEPLOYMENT.fr.md`, `DEPLOYMENT.md`, `README.md`, `ROADMAP.md`, cette fiche) et Mailpit dans `docker-compose.yml`.

---

## 1. Ce qui est réellement achevé

### Sessions du 20 et 21/10/2026 (`cfa99d1`, `506d59d`, `b7bf2e4`)
- **Item 14 — Configuration :** onglet piloté par `src/config/configSchema.ts` (groupes Identité,
  Coordonnées, Page vitrine, Réservation, Carte, Mentions légales) + « Autres paramètres » pour toute
  clé non décrite ; éditeur d'engagements (ordre, suppression, picto choisi ou déduit,
  `vitrine_engagement_N_icon`) ; bouton « Annuler » sur chaque formulaire. `PUT /admin/config` :
  une valeur `null` supprime la clé.
- **Item 6 — Logo & favicon :** PNG/SVG avec zoom et recadrage (`react-easy-crop`, `viewBox` pour le
  SVG), favicon PNG 512 + ICO (+ SVG), fichiers aux noms usuels dans `api/storage/branding/` avec
  repli, conseils de lisibilité selon l'image. Logo dans le hero ; titre de l'onglet = nom de l'entreprise.
- **Item 16 — Horaires :** onglet « Horaires » (plages matin / après-midi, indisponibilités).
  `api/core/SlotEngine.php` est la source unique des créneaux : `GET /slots`,
  `GET /slots/availability` (jours grisés) et validation de `POST /appointments`.
- **Item 17 — Espace Artisan pleine page :** route `/admin` (les anciens `?view=admin` redirigent),
  header fixe, menu latéral rétractable, liens du site ouverts dans un nouvel onglet,
  espace chargé à la demande (bundle client ≈ 387 ko).
- **Item 18 — Zone & déplacement :**
  - Menu « Déplacement » : mode (à domicile / dans les locaux), adresse de l'entreprise
    (`premises_*` + coordonnées), frais par paliers et origine du calcul (`travel_fee_origin`).
  - Menu « Zone d'intervention » (pleine page) : point de départ (adresse ou GPS,
    `default_latitude/longitude`), rayon, limitrophes, calcul des communes via `geo.api.gouv.fr`
    (`src/utils/serviceArea.ts`), bleu / orange selon la couverture, clic droit pour retirer,
    confirmation avant recalcul. Enregistré dans `api/storage/zone/service-area.geojson`.
  - Réservation : adresse hors des communes cochées ⇒ hors zone (`api/core/ServiceArea.php`).
    Jusqu'au rayon + 10 % : **demande exceptionnelle** (rendez-vous `pending`, accusé client,
    email artisan avec lien `/decision/:token`, acceptation ⇒ confirmations, refus ⇒ email client).
    Au-delà : « adresse non desservie ».
  - Vitrine : repère sur l'adresse de l'entreprise (ou du siège géocodé), ni centre ni cercle.
    Mode locaux : section « Nous trouver ». Le siège légal se replie sur l'adresse de l'entreprise.
- **Item 19 — Rendez-vous saisi par l'artisan :** « Nouveau rendez-vous » du planning, formulaires
  partagés en `adminMode` (heure libre, email / adresse facultatifs, hors zone forçable, envoi
  optionnel). Capsules de statut en français.
- **Corrections au passage :** liste d'adresses qui se rouvrait après sélection, champ d'adresse
  obligatoire qui bloquait l'enregistrement, jours cliquables pendant le chargement du calendrier,
  frais non calculés pour une commune exclue, blanc au-dessus du hero.
- **Session du 21/10 (documentation) :** `DEPLOYMENT.fr.md` (traduction, liens de langue croisés),
  `DEPLOYMENT.md` remis à jour (migrations, stockage, emails, arborescence réelle), `README.md`
  (fonctionnalités, URLs locales, nouveaux endpoints), Item 20 ajouté à la feuille de route.
- **Emails en local :** service **Mailpit** dans `docker-compose.yml` (UI `http://localhost:8025`,
  SMTP `mailpit:1025`) ; le conteneur PHP reçoit `SMTP_HOST=mailpit`, `MAIL_FROM`, `APP_URL`
  (priment sur `api/.env`). Envoi réel vérifié : statut `sent`, message visible dans Mailpit.

### Session du 12/10/2026 (`fba6368` → `7ec7c23`)
- **Encodage de la base locale :** les accents étaient stockés en double encodage (`é` → `C383C2A9`).
  `seed_init.sql` est sain : le volume `db_data` avait été rempli par un ancien import, et MySQL
  ne rejoue `docker-entrypoint-initdb.d` que sur un volume vide. Corrigé par
  `docker compose down -v && docker compose up -d db` ; vérifié en hexadécimal (`C3A9`).
  Pour lire les accents en CLI : `mysql --default-character-set=utf8mb4`.
- **`Mailer.php` :** faute `charset=uft-8` corrigée dans la partie `text/plain` (`fba6368`).
- **`seed_init.sql` :** apostrophe de `vitrine_about` échappée en `''` (SQL standard) (`8179084`).
- **Vitrine — Contact :** cartes construites uniquement si `pro_phone`, `pro_email` ou
  `service_area` sont renseignés ; aucune grille sinon, le CTA de réservation reste (`ac7c4d6`).
- **Vitrine — Engagements :** toutes les clés `vitrine_engagement_N` renseignées sont chargées en
  boucle, triées par N, sans limite ; la déduction de l'icône est inchangée. `AppConfig` déclare
  ces clés par un type gabarit `` `vitrine_engagement_${number}` `` (`7ec7c23`).

### Sessions précédentes

- **Item 13 (Recherche, filtres, RDV échus & reprogrammation) :** ✅ terminé et commité (`f3a1eb2`).
- **Item 1 (Frais de déplacement hybrides & hors-zone) :** ✅ terminé, commité et poussé (`cb9c0df` / `c1f5e38`).
- **Item 4 (Notifications email, iCal & journal d'envoi) :** ✅ terminé, commité et poussé (`762e94e` / `1372d87`).

### Détail de l'Item 4
- **`api/core/Mailer.php`** : client SMTP natif (socket, STARTTLS 587 ou TLS implicite 465,
  `AUTH LOGIN`), MIME `multipart/mixed` > `multipart/alternative` (texte + HTML) + pièce jointe,
  en-têtes RFC 2047 avec repli des sujets longs (toutes les lignes d'en-tête restent ≤ 78 caractères).
- **`api/core/ICalendar.php`** : `.ics` RFC 5545, créneau élargi du `buffer_minutes` de trajet,
  lieu, coordonnées client et notes d'accès, pliage de lignes à 75 octets sans casser l'UTF-8.
- **`api/core/EmailTemplates.php`** : gabarits responsive (tableaux, styles en ligne — seule mise en
  forme fiable en email) et alternative texte brut pour la délivrabilité.
- **`api/core/Notifier.php`** : journalise en `pending` *avant* l'appel SMTP, bascule en `sent` /
  `failed`, n'émet aucune exception vers le contrôleur.
- **Endpoints** : `GET /appointments/:id/notifications` et `POST /appointments/:id/notifications/resend`.
- **Page publique `/rdv/:token`** (`AppointmentManagePage.tsx`) : cible du lien de gestion envoyé au
  client, réutilise `BookingConfirmation` via la prop `showNewBooking`.
- **IHM Pro** : bouton « Emails » par rendez-vous ouvrant le journal (statut coloré, destinataire,
  sujet, horodatage, motif d'échec) avec relance manuelle par type.
- **Secrets** : `SMTP_*`, `MAIL_FROM*`, `APP_URL`, `APP_TIMEZONE` lus uniquement dans `api/.env`.
  ⚠️ **Ces clés ne sont pas encore renseignées** : en local comme en prod, tant que `SMTP_HOST` est
  vide, les envois sont journalisés en `failed` (« Envoi d'emails non configuré ») sans jamais
  bloquer une réservation. Voir `DEPLOYMENT.md`, étape 4b.

### Détail de l'Item 1
- **Moteur `api/core/TravelFee.php`** : distance géodésique (Haversine) entre `config.default_latitude/longitude`
  et l'adresse BAN du client ; résolution des paliers ; détection du hors-zone.
  Trois modes portés par la prestation : `none`, `fixed`, `distance_tiers`.
- **Endpoint public `POST /api/travel-fee/quote`** (`api/controllers/TravelFeeController.php`) :
  renvoie `{ mode, service_price, travel_fee, total, distance_km, is_out_of_zone, max_km, needs_coordinates, tiers }`.
- **`AppointmentController::store`** recalcule systématiquement le devis côté serveur :
  - `400` si la prestation facture à la distance et que l'adresse n'est pas géocodée ;
  - `422` (`code: out_of_zone`) au-delà de `config.travel_max_km`, avec email et téléphone du pro ;
  - frais figés en base dans `appointments.travel_fee` / `distance_km` / `is_out_of_zone`.
- **Tunnel de réservation** (`BookingForm.tsx`) : devis en direct dès la sélection d'adresse, décomposition
  Prestation + Déplacement (+ distance) = Total estimé, blocage bienveillant hors zone avec `mailto:`
  pré-rempli de demande exceptionnelle et lien `tel:`.
- **Confirmation** (`BookingConfirmation.tsx`) et **vitrine** (`ServicesSection.tsx`) : rappel du détail tarifaire.
- **Espace Pro** (`AdminDashboard.tsx`) : mode et forfait de déplacement en création et édition de prestation,
  badge dédié sur les cartes, nouvel onglet **« Zone & déplacement »** pour les 3 paliers et le rayon maximal.
- **Helpers partagés** : `src/utils/format.ts` (`formatEuro`, `formatKm`).

---

## 2. État exact de la base de données

| Table | Évolutions | Statut |
|---|---|---|
| `services` | `travel_fee_mode`, `travel_fee_amount` (Item 1) | ✅ en base **et** dans `sql/schema.sql` |
| `appointments` | `travel_fee`, `distance_km`, `is_out_of_zone` (Item 1) ; `decision_token` (Item 18) | ✅ en base **et** dans `sql/schema.sql` |
| `appointment_notifications` | table (Item 4) ; types `exception_client_ack`, `exception_pro_request`, `exception_client_refused` (Item 18) | ✅ en base **et** dans `sql/schema.sql` |
| `config` | clés de déplacement, `vitrine_*`, `legal_*` ; nouvelles clés écrites par l'IHM (`travel_mode`, `premises_*`, `start_*`, `zone_include_neighbours`, `travel_fee_origin`, `vitrine_engagement_N_icon`) | ✅ créées à la demande, rien d'obligatoire en seed |

- Migrations idempotentes, toutes appliquées en dev :
  `2026-10-11_item1_travel_fees.sql`, `2026-10-11_item4_notifications.sql`,
  `2026-10-21_item18_exception_requests.sql` (exécutée deux fois sans effet de bord).
- **À appliquer en production** avant de déployer `b7bf2e4` : la migration du 21/10.
- Fichiers hors base, non versionnés : `api/storage/branding/` et `api/storage/zone/`
  (doivent être accessibles en écriture par PHP).

### Écarts corrigés au passage
La base dev avait dérivé des fichiers `sql/` : colonnes `travel_fee_*` présentes en base mais absentes de
`schema.sql`, et clés `vitrine_*` / `legal_*` présentes dans `seed_init.sql` mais absentes de la base.
Les deux sens ont été réalignés.

---

## 3. Prochains chantiers prioritaires (ordre fixé le 21/10/2026)

### 🎯 1. Item 15 — Header & footer sur le tunnel de réservation
Extraire le header de `VitrinePage.tsx` en composant réutilisable, l'afficher en permanence sur
`/booking` (et `/rdv/:token`, `/decision/:token`), réutiliser `Footer`.

### 🎯 2. Item 12 — Sécurité de l'espace Pro
Vérification serveur de **toutes** les routes `/admin/*` (aujourd'hui ouvertes), regroupement des
routes d'écriture non préfixées (`/schedules/:day`, `/unavailabilities`), puis 2FA OTP par email
(appareil de confiance 10 jours). Le Mailer est prêt et testable en local avec Mailpit.

### 3. Item 20 — Compte SMTP configurable depuis l'espace Pro (reporté)
Dépend de l'Item 12 : mot de passe chiffré hors table `config`, jamais renvoyé par l'API.

### Points d'attention issus des Items 18 et 19
- Changer à la main le statut d'une demande « En attente » n'envoie pas les emails de décision.
- Sans `APP_URL`, l'email artisan n'a pas de bouton de décision : validation par le planning seulement.
- Pas de limitation de fréquence sur `POST /appointments/exceptional-request` (route publique).
- Un grand rayon produit un fichier de zone lourd pour la vitrine (contours non simplifiés).

### Contraintes et reliquats
Consignés dans [`AGENTS.md`](AGENTS.md), section *5. Contraintes Connues & Dette Technique*
(sécurité de l'espace Pro, fichiers `.env` hors de portée des agents, envoi d'emails désactivé
sans SMTP, fuseau horaire, absence de notification à l'annulation).

---

## 4. Rappels et contraintes d'ingénierie (AGENTS.md)
- **Frontend :** React 18 / TypeScript strict. Aucun `style={{...}}`, aucune micro-classe utilitaire ad hoc :
  classes BEM sémantiques dans `src/styles/_components.scss`, couleurs via `_variables.scss`.
- **Icônes :** `@phosphor-icons/react`, imports suffixés `Icon`, `weight="fill"`.
- **Validation avant commit :** `npm run build` **et** `npx tsc --noEmit` — `vite build` ne vérifie pas les types.
- **Schéma :** toute évolution va dans `sql/schema.sql` *et* dans une migration idempotente de `sql/migrations/`.
