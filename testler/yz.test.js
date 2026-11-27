// Yapay zekâ katmanı (src/yz): sahte arka uçla söyletme, denetim, zaman aşımı, eşleme, önbellek, kapalı kip.
import {describe,it,expect} from 'vitest';
import {yzKur,sahte,cevapAyikla,adGeciyor,cevapDenetle} from '../src/yz/index.js';
import {istemKur,eslemeIstemiKur} from '../src/yz/istem.js';
import {olumsuzMu} from '../src/yz/dogrula.js';
import {onerilenSorular} from '../src/arayuz/soru-oneri.js';

const json=cevap=>JSON.stringify({cevap});
const KISILER={halil:{yas:40,meslek:'katirci',mizac:'sert'},kazim:{yas:50,meslek:'degirmenci',mizac:'saf'}};
const kur=(uret,s={})=>yzKur({arkaUc:sahte(uret,s),kisiler:KISILER,zamanAsimi:s.zamanAsimi??500});

describe('adGeciyor',()=>{
  it('Türkçe ekli adları bulur',()=>{
    expect(adGeciyor("Kör Halil'in kamasını gördüm.",'Kör Halil')).toBe(true);
    expect(adGeciyor('Dün gece değirmendeydim.','değirmen')).toBe(true);
    expect(adGeciyor("Hacı Ağa'ya borcum vardı.",'Hacı Ağa')).toBe(true);
    expect(adGeciyor('Hacı Ağanın konağında.','Hacı Ağa')).toBe(true);
    expect(adGeciyor('Mezarlığa gittim.','mezarlık')).toBe(true);
    expect(adGeciyor('Kâzım Ağabey geldi.','Kazım')).toBe(true);
  });
  it('başka kelimenin içinde yanlış pozitif vermez',()=>{
    expect(adGeciyor('Halini hatırını sordum, o kadar.','Halil')).toBe(false);
    expect(adGeciyor('Ağaçların altında oturduk.','Ağa')).toBe(false);
    expect(adGeciyor('Hacı ağaçların altında.','Hacı Ağa')).toBe(false);
    expect(adGeciyor('Değirmenci geldi.','değirmen')).toBe(false);
  });
  it('olumsuzluk izi',()=>{
    expect(olumsuzMu('Kimseyi görmedim.')).toBe(true);
    expect(olumsuzMu('Evde değildim.')).toBe(true);
    expect(olumsuzMu('Tamam beyim, evdeydim.')).toBe(false);
  });
});

describe('cevapAyikla',()=>{
  it('düşünme bloğunu atar, JSON alanını alır',()=>{
    expect(cevapAyikla('<think>hmm, kim bu?</think>{"cevap":"Evdeydim beyim."}')).toBe('Evdeydim beyim.');
    expect(cevapAyikla('<think>yarım kalan düşünce')).toBe(null);
    expect(cevapAyikla('```json\n{"soru":"s2"}\n```','soru')).toBe('s2');
    expect(cevapAyikla('"Bilmem beyim."')).toBe('Bilmem beyim.');
  });
});

