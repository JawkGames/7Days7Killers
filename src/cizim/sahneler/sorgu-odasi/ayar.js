// Sorgu odası sahnesinin ölçüleri.
export const OLCU={yukseklik:1200, enAzGenislik:700, kafaY:470, masaY:940, kaynamaHizi:7, pay:72};
/* kamera: imleç sağa-sola gidince katmanlar farklı miktarda kayar (yakın olan çok, uzak olan az) */
export const DERINLIK={duvar:10, golge:13, ampul:17, sandalye:25, karakter:27, masa:46};
/* giriş: kapı açılır, kadın karanlıktan bize doğru yürür, karşımıza oturur */
export const GIRIS={
  kapi:[[318,304],[520,292],[540,1040],[304,1040]], // arka plandaki kapı boşluğu; eşiği masanın arkasında kalır
  kapiX:425, uzakOlcek:3,                          // kapıdaki boyu = yakındakinin 1/(1+3)'ü; zemin çizgisi masa kenarının altına düşer
  ayaktaFark:190,                                  // ayaktayken gözü, otururkenkinden yalnızca bu kadar yukarıda: yüzü hep kadrajda kalır
  adim:10, adimZiplama:16, adimSalinim:14,
  zaman:{kapiAc:[0,1.2], belir:[1.0,1.7], yuru:[2.2,6.8], kapiKapat:[3.4,4.8], otur:[5.9,7.6], bitis:7.9}
};
