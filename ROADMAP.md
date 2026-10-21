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

### 14. IHM de Configuration Complète (Espace Pro) ✅
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
- **Réalisé :** onglet « Configuration » piloté par `src/config/configSchema.ts` (groupes Identité, Coordonnées, Page vitrine, Engagements, Réservation, Carte, Mentions légales) ; toute clé non décrite reste éditable dans « Autres paramètres ». Engagements : `EngagementsEditor` (ajout, suppression, ordre), clés renumérotées de 1 à N à l'enregistrement, les clés en trop supprimées (`PUT /admin/config` : une valeur `null` supprime la clé). Logo et favicon : conseils de lisibilité selon l'image (fond opaque, logo sombre ou clair, image très allongée, résolution faible). Vitrine : cartes d'engagement réparties en rangées équilibrées de 4 au plus (5 → 3 + 2), dernière rangée centrée.
- **Améliorations possibles :** nombre de paliers de déplacement libre (le serveur en lit jusqu'à 10, l'écran en affiche 3) ; rafraîchir la config de l'application après un changement dans l'espace Pro (aujourd'hui au rechargement).

---

### 15. Header & Footer Communs au Tunnel de Réservation
- **Constat :** le header sticky et le `Footer` ne sont rendus que sur la vitrine (`VitrinePage.tsx`) ; la page `/booking` en est dépourvue.
- **Objectif :** conserver le header et le footer de la vitrine sur la partie réservation pour une navigation et une identité continues.
- **Pistes :** extraire le header de `VitrinePage.tsx` en composant réutilisable (ou layout commun aux routes publiques) ; sur `/booking`, header affiché en permanence (sans déclenchement lié au bouton du Hero) ; réutiliser `Footer` tel quel.

---

### 16. Horaires de Travail & Indisponibilités (Espace Pro) ✅
- **Constat :** le moteur de créneaux lisait déjà `schedules` et `unavailabilities`, mais rien ne permettait de les modifier hors base ; le calendrier client laissait choisir des jours sans aucun créneau, et `POST /appointments` ne vérifiait que les chevauchements (pas les horaires ni le délai minimal).
- **Réalisé :** onglet « Horaires » (plage matin + après-midi par jour, jour travaillé ou non, validation serveur des plages) et gestion des indisponibilités (ajout, suppression). Calcul extrait dans `api/core/SlotEngine.php`, partagé par `GET /slots`, le nouveau `GET /slots/availability` (jours grisés dans le calendrier) et la validation de réservation. Espace Pro chargé à la demande (bundle client de 500 à 420 ko).
- **Améliorations possibles :** plus de deux plages par jour ; horaires d'exception sur une date précise (ex. samedi après-midi ponctuel).

---

### 17. Espace Artisan en Pleine Page ✅
- **Réalisé :** route dédiée `/admin` (les anciens liens `/booking?view=admin` y redirigent), header fixe « Espace Artisan » + nom de l'entreprise, déconnexion à droite, liens Accueil et Espace client ouverts dans un nouvel onglet ; menu latéral rétractable (icônes seules, état mémorisé dans le navigateur). Composant `src/components/admin/AdminShell.tsx`.
- **Améliorations possibles :** conserver la session à l'actualisation de la page (aujourd'hui, retour à l'écran de connexion — à traiter avec l'Item 12) ; tableau des rendez-vous adapté au mobile.

---

### 18. Zone d'Intervention Calculée & Mode « Sans Déplacement » ✅
- **Réalisé :** onglet « Zone & déplacement » : mode d'intervention (déplacement chez le client / réception dans les locaux), adresse de l'entreprise par autocomplétion (fixe aussi le point de départ), option « communes limitrophes ». « Calculer les communes » interroge `geo.api.gouv.fr` (`src/utils/serviceArea.ts`) : commune de départ, limitrophes, communes au moins partiellement dans le rayon `travel_max_km` ; liste à cocher puis enregistrement dans `api/storage/zone/service-area.geojson` (`PUT /admin/zone`, `GET /zone`). Carte commune `ZoneMap` : bleu si entièrement dans le rayon, orange si partiellement, cercle en pointillés. Rayon d'intervention réglé au-dessus de la carte (paliers de frais en dessous) ; clic droit sur une commune pour la retirer (rouge, décochée) ou la réintégrer. Mode locaux : vitrine « Nous trouver » avec l'adresse, aucune adresse ni frais demandés à la réservation, le serveur impose l'adresse des locaux sur le rendez-vous.
- **Organisation :** menu « Déplacement » (mode, adresse de l'entreprise, point de départ distinct possible par adresse ou coordonnées GPS, paliers de frais) et menu « Zone d'intervention » en pleine page (`ZoneWorkspace` : rayon, limitrophes, liste masquable avec distance au centre, carte sur toute la hauteur).
- **Réservation :** dès qu'une zone est enregistrée, l'adresse du client doit être dans une commune cochée (`api/core/ServiceArea.php`, test point dans polygone), sinon blocage « hors zone » comme pour le rayon (`out_of_zone_reason` : `commune` / `radius`) ; l'adresse doit alors être choisie dans les suggestions.
- **Demande exceptionnelle :** hors zone mais à moins du rayon + 10 % (`TravelFee::EXCEPTION_MARGIN`), le client envoie une demande pour le créneau choisi : rendez-vous `pending` qui bloque le créneau, accusé de réception au client, email à l'artisan (Reply-To client) avec un bouton vers `/decision/:token`. Accepter ⇒ `confirmed` + confirmations habituelles (.ics) ; refuser ⇒ `cancelled` + email au client. Au-delà de la marge : « adresse non desservie », sans action. Migration `sql/migrations/2026-10-21_item18_exception_requests.sql` (colonne `decision_token`, nouveaux types d'emails).
- **Remplace :** le fichier statique `src/data/serviceAreaGeoJson.json` (propre à une installation).
- **Améliorations possibles :** recalcul automatique quand le rayon ou l'adresse change (aujourd'hui, à relancer à la main) ; simplification des contours pour les grands rayons (fichier plus léger) ; libellés des emails « adresse d'intervention » adaptés au mode locaux.

