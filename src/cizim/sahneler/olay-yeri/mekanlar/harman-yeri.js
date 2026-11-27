// Harman yeri: köyün kenarında dövülüp düzlenmiş yuvarlak toprak alan. Ortada döven (altı çakmak taşlı kızak), sağda
// büyük saman yığını ve ona dayalı ağaç yaba, önde taş silindir (yuvgu); harmanın çevresi taş dizili, ötesi anız.
// Uzakta yamaca kurulmuş toprak damlı evler. Tek ışık: kapalı gök (yukarıdan, biraz soldan ve arkadan; gölgeler yumuşak).
//
// Bu dosya ayrıca dış mekânların ortak yardımcılarını dışa verir (gök, sis, uzak sırtlar, köy, ağaç, kaya, kuru taş
// duvar, kır zemini, ot, çalı, prizma, yatık silindir). Ortaklaştırılmalı: mekan-yardim.js ya da ayrı bir dis-yardim.js.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,lerp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';

/* ═══════════════ Dış mekân ortak yardımcıları ═══════════════ */

export const GOK=[214,212,198];                 // ufka yakın gök: sis her şeyi bu renge çeker
// kapalı hava ışığı: yukarıdan, biraz soldan ve makinenin arkasından (ön yüzler okunur, gölge yumuşak ve kısa)
export const gokIsigi=(o={})=>({konum:[-1500,2600,-900], guc:.72, menzil:9000, ortam:.46, ...o});

// uzaklıkla göğe karışma (Z cm). yogun büyüdükçe hava daha berrak.
export function sisle(renk,Z,yogun=3000,gok=GOK,en=.93){
  const f=Math.min(en,1-Math.exp(-Math.max(0,Z-250)/yogun));
  return [lerp(renk[0],gok[0],f),lerp(renk[1],gok[1],f),lerp(renk[2],gok[2],f)];
}
export const karis=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];

// Kapalı gök: yukarıdan ufka açılan düz ışık, yayvan bulut kümeleri
export function gokCiz(P,r,{ust=[158,160,150],alt=GOK,bulut=1}={}){
  const u=P.ufuk, g=c.createLinearGradient(0,0,0,u+60);
  g.addColorStop(0,rgba(ust,1)); g.addColorStop(1,rgba(alt,1));
  c.fillStyle=g; c.fillRect(0,0,1000,750);
  for(let i=0;i<16*bulut;i++){
    const x=r()*1200-100, y=r()*u*.9, w=160+r()*320, h=12+r()*26;
    leke(x,y+h*.45,w,h,[132,134,126],.12+r()*.12);
    leke(x-w*.15,y-h*.15,w*.75,h*.6,[238,236,226],.16+r()*.14);
  }
  tara(0,0,1000,u+20,.03,10,[70,72,66],.05,(r()*1e5)|0,.8);
}

// Uzak sırt: Z uzaklığında, h yüksekliğinde dalgalı tepe hattı; vadisi sisle açılır. Yakın sırtlarda çalı noktaları ve teras.
export function sirt(P,{z,h,taban=0,renk=[120,118,100],yogun=3000,puruz=1,nokta=0,teras=0,tohum=1,sisAlt=.5,cizgi=.25}){
  const R=rng(tohum), zc=P.derinlik(0,taban,z), W=(620/P.odak)*zc;
  const f=[R()*TAU,R()*TAU,R()*TAU,R()*TAU];
  const yuk=x=>taban+h*(.55+.26*Math.sin(x/W*1.7+f[0])+.13*Math.sin(x/W*4.3+f[1])+.05*puruz*Math.sin(x/W*11+f[2])+.025*puruz*Math.sin(x/W*27+f[3]));
  const n=[]; for(let i=0;i<=160;i++){const x=-W+2*W*i/160; n.push(P.n(x,yuk(x),z));}
  const kr=sisle(renk,z,yogun), ust=Math.min(...n.map(q=>q[1])), alt=P.n(0,taban,z)[1];
  const yol=()=>{c.moveTo(n[0][0],770); n.forEach(q=>c.lineTo(q[0],q[1])); c.lineTo(n[n.length-1][0],770); c.closePath();};
  c.save(); c.beginPath(); yol(); c.fillStyle=rgba(kr,1); c.fill(); c.clip();
  for(let i=0;i<teras;i++){ // tepeyi saran eski taraçalar
    const d=h*(.12+i*.16+R()*.05), a=.12+R()*.1;
    c.strokeStyle=rgba(golgele(kr,.8),a); c.lineWidth=.8; c.beginPath();
    for(let j=0;j<=80;j++){const x=-W+2*W*j/80, s=P.n(x,yuk(x)-d*(1+.3*Math.sin(x/W*6+i)),z); if(j) c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);}
    c.stroke();
  }
  for(let i=0;i<nokta;i++){ // çalı ve ağaç benekleri
    const x=-W+2*W*R(), t=R(), y=lerp(yuk(x),taban,Math.pow(t,1.6)), s=P.n(x,y,z), o=P.olcek(x,y,z), rr=Math.max(.6,(70+R()*160)*o);
    c.fillStyle=rgba(sisle(golgele(renk,.5),z,yogun*.9),.5+R()*.4); c.beginPath(); c.ellipse(s[0],s[1],rr*1.3,rr*.8,0,0,TAU); c.fill();
  }
  const g=c.createLinearGradient(0,ust,0,alt+20); g.addColorStop(0,rgba(GOK,0)); g.addColorStop(.55,rgba(GOK,sisAlt*.35)); g.addColorStop(1,rgba(GOK,sisAlt));
  c.fillStyle=g; c.fillRect(0,ust,1000,770-ust);
  c.restore();
  if(cizgi){ c.strokeStyle=rgba(golgele(kr,.7),cizgi); c.lineWidth=1; c.beginPath(); n.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.stroke(); }
  return yuk;
}

