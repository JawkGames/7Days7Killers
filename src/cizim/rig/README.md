# Karakter iskeleti (rig)

Bütün karakterler aynı çizim koduyla çizilir. Bir karakteri ayıran şey yalnızca **görünüş** verisidir: `src/icerik/gorunus/<kimlik>.js`. Yeni karakter eklemek yeni bir veri dosyası yazmaktır; çizim kodu değişmez.

## Nasıl çalışır

- `gorunus.js`: `karakterSec(veri)` etkin görünüşü seçer. Hiç çağrılmazsa `varsayilan.js` (sorgu odasındaki ilk kadın) çizilir. `gorunusKur(veri)` eksik alanları doldurur, renkleri diziye çevirir.
- `poz.js`: her karede değişen durum (bakış, göz kırpma, kaş, ağız, nefes, ışık, kaynama). Bütün karakterlerde aynıdır.
- `yuz.js` (`kafa`, `goz`, `kas`), `sac.js` (`arkaSac`, `onSac`), `sakal.js`, `baslik.js`, `govde.js` (`govde`, `altGovde`), `doku.js` (tel ve kumaş dokusu: `lifDoldur`, `lifKutle`, `kumas`, `kivrimlar`).
- `yapi.js`: yüz yapısı (yaşın ve kemiğin yüze yazılması), başlığın yüze düşürdüğü iç gölge (`icGolge`), boy ve irilik dönüşümü (`figurDonusumu`), baş ölçeği (`basDonusumu`).
- `ayrinti.js`: yüzdeki küçük ayrıntılar (yalnızca yeni yol): gözlük, perdeli göz, yara izi, ben, kırık burun, un/is, dinlenme hâlindeki gülümseme kırışığı.

**İki çizim yolu.** Varsayılan kadın (`id:'varsayilan'`) eski yolla çizilir ve prototiple birebir aynı kalır. Öteki bütün görünüşlerde `G.ozel` doğrudur ve yeni yol çalışır: yaşa ve kemiğe göre yüz silüeti ve gölge, yalnızca gölge bölgelerinde kırpılmış tarama, çamurlu fırça dokusu, değişken kalınlıkta yüz hattı; örtünün altından görünen saç ve örtünün yüze düşen yumuşak gölgesi; tel tel sakal, bıyık ve saç (`lifKutle`: kenar kesik değil, teller silüetten taşar); kumaşta kıvrım ve ağırlık. Yeni yolda bir şeyi değiştirmek sorgu odasını etkilemez; eski yola (`!G.ozel` dalları, "çarpan 1 ise" dalları) dokunma.
- `ifade.js`: sorgu için ifade ve beden dili (duygu durumları, mizaç süzgeci, tepki oynatma). Çizmez, `poz` alanlarını sürer. `cikis.js`: kalkıp gitmenin zaman çizelgesi.
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

Yeni yolda `cene` ve `ceneUc` silüete doğrudan yazılır: geniş çenenin köşesi aşağıda ve köşeli, dar çenenin köşesi yukarıda ve sivri; `ceneUc` çene ucunun düz kısmını genişletir. Çene köşesi hiçbir zaman elmacıktan geniş çizilmez (yüz kutu gibi durmasın).

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
| `tombul` | 0 (türetilmez) | yağlı yüz: alt yanak dışa taşar (ağız köşesinin dışında yay), çene köşesi aşağıda ve yumuşak, gıdı büyür. `dolgun` gençlik dolgunluğudur, `tombul` şişmanlıktır. .3 hafif, .55-.8 belirgin |

Gıdı (çift çene) `sarkik × (.35 + .65 × tombul)` kadardır: tombul ve sarkık yüzde çene ucunun altında ikinci kabarıklık, kıvrım çizgisi ve ışık; zayıf yaşlıda yalnızca hafif sarkma.

Örnek: sıska bir genç için `yapi:{kemik:.9, dolgun:.2}`; tombul bir yaşlı için `yapi:{dolgun:.5, kemik:.1, tombul:.7, sarkik:.6}` (Arif).

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
| `bicim` | `uzun` (varsayılan kadının açık saçı), `toplu` (ortadan ayrılmış, geriye toplanmış), `kisa` (erkek saçı; erkekte varsayılan), `kel` (tepe açık, yanlarda tel tel seyrek saç), `dagnik` (omuza düşen dağınık saç) |
| `cizgi` | alın saç çizgisi, birim: -150 (yüksek alın) ile -115 (basık) arası; `kisa` ve `toplu` kullanır |
| `tur` | yalnızca `kisa` için: `duz` (varsayılan, kısa kesilmiş), `acik` (alnı açılmış: şakaklar geri çekilmiş, tepe seyrek; Kâzım), `kabarik` (dağınık, kabarık, alna düşen perçemler; Yusuf, Hasan), `yana` (yandan ayrılmış, kavisli kâkül, parlak teller; Cemil), `geri` (geriye taranmış, düzgün yüksek çizgi; Nihat) |

