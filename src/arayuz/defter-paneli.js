// Defter paneli: her an açılabilir. Metin oyunundaki defterin işlevleri (ifadeler, izler, kişiler, cinayetler,
// sırlar, çelişkiler; iki ifadeyi yan yana koyma; kişi işaretleme), eski defter kâğıdı görünüşüyle.
// Veri oyun katmanından gelir (defterGorunumu, kisiListesi); eylemler `eylemYap` ile oyun katmanına gider.
import {defterGorunumu,kisiListesi} from '../oyun/oyun.js';
import {M,el} from './yardim.js';
import {portreKoy} from './portre.js';

const SEKMELER=['ifadeler','izler','kisiler','cinayetler','sirlar','celiskiler'];

export function defterPaneliKur({kok,dugme,al,eylemYap}){
  let acik=false, sekme='ifadeler', secili=[], mesaj='';
  const baslik=el('h2',{sinif:'defter-baslik',yazi:M('defter.baslik')});
  const kapat=el('button',{sinif:'defter-kapat',yazi:M('oyun.kapat'),tik:()=>kapa()});
  const sekmeler=el('div',{sinif:'defter-sekmeler',ozellik:{role:'tablist'}});
  const liste=el('div',{sinif:'defter-liste'});
  const alt=el('div',{sinif:'defter-alt'});
  const ileti=el('p',{sinif:'defter-ileti',ozellik:{'aria-live':'polite'}});
  kok.replaceChildren(el('div',{sinif:'defter-ust'},baslik,kapat),sekmeler,liste,ileti,alt);
  kok.setAttribute('aria-hidden','true');
  dugme.textContent=M('defter.baslik');
  dugme.addEventListener('click',()=>acik?kapa():ac());
  addEventListener('keydown',e=>{if(e.key==='Escape'&&acik) kapa();});

  function ac(){acik=true; kok.classList.add('acik'); kok.setAttribute('aria-hidden','false'); dugme.setAttribute('aria-expanded','true'); mesaj=''; ciz(); kapat.focus({preventScroll:true});}
  function kapa(){acik=false; kok.classList.remove('acik'); kok.setAttribute('aria-hidden','true'); dugme.setAttribute('aria-expanded','false');}

  function eylem(e){
    const r=eylemYap(e);
    if(r){
      const s=(r.goster||[]).find(p=>p.tur==='sistem'||p.tur==='anlatim');
      mesaj=s?s.metin:'';
      if(e.tur==='karsilastir') secili=[];
    }
    ciz();
  }

  function ciz(){
    if(!acik) return;
    const {b,d}=al();
    if(!b||!d){liste.replaceChildren(); return;}
    const g=defterGorunumu(b,d);
    sekmeler.replaceChildren(...SEKMELER.map(ad=>{
      const n=ad==='kisiler'?null:(g[ad]||[]).length;
      const bt=el('button',{sinif:'sekme',yazi:M('defter.sekme.'+ad)+(n?` (${n})`:''),ozellik:{role:'tab','aria-selected':String(sekme===ad)},tik:()=>{sekme=ad; mesaj=''; ciz();}});
      return bt;
    }));
    ileti.textContent=mesaj;
    alt.replaceChildren();
    if(sekme==='kisiler') return kisilerCiz(b,d);
    const l=g[sekme]||[];
    if(!l.length){liste.replaceChildren(el('p',{sinif:'defter-bos',yazi:M('defter.bos')})); return;}
    if(sekme==='ifadeler') return ifadelerCiz(l);
    liste.replaceChildren(...l.map(x=>el('p',{sinif:'defter-satir',yazi:x.metin})));
  }

  function ifadelerCiz(l){
    secili=secili.filter(id=>l.some(f=>f.id===id));
    liste.replaceChildren(...[...l].reverse().map(f=>{
      const s=secili.includes(f.id);
      const bt=el('button',{sinif:'defter-satir ifade'+(s?' secili':''),ozellik:{'aria-pressed':String(s)},tik:()=>{
        secili=s?secili.filter(x=>x!==f.id):[...secili,f.id].slice(-2); mesaj=''; ciz();
      }},el('span',{sinif:'kutucuk',ozellik:{'aria-hidden':'true'},yazi:s?'✕':''}),el('span',{yazi:f.metin}));
      return bt;
    }));
    const sec=secili.map(id=>l.find(f=>f.id===id)).filter(Boolean);
    const yan=el('div',{sinif:'yan-yana'},...[0,1].map(i=>el('div',{sinif:'yan-kagit'+(sec[i]?'':' bos'),yazi:sec[i]?sec[i].metin:M('defter.secIpucu')})));
    const dg=el('div',{sinif:'defter-dugmeler'},
      el('button',{sinif:'ana',yazi:M('defter.karsilastir'),devre:sec.length!==2,tik:()=>eylem({tur:'karsilastir',a:secili[0],b:secili[1]})}),
      el('button',{yazi:M('defter.secimTemizle'),devre:!sec.length,tik:()=>{secili=[]; ciz();}}));
    alt.replaceChildren(el('p',{sinif:'defter-ipucu',yazi:M('defter.karsilastirIpucu')}),yan,dg);
  }

  function kisilerCiz(b,d){
    liste.replaceChildren(...kisiListesi(b,d).map(k=>{
      const img=el('img',{sinif:'portre'}); portreKoy(img,k.id);
      const isaret=['supheli','temiz'].map(is=>el('button',{sinif:'damga-dugme '+is,yazi:M('defter.'+is),ozellik:{'aria-pressed':String(k.isaret===is)},
        tik:()=>eylem({tur:'isaretle',kisi:k.id,isaret:k.isaret===is?null:is})}));
      return el('div',{sinif:'defter-kisi'+(k.canli?'':' olu')},img,
        el('div',{sinif:'kisi-bilgi'},el('span',{sinif:'kisi-ad',yazi:k.ad}),k.canli?null:el('span',{sinif:'kisi-not',yazi:M('defter.olu')}),
          k.isaret?el('span',{sinif:'damga '+k.isaret,yazi:M('defter.'+k.isaret)}):null),
        el('div',{sinif:'kisi-dugmeler'},...isaret));
    }));
  }

  return {ac,kapa,yenile:ciz,get acik(){return acik;}};
}