// Uzak toprak damlı taş ev: ön ve yan yüz ışığa göre, düz dam (taşan toprak kenar), kapı, pencere, hatıl uçları, dam taşı.
export function ev(P,isik,{x:[x0,x1],z:[z0,z1],h,y=0},R,{renk=[184,174,150],yogun=3000}={}){
  const Z=(z0+z1)/2, S=k=>sisle(k,Z,yogun), koyu=S([44,40,34]), o=P.olcek(x0,y,z0);
  const yuz=(q,n,k=renk,a=1)=>cokgen3(P,q,S(golgele(k,aydinlik(isik,q[0],n)*a)));
  if(x0>0) yuz([[x0,y,z0],[x0,y,z1],[x0,y+h,z1],[x0,y+h,z0]],[-1,0,0],renk,.92);
  if(x1<0) yuz([[x1,y,z0],[x1,y,z1],[x1,y+h,z1],[x1,y+h,z0]],[1,0,0],renk,.92);
  yuz([[x0,y,z0],[x1,y,z0],[x1,y+h,z0],[x0,y+h,z0]],[0,0,-1]);
  // duvarda taş sıraları (yakınsa)
  if(o>.06) for(let yy=y+22;yy<y+h-12;yy+=18+R()*6){const a=P.n(x0,yy,z0), b=P.n(x1,yy,z0); c.strokeStyle=rgba(koyu,.12+R()*.08); c.lineWidth=.6; c.beginPath(); c.moveTo(a[0],a[1]+(R()-.5)); c.lineTo(b[0],b[1]+(R()-.5)); c.stroke();}
  // dam: toprak kenarı biraz taşar, üstü tümsekli
  const t=12, p=8, H=y+h;
  const damOn=[]; for(let i=0;i<=8;i++){const x=lerp(x0-p,x1+p,i/8); damOn.push([x,H+t+(i%8?R()*5:0),z0-p]);}
  cokgen3(P,[[x0-p,H,z0-p],[x1+p,H,z0-p],...damOn.slice().reverse()],S([92,84,70]));
  if(H+t<P.yukseklik) cokgen3(P,[...damOn,[x1+p,H+t,z1+p],[x0-p,H+t,z1+p]],S([150,142,122]));
  { const a=P.n(x0-p,H,z0-p), b=P.n(x1+p,H,z0-p); c.strokeStyle=rgba(koyu,.7); c.lineWidth=Math.max(.6,2.2*o*10); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
  for(let x=x0+25;x<x1-10;x+=34+R()*10){const s=P.n(x,H-4,z0); c.fillStyle=rgba(koyu,.8); c.fillRect(s[0]-.8,s[1]-.8,Math.max(1.2,6*o),Math.max(1.2,6*o));}
  // kapı ve pencere: kara boşluk, üstünde ağaç lento
  const w=x1-x0, kx=x0+w*(.2+R()*.5), kw=Math.min(95,w*.28);
  cokgen3(P,[[kx,y,z0],[kx+kw,y,z0],[kx+kw,y+175,z0],[kx,y+175,z0]],koyu);
  cokgen3(P,[[kx-10,y+175,z0],[kx+kw+10,y+175,z0],[kx+kw+10,y+188,z0],[kx-10,y+188,z0]],S([96,84,66]));
  for(let i=0;i<1+(R()*2|0);i++){const wx=x0+w*(.1+R()*.8); if(Math.abs(wx-kx-kw/2)<kw) continue; cokgen3(P,[[wx-18,y+h*.55,z0],[wx+18,y+h*.55,z0],[wx+18,y+h*.55+38,z0],[wx-18,y+h*.55+38,z0]],S([40,38,32]));}
  // çörten ve dam taşı (loğ)
  const ct=P.n(x1-20,H+4,z0-p); c.strokeStyle=rgba(koyu,.7); c.lineWidth=Math.max(.8,3*o*10); c.beginPath(); c.moveTo(ct[0],ct[1]); c.lineTo(ct[0]+Math.max(2,30*o),ct[1]+Math.max(.5,4*o)); c.stroke();
  if(R()<.5&&H+t<P.yukseklik+200){const lx=x0+w*(.3+R()*.4), a=P.n(lx-25,H+t,z0+30), b=P.n(lx+25,H+t+30,z0+30); c.fillStyle=rgba(S([120,116,104]),1); c.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);}
}

// Yamaca kurulmuş köy: evler uzaktan yakına çizilir, uzaktakiler daha yüksekte (yamaç)
export function koy(P,isik,R,{x:[a,b],z:[z0,z1],n=10,yamac=.25,yogun=3000,renk}={}){
  const evler=[];
  for(let i=0;i<n;i++){
    const z=z0+R()*(z1-z0), w=260+R()*360, x=a+R()*(b-a), d=220+R()*240, h=240+R()*90;
    evler.push({x:[x,x+w],z:[z,z+d],h,y:(z-z0)*yamac});
  }
  evler.sort((p,q)=>q.z[0]-p.z[0]);
  for(const e of evler){
    ev(P,isik,e,R,{renk,yogun});
    if(R()<.35) agac(P,isik,e.x[0]-80,e.z[0]+40,{tur:'citlembik',boy:420,en:380,y:e.y,yogun,tohum:(R()*1e5)|0});
  }
}

