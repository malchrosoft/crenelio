# Retragerea: contract la distanță sau la domiciliul clientului

*Traducere a versiunii franceze din 04/11/2026; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

*Ultima verificare: 04/11/2026 (texte oficiale: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)). Surse: fișa DGCCRF „Dépannage à domicile” (oficială); INC (Institut national de la consommation);
surse secundare privind L221-25. Articole din Code de la consommation (Codul francez al consumului) de recitit în versiunea lor
consolidată (vezi [surse](../sources.md)).*

## Principiu

Un deviz (*devis*) acceptat **online** (contract la distanță) sau **semnat la domiciliul** clientului (contract încheiat în afara
spațiului comercial, *hors établissement*) îi deschide clientului persoană fizică un **termen de retragere de 14 zile** (*délai de rétractation*, C. consom.
L221-18). Profesionistul trebuie să-l informeze despre acesta înainte de încheiere și să remită:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Explicație (traducere neoficială):* un exemplar al contractului, pe hârtie semnat de părți sau, cu acordul consumatorului, pe suport durabil; contractul este însoțit de formularul-tip de retragere și cuprinde, sub sancțiunea nulității, informațiile de la articolele L. 111-1 și L. 111-2.

Dacă informarea privind retragerea lipsește, termenul se prelungește cu douăsprezece luni (L221-20, confirmat).

## Excepție: urgența

Nu există drept de retragere pentru « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (lucrări de întreținere sau de reparații de efectuat de urgență la domiciliul consumatorului și solicitate expres de acesta; L221-28, 8°, citat de INC), **în limita
pieselor de schimb și a lucrărilor strict necesare pentru a răspunde situației de urgență** (fișa
DGCCRF). Urgența se înțelege ca « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (necesitatea de a înlătura un pericol pentru siguranța persoanelor sau integritatea spațiilor).

Orice lucrare **suplimentară** propusă la fața locului rămâne supusă termenului de 14 zile.

## Începerea înainte de sfârșitul termenului

Potrivit L221-25 (textul oficial de mai sus): profesionistul nu poate începe înainte de sfârșitul termenului decât
la **cererea expresă** a clientului; dacă clientul se retrage ulterior, datorează o sumă proporțională
cu serviciul deja furnizat. Fără o cerere expresă obținută, nu se datorează nimic.

## Ce spun textele oficiale (verificat la 04/11/2026)

Text integral: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Definiții** (L221-1): contract **la distanță** = încheiat fără prezența fizică simultană, prin
  recurgerea exclusivă la tehnici de comunicare la distanță până la încheiere; contract **în afara
  spațiului comercial** = încheiat în prezența fizică simultană, în afara locului obișnuit de activitate, **inclusiv în
  urma unei solicitări a consumatorului** (deviz semnat la domiciliul clientului), sau la distanță
  imediat după o solicitare personală făcută în afara acestui loc. Un contract care transferă
  proprietatea unui bun **și** furnizează o prestație este **asimilat unei vânzări** (II): de urmărit pentru
  liniile „fourniture revendue” (furnitură revândută; termenul curge de la primirea bunului).
- **Termen** (L221-18): paisprezece zile de la **încheierea contractului** pentru o prestație de
  servicii. **Calcul** (L221-19): ziua încheierii nu se numără; termenul expiră la sfârșitul
  ultimei zile; dacă aceasta cade într-o sâmbătă, duminică sau zi de sărbătoare legală ori nelucrătoare, se prelungește până la
  prima zi lucrătoare următoare. → `Quote::withdrawalDeadline` (sărbători legale, Paștele calculat).
- **Informare lipsă** (L221-20): termen prelungit cu douăsprezece luni; redus la paisprezece zile de la
  primirea informației, dacă aceasta este furnizată între timp.
- **Executare anticipată** (L221-25): cerere expresă obținută « par tout moyen » (prin orice mijloc) la distanță, « sur
  papier ou sur support durable » (pe hârtie sau pe suport durabil) în afara spațiului comercial; profesionistul **îi cere consumatorului să
  recunoască** faptul că, după executarea completă, nu va mai beneficia de dreptul de retragere. Fără cerere
  expresă obținută, sau fără informarea de la punctul 9° din L221-5, **nu se datorează nicio sumă**.
  → textul căsuței a fost completat (pagină, versiune imprimabilă, email de acord).
- **Excepții** (L221-28): 1° serviciu executat integral înainte de sfârșitul termenului, cu acord expres și
  recunoașterea pierderii dreptului → `Quote::canWithdraw` refuză retragerea când programarea
  devizului este „terminée” (încheiată) și executarea anticipată fusese cerută; 8° lucrări urgente
  solicitate expres, în limita strictului necesar.
- **Informare** (L221-5, 7° și 10°): condițiile, termenul, modalitățile, formularul-tip și locul
  funcției de retragere; dacă dreptul nu există (urgență), informarea că consumatorul nu
  beneficiază de el.
- **În afara spațiului comercial** (L221-9): exemplar datat al contractului, pe hârtie semnat sau pe suport durabil, cu
  toate informațiile din L221-5 și **însoțit de formularul-tip**. (L221-10): **nicio plată și nicio
  contraprestație înainte de șapte zile** de la încheiere, cu excepția lucrărilor urgente (4°).
- **Funcția online** (D221-5, creat prin decretul nr. 2026-3): textele « renoncer au contrat ici » și
  « confirmer la rétractation », declarația (nume și prenume, contract, mijlocul electronic pentru confirmare),
  confirmarea de primire care reia conținutul, data și ora. Conform cu implementarea.
