// Yalan kuralları: bir kişinin bir olgu hakkında ne söyleyeceği.
// Yalnızca vaka nesnesini okur (düz veri); köy verisine ya da rastgeleliğe ihtiyaç duymaz.
// Aynı (vaka, kişi, olgu) her zaman aynı cevabı verir.
//
// Olgular:
//   {tur:'konum',  kisi, zaman}   kisi o dilimde neredeydi?            gercek: mekan | null (ölü)
//   {tur:'gorulen', zaman}        konuşan o dilimde kimi gördü/duydu?   gercek: [{kisi, mekan, kesinlik, ortu?, ses?}]
//   {tur:'fail',   cinayet}       bu cinayeti kim işledi?               gercek: katil
//   {tur:'esya',   iz}            bu iz kimin?                          gercek: izin sahibi
//   {tur:'sir',    sahip, sir}    bu sır doğru mu?                      gercek: true
//   {tur:'fark',   cinayet}       o cinayetten sonra tuhaf bir şey fark ettin mi? (konuşanın fark ettiği dolaylı izler)
//                                 gercek: [{iz, alt, kisi, esya?, ortu?, zaman, mekan}]
// Tavırlar: dogru | yalan | susar | abarti | bilmez (bilgisi yok) | olu (sorgu günü ölmüştü)

import {SEVEN,GIZLI_NEDEN_ONEKLERI} from './tablolar.js';

const SIDDET={bilmez:0,dogru:0,abarti:1,susar:2,yalan:3};
const onbellek=new WeakMap();

