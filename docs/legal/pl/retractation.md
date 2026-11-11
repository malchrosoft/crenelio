# Odstąpienie od umowy: umowa zawarta na odległość lub w domu klienta

*Tłumaczenie wersji francuskiej z 04/11/2026; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

*Ostatnia weryfikacja: 04/11/2026 (teksty urzędowe: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)). Źródła: karta DGCCRF (francuski urząd ds. konsumentów i konkurencji) « Dépannage à domicile » (urzędowa); INC;
źródła pomocnicze dotyczące L221-25. Artykuły Code de la consommation (francuski Kodeks konsumencki) do ponownego przeczytania w wersji
skonsolidowanej (zob. [źródła](../sources.md)).*

## Zasada

Kosztorys (*devis*) zaakceptowany **online** (umowa zawarta na odległość) lub **podpisany w domu** klienta (umowa zawarta poza
lokalem przedsiębiorstwa, *hors établissement*) daje klientowi-konsumentowi **14-dniowy termin na odstąpienie od umowy** (*droit de rétractation* — prawo odstąpienia od umowy; C. consom.
L221-18). Profesjonalista musi go o tym poinformować przed zawarciem umowy i przekazać:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Wyjaśnienie (tłumaczenie nieoficjalne):* egzemplarz umowy na papierze podpisany przez strony lub, za zgodą konsumenta, na trwałym nośniku; do umowy dołącza się wzór formularza odstąpienia, a umowa musi, pod rygorem nieważności, zawierać informacje z artykułów L. 111-1 i L. 111-2.

Jeśli brakuje informacji o odstąpieniu, termin przedłuża się o dwanaście miesięcy (L221-20, potwierdzone).

## Wyjątek: sytuacja pilna

Odstąpienie nie przysługuje w przypadku « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (prac konserwacyjnych lub naprawczych do wykonania w trybie pilnym w domu konsumenta, o które wyraźnie poprosił; L221-28, 8°, cytowany przez INC), **w granicach
części zamiennych i prac ściśle niezbędnych do zaradzenia sytuacji pilnej** (karta
DGCCRF). Sytuację pilną rozumie się jako « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (konieczność usunięcia zagrożenia dla bezpieczeństwa osób lub integralności pomieszczeń).

Każda **dodatkowa** praca zaproponowana na miejscu nadal podlega 14-dniowemu terminowi.

## Rozpoczęcie przed upływem terminu

Zgodnie z L221-25 (tekst urzędowy powyżej): profesjonalista może rozpocząć przed upływem terminu tylko
na **wyraźne żądanie** klienta; jeśli klient następnie odstąpi od umowy, jest winien kwotę proporcjonalną
do już wykonanej usługi. Bez uzyskanego wyraźnego żądania nic nie jest należne.

## Co mówią teksty urzędowe (zweryfikowane 04/11/2026)

Pełny tekst: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definicje** (L221-1): umowa **na odległość** = zawarta bez jednoczesnej fizycznej obecności, przy
  wyłącznym użyciu środków porozumiewania się na odległość aż do zawarcia; umowa **poza
  lokalem przedsiębiorstwa** = zawarta przy jednoczesnej fizycznej obecności poza zwykłym miejscem działalności, **także na
  skutek zaproszenia ze strony konsumenta** (kosztorys podpisany w domu klienta), lub na odległość
  bezpośrednio po osobistym zwróceniu się poza tym miejscem. Umowa, która przenosi
  własność rzeczy **i** obejmuje usługę, jest **traktowana jak sprzedaż** (II): do pilnowania przy
  pozycjach « fourniture revendue » (materiał odsprzedawany; termin liczony od otrzymania rzeczy).
- **Termin** (L221-18): czternaście dni **od zawarcia umowy** w przypadku świadczenia
  usług. **Obliczanie** (L221-19): dnia zawarcia nie wlicza się; termin upływa z końcem
  ostatniego dnia; jeśli przypada on w sobotę, niedzielę lub dzień ustawowo wolny od pracy, przedłuża się do
  pierwszego następnego dnia roboczego. → `Quote::withdrawalDeadline` (ustawowe dni wolne, Wielkanoc obliczana).
- **Brak informacji** (L221-20): termin przedłużony o dwanaście miesięcy; skrócony do czternastu dni od
  otrzymania informacji, jeśli zostanie ona przekazana w międzyczasie.
