# Cayma hakkına ilişkin bilgilendirme modeli (R221-3 maddesinin eki)

*02/11/2026 tarihli Fransızca sürümün çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

*Resmî metin (Code de la consommation (Fransız Tüketici Kanunu)), 19 Haziran 2026'dan beri yürürlükteki
sürüm, 5 Ocak 2026 tarihli n° 2026-3 sayılı kararname (*décret*), md. 7 ile değiştirildi. Kaynak: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
02/11/2026'da bakımı yapan kişinin sağladığı metinden aktarılmıştır.*

## Crénelio'da uygulama (teklif = çevrimiçi kurulan hizmet sözleşmesi)

`src/utils/withdrawalNotice.ts` tamamlanmış metni şöyle üretir:

| Talimat | Tercih | Gerekçe |
|---|---|---|
| (1) | a) « de la conclusion du contrat. »; b) teklifte yeniden satılan malzeme varsa « où vous-même […] prend physiquement possession du bien. » | Hizmet sözleşmesi: süre teklifin kabulünden itibaren işler. Yeniden satılan malzeme: satışa eşdeğer sözleşme (L221-1, II), süre malın fiilen teslim alınmasından itibaren (L221-18, 2°), teslim tarihi profesyonelce girilir |
| (2) | İşletme: ad, adres, telefon, e-posta (`company_name`, `legal_adresse` ya da iş yeri, `pro_phone`, `pro_email`) | Talimat (2) |
| (3) | Birinci metin (çevrimiçi cayma işlevi), teklif sayfasının adresiyle | Çevrimiçi kurulan sözleşme için zorunlu işlev |
| (4) | Konmadı | Satış: konu dışı, profesyonel malı geri almayı önerir ((5) a) |
| (5) | Hizmet: konmadı (müşteri adına alınan parçalar, *débours*). Satış: a) « Nous récupérerons le bien », b) « Nous prendrons en charge les frais de renvoi du bien. », c) değer kaybına ilişkin metin | En koruyucu tercih, 05/11/2026'da varsayılan olarak seçildi; bir profesyonel malın müşterice geri gönderilmesini tercih ederse ayarlanabilir yapılacak |
| (6) | Hizmet sunumu metni (« la prestation de services ») | Açık talep üzerine erken ifa |

« Effets de rétractation » (Caymanın sonuçları) paragrafı, teslimat masraflarına ilişkin ibare dahil,
olduğu gibi alınmıştır: model yasal bir metindir ve yeniden yazılmaz.

*Açıklama (resmî olmayan çeviri), talimatlardaki alıntılar:* « de la conclusion du contrat. » =
« sözleşmenin kurulduğu [gün]. »; « où vous-même […] prend physiquement possession du bien. » = « sizin
[…] malı fiilen teslim aldığınız [gün]. »; « Nous récupérerons le bien » = « Malı biz geri alacağız »;
« Nous prendrons en charge les frais de renvoi du bien. » = « Malın geri gönderim masraflarını biz
üstleneceğiz. »; « la prestation de services » = « hizmet sunumu ».

## Ekin metni

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

*Açıklama (resmî olmayan çeviri):* Tüketici, gerekçe göstermeden on dört gün içinde sözleşmeden cayabilir;
süre (1)'de belirtilen günden on dört gün sonra dolar. Cayma, açık bir beyanla (örneğin posta veya
e-posta) (2)'deki kişiye bildirilir; örnek formun kullanılması zorunlu değildir (3). Bildirimin süre
dolmadan gönderilmesi yeterlidir. Caymada profesyonel, teslimat masrafları dahil (en ucuz standart
teslimat dışındaki ek masraflar hariç) alınan tüm ödemeleri gecikmeden ve en geç cayma kararını
öğrendiği günden itibaren on dört gün içinde, aksi açıkça kararlaştırılmadıkça aynı ödeme aracıyla ve
masrafsız olarak iade eder (4). (5) ve (6) talimatlara göre doldurulur.

### Bilgilerin doldurulması için talimatlar

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

*Açıklama (resmî olmayan çeviri):* (1) Süreyi başlatan gün: hizmet sözleşmesinde sözleşmenin kurulması;
satışta malın fiilen teslim alınması; ayrı teslim edilen birden çok malda son malın, parçalı teslimatta
son parçanın, düzenli teslimatta ilk malın teslim alınması. (2) Profesyonelin adı, coğrafi adresi,
telefonu ve e-postası. (3) Çevrimiçi cayma işlevi zorunluysa, işlevin adresini ve alındı belgesinin
(içerik, tarih ve saat) kalıcı veri saklayıcısında gönderileceğini belirten metin; formun sitede
doldurulması öneriliyorsa buna ilişkin metin. (4) Malı geri almayı önermeyen satıcı, malı ya da gönderim
kanıtını alana kadar iadeyi erteleyebilir. (5) Mal teslim edildiyse: a) malı kimin, hangi sürede geri
getireceği; b) geri gönderim masraflarını kimin üstleneceği (gerekirse tahmini tutar); c) müşterinin
yalnızca malın niteliğini ve işleyişini anlamak için gerekenden fazla kullanımdan doğan değer kaybından
sorumlu olduğu. (6) Hizmet süre içinde müşterinin talebiyle başladıysa, caymaya kadar verilen hizmetle
orantılı bir tutar ödenir. Bu hükümler 19 Haziran 2026'da yürürlüğe girer; o tarihte devam eden
sözleşmeler önceki hükümlere tabi kalır.
