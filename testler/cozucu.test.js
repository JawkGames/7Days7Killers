import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {koy} from '../src/icerik/index.js';
import {cekirdekListesi} from '../src/icerik/olay-cekirdekleri/index.js';
import {vakaUret,vakaDenetle,kaliteRaporu,oyuncuGorunumu,coz} from '../src/simulasyon/index.js';
import {sorguTakvimi,bagimsizlar} from '../src/simulasyon/cozucu/coz.js';

const KOY={...koy,cekirdekler:cekirdekListesi};

// Elle kurulmuş küçük vaka: tek gün, iki dilim. a, v'yi m1'de gece öldürür.
//   - fotoğrafta a'nın çizme izi (tek aday a) ve aba tiftiği (a ya da b),
//   - w komşu m2'den a'nın yüzünü gördü,
//   - b o gece evinde, yakını olmayan c ile birlikte (c doğrular).
function kucukVaka(){
  const kisi=(mizac,ev,ortu='palto',esyalar=[])=>({ev,is:null,mizac,cinsiyet:'E',yas:40,ortu,esyalar,rol:'masum',olum:null});
  const kisiler={
    a:{...kisi('sert','ev-a','aba',['koruklu-cizme']),rol:'katil'},
    v:{...kisi('sakin','ev-v'),rol:'kurban',olum:0},
    w:kisi('sakin','m2'), b:kisi('sakin','ev-b','aba'), c:kisi('sakin','ev-c'),
  };
  const cizelge={a:['m1','ev-a'],v:['m1',null],w:['m2','m2'],b:['ev-b','ev-b'],c:['ev-b','ev-c']};
  const neden={a:['cinayet:c1','ev'],v:['cagrildi:c1','olu'],w:['is','is'],b:['ev','ev'],c:['ziyaret:b','ev']};
  const iz=(id,x)=>({id,cinayet:'c1',olay:'c1',zaman:0,mekan:'m1',yaniltici:false,...x});
  return {
    surum:1,tohum:'kucuk',deneme:0,
    ayar:{katilSayisi:1,gunSayisi:1,dilimler:['gece','sabah'],dilimSaatleri:{},bulunmaDilimi:'sabah'},
    kisiler,iliskiler:[],sirlar:[],
    harita:{m1:['m2'],m2:['m1'],'ev-a':[],'ev-v':[],'ev-b':[],'ev-c':[]},
    katiller:[{kisi:'a',cinayet:'c1',yardimEttigi:null}],
    cinayetler:[{id:'c1',sira:1,katil:'a',kurban:'v',yardimci:null,zaman:0,gun:1,dilim:'gece',mekan:'m1',fotografGunu:1,yontem:'darbe',silah:null,
      sebep:{tur:'husumet'},zorlayan:null,ortan:null,cekirdek:null,cagrildi:true,iddialar:{a:'ev-a'},gozTaniklari:[],kacanTanik:null,
      bulunma:{zaman:1,gun:1,dilim:'sabah',bulan:'w',neden:'rastlanti',olay:'o1'},izler:['i1','i2','i3','i4']}],
    baglar:[],
    olaylar:[{id:'c1',tur:'cinayet',zaman:0,mekan:'m1',kisiler:['a','v'],cinayet:'c1'}],
    izler:[
      iz('i1',{tur:'fiziksel',alt:'yara',anahtar:'ezik-yara',kisi:'v',gercek:{neden:'yontem'}}),
      iz('i2',{tur:'fiziksel',alt:'esya',anahtar:'cizme-izi',iztur:'ayak-izi',esya:'koruklu-cizme',ortu:null,sahip:'a',adaylar:['a'],gercek:{neden:'katil-birakti'}}),
      iz('i3',{tur:'fiziksel',alt:'esya',anahtar:'aba-tiftigi',iztur:'lif',esya:null,ortu:'aba',sahip:'a',adaylar:['a','b'],gercek:{neden:'katil-birakti'}}),
      iz('i4',{tur:'tanik',alt:'gordu',tanik:'w',gorulen:'a',kesinlik:'yuz',ortu:'aba',nereden:'m2',gercek:{neden:'gordu'}}),
    ],
    yanilticilar:[],cizelge,neden,ifadeler:[],
  };
}

