# Recette des parcours : rendez-vous, devis, rétractation, annulation, déplacement

Liste des cas à dérouler de bout en bout avant une mise en ligne ou après une évolution des Items 22, 32
ou 33. Établie le 11/11/2026 d'après le code (statuts, routes, emails). Cocher chaque cas, noter l'écart
constaté dans la colonne « Résultat ».

## Bilan de la recette du 11/11/2026 (en cours)

31 cas joués : 26 validés, 4 avec réserves, 1 en échec (2.4) ; aucune erreur de calcul ni email manquant. Recette mixte : actions du client jouées par
l'API publique et Mailpit, actions du professionnel dans l'Espace Artisan. Données « Recette … » (clients
`recette-…@example.test`, RDV 22 à 28, devis D-2026-0003 à 0006) laissées en base locale.

**Écarts à traiter** (tous notés dans `ROADMAP.md`, Item 22) :

| # | Cas | Écart | Piste |
|---|---|---|---|
| 1 | 2.3 / 2.4 | **Défaut** : le statut s'enregistre dès le choix dans la liste (`AppointmentDialog.tsx`), sans validation ; « Prévenir le client » n'est pas transmis au changement de statut (client toujours prévenu) | Parcours descendant : modifications, résumé, « Prévenir le client » pour statut et déplacement, bouton « Valider » |
| 2 | 2.4 | Annuler sans prévenir le client est risqué | Confirmation explicite ou motif obligatoire |
| 3 | 2.6 | Fond du calendrier sans distinction libre / indisponible | Griser heures fermées, indisponibilités, trajets |
| 4 | 2.7 | Avertissement générique sur un créneau non proposable | Donner la raison précise (fermé, indisponibilité, délai minimal, chevauchement avec tel RDV, trajet) |
| 5 | 2.8 | Refus d'un déplacement = simple annulation pour le pro | Le signaler dans l'email au pro quand l'annulation suit un déplacement |
| 6 | 3.4 | Deux lignes de déplacement non signalées (désignations différentes) | Comparer les déplacements entre eux, ou ne pas en préremplir un second |
| 7 | 3.5 | Remise excessive : message trop discret | Ligne fautive mise en évidence, message à côté |
| 8 | 3.6 | Choix vide « — » dans les modalités de paiement | Le retirer |
| 9 | 6.x | RDV resté confirmé après refus du devis ou rétractation | Proposer l'annulation au pro (à décider) |
| 10 | 7.1 | « Préparer la facture » ne montre pas les valeurs du devis | Afficher l'estimation à côté de chaque valeur modifiée |

