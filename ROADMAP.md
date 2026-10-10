# Feuille de Route & Suivi des Développements — Crénelio

Ce document répertorie le backlog fonctionnel, technique et design à implémenter pour les prochaines itérations de Crénelio.

---

## 📋 Backlog Prioritaire

### 1. Frais de Déplacement (Optionnels selon prestation)
- **Modèle de données :**
  - Ajouter un champ dans la table `services` (ex: `travel_fee_type`: `'none' | 'fixed' | 'per_km'`, `travel_fee_amount`: `DECIMAL(10,2)`).
  - Ou clé de configuration globale dans `config` (`default_travel_fee`) surchargeable par prestation.
- **Expérience Client & Admin :**
  - Affichage transparent du détail tarifaire (prestation de base + éventuels frais de déplacement) dans le récapitulatif avant confirmation.
  - Pilotage simple depuis l'espace Pro (activer/désactiver les frais par prestation).

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

### 8. Dette Technique & Harmonisation des Styles SCSS (En cours)
- **Éradication des styles inline résiduels :**
  - Nettoyer les `style={{ ... }}` subsistants dans le tunnel de prise de rdv et l'espace admin (`BookingForm.tsx`, `SlotPicker.tsx`, `BookingConfirmation.tsx`, `AdminDashboard.tsx`, `LegalModal.tsx`).
- **Conformité aux conventions SCSS :**
  - Définir des classes sémantiques ou de composant dans `_components.scss` (ex: `.booking-error-box`, `.booking-form-actions`, `.slot-picker-empty`, `.confirmation-badge`).
  - Proscrire les micro-classes utilitaires ad hoc qui reproduisent le style inline.
  - Utiliser systématiquement les variables de `_variables.scss` (`$primary`, `$gray-500`, `$danger-light`, etc.) sans jamais coder de couleurs hexadécimales en dur.

