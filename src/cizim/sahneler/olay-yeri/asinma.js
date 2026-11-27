// Aşınmış cisim: profili kalınlık boyunca çekilmiş (prizma) ama kenarları yuvarlanmış, yüzleri hafif şişkin ve
// düzensiz bir gövde. Taş yalak, mezar sandukası, şırahane taşı, kaya, döşek gibi "kutu ya da kristal gibi" duran
// şeyler için. Her küçük yüz ışığı kendi yerinde alır; böylece yuvarlak kenar yumuşak bir geçiş olarak okunur.
// Mürekkep yalnızca dış hatta (silüet) ve birkaç kırıkta; yüzde leke, yosun, gözenek ve gölge yanında tarama.
import {c} from '../../teknik/tuval.js';
import {rgba,lerp,clamp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {hat3,yol3,golgele,aydinlik,cokgen3} from './kalem.js';
import {leke,tara,titrek,MUREKKEP} from './mekan-yardim.js';

// profil köşelerini yuvarla (yerde duran köşeler, y≈0, gömülü sayılır: keskin kalır)
function yuvarlakProfil(profil,yr,adim){
  const n=profil.length, cik=[];
  for(let i=0;i<n;i++){
    const a=profil[(i+n-1)%n], b=profil[i], d=profil[(i+1)%n];
    if(b[1]<=.5||yr<=0){cik.push([b[0],b[1]]); continue;}
    const la=Math.hypot(a[0]-b[0],a[1]-b[1])||1, ld=Math.hypot(d[0]-b[0],d[1]-b[1])||1;
    const r1=Math.min(yr,la*.45), r2=Math.min(yr,ld*.45);
    const p0=[b[0]+(a[0]-b[0])/la*r1,b[1]+(a[1]-b[1])/la*r1], p1=[b[0]+(d[0]-b[0])/ld*r2,b[1]+(d[1]-b[1])/ld*r2];
    for(let k=0;k<=adim;k++){const t=k/adim, u=1-t; cik.push([u*u*p0[0]+2*u*t*b[0]+t*t*p1[0],u*u*p0[1]+2*u*t*b[1]+t*t*p1[1]]);}
  }
  return cik;
}
// çokgeni içe doğru b kadar kaydır (açıortay boyunca); yerdeki noktalar yerde kalır
function iceKaydir(pr,b){
  const n=pr.length; let alan=0;
  for(let i=0;i<n;i++){const p=pr[i], q=pr[(i+1)%n]; alan+=p[0]*q[1]-q[0]*p[1];}
  const s=alan>0?1:-1;
  return pr.map((p,i)=>{
    const a=pr[(i+n-1)%n], d=pr[(i+1)%n];
    const e1=[p[0]-a[0],p[1]-a[1]], e2=[d[0]-p[0],d[1]-p[1]], l1=Math.hypot(...e1)||1, l2=Math.hypot(...e2)||1;
    const n1=[-e1[1]/l1*s,e1[0]/l1*s], n2=[-e2[1]/l2*s,e2[0]/l2*s];
    let m=[n1[0]+n2[0],n1[1]+n2[1]]; const lm=Math.hypot(...m)||1; m=[m[0]/lm,m[1]/lm];
    const k=Math.min(2.2,1/Math.max(.35,m[0]*n1[0]+m[1]*n1[1]))*b;
    return [p[0]+m[0]*k,p[1]<=.5?p[1]:Math.max(0,p[1]+m[1]*k)];
  });
}

// Görünen yüzlere doku: leke, yosun (üst ve dip), gözenek, gölge yanında tarama, kırık. gor: [{q,m,n}], kutu: ekran sınırı
export function yuzDokusu(P,isik,gor,renk,R,{doku='tas',yosun=.5,catlak=2,mur=MUREKKEP,olcek=1}={}){
  const sx=[], sy=[];
  for(const g of gor) for(const p of g.q){const e=P.n(...p); sx.push(e[0]); sy.push(e[1]);}
  if(!sx.length) return;
  const x0=Math.min(...sx), x1=Math.max(...sx), y0=Math.min(...sy), y1=Math.max(...sy), W=x1-x0, H=y1-y0, o=olcek;
  c.save(); c.beginPath(); for(const g of gor) yol3(P,g.q); c.clip('nonzero');
  // dipte toprak/nem kararması, üstte ışık
  leke((x0+x1)/2,y1,W*.62,H*.32,[0,0,0],.38);
  if(doku==='kumas'){
    // kumaş: yumuşak kırışık gölgeleri, ince dokuma çizgisi
    for(let i=0;i<10;i++) leke(lerp(x0,x1,R()),lerp(y0,y1,R()),W*(.05+R()*.12),H*(.04+R()*.1),R()<.6?[0,0,0]:golgele(renk,1.25),.08+R()*.1,(R()-.5)*.6);
    tara(x0,y0,x1,y1,.15,2.6,mur,.08,(R()*1e5)|0,.6);
  }else{
    const n=Math.max(8,Math.min(60,W*H/900));
    for(let i=0;i<n;i++) leke(lerp(x0,x1,R()),lerp(y0,y1,R()),(2+R()*6)*o*1.5,(1.5+R()*4)*o*1.5,R()<.62?[0,0,0]:golgele(renk,1.3),.06+R()*.1);
    // yosun ve liken: üst yüzlerde ve dipte kümelenir; koyu, biraz yeşilimsi (baskıda yalnız koyuluk)
    if(yosun>0) for(const g of gor){
      const ust=g.n[1]>.45, dip=g.m[1]<6;
      if(!ust&&!dip) continue;
      const e=g.q.map(p=>P.n(...p)), ex=e.reduce((a,q)=>a+q[0],0)/e.length, ey=e.reduce((a,q)=>a+q[1],0)/e.length;
      if(R()<yosun*.35) leke(ex+(R()-.5)*8*o,ey+(R()-.5)*4*o,(2+R()*5)*o*1.5,(1.5+R()*2.5)*o*1.5,[34,40,26],.14+R()*.14*yosun);
    }
    if(yosun>0) for(let i=0;i<Math.round(14*yosun);i++){const x=lerp(x0,x1,R()), y=lerp(y0,y1,R()); leke(x,y,(1.5+R()*3)*o*2,(1+R()*2)*o*2,R()<.5?[214,210,190]:[40,44,30],.22);} // liken benekleri
    // gözenek: ince noktalar
    for(let i=0;i<W*H/60;i++){c.fillStyle=R()<.65?`rgba(0,0,0,${.12+R()*.25})`:`rgba(230,224,200,${.06+R()*.12})`; c.fillRect(lerp(x0,x1,R()),lerp(y0,y1,R()),.5+R()*1.2,.5+R()*.9);}
  }
  // gölge yanı: ışıktan uzak yüzlerde tarama (yalnız onların üstünde)
  const kara=gor.filter(g=>aydinlik(isik,g.m,g.n)<isik.ortam+.18);
  if(kara.length){c.save(); c.beginPath(); for(const g of kara) yol3(P,g.q); c.clip('nonzero'); tara(x0,y0,x1,y1,1.15,3.6,mur,.22,(R()*1e5)|0,.75); c.restore();}
  tara(x0,y0,x1,y1,.5,5.5,mur,.08,(R()*1e5)|0,.7);
  if(doku!=='kumas') for(let i=0;i<catlak;i++){let px=lerp(x0,x1,.15+R()*.7), py=lerp(y0,y1,R()*.5); titrek(()=>{c.moveTo(px,py); for(let k=0;k<5;k++){px+=(R()-.5)*7*o*2; py+=(2+R()*5)*o*2; c.lineTo(px,py);}},mur,.45,.9,(R()*1e5)|0,1,.5);}
  c.restore();
  return [x0,y0,x1,y1];
}

// Kenar ışığı: ışığa bakan üst yuvarlak kenar boyunca kopuk açık çizgi (aşınmış, parlamış taş)
function kenarParlat(P,isik,kenarlar,renk,R,alfa=.35){
  for(const [a,b,n] of kenarlar){
    if(R()<.3) continue;
    const l=aydinlik(isik,a,n); if(l<.55) continue;
    const s0=P.n(...a), s1=P.n(...b);
    c.strokeStyle=rgba(golgele(renk,Math.min(1.7,l*1.6)),alfa*(.5+R()*.5)); c.lineWidth=.7+R()*.8; c.lineCap='round';
    c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();
  }
}

// Profil (x sağa, y yukarı; yerel) kalınlık boyunca (yerel z, makineden uzağa) çekilir; yerlesim prizma ile aynı:
// {O, yaw, egX, egZ}. secenek: yuvarla (cm, köşe yarıçapı), pah (cm, ön/arka kenar yuvarlaması), sis (cm, yüzün
// şişkinliği), puruz (0..1 düzensizlik), doku ('tas'|'kumas'), yosun (0..1), catlak, cizgi (silüet mürekkebi), yogun (sis)
export function asinmisPrizma(P,isik,profil,kalin,{O,yaw=0,egX=0,egZ=0},renk,tohum,{yuvarla=6,pah=4,sis=1.5,puruz=.5,doku='tas',yosun=.5,catlak=2,cizgi=.55,yogun=0,sisle=null}={}){
  const R=rng(tohum*13+7);
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cx=Math.cos(egX), sx=Math.sin(egX), cz=Math.cos(egZ), sz=Math.sin(egZ);
  const rot=([x,y,z])=>{const x1=x*cz-y*sz, y1=x*sz+y*cz, y2=y1*cx-z*sx, z2=y1*sx+z*cx; return [x1*cy+z2*sy,y2,-x1*sy+z2*cy];};
  const W=q=>{const v=rot(q); return [O[0]+v[0],O[1]+v[1],O[2]+v[2]];};
  const b=Math.min(pah,kalin*.3);
  const tam=yuvarlakProfil(profil,yuvarla,3), ic=iceKaydir(tam,b), ic2=iceKaydir(tam,b*2.6);
  const n=tam.length;
  // düzgün gürültü: profil boyunca dalgalanan sapma (taş yontusu, şişkinlik)
  const f=[R()*6.3,R()*6.3,R()*6.3], gur=(i,k)=>puruz*(Math.sin(i/n*6.283*2+f[0]+k)*.6+Math.sin(i/n*6.283*5+f[1]-k*.7)*.3+Math.sin(i/n*6.283*9+f[2])*.15);
  const halka=(pr,z,k,yerde=true)=>pr.map((p,i)=>{const g=gur(i,k)*1.6, yer=yerde&&p[1]<=.5; return W([p[0]+(yer?0:g*.6),yer?0:p[1]+g*.5,z+gur(i,k+2)*.8]);});
  const H=[halka(ic2,-sis,0),halka(ic,0,1),halka(tam,b,2),halka(tam,kalin-b,3),halka(ic,kalin,4),halka(ic2,kalin+sis,5)];
  const mrk=W([tam.reduce((s,q)=>s+q[0],0)/n,tam.reduce((s,q)=>s+q[1],0)/n,kalin/2]);
  // yüzler: [köşe indisleri (halka,nokta)]
  const yuzler=[{v:H[0].map((_,i)=>[0,i])},{v:H[5].map((_,i)=>[5,n-1-i])}];
  const kenarlar=[];
  for(let h=0;h<5;h++) for(let i=0;i<n;i++){const j=(i+1)%n; yuzler.push({v:[[h,i],[h,j],[h+1,j],[h+1,i]]});}
  const goz=[0,P.yukseklik,0], gor=[], gorunurMu=new Map();
  yuzler.forEach((y,yi)=>{
    const q=y.v.map(([h,i])=>H[h][i]), m=q.reduce((s,p)=>[s[0]+p[0]/q.length,s[1]+p[1]/q.length,s[2]+p[2]/q.length],[0,0,0]);
    let nn=[0,0,0]; for(let i=0;i<q.length;i++){const a=q[i], d=q[(i+1)%q.length]; nn[0]+=(a[1]-d[1])*(a[2]+d[2]); nn[1]+=(a[2]-d[2])*(a[0]+d[0]); nn[2]+=(a[0]-d[0])*(a[1]+d[1]);}
    const l=Math.hypot(...nn); if(l<1e-6){gorunurMu.set(yi,false); return;} nn=nn.map(v=>v/l);
    if((m[0]-mrk[0])*nn[0]+(m[1]-mrk[1])*nn[1]+(m[2]-mrk[2])*nn[2]<0) nn=nn.map(v=>-v);
    const gr=nn[0]*(goz[0]-m[0])+nn[1]*(goz[1]-m[1])+nn[2]*(goz[2]-m[2])>0;
    gorunurMu.set(yi,gr);
    if(gr) gor.push({q,m,n:nn,d:P.derinlik(...m),yi,v:y.v});
  });
  gor.sort((a,d)=>d.d-a.d);
  const sisR=k=>sisle?sisle(k,mrk[2],yogun):k;
  for(const g of gor){const k=sisR(golgele(renk,aydinlik(isik,g.m,g.n)*(.97+R()*.06))); c.beginPath(); yol3(P,g.q); c.fillStyle=rgba(k,1); c.fill(); c.strokeStyle=rgba(k,1); c.lineWidth=.6; c.stroke();
    if(g.v.length===4&&(g.v[0][0]===1||g.v[0][0]===2)) kenarlar.push([g.q[2],g.q[3],g.n]);}
  const ol=P.olcek(...mrk), mur=sisle?sisle(MUREKKEP,mrk[2],yogun):MUREKKEP;
  yuzDokusu(P,isik,gor,renk,R,{doku,yosun,catlak,mur,olcek:ol});
  kenarParlat(P,isik,kenarlar,renk,R,doku==='kumas'?.18:.35);
  // silüet: bir yanı görünen, öbür yanı görünmeyen kenarlar
  if(cizgi){
    const kenar=new Map(), anah=(a,d)=>{const k1=a.join(':'), k2=d.join(':'); return k1<k2?k1+'|'+k2:k2+'|'+k1;};
    yuzler.forEach((y,yi)=>{for(let i=0;i<y.v.length;i++){const a=y.v[i], d=y.v[(i+1)%y.v.length], k=anah(a,d); const e=kenar.get(k)||{a,d,g:0,s:0}; e.s++; if(gorunurMu.get(yi)) e.g++; kenar.set(k,e);}});
    const hatlar=[];
    for(const e of kenar.values()) if(e.g===1&&(e.s===2||e.s===1)){const p=H[e.a[0]][e.a[1]], q=H[e.d[0]][e.d[1]]; if(p[1]<.6&&q[1]<.6) continue; hatlar.push([p,q]);}
    for(const [i,[p,q]] of hatlar.entries()) hat3(P,[p,q],mur,cizgi,1.15,tohum+i,1,.7);
  }
  const u=rot([1,0,0]), v=rot([0,-1,0]);
  return {O:W([0,0,0]), D:{u,v}, dunya:W, gorunen:gor};
}

// Aşınmış kutu: [x0,x1] [y0,y1] [z0,z1] dünya cm; asinmisPrizma ile aynı seçenekler
export function asinmisKutu(P,isik,[x0,x1],[y0,y1],[z0,z1],renk,tohum,o={}){
  return asinmisPrizma(P,isik,[[0,0],[x1-x0,0],[x1-x0,y1-y0],[0,y1-y0]],z1-z0,{O:[x0,y0,z0]},renk,tohum,o);
}

// Teknenin oyuğu (yalak, şırahane, un teknesi): üst yüzde ağız; uzak iç duvar ışık alır, yakın iç duvar ve dip
// karanlık. su: [r,g,b] verilirse ağızdan biraz aşağıda göğü yansıtan su yüzü. ag: ağzın köşe yarıçapı (cm)
export function tekneOyugu(P,isik,{x:[x0,x1],z:[z0,z1],y,derin=20,renk,su=null,ag=5,tohum=1,dolgu=null}){
  const R=rng(tohum*7+3);
  const kenar=yuvarlakProfil([[x0,z0],[x1,z0],[x1,z1],[x0,z1]],ag,3);
  const agiz=kenar.map(([x,z])=>[x,y,z]);
  c.save(); c.beginPath(); yol3(P,agiz); c.clip();
  cokgen3(P,agiz,golgele(renk,.16));
  // uzak iç duvar (makineye bakar) ve yan duvarlar
  const uzak=[[x0,y,z1],[x1,y,z1],[x1,y-derin,z1],[x0,y-derin,z1]];
  cokgen3(P,uzak,golgele(renk,aydinlik(isik,[(x0+x1)/2,y-derin/2,z1],[0,0,-1])*.8));
  if(x0<0) cokgen3(P,[[x0,y,z0],[x0,y,z1],[x0,y-derin,z1],[x0,y-derin,z0]],golgele(renk,aydinlik(isik,[x0,y-derin/2,(z0+z1)/2],[1,0,0])*.7));
  if(x1>0) cokgen3(P,[[x1,y,z0],[x1,y,z1],[x1,y-derin,z1],[x1,y-derin,z0]],golgele(renk,aydinlik(isik,[x1,y-derin/2,(z0+z1)/2],[-1,0,0])*.7));
  const ab=P.n((x0+x1)/2,y,z0), ao=P.olcek((x0+x1)/2,y,z0);
  leke(ab[0],ab[1]+2*ao,(x1-x0)*ao*.55,derin*ao*.5,[0,0,0],.6); // yakın kenarın altı: koyu gölge
  if(su){const sq=kenar.map(([x,z])=>[x,y-derin*.45,z]); cokgen3(P,sq,su); const sm=P.n((x0+x1)/2,y-derin*.45,(z0+z1)/2+(z1-z0)*.2); leke(sm[0],sm[1],(x1-x0)*ao*.35,3*ao,[220,222,212],.45); leke(ab[0],ab[1],(x1-x0)*ao*.5,4*ao,[0,0,0],.4);}
  if(dolgu){const sq=kenar.map(([x,z])=>[x,y-derin*.35,z]); cokgen3(P,sq,dolgu); const sm=P.n((x0+x1)/2,y-derin*.35,(z0+z1)/2); leke(sm[0],sm[1],(x1-x0)*ao*.4,(z1-z0)*ao*.2,golgele(dolgu,1.3),.5);}
  for(let i=0;i<8;i++){const p=P.n(lerp(x0,x1,R()),y-derin*R(),lerp(z0,z1,.6+R()*.4)); leke(p[0],p[1],(3+R()*8)*ao,(1+R()*3)*ao,[0,0,0],.2);}
  c.restore();
  // ağız kenarı: içe dönük yuvarlak dudak, ışıklı yanı kopuk açık çizgi
  hat3(P,agiz,MUREKKEP,.55,1.1,tohum,2,.8,true);
  const on=agiz.filter(q=>q[2]<z0+ag*1.2);
  for(let i=1;i<on.length;i++){if(R()<.25) continue; const a=P.n(...on[i-1]), d=P.n(...on[i]); c.strokeStyle=rgba(golgele(renk,1.5),.3); c.lineWidth=.9; c.beginPath(); c.moveTo(a[0],a[1]-1); c.lineTo(d[0],d[1]-1); c.stroke();}
  return clamp(derin,0,999);
}
