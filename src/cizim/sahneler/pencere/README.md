# Pencere sahnesi

Final Verdict'ten sonra, kayıp sahnelerinin ardından oynar. Müfettiş karanlık karakol odasında kapıdan pencereye yürür, başını eğip aşağıdaki meydana bakar. Kalabalığın tavrı doğru bulunan katil sayısına bağlıdır; sayı ekranda hiçbir biçimde yazmaz.

Deneme sayfası: `prototip/pencere/index.html` (Vite dev sunucusunda). Adres parametreleri: `?dogru=0..7&tohum=N`; `&an=saniye` kareyi o ana sabitler (ekran görüntüsü için), `&gizle=1` seçicileri gizler.

## Arayüz

```js
import {pencereBaslat} from './sahne.js';
const sahne = pencereBaslat({dogru, tohum, tuval, bitince, zaman});
sahne.durdur();   // döngüyü ve boyut dinleyicisini kapatır
sahne.bitis;      // sahnenin son durumuna vardığı saniye
```

| Parametre | Anlamı |
| --- | --- |
| `dogru` | 0..7, doğru bulunan katil sayısı. |
| `tohum` | Kalabalığı, taş atışlarını ve cam kirini belirler. Aynı tohum ve aynı `dogru`, aynı sahne. |
| `tuval` | Canvas öğesi. Verilmezse `tuvalKur` önceden çağrılmış olmalı. |
| `bitince` | Sahne son durumuna varınca bir kez çağrılır (sonraki bölüme geçiş için). Sahne bundan sonra da canlı kalır: kalabalık sallanır, ışık titrer. |
| `zaman` | Yalnızca sınama: `() => saniye`. Verilirse kare o ana sabitlenir. Sahne zamanın saf işlevidir; aynı an, aynı kare. |

`prefers-reduced-motion` (`azHareket`): yürüyüş ve uçan taşlar atlanır, son durum (müfettiş pencerede, bütün çatlaklar camda, kalabalık donuk) gösterilir; `bitince` `ZAMAN.azHareketBekle` saniye sonra çağrılır.

## Doğru sayısı nasıl görünür

`oran = (7 - dogru) / 6` (0 ile 1 arasına kırpılır): 7 → 0 (hepsi coşkulu), 1 ve 0 → 1 (hepsi öfkeli).

- **Coşku:** iki kol havada, tek kol sallayan, feneri yukarı kaldıran ya da yanda tutan figürler; baş yana sallanır; ışık sıcak ve sakin titrer.
- **Öfke:** meşale, tırpan, dirgen, orak, sopa ya da yumruk havada, kol pompalar, baş öne atılır (bağırma); yakındakilerin yüzünde ağız lekesi; gökte duman; ışık kırmızımsı ve hızlı titrer. Cama taş ve kesek atılır: taş çatlak, kesek çamur bırakır, izler birikir. `dogru=0` en kötüsüdür: üç taş fazla, meşale daha çok.
- **Arada:** kalabalık ikiye bölünür, öfkeli grubun eni `oran`la büyür. Hangi grubun solda durduğu tohumla seçilir; aralarında boş bir şerit kalır, kenardakiler boşluğa doğru eğilir (öfkeli) ya da geri çekilir (coşkulu). Oran tohumla biraz oynatılır ve kişi sayısı da tohuma bağlıdır; bu yüzden figür saymak doğru sayısını vermez.

## Dosyalar ve katmanlar

