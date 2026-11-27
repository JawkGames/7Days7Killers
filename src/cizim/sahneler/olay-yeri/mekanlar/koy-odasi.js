// Köy odası (ağanın misafir odası): üç yanda sedir, üstünde minder ve duvara dayalı yastıklar; arka duvarda sıvalı ocak,
// solda demir parmaklıklı pencere, sağ köşede çiviye asılı tüfek; önde bakır sini üstünde cezve takımı. Tavan kavak kirişli.
// Tek ışık: arka duvardaki pencere (dışarısı aşırı pozlanmış). Işık sol arkadan girer, gölgeler sağa ve makineye düşer.
//
// Bu dosyanın başındaki yardımcılar (tahta/taş yüzey, dokulu kutu, taş döşeme, pencere, güneş lekesi) öbür mekânlarca da
// kullanılır; ortak yardımcılar salt okunur olduğu için burada duruyorlar. mekan-yardim.js'e taşınmalı (ortaklaştırılmalı).
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,clamp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {silindir,cokgen3,hat3,yol3,aydinlik,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,duzlemNoktasi,dunya,zemin,aydinlikBosluk,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';

/* ─────────────── ortak yardımcılar (ortaklaştırılmalı) ─────────────── */

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

// Tahta yüzey: tahtalar (yon 'u': yerel x boyunca, 'v': yerel y boyunca), her tahta ayrı ışık, damar, budak, derz, çivi, aşınma
export function tahtaYuzey(P,isik,O,D,[x0,x1,y0,y1],renk,r,{en=16,yon='u',boy=[120,320],asinma=.5,civi=true,derz=.55}={}){
  const nn=yuzNormal(P,O,D), T=(l,e)=>yon==='u'?[l,e]:[e,l];
  const [L0,L1,E0,E1]=yon==='u'?[x0,x1,y0,y1]:[y0,y1,x0,x1];
  c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]); c.clip();
  for(let e=E0;e<E1-.5;){
    const w=Math.min(en*(.8+r()*.45),E1-e), e1=e+w;
    for(let l=L0-r()*boy[0];l<L1;){
      const la=Math.max(l,L0), l1=Math.min(l+boy[0]+r()*(boy[1]-boy[0]),L1);
      const m=dunya(O,D,...T((la+l1)/2,(e+e1)/2)), a=aydinlik(isik,m,nn)*(.8+r()*.32);
      c.beginPath(); duzlemYol(P,O,D,[T(la,e),T(l1,e),T(l1,e1),T(la,e1)]); c.fillStyle=rgba(golgele(renk,a),1); c.fill();
      // damar: boyuna dalgalı ince hatlar
      const n=Math.max(2,Math.round(w/2.4));
      for(let k=0;k<n;k++){
        const f=(k+.5)/n, ph=r()*TAU, amp=.2+r()*.7, fr=.015+r()*.03, pts=[];
        for(let s=la;s<=l1+.1;s+=Math.max(6,(l1-la)/14)) pts.push(T(s,e+w*f+Math.sin(s*fr+ph)*amp));
        c.beginPath(); duzlemCizgi(P,O,D,pts); c.strokeStyle=rgba(r()<.78?[0,0,0]:golgele(renk,Math.min(1.6,a*1.6)),.08+r()*.16); c.lineWidth=.4+r()*.7; c.stroke();
      }
      if(r()<.3){ // budak
        const b=T(la+(l1-la)*(.15+r()*.7),e+w*(.3+r()*.4)), bo=dunya(O,D,b[0],b[1]), rx=1.4+r()*2;
        duzlemde(P,bo,D,()=>{c.fillStyle='rgba(10,8,6,.55)'; c.beginPath(); c.ellipse(0,0,yon==='u'?rx*1.6:rx,yon==='u'?rx:rx*1.6,0,0,TAU); c.fill(); c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=.5; c.beginPath(); c.ellipse(0,0,(yon==='u'?rx*2.6:rx*1.7),(yon==='u'?rx*1.7:rx*2.6),0,0,TAU); c.stroke();});
      }
      // aşınma: ortası açık, kirli lekeler
      if(asinma){
        const s=P.n(...m), o=P.olcek(...m);
        if(r()<asinma) leke(s[0],s[1],(l1-la)*o*.25,w*o*.4,golgele(renk,Math.min(1.7,a*1.5)),.18);
        if(r()<asinma*.6){const q=dunya(O,D,...T(la+(l1-la)*r(),e+w*r())), sq=P.n(...q); leke(sq[0],sq[1],(4+r()*10)*o,(2+r()*5)*o,[0,0,0],.25);}
      }
      // uç derzi ve çiviler
      if(l1<L1){c.beginPath(); duzlemCizgi(P,O,D,[T(l1,e),T(l1,e1)]); c.strokeStyle=`rgba(0,0,0,${derz})`; c.lineWidth=1.1; c.stroke();}
      if(civi) for(const lc of [la+3,l1-3]) if(lc>L0+1&&lc<L1-1){const q=P.n(...dunya(O,D,...T(lc,e+w/2))); c.fillStyle='rgba(12,10,8,.7)'; c.fillRect(q[0]-.9,q[1]-.9,1.8,1.8);}
      l=l1;
    }
    if(e1<E1-.5){ // boyuna derz: koyu yarık, yanında ince ışık
      c.beginPath(); duzlemCizgi(P,O,D,[T(L0,e1),T(L1,e1)]); c.strokeStyle=`rgba(0,0,0,${derz})`; c.lineWidth=1.2; c.stroke();
      c.beginPath(); duzlemCizgi(P,O,D,[T(L0,e1+.8),T(L1,e1+.8)]); c.strokeStyle=rgba(golgele(renk,1.5),.12); c.lineWidth=.6; c.stroke();
    }
    e=e1;
  }
  c.restore();
}