// Ağaç karaltısı: gövde, birkaç dal, yumrulu taç (üstü ışık alır). Ayrıntıya girmez.
// tur: 'fistik' (alçak, budaklı, yayvan), 'zeytin' (gri, kırık taç), 'citlembik' (yuvarlak, koyu), 'servi' (dar alev)
export function agac(P,isik,X,Z,{tur='fistik',boy=360,en=420,y=0,yogun=3000,tohum=1,golge=.35,yon=0}={}){
  const R=rng(tohum), s=P.n(X,y,Z), o=P.olcek(X,y,Z), S=k=>sisle(k,Z,yogun);
  const pt=(x,h)=>[s[0]+x*o,s[1]-h*o];
  const TAC={fistik:[86,90,70], zeytin:[128,132,114], citlembik:[66,70,58], servi:[48,54,44]}[tur]||[80,84,66];
  const GOV=S(tur==='zeytin'?[96,92,80]:[72,64,54]), tac=S(TAC), tacAcik=S(golgele(TAC,1.5)), tacKoyu=S(golgele(TAC,.55)), mur=S(MUREKKEP);
  // yere düşen yumuşak gölge (kapalı hava: tam altında)
  if(golge) duzlemde(P,[X,y,Z],DUZLEM.zemin,()=>{leke(0,0,en*.55,en*.42,[0,0,0],golge); leke(0,0,en*.25,en*.2,[0,0,0],golge*.8);});
  if(tur==='servi'){
    const n=[]; const m=26;
    for(let i=0;i<=m;i++){const t=i/m, w=en*.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05+.02)),.75)*(1-t*.25)*(.85+R()*.3); n.push(pt(w,boy*(.03+t*.97)));}
    for(let i=m;i>=0;i--){const t=i/m, w=en*.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05+.02)),.75)*(1-t*.25)*(.85+R()*.3); n.push(pt(-w,boy*(.03+t*.97)));}
    const yol=()=>{c.moveTo(n[0][0],n[0][1]); for(let i=1;i<n.length;i++) c.lineTo(n[i][0],n[i][1]); c.closePath();};
    c.beginPath(); yol(); c.fillStyle=rgba(tac,1); c.fill();
    c.save(); c.clip();
    const b=pt(0,boy*.5); leke(b[0]-en*.3*o,b[1]-boy*.1*o,en*.35*o,boy*.4*o,tacAcik,.45); leke(b[0]+en*.3*o,b[1]+boy*.2*o,en*.4*o,boy*.4*o,tacKoyu,.6);
    for(let i=0;i<40;i++){const a=pt((R()-.5)*en,boy*(.08+R()*.9)); c.strokeStyle=rgba(R()<.5?tacKoyu:tacAcik,.35); c.lineWidth=Math.max(.6,2.2*o*4); c.beginPath(); c.moveTo(a[0],a[1]); c.quadraticCurveTo(a[0]+3*o*10,a[1]-4*o*10,a[0]+(R()-.5)*8*o*10,a[1]-12*o*10); c.stroke();}
    c.restore();
    titrek(yol,mur,.35,Math.max(.6,1.2),(R()*1e5)|0,2,1.2);
    return;
  }
  // taç biçimi
  const tc={fistik:[.58,.5,.3], zeytin:[.6,.48,.34], citlembik:[.62,.48,.38]}[tur]||[.6,.5,.33];
  const cy=boy*tc[0], rx=en*tc[1], ry=boy*tc[2], ayr=tur==='fistik'?boy*.24:tur==='zeytin'?boy*.3:boy*.34;
  // gövde: kökte yayvan, budaklı; ayrıldığı yerden dallar
  const gw=(tur==='zeytin'?26:tur==='fistik'?22:18)*Math.max(1,boy/380), ky=(R()-.5)*gw*.8;
  const govde=()=>{const a=pt(-gw*1.3,0), b=pt(gw*1.3,0), u1=pt(-gw*.55+ky,ayr), u2=pt(gw*.55+ky,ayr), m1=pt(-gw*.8+ky*.3,ayr*.5), m2=pt(gw*.9+ky*.4,ayr*.5);
    c.moveTo(a[0],a[1]); c.quadraticCurveTo(m1[0],m1[1],u1[0],u1[1]); c.lineTo(u2[0],u2[1]); c.quadraticCurveTo(m2[0],m2[1],b[0],b[1]); c.closePath();};
  c.beginPath(); govde(); c.fillStyle=rgba(GOV,1); c.fill();
  c.save(); c.clip(); const gm=pt(-gw*.6,ayr*.5); leke(gm[0],gm[1],gw*.7*o,ayr*.6*o,S(golgele(GOV,1.6)),.5); for(let i=0;i<6;i++){const a=pt((R()-.5)*gw*1.6,R()*ayr); titrek(()=>{c.moveTo(a[0],a[1]); c.lineTo(a[0]+(R()-.5)*3*o*10,a[1]-ayr*.3*o);},mur,.4,1,(R()*1e5)|0,1,.6);} c.restore();
  titrek(govde,mur,.5,1.1,(R()*1e5)|0,2,1);
  const dallar=[], nd=tur==='fistik'?4:3;
  for(let i=0;i<nd;i++){const a=(i/(nd-1)-.5)*1.7+(R()-.5)*.3+yon, u=pt(ky+Math.sin(a)*rx*.75,cy+Math.cos(a)*ry*.5-ry*.1), b=pt(ky,ayr), m=pt(ky+Math.sin(a)*rx*.25+(R()-.5)*20,ayr+(cy-ayr)*.4);
    dallar.push([b,m,u,gw*(.75-Math.abs(a)*.15)]);}
  for(const [b,m,u,w] of dallar){
    for(let k=0;k<3;k++){c.strokeStyle=rgba(k?S(golgele(GOV,1.3)):GOV,k?.25:1); c.lineWidth=Math.max(.8,w*o*(k?.35:1)); c.lineCap='round'; c.beginPath(); c.moveTo(b[0]-(k?w*.2*o:0),b[1]); c.quadraticCurveTo(m[0]-(k?w*.2*o:0),m[1],u[0],u[1]); c.stroke();}
  }
  // taç: yumrular (üstten alta), her yumrunun üstü ışık alır, altı koyu
  const yum=[], ny=tur==='zeytin'?38:34;
  for(let i=0;i<ny;i++){const a=R()*TAU, d=Math.pow(R(),.5)*.82; yum.push({x:ky*.5+Math.cos(a)*rx*d, y:cy+Math.sin(a)*ry*d*.85+ry*.05, r:Math.min(rx,ry)*(.2+R()*.2)});}
  yum.sort((p,q)=>q.y-p.y);
  const sekil=m=>{const n=[]; for(let i=0;i<14;i++){const a=i/14*TAU, w=m.r*(.62+R()*.6); n.push(pt(m.x+Math.cos(a)*w*1.15,m.y+Math.sin(a)*w*.92));} return n;};
  const bicim=yum.map(sekil);
  const yolB=n=>{c.moveTo((n[0][0]+n[1][0])/2,(n[0][1]+n[1][1])/2); for(let i=1;i<=n.length;i++){const q=n[i%n.length], s2=n[(i+1)%n.length]; c.quadraticCurveTo(q[0],q[1],(q[0]+s2[0])/2,(q[1]+s2[1])/2);} c.closePath();};
  c.beginPath(); for(const n of bicim) yolB(n); c.fillStyle=rgba(tacKoyu,1); c.fill();
  for(const [i,n] of bicim.entries()){
    const m=yum[i], q=pt(m.x,m.y);
    c.save(); c.beginPath(); yolB(n); c.clip();
    c.fillStyle=rgba(tac,1); c.fill();
    const yk=1-(m.y-(cy-ry))/(2*ry); // tacın üstü daha çok ışık alır
    leke(q[0]-m.r*.25*o,q[1]-m.r*.45*o,m.r*.9*o,m.r*.6*o,tacAcik,.25+.35*yk);
    leke(q[0]+m.r*.1*o,q[1]+m.r*.65*o,m.r*1.1*o,m.r*.55*o,tacKoyu,.45+.3*(1-yk));
    c.restore();
  }
  // yaprak dokusu ve taç içine giren dallar (yakın ağaçlarda)
  if(o>.12){
    c.save(); c.beginPath(); for(const n of bicim) yolB(n); c.clip();
    for(let i=0;i<260;i++){const q=pt(ky*.5+(R()-.5)*rx*2,cy+(R()-.5)*ry*2), u=Math.max(.8,Math.min(3,6*o)); c.fillStyle=rgba(R()<.55?tacKoyu:tacAcik,.25+R()*.25); c.beginPath(); c.ellipse(q[0],q[1],u,u*.6,R()*3,0,TAU); c.fill();}
    c.restore();
  }
  // tacın alt yarısında, yaprak boşluklarından görünen koyu dal parçaları
  for(let i=0;i<6;i++){
    const a=(R()-.5)*2.2, b=pt(ky*.6+Math.sin(a)*rx*.2,cy-ry*.35), u=pt(ky*.5+Math.sin(a)*rx*(.5+R()*.35),cy+ry*(R()-.2)*.6);
    titrek(()=>{c.moveTo(b[0],b[1]); c.quadraticCurveTo((b[0]+u[0])/2,(b[1]+u[1])/2-6*o*10,u[0],u[1]);},S([40,36,30]),.55,Math.max(.8,4*o),(R()*1e5)|0,1,.5);
  }
  // tacın altı koyu (gök yukarıdan aydınlatır), kenarlar kırık mürekkeple belli belirsiz
  c.save(); c.beginPath(); for(const n of bicim) yolB(n); c.clip(); const ab=pt(ky*.5,cy-ry*.85); leke(ab[0],ab[1],rx*1.1*o,ry*.5*o,tacKoyu,.6); c.restore();
}

// Prizma: 2B profil (x sağ, y yukarı; cm) kalin kadar derinliğe çekilir, eğilir ve döndürülür. Mezar taşı, sınır taşı, kaya bloğu.
// egX: arkaya yatma, egZ: yana yatma, yaw: düşey eksende dönüş. Döner: ön yüz düzlemi {O, D} (duzlemde için) ve dunya(x,y,z).
export function prizma(P,isik,profil,kalin,{O,yaw=0,egX=0,egZ=0},renk,tohum,{cizgi=.6,yogun=0,doku=0}={}){
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cx=Math.cos(egX), sx=Math.sin(egX), cz=Math.cos(egZ), sz=Math.sin(egZ);
  const rot=([x,y,z])=>{const x1=x*cz-y*sz, y1=x*sz+y*cz, y2=y1*cx-z*sx, z2=y1*sx+z*cx; return [x1*cy+z2*sy,y2,-x1*sy+z2*cy];};
  const W=q=>{const v=rot(q); return [O[0]+v[0],O[1]+v[1],O[2]+v[2]];};
  const on=profil.map(([x,y])=>W([x,y,0])), ar=profil.map(([x,y])=>W([x,y,kalin]));
  const mrk=W([profil.reduce((s,q)=>s+q[0],0)/profil.length,profil.reduce((s,q)=>s+q[1],0)/profil.length,kalin/2]);
  const yuzler=[{q:on},{q:ar.slice().reverse()}];
  for(let i=0;i<profil.length;i++){const j=(i+1)%profil.length; yuzler.push({q:[on[i],on[j],ar[j],ar[i]],yan:true});}
  const goz=[0,P.yukseklik,0], gor=[];
  for(const y of yuzler){
    const q=y.q, m=q.reduce((s,p)=>[s[0]+p[0]/q.length,s[1]+p[1]/q.length,s[2]+p[2]/q.length],[0,0,0]);
    let n=[0,0,0]; for(let i=0;i<q.length;i++){const a=q[i], b=q[(i+1)%q.length]; n[0]+=(a[1]-b[1])*(a[2]+b[2]); n[1]+=(a[2]-b[2])*(a[0]+b[0]); n[2]+=(a[0]-b[0])*(a[1]+b[1]);}
    const l=Math.hypot(...n)||1; n=n.map(v=>v/l);
    if((m[0]-mrk[0])*n[0]+(m[1]-mrk[1])*n[1]+(m[2]-mrk[2])*n[2]<0) n=n.map(v=>-v);
    if(n[0]*(goz[0]-m[0])+n[1]*(goz[1]-m[1])+n[2]*(goz[2]-m[2])<=0) continue;
    gor.push({...y,m,n,d:P.derinlik(...m)});
  }
  gor.sort((a,b)=>b.d-a.d);
  for(const [i,y] of gor.entries()){
    let k=golgele(renk,aydinlik(isik,y.m,y.n)); if(yogun) k=sisle(k,y.m[2],yogun);
    c.beginPath(); yol3(P,y.q); c.fillStyle=rgba(k,1); c.fill(); c.strokeStyle=rgba(k,1); c.lineWidth=.5; c.stroke();
    if(doku){c.save(); c.clip(); const s=y.q.map(p=>P.n(...p)), xs=s.map(p=>p[0]), ys=s.map(p=>p[1]);
      for(let j=0;j<doku;j++){const t=rng(tohum*7+j+i*31), x=lerp(Math.min(...xs),Math.max(...xs),t()), yy=lerp(Math.min(...ys),Math.max(...ys),t()); leke(x,yy,4+t()*14,3+t()*8,t()<.6?[0,0,0]:golgele(renk,1.3),.08+t()*.12);}
      tara(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),y.yan?1.4:.5,4.5,MUREKKEP,y.n[1]>.5?.12:.22,tohum+i,.8); c.restore();}
    if(cizgi) hat3(P,y.q,yogun?sisle(MUREKKEP,y.m[2],yogun):MUREKKEP,cizgi,1.2,tohum+i,2,1.2,true);
  }
  const u=rot([1,0,0]), v=rot([0,-1,0]);
  return {O:W([0,0,0]), D:{u,v}, dunya:W, gorunen:gor};
}