export function ifadeMotoru(vaka){
  if(onbellek.has(vaka)) return onbellek.get(vaka);
  const dilimler=vaka.ayar.dilimler, D=dilimler.length, dilim=t=>dilimler[t%D];
  const ids=Object.keys(vaka.kisiler).sort(), K=vaka.kisiler;
  const relMap={};
  for(const i of vaka.iliskiler) ((relMap[i.kimden]??={})[i.kime]??=[]).push(i.tur);
  const rel=(a,b)=>relMap[a]?.[b]||[];
  const masumYer=(id,dl)=>(dl==='gece'||dl==='aksam'||!K[id].is)?K[id].ev:K[id].is;
  const izById=Object.fromEntries(vaka.izler.map(i=>[i.id,i]));
  const cinById=Object.fromEntries(vaka.cinayetler.map(c=>[c.id,c]));
  const olayById=Object.fromEntries(vaka.olaylar.map(o=>[o.id,o]));
  const tanikIzleri=vaka.izler.filter(i=>i.tur==='tanik');
  const yoklukIzleri=vaka.izler.filter(i=>i.alt==='gece-yoklugu');
  const dolayliIzler=vaka.izler.filter(i=>i.tur==='dolayli');
  const farkKaydi=i=>({iz:i.id,alt:i.alt,kisi:i.kisi,...(i.esya?{esya:i.esya}:{}),...(i.ortu?{ortu:i.ortu}:{}),zaman:i.zaman,mekan:i.mekan});
  const sirBul=(sahip,id)=>vaka.sirlar.find(s=>s.sahip===sahip&&s.id===id);
  const katilMi=k=>vaka.cinayetler.some(c=>c.katil===k||c.yardimci===k);
  // k, x'in eşyasını tanır mı? (aynı ev, herhangi bir yakınlık, aynı iş yeri, komşu ev)
  const tanir=(k,x)=>{
    if(k===x) return true;
    const a=K[k], b=K[x];
    if(a.ev===b.ev||rel(k,x).length||rel(x,k).length) return true;
    if(a.is&&(a.is===b.is||a.is===b.ev)) return true;
    if(b.is&&b.is===a.ev) return true;
    return (vaka.harita[a.ev]||[]).includes(b.ev);
  };

  // Y'nin t anındaki "beyanı": cinayet için hazırlanmış mazeret ya da olağan yeri.
  const iddia=(Y,t)=>{
    for(const c of vaka.cinayetler) if(c.zaman===t&&c.iddialar[Y]) return c.iddialar[Y];
    return masumYer(Y,dilim(t));
  };
  const uyanik=(k,t)=>dilim(t)!=='gece'||vaka.neden[k][t]!=='ev';
  // Y'nin t anında bulunduğu yer onu zora sokar mı? (gizli iş, hırsızlık, olay yerinde olmak)
  const konumSucu=(Y,t)=>{
    const g=vaka.cizelge[Y][t]; if(g==null) return false;
    const n=vaka.neden[Y][t]||'';
    if(GIZLI_NEDEN_ONEKLERI.some(p=>n.startsWith(p))) return true;
    return vaka.cinayetler.some(c=>c.zaman===t&&c.mekan===g&&c.kurban!==Y);
  };
  // Gece olay yerinde yalnızca silüet görüldüyse yan yana olmak kimliği bildirmez.
  const siluet=(k,Y,t)=>tanikIzleri.some(i=>i.tanik===k&&i.gorulen===Y&&i.zaman===t&&i.kesinlik==='siluet');

  function bilgi(k,o){
    switch(o.tur){
      case 'konum':{
        const g=vaka.cizelge[o.kisi]?.[o.zaman], ky=vaka.cizelge[k]?.[o.zaman];
        if(g===undefined) return null;
        if(k===o.kisi) return g==null?null:{deger:g};
        if(ky==null) return null;
        // Örten ve zorlayan, cinayet anında katilin nerede olduğunu bilir (suça ortaktır).
        if(vaka.cinayetler.some(c=>c.katil===o.kisi&&c.zaman===o.zaman&&(c.ortan===k||c.zorlayan===k))) return {deger:g};
        if(g!=null&&ky===g&&!siluet(k,o.kisi,o.zaman)) return {deger:g};
        const s=tanikIzleri.find(i=>i.tanik===k&&i.gorulen===o.kisi&&i.zaman===o.zaman&&i.kesinlik==='yuz');
        if(s) return {deger:s.mekan};
        const y=yoklukIzleri.find(i=>i.fark_eden===k&&i.kisi===o.kisi&&i.zaman===o.zaman);
        if(y) return {degil:y.mekan};
        if(g!=null&&iddia(o.kisi,o.zaman)===ky&&uyanik(k,o.zaman)) return {degil:ky};
        return null;
      }
      case 'gorulen':{
        const t=o.zaman, ky=vaka.cizelge[k]?.[t];
        if(ky==null) return null;
        const l=[];
        for(const id of ids) if(id!==k&&vaka.cizelge[id][t]===ky&&!siluet(k,id,t)) l.push({kisi:id,mekan:ky,kesinlik:'yuz'});
        for(const i of tanikIzleri){
          if(i.tanik!==k||i.zaman!==t) continue;
          if(i.gorulen&&!l.some(x=>x.kisi===i.gorulen)) l.push({kisi:i.gorulen,mekan:i.mekan,kesinlik:i.kesinlik,ortu:i.ortu});
          if(!i.gorulen) l.push({kisi:null,mekan:i.mekan,kesinlik:null,ses:i.anahtar});
        }
        return {deger:l};
      }
      case 'fail':{
        const c=cinById[o.cinayet]; if(!c) return null;
        if([c.katil,c.yardimci,c.ortan,c.zorlayan].includes(k)) return {deger:c.katil};
        if(tanikIzleri.some(i=>i.cinayet===c.id&&i.tanik===k&&i.gorulen===c.katil&&i.kesinlik==='yuz')) return {deger:c.katil};
        return null;
      }
      case 'esya':{
        const iz=izById[o.iz]; if(!iz||!iz.sahip) return null;
        if(k===iz.sahip) return {deger:iz.sahip};
        const L=iz.adaylar||[iz.sahip];
        // Giysinin lifi herkesin gözü önündedir; dedikoducu herkesin malını bilir. Öbür eşyayı yalnızca sahibini
        // tanıyan bilir (ev halkı, yakını, komşusu, iş arkadaşı); bildiği adaylar eksik olabilir.
        if((iz.ortu&&!iz.esya)||K[k].mizac==='dedikoducu') return {adaylar:[...L]};
        const bilir=L.filter(x=>tanir(k,x));
        return bilir.length?{adaylar:bilir}:null;
      }
      case 'sir':{
        const s=sirBul(o.sahip,o.sir); if(!s) return null;
        return k===s.sahip||s.kimler.includes(k)?{deger:true}:null;
      }
      case 'fark':{
        if(!cinById[o.cinayet]) return null;
        return {deger:dolayliIzler.filter(i=>i.cinayet===o.cinayet&&i.fark_eden===k).map(farkKaydi)};
      }
    }
    return null;
  }

  function gercek(o){
    switch(o.tur){
      case 'konum': return vaka.cizelge[o.kisi]?.[o.zaman]??null;
      case 'fail': return cinById[o.cinayet]?.katil??null;
      case 'esya': return izById[o.iz]?.sahip??null;
      case 'sir': return !!sirBul(o.sahip,o.sir);
    }
    return null;
  }
  const farkGercegi=(k,o)=>dolayliIzler.filter(i=>i.cinayet===o.cinayet&&i.fark_eden===k).map(farkKaydi);

  // Olgunun konusu (kimin aleyhine olabilir) ve gerçekten aleyhte mi.
  function konu(o){
    switch(o.tur){
      case 'konum': return {kisi:o.kisi,aleyhte:konumSucu(o.kisi,o.zaman)};
      case 'fail': return {kisi:cinById[o.cinayet]?.katil,aleyhte:true};
      case 'esya': return {kisi:izById[o.iz]?.sahip,aleyhte:true};
      case 'sir': return {kisi:o.sahip,aleyhte:true};
    }
    return {kisi:null,aleyhte:false};
  }

  // Olgu k'nin kendi suçuna mı dokunuyor? (o cinayetin anı, öncesindeki hırsızlık, olay yerindeki izi)
  function sucunaDokunur(k,o){
    for(const c of vaka.cinayetler){
      if(c.katil!==k&&c.yardimci!==k) continue;
      const rol=c.katil===k?'katil':'suc-ortagi';
      if(o.tur==='fail'&&o.cinayet===c.id) return rol;
      if(o.tur==='esya'&&izById[o.iz]?.cinayet===c.id) return rol;
      if(o.tur==='konum'||o.tur==='gorulen'){
        if(o.zaman===c.zaman) return rol;
        const n=vaka.neden[k][o.zaman]||'';
        if((n.startsWith('hirsizlik:')||n.startsWith('ot-alma:'))&&olayById[n.split(':')[1]]?.cinayet===c.id) return rol;
      }
    }
    return null;
  }

  function kendiTavri(k,o){
    const rol=sucunaDokunur(k,o);
    if(rol) return {tavir:'yalan',kural:rol==='katil'?'katil':'suc-ortagi'};
    if(katilMi(k)) return {tavir:'yalan',kural:'katil-inkar'}; // katil, kendi cinayeti dışında da şüphe çeken her şeyi inkâr eder
    const mz=K[k].mizac;
    const n=o.tur==='konum'||o.tur==='gorulen'?(vaka.neden[k][o.zaman]||''):'';
    if(o.tur==='sir'||n.startsWith('sir:')||n.startsWith('ortaklik:')){
      if(mz==='saf') return {tavir:'dogru',kural:'sir-saklama'};
      if(mz==='korkak'||mz==='sakin') return {tavir:'susar',kural:'sir-saklama'};
      return {tavir:'yalan',kural:'sir-saklama'};
    }
    if(o.tur==='esya'){
      if(mz==='korkak') return {tavir:'susar',kural:'masum-esya'};
      if(mz==='kurnaz') return {tavir:'yalan',kural:'masum-esya'};
      return {tavir:'dogru',kural:'masum-esya'};
    }
    if(mz==='korkak') return {tavir:'susar',kural:'olay-yerinde'};
    return {tavir:'dogru',kural:'olay-yerinde'};
  }

  function baskaTavri(k,Y,o){
    const ilgiliCinayet=c=>o.tur==='fail'||o.tur==='fark'?o.cinayet===c.id:(o.tur==='konum'||o.tur==='gorulen')?o.zaman===c.zaman:o.tur==='esya'?izById[o.iz]?.cinayet===c.id:false;
    if(vaka.baglar.some(b=>b.tur==='ortme'&&b.ortan===k&&b.ortulen===Y&&vaka.cinayetler.some(c=>c.katil===Y&&ilgiliCinayet(c)))) return {tavir:'yalan',kural:'ortme'};
    for(const b of vaka.baglar){
      if(b.tur==='santaj'&&b.zorlayan===k&&b.zorlanan===Y) return {tavir:'susar',kural:'santaj'};
      if(b.tur==='santaj'&&b.zorlanan===k&&b.zorlayan===Y) return {tavir:'susar',kural:'santaj-korkusu'};
    }
    if(vaka.cinayetler.some(c=>(c.katil===k&&c.yardimci===Y)||(c.katil===Y&&c.yardimci===k))) return {tavir:'yalan',kural:'suc-ortagi'};
    const r=rel(k,Y), mz=K[k].mizac;
    if(r.some(t=>SEVEN.includes(t))) return mz==='korkak'||mz==='saf'?{tavir:'susar',kural:'seven-korur'}:{tavir:'yalan',kural:'seven-korur'};
    if(r.includes('borclu')) return {tavir:'susar',kural:'borclu'};
    if(r.includes('korkar')) return {tavir:'susar',kural:'korku'};
    if(r.includes('ortak')) return {tavir:'susar',kural:'suc-ortakligi'};
    if(r.includes('dost')) return {tavir:'susar',kural:'dostluk'};
    if(mz==='korkak') return {tavir:'susar',kural:'korkak'};
    if(r.includes('hasim')) return {tavir:'abarti',kural:'husumet'};
    if(mz==='dedikoducu') return {tavir:'abarti',kural:'dedikoducu'};
    return {tavir:'dogru',kural:null};
  }

  function tavirBul(k,o,kisi,aleyhte){
    if(!aleyhte){
      if(K[k].mizac==='dedikoducu'&&kisi!==k&&(o.tur==='konum'||o.tur==='gorulen')) return {tavir:'abarti',kural:'dedikoducu'};
      return {tavir:'dogru',kural:null};
    }
    return kisi===k?kendiTavri(k,o):baskaTavri(k,kisi,o);
  }

  // Dedikoducu silüete isim koyar: aynı örtüyü giyenlerden hasmını ya da ilkini.
  const tahmin=(k,ortu,t)=>{
    const l=ids.filter(x=>x!==k&&K[x].ortu===ortu&&vaka.cizelge[x][t]!=null);
    return l.find(x=>rel(k,x).includes('hasim'))||l[0]||null;
  };
  // Katilin suçu atacağı kişi: o cinayetten sonra hâlâ yaşayan bir hasmı.
  const hasimi=(k,c)=>ids.find(x=>x!==k&&x!==c.kurban&&rel(k,x).includes('hasim')&&vaka.cizelge[x][c.zaman]!=null)||null;

  function ifade(k,o,secenek={}){
    const cevap=(tavir,kural,b,soylenen,g)=>({konusan:k,olgu:o,tavir,kural:kural??null,gercek:g,bilgi:b??null,soylenen:soylenen??null,gerginlik:gerginlik(k,o,tavir,kural)});
    const g=gercek(o);
    if(secenek.gun!=null){
      const sorgu=(secenek.gun-1)*D+Math.max(0,dilimler.indexOf('sabah'));
      if(K[k].olum!=null&&K[k].olum<sorgu) return cevap('olu','olu',null,null,g);
      if(o.zaman!=null&&o.zaman>=sorgu) return cevap('bilmez','gelecek',null,null,g);
    }
    if(o.tur==='fark'){
      const sorgu=secenek.gun!=null?(secenek.gun-1)*D+Math.max(0,dilimler.indexOf('sabah')):Infinity;
      return farkIfadesi(k,o,sorgu,cevap);
    }
    const b=bilgi(k,o);
    if(o.tur==='gorulen') return gorulenIfadesi(k,o,b,cevap);
    if(!b) return cevap('bilmez',null,null,null,g);
    const {kisi,aleyhte}=konu(o);
    const {tavir,kural}=tavirBul(k,o,kisi,aleyhte);
    if(tavir==='susar') return cevap('susar',kural,b,null,g);
    if(tavir==='dogru') return cevap('dogru',kural,b,b,g);
    if(tavir==='abarti'){
      const ab=o.tur==='konum'?{tur:'ek-ayrinti'}:o.tur==='sir'?{tur:'ek-ayrinti'}:{tur:'kesinlik'};
      return cevap('abarti',kural,b,{...b,abarti:ab},g);
    }
    // yalan
    let s;
    if(o.tur==='konum') s={deger:iddia(o.kisi,o.zaman)};
    else if(o.tur==='fail') s={deger:k===g?hasimi(k,cinById[o.cinayet]):null};
    else if(o.tur==='esya') s={deger:(b.adaylar||izById[o.iz].adaylar||[]).find(x=>x!==izById[o.iz].sahip)??null};
    else s={deger:false};
    if(o.tur==='konum'&&s.deger===b.deger) return cevap('dogru',kural,b,b,g); // söylediği doğru, yalnızca eksik
    return cevap('yalan',kural,b,s,g);
  }

  function gorulenIfadesi(k,o,b,cevap){
    if(!b) return cevap('bilmez',null,null,null,null);
    const t=o.zaman;
    if(konumSucu(k,t)){
      const kt=kendiTavri(k,{tur:'konum',kisi:k,zaman:t});
      if(kt.tavir==='yalan') return cevap('yalan',kt.kural,b,{deger:[]},b.deger);
      if(kt.tavir==='susar') return cevap('susar',kt.kural,b,null,b.deger);
    }
    let en='dogru', kural=null;
    const soylenen=[];
    const mz=K[k].mizac;
    for(const e of b.deger){
      // Silüeti kimin olduğunu bilmeden korumaz: yalnızca korkaklık ve dedikodu işler.
      const {tavir,kural:kr}=!e.kisi?{tavir:'dogru',kural:null}
        :e.kesinlik==='siluet'?(!konumSucu(e.kisi,t)?{tavir:'dogru',kural:null}:mz==='korkak'?{tavir:'susar',kural:'korkak'}:mz==='dedikoducu'?{tavir:'abarti',kural:'dedikoducu'}:{tavir:'dogru',kural:null})
        :tavirBul(k,o,e.kisi,konumSucu(e.kisi,t));
      if(SIDDET[tavir]>SIDDET[en]){en=tavir; kural=kr;}
      if(tavir==='dogru') soylenen.push(e);
      else if(tavir==='abarti'){
        const ek=e.kesinlik==='siluet'?{tur:'kesinlik',tahmin:tahmin(k,e.ortu,t)}:{tur:'ek-ayrinti'};
        soylenen.push({...e,abarti:ek});
      }
    }
    if(en==='susar'&&!soylenen.length) return cevap('susar',kural,b,null,b.deger);
    return cevap(en,kural,b,{deger:soylenen},b.deger);
  }

  // Fark ettikleri: her kayıt, konusu olan kişi (kisi) hakkında aleyhte bir olgudur; yalan kuralı kayıt kayıt işler.
  // Sorgu gününe kadar fark edilmemiş olan söylenmez. Kendi aletinin çalındığını söylemek kimsenin aleyhine değildir.
  // Yalan ve susma kaydı listeden çıkarır (uydurma iz yoktur); abartı kayda ek ayrıntı koyar.
  function farkIfadesi(k,o,sorgu,cevap){
    const tum=bilgi(k,o);
    if(!tum) return cevap('bilmez',null,null,null,farkGercegi(k,o));
    const b={deger:tum.deger.filter(x=>x.zaman<sorgu)};
    const g=b.deger;
    if(!g.length) return cevap('dogru',null,b,b,g);
    let en='dogru', kural=null; const soylenen=[];
    for(const e of g){
      const {tavir,kural:kr}=e.kisi===k?{tavir:'dogru',kural:null}:tavirBul(k,o,e.kisi,true);
      if(SIDDET[tavir]>SIDDET[en]){en=tavir; kural=kr;}
      if(tavir==='dogru') soylenen.push(e);
      else if(tavir==='abarti') soylenen.push({...e,abarti:{tur:'ek-ayrinti'}});
    }
    if(en==='susar'&&!soylenen.length) return cevap('susar',kural,b,null,g);
    return cevap(en,kural,b,{deger:soylenen},g);
  }

  function gerginlik(k,o,tavir,kural){
    let g=.1;
    if(katilMi(k)) g+=.35;
    if(tavir==='yalan') g+=.25; else if(tavir==='susar') g+=.15; else if(tavir==='abarti') g+=.05;
    if(kural==='sir-saklama'||kural==='olay-yerinde'||kural==='masum-esya') g+=.15;
    if(K[k].mizac==='korkak') g+=.1;
    if(K[k].mizac==='sakin'||K[k].mizac==='gururlu') g-=.05;
    return Math.round(Math.max(0,Math.min(1,g))*100)/100;
  }

  const m={ifade,bilgi,gercek,iddia,konumSucu,tanir,
    // Yan bilgi için: k, Y'nin aleyhine bir şeyi söyler mi? (tavır ve kural; olgu bir cinayete bağlı değil)
    tavir:(k,Y,aleyhte=true)=>tavirBul(k,{tur:'yan'},Y,aleyhte)};
  onbellek.set(vaka,m);
  return m;
}

