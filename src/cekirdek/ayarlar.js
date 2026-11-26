// Oyunun bütün ayarları tek yerde (PLAN: "Ayarlar tek yerde").
// Kod bu sayıları kendi içine yazmaz, buradan okur. Nesne derin dondurulmuştur:
// çalışırken değiştirilemez; denemek için yeni bir nesne kurup işlevlere parametre olarak verin.

function dondur(n){
  for(const d of Object.values(n)) if(d&&typeof d==='object') dondur(d);
  return Object.freeze(n);
}

export const AYARLAR=dondur({
  // Oyun kuralları
  katilSayisi:7,
  gunSayisi:7,
  // KARAR BEKLİYOR: günlük sorgu hakkı için 4 geçici değer. Denge aşamasında
  // (yol haritası 10) oynanarak belirlenecek; 3 ile 5 arası tartışılıyor.
  gunlukSorguHakki:4,
  finalSecimSayisi:7, // FINAL VERDICT'te seçilecek kişi sayısı (katil sayısıyla aynı tutulur)

  // Kayıt
  kayit:{
    anahtar:'7d7k.kayit', // depolamadaki anahtar
  },

  // Telefonu eğme (platform/girdi.js)
  egim:{
    azamiAci:25, // bu kadar derece eğince değer -1 ya da 1 olur
    oluBolge:.04, // bu mutlak değerin altı 0 sayılır (el titremesi)
  },

  // Varsayılan tercihler (oyuncu değiştirebilir, kayıtta saklanır)
  tercihler:{
    dil:'tr',
    azHareket:null, // null: sistemin "az hareket" ayarına uy; true/false: oyuncunun seçimi
  },
});
