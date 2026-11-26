// Nesneler: kayıp sahnelerinde duyguyu taşıyan eşyalar. Her nesne (x,y) tabanına, s ölçeğinde çizilir.
// NESNE[ad] = {ciz(o), canli?(o,t,I,ilerleme)}. canli kısımlar (alev, buhar, su) her karede çizilir.
import {c} from '../../teknik/tuval.js';
import {karalama} from '../../teknik/firca.js';
import {TAU,rgba,clamp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,hat,leke,tara,yerel,sekil,elips,tabanGolge,parilti} from './cizer.js';

const Y=(o,fn)=>yerel(o.x,o.y,o.s||1,fn,o.don);

/* ───── ev içi ───── */

// yer minderi; bos: ortasında oturulmuş çukur kalmış; yastik: arkasında duvara dayalı yastık
function minder(o){Y(o,()=>{
  const renk=o.renk||[74,40,34];
  if(o.yastik){
    const yy=()=>{c.moveTo(-74,-24); c.bezierCurveTo(-80,-90,-70,-118,-60,-122); c.lineTo(60,-122); c.bezierCurveTo(70,-118,80,-90,74,-24); c.closePath();};
    sekil(yy,[renk[0]*.8|0,renk[1]*.8|0,renk[2]*.8|0],[-80,-122,80,-24],{seed:12,aci:1.2,aralik:8});
    for(let i=0;i<3;i++) hat(()=>{c.moveTo(-66,-100+i*22); c.lineTo(66,-100+i*22);},R.kirliSari,.18,2,13+i,1,1);
  }
  tabanGolge(0,2,110,16);
  const ust=()=>{c.moveTo(-74,-30); c.quadraticCurveTo(0,-38,74,-30); c.lineTo(84,-6); c.quadraticCurveTo(0,4,-84,-6); c.closePath();};
  sekil(ust,renk,[-84,-38,84,4],{seed:14,aci:.15,aralik:6,isik:.18});
  const yan=()=>{c.moveTo(-84,-6); c.quadraticCurveTo(0,4,84,-6); c.lineTo(84,2); c.quadraticCurveTo(0,10,-84,2); c.closePath();};
  sekil(yan,[renk[0]*.5|0,renk[1]*.5|0,renk[2]*.5|0],null,{seed:15});
  for(const d of[-.55,.55]) hat(()=>{c.moveTo(d*120,-34+Math.abs(d)*6); c.lineTo(d*134,-2);},R.kirliSari,.35,2.2,16,1,1); // kilim çizgileri
  for(const d of[-1,1]) for(let i=0;i<3;i++) hat(()=>{c.moveTo(d*84,-6+i*2); c.lineTo(d*(92+i*2),2+i*3);},R.kirliSari,.4,1.2,17+i,1,1); // püskül
  if(o.bos){leke(0,-18,40,9,R.siyah,.45); hat(()=>{c.ellipse(0,-17,36,7,0,Math.PI*1.05,Math.PI*1.95);},R.murekkep,.5,1.2,18,1,1);}
});}

// yer sofrası: alçak tahta ayak üstünde bakır sini
function sofra(o){Y(o,()=>{
  const rx=o.rx||170, ry=rx*.27;
  tabanGolge(0,4,rx*1.05,ry*.7,.8);
  const ayak=()=>{c.moveTo(-rx*.55,-26); c.lineTo(-rx*.5,0); c.quadraticCurveTo(0,ry*.3,rx*.5,0); c.lineTo(rx*.55,-26); c.closePath();};
  sekil(ayak,R.tahtaKoyu,[-rx*.55,-30,rx*.55,10],{seed:21,aci:1.4,aralik:5});
  const kenar=()=>{c.ellipse(0,-32,rx,ry,0,0,Math.PI); c.lineTo(-rx,-38); c.ellipse(0,-38,rx,ry,0,Math.PI,0,true); c.closePath();};
  sekil(kenar,R.bakir,[-rx,-38,rx,-32+ry],{seed:22,isik:.25,aralik:5});
  const yuz=elips(0,-38,rx,ry);
  sekil(yuz,[60,40,24],[-rx,-38-ry,rx,-38+ry],{seed:23,isik:.22,aci:.1,aralik:9,taraA:.22});
  hat(elips(0,-38,rx*.9,ry*.86),R.murekkep,.35,1,24,1,2);
  parilti(()=>{c.ellipse(0,-38,rx,ry,0,Math.PI*1.15,Math.PI*1.6);},.2,2);
});}

function kasik(o){Y(o,()=>{ // tahta kaşık, sofranın üstünde
  leke(2,2,30,5,R.siyah,.5);
  sekil(elips(-24,0,11,5,-.05),[110,80,46],[-35,-5,-13,5],{seed:31,tara:false,isik:.3,kalin:1.1});
  sekil(()=>{c.moveTo(-14,-2); c.lineTo(30,-4); c.lineTo(31,-1); c.lineTo(-14,2); c.closePath();},[96,70,40],null,{seed:32,kalin:1});
  parilti(()=>{c.moveTo(-30,-2); c.lineTo(-20,-3);},.35,1.2);
});}

function kase(o){Y(o,()=>{ // toprak ya da bakır kâse; dolu: içinde yemek
  tabanGolge(0,0,34,7,.6);
  const govde=()=>{c.moveTo(-28,-20); c.bezierCurveTo(-26,-2,-12,2,0,2); c.bezierCurveTo(12,2,26,-2,28,-20); c.closePath();};
  sekil(govde,o.renk||[86,60,40],[-28,-24,28,2],{seed:41,aralik:4,isik:.2});
  sekil(elips(0,-20,28,7),o.dolu?[70,52,28]:[22,16,10],null,{seed:42,kalin:1.2});
  if(o.dolu) leke(-6,-21,18,4,R.kirliSari,.35);
  parilti(()=>{c.ellipse(0,-20,28,7,0,Math.PI*1.1,Math.PI*1.5);},.3,1.2);
});}

function tabak(o){Y(o,()=>{
  tabanGolge(0,0,40,8,.5);
  sekil(elips(0,-4,36,9),o.renk||[120,110,88],[-36,-13,36,5],{seed:51,isik:.3,aralik:6,taraA:.2});
  hat(elips(0,-5,22,5),R.murekkep,.35,1,52,1,1);
  if(o.dolu){sekil(()=>{c.ellipse(-2,-8,20,6,0,0,TAU);},[86,62,30],null,{seed:53,kalin:1}); leke(-6,-9,12,3,R.kirliSari,.35);}
});}

function ekmek(o){Y(o,()=>{ // yufka ya da bölünmüş somun
  const r=rng(o.seed||61);
  const n=o.parca||1;
  for(let i=0;i<n;i++){
    const x=(i-(n-1)/2)*34+(r()-.5)*8, y=(r()-.5)*4, rx=n>1?18+r()*6:34, ry=n>1?6:10;
    tabanGolge(x,y+2,rx,ry*.6,.5);
    const yol=()=>{c.moveTo(x-rx,y); c.bezierCurveTo(x-rx,y-ry*1.6,x+rx,y-ry*1.8,x+rx,y-1); c.quadraticCurveTo(x+rx*.2,y+(r()-.5)*3,x-rx,y); c.closePath();};
    sekil(yol,[128,100,60],[x-rx,y-ry*1.6,x+rx,y],{seed:62+i,isik:.3,aralik:4,taraA:.25});
  }
});}

// gaz lambası: bakır hazne, isli cam; alev canlı çizilir
function lamba(o){Y(o,()=>{
  tabanGolge(0,0,30,6,.6);
  sekil(()=>{c.moveTo(-18,0); c.bezierCurveTo(-26,-8,-24,-22,-12,-26); c.lineTo(12,-26); c.bezierCurveTo(24,-22,26,-8,18,0); c.closePath();},R.bakir,[-24,-26,24,0],{seed:71,isik:.35,aralik:4});
  sekil(()=>{c.rect(-8,-32,16,7);},R.demir,null,{seed:72,kalin:1});
  const cam=()=>{c.moveTo(-7,-32); c.bezierCurveTo(-20,-44,-20,-62,-8,-70); c.lineTo(-6,-92); c.lineTo(6,-92); c.lineTo(8,-70); c.bezierCurveTo(20,-62,20,-44,7,-32); c.closePath();};
  c.fillStyle='rgba(60,52,30,.25)'; c.beginPath(); cam(); c.fill();
  hat(cam,[150,140,110],.35,1.1,73,2,1);
  leke(0,-88,10,10,R.siyah,.5); // is
});}
function lambaCanli(o,t,I){
  if(o.sonuk) return;
  Y(o,()=>{
    const h=14+Math.sin(t*13)*1.2+Math.sin(t*7.3)*1.5, sal=Math.sin(t*5.1)*1.2;
    leke(0,-50,40,40,R.lamba,.35*I);
    c.fillStyle=rgba([255,236,180],.9*I); c.beginPath(); c.moveTo(-4,-44); c.quadraticCurveTo(-5,-48-h*.5,sal,-44-h); c.quadraticCurveTo(5,-48-h*.5,4,-44); c.closePath(); c.fill();
    leke(0,-50,9,13,[255,220,140],.6*I);
  });
}

