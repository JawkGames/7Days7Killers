# Ses katmanı

Ortam sesleri ve efektler tamamen kodla (Web Audio API) üretilir; hiçbir ses dosyası yoktur. Konuşma sesi yoktur ve olmayacak: köylü konuşurken ağız oynar, alt yazı harf harf çıkar; ses katmanı yalnızca her harfte çok hafif bir daktilo tıkı verir. Müzik yok; en fazla `kayip` ortamındaki alçak, uzun ton.

Deneme sayfası: `prototip/ses/` (`npm run dev`, sonra `/prototip/ses/`). Testler: `testler/ses.test.js`.

| Dosya | Ne yapar |
| --- | --- |
| `index.js` | Dış arayüz, ortak motor, olay kanalına bağlanma |
| `motor.js` | `sesMotoru()`: bağlamın yaşamı, ana karışım, ortam geçişi, efekt kurma |
| `ortamlar.js` | Ortam tarifini sürekli katmanlara ve kendiliğinden çalan olaylara çevirir |
| `efektler.js` | Efekt tarifini düğümlere çevirir |
| `tarif.js` | Saf: bütün sayılar (frekans, süre, kazanç), ortam tarifleri, olay zamanlaması |
| `uretec.js` | Saf: döngüye uygun gürültü, yankı darbesi, alkış dokusu, ters ton, sınırlayıcı eğrisi |

## Arayüz

```js
import {sesBaslat, sesAc, ortam, ortamOrani, efekt, duzey, sustur, kis, sesDurumu, sesOlaylaraBagla} from './ses/index.js';
import {olaylar} from './cekirdek/olay.js';

sesBaslat({tohum: 1943, duzey: 0.8});   // bir kez; ilk dokunma/tuşta bağlamı açar, sayfa gizlenince askıya alır
sesOlaylaraBagla(olaylar);              // isteğe bağlı: aşağıdaki olaylarla sürmek için

ortam('sorgu-odasi', {gecis: 2});       // çapraz geçiş (sn). Açılmadan istenirse saklanır, açılınca çalar
ortam('sorgu-odasi', {isik: 'lamba'});  // 'ampul' (varsayılan, 100 Hz uğultu) | 'lamba' (gaz lambası hışırtısı)
ortam('pencere', {oran: 2/7});          // 0 = coşku, 1 = öfke; 'pencere-cosku' / 'pencere-ofke' kısayolları
ortamOrani(0.8, {gecis: 1.5});          // pencere açıkken oranı kaydırır (yeniden kurmaz)
ortam(null, {gecis: 3});                // sus

efekt('kapi-ac');                       // bitiş zamanını (bağlam sn) ya da çalmadıysa null döndürür
efekt('adim', {sayi: 4, siddet: 0.8});  // siddet 0..1.5; tohum verilirse aynı ses
efekt('daktilo');                       // 22 ms'den sık çağrılırsa yutulur

duzey(0.6);    // 0..1 (algıya göre: kazanç = düzey²); argümansız çağrı şimdiki düzeyi döndürür
sustur(true);  // sessiz kip
kis(0.5);      // ortamı kısar (efektler kısılmaz); 0 kaldırır
sesDurumu();   // {destek, acik, baglamDurumu, ortam, oran, duzey, sessiz, kisma, gizli}
```

- **Ortamlar:** `sorgu-odasi`, `fotograf-masasi`, `gece-koy`, `kayip`, `pencere-cosku`, `pencere-ofke` (+ `pencere` ve `oran`).
- **Efektler:** `daktilo`, `kapi-ac`, `kapi-kapa`, `sandalye`, `adim`, `sayfa`, `kalem`, `iz`, `gun`, `geri-sar`, `hukum`. Ortamların kendi olayları da (`tahta`, `havlama`, `baykus`, `hisirti`, `tik`, `citirti`, `tas`, `cam`, `bagiris`, `tezahurat`) `efekt` ile çağrılabilir.
- **Tarayıcı kuralı:** bağlam kullanıcı hareketi olmadan açılmaz. `sesBaslat` hareketi kendisi dinler; bir düğmenin işleyicisinde `sesAc()` doğrudan da çağrılabilir. Açılmadan istenen efekt atılır (sonradan, yanlış yerde çalmasın diye).
- **Destek yoksa** (Node, eski tarayıcı) bütün işlevler hata atmadan boşa düşer. Node'da içe aktarmak güvenlidir.
- **Rastgelelik** yalnızca `cekirdek/rastgele.js`'teki `rng` ile; `Math.random` yok. Motorun tohumu her efekte ve ortama alt tohum dağıtır; `tohum` verilirse o ses hep aynıdır.

## Olaylar (ortak kanal `cekirdek/olay.js`)

