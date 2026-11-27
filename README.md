# 7 Days 7 Killers — Proje Notları (Görsel Üretimli Sürüm)

- **Paket Adı:** `com.jawk.sevendayssevenkillers` (taslak)
- **Sürüm:** `v0.1.2` (`www/config.js`)
- **Önemli Not:** Değişiklikler görsel kontrol yapılmadan yapılıyor, hataları kullanıcı bildiriyor. Üretilen ve kullanılan tüm karakter/parça görselleri ortalanmış, sağa bakan, dik duran çizimlerdir.

## Oyun Kuralları ve Döngü Özeti
- **Zaman Döngüsü Dedektiflik:** 7 gün, 7 katil. Sabit 20 kasabalı; her yeni tohumda (`seed`) roller, işbirlikleri, şantajlar, çizelgeler ve cinayetler simülasyondan üretilir.
- **Çözülebilirlik Garantisi:** `www/js/sim/solver.js` her üretilen kasabayı otomatik çözer; her katile en az 2 bağımsız kanıt zinciri gitmesini ve her yanıltıcı izin (`red herring`) en az bir yolla çürütülebilmesini zorunlu tutar.
- **Günlük Akış (Gün 1–7):**
  1. Masaya o güne kadarki cinayetlerin olay yeri fotoğrafları (Polaroid) gelir.
  2. Fotoğraftaki fiziksel izlere dokunularak deftere kaydedilir (süs iz yoktur; her iz simülasyondaki gerçek ya da çürütülebilir yanıltıcı olaya bağlıdır).
  3. Günde **4 kişi** sorguya çağrılabilir. Çağrılan kişi kapıdan silüet olarak girer, masanın arkasındaki sandalyeye oturur.
  4. Sorular defterdeki ipuçları ve ifadelerden doğar; iki çelişkili ifade defterde eşleştirildiğinde **Yüzleştirme** sorusu açılır.
- **7. Gün Kararı:**
  - **ZAMANI GERİ SAR (REWIND TIME):** Aynı tohumla 1. güne döner, defterdeki tüm kayıtlar korunur ve geceleri potansiyel bir kurbanı **Koruma** hakkı açılır (korunan kurban kurtulur, katil başka hedefe yönelir).
  - **SON HÜKÜM (FINAL VERDICT):** Oyuncu 7 katil adayını seçer (öncesinde kaç doğru olduğu hiç söylenmez). Ardından 7 kişisel **Kayıp Sahnesi**, **Pencere / Kalabalık Sahnesi** ve **Gerçeğin Açıklanması** oynar.

## Görsel ve Ses Yapısı
- Tüm görseller AI görsel üretim modeliyle üretilmiş, `jawk-game-art` (`clean_sprite.ps1`) ile dıştan flood-fill + 3 geçişli defringe uygulanarak sıfır beyaz hare kalacak şekilde ayrıştırılmıştır.
- Konuşmada ses yoktur (harf harf alt yazı + köşeleri sabitlenmiş dudak esnetme animasyonu). Ortam/etkileşim sesleri gerçek CC0 ses dosyalarından karışık torba (`shuffle-bag`) sırasıyla çalınır.
- Sağ üst köşedeki tam ekran butonu yalnızca web/tarayıcıda görünür; Android/Capacitor uygulamasında otomatik gizlenir.
