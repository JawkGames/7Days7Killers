// Kendi kendine oynayan dedektif: duman testi ve oynanış değerlendirmesi için.
// "Dikkatli ama sıradan" bir oyuncuyu taklit eder: gerçeğe (vaka.katiller, tavır, izin gerçek sahibi, cinayetin
// yöntemi) bakmaz; yalnızca ekranda gördüğünü ve defterini kullanır. Herkesin bildiği köy bilgisi: kim nerede oturur,
// kim ne giyer, kim kimin eşi/çocuğu, hangi mekân hangisine komşu. Sorgu hakkı ve sabır oyunla aynıdır.
//
//   otoOyna(b, {geriSarma:1, tedbir:true, yaz:(goster, eylem)=>{}}) → {durum, adimSayisi, secilenler, donguler:[{dongu, secilenler}]}
//   donguler: her karar anında (Rewind'den önce de) oyuncunun o an vereceği hüküm; ölçüm aracı bunu puanlar.

import {oyunBaslat,acilis,secenekler,uygula,sorular,hukumAdaylari,tedbirAlinabilir} from './oyun.js';
import {celiskiBul,ifadeBul} from '../diyalog/defter.js';
import {rngAl} from '../diyalog/adlar.js';
import {mudahalePenceresi} from '../simulasyon/index.js';

const KANLI=['bicak-yarasi','ezik-yara'], TIRMIK=['bogaz-morlugu','islak-ceset','ip-izi','dusme-yarasi'];
const SEBEP=['hasim','borclu','korkar'];

// Herkesin bildiği: ev, giysi, aile (eş, ana-baba, çocuk).
function kamuBilgi(b){
  if(b._otoKamu) return b._otoKamu;
  const v=b.vaka, aile={};
  for(const id of b.ids) aile[id]=new Set();
  for(const i of v.iliskiler) if(['es','ebeveyn','cocuk'].includes(i.tur)) aile[i.kimden].add(i.kime);
  const k={ev:id=>v.kisiler[id].ev,ortu:id=>v.kisiler[id].ortu,aile,dilimler:v.ayar.dilimler,ayar:v.ayar};
  b._otoKamu=k;
  return k;
}
const izBilgi=(b,id)=>b.izKayit.get(id)??null; // fotoğrafta görülen (anahtar, alt); sahibi kullanılmaz