- **Wykonanie przed upływem terminu** (L221-25): wyraźne żądanie uzyskane « par tout moyen » (wszelkimi środkami) na odległość, « sur
  papier ou sur support durable » (na papierze lub trwałym nośniku) poza lokalem przedsiębiorstwa; profesjonalista **prosi konsumenta o
  potwierdzenie**, że po pełnym wykonaniu nie będzie już przysługiwać mu prawo odstąpienia. Bez uzyskanego wyraźnego
  żądania lub bez informacji z pkt 9° L221-5 **żadna kwota nie jest należna**.
  → uzupełniony tekst pola wyboru (strona, wersja do druku, email z akceptacją).
- **Wyjątki** (L221-28): 1° usługa w pełni wykonana przed upływem terminu, za wyraźną zgodą i
  potwierdzeniem utraty prawa → `Quote::canWithdraw` odrzuca odstąpienie, gdy wizyta
  z kosztorysu jest « terminé » (zakończona), a wcześniej zażądano wykonania przed upływem terminu; 8° prace pilne
  wyraźnie zamówione, w granicach tego, co ściśle niezbędne.
- **Informacja** (L221-5, 7° i 10°): warunki, termin, sposób, wzór formularza i umiejscowienie
  funkcji odstąpienia; jeśli prawo nie istnieje (sytuacja pilna) — informacja, że konsumentowi ono nie
  przysługuje.
- **Poza lokalem przedsiębiorstwa** (L221-9): datowany egzemplarz umowy, na papierze podpisany lub na trwałym nośniku, ze
  wszystkimi informacjami z L221-5 i **wraz ze wzorem formularza**. (L221-10): **żadnej płatności ani
  świadczenia wzajemnego przed upływem siedmiu dni** od zawarcia, z wyjątkiem prac pilnych (4°).
- **Funkcja online** (D221-5, wprowadzony décret n° 2026-3): napisy « renoncer au contrat ici » (zrezygnuj z umowy tutaj) i
  « confirmer la rétractation » (potwierdź odstąpienie), oświadczenie (imię i nazwisko, umowa, elektroniczny środek otrzymania potwierdzenia),
  potwierdzenie odbioru zawierające treść, datę i godzinę. Zgodne z implementacją.
- **Wzór formularza** (załącznik do artykułu R221-1, décret n° 2022-424): odtworzony słowo w słowo w
  wersji do druku.

## Wykonanie prawa: artykuł L221-21 (wersja z 19 czerwca 2026)

*Tekst urzędowy, brzmienie nadane ordonnance n° 2026-2 du 5 janvier 2026 (zarządzenie z mocą ustawy; art. 26: wchodzi w życie
19 czerwca 2026; umowy w toku w tym dniu podlegają wcześniejszym przepisom). Odtworzony 02/11/2026 na
podstawie tekstu dostarczonego przez opiekuna projektu.*

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

*Wyjaśnienie (tłumaczenie nieoficjalne):* konsument odstępuje od umowy, wysyłając przed upływem terminu z L. 221-18 formularz odstąpienia lub inne jednoznaczne oświadczenie. Profesjonalista może umożliwić wypełnienie i przesłanie go online na swojej stronie; wtedy niezwłocznie przekazuje potwierdzenie odbioru na trwałym nośniku. W umowach zawartych na odległość przez interfejs online profesjonalista udostępnia bezpłatną funkcję odstąpienia. Dekret określa sposób jej prezentacji i używania, zapewniający łatwy, bezpośredni i stały dostęp.

**Odpowiedniki w Crénelio**

| Wymóg L221-21 | Realizacja |
|---|---|
| Formularz lub każde jednoznaczne oświadczenie | Formularz odstąpienia do druku; email i adres przedsiębiorstwa figurują we wzorze informacji |
| Wysłanie przed upływem terminu | Odstąpienie online przyjmowane do `withdrawal_until` włącznie; data oświadczenia jest rejestrowana |
| Niezwłoczne potwierdzenie odbioru na trwałym nośniku | Email wysyłany od razu po potwierdzeniu (`QuoteNotifier::sendWithdrawal`), rejestrowany w dzienniku |
| Bezpłatna funkcja dla umowy zawartej przez interfejs online | Przycisk « Renoncer au contrat ici » (zrezygnuj z umowy tutaj) na stronie kosztorysu, bez konta i bez opłat |
| Łatwy, bezpośredni i stały dostęp (dekret) | Ten sam link co do akceptacji (email), przycisk widoczny przez cały termin |

