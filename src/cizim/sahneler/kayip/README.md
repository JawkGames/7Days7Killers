# Kayıp sahneleri

Final Verdict'ten sonra seçilen 7 kişinin her biri için oynayan kısa, sessiz sahne: kişi yoktur, geride kalan yer gösterilir. Duygu nesneyle ve boşlukla verilir, figürle değil. Kişi katilse aynı sahnede küçük bir kanıt belirir; oyuncuya yazıyla söylenmez.

Deneme sayfası: `prototip/kayip/index.html` (Vite dev sunucusunda `/prototip/kayip/`). Adresle sürülebilir: `?kisi=mahmut&katil=1&tohum=3&t=6` (`t` verilirse o saniyenin durağan karesi çizilir).

## Kullanım

```js
import {kayipSahnesi} from './sahne.js';
const s=kayipSahnesi({
  kisi,                 // src/icerik/kisiler/<id>.js verisi
  katilMi:false,
  tohum:1,
  tuval:canvasEl,
  metin:trKisiler[kisi.id].kayip,           // alt yazı dil dosyasından gelir, koda gömülmez
  bekleyenler:[...],    // isteğe bağlı: bekleyenlerin kişi verileri (silüet cinsiyeti için)
  kanit:{tur:'alet',alet:'orak'},           // isteğe bağlı: kişinin varsayılan kanıtının üstüne yazılır
  yaz:m=>altyazi.textContent=m,             // harf harf açılan kısım
  bitti:()=>{...}                           // kararma bitince bir kez
});
s.oynat();   // baştan oynat (yaklaşık 9,5-10 sn)
s.kare(6);   // 6. saniyenin durağan karesi (kontrol, ekran görüntüsü)
s.durdur();
```

