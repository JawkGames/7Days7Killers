// Tohumlu seçim yardımcıları. Rastgelelik yalnızca cekirdek/rastgele.js içindeki rng'den gelir.
// Her aşama kendi etiketli akışını kullanır: çizelgeye bir satır eklemek rol seçimini kaydırmaz.

import {rng} from '../cekirdek/rastgele.js';

// FNV-1a: tohum ve etiketleri tek 32 bitlik sayıya indirir.
export function karma(...parcalar){
  let h=2166136261>>>0;
  for(const p of parcalar){
    const s=String(p);
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;}
    h^=0x2f; h=Math.imul(h,16777619)>>>0;
  }
  return h>>>0;
}

export function zar(...etiket){
  const r=rng(karma(...etiket));
  const z={
    r,
    olasilik:p=>r()<p,
    sec:l=>l[Math.floor(r()*l.length)],
    // l içinden w(x) ağırlığıyla seçer; hiçbir ağırlık artı değilse undefined.
    agirlikli(l,w=x=>x.w){
      let top=0; const ws=l.map(x=>{const v=Math.max(0,w(x)||0); top+=v; return v;});
      if(!(top>0)) return undefined;
      let x=r()*top;
      for(let i=0;i<l.length;i++){x-=ws[i]; if(x<0&&ws[i]>0) return l[i];}
      for(let i=l.length-1;i>=0;i--) if(ws[i]>0) return l[i];
      return undefined;
    },
    karistir(l){const a=[...l]; for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;},
  };
  return z;
}

// Kurulamayan vaka için atılır; vakaUret bunu yakalayıp türetilmiş tohumla yeniden dener.
// Başka her hata bir koddur ve yukarı çıkar.
export class UretimHatasi extends Error{
  constructor(mesaj){super(mesaj); this.name='UretimHatasi';}
}
