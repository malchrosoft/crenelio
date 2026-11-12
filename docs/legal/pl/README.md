# Prawna baza dokumentacji profesjonalisty (*artisan*)

*Tłumaczenie aktualnej wersji francuskiej; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

Teksty i odniesienia, na których opierają się kosztorysy (*devis*) w Crénelio (Item 22). Pierwsza postać bazy
dokumentacji z Item 40: pliki Markdown, jeden folder na język (wiążący jest `fr/`). Później
zostaną wczytane do bazy danych i przetłumaczone; wyciągi z tekstów urzędowych pozostaną wtedy cytowane po francusku,
z przetłumaczonym wyjaśnieniem.

Karty te można też czytać w Espace Artisan (strefa profesjonalisty; menu **Aide › Documentation**): każda karta dodana
tutaj pojawia się tam, a linki między kartami pozostają względne.

## Tłumaczenia

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` oraz, dla przyjemności, `fr-chti/` (ch'ti) (05/11/2026) powtarzają karty z `fr/` pod tą samą nazwą, a `README.md`
służy za spis treści. Teksty urzędowe (`fr/textes/`) i `sources.md` nie są tłumaczone: są
cytowane po francusku. **Wiążąca jest wersja francuska**; każdą zmianę karty francuskiej
przenosi się do jej tłumaczeń (albo oznacza je jako nieaktualne). Arabski (`ar/`) zapisuje się od prawej do lewej; jego cytaty urzędowe, po francusku, pozostają wyświetlane od lewej do prawej.

## Zasady

- Każdy plik podaje swoje **źródła** (link) i **datę ostatniej weryfikacji**.
- Wyciągi z tekstów urzędowych (Légifrance, karty administracji) są przytaczane bez zmian, w
  cudzysłowie lub jako cytat; źródła prywatne (poradniki, serwisy specjalistyczne) są **streszczane**, nigdy
  kopiowane.
- Prezentacja cytowanego tekstu urzędowego (jak na Légifrance): tytuł `### Article …`, następnie
  cytat `>`, w którym **każdy ustęp jest akapitem** (łącznie z wyliczeniami « 1° », « a) », « II. - »,
  oddzielonymi pustą linią `>`); wzmianka o wersji (« Modifié par… », « Création… ») jako pierwszy
  ustęp, potem « NOTA : » w osobnej linii. Ekran Documentation wyprowadza z tego formatowanie; sam tekst
  nigdy nie jest zmieniany.
- Źródło pomocnicze nie zastępuje tekstu urzędowego: jest oznaczone jako takie i służy jedynie do
  odnalezienia właściwego tekstu. **Każda reguła stosowana w Crénelio musi być potwierdzona tekstem urzędowym**,
  aby uniknąć stronniczej interpretacji osób trzecich (kancelarie, wydawcy, blogi).
- Przy każdej zmianie przepisów (Item 39): zaktualizować plik, jego datę i odpowiedni kod
  (`api/models/Quote.php`, ustawienia `quote_*` / `legal_*`).
- Karty te są pomocą, a nie poradą prawną: w razie wątpliwości profesjonalista konsultuje się ze swoim
  biegłym księgowym (*expert-comptable*) lub swoją izbą rzemieślniczą (*chambre de métiers*).

## Karty

| Temat | Karta |
|---|---|
| Kosztorys napraw awaryjnych w domu klienta: dokument przedumowny, wymagane informacje, wymienione części | [devis-depannage.md](devis-depannage.md) |
| Umowa zawarta na odległość lub w domu klienta: odstąpienie, pilna naprawa, wykonanie przed upływem terminu | [retractation.md](retractation.md) |
| Tekst urzędowy wzoru informacji (załącznik R221-3, 19 czerwca 2026) i wybory przy stosowaniu | [retractation-modele.md](retractation-modele.md) |
| Części kupione w imieniu klienta: warunki, dowody, obrót | [debours.md](debours.md) |
| Odsprzedaż części: konsekwencje, forma prawna, alternatywa w postaci *débours* | [achat-revente.md](achat-revente.md) |
| Rachunek (*note*, faktura) obowiązkowy powyżej 25 € TTC (brutto) | [note-facture.md](note-facture.md) |
| Oznaczenie « EI », SIRET, RM, ubezpieczenie, mediator, jawność cen | [mentions-entreprise.md](mentions-entreprise.md) |
| Ściągawka profesjonalisty: zakupy, dowody, przechowywanie | [rappels-artisan.md](rappels-artisan.md) |
| Odwołanie lub przesunięcie wizyty, do której jest kosztorys: anulowana oferta, rozwiązanie za porozumieniem, siła wyższa | [annulation-devis.md](annulation-devis.md) |
| Przechowywanie i usuwanie danych klientów: dziesięć lat dla zaakceptowanego kosztorysu, RODO | [conservation-effacement.md](conservation-effacement.md) |
| Teksty urzędowe, słowo w słowo: Code de la consommation | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Teksty urzędowe: Code de commerce (EI, spółki) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Teksty urzędowe: Code général des impôts (*débours*, zwolnienie podmiotowe) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Teksty urzędowe: Code de l'artisanat (*qualité d'artisan* — status rzemieślnika) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Teksty urzędowe: rozporządzenia (*arrêtés*) z 1983 (rachunek), 1987 (informacja o cenach) i 2017 (kosztorys napraw awaryjnych) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Teksty urzędowe: CGI, załącznik II (obowiązkowe elementy faktur) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Teksty urzędowe: Code de la sécurité sociale (składki mikroprzedsiębiorcy) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Teksty urzędowe: Code des assurances (ubezpieczenie dziesięcioletnie, zaświadczenie dołączane do kosztorysów) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Teksty urzędowe: Code civil (oferta i przyjęcie, zmiana umowy, siła wyższa, rozwiązanie; wykonawca robót budowlanych, gwarancje dziesięcioletnia, dwuletnia, *parfait achèvement*) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Teksty urzędowe: prawo europejskie (terminy, RODO) | [../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md) |
| Teksty urzędowe: Code de procédure civile (obliczanie terminów) | [../fr/textes/code-procedure-civile.md](../fr/textes/code-procedure-civile.md) |
| Doktryna podatkowa (BOFiP): *débours*, części zamienne | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Lista źródeł, ich charakter i data weryfikacji | [../sources.md](../sources.md) |
