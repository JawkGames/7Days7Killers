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
// Değer önerileri (simülasyon bağlanınca netleşecek):
//   kim, sahip: kisiAdi('Kör Halil')   yer: mekanAdi('Su değirmeni')   esya: 'boynuz saplı kama'
//   zaman: 'o gece', 'yatsıdan sonra', 'sabah ezanında' gibi düz söz öbeği
// Yeni bilgi türü eklemek: buraya yeni bir anahtar yazmak yeter; kod değişmez.
export default {
  'yer-zaman':{
    degiskenler:['yer','zaman'],
    genel:[
      '{zaman} {yer:de+dim}, beyim.',
      '{zaman} [ben |]{yer:de+dim}. [Soran olursa söylerler.|Bilen bilir.]',
      'Müfettiş bey, {zaman} {yer:de+dim}, bir yere çıkmadım.',
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
};
