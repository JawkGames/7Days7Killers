// Görsel oyun: oyun katmanını (src/oyun/oyun.js) çizim sahnelerine ve arayüz katmanına bağlar.
// Akış: açılış → gün başı → fotoğraf (iz bulma) → çağırma → sorgu (sorgu odası) → gün sonu → … → karar →
// hüküm → kayıp sahneleri → pencere → gerçek. Her adımda kayıt; sayfa yenilenince kaldığı yerden sürer.
//
// Oyun durumu düz veridir (d), vaka bağlamı (b) ondan türer. Ekran yalnızca d.zaman.adim ve küçük bir arayüz
// durumundan (ui: hangi fotoğraf, hüküm seçimi, sonun hangi bölümü) kurulur; ui de kayda girer.
import {koy as koyTemel} from '../icerik/index.js';
import {cekirdekListesi} from '../icerik/olay-cekirdekleri/index.js';
import {gorunusBul} from '../icerik/gorunus/index.js';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,durumKur,ekran,kisiListesi,hukumAdaylari,sonGoster,defterGorunumu} from '../oyun/oyun.js';
import {kaydet,yukle,sil,kayitVerisi} from '../platform/kayit.js';
import {azHareket} from '../platform/tercih.js';
import {DIL_TR} from '../diyalog/adlar.js';
import {sorguZamani} from '../diyalog/cevap.js';
import {konus,sus,konusmaOlay} from '../diyalog/konusma.js';
import {poz,karakterSec} from '../cizim/rig/index.js';
import {girisOlay} from '../cizim/sahneler/sorgu-odasi/giris.js';
import {sorguEtki} from '../cizim/sahneler/sorgu-odasi/sahne.js';
import {cv} from '../cizim/teknik/tuval.js';
import {sahneYoneticisi} from './sahne-yoneticisi.js';
import {masaSahnesi,durganSahne,sorguSahnesi,kayipSahne,pencereSahne,karanlikSahne} from './sahneler.js';
import {fotoGorunumu} from './fotograf.js';
import {defterPaneliKur} from './defter-paneli.js';
import {portreKoy,portreHazirla} from './portre.js';
import {M,el,bekle,sonrakiKare,oturumOku,oturumYaz} from './yardim.js';

const koy={...koyTemel,cekirdekler:cekirdekListesi};
const OY=DIL_TR.oyun;
const OTURUM='7d7k-oyunda';
const lakap=id=>DIL_TR.kisiler[id]?.lakap??id;

// Masadaki fotoğraflar (en yenisi önce): oyun katmanının "masadakiler" tanımıyla aynı.
export function masadakiCinayetler(b,d){
  const S=sorguZamani(b.vaka,d.zaman.gun);
  return b.vaka.cinayetler.filter(c=>c.fotografGunu<=d.zaman.gun&&c.zaman<S).slice().reverse();
}