Kulaklar `kisa`, `kel`, `toplu` ve şapkalarda görünür; `uzun`, `dagnik`, yemeni ve şalda görünmez.

**Geriye uyumluluk:** şema yalnızca genişledi (`yapi`, `boy`, `iri`; sonra `ifade`, `gozluk`, `gozFarki`, `iz`, `toz`, `bas`, `yapi.tombul`, `sac.tur`, `biyik.yukseklik/kalin`, `baslik.bag/alin/tutam/tepeRenk`, `giysi.onluk` eklendi; hepsi isteğe bağlı). Var olan alanların anlamı değişmedi, ama yeni yolda aynı sayılar artık daha belirgin bir yüz yapısı verir (özellikle erkekte `cene`/`ceneUc` ile köşeli çene). Eski görünüş dosyaları değişmeden çalışır.

### `sakal`, `biyik`

| Alan | Değer |
| --- | --- |
| `sakal.bicim` | `yok`, `kirli` (tıraşsız gölge), `kisa`, `uzun`, `dagnik` |
| `sakal.boy` | .7 - 1.3, sarkma çarpanı |
| `biyik.bicim` | `yok`, `ince` (kalem bıyık: üst dudağın üstünde, arada ten görünür, ortada filtrum boşluğu), `kalin`, `pala` (uçları aşağı sarkan) |
| `biyik.yukseklik` | birim, -4 - 8: alt kenarın üst dudaktan yüksekliği (ağız en açıkken bile dudağa değmez). `ince`de varsayılan 5; `kalin`/`pala`da verilmezse eski yer (üst dudağı örter) |
| `biyik.kalin` | .4 - 1.5: dikey kalınlık çarpanı; `kalin` bıyıkta tel sayısını da çarpar (.45 = seyrek, uzamış bıyık: Yusuf) |

Sakalın üst kenarı yanakta tene karışarak erir. Ağız mekaniği değişmez: bıyık üst dudağı örter, sakal alt dudağın altından başlar.

### `baslik`

| Alan | Değer |
| --- | --- |
| `tur` | `yok`, `kasket`, `kep` (jandarma), `yemeni` (= `yazma`), `takke`, `sarik` (yeni yolda: tepede takke, çevresinde kat kat çapraz sargı; Hoca), `sal` (başı ve omuzları örten yün şal), `kulah` (keçe külah: yüksek, ucu yuvarlak koni, kıvrık kenar; Çoban Hasan), `posu` (tepeye örtülmüş damalı bez, alnın üstünde burulmuş sargı, yanda düğüm ve sarkan uçlar; Irgat İsmail) |
| `renk` | kumaş rengi; verilmezse türe göre koyu bir ton |
| `desen` | yemenide `'duz'` benekleri kapatır |
| `desenRenk` | yemeni benek rengi; poşuda dama çizgilerinin rengi |
| `tepeRenk` | sarıkta tepedeki takkenin rengi |
| `bag` | yalnızca yemeni, yeni yol: `cene` (varsayılan: çene altından bağlı, ucu göğse düşer), `arka` (ensede bağlı: alın kenarı 16 birim yukarıda, yüzün yanı, çene ve boyun açıkta; Emine, Gülsüm), `yasmak` (soluk tülbent çeneyi ve alt çene hattını örter, kenarları örtünün altına girer; üst kenarı alt dudağın en açık hâlinin altında kalır, konuşma görünür; Zeliha) |
| `alin` | birim, -20 - 24: alın kenarının kayması; artı = kaşlara doğru iner (Fadime 18: yazma kaşlarına kadar) |
| `tutam` | `'sol'` / `'sag'`: yemeninin altından şakağa kaçıp yanağa inen saç tutamı (Emine) |

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
| `giysi.onluk` | yalnızca `ortu:'onluk'`, yeni yol: `bez` (varsayılan: soluk bez, cep, kirli lekeler; Arif), `un` (bez + un; Kâzım, `toz` ile birlikte), `deri` (göğsü örten kalın deri, kalın kayış ve perçin, parlak sürtünme izi, yanık lekeleri; Bekir) |
| `omuz` | .85 - 1.25, omuz genişliği; boyun çevresi sabit kalır |
| `boy` | .9 - 1.08 (1 = varsayılan kadın). Oturan figürde her %1 başı ve gövdeyi 7 birim kaldırır (`BOY_BIRIM` 700). Yan yana gelince oranlar için: iri erkek 1.04-1.06, kadın .95-1, çok yaşlı .9-.93 |
| `iri` | .93 - 1.08, bütün figürün (baş + gövde) ölçeği, baş merkezi çevresinde. Heybetli 1.05-1.06, ufak tefek .93-.95 |

