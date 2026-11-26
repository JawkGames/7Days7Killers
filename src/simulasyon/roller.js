// Roller: kim katil, kimi neden öldürür, katiller birbirine nasıl bağlı.
// Sebepler uydurulmaz; kişilerin sırlarından ve ilişkilerinden okunur (tablolar.js).
// Olay çekirdekleri yalnızca var olan sebebin ağırlığını artırır, yeni sebep yaratmaz.

import {SIR_SAHIP,SIR_ILGILI,SIR_ROLU,ILISKI_SEBEP,MIZAC_KATIL,YAKINLIK,TEHLIKELI} from './tablolar.js';
import {UretimHatasi} from './zar.js';

const yuvarla=x=>Math.round(x*100)/100;
const ayniKaynak=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// P'nin kendi tehlikeli bir sırrı, T'nin sırrının içindekilerle kesişiyor mu?
// (Kapı dinleyen hizmetçi ancak dinlenen sırrın sahibi için tehlikelidir.)
function tehditAltinda(d,P,T,s){
  const hedef=new Set([...s.kimler,T]); hedef.delete(P);
  return d.sirlariOf(P).some(ps=>TEHLIKELI.includes(ps.tur)&&ps.kimler.some(k=>hedef.has(k)));
}

// Döner: Map 'katil|kurban' -> {katil, kurban, agirlik, sebepler:[{tur, agirlik, kaynak}]}
// kaynak: {tur:'sir', sahip, sir} | {tur:'iliski', iliski} | {tur:'rekabet', uzerine} | {tur:'koruma', korunan, iliski?|sir?}
export function sebepAdaylari(d){
  const m=new Map();
  const ekle=(P,T,tur,w,kaynak,yakinlikSay=true)=>{
    if(P===T||!(w>0)||!d.kisi(P)||!d.kisi(T)) return;
    if(yakinlikSay) w*=d.yakinlik(P,T,YAKINLIK);
    if(w<.05) return;
    const k=P+'|'+T;
    let c=m.get(k);
    if(!c){c={katil:P,kurban:T,agirlik:0,sebepler:[]}; m.set(k,c);}
    if(c.sebepler.some(s=>s.tur===tur&&ayniKaynak(s.kaynak,kaynak))) return;
    c.sebepler.push({tur,agirlik:yuvarla(w),kaynak}); c.agirlik=yuvarla(c.agirlik+w);
  };
  for(const s of d.sirlar){
    const kaynak={tur:'sir',sahip:s.sahip,sir:s.id};
    const A=SIR_SAHIP[s.tur], rol=s.rol||SIR_ROLU[s.id]||'fail';
    if(A) for(const T of s.kimler){
      const olumsuz=d.rel(s.sahip,T).some(t=>t==='hasim'||t==='korkar');
      const olumlu=d.rel(s.sahip,T).length>0&&!olumsuz;
      if(rol==='tanik'){if(olumsuz) ekle(s.sahip,T,'intikam',A.agirlik+1,kaynak);}
      else if(rol==='magdur'){if(!olumlu) ekle(s.sahip,T,'intikam',A.agirlik+1,kaynak);}
      else if(A.intikamOlur&&olumsuz) ekle(s.sahip,T,'intikam',A.agirlik+1,kaynak);
      else ekle(s.sahip,T,A.sebep,A.agirlik,kaynak);
    }
    const B=SIR_ILGILI[s.tur];
    if(B) for(const P of s.kimler){
      if(B.tehdit&&!tehditAltinda(d,P,s.sahip,s)) continue;
      // Cezalandırma ve ihanet ancak arada dostluk yoksa: kaçağın koyununu kesen çoban, kaçağın düşmanı değildir.
      if((B.sebep==='ceza'||B.sebep==='ihanet')&&d.rel(P,s.sahip).some(t=>!['hasim','korkar','isveren','calisan'].includes(t))) continue;
      ekle(P,s.sahip,B.sebep,B.agirlik,kaynak);
    }
  }
  for(const P of d.ids) for(const i of d.iliskiler[P]){
    const C=ILISKI_SEBEP[i.tur];
    if(C) ekle(P,i.kime,C.sebep,C.agirlik,{tur:'iliski',iliski:i.tur},C.sebep!=='korku'); // korkan eş, yakınlıkla yumuşamaz
  }
  // Rekabet: P'nin sevdiği ya da sözlüsü X; X'in sevgilisi/sözlüsü/ona sevdalı olan T.
  for(const P of d.ids) for(const i of d.iliskiler[P]){
    if(!['sevgili','sever','sozlu'].includes(i.tur)) continue;
    for(const j of d.iliskiler[i.kime]){
      if(j.kime===P) continue;
      let w=0;
      if(j.tur==='sevgili') w=3;
      else if(j.tur==='sozlu') w=i.tur==='sozlu'?0:2;
      else if(j.tur==='sevilen') w=i.tur==='sozlu'?.4:.6;
      // Gönlü başkasında olan sözlü, namus için pek öldürmez.
      if(i.tur==='sozlu'&&d.iliskiler[P].some(r=>(r.tur==='sevgili'||r.tur==='sever')&&r.kime!==i.kime)) w*=.2;
      if(w) ekle(P,j.kime,i.tur==='sozlu'?'namus':'kiskanclik',w,{tur:'rekabet',uzerine:i.kime});
    }
  }
  // Koruma: P'nin koruduğu X'i korkutan, X'e hasım olan ya da X'in sırrını açabilecek T.
  for(const P of d.ids) for(const i of d.iliskiler[P]){
    if(!['es','ebeveyn','cocuk','korur','sevgili'].includes(i.tur)) continue;
    const X=i.kime;
    if(d.rel(P,X).includes('korkar')) continue; // korktuğu adamı korumak için kimse öldürmez
    for(const j of d.iliskiler[X]){
      if(j.kime===P) continue;
      if(j.tur==='korkar') ekle(P,j.kime,'koruma',2,{tur:'koruma',korunan:X,iliski:'korkar'});
      else if(j.tur==='hasim') ekle(P,j.kime,'koruma',1.2,{tur:'koruma',korunan:X,iliski:'hasim'});
    }
    for(const s of d.sirlar){
      if(s.sahip===P||s.sahip===X||!s.kimler.includes(X)) continue;
      if(['intikam','ihbar','santaj','bilgi'].includes(s.tur)&&tehditAltinda(d,X,s.sahip,s))
        ekle(P,s.sahip,'koruma',1.5,{tur:'koruma',korunan:X,sir:{sahip:s.sahip,sir:s.id}});
    }
  }
  return m;
}

