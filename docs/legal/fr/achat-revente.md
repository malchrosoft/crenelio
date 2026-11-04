# Achat-revente de fournitures (pièces revendues)

*Dernière vérification : 01/11/2026. Sources : Portail auto-entrepreneur (débours et frais refacturés,
résumé) ; règles du régime micro-entrepreneur à relire sur les sites officiels (URSSAF, guichet unique)
avant toute activation. Voir [sources](../sources.md).*

## Ce que c'est

L'artisan achète la pièce **à son nom**, puis la refacture au client (avec ou sans marge). C'est une
**vente de marchandises**, distincte de la prestation de services. À ne pas confondre avec le
[débours](debours.md), où la pièce est achetée au nom et pour le compte du client.

## Conséquences pour un entrepreneur individuel (micro-entreprise)

- Le montant revendu **entre dans le chiffre d'affaires** (le Portail auto-entrepreneur déconseille cette
  méthode pour cette raison : il augmente les cotisations).
- La vente de marchandises a ses **propres seuils** de chiffre d'affaires et son **propre taux** de
  cotisations ; avec des prestations de services, l'activité devient **mixte** et les deux chiffres sont
  suivis séparément (montants en vigueur : Item 39, à vérifier chaque année).
- L'activité de vente doit être **déclarée** (guichet unique) si elle ne l'est pas déjà.
- L'artisan devient **vendeur** : facture d'achat à son nom, garanties légales dues au client sur la
  pièce, stock éventuel.

## TVA des pièces posées (artisan assujetti)

BOI-TVA-BASE-10-20-40-20, § 140 et 150 ([textes/bofip.md](textes/bofip.md)) : les **fournitures**
(matières transformées ou consommées) suivent le prix du service ; les **pièces détachées** (objets
normalisés simplement posés) sont une **vente au taux qui leur est propre**, sauf si leur valeur est
inférieure à celle de la pose ou si elles ont été adaptées. Simplification admise : pièces et fournitures
suivent le régime de la prestation si leur valeur globale **n'excède pas 50 % du coût total** ; sinon la
vente des pièces est mentionnée **distinctement** sur la facture.

Dans Crénelio (devis avec TVA) : l'éditeur calcule la part des lignes « fourniture revendue » dans le
coût total HT (débours exclus, hors chiffre d'affaires) et le rappelle sous les lignes : jusqu'à 50 %, même
taux que la prestation ; au-delà, taux propre des pièces, sur des lignes distinctes (ce que fait déjà le
devis). Ce contrôle est **indicatif** : la comparaison se fait en principe pièce par pièce, et seul le
professionnel sait si une pièce a été adaptée. Le taux reste son choix, à valider avec son comptable.

## Société

La revente doit entrer dans l'**objet social** ; les pièces sont facturées avec la TVA de la société.

## Dans Crénelio

- Ligne « fourniture revendue » refusée par l'API tant que `quote_allow_supply` n'est pas activé.
- Activation derrière un **avertissement** adapté à la forme juridique (`legal_form`), à accepter
  explicitement ; recommandation par défaut : le débours.