| `bas` | .9 - 1, baş ölçeği (yalnızca yeni yol), çene altındaki boyun noktası çevresinde; verilmezse erkek .95, kadın .97. Baş gövdeye göre "balon" gibi durmasın diye |

`boy` ve `iri` ikisi de 1 ise hiçbir dönüşüm yapılmaz. Yeni yolda erkeğin boynu %10 kalın, omuzları 10 birim yüksek çizilir ve boyunda kulak arkasından köprücüğe inen kaslar ile trapez gölgesi vardır. Örnekler: Mahmut 1.04/1.06, Rıza 1.05/1.03, Bektaş 1.03/.97, Elif .95/.95, Sultan .92/.93.

Örtünün alt kenarı ayaktayken etek rengine erir; bacak çizilmez, eller yalnızca etekte koyu leke olarak görünür.

### Ayrıntılar (yalnızca yeni yol; hepsi isteğe bağlı)

**`ifade`**: dinlenme hâlindeki yüz. Göz kırpma, bakış, kaş (`poz.kasKaldir`, `poz.kasCat`) ve konuşma bunun üstüne çalışmaya devam eder. Ağız mekaniği değişmez: köşeler kalıcı olarak yukarı ya da aşağıda durur, konuşurken yerinden oynamaz, dudaklar esneyerek açılır.

| Alan | Aralık | Ne yapar |
| --- | --- | --- |
| `agizKose` | -1 - 1 | ağız köşeleri; artı: gülümser (köşe 15 birim kalkar, ağız biraz genişler, köşede çukur, yanaktan inen gülme çizgisi, alt göz kapağı kalkar: Süleyman 1), eksi: düşük, asık köşe (Zeliha -.35, Kâzım -.3) |
| `agizYan` | -1 - 1 | tek yanlı gülüş: artı = ekranda sol köşe aşağı, sağ köşe yukarı (kurnaz yarım gülüş: Dursun .4, Arif .35) |
| `kasSol`, `kasSag` | -10 - 6 (birim) | tek kaşın kalıcı yüksekliği (ekranda sol/sağ); eksi = yukarı, kalkık kaş biraz kemerlenir (Dursun, Arif, Hatice: -7, -8) |
| `bakisX`, `bakisY` | -1 - 1 | kalıcı bakış yönü; `poz.gx/gy`'ye eklenir. `bakisY` artı = yere bakar, üst kapaklar biraz iner (Fadime .85) |

**`gozluk`**: `{bicim:'tel', renk, en, y}`. Tel çerçeveli yuvarlak gözlük: camda ışık yanında çapraz yansıma, çerçevenin yanağa gölgesi, şakaktan kulağa giden sap, burun üstünde köprü. `en` (.9-1.15) cam büyüklüğü, `y` (birim) cam merkezinin yüksekliği. Göz ve kaştan sonra çizilir; kırpma ve bakış camın arkasında görünür (Nihat).

**`gozFarki`**: `{perde:'sol'|'sag', kapak:.1-.4, renk}`. Tek göze perde: sütlü, bulanık iris, seçilmeyen gözbebeği, donuk parıltı; o gözün kapağı `kapak` kadar düşük, bakışı ancak yarım izler. `sol`/`sag` ekrandaki yandır (Halil: `sol`, ışık yanında). `renk.iris` öbür gözün rengidir.

**`iz`**: dizi. Koordinatlar yüz birimiyle: göz merkezleri (±`gozAralik`, 0), burun ucu ~110, ağız ~150, çene ~215; x eksi = ekranda sol (ışık yanı).

| `tur` | Alanlar | Not |
| --- | --- | --- |
| `yara` | `x, y, boy` (40-130), `aci` (radyan; 1.3 ≈ dikey), `egri` (birim), `gen` (.8-1.4), `dikis` (true: enine çentikler) | soluk, eni değişen şerit; kaşın ve kirpiğin üstünden geçerse onları böler (Halil: perdeli gözün üstünden; Rıza: elmacıkta kısa) |
| `ben` | `x, y, r` (3-6), `kil` (true), `agiz` (true: ağızla birlikte iner) | Hatice (çenede kıllı), Naciye (dudak üstünde) |
| `kirikBurun` | `yon` (±1), `guc` (.5-1.4) | kemerde çıkıntı, burnun ucu yana kayar (Kadir) |

