# Türkçe ek ve kalıp motoru

Bu klasörde iki katman var:

- `ekler.js`: bir ada ya da ad öbeğine ek getirir (`ekle`).
- `kaliplar.js`: bilgi türü ve mizaca göre cümle kalıpları. Kalıpları `src/diyalog/kalip.js` doldurur.

İkisi de saf işlevlerden oluşur ve hiçbir pakete bağlı değildir. Oyun çevrimdışı çalışır, metni yalnız kalıplar ve veri üretir.

## Ek motoru: `ekle(deger, ...ekler)`

```js
import {ekle, ozelAd, kisiAdi, mekanAdi} from './ekler.js';
ekle(ozelAd('Antep'), 'de')            // "Antep'te"
ekle(kisiAdi('Kör Halil'), 'in')       // "Kör Halil'in"
ekle(mekanAdi('Muhtarın evi'), 'de')   // "muhtarın evinde"
ekle(mekanAdi('Çeşme başı'), 'e')      // "çeşme başına"
ekle('22:40', 'de')                    // "22:40'ta"
ekle(mekanAdi('Ağa konağı'), 'de', 'dim')   // "ağa konağındaydım"  (ya da 'de+dim')
```

### Değer

`deger` üç biçimde verilebilir: düz metin, sayı ya da `{metin, ozelAd, iyelikli}` nesnesi.

