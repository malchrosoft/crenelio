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

### 2. Theming, Matérialisation & Effets Graphiques (Pilotable via Admin) — 🚧 En cours
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

### 12. Sécurité & Authentification Renforcée Espace Pro (2FA Email OTP & Appareil de confiance 10 jours) — ✅ Terminée
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
- **Réalisé (23/10/2026) :**
  - `api/core/Auth.php` : session serveur (cookie `HttpOnly` / `SameSite=Strict`, inactivité 2 h, durée max 12 h), appareil de confiance en cookie signé HMAC (révoqué par un changement de mot de passe), code lié à la session (haché, 15 min, 3 essais, renvoi au plus toutes les 60 s), 5 échecs de mot de passe par IP en 15 min ⇒ blocage.
  - Toutes les routes de gestion passent par `Auth::guard` (`/admin/*`, écritures prestations / horaires / indisponibilités, liste et gestion des rendez-vous, journal des emails, prestations désactivées).
  - Front : écran de connexion en deux étapes (`AdminLogin`), session conservée au rechargement, retour à la connexion sur tout 401.
  - Sans `pro_email` ou sans envoi d'emails : mot de passe seul, bandeau d'avertissement dans l'espace Artisan.
  - Clé de signature générée dans `api/storage/auth/secret.key` (jamais en base).

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

### 14. IHM de Configuration Complète (Espace Pro) — ✅ Terminée
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

### 15. Header & Footer Communs au Tunnel de Réservation — ✅ Terminée
- **Constat :** le header sticky et le `Footer` ne sont rendus que sur la vitrine (`VitrinePage.tsx`) ; la page `/booking` en est dépourvue.
- **Objectif :** conserver le header et le footer de la vitrine sur la partie réservation pour une navigation et une identité continues.
- **Pistes :** extraire le header de `VitrinePage.tsx` en composant réutilisable (ou layout commun aux routes publiques) ; sur `/booking`, header affiché en permanence (sans déclenchement lié au bouton du Hero) ; réutiliser `Footer` tel quel.
- **Réalisé (22/10/2026) :** composant `SiteHeader` partagé (vitrine : fixe et déclenché par le CTA du hero ; `/booking` : permanent en `position: sticky`, sans bouton « Prendre rendez-vous »), `Footer` rendu sous le stepper. Le lien « Espace Pro » du header de réservation disparaît au profit de celui du footer. La page `/rdv/:token` garde son header allégé.

---

### 16. Horaires de Travail & Indisponibilités (Espace Pro) — ✅ Terminée
- **Constat :** le moteur de créneaux lisait déjà `schedules` et `unavailabilities`, mais rien ne permettait de les modifier hors base ; le calendrier client laissait choisir des jours sans aucun créneau, et `POST /appointments` ne vérifiait que les chevauchements (pas les horaires ni le délai minimal).
- **Réalisé :** onglet « Horaires » (plage matin + après-midi par jour, jour travaillé ou non, validation serveur des plages) et gestion des indisponibilités (ajout, suppression). Calcul extrait dans `api/core/SlotEngine.php`, partagé par `GET /slots`, le nouveau `GET /slots/availability` (jours grisés dans le calendrier) et la validation de réservation. Espace Pro chargé à la demande (bundle client de 500 à 420 ko).
- **Améliorations possibles :** plus de deux plages par jour ; horaires d'exception sur une date précise (ex. samedi après-midi ponctuel).

---

### 17. Espace Artisan en Pleine Page — ✅ Terminée
- **Réalisé :** route dédiée `/admin` (les anciens liens `/booking?view=admin` y redirigent), header fixe « Espace Artisan » + nom de l'entreprise, déconnexion à droite, liens Accueil et Espace client ouverts dans un nouvel onglet ; menu latéral rétractable (icônes seules, état mémorisé dans le navigateur). Composant `src/components/admin/AdminShell.tsx`.
- **Améliorations possibles :** conserver la session à l'actualisation de la page (aujourd'hui, retour à l'écran de connexion — à traiter avec l'Item 12) ; tableau des rendez-vous adapté au mobile.

---

