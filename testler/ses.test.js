import {describe,it,expect,vi,afterEach} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {rng} from '../src/cekirdek/rastgele.js';
import {olayKanali} from '../src/cekirdek/olay.js';
import {EFEKTLER,ORTAMLAR,ORTAM_OLAYLARI,efektTarifi,ortamTarifi,sonrakiZaman,ilkZaman,grupKazanci,olayCalsinMi,siddetAl,yuruyenEgri} from '../src/ses/tarif.js';
import {gurultu,ekYeriniKapat,rmsHesapla,tersTon,sinirlayiciEgrisi,yankiDarbesi,alkisDokusu} from '../src/ses/uretec.js';
import {sesMotoru,duzeyKazanci} from '../src/ses/motor.js';
import * as ses from '../src/ses/index.js';

afterEach(()=>vi.restoreAllMocks());

// Tarifte geçen bütün sayıları gezer (Float32Array dahil).
function sayilar(o,out=[]){
  if(typeof o==='number') out.push(o);
  else if(ArrayBuffer.isView(o)) for(const v of o) out.push(v);
  else if(o&&typeof o==='object') for(const v of Object.values(o)) sayilar(v,out);
  return out;
}
const duz=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?[...v]:v));

describe('ses tarifleri',()=>{
  const hepsi=[...EFEKTLER,...ORTAM_OLAYLARI];

  it('her efekt ve ortam olayı için geçerli bir tarif üretir',()=>{
    for(const ad of hepsi){
      const t=efektTarifi(ad,{r:rng(11)});
      expect(t,ad).not.toBeNull();
      expect(t.ad).toBe(ad);
      expect(t.sure,ad).toBeGreaterThan(0);
      expect(t.sure,ad).toBeLessThan(6);
      for(const v of sayilar(t)) expect(Number.isFinite(v),ad).toBe(true);
    }
  });

  it('aynı tohum aynı tarifi, farklı tohum farklı tarifi verir',()=>{
    for(const ad of hepsi){
      expect(duz(efektTarifi(ad,{r:rng(42)})),ad).toEqual(duz(efektTarifi(ad,{r:rng(42)})));
      expect(duz(efektTarifi(ad,{r:rng(42)})),ad).not.toEqual(duz(efektTarifi(ad,{r:rng(43)})));
    }
  });

  it('Math.random kullanılmaz',()=>{
    const casus=vi.spyOn(Math,'random');
    for(const ad of hepsi) efektTarifi(ad,{r:rng(1)});
    for(const ad of ORTAMLAR) ortamTarifi(ad);
    gurultu('pembe',2000,rng(1)); tersTon(8000,rng(1),{sure:.2}); alkisDokusu(8000,4000,rng(1)); yankiDarbesi(8000,rng(1),{sure:.2});
    expect(casus).not.toHaveBeenCalled();
    const dizin=new URL('../src/ses/',import.meta.url);
    for(const f of readdirSync(dizin).filter(f=>f.endsWith('.js'))) expect(readFileSync(new URL(f,dizin),'utf8'),f).not.toMatch(/Math\.random/);
  });

  it('bilinmeyen ad ya da eksik rng için null döner',()=>{
    expect(efektTarifi('yok',{r:rng(1)})).toBeNull();
    expect(efektTarifi('daktilo',{})).toBeNull();
    expect(efektTarifi('daktilo')).toBeNull();
  });

  it('şiddet kazancı ölçekler ve sınırlanır',()=>{
    expect(siddetAl(undefined)).toBe(1);
    expect(siddetAl(9)).toBe(1.5);
    expect(siddetAl(-2)).toBe(0);
    const tam=efektTarifi('daktilo',{r:rng(3)}), yarim=efektTarifi('daktilo',{r:rng(3),siddet:.5}), sifir=efektTarifi('hukum',{r:rng(3),siddet:0});
    expect(yarim.kazanc).toBeCloseTo(tam.kazanc/2);
    expect(sifir.vurus.kazanc).toBe(0);
  });

  it('daktilo çok hafif, rastgele perdeli; iz alçak ve tek nota',()=>{
    const perdeler=new Set();
    for(let i=0;i<20;i++){const t=efektTarifi('daktilo',{r:rng(i)}); expect(t.kazanc).toBeLessThan(.08); perdeler.add(Math.round(t.tik.f));}
    expect(perdeler.size).toBeGreaterThan(15);
    const iz=efektTarifi('iz',{r:rng(5)});
    expect(iz.f).toBeLessThan(500);
    expect(iz.ikinci).toBeLessThan(.1);
  });

  it('adım sayısı tarife yansır, sınırlanır',()=>{
    expect(efektTarifi('adim',{r:rng(1),sayi:4}).adimlar).toHaveLength(4);
    expect(efektTarifi('adim',{r:rng(1)}).adimlar).toHaveLength(1);
    expect(efektTarifi('adim',{r:rng(1),sayi:99}).adimlar).toHaveLength(12);
    const a=efektTarifi('adim',{r:rng(1),sayi:3}).adimlar;
    expect(a[1].zaman-a[0].zaman).toBeGreaterThan(.8); // ağır, seyrek
  });

  it('yürüyen eğri uçlarda verilen değerdedir',()=>{
    const e=yuruyenEgri(rng(1),20,{bas:2,son:5});
    expect(e[0]).toBe(2); expect(e[19]).toBe(5); expect(e).toHaveLength(20);
  });
});

