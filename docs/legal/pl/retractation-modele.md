# Wzór informacji o prawie odstąpienia od umowy (załącznik do artykułu R221-3)

*Tłumaczenie wersji francuskiej z 02/11/2026; wiążąca jest wersja francuska. Teksty urzędowe cytowane są po francusku.*

*Tekst urzędowy (Code de la consommation — francuski Kodeks konsumencki), wersja obowiązująca od 19 czerwca 2026, zmieniona przez
décret n° 2026-3 du 5 janvier 2026, art. 7. Źródło: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
Odtworzony 02/11/2026 na podstawie tekstu dostarczonego przez opiekuna projektu.*

## Stosowanie w Crénelio (kosztorys = umowa o świadczenie usług zawarta online)

`src/utils/withdrawalNotice.ts` generuje tekst uzupełniony w następujący sposób:

| Instrukcja | Wybór | Powód |
|---|---|---|
| (1) | a) « de la conclusion du contrat. »; b) « où vous-même […] prend physiquement possession du bien. », jeśli kosztorys zawiera materiał odsprzedawany (*fourniture revendue*) | Umowa o świadczenie usług: termin biegnie od akceptacji kosztorysu (*devis*). Materiał odsprzedawany: umowa traktowana jak sprzedaż (L221-1, II), termin od objęcia rzeczy w posiadanie (L221-18, 2°), data wydania wprowadzana przez profesjonalistę |
| (2) | Przedsiębiorstwo: nazwa, adres, telefon, email (`company_name`, `legal_adresse` lub lokal, `pro_phone`, `pro_email`) | Instrukcja (2) |
| (3) | Pierwszy tekst (funkcja odstąpienia online), z adresem strony kosztorysu | Funkcja obowiązkowa dla umowy zawartej online |
| (4) | Pominięty | Sprzedaż: bezprzedmiotowe, profesjonalista proponuje odebranie rzeczy ((5) a) |
| (5) | Usługa: pominięty (części kupione w imieniu klienta, *débours*). Sprzedaż: a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) tekst o zmniejszeniu wartości | Wybór najbardziej ochronny, przyjęty domyślnie 05/11/2026; do uczynienia konfigurowalnym, jeśli profesjonalista woli odesłanie przez klienta |
| (6) | Tekst dla świadczenia usług (« la prestation de services ») | Wykonanie przed upływem terminu na wyraźne żądanie |

Akapit « Effets de rétractation » (skutki odstąpienia) jest przytoczony bez zmian, łącznie ze wzmianką o kosztach
dostawy: wzór jest urzędowy i nie jest przeformułowywany.

## Tekst załącznika

> **INFORMATIONS CONCERNANT L'EXERCICE DU DROIT DE RÉTRACTATION**
>
> **Droit de rétractation**
>
> Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de
> quatorze jours.
>
> Le délai de rétractation expire quatorze jours après le jour (1).
>
> Pour exercer le droit de rétractation, vous devez nous notifier (2) votre décision de rétractation du
> présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la
> poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce
> n'est pas obligatoire (3).
>
> Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication
> relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.
>
> **Effets de rétractation**
>
> En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements
> reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du
> fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de
> livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard
> quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent
> contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous
> aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ;
> en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous (4).
>
> (5)
>
> (6)

*Wyjaśnienie (tłumaczenie nieoficjalne):* konsument może odstąpić od umowy bez podania przyczyny w ciągu czternastu dni; termin upływa czternaście dni po dniu wskazanym w (1). Aby odstąpić, powiadamia profesjonalistę (2) jednoznacznym oświadczeniem (list, email); wzór formularza nie jest obowiązkowy (3). Wystarczy wysłać oświadczenie przed upływem terminu. W razie odstąpienia profesjonalista zwraca wszystkie płatności, w tym koszty dostawy (z wyjątkiem dodatkowych kosztów droższej formy dostawy), bez zbędnej zwłoki, najpóźniej w ciągu czternastu dni, tym samym środkiem płatności i bez kosztów dla konsumenta (4). Punkty (5) i (6) uzupełnia się zgodnie z instrukcjami poniżej.

### Instrukcje dotyczące wypełniania informacji

