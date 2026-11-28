# Görsel iş listesi

**Kota:** 28.11.2026 02:54'te açılıyor. Güncel bilgi `yazisma/gemini.md`'de.

**27.11 teslimi:** mahmut, halil, elif (temel, göz kapalı, ağız açık) → üretildi, tarz kararı bekliyor (köylü baskıları durdu). aga-konagi, koy-odasi, cami, okul, karakol → kabul (geçici). Gemini'nin aracı en çok 1024x1024 / 1376x768 veriyor: köylüler için 2x2 baskı yetersiz, mekânlar tek tek üretilecek, izler 4x3 sürer.

**28.11 karar: köylüler artık kukla parçası olarak üretilecek.** Eski köylü baskıları (istem 01) iptal. Yeni iş: `07-kukla.md`, 24 kişi sırayla, kişi başına A (baş/göz/ağız) + B (gövde) resmi. Çerçi referans resmini kullanıcı verir. Durum: **istek** (suleyman, arif, bektas: kabul, 28.11). Mekân ve iz işleri bundan sonra.

Gemini her oturumda bu tabloya bakar, `istek` durumundaki baskıları sırayla üretir ve teslimi `yazisma/gemini.md`'ye yazar. Bu tabloyu yalnızca Claude günceller (`üretildi`, `kabul`, `ret`). Baskı kuralları (çözünürlük, ızgara, parça boyu) `GEMINI.md` içinde. Yollar `varliklar/gorsel/` altındadır; istemler "İstem" sütunundaki numaralı dosyadadır.

Durumlar: `istek` (üret), `sırada` (henüz üretme), `beklemede` (karar bekleniyor), `üretildi` (Claude bakacak), `kabul`, `ret` (sebep notta; düzeltip yeniden üret).

**Önce pilot (B01-B04):** dört köylü tek baskıda (Hacı Ağa, Kör Halil, Muhtarın Kızı, Hanımağa), sonra aynı baskının göz kapalı, ağız açık ve göz kaçıran hâlleri. Tutarsa kalan 20 köylü `istek` olur. Olay yerleri, izler, sonlar ve arayüz pilotu beklemeden üretilebilir.

48 baskı, 209 parça.