// Yatık silindir (taş silindir, kütük, saman balyası): A'dan B'ye eksen, yarıçap rc
export function yatikSilindir(P,isik,A,B,rc,renk,tohum,{dilim=24,cizgi=.6,uc=null,doku=0}={}){
  const ax=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], L=Math.hypot(...ax), e=ax.map(v=>v/L);
  let u=[e[2],0,-e[0]]; const ul=Math.hypot(...u)||1; u=u.map(v=>v/ul);
  const w=[e[1]*u[2]-e[2]*u[1],e[2]*u[0]-e[0]*u[2],e[0]*u[1]-e[1]*u[0]];
  const halka=O=>Array.from({length:dilim},(_,i)=>{const a=i/dilim*TAU, cc=Math.cos(a), ss=Math.sin(a); return [O[0]+(u[0]*cc+w[0]*ss)*rc,O[1]+(u[1]*cc+w[1]*ss)*rc,O[2]+(u[2]*cc+w[2]*ss)*rc];});
  const h0=halka(A), h1=halka(B), goz=[0,P.yukseklik,0], par=[];
  for(let i=0;i<dilim;i++){const j=(i+1)%dilim, a=(i+.5)/dilim*TAU, n=[u[0]*Math.cos(a)+w[0]*Math.sin(a),u[1]*Math.cos(a)+w[1]*Math.sin(a),u[2]*Math.cos(a)+w[2]*Math.sin(a)];
    const m=[(h0[i][0]+h1[j][0])/2,(h0[i][1]+h1[j][1])/2,(h0[i][2]+h1[j][2])/2];
    if(n[0]*(goz[0]-m[0])+n[1]*(goz[1]-m[1])+n[2]*(goz[2]-m[2])<=0) continue;
    par.push({q:[h0[i],h0[j],h1[j],h1[i]],m,n,d:P.derinlik(...m)});}
  for(const [H,O,n] of [[h0,A,e.map(v=>-v)],[h1,B,e]]){const m=O; if(n[0]*(goz[0]-m[0])+n[1]*(goz[1]-m[1])+n[2]*(goz[2]-m[2])>0) par.push({q:H,m,n,d:P.derinlik(...m)-1,uc:true,O});}
  par.sort((a,b)=>b.d-a.d);
  for(const p of par){const k=golgele(renk,aydinlik(isik,p.m,p.n)*(p.uc?.95:1)); c.beginPath(); yol3(P,p.q); c.fillStyle=rgba(k,1); c.fill(); c.strokeStyle=rgba(k,1); c.lineWidth=.6; c.stroke();
    if(p.uc){ if(cizgi) hat3(P,p.q,MUREKKEP,cizgi,1.2,tohum,2,1.2,true); if(uc) uc(p); }}
  if(doku){const yan=par.filter(p=>!p.uc), r=rng(tohum*3+1), sk=yan.flatMap(p=>p.q.map(q=>P.n(...q))), xs=sk.map(q=>q[0]), ys=sk.map(q=>q[1]);
    c.save(); c.beginPath(); for(const p of yan) yol3(P,p.q); c.clip();
    const X0=Math.min(...xs), X1=Math.max(...xs), Y0=Math.min(...ys), Y1=Math.max(...ys);
    for(let i=0;i<doku;i++) leke(lerp(X0,X1,r()),lerp(Y0,Y1,r()),2+r()*8,1.5+r()*4,r()<.65?[0,0,0]:golgele(renk,1.3),.12+r()*.15);
    leke((X0+X1)/2,Y1,(X1-X0)*.6,(Y1-Y0)*.4,[0,0,0],.3); tara(X0,Y0,X1,Y1,.9,4,MUREKKEP,.14,tohum+7,.8); c.restore();}
  // dış hatlar: görünen yüzeyin iki uzun kenarı
  if(cizgi){const yan=par.filter(p=>!p.uc); if(yan.length){const ilk=yan.reduce((a,b)=>P.n(...a.q[0])[1]<P.n(...b.q[0])[1]?a:b); hat3(P,[ilk.q[0],ilk.q[3]],MUREKKEP,cizgi,1.2,tohum+3,2,1);}}
  return {h0,h1,u,w,e};
}