// ocak: duvara gömülü kemerli ocak. yanik: içinde ateş; sonmus: kül ve kararmış odun
function ocak(o){Y(o,()=>{
  const w=o.w||190, h=o.h||170;
  const davlumbaz=()=>{c.moveTo(-w*.62,-h); c.lineTo(-w*.3,-h-150); c.lineTo(w*.3,-h-150); c.lineTo(w*.62,-h); c.closePath();};
  sekil(davlumbaz,[50,46,36],[-w*.62,-h-150,w*.62,-h],{seed:81,koyu:.5,aci:1.1,aralik:6});
  leke(0,-h-80,w*.4,90,R.siyah,.55); // is
  const kemer=()=>{c.moveTo(-w/2,0); c.lineTo(-w/2,-h+w/2); c.arc(0,-h+w/2,w/2,Math.PI,0); c.lineTo(w/2,0); c.closePath();};
  const cerceve=()=>{c.moveTo(-w/2-26,4); c.lineTo(-w/2-26,-h+w/2); c.arc(0,-h+w/2,w/2+26,Math.PI,0); c.lineTo(w/2+26,4); c.closePath();};
  sekil(cerceve,[64,58,44],[-w/2-26,-h-26,w/2+26,4],{seed:82,aralik:6});
  c.fillStyle='#050404'; c.beginPath(); kemer(); c.fill();
  c.save(); c.beginPath(); kemer(); c.clip(); tara(-w/2,-h,w/2,0,.9,6,[20,18,14],.6,83);
  // odunlar ve kül
  const r=rng(84);
  for(let i=0;i<4;i++){const x=-50+i*30+(r()-.5)*10, a=(r()-.5)*.6; c.save(); c.translate(x,-14); c.rotate(a); c.fillStyle='#120d09'; c.fillRect(-40,-7,80,13); hat(()=>{c.rect(-40,-7,80,13);},[40,30,20],.6,1.2,85+i,1,1); c.restore();}
  leke(0,-4,w*.4,12,[70,66,58],o.yanik?.2:.45);
  c.restore();
  hat(kemer,R.murekkep,.9,2,86,2,2);
});}
function ocakCanli(o,t,I){
  Y(o,()=>{
    const g=o.yanik?1:.35;
    // kor: nabız gibi atan kızıllık
    const n=.75+.25*Math.sin(t*2.1)*Math.sin(t*3.7);
    leke(0,-14,60,16,[200,70,20],.45*n*g*I);
    leke(0,-20,120,60,[190,90,30],.18*n*g*I);
    if(o.yanik){
      for(let i=0;i<4;i++){
        const x=-36+i*24, h=26+12*Math.sin(t*6+i*2)+8*Math.sin(t*11+i);
        c.fillStyle=rgba([230,150,60],.55*I); c.beginPath(); c.moveTo(x-10,-16); c.quadraticCurveTo(x-8,-16-h*.6,x+Math.sin(t*4+i)*4,-16-h); c.quadraticCurveTo(x+8,-16-h*.6,x+10,-16); c.closePath(); c.fill();
      }
      leke(0,-40,70,50,[240,170,80],.25*I);
    }
  });
}

// sandık: acik ise kapağı arkaya devrilmiş; icerik: 'hirka' (katlı kırmızı hırka)
function sandik(o){Y(o,()=>{
  const w=o.w||180, h=o.h||100, renk=o.renk||[66,44,26];
  tabanGolge(0,4,w*.65,14,.8);
  if(o.acik){
    const kapak=()=>{c.moveTo(-w/2,-h); c.lineTo(-w/2+6,-h-70); c.lineTo(w/2-6,-h-70); c.lineTo(w/2,-h); c.closePath();};
    sekil(kapak,[renk[0]*.7|0,renk[1]*.7|0,renk[2]*.7|0],[-w/2,-h-70,w/2,-h],{seed:91,aralik:5});
    c.fillStyle='#0a0705'; c.beginPath(); c.moveTo(-w/2+8,-h); c.lineTo(-w/2+16,-h-14); c.lineTo(w/2-16,-h-14); c.lineTo(w/2-8,-h); c.closePath(); c.fill();
  }
  const on=()=>{c.rect(-w/2,-h,w,h);};
  sekil(on,renk,[-w/2,-h,w/2,0],{seed:92,aralik:5,isik:.2});
  for(const yy of[-h+14,-16]) {c.fillStyle='rgba(18,16,14,.9)'; c.fillRect(-w/2,yy-5,w,10); hat(()=>{c.rect(-w/2,yy-5,w,10);},R.murekkep,.7,1.2,93+yy,1,1);} // demir kuşak
  hat(()=>{c.ellipse(0,-h*.55,w*.22,h*.2,0,0,TAU);},R.kirliSari,.25,1.4,95,2,2); // oyma süs
  karalama(0,-h*.55,w*.14,h*.1,R.kirliSari,.12,96,7);
  if(!o.acik){
    const kapak=()=>{c.moveTo(-w/2-4,-h); c.quadraticCurveTo(0,-h-26,w/2+4,-h); c.closePath();};
    sekil(kapak,[renk[0]*.8|0,renk[1]*.8|0,renk[2]*.8|0],[-w/2,-h-26,w/2,-h],{seed:97});
    if(o.kilit!==false){c.fillStyle='#1a1a18'; c.fillRect(-8,-h-2,16,20); hat(()=>{c.rect(-8,-h-2,16,20);},R.murekkep,.8,1,98,1,1);}
  }
  if(o.icerik==='hirka'){ // katlı kırmızı yün hırka, kenardan sarkan bir kol
    const kat=()=>{c.moveTo(-60,-h-2); c.bezierCurveTo(-64,-h-30,-40,-h-36,0,-h-34); c.bezierCurveTo(40,-h-36,64,-h-30,60,-h-2); c.closePath();};
    sekil(kat,R.kirmizi,[-64,-h-36,64,-h],{seed:99,isik:.3,aralik:4,aci:.2,taraA:.3});
    const kol=()=>{c.moveTo(40,-h-6); c.bezierCurveTo(70,-h,w/2+10,-h+10,w/2+6,-h+60); c.lineTo(w/2-12,-h+62); c.bezierCurveTo(w/2-10,-h+20,60,-h+8,30,-h-2); c.closePath();};
    sekil(kol,[90,30,24],[30,-h-6,w/2+10,-h+62],{seed:100,isik:.25,aralik:4});
    for(let i=0;i<5;i++) hat(()=>{c.moveTo(-50+i*25,-h-30); c.lineTo(-46+i*25,-h-4);},[30,8,6],.4,1,101+i,1,1); // örgü
  }
});}

// asma kilit
function asmaKilit(o){Y(o,()=>{
  hat(()=>{c.arc(0,-26,12,Math.PI,0);},[60,60,56],.9,4,111,2,1);
  sekil(yuvarlak4(-16,-26,32,30),R.demir,[-16,-26,16,4],{seed:112,isik:.35,tara:false});
  c.fillStyle='#000'; c.fillRect(-2,-16,4,9);
  parilti(()=>{c.moveTo(-12,-22); c.lineTo(10,-22);},.35,1.4);
});}
const yuvarlak4=(x,y,w,h)=>()=>{c.roundRect(x,y,w,h,4);};

// çivide asılı kocaman demir anahtar
function anahtar(o){Y(o,()=>{
  c.fillStyle='#111'; c.beginPath(); c.arc(0,0,4,0,TAU); c.fill(); // çivi
  leke(6,40,16,46,R.siyah,.4);
  hat(()=>{c.ellipse(0,14,11,13,0,0,TAU);},[70,66,58],.9,3.4,121,2,1);
  hat(()=>{c.moveTo(0,27); c.lineTo(0,86);},[70,66,58],.95,4,122,2,1);
  sekil(()=>{c.rect(0,72,14,8); c.rect(0,82,10,6);},R.demir,null,{seed:123,kalin:1});
  parilti(()=>{c.moveTo(-3,30); c.lineTo(-3,80);},.3,1.2);
});}