// Yekpare taş ya da sıva yüzey: ızgarada ışık, gözenek, çatlak, kırık kenar
export function tasYuzey(P,isik,O,D,[x0,x1,y0,y1],renk,r,{adim=30,gozenek=1,catlak=2}={}){
  const nn=yuzNormal(P,O,D);
  c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]); c.clip();
  c.fillStyle=rgba(golgele(renk,aydinlik(isik,dunya(O,D,(x0+x1)/2,(y0+y1)/2),nn)),1); c.fill();
  for(let x=x0;x<x1;x+=adim) for(let y=y0;y<y1;y+=adim){
    const w=dunya(O,D,x+adim/2,y+adim/2), a=aydinlik(isik,w,nn)*(.85+r()*.3), s=P.n(...w), o=P.olcek(...w);
    leke(s[0],s[1],adim*o*.9,adim*o*.8,golgele(renk,a),.6);
  }
  const ex=duzlemNoktasi(P,O,D,x0,y0), ey=duzlemNoktasi(P,O,D,x1,y1), alanE=Math.abs((ey[0]-ex[0])*(ey[1]-ex[1]));
  for(let i=0;i<alanE/90*gozenek;i++){const q=duzlemNoktasi(P,O,D,x0+r()*(x1-x0),y0+r()*(y1-y0)); c.fillStyle=r()<.65?`rgba(0,0,0,${.15+r()*.3})`:`rgba(230,222,196,${.08+r()*.14})`; c.fillRect(q[0],q[1],.6+r()*1.6,.5+r()*1.1);}
  for(let i=0;i<6;i++){const q=duzlemNoktasi(P,O,D,x0+r()*(x1-x0),y0+r()*(y1-y0)); leke(q[0],q[1],8+r()*26,5+r()*14,r()<.6?[0,0,0]:golgele(renk,1.4),.08+r()*.1);}
  for(let i=0;i<catlak;i++){let x=x0+r()*(x1-x0), y=y0+r()*(y1-y0); const pts=[[x,y]]; for(let k=0;k<5;k++){x+=(r()-.5)*14; y+=(r()-.3)*10; pts.push([x,y]);}
    titrek(()=>duzlemCizgi(P,O,D,pts),MUREKKEP,.4,.8,(r()*1e5)|0,1,.4);}
  c.restore();
}

// Görünen yüzleri dokulu kutu. doku: 'tahta' | 'tas' | 'duz'. Kenarlar mürekkep, ışığa bakan üst kenar aşınmış açık çizgi.
export function kutuDoku(P,isik,[x0,x1],[y0,y1],[z0,z1],renk,tohum,{doku='tahta',en=16,yonOn='u',yonUst='u',yonYan='u',cizgi=.6,kenar=.35,ust=true,on=true}={}){
  const r=rng(tohum), yuzler=[];
  if(on) yuzler.push({O:[0,0,z0], D:DUZLEM.arka, a:[x0,x1,-y1,-y0], yon:yonOn, q:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]]});
  if(ust&&y1<P.yukseklik) yuzler.push({O:[0,y1,0], D:DUZLEM.ust, a:[x0,x1,-z1,-z0], yon:yonUst, q:[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]});
  if(y0>P.yukseklik) yuzler.push({O:[0,y0,0], D:DUZLEM.ust, a:[x0,x1,-z1,-z0], yon:yonUst, q:[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]});
  if(x1<0) yuzler.push({O:[x1,0,0], D:DUZLEM.sol, a:[z0,z1,-y1,-y0], yon:yonYan, q:[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]]});
  if(x0>0) yuzler.push({O:[x0,0,0], D:DUZLEM.sag, a:[-z1,-z0,-y1,-y0], yon:yonYan, q:[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]});
  for(const y of yuzler){
    if(doku==='tahta') tahtaYuzey(P,isik,y.O,y.D,y.a,renk,r,{en,yon:y.yon});
    else if(doku==='tas') tasYuzey(P,isik,y.O,y.D,y.a,renk,r,{adim:Math.max(12,Math.min(y.a[1]-y.a[0],y.a[3]-y.a[2])/3)});
    else {const m=y.q.reduce((s,q)=>[s[0]+q[0]/4,s[1]+q[1]/4,s[2]+q[2]/4],[0,0,0]); cokgen3(P,y.q,golgele(renk,aydinlik(isik,m,yuzNormal(P,y.O,y.D))));}
  }
  if(cizgi) for(const [i,y] of yuzler.entries()) hat3(P,y.q,MUREKKEP,cizgi,1.2,tohum+i,2,1.2,true);
  if(kenar&&ust&&y1<P.yukseklik) kenarIsigi(P,[x0,y1,z0],[x1,y1,z0],r,{alfa:kenar});
  return yuzler;
}

