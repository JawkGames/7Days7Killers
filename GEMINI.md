# GEMINI.md: Gemini'nin görev tanımı

Bu dosyayı Gemini (Antigravity ya da Gemini CLI) her oturumun başında okur. Claude yazar ve günceller; Gemini değiştirmez.

## Roller

- **Claude (sistemin kurucusu ve yöneticisi):** oyun tasarımı, bütün kod (simülasyon, çözücü, diyalog, yapay zekâ ile konuşma, sahneler, arayüz, ses), görsellerin oyuna bağlanması, görsel isteklerinin yazılması ve teslim edilen görsellerin kabul ya da reddi.
- **Gemini (görsel üreticisi ve denemeci):** `gorsel-istekleri/` klasöründeki istekleri resim olarak üretir. Ayrıca kullanıcının bilgisayarında (RTX 4070) yerel yapay zekâ ve ses denemelerini yapar, oyunu oynayıp hata bildirir (`08-yerel-yz-ve-ses.md`).
- **Kullanıcı:** son söz onundur. İkisi arasındaki sorular onun üzerinden gider.

## Gemini ne yapar, ne yapmaz

**Yapar**
- `gorsel-istekleri/durum.md` tablosunda durumu `istek` olan kalemleri sırayla üretir.
- Her resmi tablodaki dosya adıyla, `varliklar/gorsel/` altına koyar.
- Ürettiklerini, kotasını ve sorularını `yazisma/gemini.md`'ye yazar (`durum.md`'yi Claude günceller).
- Ham resmi de saklar: `varliklar/gorsel/ham/<aynı yol>` (arka planı silinmemiş, kırpılmamış hâli). Claude gerekirse kendisi yeniden işler.

**Yapmaz**
- Oyun kodu yazmaz, değiştirmez. Depodaki hiçbir `.js`, `.html`, `.css`, `.md` dosyasına dokunmaz (istisnalar: `yazisma/gemini.md` ve `denemeler/**`).
- Oyunun konusunu, yerini, zamanını, kişilerini, mekânlarını değiştirmez. Bunlar `PLAN.md`, `NOTLAR.md`, `KOY-HALKI.md` içinde sabittir.
- `gorsel-istekleri/durum.md`'yi değiştirmez; onu yalnızca Claude günceller.

## Teslim yolu (git)

1. `claude/nifty-hypatia-6t4ipq` dalından `gemini-gorsel` adlı dal açar (varsa günceller: `git pull origin claude/nifty-hypatia-6t4ipq`).
2. Yalnızca `varliklar/gorsel/**` ve `yazisma/gemini.md` değişir.
3. `gemini-gorsel` dalına gönderir. Claude oradan alıp birleştirir.

`main2` dalı arşivdir: oradaki ayrı oyun kodu kullanılmayacak. İşe yarayan resimleri Claude zaten aldı.

## Oyun hakkında bilinmesi gerekenler

- **Yer ve zaman:** Gaziantep'e bağlı uydurma bir köy, Sarıkuyu, 1943. Kesme ve moloz taş evler, toprak dam, avlu, ahşap kirişli tavan, yer minderi, sedir, gaz lambası. Kilise, eczane, han, kayıkhane, kaldırım taşlı Avrupa sokağı, sokak lambası, fötr şapkalı kalabalık YOK.
- **Giyim:** aba, şalvar, mintan, yelek, kuşak, kasket, takke, sarık, poşu, keçe külah; kadınlarda uzun entari, yemeni, yazma, şal, yaşmak. Jandarma kaputu ve kepi. Paltoyu yalnızca birkaç kişi (muhtar, muallim, ağa oğlu, çerçi) giyer.
- **Kişiler:** 24 köylü, sabit. Kim olduklarını `KOY-HALKI.md` anlatır; kimlikleri `src/icerik/kisiler/` dosya adlarıdır.
- **Oyuncu:** Samsun'dan gelen müfettiş.
- **Ton:** karanlık, tekinsiz, ölçülü. Korku kanlı görüntüden değil, sessizlikten ve boşluktan gelir.

## Tarz kilidi

`main2` dalındaki resimlerin tarzı onaylandı ve bütün yeni resimler ona benzetilir. Örnekleri `varliklar/gorsel/tarz/` içinde; her isteğe bunlardan en az birini görsel referans olarak ekle.

