# NOTLAR

Bu dosya projenin hafızasıdır. Yeni bir oturum önce `README.md`, `PLAN.md` ve bu dosyayı okur; kodu baştan okumak yerine buradaki haritayı kullanır. Bir karar değiştiğinde ya da bir şey denenip bırakıldığında buraya yazılır.

## Kimlik

- Görünen ad: **7 Days 7 Killers**. Depo ve paket adı bitişik: `7Days7Killers`.
- Çalışma adı "Kasabanın Kaderi" idi.
- İsim bilerek "7 Days to Die"a yakın seçildi (onu arayan bunu da görsün). Simge ve mağaza açıklaması o oyuna benzetilmeyecek.
- Platform: PC ve telefon, tek kod tabanı.

## Alınan kararlar (2026-11-26)

- Zaman döngüsü dedektif oyunu: 7 gün, 7 katil, yedinci gün REWIND TIME ya da FINAL VERDICT. Kaç katilin doğru bulunduğu oyuncuya hiç söylenmez.
- Kasaba halkı sabit (20-25 kişi); her oyunda yalnızca roller ve olaylar değişir.
- Hikâye elle yazılmaz; kasaba simüle edilir, metin simülasyondan çıkar. Oyunun içinde canlı yapay zekâ yok, oyun çevrimdışı çalışır.
- Bütün görseller kodla çizilir (canvas). Dış görsel üretici kullanılmaz.
- Görsel ton: karanlık, gizemli, biraz kaotik. "No, I'm not a Human" kadar abartılı değil ama o yönde.
- Sorgu sahnesi ana temadır; oyun bunun üzerine kurulur.
- Kamera imleçle sağa sola kayar, katmanlar farklı miktarda oynar (derinlik).
- Karakter kapıdan girer, masanın arkasındaki sandalyeye oturur.
- Konuşma: ses yok; ağız oynar, alt yazı harf harf çıkar.
- Önce olay üretim motoru ve yalnızca metinle oynanabilir sürüm, sonra çizim.

## Alınan kararlar (2026-11-26, ikinci tur)

- **Yer ve zaman:** Antep'in bir köyü, 1940'lar. Köyün adı Sarıkuyu (uydurma), yıl 1943. Belgelerde "kasaba" geçen yerlerde artık köy kastedilir.
- **Oyuncu:** dışarıdan gelen bir müfettiş, Samsunlu. Köylü ona yabancıdır; kimse kendiliğinden konuşmaz.
- **Dil:** ilk prototip yalnızca Türkçe. Metinler yine de dil dosyasında durur.
- **Köy halkı taslağı yazıldı:** 24 kişi, `KOY-HALKI.md` (üretilen belge). Kullanıcı onayı bekliyor.
- **Çalışma biçimi:** kullanıcı işlerin birbirine karışmayacak parçalara bölünüp paralel ajanlara verilmesini istedi. Her ajan yalnızca kendi klasörüne yazar; ortak dosyaları (`package.json`, `NOTLAR.md`, `PLAN.md`, `src/dil/index.js`) yalnızca ana oturum değiştirir. Çizim işleri de motorla aynı anda yürüyor (önceki "önce motor" sırası kullanıcı isteğiyle gevşetildi).

## İçerik verisi

- Kişi: `src/icerik/kisiler/<kimlik>.js` (yaş, meslek, mizaç, ev, iş, örtü, eşyalar, sırlar, ilişkiler, kayıp sahnesi). Türkçe metni `src/dil/tr/kisiler.js` içinde aynı kimlikle.
- Mekân: `src/icerik/mekanlar/<kimlik>.js`; adları `src/dil/tr/terimler.js` içinde.
- `src/icerik/kur.js`: `koyKur` (ilişkileri iki yönlü kurar) ve `dogrula` (şema denetimi). `src/icerik/index.js` klasörleri toplar (`koy`, `kisiListesi`, `mekanListesi`).
- İlişki tek tarafın dosyasında bir kez yazılır; karşı yön kodla üretilir. İki tarafa da yazmak test hatasıdır.
- `ortu`: alt gövdeyi gizleyen giysi (aba, entari, kepenek...). "Bacak çizilmez" kuralı veriye böyle girdi.
- `esyalar`: kişinin iz bırakabilecek ayırt edici eşyaları. Kırmızı yün hem Elif'in hırkasında hem Gülsüm'ün yumağında var: bilerek, yanıltıcı iz için.
- Metin ya da kişi değişince `npm run halk` ile `KOY-HALKI.md` yeniden üretilir.