// Düzensiz taş döşeme (avlu, eşik): sarsılmış ızgaradan dörtgen ve birleşik taşlar; köşeler kırık, aralar toprak ve ot
export function tasDoseme(P,isik,[x0,x1],[z0,z1],renk,r,{boy=46,derz=[40,36,30],Y=0,asinma=1,sars=.32}={}){
  const q=[[x0,Y,z0],[x1,Y,z0],[x1,Y,z1],[x0,Y,z1]];
  c.save(); c.beginPath(); yol3(P,q); c.clip(); cokgen3(P,q,derz);
  // derz toprağı: lekeli
  for(let i=0;i<40;i++){const s=P.n(x0+r()*(x1-x0),Y,z0+r()*(z1-z0)); leke(s[0],s[1],20+r()*60,6+r()*16,r()<.5?[0,0,0]:golgele(derz,1.6),.15);}
  const bx=boy, bz=boy*.8, nx=Math.ceil((x1-x0)/bx)+2, nz=Math.ceil((z1-z0)/bz)+2, K=[];
  for(let i=0;i<=nx;i++){K[i]=[]; for(let j=0;j<=nz;j++) K[i][j]=[x0-bx+i*bx+(j%2)*bx*.45+(r()-.5)*bx*sars*2,z0-bz+j*bz+(r()-.5)*bz*sars*2];}
  const kullan=new Set();
  for(let j=nz-1;j>=0;j--) for(let i=0;i<nx;i++){
    if(kullan.has(i+','+j)) continue;
    let pol;
    if(i<nx-1&&!kullan.has((i+1)+','+j)&&r()<.28){kullan.add((i+1)+','+j); pol=[K[i][j],K[i+1][j],K[i+2][j],K[i+2][j+1],K[i+1][j+1],K[i][j+1]];}
    else pol=[K[i][j],K[i+1][j],K[i+1][j+1],K[i][j+1]];
    const mx=pol.reduce((a,p)=>a+p[0],0)/pol.length, mz=pol.reduce((a,p)=>a+p[1],0)/pol.length;
    const ic=pol.map(([px,pz])=>{const d=Math.hypot(px-mx,pz-mz)||1, k=Math.max(0,1-(1.1+r()*1.5)/d); return [mx+(px-mx)*k,mz+(pz-mz)*k];});
    const tas=[]; ic.forEach((p,k)=>{const a=ic[(k+ic.length-1)%ic.length], b=ic[(k+1)%ic.length], t1=.06+r()*.14, t2=.06+r()*.14; tas.push([p[0]+(a[0]-p[0])*t1,Y,p[1]+(a[1]-p[1])*t1]); tas.push([p[0]+(b[0]-p[0])*t2,Y,p[1]+(b[1]-p[1])*t2]);});
    const m=[mx,Y,mz], al=aydinlik(isik,m,[0,1,0])*(.7+r()*.42), w=Math.max(...pol.map(p=>p[0]))-Math.min(...pol.map(p=>p[0])), h=Math.max(...pol.map(p=>p[1]))-Math.min(...pol.map(p=>p[1]));
    cokgen3(P,tas,golgele(renk,al));
    const s=P.n(...m), o=P.olcek(...m);
    c.save(); c.beginPath(); yol3(P,tas); c.clip();
    leke(s[0]-w*o*.1,s[1]-h*o*.05,w*o*.35,h*o*.25,golgele(renk,Math.min(1.5,al*1.45)),.3*asinma);
    leke(s[0]+w*o*.3,s[1]+h*o*.25,w*o*.4,h*o*.3,[0,0,0],.22);
    if(r()<.3) leke(s[0]+(r()-.5)*w*o*.6,s[1]+(r()-.5)*h*o*.3,w*o*.2,h*o*.12,[0,0,0],.25);
    for(let k=0;k<w*h*o*o/140;k++){c.fillStyle=r()<.6?`rgba(0,0,0,${.15+r()*.25})`:`rgba(230,222,196,${.08+r()*.12})`; c.fillRect(s[0]+(r()-.5)*w*o,s[1]+(r()-.5)*h*o*.6,.6+r()*1.4,.5+r());}
    if(r()<.3){let cx=mx+(r()-.5)*w*.5, cz=mz+(r()-.5)*h*.5; const pts=[[cx,Y,cz]]; for(let k=0;k<4;k++){cx+=(r()-.5)*12; cz+=(r()-.5)*8; pts.push([cx,Y,cz]);} hat3(P,pts,MUREKKEP,.45,.8,(r()*1e5)|0,1,.4);}
    c.restore();
    hat3(P,tas,MUREKKEP,.32,.9,(r()*1e5)|0,1,.6,true);
    // makineye bakan kırık kenarda ince ışık
    const on=tas.slice().sort((a,b)=>a[2]-b[2]).slice(0,2).sort((a,b)=>a[0]-b[0]), k0=P.n(...on[0]), k1=P.n(...on[1]);
    c.strokeStyle=rgba(golgele(renk,Math.min(1.6,al*1.5)),.25); c.lineWidth=.8; c.beginPath(); c.moveTo(k0[0],k0[1]-.8); c.lineTo(k1[0],k1[1]-.8); c.stroke();
  }
  // derzde ot
  for(let i=0;i<70;i++){const X=x0+r()*(x1-x0), Z=z0+r()*(z1-z0), s=P.n(X,Y,Z), o=P.olcek(X,Y,Z); for(let k=0;k<3;k++){c.strokeStyle=`rgba(20,22,16,${.3+r()*.3})`; c.lineWidth=.7; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+(r()-.5)*4*o,s[1]-(1+r()*3)*o); c.stroke();}}
  c.restore();
}

// Arka duvarda (Z=ON yüzü, kalınlık derin) pencere: dışarısı bembeyaz; sol yan yüz, alt (denizlik) ve üst (lento altı) görünür.
// parmak: demir parmaklık sayısı. Döndürür: açıklığın dünya köşeleri (güneş lekesi için)
export function pencere(P,isik,ON,[x0,x1],[y0,y1],r,{derin=36,parmak=3,kanat=true,renk=[150,144,128]}={}){
  const Z1=ON+derin;
  aydinlikBosluk(P,[[x0,y0,Z1],[x0,y1,Z1],[x1,y1,Z1],[x1,y0,Z1]],r);
  // yan yüzler: makineye göre hangisi görünürse
  if(x0<0) cokgen3(P,[[x0,y0,ON],[x0,y1,ON],[x0,y1,Z1],[x0,y0,Z1]],golgele(renk,.55));
  if(x1>0) cokgen3(P,[[x1,y0,ON],[x1,y1,ON],[x1,y1,Z1],[x1,y0,Z1]],golgele(renk,.55));
  if(y0<P.yukseklik) cokgen3(P,[[x0,y0,ON],[x1,y0,ON],[x1,y0,Z1],[x0,y0,Z1]],golgele(renk,1.05));
  if(y1>P.yukseklik) cokgen3(P,[[x0,y1,ON],[x1,y1,ON],[x1,y1,Z1],[x0,y1,Z1]],[34,28,22]);
  // pencere çerçevesi (dış yüzde), parmaklıklar (ortada)
  const zc=ON+derin*.55;
  for(let i=1;i<=parmak;i++){const x=x0+(x1-x0)*i/(parmak+1); hat3(P,[[x,y0,zc],[x,y1,zc]],[22,20,18],1,2.2*P.olcek(x,y0,zc)/1.7,700+i,1,.3);}
  hat3(P,[[x0,(y0+y1)/2+8,zc],[x1,(y0+y1)/2+8,zc]],[22,20,18],1,2*P.olcek(x0,y0,zc)/1.7,710,1,.3);
  if(kanat){ // içe açık tahta kanat (sol yana yaslı)
    const k=[[x0,y0+2,ON],[x0,y1-2,ON],[x0+22,y1-6,ON-30],[x0+22,y0+6,ON-30]];
    cokgen3(P,k,[58,48,36]); hat3(P,k,MUREKKEP,.7,1.2,720,2,1,true);
    for(let i=1;i<3;i++){const f=i/3; hat3(P,[[x0+22*f,y0+3,ON-30*f],[x0+22*f,y1-3,ON-30*f]],[20,16,12],.5,1,721+i,1,.4);}
  }
  hat3(P,[[x0,y0,ON],[x0,y1,ON],[x1,y1,ON],[x1,y0,ON]],MUREKKEP,.7,1.4,730,2,1.2,true);
  return [[x0,y0,ON],[x1,y0,ON],[x1,y1,ON],[x0,y1,ON]];
}