describe('çözücü: gerçeğe bakmaz',()=>{
  const v=vakaUret(42,KOY);
  it('oyuncu görünümünde gerçek yok',()=>{
    const {gorunum}=oyuncuGorunumu(v);
    const metin=JSON.stringify({...gorunum,fotograflar:gorunum.fotograflar(7)});
    for(const yasak of ['"katil"','"gercek"','"yaniltici"','"sahip"','"rol"','"sebep"','"yardimci"','"ortan"','"iddialar"','"neden"','"cizelge"'])
      expect(metin,yasak).not.toContain(yasak);
    // İz kimlikleri vakadakiler değil.
    const idler=gorunum.fotograflar(7).flatMap(f=>f.izler.map(i=>i.id));
    expect(idler.every(id=>/^f\d+$/.test(id))).toBe(true);
  });
  it('çözücü kodu vakaya ve motora dokunmaz (yalnızca görünümü alır)',()=>{
    const kaynak=fs.readFileSync(new URL('../src/simulasyon/cozucu/coz.js',import.meta.url),'utf8');
    expect(kaynak).not.toMatch(/^\s*import\s/m);
    expect(kaynak).not.toMatch(/\bvaka\b/);
  });
  it('yalnızca gerçekte duran alanlar değişince çözüm değişmez',()=>{
    const a=coz(oyuncuGorunumu(v).gorunum);
    const w=JSON.parse(JSON.stringify(v));
    w.katiller=[]; w.yanilticilar=[]; w.kalite=null;
    for(const i of w.izler){i.gercek={neden:'?'}; i.yaniltici=!i.yaniltici;}
    for(const c of w.cinayetler){c.sebep={tur:'?'}; c.cekirdek=null;}
    for(const k of Object.values(w.kisiler)) k.rol='masum';
    const b=coz(oyuncuGorunumu(w).gorunum);
    expect(b).toEqual(a);
  });
  it('sorgu, bilinmeyen cinayeti ve görülmemiş izi sormaya izin vermez',()=>{
    const {gorunum}=oyuncuGorunumu(v);
    const son=v.cinayetler.find(c=>c.fotografGunu===7);
    expect(()=>gorunum.sorgula('cemil',{tur:'fail',cinayet:son.id},6)).toThrow();
    expect(()=>gorunum.sorgula('cemil',{tur:'esya',iz:'i1'},7)).toThrow();
    const r=gorunum.sorgula('cemil',{tur:'fail',cinayet:son.id},7);
    expect(Object.keys(r).sort()).toEqual(['cevap','gun','konusan','olgu','soylenen']);
  });
  it('silüetin kim olduğu söylenmez',()=>{
    const {gorunum}=oyuncuGorunumu(v);
    for(const f of gorunum.fotograflar(7)) for(const k of gorunum.kisiIdleri){
      if(k===f.kurban) continue;
      const r=gorunum.sorgula(k,{tur:'gorulen',zaman:f.zaman},f.gun);
      if(r.soylenen) for(const e of r.soylenen.deger) if(e.kesinlik==='siluet') expect(e.kisi).toBeNull();
    }
  });
});

describe('çözücü: elle kurulmuş vaka',()=>{
  const v=kucukVaka();
  const cz=coz(oyuncuGorunumu(v,{gunlukSorguHakki:4}).gorunum);
  const c=cz.cinayetler[0];
  it('katili bulur, üç bağımsız zincirle',()=>{
    expect(c.supheliler[0].kisi).toBe('a');
    expect(c.supheliler.map(s=>s.kisi)).toEqual(['a']);
    expect(c.supheliler[0].bagimsizSayisi).toBe(3);
    const turler=c.zincirler.filter(z=>c.supheliler[0].bagimsiz.includes(z.id)).map(z=>z.tur).sort();
    expect(turler).toEqual(['iz','iz','tanik']);
  });
  it('tanık zinciri: w a\'yı gördü ve suçladı; iz zinciri b\'yi c\'nin doğruladığı mazeretle eler',()=>{
    const tanik=c.zincirler.find(z=>z.tur==='tanik');
    expect(tanik.kaynaklar).toEqual(['k:w']);
    const aba=c.zincirler.find(z=>z.tur==='iz'&&z.eleme.length);
    expect(aba.eleme).toEqual([{kisi:'b',tur:'mazeret',kaynaklar:['c']}]);
    expect(aba.kaynaklar).toContain('k:c');
  });
  it('a\'nın mazereti çürür (çelişki), b açıklanır',()=>{
    expect(cz.celiskiler.some(x=>x.tur==='mazeret-curudu'&&x.kisi==='a')).toBe(true);
    expect(c.aciklamalar.b.map(x=>x.tur)).toContain('mazeret');
  });
  it('en az sorgu: iki zincir sorgusuz (fotoğraf) kurulur',()=>{
    expect(cz.enAzSorgu.sigar).toBe(true);
    expect(cz.enAzSorgu.fotograf).toBe(0); // tek zincir fotoğraftan; ikinci için sorgu gerekir
    expect(cz.enAzSorgu.sorgu).toBeGreaterThanOrEqual(1);
  });
  it('elek elle kurulmuş vakayı geçirir (kolaylık eşiği hariç)',()=>{
    const r=kaliteRaporu(v,{enAzSorgu:0});
    expect(r.nedenler).toEqual([]);
    expect(r.katiller[0]).toMatchObject({kisi:'a',zincirSayisi:3});
  });
  it('tanık yoksa ve b\'nin mazereti yoksa aba izi kimseyi seçmez',()=>{
    const w=kucukVaka();
    w.izler=w.izler.filter(i=>i.id!=='i4'&&i.id!=='i2'); w.cinayetler[0].izler=['i1','i3'];
    w.cizelge.c=['ev-c','ev-c']; w.neden.c=['ev','ev'];
    const c2=coz(oyuncuGorunumu(w).gorunum).cinayetler[0];
    expect(c2.supheliler).toEqual([]);
  });
});

