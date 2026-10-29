# 📋 Fiche de Passation & Point d'Avancement — Crénelio

**Date :** 29 Octobre 2026
**Dépôt :** `/Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio`
**Dernier commit :** `6ea2d98` (`main`, **non poussé**, avec `8949682`, `52834fe` et `751caed`) — *liste des interventions AG Grid (Item 21, 1/2)*
**Statut Git :** commits directs sur `main` (projet solo), sans ligne d'attribution, **uniquement après accord explicite** (cf. `AGENTS.md`, section 6) ; le push reste à l'humain.
**Non commité :** rien (hors cette fiche).

---

## 1. Ce qui est réellement achevé

### Session du 29/10/2026 (`52834fe` → `6ea2d98`)
- **Item 27 — Déploiement interactif (`52834fe`) :** `npm run deploy:init` (`scripts/deploy-init.mjs`,
  Node sans dépendance) interroge `https://<site>/api/health` ; premier déploiement → questions
  (base OVHcloud, expéditeur, SMTP facultatif, fuseau), `api/.env` généré (droits 600) et squelette
  `api/storage/` ; mise à jour → ni `.env` ni `storage/`, seules les migrations postérieures à
  `schema_version` jointes. Paquet `deploy/<date>-…/` (`www/`, `sql/`, `INSTRUCTIONS.md`), réponses
  sans mot de passe dans `.deploy/answers.json` (ignorés par Git). **Saisie clavier non testée.**
- **Version du schéma :** `config.schema_version` (migration `2026-10-29_item27_schema_version.sql`,
  reprise dans `seed_init.sql`) ; **chaque nouvelle migration doit la mettre à jour** (`AGENTS.md`).
- **Item 23 — Calendrier (`751caed`) :** onglet « Calendrier » (FullCalendar 6.1.22, plugins MIT,
  chargé à la demande) : vues mois / semaine / jour / liste, horaires et indisponibilités, couleurs
  par statut ; glisser-déposer validé par `SlotEngine` (`check`, `excludeId`), refus 409 puis
  « Déplacer quand même » (`force`) ; clic sur un jour → nouveau rendez-vous à cette date ; clic sur
  un rendez-vous → planning filtré sur ce jour, rendez-vous mis en évidence. Filtre « jour précis ».
- **Item 21 — Liste AG Grid, partie 1/2 (`6ea2d98`) :** AG Grid Community 36.2.0 (MIT, chargée à la
  demande, modules enregistrés un par un) : colonnes triables / filtrables, « Client & lieu »
  fusionnée, sélection d'une ligne → barre d'actions à hauteur fixe, actions par ligne en option,
  export CSV (`;`), barre d'outils unique (nouveau rendez-vous, recherche…), barre d'état accolée
  (le module natif est Enterprise). Disposition enregistrée en base (`config.ui_state_<id>`,
  `/admin/ui-state/:id`, jamais les filtres), bouton « Réglages par défaut ». Regroupement de
  lignes (Enterprise) remplacé par tri et filtres. **Finitions : partie 2/2.**

### Session du 28/10/2026 (`c70a0a4` → `8d58e14`)
- **Emails :** adresse de réponse automatique (`Notifier::replyToFor` : email pro pour les clients,
  client pour l'artisan), testée dans Mailpit ; email de test vers un destinataire libre (5 envois
  par 10 min) ; nom d'expéditeur par défaut = nom de l'entreprise ; `MAIL_FROM` par défaut =
  `noreply@` domaine d'`APP_URL`.
- **Hébergement :** offre OVHcloud **Starter** au minimum (un seul site, une seule base de 250 Mo,
  même PHP que les offres supérieures) ; règle inscrite dans `AGENTS.md`.
