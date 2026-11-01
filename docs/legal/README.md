# Base documentaire légale de l'artisan

Textes et références sur lesquels reposent les devis de Crénelio (Item 22). Première forme de la base
documentaire de l'Item 40 : des fichiers Markdown, un dossier par langue (`fr/` fait foi). Plus tard,
ils seront chargés en base et traduits ; les extraits de textes officiels restent alors cités en français,
avec une explication traduite.

## Règles

- Chaque fichier indique ses **sources** (lien) et la **date de la dernière vérification**.
- Les extraits de textes officiels (Légifrance, fiches de l'administration) sont repris tels quels, entre
  guillemets ou en citation ; les sources privées (guides, sites spécialisés) sont **résumées**, jamais
  copiées.
- Une source secondaire ne remplace pas le texte officiel : elle est signalée comme telle.
- À chaque évolution réglementaire (Item 39) : mettre à jour le fichier, sa date, et le code concerné
  (`api/models/Quote.php`, réglages `quote_*` / `legal_*`).
- Ces fiches sont une aide, pas un conseil juridique : en cas de doute, l'artisan consulte son
  expert-comptable ou sa chambre de métiers.

## Fiches

| Fiche | Sujet |
|---|---|
| [fr/devis-depannage.md](fr/devis-depannage.md) | Devis du dépannage à domicile : document précontractuel, mentions, pièces remplacées |
| [fr/retractation.md](fr/retractation.md) | Contrat à distance ou au domicile : rétractation, urgence, exécution anticipée |
| [fr/debours.md](fr/debours.md) | Pièces achetées au nom du client : conditions, justificatifs, chiffre d'affaires |
| [fr/achat-revente.md](fr/achat-revente.md) | Revente de pièces : conséquences, forme juridique, alternative du débours |
| [fr/note-facture.md](fr/note-facture.md) | Note (facture) obligatoire au-delà de 25 € TTC |
| [fr/mentions-entreprise.md](fr/mentions-entreprise.md) | Mention « EI », SIRET, RM, assurance, médiateur, publicité des prix |
| [fr/rappels-artisan.md](fr/rappels-artisan.md) | Aide-mémoire de l'artisan : achats, justificatifs, conservation |
| [sources.md](sources.md) | Liste des sources, nature et date de vérification |