| Baskı | Tür | Izgara | Parçalar (sırayla) | İstem | Durum | Not | Gemini notu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B01 | köylü temel | 2x2 | `kisiler/mahmut/temel.png`<br>`kisiler/halil/temel.png`<br>`kisiler/elif/temel.png`<br>`kisiler/zeliha/temel.png` | 01 | iptal | yerine 07-kukla | |
| B02 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/mahmut/goz-kapali.png`<br>`kisiler/halil/goz-kapali.png`<br>`kisiler/elif/goz-kapali.png`<br>`kisiler/zeliha/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B03 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/mahmut/agiz-acik.png`<br>`kisiler/halil/agiz-acik.png`<br>`kisiler/elif/agiz-acik.png`<br>`kisiler/zeliha/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B04 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/mahmut/goz-kacir.png`<br>`kisiler/halil/goz-kacir.png`<br>`kisiler/elif/goz-kacir.png`<br>`kisiler/zeliha/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B05 | köylü temel | 2x2 | `kisiler/cemil/temel.png`<br>`kisiler/dursun/temel.png`<br>`kisiler/naciye/temel.png`<br>`kisiler/abdullah/temel.png` | 01 | iptal | yerine 07-kukla | |
| B06 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/cemil/goz-kapali.png`<br>`kisiler/dursun/goz-kapali.png`<br>`kisiler/naciye/goz-kapali.png`<br>`kisiler/abdullah/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B07 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/cemil/agiz-acik.png`<br>`kisiler/dursun/agiz-acik.png`<br>`kisiler/naciye/agiz-acik.png`<br>`kisiler/abdullah/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B08 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/cemil/goz-kacir.png`<br>`kisiler/dursun/goz-kacir.png`<br>`kisiler/naciye/goz-kacir.png`<br>`kisiler/abdullah/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B09 | köylü temel | 2x2 | `kisiler/nihat/temel.png`<br>`kisiler/riza/temel.png`<br>`kisiler/fadime/temel.png`<br>`kisiler/bekir/temel.png` | 01 | iptal | yerine 07-kukla | |
| B10 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/nihat/goz-kapali.png`<br>`kisiler/riza/goz-kapali.png`<br>`kisiler/fadime/goz-kapali.png`<br>`kisiler/bekir/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B11 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/nihat/agiz-acik.png`<br>`kisiler/riza/agiz-acik.png`<br>`kisiler/fadime/agiz-acik.png`<br>`kisiler/bekir/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B12 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/nihat/goz-kacir.png`<br>`kisiler/riza/goz-kacir.png`<br>`kisiler/fadime/goz-kacir.png`<br>`kisiler/bekir/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B13 | köylü temel | 2x2 | `kisiler/yusuf/temel.png`<br>`kisiler/hatice/temel.png`<br>`kisiler/arif/temel.png`<br>`kisiler/kazim/temel.png` | 01 | iptal | yerine 07-kukla | |
| B14 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/yusuf/goz-kapali.png`<br>`kisiler/hatice/goz-kapali.png`<br>`kisiler/arif/goz-kapali.png`<br>`kisiler/kazim/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B15 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/yusuf/agiz-acik.png`<br>`kisiler/hatice/agiz-acik.png`<br>`kisiler/arif/agiz-acik.png`<br>`kisiler/kazim/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B16 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/yusuf/goz-kacir.png`<br>`kisiler/hatice/goz-kacir.png`<br>`kisiler/arif/goz-kacir.png`<br>`kisiler/kazim/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B17 | köylü temel | 2x2 | `kisiler/hasan/temel.png`<br>`kisiler/gulsum/temel.png`<br>`kisiler/bektas/temel.png`<br>`kisiler/sultan/temel.png` | 01 | iptal | yerine 07-kukla | |
| B18 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/hasan/goz-kapali.png`<br>`kisiler/gulsum/goz-kapali.png`<br>`kisiler/bektas/goz-kapali.png`<br>`kisiler/sultan/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B19 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/hasan/agiz-acik.png`<br>`kisiler/gulsum/agiz-acik.png`<br>`kisiler/bektas/agiz-acik.png`<br>`kisiler/sultan/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B20 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/hasan/goz-kacir.png`<br>`kisiler/gulsum/goz-kacir.png`<br>`kisiler/bektas/goz-kacir.png`<br>`kisiler/sultan/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B21 | köylü temel | 2x2 | `kisiler/kadir/temel.png`<br>`kisiler/ismail/temel.png`<br>`kisiler/emine/temel.png`<br>`kisiler/suleyman/temel.png` | 01 | iptal | yerine 07-kukla | |
| B22 | köylü göz kapalı (önceki baskıyı düzenle) | 2x2 | `kisiler/kadir/goz-kapali.png`<br>`kisiler/ismail/goz-kapali.png`<br>`kisiler/emine/goz-kapali.png`<br>`kisiler/suleyman/goz-kapali.png` | 01 | iptal | yerine 07-kukla | |
| B23 | köylü ağız açık (önceki baskıyı düzenle) | 2x2 | `kisiler/kadir/agiz-acik.png`<br>`kisiler/ismail/agiz-acik.png`<br>`kisiler/emine/agiz-acik.png`<br>`kisiler/suleyman/agiz-acik.png` | 01 | iptal | yerine 07-kukla | |
| B24 | köylü göz kaçıran (temel baskıyı düzenle) | 2x2 | `kisiler/kadir/goz-kacir.png`<br>`kisiler/ismail/goz-kacir.png`<br>`kisiler/emine/goz-kacir.png`<br>`kisiler/suleyman/goz-kacir.png` | 01 | iptal | yerine 07-kukla | |
| B25 | olay yeri | 2x2 | `mekanlar/aga-konagi.webp`<br>`mekanlar/koy-odasi.webp`<br>`mekanlar/muhtar-evi.webp`<br>`mekanlar/cami.webp` | 02 | istek |  | |
| B26 | olay yeri | 2x2 | `mekanlar/okul.webp`<br>`mekanlar/karakol.webp`<br>`mekanlar/bakkal.webp`<br>`mekanlar/cesme.webp` | 02 | istek |  | |
| B27 | olay yeri | 2x2 | `mekanlar/mezarlik.webp`<br>`mekanlar/harman-yeri.webp`<br>`mekanlar/fistiklik.webp`<br>`mekanlar/bag-evi.webp` | 02 | istek |  | |
| B28 | olay yeri | 2x2 | `mekanlar/magara.webp`<br>`mekanlar/sinir-patikasi.webp`<br>`mekanlar/agil.webp`<br>`mekanlar/halil-evi.webp` | 02 | istek |  | |
| B29 | olay yeri | 2x2 | `mekanlar/gulsum-evi.webp`<br>`mekanlar/sultan-evi.webp`<br>`mekanlar/ebe-evi.webp`<br>`mekanlar/irgat-evi.webp` | 02 | istek |  | |
| B30 | iz nesnesi | 4x3 | `izler/carik-izi.png`<br>`izler/postal-izi.png`<br>`izler/cizme-izi.png`<br>`izler/yalin-ayak-izi.png`<br>`izler/nal-izi.png`<br>`izler/ters-nal-izi.png`<br>`izler/un-izi.png`<br>`izler/izmarit.png`<br>`izler/kehribar-tespih.png`<br>`izler/altin-bilezik.png`<br>`izler/anahtar-destesi.png`<br>`izler/sedef-cakmak.png` | 03 | istek |  | |
| B31 | iz nesnesi | 4x3 | `izler/muhtar-muhru.png`<br>`izler/kasket.png`<br>`izler/mor-oya.png`<br>`izler/mektup-destesi.png`<br>`izler/kiraz-baston.png`<br>`izler/mesin-kese.png`<br>`izler/dolma-kalem.png`<br>`izler/tel-gozluk.png`<br>`izler/tufek-kovani.png`<br>`izler/pirinc-duduk.png`<br>`izler/boynuz-kama.png`<br>`izler/tutun-tabakasi.png` | 03 | istek |  | |
| B32 | iz nesnesi | 4x3 | `izler/mavi-boncuk.png`<br>`izler/bakir-gugum.png`<br>`izler/asker-dugmesi.png`<br>`izler/ot-torbasi.png`<br>`izler/gobek-makasi.png`<br>`izler/veresiye-defteri.png`<br>`izler/kopya-kalemi.png`<br>`izler/raki-sisesi.png`<br>`izler/kaval.png`<br>`izler/kirmizi-yun-yumagi.png`<br>`izler/keci-cingiragi.png`<br>`izler/teneke-masrapa.png` | 03 | istek |  | |
| B33 | iz nesnesi | 4x3 | `izler/gaz-lambasi.png`<br>`izler/orme-kirbac.png`<br>`izler/gemici-feneri.png`<br>`izler/orak.png`<br>`izler/bakir-sini.png`<br>`izler/pirinc-can.png`<br>`izler/kama.png`<br>`izler/balta.png`<br>`izler/kazma.png`<br>`izler/kurek.png`<br>`izler/dirgen.png`<br>`izler/urgan.png` | 03 | istek |  | |
| B34 | iz nesnesi | 4x3 | `izler/bag-bicagi.png`<br>`izler/demir-cubuk.png`<br>`izler/sican-otu.png`<br>`izler/av-kovani.png`<br>`izler/kumas-lifi.png`<br>`izler/kece-tuyu.png`<br>`izler/kan-lekesi.png`<br>`izler/kan-damlalari.png` | 03 | istek |  | |
| B35 | kayıp sahnesi | 2x2 | `kayip/mahmut.webp`<br>`kayip/zeliha.webp`<br>`kayip/cemil.webp`<br>`kayip/dursun.webp` | 05 | istek |  | |
| B36 | kayıp sahnesi | 2x2 | `kayip/naciye.webp`<br>`kayip/elif.webp`<br>`kayip/abdullah.webp`<br>`kayip/nihat.webp` | 05 | istek |  | |
| B37 | kayıp sahnesi | 2x2 | `kayip/riza.webp`<br>`kayip/halil.webp`<br>`kayip/fadime.webp`<br>`kayip/bekir.webp` | 05 | istek |  | |
| B38 | kayıp sahnesi | 2x2 | `kayip/yusuf.webp`<br>`kayip/hatice.webp`<br>`kayip/arif.webp`<br>`kayip/kazim.webp` | 05 | istek |  | |
| B39 | kayıp sahnesi | 2x2 | `kayip/hasan.webp`<br>`kayip/gulsum.webp`<br>`kayip/bektas.webp`<br>`kayip/kadir.webp` | 05 | istek |  | |
| B40 | kayıp sahnesi | 2x2 | `kayip/ismail.webp`<br>`kayip/emine.webp`<br>`kayip/suleyman.webp` | 05 | istek |  | |
| B41 | pencere: meydan | tek | `pencere/meydan.webp` | 05 | istek |  | |
| B42 | pencere: öfkeli kalabalık | tek | `pencere/kalabalik-ofke.png` | 05 | istek |  | |
| B43 | pencere: coşkulu kalabalık (öfkeli resmi düzenle, yerleşim aynı) | tek | `pencere/kalabalik-cosku.png` | 05 | istek |  | |
| B44 | pencere: oda ve müfettiş | tek | `pencere/oda.png` | 05 | istek |  | |
| B45 | arayüz | 2x2 | `arayuz/fotograf-cercevesi.png`<br>`arayuz/defter-kapak.png`<br>`arayuz/daktilo-kagidi.png`<br>`arayuz/baslik.png` | 06 | istek |  | |
| B46 | arayüz: masa zemini | tek | `arayuz/masa-zemini.webp` | 06 | istek |  | |
| B47 | sorgu odası arka | tek | `oda/arka.webp` | 04 | beklemede | ışık kararı bekleniyor | |
| B48 | sorgu odası parçaları | 2x2 | `oda/kapi.png`<br>`oda/lamba.png`<br>`oda/sandalye.png`<br>`oda/masa.png` | 04 | beklemede | ışık kararı bekleniyor | |

