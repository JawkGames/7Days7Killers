// Kendi kendine oynayan dedektif: duman testi ve oynanış değerlendirmesi için.
// Yalnızca oyuncunun görebildiğini kullanır: seçenekler, defter ve herkesin bildiği köy bilgisi (ev, giysi).
// Gerçeğe (vaka.katiller, tavır, izin gerçek sahibi) bakmaz; son puanlamayı defterden yapar.
//
//   otoOyna(b, {geriSarma:1, yaz:(goster, eylem)=>{}}) → {durum, adimSayisi, secilenler}

import {oyunBaslat,acilis,secenekler,uygula,sorular,hukumAdaylari} from './oyun.js';
import {celiskiBul,ifadeBul} from '../diyalog/defter.js';
import {rngAl} from '../diyalog/adlar.js';

const SORU_PAYI={yuzlesme:40,iz:12,yer:10,gordu:9,fark:24,baskasi:3,fail:2,iliski:6,sir:14,'sir-kendi':-4};

// Defterden şüphe puanı: her önerme bir ağırlık taşır. Oyuncunun yapacağı kaba hesap.
export function supheHesapla(b,d){
  const df=d.defter, p={}, ekle=(k,x)=>{if(k) p[k]=(p[k]||0)+x;};
  const cinZaman=new Map(df.cinayetler.map(c=>[c.zaman,c]));
  const izCin=new Map(df.izler.map(i=>[i.iz,i.cinayet]));
  const ortuSayisi={};
  for(const id of b.ids) ortuSayisi[b.vaka.kisiler[id].ortu]=(ortuSayisi[b.vaka.kisiler[id].ortu]||0)+1;
  for(const f of df.ifadeler){
    for(const i of f.iddialar||[]){
      const cin=cinZaman.get(i.zaman);
      if(i.tur==='konum'&&cin&&i.mekan===cin.mekan&&i.kisi!==cin.kurban) ekle(i.kisi,i.kisi===f.kisi?1.5:3);
      if(i.tur==='degil'&&cin) ekle(i.kisi,1.5);
      if(i.tur==='siluet'&&cin){
        const l=b.ids.filter(x=>b.vaka.kisiler[x].ortu===i.ortu);
        for(const x of l) ekle(x,3/l.length);
        if(i.tahmin) ekle(i.tahmin,.5);
      }
      if(i.tur==='sahip'&&izCin.has(i.iz)&&i.kisi!==f.kisi) ekle(i.kisi,2.5);
      if(i.tur==='adaylar'&&izCin.has(i.iz)) for(const x of i.kisiler) ekle(x,2/i.kisiler.length);
      if(i.tur==='sahip'&&i.kisi===f.kisi) ekle(i.kisi,-.5); // kabul eden, çoğu zaman açıklar
      if(i.tur==='dolayli') ekle(i.kisi,{'kanli-giysi':4,tirmik:4,'eksik-esya':2,'gece-yoklugu':1,'yirtik-giysi':-.5,'eksik-alet':-1}[i.alt]??0);
      if(i.tur==='fail') ekle(i.kisi,2);
    }
    if(f.soru.tur==='yuzlesme'){
      const itiraf=(f.iddialar||[]).some(i=>i.tur==='sir')||/yalan söyledim|saklamayayım|söyleyeyim|benim\./i.test(f.metin);
      ekle(f.kisi,itiraf?-2.5:2.5);
    }
    ekle(f.kisi,(f.tepki?.gerginlik??0)*.6);
  }
  for(const k of df.celiskiler) for(const id of [k.a,k.b]){const f=ifadeBul(df,id); if(f) ekle(f.kisi,.5);}
  for(const c of df.cinayetler) delete p[c.kurban];
  return p;
}

function cagrilacak(b,d,adaylar){
  const df=d.defter, p=supheHesapla(b,d), puan={};
  const yeni=[...df.cinayetler].sort((a,c)=>c.zaman-a.zaman)[0];
  const sorguda=new Set(df.ifadeler.filter(f=>f.dongu===d.zaman.dongu).map(f=>f.kisi));
  const kacKez={};
  for(const f of df.ifadeler) if(f.dongu===d.zaman.dongu) (kacKez[f.kisi]??=new Set()).add(f.gun);
  const r=rngAl(b.tohum,'oto',d.zaman.gun,d.zaman.dongu);
  for(const id of adaylar){
    // Şüphe çeker ama bir oyuncu gibi köyü de dolaşır: aynı kişiyi tekrar tekrar çağırmak azalan getiri.
    let x=Math.min(p[id]||0,12)*.5+r()*3-(kacKez[id]?.size||0)*4;
    if(df.celiskiler.some(k=>[k.a,k.b].some(f=>ifadeBul(df,f)?.kisi===id)&&!df.ifadeler.some(f=>f.kisi===id&&f.soru.id==='yuzlesme:'+k.id))) x+=8;
    if(yeni&&yeni.bulan===id&&!sorguda.has(id)) x+=3;
    if(yeni&&b.vaka.kisiler[id].ev===b.vaka.kisiler[yeni.kurban].ev) x+=2.5;
    if(!sorguda.has(id)) x+=6;
    puan[id]=x;
  }
  return adaylar.sort((a,c)=>puan[c]-puan[a])[0];
}

