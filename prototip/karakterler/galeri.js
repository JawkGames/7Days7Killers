// Karakter galerisi: bütün görünüş dosyalarını aynı ışıkta, omuzdan yukarı çizer.
// Bir karaktere tıklanınca büyük hâli açılır: göz kırpma, bakış, kaş ve konuşma burada denenir.
import {hedefAyarla} from '/src/cizim/teknik/tuval.js';
import {leke} from '/src/cizim/teknik/firca.js';
import {PAL} from '/src/cizim/teknik/palet.js';
import {clamp} from '/src/cekirdek/matematik.js';
import {poz,karakterSec,arkaSac,govde,kafa} from '/src/cizim/rig/index.js';
import {konus,sus,konusmaOlay,sozGuncelle} from '/src/diyalog/konusma.js';
import {gorunusListesi} from '/src/icerik/gorunus/index.js';

const KADRAJ={x0:-380,y0:170,w:760,h:860}, KAFA_Y=470;
const NOTR={...poz};
// deneme cümleleri (galeri için; oyunda metin dil dosyasından gelir)
const CUMLE={
  varsayilan:'O gece evden hiç çıkmadım.',
  mahmut:'Bu köyde benim sözümün üstüne söz söylenmez.',
  elif:'Ben bir şey bilmiyorum, vallahi bilmiyorum.',
  bektas:'Kapı açıldı, kapı kapandı. Ay gördü, ben gördüm.',
  sultan:'Yetmiş dört yıldır bu köydeyim, oğul.',
  riza:'Karakolda nöbetteydim. Defterde yazar.'
};
// ?secenek: veri dosyası olmayan seçenekleri (başlık, saç, örtü) denemek için sentetik karakterler
const SECENEK=[
  {id:'s-kel-cubbe', cinsiyet:'E', yas:60, sac:{bicim:'kel'}, sakal:{bicim:'uzun'}, biyik:{bicim:'kalin'}, ortu:'cubbe', giysi:{ic:'gomlek'}, renk:{ten:'#86745e'}},
  {id:'s-sarik', cinsiyet:'E', yas:58, sakal:{bicim:'kisa'}, biyik:{bicim:'kalin'}, baslik:{tur:'sarik'}, ortu:'cubbe', giysi:{ic:'entari', icRenk:'#4a4536'}, renk:{ten:'#8a785f'}},
  {id:'s-takke-onluk', cinsiyet:'E', yas:52, biyik:{bicim:'pala'}, sakal:{bicim:'kirli'}, baslik:{tur:'takke'}, ortu:'onluk', giysi:{ic:'yelek'}, renk:{ten:'#8c7860'}, omuz:1.08},
  {id:'s-kepenek', cinsiyet:'E', yas:24, biyik:{bicim:'ince'}, baslik:{tur:'kasket'}, ortu:'kepenek', renk:{ten:'#8e7a5e'}, omuz:1.05},
  {id:'s-palto-kasket', cinsiyet:'E', yas:50, biyik:{bicim:'kalin'}, baslik:{tur:'kasket', renk:'#3a3934'}, ortu:'palto', giysi:{renk:'#2a2c28', ic:'gomlek'}, renk:{ten:'#8a7860'}, omuz:1.1},
  {id:'s-kaput-kisa', cinsiyet:'E', yas:22, sakal:{bicim:'kirli'}, ortu:'kaput', renk:{ten:'#8a7a62'}},
  {id:'s-yazma-entari', cinsiyet:'K', yas:34, baslik:{tur:'yazma', renk:'#4a4438', desen:'duz'}, ortu:'entari', giysi:{renk:'#3c362b'}, renk:{ten:'#8f846e'}},
  {id:'s-onluk-k', cinsiyet:'K', yas:45, baslik:{tur:'yemeni', renk:'#6a5f48'}, ortu:'onluk', giysi:{renk:'#5a5444', icRenk:'#4a4234'}, renk:{ten:'#8c806a'}},
  {id:'s-toplu', cinsiyet:'K', yas:28, sac:{bicim:'toplu'}, ortu:'entari', giysi:{hirka:'#3f3a30'}, renk:{ten:'#958a74'}},
  {id:'s-aba-uzun', cinsiyet:'E', yas:70, sakal:{bicim:'uzun', boy:1.2}, biyik:{bicim:'pala'}, baslik:{tur:'kasket'}, ortu:'aba', giysi:{ic:'gomlek'}, renk:{ten:'#82705a'}, omuz:1.05}
];
const kaynak=new URLSearchParams(location.search).has('secenek')?SECENEK:gorunusListesi;
const liste=[...kaynak].sort((a,b)=>a.id==='varsayilan'?-1:b.id==='varsayilan'?1:a.id.localeCompare(b.id,'tr'));

