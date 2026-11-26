// Olay çekirdekleri: elle yazılmış hikâye parçaları (src/icerik/olay-cekirdekleri/).
// Bir çekirdek yeni sebep yaratmaz; köyde zaten var olan bir sebebin ağırlığını artırır ve
// ikisi de katil çıkarsa bir bağ önerir. Şema:
//   {id, agirlik?, gerekli:[kisi...], ciftler:[{katil, kurban, carpan}], baglar?:[{tur:'ortme', ortan, ortulen} | {tur:'ortaklik', katil, yardimci}]}

// Döner: hata cümleleri listesi. ciftler verilirse (sebepAdaylari sonucu) sebebi olmayan çift de hatadır.
export function cekirdekDogrula(liste,koy,ciftler){
  const h=[], gorulen=new Set();
  for(const c of liste){
    const e=m=>h.push(`çekirdek ${c.id}: ${m}`);
    if(!c.id||!/^[a-z-]+$/.test(c.id)) e('kimlik küçük harf ve tire olmalı');
    if(gorulen.has(c.id)) e('kimlik tekrar ediyor'); gorulen.add(c.id);
    for(const k of c.gerekli||[]) if(!koy.kisiler[k]) e(`gerekli kişi yok: ${k}`);
    if(!Array.isArray(c.ciftler)||!c.ciftler.length) e('en az bir çift gerekli');
    for(const p of c.ciftler||[]){
      if(!koy.kisiler[p.katil]||!koy.kisiler[p.kurban]) e(`çiftte kişi yok: ${p.katil} → ${p.kurban}`);
      if(!(p.carpan>0)) e(`çarpan artı olmalı: ${p.katil} → ${p.kurban}`);
      if(ciftler&&!ciftler.has(p.katil+'|'+p.kurban)) e(`sebebi olmayan çift: ${p.katil} → ${p.kurban}`);
    }
    for(const b of c.baglar||[]) if(!['ortme','ortaklik'].includes(b.tur)) e(`bilinmeyen bağ: ${b.tur}`);
  }
  return h;
}

// Köyde kurulabilen çekirdeklerden `sayi` kadarını ağırlığa göre seçer.
export function cekirdekSec(z,liste,koy,sayi){
  let l=[...liste].filter(c=>(c.gerekli||[]).every(k=>koy.kisiler[k])).sort((a,b)=>a.id<b.id?-1:1);
  const secilen=[];
  while(secilen.length<sayi&&l.length){
    const c=z.agirlikli(l,c=>c.agirlik??1);
    if(!c) break;
    secilen.push(c); l=l.filter(x=>x!==c);
  }
  return secilen;
}
