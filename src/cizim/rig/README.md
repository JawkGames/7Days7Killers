# Karakter iskeleti (rig)

Bütün karakterler aynı çizim koduyla çizilir. Bir karakteri ayıran şey yalnızca **görünüş** verisidir: `src/icerik/gorunus/<kimlik>.js`. Yeni karakter eklemek yeni bir veri dosyası yazmaktır; çizim kodu değişmez.

## Nasıl çalışır

- `gorunus.js`: `karakterSec(veri)` etkin görünüşü seçer. Hiç çağrılmazsa `varsayilan.js` (sorgu odasındaki ilk kadın) çizilir. `gorunusKur(veri)` eksik alanları doldurur, renkleri diziye çevirir.
- `poz.js`: her karede değişen durum (bakış, göz kırpma, kaş, ağız, nefes, ışık, kaynama). Bütün karakterlerde aynıdır.
- `yuz.js` (`kafa`, `goz`, `kas`), `sac.js` (`arkaSac`, `onSac`), `sakal.js`, `baslik.js`, `govde.js` (`govde`, `altGovde`), `doku.js` (tel ve kumaş dokusu: `lifDoldur`, `lifKutle`, `kumas`, `kivrimlar`).
- `yapi.js`: yüz yapısı (yaşın ve kemiğin yüze yazılması), başlığın yüze düşürdüğü iç gölge (`icGolge`), boy ve irilik dönüşümü (`figurDonusumu`).

**İki çizim yolu.** Varsayılan kadın (`id:'varsayilan'`) eski yolla çizilir ve prototiple birebir aynı kalır. Öteki bütün görünüşlerde `G.ozel` doğrudur ve yeni yol çalışır: yaşa ve kemiğe göre yüz silüeti ve gölge, yalnızca gölge bölgelerinde kırpılmış tarama, çamurlu fırça dokusu, değişken kalınlıkta yüz hattı; örtünün altından görünen saç ve örtünün yüze düşen yumuşak gölgesi; tel tel sakal, bıyık ve saç (`lifKutle`: kenar kesik değil, teller silüetten taşar); kumaşta kıvrım ve ağırlık. Yeni yolda bir şeyi değiştirmek sorgu odasını etkilemez; eski yola (`!G.ozel` dalları, "çarpan 1 ise" dalları) dokunma.
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

Aralıkların dışı denenmedi; dışına çıkarsan galeride kontrol et. (`boy` .9 Elif'te denendi: çok genç, yuvarlak yüz için.)

### `yapi` (isteğe bağlı; verilmezse yaştan, cinsiyetten ve `yasIzi`'nden türetilir, 0-1)

Yalnızca yeni yolda (varsayılan kadın dışındaki herkes) kullanılır. Işık bütün karakterlerde aynıdır; bu alanlar gölgenin nereye düştüğünü değiştirir.

| Alan | Türetme | Ne yapar |
| --- | --- | --- |
| `cukur` | .55 + yaş (erkekte +.12), .55-1.42 | göz çukuru derinliği: kaş altı karanlığı, dış köşe çöküntüsü ve taraması |
| `dolgun` | 1 (20 yaş) → 0 (52 yaş) | gençlik dolgunluğu: yuvarlak yanak ışığı, hafif kan rengi, burun-dudak çizgisi silik, elmacık altı gölgesi zayıf |
| `sarkik` | 46 yaşından sonra artar | çene altı ve gıdı sarkması: silüet aşağı-dışa, gıdı hattı ve gölgesi |
| `sakak` | 38 yaşından sonra + çökük yanak | şakak çukuru: silüet içe, leke, tarama, kıvrım çizgisi |
| `kemik` | erkek .45 / kadın .2 + çökük yanak + yaş | elmacık çıkıntısı ve altındaki çapraz çukur; erkekte köşeli çene açısı ve düz çene hattı |
| `kulak` | 1 + yaş × .16 | kulak büyüklüğü (yaşla büyür) |

Örnek: sıska bir genç için `yapi:{kemik:.9, dolgun:.2}`; tombul bir yaşlı için `yapi:{dolgun:.5, kemik:.1}`.

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

**Geriye uyumluluk:** şema yalnızca genişledi (`yapi`, `boy`, `iri` eklendi; hepsi isteğe bağlı). Var olan alanların anlamı değişmedi, ama yeni yolda aynı sayılar artık daha belirgin bir yüz yapısı verir (özellikle erkekte `cene`/`ceneUc` ile köşeli çene). Eski görünüş dosyaları değişmeden çalışır.

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

Yemeni ve şal saçı örter; yeni yolda alın kenarının altından ortadan ayrılmış saç görünür (saç rengi ve `kirSac` ile). Kumaş alını ve şakakları örter, yanaktan aşağısında yüzün kendi hattı kumaşın önünde kalır (yüz "delikteki maske" gibi durmasın diye) ve kumaş yüze yumuşak bir iç gölge düşürür. Kasket, kep, takke ve sarık alına ve yanlara (kulak, şakak saçı) koyu gölge düşürür.

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
| `boy` | .9 - 1.08 (1 = varsayılan kadın). Oturan figürde her %1 başı ve gövdeyi 7 birim kaldırır (`BOY_BIRIM` 700). Yan yana gelince oranlar için: iri erkek 1.04-1.06, kadın .95-1, çok yaşlı .9-.93 |
| `iri` | .93 - 1.08, bütün figürün (baş + gövde) ölçeği, baş merkezi çevresinde. Heybetli 1.05-1.06, ufak tefek .93-.95 |

`boy` ve `iri` ikisi de 1 ise hiçbir dönüşüm yapılmaz. Örnekler: Mahmut 1.04/1.06, Rıza 1.05/1.03, Bektaş 1.03/.97, Elif .95/.95, Sultan .92/.93.

Örtünün alt kenarı ayaktayken etek rengine erir; bacak çizilmez, eller yalnızca etekte koyu leke olarak görünür.

## Yeni karakter nasıl yazılır

1. `KOY-HALKI.md` içinden kişiyi oku: yaş, cinsiyet, mizaç, giysi ve eşya. `src/icerik/kisiler/<id>.js` içindeki `ortu` alanını aynen al.
2. `src/icerik/gorunus/<id>.js` dosyasını aç. En yakın örneği kopyala: `mahmut.js` (yaşlı, sakallı erkek), `riza.js` (orta yaşlı, bıyıklı, şapkalı erkek), `bektas.js` (dağınık), `elif.js` (genç kadın, yemeni), `sultan.js` (çok yaşlı kadın, şal).
3. Kişiliği yüze çevir, ama abartma: sert = dar göz (`gozBoy` .76-.82) ve eksi `kasEgim`; korkak = iri göz (`gozBoy` 1.1) ve artı `kasEgim`; gururlu = ağır kapak (`gozKapak` .4-.6) ve geniş çene. Başka bir köylüye benzememesi için en az üç belirgin şeyi değiştir: baş örtüsü ya da şapka, sakal/bıyık, yüz biçimi (en, boy, çene), ten ve saç rengi.
4. `boy` ve `iri` ver (yan yana gelince oranlar); yüz yapısı yaştan türetilir, karakter özelse `yapi` ile ez (sıska: `kemik` yüksek, `dolgun` düşük).
5. Dosyanın başına bir yorum yaz: kim olduğu ve görünüşünün özeti.
6. Kontrol et (aşağıda). `npx eslint src/icerik/gorunus` temiz olmalı.

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
