// Karakter galerisi: bütün görünüş dosyalarını aynı ışıkta, omuzdan yukarı çizer.
// Bir karaktere tıklanınca büyük hâli açılır: göz kırpma, bakış, kaş ve konuşma burada denenir.
import {hedefAyarla} from '/src/cizim/teknik/tuval.js';
import {leke} from '/src/cizim/teknik/firca.js';
import {PAL} from '/src/cizim/teknik/palet.js';
import {clamp} from '/src/cekirdek/matematik.js';
import {poz,POZ_NOTR,karakterSec,arkaSac,govde,kafa,ifadeKur,DURUMLAR,DURUM_ADLARI} from '/src/cizim/rig/index.js';
import {MIZACLAR} from '/src/icerik/kur.js';
import {konus,sus,konusmaOlay,sozGuncelle} from '/src/diyalog/konusma.js';
import {gorunusListesi} from '/src/icerik/gorunus/index.js';

const KADRAJ={x0:-380,y0:130,w:760,h:900}, KAFA_Y=470; // üstte pay: uzun boylu ve şapkalı karakterin başı kesilmesin
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
  {id:'s-aba-uzun', cinsiyet:'E', yas:70, sakal:{bicim:'uzun', boy:1.2}, biyik:{bicim:'pala'}, baslik:{tur:'kasket'}, ortu:'aba', giysi:{ic:'gomlek'}, renk:{ten:'#82705a'}, omuz:1.05},
  // ayrıntılar (README "Ayrıntılar"): yeni başlıklar, saç türleri, bağlama biçimleri, önlükler, gözlük, perde, iz, toz, ifade
  {id:'s-kulah-kabarik', cinsiyet:'E', yas:30, sac:{bicim:'kisa', tur:'kabarik'}, baslik:{tur:'kulah'}, ortu:'kepenek', renk:{ten:'#86745a'}, ifade:{agizKose:.5}},
  {id:'s-posu-deri', cinsiyet:'E', yas:44, sakal:{bicim:'kirli'}, baslik:{tur:'posu'}, ortu:'onluk', giysi:{onluk:'deri'}, toz:{tur:'is', yuz:.6, giysi:.5}, renk:{ten:'#86745e'}},
  {id:'s-acik-un', cinsiyet:'E', yas:46, sac:{bicim:'kisa', tur:'acik', cizgi:-140}, biyik:{bicim:'kalin', yukseklik:2}, ortu:'onluk', giysi:{onluk:'un'}, toz:{tur:'un'}, renk:{ten:'#958a74', sac:'#3a342a'}},
  {id:'s-gozluk-yana', cinsiyet:'E', yas:30, sac:{bicim:'kisa', tur:'yana'}, gozluk:{bicim:'tel'}, biyik:{bicim:'ince'}, ortu:'palto', giysi:{ic:'gomlek'}, renk:{ten:'#958a72'}},
  {id:'s-geri-perde', cinsiyet:'E', yas:40, sac:{bicim:'kisa', tur:'geri'}, gozFarki:{perde:'sol'}, iz:[{tur:'yara', x:-70, y:-8, boy:100, aci:1.3, dikis:true}, {tur:'kirikBurun'}], ortu:'aba', renk:{ten:'#80705a'}, ifade:{kasSag:-7, agizYan:.4}},
  {id:'s-tombul', cinsiyet:'E', yas:55, sac:{bicim:'kel'}, yapi:{tombul:.8, sarkik:.7}, ortu:'onluk', giysi:{onluk:'bez'}, renk:{ten:'#8c7860'}, ifade:{agizKose:.8}},
  {id:'s-yemeni-arka', cinsiyet:'K', yas:30, baslik:{tur:'yemeni', bag:'arka', tutam:'sol', renk:'#6a5f48'}, ortu:'entari', renk:{ten:'#8f846e'}, iz:[{tur:'ben', x:40, y:120}]},
  {id:'s-yemeni-yasmak', cinsiyet:'K', yas:50, baslik:{tur:'yemeni', bag:'yasmak', renk:'#3a3430', desen:'duz'}, ortu:'entari', renk:{ten:'#8f846e'}, ifade:{agizKose:-.3, bakisY:.6}}
];
// kişinin mizacı (ifade süzgeci için): kişi dosyalarından
const kisiler=Object.values(import.meta.glob('/src/icerik/kisiler/*.js',{eager:true})).map(m=>m.default).filter(Boolean);
const mizacBul=id=>(kisiler.find(k=>k.id===id)||{}).mizac||null;
// "tepki oynat" örnekleri: src/diyalog/cevap.js tepkiKur çıktısı biçiminde
const TEPKILER=[
  ['sakin cevap',{gerginlik:.1,duzey:'sakin',gozKacirma:false,duraksama:false,not:'Düz bir sesle konuştu.',tavirIpucu:null},'O gece evdeydim, ocağın başında.'],
  ['tedirgin',{gerginlik:.35,duzey:'tedirgin',gozKacirma:false,duraksama:false,not:'Sandalyede kıpırdandı.',tavirIpucu:null},'Değirmenin yanından geçtim, o kadar.'],
  ['duraksama',{gerginlik:.5,duzey:'gergin',gozKacirma:false,duraksama:true,not:'Bir an sustu, sonra konuştu.',tavirIpucu:null},'Ben... ben kimseyi görmedim.'],
  ['göz kaçırma',{gerginlik:.6,duzey:'gergin',gozKacirma:true,duraksama:false,not:'Gözlerini kaçırdı.',tavirIpucu:null},'Kuyunun orada değildim.'],
  ['çok gergin',{gerginlik:.85,duzey:'cok-gergin',gozKacirma:true,duraksama:true,not:'Alnında ter vardı.',tavirIpucu:null},'Vallahi bilmiyorum, bilmiyorum.'],
  ['susar',{gerginlik:.45,duzey:'gergin',gozKacirma:false,duraksama:true,not:'Kelimeleri seçer gibi konuştu.',tavirIpucu:'susar'},'Onu sormayın bana.']
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
  const yedek={...poz}; Object.assign(poz,NOTR,POZ_NOTR,{nefes:.5});
  for(const {cv,v} of kartlar){ boyutla(cv); if(cv.width<9) continue; karakterSec(v); sahneCiz(cv.getContext('2d'),cv.width,cv.height); }
  Object.assign(poz,yedek);
}

