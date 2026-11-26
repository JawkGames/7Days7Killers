// Cinayetleri çizelgenin içine yerleştirir: zaman, yer, yöntem; yöntemin gerektirdiği önceki olaylar
// (alet hırsızlığı, ot alma), olay yerine düşen kaçan tanık ve cesedin bulunması.
// Her yerleştirme kilitlenir; sonraki cinayetler öncekilerin olgularını bozamaz.

import {ESYA,MIZAC_KENDI_SILAH,SU_MEKANLARI} from './tablolar.js';
import {UretimHatasi} from './zar.js';

const guc=(d,A,V)=>{const a=d.kisi(A), v=d.kisi(V); return a.yas>=65||(a.cinsiyet==='K'&&v.cinsiyet==='E')?.3:1;};

function yontemSecenekleri(d,A,V,m){
  const o=d.ayar.oranlar, ka=d.kisi(A), l=[];
  for(const e of ka.esyalar||[]){
    const x=ESYA[e];
    if(x&&x.silah) l.push({yontem:x.silah,silah:{esya:e,sahip:A,calinti:false},w:(MIZAC_KENDI_SILAH[ka.mizac]??1)*(x.silah==='zehir'?1.5:1)});
  }
  for(const s of d.sirlariOf(A)) if(s.tur==='zehir'){
    const kaynak=s.kimler.find(k=>(d.kisi(k).esyalar||[]).some(e=>ESYA[e]?.silah==='zehir'));
    l.push({yontem:'zehir',silah:null,kaynak:kaynak?{kisi:kaynak,esya:d.kisi(kaynak).esyalar.find(e=>ESYA[e]?.silah==='zehir'),sir:s.id}:null,w:3});
  }
  // Başkasının aleti: kurnaz katil hasmının aletini çalıp suçu ona atmayı sever.
  const calinti=[];
  for(const O of d.ids){
    if(O===A||O===V) continue;
    for(const e of d.kisi(O).esyalar||[]){
      const x=ESYA[e];
      if(!x||!x.silah||x.silah==='zehir') continue;
      const cerceve=(d.rel(A,O).includes('hasim')?2.5:1)*(d.rel(O,V).some(t=>['hasim','borclu','korkar'].includes(t))?1.5:1);
      calinti.push({yontem:x.silah,silah:{esya:e,sahip:O,calinti:true},f:cerceve});
    }
  }
  const taban=ka.mizac==='kurnaz'?o.calintiSilahKurnaz:o.calintiSilah, top=calinti.reduce((s,c)=>s+c.f,0);
  for(const c of calinti) l.push({...c,w:taban*c.f/top});
  l.push({yontem:'bogma',silah:null,w:guc(d,A,V)});
  l.push({yontem:'darbe',silah:null,w:1}); // taş, odun
  if(SU_MEKANLARI.includes(m)) l.push({yontem:'suda-bogma',silah:null,w:1.5*guc(d,A,V)});
  return l;
}

