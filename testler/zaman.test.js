import {describe,it,expect} from 'vitest';
import {zamanBaslat,ilerle,cagir,geriSar,hukumVer,kalanSorgu,kararBekliyor,bittiMi,sonGunMu,zamanSorunu,ZamanHatasi,ADIMLAR,KARAR,BITTI} from '../src/cekirdek/zaman.js';
import {AYARLAR} from '../src/cekirdek/ayarlar.js';

const hataKodu=f=>{try{f();}catch(e){expect(e).toBeInstanceOf(ZamanHatasi); return e.kod;} throw new Error('hata atılmadı');};

// Bir günü sorgu yapmadan sonuna kadar götürür.
function gunuGec(d){
  while(d.adim!=='gun-sonu') d=ilerle(d);
  return ilerle(d);
}
function karara(d){
  while(d.adim!==KARAR) d=d.adim==='gun-sonu'?ilerle(d):gunuGec(d);
  return d;
}
const yedi=['a','b','c','d','e','f','g'];

describe('zaman: başlangıç',()=>{
  it('birinci gün, gün başı, tam sorgu hakkıyla başlar',()=>{
    const d=zamanBaslat({tohum:42});
    expect(d).toMatchObject({tohum:42,dongu:1,gun:1,adim:'gun-basi',sorguKalan:AYARLAR.gunlukSorguHakki,cagrilanlar:[],sorgudaki:null,hukum:null});
    expect(d.kural).toEqual({gunSayisi:7,gunlukSorguHakki:AYARLAR.gunlukSorguHakki,finalSecimSayisi:7});
    expect(zamanSorunu(d)).toBeNull();
  });
  it('durum düz veridir: JSON gidiş-dönüşünde aynı kalır',()=>{
    let d=zamanBaslat({tohum:7});
    d=cagir(ilerle(ilerle(d)),'muhtar');
    expect(JSON.parse(JSON.stringify(d))).toEqual(d);
  });
  it('tohum sayı değilse hata',()=>{
    expect(hataKodu(()=>zamanBaslat({}))).toBe('gecersiz-tohum');
    expect(hataKodu(()=>zamanBaslat({tohum:'x'}))).toBe('gecersiz-tohum');
  });
  it('başka ayarla kurulabilir',()=>{
    const d=zamanBaslat({tohum:1,ayar:{...AYARLAR,gunSayisi:2,gunlukSorguHakki:1}});
    expect(d.sorguKalan).toBe(1);
    expect(karara(d).gun).toBe(2);
  });
});

describe('zaman: günün adımları',()=>{
  it('adımlar sırayla ilerler',()=>{
    let d=zamanBaslat({tohum:1});
    const gorulen=[d.adim];
    for(let i=0;i<3;i++){d=ilerle(d); gorulen.push(d.adim);}
    expect(gorulen).toEqual(['gun-basi','fotograf','cagirma','gun-sonu']);
    expect(ADIMLAR).toEqual(['gun-basi','fotograf','cagirma','sorgu','gun-sonu']);
  });
  it('gün sonundan sonra ertesi gün başlar, hak yenilenir',()=>{
    let d=zamanBaslat({tohum:1});
    d=cagir(ilerle(ilerle(d)),'x');
    d=gunuGec(ilerle(d));
    expect(d).toMatchObject({gun:2,adim:'gun-basi',sorguKalan:AYARLAR.gunlukSorguHakki,cagrilanlar:[],sorgudaki:null});
  });
  it('işlevler durumu değiştirmez',()=>{
    const d=zamanBaslat({tohum:1}), kopya=structuredClone(d);
    ilerle(d);
    const c=ilerle(ilerle(d));
    const ck=structuredClone(c);
    cagir(c,'x');
    expect(d).toEqual(kopya); expect(c).toEqual(ck);
  });
  it('sonGunMu',()=>{
    let d=zamanBaslat({tohum:1});
    expect(sonGunMu(d)).toBe(false);
    for(let i=0;i<6;i++) d=gunuGec(d);
    expect(d.gun).toBe(7); expect(sonGunMu(d)).toBe(true);
  });
});