// Defterden çıkarım: her cinayet için kişi başına şüphe puanı ve kısa gerekçe.
//   {cinayetler:[{id, kurban, zaman, mekan, puan:{kisi:x}}], genel:{kisi:x}, testler:[{kisi, cinayet, sonuc}]}
export function cikarim(b,d,{ayrinti=false}={}){
  const df=d.defter, K=kamuBilgi(b), D=K.dilimler.length;
  const ifadeler=df.ifadeler;
  const yuzunden=new Map(); // izId -> yara anahtarı (fotoğraftan)
  for(const x of df.izler){const iz=izBilgi(b,x.iz); if(iz&&iz.alt==='yara') yuzunden.set(x.cinayet,iz.anahtar);}
  const kurbanlar=new Set(df.cinayetler.map(c=>c.kurban));
  const olumAni={}; for(const c of df.cinayetler) olumAni[c.kurban]=Math.min(olumAni[c.kurban]??Infinity,c.zaman);
  const kendiYeri=(k,t)=>{for(const f of ifadeler) if(f.kisi===k) for(const i of f.iddialar||[]) if(i.tur==='konum'&&i.kisi===k&&i.zaman===t) return i.mekan; return null;};
  const tedbirler=df.tedbirler||[], gozlem=df.gozlemler||[];
  const goruldu=(cid,dongu)=>gozlem.some(g=>g.cinayet===cid&&g.dongu===dongu);
  // Temel zaman çizgisi: döngüsünde ilk tedbirden önce işlenmiş cinayetler (Rewind'de tedbirsiz aynen tekrarlanır).
  const cinBul=id=>df.cinayetler.find(c=>c.id===id);
  const ilkTedbir=L=>Math.min(Infinity,...tedbirler.filter(t=>t.dongu===L).map(t=>mudahalePenceresi(K.ayar,t.gun)[0]));
  const temel=new Set(gozlem.filter(g=>{const c=cinBul(g.cinayet); return c&&c.zaman<ilkTedbir(g.dongu);}).map(g=>g.cinayet));
  // L döngüsü an'a kadar temel çizgiden şaşmadı mı? (önceki tedbirler bir şeyi değiştirmediyse sınama geçerlidir)
  // Alıkoymanın ertelediği (sınamanın olumlu çıktığı) cinayet ve onun yerine gelen yeni cinayet şaşma sayılmaz.
  const olumlu=new Set();
  const sasmadi=(L,an)=>[...temel].every(id=>cinBul(id).zaman>=an||goruldu(id,L)||olumlu.has(L+'|'+id));
  // Alıkoyma testi: X alıkonduğu gece beklenen cinayet yine olduysa X o cinayetin katili değildir; olmadıysa güçlü şüphe.
  const testler=[];
  for(const t of tedbirler){
    if(t.tur!=='alikoy') continue;
    const [ilk,son]=mudahalePenceresi(K.ayar,t.gun);
    if(!sasmadi(t.dongu,ilk)) continue;
    for(const c of df.cinayetler){
      if(!temel.has(c.id)||c.zaman<ilk||c.zaman>son||c.kurban===t.kisi||c.dongu>=t.dongu) continue;
      // Sonuç ancak fotoğrafın geleceği gün geçtiyse bilinir.
      const gecti=d.zaman.dongu>t.dongu||(d.zaman.dongu===t.dongu&&d.zaman.gun>=c.fotografGunu);
      if(!gecti) continue;
      const sonuc=goruldu(c.id,t.dongu)?'temiz':'supheli';
      if(sonuc==='supheli') olumlu.add(t.dongu+'|'+c.id);
      testler.push({kisi:t.kisi,cinayet:c.id,sonuc});
    }
  }
  const sonuc=[], genel={};
  for(const c of df.cinayetler){
    const p={}, neden={}; let etiket='';
    const ekle=(k,x)=>{if(!k||k===c.kurban||!b.vaka.kisiler[k]) return; if((olumAni[k]??Infinity)<c.zaman) return; p[k]=(p[k]||0)+x; if(ayrinti){const n=neden[k]??={}; n[etiket]=(n[etiket]||0)+x;}};
    const E=e=>{etiket=e;};
    const t=c.zaman, m=c.mekan, yara=yuzunden.get(c.id);
    const izler=new Set(df.izler.filter(x=>x.cinayet===c.id).map(x=>x.iz));
    const oy={}; // iz -> {kisi: oy}
    const sahneyeKoyan={}, mazeret={};
    for(const f of ifadeler){
      const s=f.kisi;
      for(const i of f.iddialar||[]){
        E(i.tur);
        if(i.tur==='konum'&&i.zaman===t){
          if(i.mekan===m&&i.kisi!==c.kurban){ if(i.kisi===s) ekle(i.kisi,1); else (sahneyeKoyan[i.kisi]??=new Set()).add(s); }
          else if(i.kisi!==s&&!K.aile[i.kisi].has(s)){
            const sy=kendiYeri(s,t);
            if(sy==null||sy===i.mekan||f.soru.tur==='gordu') (mazeret[i.kisi]??=new Set()).add(s);
          }
          const ky=kendiYeri(i.kisi,t);
          if(i.kisi!==s&&ky&&ky!==i.mekan) ekle(i.kisi,1.5); // kendi söylediği yer başkasının gördüğünü tutmuyor
        }
        if(i.tur==='degil'&&i.zaman===t) ekle(i.kisi,i.mekan===K.ev(i.kisi)?2:1.5);
        if(i.tur==='siluet'&&i.zaman===t&&i.mekan===m){
          const l=b.ids.filter(x=>K.ortu(x)===i.ortu&&x!==s);
          for(const x of l) ekle(x,3/l.length);
          if(i.tahmin) ekle(i.tahmin,.5);
        }
        if((i.tur==='sahip'||i.tur==='adaylar')&&izler.has(i.iz)){
          const o=oy[i.iz]??={};
          if(i.tur==='sahip'&&i.kisi!==s) o[i.kisi]=(o[i.kisi]||0)+(b.vaka.kisiler[s].mizac==='dedikoducu'?.5:1); // dedikoducunun sözü yarım
          if(i.tur==='sahip'&&i.kisi===s) o[s]=(o[s]||0)+.6; // kabul eden çoğu zaman bir açıklama da yapar
          if(i.tur==='adaylar') for(const x of i.kisiler) o[x]=(o[x]||0)+1/i.kisiler.length;
        }
        if(i.tur==='dolayli'&&i.isimsiz&&i.ortu&&f.soru.cinayet===c.id){
          const l=b.ids.filter(x=>K.ortu(x)===i.ortu&&x!==s), w=(i.alt==='kanli-giysi'&&KANLI.includes(yara))||(i.alt==='tirmik'&&TIRMIK.includes(yara))?4:1.5;
          for(const x of l) ekle(x,w/l.length);
        }
        if(i.tur==='dolayli'&&i.kisi&&i.zaman>=t&&i.zaman<=t+2*D&&i.kisi!==s){
          const w={'kanli-giysi':KANLI.includes(yara)?5:2,tirmik:TIRMIK.includes(yara)?5:2,'eksik-esya':2,'yirtik-giysi':-1,'eksik-alet':0}[i.alt]??0;
          ekle(i.kisi,w);
        }
        if(i.tur==='fail'&&i.cinayet===c.id&&i.kisi!==s) ekle(i.kisi,1.5);
        if(i.tur==='iliski'&&i.hedef===c.kurban&&(i.iliskiler||[]).some(x=>SEBEP.includes(x))) ekle(i.kisi,i.dedikodu?.8:1.5);
        if(i.tur==='iliski'&&i.kisi===s&&i.hedef===c.kurban&&(i.iliskiler||[]).some(x=>SEBEP.includes(x))) ekle(s,1);
      }
    }
    E('sahne'); for(const [x,l] of Object.entries(sahneyeKoyan)) ekle(x,Math.min(8,4*l.size));
    E('mazeret'); for(const [x,l] of Object.entries(mazeret)) if(!sahneyeKoyan[x]) ekle(x,-Math.min(5,2.5*l.size));
    // Giysi lifi: kim ne giyer herkes bilir.
    for(const id of izler){
      const iz=izBilgi(b,id); if(!iz||iz.alt==='yara'||iz.alt==='kurban-esyasi') continue;
      const ortu=b.kamuIzler[id]?.ortu??(iz.ortu&&!iz.esya?iz.ortu:null);
      if(ortu){const l=b.ids.filter(x=>K.ortu(x)===ortu); const o=oy[id]??={}; for(const x of l) o[x]=(o[x]||0)+1/l.length;}
    }
    E('iz'); for(const o of Object.values(oy)){
      const top=Object.values(o).reduce((a,x)=>a+x,0);
      if(top>0) for(const [x,n] of Object.entries(o)) ekle(x,3.5*n/top);
    }
    // Aleti cinayetten önce çalındığını kendisi söyleyen.
    for(const f of ifadeler) for(const i of f.iddialar||[]) if(i.tur==='dolayli'&&i.alt==='eksik-alet'&&i.kisi===f.kisi&&i.zaman<t) ekle(f.kisi,-1.5);
    E('celiski'); for(const k of df.celiskiler){const fa=ifadeBul(df,k.a); if(k.konu?.tur==='konum'&&k.konu.zaman===t) ekle(k.konu.kisi,2); else if(fa&&k.konu?.tur==='sahip') ekle(k.konu.kisi,1);}
    E('test'); for(const x of testler.filter(x=>x.cinayet===c.id)) ekle(x.kisi,x.sonuc==='temiz'?-25:14);
    // Karakolda alıkonan o gece kimseyi öldüremez.
    for(const tb of tedbirler) if(tb.tur==='alikoy'&&goruldu(c.id,tb.dongu)){const [a,z]=mudahalePenceresi(K.ayar,tb.gun); if(t>=a&&t<=z) ekle(tb.kisi,-25);}
    E('tepki'); for(const f of ifadeler) if(f.tepki&&f.soru.zaman===t) ekle(f.kisi,f.tepki.gerginlik*.4);
    sonuc.push({...(ayrinti?{neden}:{}),id:c.id,kurban:c.kurban,zaman:t,mekan:m,dongu:c.dongu,fotografGunu:c.fotografGunu,temel:temel.has(c.id),puan:p});
    for(const [x,n] of Object.entries(p)) if(n>0) genel[x]=(genel[x]||0)+n;
  }
  for(const k of kurbanlar) delete genel[k];
  return {cinayetler:sonuc,genel,testler,sasmadi};
}