// Açıklıktan (dünya köşeleri) yere düşen güneş lekesi; yon: güneşten gelen ışığın yönü (aşağı eksi Y)
export function gunesLekesi(P,koseler,yon,alfa=.45,{Y=0,renk=[200,192,160],parmak=0}={}){
  const iz=q=>{const t=(q[1]-Y)/-yon[1]; return [q[0]+yon[0]*t,Y,q[2]+yon[2]*t];}, z=koseler.map(iz);
  const s=z.map(q=>P.n(...q)), mx=s.reduce((a,q)=>a+q[0]/4,0), my=s.reduce((a,q)=>a+q[1]/4,0);
  c.save(); c.globalCompositeOperation='screen';
  c.filter='blur(3px)';
  c.beginPath(); yol3(P,z); c.fillStyle=rgba(renk,alfa*.55); c.fill();
  c.filter='none';
  c.beginPath(); yol3(P,z); c.clip();
  leke(mx,my,Math.max(...s.map(q=>Math.abs(q[0]-mx)))*1.3,Math.max(...s.map(q=>Math.abs(q[1]-my)))*1.4,renk,alfa*.6);
  c.restore();
  if(parmak){ // parmaklık gölgeleri
    const [a,b,,d]=koseler;
    for(let i=1;i<=parmak;i++){const f=i/(parmak+1), p0=iz([a[0]+(b[0]-a[0])*f,a[1],a[2]]), p1=iz([a[0]+(b[0]-a[0])*f,d[1],d[2]]), s0=P.n(...p0), s1=P.n(...p1);
      c.strokeStyle=`rgba(0,0,0,${alfa*.5})`; c.lineWidth=2.4*P.olcek(...p0)/1.7; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();}
  }
  return z;
}

// Yatay daire (dünya noktaları)
export const daire3=(X,Y,Z,rx,rz=rx,n=32)=>Array.from({length:n},(_,i)=>{const a=i/n*TAU; return [X+Math.cos(a)*rx,Y,Z+Math.sin(a)*rz];});

// Torna işi dönel cisim (cezve, lamba, tulumba, şişe): profil [[yarıçap, y], ...] aşağıdan yukarı. Her şerit kendi ışığını alır.
export function torna(P,isik,X,Z,profil,renk,tohum,{dilim=24,cizgi=.6,ustRenk=null,ust=true}={}){
  const halka=(rr,y)=>Array.from({length:dilim},(_,i)=>{const a=i/dilim*TAU; return [X+Math.cos(a)*rr,y,Z+Math.sin(a)*rr];});
  const H=profil.map(([rr,y])=>halka(rr,y)), seritler=[];
  for(let k=0;k<profil.length-1;k++){
    const [r0,y0]=profil[k], [r1,y1]=profil[k+1], eg=(r0-r1)/((y1-y0)||.001);
    for(let i=0;i<dilim;i++){
      const j=(i+1)%dilim, a=(i+.5)/dilim*TAU, l=Math.hypot(1,eg), n=[Math.cos(a)/l,eg/l,Math.sin(a)/l], rm=(r0+r1)/2;
      const m=[X+Math.cos(a)*rm,(y0+y1)/2,Z+Math.sin(a)*rm];
      if(n[0]*-m[0]+n[1]*(P.yukseklik-m[1])+n[2]*-m[2]<=0) continue;
      seritler.push({q:[H[k][i],H[k][j],H[k+1][j],H[k+1][i]],m,n});
    }
  }
  seritler.sort((a,b)=>P.derinlik(...b.m)-P.derinlik(...a.m));
  for(const s of seritler){const k=golgele(renk,aydinlik(isik,s.m,s.n)); c.beginPath(); yol3(P,s.q); c.fillStyle=rgba(k,1); c.fill(); c.strokeStyle=rgba(k,1); c.lineWidth=.5; c.stroke();}
  const son=profil[profil.length-1];
  if(ust&&son[1]<P.yukseklik&&son[0]>0) cokgen3(P,H[H.length-1],ustRenk||golgele(renk,aydinlik(isik,[X,son[1],Z],[0,1,0])));
  if(cizgi){
    const sol=[], sag=[];
    for(const h of H){const s=h.map(q=>P.n(...q)); let a=0,b=0; s.forEach((q,i)=>{if(q[0]<s[a][0]) a=i; if(q[0]>s[b][0]) b=i;}); sol.push(h[a]); sag.push(h[b]);}
    hat3(P,sol,MUREKKEP,cizgi,1.1,tohum,2,.8); hat3(P,sag,MUREKKEP,cizgi,1.1,tohum+1,2,.8);
    if(son[1]<P.yukseklik) hat3(P,H[H.length-1],MUREKKEP,cizgi*.8,1,tohum+2,1,.6,true);
    const alt=H[0].filter(q=>P.derinlik(...q)<P.derinlik(X,profil[0][1],Z)); if(alt.length>1) hat3(P,alt.sort((a,b)=>P.n(...a)[0]-P.n(...b)[0]),MUREKKEP,cizgi*.9,1.1,tohum+3,2,.8);
  }
}

