// İzler: her cinayetin bıraktığı fiziksel, tanık ve dolaylı izler; masum açıklaması olan yanıltıcılar.
// Kural: hiçbir iz süs değildir. Her iz bir olaya (vaka.olaylar) bağlıdır ve o olayın zamanında
// izin sahibi/tanığı/fark edeni çizelgeye göre gerçekten oradadır. Testler bunu tek tek denetler.

import {ESYA,esyaIzi,ORTU_IZ,YONTEM_YARA,MIZAC_DIKKATSIZLIK,GIZLI_NEDEN_ONEKLERI,mekanAletleri} from './tablolar.js';
import {karma} from './zar.js';

// Cinayetin iz kimliklerinin başladığı sayı: müdahalesiz vakada sıra × 100 (c3 → i301...), müdahaleyle değişmiş
// cinayette kimliğinden türeyen büyük bir sayı (başka bir zaman çizgisinin izleriyle karışmasın).
export function izTabani(cid){
  const m=/^c(\d+)$/.exec(cid);
  return m?Number(m[1])*100:(1000+karma(cid)%90000)*100;
}

const INCE=['ayak-izi','lif','kirinti','leke']; // gözle zor seçilen, "üstünden geçen" bırakabilecek izler

// zarOf(...etiket): tohumlu akış üretir. Her cinayetin fiziksel, tanık ve dolaylı izleri ayrı akıştan gelir ve
// kimlikleri cinayete göre numaralanır: sonraki cinayetler değişse de (oyuncu müdahalesi) önceki bir cinayetin
// fotoğrafı ve tanıkları değişmez. Fiziksel ve tanık izleri yalnızca cinayet anına kadarki çizelgeye bakar.
export function izleriKur(d,zarOf,cz,sonuc){
  const {cinayetler,olaylar}=sonuc, {zaman,ayar}=d, o=ayar.oranlar, D=zaman.D;
  const izler=[], yanilticilar=[];

  // İz anahtarı → o izi bırakabilecek herkes (eşyasından ya da örtüsünden).
  const adayIndex={};
  for(const id of d.ids){
    const k=d.kisi(id);
    for(const e of k.esyalar||[]) (adayIndex[esyaIzi(e).iz]??=new Set()).add(id);
    if(ORTU_IZ[k.ortu]) (adayIndex[ORTU_IZ[k.ortu]]??=new Set()).add(id);
  }
  const adaylar=anahtar=>[...(adayIndex[anahtar]||[])].sort();
  // Silahın izi: kişinin eşyasıysa eşyanın izi; yerin aletiyse aletin izi. Getirilen alet o yerin halkını gösterir,
  // olay yerinde kapılan alet kimseyi göstermez.
  const silahIz=s=>s.mekanAleti?(mekanAletleri(s.mekanAleti,d.mekanTuru(s.mekanAleti)).find(a=>a.alet===s.esya)?.iz??s.esya):esyaIzi(s.esya).iz;
  const silahAdaylari=s=>s.mekanAleti?(s.getirildi?d.ids.filter(k=>d.kisi(k).ev===s.mekanAleti||d.kisi(k).is===s.mekanAleti).sort():[]):adaylar(silahIz(s));
  // Kişinin bırakabileceği izler: eşyaları (silah olarak kullanılanlar hariç) ve örtüsünün lifi.
  const {elde,durum}=sonuc.esya;
  const kaybet=(k,e,t)=>{const s=durum(k,e); s.kayip=s.kayip==null?t:Math.min(s.kayip,t);};
  // t anında bırakılabilecek izler. Silah olabilen eşya iz olarak düşmez (sonra silah olabilir); nesne düşerse kaybolur.
  // Ayırt edicilik: köyde birkaç kişide olan iz (aba tiftiği, çarık izi) en sık kalır; tek sahipli iz (kama, mühür)
  // seyrek kalır: "bu kimin?" sorusu tek başına vakayı çözmesin.
  const ayirt=anahtar=>{const n=adaylar(anahtar).length; return n<=1?o.tekSahipliIz:n<=4?1:.7;};
  const izSecenekleri=(id,t,yalnizInce,haric=[])=>{
    const k=d.kisi(id), l=[];
    for(const e of k.esyalar||[]){
      if(haric.includes(e)||ESYA[e]?.silah||!elde(id,e,t)) continue;
      const x=esyaIzi(e);
      if(yalnizInce&&!INCE.includes(x.tur)) continue;
      l.push({esya:e,anahtar:x.iz,iztur:x.tur,w:(INCE.includes(x.tur)?3:1)*ayirt(x.iz)});
    }
    if(ORTU_IZ[k.ortu]) l.push({ortu:k.ortu,anahtar:ORTU_IZ[k.ortu],iztur:'lif',w:2*ayirt(ORTU_IZ[k.ortu])});
    return l;
  };
  // t0'dan sonra t1'e kadar k ile aynı yerde olan ilk kişi (yakını öncelikli): {u, kim, mekan}
  // P'nin t anındaki yerini doğrulayabilecek biri var mı? (İkisi de orada gizli bir iş için değil.)
  const gizli=(k,t)=>GIZLI_NEDEN_ONEKLERI.some(p=>(cz.neden[k][t]||'').startsWith(p));
  // En az iki kişi (yakını olmayan) doğrulamalı: tek kişinin sözü sağlam mazeret değildir.
  const AILE=['es','ebeveyn','cocuk'];
  const dogrulanir=(P,t)=>cz.canli(P,t)&&!gizli(P,t)&&cz.orada(cz.yer[P][t],t).filter(h=>h!==P&&!gizli(h,t)&&!d.rel(h,P).some(r=>AILE.includes(r))).length>=2;
  // korumaz: katilin aleyhine olan iz için, onu korumayacak (yakını, dostu, borçlusu olmayan) biri öncelikli.
  // Fark eden rasgele bir köylü değil: katilin komşusu ya da ev halkı (onu korumayan), sonra bir yakını; fark eden de
  // gördüğünü yakınlarına açar (cevap.js yan bilgi: "X bir şey görmüş, ona sorun"): oyuncu kime sorulacağını sezebilir.
  const KORUYAN=['es','ebeveyn','cocuk','sevgili','sever','korur','dost','borclu','korkar','ortak'];
  const komsuEv=(a,b)=>{const ea=d.kisi(a).ev, eb=d.kisi(b).ev; return ea===eb||(d.harita[ea]||[]).includes(eb);};
  const farkPuani=(h,k,V)=>(komsuEv(h,k)?2:0)+(d.rel(h,k).length?1:0)+(V&&d.rel(h,V).length?.5:0);
  // Nedensel: ilk karşılaşmada yanında olan fark eder (korumaz ise onu korumayacak ilk kişi); sonraki günlere
  // bakıp geri dönmez, böylece sonradan değişen gelecek (oyuncu müdahalesi) geçmişteki fark edişi değiştirmez.
  const farkEden=(k,t0,t1,haric=[],korumaz=false,V=null)=>{
    for(let u=t0+1;u<=Math.min(t1,zaman.T-1);u++){
      if(!cz.canli(k,u)) break;
      const mk=cz.yer[k][u];
      if(cz.sahne(mk,u)) continue; // başka bir cinayetin anı: orada kimse kimsenin giysisine bakmaz
      const l=cz.orada(mk,u).filter(h=>h!==k&&!haric.includes(h));
      if(!l.length) continue;
      // Katilin aleyhine olanı onu koruyacak biri görse de görmezden gelir: sonraki karşılaşmaya bakılır.
      const iyi=korumaz?l.filter(h=>!d.rel(h,k).some(r=>KORUYAN.includes(r))):l;
      if(!iyi.length) continue;
      const kim=[...iyi].sort((x,y)=>farkPuani(y,k,V)-farkPuani(x,k,V)||(x<y?-1:1))[0];
      return {u,kim,mekan:mk};
    }
    return null;
  };

  for(const c of cinayetler){
    const A=c.katil, V=c.kurban, Y=c.yardimci, m=c.mekan, t=c.zaman, dilim=c.dilim;
    const ilgili=[A,V,...(Y?[Y]:[])];
    // Her türün kendi akışı ve kimlik bloğu: fiziksel 1-39, tanık 40-59, dolaylı 60-89 (tamamlama 90-99).
    const zf=zarOf('iz-fiziksel',c.id), zt=zarOf('iz-tanik',c.id), zd=zarOf('iz-dolayli',c.id);
    const taban=izTabani(c.id), sayac={fiziksel:0,tanik:40,dolayli:60};
    let ny=0, no=0;
    const ekle=iz=>{iz.id='i'+(taban+(++sayac[iz.tur])); iz.cinayet=c.id; iz.yaniltici=!!iz.yaniltici; izler.push(iz); c.izler.push(iz.id); return iz;};
    const yaniltici=y=>{y.id='y'+(taban/10+(++ny)); y.cinayet=c.id; yanilticilar.push(y); return y;};
    const olayEkle=ol=>{ol.id=c.id+'g'+(++no); ol.cinayet=c.id; olaylar.push(ol); return ol;};
    const kanit=[]; // katili gösteren izler (çözülebilirlik için en az bir tane)
    const z=zf;

    // --- Fiziksel ---
    const yara={tur:'fiziksel',alt:'yara',anahtar:YONTEM_YARA[c.yontem],mekan:m,zaman:t,kisi:V,olay:c.id,gercek:{neden:'yontem',yontem:c.yontem}};
    if(c.silah&&c.yontem==='tufek'){
      yara.esya=c.silah.esya; yara.sahip=c.silah.sahip; yara.adaylar=silahAdaylari(c.silah);
      if(c.silah.mekanAleti) yara.mekanAleti=c.silah.mekanAleti;
    }
    ekle(yara);
    let silahIzi=null;
    if(c.silah&&c.silah.birakildi){
      const x=c.silah.mekanAleti?{iz:silahIz(c.silah),tur:c.yontem==='zehir'?'kirinti':'nesne'}:esyaIzi(c.silah.esya); // zehrin kalıntısı kırıntıdır, alet yerinde kalır
      silahIzi=ekle({tur:'fiziksel',alt:'silah',anahtar:x.iz,iztur:x.tur,esya:c.silah.esya,sahip:c.silah.sahip,adaylar:silahAdaylari(c.silah),
        ...(c.silah.mekanAleti?{mekanAleti:c.silah.mekanAleti}:{}),mekan:m,zaman:t,
        olay:c.silah.calinti?c.silah.olay:c.id,yaniltici:c.silah.calinti,gercek:{neden:c.silah.calinti?'calinti-silah':c.silah.mekanAleti?'mekan-aleti':'katil-silahi'}});
      if(!c.silah.calinti&&silahIzi.adaylar.includes(A)) kanit.push(silahIzi.id);
    }
    if(c.silah&&!c.silah.calinti&&c.yontem==='tufek'&&yara.adaylar.includes(A)) kanit.push(yara.id);
    let calintiY=null;
    if(c.silah&&c.silah.calinti&&(silahIzi||c.yontem==='tufek')){
      calintiY=yaniltici({izler:[...(silahIzi?[silahIzi.id]:[]),...(c.yontem==='tufek'?[yara.id]:[])],isaret:[c.silah.sahip],aciklama:'calinti-silah',olay:c.silah.olay,
        curutme:[{tur:'konum',kisi:c.silah.sahip,zaman:t},{tur:'konum',kisi:A,zaman:olaylar.find(x=>x.id===c.silah.olay).zaman}]});
      if(c.yontem==='tufek') yara.yaniltici=true;
    }
    // Katilin kendi izi.
    const katilIziEkle=(id,s,neden)=>{
      if(s.esya&&s.iztur==='nesne') kaybet(id,s.esya,t);
      return ekle({tur:'fiziksel',alt:'esya',anahtar:s.anahtar,iztur:s.iztur,esya:s.esya??null,ortu:s.ortu??null,sahip:id,adaylar:adaylar(s.anahtar),mekan:m,zaman:t,olay:c.id,gercek:{neden}});
    };
    const katilIzi=(id,neden,zorla=false)=>{
      if(!zorla&&!z.olasilik(MIZAC_DIKKATSIZLIK[d.kisi(id).mizac]??.5)) return null;
      const s=z.agirlikli(izSecenekleri(id,t,zorla,c.silah?[c.silah.esya]:[]));
      return s?katilIziEkle(id,s,neden):null; // aynı izi bırakabilen başkaları iz.adaylar'da; bu bir belirsizliktir, yanıltıcı sayılmaz
    };
    const ki=katilIzi(A,'katil-birakti');
    if(ki) kanit.push(ki.id);
    if(Y&&z.olasilik(.4)) katilIzi(Y,'yardimci-birakti');
    // Tuzak: başkasından çalınıp bırakılan eşya (yanıltıcı; sahibi o an başka yerdeydi, eşyasının kaybolduğunu fark eder).
    let tuzakY=null;
    if(c.tuzak){
      const x=esyaIzi(c.tuzak.esya), ol=olaylar.find(q=>q.id===c.tuzak.olay);
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:x.iz,iztur:x.tur,esya:c.tuzak.esya,ortu:null,sahip:c.tuzak.sahip,adaylar:adaylar(x.iz),mekan:m,zaman:t,olay:c.tuzak.olay,yaniltici:true,gercek:{neden:'tuzak'}});
      tuzakY=yaniltici({izler:[iz.id],isaret:[c.tuzak.sahip],aciklama:'tuzak',olay:c.tuzak.olay,curutme:[{tur:'konum',kisi:c.tuzak.sahip,zaman:t},{tur:'konum',kisi:A,zaman:ol.zaman}]});
    }
    // Kaçan tanığın düşürdüğü eşya (başka bir olay yerinde daha önce düşmüşse artık elinde değildir).
    const kt=c.kacanTanik;
    let kacanY=null;
    if(kt&&kt.esya&&durum(kt.kisi,kt.esya).kayip!==t) kt.esya=null;
    if(kt&&kt.esya){
      const x=esyaIzi(kt.esya);
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:x.iz,iztur:x.tur,esya:kt.esya,ortu:null,sahip:kt.kisi,adaylar:adaylar(x.iz),mekan:m,zaman:t,olay:kt.olay,yaniltici:true,gercek:{neden:'tanik-kacarken'}});
      kacanY=yaniltici({izler:[iz.id],isaret:[kt.kisi],aciklama:'tanik-kacti',olay:kt.olay,
        curutme:[{tur:'ifade',kisi:kt.kisi,olgu:{tur:'gorulen',zaman:t}},...(t>0?[{tur:'konum',kisi:kt.kisi,zaman:t-1}]:[])]});
    }else if(kt){
      kacanY=null;
    }
    // Daha önce oradan geçenin izi.
    if(z.olasilik(o.oncekiGecis)){
      const l=[];
      for(let u=Math.max(0,t-4);u<t;u++) for(const P of cz.orada(m,u)){
        if(ilgili.includes(P)||(kt&&kt.kisi===P)||cz.yer[P][t]===m) continue;
        // Çürütülebilsin: cinayet anında yanında başkası olan (mazereti doğrulanabilen) biri.
        if(!dogrulanir(P,t)) continue;
        const s=izSecenekleri(P,u,true);
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
    const kurbanda=(d.kisi(V).esyalar||[]).filter(e=>elde(V,e,t));
    if(z.olasilik(o.kurbanEsyasi)&&kurbanda.length){
      const e=z.sec(kurbanda), x=esyaIzi(e);
      ekle({tur:'fiziksel',alt:'kurban-esyasi',anahtar:e==='gumus-saat'?'durmus-saat':e,iztur:x.tur,esya:e,sahip:V,adaylar:[V],mekan:m,zaman:t,olay:c.id,
        gercek:{neden:'kurbanin',...(e==='gumus-saat'?{gosterdigiDilim:dilim}:{})}});
    }
    // Zehrin geldiği ot torbası: otu veren masumdur.
    if(c.zehirKaynagi&&dogrulanir(c.zehirKaynagi.kisi,t)){
      const K=c.zehirKaynagi.kisi, x=esyaIzi(c.zehirKaynagi.esya);
      const iz=ekle({tur:'fiziksel',alt:'esya',anahtar:x.iz,iztur:x.tur,esya:c.zehirKaynagi.esya,ortu:null,sahip:K,adaylar:adaylar(x.iz),mekan:m,zaman:t,olay:c.zehirKaynagi.olay,yaniltici:true,gercek:{neden:'zehir-kaynagi'}});
      const ol=olaylar.find(x=>x.id===c.zehirKaynagi.olay);
      yaniltici({izler:[iz.id],isaret:[K],aciklama:'otu-vermisti',olay:ol.id,curutme:[{tur:'konum',kisi:K,zaman:t},{tur:'sir',sahip:ol.sir.sahip,sir:ol.sir.sir}]});
    }

    // --- Tanık ---
    const kesinlik=W=>{
      const tanir=d.evHalki[d.kisi(A).ev]?.includes(W)||d.rel(W,A).some(x=>['es','ebeveyn','cocuk','sevgili','sever'].includes(x));
      return zt.olasilik(Math.min(1,(o.yuzTanima[dilim]??.5)+(tanir?.35:0)))?'yuz':'siluet';
    };
    const tanikIzi=(W,alt,gorulen,nereden)=>{
      const k=gorulen?kesinlik(W):null;
      const iz=ekle({tur:'tanik',alt,tanik:W,gorulen,kesinlik:k,ortu:gorulen?d.kisi(gorulen).ortu:null,nereden,mekan:m,zaman:t,olay:c.id,
        ...(alt==='ses'?{anahtar:c.yontem==='tufek'?'silah-sesi':'bagirti'}:{}),gercek:{neden:gorulen?'gordu':'duydu'}});
      if(gorulen===A) kanit.push(iz.id);
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
      if(zt.olasilik(Math.min(.95,p))) gorenler.push({W,wy});
      else if(c.yontem==='tufek'||zt.olasilik(.15)) duyanlar.push({W,wy});
    }
    // Kalabalık komşu mekân vakayı tek tanıkla çözmesin: en çok iki gören, üç duyan.
    for(const g of zt.karistir(gorenler).slice(0,2).sort((a,b)=>a.W<b.W?-1:1)) tanikIzi(g.W,'gordu',A,g.wy);
    for(const g of zt.karistir(duyanlar).slice(0,3).sort((a,b)=>a.W<b.W?-1:1)) tanikIzi(g.W,'ses',null,g.wy);

    // Gece yokluğu: o an evde olanlar fark eder (yalnızca cinayet anına bakar; bu yüzden dolaylı akışta değil).
    const dolayli=(iz,zz)=>ekle({tur:'dolayli',cinayet:c.id,...iz});
    const evdekiler=(k,u)=>cz.yer[k][u]===d.kisi(k).ev?[]:(d.evHalki[d.kisi(k).ev]||[]).filter(h=>h!==k&&cz.yer[h][u]===d.kisi(k).ev);
    if(dilim==='gece'){
      const h=evdekiler(A,t).filter(h=>h!==V);
      if(h.length&&zt.olasilik(o.geceYoklugu)){
        const iz=dolayli({alt:'gece-yoklugu',kisi:A,fark_eden:zt.sec(h),zaman:t,mekan:d.kisi(A).ev,olay:c.id,gercek:{neden:'katil-disaridaydi'}});
        kanit.push(iz.id);
      }
      // Aynı gece sırrı yüzünden dışarıda olan masumun boş yatağı da fark edilebilir.
      for(const X of d.ids){
        if(ilgili.includes(X)||!cz.canli(X,t)||!(cz.neden[X][t]||'').startsWith('sir:')) continue;
        const hx=evdekiler(X,t);
        if(!hx.length||!zt.olasilik(.3)) continue;
        const sirId=cz.neden[X][t].slice(4);
        const ol=olayEkle({tur:'gizli-hareket',zaman:t,mekan:cz.yer[X][t],kisiler:[X],sir:{sahip:X,sir:sirId}});
        const iz=dolayli({alt:'gece-yoklugu',kisi:X,fark_eden:zt.sec(hx),zaman:t,mekan:d.kisi(X).ev,olay:ol.id,yaniltici:true,gercek:{neden:'gizli-isi-vardi'}});
        yaniltici({izler:[iz.id],isaret:[X],aciklama:'gizli-isi-vardi',olay:ol.id,curutme:[{tur:'konum',kisi:X,zaman:t},{tur:'sir',sahip:X,sir:sirId}]});
      }
    }
    // Çözülebilirlik (cinayet anına kadarki bilgiyle): katili gösteren iz hiç yoksa olay yerine bir iz daha düşer.
    // Güçlü iz (fotoğraf ya da yüzden tanık) yoksa dikkatsiz katil bir iz daha bırakabilir: çoğu zaman birkaç kişide
    // olan bir şey (lif, ayak izi), seyrek olarak tek sahipli bir eşya.
    const guclu=()=>kanit.map(id=>izler.find(i=>i.id===id)).filter(i=>i.alt!=='gece-yoklugu'&&(i.tur!=='tanik'||i.kesinlik==='yuz')).length;
    const birakilan=()=>izler.filter(i=>i.cinayet===c.id&&i.sahip===A&&i.esya).map(i=>i.esya);
    if(guclu()<1&&z.olasilik(o.ekIz)){
      const s=z.agirlikli(izSecenekleri(A,t,false,[...birakilan(),...(c.silah?[c.silah.esya]:[])]).filter(x=>!izler.some(i=>i.cinayet===c.id&&i.sahip===A&&i.anahtar===x.anahtar)));
      if(s) kanit.push(katilIziEkle(A,s,'katil-birakti').id);
    }
    if(!kanit.length){const iz=katilIzi(A,'katil-birakti',true); if(iz) kanit.push(iz.id);}

    // --- Dolaylı (sonradan fark edilen; cinayetten sonraki çizelgeye bakar) ---
    if((c.yontem==='bicak'||c.yontem==='darbe')&&zd.olasilik(o.kanliGiysi)){
      const f=farkEden(A,t,t+D,[V],true,V);
      if(f) kanit.push(dolayli({alt:'kanli-giysi',kisi:A,ortu:d.kisi(A).ortu,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'katilin-giysisi'}}).id);
    }
    if(['bogma','suda-bogma','asma','itme'].includes(c.yontem)&&zd.olasilik(o.tirmik)){
      const f=farkEden(A,t,t+D,[V],true,V);
      if(f) kanit.push(dolayli({alt:'tirmik',kisi:A,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'kurban-tirmaladi'}}).id);
    }
    for(const iz of izler.filter(i=>i.cinayet===c.id&&i.tur==='fiziksel'&&i.alt==='esya'&&i.sahip===A&&i.iztur==='nesne'&&i.esya)){
      const f=farkEden(A,t,t+2*D,[V],true,V);
      if(f) kanit.push(dolayli({alt:'eksik-esya',kisi:A,esya:iz.esya,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:c.id,gercek:{neden:'olay-yerinde-dusurdu'}}).id);
    }
    if(kacanY){
      const Q=kt.kisi;
      if(zd.olasilik(.7)){
        const f=farkEden(Q,t,t+D,ilgili);
        if(f) kacanY.izler.push(dolayli({alt:'yirtik-giysi',kisi:Q,ortu:d.kisi(Q).ortu,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:kt.olay,yaniltici:true,gercek:{neden:'saldiriya-ugradi'}}).id);
      }
      if(esyaIzi(kt.esya).tur==='nesne'){
        const f=farkEden(Q,t,t+2*D,ilgili);
        if(f) kacanY.izler.push(dolayli({alt:'eksik-esya',kisi:Q,esya:kt.esya,fark_eden:f.kim,zaman:f.u,mekan:f.mekan,olay:kt.olay,yaniltici:true,gercek:{neden:'kacarken-dusurdu'}}).id);
      }
    }
    if(tuzakY){
      const ol=olaylar.find(x=>x.id===c.tuzak.olay), O=c.tuzak.sahip;
      for(let u=ol.zaman+1;u<=Math.min(t+D,zaman.T-1);u++){
        if(!cz.canli(O,u)) break;
        if(cz.yer[O][u]===ol.mekan&&!cz.sahne(ol.mekan,u)){
          const iz=dolayli({alt:'eksik-alet',kisi:O,esya:c.tuzak.esya,sahip:O,fark_eden:O,zaman:u,mekan:ol.mekan,olay:ol.id,gercek:{neden:'calinmisti',cinayettenOnce:u<t}});
          tuzakY.curutme.unshift({tur:'iz',iz:iz.id});
          break;
        }
      }
    }
    if(c.silah&&c.silah.calinti){
      const ol=olaylar.find(x=>x.id===c.silah.olay), O=c.silah.sahip;
      for(let u=ol.zaman+1;u<=Math.min(t+D,zaman.T-1);u++){
        if(!cz.canli(O,u)) break;
        if(cz.yer[O][u]===ol.mekan&&!cz.sahne(ol.mekan,u)){
          const iz=dolayli({alt:'eksik-alet',kisi:O,esya:c.silah.esya,sahip:O,fark_eden:O,zaman:u,mekan:ol.mekan,olay:ol.id,gercek:{neden:'calinmisti',cinayettenOnce:u<t}});
          if(calintiY) calintiY.curutme.unshift({tur:'iz',iz:iz.id});
          break;
        }
      }
    }
  }
  return {izler,yanilticilar};
}

