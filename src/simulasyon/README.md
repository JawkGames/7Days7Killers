# Olay üretim motoru (`src/simulasyon/`)

Ekransız, saf, belirlenimci. Tek giriş noktası:

```js
import {koy} from '../icerik/index.js';
import {cekirdekListesi} from '../icerik/olay-cekirdekleri/index.js';
import {vakaUret, ifade, vakaDenetle} from '../simulasyon/index.js';

const vaka = vakaUret(1943, {...koy, cekirdekler: cekirdekListesi});      // düz veri, JSON'a yazılabilir
ifade(vaka, 'cemil', {tur:'konum', kisi:'cemil', zaman:12}, {gun:3});      // Cemil o an için ne der?
vakaDenetle(vaka);                                                         // [] ise vaka kendi içinde tutarlı
```

- **Aynı tohum + aynı köy + aynı ayar = birebir aynı vaka.** Rastgelelik yalnızca `cekirdek/rastgele.js` (`rng`) içinden, her aşama kendi etiketli akışıyla (`zar.js`). Math.random ve Date kullanılmaz (test bunu zorlar).
- `tohum` sayı ya da metin olabilir. Kurulamayan vaka (`UretimHatasi`) türetilmiş akışla yeniden denenir; kaçıncı denemede kurulduğu `vaka.deneme`'dedir.
- Motor **metin üretmez**: her şey anahtar ve kimliktir. Kişi/mekân/eşya/sır metni `src/dil/tr/`'de, aynı kimlikle.
- Sayılar `ayar.js` içinde (`SIM_AYAR`); katil ve gün sayısı `cekirdek/ayarlar.js`'ten gelir. Deneme için üçüncü parametre: `vakaUret(t, koy, {katilSayisi:5, oranlar:{kacanTanik:1}})`.
- İnceleme: `node araclar/vaka.js <tohum> [--ifadeler] [--cizelge]`.

## Zaman

Bütün zamanlar tek bir tam sayıdır: **`zaman` (t) = (gün−1) × D + dilim sırası**, D = `ayar.dilimler.length`.

- `ayar.dilimler = ['gece','sabah','ogle','ikindi','aksam']`, yani D = 5, t = 0…34.
- **`gece` günün İLK dilimidir**: bir önceki akşamdan sonraki, sabaha karşı biten gece. PLAN'daki "gün sonu: gece yeni cinayetler işlenir" cinayeti, ertesi günün `gece` diliminde durur; o günün sabahı fotoğraf masaya gelir.
- `gun = Math.floor(t/D)+1`, `dilim = ayar.dilimler[t % D]`. Saat aralıkları gösterim içindir: `ayar.dilimSaatleri`.
- Her kayıtta `zaman` asıl alandır; `gun`/`dilim` olan yerlerde yalnızca kolaylık içindir.

## Vaka nesnesi

```
{
  surum: 1, tohum, deneme,
  ayar:        {katilSayisi, gunSayisi, dilimler:[...], dilimSaatleri:{}, bulunmaDilimi:'sabah'},
  cekirdekler: ['eski-yangin', ...],                 // karışan olay çekirdekleri
  kisiler:     {kisiId: {ev, is, mizac, cinsiyet, yas, ortu, esyalar:[...], rol, olum}},
  iliskiler:   [{kimden, kime, tur}],                 // iki yönlü (kur.js ile aynı)
  sirlar:      [{sahip, id, tur, kimler:[...]}],
  harita:      {mekanId: [komşu mekânlar]},          // iki yönlü
  katiller:    [{kisi, cinayet, yardimEttigi}],
  cinayetler:  [Cinayet],                            // zamana göre sıralı
  baglar:      [Bag],
  olaylar:     [Olay],                               // zamana göre sıralı
  izler:       [Iz],
  yanilticilar:[Yaniltici],
  cizelge:     {kisiId: [mekanId | null] × T},       // T = gunSayisi × D
  neden:       {kisiId: [nedenAnahtari] × T},
  ifadeler:    [Ifade]                               // önceden hesaplanmış önemli ifadeler
}
```

Vaka kendi kendine yeter: yalan motoru ve denetim yalnızca vakayı okur, köy verisine bakmaz. Kayıt dosyasına olduğu gibi yazılabilir.

### `kisiler[id]`

Köy verisinin kopyası (`ev`, `is` (null olabilir), `mizac`, `cinsiyet`, `yas`, `ortu`, `esyalar`) ve bu vakanın sonucu:

