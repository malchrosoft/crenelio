# Crénelio

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Crénelio** est une application web open source et auto-hébergée de prise de rendez-vous en ligne, spécialement conçue pour les artisans, techniciens et professionnels intervenant à domicile (plomberie, électricité, dépannage, rénovation...).

Vos clients sélectionnent une prestation, choisissent un créneau disponible, valident leur adresse avec géolocalisation automatique, et confirment leur rendez-vous. Vous gérez vos prestations, vos horaires, votre zone d'intervention et vos rendez-vous depuis l'espace Artisan.

Conçu avec **React 18 / TypeScript**, **Sass (SCSS)**, **PHP 8.2 (natif)** et **MySQL**, Crénelio est optimisé pour un déploiement clé-en-main sur hébergement mutualisé **OVHcloud** sans surcoût d'infrastructure.

> **Crénelio** — *Réservez le créneau de votre intervention.*

---

## Fonctionnalités

### Parcours Client & Présentation
- **Page vitrine artisan (`/`)** :
  - Hero avec logo, prestations, présentation, engagements (pictos choisis ou déduits du texte) et coordonnées.
  - Header fixe qui apparaît une fois le bouton principal du hero dépassé.
  - Carte de la zone d'intervention : communes desservies (contours officiels), repère sur l'adresse de l'entreprise (ou du siège), bouton « Centrer sur toutes les communes ».
  - Mode « sans déplacement » : section « Nous trouver » avec l'adresse des locaux.
  - Titre de l'onglet et favicon repris de la configuration.
- **Réservation en ligne en 3 étapes (`/booking`)** :
  - **Choix de la prestation** : durée, tarif indicatif et descriptif.
  - **Calendrier & créneaux en direct** : jours sans créneau grisés ; créneaux calculés à partir des horaires de travail, de la durée de la prestation, du temps de trajet entre deux interventions, du délai minimal et des indisponibilités. Le serveur refuse tout créneau non proposé.
  - **Adresse BAN (Base Adresse Nationale)** : autocomplétion via `api-adresse.data.gouv.fr`, coordonnées GPS, carte OpenStreetMap (Pigeon Maps, sans clé API).
  - **Frais de déplacement** : forfait ou paliers kilométriques, calculés depuis le point de départ ou l'adresse de l'entreprise.
  - **Zone d'intervention** : adresse hors des communes desservies ou au-delà du rayon ⇒ réservation directe bloquée. Jusqu'au rayon + 10 %, le client peut envoyer une **demande exceptionnelle** : rendez-vous « En attente », accusé de réception au client, email à l'artisan qui accepte ou refuse en un clic (`/decision/:token`). Au-delà : adresse non desservie.
- **Confirmation & suivi** : récapitulatif, email de confirmation et lien de gestion / annulation (`/rdv/:token`).
- **Mentions légales** : modale dédiée alimentée par la configuration.

