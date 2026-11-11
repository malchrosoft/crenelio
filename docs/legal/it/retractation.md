# Recesso: contratto a distanza o al domicilio del cliente

*Traduzione della versione francese del 04/11/2026; fa fede la versione francese. I testi ufficiali sono citati in francese.*

*Ultima verifica: 04/11/2026 (testi ufficiali: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)). Fonti: scheda DGCCRF « Dépannage à domicile » (ufficiale); INC (Institut national de la consommation);
fonti secondarie su L221-25. Articoli del Code de la consommation (Codice del consumo francese) da rileggere nella loro versione
consolidata (vedere [fonti](../sources.md)).*

## Principio

Un preventivo accettato **online** (contratto a distanza) o **firmato al domicilio** del cliente (contratto fuori dei locali
commerciali, *hors établissement*) apre al cliente privato un **termine di recesso (*délai de rétractation*) di 14 giorni** (C. consom.
L221-18). Il professionista deve informarlo prima della conclusione e consegnare:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Spiegazione (non è una traduzione ufficiale):* una copia del contratto, su carta firmata dalle parti o, con l'accordo del consumatore, su supporto durevole, accompagnata dal modulo tipo di recesso e contenente, a pena di nullità, le informazioni degli articoli L111-1 e L111-2.

Se manca l'informazione sul recesso, il termine è prorogato di dodici mesi (L221-20, confermato).

## Eccezione: l'urgenza

