// Mekân şablonlarının ortak yapı taşları: perspektifli taş duvar, toprak zemin, kapı ışığı.
import {c} from '../../teknik/tuval.js';
import {leke,tara,titrek} from '../../teknik/firca.js';
import {rgba,clamp,TAU} from '../../../cekirdek/matematik.js';
import {tabana,aydinlik,golgele,cokgen3,yol3} from './kalem.js';

export const MUREKKEP=[8,7,10];

// Düzlem çerçevesinde çiz: O dünya noktası, D = DUZLEM.arka gibi; fn yerel cm ile çizer (y aşağı)
export function duzlemde(P,O,D,fn){
  const M=P.matris(O,D.u,D.v); c.save(); tabana(); c.transform(M[0],M[1],M[2],M[3],M[4],M[5]); fn(); c.restore();
}
// yerel düzlem noktasının dünya karşılığı
export const dunya=(O,D,x,y)=>[O[0]+D.u[0]*x+D.v[0]*y,O[1]+D.u[1]*x+D.v[1]*y,O[2]+D.u[2]*x+D.v[2]*y];
const normal=D=>{const u=D.u, v=D.v; const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; return n;};

// Düzlemdeki yerel noktaların tam izdüşümüyle yol (büyük yüzeylerde afin yaklaşım yetmez: eğik makinede dikeyler daralır)
export const duzlemNoktasi=(P,O,D,x,y)=>P.n(...dunya(O,D,x,y));
export function duzlemYol(P,O,D,noktalar,kapali=true){
  noktalar.forEach((q,i)=>{const s=duzlemNoktasi(P,O,D,q[0],q[1]); if(i) c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);});
  if(kapali) c.closePath();
}

// Moloz ya da kesme taş örgü: düzensiz sıralar, aralarda harç. Her taş ışığı kendi yerinde alır ve kendi yerinde
// (afin, küçük) dönüşümle çizilir; böylece yüksek duvarda da perspektif kaymaz.
// alan: [x0,x1,y0,y1] yerel cm (y aşağı: duvar için y=-yükseklik). renk: taşın ana rengi
export function tasOrgu(P,isik,O,D,[x0,x1,y0,y1],renk,r,{sira=22,harc=[14,14,12],is=0,duzensiz=0}={}){
  const n0=normal(D); // görünen yüz: makineye bakan yön
  const nn=(-O[0])*n0[0]+(P.yukseklik-O[1])*n0[1]+(-O[2])*n0[2]>0?n0:[-n0[0],-n0[1],-n0[2]];
  const kose=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  c.save(); tabana();
  c.beginPath(); duzlemYol(P,O,D,kose); c.clip();
  c.fillStyle=rgba(harc,1); c.fill();
  for(let y=y1;y>y0;){
    const h=sira*(.7+r()*.6);
    for(let x=x0-r()*20;x<x1;){
      const w=h*(1+r()*1.6), cx=x+w/2, cy=y-h/2, a=aydinlik(isik,dunya(O,D,cx,cy),nn)*(.75+r()*.4)*(1-is*clamp(1+cy/260,0,1)*.5);
      const kv=golgele(renk,a), M=P.matris(dunya(O,D,cx,cy),D.u,D.v);
      tabana(); c.transform(M[0],M[1],M[2],M[3],M[4],M[5]);
      // kırık köşeli taş (taş merkezine göre yerel)
      const j=()=>(r()-.5)*(3+duzensiz*h*.5), kk=()=>1+r()*h*(.32+duzensiz*.3), X0=-w/2, X1=w/2, Y0=h/2, Y1=-h/2;
      const p=[[X0+kk(),Y0+j()],[X1-kk(),Y0+j()],[X1+j(),Y0-kk()],[X1+j(),Y1+kk()],[X1-kk(),Y1+j()],[X0+kk(),Y1+j()],[X0+j(),Y1+kk()],[X0+j(),Y0-kk()]];
      c.beginPath(); p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath();
      c.fillStyle=rgba(kv,1); c.fill(); c.strokeStyle=rgba(harc,.9); c.lineWidth=1.1; c.stroke();
      c.save(); c.clip();
      leke(w*.1,h*.2,w*.5,h*.35,[0,0,0],.35);          // alt yanı gölgede
      if(a>.25) leke(-w*.2+r()*w*.3,-h*.1+h*.5-h*.5,w*.3,h*.25,golgele(renk,Math.min(1.5,a*1.6)),.18);
      c.restore();
      x+=w+1.5+r()*2.5;
    }
    y-=h+1.2+r()*1.5;
  }
  tabana();
  const sk=kose.map(q=>duzlemNoktasi(P,O,D,q[0],q[1])), xs=sk.map(q=>q[0]), ys=sk.map(q=>q[1]);
  tara(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),.5,6,MUREKKEP,.2,(r()*1e5)|0,1); // mürekkep tarama
  c.restore();
}

