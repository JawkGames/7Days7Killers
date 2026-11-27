import {describe,it,expect} from 'vitest';
import {ifadeKur,hedefHesapla,tepkidenDurum,DURUMLAR,PROFIL,MIZAC_SUZGEC,SINIR,KANALLAR} from '../src/cizim/rig/ifade.js';
import {cikisKaresi,CIKIS} from '../src/cizim/rig/cikis.js';
import {POZ_NOTR,poz as rigPoz} from '../src/cizim/rig/poz.js';
import {MIZACLAR} from '../src/icerik/kur.js';
import {tepkiKur} from '../src/diyalog/cevap.js';
import {rng} from '../src/cekirdek/rastgele.js';

const bosPoz=()=>({...POZ_NOTR,agizAc:0});
function oynat(f,saniye,{dt=1/60,konus=null}={}){
  const P=bosPoz(), kayit=[];
  for(let t=0;t<saniye;t+=dt){ if(konus) P.agizAc=konus(t); f.guncelle(dt,P); kayit.push({...P}); }
  return kayit;
}

describe('ifade: hedef hesaplama',()=>{
  it('her durumun profili var; sakin ve şiddet 0 nötrdür',()=>{
    expect(Object.keys(PROFIL).sort()).toEqual([...DURUMLAR].sort());
    for(const d of DURUMLAR){
      const {poz}=hedefHesapla(d,0);
      for(const k in poz) expect(poz[k]).toBeCloseTo(POZ_NOTR[k]||0,9);
    }
    const {poz}=hedefHesapla('sakin',1);
    for(const k in poz) expect(poz[k]).toBeCloseTo(POZ_NOTR[k]||0,9);
  });
  it('duygular beklenen yönde: öfkede kaş çatılır, korkuda göz açılır, hüzünde ağız köşesi düşer',()=>{
    const H=d=>hedefHesapla(d,1).poz;
    expect(H('ofkeli').kasCat).toBeGreaterThan(POZ_NOTR.kasCat+.5);
    expect(H('ofkeli').gozAc).toBeLessThan(0);
    expect(H('korkmus').gozAc).toBeGreaterThan(.5);
    expect(H('korkmus').kasKaldir).toBeGreaterThan(.5);
    expect(H('uzgun').agizKose).toBeLessThan(-.3);
    expect(H('uzgun').kasCat).toBeLessThan(0);
    expect(H('saskin').agizAralik).toBeGreaterThan(.3);
    expect(H('tutan').dudakSik).toBeGreaterThan(.4);
    expect(Math.abs(H('kucumseyen').agizYan)).toBeGreaterThan(.2);
  });
  it('şiddet sapmayı büyütür',()=>{
    const a=hedefHesapla('ofkeli',.3).poz.kasCat, b=hedefHesapla('ofkeli',.9).poz.kasCat;
    expect(b).toBeGreaterThan(a);
  });
  it('bütün hedefler sınır içinde (her duygu × mizaç × şiddet)',()=>{
    for(const d of DURUMLAR) for(const m of [null,...MIZACLAR]) for(const s of [0,.3,.7,1]){
      const {poz}=hedefHesapla(d,s,m);
      for(const k in poz){ expect(poz[k]).toBeGreaterThanOrEqual(SINIR[k][0]); expect(poz[k]).toBeLessThanOrEqual(SINIR[k][1]); }
    }
  });
});