## main2'den alınanlar

Kabul (yeniden üretilmez): `izler/kirmizi-yun.png`, `izler/cep-saati.png`, `izler/anahtar.png`, `izler/kopuk-tespih.png`, `izler/makas.png`, `izler/demirci-cekici.png`, `izler/kanli-bez.png`, `izler/yirtik-mektup.png`, `izler/bos-civi.png`, `izler/sise.png`, `arayuz/dugme-kan.png`, `arayuz/dugme-koyu.png`, `arayuz/dugme-kare.png`, `arayuz/defter.webp`, `mekanlar/degirmen.webp`, `mekanlar/demirci-dukkani.webp`, `kayip/sultan.webp`.

Geçici (yerine yenisi istenecek): `oda/sandalye.png (main2)`, `oda/masa.png (main2)`, `oda/kapi.png (main2)`, `oda/ampul.png (main2)`.

Reddedilenler ve sebepleri:
- 20 köylü portresi (`suspects/`): kişiler bizim köyün 24 kişisi değil, giyimleri Avrupa kasabası gibi. Tarz beğenildi; üçü `tarz/` içinde örnek olarak duruyor.
- `sapel`, `eczane`, `han`, `kayikhane`: köyde böyle yerler yok.
- `room_bg`: modern beton oda.
- `crowd_calm`, `crowd_riot`: fötr şapkalı kalabalık, kaldırım taşı.
- `loss_bench`, `loss_family`, `loss_workshop`: Avrupa kasabası gibi.
- `muddy_boot`: modern lastik taban. `cigar_stub`: köyde puro yok.
- `polaroid_frame`: Polaroid 1948'de çıktı.
