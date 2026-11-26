# 7 Days 7 Killers: Oyun Planı

Çalışma adı "Kasabanın Kaderi" idi. Görünen ad **7 Days 7 Killers**, depo ve paket adı `7Days7Killers`.

## Özet ve kararlar

İlk iş olay üretim motoru; çizime ondan sonra geçilir. Oyunun her şeyi bu motora bağlı: motor çözülebilir ve ilginç vakalar üretmiyorsa en iyi çizim de oyunu kurtarmaz.

Oyun her açılışta kasabada yeni bir olaylar dizisi üretir. Oyuncu olay yeri fotoğrafları ve sorgularla gerçeği arar. Hikâye elle yazılmaz: kasaba simüle edilir, metin simülasyondan çıkar.

- **Kasaba halkı sabit:** aynı 20-25 kişi, her oyunda yalnızca roller ve olaylar değişir.
- **Görsel dil:** `prototip/sorgu-odasi` içindeki kodla çizim tekniği. Her sahne ve her karakter aynı teknikle çizilir.
- **Platform:** PC ve telefon, tek kod tabanı.
- **Süre:** kalite öncelikli, takvim baskısı yok.

## Oyun döngüsü

Bir gün beş adımdan oluşur; yedinci günün sonunda tek bir karar verilir.

1. **Gün başı:** o güne kadar işlenen cinayetlerin olay yeri fotoğrafları masaya gelir.
2. **Fotoğraf inceleme:** fotoğrafta dokunulabilir izler vardır (yerdeki kırmızı ip gibi). Bulunan her iz deftere yazılır.
3. **Çağırma:** günde sınırlı sayıda kişi sorguya çağrılır. Kişi kapıdan girer, sandalyeye oturur.
4. **Sorgu:** soru seçenekleri defterdeki bilgilerden doğar. Cevaplar yeni bilgi, çelişki ya da yalan getirir.
5. **Gün sonu:** gece yeni cinayetler işlenir, kasabanın çizelgesi ilerler.

Yedinci gün iki seçenek vardır: **REWIND TIME** (birinci güne dön) ya da **FINAL VERDICT** (katil olduğuna inandığın 7 kişiyi seç). Oyuncuya kaç katili doğru bulduğu hiçbir aşamada söylenmez.

Rewind'de kasaba aynı tohumla baştan başlar; oyuncuda yalnızca defteri kalır. Oyuncu farklı davranırsa olaylar kurala bağlı değişir: kurbanı korursan katil başkasına yönelir.

Zaman yolculuğu korku kaynağı değil, dedektiflik mekaniğidir. Korku kasaba halkından, cinayetlerden, karanlık atmosferden ve yanlış kişiye güvenme ihtimalinden gelir. Oyuncunun en büyük düşmanı kendi yanlış çıkarımlarına duyduğu aşırı güvendir.

## Olay üretim sistemi

Motor önce gerçeği üretir, sonra o gerçeğin bıraktığı izleri ve söylenen yalanları. Oyuncunun gördüğü her şey bu gerçekten türer; bu yüzden vakalar tutarlıdır ve çözülebilir.

- **Tohum ve roller:** her oyun bir sayı alır. Bu sayıdan 7 katil seçilir; her birine sebep, yöntem, kurban, gün ve yer atanır. Katiller bağımsız değildir: ortaklık, birbirini örtme, şantaj.
- **Çizelge:** herkesin 7 gün boyunca hangi saat diliminde nerede olduğu hesaplanır. Cinayetler bu çizelgenin içinde gerçekleşir.
- **İzler:** her olay üç tür iz bırakır. Fiziksel iz fotoğrafta görünür, tanık izi birinin gördüğüdür, dolaylı iz sonradan fark edilir (yırtık kazak, eksik alet).
- **Yanıltıcı izler:** bazı izlerin masum bir açıklaması vardır. Kırmızı kazak ipi katile değil, olayı görüp saldırıya uğrayan ve kaçan tanığa aittir.
- **Yalan kuralları:** katil yalan söyler, onu seven korur, korkak susar, dedikoducu abartır, borçlu olan alacaklısını satışa çıkarmaz. Masumlar da gerilir; gerginlik tek başına kanıt değildir.
- **Olay çekirdekleri:** elle yazılmış 30-40 güçlü parça (yasak aşk, miras, eski yangın). Her oyunda birkaçı seçilip simülasyona karıştırılır. Bunlar olmadan her kasaba bir süre sonra aynı hissettirir.
- **Çözülebilirlik testi:** üretilen kasabayı kod kendi çözer. Her katile en az 2 bağımsız ipucu zinciri gitmeli, her yanıltıcı iz en az bir yolla çürütülebilmelidir. Geçemeyen kasaba atılır, yenisi üretilir.
- **Zorluk ölçümü:** çözücünün kaç adımda çözdüğü vakanın zorluğunu verir; çok kolay ve çok zor vakalar elenir.

