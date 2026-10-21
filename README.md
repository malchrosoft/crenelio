# Crénelio

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Crénelio** est une application web open source et auto-hébergée de prise de rendez-vous en ligne, spécialement conçue pour les artisans, techniciens et professionnels intervenant à domicile (plomberie, électricité, dépannage, rénovation...).

Vos clients sélectionnent une prestation, choisissent un créneau disponible, valident leur adresse avec géolocalisation automatique, et confirment leur rendez-vous. Vous gérez vos prestations, vos horaires, vos indisponibilités et vos interventions depuis un espace pro sécurisé.

Conçu avec **React 18 / TypeScript**, **Sass (SCSS)**, **PHP 8.2 (natif)** et **MySQL**, Crénelio est optimisé pour un déploiement clé-en-main sur hébergement mutualisé **OVHcloud** sans surcoût d'infrastructure.

> **Crénelio** — *Réservez le créneau de votre intervention.*

---

## Fonctionnalités

### Parcours Client & Présentation
- **Page vitrine artisan (Homepage `/`)** :
  - Mise en valeur des prestations, de l'artisan, de ses engagements et de ses coordonnées.
  - Header adaptatif sticky (apparition dynamique après défilement du call-to-action principal).
  - Zone d'intervention interactive avec carte OpenStreetMap et tracés polygonaux GeoJSON officiels des communes couvertes.
  - Cartes de prestations avec accès direct au créneau correspondant (`/booking?service=:id`).
- **Réservation en ligne en 3 étapes (`/booking`)** :
  - **Choix de la prestation** : sélection avec durée, tarif indicatif et descriptif détaillé.
  - **Calendrier & créneaux en direct** : calcul dynamique des disponibilités en temps réel basé sur les horaires d'ouverture habituels, la durée de la prestation, le temps de battement/trajet (`buffer_minutes`), le préavis minimum et les congés/indisponibilités.
  - **Autocomplétion d'adresse BAN (Base Adresse Nationale)** :
    - Recherche prédictive en direct via l'API officielle `api-adresse.data.gouv.fr`.
    - Remplissage automatique des champs (adresse, code postal, ville).
    - Détection et enregistrement des coordonnées GPS précises (`[latitude, longitude]`).
  - **Cartographie OpenStreetMap intégrée** :
    - Intégration cartographique légère avec **Pigeon Maps** (sans clé API tierce).
    - Centrage initial par défaut sur la commune d'activité de l'artisan (ex: Clamart `[48.8000, 2.2625]`), paramétrable dans la base de données.
    - Positionnement interactif d'un marqueur sur le lieu exact de l'intervention.
- **Confirmation & suivi** : récapitulatif complet de l'intervention avec token unique d'annulation/suivi.
- **Pied de page & Mentions légales** : informations légales obligatoires et modale dédiée pré-configurée.

### Espace Professionnel / Administration
- **Authentification sécurisée** : mot de passe fort (hachage Bcrypt).
- **Double authentification (2FA)** — 🚧 *en cours de développement* : code OTP temporaire à 6 chiffres par email (valide 15 min), avec mémorisation des appareils de confiance pendant 10 jours.
- **Planning des interventions** : suivi des rendez-vous par statut (`confirmed`, `completed`, `cancelled`, `pending`) avec coordonnées client et notes d'accès.
- **Gestion du catalogue de prestations** : ajout, édition inline, descriptif d'intervention, prix, durée et suppression protégée.
- **Configuration dynamique en base de données** : nom d'entreprise, coordonnées de contact, zone de chalandise, coordonnées GPS et zoom par défaut de la carte.

---

## Pile Technologique (Tech Stack)

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, React Router 7, Sass (SCSS BEM/modulaire), @phosphor-icons/react, Pigeon Maps, Date-fns |
| **Backend** | PHP 8.2 natif (Architecture MVC propre, PDO requêtes préparées, sans dépendance lourde) |
| **Base de données** | MySQL 8.0+ / MariaDB (InnoDB, UTF-8 mb4) |
| **Géocodage & Cartes**| Base Adresse Nationale (BAN data.gouv.fr) + OpenStreetMap via Pigeon Maps (avec GeoJSON des communes) |
| **Hébergement cible** | OVHcloud Hébergement Web mutualisé (Perso / Pro / Performance) ou serveur dédié |

---

## Démarrage Rapide

