# GEMINI.md: Gemini'nin görev tanımı

Bu dosyayı Gemini (Antigravity ya da Gemini CLI) her oturumun başında okur. Claude yazar ve günceller; Gemini değiştirmez.

## Roller

- **Claude (sistemin kurucusu ve yöneticisi):** oyun tasarımı, bütün kod (simülasyon, çözücü, diyalog, yapay zekâ ile konuşma, sahneler, arayüz, ses), görsellerin oyuna bağlanması, görsel isteklerinin yazılması ve teslim edilen görsellerin kabul ya da reddi.
- **Gemini (görsel üreticisi):** yalnızca `gorsel-istekleri/` klasöründeki istekleri resim olarak üretir ve teslim eder.
- **Kullanıcı:** son söz onundur. İkisi arasındaki sorular onun üzerinden gider.

## Gemini ne yapar, ne yapmaz

**Yapar**
- `gorsel-istekleri/durum.md` tablosunda durumu `istek` olan kalemleri sırayla üretir.
- Her resmi tablodaki dosya adıyla, `varliklar/gorsel/` altına koyar.
- Ürettiği satırın durumunu `üretildi` yapar; not düşmek isterse "Gemini notu" sütununa yazar.
- Ham resmi de saklar: `varliklar/gorsel/ham/<aynı yol>` (arka planı silinmemiş, kırpılmamış hâli). Claude gerekirse kendisi yeniden işler.

**Yapmaz**
- Oyun kodu yazmaz, değiştirmez. Depodaki hiçbir `.js`, `.html`, `.css`, `.md` dosyasına dokunmaz (yalnızca `gorsel-istekleri/durum.md` istisna).
- Oyunun konusunu, yerini, zamanını, kişilerini, mekânlarını değiştirmez. Bunlar `PLAN.md`, `NOTLAR.md`, `KOY-HALKI.md` içinde sabittir.
- `durum.md`'de `kabul` ya da `ret` yazmaz; onları Claude yazar.

## Teslim yolu (git)

1. `claude/nifty-hypatia-6t4ipq` dalından `gemini-gorsel` adlı dal açar (varsa günceller: `git pull origin claude/nifty-hypatia-6t4ipq`).
2. Yalnızca `varliklar/gorsel/**` ve `gorsel-istekleri/durum.md` değişir.
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

## Teknik kurallar

- **Arka plan:** kişi, nesne ve katman resimleri düz beyaz `#FFFFFF` zemin üzerine üretilir, sonra senin temizleme betiğinle (dıştan doldurma + kenar arındırma) saydam PNG yapılır. Beyaz hare kalmamalı.
- **Ölçü ve konum tutarlılığı:** aynı türdeki resimler aynı ölçüde ve aynı kadrajda olur (her istek dosyasında yazıyor). 24 köylünün başı aynı yükseklikte, aynı büyüklükte durmalı; Claude yüzleri koda göre hizalayacak.
- **Yasaklar:** yazı, imza, filigran, çerçeve yok (istekte ayrıca istenmedikçe). Yakın plan el yok. Bacak ve ayak görünmez. Modern hiçbir şey yok (elektrik direği, plastik, fermuar, lastik taban).
- **Dosya adı:** tablodaki ad, aynen. Küçük harf, Türkçe karakter yok, boşluk yerine tire.

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

## Geri bildirim

Claude her teslimden sonra `durum.md`'de satırı `kabul` ya da `ret` yapar ve ret sebebini yazar. Reddedilen kalem yeniden `istek` olur.
