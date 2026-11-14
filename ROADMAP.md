# Feuille de Route & Suivi des Développements — Crénelio

Ce document répertorie le backlog fonctionnel, technique et design à implémenter pour les prochaines itérations de Crénelio.

---

## 📋 Backlog Prioritaire

### 1. Frais de Déplacement Hybrides (Par Prestation & Paliers Kilométriques) — ✅ Terminée
- **Moteur de calcul `api/core/TravelFee.php` :** distance géodésique (Haversine) entre `config.default_latitude/longitude` et l'adresse BAN du client, résolution des paliers et détection du hors-zone.
- **Endpoint public `POST /travel-fee/quote` :** décomposition tarifaire (prestation + déplacement + total, distance, hors-zone) consommée par le tunnel pour l'affichage avant confirmation.
- **Frais figés en base à la réservation :** `appointments.travel_fee`, `distance_km`, `is_out_of_zone` ; le montant est toujours recalculé côté serveur, jamais repris du client.
- **Espace Artisan :** mode et forfait de déplacement dans la création et l'édition des prestations, badge dédié sur les cartes, onglet « Zone & déplacement » pour les paliers et le rayon maximal.
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

### 2. Theming, Matérialisation & Effets Graphiques (Pilotable via Admin) — ✅ Terminée
- **Système de Theming dynamique :**
  - Variables CSS injectées dynamiquement (`--primary`, `--primary-hover`, `--radius`, etc.) depuis la table `config`.
  - Palette prédéfinie ou sélecteur de couleur personnalisée dans l'espace Artisan.
- **Effets Graphiques & Matérialisation activables :**
  - Options dans l'admin pour activer des styles esthétiques modernes :
    - *Glassmorphism / Effets de flou d'arrière-plan* (`backdrop-filter`).
    - *Ombres douces / Neumorphisme léger*.
    - *Animations & micro-interactions* (transitions fluides, feedback visuel au survol et validation de formulaire).

- **Réalisé (28/10/2026) :**
  - Couleurs, arrondis et ombres en variables CSS (`src/styles/_theme.scss`) ; survol et fond pâle dérivés par `color-mix()` ; fonctions `primary-alpha()` / `primary-tint()` (`_mixins.scss`) à la place des bleus codés en dur (halos de focus, hero, CTA).
  - Clés `theme_primary`, `theme_radius` (`compact` / `standard` / `rounded`), `theme_shadows` (`soft`), `theme_glass`, `theme_motion` ; appliquées par `src/utils/theme.ts` (variable `--color-primary`, attributs `data-*` sur `<html>`), mémorisées localement et reposées avant le premier rendu.
  - Espace Artisan, onglet Configuration : encart « Apparence » (6 couleurs lisibles + couleur libre, avertissement de contraste < 4,5:1, arrondis, 3 effets), aperçu en direct annulable.
  - Effets, tous désactivés par défaut : ombres douces teintées, verre dépoli (header, barre Pro, stepper, fond des fenêtres), animations (cartes soulevées, boutons, sections de la vitrine révélées au défilement) respectant `prefers-reduced-motion`.
  - Emails : couleur principale du thème.
  - Fond des pages `theme_background` : 12 fonds clairs prédéfinis (gris bleuté par défaut, blanc, ivoire, lin, sable, pierre, sauge, menthe, ciel, lavande, rose poudré, pêche) ou teinte légère de la couleur principale ; pas de couleur libre, pour garantir la lisibilité.
  - Ajouts du 28/10 : style des boutons `theme_buttons` (standard et plat selon le réglage des arrondis, pilule, material : angles droits et élévation, capitales en option pour tous les styles (`theme_button_caps`), relief : dégradé brillant et enfoncement au clic) ; arrondis `none` (sans arrondi) en plus de compact / standard / arrondi, appliqué à tous les boutons, désormais unifiés sur `.btn` (tailles `--lg` / `--xl`) : les copies `hero__cta-primary`, `vitrine-header__cta`, `contact-cta-btn` et `vitrine-service-card__cta` sont supprimées, plus aucun mouvement au survol ; arrondi intermédiaire `--radius-md` (boutons, champs, créneaux, calendrier) qui suit désormais le réglage des arrondis.
  - **Non repris :** carte de la zone d'intervention de l'espace Artisan (couleurs bleu / orange de couverture, `ZoneMap.tsx`).

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
  - Configuration sécurisée des identifiants SMTP via l'espace Artisan / `.env`.
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

- **Ajout (31/10/2026) :** fichier agenda réciproque pour le client, joint à son email de confirmation (`mon-rendez-vous.ics`, `METHOD:PUBLISH`) : créneau exact, prestation et tarifs, coordonnées de l'artisan, lien « Gérer ou annuler mon rendez-vous » (`URL` et description), rappel la veille. Aussi joint lors d'un renvoi depuis le journal « Emails ».

---

### 5. Conformité RGPD & Gestion des Cookies — ✅ Terminée
- **Protection des données personnelles :**
  - Mention explicite du consentement sur la collecte des coordonnées lors de la prise de rendez-vous.
  - Politique de conservation des données et droit d'accès/suppression.
- **Cookies & Traceurs :**
  - Bandeau d'information et consentement cookies si nécessaire (l'application étant sans traceurs tiers intrusifs, documenter l'exemption ou prévoir la bannière en cas d'ajout d'analytics).
- **Réalisé (28/10/2026) :**
  - **Information plutôt que consentement :** la prise de rendez-vous repose sur l'exécution du contrat (RGPD art. 6.1.b), pas sur le consentement ; une case à cocher serait inexacte. Notice d'information (art. 13) sous le formulaire de réservation et de demande hors zone (`PrivacyNotice`), avec lien vers la politique.
  - **Politique de confidentialité** générée depuis la configuration (`PrivacyPolicy`, fenêtre « Mentions légales & confidentialité ») : responsable, données et finalités, base légale, destinataires, services tiers (Base Adresse Nationale, tuiles OpenStreetMap), durée de conservation, droits et réclamation CNIL, cookies.
  - **Cookies :** aucun traceur (ni mesure d'audience, ni publicité, ni réseau social) ⇒ pas de bandeau ; les cookies de l'espace Artisan et le stockage du thème sont strictement nécessaires (exemptés) et listés dans la politique. **À revoir si un outil d'audience est ajouté.**
  - **Conservation :** `rgpd_retention_months` (36 par défaut, groupe Mentions légales) ; purge automatique une fois par jour à l'ouverture du planning (`Appointment::purgeOlderThan`), sans tâche planifiée.
  - **Effacement :** bouton « Effacer le client » du planning (`POST /appointments/:id/anonymize`) : nom, email, téléphone, adresse, notes, motif d'annulation et adresses du journal des emails effacés ; restent prestation, date, montant, code postal et commune. Aucune évolution de schéma.
  - **Non fait :** export des données d'un client (droit d'accès / portabilité) : l'artisan répond à partir de la fiche du rendez-vous ; à outiller si les demandes deviennent fréquentes.
  - Textes à faire relire par l'artisan, responsable du traitement : modèle, pas un avis juridique.

---

