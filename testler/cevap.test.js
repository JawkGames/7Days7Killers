import {describe,it,expect} from 'vitest';
import {vakaUret} from '../src/simulasyon/index.js';
import {cevapUret,selamUret,tepkiKur,sorguZamani,CEVAP_TURLERI} from '../src/diyalog/cevap.js';
import {defterYeni,ifadeEkle,karsilastir} from '../src/diyalog/defter.js';
import {zamanSozu,zamanDefter,gunBasligi} from '../src/dil/tr/zaman.js';
import {rng} from '../src/cekirdek/rastgele.js';
import {koy,ARTIK} from './yardim-oyun.js';

const vakalar=new Map();
const vaka=t=>{if(!vakalar.has(t)) vakalar.set(t,vakaUret(t,koy)); return vakalar.get(t);};
const canli=(v,k,g)=>v.kisiler[k].olum==null||v.kisiler[k].olum>=sorguZamani(v,g);

// Bir vakada her yaşayan kişiye, bilinen her an için her soru türünü sorar.
function hepsiniSor(v,{gunler=[2,4,7]}={}){
  const out=[];
  for(const g of gunler){
    const S=sorguZamani(v,g), cin=v.cinayetler.filter(c=>c.zaman<S);
    const izler=v.izler.filter(i=>i.tur==='fiziksel'&&cin.some(c=>c.id===i.cinayet)&&(i.alt==='esya'||i.alt==='silah'));
    for(const k of Object.keys(v.kisiler).sort()){
      if(!canli(v,k,g)) continue;
      const sorular=[{id:'sir-kendi',tur:'sir-kendi'}];
      for(const c of cin){
        sorular.push({id:'yer:'+c.zaman,tur:'yer',zaman:c.zaman},{id:'gordu:'+c.zaman,tur:'gordu',zaman:c.zaman},
          {id:'fail:'+c.id,tur:'fail',cinayet:c.id},{id:'fark:'+c.id,tur:'fark',cinayet:c.id},
          {id:'iliski:'+c.kurban,tur:'iliski',kisi:c.kurban},{id:'sir:'+c.kurban,tur:'sir',kisi:c.kurban},
          {id:'baskasi:'+c.katil+':'+c.zaman,tur:'baskasi',kisi:c.katil,zaman:c.zaman});
      }
      for(const i of izler) sorular.push({id:'iz:'+i.id,tur:'iz',iz:i.id});
      for(const s of sorular) if(s.tur!=='baskasi'||s.kisi!==k) out.push({k,s,g,c:cevapUret({vaka:v,kisi:k,soru:s,gun:g})});
    }
  }
  return out;
}

describe('zaman deyişleri',()=>{
  it('köy ağzıyla göreli zaman',()=>{
    expect(zamanSozu(5,2)).toBe('dün gece');       // 2. günün gecesi, 2. gün sorulunca
    expect(zamanSozu(0,2)).toBe('evvelsi gece');
    expect(zamanSozu(0,3)).toBe('üç gece evvel');
    expect(zamanSozu(4,2)).toBe('dün akşam');
    expect(zamanSozu(3,2)).toBe('dün ikindi vakti');
    expect(zamanSozu(8,4)).toBe('evvelki gün ikindi vakti');
    expect(zamanSozu(6,2)).toBe('bu sabah');
    expect(zamanDefter(12)).toBe('3. gün, öğle');
    expect(gunBasligi(7)).toBe('Yedinci gün');
  });
  it('rng ile varyant seçer, belirlenimci',()=>{
    const a=[...Array(20)].map((_,i)=>zamanSozu(5,2,{rng:rng(i)}));
    expect(new Set(a).size).toBeGreaterThan(1);
    expect(zamanSozu(5,2,{rng:rng(3)})).toBe(zamanSozu(5,2,{rng:rng(3)}));
  });
});

