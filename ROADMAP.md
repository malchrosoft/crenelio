# Feuille de Route & Suivi des Développements — Crénelio

Ce document répertorie le backlog fonctionnel, technique et design à implémenter pour les prochaines itérations de Crénelio.

---

## 📋 Backlog Prioritaire

### 1. Frais de Déplacement Hybrides (Par Prestation & Paliers Kilométriques) — ✅ Terminée
- **Moteur de calcul `api/core/TravelFee.php` :** distance géodésique (Haversine) entre `config.default_latitude/longitude` et l'adresse BAN du client, résolution des paliers et détection du hors-zone.
- **Endpoint public `POST /travel-fee/quote` :** décomposition tarifaire (prestation + déplacement + total, distance, hors-zone) consommée par le tunnel pour l'affichage avant confirmation.
- **Frais figés en base à la réservation :** `appointments.travel_fee`, `distance_km`, `is_out_of_zone` ; le montant est toujours recalculé côté serveur, jamais repris du client.
- **Espace Pro :** mode et forfait de déplacement dans la création et l'édition des prestations, badge dédié sur les cartes, onglet « Zone & déplacement » pour les paliers et le rayon maximal.
- **Options tarifaires par prestation (`services.travel_fee_mode`) :**
  - `'none'` : Aucun frais / déplacement inclus (ex: télé-diagnostic, prestation atelier).
  - `'fixed'` : Montant forfaitaire fixe dédié à la prestation (ex: forfait intervention urgente +20 €), renseigné dans `services.travel_fee_amount`.
  - `'distance_tiers'` : Application automatique des paliers kilométriques configurés globalement.
- **Paliers kilométriques configurables (`config`) :**
  - Calcul dynamique de la distance via coordonnées GPS (formule de Haversine entre l'artisan et l'adresse BAN du client).
  - Paliers paramétrables (ex: `0-15 km: 0 €`, `15-30 km: 15 €`, `30-50 km: 30 €`).
  - Rayon maximal d'intervention automatique (ex: `50 km`).
- **Comportement Hors-Zone (> Rayon max) :**
  - Blocage de la réservation instantanée avec message bienveillant indiquant la distance calculée.
  - Formulaire de demande exceptionnelle directe par **email** (nom, adresse, téléphone, prestation demandée) envoyé à l'artisan, avec téléphone affiché en dernier recours.
- **Transparence tarifaire :**
  - Décomposition détaillée dans le récapitulatif avant confirmation (Prestation + Frais de déplacement calculés = Total estimé).
  - Mentions sur la vitrine et dans la confirmation de rendez-vous.

---

### 2. Theming, Matérialisation & Effets Graphiques (Pilotable via Admin)
- **Système de Theming dynamique :**
  - Variables CSS injectées dynamiquement (`--primary`, `--primary-hover`, `--radius`, etc.) depuis la table `config`.
  - Palette prédéfinie ou sélecteur de couleur personnalisée dans l'espace Pro.
- **Effets Graphiques & Matérialisation activables :**
  - Options dans l'admin pour activer des styles esthétiques modernes :
    - *Glassmorphism / Effets de flou d'arrière-plan* (`backdrop-filter`).
    - *Ombres douces / Neumorphisme léger*.
    - *Animations & micro-interactions* (transitions fluides, feedback visuel au survol et validation de formulaire).

---

### 3. Page Vitrine par Défaut (Homepage Artisan) — ✅ Terminée
- **Page d'accueil de présentation :**
  - Affichage d'une page vitrine professionnelle mettant en valeur l'artisan (présentation de l'activité, coordonnées, engagements, contact direct).
  - Zone d'intervention interactive sous le Hero avec carte Pigeon Maps, marqueur centré et tracé polygonal des communes couvertes (GeoJSON officiel).
  - Header sticky adaptatif apparaissant dès que le bouton d'action du Hero sort du viewport.
  - Cartes de prestations avec alignement strict en bas de carte (durée, tarif, CTA direct).
  - Routage React Router avec navigation `/` (vitrine), `/booking` (tunnel de réservation) et pré-sélection d'une prestation via `/booking?service=:id`.
- **Sections pilotées par les données (12/10/2026) :**
  - Contact : seules les cartes dont la valeur est renseignée (`pro_phone`, `pro_email`, `service_area`) sont construites ; aucune grille si rien n'est saisi.
  - Engagements : chargement en boucle de toutes les clés `vitrine_engagement_N` renseignées, triées par N (nombre illimité), icône toujours déduite des mots-clés / emoji.

---

### 4. Notifications Email Modernes & Fichiers iCal (Client & Artisan) — ✅ Terminée
- **Client SMTP natif `api/core/Mailer.php` :** socket, STARTTLS (587) ou TLS implicite (465), `AUTH LOGIN`, composition MIME `multipart/mixed` + `multipart/alternative` (texte & HTML) et pièce jointe. En-têtes encodés RFC 2047 avec repli des sujets longs.
- **Identifiants hors base :** `SMTP_*`, `MAIL_FROM*`, `APP_URL` et `APP_TIMEZONE` lus uniquement dans `api/.env` (cf. `DEPLOYMENT.md`, étape 4b).
- **Envoi non bloquant :** `api/core/Notifier.php` journalise en `pending` avant l'appel SMTP puis bascule en `sent` / `failed` ; une panne d'envoi ne fait jamais échouer une réservation enregistrée.
- **Page publique `/rdv/:token` :** cible du lien de gestion envoyé au client, réutilisant la fiche de confirmation (consultation et annulation).
- **IHM Pro :** bouton « Emails » sur chaque rendez-vous ouvrant le journal d'envoi (statut, destinataire, sujet, horodatage, motif d'échec) avec relance manuelle par type.
- **Reste à faire :** notification d'annulation (client et artisan) — non couverte par cet item.
- **Mécanisme d'envoi moderne & sécurisé :**
  - Intégration SMTP sécurisé (STARTTLS / TLS) ou API de messagerie moderne (ex: Brevo / Resend / Mailjet / Symfony Mailer).
  - Configuration sécurisée des identifiants SMTP via l'espace Pro / `.env`.