// Kaya: yumrulu çokyüzlü (yüzleri ışığa göre); kireçtaşı kırıkları, koyu dip, yere temas gölgesi
export function kaya(P,isik,X,Z,{en=120,boy=60,derin=90,renk=[178,172,152],y=0,tohum=1,yogun=0,nA=11,nK=4,puruz=1,cizgi=.55,catlak=3,duz=false,us=1}={}){
  const R=rng(tohum), f1=R()*TAU, f2=R()*TAU, rad=Array.from({length:nA},(_,i)=>duz?1+.1*Math.sin(2*i/nA*TAU+f1)+.06*Math.sin(3*i/nA*TAU+f2):1-.22*puruz+R()*.44*puruz), halkalar=[];
  const f0=R()*TAU;
  for(let k=0;k<=nK;k++){
    const f=k/nK*Math.PI/2*.9, cr=Math.cos(f), sr=Math.sin(f);
    halkalar.push(Array.from({length:nA},(_,i)=>{const a=f0+i/nA*TAU+(R()-.5)*.18*puruz, j=rad[i]*(1+(R()-.5)*.16*puruz);
      return [X+Math.cos(a)*en/2*Math.pow(cr,us)*j, y+(k?boy*sr*(1+(R()-.5)*.25*puruz):0), Z+Math.sin(a)*derin/2*Math.pow(cr,us)*j];}));
  }
  const tepe=[X+(R()-.5)*en*.1,y+boy*(1+R()*.05),Z+(R()-.5)*derin*.1], mrk=[X,y+boy*.35,Z], goz=[0,P.yukseklik,0];
  const yz=[];
  for(let k=0;k<nK;k++) for(let i=0;i<nA;i++){const j=(i+1)%nA; yz.push([halkalar[k][i],halkalar[k][j],halkalar[k+1][j],halkalar[k+1][i]]);}
  for(let i=0;i<nA;i++) yz.push([halkalar[nK][i],halkalar[nK][(i+1)%nA],tepe]);
  // temas gölgesi
  duzlemde(P,[X,y,Z],DUZLEM.zemin,()=>{leke(0,4,en*.62,derin*.6,[0,0,0],.45); leke(0,2,en*.5,derin*.45,[0,0,0],.35);});
  const gor=[];
  for(const q of yz){const m=q.reduce((a,p)=>[a[0]+p[0]/q.length,a[1]+p[1]/q.length,a[2]+p[2]/q.length],[0,0,0]);
    const a=[q[1][0]-q[0][0],q[1][1]-q[0][1],q[1][2]-q[0][2]], b=[q[q.length-1][0]-q[0][0],q[q.length-1][1]-q[0][1],q[q.length-1][2]-q[0][2]];
    let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; const l=Math.hypot(...n)||1; n=n.map(v=>v/l);
    if((m[0]-mrk[0])*n[0]+(m[1]-mrk[1])*n[1]+(m[2]-mrk[2])*n[2]<0) n=n.map(v=>-v);
    if(n[0]*(goz[0]-m[0])+n[1]*(goz[1]-m[1])+n[2]*(goz[2]-m[2])<=0) continue;
    gor.push({q,m,n,d:P.derinlik(...m)});}
  gor.sort((a,b)=>b.d-a.d);
  const sx=[], sy=[];
  for(const g of gor){let k=golgele(renk,aydinlik(isik,g.m,g.n)*(duz?1:.9+R()*.16)); if(yogun) k=sisle(k,Z,yogun); c.beginPath(); yol3(P,g.q); c.fillStyle=rgba(k,1); c.fill(); c.strokeStyle=rgba(k,1); c.lineWidth=.7; c.stroke(); for(const p of g.q){const e=P.n(...p); sx.push(e[0]); sy.push(e[1]);}}
  // dış hat ve kırıklar: görünen yüzlerin birleşimine kırpılır
  const o=P.olcek(X,y,Z), mur=yogun?sisle(MUREKKEP,Z,yogun):MUREKKEP;
  c.save(); c.beginPath(); for(const g of gor) yol3(P,g.q); c.clip('nonzero');
  const x0=Math.min(...sx), x1=Math.max(...sx), y0=Math.min(...sy), y1=Math.max(...sy);
  leke((x0+x1)/2,y1,(x1-x0)*.6,(y1-y0)*.35,[0,0,0],.35);
  if(!duz) tara(x0,y0,x1,y1,1.2,4,mur,.16,tohum+5,.8);
  for(let i=0;i<catlak;i++){let px=lerp(x0,x1,.2+R()*.6), py=lerp(y0,y1,R()*.4); titrek(()=>{c.moveTo(px,py); for(let k=0;k<5;k++){px+=(R()-.5)*14*o*3; py+=(4+R()*8)*o*3; c.lineTo(px,py);}},mur,.55,1,tohum+20+i,1,.6);}
  if(!duz) for(let i=0;i<12;i++) leke(lerp(x0,x1,R()),lerp(y0,y1,R()),(4+R()*12)*o*3,(2+R()*6)*o*3,R()<.6?[0,0,0]:golgele(renk,1.25),.1+R()*.1);
  c.restore();
  if(cizgi){ // görünen yüzlerin dış kenarları: en dıştakileri bul (kabaca: her yüzün kenarı yalnız bir görünen yüze aitse dış kenardır)
    const say=new Map(), key=(a,b)=>{const k1=a.join(','), k2=b.join(','); return k1<k2?k1+'|'+k2:k2+'|'+k1;};
    for(const g of gor) for(let i=0;i<g.q.length;i++){const a=g.q[i], b=g.q[(i+1)%g.q.length], k=key(a,b); say.set(k,(say.get(k)||{n:0,a,b})); say.get(k).n++;}
    for(const [,v] of say) if(v.n===1&&(v.a[1]>y+.5||v.b[1]>y+.5)) hat3(P,[v.a,v.b],mur,cizgi,1.2,tohum+(v.a[0]|0),1,.8);
    const a=P.n(X-en*.5,y,Z), b=P.n(X+en*.5,y,Z); c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=2; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();
  }
  return {tepe};
}

// Kuru taş duvar: zemindeki A=[x,z] noktasından B'ye, h yüksek, kalin kalın. Makineye bakan yüz taş örgü; üstü kapak taşları.
export function kuruDuvar(P,isik,A,B,{h=110,kalin=60,renk=[176,168,146],R,sira=17,yogun=0,ust=true,y=0}={}){
  const dx=B[0]-A[0], dz=B[1]-A[1], L=Math.hypot(dx,dz), u=[dx/L,0,dz/L], nrm=[-u[2],0,u[0]];
  const m=[(A[0]+B[0])/2,(A[1]+B[1])/2], yon=(nrm[0]*(0-m[0])+nrm[2]*(0-m[1]))>0?1:-1, nf=nrm.map(v=>v*yon);
  const on=[A[0]+nf[0]*kalin/2,y,A[1]+nf[2]*kalin/2], ar=[A[0]-nf[0]*kalin/2,y,A[1]-nf[2]*kalin/2];
  const D={u,v:[0,-1,0]}, rk=k=>yogun?sisle(k,m[1],yogun):k;
  const isik2=yogun?{...isik,ortam:isik.ortam}:isik;
  // dibine temas gölgesi
  const g0=P.n(on[0],y,on[2]), g1=P.n(on[0]+u[0]*L,y,on[2]+u[2]*L), ol=P.olcek(on[0],y,on[2]);
  c.strokeStyle='rgba(0,0,0,.32)'; c.lineWidth=Math.max(2,14*ol); c.beginPath(); c.moveTo(g0[0],g0[1]+2); c.lineTo(g1[0],g1[1]+2); c.stroke();
  // uç yüzler (görünüyorsa)
  for(const [P0,s] of [[A,-1],[B,1]]){
    const q=[[P0[0]+nf[0]*kalin/2,y,P0[1]+nf[2]*kalin/2],[P0[0]-nf[0]*kalin/2,y,P0[1]-nf[2]*kalin/2],[P0[0]-nf[0]*kalin/2,y+h,P0[1]-nf[2]*kalin/2],[P0[0]+nf[0]*kalin/2,y+h,P0[1]+nf[2]*kalin/2]];
    const n=u.map(v=>v*s), mm=[P0[0],y+h/2,P0[1]];
    if(n[0]*(0-mm[0])+n[1]*(P.yukseklik-mm[1])+n[2]*(0-mm[2])>0){cokgen3(P,q,rk(golgele(renk,aydinlik(isik,mm,n)*.9))); hat3(P,q,MUREKKEP,.5,1.1,(R()*1e5)|0,2,1,true);
      c.save(); c.beginPath(); yol3(P,q); c.clip(); const s0=P.n(...q[0]), s2=P.n(...q[2]); tara(Math.min(s0[0],s2[0])-5,s2[1],Math.max(s0[0],s2[0])+5,s0[1],.1,ol*sira*.9,MUREKKEP,.4,(R()*1e5)|0,1); c.restore();}
  }
  tasOrgu(P,isik2,on,D,[0,L,-h,0],rk(renk),R,{sira,harc:rk([60,58,50]),duzensiz:.7});
  if(yogun){c.save(); c.beginPath(); yol3(P,[on,[on[0]+u[0]*L,y,on[2]+u[2]*L],[on[0]+u[0]*L,y+h,on[2]+u[2]*L],[on[0],y+h,on[2]]]); c.clip(); c.fillStyle=rgba(GOK,Math.min(.8,1-Math.exp(-m[1]/yogun))*.6); c.fillRect(0,0,1000,750); c.restore();}
  // üst yüz ve kapak taşları
  if(ust&&y+h<P.yukseklik){
    const q=[[on[0],y+h,on[2]],[on[0]+u[0]*L,y+h,on[2]+u[2]*L],[ar[0]+u[0]*L,y+h,ar[2]+u[2]*L],[ar[0],y+h,ar[2]]];
    cokgen3(P,q,rk(golgele(renk,.55)));
  }
  const ns=Math.ceil(L/26);
  for(let i=0;i<ns;i++){
    const t=(i+R()*.4)/ns, X=on[0]-nf[0]*kalin*(.2+R()*.6)+u[0]*L*t, Z=on[2]-nf[2]*kalin*(.2+R()*.6)+u[2]*L*t, s=P.n(X,y+h,Z), o=P.olcek(X,y+h,Z);
    const w=(14+R()*12)*o, hh=(5+R()*8)*o, yol=()=>{c.moveTo(s[0]-w,s[1]+hh*.2); c.lineTo(s[0]-w*.8,s[1]-hh*(.5+R()*.4)); c.lineTo(s[0]+w*(R()-.5)*.6,s[1]-hh); c.lineTo(s[0]+w*.85,s[1]-hh*(.4+R()*.4)); c.lineTo(s[0]+w,s[1]+hh*.2); c.closePath();};
    c.beginPath(); yol(); c.fillStyle=rgba(rk(golgele(renk,.55+R()*.5)),1); c.fill();
    c.save(); c.clip(); leke(s[0]-w*.2,s[1]-hh*.6,w*.7,hh*.5,rk(golgele(renk,1.25)),.5); leke(s[0],s[1]+hh*.1,w,hh*.4,[0,0,0],.3); c.restore();
    titrek(yol,rk(MUREKKEP),.45,.9,(R()*1e5)|0,1,.6);
  }
  return {on,D,L,nf};
}

