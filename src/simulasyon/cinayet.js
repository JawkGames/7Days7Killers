// Cinayetleri çizelgenin içine yerleştirir: zaman, yer, yöntem; yöntemin gerektirdiği önceki olaylar
// (alet hırsızlığı, ot alma), olay yerine düşen kaçan tanık ve cesedin bulunması.
// Her yerleştirme kilitlenir; sonraki cinayetler öncekilerin olgularını bozamaz.

import {ESYA,MIZAC_KENDI_SILAH,SU_MEKANLARI,YUKSEK_MEKANLAR,mekanAletleri} from './tablolar.js';
import {UretimHatasi,karma} from './zar.js';
import {sebepOzet} from './roller.js';

const guc=(d,A,V)=>{const a=d.kisi(A), v=d.kisi(V); return a.yas>=65||(a.cinsiyet==='K'&&v.cinsiyet==='E')?.3:1;};

function yontemSecenekleri(d,A,V,Y,m,t,elde,cz){
  const o=d.ayar.oranlar, ka=d.kisi(A), l=[];
  for(const e of ka.esyalar||[]){
    const x=ESYA[e];
    if(x&&x.silah&&elde(A,e,t)) l.push({yontem:x.silah,silah:{esya:e,sahip:A,calinti:false},w:(MIZAC_KENDI_SILAH[ka.mizac]??1)*(x.silah==='zehir'?1.5:1)});
  }
  for(const s of d.sirlariOf(A)) if(s.tur==='zehir'){
    const kaynak=s.kimler.find(k=>k!==V&&k!==Y&&(d.kisi(k).esyalar||[]).some(e=>ESYA[e]?.silah==='zehir'));
    const kendi=(ka.esyalar||[]).find(e=>ESYA[e]?.silah==='zehir'&&elde(A,e,t));
    l.push({yontem:'zehir',silah:kendi&&!kaynak?{esya:kendi,sahip:A,calinti:false}:null,kaynak:kaynak?{kisi:kaynak,esya:d.kisi(kaynak).esyalar.find(e=>ESYA[e]?.silah==='zehir'),sir:s.id}:null,w:3});
  }
  // Başkasının aleti: kurnaz katil hasmının aletini çalıp suçu ona atmayı sever.
  const calinti=[];
  for(const O of d.ids){
    if(O===A||O===V||O===Y) continue;
    for(const e of d.kisi(O).esyalar||[]){
      const x=ESYA[e];
      if(!x||!x.silah||x.silah==='zehir'||!elde(O,e,t)) continue;
      // Sahibinin yanında o an (yakını olmayan) en az iki kişi yoksa mazereti doğrulanamaz, çalıntı silah çürütülemez: seyrek.
      const gizli=k=>/^(sir|ortaklik|hirsizlik|ot-alma|cinayet|yoldan|ses-duydu)/.test(cz?.neden[k][t]||'');
      const yanindakiler=cz&&cz.yer[O][t]&&!gizli(O)?cz.orada(cz.yer[O][t],t).filter(h=>h!==O&&h!==A&&!gizli(h)&&!d.rel(h,O).some(r=>['es','ebeveyn','cocuk'].includes(r))).length:0;
      const yalniz=yanindakiler>=2?1:.05;
      const cerceve=yalniz*(d.rel(A,O).includes('hasim')?2.5:1)*(d.rel(O,V).some(t=>['hasim','borclu','korkar'].includes(t))?1.5:1);
      calinti.push({yontem:x.silah,silah:{esya:e,sahip:O,calinti:true},f:cerceve});
    }
  }
  const taban=ka.mizac==='kurnaz'?o.calintiSilahKurnaz:o.calintiSilah, top=calinti.reduce((s,c)=>s+c.f,0);
  for(const c of calinti) l.push({...c,w:taban*c.f/Math.max(1,calinti.length)*calinti.length/Math.max(top,calinti.length)});
  // Yerin aleti: olay yerinde duran (dirgen, kürek, değirmen demiri) ya da katilin kendi evinden/iş yerinden getirdiği (balta, av tüfeği).
  const g=guc(d,A,V);
  for(const a of mekanAletleri(m,d.mekanTuru(m))) if(elde(m,a.alet,t))
    l.push({yontem:a.yontem,silah:{esya:a.alet,sahip:null,calinti:false,mekanAleti:m,getirildi:false},w:o.aletYerinde*(a.w??1)*(a.yontem==='asma'?g:1)});
  for(const p of new Set([ka.ev,ka.is].filter(x=>x&&x!==m))) for(const a of mekanAletleri(p,d.mekanTuru(p))) if(a.evHalki&&elde(p,a.alet,t))
    l.push({yontem:a.yontem,silah:{esya:a.alet,sahip:null,calinti:false,mekanAleti:p,getirildi:true},w:o.aletGetirme*(a.w??1)*(a.yontem==='asma'?g:1)});
  l.push({yontem:'bogma',silah:null,w:o.elleBogma*g});
  l.push({yontem:'darbe',silah:null,w:o.tasla}); // taş, odun
  if(SU_MEKANLARI.includes(m)) l.push({yontem:'suda-bogma',silah:null,w:1.5*g});
  if(YUKSEK_MEKANLAR.includes(m)) l.push({yontem:'itme',silah:null,w:1.2*g});
  return l;
}