// tahta kapı: lata ve demir çivi; kilit; isik: aralıklardan dışarıdaki fenerin ışığı sızar
function kapi(o){Y(o,()=>{
  const w=o.w||170, h=o.h||330;
  sekil(()=>{c.rect(-w/2-24,-h-24,w+48,h+24);},[40,34,26],[-w/2-24,-h-24,w/2+24,0],{seed:131,aralik:6});
  if(o.isik){ // kapının çevresinden sızan ışık: ince parlak çizgiler
    c.fillStyle=rgba(o.isik==='ay'?[150,172,168]:[236,186,96],o.isik==='ay'?.6:.9); c.fillRect(-w/2-3,-h-3,w+6,h+3);
  }
  const r=rng(132);
  for(let x=-w/2;x<w/2-1;){const ww=Math.min(w/2-x,34+r()*14);
    c.fillStyle=rgba([46+r()*14|0,34+r()*8|0,22],1); c.fillRect(x,-h,ww-2,h);
    c.save(); c.beginPath(); c.rect(x,-h,ww-2,h); c.clip(); leke(x+ww/2,-h*.5,ww,h*.6,R.siyah,.35); tara(x,-h,x+ww,0,1.52,7,R.murekkep,.35,133+x|0); c.restore();
    hat(()=>{c.moveTo(x+ww-1,-h); c.lineTo(x+ww-1,0);},R.murekkep,.9,1.8,(x|0)+134,2,1);
    x+=ww;}
  for(const yy of[-h*.82,-h*.2]){c.fillStyle='#1c1814'; c.fillRect(-w/2,yy-9,w,18); hat(()=>{c.rect(-w/2,yy-9,w,18);},R.murekkep,.8,1.4,(yy|0)+135,2,1); for(let x=-w/2+12;x<w/2;x+=28){c.fillStyle='#0a0a0a'; c.beginPath(); c.arc(x,yy,2.6,0,TAU); c.fill();}}
  if(o.demir){for(const yy of[-h*.5]){c.fillStyle='#16171a'; c.fillRect(-w/2,yy-7,w,14);}}
  hat(()=>{c.rect(-w/2,-h,w,h);},R.murekkep,.95,2.2,136,2,1.5);
  if(o.kilit){c.fillStyle='#121212'; c.fillRect(w*.18,-h*.52,w*.3,14); asmaKilit({x:w*.3,y:-h*.42,s:1.1});}
  if(o.halka){hat(()=>{c.arc(w*.28,-h*.5,12,0,TAU);},[70,66,58],.8,3,137,2,1);}
});}

// dükkân kepengi: yatay tahtalar, demir sürgü, kilit
function kepenk(o){Y(o,()=>{
  const w=o.w||420, h=o.h||300;
  sekil(()=>{c.rect(-w/2-30,-h-40,w+60,h+40);},[52,48,38],[-w/2-30,-h-40,w/2+30,0],{seed:141,aralik:6});
  const r=rng(142);
  for(let y=-h;y<0;y+=30){
    c.fillStyle=rgba([44+r()*16|0,34+r()*10|0,22],1); c.fillRect(-w/2,y,w,28);
    c.save(); c.beginPath(); c.rect(-w/2,y,w,28); c.clip(); tara(-w/2,y,w/2,y+28,.02,5,R.murekkep,.35,143+y|0); leke((r()-.5)*w,y+14,w*.4,20,R.siyah,.3); c.restore();
    hat(()=>{c.moveTo(-w/2,y+29); c.lineTo(w/2,y+29+(r()-.5)*3);},R.murekkep,.9,2,(y|0)+144,2,1.5);
  }
  c.fillStyle='#141414'; c.fillRect(-w/2-10,-h*.55,w+20,14); hat(()=>{c.rect(-w/2-10,-h*.55,w+20,14);},R.murekkep,.8,1.4,145,2,1);
  asmaKilit({x:20,y:-h*.55+42,s:1.2});
  hat(()=>{c.rect(-w/2,-h,w,h);},R.murekkep,.9,2.2,146,2,1.5);
  // tabela: boş, boyası dökük
  sekil(()=>{c.rect(-110,-h-36,220,30);},[70,62,44],[-110,-h-36,110,-h-6],{seed:147,aralik:5});
  karalama(0,-h-21,60,6,R.murekkep,.25,148,8);
});}

/* ───── demirci ───── */
function ors(o){Y(o,()=>{
  tabanGolge(0,4,90,14,.8);
  const kutuk=()=>{c.moveTo(-44,0); c.lineTo(-40,-86); c.lineTo(40,-86); c.lineTo(44,0); c.closePath();};
  sekil(kutuk,R.tahtaKoyu,[-44,-86,44,0],{seed:151,aci:1.5,aralik:5});
  const ors=()=>{ // ayak, bel, gövde, sivri boynuz
    c.moveTo(-40,-86); c.lineTo(-26,-104); c.lineTo(-22,-118); c.lineTo(-56,-122);
    c.bezierCurveTo(-84,-124,-112,-132,-140,-146); c.bezierCurveTo(-110,-150,-80,-152,-56,-152);
    c.lineTo(66,-152); c.lineTo(66,-126); c.lineTo(28,-120); c.lineTo(26,-104); c.lineTo(40,-86); c.closePath();};
  sekil(ors,[34,36,38],[-130,-148,70,-86],{seed:152,isik:.3,aralik:4,taraA:.4});
  parilti(()=>{c.moveTo(-100,-149); c.lineTo(64,-151);},.4,2);
});}
const NAL=()=>{c.moveTo(-26,0); c.bezierCurveTo(-34,-30,-18,-40,0,-40); c.bezierCurveTo(18,-40,34,-30,26,0);};
function nal(o){Y(o,()=>{ // yarım kalmış nal, örsün üstünde yatar: kızıllığı canlı kısımda söner
  c.save(); c.scale(1,.42); hat(NAL,[40,36,34],.95,8,161,2,1); c.restore();
});}
function nalCanli(o,t,I,ilerleme){ // örsün üstünde soğuyan nal: sahne boyunca kızıllık azalır
  const k=clamp(1-ilerleme*.9,0,1);
  Y(o,()=>{
    c.save(); c.globalCompositeOperation='lighter';
    c.save(); c.scale(1,.42); hat(NAL,[220,80,24],.85*k,5,162,1,0); c.restore();
    leke(0,-8,46,20,[200,60,20],.35*k);
    c.restore();
  });
}
function cekic(o){Y(o,()=>{
  sekil(()=>{c.moveTo(0,0); c.lineTo(80,-6); c.lineTo(80,0); c.lineTo(0,6); c.closePath();},[70,50,30],null,{seed:171,kalin:1});
  sekil(()=>{c.rect(-12,-14,24,28);},R.demir,[-12,-14,12,14],{seed:172,tara:false,isik:.3});
});}
// demirci ocağı: taş yükselti, üstünde davlumbaz; yanında inmiş körük
function korukOcak(o){Y(o,()=>{
  const w=300;
  const davl=()=>{c.moveTo(-w*.5,-150); c.lineTo(-w*.2,-470); c.lineTo(w*.2,-470); c.lineTo(w*.5,-150); c.closePath();};
  sekil(davl,[44,40,32],[-w*.5,-470,w*.5,-150],{seed:181,koyu:.6,aralik:6,aci:1.2});
  leke(0,-300,110,160,R.siyah,.6);
  const ust=()=>{c.rect(-w/2,-150,w,150);};
  sekil(ust,[56,52,40],[-w/2,-150,w/2,0],{seed:182,aralik:6});
  c.fillStyle='#080605'; c.beginPath(); c.ellipse(0,-150,w*.36,24,0,0,TAU); c.fill(); // ocak çukuru
  leke(0,-150,w*.32,18,[70,66,58],.45); // gri kül
  hat(elips(0,-150,w*.36,24),R.murekkep,.8,1.6,183,2,1);
  // körük: deri körük, kolu inmiş
  c.save(); c.translate(-w*.5-110,-40); c.scale(-1,1);
  const koruk=()=>{c.moveTo(-110,-10); c.lineTo(60,-40); c.bezierCurveTo(80,-10,80,20,60,30); c.lineTo(-110,10); c.closePath();};
  sekil(koruk,[52,36,24],[-110,-40,80,30],{seed:184,aralik:4,aci:.4});
  for(let i=0;i<4;i++) hat(()=>{c.moveTo(-60+i*30,-14-i*6); c.quadraticCurveTo(-56+i*30,0,-60+i*30,14+i*4);},R.murekkep,.6,1.2,185+i,1,1);
  hat(()=>{c.moveTo(60,-40); c.lineTo(150,30);},[60,44,28],.9,4,189,2,1);
  c.restore();
});}
function ocakKorCanli(o,t,I){ // demirci ocağında son kor
  Y(o,()=>{const n=.7+.3*Math.sin(t*1.7)*Math.sin(t*2.9); leke(-20,-152,46,10,[210,70,20],.5*n*I); leke(0,-160,120,50,[180,70,20],.16*n*I);});
}
function suTeknesi(o){Y(o,()=>{
  tabanGolge(0,4,110,12);
  sekil(()=>{c.moveTo(-100,-60); c.lineTo(100,-60); c.lineTo(92,0); c.lineTo(-92,0); c.closePath();},[48,44,36],[-100,-60,100,0],{seed:191,aralik:6});
  sekil(elips(0,-60,98,10),[14,20,20],null,{seed:192,kalin:1.1});
  parilti(()=>{c.ellipse(0,-60,80,6,0,Math.PI*1.1,Math.PI*1.4);},.25,1.2);
});}

