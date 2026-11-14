# Aufbewahrung und Löschung von Kundendaten

*Übersetzung der französischen Fassung vom 14/11/2026; maßgeblich ist die französische Fassung. Amtliche Texte werden auf Französisch zitiert.*

*Letzte Überprüfung: 14/11/2026. Rechtsgrundlage: Code de la consommation (französisches Verbrauchergesetzbuch),
L213-1, D213-1 und D213-2 (Aufbewahrung elektronisch geschlossener Verträge); Code de commerce (französisches
Handelsgesetzbuch), L123-22 (Belege); Verordnung (EU) 2016/679 (DSGVO; frz. RGPD), Artikel 5, 6 und 17. Wortlaut
der Texte: [textes/code-consommation.md](../fr/textes/code-consommation.md),
[textes/code-commerce.md](../fr/textes/code-commerce.md),
[textes/droit-europeen.md](../fr/textes/droit-europeen.md). Hilfeblatt, keine Rechtsberatung.*

## Das Wichtigste

| Daten | Aufbewahrt | Danach |
|---|---|---|
| Termin (Name, E-Mail, Telefon, Adresse, Notizen) | Die eingestellte Dauer (Bildschirm Konto, standardmäßig 36 Monate) nach dem Einsatz | Automatisch **gelöscht** |
| **Nicht angenommener** Kostenvoranschlag (Entwurf, versandt, abgelehnt, abgelaufen, storniert) | Dieselbe Dauer | Automatisch **gelöscht** |
| **Angenommener** Kostenvoranschlag (Vertrag), auch wenn später widerrufen | **Zehn Jahre** nach dem Einsatz (andernfalls nach der Zustimmung), mit dem Nachweis der Zustimmung; nach Abschluss des Einsatzes wird er **archiviert** (Filter « Archivés » (*Archiviert*) im Bildschirm « Devis » (*Kostenvoranschläge*)) | Automatisch **gelöscht**, zusammen mit seinem Termin |

Warum löschen statt „anonymisieren“: Eine Zeile, die mit Datum, Leistung, Betrag und Gemeinde aufbewahrt wird, kann
den Kunden weiterhin bestimmbar machen, etwa durch Abgleich mit einer Rechnung. Den Namen zu entfernen reicht
nicht, um Daten anonym zu machen: Es darf nicht mehr möglich sein, eine Person herauszugreifen, ihre Daten zu
verknüpfen oder Informationen über sie abzuleiten (Artikel-29-Datenschutzgruppe, Stellungnahme 05/2014 zu
Anonymisierungstechniken, S. 9 und 10). Crénelio löscht daher, statt „anonymisierte“ Zeilen aufzubewahren.

*Tragweite dieser Quelle (überprüft am 14/11/2026)*: Die Stellungnahme 05/2014 ist **älter als die DSGVO**
(verabschiedet 2016, anwendbar seit dem 25. Mai 2018) und steht nicht auf der Liste der Dokumente der
Artikel-29-Datenschutzgruppe, die der Europäische Datenschutzausschuss in seiner ersten Sitzung übernommen hat; sie
bleibt jedoch die Referenz, die die CNIL (französische Datenschutzbehörde) in ihrem Leitfaden zu
Aufbewahrungsfristen (Juli 2020) und in ihrem Referenzrahmen zur kaufmännischen Verwaltung (veröffentlicht im
Januar 2022) anführt. Der Ausschuss hat Leitlinien zur Pseudonymisierung zur Konsultation gestellt (01/2025,
endgültige Fassung zu diesem Zeitpunkt nicht bestätigt). Die von Crénelio gewählte Löschung hängt nicht von diesen
Debatten ab: Gelöschte Daten müssen nicht mehr eingeordnet werden.

Während der Aufbewahrung befindet sich ein angenommener Kostenvoranschlag in der **Zwischenarchivierung** im Sinne
der CNIL: Nur die Daten, die den Vertrag belegen, werden aufbewahrt (die Telefonnummer des Kunden wird entfernt);
er verschwindet aus der laufenden Liste der Kostenvoranschläge und wird nur bei Bedarf eingesehen, etwa bei einem
Rechtsstreit oder einer Anfrage des Kunden (CNIL, Leitfaden zu Aufbewahrungsfristen, Juli 2020, und Referenzrahmen
« gestion des activités commerciales »).

## Warum zehn Jahre für einen angenommenen Kostenvoranschlag

- **Online geschlossener Vertrag ab 120 €**: Pflicht. « Le contractant professionnel assure la conservation de
  l'écrit qui le constate » und « en garantit à tout moment l'accès à son cocontractant » (C. consom. L213-1).
  Der Betrag ist auf 120 Euro festgesetzt (D213-1); die Dauer auf zehn Jahre ab Vertragsschluss oder, bei
  späterer Ausführung, ab der Ausführung (D213-2). Ein über seine Online-Seite angenommener Kostenvoranschlag
  fällt darunter.
