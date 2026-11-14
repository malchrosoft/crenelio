# Păstrarea și ștergerea datelor clienților

*Traducere a versiunii franceze din 14/11/2026; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

*Ultima verificare: 14/11/2026. Temei legal: Code de la consommation, L213-1, D213-1 și D213-2
(păstrarea contractelor încheiate pe cale electronică); Code de commerce, L123-22 (documente
justificative); regulamentul (UE) 2016/679 (RGPD), articolele 5, 6 și 17. Textele cuvânt cu cuvânt:
[../fr/textes/code-consommation.md](../fr/textes/code-consommation.md), [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md),
[../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md). Fișă de ajutor, nu consultanță juridică.*

## Esențialul

| Date | Păstrate | Apoi |
|---|---|---|
| Programare (nume, email, telefon, adresă, note) | Durata setată (ecranul Compte, implicit 36 de luni) după intervenție | **Ștearsă** automat |
| Deviz **neacceptat** (ciornă, trimis, refuzat, expirat, anulat) | Aceeași durată | **Șters** automat |
| Deviz **acceptat** (contract), chiar retras ulterior | **Zece ani** după intervenție (sau, în lipsa ei, după acord), cu urma acordului; la încheierea intervenției, este **arhivat** (filtrul « Archivés » din ecranul Devis) | **Șters** automat, împreună cu programarea sa |

De ce ștergere și nu „anonimizare”: un rând păstrat cu data, prestația, suma și localitatea sa poate încă desemna
clientul, de exemplu prin comparare cu o factură. Eliminarea numelui nu este suficientă pentru ca datele să devină
anonime: nu trebuie să mai fie posibilă izolarea unei persoane, corelarea datelor sale sau deducerea unei informații
despre ea (Grupul de lucru articolul 29, avizul 05/2014 privind tehnicile de anonimizare, p. 9 și 10). Prin urmare,
Crénelio șterge, în loc să păstreze rânduri „anonimizate”.

*Domeniul acestei surse (verificat la 14/11/2026)*: avizul 05/2014 este **anterior RGPD** (adoptat în 2016, aplicabil
din 25 mai 2018) și nu figurează pe lista documentelor Grupului de lucru articolul 29 preluate de Comitetul european
pentru protecția datelor la prima sa ședință; rămâne totuși referința citată de CNIL în ghidul său privind duratele
de păstrare (iulie 2020) și în referențialul său privind gestiunea comercială (deliberarea nr. 2021-131, publicată în Journal officiel din 10.04.2022). Comitetul
a supus consultării ghiduri privind pseudonimizarea (01/2025, versiune finală neconfirmată la această dată).
Ștergerea aleasă de Crénelio nu depinde de aceste dezbateri: datele șterse nu mai trebuie calificate.

Pe durata păstrării, un deviz acceptat se află în **arhivare intermediară** (*archivage intermédiaire*) în sensul
CNIL: se păstrează doar datele care constată contractul (telefonul clientului este eliminat), devizul iese din lista
curentă a devizelor și se consultă doar la nevoie, de exemplu în caz de litigiu sau la cererea clientului (CNIL,
ghidul privind duratele de păstrare, iulie 2020, și referențialul « gestion des activités commerciales »).

## De ce zece ani pentru un deviz acceptat

- **Contract încheiat online de 120 € sau mai mult**: obligație. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » și « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). Suma este stabilită la 120 de euro (D213-1); durata, la zece ani de la
  încheiere sau de la executare, când aceasta este amânată (D213-2). Un deviz acceptat pe pagina sa online
  intră în acest caz.
- **Sub 120 €**: legea nu o impune în temeiul L213-1. Crénelio aplică **aceeași durată din
  prudență**: un deviz acceptat este un document care justifică factura dumneavoastră, iar Code de commerce prevede că
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » (L123-22). Acest
  text îi vizează în primul rând pe comercianți: expertul contabil vă va spune dacă se aplică situației dumneavoastră.

## Un contract fixat și dovada sa

Devizul este **fixat** (*figé*):

- **la trimitere**, mențiunile întreprinderii dumneavoastră (denumire, identitate legală, adresă, SIRET, asigurare,
  mediator, reclamații…) sunt copiate pe deviz: dacă este consultat peste opt ani, el prezintă mențiunile care
  figurau pe devizul trimis, chiar dacă între timp v-ați schimbat adresa sau mediatorul;
- **la acceptare**, Crénelio calculează o **amprentă** (hash, SHA-256) a tot ce constituie contractul și a urmei
  acordului. Recalculată la cerere, ea arată că nimic nu s-a schimbat de atunci: editorul devizului afișează
  « Contrat figé : oui, intact » (Contract fixat: da, intact).

Aceasta răspunde condițiilor înscrisului electronic: acesta « a la même force probante que l'écrit sur support papier,
sous réserve que puisse être dûment identifiée la personne dont il émane et qu'il soit établi et conservé dans des
conditions de nature à en garantir l'intégrité » (C. civ. 1366). Acceptarea online este o
**semnătură electronică simplă**: valabilă, dar fiabilitatea ei nu este prezumată, spre deosebire de o semnătură
calificată (C. civ. 1367; décret n° 2017-1416, art. 1); în caz de litigiu, dumneavoastră trebuie să dovediți
identificarea și integritatea, de aici această fixare. Devizele acceptate înainte de 14/11/2026 nu sunt fixate.

Fiecare deviz anunță totodată clientului aceste modalități de păstrare și de acces (C. civ. 1127-1, 4°).

Devizul păstrat cuprinde ce constată contractul: rândurile și prețurile dumneavoastră, identitatea și adresa clientului,
data și urma acordului său (adresa IP), răspunsurile sale (piese înlocuite, mandat de *débours*) și, dacă
este cazul, declarația sa de retragere.

## Când un client cere ștergerea

RGPD îi dă acest drept (articolul 17), cu excepția cazului în care păstrarea este « nécessaire […] pour respecter une
obligation légale » (articolul 17, alineatul 3, b). Concret, cu « Effacer le client » (Șterge clientul):

- **se șterg**: programarea, devizele sale neacceptate și jurnalul emailurilor acestora;
- **rămâne intact**: orice deviz **acceptat**, până la sfârșitul celor zece ani ai săi; programarea sa este păstrată,
  redusă la dată. Fereastra de confirmare
  vă arată care; spuneți-i clientului, citând aceste texte;
- **programare viitoare** neanulată: confirmarea vă avertizează că nu veți mai putea contacta
  clientul. Anulați mai întâi programarea dacă intervenția nu mai are loc.

Ștergerea este ireversibilă. Politica de confidențialitate a site-ului îi informează pe clienți despre aceste durate.

## Ce păstrați în altă parte

Crénelio nu înlocuiește programul dumneavoastră de facturare și nici contabilitatea: facturile, registrele și
documentele justificative de achiziție (*débours*) se păstrează după regulile care vă sunt proprii (vezi
[nota și factura](note-facture.md) și [memento-ul](rappels-artisan.md)).