/* ───── çeşme ───── */
function cesme(o){Y(o,()=>{
  const w=300;
  const ayna=()=>{c.moveTo(-w/2,0); c.lineTo(-w/2,-300); c.lineTo(-w/2+20,-330); c.lineTo(w/2-20,-330); c.lineTo(w/2,-300); c.lineTo(w/2,0); c.closePath();};
  sekil(ayna,[74,70,56],[-w/2,-330,w/2,0],{seed:201,aralik:7});
  const kemer=()=>{c.moveTo(-90,-110); c.lineTo(-90,-210); c.quadraticCurveTo(0,-300,90,-210); c.lineTo(90,-110); c.closePath();};
  c.fillStyle='#14150f'; c.beginPath(); kemer(); c.fill(); c.save(); c.beginPath(); kemer(); c.clip(); tara(-90,-300,90,-110,.8,6,R.murekkep,.45,202); leke(0,-200,60,80,R.kufYesil,.25); c.restore();
  hat(kemer,R.murekkep,.9,2,203,2,1.5);
  sekil(()=>{c.rect(-60,-292,120,40);},[90,86,70],[-60,-292,60,-252],{seed:204,aralik:5}); // kitabe taşı, yazısı silinmiş
  karalama(0,-272,40,8,R.murekkep,.2,205,10);
  sekil(()=>{c.rect(-8,-226,16,10); c.moveTo(-3,-216); c.lineTo(3,-216); c.lineTo(3,-200); c.lineTo(-3,-200); c.closePath();},R.bakir,null,{seed:206,kalin:1.2}); // lüle
  // yalak
  const yalak=()=>{c.moveTo(-w/2-20,-44); c.lineTo(w/2+20,-44); c.lineTo(w/2+10,0); c.lineTo(-w/2-10,0); c.closePath();};
  sekil(yalak,[66,62,50],[-w/2-20,-44,w/2+20,0],{seed:207,aralik:6});
  sekil(()=>{c.rect(-w/2-6,-50,w+12,10);},[30,34,32],null,{seed:208,kalin:1.2});
  leke(0,4,w*.7,20,R.siyah,.6);
  // ıslak taşlar: yalağın önünde parlayan su
  for(let i=0;i<5;i++) leke(-120+i*60,10,40,6,R.ay,.06);
});}
function cesmeCanli(o,t,I){ // lüleden akan ince su
  if(o.kuru) return;
  Y(o,()=>{
    c.strokeStyle=rgba([150,170,165],.55*I); c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(0,-200); for(let y=-200;y<(o.suSon||-44);y+=5) c.lineTo(Math.sin(y*.3+t*20)*1.2,y); c.stroke();
    c.strokeStyle=rgba([210,225,220],.35*I); c.lineWidth=1; c.beginPath(); c.moveTo(-1,-200); for(let y=-200;y<(o.suSon||-44);y+=5) c.lineTo(-1+Math.sin(y*.5+t*24)*.8,y); c.stroke();
    leke(0,o.suSon||-44,18,5,[190,210,205],.4*I);
  });
}
// bakır güğüm: lülenin altında, dolmuş ve taşan
function gugum(o){Y(o,()=>{
  tabanGolge(0,2,40,8);
  const govde=()=>{c.moveTo(-12,-74); c.lineTo(-14,-60); c.bezierCurveTo(-40,-50,-40,-8,-22,0); c.lineTo(22,0); c.bezierCurveTo(40,-8,40,-50,14,-60); c.lineTo(12,-74); c.closePath();};
  sekil(govde,R.bakir,[-40,-74,40,0],{seed:211,isik:.35,aralik:4,taraA:.35});
  sekil(elips(0,-74,13,4),[10,14,14],null,{seed:212,kalin:1.2});
  hat(()=>{c.moveTo(14,-66); c.bezierCurveTo(44,-70,46,-30,30,-20);},R.bakir,.9,3.2,213,2,1); // kulp
  parilti(()=>{c.moveTo(-26,-44); c.bezierCurveTo(-30,-30,-26,-14,-20,-8);},.35,1.6);
});}
function gugumCanli(o,t,I){ // ağzından taşan su, yalağa süzülür
  Y(o,()=>{
    c.strokeStyle=rgba([170,190,186],.6*I); c.lineWidth=2.2;
    for(const d of[-1,1]){c.beginPath(); c.moveTo(d*12,-74); for(let y=-74;y<-4;y+=6) c.lineTo(d*(14+Math.max(0,28-Math.abs(y+40)*.7))+Math.sin(y*.4+t*12+d)*1,y); c.stroke();}
    const n=(t*1.5)%1; leke(0,-74,18,6,[200,215,210],.5*I); for(let i=0;i<2;i++){const m=(n+i*.5)%1; hat(()=>{c.ellipse(0,2,26+m*46,4+m*7,0,0,TAU);},[170,190,186],.45*(1-m)*I,1.2,215+i,1,0);}
  });
}

/* ───── terzi ───── */
function dikisMakinesi(o){Y(o,()=>{
  // alçak masa
  sekil(()=>{c.rect(-170,-130,340,18);},R.tahta,[-170,-130,170,-112],{seed:221,aralik:5});
  sekil(()=>{c.rect(-160,-112,18,112); c.rect(142,-112,18,112);},R.tahtaKoyu,null,{seed:222});
  tabanGolge(0,4,170,14);
  c.save(); c.translate(-10,-130);
  sekil(()=>{c.rect(-90,-14,190,14);},[18,18,16],[-90,-14,100,0],{seed:223,tara:false,isik:.3}); // taban
  const kol=()=>{c.moveTo(70,-14); c.lineTo(70,-96); c.bezierCurveTo(70,-112,56,-118,40,-118); c.lineTo(-56,-112); c.bezierCurveTo(-70,-110,-74,-100,-74,-86); c.lineTo(-74,-56); c.lineTo(-54,-56); c.lineTo(-54,-86); c.lineTo(46,-90); c.lineTo(46,-14); c.closePath();};
  sekil(kol,[16,16,15],[-74,-118,70,-14],{seed:224,isik:.25,tara:false});
  hat(()=>{c.moveTo(-40,-108); c.bezierCurveTo(-10,-114,20,-112,44,-104);},R.kirliSari,.5,1.4,225,2,1); // yaldız süs
  karalama(10,-102,18,4,R.kirliSari,.25,226,6);
  hat(()=>{c.moveTo(-64,-56); c.lineTo(-64,-24);},[120,120,110],.9,1.4,227,1,0); // iğne
  hat(()=>{c.arc(86,-70,26,0,TAU);},[30,30,28],.95,3.4,228,2,1); // el çarkı
  hat(()=>{c.moveTo(86,-70); c.lineTo(104,-90);},[30,30,28],.9,2.4,229,1,1);
  parilti(()=>{c.moveTo(-50,-112); c.lineTo(40,-117);},.25,1.6);
  c.restore();
});}
// gelinlik kumaşı: makinenin ayağından taşıp yere dökülen soluk beyaz
function gelinlik(o){Y(o,()=>{
  const yol=()=>{c.moveTo(-90,-140); c.bezierCurveTo(-40,-150,10,-148,40,-140); c.bezierCurveTo(70,-120,150,-110,170,-120); c.bezierCurveTo(200,-60,180,-10,220,0); c.lineTo(-40,0); c.bezierCurveTo(-80,-30,-110,-90,-90,-140); c.closePath();};
  sekil(yol,[150,146,128],[-110,-150,220,0],{seed:231,isik:.25,koyu:.45,aralik:9,aci:1.2,taraA:.22});
  for(let i=0;i<6;i++) hat(()=>{c.moveTo(60+i*24,-118); c.bezierCurveTo(70+i*26,-80,60+i*28,-30,70+i*30,0);},[60,58,50],.35,1.2,232+i,1,2); // kıvrımlar
  hat(()=>{c.moveTo(-60,-136); c.lineTo(-58,-150);},[200,200,190],.8,1,238,1,0); // kumaşta kalmış iğne
});}
function makas(o){Y(o,()=>{
  hat(()=>{c.ellipse(-26,-6,8,6,0,0,TAU); c.moveTo(-26+8,-2); c.ellipse(-26,8,8,6,0,0,TAU);},[50,50,48],.9,2.4,241,2,1);
  hat(()=>{c.moveTo(-18,-4); c.lineTo(34,6); c.moveTo(-18,6); c.lineTo(34,2);},[80,80,76],.95,2.6,242,2,0);
});}
function yunYumagi(o){Y(o,()=>{
  tabanGolge(0,2,22,5);
  sekil(elips(0,-16,18,16),R.kirmizi,[-18,-32,18,0],{seed:251,isik:.3,tara:false});
  for(let i=0;i<5;i++) hat(()=>{c.ellipse(0,-16,16,6+i*2,i*.6,0,TAU);},[30,8,6],.35,1,252+i,1,1);
  hat(()=>{c.moveTo(14,-6); c.bezierCurveTo(40,0,50,4,80,2);},R.kirmizi,.8,1.4,258,1,1);
});}