describe('ortam tarifleri',()=>{
  it('her ortamın katmanı vardır; tarif kopyadır',()=>{
    for(const ad of ORTAMLAR){
      const t=ortamTarifi(ad);
      expect(t.katmanlar.length,ad).toBeGreaterThan(0);
      expect(t.seviye).toBeGreaterThan(0);
      for(const o of t.olaylar) expect(ORTAM_OLAYLARI,ad).toContain(o.tur);
    }
    const a=ortamTarifi('sorgu-odasi'); a.katmanlar.length=0;
    expect(ortamTarifi('sorgu-odasi').katmanlar.length).toBeGreaterThan(0);
    expect(ortamTarifi('yok')).toBeNull();
  });

  it('pencere: coşku 0, öfke 1, oran parametresi ikisini karıştırır',()=>{
    expect(ortamTarifi('pencere-cosku').oran).toBe(0);
    expect(ortamTarifi('pencere-ofke').oran).toBe(1);
    expect(ortamTarifi('pencere-ofke',{oran:.3}).oran).toBe(.3);
    expect(ortamTarifi('pencere',{oran:7}).oran).toBe(1);
    expect(ortamTarifi('pencere-cosku').temel).toBe('pencere');
    for(const o of [0,.25,.5,.9,1]) expect(grupKazanci('cosku',o)**2+grupKazanci('ofke',o)**2).toBeCloseTo(1);
    expect(grupKazanci(undefined,.4)).toBe(1);
  });

  it('sorgu odasında ışık seçimi katmanı değiştirir',()=>{
    const ampul=ortamTarifi('sorgu-odasi'), lamba=ortamTarifi('sorgu-odasi',{isik:'lamba'});
    expect(ampul.katmanlar.some(k=>k.isik==='ampul')).toBe(true);
    expect(ampul.katmanlar.some(k=>k.isik==='lamba')).toBe(false);
    expect(lamba.katmanlar.some(k=>k.isik==='lamba')).toBe(true);
  });

  it('olay zamanları enAz ile 4*ort arasında, ortalama ort çevresinde',()=>{
    const r=rng(9), o={ort:10,enAz:4};
    let t=0, n=0, top=0;
    for(let i=0;i<4000;i++){const s=sonrakiZaman(r,t,o); expect(s-t).toBeGreaterThanOrEqual(4); expect(s-t).toBeLessThanOrEqual(4+40); top+=s-t; n++; t=s;}
    expect(top/n).toBeGreaterThan(8.5); expect(top/n).toBeLessThan(11.5);
    expect(sonrakiZaman(r,3,{duzenli:1})).toBe(4);
    const ilk=ilkZaman(rng(2),100,{ort:5,ilk:[3,7]});
    expect(ilk).toBeGreaterThanOrEqual(103); expect(ilk).toBeLessThanOrEqual(107);
  });

  it('grubu olan olay orana göre çalar; eşiğin altında hiç çalmaz',()=>{
    const r=rng(1);
    expect(olayCalsinMi(r,{tur:'tik'},0)).toBe(true);
    for(let i=0;i<50;i++){expect(olayCalsinMi(r,{grup:'ofke'},0)).toBe(false); expect(olayCalsinMi(r,{grup:'cosku'},1)).toBe(false);}
    expect(olayCalsinMi(r,{grup:'ofke',esik:.55},.5)).toBe(false);
    let n=0; for(let i=0;i<1000;i++) n+=olayCalsinMi(r,{grup:'ofke'},.3);
    expect(n).toBeGreaterThan(240); expect(n).toBeLessThan(360);
  });
});

