// Vitest ortamı node: pencere, belge ve olaylar burada elle taklit edilir.
import {describe,it,expect,vi} from 'vitest';
import {isaretciDinle,egimDinle,egimIzniIste,egimDestekleniyor} from '../src/platform/girdi.js';
import {tamEkranAc,tamEkranKapat,tamEkranMi,tamEkranDegistir,yon,yonDinle,gorunurlukDinle,sayfaGizliMi} from '../src/platform/ekran.js';

function sahtePencere(ek={}){
  return Object.assign(new EventTarget(),{DeviceOrientationEvent:class{},screen:{orientation:{angle:0}}},ek);
}
const egim=(p,o)=>p.dispatchEvent(Object.assign(new Event('deviceorientation'),o));

describe('isaretciDinle',()=>{
  it('pointermove ve pointerdown iletir, kaldırıcı ikisini de kaldırır',()=>{
    const p=new EventTarget(), fn=vi.fn();
    const kaldir=isaretciDinle(fn,p);
    p.dispatchEvent(new Event('pointermove')); p.dispatchEvent(new Event('pointerdown'));
    expect(fn).toHaveBeenCalledTimes(2);
    kaldir();
    p.dispatchEvent(new Event('pointermove'));
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('egimDinle',()=>{
  it('ilk duruş merkezdir, sağa eğince artı, sola eksi',()=>{
    const p=sahtePencere(), fn=vi.fn();
    egimDinle(fn,{pencere:p,azamiAci:20,oluBolge:0});
    egim(p,{beta:40,gamma:5});
    egim(p,{beta:40,gamma:15});
    egim(p,{beta:40,gamma:-5});
    expect(fn.mock.calls.map(c=>c[0].x)).toEqual([0,.5,-.5]);
  });
  it('-1..1 aralığına kırpılır',()=>{
    const p=sahtePencere(), x=[];
    egimDinle(o=>x.push(o.x),{pencere:p,azamiAci:10,oluBolge:0});
    egim(p,{beta:0,gamma:0}); egim(p,{beta:0,gamma:80}); egim(p,{beta:0,gamma:-80});
    expect(x).toEqual([0,1,-1]);
  });
  it('ölü bölgedeki küçük titreme 0 sayılır',()=>{
    const p=sahtePencere(), x=[];
    egimDinle(o=>x.push(o.x),{pencere:p,azamiAci:20,oluBolge:.1});
    egim(p,{beta:0,gamma:0}); egim(p,{beta:0,gamma:1});
    expect(x).toEqual([0,0]);
  });
  it('yatay ekranda beta kullanılır, açıya göre yön döner',()=>{
    const p=sahtePencere({screen:{orientation:{angle:90}}}), x=[];
    egimDinle(o=>x.push(o.x),{pencere:p,azamiAci:10,oluBolge:0});
    egim(p,{beta:0,gamma:30}); egim(p,{beta:5,gamma:30});
    p.screen.orientation.angle=270;
    egim(p,{beta:0,gamma:0}); egim(p,{beta:5,gamma:0}); // açı değişti: yeni merkez
    expect(x).toEqual([0,.5,0,-.5]);
  });
  it('eski window.orientation da okunur',()=>{
    const p=sahtePencere({screen:{},orientation:-90}), x=[];
    egimDinle(o=>x.push(o.x),{pencere:p,azamiAci:10,oluBolge:0});
    egim(p,{beta:0,gamma:0}); egim(p,{beta:5,gamma:0});
    expect(x).toEqual([0,-.5]);
  });
  it('boş (null) olaylar yok sayılır',()=>{
    const p=sahtePencere(), fn=vi.fn();
    egimDinle(fn,{pencere:p});
    egim(p,{beta:null,gamma:null});
    expect(fn).not.toHaveBeenCalled();
  });
  it('merkezle ve orientationchange merkezi yeniden alır',()=>{
    const p=sahtePencere(), x=[];
    const k=egimDinle(o=>x.push(o.x),{pencere:p,azamiAci:10,oluBolge:0});
    egim(p,{beta:0,gamma:0}); egim(p,{beta:0,gamma:5});
    k.merkezle(); egim(p,{beta:0,gamma:5});
    p.dispatchEvent(new Event('orientationchange')); egim(p,{beta:0,gamma:-3});
    expect(x).toEqual([0,.5,0,0]);
  });
  it('kaldırıcı dinlemeyi bitirir',()=>{
    const p=sahtePencere(), fn=vi.fn();
    const k=egimDinle(fn,{pencere:p});
    k();
    egim(p,{beta:0,gamma:10});
    expect(fn).not.toHaveBeenCalled();
  });
  it('destek yoksa sessizce hiçbir şey yapmaz',()=>{
    const p=new EventTarget(), ekle=vi.spyOn(p,'addEventListener');
    const k=egimDinle(vi.fn(),{pencere:p});
    expect(ekle).not.toHaveBeenCalled();
    expect(()=>{k(); k.merkezle();}).not.toThrow();
    expect(egimDestekleniyor(p)).toBe(false);
    expect(()=>egimDinle(vi.fn(),{pencere:undefined})).not.toThrow();
  });
});

describe('egimIzniIste',()=>{
  it('iOS: izin verilirse izin, verilmezse red',async()=>{
    const izinli=sahtePencere({DeviceOrientationEvent:{requestPermission:async()=>'granted'}});
    const redli=sahtePencere({DeviceOrientationEvent:{requestPermission:async()=>'denied'}});
    expect(await egimIzniIste(izinli)).toBe('izin');
    expect(await egimIzniIste(redli)).toBe('red');
  });
  it('istek hata atarsa (kullanıcı hareketi dışında) red, çökmez',async()=>{
    const p=sahtePencere({DeviceOrientationEvent:{requestPermission:()=>Promise.reject(new Error('NotAllowedError'))}});
    expect(await egimIzniIste(p)).toBe('red');
  });
  it('izin istemeyen tarayıcı ve desteksiz ortam',async()=>{
    expect(await egimIzniIste(sahtePencere())).toBe('gerekmiyor');
    expect(await egimIzniIste(new EventTarget())).toBe('desteklenmiyor');
  });
});

describe('ekran: tam ekran',()=>{
  function sahteBelge({destek=true,hata=false}={}){
    const b={fullscreenElement:null,documentElement:{}};
    if(destek){
      b.documentElement.requestFullscreen=async function(){if(hata) throw new Error('izin yok'); b.fullscreenElement=this;};
      b.exitFullscreen=async()=>{b.fullscreenElement=null;};
    }
    return b;
  }
  it('açar, kapatır, değiştirir',async()=>{
    const b=sahteBelge();
    expect(await tamEkranAc(b)).toBe(true); expect(tamEkranMi(b)).toBe(true);
    expect(await tamEkranKapat(b)).toBe(true); expect(tamEkranMi(b)).toBe(false);
    await tamEkranDegistir(b); expect(tamEkranMi(b)).toBe(true);
    await tamEkranDegistir(b); expect(tamEkranMi(b)).toBe(false);
  });
  it('destek yoksa ya da reddedilirse sessizce false',async()=>{
    expect(await tamEkranAc(sahteBelge({destek:false}))).toBe(false);
    expect(await tamEkranAc(sahteBelge({hata:true}))).toBe(false);
    expect(await tamEkranAc(undefined)).toBe(false); // node: document yok
  });
  it('webkit önekli API',async()=>{
    const b={webkitFullscreenElement:null,documentElement:{webkitRequestFullscreen(){b.webkitFullscreenElement=this;}}};
    expect(await tamEkranAc(b)).toBe(true); expect(tamEkranMi(b)).toBe(true);
  });
});

describe('ekran: yön',()=>{
  it('matchMedia varsa ondan, yoksa boyuttan okunur',()=>{
    expect(yon({matchMedia:()=>({matches:true})})).toBe('dikey');
    expect(yon({matchMedia:()=>({matches:false})})).toBe('yatay');
    expect(yon({innerWidth:800,innerHeight:400})).toBe('yatay');
    expect(yon({innerWidth:400,innerHeight:800})).toBe('dikey');
    expect(yon(undefined)).toBe('dikey');
  });
  it('yön değişince bir kez haber verir, kaldırıcı durdurur',()=>{
    const p=Object.assign(new EventTarget(),{innerWidth:400,innerHeight:800});
    const fn=vi.fn(), k=yonDinle(fn,p);
    p.dispatchEvent(new Event('resize')); // değişmedi
    Object.assign(p,{innerWidth:800,innerHeight:400});
    p.dispatchEvent(new Event('resize')); p.dispatchEvent(new Event('orientationchange'));
    expect(fn.mock.calls).toEqual([['yatay']]);
    k();
    Object.assign(p,{innerWidth:400,innerHeight:800}); p.dispatchEvent(new Event('resize'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('ekran: görünürlük',()=>{
  it('gizlenince true, dönünce false; pagehide/pageshow da sayılır',()=>{
    const p=new EventTarget(), b=Object.assign(new EventTarget(),{hidden:false,defaultView:p});
    const fn=vi.fn(), k=gorunurlukDinle(fn,b);
    b.hidden=true; b.dispatchEvent(new Event('visibilitychange'));
    p.dispatchEvent(new Event('pagehide')); // zaten gizli: tekrar bildirilmez
    b.hidden=false; b.dispatchEvent(new Event('visibilitychange'));
    p.dispatchEvent(new Event('pagehide'));
    p.dispatchEvent(new Event('pageshow'));
    expect(fn.mock.calls.map(c=>c[0])).toEqual([true,false,true,false]);
    expect(sayfaGizliMi(b)).toBe(false);
    k(); b.hidden=true; b.dispatchEvent(new Event('visibilitychange'));
    expect(fn).toHaveBeenCalledTimes(4);
  });
  it('belge yoksa sessiz',()=>{
    expect(()=>gorunurlukDinle(vi.fn(),undefined)()).not.toThrow();
  });
});
