import {describe,it,expect} from 'vitest';
import {kayitKur,bellekDepo,localStorageDepo,kayitVerisi,kayitSorunu,KAYIT_SURUMU,gocler} from '../src/platform/kayit.js';
import * as kayitModulu from '../src/platform/kayit.js';
import {zamanBaslat,ilerle} from '../src/cekirdek/zaman.js';
import {AYARLAR} from '../src/cekirdek/ayarlar.js';

const ANAHTAR=AYARLAR.kayit.anahtar;
const ornek=()=>kayitVerisi({zaman:ilerle(zamanBaslat({tohum:1234})),defter:{izler:['kirmizi-ip']},tercihler:{dil:'tr',azHareket:true}});

function kur(ek={}){
  const depo=ek.depo??bellekDepo();
  return {depo,k:kayitKur({depo,saat:()=>1000,...ek})};
}

describe('kayıt: kaydet ve yükle',()=>{
  it('kaydedileni aynen geri verir',async()=>{
    const {k}=kur(), v=ornek();
    expect(await k.kaydet(v)).toEqual({tamam:true,surum:KAYIT_SURUMU,kayitZamani:1000});
    const y=await k.yukle();
    expect(y).toMatchObject({tamam:true,veri:v,surum:KAYIT_SURUMU,eskiSurum:KAYIT_SURUMU,gocEdildi:false,kayitZamani:1000});
  });
  it('zarf biçimi: {surum, kayitZamani, veri}',async()=>{
    const {k,depo}=kur(), v=ornek();
    await k.kaydet(v,{kayitZamani:555});
    expect(JSON.parse(depo.oku(ANAHTAR))).toEqual({surum:KAYIT_SURUMU,kayitZamani:555,veri:v});
  });
  it('kayıt yoksa açık sonuç',async()=>{
    expect(await kur().k.yukle()).toEqual({tamam:false,neden:'kayit-yok'});
  });
  it('sil kaydı kaldırır',async()=>{
    const {k}=kur();
    await k.kaydet(ornek());
    expect(await k.sil()).toEqual({tamam:true});
    expect((await k.yukle()).neden).toBe('kayit-yok');
  });
  it('şemaya uymayan veri kaydedilmez',async()=>{
    const {k,depo}=kur();
    const r=await k.kaydet({...ornek(),tohum:1});
    expect(r).toMatchObject({tamam:false,neden:'gecersiz-veri'});
    expect(depo.oku(ANAHTAR)).toBeNull();
  });
  it('kayitVerisi tohum ve döngüyü zamandan alır, eksik tercihleri tamamlar',()=>{
    const v=kayitVerisi({zaman:zamanBaslat({tohum:9,dongu:3})});
    expect(v).toMatchObject({tohum:9,dongu:3,defter:{},tercihler:{dil:'tr',azHareket:null}});
    expect(kayitSorunu(v)).toBeNull();
  });
  it('Promise döndüren (Capacitor benzeri) depo da çalışır',async()=>{
    const m=bellekDepo();
    const depo={oku:async a=>m.oku(a),yaz:async(a,b)=>m.yaz(a,b),sil:async a=>m.sil(a)};
    const {k}=kur({depo});
    await k.kaydet(ornek());
    expect((await k.yukle()).tamam).toBe(true);
  });
  it('varsayılan dışa aktarımlar hazır ve gerçek göç tablosu kesintisiz',()=>{
    expect(typeof kayitModulu.kaydet).toBe('function');
    for(let s=1;s<KAYIT_SURUMU;s++) expect(typeof gocler[s]).toBe('function');
  });
});

describe('kayıt: bozuk ve gelecek sürüm',()=>{
  const ham=metin=>kur({depo:bellekDepo({[ANAHTAR]:metin})}).k;
  it.each([
    ['JSON değil','{bozuk'],
    ['dizi','[1,2]'],
    ['sürümsüz',JSON.stringify({veri:{}})],
    ['sürüm metin',JSON.stringify({surum:'1',veri:{}})],
    ['sürüm sıfır',JSON.stringify({surum:0,veri:{}})],
    ['verisiz',JSON.stringify({surum:1})],
    ['null','null'],
  ])('%s: çökmez, bozuk der',async(ad,metin)=>{
    const y=await ham(metin).yukle();
    expect(y).toMatchObject({tamam:false,neden:'bozuk',ham:metin});
  });
  it('zarf sağlam ama veri şemaya uymuyorsa sema-hatasi',async()=>{
    const y=await ham(JSON.stringify({surum:KAYIT_SURUMU,kayitZamani:1,veri:{tohum:1}})).yukle();
    expect(y).toMatchObject({tamam:false,neden:'sema-hatasi'});
    expect(y.ayrinti).toBeTypeOf('string');
  });
  it('gelecekten gelen kayıt yüklenmez ve silinmez',async()=>{
    const metin=JSON.stringify({surum:KAYIT_SURUMU+5,kayitZamani:1,veri:{}});
    const depo=bellekDepo({[ANAHTAR]:metin});
    const y=await kur({depo}).k.yukle();
    expect(y).toEqual({tamam:false,neden:'gelecek-surum',surum:KAYIT_SURUMU+5,beklenen:KAYIT_SURUMU});
    expect(depo.oku(ANAHTAR)).toBe(metin);
  });
});

