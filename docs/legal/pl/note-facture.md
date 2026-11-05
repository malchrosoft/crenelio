# Rachunek (*note*, faktura) za usługę

*Tłumaczenie wersji francuskiej z 01/11/2026; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

*Ostatnia weryfikacja: 01/11/2026. Źródło: karta DGCCRF (francuski urząd ds. konsumentów i konkurencji) « Dépannage à domicile » (arrêté n° 83-50/A du
3 octobre 1983 modifié — zmienione rozporządzenie z 3 października 1983), zob. [źródła](../sources.md).*

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

*Wyjaśnienie (tłumaczenie nieoficjalne):* przy każdej usłudze powyżej 25 euro brutto (TTC) profesjonalista przekazuje dokument zawierający: dane usługodawcy, datę sporządzenia rachunku, daty i miejsce wykonania usługi, szczegółowe zestawienie ilości i cen każdej usługi i dostarczonego lub sprzedanego produktu (np. stawka godzinowa i liczba przepracowanych godzin), łączną kwotę netto i brutto, nazwisko klienta (chyba że się sprzeciwi). Rachunek wydaje się zaraz po wykonaniu usługi, a w każdym razie przed zapłatą ceny.

Poniżej 25 € TTC rachunek wydaje się na żądanie klienta.

## Tekst urzędowy (zweryfikowany 04/11/2026)

Arrêté n° 83-50/A du 3 octobre 1983, art. 1–4, oraz arrêté du 24 janvier 2017, art. 5:
[../fr/textes/arretes.md](../fr/textes/arretes.md). Doprecyzowania względem karty DGCCRF:

- rachunek jest obowiązkowy, gdy cena jest **wyższa lub równa 25 € TTC** (a nie « au-delà » — „powyżej”); poniżej
  — na żądanie klienta; przy naprawach awaryjnych w domu klienta — na żądanie **niezależnie od kwoty**,
  wydawany **bezpłatnie na trwałym nośniku**;
- **szczegółowe zestawienie** staje się fakultatywne, jeśli usługa była przedmiotem opisowego i
  szczegółowego kosztorysu, zaakceptowanego i zgodnego z wykonanymi pracami;
- rachunek sporządza się **w dwóch egzemplarzach**: oryginał dla klienta, kopię usługodawca przechowuje przez **dwa lata**,
  uporządkowaną według dat.

## Elementy podatkowe faktury (zweryfikowane 04/11/2026)

CGI (Code général des impôts, francuski Ordynacja/Kodeks podatkowy), załącznik II, art. 242 nonies A ([../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
wersja z décret n° 2024-1195. Dla profesjonalisty:

- pełna nazwa, **numer identyfikacyjny** (SIREN) i adres **profesjonalisty i jego klienta** (1°);
- data wystawienia (6°) i **unikalny, chronologiczny i ciągły numer** (7°);
- dla każdej usługi: ilość, dokładna nazwa, **cena jednostkowa netto** i stawka VAT lub
  zwolnienie (8°); **charakter transakcji**: wyłącznie świadczenie usług, wyłącznie
  dostawy towarów lub jedno i drugie (8° bis);
- data usługi, jeśli różni się od daty wystawienia (10°); suma netto i VAT według stawek
  (11°); rabaty i upusty (9°);
- przy zwolnieniu podmiotowym (*franchise en base*) elementy 2° (numer VAT) i 12° (podstawa zwolnienia) można
  pominąć (II), ale wzmiankę « TVA non applicable, article 293 B du CGI » (VAT nie ma zastosowania) nadal nakłada artykuł
  293 E CGI.

Elementy 1° (numer klienta), 7° bis i 8° bis stosuje się do faktur wystawionych od
1 września 2026, a od **1 września 2027** dla mikroprzedsiębiorstw i MŚP (harmonogram
fakturowania elektronicznego, NOTA artykułu). Numer chronologiczny i ciągły obsługuje oprogramowanie
do fakturowania profesjonalisty.

## W Crénelio

Faktura jest wystawiana w narzędziu profesjonalisty (Item 22, część B); Crénelio jej nie wystawia.

- Karta **« Préparer la facture »** (przygotuj fakturę; wizyta zakończona): klient, adres, data i miejsce usługi,
  numer zaakceptowanego kosztorysu, szczegółowe pozycje (ilość, cena, VAT), sumy i wzmianka o zwolnieniu,
  każde do skopiowania; ***débours*** w osobnej pozycji, w **dokładnej kwocie z dowodu** wprowadzonej przez
  profesjonalistę wraz z jego numerem, oraz alert w razie przekroczenia budżetu z pełnomocnictwa (*mandat*).
- **Eksporty CSV**: klienci (import początkowy) i zakończone interwencje z danego okresu, *débours* osobno.
- Karta: charakter transakcji (8° bis) do skopiowania, przypomnienia o elementach 1° i 7°.
- Elementy podatkowe faktury (ciągła numeracja, wzmianki o VAT, fakturowanie elektroniczne)
  należą do oprogramowania profesjonalisty.