// Sıvalı duvar: düz yüzey, ışık lekesi, çatlaklar, sıvası dökülmüş yerlerde taş görünür
export function sivaDuvar(P,isik,O,D,[x0,x1,y0,y1],renk,r,{is=0}={}){
  const n0=normal(D), nn=(-O[0])*n0[0]+(P.yukseklik-O[1])*n0[1]+(-O[2])*n0[2]>0?n0:[-n0[0],-n0[1],-n0[2]];
  const kose=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]], sk=kose.map(q=>duzlemNoktasi(P,O,D,q[0],q[1]));
  c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kose); c.clip();
  c.fillStyle=rgba(golgele(renk,isik.ortam*1.6),1); c.fill();
  // ışık: duvarın her parçası kendi aydınlığını alır (ızgara)
  const adim=40;
  for(let x=x0;x<x1;x+=adim) for(let y=y0;y<y1;y+=adim){
    const w=dunya(O,D,x+adim/2,y+adim/2), a=aydinlik(isik,w,nn)*(1-is*clamp(1+(y+adim/2)/260,0,1)*.6), s=P.n(...w), o=P.olcek(...w);
    leke(s[0],s[1],adim*o*1.1,adim*o*1.1,golgele(renk,a*1.25),.55);
  }
  duzlemde(P,O,D,()=>{
    for(let i=0;i<10;i++){const x=x0+r()*(x1-x0), y=y0+r()*(y1-y0); leke(x,y,20+r()*60,20+r()*50,r()<.6?[0,0,0]:golgele(renk,1.2),.08+r()*.12);}
    for(let i=0;i<7;i++){let x=x0+r()*(x1-x0), y=y0+r()*(y1-y0); titrek(()=>{c.moveTo(x,y); for(let k=0;k<6;k++){x+=(r()-.5)*18; y+=4+r()*10; c.lineTo(x,y);}},MUREKKEP,.45,1.1,(r()*1e5)|0,1,.6);}
  });
  tara(Math.min(...sk.map(q=>q[0])),Math.min(...sk.map(q=>q[1])),Math.max(...sk.map(q=>q[0])),Math.max(...sk.map(q=>q[1])),.6,7,MUREKKEP,.18,(r()*1e5)|0,1);
  c.restore();
  // sıvası dökülmüş yamalar
  for(let i=0;i<3;i++){const cx=x0+40+r()*(x1-x0-80), cy=y0+40+r()*(y1-y0-120), w=26+r()*36, h=18+r()*26;
    const kenar=Array.from({length:11},(_,k)=>{const t=k/11*Math.PI*2, u=.6+r()*.45; return [cx+Math.cos(t)*w*u,cy+Math.sin(t)*h*u];});
    c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kenar); c.clip();
    tasOrgu(P,isik,O,D,[cx-w,cx+w,cy-h,cy+h],golgele(renk,.85),r,{sira:11,harc:[14,12,10]});
    c.restore(); tabana(); titrek(()=>duzlemYol(P,O,D,kenar),MUREKKEP,.5,1,(r()*1e5)|0,2,1);}
}

// Zemin dörtgeni [x0,x1] × [z0,z1]: taban rengi, ışığın düştüğü yer, toprak dokusu
export function zemin(P,isik,[x0,x1],[z0,z1],renk,r,{doku=1,tohum=1}={}){
  const q=[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]];
  cokgen3(P,q,golgele(renk,isik.ortam*2.2));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  // ışık zeminde: kaynağın izdüşümünden makineye doğru yayılır
  const L=P.n(isik.konum[0],0,isik.konum[2]-30), L2=P.n(isik.konum[0]*.8,0,isik.konum[2]-160);
  leke(L2[0],L2[1],300,120,golgele(renk,1.2),.45*isik.guc);
  leke(L[0],L[1],180,60,golgele(renk,1.5),.5*isik.guc);
  // toprak: lekeler, taneler, kırık tarama
  const ust=P.n(0,0,z1)[1]-10, alt=P.n(0,0,z0)[1]+10;
  for(let i=0;i<60*doku;i++){const x=r()*1000, y=ust+r()*(alt-ust), s=(y-ust)/(alt-ust); leke(x,y,(14+r()*60)*(.4+s),(5+r()*16)*(.4+s),r()<.5?[0,0,0]:golgele(renk,1.3),.08+r()*.12);}
  for(let i=0;i<500*doku;i++){const x=r()*1000, y=ust+r()*(alt-ust), s=(y-ust)/(alt-ust); c.fillStyle=r()<.5?'rgba(0,0,0,.35)':rgba(golgele(renk,1.6),.25); c.fillRect(x,y,.6+s*1.8*r(),.5+s*r());}
  for(let i=0;i<70*doku;i++){ // çakıl: altında gölge, üstünde ışık
    const X=x0+r()*(x1-x0), Z=z0+r()*(z1-z0), s=P.n(X,0,Z), o=P.olcek(X,0,Z), rr=(.6+r()*1.8)*o;
    leke(s[0]+rr*.3,s[1]+rr*.25,rr*1.3,rr*.6,[0,0,0],.4); c.fillStyle=rgba(golgele(renk,.45+r()*.35),1); c.beginPath(); c.ellipse(s[0],s[1],rr,rr*.55,0,0,Math.PI*2); c.fill();
  }
  for(let i=0;i<40*doku;i++){const X=x0+r()*(x1-x0), Z=z0+r()*(z1-z0), s=P.n(X,0,Z), o=P.olcek(X,0,Z), a=r()*Math.PI, u=(3+r()*6)*o; c.strokeStyle=rgba(golgele(renk,1.4),.25); c.lineWidth=.6; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(a)*u,s[1]+Math.sin(a)*u*.35); c.stroke();}
  tara(0,ust,1000,alt,.06,7,MUREKKEP,.22,tohum,1);
  tara(0,ust,1000,alt,-.2,13,MUREKKEP,.14,tohum+1,1);
  c.restore();
}