**`toz`**: `{tur:'un'|'is', yuz, sac, giysi, renk}` (güçler 0-1). `un`: kaşta, saç dibinde, elmacıkta soluk toz ve serpinti; saçta (başlık yoksa) ve giysi silüetinde un bulutu ve silinmiş izler (Kâzım). `is`: alında, yanakta, burun sırtında ve çene hattında parmakla sürülmüş kara lekeler; giyside kara lekeler (Bekir).

## İfade ve beden dili (`ifade.js`)

Sorgudaki kişinin yüzü ve gövdesi duyguya göre oynar. Katman çizmez; her karede `poz`'un ifade alanlarını yazar (`poz.js` başındaki liste: `kasKaldir`, `kasCat`, `kasEgim`, `kasSol/Sag`, `gozAc`, `kirp`, `gozSegir`, `bakisX/Y`, `agizKose`, `agizYan`, `dudakSik`, `agizGer`, `agizAralik`, `burunAc`, `kizar`, `yutkun`, `basEgim`, `basEg`, `basDon`, `egil`, `omuzKalk`, `nefesEk`). Bu alanların hepsi nötrken (`POZ_NOTR`) çizim birebir eskisi gibidir: ifade katmanı çağrılmazsa sorgu odası piksel piksel aynı kalır. Görünüşteki kalıcı `ifade` (dinlenme yüzü) ayrıca çizilir; anlık ifade onun üstüne biner (ağız köşesi, tek kaş, bakış toplanır).

```js
import {poz,ifadeKur} from '/src/cizim/rig/index.js';
const ifade=ifadeKur({mizac:kisi.mizac, tohum:vaka.tohum*31+sira}); // kişi başına bir tane; aynı tohum = aynı oyunculuk
ifade.sifirla(poz);                          // karakter değişince: nötr, olaysız
// her karede (sahnenin guncelle'sinin sonunda; kendi alanlarını yazdığı için sıra önemli değil, ama kasKaldir/kasCat'ı da yazar):
ifade.guncelle(dt,poz);
// cevap gelince: cevap.js'in tepki nesnesi (ya da cevabın kendisi)
const {bekle}=ifade.tepkiOyna(cevap.tepki);  // bekle saniye (duraksamada .75) sonra konus(metin)
// elle: ifade.hedefle('ofkeli',.7); ifade.oynat('yutkun');
```

- **Durumlar** (`DURUMLAR`): `sakin`, `gergin` (endişeli kaş, sıkılı dudak, kalkık omuz, sık kırpma, kaçamak bakış), `korkmus` (iri göz, iç uçları kalkık kaş, yana gerilen ağız, geri çekilme, titreme, hızlı sığ nefes), `ofkeli` (çatık ve inik kaş, kısık göz, burun delikleri, sıkılı dudak, öne eğilme, yanakta kan, derin nefes, arada başını iki yana sallar), `uzgun` (iç uçları kalkık kaş, ağır kapak, yere bakış, düşük köşe, çökük omuz, baş önde, iç çekme), `kucumseyen` (baş geri, yarı kapalı göz, tek yanlı ağız, tek kaş), `saskin` (kalkık kaş, iri göz, aralık dudak), `tutan` (yalan söylerken kendini tutan: düz bakış, sıkılı dudak, hafif inik kaş; ama sık kırpma, bakışın bir an kaçıp dönmesi, göz seğirmesi, yutkunma, dudak ıslatma sızar). `hedefle(durum, siddet)`: siddet 0-1.
- **Geçiş**: her kanal kritik sönümlü yayla hedefe gider (sıçrama ve taşma yok); bakış hızlı, baş ve gövde yavaş, kan yavaşça yayılır. Olaylar (kırpma, kaçırma, seğirme, yutkunma, dudak ıslatma, baş sallama, iç çekme) tohumlu rastgele zamanlarla gelir; `Math.random` kullanılmaz.
- **Mizaç süzgeci** (`MIZAC_SUZGEC`, `src/icerik/kur.js` MIZACLAR): korkak göz kaçırır ve omzu düşer; sert kıpırdamaz, göz kısık, çene önde; kurnaz yarım gülüş ve tek kaş; gururlu baş geri, göz yarı kapalı; saf göz iri, kaş yukarı; dedikoducu öne eğilir, canlı, arada başını sallar; öfkeli burun delikleri, çatık kaş; sakin az hareket.
- **Tepki** (`tepkidenDurum`): `cevap.js` `tepkiKur` çıktısındaki `gerginlik`, `duzey`, `gozKacirma`, `duraksama`, `tavirIpucu` okunur. Öfkeli mizaç gerilince öfkelenir; çok gergin korkak/saf korkar; kurnaz, sert ve gururlu gerilince kendini tutar; gururlu sakinken küçümser. `gozKacirma` uzun bir bakış kaçırması, `duraksama` söz öncesi dudak sıkma + yutkunma oynatır. Tepki ipucudur, kanıt değildir: masum ve gergin biri de aynı yüzü yapar.
- **Konuşma**: konuşurken (`poz.agizAc` > .02) ve hemen ardından ağız köşesi yerinden oynamaz (köşeler sabit, dudaklar esner), dudak sıkma ve aralık bırakılır; yutkunma ve dudak ıslatma konuşma arasına ertelenir.
- **Durağan kare**: `ifade.hedefle(d,s).yerles(poz)` hedefe hemen oturur, olay oynatmaz. Az hareket tercihinde `ifadeKur({...,azHareket:true})`.
- **Kontrol**: galeride büyük görünüm (duygu × şiddet, "tepki oynat", tek hareketler, mizaç seçimi); `/prototip/karakterler/pano.html` (satır köylü, sütun duygu; `?kim=a,b&durum=...&siddet=.8&etiket=0&kadraj=govde`), `pano.html?gecis=sakin:0@0,ofkeli:1@.5,konus@2&kim=elif` (10 fps kare dizisi), `pano.html?cikis&kim=elif`.