function sahneCiz(kc,W,H){
  hedefAyarla(kc);
  const s=Math.min(W/KADRAJ.w,H/KADRAJ.h);
  kc.setTransform(s,0,0,s,W/2,-KADRAJ.y0*s+(H-KADRAJ.h*s)/2);
  // duvar: tek kaynaktan, soldan yukarıdan gelen soluk sarı ışık
  kc.fillStyle='#121513'; kc.fillRect(KADRAJ.x0-20,KADRAJ.y0-20,KADRAJ.w+40,KADRAJ.h+40);
  leke(-240,260,460,380,PAL.lamba,.1);
  leke(320,760,380,520,PAL.siyah,.55);
  // figür: sorgu odasıyla aynı sıra
  kc.save(); kc.translate(0,KAFA_Y); arkaSac(); kc.restore();
  govde();
  kc.save(); kc.translate(0,KAFA_Y); kafa(); kc.restore();
  // kenar kararması
  kc.setTransform(1,0,0,1,0,0);
  const g=kc.createRadialGradient(W*.47,H*.42,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.75)'); kc.fillStyle=g; kc.fillRect(0,0,W,H);
}
function boyutla(cv){
  const d=Math.min(window.devicePixelRatio||1,2.5), w=Math.max(8,Math.round(cv.clientWidth*d)), h=Math.max(8,Math.round(cv.clientHeight*d));
  if(cv.width!==w||cv.height!==h){cv.width=w; cv.height=h;}
}

/* ───────── ızgara ───────── */
const izgara=document.getElementById('izgara'), kartlar=[];
for(const v of liste){
  const b=document.createElement('button'); b.className='kart'; b.type='button';
  const cv=document.createElement('canvas'); cv.setAttribute('aria-hidden','true');
  const ad=document.createElement('span'); ad.innerHTML=`<b>${v.id}</b> · ${v.yas} · ${v.cinsiyet==='E'?'erkek':'kadın'} · ${v.ortu||'palto'}`;
  b.append(cv,ad); izgara.append(b); b.addEventListener('click',()=>ac(v));
  b.dataset.id=v.id; kartlar.push({cv,v});
}
function izgaraCiz(){
  const yedek={...poz}; Object.assign(poz,NOTR,{nefes:.5});
  for(const {cv,v} of kartlar){ boyutla(cv); if(cv.width<9) continue; karakterSec(v); sahneCiz(cv.getContext('2d'),cv.width,cv.height); }
  Object.assign(poz,yedek);
}

