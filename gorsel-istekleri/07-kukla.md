# 07: Köylü kuklaları (parçalı karakterler): bütün köylüler

Bu dosya kendi başına yeterlidir. Başka bir dosyaya bakmana gerek yok.

## Ne istiyoruz

Oyundaki 24 köylünün her biri, kodla canlandırılan bir **kukla** olarak çizilecek. Göz bebeklerini, göz kırpmayı ve konuşurken ağzı kod oynatır. Bunun için her köylü ayrı **parçalar** hâlinde lazım.

**Referans resim:** kullanıcı sana Çerçi'nin parça sayfasını verecek. **Bütün köylüler o resmin çizim tekniğine bire bir benzemeli**: aynı çizgi, aynı tarama, aynı doku, aynı renk, aynı ışık. Sadece kişi değişir. Çerçi'yi de bu kurallarla yeniden çiz (listede birinci).

Kullanıcıya her kişi için ayrı ayrı sormadan listedeki herkesi sırayla üret. Kota biterse kaldığın kişiyi `yazisma/gemini.md`'ye yaz.

## Tarz (her resimde aynen; açık kapı bırakmadan)

```
STYLE (fixed, follow exactly, do not improvise; match the attached reference image's drawing technique one to one):
Hand-drawn 2D illustration in a dark 1940s Anatolian folk-horror style, like a detailed old ink engraving that was hand-colored. Semi-realistic adult proportions. NOT cartoon, NOT anime, NOT chibi, NOT painterly, NOT 3D, NOT photographic, NOT a sticker (no white or light outline around the parts).
Line art: black ink, a confident slightly shaky dip-pen outline around every shape (thicker on the outer silhouette, thinner inside). Lines are imperfect and slightly broken in places, like an old print.
Hair, beard, moustache, eyebrows, stubble: MANY fine individual ink strokes drawn strand by strand, every strand visible, grey and white strands mixed in where the age fits. Never a flat filled shape. Hair and beard are the most detailed part of the drawing.
Skin: dense fine ink lines everywhere: forehead lines, crow's feet, eye bags, nasolabial folds, pores, sun damage. Fine cross-hatching in all shadows (eye sockets, under the nose, under the lip, under the cheekbones, under the headwear).
Clothing: worn, patched, dusty wool and cotton; every fold, seam and patch drawn with fine ink hatching.
Color: muted, dirty, desaturated, hand-tinted over the ink: warm sunburnt olive skin with a darker shadow of the same hue, earth browns, dusty greys, faded wool colors, moldy green #2B352C, bruise purple #35273B, dirty yellow #D4B062. No saturated colors. Lightest tone off-white #E8DFC8.
Light: one small dim warm light from the upper left. The right half of the face is darker.
Aging: a light worn-paper texture over everything: faint grain, tiny specks and scratches, a few small chipped spots on the ink lines. Subtle; it must not hide the face.
Face: realistic adult features with character, tired serious expression, mouth closed and neutral.
```

## Parça sayfası: her kişi için 2 resim

Aracın tavanı 1376x768 / 1024x1024 olduğu için her kişi **iki resim**dir. İkisinde de ölçek aynı olmalı: baş, ağızlar ve boyun aynı büyüklükte.

### Resim A: baş, göz, ağız (1376x768, yatay)

```
SHEET A (fixed layout, do not change): one single image, pure flat black background #000000, no text, no labels, no frame, no watermark, no outline around the parts. All parts separated by wide black gaps; nothing touches or overlaps; same scale and same lighting for all parts.
Left half: two heads side by side, front view, same size, filling the full height of the image (top of the headwear near the top edge, chin near the bottom edge):
 1. Head with eyes OPEN, but the EYE WHITES ARE EMPTY: plain off-white almond shapes with NO iris and NO pupil.
 2. The exact same head with eyes CLOSED (curved ink lid lines with lashes). Identical size and position.
 Both heads end EXACTLY at the bottom edge of the chin, jaw or beard: NO neck, NO throat, NO skin below the jaw (the neck belongs only to the torso image).
Right half, top: two separate round irises (eye color fits the person) with a black pupil and a tiny highlight, drawn alone, about the size of the eye whites on the heads.
Right half, bottom: three mouth pieces in a row, cut from the SAME face at the SAME size as on the heads. Each piece shows EVERYTHING around the mouth exactly as on the head (nose tip, moustache, beard, stubble, chin tattoo, wrinkles); only the lips change: closed, half-open (teeth slightly visible), wide open (dark inside, tongue visible). A moustache or beard must NEVER be missing from the mouth pieces.
```