// Tamamlama: çözücünün iki bağımsız zincir bulamadığı katil için vakaya bir iz daha eklenir.
// Sırayla denenir (bu cinayette henüz denenmemiş tür önce): ertesi gün giysisindeki kan ya da tırmık onu korumayacak
// biri tarafından görülür, komşu mekândan biri yüzünü seçer, ya da olay yerine katilin bir izi daha düşer (dikkatsiz katil;
// çoğu zaman birkaç kişide olan bir iz, tek sahipli eşya en son). Hepsi çizelgeye uyar (denetim aynı kuralları sınar).
// Döner: eklenen iz ya da null. vaka yerinde değişir (izler ve cinayetin iz listesi).
// sonTur: tek sahipli eşya izi ancak son turda, başka hiçbir yol kalmamışsa eklenir.
export function izTamamla(vaka,cinayetId,{sonTur=true}={}){
  const c=vaka.cinayetler.find(x=>x.id===cinayetId); if(!c) return null;
  const burada=vaka.izler.filter(i=>i.cinayet===c.id&&i.gercek.tamamlama);
  const turu=i=>i.tur;
  // Sorguyla bulunan izler önce: fotoğraftan tek başına çözülen vaka kolaylaşır.
  const sira=[['dolayli',dolayliTamamla],['fiziksel',fizikselTamamla],['tanik',tanikTamamla]];
  // Az denenmiş tür önce; eşitlikte sorguyla bulunan (dolaylı, tanık) fizikselden önce gelir.
  const pay={tanik:0,dolayli:.3,fiziksel:1.6};
  sira.sort((a,b)=>burada.filter(i=>turu(i)===a[0]).length+pay[a[0]]-burada.filter(i=>turu(i)===b[0]).length-pay[b[0]]);
  for(const [,f] of sira){const iz=f(vaka,c); if(iz) return iz;}
  return sonTur?fizikselTamamla(vaka,c,true):null;
}
const yeniId=(vaka,c)=>{const n=izTabani(c.id)+90; let k=1; while(vaka.izler.some(i=>i.id==='i'+(n+k))) k++; return 'i'+(n+k);};
const KORUYAN_T=['es','ebeveyn','cocuk','sevgili','sever','korur','dost','borclu','korkar','ortak'];
const relOf=(vaka,a,b)=>vaka.iliskiler.filter(i=>i.kimden===a&&i.kime===b).map(i=>i.tur);
const koruyanMi=(vaka,h,A)=>relOf(vaka,h,A).some(r=>KORUYAN_T.includes(r));

