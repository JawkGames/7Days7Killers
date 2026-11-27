// Meydandaki kalabalık: tohumla üretilir (aynı tohum, aynı kalabalık), her karede kol, meşale ve baş salınımıyla oynar.
// Figürler uzun giysilidir; ayaklar iki küçük, hareketsiz lekedir; el yalnızca kol ucunda küçük bir yumru, yüz en fazla iki leke.
// Siluet okunurluğu: omuz çizgisi, boyun, baş ve başlık (kasket, yemeni, poşu, külah) ayrı biçimler; giysi eteği (aba, entari,
// kepenek, şalta-şalvar) ayrı kesimler; yaş (kambur yaşlı, çocuk) ve boy çeşitlenir.
// Işık tek yandan: her figürde en yakın ışık kaynağının olduğu yanda, siluetin İÇİNDE kalan bir kenar parlaması.
// Bütün figürlere eşit dış hat verilmez (neon çıkartma gibi duruyordu).
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {TAU,rgba,clamp,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {KALABALIK,OFKE_ESYA,COSKU_DURUS,GIYSI,BASLIK,RENK} from './ayar.js';

const K=KALABALIK;
function sec(r,tablo){let x=r(),i=0; for(;i<tablo.length-1;i++){x-=tablo[i][1]; if(x<0) break;} return tablo[i][0];}
export const ARALIK=[.08,.92]; // kalabalığın meydandaki eni (u)
export const Z_EV=3.9, Z_KUYU=3.35; // karşı evlerin ve kuyunun derinliği
// pencerenin dibindeki büyük figürler karakolun basamaklarına çıkmıştır: başlarının tepesi bu y'de, eşik omuzlarını keser
const YAKIN_TEPE=600;

// dış resimde zemin noktası: u (0 sol, 1 sağ), z (1 ön sıra)
export function zemin(u,z){return [K.resim[0]/2+(u-.5)*K.yayilim/z, K.ufuk+(K.onY-K.ufuk)/z];}
const boyOf=k=>K.boy*k.boy/k.z;
const isikRengi=k=>k.grup==='o'?RENK.ofkeIsik:RENK.coskuIsik;

/* Döner: {kisiler (uzaktan yakına), isiklar, oran (0 hepsi coşkulu, 1 hepsi öfkeli), bol (iki grubun arası, u)} */
export function kalabalikKur(dogru,tohum){
  const r=rng((tohum|0)*7919+dogru*31+17);
  const oran=clamp((7-dogru)/6,0,1);
  const ofkeSolda=r()<.5;
  let bol=null;
  if(oran>0&&oran<1){
    const o=clamp(oran+(r()-.5)*2*K.oranOynama,.1,.9);
    bol=.5+((ofkeSolda?o:1-o)-.5)*.42; // ayrım çizgisi ortaya yakın kalır: telefonda da görünsün
  }
  const grupOf=u=>{ if(oran>=1) return 'o'; if(oran<=0) return 'c'; return (u<bol)===ofkeSolda?'o':'c'; };
  const kisiler=[];
  const ekle=(u,z,tur)=>{
    if(bol!=null&&Math.abs(u-bol)<K.bosluk/2*(tur==='yakin'?1.6:1)) return; // iki grubun arası boş kalır
    kisiler.push(kisiUret(r,u,z,grupOf(u),bol,dogru,tur));
  };
  const siraSay=K.sira[0]+Math.floor(r()*(K.sira[1]-K.sira[0]+1));
  const zSon=2.9, adim=Math.pow(zSon/1.0,1/(siraSay-1));
  for(let i=0;i<siraSay;i++){
    const z=Math.pow(adim,i)*(1+(r()-.5)*.03);
    const n=K.siraKisi[0]+Math.floor(r()*(K.siraKisi[1]-K.siraKisi[0]+1));
    const genis=ARALIK[1]-ARALIK[0];
    for(let j=0;j<n;j++){
      const u=ARALIK[0]+(j+.5+(i%2?.35:-.1)+(r()-.5)*.7)/n*genis;
      if(u>ARALIK[0]-.02&&u<ARALIK[1]+.02) ekle(u,z*(1+(r()-.5)*.04),'normal');
    }
  }
  // kenarlarda ve meydanın arka ucunda birkaç kişi: kalabalığa tam katılmamış, karanlıkta
  for(let i=0;i<3;i++){ekle(.02+r()*.08,1.3+r()*1.3,'normal'); ekle(.9+r()*.08,1.3+r()*1.3,'normal');}
  for(let i=0;i<4;i++) ekle(.15+r()*.7,3.0+r()*.3,'seyirci');
  // pencerenin dibinde birkaç büyük figür: omuzdan yukarısı görünür, pencere eşiği keser
  const yn=K.yakin[0]+Math.floor(r()*(K.yakin[1]-K.yakin[0]+1));
  for(let i=0;i<yn;i++) ekle(.24+(i+.5)/yn*.36+(r()-.5)*.06,.66+r()*.12,'yakin');
  kisiler.sort((a,b)=>b.z-a.z);
  const isiklar=kisiler.filter(k=>k.esya==='mesale'||k.esya==='fener');
  // ışık: arkadan (kenar parlaması) ve önden (yüz, göğüs); yön en güçlü yakın ışığın yanı. Konumlar sabit, bir kez hesaplanır.
  for(const k of kisiler){
    const [x]=zemin(k.u,k.z); let arka=0, on=0, sol=0, sag=0;
    for(const s of isiklar){
      const [sx]=zemin(s.u,s.z), dz=s.z-k.z, dx=Math.abs(sx-x), m=Math.max(0,1-dx/(130/Math.min(s.z,k.z)+30));
      if(s===k){on+=.4; sag+=.3*s.taraf; continue;}
      let g;
      if(dz>0) {g=m*Math.max(0,1-dz/1.1); arka+=g;}
      else {g=m*Math.max(0,1+dz/.6)*.6; on+=g;}
      if(sx<x) sol+=g; else sag+=g;
    }
    k.arka=clamp(arka,0,1); k.on=clamp(on,0,1); k.isikYon=sag>=sol?1:-1;
    if(k.tur==='yakin') k.arka=Math.max(k.arka,.55); // en öndekiler kalabalığın ışığına karşı durur
    if(k.z>2.3){k.arka*=.5; k.on*=.3;}
  }
  return {kisiler,isiklar,oran,bol,ofkeSolda};
}

function kisiUret(r,u,z,grup,bol,dogru,tur){
  const k={u,z,grup,tur,seyirci:tur==='seyirci',faz:r()*TAU,hiz:.8+r()*.6,boy:.92+r()*.16,giysi:GIYSI[Math.floor(r()*GIYSI.length)],
    baslik:BASLIK[Math.floor(r()*BASLIK.length)],renk:RENK.giysi[Math.floor(r()*RENK.giysi.length)],taraf:r()<.5?-1:1,egim:(r()-.5)*.05,
    tohum:Math.floor(r()*1e6),yas:'yetiskin',bakis:0};
  const y=r();
  if(tur!=='yakin'&&y<.13){k.yas='cocuk'; k.boy=.6+r()*.1; k.giysi=r()<.5?'entari':'salta'; if(k.baslik==='kulah') k.baslik='basAcik';}
  else if(y>.86){k.yas='yasli'; k.boy=.86+r()*.08; if(k.baslik==='basAcik') k.baslik='kasket';}
  if(k.baslik==='yemeni') k.giysi=r()<.6?'entari':'aba'; // başörtülü kadınlar
  if(tur==='yakin') k.boy=1+r()*.08;
  if(k.seyirci){k.durus='dur'; k.esya=null; return k;}
  if(grup==='o'){
    k.esya=sec(r,OFKE_ESYA);
    if(dogru===0&&k.esya==='yumruk'&&r()<.5) k.esya='mesale'; // en kötü sonda meşale artar
    if(k.yas==='cocuk') k.esya='yumruk';
    if(k.yas==='yasli'&&(k.esya==='tirpan'||k.esya==='dirgen')) k.esya='sopa';
    k.durus='kaldir';
  }else{
    k.durus=sec(r,COSKU_DURUS);
    if(k.yas!=='yetiskin'&&k.durus==='kasketAt') k.durus='tekKol';
    k.esya=k.durus.startsWith('fener')?'fener':null;
    if(k.durus==='kasketAt') k.baslik='basAcik';
  }
  if(k.yas==='yasli') k.degnek=true; // boştaki kolda değnek
  // gerginlik: iki grubun birbirine bakan kenarındakiler boşluğa doğru eğilir ve işaret eder (öfkeli) ya da geri çekilir,
  // elini siper eder (coşkulu); başlar karşı gruba döner
  if(bol!=null){
    const d=u-bol, yakin=1-clamp(Math.abs(d)/.13,0,1), yon=-Math.sign(d); // yon: boşluğa doğru
    k.egim+=(grup==='o'?1:-1)*yon*.1*yakin;
    k.bakis=yon*yakin;
    if(yakin>.35&&!k.seyirci){
      if(grup==='o'){k.durus='isaret'; k.taraf=yon; if(k.esya==='mesale'||k.esya==='tirpan') k.esya='yumruk';}
      else{k.durus='siper'; k.taraf=yon; k.esya=null;}
    }
  }
  return k;
}

/* ───────────── siluet parçaları (yerel: ayak noktası 0,0; yukarı eksi) ───────────── */
const GOVDE={aba:[.158,.14],entari:[.122,.118],kepenek:[.19,.11],salta:[.135,.1]}; // omuz, etek yarı eni: omuz hep etekten geniş (mezar taşı olmasın)
function olcu(k,h){
  const kambur=k.yas==='yasli', cocuk=k.yas==='cocuk';
  const oy=(kambur?-.76:-.8)*h, br=(cocuk?.078:.064)*h;
  const by=kambur?oy-br*.55:oy-.035*h-br;            // yaşlıda baş omuzların arasına gömülür
  return {sw:GOVDE[k.giysi][0]*h*(cocuk?.92:1), hw:GOVDE[k.giysi][1]*h, oy, br, by, kambur};
}
function govdeYolu(k,h,O){
  const {sw,hw,oy}=O, boyun=.045*h;
  c.moveTo(-boyun,oy-.03*h);
  if(O.kambur){ // kambur: omuzlar yuvarlak ve yüksek, gövde öne düşer
    c.quadraticCurveTo(-sw*.8,oy-.06*h,-sw,oy+.06*h);
  }else if(k.giysi==='kepenek'){ // keçe kepenek: köşeli, dik omuz, omuz uçları dışa taşar
    c.lineTo(-sw*.7,oy-.03*h); c.lineTo(-sw*1.05,oy+.02*h); c.lineTo(-sw,oy+.06*h);
  }else{
    c.quadraticCurveTo(-sw*.45,oy-.03*h,-sw*.82,oy+.0*h); c.quadraticCurveTo(-sw*1.02,oy+.01*h,-sw,oy+.07*h);
  }
  // sol yan, aşağı
  if(k.giysi==='entari'){c.quadraticCurveTo(-sw*1.02,-.6*h,-sw*.86,-.5*h); c.quadraticCurveTo(-hw*1.02,-.25*h,-hw,-.02*h);}
  else if(k.giysi==='kepenek'){c.lineTo(-sw*.95,-.36*h); c.lineTo(-hw*1.05,-.34*h); c.lineTo(-hw,-.02*h);}
  else if(k.giysi==='salta'){c.lineTo(-sw*1.02,-.5*h); c.lineTo(-sw*1.15,-.47*h); c.quadraticCurveTo(-sw*1.3,-.2*h,-hw,-.03*h);}
  else{c.quadraticCurveTo(-sw*.98,-.62*h,-sw*.8,-.47*h); c.quadraticCurveTo(-hw*.86,-.25*h,-hw,-.02*h);}
  c.quadraticCurveTo(0,.005*h,hw,-.02*h);
  // sağ yan, yukarı (aynalı)
  if(k.giysi==='entari'){c.quadraticCurveTo(hw*1.02,-.25*h,sw*.86,-.5*h); c.quadraticCurveTo(sw*1.02,-.6*h,sw,oy+.07*h);}
  else if(k.giysi==='kepenek'){c.lineTo(hw*1.05,-.34*h); c.lineTo(sw*.95,-.36*h); c.lineTo(sw,oy+.06*h);}
  else if(k.giysi==='salta'){c.quadraticCurveTo(sw*1.3,-.2*h,sw*1.15,-.47*h); c.lineTo(sw*1.02,-.5*h); c.lineTo(sw,oy+.07*h);}
  else{c.quadraticCurveTo(hw*.86,-.25*h,sw*.8,-.47*h); c.quadraticCurveTo(sw*.98,-.62*h,sw,oy+.07*h);}
  if(O.kambur) c.quadraticCurveTo(sw*.8,oy-.06*h,boyun,oy-.03*h);
  else if(k.giysi==='kepenek'){c.lineTo(sw*1.05,oy+.02*h); c.lineTo(sw*.7,oy-.03*h); c.lineTo(boyun,oy-.03*h);}
  else{c.quadraticCurveTo(sw*1.02,oy+.01*h,sw*.82,oy+.0*h); c.quadraticCurveTo(sw*.45,oy-.03*h,boyun,oy-.03*h);}
  c.closePath();
}
// baş ve başlık; T: başlığın yan çıkıntısının yönü (bakış yönü)
function basYolu(k,h,O,bx,by,T){
  const r=O.br, b=k.baslik;
  // boyun
  c.moveTo(bx-r*.42,by+r*.6); c.lineTo(bx-r*.5,O.oy-.02*h); c.lineTo(bx+r*.5,O.oy-.02*h); c.lineTo(bx+r*.42,by+r*.6); c.closePath();
  if(b==='yemeni'){ // başörtüsü başı sarar, omuzlara üçgen iner
    c.moveTo(bx-r*1.12,by+r*.2); c.quadraticCurveTo(bx-r*1.2,by-r*1.35,bx,by-r*1.4); c.quadraticCurveTo(bx+r*1.2,by-r*1.35,bx+r*1.12,by+r*.2);
    c.quadraticCurveTo(bx+r*1.5,by+r*1.6,bx+r*2.1,by+r*2.5); c.lineTo(bx,by+r*3.1); c.lineTo(bx-r*2.1,by+r*2.5); c.quadraticCurveTo(bx-r*1.5,by+r*1.6,bx-r*1.12,by+r*.2);
    c.closePath(); return;
  }
  c.moveTo(bx+r*.9,by); c.ellipse(bx,by,r*.88,r*1.04,0,0,TAU);
  if(b==='basAcik'){ // kulaklar
    c.moveTo(bx-r*.86,by); c.ellipse(bx-r*.9,by+r*.05,r*.18,r*.28,0,0,TAU); c.moveTo(bx+r*1.08,by); c.ellipse(bx+r*.9,by+r*.05,r*.18,r*.28,0,0,TAU);
  }else if(b==='kasket'){ // yassı tepe, bakış yönüne uzanan siper
    c.moveTo(bx+r*1.12,by-r*.55); c.ellipse(bx+T*r*.08,by-r*.58,r*1.12,r*.5,0,0,TAU);
    c.moveTo(bx,by-r*.48); c.quadraticCurveTo(bx+T*r*1.3,by-r*.5,bx+T*r*1.75,by-r*.22); c.lineTo(bx+T*r*1.6,by-r*.12); c.quadraticCurveTo(bx+T*r*1,by-r*.22,bx,by-r*.2); c.closePath();
  }else if(b==='pusu'){ // sarık gibi sarılmış poşu, yanda sarkan ucu
    c.moveTo(bx+r*1.25,by-r*.35); c.ellipse(bx,by-r*.4,r*1.25,r*.82,0,0,TAU);
    c.moveTo(bx-T*r*.9,by-r*.1); c.quadraticCurveTo(bx-T*r*1.5,by+r*1,bx-T*r*1.25,by+r*2.3); c.lineTo(bx-T*r*.85,by+r*2.2); c.quadraticCurveTo(bx-T*r*1.05,by+r*1,bx-T*r*.5,by+r*.1); c.closePath();
  }else if(b==='kulah'){ // keçe külah: uzun, ucu hafif eğik
    c.moveTo(bx-r*.95,by-r*.25); c.quadraticCurveTo(bx-r*.7,by-r*1.9,bx+T*r*.35,by-r*2.45); c.quadraticCurveTo(bx+r*.8,by-r*1.7,bx+r*.95,by-r*.25); c.closePath();
  }
}

// kol: omuzdan dirseğe, dirsekten bileğe. aci: 0 yukarı, pi aşağı; buk: dirsek kırımı
function kolNoktalari(ox,oy,aci,buk,h){
  const u1=.19*h, u2=.18*h;
  const ex=ox+Math.sin(aci)*u1, ey=oy-Math.cos(aci)*u1, a2=aci+buk;
  return {ox,oy,ex,ey,wx:ex+Math.sin(a2)*u2,wy:ey-Math.cos(a2)*u2,a:a2};
}
function kolYolu(K2){c.moveTo(K2.ox,K2.oy); c.lineTo(K2.ex,K2.ey); c.lineTo(K2.wx,K2.wy);}

function alev(x,y,boy,t,faz,sakin){
  const f=sakin?1+.08*Math.sin(t*5+faz):1+.22*Math.sin(t*13+faz)*Math.sin(t*4.1+faz*1.7);
  const sal=(sakin?.05:.18)*Math.sin(t*7.3+faz)*boy, b=boy*f;
  c.fillStyle=rgba(RENK.ofkeIsik,.9);
  c.beginPath(); c.moveTo(x-boy*.3,y); c.quadraticCurveTo(x-boy*.42,y-b*.45,x+sal,y-b); c.quadraticCurveTo(x+boy*.42,y-b*.45,x+boy*.3,y); c.closePath(); c.fill();
  c.fillStyle=rgba(RENK.ofkeAlev,.95);
  c.beginPath(); c.moveTo(x-boy*.15,y); c.quadraticCurveTo(x-boy*.2,y-b*.3,x+sal*.6,y-b*.6); c.quadraticCurveTo(x+boy*.2,y-b*.3,x+boy*.15,y); c.closePath(); c.fill();
}

// eşyanın sapı (çizgi) ve ağzı (dolgu); yol olarak kurulur ki kenar ışığı aynı yolu kullansın
function esyaCiz(k,w,h,sapKalin,renk){
  const dx=Math.sin(w.a), dy=-Math.cos(w.a), px=-dy, py=dx, yon=k.taraf;
  const sap=(alt,ust)=>{c.beginPath(); c.moveTo(w.wx-dx*alt,w.wy-dy*alt); c.lineTo(w.wx+dx*ust,w.wy+dy*ust); c.lineWidth=sapKalin; c.strokeStyle=renk; c.stroke(); return [w.wx+dx*ust,w.wy+dy*ust];};
  c.fillStyle=renk; c.lineCap='round';
  switch(k.esya){
    case 'mesale':{const [ux,uy]=sap(.06*h,.3*h); c.beginPath(); c.ellipse(ux,uy,.025*h,.04*h,w.a,0,TAU); c.fill(); k.alevNokta=[ux+dx*.02*h,uy+dy*.02*h]; break;}
    case 'tirpan':{const [ux,uy]=sap(.3*h,.68*h); // uzun sap, tepede geniş, aşağı kıvrılan ağız
      c.beginPath(); c.moveTo(ux,uy); c.quadraticCurveTo(ux+yon*.22*h,uy-.09*h,ux+yon*.46*h,uy+.1*h); c.quadraticCurveTo(ux+yon*.24*h,uy-.02*h,ux,uy+.035*h); c.closePath(); c.fill();
      k.agiz=[[ux,uy],[ux+yon*.22*h,uy-.09*h],[ux+yon*.46*h,uy+.1*h]]; break;}
    case 'dirgen':{const [ux,uy]=sap(.24*h,.62*h);
      c.beginPath(); c.moveTo(ux-px*.07*h,uy-py*.07*h); c.quadraticCurveTo(ux,uy+.012*h*dy,ux+px*.07*h,uy+py*.07*h);
      for(const o of[-.07,0,.07]){c.moveTo(ux+px*o*h,uy+py*o*h); c.quadraticCurveTo(ux+px*o*h*1.1+dx*.07*h,uy+py*o*h*1.1+dy*.07*h,ux+px*o*h*1.05+dx*.15*h,uy+py*o*h*1.05+dy*.15*h);}
      c.lineWidth=sapKalin*.9; c.strokeStyle=renk; c.stroke(); k.agiz=null; break;}
    case 'orak':{const [ux,uy]=sap(.03*h,.08*h); const cx=ux+dx*.08*h+px*yon*.03*h, cy=uy+dy*.08*h+py*yon*.03*h, rr=.085*h, a0=w.a-Math.PI*.5-yon*.2;
      c.beginPath(); c.arc(cx,cy,rr,a0-Math.PI*.95,a0+Math.PI*.15); c.arc(cx+dx*.02*h,cy+dy*.02*h,rr*.72,a0+Math.PI*.15,a0-Math.PI*.95,true); c.closePath(); c.fill();
      k.agiz=[[cx+Math.cos(a0-Math.PI*.95)*rr,cy+Math.sin(a0-Math.PI*.95)*rr],[cx+Math.cos(a0-Math.PI*.4)*rr,cy+Math.sin(a0-Math.PI*.4)*rr],[cx+Math.cos(a0+Math.PI*.15)*rr,cy+Math.sin(a0+Math.PI*.15)*rr]]; break;}
    case 'sopa': sap(.1*h,.44*h); break;
    case 'fener':{const sal=k.fenerSal||0, fx=w.wx+Math.sin(sal)*.06*h, fy=w.wy+Math.cos(sal)*.06*h;
      c.beginPath(); c.moveTo(w.wx,w.wy); c.lineTo(fx,fy); c.lineWidth=sapKalin*.6; c.strokeStyle=renk; c.stroke(); k.alevNokta=[fx,fy+.055*h]; break;}
  }
}
function fenerCiz(k,h){
  const [fx,fy]=k.alevNokta, y0=fy-.055*h;
  c.fillStyle='#0e0a06'; c.fillRect(fx-.034*h,y0,.068*h,.013*h); c.fillRect(fx-.032*h,y0+.092*h,.064*h,.015*h);
  const g=c.createRadialGradient(fx,fy,0,fx,fy,.045*h); g.addColorStop(0,rgba([255,240,190],1)); g.addColorStop(1,rgba(RENK.coskuIsik,.8));
  c.fillStyle=g; c.fillRect(fx-.028*h,y0+.013*h,.056*h,.079*h);
  c.strokeStyle='#0e0a06'; c.lineWidth=Math.max(.6,.008*h); c.beginPath(); c.moveTo(fx,y0+.013*h); c.lineTo(fx,y0+.092*h); c.stroke();
}
// havaya atılan kasket: el ile tepe noktası arasında gidip gelir (t'nin saf işlevi)
function kasketUcus(k,t,hareket,w,h){
  const p=hareket?((t*k.hiz/2.4+k.faz/TAU)%1):.3, ucus=.6;
  const y=p<ucus?Math.sin(p/ucus*Math.PI)*.7*h:0, don=p<ucus?p/ucus*TAU*1.5*k.taraf:0;
  return {x:w.wx+(p<ucus?Math.sin(p/ucus*Math.PI)*.08*h*k.taraf:0),y:w.wy-.04*h-y,don};
}
function kasketCiz(x,y,don,r,renk){
  c.save(); c.translate(x,y); c.rotate(don); c.fillStyle=renk;
  c.beginPath(); c.ellipse(0,0,r*1.15,r*.45,0,0,TAU); c.moveTo(r*.4,r*.1); c.quadraticCurveTo(r*1.3,0,r*1.7,r*.3); c.lineTo(r*.4,r*.35); c.closePath(); c.fill();
  c.restore();
}

/* Duruş: kollar (omuz-dirsek-bilek) ve hangi kolda eşya var. */
function kollarKur(k,t,hareket,h,O){
  const sw=O.sw, oy=O.oy+.02*h, T=k.taraf;
  const pump=hareket?Math.sin(t*2.6*k.hiz+k.faz):.4, dalga=hareket?Math.sin(t*1.25*k.hiz+k.faz):.4;
  const kollar=[];
  const omuz=yan=>yan*sw*.86;
  switch(k.durus){
    case 'kaldir':{const kaldir=k.esya==='yumruk'?-.15+pump*.25:.1+pump*.1; kollar.push({kn:kolNoktalari(omuz(T),oy,T*(.2+kaldir),-T*(.3+pump*.25),h),esya:true}); break;}
    case 'isaret':{ // karşı gruba doğru uzanmış kol, sallanır
      kollar.push({kn:kolNoktalari(omuz(T),oy,T*(1.35+pump*.12),-T*(.15+pump*.1),h),esya:true});
      if(!k.degnek) kollar.push({kn:kolNoktalari(omuz(-T),oy,-T*(.4+pump*.2),T*.6,h),esya:false,yumruk:true}); break;}
    case 'siper':{ // karşı gruptan korunur gibi kol önde, yarı kalkık
      kollar.push({kn:kolNoktalari(omuz(T),oy,T*(.85+dalga*.06),-T*.9,h),esya:false}); break;}
    case 'ikiKol': kollar.push({kn:kolNoktalari(omuz(1),oy,.45+dalga*.3,-.2,h)},{kn:kolNoktalari(omuz(-1),oy,-.45+dalga*.3,.2,h)}); break;
    case 'tekKol': kollar.push({kn:kolNoktalari(omuz(T),oy,T*(.35+dalga*.35),-T*.25,h)}); break;
    case 'kasketAt': kollar.push({kn:kolNoktalari(omuz(T),oy,T*(.12+dalga*.1),-T*.1,h),kasket:true}); break;
    case 'fenerYukari': kollar.push({kn:kolNoktalari(omuz(T),oy,T*(.12+dalga*.05),-T*.08,h),esya:true}); break;
    case 'fenerAlt': kollar.push({kn:kolNoktalari(omuz(T)*1.05,oy+.03*h,T*(Math.PI-.45),T*.3,h),esya:true}); break;
  }
  const dolu=new Set(kollar.map(o=>Math.sign(o.kn.ox)));
  for(const yan of[-1,1]) if(!dolu.has(yan)){
    if(k.degnek) kollar.push({kn:kolNoktalari(omuz(yan),oy+.02*h,yan*(Math.PI-.5),-yan*.15,h),degnek:true});
    else kollar.push({kn:kolNoktalari(omuz(yan)*1.04,oy+.03*h,yan*(Math.PI-.2),-yan*.1,h)}); // boştaki kol yanda, gövdeden hafif açık sarkar
  }
  return kollar;
}

// tek figür; (x,y) ayak noktası
function kisiCiz(k,t,hareket,kaynama){
  const h=boyOf(k), uzak=k.z>2.2, yakin=k.tur==='yakin', ph=k.faz, w=hareket?1:0;
  const x=zemin(k.u,k.z)[0], y=yakin?YAKIN_TEPE+h*.97:zemin(k.u,k.z)[1];
  const O=olcu(k,h);
  let bx=0, byo=0; k.bagir=0;
  if(k.grup==='o'&&!k.seyirci){const b=Math.max(0,Math.sin(t*2.6*k.hiz+ph)); k.bagir=hareket?b:.6; byo=b*.02*h*w; bx=b*.012*h*k.taraf*w;}
  else if(!k.seyirci) bx=Math.sin(t*1.1*k.hiz+ph)*.03*h*w;   // coşkuda baş yana sallanır
  bx+=k.bakis*.025*h;
  const T=k.bakis?Math.sign(k.bakis):k.taraf;
  c.save(); c.translate(x,y); c.rotate(k.egim);
  const kollar=kollarKur(k,t,hareket,h,O);
  k.fenerSal=hareket?Math.sin(t*1.6+ph)*.14:0;
  k.alevNokta=null; k.agiz=null;
  const kalin=Math.max(1.3,(k.giysi==='aba'?.062:.052)*h), sapKalin=Math.max(.9,.017*h);
  const golge=k.renk.map(v=>v*(uzak?.38:yakin?.42:.5)); // siluet zeminden ve havadaki parıltıdan koyu
  const govdeRenk=rgba(golge,1), kolRenk=rgba(golge.map(v=>v*.85),1);
  const sil=()=>{c.beginPath(); govdeYolu(k,h,O); basYolu(k,h,O,bx,O.by+byo,T);};
  // 1) eşya ve kollar (gövdenin arkasından çıkar)
  for(const o of kollar) if(o.esya&&k.esya&&k.esya!=='yumruk') esyaCiz(k,o.kn,h,sapKalin,'#070605');
  for(const o of kollar) if(o.degnek){c.strokeStyle='#070605'; c.lineWidth=sapKalin; c.beginPath(); c.moveTo(o.kn.wx,o.kn.wy-.03*h); c.lineTo(o.kn.wx+Math.sign(o.kn.ox)*.03*h,-.005*h); c.stroke();}
  c.strokeStyle=kolRenk; c.lineWidth=kalin; c.lineJoin='round'; c.lineCap='round';
  c.beginPath(); for(const o of kollar) kolYolu(o.kn); c.stroke();
  c.fillStyle=kolRenk;
  for(const o of kollar){const yum=(k.esya==='yumruk'&&o.esya)||o.yumruk; c.beginPath(); c.arc(o.kn.wx,o.kn.wy,kalin*(yum?.72:.5),0,TAU); c.fill();} // el yok: küçük bir yumru
  if(k.esya==='fener'&&k.alevNokta) fenerCiz(k,h);
  // ayaklar: iki küçük leke, hiç oynamaz
  if(!yakin){c.fillStyle='rgba(4,4,3,.95)'; c.beginPath(); c.ellipse(-.045*h,-.01*h,.038*h,.015*h,0,0,TAU); c.ellipse(.045*h,-.008*h,.038*h,.015*h,0,0,TAU); c.fill();}
  // 2) gövde ve baş
  sil(); c.fillStyle=govdeRenk; c.fill();
  // 3) ışık: yalnızca bir yanda, siluetin içinde kalan kenar parlaması (çıkartma gibi dış hat yok)
  const L=k.arka*(uzak?.55:1), renk=isikRengi(k), Y0=Math.min(O.by-O.br*2.4,-1.05*h);
  if(L>.04||(!uzak&&k.on>.05)){
    c.save(); sil(); c.clip();
    if(L>.04){
      const yan=k.isikYon, g=c.createLinearGradient(yan*O.sw*1.25,0,yan*O.sw*.05,0);
      g.addColorStop(0,rgba(renk,.75*L)); g.addColorStop(.45,rgba(renk,.2*L)); g.addColorStop(1,rgba(renk,0));
      c.strokeStyle=g; c.lineWidth=Math.max(1.6,.05*h); sil(); c.stroke();
    }
    if(!uzak){
      if(k.on>.05) leke(k.isikYon*.1*h,-.62*h,.15*h,.28*h,renk,(k.z<1.4?.32:.2)*k.on);
      leke(0,-.05*h,.3*h,.24*h,[0,0,0],.6); // etek karanlığa gömülür
    }
    c.restore();
  }
  if(!uzak){
    c.save(); sil(); c.clip();
    // ışığın öbür yanı taramayla gölgede
    if(k.z<1.5){const yan=-k.isikYon; tara(yan>0?0:-O.hw*1.4,Y0,yan>0?O.hw*1.4:0,0,.95,Math.max(2.2,.022*h),[3,3,2],.6,k.tohum,Math.max(.6,.006*h));}
    // kumaş: kuşak, kıvrımlar, aba yırtmacı
    const cizgi=rgba([4,3,3],.8), lw=Math.max(.7,.007*h);
    if(k.giysi==='entari'||k.giysi==='salta'){c.fillStyle='rgba(70,60,40,.24)'; c.fillRect(-h,-.52*h,2*h,.024*h);}
    if(k.z<1.6){
      titrek(()=>{for(const f of[-.35,.15,.55]){const fx=f*O.hw; c.moveTo(fx*.6,-.45*h); c.quadraticCurveTo(fx*.9,-.25*h,fx,-.04*h);} if(k.giysi==='aba'){c.moveTo(0,O.oy+.05*h); c.lineTo(.01*h,-.03*h);}},cizgi,.7,lw,k.tohum+kaynama,yakin?2:1,.004*h);
    }
    // yüz: ışık yüzü yalnızca bir leke olarak yakalar; öfkelide ikinci leke bağıran ağız
    if(k.on>.12&&k.baslik!=='yemeni'||k.on>.2){
      const r=O.br, fy=O.by+byo;
      leke(bx+k.isikYon*r*.2,fy+r*.2,r*.6,r*.78,RENK.kirliSari,.42*k.on);
      if(k.grup==='o'&&k.bagir>.3&&h>80) leke(bx,fy+r*.55,r*.22,r*.28*k.bagir,[6,4,3],.85);
    }
    c.restore();
    // mürekkep hattı: yalnızca gölge yanında ve yakındakilerde; ışık yanında hat yok
    if(k.z<1.5){
      c.save(); const yan=-k.isikYon; c.beginPath(); c.rect(yan>0?-O.sw*.2:-h,-2*h,h+O.sw*.2,2.2*h); c.clip();
      titrek(sil,[3,2,2],.85,Math.max(.8,.012*h),k.tohum+kaynama,2,.008*h); c.restore();
    }
  }
  // ön kolda ışık: kolun ışığa bakan kenarında ince bir çizgi
  if(L>.15&&!uzak){
    c.strokeStyle=rgba(renk,.45*L); c.lineWidth=Math.max(.7,kalin*.22);
    c.beginPath();
    for(const o of kollar){
      const kn=o.kn, seg=[[kn.ox,kn.oy,kn.ex,kn.ey],[kn.ex,kn.ey,kn.wx,kn.wy]];
      for(const [a,b,e,f] of seg){let nx=-(f-b), ny=e-a; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l; if(Math.sign(nx||1)!==k.isikYon){nx=-nx; ny=-ny;} const d=kalin*.36; c.moveTo(a+nx*d,b+ny*d); c.lineTo(e+nx*d,f+ny*d);}
    }
    c.stroke();
    // tırpan, orak ağzı ışığı yakalar
    if(k.agiz){c.strokeStyle=rgba([190,170,140],.5*(.4+L)); c.lineWidth=Math.max(.6,sapKalin*.5); c.beginPath(); c.moveTo(k.agiz[0][0],k.agiz[0][1]); c.quadraticCurveTo(k.agiz[1][0],k.agiz[1][1],k.agiz[2][0],k.agiz[2][1]); c.stroke();}
  }
  // havaya atılan kasket
  for(const o of kollar) if(o.kasket){const q=kasketUcus(k,t,hareket,o.kn,h); kasketCiz(q.x,q.y,q.don,O.br*1.05,'#0d0b08');}
  c.restore();
}

// havadaki parıltı: kendinden öndeki figürler buna karşı siluet kalır
function havaIsigi(s,carpan,t){
  if(!s.alevNokta) return;
  const [x,y]=zemin(s.u,s.z), h=boyOf(s), f=titre(t,s.faz,s.grup==='c');
  const ax=x+s.alevNokta[0], ay=y+s.alevNokta[1];
  c.globalCompositeOperation='lighter';
  leke(ax,ay+.3*h,1.1*h,.85*h,isikRengi(s),(s.esya==='mesale'?.26:.2)*f*carpan);
  c.globalCompositeOperation='source-over';
}

/* Bütün kalabalığı uzaktan yakına çizer. hareket=false ise son duruşta donar. */
export function kalabalikCiz(KL,t,hareket,kaynama,carpan){
  const bekleyen=[];
  for(const k of KL.kisiler){
    // bu figürden en az bir sıra arkadaki ışıkların parıltısı önce
    for(let i=bekleyen.length-1;i>=0;i--) if(bekleyen[i].z>k.z+.04){havaIsigi(bekleyen[i],carpan,t); bekleyen.splice(i,1);}
    kisiCiz(k,t,hareket,kaynama);
    if(k.alevNokta) bekleyen.push(k);
  }
  for(const s of bekleyen) havaIsigi(s,carpan,t);
}

// zemine düşen ışık: figürlerden önce çizilir
export function zeminIsigi(KL,t,carpan){
  c.globalCompositeOperation='lighter';
  for(const s of KL.isiklar){
    const [x,y]=zemin(s.u,s.z), sk=1/s.z, f=titre(t,s.faz,s.grup==='c');
    leke(x,y-4*sk,190*sk,52*sk,isikRengi(s),.3*f*carpan);
  }
  c.globalCompositeOperation='source-over';
}
// alevler ve küçük haleler: en üstte
export function alevler(KL,t,hareket,carpan){
  const tt=hareket?t:0;
  for(const s of KL.isiklar){
    if(!s.alevNokta) continue;
    const [x,y]=zemin(s.u,s.z), h=boyOf(s), f=titre(tt,s.faz,s.grup==='c');
    c.save(); c.translate(x,y); c.rotate(s.egim);
    const [ax,ay]=s.alevNokta;
    if(s.esya==='mesale'){
      // meşalenin is dumanı
      if(hareket) for(let i=0;i<3;i++){const p=((tt*.7+i/3+s.faz)%1); leke(ax+Math.sin(tt*2+i+s.faz)*.05*h+p*.08*h,ay-.2*h-p*.5*h,(.05+p*.12)*h,(.05+p*.1)*h,RENK.ofkeDuman,.35*(1-p));}
      alev(ax,ay,.2*h,tt,s.faz,false);
    }
    c.globalCompositeOperation='lighter';
    leke(ax,ay-.06*h,.28*h,.28*h,isikRengi(s),.28*f*carpan);
    leke(ax,ay-.04*h,.09*h,.09*h,s.grup==='o'?RENK.ofkeAlev:RENK.coskuAlev,.4*f*carpan);
    c.globalCompositeOperation='source-over';
    c.restore();
  }
}
export function titre(t,faz,sakin){
  return sakin?.93+.05*Math.sin(t*2.1+faz)+.02*Math.sin(t*5.3+faz*2)
              :.84+.1*Math.sin(t*11+faz)*Math.sin(t*4.3+faz*2)+.06*Math.sin(t*23+faz);
}
// kalabalık ışığının ortalama rengi ve gücü (odaya vuran ışık için)
export function ortalamaIsik(KL){
  let o=0,cc=0; for(const s of KL.isiklar){if(s.grup==='o') o++; else cc++;}
  const top=Math.max(1,o+cc), renk=[0,1,2].map(i=>lerp(RENK.odaCosku[i],RENK.odaOfke[i],o/top));
  return {renk,guc:clamp(top/12,.5,1),ofkePay:o/top};
}
