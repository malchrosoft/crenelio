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
  17. ✅ **Écarts de la recette du 11/11/2026** (`docs/recette-parcours.md`, section Bilan) : ~~(1) défaut~~ ✅ 11/11 : `AppointmentDialog` en parcours descendant (statut et date modifiés, récapitulatif, « Prévenir le client » pour l'annulation, le déplacement et la décision d'une demande, bouton « Valider ») ; un choix « Annulé » (ou la décision d'une demande en attente) dans la liste ouvre la fenêtre au lieu d'enregistrer ; ~~(2)~~ ✅ 11/11 : confirmation « Ne pas prévenir le client ? » et motif d'annulation facultatif ; (3) fond du calendrier : libre / indisponible ; (4) raison précise d'un créneau non proposable ; (5) refus de déplacement signalé au pro ; (6) doublon de déplacement non détecté ; (7) remise excessive trop discrète ; (8) choix vide « — » des modalités de paiement ; (9) RDV resté confirmé après refus ou rétractation (à décider) ; (10) valeurs du devis visibles dans « Préparer la facture » ; (11) rafraîchir rendez-vous, calendrier, indisponibilités et devis (bouton « Actualiser » et rechargement automatique au retour sur l'onglet ; tableau de bord : bouton en bout de ligne de l'en-tête), demandé le 11/11 ; (12) tableau de bord : 2 cartes de jour par ligne au plus, demandé le 11/11 ; (13) motifs d'annulation du pro prédéfinis (liste et « Autre »), demandé le 11/11 ; (14) écran Entreprise : regrouper la case « garanties des constructeurs » avec l'attestation et le n° d'assurance qui en dépendent, demandé le 11/11 ; (15) ✅ version imprimable corrigée le 11/11 ; (16) devis d'un rendez-vous listés dans sa fenêtre (numéro, statut), « Nouveau devis » distinct (le bouton « Devis » crée aujourd'hui un brouillon à chaque clic) ; (17) avertissement L221-10 daté en tête de « Préparer la facture » tant que sept jours ne sont pas écoulés depuis l'accord, demandé le 11/11 ; (18) exports nommés `aaaa-mm-jj_crenelio_export_<objet>.csv` ; (19) effacement d'un client : avertir pour un RDV à venir non annulé, et vérifier dans les textes ce qu'un contrat (devis accepté) doit conserver avant de l'anonymiser ; (20) déplacement d'un RDV dont le devis porte une date d'exécution : le signaler et proposer un nouveau devis (écart 9 étendu : annulation d'un RDV avec devis envoyé ou accepté, acceptation d'un devis dont le RDV est annulé). **Corrigés le 11/11 : 1, 2, 6, 7, 8, 11 (bouton « Actualiser » en bout d'en-tête, rechargement au retour sur l'onglet et toutes les 5 minutes), 12, 13, 14, 15, 18 ; puis 4 (raison précise : `SlotEngine::unavailableReason`), 5 (« Annulation après déplacement » au pro), 10, 16 (devis listés dans la fenêtre du rendez-vous), 17 (avertissement L221-10 daté). Puis 3 (fond du calendrier : heures fermées plus marquées, indisponibilités hachurées, trajet avant et après chaque rendez-vous actif, légende « Fermé » et « Trajet »). Puis, le 12/11 (textes lus, `docs/legal/fr/textes/`) : 9 et 20 (statut de devis « Annulé » = rétractation de l'offre, C. civ. 1115-1116 ; avertissements et annulation des devis envoyés dans la fenêtre du rendez-vous ; rappel 1193 / 1218 pour un devis accepté ; avertissement côté client), 19 et 21 (devis acceptés conservés dix ans, y compris sous 120 € par prudence, L123-22 ; purge des devis sans rendez-vous ; confirmation d'effacement détaillée ; politique de confidentialité), 17 complété (jours fériés : `Holidays`, API Jours fériés, réserve auto-rechargée, script cron facultatif). Fiches `annulation-devis.md` et `conservation-effacement.md`. Tous les écarts de la recette sont traités : à vérifier à l'usage.**
- **Avancement :**
  1. ✅ **Base et API (01/11/2026)** : tables `quotes` / `quote_lines` (migration `2026-11-01_item22_quotes`), `Quote` / `QuoteController`, brouillon prérempli depuis un rendez-vous, totaux (débours à part), envoi (numéro, lien, échéance), expiration, réponse du client (pièces remplacées ou décharge, mandat de débours, rétractation et exécution anticipée, intervention urgente, date et IP), effacement RGPD avec le rendez-vous, réglages `quote_*` (groupe « Devis & TVA ») et mentions `legal_form` (entreprise individuelle ou société), `legal_ei_mention` (« EI » ou « Entrepreneur individuel »), `legal_capital`, `legal_rm`, `legal_mediator` (écran Entreprise).
  2. ✅ **Écran « Devis » (02/11/2026)** : grille (`QuotesGrid`, menu Interventions), éditeur (`QuoteEditor` : client, nature des travaux, intervention urgente, lignes typées avec TVA si assujetti, totaux et mention de franchise, débours à part avec rappels à l'artisan, validité, devis gratuit ou payant), envoi confirmé puis lecture seule avec la réponse du client, copie en nouveau brouillon, bouton « Devis » dans la fenêtre d'un rendez-vous (brouillon prérempli). Règles partagées : `quoteRules.ts`.
  3. ✅ **Côté client (02/11/2026)** : envoi par email avec lien (`QuoteNotifier`, journal `quote_notifications`, email du client et `APP_URL` exigés) ; page `/devis/:token` (`QuotePage` : identité légale, mentions, travaux, mandat de débours distinct avec réponse oui / non, pièces remplacées, information sur la rétractation et case de prise de connaissance, exécution anticipée, médiateur) ; emails d'accord (exemplaire au client, avis à l'artisan) ; **fonction de rétractation en ligne** (« Renoncer au contrat ici » → « Confirmer la rétractation », obligatoire depuis le 19 juin 2026, ordonnance n° 2026-2 et décret n° 2026-3) avec accusé de réception et avis à l'artisan, statut `withdrawn`. Session MySQL alignée sur `APP_TIMEZONE` (horodatages probants).
  4. ✅ **Versions imprimables (02/11/2026)** : page `/devis/:token/imprimer` (`QuotePrintPage`), un document par feuille, enregistrable en PDF par le navigateur : **devis** (identité légale, mentions, lignes, pièces remplacées avec « Lu et approuvé », modèle d'information sur la rétractation, cadres de signature ou trace de l'accord en ligne), **mandat de débours** (mandant, mandataire, pièces, budget maximum, conditions, signatures), **formulaire de rétractation** (modèle européen sans télécopieur : **à confirmer contre l'annexe R221-1 en vigueur**). Accès : éditeur (« Versions imprimables », « Page du client », journal des emails) et page du client.

### 23. Calendrier des Interventions avec FullCalendar — ✅ Terminée
- **Besoin :** gérer le calendrier d'intervention dans l'espace Artisan avec des vues jour / semaine / mois.
- **Choix :** `@fullcalendar/react` avec les plugins **standard** (licence MIT : `daygrid`, `timegrid`, `interaction`, `list`). Les plugins Premium (vues ressources, timeline) sont payants et non nécessaires pour un artisan seul.
- **Pistes :** affichage des rendez-vous, indisponibilités et horaires de travail ; glisser-déposer pour reprogrammer, validé par le `SlotEngine` (refus si le créneau n'est pas proposable) ; création d'un rendez-vous au clic (formulaire de l'Item 19) ; locale `fr`, fuseau `APP_TIMEZONE`.
- **Réalisé (29/10/2026) :**
  - Onglet « Calendrier » de l'espace Artisan (`AppointmentCalendar`, chargé à la demande : FullCalendar 6.1.22, plugins MIT `daygrid`, `timegrid`, `interaction`, `list` ; adaptateur React aligné en 6.x). Vues mois / semaine / jour / liste, locale `fr`, indicateur de l'heure courante.
  - Horaires de travail (plages matin / après-midi) en zones ouvertes, indisponibilités en bandes grises, rendez-vous colorés par statut (légende), annulés masqués par défaut.
  - Glisser-déposer des rendez-vous à venir (en attente / confirmés) : `PUT /appointments/:id/reschedule` avec `check` → validation par `SlotEngine` en ignorant le rendez-vous déplacé (`excludeId`) ; refus 409 `slot_unavailable`, puis « Déplacer quand même » (`force`) ou retour à la place d'origine. La fenêtre « Reprogrammer » du planning reste libre.
  - Clic sur un jour : nouveau rendez-vous à cette date (formulaire de l'Item 19) ; clic sur un rendez-vous : planning filtré sur ce jour (nouveau filtre « jour précis », aussi disponible à la main), rendez-vous mis en évidence et amené à l'écran (statut, emails, effacement).
  - Couleurs reprises du thème (variables CSS de FullCalendar). Datetimes envoyés en heure locale naïve (cohérent avec `APP_TIMEZONE`).
  - Testé par l'API : refus d'un dimanche, déplacement forcé, créneau proposé accepté, rendez-vous sur son propre créneau accepté, reprogrammation libre inchangée. **Interface non vue dans le navigateur.**

### 24. Envoi Natif OVHcloud (`mail()`) & Contrôle de l'Envoi dans l'Espace Artisan — ✅ Terminée
- **Objectif :** ne plus exiger d'identifiants SMTP en production ; garder SMTP en option (Mailpit en local, ou compte dédié).
- **Fonctionnement prévu :**
  - Sans `SMTP_HOST` mais avec `MAIL_FROM` : envoi par la fonction PHP `mail()` de l'hébergement (même message MIME, pièce jointe `.ics` et logo intégré compris). Sans `MAIL_FROM` : envoi désactivé, comme aujourd'hui.
  - Onglet Configuration : encart en lecture seule « Envoi des emails » (mode `mail()` / SMTP, serveur, expéditeur — jamais de mot de passe) et bouton « Envoyer un email de test » vers `pro_email` ou un destinataire libre (testeur, développeur ; 5 envois / 10 min par session).
- **Règles OVHcloud à respecter** ([bonnes pratiques d'envoi d'e-mail](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/email-sending-best-practices)) :
  - domaine de `MAIL_FROM` attaché à l'hébergement (*Multisite*), sinon rejet ; en SMTP, `From:` identique au compte authentifié ;
  - adresse d'un tiers uniquement en `Reply-To:` ; quota `mail()` par hébergement et par heure ; suivi et déblocage dans l'onglet *Scripts e-mail* ;
  - SPF, DKIM et DMARC à jour (DKIM à activer).
- **Réalisé (27/10/2026) :** `Mailer::transport()` (`smtp` / `mail` / `none`), envoi `mail()` du même message MIME (en-têtes `To` / `Subject` confiés à `mail()`, expéditeur d'enveloppe `-f` = `MAIL_FROM`), `MailController` (`GET /admin/mail`, `POST /admin/mail/test`, routes protégées), encart `MailStatus` sous le groupe Coordonnées. Vérifié : email de test reçu dans Mailpit (SMTP) ; message `mail()` capturé dans le conteneur (structure complète, sujet accentué, en-têtes non dupliqués) et cas de refus.
- **Limites :** en local, rien ne change : Docker fournit `SMTP_HOST=mailpit`, donc tous les emails continuent d'arriver dans Mailpit. Seul le mode `mail()` n'est testable que sur l'hébergement (bouton d'email de test) ; `mail()` ne renvoie qu'un accepté / refusé, le motif d'échec du journal sera moins précis.

---

### 25. Mot de Passe & Email Professionnel Sécurisés (Changement, Réinitialisation, Vérification) — ✅ Terminée
- **Constat (27/10/2026) :** aucun écran ne permet de changer le mot de passe (`admin123` par défaut, la clé `admin_password` n'est modifiable que par l'API) ; aucune procédure en cas d'oubli ; l'email professionnel, qui reçoit les codes de connexion (Item 12), se modifie sans vérification.
- **Changement du mot de passe :** dans l'espace Artisan, avec saisie de l'ancien mot de passe, règles de robustesse (longueur minimale, refus des mots de passe trop courants), et **changement obligatoire tant que `admin123` est actif**. Le changement ferme les autres sessions et oublie les appareils de confiance (déjà assuré par `Auth`).
- **Mot de passe oublié :** lien sur l'écran de connexion ; envoi à `pro_email` d'un lien (ou code) à usage unique, valable 30 minutes, haché côté serveur ; réponse identique que l'adresse existe ou non ; limitation par IP comme pour la connexion ; à l'issue, toutes les sessions et appareils sont révoqués et un email de confirmation est envoyé.
- **Vérification de l'email professionnel :** une nouvelle adresse n'est retenue qu'après saisie d'un code reçu sur cette adresse ; l'ancienne adresse est prévenue du changement. Évite de se couper soi-même des codes de connexion, ou qu'une session volée détourne la récupération du compte.
- **Prérequis :** Item 12 ✅, envoi d'emails (Item 24 ✅). Sans envoi configuré, la réinitialisation est impossible : la documenter (procédure de secours via phpMyAdmin et `password_hash`).
- **Réalisé (28/10/2026) :**
  - `Auth` : codes à 6 chiffres unifiés (`issueCode` / `checkCode` : connexion, réinitialisation 30 min, email), changement et réinitialisation du mot de passe (12 caractères min., mots de passe courants, nom de l'entreprise / email refusés), changement imposé de `admin123` par `Auth::guard` (403 `password_change_required`, sauf en développement), email de confirmation à chaque changement. Aucune évolution de schéma.
  - Mot de passe oublié : réponse identique dans tous les cas, 5 demandes par IP en 15 min.
  - Email professionnel : retenu après code reçu sur la nouvelle adresse, ancienne adresse prévenue ; enregistré directement si aucun envoi n'est possible.
  - `PUT /admin/config` refuse désormais `admin_password` et toute modification de `pro_email`.
  - Front : « Mot de passe oublié ? » (`AdminLogin`), écran de changement imposé, section *Mot de passe* et champ *Email professionnel* vérifié (onglet Configuration), bandeau en développement si `admin123` est actif.
  - Procédure de secours documentée (`DEPLOYMENT*.md`, étape 5 ter) : rétablir le hash de `seed_init.sql` dans phpMyAdmin.
  - Testé par l'API : changement (mauvais actuel, trop faible, accepté), fermeture des autres sessions, refus par la configuration générique, réinitialisation complète, changement d'email avec avis à l'ancienne adresse ; base remise dans son état initial. **Écrans non vus dans le navigateur.**

### 26. Adresse Publique du Site (`APP_URL`) Détectée Automatiquement
- **Objectif :** supprimer `APP_URL` des réglages obligatoires de `api/.env` (liens des emails, expéditeur par défaut `noreply@` domaine). Facultatif si le déploiement passe par l'Item 27, qui demande l'adresse du site.
- **Fonctionnement prévu :** à défaut d'`APP_URL`, l'adresse est relevée lors d'une requête de l'espace Artisan authentifiée (schéma + hôte), **mémorisée une seule fois** puis figée ; affichée dans l'encart « Envoi des emails » avec un bouton pour la redéfinir (session Pro requise). `APP_URL` reste prioritaire s'il est renseigné.
- **Risque à traiter :** l'en-tête `Host` est fourni par le visiteur ; le déduire à chaque requête permettrait d'empoisonner les liens envoyés par email. D'où la capture limitée à une session Pro et le figeage. Ne jamais utiliser l'hôte d'une requête publique.

### 27. Déploiement Initial Interactif (`npm run deploy:init`) — ✅ Terminée
- **Objectif :** installer Crénelio sur un hébergement mutualisé sans éditer de fichier à la main, en préparant **depuis le poste local** tout ce que le serveur n'a pas encore.
- **Choix (27/10/2026) : script local plutôt qu'assistant web.**
  - Les assistants web (WordPress, PrestaShop, Matomo…) visent des produits installés par des non-développeurs ; ils imposent une page sensible exposée sur Internet jusqu'au verrouillage, un dossier de code accessible en écriture par PHP et un verrou à ne jamais rater.
  - Ici, l'installation part du dépôt et de `npm run deploy:build` : la pratique courante des outils de déploiement (Deployer, Capistrano…) est de traiter `.env` et les fichiers propres à l'installation comme **partagés** : créés une seule fois sur le serveur, jamais écrasés ensuite. Le script reprend ce principe sans outil supplémentaire.
- **Fonctionnement prévu :**
  - Questions interactives (Node, sans dépendance, Windows / macOS / Linux) avec valeurs par défaut : adresse du site, accès à la base (tels qu'affichés dans l'espace client OVHcloud), expéditeur (défaut `noreply@` domaine), fuseau (`Europe/Paris`), compte SMTP facultatif (défaut : `mail()` de l'hébergement).
  - **Le serveur est-il déjà installé ?** Interrogation de `https://<site>/api/health` (nouvelle route publique, sans aucun secret : `installed`, base joignable, version du schéma). Déjà installé ⇒ pas de `.env` dans le paquet, seulement le code et la liste des migrations à appliquer. Sinon ⇒ paquet initial.
  - **Paquet initial :** build habituel + `api/.env` généré + fiche pas à pas : import `schema.sql` puis `seed_init.sql` (jamais sur une base qui contient déjà des tables), dossiers `api/storage/` à rendre accessibles en écriture, HTTPS, puis première connexion avec changement obligatoire de `admin123` et email de test (Items 25 et 24).
  - Réponses conservées localement dans un fichier ignoré par Git (`.deploy/`, droits restreints) pour les déploiements suivants ; jamais de secret dans le dépôt ni dans un paquet de mise à jour.
- **Reste à la main :** créer la base et l'hébergement chez OVHcloud, envoyer les fichiers (FTP ou Git, cf. `DEPLOYMENT*.md`), importer le SQL dans phpMyAdmin — le script les guide sans les faire.
- **Prérequis :** Item 25 (changement obligatoire du mot de passe par défaut). L'Item 26 devient facultatif : l'adresse du site est demandée par le script.
- **Pistes ultérieures :** envoi automatique par SFTP / `lftp` si les identifiants sont fournis ; vérification post-déploiement via `/api/health`.
- **Réalisé (29/10/2026) :**
  - `scripts/deploy-init.mts` (TypeScript exécuté directement par Node, sans dépendance) : questions avec valeurs par défaut et contrôle des saisies, mot de passe masqué, réponses mémorisées sans mot de passe (`.deploy/answers.json`), compilation, paquet `deploy/<date>-premier-deploiement|mise-a-jour/` (`www/`, `sql/`, `INSTRUCTIONS.md`).
  - `GET /api/health` (public, sans secret) : `installed`, `database` (`ok` / `empty` / `error`), `schema_version` ; connexion dédiée qui n'interrompt pas la requête en cas d'échec.
  - Version du schéma : clé `config.schema_version` (migration `2026-10-29_item27_schema_version.sql` + `seed_init.sql`) ; une mise à jour ne joint que les migrations postérieures.
  - Premier déploiement : `api/.env` (droits 600) et squelette `api/storage/` (jamais leur contenu) ; mise à jour : ni `.env` ni `storage/`.
  - Testé : premier déploiement (site injoignable), mise à jour contre l'API locale avec une version de schéma antérieure (une migration jointe), absence de mot de passe dans les réponses mémorisées.

### 28. Paquet d'Installation Téléchargeable (Release Prête à Déployer)
- **Objectif :** installer Crénelio sans cloner le dépôt ni compiler : un artisan (ou son prestataire) télécharge un paquet prêt à déployer.
- **Contenu de l'archive** (publiée à chaque version, ex. GitHub Releases) : bundle React déjà compilé, API PHP, `sql/` (schéma, socle, migrations), scripts d'installation (Item 27, ou équivalent sans Node), fiches de déploiement FR / EN, `CHANGELOG`.
- **Exclus :** `.env`, contenu de `api/storage/`, données de démonstration (`seed_test_data.sql`).
- **Intégrité :** somme de contrôle (SHA-256) publiée avec chaque archive (signature reportée).
- **Mise à jour sans l'Item 29 :** la même archive sert aux mises à jour manuelles (FTP ou Git), en suivant « Mettre à jour un site en ligne » de `DEPLOYMENT*.md` (sauvegarde, migrations, envoi du code).
- **Prérequis :** Item 27.
- **Réalisé (01/11/2026, version 0.0.1) :** `npm run release` (`scripts/release.mts`) refuse un dépôt non commité et une version absente de `CHANGELOG.md`, compile, assemble `www/` (mêmes listes que `deploy:init`, `scripts/package-files.mts`, plus `api/.env.example`), `sql/` et les guides, puis produit `crenelio-<version>.zip`, sa somme `.sha256` et les notes de version. Signature (SSH) écartée pour la bêta : la somme SHA-256 suffit à garantir un téléchargement intact ; à reprendre si l'archive est distribuée hors de GitHub. Publication (`git tag`, `gh release create --prerelease`) laissée au mainteneur.

### 29. Mise à Jour depuis le Site Hébergé (Espace Artisan) — sous réserve de l'hébergement
- **Objectif :** mettre à jour Crénelio en un clic depuis l'espace Artisan, à partir des paquets de l'Item 28.
- **Étude de faisabilité d'abord**, sur l'offre Starter : `ZipArchive` (sinon `PharData`), téléchargement sortant (`allow_url_fopen` / cURL), temps d'exécution maximal, droits d'écriture de PHP sur le code. **Si l'hébergement ne le permet pas, l'item est abandonné** : la mise à jour manuelle de l'Item 28 reste la voie standard.
- **Fonctionnement prévu :**
  - Encart « Version » : version installée, dernière version disponible, notes de version.
  - Téléchargement, **vérification de la signature** (clé publique embarquée), sauvegarde préalable (fichiers remplacés + export de la base), mode maintenance, remplacement du code uniquement (`api/.env` et `api/storage/` jamais touchés), migrations en attente, contrôle via `/api/health`, **retour arrière automatique** en cas d'échec.
  - Version du schéma suivie en base pour savoir quelles migrations appliquer.
- **Sécurité :** le code doit être accessible en écriture par PHP, ce qui permettrait à une faille PHP de le réécrire. Désactivable (`APP_SELF_UPDATE=off` dans `api/.env`) ; réservé à une session Pro authentifiée (Items 12 et 25) avec reconfirmation du mot de passe.
- **Espace disque :** sauvegarde + archive + code doivent tenir dans 1 Go (Starter) ; purge des anciennes sauvegardes.
- **Prérequis :** Item 28.

### 30. Effets Visuels Avancés (Optionnels)
- **Prolonge l'Item 2** ✅ : mêmes réglages dans l'encart « Apparence », tous désactivés par défaut, et tous coupés si l'appareil demande moins d'animations (`prefers-reduced-motion`).
- **Liserés animés :** bordure lumineuse qui tourne autour des cartes et du bouton principal (dégradé conique dérivé de `--color-primary`, angle animé via `@property`), au survol ou en continu sur le CTA. Repli statique si `@property` n'est pas pris en charge.
- **Cartes 3D au survol :** soulèvement + inclinaison qui suit la position de la souris (`perspective`, `rotateX` / `rotateY` calculés en JS sur `pointermove`, reflet lumineux qui suit le curseur), retour en douceur à la sortie. Désactivé sur écran tactile (`hover: none`) et limité à quelques degrés pour rester lisible (public senior).
- **Points d'attention :** performances sur mobile (limiter les animations continues, `will-change` ponctuel), rendu Safari pour `@property`.
- **Thème sombre :** séparé dans l'Item 34.
- **Prérequis :** Item 2 ✅.

### 31. Traduction du Site (Multilingue)
- **Objectif :** proposer la vitrine, la réservation et les emails clients en plusieurs langues (français par défaut, anglais d'abord), pour la clientèle non francophone.
- **Périmètre :**
  - Textes de l'interface publique (vitrine, tunnel de réservation, page de gestion `/rdv/:token`, notice et politique de confidentialité) extraits dans des fichiers de traduction, sur le modèle de `src/data/legalCreditsI18n.json` ; aucune dépendance lourde.
  - Sélecteur de langue discret (header de la vitrine), langue proposée selon le navigateur, choix mémorisé localement.
  - Emails et fichier `.ics` dans la langue du client (langue mémorisée avec le rendez-vous : évolution de schéma + migration).
  - Textes saisis par l'artisan (accroche, présentation, engagements, prestations) : traduction facultative par langue dans l'espace Artisan, repli sur le français.
  - Dates, heures et montants formatés selon la langue (`Intl`).
- **Hors périmètre :** l'espace Artisan reste en français.
- **Points d'attention :** langues écrites de droite à gauche (déjà gérées pour les crédits), longueur des textes traduits dans les boutons, référencement (`lang`, `hreflang`).

### 32. Fiabilité des Notifications (Annulation, Reprogrammation, Décision, Anti-abus) — ✅ Terminée
- **Constat (31/10/2026) :** trois manques bloquants avant une mise en ligne.
  - **Annulation silencieuse :** un client qui annule par son lien ne prévient pas l'artisan (son agenda garde l'intervention) ; l'artisan qui annule ou reprogramme depuis le planning ne prévient pas le client.
  - **Formulaires publics sans limite :** la demande hors zone (et la réservation) envoient deux emails par soumission, sans plafond : un robot peut inonder la boîte de l'artisan et épuiser le quota horaire d'envoi OVHcloud (codes de connexion compris).
  - **Décision par le planning :** passer une demande « En attente » à « Confirmé » ou « Annulé » depuis le planning n'envoie ni les confirmations ni l'email de refus (seul le lien de décision le fait).
- **Fonctionnement prévu :**
  - Annulation par le client : email à l'artisan (+ `.ics` d'annulation qui retire l'événement de son agenda) et confirmation au client.
  - Annulation ou reprogrammation par l'artisan (planning, calendrier) : email au client (+ `.ics` mis à jour ou annulé).
  - Changement de statut d'une demande en attente : même effet que le lien de décision (confirmations, ou email de refus).
  - Limitation par adresse IP des soumissions publiques qui envoient des emails (réservation, demande hors zone).
  - Nouveaux types dans `appointment_notifications` (migration + `schema_version`), visibles dans le journal « Emails ».
- **Prérequis :** Item 4 ✅, Item 24 ✅.
- **Réalisé (31/10/2026) :**
  - Types `cancellation_client`, `cancellation_pro`, `reschedule_client`, `reschedule_pro` (migration `2026-10-31_item32_notification_types.sql`, `schema.sql`, `schema_version`), libellés dans le journal « Emails ».
  - Annulation par le client : email à l'artisan avec `.ics` `METHOD:CANCEL` (même UID : l'agenda retire l'intervention) + confirmation au client. Annulation par l'artisan : email au client. Fichiers agenda versionnés (`SEQUENCE` d'après la date de mise à jour).
  - Reprogrammation (fenêtre du planning et glisser-déposer du calendrier) : email au client avec ancienne et nouvelle date, `.ics` mis à jour ; case « Prévenir le client par email » dans la fenêtre ; `notify: false` pour un changement silencieux.
  - Demande « En attente » confirmée ou annulée depuis le planning : traitée comme le lien de décision (confirmations, ou refus ; jeton de décision vidé).
  - `RateLimit` (fichier, clés hachées) : réservation 10 / h / IP, demande hors zone 5 / h / IP, 40 / h tous visiteurs confondus ; 429 au-delà.
  - **Agendas (iTIP) :** le fichier du client devient une invitation (`METHOD:REQUEST` puis `CANCEL`, organisateur = entreprise, client participant `PARTSTAT=ACCEPTED;RSVP=FALSE`) pour que les messageries mettent à jour ou retirent l'événement au lieu de créer des doublons ; l'agenda de l'artisan est aussi mis à jour quand il déplace (`reschedule_pro`) ou annule lui-même (`cancellation_pro`), même sans prévenir le client. Chaque email concerné rappelle la limite : seul un événement ajouté depuis un email est relié (sinon, modification manuelle). **Synchronisation non garantie** (dépend de la messagerie) : fiabilisée par l'Item 33.
  - Testé par l'API et Mailpit : reprogrammation (avec et sans email), annulation par l'artisan, annulation par le client (deux emails, `.ics` CANCEL), demande confirmée et refusée depuis le planning, plafond (6ᵉ envoi refusé) ; suite création → déplacement (client prévenu, puis non) → annulation : même UID par destinataire, `SEQUENCE` croissante, `REQUEST` puis `CANCEL`, organisateur et participant présents. Rendez-vous de test supprimés.

### 33. Abonnement d'Agenda de l'Artisan (Flux iCal Privé) — ✅ Terminée
- **Constat (31/10/2026) :** les invitations par email (Item 32) ne **garantissent** pas la synchronisation avec Google Agenda, Outlook ou l'iPhone : elles dépendent de la messagerie, de l'ajout initial depuis l'email et de la lecture des messages. Le pilotage reste dans Crénelio, il faut donc un miroir fiable et à sens unique.
- **Optionnel :** désactivé par défaut. Tant que l'artisan ne l'active pas dans l'espace Artisan, aucune adresse n'existe et la route répond 404 ; le désactiver supprime le jeton (l'adresse cesse aussitôt de fonctionner). Les invitations par email (Item 32) fonctionnent sans lui.
- **Fonctionnement prévu :**
  - Adresse d'agenda privée et secrète (`webcal://<site>/api/calendar/<jeton>.ics`, jeton aléatoire long, jamais devinable), à laquelle l'artisan s'abonne une fois dans son agenda ; Crénelio en reste la source unique.
  - Flux iCal (RFC 5545) généré à la volée : rendez-vous à venir et récents (fenêtre limitée), mêmes UID que les invitations de l'Item 32 (pas de doublon), statut, coordonnées du client et notes d'accès ; indisponibilités en option.
  - Espace Artisan (Configuration) : interrupteur « Abonnement d'agenda » (activer / désactiver), adresse à copier, boutons « Ajouter à Google Agenda / Outlook / Apple », **régénération du jeton** (l'ancienne adresse cesse de fonctionner), date du dernier accès au flux.
- **Limites à afficher :** délai de rafraîchissement fixé par chaque agenda, pas par Crénelio (Apple réglable jusqu'à 5 min, Outlook quelques heures, Google jusqu'à ≈ 24 h) ; les invitations par email restent la mise à jour immédiate, le flux en est le filet de sécurité. Sens unique : une modification faite dans l'agenda externe ne revient pas dans Crénelio.
- **Sécurité et RGPD :** le flux contient des données clients : jeton secret (comparaison à temps constant), en-têtes anti-cache et anti-indexation, aucune donnée au-delà de la fenêtre, données anonymisées exclues ; flux décrit dans la politique de confidentialité ; jeton stocké hors de la configuration publique.
- **Hors périmètre :** synchronisation bidirectionnelle par les API Google / Microsoft (OAuth, jetons, conflits) — contraire au pilotage depuis Crénelio et trop lourde pour l'offre Starter.
- **Prérequis :** Item 32 ✅.
- **Réalisé (31/10/2026) :**
  - `CalendarFeed` (réglage dans `api/storage/auth/calendar-feed.json`, jeton aléatoire de 48 caractères, comparaison à temps constant) ; routes `GET` / `POST` / `PUT` / `DELETE /admin/calendar-feed` (session Pro) et `GET /calendar/:token.ics` (404 si désactivé ou jeton inconnu).
  - `ICalendar::feed` : rendez-vous non annulés d'un mois passé à un an à venir, mêmes UID et créneaux élargis du trajet que les invitations, demandes en attente « [À valider] » (`TENTATIVE`), indisponibilités en option ; `REFRESH-INTERVAL` / `X-PUBLISHED-TTL` de 15 min suggérés ; en-têtes `no-store` et `noindex`.
  - Espace Artisan, Configuration → Coordonnées : encart « Abonnement d'agenda » (interrupteur, adresse à copier, boutons Google / Outlook / Apple, indisponibilités, délais de rafraîchissement, risque de doublon avec les invitations, date de dernière lecture, régénération et désactivation confirmées).
  - Politique de confidentialité : copie possible dans l'agenda personnel de l'artisan.
  - Testé par l'API : 401 sans session, 404 désactivé, activation, flux (en-têtes, pas de METHOD ni d'organisateur, statuts), dernière lecture, régénération (ancienne adresse 404), indisponibilités, désactivation. **Abonnement réel dans Google / Outlook / Apple non testé (nécessite un site en ligne).**

### 34. Thème Sombre (Inversion des Couleurs & Palettes Adaptées)
- **Séparé de l'Item 30 (31/10/2026)** : chantier transversal, indépendant des effets visuels.
- **Mode :** clair, sombre, ou automatique selon l'appareil (`prefers-color-scheme`), choisi par l'artisan dans l'encart « Apparence » ; option d'un bouton de bascule pour les visiteurs (choix mémorisé dans le navigateur).
- **Inversion des couleurs :**
  - **Prérequis technique :** l'échelle des gris (`$gray-*`), les fonds blancs codés (`white`), les ombres et les couleurs d'état (succès, alerte, erreur et leurs fonds pâles) passent en variables CSS, comme la couleur principale ; chaque valeur reçoit son pendant sombre (gris inversés, surfaces sombres étagées plutôt que noir pur, ombres remplacées par des contours ou des surfaces plus claires).
  - Inventaire préalable des couleurs codées ou dérivées partout dans le SCSS (`white`, `color-mix(..., white)` des teintes, pastilles de statut, calendrier FullCalendar, grille AG Grid, carte de zone).
- **Adaptation des palettes :**
  - **Couleur principale** conservée, éclaircie automatiquement en mode sombre si son contraste sur fond sombre est insuffisant (`color-mix`), avec le même contrôle de contraste que l'Item 2 ; déclinaisons (`--color-primary-light`, `primary-tint()`) recalculées vers le sombre.
  - **Fond sombre :** pendant de la palette claire de l'Item 2 (`theme_background`) : fonds sombres prédéfinis (anthracite, nuit, ardoise, brun, forêt…), associés au fond clair choisi ou dérivés de la couleur principale ; pas de couleur libre, contraste du texte vérifié.
  - **Couleurs d'état et statuts** (confirmé, en attente, terminé, annulé) : variantes sombres lisibles, y compris dans le calendrier et la grille.
- **Bibliothèques :** thème sombre de FullCalendar (variables `--fc-*`) et d'AG Grid (`colorScheme` / `withParams` du thème Quartz) branchés sur les mêmes variables.
- **Hors périmètre :** les emails restent en clair (rendu des messageries non maîtrisé) ; tuiles OpenStreetMap assombries par filtre ou laissées claires (à décider).
- **Points d'attention :** contrastes vérifiés dans les deux thèmes (WCAG AA, public senior), logo pensé pour fond clair (variante ou fond derrière le logo), images et illustrations, pas de flash clair au chargement (appliqué avant le premier rendu comme le thème actuel).
- **Prérequis :** Item 2 ✅.

### 38. Menu de l'Espace Artisan par Catégories — ✅ Terminée
- **Demandé le 01/11/2026.** Catégories au style de rubrique (losange, intitulé et filet en couleur principale ; filet seul en menu replié) : *Interventions* (Rendez-vous, Calendrier, Indisponibilités, Devis), *Activité* (Prestations, Horaires, Déplacement, Zone d'intervention), *Paramétrage* (Entreprise, Vitrine, Thème, Compte).
- **Configuration éclatée :** les sous-onglets de « Horaires » deviennent deux écrans ; l'ancien fourre-tout « Configuration » est réparti entre Horaires (semaine type et créneaux), Entreprise (identité, logo, mentions légales), Vitrine (zone couverte, page vitrine, engagements, carte), Thème (apparence, appelé à s'étoffer) et Compte (coordonnées de l'artisan, email professionnel, envoi des emails, abonnement d'agenda, autres paramètres, mot de passe en bas).

### 35. Tableau de Bord de l'Espace Artisan (Jours en Cartes & Carte du Jour) — ✅ Terminée
- **Demandé le 31/10/2026** : page d'accueil de l'espace Artisan, en tête du menu.
- **Jours affichés** (`DashboardOverview`) : le jour travaillé précédent, aujourd'hui (même non travaillé) et les deux jours travaillés suivants, d'après les horaires hebdomadaires. Une carte (`Panel`) par jour : interventions non annulées dans l'ordre horaire, numérotées, couleur du statut, horaire, client, prestation et commune ; nombre et montant du jour ; ajout d'un rendez-vous à cette date. Un clic ouvre la fenêtre du rendez-vous (`AppointmentDialog`).
- **Carte du jour :** point de départ de l'artisan et interventions numérotées comme dans la liste (même adresse : un repère « 1, 2 »), cadrage automatique ; le bouton de chaque carte de jour change le jour affiché.
- **Lieu de départ** (choisi sur la carte, mémorisé comme préférence d'affichage `ui_state_dashboard`) : point de départ des interventions, adresse de l'entreprise ou siège social (mentions légales, localisé à la demande). Un lieu non renseigné reste proposé, grisé avec sa raison ; point de départ et entreprise regroupés s'ils coïncident. Indépendant de l'origine du calcul des frais (`travel_fee_origin`).
- **Positions enregistrées :** la position calculée à la réservation (frais de déplacement) est désormais conservée (`appointments.latitude` / `longitude`, migration `2026-10-31_item35_appointment_coordinates`). Les rendez-vous antérieurs sont localisés une fois par la Base Adresse Nationale à leur premier affichage, puis enregistrés (`PUT /appointments/:id/coordinates`). Donnée personnelle : effacée avec l'adresse (`anonymizeWhere`) et décrite dans la politique de confidentialité.

### 36. Suivi d'Intervention pour l'Artisan (Étoffer le Tableau de Bord)
- **Demandé le 31/10/2026** : rendre le meilleur service possible à l'artisan pour suivre ses interventions, en priorité sur téléphone (usage sur le terrain).
- **Pistes, par ordre d'intérêt :**
  - **Fiche du jour sur mobile :** appel et SMS en un geste, itinéraire vers l'adresse (liens Google Maps, Waze, Plans d'Apple), précisions d'accès (code, étage) mises en avant.
  - **Avancement :** « en route », « sur place », « terminé » depuis la fiche ; l'intervention passe en *Terminé* sans passer par le planning.
  - **Compte rendu :** notes de fin d'intervention, matériel posé, suite à donner (nouveau rendez-vous, devis de l'Item 22) ; photos seulement si la place le permet (1 Go sur l'offre Starter : taille réduite côté navigateur, purge avec le rendez-vous).
  - **Points d'attention du jour :** demandes en attente de décision, rendez-vous échus non clôturés, emails en échec, jours sans intervention à combler.
  - **Indicateurs simples :** interventions et montant de la semaine et du mois, comparés à la période précédente.
- **Contraintes :** aucune donnée personnelle hors de l'espace Artisan, effacement RGPD étendu à toute nouvelle donnée (notes, photos), stockage limité de l'hébergement.
- **Prérequis :** Item 35 ✅.

### 37. Trajets & Tournées (Ordre de Passage, Suggestions de Créneaux)
- **Demandé le 31/10/2026** : gérer les trajets et optimiser les tournées de chaque jour, voire suggérer des déplacements si c'est raisonnable.
- **Tournée du jour :**
  - Tracé de la tournée sur la carte du tableau de bord, du lieu de départ choisi (Item 35 : départ des interventions, entreprise ou siège) à la dernière intervention (et retour), avec distance et durée estimées ; lieu de départ éventuellement propre à chaque jour.
  - **Ordre conseillé :** pour une journée aux horaires encore souples, ordre de passage le plus court (quelques adresses : calcul exact ou plus proche voisin amélioré, dans le navigateur) ; l'artisan valide, les horaires sont décalés et les clients prévenus (reprogrammation de l'Item 32).
  - **Itinéraire en un clic :** lien Google Maps à étapes (jusqu'à 10 adresses) ou étape par étape pour Waze et Plans.
- **Temps de trajet :** aujourd'hui le moteur de créneaux réserve un temps de trajet forfaitaire. Estimation par la distance à vol d'oiseau corrigée (simple, sans service tiers), ou par un service de calcul d'itinéraire (OSRM, OpenRouteService : conditions d'usage, quotas et clé à vérifier, adresse des clients transmise à un tiers à déclarer).
- **Suggestions (si raisonnables) :**
  - À la réservation, mettre en avant les créneaux proches d'une intervention déjà prévue dans le même secteur (« Je suis dans votre quartier mardi matin »), sans masquer les autres.
  - Signaler à l'artisan une journée au trajet incohérent (allers-retours) et proposer une permutation.
  - Regroupement par secteur et par jour (ex. « le nord le lundi ») en option, jamais imposé au client.
- **Contraintes :** calcul dans le navigateur ou PHP natif (pas de service payant ni de tâche planifiée sur Starter) ; une suggestion ne déplace jamais un rendez-vous sans accord de l'artisan et sans prévenir le client.
- **Demandé le 05/11/2026 — tableau de bord :** en dehors des cartes de jour, deux encarts « Dernière intervention » et « Prochaine intervention », **quelle que soit leur date** (même hors de la fenêtre affichée) : client, prestation, date, adresse ; depuis la prochaine, bouton **« Lancer l'itinéraire »** (externe : Google Maps, Waze ou Plans ; ou interne, sur la carte de Crénelio : choix à examiner).
- **Demandé le 05/11/2026 — gestionnaire d'itinéraire :** optimiser la tournée **si c'est applicable, faisable et entièrement gratuit** (bibliothèques et services sans coût ni clé payante, conditions d'usage vérifiées). **Priorité faible, en fin de chantier global.**
- **Prérequis :** Item 35 ✅ (positions enregistrées) ; Item 32 ✅ (reprogrammation et notifications).

---

### 39. Veille & Ajustements Réglementaires (Devis, TVA, Consommation)
- **Demandé le 01/11/2026** : les valeurs légales changent souvent ; elles doivent rester réglables sans développement, et leur suivi être organisé.
- **Déjà réglable (Item 22) :** régime de TVA, taux proposés, mention de franchise, durée de validité, préfixe de numérotation, taux horaire, achat-revente, mention « EI », n° RM ou RCS, médiateur de la consommation.
- **À étudier (vérifier chaque point sur les sources officielles avant de coder) :**
  - **Droit de rétractation** : règles prises en compte dans l'Item 22 ; relire les articles et le formulaire type dans leur version consolidée à chaque revue (prolongation de 12 mois si l'information manque).
  - **Publicité du dépannage à domicile** (arrêté du 24 janvier 2017, fiche DGCCRF) : la vitrine permet une commande à distance ; y afficher nom, adresse, n° RM ou RCS, **taux horaires TTC** ou prix unitaires, frais de déplacement, caractère payant ou gratuit du devis. Vérifier la page vitrine et les prestations.
  - **Assurance** : décennale ou responsabilité civile professionnelle selon les travaux, mention sur devis et factures (assureur, couverture géographique).
  - **Mentions des factures** (Volet B) : à rappeler dans la fiche « Préparer la facture ».
  - **Seuils de la franchise en base de TVA** : modifiés plusieurs fois récemment ; alerte quand le chiffre d'affaires de l'année (hors débours) en approche (indicateurs de l'Item 36).
  - **Taux réduits** (10 % rénovation, 5,5 % rénovation énergétique) : conditions (logement de plus de 2 ans, attestation du client) à rappeler sur la ligne concernée.
  - **Durée de conservation** des devis acceptés (preuve contractuelle) au-delà de l'effacement du rendez-vous, et devis sans rendez-vous à inclure dans la purge.
  - **Débours** : relire la doctrine BOFiP (BOI-TVA-BASE-10-20-40) et faire valider le modèle par un expert-comptable.
- **Méthode :** une page « Références réglementaires » (Item 40) date chaque vérification ; revue annuelle et à chaque loi de finances.
- **Prochaine étape (02/11/2026) :** consulter les textes officiels listés dans [`docs/legal/sources.md`](docs/legal/sources.md) (« À lire dans le texte officiel ») et les prendre en compte ; toute règle doit reposer sur le texte officiel, jamais sur l'interprétation d'un tiers (sources secondaires = pistes, marquées « à confirmer »).
- **Prérequis :** Item 22 (volet A).

### 40. Base Documentaire de l'Artisan (Guides, Références, Traductions)
- **Demandé le 01/11/2026** : une base documentaire consultable depuis l'Espace Artisan (aide à l'usage de Crénelio, obligations du devis, débours et conservation des justificatifs, rétractation, TVA, RGPD, déploiement), avec les liens vers les textes officiels et la date de leur dernière vérification (Item 39). Contenu de départ : le cadre légal et les rappels à l'artisan de l'Item 22.
- **Traductions :** pour les artisans d'expression étrangère, documentation traduisible, langue choisie dans l'Espace Artisan ; les textes juridiques restent cités en français avec une explication traduite (la version française fait foi).
- **Langues envisagées** (à confirmer) : anglais, portugais, espagnol, italien, arabe (de droite à gauche), turc, roumain, polonais.
- **Traductions (05/11/2026) :** ✅ anglais, espagnol, portugais, arménien (`docs/legal/<langue>/`, mêmes noms de fiches ; textes officiels cités en français, explication traduite non officielle). `DocsViewer` : sélecteur de langue (lecture, non enregistré), repli sur le français signalé, recherche dans la langue choisie, attributs `lang` et `dir` ; préférence « Langue » dans l'écran Compte (`ui_state_language`, `src/i18n/languages.ts`), qui servira à la traduction de toute l'interface. **Langues ajoutées le 05/11/2026 :** ✅ italien, allemand, polonais, ukrainien, russe, et pour le plaisir le ch'ti (`fr-chti`, textes officiels toujours en français). Créoles guadeloupéen (`gcf-gp`) et martiniquais (`gcf-mq`) ajoutés le 05/11/2026 ✅ ; sommaires des 12 traductions alignés sur le français. Turc, arabe et roumain ajoutés le 05/11/2026 ✅, d'après une recherche du même jour (INSEE et DARES : 8,2 % d'étrangers parmi les artisans, commerçants et chefs d'entreprise ; immigrés de Turquie les plus souvent indépendants, 28 % ; Portugais et Maghrébins surreprésentés dans le bâtiment). Arabe : fiche de droite à gauche, citations officielles de gauche à droite (`styleOfficialTexts`) ; les courtes citations françaises intégrées aux phrases arabes mêlent les deux sens, à faire relire. Sommaires traduits actualisés (arabe en place, droite à gauche, citations de gauche à droite) ✅. **Aide « ? » traduite (05/11/2026) :** ✅ les 15 langues (`src/config/fieldHelp/<langue>.json` : intitulés, titre, « comment », « pourquoi » ; références des textes officiels en français), affichée dans la langue préférée, repli sur le français champ par champ ; préférence de langue partagée par tout l'écran (une lecture, changement immédiat). **Reste aussi :** relecture par des locuteurs natifs (arménien en priorité : termes signalés « à vérifier »), traduction de l'interface.
- **Lecture dans l'Espace Artisan (02/11/2026) :** écran « Documentation » (groupe *Aide*, `DocsViewer`) : fiches `docs/legal/**/*.md` embarquées dans le bundle (`import.meta.glob`, rendu `marked`), liens entre fiches suivis, liens externes dans un nouvel onglet ; liens contextuels depuis l'éditeur de devis (`/admin?doc=fr/debours.md`).
- **Amorcée (01/11/2026) :** [`docs/legal/`](docs/legal/README.md) : fiches devis, rétractation, débours, note, mentions et aide-mémoire de l'artisan, extraits officiels et liste des sources datée.
- **Forme :** fichiers Markdown versionnés par langue (`docs/legal/<langue>/…`, puis en base pour la traduction), embarqués dans le bundle, sans service tiers ni stockage serveur (offre Starter) ; repli sur le français pour une page non traduite.
- **Recherche textuelle (demandée le 04/11/2026) :** champ de recherche dans l'écran Aide › Documentation, sur le texte de toutes les fiches (dont les textes officiels de `docs/legal/fr/textes/`) : résultats avec le titre de la fiche, un extrait et le terme surligné, ouverture de la fiche à l'endroit trouvé ; insensible aux accents et à la casse ; recherche faite dans le navigateur (fiches déjà embarquées), sans service tiers ; à étendre aux langues traduites. ✅ Réalisée le 05/11/2026 : `src/utils/docsSearch.ts` (repli casse et accents, tous les mots requis, classement titre puis occurrences, extrait surligné), champ dans la barre de `DocsViewer`, fiches chargées une fois à la première recherche ; ouverture d'un résultat avec les termes surlignés et défilement jusqu'au premier.
- **Aide contextuelle « ? » (demandée le 05/11/2026) :** dans l'éditeur de devis (et toute saisie liée au contrat : réglages des devis, mentions légales, débours, rétractation), un bouton « ? » à côté des champs délicats ouvre une fenêtre (mixins `modal-*`) qui explique comment le remplir, pourquoi il est demandé et sur quel texte il repose (code, article, lien vers l'extrait officiel de `docs/legal/fr/textes/` et vers la fiche de la Documentation). Textes tenus avec les fiches, pas dans le code des champs ; même composant partout. ✅ Réalisée le 05/11/2026 dans l'éditeur de devis : composant `FieldHelp` (fenêtre « Comment le remplir », « Pourquoi », « Textes », lien vers la fiche), contenu dans `src/config/fieldHelp.ts` (nature des travaux, urgence, garanties des constructeurs, SIREN, exécution, paiement, décompte du temps, prix du devis, budget des débours, remise des pièces vendues). Étendue le 05/11/2026 aux réglages : `ConfigGroupForm` affiche le « ? » de toute clé de `config` décrite dans `fieldHelp.ts` (régime et mention de TVA, taux horaire, coût du devis, éléments non compris, paiement, décompte, revente, garanties des constructeurs, forme juridique, « EI », immatriculation, n° de TVA, réclamations, médiateur, assurance) ; ajouter une aide ne demande aucun code d'écran.
- **Lien avec l'Item 31 :** même mécanisme de traduction ; l'Item 31 traite la partie publique (clients), celui-ci la partie artisan.
- **Prérequis :** aucun ; contenu juridique après l'Item 39.

### 41. Largeur de la Vitrine et du Pied de Page (Personnalisation d'Apparence)
- **Demandé le 04/11/2026** : exploiter toute la largeur de l'écran (`width: 100%`) pour le **pied de page** et pour le **contenu de la vitrine**, selon le choix du professionnel.
- **Constat :** le contenu est aujourd'hui centré dans des colonnes de largeur fixe (`.container` à 960 px dans `_base.scss`, sections de la vitrine entre 560 et 900 px dans `_vitrine.scss`) : sur grand écran, de larges marges vides.
- **Proposition :** réglage dans l'écran **Thème** (prolonge l'Item 2) : largeur du contenu « Centrée » (actuelle, par défaut) ou « Pleine largeur », et largeur du pied de page indépendante ; appliqué par une variable CSS (comme `--color-primary`, `src/utils/theme.ts`), aperçu en direct comme les autres réglages d'apparence.
- **Points d'attention :** garder une **longueur de ligne lisible** pour les textes (présentation, mentions) même en pleine largeur (colonne de texte limitée, grilles qui s'étalent : prestations, engagements, carte) ; marges latérales minimales ; rendu mobile inchangé.
- **Prérequis :** Item 2 ✅.

### 42. Dossier du Modèle de Données (Rapport PDF)
- **Demandé le 05/11/2026**, à produire **en fin de chantier** (schéma stabilisé, après l'Item 22) : rapport PDF factuel (LaTeX, style du skill `factual-report-latex`) décrivant la base.
- **Contenu :** schéma des tables et de leurs relations (clés étrangères, cardinalités) ; pour chaque table, sa raison d'être, son **sens métier** (rendez-vous, devis, débours, rétractation, journal des emails…) et ses liens avec les autres ; **valeurs d'exemple** fictives (aucune donnée réelle, cf. `seed_test_data.sql`) ; règles portées par la base (anonymisation RGPD, `schema_version`, clés `config`).
- **Source :** `sql/schema.sql` fait foi ; le rapport en est tiré, à régénérer à chaque évolution notable du schéma.
- **Prérequis :** Item 22 terminé.

### 43. Fichier Clients (Fiche, Historique, Accès du Client)
- **Demandé le 11/11/2026** (recette, cas 3.2) : aujourd'hui, le client n'existe qu'à travers ses rendez-vous et ses devis (coordonnées recopiées sur chacun) ; aucun moyen de retrouver un client existant ni de voir son historique.
- **Création :** un client est créé à la première réservation ou au premier devis s'il n'existe pas ; reconnu ensuite (email, téléphone) pour lui rattacher rendez-vous et devis, sans doublon.
- **Recherche :** retrouver un client existant à la création d'un rendez-vous ou d'un devis (nom, email, téléphone, adresse), coordonnées préremplies.
- **Historique :** pour le professionnel, fiche du client (rendez-vous, devis, réponses, emails) ; pour le client, consultation de son propre historique (lien sécurisé, sans compte à créer de préférence).
- **RGPD (Item 5) :** données limitées au nécessaire, conservation et purge appliquées à la fiche, effacement de la fiche et de tout ce qui s'y rattache (cf. écart 19 de la recette : ce qu'un contrat conclu doit conserver), information dans la politique de confidentialité ; aucune donnée sans finalité.
- **Préalable :** modèle à concevoir (table `clients`, migration des rendez-vous et devis existants), avant l'Item 42.

## 📊 Matrice d'Ordonnancement & Suivi du Backlog

Ordre fixé le 28/10/2026 selon **la criticité** (sécurité, obligation légale, blocage de la mise en ligne) puis **le gain** (usage quotidien de l'artisan, effort).

| Ordre Prioritaire | Réf. | Fonctionnalité | Domaine | Statut | Dépendances / Prérequis | Pourquoi ce rang |
|---|---|---|---|---|---|---|
| — | **Item 28** | **Paquet d'installation téléchargeable (release prête à déployer)** | Installation / Distribution | ✅ **Terminé** | Item 27 | 🟡 Utile dès qu'un second artisan ou un prestataire installe Crénelio |
| **2** | **Item 22** | **Devis en ligne avec accord du client & aide à la facturation externe** | Espace Artisan / Facturation | 🚧 *En cours* (volet A terminé ; volet B à faire) | Items 12, 21 et 32 ✅ | 🟡 Devis obligatoire pour l'artisan ; facture laissée à son outil (obligation électronique 2026-2027) |
| **3** | **Item 36** | **Suivi d'intervention pour l'artisan (fiche mobile, avancement, compte rendu)** | Espace Artisan / Exploitation | ⏳ *À faire* | Item 35 ✅ | 🟡 Usage quotidien sur le terrain ; prolonge le tableau de bord |
| **4** | **Item 37** | **Trajets & tournées (ordre de passage, itinéraire, suggestions de créneaux)** | Planning / Trajets | ⏳ *À faire* | Items 32 et 35 ✅ | 🟡 Gain de temps et de carburant ; suggestions à cadrer pour rester raisonnables |
| **5** | **Item 30** | **Effets visuels avancés (liserés animés, cartes 3D)** | Design / UI | ⏳ *À faire* | Item 2 ✅ | ⚪ Confort visuel ; thème sombre séparé (Item 34) |
| **6** | **Item 26** | **Adresse publique du site (`APP_URL`) détectée automatiquement** | Installation / Configuration | ⏳ *À faire* | Item 12 ✅ | ⚪ Devient facultatif avec l'Item 27, qui demande l'adresse |
| **7** | **Item 29** | **Mise à jour depuis le site hébergé (espace Artisan)** | Installation / Maintenance | 🔍 *Faisabilité à étudier* | Item 28 ; capacités de l'hébergement | ⚪ Incertain sur Starter et compromis de sécurité ; la mise à jour manuelle (Item 28) suffit |
| **8** | **Item 31** | **Traduction du site (multilingue)** | Vitrine / Internationalisation | ⏳ *À faire* | — | ⚪ Utile pour une clientèle non francophone ; aucun besoin bloquant à ce jour |
| **9** | **Item 34** | **Thème sombre (inversion des couleurs, palettes adaptées)** | Design / UI | ⏳ *À faire* | Item 2 ✅ | ⚪ Confort ; chantier transversal coûteux (gris, fonds, états et bibliothèques à convertir) |
| **10** | **Item 40** | **Base documentaire de l'artisan, traduite (anglais, portugais, espagnol…)** | Documentation / Internationalisation | 🚧 *En cours* (fiches, recherche, aide « ? » et 15 traductions faites ; reste relectures natives et interface) | — | ⚪ Priorité abaissée le 05/11/2026 : l'essentiel est livré ; lié à l'Item 31 |
| — | **Item 39** | **Veille & ajustements réglementaires (publicité des prix, assurance, seuils de TVA, conservation)** | Conformité | ⏳ *À faire* | Item 22 | 🟡 Obligations du devis en ligne à compléter |
| — | **Item 41** | **Largeur de la vitrine et du pied de page (centrée ou pleine largeur)** | Design / Personnalisation | ⏳ *À faire* | Item 2 ✅ | ⚪ Confort sur grand écran ; réglage du professionnel |
| — | **Item 42** | **Dossier du modèle de données (rapport PDF : schéma, relations, sens métier, exemples)** | Documentation | ⏳ *À faire* (fin de chantier) | Item 22 | ⚪ Transmission et reprise du projet |
| — | **Item 43** | **Fichier clients (fiche, recherche, historique pour le pro et le client)** | Espace Artisan / Données | ⏳ *À faire* | Items 5 et 22 | 🟡 Retrouver un client et son historique ; à concevoir avec le RGPD |
| — | **Item 38** | Menu de l'espace Artisan par catégories, configuration répartie en écrans (Entreprise, Vitrine, Thème, Compte ; créneaux sous Horaires) | Espace Artisan / Navigation | ✅ **Terminé** | — | — |
| — | **Item 35** | Tableau de bord (jours en cartes, carte du jour numérotée, positions des rendez-vous enregistrées) | Espace Artisan / Exploitation | ✅ **Terminé** | — | — |
| — | **Item 21** | Liste des interventions AG Grid Community (tri, filtres, sélection, export CSV, disposition enregistrée) ; composant `DataGrid` commun, pleine hauteur desktop/tablette, fenêtre de rendez-vous partagée avec le calendrier, avertissements regroupés dans le header, indisponibilités en grille (sous-onglet de « Horaires ») | Espace Artisan / Exploitation | ✅ **Terminé** | — | — |
| — | **Item 33** | Abonnement d'agenda de l'artisan (flux iCal privé, optionnel) | Planning / Synchronisation | ✅ **Terminé** | — | — |
| — | **Item 32** | Fiabilité des notifications (annulation, reprogrammation, décision, anti-abus) | Communication / Fiabilité | ✅ **Terminé** | — | — |
| — | **Item 23** | Calendrier des interventions (FullCalendar : vues, glisser-déposer validé, création au clic) | Espace Artisan / Planning | ✅ **Terminé** | — | — |
| — | **Item 27** | Déploiement initial interactif (`npm run deploy:init`, `/api/health`, version du schéma) | Installation / Déploiement | ✅ **Terminé** | — | — |
| — | **Item 5** | Conformité RGPD & cookies (notice, politique, conservation, effacement) | Légal / Conformité | ✅ **Terminé** | — | — |
| — | **Item 25** | Mot de passe & email professionnel sécurisés (changement, réinitialisation, vérification) | Sécurité / Authentification | ✅ **Terminé** | — | — |
| — | **Item 2** | Theming & effets visuels pilotables depuis l'espace Artisan | Design / UI | ✅ **Terminé** | — | — |
| — | **Item 20** | Compte SMTP configurable depuis l'espace Artisan | Communication / Configuration | ❌ **Abandonné** | Remplacé par l'Item 24 | — |
| — | **Item 24** | Envoi natif OVHcloud (`mail()`) & email de test depuis l'espace Artisan | Communication / Configuration | ✅ **Terminé** | — | — |
| — | **Item 12** | Sécurité : routes de gestion vérifiées côté serveur, code par email, appareil de confiance 10 jours | Sécurité / Authentification | ✅ **Terminé** | — | — |
| — | **Item 15** | Header & footer communs au tunnel de réservation (+ bouton d'abandon) | Vitrine / Navigation | ✅ **Terminé** | — | — |
| — | **Item 19** | Saisie d'un rendez-vous par l'artisan (formulaires partagés, hors zone forçable) | Espace Artisan / Planning | ✅ **Terminé** | — | — |
| — | **Item 18** | Zone d'intervention calculée, mode sans déplacement, demandes hors zone validées par l'artisan | Zone / Réservation | ✅ **Terminé** | — | — |
| — | **Item 17** | Espace Artisan en pleine page (`/admin`, menu rétractable) | Espace Artisan / Navigation | ✅ **Terminé** | — | — |
| — | **Item 16** | Horaires de travail, indisponibilités, moteur de créneaux partagé | Espace Artisan / Planning | ✅ **Terminé** | — | — |
| — | **Item 14** | IHM de configuration complète (Espace Artisan) | Espace Artisan / Configuration | ✅ **Terminé** | — | — |
| — | **Item 6** | Identité visuelle : logo & favicon (recadrage, replis) | Design / Personnalisation | ✅ **Terminé** | — | — |
| — | **Item 4** | Notifications email, iCal & logs d'envoi IHM | Communication / Traçabilité | ✅ **Terminé** | — | — |
| — | **Item 1** | Frais de déplacement hybrides & gestion hors-zone | Tunnel / Tarification | ✅ **Terminé** | — | — |
| — | **Item 3** | Page Vitrine par Défaut (Homepage Artisan) | Vitrine / Navigation | ✅ **Terminé** | — | — |
| — | **Item 7** | Footer Complet & Mentions Légales | Légal / Footer | ✅ **Terminé** | — | — |
| — | **Item 8** | Dette Technique & Harmonisation Styles SCSS | Qualité Code / SCSS | ✅ **Terminé** | — | — |
| — | **Item 9** | Modernisation Sass (Dart Sass Modern Compiler) | Outillage / Build | ✅ **Terminé** | — | — |
| — | **Item 10**| Gestion Propre des Classes Conditionnelles (`clsx`) | Qualité Code / React | ✅ **Terminé** | — | — |
| — | **Item 11**| Gestion des Prestations (Création pop-up, Édition, Delete)| Espace Artisan / Catalogue | ✅ **Terminé** | — | — |
| — | **Item 13**| Recherche, filtres, RDV échus & reprogrammation datetime | Espace Artisan / Planning | ✅ **Terminé** | — | — |