// Olay yerine katilin bir izi daha: yalnızca gerçekten taşıdığı bir eşyadan ya da örtüsünden; nesne ya da silah
// olabilen eşya vakada başka hiçbir yerde geçmemeli (kaybolan eşya geri gelmez). En ayırt edici iz seçilir.
function fizikselTamamla(vaka,c,tekSahipliSerbest=false){
  const A=c.katil, k=vaka.kisiler[A];
  const adaySay={};
  for(const [id,x] of Object.entries(vaka.kisiler)){
    for(const e of x.esyalar) (adaySay[esyaIzi(e).iz]??=new Set()).add(id);
    if(ORTU_IZ[x.ortu]) (adaySay[ORTU_IZ[x.ortu]]??=new Set()).add(id);
  }
  const burada=vaka.izler.filter(i=>i.cinayet===c.id);
  const kullanildi=e=>vaka.izler.some(i=>i.sahip===A&&i.esya===e)||vaka.olaylar.some(o=>o.sahip===A&&o.esya===e)||vaka.cinayetler.some(x=>x.silah&&x.silah.sahip===A&&x.silah.esya===e)||vaka.cinayetler.some(x=>x.kacanTanik&&x.kacanTanik.kisi===A&&x.kacanTanik.esya===e);
  const l=[];
  for(const e of k.esyalar){
    const x=esyaIzi(e);
    if((c.silah&&c.silah.sahip===A&&c.silah.esya===e)||burada.some(i=>i.anahtar===x.iz)) continue;
    if((x.tur==='nesne'||ESYA[e]?.silah)&&kullanildi(e)) continue; // silah olabilen eşya da başka yerde geçmemeli
    l.push({esya:e,ortu:null,anahtar:x.iz,iztur:x.tur});
  }
  if(ORTU_IZ[k.ortu]&&!burada.some(i=>i.anahtar===ORTU_IZ[k.ortu])) l.push({esya:null,ortu:k.ortu,anahtar:ORTU_IZ[k.ortu],iztur:'lif'});
  if(!l.length) return null;
  // Tercih: olay yerindeki başka bir izle kesişince yalnızca katilde buluşan iz (aba tiftiği ∩ çarık izi), sonra
  // birkaç kişide olan iz (mazeretlerle daraltılır), sonra kalabalık; tek sahipli eşya en son.
  const mevcut=burada.filter(i=>i.tur==='fiziksel'&&!i.yaniltici&&(i.adaylar||[]).includes(A)&&i.adaylar.length>1).map(i=>new Set(i.adaylar));
  const tercih=x=>{
    const C=adaySay[x.anahtar], n=C.size;
    if(n===1) return 20;
    if(mevcut.some(E=>[...C].filter(k=>E.has(k)).length===1)) return n/10;
    return n<=4?n:4+n;
  };
  l.sort((a,b)=>tercih(a)-tercih(b)||(a.anahtar<b.anahtar?-1:1));
  if(adaySay[l[0].anahtar].size===1&&!tekSahipliSerbest) return null; // tek sahipli eşyayı tamamlama eklemez
  const s=l[0];
  const iz={tur:'fiziksel',alt:'esya',anahtar:s.anahtar,iztur:s.iztur,esya:s.esya,ortu:s.ortu,sahip:A,adaylar:[...adaySay[s.anahtar]].sort(),
    mekan:c.mekan,zaman:c.zaman,olay:c.id,gercek:{neden:'katil-birakti',tamamlama:true},id:yeniId(vaka,c),cinayet:c.id,yaniltici:false};
  vaka.izler.push(iz); c.izler.push(iz.id);
  return iz;
}