describe('örnek üreteçleri',()=>{
  it('gürültü belirlenimci, ortalaması sıfır, RMS 0.25',()=>{
    for(const renk of ['beyaz','pembe','kahverengi']){
      const a=gurultu(renk,20000,rng(4)), b=gurultu(renk,20000,rng(4));
      expect(a).toEqual(b);
      expect(rmsHesapla(a)).toBeCloseTo(.25,3);
      expect(Math.abs(a.reduce((s,v)=>s+v,0)/a.length)).toBeLessThan(.05);
    }
  });

  it('döngü ek yerinde sıçrama yok (son örnekten ilk örneğe geçiş sıradan bir adım kadar)',()=>{
    for(const renk of ['pembe','kahverengi']){
      const a=gurultu(renk,48000,rng(8));
      let ort=0; for(let i=1;i<a.length;i++) ort+=Math.abs(a[i]-a[i-1]); ort/=a.length-1;
      expect(Math.abs(a[0]-a[a.length-1]),renk).toBeLessThan(ort*5);
    }
    // ekYeriniKapat: out[0] = a[n], son örnekler değişmez
    const a=Float32Array.from({length:14},(_,i)=>i), o=ekYeriniKapat(a,10,4);
    expect(o[0]).toBeCloseTo(10); expect(o[9]).toBe(9);
  });

  it('ters ton sessizden başlar, sessize iner, sonu başından gürdür',()=>{
    const sr=8000, a=tersTon(sr,rng(1),{sure:1});
    expect(a[0]).toBe(0); expect(Math.abs(a[a.length-1])).toBeLessThan(1e-3);
    const bas=rmsHesapla(a.subarray(0,sr*.2)), son=rmsHesapla(a.subarray(sr*.7,sr*.95));
    expect(son).toBeGreaterThan(bas*3);
  });

  it('sınırlayıcı eğrisi tekdüze artar, ortası doğrusal, tavanı -1 dBFS altında',()=>{
    const e=sinirlayiciEgrisi(4097);
    for(let i=1;i<e.length;i++) expect(e[i]).toBeGreaterThanOrEqual(e[i-1]);
    expect(Math.max(...e)).toBeLessThan(10**(-1/20));
    expect(e[2048]).toBeCloseTo(0);
    expect(e[2048+512]).toBeCloseTo(.5*.5*2,2); // x=.25 -> giriş .5 -> doğrusal bölgenin ucu
    expect(e[2048+256]).toBeCloseTo(.25,3);
  });

  it('yankı darbesi iki kanallı ve söner',()=>{
    const [s,g]=yankiDarbesi(8000,rng(2),{sure:1});
    expect(s.length).toBe(8000); expect(g.length).toBe(8000);
    expect(rmsHesapla(s.subarray(0,800))).toBeGreaterThan(rmsHesapla(s.subarray(7000))*50);
    expect(s).not.toEqual(g);
  });
});

