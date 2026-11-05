# Rechtliche Dokumentation des Fachbetriebs

*Übersetzung der aktuellen französischen Fassung; maßgeblich ist die französische Fassung. Amtliche Texte werden auf Französisch zitiert.*

Texte und Referenzen, auf denen die Kostenvoranschläge (*devis*) von Crénelio beruhen (Item 22). Erste Form der
Dokumentationsbasis von Item 40: Markdown-Dateien, ein Ordner pro Sprache (`fr/` ist maßgeblich). Später
werden sie in die Datenbank geladen und übersetzt; Auszüge aus amtlichen Texten werden dann weiterhin auf
Französisch zitiert, mit einer übersetzten Erläuterung.

Diese Merkblätter sind auch im Bereich des Fachbetriebs (*Espace Artisan*, Menü **Aide › Documentation**) lesbar:
Jedes hier hinzugefügte Merkblatt erscheint dort, die Links zwischen den Merkblättern bleiben relativ.

## Übersetzungen

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` und, zum Vergnügen, `fr-chti/` (Ch'ti) (05/11/2026) übernehmen die Merkblätter aus `fr/` unter demselben Namen, dazu
`README.md` für das Inhaltsverzeichnis. Die amtlichen Texte (`fr/textes/`) und `sources.md` werden nicht übersetzt:
Sie werden auf Französisch zitiert. **Die französische Fassung ist maßgeblich**; jede Änderung eines
französischen Merkblatts wird in seine Übersetzungen übernommen (oder diese werden als veraltet gekennzeichnet).
Arabisch (`ar/`) wird von rechts nach links geschrieben; seine amtlichen Zitate, auf Französisch, werden weiterhin von links nach rechts angezeigt.

## Regeln

- Jede Datei nennt ihre **Quellen** (Link) und das **Datum der letzten Überprüfung**.
- Auszüge aus amtlichen Texten (Légifrance, Merkblätter der Verwaltung) werden unverändert übernommen, in
  Anführungszeichen oder als Zitat; private Quellen (Leitfäden, Fachseiten) werden **zusammengefasst**, nie
  kopiert.
- Darstellung eines zitierten amtlichen Textes (wie auf Légifrance): eine Überschrift `### Article …`, dann ein
  Zitat `>`, in dem **jeder Absatz ein eigener Absatz ist** (Aufzählungen „1°“, „a)“, „II. -“ eingeschlossen,
  getrennt durch eine leere `>`-Zeile); der Fassungsvermerk („Modifié par…“, „Création…“) als erster Absatz,
  dann „NOTA :“ allein auf seiner Zeile. Der Bildschirm *Documentation* leitet daraus die Formatierung ab; der
  Text selbst wird nie verändert.
- Eine Sekundärquelle ersetzt nicht den amtlichen Text: Sie wird als solche gekennzeichnet und dient nur dazu,
  den richtigen Text zu finden. **Jede in Crénelio angewandte Regel muss durch den amtlichen Text bestätigt
  sein**, um Auslegungsverzerrungen Dritter (Kanzleien, Verlage, Blogs) zu vermeiden.
- Bei jeder Rechtsänderung (Item 39): Datei, Datum und den betroffenen Code aktualisieren
  (`api/models/Quote.php`, Einstellungen `quote_*` / `legal_*`).
- Diese Merkblätter sind eine Hilfe, keine Rechtsberatung: Im Zweifel wendet sich der Fachbetrieb an seinen
  Steuerberater (*expert-comptable*) oder seine Handwerkskammer (*chambre de métiers*).

## Merkblätter

| Thema | Merkblatt |
|---|---|
| Kostenvoranschlag für Reparaturen im Haushalt: vorvertragliches Dokument, Pflichtangaben, ausgetauschte Teile | [devis-depannage.md](devis-depannage.md) |
| Fernabsatzvertrag oder Vertrag in der Wohnung: Widerruf, Notfall, vorzeitige Ausführung | [retractation.md](retractation.md) |
| Amtlicher Text des Informationsmusters (Anhang R221-3, 19. Juni 2026) und Umsetzungsentscheidungen | [retractation-modele.md](retractation-modele.md) |
| Im Namen des Kunden gekaufte Teile: Voraussetzungen, Belege, Umsatz | [debours.md](debours.md) |
| Weiterverkauf von Teilen: Folgen, Rechtsform, Alternative der durchlaufenden Posten | [achat-revente.md](achat-revente.md) |
| Rechnung (*note*) Pflicht ab 25 € inkl. MwSt. | [note-facture.md](note-facture.md) |
| Angabe „EI“, SIRET, RM, Versicherung, Schlichter, Preisauszeichnung | [mentions-entreprise.md](mentions-entreprise.md) |
| Merkhilfe für den Fachbetrieb: Einkäufe, Belege, Aufbewahrung | [rappels-artisan.md](rappels-artisan.md) |
| Amtliche Texte, wörtlich: Code de la consommation | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Amtliche Texte: Code de commerce (EI, Gesellschaften) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Amtliche Texte: Code général des impôts (durchlaufende Posten, Kleinunternehmerregelung) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Amtliche Texte: Code de l'artisanat (*qualité d'artisan*, Handwerkereigenschaft) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Amtliche Texte: Erlasse (*arrêtés*) von 1983 (Rechnung), 1987 (Preisinformation) und 2017 (Kostenvoranschlag für Reparaturen) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Amtliche Texte: CGI, Anhang II (Pflichtangaben auf Rechnungen) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Amtliche Texte: Code de la sécurité sociale (Beiträge des Kleinstunternehmers) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Amtliche Texte: Code des assurances (zehnjährige Bauhaftpflichtversicherung, dem Kostenvoranschlag beigefügte Bescheinigung) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Amtliche Texte: Code civil (Bauunternehmer, zehnjährige, zweijährige Gewährleistung und Fertigstellungsgewährleistung) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Steuerverwaltungsdoktrin (BOFiP): durchlaufende Posten, Ersatzteile | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Quellenliste, Art und Datum der Überprüfung | [../sources.md](../sources.md) |