// Kır zemini: uzağa doğru sisle açılan toprak; lekeler, çakıl, kırık tarama. Büyük düzlem: her şey tam izdüşümle.
export function kirZemin(P,isik,{x:[x0,x1],z:[z0,z1],renk,R,yogun=3000,doku=1,cakil=80,y=0,tohum=1,acik=1}){
  const q=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]], a=aydinlik(isik,[0,y,600],[0,1,0])*acik;
  const s0=P.n(0,y,z0), s1=P.n(0,y,z1), g=c.createLinearGradient(0,s1[1],0,Math.min(760,s0[1]));
  g.addColorStop(0,rgba(sisle(golgele(renk,a),z1,yogun),1)); g.addColorStop(.25,rgba(sisle(golgele(renk,a),z0+(z1-z0)*.35,yogun),1)); g.addColorStop(1,rgba(golgele(renk,a*.94),1));
  c.beginPath(); yol3(P,q); c.fillStyle=g; c.fill();
  c.save(); c.clip();
  const ez=(X,Z)=>{const p=P.n(X,y,Z), p2=P.n(X,y,Z+20); return Math.max(.08,Math.min(.9,(p[1]-p2[1])/(20*P.olcek(X,y,Z))));};
  for(let i=0;i<90*doku;i++){const Z=z0+(z1-z0)*Math.pow(R(),1.7), X=x0+(x1-x0)*R(), p=P.n(X,y,Z), o=P.olcek(X,y,Z), rx=(30+R()*140)*o;
    leke(p[0],p[1],rx,rx*ez(X,Z),R()<.55?[0,0,0]:sisle(golgele(renk,1.35),Z,yogun),.06+R()*.12);}
  for(let i=0;i<cakil*doku;i++){const Z=z0+(z1-z0)*Math.pow(R(),2), X=x0+(x1-x0)*R(), p=P.n(X,y,Z), o=P.olcek(X,y,Z), rr=(1+R()*4.5)*o, e=ez(X,Z);
    if(p[1]>770||p[0]<-20||p[0]>1020) continue;
    leke(p[0]+rr*.2,p[1]+rr*e*.6,rr*1.4,rr*e*1.2+.5,[0,0,0],.4);
    c.fillStyle=rgba(sisle(golgele([190,184,166],.6+R()*.45),Z,yogun),1); c.beginPath(); c.ellipse(p[0],p[1]-rr*e*.3,rr,Math.max(.5,rr*(e+.25)),0,0,TAU); c.fill();}
  const ust=s1[1]-5, alt=Math.min(770,s0[1]+10);
  for(let i=0;i<600*doku;i++){const x=R()*1000, yy=ust+Math.pow(R(),.7)*(alt-ust), t=(yy-ust)/(alt-ust); c.fillStyle=R()<.5?`rgba(0,0,0,${.2+t*.2})`:rgba(golgele(renk,1.5),.2); c.fillRect(x,yy,.6+t*2*R(),.5+t*R());}
  tara(0,ust,1000,alt,.05,8,MUREKKEP,.09,tohum,1);
  c.restore();
}

// Kuru ot tutamı (yerde): ince sapların bir kısmı ışık alır
export function ot(P,X,Z,boy,R,{y=0,yogun=3000,renk=[170,160,124],kat=1}={}){
  const s=P.n(X,y,Z), o=P.olcek(X,y,Z), n=(6+R()*8)*kat|0;
  if(s[1]<-10||s[1]>790) return;
  leke(s[0],s[1],boy*.5*o,boy*.1*o,[0,0,0],.22);
  for(let i=0;i<n;i++){const a=-Math.PI/2+(R()-.5)*1.5, l=boy*(.45+R()*.6)*o, b=(R()-.5)*l*.45, x0=s[0]+(R()-.5)*boy*.25*o;
    c.strokeStyle=rgba(R()<.45?sisle([34,32,26],Z,yogun):sisle(renk,Z,yogun),.55+R()*.3); c.lineWidth=Math.max(.5,(.4+R()*.5)*o*1.3); c.lineCap='round';
    c.beginPath(); c.moveTo(x0,s[1]); c.quadraticCurveTo(x0+Math.cos(a)*l*.5+b,s[1]+Math.sin(a)*l*.5,x0+Math.cos(a)*l+b*1.4,s[1]+Math.sin(a)*l); c.stroke();}
}

