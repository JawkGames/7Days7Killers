// Kör Halil (Halil Kılıç, 40): bir gözü perdeli katırcı. Gündüz yük taşır, gece sınırdan mal getirir. Sert.
// Geniş, kaba, yanık yüz; basık burun; alçak, çatık gür kaş; ağır kapaklı, sütlü (perdeli) bakış; pala bıyık, kirli sakal; başı açık, ensesine düşen dağınık kara saç; aba.
// Sol gözü perdeli (sütlü iris, yarı düşük kapak), sağ gözü kara; perdeli gözün üstünden yanağa inen eski, dikişli yara izi.
export default {
  id:'halil', cinsiyet:'E', yas:40,
  yuz:{en:1.07, boy:.98, alin:.92, elmacik:1.08, cene:1.18, ceneUc:1.14, gozAralik:67, gozEn:.92, gozBoy:.8, gozKapak:.5,
    kasKalin:1.75, kasEgim:-.1, kasY:7, burunBoy:.94, burunEn:1.3, dudakEn:1.02, dudakKalin:.7, boyun:1.28},
  renk:{ten:'#7c6a52', iris:'#3a2e22', sac:'#0f0d0b'},
  gozFarki:{perde:'sol', kapak:.18},
  iz:[{tur:'yara', x:-72, y:-8, boy:118, aci:1.32, egri:8, dikis:true, gen:1}],
  yasIzi:{kirisik:.4, gozAlti:1.3, cokukYanak:.8, kirSac:.05, lekeler:.15},
  sac:{bicim:'dagnik'},
  sakal:{bicim:'kirli'}, biyik:{bicim:'pala'},
  baslik:{tur:'yok'},
  ortu:'aba', giysi:{renk:'#3c3226', ic:'gomlek', icRenk:'#4c463a'},
  omuz:1.12,
  boy:1.02, iri:1.03
};