describe('zaman: sorgu hakkı',()=>{
  const cagirmada=()=>ilerle(ilerle(zamanBaslat({tohum:1})));
  it('çağırma bir hak harcar, sorgu adımına geçer; ilerle çağırmaya döner',()=>{
    let d=cagir(cagirmada(),'muhtar');
    expect(d).toMatchObject({adim:'sorgu',sorgudaki:'muhtar',cagrilanlar:['muhtar']});
    expect(kalanSorgu(d)).toBe(AYARLAR.gunlukSorguHakki-1);
    d=ilerle(d);
    expect(d).toMatchObject({adim:'cagirma',sorgudaki:null});
  });
  it('hak bitince çağırma hata verir',()=>{
    let d=cagirmada();
    for(let i=0;i<AYARLAR.gunlukSorguHakki;i++) d=ilerle(cagir(d,'k'+i));
    expect(kalanSorgu(d)).toBe(0);
    expect(hataKodu(()=>cagir(d,'fazla'))).toBe('hak-yok');
    expect(ilerle(d).adim).toBe('gun-sonu');
  });
  it('gün sonuna geçince kalan hak yanar',()=>{
    const d=ilerle(cagirmada());
    expect(d.adim).toBe('gun-sonu'); expect(kalanSorgu(d)).toBe(0);
  });
  it('çağırma yalnızca çağırma adımında ve kişiyle olur',()=>{
    expect(hataKodu(()=>cagir(zamanBaslat({tohum:1}),'x'))).toBe('gecersiz-gecis');
    expect(hataKodu(()=>cagir(cagir(cagirmada(),'x'),'y'))).toBe('gecersiz-gecis');
    expect(hataKodu(()=>cagir(cagirmada()))).toBe('kisi-yok');
  });
});

describe('zaman: yedinci gün ve karar',()=>{
  it('son günün sonunda karar adımına geçilir',()=>{
    const d=karara(zamanBaslat({tohum:5}));
    expect(d).toMatchObject({gun:7,adim:KARAR}); expect(kararBekliyor(d)).toBe(true);
    expect(kalanSorgu(d)).toBe(0);
  });
  it('kararda ilerlenmez',()=>{
    expect(hataKodu(()=>ilerle(karara(zamanBaslat({tohum:5}))))).toBe('karar-bekliyor');
  });
  it('geri sarma birinci güne döner, döngü artar, tohum aynı kalır',()=>{
    const d=geriSar(karara(zamanBaslat({tohum:99})));
    expect(d).toMatchObject({tohum:99,dongu:2,gun:1,adim:'gun-basi',sorguKalan:AYARLAR.gunlukSorguHakki,cagrilanlar:[]});
    expect(geriSar(karara(d)).dongu).toBe(3);
  });
  it('geri sarma ve hüküm yalnızca kararda',()=>{
    const d=zamanBaslat({tohum:1});
    expect(hataKodu(()=>geriSar(d))).toBe('gecersiz-gecis');
    expect(hataKodu(()=>hukumVer(d,yedi))).toBe('gecersiz-gecis');
  });
  it('hüküm tam sayıda ve farklı kişilerle verilir, oyun biter',()=>{
    const k=karara(zamanBaslat({tohum:1}));
    expect(hataKodu(()=>hukumVer(k,['a']))).toBe('secim-sayisi');
    expect(hataKodu(()=>hukumVer(k,['a','a','b','c','d','e','f']))).toBe('secim-tekrar');
    const b=hukumVer(k,yedi);
    expect(b).toMatchObject({adim:BITTI,hukum:yedi}); expect(bittiMi(b)).toBe(true);
    expect(hataKodu(()=>ilerle(b))).toBe('oyun-bitti');
    expect(hataKodu(()=>geriSar(b))).toBe('gecersiz-gecis');
  });
});

describe('zaman: geçersiz durum',()=>{
  const d=zamanBaslat({tohum:1});
  it.each([
    ['nesne değil',null],
    ['gün aralık dışı',{...d,gun:8}],
    ['gün sıfır',{...d,gun:0}],
    ['bilinmeyen adım',{...d,adim:'uyku'}],
    ['ilk günde karar',{...d,adim:KARAR}],
    ['fazla hak',{...d,sorguKalan:99}],
    ['döngü sıfır',{...d,dongu:0}],
    ['kural yok',{...d,kural:undefined}],
    ['sorguda kişi yok',{...d,adim:'sorgu'}],
  ])('%s reddedilir',(ad,bozuk)=>{
    expect(zamanSorunu(bozuk)).toBeTypeOf('string');
    expect(hataKodu(()=>ilerle(bozuk))).toBe('gecersiz-durum');
  });
});