// Badanalı (kireçli) sıva duvar: sivaDuvar gibi ama dökük yama sayısı ve boyu ayarlı (yama:0 temiz duvar)
export function badanaDuvar(P,isik,O,D,[x0,x1,y0,y1],renk,r,{is=0,yama=1,yamaBoy=1,catlak=5}={}){
  const nn=yuzNormal(P,O,D), kose=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]], sk=kose.map(q=>duzlemNoktasi(P,O,D,q[0],q[1]));
  c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kose); c.clip();
  c.fillStyle=rgba(golgele(renk,isik.ortam*1.6),1); c.fill();
  const adim=36;
  for(let x=x0;x<x1;x+=adim) for(let y=y0;y<y1;y+=adim){
    const w=dunya(O,D,x+adim/2,y+adim/2), a=aydinlik(isik,w,nn)*(1-is*clamp(1+(y+adim/2)/260,0,1)*.6)*(.93+r()*.12), s=P.n(...w), o=P.olcek(...w);
    leke(s[0],s[1],adim*o*1.1,adim*o*1.1,golgele(renk,a*1.2),.55);
  }
  for(let i=0;i<12;i++){const q=duzlemNoktasi(P,O,D,x0+r()*(x1-x0),y0+r()*(y1-y0)); leke(q[0],q[1],20+r()*70,14+r()*50,r()<.6?[0,0,0]:golgele(renk,1.2),.06+r()*.1);}
  for(let i=0;i<5;i++){const q=duzlemNoktasi(P,O,D,x0+r()*(x1-x0),y0+(y1-y0)*(.5+r()*.5)); leke(q[0],q[1]+20,6+r()*14,30+r()*40,[30,26,20],.08+r()*.08);} // akıntı
  for(let i=0;i<catlak;i++){let x=x0+r()*(x1-x0), y=y0+r()*(y1-y0); const pts=[[x,y]]; for(let k=0;k<6;k++){x+=(r()-.5)*16; y+=4+r()*9; pts.push([x,y]);} titrek(()=>duzlemCizgi(P,O,D,pts),MUREKKEP,.4,1,(r()*1e5)|0,1,.5);}
  // kireç fırça izleri: yatay, çok soluk
  for(let i=0;i<30;i++){const x=x0+r()*(x1-x0), y=y0+r()*(y1-y0), u=20+r()*50; c.beginPath(); duzlemCizgi(P,O,D,[[x,y],[x+u*.5,y+(r()-.5)*3],[x+u,y+(r()-.5)*2]]); c.strokeStyle=rgba(r()<.5?[0,0,0]:golgele(renk,1.4),.05+r()*.05); c.lineWidth=2+r()*3; c.stroke();}
  tara(Math.min(...sk.map(q=>q[0])),Math.min(...sk.map(q=>q[1])),Math.max(...sk.map(q=>q[0])),Math.max(...sk.map(q=>q[1])),.6,8,MUREKKEP,.12,(r()*1e5)|0,1);
  c.restore();
  for(let i=0;i<yama;i++){ // küçük dökük yama, duvarın alt yarısında
    const cx=x0+30+r()*(x1-x0-60), cy=y1-20-r()*(y1-y0)*.45, w=(10+r()*16)*yamaBoy, h=(7+r()*10)*yamaBoy;
    const kenar=Array.from({length:11},(_,k)=>{const t=k/11*TAU, u=.6+r()*.45; return [cx+Math.cos(t)*w*u,cy+Math.sin(t)*h*u];});
    c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kenar); c.fillStyle=rgba(golgele(renk,.42),1); c.fill(); c.clip();
    for(let k=0;k<6;k++){const q=duzlemNoktasi(P,O,D,cx+(r()-.5)*w*1.6,cy+(r()-.5)*h*1.4); c.fillStyle=rgba(golgele([120,108,88],.5+r()*.4),1); c.beginPath(); c.ellipse(q[0],q[1],3+r()*5,2+r()*3,0,0,TAU); c.fill();}
    c.restore(); tabana(); titrek(()=>duzlemYol(P,O,D,kenar),MUREKKEP,.5,1,(r()*1e5)|0,2,.8);
  }
}

// Duvar dibinde karanlık hat (zemine değen köşe)
export function dipGolgesi(P,hatlar,kalin=8,alfa=.5){
  for(const q of hatlar){const s0=P.n(q[0],0,q[1]), s1=P.n(q[2],0,q[3]); c.strokeStyle=`rgba(0,0,0,${alfa})`; c.lineWidth=kalin; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();}
}
// Duvarın alt yanında kirli etek bandı (badananın altı, sırt sürtünmesi): yerel cm, düzensiz üst sınır
export function etekBandi(P,O,D,[x0,x1],h,r,alfa=.35){
  const pts=[[x0,0]]; for(let x=x0;x<=x1;x+=20) pts.push([x,-h-(r()-.5)*8]); pts.push([x1,0]);
  c.save(); tabana(); c.beginPath(); duzlemCizgi(P,O,D,pts); c.closePath(); c.fillStyle=`rgba(30,26,20,${alfa})`; c.fill(); c.restore();
}

/* ─────────────── köy odası ─────────────── */

const SIVA=[186,178,158], TOPRAK=[124,112,92], AHSAP=[104,86,64], KIRIS=[92,78,60], BAKIR=[150,104,62], YUN=[132,92,70], YUN2=[96,84,98];
const ARKA=520, SOL=-262, SAG=262, TAVAN=236;
const PEN={x:[-206,-120], y:[96,184]};
const OCAK={x:[18,152], on:490, agiz:[46,124], agizY:92};
const SEDIR={en:76, y:34, minder:10};
const SINI={x:118, z:244, r:31};
const isik={konum:[-163,146,476], guc:1.6, menzil:380, ortam:.36};
const GUNES=[.32,-.78,-1];

