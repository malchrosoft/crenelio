# Nota (factura) de prestație

*Traducere a versiunii franceze din 01/11/2026; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

*Ultima verificare: 01/11/2026. Sursă: fișa DGCCRF „Dépannage à domicile” (ordinul (*arrêté*) nr. 83-50/A din
3 octombrie 1983, modificat), vezi [surse](../sources.md).*

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

*Explicație (traducere neoficială):* pentru orice prestație de peste 25 de euro cu toate taxele (TTC), profesionistul remite un document (nota, *note*) care cuprinde: datele de contact ale prestatorului; data întocmirii notei; datele și locul executării; decontul detaliat, în cantitate și preț, al fiecărei prestații și al fiecărui produs furnizat sau vândut (de exemplu tariful orar și numărul de ore lucrate); suma totală fără taxe și cu toate taxele; numele clientului, cu excepția cazului în care acesta se opune. Nota se remite imediat ce prestația a fost efectuată și, în orice caz, înainte de plata prețului.

Sub 25 € TTC, nota se remite la cererea clientului.

## Textul oficial (verificat la 04/11/2026)

Ordinul nr. 83-50/A din 3 octombrie 1983, art. 1-4, și ordinul din 24 ianuarie 2017, art. 5:
[../fr/textes/arretes.md](../fr/textes/arretes.md). Precizări față de fișa DGCCRF:

- nota este obligatorie atunci când prețul este **mai mare sau egal cu 25 € TTC** (și nu « au-delà », peste); sub
  această sumă, la cererea clientului; pentru depanarea la domiciliu, la cerere **indiferent de sumă**,
  remisă **gratuit pe un suport durabil**;
- **decontul detaliat** devine facultativ dacă prestația a făcut obiectul unui deviz (*devis*) descriptiv și
  detaliat, acceptat și conform cu lucrările executate;
- nota se întocmește **în dublu exemplar**: originalul pentru client, duplicatul păstrat **doi ani** de
  prestator, clasat după dată.

## Mențiunile fiscale ale facturii (verificat la 04/11/2026)

Code général des impôts (Codul general fiscal francez, CGI), anexa II, art. 242 nonies A ([../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
versiunea decretului nr. 2024-1195. Pentru un profesionist:

- numele complet, **numărul de identificare** (SIREN) și adresa **profesionistului și a clientului său** (1°);
- data emiterii (6°) și un **număr unic, cronologic și continuu** (7°);
- pentru fiecare prestație: cantitatea, denumirea precisă, **prețul unitar fără taxe** și cota de TVA sau
  scutirea (8°); **natura operațiunilor**: exclusiv prestări de servicii, exclusiv
  livrări de bunuri, sau ambele (8° bis);
- data prestației, dacă diferă de data emiterii (10°); totalul fără taxe și TVA pe cote
  (11°); rabaturi și reduceri (9°);
- în regim de scutire de bază (*franchise en base*), mențiunile 2° (codul de TVA) și 12° (referința scutirii) pot fi
  omise (II), dar mențiunea « TVA non applicable, article 293 B du CGI » (TVA neaplicabilă, articolul 293 B din CGI) rămâne impusă de articolul
  293 E din CGI.

Mențiunile 1° (numărul clientului), 7° bis și 8° bis se aplică facturilor emise începând cu
1 septembrie 2026, iar de la **1 septembrie 2027** pentru microîntreprinderi și IMM-uri (calendarul
facturării electronice, NOTA articolului). Numărul cronologic și continuu este gestionat de programul
de facturare al profesionistului.

## În Crénelio

Factura se întocmește în instrumentul profesionistului (Item 22, componenta B); Crénelio nu o emite.

- Fișa **« Préparer la facture »** (Pregătește factura; programare încheiată): client, adresă, data și locul prestației,
  referința devizului acceptat, linii detaliate (cantitate, preț, TVA), totaluri și mențiunea de scutire,
  fiecare de copiat; ***débours*** (cheltuieli avansate în numele clientului) pe o linie distinctă, la **suma exactă din documentul justificativ** introdusă de
  profesionist cu referința sa, și alertă dacă bugetul mandatului este depășit.
- **Exporturi CSV**: clienți (import inițial) și intervenții încheiate într-o perioadă, *débours* separat.
- Fișa: natura operațiunilor (8° bis) de copiat, mementouri pentru mențiunile de la 1° și 7°.
- Mențiunile fiscale ale facturii (numerotare continuă, mențiuni de TVA, facturare electronică)
  țin de programul profesionistului.
