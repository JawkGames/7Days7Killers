// 20 fixed townspeople with full Turkish morphology, relations, dark secrets, loss scenes, and faceRig anchors

const DEFAULT_FACE_RIG = {
  eyeY: 0.31,
  eyeSpan: 0.11,
  mouthY: 0.43,
  mouthW: 0.10
};

export const TOWNSPEOPLE = [
  {
    id: 'halit',
    name: 'Kasap Halit',
    title: 'Kasap',
    personality: 'ofkeli',
    workLoc: 'han',
    freqLoc: 'degirmen',
    clues: ['iron_shears', 'muddy_boot'],
    lossType: 'workshop',
    sprite: 'assets/suspects/halit.png',
    dative: "Kasap Halit'e",
    accusative: "Kasap Halit'i",
    genitive: "Kasap Halit'in",
    ablative: "Kasap Halit'ten",
    locative: "Kasap Halit'te",
    comitative: "Kasap Halit'le",
    relations: [
      { targetId: 'kudret', type: 'ally', note: 'Han mutfağına ucuz et verip hesapları birlikte kapatırlar.' },
      { targetId: 'rustem', type: 'grudge', note: 'Bıçak bileme borcu yüzünden aralarında eski bir kavga vardır.' },
      { targetId: 'musa', type: 'debt', note: 'Sonbaharda aldığı sürüden kalan veresiye borcunu geciktirmektedir.' }
    ],
    innocentSecret: 'Geceleri değirmen arkasında hastalıklı hayvan kesip sağlam damgasıyla han mutfağına satıyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Kesim tezgahının kepenkleri mühürlendi; kancalarda kuruyan önlüğü sahipsiz kaldı ve kasaba masum bir adamın suskunluğunu gömdü.',
      killerSummary: 'Tezgahın altındaki gevşek taş söküldüğünde kanlı önlükle sarılmış kemik testeresi ve saklanan emanetler gün yüzüne çıktı.',
      hiddenEvidenceText: 'Kütüğün oyuğunda yıkanmamış demir makas kılıfı ve gece kesimlerinden kalma çamurlu çizmeler bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'leyla',
    name: 'Eczacı Leyla',
    title: 'Eczacı',
    personality: 'sogukkanli',
    workLoc: 'eczane',
    freqLoc: 'han',
    clues: ['amber_vial', 'torn_letter'],
    lossType: 'workshop',
    sprite: 'assets/suspects/leyla.png',
    dative: "Eczacı Leyla'ya",
    accusative: "Eczacı Leyla'yı",
    genitive: "Eczacı Leyla'nın",
    ablative: "Eczacı Leyla'dan",
    locative: "Eczacı Leyla'da",
    comitative: "Eczacı Leyla'yla",
    relations: [
      { targetId: 'cevdet', type: 'ally', note: 'Eczane deposundaki kilitli ilaç defterini birlikte tutarlar.' },
      { targetId: 'orhan', type: 'love', note: 'Kimseye duyurmadan mektuplaştıkları gizli bir yakınlıkları vardır.' },
      { targetId: 'muzeyyen', type: 'grudge', note: 'Kira artışı ve dedikodular yüzünden birbirlerine diş bilerler.' }
    ],
    innocentSecret: 'Kasabanın uykusuz zenginlerine reçetesiz afyon ruhu satıp şişeleri şifalı şurup diye kaydediyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Eczanenin kehribar şişeleri toz içinde kaldı; tezgahın üstünde yarım kalmış masum bir veda mektubu rüzgarda titredi.',
      killerSummary: 'Arka odadaki kilitli ecza dolabı kırıldığında etiketleri kazınmış zehir şişeleri ve yakılmayı bekleyen tehdit pusulaları bulundu.',
      hiddenEvidenceText: 'Havan elinin altında saklanmış yırtık mektup zarfları ve numaralı kehribar şişe dizisi ele geçti.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'rustem',
    name: 'Demirci Rüstem',
    title: 'Demirci',
    personality: 'ofkeli',
    workLoc: 'demirci',
    freqLoc: 'han',
    clues: ['blacksmith_hammer', 'cigar_stub'],
    lossType: 'family',
    sprite: 'assets/suspects/rustem.png',
    dative: "Demirci Rüstem'e",
    accusative: "Demirci Rüstem'i",
    genitive: "Demirci Rüstem'in",
    ablative: "Demirci Rüstem'den",
    locative: "Demirci Rüstem'de",
    comitative: "Demirci Rüstem'le",
    relations: [
      { targetId: 'kirkor', type: 'ally', note: 'Atölyenin arka tezgahını paylaşır, ince kilit işlerini paslaşırlar.' },
      { targetId: 'halit', type: 'grudge', note: 'Han önünde ettikleri yumruk kavgasını hâlâ unutmamıştır.' },
      { targetId: 'vahap', type: 'debt', note: 'Şapel parmaklıklarının onarımından kalan alacağını beklemektedir.' }
    ],
    innocentSecret: 'Körüğün altındaki gizli bölmede vilayet jandarmasının aradığı kaçak tüfek namlularını dövüyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Demirci ocağının ateşi ilk kez tamamen söndü; duvar dibinde asılı aile fotoğrafının önüne isli bir çekiç bırakıldı.',
      killerSummary: 'Körük taşının altından kan lekeli ağır çekiç ve kurbanın eşyalarını eritmek için hazırlanmış pota çıkarıldı.',
      hiddenEvidenceText: 'Örsün dibindeki kül yığınında ezilmiş kaçak tütün izmaritleri ve gizlenen darbe çekici bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'muzeyyen',
    name: 'Dul Müzeyyen',
    title: 'Ev Sahibi',
    personality: 'dedikoducu',
    workLoc: 'sapel',
    freqLoc: 'eczane',
    clues: ['broken_beads', 'brass_key'],
    lossType: 'family',
    sprite: 'assets/suspects/muzeyyen.png',
    dative: "Dul Müzeyyen'e",
    accusative: "Dul Müzeyyen'i",
    genitive: "Dul Müzeyyen'in",
    ablative: "Dul Müzeyyen'den",
    locative: "Dul Müzeyyen'de",
    comitative: "Dul Müzeyyen'le",
    relations: [
      { targetId: 'vahap', type: 'ally', note: 'Şapel mumlarını ve bağış defterini birlikte kontrol ederler.' },
      { targetId: 'feride', type: 'debt', note: 'Kiracısı olan Feride üzerinde sürekli baskı kurmaktadır.' },
      { targetId: 'leyla', type: 'grudge', note: 'Eczacının gece misafirlerini gözetleyip kasabaya yaymaktadır.' }
    ],
    innocentSecret: 'Kiracılarının odalarına yedek pirinç anahtarla girip sandıklarını karıştırarak kasabanın sırlarını topluyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Pencere önündeki dantel perdeler çekildi; rahmetli eşinin çerçevesi önünde kopuk kolyesi sessizce parladı.',
      killerSummary: 'Yatak tahtasının altından bütün kasaba kapılarına uyan yedek anahtar destesi ve şantaj bohçası çıktı.',
      hiddenEvidenceText: 'Çekmecenin gizli gözünde kopmuş taş kolye taneleri ve eğelenmiş pirinç anahtarlar bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'ilyas',
    name: 'Değirmenci İlyas',
    title: 'Değirmenci',
    personality: 'korkak',
    workLoc: 'degirmen',
    freqLoc: 'kayikhane',
    clues: ['muddy_boot', 'pocket_watch'],
    lossType: 'family',
    sprite: 'assets/suspects/ilyas.png',
    dative: "Değirmenci İlyas'a",
    accusative: "Değirmenci İlyas'ı",
    genitive: "Değirmenci İlyas'ın",
    ablative: "Değirmenci İlyas'tan",
    locative: "Değirmenci İlyas'ta",
    comitative: "Değirmenci İlyas'la",
    relations: [
      { targetId: 'musa', type: 'ally', note: 'Tahıl çuvallarını ve mera geçişini karşılıklı kollarlar.' },
      { targetId: 'kudret', type: 'debt', note: 'Kışlık un teslimatını geciktirdiği için hancıya borçludur.' },
      { targetId: 'riza', type: 'grudge', note: 'Değirmenden eksilen bakır parçaları Rıza’nın çaldığından şüphelenir.' }
    ],
    innocentSecret: 'Un çuvallarının ağırlığı artsın diye geceleri öğütülmüş tebeşir tozu karıştırıp tartıda hile yapıyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Değirmen çarkı boşa dönüp durdu; unlu sedirin üstünde ailesinden kalan eski saat bir daha kurulmadı.',
      killerSummary: 'Un çuvallarının arkasındaki kanlı geçitte kurbanın boğuşma anında durmuş saati ve balçıklı çizmeleri bulundu.',
      hiddenEvidenceText: 'Su arkının kapağına sıkışmış çamurlu çizme tekleri ve çatlak camlı cep saati ele geçirildi.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'cevdet',
    name: 'Doktor Cevdet',
    title: 'Kasaba Doktoru',
    personality: 'sogukkanli',
    workLoc: 'eczane',
    freqLoc: 'sapel',
    clues: ['bloodied_bandage', 'amber_vial'],
    lossType: 'workshop',
    sprite: 'assets/suspects/cevdet.png',
    dative: "Doktor Cevdet'e",
    accusative: "Doktor Cevdet'i",
    genitive: "Doktor Cevdet'in",
    ablative: "Doktor Cevdet'ten",
    locative: "Doktor Cevdet'te",
    comitative: "Doktor Cevdet'le",
    relations: [
      { targetId: 'nermin', type: 'ally', note: 'Kasabadaki zor doğumlara ve gece yaralanmalarına birlikte koşarlar.' },
      { targetId: 'leyla', type: 'ally', note: 'İlaç terkibi ve ölüm kayıtlarında birbirlerinin açığını kapatırlar.' },
      { targetId: 'tahir', type: 'grudge', note: 'Mezarlık kayıtlarındaki tutarsızlıklar yüzünden birbirlerini suçlarlar.' }
    ],
    innocentSecret: 'Elleri titrediği için ameliyatlardan önce gizlice eter kokluyor ve yanlış teşhis koyduğu eski bir vakayı saklıyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Muayene masasının örtüsü sarardı; deri doktor çantası kapı eşiğinde hastalarını bekler gibi kapalı kaldı.',
      killerSummary: 'Deri çantanın astarı söküldüğünde kanlı sargı ruloları ve ölüm saatini gizlemek için kullanılan şişeler saçıldı.',
      hiddenEvidenceText: 'Cerrahi tepsinin altında yıkanmadan saklanmış sargı bezleri ve koyu kehribar şişeler bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'vahap',
    name: 'Türbedar Vahap',
    title: 'Şapel Bekçisi',
    personality: 'sadik',
    workLoc: 'sapel',
    freqLoc: 'demirci',
    clues: ['brass_key', 'broken_beads'],
    lossType: 'bench',
    sprite: 'assets/suspects/vahap.png',
    dative: "Türbedar Vahap'a",
    accusative: "Türbedar Vahap'ı",
    genitive: "Türbedar Vahap'ın",
    ablative: "Türbedar Vahap'tan",
    locative: "Türbedar Vahap'ta",
    comitative: "Türbedar Vahap'la",
    relations: [
      { targetId: 'tahir', type: 'ally', note: 'Mezarlık kapısını ve gece definlerini birlikte beklerler.' },
      { targetId: 'muzeyyen', type: 'ally', note: 'Bağış mumlarının hesabını birlikte tutarlar.' },
      { targetId: 'zeliha', type: 'family', note: 'Kimsesiz kalan uzak akrabası Zeliha’ya gizlice yemek taşır.' }
    ],
    innocentSecret: 'Gece şapel mahzeninde kaçak yolcuları saklayıp karşılığında mum parası diye gümüş sikkeler alıyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'Şapel avlusundaki taş sıra boş kaldı; rüzgar her estiğinde demir halkadaki anahtarlar sahipsizce çınladı.',
      killerSummary: 'Sunak taşının altındaki oyukta kan bulaşmış tespih taneleri ve mahzen kilidinin ağır anahtarı ortaya çıktı.',
      hiddenEvidenceText: 'Cübbesinin iç cebinde kopmuş tespih ipi ve kan lekeli pirinç anahtar bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'sevgi',
    name: 'Öğretmen Sevgi',
    title: 'Öğretmen',
    personality: 'sadik',
    workLoc: 'han',
    freqLoc: 'eczane',
    clues: ['red_yarn', 'torn_letter'],
    lossType: 'family',
    sprite: 'assets/suspects/sevgi.png',
    dative: "Öğretmen Sevgi'ye",
    accusative: "Öğretmen Sevgi'yi",
    genitive: "Öğretmen Sevgi'nin",
    ablative: "Öğretmen Sevgi'den",
    locative: "Öğretmen Sevgi'de",
    comitative: "Öğretmen Sevgi'yle",
    relations: [
      { targetId: 'feride', type: 'ally', note: 'Okul çocuklarına kışlık kazak örmek için birlikte çalışırlar.' },
      { targetId: 'adem', type: 'love', note: 'Postacı Adem’in getirdiği kitaplar ve pusulalarla yakınlaşmışlardır.' },
      { targetId: 'orhan', type: 'grudge', note: 'Okul ödeneğini kestiği için Belediye Katibi Orhan’la tartışmıştır.' }
    ],
    innocentSecret: 'Vilayet müfettişine kasaba ileri gelenlerinin yolsuzluklarını anlatan imzasız ihbar mektupları yazıyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Sınıf tahtasındaki tebeşir yazısı silinmedi; masasının üstünde yarım örülmüş kırmızı bir atkı boynu bükük kaldı.',
      killerSummary: 'Kürsü çekmecesinin çift tabanında yırtık şantaj mektupları ve çalılara takılıp kopmuş kırmızı yün yumağı bulundu.',
      hiddenEvidenceText: 'Ders defterinin arasında tehdit satırlı yırtık kağıtlar ve kan lekeli kırmızı örgü ipi ele geçti.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'kirkor',
    name: 'Saatçi Kirkor',
    title: 'Saatçi',
    personality: 'sogukkanli',
    workLoc: 'demirci',
    freqLoc: 'han',
    clues: ['pocket_watch', 'brass_key'],
    lossType: 'workshop',
    sprite: 'assets/suspects/kirkor.png',
    dative: "Saatçi Kirkor'a",
    accusative: "Saatçi Kirkor'u",
    genitive: "Saatçi Kirkor'un",
    ablative: "Saatçi Kirkor'dan",
    locative: "Saatçi Kirkor'da",
    comitative: "Saatçi Kirkor'la",
    relations: [
      { targetId: 'rustem', type: 'ally', note: 'Demirci ocağının arka köşesinde ince çark ve kilit tamiri yapar.' },
      { targetId: 'riza', type: 'debt', note: 'Hurda saat kasalarını Eskici Rıza’dan veresiye toplar.' },
      { targetId: 'orhan', type: 'grudge', note: 'Ailesinden kalan dükkan tapusunu Orhan’ın geciktirdiğine inanır.' }
    ],
    innocentSecret: 'Tamire gelen altın saatlerin içindeki değerli taş yataklarını söküp yerine değersiz pirinç burç takıyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Tezgahındaki onlarca sarkaç birer birer durdu; büyütecinin yanında kimsenin almadığı küçük saatler sessizliğe gömüldü.',
      killerSummary: 'Kadife kaplı alet kutusunun altından sahte anahtar kalıpları ve cinayet saatinde kırılmış cep saati parçaları çıktı.',
      hiddenEvidenceText: 'Çark çekmecesinde eğelenmiş pirinç anahtarlar ve kan sıçramış cep saati kapağı bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'kudret',
    name: 'Hancı Kudret',
    title: 'Hancı',
    personality: 'dedikoducu',
    workLoc: 'han',
    freqLoc: 'kayikhane',
    clues: ['cigar_stub', 'empty_nail'],
    lossType: 'workshop',
    sprite: 'assets/suspects/kudret.png',
    dative: "Hancı Kudret'e",
    accusative: "Hancı Kudret'i",
    genitive: "Hancı Kudret'in",
    ablative: "Hancı Kudret'ten",
    locative: "Hancı Kudret'te",
    comitative: "Hancı Kudret'le",
    relations: [
      { targetId: 'salih', type: 'ally', note: 'Gece kayıkla gelen kaçak içki ve tütün fıçılarını birlikte indirirler.' },
      { targetId: 'halit', type: 'ally', note: 'Han mutfağının et tedarikini sorgusuz sualsiz Halit’ten sağlar.' },
      { targetId: 'ilyas', type: 'grudge', note: 'Eksik tartılan un çuvalları yüzünden İlyas’ı sıkıştırmaktadır.' }
    ],
    innocentSecret: 'Sarhoş müşterilerin ceplerinden düşen senetleri ve paraları toplayıp han duvarındaki gevşek tahtanın arkasında saklıyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Hanın gaz lambaları erkenden kısıldı; tezgahın arkasındaki boş fıçılar ve soğuk ocak kasabanın neşesini yuttu.',
      killerSummary: 'Mahzen merdiveninin altında duvardaki çividen sökülmüş ağır satır askısı ve kanlı tütün kesesi bulundu.',
      hiddenEvidenceText: 'Tezgah altında saklanan kaçak tütün izmaritleri ve yerinden sökülmüş duvar askısı tespit edildi.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'adem',
    name: 'Postacı Adem',
    title: 'Postacı',
    personality: 'korkak',
    workLoc: 'han',
    freqLoc: 'degirmen',
    clues: ['torn_letter', 'muddy_boot'],
    lossType: 'bench',
    sprite: 'assets/suspects/adem.png',
    dative: "Postacı Adem'e",
    accusative: "Postacı Adem'i",
    genitive: "Postacı Adem'in",
    ablative: "Postacı Adem'den",
    locative: "Postacı Adem'de",
    comitative: "Postacı Adem'le",
    relations: [
      { targetId: 'sevgi', type: 'love', note: 'Her posta dönüşü ilk iş Öğretmen Sevgi’nin penceresine uğrar.' },
      { targetId: 'orhan', type: 'ally', note: 'Resmi evrak çantasını belediye katibine teslim eder.' },
      { targetId: 'baran', type: 'grudge', note: 'Orman patikasında Baran’ın kurduğu tuzağa basıp yaralanmıştır.' }
    ],
    innocentSecret: 'Mühürlü mektupları çay buharında açıp okuyarak kasabalıların birbirinden sakladığı haberleri önceden öğreniyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'Han önündeki ahşap sırada yıpranmış meşin posta çantası sahipsiz kaldı; sahiplerine ulaşamayan mektuplar ıslandı.',
      killerSummary: 'Meşin çantanın gizli astarından koparılmış tehdit mektupları ve nehir balçığına bulanmış çizmeler çıktı.',
      hiddenEvidenceText: 'Çanta tokasının dibinde yırtık mektup köşeleri ve kurumuş çamur tabakası bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'nermin',
    name: 'Ebe Nermin',
    title: 'Ebe',
    personality: 'sadik',
    workLoc: 'eczane',
    freqLoc: 'degirmen',
    clues: ['bloodied_bandage', 'iron_shears'],
    lossType: 'family',
    sprite: 'assets/suspects/nermin.png',
    dative: "Ebe Nermin'e",
    accusative: "Ebe Nermin'i",
    genitive: "Ebe Nermin'in",
    ablative: "Ebe Nermin'den",
    locative: "Ebe Nermin'de",
    comitative: "Ebe Nermin'le",
    relations: [
      { targetId: 'cevdet', type: 'ally', note: 'Yıllardır kasabanın bütün doğum ve ölüm döşeklerinde yan yana bulunmuşlardır.' },
      { targetId: 'feride', type: 'family', note: 'Terzi Feride’nin teyzesidir; temiz keten bezleri ondan alır.' },
      { targetId: 'muzeyyen', type: 'grudge', note: 'Aile sırlarını yaydığı için Dul Müzeyyen’i kapısından kovmuştur.' }
    ],
    innocentSecret: 'Yıllar önce kasabanın iki köklü ailesinde doğan bebeklerin beşiğinde karışıklık olduğunu biliyor ama mezara kadar susuyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Ocakta kaynayan ıhlamur soğudu; tertemiz katlanmış keten bezlerin yanında kasabanın en eski sırdaşı eksildi.',
      killerSummary: 'Keten bohçasının altından kanı yıkanmamış sargılar ve ağır demir makas çıkarıldı.',
      hiddenEvidenceText: 'Sandık dibinde tentürdiyot kokulu kanlı sargı bezi ve perçinli demir makas bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'baran',
    name: 'Avcı Baran',
    title: 'Avcı',
    personality: 'ofkeli',
    workLoc: 'kayikhane',
    freqLoc: 'demirci',
    clues: ['muddy_boot', 'cigar_stub'],
    lossType: 'bench',
    sprite: 'assets/suspects/baran.png',
    dative: "Avcı Baran'a",
    accusative: "Avcı Baran'ı",
    genitive: "Avcı Baran'ın",
    ablative: "Avcı Baran'dan",
    locative: "Avcı Baran'da",
    comitative: "Avcı Baran'la",
    relations: [
      { targetId: 'salih', type: 'ally', note: 'Sazlıklarda gece avına çıkarken Salih’in sandalını kullanır.' },
      { targetId: 'musa', type: 'grudge', note: 'Sürüye dadanan kurtlar ve mera sınırı yüzünden kavgalıdırlar.' },
      { targetId: 'adem', type: 'grudge', note: 'Orman yolunda postacıyı korkutup kovalamışlığı vardır.' }
    ],
    innocentSecret: 'Yasak bölgede vurduğu geyik postlarını gece kayıkhaneden kaçak tüccarlara satıyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'İskele sundurmasındaki kütüğün üstünde boş fişekliği kaldı; sisli orman patikasına bir daha dönemedi.',
      killerSummary: 'Sandal örtüsünün altında kurbanın kanıyla lekelenmiş av çizmeleri ve pusu yerinde içilen tütün kesesi bulundu.',
      hiddenEvidenceText: 'Fişek sandığında balçıklı çizme izleri ve aynı sarma tütünden kalan izmaritler saptandı.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'feride',
    name: 'Terzi Feride',
    title: 'Terzi',
    personality: 'dedikoducu',
    workLoc: 'eczane',
    freqLoc: 'han',
    clues: ['red_yarn', 'iron_shears'],
    lossType: 'workshop',
    sprite: 'assets/suspects/feride.png',
    dative: "Terzi Feride'ye",
    accusative: "Terzi Feride'yi",
    genitive: "Terzi Feride'nin",
    ablative: "Terzi Feride'den",
    locative: "Terzi Feride'de",
    comitative: "Terzi Feride'yle",
    relations: [
      { targetId: 'nermin', type: 'family', note: 'Teyzesi Ebe Nermin’e her akşam sıcak çorba götürür.' },
      { targetId: 'sevgi', type: 'ally', note: 'Öğretmen Sevgi ile dikiş ve örgü sepetlerini paylaşırlar.' },
      { targetId: 'muzeyyen', type: 'debt', note: 'Birikmiş oda kirası yüzünden Müzeyyen’in tehditlerine katlanır.' }
    ],
    innocentSecret: 'Zengin müşterilerinin tamire bıraktığı paltoların astarından gizlice gümüş düğme ve kumaş kırpıp satıyor.',
    lossScene: {
      type: 'workshop',
      innocentSummary: 'Dikiş makinesinin pedalı sustu; mankenin üstünde yarım kalmış kırmızı hırka iğneleriyle öylece donup kaldı.',
      killerSummary: 'Kumaş toplarının arasından kanı silinmiş ağır biçki makası ve olay yerindekiyle birebir örtüşen kırmızı yün çilesi çıktı.',
      hiddenEvidenceText: 'Biçki masasının altında lekeli demir makas ve kopuk uçlu kırmızı kazak ipi bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'salih',
    name: 'Kayıkçı Salih',
    title: 'Kayıkçı',
    personality: 'sogukkanli',
    workLoc: 'kayikhane',
    freqLoc: 'han',
    clues: ['brass_key', 'cigar_stub'],
    lossType: 'bench',
    sprite: 'assets/suspects/salih.png',
    dative: "Kayıkçı Salih'e",
    accusative: "Kayıkçı Salih'i",
    genitive: "Kayıkçı Salih'in",
    ablative: "Kayıkçı Salih'ten",
    locative: "Kayıkçı Salih'te",
    comitative: "Kayıkçı Salih'le",
    relations: [
      { targetId: 'kudret', type: 'ally', note: 'Nehirden gelen kaçak sandıkları gece han mahzenine taşır.' },
      { targetId: 'baran', type: 'ally', note: 'Sazlık geçitlerini Avcı Baran’la birlikte kontrol eder.' },
      { targetId: 'tahir', type: 'debt', note: 'Kardeşinin defin masrafları yüzünden Mezarcı Tahir’e borçlanmıştır.' }
    ],
    innocentSecret: 'Gece sis çöktüğünde karşı kıyıdan aranan kaçakları para karşılığı kasabaya geçirip izlerini siliyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'Bağlı kayık sabaha kadar iskele direğine vurup durdu; feneri sönmüş iskelede kimse küreklere uzanmadı.',
      killerSummary: 'Kayığın çift tabanından kanlı muşamba, zincir kilidi anahtarı ve ıslak tütün tabakası çıkarıldı.',
      hiddenEvidenceText: 'Sintine tahtasının altında kararmış pirinç anahtar ve sert sarma tütün izmaritleri bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'orhan',
    name: 'Katip Orhan',
    title: 'Belediye Katibi',
    personality: 'korkak',
    workLoc: 'han',
    freqLoc: 'sapel',
    clues: ['torn_letter', 'pocket_watch'],
    lossType: 'family',
    sprite: 'assets/suspects/orhan.png',
    dative: "Katip Orhan'a",
    accusative: "Katip Orhan'ı",
    genitive: "Katip Orhan'ın",
    ablative: "Katip Orhan'dan",
    locative: "Katip Orhan'da",
    comitative: "Katip Orhan'la",
    relations: [
      { targetId: 'leyla', type: 'love', note: 'Eczacı Leyla ile kasabadan birlikte kaçma planları kurmaktadır.' },
      { targetId: 'adem', type: 'ally', note: 'Vilayetten gelen resmi zarfları ilk önce Adem’den teslim alır.' },
      { targetId: 'kirkor', type: 'grudge', note: 'Tapu harcı meselesi yüzünden Saatçi Kirkor’la yüz göz olmuştur.' }
    ],
    innocentSecret: 'Belediye kasasındaki vergi açığını kapatmak için eski arazi kayıtlarında tarihleri geriye dönük değiştiriyor.',
    lossScene: {
      type: 'family',
      innocentSummary: 'Yazı masasının üstünde hokka kurudu; düzenli istiflenmiş defterlerin yanında gözlüğü sessizce katlanmış kaldı.',
      killerSummary: 'Evrak dolabının arkasında yakılmaya çalışılmış şantaj belgeleri ve arbedede çatlamış cep saati bulundu.',
      hiddenEvidenceText: 'Kayıt defterinin cildine gizlenmiş yırtık mektup parçası ve durmuş cep saati ele geçti.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'musa',
    name: 'Çoban Musa',
    title: 'Çoban',
    personality: 'sadik',
    workLoc: 'degirmen',
    freqLoc: 'sapel',
    clues: ['cigar_stub', 'muddy_boot'],
    lossType: 'bench',
    sprite: 'assets/suspects/musa.png',
    dative: "Çoban Musa'ya",
    accusative: "Çoban Musa'yı",
    genitive: "Çoban Musa'nın",
    ablative: "Çoban Musa'dan",
    locative: "Çoban Musa'da",
    comitative: "Çoban Musa'yla",
    relations: [
      { targetId: 'ilyas', type: 'ally', note: 'Değirmen çayırında sürüsünü dinlendirir, İlyas’a göz kulak olur.' },
      { targetId: 'zeliha', type: 'ally', note: 'Sürüden sağdığı sütü her sabah Kedici Zeliha’nın kapısına bırakır.' },
      { targetId: 'baran', type: 'grudge', note: 'Kuzularını vuran kişinin Avcı Baran olduğundan kuşkulanır.' }
    ],
    innocentSecret: 'Sürü sahibine kurt kaptı diyerek ayırdığı koyunları komşu köyün pazarına gizlice satıyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'Değirmen taşının yanındaki kepeneği çiğ tuttu; sürünün çıngırakları sabah sisinde başıboş dağıldı.',
      killerSummary: 'Kepeneğin iç cebinde kan sıçramış tütün kesesi ve olay yerindeki izle eşleşen çivili çizmeler bulundu.',
      hiddenEvidenceText: 'Ağıl kapısının dibinde balçıklı çizmeler ve yarısı içilmiş sarma tütün izmaritleri bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'zeliha',
    name: 'Kedici Zeliha',
    title: 'Baraka Sakini',
    personality: 'korkak',
    workLoc: 'kayikhane',
    freqLoc: 'sapel',
    clues: ['broken_beads', 'red_yarn'],
    lossType: 'cats',
    sprite: 'assets/suspects/zeliha.png',
    dative: "Kedici Zeliha'ya",
    accusative: "Kedici Zeliha'yı",
    genitive: "Kedici Zeliha'nın",
    ablative: "Kedici Zeliha'dan",
    locative: "Kedici Zeliha'da",
    comitative: "Kedici Zeliha'yla",
    relations: [
      { targetId: 'vahap', type: 'family', note: 'Şapel bekçisi Vahap onun kasabadaki tek akrabasıdır.' },
      { targetId: 'riza', type: 'ally', note: 'Eskici Rıza ile kıyıya vuran eşyaları ve hurdaları paylaşırlar.' },
      { targetId: 'musa', type: 'ally', note: 'Çoban Musa kedileri için her sabah bir tas süt bırakır.' }
    ],
    innocentSecret: 'Gece uykusuz kaldığında pencerelerin dibinde dolaşıp zengin evlerin bahçesinden parlak ufak tefek eşyalar aşırıyor.',
    lossScene: {
      type: 'cats',
      innocentSummary: 'Barakanın önünde biriken sokak kedileri boş teneke kapların başında sabaha kadar acı acı miyavladı.',
      killerSummary: 'Baraka döşemesinin altındaki teneke kutudan kurbanın kopmuş boncukları ve kanlı kırmızı şal ipi çıktı.',
      hiddenEvidenceText: 'Eski şiltenin altında dağılmış kolye boncukları ve kopuk kırmızı yün yumağı bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'tahir',
    name: 'Mezarcı Tahir',
    title: 'Mezarcı',
    personality: 'sogukkanli',
    workLoc: 'sapel',
    freqLoc: 'kayikhane',
    clues: ['blacksmith_hammer', 'muddy_boot'],
    lossType: 'bench',
    sprite: 'assets/suspects/tahir.png',
    dative: "Mezarcı Tahir'e",
    accusative: "Mezarcı Tahir'i",
    genitive: "Mezarcı Tahir'in",
    ablative: "Mezarcı Tahir'den",
    locative: "Mezarcı Tahir'de",
    comitative: "Mezarcı Tahir'le",
    relations: [
      { targetId: 'vahap', type: 'ally', note: 'Mezarlık duvarının ardındaki her gece tıkırtısını birlikte bilirler.' },
      { targetId: 'salih', type: 'debt', note: 'Kayıkçı Salih’ten eski defin borcunu tahsil etmeye çalışır.' },
      { targetId: 'cevdet', type: 'grudge', note: 'Doktorun aceleyle kapattırdığı tabutlardan hep şüphe duymuştur.' }
    ],
    innocentSecret: 'Kimsesiz mezarlarını beklenenden sığ kazıp tabut tahtalarının sağlamlarını gece odun diye satıyor.',
    lossScene: {
      type: 'bench',
      innocentSummary: 'Mezarlık duvarına dayalı küreği yağmur altında paslandı; taş oturağında bir daha kimse sessizce tütün sarmadı.',
      killerSummary: 'Alet kulübesinin kireç çukurunda kanlı taş çekici ve taze balçık bulaşmış mezar çizmeleri ortaya çıkarıldı.',
      hiddenEvidenceText: 'Kulübe kirişinin üstünde gizlenmiş ağır çekiç ve çamurlu çizmeler bulundu.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  },
  {
    id: 'riza',
    name: 'Eskici Rıza',
    title: 'Eskici',
    personality: 'dedikoducu',
    workLoc: 'demirci',
    freqLoc: 'degirmen',
    clues: ['empty_nail', 'pocket_watch'],
    lossType: 'cats',
    sprite: 'assets/suspects/riza.png',
    dative: "Eskici Rıza'ya",
    accusative: "Eskici Rıza'yı",
    genitive: "Eskici Rıza'nın",
    ablative: "Eskici Rıza'dan",
    locative: "Eskici Rıza'da",
    comitative: "Eskici Rıza'yla",
    relations: [
      { targetId: 'zeliha', type: 'ally', note: 'Barakaların arkasındaki sahipsiz kedileri birlikte beslerler.' },
      { targetId: 'kirkor', type: 'ally', note: 'Bulduğu eski saat zembereklerini Kirkor’a satar.' },
      { targetId: 'ilyas', type: 'grudge', note: 'Değirmenci İlyas onu sürekli hırsızlıkla suçladığı için öfkelidir.' }
    ],
    innocentSecret: 'Kasabadaki çalıntı bakır kazanları ve kilitleri kimse sormadan alıp komşu pazarda elden çıkarıyor.',
    lossScene: {
      type: 'cats',
      innocentSummary: 'El arabasının gıcırtısı kesildi; arabanın altına sığınan tekir kedi soğukta sahibinin yırtık paltosunu bekledi.',
      killerSummary: 'Hurda çuvallarının dibinde duvardan sökülmüş kanlı alet askısı ve kurbandan alınan durmuş cep saati bulundu.',
      hiddenEvidenceText: 'Hurda sandığında saklanan durmuş cep saati ve sökülmüş demir askı çivileri ele geçirildi.'
    },
    faceRig: { ...DEFAULT_FACE_RIG }
  }
];

const PERSON_MAP = new Map(TOWNSPEOPLE.map((person) => [person.id, person]));

export function getPersonById(id) {
  return PERSON_MAP.get(id) || null;
}
