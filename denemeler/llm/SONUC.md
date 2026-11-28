# Görev 1 — Yerel Dil Modeli (LLM) Deneme Sonuçları

**Ortam:** Windows 11, NVIDIA GeForce RTX 4070 (12 GB VRAM), LM Studio `0.4.29`, sunucu `http://localhost:1234`, `tohum=77`, `n=20` (1. gün sorgu akışında toplam 18 söz üretildi).

## Düşünme (Thinking) Kipi Nasıl Kapatıldı? (KRİTİK BULGU)

- `src/yz/arka-uc.js` (satır 46) şu anda LM Studio'ya `chat_template_kwargs: { enable_thinking: false }` gönderiyor.
- **LM Studio `0.4.29` bu parametreyi sessizce yok sayıyor.** Ayrıca `/no_think` (system/user), `enable_thinking: false`, `reasoning: "off"`, `reasoning: { effort: "none" }` denemelerinin hepsi başarısız oldu; `Qwen3.5-4B`, `Qwen3.5-9B` ve `Gemma 4 E4B` tüm `max_tokens: 220` bütçesini `reasoning_content` alanında harcayıp boş `content: ""` döndürdü (`0/16 geçti — denetim: cevap yok`).
- **Çalışan yöntem:** İstek gövdesine **`reasoning_effort: "none"`** (üst düzey OpenAI uyumlu alan) eklemek. Bu parametre eklendiğinde `reasoning_content` tamamen kapanıyor ve yanıtlar 0.44–0.61 sn içinde doğrudan `content` alanına geliyor.
- **Not:** `araclar/yz-dene.js` Windows'ta `new URL('..', import.meta.url).pathname` hatası (`/C:/...`) verdiği ve oyun koduna dokunulmaması gerektiği için ölçümler aynı motoru kullanan, yalnızca Windows yolu + `reasoning_effort: "none"` ekleyen geçici bir sarmalayıcı ile alınmıştır.

## Karşılaştırma Tablosu

| Model (GGUF, Q4_K_M) | Disk Boyutu | VRAM (RTX 4070) | İlk Söz | Ortalama Söz | Denetim Geçme Oranı | Türkçe Notu (10 üzerinden) | Ham Çıktı |
|---|---:|---:|---:|---:|---:|---:|---|
| **Gemma 4 E4B (it)** (`google/gemma-4-e4b`) | 6.33 GB | 6098 MiB (~6.0 GB) | 0.93 sn | 0.56 sn | **18 / 18 (%100)** | **9 / 10** | `denemeler/llm/gemma-4-e4b.txt` |
| **Qwen3.5-9B** (`qwen/qwen3.5-9b`) | 6.55 GB | 8271 MiB (~8.1 GB) | 0.72 sn | 0.61 sn | 17 / 18 (%94.4)* | **8.5 / 10** | `denemeler/llm/qwen3.5-9b.txt` |
| **Qwen3.5-4B** (`qwen/qwen3.5-4b`) | 3.38 GB | 5720 MiB (~5.6 GB) | **0.59 sn** | **0.44 sn** | **18 / 18 (%100)** | **6.5 / 10** | `denemeler/llm/qwen3.5-4b.txt` |
| *Turkish-Gemma-9b-T1* (`ytu-ce-cosmos`, Q4_K_S) | 5.48 GB | — | — | — | — | Test edilemedi** | — |