// ---- motor: sahte Web Audio ----
function sahteParam(v=0){
  const p={value:v,olaylar:[]};
  for(const ad of ['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime','setValueCurveAtTime','cancelScheduledValues'])
    p[ad]=(...a)=>{p.olaylar.push([ad,...a]); if(ad==='setValueAtTime') p.value=a[0]; return p;};
  return p;
}
function sahteBaglam(){
  const dugum=(ek={})=>({connect(){},disconnect(){},...ek});
  const ctx={
    sampleRate:8000,currentTime:0,state:'running',destination:dugum(),
    resume:vi.fn(async()=>{ctx.state='running';}),suspend:vi.fn(async()=>{ctx.state='suspended';}),close:vi.fn(async()=>{ctx.state='closed';}),
    createGain:()=>dugum({gain:sahteParam(1)}),
    createBiquadFilter:()=>dugum({type:'',frequency:sahteParam(350),Q:sahteParam(1)}),
    createStereoPanner:()=>dugum({pan:sahteParam(0)}),
    createConvolver:()=>dugum({buffer:null}),
    createWaveShaper:()=>dugum({curve:null,oversample:'none'}),
    createAnalyser:()=>dugum({fftSize:2048}),
    createOscillator:()=>dugum({type:'sine',frequency:sahteParam(440),start(){},stop(){}}),
    createBufferSource:()=>dugum({buffer:null,loop:false,playbackRate:sahteParam(1),start(){},stop(){}}),
    createBuffer:(k,n,sr)=>{const d=Array.from({length:k},()=>new Float32Array(n)); return {duration:n/sr,length:n,getChannelData:i=>d[i]};}
  };
  return ctx;
}
function sahtePencere(){
  const d={};
  return {
    dinleyiciler:d,
    addEventListener:(ad,fn)=>{(d[ad]??=new Set()).add(fn);},
    removeEventListener:(ad,fn)=>{d[ad]?.delete(fn);},
    tetikle:ad=>{for(const fn of [...(d[ad]??[])]) fn({type:ad});},
    setInterval:vi.fn(()=>1),clearInterval:vi.fn()
  };
}

