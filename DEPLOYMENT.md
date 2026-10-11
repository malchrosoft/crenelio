# Deployment Guide — OVHcloud Shared Hosting

This guide walks you through deploying the React + PHP + MySQL boilerplate to an OVHcloud shared hosting plan (Perso, Pro, or Performance).

---

## Prerequisites

- An OVHcloud Web Hosting plan (Perso or higher)
- Node.js 18+ installed locally (for building React)
- An FTP/SFTP client (FileZilla, WinSCP, Cyberduck, or `lftp` CLI)
- Your OVH FTP/SFTP credentials (found in the OVH control panel)

---

## Step 1: Build the React Frontend

From the project root on your local machine:

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build
```

This compiles React into optimized static files in `api/public/assets/`. You should see `index.html` and bundled JS/CSS files.

---

## Step 2: Create the MySQL Database on OVH

1. Log in to the [OVH Control Panel](https://www.ovh.com/manager/)
2. Navigate to: **Web Cloud** → **Hosting Plans** → select your plan
3. Go to the **Databases** tab
4. Click **Create a database**
   - Choose MySQL 8 (or latest available)
   - Note the database name, username, and password
5. Wait for the database to be created (a few minutes)

You'll need these values:
- **Host**: `your-db-name.mysql.db` (NOT `localhost`)
- **Database name**: e.g., `myproject_db`
- **Username**: usually same as database name
- **Password**: the one you set during creation

---

## Step 3: Import the Database Schema

### Option A: phpMyAdmin (recommended)

1. In the OVH control panel, click **...** next to your database → **Go to phpMyAdmin**
2. Log in with your database credentials
3. Select your database in the left sidebar
4. Go to the **Import** tab
5. Choose the file `sql/schema.sql` from this project
6. Click **Go** to execute

### Option B: MySQL CLI

```bash
mysql -h your-db-name.mysql.db -u your-db-user -p your-db-name < sql/schema.sql
```

---

## Step 4: Configure Database Credentials

Create a `.env` file in the `api/` directory (or update `api/config/config.php`):

```env
DB_HOST=your-db-name.mysql.db
DB_PORT=3306
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASS=your-db-password
APP_ENV=production
CORS_ORIGIN=https://your-domain.com

# Public site URL — used to build the appointment management link sent by email
APP_URL=https://your-domain.com
# Artisan reference timezone: stored datetimes and .ics files are interpreted here
APP_TIMEZONE=Europe/Paris
```

Alternatively, edit `api/config/config.php` directly and hardcode the values (less ideal but works on shared hosting where `.env` parsing might need adjustments).

---

## Step 4b: Configure Email Sending (SMTP)

Confirmation emails (client) and intervention sheets with an `.ics` attachment
(artisan) go out through a native SMTP client — no Composer dependency. Add the
following to the same `api/.env` file:

```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@your-domain.com
SMTP_PASS=your-mailbox-password
# starttls (port 587, recommended), tls (port 465, implicit TLS) or none
SMTP_SECURE=starttls
MAIL_FROM=contact@your-domain.com
MAIL_FROM_NAME=Your Company Name
```

Notes:

- **Credentials never live in the database.** They are read from `.env` only, so
  the Pro area cannot leak them and they are not part of any backup dump.
- `MAIL_FROM` should be a mailbox belonging to your domain — sending as a
  third-party address (gmail.com, etc.) gets rejected by SPF/DKIM checks.
- Leaving `SMTP_HOST` or `MAIL_FROM` empty disables sending. Bookings still
  succeed: every attempt is logged in `appointment_notifications` with an
  explicit `failed` status, visible from the Pro planning ("Emails" button).
- A failed send never breaks a booking. Use the "Renvoyer" buttons in the
  notification log to retry once the SMTP settings are fixed.

---

## Step 5: Upload Files via FTP/SFTP

### Option A: FileZilla (GUI)

1. Download and install [FileZilla](https://filezilla-project.org/)
2. Connect to your OVH hosting:
   - **Host**: `ftp.your-domain.com` (or `sftp.your-domain.com` for SFTP)
   - **Username**: your OVH FTP login (e.g., `your-ftp-login`)
   - **Password**: your OVH FTP password
   - **Port**: 21 (FTP) or 22 (SFTP)
3. Navigate to the `www/` directory on the remote server
4. Upload the following files and directories:

```
www/
├── .ovhconfig          ← OVH PHP configuration
├── .htaccess           ← URL rewriting rules
├── index.html          ← React entry point
├── api/
│   ├── .htaccess       ← API routing
│   ├── index.php       ← PHP front controller
│   ├── config/
│   │   └── config.php  ← (with your DB credentials)
│   ├── core/
│   │   ├── Database.php
│   │   ├── Router.php
│   │   └── Response.php
│   ├── controllers/
│   │   └── UserController.php
│   ├── models/
│   │   └── User.php
│   ├── routes/
│   │   └── api.php
│   └── public/
│       └── assets/     ← Built React files (JS, CSS)
└── sql/                ← (optional, not needed in production)
```

### Option B: Command Line (lftp)

```bash
# Using lftp for scripted upload
lftp -u your-ftp-login,your-ftp-password ftp.your-domain.com << 'EOF'
mirror -R --parallel=10 --exclude node_modules --exclude .git --exclude .env www/ www/
quit
EOF
```

### Option C: rsync over SFTP

```bash
rsync -avz --exclude node_modules --exclude .git --exclude .env \
  ./ your-ftp-login@your-domain.com:www/
