# Olay yeri fotoğrafı

Oyuncunun her sabah masasına gelen 1940'lar kâğıt baskısı: kodla çizilen bir **mekân şablonu**, simülasyonun yuvalara koyduğu **iz nesneleri** ve (istenirse) üstü çulla ya da kilimle örtülmüş **kurban**. Sonuç gümüş baskı tonuna çevrilir, tırtıklı beyaz kenar ve kıvrık köşe eklenir.

Deneme sayfası: `npm run dev`, sonra `/prototip/olay-yeri/index.html`.

## Kullanım

```js
import {fotografKur} from './sahne.js';
const f=fotografKur({
  mekan:'degirmen',                 // id ya da mekân modülü
  tohum:1943,                       // aynı tohum = aynı fotoğraf (sapmalar, kum, kıvrılan köşe, eğiklik)
  kurban:true,                      // false: kurban yok; {yuva:'beden', ortu:'kilim'|'cul', aci}
  cozunurluk:2,                     // fotoğraf birimi başına piksel (genişlik*dpr/1084 iyi bir seçim)
  izler:[{tur:'ip', yuva:'zemin-on', renk:'kirmizi', kimlik:'iz-7'}]
});
f.ciz(ctx,{x,y,genislik});          // baskıyı masaya çizer (gölge, lamba ışığı, işaretler dahil)
const p=f.ekrandanFotoya(e.clientX,e.clientY,devicePixelRatio); // bağlam birimi → fotoğraf koordinatı
const kimlik=f.izBul(p[0],p[1]);    // dokunulan izin kimliği ya da null
f.isaretle(kimlik); f.ciz(...);     // bulunan iz kopya kalemiyle halkalanır
```

`f.bolgeler`: her iz için dokunma bölgesi. `yuvaBilgisi(mekan,ad)` bir yuvanın fotoğraftaki yerini ve ölçeğini verir.

## Koordinatlar

- **Fotoğraf koordinatı:** görüntü alanı 1000×750 birim, sol üst (0,0). Beyaz kenar (`FOTO.kenar`=42) bunun dışındadır.
- **Dünya:** santimetre. X sağa, Y yukarı (zemin 0), Z ileri. Makine (0, `yukseklik`, 0) noktasında, `egim` radyan aşağı bakar; dikey hatlar aşağıda hafifçe birleşir. `kameraKur` (`perspektif.js`) bütün izdüşümü yapar: `P.n(X,Y,Z)` → fotoğraf noktası, `P.olcek(...)` → 1 cm kaç birim.
- Büyük yüzeyleri (duvar, kemer) **tam izdüşümle** çiz: `duzlemYol`, `tasOrgu`, `sivaDuvar`, `cokgen3`, `kutu`, `silindir`. `duzlemde` afin yaklaşımdır; yalnızca küçük şeyler için (bir elek, bir leke). Afin bir duvarı yukarı doğru 20 cm kaydırır.

## Dokunma bölgesi sözleşmesi

```js
{kimlik, tur, sekil:'daire', x, y, r}          // fotoğraf koordinatı
{kimlik, tur, sekil:'dikdortgen', x, y, g, y2}  // merkez (x,y), genişlik g, yükseklik y2
```

Bölgenin yarıçapı izin `kapsam(p).r` değeri (cm) × yuvanın ölçeğidir; en az `FOTO.enAzBolge` (42 birim, telefonda parmak payı). Birden çok bölge üst üste gelirse merkezine (yarıçapa göre) en yakın olan kazanır.

## Mekân şablonu nasıl yazılır

`mekanlar/<id>.js` dosyası eklemek yeter; `kutuphane.js` klasörü kendisi toplar. `id`, `src/icerik/mekanlar/` ve `src/dil/tr/terimler.js` içindeki kimlikle aynı olmalı.

