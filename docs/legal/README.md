# Base documentaire légale de l'artisan

Textes et références sur lesquels reposent les devis de Crénelio (Item 22). Première forme de la base
documentaire de l'Item 40 : des fichiers Markdown, un dossier par langue (`fr/` fait foi). Plus tard,
ils seront chargés en base et traduits ; les extraits de textes officiels restent alors cités en français,
avec une explication traduite.

Ces fiches se lisent aussi dans l'Espace Artisan (menu **Aide › Documentation**) : toute fiche ajoutée
ici y apparaît, les liens entre fiches restent relatifs.

## Traductions

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/` et, pour le plaisir, `fr-chti/` (ch'ti) (05/11/2026) reprennent les fiches de `fr/` sous le même nom, et `README.md`
pour le sommaire. Les textes officiels (`fr/textes/`) et `sources.md` ne sont pas traduits : ils sont
cités en français. **La version française fait foi** ; toute modification d'une fiche française se
reporte dans ses traductions (ou les signale comme en retard). Arabe (`ar/`, écriture de droite à
gauche) prévu ; l'écran gère déjà le sens d'écriture.

## Règles

- Chaque fichier indique ses **sources** (lien) et la **date de la dernière vérification**.
- Les extraits de textes officiels (Légifrance, fiches de l'administration) sont repris tels quels, entre
  guillemets ou en citation ; les sources privées (guides, sites spécialisés) sont **résumées**, jamais
  copiées.
- Présentation d'un texte officiel cité (comme sur Légifrance) : un titre `### Article …`, puis une
  citation `>` dont **chaque alinéa est un paragraphe** (énumérations « 1° », « a) », « II. - » comprises,
  séparés par une ligne `>` vide) ; la mention de version (« Modifié par… », « Création… ») en premier
  alinéa, puis « NOTA : » seul sur sa ligne. L'écran Documentation en tire la mise en forme ; le texte
  lui-même n'est jamais modifié.
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
| Textes officiels : arrêtés de 1983 (note), 1987 (information sur les prix) et 2017 (devis du dépannage) | [fr/textes/arretes.md](fr/textes/arretes.md) |
| Textes officiels : CGI, annexe II (mentions obligatoires des factures) | [fr/textes/code-general-impots-annexe-2.md](fr/textes/code-general-impots-annexe-2.md) |
| Textes officiels : Code de la sécurité sociale (cotisations du micro-entrepreneur) | [fr/textes/code-securite-sociale.md](fr/textes/code-securite-sociale.md) |
| Textes officiels : Code des assurances (assurance décennale, attestation jointe aux devis) | [fr/textes/code-assurances.md](fr/textes/code-assurances.md) |
| Textes officiels : Code civil (constructeur, garanties décennale, biennale, de parfait achèvement) | [fr/textes/code-civil.md](fr/textes/code-civil.md) |
| Doctrine fiscale (BOFiP) : débours, pièces détachées | [fr/textes/bofip.md](fr/textes/bofip.md) |
| Liste des sources, nature et date de vérification | [sources.md](sources.md) |