\* *Qwen3.5-9B'deki 1 başarısız söz gerçek bir zaman aşımı değildir (`0.48 sn` sürdü): model `"Dün gece"` zaman ifadesini düşürdüğü için denetim reddetti; `araclar/yz-dene.js:67` satırındaki `/zaman/` regex'i bunu yanlışlıkla `zaman aşımı` saydı (`denemeler/oyun/HATALAR.md` #3).*  
\*\* *`Turkish-Gemma-9b-T1.Q4_K_S.gguf` indirildi (5.48 GB), ancak LM Studio `0.4.29` CLI (`lms import`) bu dosyayı çevrimdışı dizine alırken takıldığı için kıyas çalıştırılamadı.*

## 5'er Cevap Türkçe Değerlendirmesi

### 1. Gemma 4 E4B (it) — ÖNERİLEN BİRİNCİ SEÇENEK
1. **İsmail'in Emine (yalan):** `"Ş-şey... evdeydim beyim. Allah şahidimdir."` — Yalan söylerken kekeleme (`Ş-şey...`) eklemiş; 1943 Anadolu köyü tonuna çok doğal oturuyor, dil hatası yok.
2. **İsmail'in Emine (bilmez):** `"Beyim, dün gece Irgat İsmail'in nerede olduğunu bilmiyorum."` — Doğal, akıcı, anlam korunmuş.
3. **Değirmenci (öfkeli/doğru):** `"Neden beni çağırdınız, beyim? Benim işim gücüm var!"` — Karakter tavrına tam uyumlu, tırnak/biçim hatası yok.
4. **Bekir Usta (tanıklık):** `"Dün gece bakkalda uzun entari giymiş birisi gördüm beyim. Yüzünü seçemedim."` — Kalıbı bozmadan doğal köylü anlatımına çevirmiş.
5. **Hoca (doğru):** `"Dün gece evdeydim beyim. Yatsıyı kıldım, yattım."` — Sade, doğru, hatasız.
- **Küçük kusur:** Serbest soruda kaçamak yanıtı tek kelimelik `"Rahatsın."` oldu (istemde kaçamak tonu biraz daha belirginleştirilebilir).

### 2. Qwen3.5-9B — GÜÇLÜ İKİNCİ SEÇENEK
1. **İsmail'in Emine (kaçamak):** `"Beyim, ben böyle şeyleri düşünmem."` — Üç model içinde en iyi kaçamak cevabı.
2. **İsmail'in Emine (yalan):** `"Beyim... Evdeydim. Allah şahidimdir."` — Doğal, duraksamalı.
3. **İsmail'in Emine (yalan #2):** `"Allah bilir beyim kul bilmez"` — Anlam doğru ama noktalama düşmüş.
4. **Hoca (doğru):** `"Müfettiş bey, dün gece evdeydim. Yatsıyı kıldım, yattım."` — 1943 hitabına çok yakışıyor.
5. **Değirmenci (doğru):** `'"Evet evimdeydim, beyim! Her gece olduğu gibi... Ne bu sorgu?"'` — Doğal ama dışa gereksiz çift tırnak koymuş.
- **Not:** 8.27 GB VRAM kullanıyor; 8 GB ekran kartlı oyuncularda sınırda kalır.

### 3. Qwen3.5-4B — EN HIZLI / DÜŞÜK DONANIM SEÇENEĞİ
1. **İsmail'in Emine (yalan):** `"Evdeydim beyim... Allah şahidimdir."` — İyi.
2. **İsmail'in Emine (bilmez):** `"Bilmediğim Irgat İsmail'in nerede olduğu var mı, beyim? Gerçeği söylemek istiyorum."` — **Bozuk Türkçe**, anlam kayması ve yapay ifade.
3. **Bekir Usta (doğru):** `"Bir şey göremiyorum beyim... Ama size başka bir şey söyleyeyim, Değirmenci Bakkal Arif'e borçluydu."` — Geçmiş zaman (`görmedim`) şimdiki zamana (`göremiyorum`) kaymış; `"bunu bilen bilir"` kısmı düşmüş.
4. **Değirmenci (doğru):** `"Dün gece neredeydim? Evimdeydim! Her gece olduğu gibi! Ne bu sorgu?"` — Güzel, canlı.
5. **Açılış selamları:** `'"Selamünaleyküm, beyim. Buyurun, sorun."'` — Dışa gereksiz tırnak işareti koyma eğilimi var; kaçamak yanıtı `"Rahatsın."` oldu.

## Öneri

- **Varsayılan Steam modeli:** **`Gemma 4 E4B (it)` (Q4_K_M)**. 6.0 GB VRAM ile 8 GB ekran kartlarına rahat sığar, %100 denetim geçme oranı, `0.56 sn` ortalama hız ve en tutarlı, dil hatasız 1943 köylü Türkçesini verdi.
- **Yüksek donanım / alternatif:** **`Qwen3.5-9B` (Q4_K_M)** — kaçamak yanıtları çok iyi ama 8.1 GB VRAM istiyor.
- **Düşük donanım:** **`Qwen3.5-4B`** yalnızca 4–6 GB VRAM sınırı varsa düşünülmeli; Türkçe dilbilgisi zaman zaman bozuluyor.
- **Kod tarafında şart:** `src/yz/arka-uc.js` içine LM Studio için `reasoning_effort: "none"` eklenmeli.