- `rol`: `'katil'` (yardımcılar da katildir) | `'kurban'` | `'masum'`.
- `olum`: kurbanın öldüğü `zaman`, yaşayanlarda `null`.

### `cizelge` ve `neden`

`cizelge[k][t]` kişinin o dilimdeki mekânıdır. Tek değerli olduğu için kimse aynı dilimde iki yerde olamaz. Kurban ölüm diliminde olay yerindedir, sonra hep `null`.

`neden[k][t]` neden orada olduğunu söyler (diyalog "orada ne işin vardı?" sorusunu buradan cevaplar):

| Anahtar | Anlamı |
| --- | --- |
| `ev`, `is`, `su`, `alisveris`, `sohbet`, `ibadet`, `ogutme`, `dolasma` | sıradan gün (çeşme, bakkal, köy odası, cami, değirmen) |
| `ziyaret:<kisi>` | dostunu ziyaret |
| `mezar-ziyareti` | |
| `sir:<sirId>` | **sırrı yüzünden** orada (gizli buluşma, sınırda kaçak, mağaraya yemek, gece dolaşma). Bu dilim kişinin aleyhinedir: masum da yalan söyler. |
| `ortaklik:<kisi>` | suç ortağıyla akşam buluşması (gizli) |
| `cinayet:<cid>` | katil, cinayeti işlerken |
| `cinayet-yardim:<cid>` | yardımcı |
| `cagrildi:<cid>` | kurban, katil tarafından oraya çağrılmış (yoksa kurbanın kendi nedeni kalır) |
| `hirsizlik:<oid>` | katil, kullanacağı aleti çalarken |
| `ot-alma:<oid>` | katil, zehir otunu alırken |
| `yoldan-gecerken:<cid>` | kaçan tanık, komşu mekândan olay yerine düştü |
| `ses-duydu:<cid>` | kaçan tanık, gece evinden sese çıktı |
| `arama:<cid>` / `rastlanti:<cid>` | cesedi bulan (yakınıysa arama) |
| `olu` | ölmüş (mekân null) |

### `Cinayet`

```
{
  id:'c1', sira, katil, kurban, yardimci: kisi|null,
  zaman, gun, dilim, mekan,
  fotografGunu,            // oyuncunun bu cinayetin fotoğrafını gördüğü gün (her gün bir tane)
  yontem,                  // 'bicak' | 'darbe' | 'bogma' | 'zehir' | 'tufek' | 'suda-bogma'
  silah: null | {esya, sahip, calinti, birakildi, olay},   // olay: çalıntıysa hırsızlık olayının id'si
  zehirKaynagi: null | {kisi, esya, olay},                 // zehir başkasının otundansa (ot-alma olayı)
  sebep: Sebep,
  zorlayan: kisi|null,     // şantajla zorlayan katil
  ortan: kisi|null,        // sahte tanıklık veren katil
  cekirdek: id|null,       // bu çifti güçlendiren olay çekirdeği
  cagrildi: bool,          // kurban olay yerine çağrıldı mı
  iddialar: {kisi: mekan}, // katilin (ve yardımcının) o dilim için söyleyeceği mazeret yeri
  gozTaniklari: [kisi],    // o anda olay yerinde olan diğer herkes (kaçan tanık dahil), sıralı
  kacanTanik: null | {kisi, esya, nereden, olay},
  bulunma: {zaman, gun, dilim, bulan, neden:'rastlanti'|'arama', olay},
  izler: [izId]
}
```

### `Sebep`

```
{tur, agirlik, kaynak, ek:[{tur, kaynak}], asil?}
```

- `tur`: `susturma` | `intikam` | `husumet` | `borc` | `korku` | `koruma` | `kiskanclik` | `namus` | `miras` | `santaj` (şantajcıdan kurtulmak) | `ceza` | `ihanet` | `zulum` | `zorlama` (başka bir katil tarafından şantajla zorlandı).
- `kaynak`, sebebin köy verisindeki dayanağı (hiçbir sebep uydurulmaz):
    - `{tur:'sir', sahip, sir}`: bir sır (katilin ya da kurbanın).
    - `{tur:'iliski', iliski}`: katilin kurbana ilişkisi (`borclu`, `hasim`, `korkar`, `calisan`).
    - `{tur:'rekabet', uzerine}`: aynı kişiye sevda/sözlülük.
    - `{tur:'koruma', korunan, iliski?|sir?}`: katilin koruduğu kişiyi korkutan, ona hasım olan ya da sırrını açabilecek kurban.
    - `{tur:'santaj', zorlayan, sahip, sir}`: yalnızca `zorlama`da: zorlayan, katilin bu sırrını biliyor. O zaman `asil: {tur, kaynak}` zorlayanın kurbana olan asıl sebebidir.
