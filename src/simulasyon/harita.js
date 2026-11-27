// Köyün komşuluk haritası: hangi mekândan hangisi görülür ya da duyulur.
// Tanık izi bu haritaya dayanır ("o dilimde orada ya da komşu mekânda olan").
// Kaynak mekân verisidir: src/icerik/mekanlar/<id>.js içindeki `komsular:[...]` (kur.js dogrula iki yönlü olmasını denetler).
// Yine de burada iki yönlü kurulur: tek yönlü yazılmış bir komşuluk motoru bozmasın.

// Döner: {mekan:[komşular, sıralı]} — düz veri, vakaya olduğu gibi yazılır.
export function haritaKur(mekanlar){
  const k={};
  for(const id of Object.keys(mekanlar)) k[id]=new Set();
  const bagla=(a,b)=>{if(a===b||!k[a]||!k[b]) return; k[a].add(b); k[b].add(a);};
  for(const m of Object.values(mekanlar)) for(const b of m.komsular||[]) bagla(m.id,b);
  return Object.fromEntries(Object.keys(k).sort().map(id=>[id,[...k[id]].sort()]));
}
