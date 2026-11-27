// Soru üretimi: serbest yazı yok; seçenekler defterden doğar. Yeni iz ya da ifade deftere girdikçe yeni sorular açılır.
// Saf işlev. Gerçeği bilmez: yalnızca defteri ve herkesin bildiği köy bilgisini (kim nerede oturur, kim ne giyer) okur.
//
//   sorulariUret({defter, kisi, gun, kamu}) → [Soru]
//   Soru: {id, tur, oncelik, etiket, kisi?, zaman?, iz?, cinayet?, celiski?}
//
// Türler:
//   yer       "Dün gece neredeydin?"                          (kendi yeri, bilinen bir an)
//   gordu     "Dün gece bir şey gördün mü, duydun mu?"
//   baskasi   "Dün gece Kör Halil neredeydi, bilir misin?"     (başkasını sorma)
//   iz        "Bu kırmızı yün ipi kimin olabilir?" / "... senin mi?"   (iz gösterme)
//   fail      "Muallimi kim öldürdü, bir bildiğin var mı?"
//   fark      "Muallimin öldüğü günden beri tuhaf bir şey gözüne çarptı mı?"
//   sir       "Kör Halil hakkında köyde ne konuşulur?"          (sır yoklama)
//   sir-kendi "Senin saklamak istediğin bir şey var mı?"
//   iliski    "Hacı Ağa'yla aran nasıldı?"
//   yuzlesme  "Demirci seni değirmende görmüş."                (yalnızca oyuncunun yakaladığı çelişkilerden)
//
// kamu: {dilimler, sorguZamani, kisiler:{id:{ev, ortu}}, canli(id, t):boolean, izler:{izId:{ad, cinayet, sorulabilir, ortu?}}}
// (kamu yalnızca herkesin bildiğini taşır: oyun katmanı vakadan kurar, gerçeği koymaz.)

import {doldur} from './kalip.js';
import {zamanSozu} from '../dil/tr/zaman.js';
import {DIL_TR,rngAl,kisiDeger,mekanDeger} from './adlar.js';
import {soruldu,ifadeBul,anilanlar,ogrenilenSirlar} from './defter.js';

const sirala=(a,b)=>b.oncelik-a.oncelik||(a.id<b.id?-1:a.id>b.id?1:0);

// Defterde bilinen anlar: cinayet anları (fotoğraftan) ve ifadelerde geçen anlar. Yalnızca sorgu anından önceki.
export function bilinenAnlar(defter,S){
  const cin=[...new Set(defter.cinayetler.map(c=>c.zaman))].filter(t=>t<S).sort((a,b)=>b-a);
  const diger=new Set();
  for(const f of defter.ifadeler) for(const i of f.iddialar||[]) if(Number.isInteger(i.zaman)&&i.zaman<S&&!cin.includes(i.zaman)) diger.add(i.zaman);
  return {cinayet:cin,diger:[...diger].sort((a,b)=>b-a)};
}

// t anında adı geçenler (konum, değil, silüet tahmini).
function andaAnilanlar(defter,t){
  const s=new Set();
  for(const f of defter.ifadeler) for(const i of f.iddialar||[]){
    if(i.zaman!==t) continue;
    if(i.kisi) s.add(i.kisi);
    if(i.tahmin) s.add(i.tahmin);
  }
  return s;
}

// İz hakkında defterde aday ya da sahip olarak anılanlar.
function izAnilanlari(defter,iz){
  const s=new Set();
  for(const f of defter.ifadeler) for(const i of f.iddialar||[]){
    if(i.iz!==iz) continue;
    if(i.tur==='sahip'||i.tur==='sahip-degil') s.add(i.kisi);
    for(const k of i.kisiler||[]) s.add(k);
  }
  return s;
}

/**
 * @param {{defter:Object, kisi:string, gun:number, tohum:number|string, kamu:Object, dil?:Object}} g
 */
