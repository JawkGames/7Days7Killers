# Olay üretim motoru (`src/simulasyon/`)

Ekransız, saf, belirlenimci. Tek giriş noktası:

```js
import {koy} from '../icerik/index.js';
import {cekirdekListesi} from '../icerik/olay-cekirdekleri/index.js';
import {vakaUret, ifade, vakaDenetle} from '../simulasyon/index.js';

const vaka = vakaUret(1943, {...koy, cekirdekler: cekirdekListesi});      // düz veri, JSON'a yazılabilir
ifade(vaka, 'cemil', {tur:'konum', kisi:'cemil', zaman:12}, {gun:3});      // Cemil o an için ne der?
vakaDenetle(vaka);                                                         // [] ise vaka kendi içinde tutarlı
kaliteRaporu(vaka);                                                        // çözücü + kalite eleği (aşağıda)
```

- **Aynı tohum + aynı köy + aynı ayar = birebir aynı vaka.** Rastgelelik yalnızca `cekirdek/rastgele.js` (`rng`) içinden, her aşama kendi etiketli akışıyla (`zar.js`). Math.random ve Date kullanılmaz (test bunu zorlar).
- `tohum` sayı ya da metin olabilir. Kurulamayan vaka (`UretimHatasi`) **ya da kalite eleğinden geçemeyen vaka** türetilmiş akışla yeniden denenir; kaçıncı denemede kurulduğu `vaka.deneme`'dedir, elenen denemeler `vaka.kalite.elenenDenemeler`'de. En çok `elekDeneme` (12) elenmeden sonra en az kusurlu deneme döner (`vaka.kalite.gecti === false`). `{elek:false}` eleği kapatır (ilk kurulan deneme döner, rapor yine yazılır).
- Motor **metin üretmez**: her şey anahtar ve kimliktir. Kişi/mekân/eşya/sır metni `src/dil/tr/`'de, aynı kimlikle.
- Sayılar `ayar.js` içinde (`SIM_AYAR`); katil ve gün sayısı `cekirdek/ayarlar.js`'ten gelir. Deneme için üçüncü parametre: `vakaUret(t, koy, {katilSayisi:5, oranlar:{kacanTanik:1}})`.
- İnceleme: `node araclar/vaka.js <tohum> [--ifadeler] [--cizelge] [--cozum]`; toplu tarama: `node araclar/tohum-tara.js 1000`.

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
  sirlar:      [{sahip, id, tur, rol, kimler:[...]}], // rol: 'fail' | 'tanik' | 'magdur' (kişi verisinden)
  harita:      {mekanId: [komşu mekânlar]},          // iki yönlü; mekân verisindeki `komsular`dan
  katiller:    [{kisi, cinayet, yardimEttigi}],
  cinayetler:  [Cinayet],                            // zamana göre sıralı
  baglar:      [Bag],
  olaylar:     [Olay],                               // zamana göre sıralı
  izler:       [Iz],
  yanilticilar:[Yaniltici],
  cizelge:     {kisiId: [mekanId | null] × T},       // T = gunSayisi × D
  neden:       {kisiId: [nedenAnahtari] × T},
  ifadeler:    [Ifade],                              // önceden hesaplanmış önemli ifadeler
  kalite:      {gecti, nedenler:[tur], zorluk:{adim, sorgu, tekTanik, fotograf, sigar},
                zincirler:{katil: bağımsız zincir sayısı}, celiski, elenenDenemeler:[{deneme, nedenler:[tur]}]}
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
  yontem,                  // 'bicak' | 'darbe' | 'bogma' | 'zehir' | 'tufek' | 'suda-bogma' | 'itme' | 'asma'
  silah: null | {esya, sahip, calinti, birakildi, olay, mekanAleti, getirildi?},
                           // olay: çalıntıysa hırsızlık olayının id'si
                           // mekanAleti: yerin aletiyse (dirgen, balta, av tüfeği...) o mekân, sahip null; değilse null
                           // getirildi: yerin aleti katilin kendi evinden/iş yerinden getirildiyse true
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
| `yara` | `anahtar` (`bicak-yarasi`, `ezik-yara`, `bogaz-morlugu`, `zehir-kopugu`, `kursun-yarasi`, `islak-ceset`, `dusme-yarasi`, `ip-izi`), `kisi` (kurban); tüfekte `esya, sahip, adaylar` (+`mekanAleti`) | her cinayette bir tane |
| `silah` | `anahtar, iztur, esya, sahip, adaylar`, yerin aletiyse `mekanAleti` (sahip null) | olay yerinde kalan alet. Yerin aleti olay yerinde kapıldıysa `adaylar` boş; katil kendi yerinden getirdiyse o yerin halkı |
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

