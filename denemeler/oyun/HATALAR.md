# Görev 3 — Oyun ve Yerel YZ Hata Raporu

**Kontrol ortamı:** Windows 11, Node.js, LM Studio `0.4.29` (`http://localhost:1234`), `Gemma 4 E4B` / `Qwen3.5-4B` / `Qwen3.5-9B`, `npm run test` (`22/22` dosya, `620/620` test geçti), `npm run build` (`vite build` 941 ms, hatasız).  
*Not: Kullanıcı çalışma kuralı gereği tarayıcı ekran görüntüsü alınmadı; oyun motoru, yapay zekâ arka ucu ve CLI araçları doğrudan gerçek yerel sunucuyla çalıştırılarak doğrulandı.*

| Sıra | Ne yapıldı | Ne oldu | Ne bekleniyordu | Etki / Kaynak |
|---:|---|---|---|---|
| 1 | LM Studio `0.4.29` üzerinde `Gemma 4 E4B`, `Qwen3.5-4B` veya `Qwen3.5-9B` yüklüyken oyun / `yz-dene.js` yerel sunucuya bağlandı. | Tüm istekler `reddedildi: denetim: cevap yok` döndü (`0/16` geçti). LM Studio `chat_template_kwargs: { enable_thinking: false }` alanını yok saydığı için modeller tüm `max_tokens: 220` bütçesini `reasoning_content` alanına harcayıp boş `content: ""` döndürdü. | Düşünme modu kapanıp cevabın doğrudan `content` içinde JSON olarak dönmesi. İstek gövdesine **`reasoning_effort: "none"`** eklendiğinde tüm modeller %94–%100 geçmeye başladı. | **Kritik** — `src/yz/arka-uc.js:46` |
| 2 | Windows üzerinde `node araclar/yz-dene.js --adres http://localhost:1234 --tohum 77 --n 20` çalıştırıldı. | `ENOENT: no such file or directory, scandir 'C:\C:\Users\...'` hatasıyla anında çöktü. | Aracın Windows'ta da çalışması. `new URL('..', import.meta.url).pathname` Windows'ta başına `/` eklediği için (`fileURLToPath` kullanılmalı) yol bozuluyor. | **Yüksek** — `araclar/yz-dene.js:32` |
| 3 | `Qwen3.5-9B` ile `tohum=77` sorgusunda model `"Dün gece"` ifadesini düşürdüğü için denetim reddetti (`0.48 sn`). | `yz-dene.js` çıktısında `zaman aşımı → kalıp (0.48 sn)` yazdı ve `sayac.zaman` sayacını artırdı. | `reddedildi: denetim: zaman ...` olarak raporlanması. `araclar/yz-dene.js:67` satırındaki `/zaman/.test(r.neden)` regex'i `"zaman aşımı"` yerine denetimin `"zaman"` kelimesi geçen ret gerekçesini yakalıyor (`/zaman aşım/i` olmalı). | **Orta** — `araclar/yz-dene.js:67` |
| 4 | Serbest soruda eşleşmeyen soru (`"Hacı Ağa'yı sevmez miydin"`) için `yz.kacamak()` çağrıldı (`Gemma 4 E4B` ve `Qwen3.5-4B`). | İki farklı model de karakter cevabı olarak tek kelimelik **`"Rahatsın."`** döndürdü (istemdeki talimatı birebir kopyaladı). | Köylü ağzıyla doğal, bilgi vermeyen kaçamak bir cümle (`"Beyim, ben öyle şeylere karışmam."` gibi). `src/yz/istem.js:142` satırındaki `'Nasıl söyleyeceksin: Rahatsın.'` ifadesi küçük modellerde talimat sızıntısına yol açıyor (`Tavır: sakin ve rahat ol.` gibi ayrıştırılmalı). | **Orta** — `src/yz/istem.js:37,142` |
| 5 | `Qwen3.5-4B` ve `Qwen3.5-9B` açılış selamları ve bazı cevapları döndürdü. | Model cevabı JSON içine ekstra çift tırnak koyarak döndürdü (`"Selamünaleyküm, beyim. Buyurun, sorun."` → çıktı metninde tırnaklar kaldı). | `cevapAyikla` JSON alanını çıkardıktan sonra dıştaki gereksiz tırnakları temizlemeli (`src/yz/arka-uc.js:85` yalnızca JSON parse başarısız olunca 87. satırda tırnak siliyor). | **Düşük** — `src/yz/arka-uc.js:85-87` |

## Çalışan / Sorunsuz Kısımlar

- `npm run test`: 22 test dosyasının tamamı (`620/620` test) Windows'ta hatasız geçti.
- `npm run build`: `vite build` 941 ms içinde hatasız tamamlandı.
- `reasoning_effort: "none"` ile `Gemma 4 E4B` ve `Qwen3.5-9B` sorgu akışında `0.56–0.61 sn` yanıt hızı verdi; `yzKur` önbelleği, soru eşleme (`soruEsle`) ve denetim (`cevapDenetle`) beklendiği gibi çalıştı.