Nessun recesso per i « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (L221-28, 8°, citato dall'INC), **nel limite dei
pezzi di ricambio e dei lavori strettamente necessari per rispondere alla situazione di urgenza** (scheda
DGCCRF). L'urgenza si intende come « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux ».

*Spiegazione (non è una traduzione ufficiale):* lavori di manutenzione o riparazione da eseguire d'urgenza al domicilio del consumatore e da lui espressamente richiesti; urgenza = necessità di far cessare un pericolo per la sicurezza delle persone o l'integrità dei locali.

Ogni lavoro **supplementare** proposto sul posto resta soggetto al termine di 14 giorni.

## Iniziare prima della fine del termine

Secondo L221-25 (testo ufficiale sopra citato): il professionista può iniziare prima della fine del termine solo
su **richiesta espressa** del cliente; se il cliente poi recede, deve un importo proporzionale
al servizio già fornito. Senza richiesta espressa raccolta, nulla è dovuto.

## Che cosa dicono i testi ufficiali (verificato il 04/11/2026)

Testo integrale: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definizioni** (L221-1): contratto **a distanza** = concluso senza la presenza fisica simultanea delle parti, con il
  ricorso esclusivo a tecniche di comunicazione a distanza fino alla conclusione; contratto **fuori dei locali
  commerciali** = concluso in presenza fisica simultanea fuori dal luogo abituale di attività, **anche a
  seguito di una sollecitazione del consumatore** (preventivo firmato al domicilio del cliente), oppure a distanza
  subito dopo una sollecitazione personale fatta fuori da tale luogo. Un contratto che trasferisce la
  proprietà di un bene **e** fornisce una prestazione è **assimilato a una vendita** (II): da sorvegliare per
  le righe « fourniture revendue » (fornitura rivenduta; termine a decorrere dalla ricezione del bene).
- **Termine** (L221-18): quattordici giorni a decorrere **dalla conclusione del contratto** per una prestazione di
  servizi. **Calcolo** (L221-19): il giorno della conclusione non si conta; il termine scade alla fine
  dell'ultimo giorno; se cade di sabato, domenica o in un giorno festivo o non lavorativo, è prorogato fino al
  primo giorno lavorativo successivo. → `Quote::withdrawalDeadline` (festività legali, Pasqua calcolata).
- **Informazione mancante** (L221-20): termine prorogato di dodici mesi; ridotto a quattordici giorni a decorrere
  dalla ricezione dell'informazione se questa viene fornita nel frattempo.
- **Esecuzione anticipata** (L221-25): richiesta espressa raccolta « par tout moyen » (con qualsiasi mezzo) a distanza, « sur
  papier ou sur support durable » (su carta o su supporto durevole) fuori dei locali commerciali; il professionista **chiede al consumatore di
  riconoscere** che, dopo l'esecuzione completa, non disporrà più del diritto di recesso. Senza richiesta
  espressa raccolta, o senza l'informazione del 9° di L221-5, **nessuna somma è dovuta**.
  → testo della casella completato (pagina, versione stampabile, email di accettazione).
- **Eccezioni** (L221-28): 1° servizio pienamente eseguito prima della fine del termine, con accordo espresso e
  riconoscimento della perdita del diritto → `Quote::canWithdraw` rifiuta il recesso quando l'appuntamento
  del preventivo è « terminé » (concluso) e l'esecuzione anticipata era stata richiesta; 8° lavori urgenti
  espressamente richiesti, nel limite dello stretto necessario.
- **Informazione** (L221-5, 7° e 10°): condizioni, termine, modalità, modulo tipo e posizione della
  funzione di recesso; se il diritto non esiste (urgenza), l'informazione che il consumatore non ne
  beneficia.
- **Fuori dei locali commerciali** (L221-9): copia datata del contratto, su carta firmata o supporto durevole, con
  tutte le informazioni di L221-5 e **accompagnata dal modulo tipo**. (L221-10): **nessun pagamento né
  corrispettivo prima di sette giorni** dalla conclusione, salvo lavori urgenti (4°).
- **Funzione online** (D221-5, creato dal decreto n. 2026-3): diciture « renoncer au contrat ici » e
  « confirmer la rétractation », dichiarazione (nome e cognome, contratto, mezzo elettronico per la ricevuta),
  ricevuta che riprende il contenuto, la data e l'ora. Conforme all'implementazione.
- **Modulo tipo** (allegato all'articolo R221-1, decreto n. 2022-424): riprodotto parola per parola nella
  versione stampabile.

## Esercizio del diritto: articolo L221-21 (versione del 19 giugno 2026)

*Testo ufficiale, redazione derivante dall'ordinanza (*ordonnance*) n. 2026-2 del 5 gennaio 2026 (art. 26: in vigore il
19 giugno 2026; i contratti in corso a tale data sono disciplinati dai testi precedenti). Riprodotto il 02/11/2026 a
partire dal testo fornito dal manutentore.*

> Le consommateur exerce son droit de rétractation en informant le professionnel de sa décision de se
> rétracter par l'envoi, avant l'expiration du délai prévu à l'article L. 221-18, du formulaire de
> rétractation mentionné au 7° de l'article L. 221-5 ou de toute autre déclaration, dénuée d'ambiguïté,
> exprimant sa volonté de se rétracter.
>
> Le professionnel peut également permettre au consommateur de remplir et de transmettre en ligne, sur
> son site internet, le formulaire ou la déclaration prévus au premier alinéa. Dans cette hypothèse, le
> professionnel communique, sans délai, au consommateur un accusé de réception de la rétractation sur un
> support durable.
>
> Pour les contrats conclus à distance au moyen d'une interface en ligne, le professionnel met à la
> disposition du consommateur, sans frais pour ce dernier, une fonctionnalité lui permettant d'exercer
> gratuitement son droit de rétractation avant l'expiration du délai prévu à l'article L. 221-18.
>
> Un décret fixe les modalités de présentation et d'utilisation de cette fonctionnalité, de nature à
> garantir un accès facile, direct et permanent du consommateur à celle-ci.

*Spiegazione (non è una traduzione ufficiale):* il consumatore recede inviando, prima della scadenza del termine, il modulo di recesso o qualsiasi altra dichiarazione inequivocabile. Il professionista può permettergli di compilarlo e trasmetterlo online sul proprio sito; in tal caso invia senza ritardo una ricevuta su supporto durevole. Per i contratti conclusi a distanza tramite un'interfaccia online, il professionista mette a disposizione gratuitamente una funzione di recesso utilizzabile fino alla scadenza del termine. Un decreto ne fissa la presentazione e l'uso (accesso facile, diretto e permanente).

**Corrispondenza in Crénelio**

| Requisito di L221-21 | Attuazione |
|---|---|
| Modulo o qualsiasi dichiarazione inequivocabile | Modulo di recesso stampabile; l'email e l'indirizzo dell'impresa figurano nel modello di informazione |
| Invio prima della scadenza del termine | Recesso online accettato fino a `withdrawal_until` incluso; la data della dichiarazione è registrata |
| Ricevuta senza ritardo, su supporto durevole | Email inviata subito dopo la conferma (`QuoteNotifier::sendWithdrawal`), registrata nel giornale |
| Funzione gratuita per un contratto concluso tramite interfaccia online | Pulsante « Renoncer au contrat ici » (Recedere dal contratto qui) sulla pagina del preventivo, senza account né spese |
| Accesso facile, diretto e permanente (decreto) | Stesso link dell'accettazione (email), pulsante visibile per tutto il termine |

## Funzione di recesso online (dal 19 giugno 2026)

L'ordinanza n. 2026-2 e il decreto n. 2026-3 del 5 gennaio 2026 (recepimento della direttiva (UE)
2023/2673) impongono, per ogni contratto a distanza concluso **tramite un'interfaccia online**, una funzione di
recesso gratuita (**confermato dall'articolo D221-5**, testo in [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)):

- identificata dalle parole « **renoncer au contrat ici** » o da una formula analoga inequivocabile;
- visibile, direttamente e facilmente accessibile **per tutto il termine** di recesso;
- il consumatore vi indica o conferma **nome e cognome**, il **contratto** interessato e il **mezzo
  elettronico** per ricevere la ricevuta, poi convalida con « **confirmer la rétractation** »;
- **ricevuta** su supporto durevole, entro un termine ragionevole, che riprende il contenuto della
  dichiarazione e la **data e l'ora** del suo invio;
- l'informazione precontrattuale indica dove si trova questa funzione;
- sanzione: ammenda amministrativa fino a 15 000 € (persona fisica) o 75 000 € (persona giuridica).

Il modello di informazione (allegato all'articolo R221-3) è stato modificato di conseguenza (versione in vigore al
19 giugno 2026): testo ufficiale e scelte di applicazione in [retractation-modele.md](retractation-modele.md).

## In Crénelio

- Casella « intervention urgente » (intervento urgente) sul preventivo: né termine né funzione di recesso.
- Altrimenti, per accettare, il cliente conferma di aver preso conoscenza del proprio diritto; può chiedere
  l'esecuzione anticipata (casella distinta); la fine del termine è registrata (`withdrawal_until`).
- Pagina del preventivo (`/devis/:token`): informazione sul termine e sulla posizione della funzione prima
  dell'accettazione; dopo l'accettazione, pulsante « Renoncer au contrat ici » (Recedere dal contratto qui), dichiarazione (nome, email per la ricevuta,
  contratto richiamato), pulsante « Confirmer la rétractation » (Confermare il recesso); stato `withdrawn`, dichiarazione conservata
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Ricevuta via email al cliente (contenuto, data e ora) e avviso al professionista (rimborso
  entro 14 giorni); l'email di accettazione ricorda la data limite e la posizione della funzione.
- Marcature temporali: la connessione MySQL è allineata al fuso orario dell'applicazione.
- Pagina del preventivo: modello di informazione regolamentare visualizzato parola per parola (`src/utils/withdrawalNotice.ts`).
- **Modulo online precompilato** (`/devis/:token/retractation`): modello dell'allegato R221-1 parola per
  parola, trasmesso tramite la funzione di recesso; **PDF compilabile** allegato all'email di accettazione;
  dichiarazione convalidata scaricabile in PDF e allegata alle ricevute. Il cliente è informato di questa
  possibilità (testo `ONLINE_FORM_NOTICE`, al di fuori del modello regolamentare).
- **Prima del contratto** (L221-5, 7°, 10/11/2026): il modulo tipo (PDF compilabile, senza data di accettazione né link online, poiché la funzione online è utilizzabile solo dopo l'accettazione) è allegato all'email di invio del preventivo, salvo urgenza; resta anche nella versione stampabile.
- **Copia del contratto** (L221-9): l'email inviata al cliente dopo la sua accettazione riprende tutte le
  informazioni del contratto, il modello di informazione e il modulo tipo (`LegalTexts.php`).
- Versioni stampabili (`/devis/:token/imprimer`): modello di informazione nel preventivo; modulo tipo
  dell'allegato all'articolo R221-1, **parola per parola** (confermato il 04/11/2026).