`gercek.neden` değerleri: `yontem`, `katil-silahi`, `mekan-aleti`, `calinti-silah`, `katil-birakti`, `yardimci-birakti`, `tanik-kacarken`, `onceden-gecti`, `kurbanin`, `zehir-kaynagi`, `gordu`, `duydu`, `katil-disaridaydi`, `gizli-isi-vardi`, `katilin-giysisi`, `kurban-tirmaladi`, `olay-yerinde-dusurdu`, `saldiriya-ugradi`, `kacarken-dusurdu`, `calinmisti`. Bu alan **gerçektir**: oyuncuya gösterilmez; kalite eleği ve son sahne içindir (çözücü görmez). `gercek.tamamlama: true` izin tamamlama turunda eklendiğini söyler (aşağıda).

Her cinayette katile giden en az bir iz vardır (kendi eşyası/silahı, yüzünden tanıyan tanık ya da dolaylı iz). İki bağımsız zincir şartını çözücü denetler; motor gerekirse **tamamlama** yapar: çözücü bir katile iki bağımsız zincir bulamazsa vakaya o katilin bir izi daha eklenir (en çok `tamamlamaTuru` = 3 tur; sırayla onu korumayacak birinin gördüğü kanlı giysi/tırmık, olay yerinde katilin bir eşyası ya da örtü lifi, komşu mekândan yüzünü seçen bir tanık; hepsi çizelgeye uyar).

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
| `{tur:'fark', cinayet}` | konuşanın o cinayetten sonra fark ettiği dolaylı izler: `[{iz, alt, kisi, esya?, ortu?, zaman, mekan}]` |

**Dönen:** `{konusan, olgu, tavir, kural, gercek, bilgi, soylenen, gerginlik}`

- `bilgi`: konuşanın gerçekten bildiği: `{deger}` | `{degil: mekan}` ("orada değildi") | `{adaylar:[...]}` (eşyanın kimlerde olduğunu bilir) | null (bilmez).
- `tavir`: `dogru` | `yalan` | `susar` | `abarti` | `bilmez` | `olu` (sorgu gününden önce öldü; yalnızca `{gun}` verilince).
- `fark` için: her kayıt konusu olan kişinin (`kisi`) aleyhinedir ve yalan kuralı kayıt kayıt işler; yalan ve susma kaydı listeden çıkarır (uydurma iz yok), abartı `abarti:{tur:'ek-ayrinti'}` ekler. `{gun}` verilirse o güne kadar fark edilmemiş kayıt söylenmez. Kendi aletinin çalındığını söylemek doğrudur.
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
| `harita.js` | komşuluk haritası (mekân verisindeki `komsular`) |
| `tablolar.js` | eşya→iz, sır türü→sebep, ilişki→sebep, mizaç katsayıları |
| `roller.js` | `sebepAdaylari` (bütün katil→kurban sebepleri), `rolleriSec` (katiller, kurbanlar, bağlar) |
| `cizelge.js` | sıradan günler ve sırlardan doğan gizli hareketler; kilitli yerleştirme |
| `cinayet.js` | cinayetin zamanı, yeri, yöntemi; hırsızlık, ot alma, kaçan tanık, bulunma |
| `izler.js` | fiziksel, tanık, dolaylı izler; yanıltıcılar |
| `yalan.js` | `ifade`, `ifadeMotoru`, `onemliIfadeler` |
| `cekirdek.js` | çekirdek seçimi ve doğrulaması |
| `denetim.js` | `vakaDenetle`: vakanın iç tutarlılığı (testler 200 tohumda çalıştırır) |
| `cozucu/gorunum.js` | `oyuncuGorunumu(vaka)` → `{gorunum, eslem}`: oyuncunun gördüğü yüz |
| `cozucu/coz.js` | `coz(gorunum)`: çözücü; `bagimsizlar`, `sorguTakvimi` |
| `cozucu/kalite.js` | `kaliteRaporu(vaka)`, `KALITE_AYAR`, `kaliteOzeti` |