### Espace Artisan (`/admin`)
- **Mise en page pleine page** : header fixe (nom de l'entreprise, déconnexion, liens vers le site ouverts dans un nouvel onglet) et menu latéral rétractable.
- **Rendez-vous** : planning, recherche et filtres, statuts en français, reprogrammation, journal des emails avec relance ; **saisie d'un rendez-vous par l'artisan** (heure libre, hors zone forçable, envoi des confirmations au choix).
- **Prestations** : ajout, édition, prix, durée, mode de frais de déplacement.
- **Horaires** : plages du matin et de l'après-midi par jour, indisponibilités (congés, formation…).
- **Déplacement** : mode d'intervention (à domicile ou dans les locaux), adresse de l'entreprise, frais par paliers.
- **Zone d'intervention** (pleine page) : point de départ (adresse ou GPS), rayon, communes limitrophes, calcul des communes via `geo.api.gouv.fr` (bleu : entièrement dans le rayon, orange : partiellement), retrait d'une commune au clic droit.
- **Configuration** : identité (nom, logo et favicon PNG/SVG avec recadrage), coordonnées, page vitrine, engagements, réservation, mentions légales ; bouton « Annuler » sur chaque formulaire.
- **Authentification** : mot de passe haché (Bcrypt), session serveur (cookie `HttpOnly`, `SameSite=Strict`) vérifiée sur toutes les routes de gestion. Sur un nouvel appareil, **code à 6 chiffres envoyé à l'email professionnel** (15 min, 3 essais), puis appareil reconnu 10 jours. 5 échecs de mot de passe en 15 min bloquent l'adresse IP. Sans email professionnel ni envoi d'emails (`MAIL_FROM`), le mot de passe seul protège l'espace (bandeau d'avertissement). En local, le code arrive dans Mailpit (`http://localhost:8025`).

---

## Pile Technologique (Tech Stack)

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, React Router 7, Sass (SCSS BEM/modulaire), @phosphor-icons/react, Pigeon Maps, Date-fns |
| **Backend** | PHP 8.2 natif (Architecture MVC propre, PDO requêtes préparées, sans dépendance lourde) |
| **Base de données** | MySQL 8.0+ / MariaDB (InnoDB, UTF-8 mb4) |
| **Géocodage & Cartes**| Base Adresse Nationale (BAN data.gouv.fr) + OpenStreetMap via Pigeon Maps (avec GeoJSON des communes) |
| **Hébergement cible** | OVHcloud Hébergement Web mutualisé, **Starter au minimum** (un seul site, une seule base de 250 Mo, 1 Go) ou supérieur, ou serveur dédié |

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

# 3. Lancer l'environnement complet (MySQL, API PHP et Mailpit sous Docker + Vite),
#    puis ouvrir le site dans le navigateur par défaut dès que Vite répond
npm start
npm start safari admin      # /admin dans Safari
npm start tous booking      # /booking dans tous les navigateurs installés (comparer le rendu)
npm start aucun             # sans ouvrir de navigateur

# Pour arrêter proprement l'ensemble des services :
npm stop
```

| Adresse | Usage |
|---|---|
| `http://localhost:5173` | Vitrine et réservation |
| `http://localhost:5173/admin` | Espace Artisan (mot de passe de démonstration : `admin123`) |
| `http://localhost:8000/api` | API PHP |
| `http://localhost:8025` | **Mailpit** : tous les emails envoyés en local y sont capturés, rien ne sort de la machine |

Navigateurs reconnus : `chrome`, `brave`, `edge`, `firefox`, `safari`, `opera`, `vivaldi`, `chromium`
(macOS, Windows, Linux) ; ceux qui sont installés sont listés au démarrage. Serveur déjà lancé :
`npm run ouvrir [navigateur|tous] [chemin]` (`scripts/ouvrir.mjs`).

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
# Envoi d'emails — SMTP_HOST vide : fonction mail() de l'hébergement
# (recommandé chez OVHcloud, seuls MAIL_FROM et MAIL_FROM_NAME sont utiles ;
# MAIL_FROM vide ⇒ noreply@<domaine d'APP_URL>)
# -------------------------------------------------------------------
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=
SMTP_SECURE=starttls           # starttls (587) | tls (465, implicite) | none
MAIL_FROM=contact@votre-domaine.com
MAIL_FROM_NAME=                # facultatif : vide ⇒ nom de l'entreprise (espace Pro)
```

| Variable | Défaut | Rôle |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | `localhost` / `3306` / — | Connexion MySQL (PDO) |
| `APP_ENV` | `production` | `development` active l'affichage des erreurs PHP |
| `CORS_ORIGIN` | `*` | Origine autorisée ; à restreindre au domaine en production |
| `APP_URL` | *(vide)* | Base des liens envoyés par email : `/rdv/:token` (client) et `/decision/:token` (acceptation / refus d'une demande hors zone par l'artisan). Vide ⇒ l'email client affiche le téléphone, et l'artisan valide la demande depuis le planning (statut « En attente ») |
| `APP_TIMEZONE` | `Europe/Paris` | Fuseau d'interprétation des créneaux et des fichiers `.ics` |
| `SMTP_HOST` / `SMTP_PORT` | *(vide)* / `587` | Serveur SMTP. **Vide ⇒ fonction `mail()` de l'hébergement** (aucun identifiant) |
| `SMTP_USER` / `SMTP_PASS` | *(vide)* | Identifiants `AUTH LOGIN` ; laisser vide pour un relais sans authentification |
| `SMTP_SECURE` | `starttls` | `starttls` (587), `tls` (465, TLS implicite) ou `none` |
| `MAIL_FROM` / `MAIL_FROM_NAME` | *(vide)* / *(vide)* | Expéditeur. **`MAIL_FROM_NAME` vide ⇒ nom de l'entreprise** saisi dans l'espace Pro. **Vide ⇒ `noreply@` + domaine d'`APP_URL`** (sans `www.`), domaine forcément attaché à l'hébergement. Chez OVHcloud : domaine **attaché à l'hébergement** (*Multisite*) et, en SMTP, adresse **identique à `SMTP_USER`**, sinon rejet |

**En local, Docker Compose fournit ces variables au conteneur PHP pour viser Mailpit** (elles
priment sur `api/.env`) : l'envoi fonctionne sans rien configurer. Retirez-les du service `api`
de `docker-compose.yml` pour tester un vrai serveur SMTP.

Règles d'envoi propres à OVHcloud (expéditeur, `Reply-To`, SPF/DKIM/DMARC, quotas) : voir
[DEPLOYMENT.fr.md, étape 4b](DEPLOYMENT.fr.md) et les
[bonnes pratiques d'envoi d'e-mail](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/email-sending-best-practices).

L'onglet *Configuration* de l'espace Pro affiche le mode d'envoi et l'expéditeur (lecture seule) et propose un **email de test**.

**Sans `MAIL_FROM` ni `APP_URL` exploitable (domaine réel), l'envoi est simplement désactivé** : les réservations
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
| `POST` | `/api/admin/login` | Mot de passe ; ouvre la session ou envoie le code (nouvel appareil) |
| `POST` | `/api/admin/login/code` | Validation du code à 6 chiffres |
| `GET` | `/api/admin/session` | État de la session |
| `POST` | `/api/admin/logout` | Déconnexion |
| `GET` | `/api/admin/mail` | Mode d'envoi des emails et expéditeur (lecture seule) |
| `POST` | `/api/admin/mail/test` | Email de test vers `to` (testeur, développeur) ou, à défaut, l'email professionnel ; 5 envois / 10 min |

### Prestations & Créneaux
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/services` | Liste des prestations actives |
| `POST` | `/api/services` | Ajouter une prestation (espace pro) |
| `PUT` | `/api/services/:id` | Modifier une prestation |
| `DELETE` | `/api/services/:id` | Supprimer une prestation |
| `GET` | `/api/slots?service_id=1&date=YYYY-MM-DD` | Calcul temps réel des créneaux libres |
| `GET` | `/api/slots/availability?service_id=1` | Jours réservables de la fenêtre de réservation |
| `POST` | `/api/travel-fee/quote` | Devis des frais de déplacement et contrôle de zone pour une adresse géocodée |

### Identité & Zone
| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/branding/:kind` | Logo ou favicon (`logo`, `favicon`), avec repli |
| `POST` / `DELETE` | `/api/admin/branding/:kind` | Remplacer ou supprimer le logo / favicon |
| `GET` | `/api/zone` | Communes de la zone d'intervention (GeoJSON) |
| `PUT` | `/api/admin/zone` | Enregistrer les communes retenues |

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
| `POST` | `/api/appointments/exceptional-request` | Demande hors zone (rendez-vous « En attente » soumis à l'artisan) |
| `GET` / `POST` | `/api/appointments/decision/:token` | Consultation puis acceptation / refus d'une demande hors zone |
| `POST` | `/api/admin/appointments` | Rendez-vous saisi par l'artisan (hors zone et heure libre acceptés) |
| `GET` | `/api/appointments/token/:token` | Consultation d'un rendez-vous via son token |
| `POST` | `/api/appointments/token/:token/cancel` | Annulation d'un rendez-vous par le client |
| `GET` | `/api/appointments/:id` | Détail d'un rendez-vous (espace pro) |
| `PUT` | `/api/appointments/:id/status` | Modification du statut (pending, confirmed, completed, cancelled) |
| `PUT` | `/api/appointments/:id/reschedule` | Reprogrammation (l'heure de fin suit la durée de la prestation) |
| `GET` | `/api/appointments/:id/notifications` | Journal des emails envoyés pour ce rendez-vous |
| `POST` | `/api/appointments/:id/notifications/resend` | Relance manuelle d'un email (`client_confirmation` ou `pro_confirmation`) |

---

## Déploiement

Guide pas à pas pour l'hébergement mutualisé OVHcloud (base de données et migrations, `.env`, SMTP, envoi FTP/SFTP, dossiers de stockage, HTTPS) : [🇫🇷 DEPLOYMENT.fr.md](DEPLOYMENT.fr.md) · [🇬🇧 DEPLOYMENT.md](DEPLOYMENT.md).

---

## Feuille de Route & Évolutions Futures

Consultez [ROADMAP.md](ROADMAP.md) pour le suivi des fonctionnalités réalisées et prévues, et [PASSATION.md](PASSATION.md) pour le dernier point d'avancement.

---

## Licence

Ce projet est sous licence **GNU Affero General Public License v3.0** ([AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.fr.html)). Consultez le fichier [LICENSE](LICENSE) pour plus d'informations.