/* ───── dışarısı ───── */
// taş seki: duvar dibinde uzun taş oturak
function tasSeki(o){Y(o,()=>{
  const w=o.w||340;
  tabanGolge(0,4,w*.6,14,.8);
  sekil(()=>{c.rect(-w/2,-74,w,74);},[60,58,48],[-w/2,-74,w/2,0],{seed:261,aralik:6});
  for(let x=-w/2+80;x<w/2;x+=90) hat(()=>{c.moveTo(x,-74); c.lineTo(x+4,0);},R.murekkep,.7,1.6,262+x|0,2,1);
  sekil(()=>{c.rect(-w/2-10,-86,w+20,14);},[78,76,62],[-w/2-10,-86,w/2+10,-72],{seed:263,isik:.3,aralik:5});
  leke(0,-80,w*.3,8,R.siyah,.25); // oturulmaktan kararmış orta
});}
function masrapa(o){Y(o,()=>{ // teneke maşrapa, ezik
  tabanGolge(0,1,22,5);
  sekil(()=>{c.moveTo(-14,-34); c.lineTo(14,-34); c.lineTo(15,-14); c.lineTo(12,0); c.lineTo(-13,0); c.lineTo(-15,-18); c.closePath();},[86,88,84],[-15,-34,15,0],{seed:271,isik:.35,aralik:4,taraA:.3});
  sekil(elips(0,-34,14,4),[16,18,18],null,{seed:272,kalin:1});
  hat(()=>{c.moveTo(14,-28); c.bezierCurveTo(28,-28,28,-10,14,-10);},[80,82,78],.9,2.4,273,2,1);
  parilti(()=>{c.moveTo(-10,-30); c.lineTo(-11,-6);},.3,1.4);
});}
function baston(o){Y(o,()=>{ // duvara dayalı kiraz baston
  hat(()=>{c.moveTo(0,0); c.lineTo(36,-300); c.bezierCurveTo(40,-330,70,-336,74,-312);},[78,46,30],.95,5,281,2,1);
  parilti(()=>{c.moveTo(4,-20); c.lineTo(34,-290);},.25,1.4);
  leke(30,-150,20,160,R.siyah,.25,.12);
});}
function pabuc(o){Y(o,()=>{ // eşikte bir çift pabuç
  for(const d of[-1,1]){
    const x=d*22;
    tabanGolge(x,2,24,5);
    sekil(()=>{c.moveTo(x-14,0); c.bezierCurveTo(x-18,-14,x-6,-16,x+10,-12); c.bezierCurveTo(x+22,-8,x+20,0,x+14,2); c.closePath();},[34,24,16],[x-18,-16,x+22,2],{seed:291+d,isik:.25,tara:false,kalin:1.2});
  }
});}

/* ───── mağara ───── */
function sonmusAtes(o){Y(o,()=>{
  const r=rng(301);
  leke(0,-2,70,14,[60,58,52],.5);
  for(let i=0;i<9;i++){const a=i/9*TAU, x=Math.cos(a)*58, y=Math.sin(a)*12-4; sekil(elips(x,y,14,9),[54,52,44],[x-14,y-9,x+14,y+9],{seed:302+i,tara:false,kalin:1.1});}
  for(let i=0;i<4;i++){const a=(r()-.5)*1.4; c.save(); c.translate((r()-.5)*30,-8); c.rotate(a); c.fillStyle='#0c0a08'; c.fillRect(-26,-4,52,8); hat(()=>{c.rect(-26,-4,52,8);},[40,38,34],.6,1,311+i,1,1); c.restore();}
});}
function kaput(o){Y(o,()=>{ // katlanmış asker kaputu; bir düğmesi eksik
  tabanGolge(0,2,80,10);
  const yol=()=>{c.moveTo(-70,0); c.bezierCurveTo(-76,-26,-64,-44,-40,-46); c.lineTo(52,-48); c.bezierCurveTo(72,-46,78,-24,72,0); c.closePath();};
  sekil(yol,[50,52,38],[-76,-48,78,0],{seed:321,isik:.2,aralik:5,aci:.3});
  hat(()=>{c.moveTo(-60,-24); c.quadraticCurveTo(0,-30,64,-26);},R.murekkep,.6,1.4,322,1,1);
  for(let i=0;i<3;i++){if(i===1) continue; c.fillStyle='#6a5a30'; c.beginPath(); c.arc(-30+i*30,-36,3.4,0,TAU); c.fill();}
  hat(()=>{c.moveTo(-2,-38); c.lineTo(2,-33);},[30,28,20],.7,1,323,1,0); // kopuk iplik
});}
function bohca(o){Y(o,()=>{ // taşın üstünde bırakılmış yemek bohçası
  sekil(()=>{c.moveTo(-70,0); c.bezierCurveTo(-74,-30,-60,-40,0,-42); c.bezierCurveTo(60,-40,74,-30,70,0); c.closePath();},[64,62,52],[-74,-42,74,0],{seed:331,aralik:6});
  const yol=()=>{c.moveTo(-36,-40); c.bezierCurveTo(-42,-70,-20,-84,0,-82); c.bezierCurveTo(22,-84,42,-70,36,-40); c.closePath();};
  sekil(yol,[110,96,70],[-42,-84,42,-40],{seed:332,isik:.3,aralik:5});
  sekil(()=>{c.moveTo(-6,-80); c.lineTo(-18,-96); c.lineTo(-4,-90); c.lineTo(6,-98); c.lineTo(6,-80); c.closePath();},[100,86,62],null,{seed:333,kalin:1}); // düğüm
});}

/* ───── ahır, ağıl ───── */
function fener(o){Y(o,()=>{ // gemici feneri: çiviye asılı
  hat(()=>{c.moveTo(0,-110); c.quadraticCurveTo(-14,-96,-10,-86); c.moveTo(0,-110); c.quadraticCurveTo(14,-96,10,-86);},R.demir,.9,1.6,341,1,0);
  sekil(()=>{c.rect(-16,-86,32,8);},R.demir,null,{seed:342,kalin:1.2});
  const cam=()=>{c.moveTo(-14,-78); c.bezierCurveTo(-22,-60,-22,-30,-14,-18); c.lineTo(14,-18); c.bezierCurveTo(22,-30,22,-60,14,-78); c.closePath();};
  c.fillStyle='rgba(70,60,30,.3)'; c.beginPath(); cam(); c.fill(); hat(cam,[110,100,80],.6,1.2,343,2,1);
  for(const d of[-1,1]) hat(()=>{c.moveTo(d*12,-78); c.lineTo(d*12,-18);},R.demir,.8,1.6,344+d,1,0);
  sekil(()=>{c.rect(-18,-18,36,16);},R.demir,null,{seed:346,kalin:1.2});
});}
function fenerCanli(o,t,I){if(o.sonuk) return; Y(o,()=>{const n=.85+.15*Math.sin(t*9)*Math.sin(t*3.1); leke(0,-46,60,60,R.lamba,.3*n*I); leke(0,-46,10,16,[255,220,150],.7*n*I);});}
function ahirBolme(o){Y(o,()=>{ // ahır bölmesi: dikmeler ve yatay tahtalar (katırların alt gövdesini gizler)
  const w=o.w||700, h=o.h||190, r=rng(351);
  for(let y=-h;y<0;y+=40){const yy=y; sekil(()=>{c.rect(-w/2,yy,w,34);},[54+r()*10|0,40,26],[-w/2,yy,w/2,yy+34],{seed:352+y|0,aralik:5,aci:.04});}
  for(const x of o.dikme||[-w/2,0,w/2]) sekil(()=>{c.rect(x-14,-h-90,28,h+90);},R.tahtaKoyu,[x-14,-h-90,x+14,0],{seed:360+x|0,aci:1.5,aralik:5});
  // saman
  for(let i=0;i<60;i++){const x=(r()-.5)*w*1.2, a=(r()-.5)*.8; hat(()=>{c.moveTo(x,2); c.lineTo(x+Math.cos(a)*24,2+Math.sin(a)*6);},R.kirliSari,.35,1.2,370+i,1,1);}
});}
function agilDuvar(o){Y(o,()=>{ // ağıl: alçak taş duvar, ortada tahta çit kapı
  const w=o.w||1500, h=150, kap=o.kapi||220;
  c.save(); c.beginPath(); c.rect(-w/2,-h,w/2-kap/2,h); c.rect(kap/2,-h,w/2-kap/2,h); c.clip();
  sekilDuvar(-w/2,-h,w/2,0); c.restore();
  hat(()=>{c.moveTo(-w/2,-h); c.lineTo(-kap/2,-h+4); c.moveTo(kap/2,-h+2); c.lineTo(w/2,-h);},R.murekkep,.8,2,381,2,3);
  // çit kapı: yatay sırıklar
  for(let i=0;i<4;i++){const y=-h+18+i*34; hat(()=>{c.moveTo(-kap/2,y); c.lineTo(kap/2,y+(i%2?4:-3));},[60,46,30],.95,7,382+i,2,2);}
  for(const x of[-kap/2,kap/2]) sekil(()=>{c.rect(x-10,-h-30,20,h+30);},R.tahtaKoyu,[x-10,-h-30,x+10,0],{seed:390+x|0});
});}
function sekilDuvar(x0,y0,x1,y1){ // ağıl için kaba kuru duvar taşları
  const r=rng(395);
  c.fillStyle='#1d1c17'; c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let y=y0;y<y1;y+=26) for(let x=x0-r()*30;x<x1;){const w=30+r()*40; const xx=x, yy=y; sekil(()=>{c.ellipse(xx+w/2,yy+13,w/2,12,r()*.3-.15,0,TAU);},[50+r()*16|0,48+r()*12|0,40],[xx,yy,xx+w,yy+26],{seed:(xx*3+yy)|0,tara:false,kalin:1.1,isikRenk:R.ay}); x+=w+2;}
  tara(x0,y0,x1,y1,.6,8,R.murekkep,.3,396);
}
function kaval(o){Y(o,()=>{
  hat(()=>{c.moveTo(-60,0); c.lineTo(60,-6);},[110,90,54],.95,5,401,2,0);
  for(let i=0;i<5;i++){c.fillStyle='#120e08'; c.beginPath(); c.arc(-20+i*14,-2.5+i*-.3,1.8,0,TAU); c.fill();}
});}