## Tasarım kararları

- **Önce gerçek, sonra iz, sonra yalan.** Roller → çizelge → cinayetler (çizelgenin içine) → izler (çizelgeden okunur) → ifadeler (vakadan okunur). Her aşama bir öncekinin verisini değiştirmez, yalnızca kilitli yerleştirme yapar.
- **Sebepler veriden.** Dört kaynak: katilin kendi sırrı (kurban o sırrın içinde; sırrın `rol`üne göre susturma ya da intikam), kurbanın sırrı (katil o sırrın içinde ve tehdit altında), **tanığın korkusu** (sırrın tanığı, o sırrın içindekilerden biri onu susturmak istiyorsa önce davranır: değirmen gecesini duyan Hoca, patikayı gören Yusuf), ilişkiler (borç, husumet, korku, rekabet, koruma; koruma artık korunanı susturmak isteyene karşı da: saklanan oğlunu gören patikacıya karşı baba). Yakınlık sebebi zayıflatır (anne çocuğunu kolay öldürmez), yalnızca korku zayıflamaz. `enAzSebep` altındaki çiftler cinayete yetmez.
- **Aynı kişiler hep katil çıkmasın diye** katil seçimi sebep toplamının 0.1. kuvvetiyle ve mizacın 0.3. kuvvetiyle yapılır. Elekten geçen 1000 vakada herkes %20 ile %41 arasında katil çıkar (tohum-tara çıktısı).
- **Yöntem kişiye ve yere bağlı.** Kendi eşyası (kama, makas, orak, çekiç, kırbaç, rakı şişesi, tüfek, ot torbası), yerin aleti (`tablolar.js` `MEKAN_ALETI`: dirgen ve urgan harman yerinde, bağ bıçağı fıstıklıkta, kürek mezarlıkta, kazma bağ evinde, av tüfeği konakta, sıçan otu bakkalda, süngü mağarada, her evde balta), çalıntı alet, silahsız (elle boğma, taşla vurma), suda boğma (çeşme, değirmen), yüksekten itme (mağara, sınır patikası, değirmen), asma (urgan). Zehrin kalıntısı her zaman olay yerinde kalır.
- **Yanıltıcı izler çürütülebilir kurulur:** kaçan tanık korkak, katil ya da katilin yakını olmaz (susar/inkâr eder/korur); önceden geçenin cinayet anında yanında yakını olmayan en az iki kişi vardır; çalıntı silahın sahibi o an benzer biçimde doğrulanabilir değilse çalınma seyrektir; sahte mazeret (örtme) ancak orada uyanık bir üçüncü kişi varsa kurulur (o "burada değildi" diyebilir).
- **Rewind'e hazır:** roller, günler, çizelge, cinayet ve izler ayrı akışlardan gelir. Oyuncu müdahalesi (kurbanı korumak) ileride çizelgeye kilitli bir yerleştirme olarak eklenip cinayet aşaması yeniden koşturulabilir; rol seçimi kaymaz.
- **Gece günün ilk dilimi.** Böylece her oyun gününün sabahında o günün fotoğrafı vardır; 7. günün cinayeti de 7. gün görülür.
- **Cinayet yeri:** kurbanın o anki yeri ya da (katil ile kurban arasında bağ varsa daha çok) kurbanın çağrıldığı ıssız bir yer; başka insanların olduğu yer çok az seçilir. Orada biri kaldıysa göz tanığıdır.
- **Kaçan tanık** PLAN'daki kırmızı kazak zinciridir: komşu mekândan biri olay yerine düşer, eşyasını bırakır, ertesi gün giysisinin yırtığı fark edilir; korkaksa susar.
- **Kaybolan eşya geri gelmez:** olay yerinde kalan nesne, çalınan alet ya da kaçarken düşen eşya sonraki günlerde ne iz bırakır ne silah olur. Ölenin buluşmaları ve ziyaretleri iptal olur (sevgilisi öldükten sonra Cemil o eve gitmez).
- **Kalabalık bastırılır:** bir cinayeti komşu mekândan en çok iki kişi görür, üç kişi duyar.
- **Komşuluk mekân verisinde:** `src/icerik/mekanlar/<id>.js` `komsular:[...]`, iki yönlü yazılır (`kur.js dogrula` denetler).