describe('kayıt: göç zinciri',()=>{
  // Deneme için 3 sürümlük bir geçmiş: v1 {sayi}, v2 {sayi, ad}, v3 {deger, ad, dil}
  const tablo={
    1:v=>({...v,ad:'adsiz'}),
    2:({sayi,...v})=>({...v,deger:sayi*10,dil:'tr'}),
  };
  const dogrula=v=>Number.isFinite(v?.deger)&&typeof v.ad==='string'&&v.dil?null:'v3 değil';
  const zarf=(surum,veri)=>JSON.stringify({surum,kayitZamani:7,veri});

  it('v1 kayıt adım adım v3 olur',async()=>{
    const {k}=kur({depo:bellekDepo({[ANAHTAR]:zarf(1,{sayi:4})}),surum:3,gocTablosu:tablo,dogrula});
    const y=await k.yukle();
    expect(y).toEqual({tamam:true,veri:{deger:40,ad:'adsiz',dil:'tr'},surum:3,eskiSurum:1,gocEdildi:true,kayitZamani:7});
  });
  it('v2 kayıt yalnızca son adımdan geçer',async()=>{
    const {k}=kur({depo:bellekDepo({[ANAHTAR]:zarf(2,{sayi:1,ad:'Elif'})}),surum:3,gocTablosu:tablo,dogrula});
    expect((await k.yukle()).veri).toEqual({deger:10,ad:'Elif',dil:'tr'});
  });
  it('göç sonrası tekrar kaydedilince yeni sürümle yazılır',async()=>{
    const depo=bellekDepo({[ANAHTAR]:zarf(1,{sayi:2})});
    const {k}=kur({depo,surum:3,gocTablosu:tablo,dogrula});
    const y=await k.yukle();
    await k.kaydet(y.veri);
    expect(JSON.parse(depo.oku(ANAHTAR)).surum).toBe(3);
    expect((await k.yukle()).gocEdildi).toBe(false);
  });
  it('yükleme depoyu değiştirmez',async()=>{
    const metin=zarf(1,{sayi:2}), depo=bellekDepo({[ANAHTAR]:metin});
    await kur({depo,surum:3,gocTablosu:tablo,dogrula}).k.yukle();
    expect(depo.oku(ANAHTAR)).toBe(metin);
  });
  it('zincirde eksik halka varsa goc-yok',async()=>{
    const {k}=kur({depo:bellekDepo({[ANAHTAR]:zarf(1,{sayi:1})}),surum:3,gocTablosu:{1:tablo[1]},dogrula});
    expect(await k.yukle()).toEqual({tamam:false,neden:'goc-yok',surum:2});
  });
  it('göç hata atarsa goc-hatasi',async()=>{
    const {k}=kur({depo:bellekDepo({[ANAHTAR]:zarf(1,null)}),surum:3,gocTablosu:{1:()=>{throw new Error('x');},2:tablo[2]},dogrula});
    expect(await k.yukle()).toMatchObject({tamam:false,neden:'goc-hatasi',surum:1});
  });
  it('göç sonucu şemaya uymazsa sema-hatasi',async()=>{
    const {k}=kur({depo:bellekDepo({[ANAHTAR]:zarf(1,{sayi:'yok'})}),surum:3,gocTablosu:tablo,dogrula});
    expect((await k.yukle()).neden).toBe('sema-hatasi');
  });
});

describe('kayıt: depolama hataları',()=>{
  const hataAtan=hata=>({oku:()=>{throw hata;},yaz:()=>{throw hata;},sil:()=>{throw hata;}});
  const kota=Object.assign(new Error('dolu'),{name:'QuotaExceededError',code:22});
  it('dolu depolama: depo-dolu',async()=>{
    const r=await kur({depo:{...bellekDepo(),yaz:()=>{throw kota;}}}).k.kaydet(ornek());
    expect(r).toMatchObject({tamam:false,neden:'depo-dolu'});
  });
  it('Firefox kota hatası da tanınır',async()=>{
    const ff=Object.assign(new Error('x'),{name:'NS_ERROR_DOM_QUOTA_REACHED',code:1014});
    const r=await kur({depo:{...bellekDepo(),yaz:()=>{throw ff;}}}).k.kaydet(ornek());
    expect(r.neden).toBe('depo-dolu');
  });
  it('erişilemeyen depolama: depo-erisilemez (kaydet, yükle, sil)',async()=>{
    const {k}=kur({depo:hataAtan(Object.assign(new Error('engelli'),{name:'SecurityError'}))});
    expect((await k.kaydet(ornek())).neden).toBe('depo-erisilemez');
    expect((await k.yukle()).neden).toBe('depo-erisilemez');
    expect((await k.sil()).neden).toBe('depo-erisilemez');
  });
  it('Promise reddeden depo da yakalanır',async()=>{
    const {k}=kur({depo:{oku:()=>Promise.reject(new Error('x')),yaz:()=>Promise.reject(kota),sil:()=>Promise.reject(new Error('x'))}});
    expect((await k.kaydet(ornek())).neden).toBe('depo-dolu');
    expect((await k.yukle()).neden).toBe('depo-erisilemez');
  });
  it('localStorage yoksa ya da erişim hata atarsa çökmez',async()=>{
    const yok=kayitKur({depo:localStorageDepo(()=>undefined)});
    expect((await yok.yukle()).neden).toBe('depo-erisilemez');
    const engelli=kayitKur({depo:localStorageDepo(()=>{throw new Error('SecurityError');})});
    expect((await engelli.kaydet(ornek())).neden).toBe('depo-erisilemez');
  });
  it('localStorage benzeri nesneyle çalışır',async()=>{
    const m=new Map();
    const ls={getItem:a=>m.has(a)?m.get(a):null,setItem:(a,b)=>m.set(a,b),removeItem:a=>m.delete(a)};
    const k=kayitKur({depo:localStorageDepo(()=>ls),saat:()=>1});
    await k.kaydet(ornek());
    expect((await k.yukle()).veri).toEqual(ornek());
  });
});
