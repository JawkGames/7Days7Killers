import {describe,it,expect} from 'vitest';
import {koy} from '../src/icerik/index.js';
import {cekirdekListesi} from '../src/icerik/olay-cekirdekleri/index.js';
import {vakaUret,ifade,ifadeMotoru} from '../src/simulasyon/index.js';

// Elle kurulmuş küçük bir vaka: a, v'yi m1'de öldürür; herkes komşu m2'den a'yı yüzünden görür.
// b: a'ya borçlu, c: a'nın eşi, d: korkak, e: dedikoducu, f: ilgisiz, g: a'nın dostu, h: a'nın hasmı.
function kucukVaka(){
  const kisi=(mizac,ev)=>({ev,is:null,mizac,cinsiyet:'E',yas:40,ortu:'aba',esyalar:[],rol:'masum',olum:null});
  const kisiler={a:{...kisi('sert','ev-a'),rol:'katil'},v:{...kisi('sakin','ev-v'),rol:'kurban',olum:0},
    b:kisi('sert','ev-b'),c:kisi('sert','ev-a'),d:kisi('korkak','ev-d'),e:kisi('dedikoducu','ev-e'),f:kisi('sakin','ev-f'),g:kisi('sert','ev-g'),h:kisi('sert','ev-h')};
  const ids=Object.keys(kisiler), cizelge={}, neden={};
  for(const k of ids){cizelge[k]=['m2','m2']; neden[k]=['sohbet','sohbet'];}
  cizelge.a=['m1','ev-a']; neden.a=['cinayet:c1','ev'];
  cizelge.v=['m1',null]; neden.v=['ev','olu'];
  const tanik=['b','c','d','e','f','g','h'].map((k,n)=>({id:'i'+(n+2),tur:'tanik',alt:'gordu',tanik:k,gorulen:'a',kesinlik:'yuz',ortu:'aba',nereden:'m2',mekan:'m1',zaman:0,olay:'c1',cinayet:'c1',yaniltici:false,gercek:{neden:'gordu'}}));
  return {
    ayar:{katilSayisi:1,gunSayisi:1,dilimler:['gece','sabah']},
    kisiler,
    iliskiler:[
      {kimden:'b',kime:'a',tur:'borclu'},{kimden:'a',kime:'b',tur:'alacakli'},
      {kimden:'c',kime:'a',tur:'es'},{kimden:'a',kime:'c',tur:'es'},
      {kimden:'g',kime:'a',tur:'dost'},{kimden:'a',kime:'g',tur:'dost'},
      {kimden:'h',kime:'a',tur:'hasim'},{kimden:'a',kime:'h',tur:'hasim'},
    ],
    sirlar:[{sahip:'f',id:'gizli',tur:'hirsizlik',kimler:['b']}],
    harita:{m1:['m2'],m2:['m1']},
    cinayetler:[{id:'c1',katil:'a',kurban:'v',yardimci:null,zaman:0,mekan:'m1',iddialar:{a:'ev-a'},ortan:null,zorlayan:null}],
    baglar:[],olaylar:[{id:'c1',tur:'cinayet',zaman:0,mekan:'m1',kisiler:['a','v'],cinayet:'c1'}],
    izler:[{id:'i1',tur:'fiziksel',alt:'esya',anahtar:'aba-tiftigi',sahip:'a',adaylar:['a','b'],mekan:'m1',zaman:0,olay:'c1',cinayet:'c1',yaniltici:false,gercek:{neden:'katil-birakti'}},...tanik],
    yanilticilar:[],cizelge,neden,
  };
}

describe('yalan kuralları (elle kurulmuş vaka)',()=>{
  const v=kucukVaka();
  const fail=k=>ifade(v,k,{tur:'fail',cinayet:'c1'});
  it('katil yalan söyler: kendi yeri için mazeretini, fail için hasmını söyler',()=>{
    const y=ifade(v,'a',{tur:'konum',kisi:'a',zaman:0});
    expect(y).toMatchObject({tavir:'yalan',kural:'katil',gercek:'m1',soylenen:{deger:'ev-a'}});
    expect(fail('a')).toMatchObject({tavir:'yalan',kural:'katil',soylenen:{deger:'h'}});
    expect(ifade(v,'a',{tur:'esya',iz:'i1'})).toMatchObject({tavir:'yalan',soylenen:{deger:'b'}});
  });
  it('seven korur (eş yalan söyler)',()=>{expect(fail('c')).toMatchObject({tavir:'yalan',kural:'seven-korur',gercek:'a'});});
  it('borçlu alacaklısını satmaz',()=>{expect(fail('b')).toMatchObject({tavir:'susar',kural:'borclu',soylenen:null});});
  it('korkak susar',()=>{expect(fail('d')).toMatchObject({tavir:'susar',kural:'korkak'});});
  it('dedikoducu abartır',()=>{expect(fail('e')).toMatchObject({tavir:'abarti',kural:'dedikoducu',soylenen:{deger:'a',abarti:{tur:'kesinlik'}}});});
  it('dost susar, hasım üstüne gider',()=>{
    expect(fail('g')).toMatchObject({tavir:'susar',kural:'dostluk'});
    expect(fail('h')).toMatchObject({tavir:'abarti',kural:'husumet'});
  });
  it('ilgisiz tanık "kim öldürdü"ye ad vermez ama yerini doğru söyler',()=>{
    expect(fail('f')).toMatchObject({tavir:'susar',kural:'isim-vermez',gercek:'a'});
    expect(ifade(v,'f',{tur:'konum',kisi:'a',zaman:0})).toMatchObject({tavir:'dogru',soylenen:{deger:'m1'}});
    const g=ifade(v,'f',{tur:'gorulen',zaman:0}).soylenen.deger.find(x=>x.kisi==='a');
    expect(g).toMatchObject({kesinlik:'siluet',ortu:'aba'});
  });
  it('bilmeyen bilmez',()=>{
    const w={...v,izler:v.izler.filter(i=>i.tanik!=='f')};
    expect(ifade(w,'f',{tur:'fail',cinayet:'c1'})).toMatchObject({tavir:'bilmez',bilgi:null});
  });
  it('masum da sırrını saklar; sırrı bilen başkası doğruyu söyler',()=>{
    expect(ifade(v,'f',{tur:'sir',sahip:'f',sir:'gizli'})).toMatchObject({tavir:'susar',kural:'sir-saklama'});
    expect(ifade(v,'b',{tur:'sir',sahip:'f',sir:'gizli'}).tavir).toBe('dogru');
    expect(ifade(v,'d',{tur:'sir',sahip:'f',sir:'gizli'}).tavir).toBe('bilmez');
  });
  it('ölü konuşmaz, gelecek bilinmez (sorgu günü verilince)',()=>{
    expect(ifade(v,'v',{tur:'fail',cinayet:'c1'},{gun:1}).tavir).toBe('olu');
    expect(ifade(v,'f',{tur:'konum',kisi:'b',zaman:1},{gun:1}).tavir).toBe('bilmez');
  });
  it('gördüklerini sorunca: korkak susar, eş katili listeden çıkarır',()=>{
    const d=ifade(v,'d',{tur:'gorulen',zaman:0}), c=ifade(v,'c',{tur:'gorulen',zaman:0});
    expect(d.gercek.map(x=>x.kisi)).toContain('a');
    expect(d.soylenen==null||!d.soylenen.deger.some(x=>x.kisi==='a')).toBe(true);
    expect(c.tavir).toBe('yalan');
    expect(c.soylenen.deger.some(x=>x.kisi==='a')).toBe(false);
  });
});

