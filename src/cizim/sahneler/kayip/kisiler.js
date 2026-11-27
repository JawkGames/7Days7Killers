// Kişi başına sahne ipucu: KOY-HALKI.md'deki "Kaybedilince" cümlesinin görsel karşılığı.
// Şablonu kişinin `kayip.tur` alanı seçer (src/icerik/kisiler); burası yalnızca o şablonun nasıl giyineceğini söyler.
//
// ipucu = {
//   yer:         yerler.js içindeki sahne yeri (şablon varyantı)
//   zaman:       'gece' | 'safak' | 'aksam' (dış yerlerde gök)
//   nesneler:    [{nesne, yer|x,y, s, ...seçenek}]  öne çıkan nesneler; `yer` sahne yerindeki adlı nokta
//   hayvan:      {tur:'kedi'|'kopek'|'katir'|'esek'|'koyun', sayi, ...} ya da bunların dizisi
//   ekBekleyen:  {tip:'cocuk'|'kadin'|'erkek', sayi, ayakta} cümlede geçen ama kişi verisinde olmayan bekleyenler
//   bekleyenGoster: false ise kayip.bekleyenler çizilmez (cümlede yoksa)
//   ayaktaBekleyen: [sıra] bu sıradaki bekleyen ayakta durur
//   isik:        {tur, x, y, ...} yerin ışığını değiştirir; 'lamba' ve 'fener' nesnesi kendiliğinden çizilir
//   ikircik:     {tur:'sandik'|'yanik-bez'|'alet'|'leke', x, y, s, alet, masum:'uç', katil:'uç'}
//                HER sahnede çizilen, iki türlü okunabilecek ayrıntı (kanit.js). Masumda da katilde de aynı yerde,
//                aynı biçimde durur; yalnız ucundaki küçük nesne değişir: katilde kişinin kendi eşyası
//                (kişi verisindeki `esyalar`), masumda aynı boyda sıradan bir şey. Leke tonu katilde kana birkaç derece yakın.
// }
export const IPUCU={
  // O sabah ezan okunmaz. Köy ilk kez güneşle değil, sessizlikle uyanır.
  abdullah:{yer:'cami-avlu', zaman:'safak',
    nesneler:[{nesne:'baston',yer:'kapiYani'},{nesne:'pabuc',yer:'esik'}],
    ikircik:{tur:'leke',x:-60,y:832,s:.8,masum:'ip',katil:'muska'}},
  // Kepenk inik kalır. Borçlular dükkânın önünde toplanır, defterin nerede olduğunu sorar.
  arif:{yer:'dukkan',
    ekBekleyen:{tip:'erkek',sayi:4,ayakta:true,egik:.2},
    ikircik:{tur:'yanik-bez',x:170,y:802,s:.8,masum:'kibrit',katil:'kopyaKalemi'}},
  // Ocak söner, körük iner. Örsün üstünde yarım kalmış bir nal soğur.
  bekir:{yer:'demirci', bekleyenGoster:false,
    nesneler:[{nesne:'nal',yer:'ors',s:1.9},{nesne:'demirMasa',yer:'masa',s:1.1,z:730},{nesne:'cekic',yer:'orsYan',don:-.1,s:1.2}],
    ikircik:{tur:'yanik-bez',x:-120,y:812,s:.95,masum:'cul',katil:'deri'}},
  // Cami avlusundaki taş seki boş. Maşrapası yerinde durur, çıngırağın sesi gelmez.
  bektas:{yer:'cami-avlu', zaman:'gece',
    nesneler:[{nesne:'tasSeki',yer:'seki',w:380},{nesne:'masrapa',yer:'sekiUstu'}],
    ikircik:{tur:'leke',x:-90,y:842,s:.85,masum:'tas',katil:'cingirak'}},
  // Atı ahırda eyerli bekler. Anası her akşam sofraya onun tabağını da koyar.
  cemil:{yer:'sofra',
    nesneler:[{nesne:'tabak',dolu:true,x:160,y:884,s:1.35},{nesne:'kasik',x:216,y:890,don:.3},{nesne:'kase',yer:'sol',dolu:true},{nesne:'ekmek',yer:'orta',parca:2},{nesne:'minder',yer:'bos',bos:true}],
    ikircik:{tur:'sandik',x:-330,y:932,s:.8,masum:'kutu',katil:'cakmak'}},
  // Mühür masanın üstünde durur. Köye gelen ilk resmî kâğıdı imzalayacak kimse yoktur.
  dursun:{yer:'masa-basi',
    nesneler:[{nesne:'muhur',yer:'masa',s:1.6}],
    ikircik:{tur:'leke',x:200,y:952,s:.85,masum:'cul',katil:'kasket'}},
  // Çeyiz sandığı açık kalmış. Anası kırmızı hırkayı katlayıp katlayıp yeniden açar.
  elif:{yer:'ceyiz',
    nesneler:[{nesne:'sandik',yer:'sandik',acik:true,icerik:'hirka',w:210,h:110}],
    ikircik:{tur:'yanik-bez',x:200,y:922,s:.85,masum:'ip',katil:'kurdele'}},
  // Konağın mutfağında ocak geç yanar. Evde en büyük kız kardeşlerine ekmek böler.
  emine:{yer:'ocak-basi',
    ekBekleyen:{tip:'cocuk',sayi:4,egik:.3},
    nesneler:[{nesne:'ekmek',yer:'sofra',parca:4},{nesne:'yazma',yer:'duvar'},{nesne:'minder',yer:'bos',bos:true,renk:[60,50,30]}],
    ikircik:{tur:'yanik-bez',x:-60,y:800,s:.7,masum:'cul',katil:'yazma'}},
  // Çeşmenin başında güğümü dolmuş, taşmış durur. Almaya gelen olmaz.
  fadime:{yer:'cesme', zaman:'aksam',
    nesneler:[{nesne:'gugum',yer:'yalak',tasan:true}],
    ikircik:{tur:'leke',x:-210,y:852,s:.85,masum:'tas',katil:'boncuk'}},
  // Dikiş makinesinde yarım kalmış bir gelinlik durur. İğne kumaşın içinde kalmıştır.
  gulsum:{yer:'dikis',
    nesneler:[{nesne:'gelinlik',x:110,y:910,z:900},{nesne:'makas',x:0,y:778},{nesne:'yunYumagi',yer:'yer'}],
    ikircik:{tur:'sandik',x:330,y:966,s:.78,masum:'ip',katil:'makas'}},
  // Katırlar ahırda yüklü bekler. Semerlerini indiren olmaz.
  halil:{yer:'ahir',
    hayvan:{tur:'katir',sayi:3,yuk:true,basEgik:.25},
    isik:{tur:'fener',x:70,y:540},
    ikircik:{tur:'sandik',x:160,y:958,s:.85,masum:'kasik',katil:'kama'}},
  // Köpeği ağılın kapısında yatar. Sürü o gün yayılmaz.
  hasan:{yer:'agil',
    hayvan:[{tur:'koyun'},{tur:'kopek',yer:'kapi',yon:-1,s:.95,kalkik:true}],
    nesneler:[{nesne:'kaval',yer:'duvarUstu'}],
    ikircik:{tur:'alet',alet:'sopa',x:-300,y:852,s:.9,masum:'cul',katil:'kepenek'}},
  // Gece yarısı bir kapı çalınır: doğum vardır, ebe yoktur.
  hatice:{yer:'ebe-kapi',
    nesneler:[{nesne:'otTorbasi',yer:'duvar'},{nesne:'sal',x:-300,y:752,s:.9}],
    ikircik:{tur:'alet',alet:'balta',x:135,y:776,s:.9,masum:'dal',katil:'makas'}},
  // Beş çocuk yer sofrasında oturur. Babanın kaşığı ortada, dokunulmadan durur.
  ismail:{yer:'sofra',
    ekBekleyen:{tip:'cocuk',sayi:5,egik:.4},
    nesneler:[{nesne:'kase',yer:'orta',s:1.3},{nesne:'kasik',x:60,y:888,s:1.25,don:-.08},{nesne:'ekmek',x:-60,y:874}],
    ikircik:{tur:'alet',alet:'orak',x:352,y:800,s:.95,masum:'ip',katil:'carik'}},
  // Ambarın anahtarı çivide asılı kalır. Irgatlar o sabah ilk kez korkmadan geç kalkar.
  kadir:{yer:'ambar',
    nesneler:[{nesne:'anahtar',yer:'civi',s:1.7},{nesne:'kirbac',yer:'civi2',s:1.2},{nesne:'fener',yer:'yer',sonuk:true}],
    ikircik:{tur:'alet',alet:'kurek',x:-30,y:778,s:.9,masum:'ip',katil:'kirbac'}},
  // Değirmen taşı boşa döner. Su arktan taşar, kapatacak kimse yoktur.
  kazim:{yer:'degirmen',
    nesneler:[{nesne:'rakiSisesi',yer:'nis'}],
    ikircik:{tur:'alet',alet:'balta',x:290,y:792,s:.9,masum:'ip',katil:'carik'}},
  // Köy odasında başköşedeki minder boş. Kahve yine iki fincanlık pişmiş, biri soğuyor.
  mahmut:{yer:'koy-odasi',
    nesneler:[{nesne:'minder',yer:'baskose',bos:true,yastik:true,s:1.3,renk:[104,44,34]},{nesne:'tespih',x:20,y:784,s:1.3},{nesne:'tepsi',yer:'onu',rx:96},
      {nesne:'fincan',yer:'sini1',s:1.7},{nesne:'fincan',yer:'sini2',s:1.7,buhar:true},{nesne:'mangal',yer:'mangal'},{nesne:'cezve',yer:'mangalUstu'}],
    ikircik:{tur:'yanik-bez',x:225,y:962,s:.7,masum:'kibrit',katil:'kostek'}},
  // Çeşme başında kadınlar susar. Haberi getiren kimse kalmamıştır.
  naciye:{yer:'cesme', zaman:'aksam', bekleyenGoster:false,
    ekBekleyen:{tip:'kadin',sayi:3,ayakta:true,egik:.5},
    nesneler:[{nesne:'gugum',yer:'yan',s:.9},{nesne:'gugum',yer:'sag',s:.9}],
    ikircik:{tur:'leke',x:130,y:882,s:.85,masum:'civi',katil:'anahtar'}},
  // Çocuklar kilitli okul kapısının önünde bekler. Tahtada yarım kalmış bir cümle durur.
  nihat:{yer:'okul',
    ekBekleyen:{tip:'cocuk',sayi:6,ayakta:true,egik:0},
    ikircik:{tur:'alet',alet:'kurek',x:-330,y:782,s:.85,masum:'dal',katil:'kalem'}},
  // Nöbet defterinin o günkü sayfası boş kalır. Anasına yazdığı mektup masada yarım durur.
  riza:{yer:'karakol',
    nesneler:[{nesne:'defter',yer:'defter',bos:true,s:1.7},{nesne:'mektup',yer:'mektup',s:1.6}],
    ikircik:{tur:'sandik',x:-300,y:946,s:.8,masum:'kibrit',katil:'duduk'}},
  // Eşeği çeşme başında bağlı kalır. Sandığı açan, çanı çalan olmaz.
  suleyman:{yer:'cesme', zaman:'gece',
    hayvan:{tur:'esek',sayi:1,can:true,basEgik:.45},
    nesneler:[{nesne:'cerciSandigi',x:250,y:880}],
    ikircik:{tur:'leke',x:110,y:902,s:.85,masum:'tas',katil:'cingirak'}},
  // Barakadaki kediler onu arar. Boş süt tasının başında bekler, bulamazlar.
  sultan:{yer:'baraka',
    hayvan:{tur:'kedi',sayi:7},
    nesneler:[{nesne:'sutTasi',yer:'tas'},{nesne:'tabure',yer:'tabure'},{nesne:'sal',yer:'sal',s:.8},{nesne:'lamba',yer:'raf',sonuk:true}],
    ikircik:{tur:'sandik',x:330,y:976,s:.8,masum:'cul',katil:'sal'}},
  // Mağarada sönmüş bir ateş, katlanmış bir kaput. Babası o gece de taşın üstüne yemek bırakır.
  yusuf:{yer:'magara',
    nesneler:[{nesne:'sonmusAtes',yer:'ates'},{nesne:'kaput',yer:'kaput',s:1.35},{nesne:'bohca',yer:'tas'}],
    ikircik:{tur:'yanik-bez',x:10,y:952,s:.8,masum:'dugmeKemik',katil:'dugme'}},
  // Konağın kilerinin kapısı kilitli kalır. Anahtarın yerini ondan başka bilen yok.
  zeliha:{yer:'kiler', ayaktaBekleyen:[1],
    ikircik:{tur:'sandik',x:-170,y:814,s:.8,masum:'halka',katil:'bilezik'}}
};

// kimliği bilinmeyen kişi için boş ipucu: şablonun varsayılan yeri kullanılır
export function ipucuAl(id){return IPUCU[id]||{};}
