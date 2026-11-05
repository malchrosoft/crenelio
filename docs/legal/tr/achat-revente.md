# Malzemelerin al-satı (*achat-revente*, yeniden satılan parçalar)

*01/11/2026 tarihli Fransızca sürümün çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

*Son kontrol: 01/11/2026. Kaynaklar: Portail auto-entrepreneur (*débours* ve yeniden faturalanan
masraflar, özet); mikro girişimci rejiminin kuralları, herhangi bir etkinleştirmeden önce resmî
sitelerde (URSSAF, tek başvuru noktası *guichet unique*) yeniden okunmalıdır. Bkz. [kaynaklar](../sources.md).*

## Nedir

Profesyonel parçayı **kendi adına** alır, sonra müşteriye (kâr marjıyla ya da marjsız) yeniden
faturalar. Bu, hizmet sunumundan ayrı bir **mal satışıdır**. Parçanın müşteri adına ve hesabına alındığı
[*débours*](debours.md) (müşteri adına yapılan harcama) ile karıştırılmamalıdır.

## Şahıs girişimcisi için sonuçları (mikro işletme)

- Yeniden satılan tutar **ciroya girer** (Portail auto-entrepreneur bu nedenle bu yöntemi önermez:
  primleri artırır).
- Mal satışının **kendi ciro eşikleri** ve **kendi prim oranı** vardır; hizmet sunumuyla birlikte
  faaliyet **karma** olur ve iki ciro ayrı izlenir (yürürlükteki tutarlar: Item 39, her yıl kontrol edilmeli).
- Satış faaliyeti, henüz değilse, (tek başvuru noktasına) **beyan edilmelidir**.
- Profesyonel **satıcı** olur: kendi adına alış faturası, parça için müşteriye karşı yasal garantiler,
  olası stok.

## Takılan parçaların KDV'si (KDV mükellefi profesyonel)

BOI-TVA-BASE-10-20-40-20, § 140 ve 150 ([../fr/textes/bofip.md](../fr/textes/bofip.md)): **malzemeler**
(*fournitures*, dönüştürülen ya da tüketilen maddeler) hizmetin fiyatını izler; **yedek parçalar**
(*pièces détachées*, yalnızca takılan standart nesneler) **kendi oranındaki bir satıştır**; değerleri
montajınkinden düşükse ya da uyarlanmışlarsa hariç. Kabul edilen basitleştirme: toplam değerleri
**toplam maliyetin %50'sini aşmıyorsa** parçalar ve malzemeler hizmetin rejimini izler; aksi hâlde
parçaların satışı faturada **ayrı olarak** gösterilir.

Crénelio'da (KDV'li teklif): düzenleyici, « fourniture revendue » (yeniden satılan malzeme)
satırlarının KDV hariç toplam maliyet içindeki payını hesaplar (*débours* hariç, ciro dışı) ve
satırların altında hatırlatır: %50'ye kadar hizmetle aynı oran; üzerinde, parçaların kendi oranı, ayrı
satırlarda (teklif bunu zaten yapıyor). Yeniden satılan malzeme içeren bir teklif **satışa** eşdeğer
sayılır (Code de la consommation (Fransız Tüketici Kanunu), C. consom. L221-1, II): cayma süresi
parçaların müşteriye tesliminden itibaren işler (L221-18, 2°), bu tarih kabul edilen teklife girilir;
bkz. [retractation-modele.md](retractation-modele.md).

KDV kontrolü **bilgi amaçlıdır**: karşılaştırma ilke olarak parça parça yapılır ve bir parçanın
uyarlanıp uyarlanmadığını yalnızca profesyonel bilir. Oran onun tercihidir, muhasebecisiyle doğrulanmalıdır.

## Şirket

Yeniden satış **şirketin faaliyet konusuna** (*objet social*) girmelidir; parçalar şirketin KDV'siyle
faturalanır.

## Crénelio'da

- « fourniture revendue » satırı, `quote_allow_supply` etkinleştirilmedikçe API tarafından reddedilir.
- Etkinleştirme, hukuki biçime (`legal_form`) uygun bir **uyarının** açıkça kabul edilmesine bağlıdır;
  varsayılan öneri: *débours*.