/* ───── baraka, kediler ───── */
function sutTasi(o){Y(o,()=>{ // boş süt tası: dibinde kurumuş halka
  tabanGolge(0,2,40,7);
  sekil(()=>{c.moveTo(-32,-12); c.bezierCurveTo(-30,0,30,0,32,-12); c.closePath();},[96,94,84],[-32,-18,32,2],{seed:411,isik:.3,tara:false});
  sekil(elips(0,-12,32,7),[26,26,22],null,{seed:412,kalin:1.2});
  hat(elips(0,-11,18,3.4),[140,138,124],.35,1,413,1,1);
});}
function sal(o){Y(o,()=>{ // boz yün şal, boş oturağın üstüne bırakılmış
  const yol=()=>{c.moveTo(-70,-10); c.bezierCurveTo(-60,-40,40,-46,70,-20); c.bezierCurveTo(84,10,90,40,80,70); c.lineTo(50,72); c.bezierCurveTo(54,30,40,6,10,0); c.lineTo(-70,0); c.closePath();};
  sekil(yol,[80,74,62],[-70,-46,90,72],{seed:421,isik:.22,aralik:4,aci:.9});
  for(let i=0;i<8;i++) hat(()=>{c.moveTo(52+i*4,70); c.lineTo(52+i*4,84);},[80,74,62],.6,1.2,422+i,1,1); // saçak
});}
function tabure(o){Y(o,()=>{
  tabanGolge(0,2,60,9);
  sekil(()=>{c.rect(-56,-60,112,14);},R.tahta,[-56,-60,56,-46],{seed:431,aralik:5});
  sekil(()=>{c.rect(-48,-46,12,46); c.rect(36,-46,12,46);},R.tahtaKoyu,null,{seed:432});
});}
function sedir(o){Y(o,()=>{ // duvar boyu alçak sedir, üstünde minderler
  const w=o.w||520;
  sekil(()=>{c.rect(-w/2,-70,w,70);},R.tahtaKoyu,[-w/2,-70,w/2,0],{seed:441,aralik:5});
  sekil(()=>{c.moveTo(-w/2,-70); c.quadraticCurveTo(0,-84,w/2,-70); c.lineTo(w/2,-60); c.lineTo(-w/2,-60); c.closePath();},[60,38,30],[-w/2,-84,w/2,-60],{seed:442,isik:.2,aralik:6});
  for(let x=-w/2+80;x<w/2;x+=160){const xx=x; sekil(()=>{c.moveTo(xx-74,-74); c.lineTo(xx-66,-128); c.quadraticCurveTo(xx,-136,xx+66,-128); c.lineTo(xx+74,-74); c.closePath();},[54,34,28],[xx-74,-136,xx+74,-74],{seed:443+x|0,aralik:7,aci:1.2}); hat(()=>{c.moveTo(xx-60,-104); c.lineTo(xx+60,-104);},R.kirliSari,.18,2,450+x|0,1,1);}
});}
function otTorbasi(o){Y(o,()=>{ // çiviye asılı kurutulmuş ot torbası
  c.fillStyle='#111'; c.beginPath(); c.arc(0,0,4,0,TAU); c.fill();
  hat(()=>{c.moveTo(0,0); c.lineTo(-18,30); c.moveTo(0,0); c.lineTo(18,30);},[70,60,40],.8,1.6,451,1,0);
  const yol=()=>{c.moveTo(-22,30); c.bezierCurveTo(-46,60,-44,120,-20,130); c.lineTo(20,130); c.bezierCurveTo(44,120,46,60,22,30); c.closePath();};
  sekil(yol,[70,64,46],[-46,30,46,130],{seed:452,aralik:4,aci:.3});
  for(let i=0;i<6;i++){const a=-1.3+i*.5; hat(()=>{c.moveTo(0,32); c.lineTo(Math.cos(a)*30,32-Math.abs(Math.sin(a))*22-6);},[70,80,46],.6,1.2,453+i,1,1);} // ağzından taşan otlar
});}