---

### 19. Saisie d'un Rendez-vous par l'Artisan ✅
- **Réalisé :** bouton « Nouveau rendez-vous » du planning (`src/components/admin/NewAppointment.tsx`) réutilisant `ServiceSelector`, `SlotPicker` et `BookingForm` en mode `adminMode` : tous les jours ouverts, heure libre hors créneaux, email et adresse facultatifs, encart hors zone avec enregistrement forcé (`POST /admin/appointments`, `is_out_of_zone` conservé), envoi des confirmations optionnel. Capsules de statut du planning en français.
- **Améliorations possibles :** changer le statut d'une demande « En attente » depuis le planning n'envoie pas les emails de décision (passer par le lien de l'email) ; route `/admin/appointments` ouverte comme les autres `/admin/*` (Item 12).

---

### 20. Compte SMTP Configurable depuis l'Espace Pro
- **Besoin :** saisir le compte d'envoi (hôte, port, chiffrement, identifiant, mot de passe, expéditeur) dans l'espace Pro, en remplacement de la configuration de déploiement (`api/.env`), et l'utiliser pour tous les envois.
- **Reporté (21/10/2026) :** le mot de passe SMTP est un secret ; il ne doit pas aller dans la table `config` (exposée par `GET /admin/config`), et tant que les routes `/admin/*` ne sont pas protégées côté serveur, n'importe qui pourrait modifier le compte et détourner les emails. **Prérequis : Item 12.**
- **Pistes :** mot de passe chiffré hors table `config` (`api/storage/`), champ en écriture seule jamais renvoyé par l'API, bouton « Envoyer un email de test », repli sur `api/.env` si rien n'est saisi.
- **En attendant, en local :** Docker Compose fournit un serveur de capture **Mailpit** (`http://localhost:8025`) déjà branché sur le conteneur PHP.

---

## 📊 Matrice d'Ordonnancement & Suivi du Backlog

| Ordre Prioritaire | Réf. | Fonctionnalité | Domaine | Statut | Dépendances / Prérequis |
|---|---|---|---|---|---|
| **1** | **Item 15** | **Header & footer communs au tunnel de réservation** | Vitrine / Navigation | ⏳ *À faire* | Extraction du header de `VitrinePage` |
| **2** | **Item 12** | **Sécurité : vérification serveur des routes `/admin/*` + 2FA Email OTP (10 jours par appareil)** | Sécurité / Authentification | ⏳ *À faire* | Service mail disponible (Item 4) ✅ |
| **3** | **Item 20** | **Compte SMTP configurable depuis l'espace Pro** | Communication / Configuration | 🕒 *Reporté* | Item 12 |
| **4** | **Item 2** | **Theming & Effets visuels (Admin)** | Design / UI | ⏳ *À faire* | Variables CSS dynamiques |
| **5** | **Item 5** | **Conformité RGPD & Cookies** | Légal / Conformité | ⏳ *À faire* | Documentation & consentement formulaires |
| — | **Item 19** | Saisie d'un rendez-vous par l'artisan (formulaires partagés, hors zone forçable) | Espace Pro / Planning | ✅ **Terminé** | — |
| — | **Item 18** | Zone d'intervention calculée, mode sans déplacement, demandes hors zone validées par l'artisan | Zone / Réservation | ✅ **Terminé** | — |
| — | **Item 17** | Espace Artisan en pleine page (`/admin`, menu rétractable) | Espace Pro / Navigation | ✅ **Terminé** | — |
| — | **Item 16** | Horaires de travail, indisponibilités, moteur de créneaux partagé | Espace Pro / Planning | ✅ **Terminé** | — |
| — | **Item 14** | IHM de configuration complète (Espace Pro) | Espace Pro / Configuration | ✅ **Terminé** | — |
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

