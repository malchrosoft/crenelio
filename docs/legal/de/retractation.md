# Widerruf: Fernabsatzvertrag oder Vertrag in der Wohnung des Kunden

*Übersetzung der französischen Fassung vom 04/11/2026; maßgeblich ist die französische Fassung. Amtliche Texte werden auf Französisch zitiert.*

*Letzte Überprüfung: 04/11/2026 (amtliche Texte: [textes/code-consommation.md](../fr/textes/code-consommation.md)). Quellen: Merkblatt der DGCCRF „Dépannage à domicile“ (amtlich); INC;
Sekundärquellen zu L221-25. Artikel des Code de la consommation (französisches Verbrauchergesetzbuch) in ihrer konsolidierten
Fassung nachzulesen (siehe [Quellen](../sources.md)).*

## Grundsatz

Ein **online** angenommener (Fernabsatzvertrag) oder **in der Wohnung** des Kunden unterschriebener Kostenvoranschlag (*devis*) (Vertrag außerhalb von
Geschäftsräumen, *contrat hors établissement*) eröffnet dem privaten Kunden eine **Widerrufsfrist (*délai de rétractation*) von 14 Tagen** (C. consom.
L221-18). Der Unternehmer muss ihn vor Vertragsschluss darüber informieren und übergeben:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Erläuterung (keine amtliche Übersetzung):* eine von den Parteien unterschriebene Papierausfertigung des Vertrags oder, mit Zustimmung des Verbrauchers, auf einem dauerhaften Datenträger; beizufügen ist das Muster-Widerrufsformular, und der Vertrag muss bei Nichtigkeit die Informationen der Artikel L. 111-1 und L. 111-2 enthalten.

Fehlt die Information über den Widerruf, verlängert sich die Frist um zwölf Monate (L221-20, bestätigt).

## Ausnahme: der Notfall

Kein Widerruf bei « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (dringende, vom Verbraucher ausdrücklich angeforderte Wartungs- oder Reparaturarbeiten in seiner Wohnung; L221-28, 8°, zitiert vom INC), **im Rahmen der
Ersatzteile und Arbeiten, die zur Behebung der Notsituation unbedingt notwendig sind** (Merkblatt der
DGCCRF). Als Notfall gilt « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (die Notwendigkeit, eine Gefahr für die Sicherheit von Personen oder die Unversehrtheit der Räume zu beenden).

Jede vor Ort angebotene **zusätzliche** Arbeit bleibt der Frist von 14 Tagen unterworfen.

## Vor Fristende beginnen

Nach L221-25 (amtlicher Text oben): Der Unternehmer darf vor Fristende nur auf
**ausdrückliches Verlangen** des Kunden beginnen; widerruft der Kunde anschließend, schuldet er einen Betrag, der
der bereits erbrachten Leistung entspricht. Ohne eingeholtes ausdrückliches Verlangen ist nichts geschuldet.

## Was die amtlichen Texte sagen (überprüft am 04/11/2026)