## Olay yeri fotoğrafları ve ipucu zincirleri

Fotoğraftaki her iz simülasyondaki gerçek bir olaya bağlıdır; süs için sahte iz konmaz. Her fotoğraf, kodla çizilen bir mekân şablonu ile simülasyonun o mekâna yerleştirdiği nesnelerden oluşur.

| İz türü | Örnek | İlk akla gelen | Masum açıklama |
| --- | --- | --- | --- |
| Kişisel eşya | Yerde kırmızı kazak ipi | Kazağın sahibi katil | Tanıktı, saldırıya uğradı, kaçtı |
| Ayak izi | Çamurda çizme izi | Çizme giyen oradaydı | Sabah oradan geçmişti |
| Alet | Demirci çekici | Demirci yaptı | Çekiç iki gün önce çalınmıştı |
| Eksik nesne | Duvarda boş çivi | Bir şey alındı | Kurban kendi satmıştı |
| Zaman | 22:40'ta durmuş saat | Olay saati | Saat zaten bozuktu |

Kırmızı kazak zinciri şöyle işler: ip fotoğrafta bulunur, kırmızı kazaklı kişi çağrılır, "gördüm, bana da saldırdılar, kaçtım" der. Bu ifade başka bir tanıkla ya da ikinci bir izle doğrulanırsa oyuncu asıl katile bir adım yaklaşır; doğrulanamazsa şüphe sürer.

## Sorgu ve diyalog

Oyuncu serbest yazı yazmaz; soru seçenekleri defterinden üretilir. Yeni bir iz ya da ifade deftere girdikçe yeni sorular açılır.

- **Soru türleri:** yer ve zaman ("O gece neredeydin?"), iz gösterme ("Bu ip senin kazağından mı?"), yüzleştirme ("Demirci seni değirmende görmüş."), başkasını sorma.
- **Cevap:** simülasyondaki gerçek, kişinin yalan kuralı ve kişilik tonunun birleşimidir. Aynı bilgi korkak birinden kısa ve kaçamak, dedikoducudan uzun ve süslü çıkar.
- **Tepki:** yüz ifadesi, göz kaçırma, duraksama. Tepki ipucudur ama kanıt değildir.
- **Çelişki yakalama:** oyuncu defterde iki ifadeyi yan yana koyar; çelişiyorsa yeni bir yüzleştirme sorusu açılır.
- **Metin üretimi:** her bilgi türü için cümle kalıpları, her kişilik için ton varyantı. Kalıplar geliştirme sırasında yazılır, oyun çevrimdışı çalışır. Oyunun içinde canlı yapay zekâ kullanılmaz.
- **Sunum:** ağız hareketi ve harf harf alt yazı prototipteki mevcut sistemle; ses yok.

Oyun yanlış bir çıkarımı düzeltmez, deftere oyuncunun yazdığı gibi geçer.

## Sonlar ve kayıp sahneleri

Final Verdict'ten sonra üç bölüm sırayla oynar: kayıp sahneleri, pencere sahnesi, gerçeğin açıklanması. Her parça ayrı üretildiği için iki oyunun sonu aynı olmaz.

1. **Kayıp sahneleri:** seçilen 7 kişinin her biri için kısa bir sahne. Sahne kişiye özeldir.
    - Ailesi olan: ev, boş sandalye, yas tutan aile.
    - Kimsesiz: gece yattığı boş bank.
    - Kedilere bakan: barakada onu arayan, bulamayan kediler.
    - Kişi masumsa sahne ağırdır. Katilse aynı sahne farklı okunur: evde saklı bir kanıt görünür.
