// Türkçe cümle kalıpları. Sorguda verilen cevaplar buradan, src/diyalog/kalip.js ile üretilir.
//
// Yapı:  'bilgi-turu': { degiskenler:[...], genel:[...], <mizaç>:[...] }
//   - degiskenler: kalıpların kullanabileceği değerler; cumleKur() eksik olanı açık hatayla bildirir.
//   - genel: her mizacın son yedeği. Öteki anahtarlar src/icerik/kur.js MIZACLAR'dan olmalı.
//   - Bir mizacın listesi yoksa kalip.js MIZAC_YEDEGI zincirine bakılır (ofkeli → sert → genel).
// Ton: korkak kısa ve kaçamak, dedikoducu uzun ve süslü, sert kesik, öfkeli bağıran, gururlu
// tepeden, kurnaz soruyu geri çeviren, saf açık sözlü, sakin ağırbaşlı.
// Köylü müfettişe "beyim", "müfettiş bey" der; ağız hafif verilir, şive yazımı yapılmaz.
//
// Değerler (src/diyalog/cevap.js doldurur; ad ve ekler src/diyalog/adlar.js ile):
//   kim, sahip, diger: kisiAdi('Kör Halil')   kimler: "Kör Halil ve Hoca" (ek son ada gelir)
//   yer: mekanAdi('Su değirmeni') ya da konuşanın kendi evi için 'ev', konunun evi için 'evi' (iyelikli)
//   zaman: src/dil/tr/zaman.js'ten "dün gece", "evvelsi gece", "dün ikindi vakti"
//   esya: izin ya da eşyanın adı ('kırmızı yün ipi', 'sedef kakmalı çakmak')   ortu: 'aba', 'uzun palto'
//   ses: 'bir bağırtı', 'bir silah sesi'   iliski: hazır yan cümle ("Kör Halil'le aramız hiç iyi değildi")
// Yeni bilgi türü eklemek: buraya yeni bir anahtar yazmak yeter; kod değişmez.
// Müfettişin soru cümleleri dosyanın sonunda: SORU_KALIPLARI.
export default {
  'yer-zaman':{
    degiskenler:['yer','zaman'],
    genel:[
      '{zaman} {yer:de+dim}, beyim.',
      '{zaman} [ben |]{yer:de+dim}. [Soran olursa söylerler.|Bilen bilir.]',
      'Müfettiş bey, {zaman} {yer:de+dim}. Sorabilirsiniz.',
    ],
    korkak:[
      'Ben mi? {yer:de+dim}... herhalde.',
      '{yer:de+dim} beyim. [Başka bir şey bilmem.|Ne olduysa bilmem.]',
      '{zaman:mi}? {yer:de+dim}... Vallahi öyle.',
    ],
    dedikoducu:[
      'Aman müfettiş bey, {zaman} ben nerede olacağım, {yer:de+dim} tabii! Bütün köy bilir, kime sorsanız söyler. [Hem orada kimin kimle konuştuğunu da gördüm ya, neyse.|Gerçi orada görmediğim kalmadı ya, o başka hikâye.]',
      '{zaman:mi}? Ah beyim, ben {yer:de+dim}, gözüm de kulağım da açıktı. Kim gelmiş, kim gitmiş, hepsini anlatırım, yeter ki siz sorun.',
      'Beyim, ben {zaman} {yer:de+dim}. Lafı uzatmayayım ama orası hiç de sessiz değildi; bir gelen, bir giden, bir fısıldaşan...',
    ],
    sert:[
      '{yer:de+dim}. Başka?',
      '{zaman} {yer:de+dim}. Yaz deftere.',
      '{yer:de}. Sabaha kadar.',
    ],
    ofkeli:[
      '{yer:de+dim} dedim ya! Kaç kere soracaksınız?',
      'Bunu bana mı soruyorsunuz? {zaman} {yer:de+dim}, işte o kadar!',
      '{yer:de+dim}! Bunu bana sormak da neyin nesi, müfettiş bey?',
    ],
    gururlu:[
      'Ben {zaman} {yer:de+dim}. Benim sözüm bu köyde senet yerine geçer.',
      '{yer:de+dim}, müfettiş bey. Benim gibisine bu sorulmaz ama cevap vereyim.',
      '{zaman} {yer:de+dim}. Hesabımı kimseye vermem, size veriyorum.',
    ],
    kurnaz:[
      '{zaman:mi}? Dur bakayım... {yer:de+dim} galiba. Siz kimden duydunuz, önce onu söyleyin.',
      '{yer:de+dim} beyim. Ama bunu bana niye soruyorsunuz, onu merak ettim.',
      'Hatırladığım kadarıyla {yer:de+dim}. Gerisini bilen başkaları vardır.',
    ],
    saf:[
      '{zaman} {yer:de+dim} beyim. Ne oldu ki?',
      'Ben {yer:de+dim}. Yanlış bir şey mi yaptım?',
      '{yer:de+dim}, sonra uyudum. Başka bir şey yapmadım ki.',
    ],
  },

  'gordum':{
    degiskenler:['kim','yer','zaman'],
    genel:[
      '{zaman} {kim:i} {yer:den} çıkarken gördüm.',
      '{kim:i} gördüm, beyim. {zaman} {yer:e} doğru gidiyordu.',
      '{zaman} {yer:de} {kim:i} gördüm, yalan yok.',
    ],
    korkak:[
      '{kim}... {yer:de} gibiydi. Ben bir şey demedim ama.',
      'Gördüm galiba... {kim:i}. Benden duydunuz demeyin beyim.',
      '{yer:de}... biri vardı. {kim} herhalde. Bilmem.',
    ],
    dedikoducu:[
      'Aman beyim, ben söylemeyeceğim de kim söyleyecek! {zaman} {kim:i} {yer:den} çıkarken gördüm, şu gözlerimle! Hem de etrafına bakına bakına, biri görecek diye korkuyormuş gibi. Ben hemen anladım, bunda bir iş var.',
      '{kim:mi}? Ah, sormayın müfettiş bey. {zaman} {yer:e} gitti, epey de kaldı. Köyde herkes bilir ama kimse söylemez; ben söylerim.',
      'Beyim, size bir şey diyeyim mi? {zaman} {kim:i} {yer:de} gördüm. [Hiç oralarda işi olmaz onun!|Ne işi var oralarda, değil mi?] Ben de kendi kendime dedim ki, bunda bir iş var.',
    ],
    sert:[
      '{kim:i} gördüm. {yer:de}.',
      '{kim}. {yer:den} çıktı. O kadar.',
      'Gördüm. {kim}. {zaman}.',
    ],
    ofkeli:[
      '{kim:i} gördüm, evet! {yer:den} çıkıyordu. Ben laf uydurmam!',
      '{zaman} {kim} {yer:de+di}! Gidin onu sorgulayın, beni değil!',
      'Kaç kere söyleyeceğim? {kim}, {yer:de}! Gözümle gördüm!',
    ],
    kurnaz:[
      'Görmesine gördüm ya... {kim:i}, {yer:e} yakın bir yerde. Ama ben söyledim demeyin, köy küçük.',
      '{kim:in} {zaman} {yer:de} ne işi vardı, bir de onu sorun bakalım.',
      'Siz {kim:i} bir sorun hele. {zaman} {yer:den} çıkanı ben gördüm, o da beni gördü.',
    ],
    saf:[
      '{kim:i} gördüm! {yer:den} çıkıyordu. Selam verdim, almadı.',
      '{zaman} {kim} {yer:de+di}. Ben de oradan geçiyordum.',
      'Gördüm ya, {kim:i}! {yer:e} gidiyordu. Kötü bir şey mi var?',
    ],
  },

  'inkar':{
    degiskenler:['yer'],
    genel:[
      'Ben {yer:de} değildim, beyim.',
      '{yer:e} hiç uğramadım. Kim dediyse yanlış demiş.',
      'Yok müfettiş bey, {yer:de} değildim.',
    ],
    korkak:[
      'Ben mi? Yok... {yer:de} değildim. Vallahi.',
      'Değildim beyim... {yer:e} gitmedim ki.',
      'Yok, yok... ben oralarda yoktum.',
    ],
    dedikoducu:[
      'Ben mi {yer:de}? Aman beyim, kim uyduruyor bunları! O gece ben {yer:e} adımımı atmadım. Asıl siz kimin gittiğini sorun; ben size söylerim ama benden duymuş olmayın.',
      'Tövbe tövbe! {yer:de} ne işim olur benim? Bu köyde dil uzundur beyim; biri bir şey görse on kişi duyar, on kişi duysa yüz türlü anlatır.',
      'Yok canım, ben {yer:de} değildim. Ama {yer:de} kim vardı, onu bilmek isterseniz onu da bilirim ha.',
    ],
    sert:[
      'Değildim.',
      '{yer:de} değildim. Bitti.',
      'Yalan. {yer:e} gitmedim.',
    ],
    ofkeli:[
      '{yer:de} değildim! Kim dediyse karşıma getirin!',
      '{yer:mi}? Gitmedim dedim, anlamıyor musunuz?',
    ],
    gururlu:[
      'Benim {yer:de} ne işim olur? Bunu bana sormanız bile ağır.',
      '{yer:de} değildim. Benim sözüme kimse yalan diyemez.',
    ],
    kurnaz:[
      '{yer:mi}? Yok beyim. Ama bunu size kim söyledi, bir de onu düşünün.',
      'Ben {yer:e} gitmedim. Gidenleri merak ediyorsanız başka kapı çalın.',
    ],
  },

  'susma':{
    degiskenler:['kim'],
    genel:[
      '{kim} hakkında bir şey diyemem.',
      'Bu işi bana sormayın, beyim.',
      'Söyleyecek bir şeyim yok.',
    ],
    korkak:[
      'Bilmem... bilmem beyim.',
      'Ne desem... yok. Bir şey demeyeyim.',
      '{kim:i} sormayın bana... Ne olur.',
    ],
    dedikoducu:[
      'Ah, {kim}... Onun hakkında anlatacak çok şey var ama bugün dilimi tutayım beyim, sonra başıma iş açılır. Siz başkasına sorun; yine de bana gelirsiniz, görürsünüz.',
      '{kim:mi}? Sormayın beyim, sormayın. Ağzımı açarsam köyde taş üstünde taş kalmaz. Şimdilik susayım, hele bir düşüneyim.',
      'Herkes bir şey bilir {kim} hakkında, ben de bilirim. Ama her bildiğini söyleyenin başı ağrır, beyim.',
    ],
    sert:[
      'Bilmem.',
      'Sormayın.',
      '{kim:i} bana sormayın.',
    ],
    ofkeli:[
      'Ne diye durmadan {kim:i} soruyorsunuz? Bir şey demem!',
      'Ağzımdan laf alamazsınız, boşuna uğraşmayın!',
    ],
    gururlu:[
      'Başkasının işini konuşmak bana yakışmaz.',
      '{kim:in} hesabını {kim} verir, ben vermem.',
    ],
    sakin:[
      'Bunu Allah bilir, ben söyleyemem.',
      'Her sözün bir vakti var, beyim. Bu sözün vakti değil.',
      '{kim} için bir şey diyemem. Sabredin.',
    ],
  },

  'esya-tanima':{
    degiskenler:['esya','sahip'],
    genel:[
      'Bu {sahip:in} {esya:si}, beyim.',
      'Tanıdım. {sahip:in} {esya:si} bu.',
      'Bunu bilirim, {sahip:in} {esya:si}.',
    ],
    korkak:[
      'Bu... {sahip:in} olabilir. Bilmem.',
      '{sahip:in} {esya:si} gibi... ama emin değilim beyim.',
      'Bilmem... Galiba {sahip:in}.',
    ],
    dedikoducu:[
      'Aaa, bu {sahip:in} {esya:si}! Ben bunu nerede görsem tanırım beyim. Kaç kere gördüm, çarşıya inerken de, düğünde de. Kimse bilmez dersiniz ama köyde benden bir şey kaçmaz.',
      'Bu mu? {sahip:in} {esya:si}, kimin olacak! Siz bir nerede bulduğunuzu söyleyin, ben size kimin elinde gezdiğini anlatayım.',
      'Beyim, bunu bütün köy bilir: {sahip:in} {esya:si}. Neden elinden çıktığı da belli ya, orasını ben söylemeyeyim.',
    ],
    sert:[
      '{sahip:in}.',
      'Tanıdım. {sahip:in}.',
      '{sahip:in} {esya:si}. Başka?',
    ],
    kurnaz:[
      'Benziyor, {sahip:in} {esya:si} benziyor. Ama bu köyde böylesinden kaç tane var, bir de onu düşünün.',
      'Tanır gibiyim... Bunu bana göstermeden önce kime gösterdiniz?',
    ],
    saf:[
      'Aaa, bu {sahip:in} {esya:si}! Kaybetmiş mi? Ona götürelim beyim.',
      '{sahip:in} {esya:si} bu, ben bilirim. Bir kere bana da göstermişti.',
    ],
  },

  // ---- Kendi yeri: evdeydi ----
  'yer-ev':{
    degiskenler:['zaman'],
    genel:[
      '{zaman} evdeydim, beyim. Yattım, uyudum.',
      '{zaman} evdeydim. Bir yere çıkmadım.',
      'Evdeydim müfettiş bey. Akşam yemeğinden sonra kapıyı kapadım.',
    ],
    korkak:[
      'Evdeydim... evde, beyim.',
      '{zaman:mi}? Evdeydim... bir yere çıkmadım ki.',
      'Ben... evdeydim. Vallahi.',
    ],
    dedikoducu:[
      'Aman beyim, {zaman} ben evden dışarı adım atar mıyım hiç? Evdeydim tabii! Kapıyı sürgüledim, lambayı söndürdüm; ama uyku girmedi gözüme, sabaha kadar dışarıdan gelen sesleri dinledim.',
      '{zaman} evdeydim müfettiş bey, nerede olacağım! Bu köyde geceleri sokağa çıkan ya delidir ya da bir işi vardır; ben ikisi de değilim. Ama kimin çıktığını sorarsanız, onu da bilirim ha.',
      'Evdeydim beyim, evde! Ben akşam ezanından sonra kapıdan dışarı çıkmam; bütün köy bilir. Pencereden bakarım ama, o başka; kimin yolda olduğunu görmek kimseye zarar vermez.',
    ],
    sert:[
      'Evdeydim.',
      'Evdeydim. Yattım.',
      '{zaman} evdeydim. Başka?',
    ],
    ofkeli:[
      'Evdeydim! Nerede olacaktım?',
      '{zaman} evdeydim dedim ya! Bunu kaç kere soracaksınız?',
      'Evimdeydim! Her gece olduğu gibi! Ne bu sorgu?',
    ],
    gururlu:[
      '{zaman} evimdeydim. Benim gibi biri gece sokakta gezmez.',
      'Evimdeydim, müfettiş bey. Benim kapımın önünde gece kimse dolaşmaz.',
    ],
    kurnaz:[
      '{zaman:mi}? Evdeydim, beyim. Siz neden sordunuz, bir duyan mı oldu?',
      'Evdeydim. Ama bunu herkese soruyorsunuz, değil mi?',
      'Evdeydim tabii. Bu saatte sokakta olanı siz bana sorun asıl.',
    ],
    saf:[
      '{zaman} evdeydim beyim. Erkenden yattım.',
      'Evdeydim! Ne oldu ki?',
      'Evdeydim, sonra uyudum. Rüyamda da bir şey görmedim.',
    ],
    sakin:[
      '{zaman} evdeydim. Yatsıyı kıldım, yattım.',
      'Evdeydim, beyim. Allah şahidimdir.',
    ],
  },

  // ---- Kendi yerini söylemez ----
  'kendi-susar':{
    degiskenler:['zaman'],
    genel:[
      '{zaman} nerede olduğum beni ilgilendirir, beyim.',
      'Bunu söyleyemem. Kimseye bir kötülüğüm yok, o kadarını bilin.',
      'Nerede olduğumu söylemesem olmaz mı, müfettiş bey?',
    ],
    korkak:[
      'Ben... şey... söyleyemem beyim.',
      '{zaman:mi}? Bilmem... hatırlamıyorum...',
      'Sormayın... ne olur sormayın.',
    ],
    dedikoducu:[
      'Ah beyim, beni de mi soruyorsunuz? Benim nerede olduğumun kimseye zararı yok, ama söylersem köyde dilden dile dolaşır, iki gün sonra başka türlü anlatırlar. Ben bu sefer susayım; başkalarını sorun, onları anlatırım.',
      'Müfettiş bey, her şeyi söylerim de bunu söylemem. Köyün ağzı torba değil ki büzesin; yarın kahvede benim adımı çıkarırlar. Siz beni değil, gece sokakta gezenleri sorun.',
    ],
    sert:[
      'Söylemem.',
      'Orası benim işim.',
      'Sormayın. Söylemem.',
    ],
    sakin:[
      'Her sorunun cevabı verilmez, beyim. Bunu da vermeyeyim.',
      'Nerede olduğumu Allah bilir. Kötü bir yerde değildim.',
    ],
    gururlu:[
      'Benim nerede olduğumun hesabını kimse soramaz.',
      'Bunu size söylemem gerekmez, müfettiş bey.',
    ],
  },

  // ---- Bilmem ----
  'bilmem':{
    degiskenler:[],
    genel:[
      'Bilmem, beyim.',
      'Bunu bilemem, müfettiş bey.',
      'Vallahi bilmiyorum.',
    ],
    korkak:[
      'Bilmem... ben bir şey bilmem.',
      'Ne bileyim beyim... bilmiyorum.',
    ],
    dedikoducu:[
      'Ah beyim, bu sefer bilmiyorum; inanır mısınız, ilk defa bir şeyi bilmiyorum! Ama durun, bir kulak kabartayım, iki güne kalmaz size gelir anlatırım. Bu köyde hiçbir şey uzun süre saklı kalmaz.',
      'Bilmiyorum müfettiş bey, vallahi bilmiyorum. Bilseydim ilk size söylerdim; hem de süsleyip püsleyerek değil, olduğu gibi. Ama kimin bildiğini biliyorum belki, onu sorun.',
    ],
    sert:[
      'Bilmem.',
      'Bilmiyorum.',
    ],
    saf:[
      'Bilmiyorum ki beyim. Bilseydim söylerdim.',
      'Hiç bilmem. Kime sorsak acaba?',
    ],
    kurnaz:[
      'Bilmem. Bilsem de herkesin önünde söylemezdim ya.',
      'Bilmiyorum beyim. Ama siz kimi sorduysanız o bilir belki.',
    ],
  },

  // ---- Kimseyi görmedim ----
  'gormedim':{
    degiskenler:['zaman'],
    genel:[
      '{zaman} kimseyi görmedim, beyim. Bir ses de duymadım.',
      'Görmedim. {zaman} etraf sessizdi.',
      'Bir şey görmedim, müfettiş bey. Gördüm desem yalan olur.',
    ],
    korkak:[
      'Görmedim... hiçbir şey görmedim.',
      'Yok beyim... kimse yoktu. Ben bakmadım ki.',
      '{zaman:mi}? Bir şey görmedim... vallahi.',
    ],
    dedikoducu:[
      'Ah beyim, {zaman} ne yazık ki bir şey görmedim; ben ki köyde kuş uçsa haberim olur! O gece ne olduysa sessiz oldu, bir it bile havlamadı. Bu da bir şeydir, değil mi? Bilen bir iş çevirmiş demek.',
      '{zaman} hiç kimseyi görmedim müfettiş bey, inanın. Oysa her gece pencereden bakarım; o gece de baktım, yol bomboştu. İnsanın içine bir korku düşüyor, böyle sessizlikte bir şey olur derler.',
    ],
    sert:[
      'Görmedim.',
      'Kimse yoktu.',
      'Bir şey görmedim. Bitti.',
    ],
    ofkeli:[
      'Görmedim dedim! Ben gece gözcüsü müyüm?',
      'Kimseyi görmedim! Görsem söylerdim zaten!',
    ],
    kurnaz:[
      '{zaman} mı? Görmedim, beyim. Görenler varsa onlar da susuyordur.',
      'Gördüğüm bir şey olmadı. Ama karanlıkta kim kimi görür ki?',
    ],
    saf:[
      'Görmedim beyim. Uyuyordum ki!',
      '{zaman} kimseyi görmedim. Keşke görseydim, size söylerdim.',
    ],
  },

  // ---- Gördüklerini söylemez ----
  'gordu-susar':{
    degiskenler:['zaman'],
    genel:[
      '{zaman} ne gördüğümü sormayın, beyim.',
      'Gördüm de, görmedim de. Ne diyeyim?',
      'Bu konuda dilimi tutmam lazım, müfettiş bey.',
    ],
    korkak:[
      'Ben... bir şey görmedim... görmedim diyelim beyim.',
      'Sormayın... başıma iş açılır...',
      'Gördüm mü? Yok... bilmem...',
    ],
    dedikoducu:[
      'Ah beyim, gördüm mü görmedim mi, işte orası bende kalsın. Her gördüğünü söyleyen bu köyde sabaha çıkmaz. Siz bana başka bir şey sorun, onu bütün ayrıntısıyla anlatırım.',
      'Müfettiş bey, insan bazen görmemiş olmayı ister. Ben {zaman} gördüğümü görmemiş sayıyorum; siz de bana bunu sormamış sayın, olmaz mı?',
    ],
    sert:[
      'Söylemem.',
      'Ne gördüğüm beni ilgilendirir.',
    ],
    sakin:[
      'Görülen her şey söylenmez, beyim.',
      'Gördüğümü Allah\'a havale ettim. Size söyleyemem.',
    ],
  },

  // ---- Yanındakiler ----
  'gordum-yaninda':{
    degiskenler:['zaman','yer','kimler'],
    genel:[
      '{zaman} {yer:de} {kimler} vardı.',
      '{yer:de} {kimler} vardı, beyim. Başka kimseyi görmedim.',
      '{zaman} {yer:de} {kimler:le} beraberdik.',
    ],
    korkak:[
      '{yer:de}... {kimler} vardı. O kadar.',
      '{kimler} vardı... {yer:de}. Başkasını bilmem.',
    ],
    dedikoducu:[
      '{zaman} {yer:de} {kimler} vardı beyim, gözümle gördüm. Kim ne konuştu, kim kime nasıl baktı, onu da sorarsanız anlatırım; ben bir yerde oturdum mu kulağım dört açılır, bilirsiniz.',
      'Aman beyim, {yer:de} kimler yoktu ki! {kimler} vardı, hepsini saydım. Hem de biri öbürüne bir şey fısıldadı, ben duymadım ama yüzlerinden anladım, iyi bir şey değildi.',
    ],
    sert:[
      '{kimler} vardı.',
      '{yer:de}. {kimler} vardı.',
    ],
    ofkeli:[
      '{yer:de} {kimler} vardı! Gidin onlara sorun!',
      '{kimler} vardı! Ben yalnız değildim ki!',
    ],
    kurnaz:[
      '{yer:de} {kimler} vardı. Ama herkes bütün gece orada mıydı, onu bilemem.',
      '{kimler} vardı. Onların da sizden sakladığı bir şey vardır belki.',
    ],
    saf:[
      '{yer:de} {kimler} vardı! Beraber oturduk.',
      '{kimler} vardı beyim. Başka kimse yoktu.',
    ],
  },

  // ---- Karanlıkta biri ----
  'gordum-siluet':{
    degiskenler:['ortu','yer','zaman'],
    genel:[
      '{zaman} {yer:de} {ortu} giymiş biri vardı. Yüzünü seçemedim.',
      'Karanlıkta biri gördüm, beyim. Üstünde {ortu} vardı; yüzünü göremedim.',
      '{yer:de} bir gölge gördüm. {ortu} giyiyordu, o kadarını söyleyebilirim.',
    ],
    korkak:[
      'Biri vardı... {ortu} giymişti... yüzünü görmedim beyim.',
      'Bir gölge... {yer:de}... bilmem kimdi.',
      '{ortu} vardı üstünde... başka bir şey görmedim...',
    ],
    dedikoducu:[
      'Beyim, {zaman} {yer:de} biri vardı, karanlıkta şöyle bir kımıldadı! Üstünde {ortu} vardı, ay ışığında seçtim; yüzünü göremedim ama yürüyüşü hiç de yabancı değildi, köyden biriydi, eminim. Tüylerim diken diken oldu.',
      'Aman müfettiş bey, sormayın! {yer:de} {ortu} giymiş biri, sanki kimse görmesin diye duvar dibinden gidiyordu. Yüzünü seçemedim, hayıflanıyorum, ama boyunu posunu aklıma yazdım.',
    ],
    sert:[
      'Biri vardı. {ortu} giymişti.',
      '{yer:de} biri. Yüzü görünmedi.',
    ],
    ofkeli:[
      '{ortu} giymiş biri gördüm! Yüzünü göremedim, ne yapayım?',
      'Karanlıktı! {ortu} vardı üstünde, o kadar!',
    ],
    kurnaz:[
      '{yer:de} {ortu} giyen biri vardı. Köyde {ortu} giyen kim, onu siz düşünün.',
      'Yüzünü göremedim. Ama {ortu} herkeste yok, değil mi beyim?',
    ],
    saf:[
      'Biri vardı beyim! {ortu} giymişti. Seslendim, durmadı.',
      '{yer:de} biri gördüm, {ortu} vardı üstünde. Kim olduğunu bilmiyorum.',
    ],
  },

  // ---- Karanlıktakine ad koyar (dedikoducu abartısı) ----
  'gordum-siluet-tahmin':{
    degiskenler:['ortu','yer','zaman','kim'],
    genel:[
      '{yer:de} {ortu} giymiş biri vardı. Bana kalırsa {kim} idi.',
      '{zaman} {yer:de} {ortu} giymiş birini gördüm. {kim}, başkası olamaz.',
    ],
    korkak:[
      '{ortu} giymiş biri... {kim} gibiydi... bilmem.',
      'Biri vardı... {kim} olabilir... ben demedim ama.',
    ],
    dedikoducu:[
      'Beyim, {zaman} {yer:de} {ortu} giymiş birini gördüm; yüzünü tam seçemedim ama ben o yürüyüşü bin kişinin içinden tanırım, {kim} idi! Hem kimse görmesin diye duvar dibinden gidiyordu. Başkası olsa öyle sinsi sinsi yürür mü?',
      'Ah sormayın müfettiş bey! {yer:de} {ortu} giymiş biri vardı. Karanlıktı derler ya, değildi; ay vardı. {kim} idi o, yemin ederim; zaten onun oralarda ne işi olacağını da merak ediyordum.',
    ],
    sert:[
      '{ortu} giymiş biri. {kim} idi.',
      '{kim}. {ortu} giymişti.',
    ],
    kurnaz:[
      '{ortu} giymiş biri vardı. Köyde {ortu} giyip o saatte dolaşan kim, ben {kim} derim.',
      'Yüzünü görmedim. Ama {kim} olduğuna bahse girerim.',
    ],
  },

  // ---- Ses ----
  'duydum':{
    degiskenler:['ses','yer','zaman'],
    genel:[
      '{zaman} {yer} tarafından {ses} duydum.',
      'Bir şey görmedim ama {yer} tarafından {ses} geldi, beyim.',
      '{zaman} {ses} duydum. {yer} tarafındandı.',
    ],
    korkak:[
      '{ses} duydum... {yer} tarafından... çıkmadım.',
      'Bir ses... {ses}... korktum, yorganı başıma çektim.',
    ],
    dedikoducu:[
      'Beyim, {zaman} {yer} tarafından {ses} duydum, öyle bir ki tüylerim diken diken oldu! Kalktım, pencereye gittim, ama karanlıktan bir şey seçemedim. Sabah olunca da duydum ki o ses boşuna değilmiş.',
      'Aman beyim, {ses} duydum ya, hâlâ kulağımda! {yer} tarafındandı. Ben o saatte uyumam zaten, her sesi duyarım; ama öylesini ilk defa duydum, yemin ederim.',
    ],
    sert:[
      '{ses} duydum. {yer} tarafından.',
      'Bir ses geldi. {yer} tarafından.',
    ],
    ofkeli:[
      '{ses} duydum! {yer} tarafındandı! Başka ne bileyim?',
      'Duydum işte! {yer} tarafından! Çıkıp bakacak değildim!',
    ],
    saf:[
      '{yer} tarafından {ses} duydum beyim. Köpek sandım.',
      '{ses} geldi, {yer} tarafından. Kalkıp bakmadım, korktum.',
    ],
  },

  // ---- Başkası nerede ----
  'baskasi-yer':{
    degiskenler:['kim','zaman','yer'],
    genel:[
      '{zaman} {kim} {yer:de+di}, beyim.',
      '{kim} mi? {zaman} {yer:de+di}.',
      'Bildiğim kadarıyla {kim} {yer:de+di}.',
    ],
    korkak:[
      '{kim}... {yer:de+di} galiba.',
      '{yer:de+di} herhalde... {kim}. Bilmem.',
    ],
    dedikoducu:[
      '{kim:mi}? Aman beyim, {zaman} {yer:de+di}, ben biliyorum! Nereden mi? Bu köyde kimin nerede olduğunu bilmeyen yoktur; hele {kim} gibisini herkes gözüyle takip eder. Size söyledim ama benden duymuş olmayın.',
      'Beyim, {kim} {zaman} {yer:de+di}, bunu kime sorsanız söyler. Ama asıl soru orada ne yaptığı, değil mi? Ben de onu merak ediyorum, hem de çoktandır.',
    ],
    sert:[
      '{yer:de+di}.',
      '{kim} {yer:de+di}. O kadar.',
    ],
    ofkeli:[
      '{kim} {yer:de+di}! Bana niye soruyorsunuz?',
      '{yer:de+di}! Ben bekçisi miyim onun?',
    ],
    kurnaz:[
      '{kim} {yer:de+di}, öyle biliyorum. Bütün gece orada mıydı, onu bilemem.',
      '{zaman:mi}? {yer:de+di} galiba. Siz yine de bir de başkasına sorun.',
    ],
    saf:[
      '{kim} {yer:de+di} beyim! Ben gördüm.',
      '{zaman} {kim} {yer:de+di}. Ne oldu ki ona?',
    ],
  },

  // ---- Başkası evdeydi (aynı evden) ----
  'baskasi-evde':{
    degiskenler:['kim','zaman'],
    genel:[
      '{zaman} {kim} evdeydi, beyim. Bir yere çıkmadı.',
      '{kim} evdeydi. Ben de evdeydim, gördüm.',
      '{kim:mi}? Evdeydi, yattı uyudu.',
    ],
    korkak:[
      'Evdeydi... evdeydi beyim.',
      '{kim}... evdeydi herhalde... ben uyuyordum.',
    ],
    dedikoducu:[
      '{kim} {zaman} evdeydi beyim, ben buna şahidim! Aynı damın altında yaşıyoruz, kim kalkar kim yatar bilirim. Hatta gece bir ara su içmeye kalktı, sonra yine yattı; o kadar yani.',
      'Aman beyim, {kim} evdeydi tabii! Biz bir evin insanıyız, birimiz kapıdan çıksa öbürü duyar. Ama siz bunu niye soruyorsunuz, yoksa biri bir şey mi dedi?',
    ],
    sert:[
      'Evdeydi.',
      '{kim} evdeydi. Bitti.',
    ],
    ofkeli:[
      'Evdeydi! Ne demek istiyorsunuz?',
      '{kim} evdeydi! Bizim evden katil çıkmaz!',
    ],
    gururlu:[
      '{kim} evdeydi. Bizim evin insanı gece sokakta gezmez.',
      '{zaman} {kim} evdeydi. Benim sözüm yeter.',
    ],
    saf:[
      '{kim} evdeydi beyim. Yanımızda uyudu.',
      'Evdeydi! Sabah da beraber kalktık.',
    ],
  },

  // ---- Başkası orada değildi (konuşan oradaydı) ----
  'baskasi-degil':{
    degiskenler:['kim','zaman','yer'],
    genel:[
      '{zaman} {kim} {yer:de} değildi. Ben oradaydım, görmedim.',
      '{kim} {yer:de} yoktu, beyim. Ben oradaydım.',
      'Ben {yer:de+dim}; {kim} orada değildi.',
    ],
    korkak:[
      '{kim}... {yer:de} yoktu... ben görmedim.',
      'Orada değildi... ben oradaydım ama... bilmem.',
    ],
    dedikoducu:[
      'Beyim, {kim} {zaman} {yer:de} filan değildi! Ben oradaydım, bütün gece de gözümü kırpmadım. Kim "oradaydı" dediyse yalan söylüyor; neden yalan söyler, onu da siz bulun artık.',
      '{kim:mi}? {yer:de} mi? Hiç sanmam beyim, çünkü ben oradaydım ve onun gölgesini bile görmedim. Bu köyde biri bir yerde olmadığı hâlde orada olduğunu söylüyorsa, ben ondan şüphelenirim.',
    ],
    sert:[
      '{yer:de} değildi.',
      'Yoktu. Ben oradaydım.',
    ],
    ofkeli:[
      '{kim} {yer:de} değildi! Ben oradaydım, gözüm kör mü?',
      'Yoktu orada! Kim dediyse yalan!',
    ],
    kurnaz:[
      '{kim} {yer:de} değildi. Ben oradaydım. Neden öyle söylüyor, orasını siz düşünün.',
      '{yer:de} mi? Ben oradaydım, {kim} yoktu. İlginç, değil mi beyim?',
    ],
    saf:[
      '{kim} {yer:de} değildi ki! Ben oradaydım.',
      'Yok beyim, {kim} gelmedi oraya. Ben bütün gece oradaydım.',
    ],
  },

  // ---- Ev halkı: yatağı boştu ----
  'baskasi-yatak-bos':{
    degiskenler:['kim','zaman'],
    genel:[
      '{zaman} {kim} evde değildi. Yatağı boştu.',
      'Gece kalktım, {kim:in} yatağı boştu, beyim. Nereye gittiğini bilmem.',
      '{kim} evde yoktu. Sabaha karşı döndü.',
    ],
    korkak:[
      'Yatağı... boştu beyim. Bir şey demedim.',
      '{kim} yoktu... evde yoktu... ben sormadım.',
    ],
    dedikoducu:[
      'Beyim, size bir şey söyleyeyim mi? {zaman} gece yarısı kalktım, baktım {kim:in} yatağı bomboş! Sabaha karşı kapı gıcırdadı, o zaman geldi. Nereden geldi, kimin yanından geldi, bana sormayın ama ben anladım ki bir iş var.',
      'Aman müfettiş bey, {kim} evde değildi, ben bilirim! Yatağına baktım, soğuktu; demek çoktan çıkmış. Döndüğünde de yüzü kireç gibiydi, kimseyle konuşmadı.',
    ],
    sert:[
      'Evde değildi.',
      'Yatağı boştu.',
    ],
    ofkeli:[
      'Evde değildi işte! Nereye gittiğini bana sormayın!',
      'Yatağı boştu! Ben bekçisi miyim?',
    ],
    kurnaz:[
      '{zaman} {kim} evde yoktu. Nereye gitti, kime gitti, onu kendisine sorun.',
      'Yatağı boştu, beyim. Ama bunu benden duymadınız.',
    ],
    saf:[
      '{kim} yoktu beyim! Yatağı boştu, merak ettim.',
      'Gece kalktım, {kim} yoktu. Sabah sordum, bir şey demedi.',
    ],
  },

  // ---- Başkasını bilmez ----
  'baskasi-bilmez':{
    degiskenler:['kim','zaman'],
    genel:[
      '{zaman} {kim:in} nerede olduğunu bilmem, beyim.',
      '{kim:i} görmedim. Nerede olduğunu bilemem.',
      'Bilmem. {kim} benim gözümün önünde değildi.',
    ],
    korkak:[
      '{kim:mi}? Bilmem... görmedim.',
      'Bilmiyorum beyim... {kim:i} görmedim...',
    ],
    dedikoducu:[
      '{kim:mi}? Ah beyim, işte onu bilmiyorum, ne yazık ki! {zaman} ben başka yerdeydim, gözüm üstünde değildi. Ama durun, bir kulak kabartayım; köyde biri mutlaka görmüştür, iki güne kalmaz duyarım.',
      'Müfettiş bey, {kim:in} {zaman} nerede olduğunu bilsem, ilk size koşardım. Bilmiyorum; ama nerede olmadığını bilenler vardır, onları bulun.',
    ],
    sert:[
      'Bilmem.',
      'Görmedim onu.',
    ],
    ofkeli:[
      'Ben {kim:in} bekçisi miyim? Bilmem!',
      'Bilmiyorum! Gidin ona sorun!',
    ],
    kurnaz:[
      '{kim:mi}? Bilmem beyim. Ama siz neden onu soruyorsunuz, onu merak ettim.',
      'Bilmiyorum. Bilseydim de bedavaya söylemezdim ya, şaka şaka.',
    ],
    saf:[
      'Bilmiyorum beyim, {kim:i} görmedim. Ona bir şey mi oldu?',
      '{kim:i} görmedim ki. Evindedir herhalde.',
    ],
  },

  // ---- Abartı eki (dedikoducu ve hasım süsler) ----
  'abarti-ek':{
    degiskenler:['kim'],
    genel:[
      'Hem yalnız da değildi, bilesiniz.',
      'Yüzü de bir tuhaftı, söyleyeyim.',
      'Etrafına bakına bakına gitti, ben gördüm.',
    ],
    korkak:[
      'Bir de... tuhaftı biraz... bilmem.',
      'Yüzü... yüzü iyi değildi...',
    ],
    dedikoducu:[
      'Hem de yalnız değildi, yanında biri daha vardı; kimdi bilmem ama boylu poslu biriydi, köyden de değildi galiba! Sonra ikisi ayrıldı, {kim} etrafına bakına bakına gitti; ben anladım ki bunda bir iş var.',
      'Bir de şunu söyleyeyim beyim: {kim:in} o gece elinde bir bohça vardı, sabah yoktu! Bohçanın içinde ne vardı, nereye bıraktı, bunu da bir sorun bakalım; ben size söyledim ama benden duymuş olmayın.',
      'Hem de ne hâldeydi bilseniz! Saçı başı dağılmış, yüzü kireç gibi, sanki peşinde biri var. {kim:i} hiç öyle görmemiştim, otuz yıldır bu köydeyim.',
      'Ayakkabısı da çamur içindeydi, oysa o gün yağmur yağmamıştı beyim; çamuru nereden buldu, kim bilir hangi dereden geçti. Bunu ben söylemiyorum, çamur söylüyor.',
      'Bir de durmadan arkasına bakıyordu; insan evine giderken arkasına bakar mı? Bakmaz. {kim} baktı, hem de üç kere, ben saydım.',
      'Gerçi ben yanılıyor olabilirim, gözlerim eskisi gibi değil; ama yürüyüşünden tanırım, {kim:in} yürüyüşü başkadır, sağ ayağını sürür. O gece de sürüyordu, hem de hızlı hızlı.',
      'Elinde bir şey vardı, sarılı bir şey; ekmek desem değil, odun desem değil. Sordum, cevap vermedi, başını çevirdi gitti. Selamı bile almadı, ki {kim} selamsız geçmezdi.',
      'O gece köpekler de bir tuhaf havladı beyim; {kim} geçerken sustular, sonra yine başladılar. Hayvan bilir, insandan iyi bilir.',
    ],
    sert:[
      'Telaşlıydı.',
      'Yüzü bembeyazdı.',
    ],
    ofkeli:[
      'Hem de telaşla! Gördüm!',
      'Kaçar gibiydi!',
    ],
  },

  // ---- Eşya: benim ----
  'esya-benim':{
    degiskenler:['esya'],
    genel:[
      'Bu {esya} benim, beyim.',
      'Evet, benim. Tanıdım.',
      'Benim bu, müfettiş bey. Saklayacak değilim.',
    ],
    korkak:[
      'Benim... benim beyim.',
      'O... benim olabilir... evet, benim.',
      'Benim... ama ben bir şey yapmadım...',
    ],
    dedikoducu:[
      'Aaa, bu benim {esya}! Ne zamandır arıyordum, beyim; evi altüst ettim, kızımı azarladım, meğer dışarıda düşürmüşüm. Ama sakın yanlış anlamayın, nerede bulduysanız ben orada kötü bir iş yapmadım.',
      'Benim tabii, köyde bunu tanımayan mı var! Kaç yıldır yanımdan ayırmam. Kim size getirdi bunu, onu da merak ettim; ama siz sorun, ben anlatayım.',
    ],
    sert:[
      'Benim.',
      'Benim. Saklamam.',
    ],
    ofkeli:[
      'Benim, evet! Ne olmuş?',
      'Benim! Bir şey mi diyeceksiniz?',
    ],
    gururlu:[
      'Benimdir. Benim malım ortada kalmaz, demek düşürmüşüm.',
      'Bu benim. Kimseden saklayacak hâlim yok.',
    ],
    kurnaz:[
      'Benim, beyim. Ama bir eşyanın nerede bulunduğu sahibini suçlu yapmaz, değil mi?',
      'Benimkine benziyor... evet, benim. Siz nerede buldunuz?',
    ],
    saf:[
      'Benim! Kaybetmiştim, sağ olun beyim.',
      'Aaa, benim bu! Nerede buldunuz?',
    ],
  },

  // ---- Açıklama: daha önce oradan geçmiştim ----
  'aciklama-gecti':{
    degiskenler:['zaman','yer'],
    genel:[
      '{zaman} {yer:den} geçmiştim. Orada düşürmüş olmalıyım.',
      '{zaman} {yer:e} uğramıştım, beyim. İz o zamandan kalmıştır.',
      'Ben oradan {zaman} geçtim. O gece değil.',
    ],
    korkak:[
      '{zaman}... oradan geçmiştim... o zaman kalmıştır.',
      'Ben... {yer:den} geçtim ama... gece değil, {zaman}.',
    ],
    dedikoducu:[
      'Bakın beyim, ben {zaman} {yer:den} geçtim, saklayacak bir şeyim yok; işim düştü, uğradım, çıktım. Herkes görmüştür, bir sorun bakalım. O iz o zamandan kalmadır, o geceyle hiç alakası yok.',
      'Ah müfettiş bey, ben {zaman} {yer:e} uğramıştım, yolum oradan geçiyor. İz o zamandan kalmıştır; o gece ben evimdeydim, sorun isterseniz.',
    ],
    sert:[
      '{zaman} geçtim oradan.',
      'Gece değil. {zaman} geçtim.',
    ],
    ofkeli:[
      '{zaman} geçtim oradan! Yasak mı?',
      'Oradan {zaman} geçtim! O gece değil!',
    ],
    saf:[
      '{zaman} {yer:den} geçmiştim beyim. Orada düşürmüşüm demek.',
      'Ben oradan {zaman} geçtim. Orada bir şey yoktu o zaman.',
    ],
  },

  // ---- Açıklama: gördüm, saldırdılar, kaçtım ----
  'aciklama-kacti':{
    degiskenler:['zaman','yer'],
    genel:[
      '{zaman} {yer:e} yakın geçiyordum. Biri vardı, üstüme yürüdü, kaçtım. Orada düşürmüşüm.',
      'Oradaydım, beyim, saklamayayım. {zaman} karanlıkta biri bana saldırdı, can havliyle kaçtım.',
      '{zaman} {yer:de} birini gördüm. Beni de görünce üstüme geldi; kaçarken düşürdüm.',
    ],
    korkak:[
      'Oradaydım... biri vardı... üstüme geldi... kaçtım beyim.',
      'Ben kaçtım... ne olduğunu bilmiyorum... korktum...',
      '{zaman}... birini gördüm... sonra koştum... düşmüş.',
    ],
    dedikoducu:[
      'Beyim, sormayın, ben {zaman} az kalsın ölüyordum! {yer:e} yakın geçiyordum, karanlıkta biri belirdi, üstüme saldırdı; yakama yapıştı, ben silkindim, can havliyle kaçtım. O kargaşada düşürmüşüm. Kimseye söylemedim, korktum; ama size söylüyorum.',
      'Aman müfettiş bey, o gece ne çektim bir bilseniz! {yer:de} biri vardı, beni görünce üstüme geldi. Yüzünü seçemedim ama nefesini duydum. Kaçtım, arkama bakmadan kaçtım; sabah anladım ki düşürmüşüm.',
    ],
    sert:[
      'Oradaydım. Biri saldırdı. Kaçtım.',
      'Saldırdılar. Kaçtım. Düşürdüm.',
    ],
    ofkeli:[
      'Oradaydım, evet! Biri üstüme yürüdü, kaçtım! Ne yapsaydım?',
      'Bana saldırdılar! Kaçtım! Şimdi suçlu ben mi oldum?',
    ],
    saf:[
      'Oradaydım beyim. Biri bana vurmak istedi, ben de kaçtım. Çok korktum.',
      '{zaman} {yer:de} biri vardı, üstüme koştu. Kaçtım, düşürdüm.',
    ],
  },

  // ---- Açıklama: çalınmıştı ----
  'aciklama-calindi':{
    degiskenler:['zaman'],
    genel:[
      'Ama o benden çalındı, beyim. {zaman} yerinde yoktu.',
      'Çalınmıştı. {zaman} fark ettim, kime söyleyeceğimi bilemedim.',
      'Benimdi ama {zaman} çaldılar.',
    ],
    korkak:[
      'Ama... çalınmıştı... {zaman}... ben bir şey yapmadım.',
      'Çaldılar beyim... {zaman}... vallahi.',
    ],
    dedikoducu:[
      'Ama beyim, o benden çalındı! {zaman} baktım ki yerinde yok; evi aradım, komşuya sordum, yok. Kim aldıysa bilerek almış, belli ki başıma iş açmak istemiş. Şimdi anlıyorum ne için aldığını!',
      'Müfettiş bey, bunu ben de soracaktım: {zaman} çalındı o! Kimseye söylemedim, ayıp olur diye; meğer ne işlere karışmış. Kim çaldıysa beni de yakmak istemiş.',
    ],
    sert:[
      'Çalındı. {zaman}.',
      'Benden çaldılar.',
    ],
    ofkeli:[
      'Çalındı o! {zaman}! Hırsızı bulun, beni değil!',
      'Benden çaldılar dedim ya!',
    ],
    saf:[
      'Çalınmıştı beyim! {zaman} kaybolmuştu, ben de aradım.',
      'Onu biri almıştı, {zaman}. Ben unuttum sandım.',
    ],
  },

  // ---- Açıklama: zehir otu ----
  'aciklama-ot':{
    degiskenler:[],
    genel:[
      'O ot benim torbamdan, doğru. Ama ben kimseyi zehirlemedim; biri benden istedi.',
      'Otu ben verdim, beyim. Ne için kullanılacağını bilmiyordum.',
    ],
    korkak:[
      'Ben verdim... ama bilmiyordum... vallahi bilmiyordum.',
      'Biri istedi... ben de verdim... ne yapacağını bilmezdim.',
    ],
    dedikoducu:[
      'Bakın beyim, o ot benim torbamdan çıktı, inkâr etmem; ama ben onu derde deva diye veririm, can almak için değil! Biri gelip istedi, ben de verdim. Kimin istediğini söylersem köy yıkılır, ama siz sorarsanız belki söylerim.',
      'O ot benim, evet; köyde başka kimde olur ki? Ama ben şifa için veririm. Kim aldıysa niyetini benden saklamış, şimdi ne yüzle bakacağım ölünün ailesine?',
    ],
    sert:[
      'Otu ben verdim. Zehirlemedim.',
      'Benim otum. Ben vermedim ölüme.',
    ],
    kurnaz:[
      'Otu ben verdim. Ama ot veren katil olsaydı, köyde benden kalabalık katil olurdu.',
      'Benim torbamdan. Kime verdiğimi de bilirim; ama bunu ucuza söylemem.',
    ],
  },

  // ---- Açıklama: bilmem ----
  'aciklama-bilmem':{
    degiskenler:[],
    genel:[
      'Oraya nasıl düştü, bilmem.',
      'Nasıl oraya gitti, ben de anlamadım.',
      'Ne zaman düşürdüm, hatırlamıyorum.',
    ],
    korkak:[
      'Nasıl oldu... bilmiyorum...',
      'Bilmem beyim... düşürmüşüm... nasıl...',
    ],
    dedikoducu:[
      'Ama oraya nasıl gitti, işte ona ben de şaşıyorum beyim! Ya ben düşürdüm de unuttum, ya da biri alıp oraya koydu; bu köyde ikisi de olur. Siz bir de bunu kimin işine yarayacağını düşünün.',
      'Nasıl oraya düştüğünü hiç bilmiyorum müfettiş bey; vallahi billahi bilmiyorum. Belki biri benim başımı yakmak istedi, bu köyde bana diş bileyen çoktur.',
    ],
    sert:[
      'Nasıl düştü, bilmem.',
      'Bilmiyorum nasıl.',
    ],
    saf:[
      'Nasıl düştü, hiç bilmiyorum beyim.',
      'Oraya gittiğimi hatırlamıyorum ki.',
    ],
  },

  // ---- Sahibi başkasını gösterir (yalan) ----
  'esya-baskasinin':{
    degiskenler:['esya','kim'],
    genel:[
      'Bu benim değil, beyim. {kim:in} olsa gerek.',
      'Benim değil. Böylesi {kim:de} var, ona sorun.',
      'Yok, benim değil. Ben bunu {kim:de} görmüştüm.',
    ],
    korkak:[
      'Benim değil... {kim:in} herhalde...',
      'Ben... bilmem... {kim:de} vardı böylesi...',
    ],
    dedikoducu:[
      'Benim mi? Aman beyim, olur mu öyle şey! Bu {kim:in}, hepimiz biliriz; o hep böyle şeylerle gezer. Siz bir de ona sorun bakalım o gece neredeymiş; ben size söyledim ama benden duymuş olmayın.',
      'Yok müfettiş bey, bu benim değil; benimki evde duruyor, isterseniz gösteririm. Bu {kim:in} olsa gerek. Zaten o son günlerde bir tuhaftı, ben de merak ediyordum.',
    ],
    sert:[
      'Benim değil. {kim:in}.',
      'Değil. {kim:e} sorun.',
    ],
    ofkeli:[
      'Benim değil! {kim:e} sorun, onun!',
      'Bunu bana mı yıkacaksınız? {kim:in} o!',
    ],
    kurnaz:[
      'Benim değil, beyim. {kim:de} de böylesi var, bilirsiniz.',
      'Bunu tanır gibiyim; {kim:de} görmüştüm galiba.',
    ],
  },

  // ---- Sahibi inkâr eder ----
  'esya-benim-degil':{
    degiskenler:['esya'],
    genel:[
      'Bu benim değil, beyim.',
      'Hiç görmedim bunu. Benim değil.',
      'Benim değil. Kimin olduğunu da bilmem.',
    ],
    korkak:[
      'Benim değil... değil beyim.',
      'Ben... görmedim bunu... benim değil...',
    ],
    dedikoducu:[
      'Benim mi? Tövbe tövbe! Beyim, benim böyle bir şeyim olsa bütün köy bilirdi; ben bir şey alsam kahvede konuşulur. Bu benim değil; kiminse onu da bulursunuz, ama benden bilmeyin.',
      'Yok beyim, bu benim değil, ilk defa görüyorum. Biri bunu oraya bilerek bırakmış olabilir, düşündünüz mü? Bu köyde bir kişinin başını yakmak çok kolaydır.',
    ],
    sert:[
      'Benim değil.',
      'Değil. Görmedim.',
    ],
    ofkeli:[
      'Benim değil! Bana yamamaya kalkmayın!',
      'Benim mi? Hiç görmedim!',
    ],
    gururlu:[
      'Benim böyle şeyim olmaz.',
      'Bu benim değil. Benim malımı ben tanırım.',
    ],
  },

  // ---- Eşya hakkında susar ----
  'esya-susar':{
    degiskenler:['esya'],
    genel:[
      'Bunun kimin olduğunu söyleyemem, beyim.',
      'Tanısam da söylemem. Başıma iş istemem.',
      'Bu konuda bir şey demeyeyim, müfettiş bey.',
    ],
    korkak:[
      'Bilmem... bilmem beyim... sormayın.',
      'Ben... tanımadım... tanımadım diyelim.',
    ],
    dedikoducu:[
      'Ah beyim, bunu bana göstermeyin, gözüm bir şey gördü ama dilim söylemez. Bu köyde yanlış ağıza girersen bir daha çıkamazsın. Siz başka birine gösterin; ben görmemiş olayım.',
      'Müfettiş bey, siz de bilirsiniz, her eşyanın bir sahibi var, her sahibin de bir hısımı. Ben bunu tanısam bile şimdi söylersem yarın kapımı kimse çalmaz. Susayım, en iyisi.',
    ],
    sert:[
      'Söylemem.',
      'Tanımam. Sormayın.',
    ],
    sakin:[
      'Bunu söylemek bana düşmez, beyim.',
      'Her şeyin vakti var. Bunun vakti değil.',
    ],
  },

  // ---- Dedikoducu kesin ad koyar ----
  'esya-tanima-kesin':{
    degiskenler:['esya','sahip'],
    genel:[
      'Bu kesin {sahip:in} {esya:si}, beyim.',
      'Başkasının olamaz; {sahip:in} {esya:si} bu.',
    ],
    korkak:[
      '{sahip:in}... olsa gerek... başkası olamaz...',
      'Bence {sahip:in}... ama ben demedim.',
    ],
    dedikoducu:[
      'Bu mu? Bu kesin {sahip:in} {esya:si}, başkasının olamaz! Köyde böylesinden birkaç tane var diyenler olur, ama ben her birini ayrı ayrı bilirim. Hem de son günlerde {sahip} bir tuhaf, kimseyle konuşmuyor; bunda bir iş var beyim.',
      'Aman beyim, gösterir göstermez tanıdım: {sahip:in} {esya:si}! Benden iyi kim bilir? O kadar gördüm ki rüyamda görsem tanırım. Nerede bulduysanız, orada onun ne işi vardı, bir de onu sorun.',
    ],
    sert:[
      '{sahip:in}. Kesin.',
      'Kesin {sahip:in}.',
    ],
    ofkeli:[
      '{sahip:in} bu! Gidin onu sıkıştırın!',
      'Kesin {sahip:in}! Hep böyle şeylerle gezer!',
    ],
  },

  // ---- Böylesi birçok kişide var ----
  'esya-adaylar':{
    degiskenler:['esya','kimler'],
    genel:[
      'Böylesi {kimler} var, beyim. Hangisinin olduğunu bilemem.',
      'Bu köyde böylesi tek değil. {kimler} var.',
      'Bilemem; {kimler} var böylesi.',
    ],
    korkak:[
      'Bilmem... {kimler} var böylesi...',
      'Kimin... bilmem beyim... çok kişide var.',
    ],
    dedikoducu:[
      'Ah beyim, bu köyde böylesi bir değil, iki değil! {kimler} var; hepsini ben saydım, inanın. Hangisi düşürdü, orası sizin işiniz; ama ben olsam önce o gece dışarıda olanları sorardım.',
      'Bunu kimin düşürdüğünü söylemek zor müfettiş bey, çünkü böylesi {kimler} var. Hepsini tek tek sorun derim; biri mutlaka kızaracak, ben öyle görürüm.',
    ],
    sert:[
      'Çok kişide var.',
      'Bilemem. {kimler} var.',
    ],
    kurnaz:[
      'Böylesi {kimler} var. Hangisi o gece dışarıdaydı, onu bulun.',
      '{kimler} var böylesi. Ben olsam en çok susanı sorardım.',
    ],
    saf:[
      'Böylesi {kimler} var beyim! Hangisinin bilmem.',
      'Çok kişide var bundan. {kimler} var mesela.',
    ],
  },

  // ---- Bende de var ama bu benim değil ----
  'esya-adaylar-ben':{
    degiskenler:['esya','kimler'],
    genel:[
      'Bende de böylesi var, ama bu benim değil. {kimler} var.',
      'Benimki yerinde, beyim. Böylesi {kimler} var.',
      'Bu benim değil. Benimki evde. {kimler} var böylesi.',
    ],
    korkak:[
      'Bende de var... ama benim değil... vallahi.',
      'Benimki... evde... bu benim değil beyim...',
    ],
    dedikoducu:[
      'Bende de böylesi var, doğru, ama bu benim değil beyim; benimki evde duruyor, isterseniz gidip getireyim! Bu köyde böylesi {kimler} var. Benden önce onlara sorun derim, benim saklayacak bir şeyim yok.',
      'Aman müfettiş bey, böylesi bende de var diye bana mı bakıyorsunuz? Benimki yerinde. {kimler} var, onları da sorun; hele o gece dışarıda olanı, ben size söyledim.',
    ],
    sert:[
      'Benim değil. Benimki evde.',
      'Bende de var. Bu değil.',
    ],
    ofkeli:[
      'Bende de var diye beni mi suçlayacaksınız? {kimler} var!',
      'Benimki yerinde! Başkasına sorun!',
    ],
    saf:[
      'Bende de var ama benimki evde beyim. Bu başkasının.',
      'Benimki yerinde. {kimler} var, onlara sorun.',
    ],
  },

  // ---- Eşyayı bilmez ----
  'esya-bilmem':{
    degiskenler:['esya'],
    genel:[
      'Bunu tanımadım, beyim.',
      'Kimin olduğunu bilmem.',
      'Daha önce görmedim bunu.',
    ],
    korkak:[
      'Bilmem... tanımadım...',
      'Görmedim... bunu görmedim beyim...',
    ],
    dedikoducu:[
      'Bunu ilk defa görüyorum beyim, vallahi; ben ki köydeki her şeyi bilirim! Demek ki ya yabancı birinin, ya da sahibi bunu çok iyi saklamış. İkisi de hayra alamet değil.',
      'Tanımadım müfettiş bey, utanarak söylüyorum. Bende yoktur, komşuda da görmedim. Ama siz bir çerçiye sorun, o köy köy gezer, kimin ne aldığını bilir.',
    ],
    sert:[
      'Tanımam.',
      'Bilmem kimin.',
    ],
    saf:[
      'Tanımadım beyim. Kimin olduğunu bilmem.',
      'Bilmiyorum kimin. Hiç görmedim.',
    ],
  },

  // ---- Fail: biliyorum ----
  'fail-bilirim':{
    degiskenler:['kim','sahip'],
    genel:[
      '{sahip:i} {kim} öldürdü, beyim. Gözümle gördüm.',
      '{kim} yaptı. Ben gördüm, başkası değil.',
      'Bunu {kim} yaptı, müfettiş bey. Yüzünü gördüm.',
    ],
    korkak:[
      '{kim}... {kim} yaptı... ben söyledim demeyin...',
      'Gördüm... {kim} idi... ne olur kimseye söylemeyin.',
    ],
    dedikoducu:[
      'Beyim, size söyleyeyim, {sahip:i} {kim} öldürdü! Gözümle gördüm, yüzünü ay ışığında seçtim. Kimseye söylemedim, söylesem bana da aynısını yapar diye korktum; ama artık susamam, bu köy kendini yiyor.',
      'Müfettiş bey, o işi {kim} yaptı, kendi gözlerimle gördüm. Kimseye söylemeye cesaret edemedim; şimdi size söylüyorum ki vicdanım rahatlasın. Ama ne olur adımı vermeyin.',
    ],
    sert:[
      '{kim} yaptı. Gördüm.',
      '{kim}. Gözümle gördüm.',
    ],
    ofkeli:[
      '{kim} yaptı! Gördüm! Ne bekliyorsunuz?',
      '{kim}! Gidin alın onu!',
    ],
    saf:[
      '{kim} yaptı beyim. Ben gördüm, çok korktum.',
      'Gördüm, {kim} idi. Neden yaptı bilmiyorum.',
    ],
  },

  // ---- Fail: başkasını suçlar ----
  'fail-suclama':{
    degiskenler:['kim','sahip'],
    genel:[
      'Bana sorarsanız {kim}. Aralarında husumet vardı.',
      'Ben {kim} derim, beyim. Onun gözü dönüktür.',
      '{kim:e} bakın. {sahip:le} arası hiç iyi değildi.',
    ],
    korkak:[
      'Bilmem... {kim} olabilir... ben demedim ama.',
      '{kim}... belki... aralarında bir şey vardı...',
    ],
    dedikoducu:[
      'Bana sorarsanız beyim, bu işi {kim} yaptı; başka kim yapacak! {sahip:le} arası yıllardır bozuktu, köyde herkes bilir. Kaç kere birbirlerine bağırdıklarını duydum. Gidin onu sıkıştırın, görürsünüz nasıl kekeler.',
      '{kim}, müfettiş bey, {kim}! Ben bunu ilk günden biliyordum. Onun {sahip:e} nasıl baktığını görmediniz; kin vardı o gözlerde. Siz yeter ki üstüne gidin.',
    ],
    sert:[
      '{kim:e} bakın.',
      '{kim}. Kini vardı.',
    ],
    ofkeli:[
      '{kim} yaptı, başka kim olacak! Gidin onu sorgulayın!',
      'Ben mi? {kim:e} sorun asıl!',
    ],
    gururlu:[
      'Bu işi ancak {kim} gibisi yapar.',
      'Benim gibisinin aklına bile gelmez. {kim:e} bakın.',
    ],
    kurnaz:[
      'Ben bir şey demem ama {kim:in} o gece ne yaptığını bir sorun.',
      'Kimin işine yaradı, ona bakın: {kim}.',
    ],
  },

  // ---- Fail: bilmem ----
  'fail-bilmem':{
    degiskenler:['kim'],
    genel:[
      '{kim:i} kimin öldürdüğünü bilmem, beyim.',
      'Bilseydim söylerdim. Bilmiyorum.',
      'Allah bilir, ben bilmem.',
    ],
    korkak:[
      'Bilmem... bilmem beyim...',
      'Ben nereden bileyim... bilmiyorum...',
    ],
    dedikoducu:[
      'Ah beyim, keşke bilseydim! Köyde herkes bir şey söylüyor; kimi şunu diyor, kimi bunu. Ben duyduğumu söylerim ama gördüğüm yok; gördüğüm olsaydı ilk size koşardım, inanın.',
      '{kim:i} kim öldürdü, işte bütün köy bunu konuşuyor müfettiş bey. Ben de bilmiyorum, ama bir tahminim var; söylesem ayıp olur, söylemesem içim içimi yer.',
    ],
    sert:[
      'Bilmem.',
      'Bilseydim söylerdim.',
    ],
    ofkeli:[
      'Bilmiyorum! Bulmak sizin işiniz!',
      'Ben mi bileceğim? Bulun işte!',
    ],
    sakin:[
      'Allah bilir, beyim. Kul bilmez.',
      'Bilmiyorum. Gerçek bir gün çıkar.',
    ],
    saf:[
      'Bilmiyorum beyim. Çok üzüldüm.',
      'Kim yapar böyle bir şeyi? Bilmiyorum.',
    ],
  },

  // ---- Fail: susar ----
  'fail-susar':{
    degiskenler:['kim'],
    genel:[
      'Bunu bana sormayın, beyim.',
      '{kim} için bir şey diyemem.',
      'Bildiğim varsa da söylemem.',
    ],
    korkak:[
      'Sormayın... ne olur sormayın...',
      'Ben... bir şey diyemem beyim...',
    ],
    dedikoducu:[
      'Ah beyim, bu soruyu bana sormayın; bildiğim bir şey var mı yok mu, orası bende kalsın. Ağzımı açarsam köyde iki aile birbirine girer. Siz başka yerden bulun, ben de bulduğunuz gün size hak veririm.',
      'Müfettiş bey, bazı şeyler bilinir ama söylenmez. Bu da onlardan. {kim} için çok ağladım, ama ağlamak başka, ad vermek başka.',
    ],
    sert:[
      'Söylemem.',
      'Sormayın.',
    ],
    sakin:[
      'Bunu söylemek bana düşmez.',
      'Kimin günahı varsa Allah\'a kalsın.',
    ],
  },

  // ---- Fark etti: kanlı giysi ----
  'tuhaf-kanli':{
    degiskenler:['kim','ortu','zaman'],
    genel:[
      '{zaman} {kim:in} {ortu:si+de} kan vardı, beyim.',
      '{kim:in} {ortu:si+de} kan lekesi gördüm. Sormadım.',
      '{zaman} {kim:i} gördüm; {ortu:si} kanlıydı.',
    ],
    korkak:[
      '{kim:in}... {ortu:si+de}... kan gibi bir şey vardı...',
      'Kan vardı... ben bir şey demedim ama...',
    ],
    dedikoducu:[
      'Beyim, size bir şey söyleyeceğim ama aramızda kalsın: {zaman} {kim:in} {ortu:si+de} kan vardı! Hem de taze; o da fark ettirmemek için eteğini çekiştirip durdu. Ben görmezden geldim ama içim titredi.',
      'Aman müfettiş bey, {kim:i} {zaman} bir gördüm, {ortu:si} kan içindeydi! Kurban kestim dese inanırdım, ama köyde kimse kurban kesmedi ki!',
    ],
    sert:[
      '{ortu:si+de} kan vardı.',
      '{kim}. Üstü kanlıydı.',
    ],
    ofkeli:[
      '{kim:in} üstü kanlıydı! Gördüm!',
      'Kan vardı üstünde! Ne bekliyorsunuz?',
    ],
    saf:[
      '{kim:in} {ortu:si+de} kan vardı beyim. Elini mi kesti acaba?',
      '{zaman} {kim:in} üstünde kan gördüm. Sordum, bir şey demedi.',
    ],
  },

  // ---- Fark etti: tırmık ----
  'tuhaf-tirmik':{
    degiskenler:['kim','zaman'],
    genel:[
      '{zaman} {kim:in} yüzünde taze tırnak izleri vardı.',
      '{kim:in} elinde, boynunda tırmık vardı, beyim.',
      '{kim:i} gördüm; yüzü tırmıklanmıştı.',
    ],
    korkak:[
      '{kim:in} yüzünde... tırmık vardı... bilmem.',
      'Tırnak izi gibi... bir şey vardı...',
    ],
    dedikoducu:[
      'Beyim, {zaman} {kim:in} yüzünü bir görseydiniz! Taze tırnak izleri, boynunda da kızarıklık. Sordum, "kedi tırmaladı" dedi. Kedi mi? O evde kedi yok ki beyim!',
      'Müfettiş bey, {kim} {zaman} kahveye geldi, boynunu atkıyla saklıyordu; ama ben gördüm, tırnak izi vardı. Kimle boğuştu, onu bir sorun.',
    ],
    sert:[
      'Yüzü tırmıklıydı.',
      '{kim}. Tırnak izi vardı.',
    ],
    ofkeli:[
      'Yüzü tırmık içindeydi! Kör müyüm ben?',
      '{kim:in} boynu tırmıklıydı!',
    ],
    saf:[
      '{kim:in} yüzü çizilmişti beyim. Düştü mü acaba?',
      'Tırmık vardı yüzünde. Kedi mi tırmaladı dedim.',
    ],
  },

  // ---- Fark etti: eksik eşya ----
  'tuhaf-eksik-esya':{
    degiskenler:['kim','esya','zaman'],
    genel:[
      '{kim:in} {esya:si} hep üstünde olurdu. {zaman} yoktu.',
      '{zaman} baktım, {kim:in} {esya:si} yerinde değildi.',
      '{kim} {esya:si} olmadan gezmez. {zaman} yoktu.',
    ],
    korkak:[
      '{kim:in} {esya:si}... yoktu... bilmem.',
      'Bir şey eksikti... {esya}... herhalde...',
    ],
    dedikoducu:[
      'Beyim, bir şey dikkatimi çekti: {kim:in} {esya:si} hep üstünde olur, yıllardır görürüm. {zaman} yoktu! Sordum, "evde unuttum" dedi; yalan, ben onun evini bilirim. Kaybetmiş, hem de söylemek istemediği bir yerde kaybetmiş.',
      'Müfettiş bey, {kim:in} {esya:si} kayıp, köyde herkes fark etti ama kimse söylemiyor. {zaman} yoktu. Nerede düşürdü acaba, siz bulabildiniz mi?',
    ],
    sert:[
      '{esya:si} yoktu.',
      '{kim:in} {esya:si} eksik.',
    ],
    ofkeli:[
      '{esya:si} yoktu üstünde! Gördüm!',
      '{kim:in} {esya:si} kayıp! Sorun bakalım nerede!',
    ],
    saf:[
      '{kim:in} {esya:si} yoktu beyim. Kaybetmiş galiba.',
      '{zaman} {kim:in} {esya:si} yoktu. Bulursam götürürüm dedim.',
    ],
  },

  // ---- Fark etti: yırtık giysi ----
  'tuhaf-yirtik':{
    degiskenler:['kim','ortu','zaman'],
    genel:[
      '{zaman} {kim:in} {ortu:si} yırtıktı, beyim.',
      '{kim:in} {ortu:si} yırtılmıştı. Bir yere takılmış gibi.',
      '{kim:i} gördüm; {ortu:si} paramparçaydı.',
    ],
    korkak:[
      '{ortu:si}... yırtıktı... bilmem neden.',
      '{kim:in} üstü... yırtılmıştı...',
    ],
    dedikoducu:[
      'Beyim, {zaman} {kim:i} gördüm, {ortu:si} yırtık, sökük içindeydi! Sanki biri yakasına yapışmış, o da silkinip kaçmış. Sordum, "dikene takıldım" dedi; ama o yırtık diken yırtığı değil, ben terzi değilim ama anlarım.',
      'Müfettiş bey, {kim:in} {ortu:si} yırtılmıştı, hem de öyle böyle değil. Yüzü de bembeyazdı. Bir şey gördü, bir şey yaşadı; ama ağzını açmıyor.',
    ],
    sert:[
      '{ortu:si} yırtıktı.',
      'Üstü yırtıktı. O kadar.',
    ],
    ofkeli:[
      '{ortu:si} yırtıktı! Biriyle boğuşmuş!',
      'Yırtık içindeydi! Sorun ona!',
    ],
    saf:[
      '{kim:in} {ortu:si} yırtılmıştı beyim. Dikmeyi teklif ettim.',
      '{zaman} {kim:in} üstü yırtıktı. Düşmüş galiba.',
    ],
  },

  // ---- Fark etti: kendi aleti çalınmış ----
  'tuhaf-eksik-alet':{
    degiskenler:['esya','zaman'],
    genel:[
      '{esya} kayboldu, beyim. Benimdi; {zaman} yerinde yoktu.',
      '{zaman} baktım, {esya} yerinde değildi. Çalmışlar.',
      'Benim {esya} kayıp. {zaman} fark ettim.',
    ],
    korkak:[
      '{esya}... kayboldu... ben bir şey yapmadım.',
      'Benim... {esya}... çalınmış galiba...',
    ],
    dedikoducu:[
      'Beyim, size ilk ben söyleyeyim: {zaman} baktım ki {esya} yerinde yok! Her akşam aynı yere koyarım, yirmi yıldır şaşmadım. Biri gelip almış, hem de bilerek almış. Şimdi düşünüyorum da tüylerim ürperiyor.',
      'Müfettiş bey, {esya} çalındı, kime söyleyeceğimi bilemedim. {zaman} fark ettim. Kim aldıysa benim başımı yakmak için aldı, bundan eminim.',
    ],
    sert:[
      '{esya} çalındı.',
      '{zaman} çaldılar. {esya}.',
    ],
    ofkeli:[
      '{esya} çalındı! Hırsızı bulun!',
      'Benden çaldılar! {esya}!',
    ],
    saf:[
      '{esya} kayboldu beyim! Siz gördünüz mü?',
      '{zaman} {esya} yoktu. Herkese sordum.',
    ],
  },

  // ---- Fark etti: yatağında yoktu ----
  'tuhaf-yokluk':{
    degiskenler:['kim','zaman'],
    genel:[
      '{zaman} {kim} yatağında yoktu, beyim.',
      '{zaman} kalktım; {kim} evde yoktu.',
      '{kim} {zaman} dışarıdaydı. Nereye gitti bilmem.',
    ],
    korkak:[
      '{kim}... yatağında yoktu... ben sormadım.',
      'Yoktu... gece yoktu beyim...',
    ],
    dedikoducu:[
      'Beyim, bir şey söyleyeyim mi? {zaman} gözüm açıldı, baktım {kim} yatağında yok! Kapı aralık, ayakkabıları da yok. Sabaha karşı geldi, sessizce yattı. Nereden geldi diye sormadım, ama ben anladım ki bir iş var.',
      'Müfettiş bey, {zaman} {kim} evde değildi, yemin ederim. Yatağı soğuktu. Sabah sordum, "bir yere çıkmadım" dedi. Bana mı yalan söyleyecek, ben o evin her gıcırtısını bilirim!',
    ],
    sert:[
      '{kim} yatağında yoktu.',
      'Gece dışarıdaydı.',
    ],
    ofkeli:[
      'Yatağında yoktu! Nereye gittiyse!',
      '{kim} yoktu evde! Gidin ona sorun!',
    ],
    saf:[
      '{kim} gece yoktu beyim. Merak ettim.',
      '{zaman} kalktım, {kim} yoktu. Sabah geldi.',
    ],
  },

  // ---- Fark ettiği bir şey yok ----
  'tuhaf-yok':{
    degiskenler:['kim'],
    genel:[
      'Tuhaf bir şey görmedim, beyim.',
      'Gözüme bir şey çarpmadı. Herkes kendi hâlindeydi.',
      '{kim} öldü öleli köy suskun. Başka bir şey görmedim.',
    ],
    korkak:[
      'Görmedim... bir şey görmedim...',
      'Yok beyim... bir şey yok...',
    ],
    dedikoducu:[
      'Ah beyim, ilk defa söylüyorum, gözüme tuhaf bir şey çarpmadı! {kim} öldü öleli herkes evine kapandı, kahvede bile kimse konuşmuyor. Bu sessizlik bana hiç iyi gelmiyor; sessiz köyde kötü işler döner.',
      'Tuhaf bir şey mi? Müfettiş bey, bu köyde her şey tuhaf ki hangisini söyleyeyim! Ama sizin aradığınız türden bir şey görmedim, yemin ederim; görsem çoktan söylemiştim.',
    ],
    sert:[
      'Görmedim.',
      'Bir şey yok.',
    ],
    ofkeli:[
      'Bir şey görmedim! Herkese bunu mu soruyorsunuz?',
      'Yok! Tuhaf olan sizin bu sorularınız!',
    ],
    kurnaz:[
      'Ben bir şey görmedim. Ama görenler susuyordur, bilirsiniz.',
      'Tuhaf bir şey yok. Herkes çok sakin; tuhaf olan da bu.',
    ],
    saf:[
      'Görmedim beyim. Ama çok korkuyorum.',
      'Yok, bir şey görmedim. Herkes ağlıyor sadece.',
    ],
  },

  // ---- Sır: başkasını anlatır (ardından sır cümlesi gelir) ----
  'sir-anlatir':{
    degiskenler:['kim'],
    genel:[
      '{kim} hakkında bir şey bilirim; benden duymuş olmayın.',
      'Söyleyeyim, beyim. {kim} için şunu bilirim:',
      'Kimseye söylemedim ama size söyleyeyim.',
    ],
    korkak:[
      'Ben... duydum ki... benden duymayın ama...',
      '{kim:mi}? Şey... söyleyeyim mi... peki...',
    ],
    dedikoducu:[
      'Ah beyim, {kim:i} sordunuz ya, oturun da anlatayım; bunu köyde üç kişi bilir, biri de benim! Kimseye söylemedim, yemin ederim; ama size söylemezsem içim çatlar. Bakın şimdi:',
      'Müfettiş bey, {kim} hakkında bir şey diyeceğim ama sonra benim adımı anmayın. Herkes onu bir bilir, ben başka bilirim. Kulağınızı verin:',
    ],
    sert:[
      'Bir şey bilirim.',
      'Söyleyeyim. Kısaca.',
    ],
    ofkeli:[
      'Madem soruyorsunuz, söyleyeyim!',
      '{kim:mi}? Bakın ne yaptı!',
    ],
    kurnaz:[
      'Bunu size bedavaya söylüyorum, unutmayın.',
      '{kim} hakkında mı? Bir şey bilirim ama benden duymadınız.',
    ],
    saf:[
      '{kim:i} mi soruyorsunuz? Bildiğimi söyleyeyim:',
      'Ben biliyorum beyim, söyleyeyim:',
    ],
  },

  // ---- Sır: kendi sırrını, karşısındaki kişiyle ilgili ----
  'sir-kendi-anlatir':{
    degiskenler:['kim'],
    genel:[
      '{kim:le} aramızda bir şey var, beyim. Söyleyeyim, ama aramızda kalsın.',
      'Bunu kimseye söylemedim. {kim:le} ilgili, benimle ilgili.',
      '{kim} denince içim burkulur, müfettiş bey. Anlatayım.',
    ],
    korkak:[
      '{kim:le}... benim aramda... bir şey var...',
      'Ben... söylemesem olmaz mı... peki...',
    ],
    dedikoducu:[
      'Ah beyim, {kim:i} sordunuz ya, işte orası benim de yaram. Herkesin sırrını bilirim, kendiminkini kimseye söylemedim; ama madem sordunuz, bugün söyleyeyim, içimde taş gibi duruyor.',
      'Müfettiş bey, {kim} ile benim aramda kimsenin bilmediği bir iş var. Söylersem başıma ne gelir bilmem, ama söylemezsem de rahat uyuyamam.',
    ],
    sert:[
      'Aramızda bir iş var.',
      'Söyleyeyim. Bir kere.',
    ],
    sakin:[
      'Bunu yıllardır taşıyorum, beyim. Söyleme vakti geldi galiba.',
      '{kim:le} aramızda eski bir hesap var. Anlatayım.',
    ],
  },

  // ---- Sır: inkâr ----
  'sir-yok':{
    degiskenler:['kim'],
    genel:[
      '{kim} hakkında kötü bir şey bilmem, beyim.',
      '{kim:in} saklayacak bir şeyi yoktur.',
      'Bildiğim bir şey yok. {kim} temiz insandır.',
    ],
    korkak:[
      'Bir şey bilmem... {kim} iyidir...',
      'Yok beyim... bilmem...',
    ],
    dedikoducu:[
      '{kim:mi}? Aman beyim, onun hakkında kötü söz söyleyen dilini ısırsın! Ben ondan bir fenalık görmedim, kimse de görmemiştir. Bu köyde herkesin bir kusuru var ama onunki yoktur, ben bilirim.',
      'Müfettiş bey, {kim} hakkında ne duyduysanız yalandır; ben yıllardır bilirim, temiz insandır. Kim sizi ona yönlendirdiyse kötü niyetlidir, onu da bir sorun.',
    ],
    sert:[
      'Bilmem bir şey.',
      'Temizdir.',
    ],
    ofkeli:[
      '{kim} hakkında laf ettirmem!',
      'Ne bileyim? Bir şey yok!',
    ],
    kurnaz:[
      '{kim} hakkında mı? Bir şey bilmem. Bilsem de söylemem, ama bilmem.',
      'Herkesin bir sırrı vardır; {kim:in} ki bende değil.',
    ],
  },

  // ---- Sır: bilmez ----
  'sir-bilmez':{
    degiskenler:['kim'],
    genel:[
      '{kim} hakkında bir şey bilmem, beyim. Herkesin içi kendine.',
      '{kim:in} işine karışmam. Bilmem.',
      'Bildiğim bir şey yok onun hakkında.',
    ],
    korkak:[
      'Bilmem... {kim:i} pek tanımam...',
      'Ben bir şey bilmem beyim...',
    ],
    dedikoducu:[
      '{kim:mi}? Ah beyim, onun hakkında köyde çok laf döner ama hangisi doğru, ben de bilmem; ben gördüğümü söylerim, duyduğumu değil. Gördüğüm de yok. Başkasına sorun, onun yakınlarına.',
      'Müfettiş bey, {kim} kendi hâlinde biridir; ne yapar ne eder, ben bilmem. Bilmediğim şeyi uydurup söyleyecek değilim ya, ben öyle biri değilim!',
    ],
    sert:[
      'Bilmem.',
      'Onun işi beni ilgilendirmez.',
    ],
    sakin:[
      'Kulun içini Allah bilir, beyim.',
      '{kim} hakkında bildiğim bir kötülük yok.',
    ],
    saf:[
      '{kim:i} pek tanımam beyim. İyi biridir herhalde.',
      'Bilmiyorum. Ona sorsanız?',
    ],
  },

  // ---- Kendi sırrını açar (saf) ----
  'sir-kendi-itiraf':{
    degiskenler:[],
    genel:[
      'Madem soruyorsunuz, söyleyeyim beyim. Kimseye söylemedim.',
      'Var, müfettiş bey. Söylersem rahatlarım belki.',
      'Bir şey var, evet. Anlatayım.',
    ],
    korkak:[
      'Var... bir şey var... söyleyeyim mi...',
      'Ben... peki... anlatayım beyim...',
    ],
    dedikoducu:[
      'Ah beyim, herkesin sırrını bilen benim de bir sırrım var tabii; kimse sormadı ki söyleyeyim! Siz sordunuz, söyleyeyim; ama bunu kahvede anlatmayın, ne olur.',
      'Müfettiş bey, ben başkalarını anlatırken kendimi hep unuturum; ama benim de bir yükü var içimin. Madem sordunuz, dökeyim ortaya.',
    ],
    sert:[
      'Var. Söyleyeyim.',
      'Var bir şey.',
    ],
    saf:[
      'Var beyim, kimseye söylememem lazımdı ama size söylerim.',
      'Söyleyeyim mi? Peki, söylüyorum.',
    ],
  },

  // ---- Kendi sırrını inkâr ----
  'sir-kendi-yok':{
    degiskenler:[],
    genel:[
      'Benim saklayacak neyim olacak, beyim?',
      'Bir şeyim yok. Ortadayım.',
      'Saklayacak bir şeyim yok, müfettiş bey.',
    ],
    korkak:[
      'Yok... benim bir şeyim yok...',
      'Ben mi? Yok beyim... yok...',
    ],
    dedikoducu:[
      'Benim mi? Aman beyim, benim hayatım ortada, köyün ortasındaki çeşme gibi; herkes gelir su içer, bakar geçer. Saklayacak bir şeyim olsa ben dayanamaz anlatırdım zaten, bilirsiniz.',
      'Müfettiş bey, ben başkasının sırrını taşırım, kendi sırrım yok. Hem olsa bile siz bunu benden değil, başkalarından duyardınız; bu köyde kimsenin sırrı kendine kalmaz.',
    ],
    sert:[
      'Yok.',
      'Saklayacak bir şeyim yok.',
    ],
    ofkeli:[
      'Ne saklayacağım? Hakaret mi bu?',
      'Yok öyle bir şey!',
    ],
    gururlu:[
      'Benim saklayacak bir şeyim olmaz.',
      'Benim hayatım herkesin önünde.',
    ],
    kurnaz:[
      'Herkesin bir sırrı var derler. Benimkini bulursanız bana da söyleyin.',
      'Saklayacak bir şeyim yok. Olsa da size söyler miydim?',
    ],
  },

  // ---- Kendi sırrı hakkında susar ----
  'kendi-susar-sir':{
    degiskenler:[],
    genel:[
      'Onu sormayın, beyim.',
      'Her şeyi söyleyemem, müfettiş bey.',
      'Bu benimle Allah arasında.',
    ],
    korkak:[
      'Sormayın... ne olur...',
      'Ben... söyleyemem...',
    ],
    dedikoducu:[
      'Ah beyim, beni böyle sıkıştırmayın; ben herkesin her şeyini söylerim ama bu benim, bunu söylersem kendi ayağıma kurşun sıkarım. Bu sefer susayım; siz de bana kızmayın.',
      'Müfettiş bey, her insanın bir köşesi vardır, kimse girmez. Benim de var. Oraya beni zorlamayın, başka ne isterseniz anlatırım.',
    ],
    sert:[
      'Söylemem.',
      'Sormayın.',
    ],
    sakin:[
      'Bazı şeyler söylenmez, beyim.',
      'Bunu sormayın. Cevabım yok.',
    ],
  },

  // ---- İlişki ----
  'iliski':{
    degiskenler:['kim','iliski'],
    genel:[
      '{iliski}, beyim.',
      '{kim:mi}? {iliski}.',
      '{iliski}. Herkes bilir.',
    ],
    korkak:[
      '{iliski}... o kadar.',
      '{kim:mi}? Şey... {iliski}...',
    ],
    dedikoducu:[
      '{kim:mi}? Ah beyim, {iliski}; bunu köyde bilmeyen yoktur ama ben daha iyi bilirim. Kaç yıl oldu, neler gördük neler geçirdik, anlatsam sabah olur. Siz kısaca bilin: aramızda öyle bir bağ var.',
      'Müfettiş bey, {iliski}. Bunu size kim sorduysa iyi sormuş; çünkü bu köyde kimin kimle ne alıp veremediği her şeyi açıklar. Ben size açık açık söyledim, gerisi sizin.',
    ],
    sert:[
      '{iliski}.',
      '{iliski}. Başka?',
    ],
    ofkeli:[
      '{iliski}! Bundan size ne?',
      '{iliski}! Bunu niye soruyorsunuz?',
    ],
    gururlu:[
      '{iliski}. Bunu size söylemem bile lütuftur.',
      '{iliski}. Benim gibilerin bağı bellidir.',
    ],
    kurnaz:[
      '{iliski}. Ama bunu soruyorsanız bir bildiğiniz var.',
      '{iliski}. Bu köyde herkes birbirine bir şekilde bağlıdır, beyim.',
    ],
    saf:[
      '{iliski} beyim. Ne oldu ki?',
      '{iliski}! Çok severim onu.',
    ],
  },

  // ---- İlişki: iyiydi (gizler) ----
  'iliski-iyi':{
    degiskenler:['kim'],
    genel:[
      '{kim:le} aramız iyiydi, beyim.',
      'İyiydik. Bir derdimiz yoktu.',
      '{kim:le} bir alıp veremediğim olmadı.',
    ],
    korkak:[
      'İyiydi... iyiydi beyim...',
      'Aramız... iyiydi... bir şey yoktu...',
    ],
    dedikoducu:[
      '{kim:le} mi? Aman beyim, aramız çok iyiydi, kim ne dediyse yalan! Selam verir, hatır sorardık; bayramda kapısına giderdim. Benim kimseyle bir derdim olmaz zaten, bunu bütün köy bilir.',
      'Müfettiş bey, {kim:le} benim aramda ne olacak? İyi komşuyduk, o kadar. Köyde başkaları onunla kavgalıydı, onları sorun; ben karışmam.',
    ],
    sert:[
      'İyiydi.',
      'Aramız iyiydi.',
    ],
    ofkeli:[
      'İyiydi! Ne ima ediyorsunuz?',
      'Aramız iyiydi dedim ya!',
    ],
    kurnaz:[
      '{kim:le} mi? İyiydik. Bu köyde iyi geçinmek zor, ama biz geçinirdik.',
      'Aramız iyiydi. Kimin iyi olmadığını ise siz bulun.',
    ],
  },

  // ---- İlişki: bir bağ yok ----
  'iliski-yok':{
    degiskenler:['kim'],
    genel:[
      '{kim:le} selamlaşırdık, o kadar.',
      'Pek bir alışverişimiz yoktu, beyim.',
      '{kim:i} tanırım ama yakınlığımız yoktu.',
    ],
    korkak:[
      'Tanırım... o kadar... başka bir şey yok...',
      'Selamlaşırdık... beyim...',
    ],
    dedikoducu:[
      '{kim:le} mi? Selamlaşırdık beyim, o kadar; ama ben onu uzaktan iyi bilirim, kiminle oturur kiminle kalkar, hepsini. Yakınlığımız yoktu ama gözüm üstündeydi, bu köyde herkesin gözü herkesin üstündedir.',
      'Müfettiş bey, {kim} ile benim ne alışverişim olur? Yolda görsem selam verirdim, bayramda elini öperdim. Ama onun hakkında anlatacak çok şey var, onu da bilin.',
    ],
    sert:[
      'Selamlaşırdık.',
      'Bir alışverişimiz yoktu.',
    ],
    saf:[
      '{kim:i} tanırım beyim. İyi insandır.',
      'Selam verirdim, o da alırdı.',
    ],
    gururlu:[
      '{kim} benim muhatabım değildir.',
      'Benim {kim:le} işim olmaz.',
    ],
  },

  // ---- Yüzleştirme: doğruyu söylüyordu, direnir ----
  'yuzlesme-israr-dogru':{
    degiskenler:['diger'],
    genel:[
      'Ben doğruyu söyledim, beyim. {diger} yanılıyor.',
      '{diger} ne derse desin, ben gördüğümü söyledim.',
      'Ben sözümün arkasındayım. {diger:e} bir daha sorun.',
    ],
    korkak:[
      'Ben... doğruyu söyledim... vallahi...',
      '{diger} yanılıyor... ben yalan söylemem beyim...',
    ],
    dedikoducu:[
      'Beyim, ben ne söylediysem doğrusudur, yemin ederim! {diger} neden öyle diyor bilmem; ya yanlış gördü ya da bir bildiği var. Bu köyde herkes bir şey saklar ama ben saklamam; sorun herkese, benim dilim düzdür.',
      '{diger:mi}? Aman müfettiş bey, onun sözüne mi inandınız? Ben gördüğümü söyledim, ne eksik ne fazla. O neden başka söylüyor, asıl siz onu düşünün.',
    ],
    sert:[
      'Doğruyu söyledim.',
      '{diger} yanılıyor.',
    ],
    ofkeli:[
      'Ben yalancı mıyım? {diger:i} getirin karşıma!',
      'Doğruyu söyledim! {diger} ne derse desin!',
    ],
    gururlu:[
      'Benim sözüm değişmez, beyim.',
      '{diger:in} sözü benimkinin yanında ne ki?',
    ],
    sakin:[
      'Ben doğruyu söyledim, beyim. Gerisi Allah\'a kalmış.',
      '{diger} neden öyle diyor bilmem. Ben doğruyu söyledim.',
    ],
  },

  // ---- Yüzleştirme: tanık gösterir ----
  'yuzlesme-tanik':{
    degiskenler:['kim'],
    genel:[
      'İsterseniz {kim:e} sorun, o da oradaydı.',
      '{kim} de oradaydı; o söyler.',
      '{kim:e} sorun, beni gördü.',
    ],
    korkak:[
      '{kim}... o da oradaydı... sorun...',
      '{kim:e} sorun... o bilir...',
    ],
    dedikoducu:[
      'Hem de yalnız değildim beyim, {kim} de oradaydı; gidin sorun, o da söyler! Benim yalanım olsa {kim} gibi biri karşıma geçip yüzüme vururdu, değil mi?',
      'Müfettiş bey, bir şahidim var: {kim}. O da oradaydı, beni gördü, ben onu gördüm. Ona sorun, benim lafımı tekrarlayacak, göreceksiniz.',
    ],
    sert:[
      '{kim:e} sorun.',
      '{kim} de oradaydı.',
    ],
    ofkeli:[
      '{kim:e} sorun! O da oradaydı!',
      'Gidin {kim:e} sorun!',
    ],
  },

  // ---- Yüzleştirme: yalanında direnir ----
  'yuzlesme-israr-yalan':{
    degiskenler:['diger'],
    genel:[
      '{diger} yalan söylüyor, beyim. Ben ne dediysem o.',
      'Ben sözümü değiştirmem. {diger:in} bir garezi var.',
      '{diger} ne derse desin. Benim söylediğim doğru.',
    ],
    korkak:[
      'Ben... ben doğruyu söyledim... {diger}... yanılıyor...',
      'Yok... öyle değil... {diger} yanlış biliyor...',
    ],
    dedikoducu:[
      '{diger:mi}? Aman beyim, onun lafına mı kandınız! O benim üstüme yıllardır bir şey atmak ister, şimdi fırsatını bulmuş. Ben ne söylediysem odur; isterseniz yemin ederim, Kuran\'a el basarım.',
      'Müfettiş bey, {diger} yalan söylüyor, hem de bile bile. Neden mi? Onu siz bulun; ama benim sözüm değişmez, değişmeyecek de.',
    ],
    sert:[
      '{diger} yalan söylüyor.',
      'Sözüm aynı.',
    ],
    ofkeli:[
      '{diger} yalancının teki! Getirin karşıma!',
      'Bana yalancı mı diyorsunuz? {diger} yalan söylüyor!',
    ],
    gururlu:[
      '{diger:in} sözüyle benim sözüm bir mi?',
      'Benim sözüm senettir. {diger:in} ki değil.',
    ],
    kurnaz:[
      '{diger} öyle diyorsa bir bildiği vardır. Ama yanılıyor.',
      'İkimizden biri yanılıyor, beyim. Ben olmadığıma eminim.',
    ],
    saf:[
      '{diger} yanlış hatırlıyor beyim. Ben doğruyu söyledim.',
      'Ben yalan söylemem ki! {diger} yanılıyor.',
    ],
  },

  // ---- Yüzleştirme: yerini itiraf eder ----
  'yuzlesme-itiraf-yer':{
    degiskenler:['zaman','yer'],
    genel:[
      'Peki... {zaman} {yer:de+dim}. Ama o işle bir ilgim yok, beyim.',
      'Yalan söyledim, doğru. {zaman} {yer:de+dim}. Nedenini de söyleyeyim.',
      'Tamam, saklamayayım. {yer:de+dim}. Utancımdan söyleyemedim.',
    ],
    korkak:[
      'Ben... {yer:de+dim}... ama yemin ederim kötü bir şey yapmadım...',
      'Peki... {yer:de+dim}... söyleyemedim beyim, korktum...',
    ],
    dedikoducu:[
      'Peki beyim, peki; madem öyle, söyleyeyim: {zaman} {yer:de+dim}. Size yalan söyledim, kabul, ama başka türlü söylesem köyde adım çıkardı, bir daha kimsenin yüzüne bakamazdım. Neden orada olduğumu da anlatayım, siz anlayışlı birisiniz.',
      'Müfettiş bey, beni köşeye sıkıştırdınız, tamam: {zaman} {yer:de+dim}. Ama o kanla benim hiçbir ilgim yok; orada başka bir iş için bulunuyordum, şimdi onu da söyleyeceğim.',
    ],
    sert:[
      'Peki. {yer:de+dim}.',
      'Yalan söyledim. {yer:de+dim}.',
    ],
    ofkeli:[
      'Tamam, {yer:de+dim}! Ama öldürmedim!',
      '{yer:de+dim}, evet! Mutlu musunuz?',
    ],
    gururlu:[
      '{yer:de+dim}. Bunu söylemek bana ağır geliyor, ama söylüyorum.',
      'Peki. {zaman} {yer:de+dim}. Gerisini bilmeniz gerekmez.',
    ],
    saf:[
      '{yer:de+dim} beyim. Yalan söylediğim için özür dilerim.',
      'Ben {zaman} {yer:de+dim}. Kimse bilmesin istedim.',
    ],
  },

  // ---- Yüzleştirme: sırrını itiraf eder ----
  'yuzlesme-itiraf-sir':{
    degiskenler:[],
    genel:[
      'Peki, saklamayacağım. Söyleyeyim, beyim.',
      'Doğru, bir şey sakladım. Anlatayım.',
      'Tamam. Kimse bilmesin istedim ama söyleyeceğim.',
    ],
    korkak:[
      'Peki... peki... söyleyeyim...',
      'Ben... sakladım, evet... anlatayım...',
    ],
    dedikoducu:[
      'Peki beyim, peki; beni yakaladınız. Ben herkesin sırrını bilirim de kendiminkini saklarım, ne tuhaf değil mi? Söyleyeyim, ama bu odadan dışarı çıkmasın, ne olur.',
      'Müfettiş bey, madem iş bu noktaya geldi, saklamanın anlamı yok. Size anlatacağım, ama sonra bana öyle bakmayın.',
    ],
    sert:[
      'Peki. Söyleyeyim.',
      'Sakladım. Anlatayım.',
    ],
    ofkeli:[
      'Peki, söyleyeyim! Ama bu cinayetle ilgisi yok!',
      'Tamam! Saklamayacağım!',
    ],
    gururlu:[
      'Bunu söylemek bana yakışmaz, ama söyleyeceğim.',
      'Peki. Gururumu bir kenara koyayım.',
    ],
  },

  // ---- Yüzleştirme: korumaktan vazgeçer ----
  'yuzlesme-cozulme':{
    degiskenler:['kim'],
    genel:[
      'Yalan söyledim, beyim. {kim:i} korumak istedim.',
      'Peki... doğrusunu söyleyeyim. {kim} için yalan söyledim.',
      'Ne diyeyim, {kim:i} korudum. Doğrusu şu:',
    ],
    korkak:[
      '{kim:i}... korumak istedim... doğrusu...',
      'Ben... {kim} için... yalan söyledim beyim...',
    ],
    dedikoducu:[
      'Ah beyim, ne diyeyim, {kim:i} korumak istedim; insan kendi kanından olanı korur, siz de korurdunuz. Ama madem iş buraya geldi, doğrusunu söyleyeyim, Allah affetsin:',
      'Müfettiş bey, {kim} benim canım, onun için yalan söyledim; ama yalanla ölü dirilmez, bunu da bilirim. Doğrusu şu:',
    ],
    sert:[
      '{kim:i} korudum. Doğrusu şu.',
      'Yalan söyledim. {kim} için.',
    ],
    ofkeli:[
      'Tamam! {kim} için yalan söyledim! Doğrusu şu:',
      '{kim:i} korudum, ne olmuş?',
    ],
    gururlu:[
      'Kendi insanımı korudum, beyim. Ama doğrusu şu:',
      '{kim} için yalan söyledim. Bu benim zaafım.',
    ],
  },

  // ---- Yüzleştirme: eşyasını kabul eder ----
  'yuzlesme-itiraf-esya':{
    degiskenler:['esya'],
    genel:[
      'Peki, bu {esya} benim. Korktum, inkâr ettim.',
      'Benim, beyim. Söyleyemedim, başım yanar diye.',
      'Tamam, benim. Ama nedenini söyleyeyim.',
    ],
    korkak:[
      'Benim... benim beyim... korktum...',
      'Peki... benim... ama ben yapmadım...',
    ],
    dedikoducu:[
      'Peki beyim, peki, benim; inkâr ettim çünkü bu köyde eşyası olay yerinde bulunanın başı yanar, bilirsiniz. Ama ben masumum; nasıl oraya düştüğünü de anlatayım, dinleyin:',
      'Müfettiş bey, beni yakaladınız: benim. Söyleyemedim, çünkü söyleseydim bütün köy bana katil gözüyle bakardı. Şimdi dinleyin bakalım nasıl oldu:',
    ],
    sert:[
      'Benim. Korktum.',
      'Peki. Benim.',
    ],
    kurnaz:[
      'Peki, benim. Ama inkâr etmemin bir sebebi vardı.',
      'Benim, evet. Siz de olsanız inkâr ederdiniz.',
    ],
  },

  // ---- Selam (sorguya girerken) ----
  // ---- Yan bilgi: soruyu bilmeyen, bildiği başka bir şeyi söyler (cevap.js yanBilgi) ----
  'yan-giris':{
    degiskenler:[],
    genel:[
      'Ama size başka bir şey söyleyeyim.',
      'Onu bilmem; ama bildiğim bir şey var.',
      'Bilmem. Yalnız aklıma bir şey geldi.',
    ],
    korkak:[
      'Bilmem... ama bir şey var...',
      'Ben... başka bir şey biliyorum... belki...',
    ],
    dedikoducu:[
      'Onu bilmem beyim, vallahi bilmem; ama madem sordunuz, size başka bir şey anlatayım ki bu köyde kimsenin aklına gelmez, ben de kimseye söylemedim, siz ilk duyan olursunuz.',
      'Ah beyim, o konuda bir şey diyemem, yalan olur; ama durun, gitmeden şunu da dinleyin, belki işinize yarar belki yaramaz, ben söyleyeyim siz tartın.',
    ],
    sert:[
      'Bilmem. Ama şu var.',
      'Onu bilmem. Başkasını bilirim.',
    ],
    kurnaz:[
      'Onu bilmem. Ama size bedava bir şey söyleyeyim.',
      'Bilmediğimi söylemem beyim; bildiğimi söylerim.',
    ],
    saf:[
      'Onu bilmem beyim. Ama başka bir şey biliyorum, söyleyeyim mi?',
      'Bilmiyorum. Ama bildiğim bir şey var, onu söyleyeyim.',
    ],
  },
  'yan-duyum':{
    degiskenler:[],
    genel:[
      'Köyde bir laf dolaşıyor, kimden çıktı bilmem.',
      'Duyduğuma göre, ama doğru mu bilmem:',
    ],
    korkak:[
      'Duydum ki... ama benden duymadınız...',
      'Bir laf var... kimden çıktı bilmem...',
    ],
    dedikoducu:[
      'Bunu kimden duydum, şimdi hatırlamıyorum beyim; çeşme başında mıydı, bakkalın önünde mi, ama bütün köy fısır fısır bunu konuşuyor, siz de bilin.',
      'Beyim, ben görmedim ama duydum; bu köyde laf rüzgâr gibi gezer, çoğu zaman nereden estiği bellidir, gerçi bu sefer ben de bilmiyorum.',
    ],
    sert:[
      'Laf dolaşıyor.',
      'Duydum. Doğru mu, bilmem.',
    ],
  },
  'yan-kavga':{
    degiskenler:['kim','diger'],
    genel:[
      '{kim:in} {diger:le} arası hiç iyi değildi.',
      '{kim} ile {diger} kanlı bıçaklıydı, herkes bilir.',
    ],
    korkak:[
      '{kim}... {diger:le} kavgalıydı... galiba.',
      '{kim:in} {diger:le} arası... bozuktu...',
    ],
    dedikoducu:[
      '{kim:in} {diger:le} arası çoktandır bozuk beyim; geçen bayram köy odasının önünde öyle bir bağırıştılar ki imam araya girdi, yoksa kan çıkacaktı. O günden beri selam bile vermezler.',
      'Bakın, {kim} ile {diger} yıllardır düşman; tarla meselesi mi, eski bir laf mı, kimse tam bilmez ama ikisi aynı yolda yürümez. Biri sağdan giderse öbürü soldan gider.',
    ],
    sert:[
      '{kim} ile {diger} kavgalıydı.',
      '{kim:in} {diger:le} arası bozuk.',
    ],
  },
  'yan-borc':{
    degiskenler:['kim','diger'],
    genel:[
      '{kim:in} {diger:e} borcu vardı, ödeyemiyordu.',
      '{kim}, {diger:e} borçluydu; bunu bilen bilir.',
    ],
    korkak:[
      '{kim}... {diger:e} borçluydu... öyle duydum...',
      'Borç meselesi var... {kim} ile {diger} arasında...',
    ],
    dedikoducu:[
      '{kim:in} {diger:e} borcu boğazına kadar beyim; tarla için almış, ödeyemedi, üstüne bindi, şimdi kapısının önünden geçerken başını yere eğiyor. Bunu bilmeyen yok ama kimse yüksek sesle söylemez.',
      'Size bir şey söyleyeyim: {kim}, {diger:e} öyle bir borçlu ki hasat da kurtarmaz; geçen ay ikisi bakkalın önünde konuşurken ben oradaydım, sesleri yükseldi, sonra {kim} başını öne eğip gitti.',
    ],
    sert:[
      '{kim}, {diger:e} borçluydu.',
      '{kim:in} {diger:e} borcu var.',
    ],
  },
  'yan-korku':{
    degiskenler:['kim','diger'],
    genel:[
      '{kim}, {diger:den} korkardı; yüzüne bakamazdı.',
      '{kim} ile {diger} arasında bir korku vardı; {kim} hep çekinirdi.',
    ],
    korkak:[
      '{kim}... {diger:den} korkardı... benim gibi...',
      '{kim}... çekinirdi... {diger:den}...',
    ],
    dedikoducu:[
      '{kim} beyim, {diger:den} ödü kopardı; {diger} köy odasına girdi mi {kim} bir bahane bulup çıkar giderdi. Neden korkardı, ne biliyordu, orasını ben söyleyemem ama göz gördüğünü saklamaz.',
      'Bunu herkes görür: {kim}, {diger} karşısında küçülür, sesi titrer. Bir keresinde çeşme başında {diger} ona bir şey fısıldadı, {kim:in} rengi attı; o gün bu gündür ikisi yan yana gelmez.',
    ],
    sert:[
      '{kim}, {diger:den} korkardı.',
      '{kim} çekinirdi. Hem de çok.',
    ],
  },
  'yan-yonlendir-fark':{
    degiskenler:['kim'],
    genel:[
      '{kim} bir şey görmüş, bana öyle dedi; başkasına söylemedi. Ona sorun.',
      'Siz {kim:e} sorun; o günlerde bir şey gözüne çarpmış.',
    ],
    korkak:[
      '{kim:e} sorun... o bir şey gördü...',
      '{kim}... bir şey demişti... ona sorun...',
    ],
    dedikoducu:[
      'Beyim, ben görmedim ama {kim} gördü; geçen akşam bana fısıldadı, kimseye söyleme dedi, ben de söylemedim, size söylüyorum çünkü siz devletsiniz. Onu çağırın, ama benden duyduğunuzu söylemeyin.',
      'Size bir yol göstereyim: {kim:e} sorun. O sabah bir şey gördü, yüzü bembeyaz oldu, ama korkudan kimseye açmadı; bana bile yarım ağızla anlattı.',
    ],
    sert:[
      '{kim:e} sorun. O gördü.',
      '{kim} bir şey gördü. Ona sor.',
    ],
  },
  'yan-yonlendir-iz':{
    degiskenler:['kim','esya'],
    genel:[
      'Bu {esya} kimin, ben bilmem; {kim} bilir, onun gözünden bir şey kaçmaz.',
      'Bunu soracaksanız {kim:e} sorun.',
    ],
    korkak:[
      '{kim:e} sorun... o bilir...',
      'Ben bilmem... {kim} bilir belki...',
    ],
    dedikoducu:[
      'Bu {esya} kimin, vallahi şimdi çıkaramadım beyim; ama {kim:e} sorun, o köyde kimin evinde ne var, kim neyi nereye koymuş, hepsini bilir. Benden bile iyi bilir, düşünün artık.',
      'Ah beyim, ben bunu bir yerde gördüm ama nerede, kimde, aklıma gelmiyor; {kim} bilir ama, onun evi herkesin evine yakın, gözü de keskindir.',
    ],
    sert:[
      '{kim} bilir. Ona sor.',
      'Bilmem. {kim:e} sor.',
    ],
  },

  'selam':{
    degiskenler:[],
    genel:[
      'Selamünaleyküm, beyim. Çağırmışsınız.',
      'Buyurun, müfettiş bey. Ne soracaktınız?',
      'Hayırdır beyim? Beni çağırmışsınız.',
    ],
    korkak:[
      'Beni mi... çağırdınız beyim?',
      'Selam... beyim... bir şey mi oldu?',
      'Ben... geldim beyim...',
    ],
    dedikoducu:[
      'Selamünaleyküm müfettiş bey, hoş geldiniz köyümüze; gerçi hoş bir zamanda gelmediniz ama! Beni çağırmanız iyi oldu, bu köyde olan biten ne varsa bende var. Sorun bakalım, ne soracaksanız.',
      'Aman beyim, nihayet beni de çağırdınız! Bekliyordum zaten; köyde herkes sizin geldiğinizi konuşuyor, kimi korkuyor, kimi seviniyor. Ben sevinenlerdenim. Buyurun, anlatayım.',
    ],
    sert:[
      'Geldim. Sorun.',
      'Buyurun. Vaktim az.',
      'Çağırmışsınız. Söyleyin.',
    ],
    ofkeli:[
      'Beni niye çağırdınız? İşim gücüm var!',
      'Hayırdır? Beni de mi şüpheli sayıyorsunuz?',
    ],
    gururlu:[
      'Beni ayağınıza çağırdınız, geldim. Sorun.',
      'Müfettiş bey. Ben genelde çağrılmam; ama bu sefer geldim.',
    ],
    kurnaz:[
      'Buyurun beyim. Size nasıl yardımcı olabilirim, bir bakalım.',
      'Hoş geldiniz, beyim. Ben de sizi görmek istiyordum aslında.',
    ],
    saf:[
      'Merhaba beyim! Beni mi çağırdınız? Ne güzel.',
      'Geldim beyim. Bir yardımım dokunur mu?',
    ],
    sakin:[
      'Selamünaleyküm, beyim. Buyurun, sorun.',
      'Allah yardımcınız olsun, müfettiş bey. Ne soracaksınız?',
    ],
  },

  // ---- Sabrı tükenir, kalkar ----
  'sabir-bitti':{
    degiskenler:[],
    genel:[
      'Bu kadar soru yeter, beyim. Benim işim var.',
      'Müsaadenizle, kalkayım artık.',
      'Bildiklerimi söyledim. Gideyim.',
    ],
    korkak:[
      'Gidebilir miyim... beyim?',
      'Ben... artık gideyim mi...',
    ],
    dedikoducu:[
      'Beyim, ben anlatırım anlatırım da evde ocakta yemek var, yanacak; müsaadenizle kalkayım. Ama yine çağırın beni, aklıma bir şey gelirse ben size koşarım, söz.',
      'Müfettiş bey, dilimde tüy bitti, bugünlük bu kadar olsun. Yarın yine gelirim, hem belki o zamana kadar yeni bir şey duyarım.',
    ],
    sert:[
      'Yeter. Gidiyorum.',
      'Bu kadar.',
    ],
    ofkeli:[
      'Yeter artık! Ben gidiyorum!',
      'Sorgu bitti mi? Bitti! Kalkıyorum!',
    ],
    gururlu:[
      'Size yeterince vakit ayırdım. Kalkıyorum.',
      'Bu kadarı yeter, müfettiş bey.',
    ],
  },
};

