# 01: Köylüler (24 kişi)

Her köylüden üç resim: temel portre, göz kapalı, ağız açık. Kim olduklarını `KOY-HALKI.md` anlatır. Tarz için `varliklar/gorsel/tarz/ornek-erkek.png` ve `ornek-yasli-kadin.png` dosyalarını referans ekle.

## Ortak kurallar

- **Kadraj (24'ünde aynı):** kare 1024x1024. Baştan bele kadar, gövde dik, yüz kameraya dönük, gözler izleyiciye bakıyor. Başın tepesi üstten %8, çene üstten yaklaşık %45. Ortalanmış. Eller görünmez (kollar yanlarda, kadrajın altında kalır). Ağız kapalı, yüz ifadesi kişinin mizacına uygun ama ölçülü.
- **Işık:** sol üstten tek, sıcak gaz lambası ışığı; yüzün sağ yarısı gölgede.
- **Arka plan:** düz beyaz, sonra saydam PNG.
- **Dosyalar:** `varliklar/gorsel/kisiler/<kimlik>/temel.png`, `goz-kapali.png`, `agiz-acik.png`.
- **Kareler:** `goz-kapali` ve `agiz-acik` sıfırdan çizilmez; `temel` resmi düzenletilerek üretilir. Yüz, saç, giysi, ışık ve konum birebir aynı kalmalı; yalnızca gözler ya da ağız değişir. Yüz başka birine dönüşürse o kare yeniden üretilir.

## Ortak istem kalıbı

`<KİŞİ>` yerine aşağıdaki tablodan o kişinin satırını koy:

```text
Character portrait for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly: thick trembling black ink outlines, hatched shadows, semi-realistic proportions, muted dirty palette (mossy green, bruise purple, dirty yellow, earth browns).
Subject: <KİŞİ>
Framing: square 1024x1024, head to waist, upright, face toward the viewer, eyes looking at the viewer, top of the head 8% from the top edge, chin about 45% from the top, centered. Mouth closed. Hands not visible.
Light: one warm oil-lamp light from the upper left; the right half of the face in shadow.
Background: plain flat white. No text, no frame, no watermark.
```

Göz kapalı kare:

```text
Edit this exact image. Keep everything identical (face, hair, clothes, light, position, size). Only close both eyes naturally, relaxed eyelids.
```

Ağız açık kare:

```text
Edit this exact image. Keep everything identical (face, hair, clothes, light, position, size). Only open the mouth naturally as if saying "a", showing a dark mouth interior and a hint of teeth.
```

## Kişiler

| Kimlik | `<KİŞİ>` |
| --- | --- |
| `mahmut` | Mahmut Karaaslan, "Hacı Ağa", 62, the village landlord. Proud and heavy-set, broad square face, short grey beard, thick grey moustache, deep-set suspicious eyes. Flat dark cloth cap, dark wool aba cloak over a waistcoat and collarless white shirt. A silver pocket-watch chain on the waistcoat. |
| `zeliha` | Zeliha Karaaslan, "Hanımağa", 55, the landlord's wife. Long narrow bony face, thin sharp nose, thin pressed lips, cold narrowed eyes, mouth corners turned down. Dark headscarf tied with a pale veil (yaşmak) covering the chin, long dark wine-red dress with a black cardigan, a ring of keys at her sash, a thick gold bracelet. |
| `cemil` | Cemil Karaaslan, "Küçük Ağa", 28, the landlord's son. His father's broad square face and flat nose but young; restless, irritable eyes, a thin pencil moustache, hair combed to the side. Bareheaded. Good dark city overcoat over a white shirt. |
| `dursun` | Dursun Yıldız, the village headman (muhtar), 50. Sharp chin, high cheekbones, narrow sly eyes, one eyebrow slightly raised, half smile. Thick grey moustache. Grey flat cap, worn grey overcoat over a waistcoat. |
| `naciye` | Naciye Yıldız, the headman's wife, 44, the village gossip. Round full face, plump cheeks, large curious eyes, a small mole above the lip. Purple headscarf with lace edging, long brown dress, a small key on a string around her neck. |
| `elif` | Elif Yıldız, the headman's daughter, 19. Soft young round face, large innocent eyes, small nose. Light cream headscarf loosely tied, a dark braid visible, a red wool cardigan over a long light dress. |
| `abdullah` | Abdullah Efe, the village imam ("Hoca"), 58. Calm, heavy-lidded wise eyes, long white beard. A proper wrapped white turban (sarık) around a small cap, layered folds visible. Dark long robe (cübbe), a small leather pouch on a cord around the neck. |
| `nihat` | Nihat Erdem, the village schoolteacher ("Muallim"), 26, from İzmir. Long thin face, high forehead, proud heavy-lidded look, light stubble, hair combed back. Round wire-rimmed glasses. Grey overcoat, white shirt, thin dark tie. |
| `riza` | Rıza Demirtaş, the gendarmerie corporal ("Onbaşı"), 35. Hard square face, knitted thick brows, thick black moustache, a small scar on the cheekbone. Olive-green 1940s Turkish gendarmerie peaked cap and greatcoat (kaput) with collar tabs. |
| `halil` | Halil Kılıç, "Kör Halil", 40, a mule driver and smuggler. Broad rough sunburnt face, thick knitted brows, drooping thick moustache, stubble. His LEFT eye is milky white and half closed with a stitched scar across it; the right eye is dark and hard. Messy black hair to the neck. Coarse brown aba cloak. |
| `fadime` | Fadime Kılıç, Halil's wife, 36. Small narrow tired face, eyes cast down, worried brows, dark circles. Plain brownish headscarf pulled low to the eyebrows, long faded dress, a blue bead bracelet. |
| `bekir` | Bekir Çelik, the blacksmith ("Bekir Usta"), 47. Big heavy man, broad square face, thick neck, wide nose, soot on the skin, short beard and thick moustache. Small skullcap. Burnt leather apron over a rough shirt. |
| `yusuf` | Yusuf Çelik, the blacksmith's son, 22, an army deserter hiding in a cave. His father's nose and jaw but gaunt: hollow cheeks, pale skin, large frightened eyes, unkempt short hair, a scruffy young beard. Worn army greatcoat with a missing button. |
| `hatice` | Hatice Şahin, the midwife ("Ebe Ana"), 68. Small pointed wrinkled but lively face, sharp black eyes under lowered brows, a mole on the chin, a knowing half smile. Blue-grey speckled headscarf, grey hair just visible, long dark dress. |
| `arif` | Arif Tok, the grocer ("Bakkal Arif"), 52. Bald round head with thin grey hair at the sides, plump wide face, double chin, squinting calculating eyes, greying moustache, one brow raised. Pale cloth apron with a pocket over a shirt and waistcoat, a copying pencil behind his ear. |
| `kazim` | Kâzım Öztürk, the miller ("Değirmenci"), 45. Angry knitted brows, puffy purple under-eyes, receding hairline, stubble, thick moustache. Flour dust on his face, hair and clothes. Flour-whitened apron over a rough shirt. |
| `hasan` | Hasan Kaya, the shepherd ("Çoban Hasan"), 24. Sunburnt young face, big naive eyes, brows raised at the outer ends, light brown hair, a modest moustache. Brown felt shepherd's cap (külah) and a wide stiff felt shepherd's cloak (kepenek). |
| `gulsum` | Gülsüm Aksoy, the widowed seamstress ("Dul Gülsüm"), 33. Long even handsome face, strong cheekbones and jaw, heavy lids, a level proud gaze. All-black headscarf tied at the back of the neck, black long dress, a tape measure around the neck. |
| `bektas` | Bektaş, the village madman ("Deli Bektaş"), 55. Wild matted grey hair and beard, pale wide unfocused eyes, gentle lost expression. A goat bell on a string around his neck, a ragged patched aba cloak. |
| `sultan` | Sultan Polat, the old cat woman ("Kedili Nine"), 74. Very old, sunken cheeks and temples, deep wrinkles, clouded calm eyes, toothless thin mouth. A grey-beige wool shawl over her head and shoulders, long faded dress. |
| `kadir` | Kadir Bozkurt, the landlord's steward ("Kâhya"), 43. Square hard face, close-set narrow eyes, very thick knitted brows, a broken nose, a drooping moustache, thick neck and broad shoulders. Short hair. Dark aba cloak, a coiled whip over the shoulder. |
| `ismail` | İsmail Uçar, a day labourer ("Irgat İsmail"), 38. Narrow long face, hollow cheeks and temples, large anxious eyes, brows raised at the inner ends, thin neck. A checked cloth head wrap (poşu) knotted at the side. Patched old aba. |
| `emine` | Emine Uçar, İsmail's wife, a maid at the landlord's house, 34. Wide tired face, heavy-lidded eyes, dark circles, a loose strand of hair escaping. Yellow headscarf tied at the back of the neck, a plain long dress. |
| `suleyman` | Süleyman Aydın, the travelling peddler ("Çerçi"), 49. Round face, full cheeks, big nose, a sly smile with one corner higher, squinting friendly-cunning eyes, greying moustache. Brown flat cap, worn brown overcoat over a waistcoat. |