// Kapı ya da pencere boşluğu: dışarısı aşırı pozlanmış (bembeyaz, ayrıntısız) aydınlık
export function aydinlikBosluk(P,noktalar,r){
  const s=noktalar.map(q=>P.n(...q)), mx=s.reduce((a,q)=>a+q[0],0)/s.length, my=s.reduce((a,q)=>a+q[1],0)/s.length;
  c.beginPath(); s.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath();
  c.fillStyle='rgb(236,232,214)'; c.fill();
  c.save(); c.clip(); leke(mx,my+40,120,140,[255,255,250],.6); leke(mx,s[0][1],90,30,[150,150,130],.25); c.restore();
  // ışık taşması: boşluğun çevresi parlar (halation)
  leke(mx,my,150,170,[230,226,200],.28);
}

// Bütün kareye mürekkep tarama ve çamurlu lekeler: sahneyi çizim diline bağlar (izlerin üstüne de biner)
export function atmosfer(r,{tarama=.12,leke:lk=.12}={}){
  for(let i=0;i<14;i++) leke(r()*1000,r()*750,60+r()*220,40+r()*160,[[0,0,0],[40,52,40],[60,46,66]][i%3],lk*(.5+r()),r()*3);
  tara(0,0,1000,750,.42,9,MUREKKEP,tarama,(r()*1e5)|0,1);
  tara(0,0,1000,750,-1.1,14,MUREKKEP,tarama*.7,(r()*1e5)|0,1);
}

// Köşe ve kenarlarda karanlık (tek ışık kaynağından uzaklık)
export function karanlik(alanlar){for(const a of alanlar) leke(a[0],a[1],a[2],a[3],[0,0,0],a[4],a[5]||0);}

/* ─── genel düzlem ve hat araçları (iç ve dış mekân) ─── */

// Düzlemin makineye bakan normali
export function yuzNormal(P,O,D){
  const u=D.u, v=D.v, n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  return (-O[0])*n[0]+(P.yukseklik-O[1])*n[1]+(-O[2])*n[2]>0?n:[-n[0],-n[1],-n[2]];
}
// Düzlemde yerel kırık çizgi (her nokta tam izdüşümle)
export function duzlemCizgi(P,O,D,noktalar){
  noktalar.forEach((q,i)=>{const s=duzlemNoktasi(P,O,D,q[0],q[1]); if(i) c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);});
}
// Dünya noktaları arasında kopuk kopuk açık kenar çizgisi (aşınmış kenar ışığı)
export function kenarIsigi(P,a,b,r,{renk=[220,212,186],alfa=.4,kalin=1.2,parca=9}={}){
  for(let i=0;i<parca;i++){
    if(r()<.22) continue;
    const t0=i/parca+r()*.02, t1=(i+1)/parca-r()*.04, l=(t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
    const s0=P.n(...l(t0)), s1=P.n(...l(t1));
    c.strokeStyle=rgba(renk,alfa*(.5+r()*.5)); c.lineWidth=kalin*(.6+r()*.6); c.lineCap='round';
    c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();
  }
}

// Yatay daire (dünya noktaları)
export const daire3=(X,Y,Z,rx,rz=rx,n=32)=>Array.from({length:n},(_,i)=>{const a=i/n*TAU; return [X+Math.cos(a)*rx,Y,Z+Math.sin(a)*rz];});

export {titrek,tara,leke};