### 18. Zone d'Intervention Calculée & Mode « Sans Déplacement » — ✅ Terminée
- **Réalisé :** onglet « Zone & déplacement » : mode d'intervention (déplacement chez le client / réception dans les locaux), adresse de l'entreprise par autocomplétion (fixe aussi le point de départ), option « communes limitrophes ». « Calculer les communes » interroge `geo.api.gouv.fr` (`src/utils/serviceArea.ts`) : commune de départ, limitrophes, communes au moins partiellement dans le rayon `travel_max_km` ; liste à cocher puis enregistrement dans `api/storage/zone/service-area.geojson` (`PUT /admin/zone`, `GET /zone`). Carte commune `ZoneMap` : bleu si entièrement dans le rayon, orange si partiellement, cercle en pointillés. Rayon d'intervention réglé au-dessus de la carte (paliers de frais en dessous) ; clic droit sur une commune pour la retirer (rouge, décochée) ou la réintégrer. Mode locaux : vitrine « Nous trouver » avec l'adresse, aucune adresse ni frais demandés à la réservation, le serveur impose l'adresse des locaux sur le rendez-vous.
- **Organisation :** menu « Déplacement » (mode, adresse de l'entreprise, point de départ distinct possible par adresse ou coordonnées GPS, paliers de frais) et menu « Zone d'intervention » en pleine page (`ZoneWorkspace` : rayon, limitrophes, liste masquable avec distance au centre, carte sur toute la hauteur).
- **Réservation :** dès qu'une zone est enregistrée, l'adresse du client doit être dans une commune cochée (`api/core/ServiceArea.php`, test point dans polygone), sinon blocage « hors zone » comme pour le rayon (`out_of_zone_reason` : `commune` / `radius`) ; l'adresse doit alors être choisie dans les suggestions.
- **Demande exceptionnelle :** hors zone mais à moins du rayon + 10 % (`TravelFee::EXCEPTION_MARGIN`), le client envoie une demande pour le créneau choisi : rendez-vous `pending` qui bloque le créneau, accusé de réception au client, email à l'artisan (Reply-To client) avec un bouton vers `/decision/:token`. Accepter ⇒ `confirmed` + confirmations habituelles (.ics) ; refuser ⇒ `cancelled` + email au client. Au-delà de la marge : « adresse non desservie », sans action. Migration `sql/migrations/2026-10-21_item18_exception_requests.sql` (colonne `decision_token`, nouveaux types d'emails).
- **Remplace :** le fichier statique `src/data/serviceAreaGeoJson.json` (propre à une installation).
- **Améliorations possibles :** recalcul automatique quand le rayon ou l'adresse change (aujourd'hui, à relancer à la main) ; simplification des contours pour les grands rayons (fichier plus léger) ; libellés des emails « adresse d'intervention » adaptés au mode locaux.

---

