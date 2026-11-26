// Motorun kural tabloları: eşya→iz, sır türü→sebep, ilişki→sebep, mizaç katsayıları.
// İçerik (kişi, sır, eşya) veri dosyalarındadır; burada yalnızca o verinin nasıl okunacağı durur.
// Tabloda karşılığı olmayan yeni bir eşya ya da sır türü hata vermez, güvenli varsayılan alır.

// Eşya → olay yerinde bıraktığı iz.
//   iz: izin anahtarı (aynı anahtarı bırakan herkes o izin adayıdır: kırmızı yün Elif'te de Gülsüm'de de var)
//   tur: ayak-izi | lif | kirinti | leke | nesne
//   silah: eşya silah olarak kullanılabiliyorsa yöntem
//   yer: çalınacaksa nerede durur ('is' iş yeri, 'ev' ev)
export const ESYA={
  'kiraz-baston':{iz:'baston-izi',tur:'ayak-izi',silah:'darbe',yer:'ev'},
  'muska-kesesi':{iz:'muska',tur:'nesne'},
  'veresiye-defteri':{iz:'defter-yapragi',tur:'nesne'},
  'kopya-kalemi':{iz:'mor-kalem-lekesi',tur:'leke'},
  'demirci-cekici':{iz:'cekic',tur:'nesne',silah:'darbe',yer:'is'},
  'deri-onluk':{iz:'kurum-lekesi',tur:'leke'},
  'boyun-cingiragi':{iz:'cingirak',tur:'nesne'},
  'teneke-masrapa':{iz:'masrapa',tur:'nesne'},
  'sedef-cakmak':{iz:'cakmak',tur:'nesne'},
  'koruklu-cizme':{iz:'cizme-izi',tur:'ayak-izi'},
  'muhtar-muhru':{iz:'muhur',tur:'nesne'},
  'kasket':{iz:'kasket',tur:'nesne'},
  'kirmizi-hirka':{iz:'kirmizi-yun-ipi',tur:'lif'},
  'mektup-destesi':{iz:'mektup',tur:'nesne'},
  'bakir-sini':{iz:'sini',tur:'nesne'},
  'sari-yazma':{iz:'sari-yazma-parcasi',tur:'lif'},
  'mavi-boncuk':{iz:'mavi-boncuk',tur:'nesne'},
  'bakir-gugum':{iz:'gugum',tur:'nesne'},
  'terzi-makasi':{iz:'makas',tur:'nesne',silah:'bicak',yer:'is'},
  'kirmizi-yun':{iz:'kirmizi-yun-ipi',tur:'lif'},
  'boynuz-kama':{iz:'kama',tur:'nesne',silah:'bicak',yer:'ev'},
  'tutun-tabakasi':{iz:'tutun-kirintisi',tur:'kirinti'},
  'kepenek':{iz:'kece-tuyu',tur:'lif'},
  'kaval':{iz:'kaval',tur:'nesne'},
  'ot-torbasi':{iz:'kuru-ot',tur:'kirinti',silah:'zehir',yer:'ev'},
  'gobek-makasi':{iz:'gobek-makasi',tur:'nesne',silah:'bicak',yer:'ev'},
  'orak':{iz:'orak',tur:'nesne',silah:'bicak',yer:'is'},
  'yamali-carik':{iz:'carik-izi',tur:'ayak-izi'},
  'kirbac':{iz:'kirbac',tur:'nesne',silah:'bogma',yer:'is'},
  'el-feneri':{iz:'gaz-damlasi',tur:'leke'},
  'unlu-carik':{iz:'unlu-ayak-izi',tur:'ayak-izi'},
  'raki-sisesi':{iz:'raki-sisesi',tur:'nesne'},
  'gumus-saat':{iz:'cep-saati',tur:'nesne'},
  'kehribar-tespih':{iz:'tespih-tanesi',tur:'nesne'},
  'mor-yemeni':{iz:'mor-oya',tur:'lif'},
  'cevizli-sandik-anahtari':{iz:'anahtar',tur:'nesne'},
  'dolma-kalem':{iz:'yesil-murekkep',tur:'leke'},
  'tel-gozluk':{iz:'gozluk-cami',tur:'nesne'},
  'jandarma-tufegi':{iz:'bos-kovan',tur:'nesne',silah:'tufek',yer:'is'},
  'pirinc-duduk':{iz:'duduk',tur:'nesne'},
  'cerci-sandigi':{iz:'boya-kirintisi',tur:'kirinti'},
  'esek-cani':{iz:'esek-izi',tur:'ayak-izi'},
  'yun-sal':{iz:'boz-yun',tur:'lif'},
  'gaz-lambasi':{iz:'gaz-yagi-lekesi',tur:'leke'},
  'asker-kaputu':{iz:'asker-dugmesi',tur:'nesne'},
  'asker-postali':{iz:'postal-izi',tur:'ayak-izi'},
  'burma-bilezik':{iz:'bilezik',tur:'nesne'},
  'anahtar-destesi':{iz:'anahtar',tur:'nesne'},
};
export const esyaIzi=e=>ESYA[e]||{iz:e,tur:'nesne'};