- **Email de confirmation Client :**
  - Template HTML responsive élégant confirmant la date, l'horaire, le montant indicatif et le lien direct de gestion/annulation.
- **Email Artisan avec pièce jointe iCalendar (`.ics`) :**
  - Fichier iCal complet attaché pour import direct dans Google Calendar / Apple Calendar / Outlook :
    - Dates de début et fin précises avec temps de trajet inclus.
    - Lieu / Adresse complète de l'intervention.
    - Nom, téléphone (cliquable `tel:`) et email du client.
    - Notes d'accès (digicode, détails du problème).
- **Historique & Traçabilité des Notifications (`appointment_notifications`) :**
  - Table de logs dédiée enregistrant chaque notification envoyée (`appointment_id`, `recipient`, `status`, `sent_at`, `delivery_status`).
  - **Consultation directe dans l'IHM Pro :** Visualisation des logs d'envoi attachés à chaque rendez-vous depuis le tableau de bord (icône/bouton dédié, date/heure exacte d'expédition, statut et destinataire) pour répondre immédiatement aux interrogations des clients.

---

### 5. Conformité RGPD & Gestion des Cookies
- **Protection des données personnelles :**
  - Mention explicite du consentement sur la collecte des coordonnées lors de la prise de rendez-vous.
  - Politique de conservation des données et droit d'accès/suppression.
- **Cookies & Traceurs :**
  - Bandeau d'information et consentement cookies si nécessaire (l'application étant sans traceurs tiers intrusifs, documenter l'exemption ou prévoir la bannière en cas d'ajout d'analytics).

---

### 6. Identité Visuelle & Logo (Favicon, Header) — ✅ Terminée
- **Fichiers sous leurs noms d'usage** dans `api/storage/branding/` (`logo.svg|png`, `favicon.png|svg|ico`), déposables aussi par FTP, servis par `/api/branding/:kind` ; URLs versionnées exposées avec la config (`branding_logo_url`, `branding_favicon_url`).
- **Espace Pro, groupe « Identité de l'entreprise » :** envoi PNG / SVG avec zoom et recadrage (`react-easy-crop`, chargé à la demande) ; un SVG reste vectoriel (seul son `viewBox` change).
- **Favicon :** généré depuis le logo ou depuis une image dédiée plus épurée, décliné en PNG 512 px + ICO (16/32/48) + SVG si la source l'est.
- **Replis :** sans logo, icône + nom de l'entreprise (`BrandMark`) ; sans favicon, icône par défaut servie par l'API. La suppression restaure le repli.
- **Sécurité :** contrôle des signatures PNG / ICO, SVG porteurs de script refusés, SVG servis sous CSP `sandbox`. Routes d'écriture non protégées tant que l'Item 12 n'est pas fait.

---

### 7. Footer Complet & Mentions Légales Pré-configurables — ✅ Terminée
- **Pied de page riche :**
  - Navigation, coordonnées de contact rapides (téléphone, email), rappel de la zone d'intervention.
  - Lien d'accès discret vers l'espace Pro.
- **Mentions légales & Informations d'entreprise :**
  - Champs configurables dans `config` : Raison sociale, SIRET, code NAF/APE, numéro d'assurance décennale / RC Pro, adresse, hébergeur.
  - Modale dédiée accessible depuis le footer affichant les mentions légales complètes et les règles de traitement des données.

---

### 8. Dette Technique & Harmonisation des Styles SCSS — ✅ Terminée
- **Éradication des styles inline résiduels :**
  - Tous les `style={{ ... }}` ont été supprimés de l'ensemble des composants (`BookingForm.tsx`, `SlotPicker.tsx`, `BookingConfirmation.tsx`, `AdminDashboard.tsx`, `LegalModal.tsx`).
- **Conformité aux conventions SCSS :**
  - Classes sémantiques de composant créées dans `_components.scss` (`.form-actions-between`, `.form-alert-error`, `.form-gps-status`, `.slots-loading`, `.slots-error`, `.slots-empty`, `.confirmation-card`, `.confirmation-badge-icon`, `.admin-login-card`, etc.).
  - Remplacement systématique des couleurs hexadécimales en dur par les constantes SCSS de `_variables.scss` (`$primary`, `$primary-light`, `$danger-light`, `$success-light`, `$warning-light`, etc.).
  - Cohérence des boutons vitrine et correction du lien Espace Pro vers `/booking?view=admin`.

---

### 9. Modernisation du Build Sass (Migration Legacy JS API) — ✅ Terminée
- **Résolution du warning de dépréciation :**
  - Ajout de `css.preprocessorOptions.scss.api: 'modern-compiler'` dans `vite.config.js`.
  - Élimination complète du warning Dart Sass `[legacy-js-api]` lors du build.

---

### 10. Gestion Propre des Classes Conditionnelles (`clsx`) — ✅ Terminée
- **Installation et intégration :**
  - Dépendance `clsx` installée.
  - Refactorisation de tous les `className` conditionnels avec `clsx()` dans `VitrinePage`, `BookingPage`, `ServiceSelector`, `CalendarPicker`, `SlotPicker`, `BookingConfirmation` et `AdminDashboard`.

---

### 11. Gestion des Prestations Espace Pro (Création, Édition, Suppression protégée) — ✅ Terminée
- **Formulaire d'ajout :**
  - Ajout du champ `description` pour détailler le contenu de la prestation lors de sa création.
- **Édition inline :**
  - Bouton « Modifier » sur chaque prestation pour ajuster en direct le nom, la description, la durée et le prix avec boutons « Enregistrer » et « Annuler ».
- **Suppression protégée :**
  - Bouton « Supprimer » permettant la suppression définitive uniquement si aucun rendez-vous n'est associé en base de données.
  - Gestion sécurisée de la contrainte d'intégrité référentielle avec message explicite invitant à la désactivation si des rendez-vous passés ou futurs existent.

---

### 12. Sécurité & Authentification Renforcée Espace Pro (2FA Email OTP & Appareil de confiance 10 jours)
- **Objectif :**
  - Sécuriser l'accès à l'espace de gestion artisan sans complexité excessive ni dépendance externe lourde (standard conforme aux recommandations ANSSI / OWASP pour mono-utilisateur).
- **Fonctionnement :**
  - **Étape 1 :** Vérification du mot de passe administrateur (hachage Bcrypt).
  - **Étape 2 — Appareil de confiance (10 jours) :**
    - Un jeton d'autorisation signé cryptographiquement (`device_token`) est stocké côté client (`localStorage` / cookie sécurisé).
    - Si le jeton est valide et date de **moins de 10 jours**, la connexion est instantanée sans friction.
  - **Étape 3 — Code OTP temporaire (si nouvel appareil ou expiration > 10 jours) :**
    - Génération d'un code numérique aléatoire à 6 chiffres cryptographiquement sécurisé (`random_int(100000, 999999)`).
    - Validité stricte de **15 minutes** et limitation à 3 tentatives infructueuses.
    - Envoi immédiat par email à l'adresse de contact du professionnel (`pro_email`).
    - Dès validation du code à 6 chiffres, l'appareil est autorisé pour un nouveau cycle de **10 jours**.

---

### 13. Gestion Avancée du Planning, Recherche & Suivi des Rendez-vous Échus — ✅ Terminée
- **Outil de recherche & filtrage multi-critères :**
  - Barre de recherche textuelle instantanée (nom client, téléphone, email, prestation, adresse, ville).
  - Filtres par statut (`Tous`, `Confirmés`, `En attente`, `Terminés`, `Annulés`).
  - Filtre temporel : *Toutes dates*, *À venir*, *Aujourd'hui*, *Échus non clôturés*, *Historique passé*.
- **Détection & Traitement visuel des rendez-vous échus non honorés :**
  - Les rendez-vous passés sans statut `completed` ou `cancelled` restent visibles dans la liste.
  - **Mise en valeur visuelle différenciée :**
    - Couleur d'arrière-plan d'attention ambrée dédiée (`.admin-row-overdue`).
    - Badge d'alerte spécifique (`WarningCircleIcon`) signalant « Échu à traiter ».
- **Action de report / reprogrammation rapide :**
  - Bouton d'action « Reprogrammer » sur chaque ligne de rendez-vous.
  - Modale dédiée avec champ unique ergonomique HTML5 `datetime-local`.
  - Endpoint API `PUT /appointments/:id/reschedule` recalculant automatiquement l'heure de fin selon la durée de la prestation.

---

### 14. IHM de Configuration Complète (Espace Pro)
- **Constat :** l'onglet « Paramètres » n'édite que les 7 clés de déplacement (`travel_tier_*`, `travel_max_km`) ; `company_name` y est seulement affiché. Toutes les autres clés de `config` ne se modifient qu'en base.
- **Objectif :** un formulaire par groupe dans l'espace Pro :
  - *Entreprise & coordonnées* : `company_name`, `pro_name`, `pro_email`, `pro_phone`, `service_area`.
  - *Réservation & créneaux* : `slot_step_minutes`, `buffer_minutes`, `min_notice_hours`, `max_advance_days`.
  - *Carte* : `default_latitude`, `default_longitude`, `default_zoom`.
  - *Vitrine* : `vitrine_tagline`, `vitrine_about`, `vitrine_photo_url`.
  - *Engagements* : liste libre `vitrine_engagement_N` (ajout, suppression, ordre), cohérente avec le chargement en boucle de la vitrine.
  - *Mentions légales* : `legal_raison_sociale`, `legal_siret`, `legal_naf`, `legal_assurance`, `legal_adresse`, `legal_hebergeur`.
- **Hors périmètre :** changement du mot de passe (`admin_password_hash`), rattaché à l'Item 12.
- **Contraintes :** aucun secret dans `config` (exposée par `GET /admin/config`) ; tant que l'Item 12 n'est pas fait, ces écritures restent ouvertes côté serveur comme toutes les routes `/admin/*`.

---

### 15. Header & Footer Communs au Tunnel de Réservation
- **Constat :** le header sticky et le `Footer` ne sont rendus que sur la vitrine (`VitrinePage.tsx`) ; la page `/booking` en est dépourvue.
- **Objectif :** conserver le header et le footer de la vitrine sur la partie réservation pour une navigation et une identité continues.
- **Pistes :** extraire le header de `VitrinePage.tsx` en composant réutilisable (ou layout commun aux routes publiques) ; sur `/booking`, header affiché en permanence (sans déclenchement lié au bouton du Hero) ; réutiliser `Footer` tel quel.

---

## 📊 Matrice d'Ordonnancement & Suivi du Backlog

| Ordre Prioritaire | Réf. | Fonctionnalité | Domaine | Statut | Dépendances / Prérequis |
|---|---|---|---|---|---|
| **1** | **Item 14** | **IHM de configuration complète (Espace Pro)** | Espace Pro / Configuration | 🚧 *En cours* (étape 1 + identité faites) | — |
| **2** | **Item 15** | **Header & footer communs au tunnel de réservation** | Vitrine / Navigation | ⏳ *À faire* | Extraction du header de `VitrinePage` |
| **3** | **Item 12** | **Sécurité 2FA Email OTP (10 jours par appareil)** | Sécurité / Authentification | ⏳ *À faire* | Service mail disponible (Item 4) ✅ |
| **4** | **Item 2** | **Theming & Effets visuels (Admin)** | Design / UI | ⏳ *À faire* | Variables CSS dynamiques |
| **5** | **Item 5** | **Conformité RGPD & Cookies** | Légal / Conformité | ⏳ *À faire* | Documentation & consentement formulaires |
| — | **Item 6** | Identité visuelle : logo & favicon (recadrage, replis) | Design / Personnalisation | ✅ **Terminé** | — |
| — | **Item 4** | Notifications email, iCal & logs d'envoi IHM | Communication / Traçabilité | ✅ **Terminé** | — |
| — | **Item 1** | Frais de déplacement hybrides & gestion hors-zone | Tunnel / Tarification | ✅ **Terminé** | — |
| — | **Item 3** | Page Vitrine par Défaut (Homepage Artisan) | Vitrine / Navigation | ✅ **Terminé** | — |
| — | **Item 7** | Footer Complet & Mentions Légales | Légal / Footer | ✅ **Terminé** | — |
| — | **Item 8** | Dette Technique & Harmonisation Styles SCSS | Qualité Code / SCSS | ✅ **Terminé** | — |
| — | **Item 9** | Modernisation Sass (Dart Sass Modern Compiler) | Outillage / Build | ✅ **Terminé** | — |
| — | **Item 10**| Gestion Propre des Classes Conditionnelles (`clsx`) | Qualité Code / React | ✅ **Terminé** | — |
| — | **Item 11**| Gestion des Prestations (Création pop-up, Édition, Delete)| Espace Pro / Catalogue | ✅ **Terminé** | — |
| — | **Item 13**| Recherche, filtres, RDV échus & reprogrammation datetime | Espace Pro / Planning | ✅ **Terminé** | — |

