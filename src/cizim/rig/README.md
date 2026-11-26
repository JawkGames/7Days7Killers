# Karakter iskeleti (rig)

Bütün karakterler aynı çizim koduyla çizilir. Bir karakteri ayıran şey yalnızca **görünüş** verisidir: `src/icerik/gorunus/<kimlik>.js`. Yeni karakter eklemek yeni bir veri dosyası yazmaktır; çizim kodu değişmez.

## Nasıl çalışır

- `gorunus.js`: `karakterSec(veri)` etkin görünüşü seçer. Hiç çağrılmazsa `varsayilan.js` (sorgu odasındaki ilk kadın) çizilir. `gorunusKur(veri)` eksik alanları doldurur, renkleri diziye çevirir.
- `poz.js`: her karede değişen durum (bakış, göz kırpma, kaş, ağız, nefes, ışık, kaynama). Bütün karakterlerde aynıdır.
- `yuz.js` (`kafa`, `goz`, `kas`), `sac.js` (`arkaSac`, `onSac`), `sakal.js`, `baslik.js`, `govde.js` (`govde`, `altGovde`), `doku.js` (tel ve kumaş dokusu).
- `index.js`: tek giriş noktası.

Çizim sırası sahnedeki gibidir: `altGovde` (yalnızca ayaktayken), `arkaSac` (kafa konumunda), `govde`, `kafa` (kafa konumunda, `OLCU.kafaY`).

```js
import {karakterSec} from '/src/cizim/rig/index.js';
import {gorunusBul} from '/src/icerik/gorunus/index.js';
karakterSec(gorunusBul('mahmut')); // sahne bundan sonra Hacı Ağa'yı çizer
```

**Geriye uyumluluk:** varsayılan kadın, prototiptekiyle piksel piksel aynı çıkar. Bu yüzden kodda "çarpan 1 ise dönüşüm yapma" dalları var; silinmemeli. Rig'de bir şey değiştirdikten sonra sorgu odasının ilk karelerini değişiklikten önceki karelerle karşılaştır (`requestAnimationFrame` ve `Math.random` sabitlenmiş Playwright; NOTLAR.md "tuzaklar").

## Görünüş şeması

Boş bırakılan alan varsayılanı alır. Erkekte (`cinsiyet:'E'`) yüz ölçüleri için başlangıç biraz farklıdır (geniş çene, gür kaş, kalın boyun); veri onu da ezer.

### Kimlik

| Alan | Değer | Not |
| --- | --- | --- |
| `id` | kişi dosyasındaki kimlik | `src/icerik/kisiler/<id>.js` ile aynı |
| `cinsiyet` | `'K'` / `'E'` | erkekte dudak tene yakın, kaş gür, gırtlak çizilir |
| `yas` | 19-74 | `yasIzi` verilmezse yaştan türetilir |

### `yuz` (çarpanlar; 1 = varsayılan kadın)

| Alan | Aralık | Ne yapar |
| --- | --- | --- |
| `en` | .9 - 1.12 | yüz genişliği (saç, başlık, kulak da buna uyar) |
| `boy` | .92 - 1.1 | alt yüzün uzunluğu; ağız birlikte iner |
| `alin` | .9 - 1.1 | alnın yüksekliği |
| `elmacik` | .95 - 1.1 | elmacık kemiği çıkıntısı |
| `cene` | .84 - 1.2 | çene kemiği genişliği (erkek 1.1) |
| `ceneUc` | .84 - 1.25 | çene ucunun genişliği; büyük = kare çene |
| `gozAralik` | 60 - 70 (birim) | iki göz arası / 2; varsayılan 66 |
| `gozEn`, `gozBoy` | .85 - 1.15 | göz boyutu; dar bakış için `gozBoy` .75-.85 |
| `gozKapak` | 0 - .8 | ağır, düşük üst kapak (yaşlı, yorgun, sert) |
| `kasKalin` | .6 - 1.8 | kaş gürlüğü; 1'den büyükse altına koyu leke eklenir |
| `kasEgim` | -.15 - .12 | eksi: dış uç yukarı (sert, çatık); artı: dış uç aşağı (hüzünlü, şaşkın) |
| `kasY` | -8 - 8 (birim) | kaşın göze uzaklığı; artı = aşağı, göze yakın |
| `burunBoy` | .88 - 1.15 | burun uzunluğu (ağzı da aşağı iter) |
| `burunEn` | .85 - 1.35 | burun genişliği |
| `dudakEn` | .85 - 1.1 | ağız genişliği |
| `dudakKalin` | .5 - 1.1 | dudak kalınlığı; yaşlılarda .5-.7 |
| `agizY` | -6 - 8 (birim) | ağzın ek dikey kayması |
| `boyun` | .88 - 1.35 | boyun kalınlığı |