// Eski arayüz: kişi başına toplam şüphe (araçlar ve testler için).
export const supheHesapla=(b,d)=>cikarim(b,d).genel;

// Hüküm: ilk döngüde görülen her cinayete en güçlü şüpheli (bir kişi bir kez), kalan yerler genel şüpheyle.
export function hukumSec(b,d){
  const c=cikarim(b,d), aday=new Set(hukumAdaylari(b,d)), n=d.zaman.kural.finalSecimSayisi;
  let ilk=c.cinayetler.filter(x=>x.temel);
  if(ilk.length<n) ilk=[...ilk,...c.cinayetler.filter(x=>!x.temel)];
  const ciftler=[];
  for(const x of ilk) for(const [k,p] of Object.entries(x.puan)) if(aday.has(k)&&p>0) ciftler.push({cinayet:x.id,kisi:k,p});
  ciftler.sort((a,b)=>b.p-a.p||(a.kisi<b.kisi?-1:1));
  const secilen=[], tutulan=new Set();
  for(const x of ciftler){
    if(secilen.length>=n) break;
    if(tutulan.has(x.cinayet)||secilen.includes(x.kisi)) continue;
    secilen.push(x.kisi); tutulan.add(x.cinayet);
  }
  const kalan=[...aday].filter(k=>!secilen.includes(k)).sort((a,b)=>(c.genel[b]||0)-(c.genel[a]||0)||(a<b?-1:1));
  return [...secilen,...kalan].slice(0,n);
}