// Örtü (alt gövdeyi gizleyen giysi) → takılıp kalan lif. Aynı örtüyü giyen herkes adaydır.
// Gece tanığı yüzü değil örtüyü görür; bu yüzden örtü hem iz hem silüettir.
export const ORTU_IZ={aba:'aba-tiftigi',entari:'entari-parcasi',palto:'palto-kumasi',cubbe:'cubbe-kumasi',kaput:'kaput-yunu',onluk:'onluk-ipligi',kepenek:'kece-tuyu'};

// Yöntem → cesette görülen yara izi anahtarı.
export const YONTEM_YARA={bicak:'bicak-yarasi',darbe:'ezik-yara',bogma:'bogaz-morlugu',zehir:'zehir-kopugu',tufek:'kursun-yarasi','suda-bogma':'islak-ceset'};
export const YONTEMLER=Object.keys(YONTEM_YARA);
export const SU_MEKANLARI=['degirmen','cesme']; // suda boğma yalnızca buralarda

// Katil olma eğilimi (seçimde çarpan). Kimse sıfır değildir: saf biri de öldürebilir, yalnızca seyrek.
export const MIZAC_KATIL={ofkeli:1.5,sert:1.4,kurnaz:1.3,gururlu:1.15,dedikoducu:.9,sakin:.85,korkak:.75,saf:.45};
// Kendi silahını kullanma eğilimi (kurnaz kendi aletini kullanmaz, başkasınınkini çalar).
export const MIZAC_KENDI_SILAH={ofkeli:3,sert:2.5,gururlu:1.5,sakin:1.2,dedikoducu:1,korkak:.8,saf:1,kurnaz:.5};
// Olay yerinde kendi eşyasından iz bırakma olasılığı.
export const MIZAC_DIKKATSIZLIK={ofkeli:.75,sert:.55,gururlu:.5,saf:.6,korkak:.55,dedikoducu:.5,sakin:.4,kurnaz:.3};

// Sırrı tehlikeli kılan türler: açılırsa sahibini yıkar.
export const TEHLIKELI=['eski-olum','eski-yangin','kacakcilik','hirsizlik','rusvet','yolsuzluk','gasp','tefecilik','firar','zehir','para','husumet','borc','santaj','iftira','ihbar','miras','soy','yasak-ask','kacis'];

