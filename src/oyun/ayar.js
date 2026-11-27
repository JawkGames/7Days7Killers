// Oyun akışının sayıları. Günlük sorgu hakkı, gün ve seçim sayısı src/cekirdek/ayarlar.js'ten gelir;
// buradakiler oraya taşınmayı bekliyor (ortak dosya: ana oturum karar verir).
export const OYUN_AYAR=Object.freeze({
  // Bir sorguda en çok kaç soru sorulabilir (kişinin sabrı), mizaca göre.
  sabir:Object.freeze({ofkeli:4,sert:4,gururlu:4,korkak:4,kurnaz:5,sakin:5,saf:6,dedikoducu:6}),
});
