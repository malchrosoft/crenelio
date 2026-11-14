# Przechowywanie i usuwanie danych klientów

*Tłumaczenie wersji francuskiej z 14/11/2026; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

*Ostatnia weryfikacja: 14/11/2026. Podstawa prawna: Code de la consommation, L213-1, D213-1 i D213-2
(przechowywanie umów zawartych drogą elektroniczną); Code de commerce, L123-22 (dowody
księgowe); rozporządzenie (UE) 2016/679 (RODO), artykuły 5, 6 i 17. Teksty słowo w słowo:
[../fr/textes/code-consommation.md](../fr/textes/code-consommation.md), [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md),
[../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md). Karta pomocy, a nie porada prawna.*

## Najważniejsze

| Dane | Przechowywane | Następnie |
|---|---|---|
| Wizyta (imię i nazwisko, email, telefon, adres, uwagi) | Przez ustawiony okres (ekran Compte, domyślnie 36 miesięcy) po interwencji | Automatycznie **usuwana** |
| Kosztorys **niezaakceptowany** (szkic, wysłany, odrzucony, wygasły, anulowany) | Przez ten sam okres | Automatycznie **usuwany** |
| Kosztorys **zaakceptowany** (umowa), nawet jeśli później nastąpiło odstąpienie | **Dziesięć lat** od interwencji (lub, w jej braku, od akceptacji), wraz ze śladem akceptacji; po zakończeniu interwencji jest **archiwizowany** (filtr « Archivés » ekranu Devis) | Automatycznie **usuwany**, wraz z jego wizytą |

Dlaczego usuwać zamiast „anonimizować”: wiersz zachowany z datą, usługą, kwotą i gminą może nadal wskazywać
klienta, na przykład po zestawieniu go z fakturą. Usunięcie imienia i nazwiska nie wystarcza, aby dane stały się
anonimowe: nie może już być możliwe wyodrębnienie osoby, powiązanie jej danych ani wywnioskowanie informacji na jej
temat (Grupa Robocza Art. 29, opinia 05/2014 w sprawie technik anonimizacji, s. 9 i 10). Dlatego Crénelio usuwa dane,
zamiast przechowywać wiersze „zanonimizowane”.

*Zakres tego źródła (zweryfikowano 14/11/2026)*: opinia 05/2014 jest **wcześniejsza niż RODO** (przyjęte w 2016 r.,
stosowane od 25 maja 2018 r.) i nie figuruje na liście dokumentów Grupy Roboczej Art. 29 przejętych przez Europejską
Radę Ochrony Danych na jej pierwszym posiedzeniu; pozostaje jednak punktem odniesienia przywoływanym przez CNIL w jej
przewodniku dotyczącym okresów przechowywania (lipiec 2020) i w jej standardzie dotyczącym zarządzania handlowego
(opublikowanym w styczniu 2022). Rada poddała konsultacjom wytyczne w sprawie pseudonimizacji (01/2025, wersja
ostateczna niepotwierdzona na ten dzień). Wybrane przez Crénelio usuwanie nie zależy od tych dyskusji: usuniętych
danych nie trzeba już kwalifikować.

W okresie przechowywania zaakceptowany kosztorys podlega **archiwizacji pośredniej** (*archivage intermédiaire*) w
rozumieniu CNIL: zachowuje się tylko dane stwierdzające umowę (telefon klienta zostaje usunięty), kosztorys znika z
bieżącej listy kosztorysów i przegląda się go tylko w razie potrzeby, na przykład w przypadku sporu lub żądania
klienta (CNIL, przewodnik dotyczący okresów przechowywania, lipiec 2020, oraz standard « gestion des activités
commerciales »).

## Dlaczego dziesięć lat dla zaakceptowanego kosztorysu

- **Umowa zawarta online na 120 € lub więcej**: obowiązek. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » oraz « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). Kwota wynosi 120 euro (D213-1); okres to dziesięć lat od
  zawarcia umowy lub od jej wykonania, gdy jest ono odroczone (D213-2). Kosztorys zaakceptowany na jego stronie online
  podlega temu przepisowi.
- **Poniżej 120 €**: prawo nie nakłada tego obowiązku na podstawie L213-1. Crénelio stosuje **ten sam okres
  przez ostrożność**: zaakceptowany kosztorys jest dokumentem uzasadniającym Twoją fakturę, a Code de commerce stanowi, że
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Ten
  przepis dotyczy przede wszystkim kupców (*commerçants*): Twój biegły księgowy powie Ci, czy ma zastosowanie w Twojej sytuacji.

Przechowywany kosztorys obejmuje to, co stwierdza umowę: Twoje pozycje i ceny, tożsamość i adres klienta,
datę i ślad jego akceptacji (adres IP), jego odpowiedzi (wymienione części, pełnomocnictwo *débours*) oraz,
w stosownym przypadku, jego oświadczenie o odstąpieniu.

## Gdy klient żąda usunięcia danych

RODO daje mu to prawo (artykuł 17), chyba że przechowywanie jest « nécessaire […] pour respecter une
obligation légale » (artykuł 17, ustęp 3, b). W praktyce, przy « Effacer le client » (Usuń klienta):

- **zostają usunięte**: wizyta, jego niezaakceptowane kosztorysy i ich dziennik emaili;
- **pozostaje nienaruszony**: każdy kosztorys **zaakceptowany**, aż do końca jego dziesięciu lat; jego wizyta zostaje
  zachowana, ograniczona do daty. Okno potwierdzenia
  wskazuje, które; powiedz o tym klientowi, przytaczając te przepisy;
- **przyszła wizyta**, nieodwołana: potwierdzenie ostrzega, że nie będziesz już mógł skontaktować się z
  klientem. Najpierw odwołaj wizytę, jeśli interwencja już się nie odbędzie.

Usunięcie jest nieodwracalne. Polityka prywatności strony informuje klientów o tych okresach.

## Co przechowujesz gdzie indziej

Crénelio nie zastępuje Twojego programu do fakturowania ani Twojej księgowości: Twoje faktury, księgi i
dowody zakupu (*débours*) przechowuje się według zasad, które Ciebie dotyczą (zob.
[rachunek i faktura](note-facture.md) oraz [ściągawka](rappels-artisan.md)).