Aralıkların dışı denenmedi; dışına çıkarsan galeride kontrol et.

### `renk` (hepsi `'#rrggbb'`)

| Alan | Varsayılan | Not |
| --- | --- | --- |
| `ten` | yok = varsayılan kadının solgun teni | tek renk ver: beş ton (ışık, ana, orta, gölge, derin), boyun ve el tonları ondan türetilir. Köylü tenleri `#7c6e58` - `#9b9078` arası (güneşte yanmış, soluk). |
| `dudak`, `dudakGolge` | tenden türetilir | kadında hafif kızıl, erkekte tene yakın. Varsayılan kadının koyu kırmızı dudağı yalnızca `ten` verilmezse gelir. |
| `iris`, `irisOrta`, `irisKenar` | `ten` verilmişse koyu kahve `#4a3c2c` | soluk göz (`#7c7d72`, `#8b9187`) yaşlı ya da tekinsiz karakterde |
| `sac` | kara `#0d0c0e` | `yasIzi.kirSac` bunu griye çeker; sakal, bıyık ve kaş da aynı rengi kullanır |
| `sacIsik` | saçtan türetilir | saçtaki ışık telleri |
| `kas` | mürekkep; kır saçta griye döner | |

### `yasIzi` (0 = yok)

| Alan | Aralık | Ne yapar |
| --- | --- | --- |
| `kirisik` | 0 - 1 | alın, kaz ayağı, burun-dudak oluğu, ağız köşesi; .5 üstü yanak çizgisi; .6 üstü sarkık çene hattı ve üst dudak çizgileri; .3 üstü boyun kıvrımları |
| `gozAlti` | .4 - 1.8 | göz altı morluğu ve torbası; 1 üstü ikinci kıvrım |
| `cokukYanak` | .25 - 1.8 | yanak çukuru (genç ve tok: düşük; meczup, yaşlı: yüksek) |
| `kirSac` | 0 - 1 | saç, sakal, kaş beyazlığı |
| `lekeler` | 0 - 1 | yaşlılık lekeleri |

Verilmezse yaştan türetilir (25 yaşında hepsi düşük, 75 yaşında yüksek).

### `sac`

| Alan | Değer |
| --- | --- |
| `bicim` | `uzun` (varsayılan kadının açık saçı), `toplu` (ortadan ayrılmış, geriye toplanmış), `kisa` (erkek saçı; erkekte varsayılan), `kel` (tepe açık, yanlarda saç), `dagnik` (omuza düşen dağınık saç) |
| `cizgi` | alın saç çizgisi, birim: -150 (yüksek alın) ile -115 (basık) arası; `kisa` ve `toplu` kullanır |

Kulaklar `kisa`, `kel`, `toplu` ve şapkalarda görünür; `uzun`, `dagnik`, yemeni ve şalda görünmez.

### `sakal`, `biyik`

| Alan | Değer |
| --- | --- |
| `sakal.bicim` | `yok`, `kirli` (tıraşsız gölge), `kisa`, `uzun`, `dagnik` |
| `sakal.boy` | .7 - 1.3, sarkma çarpanı |
| `biyik.bicim` | `yok`, `ince`, `kalin`, `pala` (uçları aşağı sarkan) |

Sakalın üst kenarı yanakta tene karışarak erir. Ağız mekaniği değişmez: bıyık üst dudağı örter, sakal alt dudağın altından başlar.

### `baslik`

| Alan | Değer |
| --- | --- |
| `tur` | `yok`, `kasket`, `kep` (jandarma), `yemeni` (= `yazma`), `takke`, `sarik` (takke + sargı), `sal` (başı ve omuzları örten yün şal) |
| `renk` | kumaş rengi; verilmezse türe göre koyu bir ton |
| `desen` | yemenide `'duz'` benekleri kapatır |
| `desenRenk` | yemeni benek rengi |

Yemeni ve şal saçı tamamen örter (saç biçimi önemsizleşir), yüzün kenarını da örter. Kasket ve kep alına koyu bir gölge düşürür.

### Gövde