/* ───────── büyük görünüm ───────── */
const el=id=>document.getElementById(id);
const buyuk=el('buyuk'), bt=el('buyukTuval'), altyazi=el('altyazi');
const durum={v:null,kirpBas:-9,sonrakiKirp:2,imX:0,imY:0,imZaman:-99,durgun:false,kas:0,once:0};
konusmaOlay.yaz=m=>{altyazi.textContent=m;};
konusmaOlay.basla=()=>{altyazi.textContent='';};
function ac(v){
  durum.v=v; karakterSec(v); Object.assign(poz,NOTR); sus(); altyazi.textContent='';
  el('sahneBag').href='./sahne.html?kim='+encodeURIComponent(v.id);
  buyuk.classList.add('acik'); el('konus').focus();
}
function kapat(){buyuk.classList.remove('acik'); sus(); durum.v=null; izgaraCiz();}
el('kapat').addEventListener('click',kapat);
addEventListener('keydown',e=>{if(e.key==='Escape'&&durum.v) kapat();});
el('konus').addEventListener('click',()=>konus(CUMLE[durum.v.id]||'Ben o gece evdeydim.'));
el('kirp').addEventListener('click',()=>{durum.kirpBas=performance.now()/1000;});
const KAS=[['nötr',0,.25],['kalkık',1,0],['çatık',0,1]];
el('kas').addEventListener('click',()=>{durum.kas=(durum.kas+1)%KAS.length; el('kas').textContent='Kaş: '+KAS[durum.kas][0];});
el('dur').addEventListener('click',()=>{durum.durgun=!durum.durgun; el('dur').textContent=durum.durgun?'Canlı kare':'Durağan kare';});
bt.addEventListener('pointermove',e=>{const r=bt.getBoundingClientRect(); durum.imX=clamp((e.clientX-r.left)/r.width*2-1,-1,1); durum.imY=clamp((e.clientY-r.top)/r.height*2-1.1,-1,1); durum.imZaman=performance.now()/1000;});

function guncelle(t,dt){
  sozGuncelle(dt);
  const bak=t-durum.imZaman<2.5, hx=bak?durum.imX:0, hy=bak?durum.imY:0;
  const hiz=1-Math.exp(-dt*16), agir=1-Math.exp(-dt*2.6);
  poz.gx+=(hx-poz.gx)*hiz; poz.gy+=(hy-poz.gy)*hiz; poz.hgx+=(hx-poz.hgx)*agir; poz.hgy+=(hy-poz.hgy)*agir;
  if(t>durum.sonrakiKirp&&!durum.durgun){durum.kirpBas=t; durum.sonrakiKirp=t+3+Math.random()*5;}
  const p=(t-durum.kirpBas)/.18, kapali=p>=0&&p<=1?Math.sin(p*Math.PI):0;
  poz.goz=.74*(1-kapali)-poz.gy*.06;
  const K=KAS[durum.kas]; poz.kasKaldir+=(K[1]-poz.kasKaldir)*agir*2; poz.kasCat+=(K[2]-poz.kasCat)*agir*2;
  if(durum.durgun){poz.nefes=.5; poz.sallanti=0; poz.kaynama=0; poz.isik=1;}
  else{poz.nefes=Math.sin(t*.95)*.5+.5; poz.sallanti=Math.sin(t*.8)*2.2+Math.sin(t*1.6+1)*.9-poz.hgx*5; poz.kaynama=Math.floor(t*7)%64; poz.isik=.96+.03*Math.sin(t*9.1)*Math.sin(t*2.3);}
}
function kare(ms){
  const t=ms/1000, dt=Math.min(.05,t-durum.once||.016); durum.once=t;
  if(durum.v){ boyutla(bt); if(bt.width>8){ karakterSec(durum.v); guncelle(t,dt); sahneCiz(bt.getContext('2d'),bt.width,bt.height); } }
  requestAnimationFrame(kare);
}
let zamanlayici=0;
addEventListener('resize',()=>{clearTimeout(zamanlayici); zamanlayici=setTimeout(izgaraCiz,120);});
izgaraCiz();
requestAnimationFrame(kare);
// doğrudan açmak için: index.html#mahmut
if(location.hash.length>1){const v=liste.find(x=>x.id===decodeURIComponent(location.hash.slice(1))); if(v) ac(v);}
window.galeri={poz,liste,ac,izgaraCiz};
