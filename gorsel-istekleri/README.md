# Görsel istekleri: Claude ile Gemini arasındaki köprü

İki model birbiriyle doğrudan konuşmaz; buluşma yeri bu depodur.

1. **Claude** bu klasöre bir istek dosyası yazar: ne çizilecek, ölçü, arka plan, dosya adı, tarz.
2. **Gemini** (Gemini uygulaması ya da Antigravity) isteği okur, resmi üretir.
3. Resim, istek dosyasında yazan adla `varliklar/gorsel/` altına konur ve depoya gönderilir.
4. **Claude** resmi depodan alır, ölçer (yüz nerede, ağız nerede, izler nereye konur) ve oyuna bağlar.

## Kurallar (her istekte geçerli)

- **Tarz çapası:** her isteğe `varliklar/gorsel/tarz/` içindeki tarz örnekleri de eklenir. Tarz bir kez onaylanınca bütün resimler ona benzetilir; 24 köylünün aynı elden çıkmış gibi durması buna bağlı.
- **Arka plan:** karakter ve tek nesne resimleri düz, tek renk **#FF00FF (macenta)** zemin üzerine. Gölge zemine düşmez. Claude bu rengi kodla siler; saydam PNG istenmez (üreticiler saydamlığı güvenilir vermiyor).
- **Ölçü:** istek dosyasında yazan ölçü. Kırpma, çerçeve, yazı, imza, filigran yok.
- **Dosya adı:** istek dosyasında yazan ad, aynen. Türkçe karakter ve boşluk yok.
- **Dönem:** Antep'in bir köyü, 1943. Elektrik yok, gaz lambası var. Modern hiçbir şey görünmez.
- **Falso kuralları oyunla aynı:** eller yakından görünmez, bacak ve ayak görünmez (uzun giysi ya da kadraj gizler).

## Klasörler

| Yer | İçerik |
| --- | --- |
| `gorsel-istekleri/` | İstek dosyaları. Claude yazar. |
| `varliklar/gorsel/tarz/` | Onaylanmış tarz örnekleri. |
| `varliklar/gorsel/kisiler/<kimlik>/` | Köylü resimleri (temel portre + ağız ve göz kareleri). |
| `varliklar/gorsel/mekanlar/<kimlik>.png` | Olay yeri fotoğraflarının boş hâli. |
| `varliklar/gorsel/sahneler/` | Sorgu odası, pencere, kayıp sahneleri. |

Kişi ve mekân kimlikleri `src/icerik/kisiler/` ve `src/icerik/mekanlar/` dosya adlarıyla aynıdır.

## Sıra

Önce `pilot.md`: bir köylü ve bir mekân. Tarz ve iş akışı onaylanmadan seri üretime geçilmez.