// Dolgun minder/yastık/döşek (ortaklaştırılmalı): görünen yüzleri şişkin kenarlı, çizgili dokuma deseni, ortası basılmış
export function minder(P,isik,X,Y,Z,renk,r,t,{serit=true,sis=3.5,seritAra=9}={}){
  const [x0,x1]=X, [y0,y1]=Y, [z0,z1]=Z;
  const yuz=[];
  yuz.push({q:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]], n:[0,0,-1]});
  if(y1<P.yukseklik) yuz.push({q:[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]], n:[0,1,0]});
  if(x1<0) yuz.push({q:[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]], n:[1,0,0]});
  if(x0>0) yuz.push({q:[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]], n:[-1,0,0]});
  const mrk=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2], ms=P.n(...mrk);
  for(const [i,y] of yuz.entries()){
    const s=y.q.map(q=>P.n(...q)), m=y.q.reduce((a,q)=>[a[0]+q[0]/4,a[1]+q[1]/4,a[2]+q[2]/4],[0,0,0]), a=aydinlik(isik,m,y.n);
    const yol=()=>{ // kenarlar dışa şişer
      c.moveTo(s[0][0],s[0][1]);
      for(let k=0;k<4;k++){const p=s[k], q=s[(k+1)%4], mx=(p[0]+q[0])/2, my=(p[1]+q[1])/2, dx=mx-ms[0], dy=my-ms[1], d=Math.hypot(dx,dy)||1, o=P.olcek(...m)*sis;
        c.quadraticCurveTo(mx+dx/d*o,my+dy/d*o,q[0],q[1]);}
      c.closePath();
    };
    c.beginPath(); yol(); c.fillStyle=rgba(golgele(renk,a),1); c.fill();
    c.save(); c.clip();
    if(serit){ // dokuma şeritleri: x boyunca uzanan yüzlerde enine bantlar
      const L=y.n[0]?[z0,z1]:[x0,x1], ad=seritAra;
      for(let u=L[0]+ad*.5;u<L[1];u+=ad){const kalin=(Math.floor((u-L[0])/ad)%3===0)?.5:.22;
        const a0=y.n[0]?[x1<0?x1:x0,y0,u]:[u,y0,z0], a1=y.n[0]?[x1<0?x1:x0,y1,u]:(y.n[1]?[u,y1,z1]:[u,y1,z0]), b0=y.n[1]?[u,y1,z0]:a0;
        const p0=P.n(...b0), p1=P.n(...a1); c.strokeStyle=`rgba(0,0,0,${kalin*.6})`; c.lineWidth=Math.max(1,P.olcek(...m)*2.2); c.beginPath(); c.moveTo(p0[0],p0[1]); c.lineTo(p1[0],p1[1]); c.stroke();}
    }
    const sm=P.n(...m), o=P.olcek(...m);
    leke(sm[0],sm[1],(x1-x0)*o*.35,(y1-y0+5)*o*.5,golgele(renk,Math.min(1.6,a*1.5)),.25);
    leke(sm[0]+(r()-.5)*20,sm[1],12*o,5*o,[0,0,0],.25); // basılmış yer
    tara(Math.min(...s.map(q=>q[0])),Math.min(...s.map(q=>q[1])),Math.max(...s.map(q=>q[0])),Math.max(...s.map(q=>q[1])),.9,4,MUREKKEP,.18,t+i,.6);
    c.restore();
    titrek(yol,MUREKKEP,.7,1.1,t+10+i,2,.8);
  }
}

// Yere serili hasır: sazdan dokuma, boyuna sık sap çizgileri, aralıklı koyu atkı bantları, saçaklanmış kenar
function hasir(P,[x0,x1],[z0,z1],r){
  const q=[[x0,0,z0],[x1,0,z0+4],[x1-3,0,z1],[x0+2,0,z1-3]];
  cokgen3(P,q,golgele([150,134,96],.72));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  for(let x=x0;x<x1;x+=2.6){const a=P.n(x,0,z0), b=P.n(x+(r()-.5),0,z1); c.strokeStyle=r()<.5?'rgba(0,0,0,.22)':'rgba(220,200,150,.16)'; c.lineWidth=.7; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();}
  for(let z=z0+18;z<z1;z+=34) cokgen3(P,[[x0,0,z],[x1,0,z],[x1,0,z+4],[x0,0,z+4]],[30,24,16],.55);
  for(let i=0;i<14;i++){const s=P.n(x0+r()*(x1-x0),0,z0+r()*(z1-z0)); leke(s[0],s[1],30+r()*60,10+r()*20,r()<.6?[0,0,0]:[200,184,140],.1+r()*.1);}
  c.restore();
  hat3(P,q,MUREKKEP,.45,1,951,2,.8,true);
  for(let x=x0;x<x1;x+=4){const a=P.n(x,0,z0), b=P.n(x+(r()-.5)*2,0,z0-2-r()*4); c.strokeStyle='rgba(170,150,110,.5)'; c.lineWidth=.8; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();}
}

// Sedir: alçak sıvalı seki, üstünde minder, duvara dayalı yastıklar. yan: -1 sol duvar, 1 sağ duvar
function sedir(P,yan,z0,z1,r,t){
  const X=yan<0?[SOL,SOL+SEDIR.en]:[SAG-SEDIR.en,SAG];
  kutuDoku(P,isik,X,[0,SEDIR.y],[z0,z1],[150,140,120],t,{doku:'tas',cizgi:.5,kenar:0});
  // sekinin önüne sarkan dokuma örtü: boyuna renkli şeritler, altta zikzak ve saçak
  const xo=yan<0?X[1]:X[0], oy=SEDIR.y+1, oh=20, band=(y0,y1,renk,a=1)=>cokgen3(P,[[xo,y0,z0],[xo,y0,z1],[xo,y1,z1],[xo,y1,z0]],golgele(renk,a));
  const ao=aydinlik(isik,[xo,oy-10,(z0+z1)/2],[-yan,0,0]);
  band(oy,oy-oh,[120,70,52],ao*1.05); band(oy-3,oy-6,[60,40,40],ao); band(oy-9,oy-11,[170,150,110],ao); band(oy-14,oy-17,[60,40,40],ao);
  { const pts=[]; for(let z=z0;z<=z1;z+=6) pts.push([xo,oy-12.5+((z-z0)/6%2?2:-2),z]); hat3(P,pts,[200,176,130],.5,1,t+5,1,.3); }
  for(let z=z0+2;z<z1;z+=3.2) hat3(P,[[xo,oy-oh,z],[xo,oy-oh-3-r()*2,z+(r()-.5)]],[150,120,90],.55,1,t+6+z,1,.3);
  hat3(P,[[xo,oy,z0],[xo,oy,z1],[xo,oy-oh,z1],[xo,oy-oh,z0]],MUREKKEP,.5,1,t+7,2,.8,true);
  // minderler: üç parça
  const parca=3, L=(z1-z0)/parca;
  // yastıklar önce (duvara dayalı, arkada kalır), sonra minder
  const xs=yan<0?[SOL+2,SOL+18]:[SAG-18,SAG-2], yp=4, YL=(z1-z0)/yp;
  for(let i=yp-1;i>=0;i--) minder(P,isik,xs,[SEDIR.y+SEDIR.minder-2,SEDIR.y+SEDIR.minder+36+r()*4],[z0+i*YL+3,z0+(i+1)*YL-3],i%2?YUN2:golgele(YUN2,1.2),r,t+40+i*5,{sis:5});
  for(let i=parca-1;i>=0;i--) minder(P,isik,[X[0]+(yan<0?0:3),X[1]-(yan<0?3:0)],[SEDIR.y,SEDIR.y+SEDIR.minder],[z0+i*L+1,z0+(i+1)*L-1],i%2?YUN:golgele(YUN,.85),r,t+20+i*5);
}

