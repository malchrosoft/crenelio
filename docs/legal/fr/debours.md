# Débours : pièces achetées au nom du client

*Dernière vérification : 01/11/2026. Base légale : CGI art. 267 II 2° (sommes remboursées aux
intermédiaires qui effectuent des dépenses au nom et pour le compte de leurs commettants). Sources
secondaires résumées : Portail auto-entrepreneur, Legifiscal, Dougs (voir [sources](../sources.md)).
Doctrine BOFiP lue le 04/11/2026 ; validation par un expert-comptable recommandée.*

## Textes officiels (vérifié le 04/11/2026)

- **Loi** : CGI, article 267, II, 2° ([textes/code-general-impots.md](textes/code-general-impots.md)).
- **Doctrine** : BOI-TVA-BASE-10-10-30, III, § 200 à 230 et BOI-TVA-BASE-10-20-40-30, § 130
  ([textes/bofip.md](textes/bofip.md)). Les **quatre conditions cumulatives** :
  1. agir en vertu d'un **mandat préalable et explicite** (« et non pas présumé ») au nom et pour le
     compte du mandant ;
  2. **rendre compte exactement** au client de l'engagement et du montant des dépenses ;
  3. porter ces dépenses dans des **comptes de passage** (pour qui ne tient pas de comptabilité
     commerciale : des « comptes spécifiques », BOI-TVA-BASE-10-20-40-20 § 70) ;
  4. **justifier** de la nature ou du montant exact des débours (factures des fournisseurs, comptes rendus
     adressés au client…).
- **Agir au nom du client** (§ 220) : le contrat avec le fournisseur mentionne qu'il est passé au nom
  d'autrui, ou **la facture est adressée directement au client** ; si elle est adressée à l'artisan, elle
  doit faire apparaître qu'il agit au nom d'autrui (nom et adresse du client).
- **Exclu** (§ 210, § 230) : les dépenses engagées pour sa propre entreprise et les simples charges
  d'exploitation répercutées sur la clientèle.

Le mandat **distinct et préalable** de Crénelio, la facture au nom du client et la reddition de compte
(fiche « Préparer la facture », copie du justificatif) répondent à ces conditions. 

### Micro-entrepreneur : chiffre d'affaires et livre des recettes (vérifié le 04/11/2026)

- **Cotisations** (C. sécu. soc. L613-7, [textes/code-securite-sociale.md](textes/code-securite-sociale.md)) :
  calculées sur « le montant de leur **chiffre d'affaires** ou de leurs recettes **effectivement
  réalisés** » des bénéficiaires des régimes des articles 50-0 et 102 ter du CGI. **Aucun article ne
  mentionne explicitement les débours.** Leur exclusion découle de ce qu'ils ne sont pas le chiffre
  d'affaires de l'entrepreneur : des sommes avancées au nom et pour le compte du client, aux conditions
  de l'article 267, II, 2° du CGI et de la doctrine ci-dessus. Une source secondaire affirmant qu'elle est
  « ancrée dans l'article L613-7 » va plus loin que le texte.
- **Seuils** (CGI 50-0, 1, version du 31/10/2026, [textes/code-general-impots.md](textes/code-general-impots.md)) :
  **83 600 €** de chiffre d'affaires hors taxes pour les prestations de services, **203 100 €** pour la
  vente de marchandises ; actualisés tous les trois ans.
- **Livre des recettes** (C. com. L123-28 et CGI 50-0, 5) : un livre « mentionnant chronologiquement le
  montant et l'origine des recettes », « servi au jour le jour », **appuyé des factures et de toutes autres
  pièces justificatives**. Les textes n'imposent pas de mention « débours » : l'inscrire à part (ou dans un
  registre annexé) est une **bonne pratique** pour expliquer l'écart entre les encaissements et le
  chiffre d'affaires déclaré, à valider avec l'expert-comptable.

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
6. Dans le **livre des recettes**, indiquer « débours » à côté du montant (bonne pratique : les textes
   imposent un livre chronologique des recettes appuyé des justificatifs, sans exiger cette mention).

## Ce qui ne peut pas être un débours

- Le carburant et les frais kilométriques (à intégrer dans le prix ou les frais de déplacement, qui
  entrent dans le chiffre d'affaires).
- Les outils, équipements et logiciels de l'artisan, ses propres frais de fonctionnement.

## Client professionnel assujetti à la TVA

Si l'artisan est en franchise de TVA, il est préférable que le client professionnel paie lui-même le
fournisseur : il pourra récupérer la TVA.

## Mandat : un accord distinct du devis

Les sources exigent un **accord écrit préalable** (« mandat de débours ») précisant la nature de l'achat
et le budget maximum, signé par les deux parties ; aucune ne prescrit sa forme. Crénelio le traite comme
un **document séparé** du devis, avec son **propre accord** : le mandat engage le client à rembourser un
achat fait en son nom, ce qui n'est pas l'objet du devis de prestation, et il sert de preuve propre en cas
de contrôle (montants hors chiffre d'affaires). Le client peut accepter le devis et **refuser le mandat** :
il fournit alors lui-même les pièces.

## Dans Crénelio

- Éditeur : section « Mandat de débours (document séparé) » : pièces au nom du client, **budget maximum**
  (`debours_budget`, au moins le montant estimé), rappels à l'artisan.
- Totaux : le **total du devis** ne couvre que les prestations ; les débours sont totalisés à part
  (`total_debours`), avec un « total estimé à régler » indicatif.
- Réponse du client : accord sur le devis **et** réponse distincte au mandat (donné ou refusé), chacun daté
  (`decided_at`, `mandate_decided_at`) avec l'adresse IP.
- Version imprimable du mandat, seule (étape 4 de l'Item 22).
- La ligne « fourniture revendue » (achat-revente) est désactivée par défaut (`quote_allow_supply`).