```

---

## Step 6: Set File Permissions

On OVH shared hosting, permissions are generally managed automatically. However, ensure:

- PHP files: `644` (readable)
- Directories: `755`
- Config files: `600` (if supported, to restrict access)

If using FileZilla, right-click files → **File permissions...** → set numeric value.

---

## Step 7: Verify the Deployment

### Test the API

Open your browser or use curl:

```bash
# Tester la configuration publique
curl https://your-domain.com/api/config

# Lister les prestations disponibles
curl https://your-domain.com/api/services

# Vérifier le calcul des créneaux (exemple pour service 1)
curl "https://your-domain.com/api/slots?service_id=1&date=$(date +%Y-%m-%d)"
```

### Test the Frontend

Visit `https://your-domain.com/` — you should see the React app with the user management interface.

---

## Step 8: Enable HTTPS (SSL)

OVH provides free Let's Encrypt SSL certificates:

1. OVH Control Panel → **Web Cloud** → **Hosting Plans** → your plan
2. Go to **Multisite** tab
3. Click **...** next to your domain → **Modify**
4. Enable **SSL** certificate
5. Wait a few minutes for activation
6. Optionally uncomment `https.force=1` in `.ovhconfig` to enforce HTTPS

---

## Troubleshooting

### "Database connection failed"

- Verify `DB_HOST` is set to your OVH MySQL host (e.g., `your-db-name.mysql.db`), not `localhost`
- Check that the database name, username, and password are correct in `config.php` or `.env`
- Ensure the database is created and active in the OVH control panel

### 500 Internal Server Error

- Check the `.ovhconfig` file — ensure PHP version is valid (e.g., `8.2`)
- Verify all PHP files were uploaded correctly (no truncation)
- Temporarily set `APP_ENV=development` in config to see error details

### API returns 404

- Ensure `.htaccess` is uploaded (hidden files may be skipped by default in FTP clients — enable "show hidden files" in FileZilla)
- Verify mod_rewrite is enabled (it is by default on OVH)
- Check that the URL structure matches: `/api/users`, `/api/users/1`, etc.

### React app shows blank page

- Verify the built assets exist in `api/public/assets/`
- Check browser console for 404 errors on JS/CSS files
- Ensure `index.html` is in the `www/` root and references the correct asset paths

### CORS errors in browser console

