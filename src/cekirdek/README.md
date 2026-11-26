# Çekirdek ve platform modülleri

Bu klasördeki modüller (ve `src/platform/` altındakiler) saftır ya da tarayıcı API'lerinin ince sarmalayıcısıdır; hepsi tarayıcı olmadan test edilir (`testler/olay`, `zaman`, `kayit`, `girdi`). Tarayıcıya dokunan işlevler `pencere` / `belge` / `depo` parametresi alır; testte sahte nesne verilir, oyunda varsayılan kullanılır.

| Modül | Ne yapar |
| --- | --- |
| `cekirdek/rastgele.js` | `rng(tohum)`: tohumlu rastgele |
| `cekirdek/matematik.js` | `hex`, `rgba`, `lerp`, `clamp`, `yumusak`, `bez` |
| `cekirdek/ayarlar.js` | `AYARLAR`: oyunun bütün sayıları, dondurulmuş |
| `cekirdek/olay.js` | `olayKanali()`, ortak kanal `olaylar` |
| `cekirdek/zaman.js` | gün/adım/sorgu hakkı/karar/geri sarma |
| `platform/kayit.js` | sürüm numaralı kayıt, göç zinciri |
| `platform/girdi.js` | imleç, dokunma, telefonu eğme |
| `platform/ekran.js` | tam ekran, yön, sayfa gizlenmesi |
| `platform/tercih.js` | `azHareket` (sistem ayarı) |

## ayarlar.js

```js
import {AYARLAR} from '../cekirdek/ayarlar.js';
AYARLAR.gunlukSorguHakki   // 4 (karar bekliyor, geçici)
AYARLAR.katilSayisi, AYARLAR.gunSayisi, AYARLAR.finalSecimSayisi   // 7, 7, 7
AYARLAR.kayit.anahtar      // '7d7k.kayit'
AYARLAR.egim               // {azamiAci, oluBolge}
AYARLAR.tercihler          // {dil:'tr', azHareket:null}
```

Derin dondurulmuştur. Başka değerle denemek için yeni nesne kurup ilgili işleve verin: `zamanBaslat({tohum, ayar:{...AYARLAR, gunlukSorguHakki:3}})`.

## olay.js

```js
import {olaylar, olayKanali} from '../cekirdek/olay.js';

const birak = olaylar.abone('konusma.yaz', metin => altyazi.textContent = metin);
olaylar.birKez('giris.bit', () => konus('...'));
olaylar.bildir('konusma.yaz', 'Ben o gece');   // çağrılan abone sayısını döndürür
birak();                                       // ya da olaylar.birak('konusma.yaz', fn)
olaylar.temizle('konusma.yaz');                // ad verilmezse hepsi
olaylar.aboneSayisi('giris.bit');
```

- Hata atan abone diğerlerini durdurmaz; hata `olayKanali({hata:(e, ad) => ...})` ile verilen işleyiciye (varsayılan `console.error`) gider.
- Bildirim sırasında abone olan ya da bırakan, o anki bildirimi etkilemez.
- Olay adları için öneri: `modul.olay` (`konusma.basla`, `giris.bit`, `zaman.degisti`).

## zaman.js

Durum düz veridir; işlevler yenisini döndürür, eskisine dokunmaz. Geçersiz geçişte `ZamanHatasi` atılır (`e.kod`).

```
gun-basi -> fotograf -> cagirma <-> sorgu -> ... cagirma -> gun-sonu -> (ertesi gün) gun-basi
son günün gun-sonu -> karar -> geriSar (gün 1, döngü+1) | hukumVer -> bitti
```

```js
import {zamanBaslat, ilerle, cagir, geriSar, hukumVer, kalanSorgu, kararBekliyor} from '../cekirdek/zaman.js';

let z = zamanBaslat({tohum: 1943});    // {tohum, dongu:1, gun:1, adim:'gun-basi', sorguKalan:4, cagrilanlar:[], sorgudaki:null, hukum:null, kural:{...}}
z = ilerle(z);                         // fotograf
z = ilerle(z);                         // cagirma
z = cagir(z, 'elif');                  // sorgu, sorguKalan 3
z = ilerle(z);                         // cagirma'ya döner
z = ilerle(z);                         // gun-sonu (kalan hak yanar)
kalanSorgu(z);                         // bugün kalan sorgu hakkı
// ... yedinci günün gun-sonu'ndan sonra:
kararBekliyor(z);                      // true
z = geriSar(z);                        // REWIND TIME: tohum aynı, dongu+1
z = hukumVer(z, yediKisi);             // FINAL VERDICT: adim 'bitti', hukum: [...]
```