## Alınan kararlar (2026-11-27)

- **Hedef: Steam, PC.** İnternet ve anahtar gerektirmeyen, kendi içinde çalışan oyun. Asgari ekran kartı RTX 2060-2070 sınıfı (6-8 GB VRAM).
- **Konuşmayı oyunun içindeki yerel yapay zekâ yapacak.** Bu, "oyunun içinde canlı yapay zekâ yok" kararının yerine geçer. Karma yapı: gerçek ve karar motorda kalır (kim katil, ne söylenecek, doğru mu yalan mı, nerede ağzından kaçıracak); model yalnızca o kararı karakterin ağzıyla söyler. Kalıp sistemi düşük donanım ve yedek kipi olarak kalır.
- **Görseller:** Gemini üretir, Claude oyuna bağlar. Gemini'nin görev tanımı `GEMINI.md`, iş listesi `gorsel-istekleri/durum.md`. Tarz kilidi: `main2` dalındaki resimlerin tarzı (kalın titrek mürekkep hat, tarama, soluk palet); örnekler `varliklar/gorsel/tarz/`. Gemini `gemini-gorsel` dalına teslim eder, Claude birleştirir. `main2` dalındaki ayrı oyun kodu kullanılmaz; işe yarayan 17 resim alındı. Kodla çizilen sahneler yedek ve hareket katmanı olarak kalır.
- **Konuşma dili:** normal günümüz Türkçesi; dönem ağzı ya da eski Türkçe yok. Sonra İngilizce eklenecek.
- **Seslendirme:** köylüler yerel, ücretsiz bir metinden sese (TTS) sistemiyle sesli konuşacak; mümkünse her karaktere ayrı ses, değilse temel seslerin perde/tını çeşitlemesi. Bu, ilk karar listesindeki "konuşmada ses yok" maddesinin yerine geçer. Hazırlık araştırması: `arastirma/yerel-yapay-zeka-ve-ses.md`.
- **Eskitme efektleri her görselin üstünde:** film kumu ve çizikleri, lambanın titremesi ve sönüp yanması, titreyen çizgiler, eski ekran bandı. Gemini'nin resimleri de bu katmanın altında gösterilecek. Varsayılan hepsi açık; oyuncu Ayarlar > Görüntü'den tek tek kapatabilir (`src/platform/goruntu.js`). Tarayıcıda az hareket tercihi varsa hareketli olanlar kapalı başlar.
- **Ajan kullanımı:** çok ajan kotayı hızlı bitiriyor; kullanıcı istemedikçe paralel ajan açılmaz.

## Denenip vazgeçilenler

Bunlar tekrar önerilmesin diye yazıldı.

| Denenen | Sonuç |
| --- | --- |
| Yumuşak gradyanlı vektör çizim (vezne camı arkasındaki kadın) | "Çizim gibi" durdu, yeterince gerçekçi bulunmadı. Yerini karanlık mürekkep tekniği aldı. |
| Canva ile fotoğraf kalitesinde karakter ve ayrı göz/ağız kareleri | Karakter beğenildi ama süreç bırakıldı: görseller elle indirilmek zorundaydı. Kullanıcı kodla çizim istedi. |
| Fotoğrafın üstüne kodla göz kırpma | Kapalı göz yapay durdu. |
| Alt dudağı tek parça aşağı kaydırarak ağız açma | Alt dudak kopmuş gibi göründü. Çözüm: ağız köşeleri sabit, dudaklar köşelerden esneyerek açılır. |
| Tarama çizgilerinin yüzün tamamını kaplaması | Çatlak porselen gibi durdu. Çözüm: tarama yalnızca gölgeli kutuda kalır. |
| Masada birinci şahıs erkek eli (parmak tıkırtısı, irkilme) | Yapay durdu, tamamen kaldırıldı. |
| Olay yeri fotoğrafında büyük düzlemi afin dönüşümle çizmek | Eğik kamerada duvar kaydı. Tam izdüşüm şart. |
| Kalabalıkta her figüre eşit dış hat | Neon çıkartma gibi durdu. Işık tek yandan ve sıralar arasında verilince düzeldi. |
| Yürürken bacak ve ayakkabı | Kötü durdu. Çözüm: bacak çizilmez, masa yükseltildi, palto uzatıldı. |
| Ayaktayken yüzün kadrajın üstünden çıkıp oturunca inmesi | İstenmedi. Çözüm: ayakta ve oturur göz yüksekliği farkı küçük tutulur. |

