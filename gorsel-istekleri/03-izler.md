# 03: İzler ve eşyalar

Olay yeri resimlerinin üstüne kodla konacak tek tek nesneler. main2'deki iz atlası tarzında: üstten hafif eğik bakış, tek nesne, kendi gölgesi yok (gölgeyi kod çizer).

main2'den kabul edilenler (yeniden üretilmez): kırmızı yün, cep saati, anahtar, kopuk tespih, makas, demirci çekici, kanlı bez, yırtık mektup, boş çivi, şişe.
main2'den reddedilenler: `muddy_boot` (modern lastik taban), `cigar_stub` (köyde puro yok; sarma sigara izmariti istenir).

## Ortak kurallar

- **Ölçü:** 512x512, nesne ortada, kenarlarda boşluk. Düz beyaz zemin, sonra saydam PNG.
- **Bakış:** yerde duruyormuş gibi, yukarıdan yaklaşık 45 derece.
- **Ölçek:** nesneler kendi gerçek boylarıyla oranlı; küçük nesne (düğme, yüzük) resmin ortasında küçük kalır.
- **Dosya:** `varliklar/gorsel/izler/<ad>.png`

## İstem kalıbı

```text
A single object for a dark detective game set in a village near Gaziantep, Turkey, in 1943, to be placed on the floor of a crime scene. Match the attached style reference exactly (thick trembling ink outline, hatching, muted palette).
Object: <NESNE>
Seen from above at about 45 degrees, lying on the ground, centered, no cast shadow, plain flat white background, 512x512. No text.
```

## Liste

| Ad | `<NESNE>` |
| --- | --- |
| `carik-izi` | a footprint of a flat soft rawhide sandal (çarık) in mud, rounded toe, no heel, no tread pattern |
| `postal-izi` | a footprint of a 1940s hobnailed army boot in mud, a heel and a pattern of nail heads |
| `cizme-izi` | a footprint of a leather riding boot in mud, narrow sole, distinct heel, smooth |
| `yalin-ayak-izi` | a bare human footprint in mud |
| `nal-izi` | a mule's horseshoe hoof print in mud |
| `ters-nal-izi` | a mule's hoof print in mud with the horseshoe nailed backwards (opening toward the toe) |
| `un-izi` | a trail of flour footprints and scattered flour on a dark floor |
| `izmarit` | the stub of a hand-rolled cigarette with tobacco shreds |
| `kehribar-tespih` | a string of amber prayer beads, broken, beads scattered |
| `altin-bilezik` | a thick twisted gold bracelet |
| `anahtar-destesi` | a ring of old iron keys |
| `sedef-cakmak` | a small mother-of-pearl inlaid lighter |
| `muhtar-muhru` | a small brass official seal stamp with a wooden handle |
| `kasket` | a grey flat cloth cap, dropped |
| `mor-oya` | a torn piece of purple headscarf with lace edging |
| `mektup-destesi` | a bundle of letters tied with a faded ribbon |
| `kiraz-baston` | a cherry-wood walking stick |
| `mesin-kese` | a small leather pouch on a broken cord |
| `dolma-kalem` | a green fountain pen |
| `tel-gozluk` | round wire-rimmed glasses, one lens cracked |
| `tufek-kovani` | a brass rifle cartridge case |
| `pirinc-duduk` | a brass whistle on a chain |
| `boynuz-kama` | a curved dagger with a horn handle |
| `tutun-tabakasi` | a dented tin tobacco box, open, tobacco spilled |
| `mavi-boncuk` | a bracelet of blue beads, broken |
| `bakir-gugum` | a copper water jug (güğüm), knocked over |
| `asker-dugmesi` | a single brass army greatcoat button |
| `ot-torbasi` | a small cloth bag of dried herbs, spilled |
| `gobek-makasi` | small blackened iron scissors |
| `veresiye-defteri` | a black-covered ledger, open, ink entries |
| `kopya-kalemi` | a purple copying pencil |
| `raki-sisesi` | a flat glass rakı bottle |
| `kaval` | a reed shepherd's flute |
| `kirmizi-yun-yumagi` | a ball of red wool yarn, unravelling |
| `keci-cingiragi` | a goat bell on a frayed string |
| `teneke-masrapa` | a dented tin drinking cup |
| `gaz-lambasi` | a sooty glass oil lamp, knocked over, glass cracked |
| `orme-kirbac` | a braided leather whip |
| `gemici-feneri` | a metal hurricane lantern |
| `orak` | a sickle with a cloth-wrapped handle |
| `bakir-sini` | a large round copper tray |
| `pirinc-can` | a brass donkey bell |
| `kama` | a plain straight dagger |
| `balta` | a wood axe |
| `kazma` | a pickaxe |
| `kurek` | a gravedigger's shovel |
| `dirgen` | a wooden pitchfork |
| `urgan` | a coil of thick hemp rope |
| `bag-bicagi` | a curved pruning knife |
| `demir-cubuk` | an iron bar from a mill mechanism |
| `sican-otu` | a small paper packet of rat poison, opened, white powder spilled |
| `av-kovani` | a red paper shotgun shell |
| `kumas-lifi` | a small tuft of torn coarse brown wool cloth caught on a splinter |
| `kece-tuyu` | a tuft of grey felt fibres |
| `kan-lekesi` | a dark dried blood stain on the ground, irregular, not cartoonish |
| `kan-damlalari` | a few dark dried blood drops in a short trail |