| Dosya | İçerik |
| --- | --- |
| `ayar.js` | Bütün ayar nesneleri (aşağıda). |
| `yerlesim.js` | `yerlesimKur()`: ekran genişliğine göre oda geometrisi (`Y`), `camNokta(a,b)`: cam üzerindeki noktayı perspektifle ekrana taşır. |
| `oda.js` | `odaArka` (tavan, kirişler, arka duvar, kapı, taka, sol duvar, pencere boşluğu), `dograma` (kasa, dikme, kayıtlar, denizlik), `masa` (ön plandaki masa, bağlı yedi dosya, sönük gaz lambası), `odaIsigi` (tavana vuran pencere deseni, pervazlar), `masaIsigi`. |
| `dis.js` | `disArka`: gök, toprak damlı evler, dut ağacı, kuyu, zemin. `disIsik`: ev cephelerine ve dumana vuran ışık. |
| `kalabalik.js` | `kalabalikKur(dogru,tohum)`: tohumlu kalabalık; `kalabalikCiz`, `zeminIsigi`, `alevler`, `titre`, `ortalamaIsik`. |
| `tas.js` | `tasPlani`: atış çizelgesi ve çatlak geometrisi; `ucanlar`, `camIzleri`, `irkilme`. |
| `mufettis.js` | Müfettişin silueti (ortak iskelete bağlı değil). |
| `sahne.js` | `pencereBaslat`, kare döngüsü, çizim sırası. |

Çizim sırası (her kare):

1. `odaArka` (ön bellek).
2. `odaIsigi`: tavandaki pencere deseni, pervazlar, odaya taşan parıltı.
3. Cam şekline kırpılmış dışarısı: `disArka` (ön bellek), `disIsik`, zemine düşen ışık, kalabalık (uzaktan yakına; her ışığın havadaki parıltısı kendinden öndeki sıralardan önce çizilir, öndekiler ona karşı siluet kalır), alevler, uçan taşlar, eski camın kiri.
4. `camIzleri`: çatlaklar ve çamur.
5. `dograma` (ön bellek).
6. Müfettiş.
7. `masa` (ön bellek) ve `masaIsigi`.
8. Açılış kararması, ortak `kaplama`.

## Ayar nesneleri (`ayar.js`)

- `OLCU`: tasarım yüksekliği 1200, en az genişlik 700, hatların kaynama hızı.
- `YERLESIM`: iki el ayarı yerleşim, `dar` (telefon dikey, yarım genişlik 350) ve `genis` (PC yatay, 1066); aradaki ekranlar ikisinin arasından okunur. Alanlar: kaçış noktası `kn`, arka duvar `arka` ve derinliği `sArka`, pencerenin uzak/yakın kenar derinliği ve üst/alt yüksekliği, masa, müfettişin başlangıç ve bitiş konumu, kapı.
- `MUFETTIS`: omuzdan ayağa boy, palto eteği, omuz eni, adım sayısı, salınım ve zıplama.
- `ZAMAN`: açılış, belirme, yürüyüş, eğilme; taşların başlangıcı, aralığı ve uçuş süresi; bitiş.
- `KALABALIK`: dış resmin ölçüsü ve ufku, sıra ve sıra başı kişi aralığı, iki grup arası boşluk, oran sapması.
- `OFKE_ESYA`, `COSKU_DURUS`: el eşyası ve kol duruşu olasılıkları.
- `GIYSI`, `BASLIK`: aba, entari, kepenek, şalta; kasket, poşu, yemeni, külah, başı açık.
- `RENK`: giysi tonları, iki grubun alev ve ışık rengi, oda ışığı, ahşap, cam.

## Kurallara uyum

- Yürüyen bacak yok: palto ayak bileğine iner; uzaktayken alt gövdeyi masa, yaklaşınca kadraj alt kenarı keser. Hareket gövde salınımı, hafif zıplama ve büyümeyle verilir.
- Kalabalıkta ayaklar iki küçük, hareketsiz leke; el yalnızca kol ucunda küçük bir yumru; yüz en fazla iki leke (ışığın yakaladığı yüz, bağıran ağız). Uzaktakiler daha koyu, ayrıntısız silüet. Ön sıranın ayakları pencere denizliğinin altında kalır.
- Tek ışık kaynağı: odada elektrik yok, bütün aydınlık pencereden, kalabalığın meşale ve fenerlerinden gelir.