describe('soyle',()=>{
  const g={kisi:'kazim',soru:'Dün gece neredeydin?',kalip:'Dün gece su değirmenindeydim.',tavir:'dogru',gerginlik:.1,anahtar:'77|1|yer:0'};
  it('denetimden geçen cevap kullanılır',async()=>{
    const yz=kur(()=>json('Valla müfettiş bey, dün gece değirmendeydim.'));
    const r=await yz.soyle(g);
    expect(r).toMatchObject({kaynak:'yz',metin:'Valla müfettiş bey, dün gece değirmendeydim.'});
  });
  it('anlamda olmayan kişi adı reddedilir, kalıba düşülür',async()=>{
    const yz=kur(()=>json("Dün gece değirmendeydim, Kör Halil'i de gördüm."));
    const r=await yz.soyle(g);
    expect(r.kaynak).toBe('kalip'); expect(r.metin).toBe(g.kalip); expect(r.neden).toMatch(/anlamda olmayan kisi/);
  });
  it('anlamdaki yer düşerse, olumsuza çevrilirse ya da zaman eklenirse reddedilir',async()=>{
    for(const c of ['Dün gece evdeydim.','Dün gece değirmende değildim.','Dün akşam değirmendeydim.']){
      const r=await kur(()=>json(c)).soyle(g);
      expect(r.kaynak,c).toBe('kalip');
    }
  });
  it('zaman aşımı kalıba düşer ve önbelleğe girmez',async()=>{
    let n=0;
    const yz=kur(()=>{n++; return json('Dün gece değirmendeydim.');},{gecikme:300,zamanAsimi:50});
    const r=await yz.soyle(g);
    expect(r).toMatchObject({kaynak:'kalip',metin:g.kalip,neden:'zaman aşımı'});
    await yz.soyle(g);
    expect(n).toBe(0); // iptal edildi; ikinci istek de yeniden denendi (önbellekte değil)
  });
  it('hata veren arka uç kalıba düşer',async()=>{
    const r=await kur(()=>{throw new Error('bağlantı yok');}).soyle(g);
    expect(r).toMatchObject({kaynak:'kalip',metin:g.kalip});
  });
  it('aynı istek önbellekten gelir',async()=>{
    const uc=sahte(()=>json('Dün gece değirmendeydim beyim.'));
    const yz=yzKur({arkaUc:uc,kisiler:KISILER});
    const a=await yz.soyle(g), b=await yz.soyle(g);
    expect(uc.cagrilar.length).toBe(1);
    expect(a.kaynak).toBe('yz'); expect(b.kaynak).toBe('onbellek'); expect(b.metin).toBe(a.metin);
    await yz.soyle({...g,anahtar:'77|2|yer:0'}); // başka döngü: yeni istek
    expect(uc.cagrilar.length).toBe(2);
  });
  it('arka uç null iken her şey kalıp',async()=>{
    const yz=yzKur({arkaUc:null});
    expect(yz.acik).toBe(false);
    expect(await yz.soyle(g)).toMatchObject({kaynak:'kalip',metin:g.kalip});
    expect(await yz.soruEsle({metin:'dün gece neredeydin',adaylar:[{id:'yer:0',etiket:'Dün gece neredeydin?'}]})).toMatchObject({id:'yok'});
    const k=await yz.kacamak({kisi:'kazim',metin:'hava nasıl'});
    expect(k.kaynak).toBe('kalip'); expect(k.metin.length).toBeGreaterThan(3);
  });
  it('istem: söz, soru ve tavır istemde; sır yok',()=>{
    const m=istemKur({...g,kisiVeri:KISILER.kazim,tepki:{gozKacirma:true}});
    expect(m[1].content).toContain(g.kalip);
    expect(m[1].content).toContain('yüzüne bakmadan');
    expect(m[0].content).not.toMatch(/SAKLADIĞIN/);
  });
});

describe('masum sıkı, suçlu gevşek denetlenir',()=>{
  // Aynı soru: "Dün gece neredeydin?" İkisi de aynı cümleyi kuruyor: kendi yeri + başkasını suçlama.
  const soru='Dün gece neredeydin?';
  const suclayan="Dün gece su değirmenindeydim. Asıl Kör Halil'e sorun, o gece ortalıkta dolanıyordu.";
  const masum={kisi:'kazim',soru,kalip:'Dün gece su değirmenindeydim.',tavir:'dogru',gerginlik:.1};
  const katil={kisi:'kazim',soru,kalip:'Dün gece su değirmenindeydim.',tavir:'yalan',gerginlik:.6,
    yalan:{saklanan:["Dün gece çeşme başında Hacı Ağa'yı sen öldürdün."],mazeret:['dün gece su değirmeninde'],hedefler:['Kör Halil']}};
  it('masumun cevabında uydurma ad reddedilir',async()=>{
    const r=await kur(()=>json(suclayan)).soyle(masum);
    expect(r.kaynak).toBe('kalip'); expect(r.neden).toMatch(/Kör Halil/);
  });
  it('katilin başka birini suçlaması kabul edilir',async()=>{
    const r=await kur(()=>json(suclayan)).soyle(katil);
    expect(r).toMatchObject({kaynak:'yz',metin:suclayan});
  });
  it('katilin cevabında mazeret yeri düşerse reddedilir',async()=>{
    const r=await kur(()=>json("Dün gece evdeydim. Asıl Kör Halil'e sorun.")).soyle(katil);
    expect(r.kaynak).toBe('kalip'); expect(r.neden).toMatch(/düşmüş/);
  });
  it('katil zamanı düşüremez, itiraf edemez, sakladığını ağzına alamaz',()=>{
    const d=c=>cevapDenetle({cevap:c,kalip:katil.kalip,soru,kisi:'kazim',gevsek:true,saklanan:katil.yalan.saklanan[0]});
    expect(d('Su değirmenindeydim, nerede olacağım?').tamam).toBe(false);
    expect(d('Dün gece su değirmenindeydim; tamam, ben öldürdüm.').tamam).toBe(false);
    expect(d('Dün gece su değirmenindeydim, çeşme başına hiç gitmedim.').tamam).toBe(false);
    expect(d('Dün gece su değirmenindeydim, un öğütüyordum, sabaha kadar başından ayrılmadım.').tamam).toBe(true);
  });
  it('sır ve gerçek yalnızca yalan söyleyen suçlunun istemine gider',()=>{
    expect(istemKur({...katil,kisiVeri:KISILER.kazim})[0].content).toMatch(/SAKLADIĞIN GERÇEK[\s\S]*Kör Halil/);
    // tavır doğruysa yalan bilgisi gelse bile istemde yer almaz
    expect(istemKur({...katil,tavir:'dogru',kisiVeri:KISILER.kazim})[0].content).not.toMatch(/SAKLADIĞIN|Hacı Ağa/);
  });
});

