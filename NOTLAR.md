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
| Yürürken bacak ve ayakkabı | Kötü durdu. Çözüm: bacak çizilmez, masa yükseltildi, palto uzatıldı. |
| Ayaktayken yüzün kadrajın üstünden çıkıp oturunca inmesi | İstenmedi. Çözüm: ayakta ve oturur göz yüksekliği farkı küçük tutulur. |

## Kod haritası (sorgu sahnesi)

Prototip `src/` altına modüllere bölündü (2026-11-26). İlk kare prototiple piksel piksel aynı çıkıyor; `prototip/sorgu-odasi/index.html` yalnızca karşılaştırma için duruyor, artık oradan geliştirilmez.

Komutlar: `npm run dev` (geliştirme sunucusu), `npm test` (Vitest, `testler/`), `npm run lint`, `npm run build`.

### Hangi şey nerede

| Dosya | İçerik |
| --- | --- |
| `index.html`, `src/ana.js` | Sayfa ve başlangıç. `window.sorgu` (`poz`, `PAL`, `OLCU`, `KONUSMA`, `konus(metin)`) konsoldan deneme içindir. |
| `src/cekirdek/` | `rastgele.js` (`rng`, tohumlu), `matematik.js` (`hex`, `rgba`, `lerp`, `clamp`, `yumusak`, `bez`). |
| `src/cizim/teknik/` | `tuval.js` (çizim hedefi `c`), `gorunum.js` (`gor`: ölçek ve ekran, `onBellek`), `firca.js` (`leke`, `tara`, `titrek`, `karalama`), `kaplama.js`, `palet.js` (`PAL`). |
| `src/cizim/rig/` | `poz.js` (`poz`, `YUZ`), `yuz.js` (`kafa`, `goz`, `kas`, ağız), `sac.js` (`SAC`), `govde.js` (`govde`, `altGovde`). |
| `src/cizim/sahneler/sorgu-odasi/` | `ayar.js` (`OLCU`, `DERINLIK`, `GIRIS`), `sahne.js` (`ciz`, `guncelle`, döngü), `giris.js`, `arka-plan.js`, `ampul.js`, `masa.js`, `sandalye.js`. |
| `src/diyalog/` | `agiz-cizelgesi.js` (`cizelgeKur`, saf işlev), `konusma.js` (`KONUSMA`, `konus`, `sozGuncelle`). |
| `src/dil/` | `index.js` (`metin(anahtar)`, `agizTablosu()`), `tr/arayuz.js`, `tr/agiz.js`. |
| `src/arayuz/sorgu-arayuzu.js` | Alt yazı ve iki deneme düğmesi (geçici). |
| `src/platform/` | `girdi.js` (imleç, dokunma), `tercih.js` (`azHareket`). |

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
- Tek karakter var; yüz ölçüleri kodun içinde, henüz veri dosyasında değil.
- Yüz ifadesi yok (gergin, kızgın, korkmuş). `poz.kasKaldir`, `poz.kasCat`, `poz.agiz` bunun için hazır.
- Kamera yalnızca imleç ve dokunmayla çalışıyor; telefonu eğme henüz yok.
- Alt yazı yazı tipi Google Fonts'tan geliyor; çevrimdışı çalışması için pakete alınmalı.

## Sıradaki iş

1. aşama bitti. Sırada `PLAN.md` yol haritasının 2. aşaması: kasaba halkı (20-25 kişi: kişilik, ilişkiler, sırlar, kayıp sahnesi). Bunun için `PLAN.md` sonundaki şu karar soruları cevaplanmalı: kasabanın dönemi ve yeri, oyuncunun kim olduğu. Ekran yönü ve ilk sürümün dili hâlâ açık ama 2-5. aşamaları engellemiyor.
