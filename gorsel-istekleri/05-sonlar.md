# 05: Sonlar

Müfettiş yedinci gün 7 kişiyi katil diye seçer. Ardından üç bölüm oynar: seçilen 7 kişinin her biri için bir kayıp sahnesi, pencere sahnesi, gerçeğin açıklanması (yazı).

## A. Kayıp sahneleri (24 kişi)

Seçilen kişi artık yoktur; geride kalan yer gösterilir. Duygu boşlukla ve nesneyle verilir. İnsan varsa yalnızca karanlık, oturan ya da duran, yüzü görünmeyen silüet olur.

main2'deki `loss_cats` Kedili Nine için kabul edildi (`varliklar/gorsel/kayip/sultan.webp`). Diğer üçü (bank, aile, atölye) Avrupa kasabası gibi durduğu için reddedildi.

- **Ölçü:** 1920x1080, düz resim.
- **Dosya:** `varliklar/gorsel/kayip/<kimlik>.webp`
- **Önemli:** sahnede "katil olduğunu gösteren kanıt" ÇİZİLMEZ. Oyun, hem masumda hem katilde görülebilen ikircikli ayrıntıları (yarı açık sandık, ocakta yanmış bez, kapı arkasında bir alet) ayrı nesne olarak kodla ekler; böylece kaç doğru bulunduğu sahnelerden sayılamaz.

İstem kalıbı:

```text
A quiet, sorrowful scene for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly.
Scene: <SAHNE>
Someone is gone and the place shows it. Any people present are dark silhouettes with faces hidden, sitting or standing still; no hands in close-up, no legs in motion.
One light source, deep shadows, much empty space.
16:9, 1920x1080. No text, no frame, no watermark.
```

| Kimlik | `<SAHNE>` (oyundaki cümleden) |
| --- | --- |
| `mahmut` | The landlord's guest room: the place of honour on the floor cushion is empty. A coffee pot with two cups on a copper tray; one cup cooling, untouched. |
| `zeliha` | The mansion's pantry door, locked with a heavy old lock. No one else knows where the key is. |
| `cemil` | A stable at dusk: a saddled horse waiting. Through a doorway, a floor table set with one extra plate. |
| `dursun` | The headman's table: his brass seal lies on it next to an unsigned official paper. |
| `naciye` | The village fountain: women standing silently as dark silhouettes, no one talking. |
| `elif` | An open dowry chest; a red wool cardigan folded on top, a mother's silhouette holding it. |
| `abdullah` | The mosque at dawn, minaret silent, the courtyard empty, a walking stick leaning by the door. |
| `nihat` | The locked door of the village school; small children's silhouettes waiting outside. Through the window, a half-written sentence on the blackboard. |
| `riza` | The gendarmerie desk at night: the duty logbook open to an empty page, an unfinished letter to his mother beside it. |
| `halil` | A stable: three mules standing still with loaded pack saddles; no one unloads them. |
| `fadime` | The village fountain: a copper jug full and overflowing under the spout; no one comes to take it. |
| `bekir` | The smithy: the forge fire dying, the bellows down, a half-made horseshoe cooling on the anvil. |
| `yusuf` | A cave: a dead campfire, a folded army greatcoat. On a flat stone at the entrance, a bowl of food left by his father. |
| `hatice` | The midwife's door at midnight, a lantern held by a dark silhouette knocking; no one answers. |
| `arif` | The village store with its shutter down; a group of debtors' silhouettes gathered in front. |
| `kazim` | The water mill: the millstone turning empty, water overflowing the channel. |
| `hasan` | The sheep fold gate: a shepherd dog lying across it, waiting. The flock has not gone out. |
| `gulsum` | The seamstress's room: a half-finished wedding dress on the sewing machine, the needle still in the fabric. |
| `bektas` | The stone bench in the mosque courtyard at night, empty; a tin cup on it, a goat bell lying silent. |
| `sultan` | (main2'den kabul edildi) |
| `kadir` | A storehouse door: the key hanging on a nail. Farm hands' silhouettes sleeping late in the morning light. |
| `ismail` | A poor home: five children's silhouettes sitting around a low floor table; the father's wooden spoon in the middle, untouched. |
| `emine` | The mansion kitchen: the hearth lit late. Elsewhere, an older girl's silhouette dividing bread for her siblings. |
| `suleyman` | The village fountain: a peddler's donkey tied, its painted pack chest closed, the brass bell silent. |

## B. Pencere sahnesi (katmanlı)

Müfettiş pencereye yürür, aşağıdaki köy meydanına bakar. Kalabalığın tavrı doğru bulunan katil sayısına göre değişir: hepsi doğruysa coşkulu (fenerler, kollar havada), çoğu yanlışsa öfkeli (meşale, dirgen, tırpan, cama taş). Arada kalabalık ikiye bölünür. Kod iki kalabalığı oranla karıştıracağı için katmanlar ayrı istenir.

main2'deki iki kalabalık resmi reddedildi: fötr şapkalı Avrupa kalabalığı, kaldırım taşlı sokak.

| Dosya | Ölçü | İçerik |
| --- | --- | --- |
| `varliklar/gorsel/pencere/meydan.webp` | 1920x1080 | Gece köy meydanı, yukarıdan (birinci kattan) bakış: toprak meydan, kuyu, düz damlı taş evler, kısa bir minare, karanlık gök. İnsan yok. |
| `varliklar/gorsel/pencere/kalabalik-ofke.png` | 1920x1080, saydam | Öfkeli köylü kalabalığı, aynı bakış açısından: aba, şalvar, kasket, poşu, yemeni; meşale, dirgen, tırpan, orak; kollar havada, bağıran ama yüzü seçilmeyen silüetler. Kalabalık resmin alt yarısında. |
| `varliklar/gorsel/pencere/kalabalik-cosku.png` | 1920x1080, saydam | Aynı kalabalık, coşkulu: gaz fenerleri, havaya kalkan kollar, havaya atılan kasket, rahatlamış duruş. Aynı yerleşim ve boyut. |
| `varliklar/gorsel/pencere/oda.png` | 1920x1080, saydam pencere boşluğu | İçeriden bakış: solda büyük ahşap doğramalı pencere (cam kısmı saydam bırakılır), karanlık oda, sağda müfettişin arkadan silüeti: uzun palto, fötr şapka, belden aşağısı masanın arkasında. |

## Baskı istemi (kayıp sahneleri, 4 sahne tek resimde)

```text
A 2x2 sheet of four separate quiet, sorrowful 16:9 scenes for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly.
In each, someone is gone and the place shows it. Any people present are dark silhouettes with faces hidden, still; no hands in close-up, no legs in motion. One light source, deep shadows, much empty space.
Top-left: <A>
Top-right: <B>
Bottom-left: <C>
Bottom-right: <D>
Thin black gutters between the cells. Highest resolution available (4K if possible). No text, no labels, no frame.
```

Pencere katmanları birbirine oturmak zorunda olduğu için baskı yapılmaz; her biri tek resim. Coşkulu kalabalık, öfkeli kalabalık resmi düzenletilerek yapılır (yerleşim ve boyut aynı kalsın).
