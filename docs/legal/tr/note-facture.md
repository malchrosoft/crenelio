# Hizmet notu (*note*, fatura)

*01/11/2026 tarihli Fransızca sürümün çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

*Son kontrol: 01/11/2026. Kaynak: DGCCRF « Dépannage à domicile » (Evde arıza onarımı) fişi (3 Ekim 1983
tarihli, değiştirilmiş n° 83-50/A sayılı bakanlık kararı (*arrêté*)), bkz. [kaynaklar](../sources.md).*

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

*Açıklama (resmî olmayan çeviri):* 25 € KDV dahil tutarı aşan her hizmet için profesyonel şu bilgileri
içeren bir belge vermek zorundadır: hizmet verenin bilgileri; notun düzenlenme tarihi; hizmetin
yapıldığı tarihler ve yer; sağlanan veya satılan her hizmet ve ürünün miktar ve fiyat olarak ayrıntılı
dökümü (örn. saat ücreti ve çalışılan saat sayısı); KDV hariç ve KDV dahil toplam tutar; itiraz etmedikçe
müşterinin adı. Not, hizmet verilir verilmez ve her durumda bedel ödenmeden önce teslim edilmelidir.

25 € KDV dahil tutarın altında not, müşterinin talebi üzerine verilir.

## Resmî metin (04/11/2026'da kontrol edildi)

3 Ekim 1983 tarihli n° 83-50/A sayılı karar, md. 1-4, ve 24 Ocak 2017 tarihli karar, md. 5:
[../fr/textes/arretes.md](../fr/textes/arretes.md). DGCCRF fişine göre ayrıntılar:

- fiyat **25 € KDV dahil veya üzerinde** olduğunda not zorunludur (« au-delà », yani « aşan » değil);
  altında, müşterinin talebi üzerine; evde arıza onarımında, talep üzerine **tutar ne olursa olsun**,
  **ücretsiz ve kalıcı veri saklayıcısında** verilir;
- hizmet, ayrıntılı ve açıklayıcı, kabul edilmiş ve yapılan işlere uygun bir teklife konu olduysa
  **ayrıntılı döküm** isteğe bağlı olur;
- not **iki nüsha** düzenlenir: asıl müşteriye, ikinci nüsha hizmet verence **iki yıl** tarih sırasıyla saklanır.

## Faturadaki vergi bilgileri (04/11/2026'da kontrol edildi)

Code général des impôts (Fransız Genel Vergi Kanunu, CGI), ek II, md. 242 nonies A
([../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md)),
n° 2024-1195 sayılı kararname sürümü. Bir profesyonel için:

- **profesyonelin ve müşterisinin** tam adı, **kimlik numarası** (SIREN) ve adresi (1°);
- düzenleme tarihi (6°) ve **benzersiz, kronolojik ve kesintisiz numara** (7°);
- her hizmet için: miktar, açık adı, **KDV hariç birim fiyat** ve KDV oranı ya da muafiyet (8°);
  **işlemlerin niteliği**: yalnızca hizmet sunumu, yalnızca mal teslimi ya da ikisi birden (8° bis);
- düzenleme tarihinden farklıysa hizmet tarihi (10°); KDV hariç toplam ve orana göre KDV (11°);
  indirimler ve iskontolar (9°);
- temel muafiyette (*franchise en base*), 2° (KDV numarası) ve 12° (muafiyetin dayanağı) bilgileri
  konmayabilir (II), ancak « TVA non applicable, article 293 B du CGI » (KDV uygulanmaz, CGI madde 293 B)
  ibaresi CGI'nin 293 E maddesince zorunlu tutulur.

1° (müşteri numarası), 7° bis ve 8° bis bilgileri 1 Eylül 2026'dan itibaren düzenlenen faturalara,
mikro işletmeler ve KOBİ'ler için ise **1 Eylül 2027'den** itibaren uygulanır (elektronik faturalama
takvimi, maddenin NOTA'sı). Kronolojik ve kesintisiz numara, profesyonelin faturalama yazılımınca yönetilir.

## Crénelio'da

Fatura profesyonelin kendi aracında düzenlenir (Item 22, B bölümü); Crénelio fatura düzenlemez.

- **« Préparer la facture »** (Faturayı hazırla) fişi (tamamlanmış randevu): müşteri, adres, hizmetin
  tarihi ve yeri, kabul edilen teklifin referansı, ayrıntılı satırlar (miktar, fiyat, KDV), toplamlar ve
  muafiyet ibaresi, her biri kopyalanabilir; **débours** ayrı bir satırda, profesyonelin girdiği
  **belgenin tam tutarıyla** ve referansıyla, vekâlet bütçesi aşılırsa uyarı.
- **CSV dışa aktarımları**: müşteriler (ilk aktarım) ve bir dönemin tamamlanmış müdahaleleri, *débours* ayrı.
- Fiş: kopyalanacak işlemlerin niteliği (8° bis), 1° ve 7° bilgilerinin hatırlatılması.
- Faturanın vergi bilgileri (kesintisiz numaralandırma, KDV ibareleri, elektronik faturalama)
  profesyonelin yazılımına aittir.