- Update `CORS_ORIGIN` in `config.php` or `.env` to your exact domain (e.g., `https://your-domain.com`)
- Avoid using `*` in production

---

## Project Structure Overview

```
crenelio/
├── .ovhconfig              # OVH PHP version & environment config
├── .htaccess               # Root URL rewriting (API + SPA fallback)
├── .env.example            # Template for environment variables
├── .gitignore
├── index.html              # React HTML entry point
├── package.json            # Node.js / React dependencies
├── vite.config.js          # Vite build configuration
├── src/                    # Code source React & TypeScript
│   ├── main.tsx            # Point d'entrée React
│   ├── App.tsx             # Composant principal (flux de réservation & espace pro)
│   ├── api.ts              # Client API REST typé
│   ├── types.ts            # Définitions TypeScript
│   ├── styles/             # Architecture Sass modulaire
│   │   ├── main.scss       # Import principal
│   │   ├── _variables.scss # Variables couleurs, ombres, rayons
│   │   ├── _mixins.scss    # Mixins responsive & layout
│   │   ├── _base.scss      # Reset & structure générale
│   │   └── _components.scss# Styles composants (cartes, calendrier, boutons)
│   └── components/
│       ├── AddressAutocomplete.tsx # Autocomplétion BAN (api-adresse.data.gouv.fr)
│       ├── InterventionMap.tsx     # Carte OpenStreetMap (Pigeon Maps)
│       ├── ServiceSelector.tsx     # Étape 1 : sélection de la prestation
│       ├── CalendarPicker.tsx      # Calendrier personnalisé
│       ├── SlotPicker.tsx          # Étape 2 : sélection de la date et de l'heure
│       ├── BookingForm.tsx         # Étape 3 : coordonnées et adresse avec carte
│       ├── BookingConfirmation.tsx # Étape 4 : récapitulatif du rendez-vous
│       └── AdminDashboard.tsx      # Espace Pro d'administration
├── api/                    # API REST PHP native
│   ├── .htaccess           # Réécriture d'URL
│   ├── index.php           # Front controller
│   ├── config/
│   │   └── config.php       # Connexion PDO & configuration
│   ├── core/
│   │   ├── Database.php     # Singleton PDO
│   │   ├── Router.php       # Routeur REST par regex
│   │   └── Response.php     # Réponses JSON & gestion CORS
│   ├── controllers/
│   │   ├── ConfigController.php      # Paramètres pro & login
│   │   ├── ServiceController.php     # Catalogue de prestations
│   │   ├── ScheduleController.php    # Horaires hebdomadaires & congés
│   │   ├── SlotController.php        # Algorithme de calcul des créneaux
│   │   └── AppointmentController.php # Gestion des rendez-vous
│   ├── models/
│   │   ├── Config.php
│   │   ├── Service.php
│   │   ├── Schedule.php
│   │   ├── Unavailability.php
│   │   └── Appointment.php
│   ├── routes/
│   │   └── api.php          # Déclaration des routes REST
│   └── public/
│       └── assets/          # Bundle de production généré par Vite
├── sql/
│   └── schema.sql           # MySQL database schema + seed data
├── scripts/
│   └── build.sh             # Build script (npm install + vite build)
└── DEPLOYMENT.md            # This file
```

---

## Local Development

### Start the PHP dev server

```bash
# From the api/ directory
cd api
php -S localhost:8000
```

### Start the Vite dev server (in another terminal)

```bash
# From the project root
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:8000` (configured in `vite.config.js`). Open the URL shown by Vite (usually `http://localhost:5173`).

### Local database

Lancer la base de données packagée avec Docker Compose :

```bash
docker compose up -d db
```

La base `crenelio` est automatiquement initialisée avec le schéma et les données de test.

Renseignez votre fichier local `api/.env` :

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=crenelio
DB_USER=crenelio
DB_PASS=crenelio_dev
APP_ENV=development
```