| Alan | Değer |
| --- | --- |
| `ortu` | `palto`, `aba`, `entari`, `cubbe`, `kaput`, `onluk`, `kepenek`. Kişi dosyasındaki `ortu` ile aynı olmalı. |
| `giysi.renk` | örtünün ana rengi; verilmezse örtüye göre bir ton. `onluk` için önlüğün rengi. |
| `giysi.ic` | önden görünen iç giysi: `bluz` (yalnızca varsayılan kadın), `gomlek` (yakasız köy gömleği; erkekte varsayılan), `yelek` (gömlek üstüne yelek), `entari` (benekli kumaş) |
| `giysi.icRenk` | iç giysinin rengi |
| `giysi.yelekRenk` | yelek rengi |
| `giysi.kenar` | aba ve cübbede işlemeli kenar çizgisi (ağa için soluk sırma) |
| `giysi.hirka` | entari üstünde hırka rengi (Elif'in kırmızı yün hırkası) |
| `omuz` | .85 - 1.25, omuz genişliği; boyun çevresi sabit kalır |

Örtünün alt kenarı ayaktayken etek rengine erir; bacak çizilmez, eller yalnızca etekte koyu leke olarak görünür.

## Yeni karakter nasıl yazılır

1. `KOY-HALKI.md` içinden kişiyi oku: yaş, cinsiyet, mizaç, giysi ve eşya. `src/icerik/kisiler/<id>.js` içindeki `ortu` alanını aynen al.
2. `src/icerik/gorunus/<id>.js` dosyasını aç. En yakın örneği kopyala: `mahmut.js` (yaşlı, sakallı erkek), `riza.js` (orta yaşlı, bıyıklı, şapkalı erkek), `bektas.js` (dağınık), `elif.js` (genç kadın, yemeni), `sultan.js` (çok yaşlı kadın, şal).
3. Kişiliği yüze çevir, ama abartma: sert = dar göz (`gozBoy` .76-.82) ve eksi `kasEgim`; korkak = iri göz (`gozBoy` 1.1) ve artı `kasEgim`; gururlu = ağır kapak (`gozKapak` .4-.6) ve geniş çene. Başka bir köylüye benzememesi için en az üç belirgin şeyi değiştir: baş örtüsü ya da şapka, sakal/bıyık, yüz biçimi (en, boy, çene), ten ve saç rengi.
4. Dosyanın başına bir yorum yaz: kim olduğu ve görünüşünün özeti.
5. Kontrol et (aşağıda). `npx eslint src/icerik/gorunus` temiz olmalı.

Dosya otomatik toplanır (`src/icerik/gorunus/index.js`); başka hiçbir dosyaya ekleme yapma.

## Nasıl kontrol edilir

`npx vite` çalışırken:

- `/prototip/karakterler/index.html`: bütün görünüşler aynı ışıkta, omuzdan yukarı. Tıkla: büyük hâl, **Durağan kare** (önce bununla bak), **Konuştur**, **Göz kırp**, **Kaş**. İmleçle bakış denenir. `index.html#<id>` doğrudan açar.
- `/prototip/karakterler/index.html?secenek`: veri dosyası olmayan seçeneklerin (kel, sarık, takke, önlük, kepenek...) örnekleri.
- `/prototip/karakterler/sahne.html?kim=<id>`: karakter sorgu odasında: kapıdan girer, oturur, masa önünde. Ayaktayken gövde ile etek arasında çizgi olmamalı.

Bakılacaklar (önce durağan kare, sonra hareket):

- Yüz insan gibi mi, yaş ve cinsiyet ilk bakışta okunuyor mu, galeride ötekilerden ayırt ediliyor mu?
- Başlık ve saç kafaya oturuyor mu (arada boşluk, yüzün üstünde kopuk kenar yok mu)?
- Tarama yalnızca gölgeli yarıda mı? Yüz porselen ya da yumuşak gradyanlı vektör gibi durmamalı.
- Konuşurken ağız köşeleri sabit, dudaklar esneyerek açılıyor mu; bıyık ve sakal ağzı kapatmıyor mu?
- Falso görünen parça varsa sayıyı değiştirerek düzelt; düzelmiyorsa gölgeyle ya da başka bir seçenekle gizle. El yakından çizilmez, bacak çizilmez.

## Yeni seçenek eklemek (kod)

Yeni bir başlık, saç biçimi ya da örtü gerekirse ilgili dosyaya bir işlev ekle, `gorunus.js` içindeki listeye adını yaz, bu belgeye satırını ekle. Varsayılan kadının yolunu değiştirme; değiştirdiysen sorgu odası kare karşılaştırmasını tekrarla.