describe('çözücü: yardımcılar',()=>{
  it('bağımsız zincirler kaynak paylaşmaz; elemede başka doğrulayan seçilebilir',()=>{
    const z=(id,sabit,eleme=[])=>({id,kisi:'x',sabit,kaynaklar:[...sabit,...eleme.flatMap(e=>e.kaynaklar.map(k=>'k:'+k))],eleme});
    expect(bagimsizlar([z('a',['iz:1']),z('b',['iz:1']),z('c',['k:w'])]).map(x=>x.id)).toEqual(['a','c']);
    const l=bagimsizlar([z('a',['iz:1'],[{kisi:'y',kaynaklar:['p','q']}]),z('b',['iz:2'],[{kisi:'y',kaynaklar:['p','q']}])]);
    expect(l.map(x=>x.id)).toEqual(['a','b']);
  });
  it('sorgu takvimi günlük hakka ve ölüm günlerine uyar',()=>{
    const b=(k,a,s)=>({konusan:k,ilkGun:a,sonGun:s});
    const t=sorguTakvimi([b('a',1,1),b('b',1,1),b('c',1,2),b('a',1,1)],2,2);
    expect(t.sigar).toBe(true);
    expect(t.gunler).toEqual([['a','b'],['c']]);
    expect(sorguTakvimi([b('a',1,1),b('b',1,1),b('c',1,1)],2,2).sigar).toBe(false);
  });
});

describe('kalite eleği: 100 tohum',()=>{
  it('elekten geçen her vakada her katile en az iki bağımsız zincir, hiçbir masuma zincir yok',()=>{
    let gecen=0, ilk=0;
    for(let s=1;gecen<100&&s<=130;s++){
      const v=vakaUret(s,KOY);
      expect(vakaDenetle(v)).toEqual([]);
      if(!v.kalite.gecti) continue;
      gecen++;
      if(!v.kalite.elenenDenemeler.length) ilk++;
      const r=kaliteRaporu(v);
      expect(r.gecti).toBe(true);
      expect(r.nedenler).toEqual([]);
      for(const k of r.katiller) expect(k.zincirSayisi,`tohum ${s} ${k.kisi}`).toBeGreaterThanOrEqual(2);
      for(const c of r.cozum.cinayetler) for(const x of c.supheliler) expect(v.kisiler[x.kisi].rol).toBe('katil');
      expect(r.yanilticilar.every(y=>y.curutuldu)).toBe(true);
      expect(r.enAzSorgu.sigar).toBe(true);
      expect(v.kalite.zorluk).toEqual(r.zorluk);
    }
    expect(gecen).toBe(100);
    expect(ilk).toBeGreaterThan(50); // ilk denemede geçenler yarıdan çok
  },120000);
  it('elek kapatılınca ilk deneme döner ve rapor yine yazılır',()=>{
    const v=vakaUret(3,KOY,{elek:false});
    expect(v.kalite).toBeDefined();
    expect(v.kalite.elenenDenemeler).toEqual([]);
    expect(typeof v.kalite.gecti).toBe('boolean');
  });
});
