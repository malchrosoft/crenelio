# Base documentaire légale de l'artisan

Textes et références sur lesquels reposent les devis de Crénelio (Item 22). Première forme de la base
documentaire de l'Item 40 : des fichiers Markdown, un dossier par langue (`fr/` fait foi). Plus tard,
ils seront chargés en base et traduits ; les extraits de textes officiels restent alors cités en français,
avec une explication traduite.

Ces fiches se lisent aussi dans l'Espace Artisan (menu **Aide › Documentation**) : toute fiche ajoutée
ici y apparaît, les liens entre fiches restent relatifs.

## Règles

- Chaque fichier indique ses **sources** (lien) et la **date de la dernière vérification**.
- Les extraits de textes officiels (Légifrance, fiches de l'administration) sont repris tels quels, entre
  guillemets ou en citation ; les sources privées (guides, sites spécialisés) sont **résumées**, jamais
  copiées.
- Une source secondaire ne remplace pas le texte officiel : elle est signalée comme telle et ne sert qu'à
  trouver le bon texte. **Toute règle appliquée dans Crénelio doit être confirmée par le texte officiel**,
  pour éviter les biais d'interprétation de tiers (cabinets, éditeurs, blogs).
- À chaque évolution réglementaire (Item 39) : mettre à jour le fichier, sa date, et le code concerné
  (`api/models/Quote.php`, réglages `quote_*` / `legal_*`).
- Ces fiches sont une aide, pas un conseil juridique : en cas de doute, l'artisan consulte son
  expert-comptable ou sa chambre de métiers.

## Fiches

| Sujet | Fiche |
|---|---|
| Devis du dépannage à domicile : document précontractuel, mentions, pièces remplacées | [fr/devis-depannage.md](fr/devis-depannage.md) |
| Contrat à distance ou au domicile : rétractation, urgence, exécution anticipée | [fr/retractation.md](fr/retractation.md) |
| Texte officiel du modèle d'information (annexe R221-3, 19 juin 2026) et choix d'application | [fr/retractation-modele.md](fr/retractation-modele.md) |
| Pièces achetées au nom du client : conditions, justificatifs, chiffre d'affaires | [fr/debours.md](fr/debours.md) |
| Revente de pièces : conséquences, forme juridique, alternative du débours | [fr/achat-revente.md](fr/achat-revente.md) |
| Note (facture) obligatoire au-delà de 25 € TTC | [fr/note-facture.md](fr/note-facture.md) |
| Mention « EI », SIRET, RM, assurance, médiateur, publicité des prix | [fr/mentions-entreprise.md](fr/mentions-entreprise.md) |
| Aide-mémoire de l'artisan : achats, justificatifs, conservation | [fr/rappels-artisan.md](fr/rappels-artisan.md) |
| Textes officiels, mot pour mot : Code de la consommation | [fr/textes/code-consommation.md](fr/textes/code-consommation.md) |
| Textes officiels : Code de commerce (EI, sociétés) | [fr/textes/code-commerce.md](fr/textes/code-commerce.md) |
| Textes officiels : Code général des impôts (débours, franchise) | [fr/textes/code-general-impots.md](fr/textes/code-general-impots.md) |
| Textes officiels : Code de l'artisanat (qualité d'artisan) | [fr/textes/code-artisanat.md](fr/textes/code-artisanat.md) |
| Textes officiels : arrêtés de 1983 (note) et de 2017 (devis du dépannage) | [fr/textes/arretes.md](fr/textes/arretes.md) |
| Doctrine fiscale (BOFiP) : débours, pièces détachées | [fr/textes/bofip.md](fr/textes/bofip.md) |
| Liste des sources, nature et date de vérification | [sources.md](sources.md) |
|---|---|