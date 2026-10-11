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

---

### 4. Notifications Email Modernes & Fichiers iCal (Client & Artisan)
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

### 6. Identité Visuelle & Logo (Favicon, Header)
- **Upload / Gestion du logo d'entreprise :**
  - Paramétrage dans l'admin pour uploader ou renseigner l'URL du logo de l'artisan.
  - Intégration responsive dans le header principal et génération/utilisation du favicon.

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

## 📊 Matrice d'Ordonnancement & Suivi du Backlog

| Ordre Prioritaire | Réf. | Fonctionnalité | Domaine | Statut | Dépendances / Prérequis |
|---|---|---|---|---|---|
| **1** | **Item 4** | **Notifications email, iCal & logs d'envoi IHM** | Communication / Traçabilité | ⏳ *À faire* | Configuration SMTP / Service Mail PHP |
| **2** | **Item 12** | **Sécurité 2FA Email OTP (10 jours par appareil)** | Sécurité / Authentification | ⏳ *À faire* | Dépend du service Mail (Item 4) |
| **3** | **Item 6** | **Identité visuelle & Logo (Favicon, Header)** | Design / Personnalisation | ⏳ *À faire* | Paramètres de config |
| **4** | **Item 2** | **Theming & Effets visuels (Admin)** | Design / UI | ⏳ *À faire* | Variables CSS dynamiques |
| **5** | **Item 5** | **Conformité RGPD & Cookies** | Légal / Conformité | ⏳ *À faire* | Documentation & consentement formulaires |
| — | **Item 1** | Frais de déplacement hybrides & gestion hors-zone | Tunnel / Tarification | ✅ **Terminé** | — |
| — | **Item 3** | Page Vitrine par Défaut (Homepage Artisan) | Vitrine / Navigation | ✅ **Terminé** | — |
| — | **Item 7** | Footer Complet & Mentions Légales | Légal / Footer | ✅ **Terminé** | — |
| — | **Item 8** | Dette Technique & Harmonisation Styles SCSS | Qualité Code / SCSS | ✅ **Terminé** | — |
| — | **Item 9** | Modernisation Sass (Dart Sass Modern Compiler) | Outillage / Build | ✅ **Terminé** | — |
| — | **Item 10**| Gestion Propre des Classes Conditionnelles (`clsx`) | Qualité Code / React | ✅ **Terminé** | — |
| — | **Item 11**| Gestion des Prestations (Création pop-up, Édition, Delete)| Espace Pro / Catalogue | ✅ **Terminé** | — |
| — | **Item 13**| Recherche, filtres, RDV échus & reprogrammation datetime | Espace Pro / Planning | ✅ **Terminé** | — |