describe('cevap üretimi',()=>{
  it('bütün soru türleri, 50 tohumda patlamadan ve artık bırakmadan cümle kurar',()=>{
    let n=0; const turler=new Set();
    for(let t=1;t<=50;t++){
      const v=vaka(t);
      for(const {c,s} of hepsiniSor(v,{gunler:t%5===0?[2,4,7]:[3+(t%4)]})){
        expect(c.metin,JSON.stringify(s)).not.toMatch(ARTIK);
        expect(c.metin.length).toBeGreaterThan(1);
        expect(c.metin[0]).toBe(c.metin[0].toLocaleUpperCase('tr'));
        for(const m of c.notlar) expect(m).not.toMatch(ARTIK);
        expect(c.tepki.not).toBeTruthy();
        turler.add(s.tur); n++;
      }
    }
    expect(n).toBeGreaterThan(5000);
    expect([...turler].sort()).toEqual(CEVAP_TURLERI.filter(t=>t!=='yuzlesme').sort());
  },60000);

  it('aynı kişi aynı soruya aynı cevabı verir; farklı tohumda kalıp seçimi değişir',()=>{
    const v=vaka(7), k=Object.keys(v.kisiler).find(x=>canli(v,x,3)), c=v.cinayetler[0];
    const s={id:'yer:'+c.zaman,tur:'yer',zaman:c.zaman};
    expect(cevapUret({vaka:v,kisi:k,soru:s,gun:3})).toEqual(cevapUret({vaka:v,kisi:k,soru:s,gun:3}));
    const metinler=new Set();
    for(let t=1;t<=12;t++){const w=vaka(t); for(const x of Object.keys(w.kisiler)) if(w.kisiler[x].mizac==='dedikoducu'&&canli(w,x,7)) metinler.add(cevapUret({vaka:w,kisi:x,soru:{id:'bilmem',tur:'fark',cinayet:w.cinayetler[0].id},gun:7}).metin);}
    expect(metinler.size).toBeGreaterThan(1);
  });

  it('cevap motorun ifadesine uyar: söylenen konum iddiaya girer, susan iddia vermez',()=>{
    let konum=0, susan=0;
    for(let t=1;t<=10;t++) for(const {c,s,k} of hepsiniSor(vaka(t),{gunler:[7]})){
      if(s.tur!=='yer') continue;
      if(c.tavir==='susar'){ expect(c.iddialar).toEqual([{tur:'susar'}]); susan++; }
      else if(c.iddialar[0]?.tur==='konum'){ expect(c.iddialar[0].kisi).toBe(k); konum++; }
    }
    expect(konum).toBeGreaterThan(100);
    expect(susan).toBeGreaterThan(0);
  });

  it('mizaçlar farklı konuşur: aynı bilgiyi dedikoducu uzun, sert kısa söyler',()=>{
    const boy={};
    for(let t=1;t<=20;t++) for(const {c,k} of hepsiniSor(vaka(t),{gunler:[5]})){
      const m=vaka(t).kisiler[k].mizac; (boy[m]??=[]).push(c.metin.length);
    }
    const ort=m=>boy[m].reduce((a,b)=>a+b,0)/boy[m].length;
    expect(ort('dedikoducu')).toBeGreaterThan(ort('sert')*2.5);
    expect(ort('korkak')).toBeLessThan(ort('dedikoducu'));
  });

  it('yüzleştirme: sırrı yüzünden yalan söyleyen masum çözülür, sırrı açılır',()=>{
    let bulundu=0;
    for(let t=1;t<=40&&bulundu<3;t++){
      const v=vaka(t);
      const f=v.ifadeler.find(x=>x.kural==='sir-saklama'&&x.tavir==='yalan'&&x.olgu.tur==='konum'&&x.olgu.kisi===x.konusan&&v.neden[x.konusan][x.olgu.zaman].startsWith('sir:'));
      if(!f) continue;
      const k=f.konusan, z=f.olgu.zaman, g=Math.floor(z/5)+2;
      if(!canli(v,k,g)) continue;
      const tanik=Object.keys(v.kisiler).find(x=>x!==k&&canli(v,x,g))??k;
      let d=defterYeni();
      const a=cevapUret({vaka:v,kisi:k,soru:{id:'yer:'+z,tur:'yer',zaman:z},gun:g});
      d=ifadeEkle(d,{kisi:k,soru:{id:'yer:'+z,tur:'yer'},olgu:a.olgu,iddialar:a.iddialar,metin:a.metin},{gun:g,dongu:1}).defter;
      d=ifadeEkle(d,{kisi:tanik,soru:{id:'x',tur:'baskasi'},iddialar:[{tur:'konum',kisi:k,zaman:z,mekan:v.cizelge[k][z]}],metin:'…'},{gun:g,dongu:1}).defter;
      const kk=karsilastir(d,'f1','f2',{gun:g,dongu:1});
      expect(kk.celiski).toBeTruthy();
      const y=cevapUret({vaka:v,kisi:k,soru:{id:'yuzlesme:'+kk.celiski.id,tur:'yuzlesme',celiski:kk.celiski.id},gun:g,defter:kk.defter});
      expect(y.kural).toBe('itiraf');
      expect(y.iddialar).toContainEqual({tur:'konum',kisi:k,zaman:z,mekan:v.cizelge[k][z]});
      expect(y.iddialar.some(i=>i.tur==='sir')).toBe(true);
      expect(y.notlar.join(' ')).toMatch(/sırrı/);
      bulundu++;
    }
    expect(bulundu).toBeGreaterThan(0);
  });

  it('yüzleştirme: katil yalanında direnir ve aynı sözü yeniden iddia etmez',()=>{
    let bulundu=0;
    for(let t=1;t<=20&&bulundu<3;t++){
      const v=vaka(t);
      for(const c of v.cinayetler){
        const k=c.katil, g=c.fotografGunu;
        if(!canli(v,k,g)) continue;
        const a=cevapUret({vaka:v,kisi:k,soru:{id:'yer:'+c.zaman,tur:'yer',zaman:c.zaman},gun:g});
        if(a.iddialar[0]?.tur!=='konum'||a.iddialar[0].mekan===c.mekan) continue;
        let d=defterYeni();
        d=ifadeEkle(d,{kisi:k,soru:{id:'yer',tur:'yer'},olgu:a.olgu,iddialar:a.iddialar,metin:a.metin},{gun:g,dongu:1}).defter;
        d=ifadeEkle(d,{kisi:c.kurban===k?'x':c.kurban,soru:{id:'x',tur:'baskasi'},iddialar:[{tur:'konum',kisi:k,zaman:c.zaman,mekan:c.mekan}],metin:'…'},{gun:g,dongu:1}).defter;
        const kk=karsilastir(d,'f1','f2',{gun:g,dongu:1});
        const y=cevapUret({vaka:v,kisi:k,soru:{id:'y',tur:'yuzlesme',celiski:kk.celiski.id},gun:g,defter:kk.defter});
        expect(y.tavir).toBe('yalan');
        expect(y.iddialar).toEqual([]);
        expect(y.gerginlik).toBeGreaterThanOrEqual(a.gerginlik);
        bulundu++; break;
      }
    }
    expect(bulundu).toBeGreaterThan(0);
  });

  it('tepki veri olarak döner ve masumlar da gerilir',()=>{
    const r=rng(1);
    const t=tepkiKur({gerginlik:.7,mizac:'sakin',tavir:'dogru'},r);
    expect(t).toMatchObject({gerginlik:.7,duzey:'cok-gergin'});
    expect(typeof t.gozKacirma).toBe('boolean');
    let masumGergin=0;
    for(let s=1;s<=10;s++) for(const {c,k} of hepsiniSor(vaka(s),{gunler:[6]})) if(vaka(s).kisiler[k].rol==='masum'&&c.tepki.gerginlik>=.45) masumGergin++;
    expect(masumGergin).toBeGreaterThan(0);
  });

  it('selam her mizaçta cümle kurar',()=>{
    const v=vaka(3);
    for(const k of Object.keys(v.kisiler)) expect(selamUret({vaka:v,kisi:k,gun:1}).metin).not.toMatch(ARTIK);
  });
});