### Prérequis
- **Node.js 18+** & npm
- **Python 3.8+** (utilisé pour les scripts multiplateformes `start.py` / `stop.py`, sans dépendance externe)
- **Docker & Docker Compose** (gère MySQL 8 et l'API PHP 8.2 nativement)

### Installation Locale

```bash
# 1. Cloner le projet
git clone git@github.com:malchrosoft/crenelio.git
cd crenelio

# 2. Installer les dépendances du frontend
npm install

# 3. Lancer l'environnement complet (DB Docker + API PHP + Frontend Vite)
npm start

# Pour arrêter proprement l'ensemble des services :
npm stop
```

L'application est directement accessible sur `http://localhost:5173`. L'API backend répond sur `http://localhost:8000/api`.

### Build de Production

```bash
npm run build
```

Le bundle optimisé est généré directement dans `api/public/assets/`, prêt à être distribué par le serveur web.

> `vite build` ne contrôle pas les types (esbuild se contente de les effacer).
> Lancer `npx tsc --noEmit` en complément avant tout commit.

---

## Configuration (`api/.env`)

Le backend lit sa configuration depuis `api/.env` (gabarit : `api/.env.example`), avec repli sur
les variables d'environnement du serveur. **Aucun secret n'est stocké en base de données.**

```env
# -------------------------------------------------------------------
# Base de données
# -------------------------------------------------------------------
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=crenelio
DB_USER=crenelio
DB_PASS=
DB_CHARSET=utf8mb4

# -------------------------------------------------------------------
# Application
# -------------------------------------------------------------------
APP_ENV=development            # development | production
CORS_ORIGIN=*                  # en production : https://votre-domaine.com
# URL publique du site — sert à construire le lien de gestion envoyé au client
APP_URL=https://votre-domaine.com
# Fuseau de référence de l'artisan : les datetimes stockés en base et les
# fichiers .ics s'interprètent dans ce fuseau
APP_TIMEZONE=Europe/Paris

# -------------------------------------------------------------------
# Envoi d'emails (SMTP)
# -------------------------------------------------------------------
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=
SMTP_SECURE=starttls           # starttls (587) | tls (465, implicite) | none
MAIL_FROM=contact@votre-domaine.com
MAIL_FROM_NAME=Crénelio
```

| Variable | Défaut | Rôle |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | `localhost` / `3306` / — | Connexion MySQL (PDO) |
| `APP_ENV` | `production` | `development` active l'affichage des erreurs PHP |
| `CORS_ORIGIN` | `*` | Origine autorisée ; à restreindre au domaine en production |
| `APP_URL` | *(vide)* | Base des liens envoyés par email : `/rdv/:token` (client) et `/decision/:token` (acceptation / refus d'une demande hors zone par l'artisan). Vide ⇒ l'email client affiche le téléphone, et l'artisan valide la demande depuis le planning (statut « En attente ») |
| `APP_TIMEZONE` | `Europe/Paris` | Fuseau d'interprétation des créneaux et des fichiers `.ics` |
| `SMTP_HOST` / `SMTP_PORT` | *(vide)* / `587` | Serveur d'envoi. **Vide ⇒ envoi désactivé** |
| `SMTP_USER` / `SMTP_PASS` | *(vide)* | Identifiants `AUTH LOGIN` ; laisser vide pour un relais sans authentification |
| `SMTP_SECURE` | `starttls` | `starttls` (587), `tls` (465, TLS implicite) ou `none` |
| `MAIL_FROM` / `MAIL_FROM_NAME` | *(vide)* / `Crénelio` | Expéditeur. Doit appartenir au domaine, sinon rejet SPF/DKIM |

**Sans `SMTP_HOST` ou `MAIL_FROM`, l'envoi est simplement désactivé** : les réservations
aboutissent normalement et chaque tentative est journalisée en `failed` avec un motif explicite,
consultable depuis l'Espace Pro (bouton « Emails » d'un rendez-vous) et relançable manuellement.

---

## Endpoints de l'API REST (`/api`)

### Configuration & Authentification
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/config` | Configuration publique (nom pro, coordonnées, centrage carte) |
| `GET` | `/api/admin/config` | Configuration complète (espace pro) |
| `PUT` | `/api/admin/config` | Mise à jour des réglages artisan |
| `POST` | `/api/admin/login` | Authentification administrateur |

### Prestations & Créneaux
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/services` | Liste des prestations actives |
| `POST` | `/api/services` | Ajouter une prestation (espace pro) |
| `PUT` | `/api/services/:id` | Modifier une prestation |
| `DELETE` | `/api/services/:id` | Supprimer une prestation |
| `GET` | `/api/slots?service_id=1&date=YYYY-MM-DD` | Calcul temps réel des créneaux libres |
| `POST` | `/api/travel-fee/quote` | Devis des frais de déplacement pour une prestation et une adresse géocodée |

### Horaires & Disponibilités
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/schedules` | Horaires hebdomadaires habituels |
| `PUT` | `/api/schedules/:day` | Modifier les horaires d'un jour (1=Lundi .. 7=Dimanche) |
| `GET` | `/api/unavailabilities` | Liste des congés et fermetures exceptionnelles |
| `POST` | `/api/unavailabilities` | Poser une indisponibilité |
| `DELETE` | `/api/unavailabilities/:id` | Supprimer une indisponibilité |

### Rendez-vous
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/appointments` | Liste des rendez-vous (espace pro) |
| `POST` | `/api/appointments` | Réservation d'un créneau (client) |
| `GET` | `/api/appointments/token/:token` | Consultation d'un rendez-vous via son token |
| `POST` | `/api/appointments/token/:token/cancel` | Annulation d'un rendez-vous par le client |
| `GET` | `/api/appointments/:id` | Détail d'un rendez-vous (espace pro) |
| `PUT` | `/api/appointments/:id/status` | Modification du statut (confirmed, completed, cancelled) |
| `PUT` | `/api/appointments/:id/reschedule` | Reprogrammation (l'heure de fin suit la durée de la prestation) |
| `GET` | `/api/appointments/:id/notifications` | Journal des emails envoyés pour ce rendez-vous |
| `POST` | `/api/appointments/:id/notifications/resend` | Relance manuelle d'un email (`client_confirmation` ou `pro_confirmation`) |

---

## Déploiement

Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide de déploiement pas à pas sur hébergement OVHcloud (FTP/SFTP, configuration `.ovhconfig`, mise en place de la base de données et HTTPS Let's Encrypt).

---

## Feuille de Route & Évolutions Futures

Consultez [ROADMAP.md](ROADMAP.md) pour le suivi des fonctionnalités prévues (frais de déplacement, theming & effets graphiques, page vitrine, emails & iCal, RGPD, logo & mentions légales).

---

## Licence

Ce projet est sous licence **GNU Affero General Public License v3.0** ([AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.fr.html)). Consultez le fichier [LICENSE](LICENSE) pour plus d'informations.
