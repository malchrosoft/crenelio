# An- und Weiterverkauf von Lieferungen (*achat-revente*, weiterverkaufte Teile)

*Übersetzung der französischen Fassung vom 01/11/2026; maßgeblich ist die französische Fassung. Amtliche Texte werden auf Französisch zitiert.*

*Letzte Überprüfung: 01/11/2026. Quellen: Portail auto-entrepreneur (durchlaufende Posten und weiterberechnete Kosten,
Zusammenfassung); Regeln der Kleinstunternehmerregelung (*micro-entrepreneur*) vor jeder Aktivierung auf den amtlichen Seiten (URSSAF, guichet unique)
nachzulesen. Siehe [Quellen](../sources.md).*

## Worum es geht

Der Fachbetrieb kauft das Teil **auf seinen Namen** und berechnet es dem Kunden dann weiter (mit oder ohne Aufschlag). Das ist ein
**Warenverkauf**, getrennt von der Dienstleistung. Nicht zu verwechseln mit dem
[durchlaufenden Posten (*débours*)](debours.md), bei dem das Teil im Namen und für Rechnung des Kunden gekauft wird.

## Folgen für einen Einzelunternehmer (*entrepreneur individuel*, Kleinstunternehmen)

- Der weiterverkaufte Betrag **gehört zum Umsatz** (das Portail auto-entrepreneur rät aus diesem Grund von dieser
  Methode ab: Sie erhöht die Beiträge).
- Der Warenverkauf hat **eigene** Umsatz**schwellen** und einen **eigenen Beitragssatz**;
  zusammen mit Dienstleistungen wird die Tätigkeit **gemischt** und beide Umsätze werden
  getrennt erfasst (geltende Beträge: Item 39, jedes Jahr zu prüfen).
- Die Verkaufstätigkeit muss **angemeldet** werden (*guichet unique*, einheitliche Anlaufstelle), falls sie es noch nicht ist.
- Der Fachbetrieb wird **Verkäufer**: Einkaufsrechnung auf seinen Namen, gesetzliche Gewährleistung gegenüber dem Kunden für das
  Teil, gegebenenfalls Lagerbestand.

## MwSt. auf eingebaute Teile (mehrwertsteuerpflichtiger Fachbetrieb)

BOI-TVA-BASE-10-20-40-20, § 140 und 150 ([textes/bofip.md](../fr/textes/bofip.md)): **Material**
(*fournitures*, verarbeitete oder verbrauchte Stoffe) folgt dem Preis der Dienstleistung; **Ersatzteile** (*pièces détachées*, genormte, lediglich
eingebaute Gegenstände) sind ein **Verkauf zu ihrem eigenen Satz**, außer wenn ihr Wert
unter dem des Einbaus liegt oder sie angepasst wurden. Zulässige Vereinfachung: Teile und Material
folgen der Regelung der Leistung, wenn ihr Gesamtwert **50 % der Gesamtkosten nicht übersteigt**; andernfalls wird der
Verkauf der Teile auf der Rechnung **gesondert** ausgewiesen.

In Crénelio (Kostenvoranschlag mit MwSt.): Der Editor berechnet den Anteil der Zeilen „fourniture revendue“ (weiterverkaufte Lieferung) an den
Nettogesamtkosten (ohne durchlaufende Posten, außerhalb des Umsatzes) und zeigt ihn unter den Zeilen an: bis 50 % derselbe
Satz wie die Leistung; darüber der eigene Satz der Teile, in gesonderten Zeilen (was der
Kostenvoranschlag bereits tut). Ein Kostenvoranschlag (*devis*) mit einer weiterverkauften Lieferung wird einem **Kauf** gleichgestellt (C. consom. (Code de la consommation, französisches Verbrauchergesetzbuch) L221-1, II): Die
Widerrufsfrist läuft ab Übergabe der Teile an den Kunden (L221-18, 2°), Datum im angenommenen
Kostenvoranschlag zu erfassen; siehe [retractation-modele.md](retractation-modele.md).

Die MwSt.-Prüfung ist **unverbindlich**: Der Vergleich erfolgt grundsätzlich Teil für Teil, und nur der
Unternehmer weiß, ob ein Teil angepasst wurde. Der Satz bleibt seine Wahl, mit seinem Buchhalter abzustimmen.

## Gesellschaft

Der Weiterverkauf muss vom **Unternehmensgegenstand** (*objet social*) gedeckt sein; die Teile werden mit der MwSt. der Gesellschaft berechnet.

## In Crénelio

- Die Zeile „fourniture revendue“ wird von der API abgelehnt, solange `quote_allow_supply` nicht aktiviert ist.
- Aktivierung hinter einem an die Rechtsform (`legal_form`) angepassten **Warnhinweis**, der
  ausdrücklich zu akzeptieren ist; Standardempfehlung: der durchlaufende Posten.
