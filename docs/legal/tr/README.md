# Profesyonel için hukuki belge tabanı

*Güncel Fransızca sürümün (`docs/legal/README.md`) çevirisidir; Fransızca sürüm esastır. Resmî metinler Fransızca olarak alıntılanmıştır.*

Crénelio fiyat tekliflerinin / keşiflerinin (*devis*) dayandığı metinler ve kaynaklar (Item 22). Item 40
belge tabanının ilk biçimi: Markdown dosyaları, her dil için bir klasör (`fr/` esastır). İleride bu
dosyalar veri tabanına yüklenecek ve çevrilecek; resmî metinlerden alıntılar o zaman da Fransızca
kalacak, yanlarında çevrilmiş bir açıklama olacak.

Bu fişler Profesyonel Alanı'nda (*Espace Artisan*) da okunur (**Aide › Documentation** (Yardım ›
Belgeler) menüsü): buraya eklenen her fiş orada görünür, fişler arasındaki bağlantılar göreli kalır.

## Çeviriler

`en/`, `es/`, `pt/`, `hy/`, `it/`, `de/`, `pl/`, `uk/`, `ru/`, `gcf-gp/`, `gcf-mq/`, `tr/`, `ar/`, `ro/` ve, keyif için, `fr-chti/` (ch'ti) (05/11/2026) `fr/` fişlerini aynı adla yeniden verir, `README.md`
ise içindekiler içindir. Resmî metinler (`fr/textes/`) ve `sources.md` çevrilmez: Fransızca olarak
alıntılanır. **Fransızca sürüm esastır**; bir Fransızca fişte yapılan her değişiklik çevirilerine
aktarılır (ya da çeviriler geride kaldı diye işaretlenir). Arapça (`ar/`) sağdan sola yazılır; Fransızca resmî alıntıları soldan sağa gösterilmeye devam eder.

## Kurallar

- Her dosya **kaynaklarını** (bağlantı) ve **son kontrol tarihini** belirtir.
- Resmî metinlerden alıntılar (Légifrance, idarenin bilgi fişleri) olduğu gibi, tırnak içinde ya da
  alıntı olarak verilir; özel kaynaklar (rehberler, uzman siteler) **özetlenir**, asla kopyalanmaz.
- Alıntılanan bir resmî metnin sunumu (Légifrance'taki gibi): bir `### Article …` başlığı, ardından
  **her fıkrası bir paragraf olan** bir `>` alıntısı (« 1° », « a) », « II. - » sayımları dahil, boş bir
  `>` satırıyla ayrılmış); sürüm notu (« Modifié par… », « Création… ») ilk fıkrada, ardından « NOTA : »
  kendi satırında. Belgeler ekranı biçimlendirmeyi buradan çıkarır; metnin kendisi asla değiştirilmez.
- İkincil bir kaynak resmî metnin yerini tutmaz: öyle olduğu belirtilir ve yalnızca doğru metni bulmaya
  yarar. **Crénelio'da uygulanan her kural resmî metinle doğrulanmalıdır**; böylece üçüncü kişilerin
  (danışmanlık büroları, yayıncılar, bloglar) yorum sapmalarından kaçınılır.
- Her mevzuat değişikliğinde (Item 39): dosyayı, tarihini ve ilgili kodu güncelleyin
  (`api/models/Quote.php`, `quote_*` / `legal_*` ayarları).
- Bu fişler bir yardımdır, hukuki danışmanlık değildir: şüphe hâlinde profesyonel mali müşavirine
  (*expert-comptable*) ya da zanaat odasına (*chambre de métiers*) danışır.

## Fişler

| Konu | Fiş |
|---|---|
| Evde arıza onarımı teklifi: sözleşme öncesi belge, zorunlu bilgiler, değiştirilen parçalar | [devis-depannage.md](devis-depannage.md) |
| Uzaktan ya da evde kurulan sözleşme: cayma, acil durum, erken ifa | [retractation.md](retractation.md) |
| Bilgilendirme modelinin resmî metni (R221-3 eki, 19 Haziran 2026) ve uygulama tercihleri | [retractation-modele.md](retractation-modele.md) |
| Müşteri adına satın alınan parçalar: koşullar, belgeler, ciro | [debours.md](debours.md) |
| Parçaların yeniden satışı: sonuçlar, hukuki biçim, *débours* alternatifi | [achat-revente.md](achat-revente.md) |
| 25 € KDV dahil tutarın üzerinde zorunlu hizmet notu (fatura) | [note-facture.md](note-facture.md) |
| « EI » ibaresi, SIRET, RM, sigorta, arabulucu, fiyatların ilanı | [mentions-entreprise.md](mentions-entreprise.md) |
| Profesyonelin hatırlatma notu: satın almalar, belgeler, saklama | [rappels-artisan.md](rappels-artisan.md) |
| Resmî metinler, kelimesi kelimesine: Code de la consommation (Tüketici Kanunu) | [../fr/textes/code-consommation.md](../fr/textes/code-consommation.md) |
| Resmî metinler: Code de commerce (Ticaret Kanunu) (EI, şirketler) | [../fr/textes/code-commerce.md](../fr/textes/code-commerce.md) |
| Resmî metinler: Code général des impôts (Genel Vergi Kanunu) (*débours*, muafiyet) | [../fr/textes/code-general-impots.md](../fr/textes/code-general-impots.md) |
| Resmî metinler: Code de l'artisanat (Zanaatkârlık Kanunu) (*qualité d'artisan*) | [../fr/textes/code-artisanat.md](../fr/textes/code-artisanat.md) |
| Resmî metinler: 1983 (hizmet notu), 1987 (fiyat bilgisi) ve 2017 (arıza onarımı teklifi) tarihli bakanlık kararları (*arrêtés*) | [../fr/textes/arretes.md](../fr/textes/arretes.md) |
| Resmî metinler: CGI, ek II (faturalardaki zorunlu bilgiler) | [../fr/textes/code-general-impots-annexe-2.md](../fr/textes/code-general-impots-annexe-2.md) |
| Resmî metinler: Code de la sécurité sociale (Sosyal Güvenlik Kanunu) (mikro girişimcinin primleri) | [../fr/textes/code-securite-sociale.md](../fr/textes/code-securite-sociale.md) |
| Resmî metinler: Code des assurances (Sigorta Kanunu) (on yıllık sigorta, tekliflere eklenen sigorta belgesi) | [../fr/textes/code-assurances.md](../fr/textes/code-assurances.md) |
| Resmî metinler: Code civil (Medeni Kanun) (yapımcı, on yıllık, iki yıllık ve tam tamamlama garantileri) | [../fr/textes/code-civil.md](../fr/textes/code-civil.md) |
| Vergi idaresi yorumu (BOFiP): *débours*, yedek parçalar | [../fr/textes/bofip.md](../fr/textes/bofip.md) |
| Kaynak listesi, niteliği ve kontrol tarihi | [../sources.md](../sources.md) |
