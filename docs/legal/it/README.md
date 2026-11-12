# Base documentale giuridica del professionista (*artisan*)

*Traduzione della versione francese attuale; fa fede la versione francese. I testi ufficiali sono citati in francese.*

Testi e riferimenti su cui si basano i preventivi (*devis*) di Crénelio (Item 22). Prima forma della base
documentale dell'Item 40: file Markdown, una cartella per lingua (fa fede `fr/`). In seguito
saranno caricati in database e tradotti; gli estratti dei testi ufficiali resteranno citati in francese,
con una spiegazione tradotta.

Queste schede si leggono anche nello Spazio Artigiano (menu **Aide › Documentation** (Aiuto › Documentazione)): ogni scheda aggiunta
qui vi compare; i collegamenti tra le schede restano relativi.

## Traduzioni

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` e, per divertimento, `fr-chti/` (ch'ti) (05/11/2026) riprendono le schede di `fr/` con lo stesso nome, e `README.md`
per il sommario. I testi ufficiali (`fr/textes/`) e `sources.md` non sono tradotti: sono
citati in francese. **Fa fede la versione francese**; ogni modifica di una scheda francese si
riporta nelle sue traduzioni (oppure queste vengono segnalate come non aggiornate). L'arabo (`ar/`) si scrive da destra a sinistra; le sue citazioni ufficiali, in francese, restano visualizzate da sinistra a destra.

## Regole

- Ogni file indica le sue **fonti** (collegamento) e la **data dell'ultima verifica**.
- Gli estratti dei testi ufficiali (Légifrance, schede dell'amministrazione) sono riprodotti tali e quali, tra
  virgolette o in citazione; le fonti private (guide, siti specializzati) sono **riassunte**, mai
  copiate.
- Presentazione di un testo ufficiale citato (come su Légifrance): un titolo `### Article …`, poi una
  citazione `>` in cui **ogni comma è un paragrafo** (elenchi « 1° », « a) », « II. - » compresi,
  separati da una riga `>` vuota); la menzione di versione (« Modifié par… », « Création… ») come primo
  comma, poi « NOTA : » da solo sulla sua riga. Lo schermo Documentazione ne ricava l'impaginazione; il testo
  stesso non viene mai modificato.
- Una fonte secondaria non sostituisce il testo ufficiale: è segnalata come tale e serve solo a
  trovare il testo giusto. **Ogni regola applicata in Crénelio deve essere confermata dal testo ufficiale**,
  per evitare distorsioni interpretative di terzi (studi professionali, editori, blog).
- A ogni evoluzione normativa (Item 39): aggiornare il file, la sua data e il codice interessato
  (`api/models/Quote.php`, impostazioni `quote_*` / `legal_*`).
- Queste schede sono un aiuto, non una consulenza legale: in caso di dubbio, il professionista consulta il suo
  commercialista (*expert-comptable*) o la sua camera dei mestieri (*chambre de métiers*).

## Schede

| Argomento | Scheda |
|---|---|
| Preventivo per le riparazioni a domicilio: documento precontrattuale, menzioni, pezzi sostituiti | [devis-depannage.md](devis-depannage.md) |
| Contratto a distanza o a domicilio: recesso, urgenza, esecuzione anticipata | [retractation.md](retractation.md) |
| Testo ufficiale del modello di informazione (allegato R221-3, 19 giugno 2026) e scelte di applicazione | [retractation-modele.md](retractation-modele.md) |
| Pezzi acquistati a nome del cliente: condizioni, giustificativi, fatturato | [debours.md](debours.md) |
| Rivendita di pezzi: conseguenze, forma giuridica, alternativa delle spese anticipate | [achat-revente.md](achat-revente.md) |
| Nota (fattura) obbligatoria oltre 25 € IVA inclusa | [note-facture.md](note-facture.md) |
| Menzione « EI », SIRET, RM, assicurazione, mediatore, pubblicità dei prezzi | [mentions-entreprise.md](mentions-entreprise.md) |
| Promemoria del professionista: acquisti, giustificativi, conservazione | [rappels-artisan.md](rappels-artisan.md) |
| Annullare o spostare un appuntamento che ha un preventivo: offerta annullata, revoca, forza maggiore | [annulation-devis.md](annulation-devis.md) |
| Conservazione e cancellazione dei dati dei clienti: dieci anni per un preventivo accettato, RGPD | [conservation-effacement.md](conservation-effacement.md) |
| Testi ufficiali, parola per parola: Code de la consommation (Codice del consumo francese) | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Testi ufficiali: Code de commerce (Codice di commercio francese; EI, società) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Testi ufficiali: Code général des impôts (Codice generale delle imposte francese; spese anticipate, franchigia) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Testi ufficiali: Code de l'artisanat (Codice dell'artigianato francese; *qualité d'artisan*) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Testi ufficiali: decreti ministeriali (*arrêtés*) del 1983 (nota), 1987 (informazione sui prezzi) e 2017 (preventivo per le riparazioni) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Testi ufficiali: CGI, allegato II (menzioni obbligatorie delle fatture) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Testi ufficiali: Code de la sécurité sociale (Codice della previdenza sociale francese; contributi del micro-imprenditore) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Testi ufficiali: Code des assurances (Codice delle assicurazioni francese; assicurazione decennale, attestato allegato ai preventivi) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Testi ufficiali: Code civil (Codice civile francese; offerta e accettazione, modifica del contratto, forza maggiore, risoluzione; costruttore, garanzie decennale, biennale, di perfetto completamento) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Testi ufficiali: diritto dell'Unione (calcolo dei termini: regolamento 1182/71, direttiva 2011/83/UE; RGPD: conservazione, basi giuridiche, cancellazione) | [../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md) |
| Testi ufficiali: Code de procédure civile (Codice di procedura civile francese; calcolo dei termini) | [../fr/textes/code-procedure-civile.md](../fr/textes/code-procedure-civile.md) |
| Dottrina fiscale (BOFiP): spese anticipate, pezzi di ricambio | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Elenco delle fonti, natura e data di verifica | [../sources.md](../sources.md) |
