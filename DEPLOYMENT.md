# Deployment Guide — OVHcloud Shared Hosting

🇬🇧 English · [🇫🇷 Français](DEPLOYMENT.fr.md)

This guide walks you through deploying Crénelio (React + native PHP + MySQL) to an OVHcloud
shared hosting plan (Perso, Pro, or Performance).

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

# Check types (vite build does not), then build the production bundle
npx tsc --noEmit
npm run build
```

This compiles React into optimized static files in `api/public/assets/`.

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

Import, in this order:

1. `sql/schema.sql` — tables and indexes
2. `sql/seed_init.sql` — required configuration keys and default weekly hours

Do **not** import `sql/seed_test_data.sql` in production (demo services and appointments).

### Option A: phpMyAdmin (recommended)

1. In the OVH control panel, click **...** next to your database → **Go to phpMyAdmin**
2. Log in with your database credentials
3. Select your database in the left sidebar
4. Go to the **Import** tab, import `sql/schema.sql`, then `sql/seed_init.sql`

### Option B: MySQL CLI

```bash
mysql -h your-db-name.mysql.db -u your-db-user -p your-db-name < sql/schema.sql
mysql -h your-db-name.mysql.db -u your-db-user -p your-db-name < sql/seed_init.sql
```

### Updating an existing database

`schema.sql` always describes the latest structure. On a database created with an earlier
version, apply the idempotent scripts of `sql/migrations/` instead, in date order (they can be
re-run safely). The latest one, `2026-10-21_item18_exception_requests.sql`, adds out-of-zone
requests validated by the artisan.

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

# Public site URL — used for links sent by email: appointment management (client)
# and accept / refuse of out-of-zone requests (artisan)
APP_URL=https://your-domain.com
# Artisan reference timezone: stored datetimes and .ics files are interpreted here
APP_TIMEZONE=Europe/Paris
```

Alternatively, edit `api/config/config.php` directly and hardcode the values (less ideal but works
on shared hosting where `.env` parsing might need adjustments).

---

## Step 4b: Configure Email Sending (SMTP)

Confirmation emails (client), intervention sheets with an `.ics` attachment (artisan) and
out-of-zone requests go out through a native SMTP client — no Composer dependency. Add the
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

- **Credentials never live in the database.** They are read from `.env` only, so the Pro area
  cannot leak them and they are not part of any backup dump.
- `MAIL_FROM` should be a mailbox belonging to your domain — sending as a third-party address
  (gmail.com, etc.) gets rejected by SPF/DKIM checks.
- Leaving `SMTP_HOST` or `MAIL_FROM` empty disables sending. Bookings still succeed: every
  attempt is logged in `appointment_notifications` with an explicit `failed` status, visible from
  the Pro planning ("Emails" button).
- A failed send never breaks a booking. Use the "Renvoyer" buttons in the notification log to
  retry once the SMTP settings are fixed.

---

## Step 5: Upload Files via FTP/SFTP

### Option A: FileZilla (GUI)