// Çiviye askılı tüfek (arka duvar düzleminde; çivi 0,0, y aşağı)
function tufek(P,X,Y){
  duzlemde(P,[X,Y,ARKA],DUZLEM.arka,()=>{
    c.save(); c.rotate(-.3); c.scale(1.15,1.15);
    const ciz=g=>{
      c.fillStyle=g?'rgba(0,0,0,.5)':'rgb(22,20,18)'; c.fillRect(-1.6,2,3.2,70); if(!g){c.fillStyle='rgba(220,210,180,.4)'; c.fillRect(-1.4,4,.8,60);}                     // namlu
      c.fillStyle=g?'rgba(0,0,0,.45)':rgba(golgele(AHSAP,.9),1);
      c.beginPath(); c.moveTo(-2.4,40); c.lineTo(2.6,40); c.lineTo(3.2,92); c.lineTo(5.5,104); c.lineTo(9,124); c.lineTo(-1,126); c.lineTo(-3.4,104); c.lineTo(-3,92); c.closePath(); c.fill(); // kundak, dipçik
      if(!g){c.fillStyle='rgb(30,28,26)'; c.fillRect(-2.8,84,5.6,6); c.strokeStyle='rgba(210,200,170,.35)'; c.lineWidth=.5; c.beginPath(); c.moveTo(-1.6,44); c.lineTo(-2,100); c.stroke();}
    };
    c.save(); c.translate(5,4); ciz(true); c.restore(); ciz(false);
    c.restore();
    // kayış: çividen namlu ucuna ve dipçiğe
    c.strokeStyle='rgb(40,32,24)'; c.lineWidth=1.3; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-4,14,Math.sin(.42)*8,Math.cos(.42)*8+4); c.stroke();
    c.fillStyle='rgb(20,18,16)'; c.beginPath(); c.arc(0,0,1.1,0,TAU); c.fill();
  });
}