## Kod haritası (sorgu sahnesi)

Prototip `src/` altına modüllere bölündü (2026-11-26). Varsayılan kadınla sahne prototiple piksel piksel aynı çıkıyor (ilk kare ve yürüyüş ortası ölçüldü; karşılaştırırken sayfa tam yüklenmeden kare ilerletilirse sahte fark çıkar); `prototip/sorgu-odasi/index.html` yalnızca karşılaştırma için duruyor, artık oradan geliştirilmez.

Komutlar: `npm run dev` (geliştirme sunucusu), `npm test` (Vitest, `testler/`), `npm run lint`, `npm run build`.

### Hangi şey nerede

| Dosya | İçerik |
| --- | --- |
| `index.html`, `src/ana.js` | Sayfa ve başlangıç. `window.sorgu` (`poz`, `PAL`, `OLCU`, `KONUSMA`, `konus(metin)`) konsoldan deneme içindir. |
| `src/cekirdek/` | `rastgele.js` (`rng`, tohumlu), `matematik.js`, `ayarlar.js` (`AYARLAR`: tek ayar dosyası), `olay.js` (olay kanalı), `zaman.js` (gün, adım, sorgu hakkı, Rewind, hüküm). Ayrıntı: `src/cekirdek/README.md`. |
| `src/cizim/teknik/` | `tuval.js` (çizim hedefi `c`), `gorunum.js` (`gor`: ölçek ve ekran, `onBellek`), `firca.js` (`leke`, `tara`, `titrek`, `karalama`), `kaplama.js`, `palet.js` (`PAL`). |
| `src/cizim/rig/` | Veriyle sürülen karakter iskeleti. `karakterSec(gorunus)` etkin karakteri seçer; seçilmezse varsayılan kadın çizilir. `gorunus.js` (şema), `yuz.js`, `sac.js`, `sakal.js`, `baslik.js`, `govde.js`, `poz.js`. Şema ve yeni karakter yazma adımları: `src/cizim/rig/README.md`. Görünüş verileri `src/icerik/gorunus/<kimlik>.js`; galeri `prototip/karakterler/`. |
| `src/cizim/sahneler/olay-yeri/` | Olay yeri fotoğrafı: `fotografKur({mekan, izler, tohum})`, mekân şablonları (`mekanlar/`), iz nesneleri (`izler/`), dokunma bölgeleri. Deneme: `prototip/olay-yeri/`. Ayrıntı README'de. |
| `src/cizim/sahneler/pencere/` | Son: pencere sahnesi, `pencereBaslat({dogru, tohum})`. Deneme: `prototip/pencere/`. |
| `src/cizim/sahneler/kayip/` | Son: kayıp sahneleri, `kayipSahnesi({kisi, katilMi, tohum, metin})`; 24 kişinin sahne verisi `kisiler.js`. Deneme: `prototip/kayip/`. |
| `src/simulasyon/` | Olay üretim motoru: `vakaUret(tohum, koy, ayar)` düz veri vaka döndürür; `ifade(vaka, kisi, olgu)` kişinin ne söyleyeceğini verir. Vaka biçimi: `src/simulasyon/README.md`. `npm run vaka -- 77` bir vakanın bütün gerçeğini basar. |
| `src/cizim/sahneler/sorgu-odasi/` | `ayar.js` (`OLCU`, `DERINLIK`, `GIRIS`), `sahne.js` (`ciz`, `guncelle`, döngü), `giris.js`, `arka-plan.js`, `ampul.js`, `masa.js`, `sandalye.js`. |
| `src/diyalog/` | `agiz-cizelgesi.js`, `konusma.js` (ağız ve alt yazı), `kalip.js` (kalıp doldurucu), `defter.js` (oyuncunun bildikleri), `soru.js` (defterden soru üretimi), `cevap.js` (`ifade` sonucunu mizaca göre cümleye ve tepkiye çevirir), `adlar.js`. |
| `src/oyun/` | `oyun.js` (oyun durumu ve eylemler), `oto.js` (otomatik oyuncu), `ayar.js`. |
| `src/dil/` | `index.js` (`metin(anahtar)`, `agizTablosu()`), `tr/arayuz.js`, `tr/agiz.js`, `tr/ekler.js` (Türkçe ek motoru), `tr/kaliplar.js` (cümle kalıpları), `tr/kisiler.js`, `tr/terimler.js`. Ek kuralları: `src/dil/tr/README.md`. |
| `src/arayuz/sorgu-arayuzu.js` | Alt yazı ve iki deneme düğmesi (geçici). |
| `src/platform/` | `girdi.js` (imleç, dokunma, `egimDinle`), `ekran.js` (tam ekran, yön, görünürlük), `kayit.js` (sürümlü kayıt, göç zinciri), `tercih.js` (`azHareket`). |