- **Düz metin** cins ad sayılır. Kesme almaz, yumuşama olur (`konak` → `konağı`).
- **Sayı** ya da sonu sayı olan metin (`'saat 3'`) özel ad gibi kesme alır. Ek, sayının okunuşuna göre seçilir.
- **`ozelAd:true`**: kesme işareti konur. Yazıda yumuşama ve ünlü düşmesi olmaz (`Mahmut'u`, `Antep'e`).
- **`iyelikli:true`**: değer 3. tekil iyelikli bir öbektir. Hâl ekinden önce zamir n'si gelir (`evi` → `evinde`, `evine`, `evini`), `si` eki ise bir şey eklemez (`Halil'in cep saati`).

Kurucu işlevler:

| İşlev | Ne yapar |
|---|---|
| `ozelAd(m)` | Özel ad. İyelik yalnız "-in + -(s)I" biçiminden sezilir. |
| `kisiAdi(m)` | Kişi adı ya da lakap. `UNVAN_LAKAPLAR` içindekiler ("Hoca", "Muhtar", "Kâhya"...) cins ad gibi çekilir: "Hocaya", "Muhtarın". Öbürleri özel addır: "Kör Halil'e", "Ebe Ana'nın", "Muhtarın Kızı'na". |
| `mekanAdi(m)` | `terimler.js` mekân adı. Cins ad öbeğidir, iyeliği sezilir. Cümle içinde geçeceği için ilk harfi küçültülür. İkinci sözcük büyük harfle başlıyorsa ilk sözcük adın parçasıdır ve olduğu gibi kalır: "ağa konağı" ama "Kör Halil'in evi". |

### İyelikli ad öbekleri

Mekân adlarının çoğu belirtisiz ad tamlamasıdır ("Çeşme başı", "Köy odası", "Su değirmeni"). Bunlar **otomatik** sezilir (`iyelikliMi`):

1. Öbek en az iki sözcükse,
2. son sözcük ı/i/u/ü ile bitiyorsa,
3. ve son sözcük `IYELIKSIZ` listesinde değilse öbek iyelikli sayılır. Bu liste, ı/i/u/ü ile bitip iyelik almamış kökleri tutar: kapı, kuyu, sini, yemeni...

Özel adlarda yalnız bir önceki sözcük tamlayan ekliyse ("Muhtarın Kızı") öbek iyelikli sayılır. "Kedili Nine" ve "Sarıkuyu" bu yüzden iyeliksizdir.

Sezgi yanılırsa veride açıkça yazın: `{metin:'eski kantarcı', iyelikli:false}` ya da `{metin:'Kuşadası', ozelAd:true, iyelikli:true}`. Bu kararın gerekçesi şu: `terimler.js` değişmeden bütün mekânlar doğru çekilsin, yeni mekân eklemek de yine yalnız veri yazmak olsun. Depodaki 22 mekânın hepsi `testler/ekler.test.js` içinde tek tek denetlenir. Yeni bir mekân eklendiğinde test, beklentisi yazılmadıkça başarısız olur.

### Ekler

| Ad | Takma adlar | Örnek |
|---|---|---|
| `de` bulunma | da, te, ta | evde, konakta, Antep'te, evinde |
| `den` ayrılma | dan, ten, tan | evden, baştan, evinden |
| `e` yönelme | a, ye, ya | eve, odaya, başına |
| `i` belirtme | ı, u, ü, yi, yı... | evi, odayı, evini |
| `in` tamlayan | ın, un, ün, nin, nın... | evin, odanın, Rıza'nın |
| `le` ile | la, yle, yla, ile | evle, odayla, Halil'le |
| `ler` çoğul | lar | evler, Halil'ler |
| `si` 3. tekil iyelik | sı, su, sü | evi, odası, suyu |
| `ki` | | Antep'teki, evindeki, günkü |
| `di` hikâye ek-eylemi | ydi, idi... | evdeydi, konaktaydı |
| `dim` 1. tekil hikâye | ydim, idim... | evdeydim |
| `mis` rivayet ek-eylemi | ymiş, imiş... | konaktaymış |
| `dir` | dır, dur, dür | evdir |
| `ken` | yken, iken | değirmendeyken |
| `mi` soru eki | mı, mu, mü | Halil mi, o gece mi (ayrı yazılır, kesme almaz) |

Ekler zincirlenebilir: `ekle(x,'ler','de')` → "evlerde". Kalıpta `{yer:si+de}` yazılır.

### Kurallar

- **Ünlü uyumu:** son ünlüye bakılır. İki yönlü ekler (de, e, le, ler) a/e alır. Dört yönlü ekler (i, in, si, di) ı/i/u/ü alır. Şapkalı â kalın sayılır ("Kâzım'a", "dükkâna").
- **Ünsüz benzeşmesi:** f, s, t, k, ç, ş, h, p ile biten sözcüklerde d sertleşir: -te/-ta, -ten/-tan, -ti ("Antep'te", "tespihte").
- **Kaynaştırma:** ünlüden sonra belirtme ve yönelmede y, tamlayanda n, iyelikte s, ilede y gelir. "Su" sözcüğü belirtme, tamlayan ve iyelikte y alır (suyu, suyun).
- **Zamir n'si:** iyelikli öbekte bulunma, ayrılma, yönelme ve belirtmeden önce n gelir (evinde, başına, evini).
- **Yumuşama** yalnız cins adlarda ve ünlüyle başlayan ekten önce olur:
  - Çok heceli sözcüklerde -p → b, -ç → c, -k → ğ (n'den sonra g).
  - Tek heceliler yumuşamaz. Yumuşayanlar `YUMUSAR` listesindedir (dip, renk, kalp...).
  - -t ile bitenler ancak `YUMUSAR` listesindeyse yumuşar (kanat, kâğıt, dört). Bu yüzden "kasketi" ve "saati" yumuşamaz.
  - Çok heceli olduğu hâlde yumuşamayanlar `YUMUSAMAZ` listesindedir (ahlak, ittifak).
  - Özel adlarda yazıda yumuşama yoktur: "Mahmut'u", "Kılıç'a".
- **Ünlü düşmesi** (`UNLU_DUSMESI`: oğul → oğlu, ağız → ağzı) ve **ikileşme** (`IKILESME`: sır → sırrı, hak → hakkı) yalnız cins adlarda olur.
- **Kesme işareti:** özel adlarda ilk ekten önce konur. Sayılarda ve ünlüsüz kısaltmalarda da konur (TBMM'ye, PTT'de).
- **Sayılar ve saatler:** ek, okunuşun son sözcüğüne göre seçilir.
  - 3 → üç → "3'te"
  - 1940 → kırk → "1940'ta"
  - 22:40 → kırk → "22:40'ta"
  - 22:00 → iki → "22:00'de"
  - 2000 → bin → "2000'de"
  - Ondalık virgülde virgülden sonraki sayı okunur.
- **Büyük harf:** tümü büyük yazılmış sözcükte ek de büyük yazılır ("ANTEP'TE"). Büyük/küçük çevirme her zaman `toLocale*Case('tr')` ile yapılır (I/ı, İ/i).

### İstisna tablosuna ekleme

Tablolar `ekler.js` başındadır. Anahtarlar küçük harfle ve şapkasız yazılır: "hâl" için `hal`.

| Tablo | Ne zaman | Örnek kayıt |
|---|---|---|
| `INCE_OKUNAN` | Son hecesi ince okunan, ünlü uyumuna uymayan sözcük. Değer, ekin uyacağı ünlüdür. | `saat:'e'`, `rol:'ö'`, `kabul:'ü'`, `kemal:'e'` |
| `UNLU_DUSMESI` | Ünlüyle başlayan ekte orta ünlüsü düşen sözcük. Değer, düşmüş gövdedir. | `'burun':'burn'` |
| `IKILESME` | Ünlüyle başlayan ekte son ünsüzü ikileşen sözcük. | `'sır':'sırr'` |
| `YUMUSAR` | Tek heceli olduğu hâlde yumuşayan ya da -t ile bitip yumuşayan sözcük. | `'kanat'` |
| `YUMUSAMAZ` | Çok heceli olduğu hâlde yumuşamayan sözcük. | `'ahlak'` |
| `IYELIKSIZ` | ı/i/u/ü ile biten ama iyelik eki taşımayan kök. Sezgiyi durdurur. | `'sini'` |
| `UNVAN_LAKAPLAR` | Kişiyi anlatan ama cins ad gibi yazılan lakap (kesme yok). | `'hoca'` |

Bir kayıt eklediğinizde `testler/ekler.test.js` içindeki ilgili tabloya da bir satır ekleyin. Çekimi tahmin etmeyin, kurala ya da TDK sözlüğüne bakın.

### Bilinen sınırlar

- İyelikli öbeğe çoğul eki getirilmez (`ekle(mekanAdi('Çeşme başı'),'ler')` hata verir). Böyle bir durumda kök verilmelidir.
- Zamirler (ben, sen, o, bu) desteklenmez: bana, onu, bununla gibi çekimler kalıba düz yazılır.
- Binlik ayraçlı sayılar (1.000) saat gibi okunur. Ekleri çoğunlukla yine doğru çıkar ama denetlenmemiştir.
- Kısaltmaların harf adı okunuşu (TBMM → "me") yalnız ünlüsüz kısaltmalar için yapılır. Okunan kısaltmalar (ASELSAN gibi) sözcük gibi çekilir.
- `IYELIKSIZ` listesi kapalı bir liste değildir. Sezgi tutmazsa veride `iyelikli:false` yazın.

## Kalıp sözdizimi (`src/diyalog/kalip.js`)

```
{ad}             değer olduğu gibi
{ad:de}          ek getirilir          {yer:de}      → "su değirmeninde"
{ad:de+dim}      ekler sırayla          {yer:de+dim}  → "su değirmenindeydim"
{ad:mi}          soru eki               {kim:mi}?     → "Dul Gülsüm mü?"
[a|b|c]          satır içi seçenek; rng ile biri seçilir. Boş seçenek olur: "[|ben ]".
```

- Ekler, yukarıdaki tablodaki ad ya da takma adlarla yazılır. Kalıbı yazan, ekin doğal yazımını kullanabilir: `{yer:da}`, `{kim:ı}`. Hangi takma ad yazılırsa yazılsın, doğru biçimi motor seçer.
- Cümle başı, ". ", "! ", "? " sonrası kendiliğinden büyük harfe çevrilir. "..." sonrası çevrilmez, cümle sürüyor sayılır. Noktalamadan önceki boşluklar silinir.
- Eksik değer, bilinmeyen ek, bilinmeyen bilgi türü ve bilinmeyen mizaç açık hata verir. Hata iletisi kalıbın kendisini de gösterir.
- Rastgelelik yalnız dışarıdan verilen `rng` ile gelir: `rng(tohum)`, `src/cekirdek/rastgele.js`. rng verilmezse her zaman ilk seçenek alınır. `Math.random` kullanılmaz.

```js
import {cumleKur} from '../../diyalog/kalip.js';
import KALIPLAR from './kaliplar.js';
cumleKur(KALIPLAR, 'gordum', {
  mizac: 'dedikoducu', rng: rng(tohum),
  degerler: {kim: kisiAdi('Kör Halil'), yer: mekanAdi('Su değirmeni'), zaman: 'o gece'},
});
```

### Kalıp kümesi (`kaliplar.js`)

```js
'bilgi-turu': {
  degiskenler: ['kim', 'yer'],   // kalıpların kullanabileceği değerler
  genel: [...],                  // her mizacın son yedeği
  korkak: [...], dedikoducu: [...], sert: [...], ...   // MIZACLAR'dan anahtarlar
}
```

- Mizacın kendi listesi yoksa `MIZAC_YEDEGI` zincirine bakılır: öfkeli → sert → genel, gururlu → sert → genel, öbürleri → genel.
- Yeni bilgi türü eklemek için yeni bir anahtar yazmak yeter, kod değişmez.
- `kumeDenetle(kume, ornekDegerler)` şunları denetler: bildirilmemiş değişken, bilinmeyen ek, bilinmeyen mizaç, eksik `genel`. Bu denetim testte çalışır.
- Ton kuralları testte de denetlenir:
  - korkak kısa ve kaçamak konuşur (üç nokta),
  - dedikoducu uzun konuşur (genelin en az 1,8 katı),
  - sert kesik cümle kurar (cümle başına en çok 6 sözcük).