`sesOlaylaraBagla(olaylar, {ses})` bırakıcı döndürür. `ses` verilmezse ortak motor kullanılır.

| Olay | Veri | Ne olur |
| --- | --- | --- |
| `ses.ac` | - | `sesAc()` (bir kullanıcı hareketi içinden bildirilmeli) |
| `ses.ortam` | `'ad'` ya da `{ad, gecis, oran, isik, tohum}`; `null` susturur | `ortam(ad, ops)` |
| `ses.efekt` | `'ad'` ya da `{ad, siddet, tohum, sayi}` | `efekt(ad, ops)` |
| `ses.duzey` | `0..1` | `duzey` |
| `ses.sustur` | `true/false` | `sustur` |
| `ses.kis` | `0..1` ya da `{miktar, sure}` | `kis` |
| `sahne.degisti` | `'sahne'` ya da `{sahne, gecis, dogru, toplam, oran}` | sahneye göre ortam (tablo aşağıda) |
| `pencere.oran` | `{dogru, toplam=7}` ya da `{oran}` ya da sayı | pencere oranını kaydırır |
| `konusma.harf` | `'h'` ya da `{harf, siddet}` | `daktilo` (boşluk ve satır sonu için çalmaz) |
| `kapi.acildi` / `kapi.kapandi` | `{siddet, tohum}` isteğe bağlı | `kapi-ac` / `kapi-kapa` |
| `sandalye.cekildi` | " | `sandalye` |
| `adim` | `{sayi}` | `adim` |
| `defter.sayfa` / `defter.yazildi` | " | `sayfa` / `kalem` |
| `iz.bulundu` | " | `iz` |
| `zaman.gun` | " | `gun` (gün geçişi) |
| `zaman.geriSar` | " | `geri-sar` (Rewind) |
| `hukum.verildi` | " | `hukum` |

`sahne.degisti` eşlemesi (`SAHNE_ORTAM`): `sorgu`, `cagirma` -> `sorgu-odasi`; `fotograf`, `gun-basi` -> `fotograf-masasi`; `gun-sonu` -> `gece-koy`; `kayip`, `karar`, `aciklama` -> `kayip`; `pencere` -> `pencere` (oran `{dogru, toplam}`'dan: 7/7 doğru = 0 coşku, 0 doğru = 1 öfke). Ortam adlarının kendisi de geçerlidir.

## Karışım ve düzeyler

```
ortam -> ortamYolu -> kısma ─┐
efekt -> efektYolu ──────────┼-> ana (düzey²) -> sessiz -> alçak geçiren 6.5 kHz -> DC kesici 24 Hz -> sınırlayıcı -> çıkış
yankı gönderimleri -> yankı ─┘   (yankı: tohumlu, kararan 1.8 sn darbe)
```

- Sınırlayıcı bir WaveShaper'dır: -6 dBFS altını değiştirmez, üstünü yumuşakça -1.1 dBFS tavana yaslar. DynamicsCompressor kullanılmadı (kendiliğinden yükseltme kazancı ekliyor).
- Ölçümle ayarlandı (düzey 1'de): ortamların RMS'i ≈ -35 dBFS (öfke ≈ -33), en gür efekt (`hukum`) tepe -6 dBFS. Varsayılan düzey 0.8 hepsini 3.9 dB daha alçak verir.
- Ortamları birbirine denkleştiren `seviye` / `grupSeviye` tarifte; bir katman değişirse ölçüm yinelenmeli.
- Gürültü tamponları farklı uzunluktadır (5.3 / 7.9 / 11.3 sn) ve ek yeri eşit güçle kapatılır; döngüler aynı anda dönmez, ek yerinde sıçrama olmaz.

## Çevrimdışı işleme (ölçüm)

```js
const ctx = new OfflineAudioContext(2, 48000 * 10, 48000);
const m = sesMotoru({baglam: ctx, tohum: 1943, duzey: 1});
m.ac(); m.ortam('gece-koy', {gecis: .5});
m.efekt('iz', {zaman: 2, tohum: 7});       // zaman: bağlam saniyesi
const tampon = await ctx.startRendering();
```

Çevrimdışı bağlamda ortamın esintileri ve olayları bütün süre için baştan planlanır. Bu yüzden işleme sırasında `oran` kaydırılırsa öfke olayları (taş, bağırış) planlanmamış olur; gerçek zamanlıda planlama 1.2 sn ileriye yapıldığından sorun yoktur.

## Bilinen sınırlar

- Kulakla dinlenmedi; yalnızca ölçüldü (tepe, RMS, DC, tayf merkezi, ek yeri, süre, tayf görüntüsü). Tını kararları kulakla doğrulanmalı.
- iOS Safari'de sessiz düğmesi açıkken Web Audio susar; bu tarayıcı davranışıdır.
