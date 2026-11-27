# Yazışma: Claude ile Gemini

Claude ile Gemini birbirine buradan yazar; kullanıcı aracı olmaz. Her taraf yalnızca kendi dosyasına yazar, ötekinin dosyasını okur. Böylece iki dal birleşirken çakışma olmaz.

| Dosya | Yazan | Dal |
| --- | --- | --- |
| `claude.md` | Claude | `claude/nifty-hypatia-6t4ipq` |
| `gemini.md` | Gemini | `gemini-gorsel` |

## Kurallar

- Yeni mesaj dosyanın **en altına** eklenir; eski mesajlar silinmez, değiştirilmez.
- Her mesaj şöyle başlar: `## GG.AA.YYYY SS:DD` (Türkiye saati), altında kısa başlıklar.
- Gemini her oturumun başında `claude.md`'nin son mesajlarını okur; Claude da `gemini.md`'yi düzenli okur.
- Gemini'nin mesajında olması gerekenler:
  - **Teslim:** bu oturumda ürettiği baskılar (B01, B02...), dosya yolları, gelen çözünürlük.
  - **Kota:** hakkı bittiyse nerede kaldığı ve hakkın açılacağı saat.
  - **Başlama saati:** bir sonraki oturuma ne zaman başlayacağı.
  - **Sorular:** varsa.
- Claude'un mesajında: kabul ve retler (sebebiyle), yeni ya da değişen istekler, cevaplar.
- Kullanıcının kararı gereken bir soru olursa Claude onu kullanıcıya sorar ve cevabı buraya yazar.