/* ───── iş yerleri ───── */
function masa(o){Y(o,()=>{ // dört ayaklı tahta masa
  const w=o.w||320, h=o.h||150;
  tabanGolge(0,4,w*.6,14,.7);
  sekil(()=>{c.rect(-w/2+16,-h+16,16,h-16); c.rect(w/2-32,-h+16,16,h-16);},R.tahtaKoyu,null,{seed:461});
  sekil(()=>{c.moveTo(-w/2,-h); c.lineTo(w/2,-h); c.lineTo(w/2+8,-h+18); c.lineTo(-w/2-8,-h+18); c.closePath();},R.tahta,[-w/2-8,-h,w/2+8,-h+18],{seed:462,isik:.25,aralik:5,aci:.05});
  leke(0,-h+40,w*.5,30,R.siyah,.5);
});}
function defter(o){Y(o,()=>{ // açık defter; bos: sayfa boş
  const sayfa=(d)=>()=>{c.moveTo(0,-2); c.lineTo(d*62,-6); c.lineTo(d*66,10); c.lineTo(0,12); c.closePath();};
  for(const d of[-1,1]){sekil(sayfa(d),d<0?[124,118,96]:[110,104,86],[d<0?-66:0,-6,d<0?0:66,12],{seed:471+d,isik:.35,tara:false,kalin:1.2});
    if(!o.bos||d<0) for(let i=0;i<3;i++) hat(()=>{c.moveTo(d*8,1+i*3.4); c.lineTo(d*54,-2+i*3.4);},R.murekkep,.45,.8,473+i+d*5,1,.6);}
});}
function mektup(o){Y(o,()=>{ // yarım kalmış mektup ve kalem
  sekil(()=>{c.moveTo(-40,-4); c.lineTo(36,-8); c.lineTo(42,8); c.lineTo(-36,12); c.closePath();},[130,124,104],[-40,-8,42,12],{seed:481,isik:.35,tara:false,kalin:1.1});
  const r=rng(482);
  for(let i=0;i<3;i++){const son=i===2?-6:30; hat(()=>{c.moveTo(-32,-1+i*4); for(let x=-30;x<son;x+=4+r()*3) c.lineTo(x,-1+i*4+(r()-.5)*1.6);},R.murekkep,.6,.8,483+i,1,.4);}
  hat(()=>{c.moveTo(-4,14); c.lineTo(46,22);},[30,30,40],.95,2.6,486,1,0);
});}
function muhur(o){Y(o,()=>{ // muhtarlık mührü ve imzasız resmî kâğıt
  sekil(()=>{c.moveTo(-60,-4); c.lineTo(56,-10); c.lineTo(62,10); c.lineTo(-54,16); c.closePath();},[132,126,104],[-60,-10,62,16],{seed:491,isik:.35,tara:false,kalin:1.1});
  hat(()=>{c.moveTo(-44,-1); c.lineTo(40,-6);},R.murekkep,.6,1.4,492,1,.4);
  for(let i=0;i<2;i++) hat(()=>{c.moveTo(-46,4+i*4); c.lineTo(44,-1+i*4);},R.murekkep,.35,.8,493+i,1,.4);
  hat(()=>{c.moveTo(14,12); c.lineTo(46,9);},R.murekkep,.4,.8,495,1,0); // imza yeri boş
  c.save(); c.translate(-80,6);
  tabanGolge(0,2,16,4);
  sekil(()=>{c.rect(-11,-8,22,8);},[90,70,30],null,{seed:496,kalin:1});
  sekil(()=>{c.moveTo(-5,-8); c.bezierCurveTo(-8,-24,-10,-34,0,-38); c.bezierCurveTo(10,-34,8,-24,5,-8); c.closePath();},[60,40,24],[-10,-38,10,-8],{seed:497,isik:.3,tara:false,kalin:1});
  c.restore();
});}
function tufekAskisi(o){Y(o,()=>{ // duvarda boş tüfek askısı: iki ahşap çengel, aralarında silik iz
  for(const y of[0,180]) sekil(()=>{c.moveTo(-30,y); c.lineTo(30,y); c.lineTo(30,y+10); c.lineTo(6,y+12); c.lineTo(10,y+26); c.lineTo(-2,y+26); c.lineTo(-6,y+12); c.lineTo(-30,y+10); c.closePath();},R.tahtaKoyu,null,{seed:501+y});
  leke(4,96,10,96,R.kirliSari,.08); // tüfeğin yıllarca durduğu yerde kalan açık iz
});}
function kasket(o){Y(o,()=>{
  sekil(()=>{c.moveTo(-34,0); c.bezierCurveTo(-36,-30,30,-34,36,-6); c.lineTo(56,0); c.closePath();},[50,52,40],[-36,-34,56,0],{seed:511,isik:.25,tara:false,kalin:1.2});
});}
function degirmenTasi(o){Y(o,()=>{ // iki taş üst üste, üstünde ağaç huni, önünde un teknesi
  tabanGolge(0,4,200,16,.8);
  sekil(()=>{c.rect(-200,-70,400,70);},R.tahtaKoyu,[-200,-70,200,0],{seed:521,aralik:5}); // taban sekisi
  for(const [y,h] of[[-70,50],[-120,50]]) {const yy=y; sekil(()=>{c.moveTo(-150,yy); c.lineTo(150,yy); c.quadraticCurveTo(156,yy-h/2,150,yy-h); c.lineTo(-150,yy-h); c.quadraticCurveTo(-156,yy-h/2,-150,yy); c.closePath();},[70,68,60],[-156,yy-h,156,yy],{seed:522+y,aralik:5,aci:1.5});}
  // huni
  const huni=()=>{c.moveTo(-90,-310); c.lineTo(90,-310); c.lineTo(20,-210); c.lineTo(-20,-210); c.closePath();};
  sekil(huni,R.tahta,[-90,-310,90,-210],{seed:524,aralik:6});
  hat(()=>{c.moveTo(-80,-310); c.lineTo(-90,-460); c.moveTo(80,-310); c.lineTo(90,-460);},R.tahtaKoyu,.9,5,525,2,1);
  // un teknesi ve yere saçılmış un
  sekil(()=>{c.moveTo(-120,20); c.lineTo(120,20); c.lineTo(110,70); c.lineTo(-110,70); c.closePath();},R.tahta,[-120,20,120,70],{seed:526,aralik:6});
  leke(0,22,110,10,[170,166,150],.4);
  for(let i=0;i<8;i++) leke(-200+i*60,-4,40,6,[160,156,140],.18);
});}
function degirmenCanli(o,t,I){ // boşa dönen üst taş: yüzündeki çentik yavaşça kayar; inceden un tozu
  Y(o,()=>{
    for(let k=0;k<3;k++){const f=((t*.18+k/3)%1), x=-150+f*300, a=Math.sin(f*Math.PI);
      c.strokeStyle=`rgba(10,10,8,${.7*a})`; c.lineWidth=3; c.beginPath(); c.moveTo(x,-118); c.lineTo(x+(f-.5)*10,-72); c.stroke();}
    for(let i=0;i<6;i++){const f=(t*.12+i/6)%1; leke(-120+i*48+Math.sin(t+i)*10,-140-f*120,18,12,[170,166,150],.06*(1-f)*I);}
  });
}
function ark(o){Y(o,()=>{ // duvardan giren tahta oluk
  sekil(()=>{c.moveTo(-260,-300); c.lineTo(0,-250); c.lineTo(0,-226); c.lineTo(-260,-276); c.closePath();},R.tahta,[-260,-300,0,-226],{seed:531,aralik:5});
  leke(-40,40,180,20,[120,140,140],.18); // zeminde göllenen su
});}
function arkCanli(o,t,I){ // oluktan taşan su: ince çizgiler halinde düşer, yerde göllenir
  Y(o,()=>{
    c.lineCap='round';
    for(let i=0;i<7;i++){
      const x=-6+i*3, ph=t*3+i;
      c.strokeStyle=rgba([150,172,168],(.25+.2*Math.sin(ph))*I); c.lineWidth=1.6;
      c.beginPath(); c.moveTo(x,-238); c.quadraticCurveTo(x+18,-200,x+22+Math.sin(ph)*2,0); c.stroke();
    }
    for(let i=0;i<3;i++){const f=(t*.6+i/3)%1; hat(()=>{c.ellipse(22,4,20+f*70,4+f*10,0,0,TAU);},[150,172,168],.35*(1-f)*I,1.2,540+i,1,0);}
  });
}
function karatahta(o){Y(o,()=>{ // pencereden görünen kara tahta; tebeşirle yarım kalmış cümle
  sekil(()=>{c.rect(-120,-90,240,90);},[20,26,22],[-120,-90,120,0],{seed:551,isik:.15,aralik:6});
  const r=rng(552);
  hat(()=>{c.moveTo(-100,-60); for(let x=-98;x<40;x+=5+r()*4) c.lineTo(x,-60+(r()-.5)*6+(x%22<4?-6:0));},[170,170,150],.65,1.6,553,1,.6);
  hat(()=>{c.moveTo(-100,-34); for(let x=-98;x<-30;x+=5+r()*4) c.lineTo(x,-34+(r()-.5)*6);},[170,170,150],.6,1.6,554,1,.6);
  leke(-20,-40,90,30,[150,150,140],.05); // silinmiş tebeşir tozu
});}
function pencere(o){Y(o,()=>{ // küçük, demir parmaklıklı pencere; içi karanlık
  const w=o.w||200, h=o.h||150;
  sekil(()=>{c.rect(-w/2-16,-h-16,w+32,h+32);},[60,56,44],[-w/2-16,-h-16,w/2+16,16],{seed:561,aralik:6});
  c.fillStyle='#070807'; c.fillRect(-w/2,-h,w,h);
  if(o.icerik==='karatahta'){c.save(); c.beginPath(); c.rect(-w/2,-h,w,h); c.clip(); karatahta({x:10,y:-h*.25,s:.9}); leke(0,-h/2,w*.6,h*.6,R.siyah,.35); c.restore();}
  for(let x=-w/2+w/4;x<w/2;x+=w/4) hat(()=>{c.moveTo(x,-h); c.lineTo(x,0);},R.demir,.95,4,562+x|0,2,1);
  hat(()=>{c.rect(-w/2,-h,w,h);},R.murekkep,.9,2,566,2,1);
});}

