// Kayıp sahnelerinin ölçüleri ve zaman çizelgesi.
/* tasarım yüksekliği 1200 birim; duvarın zemine değdiği çizgi zeminY. 1 metre ≈ 290 birim.
   Telefonda (dikey) fazladan yükseklik üstte tavan, altta alt yazının oturduğu karanlık zemin olur. */
export const OLCU={yukseklik:1200, enAzGenislik:720, pay:130, zeminY:770, ustPay:.62};

/* kamera kayınca katmanlar farklı miktarda kayar: arka az, ön çok */
export const DERINLIK={arka:14, orta:34, on:64};

/* sahne ağır tempolu: karanlıktan açılır, cümle harf harf belirir, kararır, biter */
export const ZAMAN={
  acilis:[0,1.8],        // siyahtan açılış
  yaziBas:2.1,           // alt yazının ilk harfi
  harf:.052,             // harf başına saniye
  yaziSonrasi:2.4,       // cümle bittikten sonra bekleme
  enErkenKararma:7.6,    // kararma bundan önce başlamaz
  enGecKararma:9.4,      // uzun cümlede bile sahne 11 saniyeyi geçmez
  kararma:1.5,           // kararma süresi
  bitisBekle:.35         // tam karanlıkta bekleyip bitti çağrılır
};

/* yavaş kamera: soldan sağa kayma ve çok hafif yaklaşma */
export const KAMERA={kayma:.62, yaklas:.04};

/* hatların kaynaması: orta katman bu kadar kopya çizilir, saniyede bu kadar kez değişir */
export const KAYNAMA={kopya:3, hiz:7};