Alt yazı DOM'u çağırana aittir (sorgu arayüzündeki gibi); çizim modülü yalnızca `yaz` ile haber verir. `azHareket` (src/platform/tercih.js) açıkken kamera, titreme, kaynama ve canlı parçalar durur, cümle bir kerede görünür; açılış/kararma ve süre aynı kalır.

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `sahne.js` | `kayipSahnesi`: öğeleri toplar, ön belleklere çizer, kamera, ışık maskesi, kaplama, zaman, alt yazı |
| `sablonlar.js` | Beş şablon (`aile`, `yalniz`, `kimsesiz`, `hayvan`, `is`): kişinin `kayip.tur` alanı seçer |
| `yerler.js` | Sahne yerleri (şablon varyantları): duvar, zemin, ışık, adlı noktalar, oturma yerleri, hayvan yerleri, kanıt yeri |
| `kisiler.js` | `IPUCU`: 24 kişinin sahne ipucu (KOY-HALKI.md'deki "Kaybedilince" cümlesinin karşılığı) |
| `nesneler.js` | `NESNE`: eşyalar (minder, sofra, güğüm, örs, nal, dikiş makinesi...) ve canlı parçaları (alev, buhar, su) |
| `siluetler.js` | Oturan/ayakta insan, kedi, köpek, katır/eşek, sürü silüetleri |
| `kanit.js` | Katil kanıtı: `kanli-bez`, `sandik` (yarı açık), `alet` (`kama`, `bicak`, `orak`, `makas`, `cekic`, `balta`) |
| `mekan.js` | Taş/sıva/tahta duvar, kaya, toprak zemin, tavan, gök, uzak evler, niş |
| `cizer.js` | Ortak fırça: `sekil` (dolgu + leke + tarama + titrek hat), `yerel`, renkler (`R`), çizim durumu |
| `gorunum.js` | Görünüm: dikeyde fazla yükseklik üste ve (alt yazı için) alta paylaşılır |
| `ayar.js` | Ölçü, derinlik, zaman çizelgesi, kamera, kaynama |

`src/cizim/teknik/` yalnızca okunur (`firca.js`, `tuval.js`, `palet.js`); `src/cizim/rig/` kullanılmaz.

## Şablonlar

Şablon, bir yerin (yerler.js) üstüne kendi kuralını koyar:

- **aile:** ev içi. `kisi.kayip.bekleyenler` kadar karanlık, başı öne düşmüş oturan silüet (cinsiyet bekleyenin verisinden). Boş minder/kaşık/tabak ipucuyla gelir.
- **yalniz:** kimse yok; kişinin yeri ve yarım kalmış işi. İstenirse `ekBekleyen` (borçlular gibi).
- **kimsesiz:** dışarısı, soğuk ışık, daha geniş karanlık, tek eşya. Hayvan olabilir (çerçinin eşeği).
- **hayvan:** `ip.hayvan` yerin hayvan noktalarına dağıtılır (kedi, köpek, katır, eşek, koyun sürüsü).
- **is:** kapalı kapı/kepenk, sönmüş ocak; işi bekleyenler (`ekBekleyen`, ör. çocuklar) kapının önünde.

Yerler: `sofra`, `koy-odasi`, `ceyiz`, `ocak-basi`, `kiler`, `masa-basi`, `demirci`, `okul`, `ebe-kapi`, `dukkan`, `cami-avlu` (`zaman:'safak'|'gece'`), `cesme` (`'aksam'|'gece'`), `dikis`, `ambar`, `degirmen`, `karakol`, `magara`, `ahir`, `agil`, `baraka`, `oda`.

## Kişi ipucu şeması (`kisiler.js`)

```js
kimlik:{
  yer:'sofra',                       // yerler.js; yoksa şablonun varsayılanı
  zaman:'gece',                      // dış yerlerde gök
  nesneler:[{nesne:'kasik', yer:'orta'}, {nesne:'minder', x:280, y:958, bos:true}],
  hayvan:{tur:'kedi', sayi:7},       // ya da dizi; kopek için {yer:'kapi', kalkik:true}
  ekBekleyen:{tip:'cocuk', sayi:5, ayakta:false},
  bekleyenGoster:false,              // kayip.bekleyenler cümlede yoksa
  ayaktaBekleyen:[1],                // o sıradaki bekleyen ayakta
  isik:{tur:'lamba', x, y},          // lamba|fener|ocak|kor|aralik|ay|safak|aksam|gun
  kanit:{tur:'alet', alet:'orak', x, y, s}
}
```

Öğeler y'ye göre sıralanır (arkadaki önce). Üstüne nesne konan eşyalar (sofra, masa, seki, örs...) `UST_PAYI` kadar geride sayılır; gerekirse öğeye `z` verilir.

## Yeni kişi eklemek

1. Kişi verisinde `kayip:{tur, mekan, bekleyenler}` ve dil dosyasında `kayip` cümlesi olsun.
2. `kisiler.js` içine kimliğiyle bir ipucu yaz: uygun `yer`, cümledeki nesneler, varsa hayvan ya da ek bekleyen, bir kanıt. İpucu yoksa şablonun varsayılan yeri boş çizilir.
3. Deneme sayfasında `?kisi=<kimlik>&t=6` ve `&katil=1` ile durağan kareye bak; kanıt ışığın kenarında, küçük ama bulunabilir olmalı.

## Yeni yer ya da şablon eklemek

- **Yer:** `yerler.js` içine `ad:ip=>({isik, arka(G,ust,alt), sabit:[...], yer:{...}, oturma:[[x,y,s]], ayakta:[...], hayvan:[[x,y,s,{...}]], kanit:{x,y,s}})`. Ana nesneler x ±360 içinde kalsın (telefon dikeyde yalnız bu genişlik görünür), y ≈ 980'in altı alt yazı bandıdır.
- **Nesne:** `nesneler.js` içinde `(o)=>Y(o,()=>{...})` çizim işlevi yaz, `NESNE`'ye ekle; canlı kısmı varsa `canli(o,t,I,ilerleme)`.
- **Şablon:** `sablonlar.js` içinde `SABLON[tur]={varsayilanYer, kur(k)}`; `kur` silüet/hayvan öğelerini ve `ton:{karanlik,soguk}` döndürür.

## Falso kuralları (uygulanan)

- İnsan yalnız karanlık, oturan ya da uzun giysili sabit silüet; yüz, el, bacak yok. Kadın ve kız çocuklarında baş örtüsü kütlesi.
- Katırların bacakları bölme tahtasının arkasında; eşek bacakları gölgede, ince ve karanlık.
- Kediler oturur/çöreklenir; bazılarının gözü karanlıkta parlar. Köpek yatar, başı kalkık.

## Bilinen eksikler

- Katırlar (Kör Halil) en zayıf sahne: yük denkleri ve kulaklar okunuyor, baş-boyun bağlantısı hâlâ kaba.
- Gelinlik kumaşı masanın önünde soluk bir örtü gibi; gelinlik olduğu cümleden anlaşılıyor, çizimden değil.
- Köy odası (Hacı Ağa) başköşe minderi yastığıyla koltuğa benzeyebiliyor.
- Cami avlusunda gece minare karanlıkta zor seçiliyor.
- Hatlar orta katmanın 3 kopyasıyla saniyede 7 kez kaynar; arka katman durağan.