### 19. Saisie d'un Rendez-vous par l'Artisan — ✅ Terminée
- **Réalisé :** bouton « Nouveau rendez-vous » du planning (`src/components/admin/NewAppointment.tsx`) réutilisant `ServiceSelector`, `SlotPicker` et `BookingForm` en mode `adminMode` : tous les jours ouverts, heure libre hors créneaux, email et adresse facultatifs, encart hors zone avec enregistrement forcé (`POST /admin/appointments`, `is_out_of_zone` conservé), envoi des confirmations optionnel. Capsules de statut du planning en français.
- **Améliorations possibles :** changer le statut d'une demande « En attente » depuis le planning n'envoie pas les emails de décision (passer par le lien de l'email) ; route `/admin/appointments` ouverte comme les autres `/admin/*` (Item 12).

---

### 20. Compte SMTP Configurable depuis l'Espace Pro — ❌ Abandonné (27/10/2026)
- **Besoin initial :** saisir le compte d'envoi (hôte, port, identifiant, mot de passe, expéditeur) dans l'espace Pro plutôt que dans `api/.env`.
- **Abandonné, remplacé par l'Item 24 :**
  - **Verrouillage :** le code de connexion (Item 12) part par ce SMTP ; un réglage erroné saisi depuis l'espace Pro empêcherait toute connexion depuis un nouvel appareil, donc toute correction.
  - **Secret mal protégé :** chiffré, le mot de passe resterait déchiffrable avec une clé posée sur le même serveur ; une session volée suffirait à détourner tous les emails, codes de connexion compris.
  - **Peu utile :** un artisan seul ne change presque jamais de serveur d'envoi, et l'hébergement OVHcloud sait envoyer sans identifiants (`mail()`).

### 21. Exploitation des Interventions avec AG Grid (édition Community)
- **Besoin :** une vue tabulaire des interventions dans l'espace Pro pour les exploiter au quotidien : tri, filtres par colonne, recherche, regroupement par statut ou par commune, export CSV.
- **Choix :** `ag-grid-react` en **édition Community** (licence MIT). Ne pas utiliser les fonctionnalités Enterprise (export Excel natif, regroupement de lignes avancé, tableaux croisés) qui exigent une licence payante.
- **Pistes :** remplacer ou compléter la liste actuelle du planning ; thème AG Grid aligné sur les variables SCSS ; colonnes : date, client, prestation, adresse, frais de déplacement, statut ; actions de ligne réutilisant les appels existants (statut, reprogrammation, emails).

### 22. Génération des Factures (plus tard)
- **Besoin :** générer une facture à partir d'une intervention réalisée, depuis la grille de l'Item 21.
- **Pistes :** numérotation chronologique continue et sans trou, mentions légales obligatoires (SIRET, TVA ou mention d'exonération), montant prestation + frais de déplacement, export PDF, facture non modifiable une fois émise (avoir pour corriger).
- **Prérequis :** Item 21 ; Item 12 (données comptables à protéger côté serveur).

### 23. Calendrier des Interventions avec FullCalendar
- **Besoin :** gérer le calendrier d'intervention dans l'espace Pro avec des vues jour / semaine / mois.
- **Choix :** `@fullcalendar/react` avec les plugins **standard** (licence MIT : `daygrid`, `timegrid`, `interaction`, `list`). Les plugins Premium (vues ressources, timeline) sont payants et non nécessaires pour un artisan seul.
- **Pistes :** affichage des rendez-vous, indisponibilités et horaires de travail ; glisser-déposer pour reprogrammer, validé par le `SlotEngine` (refus si le créneau n'est pas proposable) ; création d'un rendez-vous au clic (formulaire de l'Item 19) ; locale `fr`, fuseau `APP_TIMEZONE`.

### 24. Envoi Natif OVHcloud (`mail()`) & Contrôle de l'Envoi dans l'Espace Pro — ✅ Terminée
- **Objectif :** ne plus exiger d'identifiants SMTP en production ; garder SMTP en option (Mailpit en local, ou compte dédié).
- **Fonctionnement prévu :**
  - Sans `SMTP_HOST` mais avec `MAIL_FROM` : envoi par la fonction PHP `mail()` de l'hébergement (même message MIME, pièce jointe `.ics` et logo intégré compris). Sans `MAIL_FROM` : envoi désactivé, comme aujourd'hui.
  - Onglet Configuration : encart en lecture seule « Envoi des emails » (mode `mail()` / SMTP, serveur, expéditeur — jamais de mot de passe) et bouton « M'envoyer un email de test » vers `pro_email`.
- **Règles OVHcloud à respecter** ([bonnes pratiques d'envoi d'e-mail](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/email-sending-best-practices)) :
  - domaine de `MAIL_FROM` attaché à l'hébergement (*Multisite*), sinon rejet ; en SMTP, `From:` identique au compte authentifié ;
  - adresse d'un tiers uniquement en `Reply-To:` ; quota `mail()` par hébergement et par heure ; suivi et déblocage dans l'onglet *Scripts e-mail* ;
  - SPF, DKIM et DMARC à jour (DKIM à activer).
- **Réalisé (27/10/2026) :** `Mailer::transport()` (`smtp` / `mail` / `none`), envoi `mail()` du même message MIME (en-têtes `To` / `Subject` confiés à `mail()`, expéditeur d'enveloppe `-f` = `MAIL_FROM`), `MailController` (`GET /admin/mail`, `POST /admin/mail/test`, routes protégées), encart `MailStatus` sous le groupe Coordonnées. Vérifié : email de test reçu dans Mailpit (SMTP) ; message `mail()` capturé dans le conteneur (structure complète, sujet accentué, en-têtes non dupliqués) et cas de refus.
- **Limites :** en local, rien ne change : Docker fournit `SMTP_HOST=mailpit`, donc tous les emails continuent d'arriver dans Mailpit. Seul le mode `mail()` n'est testable que sur l'hébergement (bouton d'email de test) ; `mail()` ne renvoie qu'un accepté / refusé, le motif d'échec du journal sera moins précis.

---

### 25. Mot de Passe & Email Professionnel Sécurisés (Changement, Réinitialisation, Vérification)
- **Constat (27/10/2026) :** aucun écran ne permet de changer le mot de passe (`admin123` par défaut, la clé `admin_password` n'est modifiable que par l'API) ; aucune procédure en cas d'oubli ; l'email professionnel, qui reçoit les codes de connexion (Item 12), se modifie sans vérification.
- **Changement du mot de passe :** dans l'espace Pro, avec saisie de l'ancien mot de passe, règles de robustesse (longueur minimale, refus des mots de passe trop courants), et **changement obligatoire tant que `admin123` est actif**. Le changement ferme les autres sessions et oublie les appareils de confiance (déjà assuré par `Auth`).
- **Mot de passe oublié :** lien sur l'écran de connexion ; envoi à `pro_email` d'un lien (ou code) à usage unique, valable 30 minutes, haché côté serveur ; réponse identique que l'adresse existe ou non ; limitation par IP comme pour la connexion ; à l'issue, toutes les sessions et appareils sont révoqués et un email de confirmation est envoyé.
- **Vérification de l'email professionnel :** une nouvelle adresse n'est retenue qu'après saisie d'un code reçu sur cette adresse ; l'ancienne adresse est prévenue du changement. Évite de se couper soi-même des codes de connexion, ou qu'une session volée détourne la récupération du compte.
- **Prérequis :** Item 12 ✅, envoi d'emails (Item 24 ✅). Sans envoi configuré, la réinitialisation est impossible : la documenter (procédure de secours via phpMyAdmin et `password_hash`).

---

## 📊 Matrice d'Ordonnancement & Suivi du Backlog

| Ordre Prioritaire | Réf. | Fonctionnalité | Domaine | Statut | Dépendances / Prérequis |
|---|---|---|---|---|---|
| **1** | **Item 2** | **Theming & effets visuels (Admin)** | Design / UI | 🚧 *En cours* | Variables CSS dynamiques |
| **2** | **Item 25** | **Mot de passe & email professionnel sécurisés (changement, réinitialisation, vérification)** | Sécurité / Authentification | ⏳ *À faire* | Items 12 et 24 ✅ |
| **3** | **Item 5** | **Conformité RGPD & Cookies** | Légal / Conformité | ⏳ *À faire* | Documentation & consentement formulaires |
| **4** | **Item 21** | **Exploitation des interventions avec AG Grid (Community)** | Espace Pro / Exploitation | ⏳ *À faire* | — |
| **5** | **Item 23** | **Calendrier des interventions avec FullCalendar** | Espace Pro / Planning | ⏳ *À faire* | `SlotEngine` (Item 16) ✅ |
| **6** | **Item 22** | **Génération des factures** | Espace Pro / Facturation | 🕒 *Plus tard* | Items 21 et 12 ✅ |
| — | **Item 20** | Compte SMTP configurable depuis l'espace Pro | Communication / Configuration | ❌ **Abandonné** | Remplacé par l'Item 24 |
| — | **Item 24** | Envoi natif OVHcloud (`mail()`) & email de test depuis l'espace Pro | Communication / Configuration | ✅ **Terminé** | — |
| — | **Item 12** | Sécurité : routes de gestion vérifiées côté serveur, code par email, appareil de confiance 10 jours | Sécurité / Authentification | ✅ **Terminé** | — |
| — | **Item 15** | Header & footer communs au tunnel de réservation (+ bouton d'abandon) | Vitrine / Navigation | ✅ **Terminé** | — |
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