### 6. Identité Visuelle & Logo (Favicon, Header) — ✅ Terminée
- **Fichiers sous leurs noms d'usage** dans `api/storage/branding/` (`logo.svg|png`, `favicon.png|svg|ico`), déposables aussi par FTP, servis par `/api/branding/:kind` ; URLs versionnées exposées avec la config (`branding_logo_url`, `branding_favicon_url`).
- **Espace Artisan, groupe « Identité de l'entreprise » :** envoi PNG / SVG avec zoom et recadrage (`react-easy-crop`, chargé à la demande) ; un SVG reste vectoriel (seul son `viewBox` change).
- **Favicon :** généré depuis le logo ou depuis une image dédiée plus épurée, décliné en PNG 512 px + ICO (16/32/48) + SVG si la source l'est.
- **Replis :** sans logo, icône + nom de l'entreprise (`BrandMark`) ; sans favicon, icône par défaut servie par l'API. La suppression restaure le repli.
- **Sécurité :** contrôle des signatures PNG / ICO, SVG porteurs de script refusés, SVG servis sous CSP `sandbox`. Routes d'écriture non protégées tant que l'Item 12 n'est pas fait.

---

### 7. Footer Complet & Mentions Légales Pré-configurables — ✅ Terminée
- **Pied de page riche :**
  - Navigation, coordonnées de contact rapides (téléphone, email), rappel de la zone d'intervention.
  - Lien d'accès discret vers l'espace Artisan.
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
  - Cohérence des boutons vitrine et correction du lien Espace Artisan vers `/booking?view=admin`.

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

### 11. Gestion des Prestations Espace Artisan (Création, Édition, Suppression protégée) — ✅ Terminée
- **Formulaire d'ajout :**
  - Ajout du champ `description` pour détailler le contenu de la prestation lors de sa création.
- **Édition inline :**
  - Bouton « Modifier » sur chaque prestation pour ajuster en direct le nom, la description, la durée et le prix avec boutons « Enregistrer » et « Annuler ».
- **Suppression protégée :**
  - Bouton « Supprimer » permettant la suppression définitive uniquement si aucun rendez-vous n'est associé en base de données.
  - Gestion sécurisée de la contrainte d'intégrité référentielle avec message explicite invitant à la désactivation si des rendez-vous passés ou futurs existent.

---

### 12. Sécurité & Authentification Renforcée Espace Artisan (2FA Email OTP & Appareil de confiance 10 jours) — ✅ Terminée
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

### 14. IHM de Configuration Complète (Espace Artisan) — ✅ Terminée
- **Constat :** l'onglet « Paramètres » n'édite que les 7 clés de déplacement (`travel_tier_*`, `travel_max_km`) ; `company_name` y est seulement affiché. Toutes les autres clés de `config` ne se modifient qu'en base.
- **Objectif :** un formulaire par groupe dans l'espace Artisan :
  - *Entreprise & coordonnées* : `company_name`, `pro_name`, `pro_email`, `pro_phone`, `service_area`.
  - *Réservation & créneaux* : `slot_step_minutes`, `buffer_minutes`, `min_notice_hours`, `max_advance_days`.
  - *Carte* : `default_latitude`, `default_longitude`, `default_zoom`.
  - *Vitrine* : `vitrine_tagline`, `vitrine_about`, `vitrine_photo_url`.
  - *Engagements* : liste libre `vitrine_engagement_N` (ajout, suppression, ordre), cohérente avec le chargement en boucle de la vitrine.
  - *Mentions légales* : `legal_raison_sociale`, `legal_siret`, `legal_naf`, `legal_assurance`, `legal_adresse`, `legal_hebergeur`.