// A) Katil adayı sırrın SAHİBİ, kurban sırrın kimlerinde: kurban sırrı biliyor ya da sırrın içinde.
//    intikamOlur: aday kurbana hasım/korkan ise sebep "intikam"a döner (yangından kalan Nine gibi).
export const SIR_SAHIP={
  'eski-olum':{sebep:'susturma',agirlik:3},
  'eski-yangin':{sebep:'susturma',agirlik:2,intikamOlur:true},
  'kacakcilik':{sebep:'susturma',agirlik:1.2},
  'hirsizlik':{sebep:'susturma',agirlik:1.5},
  'rusvet':{sebep:'susturma',agirlik:1.5},
  'yolsuzluk':{sebep:'susturma',agirlik:1.5},
  'gasp':{sebep:'susturma',agirlik:1.5,intikamOlur:true},
  'tefecilik':{sebep:'susturma',agirlik:1},
  'para':{sebep:'susturma',agirlik:1},
  'firar':{sebep:'susturma',agirlik:1},
  'zehir':{sebep:'susturma',agirlik:1.5},
  'soy':{sebep:'susturma',agirlik:.5},
  'intikam':{sebep:'intikam',agirlik:5},
  'husumet':{sebep:'husumet',agirlik:4},
  'iftira':{sebep:'husumet',agirlik:1.2},
  'miras':{sebep:'susturma',agirlik:1.5,intikamOlur:true},
  'borc':{sebep:'borc',agirlik:2},
  'santaj':{sebep:'santaj',agirlik:.8},
  'ihbar':{sebep:'susturma',agirlik:.3},
};
// B) Kurban sırrın SAHİBİ, katil adayı sırrın kimlerinde: kurbanın bildiği ya da yaptığı şey adayı tehdit eder.
//    tehdit:true ise aday ancak kendi tehlikeli bir sırrı o bilgiyle kesişiyorsa tehdit altındadır.
export const SIR_ILGILI={
  'bilgi':{sebep:'susturma',agirlik:3,tehdit:true},
  'soy':{sebep:'susturma',agirlik:2.5},
  'miras':{sebep:'miras',agirlik:3},
  'eski-yangin':{sebep:'susturma',agirlik:3.5},
  'santaj':{sebep:'santaj',agirlik:4},
  'ihbar':{sebep:'susturma',agirlik:3.5},
  'intikam':{sebep:'susturma',agirlik:3.5},
  'iftira':{sebep:'intikam',agirlik:3},
  'zehir':{sebep:'susturma',agirlik:2,tehdit:true},
  'hirsizlik':{sebep:'ceza',agirlik:1.2},
  'kacakcilik':{sebep:'ihanet',agirlik:.6},
  'tefecilik':{sebep:'borc',agirlik:2.5},
  'para':{sebep:'borc',agirlik:.5},
  'husumet':{sebep:'husumet',agirlik:2.5},
  'rusvet':{sebep:'ihanet',agirlik:.6},
  'yolsuzluk':{sebep:'ihanet',agirlik:.6},
  'gasp':{sebep:'intikam',agirlik:2.5},
  'borc':{sebep:'borc',agirlik:.3},
};
// C) İlişkiden doğan sebep (adayın kurbana ilişkisi).
export const ILISKI_SEBEP={
  borclu:{sebep:'borc',agirlik:3},
  hasim:{sebep:'husumet',agirlik:2.5},
  korkar:{sebep:'korku',agirlik:2.5},
  calisan:{sebep:'zulum',agirlik:.5},
};
// Yakınlık sebebi zayıflatır: kimse annesini kolay kolay öldürmez.
export const YAKINLIK={es:.12,ebeveyn:.05,cocuk:.05,sevgili:.15,sever:.3,sevilen:.5,korur:.1,korunan:.1,dost:.3,ortak:.45,sozlu:.7,isveren:.6,calisan:.6};
// Seven korur: bu ilişkiler aleyhte bir olguyu yalanla örter.
export const SEVEN=['es','ebeveyn','cocuk','sevgili','sever','korur'];
// Sırrın kendisini sahibine "gizli hareket" yaptıran türler (çizelgede gece dışarıda olmak gibi).
export const GIZLI_NEDEN_ONEKLERI=['sir:','ortaklik:','hirsizlik:','ot-alma:','cinayet:','cinayet-yardim:','yoldan-gecerken:','ses-duydu:'];
