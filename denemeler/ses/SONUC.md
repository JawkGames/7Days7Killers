# Görev 2 — Yerel Türkçe Ses (TTS) Deneme Sonuçları

**Ortam:** Windows 11, CPU + NVIDIA GeForce RTX 4070 (12 GB VRAM), tüm kayıtlar `128 kbps .mp3`.  
**Denenen 6 cümle:** `gorsel-istekleri/08-yerel-yz-ve-ses.md` içindeki 1–6 numaralı cümleler.

## Karşılaştırma Tablosu

| Model | Donanım | Kayıt Sayısı | 1 Cümle Üretim Süresi (Ort.) | Ses Süresi (Ort.) | RTF | Bellek (RAM / VRAM) | Lisans (Ticari Kullanım) | Türkçe Telaffuz Notu | En İyi 2 Kayıt Yolu |
|---|---|---:|---:|---:|---:|---|---|---|---|
| **VoxCPM2** (`openbmb/VoxCPM2`) | GPU (RTX 4070, bf16) | 24 (4 karakter × 6) | **6.25 sn** (4.9–7.6 sn) | 3.71 sn | 1.686 | **5460 MB VRAM** (~5.3 GB) | **Apache-2.0** (ticari kullanıma açık) | **Mükemmel (9.5/10).** `ş, ğ, ı, ü, ç, ö` tamamen anadil düzeyinde. Ses tarifiyle (`yaşlı erkek`, `genç kadın`, `yaşlı kadın`, `otoriter erkek`) gerçekten yaş, tonlama, nefes ve çekingenlik/otorite farkı üretiyor. Robotik değil, oyun seslendirmesi için en doğal seçenek. (Not: RTF > 1 olduğu için canlı akış yerine kısa cümlede ön-üretim/önbellek veya `inference_timesteps` düşürme gerekir.) | `denemeler/ses/voxcpm2/yasli-erkek-2.mp3`<br>`denemeler/ses/voxcpm2/genc-kadin-1.mp3` |
| **Supertonic 3** (`supertonic==1.3.1`, ONNX) | CPU (ONNX) | 60 (10 ses `F1..F5, M1..M5` × 6) | **1.025 sn** | 4.06 sn | **0.252** | **555 MB RAM** / **0 MB VRAM** | **OpenRAIL-M** (ağırlıklar) / **MIT** (kod) — ticari kullanıma açık | **Çok iyi (8.5/10).** `ş, ğ, ı, ü, ç, ö` hatasız (`Ağa'nın` → yumuşak `ğ` doğru). CPU'da gerçek zamanın 4 katı hızlı, sıfır VRAM! Tek eksiği seslerin haber spikeri/stüdyo tonunda kalması; yaşlı/köylü karakter dokusu VoxCPM2 kadar dramatik değil. | `denemeler/ses/supertonic-3/m5-6.mp3`<br>`denemeler/ses/supertonic-3/f4-4.mp3` |
| **MOSS-TTS-Nano** (`MOSS-TTS-Nano-100M-ONNX`) | CPU (ONNX, 4 iş parçacığı) | 6 (varsayılan `Junhao` × 6) | **3.15 sn** (ısınma sonrası ~2.4 sn) | 4.83 sn | **0.652** | **2498 MB RAM** / **0 MB VRAM** | **Apache-2.0** (ticari kullanıma açık) | **Zayıf (4.5/10).** Varsayılan ses (`Junhao`) belirgin yabancı/Çince-İngilizce aksanla okuyor (`Müfettiş` → `Müfetiç`, `Çocuklarım aç` → `Çukıklarım aç`), cümle içi uzun doğal olmayan duraksamalar ve hafif boğuk/robotik tını var. | `denemeler/ses/moss-tts-nano/varsayilan-2.mp3`<br>`denemeler/ses/moss-tts-nano/varsayilan-4.mp3` |

## Ek Notlar

- **Kokoro:** Resmî Türkçe dil desteği olmadığı için denenmedi.
- **Lisans engeli olanlar:** `08-yerel-yz-ve-ses.md` kuralı gereği Piper TR, Coqui XTTS v2, F5-TTS, Meta MMS-TTS ve OmniVoice denenmedi.
- **Öneri (Oyun Mimarisi İçin):**
  - **Canlı / düşük VRAM bütçesi (LLM + TTS birlikte çalışırken):** **`Supertonic 3`** — 0 MB VRAM, 555 MB RAM, 1.0 sn CPU üretim süresi ve tertemiz Türkçe ile `Gemma 4 E4B` (6.0 GB VRAM) yanında hiç ekran kartı paylaşmadan anlık çalışır.
  - **Karakter çeşitliliği / en yüksek oyunculuk kalitesi:** **`VoxCPM2`** — 1943 Anadolu köyü karakterleri için (`yasli-erkek`, `genc-kadin`, `yasli-kadin`, `otoriter-erkek`) açık ara en etkileyici ve duygulu ses. Ancak 5.3 GB VRAM + ~6 sn/cümle istediği için `Gemma 4 E4B` (6.0 GB VRAM) ile 8–12 GB kartlarda aynı anda bellekte tutmak sıkışık olur; sabit kalıp cümleleri önceden üretip (offline) gömmek veya 12+ GB kartlarda sırayla kullanmak en sağlıklı yoldur.
