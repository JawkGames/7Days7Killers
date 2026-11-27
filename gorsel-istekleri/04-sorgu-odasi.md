# 04: Sorgu odası

Oyunun ana sahnesi. Köylü kapıdan girer, masanın karşısındaki sandalyeye oturur, müfettişle konuşur. Kamera imleçle sağa sola kayar ve katmanlar farklı hızda oynar (derinlik). Bu yüzden oda katmanlar hâlinde istenir.

main2'deki oda modern bir beton odaydı (borular, büyük pencere, elektrik ampulü); reddedildi. Masa, sandalye ve kapı geçici olarak kullanılıyor ama 1943 köyüne uygun yenisi istenir.

**Karar bekleyen:** ışık kaynağı çıplak elektrik ampulü mü, gaz lambası mı? 1943 köyünde elektrik yok. Kullanıcı karar verene kadar bu dosyadaki kalemler `beklemede`.

## Yer

Jandarma karakolunun arka odası, köyde: kalın moloz taş duvarlar, kirli badana, nem ve akıntı izleri, ahşap kirişli alçak tavan, toprak ya da taş zemin, arka duvarda ahşap kapı, küçük demir parmaklıklı pencere (gece, dışarısı karanlık).

## Katmanlar

| Dosya | Ölçü | İçerik |
| --- | --- | --- |
| `varliklar/gorsel/oda/arka.webp` | 2400x1350 (kenarlarda kamera payı) | Arka duvar, tavan, zemin, kapı boşluğu karanlık, pencere. Ortada boş alan (köylü oraya oturacak). |
| `varliklar/gorsel/oda/kapi.png` | 400x1000 | Kapı kanadı, ayrı, saydam; kod açıp kapatır. |
| `varliklar/gorsel/oda/lamba.png` | 300x700 | Tavandan sarkan ışık (ampul ya da asılı gaz lambası), saydam. |
| `varliklar/gorsel/oda/sandalye.png` | 700x900 | Köylünün oturduğu tahta sandalye, önden, saydam. |
| `varliklar/gorsel/oda/masa.png` | 2400x600 | Ön planda masanın üst kenarı ve yüzü: açık defter, dosya, ters çevrilmiş fotoğraflar, teneke kül tablası. Saydam. |

## İstem kalıbı (arka katman için)

```text
Background layer for a dark detective game set in a village near Gaziantep, Turkey, in 1943. Match the attached style reference exactly.
The back room of a village gendarmerie post used for interrogations, at night: thick rubble-stone walls with dirty whitewash, damp stains and drips, a low ceiling with wooden beams, a beaten-earth floor, a wooden door in the back wall (doorway dark), a small barred window (dark night outside).
The center of the image is open wall (a seated person will be composited there). Single light source from <IŞIK> hanging at the upper left; strong falloff, corners very dark.
Wide 2400x1350, no people, no text, no frame.
```

`<IŞIK>`: `a bare electric bulb` ya da `a hanging oil lamp`, kullanıcının kararına göre.
