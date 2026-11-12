# Cayma: uzaktan ya da müşterinin evinde kurulan sözleşme

*04/11/2026 tarihli Fransızca sürümün çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

*Son kontrol: 04/11/2026 (resmî metinler: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md)). Kaynaklar: DGCCRF « Dépannage à domicile » fişi (resmî); INC (Ulusal Tüketim Enstitüsü);
L221-25 hakkında ikincil kaynaklar. Code de la consommation (Fransız Tüketici Kanunu) maddeleri
birleştirilmiş sürümlerinden yeniden okunmalıdır (bkz. [kaynaklar](../sources.md)).*

## İlke

**Çevrimiçi** kabul edilen (uzaktan sözleşme) ya da müşterinin **evinde imzalanan** (iş yeri dışında
sözleşme, *contrat hors établissement*) bir fiyat teklifi (*devis*), bireysel müşteriye **14 günlük cayma
süresi** (*délai de rétractation*) tanır (C. consom. L221-18). Profesyonel, sözleşmeden önce bunu
müşteriye bildirmeli ve şunu teslim etmelidir:

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

*Açıklama (resmî olmayan çeviri):* Taraflarca imzalanmış kâğıt üzerinde ya da tüketicinin onayıyla
kalıcı veri saklayıcısında sözleşmenin bir nüshası; buna örnek cayma formu eklenmeli ve sözleşme, hükümsüzlük
yaptırımı altında, L. 111-1 ve L. 111-2 maddelerindeki bilgileri içermelidir.

Cayma hakkına ilişkin bilgi eksikse süre on iki ay uzar (L221-20, doğrulandı).

## İstisna: acil durum

« travaux d'entretien ou de réparation à réaliser en urgence au domicile du consommateur et expressément
sollicités par lui » (tüketicinin evinde acilen yapılacak ve onun tarafından açıkça istenen bakım veya
onarım işleri) için cayma hakkı yoktur (L221-28, 8°, INC'nin aktardığı), **acil duruma yanıt vermek için
kesinlikle gerekli yedek parçalar ve işlerle sınırlı olarak** (DGCCRF fişi). Acil durum, « la nécessité de
faire cesser un danger pour la sécurité des personnes ou l'intégrité des locaux » (kişilerin güvenliği veya
mekânın bütünlüğü için bir tehlikeyi durdurma gerekliliği) olarak anlaşılır.

Yerinde önerilen her **ek** iş 14 günlük süreye tabi kalır.

## Süre bitmeden işe başlamak

L221-25'e göre (yukarıdaki resmî metin): profesyonel, süre bitmeden ancak müşterinin **açık talebi**
üzerine başlayabilir; müşteri sonra cayarsa, o ana kadar verilen hizmetle orantılı bir tutar öder. Açık
talep alınmamışsa hiçbir şey borçlanılmaz.

## Resmî metinler ne diyor (04/11/2026'da kontrol edildi)

