// Köyün komşuluk haritası: hangi mekândan hangisi görülür ya da duyulur.
// Tanık izi bu haritaya dayanır ("o dilimde orada ya da komşu mekânda olan").
// Mekân dosyası `komsular:[...]` taşırsa o da eklenir; tablo yalnızca bugünkü 22 mekân için başlangıçtır.
// Komşuluk her zaman iki yönlüdür.

const TABLO={
  'cami':['koy-odasi','cesme','mezarlik','okul','sultan-evi','ebe-evi'],
  'koy-odasi':['cesme','bakkal','muhtar-evi','aga-konagi'],
  'cesme':['bakkal','muhtar-evi','gulsum-evi','demirci-dukkani','irgat-evi'],
  'bakkal':['demirci-dukkani','halil-evi'],
  'muhtar-evi':['aga-konagi','okul'],
  'aga-konagi':['harman-yeri','fistiklik'],
  'okul':['karakol'],
  'karakol':['demirci-dukkani','sinir-patikasi'],
  'demirci-dukkani':['halil-evi'],
  'halil-evi':['irgat-evi','sinir-patikasi'],
  'irgat-evi':['gulsum-evi','harman-yeri'],
  'gulsum-evi':['sultan-evi','degirmen'],
  'sultan-evi':['ebe-evi','mezarlik'],
  'ebe-evi':['mezarlik','degirmen'],
  'mezarlik':['bag-evi'],
  'degirmen':['harman-yeri','bag-evi'],
  'harman-yeri':['fistiklik'],
  'fistiklik':['bag-evi','agil'],
  'agil':['magara'],
  'magara':['sinir-patikasi'],
};

// Döner: {mekan:[komşular, sıralı]} — düz veri, vakaya olduğu gibi yazılır.
export function haritaKur(mekanlar){
  const k={};
  for(const id of Object.keys(mekanlar)) k[id]=new Set();
  const bagla=(a,b)=>{if(a===b||!k[a]||!k[b]) return; k[a].add(b); k[b].add(a);};
  for(const [a,l] of Object.entries(TABLO)) for(const b of l) bagla(a,b);
  for(const m of Object.values(mekanlar)) for(const b of m.komsular||[]) bagla(m.id,b);
  return Object.fromEntries(Object.keys(k).sort().map(id=>[id,[...k[id]].sort()]));
}
