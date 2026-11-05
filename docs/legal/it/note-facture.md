# Nota (fattura) di prestazione (*note*)

*Traduzione della versione francese del 01/11/2026; fa fede la versione francese. I testi ufficiali sono citati in francese.*

*Ultima verifica: 01/11/2026. Fonte: scheda DGCCRF (autorità francese per la concorrenza, il consumo e la repressione delle frodi) « Dépannage à domicile » (arrêté n° 83-50/A du
3 octobre 1983 modifié, decreto ministeriale del 3 ottobre 1983 modificato), vedere [fonti](../sources.md).*

> « Pour toute prestation d'un montant supérieur à 25 euros TTC, le professionnel est tenu de vous
> remettre un document sur lequel apparaissent :
> - les coordonnées du prestataire ;
> - la date de rédaction de la note ;
> - les dates et lieu d'exécution de la prestation ;
> - le décompte détaillé, en quantité et en prix, de chaque prestation et produit fourni ou vendu
>   (ex : taux horaire et nombre d'heures travaillées) ;
> - la somme totale à payer hors taxes et toutes taxes comprises ;
> - le nom du client, sauf opposition de celui-ci.
>
> La note doit être délivrée dès que la prestation a été rendue, et en tout état de cause avant le
> règlement du prix de la prestation. »

*Spiegazione (non è una traduzione ufficiale):* per ogni prestazione superiore a 25 euro IVA inclusa, il professionista consegna un documento con: dati del prestatore; data di redazione della nota; date e luogo di esecuzione; conteggio dettagliato, in quantità e prezzo, di ogni prestazione e prodotto fornito o venduto (es.: tariffa oraria e numero di ore lavorate); importo totale al netto e IVA inclusa; nome del cliente, salvo sua opposizione. La nota va consegnata appena la prestazione è resa, e comunque prima del pagamento.

Al di sotto di 25 € IVA inclusa, la nota è consegnata su richiesta del cliente.

## Testo ufficiale (verificato il 04/11/2026)

Decreto n. 83-50/A del 3 ottobre 1983, art. da 1 a 4, e decreto del 24 gennaio 2017, art. 5:
[../fr/textes/arretes.md](../fr/textes/arretes.md). Precisazioni rispetto alla scheda DGCCRF:

- la nota è obbligatoria quando il prezzo è **superiore o uguale a 25 € IVA inclusa** (e non « au-delà », oltre); al di
  sotto, su richiesta del cliente; per le riparazioni a domicilio, su richiesta **qualunque sia l'importo**,
  consegnata **gratuitamente su un supporto durevole**;
- il **conteggio dettagliato** diventa facoltativo se la prestazione è stata oggetto di un preventivo descrittivo e
  dettagliato, accettato e conforme ai lavori eseguiti;
- la nota è redatta **in duplice copia**: l'originale al cliente, la copia conservata **due anni** dal
  prestatore, archiviata per data.

## Menzioni fiscali della fattura (verificato il 04/11/2026)

CGI (Code général des impôts, Codice generale delle imposte francese), allegato II, art. 242 nonies A ([../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
versione del decreto n. 2024-1195. Per un professionista:

- nome completo, **numero di identificazione** (SIREN) e indirizzo **del professionista e del suo cliente** (1°);
- data di emissione (6°) e **numero unico, cronologico e continuo** (7°);
- per ogni prestazione: quantità, denominazione precisa, **prezzo unitario al netto delle imposte** e aliquota IVA o
  esenzione (8°); **natura delle operazioni**: esclusivamente prestazioni di servizi, esclusivamente
  cessioni di beni, o entrambe (8° bis);
- data della prestazione se diversa dalla data di emissione (10°); totale al netto e IVA per aliquota
  (11°); ribassi e sconti (9°);
- in franchigia di base (*franchise en base*), le menzioni 2° (partita IVA) e 12° (riferimento dell'esenzione) possono essere
  omesse (II), ma la dicitura « TVA non applicable, article 293 B du CGI » (IVA non applicabile, articolo 293 B del CGI) resta imposta dall'articolo
  293 E del CGI.

Le menzioni 1° (numero del cliente), 7° bis e 8° bis si applicano alle fatture emesse a partire dal
1° settembre 2026, e dal **1° settembre 2027** per le micro-imprese e le PMI (calendario della
fatturazione elettronica, NOTA dell'articolo). Il numero cronologico e continuo è gestito dal software
di fatturazione del professionista.

## In Crénelio

La fattura è emessa nello strumento del professionista (Item 22, parte B); Crénelio non la emette.

- Scheda **« Préparer la facture »** (Preparare la fattura; appuntamento concluso): cliente, indirizzo, data e luogo della prestazione,
  riferimento del preventivo accettato, righe dettagliate (quantità, prezzo, IVA), totali e dicitura di franchigia,
  ciascuno da copiare; **spese anticipate per conto del cliente** (*débours*) su una riga distinta, per l'**importo esatto del giustificativo** inserito dal
  professionista con il suo riferimento, e avviso se il budget del mandato è superato.
- **Esportazioni CSV**: clienti (importazione iniziale) e interventi conclusi di un periodo, spese anticipate a parte.
- Scheda: natura delle operazioni (8° bis) da copiare, promemoria delle menzioni del 1° e del 7°.
- Le menzioni fiscali della fattura (numerazione continua, menzioni IVA, fatturazione elettronica)
  sono di competenza del software del professionista.