Tam metin: [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Tanımlar** (L221-1): **uzaktan** sözleşme = kurulana kadar yalnızca uzaktan iletişim araçlarıyla,
  tarafların aynı anda fiziken bir arada olmadan kurulan sözleşme; **iş yeri dışında** sözleşme =
  olağan faaliyet yeri dışında, tarafların aynı anda fiziken bir arada olduğu sırada, **tüketicinin
  talebi üzerine olsa bile** kurulan (müşterinin evinde imzalanan teklif) ya da bu yer dışında yapılan
  kişisel bir talepten hemen sonra uzaktan kurulan sözleşme. Bir malın mülkiyetini devreden **ve** bir
  hizmet sağlayan sözleşme **satışa eşdeğer sayılır** (II): « fourniture revendue » (yeniden satılan
  malzeme) satırları için dikkat (süre malın tesliminden itibaren işler).
- **Süre** (L221-18): hizmet sunumunda **sözleşmenin kurulmasından** itibaren on dört gün. **Hesaplama**
  (L221-19): sözleşmenin kurulduğu gün sayılmaz; süre son günün bitiminde dolar; cumartesi, pazar ya
  da resmî tatil veya çalışılmayan bir güne denk gelirse izleyen ilk iş gününe kadar uzar.
  → `Quote::withdrawalDeadline` (yasal resmî tatiller, Paskalya hesaplanır).
- **Eksik bilgi** (L221-20): süre on iki ay uzar; bilgi bu arada verilirse, bilginin alınmasından
  itibaren on dört güne iner.
- **Erken ifa** (L221-25): açık talep uzaktan « par tout moyen » (her türlü yolla), iş yeri dışında
  « sur papier ou sur support durable » (kâğıt üzerinde ya da kalıcı veri saklayıcısında) alınır;
  profesyonel, tam ifadan sonra cayma hakkının kalmayacağını **tüketiciden kabul etmesini ister**. Açık
  talep alınmamışsa ya da L221-5'in 9° bendindeki bilgi verilmemişse **hiçbir tutar borçlanılmaz**.
  → kutucuğun metni tamamlandı (sayfa, yazdırılabilir sürüm, onay e-postası).
- **İstisnalar** (L221-28): 1° süre bitmeden açık onay ve hakkın kaybını kabulle tamamen ifa edilmiş
  hizmet → `Quote::canWithdraw`, teklifin randevusu « terminé » (tamamlandı) olduğunda ve erken ifa
  istenmiş olduğunda caymayı reddeder; 8° açıkça istenen acil işler, kesinlikle gerekli olanla sınırlı.
- **Bilgilendirme** (L221-5, 7° ve 10°): koşullar, süre, kullanım şekli, örnek form ve cayma
  işlevinin yeri; hak yoksa (acil durum) tüketicinin bu haktan yararlanmadığı bilgisi.
- **İş yeri dışında** (L221-9): sözleşmenin tarihli nüshası, imzalı kâğıt ya da kalıcı veri saklayıcısı,
  L221-5'in tüm bilgileriyle ve **örnek form eklenmiş olarak**. (L221-10): sözleşmenin kurulmasından
  itibaren **yedi gün dolmadan hiçbir ödeme ya da karşılık alınamaz**, acil işler hariç (4°). Hesaplama (12/11/2026'da doğrulandı, C. proc. civ. 641 ve 642, 1182/71 sayılı tüzük md. 3, birbiriyle uyumlu): onay günü
  sayılmaz, süre yedinci günün saat 24'ünde dolar; cumartesi, pazar veya resmî tatile denk gelirse ilk iş gününe uzar;
  Crénelio ilk olası ödeme gününü « Préparer la facture » (Faturayı hazırla) ekranının başında gösterir (anakara
  resmî tatilleri Jours fériés API'sinden okunur). **Müşteri evindeki ziyaretinizin hemen ardından çevrimiçi** kabul edilen
  bir teklif de iş yeri dışında kurulan sözleşmedir (L221-1, 2°, b).
- **Çevrimiçi işlev** (D221-5, n° 2026-3 sayılı kararname ile oluşturuldu): « renoncer au contrat ici »
  (sözleşmeden burada vazgeç) ve « confirmer la rétractation » (caymayı onayla) ifadeleri; beyan (ad ve
  soyad, sözleşme, alındı belgesi için elektronik iletişim aracı); içeriği, tarihi ve saati yineleyen
  alındı belgesi. Uygulama buna uygundur.
- **Örnek form** (R221-1 maddesinin eki, n° 2022-424 sayılı kararname): yazdırılabilir sürümde kelimesi
  kelimesine verilir.

## Hakkın kullanılması: L221-21 maddesi (19 Haziran 2026 sürümü)

*Resmî metin, 5 Ocak 2026 tarihli ve n° 2026-2 sayılı ordonnance'tan (hükümet kararnamesi) gelen
yazım (md. 26: 19 Haziran 2026'da yürürlükte; bu tarihte devam eden sözleşmeler önceki metinlere tabi).
02/11/2026'da bakımı yapan kişinin sağladığı metinden aktarılmıştır.*

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

*Açıklama (resmî olmayan çeviri):* Tüketici, L. 221-18'deki süre dolmadan, cayma formunu ya da cayma
iradesini açıkça ifade eden başka bir beyanı göndererek cayma hakkını kullanır. Profesyonel, formun veya
beyanın kendi internet sitesinde çevrimiçi doldurulup gönderilmesine izin verebilir; bu durumda gecikmeden
kalıcı veri saklayıcısında bir alındı belgesi iletir. Çevrimiçi bir arayüzle uzaktan kurulan
sözleşmelerde profesyonel, tüketiciye ücretsiz bir cayma işlevi sunar. Bu işlevin sunuluş ve kullanım
şeklini, kolay, doğrudan ve sürekli erişimi güvenceye alacak biçimde bir kararname belirler.

**Crénelio'daki karşılığı**

| L221-21'in gereği | Uygulama |
|---|---|
| Form ya da açık herhangi bir beyan | Yazdırılabilir cayma formu; işletmenin e-postası ve adresi bilgilendirme modelinde yer alır |
| Süre dolmadan gönderim | Çevrimiçi cayma `withdrawal_until` dahil kabul edilir; beyanın tarihi kaydedilir |
| Gecikmeden, kalıcı veri saklayıcısında alındı belgesi | Onaydan hemen sonra gönderilen e-posta (`QuoteNotifier::sendWithdrawal`), günlüğe kaydedilir |
| Çevrimiçi arayüzle kurulan sözleşme için ücretsiz işlev | Teklif sayfasında « Renoncer au contrat ici » (Sözleşmeden burada vazgeç) düğmesi, hesap ve ücret olmadan |
| Kolay, doğrudan ve sürekli erişim (kararname) | Onay için kullanılanla aynı bağlantı (e-posta), düğme süre boyunca görünür |

## Çevrimiçi cayma işlevi (19 Haziran 2026'dan beri)

5 Ocak 2026 tarihli n° 2026-2 sayılı ordonnance ve n° 2026-3 sayılı kararname ((UE) 2023/2673 sayılı
direktifin iç hukuka aktarılması), **çevrimiçi bir arayüz üzerinden** kurulan her uzaktan sözleşme için
ücretsiz bir cayma işlevini zorunlu kılar (**D221-5 maddesiyle doğrulandı**, metin
[../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) içinde):

- « **renoncer au contrat ici** » sözcükleriyle ya da benzer, açık bir ifadeyle belirtilir;
- cayma süresi **boyunca** görünür, doğrudan ve kolayca erişilebilir;
- tüketici burada **adını ve soyadını**, ilgili **sözleşmeyi** ve alındı belgesini alacağı **elektronik
  aracı** belirtir ya da onaylar, ardından « **confirmer la rétractation** » ile doğrular;
- makul bir süre içinde, beyanın içeriğini ve gönderildiği **tarih ve saati** yineleyen, kalıcı veri
  saklayıcısında **alındı belgesi**;
- sözleşme öncesi bilgilendirme bu işlevin nerede olduğunu belirtir;
- yaptırım: 15 000 €'ya (gerçek kişi) ya da 75 000 €'ya (tüzel kişi) kadar idari para cezası.

Bilgilendirme modeli (R221-3 maddesinin eki) buna göre değiştirildi (19 Haziran 2026'da yürürlükteki
sürüm): resmî metin ve uygulama tercihleri [retractation-modele.md](retractation-modele.md) içinde.

## Crénelio'da

- Teklifte « intervention urgente » (acil müdahale) kutucuğu: ne süre ne cayma işlevi.
- Aksi hâlde müşteri, kabul etmek için hakkını öğrendiğini onaylar; erken ifa isteyebilir (ayrı
  kutucuk); sürenin bitişi kaydedilir (`withdrawal_until`).
- Teklif sayfası (`/devis/:token`): onaydan önce süre ve işlevin yeri hakkında bilgi; onaydan sonra
  « Renoncer au contrat ici » düğmesi, beyan (ad, alındı belgesi e-postası, hatırlatılan sözleşme),
  « Confirmer la rétractation » (Caymayı onayla) düğmesi; `withdrawn` durumu, beyan saklanır
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Müşteriye e-postayla alındı belgesi (içerik, tarih ve saat) ve profesyonele bildirim (14 gün içinde
  geri ödeme); onay e-postası son tarihi ve işlevin yerini hatırlatır.
- Zaman damgaları: MySQL bağlantısı uygulamanın saat dilimine ayarlıdır.
- Teklif sayfası: yasal bilgilendirme modeli kelimesi kelimesine gösterilir (`src/utils/withdrawalNotice.ts`).
- **Önceden doldurulmuş çevrimiçi form** (`/devis/:token/retractation`): R221-1 ekindeki model kelimesi
  kelimesine, cayma işleviyle iletilir; **doldurulabilir PDF** onay e-postasına eklenir; doğrulanan beyan
  PDF olarak indirilebilir ve alındı belgelerine eklenir. Müşteri bu kolaylıktan haberdar edilir
  (`ONLINE_FORM_NOTICE` metni, yasal modelin dışında).
- **Sözleşmeden önce** (L221-5, 7°, 10/11/2026): standart form (doldurulabilir PDF, onay tarihi ve çevrimiçi bağlantı olmadan, çünkü çevrimiçi işlev ancak onaydan sonra kullanılabilir) acil durumlar dışında teklifin gönderildiği e-postaya eklenir; yazdırılabilir sürümde de yer almaya devam eder.
- **Sözleşme nüshası** (L221-9): müşteriye onayından sonra gönderilen e-posta sözleşmenin tüm
  bilgilerini, bilgilendirme modelini ve örnek formu içerir (`LegalTexts.php`).
- Yazdırılabilir sürümler (`/devis/:token/imprimer`): teklifte bilgilendirme modeli; R221-1 maddesinin
  ekindeki örnek form, **kelimesi kelimesine** (04/11/2026'da doğrulandı).