// Bir çiftin sebeplerini ana sebep + ek sebepler biçimine indirir.
function sebepOzet(c){
  const l=[...c.sebepler].sort((a,b)=>b.agirlik-a.agirlik);
  return {tur:l[0].tur,agirlik:c.agirlik,kaynak:l[0].kaynak,ek:l.slice(1).map(s=>({tur:s.tur,kaynak:s.kaynak}))};
}

// İki kişi arasında suç birliğine yetecek bir yakınlık ya da birlikte taşıdıkları bir sır var mı?
// (İhbar, intikam, tanıklık gibi karşı karşıya oldukları sırlar birlik kurmaz.)
const ORTAK_SIR=['kacakcilik','rusvet','yolsuzluk','tefecilik','para','firar','gasp','eski-yangin','soy','hirsizlik','yasak-ask','miras','husumet'];
function bagKurulur(d,A,B){
  const r=[...d.rel(A,B),...d.rel(B,A)];
  if(r.some(t=>t==='hasim'||t==='korkar')) return false;
  if(r.some(t=>['ortak','es','dost','ebeveyn','cocuk','sevgili','korur','korunan','sever','sevilen'].includes(t))) return true;
  return d.sirlar.some(s=>ORTAK_SIR.includes(s.tur)&&((s.sahip===A&&s.kimler.includes(B))||(s.sahip===B&&s.kimler.includes(A))));
}

