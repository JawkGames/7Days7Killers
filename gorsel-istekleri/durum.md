# Görsel iş listesi

Gemini her oturumda bu tabloya bakar. Sırayla `istek` durumundaki kalemleri üretir ve `üretildi` yapar. `kabul` ve `ret` yazan yalnızca Claude'dur. Yollar `varliklar/gorsel/` altındadır. İstemler grup numarasıyla aynı adlı dosyadadır (`01-koyluler.md` gibi).

Durumlar: `istek` (üret), `sırada` (henüz üretme), `beklemede` (karar bekleniyor, üretme), `üretildi` (Claude bakacak), `kabul`, `ret` (sebep notta; düzeltip yeniden üret).

## Önce pilot

İlk iş yalnızca üç köylü: Hacı Ağa, Kör Halil, Muhtarın Kızı. Üçü birbirine ve tarz örneklerine uyuyorsa, kadraj ve göz/ağız kareleri tutuyorsa kalan 21 köylü `istek` olur. Olay yerleri, izler, sonlar ve arayüz pilotu beklemeden üretilebilir.

| # | Grup | Dosya | Durum | Not | Gemini notu |
| --- | --- | --- | --- | --- | --- |
| 1 | 01 pilot | `kisiler/mahmut/temel.png` | istek |  | |
| 2 | 01 pilot | `kisiler/mahmut/goz-kapali.png` | istek |  | |
| 3 | 01 pilot | `kisiler/mahmut/agiz-acik.png` | istek |  | |
| 4 | 01 pilot | `kisiler/halil/temel.png` | istek |  | |
| 5 | 01 pilot | `kisiler/halil/goz-kapali.png` | istek |  | |
| 6 | 01 pilot | `kisiler/halil/agiz-acik.png` | istek |  | |
| 7 | 01 pilot | `kisiler/elif/temel.png` | istek |  | |
| 8 | 01 pilot | `kisiler/elif/goz-kapali.png` | istek |  | |
| 9 | 01 pilot | `kisiler/elif/agiz-acik.png` | istek |  | |
| 10 | 01 | `kisiler/zeliha/temel.png` | sırada | pilot onaylanınca | |
| 11 | 01 | `kisiler/zeliha/goz-kapali.png` | sırada | pilot onaylanınca | |
| 12 | 01 | `kisiler/zeliha/agiz-acik.png` | sırada | pilot onaylanınca | |
| 13 | 01 | `kisiler/cemil/temel.png` | sırada | pilot onaylanınca | |
| 14 | 01 | `kisiler/cemil/goz-kapali.png` | sırada | pilot onaylanınca | |
| 15 | 01 | `kisiler/cemil/agiz-acik.png` | sırada | pilot onaylanınca | |
| 16 | 01 | `kisiler/dursun/temel.png` | sırada | pilot onaylanınca | |
| 17 | 01 | `kisiler/dursun/goz-kapali.png` | sırada | pilot onaylanınca | |
| 18 | 01 | `kisiler/dursun/agiz-acik.png` | sırada | pilot onaylanınca | |
| 19 | 01 | `kisiler/naciye/temel.png` | sırada | pilot onaylanınca | |
| 20 | 01 | `kisiler/naciye/goz-kapali.png` | sırada | pilot onaylanınca | |
| 21 | 01 | `kisiler/naciye/agiz-acik.png` | sırada | pilot onaylanınca | |
| 22 | 01 | `kisiler/abdullah/temel.png` | sırada | pilot onaylanınca | |
| 23 | 01 | `kisiler/abdullah/goz-kapali.png` | sırada | pilot onaylanınca | |
| 24 | 01 | `kisiler/abdullah/agiz-acik.png` | sırada | pilot onaylanınca | |
| 25 | 01 | `kisiler/nihat/temel.png` | sırada | pilot onaylanınca | |
| 26 | 01 | `kisiler/nihat/goz-kapali.png` | sırada | pilot onaylanınca | |
| 27 | 01 | `kisiler/nihat/agiz-acik.png` | sırada | pilot onaylanınca | |
| 28 | 01 | `kisiler/riza/temel.png` | sırada | pilot onaylanınca | |
| 29 | 01 | `kisiler/riza/goz-kapali.png` | sırada | pilot onaylanınca | |
| 30 | 01 | `kisiler/riza/agiz-acik.png` | sırada | pilot onaylanınca | |
| 31 | 01 | `kisiler/fadime/temel.png` | sırada | pilot onaylanınca | |
| 32 | 01 | `kisiler/fadime/goz-kapali.png` | sırada | pilot onaylanınca | |
| 33 | 01 | `kisiler/fadime/agiz-acik.png` | sırada | pilot onaylanınca | |
| 34 | 01 | `kisiler/bekir/temel.png` | sırada | pilot onaylanınca | |
| 35 | 01 | `kisiler/bekir/goz-kapali.png` | sırada | pilot onaylanınca | |
| 36 | 01 | `kisiler/bekir/agiz-acik.png` | sırada | pilot onaylanınca | |
| 37 | 01 | `kisiler/yusuf/temel.png` | sırada | pilot onaylanınca | |
| 38 | 01 | `kisiler/yusuf/goz-kapali.png` | sırada | pilot onaylanınca | |
| 39 | 01 | `kisiler/yusuf/agiz-acik.png` | sırada | pilot onaylanınca | |
| 40 | 01 | `kisiler/hatice/temel.png` | sırada | pilot onaylanınca | |
| 41 | 01 | `kisiler/hatice/goz-kapali.png` | sırada | pilot onaylanınca | |
| 42 | 01 | `kisiler/hatice/agiz-acik.png` | sırada | pilot onaylanınca | |
| 43 | 01 | `kisiler/arif/temel.png` | sırada | pilot onaylanınca | |
| 44 | 01 | `kisiler/arif/goz-kapali.png` | sırada | pilot onaylanınca | |
| 45 | 01 | `kisiler/arif/agiz-acik.png` | sırada | pilot onaylanınca | |
| 46 | 01 | `kisiler/kazim/temel.png` | sırada | pilot onaylanınca | |
| 47 | 01 | `kisiler/kazim/goz-kapali.png` | sırada | pilot onaylanınca | |
| 48 | 01 | `kisiler/kazim/agiz-acik.png` | sırada | pilot onaylanınca | |
| 49 | 01 | `kisiler/hasan/temel.png` | sırada | pilot onaylanınca | |
| 50 | 01 | `kisiler/hasan/goz-kapali.png` | sırada | pilot onaylanınca | |
| 51 | 01 | `kisiler/hasan/agiz-acik.png` | sırada | pilot onaylanınca | |
| 52 | 01 | `kisiler/gulsum/temel.png` | sırada | pilot onaylanınca | |
| 53 | 01 | `kisiler/gulsum/goz-kapali.png` | sırada | pilot onaylanınca | |
| 54 | 01 | `kisiler/gulsum/agiz-acik.png` | sırada | pilot onaylanınca | |
| 55 | 01 | `kisiler/bektas/temel.png` | sırada | pilot onaylanınca | |
| 56 | 01 | `kisiler/bektas/goz-kapali.png` | sırada | pilot onaylanınca | |
| 57 | 01 | `kisiler/bektas/agiz-acik.png` | sırada | pilot onaylanınca | |
| 58 | 01 | `kisiler/sultan/temel.png` | sırada | pilot onaylanınca | |
| 59 | 01 | `kisiler/sultan/goz-kapali.png` | sırada | pilot onaylanınca | |
| 60 | 01 | `kisiler/sultan/agiz-acik.png` | sırada | pilot onaylanınca | |
| 61 | 01 | `kisiler/kadir/temel.png` | sırada | pilot onaylanınca | |
| 62 | 01 | `kisiler/kadir/goz-kapali.png` | sırada | pilot onaylanınca | |
| 63 | 01 | `kisiler/kadir/agiz-acik.png` | sırada | pilot onaylanınca | |
| 64 | 01 | `kisiler/ismail/temel.png` | sırada | pilot onaylanınca | |
| 65 | 01 | `kisiler/ismail/goz-kapali.png` | sırada | pilot onaylanınca | |
| 66 | 01 | `kisiler/ismail/agiz-acik.png` | sırada | pilot onaylanınca | |
| 67 | 01 | `kisiler/emine/temel.png` | sırada | pilot onaylanınca | |
| 68 | 01 | `kisiler/emine/goz-kapali.png` | sırada | pilot onaylanınca | |
| 69 | 01 | `kisiler/emine/agiz-acik.png` | sırada | pilot onaylanınca | |
| 70 | 01 | `kisiler/suleyman/temel.png` | sırada | pilot onaylanınca | |
| 71 | 01 | `kisiler/suleyman/goz-kapali.png` | sırada | pilot onaylanınca | |
| 72 | 01 | `kisiler/suleyman/agiz-acik.png` | sırada | pilot onaylanınca | |
| 73 | 02 | `mekanlar/aga-konagi.webp` | istek |  | |
| 74 | 02 | `mekanlar/koy-odasi.webp` | istek |  | |
| 75 | 02 | `mekanlar/muhtar-evi.webp` | istek |  | |
| 76 | 02 | `mekanlar/cami.webp` | istek |  | |
| 77 | 02 | `mekanlar/okul.webp` | istek |  | |
| 78 | 02 | `mekanlar/karakol.webp` | istek |  | |
| 79 | 02 | `mekanlar/bakkal.webp` | istek |  | |
| 80 | 02 | `mekanlar/cesme.webp` | istek |  | |
| 81 | 02 | `mekanlar/mezarlik.webp` | istek |  | |
| 82 | 02 | `mekanlar/harman-yeri.webp` | istek |  | |
| 83 | 02 | `mekanlar/fistiklik.webp` | istek |  | |
| 84 | 02 | `mekanlar/bag-evi.webp` | istek |  | |
| 85 | 02 | `mekanlar/magara.webp` | istek |  | |
| 86 | 02 | `mekanlar/sinir-patikasi.webp` | istek |  | |
| 87 | 02 | `mekanlar/agil.webp` | istek |  | |
| 88 | 02 | `mekanlar/halil-evi.webp` | istek |  | |
| 89 | 02 | `mekanlar/gulsum-evi.webp` | istek |  | |
| 90 | 02 | `mekanlar/sultan-evi.webp` | istek |  | |
| 91 | 02 | `mekanlar/ebe-evi.webp` | istek |  | |
| 92 | 02 | `mekanlar/irgat-evi.webp` | istek |  | |
| 93 | 03 | `izler/carik-izi.png` | istek |  | |
| 94 | 03 | `izler/postal-izi.png` | istek |  | |
| 95 | 03 | `izler/cizme-izi.png` | istek |  | |
| 96 | 03 | `izler/yalin-ayak-izi.png` | istek |  | |
| 97 | 03 | `izler/nal-izi.png` | istek |  | |
| 98 | 03 | `izler/ters-nal-izi.png` | istek |  | |
| 99 | 03 | `izler/un-izi.png` | istek |  | |
| 100 | 03 | `izler/izmarit.png` | istek |  | |
| 101 | 03 | `izler/kehribar-tespih.png` | istek |  | |
| 102 | 03 | `izler/altin-bilezik.png` | istek |  | |
| 103 | 03 | `izler/anahtar-destesi.png` | istek |  | |
| 104 | 03 | `izler/sedef-cakmak.png` | istek |  | |
| 105 | 03 | `izler/muhtar-muhru.png` | istek |  | |
| 106 | 03 | `izler/kasket.png` | istek |  | |
| 107 | 03 | `izler/mor-oya.png` | istek |  | |
| 108 | 03 | `izler/mektup-destesi.png` | istek |  | |
| 109 | 03 | `izler/kiraz-baston.png` | istek |  | |
| 110 | 03 | `izler/mesin-kese.png` | istek |  | |
| 111 | 03 | `izler/dolma-kalem.png` | istek |  | |
| 112 | 03 | `izler/tel-gozluk.png` | istek |  | |
| 113 | 03 | `izler/tufek-kovani.png` | istek |  | |
| 114 | 03 | `izler/pirinc-duduk.png` | istek |  | |
| 115 | 03 | `izler/boynuz-kama.png` | istek |  | |
| 116 | 03 | `izler/tutun-tabakasi.png` | istek |  | |
| 117 | 03 | `izler/mavi-boncuk.png` | istek |  | |
| 118 | 03 | `izler/bakir-gugum.png` | istek |  | |
| 119 | 03 | `izler/asker-dugmesi.png` | istek |  | |
| 120 | 03 | `izler/ot-torbasi.png` | istek |  | |
| 121 | 03 | `izler/gobek-makasi.png` | istek |  | |
| 122 | 03 | `izler/veresiye-defteri.png` | istek |  | |
| 123 | 03 | `izler/kopya-kalemi.png` | istek |  | |
| 124 | 03 | `izler/raki-sisesi.png` | istek |  | |
| 125 | 03 | `izler/kaval.png` | istek |  | |
| 126 | 03 | `izler/kirmizi-yun-yumagi.png` | istek |  | |
| 127 | 03 | `izler/keci-cingiragi.png` | istek |  | |
| 128 | 03 | `izler/teneke-masrapa.png` | istek |  | |
| 129 | 03 | `izler/gaz-lambasi.png` | istek |  | |
| 130 | 03 | `izler/orme-kirbac.png` | istek |  | |
| 131 | 03 | `izler/gemici-feneri.png` | istek |  | |
| 132 | 03 | `izler/orak.png` | istek |  | |
| 133 | 03 | `izler/bakir-sini.png` | istek |  | |
| 134 | 03 | `izler/pirinc-can.png` | istek |  | |
| 135 | 03 | `izler/kama.png` | istek |  | |
| 136 | 03 | `izler/balta.png` | istek |  | |
| 137 | 03 | `izler/kazma.png` | istek |  | |
| 138 | 03 | `izler/kurek.png` | istek |  | |
| 139 | 03 | `izler/dirgen.png` | istek |  | |
| 140 | 03 | `izler/urgan.png` | istek |  | |
| 141 | 03 | `izler/bag-bicagi.png` | istek |  | |
| 142 | 03 | `izler/demir-cubuk.png` | istek |  | |
| 143 | 03 | `izler/sican-otu.png` | istek |  | |
| 144 | 03 | `izler/av-kovani.png` | istek |  | |
| 145 | 03 | `izler/kumas-lifi.png` | istek |  | |
| 146 | 03 | `izler/kece-tuyu.png` | istek |  | |
| 147 | 03 | `izler/kan-lekesi.png` | istek |  | |
| 148 | 03 | `izler/kan-damlalari.png` | istek |  | |
| 149 | 05 A | `kayip/mahmut.webp` | istek |  | |
| 150 | 05 A | `kayip/zeliha.webp` | istek |  | |
| 151 | 05 A | `kayip/cemil.webp` | istek |  | |
| 152 | 05 A | `kayip/dursun.webp` | istek |  | |
| 153 | 05 A | `kayip/naciye.webp` | istek |  | |
| 154 | 05 A | `kayip/elif.webp` | istek |  | |
| 155 | 05 A | `kayip/abdullah.webp` | istek |  | |
| 156 | 05 A | `kayip/nihat.webp` | istek |  | |
| 157 | 05 A | `kayip/riza.webp` | istek |  | |
| 158 | 05 A | `kayip/halil.webp` | istek |  | |
| 159 | 05 A | `kayip/fadime.webp` | istek |  | |
| 160 | 05 A | `kayip/bekir.webp` | istek |  | |
| 161 | 05 A | `kayip/yusuf.webp` | istek |  | |
| 162 | 05 A | `kayip/hatice.webp` | istek |  | |
| 163 | 05 A | `kayip/arif.webp` | istek |  | |
| 164 | 05 A | `kayip/kazim.webp` | istek |  | |
| 165 | 05 A | `kayip/hasan.webp` | istek |  | |
| 166 | 05 A | `kayip/gulsum.webp` | istek |  | |
| 167 | 05 A | `kayip/bektas.webp` | istek |  | |
| 168 | 05 A | `kayip/kadir.webp` | istek |  | |
| 169 | 05 A | `kayip/ismail.webp` | istek |  | |
| 170 | 05 A | `kayip/emine.webp` | istek |  | |
| 171 | 05 A | `kayip/suleyman.webp` | istek |  | |
| 172 | 05 B | `pencere/meydan.webp` | istek |  | |
| 173 | 05 B | `pencere/kalabalik-ofke.png` | istek |  | |
| 174 | 05 B | `pencere/kalabalik-cosku.png` | istek |  | |
| 175 | 05 B | `pencere/oda.png` | istek |  | |
| 176 | 06 | `arayuz/fotograf-cercevesi.png` | istek |  | |
| 177 | 06 | `arayuz/masa-zemini.webp` | istek |  | |
| 178 | 06 | `arayuz/defter-kapak.png` | istek |  | |
| 179 | 06 | `arayuz/daktilo-kagidi.png` | istek |  | |
| 180 | 06 | `arayuz/baslik.png` | istek |  | |
| 181 | 04 | `oda/arka.webp` | beklemede | ışık kararı: ampul mü gaz lambası mı | |
| 182 | 04 | `oda/kapi.png` | beklemede | ışık kararı: ampul mü gaz lambası mı | |
| 183 | 04 | `oda/lamba.png` | beklemede | ışık kararı: ampul mü gaz lambası mı | |
| 184 | 04 | `oda/sandalye.png` | beklemede | ışık kararı: ampul mü gaz lambası mı | |
| 185 | 04 | `oda/masa.png` | beklemede | ışık kararı: ampul mü gaz lambası mı | |

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
