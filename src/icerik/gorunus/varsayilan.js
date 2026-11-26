// Varsayılan kadın: sorgu odası prototipindeki ilk karakter. Rig, karakterSec çağrılmazsa bunu çizer.
// Alanların çoğu boş bırakıldı: boş alan "varsayılan kadının ölçüsü" demektir (bütün yüz çarpanları 1).
// Bu dosyadaki sayıları değiştirmek sorgu odasının ilk karesini değiştirir.
export default {
  id:'varsayilan', cinsiyet:'K', yas:38,
  yuz:{},                       // bütün ölçüler 1 (gozAralik 66)
  renk:{},                      // ten: PAL'deki solgun ten; saç: kara; dudak: koyu kırmızı; göz: soluk yeşil
  yasIzi:{kirisik:0, gozAlti:1, cokukYanak:1, kirSac:0, lekeler:0},
  sac:{bicim:'uzun'},
  sakal:{bicim:'yok'}, biyik:{bicim:'yok'},
  baslik:{tur:'yok'},
  ortu:'palto', giysi:{ic:'bluz'},
  omuz:1
};