## Çözücü (`cozucu/`)

Çözücü vakayı **yalnızca oyuncunun ulaşabildiği bilgiyle** çözmeye çalışır. Bunu yapısal olarak garanti etmek için vakayı hiç almaz:

```js
import {oyuncuGorunumu,coz,kaliteRaporu} from '../simulasyon/index.js';
const {gorunum, eslem} = oyuncuGorunumu(vaka);   // gorunum çözücüye, eslem yalnızca eleğe
const cozum = coz(gorunum);
```

`coz.js` hiçbir şey içe aktarmaz; elindeki tek şey `gorunum`dur (test bunu kaynağı okuyarak ve gerçek alanları bozup çözümün değişmediğini görerek sınar).

### `gorunum` (oyuncunun gördüğü)

| alan | içerik |
| --- | --- |
| `ayar` | `{gunSayisi, dilimler, gunlukSorguHakki, sorguAni:[gün → zaman]}` |
| `kisiIdleri`, `kisiler` | herkesçe bilinen: `{ev, is, cinsiyet, yas, mizac, ortu, esyalar}` (rol ve ölüm yok) |
| `aile` | `{kisi:[eş, ana-baba, çocuk]}`: köyde herkes bilir; öteki ilişkiler bilinmez |
| `harita` | komşuluk |
| `esyaIzi(esya)` | herkesçe bilinen kural: eşya olay yerinde hangi izi bırakır |
| `fotograflar(gun)` | o güne kadar gelen fotoğraflar: `{cinayet, gun, zaman, mekan, kurban, bulan, bulunmaZamani, izler:[{id, alt, anahtar, iztur?, adaylar, kisi?, saat?}]}`. İzin sahibi, yanıltıcılığı, bırakıldığı an yoktur; `id` opaktır (`f1`…, tohumla karıştırılmış) |
| `sorgula(kisi, olgu, gun)` | `{konusan, olgu, gun, cevap, soylenen}`; `cevap`: `'soyledi'` \| `'sustu'` \| `'bilmiyor'` \| `'olu'`. Yalnızca `ifade()`'nin `soylenen`'i (temizlenmiş): silüetin kimliği silinir (yalnızca `ortu`, dedikoducunun `tahmin`i), dolaylı iz kimliği opaktır (`d1`…), "kimse" demek ile "bilmiyorum" aynıdır. O gün bilinmeyen cinayet, görülmemiş iz sorulamaz (hata). Sorulabilenler: `konum` ve `gorulen` (bilinen bir cinayetin anı ya da bir önceki dilim), `fail`, `esya` (fotoğraftaki iz), `fark` |

`eslem`: `fizikselIz(f3) → i12`, `dolayliIz`, `fizikselId`, `dolayliId` (yalnızca elek ve araçlar).

### Akıl yürütme

