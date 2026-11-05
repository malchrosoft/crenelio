# Հրաժարման իրավունքի մասին տեղեկատվական ձևանմուշ (R221-3 հոդվածի հավելված)

*Թարգմանություն 02/11/2026 ֆրանսերեն տարբերակից։ Վավերական է ֆրանսերեն տարբերակը։ Պաշտոնական տեքստերը մեջբերված են ֆրանսերենով։*

*Պաշտոնական տեքստ (Code de la consommation՝ Սպառողների իրավունքների օրենսգիրք), 2026 թ. հունիսի 19-ից
գործող տարբերակ, փոփոխված 2026 թ. հունվարի 5-ի n° 2026-3 որոշմամբ (*décret*), հոդվ. 7։ Աղբյուր՝
[Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407)։ Վերարտադրված է
02/11/2026-ին՝ սպասարկողի տրամադրած տեքստից։*

## Կիրառումը Crénelio-ում (նախահաշիվ՝ *devis* = առցանց կնքված ծառայության պայմանագիր)

`src/utils/withdrawalNotice.ts`-ը լրացված տեքստը ստեղծում է այսպես՝

| Հրահանգ | Ընտրություն | Պատճառ |
|---|---|---|
| (1) | a) « de la conclusion du contrat. » ; b) « où vous-même […] prend physiquement possession du bien. »՝ եթե նախահաշիվը պարունակում է վերավաճառվող նյութ | Ծառայության պայմանագիր՝ ժամկետը սկսվում է նախահաշվի ընդունումից։ Վերավաճառվող նյութ՝ պայմանագիրը հավասարեցվում է վաճառքի (L221-1, II), ժամկետը՝ տիրապետումը ստանալուց սկսած (L221-18, 2°), հանձնման ամսաթիվը մուտքագրում է մասնագետը |
| (2) | Ձեռնարկություն՝ անուն, հասցե, հեռախոս, էլ. հասցե (`company_name`, `legal_adresse` կամ տարածք, `pro_phone`, `pro_email`) | Հրահանգ (2) |
| (3) | Առաջին տեքստը (առցանց հրաժարման գործառույթ)՝ նախահաշվի էջի հասցեով | Պարտադիր գործառույթ առցանց կնքված պայմանագրի համար |
| (4) | Բաց է թողնված | Վաճառք՝ կիրառելի չէ, մասնագետն առաջարկում է ետ վերցնել գույքը ((5) a) |
| (5) | Ծառայություն՝ բաց է թողնված (հաճախորդի անունով գնված մասեր, *débours*)։ Վաճառք՝ a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) արժեզրկման մասին տեքստ | Առավել պաշտպանող ընտրությունը, լռելյայն ընտրված 05/11/2026-ին. դարձնել կարգավորելի, եթե մասնագետը նախընտրում է, որ հաճախորդը վերադարձնի |
| (6) | Ծառայությունների մատուցման տեքստ (« la prestation de services ») | Վաղաժամ կատարում՝ հստակ խնդրանքով |

Բացատրություն (ոչ պաշտոնական թարգմանություն)՝ (1) a) «պայմանագրի կնքման [օրվանից]». b) «երբ դուք կամ
ձեր նշանակած երրորդ անձը ֆիզիկապես տիրապետում է գույքին». (5) a) «Մենք ետ կվերցնենք գույքը», b) «Մենք
կհոգանք գույքի վերադարձման ծախսերը». (6) «ծառայությունների մատուցումը»։

« Effets de rétractation » (Հրաժարման հետևանքները) պարբերությունը վերարտադրված է անփոփոխ, ներառյալ
առաքման ծախսերի նշումը. ձևանմուշը կարգավորող է և չի վերաձևակերպվում։

## Հավելվածի տեքստը

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