/* ───── mutfak, köy odası ───── */
function fincan(o){Y(o,()=>{ // kulpsuz kahve fincanı, zarfında; dolu
  tabanGolge(0,1,16,4,.5);
  sekil(elips(0,-2,15,4),[90,70,40],null,{seed:571,kalin:1}); // zarf tabağı
  sekil(()=>{c.moveTo(-9,-16); c.lineTo(9,-16); c.lineTo(6,-3); c.lineTo(-6,-3); c.closePath();},[150,140,120],[-9,-16,9,-3],{seed:572,isik:.35,tara:false,kalin:1});
  sekil(elips(0,-16,9,2.6),[24,14,8],null,{seed:573,kalin:.8});
  parilti(()=>{c.moveTo(-6,-14); c.lineTo(-4,-5);},.4,1.2);
});}
function buharCanli(o,t,I,ilerleme){ // fincandan yükselen buhar; sahne ilerledikçe zayıflar (kahve soğuyor)
  if(!o.buhar) return;
  const k=clamp(1-ilerleme*.85,0,1);
  Y(o,()=>{
    c.lineCap='round';
    for(let i=0;i<2;i++){
      c.beginPath(); c.moveTo(0,-18);
      for(let y=0;y<90;y+=6){const s=y/90; c.lineTo(Math.sin(y*.08+t*1.3+i*2)*(3+s*12)+i*4-2,-18-y);}
      c.strokeStyle=rgba([170,166,150],(.08+i*.03)*k); c.lineWidth=2+i*2; c.stroke();
    }
  });
}
function cezve(o){Y(o,()=>{
  tabanGolge(0,1,22,5);
  sekil(()=>{c.moveTo(-10,-30); c.lineTo(10,-30); c.lineTo(16,0); c.lineTo(-16,0); c.closePath();},R.bakir,[-16,-30,16,0],{seed:581,isik:.35,aralik:4});
  hat(()=>{c.moveTo(10,-26); c.lineTo(56,-44);},[70,46,24],.95,3,582,2,0);
  parilti(()=>{c.moveTo(-8,-26); c.lineTo(-12,-4);},.35,1.4);
});}
function mangal(o){Y(o,()=>{ // bakır mangal, içinde kor
  tabanGolge(0,2,60,9);
  sekil(()=>{c.moveTo(-54,-40); c.bezierCurveTo(-50,-8,50,-8,54,-40); c.closePath();},R.bakir,[-54,-46,54,-10],{seed:591,isik:.3,aralik:4});
  sekil(()=>{c.rect(-30,-12,8,12); c.rect(22,-12,8,12);},R.bakir,null,{seed:592,kalin:1});
  sekil(elips(0,-40,54,10),[26,12,8],null,{seed:593,kalin:1.4});
});}
function mangalCanli(o,t,I){Y(o,()=>{const n=.7+.3*Math.sin(t*1.9)*Math.sin(t*3.3); leke(0,-42,40,7,[210,70,20],.6*n*I); leke(0,-50,70,30,[200,80,30],.15*n*I);});}
function tespih(o){Y(o,()=>{ // kehribar tespih, minderin üstünde
  for(let i=0;i<16;i++){const a=i/16*TAU; const x=Math.cos(a)*16, y=Math.sin(a)*5; c.fillStyle=rgba([150,96,30],.95); c.beginPath(); c.arc(x,y,2.6,0,TAU); c.fill(); leke(x,y,4,4,R.lamba,.25);}
  hat(()=>{c.moveTo(14,4); c.lineTo(28,14);},[150,96,30],.9,2.6,601,1,0);
});}
function yazma(o){Y(o,()=>{ // çiviye asılı sarı yazma
  c.fillStyle='#111'; c.beginPath(); c.arc(0,0,4,0,TAU); c.fill();
  const yol=()=>{c.moveTo(-6,0); c.bezierCurveTo(-30,20,-40,70,-30,110); c.lineTo(10,96); c.lineTo(34,116); c.bezierCurveTo(40,70,26,20,6,0); c.closePath();};
  sekil(yol,[130,110,46],[-40,0,40,116],{seed:611,isik:.3,aralik:5,aci:1.1});
  for(let i=0;i<4;i++) hat(()=>{c.arc(-12+i*10,60+i*8,4,0,TAU);},[80,60,20],.4,1,612+i,1,1); // oya
});}
function cuval(o){Y(o,()=>{
  tabanGolge(0,2,50,9);
  const yol=()=>{c.moveTo(-40,0); c.bezierCurveTo(-52,-40,-40,-90,-22,-104); c.lineTo(-10,-118); c.lineTo(12,-116); c.lineTo(22,-102); c.bezierCurveTo(44,-86,52,-40,40,0); c.closePath();};
  sekil(yol,[74,66,46],[-52,-118,52,0],{seed:621+(o.seed||0),aralik:5,isik:.2});
});}
function rakiSisesi(o){Y(o,()=>{
  const yol=()=>{c.moveTo(-10,0); c.lineTo(-11,-38); c.lineTo(-4,-46); c.lineTo(-4,-58); c.lineTo(4,-58); c.lineTo(4,-46); c.lineTo(11,-38); c.lineTo(10,0); c.closePath();};
  c.fillStyle='rgba(60,70,60,.55)'; c.beginPath(); yol(); c.fill(); hat(yol,[140,150,140],.5,1.1,631,2,1);
  parilti(()=>{c.moveTo(-6,-34); c.lineTo(-6,-6);},.35,1.4);
});}
function kirbac(o){Y(o,()=>{ // çiviye asılı örme kırbaç
  c.fillStyle='#111'; c.beginPath(); c.arc(0,0,4,0,TAU); c.fill();
  hat(()=>{c.moveTo(0,0); c.lineTo(-4,60);},[60,40,24],.95,5,641,2,0);
  hat(()=>{c.moveTo(-4,60); c.bezierCurveTo(-30,110,30,140,0,190); c.bezierCurveTo(-14,210,10,226,4,240);},[50,34,20],.9,2.4,642,2,1);
});}
function elFeneri(o){Y(o,()=>{fener({x:0,y:0,s:1}); });}

// iki ya da daha çok taş: duvar dibinde düz bir taş (yemek bırakılan)
function duzTas(o){Y(o,()=>{
  tabanGolge(0,4,90,12,.8);
  sekil(()=>{c.moveTo(-84,0); c.bezierCurveTo(-90,-30,-60,-46,0,-46); c.bezierCurveTo(60,-46,90,-30,84,0); c.closePath();},[66,64,54],[-90,-46,90,0],{seed:651,aralik:6,isikRenk:R.ay});
});}

function cerciSandigi(o){sandik({...o,w:150,h:96,renk:[62,54,34],kilit:true}); Y(o,()=>{ // boyalı çerçi sandığı: üstünde soluk çiçek boyası
  for(let i=0;i<3;i++) hat(()=>{c.arc(-40+i*40,-50,9,0,TAU);},[110,70,50],.35,1.6,661+i,2,1);
  hat(()=>{c.moveTo(-70,-90); c.bezierCurveTo(-90,-120,-100,-160,-80,-190);},[60,44,26],.8,3,665,1,1); // kayış
});}

// kanıt nesneleri ayrı dosyada; burada yalnızca adlar kaydedilir
export const NESNE={
  minder:{ciz:minder}, sofra:{ciz:sofra}, kasik:{ciz:kasik}, kase:{ciz:kase}, tabak:{ciz:tabak}, ekmek:{ciz:ekmek},
  lamba:{ciz:lamba,canli:lambaCanli}, ocak:{ciz:ocak,canli:ocakCanli}, sandik:{ciz:sandik}, asmaKilit:{ciz:asmaKilit},
  anahtar:{ciz:anahtar}, kapi:{ciz:kapi}, kepenk:{ciz:kepenk}, ors:{ciz:ors}, nal:{ciz:nal,canli:nalCanli}, cekic:{ciz:cekic},
  korukOcak:{ciz:korukOcak,canli:ocakKorCanli}, suTeknesi:{ciz:suTeknesi}, cesme:{ciz:cesme,canli:cesmeCanli},
  gugum:{ciz:gugum,canli:(o,t,I)=>{if(o.tasan) gugumCanli(o,t,I);}}, dikisMakinesi:{ciz:dikisMakinesi}, gelinlik:{ciz:gelinlik},
  makas:{ciz:makas}, yunYumagi:{ciz:yunYumagi}, tasSeki:{ciz:tasSeki}, masrapa:{ciz:masrapa}, baston:{ciz:baston}, pabuc:{ciz:pabuc},
  sonmusAtes:{ciz:sonmusAtes}, kaput:{ciz:kaput}, bohca:{ciz:bohca}, fener:{ciz:fener,canli:fenerCanli}, ahirBolme:{ciz:ahirBolme},
  agilDuvar:{ciz:agilDuvar}, kaval:{ciz:kaval}, sutTasi:{ciz:sutTasi}, sal:{ciz:sal}, tabure:{ciz:tabure}, sedir:{ciz:sedir},
  otTorbasi:{ciz:otTorbasi}, masa:{ciz:masa}, defter:{ciz:defter}, mektup:{ciz:mektup}, muhur:{ciz:muhur}, tufekAskisi:{ciz:tufekAskisi},
  kasket:{ciz:kasket}, degirmenTasi:{ciz:degirmenTasi,canli:degirmenCanli}, ark:{ciz:ark,canli:arkCanli}, karatahta:{ciz:karatahta},
  pencere:{ciz:pencere}, fincan:{ciz:fincan,canli:buharCanli}, cezve:{ciz:cezve}, mangal:{ciz:mangal,canli:mangalCanli},
  tespih:{ciz:tespih}, yazma:{ciz:yazma}, cuval:{ciz:cuval}, rakiSisesi:{ciz:rakiSisesi}, kirbac:{ciz:kirbac}, elFeneri:{ciz:elFeneri},
  duzTas:{ciz:duzTas}, cerciSandigi:{ciz:cerciSandigi}
};