// Kolay giriş: ifade(vaka, 'cemil', {tur:'konum', kisi:'cemil', zaman:12}, {gun:3})
export const ifade=(vaka,kisi,olgu,secenek)=>ifadeMotoru(vaka).ifade(kisi,olgu,secenek);

// Vakaya yazılan önemli ifadeler: her cinayet anında herkesin kendi yeri, tanıkların gördükleri,
// faili bilenlerin cevabı, olay yerindeki eşyanın sahibinin cevabı, örtenin ifadesi.
export function onemliIfadeler(vaka){
  const mt=ifadeMotoru(vaka), l=[], ids=Object.keys(vaka.kisiler).sort();
  const ekle=(k,o)=>l.push(mt.ifade(k,o));
  for(const c of vaka.cinayetler){
    for(const k of ids) if(vaka.cizelge[k][c.zaman]!=null&&k!==c.kurban) ekle(k,{tur:'konum',kisi:k,zaman:c.zaman});
    const tanik=new Set(vaka.izler.filter(i=>i.cinayet===c.id&&i.tur==='tanik').map(i=>i.tanik));
    for(const k of [...tanik].sort()) ekle(k,{tur:'gorulen',zaman:c.zaman});
    for(const k of ids) if(k!==c.kurban&&mt.bilgi(k,{tur:'fail',cinayet:c.id})) ekle(k,{tur:'fail',cinayet:c.id});
    for(const i of vaka.izler) if(i.cinayet===c.id&&i.tur==='fiziksel'&&i.sahip&&i.sahip!==c.kurban&&vaka.cizelge[i.sahip][c.zaman]!=null) ekle(i.sahip,{tur:'esya',iz:i.id});
    if(c.ortan) ekle(c.ortan,{tur:'konum',kisi:c.katil,zaman:c.zaman});
  }
  return l;
}
