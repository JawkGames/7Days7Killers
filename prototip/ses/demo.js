// Ses katmanı denemesi: her ortam ve efekt için düğme, düzey, gösterge.
import {sesBaslat,sesAc,ortam,ortamOrani,efekt,duzey,sustur,kis,sesDurumu,sesMotoruAl,EFEKTLER,ORTAMLAR} from '/src/ses/index.js';

const $=id=>document.getElementById(id);
const AD={'sorgu-odasi':'sorgu odası','fotograf-masasi':'fotoğraf masası','gece-koy':'gece köy',kayip:'kayıp','pencere-cosku':'pencere: coşku','pencere-ofke':'pencere: öfke'};

sesBaslat({tohum:1943});
// konsoldan deneme için (ve ölçüm betiği için)
window.ses={sesAc,ortam,ortamOrani,efekt,duzey,sustur,kis,sesDurumu,sesMotoruAl};

let secili=null;
const durumYaz=()=>{const d=sesDurumu(); $('durum').textContent=d.destek?`bağlam: ${d.baglamDurumu??'kapalı'} · ortam: ${d.ortam??'yok'} · düzey ${d.duzey.toFixed(2)}${d.sessiz?' · sessiz':''}`:'Bu tarayıcıda Web Audio yok; ses kapalı.';};

function ortamDugmesi(ad,yazi){
  const b=document.createElement('button'); b.type='button'; b.textContent=yazi; b.setAttribute('aria-pressed','false');
  b.onclick=()=>{
    sesAc();
    const gecis=Number($('gecis').value);
    if(ad&&ad.startsWith('pencere')) $('oran').value=ad==='pencere-ofke'?1:0;
    ortam(ad,{gecis,isik:$('lamba').checked?'lamba':'ampul'});
    secili=ad;
    for(const x of $('ortamlar').children) x.setAttribute('aria-pressed',String(x===b&&!!ad));
    durumYaz();
  };
  $('ortamlar').append(b);
}
for(const ad of ORTAMLAR) ortamDugmesi(ad,AD[ad]);
ortamDugmesi(null,'sus');

for(const ad of EFEKTLER){
  const b=document.createElement('button'); b.type='button'; b.textContent=ad;
  b.onclick=()=>{sesAc(); efekt(ad,{siddet:Number($('siddet').value),sayi:ad==='adim'?4:undefined}); durumYaz();};
  $('efektler').append(b);
}

$('yazdir').onclick=()=>{
  sesAc();
  const metin='Ben o gece değirmendeydim, kimseyi görmedim.';
  [...metin].forEach((h,i)=>setTimeout(()=>{if(h.trim()) efekt('daktilo',{siddet:Number($('siddet').value)});},i*55));
};
$('oran').oninput=e=>{if(secili?.startsWith('pencere')) ortamOrani(Number(e.target.value),{gecis:.8});};
$('duzey').oninput=e=>{duzey(Number(e.target.value)); durumYaz();};
$('kisma').oninput=e=>kis(Number(e.target.value),{sure:.3});
$('sessiz').onchange=e=>{sustur(e.target.checked); durumYaz();};

// ---- gösterge: üstte dalga biçimi, ortada tayf, altta akan tayf görüntüsü ----
const tuval=$('gosterge'), c=tuval.getContext('2d');
let akis=null;
function boyutla(){
  const o=devicePixelRatio||1, g=tuval.clientWidth, y=tuval.clientHeight;
  tuval.width=Math.round(g*o); tuval.height=Math.round(y*o);
  akis=document.createElement('canvas'); akis.width=tuval.width; akis.height=Math.round(tuval.height*.45);
}
addEventListener('resize',boyutla); boyutla();

let zaman=null, tayf=null;
function ciz(){
  requestAnimationFrame(ciz);
  const a=sesMotoruAl().analizci?.();
  const G=tuval.width, Y=tuval.height;
  c.fillStyle='#030404'; c.fillRect(0,0,G,Y);
  if(!a){c.fillStyle='#8f8a74'; c.font=`${14*(devicePixelRatio||1)}px Courier New`; c.fillText('ses kapalı: bir düğmeye basın',16,30); return;}
  if(!zaman||zaman.length!==a.fftSize){zaman=new Float32Array(a.fftSize); tayf=new Float32Array(a.frequencyBinCount);}
  a.getFloatTimeDomainData(zaman); a.getFloatFrequencyData(tayf);
  const y1=Y*.25, y2=Y*.55;
  // dalga biçimi (±1 tam ölçek)
  c.strokeStyle='#8f8a74'; c.lineWidth=1; c.beginPath();
  for(let i=0;i<zaman.length;i++){const x=i/(zaman.length-1)*G, y=Math.min(y1,Math.max(0,y1/2-zaman[i]*8*y1/2)); i?c.lineTo(x,y):c.moveTo(x,y);}
  c.stroke();
  // tayf (logaritmik frekans, 30 Hz - 12 kHz; -110..-20 dB)
  const sr=a.context.sampleRate, fx=f=>Math.log(f/30)/Math.log(12000/30)*G;
  c.strokeStyle='#e2c27a'; c.beginPath();
  for(let i=1;i<tayf.length;i++){const f=i*sr/a.fftSize; if(f<30||f>12000) continue; const x=fx(f), y=y1+(y2-y1)*(1-(tayf[i]+110)/90); c.lineTo(x,Math.min(y2,Math.max(y1,y)));}
  c.stroke();
  // akan tayf: sağa bir sütun eklenir
  const ac=akis.getContext('2d'), H=akis.height;
  ac.drawImage(akis,-2,0);
  for(let yy=0;yy<H;yy++){
    const f=30*Math.pow(12000/30,1-yy/H), i=Math.round(f*a.fftSize/sr), v=Math.min(1,Math.max(0,(tayf[i]+110)/80));
    ac.fillStyle=`rgb(${Math.round(20+200*v)},${Math.round(18+170*v*v)},${Math.round(22+90*v*v*v)})`;
    ac.fillRect(akis.width-2,yy,2,1);
  }
  c.drawImage(akis,0,Y-H);
  c.fillStyle='#8f8a74'; c.font=`${11*(devicePixelRatio||1)}px Courier New`;
  c.fillText('dalga (×8)',6,14); c.fillText('tayf 30 Hz - 12 kHz',6,y1+14); c.fillText('akan tayf',6,Y-H+14);
}
ciz();
durumYaz();
