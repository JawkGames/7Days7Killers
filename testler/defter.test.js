import {describe,it,expect} from 'vitest';
import {defterYeni,defterSorunu,cinayetEkle,izEkle,izBulunduMu,ifadeEkle,ifadeBul,soruldu,bugunSorulan,isaretle,
  celiskiBul,karsilastir,anilanlar,ogrenilenSirlar,konumOnermeleri} from '../src/diyalog/defter.js';
import {kayitVerisi,kayitKur,bellekDepo} from '../src/platform/kayit.js';
import {zamanBaslat} from '../src/cekirdek/zaman.js';

const an={gun:2,dongu:1};
const ekle=(d,kisi,iddialar,soru={id:'s',tur:'yer'})=>ifadeEkle(d,{kisi,soru,iddialar,metin:'…'},an);

describe('defter',()=>{
  it('boş defter geçerli ve JSON\'a gidip gelir',()=>{
    const d=defterYeni();
    expect(defterSorunu(d)).toBeNull();
    expect(JSON.parse(JSON.stringify(d))).toEqual(d);
    expect(defterSorunu({...d,surum:99})).toMatch(/sürüm/);
  });
  it('işlevler defteri değiştirmez',()=>{
    const d=Object.freeze(defterYeni());
    const d2=izEkle(d,{iz:'i1',cinayet:'c1'},an);
    expect(d.izler).toEqual([]);
    expect(izBulunduMu(d2,'i1')).toBe(true);
    expect(izEkle(d2,{iz:'i1',cinayet:'c1'},an)).toBe(d2); // bir iz bir kez
    const d3=cinayetEkle(d2,{id:'c1',kurban:'nihat',mekan:'okul',zaman:0,bulan:'elif',fotografGunu:1},an);
    expect(cinayetEkle(d3,{id:'c1'},an)).toBe(d3);
  });
  it('ifade kimlik alır, sorulduğu ve bugünkü sayısı defterden okunur',()=>{
    let {defter:d,ifade:f}=ekle(defterYeni(),'cemil',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}],{id:'yer:5',tur:'yer'});
    expect(f.id).toBe('f1');
    expect(ifadeBul(d,'f1').kisi).toBe('cemil');
    expect(soruldu(d,'cemil','yer:5')).toBe(true);
    expect(soruldu(d,'cemil','yer:0')).toBe(false);
    expect(bugunSorulan(d,'cemil',an)).toBe(1);
    expect(bugunSorulan(d,'cemil',{gun:3,dongu:1})).toBe(0);
    ({defter:d}=ekle(d,'elif',[]));
    expect(ifadeBul(d,'f2')).toBeTruthy();
  });
  it('işaret oyuncunun yazdığı gibi kalır, silinebilir',()=>{
    let d=isaretle(defterYeni(),'halil','supheli');
    expect(d.isaretler).toEqual({halil:'supheli'});
    d=isaretle(d,'halil','temiz'); expect(d.isaretler.halil).toBe('temiz');
    d=isaretle(d,'halil',null); expect(d.isaretler).toEqual({});
    expect(()=>isaretle(d,'halil','katil')).toThrow();
  });
});