## Funkcja odstąpienia online (od 19 czerwca 2026)

Ordonnance n° 2026-2 i décret n° 2026-3 z 5 stycznia 2026 (transpozycja dyrektywy (UE)
2023/2673) nakładają, dla każdej umowy zawartej na odległość **przez interfejs online**, bezpłatną funkcję
odstąpienia (**potwierdzone przez artykuł D221-5**, tekst w [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)):

- oznaczoną słowami « **renoncer au contrat ici** » (zrezygnuj z umowy tutaj) lub analogicznym jednoznacznym sformułowaniem;
- widoczną, bezpośrednio i łatwo dostępną **przez cały termin** na odstąpienie;
- konsument podaje lub potwierdza w niej swoje **imię i nazwisko**, **umowę**, której to dotyczy, oraz **elektroniczny
  środek** otrzymania potwierdzenia odbioru, a następnie zatwierdza przyciskiem « **confirmer la rétractation** » (potwierdź odstąpienie);
- **potwierdzenie odbioru** na trwałym nośniku, w rozsądnym terminie, zawierające treść
  oświadczenia oraz **datę i godzinę** jego wysłania;
- informacja przedumowna wskazuje, gdzie znajduje się ta funkcja;
- sankcja: administracyjna kara pieniężna do 15 000 € (osoba fizyczna) lub 75 000 € (osoba prawna).

Wzór informacji (załącznik do artykułu R221-3) został odpowiednio zmieniony (wersja obowiązująca od
19 czerwca 2026): tekst urzędowy i wybory przy stosowaniu w [retractation-modele.md](retractation-modele.md).

## W Crénelio

- Pole « intervention urgente » (interwencja pilna) w kosztorysie: ani terminu, ani funkcji odstąpienia.
- W przeciwnym razie, aby zaakceptować, klient potwierdza, że zapoznał się ze swoim prawem; może zażądać
  wykonania przed upływem terminu (osobne pole); koniec terminu jest rejestrowany (`withdrawal_until`).
- Strona kosztorysu (`/devis/:token`): informacja o terminie i umiejscowieniu funkcji przed
  akceptacją; po akceptacji przycisk « Renoncer au contrat ici » (zrezygnuj z umowy tutaj), oświadczenie (imię i nazwisko, email do potwierdzenia,
  przypomniana umowa), przycisk « Confirmer la rétractation » (potwierdź odstąpienie); status `withdrawn`, oświadczenie przechowywane
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Potwierdzenie odbioru emailem do klienta (treść, data i godzina) i powiadomienie dla profesjonalisty (zwrot
  w ciągu 14 dni); email z akceptacją przypomina termin końcowy i umiejscowienie funkcji.
- Znaczniki czasu: połączenie MySQL jest zgodne ze strefą czasową aplikacji.
- Strona kosztorysu: urzędowy wzór informacji wyświetlany słowo w słowo (`src/utils/withdrawalNotice.ts`).
- **Wstępnie wypełniony formularz online** (`/devis/:token/retractation`): wzór z załącznika R221-1 słowo w
  słowo, przekazywany przez funkcję odstąpienia; **wypełnialny PDF** dołączony do emaila z akceptacją;
  zatwierdzone oświadczenie do pobrania w PDF i dołączane do potwierdzeń. Klient jest informowany o tym
  udogodnieniu (tekst `ONLINE_FORM_NOTICE`, poza urzędowym wzorem).
- **Przed zawarciem umowy** (L221-5, 7°, 10/11/2026): wzór formularza (PDF do wypełnienia, bez daty akceptacji i bez linku online, ponieważ funkcja online działa dopiero po akceptacji) jest załączany do e-maila z kosztorysem, z wyjątkiem sytuacji pilnych; pozostaje też w wersji do druku.
- **Egzemplarz umowy** (L221-9): email wysłany do klienta po jego akceptacji zawiera wszystkie
  informacje umowy, wzór informacji i wzór formularza (`LegalTexts.php`).
- Wersje do druku (`/devis/:token/imprimer`): wzór informacji w kosztorysie; wzór formularza
  z załącznika do artykułu R221-1, **słowo w słowo** (potwierdzone 04/11/2026).