// Cinayetleri sırayla (güne, sonra kimliğe göre) yerleştirir. Her katilin kendi zar akışı vardır
// (zarOf('cinayet', katil)): bir katilin planı değişince ötekilerinki kaymaz.
// sec.mudahale (mudahale.js mudahaleKur): oyuncunun tedbirleri. Kurbanı korunan ya da yeri nöbette olan katil
// sebebi olan başka birine yönelir; alıkonan katil ertesi geceye kalır; son geceden sonraya kalan cinayet engellenir.
// sec.taban: aynı tohumun müdahalesiz vakası. Kesimden (ilk tedbirden) önce yapılmış hazırlıklar (alet çalma,
// ot alma) geçmişte kaldığı için aynen tekrarlanır; kesimden sonra yeni hazırlık yapılır.
export function cinayetleriYerlestir(d,zarOf,cz,roller,sec={}){
  const {ayar,zaman}=d, D=zaman.D, o=ayar.oranlar, G=ayar.gunSayisi;
  const mudahale=sec.mudahale||null, taban=sec.taban||null;
  const kesim=mudahale?mudahale.kesim:Infinity;
  const olaylar=[], cinayetler=[], engellenen=[];
  // Müdahale kilidi (alıkonma, uyarı) ölüme engel değildir: o geceden önce ölen kişi için tedbir boşa düşer.
  const gelecekKilitli=(k,t)=>{for(let u=t+1;u<zaman.T;u++) if(cz.kilitli(k,u)&&!(mudahale&&mudahale.kilit(k,u))) return true; return false;};
  // Eşyanın akıbeti: 'kisi|esya' -> {kayip: kaybolduğu an | null, kullanim: [silah olarak kullanıldığı anlar]}.
  // Kaybolan (olay yerinde kalan, çalınan, kaçarken düşen) eşya sonradan bir daha iz bırakamaz.
  const esyaDurum=new Map();
  const durum=(k,e)=>{const a=k+'|'+e; if(!esyaDurum.has(a)) esyaDurum.set(a,{kayip:null,kullanim:[]}); return esyaDurum.get(a);};
  const elde=(k,e,t)=>{const s=esyaDurum.get(k+'|'+e); return !s||s.kayip==null||s.kayip>t;};
  const alinabilir=(k,e,u)=>{const s=esyaDurum.get(k+'|'+e); return !s||(s.kayip==null&&s.kullanim.every(x=>x<u));};
  const bagSil=(tur,f)=>{const i=roller.baglar.findIndex(b=>b.tur===tur&&f(b)); if(i>=0) roller.baglar.splice(i,1);};
  const zk=new Map(), zOf=k=>{if(!zk.has(k)) zk.set(k,zarOf('cinayet',k)); return zk.get(k);};
  // Kararlı ağırlıklı seçim: her seçeneğin kendi tohumlu anahtarı vardır (Gumbel-en-küçük). Bir seçeneğin ağırlığı
  // değişince (oyuncu oradaki birini alıkoydu) yalnızca o seçenek kazanır ya da kaybeder; ötekiler arasındaki sıra kaymaz.
  // Böylece ilgisiz bir tedbir cinayeti rasgele başka bir yere taşımaz.
  const anahtar=sec.anahtar||['?'];
  const kararli=(l,etiket,imza,w=x=>x.w)=>{
    let en, ek=Infinity;
    for(const x of l){
      const v=w(x); if(!(v>0)) continue;
      const u=(karma(...anahtar,'kararli',...etiket,...imza(x))+.5)/4294967296;
      const k=-Math.log(u)/v;
      if(k<ek){ek=k; en=x;}
    }
    return en;
  };
  const katilOlan=new Set(roller.katiller.flatMap(x=>[x.kisi,x.yardimci].filter(Boolean)));
  const pencere=gun=>ayar.cinayetPenceresi.map(p=>({p,g:p.onceki?gun-1:gun})).filter(x=>x.g>=1).map(x=>({p:x.p,t:zaman.t(x.g,x.p.dilim)}));

  // Tabandan gelen, kesimden önce yapılmış hazırlıklar (alet çalma, ot alma, suçu atmak için eşya çalma).
  const hazirlik=new Map();
  if(taban) for(const bc of taban.cinayetler){
    const l=taban.olaylar.filter(x=>(x.tur==='hirsizlik'||x.tur==='ot-alma')&&x.cinayet===bc.id&&x.zaman<kesim);
    if(l.length&&bc.zaman>=kesim) hazirlik.set(bc.katil,{l,bc,uygulandi:false,silah:null,tuzak:null});
  }
  const hazirlikUygula=A=>{
    const h=hazirlik.get(A); if(!h||h.uygulandi) return h||null;
    h.uygulandi=true;
    for(const on of h.l){
      cz.koy(A,on.zaman,on.mekan,on.tur+':'+on.id,true);
      if(on.tur==='ot-alma') cz.kilitle(on.kisiler[1],on.zaman);
      if(on.tur==='hirsizlik') durum(on.sahip,on.esya).kayip=on.zaman;
      const ol={...on,kisiler:[...on.kisiler]};
      olaylar.push(ol);
      if(on.tuzak) h.tuzak=ol; else h.silah=ol;
    }
    return h;
  };

  // Katilin bu gün için olası (an, yer) seçenekleri.
  function adayAnlar(A,V,Y,gun){
    const l=[];
    for(const {p,t} of pencere(gun)){
      if(!cz.bos(A,t)||!cz.bos(V,t)||gelecekKilitli(V,t)) continue;
      const yardimciVar=!!Y&&cz.bos(Y,t);
      const vYer=cz.yer[V][t];
      const yakin=d.rel(A,V).length>0||d.sirlar.some(s=>(s.sahip===A&&s.kimler.includes(V))||(s.sahip===V&&s.kimler.includes(A)));
      const yerler=new Map([[vYer,false]]);
      for(const m of [...(d.harita[vYer]||[]),...d.mekanIds.filter(m=>['kir','ortak'].includes(d.mekanTuru(m)))]) if(!yerler.has(m)) yerler.set(m,true);
      const cagriPayi=(yakin?1.2:.5)/Math.max(1,yerler.size-1); // kurbanı bir yere çağırmak: bütün seçenekler toplamı
      for(const [m,cagri] of yerler){
        if(mudahale&&mudahale.nobet(m,t)) continue;
        if(cz.sahne(m,t)) continue;
        const digerleri=cz.orada(m,t).filter(k=>k!==A&&k!==V&&k!==Y);
        let w=p.agirlik*(digerleri.length===0?1:digerleri.length===1?.1:.005);
        w*=cagri?cagriPayi:1.5;
        if(p.dilim==='ikindi'&&d.mekanTuru(m)!=='kir') w*=.1;
        if(Y&&yardimciVar) w*=3;
        if(digerleri.some(k=>cz.kilitli(k,t))) w*=.2;
        l.push({t,m,cagri,w,yardimciVar});
      }
    }
    return l;
  }

  // Korunan kurbanın yerine sebebi olan başka biri (katil olmayan, başka katilin kurbanı olmayan, o gece ulaşılabilen).
  function yeniHedefler(kt){
    const A=kt.kisi, kurbanlar=new Set(roller.katiller.map(x=>x.kurban));
    const l=[];
    for(const T of d.ids){
      if(T===A||katilOlan.has(T)||kurbanlar.has(T)) continue;
      const c=roller.ciftler&&roller.ciftler.get(A+'|'+T);
      if(!c||c.agirlik<ayar.enAzSebep) continue;
      l.push({T,w:Math.pow(c.agirlik,.9)});
    }
    return l;
  }

  const kuyruk=[...roller.katiller].sort((a,b)=>a.gun-b.gun||(a.kisi<b.kisi?-1:1));
  let sira=0;
  while(kuyruk.length){
    const kt=kuyruk.shift(), A=kt.kisi, z=zOf(A);
    const hz=hazirlikUygula(A);
    let V=kt.kurban, Y=kt.yardimci;
    // 1) Zaman ve yer.
    let adaylar=adayAnlar(A,V,Y,kt.gun);
    if(!adaylar.length&&mudahale){
      const katilAlikondu=pencere(kt.gun).every(({t})=>!cz.bos(A,t));
      if(!katilAlikondu&&!kt.zorlayan){
        let secenek=yeniHedefler(kt);
        for(let n=0;n<4&&!adaylar.length&&secenek.length;n++){
          const s=kararli(secenek,[A,'yonel',kt.gun,n],x=>[x.T]);
          secenek=secenek.filter(x=>x!==s);
          const l=adayAnlar(A,s.T,Y,kt.gun);
          if(l.length){
            kt.yonelme={eski:kt.yonelme?.eski??kt.kurban,gun:kt.gun};
            kt.kurban=s.T; kt.sebep=sebepOzet(roller.ciftler.get(A+'|'+s.T)); kt.cekirdek=null; V=s.T; adaylar=l;
          }
        }
      }
      if(!adaylar.length){
        kt.erteleme={ilkGun:kt.erteleme?.ilkGun??kt.gun,neden:katilAlikondu?'alikonuldu':'korundu'};
        if(kt.gun<G){
          kt.gun++;
          const i=kuyruk.findIndex(x=>x.gun>kt.gun||(x.gun===kt.gun&&x.kisi>kt.kisi));
          kuyruk.splice(i<0?kuyruk.length:i,0,kt);
        }else{
          engellenen.push({katil:A,kurban:kt.kurban,gun:kt.erteleme.ilkGun,neden:kt.erteleme.neden,yardimci:Y||null});
          for(const [tur,alan] of [['ortaklik','katil'],['ortme','ortulen'],['santaj','zorlanan']]) bagSil(tur,b=>b[alan]===A);
          bagSil('ortaklik',b=>b.yardimci===A);
          if(hz) for(const x of [hz.silah,hz.tuzak]) if(x) x.cinayet=null;
        }
        continue;
      }
    }
    const s=kararli(adaylar,[A,V,kt.gun],x=>[x.t,x.m]);
    if(!s) throw new UretimHatasi(`${A} → ${V} cinayeti yerleştirilemedi`);
    const {t,m}=s, dilim=zaman.dilim(t);
    const id=cinayetId(++sira,A,V,t,m,taban);
    if(Y&&!s.yardimciVar){bagSil('ortaklik',b=>b.katil===A); kt.yardimci=Y=null;}

    // 2) Sahte tanıklık (örtme): katil "o sırada B ile birlikteydim" der.
    const iddialar={[A]:d.masumYer(A,dilim)};
    if(Y) iddialar[Y]=d.masumYer(Y,dilim);
    if(kt.ortan){
      const B=kt.ortan, bYer=cz.yer[B][t];
      if(B!==Y&&bYer&&bYer!==m&&!String(cz.neden[B][t]).startsWith('cinayet')){
        // Gece başkasının evinde olmak inandırıcı değil: o gece örtme kurulmaz.
        const evdeGece=dilim==='gece'&&d.mekanTuru(bYer)==='ev'&&d.kisi(A).ev!==bYer;
        // Sahte mazeret çürütülebilir olmalı: orada uyanık bir üçüncü kişi "A burada değildi" diyebilmeli.
        const ucuncu=cz.orada(bYer,t).filter(h=>h!==A&&h!==B&&h!==V&&h!==Y&&!(dilim==='gece'&&cz.neden[h][t]==='ev')&&!String(cz.neden[h][t]).startsWith('sir:'));
        if(evdeGece||!ucuncu.length){bagSil('ortme',b=>b.ortulen===A); kt.ortan=null;}
        else {iddialar[A]=bYer; cz.kilitle(B,t); for(const h of ucuncu) cz.kilitle(h,t);}
      }
      else {bagSil('ortme',b=>b.ortulen===A); kt.ortan=null;}
    }

    // 3) Yerleştir.
    const digerleri=cz.orada(m,t).filter(k=>k!==A&&k!==V&&k!==Y);
    cz.sahneEkle(m,t);
    cz.koy(A,t,m,'cinayet:'+id,true);
    if(Y) cz.koy(Y,t,m,'cinayet-yardim:'+id,true);
    cz.koy(V,t,m,s.cagri?'cagrildi:'+id:cz.neden[V][t],true);
    if(mudahale) for(let u=t+1;u<zaman.T;u++) if(mudahale.kilit(V,u)) cz.kilitAc(V,u);
    cz.oldur(V,t);
    for(const k of digerleri) cz.kilitle(k,t); // doğal göz tanıkları yerinde kalır
    olaylar.push({id,tur:'cinayet',zaman:t,mekan:m,kisiler:[A,V,...(Y?[Y]:[])],cinayet:id});
    let on=0; const olayId=()=>{let x; do x=id+'o'+(++on); while(olaylar.some(e=>e.id===x)); return x;};

    // 4) Kaçan tanık: komşu mekândan geçen biri olay yerine düşer, saldırıya uğrar, kaçar.
    let kacanTanik=null;
    if(!digerleri.length&&z.olasilik(o.kacanTanik)){
      // Korkak susar, katil inkâr eder, katilin yakını onu korur: onların tanıklığı çürütülemez, kaçan tanık olmazlar.
      const KORUR=['es','ebeveyn','cocuk','sevgili','sever','korur','dost','borclu','korkar','ortak'];
      const q=d.ids.filter(k=>k!==A&&k!==V&&k!==Y&&cz.bos(k,t)&&(d.harita[m]||[]).includes(cz.yer[k][t])&&d.kisi(k).mizac!=='korkak'
        &&!katilOlan.has(k)&&![A,Y].filter(Boolean).some(x=>d.rel(k,x).some(r=>KORUR.includes(r))));
      const Q=kararli(q,[id,'kacan'],k=>[k],k=>{const n=cz.neden[k][t]||''; return n.startsWith('sir:')?3:dilim==='gece'&&n==='ev'?.3:1;});
      if(Q){
        const esya=z.agirlikli(d.kisi(Q).esyalar||[],e=>{const x=ESYA[e]; if((x&&x.silah)||!alinabilir(Q,e,t)) return 0; return x?.tur==='lif'?3:x?.tur==='nesne'?2:1;});
        if(esya) durum(Q,esya).kayip=t;
        const nereden=cz.yer[Q][t], evden=dilim==='gece'&&cz.neden[Q][t]==='ev';
        const oid=olayId();
        cz.koy(Q,t,m,(evden?'ses-duydu:':'yoldan-gecerken:')+id,true);
        olaylar.push({id:oid,tur:'kacis',zaman:t,mekan:m,kisiler:[Q],cinayet:id,nereden});
        kacanTanik={kisi:Q,esya:esya??null,nereden,olay:oid};
      }
    }

    // 5) Yöntem ve gerektirdiği önceki olay. Kesimden önce yapılmış hazırlık varsa o alet kullanılır.
    let secenek=yontemSecenekleri(d,A,V,Y,m,t,elde,cz), y=null, onOlay=null;
    if(hz&&hz.silah){
      const on=hz.silah, bc=hz.bc;
      if(on.tur==='hirsizlik') y={yontem:bc.yontem,silah:{esya:on.esya,sahip:on.sahip,calinti:true}};
      else y={yontem:'zehir',silah:null,kaynak:{kisi:on.sahip,esya:on.esya,sir:on.sir.sir}};
      onOlay=on; on.cinayet=id;
    }
    if(hz&&hz.tuzak) hz.tuzak.cinayet=id;
    const enErken=taban&&t>=kesim?kesim:0; // kesimden sonraki cinayetin yeni hazırlığı geçmişe yazılamaz
    while(!y){
      let c=z.agirlikli(secenek);
      if(!c) throw new UretimHatasi(`${A} için yöntem bulunamadı`);
      if(c.silah&&c.silah.calinti){
        const O=c.silah.sahip, x=ESYA[c.silah.esya], P=x.yer==='is'?(d.kisi(O).is||d.kisi(O).ev):d.kisi(O).ev;
        const anlar=[];
        for(let u=Math.max(0,t-2*D,enErken);u<t;u++) if(cz.bos(A,u)&&cz.canli(O,u)&&!cz.sahne(P,u)&&alinabilir(O,c.silah.esya,u)) anlar.push({u,w:(zaman.dilim(u)==='gece'?.4:1)*(cz.yer[O][u]===P?.3:1)});
        const a=z.agirlikli(anlar);
        if(!a){secenek=secenek.filter(s=>s!==c); continue;}
        const oid=olayId();
        cz.koy(A,a.u,P,'hirsizlik:'+oid,true);
        onOlay={id:oid,tur:'hirsizlik',zaman:a.u,mekan:P,kisiler:[A],esya:c.silah.esya,sahip:O,cinayet:id};
        olaylar.push(onOlay);
      }else if(c.kaynak){
        const K=c.kaynak.kisi, P=d.kisi(K).ev, anlar=[];
        for(let u=Math.max(0,t-2*D,enErken);u<t;u++) if(zaman.dilim(u)!=='gece'&&cz.bos(A,u)&&cz.bos(K,u)&&cz.yer[K][u]===P&&!cz.sahne(P,u)) anlar.push({u,w:1});
        const a=z.agirlikli(anlar);
        if(a){
          const oid=olayId();
          cz.koy(A,a.u,P,'ot-alma:'+oid,true); cz.kilitle(K,a.u);
          onOlay={id:oid,tur:'ot-alma',zaman:a.u,mekan:P,kisiler:[A,K],esya:c.kaynak.esya,sahip:K,cinayet:id,sir:{sahip:A,sir:c.kaynak.sir}};
          olaylar.push(onOlay);
        }else c={...c,kaynak:null};
      }
      y=c;
    }
    let silah=null;
    if(y.silah){
      const p=y.silah.calinti?o.calintiBirakma:y.silah.mekanAleti?o.aletBirakma:o.silahBirakma*(d.kisi(A).mizac==='ofkeli'?1.5:1);
      // Zehrin kalıntısı (bardakta kuru ot, sıçan otu) her zaman kalır.
      const st=durum(y.silah.sahip??y.silah.mekanAleti,y.silah.esya);
      // Olay yerinde kalan eşya sonra kullanılamaz: daha geç bir anda kullanılmışsa (aynı güne düşen cinayetler) bırakılmaz.
      const sonraKullanildi=st.kullanim.some(x=>x>t)||(st.kayip!=null&&st.kayip>t);
      silah={mekanAleti:null,...y.silah,birakildi:y.yontem==='zehir'||(!sonraKullanildi&&z.olasilik(p)),olay:onOlay?onOlay.id:null};
      // Zehirde "bırakılan" otun kalıntısıdır; torba sahibinde kalır.
      if(silah.calinti) st.kayip=onOlay.zaman; else if(silah.birakildi&&y.yontem!=='zehir') st.kayip=t; else st.kullanim.push(t);
    }

    // 5b) Tuzak: kurnaz katil (seyrek olarak öbürleri de) suçu başkasına atmak için onun bir eşyasını çalıp olay yerine
    //     bırakır. Sahibinin o an yanında (yakını olmayan) en az iki kişi olmalı: mazereti doğrulanabilsin.
    let tuzak=null;
    if(hz&&hz.tuzak){ if(cz.yer[hz.tuzak.sahip][t]!==m) tuzak={esya:hz.tuzak.esya,sahip:hz.tuzak.sahip,olay:hz.tuzak.id}; } // sahibi oradaysa bırakmaz
    else if(z.olasilik(d.kisi(A).mizac==='kurnaz'?o.tuzakKurnaz:o.tuzak)){
      const gizliN=k=>/^(sir|ortaklik|hirsizlik|ot-alma|cinayet|yoldan|ses-duydu)/.test(cz.neden[k][t]||'');
      const l=[];
      for(const O of d.ids){
        if(O===A||O===V||O===Y||!cz.canli(O,t)||!cz.yer[O][t]||gizliN(O)) continue;
        const yan=cz.orada(cz.yer[O][t],t).filter(h=>h!==O&&h!==A&&!gizliN(h)&&!d.rel(h,O).some(r=>['es','ebeveyn','cocuk'].includes(r))).length;
        if(yan<2) continue;
        for(const e of d.kisi(O).esyalar||[]){
          const x=ESYA[e];
          if(!x||x.silah||x.tur!=='nesne'||!alinabilir(O,e,t)) continue;
          l.push({O,e,w:(d.rel(A,O).includes('hasim')?3:1)*(d.rel(O,V).some(r=>['hasim','borclu','korkar'].includes(r))?1.5:1)});
        }
      }
      const sc=z.agirlikli(l);
      if(sc){
        const P=d.kisi(sc.O).ev, anlar=[];
        for(let u=Math.max(0,t-2*D,taban&&t>=kesim?kesim:0);u<t;u++) if(cz.bos(A,u)&&cz.canli(sc.O,u)&&!cz.sahne(P,u)&&zaman.dilim(u)!=='gece') anlar.push({u,w:cz.yer[sc.O][u]===P?.3:1});
        const a=z.agirlikli(anlar);
        if(a){
          const oid=olayId();
          cz.koy(A,a.u,P,'hirsizlik:'+oid,true);
          durum(sc.O,sc.e).kayip=a.u;
          olaylar.push({id:oid,tur:'hirsizlik',zaman:a.u,mekan:P,kisiler:[A],esya:sc.e,sahip:sc.O,cinayet:id,tuzak:true});
          tuzak={esya:sc.e,sahip:sc.O,olay:oid};
        }
      }
    }

    // 6) Ceset en geç oyun gününün bulunma diliminde bulunur.
    const son=zaman.t(kt.gun,ayar.bulunmaDilimi);
    let bulunma=null;
    for(let u=t+1;u<=son&&!bulunma;u++){
      const l=cz.orada(m,u).filter(k=>k!==A&&k!==Y);
      if(l.length){const b=l.find(k=>d.rel(k,V).length)||l[0]; cz.kilitle(b,u); bulunma={zaman:u,bulan:b,neden:'rastlanti'};}
    }
    if(!bulunma){
      const l=cz.sahne(m,son)?[]:d.ids.filter(k=>k!==A&&k!==Y&&k!==V&&cz.bos(k,son));
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
      id,sira,katil:A,kurban:V,yardimci:Y||null,
      zaman:t,gun:zaman.gun(t),dilim,mekan:m,
      fotografGunu:bIdx<=sIdx?bGun:bGun+1,
      yontem:y.yontem,silah,tuzak,zehirKaynagi:y.kaynak&&onOlay?{kisi:y.kaynak.kisi,esya:y.kaynak.esya,olay:onOlay.id}:null,
      sebep:kt.sebep,zorlayan:kt.zorlayan,ortan:kt.ortan||null,cekirdek:kt.cekirdek,
      cagrildi:s.cagri,iddialar,
      gozTaniklari:[...digerleri,...(kacanTanik?[kacanTanik.kisi]:[])].sort(),
      kacanTanik,
      bulunma:{...bulunma,gun:bGun,dilim:zaman.dilim(bulunma.zaman),olay:bOid},
      ...(kt.yonelme?{yonelme:{...kt.yonelme}}:{}),
      ...(kt.erteleme?{erteleme:{...kt.erteleme}}:{}),
      izler:[],
    });
  }
  return {cinayetler,olaylar,engellenen,esya:{durum,elde,alinabilir}};
}

// Müdahalesiz vakada sıra numarası. Müdahaleli vakada tabandaki aynı cinayet (aynı katil, kurban, an ve yer)
// tabanın kimliğini korur (defter aynı fotoğrafı aynı kimlikle tanır); değişen cinayet içerikten türeyen bir kimlik
// alır (başka bir zaman çizgisindeki farklı bir cinayetle karışmasın diye).
function cinayetId(sira,A,V,t,m,taban){
  if(!taban) return 'c'+sira;
  const b=taban.cinayetler.find(x=>x.katil===A&&x.kurban===V&&x.zaman===t&&x.mekan===m);
  return b?b.id:'c'+sira+'x'+karma(A,V,t,m).toString(36);
}
