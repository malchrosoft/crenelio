# Crénelio

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Crénelio** est une webapp open source légère de prise de rendez-vous pour techniciens, artisans et auto-entrepreneurs intervenant à domicile.

Vos clients réservent un créneau en ligne ; vous gérez vos disponibilités, vos prestations et votre planning depuis une interface simple.

Construite avec **React**, **PHP** et **MySQL**, Crénelio est pensée pour un déploiement simple sur un hébergement OVHcloud, sans infrastructure complexe.

> **Crénelio** — *Réservez le créneau de votre intervention.*

## Project

A lightweight starter project combining a **React SPA frontend**, a **native PHP REST API** (PDO + clean routing), and a **MySQL database layer** — designed for seamless deployment on **OVHcloud shared hosting**.

## Features

- **React 18** frontend with Vite (fast HMR, optimized production builds)
- **Native PHP REST API** — no framework overhead, just clean routing with regex patterns
- **PDO database layer** with prepared statements (SQL injection safe)
- **Sample CRUD schema** (users table with name, email, role)
- **Pre-configured `.ovhconfig`** for OVH PHP 8.2 + environment settings
- **`.htaccess` rewrite rules** for API routing and SPA fallback
- **Build script** that bundles React into static assets served via PHP
- **Step-by-step deployment guide** for FTP/SFTP to OVH web hosting

## Quick Start

### Prerequisites

- Node.js 18+
- PHP 8.0+ (for local development)
- MySQL 8.0+ / MariaDB (local or OVH)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config and edit with your DB credentials
cp .env.example .env

# 3. Import the database schema
mysql -h 127.0.0.1 -u root -p your_db_name < sql/schema.sql

# 4. Start the PHP API server (terminal 1)
cd api && php -S localhost:8000

# 5. Start the Vite dev server (terminal 2)
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

### Production Build

```bash
npm run build
```

This generates optimized static files in `api/public/assets/`.

## API Endpoints

| Method   | Endpoint         | Description          |
|----------|------------------|----------------------|
| `GET`    | `/api/users`     | List all users       |
| `GET`    | `/api/users/:id` | Get a single user    |
| `POST`   | `/api/users`     | Create a new user    |
| `PUT`    | `/api/users/:id` | Update a user        |
| `DELETE` | `/api/users/:id` | Delete a user        |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step guide covering:

- Building the React frontend
- Creating the MySQL database on OVH
- Importing the schema via phpMyAdmin
- Configuring database credentials
- Uploading via FTP/SFTP (FileZilla, lftp, rsync)
- Enabling HTTPS with Let's Encrypt
- Troubleshooting common issues

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite 5                    |
| Backend    | Native PHP 8.2 (PDO, no framework)  |
| Database   | MySQL 8 / MariaDB                   |
| Hosting    | OVHcloud Shared Hosting             |
| Build      | Vite (Rollup)                       |

## Licence

Ce projet est sous licence **GNU Affero General Public License v3.0** ([AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.fr.html)). Consultez le fichier [LICENSE](LICENSE) pour plus d'informations.