// Müfettişin soruları. Tek ses: mizaca göre değişmez, ama her soru için birkaç söyleyiş var.
// Değerler: zaman (zaman.js), kim, diger (kisiAdi), yer (mekanAdi ya da 'evi'), esya (iz adı).
export const SORU_KALIPLARI={
  'yer':[
    '{zaman} neredeydin?',
    '{zaman} nerede olduğunu anlat.',
    '{zaman} neredeydin, söyle bakalım.',
  ],
  'gordu':[
    '{zaman} bir şey gördün mü, duydun mu?',
    '{zaman} kimi gördün?',
    '{zaman} gözüne ya da kulağına bir şey çarptı mı?',
  ],
  'baskasi':[
    '{zaman} {kim} neredeydi, bilir misin?',
    '{zaman} {kim:i} gördün mü?',
    '{kim} {zaman} neredeydi?',
  ],
  'baskasi-siluet':[
    '{zaman} gördüğün o {ortu} giyen, {kim} olabilir mi?',
    '{zaman} {ortu} giyen birini görmüşsün. O, {kim} olabilir mi?',
    '{zaman} {kim:i} gördün mü? {ortu} giyen oydu belki.',
  ],
  'iz-kimin':[
    'Bu {esya} kimin olabilir?',
    'Şu {esya:i} tanıyor musun?',
    'Olay yerinde bu {esya} vardı. Kimin, bilir misin?',
  ],
  'iz-senin':[
    'Bu {esya} senin mi?',
    'Olay yerinde bu {esya} vardı. Senin mi?',
    'Şu {esya:e} bir bak. Senin değil mi?',
  ],
  'fail':[
    '{kim:i} kim öldürdü, bir bildiğin var mı?',
    'Sence {kim:i} kim öldürdü?',
    '{kim:i} öldüreni biliyor musun?',
  ],
  'fark':[
    '{kim} öldüğünden beri tuhaf bir şey gözüne çarptı mı?',
    '{kim:in} ölümünden sonra köyde garip bir şey gördün mü?',
    '{kim} öldükten sonra birinde bir tuhaflık fark ettin mi?',
  ],
  'sir':[
    '{kim} hakkında köyde ne konuşulur?',
    '{kim} hakkında bildiğin bir şey var mı?',
    '{kim:in} saklamak istediği bir şey var mı?',
  ],
  'sir-kendi':[
    'Senin saklamak istediğin bir şey var mı?',
    'Bu köyde herkesin bir sırrı var. Seninki ne?',
    'Benden sakladığın bir şey var mı?',
  ],
  'iliski':[
    '{kim:le} aran nasıldı?',
    '{kim:le} ne alışverişin vardı?',
    '{kim:i} nereden tanırsın?',
  ],
  'yuzlesme-kendi':[
    'Bana iki ayrı şey söyledin. Hangisi doğru?',
    'Sözlerin birbirini tutmuyor. Hangisi doğru?',
  ],
  'yuzlesme-sen-orada':[
    '{diger}, {zaman} {yer:de} olduğunu söylüyor. Sen başka dedin.',
    '{diger} seni {zaman} {yer:de} gördüğünü söylüyor. Ne diyorsun?',
  ],
  'yuzlesme-sen-degil':[
    '{diger}, {zaman} {yer:de} olmadığını söylüyor.',
    '{diger:e} göre {zaman} {yer:de} değildin. Ne diyorsun?',
  ],
  'yuzlesme-o-orada':[
    '{kim} için başka söyledin, ama {diger} onun {zaman} {yer:de} olduğunu söylüyor.',
    '{diger:e} göre {kim} {zaman} {yer:de+di}. Sen başka dedin.',
  ],
  'yuzlesme-o-degil':[
    '{kim} için başka söyledin, ama {diger} onun {zaman} {yer:de} olmadığını söylüyor.',
    '{diger:e} göre {kim} {zaman} {yer:de} değildi. Ne diyorsun?',
  ],
  'yuzlesme-o-kendi':[
    '{kim} için başka söyledin, ama {kim} kendisi {zaman} {yer:de} olduğunu söylüyor.',
    '{kim:in} kendi sözüne göre {zaman} {yer:de+di}. Sen başka dedin.',
  ],
  'yuzlesme-o-kendi-degil':[
    '{kim} için başka söyledin, ama {kim} kendisi {zaman} {yer:de} olmadığını söylüyor.',
    '{kim:in} kendi sözüne göre {zaman} {yer:de} değildi. Sen başka dedin.',
  ],
  'yuzlesme-esya':[
    '{diger:e} göre bu {esya} senin. Ne diyorsun?',
    'Bu {esya} için {diger} başka söylüyor. Senin değil mi?',
  ],
  'yuzlesme-esya-o':[
    'Bu {esya} için {kim} dedin. Ama {diger} başka söylüyor.',
    '{diger} bu {esya} için başka bir ad veriyor. Emin misin?',
  ],
  'yuzlesme-sir':[
    'Saklayacak bir şeyin yok demiştin. {diger} başka anlatıyor.',
    '{diger} senin hakkında bir şey anlattı. Hâlâ saklayacak bir şeyin yok mu?',
  ],
  'yuzlesme-sir-o':[
    '{kim} senin anlattığını inkâr ediyor. Emin misin?',
    'Anlattıklarını {kim} kabul etmiyor. Ne diyorsun?',
  ],
  'yuzlesme-fail':[
    '{diger}, bunu {kim:in} yaptığını söylüyor. Sen başka bir ad verdin.',
    'Sen bir ad verdin, {diger} başka bir ad veriyor: {kim}. Hangisi?',
  ],
};
