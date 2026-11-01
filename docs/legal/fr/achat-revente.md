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

## Société

La revente doit entrer dans l'**objet social** ; les pièces sont facturées avec la TVA de la société.

## Dans Crénelio

- Ligne « fourniture revendue » refusée par l'API tant que `quote_allow_supply` n'est pas activé.
- Activation derrière un **avertissement** adapté à la forme juridique (`legal_form`), à accepter
  explicitement ; recommandation par défaut : le débours.