```js
export default {
  id:'bakkal',
  kamera:{odak:880, yukseklik:150, egim:.27},       // egim büyüdükçe zemin büyür
  isik:{konum:[X,Y,Z], guc:1.2, menzil:250, ortam:.2}, // TEK ışık kaynağı; gölge yönleri buradan çıkar
  yuvalar:{ 'zemin-on':{duzlem:'zemin', konum:[X,0,Z], yuzey:'toprak', alan:15}, ... , 'beden':{...} },
  ciz(P,r){...},    // fotoğrafın içi (izlerden önce). r: tohumlu rastgele
  ustCiz(P,r){...}  // isteğe bağlı: izlerin ve kurbanın ÜSTÜNE binen şeyler (ışık huzmesi, karanlık köşeler, atmosfer)
};
```

Kurallar:
- Önce `node` ile ya da deneme sayfasında kadrajı ölç: alt kenarda zemin ~190 cm, Z=450'de sol kenar ~X=-270 (egim .27). Yuvalar kadrajın içinde ve birbirinden, kurbanın örtüsünden (≈196×106 cm) uzak olmalı.
- Işık tek kaynaktan: kapı boşluğu (bembeyaz, ayrıntısız), ocak közü, gök. Köşeleri `karanlik`, genel dokuyu `atmosfer` ile ver.
- Çizemediğin şeyi kadrajla ya da karanlıkla kes (karlığın üstü, minare, uzak köy yalnızca karaltı). İnsan, el, bacak yok.
- Renk serbest ama sonunda gri tona çevrilir; yalnız parlaklık önemlidir.
- Ortak parçalar `mekan-yardim.js`: `tasOrgu` (kesme/moloz taş, `duzensiz`), `sivaDuvar`, `zemin` (toprak, çakıl, ışık lekesi), `aydinlikBosluk` (kapı), `atmosfer`, `karanlik`. 3B kutular `kalem.js`: `kutu`, `silindir`, `cokgen3`, `hat3`.

### Yuva sözleşmesi

| alan | anlamı |
| --- | --- |
| `duzlem` | `zemin`, `ust` (yerden yüksek yatay yüzey: seki, tezgâh, yalak kenarı), `arka` (makineye bakan duvar), `sol`, `sag` (yan duvarlar) |
| `konum` | dünya noktası (cm). `ust` için Y yüzeyin yüksekliği |
| `yuzey` | `toprak`, `camur`, `tas`, `un`, `tahta`, `siva`: izler buna göre değişir (ayak izi çamurda çukur, unda koyu baskı, taşta soluk leke) |
| `alan` | tohumlu konum sapmasının yarıçapı (cm). Dar yüzeylerde küçük tut |
| `aci` | düzlemde temel dönüş (yalnızca `beden` için anlamlı) |
| `uygunsuz` | isteğe bağlı: bu yuvaya yakışmayan iz türleri (ör. çeşme cephesine saat). Sahne denetlemez; simülasyon ve deneme sayfası uyar |
| `ortu` | yalnız `beden`: `kilim` ya da `cul` |

Ortak yuva adları (simülasyon bunlara güvenebilir): `zemin-on`, `zemin-orta`, `zemin-kose`, `duvar`, `esik`, `masa-ustu`, `beden`. Mekâna özgü adlar da olur (`ocak-onu`, `ors-dibi`, `ocak-kenari`, `yalak-kenari`, `tas-doseme`); türünü `duzlem` söyler. Her mekânda `beden` dışında en az 5 yuva.

Mevcut mekânlar:

| mekân | yuvalar |
| --- | --- |
| `degirmen` | zemin-on, zemin-orta (un), zemin-kose, esik (taş), duvar, masa-ustu (taş seki), beden |
| `cesme` | zemin-on (çamur), zemin-orta (çamur), zemin-kose, tas-doseme, yalak-kenari (ust), duvar, beden |
| `demirci-dukkani` | zemin-on, ocak-onu, ors-dibi, zemin-kose, duvar (alet duvarındaki boşluk), ocak-kenari (ust), beden |

## İz nesnesi nasıl yazılır

`izler/<tur>.js`; `kutuphane.js` toplar.

