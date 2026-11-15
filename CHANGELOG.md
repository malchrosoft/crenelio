# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; numérotation
[SemVer](https://semver.org/lang/fr/). Les versions `0.x` sont des bêtas.

## [Non publié]

### Installation
- `INSTRUCTIONS.md` (`npm run deploy:init`) indique la version déployée et reprend les nouveautés du
  journal depuis la version installée ; `/api/health` donne la version (`version`).
- Guides de déploiement : une base créée par `schema.sql` n'a besoin d'aucune migration.

### Pour le professionnel (Espace Artisan)
- Documentation : bouton « Version » qui ouvre le journal des versions.

## [0.1.1] — 2026-11-15

Correctifs issus du premier déploiement réel. Base de données : aucune migration.

### Installation
- Le socle (`seed_init.sql`) n'installe plus d'identité de démonstration : email professionnel, nom,
  téléphone et zone sont vides. L'email fictif activait la double authentification vers une boîte
  inexistante et bloquait la première connexion. Site déjà installé avec l'email fictif : dans
  phpMyAdmin, `UPDATE config SET config_value = '' WHERE config_key = 'pro_email';`.
- `/api/health` signale les dossiers de `api/storage/` absents ou non accessibles en écriture
  (`storage`, `storage_unwritable`) ; `npm run deploy:init` l'affiche.
- Toute erreur PHP non interceptée est inscrite au journal d'erreurs (préfixe `[Crenelio]`) et
  l'API répond en JSON au lieu d'une page 500 vide.
- `deploy:init` : rappel de recopier le nom du serveur de base sans le retaper, liste complète des
  dossiers à créer, premières étapes à jour (email professionnel dans l'écran *Compte*).
- Guides de déploiement : diagnostic d'après le journal d'erreurs, noms d'écrans à jour.

### Documentation
- Registre des traitements traduit dans les 15 langues de la documentation.

### Public
- Notice de confidentialité : « le professionnel » au lieu de « l'artisan » si aucun nom n'est saisi.

## [0.1.0] — 2026-11-14

Deuxième bêta : devis en ligne complets, aide à la facturation, documentation juridique, recette des
parcours. Base de données : 10 migrations depuis 0.0.1 (jointes par `npm run deploy:init`).

### Pour les clients
- Devis en ligne : page du devis, PDF et version imprimable aux couleurs de l'entreprise, acceptation ou
  refus en ligne, réponse séparée au mandat de débours, choix sur les pièces remplacées.
- Droit de rétractation : information précontractuelle, formulaire type joint à l'envoi du devis et
  prérempli, rétractation en ligne (« Renoncer au contrat ici ») avec accusé de réception.
- Tarifs affichés TTC sur la vitrine et dans la réservation, coût du devis et éléments non compris.
- Avertissements : devis annulé par le professionnel, intervention annulée avant la réponse au devis.

### Pour le professionnel (Espace Artisan)
- Devis : lignes typées (main-d'œuvre au temps passé avec arrondi, forfait du catalogue, déplacement
  prérempli, remise, débours, fourniture revendue), calculs dans les champs, doublons signalés,
  conditions en listes, mentions légales réglables, garanties des constructeurs et attestation
  décennale jointe, annulation d'un devis envoyé, filtre « En cours / Archivés ».
- Contrat figé à l'envoi et empreinte SHA-256 à l'acceptation (contrôle « Contrat figé »).
- Rendez-vous : modifications validées ensemble (statut, date, « Prévenir le client », motifs
  d'annulation), devis liés listés et avertis, refus de déplacement signalé, raison précise d'un
  créneau refusé, fond du calendrier lisible (fermé, indisponible, trajet), bouton « Actualiser ».
- Facturation dans le logiciel du professionnel : fiche « Préparer la facture » (temps réellement
  passé, valeurs du devis, avertissement des sept jours sans paiement selon les jours fériés), exports
  CSV datés, export des clients au format Indy.
- Documentation juridique (textes officiels cités mot pour mot) et aide « ? » des champs délicats, en
  16 langues ; recherche dans la documentation.

### Données personnelles
- Fin de conservation = suppression (plus de lignes « anonymisées ») ; devis acceptés conservés dix
  ans en archivage intermédiaire ; effacement à la demande détaillé ; politique de confidentialité
  mise à jour.
- Registre des traitements (RGPD, art. 30) prérempli, à compléter par le professionnel et à
  présenter à la CNIL sur demande (documentation, en français pour l'instant).

### Installation
- Jours fériés lus sur l'API publique et gardés dans `api/storage/holidays/` (aucune tâche planifiée
  nécessaire ; script cron facultatif `api/cron/refresh-holidays.php`).
- Nouveaux dossiers à rendre accessibles en écriture : `api/storage/holidays/`.

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