**Reste à jouer :** avec le pro : 1.6, 1.7, 2.9 (après l'écart 1), 2.11, 3.7, 3.9, 4.4, 7.2 à 7.4 ; avec
accord pour vieillir des dates en base : 4.8, 4.9, 5.2, 5.6 ; à part : 1.9, 5.5. Outils de la recette
(appels API, lecture Mailpit) : scripts `/tmp/recette/*.mts`, non versionnés, à recréer si besoin.

## Préparation

- `npm start aucun` (base, API, Mailpit) ; Espace Artisan connecté dans un navigateur, client dans un
  autre (ou une fenêtre privée) : le client n'a jamais de session.
- Mailpit : <http://localhost:8025>. Chaque email attendu y est vérifié : destinataire, objet, pièces
  jointes (PDF, `.ics`), liens (ils pointent vers `APP_URL`).
- Réglages : `pro_email` renseigné ; une prestation à déplacement aux paliers (`distance_tiers`) et une au
  forfait ; taux horaire renseigné ; attestation décennale déposée (cas 4.6).
- Journal des emails d'un rendez-vous : bouton « Emails » de sa fenêtre ; d'un devis : bas de l'éditeur.
- Statuts : rendez-vous `pending` (en attente), `confirmed`, `completed`, `cancelled` ; devis `draft`,
  `sent`, `accepted`, `refused`, `expired`, `withdrawn`.

## 1. Prise de rendez-vous

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 1.1 | Réservation en zone | Vitrine → prestation → créneau → coordonnées → valider | RDV `confirmed` ; email client (récapitulatif, lien `/rdv/:token`, `.ics` client) ; email pro (`.ics` invitation, créneau élargi du trajet) ; frais de déplacement et total TTC affichés comme dans le tunnel || ✅ 11/11 : 15 € pour 0,62 km ; emails et `.ics` client (créneau exact) et pro (créneau élargi) |
| 1.2 | Créneau pris entre-temps | Deux navigateurs, même créneau, valider l'un puis l'autre | Second refusé (créneau non proposé par `SlotEngine`), aucun email || ✅ 11/11 : 409 « créneau plus disponible » |
| 1.3 | Hors zone | Adresse au-delà du rayon / commune non desservie | Proposition de demande exceptionnelle ; envoi → RDV `pending` ; email pro avec liens accepter / refuser ; email client « demande reçue » || ✅ 11/11 : Puteaux (9,5 km, commune non desservie) ; Cergy (29,6 km) sans demande possible |
| 1.4 | Hors zone accepté (lien) | Lien « accepter » de l'email pro | RDV `confirmed` ; emails de confirmation client et pro (comme 1.1) ; lien réutilisé → « déjà traitée » || ✅ 11/11 : `confirmed`, emails de confirmation ; lien rejoué → 404 |
| 1.5 | Hors zone refusé (lien) | Lien « refuser » | RDV `cancelled`, motif « Demande hors zone refusée » ; email de refus au client || ✅ 11/11 : `cancelled` avec motif, email « non retenue » |
| 1.6 | Hors zone décidé depuis le planning | Statut changé dans la fenêtre du RDV, case « Prévenir le client » cochée puis décochée | Même résultat que 1.4 / 1.5 ; décochée : aucun email au client | |
| 1.7 | RDV saisi par le pro | Espace Artisan → nouveau rendez-vous (heure libre, hors zone admis) | RDV créé avec position ; emails selon le choix | |
| 1.8 | Anti-abus | Plus de réservations que la limite depuis une même IP | 429 « Trop de tentatives » ; rien d'enregistré || ⏭️ non joué (bloquerait le poste) |
| 1.9 | Sans envoi d'emails | `MAIL_FROM` vide (ou Mailpit arrêté) | Réservation enregistrée malgré tout ; tentatives `failed` avec motif dans le journal | |

## 2. Annulation et déplacement d'un rendez-vous

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 2.1 | Annulation par le client | Lien `/rdv/:token` → annuler | RDV `cancelled` ; email au pro (`.ics` `METHOD:CANCEL`, même UID : l'agenda retire l'événement) ; confirmation au client || ✅ 11/11 : `.ics` CANCEL même UID, client et pro |
| 2.2 | Double annulation | Rejouer le lien | « Déjà annulé », aucun nouvel email || ✅ 11/11 : « déjà annulé », aucun email |
| 2.3 | Annulation par le pro | Fenêtre du RDV → Annuler, « Prévenir le client » cochée | Email d'annulation au client (`.ics` CANCEL) ; agenda du pro mis à jour (`cancellation_pro`) || ⚠️ 11/11 : emails OK ; statut enregistré dès le choix, sans validation (écart 1) |
| 2.4 | Annulation silencieuse | Idem, case décochée | Aucun email client ; agenda pro mis à jour || ❌ 11/11 : client prévenu malgré la case décochée (écarts 1 et 2) |
| 2.5 | Déplacement par le pro (liste) | Fenêtre du RDV → nouvelle date sur un créneau libre | Email au client (`.ics` mis à jour, même UID, `SEQUENCE` +1) ; agenda pro mis à jour ; l'événement est déplacé, pas dupliqué || ✅ 11/11 : « déplacé au… », même UID, SEQUENCE + |
| 2.6 | Déplacement par glisser-déposer | Calendrier → déposer sur un créneau libre | Comme 2.5 || ✅ 11/11 : emails et `.ics` à jour (écart 3 : fond du calendrier) |
| 2.7 | Déplacement sur un créneau indisponible | Déposer sur un créneau occupé / hors horaires | Avertissement (409 `slot_unavailable`) ; forcer → déplacé quand même, emails comme 2.5 || ✅ 11/11 : avertissement puis forçage (écart 4 : raison générique) |
| 2.8 | Déplacement refusé par le client, puis annulation | Après 2.5, le client ouvre `/rdv/:token` et annule | Le client n'a pas de bouton « refuser le déplacement » : il annule (cas 2.1). Vérifier que l'email d'annulation au pro porte la **nouvelle** date et que l'agenda retire le bon événement || ✅ 11/11 : annulation à la nouvelle date, bon événement retiré (écart 5) |
| 2.9 | Déplacement silencieux | Case « Prévenir le client » décochée | Aucun email client ; agenda pro mis à jour | |
| 2.10 | Terminé | Statut « terminé » après l'intervention | RDV `completed` ; fiche « Préparer la facture » disponible || ✅ 11/11 |
| 2.11 | Abonnement d'agenda (Item 33) | Flux `/calendar/:token` activé, puis 2.1 / 2.5 | Le flux reflète annulation et déplacement ; annulés exclus | |

## 3. Devis : préparation et envoi

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 3.1 | Devis depuis un RDV | Fenêtre du RDV → créer un devis | Client, adresse, prestation, déplacement et date d'exécution repris || ✅ 11/11 (prestation, déplacement, exécution « Le 19/11/2026 à 08h30 ») |
| 3.2 | Devis libre | Devis → nouveau | Validité, prix du devis, paiement, décompte et exécution (date à J+15) préremplis depuis les réglages | |
| 3.3 | Lignes | Main-d'œuvre « 1h20 », forfait du catalogue, déplacement (prérempli selon prestation et distance), remise « 10 % », pièce en débours, calcul « 120/3 » | Arrondi selon le décompte ; prix du catalogue ; frais calculés ; remise négative ; totaux justes (débours hors total) || ✅ 11/11 : 1h20 → 1,5 h ; remise 10 % = −36,80 € ; 120/3 → 40 € ; total 331,20 € |
| 3.4 | Doublons | Deux lignes même type et même désignation | Avertissement ; « Fusionner » (même prix) / « Garder la première » || ⚠️ 11/11 : doublon main-d'œuvre signalé ; deux déplacements de désignations différentes non signalés (écart 6) |
| 3.5 | Remise excessive | Remise supérieure aux prestations | Enregistrement refusé || ⚠️ 11/11 : refusé, message trop discret (écart 7) |
| 3.6 | Envoi incomplet | Envoyer sans exécution ni paiement | Envoi refusé avec le motif || ✅ 11/11 : envoi refusé (écart 8 : choix « — » dans la liste) |
| 3.7 | Garanties des constructeurs | Case cochée sans attestation valide, puis avec | Refusé, puis envoyé avec l'attestation jointe | |
| 3.8 | Envoi | Envoyer | Numéro attribué ; devis non modifiable ; email client avec devis PDF, mandat PDF (si débours), **formulaire type de rétractation** (hors urgence), lien `/devis/:token` || ✅ 11/11 : devis, mandat et formulaire joints, mention dans l'email |
| 3.9 | Versions imprimables | Depuis l'Espace Artisan (nouvel onglet) | Mise en page identique au PDF ; logo ; pas de « Retour au devis » ; formulaire prérempli (nom, adresse, contrat) | |
| 3.10 | Devis urgent | Case urgence cochée | Ni formulaire ni information de rétractation : mention de l'absence de droit (L221-28) ; exécution « aujourd'hui » par défaut || ✅ 11/11 : aucun formulaire joint, PDF du formulaire en 404 |

## 4. Devis : réponse du client

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 4.1 | Acceptation simple | Page du devis : pièces OUI/NON, reconnaissance du droit de rétractation, accepter | `accepted` ; email client = exemplaire du contrat (PDF, formulaire prérempli « commandé le », lien en ligne) ; email pro || ✅ 11/11 : exemplaire au client (devis, mandat, formulaire), avis au pro ; délai jusqu'au 25/11 |
| 4.2 | Acceptation incomplète | Accepter sans répondre sur les pièces / sans reconnaître le droit | Refus avec le motif || ✅ 11/11 : refus sans réponse sur les pièces, puis sans reconnaissance du droit |
| 4.3 | Mandat de débours donné | Devis avec débours : « je donne ce mandat » | Mandat enregistré ; PDF du mandat avec la trace ; « Préparer la facture » reprend les débours || ✅ 11/11 |
| 4.4 | Mandat refusé | « Je fournis moi-même les pièces » | Devis accepté sans débours ; la fiche facture n'en reprend aucun | |
| 4.5 | Exécution anticipée | Case « je demande expressément… » cochée | Mention dans l'exemplaire et le PDF || ✅ 11/11 |
| 4.6 | Refus | Refuser (motif facultatif) | `refused` ; accusé au client « aucune somme due » ; avis au pro || ✅ 11/11 : accusé au client, avis au pro (RDV resté confirmé : écart 9) |
| 4.7 | Seconde réponse | Rejouer accepter/refuser | « Déjà reçu une réponse » || ✅ 11/11 : 409 |
| 4.8 | Expiration | Validité dépassée (date système ou `validity_days` court) | `expired` ; réponse impossible (« Ce devis a expiré ») | |
| 4.9 | Vente (fourniture revendue) | `quote_allow_supply`, ligne revendue, acceptation | Devis `sale` ; modèle de rétractation passages (1) b et (5) ; saisie « pièces remises le » → fin du délai calculée, « reçu le » dans le formulaire | |

## 5. Rétractation

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 5.1 | En ligne | Page du devis → « Renoncer au contrat ici » → « Confirmer la rétractation » | `withdrawn` ; accusé de réception au client (contenu, date, heure, déclaration PDF) ; avis au pro || ✅ 11/11 : accusés avec déclaration PDF ; seconde rétractation 409 (RDV resté confirmé : écart 9) |
| 5.2 | Hors délai | Après `withdrawal_until` | Bouton absent ; route refusée | |
| 5.3 | Exécution anticipée et RDV terminé | 4.5 puis RDV `completed` | Rétractation refusée (L221-28 1°) || ✅ 11/11 : 409 après exécution anticipée et RDV terminé |
| 5.4 | Urgence | Devis urgent accepté | Aucune rétractation proposée || ✅ 11/11 : 409 |
| 5.5 | Formulaire papier | Formulaire PDF rempli, envoyé par email au pro | Hors application : le pro l'enregistre à la main ; vérifier que le PDF est lisible et prérempli | |
| 5.6 | Vente sans remise des pièces | 4.9 sans date de remise | Rétractation ouverte tant que les pièces ne sont pas remises | |

## 6. Croisements rendez-vous / devis (à observer, comportement à confirmer)

| N° | Cas | Point à vérifier | Résultat |
|---|---|---|---|
| 6.1 | RDV annulé par le pro alors que le devis est accepté | Le devis reste-t-il `accepted` ? Le client est-il informé de la suite (nouveau RDV, contrat) ? | |
| 6.2 | RDV annulé par le client avec un devis accepté | L'annulation vaut-elle rétractation ? (non aujourd'hui : deux actions distinctes) | |
| 6.3 | RDV déplacé alors que le devis porte « Le jj/mm/aaaa » | La date d'exécution du devis n'est pas mise à jour : à signaler au client ? | |
| 6.4 | Rétractation alors que le RDV est confirmé | Le RDV reste-t-il planifié ? Le pro est-il invité à l'annuler ? | |
| 6.5 | Devis envoyé, RDV annulé avant la réponse | Le client peut-il encore accepter un devis dont l'intervention n'existe plus ? | |

## 7. Après l'intervention

| N° | Cas | Étapes | Attendu | Résultat |
|---|---|---|---|---|
| 7.1 | Préparer la facture | RDV terminé, devis accepté | Valeurs à copier ; temps réellement passé (« 2h05 ») recalculé ; avertissement si au-delà de l'estimation ; débours au montant exact || ⚠️ 11/11 : recalcul et avertissement OK ; valeurs du devis non visibles (écart 10) |
| 7.2 | Sept jours (hors établissement) | Devis signé au domicile | Rappel : aucun paiement avant sept jours (L221-10) | |
| 7.3 | Exports | Exports CSV clients et interventions | Fichiers complets, sans donnée inattendue | |
| 7.4 | RGPD | Effacer un client ; purge des RDV expirés | Données anonymisées partout (RDV, devis, journaux) | |
