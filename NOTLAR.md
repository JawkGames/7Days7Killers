# Teknik ve Tasarım Notları

## Klasör Yapısı (`www/`)
- `www/config.js`: Sürüm (`GAME_VERSION`), uygulama/tarayıcı algılama, parallax derinlik katsayıları (`DERINLIK`), günlük sorgu limiti ve renk paleti.
- `www/js/data/`: 20 sabit kasabalı (`townspeople.js`), 6 mekân ve 12 fiziksel ipucu (`locations.js`), 30 olay çekirdeği (`storyCores.js`).
- `www/js/sim/`: Tohumlu PRNG (`prng.js`), 7 günlük çizelge/cinayet/iz üretici (`generator.js`) ve otomatik çözücü (`solver.js`).
- `www/js/lang/tr.js`: Türkçe arayüz metinleri, ek uyumu ve 5 kişilik tonu (`ofkeli`, `sogukkanli`, `dedikoducu`, `korkak`, `sadik`).
- `www/js/dialogue/interrogation.js`: Soru üretimi, yalan/kaçamak kuralları ve harf-ağız zaman çizelgesi (`buildVisemeTimeline`).
- `www/js/state/notebook.js`: Defter kayıtları, çelişki eşleştirme, Rewind kalıcılığı ve `localStorage` kayıt sistemi.
- `www/js/render/`: Katmanlı sorgu sahnesi (`interrogationRenderer.js`), olay yeri fotoğraf inceleyici (`crimeSceneRenderer.js`), 3 aşamalı son sahneleri (`endingRenderer.js`) ve görsel yükleyici (`assetLoader.js`).
- `www/js/audio/sfx.js`: Gerçek CC0 ses dosyalarıyla `shuffle-bag` ses yöneticisi.
- `www/araclar/vaka-inceleyici.html`: Geliştirici tohum ve çözücü doğrulama aracı.

## Uygulanan Falso Önlemleri
1. Yürüyen bacak ve yakın el çizilmez; karakterler uzun paltoyla sorgu masasının arkasında kalır.
2. Kapıdan girişte karakter önce kapı aralığından sızan ışıkta silüet olarak belirir, sandalyeye oturdukça ampul ışığına girer.
3. Ağız açma animasyonunda çene kopuk görünmesin diye ağız köşeleri sabit tutulur, orta şerit `sin(π·u)` eğrisiyle esner.
