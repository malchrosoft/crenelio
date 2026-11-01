# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; numérotation
[SemVer](https://semver.org/lang/fr/). Les versions `0.x` sont des bêtas.

## [0.0.1] — 2026-11-01

Première bêta publique.

### Pour les clients
- Vitrine de l'artisan (présentation, prestations, engagements, carte de la zone couverte, contact).
- Réservation en ligne : prestation, créneau libre, adresse avec autocomplétion, frais de
  déplacement calculés selon la distance, demande exceptionnelle hors zone.
- Emails de confirmation avec fichier agenda, lien de gestion pour annuler un rendez-vous.

### Pour l'artisan (Espace Artisan)
- Connexion protégée : mot de passe et code par email sur un appareil inconnu.
- Tableau de bord : veille, aujourd'hui et deux jours travaillés suivants, carte du jour numérotée.
- Rendez-vous en grille (filtres, export CSV), calendrier avec glisser-déposer, indisponibilités.
- Prestations, horaires et créneaux, déplacement et zone d'intervention.
- Paramétrage : entreprise, vitrine, thème (couleur, arrondis, boutons, effets), compte.
- Abonnement d'agenda optionnel, journal des emails envoyés.
- RGPD : effacement d'un client, purge automatique, politique de confidentialité.

### Installation
- Hébergement mutualisé OVHcloud (offre Starter) : PHP natif, MySQL, aucun build côté serveur.
- Archive prête à déployer avec somme SHA-256 (voir `DEPLOYMENT.fr.md`).
