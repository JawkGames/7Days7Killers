# 02: Olay yerleri (20 mekân)

Her cinayetin sabahı masaya o mekânın resmi gelir. Resim BOŞTUR: ceset örtüsü ve izler (ip, kan, ayak izi, alet) oyunda kodla, her oyunda farklı yerlere konur. Bu yüzden zeminin geniş ve açık görünmesi şart.

Tarz için `varliklar/gorsel/tarz/ornek-mekan.webp` (main2'deki değirmen) referans eklenir. Değirmen ve demirci dükkânı main2'den alındı; onlar listede yok.

## Ortak kurallar

- **Ölçü:** 1920x1080 (16:9), düz resim, saydamlık yok.
- **Kamera:** ayakta duran birinin göz hizası, hafif aşağı bakış. Resmin alt yarısında zemin açıkça görünür ve boştur (izler oraya konacak). Arka duvar ya da ufuk resmin orta üçte birinde.
- **Boş:** insan yok, ceset yok, hayvan yok, kan yok, iz yok.
- **Işık:** tek kaynak (pencere, kapı, gök ya da lamba). Karanlık ama okunur; orta tonlar açık.
- **Dosya:** `varliklar/gorsel/mekanlar/<kimlik>.webp`

## Tek resim istemi (yalnızca baskı mümkün değilse)

```text
Empty crime-scene location for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly: thick trembling black ink lines, hatching, muted dirty palette.
Location: <MEKÂN>
Camera: standing eye height, looking slightly down; the floor or ground fills the lower half of the image and is clearly visible and empty.
Completely empty: no people, no body, no animals, no blood, no evidence.
One light source; dark but readable.
16:9, 1920x1080. No text, no frame, no watermark.
```

## Mekânlar

| Kimlik | `<MEKÂN>` |
| --- | --- |
| `aga-konagi` | The stone courtyard of the landlord's mansion: cut-stone walls, a deep pointed-arch iwan (open vaulted porch) with cushions, a well with a wooden winch, a stone staircase with clay flower pots, a heavy studded wooden gate. Morning sun from the left. |
| `koy-odasi` | The landlord's guest room: low divans (sedir) along both walls with cushions, a plastered fireplace, a barred window letting in daylight, wooden ceiling beams, a reed mat, a copper tray with coffee pots, a hunting rifle hanging on a nail. |
| `muhtar-evi` | Inside the headman's house: a curtained bedding niche (yüklük) with folded quilts, a carved walnut chest with an oil lamp on it, an official document with a seal pinned on the wall, a floor bed, a kilim rug. Light from the open door. |
| `cami` | The village mosque courtyard: a stone portal with a pointed arch and carved wooden doors, the base and shaft of a short stone minaret clearly visible, a row of ablution taps along a wall with stone seats, a stone bench. Overcast morning. |
| `okul` | A one-room village school: wooden desks with benches in rows, a blackboard with chalk writing, a map of Turkey on the wall, an iron stove with a pipe, the teacher's table. Light from a side window. |
| `karakol` | A gendarmerie station room: a rack of rifles, a riveted iron door, a desk with a duty logbook and an oil lamp, walls painted dark to half height, a barred window throwing bar shadows on a stone floor. |
| `bakkal` | Inside a village general store: shelves of jars, sugar loaves, soap and bolts of cloth, a wooden counter with a two-pan balance and weights, a ledger, kerosene tins, open sacks of grain, a folded shop shutter at the entrance letting in daylight. |
| `cesme` | A village fountain square: a stone fountain with a pointed arch niche and a spout, a long stone trough, wet muddy stone paving, dry-stone walls, flat-roofed stone houses behind. Overcast morning. |
| `mezarlik` | A village cemetery: leaning old stone headstones, grave mounds edged with stones, a stone sarcophagus tomb, a freshly dug grave with a shovel, a dry-stone wall, two cypress trees and a hackberry tree. Overcast sky. |
| `harman-yeri` | The threshing floor: a flat circle of beaten earth, a wooden threshing sledge (döven), a stone roller, a pitchfork, a domed straw pile, stubble field and the village flat roofs in the distance. Grey daylight. |
| `fistiklik` | A pistachio orchard: rows of low gnarled pistachio trees receding into the distance, a dry-stone boundary wall, a boundary stone, dry red earth with clods. Overcast. |
| `bag-evi` | A vineyard hut: a one-room stone hut with a dark doorway, a vine-covered pergola, wicker grape baskets, a stone grape-treading basin, rows of low vines. Grey morning. |
| `magara` | Inside a limestone cave looking out toward the bright mouth: rough rock ribs, a cold campfire ring of stones, a straw bedding, a folded army greatcoat. The outside is overexposed white. |
| `sinir-patikasi` | A narrow mule path climbing a rocky limestone slope toward the Syrian border: thorny shrubs, weathered round boulders (not boxy), mule hoof prints in the dust, a white border stone and the silhouette of a watchtower on the ridge. Low clouds. |
| `agil` | A stone sheep fold: dry-stone walls topped with thorn brush, a brushwood gate, a stone water trough, muddy trampled ground, a shepherd's shelter with a branch roof. Grey morning. |
| `halil-evi` | A mule driver's house where house and stable share one room: pack saddles on a low wall, roped bundles of goods, kerosene tins, harness and a bell collar on pegs, a feed trough and straw. Light from a door at the back. |
| `gulsum-evi` | A widowed seamstress's single tidy room: a hand-cranked sewing machine on a low table under a barred window, a half-finished pale dress hanging on the wall, rolls of fabric in a wall niche, a chest with folded cloth, a yarn basket. |
| `sultan-evi` | A very old woman's crumbling room: a sagging ceiling beam propped with a post, plaster fallen off showing stone, a dark half-open door to a shed, milk bowls on the floor (one overturned), an old chest, brushwood. Daylight through a hole in the roof. |
| `ebe-evi` | A midwife's room at night: bundles of dried herbs hanging upside down from a pole, a shelf with bottles and a lit oil lamp, an arched hearth with a copper cauldron, a bronze mortar, a low birthing stool. |
| `irgat-evi` | A poor labourer's home for seven: a reed mat with a low round floor table, wooden spoons and bowls, a tall stack of folded floor mattresses, a covered cradle, a small window half-covered with a patched cloth. Dim but readable. |

## Baskı istemi (4 mekân tek resimde)

```text
A 2x2 sheet of four separate empty crime-scene locations for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly.
Each cell is a 16:9 picture; standing eye height looking slightly down; the floor or ground fills the lower half and is clearly visible and empty. Completely empty: no people, no body, no animals, no blood, no evidence. One light source each; dark but readable.
Top-left: <A>
Top-right: <B>
Bottom-left: <C>
Bottom-right: <D>
Thin black gutters between the cells. Highest resolution available (4K if possible). No text, no labels, no frame.
```