export default {
  id:'koy-odasi',
  kamera:{odak:860, yukseklik:142, egim:.19},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[-20,0,238], yuzey:'toprak', alan:16, aci:1.5},
    'zemin-orta': {duzlem:'zemin', konum:[-70,0,468], yuzey:'toprak', alan:8, aci:1.5},
    'zemin-kose': {duzlem:'zemin', konum:[142,0,350], yuzey:'toprak', alan:6},
    'ocak-onu':   {duzlem:'zemin', konum:[86,0,432], yuzey:'toprak', alan:7},
    'duvar':      {duzlem:'arka', konum:[-66,166,ARKA], yuzey:'siva', alan:4},
    'sedir-ustu': {duzlem:'ust', konum:[-212,SEDIR.y+SEDIR.minder,402], yuzey:'tahta', alan:5, uygunsuz:['un']},
    'masa-ustu':  {duzlem:'ust', konum:[SINI.x-12,25,SINI.z+12], yuzey:'tas', alan:3, uygunsuz:['un','saat']},
    'beden':      {duzlem:'zemin', konum:[-36,0,350], aci:.1, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(6271), O=OCAK;
    c.fillStyle='#16140f'; c.fillRect(0,0,1000,750);
    // tavan: ince çubuk dizisi, üstünde kavak kirişler
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[70,62,50],R,{en:5,yon:'v',boy:[400,600],asinma:0,civi:false,derz:.35});
    // arka duvar: badanalı sıva; pencere ve ocak ağzı kesilerek
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1],PEN.y[0],ARKA]]); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.25,yama:2});
    etekBandi(P,[0,0,ARKA],DUZLEM.arka,[SOL,SAG],70,R,.28);
    c.restore();
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.25,yama:0});
    for(const z of[ARKA-6,446,382,318,254]) kutuDoku(P,isik,[SOL,SAG],[TAVAN-15,TAVAN],[z-8,z+8],KIRIS,400+z,{doku:'tahta',en:8,cizgi:.55,kenar:0});
    // zemin: sıvanmış toprak, pencereden düşen ışık
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:61,doku:.9});
    const pk=[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[1],PEN.y[0],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[0],PEN.y[1],ARKA]];
    hasir(P,[-176,150],[196,432],R);
    gunesLekesi(P,pk,GUNES,.34,{parmak:3});
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    // pencere
    pencere(P,isik,ARKA,PEN.x,PEN.y,R,{derin:38,parmak:3});
    // duvardaki çiviler: tüfek askısı ve boş çivi yuvasının çevresi
    tufek(P,214,196);
    // ocak: duvardan çıkıntı yapan sıvalı baca, kemerli ağız, önünde taş ocak taşı
    const yanY=[[O.x[0],0,O.on],[O.x[0],TAVAN,O.on],[O.x[0],TAVAN,ARKA],[O.x[0],0,ARKA]];
    cokgen3(P,yanY,golgele(SIVA,.42)); hat3(P,yanY,MUREKKEP,.5,1.1,801,2,1,true);
    const agiz=[[O.agiz[0],0],[O.agiz[0],-O.agizY+18]];
    for(let i=1;i<=12;i++){const a=Math.PI-i/12*Math.PI; agiz.push([(O.agiz[0]+O.agiz[1])/2+Math.cos(a)*(O.agiz[1]-O.agiz[0])/2,-O.agizY+18-Math.sin(a)*22]);}
    agiz.push([O.agiz[1],0]);
    c.save(); tabana(); c.beginPath(); c.rect(0,0,1000,750); duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,O.on],DUZLEM.arka,[O.x[0],O.x[1],-TAVAN,0],golgele(SIVA,.97),R,{is:.35,yama:0,catlak:2});
    duzlemde(P,[0,0,O.on],DUZLEM.arka,()=>{leke(85,-120,48,60,[0,0,0],.45); leke(85,-170,60,70,[0,0,0],.25);}); // is
    c.restore();
    // ocak ağzının içi: isli, dipte kül ve yarı yanmış odun
    c.save(); tabana(); c.beginPath(); duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz); c.fillStyle='rgb(18,16,14)'; c.fill(); c.clip();
    const ai=P.n(85,40,ARKA-4); leke(ai[0],ai[1]+30,60,40,[70,66,58],.5);
    duzlemde(P,[85,0,ARKA-8],DUZLEM.arka,()=>{for(let i=0;i<40;i++){c.fillStyle=`rgba(${120+R()*60|0},${116+R()*50|0},${100+R()*40|0},${.25+R()*.35})`; c.beginPath(); c.ellipse((R()-.5)*60,-R()*6,2+R()*5,1+R()*2,0,0,TAU); c.fill();}});
    hat3(P,[[56,6,470],[112,10,500]],[30,24,18],1,5,810,1,.3); hat3(P,[[66,4,505],[110,12,476]],[40,32,24],1,4.4,811,1,.3);
    c.restore();
    titrek(()=>duzlemYol(P,[0,0,O.on],DUZLEM.arka,agiz,false),MUREKKEP,.8,1.4,812,2,1.2);
    hat3(P,[[O.x[0],0,O.on],[O.x[0],TAVAN,O.on]],MUREKKEP,.6,1.2,813,2,1);
    kutuDoku(P,isik,[O.x[0]-4,O.x[1]+4],[118,126],[O.on-10,O.on],golgele(AHSAP,.9),815,{doku:'tahta',en:8}); // ocak rafı
    // rafta bakır kap ve şamdan karaltısı
    torna(P,isik,56,O.on-5,[[4,126],[7,128],[7.6,134],[5,140],[2.4,143],[2.6,150],[3.6,152]],BAKIR,816,{dilim:18,ustRenk:[20,16,12]}); // güğüm
    torna(P,isik,128,O.on-5,[[5,126],[5,127.5],[1.4,129],[1.2,140],[3.6,141],[3.6,143]],golgele(BAKIR,.9),817,{dilim:14,ustRenk:[30,24,18]}); // şamdan
    kutuDoku(P,isik,[O.x[0]-8,O.x[1]+8],[0,9],[450,O.on],[150,144,128],818,{doku:'tas',cizgi:.55}); // ocak taşı
    // sedirler
    sedir(P,-1,300,ARKA,R,830);
    sedir(P,1,300,ARKA,R,860);
    // sini ve cezve takımı (önde, kadraj sağ alttan keser)
    silindir(P,isik,SINI.x,SINI.z+16,10,0,22,golgele(AHSAP,.8),880,{cizgi:.5}); // sini ayağı
    silindir(P,isik,SINI.x,SINI.z,SINI.r,22,25,BAKIR,881,{cizgi:.6,ustRenk:golgele(BAKIR,1.05),dilim:40});
    const sU=daire3(SINI.x,25.2,SINI.z,SINI.r-3);
    c.save(); c.beginPath(); yol3(P,sU); c.clip(); const sm=P.n(SINI.x,25,SINI.z); const so=P.olcek(SINI.x,25,SINI.z);
    leke(sm[0]-so*8,sm[1]-so*4,so*16,so*5,[240,226,190],.5); for(let i=1;i<4;i++){c.strokeStyle='rgba(40,26,14,.35)'; c.lineWidth=.8; c.beginPath(); yol3(P,daire3(SINI.x,25.2,SINI.z,(SINI.r-3)*i/4)); c.stroke();}
    c.restore();
    const cezve=(x,z,rr,h,t)=>{ // geniş dip, boğumlu boyun, ağız dudağı; uzun sap
      torna(P,isik,x,z,[[rr*.9,25],[rr,25+h*.15],[rr*.95,25+h*.45],[rr*.72,25+h*.78],[rr*.7,25+h*.86],[rr*.86,25+h]],golgele(BAKIR,.85),t,{dilim:18,ustRenk:[22,18,14]});
      hat3(P,[[x-rr*.8,25+h*.8,z],[x-rr-16,25+h+4,z+5]],[30,24,18],1,2.4,t+1,1,.3);
      kenarIsigi(P,[x-rr*.55,25+h*.2,z-rr*.8],[x-rr*.5,25+h*.75,z-rr*.6],R,{alfa:.6,parca:2});};
    cezve(SINI.x+10,SINI.z-4,5.5,11,890); cezve(SINI.x-4,SINI.z+14,4.5,9,893);
    for(const [x,z] of[[SINI.x+16,SINI.z+16],[SINI.x+22,SINI.z+6],[SINI.x-14,SINI.z-10]]){ // zarflı fincan
      torna(P,isik,x,z,[[1.4,25],[2.6,25.4],[2.8,27.4],[3.1,30]],golgele(BAKIR,.7),900+x,{dilim:14,cizgi:.45,ustRenk:[220,214,196]});
      const f=P.n(x,30.1,z), o=P.olcek(x,30,z); c.fillStyle='rgba(16,12,10,.9)'; c.beginPath(); c.ellipse(f[0],f[1],2.2*o,1*o,0,0,TAU); c.fill();}
    // ön sağda kenarda dibek taşı (kahve dövülen taş havan), kadraj keser
    silindir(P,isik,168,222,20,0,40,[140,134,118],905,{cizgi:.6,ustRenk:[120,114,100]});
    { const d=P.n(168,40.2,222), o=P.olcek(168,40,222); c.fillStyle='rgba(10,10,8,.85)'; c.beginPath(); c.ellipse(d[0],d[1],10*o,10*o*.45,0,0,TAU); c.fill(); }
    hat3(P,[[160,38,224],[146,96,240]],golgele(AHSAP,.7),1,4,906,1,.4); // tokmak
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    // pencereden giren ışık huzmesi
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(-163,170,ARKA), b=P.n(-90,0,320), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(140,136,116,.16)'); g.addColorStop(1,'rgba(140,136,116,0)');
    c.beginPath(); yol3(P,[[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1]+90,0,270],[PEN.x[0]+60,0,280]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[1000,90,240,200,.42],[0,740,200,140,.3],[1000,740,240,150,.32],[0,60,180,160,.25]]);
  }
};