2. **Pencere sahnesi:** karakterimiz kadrajın solundaki pencereye yürür ve aşağı bakar.
    - Yedisi de doğruysa kalabalık coşkuyla karşılar.
    - Yanlışlar varsa kalabalık meşale ve tırpanla gelir, bağırır, cama bir şeyler atar.
    - Aradaki sonuçlarda kalabalık ikiye bölünür; oran doğru sayısına göre değişir.
3. **Gerçeğin açıklanması:** gerçek katiller gösterilir. Kaçan her katil için kasabanın akıbeti yazılır.

Her kasabalının kayıp sahnesi kişi verisinin parçasıdır: kişi tanımlanırken "kaybedilince ne olur" da tanımlanır.

## Görsel kurallar

Çizilemeyen şey kadrajla çözülür, kötü çizimle değil. Hiçbir sahnede falso görünen bir parça bırakılmaz. Ayrıntılar `NOTLAR.md` içinde.

**Teknik:** altta çamurlu boya lekeleri, üstte titrek mürekkep hatları ve tarama. Hatlar saniyede 7 kez hafifçe oynar. Renkler küflü yeşil, morluk moru ve kirli sarı; aydınlık tek bir kaynaktan gelir.

**Falso kuralları:**

1. Yürüyen bacak çizilmez. Alt gövde uzun paltoyla, masa ya da eşya arkasıyla ya da kadraj dışında bırakılarak gizlenir.
2. Uzaktaki figür karanlık silüettir; ayrıntı yaklaştıkça belirir.
3. Kalabalık sahnelerinde öndekiler uzun paltolu ve sabit duruşludur. Hareket kol, meşale ve baş salınımıyla verilir; ayaklar küçük ve hareketsiz kalır.
4. El yakından çizilmez. Denendi, yapay durdu.
5. Karakter kameraya göre çok yukarıdan inmez; ayaktayken de yüzü kadrajda kalır.
6. Her yeni sahne önce durağan karelerle kontrol edilir, sonra hareket eklenir.

**Karakter sistemi:** bütün karakterler tek bir iskelet üzerinde veriyle tanımlanır: yüz ölçüleri, saç, kıyafet, renk paleti, yaş izleri. Yeni karakter eklemek yeni çizim kodu yazmak değil, yeni bir veri dosyası yazmaktır. Göz kırpma, bakış, ağız hareketi, kapıdan giriş ve oturma hepsinde ortaktır.

## Teknik mimari ve klasör yapısı

Veri ile kod ayrı durur ve simülasyon çizimden bağımsızdır. Bu sayede vakalar ekransız, binlerce tohumla test edilir; içerik eklemek kod değiştirmeyi gerektirmez.

```
7Days7Killers/
  README.md            proje notları (kullanıcının)
  PLAN.md              bu belge
  NOTLAR.md            kararlar, görsel kurallar, denenip vazgeçilenler, kod notları
  index.html           oyunun sayfası (Vite girişi)
  prototip/
    sorgu-odasi/       tek dosyalık ilk prototip (yalnızca karşılaştırma için)
  src/
    ana.js             başlangıç
    cekirdek/          tohumlu rastgele, zaman, olay bildirimi, kayıt
    simulasyon/        kasaba, cizelge, cinayet, iz, yalan, cozucu
    icerik/
      kisiler/         kişi başına bir veri dosyası (kişilik, ilişki, sır, kayıp sahnesi, görünüş)
      mekanlar/        mekân başına bir veri dosyası
      olay-cekirdekleri/
    diyalog/           soru üretimi, cevap üretimi, defter
    cizim/
      teknik/          leke, tarama, titrek hat, kum, kararma
      rig/             yüz, saç, gövde, ağız, göz
      sahneler/        sorgu-odasi, olay-yeri, kayip, pencere
    arayuz/            alt yazı, defter, seçim ekranı, menü
    dil/               tr/, en/ (arayüz metinleri ve cümle kalıpları)
    platform/          girdi (imleç, dokunma, eğme), tam ekran, kayıt, reklam
  testler/             simülasyon ve çözücü testleri, tohum arşivi
  araclar/             vaka inceleyici: bir tohumun bütün gerçeğini gösteren geliştirici sayfası
  android/             Capacitor projesi (sonradan)
```