- **Item 2 — Thème (`784ef2a`, `e471d1d`) :** couleur principale (palette lisible ou libre, contrôle
  du contraste), fond des pages (12 teintes claires ou teinte de la couleur), arrondis (sans,
  compact, standard, arrondi), boutons (standard, pilule, plat, material, relief), effets (ombres
  douces, verre dépoli, animations). Clés `theme_*`, variables CSS (`_theme.scss`), appliqué par
  `src/utils/theme.ts` et mémorisé localement. Tous les boutons unifiés sur `.btn` (tailles
  `--lg` / `--xl`). Retour de survol 3 fois plus lent ; durées, interlignes et espacements en
  constantes (`_variables.scss`).
- **Item 25 — Mot de passe & email pro (`0314e1b`) :** changement imposé de `admin123` (hors
  développement), changement depuis Configuration, « Mot de passe oublié » par code, email
  professionnel vérifié par code, ancienne adresse prévenue ; codes unifiés
  (`Auth::issueCode` / `checkCode`). Procédure de secours documentée (`DEPLOYMENT*.md`, 5 ter).
- **Item 5 — RGPD (`8d58e14`) :** notice d'information (pas de case de consentement : base légale =
  exécution du contrat), politique de confidentialité générée, pas de bandeau (aucun traceur),
  conservation 36 mois réglable avec purge quotidienne, bouton « Effacer le client ».
- **Interface :** fenêtres harmonisées (mixins `modal-*`, rendues par portail, seul le corps défile),
  encart `Panel`, coordonnées au format postal (`PostalContact`), liens soulignés au survol
  seulement, section Contact à deux cartes, plus de coordonnées dans le hero.
- **Feuille de route :** priorités réordonnées selon la criticité puis le gain ; ajouts des
  Items 25 à 31 ; Item 20 (SMTP dans l'espace Pro) abandonné au profit de l'Item 24.

### Session du 27/10/2026 (`fdb9b73` → `40086a9`)
- **Règles OVHcloud sur l'expéditeur (`ad6358d`)**, vérifiées dans la
  [documentation officielle](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/email-sending-best-practices) :
  domaine de `MAIL_FROM` attaché à l'hébergement (*Multisite*), sinon rejet ; en SMTP, `From:`
  identique au compte authentifié ; adresse d'un tiers seulement en `Reply-To:` ; SPF / DKIM /
  DMARC. Consignées comme **règle générale OVHcloud** dans `AGENTS.md` (section 5), et dans
  `README.md` et `DEPLOYMENT*.md` (étape 4b).
- **Item 20 abandonné :** saisir le SMTP dans l'espace Pro risquerait de couper l'envoi des codes
  de connexion (impossible de se reconnecter pour corriger) et exposerait le mot de passe.
- **Item 24 — Envoi natif & email de test (`40086a9`) :**
  - `Mailer::transport()` : `smtp` si `SMTP_HOST` est renseigné, sinon `mail()` de l'hébergement,
    `none` sans `MAIL_FROM`. Même message MIME (pièce jointe `.ics`, logo intégré).
  - `MailController` : `GET /admin/mail` (mode, serveur, expéditeur, jamais de mot de passe) et
    `POST /admin/mail/test` (vers `pro_email`), routes protégées.
  - Encart `MailStatus` (onglet Configuration, sous Coordonnées), en lecture seule.
  - Vérifié : email de test reçu dans Mailpit ; message `mail()` capturé dans le conteneur
    (structure complète, sujet accentué, en-têtes non dupliqués) et cas de refus.
    **Le vrai `mail()` ne se teste que sur l'hébergement.** Encart non vu dans le navigateur.

### Sessions du 21 au 23/10/2026 (`51564a4` → `1ff45be`)
- **Item 12 — Sécurité de l'espace Pro (`14871c2`) :** `api/core/Auth.php`.
  - Session PHP en cookie `HttpOnly` / `SameSite=Strict` (inactivité 2 h, 12 h max), `Secure` en HTTPS.
  - Nouvel appareil ⇒ code à 6 chiffres envoyé à `pro_email` (haché en session, 15 min, 3 essais,
    renvoi au plus toutes les 60 s) ; appareil de confiance 10 jours (cookie signé HMAC).
    Changer le mot de passe ferme les sessions et oublie les appareils.
  - 5 échecs de mot de passe en 15 min ⇒ IP bloquée (`api/storage/auth/throttle.json`).
  - Clé de signature `api/storage/auth/secret.key`, générée au premier besoin, non versionnée.
  - Toutes les routes de gestion enveloppées par `$admin(...)` dans `api/routes/api.php`
    (401 sinon) ; `?all=1` sur `/services` réservé à l'espace Pro.
  - Nouvelles routes : `POST /admin/login/code`, `GET /admin/session`, `POST /admin/logout`.
  - Front : `src/components/admin/AdminLogin.tsx` (mot de passe puis code), session conservée au
    rechargement, retour à la connexion sur tout 401 (`UNAUTHORIZED_EVENT`, `src/api.ts`).
  - Sans `pro_email` ou sans SMTP : mot de passe seul + bandeau d'avertissement.
  - Testé par l'API (routes refusées, code reçu dans Mailpit, essais, appareil reconnu,
    déconnexion, blocage IP). **L'écran de connexion n'a pas été testé dans le navigateur.**
