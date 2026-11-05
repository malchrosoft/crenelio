# Acat-revente ed fournitures (pièces revindues)

*Version in ch'ti, pour l'plaisir, d'el fiche française du 01/11/2026 ; ch'est l'version française qui fait foi. Les textes officiels, eux, i restent in français.*

*Dernière vérification : 01/11/2026. Sources : Portail auto-entrepreneur (débours et frais refacturés,
résumé) ; règles du régime micro-entrepreneur à r'lire su les sites officiels (URSSAF, guichet unique)
avant toute activation. Vir [sources](../sources.md).*

## Quo qu'ch'est

L'artisan i acate l'pièce **à sin nom**, pis i l'refacture au client (avec ou sans marge). Ch'est eune
**vinte ed marchandises**, à part d'el prestation d'services. Faut point l'confonde avec l'
[débours](debours.md), où l'pièce est acatée au nom et pour l'compte du client.

## Ch'que cha change pour un intrepreneur individuel (micro-intreprise)

- L'montant revindu **rinte dins l'chiffre d'affaires** (l'Portail auto-entrepreneur i déconseille cha
  pour cha : cha fait monter les cotisations).
- L'vinte ed marchandises all' a ses **propes seuils** d'chiffre d'affaires et sin **propre taux** d'
  cotisations ; avec des prestations d'services, l'activité all' dévient **mixte** et les deux chiffres on
  les suit à part (montants in vigueur : Item 39, à vérifier chaque année).
- L'activité d'vinte, faut l'**déclarer** (guichet unique) si ch'est point déjà fait.
- L'artisan i dévient **vindeur** : facture d'acat à sin nom, garanties légales dues au client su l'
  pièce, stock éventuel.

## TVA des pièces posées (artisan assujetti)

BOI-TVA-BASE-10-20-40-20, § 140 et 150 ([../fr/textes/bofip.md](../fr/textes/bofip.md)) : les **fournitures**
(matières transformées ou consommées) i suivent l'prix du service ; les **pièces détachées** (objets
normalisés simplemint posés) ch'est eune **vinte au taux qui leu est propre**, sauf si leu valeur est
pus p'tite que cheulle d'el pose ou si on les a adaptées. Simplification admise : pièces et fournitures
i suivent l'régime d'el prestation si leu valeur globale **n'dépasse point 50 % du coût total** ; sinon
l'vinte des pièces, on l'marque **à part** su l'facture.

Dins Crénelio (devis avec TVA) : l'éditeur i calcule l'part des lignes « fourniture revendue » dins l'
coût total HT (débours exclus, hors chiffre d'affaires) et i l'rappelle sous les lignes : jusqu'à 50 %, même
taux qu'el prestation ; au-delà, taux propre des pièces, su des lignes à part (ch'que l'devis i fait déjà).
Un devis qui a eune fourniture revindue, i est assimilé à eune **vinte** (C. consom. L221-1, II) : l'
délai d'rétractation i court d'el remise des pièces au client (L221-18, 2°), date à saisir dins l'devis
accepté ; vir [retractation-modele.md](retractation-modele.md).

L'contrôle d'TVA ch'est **pour indication** : l'comparaison, in principe, all' se fait pièce par pièce, et
y a qu'el professionnel qui sait si eune pièce all' a été adaptée. L'taux, ch'est sin choix, à valider
avec sin comptable.

## Société

L'revinte all' doit rintrer dins l'**objet social** ; les pièces sont facturées avec l'TVA d'el société.

## Dins Crénelio

- Ligne « fourniture revendue » refusée par l'API tant qu'`quote_allow_supply` i n'est point activé.
- Activation derrière un **avertissemint** adapté à l'forme juridique (`legal_form`), à accepter
  explicitemint ; ch'qu'on conseille par défaut : l'débours.
