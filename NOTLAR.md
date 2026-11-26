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

## Prototip: `prototip/sorgu-odasi/index.html`

Tek dosya, bağımlılığı yok (yalnızca alt yazı yazı tipi Google Fonts'tan). Çift tıklayınca tarayıcıda açılır. Yol haritasının ilk aşamasında `src/` altına modüllere bölünecek; bölünürken aşağıdaki sınırlar kullanılacak.

### Ayar nesneleri (hepsi dosyanın başında ya da kendi bölümünün başında)

- `PAL`: bütün renkler.
- `OLCU`: sahne ölçüleri (tasarım yüksekliği 1200 birim, baş merkezi `kafaY`, masa kenarı `masaY`, hatların kaynama hızı, kamera payı).
- `DERINLIK`: her katmanın kamerayla ne kadar kaydığı (duvar az, masa çok).
- `KONUSMA`: cümle, ağız şekilleri (`[açıklık, genişlik]`), harf-şekil tablosu, süreler.
- `GIRIS`: kapı ölçüsü, uzaklık ölçeği, ayakta/oturur farkı, adım sayısı, zaman çizelgesi.
- `SAC`: saç tutamlarının eğrileri.
- `poz`: her karede değişen durum (bakış, göz açıklığı, ağız, nefes, ışık, kamera).
- `window.sorgu`: dışarıdan erişim (`poz`, `PAL`, `OLCU`, `KONUSMA`, `konus(metin)`).

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

- Sayfa gizliyken ya da boyutu sıfırken açılırsa ölçek sıfır olur ve çizim döngüleri sonsuza gider. `boyutla` içindeki koruma (`hazir`) bunu engeller; kaldırılmamalı.
- `tara` kutuyu kırpmazsa çizgiler bütün yüzeye yayılır.
- Kadın gerçekçi boyundan kısa çizildi (`GIRIS.ayaktaFark` küçük). İkinci bir karakter yan yana geldiğinde boy oranları tutarsız görünebilir; karakter sistemi kurulurken bu çözülmeli.

### Eksikler

- Yürüyüş, oturuş ve ağız hareketi hareket hâlinde hiç izlenmedi; yalnızca durağan karelere bakıldı. Akıcılığı kullanıcı değerlendiriyor.
- Tek karakter var; yüz ölçüleri kodun içinde, henüz veri dosyasında değil.
- Yüz ifadesi yok (gergin, kızgın, korkmuş). `poz.kasKaldir`, `poz.kasCat`, `poz.agiz` bunun için hazır.
- Kamera yalnızca imleç ve dokunmayla çalışıyor; telefonu eğme henüz yok.
- Metinler kodun içinde; dil dosyasına taşınacak.

## Sıradaki iş

`PLAN.md` yol haritasının 1. aşaması: test altyapısını kurmak ve prototipi `src/cizim` altına modüllere bölmek. Ondan önce `PLAN.md` sonundaki karar sorularının ilk ikisi (ekran yönü, ilk sürümün dili) cevaplanmalı.
