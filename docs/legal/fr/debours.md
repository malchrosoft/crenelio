# Débours : pièces achetées au nom du client

*Dernière vérification : 01/11/2026. Base légale : CGI art. 267 II 2° (sommes remboursées aux
intermédiaires qui effectuent des dépenses au nom et pour le compte de leurs commettants). Sources
secondaires résumées : Portail auto-entrepreneur, Legifiscal, Dougs (voir [sources](../sources.md)).
Doctrine BOFiP à relire ; validation par un expert-comptable recommandée.*

## Pourquoi c'est important pour un micro-entrepreneur

Acheter une pièce **à son nom** puis la refacturer, c'est de l'**achat-revente** : le montant entre dans
le chiffre d'affaires (cotisations, seuils), et il s'agit d'une activité commerciale distincte de la
prestation de services. Le débours évite cela : la pièce est achetée **au nom et pour le compte du
client**, le montant n'entre pas dans le chiffre d'affaires et ne supporte pas de cotisations.

## Conditions (toutes nécessaires)

1. **Mandat écrit préalable** du client : nature de l'achat et **budget maximum**. Il sert de preuve si
   le client refuse de rembourser.
2. **Facture ou ticket du fournisseur au nom du client**, avec ses coordonnées complètes (pour un
   professionnel : SIRET, n° de TVA intracommunautaire, adresse du siège). Un achat au nom de l'artisan
   ne peut pas être un débours.
3. **Remboursement au montant exact**, sans marge ; pas de TVA ajoutée par un artisan en franchise.
4. **Ligne distincte** sur la facture, séparée du prix de la prestation.
5. **Justificatifs** : conserver les originaux (contrôle), en remettre une copie au client.
6. Dans le **livre des recettes**, indiquer « débours » à côté du montant.

## Ce qui ne peut pas être un débours

- Le carburant et les frais kilométriques (à intégrer dans le prix ou les frais de déplacement, qui
  entrent dans le chiffre d'affaires).
- Les outils, équipements et logiciels de l'artisan, ses propres frais de fonctionnement.

## Client professionnel assujetti à la TVA

Si l'artisan est en franchise de TVA, il est préférable que le client professionnel paie lui-même le
fournisseur : il pourra récupérer la TVA.

## Dans Crénelio

- Ligne de devis « Pièce au nom du client (débours) » : montant estimé, sans TVA de l'artisan, totalisée
  à part (`total_debours`), hors chiffre d'affaires.
- Mandat de débours accepté par une case distincte ; le budget est le total des débours du devis.
- La ligne « fourniture revendue » (achat-revente) est désactivée par défaut (`quote_allow_supply`).