```js
export default {
  tur:'ip',
  duzlemler:['zemin','ust'],   // konabileceği düzlemler (başkası verilirse hata)
  serbestAci:true,             // yerde rastgele açı; değilse aciSapma (radyan, ± yarısı) kadar
  kapsam:(p,yuva)=>({r:11, dx:0, dy:0, h:0}), // dokunma yarıçapı cm; merkez kayması (düzlemde dx,dy; h yukarı)
  kur(p,r,k){ return {...} },  // biçimi tohumla BİR KEZ kur (ciz ve renk aynı biçimi kullanır)
  ciz(k,g,p){...},             // gri tonda çiz
  renk(k,g,p){...}             // isteğe bağlı: seçici, soluk renk. 'color' karışımıyla aynı biçimi boya (alfa .1-.4)
};
```

`k` (yerleşim, `yerlesim.js`):
- `k.duzlem(h)`: çerçeveyi yuvanın düzlemine kurar; 1 birim = 1 cm, y makineye doğru (duvarda aşağı). `h` yatay düzlemin h cm üstü (kalınlık için katmanla çiz).
- `k.dik()`: ekrana paralel çerçeve (yan yatmış güğüm gibi hacimli şeyler), yukarı eksi y.
- `k.temas(x,y,rx,ry,alfa)`: altındaki yumuşak gölge. **Her iz zemine otursun:** temas gölgesi olmadan iz havada durur.
- `k.golgeYon`: ışığın tersi, yerel eksende. `k.olcek`: 1 cm kaç fotoğraf birimi. `k.yuzey`, `k.duzlemAdi`.
- Hat çizerken `serit` (titremesiz) ve `hat` (titrek mürekkep) kalınlığı **fotoğraf biriminde** alır; düzlem ezilse de çizgi incelmez.

Mevcut türler ve parametreleri:

| tür | parametre |
| --- | --- |
| `ip` | `renk`: kirmizi, lacivert, yesil, sari, kahve, beyaz, mor ya da [r,g,b] |
| `ayak-izi` | `cesit`: cizme (nallı), carik, ayak; `sayi`: 1-4; `yon` (radyan) |
| `alet` | `cesit`: cekic, orak, kama, makas |
| `civi` | `sekil`: cekic, orak, masa (maşa), cerceve, tufek, yok — duvarda boş çivi ve asılı şeyin soluk izi |
| `saat` | `saat`: 'SS:DD'. Duvarda ahşap kasalı duvar saati, yerde/üstte zincirli cep saati |
| `devrik` | `cesit`: gugum (dökülmüş su), lamba (kırık şişe, gaz lekesi). Yalnız zemin |
| `esya` | `cesit`: dugme, tespih, cakmak, tabaka |
| `kan` | `buyukluk`: kucuk, orta, buyuk. Toprak emer, taşta kabuk bağlar |
| `un` | — (delik çuvaldan dökülen iz ve küçük yığıntı) |

Her iz `yon` parametresi alabilir (temel açıya eklenir). Aynı yuvaya ikinci iz konursa yana kayar.

## Dosyalar

`ayar.js` (ölçü, ton, renkler) · `perspektif.js` · `kalem.js` (düzlemde hat, 3B kutu/silindir, ışık) · `yerlesim.js` · `mekan-yardim.js` · `kurban.js` · `baski.js` (ton, yıpranma, kâğıt, kıvrım) · `sahne.js` (`fotografKur`, `yuvaBilgisi`) · `masa-zemini.js` · `kutuphane.js` · `mekanlar/` · `izler/`.

## Bilinen eksikler

- Telefon dikeyde fotoğraf ekran genişliğine sığar ama küçük kalır (ekranın üçte biri); yakınlaştırma yok.
- Küçük eşyalar (düğme, çakmak) gerçek boyutlarıyla çok küçük; bulunmaları dokunma bölgesinin en az yarıçapına dayanıyor.
- Hatlar fotoğrafta titremez (baskı durağandır). İz adları henüz dil dosyasında değil (deneme sayfasının `metin-tr.js` dosyasında).
