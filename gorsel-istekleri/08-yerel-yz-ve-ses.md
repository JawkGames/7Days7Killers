# 08: Yerel yapay zekâ ve ses denemeleri (kullanıcının bilgisayarında)

Bu dosya kendi başına yeterlidir. Bu iş resim değil: kullanıcının bilgisayarında (Windows, RTX 4070, 12 GB) program kurup **dener, ölçer, kaydeder**. Claude'un ortamında ekran kartı ve hoparlör yok; bu yüzden bu iş senin.

Arka plan: oyunda köylüler yerel bir dil modeliyle (LLM) Türkçe konuşacak ve sesleri yerel bir metinden sese (TTS) modeliyle okunacak. Hangi modellerin kullanılacağına ölçüm ve kulakla dinleme ile karar vereceğiz. Araştırma: `arastirma/yerel-yapay-zeka-ve-ses.md` (okuman iyi olur ama şart değil; gereken her şey burada).

## Kurallar

- Kullanıcıya her adımda sorma; kurulumlar için bir kez izin al, sonra listedeki her şeyi sırayla yap.
- Yalnızca ücretsiz ve yerel çalışan araçlar. Hiçbir bulut API'si yok, hiçbir şey ücretli değil.
- Depoda yalnızca şunları değiştir: `denemeler/**` (yeni klasör, sonuçların buraya) ve `yazisma/gemini.md`. Oyun koduna (`src/`, `araclar/`, `testler/`) dokunma.
- Büyük dosyaları (model dosyaları, 50 MB üstü her şey) depoya koyma. Ses kayıtları `.mp3` (128 kbps) olsun.
- Teslim: `gemini-gorsel` dalı, her zamanki gibi.

## Görev 1: Dil modeli (Türkçe konuşma kalitesi ve hız)

1. **LM Studio**'yu kur (lmstudio.ai, ücretsiz).
2. Şu modelleri indir (GGUF, Q4_K_M):
   - Qwen3.5-4B
   - Qwen3.5-9B
   - Gemma 4 E4B (it)
   - Varsa Turkish-Gemma-9b-T1 (ytu-ce-cosmos), yalnızca kıyas için.
3. Qwen3.5 modellerinde "thinking" (düşünme) kipini kapat (LM Studio'da model ayarlarında ya da sistem isteminde `/no_think`). Kapatmanın nasıl yapıldığını not et.
4. LM Studio'nun Developer sekmesinden sunucuyu başlat (adres `http://localhost:1234`).
5. Depoda Node.js ile şu komutu her model için çalıştır (modeli LM Studio'da yükleyip):

   ```
   npm install
   node araclar/yz-dene.js --adres http://localhost:1234 --tohum 77 --n 20
   ```

   Çıktıyı `denemeler/llm/<model-adi>.txt` olarak kaydet.
6. Her model için ölç ve not et: ilk sözün süresi, ortalama söz süresi, "Denetim: geçti" oranı (kaç sözden kaçı), ekran kartı belleği kullanımı (Görev Yöneticisi > Performans > GPU).
7. Her modelden 5 cevabı sen Türkçe açısından değerlendir: doğal mı, 1943 köylüsü gibi mi, dil hatası var mı.

Sonuç tablosu: `denemeler/llm/SONUC.md` (model, boyut, bellek, hız, geçme oranı, Türkçe notu, öneri).

## Görev 2: Türkçe ses (TTS)

Aşağıdaki modelleri kur ve **aynı 6 cümleyi** her birine okut:

1. "Müfettiş bey, ben çerçiyim; köy köy gezerim, kimseye karışmam."
2. "Dün gece mi? Eşeğimle hanın orada yatıyordum, vallahi."
3. "Herkesin bir sırrı var beyim. Benimki ucuz değildir ama."
4. "Ağa'nın konağına o gece kimse girmedi, ben görmedim."
5. "Çocuklarım aç, ben ne bileyim kim öldürdü?"
6. "Siz Samsun'dan gelmişsiniz, bizim buraların adetlerini bilmezsiniz."

Modeller (sırayla; biri kurulmuyorsa nedenini yaz ve geç):
- **Supertonic 3**: 10 hazır sesin hepsini dene (sherpa-onnx ya da kendi örnek kodu).
- **MOSS-TTS-Nano**: varsayılan ses; işlemcide (CPU) çalıştır.
- **VoxCPM2**: sesi yazıyla tarif et, en az 4 farklı ses üret: "yaşlı Anadolu köylüsü erkek, kalın, boğuk", "genç köylü kadın, çekingen", "yaşlı kadın, kısık, titrek", "orta yaşlı otoriter erkek".
- **Kokoro** ya da başka ücretsiz, ticari kullanıma açık ve Türkçe destekleyen bir model biliyorsan onu da ekle (lisansını yaz).

Kullanılmayacaklar (lisans engeli; deneme): Piper'ın Türkçe sesleri, Coqui XTTS v2, F5-TTS, Meta MMS-TTS, OmniVoice.

Her kayıt: `denemeler/ses/<model>/<ses-adi>-<cumle-no>.mp3`.

Ölç ve not et: 1 cümlenin üretim süresi (CPU ve varsa GPU'da ayrı), bellek, lisans. Türkçe telaffuz notu: "ş, ğ, ı, ü" doğru mu, vurgu doğal mı, robotik mi.

Sonuç tablosu: `denemeler/ses/SONUC.md`. Kullanıcı kayıtları dinleyip seçecek; tabloya her model için en iyi 2 kaydın yolunu yaz.

## Görev 3: Oyunu oyna ve hata bildir

1. Depoda `npm install` ve `npm run dev`, tarayıcıda açılan adrese git.
2. Ayarlar > Yapay zekâ bölümünde yerel sunucuyu seç (adres `http://localhost:1234`), Görev 1'de en iyi bulduğun modeli yükle.
3. Bir oyunu baştan sona oyna (7 gün ya da hüküm). Ekran görüntüsü al.
4. Gördüğün her sorunu yaz: çöken yer, anlamsız ya da tutarsız cevap, yavaşlık, görsel bozukluk, Türkçe hatası. `denemeler/oyun/HATALAR.md` (sıra, ne yaptın, ne oldu, ne bekliyordun, ekran görüntüsü yolu).

## Bitince

`yazisma/gemini.md`'ye kısa bir özet yaz: hangi görev bitti, en iyi dil modeli, en iyi 3 ses, en önemli 5 hata. Kalan iş varsa nerede kaldığını yaz.