Բացատրություն (ոչ պաշտոնական թարգմանություն)՝ սպառողն իրավունք ունի հրաժարվել պայմանագրից առանց պատճառ
նշելու՝ տասնչորս օրվա ընթացքում, որը հաշվվում է (1)-ում նշված օրվանից։ Հրաժարվելու համար նա պետք է
մասնագետին (2) տեղեկացնի միանշանակ հայտարարությամբ (օրինակ՝ փոստով նամակ կամ էլ. նամակ). ձևանմուշ
ձևաթղթի օգտագործումը պարտադիր չէ (3)։ Բավական է հաղորդումն ուղարկել մինչև ժամկետի լրանալը։ Հրաժարման
դեպքում մասնագետը վերադարձնում է ստացված բոլոր վճարումները (ներառյալ առաքման ծախսերը, բացառությամբ
հաճախորդի ընտրած ավելի թանկ առաքման լրացուցիչ ծախսերի)՝ առանց անհարկի ուշացման և ամենաուշը տասնչորս օրվա
ընթացքում՝ հրաժարման մասին տեղեկանալու օրվանից, նույն վճարման միջոցով, եթե այլ բան հստակ համաձայնեցված
չէ, և առանց ծախսի հաճախորդի համար (4)։

### Տեղեկությունները լրացնելու հրահանգներ

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

Բացատրություն (ոչ պաշտոնական թարգմանություն)՝
- (1)՝ ընտրել ժամկետի սկիզբը՝ ծառայության (կամ չփաթեթավորված ջրի, գազի, էլեկտրաէներգիայի, քաղաքային
  ջեռուցման, նյութական կրիչի վրա չտրամադրվող թվային բովանդակության) պայմանագրի դեպքում՝ պայմանագրի կնքման
  օրը. վաճառքի դեպքում՝ այն օրը, երբ հաճախորդը (կամ նրա նշանակած երրորդ անձը, բացի փոխադրողից) ֆիզիկապես
  տիրապետում է գույքին. մի քանի գույքի, մի քանի խմբաքանակի կամ պարբերական առաքման դեպքում՝ համապատասխանաբար
  վերջին գույքը, վերջին խմբաքանակը կամ առաջին գույքը ստանալու օրը։
- (2)՝ նշել մասնագետի անունը, աշխարհագրական հասցեն, հեռախոսահամարը և էլ. հասցեն։
- (3)՝ եթե պարտադիր է առցանց հրաժարման գործառույթը, ավելացնել տեքստ, որը նշում է, թե որտեղ է այն, և որ
  ստացման հաստատումը (բովանդակությամբ, ամսաթվով և ժամով) կուղարկվի երկարատև կրիչի վրա. եթե կայքում
  առաջարկվում է ձևաթուղթը լրացնել և ուղարկել էլեկտրոնային եղանակով՝ համապատասխան տեքստը։
- (4)՝ վաճառքի դեպքում, եթե մասնագետը չի առաջարկում ետ վերցնել գույքը, նա կարող է հետաձգել վերադարձը մինչև
  գույքը ստանալը կամ առաքման ապացույցը ստանալը։
- (5)՝ եթե հաճախորդը գույք է ստացել՝ a) ով է ետ վերցնում կամ վերադարձնում գույքը և ինչ ժամկետում (14 օր),
  b) ով է կրում վերադարձման ծախսերը (կամ դրանց գնահատված գումարը), c) հաճախորդը պատասխանատու է միայն
  գույքի արժեզրկման համար, որն առաջացել է դրա բնույթը, բնութագրերը և աշխատունակությունը ստուգելու համար
  անհրաժեշտից դուրս գործողություններից։
- (6)՝ ծառայության դեպքում, եթե հաճախորդը խնդրել է սկսել հրաժարման ժամկետի ընթացքում, նա վճարում է մինչև
  հրաժարման մասին տեղեկացնելը մատուցվածին համամասնական գումար։
- Այս դրույթներն ուժի մեջ են 2026 թ. հունիսի 19-ից. այդ օրը գործող պայմանագրերը կարգավորվում են նախորդ
  խմբագրությամբ։
