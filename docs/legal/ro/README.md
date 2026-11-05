# Baza documentară juridică a profesionistului

*Traducere a versiunii franceze actuale; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

Texte și referințe pe care se sprijină devizele (*devis*) din Crénelio (Item 22). Prima formă a bazei
documentare din Item 40: fișiere Markdown, câte un dosar pe limbă (`fr/` face fidă). Mai târziu,
ele vor fi încărcate în baza de date și traduse; extrasele din textele oficiale rămân atunci citate în franceză,
cu o explicație tradusă.

Aceste fișe se citesc și în Espace Artisan (Spațiul profesionistului), meniul **Aide › Documentation** (Ajutor › Documentație): orice fișă adăugată
aici apare acolo, iar legăturile dintre fișe rămân relative.

## Traduceri

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` și, de plăcere, `fr-chti/` (ch'ti) (05/11/2026) preiau fișele din `fr/` sub același nume, iar `README.md`
pentru cuprins. Textele oficiale (`fr/textes/`) și `sources.md` nu sunt traduse: ele sunt
citate în franceză. **Versiunea franceză face fidă**; orice modificare a unei fișe franceze se
transpune în traducerile sale (sau acestea sunt semnalate ca rămase în urmă). Araba (`ar/`) se scrie de la dreapta la stânga; citatele sale oficiale, în franceză, rămân afișate de la stânga la dreapta.

## Reguli

- Fiecare fișier își indică **sursele** (link) și **data ultimei verificări**.
- Extrasele din textele oficiale (Légifrance, fișele administrației) sunt reluate ca atare, între
  ghilimele sau în citat; sursele private (ghiduri, site-uri de specialitate) sunt **rezumate**, niciodată
  copiate.
- Prezentarea unui text oficial citat (ca pe Légifrance): un titlu `### Article …`, apoi un
  citat `>` în care **fiecare alineat este un paragraf** (inclusiv enumerările „1°”, „a)”, „II. -”,
  separate printr-o linie `>` goală); mențiunea versiunii („Modifié par…”, „Création…”) ca prim
  alineat, apoi „NOTA :” singur pe rândul său. Ecranul Documentation preia de aici formatarea; textul
  însuși nu este niciodată modificat.
- O sursă secundară nu înlocuiește textul oficial: este semnalată ca atare și servește doar la
  găsirea textului corect. **Orice regulă aplicată în Crénelio trebuie confirmată de textul oficial**,
  pentru a evita interpretările părtinitoare ale terților (cabinete, edituri, bloguri).
- La fiecare schimbare a reglementării (Item 39): se actualizează fișierul, data sa și codul în cauză
  (`api/models/Quote.php`, setările `quote_*` / `legal_*`).
- Aceste fișe sunt un ajutor, nu o consultanță juridică: în caz de îndoială, profesionistul consultă
  contabilul autorizat (*expert-comptable*) sau camera sa de meserii (*chambre de métiers*).

## Fișe

| Subiect | Fișă |
|---|---|
| Devizul pentru depanare la domiciliu: document precontractual, mențiuni, piese înlocuite | [devis-depannage.md](devis-depannage.md) |
| Contract la distanță sau la domiciliu: retragere, urgență, executare anticipată | [retractation.md](retractation.md) |
| Textul oficial al modelului de informare (anexa R221-3, 19 iunie 2026) și opțiunile de aplicare | [retractation-modele.md](retractation-modele.md) |
| Piese cumpărate în numele clientului: condiții, documente justificative, cifra de afaceri | [debours.md](debours.md) |
| Revânzarea pieselor: consecințe, formă juridică, alternativa *débours* | [achat-revente.md](achat-revente.md) |
| Notă (factură) obligatorie peste 25 € cu TVA | [note-facture.md](note-facture.md) |
| Mențiunea „EI”, SIRET, RM, asigurare, mediator, publicitatea prețurilor | [mentions-entreprise.md](mentions-entreprise.md) |
| Memento al profesionistului: achiziții, documente justificative, păstrare | [rappels-artisan.md](rappels-artisan.md) |
| Texte oficiale, cuvânt cu cuvânt: Code de la consommation (Codul francez al consumului) | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Texte oficiale: Code de commerce (Codul comercial francez; EI, societăți) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Texte oficiale: Code général des impôts (Codul general fiscal; *débours*, scutire) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Texte oficiale: Code de l'artisanat (Codul meșteșugurilor; *qualité d'artisan*) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Texte oficiale: ordinele (*arrêtés*) din 1983 (notă), 1987 (informarea asupra prețurilor) și 2017 (devizul pentru depanare) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Texte oficiale: CGI, anexa II (mențiunile obligatorii ale facturilor) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Texte oficiale: Code de la sécurité sociale (Codul securității sociale; contribuțiile microîntreprinzătorului) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Texte oficiale: Code des assurances (Codul asigurărilor; asigurarea decenală, atestat anexat devizelor) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Texte oficiale: Code civil (Codul civil; constructor, garanțiile decenală, bienală, de bună execuție) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Doctrina fiscală (BOFiP): *débours*, piese de schimb | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Lista surselor, natura și data verificării | [../sources.md](../sources.md) |