1. Download and install [FileZilla](https://filezilla-project.org/)
2. Connect to your OVH hosting:
   - **Host**: `ftp.your-domain.com` (or `sftp.your-domain.com` for SFTP)
   - **Username**: your OVH FTP login
   - **Password**: your OVH FTP password
   - **Port**: 21 (FTP) or 22 (SFTP)
3. Navigate to the `www/` directory on the remote server
4. Upload the following files and directories (enable "show hidden files" for `.htaccess`):

```
www/
├── .ovhconfig          ← OVH PHP configuration
├── .htaccess           ← URL rewriting (API + SPA fallback)
├── index.html          ← React entry point
└── api/
    ├── .htaccess       ← API routing
    ├── .env            ← your credentials (created at step 4)
    ├── index.php       ← PHP front controller
    ├── config/         ← configuration loading
    ├── core/           ← database, router, mailer, slot engine, travel fees…
    ├── controllers/
    ├── models/
    ├── routes/
    ├── storage/        ← logo, favicon and service area (writable, see step 6)
    │   ├── .htaccess
    │   ├── branding/
    │   └── zone/
    └── public/
        └── assets/     ← built React files (JS, CSS)
```

`sql/`, `src/`, `node_modules/` and `scripts/` are not needed on the server.

### Option B: Command Line (lftp)

```bash
lftp -u your-ftp-login,your-ftp-password ftp.your-domain.com << 'EOF'
mirror -R --parallel=10 --exclude node_modules --exclude .git --exclude src --exclude sql ./ www/
quit
EOF
```

### Option C: rsync over SFTP

```bash
rsync -avz --exclude node_modules --exclude .git --exclude src --exclude sql \
  ./ your-ftp-login@your-domain.com:www/
```

⚠️ Never overwrite `api/storage/` from your machine once the site is live: it holds the logo,
favicon and service area saved from the Pro area.

---

## Step 6: Set File Permissions

On OVH shared hosting, permissions are generally managed automatically. However, ensure:

- PHP files: `644` (readable)
- Directories: `755`
- Config files: `600` (if supported, to restrict access)

If using FileZilla, right-click files → **File permissions...** → set numeric value.

### Writable storage

`api/storage/branding/` and `api/storage/zone/` must be **writable by PHP** (`755`, or `775` if
saving fails). They are not versioned (each installation has its own files): create them on the
server if your upload skipped the empty folders. The folder is never served directly
(`api/storage/.htaccess` denies access); files go through the API.

### Logo & favicon

The Pro area (Configuration → Company identity) writes the logo and favicon to
`api/storage/branding/`. Files can also be dropped there by FTP under their usual names — the
first one present wins:

| Type    | Recognized names (priority order)              | Fallback when absent        |
|---------|------------------------------------------------|-----------------------------|
| Logo    | `logo.svg`, `logo.png`                         | Company name as text        |
| Favicon | `favicon.png`, `favicon.svg`, `favicon.ico`    | Built-in default icon       |

Deleting a file (from the Pro area or by FTP) restores the fallback. Files are served through
`/api/branding/logo` and `/api/branding/favicon`.

### Service area

The Pro area (menu "Zone d'intervention" → "Calculer les communes") saves the selected communes
to `api/storage/zone/service-area.geojson`. After a first deployment, the vitrine map shows only
the company marker until the zone is computed and saved once. Bookings are then restricted to
the selected communes. The computation calls the public API `geo.api.gouv.fr` from the browser.

---

## Step 7: Verify the Deployment

### Test the API

```bash
# Public configuration
curl https://your-domain.com/api/config

# Available services
curl https://your-domain.com/api/services

# Bookable days for a service (replace 1 with an existing service id)
curl "https://your-domain.com/api/slots/availability?service_id=1"
```

### Test the Frontend

- `https://your-domain.com/` — the vitrine (showcase) page
- `https://your-domain.com/booking` — the booking flow
- `https://your-domain.com/admin` — the Pro area (artisan)

Then make a test booking and check the "Emails" log of the appointment in the Pro area.

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

- Ensure `.htaccess` files are uploaded (hidden files may be skipped by default in FTP clients)
- Verify mod_rewrite is enabled (it is by default on OVH)
- Check that the URL structure matches: `/api/services`, `/api/config`, etc.

### React app shows blank page

- Verify the built assets exist in `api/public/assets/`
- Check browser console for 404 errors on JS/CSS files
- Ensure `index.html` is in the `www/` root and references the correct asset paths

### CORS errors in browser console

- Update `CORS_ORIGIN` in `config.php` or `.env` to your exact domain (e.g., `https://your-domain.com`)
- Avoid using `*` in production

### Emails are not sent

- Open the "Emails" log of an appointment in the Pro area: the failure reason is shown there
- "Envoi d'emails non configuré": `SMTP_HOST` or `MAIL_FROM` is missing from `api/.env`
- Authentication errors: check `SMTP_USER` / `SMTP_PASS` and the `SMTP_SECURE` / port pair

### Logo, favicon or service area cannot be saved

- `api/storage/branding/` or `api/storage/zone/` is missing or not writable by PHP (see step 6)

---

## Project Structure Overview

```
crenelio/
├── .ovhconfig / .htaccess  # OVH PHP version, URL rewriting (API + SPA fallback)
├── docker-compose.yml      # Local environment: MySQL, PHP/Apache API, Mailpit
├── index.html              # React HTML entry point
├── src/                    # React & TypeScript source
│   ├── App.tsx             # Routes: /, /booking, /rdv/:token, /admin, /decision/:token
│   ├── pages/              # Vitrine, booking, appointment management, Pro area, decision
│   ├── components/         # Booking steps, maps, vitrine sections
│   │   └── admin/          # Pro area: layout, configuration, hours, zone, new appointment…
│   ├── config/             # Configuration screen schema, engagement icons
│   ├── utils/              # Formatting, image crop, service area computation
│   └── styles/             # Modular Sass (variables, mixins, components, vitrine)
├── api/                    # Native PHP REST API
│   ├── core/               # Database, Router, Response, SlotEngine, TravelFee, ServiceArea,
│   │                       # Mailer, Notifier, EmailTemplates, ICalendar, Branding
│   ├── controllers/        # Config, Service, Schedule, Slot, Appointment, TravelFee, Branding, Zone
│   ├── models/
│   ├── routes/api.php      # REST routes
│   ├── storage/            # Logo, favicon, service area (not versioned)
│   └── public/assets/      # Production bundle built by Vite
├── sql/
│   ├── schema.sql          # Tables (source of truth)
│   ├── seed_init.sql       # Required configuration keys and hours
│   ├── seed_test_data.sql  # Demo data (local only)
│   └── migrations/         # Idempotent scripts for existing databases
└── scripts/                # start.py / stop.py (local environment)
```

---

## Local Development

```bash
npm install
npm start          # MySQL + PHP API + Mailpit (Docker) and Vite
# or step by step:
docker compose up -d
npm run dev
```

- Vite: `http://localhost:5173` (proxies `/api/*` to the PHP container on port 8000)
- Pro area: `http://localhost:5173/admin`
- Database: `127.0.0.1:3306`, database `crenelio`, user `crenelio`, password `crenelio_dev`,
  initialised with the schema, the required keys and the demo data
- Reset the database: `docker compose down -v && docker compose up -d`

### Emails in local development

Docker Compose starts **Mailpit**, a capture SMTP server: every email sent by the application
(confirmations, out-of-zone requests, decisions) shows up at `http://localhost:8025` and nothing
leaves your machine. The PHP container is preconfigured for it (`SMTP_HOST=mailpit`), and these
variables take precedence over `api/.env`. To test a real SMTP server locally, remove the
`SMTP_*` / `MAIL_FROM*` lines from the `api` service in `docker-compose.yml`.