- **Aynı tohum, aynı kasaba:** rastgelelik tek bir tohumlu kaynaktan gelir. Bir hata bildirildiğinde tohum numarasıyla aynı vaka yeniden üretilir.
- **Metin koda gömülmez:** kod yalnızca anahtar bilir, cümle dil dosyasından gelir.
- **Ayarlar tek yerde:** günlük sorgu hakkı, katil sayısı, süreler tek bir ayar dosyasında.
- **Motor:** mevcut çizim kodu canvas üzerinde çalışıyor; hazır bir oyun motoru eklenmez. Paketleme Vite, Android için Capacitor.
- **Vaka inceleyici** erken yapılır: motorun ürettiği vakayı okuyup iyi mi kötü mü olduğunu görmenin tek yolu budur.

## Dil desteği ve ileriye dönük tasarım

Yeni dil, yeni karakter, yeni mekân ya da yeni olay eklemek yalnızca yeni dosya eklemek olmalı; var olan kod değişmemeli.

- **Arayüz metinleri:** anahtar ve karşılık olarak dil dosyasında.
- **Cümle kalıpları dil başına ayrı yazılır**, çevrilmez. Türkçede ek uyumu ("değirmen-de", "okul-da"), İngilizcede he/she ve artikeller kelime kelime çeviriyle bozulur. Her dilin kendi kalıp dosyası ve kendi ek kuralları olur.
- **İsimler ve yer adları veridir:** her dilde karşılığı ayrı tutulur.
- **Ağız hareketi tablosu dil başına:** harf-ağız şekli eşlemesi dile göre değişir.
- **Kayıt dosyası sürüm numaralı:** oyun güncellenince eski kayıtlar bozulmaz.
- **İçerik şeması doğrulanır:** eksik ya da hatalı bir kişi dosyası oyun açılmadan testte yakalanır.

İlk sürüm yalnızca Türkçe çıksa bile metinler ilk günden dil dosyasında tutulur; sonradan ayıklamak en pahalı iştir.

## Yol haritası

On aşama var; beşinci aşamanın sonunda oyun görselsiz olarak baştan sona oynanabilir olur. O sürüm sürükleyici değilse çizime geçilmez, önce motor düzeltilir.

1. **Depo ve iskelet (bitti).** Klasörler, test altyapısı, Sorgu Odası kodunun modüllere bölünmesi. Çıktı: aynı sahne `src/` altından çalışır.
2. **Köy halkı (taslak hazır, onay bekliyor: `KOY-HALKI.md`).** 20-25 kişi: kişilik, ilişkiler, sırlar, kayıp sahnesi. Çıktı: onaylanmış kişi listesi.
3. **Simülasyon motoru.** Çizelge, cinayet, iz, yalan. Çıktı: vaka inceleyicide okunabilen vakalar.
4. **Çözücü ve kalite eleği.** Çıktı: 1000 tohumdan kaçının geçtiği ve örnek vakalar.
5. **Diyalog ve defter.** Çıktı: yalnızca metinle, baştan sona oynanabilen oyun.
6. **Karakter iskeleti ve 20-25 karakterin çizimi.**
7. **Olay yeri fotoğraf sahneleri.**
8. **Sonlar.** Kayıp sahneleri, pencere sahnesi, gerçeğin açıklanması.
9. **Dil, ses, telefon uyumu, kayıt.**
10. **Denge, test, mağaza sürümü.**

İlk beş aşama oyunun riskini taşır; son beşi emek ister ama belirsizliği azdır.

## Karar bekleyen sorular

- [ ] Oyun dikey mi, yatay mı? Sorgu sahnesi ikisinde de çalışıyor; telefon için tek bir yön seçmek arayüzü sadeleştirir.
- [x] İlk sürümün dili: yalnızca Türkçe.
- [x] Yer ve zaman: Antep'in Sarıkuyu köyü, 1943.
- [x] Oyuncu: Samsun'dan gelen müfettiş.
- [ ] Günde kaç kişi sorguya çağrılabilir? Az olursa her seçim ağırlaşır, çok olursa Rewind'e gerek kalmaz.
- [ ] Final Verdict'te seçilen 7 kişiye ne olur? Kayıp sahnelerinin tonu buna bağlı.
- [ ] Oyun reklamlı mı, ücretli mi?
