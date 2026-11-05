# Zakup i odsprzedaż materiałów (*achat-revente*, części odsprzedawane)

*Tłumaczenie wersji francuskiej z 01/11/2026; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

*Ostatnia weryfikacja: 01/11/2026. Źródła: Portail auto-entrepreneur (*débours* i refakturowane koszty,
streszczenie); zasady systemu mikroprzedsiębiorcy (*micro-entrepreneur*) do ponownego sprawdzenia na stronach urzędowych (URSSAF, *guichet unique* — jednolity punkt kontaktowy)
przed każdym włączeniem. Zob. [źródła](../sources.md).*

## Na czym to polega

Profesjonalista kupuje część **na własne nazwisko**, a następnie refakturuje ją klientowi (z marżą lub bez). Jest to
**sprzedaż towarów**, odrębna od świadczenia usług. Nie należy jej mylić z
[*débours*](debours.md) (wydatkiem poniesionym w imieniu i na rzecz klienta), gdzie część jest kupowana w imieniu i na rachunek klienta.

## Konsekwencje dla przedsiębiorcy indywidualnego (mikroprzedsiębiorstwo)

- Kwota odsprzedaży **wchodzi do obrotu** (Portail auto-entrepreneur odradza tę
  metodę właśnie z tego powodu: zwiększa ona składki).
- Sprzedaż towarów ma **własne progi** obrotu i **własną stawkę**
  składek; łącznie ze świadczeniem usług działalność staje się **mieszana**, a obie kwoty
  są śledzone osobno (kwoty obowiązujące: Item 39, do sprawdzenia co roku).
- Działalność sprzedażowa musi zostać **zgłoszona** (*guichet unique*), jeśli nie była jeszcze zgłoszona.
- Profesjonalista staje się **sprzedawcą**: faktura zakupu na jego nazwisko, ustawowe gwarancje należne klientowi na
  część, ewentualny zapas magazynowy.

## VAT od montowanych części (profesjonalista będący podatnikiem VAT)

BOI-TVA-BASE-10-20-40-20, § 140 i 150 ([../fr/textes/bofip.md](../fr/textes/bofip.md)): **materiały**
(*fournitures*, materiały przetworzone lub zużyte) idą za ceną usługi; **części zamienne** (*pièces détachées*, znormalizowane przedmioty
po prostu zamontowane) stanowią **sprzedaż według właściwej im stawki**, chyba że ich wartość jest
niższa od wartości montażu lub zostały dopasowane. Dopuszczalne uproszczenie: części i materiały
podlegają reżimowi usługi, jeśli ich łączna wartość **nie przekracza 50 % całkowitego kosztu**; w przeciwnym razie
sprzedaż części wykazuje się na fakturze **oddzielnie**.

W Crénelio (kosztorys z VAT): edytor oblicza udział pozycji « fourniture revendue » (materiał odsprzedawany) w
całkowitym koszcie netto (HT) (bez *débours*, które są poza obrotem) i przypomina o nim pod pozycjami: do 50 % ta sama
stawka co usługa; powyżej — właściwa stawka części, w odrębnych pozycjach (co kosztorys już
robi). Kosztorys zawierający materiał odsprzedawany jest traktowany jak **sprzedaż** (C. consom. L221-1, II — Code de la consommation, francuski Kodeks konsumencki): termin
na odstąpienie biegnie od wydania części klientowi (L221-18, 2°); datę tę wprowadza się w zaakceptowanym
kosztorysie; zob. [retractation-modele.md](retractation-modele.md).

Kontrola VAT ma charakter **orientacyjny**: porównanie przeprowadza się co do zasady dla każdej części osobno, a tylko
profesjonalista wie, czy część została dopasowana. Stawka pozostaje jego wyborem, do zatwierdzenia z księgowym.

## Spółka

Odsprzedaż musi mieścić się w **przedmiocie działalności** (*objet social*); części są fakturowane z VAT spółki.

## W Crénelio

- Pozycja « fourniture revendue » jest odrzucana przez API, dopóki `quote_allow_supply` nie jest włączone.
- Włączenie następuje po **ostrzeżeniu** dostosowanym do formy prawnej (`legal_form`), które trzeba
  wyraźnie zaakceptować; domyślna rekomendacja: *débours*.