// Giysideki kan (bıçak, darbe) ya da yüzdeki tırmık (boğma, asma, itme): onu korumayacak biri, ilk gün içinde.
function dolayliTamamla(vaka,c){
  const A=c.katil, D=vaka.ayar.dilimler.length, T=vaka.ayar.gunSayisi*D;
  const alt=(c.yontem==='bicak'||c.yontem==='darbe')?'kanli-giysi':['bogma','suda-bogma','asma','itme'].includes(c.yontem)?'tirmik':null;
  if(!alt||vaka.izler.some(i=>i.cinayet===c.id&&i.alt===alt&&i.kisi===A)) return null;
  const sahne=(m,u)=>vaka.cinayetler.some(x=>x.mekan===m&&x.zaman===u);
  const zaten=new Set(vaka.izler.filter(i=>i.cinayet===c.id).flatMap(i=>[i.tanik,i.fark_eden]).filter(Boolean)); // yeni bir kaynak olsun
  for(let u=c.zaman+1;u<=Math.min(c.zaman+D,T-1);u++){
    const mk=vaka.cizelge[A][u]; if(mk==null) return null;
    if(sahne(mk,u)) continue;
    const h=Object.keys(vaka.cizelge).sort().find(k=>k!==A&&k!==c.kurban&&vaka.cizelge[k][u]===mk&&!koruyanMi(vaka,k,A)&&vaka.kisiler[k].mizac!=='korkak'&&!zaten.has(k));
    if(!h) continue;
    const iz={tur:'dolayli',cinayet:c.id,alt,kisi:A,...(alt==='kanli-giysi'?{ortu:vaka.kisiler[A].ortu}:{}),fark_eden:h,zaman:u,mekan:mk,olay:c.id,
      gercek:{neden:alt==='tirmik'?'kurban-tirmaladi':'katilin-giysisi',tamamlama:true},id:yeniId(vaka,c),yaniltici:false};
    vaka.izler.push(iz); c.izler.push(iz.id);
    return iz;
  }
  return null;
}