### Kalkıp gitme (`cikis.js`)

Sorgu bitince kişi öne eğilip ağırlığını verir, kalkar (alt gövde ayakta görünür, bacak çizilmez), başı önde, bakışı yerde, kapıya doğru küçülerek yürür ve karanlığa gömülür (yüz yürürken okunmaz, sırtını dönmesi gerekmez). Girişin (`sahneler/sorgu-odasi/giris.js`) tersidir ve aynı alanları üretir: `{aktif:true, bas:null, d, ayakta, kapi, gorun, sal, zip, faz, karart}`.

```js
ifade.kalk();                                    // sahnede, sorgu bitince
// her karede, sahnenin guncelle'sinde girisGuncelle(t)'den SONRA:
ifade.guncelle(dt,poz);
if(ifade.cikis){ Object.assign(giris,ifade.cikis); if(ifade.cikisBitti) /* karakteri değiştir, sifirla */; }
// ifade kullanılmıyorsa: const k=cikisKaresi(saniye); Object.assign(giris,k.giris); (k.poz: egil, basEg, bakisY eklenecek duruş)
```

`bas:null` girisGuncelle'nin giriş çizelgesini başlatmasını (ve `girisOlay.bit`'i tetiklemesini) her karede engeller; daha temizi sahnede `giris.cikis` gibi ayrı bir dal açmaktır. Bitince `gorun` 0 ve `aktif` true kalır (figür çizilmez); `aktif:false` yapılırsa figür oturur hâlde yeniden görünür. Süre `CIKIS.zaman.bitis` (6.6 sn).

## Yeni karakter nasıl yazılır

1. `KOY-HALKI.md` içinden kişiyi oku: yaş, cinsiyet, mizaç, giysi ve eşya. `src/icerik/kisiler/<id>.js` içindeki `ortu` alanını aynen al.
2. `src/icerik/gorunus/<id>.js` dosyasını aç. En yakın örneği kopyala: `mahmut.js` (yaşlı, sakallı erkek), `riza.js` (orta yaşlı, bıyıklı, şapkalı erkek), `bektas.js` (dağınık), `elif.js` (genç kadın, yemeni), `sultan.js` (çok yaşlı kadın, şal).
3. Kişiliği yüze çevir, ama abartma: sert = dar göz (`gozBoy` .76-.82) ve eksi `kasEgim`; korkak = iri göz (`gozBoy` 1.1) ve artı `kasEgim`; gururlu = ağır kapak (`gozKapak` .4-.6) ve geniş çene; kurnaz = tek kaş yüksek ve yarım gülüş (`ifade`); güler yüzlü = `agizKose` artı. Başka bir köylüye benzememesi için en az üç belirgin şeyi değiştir: baş örtüsü ya da şapka, sakal/bıyık, yüz biçimi (en, boy, çene), ten ve saç rengi.
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