- **Formularul-tip** (anexa la articolul R221-1, decretul nr. 2022-424): reprodus cuvânt cu cuvânt în
  versiunea imprimabilă.

## Exercitarea dreptului: articolul L221-21 (versiunea din 19 iunie 2026)

*Text oficial, redactare rezultată din ordonanța (*ordonnance*) nr. 2026-2 din 5 ianuarie 2026 (art. 26: în vigoare la
19 iunie 2026; contractele în curs la această dată rămân guvernate de textele anterioare). Reprodus la 02/11/2026
pornind de la textul furnizat de persoana care întreține proiectul.*

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

*Explicație (traducere neoficială):* consumatorul își exercită dreptul de retragere informând profesionistul, înainte de expirarea termenului din L. 221-18, prin formularul de retragere sau prin orice altă declarație lipsită de ambiguitate. Profesionistul poate permite completarea și transmiterea online, pe site-ul său; în acest caz trimite fără întârziere o confirmare de primire pe suport durabil. Pentru contractele încheiate la distanță printr-o interfață online, profesionistul pune la dispoziție, fără costuri, o funcționalitate de retragere. Un decret stabilește modalitățile de prezentare și utilizare, pentru un acces ușor, direct și permanent.

**Corespondența în Crénelio**

| Cerința din L221-21 | Implementare |
|---|---|
| Formular sau orice declarație lipsită de ambiguitate | Formular de retragere imprimabil; emailul și adresa întreprinderii figurează în modelul de informare |
| Trimitere înainte de expirarea termenului | Retragere online acceptată până la `withdrawal_until` inclusiv; data declarației este înregistrată |
| Confirmare de primire fără întârziere, pe suport durabil | Email trimis imediat după confirmare (`QuoteNotifier::sendWithdrawal`), jurnalizat |
| Funcționalitate gratuită pentru un contract încheiat printr-o interfață online | Butonul « Renoncer au contrat ici » (Renunț aici la contract) pe pagina devizului, fără cont și fără costuri |
| Acces ușor, direct și permanent (decret) | Același link ca cel al acordului (email), buton vizibil pe toată durata termenului |

## Funcția de retragere online (din 19 iunie 2026)

Ordonanța nr. 2026-2 și decretul nr. 2026-3 din 5 ianuarie 2026 (transpunerea directivei (UE)
2023/2673) impun, pentru orice contract la distanță încheiat **printr-o interfață online**, o funcție de
retragere gratuită (**confirmat de articolul D221-5**, text în [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)):

- identificată prin cuvintele « **renoncer au contrat ici** » (renunț aici la contract) sau o formulare similară lipsită de ambiguitate;
- vizibilă, direct și ușor accesibilă **pe toată durata termenului** de retragere;
- consumatorul indică sau confirmă acolo **numele și prenumele**, **contractul** în cauză și **mijlocul
  electronic** prin care primește confirmarea de primire, apoi validează prin « **confirmer la rétractation** » (confirm retragerea);
- **confirmare de primire** pe suport durabil, într-un termen rezonabil, care reia conținutul
  declarației și **data și ora** trimiterii ei;
- informarea precontractuală indică unde se află această funcție;
- sancțiune: amendă administrativă de până la 15 000 € (persoană fizică) sau 75 000 € (persoană juridică).

Modelul de informare (anexa la articolul R221-3) a fost modificat în consecință (versiunea în vigoare la
19 iunie 2026): textul oficial și opțiunile de aplicare în [retractation-modele.md](retractation-modele.md).

## În Crénelio

- Căsuța « intervention urgente » (intervenție urgentă) pe deviz: nici termen, nici funcție de retragere.
- Altfel, pentru a accepta, clientul confirmă că a luat cunoștință de dreptul său; poate cere
  executarea anticipată (căsuță separată); sfârșitul termenului este înregistrat (`withdrawal_until`).
- Pagina devizului (`/devis/:token`): informare privind termenul și locul funcției înainte de
  acord; după acord, butonul « Renoncer au contrat ici » (Renunț aici la contract), declarația (nume, emailul pentru confirmare,
  contractul reamintit), butonul « Confirmer la rétractation » (Confirm retragerea); statut `withdrawn`, declarație păstrată
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Confirmare de primire prin email către client (conținut, dată și oră) și aviz către profesionist (rambursare
  în 14 zile); emailul de acord reamintește data limită și locul funcției.
- Marcaje de timp: conexiunea MySQL este aliniată pe fusul orar al aplicației.
- Pagina devizului: modelul de informare reglementar afișat cuvânt cu cuvânt (`src/utils/withdrawalNotice.ts`).
- **Formular online precompletat** (`/devis/:token/retractation`): modelul din anexa R221-1 cuvânt cu
  cuvânt, transmis prin funcția de retragere; **PDF completabil** anexat la emailul de acord;
  declarația validată poate fi descărcată în PDF și este anexată la confirmări. Clientul este informat despre această
  facilitate (textul `ONLINE_FORM_NOTICE`, în afara modelului reglementar).
- **Înainte de contract** (L221-5, 7°, 10/11/2026): formularul tip (PDF completabil, fără data acceptării și fără link online, funcția online putând fi folosită doar după acceptare) este atașat la e-mailul de trimitere a devizului, cu excepția urgențelor; rămâne și în versiunea imprimabilă.
- **Exemplarul contractului** (L221-9): emailul trimis clientului după acordul său reia toate
  informațiile contractului, modelul de informare și formularul-tip (`LegalTexts.php`).
- Versiuni imprimabile (`/devis/:token/imprimer`): modelul de informare în deviz; formularul-tip
  din anexa la articolul R221-1, **cuvânt cu cuvânt** (confirmat la 04/11/2026).