describe('ifade: mizaç süzgeci',()=>{
  it('her mizacın süzgeci var',()=>{
    for(const m of MIZACLAR) expect(MIZAC_SUZGEC[m],m).toBeTruthy();
  });
  it('aynı duygu mizaca göre farklı oynanır',()=>{
    const g=m=>hedefHesapla('gergin',.8,m);
    expect(g('korkak').dav.kacirma).toBeGreaterThan(g('sert').dav.kacirma*3); // korkak göz kaçırır, sert kaçırmaz
    expect(g('korkak').poz.omuzKalk).toBeLessThan(g(null).poz.omuzKalk);     // korkağın omzu düşer
    expect(g('sert').poz.gozAc).toBeLessThan(g(null).poz.gozAc);             // sert: göz kısık
    expect(g('sert').dav.titreme).toBeLessThan(g(null).dav.titreme);         // sert kıpırdamaz
    expect(g('kurnaz').poz.agizYan).toBeGreaterThan(g(null).poz.agizYan);    // kurnaz: yarım gülüş
    expect(g('kurnaz').poz.kasSol).toBeLessThan(0);                          // tek kaş
    expect(g('gururlu').poz.basEg).toBeLessThan(g(null).poz.basEg);          // baş geri
    expect(g('saf').poz.gozAc).toBeGreaterThan(g(null).poz.gozAc);           // gözler iri
    expect(g('dedikoducu').poz.egil).toBeGreaterThan(g(null).poz.egil);      // öne eğilir
    expect(g('ofkeli').poz.burunAc).toBeGreaterThan(g(null).poz.burunAc);    // burun delikleri
    const s=hedefHesapla('gergin',.8,'sakin').poz, n=hedefHesapla('gergin',.8).poz;
    expect(Math.abs(s.kasCat-POZ_NOTR.kasCat)).toBeLessThan(Math.abs(n.kasCat-POZ_NOTR.kasCat)); // sakin: az hareket
  });
});

describe('ifade: tepki',()=>{
  it('cevap.js tepkisinden durum: tepkiKur çıktısı doğrudan kabul edilir',()=>{
    const r=rng(5);
    for(const m of MIZACLAR) for(const g of [0,.2,.35,.5,.7,.9]){
      const t=tepkiKur({gerginlik:g,mizac:m,tavir:'dogru'},r);
      const {durum,siddet}=tepkidenDurum(t,m);
      expect(DURUMLAR).toContain(durum);
      expect(siddet).toBeGreaterThanOrEqual(0); expect(siddet).toBeLessThanOrEqual(1);
      const f=ifadeKur({mizac:m,tohum:3}); const o=f.tepkiOyna(t);
      expect(o.durum).toBe(durum);
      expect(o.bekle).toBe(t.duraksama?.75:0);
      expect(f.tepkiOyna({tepki:t}).durum).toBe(durum); // cevabın kendisi de verilebilir
    }
    expect(tepkidenDurum({gerginlik:.8,duzey:'cok-gergin'},'ofkeli').durum).toBe('ofkeli');
    expect(tepkidenDurum({gerginlik:.1,duzey:'sakin'},'sakin').durum).toBe('sakin');
    expect(tepkidenDurum({gerginlik:.9,duzey:'cok-gergin'},'korkak').durum).toBe('korkmus');
  });
});

