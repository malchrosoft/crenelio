# Müşteri verilerinin saklanması ve silinmesi

*14/11/2026 tarihli Fransızca sürümün çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

*Son doğrulama: 14/11/2026. Hukuki dayanak: Code de la consommation, L213-1, D213-1 ve D213-2
(elektronik yolla kurulan sözleşmelerin saklanması); Code de commerce, L123-22 (destekleyici
belgeler); (AB) 2016/679 sayılı tüzük (GDPR), madde 5, 6 ve 17. Kelimesi kelimesine metinler:
[../fr/textes/code-consommation.md](../fr/textes/code-consommation.md), [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md),
[../fr/textes/droit-europeen.md](../fr/textes/droit-europeen.md). Yardım notudur, hukuki danışmanlık değildir.*

## Özet

| Veri | Saklama | Sonra |
|---|---|---|
| Randevu (ad, e-posta, telefon, adres, notlar) | Müdahaleden sonra ayarlanan süre (Compte ekranı, varsayılan 36 ay) | Otomatik olarak **silinir** |
| **Kabul edilmemiş** teklif (taslak, gönderilmiş, reddedilmiş, süresi dolmuş, iptal edilmiş) | Aynı süre | Otomatik olarak **silinir** |
| **Kabul edilmiş** teklif (sözleşme), sonradan cayılmış olsa bile | Müdahaleden (yoksa kabulden) sonra **on yıl**, kabulün iziyle birlikte; müdahale tamamlandığında **arşivlenir** (Devis ekranının « Archivés » filtresi) | Randevusuyla birlikte otomatik olarak **silinir** |

Neden “anonimleştirmek” yerine silmek: tarihi, hizmeti, tutarı ve belediyesiyle (*commune*) saklanan bir satır,
örneğin bir faturayla karşılaştırıldığında müşteriyi hâlâ işaret edebilir. Adı kaldırmak, bir veriyi anonim hâle
getirmeye yetmez: artık bir kişiyi ayırt etmek, verilerini ilişkilendirmek veya onun hakkında bir bilgi çıkarmak
mümkün olmamalıdır (Madde 29 Çalışma Grubu, anonimleştirme teknikleri hakkında 05/2014 sayılı görüş, s. 9 ve 10).
Bu nedenle Crénelio, “anonimleştirilmiş” satırlar saklamak yerine siler.

*Bu kaynağın kapsamı (14/11/2026 tarihinde doğrulandı)*: 05/2014 sayılı görüş **GDPR'den öncedir** (2016'da kabul
edilmiş, 25 Mayıs 2018'den beri uygulanmaktadır) ve Avrupa Veri Koruma Kurulu'nun ilk oturumunda benimsediği Madde 29
Çalışma Grubu belgeleri listesinde yer almaz; yine de CNIL'in saklama süreleri rehberinde (Temmuz 2020) ve ticari
yönetim referans belgesinde (Ocak 2022'de yayımlanmış) atıfta bulunduğu kaynak olmaya devam etmektedir. Kurul, takma
adlandırma (pseudonymisation) hakkındaki yönergeleri kamuoyu görüşüne sunmuştur (01/2025, nihai sürümü bu tarih
itibarıyla doğrulanmamıştır). Crénelio'nun benimsediği silme bu tartışmalara bağlı değildir: silinmiş bir verinin
artık nitelendirilmesi gerekmez.

Saklandığı süre boyunca kabul edilmiş bir teklif, CNIL'in tanımladığı anlamda **ara arşivlemededir** (*archivage
intermédiaire*): yalnızca sözleşmeyi belgeleyen veriler saklanır (müşterinin telefonu kaldırılır), teklif güncel
teklif listesinden çıkar ve yalnızca gerektiğinde, örneğin bir uyuşmazlıkta veya müşterinin talebi üzerine
görüntülenir (CNIL, saklama süreleri rehberi, Temmuz 2020, ve « gestion des activités commerciales » referans
belgesi).

## Kabul edilmiş teklif için neden on yıl

- **Çevrimiçi kurulan 120 € veya üzeri sözleşme**: yükümlülük. « Le contractant professionnel assure la
  conservation de l'écrit qui le constate » ve « en garantit à tout moment l'accès à son cocontractant »
  (C. consom. L213-1). Tutar 120 avro olarak belirlenmiştir (D213-1); süre, kurulmadan, ifa ertelenmişse
  ifadan itibaren on yıldır (D213-2). Çevrimiçi sayfasından kabul edilen bir teklif bu kapsama girer.
- **120 €'nun altında**: kanun bunu L213-1 kapsamında zorunlu kılmaz. Crénelio **ihtiyaten aynı süreyi**
  uygular: kabul edilmiş bir teklif faturanızı destekleyen bir belgedir ve Code de commerce
  « les documents comptables et les pièces justificatives sont conservés pendant dix ans » hükmünü öngörür (L123-22). Bu
  metin öncelikle tacirleri hedefler: durumunuza uygulanıp uygulanmadığını mali müşaviriniz söyleyecektir.

Saklanan teklif, sözleşmeyi belgeleyen her şeyi içerir: kalemleriniz ve fiyatlarınız, müşterinin kimliği ve adresi,
kabulünün tarihi ve izi (IP adresi), yanıtları (değiştirilen parçalar, *débours* vekâleti) ve gerekiyorsa
cayma beyanı.

## Bir müşteri silinmesini istediğinde

GDPR ona bu hakkı tanır (madde 17); ancak saklama « nécessaire […] pour respecter une
obligation légale » ise bu hak uygulanmaz (madde 17, paragraf 3, b). Somut olarak, « Effacer le client » (Müşteriyi sil) ile:

- **silinir**: randevu, kabul edilmemiş teklifleri ve bunların e-posta günlüğü;
- **olduğu gibi kalır**: **kabul edilmiş** her teklif, on yılının sonuna kadar; randevusu yalnızca tarihine
  indirgenerek saklanır. Onay penceresi
  hangileri olduğunu gösterir; bunu müşteriye bu metinlere atıfta bulunarak söyleyin;
- iptal edilmemiş **gelecek randevu**: onay, müşteriye artık ulaşamayacağınız konusunda sizi uyarır.
  Müdahale artık yapılmayacaksa önce randevuyu iptal edin.

Silme geri alınamaz. Sitenin gizlilik politikası müşterileri bu süreler hakkında bilgilendirir.

## Başka yerde sakladıklarınız

Crénelio fatura yazılımınızın veya muhasebenizin yerini almaz: faturalarınız, defterleriniz ve
satın alma belgeleriniz (*débours*) size özgü kurallara göre saklanır (bkz.
[makbuz ve fatura](note-facture.md) ve [hatırlatma notu](rappels-artisan.md)).