1. **Sorgular.** Her cinayet fotoğraf gününde bilinir. Çözücü yaşayan herkese her soruyu sorar (her cinayet için ~24×24 konum, gördükleri, fail, fotoğraftaki her iz, fark). Cevap sorgu gününe göre değişmez (yalnızca ölüm ve "henüz olmadı" sınırlar), bu yüzden fotoğraf gününde bir kez; `fark` üç gün boyunca. Her ifadenin sorulabileceği gün penceresi `[ilkGun, sonGun]` (kurban öldüğü sabahtan önceki güne kadar).
2. **Güven kuralı** (oyuncunun sezgisi): başkası hakkındaki **suçlayıcı** söz inanılır (olay yerinde gördüm, evde değildi, giysisi kanlıydı). **Aklayıcı** söz (mazeret: "o benimleydi") ancak doğrulayan kendisi de oradaysa, yakını değilse (en az bir yakın olmayan doğrulayan), kimse çelişmiyorsa ve kişiyi gösteren doğrudan bir işaret yoksa kabul edilir. İki ayrı (yakın olmayan) doğrulayan `saglam`, biri `zayif`. Kişinin kendi hakkındaki sözü tek başına bir şey kanıtlamaz; ama çelişkiye düşerse (mazeret çürür) kaydedilir.
3. **İşaretler:** fotoğraftaki iz (aday kümesi), olay yerinde yüzünden görülme, silüet (aynı örtüyü giyenler), dolaylı iz (kanlı giysi bıçak/darbe yarasıyla, tırmık boğma/asma/itme/suda boğmayla uyuşursa; düşürülen eşya fotoğraftaki izle eşleşirse), yokluk (gece evinde değildi; zayıf, tek başına zincir kurmaz).
4. **Açıklamalar** (masum açıklama): `mazeret`, `tanik-anlatimi` (olay yerinde olduğunu kendisi söylüyor ve orada başka birini/bir silüeti/bir sesi anlatıyor), `saldiriya-ugradi` (başkası giysisinin yırtıldığını gördü), `calinti` (aletinin cinayetten önce çalındığını kendisi söyledi), `zayif-isaret` (yalnızca yokluk ya da kalabalık bir aday kümesi gösteriyor). Tanık anlatımı ya da çalınma bir izi açıklarsa o iz kimseyi göstermez.
5. **Zincir türleri** (`tur`): `tanik` (yüzünden gören tanık + aynı tanığın suçlaması ya da şüphelinin olay yerinde olmayı inkârı), `dolayli` (kanlı giysi, tırmık, düşürülen eşya + fotoğraftaki iz), `iz` (izin adaylarından açıklanamayan tek kişi kalır; ötekiler mazeretle elenir; tek adaylı izde tek kişinin sözüne dayanan mazeret izin karşısında durmaz), `siluet` (aynı mantık, örtüyle), `kesisim` (iki işaretin açıklanamayan adayları tek kişide buluşur).
6. **Bağımsızlık:** zincirin sabit kaynakları (iz `iz:f3`, konuşan `k:hasan`; şüphelinin kendi sözü hariç) ayrık olmalı; her eleme için başka bir zincirde kullanılmamış bir doğrulayan seçilir. Bağımsız zincirler açgözlü seçilir (`bagimsizlar`).
7. **En az sorgu:** her cinayet için baş şüpheliye en ucuz iki bağımsız zincir (yoksa bir) ve tek adaylı bir izin gösterdiği her masumun en ucuz açıklaması seçilir (açgözlü, yeni konuşan sayısını en aza indirerek). Gereken ifadeler konuşan başına gün penceresi kesişimlerine göre oturumlara bölünür, oturumlar günlük `gunlukSorguHakki` (şimdilik 4) ile 7 güne "son günü en erken olan önce" yerleştirilir (`sorguTakvimi`). Yaklaşıktır (açgözlü), alt sınır değildir.

### `coz(gorunum)` çıktısı