export function oyunArayuzuKur(){
  const $=id=>document.getElementById(id);
  const kokEl=$('oyun'), katman=$('katman'), ust=$('ust'), ustDurum=$('ustDurum'), karartma=$('karartma');
  document.title=M('oyun.sayfa');
  cv.setAttribute('aria-label',M('oyun.sahneAciklama'));

  const yonetici=sahneYoneticisi();
  let b=null, d=null, ui=uiYeni(), ekranNo=0, foto=null, dokunma=null, soruYenile=null, fotoNoktalari=()=>[];
  function uiYeni(){return {foto:0,hukum:null,son:null};}

  const defter=defterPaneliKur({kok:$('defter'),dugme:$('defterDugme'),al:()=>({b,d}),eylemYap:e=>{
    const r=dene(()=>uygulaKaydet(e));
    if(r&&soruYenile) soruYenile(); // yeni çelişki yeni yüzleştirme sorusu açabilir
    if(r&&d.zaman.adim==='cagirma'&&e.tur==='isaretle') ekranGoster([]);
    return r;
  }});

  /* ---------- ortak ---------- */
  function dene(fn){
    try{return fn();}
    catch(e){console.error(e); hataGoster(); return null;}
  }
  function hataGoster(){
    const k=katman.querySelector('.hata-ileti')||el('p',{sinif:'hata-ileti anlatim'});
    k.textContent=M('oyun.hata'); if(!k.parentNode) katman.prepend(k);
  }
  function uygulaKaydet(e){
    const r=uygula(b,d,e);
    d=r.durum; kaydetSessiz(); ustYaz();
    return r;
  }
  async function kaydetSessiz(){
    if(!d) return;
    const v={...kayitVerisi({zaman:d.zaman,defter:d.defter}),arayuz:ui};
    const r=await kaydet(v);
    if(!r.tamam) console.warn(M('oyun.kayitHata'),r.neden);
  }
  function ustYaz(){
    if(!d){ust.hidden=true; return;}
    ust.hidden=false;
    const z=d.zaman, p=[M('oyun.gun',{gun:z.gun})];
    if(z.dongu>1) p.push(M('oyun.dongu',{n:z.dongu}));
    if(['gun-basi','fotograf','cagirma','sorgu'].includes(z.adim)) p.push(M('oyun.hak',{n:z.sorguKalan}));
    ustDurum.textContent=p.join(' · ');
  }
  // Ekranı karartıp değiştirir, sonra açar (az hareket tercihinde doğrudan).
  async function karart(fn){
    if(azHareket){fn(); return;}
    karartma.classList.add('kapali');
    await bekle(620);
    fn();
    await sonrakiKare(); await sonrakiKare();
    karartma.classList.remove('kapali');
  }
  const yeniEkran=()=>{ekranNo++; kokEl.classList.remove('ekran-sorgu'); dokunma=null; soruYenile=null; fotoNoktalari=()=>[]; return ekranNo;};
  const dugme=(yazi,tik,sinif='')=>el('button',{sinif:'dugme '+sinif,yazi,tik:()=>dene(tik)});
  // Tanınmayan eylemler düz düğme olur: oyun katmanı yeni eylem eklerse arayüz çökmez.
  function digerDugmeler(liste,bilinen){
    return liste.filter(s=>!bilinen.includes(s.eylem.tur)).map(s=>dugme(s.etiket,()=>{const r=uygulaKaydet(s.eylem); ekranGoster(r.goster);}));
  }
  const parcaYaz=p=>{
    if(p.tur==='baslik') return el('h2',{yazi:p.metin});
    if(p.tur==='ayrac') return el('hr');
    if(p.tur==='soz') return el('p',{},el('b',{yazi:lakap(p.kisi)+': '}),'«'+p.metin+'»');
    return el('p',{sinif:p.tur==='sistem'?'sistem':p.tur,yazi:p.metin});
  };

  /* ---------- ekran seçimi ---------- */
  function ekranGoster(parcalar,{devam=false}={}){
    ustYaz();
    defter.yenile();
    switch(d.zaman.adim){
      case 'gun-basi': return gunBasiEkrani(parcalar);
      case 'fotograf': return fotografEkrani();
      case 'cagirma': return cagirmaEkrani(parcalar);
      case 'sorgu': return sorguEkrani(parcalar,{devam});
      case 'gun-sonu': return gunSonuEkrani(parcalar);
      case 'karar': return ui.hukum?hukumEkrani():kararEkrani(parcalar);
      case 'bitti': return sonEkrani();
    }
    return kartEkrani(parcalar,[...digerDugmeler(secenekler(b,d),[])]);
  }

  /* ---------- açılış ---------- */
  function acilisEkrani(kayit){
    yeniEkran(); b=null; d=null; ui=uiYeni(); ustYaz(); defter.kapa();
    yonetici.gec('masa',masaSahnesi((k,w,h)=>{k.fillStyle='rgba(0,0,0,.35)'; k.fillRect(0,0,w,h);}));
    const istenen=Number(new URLSearchParams(location.search).get('tohum'));
    const tohum=Number.isFinite(istenen)&&istenen>0?Math.floor(istenen):Math.floor(Math.random()*100000)+1;
    const kutu=el('div',{sinif:'acilis belir'},
      el('h1',{yazi:M('oyun.baslik')}),
      el('p',{sinif:'alt-baslik',yazi:M('oyun.altBaslik')}),
      kayit?dugme(M('oyun.devam'),()=>devamEt(kayit),'ana'):null,
      kayit?el('p',{sinif:'kucuk',yazi:M('oyun.devamBilgi',{gun:kayit.zaman.gun,n:kayit.zaman.dongu})}):null,
      dugme(M('oyun.yeni'),()=>yeniOyun(tohum),kayit?'':'ana'),
      el('p',{sinif:'kucuk',yazi:M('oyun.tohum',{tohum})}));
    katman.replaceChildren(kutu);
    kutu.querySelector('button')?.focus({preventScroll:true});
  }

  async function hazirlan(){
    katman.replaceChildren(el('p',{sinif:'anlatim',yazi:M('oyun.hazirlaniyor'),ozellik:{style:'margin:auto'}}));
    await sonrakiKare(); await sonrakiKare();
  }
  async function yeniOyun(tohum){
    await hazirlan();
    await sil();
    dene(()=>{
      b=baglamKur({tohum,koy});
      const a=acilis(b,oyunBaslat({tohum}));
      d=a.durum; ui=uiYeni(); oturumYaz(OTURUM,'1'); kaydetSessiz();
      portreHazirla(b.ids);
      karart(()=>ekranGoster(a.goster));
    });
  }
  async function devamEt(kayit){
    await hazirlan();
    dene(()=>{
      b=baglamKur({tohum:kayit.zaman.tohum,koy});
      d=durumKur(kayit);
      ui={...uiYeni(),...(kayit.arayuz||{})};
      oturumYaz(OTURUM,'1');
      portreHazirla(b.ids);
      ekranGoster(ekran(b,d),{devam:true});
    });
  }

  /* ---------- kâğıt kartlı ekranlar ---------- */
  function kartEkrani(parcalar,dugmeler,{gece=false,sahne=null}={}){
    yeniEkran();
    yonetici.gec('masa',sahne||masaSahnesi(gece?(k,w,h)=>{k.fillStyle='rgba(0,0,6,.62)'; k.fillRect(0,0,w,h);}:null));
    const kart=el('div',{sinif:'kagit belir'+(gece?' gece':''),ozellik:{'aria-live':'polite'}},
      ...parcalar.map(parcaYaz),
      el('div',{sinif:'dugme-sira'},...dugmeler));
    katman.replaceChildren(kart);
    kart.querySelector('.dugme.ana,.dugme')?.focus({preventScroll:true});
  }

  function gunBasiEkrani(parcalar){
    const g=parcalar.length?parcalar:ekran(b,d);
    const l=secenekler(b,d);
    const ileri=l.find(s=>s.eylem.tur==='ilerle');
    kartEkrani(g.filter((p,i)=>!(p.tur==='ayrac'&&i===0)),[
      ileri?dugme(ileri.etiket,()=>{const r=uygulaKaydet(ileri.eylem); ui.foto=0; karart(()=>ekranGoster(r.goster));},'ana'):null,
      ...digerDugmeler(l,['ilerle'])]);
  }

  function gunSonuEkrani(parcalar){
    const g=(parcalar.length?parcalar:ekran(b,d)).filter(p=>p.tur!=='ayrac');
    const l=secenekler(b,d), ileri=l.find(s=>s.eylem.tur==='ilerle');
    kartEkrani(g,[ileri?dugme(ileri.etiket,()=>{const r=uygulaKaydet(ileri.eylem); ui.foto=0; karart(()=>ekranGoster(r.goster));},'ana'):null,
      ...digerDugmeler(l,['ilerle'])],{gece:true});
  }

  /* ---------- fotoğraf ---------- */
  function fotografEkrani(){
    const no=yeniEkran();
    if(!foto||foto.b!==b) foto={b,g:fotoGorunumu(b)};
    const G=foto.g;
    const liste=masadakiCinayetler(b,d);
    ui.foto=Math.max(0,Math.min(ui.foto|0,liste.length-1));
    const basliklar=ekran(b,d).filter(p=>p.tur==='baslik').map(p=>p.metin);
    G.sifirla();
    const ileti=el('p',{sinif:'foto-ileti',ozellik:{'aria-live':'polite'},yazi:M('foto.ipucu')});
    const bulunan=el('p',{sinif:'foto-bulunan'});
    const baslik=el('p',{sinif:'foto-baslik'});
    const alan=el('div',{sinif:'foto-alan'});
    const nav=el('div',{sinif:'dugme-sira'});
    const alt=el('div',{sinif:'foto-alt'},ileti,bulunan,nav);
    katman.replaceChildren(el('div',{sinif:'foto-ust'},baslik),alan,alt);

    const bulunanlar=()=>new Set(d.defter.izler.map(x=>x.iz));
    const etkin=()=>liste[ui.foto];
    const sahne=durganSahne((k,w,h,dp)=>{
      const cr=cv.getBoundingClientRect(), ar=alan.getBoundingClientRect();
      const a={x:ar.left-cr.left,y:ar.top-cr.top,w:Math.max(60,ar.width),h:Math.max(60,ar.height)};
      G.ciz(k,w,h,dp,{c:etkin(),alan:a,bulunanlar:bulunanlar()});
    });
    function panel(){
      const c=etkin();
      baslik.textContent=basliklar[ui.foto]??'';
      baslik.hidden=!baslik.textContent;
      const p=c?G.planAl(c):null;
      const izSet=new Set(p?p.izIdleri:[]);
      const satir=(c?b.fiziksel.filter(i=>izSet.has(i.id)):[]).map(i=>i.id);
      const bul=bulunanlar();
      const metinler=defterIzMetinleri().filter(x=>satir.includes(x.id)&&bul.has(x.id)).map(x=>x.metin.replace(/^[^:]*:\s*/,''));
      bulunan.replaceChildren(...(metinler.length?[el('b',{yazi:M('foto.bulunanlar')+' '}),metinler.join(' · ')]:[]));
      const l=secenekler(b,d);
      // fotoğrafa konamayan izler: düz "incele" düğmesi (yedek yol)
      const yedek=p?l.filter(s=>s.eylem.tur==='incele'&&p.yerlesmeyen.includes(s.eylem.iz)):[];
      const ileri=l.find(s=>s.eylem.tur==='ilerle');
      const tumBulundu=c&&satir.every(id=>bul.has(id));
      if(tumBulundu&&ileti.dataset.ozel!=='1') ileti.textContent=OY.akis.fotografBitti;
      nav.replaceChildren(...[
        liste.length>1?dugme(M('foto.onceki'),()=>{ui.foto=(ui.foto-1+liste.length)%liste.length; G.sifirla(); ileti.dataset.ozel=''; ileti.textContent=M('foto.ipucu'); kaydetSessiz(); panel(); sahne.yenile();}):null,
        liste.length>1?el('span',{sinif:'foto-bulunan',yazi:M('foto.sira',{i:ui.foto+1,n:liste.length})}):null,
        liste.length>1?dugme(M('foto.sonraki'),()=>{ui.foto=(ui.foto+1)%liste.length; G.sifirla(); ileti.dataset.ozel=''; ileti.textContent=M('foto.ipucu'); kaydetSessiz(); panel(); sahne.yenile();}):null,
        dugme(G.durum.zoom>1?M('foto.uzaklas'):M('foto.yakinlas'),()=>{G.yakinlastir(G.durum.zoom>1?1:2.2); panel(); sahne.yenile();}),
        ...yedek.map(s=>dugme(s.etiket,()=>incele(s.eylem.iz))),
        ...digerDugmeler(l,['incele','ilerle']),
        ileri?dugme(ileri.etiket,()=>{const r=uygulaKaydet(ileri.eylem); karart(()=>ekranGoster(r.goster));},'ana'):null].filter(Boolean));
    }
    function incele(id){
      const bul=bulunanlar();
      if(bul.has(id)){
        const m=defterIzMetinleri().find(x=>x.id===id);
        ileti.textContent=M('foto.zatenDefterde',{iz:m?m.metin.replace(/^[^:]*:\s*/,''):''}); ileti.dataset.ozel='1';
        return;
      }
      const s=secenekler(b,d).find(x=>x.eylem.tur==='incele'&&x.eylem.iz===id);
      if(!s){ileti.textContent=M('foto.bos'); ileti.dataset.ozel='1'; return;}
      const r=uygulaKaydet(s.eylem);
      const m=r.goster.find(p=>p.tur==='anlatim'||p.tur==='sistem');
      ileti.textContent=m?m.metin:''; ileti.dataset.ozel='1';
      panel(); sahne.yenile(); defter.yenile();
    }
    // dokunma: kısa dokunuş iz arar; yakınlaştırılmışken sürüklemek fotoğrafı gezdirir
    let bas=null;
    dokunma={
      asagi(e){bas={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,suruk:false};},
      hareket(e){
        if(!bas) return;
        const dx=e.clientX-bas.x, dy=e.clientY-bas.y;
        if(Math.hypot(e.clientX-bas.sx,e.clientY-bas.sy)>8) bas.suruk=true;
        if(bas.suruk&&G.durum.zoom>1){G.kaydir(dx,dy); bas.x=e.clientX; bas.y=e.clientY; sahne.yenile();}
      },
      yukari(e){
        if(!bas) return;
        const suruk=bas.suruk; bas=null;
        if(suruk) return;
        if(no!==ekranNo) return;
        const r=cv.getBoundingClientRect();
        const id=G.dokun(e.clientX-r.left,e.clientY-r.top);
        if(id) dene(()=>incele(id));
        else{ileti.textContent=M('foto.bos'); ileti.dataset.ozel='1';}
      },
    };
    panel();
    yonetici.gec('foto',sahne);
    fotoNoktalari=()=>G.ekranNoktalari();
  }
  // defterdeki iz satırları ({id, metin: "Kurban: iz"})
  const defterIzMetinleri=()=>defterGorunumu(b,d).izler;

  /* ---------- çağırma ---------- */
  function cagirmaEkrani(parcalar){
    yeniEkran();
    yonetici.gec('masa',masaSahnesi((k,w,h)=>{k.fillStyle='rgba(0,0,0,.5)'; k.fillRect(0,0,w,h);}));
    const l=secenekler(b,d);
    const cagrilabilir=new Map(l.filter(s=>s.eylem.tur==='cagir').map(s=>[s.eylem.kisi,s]));
    const baslikMetin=ekran(b,d).find(p=>p.tur==='sistem')?.metin??'';
    const notlar=parcalar.filter(p=>p.tur==='anlatim').map(p=>p.metin);
    const izgara=el('div',{sinif:'kisi-izgara'});
    for(const k of kisiListesi(b,d)){
      const s=cagrilabilir.get(k.id);
      const geldi=d.zaman.cagrilanlar.includes(k.id);
      const img=el('img'); portreKoy(img,k.id);
      const kart=el('button',{sinif:'kisi-kart',devre:!s,ozellik:{'aria-label':s?s.etiket:k.ad},tik:()=>{
        if(!s) return;
        dene(()=>{const r=uygulaKaydet(s.eylem); karart(()=>ekranGoster(r.goster));});
      }},img,el('span',{sinif:'ad',yazi:k.ad}),
        !k.canli?el('span',{sinif:'durum',yazi:M('cagir.olu')}):geldi?el('span',{sinif:'durum',yazi:M('cagir.geldi')}):null,
        k.isaret?el('span',{sinif:'damga '+k.isaret,yazi:M('defter.'+k.isaret)}):null);
      izgara.append(kart);
    }
    const ileri=l.find(s=>s.eylem.tur==='ilerle');
    katman.replaceChildren(el('div',{sinif:'cagir-ekran belir'},
      ...notlar.map(n=>el('p',{sinif:'cagir-not',yazi:n})),
      el('p',{sinif:'cagir-baslik',yazi:baslikMetin}),
      izgara,
      el('div',{sinif:'cagir-alt'},...digerDugmeler(l,['cagir','ilerle']),
        ileri?dugme(ileri.etiket,()=>{const r=uygulaKaydet(ileri.eylem); karart(()=>ekranGoster(r.goster));},'ana ortala'):null)));
  }

  /* ---------- sorgu ---------- */
  function tepkiSifirla(){poz.kasKaldir=0; poz.kasCat=.25; sorguEtki.bakis=null; sorguEtki.kirpHiz=1;}
  const KAS={sakin:[0,.25],tedirgin:[.45,.2],gergin:[.2,.62],'cok-gergin':[.38,.85]};
  function kasaGit(k,c){
    if(azHareket){poz.kasKaldir=k; poz.kasCat=c; return;}
    const b0={k:poz.kasKaldir,c:poz.kasCat}, t0=performance.now();
    const adim=()=>{const u=Math.min(1,(performance.now()-t0)/450); poz.kasKaldir=b0.k+(k-b0.k)*u; poz.kasCat=b0.c+(c-b0.c)*u; if(u<1) requestAnimationFrame(adim);};
    requestAnimationFrame(adim);
  }
  function tepkiUygula(t){
    if(!t) return;
    const [k,c]=KAS[t.duzey]??KAS.sakin;
    kasaGit(k,c);
    sorguEtki.kirpHiz=1+Math.max(0,t.gerginlik||0)*2.2;
    sorguEtki.bakis=t.gozKacirma?[(Math.random()<.5?-1:1)*.75,.5]:null;
  }

  function sorguEkrani(parcalar,{devam=false}={}){
    const no=yeniEkran();
    const kisi=d.zaman.sorgudaki;
    karakterSec(gorunusBul(kisi)||null); tepkiSifirla(); sus();
    const girisOyna=!devam&&!azHareket;
    const anlatim=el('p',{sinif:'anlatim'});
    const konusan=el('p',{sinif:'konusan'});
    const altyazi=el('p',{sinif:'altyazi',ozellik:{'aria-live':'polite'}});
    const tepki=el('p',{sinif:'tepki-not'});
    const sistem=el('div',{sinif:'sistem-kutu'});
    const sorular=el('div',{sinif:'sorular gizli'});
    let atla=null;
    altyazi.addEventListener('click',()=>atla?.());
    katman.replaceChildren(el('div',{sinif:'sorgu-ust'},anlatim),el('div',{sinif:'sorgu-bosluk'}),
      el('div',{sinif:'sorgu-alt'},konusan,altyazi,tepki,sistem,sorular));
    const canli=()=>no===ekranNo;

    function konusBekle(p){
      return new Promise(res=>{
        konusan.textContent=lakap(p.kisi); altyazi.classList.remove('soru-yazi'); tepki.textContent='';
        tepkiUygula(p.tepki);
        const harf=[...p.metin].length;
        const basla=()=>{
          if(!canli()) return res();
          if(azHareket){altyazi.textContent=p.metin; setTimeout(res,300); return;}
          let bitti=false;
          const son=()=>{if(bitti) return; bitti=true; clearTimeout(zm); atla=null; konusmaOlay.bit=null; sorguEtki.bakis=null; res();};
          konusmaOlay.basla=()=>{altyazi.textContent='';};
          konusmaOlay.yaz=m=>{altyazi.textContent=m;};
          konusmaOlay.bit=son;
          atla=()=>{sus(); altyazi.textContent=p.metin; son();};
          const zm=setTimeout(()=>atla?.(),4000+harf*170);
          konus(p.metin);
        };
        if(p.tepki?.duraksama&&!azHareket) setTimeout(basla,750); else basla();
      });
    }
    async function oyna(liste){
      for(const p of liste){
        if(!canli()) return;
        if(p.tur==='soru'){konusan.textContent=M('sorgu.sen'); altyazi.classList.add('soru-yazi'); altyazi.textContent=p.metin; tepki.textContent=''; await bekle(azHareket?150:650);}
        else if(p.tur==='soz') await konusBekle(p);
        else if(p.tur==='sahne') tepki.textContent=p.metin;
        else if(p.tur==='sistem') sistem.append(el('p',{sinif:'sistem-not',yazi:p.metin}));
        else if(p.tur==='anlatim') anlatim.textContent=p.metin;
      }
    }
    function sorulariGoster(){
      if(!canli()||d.zaman.adim!=='sorgu') return;
      const l=secenekler(b,d);
      sorular.replaceChildren(...l.map(s=>{
        if(s.eylem.tur==='sor') return dugme(s.etiket,()=>sor(s));
        if(s.eylem.tur==='ilerle') return dugme(s.etiket,()=>ayril(s),'cik');
        return dugme(s.etiket,()=>{const r=uygulaKaydet(s.eylem); if(d.zaman.adim==='sorgu'){oyna(r.goster).then(sorulariGoster);} else ekranGoster(r.goster);});
      }));
      sorular.classList.remove('gizli');
    }
    soruYenile=()=>{if(!sorular.classList.contains('gizli')) sorulariGoster();};
    async function sor(s){
      sorular.classList.add('gizli'); sistem.replaceChildren(); anlatim.textContent='';
      const r=uygulaKaydet(s.eylem);
      const bitti=d.zaman.adim!=='sorgu';
      if(!bitti){await oyna(r.goster); sorulariGoster(); return;}
      // sabır bitti: kalkıp gider; çağırma bildirimi (son "sistem" parçaları) çağırma ekranında zaten yazar
      const i=r.goster.map(p=>p.tur).lastIndexOf('anlatim');
      await oyna(r.goster.slice(0,i<0?r.goster.length:i));
      if(!canli()) return;
      if(i>=0) anlatim.textContent=r.goster[i].metin;
      await bekle(azHareket?200:1400);
      karart(()=>ekranGoster(r.goster.slice(i)));
    }
    async function ayril(s){
      sorular.classList.add('gizli');
      const r=uygulaKaydet(s.eylem);
      const a=r.goster.find(p=>p.tur==='anlatim');
      if(a) anlatim.textContent=a.metin;
      konusan.textContent=''; altyazi.textContent=''; tepki.textContent=''; sistem.replaceChildren();
      await bekle(azHareket?100:900);
      if(canli()) karart(()=>ekranGoster(r.goster));
    }

    // giriş bitince selam gelir, sonra sorular
    kokEl.classList.add('ekran-sorgu'); // dikey ekranda sahne kısalır (oyun.css)
    let girisBitti=Promise.resolve();
    if(girisOyna) girisBitti=new Promise(res=>{girisOlay.basla=null; girisOlay.bit=()=>{girisOlay.bit=null; res();}; setTimeout(res,9500);});
    yonetici.gec('sorgu',sorguSahnesi({giris:girisOyna}));
    const anl=parcalar.filter(p=>p.tur==='anlatim').map(p=>p.metin).join(' ');
    anlatim.textContent=anl||(devam?(ekran(b,d).find(p=>p.tur==='anlatim')?.metin??''):'');
    (async()=>{
      await girisBitti;
      if(!canli()) return;
      await oyna(parcalar.filter(p=>p.tur!=='anlatim'&&p.tur!=='ayrac'));
      sorulariGoster();
    })();
  }

  /* ---------- karar ve hüküm ---------- */
  function kararEkrani(parcalar){
    yeniEkran();
    yonetici.gec('masa',masaSahnesi((k,w,h)=>{k.fillStyle='rgba(0,0,0,.66)'; k.fillRect(0,0,w,h);}));
    const g=(parcalar.length?parcalar:ekran(b,d)).filter(p=>p.tur==='baslik'||p.tur==='anlatim');
    const l=secenekler(b,d);
    const buyuk=(s,sinif)=>{
      const [a,...r]=s.etiket.split(' — ');
      return el('button',{sinif:'dugme '+sinif,tik:()=>dene(()=>sec(s))},el('b',{yazi:a}),r.length?r.join(' — '):null);
    };
    function sec(s){
      if(s.eylem.tur==='hukum'){ui.hukum=[]; kaydetSessiz(); hukumEkrani(); return;}
      const r=uygulaKaydet(s.eylem); ui=uiYeni(); kaydetSessiz();
      karart(()=>ekranGoster(r.goster));
    }
    katman.replaceChildren(el('div',{sinif:'karar belir'},...g.map(p=>el('h2',{yazi:p.metin})),
      ...l.map(s=>s.eylem.tur==='geriSar'?buyuk(s,'rewind'):s.eylem.tur==='hukum'?buyuk(s,'verdict'):dugme(s.etiket,()=>{const r=uygulaKaydet(s.eylem); ekranGoster(r.goster);}))));
  }

  function hukumEkrani(){
    yeniEkran();
    yonetici.gec('masa',masaSahnesi((k,w,h)=>{k.fillStyle='rgba(0,0,0,.6)'; k.fillRect(0,0,w,h);}));
    const k=d.zaman.kural.finalSecimSayisi;
    const adaylar=hukumAdaylari(b,d);
    ui.hukum=(ui.hukum||[]).filter(id=>adaylar.includes(id));
    const isaret=Object.fromEntries(kisiListesi(b,d).map(x=>[x.id,x.isaret]));
    const baslik=el('p',{sinif:'cagir-baslik'});
    const onay=dugme(M('karar.onay'),()=>{
      const r=uygulaKaydet({tur:'hukum',kisiler:[...ui.hukum]});
      ui.son={asama:'giris',i:0}; kaydetSessiz();
      void r; karart(()=>sonEkrani());
    },'ana ortala');
    const izgara=el('div',{sinif:'kisi-izgara'});
    const guncelle=()=>{
      baslik.textContent=M('karar.hukumBaslik',{n:ui.hukum.length,k});
      onay.disabled=ui.hukum.length!==k;
      for(const kart of izgara.children) kart.setAttribute('aria-pressed',String(ui.hukum.includes(kart.dataset.kisi)));
    };
    for(const id of adaylar){
      const img=el('img'); portreKoy(img,id);
      const kart=el('button',{sinif:'kisi-kart',tik:()=>{
        if(ui.hukum.includes(id)) ui.hukum=ui.hukum.filter(x=>x!==id);
        else if(ui.hukum.length<k) ui.hukum=[...ui.hukum,id];
        kaydetSessiz(); guncelle();
      }},img,el('span',{sinif:'ad',yazi:lakap(id)}),isaret[id]?el('span',{sinif:'damga '+isaret[id],yazi:M('defter.'+isaret[id])}):null);
      kart.dataset.kisi=id;
      izgara.append(kart);
    }
    katman.replaceChildren(el('div',{sinif:'hukum-ekran belir'},baslik,izgara,
      el('div',{sinif:'cagir-alt'},dugme(M('karar.geri'),()=>{ui.hukum=null; kaydetSessiz(); kararEkrani([]);}),onay)));
    guncelle();
  }

  /* ---------- son ---------- */
  function sonBolumleri(){
    const T=OY.son, bol={giris:[],kayip:[],pencere:[],gercek:[]};
    let cur='giris';
    for(const p of sonGoster(b,d)){
      if(p.tur==='baslik'){
        if(p.metin===T.kayipBaslik) cur='kayip';
        else if(p.metin===T.pencereBaslik) cur='pencere';
        else if(p.metin===T.gercekBaslik||p.metin===T.akibetBaslik) cur='gercek';
      }
      bol[cur].push(p);
    }
    return bol;
  }
  function sonIlerle(){
    const s=ui.son, n=(d.zaman.hukum||[]).length;
    if(s.asama==='giris') ui.son={asama:n?'kayip':'pencere',i:0};
    else if(s.asama==='kayip') ui.son=s.i+1<n?{asama:'kayip',i:s.i+1}:{asama:'pencere',i:0};
    else if(s.asama==='pencere') ui.son={asama:'gercek',i:0};
    kaydetSessiz();
    karart(()=>sonEkrani());
  }
  function sonEkrani(){
    if(!ui.son) ui.son={asama:'giris',i:0};
    const bol=sonBolumleri(), s=ui.son;
    if(s.asama==='giris') return kartEkrani(bol.giris,[dugme(M('oyun.devamDugme'),sonIlerle,'ana')],{gece:true});
    if(s.asama==='kayip') return kayipEkrani(s.i);
    if(s.asama==='pencere') return pencereEkrani(bol.pencere);
    return gercekEkrani(bol.gercek);
  }
  function kayipEkrani(i){
    const no=yeniEkran();
    const secilen=d.zaman.hukum||[], id=secilen[i], kisi=koy.kisiler[id];
    const katiller=new Set(b.vaka.katiller.map(k=>k.kisi));
    const altyazi=el('p',{sinif:'altyazi'});
    const ilerle=dugme(M('son.atla'),()=>sonIlerle());
    katman.replaceChildren(el('div',{sinif:'son-ust'},el('p',{sinif:'kucuk',yazi:M('son.kayipSira',{i:i+1,n:secilen.length})}),el('p',{sinif:'ad',yazi:lakap(id)})),
      el('div',{sinif:'sorgu-bosluk'}),el('div',{sinif:'son-alt'},altyazi,el('div',{sinif:'dugme-sira'},ilerle)));
    if(!kisi){altyazi.textContent=DIL_TR.kisiler[id]?.kayip??''; yonetici.gec('karanlik',karanlikSahne()); return;}
    yonetici.gec('kayip',kayipSahne({
      kisi,katilMi:katiller.has(id),tohum:(b.tohum+i*7)|0,
      metin:DIL_TR.kisiler[id]?.kayip??'',
      bekleyenler:(kisi.kayip?.bekleyenler||[]).map(x=>koy.kisiler[x]).filter(Boolean),
      yaz:m=>{if(no===ekranNo) altyazi.textContent=m;},
      bitti:()=>{if(no===ekranNo){ilerle.textContent=M('oyun.devamDugme'); ilerle.classList.add('ana');}},
    }));
  }
  function pencereEkrani(parcalar){
    const no=yeniEkran();
    const secilen=d.zaman.hukum||[];
    const katiller=new Set(b.vaka.katiller.map(k=>k.kisi));
    const dogru=secilen.filter(k=>katiller.has(k)).length;
    const anlatimlar=parcalar.filter(p=>p.tur==='anlatim').map(p=>p.metin);
    const ustY=el('p',{sinif:'anlatim',yazi:anlatimlar[0]??''});
    const altyazi=el('p',{sinif:'altyazi'});
    const ilerle=dugme(M('son.atla'),()=>sonIlerle());
    katman.replaceChildren(el('div',{sinif:'son-ust'},ustY),el('div',{sinif:'sorgu-bosluk'}),
      el('div',{sinif:'son-alt'},altyazi,el('div',{sinif:'dugme-sira'},ilerle)));
    yonetici.gec('pencere',pencereSahne({dogru,tohum:b.tohum,bitince:()=>{
      if(no!==ekranNo) return;
      altyazi.textContent=anlatimlar.slice(1).join(' ');
      ilerle.textContent=M('oyun.devamDugme'); ilerle.classList.add('ana');
    }}));
  }
  function gercekEkrani(parcalar){
    yeniEkran();
    kartEkrani(parcalar,[dugme(M('son.yeniden'),async()=>{await sil(); oturumYaz(OTURUM,null); karart(()=>acilisEkrani(null));},'ana')],
      {sahne:karanlikSahne()});
  }

  /* ---------- canvas dokunma (fotoğraf) ---------- */
  cv.addEventListener('pointerdown',e=>{if(dokunma){cv.setPointerCapture?.(e.pointerId); dokunma.asagi(e);}});
  cv.addEventListener('pointermove',e=>{if(dokunma) dokunma.hareket(e);});
  cv.addEventListener('pointerup',e=>{if(dokunma) dokunma.yukari(e);});
  cv.addEventListener('pointercancel',()=>{if(dokunma) dokunma.yukari({clientX:-1e9,clientY:-1e9});});

  /* ---------- başlangıç ---------- */
  (async()=>{
    const y=await yukle();
    const kayit=y.tamam?y.veri:null;
    const istenen=Number(new URLSearchParams(location.search).get('tohum'));
    const ayniTohum=!istenen||kayit?.tohum===istenen;
    if(kayit&&oturumOku(OTURUM)==='1'&&ayniTohum) devamEt(kayit); // sayfa yenilendi: kaldığı yerden
    else acilisEkrani(kayit);
  })();

  // geliştirici ve sınama için: durum ve fotoğraftaki izlerin ekran konumları
  return {durum:()=>({b,d,ui}),yonetici,fotoNoktalari:()=>fotoNoktalari()};
}

