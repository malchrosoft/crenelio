# Legal documentation base for the tradesperson (*artisan*)

*Translation of the current French version (`docs/legal/README.md`) — the French version prevails. Official texts are quoted in French.*

Texts and references on which Crénelio quotes (*devis*) are based (Item 22). First form of the
documentation base of Item 40: Markdown files, one folder per language (`fr/` prevails). Later, they will
be loaded into the database and translated; extracts from official texts will then remain quoted in
French, with a translated explanation.

These sheets can also be read in the Espace Artisan (Tradesperson area) (menu **Aide › Documentation**):
any sheet added here appears there; links between sheets remain relative.

## Translations

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` and, for fun, `fr-chti/` (Ch'ti) (05/11/2026) contain the sheets of `fr/` under the same name, and `README.md`
for the table of contents. Official texts (`fr/textes/`) and `sources.md` are not translated: they are
quoted in French. **The French version prevails**; any change to a French sheet is carried over
to its translations (or they are flagged as out of date). Arabic (`ar/`) is written right to left; its official quotations, in French, remain displayed left to right.

## Rules

- Each file states its **sources** (link) and the **date of the last check**.
- Extracts from official texts (Légifrance, government information sheets) are reproduced as is, in
  quotation marks or as quotations; private sources (guides, specialised websites) are **summarised**,
  never copied.
- Presentation of a quoted official text (as on Légifrance): a `### Article …` heading, then a
  `>` quotation in which **each *alinéa* is a separate paragraph** (enumerations « 1° », « a) », « II. - » included,
  separated by an empty `>` line); the version notice (« Modifié par… », « Création… ») as the first
  paragraph, then « NOTA : » alone on its line. The Documentation screen derives the layout from it; the text
  itself is never modified.
- A secondary source does not replace the official text: it is flagged as such and only serves to find
  the right text. **Any rule applied in Crénelio must be confirmed by the official text**, to avoid
  interpretation bias from third parties (law firms, publishers, blogs).
- At each regulatory change (Item 39): update the file, its date, and the related code
  (`api/models/Quote.php`, `quote_*` / `legal_*` settings).
- These sheets are an aid, not legal advice: if in doubt, the tradesperson consults their chartered
  accountant (*expert-comptable*) or their chamber of trades (*chambre de métiers*).

## Sheets

| Topic | Sheet |
|---|---|
| Quote for home repair services: pre-contractual document, mandatory information, replaced parts | [devis-depannage.md](devis-depannage.md) |
| Distance or off-premises contract: withdrawal, emergency, early performance | [retractation.md](retractation.md) |
| Official text of the information model (annex R221-3, 19 June 2026) and implementation choices | [retractation-modele.md](retractation-modele.md) |
| Parts bought in the customer's name: conditions, supporting documents, turnover | [debours.md](debours.md) |
| Resale of parts: consequences, legal form, the disbursement alternative | [achat-revente.md](achat-revente.md) |
| Note (invoice) mandatory above €25 incl. VAT | [note-facture.md](note-facture.md) |
| « EI » mention, SIRET, RM, insurance, mediator, price display | [mentions-entreprise.md](mentions-entreprise.md) |
| Tradesperson's checklist: purchases, supporting documents, retention | [rappels-artisan.md](rappels-artisan.md) |
| Official texts, word for word: Code de la consommation (French Consumer Code) | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Official texts: Code de commerce (French Commercial Code) (EI, companies) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Official texts: Code général des impôts (French General Tax Code) (disbursements, VAT exemption threshold) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Official texts: Code de l'artisanat (French Crafts Code) (status of *artisan*) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Official texts: orders (*arrêtés*) of 1983 (note), 1987 (price information) and 2017 (repair quotes) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Official texts: CGI, annex II (mandatory invoice information) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Official texts: Code de la sécurité sociale (French Social Security Code) (micro-entrepreneur contributions) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Official texts: Code des assurances (French Insurance Code) (ten-year liability insurance, certificate attached to quotes) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Official texts: Code civil (French Civil Code) (builder, ten-year, two-year and completion guarantees) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Tax doctrine (BOFiP): disbursements, spare parts | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| List of sources, type and date of check | [../sources.md](../sources.md) |