// Komşu mekândan biri katilin yüzünü seçti (gürültüye uyanan, yoldan geçen). Korkak, katil ya da katilin yakını olmaz.
function tanikTamamla(vaka,c){
  const A=c.katil, t=c.zaman, m=c.mekan;
  const katil=new Set(vaka.cinayetler.flatMap(x=>[x.katil,x.yardimci].filter(Boolean)));
  const zaten=new Set(vaka.izler.filter(i=>i.cinayet===c.id).flatMap(i=>[i.tanik,i.fark_eden]).filter(Boolean)); // yeni bir kaynak olsun
  const l=Object.keys(vaka.cizelge).sort().filter(k=>{
    const y=vaka.cizelge[k][t];
    return y&&y!==m&&(vaka.harita[m]||[]).includes(y)&&!zaten.has(k)&&!katil.has(k)&&k!==c.kurban&&vaka.kisiler[k].mizac!=='korkak'&&!koruyanMi(vaka,k,A);
  });
  if(!l.length) return null;
  const W=l.find(k=>vaka.neden[k][t]!=='ev')||l[0];
  const iz={tur:'tanik',alt:'gordu',tanik:W,gorulen:A,kesinlik:'yuz',ortu:vaka.kisiler[A].ortu,nereden:vaka.cizelge[W][t],mekan:m,zaman:t,olay:c.id,
    gercek:{neden:'gordu',tamamlama:true},id:yeniId(vaka,c),cinayet:c.id,yaniltici:false};
  vaka.izler.push(iz); c.izler.push(iz.id);
  return iz;
}