Çizim modülleri arayüzü tanımaz; `konusmaOlay` ve `girisOlay` üzerinden haber verir, arayüz bunlara bağlanır.

### Ayar nesneleri

- `PAL`: bütün renkler.
- `OLCU`: sahne ölçüleri (tasarım yüksekliği 1200 birim, baş merkezi `kafaY`, masa kenarı `masaY`, hatların kaynama hızı, kamera payı).
- `DERINLIK`: her katmanın kamerayla ne kadar kaydığı (duvar az, masa çok).
- `KONUSMA`: ağız şekilleri (`[açıklık, genişlik]`) ve süreler. Harf-şekil tablosu dil dosyasında.
- `GIRIS`: kapı ölçüsü, uzaklık ölçeği, ayakta/oturur farkı, adım sayısı, zaman çizelgesi.
- `SAC`: saç tutamlarının eğrileri.
- `poz`: her karede değişen durum (bakış, göz açıklığı, ağız, nefes, ışık, kamera).

### Çizim tekniği (her sahnede ortak kullanılacak üç araç)

- `leke`: kenara doğru eriyen boya lekesi. Bütün gölge ve ışık bununla verilir.
- `tara`: verilen kutunun içinde kalan kırık, titrek paralel çizgiler.
- `titrek`: aynı hattı birkaç kez hafif kaydırarak çizer. Tohumu `poz.kaynama` ile değiştiği için hatlar saniyede 7 kez oynar.
- `karalama`: kaotik karalama yumağı.

### Katmanlar ve çizim sırası (`ciz`)

1. `arkaPlan` (ön belleğe bir kez çizilir): duvar, lekeler, belirsiz kapı, borular, akıntı izleri.
2. `kapiIsigi`: giriş sırasında kapıdan sızan ışık.
3. `ampul`: sallanan, cızırdayan çıplak ampul.
4. Karakterin duvara düşen gölgesi.
5. `sandalye`.
6. Figür: `altGovde` (yalnızca giriş sırasında), `arkaSac`, `govde`, `kafa` (içinde `goz`, `kas`, ağız, `onSac`).
7. `masa` (ön belleğe bir kez çizilir): tahta, defter, dosya, ters fotoğraflar, kül tablası.
8. `duman`, sonra `kaplama` (kararma, film çizikleri, kum).

Kamera kayınca kenar açılmasın diye ön bellekler iki yandan `OLCU.pay` kadar geniş çizilir.

### Davranış

- `guncelle`: bakış (imleci izler, boşta bize bakar), seyrek göz kırpma, ampul titremesi ve kısa kesintiler, nefes, kamera.
- `sozGuncelle`, `cizelgeKur`, `konus`: metinden ağız çizelgesi kurar; alt yazıyı harf harf açar.
- `girisBaslat`, `girisGuncelle`: kapı açılır, figür siluet olarak belirir, yürür, sandalyeye oturur. Giriş sırasında figür ayrı bir katmana çizilip karartılır, sonra bindirilir.

### Bilinmesi gereken tuzaklar

- Sayfa gizliyken ya da boyutu sıfırken açılırsa ölçek sıfır olur ve çizim döngüleri sonsuza gider. `gorunumOlc` içindeki koruma (`gor.hazir`) bunu engeller; kaldırılmamalı.
- Çizim hedefi `c`, `tuval.js` içinden canlı bağ olarak gelir. Başka katmana çizmek için `hedefAyarla` kullanılır; modül içinde `c` yeniden tanımlanmaz.
- Çizimi değiştirmeyen bir düzenlemeden sonra kare karşılaştırması: `requestAnimationFrame` ve `Math.random` sabitlenip ilk kare prototiple karşılaştırılır (Playwright).
- `tara` kutuyu kırpmazsa çizgiler bütün yüzeye yayılır.
- Kadın gerçekçi boyundan kısa çizildi (`GIRIS.ayaktaFark` küçük). İkinci bir karakter yan yana geldiğinde boy oranları tutarsız görünebilir; karakter sistemi kurulurken bu çözülmeli.