// Dikenli çalı (geven, kuşburnu): yere çökmüş koyu kütle, dışarı taşan dikenli dal uçları
export function cali(P,isik,X,Z,{en=90,boy=60,y=0,yogun=3000,tohum=1,renk=[78,80,62]}={}){
  const R=rng(tohum), s=P.n(X,y,Z), o=P.olcek(X,y,Z), S=k=>sisle(k,Z,yogun), mur=S(MUREKKEP);
  duzlemde(P,[X,y,Z],DUZLEM.zemin,()=>leke(0,3,en*.65,en*.4,[0,0,0],.4));
  const n=[]; for(let i=0;i<=20;i++){const t=i/20*Math.PI, w=.8+R()*.35; n.push([s[0]-Math.cos(t)*en*.5*o*w,s[1]-Math.sin(t)*boy*o*w*(.75+.25*Math.sin(t))]);}
  const yol=()=>{c.moveTo(s[0]-en*.5*o,s[1]+2*o); n.forEach(q=>c.lineTo(q[0],q[1])); c.lineTo(s[0]+en*.5*o,s[1]+2*o); c.closePath();};
  c.beginPath(); yol(); c.fillStyle=rgba(S(golgele(renk,.75)),1); c.fill();
  c.save(); c.clip();
  leke(s[0]-en*.15*o,s[1]-boy*.75*o,en*.4*o,boy*.35*o,S(golgele(renk,1.6)),.55);
  leke(s[0],s[1],en*.6*o,boy*.35*o,[0,0,0],.5);
  for(let i=0;i<70;i++){const x=s[0]+(R()-.5)*en*o, yy=s[1]-R()*boy*o; c.fillStyle=rgba(R()<.5?S(golgele(renk,.4)):S(golgele(renk,1.5)),.5); c.fillRect(x,yy,Math.max(.8,2.5*o*3),Math.max(.6,1.6*o*3));}
  c.restore();
  for(let i=0;i<16;i++){const t=R()*Math.PI, b=[s[0]-Math.cos(t)*en*.35*o,s[1]-Math.sin(t)*boy*.6*o], l=(12+R()*22)*o, a=-t+Math.PI+(R()-.5)*.7;
    titrek(()=>{let px=b[0], py=b[1]; c.moveTo(px,py); for(let k=0;k<4;k++){px+=Math.cos(a+(k%2?.5:-.5))*l*.3; py-=Math.abs(Math.sin(a+(k%2?.5:-.5)))*l*.3; c.lineTo(px,py);}},mur,.6,.9,tohum+i,1,.5);}
  titrek(yol,mur,.3,1,tohum+99,1,.8);
}

/* ═══════════════ Harman yeri ═══════════════ */

const isik=gokIsigi();
const TARLA=[132,120,96], HARMAN=[184,174,148], SAMAN=[214,200,156], AHSAP=[136,118,90], TAS=[184,178,160];
const MERKEZ=[30,770], YARI=470;                                // harmanın merkezi (x,z) ve yarıçapı
const DOVEN={O:[-178,0,580], yaw:.32}, YUVGU={A:[196,22,420], B:[256,22,456]};
const YIGIN={x:330,z:1060,en:520,boy:290,derin:300};

// Saman yığını: yumuşak kubbe, yüzünde saman çöpleri; tepesi gökle buluşur
function samanYigini(P,R){
  const Y=YIGIN;
  kaya(P,isik,Y.x,Y.z,{en:Y.en,boy:Y.boy,derin:Y.derin,renk:SAMAN,tohum:61,nA:36,nK:10,puruz:.12,cizgi:0,catlak:0,duz:true,us:.85});
  // saman dokusu: yüzeye dağılmış kısa çöpler, ışıkta açık, gölgede koyu
  const s=P.n(Y.x,0,Y.z), o=P.olcek(Y.x,0,Y.z), w=Y.en*.5*o, h=Y.boy*o;
  c.save(); c.beginPath(); c.ellipse(s[0],s[1],w*1.02,h*1.03,0,Math.PI,TAU); c.lineTo(s[0]+w,s[1]+12); c.lineTo(s[0]-w,s[1]+12); c.closePath(); c.clip();
  // çöpler yamaç boyunca aşağı sarkar: yön, kubbenin o noktadaki eğimi
  for(let i=0;i<1400;i++){const a=Math.PI+R()*Math.PI, d=Math.sqrt(R()), x=s[0]+Math.cos(a)*w*d, y=s[1]+Math.sin(a)*h*d+R()*8, t=(y-(s[1]-h))/h, l=(3+R()*6)*o*3;
    const aa=Math.atan2(-Math.sin(a)*h,-Math.cos(a)*w*.35)+Math.PI+(R()-.5)*.9;
    c.strokeStyle=R()<.45?`rgba(60,50,30,${.1+t*.22})`:`rgba(246,236,200,${.22*(1-t)+.06})`; c.lineWidth=.5+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.abs(Math.sin(aa))*l); c.stroke();}
  leke(s[0]+w*.2,s[1]-h*.15,w*.8,h*.35,[0,0,0],.18);
  c.restore();
  // dibinde dökülmüş saman
  duzlemde(P,[Y.x,0,Y.z-Y.derin*.42],DUZLEM.zemin,()=>{for(let i=0;i<220;i++){const x=(R()-.5)*Y.en*1.1, y=R()*90-10, a=R()*TAU, l=5+R()*12; c.strokeStyle=`rgba(${R()<.6?'224,212,170':'60,52,36'},${.3+R()*.3})`; c.lineWidth=.8; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); c.stroke();}});
  // dış hatta dışarı taşan gevşek saman, dipte yere yayılan saçak
  for(let i=0;i<260;i++){const a=Math.PI+R()*Math.PI, x=s[0]+Math.cos(a)*w*.97, y=s[1]+Math.sin(a)*h*.97, l=(3+R()*9)*o*3, aa=a+(R()-.5)*1.4;
    c.strokeStyle=R()<.5?'rgba(70,60,40,.5)':'rgba(236,226,190,.6)'; c.lineWidth=.6+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.sin(aa)*l); c.stroke();}
  for(let i=0;i<160;i++){const x=s[0]+(R()-.5)*w*2.1, y=s[1]-R()*8*o*3, l=(4+R()*10)*o*3, aa=-Math.PI/2+(R()-.5)*2.6;
    c.strokeStyle=R()<.4?'rgba(60,50,34,.45)':'rgba(230,218,176,.55)'; c.lineWidth=.6+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(aa)*l,y+Math.sin(aa)*l*.5); c.stroke();}
}

// Döven: kalın tahta kızak, ön ucu yukarı kalkık; üstte tahta ekleri, önde çekme halkası
function doven(P){
  const pr=[[-82,0],[48,0],[66,5],[80,16],[90,32],[84,35],[73,23],[59,14],[46,11],[-82,11]];
  const D=prizma(P,isik,pr,66,{O:DOVEN.O,yaw:DOVEN.yaw},AHSAP,301,{cizgi:.7,doku:10});
  for(const z of[16,33,50]) hat3(P,[D.dunya([-82,11.2,z]),D.dunya([46,11.2,z]),D.dunya([59,14.2,z])],MUREKKEP,.55,1,310+z,2,.8);
  for(let i=0;i<10;i++){const p=D.dunya([-74+i*13,11.3,4+(i%3)*22]), s=P.n(...p); c.fillStyle='rgba(20,18,14,.7)'; c.fillRect(s[0]-1,s[1]-.6,2,1.2);} // çivi başları
  const h=P.n(...D.dunya([86,24,33])), o=P.olcek(...D.dunya([86,24,33]));
  titrek(()=>{c.ellipse(h[0]+5*o,h[1]+2*o,6*o,4*o,0,0,TAU);},[30,28,24],.8,1.4,320,2,.6);
  // altındaki çakmak taşlarından birkaçı kenardan görünür
  for(let i=0;i<9;i++){const p=D.dunya([-76+i*14,0,0]), s=P.n(...p); c.fillStyle='rgba(210,206,190,.7)'; c.fillRect(s[0]-1.2,s[1]-1,2.4,1.6);}
  return D;
}

