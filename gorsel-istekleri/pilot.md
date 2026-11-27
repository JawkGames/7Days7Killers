# Pilot: bir köylü, bir mekân

Amaç: tarzı ve iş akışını iki örnekle denemek. Sorun çıkmazsa aynı kalıpla 24 köylü ve 22 mekâna geçilir.

Her istemi Gemini'ye olduğu gibi yapıştırın. Beğendiğiniz bir Gemini resmi varsa ilk isteğe tarz örneği olarak ekleyin.

## 1. Hacı Ağa: temel portre

Dosya adı: `varliklar/gorsel/kisiler/mahmut/temel.png`

```text
Dark, moody painted portrait for a mystery game set in a village near Antep, Turkey, in 1943.
Subject: Mahmut Karaaslan, "Hacı Ağa", 62, the village landlord. Proud, heavy-set, broad square face, short grey beard, thick grey moustache, deep-set suspicious eyes, flat cloth cap, dark wool aba (cloak) over a waistcoat and collarless white shirt.
Framing: head and shoulders, front-facing, looking straight at the viewer, centered, eyes at about 40% from the top. Mouth closed, neutral. No hands visible.
Light: a single warm oil-lamp light from the upper left; the right half of the face falls into deep shadow.
Style: muddy oil-paint patches with trembling ink outlines and cross-hatching in the shadows, slightly unsettling, muted palette of mossy green, bruise purple and dirty yellow, film grain. Not cartoon, not anime, not glossy digital art.
Background: perfectly flat solid magenta #FF00FF, no shadow on the background, no gradient.
Square image, 1024x1024. No text, no frame, no watermark.
```

## 2. Hacı Ağa: ağız ve göz kareleri

Konuşma ve göz kırpma için aynı resmin küçük değişkenleri. Bunları **temel portreyi düzenleterek** isteyin (aynı sohbette, temel resmi ekleyip), sıfırdan değil; yoksa yüz değişir.

| Dosya adı | İstem |
| --- | --- |
| `varliklar/gorsel/kisiler/mahmut/agiz-yarim.png` | `Edit this image: keep everything identical, only open the mouth slightly as if saying "a". Same pose, same light, same background.` |
| `varliklar/gorsel/kisiler/mahmut/agiz-acik.png` | `Edit this image: keep everything identical, only open the mouth wide as if saying "aa". Same pose, same light, same background.` |
| `varliklar/gorsel/kisiler/mahmut/agiz-yuvarlak.png` | `Edit this image: keep everything identical, only round the lips as if saying "o". Same pose, same light, same background.` |
| `varliklar/gorsel/kisiler/mahmut/goz-kapali.png` | `Edit this image: keep everything identical, only close both eyes naturally, relaxed eyelids. Same pose, same light, same background.` |

Kareler temel resimle aynı ölçüde ve aynı konumda olmalı. Yüz kayıyorsa sorun değil, Claude hizalar; ama yüzün kendisi değişirse (başka biri gibi olursa) o kare yeniden istenir.

## 3. Su değirmeni: olay yeri fotoğrafı (boş)

Dosya adı: `varliklar/gorsel/mekanlar/degirmen.png`

```text
A 1940s black-and-white crime scene photograph, slightly faded silver gelatin print with grain, dust and fine scratches.
Interior of an old stone water mill in a village near Antep, Turkey, 1943: rough stone walls, a large millstone, a wooden hopper above it, a flour chute, flour sacks stacked against the wall, a wooden trough, wooden ceiling beams. A doorway at the back lets in strong grey daylight; the rest of the room is dim.
Camera: standing height, looking slightly down into the room, the floor clearly visible in the lower half of the image (evidence will be placed on the floor later).
The room is empty: no people, no body, no animals, no evidence, no blood.
Mood: quiet, cold, unsettling. Photographic, not illustrated.
Landscape 4:3, 1600x1200. No text, no frame, no border, no watermark.
```

Fotoğraf boş istenir; ceset örtüsü ve izler (ip, kan, ayak izi, alet) oyunda kodla, tohuma göre her seferinde farklı yerleştirilir.

## Gemini'den resim gelince

Resimleri yukarıdaki adlarla depoya koyun ya da bana gönderin. Ben şunları yapacağım ve sonucu göstereceğim:

- macenta zemini silmek, ağız ve göz karelerini hizalamak,
- Hacı Ağa'yı sorgu odasına oturtmak (göz kırpma, konuşurken ağız, alt yazı, ışık titremesi kodla sürer),
- değirmen fotoğrafına yuvaları ölçüp izleri yerleştirmek ve dokunarak bulmayı çalıştırmak.