function cagrilacak(b,d,adaylar){
  const df=d.defter, z=d.zaman, c=cikarim(b,d), K=kamuBilgi(b);
  const bugunku=c.cinayetler.filter(x=>x.fotografGunu<=z.gun&&df.gozlemler?.some(g=>g.cinayet===x.id&&g.dongu===z.dongu)).sort((a,b)=>b.zaman-a.zaman);
  const yeni=bugunku[0];
  const buDongu=new Map();
  for(const f of df.ifadeler) if(f.dongu===z.dongu) (buDongu.get(f.kisi)??buDongu.set(f.kisi,new Set()).get(f.kisi)).add(f.gun);
  const herhangi=new Set(df.ifadeler.map(f=>f.kisi));
  const yonlendirilen=new Set();
  const soruldu=(k,konu)=>df.ifadeler.some(g=>g.kisi===k&&(konu.tur==='sir'?g.soru.tur==='sir'&&g.soru.kisi===konu.sahip:g.soru.id===(konu.tur==='fark'?'fark:'+konu.cinayet:'iz:'+konu.iz)));
  for(const f of df.ifadeler) for(const i of f.iddialar||[]) if(i.tur==='yonlendir'&&!soruldu(i.kisi,i.konu)) yonlendirilen.add(i.kisi);
  const yuzlesilecek=new Set();
  for(const k of df.celiskiler) for(const id of [k.a,k.b]){const f=ifadeBul(df,id); if(f&&!df.ifadeler.some(g=>g.kisi===f.kisi&&g.soru.id==='yuzlesme:'+k.id)) yuzlesilecek.add(f.kisi);}
  const r=rngAl(b.tohum,'oto-cagir',z.gun,z.dongu);
  const puan={};
  for(const id of adaylar){
    let x=r()*2.5;
    if(yonlendirilen.has(id)) x+=10;
    if(yuzlesilecek.has(id)) x+=7;
    for(const s of bugunku.slice(0,2)){
      const p=s.puan[id]||0;
      x+=Math.min(p,8)*(s===yeni?.9:.4);
      if(s.kurban&&K.ev(s.kurban)===K.ev(id)) x+=s===yeni?3:1;
      if(df.cinayetler.find(q=>q.id===s.id)?.bulan===id) x+=s===yeni?5:1.5;
    }
    x+=Math.min(c.genel[id]||0,10)*.25;
    const n=buDongu.get(id)?.size||0;
    x-=n*3.5;
    if(!herhangi.has(id)) x+=3; else if(!n) x+=1.5;
    puan[id]=x;
  }
  return [...adaylar].sort((a,c2)=>puan[c2]-puan[a]||(a<c2?-1:1))[0];
}

