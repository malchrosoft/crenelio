# Cumpărarea-revânzarea de furnituri (piese revândute)

*Traducere a versiunii franceze din 01/11/2026; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

*Ultima verificare: 01/11/2026. Surse: Portail auto-entrepreneur (*débours* și cheltuieli refacturate,
rezumat); regulile regimului de microîntreprinzător, de recitit pe site-urile oficiale (URSSAF, ghișeul unic)
înainte de orice activare. Vezi [surse](../sources.md).*

## Ce este

Profesionistul cumpără piesa **pe numele său**, apoi o refacturează clientului (cu sau fără adaos). Este o
**vânzare de mărfuri**, distinctă de prestarea de servicii. A nu se confunda cu
[*débours*](debours.md) (cheltuială avansată în numele clientului), unde piesa este cumpărată în numele și pe seama clientului.

## Consecințe pentru un întreprinzător individual (*entrepreneur individuel*, microîntreprindere)

- Suma revândută **intră în cifra de afaceri** (Portail auto-entrepreneur descurajează această
  metodă din acest motiv: crește contribuțiile).
- Vânzarea de mărfuri are **propriile praguri** de cifră de afaceri și **propria cotă** de
  contribuții; alături de prestări de servicii, activitatea devine **mixtă**, iar cele două cifre sunt
  urmărite separat (sumele în vigoare: Item 39, de verificat în fiecare an).
- Activitatea de vânzare trebuie **declarată** (ghișeul unic) dacă nu este deja.
- Profesionistul devine **vânzător**: factură de achiziție pe numele său, garanții legale datorate clientului pentru
  piesă, eventual stoc.

## TVA pentru piesele montate (profesionist plătitor de TVA)

BOI-TVA-BASE-10-20-40-20, § 140 și 150 ([../fr/textes/bofip.md](../fr/textes/bofip.md)): **furniturile**
(materiale transformate sau consumate) urmează prețul serviciului; **piesele de schimb** (obiecte
standardizate doar montate) sunt o **vânzare la cota care le este proprie**, cu excepția cazului în care valoarea lor este
mai mică decât cea a montajului sau au fost adaptate. Simplificare admisă: piesele și furniturile
urmează regimul prestației dacă valoarea lor globală **nu depășește 50 % din costul total**; altfel,
vânzarea pieselor este menționată **distinct** pe factură.

În Crénelio (deviz cu TVA): editorul calculează ponderea liniilor « fourniture revendue » (furnitură revândută) în
costul total fără TVA (*débours* excluse, în afara cifrei de afaceri) și o reamintește sub linii: până la 50 %, aceeași
cotă ca prestația; peste, cota proprie a pieselor, pe linii distincte (ceea ce devizul
face deja). Un deviz (*devis*) care conține o furnitură revândută este asimilat unei **vânzări** (C. consom. L221-1, II, Code de la consommation (Codul francez al consumului)):
termenul de retragere curge de la predarea pieselor către client (L221-18, 2°), dată de introdus în devizul
acceptat; vezi [retractation-modele.md](retractation-modele.md).

Controlul TVA este **orientativ**: comparația se face, în principiu, piesă cu piesă, și doar
profesionistul știe dacă o piesă a fost adaptată. Cota rămâne alegerea sa, de validat cu contabilul său.

## Societate

Revânzarea trebuie să intre în **obiectul social** (*objet social*); piesele sunt facturate cu TVA-ul societății.

## În Crénelio

- Linia « fourniture revendue » este refuzată de API cât timp `quote_allow_supply` nu este activat.
- Activarea este precedată de un **avertisment** adaptat formei juridice (`legal_form`), de acceptat
  explicit; recomandarea implicită: *débours*.