- **Unter 120 €**: Nach L213-1 schreibt das Gesetz es nicht vor. Crénelio wendet **vorsorglich dieselbe Dauer**
  an: Ein angenommener Kostenvoranschlag ist ein Beleg für Ihre Rechnung, und der Code de commerce bestimmt,
  dass « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22).
  Dieser Text richtet sich zunächst an Kaufleute (*commerçants*): Ihr Steuerberater sagt Ihnen, ob er für Ihre
  Situation gilt.

## Ein festgeschriebener Vertrag und sein Nachweis

Der Kostenvoranschlag wird **festgeschrieben**:

- **beim Versand** werden die Angaben Ihres Unternehmens (Name, rechtliche Identität, Adresse, SIRET,
  Versicherung, Schlichtungsstelle, Beschwerden…) in den Kostenvoranschlag übernommen: Wird er in acht Jahren
  eingesehen, zeigt er die Angaben des versandten Kostenvoranschlags, auch wenn Sie inzwischen Adresse oder
  Schlichtungsstelle gewechselt haben;
- **bei der Annahme** berechnet Crénelio einen **Fingerabdruck** (Hash, SHA-256) von allem, was den Vertrag ausmacht,
  und vom Nachweis der Zustimmung. Auf Anforderung neu berechnet, zeigt er, dass sich seitdem nichts geändert hat:
  Der Editor des Kostenvoranschlags zeigt « Contrat figé : oui, intact » (*Vertrag festgeschrieben: ja,
  unverändert*).

Damit sind die Voraussetzungen des elektronischen Schriftstücks (*écrit électronique*) erfüllt, die « a la même force
probante que l'écrit sur support papier, sous réserve que puisse être dûment identifiée la personne dont il émane
et qu'il soit établi et conservé dans des conditions de nature à en garantir l'intégrité » (C. civ. 1366). Die
Online-Annahme ist eine **einfache elektronische Signatur**: gültig, ihre Zuverlässigkeit wird aber nicht
vermutet, anders als bei einer qualifizierten Signatur (C. civ. 1367; décret n° 2017-1416, art. 1); im Streitfall
müssen Sie die Identifizierung und die Unversehrtheit beweisen, daher diese Festschreibung. Vor dem 14/11/2026
angenommene Kostenvoranschläge sind nicht festgeschrieben.

Jeder Kostenvoranschlag teilt dem Kunden zudem diese Modalitäten der Aufbewahrung und des Zugangs mit
(C. civ. 1127-1, 4°).

Der aufbewahrte Kostenvoranschlag umfasst, was den Vertrag belegt: Ihre Positionen und Preise, Identität und
Adresse des Kunden, Datum und Nachweis seiner Zustimmung (IP-Adresse), seine Antworten (ausgetauschte Teile,
Vollmacht für durchlaufende Posten) und gegebenenfalls seine Widerrufserklärung.

## Wenn ein Kunde die Löschung verlangt

Die DSGVO gibt ihm dieses Recht (Artikel 17), außer wenn die Aufbewahrung « nécessaire […] pour respecter une
obligation légale » ist (Artikel 17 Absatz 3 Buchstabe b). Konkret, mit « Effacer le client » (*Kunden
löschen*):

- **gelöscht werden**: der Termin, seine nicht angenommenen Kostenvoranschläge und das zugehörige E-Mail-Protokoll;
- **unverändert bleibt**: jeder **angenommene** Kostenvoranschlag bis zum Ende seiner zehn Jahre; sein Termin wird
  aufbewahrt, auf das Datum reduziert. Das Bestätigungsfenster zeigt Ihnen, welche; teilen Sie es dem Kunden unter
  Hinweis auf diese Texte mit;
- **bevorstehender Termin**, nicht abgesagt: Die Bestätigung warnt Sie, dass Sie den Kunden nicht mehr
  erreichen können. Sagen Sie zuerst den Termin ab, wenn der Einsatz nicht mehr stattfindet.

Die Löschung ist unumkehrbar. Die Datenschutzerklärung der Website informiert die Kunden über diese Fristen.

## Was Sie anderswo aufbewahren

Crénelio ersetzt weder Ihr Rechnungsprogramm noch Ihre Buchhaltung: Ihre Rechnungen, Ihre Bücher und die
Kaufbelege (durchlaufende Posten) bewahren Sie nach den für Sie geltenden Regeln auf (siehe
[Note und Rechnung](note-facture.md) und die [Merkhilfe](rappels-artisan.md)).