export function sorulariUret({defter,kisi:K,gun,tohum,kamu,dil=DIL_TR}){
  const S=kamu.sorguZamani, out=[];
  const SK=dil.sorular;
  const ekle=(soru,kalipTuru,degerler,oncelik)=>{
    if(soruldu(defter,K,soru.id)) return;
    if(out.some(s=>s.id===soru.id)) return;
    const r=rngAl(tohum,'soru',K,soru.id);
    const zaman=soru.zaman!=null?zamanSozu(soru.zaman,gun,{dilimler:kamu.dilimler,rng:r}):undefined;
    const liste=SK[kalipTuru];
    if(!liste) throw new Error('Soru kalıbı yok: '+kalipTuru);
    const etiket=doldur(liste[Math.floor(r()*liste.length)],{...degerler,...(zaman?{zaman}:{})},r);
    out.push({...soru,oncelik,etiket});
  };
  const kd=id=>kisiDeger(id,dil);
  const Kev=kamu.kisiler[K].ev;
  const {cinayet:cinAnlari,diger:digerAnlar}=bilinenAnlar(defter,S);
  const cinayetler=defter.cinayetler.filter(c=>c.zaman<S).sort((a,b)=>b.zaman-a.zaman);
  const supheliler=Object.entries(defter.isaretler).filter(([,v])=>v==='supheli').map(([k])=>k);
  const evHalki=Object.keys(kamu.kisiler).filter(x=>x!==K&&kamu.kisiler[x].ev===Kev);

  // Yüzleştirme: oyuncunun yakaladığı çelişkiler; konuşanlara sorulur.
  for(const k of defter.celiskiler){
    const fa=ifadeBul(defter,k.a), fb=ifadeBul(defter,k.b);
    if(!fa||!fb||(fa.kisi!==K&&fb.kisi!==K)) continue;
    const kendi=fa.kisi===K?fa:fb, diger=kendi===fa?fb:fa;
    const soru={id:'yuzlesme:'+k.id,tur:'yuzlesme',celiski:k.id};
    const kon=k.konu;
    if(diger.kisi===K){ ekle(soru,'yuzlesme-kendi',{},100); continue; }
    const d=kd(diger.kisi);
    if(kon.tur==='konum'){
      const dIddia=(diger.iddialar||[]).find(i=>(i.tur==='konum'||i.tur==='degil')&&i.kisi===kon.kisi&&i.zaman===kon.zaman);
      const yer=mekanDeger(dIddia.mekan,{konuEv:kamu.kisiler[kon.kisi]?.ev},dil);
      const t={...soru,zaman:kon.zaman};
      if(kon.kisi===K) ekle(t,dIddia.tur==='konum'?'yuzlesme-sen-orada':'yuzlesme-sen-degil',{diger:d,yer},100);
      else ekle(t,dIddia.tur==='konum'?'yuzlesme-o-orada':'yuzlesme-o-degil',{diger:d,kim:kd(kon.kisi),yer},100);
    }else if(kon.tur==='sahip'){
      const esya=kamu.izler[kon.iz]?.ad??dil.oyun.iz.tur.nesne;
      if(kon.kisi===K) ekle(soru,'yuzlesme-esya',{diger:d,esya},100);
      else ekle(soru,'yuzlesme-esya-o',{diger:d,esya,kim:kd(kon.kisi)},100);
    }else if(kon.tur==='sir'){
      if(kon.sahip===K) ekle(soru,'yuzlesme-sir',{diger:d},100);
      else ekle(soru,'yuzlesme-sir-o',{diger:d,kim:kd(kon.sahip)},100);
    }else if(kon.tur==='fail'){
      const dIddia=(diger.iddialar||[]).find(i=>i.tur==='fail');
      ekle(soru,'yuzlesme-fail',{diger:d,kim:kd(dIddia.kisi)},100);
    }
  }

  // Kendi yeri ve gördükleri: en yeni cinayet anı önce.
  cinAnlari.forEach((t,i)=>{
    ekle({id:'yer:'+t,tur:'yer',zaman:t},'yer',{},80-i*6);
    ekle({id:'gordu:'+t,tur:'gordu',zaman:t},'gordu',{},74-i*6);
  });
  // İfadelerde geçen başka anlar: yalnızca K'nin adı o anda geçiyorsa kendi yeri sorulur.
  for(const t of digerAnlar) if(andaAnilanlar(defter,t).has(K)) ekle({id:'yer:'+t,tur:'yer',zaman:t},'yer',{},50);

  // Gösterilecek izler: bulunan, sorulabilir, cinayeti bu zaman çizgisinde olmuş.
  for(const b of defter.izler){
    const iz=kamu.izler[b.iz];
    if(!iz||!iz.sorulabilir) continue;
    const cin=defter.cinayetler.find(c=>c.id===iz.cinayet);
    if(!cin||cin.zaman>=S) continue;
    const yakin=cinayetler.indexOf(cin);
    const senin=izAnilanlari(defter,b.iz).has(K)||(iz.ortu!=null&&iz.ortu===kamu.kisiler[K].ortu);
    const esya=iz.ad;
    ekle({id:'iz:'+b.iz,tur:'iz',iz:b.iz},senin?'iz-senin':'iz-kimin',{esya},(senin?78:64)-yakin*5);
  }

  // Başkasını sorma: ev halkı, şüpheliler ve o anda adı geçenler. Yalnızca son iki cinayet anı ve ifadelerdeki anlar.
  const anlar=[...cinAnlari.slice(0,2),...digerAnlar];
  for(const t of anlar){
    const adaylar=new Set([...evHalki,...supheliler,...andaAnilanlar(defter,t)]);
    const cin=defter.cinayetler.find(c=>c.zaman===t);
    for(const X of [...adaylar].sort()){
      if(X===K||!kamu.canli(X,t)||cin?.kurban===X) continue;
      const pay=evHalki.includes(X)?6:supheliler.includes(X)?4:0;
      ekle({id:'baskasi:'+X+':'+t,tur:'baskasi',kisi:X,zaman:t},'baskasi',{kim:kd(X)},(cinAnlari.includes(t)?56:46)+pay-cinAnlari.indexOf(t)*4);
    }
  }

  // Fail ve fark: her bilinen cinayet için.
  cinayetler.forEach((c,i)=>{
    ekle({id:'fark:'+c.id,tur:'fark',cinayet:c.id},'fark',{kim:kd(c.kurban)},58-i*5);
    ekle({id:'fail:'+c.id,tur:'fail',cinayet:c.id},'fail',{kim:kd(c.kurban)},44-i*5);
  });

  // İlişki ve sır: kurbanlar (öldüyse de), şüpheliler ve defterde adı geçenler.
  const kurbanlar=cinayetler.map(c=>c.kurban);
  const anilan=anilanlar(defter);
  const acikSirlar=ogrenilenSirlar(defter);
  const sirlarAcik=new Set(acikSirlar.map(s=>s.sahip));
  for(const X of [...new Set([...kurbanlar,...supheliler])]){
    if(X===K) continue;
    ekle({id:'iliski:'+X,tur:'iliski',kisi:X},'iliski',{kim:kd(X)},kurbanlar.includes(X)?52:42);
  }
  for(const X of [...new Set([...kurbanlar,...supheliler,...[...anilan].sort()])]){
    if(X===K||!kamu.kisiler[X]) continue;
    const n=acikSirlar.filter(x=>x.sahip===X).length;
    ekle({id:'sir:'+X+(n?'#'+n:''),tur:'sir',kisi:X},'sir',{kim:kd(X)},(kurbanlar.includes(X)?40:supheliler.includes(X)?38:30)-(sirlarAcik.has(X)?4:0));
  }
  const nk=acikSirlar.filter(x=>x.sahip===K).length;
  ekle({id:'sir-kendi'+(nk?'#'+nk:''),tur:'sir-kendi'},'sir-kendi',{},34);

  return out.sort(sirala);
}
