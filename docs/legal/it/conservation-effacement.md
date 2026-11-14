# Conservazione e cancellazione dei dati dei clienti

*Traduzione della versione francese del 14/11/2026; fa fede la versione francese. I testi ufficiali sono citati in francese.*

*Ultima verifica: 14/11/2026. Base giuridica: Code de la consommation (Codice del consumo francese), L213-1,
D213-1 e D213-2 (conservazione dei contratti conclusi per via elettronica); Code de commerce (Codice di commercio
francese), L123-22 (documenti giustificativi); regolamento (UE) 2016/679 (RGPD), articoli 5, 6 e 17. Testi parola
per parola: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md),
[../fr/textes/code-commerce.md](../fr/textes/code-commerce.md),
[../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md). Scheda di aiuto, non una consulenza legale.*

## L'essenziale

| Dato | Conservato | Poi |
|---|---|---|
| Appuntamento (nome, email, telefono, indirizzo, note) | La durata impostata (schermata Account, 36 mesi per impostazione predefinita) dopo l'intervento | **Eliminato** automaticamente |
| Preventivo **non accettato** (bozza, inviato, rifiutato, scaduto, annullato) | La stessa durata | **Eliminato** automaticamente |
| Preventivo **accettato** (contratto), anche se poi oggetto di recesso | **Dieci anni** dopo l'intervento (o, in mancanza, dopo l'accordo), con la traccia dell'accordo; concluso l'intervento, è **archiviato** (filtro « Archivés » (*Archiviati*) della schermata « Devis » (*Preventivi*)) | **Eliminato** automaticamente, insieme al suo appuntamento |

Perché eliminare anziché « anonimizzare »: una riga conservata con la sua data, la prestazione, l'importo e il
comune può ancora identificare il cliente, ad esempio confrontandola con una fattura. Togliere il nome non basta a
rendere anonimo un dato: non deve più essere possibile isolare una persona, collegarne i dati né dedurne
informazioni (Gruppo di lavoro articolo 29, parere 05/2014 sulle tecniche di anonimizzazione, p. 9 e 10). Crénelio
quindi elimina, invece di conservare righe « anonimizzate ».

*Portata di questa fonte (verificata il 14/11/2026)*: il parere 05/2014 è **anteriore al RGPD** (adottato nel 2016,
applicabile dal 25 maggio 2018) e non figura nell'elenco dei documenti del Gruppo di lavoro articolo 29 fatti
propri dal Comitato europeo per la protezione dei dati nella sua prima riunione; resta tuttavia il riferimento
citato dalla CNIL (autorità francese per la protezione dei dati) nella sua guida sulle durate di conservazione
(luglio 2020) e nel suo quadro di riferimento sulla gestione commerciale (deliberazione n. 2021-131, pubblicata nel Journal officiel del 10/04/2022). Il Comitato
ha sottoposto a consultazione linee guida sulla pseudonimizzazione (01/2025, versione definitiva non confermata a
tale data). L'eliminazione scelta da Crénelio non dipende da questi dibattiti: un dato eliminato non deve più
essere qualificato.

Durante la conservazione, un preventivo accettato è in **archiviazione intermedia** ai sensi della CNIL: si
conservano solo i dati che attestano il contratto (il telefono del cliente viene tolto), esce dall'elenco corrente
dei preventivi e si consulta solo se necessario, ad esempio per una controversia o una richiesta del cliente (CNIL,
guida sulle durate di conservazione, luglio 2020, e quadro di riferimento « gestion des activités commerciales »).

## Perché dieci anni per un preventivo accettato

- **Contratto concluso online di 120 € o più**: obbligo. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » e « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). L'importo è fissato a 120 euro (D213-1); la durata, a dieci anni dalla conclusione, o
  dall'esecuzione quando questa è differita (D213-2). Un preventivo accettato dalla sua pagina online rientra in
  questo caso.
- **Sotto i 120 €**: la legge non lo impone ai sensi di L213-1. Crénelio applica **la stessa durata per
  prudenza**: un preventivo accettato è un documento che giustifica la vostra fattura, e il Code de commerce
  prevede che « les documents comptables et les pièces justificatives sont conservés pendant dix ans »
  (L123-22). Questo testo riguarda anzitutto i commercianti: il vostro commercialista vi dirà se si applica alla
  vostra situazione.

## Un contratto bloccato, e la sua prova

Il preventivo è **bloccato**:

- **all'invio**, i dati della vostra impresa (nome, identità legale, indirizzo, SIRET, assicurazione, mediatore,
  reclami…) sono copiati sul preventivo: se viene consultato fra otto anni, presenta quelli che figuravano sul
  preventivo inviato, anche se nel frattempo avete cambiato indirizzo o mediatore;
- **all'accettazione**, Crénelio calcola un'**impronta** (hash, SHA-256) di tutto ciò che costituisce il contratto e
  della traccia dell'accordo. Ricalcolata su richiesta, dimostra che da allora nulla è cambiato: l'editor del
  preventivo indica « Contrat figé : oui, intact » (*Contratto bloccato: sì, intatto*).

Ciò risponde alle condizioni dello scritto elettronico (*écrit électronique*), che « a la même force probante que
l'écrit sur support papier, sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit
établi et conservé dans des conditions de nature à en garantir l'intégrité » (C. civ. 1366). L'accettazione online
è una **firma elettronica semplice**: valida, ma la sua affidabilità non è presunta, a differenza di una firma
qualificata (C. civ. 1367; décret n° 2017-1416, art. 1); in caso di controversia, spetta a voi provare
l'identificazione e l'integrità, da cui questo blocco. I preventivi accettati prima del 14/11/2026 non sono
bloccati.

Ogni preventivo comunica inoltre al cliente queste modalità di conservazione e di accesso (C. civ. 1127-1, 4°).

Il preventivo conservato comprende ciò che attesta il contratto: le vostre righe e i prezzi, l'identità e
l'indirizzo del cliente, la data e la traccia del suo accordo (indirizzo IP), le sue risposte (pezzi
sostituiti, mandato per le spese anticipate) e, se del caso, la sua dichiarazione di recesso.

## Quando un cliente chiede la cancellazione

Il RGPD gli riconosce questo diritto (articolo 17), salvo quando la conservazione è « nécessaire […] pour
respecter une obligation légale » (articolo 17, paragrafo 3, b). In concreto, con « Effacer le client »
(*cancella il cliente*):

- **vengono eliminati**: l'appuntamento, i suoi preventivi non accettati e il relativo registro delle email;
- **resta intatto**: ogni preventivo **accettato**, fino alla fine dei suoi dieci anni; il suo appuntamento è
  conservato, ridotto alla sola data. La finestra di conferma vi indica quali; ditelo al cliente, citando questi
  testi;
- **appuntamento futuro** non annullato: la conferma vi avverte che non potrete più contattare il cliente.
  Annullate prima l'appuntamento se l'intervento non ha più luogo.

La cancellazione è irreversibile. L'informativa sulla privacy del sito informa i clienti di queste durate.

## Ciò che conservate altrove

Crénelio non sostituisce il vostro software di fatturazione né la vostra contabilità: le vostre fatture, i
vostri libri e i giustificativi d'acquisto (spese anticipate) si conservano secondo le regole che vi sono
proprie (vedere [nota e fattura](note-facture.md) e il [promemoria](rappels-artisan.md)).