```
{
  cinayetler:[{cinayet, zaman, mekan, kurban, fotografGunu,
    supheliler:[{kisi, zincirler:[id], bagimsiz:[id], bagimsizSayisi}],   // bağımsız zincire göre sıralı
    zincirler:[{id, kisi, tur, alt, not?, sabit:[kaynak], kaynaklar:[kaynak], ifadeler:[ifadeId], izler:[izId],
                eleme:[{kisi, tur, kaynaklar:[kisi]}]}],
    isaretler:[{tur:'iz'|'siluet'|'yokluk'|'dogrudan', ..., adaylar, durum:[{kisi, aciklama}]}],
    aciklamalar:{kisi:[{tur, kaynaklar, ifadeler}]},                      // zinciri olmayan, işaret edilen herkes
    dogrudanIsaretli:[kisi]}],
  celiskiler:[{tur:'mazeret-curudu'|'sahte-mazeret'|'ifade-celiskisi'|'suclama-celiskisi', cinayet, zaman, kisi?, ifadeler:[id], ...}],
  failler:[kisi],                                 // her cinayetin baş şüphelisi
  enAzSorgu:{sorgu, sigar, gunler:[[kisi]], oturumlar:[{kisi, ilk, son, gun}], adim, ifade, iz, tekTanik, fotograf,
             plan:[{cinayet, kisi, zincirler:[id], aciklanan:[{kisi, tur}], tekTanik, fotograf}]},
  ifadeler:{id:{konusan, olgu, ilkGun, sonGun, cevap, soylenen}},
}
```

## Kalite eleği (`cozucu/kalite.js`)

`kaliteRaporu(vaka, ayar?)` çözücüyü görünümle koşturur, sonucu gerçekle karşılaştırır. Kurallar (`KALITE_AYAR`, `vakaUret(t, koy, {kalite:{...}})` ile değişir):

| neden (`nedenler[].tur`) | kural |
| --- | --- |
| `zincir-eksik` | her cinayetin asıl failine en az `enAzZincir` (2) bağımsız zincir |
| `masum-zincir` | katil olmayan hiç kimseye zincir gitmez (başka cinayetin katiline gitmesi zararsız) |
| `curutulemeyen-yaniltici` | her yanıltıcı izin gösterdiği her masumun en az bir açıklaması var (ya da iz oyuncuya hiç ulaşmadı: fark eden sustu) |
| `cok-kolay` | en az sorgu < `enAzSorgu` (3), ya da tek tanığın tek ifadesiyle çözülebilen cinayet > `tekTanikEnCok` (5), ya da yalnızca fotoğrafla (sorgusuz) iki zincir kurulan cinayet > `fotografEnCok` (3) |
| `cok-zor` | en az sorgu günlük hakla 7 güne sığmıyor |

**Zorluk** = çözücünün adım sayısı (`zorluk.adim`: seçilen çözümdeki ifade + iz + eleme sayısı) ve en az sorgu (`zorluk.sorgu`).

Dönen: `{gecti, nedenler:[{tur, ...}], zorluk:{adim, sorgu, tekTanik, fotograf, sigar}, katiller:[{kisi, cinayet, yardimci, zincirSayisi, bagimsiz, ilkSupheli, zincirler}], yanilticilar:[{id, cinayet, aciklama, isaret, curutuldu, curutme:[{kisi, yol:[{tur, kaynaklar}]|null}], izler:[opak id]}], celiskiler, enAzSorgu, cozum}`. Vakaya kısa özeti (`kaliteOzeti`) `vaka.kalite` olarak yazılır.

## Bilinen eksikler

- Çözücünün en az sorgusu açgözlüdür, gerçek en az sayı değildir; tek oturumda her şey sorulabilir varsayılır (oturum başına soru sınırı yok).
- Çözücü katile "iki bağımsız zincir" ararken izi bırakanın katil olduğunu varsayar; önceden geçenin izi gibi yanıltıcılar ancak mazeretle çürür. Sahte mazeret (örtme) ve katilin yakınının yalanı hâlâ masuma zincir kurabilir; bu vakalar elenir (`masum-zincir`).
- Tamamlama turu vakaları kolaylaştırır (çoğu zincir fotoğraf ya da kanlı giysi); zorluk dağılımı dar (en az sorgu çoğunlukla 4-9, hakkın çok altında).
- Sıradan çizelge basit (her gün aynı kalıp, cuma/pazar yok, hava yok).
- Gece çoğu tanıklık silüettir ve sekiz kadının entarisi gibi kalabalık örtüler nadiren zincire döner.