export default {
  id:'harman-yeri',
  kamera:{odak:800, yukseklik:160, egim:.12},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-90,0,350], yuzey:'toprak', alan:14},
    'zemin-orta': {duzlem:'zemin', konum:[60,0,640], yuzey:'toprak', alan:12},
    'zemin-kose': {duzlem:'zemin', konum:[-360,0,760], yuzey:'toprak', alan:12},
    'doven-ustu': {duzlem:'ust', konum:[-196,11.5,586], yuzey:'tahta', alan:5, aci:DOVEN.yaw},
    'yuvgu-dibi': {duzlem:'zemin', konum:[150,0,372], yuzey:'toprak', alan:6},
    'saman-dibi': {duzlem:'zemin', konum:[236,0,800], yuzey:'toprak', alan:12},
    'beden':      {duzlem:'zemin', konum:[10,0,470], aci:-.18, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(9043);
    gokCiz(P,R);
    // uzak sırtlar ve yamaçtaki köy
    sirt(P,{z:18000,h:1500,renk:[150,150,136],yogun:6000,tohum:3,sisAlt:.6,cizgi:.15});
    sirt(P,{z:7000,h:760,taban:-60,renk:[128,124,104],yogun:6000,tohum:8,nokta:70,teras:4,sisAlt:.45});
    koy(P,isik,R,{x:[-4400,-300],z:[4600,6400],n:18,yamac:.3,yogun:6000});
    for(const [x,z,t] of [[1500,3400,4],[2100,3900,5],[-600,3300,6]]) agac(P,isik,x,z,{tur:'citlembik',boy:560,en:520,yogun:3000,tohum:t,golge:0});
    // anız ve harman
    kirZemin(P,isik,{x:[-3000,3000],z:[200,7000],renk:TARLA,R,yogun:4200,tohum:901,cakil:120});
    // anız: sıra sıra kısa sap dipleri (uzaklaştıkça incelir)
    for(let Z=1250;Z<2600;Z+=40+Z*.02){for(let X=-1600+R()*30;X<1600;X+=22+Z*.012+R()*30){if(Math.hypot(X-MERKEZ[0],(Z-MERKEZ[1])*1)<YARI+60) continue; const s=P.n(X+(R()-.5)*8,0,Z), o=P.olcek(X,0,Z); if(s[0]<-5||s[0]>1005) continue; c.strokeStyle=rgba(sisle([70,64,50],Z,4200),.25+R()*.25); c.lineWidth=Math.max(.5,1.2*o*2); c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+(R()-.5)*2,s[1]-Math.max(1,(6+R()*8)*o)); c.stroke();}}
    // harman: dövülüp düzlenmiş açık toprak; döven izinin halkaları
    const cember=(rr,t0=0,t1=TAU)=>{const n=[]; for(let i=0;i<=72;i++){const t=t0+(t1-t0)*i/72; n.push([MERKEZ[0]+Math.cos(t)*rr,0,MERKEZ[1]+Math.sin(t)*rr]);} return n;};
    c.save(); c.beginPath(); yol3(P,cember(YARI)); c.clip();
    const sm=P.n(MERKEZ[0],0,MERKEZ[1]), sn=P.n(MERKEZ[0],0,MERKEZ[1]+YARI), sa=P.n(MERKEZ[0],0,200);
    let g=c.createLinearGradient(0,sn[1],0,sa[1]); g.addColorStop(0,rgba(sisle(HARMAN,1100,4200),1)); g.addColorStop(1,rgba(golgele(HARMAN,.95),1)); c.fillStyle=g; c.fillRect(0,0,1000,750);
    for(let rr=40;rr<YARI;rr+=14+R()*22){const t0=R()*TAU; c.beginPath(); yol3(P,cember(rr+(R()-.5)*6,t0,t0+1.5+R()*3.5),false); c.strokeStyle=R()<.5?`rgba(60,54,40,${.06+R()*.08})`:`rgba(236,228,200,${.08+R()*.1})`; c.lineWidth=.8+R()*2.4; c.stroke();}
    // savrulmuş saman ve kavuz: açık, ince çöpler
    for(let i=0;i<700;i++){const a=R()*TAU, d=Math.sqrt(R())*YARI, X=MERKEZ[0]+Math.cos(a)*d, Z=MERKEZ[1]+Math.sin(a)*d, s=P.n(X,0,Z), o=P.olcek(X,0,Z), l=(2+R()*6)*o, aa=a+Math.PI/2+(R()-.5)*1.2;
      c.strokeStyle=`rgba(${R()<.7?'232,222,186':'50,44,32'},${.12+R()*.25})`; c.lineWidth=Math.max(.5,.9*o*2); c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(aa)*l,s[1]+Math.sin(aa)*l*.3); c.stroke();}
    leke(sm[0],sm[1]+20,500,50,[255,252,236],.12);
    tara(0,sn[1],1000,760,.02,5,MUREKKEP,.12,905,.8);
    c.restore();
    // harmanı çeviren taş dizisi (uzak yay ve yanlar)
    const tasT=[]; for(let i=0;i<130;i++){const t=-Math.PI*.5+.42+i/130*(TAU-.84)+(R()-.5)*.02; tasT.push(t);}
    tasT.sort((a,b)=>Math.sin(b)-Math.sin(a)); // uzaktan yakına
    for(const [i,t] of tasT.entries()){const X=MERKEZ[0]+Math.cos(t)*(YARI+8), Z=MERKEZ[1]+Math.sin(t)*(YARI+8); if(Z<250) continue;
      kaya(P,isik,X,Z,{en:22+R()*16,boy:9+R()*8,derin:18+R()*10,renk:TAS,tohum:400+i,nA:7,nK:2,cizgi:.35,catlak:0});}
    // saman yığını ve ona dayalı yaba
    samanYigini(P,R);
    const yb0=[150,0,850], yb1=[182,214,930];
    hat3(P,[yb0,yb1],[96,82,60],1,3.2,330,1,0); hat3(P,[yb0,yb1],MUREKKEP,.6,1,331,2,.6);
    for(let i=-2;i<=2;i++){const b=[yb1[0]+i*5,yb1[1]+2,yb1[2]+2], u=[yb1[0]+i*8,yb1[1]+38,yb1[2]+16]; hat3(P,[b,[b[0]+i*1.5,b[1]+20,b[2]+6],u],[80,68,50],.9,1.6,340+i,1,.3);}
    hat3(P,[[yb1[0]-12,yb1[1],yb1[2]],[yb1[0]+12,yb1[1],yb1[2]]],[70,60,44],.9,2.2,346,1,.3);
    // döven
    duzlemde(P,[DOVEN.O[0]+2,0,DOVEN.O[2]+30],DUZLEM.zemin,()=>{c.rotate(-DOVEN.yaw); leke(0,0,96,44,[0,0,0],.4);});
    doven(P);
    // yuvgu: taş silindir, uçlarında mil deliği
    duzlemde(P,[(YUVGU.A[0]+YUVGU.B[0])/2,0,(YUVGU.A[2]+YUVGU.B[2])/2],DUZLEM.zemin,()=>leke(0,0,50,26,[0,0,0],.55));
    yatikSilindir(P,isik,YUVGU.A,YUVGU.B,22,TAS,350,{doku:60,uc:p=>{const s=P.n(...p.O), o=P.olcek(...p.O); c.fillStyle='rgba(10,10,8,.85)'; c.beginPath(); c.ellipse(s[0],s[1],4*o,4.5*o,0,0,TAU); c.fill(); leke(s[0]-6*o,s[1]-6*o,10*o,8*o,[230,226,210],.25);}});
    // ön plan: harman kenarında kuru ot, birkaç taş
    const on=[]; for(let i=0;i<260;i++){const X=-700+R()*1400, Z=245+R()*300; if(Math.hypot(X-MERKEZ[0],Z-MERKEZ[1])<YARI+25) continue; on.push([X,Z]);}
    on.sort((a,b)=>b[1]-a[1]); for(const [X,Z] of on) ot(P,X,Z,8+R()*14,R,{yogun:4200,kat:.9});
    for(const [x,z,t] of [[-330,300,1],[360,290,2]]) kaya(P,isik,x,z,{en:34+t*8,boy:16+t*3,derin:26,renk:TAS,tohum:470+t,nA:8,nK:2,catlak:1});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.06,leke:.05});
    karanlik([[0,750,260,160,.3],[1000,750,260,160,.3]]);
  }
};
