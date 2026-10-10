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
- **Autocomplétion d'adresses :** `AddressAutocomplete.tsx` appelle l'API publique de la Base Adresse Nationale (`https://api-adresse.data.gouv.fr/search/?q=...`) avec debounce.
- **Cartographie :** `InterventionMap.tsx` s'appuie sur `pigeon-maps` et OpenStreetMap. Le centrage initial et le niveau de zoom proviennent de la table `config` (fallback par défaut : Clamart `[48.8000, 2.2625]`, zoom `12`).

### Backend (PHP 8.2 Natif)
- **Architecture :** MVC léger sans framework externe (adapté mutualisé OVHcloud).
- **Core :**
  - `api/core/Database.php` : Singleton PDO avec requêtes préparées systématiques.
  - `api/core/Router.php` : Moteur de routes regex supportant les paramètres nommés (`:id`, `:token`, `:day`).
  - `api/core/Response.php` : Réponses JSON standardisées et gestion CORS.
- **Modèles & Contrôleurs :**
  - `Config` / `ConfigController` : Stockage clé-valeur pour les paramètres artisans et login admin.
  - `Service` / `ServiceController` : CRUD des prestations.
  - `Schedule` / `ScheduleController` : Horaires d'ouverture hebdomadaires et indisponibilités.
  - `SlotController` : Moteur de calcul en direct des créneaux disponibles selon durée et buffers.
  - `Appointment` / `AppointmentController` : Réservation, annulation par token, changement de statut.

---

## 4. Suivi de la Feuille de Route (`ROADMAP.md`)
Le fichier [`ROADMAP.md`](file:///Users/aymeric.malchrowicz/DEVELOPPEMENT/crenelio/ROADMAP.md) sert de référence partagée pour le backlog et les évolutions prévues (frais de déplacement, theming, page vitrine, emails & iCal, RGPD, mentions légales...) :
- **En début de session :** Consulter systématiquement `ROADMAP.md` pour contextualiser la tâche ou choisir le prochain item prioritaire.
- **En cours / fin de session :** Mettre à jour `ROADMAP.md` pour cocher/marquer les fonctionnalités réalisées, consigner de nouveaux besoins exprimés par l'utilisateur ou ajuster les spécifications techniques.

---

## 5. Règles de Validation avant Commit / PR
Avant de finaliser toute modification :
1. Vérifier que le build Vite s'exécute sans erreur : `npm run build`.
2. Vérifier l'absence de fichiers temporaires ou orphelins : `git status`.
3. S'assurer que les identifiants et tokens secrets ne sont jamais commités.
4. Mettre à jour `ROADMAP.md` si des fonctionnalités du backlog ont été complétées.