- `ek`: aynı çiftin öbür sebepleri (sorguda ikinci, üçüncü iz olarak açılabilir).

### `Bag` (katiller arası)

| tur | alanlar | anlamı |
| --- | --- | --- |
| `ortaklik` | `katil, yardimci, cinayet` | yardımcı da cinayet anında olay yerindeydi |
| `ortme` | `ortan, ortulen, cinayet` | ortan, ortulen'in mazeretini doğrular. `cinayet.iddialar[ortulen]` ortanın o anki yeridir (gece başkasının evi inandırıcı olmadığı için o durumda bağ kurulmaz) |
| `santaj` | `zorlayan, zorlanan, sir:{sahip, sir}, cinayet` | zorlayan, zorlananın sırrıyla onu kendi hasmını öldürmeye zorladı |

### `Olay`

Her iz bir olaya bağlıdır; olaydaki herkes `zaman` anında `mekan`'dadır (denetim bunu sınar).

```
{id, tur, zaman, mekan, kisiler:[...], cinayet, ...}
```

| tur | ek alanlar | id |
| --- | --- | --- |
| `cinayet` | | cinayetin id'si (`c1`) |
| `hirsizlik` | `esya, sahip` | `o…` |
| `ot-alma` | `esya, sahip, sir:{sahip,sir}` | |
| `kacis` | `nereden` | kaçan tanık |
| `bulunma` | | |
| `gecis` | | olay yerinden daha önce geçen masum (yanıltıcı izin gerçek nedeni) |
| `gizli-hareket` | `sir:{sahip,sir}` | o gece sırrı yüzünden dışarıda olan masum |

### `Iz`

Ortak alanlar: `{id:'i1', tur, alt, cinayet, olay, zaman, mekan, yaniltici, gercek:{neden, ...}}`.

**Fiziksel** (`tur:'fiziksel'`, fotoğrafta görünür, `mekan` her zaman olay yeridir):