> (1) Insérez l'un des passages suivants entre guillemets :
>
> a) S'il s'agit d'un contrat de service ou d'un contrat portant sur la fourniture d'eau, de gaz ou
> d'électricité lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée,
> de chauffage urbain ou d'un contenu numérique non fourni sur un support matériel : " de la conclusion
> du contrat. " ;
>
> b) S'il s'agit d'un contrat de vente : " où vous-même, ou un tiers autre que le transporteur et
> désigné par vous, prend physiquement possession du bien. " ;
>
> c) S'il s'agit d'un contrat portant sur plusieurs biens commandés par le consommateur au moyen d'une
> seule commande et si ces biens sont livrés séparément : " où vous-même, ou un tiers autre que le
> transporteur et désigné par vous, prend physiquement possession du dernier bien. " ;
>
> d) S'il s'agit d'un contrat portant sur la livraison d'un bien en plusieurs lots ou pièces : " où
> vous-même, ou un tiers autre que le transporteur et désigné par vous, prend physiquement possession du
> dernier lot ou de la dernière pièce. " ;
>
> e) S'il s'agit d'un contrat portant sur la livraison régulière de biens pendant une période de temps
> déterminée : " où vous-même, ou un tiers autre que le transporteur et désigné par vous, prend
> physiquement possession du premier bien. " ;
>
> (2) Insérez votre nom, votre adresse géographique, votre numéro de téléphone et votre adresse
> électronique.
>
> (3) Si vous êtes tenu de prévoir une fonctionnalité permettant au consommateur de se rétracter du
> contrat conclu en ligne, insérez le texte suivant : “Vous pouvez également exercer votre droit de
> rétractation en ligne sur [insérer l'adresse du site internet ou une autre référence adéquate indiquant
> où se trouve la fonctionnalité de rétractation]. Si vous utilisez cette fonctionnalité en ligne, nous
> vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support
> durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa
> soumission.”. Si vous offrez au consommateur la faculté de remplir et de transmettre électroniquement
> sa rétractation du contrat sur votre site internet, insérez le texte suivant : “Vous pouvez également
> remplir et transmettre le modèle de formulaire de rétractation ou toute autre déclaration dénuée
> d'ambiguïté sur notre site internet [insérer l'adresse du site internet]. Si vous utilisez cette
> option, nous vous enverrons dans les meilleurs délais un accusé de réception de la rétractation sur un
> support durable (par exemple, par courriel).”
>
> (4) S'il s'agit d'un contrat de vente dans le cadre duquel vous n'avez pas proposé de récupérer le
> bien en cas de rétractation, insérez le texte suivant : " Nous pouvons différer le remboursement
> jusqu'à ce que nous ayons reçu le bien ou jusqu'à ce que vous ayez fourni une preuve d'expédition du
> bien, la date retenue étant celle du premier de ces faits. "
>
> (5) Si le consommateur a reçu des biens dans le cadre du contrat :
>
> a) Insérez : " Nous récupérerons le bien " ; ou " Vous devrez renvoyer ou rendre le bien, à
> nous-mêmes ou à ... [insérer le nom et l'adresse géographique, le cas échéant, de la personne habilitée
> par vous à réceptionner le bien] sans retard excessif et, en tout état de cause, au plus tard quatorze
> jours après que vous nous aurez communiqué votre décision de rétractation du présent contrat. Ce délai
> est réputé respecté si vous renvoyez le bien avant l'expiration du délai de quatorze jours. "
>
> b) Insérez : " Nous prendrons en charge les frais de renvoi du bien. " ; " Vous devrez prendre en
> charge les frais directs de renvoi du bien. " ; Si, dans le cas d'un contrat à distance, vous ne
> proposez pas de prendre en charge les frais de renvoi du bien et que le bien, en raison de sa nature,
> ne peut normalement être renvoyé par la poste : " Vous devrez prendre en charge les frais directs de
> renvoi du bien, ... EUR [insérer le montant]. " ; ou, si le coût de renvoi du bien ne peut
> raisonnablement être calculé à l'avance : " Vous devrez prendre en charge les frais directs de renvoi
> du bien. Ces frais sont estimés à un maximum d'environ ... EUR [insérer le montant]. " ; ou Si, dans le
> cas d'un contrat hors établissement, le bien, en raison de sa nature, ne peut normalement être renvoyé
> par la poste et a été livré au domicile du consommateur au moment de la conclusion du contrat : " Nous
> récupérerons le bien à nos propres frais. " et
>
> c) Insérez : " Votre responsabilité n'est engagée qu'à l'égard de la dépréciation du bien résultant de
> manipulations autres que celles nécessaires pour établir la nature, les caractéristiques et le bon
> fonctionnement de ce bien. "
>
> (6) Dans le cas d'un contrat de prestation de services ou de fourniture d'eau, de gaz ou d'électricité
> lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée, ou de chauffage
> urbain, insérez le texte suivant : " Si vous avez demandé de commencer la prestation de services ou la
> fourniture d'eau/de gaz/d'électricité/de chauffage urbain [supprimer les mentions inutiles] pendant le
> délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni
> jusqu'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à
> l'ensemble des prestations prévues par le contrat. "
>
> Conformément au I de l'article 20 du décret n° 2026-3 du 5 janvier 2026, ces dispositions, dans leur
> rédaction issue dudit décret, entrent en vigueur le 19 juin 2026.
>
> Conformément au II du même article, les contrats en cours au 19 juin 2026 restent régis par les
> dispositions pertinentes du code des assurances, du code de la consommation, du code monétaire et
> financier, du code de la mutualité et du code de la sécurité sociale, dans leur rédaction antérieure à
> l'entrée en vigueur du présent décret.

*Wyjaśnienie (tłumaczenie nieoficjalne):* (1) wstawić odpowiedni fragment: a) umowa o świadczenie usług (oraz dostawa wody, gazu, energii elektrycznej, ciepła sieciowego, treści cyfrowych bez nośnika) — od zawarcia umowy; b) sprzedaż — od objęcia rzeczy w fizyczne posiadanie; c) wiele rzeczy dostarczanych osobno — od ostatniej rzeczy; d) dostawa partiami — od ostatniej partii; e) regularne dostawy — od pierwszej rzeczy. (2) Nazwa, adres, telefon i email profesjonalisty. (3) Tekst o funkcji odstąpienia online lub o formularzu na stronie internetowej, z potwierdzeniem odbioru na trwałym nośniku. (4) Sprzedaż bez propozycji odebrania rzeczy: możliwość wstrzymania zwrotu do otrzymania rzeczy lub dowodu jej odesłania. (5) Gdy konsument otrzymał rzeczy: a) kto odbiera lub odsyła rzecz i w jakim terminie; b) kto ponosi koszty odesłania; c) odpowiedzialność konsumenta tylko za zmniejszenie wartości wynikające z korzystania wykraczającego poza konieczne do stwierdzenia charakteru i działania rzeczy. (6) Usługi: jeśli konsument zażądał rozpoczęcia w terminie odstąpienia, płaci kwotę proporcjonalną do świadczeń spełnionych do chwili odstąpienia. Przepisy wchodzą w życie 19 czerwca 2026; umowy w toku w tym dniu podlegają wcześniejszym przepisom.
