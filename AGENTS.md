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
  npm start
  # ou directement : python scripts/start.py
  ```
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
  - `api/core/Mailer.php` : Client SMTP natif (socket, STARTTLS / TLS implicite, AUTH LOGIN) et composition MIME multipart.
  - `api/core/ICalendar.php` : Génération du `.ics` (RFC 5545) joint à l'email de l'artisan.
  - `api/core/EmailTemplates.php` : Gabarits HTML et texte des emails. Les styles y sont **volontairement en ligne** : les clients de messagerie ignorent les feuilles de style externes. La règle « pas de style inline » ne vaut que pour le front React.
  - `api/core/Notifier.php` : Orchestration des envois. Journalise en `pending` *avant* d'appeler le SMTP, puis bascule en `sent` / `failed`. **Ne propage jamais d'exception** : une panne d'envoi ne doit pas faire échouer une réservation déjà enregistrée.
- **Modèles & Contrôleurs :**
  - `Config` / `ConfigController` : Stockage clé-valeur pour les paramètres artisans et login admin.
  - `Service` / `ServiceController` : CRUD des prestations.
  - `Schedule` / `ScheduleController` : Horaires d'ouverture hebdomadaires et indisponibilités.
  - `SlotController` : Moteur de calcul en direct des créneaux disponibles selon durée et buffers.
  - `Appointment` / `AppointmentController` : Réservation, annulation par token, changement de statut, reprogrammation, journal des notifications.
  - `Notification` : Journal `appointment_notifications` (une ligne par tentative d'envoi, consultable depuis l'IHM Pro).
  - `TravelFeeController` : Devis public de frais de déplacement (`POST /travel-fee/quote`).

### Envoi d'emails en développement local
Les identifiants SMTP sont lus **exclusivement** depuis `api/.env` (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`, `MAIL_FROM_NAME`, plus `APP_URL` pour le
lien de gestion client). Rien n'est stocké en base.

Sans `SMTP_HOST`, l'envoi est désactivé : les réservations aboutissent normalement et chaque
tentative est journalisée en `failed` avec un motif explicite, visible via le bouton « Emails »
du planning Pro. C'est le comportement par défaut en local.

Pour vérifier réellement un envoi sans écrire à une vraie adresse, viser un serveur SMTP de
capture (Mailpit, MailHog ou un script de test jetable) via les variables d'environnement.

---

## 4. Suivi de la Feuille de Route (`ROADMAP.md`)
Le fichier [`ROADMAP.md`](file:///Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio/ROADMAP.md) sert de référence partagée pour le backlog et les évolutions prévues (frais de déplacement, theming, page vitrine, emails & iCal, RGPD, mentions légales...) :
- **En début de session :** Consulter systématiquement `ROADMAP.md` pour contextualiser la tâche ou choisir le prochain item prioritaire.
- **En cours / fin de session :** Mettre à jour `ROADMAP.md` pour cocher/marquer les fonctionnalités réalisées, consigner de nouveaux besoins exprimés par l'utilisateur ou ajuster les spécifications techniques.

---

## 5. Contraintes Connues & Dette Technique

Ces points sont assumés et documentés : ne pas les « corriger » au détour d'une
autre tâche, mais en tenir compte et les traiter dans l'item dédié.

### 🔴 Sécurité — Espace Pro non protégé côté serveur
- `ConfigController::login` renvoie un token trivial et devinable :
  `sha256(mot de passe + nom de la base + date du jour)`.
- **Aucune route `/admin/*` ne vérifie ce token** : l'authentification est purement
  côté client. N'importe quel appel direct à l'API contourne l'écran de connexion.
- Conséquence : toutes les routes d'écriture (prestations, config, statuts, horaires,
  envoi et suppression du logo / favicon via `/admin/branding/:kind`) sont ouvertes. À reprendre **avec l'Item 12** (2FA) — y ajouter une vraie
  vérification serveur, sans quoi la 2FA ne protégerait qu'un écran contournable.

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
- Sans `SMTP_HOST` ni `MAIL_FROM`, aucun email ne part : les tentatives sont
  journalisées en `failed` dans `appointment_notifications` avec un motif explicite.
- Ce comportement est **voulu** : une panne d'envoi ne doit jamais faire échouer une
  réservation déjà enregistrée. Conserver ce contrat dans toute évolution du
  `Notifier` (il ne propage aucune exception vers les contrôleurs).
- L'Item 12 (OTP par email) en dépend : sans SMTP configuré, aucun code ne partira.

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
Avant de finaliser toute modification :
1. Vérifier que le build Vite s'exécute sans erreur : `npm run build`, **et** que le typage est sain : `npx tsc --noEmit`.
2. Vérifier l'absence de fichiers temporaires ou orphelins : `git status`.
3. S'assurer que les identifiants et tokens secrets ne sont jamais commités.
4. Mettre à jour `ROADMAP.md` si des fonctionnalités du backlog ont été complétées.
5. Toute évolution de schéma va dans `sql/schema.sql` **et** dans une migration
   idempotente de `sql/migrations/` (cf. section 2.A).