Hata kodları: `gecersiz-gecis`, `hak-yok`, `kisi-yok`, `karar-bekliyor`, `oyun-bitti`, `secim-sayisi`, `secim-tekrar`, `gecersiz-tohum`, `gecersiz-durum`. `zamanSorunu(d)` durum geçerliyse `null`, değilse sorunu anlatan metin döndürür.

- Kurallar (`gunSayisi`, `gunlukSorguHakki`, `finalSecimSayisi`) başlarken duruma kopyalanır; ayarlar sonraki sürümde değişse de kayıtlı oyun kendi kurallarıyla sürer.
- Defter zamanın parçası değildir: geri sarmada çağıran taraf defteri korur.
- Hükmün doğruluğu burada hesaplanmaz.

## platform/kayit.js

Depoya `{surum, kayitZamani, veri}` zarfı yazılır. Hiçbir işlev hata atmaz; hepsi Promise döndürür (depo eşzamanlı ya da eşzamansız olabilir).

```js
import {kaydet, yukle, sil, kayitKur, kayitVerisi, bellekDepo} from '../platform/kayit.js';

await kaydet(kayitVerisi({zaman: z, defter, tercihler: {dil:'tr', azHareket:null}}));
// {tamam:true, surum, kayitZamani} | {tamam:false, neden:'gecersiz-veri'|'depo-dolu'|'depo-erisilemez'}

const y = await yukle();
// {tamam:true, veri, surum, eskiSurum, gocEdildi, kayitZamani}
// {tamam:false, neden:'kayit-yok'|'bozuk'|'gelecek-surum'|'goc-yok'|'goc-hatasi'|'sema-hatasi'|'depo-erisilemez', ...}

await sil();

// Testte ya da başka depoyla:
const k = kayitKur({depo: bellekDepo(), saat: () => 0});
```

- **Depo bağdaştırıcısı:** `{oku(anahtar), yaz(anahtar, metin), sil(anahtar)}`. Hazır olanlar `localStorageDepo()` (varsayılan; erişim her işlemde ayrı denenir) ve `bellekDepo()`. Capacitor Preferences örneği dosyanın içinde yorumda.
- **Şema (sürüm 1):** `{tohum, dongu, zaman, defter, tercihler:{dil, azHareket}}`. `tohum` ve `dongu` zamanla aynı olmalı; `kayitVerisi` bunları zamandan alır. `defter` şimdilik opak nesne.
- **Göç:** `KAYIT_SURUMU` artırılınca `gocler[eski]` eklenir: `n` sürümündeki veriyi alıp `n+1` sürümündekini döndüren saf işlev. Yükleme zinciri adım adım uygular, sonucu doğrular. Yükleme depoyu değiştirmez; göç edilmiş veri bir sonraki `kaydet` ile yeni sürümle yazılır.
- **Gelecek sürüm** (oyuncu oyunu eski sürüme döndürdüyse) yüklenmez ve silinmez. **Bozuk** kayıt da silinmez; `ham` alanı ile döner, ne yapılacağına arayüz karar verir.

## platform/girdi.js

```js
import {isaretciDinle, egimDinle, egimIzniIste, egimDestekleniyor} from '../platform/girdi.js';

const birak = isaretciDinle(e => ...);        // pointermove + pointerdown

const egimBirak = egimDinle(({x}) => kameraHedef = x);   // x: -1..1, sağa eğince artı
egimBirak.merkezle();                          // şu anki duruşu yeni sıfır yap
egimBirak();                                   // dinlemeyi bitir

// iOS: izin bir dokunmanın işleyicisinden, başka await'ten önce istenmeli
dugme.onclick = async () => {
  const s = await egimIzniIste();              // 'izin' | 'red' | 'gerekmiyor' | 'desteklenmiyor'
  if (s === 'izin' || s === 'gerekmiyor') egimDinle(...);
};
```

- İlk okunan duruş merkez kabul edilir (telefon nasıl tutuluyorsa orası 0). Ekran dönünce merkez yeniden alınır.
- Dikey ekranda `gamma`, yatay ekranda `beta` kullanılır (`screen.orientation.angle`, yoksa `window.orientation`).
- Destek yoksa ya da tarayıcı boş olay gönderiyorsa hiçbir şey olmaz.

## platform/ekran.js

```js
import {tamEkranAc, tamEkranKapat, tamEkranDegistir, tamEkranMi, yon, yonDinle, gorunurlukDinle, sayfaGizliMi} from '../platform/ekran.js';

await tamEkranAc();                   // true/false; kullanıcı hareketi içinden çağrılmalı, destek yoksa false
yon();                                // 'dikey' | 'yatay'
const b1 = yonDinle(y => yerlesimiKur(y));
const b2 = gorunurlukDinle(gizli => gizli ? dongu.durdur() : dongu.surdur());
```

`gorunurlukDinle` `visibilitychange` ile birlikte `pagehide`/`pageshow`'u da dinler ve aynı durumu iki kez bildirmez.