### Resim B: gövde (1024x1024)

```
SHEET B (fixed layout): one single image, pure flat black background #000000, no text, no frame, no outline around the part.
Torso from the waist up, front view, WITH the neck attached at the top and NO head; the neck top is cut flat. Arms hang relaxed, hands not visible (cut by the bottom edge). The neck is at the same scale as the heads in Sheet A (neck width = about 40% of the head width). Skin color identical to the heads.
```

### Teslim

- `varliklar/gorsel/kukla/<kimlik>-a.png` ve `varliklar/gorsel/kukla/<kimlik>-b.png` (kimlik aşağıdaki tabloda).
- Kesmene gerek yok; Claude keser.

## Kişiler (sırayla)

Her istemin sonuna kişinin satırını `CHARACTER:` diye ekle. Hepsi 1943, Gaziantep'e bağlı bir köy.

| Sıra | Kimlik | CHARACTER |
| --- | --- | --- |
| 1 | suleyman | Çerçi Süleyman, 49, travelling peddler, gossipy and sly. Copy the reference image's man exactly (same face, hair, beard, cap and coat). |
| 2 | abdullah | Hoca Abdullah, 58, village imam, calm. Long oval face, long full grey-white beard, grey moustache, bushy grey brows, kind tired eyes. White cloth turban around a small dark felt cap. Torso: long dark brown wool cloak (cübbe) over a cream collarless shirt, a small leather pouch on a cord on the chest. |
| 3 | arif | Bakkal Arif, 52, grocer, cunning. Thin face, receding grey hair, small clipped grey moustache, sharp eyes, a copying pencil behind his ear. Torso: long faded grey shopkeeper's apron over a striped collarless shirt and a dark waistcoat. |
| 4 | bekir | Bekir Usta, 47, blacksmith, calm. Broad strong face, short dark beard with grey streaks, thick moustache, small burn scar on the left cheek, soot on the forehead, brown felt skullcap. Torso: thick shoulders, collarless grey shirt with rolled sleeves, scorched brown leather apron, dark red waist sash. |
| 5 | bektas | Deli Bektaş, 55, village holy fool, innocent. Gaunt face, wild long tangled grey hair and beard, wide staring eyes, missing teeth. Torso: a ragged patched brown felt cloak (aba), a goat bell hanging on a string at the neck. |
| 6 | cemil | Küçük Ağa Cemil, 28, landlord's son, hot-tempered. Handsome arrogant face, oiled black hair combed back, thin black moustache, clean-shaven. Torso: a fine long dark wool overcoat with a fur collar over a white shirt and dark waistcoat. |
| 7 | dursun | Muhtar Dursun, 50, village headman, cunning. Fleshy round face, heavy jowls, thick black moustache with curled tips, dark stubble, narrow suspicious eyes, grey flat cap (kasket). Torso: worn dark brown overcoat over a striped collarless shirt and black waistcoat, thin brass watch chain. |
| 8 | elif | Elif, 19, headman's daughter, naive. Young round face, large dark eyes, long dark braids under a light flowered headscarf loosely tied. Torso: long faded green dress (entari) and a red knitted wool cardigan. |
| 9 | emine | Emine, 34, servant, calm. Plain tired face, dark hair under a yellow headscarf (yazma) tied at the nape. Torso: long brown dress, rolled sleeves, a faded apron. |
| 10 | fadime | Fadime, 36, housewife, fearful. Thin anxious face, worried brows, dark hair under a faded blue headscarf. Torso: long dark blue dress, a string of blue glass beads at the wrist hidden by the edge (hands not shown), grey wool vest. |
| 11 | gulsum | Dul Gülsüm, 33, widowed seamstress, proud. Striking stern face, high cheekbones, black headscarf over dark hair. Torso: long black mourning dress, a tape measure around the neck, a few pins in the collar. |
| 12 | halil | Kör Halil, 40, mule driver, harsh. Hard weathered face, one eye milky-white and blind (left), thick black beard, deep scar across the brow, dark felt skullcap. Torso: heavy felt cloak (aba), a horn-handled dagger in the sash. |
| 13 | hasan | Çoban Hasan, 24, shepherd, naive. Young sunburnt face, short scruffy beard, curly dark hair under a felt cap. Torso: a thick felt shepherd's cape (kepenek) with square shoulders, a reed flute tucked in the sash. |
| 14 | hatice | Ebe Ana Hatice, 68, midwife, shrewd. Thin bony face, very deep wrinkles, sunken cheeks, sharp narrow eyes, faint blue tattoo dots on the chin, dark purple headscarf with a white under-scarf edge. Torso: long dark brown flowered dress, moss-green knitted vest, a cloth herb pouch on a cord. |
| 15 | ismail | Irgat İsmail, 38, farm labourer, fearful. Gaunt sunburnt face, sparse beard, hollow cheeks, frightened eyes, a dirty white cloth wrapped as a cap. Torso: patched brown felt cloak (aba) over a torn shirt. |
| 16 | kadir | Kâhya Kadir, 43, estate steward, harsh. Square jaw, short black beard, cold eyes, a black skullcap. Torso: dark felt cloak (aba) over a belted shirt, a braided whip coiled over the shoulder. |
| 17 | kazim | Değirmenci Kâzım, 45, miller, hot-tempered. Heavy face, red-veined nose, bushy moustache, flour dust in the eyebrows and hair, a dusty cap. Torso: long flour-dusted apron over a collarless shirt. |
| 18 | mahmut | Hacı Ağa Mahmut, 62, landlord, proud. Stern heavy face, well-groomed white beard, white moustache, heavy-lidded eyes, a white wrapped turban over a red fez. Torso: fine dark felt cloak (aba) over a striped silk vest, a silver watch chain, amber prayer beads hanging from the sash. |
| 19 | naciye | Naciye, 44, headman's wife, gossipy. Plump round face, curious narrow eyes, a purple headscarf with lace edging (oyalı yemeni). Torso: long dark red dress, a big iron chest key hanging on a cord around the neck. |
| 20 | nihat | Muallim Nihat, 26, schoolteacher, proud. Young thin face, neatly combed hair, clean-shaven, round wire-rimmed glasses. Torso: long dark grey overcoat over a white shirt and a thin dark tie, a green fountain pen in the breast pocket. |
| 21 | riza | Onbaşı Rıza, 35, gendarme corporal, harsh. Tough face, trimmed black moustache, short hair under a gendarme kepi (peaked cap). Torso: heavy gendarme greatcoat (kaput) with brass buttons, a brass whistle on a cord. |
| 22 | sultan | Kedili Nine Sultan, 74, old woman, calm. Tiny wrinkled face, toothless mouth, cloudy kind eyes, white headscarf and a grey wool shawl over the head. Torso: long dark dress, a grey wool shawl around the shoulders. |
| 23 | yusuf | Yusuf, 22, army deserter, fearful. Young hollow face, a few days of stubble, short army haircut, frightened eyes. Torso: an old army greatcoat (kaput) with a missing button, collar turned up. |
| 24 | zeliha | Hanımağa Zeliha, 55, landlord's wife, harsh. Severe proud face, thin lips, a fine black headscarf with gold trim. Torso: long dark velvet dress, gold twisted bracelets hidden (hands not shown), a ring of keys hanging from the sash. |