describe('yalan kuralları (üretilen vakalarda)',()=>{
  const KOY={...koy,cekirdekler:cekirdekListesi};
  const vakalar=[1,2,3,4,5,6,7,8,9,10,11,12].map(s=>vakaUret(s,KOY));
  it('katil kendi cinayet anındaki yeri için hiç doğruyu söylemez',()=>{
    for(const v of vakalar) for(const c of v.cinayetler){
      const f=ifade(v,c.katil,{tur:'konum',kisi:c.katil,zaman:c.zaman});
      expect(f.kural).toBe('katil');
      // Cinayeti kendi evinde işlediyse "evdeydim" demesi doğrudur ama eksiktir.
      if(c.iddialar[c.katil]===c.mekan) expect(f.tavir).toBe('dogru');
      else {expect(f.tavir).toBe('yalan'); expect(f.soylenen.deger).toBe(c.iddialar[c.katil]);}
    }
  });
  it('örten, katilin yeri için katilin mazeretini tekrarlar',()=>{
    let n=0;
    for(const v of vakalar) for(const c of v.cinayetler.filter(c=>c.ortan)){
      const f=ifade(v,c.ortan,{tur:'konum',kisi:c.katil,zaman:c.zaman});
      expect(f).toMatchObject({tavir:'yalan',kural:'ortme',soylenen:{deger:c.iddialar[c.katil]}});
      n++;
    }
    expect(n).toBeGreaterThan(0);
  });
  it('ifadeler tutarlı: doğru = bildiği, yalan ≠ bildiği, bilmez = bilgisiz',()=>{
    for(const v of vakalar) for(const f of v.ifadeler){
      expect(['dogru','yalan','susar','abarti','bilmez']).toContain(f.tavir);
      // Gördüklerinde doğru söyleyen, komşu yerden gördüğünün adını vermeyebilir (isim vermez): kişi ve yer aynıdır.
      const yerler=l=>l.map(e=>[e.kisi,e.mekan,e.ses]);
      if(f.tavir==='dogru'&&f.olgu.tur==='gorulen') expect(yerler(f.soylenen.deger)).toEqual(yerler(f.bilgi.deger));
      else if(f.tavir==='dogru') expect(f.soylenen).toEqual(f.bilgi);
      if(f.tavir==='bilmez') expect(f.bilgi).toBeNull();
      // "Gördüklerin" sorusunda susmak bir kişiyi listeden çıkarmaktır; geri kalanı söylenir.
      if(f.tavir==='susar'&&f.olgu.tur!=='gorulen') expect(f.soylenen).toBeNull();
      if(f.tavir==='susar'&&f.olgu.tur==='gorulen'&&f.soylenen) expect(f.soylenen.deger.length).toBeLessThan(f.bilgi.deger.length);
      if(f.tavir==='yalan') expect(f.soylenen).not.toEqual(f.bilgi);
      expect(f.gerginlik).toBeGreaterThanOrEqual(0); expect(f.gerginlik).toBeLessThanOrEqual(1);
    }
  });
  it('vakadaki ifadeler motorla yeniden hesaplanınca aynı çıkar (JSON\'dan okunmuş vakada da)',()=>{
    const v=JSON.parse(JSON.stringify(vakalar[0])), m=ifadeMotoru(v);
    for(const f of v.ifadeler) expect(m.ifade(f.konusan,f.olgu)).toEqual(f);
  });
  it('masumlar da yalan söyler ya da susar (sırları yüzünden)',()=>{
    const masumYalan=vakalar.flatMap(v=>v.ifadeler.filter(f=>v.kisiler[f.konusan].rol!=='katil'&&f.kural==='sir-saklama'));
    expect(masumYalan.length).toBeGreaterThan(0);
  });
});
