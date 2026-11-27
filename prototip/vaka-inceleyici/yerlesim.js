// Köy şemasının elle yerleştirilmiş koordinatları (viewBox 1000×790) ve mekân renkleri.
// Komşuluklar veriden gelir (src/icerik/mekanlar/*.js `komsular`); burada yalnızca çizim yeri durur.
// Burada olmayan yeni bir mekân haritanın altına sırayla dizilir.
export const KOORD={
  'aga-konagi':[446,371], 'agil':[482,40], 'bag-evi':[40,398], 'bakkal':[717,398], 'cami':[432,702],
  'cesme':[686,546], 'degirmen':[176,376], 'demirci-dukkani':[859,398], 'ebe-evi':[218,554], 'fistiklik':[387,153],
  'gulsum-evi':[309,432], 'halil-evi':[788,267], 'harman-yeri':[310,282], 'irgat-evi':[538,172], 'karakol':[908,540],
  'koy-odasi':[576,436], 'magara':[679,128], 'mezarlik':[248,702], 'muhtar-evi':[512,569], 'okul':[609,677],
  'sinir-patikasi':[928,267], 'sultan-evi':[361,576],
};

// Mekân türüne göre renk ailesi (ev sıcak, ortak sarı, iş yeşil, kır soğuk); aynı türde tonlar kayar.
const TUR_TON={ev:[0,38],ortak:[44,66],is:[80,160],kir:[180,265]};
export function mekanRenkleri(mekanlar){
  const R={};
  const turler={};
  for(const m of mekanlar) (turler[m.tur]??=[]).push(m.id);
  for(const m of mekanlar){
    const l=turler[m.tur]; const i=l.indexOf(m.id);
    const [a,b]=TUR_TON[m.tur]??[270,330];
    const ton=l.length>1?a+(b-a)*i/(l.length-1):a;
    const isik=i%2?34:42;
    R[m.id]={zemin:`hsl(${ton.toFixed(0)} 34% ${isik}% / .55)`,kenar:`hsl(${ton.toFixed(0)} 45% 58%)`,nokta:`hsl(${ton.toFixed(0)} 50% 62%)`};
  }
  return R;
}
export const BILINMEZ_RENK={zemin:'hsl(0 0% 40% / .5)',kenar:'hsl(0 0% 60%)',nokta:'hsl(0 0% 70%)'};