describe('ifade: belirlenimcilik ve geçiş',()=>{
  const senaryo=(tohum,mizac='korkak')=>{
    const f=ifadeKur({mizac,tohum});
    f.hedefle('gergin',.7);
    const a=oynat(f,4);
    f.tepkiOyna({gerginlik:.7,duzey:'cok-gergin',gozKacirma:true,duraksama:true});
    const b=oynat(f,5,{konus:t=>t>1&&t<3?.5+.4*Math.sin(t*20):0});
    f.hedefle('uzgun',1);
    return [...a,...b,...oynat(f,6)];
  };
  it('aynı tohum aynı oyunculuk, farklı tohum farklı',()=>{
    expect(senaryo(11)).toEqual(senaryo(11));
    expect(senaryo(11)).not.toEqual(senaryo(12));
  });
  it('Math.random kullanılmaz',()=>{
    const eski=Math.random; Math.random=()=>{throw new Error('Math.random çağrıldı');};
    try{ senaryo(4); } finally{ Math.random=eski; }
  });
  it('bütün kanallar her karede sınır içinde ve sayı',()=>{
    const hatalar=[];
    for(const m of [null,...MIZACLAR]) for(const tohum of [1,2,3]){
      const f=ifadeKur({mizac:m,tohum});
      const P=bosPoz();
      for(let i=0;i<1500;i++){
        if(i%150===0) f.hedefle(DURUMLAR[(i/150+tohum)%DURUMLAR.length],(i%300)/300+.3);
        if(i%400===0) f.tepkiOyna({gerginlik:.8,duzey:'cok-gergin',gozKacirma:true,duraksama:true});
        f.guncelle(i%7===0?.05:1/60,P);
        for(const k of KANALLAR) if(!(Number.isFinite(P[k])&&P[k]>=SINIR[k][0]&&P[k]<=SINIR[k][1])) hatalar.push(`${m} ${tohum} ${i} ${k}=${P[k]}`);
      }
    }
    expect(hatalar).toEqual([]);
  });
  it('geçiş sıçramasız ve taşmasız (kritik sönüm)',()=>{
    const f=ifadeKur({tohum:9, azHareket:false});
    f.hedefle('sakin',0); oynat(f,1);
    f.hedefle('ofkeli',1);
    const k=oynat(f,3), hedef=hedefHesapla('ofkeli',1).poz.kasCat;
    let enBuyukAdim=0;
    for(let i=1;i<k.length;i++) enBuyukAdim=Math.max(enBuyukAdim,Math.abs(k[i].kasCat-k[i-1].kasCat));
    expect(enBuyukAdim).toBeLessThan(.08);                          // 60 fps'de karede küçük adım
    for(const p of k) expect(p.kasCat).toBeLessThan(hedef+.12);     // hedefi aşmaz (yalnızca küçük canlılık)
    expect(k[k.length-1].kasCat).toBeCloseTo(hedef,1);              // varır
  });
  it('konuşurken ağız köşesi oynamaz, dudak sıkılmaz',()=>{
    const f=ifadeKur({tohum:2}); f.hedefle('sakin',0); oynat(f,1);
    const P=bosPoz(); P.agizAc=.6;
    f.guncelle(1/60,P); const kose=P.agizKose;
    f.hedefle('uzgun',1);
    for(let i=0;i<120;i++){ P.agizAc=.3+.3*Math.sin(i/3); f.guncelle(1/60,P); expect(P.agizKose).toBe(kose); }
    expect(P.dudakSik).toBeLessThan(.05);
    P.agizAc=0; for(let i=0;i<180;i++) f.guncelle(1/60,P);
    expect(P.agizKose).toBeLessThan(kose-.3); // susunca köşe yavaşça yerine iner
  });
  it('yerles hedefe oturur; sifirla nötre döner; poz dışa açık nesnesi bozulmaz',()=>{
    const f=ifadeKur({tohum:1}); const P=bosPoz();
    f.hedefle('saskin',1).yerles(P);
    expect(P.kasKaldir).toBeCloseTo(hedefHesapla('saskin',1).poz.kasKaldir,9);
    f.sifirla(P);
    for(const k of KANALLAR) expect(P[k]).toBeCloseTo(POZ_NOTR[k]||0,9);
    for(const k of Object.keys(POZ_NOTR)) expect(rigPoz[k]).toBe(POZ_NOTR[k]); // rig pozunun varsayılanları nötr
  });
});

describe('kalkıp gitme',()=>{
  it('oturur başlar, ayağa kalkar, kapıya gider, karanlıkta biter',()=>{
    const a=cikisKaresi(0), b=cikisKaresi(CIKIS.zaman.kalk[1]+.1), son=cikisKaresi(CIKIS.zaman.bitis+.1);
    expect(a.giris.ayakta).toBe(0); expect(a.giris.d).toBe(0); expect(a.giris.gorun).toBe(1); expect(a.giris.karart).toBe(0);
    expect(b.giris.ayakta).toBe(1);
    expect(son.bitti).toBe(true); expect(son.giris.d).toBe(1); expect(son.giris.gorun).toBe(0);
    let once=cikisKaresi(0);
    for(let z=.04;z<7;z+=.04){ const k=cikisKaresi(z);
      expect(Math.abs(k.giris.d-once.giris.d)).toBeLessThan(.03); expect(Math.abs(k.giris.ayakta-once.giris.ayakta)).toBeLessThan(.09);
      expect(k.giris.aktif).toBe(true); expect(k.giris.bas).toBe(null); once=k; }
  });
  it('ifade.kalk: guncelle cikis alanını doldurur',()=>{
    const f=ifadeKur({tohum:1}); const P=bosPoz();
    f.kalk(); for(let i=0;i<60;i++) f.guncelle(1/60,P);
    expect(f.cikis.aktif).toBe(true); expect(P.bakisY).toBeGreaterThan(.2);
  });
});
