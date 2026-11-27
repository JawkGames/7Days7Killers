// Oyun katmanının yapay zekâ için taşıdıkları: 'soz' parçasında anlam, yalnız yalan söyleyen suçluya yalan bilgisi,
// serbest soru metni. Oyun saf kalır: yapay zekâ çağrısı yok.
import {describe,it,expect,beforeAll} from 'vitest';
import {koy} from './yardim-oyun.js';
import {baglamKur,oyunBaslat,acilis,uygula,sorular,defterGorunumu} from '../src/oyun/oyun.js';

let b, sorgu;
// Birini çağırıp sorguya al.
function cagir(kisi){
  let d=acilis(b,oyunBaslat({tohum:77})).durum;
  d=uygula(b,d,{tur:'ilerle'}).durum; // fotoğraf
  d=uygula(b,d,{tur:'ilerle'}).durum; // çağırma
  const r=uygula(b,d,{tur:'cagir',kisi});
  return r;
}
beforeAll(()=>{ b=baglamKur({tohum:77,koy}); sorgu=cagir; });

describe('anlam alanı',()=>{
  it('selam ve cevap sözlerinde anlam var; soru etiketi, tavır, gerginlik',()=>{
    const masum=b.ids.find(k=>!b.vaka.cinayetler.some(c=>c.katil===k||c.yardimci===k)&&!(b.vaka.baglar||[]).some(x=>x.ortan===k)&&b.vaka.kisiler[k].olum==null);
    const r=sorgu(masum);
    const sel=r.goster.find(p=>p.tur==='soz');
    expect(sel.anlam).toMatchObject({soru:null,tavir:'dogru'});
    let d=r.durum;
    for(const q of sorular(b,d).slice(0,4)){
      if(d.zaman.adim!=='sorgu') break;
      const x=uygula(b,d,{tur:'sor',soru:q.id}); d=x.durum;
      const s=x.goster.find(p=>p.tur==='soz');
      expect(s.anlam.soru).toBe(q.etiket);
      expect(typeof s.anlam.gerginlik).toBe('number');
      expect(s.anlam.yalan).toBeUndefined(); // masuma sır ya da gerçek gitmez
    }
  });
  it('yalan söyleyen katile mazeret, sakladığı ve suç atabileceği kişiler verilir',()=>{
    let bulundu=null;
    for(const c of b.vaka.cinayetler){
      let d=sorgu(c.katil).durum;
      for(const q of sorular(b,d)){
        if(d.zaman.adim!=='sorgu') break;
        const x=uygula(b,d,{tur:'sor',soru:q.id}); d=x.durum;
        const s=x.goster.find(p=>p.tur==='soz');
        if(s.anlam.tavir==='yalan'){ expect(s.anlam.yalan,q.id).toBeTruthy(); bulundu=s.anlam.yalan; break; }
        else expect(s.anlam.yalan).toBeUndefined();
      }
      if(bulundu) break;
    }
    expect(bulundu).toBeTruthy();
    expect(bulundu.saklanan.length).toBeGreaterThan(0);
    expect(Array.isArray(bulundu.mazeret)&&Array.isArray(bulundu.hedefler)).toBe(true);
    for(const m of [...bulundu.saklanan,...bulundu.mazeret,...bulundu.hedefler]) expect(m).not.toMatch(/undefined|[{}]/);
  });
});

describe('serbest soru',()=>{
  it('oyuncunun yazdığı soru olarak gösterilir ve deftere o yazılır; cevap motorun',()=>{
    const k=b.ids.find(x=>b.vaka.kisiler[x].olum==null);
    const d=sorgu(k).durum;
    const q=sorular(b,d)[0];
    const duz=uygula(b,d,{tur:'sor',soru:q.id});
    const x=uygula(b,d,{tur:'sor',soru:q.id,metin:'  Dün gece hangi cehennemdeydin?  '});
    expect(x.goster[0]).toMatchObject({tur:'soru',metin:'Dün gece hangi cehennemdeydin?'});
    expect(x.goster.find(p=>p.tur==='soz').metin).toBe(duz.goster.find(p=>p.tur==='soz').metin);
    const f=x.durum.defter.ifadeler.at(-1);
    expect(f.soru).toMatchObject({id:q.id,etiket:q.etiket,yazilan:'Dün gece hangi cehennemdeydin?'});
    expect(f.iddialar).toEqual(duz.durum.defter.ifadeler.at(-1).iddialar); // deftere yalnız motorun iddiaları girer
    expect(defterGorunumu(b,x.durum).ifadeler.at(-1).metin).toContain('hangi cehennemdeydin');
  });
});