/* ───────── büyük görünüm ───────── */
const el=id=>document.getElementById(id);
const buyuk=el('buyuk'), bt=el('buyukTuval'), altyazi=el('altyazi');
const mizacSec=document.createElement('select');
for(const m of ['',...MIZACLAR]){const o=document.createElement('option'); o.value=m; o.textContent=m||'(yok)'; mizacSec.append(o);}
mizacSec.addEventListener('change',()=>{durum.mizac=mizacSec.value||null; const s=durum.ifade&&durum.ifade.durum(); ifadeYenile(); if(s) durum.ifade.hedefle(s.ad,s.siddet);});
const durum={v:null,kirpBas:-9,sonrakiKirp:2,imX:0,imY:0,imZaman:-99,durgun:false,kas:0,once:0,ifade:null,mizac:null,secili:null,zaman:[]};
konusmaOlay.yaz=m=>{altyazi.textContent=m;};
konusmaOlay.basla=()=>{altyazi.textContent='';};
function ifadeYenile(){durum.ifade=ifadeKur({mizac:durum.mizac,tohum:7}); durum.secili=null; dugmeIsaretle();}
function ac(v){
  durum.v=v; karakterSec(v); Object.assign(poz,NOTR); sus(); altyazi.textContent='';
  durum.zaman.forEach(clearTimeout); durum.zaman=[];
  durum.mizac=mizacBul(v.id); mizacSec.value=durum.mizac||''; ifadeYenile();
  el('sahneBag').href='./sahne.html?kim='+encodeURIComponent(v.id);
  buyuk.classList.add('acik'); el('konus').focus();
}
function kapat(){buyuk.classList.remove('acik'); sus(); durum.v=null; Object.assign(poz,POZ_NOTR); izgaraCiz();}

/* ───────── ifade denemesi: her duygu × şiddet, tepki oynat, tek hareketler ───────── */
const ifadeKutu=el('ifade'), dugmeler=[];
const yeniDugme=(yazi,fn)=>{const b=document.createElement('button'); b.className='d'; b.type='button'; b.textContent=yazi; b.addEventListener('click',fn); return b;};
function dugmeIsaretle(){for(const {b,anahtar} of dugmeler) b.setAttribute('aria-pressed',String(anahtar===durum.secili));}
const SIDDET=[['hafif',.35],['orta',.65],['güçlü',1]];
for(let i=0;i<DURUMLAR.length;i+=4){
  const satir=document.createElement('div'); satir.className='satir';
  for(const d of DURUMLAR.slice(i,i+4)){
    const etiket=document.createElement('span'); etiket.className='not'; etiket.textContent=DURUM_ADLARI[d]+':'; satir.append(etiket);
    for(const [ad,s] of SIDDET){const anahtar=d+s; const b=yeniDugme(ad,()=>{durum.ifade.hedefle(d,s); durum.secili=anahtar; dugmeIsaretle();}); dugmeler.push({b,anahtar}); satir.append(b);}
  }
  ifadeKutu.append(satir);
}
{
  const satir=document.createElement('div'); satir.className='satir';
  const n=document.createElement('span'); n.className='not'; n.textContent='tepki oynat:'; satir.append(n);
  for(const [ad,t,cumle] of TEPKILER) satir.append(yeniDugme(ad,()=>{
    sus(); durum.zaman.forEach(clearTimeout); durum.zaman=[];
    const o=durum.ifade.tepkiOyna(t); durum.secili=null; dugmeIsaretle();
    altyazi.textContent='('+t.not+')';
    durum.zaman.push(setTimeout(()=>konus(cumle),o.bekle*1000+350));
  }));
  ifadeKutu.append(satir);
  const s2=document.createElement('div'); s2.className='satir';
  const n2=document.createElement('span'); n2.className='not'; n2.textContent='tek hareket:'; s2.append(n2);
  for(const [ad,tur] of [['yutkun','yutkun'],['göz kaçır','kacir'],['bakış seğir','flik'],['göz seğir','segir'],['dudak ıslat','islat'],['baş salla','salla'],['iki yana','ikiYana'],['iç çek','ic'],['ağır kırp','agirKirp']])
    s2.append(yeniDugme(ad,()=>durum.ifade.oynat(tur)));
  s2.append(yeniDugme('nötr',()=>{durum.ifade.hedefle('sakin',0); durum.secili=null; dugmeIsaretle();}));
  const lab=document.createElement('label'); lab.textContent='mizaç '; lab.append(mizacSec); s2.append(lab);
  ifadeKutu.append(s2);
}
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
  // ifade katmanı (kaş, göz, ağız, baş, omuz, nefes); Kaş düğmesi nötr değilse kaşı o ezer
  if(durum.ifade){ if(durum.durgun) durum.ifade.yerles(poz); else durum.ifade.guncelle(dt,poz); }
  if(durum.kas){const K=KAS[durum.kas]; poz.kasKaldir=K[1]; poz.kasCat=K[2];}
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
window.galeri={poz,liste,ac,izgaraCiz,durum};
