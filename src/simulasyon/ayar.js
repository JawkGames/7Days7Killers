// Olay üretim motorunun sayıları. Katil ve gün sayısı oyunun ortak ayarından gelir
// (cekirdek/ayarlar.js); burada yalnızca motora özgü değerler durur.
// Denemek için: vakaUret(tohum, koy, {katilSayisi:5, oranlar:{kacanTanik:1}}).

import {AYARLAR} from '../cekirdek/ayarlar.js';

export const SIM_AYAR=Object.freeze({
  surum:1, // vaka biçiminin sürümü (README'deki biçim değişirse artar)
  katilSayisi:AYARLAR.katilSayisi,
  gunSayisi:AYARLAR.gunSayisi,
  // Bir günün dilimleri, sırayla. "gece" günün İLK dilimidir: bir önceki akşamdan sonraki,
  // sabaha karşı biten gece. Böylece "gün sonu cinayeti" ertesi günün gece diliminde durur
  // ve o günün sabahı fotoğraf olarak masaya gelir.
  dilimler:Object.freeze(['gece','sabah','ogle','ikindi','aksam']),
  dilimSaatleri:Object.freeze({gece:'23-05',sabah:'06-10',ogle:'11-14',ikindi:'15-17',aksam:'18-22'}),
  bulunmaDilimi:'sabah', // her ceset en geç kendi gününün bu diliminde bulunur
  // Bir oyun gününün cinayeti hangi dilimlerde olabilir. onceki:true bir önceki günün dilimi demek.
  cinayetPenceresi:Object.freeze([
    Object.freeze({onceki:true,dilim:'ikindi',agirlik:.12}),
    Object.freeze({onceki:true,dilim:'aksam',agirlik:.33}),
    Object.freeze({onceki:false,dilim:'gece',agirlik:.55}),
  ]),
  cekirdekSayisi:2, // her vakaya karışan olay çekirdeği sayısı (varsa)
  enAzSebep:.6, // bundan zayıf sebep (katil|kurban ağırlığı) cinayete yetmez
  enAzBag:2, // katiller arasında en az bu kadar bağ kurulmaya çalışılır
  azamiDeneme:40,
  tamamlamaTuru:3, // çözücünün zincir bulamadığı katile ek iz bırakma turu (0: kapalı)
  kalite:null, // kalite eleği ayarı (cozucu/kalite.js KALITE_AYAR'ın üstüne yazılır); elek:false eleği kapatır // kurulamayan vaka bu kadar kez türetilmiş tohumla yeniden denenir
  oranlar:Object.freeze({
    santaj:.3, // yeni katil, sırrını bilen eski bir katil tarafından zorlanır
    ortaklik:.22, // bir katil başka bir katilin cinayetinde yardımcı olur
    ortme:.4, // bir katil başka bir katile sahte tanıklık (gizli birliktelik) verir
    kacanTanik:.28, // olay yerine yoldan geçen biri düşer, saldırıya uğrar, kaçar, eşya bırakır
    oncekiGecis:.5, // olay yerinden daha önce geçen birinin izi kalır
    kurbanEsyasi:.4,
    calintiSilahKurnaz:2.5, // kurnaz katilin başkasının aletini çalma ağırlığı
    calintiSilah:.6,
    silahBirakma:.25, // kendi silahını olay yerinde bırakma
    aletYerinde:.9, // olay yerinde duran aleti (dirgen, kürek, değirmen demiri) kapma ağırlığı
    aletGetirme:.45, // kendi evinden/iş yerinden alet (balta, av tüfeği, urgan) getirme ağırlığı
    aletBirakma:.55, // yerin aletini olay yerinde bırakma
    elleBogma:.45, // silahsız: elle boğma ağırlığı (güçsüz katilde azalır)
    tasla:.4, // silahsız: taşla, odunla vurma ağırlığı
    calintiBirakma:.7, // çalıntı silahı olay yerinde bırakma (suçu başkasına atmak için)
    gorme:Object.freeze({gece:.3,sabah:.75,ogle:.75,ikindi:.65,aksam:.5}), // komşu mekândan görme olasılığı
    yuzTanima:Object.freeze({gece:.3,sabah:1,ogle:1,ikindi:.9,aksam:.65}), // gören yüzü seçer mi, yoksa yalnızca silüet mi
    geceYoklugu:.45,
    kanliGiysi:.65,
    tirmik:.65,
  }),
});

// Varsayılanların üstüne verilen değerleri yazar (oranlar alan alan birleşir).
export function ayarKur(ek={}){
  return {...SIM_AYAR,...ek,oranlar:{...SIM_AYAR.oranlar,...(ek.oranlar||{})}};
}