// Döner: {katiller:[{kisi, kurban, sebep, zorlayan, yardimci, ortan, cekirdek}], baglar:[...]}
export function rolleriSec(d,z,ciftler,cekirdekler){
  const {katilSayisi:K,oranlar}=d.ayar;
  const carpan=new Map(), cekirdekCifti=new Map();
  for(const c of cekirdekler) for(const p of c.ciftler||[]){
    const k=p.katil+'|'+p.kurban;
    if(!ciftler.has(k)) continue;
    carpan.set(k,(carpan.get(k)||1)*(p.carpan||1));
    if(!cekirdekCifti.has(k)) cekirdekCifti.set(k,c.id);
  }
  // Zayıf sebep (yakınlıkla erimiş, dolaylı) cinayete yetmez.
  const w=k=>{if(!ciftler.has(k)) return 0; const v=ciftler.get(k).agirlik*(carpan.get(k)||1); return v>=d.ayar.enAzSebep?v:0;};
  const katilOlan=new Set(), kurbanOlan=new Set(), katiller=[], baglar=[];
  const musait=x=>!katilOlan.has(x)&&!kurbanOlan.has(x);
  const hedefler=P=>d.ids.filter(T=>T!==P&&musait(T)&&w(P+'|'+T)>0);

  for(let n=0;n<K;n++){
    const adaylar=d.ids.filter(P=>musait(P)&&hedefler(P).length>0);
    const P=z.agirlikli(adaylar,P=>{
      const k=d.kisi(P), top=hedefler(P).reduce((s,T)=>s+w(P+'|'+T),0);
      return Math.pow(MIZAC_KATIL[k.mizac]??1,.6)*(k.yas>=70?.7:1)*Math.pow(top,.2);
    });
    if(!P) throw new UretimHatasi(`yalnızca ${n} katil seçilebildi`);
    katilOlan.add(P);
    let secim=null;
    if(z.olasilik(oranlar.santaj)){
      const secenek=[];
      for(const kt of katiller){
        if(kt.zorlayan) continue;
        const B=kt.kisi;
        const koz=d.sirlar.find(s=>s.sahip===P&&TEHLIKELI.includes(s.tur)&&s.kimler.includes(B));
        if(!koz) continue;
        for(const T of hedefler(B)) if(T!==P) secenek.push({B,T,koz,w:w(B+'|'+T)});
      }
      secim=z.agirlikli(secenek)||null;
    }
    let T,sebep;
    if(secim){
      T=secim.T;
      const asil=sebepOzet(ciftler.get(secim.B+'|'+T));
      const kendi=ciftler.get(P+'|'+T);
      sebep={tur:'zorlama',agirlik:asil.agirlik,kaynak:{tur:'santaj',zorlayan:secim.B,sahip:P,sir:secim.koz.id},
        asil:{tur:asil.tur,kaynak:asil.kaynak},ek:kendi?kendi.sebepler.map(s=>({tur:s.tur,kaynak:s.kaynak})):[]};
      baglar.push({tur:'santaj',zorlayan:secim.B,zorlanan:P,sir:{sahip:P,sir:secim.koz.id}});
    }else{
      T=z.agirlikli(hedefler(P),T=>Math.pow(w(P+'|'+T),.9));
      sebep=sebepOzet(ciftler.get(P+'|'+T));
    }
    kurbanOlan.add(T);
    katiller.push({kisi:P,kurban:T,sebep,zorlayan:secim?secim.B:null,yardimci:null,ortan:null,
      cekirdek:cekirdekCifti.get((secim?secim.B:P)+'|'+T)??null});
  }

  const katil=id=>katiller.find(k=>k.kisi===id);
  const yardimciOlan=new Set();
  const ortaklikKur=(A,B)=>{
    const a=katil(A);
    if(!a||!katil(B)||A===B||a.yardimci||yardimciOlan.has(B)||katil(B).yardimci===A) return false;
    a.yardimci=B; yardimciOlan.add(B); baglar.push({tur:'ortaklik',katil:A,yardimci:B}); return true;
  };
  const ortmeKur=(B,A)=>{
    const a=katil(A);
    if(!a||!katil(B)||A===B||a.ortan||a.yardimci===B) return false;
    a.ortan=B; baglar.push({tur:'ortme',ortan:B,ortulen:A}); return true;
  };
  // Çekirdeğin önerdiği bağlar önce (ikisi de katil çıktıysa).
  for(const c of cekirdekler) for(const b of c.baglar||[]){
    if(b.tur==='ortaklik') ortaklikKur(b.katil,b.yardimci);
    if(b.tur==='ortme') ortmeKur(b.ortan,b.ortulen);
  }
  const ikiliSec=A=>katiller.map(k=>k.kisi).filter(B=>B!==A&&bagKurulur(d,A,B));
  for(const a of z.karistir(katiller)){
    if(z.olasilik(oranlar.ortaklik)){
      const B=z.agirlikli(ikiliSec(a.kisi).filter(B=>!yardimciOlan.has(B)),B=>w(B+'|'+a.kurban)>0?2:1);
      if(B) ortaklikKur(a.kisi,B);
    }
    if(z.olasilik(oranlar.ortme)){
      const B=z.agirlikli(ikiliSec(a.kisi),()=>1);
      if(B) ortmeKur(B,a.kisi);
    }
  }
  // En az bağ sayısına ulaşılmadıysa örtme ve ortaklıkla tamamla.
  for(const a of z.karistir(katiller)){
    if(baglar.length>=d.ayar.enAzBag) break;
    const B=z.agirlikli(ikiliSec(a.kisi),()=>1);
    if(B&&!ortmeKur(B,a.kisi)) ortaklikKur(a.kisi,B);
  }
  return {katiller,baglar};
}