function soruSec(b,d,l){
  const K=d.zaman.sorgudaki;
  const sorulan=new Set(d.defter.ifadeler.filter(f=>f.kisi===K&&f.gun===d.zaman.gun&&f.dongu===d.zaman.dongu).map(f=>f.soru.tur));
  // Sahibi iki kişiden duyulmuş izi başkalarına yeniden göstermek boşa soru: yalnızca adı geçen kişiye gösterilir.
  const sahipler={};
  for(const f of d.defter.ifadeler) for(const i of f.iddialar||[]) if(i.tur==='sahip'&&i.kisi!==f.kisi) (sahipler[i.iz]??=[]).push(i.kisi);
  const izPayi=q=>{
    if(q.tur!=='iz') return 0;
    const l=sahipler[q.iz]||[];
    return l.length>=2&&!l.includes(K)?-40:0;
  };
  const puan=q=>q.oncelik+(SORU_PAYI[q.tur]??0)+izPayi(q)-(sorulan.has(q.tur)&&q.tur!=='yuzlesme'&&q.tur!=='iz'?14:0);
  return [...l].sort((a,c)=>puan(c)-puan(a))[0];
}

// Yeni ifadeyi eskilerle yan yana koyar (oyuncunun defterde yapacağı karşılaştırma).
function celiskiAra(b,d,yaz){
  const df=d.defter, son=df.ifadeler[df.ifadeler.length-1];
  if(!son) return d;
  for(const f of df.ifadeler){
    if(f.id===son.id||!celiskiBul(son,f)) continue;
    const e={tur:'karsilastir',a:f.id,b:son.id};
    const s=uygula(b,d,e);
    if(s.celiski&&s.durum!==d){ yaz?.(s.goster,{etiket:'Defter: iki ifadeyi yan yana koy ('+f.id+' ↔ '+son.id+')',eylem:e}); d=s.durum; }
  }
  return d;
}

export function otoOyna(b,{geriSarma=1,yaz=null,azamiAdim=5000}={}){
  let d=oyunBaslat({tohum:b.tohum,ayar:b.ayar});
  const a=acilis(b,d); d=a.durum; yaz?.(a.goster,null);
  let n=0, secilenler=null;
  while(d.zaman.adim!=='bitti'){
    if(++n>azamiAdim) throw new Error('otoOyna: oyun bitmedi');
    const z=d.zaman, l=secenekler(b,d);
    let s;
    if(z.adim==='cagirma'&&z.sorguKalan>0){
      const adaylar=l.filter(x=>x.eylem.tur==='cagir').map(x=>x.eylem.kisi);
      const k=adaylar.length?cagrilacak(b,d,adaylar):null;
      s=k?l.find(x=>x.eylem.kisi===k):l.find(x=>x.eylem.tur==='ilerle');
    }else if(z.adim==='sorgu'){
      const q=soruSec(b,d,sorular(b,d));
      s=q?l.find(x=>x.eylem.soru===q.id):l.find(x=>x.eylem.tur==='ilerle');
    }else if(z.adim==='karar'){
      if(z.dongu<=geriSarma) s=l.find(x=>x.eylem.tur==='geriSar');
      else{
        const p=supheHesapla(b,d);
        secilenler=hukumAdaylari(b,d).sort((x,y)=>(p[y]||0)-(p[x]||0)||(x<y?-1:1)).slice(0,z.kural.finalSecimSayisi);
        s={etiket:l.find(x=>x.eylem.tur==='hukum').etiket,eylem:{tur:'hukum',kisiler:secilenler}};
      }
    }else s=l.find(x=>x.eylem.tur==='incele')??l.find(x=>x.eylem.tur==='ilerle');
    const r=uygula(b,d,s.eylem);
    d=r.durum; yaz?.(r.goster,s);
    if(s.eylem.tur==='sor') d=celiskiAra(b,d,yaz);
  }
  return {durum:d,adimSayisi:n,secilenler};
}