describe('soruEsle',()=>{
  const adaylar=[{id:'yer:0',etiket:'Dün gece neredeydin?'},{id:'gordu:0',etiket:'Dün gece bir şey gördün mü?'},{id:'iliski:mahmut',etiket:"Hacı Ağa'yla aran nasıldı?"}];
  const esleyen=kod=>kur(()=>JSON.stringify({soru:kod}));
  it('listedeki koda eşler; istem enum şemasıyla gider',async()=>{
    const uc=sahte(()=>JSON.stringify({soru:'s3'}));
    const yz=yzKur({arkaUc:uc});
    const r=await yz.soruEsle({metin:"Hacı Ağa'yı sevmez miydin?",adaylar,kisi:'kazim'});
    expect(r).toMatchObject({id:'iliski:mahmut',kaynak:'yz'});
    expect(uc.cagrilar[0].secenek.sema.properties.soru.enum).toEqual(['s1','s2','s3','yok']);
    expect(eslemeIstemiKur({metin:'x',adaylar})[1].content).toContain('s2: Dün gece bir şey gördün mü?');
  });
  it('listede olmayan kod "yok" olur',async()=>{
    expect((await esleyen('s9').soruEsle({metin:'katil sen misin',adaylar})).id).toBe('yok');
    expect((await esleyen('fail:c1').soruEsle({metin:'katil sen misin',adaylar})).id).toBe('yok');
    expect((await esleyen('yok').soruEsle({metin:'hava nasıl',adaylar})).id).toBe('yok');
  });
  it('gerçek kimliği yazarsa da kabul edilir; aynı soru önbellekten',async()=>{
    const uc=sahte(()=>JSON.stringify({soru:'yer:0'}));
    const yz=yzKur({arkaUc:uc});
    expect((await yz.soruEsle({metin:'Dün gece neredeydin',adaylar})).id).toBe('yer:0');
    expect((await yz.soruEsle({metin:'dün gece neredeydin',adaylar})).kaynak).toBe('onbellek');
    expect(uc.cagrilar.length).toBe(1);
  });
  it('kaçamak cevap ad içeremez',async()=>{
    const a=await kur(()=>json('Bunu bana niye soruyorsun beyim?')).kacamak({kisi:'kazim',metin:'hava nasıl'});
    expect(a.kaynak).toBe('yz');
    const b=await kur(()=>json("Onu Kör Halil'e sor.")).kacamak({kisi:'kazim',metin:'hava nasıl'});
    expect(b.kaynak).toBe('kalip'); expect(b.metin).not.toMatch(/Halil/);
  });
});

describe('önerilen sorular',()=>{
  const q=(id,tur,oncelik)=>({id,tur,oncelik,etiket:id});
  const l=[q('yuzlesme:k1','yuzlesme',100),q('yer:5','yer',80),q('gordu:5','gordu',74),q('baskasi:a:5','baskasi',60),q('iz:i1','iz',64),q('fail:c1','fail',44)];
  it('en çok 3; yüzleşme önce, sonra yeni açılan, sonra cinayet anı',()=>{
    const {oneri,diger}=onerilenSorular(l,new Set(l.map(x=>x.id).filter(x=>x!=='fail:c1')));
    expect(oneri.map(x=>x.id)).toEqual(['yuzlesme:k1','fail:c1','yer:5']);
    expect(diger.length).toBe(3);
    expect(onerilenSorular(l,null).oneri.map(x=>x.id)).toEqual(['yuzlesme:k1','yer:5','gordu:5']);
  });
});