| alt | alanlar | not |
| --- | --- | --- |
| `yara` | `anahtar` (`bicak-yarasi`, `ezik-yara`, `bogaz-morlugu`, `zehir-kopugu`, `kursun-yarasi`, `islak-ceset`), `kisi` (kurban); tüfekte `esya, sahip, adaylar` | her cinayette bir tane |
| `silah` | `anahtar, iztur, esya, sahip, adaylar` | olay yerinde kalan alet |
| `esya` | `anahtar, iztur, esya|null, ortu|null, sahip, adaylar` | eşyadan ya da örtüden (lif) kalan iz |
| `kurban-esyasi` | `anahtar` (eşya id'si; gümüş saat ise `durmus-saat` ve `gercek.gosterdigiDilim`), `esya, sahip` | |

- `anahtar`: fotoğrafta çizilecek şey (`kirmizi-yun-ipi`, `cizme-izi`, `aba-tiftigi`, `cekic`...). `iztur`: `ayak-izi` | `lif` | `kirinti` | `leke` | `nesne`.
- `adaylar`: bu anahtarı bırakabilecek herkes (eşyası ya da örtüsü aynı olan). Kırmızı yün ipi Elif'i de Gülsüm'ü de gösterir; aba tiftiği beş kişiyi.
- `zaman`: izin bırakıldığı an (önceki geçişte cinayetten önceki bir dilim).

**Tanık** (`tur:'tanik'`): `{tanik, gorulen|null, kesinlik:'yuz'|'siluet'|null, ortu, nereden, mekan, zaman}`

- `olay-tanigi`: olay yerindeydi (`nereden === mekan`). `gordu`: komşu mekândan gördü. `ses`: duydu (`anahtar`: `silah-sesi` | `bagirti`, `gorulen:null`).
- `siluet`: yüzü seçemedi, yalnızca örtüyü (`ortu`) gördü. Gece çoğu tanıklık silüettir.

**Dolaylı** (`tur:'dolayli'`, sonradan fark edilir): `{kisi, fark_eden, zaman, mekan, esya?, ortu?}` — `fark_eden` o anda `kisi` ile aynı yerdedir (gece yokluğunda evdedir).

| alt | anlamı |
| --- | --- |
| `gece-yoklugu` | ev halkından biri, o gece `kisi`'nin yatağının boş olduğunu fark etti (katil ya da sırrı yüzünden dışarıdaki masum) |
| `kanli-giysi`, `tirmik` | katilin üstünde |
| `eksik-esya` | olay yerinde düşen eşyası artık üstünde yok |
| `yirtik-giysi` | kaçan tanığın giysisi yırtık |
| `eksik-alet` | sahibi aletinin çalındığını fark etti; `gercek.cinayettenOnce` true ise çalıntı silah yanıltıcısını çürütür |

`gercek.neden` değerleri: `yontem`, `katil-silahi`, `calinti-silah`, `katil-birakti`, `yardimci-birakti`, `tanik-kacarken`, `onceden-gecti`, `kurbanin`, `zehir-kaynagi`, `gordu`, `duydu`, `katil-disaridaydi`, `gizli-isi-vardi`, `katilin-giysisi`, `kurban-tirmaladi`, `olay-yerinde-dusurdu`, `saldiriya-ugradi`, `kacarken-dusurdu`, `calinmisti`. Bu alan **gerçektir**: oyuncuya gösterilmez, çözücü ve son sahne içindir.

Her cinayette katile giden en az bir iz vardır (kendi eşyası/silahı, yüzünden tanıyan tanık ya da dolaylı iz). İki bağımsız zincir şartını çözücü (4. aşama) denetleyecek.

### `Yaniltici`

```
{id:'y1', cinayet, izler:[izId], isaret:[kisi], aciklama, olay, curutme:[...]}
```

- `isaret`: izin ilk bakışta gösterdiği masum(lar). Asıl katil ya da yardımcı hiçbir zaman burada olmaz.
- `aciklama`: `tanik-kacti` (kırmızı kazak zinciri) | `calinti-silah` | `onceden-gecti` | `otu-vermisti` | `gizli-isi-vardi`.
- `olay`: masum açıklamanın simülasyondaki gerçek olayı (`kacis`, `hirsizlik`, `gecis`, `ot-alma`, `gizli-hareket`).
- `curutme`: yanıltıcıyı çürüten yollar: `{tur:'konum', kisi, zaman}` (o kişinin o anki yeri; aynı yerdeki başkaları doğrular), `{tur:'iz', iz}`, `{tur:'ifade', kisi, olgu}`, `{tur:'sir', sahip, sir}`.

Süs için sahte iz yoktur: yanıltıcı izlerin hepsi gerçek bir olaydan çıkar.

## Yalan kuralları (`yalan.js`)

`ifade(vaka, konusan, olgu, {gun}?)` ya da tekrar tekrar sorulacaksa `ifadeMotoru(vaka).ifade(...)`. Saf ve belirlenimci; rastgelelik yok.

**Olgular:**

| olgu | gerçek değer |
| --- | --- |
| `{tur:'konum', kisi, zaman}` | mekan (ölüyse null) |
| `{tur:'gorulen', zaman}` | konuşanın o an gördükleri: `[{kisi, mekan, kesinlik, ortu?}]`, sesler `{kisi:null, ses}` |
| `{tur:'fail', cinayet}` | katil |
| `{tur:'esya', iz}` | izin sahibi |
| `{tur:'sir', sahip, sir}` | true |

**Dönen:** `{konusan, olgu, tavir, kural, gercek, bilgi, soylenen, gerginlik}`

- `bilgi`: konuşanın gerçekten bildiği: `{deger}` | `{degil: mekan}` ("orada değildi") | `{adaylar:[...]}` (eşyanın kimlerde olduğunu bilir) | null (bilmez).
- `tavir`: `dogru` | `yalan` | `susar` | `abarti` | `bilmez` | `olu` (sorgu gününden önce öldü; yalnızca `{gun}` verilince).
- `soylenen`: ağzından çıkan. `dogru` → bilgi; `susar` → null (gördüklerinde: korunan kişi listeden çıkar, kalanı söylenir); `yalan` → uydurma değer (konumda `iddialar`daki mazeret ya da olağan yeri, failde katilin hasmı ya da null, eşyada başka bir aday, sırda false); `abarti` → bilgi + `abarti:{tur:'kesinlik'|'ek-ayrinti', tahmin?}` (dedikoducu silüete isim koyar).
- `kural`: neden böyle konuştuğu: `katil`, `suc-ortagi`, `katil-inkar` (katil, kendi cinayeti dışında da şüpheli her şeyi inkâr eder), `ortme`, `santaj`, `santaj-korkusu`, `seven-korur`, `borclu`, `korku`, `suc-ortakligi`, `dostluk`, `korkak`, `husumet`, `dedikoducu`, `sir-saklama`, `olay-yerinde`, `masum-esya`, `gelecek`, `olu`, null.
- `gerginlik`: 0..1. Masumlar da gerilir (sırrı, olay yerinde olmak); tek başına kanıt değildir.

**Sıra:** konuşan bilmiyorsa `bilmez`. Olgu konunun aleyhine değilse doğru (dedikoducu başkası hakkında abartır). Aleyhine ise:

1. Kendisi hakkında: kendi cinayeti → yalan; başka bir cinayetin katiliyse → yalan (`katil-inkar`); sırrı yüzünden oradaysa ya da sırrı soruluyorsa saf doğruyu söyler, korkak/sakin susar, öbürleri yalan söyler; olay yerinde masumsa korkak susar, öbürleri anlatır.
2. Başkası hakkında: örtme bağı → yalan; aynı cinayetin ortağı → yalan; şantaj → susar; seven (eş, anne-baba, çocuk, sevgili, sevdalı, koruyan) → yalan (korkak/saf susar); borçlu alacaklısını satmaz → susar; korktuğunu → susar; suç ortağını → susar; dostunu → susar; korkak → susar; hasım → abartır; dedikoducu → abartır; yoksa doğru.

Bir olgu şu durumlarda kişinin aleyhinedir: o anda bir cinayetin olay yerindeyse (kurban hariç) ya da `neden`i gizli bir işse (`sir:`, `ortaklik:`, `hirsizlik:`, `ot-alma:`, `cinayet…`, `yoldan-gecerken:`, `ses-duydu:`); fail, eşya ve sır soruları her zaman aleyhtedir. Silüet görenler kimi gördüğünü bilmediği için yakınını koruyamaz.

**Bilgi kuralları:** kişi kendi yerini bilir; aynı mekândaki herkesi bilir (gece olay yerinde yalnızca silüet gördüyse hariç); tanık izi olan gördüğünü bilir; gece yokluğunu fark eden "evde değildi"yi bilir; birinin mazeret yerinde uyanıksa "burada değildi"yi bilir; ortan ve zorlayan katilin yerini bilir. Failin kim olduğunu katil, yardımcı, ortan, zorlayan ve yüzünden tanıyan tanık bilir. Eşyanın kimlerde olduğunu herkes bilir (küçük köy); kendisininse sahibi bilir. Sırrı sahibi ve sırrın `kimler`i bilir.

`vaka.ifadeler` önceden hesaplanmış önemli ifadelerdir: her cinayet anında herkesin kendi yeri, tanıkların gördükleri, faili bilenlerin cevabı, olay yerindeki eşyanın sahibinin cevabı, ortanın ifadesi. Motor aynı değeri yeniden hesaplar (test bunu sınar).

## Olay çekirdekleri

`src/icerik/olay-cekirdekleri/<id>.js`, şema `cekirdek.js` başında:

```js
export default {
  id:'eski-yangin', agirlik:1,
  gerekli:['kadir','mahmut','sultan'],                // hepsi köyde değilse atlanır
  ciftler:[{katil:'kadir', kurban:'sultan', carpan:3}],// var olan sebebin ağırlığını çarpar
  baglar:[{tur:'ortme', ortan:'mahmut', ortulen:'kadir'}] // ikisi de katil çıkarsa önerilen bağ
};
```

Çekirdek yeni sebep yaratmaz; köyde sebebi olmayan çift test hatasıdır (`cekirdekDogrula`). Her vakaya `ayar.cekirdekSayisi` (2) çekirdek karışır. `src/icerik/olay-cekirdekleri/index.js` Vite'ta hepsini toplar (`cekirdekListesi`); düz node'da araç klasörü `fs` ile okur.

## Modüller

| Dosya | İş |
| --- | --- |
| `index.js` | `vakaUret`, dışa açılanlar |
| `ayar.js` | `SIM_AYAR`, `ayarKur` |
| `zar.js` | etiketli tohumlu akışlar, ağırlıklı seçim, `UretimHatasi` |
| `dunya.js` | köy verisinden türetilen yardımcılar (sıralı kimlikler, ilişki, ev halkı, zaman) |
| `harita.js` | komşuluk haritası |
| `tablolar.js` | eşya→iz, sır türü→sebep, ilişki→sebep, mizaç katsayıları |
| `roller.js` | `sebepAdaylari` (bütün katil→kurban sebepleri), `rolleriSec` (katiller, kurbanlar, bağlar) |
| `cizelge.js` | sıradan günler ve sırlardan doğan gizli hareketler; kilitli yerleştirme |
| `cinayet.js` | cinayetin zamanı, yeri, yöntemi; hırsızlık, ot alma, kaçan tanık, bulunma |
| `izler.js` | fiziksel, tanık, dolaylı izler; yanıltıcılar |
| `yalan.js` | `ifade`, `ifadeMotoru`, `onemliIfadeler` |
| `cekirdek.js` | çekirdek seçimi ve doğrulaması |
| `denetim.js` | `vakaDenetle`: vakanın iç tutarlılığı (testler 200 tohumda çalıştırır) |

## Tasarım kararları

- **Önce gerçek, sonra iz, sonra yalan.** Roller → çizelge → cinayetler (çizelgenin içine) → izler (çizelgeden okunur) → ifadeler (vakadan okunur). Her aşama bir öncekinin verisini değiştirmez, yalnızca kilitli yerleştirme yapar.
- **Sebepler veriden.** Üç kaynak: katilin kendi sırrı (kurban o sırrın içinde), kurbanın sırrı (katil o sırrın içinde ve tehdit altında), ilişkiler (borç, husumet, korku, rekabet, koruma). Yakınlık sebebi zayıflatır (anne çocuğunu kolay öldürmez), yalnızca korku zayıflamaz. `enAzSebep` altındaki çiftler cinayete yetmez; bu yüzden bugünkü köyde Hoca ile Yusuf hiç katil olmaz (sebepleri yok denecek kadar zayıf).
- **Aynı kişiler hep katil çıkmasın diye** katil seçimi sebep toplamının 0.2. kuvvetiyle ve mizacın 0.6. kuvvetiyle yapılır. 300 tohumda katil olma sıklığı %14 ile %51 arasında, 200 tohumda 200'e yakın farklı katil kümesi.
- **Rewind'e hazır:** roller, günler, çizelge, cinayet ve izler ayrı akışlardan gelir. Oyuncu müdahalesi (kurbanı korumak) ileride çizelgeye kilitli bir yerleştirme olarak eklenip cinayet aşaması yeniden koşturulabilir; rol seçimi kaymaz.
- **Gece günün ilk dilimi.** Böylece her oyun gününün sabahında o günün fotoğrafı vardır; 7. günün cinayeti de 7. gün görülür.
- **Cinayet yeri:** kurbanın o anki yeri ya da (katil ile kurban arasında bağ varsa daha çok) kurbanın çağrıldığı ıssız bir yer; başka insanların olduğu yer çok az seçilir. Orada biri kaldıysa göz tanığıdır.
- **Kaçan tanık** PLAN'daki kırmızı kazak zinciridir: komşu mekândan biri olay yerine düşer, eşyasını bırakır, ertesi gün giysisinin yırtığı fark edilir; korkaksa susar.
- **Kaybolan eşya geri gelmez:** olay yerinde kalan nesne, çalınan alet ya da kaçarken düşen eşya sonraki günlerde ne iz bırakır ne silah olur. Ölenin buluşmaları ve ziyaretleri iptal olur (sevgilisi öldükten sonra Cemil o eve gitmez).
- **Kalabalık bastırılır:** bir cinayeti komşu mekândan en çok iki kişi görür, üç kişi duyar.
- **Komşuluk mekân verisinde yok;** `harita.js` içinde başlangıç tablosu var. Mekân dosyasına `komsular:[...]` eklenirse o da kullanılır.

## Bilinen eksikler

- `sir.rol` (sahibi fail mi, tanık mı, mağdur mu) veride yok; `tablolar.js` içindeki `SIR_ROLU` geçici olarak üç sırrı düzeltiyor (Hoca'nın değirmen gecesi, Nine'nin yangın tanıklığı, Bektaş'ın eski kimliği).
- Yöntem çoğu zaman taş/odunla vurma ya da boğma çıkıyor (eşya silahı olmayan kişiler için).
- "İki bağımsız ipucu zinciri" ve zorluk ölçümü çözücünün (4. aşama) işi; motor yalnızca her katile en az bir iz bırakır.
- Sıradan çizelge basit (her gün aynı kalıp, cuma/pazar yok, hava yok).
