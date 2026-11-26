import {describe,it,expect} from 'vitest';
import {doldur,cumleKur,sec,varyantBul,yerTutucular,kumeDenetle,MIZAC_YEDEGI} from '../src/diyalog/kalip.js';
import KALIPLAR from '../src/dil/tr/kaliplar.js';
import {kisiAdi,mekanAdi,ozelAd} from '../src/dil/tr/ekler.js';
import {rng} from '../src/cekirdek/rastgele.js';
import {MIZACLAR} from '../src/icerik/kur.js';
import terimler from '../src/dil/tr/terimler.js';
import kisiler from '../src/dil/tr/kisiler.js';

const ORNEK={kim:kisiAdi('Kör Halil'),yer:mekanAdi('Su değirmeni'),zaman:'o gece',esya:'boynuz saplı kama',sahip:kisiAdi('Muhtarın Kızı')};

describe('kalıp doldurma',()=>{
  it.each([
    ['{kim} o gece {yer:de} idi.',{kim:kisiAdi('Kör Halil'),yer:mekanAdi('Su değirmeni')},"Kör Halil o gece su değirmeninde idi."],
    ['{kim:i} {yer:den} çıkarken gördüm.',{kim:kisiAdi('Hoca'),yer:mekanAdi('Ağa konağı')},'Hocayı ağa konağından çıkarken gördüm.'],
    ['{yer:de+dim}.',{yer:mekanAdi('Muhtarın evi')},'Muhtarın evindeydim.'],
    ['{yer:e} gittim.',{yer:mekanAdi('Çeşme başı')},'Çeşme başına gittim.'],
    ['{kim:le} {yer:de} konuştum.',{kim:kisiAdi('Elif Yıldız'),yer:ozelAd('Antep')},"Elif Yıldız'la Antep'te konuştum."],
    ['Saat {saat:de} durmuş.',{saat:'22:40'},"Saat 22:40'ta durmuş."],
    ['Saat {saat:de} kalktım.',{saat:3},"Saat 3'te kalktım."],
    ['{sahip:in} {esya:si}.',{sahip:kisiAdi('Kör Halil'),esya:'boynuz saplı kama'},"Kör Halil'in boynuz saplı kaması."],
    ['{sahip:in} {esya:si}.',{sahip:kisiAdi('Hacı Ağa'),esya:'gümüş köstekli cep saati'},"Hacı Ağa'nın gümüş köstekli cep saati."],
    ['{yer:de} {kim:i} gördüm.',{yer:mekanAdi("Kör Halil'in evi"),kim:kisiAdi('Muhtarın Kızı')},"Kör Halil'in evinde Muhtarın Kızı'nı gördüm."],
    ['{kim:mi}? Bilmem.',{kim:kisiAdi('Dul Gülsüm')},'Dul Gülsüm mü? Bilmem.'],
    ['{zaman:mi}? {yer:de+dim}.',{zaman:'yatsıdan sonra',yer:mekanAdi('Irgat evi')},'Yatsıdan sonra mı? Irgat evindeydim.'],
    ['{yer} uzak değil.',{yer:mekanAdi('Mezarlık')},'Mezarlık uzak değil.'],
  ])('%s',(k,d,b)=>expect(doldur(k,d)).toBe(b));

  it('cümle başı büyür, üç nokta sonrası büyümez, boşluklar toparlanır',()=>{
    expect(doldur('{yer:de}... {yer:de+dim}. evet.',{yer:mekanAdi('Mağara')})).toBe('Mağarada... mağaradaydım. Evet.');
    expect(doldur('[|ben ]{yer:de+dim} , beyim.',{yer:mekanAdi('Bakkal')})).toBe('Bakkaldaydım, beyim.');
    expect(doldur('{yer:de} kaldım! ırgat geldi? ışık yandı.',{yer:mekanAdi('Ağıl')})).toBe('Ağılda kaldım! Irgat geldi? Işık yandı.');
  });

  it('satır içi seçenek rng ile seçilir; rng yoksa ilki',()=>{
    expect(doldur('[a|b|c] {x}',{x:'ev'})).toBe('A ev');
    const gorulen=new Set(); const r=rng(3);
    for(let i=0;i<60;i++) gorulen.add(doldur('[a|b|c]',{},r));
    expect([...gorulen].sort()).toEqual(['A','B','C']);
  });

  it('eksik değerde açık hata',()=>{
    expect(()=>doldur('{kim:i} gördüm.',{})).toThrow(/eksik değer: \{kim\}/);
    expect(()=>doldur('{kim} gördüm.',{kim:null})).toThrow(/eksik değer/);
    expect(()=>cumleKur(KALIPLAR,'gordum',{degerler:{kim:'x'}})).toThrow(/eksik değer: yer/);
  });
  it('bilinmeyen ek, tür ve mizaçta açık hata',()=>{
    expect(()=>doldur('{yer:xyz}',{yer:'ev'})).toThrow(/Bilinmeyen ek.*kalıp/);
    expect(()=>cumleKur(KALIPLAR,'yok-boyle',{})).toThrow(/Bilinmeyen bilgi türü/);
    expect(()=>cumleKur(KALIPLAR,'inkar',{mizac:'neseli',degerler:ORNEK})).toThrow(/Bilinmeyen mizaç/);
    expect(()=>doldur('[a|b',{})).toThrow(/köşeli/);
  });
  it('yer tutucular listelenir',()=>{
    expect(yerTutucular('{kim:i} [x|{yer:si+de}] {zaman}')).toEqual([{ad:'kim',ekler:['i']},{ad:'yer',ekler:['si','de']},{ad:'zaman',ekler:[]}]);
  });
  it('sec rng aralığını denetler',()=>{
    expect(()=>sec([1,2],()=>1)).toThrow();
    expect(()=>sec([],null)).toThrow();
    expect(sec([1,2,3],()=>0.99)).toBe(3);
  });
});

