# Kukla parça sayfası istemi (bütün karakterler için)

Üstteki STYLE ve SHEET bölümleri her karakterde AYNEN kullanılır, değiştirilmez. Sadece en alttaki CHARACTER bölümü değişir.

```
STYLE (fixed, follow exactly, do not improvise):
Hand-drawn 2D illustration in a dark 1940s Anatolian folk-horror style. Semi-realistic adult proportions, NOT cartoon, NOT anime, NOT chibi, NOT painterly, NOT 3D, NOT photographic.
Line art: thick, slightly shaky black ink outline (about 6-8 px at 1024 px image height) around every shape, like a dip pen on rough paper; inner lines thinner (2-3 px). Lines are imperfect, slightly broken and dry-brushed in places, like an old worn ink print. No clean vector lines.
Shading: hard-edged cel shading in exactly two tones per color (base + one shadow), plus black cross-hatching (fine diagonal ink strokes) inside the darkest shadows: under the chin, under the cap brim, in eye sockets, in clothing folds. No soft airbrush gradients, no glow, no rim light.
Light: one small dim warm light from the upper left. The right side of the face is in shadow.
Palette: muted, dirty, desaturated: moldy green #2B352C, bruise purple #35273B, dirty yellow #D4B062, earth browns, faded wool colors. Skin is a warm sunburnt olive tone with a shadow tone of the same hue. No saturated colors, no pure white (lightest tone is off-white #E8DFC8).
Aging: a light worn-paper texture over every part: faint grain, tiny specks and scratches, a few small torn or chipped spots on the ink lines, as if the drawing was printed on old cheap paper. Subtle, it must not hide the face.
Face: realistic adult features, natural nose and lips, tired serious expression, mouth closed and neutral, eyebrows thick ink strokes.

SHEET (fixed layout, do not change):
One single image, pure flat black background #000000, no shadow on the background, no text, no labels, no frame, no watermark. All parts separated by wide black gaps, nothing touches or overlaps, everything at the same scale and same lighting.
Top row, left to right:
1. Head, front view, eyes open: the EYE WHITES ARE EMPTY (plain off-white almond shapes with NO iris and NO pupil). Head ends EXACTLY at the bottom edge of the chin and jaw line: NO neck, NO throat, NO skin below the jaw at all (the neck belongs only to the torso part).
2. The same head, front view, eyes CLOSED (lids drawn as curved ink lines with lashes). Identical size and position to part 1.
Middle row:
3. Two separate round irises (dark brown, with a black pupil and a tiny highlight), drawn alone, about the size of the eye whites.
4. Three mouths alone, cut from the SAME face at the same size and position as on the head: each mouth piece shows EVERYTHING that is around the mouth on the head exactly the same (moustache, beard, stubble, chin tattoo, wrinkles, nose tip), only the lips change: closed, half-open (teeth slightly visible), wide open (dark inside, tongue visible). A moustache or beard must NEVER be missing from the mouth pieces.
Bottom row:
5. Torso from the waist up WITH the neck attached at the top, NO head, the neck top cut flat; arms hanging down relaxed, hands not visible (cut at the bottom edge). Front view, the same width as the head would need.
Skin color must be identical on the head, mouths and neck.

CHARACTER:
(karaktere özel kısım buraya)
```

## Karakterler

### Bekir Usta (Bekir Çelik, 47, demirci, sakin)
```
CHARACTER:
Bekir Usta, 47-year-old village blacksmith from a 1943 village near Gaziantep, calm and quiet. Broad strong face, short dark beard with grey streaks, thick moustache, deep wrinkles at the eyes, a small burn scar on the left cheek, soot smudges on the forehead. Wears a dark brown felt skullcap (keçe külah). Torso: thick muscular shoulders and neck, collarless faded grey cotton shirt (mintan) with sleeves rolled, a heavy scorched brown leather blacksmith apron over it, a dark red woolen waist sash (kuşak).
```

## Canva'dan tam boy alma (Claude için)

1. `generate-image` → media id (ör. MAHc...).
2. Dışa aktarma tasarımı: `DAHcJeTrVeg`, sayfa 2 (1264x1264). `read-design` ile `open_transaction`, sonra `edit-design` `insert_fill` (top 0, left 0, 1264x1264, yeni media id), sonra `commit`.
3. `export-design` png, `pages:[2]`, 2048x2048.
4. `bash araclar/canva-indir.sh "<bağlantı>" varliklar/gorsel/ham/kukla/<ad>-sayfa.png` (izin kuralı `.claude/settings.json`'da).
