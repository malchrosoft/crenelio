# Modelul de informare privind dreptul de retragere (anexa la articolul R221-3)

*Traducere a versiunii franceze din 02/11/2026; versiunea franceză este cea care face fidă. Textele oficiale sunt citate în franceză.*

*Text oficial (Code de la consommation, Codul francez al consumului), versiunea în vigoare din 19 iunie 2026, modificată prin
decretul nr. 2026-3 din 5 ianuarie 2026, art. 7. Sursă: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
Reprodus la 02/11/2026 pornind de la textul furnizat de persoana care întreține proiectul.*

## Aplicarea în Crénelio (deviz (*devis*) = contract de servicii încheiat online)

`src/utils/withdrawalNotice.ts` produce textul completat astfel:

| Instrucțiune | Opțiune | Motiv |
|---|---|---|
| (1) | a) « de la conclusion du contrat. »; b) « où vous-même […] prend physiquement possession du bien. » dacă devizul conține o furnitură revândută | Contract de servicii: termenul curge de la acceptarea devizului. Furnitură revândută: contract asimilat unei vânzări (L221-1, II), termen de la intrarea în posesie (L221-18, 2°), data predării introdusă de profesionist |
| (2) | Întreprinderea: nume, adresă, telefon, email (`company_name`, `legal_adresse` sau sediul, `pro_phone`, `pro_email`) | Instrucțiunea (2) |
| (3) | Primul text (funcționalitatea de retragere online), cu adresa paginii devizului | Funcție obligatorie pentru un contract încheiat online |
| (4) | Omis | Vânzare: fără obiect, profesionistul propune să recupereze bunul ((5) a) |
| (5) | Serviciu: omis (piese cumpărate în numele clientului, *débours*). Vânzare: a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) textul despre depreciere | Opțiunea cea mai protectoare, reținută implicit la 05/11/2026; de făcut configurabilă dacă un profesionist preferă returnarea de către client |
| (6) | Textul pentru prestările de servicii (« la prestation de services ») | Executare anticipată la cerere expresă |

Paragraful « Effets de rétractation » (Efectele retragerii) este preluat ca atare, inclusiv mențiunea cheltuielilor de
livrare: modelul este reglementar și nu este reformulat.

## Textul anexei

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

*Explicație (traducere neoficială):* consumatorul se poate retrage din contract fără motiv în paisprezece zile de la ziua indicată la (1). Pentru aceasta, notifică profesionistul (2) printr-o declarație lipsită de ambiguitate (scrisoare, email); modelul de formular este facultativ (3). Este suficient ca comunicarea să fie transmisă înainte de expirarea termenului. În caz de retragere, profesionistul rambursează toate plățile primite, inclusiv cheltuielile de livrare standard, fără întârziere excesivă și cel târziu în paisprezece zile, prin același mijloc de plată, fără costuri pentru consumator (4). Punctele (5) și (6) se completează după caz.

### Instrucțiuni de urmat pentru completarea informațiilor

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

*Explicație (traducere neoficială):* (1) termenul curge de la încheierea contractului (servicii) sau de la intrarea în posesie a bunului, a ultimului bun, lot sau piesă, ori a primului bun (vânzări); (2) datele de contact ale profesionistului; (3) textul despre funcționalitatea de retragere online sau despre formularul completat pe site, cu confirmare de primire pe suport durabil; (4) amânarea rambursării până la primirea bunului, dacă profesionistul nu îl recuperează; (5) recuperarea sau returnarea bunului, cheltuielile de returnare și răspunderea pentru deprecierea bunului; (6) suma proporțională datorată dacă prestația a început la cerere în cursul termenului. Ultimele două alineate privesc intrarea în vigoare la 19 iunie 2026 și contractele în curs la această dată.
