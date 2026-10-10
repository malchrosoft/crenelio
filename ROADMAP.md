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

### 3. Page Vitrine par Défaut (Homepage Artisan)
- **Page d'accueil de présentation :**
  - Affichage d'une page vitrine professionnelle mettant en valeur l'artisan (présentation de l'activité, zone d'intervention avec carte interactive, avis/engagements, coordonnées).
  - Bouton d'action proéminent (Call-to-Action) : *"Prendre rendez-vous en ligne"* qui mène vers le tunnel de réservation en 3 étapes.
- **Routage :**
  - Vue vitrine par défaut avec switch/lien transparent vers le stepper de réservation.

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

### 7. Footer Complet & Mentions Légales Pré-configurables
- **Pied de page riche :**
  - Coordonnées de contact rapides (téléphone, email, horaires, zone couverte).
  - Lien d'accès discret à l'espace Pro.
- **Mentions légales & Informations d'entreprise :**
  - Champs pré-configurables dans l'admin : Raison sociale, SIRET, code NAF/APE, numéro d'assurance décennale / RC Pro, hébergeur.
  - Page modale ou dédiée pour l'affichage des mentions légales et conditions d'intervention.