describe('çelişki',()=>{
  const f=(id,kisi,iddialar)=>({id,kisi,iddialar});
  it('aynı kişi aynı anda iki yerde olamaz',()=>{
    const a=f('f1','cemil',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}]);
    const b=f('f2','dursun',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'okul'}]);
    expect(celiskiBul(a,b)).toMatchObject({tur:'konum',kisi:'cemil',zaman:5});
    expect(celiskiBul(a,f('f3','x',[{tur:'konum',kisi:'cemil',zaman:6,mekan:'okul'}]))).toBeNull();
    expect(celiskiBul(a,f('f4','x',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}]))).toBeNull();
  });
  it('"evdeydi" ile "yatağı boştu" çelişir',()=>{
    const a=f('f1','halil',[{tur:'konum',kisi:'halil',zaman:10,mekan:'halil-evi'}]);
    const b=f('f2','fadime',[{tur:'degil',kisi:'halil',zaman:10,mekan:'halil-evi'}]);
    expect(celiskiBul(a,b)?.tur).toBe('konum');
    expect(celiskiBul(a,f('f3','x',[{tur:'degil',kisi:'halil',zaman:10,mekan:'okul'}]))).toBeNull();
  });
  it('eşya, sır ve fail çelişkileri',()=>{
    expect(celiskiBul(f('f1','a',[{tur:'sahip',iz:'i2',kisi:'riza'}]),f('f2','riza',[{tur:'sahip-degil',iz:'i2',kisi:'riza'}]))?.tur).toBe('sahip');
    expect(celiskiBul(f('f1','a',[{tur:'adaylar',iz:'i2',kisiler:['riza']}]),f('f2','riza',[{tur:'sahip-degil',iz:'i2',kisi:'riza'}]))?.tur).toBe('sahip');
    expect(celiskiBul(f('f1','a',[{tur:'adaylar',iz:'i2',kisiler:['riza','yusuf']}]),f('f2','riza',[{tur:'sahip-degil',iz:'i2',kisi:'riza'}]))).toBeNull();
    expect(celiskiBul(f('f1','a',[{tur:'sir',sahip:'cemil',sir:'x'}]),f('f2','cemil',[{tur:'sir-yok',sahip:'cemil'}]))?.tur).toBe('sir');
    expect(celiskiBul(f('f1','a',[{tur:'fail',cinayet:'c1',kisi:'x'}]),f('f2','b',[{tur:'fail',cinayet:'c1',kisi:'y'}]))?.tur).toBe('fail');
  });
  it('karşılaştır: çelişiyorsa yazar, bir kez yazar, çelişmiyorsa dokunmaz',()=>{
    let d=defterYeni();
    ({defter:d}=ekle(d,'cemil',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}]));
    ({defter:d}=ekle(d,'dursun',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'okul'}]));
    ({defter:d}=ekle(d,'elif',[{tur:'konum',kisi:'elif',zaman:5,mekan:'muhtar-evi'}]));
    const t=karsilastir(d,'f1','f3',an);
    expect(t.celiski).toBeNull(); expect(t.defter).toBe(d);
    const k=karsilastir(d,'f1','f2',an);
    expect(k.yeni).toBe(true); expect(k.defter.celiskiler).toHaveLength(1);
    const k2=karsilastir(k.defter,'f2','f1',an);
    expect(k2.yeni).toBe(false); expect(k2.defter.celiskiler).toHaveLength(1);
  });
  it('konum önermeleri ve anılanlar',()=>{
    expect(konumOnermeleri({iddialar:[{tur:'konum',kisi:'a',zaman:1,mekan:'m'},{tur:'siluet',zaman:1}]})).toEqual([{kisi:'a',zaman:1,mekan:'m',olumlu:true}]);
    let d=cinayetEkle(defterYeni(),{id:'c1',kurban:'nihat',mekan:'okul',zaman:0,bulan:'elif',fotografGunu:1},an);
    ({defter:d}=ekle(d,'cemil',[{tur:'sir',sahip:'gulsum',sir:'s1'},{tur:'adaylar',iz:'i1',kisiler:['hasan','riza']}]));
    expect([...anilanlar(d)].sort()).toEqual(['cemil','elif','gulsum','hasan','nihat','riza']);
    expect(ogrenilenSirlar(d)).toEqual([{sahip:'gulsum',sir:'s1',ifade:'f1'}]);
  });
});

describe('kayıt',()=>{
  it('defter kayıt şemasına uyar, kaydedilip aynı yüklenir',async()=>{
    let d=defterYeni();
    ({defter:d}=ekle(d,'cemil',[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}]));
    d=isaretle(d,'cemil','supheli');
    const k=kayitKur({depo:bellekDepo(),saat:()=>0});
    const z=zamanBaslat({tohum:77});
    expect((await k.kaydet(kayitVerisi({zaman:z,defter:d}))).tamam).toBe(true);
    const y=await k.yukle();
    expect(y.tamam).toBe(true);
    expect(y.veri.defter).toEqual(d);
    expect(defterSorunu(y.veri.defter)).toBeNull();
  });
});