### Eksikler

- Yürüyüş, oturuş ve ağız hareketi hareket hâlinde hiç izlenmedi; yalnızca durağan karelere bakıldı. Akıcılığı kullanıcı değerlendiriyor.
- 24 kişinin hepsinin görünüş dosyası var. Zayıflar: Nihat (gözlük yok), Süleyman (gülümseme yok), yemenili kadınlar birbirine yakın, kısa erkek saçı tek biçim.
- 22 mekânın hepsinin olay yeri şablonu var. Zayıflar: cami, ırgat evi, sınır patikası (kayalar kutu gibi). Ayak izleri modern bot tabanı gibi. Ev, dış mekân ve iç mekân yardımcıları `halil-evi.js`, `harman-yeri.js`, `koy-odasi.js` içinde duruyor; `mekan-yardim.js`'e taşınmalı.
- Yüz ifadesi yok (gergin, kızgın, korkmuş). `poz.kasKaldir`, `poz.kasCat`, `poz.agiz` bunun için hazır.
- `egimDinle` hazır ama sorgu sahnesine bağlanmadı.
- Alt yazı yazı tipi Google Fonts'tan geliyor; çevrimdışı çalışması için pakete alınmalı.

## Simülasyon, çözücü ve oyun kararları

- Zaman tek sayıdır: `(gün-1)*5 + dilim`; dilimler gece, sabah, öğle, ikindi, akşam. Gece günün ilk dilimidir, böylece her günün sabahında o günün fotoğrafı vardır.
- Motor metin üretmez, yalnızca kimlik ve anahtar verir. Cümle `diyalog/kalip.js` ile kurulur.
- Çözücü (`src/simulasyon/cozucu/`) vakayı yalnızca oyuncunun görebildiğiyle çözer (`oyuncuGorunumu`); gerçeğe bakamaz, bu testle korunur. Kalite eleği: her katile en az 2 bağımsız ipucu zinciri, her yanıltıcı ize bir çürütme yolu; geçemeyen tohum belirlenimci biçimde yeniden denenir. 1000 tohumda %58'i ilk denemede geçiyor, hepsi yeniden denemeyle geçiyor. `npm run tara -- 1000` dağılımı basar.
- Herkes %20-41 sıklıkla katil çıkıyor. Yöntemler mesleğe, eşyaya ve mekâna bağlı. Sır rolleri (`rol`) ve mekân komşulukları (`komsular`) artık veride.
- Oyun katmanı `src/oyun/oyun.js`: durum + eylem → yeni durum + gösterilecekler; düz veri, kayda olduğu gibi girer. Terminal: `npm run oyna -- 77` (`--oto` otomatik oyuncu). Tarayıcı: `prototip/metin-oyunu/`.
- Bilinen zayıflıklar: oyun fazla kolay (otomatik oyuncu Rewind'siz ortalama 5,9/7 buluyor; katil çoğu zaman tek sahipli eşya bırakıyor ve "bu kimin?" sorusuna herkes doğru cevap veriyor); cevapların üçte biri "görmedim/bilmem"; Rewind'de oyuncu olayları değiştiremiyor (kurbanı koruma yok); kayıp sahnesindeki kanıt satırı kaç doğru olduğunu sezdiriyor.
- Günlük sorgu hakkı geçici olarak 4 (`AYARLAR.gunlukSorguHakki`); kullanıcı kararı bekliyor.

## Sıradaki iş

İlk beş aşama bitti: oyun metinle baştan sona oynanıyor. 24 köylü ve 22 mekân çizilebiliyor; son sahneleri hazır. Sırada: (1) zorluk ve boş cevap ayarı (motor), (2) çizim sahnelerini oyun katmanına bağlayıp görsel oynanabilir sürümü kurmak, (3) iskelete eksik özellikler (gözlük, tek göz, gülümseme; ajan çalışıyor), (4) Rewind'de müdahale, (5) yazı tipini pakete almak, ayak izlerini çarık/çizme yapmak, olay yeri yardımcılarını ortak dosyaya taşımak. Kullanıcıdan beklenen: metin oyununu oynayıp sürükleyici mi karar vermek; `KOY-HALKI.md` onayı; ampul yerine gaz lambası; günlük sorgu hakkı; ekran yönü.