- Kalın, titrek siyah mürekkep dış hat; gölgelerde tarama; yarı gerçekçi oranlar (çizgi film ya da anime değil).
- Soluk, kirli palet: küflü yeşil `#2B352C`, morluk moru `#35273B`, kirli sarı ışık `#D4B062`, toprak kahveleri.
- Tek ışık kaynağı; sahnelerin çoğu karanlık ama okunur.
- **Atmosfer (main2'den farklı):** main2'deki ışık fazla büyük, fazla parlak ve düzdü; kasvet yoktu. Işık küçük ve loş bir kaynaktan (gaz lambası ya da çıplak ampul) gelir, hızla söner; resmin büyük kısmı derin gölgede, köşeler neredeyse siyah. Yüzlerin yarısı karanlıkta. Hafif film kumu, kirli duvar, rutubet lekesi. Atmosfer örneği: `varliklar/gorsel/tarz/atmosfer-sorgu-odasi.png` (oyunun kodla çizilmiş sorgu odası). Çizgi ve doku main2 gibi, ışık ve kasvet bu örnek gibi.

## Teknik kurallar

- **Arka plan:** kişi, nesne ve katman resimleri düz siyah `#000000` zemin üzerine üretilir (Gemini saydam veremiyor; oyunun sahneleri karanlık olduğu için siyah zeminden kalan kenar artığı göze batmaz). Saydam verebiliyorsan saydam ver. Zemini Claude siler.
- **Ölçü ve konum tutarlılığı:** aynı türdeki resimler aynı ölçüde ve aynı kadrajda olur (her istek dosyasında yazıyor). 24 köylünün başı aynı yükseklikte, aynı büyüklükte durmalı; Claude yüzleri koda göre hizalayacak.
- **Yasaklar:** yazı, imza, filigran, çerçeve yok (istekte ayrıca istenmedikçe). Yakın plan el yok. Bacak ve ayak görünmez. Modern hiçbir şey yok (elektrik direği, plastik, fermuar, lastik taban).
- **Dosya adı:** tablodaki ad, aynen. Küçük harf, Türkçe karakter yok, boşluk yerine tire.

## Toplu üretim (baskı): kotayı korumak için

Resimler tek tek üretilmez. Her üretimde bir **baskı** (çok parçalı tek resim) istenir; parçaları Claude keser. Böylece aynı kotayla birkaç kat fazla resim çıkar ve aynı baskıdaki parçalar birbirine daha tutarlı olur.

- **Hangi baskı:** `gorsel-istekleri/durum.md` tablosu baskılar hâlinde yazılıdır (B01, B02...). Her baskının içindeki parçalar, sırası ve ızgarası orada.
- **Çözünürlük:** her baskı, aracın verebildiği **en yüksek çözünürlükte** istenir (4K verebiliyorsa 4K).
- **Izgara sayısını çözünürlük belirler.** Kesilen her parça en az şu boyda olmalı:

| Tür | Bir parçanın en az boyu | 4K baskıda | 2K baskıda |
| --- | --- | --- | --- |
| Köylü portresi (sorgu odasında büyük görünür) | 1000 px yükseklik | 2x2 = 4 kişi | 1 kişi (2x2 yapma) |
| Olay yeri, kayıp sahnesi, pencere katmanı (tam ekran) | 1600 px genişlik | 2x2 = 4 sahne | 1 sahne |
| İz nesnesi | 300 px | 4x3 = 12 nesne | 4x3 = 12 nesne |
| Arayüz parçası | parçanın istenen boyu | duruma göre | duruma göre |

  Baskı istenen boydan küçük gelirse ızgarayı küçült (2x2 yerine 1x2 ya da tek), parçaları sonraki baskıya kaydır ve gelen çözünürlüğü `yazisma/gemini.md`'ye yaz. Büyütünce pikselleşen parça kabul edilmez.
- **Izgara kuralları:** parçalar eşit hücrelerde; hücreler arasında geniş düz siyah boşluk (en az %4); hiçbir şey hücre dışına taşmaz; her hücrede aynı kadraj ve aynı ölçek. Sıra: soldan sağa, yukarıdan aşağı, tablodaki sırayla.
- **Kareler (göz kapalı, ağız açık):** kişiler tek tek değil, **bütün baskı düzenletilerek** üretilir: "bu baskıdaki herkesin gözlerini kapat". Dört kişi tek üretimde biter.
- **Küçük resimler ayrıca üretilmez:** karakter simgeleri, defter küçük resimleri gibi her şeyi Claude büyük resimden küçültür.
- **Teslim:** baskının kendisi `varliklar/gorsel/baski/<baskı kimliği>.png` (ya da `.webp`) olarak konur. Kesmek isteğe bağlı; kesersen parçaları tablodaki adlarla koy. Claude her hâlde baskıdan kendisi de keser.

## Kota bitince

Üretim hakkı bitince işi bırak ve `yazisma/gemini.md`'ye yaz: hangi baskıda kalındı, hakkın ne zaman yeniden açılacağı (Türkiye saati, `GG.AA.YYYY SS:DD`). Claude bu saati tutar ve kullanıcıya hatırlatır.

## İş listesi

Sıra ve durum: `gorsel-istekleri/durum.md`. Her kalemin ayrıntılı istemi aynı klasördeki konu dosyalarındadır:

| Dosya | Konu |
| --- | --- |
| `01-koyluler.md` | 24 köylünün portresi ve göz kapalı / ağız açık kareleri |
| `02-olay-yerleri.md` | 20 mekânın boş olay yeri resmi |
| `03-izler.md` | Olay yerine konacak eşya ve iz nesneleri |
| `04-sorgu-odasi.md` | Sorgu odasının katmanları |
| `05-sonlar.md` | Kayıp sahneleri ve pencere sahnesinin katmanları |
| `06-arayuz.md` | Fotoğraf çerçevesi ve diğer arayüz parçaları |
| `07-kukla.md` | 24 köylünün kukla parçaları (Çerçi tarzında) |
| `08-yerel-yz-ve-ses.md` | Resim değil: yerel dil modeli ve ses denemeleri, oyunu oynayıp hata bildirme |

## Yazışma

Claude ile Gemini birbirine `yazisma/` klasöründen yazar; kullanıcı aracı olmaz. Kurallar `yazisma/README.md` içinde. Gemini her oturumun başında `yazisma/claude.md`'nin son mesajını okur, sonunda `yazisma/gemini.md`'ye yazar.

Claude her teslimden sonra `durum.md`'de baskıyı `kabul` ya da `ret` yapar ve sebebini `yazisma/claude.md`'ye yazar. Reddedilen baskı yeniden `istek` olur.
