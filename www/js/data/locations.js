// Locations, time slots, and physical clue definitions for 7 Days 7 Killers

export const TIME_SLOTS = ['sabah', 'ikindi', 'gece'];

export const TIME_SLOT_LABELS = {
  sabah: 'Sabah',
  ikindi: 'İkindi',
  gece: 'Gece'
};

export const LOCATIONS = [
  {
    id: 'degirmen',
    name: 'Eski Değirmen',
    locative: "Eski Değirmen'de",
    ablative: "Eski Değirmen'den",
    dative: "Eski Değirmen'e",
    accusative: "Eski Değirmen'i",
    genitive: "Eski Değirmen'in",
    photo: 'assets/locations/degirmen.webp',
    adjacentIds: ['kayikhane', 'demirci', 'han'],
    ambientDesc: 'Çürümüş çarkların gıcırdadığı, un tozu ve nehir rutubeti kokan taş yapı.',
    hotspots: [
      { x: 0.24, y: 0.76 },
      { x: 0.54, y: 0.68 },
      { x: 0.77, y: 0.74 }
    ]
  },
  {
    id: 'demirci',
    name: 'Demirci Atölyesi',
    locative: "Demirci Atölyesi'nde",
    ablative: "Demirci Atölyesi'nden",
    dative: "Demirci Atölyesi'ne",
    accusative: "Demirci Atölyesi'ni",
    genitive: "Demirci Atölyesi'nin",
    photo: 'assets/locations/demirci.webp',
    adjacentIds: ['han', 'degirmen', 'sapel'],
    ambientDesc: 'Sönmeye yüz tutmuş ocağın kül ve kızgın demir kokusunu sakladığı isli atölye.',
    hotspots: [
      { x: 0.25, y: 0.75 },
      { x: 0.52, y: 0.64 },
      { x: 0.76, y: 0.73 }
    ]
  },
  {
    id: 'sapel',
    name: 'Mezarlık Şapeli',
    locative: "Mezarlık Şapeli'nde",
    ablative: "Mezarlık Şapeli'nden",
    dative: "Mezarlık Şapeli'ne",
    accusative: "Mezarlık Şapeli'ni",
    genitive: "Mezarlık Şapeli'nin",
    photo: 'assets/locations/sapel.webp',
    adjacentIds: ['eczane', 'demirci', 'kayikhane'],
    ambientDesc: 'Selvi ağaçlarının gölgesinde, erimiş mum ve ıslak toprak kokan soğuk taş şapel.',
    hotspots: [
      { x: 0.26, y: 0.77 },
      { x: 0.50, y: 0.70 },
      { x: 0.75, y: 0.74 }
    ]
  },
  {
    id: 'eczane',
    name: 'Eczane Arka Odası',
    locative: "Eczane Arka Odası'nda",
    ablative: "Eczane Arka Odası'ndan",
    dative: "Eczane Arka Odası'na",
    accusative: "Eczane Arka Odası'nı",
    genitive: "Eczane Arka Odası'nın",
    photo: 'assets/locations/eczane.webp',
    adjacentIds: ['han', 'sapel', 'demirci'],
    ambientDesc: 'Kilitli cam dolapların ardında tentürdiyot, eter ve kurutulmuş ot kokan loş oda.',
    hotspots: [
      { x: 0.23, y: 0.74 },
      { x: 0.53, y: 0.66 },
      { x: 0.78, y: 0.72 }
    ]
  },
  {
    id: 'han',
    name: 'Kasaba Hanı',
    locative: "Kasaba Hanı'nda",
    ablative: "Kasaba Hanı'ndan",
    dative: "Kasaba Hanı'na",
    accusative: "Kasaba Hanı'nı",
    genitive: "Kasaba Hanı'nın",
    photo: 'assets/locations/han.webp',
    adjacentIds: ['eczane', 'demirci', 'kayikhane'],
    ambientDesc: 'Ucuz tütün dumanı, ekşi şarap ve fısıltılı pazarlıkların sindiği ahşap han.',
    hotspots: [
      { x: 0.27, y: 0.76 },
      { x: 0.51, y: 0.69 },
      { x: 0.76, y: 0.75 }
    ]
  },
  {
    id: 'kayikhane',
    name: 'Sisli Kayıkhane',
    locative: "Sisli Kayıkhane'de",
    ablative: "Sisli Kayıkhane'den",
    dative: "Sisli Kayıkhane'ye",
    accusative: "Sisli Kayıkhane'yi",
    genitive: "Sisli Kayıkhane'nin",
    photo: 'assets/locations/kayikhane.webp',
    adjacentIds: ['degirmen', 'han', 'sapel'],
    ambientDesc: 'Karanlık suların çürük direklere vurduğu, katran ve yosun kokan ıssız iskele sundurması.',
    hotspots: [
      { x: 0.25, y: 0.74 },
      { x: 0.52, y: 0.71 },
      { x: 0.77, y: 0.69 }
    ]
  }
];

const LOCATION_MAP = new Map(LOCATIONS.map((loc) => [loc.id, loc]));

export function getLocationById(id) {
  return LOCATION_MAP.get(id) || null;
}