describe('ses motoru',()=>{
  it('AudioContext yokken içe aktarılır ve her işlev sessizce boşa düşer',async()=>{
    expect(globalThis.AudioContext).toBeUndefined();
    const m=sesMotoru();
    expect(m.destek).toBe(false);
    expect(m.ac()).toBe(false);
    expect(typeof m.baslat()).toBe('function');
    expect(m.ortam('sorgu-odasi')).toBe(false);
    expect(m.efekt('kapi-ac')).toBeNull();
    expect(m.oran(.5)).toBe(false);
    expect(m.duzey(2)).toBe(1);
    expect(m.sustur(true)).toBe(true);
    expect(m.kis(.4)).toBe(.4);
    expect(m.analizci()).toBeNull();
    await m.kapat();
    // ortak arayüz de
    expect(typeof ses.sesBaslat()).toBe('function');
    expect(ses.ortam('gece-koy',{gecis:1})).toBe(false);
    expect(ses.efekt('daktilo',{siddet:.5,tohum:3})).toBeNull();
    expect(ses.duzey(.5)).toBe(.5);
    expect(ses.sustur(false)).toBe(false);
    expect(ses.sesDurumu().destek).toBe(false);
  });

  it('bağlam üretici hata atarsa ya da null dönerse çökmez',()=>{
    const m=sesMotoru({baglamUret:()=>{throw new Error('yok');}});
    expect(m.ac()).toBe(false);
    expect(sesMotoru({baglamUret:()=>null}).ac()).toBe(false);
  });

  it('bağlam ilk kullanıcı hareketinde açılır; önce istenen ortam açılınca kurulur',()=>{
    const ctx=sahteBaglam(), uret=vi.fn(()=>ctx), p=sahtePencere();
    const m=sesMotoru({baglamUret:uret,pencere:p,belge:{hidden:false,addEventListener(){},removeEventListener(){}}});
    m.baslat();
    expect(uret).not.toHaveBeenCalled();
    expect(m.ortam('sorgu-odasi',{gecis:1})).toBe(false);
    expect(m.efekt('kapi-ac')).toBeNull();          // açılmadan efekt çalmaz
    expect(m.durum().ortam).toBe('sorgu-odasi');
    p.tetikle('pointerdown');
    expect(uret).toHaveBeenCalledOnce();
    expect(m.durum()).toMatchObject({acik:true,ortam:'sorgu-odasi'});
    expect(p.dinleyiciler.pointerdown.size).toBe(0);  // dinleyici kalktı
    p.tetikle('keydown');
    expect(uret).toHaveBeenCalledOnce();
    expect(m.efekt('kapi-ac',{tohum:1})).toBeGreaterThan(0);
    expect(m.efekt('yok')).toBeNull();
  });

  it('sayfa gizlenince askıya alır, geri gelince sürdürür',()=>{
    const ctx=sahteBaglam(), dinle={};
    const belge={hidden:false,addEventListener:(a,f)=>{dinle[a]=f;},removeEventListener(){}};
    const m=sesMotoru({baglamUret:()=>ctx,pencere:sahtePencere(),belge});
    m.baslat(); m.ac();
    belge.hidden=true; dinle.visibilitychange();
    expect(ctx.suspend).toHaveBeenCalledOnce();
    expect(m.durum().gizli).toBe(true);
    belge.hidden=false; dinle.visibilitychange();
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('düzey, sessiz kip ve kısma ana karışıma yansır; daktilo aşırı sık çalmaz',()=>{
    const ctx=sahteBaglam(), m=sesMotoru({baglamUret:()=>ctx,pencere:sahtePencere()});
    m.ac();
    expect(m.duzey(.5)).toBe(.5);
    expect(duzeyKazanci(.5)).toBe(.25);
    expect(duzeyKazanci(3)).toBe(1);
    expect(m.sustur(true)).toBe(true);
    expect(m.efekt('daktilo')).toBeNull();          // sessizken efekt kurulmaz
    m.sustur(false);
    expect(m.efekt('daktilo')).not.toBeNull();
    expect(m.efekt('daktilo')).toBeNull();          // aynı anda ikinci harf
    ctx.currentTime=.1;
    expect(m.efekt('daktilo')).not.toBeNull();
    expect(m.kis(2)).toBe(1);
  });

  it('ortamlar arasında geçer; pencere ailesinde yalnızca oran kayar',()=>{
    const ctx=sahteBaglam(), m=sesMotoru({baglamUret:()=>ctx,pencere:sahtePencere()});
    m.ac();
    for(const ad of ORTAMLAR) expect(m.ortam(ad,{gecis:1}),ad).toBe(true);
    expect(m.durum()).toMatchObject({ortam:'pencere-ofke',oran:1});
    expect(m.ortam('pencere-cosku')).toBe(true);
    expect(m.durum().ortam).toBe('pencere-cosku');  // aynı kurulum, yalnızca oran 0'a kayıyor
    expect(m.durum().oran).toBe(0);
    expect(m.oran(.4)).toBe(true);
    expect(m.durum().oran).toBe(.4);
    expect(m.ortam('bilinmeyen')).toBe(false);
    expect(m.ortam(null)).toBe(true);
    expect(m.durum().ortam).toBeNull();
  });

  it('dışarıdan verilen (çevrimdışı) bağlamla çalışır',()=>{
    const ctx=sahteBaglam(); ctx.length=8000*4; ctx.startRendering=()=>{};
    const m=sesMotoru({baglam:ctx});
    expect(m.ac()).toBe(true);
    expect(m.ortam('gece-koy')).toBe(true);
    expect(m.efekt('hukum',{zaman:1})).toBeCloseTo(1+efektTarifi('hukum',{r:rng(1)}).sure);
  });
});

describe('olaylara bağlanma',()=>{
  const sahteSes=()=>({ortam:vi.fn(),efekt:vi.fn(),duzey:vi.fn(),sustur:vi.fn(),kis:vi.fn(),oran:vi.fn(),ac:vi.fn()});

  it('ses.* olayları doğrudan denetler',()=>{
    const k=olayKanali(), s=sahteSes();
    ses.sesOlaylaraBagla(k,{ses:s});
    k.bildir('ses.ortam',{ad:'gece-koy',gecis:3});
    k.bildir('ses.ortam','kayip');
    k.bildir('ses.efekt',{ad:'iz',siddet:.5});
    k.bildir('ses.efekt','hukum');
    k.bildir('ses.duzey',.3);
    k.bildir('ses.sustur',true);
    k.bildir('ses.kis',{miktar:.5,sure:1});
    expect(s.ortam).toHaveBeenCalledWith('gece-koy',expect.objectContaining({gecis:3}));
    expect(s.ortam).toHaveBeenCalledWith('kayip');
    expect(s.efekt).toHaveBeenCalledWith('iz',expect.objectContaining({siddet:.5}));
    expect(s.efekt).toHaveBeenCalledWith('hukum');
    expect(s.duzey).toHaveBeenCalledWith(.3);
    expect(s.sustur).toHaveBeenCalledWith(true);
    expect(s.kis).toHaveBeenCalledWith(.5,expect.objectContaining({sure:1}));
  });

  it('oyun olaylarını efekt ve ortama çevirir',()=>{
    const k=olayKanali(), s=sahteSes();
    ses.sesOlaylaraBagla(k,{ses:s});
    for(const [olay,ad] of Object.entries(ses.OLAY_EFEKT)){
      s.efekt.mockClear(); k.bildir(olay);
      expect(s.efekt,olay).toHaveBeenCalledWith(ad,expect.any(Object));
    }
    k.bildir('adim',{sayi:3});
    expect(s.efekt).toHaveBeenLastCalledWith('adim',expect.objectContaining({sayi:3}));
    k.bildir('sahne.degisti',{sahne:'gun-sonu'});
    expect(s.ortam).toHaveBeenLastCalledWith('gece-koy',expect.any(Object));
    k.bildir('sahne.degisti','sorgu');
    expect(s.ortam).toHaveBeenLastCalledWith('sorgu-odasi',expect.any(Object));
    k.bildir('sahne.degisti',{sahne:'pencere',dogru:5});
    expect(s.ortam).toHaveBeenLastCalledWith('pencere',expect.objectContaining({oran:2/7}));
    k.bildir('sahne.degisti',{sahne:'bilinmeyen'});
    expect(s.ortam).toHaveBeenCalledTimes(3);
    k.bildir('pencere.oran',{dogru:7});
    expect(s.oran).toHaveBeenLastCalledWith(0,expect.any(Object));
  });

  it('harf olayında boşluk için daktilo çalmaz',()=>{
    const k=olayKanali(), s=sahteSes();
    ses.sesOlaylaraBagla(k,{ses:s});
    k.bildir('konusma.harf',{harf:'a'}); k.bildir('konusma.harf',' '); k.bildir('konusma.harf','ç'); k.bildir('konusma.harf',{harf:'\n'});
    expect(s.efekt).toHaveBeenCalledTimes(2);
    expect(s.efekt).toHaveBeenCalledWith('daktilo',expect.any(Object));
  });

  it('bırakıcı bütün abonelikleri kaldırır; kanal yoksa boş bırakıcı döner',()=>{
    const k=olayKanali(), s=sahteSes();
    const birak=ses.sesOlaylaraBagla(k,{ses:s});
    expect(k.aboneSayisi('ses.efekt')).toBe(1);
    birak();
    for(const ad of ['ses.ortam','ses.efekt','konusma.harf','sahne.degisti',...Object.keys(ses.OLAY_EFEKT)]) expect(k.aboneSayisi(ad),ad).toBe(0);
    k.bildir('kapi.acildi');
    expect(s.efekt).not.toHaveBeenCalled();
    expect(typeof ses.sesOlaylaraBagla(null)).toBe('function');
  });

  it('pencere oranı doğru sayısından hesaplanır',()=>{
    expect(ses.pencereOrani({dogru:7})).toBe(0);
    expect(ses.pencereOrani({dogru:0})).toBe(1);
    expect(ses.pencereOrani({dogru:2,toplam:4})).toBe(.5);
    expect(ses.pencereOrani({oran:.2})).toBe(.2);
    expect(ses.pencereOrani({})).toBeUndefined();
  });
});