const SORU_PAYI={yuzlesme:20,iz:8,yer:6,gordu:8,fark:10,'fark-kisi':8,baskasi:0,fail:-4,iliski:2,sir:-6,'sir-kendi':-14};
function soruSec(b,d,l){
  const K=d.zaman.sorgudaki, df=d.defter;
  const bugun=df.ifadeler.filter(f=>f.kisi===K&&f.gun===d.zaman.gun&&f.dongu===d.zaman.dongu);
  const sorulanTur=new Map(); for(const f of bugun) sorulanTur.set(f.soru.tur,(sorulanTur.get(f.soru.tur)||0)+1);
  // Sahibi iki kişiden aynı duyulmuş izi yeniden göstermek boşa soru.
  const sahipler={};
  for(const f of df.ifadeler) for(const i of f.iddialar||[]) if(i.tur==='sahip'&&i.kisi!==f.kisi) (sahipler[i.iz]??=[]).push(i.kisi);
  const c=cikarim(b,d);
  const puan=q=>{
    let x=q.oncelik+(SORU_PAYI[q.tur]??0)-(sorulanTur.get(q.tur)||0)*(q.tur==='yuzlesme'?0:q.tur==='iz'?6:12);
    if(q.tur==='iz'){const s=sahipler[q.iz]||[]; if(s.length>=2&&new Set(s).size===1&&!s.includes(K)) x-=40;}
    if(q.tur==='baskasi'){const s=c.cinayetler.find(y=>y.zaman===q.zaman); x+=Math.min(6,(s?.puan[q.kisi]||0));}
    if(q.tur==='fark-kisi'){const s=c.cinayetler.find(y=>y.id===q.cinayet); x+=Math.min(6,(s?.puan[q.kisi]||0));}
    return x;
  };
  return [...l].sort((a,b2)=>puan(b2)-puan(a)||(a.id<b2.id?-1:1))[0];
}

// Gün sonu tedbiri. Önceki döngüden bilinen ve bu gece beklenen cinayetin baş şüphelisini (henüz sınanmadıysa)
// alıkoyar. İlk döngüde tedbir almaz (önce olanları görür).
function tedbirSec(b,d){
  const z=d.zaman, c=cikarim(b,d), K=kamuBilgi(b);
  const [ilk,son]=mudahalePenceresi(K.ayar,z.gun);
  const yasayan=new Set(hukumAdaylari(b,d));
  const sinandi=new Set(c.testler.map(t=>t.kisi+'|'+t.cinayet));
  const alikonan=new Set((d.defter.tedbirler||[]).filter(t=>t.tur==='alikoy').map(t=>t.kisi+'|'+t.gun));
  if(z.dongu>1&&!c.sasmadi(z.dongu,ilk)) return null; // zaman çizgisi önceki döngüden şaştı: sınama artık güvenilmez
  const beklenen=c.cinayetler.filter(x=>x.temel&&x.dongu<z.dongu&&x.zaman>=ilk&&x.zaman<=son);
  for(const x of beklenen){
    const l=Object.entries(x.puan).filter(([k,p])=>p>0&&yasayan.has(k)&&!sinandi.has(k+'|'+x.id)&&!alikonan.has(k+'|'+z.gun)).sort((a,b2)=>b2[1]-a[1]);
    if(l.length) return {tur:'tedbir',tedbir:'alikoy',kisi:l[0][0]};
  }
  return null; // ilk döngüde gelecek bilinmez: sıradan oyuncu gözlemler, zaman çizgisini bozmaz
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

export function otoOyna(b,{geriSarma=1,tedbir=true,yaz=null,azamiAdim=8000}={}){
  let d=oyunBaslat({tohum:b.tohum,ayar:b.ayar});
  const a=acilis(b,d); d=a.durum; yaz?.(a.goster,null);
  let n=0, secilenler=null;
  const donguler=[];
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
    }else if(z.adim==='gun-sonu'){
      const e=tedbir&&tedbirAlinabilir(b,d)?tedbirSec(b,d):null;
      s=e?{etiket:'Tedbir',eylem:e}:l.find(x=>x.eylem.tur==='ilerle');
    }else if(z.adim==='karar'){
      const h=hukumSec(b,d);
      donguler.push({dongu:z.dongu,secilenler:h});
      if(z.dongu<=geriSarma) s=l.find(x=>x.eylem.tur==='geriSar');
      else{ secilenler=h; s={etiket:l.find(x=>x.eylem.tur==='hukum').etiket,eylem:{tur:'hukum',kisiler:secilenler}}; }
    }else s=l.find(x=>x.eylem.tur==='incele')??l.find(x=>x.eylem.tur==='ilerle');
    const r=uygula(b,d,s.eylem);
    d=r.durum; yaz?.(r.goster,s);
    if(s.eylem.tur==='sor') d=celiskiAra(b,d,yaz);
  }
  return {durum:d,adimSayisi:n,secilenler,donguler};
}
