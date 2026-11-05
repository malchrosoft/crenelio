# Acquisto-rivendita (*achat-revente*) di forniture (pezzi rivenduti)

*Traduzione della versione francese del 01/11/2026; fa fede la versione francese. I testi ufficiali sono citati in francese.*

*Ultima verifica: 01/11/2026. Fonti: Portail auto-entrepreneur (spese anticipate e spese rifatturate,
riassunto); regole del regime del micro-imprenditore da rileggere sui siti ufficiali (URSSAF, sportello unico)
prima di qualsiasi attivazione. Vedere [fonti](../sources.md).*

## Che cos'è

Il professionista acquista il pezzo **a proprio nome**, poi lo rifattura al cliente (con o senza margine). È una
**vendita di merci**, distinta dalla prestazione di servizi. Da non confondere con le
[spese anticipate per conto del cliente (*débours*)](debours.md), in cui il pezzo è acquistato in nome e per conto del cliente.

## Conseguenze per un imprenditore individuale (micro-impresa)

- L'importo rivenduto **entra nel fatturato** (il Portail auto-entrepreneur sconsiglia questo
  metodo per tale motivo: aumenta i contributi).
- La vendita di merci ha **proprie soglie** di fatturato e una **propria aliquota** di
  contributi; insieme a prestazioni di servizi, l'attività diventa **mista** e i due fatturati sono
  seguiti separatamente (importi in vigore: Item 39, da verificare ogni anno).
- L'attività di vendita deve essere **dichiarata** (sportello unico, *guichet unique*) se non lo è già.
- Il professionista diventa **venditore**: fattura d'acquisto a suo nome, garanzie legali dovute al cliente sul
  pezzo, eventuale magazzino.

## IVA dei pezzi installati (professionista soggetto a IVA)

BOI-TVA-BASE-10-20-40-20, § 140 e 150 ([../fr/textes/bofip.md](../fr/textes/bofip.md)): le **forniture**
(materiali trasformati o consumati) seguono il prezzo del servizio; i **pezzi di ricambio** (oggetti
standardizzati semplicemente installati) sono una **vendita all'aliquota che è loro propria**, salvo se il loro valore è
inferiore a quello dell'installazione o se sono stati adattati. Semplificazione ammessa: pezzi e forniture
seguono il regime della prestazione se il loro valore complessivo **non supera il 50 % del costo totale**; altrimenti la
vendita dei pezzi è indicata **distintamente** in fattura.

In Crénelio (preventivo con IVA): l'editor calcola la quota delle righe « fourniture revendue » (fornitura rivenduta) nel
costo totale al netto (spese anticipate escluse, fuori fatturato) e la ricorda sotto le righe: fino al 50 %, stessa
aliquota della prestazione; oltre, aliquota propria dei pezzi, su righe distinte (cosa che il preventivo fa
già). Un preventivo che comprende una fornitura rivenduta è assimilato a una **vendita** (C. consom. L221-1, II, Code de la consommation (Codice del consumo francese)): il
termine di recesso decorre dalla consegna dei pezzi al cliente (L221-18, 2°), data da inserire nel preventivo
accettato; vedere [retractation-modele.md](retractation-modele.md).

Il controllo dell'IVA è **indicativo**: il confronto si fa in linea di principio pezzo per pezzo, e solo il
professionista sa se un pezzo è stato adattato. L'aliquota resta una sua scelta, da convalidare con il suo commercialista.

## Società

La rivendita deve rientrare nell'**oggetto sociale**; i pezzi sono fatturati con l'IVA della società.

## In Crénelio

- Riga « fourniture revendue » rifiutata dall'API finché `quote_allow_supply` non è attivato.
- Attivazione dietro un **avviso** adattato alla forma giuridica (`legal_form`), da accettare
  esplicitamente; raccomandazione predefinita: le spese anticipate.