- **Hors périmètre :** changement du mot de passe (`admin_password_hash`), rattaché à l'Item 12.
- **Contraintes :** aucun secret dans `config` (exposée par `GET /admin/config`) ; tant que l'Item 12 n'est pas fait, ces écritures restent ouvertes côté serveur comme toutes les routes `/admin/*`.
- **Réalisé :** onglet « Configuration » piloté par `src/config/configSchema.ts` (groupes Identité, Coordonnées, Page vitrine, Engagements, Réservation, Carte, Mentions légales) ; toute clé non décrite reste éditable dans « Autres paramètres ». Engagements : `EngagementsEditor` (ajout, suppression, ordre), clés renumérotées de 1 à N à l'enregistrement, les clés en trop supprimées (`PUT /admin/config` : une valeur `null` supprime la clé). Logo et favicon : conseils de lisibilité selon l'image (fond opaque, logo sombre ou clair, image très allongée, résolution faible). Vitrine : cartes d'engagement réparties en rangées équilibrées de 4 au plus (5 → 3 + 2), dernière rangée centrée.
- **Améliorations possibles :** nombre de paliers de déplacement libre (le serveur en lit jusqu'à 10, l'écran en affiche 3) ; rafraîchir la config de l'application après un changement dans l'espace Artisan (aujourd'hui au rechargement).

---

### 15. Header & Footer Communs au Tunnel de Réservation — ✅ Terminée
- **Constat :** le header sticky et le `Footer` ne sont rendus que sur la vitrine (`VitrinePage.tsx`) ; la page `/booking` en est dépourvue.
- **Objectif :** conserver le header et le footer de la vitrine sur la partie réservation pour une navigation et une identité continues.
- **Pistes :** extraire le header de `VitrinePage.tsx` en composant réutilisable (ou layout commun aux routes publiques) ; sur `/booking`, header affiché en permanence (sans déclenchement lié au bouton du Hero) ; réutiliser `Footer` tel quel.
- **Réalisé (22/10/2026) :** composant `SiteHeader` partagé (vitrine : fixe et déclenché par le CTA du hero ; `/booking` : permanent en `position: sticky`, sans bouton « Prendre rendez-vous »), `Footer` rendu sous le stepper. Le lien « Espace Artisan » du header de réservation disparaît au profit de celui du footer. La page `/rdv/:token` garde son header allégé.

---

### 16. Horaires de Travail & Indisponibilités (Espace Artisan) — ✅ Terminée
- **Constat :** le moteur de créneaux lisait déjà `schedules` et `unavailabilities`, mais rien ne permettait de les modifier hors base ; le calendrier client laissait choisir des jours sans aucun créneau, et `POST /appointments` ne vérifiait que les chevauchements (pas les horaires ni le délai minimal).
- **Réalisé :** onglet « Horaires » (plage matin + après-midi par jour, jour travaillé ou non, validation serveur des plages) et gestion des indisponibilités (ajout, suppression). Calcul extrait dans `api/core/SlotEngine.php`, partagé par `GET /slots`, le nouveau `GET /slots/availability` (jours grisés dans le calendrier) et la validation de réservation. Espace Artisan chargé à la demande (bundle client de 500 à 420 ko).
- **Améliorations possibles :** plus de deux plages par jour ; horaires d'exception sur une date précise (ex. samedi après-midi ponctuel).

---

### 17. Espace Artisan en Pleine Page — ✅ Terminée
- **Réalisé :** route dédiée `/admin` (les anciens liens `/booking?view=admin` y redirigent), header fixe « Espace Artisan » + nom de l'entreprise, déconnexion à droite, lien Accueil dans le même onglet (le lien Espace client a été retiré le 01/11/2026) ; menu latéral rétractable (icônes seules, état mémorisé dans le navigateur). Composant `src/components/admin/AdminShell.tsx`.
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

### 20. Compte SMTP Configurable depuis l'Espace Artisan — ❌ Abandonné (27/10/2026)
- **Besoin initial :** saisir le compte d'envoi (hôte, port, identifiant, mot de passe, expéditeur) dans l'espace Artisan plutôt que dans `api/.env`.
- **Abandonné, remplacé par l'Item 24 :**
  - **Verrouillage :** le code de connexion (Item 12) part par ce SMTP ; un réglage erroné saisi depuis l'espace Artisan empêcherait toute connexion depuis un nouvel appareil, donc toute correction.
  - **Secret mal protégé :** chiffré, le mot de passe resterait déchiffrable avec une clé posée sur le même serveur ; une session volée suffirait à détourner tous les emails, codes de connexion compris.
  - **Peu utile :** un artisan seul ne change presque jamais de serveur d'envoi, et l'hébergement OVHcloud sait envoyer sans identifiants (`mail()`).

### 21. Exploitation des Interventions avec AG Grid (édition Community) — ✅ Terminée
- **Besoin :** une vue tabulaire des interventions dans l'espace Artisan pour les exploiter au quotidien : tri, filtres par colonne, recherche, regroupement par statut ou par commune, export CSV.
- **Choix :** `ag-grid-react` en **édition Community** (licence MIT). Ne pas utiliser les fonctionnalités Enterprise (export Excel natif, regroupement de lignes avancé, tableaux croisés) qui exigent une licence payante.
- **Pistes :** remplacer ou compléter la liste actuelle du planning ; thème AG Grid aligné sur les variables SCSS ; colonnes : date, client, prestation, adresse, frais de déplacement, statut ; actions de ligne réutilisant les appels existants (statut, reprogrammation, emails).
- **Réalisé (29/10/2026) :**
  - La liste du planning est remplacée par `InterventionsGrid` (AG Grid Community 36.2.0, licence MIT, chargée à la demande), toujours alimentée par la barre de filtres existante (recherche, statut, période, jour précis).
  - Colonnes triables, filtrables (texte, nombre, date), redimensionnables et déplaçables : date (badge « Échu à traiter »), prestation, « Client & lieu » (nom, téléphone cliquable, adresse et commune réunis ; filtre sur l'ensemble), frais de déplacement, statut. Colonnes séparées masquées, reprises à l'export CSV.
  - Sélection d'une ligne au clic (mode simple) : barre d'actions au-dessus de la grille (statut, Reprogrammer, Emails, Effacer) ; actions sur chaque ligne en option (colonne épinglée à droite, préférence mémorisée dans le navigateur).
  - Disposition mémorisée en base après chaque modification (ordre, largeur, visibilité, épinglage des colonnes, tri, taille de page ; jamais les valeurs de filtre, qui peuvent contenir un nom de client) : clé `config.ui_state_interventions` via `GET` / `PUT` / `DELETE /admin/ui-state/:id`, restaurée au chargement, bouton « Réglages par défaut ». Ces clés sont exclues de la configuration publique et refusées par `PUT /admin/config`.
  - Barre d'outils unique au-dessus de la grille : « Nouveau rendez-vous », recherche globale, actions sur chaque ligne, réglages par défaut, export ; barre d'actions de la sélection toujours présente à hauteur fixe (contrôles désactivés sans sélection) ; barre d'état accolée sous la grille (interventions affichées, total, filtres de colonnes actifs) — le composant natif `StatusBarModule` est réservé à l'édition Enterprise (vérifié dans les types d'AG Grid 36.2.0).
  - Pagination (20 / 50 / 100), traduction française (`@ag-grid-community/locale`), export CSV au séparateur `;` (lu directement par Excel en français), lignes échues teintées, rendez-vous ouvert depuis le calendrier mis en évidence et amené à l'écran.
  - Thème AG Grid branché sur les variables du thème (couleur principale, fond, arrondis).
  - Modules enregistrés un par un (liste client, filtres, pagination, CSV, styles de ligne, défilement, traduction) : ≈ 270 ko compressés au lieu de 350 avec `AllCommunityModule`.
  - **Écart avec la fiche :** le regroupement de lignes (par statut ou commune) est réservé à l'édition Enterprise, payante : remplacé par le tri et les filtres de colonnes.
- **Partie 2/2 — finitions (31/10/2026) :**
  - Parcours complet vérifié dans un navigateur sans interface (Playwright, captures d'écran) : tri, filtre de colonne, sélection, actions par ligne, taille de page, export CSV, disposition conservée au rechargement, réglages par défaut, ouverture depuis le calendrier — **aucune erreur ni alerte en console** (aucun module AG Grid manquant).
  - Barre d'outils : « Nouveau rendez-vous » et la recherche sur une même ligne (prioritaires), options en dessous si la place manque, option de colonne à gauche et boutons à droite ; texte d'aide de la recherche raccourci.
  - Prestation sur deux lignes au lieu d'être tronquée.
  - Couleurs des statuts alignées sur le calendrier : Confirmé = couleur principale, Terminé = succès.
  - « Réglages par défaut » ne réenregistre plus aussitôt la disposition (événements de colonnes ignorés jusqu'à la fin de la réinitialisation, comme à la restauration).
  - Poids de la grille conservé (≈ 281 ko compressés, chargée à la demande) : pas d'allègement possible sans retirer des fonctions.
### 22. Devis en Ligne avec Accord du Client & Aide à la Facturation Externe
- **Réorienté (31/10/2026) :** Crénelio génère les **devis** et fait **accepter** le client ; la **facture** reste par défaut dans l'outil de l'artisan, que Crénelio alimente. Une facturation interne conforme à la facturation électronique est prévue en option (Volet C), si la réglementation l'autorise.
- **Pourquoi pas de facture native :**
  - Facturation électronique : réception obligatoire pour toutes les entreprises au 1ᵉʳ septembre 2026, émission (B2B) et e-reporting (ventes aux particuliers) au 1ᵉʳ septembre 2027 pour les micro-entreprises et PME, via une plateforme agréée (PA). Un générateur maison devrait s'y raccorder et suivre une norme encore mouvante (calendrier relevé sur des sites spécialisés, à revérifier sur impots.gouv.fr avant de coder).
  - Les outils du marché (Indy, Tiime, Abby, Henrri, Pennylane, Axonaut…) couvrent déjà numérotation sans trou, avoirs, mentions et conformité électronique ; beaucoup d'artisans en utilisent un.
- **Pourquoi le devis dans Crénelio :**
  - Dépannage, réparation et entretien à domicile : devis en principe obligatoire **quel que soit le montant** depuis la réforme de 2017 (fin du seuil de 150 €), accepté avant l'exécution, sauf urgence absolue (texte consolidé de l'arrêté du 24 janvier 2017 à vérifier sur Légifrance).
  - Le devis n'est pas concerné par la facturation électronique, et Crénelio connaît déjà client, prestation, tarif et frais de déplacement.
- **Volet A — Devis en ligne (cœur) :**
  - Devis créé depuis un rendez-vous, prérempli (prestation, frais de déplacement), lignes ajoutables (pièces, main-d'œuvre), quantités, TVA ou mention d'exonération.
  - Mentions obligatoires : identité et SIRET de l'artisan, date, durée de validité, détail et total, conservation des pièces remplacées par le client ; numérotation propre aux devis.
  - Envoi par email avec lien sécurisé « Consulter et accepter le devis » ; accord horodaté et tracé (date, IP) ; statuts brouillon / envoyé / accepté / refusé / expiré dans l'espace Artisan.
  - Version imprimable (enregistrable en PDF par le navigateur), sans bibliothèque côté serveur.
- **Volet B — Aide à la facture dans l'outil de l'artisan :** ✅ points 1 et 2 réalisés le 02/11/2026 : réglage `invoicing_mode` (« Comment facturez-vous ? », groupe « Devis, TVA & facturation ») ; fiche `InvoicePrepDialog` (fenêtre d'un rendez-vous terminé et icône de la grille : devis accepté sinon prestation et déplacement, valeurs à copier une à une ou « Tout copier », débours au montant exact avec référence du justificatif et alerte au-delà du budget du mandat, débours omis si le mandat a été refusé, rappels de facturation) ; `BillingExportDialog` (CSV « ; » avec BOM : clients sans les données effacées, interventions terminées d'une période avec numéro de devis, HT, TVA, TTC et débours à part). Export des clients au **format d'import d'Indy** (17 colonnes, `PARTICULIER`, pays `FR`, séparateur « , », prénom = premier mot du nom ; source : [aide Indy](https://wikicompta.indy.fr/fr/articles/11008960-comment-importer-mes-clients-sur-indy)) ; Indy ne documente pas d'import de factures : les interventions restent en CSV générique. Reste : autres logiciels si besoin, puis le point 3.
  1. Fiche « Préparer la facture » sur chaque intervention terminée : champs prêts à copier un par un (client, adresse, lignes, quantités, prix, TVA) et « Tout copier » — fonctionne avec n'importe quel outil.
  2. Exports CSV : clients (import initial dans l'outil) et interventions terminées sur une période ; colonnes à caler sur les imports des 2-3 outils les plus utilisés avant de les figer.
  3. **À étudier (demandé le 11/11/2026)** : formaliser les exports selon les principaux outils de facturation (format d'import de chacun : colonnes, séparateurs, encodage, codes TVA), à partir de l'export Indy existant.
  4. Plus tard : intégration directe avec un outil disposant d'une API (Pennylane, Axonaut, Sellsy…) pour créer le brouillon de facture en un clic — seulement si l'artisan l'utilise ; jeton d'accès à stocker hors base.
- **Volet C — Facturation interne conforme (option, si la réglementation l'autorise) :** pour l'artisan sans outil de facturation, une facturation dans Crénelio respectant les exigences de la facturation électronique.
  - **Préalable bloquant :** vérifier sur les sources officielles (impots.gouv.fr, Légifrance, documentation des plateformes agréées) que l'émission par un logiciel tiers raccordé à une plateforme agréée est permise, les formats et le calendrier en vigueur, et l'absence de certification exigée du logiciel (contrairement aux logiciels de caisse). Sans confirmation, le volet n'est pas engagé.
  - **Socle commun :** mentions obligatoires, numérotation chronologique continue sans trou, facture **non modifiable** une fois émise (correction par avoir), archivage de la durée légale (à vérifier : 10 ans commercial, 6 ans fiscal), facture issue d'un devis accepté (Volet A).
  - **Ventes aux particuliers (B2C, cas principal) :** pas de facture électronique, mais **e-reporting** des données de transaction à partir de septembre 2027 (micro-entreprises, PME) : transmission via l'API de la plateforme agréée choisie par l'artisan, ou export au format qu'elle attend.
  - **Ventes aux professionnels (B2B) :** facture au format structuré (Factur-X, UBL ou CII selon la norme retenue), transmise **obligatoirement par une plateforme agréée** — Crénelio ne peut pas l'être : dépôt via l'API de la plateforme de l'artisan.
  - **Contraintes d'hébergement (offre Starter, PHP natif) :** un Factur-X (PDF/A-3 avec XML embarqué) est difficile sans bibliothèque ; privilégier un format XML structuré (CII / UBL) et une plateforme agréée qui produit elle-même la représentation lisible ; compatibilité à vérifier avant tout développement.
  - **Calendrier :** à engager après la stabilisation de l'obligation (au plus tôt pour septembre 2027), et seulement si le Volet B ne suffit pas aux artisans visés.
- **Réglage « Comment facturez-vous ? » :** « Avec mon logiciel » (fiche et exports affichés), « Avec Crénelio » (Volet C, s'il est disponible) ou « Je ne facture pas depuis Crénelio » (masqués) ; les devis restent proposés dans tous les cas.
- **RGPD :** devis et accords contiennent des données clients : à ajouter à l'effacement et à la purge (`Appointment::anonymizeWhere`) et à la politique de confidentialité ; durée de conservation des devis acceptés à définir (preuve contractuelle).
- **Prérequis :** Items 12, 21 (partie 1) et 32 ✅.
- **Pièces : précaution pour les micro-entrepreneurs (01/11/2026).** Revendre des pièces, c'est de l'achat-revente : activité commerciale aux seuils et cotisations propres. Par défaut, une pièce est donc un **débours** : achetée au nom et pour le compte du client final (facture du fournisseur à son nom), sur mandat donné avec l'accord du devis, refacturée à l'euro près, hors chiffre d'affaires et sans TVA de l'artisan. La ligne « fourniture revendue » n'existe qu'après activation explicite (`quote_allow_supply`), derrière un avertissement adapté à la forme juridique (entreprise individuelle : chiffre d'affaires, seuils et cotisations de la vente, activité mixte à déclarer, garanties ; société : objet social) ; fiche [`docs/legal/fr/achat-revente.md`](docs/legal/fr/achat-revente.md).
- **Cadre légal retenu (vérifié le 01/11/2026, sources ci-dessous ; fiches détaillées et extraits dans [`docs/legal/`](docs/legal/README.md)) :**
  - **Documents distincts et appellations :**
    1. **« Devis »** (« document précontractuel » de l'arrêté de 2017), numéroté, gratuit ou payant (mention obligatoire). Accepté, il devient le contrat : un exemplaire est remis au client sur support durable (email avec lien et version imprimable).
    2. **« Mandat de débours »** : accord écrit du client pour l'achat des pièces **en son nom et pour son compte**, avec la nature des pièces et le **budget maximum** (`debours_budget`). **Document séparé du devis, accord distinct** (02/11/2026) : le total du devis ne couvre que les prestations, les débours sont totalisés à part ; le client peut accepter le devis et refuser le mandat (il fournit alors les pièces) ; date et IP propres (`mandate_decided_at`, `mandate_ip`) ; imprimable seul.
    3. **« Pièces remplacées »** (annexe 2 de l'arrêté) : le client choisit de conserver ou non les pièces ; un refus vaut **décharge** signée, que le professionnel doit obtenir.
    4. **« Formulaire de rétractation »** (formulaire type) joint au contrat lorsqu'il est conclu à distance ou au domicile ; absent pour une intervention urgente.
    5. **« Note » / facture** : obligatoire au-delà de 25 € TTC, remise dès la prestation rendue et **avant tout paiement** (coordonnées, date, dates et lieu d'exécution, décompte détaillé, totaux HT et TTC, nom du client) ; établie dans l'outil de l'artisan (Volet B), débours sur une ligne distincte.
  - **Mentions du devis** (arrêté du 24 janvier 2017, art. 4) : date ; nom et adresse de l'entreprise, avec la mention **« EI »** accolée au nom pour un entrepreneur individuel (C. com. R526-27) et le SIRET ; nom du client ; lieu d'intervention ; nature exacte des travaux ; décompte détaillé (désignation, prix unitaire, unité : heure, mètre, unité… et quantité) ; frais de déplacement ; totaux HT et TTC et taux de TVA (ou mention de franchise) ; durée de validité ; devis gratuit ou payant ; hors établissement : existence et modalités du droit de rétractation. À ajouter : assurance professionnelle, médiateur de la consommation.
  - **Rétractation** (C. consom. L221-18, L221-25, L221-28 8°) : un devis accepté en ligne ou au domicile ouvre **14 jours** de rétractation, sauf travaux d'entretien ou de réparation **urgents** expressément demandés par le client, et seulement dans la limite des pièces et travaux strictement nécessaires (tout travail supplémentaire proposé sur place redevient rétractable). Commencer avant la fin du délai exige une **demande expresse** du client ; sans elle, rien n'est dû s'il se rétracte. Implémenté : case « intervention urgente » sur le devis, prise de connaissance du droit exigée pour accepter, demande d'exécution anticipée, date de fin du délai.
  - **Débours** (CGI art. 267 II 2° ; Portail auto-entrepreneur) : mandat écrit préalable (nature, budget maximum) ; facture ou ticket du fournisseur **au nom du client** avec ses coordonnées complètes, sinon pas de débours ; remboursement au montant exact, sans marge ni TVA ajoutée ; ligne distincte sur la facture ; mention « débours » dans le livre des recettes ; hors chiffre d'affaires et sans cotisations. **Jamais** de débours pour le carburant ou les frais kilométriques, les outils et le matériel de l'artisan. Client professionnel assujetti à la TVA : préférer qu'il paie lui-même le fournisseur (il récupère la TVA).
  - **Rappels à l'artisan** (dans l'éditeur de devis, la fiche « Préparer la facture » et la base documentaire de l'Item 40) :
    - acheter la pièce **au nom du client** (nom, adresse ; SIRET et TVA intracommunautaire si c'est un professionnel) ; un ticket à son propre nom transforme la pièce en revente ;
    - **conserver les originaux** des factures et tickets de caisse des pièces avancées (contrôle URSSAF ou fiscal), en remettre une **copie au client** avec la facture ;
    - refacturer **le montant exact** du justificatif, même s'il diffère de l'estimation du devis, dans la limite du budget du mandat (au-delà : nouvel accord du client) ;
    - noter « débours » dans le livre des recettes, à côté du montant, et ne pas le déclarer en chiffre d'affaires ;
    - remettre la facture **avant d'être payé** ; faire signer la décharge si le client ne garde pas les pièces remplacées ;
    - en urgence, ne proposer sur place que le strictement nécessaire ; tout le reste fait l'objet d'un devis avec délai de rétractation.
- **Sources :**
  - [Arrêté du 24 janvier 2017, Légifrance](https://www.legifrance.gouv.fr/jorf/id/JORFSCTA000033935539) (art. 4 et annexe 2).
  - [Fiche DGCCRF « Dépannage à domicile » (2018)](https://bretagne.dreets.gouv.fr/sites/bretagne.dreets.gouv.fr/IMG/pdf/2018_10_fiche_pratique_dgccrf_depannage-a-domicile.pdf) : document précontractuel, contrat hors établissement et formulaire de rétractation, urgence, note obligatoire au-delà de 25 € TTC, décharge des pièces.
  - [Portail auto-entrepreneur, frais de débours](https://www.portail-autoentrepreneur.fr/academie/gestion-auto-entreprise/facturation/frais-de-debours) et [actualité sur les débours](https://www.portail-autoentrepreneur.fr/actualites/les-frais-de-debours).
  - Sources secondaires concordantes : [Legifiscal (débours et TVA)](https://www.legifiscal.fr/tva/tva-francaise/regimes-specifiques/debours-tva.html), [Dougs](https://www.dougs.fr/blog/les-debours/), [INC, tableau des textes sur le devis](https://www.inc-conso.fr/sites/default/files/pdf/Tableau_devis.pdf), [INC, dépannage et rétractation](https://www.inc-conso.fr/node/9603), [mention EI (Bpifrance Création)](https://bpifrance-creation.fr/entrepreneur/actualites/ei-documents-concernes-nouvelle-mention-obligatoire).
  - À lire dans le texte avant l'étape 3 : C. consom. L221-5, L221-18, L221-25, L221-28 et le formulaire type de rétractation (annexe à l'art. R221-1) ; C. com. R526-27 ; BOFiP BOI-TVA-BASE-10-20-40.
- **Lecture des textes officiels (04/11/2026)** : extraits mot pour mot dans [`docs/legal/fr/textes/`](docs/legal/fr/textes/). Corrigé : formulaire type (annexe R221-1) et pièces remplacées (annexe 2) mot pour mot ; fin du délai de rétractation selon L221-19 (week-ends et jours fériés) ; reconnaissance de la perte du droit après exécution complète (L221-25) et refus de la rétractation dans ce cas (L221-28 1°) ; mention de franchise de l'article 293 E du CGI (migration `2026-11-04_item22_textes_officiels`) ; note dès 25 € TTC, double conservé deux ans ; immatriculation RNE ou RCS, assurance et médiateur (R111-2, R616-1). Doctrine BOFiP lue (BOI-TVA-BASE-10-10-30 III, 10-20-40-30 § 130, 10-20-40-20) : modèle des débours confirmé (mandat préalable et explicite, reddition de compte, comptes de passage, justification, facture au nom du client). Micro-entrepreneur (CSS L613-7, CGI 50-0, C. com. L123-28) : aucun texte n'exclut explicitement les débours du chiffre d'affaires (exclusion déduite de CGI 267 II 2°) ; mention « débours » au livre des recettes = bonne pratique ; seuils 83 600 € / 203 100 €.
- **Écarts restant à traiter (textes officiels, 04/11/2026)** :
  1. ✅ **Date ou délai d'exécution** du service (L221-5 3°) et **modalités de paiement et d'exécution** (R111-1 2°, R221-2 4°) : absents du devis.
  2. ✅ **Modalités de décompte du temps estimé** (arrêté du 24 janvier 2017, art. 2) : à régler et imprimer sous la main-d'œuvre.
  3. ✅ **Numéro de TVA intracommunautaire** si l'artisan est assujetti (R111-2 5°).
     → Réalisé le 04/11/2026 (écarts 1 à 3) : champs `execution_terms`, `payment_terms`, `time_counting` du devis (migration `2026-11-04b_item22_execution_paiement`), préremplis (date du rendez-vous, réglages `quote_payment_terms` et `quote_time_counting`), exécution et paiement **exigés à l'envoi** ; affichés sur la page du client, la version imprimable et l'email d'envoi ; décompte imprimé sous la main-d'œuvre ; réglage `legal_vat_number` affiché avec le SIRET (page, impression, fiche de facturation).
  4. ✅ **Garanties légales** applicables et **traitement des réclamations** (R111-1 2° et 3°, R221-2 5° et 6°), « s'il y a lieu ». Code civil 1792 à 1792-7 lus : pour des travaux constituant un ouvrage, garanties décennale (dix ans), de bon fonctionnement (deux ans minimum) et de parfait achèvement (un an) à compter de la réception, non limitables par contrat (1792-5). Proposition : réglage « mes travaux peuvent relever des garanties des constructeurs » qui imprime ces garanties sur le devis (avec l'attestation décennale de l'écart 10) ; sinon aucune mention.
     → Réalisé le 04/11/2026 (écarts 4 et 10) : réglage `quote_builder_guarantees` (écran Entreprise) ; case « Travaux relevant des garanties des constructeurs » sur le devis (`builder_works`) ; garanties de parfait achèvement, de bon fonctionnement et décennale rappelées sur la page et la version imprimable (`builderGuarantees.ts`) ; attestation PDF déposée avec sa fin de validité (`InsuranceAttestation`, `api/storage/insurance/`, `insurance_attestation_until`), **jointe à l'email d'envoi** et consultable depuis le devis (`/quotes/token/:token/attestation`) ; envoi refusé sans attestation valide ; avertissement dans l'Espace Artisan 30 jours avant l'échéance. Traitement des réclamations (R111-1 2°) : réglage `legal_complaints`, affiché sur le devis et dans l'exemplaire.
  5. ✅ **Exemplaire du contrat** (L221-9) : l'email d'accord doit contenir toutes les informations de L221-5 et le formulaire type ; il ne renvoie aujourd'hui qu'à la version imprimable.
  6. ✅ **Pas de paiement avant sept jours** pour un contrat signé au domicile du client, hors urgence (L221-10) : rappel à l'artisan.
     → Réalisé le 04/11/2026 (écarts 5 et 6) : l'email d'accord est l'**exemplaire complet** du contrat (L221-9) : lignes, entreprise (identité, SIRET, TVA, immatriculation, assurance), exécution, paiement, décompte, mention de franchise, réclamations, médiateur, garanties des constructeurs, modèle d'information sur la rétractation et **formulaire type** (`LegalTexts.php`, textes identiques à la page et à l'impression) ; rappel des sept jours sans paiement pour un devis signé au domicile du client (L221-10) dans la fiche « Préparer la facture ».
  7. **Prix sur la vitrine et dans la réservation** (arrêté de 2017, art. 2 et 3 : taux horaires TTC, décompte du temps, forfaits, déplacement, devis gratuit ou payant ; arrêté du 3 décembre 1987, lu le 04/11/2026 : art. 1 prix **TTC** effectivement payé, art. 3 mention explicite de ce que le prix ne comprend pas, comme les pièces, art. 14 prix précis avant la conclusion d'une commande à distance) : Item 39. ✅ Section « Tarifs » de la vitrine (prestations TTC, taux horaire de main-d'œuvre TTC calculé depuis le taux HT, décompte du temps, paliers de déplacement, devis gratuit ou payant `quote_default_price`, éléments non compris `pricing_exclusions`, mention de TVA), lien dans le pied de page ; prix précis « … € TTC » sur les cartes (fin du « À partir de »), dans le tunnel et la confirmation (« Total TTC »), précisions sous le total de la réservation.
  8. ✅ **Mot « artisan »** (C. artisanat L241-2) : vocabulaire **neutre partout** côté public (04/11/2026) : « le professionnel » dans la vitrine, la réservation, les devis, les emails et la politique de confidentialité ; lien du pied de page « Accès professionnel » ; textes par défaut de la vitrine neutres (migration `2026-11-04_item22_textes_officiels`, seulement s'ils n'ont pas été modifiés). Les textes saisis par l'artisan restent sous sa responsabilité ; l'écran de gestion garde « Espace Artisan » (non public).
  9. **TVA des pièces posées** par un artisan assujetti (BOI-TVA-BASE-10-20-40-20 § 140-150 : vente au taux propre des pièces sauf si pièces et fournitures n'excèdent pas 50 % du coût total) : taux des lignes « fourniture revendue ». ✅ Contrôle indicatif dans l'éditeur (`supplyVatCheck`, `quoteRules.ts`) : part des fournitures revendues dans le coût total HT (débours exclus), rappel du régime applicable (≤ 50 % : taux de la prestation, avertissement si le taux diffère ; au-delà : taux propre, lignes distinctes, sauf pièces adaptées) ; aucun taux imposé ni blocage (comparaison en principe pièce par pièce) ; fiche `achat-revente.md` complétée.
  10. ✅ **Attestation d'assurance décennale jointe aux devis et factures** (C. assur. L241-1, L243-2 ; 75 000 € d'amende et six mois d'emprisonnement, L243-3) pour les professionnels dont la responsabilité décennale peut être engagée : dépôt de l'attestation (PDF, `api/storage/`), jointe à l'email du devis et à la version imprimable ; réglage « soumis à l'assurance décennale ». Modèle d'attestation lu (C. assur. A243-2 à A243-5, arrêté du 5 janvier 2016) : document signé par l'assureur, à déposer tel quel, avec sa date de fin de validité (avertissement avant expiration). Champ : ouvrages existants exclus sauf incorporés dans l'ouvrage neuf (L243-1-1).
  11. **Contrat assimilé à une vente** (C. consom. L221-1, II) quand le devis transfère la propriété d'un bien (« fourniture revendue ») : délai de rétractation à compter de la réception du bien, passages (4) et (5) du modèle d'information. ✅ Colonne `sale` (calculée à l'enregistrement des lignes) et `goods_received_at` ; rétractation ouverte dès l'acceptation et jusqu'à 14 jours après la remise du bien, date saisie dans l'éditeur (`PUT /quotes/:id/goods-received`, pas de date future) ; modèle d'information complété des passages (1) b et (5) a, b, c (bien récupéré par le professionnel à ses frais, (4) sans objet), identiques en PHP et en TypeScript, repris dans la page, l'impression, l'email et le PDF. Migration `2026-11-05b_item22_vente`.
  12. **Mentions des factures** (CGI, annexe II, art. 242 nonies A, lu le 04/11/2026) : fiche « Préparer la facture » complétée (nature des opérations, 8° bis ; numéro d'identification du client professionnel, 1°) ; ces mentions s'imposent aux micro-entreprises à partir du 1er septembre 2027 (facturation électronique). ✅ Client professionnel : raison sociale et SIREN/SIRET facultatifs sur le devis (contrôle 9 ou 14 chiffres), repris sur le devis, son PDF et la fiche « Préparer la facture », effacés à l'anonymisation. Droit de rétractation inchangé (L221-3 : extension possible aux professionnels de cinq salariés au plus, hors champ de leur activité principale ; on ne le restreint donc pas).
  13. ✅ **Formulaire de rétractation remplissable** (demandé le 04/11/2026) : aujourd'hui recopié en texte brut dans l'exemplaire envoyé par email. Prévoir à la place : (a) un **formulaire en ligne** (`/devis/:token/retractation`), prérempli (contrat, client, date d'accord), qui transmet la déclaration par la fonction de rétractation existante et s'imprime proprement ; (b) un **PDF remplissable** (champs AcroForm : nom, adresse, date, signature) généré en PHP natif sans bibliothèque (offre Starter) et **joint à l'email d'accord**, pour que le contrat soit bien « accompagné du formulaire type » (L221-9) ; l'email ne garde alors qu'un encart mis en forme avec les deux accès. Texte du modèle inchangé (annexe R221-1, mot pour mot). (c) Une fois le formulaire rempli et validé, **téléchargement en PDF** de la déclaration complétée (date et heure d'envoi comprises), au même titre que le **devis complet**, le **mandat de débours** et le formulaire vierge : boutons « Télécharger en PDF » sur la page du devis et dans l'Espace Artisan (aujourd'hui, ces documents ne s'obtiennent que par l'impression du navigateur). (d) **Informer le client** de cette facilité, dans l'email d'accord, sur la page du devis et sur le formulaire papier, par exemple : « Pour vous rétracter plus simplement, un formulaire déjà rempli avec les références de votre contrat vous attend en ligne : il vous suffit de le vérifier puis de le valider. Un accusé de réception vous est aussitôt envoyé par email (Code de la consommation, articles L221-21 et D221-5). » Cette information complète le modèle réglementaire sans le modifier, et ne mentionne pas Crénelio : c'est le site du professionnel.
     → Réalisé le 04/11/2026 : (a) page `/devis/:token/retractation` (`QuoteWithdrawalPage`) : modèle de l'annexe R221-1 mot pour mot, prérempli (contrat, date d'accord, nom, adresse, email), transmis par la fonction de rétractation (« Confirmer la rétractation ») ; adresse de la déclaration enregistrée (`withdrawal_address`, effacée avec le rendez-vous) ; (b) **PDF remplissable** (champs AcroForm préremplis, apparence intégrée pour l'aperçu macOS) produit par `SimplePdf` / `QuotePdf` en PHP natif, **joint à l'email d'accord** (l'encart remplace le texte brut) et téléchargeable (`/quotes/token/:token/formulaire.pdf`) ; **déclaration validée en PDF** jointe aux accusés de réception et téléchargeable (`…/declaration.pdf`) ; (d) information du client sur la page, l'impression, l'email et le PDF (`ONLINE_FORM_NOTICE`). (c) **PDF du devis complet et du mandat de débours** (`QuotePdf::quote` / `mandate`) : logo (PNG décodé en PHP, transparence comprise), couleur principale du thème, mise en page sobre (en-tête, blocs client et intervention, tableau, totaux, sections, cadres de signature ou trace de l'accord, pied de page numéroté) ; **joints d'office aux emails** (envoi : devis, mandat, attestation décennale ; accord : devis, mandat et formulaire au client, devis et mandat à l'artisan) ; boutons « Télécharger en PDF » sur la page du devis, la version imprimable et dans l'éditeur (`/quotes/token/:token/{devis|mandat|formulaire|declaration}.pdf`) ; `Mailer` accepte plusieurs pièces jointes.
  14. ✅ **Main-d'œuvre au temps passé** (demandé le 07/11/2026, arrêté du 24 janvier 2017, art. 2 et 3 : taux horaire et temps estimé, ou montant forfaitaire) → Réalisé le 07/11/2026 : réglage `quote_labour_hourly` (temps × taux, par défaut ; décoché : main-d'œuvre au forfait, taux ni prérempli ni publié), arrondi `quote_time_step` (minute, quart d'heure, demi-heure, heure entamés) et minimum `quote_time_minimum` (migration `2026-11-07_item22_temps_passe`) ; décompte du temps déduit de ces réglages s'il n'est pas saisi (`timeCountingText`, `Quote::timeCountingText`) ; saisie « 1h20 » / « 80 min » sur une ligne de main-d'œuvre, convertie en heures arrondies (`billedHours`) ; bouton « Diagnostic » (diagnostic et recherche de panne, minimum compris) ; **choix par devis** (demandé le 07/11/2026) : « Main-d'œuvre facturée » (décochée : lignes de main-d'œuvre retirées, ex. déplacement et courte investigation) et « Arrondir le temps » (décochée : temps exact, sans minimum, décompte imprimé « Temps décompté à la minute, sans minimum », repris par « Préparer la facture ») ; arrondi global « Aucun » possible ; temps réellement passé dans « Préparer la facture », montant recalculé, signalé s'il dépasse l'estimation du devis accepté.
  15. ✅ **Saisie des lignes et conditions du devis** (demandé le 10/11/2026) → Réalisé le 10/11/2026 : unité fixe par type (h pour la main-d'œuvre au temps, prix unitaire à l'heure ; forfait ; liste d'unités pour pièces et fournitures) ; calculs dans quantité et prix (« 120/3 », `evaluate`) ; ligne **Remise** (`discount`, migration `2026-11-10_item22_remise` : montant ou « 10 % » des prestations, déduit HT au taux de la ligne, jamais des débours, refusée au-delà des prestations) ; désignation facultative pour main-d'œuvre, déplacement et remise (`DEFAULT_LINE_LABELS` / `Quote::DEFAULT_LABELS`) ; forfaits proposés depuis le catalogue (libellé et prix) ou libres ; déplacement prérempli selon la prestation et la distance (BAN puis `/travel-fee/quote`) ; doublons type + désignation signalés (fusionner ou garder la première) ; date (15 jours par défaut hors urgence, après le délai de rétractation ; aujourd'hui si urgent) ou délai « sous n jours » ; listes pour les modalités de paiement et le décompte du temps (arrondi du devis suivant le décompte choisi), « Autre » en saisie libre ; logo en tête de la version imprimable ; « Retour au devis » masqué quand la version imprimable est ouverte dans un nouvel onglet. Validité et prix du devis déjà préremplis depuis les réglages.
  16. ✅ **Version imprimable alignée sur le PDF, formulaire type avant le contrat** (demandé le 10/11/2026) → Réalisé le 10/11/2026 : en-tête, blocs Client / Intervention (Mandant / Mandataire), tableau, totaux, sections et dates de `QuotePrintPage` calqués sur `QuotePdf` (référence) ; formulaires PDF (rétractation, déclaration) avec le même en-tête (logo, couleur du thème) ; cases « □ » du PDF remplacées par « [ ] » (glyphe absent de la police standard, affiché « ? ») ; formulaire type de rétractation joint à l'email d'envoi du devis hors urgence (L221-5, 7°), téléchargeable dès l'envoi, sans date d'accord ni lien en ligne avant l'accord. Formulaire type prérempli à l'identique dans le PDF et la version imprimable (contrat, « commandé le » à l'accord et, pour une vente, « reçu le » à la remise des pièces, nom et adresse du client ; signature et date au client), `LegalTexts::withdrawalFormDates` ; mention du formulaire en ligne seulement après l'accord.
  17. ✅ **Écarts de la recette du 11/11/2026** (`docs/recette-parcours.md`, section Bilan) : ~~(1) défaut~~ ✅ 11/11 : `AppointmentDialog` en parcours descendant (statut et date modifiés, récapitulatif, « Prévenir le client » pour l'annulation, le déplacement et la décision d'une demande, bouton « Valider ») ; un choix « Annulé » (ou la décision d'une demande en attente) dans la liste ouvre la fenêtre au lieu d'enregistrer ; ~~(2)~~ ✅ 11/11 : confirmation « Ne pas prévenir le client ? » et motif d'annulation facultatif ; (3) fond du calendrier : libre / indisponible ; (4) raison précise d'un créneau non proposable ; (5) refus de déplacement signalé au pro ; (6) doublon de déplacement non détecté ; (7) remise excessive trop discrète ; (8) choix vide « — » des modalités de paiement ; (9) RDV resté confirmé après refus ou rétractation (à décider) ; (10) valeurs du devis visibles dans « Préparer la facture » ; (11) rafraîchir rendez-vous, calendrier, indisponibilités et devis (bouton « Actualiser » et rechargement automatique au retour sur l'onglet ; tableau de bord : bouton en bout de ligne de l'en-tête), demandé le 11/11 ; (12) tableau de bord : 2 cartes de jour par ligne au plus, demandé le 11/11 ; (13) motifs d'annulation du pro prédéfinis (liste et « Autre »), demandé le 11/11 ; (14) écran Entreprise : regrouper la case « garanties des constructeurs » avec l'attestation et le n° d'assurance qui en dépendent, demandé le 11/11 ; (15) ✅ version imprimable corrigée le 11/11 ; (16) devis d'un rendez-vous listés dans sa fenêtre (numéro, statut), « Nouveau devis » distinct (le bouton « Devis » crée aujourd'hui un brouillon à chaque clic) ; (17) avertissement L221-10 daté en tête de « Préparer la facture » tant que sept jours ne sont pas écoulés depuis l'accord, demandé le 11/11 ; (18) exports nommés `aaaa-mm-jj_crenelio_export_<objet>.csv` ; (19) effacement d'un client : avertir pour un RDV à venir non annulé, et vérifier dans les textes ce qu'un contrat (devis accepté) doit conserver avant de l'anonymiser ; (20) déplacement d'un RDV dont le devis porte une date d'exécution : le signaler et proposer un nouveau devis (écart 9 étendu : annulation d'un RDV avec devis envoyé ou accepté, acceptation d'un devis dont le RDV est annulé). **Corrigés le 11/11 : 1, 2, 6, 7, 8, 11 (bouton « Actualiser » dans la barre des grilles, à droite avec les actions globales (export CSV, réglages), `DataGrid` `onRefresh`, déplacé de l'en-tête le 13/11 ; rechargement automatique au retour sur l'onglet et toutes les 5 minutes), 12, 13, 14, 15, 18 ; puis 4 (raison précise : `SlotEngine::unavailableReason`), 5 (« Annulation après déplacement » au pro), 10, 16 (devis listés dans la fenêtre du rendez-vous), 17 (avertissement L221-10 daté). Puis 3 (fond du calendrier : heures fermées plus marquées, indisponibilités hachurées, trajet avant et après chaque rendez-vous actif, légende « Fermé » et « Trajet »). Puis, le 12/11 (textes lus, `docs/legal/fr/textes/`) : 9 et 20 (statut de devis « Annulé » = rétractation de l'offre, C. civ. 1115-1116 ; avertissements et annulation des devis envoyés dans la fenêtre du rendez-vous ; rappel 1193 / 1218 pour un devis accepté ; avertissement côté client), 19 et 21 (devis acceptés conservés dix ans, y compris sous 120 € par prudence, L123-22 ; purge des devis sans rendez-vous ; confirmation d'effacement détaillée ; politique de confidentialité), 17 complété (jours fériés : `Holidays`, API Jours fériés, réserve auto-rechargée, script cron facultatif). Fiches `annulation-devis.md` et `conservation-effacement.md`. Tous les écarts de la recette sont traités : à vérifier à l'usage.**
  18. ✅ **Cycle de vie des données des clients** (demandé le 14/11/2026, recherche d'antériorité : Sweeney 2002, groupe de l'article 29 WP216 2014, ENISA 2019, CNIL guide des durées de conservation 2020 et référentiel gestion commerciale 2022) : une ligne gardée avec date, prestation, montant et commune n'est pas anonyme (WP216 p. 9-10 : isolement, recoupement) → **suppression** en fin de délai au lieu d'une « anonymisation » (rendez-vous et devis non conclus) ; contrats conservés dix ans en **archivage intermédiaire** (CNIL : tri des données, séparation logique : statut « Archivé », hors des listes courantes) ; rendez-vous d'un contrat conservé réduit au strict nécessaire puis supprimé avec lui ; textes corrigés (« sans lien avec vous » trop affirmatif). Statistiques agrégées : non nécessaires aujourd'hui, à prévoir avec l'Item 43 si besoin. → Réalisé le 14/11 : `Appointment::erase`, `purgeOlderThan`, `purgeQuotes` (suppression), `minimiseWhere` (rendez-vous d'un contrat conservé réduit, téléphone retiré du devis conservé), devis `archived` et filtre « En cours / Archivés / Tous » de l'écran Devis, confirmation d'effacement, politique de confidentialité et fiche `conservation-effacement.md` corrigées.
  19. 🚧 **Valeur juridique de l'acceptation en ligne et figement du contrat** (demandé le 14/11/2026 ; textes lus : C. civ. 1127-1, 1127-2, 1174, 1359, 1365 à 1368 ; décret n° 2017-1416, art. 1) : l'acceptation actuelle (lien personnel reçu par email, réponses, case de reconnaissance, clic, date et adresse IP, accusé de réception par email) est une **signature électronique simple** : valable, mais sa fiabilité n'est **pas présumée** (seule la signature qualifiée l'est, décret 2017-1416) ; en cas de litige, le professionnel doit prouver l'identification et l'intégrité (C. civ. 1366, 1367). Pistes : (a) **figer le contrat à l'acceptation** (instantané des mentions de l'entreprise ou PDF accepté, avec empreinte SHA-256 enregistrée : intégrité de l'écrit, C. civ. 1366 ; « intact » au sens de L213-1) ; (b) code à usage unique envoyé par email au moment d'accepter (identification renforcée, utile aussi pour la mention « Lu et approuvé » des pièces remplacées, C. civ. 1174 al. 2) ; (c) annoncer sur le devis les modalités d'archivage et d'accès au contrat (C. civ. 1127-1, 4°, et L213-1) ; (d) au-delà du seuil de la preuve par écrit (C. civ. 1359, décret n° 80-533 à déposer), envisager une signature avancée ou qualifiée par un prestataire (coût, hors offre Starter ?). À déposer : eIDAS (règlement 910/2014 consolidé, art. 3, 25, 26), décret 80-533. → **(a) et (c) réalisés le 14/11/2026** : `frozen_config` (mentions de l'entreprise copiées à l'envoi, `Quote::documentConfig` pour la page, la version imprimable, les PDF et les emails), `contract_hash` (SHA-256 du contrat et de la trace de l'accord, calculé à l'acceptation, contrôlé dans l'éditeur : « Contrat figé »), migration `2026-11-14b_item22_figement_contrat` ; annonce de la conservation et de l'accès au contrat sur la page, la version imprimable, le PDF et l'email d'envoi (`LegalTexts::contractArchiving`, `contractArchiving`). Restent (b) code à usage unique et (d) signature avancée ou qualifiée au-delà du seuil de la preuve par écrit.