- **Item 15 — Header & footer du tunnel (`3f4b31f`) :** composant `SiteHeader` partagé (vitrine :
  apparaît après le CTA du hero ; `/booking` : permanent, sans bouton « Prendre rendez-vous »),
  `Footer` sous le stepper. `/rdv/:token` garde son header allégé.
- **Abandon de la réservation (`1ff45be`) :** « Annuler et revenir à l'accueil » sous le formulaire,
  confirmation (`ConfirmDialog`) dès qu'une prestation est choisie.
- **Logo dans les emails (`424bc5d`, `482d6f8`) :** image intégrée (`multipart/related`, `cid:`) en
  en-tête sur fond blanc. À chaque envoi de logo, le navigateur génère `logo-email.png`
  (512 px de large max) ; repli sur `logo.png`. **Le logo actuel doit être renvoyé une fois** depuis
  la configuration pour créer cette copie (sinon 434 Ko par email).
- **Déploiement (`51564a4`) :** `scripts/build.mjs` remplace `build.sh` (multiplateforme),
  empaquetage OVH corrigé (`.htaccess` racine et `api/`), déploiement Git OVH documenté (branche
  `deploy` contenant le build) et procédure de mise à jour d'un site en ligne.
- **Scripts de lancement (`3d70c8a`, `46fa5cb`) :** `npm start` affiche les URLs utiles, Vite forcé
  sur 5173 (port d'`APP_URL`) ; `scripts/run-python.mjs` choisit `python3` / `py` / `python` ;
  message clair si `docker` est introuvable.
- **Feuille de route (`a031f57`) :** Items 21 (AG Grid Community), 22 (factures, plus tard),
  23 (FullCalendar).
- **Poste de dev :** après la mise à jour macOS, Docker passe par **colima** ; la CLI `docker` avait
  été délinkée (`brew unlink docker-completion && brew link docker`).

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
- Migration du 29/10 (`2026-10-29_item27_schema_version.sql`) : appliquée en dev (rejouée sans
  effet de bord) ; elle n'ajoute qu'une clé `config`, pas de colonne.
- **À appliquer en production** avant le premier déploiement : les migrations du 21/10 et du 29/10
  (`npm run deploy:init` les liste automatiquement selon `schema_version`).
- Clés `config` créées à la demande : `theme_*`, `rgpd_retention_months`, `rgpd_last_purge`,
  `schema_version`, `ui_state_<id>` (préférences d'affichage, exclues de la configuration publique).
- Fichiers hors base, non versionnés : `api/storage/branding/`, `api/storage/zone/` et
  `api/storage/auth/` (doivent être accessibles en écriture par PHP).

### Écarts corrigés au passage
La base dev avait dérivé des fichiers `sql/` : colonnes `travel_fee_*` présentes en base mais absentes de
`schema.sql`, et clés `vitrine_*` / `legal_*` présentes dans `seed_init.sql` mais absentes de la base.
Les deux sens ont été réalignés.

---

## 3. Prochains chantiers prioritaires (ordre de la feuille de route au 29/10/2026)

### 🎯 0. Vérifications en attente
- Renvoyer le logo depuis la configuration pour générer `logo-email.png`.
- Vérifier que `pro_email` en base est bien l'adresse de l'artisan avant toute mise en ligne :
  le code de connexion et la réinitialisation du mot de passe y partent.
- Faire relire la politique de confidentialité par l'artisan (modèle, pas un avis juridique).
- À la mise en ligne : `MAIL_FROM` sur un domaine attaché à l'hébergement, `SMTP_HOST` vide,
  DKIM activé, bouton « Envoyer un email de test » **avant** la première déconnexion, puis
  changement imposé de `admin123`.

### 🎯 1. Item 21 — Liste AG Grid, partie 2/2 (finitions)
- Peaufiner le rendu dans le navigateur (non vérifié de bout en bout) : barre d'outils, barre
  d'actions de la sélection, barre d'état accolée, hauteur des lignes, colonne Actions optionnelle.
- Parcourir toutes les fonctions (filtres de colonnes, export, pagination, préférences, sélection
  depuis le calendrier) : une erreur AG Grid #200 en développement signale un module à enregistrer.
- Revoir le poids de la grille (≈ 281 ko compressés) si besoin.
- Tester aussi au clavier `npm run deploy:init` (saisie masquée du mot de passe) et le
  glisser-déposer du calendrier.

### 2. Item 28 — Paquet téléchargeable · 3. Item 22 — Factures · 4. Item 30 — Effets avancés & thème sombre
### 5. Item 26 — `APP_URL` automatique · 6. Item 29 — Mise à jour sur site · 7. Item 31 — Traduction

### Points d'attention issus des Items 18 et 19
- Changer à la main le statut d'une demande « En attente » n'envoie pas les emails de décision.
- Sans `APP_URL`, l'email artisan n'a pas de bouton de décision : validation par le planning seulement.
- Pas de limitation de fréquence sur `POST /appointments/exceptional-request` (route publique).
- Un grand rayon produit un fichier de zone lourd pour la vitrine (contours non simplifiés).

### Contraintes et reliquats
Consignés dans [`AGENTS.md`](AGENTS.md), section *5. Contraintes Connues & Dette Technique*
(sécurité de l'espace Pro et règle `$admin(...)` pour toute nouvelle route de gestion, mot de passe et
email pro hors de `PUT /admin/config`, RGPD (toute nouvelle donnée personnelle → effacement + politique),
hébergement OVHcloud Starter, fichiers `.env` hors de portée des agents, fuseau horaire, absence de
notification à l'annulation).

---

## 4. Rappels et contraintes d'ingénierie (AGENTS.md)
- **Frontend :** React 18 / TypeScript strict. Aucun `style={{...}}`, aucune micro-classe utilitaire ad hoc :
  classes BEM sémantiques dans `src/styles/_components.scss`, couleurs via `_variables.scss`.
- **Icônes :** `@phosphor-icons/react`, imports suffixés `Icon`, `weight="fill"`.
- **Validation avant commit :** `npm run build` **et** `npx tsc --noEmit` — `vite build` ne vérifie pas les types.
- **Schéma :** toute évolution va dans `sql/schema.sql` *et* dans une migration idempotente de `sql/migrations/`.
- **Styles :** un seul bouton (`.btn`), fenêtres par les mixins `modal-*`, encarts par `Panel`, couleurs de
  marque dérivées de `--color-primary`, constantes pour durées, interlignes et espacements.
- **Bibliothèques :** FullCalendar et AG Grid en éditions gratuites (MIT) uniquement, chargées à la demande ;
  jamais de plugin ou module Premium / Enterprise.