Volltext: [textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Begriffe** (L221-1): **Fernabsatzvertrag** (*contrat à distance*) = ohne gleichzeitige körperliche Anwesenheit geschlossen, unter
  ausschließlicher Verwendung von Fernkommunikationsmitteln bis zum Vertragsschluss; Vertrag **außerhalb von
  Geschäftsräumen** = bei gleichzeitiger körperlicher Anwesenheit außerhalb des üblichen Geschäftsorts geschlossen, **auch auf
  Anfrage des Verbrauchers** (in der Wohnung des Kunden unterschriebener Kostenvoranschlag), oder im Fernabsatz
  unmittelbar nach einer persönlichen Ansprache außerhalb dieses Orts. Ein Vertrag, der das Eigentum an einer Sache überträgt **und**
  eine Dienstleistung umfasst, wird **einem Kaufvertrag gleichgestellt** (II): zu beachten bei
  den Zeilen „fourniture revendue“ (weiterverkaufte Lieferung; Frist ab Erhalt der Sache).
- **Frist** (L221-18): vierzehn Tage ab **Vertragsschluss** bei einer Dienstleistung.
  **Berechnung** (L221-19): Der Tag des Vertragsschlusses wird nicht mitgezählt; die Frist endet mit Ablauf des
  letzten Tages; fällt dieser auf einen Samstag, Sonntag oder gesetzlichen Feiertag oder arbeitsfreien Tag, verlängert sie sich bis zum
  nächsten Werktag. → `Quote::withdrawalDeadline` (gesetzliche Feiertage, Ostern berechnet).
- **Fehlende Information** (L221-20): Frist um zwölf Monate verlängert; auf vierzehn Tage ab
  Erhalt der Information verkürzt, wenn diese zwischenzeitlich erteilt wird.
- **Vorzeitige Ausführung** (L221-25): ausdrückliches Verlangen « par tout moyen » (auf jede Weise) im Fernabsatz eingeholt, « sur
  papier ou sur support durable » (auf Papier oder dauerhaftem Datenträger) außerhalb von Geschäftsräumen; der Unternehmer **fordert den Verbraucher auf
  anzuerkennen**, dass er nach vollständiger Ausführung kein Widerrufsrecht mehr hat. Ohne eingeholtes
  ausdrückliches Verlangen oder ohne die Information nach Nr. 9° von L221-5 **ist kein Betrag geschuldet**.
  → Text des Kästchens ergänzt (Seite, Druckversion, Bestätigungs-E-Mail).
- **Ausnahmen** (L221-28): 1° Dienstleistung vor Fristende vollständig erbracht, mit ausdrücklicher Zustimmung und
  Anerkennung des Rechtsverlusts → `Quote::canWithdraw` lehnt den Widerruf ab, wenn der Termin
  des Kostenvoranschlags „terminé“ (abgeschlossen) ist und die vorzeitige Ausführung verlangt worden war; 8° dringende,
  ausdrücklich angeforderte Arbeiten im Rahmen des unbedingt Notwendigen.
- **Information** (L221-5, 7° und 10°): Bedingungen, Frist, Modalitäten, Musterformular und Ort der
  Widerrufsfunktion; besteht das Recht nicht (Notfall), die Information, dass der Verbraucher es nicht
  hat.
- **Außerhalb von Geschäftsräumen** (L221-9): datierte Ausfertigung des Vertrags, unterschriebenes Papier oder dauerhafter Datenträger, mit
  allen Informationen nach L221-5 und **mit beigefügtem Musterformular**. (L221-10): **keine Zahlung und keine
  Gegenleistung vor Ablauf von sieben Tagen** ab Vertragsschluss, außer bei dringenden Arbeiten (4°).
- **Online-Funktion** (D221-5, geschaffen durch Dekret (*décret*) Nr. 2026-3): Beschriftungen « renoncer au contrat ici » und
  « confirmer la rétractation », Erklärung (Name und Vorname, Vertrag, elektronisches Mittel für die Bestätigung),
  Empfangsbestätigung mit Inhalt, Datum und Uhrzeit. Entspricht der Umsetzung.
- **Musterformular** (Anhang zu Artikel R221-1, Dekret Nr. 2022-424): wörtlich in der
  Druckversion wiedergegeben.

## Ausübung des Rechts: Artikel L221-21 (Fassung vom 19. Juni 2026)

*Amtlicher Text, Fassung aus der Verordnung (*ordonnance*) Nr. 2026-2 vom 5. Januar 2026 (Art. 26: in Kraft am
19. Juni 2026; zu diesem Zeitpunkt laufende Verträge unterliegen den früheren Texten). Wiedergegeben am 02/11/2026 auf
Grundlage des vom Betreuer gelieferten Textes.*

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

*Erläuterung (keine amtliche Übersetzung):* Der Verbraucher widerruft, indem er vor Fristablauf das Formular oder eine eindeutige Erklärung sendet. Der Unternehmer kann die Online-Übermittlung ermöglichen und bestätigt dann unverzüglich den Empfang auf einem dauerhaften Datenträger. Bei Verträgen über eine Online-Schnittstelle muss er eine kostenlose Widerrufsfunktion bereitstellen; ein Dekret regelt deren leichten, direkten und ständigen Zugang.

**Entsprechung in Crénelio**

| Anforderung von L221-21 | Umsetzung |
|---|---|
| Formular oder jede eindeutige Erklärung | Druckbares Widerrufsformular; E-Mail und Anschrift des Unternehmens stehen im Informationsmuster |
| Versand vor Fristablauf | Online-Widerruf bis einschließlich `withdrawal_until` angenommen; das Datum der Erklärung wird gespeichert |
| Unverzügliche Empfangsbestätigung auf dauerhaftem Datenträger | E-Mail sofort nach der Bestätigung (`QuoteNotifier::sendWithdrawal`), protokolliert |
| Kostenlose Funktion für einen über eine Online-Schnittstelle geschlossenen Vertrag | Schaltfläche „Renoncer au contrat ici“ (Hier vom Vertrag zurücktreten) auf der Seite des Kostenvoranschlags, ohne Konto und kostenlos |
| Leichter, direkter und ständiger Zugang (Dekret) | Derselbe Link wie für die Annahme (E-Mail), Schaltfläche während der gesamten Frist sichtbar |

## Online-Widerrufsfunktion (seit 19. Juni 2026)

Die Verordnung Nr. 2026-2 und das Dekret Nr. 2026-3 vom 5. Januar 2026 (Umsetzung der Richtlinie (EU)
2023/2673) schreiben für jeden **über eine Online-Schnittstelle** geschlossenen Fernabsatzvertrag eine kostenlose
Widerrufsfunktion vor (**bestätigt durch Artikel D221-5**, Text in [textes/code-consommation.md](../fr/textes/code-consommation.md)):

- gekennzeichnet mit den Worten « **renoncer au contrat ici** » oder einer gleichwertigen, eindeutigen Formulierung;
- sichtbar, direkt und leicht zugänglich **während der gesamten** Widerrufsfrist;
- der Verbraucher gibt dort seinen **Namen und Vornamen**, den betroffenen **Vertrag** und das **elektronische
  Mittel** zum Empfang der Bestätigung an oder bestätigt sie und schließt mit « **confirmer la rétractation** » ab;
- **Empfangsbestätigung** auf dauerhaftem Datenträger, innerhalb angemessener Frist, mit dem Inhalt der
  Erklärung sowie **Datum und Uhrzeit** ihrer Absendung;
- die vorvertragliche Information gibt an, wo sich diese Funktion befindet;
- Sanktion: Verwaltungsgeldbuße bis 15 000 € (natürliche Person) oder 75 000 € (juristische Person).

Das Informationsmuster (Anhang zu Artikel R221-3) wurde entsprechend geändert (Fassung in Kraft am
19. Juni 2026): amtlicher Text und Umsetzungsentscheidungen in [retractation-modele.md](retractation-modele.md).

## In Crénelio

- Kästchen „intervention urgente“ (dringender Einsatz) auf dem Kostenvoranschlag: weder Frist noch Widerrufsfunktion.
- Andernfalls bestätigt der Kunde zur Annahme, sein Recht zur Kenntnis genommen zu haben; er kann
  die vorzeitige Ausführung verlangen (eigenes Kästchen); das Fristende wird gespeichert (`withdrawal_until`).
- Seite des Kostenvoranschlags (`/devis/:token`): Information über die Frist und den Ort der Funktion vor
  der Annahme; nach der Annahme Schaltfläche „Renoncer au contrat ici“ (Hier vom Vertrag zurücktreten), Erklärung (Name, E-Mail für die Bestätigung,
  genannter Vertrag), Schaltfläche „Confirmer la rétractation“ (Widerruf bestätigen); Status `withdrawn`, Erklärung gespeichert
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Empfangsbestätigung per E-Mail an den Kunden (Inhalt, Datum und Uhrzeit) und Mitteilung an den Fachbetrieb (Rückerstattung
  innerhalb von 14 Tagen); die Annahme-E-Mail nennt das Fristende und den Ort der Funktion.
- Zeitstempel: Die MySQL-Verbindung ist an die Zeitzone der Anwendung angeglichen.
- Seite des Kostenvoranschlags: amtliches Informationsmuster wörtlich angezeigt (`src/utils/withdrawalNotice.ts`).
- **Vorausgefülltes Online-Formular** (`/devis/:token/retractation`): Muster aus Anhang R221-1 wörtlich,
  übermittelt über die Widerrufsfunktion; **ausfüllbares PDF** im Anhang der Annahme-E-Mail;
  bestätigte Erklärung als PDF herunterladbar und den Bestätigungen beigefügt. Der Kunde wird über diese
  Möglichkeit informiert (Text `ONLINE_FORM_NOTICE`, außerhalb des amtlichen Musters).
- **Vertragsausfertigung** (L221-9): Die nach seiner Annahme an den Kunden gesendete E-Mail enthält alle
  Vertragsinformationen, das Informationsmuster und das Musterformular (`LegalTexts.php`).
- Druckversionen (`/devis/:token/imprimer`): Informationsmuster im Kostenvoranschlag; Musterformular
  aus dem Anhang zu Artikel R221-1, **wörtlich** (bestätigt am 04/11/2026).
