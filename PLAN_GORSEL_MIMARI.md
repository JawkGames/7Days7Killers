# 7 Days 7 Killers — Görsel Üretim ve Teknik Mimari Planı

Bu sürüm, orijinal repoya hiç dokunulmadan ve orijinal prototipteki kod çizimlerine bakılmadan, `PLAN.md` ve `NOTLAR.md` kararlarına sadık kalınarak **yapay zekâ görsel üretimi + katmanlı/parçalı atlas mimarisi** ile sıfırdan kurulmuştur.

## 1. Görsel Üretim Stratejisi: Neden "Katmanlı Sahne + Çoklu Sprite Atlas"?

- **Stil Kilidi (Style Lock):** Tüm görsellerde aynı karanlık psikolojik dedektif/noir dili kullanılır (*No, I'm not a Human* yönünde tekinsiz ama abartısız yarı-gerçekçi oranlar, kalın siyah mürekkep dış kontur, tarama gölgeler, küflü yeşil `#2B352C`, morluk moru `#35273B` ve tek kaynaklı kirli sarı ampul ışığı `#D4B062`).
- **Tek Seferde Çoklu Üretim + Parçalı Kullanım:**
  1. **Sorgu Odası (Katmanlı Parallax):** Arka duvar (`room_bg`), kapı kanadı (`door`), sallanan çıplak ampul (`bulb`), sandalye (`chair`) ve ön plan sorgu masası (`desk`) ayrı katmanlar olarak üretilir. Kamera imleç/dokunuşla kaydığında her katman farklı hızda (`DERINLIK`) hareket eder.
  2. **20 Sabit Kasabalı (5 Adet 2x2 Atlas = 20 Benzersiz Karakter):** Tek tek 20 çağrı yapmak yerine her birinde 4 kasabalının yer aldığı 5 adet `2x2` beyaz zeminli (`#FFFFFF`) karakter atlası üretilir. Dıştan flood-fill + 3 geçişli defringe (`clean_sprite.ps1`) ile sıfır beyaz hare bırakacak şekilde ayrıştırılır.
  3. **Falso Kurallarına Uyum (`NOTLAR.md`):**
     - Yürüyen bacak ve yakın el çizilmez; karakterler uzun palto/kıyafetle bel hizasından sorgu masasının arkasında kalır.
     - Kapıdan girişte figür önce kapı ışığında karanlık silüet olarak belirir, yürüyüp sandalyeye oturunca aydınlanır.
     - Kötü duran "kesik alt çene kaydırma" veya "fotoğraf üstü vektör göz kapağı" yerine; **ağız köşeleri sabitlenmiş esnek şerit deformasyonu (pinned-corner lip warp)** + karanlık ağız içi gölgesi, karakterin kendi ten/gölge tonundan örneklenen yumuşak göz kırpma, hafif bakış takibi ve nefes salınımı kullanılır. Ayrıca konuşma ifadeleri için ekstra yüz/ağız varyasyon parçaları desteklenir.
  4. **Olay Yeri Fotoğrafları (6 Mekân Şablonu + 12 Modüler İpucu Parçası):**
     - Mekânlar (`Değirmen`, `Demirci`, `Şapel`, `Eczane`, `Han`, `Kayıkhane`) üzerinde sahte iz olmayan ham flaş-fotoğraf şablonları olarak üretilir.
     - 12 fiziksel iz (`kırmızı kazak ipi`, `çamurlu çizme izi`, `demirci çekici`, `durmuş cep saati`, `zehir şişesi`, `boş duvar çivisi`, `pirinç anahtar`, `yırtık mektup`, `kopmuş tespih`, `tütün izmariti`, `kanlı sargı`, `demir makas`) tek bir `4x3` atlastan şeffaf PNG olarak kesilir ve **yalnızca simülasyondaki gerçek olaya bağlıysa** fotoğraftaki koordinatına yerleştirilir.
  5. **Arayüz ve Son Sahneler:**
     - İlkel kod dikdörtgenleri yerine özel üretilmiş metal/mühürlü boş buton görselleri, deri dedektif defteri ve Polaroid çerçevesi kullanılır.
     - Final Verdict sonrası için kişiye özel **Kayıp Sahneleri** (yas tutan aile, boş gece bankı, barakada bekleyen kediler, ıssız atölye + katilse gizli kanıt) ve **Pencere / Kalabalık Sahnesi** (meşaleli/tırpanlı öfkeli kalabalık ile sakin fenerli kalabalık katmanları) üretilir.

## 2. Alt Ajan İş Bölümü

- **Görsel Ajanları (`image-generator` x 9 paralel görev):**
  1. Sorgu odası arka duvar + ön plan masa/sandalye/ampul/kapı katmanları
  2. Kasabalı Atlas 1–5 (`5 x 2x2` = 20 kasabalı)
  3. 6 Olay yeri mekân fotoğraf şablonu
  4. 12 fiziksel ipucu atlası (`4x3`) + UI buton/defter/Polaroid atlası
  5. Kayıp sahneleri ve pencere/kalabalık son sahneleri (`2x2` x 2)
- **Kod Ajanı 1 (`Simülasyon & Çözücü Motoru`):** Tohumlu PRNG, 20 kişi verisi, 6 mekân, 30 olay çekirdeği, 7 günlük çizelge, 7 katil/ortaklık/şantaj üretimi, yanıltıcı izler, Rewind koruma etkisi ve en az 2 bağımsız kanıt zinciri arayan otomatik çözücü (`solver.js`).
- **Kod Ajanı 2 (`Diyalog, Türkçe Ek Uyumu, Defter & Vaka İnceleyici`):** Türkçe dil/kalıp sistemi, kişilik tonlu sorgu cevapları, çelişki yakalama, Rewind kalıcı defter sistemi ve geliştirici `vaka-inceleyici.html` aracı.
- **Ana Ajan (Koordinatör):** Görsel dilimleme ve `clean_sprite.ps1` sıfır beyaz hare temizliği, katmanlı Canvas sahne/animasyon motoru, gerçek CC0 ses efektleri (shuffle-bag), mobil/tam ekran uyumu (`www/`) ve tüm modüllerin entegrasyonu.
