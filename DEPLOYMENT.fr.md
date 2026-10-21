# Guide de déploiement — Hébergement mutualisé OVHcloud

[🇬🇧 English](DEPLOYMENT.md) · 🇫🇷 Français

Ce guide décrit le déploiement de Crénelio (React + PHP natif + MySQL) sur une offre
d'hébergement mutualisé OVHcloud (Perso, Pro ou Performance).

---

## Prérequis

- Une offre d'hébergement web OVHcloud (Perso ou supérieure)
- Node.js 18+ installé en local (pour compiler React)
- Un client FTP/SFTP (FileZilla, WinSCP, Cyberduck ou `lftp` en ligne de commande)
- Vos identifiants FTP/SFTP OVH (dans l'espace client OVH)

---

## Étape 1 : compiler le frontend React

Depuis la racine du projet, sur votre machine :

```bash
# Installer les dépendances
npm install

# Vérifier les types (vite build ne le fait pas), puis compiler la version de production
npx tsc --noEmit
npm run build
```

React est compilé en fichiers statiques optimisés dans `api/public/assets/`.

---

## Étape 2 : créer la base MySQL chez OVH

1. Connectez-vous à l'[espace client OVH](https://www.ovh.com/manager/)
2. Allez dans **Web Cloud** → **Hébergements** → votre offre
3. Ouvrez l'onglet **Bases de données**
4. Cliquez sur **Créer une base de données**
   - Choisissez MySQL 8 (ou la plus récente proposée)
   - Notez le nom de la base, l'utilisateur et le mot de passe
5. Patientez quelques minutes pendant la création

Valeurs à conserver :
- **Hôte** : `nom-de-votre-base.mysql.db` (et **pas** `localhost`)
- **Nom de la base** : par ex. `monprojet_db`
- **Utilisateur** : généralement identique au nom de la base
- **Mot de passe** : celui choisi à la création

---

## Étape 3 : importer le schéma de la base

Importez, dans cet ordre :

1. `sql/schema.sql` — tables et index
2. `sql/seed_init.sql` — clés de configuration indispensables et horaires par défaut

N'importez **pas** `sql/seed_test_data.sql` en production (prestations et rendez-vous de démonstration).

### Option A : phpMyAdmin (recommandé)

1. Dans l'espace client OVH, cliquez sur **...** à côté de la base → **Accéder à phpMyAdmin**
2. Connectez-vous avec les identifiants de la base
3. Sélectionnez la base dans la colonne de gauche
4. Onglet **Importer** : importez `sql/schema.sql`, puis `sql/seed_init.sql`

### Option B : client MySQL en ligne de commande

```bash
mysql -h nom-de-votre-base.mysql.db -u utilisateur -p nom-de-votre-base < sql/schema.sql
mysql -h nom-de-votre-base.mysql.db -u utilisateur -p nom-de-votre-base < sql/seed_init.sql
```

### Mettre à jour une base existante

`schema.sql` décrit toujours la structure la plus récente. Sur une base créée avec une version
antérieure, appliquez plutôt les scripts idempotents de `sql/migrations/`, dans l'ordre des dates
(ils peuvent être relancés sans risque). Le plus récent, `2026-10-21_item18_exception_requests.sql`,
ajoute les demandes hors zone validées par l'artisan.

---

## Étape 4 : configurer l'accès à la base

Créez un fichier `.env` dans le dossier `api/` (ou modifiez `api/config/config.php`) :

```env
DB_HOST=nom-de-votre-base.mysql.db
DB_PORT=3306
DB_NAME=nom-de-votre-base
DB_USER=utilisateur
DB_PASS=mot-de-passe
APP_ENV=production
CORS_ORIGIN=https://votre-domaine.com

# URL publique du site — sert aux liens envoyés par email : gestion du rendez-vous (client)
# et acceptation / refus des demandes hors zone (artisan)
APP_URL=https://votre-domaine.com
# Fuseau de référence de l'artisan : les dates stockées et les fichiers .ics s'y interprètent
APP_TIMEZONE=Europe/Paris
```

À défaut, renseignez directement les valeurs dans `api/config/config.php` (moins propre, mais
utile si la lecture du `.env` pose problème sur l'hébergement).

---

## Étape 4b : configurer l'envoi d'emails (SMTP)

Les emails de confirmation (client), les fiches d'intervention avec pièce jointe `.ics` (artisan)
et les demandes hors zone partent par un client SMTP natif, sans dépendance Composer. Ajoutez au
même fichier `api/.env` :

```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=mot-de-passe-de-la-boite
# starttls (port 587, recommandé), tls (port 465, TLS implicite) ou none
SMTP_SECURE=starttls
MAIL_FROM=contact@votre-domaine.com
MAIL_FROM_NAME=Nom de votre entreprise
```

À savoir :

- **Les identifiants ne sont jamais stockés en base.** Ils sont lus uniquement dans `.env` :
  l'espace Pro ne peut pas les divulguer et ils n'apparaissent dans aucune sauvegarde de la base.
- `MAIL_FROM` doit être une boîte de votre domaine : un envoi au nom d'une adresse tierce
  (gmail.com…) est rejeté par les contrôles SPF/DKIM.
- Si `SMTP_HOST` ou `MAIL_FROM` est vide, l'envoi est désactivé. Les réservations aboutissent
  quand même : chaque tentative est journalisée dans `appointment_notifications` avec le statut
  `failed` et un motif explicite, visible depuis le planning de l'espace Pro (bouton « Emails »).
- Un échec d'envoi ne bloque jamais une réservation. Les boutons « Renvoyer » du journal
  permettent de relancer une fois le SMTP corrigé.

---

## Étape 5 : envoyer les fichiers par FTP/SFTP

### Option A : FileZilla (interface graphique)

1. Téléchargez et installez [FileZilla](https://filezilla-project.org/)
2. Connectez-vous à l'hébergement :
   - **Hôte** : `ftp.votre-domaine.com` (ou `sftp.votre-domaine.com` en SFTP)
   - **Identifiant** : votre login FTP OVH
   - **Mot de passe** : votre mot de passe FTP OVH
   - **Port** : 21 (FTP) ou 22 (SFTP)
3. Placez-vous dans le dossier `www/` du serveur
4. Envoyez les fichiers et dossiers suivants (activez « afficher les fichiers cachés » pour les `.htaccess`) :

```
www/
├── .ovhconfig          ← configuration PHP OVH
├── .htaccess           ← réécriture d'URL (API + repli SPA)
├── index.html          ← point d'entrée React
└── api/
    ├── .htaccess       ← routage de l'API
    ├── .env            ← vos identifiants (créé à l'étape 4)
    ├── index.php       ← contrôleur frontal PHP
    ├── config/         ← chargement de la configuration
    ├── core/           ← base, routeur, envoi d'emails, créneaux, frais de déplacement…
    ├── controllers/
    ├── models/
    ├── routes/
    ├── storage/        ← logo, favicon et zone d'intervention (accessible en écriture, voir étape 6)
    │   ├── .htaccess
    │   ├── branding/
    │   └── zone/
    └── public/
        └── assets/     ← fichiers React compilés (JS, CSS)
```

`sql/`, `src/`, `node_modules/` et `scripts/` sont inutiles sur le serveur.

### Option B : ligne de commande (lftp)

```bash
lftp -u login-ftp,mot-de-passe-ftp ftp.votre-domaine.com << 'EOF'
mirror -R --parallel=10 --exclude node_modules --exclude .git --exclude src --exclude sql ./ www/
quit
EOF
```

### Option C : rsync via SFTP

```bash
rsync -avz --exclude node_modules --exclude .git --exclude src --exclude sql \
  ./ login-ftp@votre-domaine.com:www/
```

⚠️ Une fois le site en ligne, n'écrasez jamais `api/storage/` depuis votre machine : il contient
le logo, le favicon et la zone d'intervention enregistrés depuis l'espace Pro.

---

## Étape 6 : régler les droits des fichiers

Sur l'hébergement mutualisé OVH, les droits sont en général gérés automatiquement. Vérifiez tout de même :

- Fichiers PHP : `644` (lecture)
- Dossiers : `755`
- Fichiers de configuration : `600` (si possible, pour restreindre l'accès)

Dans FileZilla : clic droit sur le fichier → **Droits d'accès au fichier...** → valeur numérique.

### Dossiers accessibles en écriture

`api/storage/branding/` et `api/storage/zone/` doivent être **accessibles en écriture par PHP**
(`755`, ou `775` si l'enregistrement échoue). Ils ne sont pas versionnés, chaque installation a
ses propres fichiers : créez-les sur le serveur si votre envoi a ignoré les dossiers vides.
Le dossier n'est jamais servi directement (`api/storage/.htaccess` en interdit l'accès) : les
fichiers passent par l'API.

### Logo et favicon

L'espace Pro (Configuration → Identité de l'entreprise) enregistre le logo et le favicon dans
`api/storage/branding/`. On peut aussi les y déposer par FTP sous leurs noms usuels — le premier
présent est utilisé :

| Type    | Noms reconnus (par priorité)                   | Repli si absent              |
|---------|------------------------------------------------|------------------------------|
| Logo    | `logo.svg`, `logo.png`                         | Nom de l'entreprise en texte |
| Favicon | `favicon.png`, `favicon.svg`, `favicon.ico`    | Icône par défaut intégrée    |

Supprimer un fichier (depuis l'espace Pro ou par FTP) rétablit le repli. Les fichiers sont servis
par `/api/branding/logo` et `/api/branding/favicon`.

### Zone d'intervention

L'espace Pro (menu « Zone d'intervention » → « Calculer les communes ») enregistre les communes
retenues dans `api/storage/zone/service-area.geojson`. Après un premier déploiement, la carte de
la vitrine n'affiche que le repère de l'entreprise tant que la zone n'a pas été calculée et
enregistrée une fois. Les réservations sont ensuite limitées aux communes cochées. Le calcul
interroge l'API publique `geo.api.gouv.fr` depuis le navigateur.

---

## Étape 7 : vérifier le déploiement

### Tester l'API

```bash
# Configuration publique
curl https://votre-domaine.com/api/config

# Prestations disponibles
curl https://votre-domaine.com/api/services

# Jours réservables d'une prestation (remplacez 1 par un identifiant existant)
curl "https://votre-domaine.com/api/slots/availability?service_id=1"
```

### Tester le frontend

- `https://votre-domaine.com/` — la page vitrine
- `https://votre-domaine.com/booking` — le parcours de réservation
- `https://votre-domaine.com/admin` — l'espace Pro (artisan)

Faites ensuite une réservation de test et consultez le journal « Emails » du rendez-vous dans l'espace Pro.

---

## Étape 8 : activer HTTPS (SSL)

OVH fournit gratuitement des certificats SSL Let's Encrypt :

1. Espace client OVH → **Web Cloud** → **Hébergements** → votre offre
2. Onglet **Multisite**
3. Cliquez sur **...** à côté de votre domaine → **Modifier**
4. Activez le certificat **SSL**
5. Patientez quelques minutes
6. Facultatif : décommentez `https.force=1` dans `.ovhconfig` pour imposer HTTPS

---

## Dépannage

### « Database connection failed »

- Vérifiez que `DB_HOST` pointe vers l'hôte MySQL OVH (par ex. `nom-de-votre-base.mysql.db`), et non `localhost`
- Vérifiez le nom de la base, l'utilisateur et le mot de passe dans `config.php` ou `.env`
- Vérifiez que la base est créée et active dans l'espace client OVH

### Erreur 500 (Internal Server Error)

- Vérifiez `.ovhconfig` : la version de PHP doit être valide (par ex. `8.2`)
- Vérifiez que tous les fichiers PHP ont été envoyés entièrement
- Passez temporairement `APP_ENV=development` pour afficher le détail des erreurs

### L'API renvoie 404

- Vérifiez que les `.htaccess` ont été envoyés (les fichiers cachés sont souvent ignorés par défaut)
- Vérifiez que mod_rewrite est actif (c'est le cas par défaut chez OVH)
- Vérifiez la forme des URL : `/api/services`, `/api/config`, etc.

### Page blanche côté React

- Vérifiez la présence des fichiers compilés dans `api/public/assets/`
- Cherchez des erreurs 404 sur les fichiers JS/CSS dans la console du navigateur
- Vérifiez que `index.html` est à la racine de `www/` et référence les bons chemins

### Erreurs CORS dans la console

- Réglez `CORS_ORIGIN` dans `config.php` ou `.env` sur votre domaine exact (par ex. `https://votre-domaine.com`)
- Évitez `*` en production

### Les emails ne partent pas

- Ouvrez le journal « Emails » d'un rendez-vous dans l'espace Pro : le motif de l'échec y figure
- « Envoi d'emails non configuré » : `SMTP_HOST` ou `MAIL_FROM` manque dans `api/.env`
- Erreur d'authentification : vérifiez `SMTP_USER` / `SMTP_PASS` et le couple `SMTP_SECURE` / port

### Impossible d'enregistrer le logo, le favicon ou la zone

- `api/storage/branding/` ou `api/storage/zone/` manque ou n'est pas accessible en écriture par PHP (voir étape 6)

---

## Organisation du projet

```
crenelio/
├── .ovhconfig / .htaccess  # Version PHP OVH, réécriture d'URL (API + repli SPA)
├── docker-compose.yml      # Environnement local : MySQL, API PHP/Apache, Mailpit
├── index.html              # Point d'entrée HTML de React
├── src/                    # Code source React & TypeScript
│   ├── App.tsx             # Routes : /, /booking, /rdv/:token, /admin, /decision/:token
│   ├── pages/              # Vitrine, réservation, gestion du rendez-vous, espace Pro, décision
│   ├── components/         # Étapes de réservation, cartes, sections de la vitrine
│   │   └── admin/          # Espace Pro : mise en page, configuration, horaires, zone, nouveau rendez-vous…
│   ├── config/             # Schéma de l'écran de configuration, pictos des engagements
│   ├── utils/              # Mise en forme, recadrage d'images, calcul de la zone
│   └── styles/             # Sass modulaire (variables, mixins, composants, vitrine)
├── api/                    # API REST en PHP natif
│   ├── core/               # Database, Router, Response, SlotEngine, TravelFee, ServiceArea,
│   │                       # Mailer, Notifier, EmailTemplates, ICalendar, Branding
│   ├── controllers/        # Config, Service, Schedule, Slot, Appointment, TravelFee, Branding, Zone
│   ├── models/
│   ├── routes/api.php      # Routes REST
│   ├── storage/            # Logo, favicon, zone d'intervention (non versionnés)
│   └── public/assets/      # Bundle de production généré par Vite
├── sql/
│   ├── schema.sql          # Tables (source de vérité)
│   ├── seed_init.sql       # Clés de configuration et horaires indispensables
│   ├── seed_test_data.sql  # Données de démonstration (local uniquement)
│   └── migrations/         # Scripts idempotents pour les bases existantes
└── scripts/                # start.py / stop.py (environnement local)
```

---

## Développement local

```bash
npm install
npm start          # MySQL + API PHP + Mailpit (Docker) et Vite
# ou pas à pas :
docker compose up -d
npm run dev
```

- Vite : `http://localhost:5173` (relaie `/api/*` vers le conteneur PHP sur le port 8000)
- Espace Pro : `http://localhost:5173/admin`
- Base : `127.0.0.1:3306`, base `crenelio`, utilisateur `crenelio`, mot de passe `crenelio_dev`,
  initialisée avec le schéma, les clés indispensables et les données de démonstration
- Réinitialiser la base : `docker compose down -v && docker compose up -d`

### Emails en développement local

Docker Compose démarre **Mailpit**, un serveur SMTP de capture : tous les emails envoyés par
l'application (confirmations, demandes hors zone, décisions) s'affichent sur
`http://localhost:8025`, et rien ne sort de votre machine. Le conteneur PHP est préconfiguré
pour lui (`SMTP_HOST=mailpit`), et ces variables priment sur `api/.env`. Pour tester un vrai
serveur SMTP en local, retirez les lignes `SMTP_*` / `MAIL_FROM*` du service `api` dans
`docker-compose.yml`.
