# Yerel yapay zekâ ve ses: hazırlık araştırması

*7 Days 7 Killers · araştırma tarihi: 27 Kasım 2026*

## Kısa sonuç

1. **Dil modeli (asgari kart, 6 GB):** **Qwen3.5-4B**. Lisansı Apache 2.0 olduğu için oyunla birlikte satılabilir. 4-bit dosyası yaklaşık 2,7 GB tutar, bu da ses modeline yer bırakır. Aynı boyuttaki en güçlü rakibi **Gemma 4 E4B** de artık Apache 2.0, ama dosyası yaklaşık 5,3 GB olduğu için 6 GB'lık kartta sese yer bırakmıyor.
2. **Dil modeli (güçlü kart, 8-12 GB):** **Gemma 4 E4B** ya da **Qwen3.5-9B** (yaklaşık 5,6 GB). Hangisinin Türkçede daha iyi olduğunu geliştiricinin 4070'inde aynı sorgu sahneleriyle denemek gerekiyor. Tek kaynak ve dolaylı bir kanıt, küçük boyutta Gemma 4'ün Türkçe bilgi testinde öne geçtiğini gösteriyor.
3. **Çalıştırma motoru:** **llama.cpp**'nin JavaScript sarmalayıcısı **node-llama-cpp** (MIT). Electron'un ana sürecinde çalışır, çıktıyı JSON şemasına zorlayabilir, NVIDIA'da hem CUDA hem Vulkan kullanabilir. Dağıtım için **Vulkan** daha güvenli, çünkü oyuncunun ayrıca bir şey kurmasını istemiyor.
4. **Ses (asgari kart):** Ses modelini **ekran kartından alıp işlemciye (CPU) koymak**. İki aday var: **Supertonic 3** (31 dil arasında Türkçe, 10 hazır ses, ONNX, sherpa-onnx ile doğrudan Node/Electron'dan kullanılabiliyor, lisansı OpenRAIL-M) ve **MOSS-TTS-Nano** (100 milyon parametre, Apache 2.0, Türkçe, işlemcide çalışıyor, ses klonlayabiliyor).
5. **Ses (güçlü kart):** Geliştirme sırasında **VoxCPM2** (Apache 2.0, Türkçe, 2 milyar parametre) ile 24 köylünün sesini **yazıyla tarif ederek** üretmek, yani gerçek bir insana ait olmayan sesler. Oyunda bu sesleri hafif bir klonlama modeliyle konuşturmak. VoxCPM2'nin kendisi yaklaşık 8 GB ekran belleği istediği için oyun sırasında dil modelinin yanında çalıştırılmamalı.
6. **24 farklı ses:** Az sayıda temel ses ve her karaktere özel perde/tını ayarı (**formant korumalı** kaydırma, MIT lisanslı Signalsmith Stretch ile). Klonlama yapılırsa referans sesler ya yapay olarak tasarlanmalı ya da izin alınmış kendi kayıtlarımız olmalı.
7. **Kullanılmaması gerekenler:** Piper'ın Türkçe sesleri, Coqui XTTS v2, F5-TTS, Meta MMS-TTS, OmniVoice ve Aya. Hepsinin lisansı ya ticari kullanımı yasaklıyor ya da belirsiz (ayrıntılar aşağıda).
8. **Steam:** Mağaza sayfasında "oyun içinde anlık üretilen yapay zekâ içeriği" beyanı ve "yasa dışı içerik üretmesini engelleyen önlemler"in açıklaması gerekiyor. Bizim tasarımımız (gerçeği motor seçiyor, model yalnızca cümle kuruyor, çıktı şemayla ve sözcük süzgeciyle sınırlanıyor) bu açıklama için iyi bir dayanak.
9. **En büyük bilinmeyen:** Türkçe ses kalitesini hiçbirinde kulakla dinleyip doğrulayamadım. Tüm ses önerileri ilk denemede dinlenerek elenmeli.

> **Bu araştırma nasıl yapıldı:** Bu ortamdan Hugging Face, Steam ve üretici sitelerine doğrudan erişilemedi. GitHub depolarının README ve LICENSE dosyalarını doğrudan (raw.githubusercontent.com üzerinden), npm kayıtlarını da doğrudan okudum. Hugging Face model kartlarını ve Steam belgelerini ise arama motoru özetleri üzerinden gördüm. Bağlantılar birincil kaynağı gösteriyor, ama bunlardan doğrudan açamadıklarım "doğrulanmalı" diye işaretli. Hız ve bellek rakamlarının çoğu **tahmin**.

---

## Sözlük (ilk okumada göz atın)

- **Dil modeli (LLM):** Metin okuyup metin yazan yapay zekâ. Bizde karakterin ağzından cümle kurar.
- **Parametre:** Modelin içindeki ayar sayısı. "4B" 4 milyar demek. Büyüdükçe model akıllanır ama daha çok bellek ister.
- **VRAM:** Ekran kartının kendi belleği. Model buraya sığarsa hızlı çalışır.
- **Niceleme (quantization), Q4_K_M:** Modeli sıkıştırıp sayıları 4 bitle saklamak. Dosya yaklaşık dörtte birine iner, kalite biraz düşer. Q4_K_M en yaygın denge ayarı.
- **GGUF:** llama.cpp'nin kullandığı tek dosyalık model biçimi.
- **Token:** Modelin yazdığı en küçük parça; kabaca yarım ya da bir Türkçe kelime. Hız "saniyede token" ile ölçülür.
- **Bağlam (context) ve KV önbelleği:** Modelin o anda aklında tuttuğu konuşma geçmişi. Uzadıkça ekstra VRAM yer.
- **TTS (metinden sese):** Yazıyı konuşmaya çeviren model.
- **Ses klonlama:** Birkaç saniyelik bir örnek kayıttan o sesi taklit etmek.
- **Ses tasarımı (voice design):** Kayıt vermeden, "yaşlı, kalın sesli, yorgun bir köylü" gibi bir tarifle yeni bir ses üretmek.
- **RTF (gerçek zaman oranı):** 1 saniyelik sesi üretmek için geçen süre. 0,5, sesi konuşma süresinin yarısında ürettiği, yani gerçek zamandan hızlı olduğu anlamına gelir.
- **Fonem:** Dilin ses birimi; "k", "a" gibi. Dudak senkronu için kullanılır.
- **Formant:** Sesin "tını"sını, yani ağız ve gırtlak şeklinden gelen rengini belirleyen frekans bölgeleri. Perdeyi değiştirip formantı korumazsanız ses "sincap sesi"ne döner.
- **ONNX:** Modelleri farklı programlarda çalıştırmaya yarayan ortak bir biçim. ONNX Runtime ile Python olmadan da çalışır.
- **Model ağırlıkları ve kod:** Bir yapay zekâ projesinin iki ayrı parçası var: programın kendisi (kod) ve eğitilmiş "beyin" (ağırlıklar). **Lisansları sıklıkla farklıdır.** Kod MIT olup ağırlıklar ticari kullanıma kapalı olabilir.
- **Apache 2.0 / MIT:** Ticari satışa ve dağıtıma izin veren serbest lisanslar. Lisans metnini ve telif notunu oyunla birlikte vermek yeterli.
- **CC BY-NC:** "NC" (non-commercial) ticari kullanımı yasaklar. Steam'de satılan bir oyun için uygun değil.
- **GPL:** Kodu serbest olan ama onu kullanan programın kaynak kodunun da açılmasını isteyebilen bir lisans. Ticari satışa izin verir, ama kapalı kaynaklı bir oyuna gömmek hukuki risk taşır.

---

## A) Yerel dil modeli (LLM)

### A1-A2. Adaylar tablosu

Boyutlar 4-bit (Q4_K_M) GGUF dosyasınındır. VRAM tahmini, dosya boyutuna yaklaşık 4 bin tokenlık bağlam ve çalışma payı olarak 0,6-1 GB eklenerek hesaplandı (**tahmin**). Hız sütununda iki rakam var: ilki RTX 2060, ikincisi RTX 4070 için, ikisi de **tahmin** (gerekçesi tablonun altında).

| Model | Lisans | Steam'de satış ve oyunla dağıtım | Türkçe resmî mi? | Q4_K_M dosyası | VRAM (tahmin) | Hız 2060 / 4070 (tahmin) |
|---|---|---|---|---|---|---|
| **Qwen3.5-4B** (Mart 2026) | Apache 2.0 | **Evet** | 201 dil ve lehçe ilan ediliyor; Qwen3'te Türkçe adıyla listeliydi | ~2,7-3,0 GB | ~3,5-4 GB | ~60-80 / ~100+ tok/s |
| **Qwen3.5-9B** | Apache 2.0 | **Evet** | Aynı | ~5,6-6,2 GB | ~6,5-7 GB | sığmaz / ~50-80 tok/s |
| Qwen3.5-2B / 0.8B | Apache 2.0 | Evet | Aynı | ~1,3 GB / ~0,6 GB (tahmin) | ~2 GB / ~1 GB | çok hızlı; kalite zayıf olabilir |
| Qwen3 (4B, 8B; Nisan 2025) | Apache 2.0 | Evet | Evet, 119 dil arasında | ~2,5 GB / ~5 GB | ~3,3 / ~6 GB | — |
| Qwen2.5 (3B, 7B) | **3B: Qwen Research License (ticari değil)**; 7B: Apache 2.0 | 3B **hayır**, 7B evet | Kısmen (29+ dil) | ~2 GB / ~4,7 GB | — | eski, önerilmez |
| **Gemma 4 E4B** (Mart/Nisan 2026) | **Apache 2.0** (Gemma 4 ile değişti) | **Evet** | "140+ dilde ön eğitim, 35+ dil kutudan çıktığı gibi"; Türkçenin adı geçen bir liste göremedim (**doğrulanmalı**) | ~5,3-5,4 GB | ~6-6,5 GB | 6 GB'ta çok sıkışık / ~50-70 tok/s |
| Gemma 4 E2B | Apache 2.0 | Evet | Aynı | ~3 GB (tahmin) | ~3,5-4 GB | — |
| Gemma 4 12B (Haziran 2026) | Apache 2.0 (doğrulanmalı) | Evet | Aynı | ~7 GB (tahmin) | ~8 GB | yalnızca 12 GB kartta |
| Gemma 3 (4B) / Gemma 3n (E2B, E4B) | **Gemma Kullanım Koşulları** (özel lisans) | Evet, **şartlı** (aşağıda) | 140+ dil | ~2,5 GB / ~3-4,5 GB | — | — |
| Llama 3.1 8B / 3.2 3B | **Llama 3.x Community License** (özel lisans) | Evet, **şartlı** (aşağıda) | **Hayır.** Resmî 8 dil arasında Türkçe yok | ~4,9 GB / ~2 GB | — | — |
| Ministral 3 (3B, 8B; Aralık 2025) | Apache 2.0 | Evet | "40+ dil"; Türkçe adıyla doğrulanamadı | ~2 GB / ~5 GB (tahmin) | — | — |
| Phi-4-mini (3.8B) | MIT | Evet | **Evet**, model kartında Türkçe listeli | ~2,5 GB (tahmin) | ~3,3 GB | — |
| Trendyol LLM 8B chat v2.0 / 8B-T1 | **llama3** (Llama 3 tabanlı) | Şartlı, Llama kuralları geçerli | Türkçeye özel | ~4,9 GB | — | — |
| YTU Cosmos (Turkish-Llama-8b, Turkish-Gemma-9b, Turkish-Gemma-4b-T1-Scout) | llama3 / gemma2 / gemma3 | Şartlı, kaynak modelin kuralları geçerli | Türkçeye özel | 4B ~2,5 GB; 8-9B ~5-5,8 GB | — | — |
| VNGRS Kumru-2B | Apache 2.0 | Evet | Türkçeye özel, sıfırdan eğitilmiş | ~1,3 GB (tahmin) | ~2 GB | 8 bin tokenlık bağlam; sohbet kalitesi bilinmiyor |
| **Aya Expanse 8B / Tiny Aya** (Cohere) | **CC BY-NC 4.0** ve Cohere kullanım politikası | **Hayır** | Evet (Aya Expanse'te Türkçe var) | — | — | kullanılamaz |

**Kaynaklar (tablo):**
- Qwen3.5 küçük modelleri (0.8B/2B/4B/9B; Apache 2.0; 201 dil): [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B), [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B), [Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B); ikincil haber: [VentureBeat](https://venturebeat.com/technology/alibabas-small-open-source-qwen3-5-9b-beats-openais-gpt-oss-120b-and-can-run), [Artificial Analysis](https://artificialanalysis.ai/articles/qwen3-5-small-models). Model kartlarını arama özeti üzerinden gördüm; Türkçenin adıyla geçtiği resmî liste **doğrulanmalı**.
- Qwen3.5 GGUF boyutları (üçüncü taraf paketler): [bartowski/Qwen_Qwen3.5-4B-GGUF](https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF) (3,01 GB), [unsloth/Qwen3.5-9B-GGUF](https://huggingface.co/unsloth/Qwen3.5-9B-GGUF), [bartowski/Qwen_Qwen3.5-9B-GGUF](https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF) (6,17 GB).
- Qwen2.5-3B'nin ticari olmayan lisansı: [Qwen2.5-3B-Instruct LICENSE](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE) ("Qwen Research License Agreement").
- Daha yeni Qwen sürümleri: Qwen3.6 ve Qwen3.8'in açık modelleri yalnızca 27 milyar ve üzeri boyutlarda çıktı ([Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)). Qwen 4'ün açık ağırlıklı küçük modeli bugün itibarıyla yok. Bu bilgi ikincil kaynaklardan geliyor ve **doğrulanmalı**.
- Gemma 4 (Apache 2.0, E2B/E4B/26B A4B/31B, sonra 12B): [Google blog duyurusu](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/), [Gemma 4 model kartı](https://ai.google.dev/gemma/docs/core/model_card_4), [Gemma sürüm notları](https://ai.google.dev/gemma/docs/releases), [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4b-it). E4B GGUF boyutu: [prithivMLmods/gemma-4-E4B-it-GGUF](https://huggingface.co/prithivMLmods/gemma-4-E4B-it-GGUF) (5,34 GB), [ggml-org/gemma-4-e4b-it-GGUF](https://huggingface.co/ggml-org/gemma-4-e4b-it-GGUF).
- Gemma Kullanım Koşulları (Gemma 3/3n için): [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms), [Yasaklı Kullanım Politikası](https://ai.google.dev/gemma/prohibited_use_policy).
- Llama 3.2 lisansı: [LICENSE (meta-llama/llama-models)](https://raw.githubusercontent.com/meta-llama/llama-models/refs/heads/main/models/llama3_2/LICENSE) (doğrudan okundu), [kullanım politikası](https://raw.githubusercontent.com/meta-llama/llama-models/refs/heads/main/models/llama3_2/USE_POLICY.md). Desteklenen diller: [Llama-3.2-3B-Instruct model kartı](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct).
- Ministral 3 (Apache 2.0, 2 Aralık 2025): [Mistral duyurusu](https://mistral.ai/news/mistral-3), [teknik rapor arXiv 2601.08584](https://arxiv.org/abs/2601.08584v1).
- Phi-4-mini (MIT, dil listesinde Türkçe var): [microsoft/Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/README.md). Phi-5 diye bir küçük model bulamadım.
- Trendyol: [Trendyol/Llama-3-Trendyol-LLM-8b-chat-v2.0](https://huggingface.co/Trendyol/Llama-3-Trendyol-LLM-8b-chat-v2.0) (license: llama3; Llama-3 8B üzerine 13 milyar tokenlık ek eğitim), [Trendyol-LLM-8B-T1](https://featherless.ai/models/Trendyol/Trendyol-LLM-8B-T1) (ikincil). Modelin adının Llama lisansına uymadığına dair topluluk uyarısı: [tartışma #1](https://huggingface.co/Trendyol/Llama-3-Trendyol-LLM-8b-chat-v2.0/discussions/1).
- YTU Cosmos: [Turkish-Llama-8b-v0.1](https://huggingface.co/ytu-ce-cosmos/Turkish-Llama-8b-v0.1), [Turkish-Gemma-9b-v0.1](https://huggingface.co/ytu-ce-cosmos/Turkish-Gemma-9b-v0.1), [Turkish-Gemma-9b-T1-GGUF](https://huggingface.co/ytu-ce-cosmos/Turkish-Gemma-9b-T1-GGUF), [Turkish-Gemma-4b-T1-Scout](https://huggingface.co/ytu-ce-cosmos/Turkish-Gemma-4b-T1-Scout).
- Kumru: [vngrs-ai/Kumru-2B](https://huggingface.co/vngrs-ai/Kumru-2B/blob/main/README.md) (apache-2.0). Kumru-7B'nin açık ağırlığı ve lisansı bulunamadı ([Webrazzi haberi](https://webrazzi.com/2025/10/10/vngrs-den-7-4-milyar-parametreli-turkce-llm-kumru/)).
- Aya: [CohereLabs/aya-expanse-8b](https://huggingface.co/CohereLabs/aya-expanse-8b) (cc-by-nc-4.0), [tiny-aya-base](https://huggingface.co/CohereLabs/tiny-aya-base/blob/main/README.md) (CC BY-NC 4.0; "ticari kullanım için satış ekibiyle iletişime geçin").

**Hız tahmininin gerekçesi:** Saniyede token sayısını büyük ölçüde ekran kartının bellek hızı belirler. Kabaca "bellek bant genişliği ÷ model dosyası × 0,6 verim" hesabıyla RTX 2060'ta (336 GB/s) 2,7 GB'lık bir model ~75 tok/s, RTX 4070'te (504 GB/s) 5,7 GB'lık bir model ~50-55 tok/s çıkıyor. Ölçülmüş rakam bulamadım. İkincil tahmin siteleri RTX 2060 Super'de 8B için ~36-53 tok/s ([willitrunai](https://willitrunai.com/can-run/hf-bartowski--meta-llama-3-1-8b-instruct-gguf-on-rtx-2060-6gb)), RTX 4070'te Llama 3.1 8B için ~83 tok/s ([willitrunai](https://willitrunai.com/can-run/llama-3.1-8b-on-rtx-4070-12gb)) diyor. Bizim kullanımda bir köylü cevabı 30-80 token, yani bütün rakamlar **1-2 saniyenin altında** bir cevap demek. Önce ekrana gelen ilk kelimeyi, sonra sesi akıtarak (streaming) bekleme hissi daha da azaltılabilir. Gerçek değer geliştirici makinesinde `llama-bench` ile ölçülmeli.

#### Özel lisansların oyuna gömmeye etkisi

- **Gemma 3 / 3n (Gemma Kullanım Koşulları):** Ticari kullanım ve dağıtım serbest, ama şu şartlarla: (1) dağıtılan her kopyaya bir "Notice" metin dosyası konacak; (2) oyunun kullanıcı sözleşmesine (EULA) Gemma'nın kullanım kısıtları **uygulanabilir bir madde olarak** eklenecek ve oyuncuya sözleşmenin bir kopyası verilecek; (3) Google, ihlal olduğunu düşündüğü kullanımı "uzaktan ya da başka yolla" kısıtlama hakkını saklı tutuyor. Yerel bir oyunda pratik etkisi düşük, ama hukuki belirsizlik yaratıyor. **Gemma 4 bu koşullardan çıktı ve Apache 2.0 oldu.** Bu yüzden Gemma ailesinden yalnızca Gemma 4'ü öneriyorum. ([Gemma terms](https://ai.google.dev/gemma/terms); terms sayfasında "Gemma 4 için Gemma 4 lisansına bakın" notu var. Her iki bilgi de arama özetinden, **doğrulanmalı**.)
- **Llama 3.x Community License:** Ticari satış serbest. 700 milyon aylık kullanıcı sınırı bizi ilgilendirmez. Ama oyunla birlikte lisansın bir kopyası verilmeli, ürünün sitesinde, arayüzünde ya da belgelerinde **"Built with Llama"** yazısı belirgin şekilde gösterilmeli ve bir "Notice" dosyası eklenmeli. Llama'dan türetilmiş bir modelin (Trendyol, Cosmos Llama) adı "Llama" ile başlamalı. Kullanım politikasına uymak da zorunlu. Llama 3.2'nin görsel (multimodal) modellerinde AB'de yerleşik şirketlere hak verilmiyor; metin modelleri bu kısıttan etkilenmiyor. ([LICENSE](https://raw.githubusercontent.com/meta-llama/llama-models/refs/heads/main/models/llama3_2/LICENSE), doğrudan okundu.) Türkçe resmî olarak desteklenmediği için de öncelikli aday değil.
- **Türkçeye özel ince ayarlar (Trendyol, Cosmos):** Kaynak modelin (Llama 3, Gemma 2/3) lisansını aynen miras alıyorlar. Hepsi bir yıldan eski tabanlar üzerine kurulu. 2025 Cetvel kıyaslamasında Türkçeye özel modellerin çoğu Llama 3 gibi genel modellerin gerisinde kalmış (aşağıda). Güncel Qwen3.5 ya da Gemma 4 tabanlı, açık lisanslı ve güvenilir bir Türkçe ince ayar bulamadım. Örneğin [Mergen-TR-Qwen3.5-9B](https://huggingface.co/SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-GGUF-TURKISH) kendi bildirdiği bir puan sunuyor, bağımsız doğrulaması yok.

#### Türkçe kıyas tabloları ne diyor?

- **Cetvel** (Koç Üniversitesi; EACL 2026'da yayımlandı): 33 açık modeli 23 Türkçe görevde ölçmüş. Llama 3 türevleri kendi boyut sınıflarında önde. Türkçeye özel modellerin çoğu genel amaçlı Llama 3 ve Mistral'in gerisinde. Kıyaslama Qwen3.5 ve Gemma 4'ten önce yapıldığı için bu iki aile listede yok. ([arXiv 2508.16431](https://arxiv.org/abs/2508.16431v1), [ACL Anthology](https://aclanthology.org/2026.eacl-long.46), [GitHub KUIS-AI/cetvel](https://github.com/KUIS-AI/cetvel).)
- **Turkish MMLU Pro** (Eylül 2026 makalesi): Bir tabloda gemma4:e4b için 50,7, qwen3.5:4b için 40,3 doğruluk görünüyor. Tablo başlıkları özet içinde bozuk göründüğü için rakamlar **doğrulanmalı**; yine de yön, küçük boyutta Gemma 4'ün Türkçe bilgi testinde önde olduğu yönünde. ([arXiv 2609.15467](https://arxiv.org/html/2609.15467).)
- **TR-MMLU liderlik tablosu** (alibayram): Ollama ile çalışan modellerin Türkçe test puanları burada ([Hugging Face veri seti](https://huggingface.co/datasets/alibayram/yapay_zeka_turkce_mmlu_liderlik_tablosu/viewer)). Qwen3.5 ve Gemma 4 satırlarını göremedim, **doğrulanmalı**.
- **Önemli not:** Bu testler bilgi ve akıl yürütmeyi ölçüyor. Bizim ihtiyacımız ise farklı: verilen bir kararı (yalan söyle, şunu sakla, şunu gördün) **doğal, kısa, karaktere uygun günlük Türkçeye** dökmek. Bunu en iyi, 10-20 gerçek sorgu sahnesiyle kendi "kör dinleme" testimiz ölçer (bkz. D bölümü).

### A3. Çalışma motoru

| Motor | Ne işe yarar | Lisans | Bizim için önemli noktalar |
|---|---|---|---|
| **llama.cpp** | GGUF modelleri C/C++ ile çalıştıran temel motor | MIT ([GitHub](https://github.com/ggml-org/llama.cpp)) | CUDA, Vulkan, Metal ve CPU desteği. "GBNF dilbilgisi" ile çıktıyı belli bir kalıba zorlayabiliyor. Tauri kullanılırsa `llama-server` ayrı bir program (sidecar) olarak oyunla gelir ve oyun ona yerel HTTP ile bağlanır. |
| **node-llama-cpp** (v3.22.4, 25 Kasım 2026) | llama.cpp'yi JavaScript/Node'dan kullandıran paket | MIT ([npm](https://www.npmjs.com/package/node-llama-cpp), [GitHub](https://github.com/withcatai/node-llama-cpp)) | **JSON şemasına zorlama** ("modelin çıktısı bu kalıpta olacak" diyebiliyoruz). Fonksiyon çağırma. Hazır derlenmiş Windows ikilileri (yeniden derleme gerekmiyor). CUDA, Vulkan ve Metal'i otomatik seçiyor. **Electron'da yalnızca ana süreçte çalışıyor** (oyun ekranını çizen süreçte çalıştırılırsa çöküyor). Hazır bir Electron şablonu var: `npm create node-llama-cpp@latest -- --template electron-typescript-react`. Yerel ikililer asar arşivine konmamalı; şablon bunu ayarlıyor. ([Electron rehberi](https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/electron.md)) |
| **web-llm** (MLC) | Modeli tarayıcıda WebGPU ile çalıştırır | Apache 2.0 ([GitHub](https://github.com/mlc-ai/web-llm)) | Electron'un tarayıcısında doğrudan çalışır, yerel modül gerektirmez. Ama modellerin MLC'nin kendi biçimine dönüştürülmüş olması gerekiyor (Qwen3.5 ve Gemma 4'ün hazır olup olmadığı **doğrulanmalı**). JSON zorlama desteği daha sınırlı, WebGPU sürücü sorunları da riskli. Yedek seçenek olarak tutulabilir. |

**CUDA ve Vulkan farkı:** node-llama-cpp'nin CUDA ikilileri için belgelerde "CUDA Toolkit 12.4+ veya 13.1+ kurulu olsun" deniyor ([CUDA rehberi](https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/CUDA.md)). Oyuncudan bunu beklemek olmaz. Windows'ta Vulkan sürücüsü ise normal ekran kartı sürücüsüyle geliyor ([Vulkan rehberi](https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/Vulkan.md)). Öneri: **Vulkan'ı varsayılan yapmak**; CUDA çalışma kütüphaneleri pakete eklenebiliyorsa ikinci seçenek olarak sunmak (`win-x64-cuda-ext` paketinin bunu ne ölçüde çözdüğü **doğrulanmalı**). Paket boyutları npm'den: win-x64 34,6 MB, win-x64-vulkan 76,3 MB, win-x64-cuda 203,7 MB, win-x64-cuda-ext 315,8 MB.

**Örnek kullanım şekli (fikir vermek için):** Motor şöyle bir istek gönderir: `{karakter: "Muhtar Hasan", karar: "yalan", gerçek: "gece değirmene gitti", söyleyeceği: "evdeydim", ruh_hali: "sinirli"}`. Modelden ise `{"cevap": "...", "duygu": "sinirli"}` şeklinde bir JSON beklenir. Şema sayesinde model karar dışına çıkamaz, uzun nutuk atamaz (en fazla karakter sayısı da şemaya yazılabilir).

**Uyarı:** Qwen3.5 modelleri varsayılan olarak cevaptan önce uzun uzun "düşünüyor" (thinking mode). Oyunda bu kapatılmalı, yoksa gecikme artar. Kapatma ayarının tam adı **doğrulanmalı**. ([Qwen3.5-4B kartı](https://huggingface.co/Qwen/Qwen3.5-4B), arama özeti.)

### A4. Dil modeli önerisi

- **Asgari (RTX 2060 6 GB): Qwen3.5-4B, Q4_K_M.** Apache 2.0 olduğu için dağıtım sorunu yok. ~3,5-4 GB VRAM ile sese de yer bırakıyor. Yedek olarak **Gemma 4 E2B** denenmeli (aynı lisans, küçük); hangisinin Türkçesi daha doğalsa o seçilmeli.
- **Güçlü (RTX 2070 8 GB ve üstü, 4070 12 GB): Gemma 4 E4B** ya da **Qwen3.5-9B**. Gemma 4 E4B'nin dosyası 5,3 GB ama "etkin" 4 milyar parametreyle çalıştığı için hızlı olması bekleniyor (**tahmin**). Qwen3.5-9B daha büyük ve muhtemelen daha akıllı, ama 8 GB'lık kartta ses için az yer bırakıyor.
- **Neden Türkçeye özel modeller değil?** Lisansları Llama/Gemma şartlarına bağlı, tabanları eski, bağımsız kıyaslarda genel modellerin gerisindeler. Kumru-2B (Apache 2.0) ilginç bir yedek; sohbet kalitesi denenmeli.
- **Neden oyuna iki model birden?** Oyun açılışta ekran kartının belleğini ölçüp uygun modeli seçebilir; node-llama-cpp bu ölçümü sunuyor. İki model, Steam indirme boyutunu 8-9 GB'a çıkarır. Bu yüzden güçlü model **isteğe bağlı bir DLC/indirme paketi** olarak ayrılabilir (ücretsiz DLC; Steam bunu destekliyor).

---

## B) Yerel Türkçe metinden sese (TTS)

### B1-B2. Adaylar tablosu

"Ticari" sütunu **model ağırlıklarının** lisansına göre: Evet / Hayır / Şartlı / Belirsiz. Kod lisansı ayrı sütunda. VRAM ve hız, belirtilmedikçe **tahmin**. Hiçbirinin Türkçe sesini kulakla dinleyemedim; "kalite" sütunu üreticinin ya da üçüncü tarafların beyanıdır.

| Sistem | Türkçe | Kod lisansı | Ağırlık lisansı | Ticari? | Klon | Nerede çalışır / VRAM | Hız | Not ve örnek ses |
|---|---|---|---|---|---|---|---|---|
| **Piper** (OHF-Voice/piper1-gpl) | Var (dfki, fahrettin, fettah) | **GPL-3.0-or-later** (eski rhasspy/piper MIT'ti, Ekim 2025'te arşivlendi) | Sese göre değişiyor | **Türkçe seslerde hayır / belirsiz** | Yok | CPU, çok hafif (~60 MB) | Gerçek zamandan çok hızlı | Ayrıntı aşağıda. [Örnekler](https://rhasspy.github.io/piper-samples) |
| **Supertonic 3** (Nisan 2026) | **Var** (31 dil) | MIT (örnek kod) | **BigScience OpenRAIL-M** | **Evet** (kullanım kısıtları kullanıcıya aktarılmalı) | Yok (ses hizmeti kapandı) | CPU/GPU, ONNX; Node, tarayıcı (WebGPU) ve sherpa-onnx'ten çalışıyor | "Şimşek hızında" (beyan) | 10 hazır ses (5 erkek, 5 kadın). **Depo arşivlendi**, güncelleme yok. [Demo](https://huggingface.co/spaces/Supertone/supertonic-3) |
| **MOSS-TTS-Nano** (OpenMOSS, 2026) | **Var** (20 dil) | Apache 2.0 | Apache 2.0 | **Evet** | **Var** (referans sesle) | **CPU** (ONNX, PyTorch gerektirmiyor), istenirse CUDA | Tek CPU çekirdeğinde akıcı (beyan) | 100 milyon parametre, akış halinde (streaming) üretim. [Demo](https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano) |
| **VoxCPM2** (OpenBMB, Nisan 2026) | **Var** (30 dil) | Apache 2.0 | Apache 2.0 | **Evet** | **Var** ve **yazıyla ses tasarımı** | GPU, **~8 GB** (resmî); GGUF ile llama.cpp-omni üzerinden CPU/CUDA/Vulkan | RTX 4090'da RTF ~0,3 (resmî); 4070'te ~0,5-0,8 (tahmin) | 2 milyar parametre, 48 kHz. Kendi Türkçe ölçümünde ElevenLabs'e yakın hata oranı bildiriyor. [Demo](https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo) |
| **Chatterbox Multilingual V3** (Resemble AI) | **Var** (23 dil) | MIT | MIT | **Evet** | **Var** (10 sn referans) | GPU (Python/PyTorch); ~3-5 GB (tahmin) | — | Duygu ayarı var (`exaggeration`, `cfg_weight`). Çıktıya görünmez **PerTh filigranı** ekliyor. **Ağustos 2026'dan beri bakımı yapılmıyor (emekli)**. [Örnekler](https://resemble-ai.github.io/chatterbox_demopage/) |
| **Coqui XTTS v2** | Var | MPL-2.0 | **Coqui Public Model License** (yalnızca ticari olmayan kullanım) | **Hayır** | Var | GPU | — | Coqui kapandı (Ocak 2024, ikincil kaynak), ticari lisans satın alma yolu kalmadı |
| **F5-TTS** ve Türkçe ince ayarı | Resmî değil; topluluk ince ayarı var | MIT | **CC BY-NC 4.0** (eğitim verisi Emilia yüzünden) | **Hayır** | Var | GPU | — | [marduk-ra/F5-TTS-Turkish](https://huggingface.co/marduk-ra/F5-TTS-Turkish) de cc-by-nc-4.0 |
| **Meta MMS-TTS (tur)** | Var | — | **CC BY-NC 4.0** | **Hayır** | Yok | CPU | Hızlı | Kalite düşük ve robotik |
| **Kokoro-82M** | **Yok** (EN, ES, FR, HI, IT, JA, PT-BR, ZH) | Apache 2.0 | Apache 2.0 | Evet | Yok | CPU | Çok hızlı | Türkçe olmadığı için şimdilik dışarıda; İngilizce sürüm için aday |
| **MeloTTS** | **Yok** | MIT | MIT | Evet | Yok | CPU | Hızlı | Türkçe yok |
| **Fish Speech / Fish Audio S2-Pro, Drama 3** | S2-Pro "yüz kadar dil" | Fish Audio Community License | S2-Pro: **Research License (ticari değil)**; Drama 3: **gelir eşikli topluluk lisansı** | Hayır / Şartlı | Var | GPU, 4 milyar parametre | — | Önerilmez |
| **Fun-CosyVoice 3** | **Yok** (9 dil) | Apache 2.0 | Apache 2.0 | Evet | Var | GPU | — | Türkçe yok |
| **Orpheus** | **Yok** (çok dilli sürüm "araştırma önizlemesi", Türkçe içermiyor; doğrulanmalı) | Apache 2.0 | Llama 3.2 tabanlı (Llama lisansı) | Şartlı | — | GPU, 3 milyar parametre | — | Önerilmez |
| **Qwen3-TTS** | **Yok** (10 dil) | Apache 2.0 | Apache 2.0 | Evet | Var | GPU | — | Türkçe yok |
| **OmniVoice** (k2-fsa) | Var (600+ dil) | Apache 2.0 | **CC BY-NC** (3 Temmuz 2026'da Apache'den değişti) | **Hayır** | Var | GPU | RTF 0,025 | Lisans değişikliğine dikkat |
| **FreyaTTS-small** (Temmuz 2026) | **Türkçeye özel** | Apache 2.0 | Apache 2.0 | **Evet** | Yok ("tohum" sayısı konuşmacıyı seçiyor) | GPU ~1,5 GB, dizüstü CPU'da gerçek zamanlı | RTF 0,10 (RTX 4090) | 183 milyon parametre, 48 kHz. Esas olarak tek ses ("Leyla"). Eğitim verisinin kaynağı **doğrulanmalı**. [Örnekler](https://freyatts.freyavoice.ai) |
| **EMA Lightning** (Ekim 2026) | **Türkçeye özel** | Apache 2.0 | Apache 2.0 | **Evet** (eğitim verisinin kaynağı belirtilmemiş, **doğrulanmalı**) | Yok, **tek ses**, duygu ayarı yok | CPU'da gerçek zamanın ~6 katı; 34 MB | Çok hızlı | **Kelime zamanlaması veriyor** (dudak senkronu için). Python/PyTorch gerektiriyor |
| **Ahenk** / **Ahenk Cep** (Kasım 2026) | **Türkçeye özel** | Apache 2.0 | **CC BY 4.0** (kaynak gösterme şartı) | **Evet** | Yok, tek tasarlanmış ses | Ahenk: VoxCPM2 + LoRA (GPU); Ahenk Cep: 8,6 milyon parametre, CPU, **tarayıcıda çalışıyor** | Cep: CPU'da RTF ~0,2 | Ahenk 6 duygu ve gülme destekliyor. Topluluk projesi. [Örnekler](https://ozguradmin.github.io/ahenk-turkish-tts/) |
| **Trendyol-TTS** | Türkçeye özel (VoxCPM2 + LoRA) | — | **Belirsiz** (MIT etiketi var ama LICENSE dosyası yok) | **Belirsiz** | — | GPU | — | "Araştırma ürünü" olarak tanımlanıyor |
| **pocket-tts-tr** | Türkçeye özel (Kyutai Pocket TTS tabanlı) | MIT (Kyutai kodu) | CC BY 4.0 | Belirsiz: eğitim verisi sesli kitaplardan; hakları **doğrulanmalı** | Var | CPU | — | Riskli |

**Kaynaklar (tablo):**
- Piper: [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) (GitHub üst verisinde lisans GPL-3.0; README "espeak-ng gömülü" diyor), [Ses lisanslama belgesi](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md) ve [Ticari kullanım listesi](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/COMMERCIAL_USE.md) (ikisi de doğrudan okundu), [eski rhasspy/piper](https://github.com/rhasspy/piper) (MIT, arşivlendi).
- Supertonic: [supertone-oss-archive/supertonic](https://github.com/supertone-oss-archive/supertonic) (README doğrudan okundu: 31 dil, Türkçe dahil; "kod MIT, model OpenRAIL-M"; depo arşivlendi), [model lisansı](https://huggingface.co/supertone-oss-archive/supertonic-3/blob/main/LICENSE), [sesler](https://github.com/supertone-oss-archive/supertonic-py/blob/main/docs/voices.md); sherpa-onnx'te Türkçe Supertonic: [sherpa belgeleri (kaynak)](https://raw.githubusercontent.com/k2-fsa/sherpa/master/docs/source/onnx/tts/supertonic.rst).
- MOSS-TTS-Nano: [OpenMOSS/MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano) (README doğrudan okundu: 20 dil arasında Türkçe, ONNX CPU sürümü, ses klonlama). Lisans: GitHub üst verisi Apache-2.0; README'nin lisans bölümü "kök LICENSE dosyasına bakın" diyor. [HF ağırlıkları](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano). Ağırlık lisansını **HF kartından doğrulamak** gerekiyor.
- VoxCPM2: [OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM) (README doğrudan okundu: 30 dil arasında Türkçe; "ağırlıklar ve kod Apache-2.0, ticari kullanıma serbest"; VRAM ~8 GB; RTX 4090'da RTF ~0,30; Türkçe hata oranı 0,817), [openbmb/VoxCPM2](https://huggingface.co/openbmb/VoxCPM2), [VoxCPM2 GGUF](https://huggingface.co/DennisHuang648/VoxCPM2-GGUF), [llama.cpp-omni](https://github.com/tc-mb/llama.cpp-omni).
- Chatterbox: [resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox) (README doğrudan okundu: emeklilik notu, 23 dil arasında Türkçe, MIT, PerTh filigranı).
- XTTS v2: [coqui/XTTS-v2 LICENSE](https://huggingface.co/coqui/XTTS-v2/commits/v2.0.3/LICENSE.txt), [Coqui kapanışı tartışması](https://github.com/coqui-ai/TTS/discussions/4145).
- F5-TTS: [SWivid/F5-TTS](https://github.com/SWivid/F5-TTS) (kod MIT; [HF kartı](https://huggingface.co/SWivid/F5-TTS) ağırlıklar için CC-BY-NC diyor).
- MMS-TTS: [facebook/mms-tts-tur](https://huggingface.co/facebook/mms-tts-tur) (CC BY-NC 4.0; kartı doğrudan açamadım, **doğrulanmalı**).
- Kokoro: [hexgrad/kokoro](https://github.com/hexgrad/kokoro) (dil kodları README'den). MeloTTS: [myshell-ai/MeloTTS](https://github.com/myshell-ai/MeloTTS). Fish: [fishaudio/fish-speech](https://github.com/fishaudio/fish-speech) (README'deki lisans notu). CosyVoice: [Fun-CosyVoice 3](https://github.com/QwenAudio/CosyVoice) (9 dil). Orpheus: [canopyai/Orpheus-TTS](https://github.com/canopyai/Orpheus-TTS). Qwen3-TTS: [QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) (10 dil).
- OmniVoice'in lisans değişikliği ve çoğu modelin ağırlık lisansı için güzel bir özet tablo (2026 Eylül-Kasım tarihli kontrollerle): [audio.cpp docs/model_licenses.md](https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md). Kendi deyişiyle "hukuki tavsiye değildir, asıl kaynaktaki metin geçerlidir".
- Türkçeye özel modeller: [FreyaTTS](https://github.com/freyavoiceai/FreyaTTS), [EMA Lightning](https://github.com/canberk7/ema-lightning), [Ahenk](https://github.com/ozguradmin/ahenk-turkish-tts), [Trendyol-TTS (ayna)](https://huggingface.co/niobures/Trendyol-TTS), [pocket-tts-tr](https://huggingface.co/kaanhgunay/pocket-tts-tr).

#### Piper Türkçe sesleri: neden kullanmıyoruz?

- **tr_TR-dfki-medium:** Model kartında veri seti lisansı **CC BY-NC-SA 4.0** (ticari değil). Ayrıca "ABD İngilizcesi lessac sesinden ince ayar" yapılmış, lessac verisinin lisansı da ticari kullanımı dışlıyor ([dfki MODEL_CARD](https://huggingface.co/datasets/rhasspy/piper-checkpoints/blob/4348dcaff20e321f785c5e6978be6d734332e6eb/tr/tr_TR/dfki/medium/MODEL_CARD), [Piper LICENSING.md](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md)).
- **tr_TR-fahrettin-medium, tr_TR-fettah-medium:** Model kartlarını bulamadım. Bir topluluk tartışmasında fettah sesinin "bir mobil oyundan alındığı" iddia ediliyor; bir Türkçe incelemeye göre de iki ses katkıcıların isteğiyle kaldırılmış. İkisi de **belirsiz, kullanılmamalı** ([piper-voices tartışması](https://huggingface.co/rhasspy/piper-voices/discussions/11)).
- Piper'ın **"Ticari kullanım" listesinde hiçbir Türkçe ses yok** (Kasım 2026, doğrudan okundu).
- Piper motorunun kendisi Ekim 2025'ten beri **GPL-3.0**. Kapalı kaynaklı oyuna gömmek hukuki risk taşıyor. Piper biçimindeki sesler sherpa-onnx (Apache 2.0) ile de çalıştırılabiliyor, ama Piper sesleri sesletim için **espeak-ng** kullanıyor, o da GPL. **Doğrulanmalı**.
- Çıkış yolu: Kendi kaydettiğimiz bir Türkçe sesi, Piper'ın CC0 lisanslı **nl_BE-rdh** temel sesinden ince ayarla eğitmek mümkün. Ama motor ve espeak-ng'nin GPL sorunu yine de duruyor.

#### Çalıştırma motoru: sherpa-onnx

- **Lisans:** Apache 2.0 ([GitHub](https://github.com/k2-fsa/sherpa-onnx)). npm paketi `sherpa-onnx-node` v2.0.3 (22 Kasım 2026), Node 18+ ile çalışıyor ve internete hiç çıkmıyor ([npm](https://www.npmjs.com/package/sherpa-onnx)).
- **Destek:** Piper/VITS, Matcha, Kokoro, Supertonic (Türkçe `supertonic-3-tr` dahil), ZipVoice ve Pocket TTS gibi modelleri çalıştırıyor. Electron'un ana sürecinden kullanılabilir. Tarayıcı içi WebAssembly sürümü de var.
- **Alternatif:** [audio.cpp](https://github.com/0xShug0/audio.cpp) (Apache 2.0). Python'suz C++ motoru; VoxCPM2, MOSS, Chatterbox, Kokoro gibi pek çok modeli CUDA, Vulkan ya da CPU'da çalıştırıyor, Kasım 2026'da WebGPU desteği eklendi. Hızla gelişiyor, ama genç bir proje.

### B3. 24 karaktere farklı ses verme yolları

**(a) Her karaktere ayrı klon ses.** Zorluk: orta. Sonuç: en doğal ve en ayırt edilebilir sesler.
- **Referans sesin hakkı en önemli konu.** Gerçek bir insanın sesini (oyuncu, ünlü, internetten kayıt) izinsiz klonlamak kişilik hakkı ve telif riski taşır. Güvenli üç kaynak var:
  1. **Tasarlanmış yapay sesler:** VoxCPM2'nin "ses tasarımı" özelliğiyle "60 yaşında, kalın ve boğuk sesli, ağır konuşan bir köy muhtarı" gibi tariflerden ses üretilir. Kimsenin sesi değildir ve çıktı Apache 2.0 modelden gelir. [voxcpm2-turkce-ses-tasarimi](https://github.com/alexturkey/voxcpm2-turkce-ses-tasarimi) projesi bunu 4 GB'lık kartta Türkçe yapıyor ve 7 hazır Türkçe sentetik ses sunuyor (topluluk projesi; Apache 2.0). Not: OmniVoice'in belgelerine göre ses tasarımı yalnızca Çince ve İngilizce verilerle eğitilmiş; VoxCPM2 için de Türkçe tasarımın kalitesi denenmeli.
  2. **Kendi kayıtlarımız:** Yazılı izin (ses kullanım sözleşmesi) alınmış seslendirme sanatçısı ya da gönüllüler. Her karakter için 10-30 saniye temiz kayıt yeterli.
  3. **CC0 veya CC BY ses veri setleri:** Örneğin Mozilla Common Voice'un Türkçe bölümü CC0, ama kayıtlar telefon kalitesinde ve konuşanlar "klonlanma"ya ayrıca onay vermiş değil. Etik olarak zayıf, önerilmez.
- **Çalıştırma:** Oyunda her karakterin referans kaydı (ya da önceden hesaplanmış ses "parmak izi") tutulur ve klonlama yapan model (MOSS-TTS-Nano, Chatterbox, VoxCPM2) bu kayıtla konuşturur.

**(b) Birkaç temel sesi perde, hız ve tınıyla çeşitlemek.** Zorluk: düşük. Sonuç: iyi ayarlanırsa 24 sesi birbirinden ayırmaya yeter, ama aynı "aileden" geldikleri hissedilebilir.
- Örnek: Supertonic'in 10 hazır sesinin her birinden 2-3 varyant çıkarmak (perde ±1-4 yarım ton, formant ±%5-15, konuşma hızı ±%10). Karakterin yaşına göre yaşlılara biraz titreme, gençlere daha hızlı konuşma eklenebilir.
- **Formant korumalı kaydırma neden önemli:** Perdeyi basitçe yükseltmek (örneğin Web Audio'nun `playbackRate` ayarı) tınıyı da yükseltir ve ses çocuk ya da çizgi film sesine döner. Formantı sabit tutup yalnızca perdeyi oynatırsanız ses aynı insanın biraz daha ince ya da kalın konuşması gibi doğal kalır. Formantı ayrıca kaydırırsanız da "başka bir insan" etkisi elde edilir: daha büyük ya da küçük bir gırtlak.
- **Araçlar ve lisanslar:**
  - **Signalsmith Stretch:** MIT. Hem C++ hem Web Audio/WebAssembly (npm) sürümü var, **formant kaydırma ve formant koruma** destekliyor ([GitHub](https://github.com/Signalsmith-Audio/signalsmith-stretch)). İlk tercih.
  - **Rubber Band:** GPL-2.0 (ticari lisansı ayrıca satılıyor). Kalitesi yüksek, ama GPL ([GitHub](https://github.com/breakfastquay/rubberband)).
  - **SoundTouchJS:** LGPL-2.1 ([GitHub](https://github.com/cutterbl/soundtouchjs-audio-worklet)).
  - **WORLD vocoder:** Değiştirilmiş BSD lisansı. Konuşmayı perde, tını ve gürültü bileşenlerine ayırıyor, en ince ayarı bu verir ([GitHub](https://github.com/mmorise/World)). Oyuna bağlamak için C++ eklentisi gerektirir.
  - **ffmpeg ve sox:** Geliştirme sırasında deneme için uygun; ffmpeg'in `rubberband` filtresi GPL derleme gerektirir.

**(c) Ses dönüştürme (RVC gibi).** Zorluk: yüksek. Sonuç: iyi olabilir, ama riskli.
- RVC'nin kodu MIT ([GitHub](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)). Ama her hedef ses için o sesin kayıtlarıyla ayrı bir model eğitmek gerekiyor; yani referans hakkı sorunu aynen sürüyor. Topluluğun paylaştığı hazır RVC seslerinin çoğunun kaynağı ve lisansı belirsiz ([audio.cpp lisans tablosu](https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md)).
- Oyun sırasında TTS'in üstüne ikinci bir model daha çalışır: daha fazla gecikme ve ~1-2 GB ek VRAM (**tahmin**).
- Seed-VC GPL-3.0; MeanVC2 Apache 2.0 (audio.cpp tablosuna göre).
- Öneri: Gerekmedikçe kullanmayın. (a) ve (b) aynı sonucu daha az riskle verir.

### B4. Dudak senkronu

| Yöntem | Nasıl | Zorluk | Kaynak |
|---|---|---|---|
| **Ses genliğinden ağız açıklığı** | Web Audio `AnalyserNode` ile anlık ses gücünü ölçüp ağzı 3-4 kademede açmak | **Çok kolay**, her TTS ile çalışır | Tarayıcı API'si; hazır örnek: [wawa-lipsync](https://github.com/wass08/wawa-lipsync) (MIT) |
| **TTS'in verdiği zamanlamalar** | EMA Lightning her kelimenin başlangıç ve bitişini veriyor. Piper'ın yeni sürümlerinde fonem hizalaması (`include_alignments`) var (sesin desteklemesi gerekiyor). VoxCPM2 sonradan kelime zaman damgası çıkarabiliyor (`voxcpm[timestamps]`, stable-ts ile) | Orta | [EMA README](https://github.com/canberk7/ema-lightning), [Piper sürümleri](https://github.com/OHF-Voice/piper1-gpl/releases) (alan adı topluluk kopyasından, **doğrulanmalı**), [VoxCPM README](https://github.com/OpenBMB/VoxCPM) |
| **Yazıdan ağız şekli** | Türkçe yazıldığı gibi okunduğu için harflerden ağız şekli (a/e açık, o/u yuvarlak, m/b/p kapalı) çıkarılıp ses süresine yayılabilir | Orta | Kendi kodumuz |
| **Sesten çözümleme** | Rhubarb Lip Sync'in dilden bağımsız "phonetic" tanıyıcısı ses dosyasından ağız şekilleri çıkarıyor | Orta; önceden üretilmiş repliklerde iyi, anlık üretimde yavaş olabilir | [Rhubarb](https://github.com/DanielSWolf/rhubarb-lip-sync) (lisans MIT olarak biliniyor, **doğrulanmalı**) |

**Öneri:** 2D canvas oyununda **ses genliği ve basit harf kuralları** yeterli ve her TTS ile çalışır. Zamanlama veren bir TTS seçilirse sonradan geliştirilebilir. sherpa-onnx'in Supertonic için süre bilgisi verip vermediği **doğrulanmalı**.

### B5. VRAM bütçesi

| Kalem | 6 GB (RTX 2060) | 8 GB (RTX 2070) | 12 GB (RTX 4070) |
|---|---|---|---|
| Windows masaüstü, oyunun 2D çizimi | ~0,5-0,8 GB | ~0,5-0,8 GB | ~0,5-0,8 GB |
| Dil modeli | Qwen3.5-4B: ~3,5-4 GB | Qwen3.5-4B ~4 GB **ya da** Gemma 4 E4B ~6-6,5 GB | Gemma 4 E4B ~6,5 GB **ya da** Qwen3.5-9B ~6,5-7 GB |
| TTS | **CPU'da** (Supertonic / MOSS-TTS-Nano): 0 GB | CPU'da, ya da GPU'da küçük model ~1-1,5 GB | GPU'da küçük/orta model ~1,5-3 GB; VoxCPM2 tam haliyle ~8 GB **sığmaz** |
| Kalan pay | ~1-1,5 GB | ~0,5-2 GB | ~1-3 GB |

(Bütün rakamlar **tahmin**; ilk denemede ölçülmeli.)

- **6 GB'a sığar mı?** 4 milyar parametreli model ile GPU'da çalışan bir TTS sıkışık olur. Önerilen çözüm, **TTS'i işlemciye almak**. Supertonic ve MOSS-TTS-Nano tam da bunun için tasarlanmış, ONNX ile CPU'da gerçek zamandan hızlı çalıştığı bildiriliyor. Dil modeli GPU'da, ses CPU'da çalışınca ikisi birbirini yavaşlatmaz. RTX 2060 ile eşleşen işlemciler (4-6 çekirdek) için de yeterli olmalı (**tahmin**).
- **Sıralı çalışma:** Önce dil modeli cümleyi bitirir, sonra ses üretilir. Daha iyisi: model cümleyi yazarken ilk cümle bitince ses üretimi başlar. İkisi aynı anda GPU'yu yormadığı için bütçeyi rahatlatır.
- **Önceden üretilmiş replikler:** Her karakterin selamlaşma, ret, "bilmiyorum" gibi sık cümleleri ve senaryonun kilit itirafları geliştirme sırasında en iyi modelle (VoxCPM2) üretilip ses dosyası olarak oyuna konabilir. Anlık TTS yalnızca serbest cümlelerde devreye girer.

### B6. TTS önerisi

- **Asgari donanım:** Oyun sırasında **Supertonic 3 (Türkçe) ile CPU'da** ses üretmek, sherpa-onnx-node üzerinden Electron ana sürecinde. Sesleri çeşitlendirmek için 10 hazır sesten varyant türetmek ve Signalsmith Stretch ile formant/perde ayarlamak. Yedek aday **MOSS-TTS-Nano (CPU, ONNX)**: lisansı daha temiz (Apache 2.0) ve klonlayabildiği için 24 karakterin her birine kendi referans sesini verme imkânı var; ama şimdilik Python örneği var, Node'dan doğrudan kullanmak için ONNX Runtime-node ile köprü yazmak gerekebilir (**doğrulanmalı**).
- **Güçlü donanım:** Aynı yol ve ek olarak klonlama. 24 karakterin referans sesleri **geliştirme sırasında** VoxCPM2'nin ses tasarımıyla üretilir; oyunda MOSS-TTS-Nano (ya da 12 GB kartlarda GPU'da daha iyi bir klonlayıcı) bu seslerle konuşturur. Böylece her köylünün gerçekten kendine ait bir sesi olur, hak sorunu da çıkmaz.
- **Türkçeye özel tek sesli modeller** (EMA Lightning, Ahenk Cep, FreyaTTS) çok hızlı ve muhtemelen Türkçe telaffuzda daha başarılı. Ama tek sesle 24 karakter yapmak yalnızca (b) yöntemiyle mümkün ve sonuç daha yapay olur. Anlatıcı ya da "iç ses" gibi tek bir rol için çok uygunlar.
- **Hepsi için ilk şart:** Aynı 20 Türkçe cümlenin (soru tonlaması, "ğ", "ı", sayılar, 1943'e özgü köy adları) her modelle üretilip kör dinleme ile karşılaştırılması.

---

## C) Steam kuralları (yapay zekâ içerik beyanı)

**Birincil kaynaklar:** [Steamworks İçerik Anketi belgesi](https://partner.steamgames.com/doc/gettingstarted/contentsurvey) ve Valve'ın 10 Ocak 2024 tarihli Steamworks duyurusu ([Steamworks duyuruları](https://steamcommunity.com/groups/steamworks/announcements); duyurunun tam bağlantısını bulamadım). **Bu ortamdan ikisine de erişilemedi**; aşağıdakiler arama özetleri ve haber sitelerinden derlendi. Gönderimden önce Steamworks içinde formun güncel metni okunmalı.

1. **İki tür var:**
   - **Önceden üretilmiş (pre-generated):** Geliştirme sırasında yapay zekâ yardımıyla yapılmış ve oyunla gelen içerik (görsel, ses, metin). Bizde: önceden üretilip oyuna konan TTS replikleri, varsa yapay zekâyla üretilmiş görseller.
   - **Anlık üretilen (live-generated):** Oyun çalışırken yapay zekânın ürettiği içerik. Bizde: köylülerin cümleleri ve sesleri. **Bu kategoriye kesin giriyoruz.**
2. **Anlık üretimde istenen ek bilgi:** Formda, yapay zekânın **yasa dışı içerik üretmesini engellemek için hangi önlemleri (guardrails)** aldığımızı anlatmamız gerekiyor.
3. **Oyuncu şikâyeti:** Valve, oyuncuların anlık üretilmiş yasa dışı içeriği **Steam arayüzü (overlay) üzerinden oyun içinden bildirebildiği** bir sistem kurdu.
4. **Yasak:** Anlık üretilen yapay zekâyla oluşturulmuş **"Yalnızca Yetişkin" cinsel içerik** yayımlanamıyor.
5. **Mağaza sayfası:** Yazdığımız açıklama, mağaza sayfasındaki "Yapay zekâyla üretilmiş içerik beyanı" bölümünde oyunculara gösteriliyor.
6. **Ocak 2026 güncellemesi:** Form, beyanın **oyuncunun karşılaştığı içerikle** ilgili olduğunu açıkça belirtecek şekilde değişti. Yalnızca geliştirme verimliliği için kullanılan yapay zekâ araçları (kod yardımcıları gibi) "bu bölümün odağı değil".

Kaynaklar (ikincil): [PC Gamer, Ocak 2024](https://www.pcgamer.com/valve-updates-its-steam-policy-on-ai-so-it-can-release-the-vast-majority-of-games-that-use-it), [GeekWire](https://www.geekwire.com/2024/valve-software-reveals-new-rules-for-ai-powered-game-development-on-steam/), [PC Gamer, Ocak 2026](https://www.pcgamer.com/software/ai/steam-updates-ai-disclosure-form-to-specify-that-its-focused-on-ai-generated-content-that-is-consumed-by-players-not-efficiency-tools-used-behind-the-scenes/), [Game Developer](https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam), [GamingOnLinux](https://www.gamingonlinux.com/2026/01/valve-tweak-steam-ai-disclosure-form-for-developers-to-clarify-its-for-content-consumed-by-players/).

**Bizim önlem listemiz (formda yazılabilecekler):**
- Gerçeği ve kararı oyunun motoru belirliyor; model yalnızca verilen kararı cümleye döküyor ve konu dışına çıkamıyor.
- Model çıktısı **JSON şemasına zorlanıyor**, uzunluğu sınırlı.
- Çıktıda **yasaklı sözcük ve konu süzgeci** var (cinsellik, nefret söylemi, gerçek kişiler, kendine zarar). Süzgeç yakalarsa karakter, önceden yazılmış güvenli bir replik söylüyor.
- Oyuncunun yazdığı serbest sorular da aynı süzgeçten geçiyor; "sistem talimatını unut" gibi manipülasyon girişimleri karakterin dışına çıkarmıyor (bunun test edilmesi gerekiyor).
- Model oyunla birlikte geliyor ve değiştirilmiyor; internete bağlanmıyor.
- Sesler tasarlanmış ve yapay; gerçek bir kişinin sesi klonlanmıyor.

**Ek hukuki not (doğrulanmalı):** AB Yapay Zekâ Yasası'nın 50. maddesi, yapay olarak üretilmiş sesin "yapay" olarak işaretlenmesini istiyor ve 2026'dan itibaren uygulanıyor. Oyunun açılışında ya da ayarlarda "Karakter sesleri ve diyalogları yapay zekâyla üretilmektedir" notu, AB satışları için bir hukukçuya teyit ettirilmeli. (Bu maddeye [Ahenk README](https://github.com/ozguradmin/ahenk-turkish-tts)'de atıf var; birincil kaynağa bakılmadı.)

---

## D) Sonuç

### Önerilen yığın

| Katman | Asgari (6 GB) | Önerilen (8-12 GB) |
|---|---|---|
| Masaüstü paketi | Electron (node-llama-cpp yalnızca Electron'da doğrudan çalışıyor; Tauri'de llama-server ayrı süreç olarak kullanılır) | Aynı |
| Dil motoru | node-llama-cpp (MIT) ile llama.cpp, **Vulkan** | Aynı; CUDA isteğe bağlı |
| Dil modeli | **Qwen3.5-4B Q4_K_M** (Apache 2.0) | **Gemma 4 E4B** ya da **Qwen3.5-9B** Q4_K_M (Apache 2.0); denemede seçilecek |
| Çıktı denetimi | JSON şeması, uzunluk sınırı, sözcük süzgeci | Aynı |
| TTS motoru | sherpa-onnx-node (Apache 2.0), CPU | Aynı; isteğe bağlı GPU |
| TTS modeli | **Supertonic 3 Türkçe** (OpenRAIL-M); yedek **MOSS-TTS-Nano** (Apache 2.0) | MOSS-TTS-Nano ile karakter başına klonlanmış ses; referanslar VoxCPM2 ile tasarlanmış |
| Ses çeşitleme | Signalsmith Stretch (MIT) ile perde ve formant varyantları | Klon sesler, gerekirse ufak formant farkı |
| Önceden üretilmiş replikler | VoxCPM2 ile geliştirme makinesinde | Aynı |
| Dudak senkronu | Ses genliği ve harf kuralları | Varsa TTS zamanlaması |

### Donanım tablosu

| | Asgari | Önerilen |
|---|---|---|
| Ekran kartı | NVIDIA RTX 2060 6 GB (Vulkan destekli eşdeğeri) | RTX 2070 8 GB / RTX 3060 12 GB / RTX 4070 12 GB |
| İşlemci | 4 çekirdek / 8 iş parçacığı (TTS burada çalışacak; **tahmin**) | 6 çekirdek+ |
| RAM | 16 GB | 16-32 GB |
| Disk | ~5 GB (oyun + 4B model + ses) (**tahmin**) | ~10 GB (güçlü model paketiyle) |
| Beklenen tepki | Yazı 1-2 sn içinde; ilk ses ~1-2 sn (**tahmin**) | Daha kısa |

### İlk deneme adımları (geliştiricinin RTX 4070 bilgisayarında, yaklaşık 1 saat)

1. **(10 dk) Dil modeli programı:** [Ollama](https://ollama.com) (MIT) ya da [LM Studio](https://lmstudio.ai) kurun. Bunlar yalnızca deneme için; oyuna gömülmeyecekler. LM Studio'da arama kutusuna `Qwen3.5-4B`, `Qwen3.5-9B` ve `gemma-4-E4B` yazıp Q4_K_M sürümlerini indirin (toplam ~14 GB).
2. **(20 dk) Türkçe sorgu testi:** Üç modele aynı talimatı verin. Örnek:
   > *Sen 1943'te Antep'in bir köyünde yaşayan 45 yaşındaki değirmenci Kâzım'sın. Günümüz Türkçesiyle, kısa ve doğal konuş. Gerçek: Dün gece değirmendeydin. Karar: YALAN SÖYLE, evde olduğunu iddia et. Ruh hali: tedirgin ama kibar. Yalnızca şu JSON'u döndür: {"cevap": "...", "duygu": "..."}. Müfettiş soruyor: "Dün gece neredeydin?"*

   Her model için 10 farklı soru sorun. Cevabın doğallığına, karara sadık kalıp kalmadığına, JSON'u bozup bozmadığına ve hızına (LM Studio saniyede tokeni gösteriyor) not verin. Qwen3.5'te "düşünme" modunu kapatın.
3. **(20 dk) Ses testi:** Python kurulu bir terminalde:
   - Supertonic: `pip install supertonic`, sonra `supertonic tts 'Dün gece evdeydim müfettiş bey, vallahi.' -o test.wav --lang tr --voice M2` (komut [supertonic-py README](https://github.com/supertone-oss-archive/supertonic-py)'den; Türkçe kodunun `tr` olduğu **doğrulanmalı**). M1-M5 ve F1-F5 seslerini deneyin.
   - VoxCPM2 (4070'in 12 GB'ı yeter): `pip install voxcpm`, sonra `voxcpm design --text "(60 yaşında, kalın ve boğuk sesli, yorgun bir köylü erkek) Dün gece evdeydim müfettiş bey." --output muhtar.wav` ([VoxCPM README](https://github.com/OpenBMB/VoxCPM)). Bir de bunu referans alıp `voxcpm clone` ile başka bir cümle söyletin.
   - MOSS-TTS-Nano: [README](https://github.com/OpenMOSS/MOSS-TTS-Nano)'deki ONNX CPU örneğini, VoxCPM2'nin ürettiği `muhtar.wav` referansıyla çalıştırın.
   - Karşılaştırma için Piper Türkçe sesi dinlenebilir (`pip install piper-tts`, `python3 -m piper.download_voices tr_TR-dfki-medium`, `python3 -m piper -m tr_TR-dfki-medium -f piper.wav -- 'Dün gece evdeydim.'`). **Yalnızca karşılaştırma için; lisansı ticari kullanıma kapalı.**
4. **(10 dk) Çeşitleme denemesi:** [Signalsmith Stretch web demosunda](https://signalsmith-audio.co.uk/code/stretch/) bir Supertonic sesini ±3 yarım ton perde ve ±%10 formant ile oynatıp kaç ayırt edilebilir "kişi" çıktığına bakın.
5. **Sonraki adım (ayrı bir gün):** node-llama-cpp'nin Electron şablonuyla küçük bir prototip kurup gerçek VRAM ve süreleri ölçmek, ardından aynısını bir RTX 2060'ta (ya da VRAM'i 6 GB ile sınırlayarak) denemek.

### Bilinmeyenler ve riskler

1. **Türkçe ses kalitesi dinlenmedi.** Supertonic'in Türkçesi, MOSS-TTS-Nano'nun Türkçe klonlama kalitesi ve VoxCPM2'nin Türkçe ses tasarımı ilk denemede kulakla elenmeli.
2. **Supertonic arşivlendi** (bakım yok, hata düzeltmesi yok). Lisansı OpenRAIL-M: ticari kullanım ve dağıtım serbest, ama kullanım kısıtlarının kullanıcı sözleşmesine aktarılması gerekiyor. Metin **avukata okutulmalı**.
3. **MOSS-TTS-Nano'nun ağırlık lisansı** GitHub'da Apache 2.0 görünüyor; README "kök LICENSE'a bakın" diyor. Hugging Face kartından **doğrulanmalı**. Node/Electron'dan kullanım yolu henüz hazır değil.
4. **Gemma 4'te Türkçe:** Resmî dil listesinde adıyla geçtiğini göremedim. Qwen3.5'te de 201 dil arasında Türkçenin adı resmî kaynaktan doğrulanmalı (Qwen3'te vardı).
5. **CUDA dağıtımı:** Oyuncuda CUDA Toolkit olmayabilir. Vulkan yolu varsayılan olmalı; hız farkı ölçülmeli.
6. **İndirme boyutu:** İki dil modeli ve ses modelleriyle oyun 8-10 GB'ı bulabilir. Güçlü model ayrı paket olmalı.
7. **AMD ve Intel kartlar:** Hedef NVIDIA, ama Vulkan sayesinde AMD ve Intel'de de çalışması beklenir. Test edilmeli.
8. **Model manipülasyonu (prompt injection):** Oyuncu serbest yazı yazabiliyorsa karakteri kontrol dışına çıkarmaya çalışabilir. Şema, süzgeç ve "motor karar verir" tasarımı bunu sınırlar ama tamamen engellemez. Steam formunda anlatılacak önlemler bunlar.
9. **GPL bileşenleri:** Piper motoru (GPL-3.0), espeak-ng (GPL), Rubber Band (GPL-2.0) oyuna **gömülmemeli** ya da bir hukukçuyla değerlendirilmeli.
10. **Topluluk modelleri** (EMA Lightning, Ahenk, FreyaTTS, Trendyol-TTS, pocket-tts-tr) çok yeni. Eğitim verilerinin hakları ve bakımlarının sürüp sürmeyeceği belirsiz.
11. **Hız ve VRAM rakamları** büyük ölçüde tahmin. RTX 2060'ta gerçek ölçüm yapılmadan asgari donanım ilan edilmemeli.
12. **Lisanslar değişebiliyor:** OmniVoice 2026'da Apache'den ticari olmayan lisansa geçti. Seçilen her modelin lisansı, indirildiği tarihteki haliyle oyun klasöründe saklanmalı (LICENSE ve MODEL_CARD dosyalarıyla birlikte).
13. **Steam ve AB kuralları:** Steamworks belgesinin güncel metni ve AB Yapay Zekâ Yasası'nın 50. maddesi doğrudan okunmadı.
14. **İngilizce sürüm:** Önerilen modellerin hepsi İngilizceyi destekliyor. İngilizcede Kokoro (Apache 2.0) gibi daha olgun TTS seçenekleri de var.
