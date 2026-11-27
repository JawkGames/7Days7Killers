// Türkçe Arayüz Metinleri, Ek Uyumu ve Kişilik Tonu Kalıpları

export const UI_TR = {
  gameTitle: '7 Days 7 Killers',
  dayPrefix: 'GÜN',
  summonsPrefix: 'SORGU HAKKI',
  seedPrefix: 'TOHUM',
  openPhotos: 'OLAY YERİ FOTOĞRAFLARI',
  openSummon: 'ŞÜPHELİ ÇAĞIR',
  openNotebook: 'DEDEKTİF DEFTERİ',
  endDay: 'GÜNÜ BİTİR',
  rewindBtn: 'ZAMANI GERİ SAR (1. GÜNE DÖN)',
  verdictBtn: 'SON HÜKÜM (7 KATİLİ SEÇ)',
  markKiller: 'KATİL?',
  markCleared: 'TEMİZ',
  dismiss: 'GÖNDER'
};

export const TONE_PROFILES = {
  ofkeli: {
    openers: [
      'Sertçe masaya eğilerek:',
      'Dişlerini sıkarak konuşur:',
      'Sesini alçaltıp ters ters bakarak:'
    ],
    alibiTruth: (loc, partner) =>
      `Beni neyle suçlamaya çalışıyorsun Müfettiş?! Bütün gece ${loc.locative} idim, ${partner.name} de yanımda oturuyordu. Git ona sor!`,
    alibiLie: (fakeLoc) =>
      `Saçma sapan imalarda bulunma! Ben o gece ${fakeLoc.locative} kendi işimdeydim, kimsenin kanıyla işim olmaz.`,
    denyClue: (clue) =>
      `${clue.name} mı? Kasabanın yarısında var ondan! Kim oraya attıysa beni yakmaya çalışmış!`,
    cracked: (coreTitle) =>
      `... Yeter! Üstüme gelme! Tamam, yalan söyledim ama "${coreTitle}" meselesini kurcalayan kendisiydi! Yine de kan döktüğümü kanıtlayamazsın!`,
    defaultEmotion: 'angry'
  },
  sogukkanli: {
    openers: [
      'Gözünü bile kırpmadan:',
      'Buz gibi sakin bir sesle:',
      'Ellerini paltosunun içinde kavuşturarak:'
    ],
    alibiTruth: (loc, partner) =>
      `Kayıtlarınıza geçebilirsiniz. O gece ${loc.locative} bulundum; ${partner.name} da tanığımdır.`,
    alibiLie: (fakeLoc) =>
      `Yanlış iz sürüyorsunuz. O saatlerde ${fakeLoc.locative} tek başıma işlerimi toparlıyordum.`,
    denyClue: (clue) =>
      `${clue.name} tek başına hiçbir şey kanıtlamaz Müfettiş. Eşyalar yer değiştirir, insanlar yanılır.`,
    cracked: (coreTitle) =>
      `... Demek açığı yakaladınız. Evet, o gece dediğim yerde değildim. "${coreTitle}" sırrı hepimizi boğuyordu... ama son darbeyi kimin vurduğunu benden duyamazsınız.`,
    defaultEmotion: 'neutral'
  },
  dedikoducu: {
    openers: [
      'Etrafı kolaçan edip fısıldayarak:',
      'Gözleri parlayıp öne doğru uzanarak:',
      'Sır verir gibi sesini kısarak:'
    ],
    alibiTruth: (loc, partner) =>
      `Vallahi billahi ben o karanlıkta dışarı adım atmadım! Bütün gece ${loc.locative} ${partner.comitative} laflıyorduk.`,
    alibiLie: (fakeLoc) =>
      `Ay hiç üstüme alınmam doğrusu! O gece ${fakeLoc.locative} köşemde oturuyordum, kimseyle göz göze bile gelmedim.`,
    denyClue: (clue) =>
      `Aaa, ${clue.name.toLowerCase()} mi bulunmuş? Vallahi benden çıkmadı, ama bu kasabada başkasının eşyasını aşıran çoktur!`,
    cracked: (coreTitle) =>
      `... Dilim kurusaydı da yalan söylemeseydim! "${coreTitle}" yüzünden başımız yanacaktı, korkudan nereye gittiğimi gizledim!`,
    defaultEmotion: 'defensive'
  },
  korkak: {
    openers: [
      'Sesi titreyip gözlerini kaçırarak:',
      'Yutkunup omuzlarını büzerek:',
      'Parmaklarını paltosunun eteğine kenetleyerek:'
    ],
    alibiTruth: (loc, partner) =>
      `Y-yemin ederim ben kimseye dokunmadım... Gece boyunca ${loc.locative} saklandım, ${partner.name} da oradaydı, ne olur ona sorun...`,
    alibiLie: (fakeLoc) =>
      `B-ben... şey... o gece ${fakeLoc.locative} kapıyı kilitleyip oturdum... Dışarıdan sesler geldi ama hiç bakmadım...`,
    denyClue: (clue) =>
      `O ${clue.name.toLowerCase()}... b-benim yüzümden orada olamaz... Birisi mahsus bırakmış olmalı, yalvarırım inanmayın!`,
    cracked: (coreTitle) =>
      `... T-tamam, titrediğimi görüyorsun işte! O gece oradaydım... "${coreTitle}" belası gırtlağımıza dayanmıştı, başka çarem kalmamıştı sanıyordum!`,
    defaultEmotion: 'nervous'
  },
  sadik: {
    openers: [
      'Ağırbaşlı ama temkinli bir ifadeyle:',
      'Başını hafifçe eğerek:',
      'Yorgun gözlerini masaya dikerek:'
    ],
    alibiTruth: (loc, partner) =>
      `Doğruyu söylüyorum Müfettiş. Cinayet gecesi ${loc.locative} ${partner.comitative} birlikteydik, dışarı çıkmadım.`,
    alibiLie: (fakeLoc) =>
      `Vicdanım rahat diyemem ama o gece ${fakeLoc.locative} bekliyordum. Başka bir şey sormayın.`,
    denyClue: (clue) =>
      `${clue.name} orada nasıl bulundu bilmiyorum; ama her gördüğünüz izi günah diye boynuma asmayın.`,
    cracked: (coreTitle) =>
      `... Demek gerçeği saklayacak yer kalmadı. Yalan söyledim çünkü "${coreTitle}" meselesinde sevdiklerimi korumak zorundaydım...`,
    defaultEmotion: 'defensive'
  }
};

export function getToneProfile(personality) {
  return TONE_PROFILES[personality] || TONE_PROFILES.sogukkanli;
}