export const CLUE_TYPES = [
  {
    id: 'red_yarn',
    name: 'Kırmızı Kazak İpi',
    accusative: 'kırmızı kazak ipini',
    instrumental: 'kırmızı kazak ipiyle',
    sprite: 'assets/clues/red_yarn.png',
    category: 'esya',
    shortDesc: 'Pürüzlü tahtaya veya çiviye takılıp kopmuş koyu kırmızı yün örgü ipi.'
  },
  {
    id: 'muddy_boot',
    name: 'Çamurlu Çizme İzi',
    accusative: 'çamurlu çizme izini',
    instrumental: 'çamurlu çizmeyle',
    sprite: 'assets/clues/muddy_boot.png',
    category: 'iz',
    shortDesc: 'Nehir balçığı ve ıslak kül karışımı ağır tabanlı çizme baskısı.'
  },
  {
    id: 'blacksmith_hammer',
    name: 'Demirci Çekici',
    accusative: 'demirci çekicini',
    instrumental: 'demirci çekiciyle',
    sprite: 'assets/clues/blacksmith_hammer.png',
    category: 'alet',
    shortDesc: 'Sapı isli meşeden, başı dövme demirden ağır darbe çekici.'
  },
  {
    id: 'pocket_watch',
    name: 'Durmuş Cep Saati',
    accusative: 'durmuş cep saatini',
    instrumental: 'durmuş cep saatiyle',
    sprite: 'assets/clues/pocket_watch.png',
    category: 'zaman',
    shortDesc: 'Camı çatlamış, yelkovanı boğuşma anında takılı kalmış pirinç cep saati.'
  },
  {
    id: 'amber_vial',
    name: 'Kehribar İlaç Şişesi',
    accusative: 'kehribar ilaç şişesini',
    instrumental: 'kehribar ilaç şişesiyle',
    sprite: 'assets/clues/amber_vial.png',
    category: 'alet',
    shortDesc: 'Dibinde keskin ve acı kokulu tortu kalmış koyu cam eczane şişesi.'
  },
  {
    id: 'empty_nail',
    name: 'Duvarda Boş Çivi İzi',
    accusative: 'duvardaki boş çivi izini',
    instrumental: 'boş kalan çivi askısıyla',
    sprite: 'assets/clues/empty_nail.png',
    category: 'eksik',
    shortDesc: 'Uzun süredir asılı duran bir aletin aceleyle alındığını ele veren tozsuz duvar izi.'
  },
  {
    id: 'brass_key',
    name: 'Kararmış Pirinç Anahtar',
    accusative: 'kararmış pirinç anahtarı',
    instrumental: 'kararmış pirinç anahtarla',
    sprite: 'assets/clues/brass_key.png',
    category: 'esya',
    shortDesc: 'Dişleri eski asma kilitlere uyacak biçimde eğelenmiş ağır pirinç anahtar.'
  },
  {
    id: 'torn_letter',
    name: 'Yırtık Mektup Köşesi',
    accusative: 'yırtık mektup köşesini',
    instrumental: 'yırtık mektup parçasıyla',
    sprite: 'assets/clues/torn_letter.png',
    category: 'esya',
    shortDesc: 'Mürekkebi rutubetten dağılmış, yarım kalmış tehdit satırları taşıyan kağıt parçası.'
  },
  {
    id: 'broken_beads',
    name: 'Kopmuş Tespih / Kolye',
    accusative: 'kopmuş tespih tanelerini',
    instrumental: 'kopmuş tespihle',
    sprite: 'assets/clues/broken_beads.png',
    category: 'esya',
    shortDesc: 'Arbede sırasında ipi kopup döşeme aralıklarına dağılmış koyu taş dizisi.'
  },
  {
    id: 'cigar_stub',
    name: 'Sarma Tütün İzmariti',
    accusative: 'sarma tütün izmaritini',
    instrumental: 'sarma tütün izmaritiyle',
    sprite: 'assets/clues/cigar_stub.png',
    category: 'iz',
    shortDesc: 'Karanlıkta pusu beklerken içilip ökçe altında ezilmiş sert kaçak tütün izmariti.'
  },
  {
    id: 'bloodied_bandage',
    name: 'Kanlı Sargı Bezi',
    accusative: 'kanlı sargı bezini',
    instrumental: 'kanlı sargı beziyle',
    sprite: 'assets/clues/bloodied_bandage.png',
    category: 'iz',
    shortDesc: 'Taze kan ve tentürdiyot lekesi taşıyan, telaşla sıyrılıp düşmüş keten sargı.'
  },
  {
    id: 'iron_shears',
    name: 'Ağır Demir Makas',
    accusative: 'ağır demir makası',
    instrumental: 'ağır demir makasla',
    sprite: 'assets/clues/iron_shears.png',
    category: 'alet',
    shortDesc: 'Kalın çuvalı da kemikli eti de tek hamlede kesebilen perçinli demir makas.'
  }
];

const CLUE_TYPE_MAP = new Map(CLUE_TYPES.map((clue) => [clue.id, clue]));

export function getClueTypeById(id) {
  return CLUE_TYPE_MAP.get(id) || null;
}
