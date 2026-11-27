import {describe,it,expect} from 'vitest';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,defterGorunumu,durumKur,ekran,hukumAdaylari,sorular} from '../src/oyun/oyun.js';
import {otoOyna} from '../src/oyun/oto.js';
import {defterSorunu} from '../src/diyalog/defter.js';
import {kayitKur,kayitVerisi,bellekDepo} from '../src/platform/kayit.js';
import {koy,ARTIK} from './yardim-oyun.js';

const baglamlar=new Map();
const B=t=>{if(!baglamlar.has(t)) baglamlar.set(t,baglamKur({tohum:t,koy})); return baglamlar.get(t);};
const metinDenetle=(g,ek='')=>{for(const p of g) if(p.tur!=='ayrac'){ expect(p.metin,ek+' '+p.tur).toBeTruthy(); expect(p.metin,ek).not.toMatch(ARTIK); }};

describe('oyun akışı',()=>{
  it('açılış birinci günün fotoğrafını deftere koyar',()=>{
    const b=B(77);
    const {durum,goster}=acilis(b,oyunBaslat({tohum:77}));
    expect(durum.zaman.adim).toBe('gun-basi');
    expect(durum.defter.cinayetler.length).toBe(b.vaka.cinayetler.filter(c=>c.fotografGunu===1).length);
    metinDenetle(goster);
    expect(secenekler(b,durum).map(s=>s.eylem.tur)).toEqual(['ilerle']);
  });

  it('fotoğraf incelenir, her iz bir kez bulunur; çağırma hakkı ve sorgu işler',()=>{
    const b=B(77);
    let d=acilis(b,oyunBaslat({tohum:77})).durum;
    d=uygula(b,d,{tur:'ilerle'}).durum;
    const incele=secenekler(b,d).filter(s=>s.eylem.tur==='incele');
    expect(incele.length).toBeGreaterThan(0);
    const r=uygula(b,d,incele[0].eylem); d=r.durum; metinDenetle(r.goster);
    expect(d.defter.izler).toHaveLength(1);
    expect(secenekler(b,d).filter(s=>s.eylem.tur==='incele')).toHaveLength(incele.length-1);
    expect(uygula(b,d,incele[0].eylem).durum).toBe(d);
    d=uygula(b,d,{tur:'ilerle'}).durum;
    expect(d.zaman.adim).toBe('cagirma');
    const cagir=secenekler(b,d).filter(s=>s.eylem.tur==='cagir');
    const kurban=b.vaka.cinayetler[0].kurban;
    expect(cagir.some(s=>s.eylem.kisi===kurban)).toBe(false); // ölü çağrılmaz
    const c=uygula(b,d,cagir[0].eylem); d=c.durum; metinDenetle(c.goster);
    expect(d.zaman.adim).toBe('sorgu'); expect(d.zaman.sorguKalan).toBe(b.ayar.gunlukSorguHakki-1);
    const q=sorular(b,d)[0];
    const s=uygula(b,d,{tur:'sor',soru:q.id}); d=s.durum; metinDenetle(s.goster);
    expect(d.defter.ifadeler).toHaveLength(1);
    expect(d.defter.ifadeler[0].metin).toBe(s.goster.find(p=>p.tur==='soz').metin);
    expect(s.goster.find(p=>p.tur==='sahne').tepki).toMatchObject({duzey:expect.any(String)});
    expect(sorular(b,d).some(x=>x.id===q.id)).toBe(false);
    d=uygula(b,d,{tur:'ilerle'}).durum;
    expect(d.zaman.adim).toBe('cagirma');
    expect(secenekler(b,d).some(x=>x.eylem.kisi===cagir[0].eylem.kisi)).toBe(false); // aynı gün ikinci kez çağrılmaz
  });

  it('sabrı biten kişi kalkar, sorgu kendiliğinden biter',()=>{
    const b=B(12);
    let d=acilis(b,oyunBaslat({tohum:12})).durum;
    d=uygula(b,d,{tur:'ilerle'}).durum; d=uygula(b,d,{tur:'ilerle'}).durum;
    d=uygula(b,d,secenekler(b,d).find(s=>s.eylem.tur==='cagir').eylem).durum;
    let n=0;
    while(d.zaman.adim==='sorgu'&&sorular(b,d).length){ d=uygula(b,d,{tur:'sor',soru:sorular(b,d)[0].id}).durum; n++; }
    expect(n).toBeGreaterThanOrEqual(4); expect(n).toBeLessThanOrEqual(6);
    expect(d.zaman.adim).toBe('cagirma');
  });

  it('bir oyun baştan sona otomatik oynanır: Rewind, hüküm ve son',()=>{
    const b=B(77);
    const parcalar=[];
    const {durum,secilenler}=otoOyna(b,{geriSarma:1,yaz:g=>parcalar.push(...g)});
    expect(durum.zaman.adim).toBe('bitti');
    expect(durum.zaman.dongu).toBe(2);
    expect(secilenler).toHaveLength(7);
    metinDenetle(parcalar);
    const yazi=parcalar.map(p=>p.metin).join('\n');
    expect(yazi).toMatch(/Saatin akrebi geri döndü/);
    expect(yazi).toMatch(/Pencereye yürüdün/);
    for(const k of b.vaka.katiller) expect(yazi).toContain(b.dil.kisiler[k.kisi].lakap);
    expect(yazi).not.toMatch(/\d+ ?\/ ?7|doğru buldun|yedi(si|sinden)/i); // kaç doğru olduğu söylenmez
    // defter iki döngüden kayıt taşır
    expect(new Set(durum.defter.ifadeler.map(f=>f.dongu))).toEqual(new Set([1,2]));
    expect(defterSorunu(durum.defter)).toBeNull();
    const g=defterGorunumu(b,durum);
    for(const l of Object.values(g)) for(const x of l) expect(x.metin).not.toMatch(/undefined|\{|\}/);
  },30000);

  it('Rewind defteri korur, zamanı birinci güne döndürür',()=>{
    const b=B(5);
    let rewindOnce=null, rewindSonra=null;
    let d=acilis(b,oyunBaslat({tohum:5})).durum;
    while(d.zaman.adim!=='karar'){
      const s=secenekler(b,d);
      const e=(s.find(x=>x.eylem.tur==='incele')??s.find(x=>x.eylem.tur==='cagir')??s.find(x=>x.eylem.tur==='ilerle')).eylem;
      if(d.zaman.adim==='sorgu'&&sorular(b,d).length) d=uygula(b,d,{tur:'sor',soru:sorular(b,d)[0].id}).durum;
      else d=uygula(b,d,e).durum;
    }
    rewindOnce=d.defter;
    d=uygula(b,d,{tur:'geriSar'}).durum;
    rewindSonra=d.defter;
    expect(d.zaman).toMatchObject({gun:1,dongu:2,adim:'gun-basi'});
    expect(rewindSonra.ifadeler).toEqual(rewindOnce.ifadeler);
    expect(rewindSonra.izler).toEqual(rewindOnce.izler);
    expect(rewindSonra.cinayetler).toEqual(rewindOnce.cinayetler);
    // birinci günde gelecekteki cinayetlerin izleri gösterilemez, ama sonradan öldürülecek kişi çağrılabilir
    d=uygula(b,d,{tur:'ilerle'}).durum; d=uygula(b,d,{tur:'ilerle'}).durum;
    const sonKurban=b.vaka.cinayetler.at(-1).kurban;
    expect(secenekler(b,d).some(s=>s.eylem.kisi===sonKurban)).toBe(true);
    d=uygula(b,d,{tur:'cagir',kisi:sonKurban}).durum;
    const S=sorular(b,d);
    expect(S.every(q=>q.zaman==null||q.zaman<5)).toBe(true);
    expect(S.filter(q=>q.tur==='iz').every(q=>b.kamuIzler[q.iz].cinayet===b.vaka.cinayetler.find(c=>c.fotografGunu===1).id)).toBe(true);
  },30000);

  it('belirlenimci: aynı tohum aynı oyun',()=>{
    const a=otoOyna(B(31),{geriSarma:0}), b=otoOyna(baglamKur({tohum:31,koy}),{geriSarma:0});
    expect(JSON.stringify(a.durum)).toBe(JSON.stringify(b.durum));
  },30000);

  it('50 tohumda oyun patlamadan biter, hiçbir cümlede artık kalmaz',()=>{
    for(let t=100;t<150;t++){
      const b=baglamKur({tohum:t,koy}), parcalar=[];
      const {durum}=otoOyna(b,{geriSarma:0,yaz:g=>parcalar.push(...g)});
      expect(durum.zaman.adim).toBe('bitti');
      metinDenetle(parcalar,'tohum '+t);
    }
  },120000);

  it('kayıt: durum kayda girer, yüklenince aynı ekran kurulur',async()=>{
    const b=B(77);
    let d=acilis(b,oyunBaslat({tohum:77})).durum;
    for(let i=0;i<4;i++) d=uygula(b,d,secenekler(b,d).find(s=>s.eylem.tur!=='ilerle')?.eylem??{tur:'ilerle'}).durum;
    d=uygula(b,d,{tur:'isaretle',kisi:'halil',isaret:'supheli'}).durum;
    const k=kayitKur({depo:bellekDepo(),saat:()=>0});
    expect((await k.kaydet(kayitVerisi({zaman:d.zaman,defter:d.defter}))).tamam).toBe(true);
    const y=await k.yukle();
    const d2=durumKur(y.veri);
    expect(d2).toEqual(d);
    expect(ekran(b,d2)).toEqual(ekran(b,d));
    expect(secenekler(b,d2)).toEqual(secenekler(b,d));
  });

  it('hüküm yalnızca yaşayanlardan ve tam yedi kişiyle',()=>{
    const b=B(77);
    const {durum}=otoOyna(b,{geriSarma:0});
    expect(durum.zaman.hukum).toHaveLength(7);
    const kurban=b.vaka.cinayetler[0].kurban;
    expect(hukumAdaylari(b,durum)).not.toContain(kurban);
  },30000);
});
