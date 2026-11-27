import {describe,it,expect} from 'vitest';
import {koy} from '../src/icerik/index.js';
import {cekirdekListesi} from '../src/icerik/olay-cekirdekleri/index.js';
import {vakaUret,vakaDenetle,sebepAdaylari,cekirdekDogrula,SIM_AYAR} from '../src/simulasyon/index.js';
import {dunyaKur} from '../src/simulasyon/dunya.js';
import {haritaKur} from '../src/simulasyon/harita.js';
import {ayarKur} from '../src/simulasyon/ayar.js';

const KOY={...koy,cekirdekler:cekirdekListesi};
const D=SIM_AYAR.dilimler.length, T=SIM_AYAR.gunSayisi*D;

describe('vaka üretimi: belirlenimcilik',()=>{
  it('aynı tohum birebir aynı vakayı verir',()=>{
    const a=vakaUret(1943,KOY), b=vakaUret(1943,KOY);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('vaka düz veridir (JSON gidiş-dönüş değişmez)',()=>{
    const v=vakaUret(7,KOY);
    expect(JSON.parse(JSON.stringify(v))).toEqual(v);
  });
  it('farklı tohumlar farklı vakalar verir',()=>{
    const kume=new Set([1,2,3,4,5,6,7,8].map(s=>vakaUret(s,KOY).katiller.map(k=>k.kisi).sort().join(',')));
    expect(kume.size).toBeGreaterThanOrEqual(7);
  });
  it('metin tohum da çalışır ve belirlenimcidir',()=>{
    expect(vakaUret('sarikuyu',KOY)).toEqual(vakaUret('sarikuyu',KOY));
  });
  it('Math.random ve Date kullanmaz',()=>{
    const r=Math.random, n=Date.now, Dt=globalThis.Date;
    Math.random=()=>{throw new Error('Math.random çağrıldı');};
    Date.now=()=>{throw new Error('Date.now çağrıldı');};
    globalThis.Date=function(){throw new Error('Date çağrıldı');};
    try{expect(()=>vakaUret(5,KOY)).not.toThrow();}
    finally{Math.random=r; Date.now=n; globalThis.Date=Dt;}
  });
  it('çekirdeksiz köyde de kurulur',()=>{
    const v=vakaUret(3,koy);
    expect(v.cekirdekler).toEqual([]);
    expect(vakaDenetle(v)).toEqual([]);
  });
});

describe('vaka üretimi: roller ve çizelge',()=>{
  const v=vakaUret(42,KOY);
  it('7 farklı katil, 7 farklı kurban, katil kurban olmaz',()=>{
    const katiller=v.cinayetler.map(c=>c.katil), kurbanlar=v.cinayetler.map(c=>c.kurban);
    expect(new Set(katiller).size).toBe(7);
    expect(new Set(kurbanlar).size).toBe(7);
    for(const k of kurbanlar) expect(katiller).not.toContain(k);
    expect(v.katiller.map(k=>k.kisi).sort()).toEqual([...katiller].sort());
  });
  it('her gün bir fotoğraf masaya gelir',()=>{
    expect(v.cinayetler.map(c=>c.fotografGunu).sort()).toEqual([1,2,3,4,5,6,7]);
  });
  it('herkes her dilimde tek bir yerde; ölü yürümez',()=>{
    for(const k of Object.keys(v.kisiler)){
      expect(v.cizelge[k]).toHaveLength(T);
      const olum=v.kisiler[k].olum;
      v.cizelge[k].forEach((m,t)=>{
        if(olum!=null&&t>olum) expect(m).toBeNull();
        else{expect(typeof m).toBe('string'); expect(v.harita[m]).toBeDefined();}
      });
    }
  });
  it('katil, kurban ve yardımcı cinayet anında olay yerinde',()=>{
    for(const c of v.cinayetler){
      expect(v.cizelge[c.katil][c.zaman]).toBe(c.mekan);
      expect(v.cizelge[c.kurban][c.zaman]).toBe(c.mekan);
      if(c.yardimci) expect(v.cizelge[c.yardimci][c.zaman]).toBe(c.mekan);
      expect(v.neden[c.katil][c.zaman]).toBe('cinayet:'+c.id);
    }
  });
  it('sebepler kişinin sırlarından ya da ilişkilerinden gelir',()=>{
    const sirVar=(sahip,id)=>koy.kisiler[sahip].sirlar.some(s=>s.id===id);
    const kaynakGecerli=k=>{
      if(k.tur==='sir') return sirVar(k.sahip,k.sir);
      if(k.tur==='santaj') return sirVar(k.sahip,k.sir)&&!!koy.kisiler[k.zorlayan];
      if(k.tur==='iliski'||k.tur==='rekabet'||k.tur==='koruma') return true;
      return false;
    };
    for(const c of v.cinayetler){
      expect(kaynakGecerli(c.sebep.kaynak)).toBe(true);
      if(c.sebep.kaynak.tur==='iliski') expect(koy.iliskileri(c.katil).some(i=>i.kime===c.kurban&&i.tur===c.sebep.kaynak.iliski)).toBe(true);
    }
  });
  it('komşuluk haritası iki yönlü ve bütün mekânları kapsar',()=>{
    const h=haritaKur(koy.mekanlar);
    expect(Object.keys(h).sort()).toEqual(Object.keys(koy.mekanlar).sort());
    for(const [a,l] of Object.entries(h)){
      expect(l.length).toBeGreaterThan(0);
      for(const b of l) expect(h[b]).toContain(a);
    }
  });
});

describe('vaka üretimi: izler',()=>{
  const v=vakaUret(42,KOY);
  const olay=Object.fromEntries(v.olaylar.map(o=>[o.id,o]));
  it('her iz gerçek bir olaya ve cinayete bağlı',()=>{
    for(const i of v.izler){
      expect(olay[i.olay],i.id).toBeDefined();
      expect(v.cinayetler.some(c=>c.id===i.cinayet)).toBe(true);
    }
  });
  it('olaydaki herkes o anda o mekânda',()=>{
    for(const o of v.olaylar) for(const k of o.kisiler) expect(v.cizelge[k][o.zaman],`${o.id} ${k}`).toBe(o.mekan);
  });
  it('tanık o dilimde olay yerinde ya da komşu mekânda',()=>{
    for(const i of v.izler.filter(i=>i.tur==='tanik')){
      const yer=v.cizelge[i.tanik][i.zaman];
      expect(yer===i.mekan||v.harita[i.mekan].includes(yer)).toBe(true);
    }
  });
  it('her yanıltıcı izin masum açıklaması ve çürütme yolu var, asıl faili göstermez',()=>{
    for(const i of v.izler.filter(i=>i.yaniltici)) expect(v.yanilticilar.some(y=>y.izler.includes(i.id))).toBe(true);
    for(const y of v.yanilticilar){
      const c=v.cinayetler.find(c=>c.id===y.cinayet);
      expect(olay[y.olay]).toBeDefined();
      expect(y.curutme.length).toBeGreaterThan(0);
      expect(y.isaret).not.toContain(c.katil);
    }
  });
  it('vaka denetimi temiz',()=>{expect(vakaDenetle(v)).toEqual([]);});
});

describe('vaka üretimi: 200 tohum',()=>{
  const vakalar=[];
  it('hiçbiri hata atmaz ve hepsi tutarlı',()=>{
    for(let s=1;s<=200;s++){
      const v=vakaUret(s,KOY);
      vakalar.push(v);
      const h=vakaDenetle(v);
      if(h.length) throw new Error(`tohum ${s}: ${h.slice(0,5).join('; ')}`);
    }
  },120000);
  it('aynı kişiler hep katil çıkmaz',()=>{
    const say={}, kumeler=new Set();
    for(const v of vakalar){
      for(const k of v.katiller) say[k.kisi]=(say[k.kisi]||0)+1;
      kumeler.add(v.katiller.map(k=>k.kisi).sort().join(','));
    }
    expect(Object.keys(say).length).toBeGreaterThanOrEqual(18);
    expect(Math.max(...Object.values(say))/vakalar.length).toBeLessThan(.6);
    expect(kumeler.size).toBeGreaterThanOrEqual(195);
  });
  it('katiller arasında bağ, yanıltıcı iz ve yalan bol',()=>{
    const ort=f=>vakalar.reduce((s,v)=>s+f(v),0)/vakalar.length;
    expect(ort(v=>v.baglar.length)).toBeGreaterThan(1.5);
    expect(ort(v=>v.yanilticilar.length)).toBeGreaterThan(2);
    expect(vakalar.some(v=>v.baglar.some(b=>b.tur==='santaj'))).toBe(true);
    expect(vakalar.some(v=>v.baglar.some(b=>b.tur==='ortaklik'))).toBe(true);
    expect(vakalar.some(v=>v.baglar.some(b=>b.tur==='ortme'))).toBe(true);
    expect(vakalar.some(v=>v.yanilticilar.some(y=>y.aciklama==='tanik-kacti'))).toBe(true);
    expect(vakalar.some(v=>v.yanilticilar.some(y=>y.aciklama==='calinti-silah'))).toBe(true);
  });
  it('farklı ayarla da kurulur (5 katil, 9 katil, 5 gün)',()=>{
    for(const a of [{katilSayisi:5},{katilSayisi:9},{gunSayisi:5}]) for(let s=1;s<=20;s++){
      const v=vakaUret(s,KOY,a);
      expect(v.cinayetler).toHaveLength(a.katilSayisi??7);
      expect(vakaDenetle(v)).toEqual([]);
    }
  },120000);
});

describe('olay çekirdekleri',()=>{
  it('şema geçerli ve her çiftin köyde gerçek bir sebebi var',()=>{
    const ciftler=sebepAdaylari({...dunyaKur(koy,ayarKur()),harita:haritaKur(koy.mekanlar)});
    expect(cekirdekListesi.length).toBeGreaterThanOrEqual(4);
    expect(cekirdekDogrula(cekirdekListesi,koy,ciftler)).toEqual([]);
  });
});
