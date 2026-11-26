// İzler: her cinayetin bıraktığı fiziksel, tanık ve dolaylı izler; masum açıklaması olan yanıltıcılar.
// Kural: hiçbir iz süs değildir. Her iz bir olaya (vaka.olaylar) bağlıdır ve o olayın zamanında
// izin sahibi/tanığı/fark edeni çizelgeye göre gerçekten oradadır. Testler bunu tek tek denetler.

import {ESYA,esyaIzi,ORTU_IZ,YONTEM_YARA,MIZAC_DIKKATSIZLIK} from './tablolar.js';

const INCE=['ayak-izi','lif','kirinti','leke']; // gözle zor seçilen, "üstünden geçen" bırakabilecek izler

export function izleriKur(d,z,cz,sonuc){
  const {cinayetler,olaylar,olayId}=sonuc, {zaman,ayar}=d, o=ayar.oranlar, D=zaman.D;
  const izler=[], yanilticilar=[];
  let n=0, ny=0;

  // İz anahtarı → o izi bırakabilecek herkes (eşyasından ya da örtüsünden).
  const adayIndex={};
  for(const id of d.ids){
    const k=d.kisi(id);
    for(const e of k.esyalar||[]) (adayIndex[esyaIzi(e).iz]??=new Set()).add(id);
    if(ORTU_IZ[k.ortu]) (adayIndex[ORTU_IZ[k.ortu]]??=new Set()).add(id);
  }
  const adaylar=anahtar=>[...(adayIndex[anahtar]||[])].sort();
  // Kişinin bırakabileceği izler: eşyaları (silah olarak kullanılanlar hariç) ve örtüsünün lifi.
  const izSecenekleri=(id,yalnizInce,haric=[])=>{
    const k=d.kisi(id), l=[];
    for(const e of k.esyalar||[]){
      if(haric.includes(e)||ESYA[e]?.silah) continue;
      const x=esyaIzi(e);
      if(yalnizInce&&!INCE.includes(x.tur)) continue;
      l.push({esya:e,anahtar:x.iz,iztur:x.tur,w:INCE.includes(x.tur)?3:1});
    }
    if(ORTU_IZ[k.ortu]) l.push({ortu:k.ortu,anahtar:ORTU_IZ[k.ortu],iztur:'lif',w:2});
    return l;
  };
  // t0'dan sonra t1'e kadar k ile aynı yerde olan ilk kişi (yakını öncelikli): {u, kim, mekan}
  const farkEden=(k,t0,t1,haric=[])=>{
    for(let u=t0+1;u<=Math.min(t1,zaman.T-1);u++){
      if(!cz.canli(k,u)) return null;
      const mk=cz.yer[k][u], l=cz.orada(mk,u).filter(h=>h!==k&&!haric.includes(h));
      if(l.length) return {u,kim:l.find(h=>d.rel(h,k).length)||l[0],mekan:mk};
    }
    return null;
  };

  for(const c of cinayetler){
    const A=c.katil, V=c.kurban, Y=c.yardimci, m=c.mekan, t=c.zaman, dilim=c.dilim;
    const ilgili=[A,V,...(Y?[Y]:[])];
    const ekle=iz=>{iz.id='i'+(++n); iz.cinayet=c.id; iz.yaniltici=!!iz.yaniltici; izler.push(iz); c.izler.push(iz.id); return iz;};
    const yaniltici=y=>{y.id='y'+(++ny); y.cinayet=c.id; yanilticilar.push(y); return y;};
    const olayEkle=ol=>{ol.id=olayId(); ol.cinayet=c.id; olaylar.push(ol); return ol;};
    const kanit=[]; // katili gösteren izler (çözülebilirlik için en az bir tane)

    // --- Fiziksel ---
    const yara={tur:'fiziksel',alt:'yara',anahtar:YONTEM_YARA[c.yontem],mekan:m,zaman:t,kisi:V,olay:c.id,gercek:{neden:'yontem',yontem:c.yontem}};
    if(c.silah&&c.yontem==='tufek'){yara.esya=c.silah.esya; yara.sahip=c.silah.sahip; yara.adaylar=adaylar(esyaIzi(c.silah.esya).iz);}
    ekle(yara);
    let silahIzi=null;
    if(c.silah&&c.silah.birakildi){
      const x=esyaIzi(c.silah.esya);
      silahIzi=ekle({tur:'fiziksel',alt:'silah',anahtar:x.iz,iztur:x.tur,esya:c.silah.esya,sahip:c.silah.sahip,adaylar:adaylar(x.iz),mekan:m,zaman:t,
        olay:c.silah.calinti?c.silah.olay:c.id,yaniltici:c.silah.calinti,gercek:{neden:c.silah.calinti?'calinti-silah':'katil-silahi'}});
      if(!c.silah.calinti) kanit.push(silahIzi.id);
    }
    if(c.silah&&!c.silah.calinti&&c.yontem==='tufek') kanit.push(yara.id);
    let calintiY=null;
    if(c.silah&&c.silah.calinti&&(silahIzi||c.yontem==='tufek')){
      calintiY=yaniltici({izler:[...(silahIzi?[silahIzi.id]:[]),...(c.yontem==='tufek'?[yara.id]:[])],isaret:[c.silah.sahip],aciklama:'calinti-silah',olay:c.silah.olay,
        curutme:[{tur:'konum',kisi:c.silah.sahip,zaman:t},{tur:'konum',kisi:A,zaman:olaylar.find(x=>x.id===c.silah.olay).zaman}]});
      if(c.yontem==='tufek') yara.yaniltici=true;
    }
    // Katilin kendi izi.
    const katilIzi=(id,neden,zorla=false)=>{
      if(!zorla&&!z.olasilik(MIZAC_DIKKATSIZLIK[d.kisi(id).mizac]??.5)) return null;
      const s=z.agirlikli(izSecenekleri(id,zorla,c.silah?[c.silah.esya]:[]));
      if(!s) return null;
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:s.anahtar,iztur:s.iztur,esya:s.esya??null,ortu:s.ortu??null,sahip:id,adaylar:adaylar(s.anahtar),mekan:m,zaman:t,olay:c.id,gercek:{neden}});
      return iz; // aynı izi bırakabilen başkaları iz.adaylar'da; bu bir belirsizliktir, yanıltıcı sayılmaz
    };
    const ki=katilIzi(A,'katil-birakti');
    if(ki) kanit.push(ki.id);
    if(Y&&z.olasilik(.4)) katilIzi(Y,'yardimci-birakti');
    // Kaçan tanığın düşürdüğü eşya.
    const kt=c.kacanTanik;
    let kacanY=null;
    if(kt&&kt.esya){
      const x=esyaIzi(kt.esya);
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:x.iz,iztur:x.tur,esya:kt.esya,ortu:null,sahip:kt.kisi,adaylar:adaylar(x.iz),mekan:m,zaman:t,olay:kt.olay,yaniltici:true,gercek:{neden:'tanik-kacarken'}});
      kacanY=yaniltici({izler:[iz.id],isaret:[kt.kisi],aciklama:'tanik-kacti',olay:kt.olay,
        curutme:[{tur:'ifade',kisi:kt.kisi,olgu:{tur:'gorulen',zaman:t}},...(t>0?[{tur:'konum',kisi:kt.kisi,zaman:t-1}]:[])]});
    }
    // Daha önce oradan geçenin izi.
    if(z.olasilik(o.oncekiGecis)){
      const l=[];
      for(let u=Math.max(0,t-4);u<t;u++) for(const P of cz.orada(m,u)){
        if(ilgili.includes(P)||(kt&&kt.kisi===P)||cz.yer[P][t]===m) continue;
        const s=izSecenekleri(P,true);
        if(s.length) l.push({P,u,s,w:1+(u-(t-4))*.3});
      }
      const g=z.agirlikli(l);
      if(g){
        const s=z.agirlikli(g.s);
        const ol=olayEkle({tur:'gecis',zaman:g.u,mekan:m,kisiler:[g.P]});
        const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:s.anahtar,iztur:s.iztur,esya:s.esya??null,ortu:s.ortu??null,sahip:g.P,adaylar:adaylar(s.anahtar),mekan:m,zaman:g.u,olay:ol.id,yaniltici:true,gercek:{neden:'onceden-gecti'}});
        yaniltici({izler:[iz.id],isaret:[g.P],aciklama:'onceden-gecti',olay:ol.id,curutme:[{tur:'konum',kisi:g.P,zaman:t},{tur:'konum',kisi:g.P,zaman:g.u}]});
      }
    }
    // Kurbanın kendi eşyası (gümüş saat durmuşsa ölüm dilimini doğru gösterir).
    if(z.olasilik(o.kurbanEsyasi)&&(d.kisi(V).esyalar||[]).length){
      const e=z.sec(d.kisi(V).esyalar), x=esyaIzi(e);
      ekle({tur:'fiziksel',alt:'kurban-esyasi',anahtar:e==='gumus-saat'?'durmus-saat':e,iztur:x.tur,esya:e,sahip:V,adaylar:[V],mekan:m,zaman:t,olay:c.id,
        gercek:{neden:'kurbanin',...(e==='gumus-saat'?{gosterdigiDilim:dilim}:{})}});
    }
    // Zehrin geldiği ot torbası: otu veren masumdur.
    if(c.zehirKaynagi){
      const K=c.zehirKaynagi.kisi, x=esyaIzi(c.zehirKaynagi.esya);
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:x.iz,iztur:x.tur,esya:c.zehirKaynagi.esya,ortu:null,sahip:K,adaylar:adaylar(x.iz),mekan:m,zaman:t,olay:c.zehirKaynagi.olay,yaniltici:true,gercek:{neden:'zehir-kaynagi'}});
      const ol=olaylar.find(x=>x.id===c.zehirKaynagi.olay);
      yaniltici({izler:[iz.id],isaret:[K],aciklama:'otu-vermisti',olay:ol.id,curutme:[{tur:'konum',kisi:K,zaman:t},{tur:'sir',sahip:ol.sir.sahip,sir:ol.sir.sir}]});
    }

    // --- Tanık ---
    const kesinlik=W=>{
      const tanir=d.evHalki[d.kisi(A).ev]?.includes(W)||d.rel(W,A).some(x=>['es','ebeveyn','cocuk','sevgili','sever'].includes(x));
      return z.olasilik(Math.min(1,(o.yuzTanima[dilim]??.5)+(tanir?.35:0)))?'yuz':'siluet';
    };
    const tanikIzi=(W,alt,gorulen,nereden)=>{
      const k=gorulen?kesinlik(W):null;
      const iz=ekle({tur:'tanik',alt,tanik:W,gorulen,kesinlik:k,ortu:gorulen?d.kisi(gorulen).ortu:null,nereden,mekan:m,zaman:t,olay:c.id,
        ...(alt==='ses'?{anahtar:c.yontem==='tufek'?'silah-sesi':'bagirti'}:{}),gercek:{neden:gorulen?'gordu':'duydu'}});
      if(gorulen===A&&k==='yuz') kanit.push(iz.id);
      return iz;
    };
    for(const W of c.gozTaniklari){
      tanikIzi(W,'olay-tanigi',A,m);
      if(Y) tanikIzi(W,'olay-tanigi',Y,m);
    }
    const gezgin=W=>d.sirlar.some(s=>s.sahip===W&&s.tur==='bilgi'&&!s.kimler.length);
    const gorenler=[], duyanlar=[];
    for(const W of d.ids){
      if(ilgili.includes(W)||c.gozTaniklari.includes(W)||!cz.canli(W,t)) continue;
      const wy=cz.yer[W][t];
      if(!(d.harita[m]||[]).includes(wy)) continue;
      const uyur=dilim==='gece'&&cz.neden[W][t]==='ev';
      const p=(o.gorme[dilim]??.4)*(gezgin(W)?2:1)*(uyur?.3:1);
      if(z.olasilik(Math.min(.95,p))) gorenler.push({W,wy});
      else if(c.yontem==='tufek'||z.olasilik(.15)) duyanlar.push({W,wy});
    }
    // Kalabalık komşu mekân vakayı tek tanıkla çözmesin: en çok iki gören, üç duyan.
    for(const g of z.karistir(gorenler).slice(0,2).sort((a,b)=>a.W<b.W?-1:1)) tanikIzi(g.W,'gordu',A,g.wy);
    for(const g of z.karistir(duyanlar).slice(0,3).sort((a,b)=>a.W<b.W?-1:1)) tanikIzi(g.W,'ses',null,g.wy);

    // --- Dolaylı ---
    const dolayli=iz=>ekle({tur:'dolayli',cinayet:c.id,...iz});
    // k evinde değilken o dilimde evde olan ev halkı (yokluğu fark edebilecekler)
    const evdekiler=(k,u)=>cz.yer[k][u]===d.kisi(k).ev?[]:(d.evHalki[d.kisi(k).ev]||[]).filter(h=>h!==k&&cz.yer[h][u]===d.kisi(k).ev);
    if(dilim==='gece'){
      const h=evdekiler(A,t).filter(h=>h!==V);
      if(h.length&&z.olasilik(o.geceYoklugu)){
        const iz=dolayli({alt:'gece-yoklugu',kisi:A,fark_eden:z.sec(h),zaman:t,mekan:d.kisi(A).ev,olay:c.id,gercek:{neden:'katil-disaridaydi'}});
        kanit.push(iz.id);
      }
      // Aynı gece sırrı yüzünden dışarıda olan masumun boş yatağı da fark edilebilir.
      for(const X of d.ids){
        if(ilgili.includes(X)||!cz.canli(X,t)||!(cz.neden[X][t]||'').startsWith('sir:')) continue;
        const hx=evdekiler(X,t);
        if(!hx.length||!z.olasilik(.3)) continue;
        const sirId=cz.neden[X][t].slice(4);
        const ol=olayEkle({tur:'gizli-hareket',zaman:t,mekan:cz.yer[X][t],kisiler:[X],sir:{sahip:X,sir:sirId}});
        const iz=dolayli({alt:'gece-yoklugu',kisi:X,fark_eden:z.sec(hx),zaman:t,mekan:d.kisi(X).ev,olay:ol.id,yaniltici:true,gercek:{neden:'gizli-isi-vardi'}});
        yaniltici({izler:[iz.id],isaret:[X],aciklama:'gizli-isi-vardi',olay:ol.id,curutme:[{tur:'konum',kisi:X,zaman:t},{tur:'sir',sahip:X,sir:sirId}]});
      }
    }
    if((c.yontem==='bicak'||c.yontem==='darbe')&&z.olasilik(o.kanliGiysi)){
      const f=farkEden(A,t,t+D,[V]);
      if(f) kanit.push(dolayli({alt:'kanli-giysi',kisi:A,ortu:d.kisi(A).ortu,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'katilin-giysisi'}}).id);
    }
    if((c.yontem==='bogma'||c.yontem==='suda-bogma')&&z.olasilik(o.tirmik)){
      const f=farkEden(A,t,t+D,[V]);
      if(f) kanit.push(dolayli({alt:'tirmik',kisi:A,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'kurban-tirmaladi'}}).id);
    }
    if(ki&&ki.iztur==='nesne'&&ki.esya){
      const f=farkEden(A,t,t+2*D,[V]);
      if(f) kanit.push(dolayli({alt:'eksik-esya',kisi:A,esya:ki.esya,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'olay-yerinde-dusurdu'}}).id);
    }
    if(kacanY){
      const Q=kt.kisi;
      if(z.olasilik(.7)){
        const f=farkEden(Q,t,t+D,ilgili);
        if(f) kacanY.izler.push(dolayli({alt:'yirtik-giysi',kisi:Q,ortu:d.kisi(Q).ortu,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:kt.olay,yaniltici:true,gercek:{neden:'saldiriya-ugradi'}}).id);
      }
      if(esyaIzi(kt.esya).tur==='nesne'){
        const f=farkEden(Q,t,t+2*D,ilgili);
        if(f) kacanY.izler.push(dolayli({alt:'eksik-esya',kisi:Q,esya:kt.esya,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:kt.olay,yaniltici:true,gercek:{neden:'kacarken-dusurdu'}}).id);
      }
    }
    if(c.silah&&c.silah.calinti){
      const ol=olaylar.find(x=>x.id===c.silah.olay), O=c.silah.sahip;
      for(let u=ol.zaman+1;u<=Math.min(t+D,zaman.T-1);u++){
        if(!cz.canli(O,u)) break;
        if(cz.yer[O][u]===ol.mekan){
          const iz=dolayli({alt:'eksik-alet',kisi:O,esya:c.silah.esya,sahip:O,fark_eden:O,zaman:u,mekan:ol.mekan,olay:ol.id,gercek:{neden:'calinmisti',cinayettenOnce:u<t}});
          if(calintiY) calintiY.curutme.unshift({tur:'iz',iz:iz.id});
          break;
        }
      }
    }
    // Katile giden hiçbir iz yoksa olay yerinde ince bir iz kalır (çözülebilirlik).
    if(!kanit.length) katilIzi(A,'katil-birakti',true);
  }
  return {izler,yanilticilar};
}
