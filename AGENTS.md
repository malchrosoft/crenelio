# Instructions pour Agents IA (AGENTS.md) — Crénelio

Ce document détaille l'architecture du projet **Crénelio**, les conventions à respecter et les instructions opérationnelles pour initialiser, exécuter et tester le projet de manière autonome.

---

## 1. Contexte & Identité Git

- **Projet :** Crénelio (application mono-artisan de prise de rendez-vous en ligne à domicile).
- **Emplacement :** `/Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio`
- **Profil GitHub :** Compte personnel **`malchrosoft`** (`aymeric.malchrowicz@malchrosoft.com`).
  - Remote SSH : `git@github-malchrosoft:malchrosoft/crenelio.git`.
  - Vérifier l'identité CLI si interaction `gh` requise : `gh auth status` (basculer si besoin avec `gh auth switch --hostname github.com --user malchrosoft`).

---

## 2. Démarrage de l'Environnement de Développement

### A. Base de données MySQL (Docker)
L'environnement utilise l'image officielle MySQL 8.0 orchestrée par `docker-compose.yml`.
Le schéma et les données sont montés en lecture seule dans `/docker-entrypoint-initdb.d/` :
- `sql/schema.sql` : **DDL pur** (création des tables `config`, `services`, `schedules`, `unavailabilities`, `appointments` et index).
- `sql/seed_init.sql` : **DML socle applicatif** (clés indispensables de la table `config`, horaires hebdomadaires standards).
- `sql/seed_test_data.sql` : **DML de test / démo** (prestations d'exemple, congés/indisponibilités de test, rendez-vous récents et à venir).
- `sql/migrations/` : **Migrations idempotentes** à appliquer sur une base existante lorsqu'un item modifie le schéma. `schema.sql` reste la source de vérité : toute colonne ajoutée en migration doit y figurer également, sans quoi un `docker compose down -v` la ferait disparaître.
  **Version du schéma (Item 27) :** chaque nouvelle migration se termine par la mise à jour de `config.schema_version` avec son propre nom de fichier (sans `.sql`), et `seed_init.sql` reprend cette même valeur. `GET /api/health` l'expose, et `npm run deploy:init` en déduit les migrations à joindre à une mise à jour.
  ```bash
  docker compose exec -T db mysql -ucrenelio -pcrenelio_dev crenelio < sql/migrations/<fichier>.sql
  ```

**Commande de démarrage :**
```bash
docker compose up -d db
```

**Identifiants de connexion locale :**
- **Hôte :** `127.0.0.1` (port `3306`)
- **Base :** `crenelio`
- **Utilisateur :** `crenelio`
- **Mot de passe :** `crenelio_dev`
- **Root password :** `crenelio_root`

**Réinitialisation de la base :**
Pour réinitialiser complètement la base et ré-exécuter les scripts de seed :
```bash
docker compose down -v
docker compose up -d db
```

---

### B. Lancement & Arrêt Global Multiplateforme (Recommandé)
Les scripts Python autonomes (`scripts/start.py` et `scripts/stop.py`) fonctionnent nativement sous **Windows, macOS et Linux** sans dépendance pip externe.

- **Démarrage tout-en-un** (Docker DB + API PHP Docker + Frontend Vite) :
  ```bash
  npm start                     # ouvre ensuite le navigateur par défaut dès que Vite répond
  npm start safari admin        # navigateur cité (+ chemin) ; « tous » pour comparer, « aucun » pour ne rien ouvrir
  # ou directement : python3 scripts/start.py [navigateur] [chemin]
  ```
  Serveur déjà lancé : `npm run ouvrir [navigateur|tous] [chemin]` (`scripts/ouvrir.mjs`).
  ⚠️ Un agent qui teste `npm start` doit utiliser `aucun` et ne jamais arrêter un Vite qu'il n'a
  pas lancé lui-même (l'humain peut avoir le sien sur 5173).
- **Arrêt complet** (Conteneurs Docker + Processus Vite) :
  ```bash
  npm stop
  # ou directement : python scripts/stop.py
  ```

---

### C. Frontend React / Vite
1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de dev Vite :
   ```bash
   npm run dev
   ```
3. Vérifier la compilation de production :
   ```bash
   npm run build
   ```
   ⚠️ `vite build` ne contrôle pas les types (esbuild se contente de les effacer). Lancer en complément :
   ```bash
   npx tsc --noEmit
   ```
   *(Le build génère les assets optimisés dans `api/public/assets/`)*.

---

## 3. Architecture Technique & Conventions

### Frontend
- **Framework :** React 18 avec **TypeScript** (`strict: true`).
- **Styles :** **Sass (SCSS)** modulaire situé dans `src/styles/` :
  - `main.scss` (point d'entrée importé dans `src/main.tsx`)
  - `_variables.scss` (palette, rayons, ombres)
  - `_mixins.scss` (breakpoints responsive `mobile`, `tablet`, helpers flex)
  - `_base.scss` (reset, layout global, typographie)
  - `_components.scss` (stepper, cartes prestations, calendrier, slots, formulaires, badges)
  - `_vitrine.scss` (page vitrine artisan, responsive, animations)
- **Règle absolue sur les styles :**
  - **Bannir formellement les styles inline (`style={{ ... }}`)**.
  - **Éviter de contourner le style inline avec des micro-classes atomiques / utilitaires ad hoc (ex: `text-95`, `mb-5`, `p-3`)** qui reviennent exactement au même. Définir de vraies **classes sémantiques BEM / de composant** dans les fichiers SCSS dédiés (`_components.scss`, `_vitrine.scss`, etc.) en réutilisant les variables SCSS (`$primary`, `$gray-500`, etc.).
  - Les styles ou micro-utilitaires ne sont tolérés que dans des **composants de base** réutilisables (design system).
  - Ne jamais coder en dur des valeurs hexadécimales de couleurs dans le SCSS : toujours utiliser les constantes/variables de `_variables.scss`.
  - **Constantes :** interlignes (`$line-height-tight` … `$line-height-loose`), durées d'animation (`$duration-*`) et espacements (`$space-*`) viennent de `_variables.scss` ; ne pas réécrire de valeur littérale.
  - **Fenêtres et encarts :** une fenêtre utilise les mixins `modal-*` (`_mixins.scss`) ; un encart titré utilise le composant `Panel` (fond gris clair, en-tête légèrement soutenu). Ne pas recréer d'en-tête ou de cadre à part.
  - **Liens :** jamais soulignés au repos (règle globale de `_base.scss`) ; un lien de texte sans classe se souligne au survol et au focus clavier. Un lien-composant (avec classe) gère son propre survol : ne pas lui ajouter de soulignement permanent.
  - **Boutons :** tout élément d'aspect bouton (`<button>`, `<a>`, `<Link>`, `<span>` dans une carte cliquable) utilise `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-danger`, et au besoin `.btn--lg` / `.btn--xl`. Jamais de classe dupliquée qui imite un bouton : elle échapperait au style de boutons du thème.
  - **Thème (Item 2) :** `$primary`, `$primary-hover`, `$primary-light`, `$radius*` et `$shadow*` sont des **variables CSS** (`_theme.scss`), pilotées par `src/utils/theme.ts`. Ne jamais les passer à une fonction de couleur Sass (`rgba()`, `lighten()`…) : utiliser `primary-alpha(20%)` / `primary-tint(10%)` (`_mixins.scss`). Toute nouvelle couleur liée à la marque doit dériver de `--color-primary`.
- **Icônes :** Utiliser la librairie `@phosphor-icons/react` avec le style `weight="fill"`. Pour une identification immédiate et sans ambiguïté, **toujours utiliser les imports suffixés par `Icon`** (ex : `CalendarCheckIcon`, `MapPinIcon`, `ClockIcon`, `PhoneIcon`, `LockKeyIcon`).
- **Autocomplétion d'adresses :** `AddressAutocomplete.tsx` appelle l'API publique de la Base Adresse Nationale (`https://api-adresse.data.gouv.fr/search/?q=...`) avec debounce.
- **Cartographie :** `InterventionMap.tsx` s'appuie sur `pigeon-maps` et OpenStreetMap. Le centrage initial et le niveau de zoom proviennent de la table `config` (fallback par défaut : Clamart `[48.8000, 2.2625]`, zoom `12`).

### Backend (PHP 8.2 Natif)
- **Architecture :** MVC léger sans framework externe (adapté mutualisé OVHcloud).
- **Core :**
  - `api/core/Database.php` : Singleton PDO avec requêtes préparées systématiques.
  - `api/core/Router.php` : Moteur de routes regex supportant les paramètres nommés (`:id`, `:token`, `:day`).
  - `api/core/Response.php` : Réponses JSON standardisées et gestion CORS.
  - `api/core/TravelFee.php` : Distance géodésique (Haversine), paliers kilométriques et détection du hors-zone.
  - `api/core/Mailer.php` : envoi par SMTP natif (socket, STARTTLS / TLS implicite, AUTH LOGIN) si `SMTP_HOST` est renseigné, sinon par la fonction `mail()` de l'hébergement ; même composition MIME multipart dans les deux cas.
  - `api/core/ICalendar.php` : Génération du `.ics` (RFC 5545) joint à l'email de l'artisan.
  - `api/core/EmailTemplates.php` : Gabarits HTML et texte des emails. Les styles y sont **volontairement en ligne** : les clients de messagerie ignorent les feuilles de style externes. La règle « pas de style inline » ne vaut que pour le front React.
  - `api/core/Notifier.php` : Orchestration des envois. Journalise en `pending` *avant* d'appeler le SMTP, puis bascule en `sent` / `failed`. **Ne propage jamais d'exception** : une panne d'envoi ne doit pas faire échouer une réservation déjà enregistrée.
- **Modèles & Contrôleurs :**
  - `Config` / `ConfigController` : Stockage clé-valeur pour les paramètres artisans et login admin.
  - `Service` / `ServiceController` : CRUD des prestations.
  - `Schedule` / `ScheduleController` : Horaires d'ouverture hebdomadaires et indisponibilités.
  - `SlotEngine` (`api/core/`) : calcul des créneaux d'une journée (horaires hebdomadaires, durée de la prestation, indisponibilités, rendez-vous existants + temps de trajet, délai minimal, horizon). Source unique : sert à proposer les créneaux **et** à valider une réservation (`POST /appointments` refuse tout créneau non proposé).
  - **Calendrier (Item 23)** : `src/components/admin/AppointmentCalendar.tsx` (FullCalendar 6, plugins MIT uniquement — pas de plugin Premium). Le glisser-déposer appelle `PUT /appointments/:id/reschedule` avec `check` (validation `SlotEngine::isAvailable(..., $excludeId)`, 409 `slot_unavailable`) puis `force` sur confirmation ; garder les paquets `@fullcalendar/*` sur la même version majeure.
  - `SlotController` : `GET /slots` (créneaux d'un jour) et `GET /slots/availability` (jours réservables de la fenêtre, pour griser le calendrier).
  - `Appointment` / `AppointmentController` : Réservation, annulation par token, changement de statut, reprogrammation, journal des notifications.
  - `Notification` : Journal `appointment_notifications` (une ligne par tentative d'envoi, consultable depuis l'IHM Pro).
  - `TravelFeeController` : Devis public de frais de déplacement (`POST /travel-fee/quote`).

### Envoi d'emails en développement local
Les paramètres d'envoi sont lus **exclusivement** depuis `api/.env` (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`, `MAIL_FROM_NAME`, plus `APP_URL` pour le
lien de gestion client). Rien n'est stocké en base, ni modifiable depuis l'espace Pro (Item 20
abandonné : un mauvais réglage couperait l'envoi des codes de connexion). `GET /admin/mail` et
`POST /admin/mail/test` n'exposent que le mode, le serveur et l'expéditeur.

`SMTP_HOST` vide ⇒ fonction `mail()` de l'hébergement (mode de production recommandé chez OVHcloud,
non testable en local). `MAIL_FROM` vide ⇒ `noreply@` + domaine d'`APP_URL` (constantes
`SITE_DOMAIN` / `MAIL_FROM_AUTO` dans `config/config.php`). Sans l'un ni l'autre, l'envoi est désactivé : les réservations aboutissent normalement et chaque
tentative est journalisée en `failed` avec un motif explicite, visible via le bouton « Emails »
du planning Pro.

En local, `docker-compose.yml` démarre **Mailpit** (interface `http://localhost:8025`) et fournit
au conteneur PHP `SMTP_HOST=mailpit`, `SMTP_PORT=1025`, `SMTP_SECURE=none`, `MAIL_FROM` et
`APP_URL` : ces variables d'environnement priment sur `api/.env`. Tout email envoyé par
l'application y est capturé, rien ne sort de la machine.

---

## 4. Suivi de la Feuille de Route (`ROADMAP.md`)
Le fichier [`ROADMAP.md`](file:///Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio/ROADMAP.md) sert de référence partagée pour le backlog et les évolutions prévues (frais de déplacement, theming, page vitrine, emails & iCal, RGPD, mentions légales...) :
- **En début de session :** Consulter systématiquement `ROADMAP.md` pour contextualiser la tâche ou choisir le prochain item prioritaire.
- **En cours / fin de session :** Mettre à jour `ROADMAP.md` pour cocher/marquer les fonctionnalités réalisées, consigner de nouveaux besoins exprimés par l'utilisateur ou ajuster les spécifications techniques.

---

## 5. Contraintes Connues & Dette Technique

Ces points sont assumés et documentés : ne pas les « corriger » au détour d'une
autre tâche, mais en tenir compte et les traiter dans l'item dédié.

### 🔐 Sécurité — Espace Pro protégé côté serveur (Item 12)
- `api/core/Auth.php` : session PHP (cookie `HttpOnly`, `SameSite=Strict`), code à 6 chiffres
  par email sur un appareil inconnu, appareil de confiance 10 jours (cookie signé HMAC),
  limitation des échecs de mot de passe par IP. Clé et compteur dans `api/storage/auth/`.
- **Toute nouvelle route de gestion doit être enveloppée par `$admin(...)`** dans
  `api/routes/api.php` (→ `Auth::guard`, 401 sinon). Le front ramène à la connexion sur tout 401
  (`UNAUTHORIZED_EVENT` dans `src/api.ts`).
- Restent publiques : config publique, prestations actives, créneaux, zone, devis de déplacement,
  réservation, demande hors zone, et les routes à token (`/appointments/token/:token`,
  `/appointments/decision/:token`). `GET /schedules` reste public (horaires d'ouverture).
- **Mot de passe & email professionnel (Item 25)** : `admin_password` et `pro_email` ne passent
  plus par `PUT /admin/config` (refusés) mais par les routes dédiées (`/admin/password*`,
  `/admin/pro-email*`). Tant que `admin123` est actif, `Auth::guard` répond 403
  (`password_change_required`) hors `APP_ENV=development` ; une route nécessaire au changement
  s'enregistre avec `$adminDefaultOk(...)`. Les codes à 6 chiffres (connexion, réinitialisation,
  email) passent tous par `Auth::issueCode` / `Auth::checkCode`.
- Sans `pro_email` ou sans envoi d'emails (`MAIL_FROM`), le second facteur est inactif (mot de passe seul, bandeau d'avertissement).

### 🔑 Fichiers `.env` — hors de portée des agents
- `api/.env` et `api/.env.example` ne sont ni lisibles ni modifiables par un agent
  (règle de permission `Read(./.env*)` et hook `PreToolUse`). Même `git diff` dessus
  est refusé.
- En conséquence : **documenter toute nouvelle variable dans `README.md`**
  (section « Configuration (`api/.env`) ») **et dans `DEPLOYMENT.md`**, puis fournir
  à l'humain le bloc exact à coller dans `.env.example`. Ne jamais tenter de
  contourner le blocage.
- Corollaire : un secret ne doit jamais migrer vers la table `config`, qui est
  exposée par `GET /admin/config` (et que la contrainte de sécurité ci-dessus rend
  publique de fait).

### ✉️ Envoi d'emails désactivé par défaut
- Sans `MAIL_FROM`, aucun email ne part : les tentatives sont
  journalisées en `failed` dans `appointment_notifications` avec un motif explicite.
- Ce comportement est **voulu** : une panne d'envoi ne doit jamais faire échouer une
  réservation déjà enregistrée. Conserver ce contrat dans toute évolution du
  `Notifier` (il ne propage aucune exception vers les contrôleurs).
- L'Item 12 (OTP par email) en dépend : sans envoi configuré, aucun code ne partira.

### ☁️ Hébergement OVHcloud mutualisé — règles générales
Le projet cible un hébergement mutualisé OVHcloud, **offre Starter au minimum** : **un seul
site et une seule base** (250 Mo), 1 Go de stockage, 2 adresses email ; même PHP que les offres
supérieures. Toute évolution doit tenir dans ces limites : jamais de seconde base ni de second
site (sous-domaine applicatif séparé), pas de stockage lourd dans `api/storage/`. Toute évolution doit aussi respecter ces règles, et la
documentation (`README.md`, `DEPLOYMENT.md` **et** `DEPLOYMENT.fr.md`) doit les rappeler.
- **PHP natif, sans Composer ni extension optionnelle** (pas d'Imagick ; GD non garanti) : un
  traitement d'image se fait côté navigateur (cf. `BrandingField`, `logo-email.png`).
- **Aucun build côté serveur** : OVH sert les fichiers tels quels (bundle compilé en local, ou
  branche `deploy` en déploiement Git).
- **Fichiers propres à l'installation dans `api/storage/`** (accessible en écriture par PHP,
  jamais servi directement, jamais versionné ni écrasé au déploiement).
- **Emails** ([bonnes pratiques OVHcloud](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/email-sending-best-practices)) :
  - domaine de l'expéditeur (`MAIL_FROM`) **attaché à l'hébergement** (*Multisite*), sinon rejet ;
  - en SMTP authentifié, adresse `From:` **identique au compte authentifié** (`SMTP_USER`) ;
  - jamais l'adresse d'un client ou d'un visiteur en `From:` : la mettre en `Reply-To:`
    (`Notifier::replyToFor` : email pro pour les emails aux clients, client pour ceux à l'artisan) ;
  - SPF, DKIM et DMARC à jour ; quotas horaires (≈ 200 / compte MX Plan, 300 / IP source) ;
    10 Mo maximum par message ;
  - `mail()` est suivi dans l'onglet *Scripts e-mail* de l'hébergement, les envois SMTP non.
- **Avant d'affirmer une règle OVHcloud, la vérifier dans la documentation officielle**
  (`docs.ovhcloud.com`) : elles évoluent.

### 🛡️ RGPD (Item 5)
- Toute **nouvelle donnée personnelle** (colonne, champ de formulaire, service tiers, cookie ou
  stockage navigateur) doit être ajoutée à `Appointment::anonymizeWhere` (effacement et purge) **et**
  décrite dans `src/components/PrivacyPolicy.tsx`.
- Aucun traceur (audience, publicité, réseau social) sans bandeau de consentement : l'absence de
  bandeau repose sur l'absence de traceurs.
- La purge des rendez-vous expirés est déclenchée par `GET /appointments` (une fois par jour,
  clé `rgpd_last_purge`) : ne pas la déplacer dans une route publique.

### 🗓️ Fuseau horaire
- Les datetimes sont stockés **naïfs** en base et s'interprètent dans `APP_TIMEZONE`
  (défaut `Europe/Paris`, appliqué globalement par `date_default_timezone_set()`
  dans `config/config.php`). Toute comparaison ou génération de date doit rester
  cohérente avec ce fuseau.

### 📭 Notifications d'annulation absentes
- Aucun email n'est envoyé lors d'une annulation, ni au client ni à l'artisan.
  L'énumération `appointment_notifications.type` devra être étendue le jour où
  cette fonctionnalité sera traitée.

---

## 6. Règles de Validation avant Commit / PR
**Ne jamais commiter sans l'accord explicite de l'humain pour ce commit précis.** Une fois la
modification terminée, la résumer et demander « Je commite ? ». Un accord donné en enchaînant
(« commit et on fait X ») ne vaut que pour le commit en cours, pas pour ceux que X produira.
Le `push` reste à l'humain.

Avant de proposer un commit :
1. Vérifier que le build Vite s'exécute sans erreur : `npm run build`, **et** que le typage est sain : `npx tsc --noEmit`.
2. Vérifier l'absence de fichiers temporaires ou orphelins : `git status`.
3. S'assurer que les identifiants et tokens secrets ne sont jamais commités.
4. Mettre à jour `ROADMAP.md` si des fonctionnalités du backlog ont été complétées.
5. Toute évolution de schéma va dans `sql/schema.sql` **et** dans une migration
   idempotente de `sql/migrations/` (cf. section 2.A).