export function cinayetleriYerlestir(d,z,cz,roller){
  const {ayar,zaman}=d, D=zaman.D, o=ayar.oranlar;
  const olaylar=[], cinayetler=[];
  let sayac=0; const olayId=()=>'o'+(++sayac);
  const sirali=[...roller.katiller].sort((a,b)=>a.gun-b.gun||(a.kisi<b.kisi?-1:1));
  const gelecekKilitli=(k,t)=>{for(let u=t+1;u<zaman.T;u++) if(cz.kilitli(k,u)) return true; return false;};
  const bagSil=(tur,f)=>{const i=roller.baglar.findIndex(b=>b.tur===tur&&f(b)); if(i>=0) roller.baglar.splice(i,1);};

  sirali.forEach((kt,i)=>{
    const id='c'+(i+1), A=kt.kisi, V=kt.kurban;
    let Y=kt.yardimci;
    // 1) Zaman ve yer.
    const adaylar=[];
    for(const p of ayar.cinayetPenceresi){
      const g=p.onceki?kt.gun-1:kt.gun;
      if(g<1) continue;
      const t=zaman.t(g,p.dilim);
      if(!cz.bos(A,t)||!cz.bos(V,t)||gelecekKilitli(V,t)) continue;
      const yardimciVar=!!Y&&cz.bos(Y,t);
      const vYer=cz.yer[V][t];
      const yakin=d.rel(A,V).length>0||d.sirlar.some(s=>(s.sahip===A&&s.kimler.includes(V))||(s.sahip===V&&s.kimler.includes(A)));
      const yerler=new Map([[vYer,false]]);
      for(const m of [...(d.harita[vYer]||[]),...d.mekanIds.filter(m=>['kir','ortak'].includes(d.mekanTuru(m)))]) if(!yerler.has(m)) yerler.set(m,true);
      for(const [m,cagri] of yerler){
        const digerleri=cz.orada(m,t).filter(k=>k!==A&&k!==V&&k!==Y);
        let w=p.agirlik*(digerleri.length===0?1:digerleri.length===1?.1:.005);
        w*=cagri?(yakin?.5:.2):1.5;
        if(p.dilim==='ikindi'&&d.mekanTuru(m)!=='kir') w*=.1;
        if(Y&&yardimciVar) w*=3;
        if(digerleri.some(k=>cz.kilitli(k,t))) w*=.2;
        adaylar.push({t,m,cagri,w,yardimciVar});
      }
    }
    const s=z.agirlikli(adaylar);
    if(!s) throw new UretimHatasi(`${A} → ${V} cinayeti yerleştirilemedi`);
    const {t,m}=s, dilim=zaman.dilim(t);
    if(Y&&!s.yardimciVar){bagSil('ortaklik',b=>b.katil===A); kt.yardimci=Y=null;}

    // 2) Sahte tanıklık (örtme): katil "o sırada B ile birlikteydim" der.
    const iddialar={[A]:d.masumYer(A,dilim)};
    if(Y) iddialar[Y]=d.masumYer(Y,dilim);
    if(kt.ortan){
      const B=kt.ortan, bYer=cz.yer[B][t];
      if(B!==Y&&bYer&&bYer!==m&&!String(cz.neden[B][t]).startsWith('cinayet')){iddialar[A]=bYer; cz.kilitle(B,t);}
      else {bagSil('ortme',b=>b.ortulen===A); kt.ortan=null;}
    }

    // 3) Yerleştir.
    const digerleri=cz.orada(m,t).filter(k=>k!==A&&k!==V&&k!==Y);
    cz.koy(A,t,m,'cinayet:'+id,true);
    if(Y) cz.koy(Y,t,m,'cinayet-yardim:'+id,true);
    cz.koy(V,t,m,s.cagri?'cagrildi:'+id:cz.neden[V][t],true);
    cz.oldur(V,t);
    for(const k of digerleri) cz.kilitle(k,t); // doğal göz tanıkları yerinde kalır
    olaylar.push({id,tur:'cinayet',zaman:t,mekan:m,kisiler:[A,V,...(Y?[Y]:[])],cinayet:id});

    // 4) Kaçan tanık: komşu mekândan geçen biri olay yerine düşer, saldırıya uğrar, kaçar.
    let kacanTanik=null;
    if(!digerleri.length&&z.olasilik(o.kacanTanik)){
      const q=d.ids.filter(k=>k!==A&&k!==V&&k!==Y&&cz.bos(k,t)&&(d.harita[m]||[]).includes(cz.yer[k][t]));
      const Q=z.agirlikli(q,k=>{const n=cz.neden[k][t]||''; return n.startsWith('sir:')?3:dilim==='gece'&&n==='ev'?.3:1;});
      if(Q){
        const esya=z.agirlikli(d.kisi(Q).esyalar||[],e=>{const x=ESYA[e]; if(x&&x.silah) return 0; return x?.tur==='lif'?3:x?.tur==='nesne'?2:1;});
        const nereden=cz.yer[Q][t], evden=dilim==='gece'&&cz.neden[Q][t]==='ev';
        const oid=olayId();
        cz.koy(Q,t,m,(evden?'ses-duydu:':'yoldan-gecerken:')+id,true);
        olaylar.push({id:oid,tur:'kacis',zaman:t,mekan:m,kisiler:[Q],cinayet:id,nereden});
        kacanTanik={kisi:Q,esya:esya??null,nereden,olay:oid};
      }
    }

    // 5) Yöntem ve gerektirdiği önceki olay.
    let secenek=yontemSecenekleri(d,A,V,m), y=null, onOlay=null;
    while(!y){
      let c=z.agirlikli(secenek);
      if(!c) throw new UretimHatasi(`${A} için yöntem bulunamadı`);
      if(c.silah&&c.silah.calinti){
        const O=c.silah.sahip, x=ESYA[c.silah.esya], P=x.yer==='is'?(d.kisi(O).is||d.kisi(O).ev):d.kisi(O).ev;
        const anlar=[];
        for(let u=Math.max(0,t-2*D);u<t;u++) if(cz.bos(A,u)&&cz.canli(O,u)) anlar.push({u,w:(zaman.dilim(u)==='gece'?.4:1)*(cz.yer[O][u]===P?.3:1)});
        const a=z.agirlikli(anlar);
        if(!a){secenek=secenek.filter(s=>s!==c); continue;}
        const oid=olayId();
        cz.koy(A,a.u,P,'hirsizlik:'+oid,true);
        onOlay={id:oid,tur:'hirsizlik',zaman:a.u,mekan:P,kisiler:[A],esya:c.silah.esya,sahip:O,cinayet:id};
      }else if(c.kaynak){
        const K=c.kaynak.kisi, P=d.kisi(K).ev, anlar=[];
        for(let u=Math.max(0,t-2*D);u<t;u++) if(zaman.dilim(u)!=='gece'&&cz.bos(A,u)&&cz.bos(K,u)&&cz.yer[K][u]===P) anlar.push({u,w:1});
        const a=z.agirlikli(anlar);
        if(a){
          const oid=olayId();
          cz.koy(A,a.u,P,'ot-alma:'+oid,true); cz.kilitle(K,a.u);
          onOlay={id:oid,tur:'ot-alma',zaman:a.u,mekan:P,kisiler:[A,K],esya:c.kaynak.esya,sahip:K,cinayet:id,sir:{sahip:A,sir:c.kaynak.sir}};
        }else c={...c,kaynak:null};
      }
      y=c;
    }
    if(onOlay) olaylar.push(onOlay);
    let silah=null;
    if(y.silah){
      const p=y.silah.calinti?o.calintiBirakma:o.silahBirakma*(d.kisi(A).mizac==='ofkeli'?1.5:1);
      silah={...y.silah,birakildi:z.olasilik(p),olay:onOlay?onOlay.id:null};
    }

    // 6) Ceset en geç oyun gününün bulunma diliminde bulunur.
    const son=zaman.t(kt.gun,ayar.bulunmaDilimi);
    let bulunma=null;
    for(let u=t+1;u<=son&&!bulunma;u++){
      const l=cz.orada(m,u).filter(k=>k!==A&&k!==Y);
      if(l.length){const b=l.find(k=>d.rel(k,V).length)||l[0]; cz.kilitle(b,u); bulunma={zaman:u,bulan:b,neden:'rastlanti'};}
    }
    if(!bulunma){
      const l=d.ids.filter(k=>k!==A&&k!==Y&&k!==V&&cz.bos(k,son));
      const F=z.agirlikli(l,k=>d.rel(k,V).length?3:(d.harita[m]||[]).includes(cz.yer[k][son])?1:.15);
      if(!F) throw new UretimHatasi(`${id} cesedini bulacak kimse yok`);
      const arama=d.rel(F,V).length>0;
      cz.koy(F,son,m,(arama?'arama:':'rastlanti:')+id,true);
      bulunma={zaman:son,bulan:F,neden:arama?'arama':'rastlanti'};
    }
    const bOid=olayId();
    olaylar.push({id:bOid,tur:'bulunma',zaman:bulunma.zaman,mekan:m,kisiler:[bulunma.bulan],cinayet:id});
    const bIdx=ayar.dilimler.indexOf(zaman.dilim(bulunma.zaman)), sIdx=ayar.dilimler.indexOf(ayar.bulunmaDilimi);
    const bGun=zaman.gun(bulunma.zaman);

    cinayetler.push({
      id,sira:i+1,katil:A,kurban:V,yardimci:Y||null,
      zaman:t,gun:zaman.gun(t),dilim,mekan:m,
      fotografGunu:bIdx<=sIdx?bGun:bGun+1,
      yontem:y.yontem,silah,zehirKaynagi:y.kaynak&&onOlay?{kisi:y.kaynak.kisi,esya:y.kaynak.esya,olay:onOlay.id}:null,
      sebep:kt.sebep,zorlayan:kt.zorlayan,ortan:kt.ortan||null,cekirdek:kt.cekirdek,
      cagrildi:s.cagri,iddialar,
      gozTaniklari:[...digerleri,...(kacanTanik?[kacanTanik.kisi]:[])].sort(),
      kacanTanik,
      bulunma:{...bulunma,gun:bGun,dilim:zaman.dilim(bulunma.zaman),olay:bOid},
      izler:[],
    });
  });
  return {cinayetler,olaylar,olaySayaci:()=>sayac,olayId};
}