describe('mizaç varyantları',()=>{
  it('her mizaç her bilgi türünde bir kalıp listesine iner',()=>{
    for(const t of Object.keys(KALIPLAR)) for(const m of MIZACLAR) expect(varyantBul(KALIPLAR[t],m).kaliplar.length).toBeGreaterThan(0);
  });
  it('yedek zinciri: öfkelinin kendi listesi yoksa sert, o da yoksa genel',()=>{
    const tur={genel:['g'],sert:['s']};
    expect(varyantBul(tur,'ofkeli').mizac).toBe('sert');
    expect(varyantBul(tur,'saf').mizac).toBe('genel');
    expect(varyantBul({genel:['g']},'ofkeli').mizac).toBe('genel');
    expect(Object.keys(MIZAC_YEDEGI).sort()).toEqual([...MIZACLAR].sort());
  });
  it('her bilgi türünde en az 3 mizaç tonu ve her listede en az 2 kalıp var',()=>{
    for(const [t,tur] of Object.entries(KALIPLAR)){
      const tonlar=Object.keys(tur).filter(k=>k!=='degiskenler'&&k!=='genel');
      expect(tonlar.length,t).toBeGreaterThanOrEqual(3);
      for(const m of ['korkak','dedikoducu','sert']) expect(tur[m],t+'.'+m).toBeTruthy();
      for(const k of Object.keys(tur)) if(k!=='degiskenler') expect(tur[k].length,t+'.'+k).toBeGreaterThanOrEqual(2);
    }
  });
  it('ton farkı: dedikoducu uzun, korkak ve sert kısa',()=>{
    const ort=l=>l.reduce((a,k)=>a+doldur(k,ORNEK).length,0)/l.length;
    for(const [t,tur] of Object.entries(KALIPLAR)){
      expect(ort(tur.dedikoducu),t).toBeGreaterThan(ort(tur.genel)*1.8);
      expect(ort(tur.korkak),t).toBeLessThan(ort(tur.dedikoducu)/2);
      expect(ort(tur.sert),t).toBeLessThanOrEqual(ort(tur.genel));
    }
  });
  it('korkak kaçamak konuşur (üç nokta), sert kesik konuşur (kısa cümleler)',()=>{
    for(const tur of Object.values(KALIPLAR)){
      expect(tur.korkak.filter(k=>k.includes('...')).length).toBeGreaterThanOrEqual(2);
      for(const k of tur.sert){
        const cumleler=doldur(k,ORNEK).split(/[.?!]/).map(s=>s.trim()).filter(Boolean);
        for(const c of cumleler) expect(c.split(' ').length,k).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe('kalıp kümesi (kaliplar.js)',()=>{
  it('küme denetimi temiz',()=>expect(kumeDenetle(KALIPLAR,ORNEK)).toEqual([]));
  it('denetim hataları yakalar',()=>{
    const h=kumeDenetle({x:{degiskenler:['a'],genel:['{b}'],neseli:['y']},y:{degiskenler:[],korkak:['{a:qq}']}},{a:'ev',b:'ev'});
    expect(h.join('\n')).toMatch(/bildirilmemiş değişken \{b\}/);
    expect(h.join('\n')).toMatch(/bilinmeyen mizaç anahtarı neseli/);
    expect(h.join('\n')).toMatch(/Bilinmeyen ek/);
    expect(h.join('\n')).toMatch(/"genel" varyantı yok/);
  });
  it('bütün kalıplar bütün seçeneklerle, depodaki her kişi, mekân ve eşyayla hatasız dolar',()=>{
    const adlar=Object.values(kisiler).flatMap(k=>[k.ad,k.lakap]).map(kisiAdi);
    const yerler=Object.values(terimler.mekan).map(mekanAdi);
    const esyalar=Object.values(kisiler).flatMap(k=>Object.values(k.esyalar));
    const r=rng(11);
    let n=0;
    for(let i=0;i<400;i++){
      const d={kim:adlar[i%adlar.length],sahip:adlar[(i*7)%adlar.length],yer:yerler[i%yerler.length],esya:esyalar[i%esyalar.length],zaman:['o gece','yatsıdan sonra','sabah ezanında'][i%3]};
      for(const tur of Object.values(KALIPLAR)) for(const m of Object.keys(tur)) if(m!=='degiskenler') for(const k of tur[m]){
        const s=doldur(k,d,r);
        expect(s).not.toMatch(/[{}[\]|]| {2}/);
        expect(s[0]).toBe(s[0].toLocaleUpperCase('tr'));
        n++;
      }
    }
    expect(n).toBeGreaterThan(10000);
  });
});

describe('belirlenimcilik',()=>{
  const uret=tohum=>{
    const r=rng(tohum), out=[];
    for(const t of Object.keys(KALIPLAR)) for(const m of MIZACLAR) out.push(cumleKur(KALIPLAR,t,{mizac:m,degerler:ORNEK,rng:r}));
    return out;
  };
  it('aynı tohum aynı cümleleri verir',()=>expect(uret(42)).toEqual(uret(42)));
  it('farklı tohum farklı seçimler yapar',()=>expect(uret(1)).not.toEqual(uret(2)));
  it('rng verilmezse her zaman ilk kalıp',()=>{
    expect(cumleKur(KALIPLAR,'gordum',{mizac:'sakin',degerler:ORNEK})).toBe('O gece Kör Halil\'i su değirmeninden çıkarken gördüm.');
    expect(cumleKur(KALIPLAR,'yer-zaman',{mizac:'sert',degerler:ORNEK})).toBe('Su değirmenindeydim. Başka?');
    expect(cumleKur(KALIPLAR,'yer-zaman',{degerler:ORNEK})).toBe('O gece su değirmenindeydim, beyim.');
  });
  it('sabit tohumda üretim sürümler arasında değişmez',()=>{
    const r=rng(9);
    expect([
      cumleKur(KALIPLAR,'gordum',{mizac:'korkak',degerler:ORNEK,rng:r}),
      cumleKur(KALIPLAR,'esya-tanima',{mizac:'dedikoducu',degerler:ORNEK,rng:r}),
      cumleKur(KALIPLAR,'inkar',{mizac:'sert',degerler:ORNEK,rng:r}),
    ]).toEqual([
      'Kör Halil... su değirmeninde gibiydi. Ben bir şey demedim ama.',
      "Beyim, bunu bütün köy bilir: Muhtarın Kızı'nın boynuz saplı kaması. Neden elinden çıktığı da belli ya, orasını ben söylemeyeyim.",
      'Değildim.',
    ]);
  });
  it('Math.random kullanılmaz',()=>{
    const asil=Math.random; Math.random=()=>{throw new Error('Math.random çağrıldı');};
    try{ uret(5); } finally { Math.random=asil; }
  });
});
