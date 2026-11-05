# Rechnung (*note*) über die Leistung

*Übersetzung der französischen Fassung vom 01/11/2026; maßgeblich ist die französische Fassung. Amtliche Texte werden auf Französisch zitiert.*

*Letzte Überprüfung: 01/11/2026. Quelle: Merkblatt der DGCCRF „Dépannage à domicile“ (Erlass (*arrêté*) Nr. 83-50/A vom
3. Oktober 1983 in geänderter Fassung), siehe [Quellen](../sources.md).*

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

*Erläuterung (keine amtliche Übersetzung):* Für jede Leistung über 25 € inkl. MwSt. muss der Unternehmer ein Dokument übergeben mit seinen Angaben, dem Ausstellungsdatum, Datum und Ort der Leistung, der detaillierten Aufstellung nach Menge und Preis jeder Leistung und jedes Produkts (z. B. Stundensatz und Stundenzahl), dem Gesamtbetrag netto und brutto sowie dem Namen des Kunden, sofern dieser nicht widerspricht. Die Rechnung ist nach Erbringung der Leistung, jedenfalls vor der Bezahlung, auszuhändigen.

Unter 25 € inkl. MwSt. wird die Rechnung auf Verlangen des Kunden übergeben.

## Amtlicher Text (überprüft am 04/11/2026)

Erlass Nr. 83-50/A vom 3. Oktober 1983, Art. 1 bis 4, und Erlass vom 24. Januar 2017, Art. 5:
[textes/arretes.md](../fr/textes/arretes.md). Einzelheiten gegenüber dem Merkblatt der DGCCRF:

- die Rechnung ist Pflicht, wenn der Preis **25 € inkl. MwSt. oder mehr** beträgt (und nicht „darüber“); darunter
  auf Verlangen des Kunden; bei Reparaturen im Haushalt auf Verlangen **unabhängig vom Betrag**,
  **kostenlos auf einem dauerhaften Datenträger** übergeben;
- die **detaillierte Aufstellung** wird freiwillig, wenn für die Leistung ein beschreibender und
  detaillierter Kostenvoranschlag (*devis*) vorlag, der angenommen wurde und den ausgeführten Arbeiten entspricht;
- die Rechnung wird **in doppelter Ausfertigung** erstellt: das Original für den Kunden, die Zweitschrift bewahrt der
  Dienstleister **zwei Jahre** auf, nach Datum geordnet.

## Steuerliche Pflichtangaben der Rechnung (überprüft am 04/11/2026)

CGI (Code général des impôts, französisches Steuergesetzbuch), annexe II, art. 242 nonies A ([textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
Fassung des Dekrets Nr. 2024-1195. Für einen Fachbetrieb:

- vollständiger Name, **Identifikationsnummer** (SIREN) und Anschrift **des Unternehmers und seines Kunden** (1°);
- Ausstellungsdatum (6°) und **eindeutige, chronologische und fortlaufende Nummer** (7°);
- für jede Leistung: Menge, genaue Bezeichnung, **Nettoeinzelpreis** und MwSt.-Satz oder
  Befreiung (8°); **Art der Umsätze**: ausschließlich Dienstleistungen, ausschließlich
  Warenlieferungen oder beides (8° bis);
- Datum der Leistung, wenn es vom Ausstellungsdatum abweicht (10°); Nettosumme und MwSt. je Satz
  (11°); Rabatte und Nachlässe (9°);
- bei der Kleinunternehmerregelung (*franchise en base*) können die Angaben 2° (USt-IdNr.) und 12° (Verweis auf die Befreiung)
  entfallen (II), aber die Angabe « TVA non applicable, article 293 B du CGI » bleibt nach Artikel
  293 E des CGI vorgeschrieben.

Die Angaben 1° (Nummer des Kunden), 7° bis und 8° bis gelten für Rechnungen, die ab dem
1. September 2026 ausgestellt werden, und ab dem **1. September 2027** für Kleinstunternehmen und KMU (Zeitplan der
elektronischen Rechnungsstellung, NOTA des Artikels). Die chronologische und fortlaufende Nummer verwaltet die Rechnungssoftware
des Fachbetriebs.

## In Crénelio

Die Rechnung wird im Werkzeug des Fachbetriebs erstellt (Item 22, Teil B); Crénelio stellt sie nicht aus.

- Blatt **„Préparer la facture“** (Rechnung vorbereiten; abgeschlossener Termin): Kunde, Anschrift, Datum und Ort der Leistung,
  Referenz des angenommenen Kostenvoranschlags, detaillierte Zeilen (Menge, Preis, MwSt.), Summen und Hinweis auf die Kleinunternehmerregelung,
  jeweils zum Kopieren; **durchlaufende Posten** (*débours*) in einer eigenen Zeile, mit dem **genauen Betrag des Belegs**, vom
  Fachbetrieb mit dessen Referenz erfasst, und Warnung bei Überschreitung des Auftragsbudgets.
- **CSV-Exporte**: Kunden (Erstimport) und abgeschlossene Einsätze eines Zeitraums, durchlaufende Posten gesondert.
- Blatt: Art der Umsätze (8° bis) zum Kopieren, Hinweise auf die Angaben 1° und 7°.
- Die steuerlichen Angaben der Rechnung (fortlaufende Nummerierung, MwSt.-Angaben, elektronische Rechnungsstellung)
  sind Sache der Software des Fachbetriebs.
