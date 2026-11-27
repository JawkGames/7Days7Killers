// İç mekân ortak yardımcıları: köy evleri, köy odası, okul, karakol, bakkal, konak, cami içi.
// Yüzeyler (badana, tahta, yekpare taş, taş döşeme), dokulu kutu, pencere ve güneş lekesi, torna işi dönel cisim,
// oda kabuğu (duvarlar, kirişli tavan, kapı/pencere boşluğu, niş), ışık düşmesi ve huzme; ev eşyası (minder, kilim,
// yatak yığını, sandık, teneke, gaz lambası, şişe, tas, güğüm). Hepsi tek ışık kaynağına (isik) göre gölgelenir.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba,clamp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {kutu,cokgen3,hat3,yol3,aydinlik,golgele,tabana} from './kalem.js';
import {DUZLEM} from './perspektif.js';
import {duzlemde,duzlemYol,duzlemNoktasi,dunya,tasOrgu,aydinlikBosluk,leke,tara,titrek,MUREKKEP,yuzNormal,duzlemCizgi,kenarIsigi} from './mekan-yardim.js';

/* ─────────────── yüzeyler ─────────────── */

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

// Badanalı (kireçli) sıva duvar. Tek giriş, iki biçim:
//  - yamalar: [[x,y,w,h], ...] verilirse sıvası dökülmüş yamalar tam o yerlere açılır (ev biçimi: kirli, isli köy evi);
//  - verilmezse yama (sayı) ve yamaBoy ile rastgele küçük yamalar, kireç fırça izleri (oda biçimi: köy odası, okul, karakol).
// İki biçim tohumlu rastgeleyi farklı sırayla çağırır; eski fotoğraflar aynı çıksın diye ayrı tutuldu.
export function badanaDuvar(P,isik,O,D,alan,renk,r,o={}){
  if(Array.isArray(o.yamalar)) return badanaEv(P,isik,O,D,alan,renk,r,o);
  return badanaOda(P,isik,O,D,alan,renk,r,o);
}
function badanaOda(P,isik,O,D,[x0,x1,y0,y1],renk,r,{is=0,yama=1,yamaBoy=1,catlak=5}={}){
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

/* ─────────────── yumuşak eşya ─────────────── */

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

// Yere serili kilim: kenar şeridi, ortada baklava gözler, uçlarda saçak. Köşeler dünya noktası (zemin)
export function kilimSer(P,isik,[x0,x1],[z0,z1],renk,r,{Y=0,t=1}={}){
  const q=[[x0,Y,z0],[x1,Y,z0],[x1,Y,z1],[x0,Y,z1]];
  const a=aydinlik(isik,[(x0+x1)/2,Y,(z0+z1)/2],[0,1,0]);
  cokgen3(P,q,golgele(renk,a));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  const ic=(p,k,al)=>cokgen3(P,[[x0+p,Y,z0+p],[x1-p,Y,z0+p],[x1-p,Y,z1-p],[x0+p,Y,z1-p]],k,al);
  ic(5,golgele([60,36,30],a),1); ic(10,golgele(renk,a*1.05),1); ic(13,golgele([180,150,100],a),.5); ic(15,golgele(renk,a*.95),1);
  // baklavalar ve kancalar
  const gz=26, mx=(x0+x1)/2;
  for(let z=z0+15+gz/2;z<z1-15;z+=gz) for(let x=mx-Math.floor((x1-x0-30)/gz/2)*gz;x<=x1-15-gz/2+.1;x+=gz){
    const b=[[x,Y,z-gz*.42],[x+gz*.42,Y,z],[x,Y,z+gz*.42],[x-gz*.42,Y,z]];
    cokgen3(P,b,golgele(((x+z)/gz|0)%2?[150,60,44]:[40,44,60],a),.85);
    cokgen3(P,b.map(([bx,by,bz])=>[x+(bx-x)*.45,by,z+(bz-z)*.45]),golgele([200,176,120],a),.7);
  }
  // aşınma: ortası yürünmüş, soluk
  const s=P.n(mx,Y,(z0+z1)/2), o=P.olcek(mx,Y,(z0+z1)/2);
  leke(s[0],s[1],(x1-x0)*o*.3,(z1-z0)*o*.18,[170,160,130],.25);
  for(let i=0;i<10;i++){const p=P.n(x0+r()*(x1-x0),Y,z0+r()*(z1-z0)); leke(p[0],p[1],10+r()*30,4+r()*10,[0,0,0],.12+r()*.1);}
  tara(...[0,0,1000,750],.3,3,[0,0,0],.12,t,.5);
  c.restore();
  hat3(P,q,MUREKKEP,.5,1,t+1,2,.8,true);
  for(const z of[z0,z1]) for(let x=x0+2;x<x1;x+=3){const p=P.n(x,Y,z), e=P.n(x+(r()-.5)*2,Y,z+(z===z0?-1:1)*(4+r()*3)); c.strokeStyle='rgba(190,176,140,.45)'; c.lineWidth=.8; c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(e[0],e[1]); c.stroke();}
}

/* ─────────────── köy evi: oda kabuğu ve eşya ─────────────── */

export const RENK_EV={
  badana:[168,160,138], tas:[138,128,108], toprak:[120,108,88], ahsap:[104,88,66], kiris:[92,78,60],
  cuval:[134,122,96], deri:[92,72,52], teneke:[150,148,138], bakir:[150,104,70], kumas:[126,112,96]
};
const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

// Odanın kabuğu: arka ve yan duvarlar (sıvalı ya da moloz), deliklerle (kapı, pencere, niş yerleri) kesilmiş.
// o: {sol, sag, arka, tavan, on, renk, kaplama:'siva'|'tas', is, delik:{arka:[yerel nokta dizisi...], sol:[...], sag:[...]}}
export function odaDuvarlari(P,isik,R,o){
  const {sol,sag,arka,tavan,on=60,renk=RENK_EV.badana,kaplama='siva',is=0,delik={},duzensiz=.5,yama={},catlak=5}=o;
  const duvar=(ad,O,D,alan,del)=>{
    c.save(); tabana();
    if(del&&del.length){c.beginPath(); c.rect(-60,-60,1120,870); for(const d of del) duzlemYol(P,O,D,d); c.clip('evenodd');}
    if(kaplama==='siva') badanaDuvar(P,isik,O,D,alan,renk,R,{is,yamalar:yama[ad]||[],catlak});
    else tasOrgu(P,isik,O,D,alan,renk,R,{sira:19,duzensiz,harc:[40,36,30]});
    c.restore();
  };
  duvar('arka',[0,0,arka],DUZLEM.arka,[sol,sag,-tavan,0],delik.arka);
  duvar('sol',[sol,0,0],DUZLEM.sol,[on,arka,-tavan,0],delik.sol);
  duvar('sag',[sag,0,0],DUZLEM.sag,[-arka,-on,-tavan,0],delik.sag);
}

// Ev biçimi badana (badanaDuvar yamalar verilince bunu çağırır): ışık ızgarası, is, akıntı lekeleri, birkaç çatlak;
// sıvası dökülmüş yamalar yalnızca istenen yerde (yamalar: [[x,y,w,h]] yerel cm, y = -yükseklik)
function badanaEv(P,isik,O,D,[x0,x1,y0,y1],renk,R,{is=0,yamalar=[],catlak=5}={}){
  const u=D.u, v=D.v, n0=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const nn=(-O[0])*n0[0]+(P.yukseklik-O[1])*n0[1]+(-O[2])*n0[2]>0?n0:[-n0[0],-n0[1],-n0[2]];
  const dn=(x,y)=>[O[0]+u[0]*x+v[0]*y,O[1]+u[1]*x+v[1]*y,O[2]+u[2]*x+v[2]*y];
  const kose=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]], sk=kose.map(q=>P.n(...dn(...q)));
  c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kose); c.clip();
  c.fillStyle=rgba(golgele(renk,isik.ortam*1.5),1); c.fill();
  const adim=36;
  for(let x=x0;x<x1;x+=adim) for(let y=y0;y<y1;y+=adim){
    const w=dn(x+adim/2,y+adim/2), a=aydinlik(isik,w,nn)*(1-is*clamp(1+(y+adim/2)/240,0,1)*.6), s=P.n(...w), o=P.olcek(...w);
    leke(s[0],s[1],adim*o*1.15,adim*o*1.15,golgele(renk,a*1.2),.6);
  }
  // badana akıntısı, el izi lekeleri, dipte nem (koyu kuşak)
  for(let i=0;i<14;i++){const x=x0+R()*(x1-x0), y=y0+R()*(y1-y0), s=P.n(...dn(x,y)), o=P.olcek(...dn(x,y)); leke(s[0],s[1],(20+R()*50)*o,(16+R()*40)*o,R()<.65?[0,0,0]:golgele(renk,1.25),.06+R()*.1);}
  for(let x=x0;x<x1;x+=30){const s=P.n(...dn(x+15,-14)), o=P.olcek(...dn(x+15,-14)); leke(s[0],s[1],34*o,(16+R()*14)*o,[0,0,0],.16);}
  for(let i=0;i<catlak;i++){let x=x0+20+R()*(x1-x0-40), y=y0+20+R()*(y1-y0-60); const yol=[];
    for(let k=0;k<6;k++){yol.push(P.n(...dn(x,y))); x+=(R()-.5)*16; y+=4+R()*9;}
    titrek(()=>{yol.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));},MUREKKEP,.45,1,(R()*1e5)|0,1,.6);}
  tara(Math.min(...sk.map(q=>q[0])),Math.min(...sk.map(q=>q[1])),Math.max(...sk.map(q=>q[0])),Math.max(...sk.map(q=>q[1])),.6,7,MUREKKEP,.14,(R()*1e5)|0,1);
  c.restore();
  for(const [cx,cy,w,h] of yamalar){
    const kenar=Array.from({length:13},(_,k)=>{const t=k/13*Math.PI*2, f=.62+R()*.42; return [cx+Math.cos(t)*w*f,cy+Math.sin(t)*h*f];});
    c.save(); tabana(); c.beginPath(); duzlemYol(P,O,D,kenar); c.clip();
    tasOrgu(P,isik,O,D,[cx-w,cx+w,cy-h,cy+h],golgele(renk,.9),R,{sira:12,harc:golgele(renk,.42),duzensiz:.5});
    // derinlik: sıvanın kalınlığı üst kenarda gölge bırakır; yama duvarın genel ışığına yaklaştırılır
    const ms=P.n(...dn(cx,cy)), mo=P.olcek(...dn(cx,cy));
    leke(ms[0],ms[1],w*mo*1.1,h*mo*1.1,golgele(renk,aydinlik(isik,dn(cx,cy),nn)),.35);
    leke(ms[0],ms[1]-h*mo*.7,w*mo*.9,h*mo*.35,[0,0,0],.35);
    c.restore(); tabana();
    c.save(); c.translate(0,1.2); titrek(()=>duzlemYol(P,O,D,kenar),golgele(renk,1.6),.5,1.4,(R()*1e5)|0,1,.5); c.restore();
    titrek(()=>duzlemYol(P,O,D,kenar),MUREKKEP,.5,.9,(R()*1e5)|0,2,1);
  }
}

// Yumuşak kutu (denk, döşek, minder, çuval balya): görünen köşelerin dış zarfı yuvarlatılmış; üst yüz ışık alır.
// Dönüş: görünen yüz dörtgenleri (üstüne urgan, dikiş, şerit çizmek için)
export function yumusakKutu(P,isik,R,X,Y,Z,renk,t,{yuvarlak=.22,cizgi=.75}={}){
  const yz=kutuYuzleri(P,X,Y,Z), nok=[];
  for(const q of Object.values(yz)) for(const p of q) nok.push(P.n(...p));
  nok.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), alt=[], ust=[];
  for(const p of nok){while(alt.length>1&&cr(alt[alt.length-2],alt[alt.length-1],p)<=0) alt.pop(); alt.push(p);}
  for(const p of nok.slice().reverse()){while(ust.length>1&&cr(ust[ust.length-2],ust[ust.length-1],p)<=0) ust.pop(); ust.push(p);}
  const zarf=alt.slice(0,-1).concat(ust.slice(0,-1)), n=zarf.length;
  const yol=()=>{for(let i=0;i<n;i++){const a=zarf[(i+n-1)%n], b=zarf[i], d=zarf[(i+1)%n];
    const p0=[b[0]+(a[0]-b[0])*yuvarlak,b[1]+(a[1]-b[1])*yuvarlak], p1=[b[0]+(d[0]-b[0])*yuvarlak,b[1]+(d[1]-b[1])*yuvarlak];
    if(i) c.lineTo(p0[0],p0[1]); else c.moveTo(p0[0],p0[1]); c.quadraticCurveTo(b[0],b[1],p1[0],p1[1]);} c.closePath();};
  const m=[(X[0]+X[1])/2,(Y[0]+Y[1])/2,(Z[0]+Z[1])/2];
  tabana(); c.beginPath(); yol(); c.fillStyle=rgba(golgele(renk,aydinlik(isik,[m[0],m[1],Z[0]],[0,0,-1])),1); c.fill();
  c.save(); c.clip();
  if(yz.ust) cokgen3(P,yz.ust,golgele(renk,Math.min(1.25,aydinlik(isik,[m[0],Y[1],m[2]],[0,1,0])*1.1)));
  if(yz.yan) cokgen3(P,yz.yan,golgele(renk,aydinlik(isik,[yz.yan[0][0],m[1],m[2]],[X[1]<0?1:-1,0,0])));
  const s=P.n(m[0],m[1],Z[0]), o=P.olcek(m[0],m[1],Z[0]), w=(X[1]-X[0])*o, h=(Y[1]-Y[0])*o;
  leke(s[0]-w*.12,s[1]-h*.15,w*.32,h*.35,golgele(renk,1.35),.35);   // şişkinlik ışığı
  leke(s[0],s[1]+h*.55,w*.65,h*.3,[0,0,0],.5);                      // alt kıvrım
  const ue=P.n(m[0],Y[1],Z[0]); leke(ue[0],ue[1],w*.45,h*.12,golgele(renk,1.5),.3); // ön üst kenar parlar
  c.restore();
  if(cizgi) titrek(yol,MUREKKEP,cizgi,1.3,t,2,.9);
  return yz;
}

// Duvar dibi ve köşelerde koyu kenar (zemin-duvar birleşimi, köşe dikmeleri)
export function odaKenarlari(P,{sol,sag,arka,tavan,on=60}){
  tabana();
  const cizgi=(a,b,k,al)=>{const s0=P.n(...a), s1=P.n(...b); c.strokeStyle=`rgba(0,0,0,${al})`; c.lineWidth=k; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();};
  cizgi([sol,0,arka],[sag,0,arka],7,.5); cizgi([sol,0,on],[sol,0,arka],7,.5); cizgi([sag,0,on],[sag,0,arka],7,.5);
  cizgi([sol,0,arka],[sol,tavan,arka],5,.35); cizgi([sag,0,arka],[sag,tavan,arka],5,.35);
  hat3(P,[[sol,0,arka],[sol,tavan,arka]],MUREKKEP,.5,1.1,3301,2,1.2); hat3(P,[[sag,0,arka],[sag,tavan,arka]],MUREKKEP,.5,1.1,3302,2,1.2);
  hat3(P,[[sol,0,on],[sol,0,arka],[sag,0,arka],[sag,0,on]],MUREKKEP,.4,1.2,3303,2,1.4);
}

// Kirişli tavan: yuvarlak kavak kirişleri (Z boyunca, makineden arka duvara), üstlerinde sık dizilmiş çubuklar (hezen).
// kirisX: kirişlerin X yerleri. sarkma(x,z): kirişin o noktada kaç cm sarktığı (eski evlerde). Tavan isle kararmış.
export function tavanCiz(P,isik,R,{sol,sag,arka,on=60,y,kirisX=[],renk=RENK_EV.kiris,cubuk=8,sarkma=null,kirik=[]}){
  const q=[[sol,y,on],[sag,y,on],[sag,y,arka],[sol,y,arka]];
  tabana(); cokgen3(P,q,golgele(renk,.18));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  // çubuklar: X boyunca; her biri gölgeli bir şerit, alt yanı ışığı alır
  for(let z=on+R()*cubuk; z<arka; z+=cubuk*(.75+R()*.5)){
    if(kirik.some(([z0,z1])=>z>z0&&z<z1)) continue; // dökülmüş yer: çubuk yok, üstteki toprak görünür
    const o=P.olcek(0,y,z), a=aydinlik(isik,[0,y,z],[0,-1,0]), sk=(R()-.5)*1.5;
    const yol=()=>{const s0=P.n(sol,y,z), s1=P.n((sol+sag)/2,y-1.5+sk,z), s2=P.n(sag,y,z); c.moveTo(s0[0],s0[1]); c.quadraticCurveTo(s1[0],s1[1],s2[0],s2[1]);};
    c.beginPath(); yol(); c.strokeStyle=rgba(golgele(renk,.25+a*.75*(.8+R()*.4)),1); c.lineWidth=Math.max(1,cubuk*.72*o); c.stroke();
    c.beginPath(); yol(); c.strokeStyle=rgba(golgele(renk,.12),.7); c.lineWidth=Math.max(.6,cubuk*.12*o); c.stroke();
  }
  for(const [z0,z1] of kirik){ // dökük yer: kara delik, sarkan saz
    const d=[[sol+60,y+2,z0],[sag-80,y+2,z0],[sag-90,y+2,z1],[sol+80,y+2,z1]];
    cokgen3(P,d,[16,14,12]);
    for(let i=0;i<26;i++){const x=sol+70+R()*(sag-sol-160), z=z0+R()*(z1-z0); hat3(P,[[x,y,z],[x+(R()-.5)*8,y-6-R()*16,z+(R()-.5)*6]],[110,100,80],.6,1,3320+i,1,.6);}
  }
  c.restore();
  // kirişler: alt yarım silindir, şeritlerle
  for(const [k,x] of kirisX.entries()){
    const rr=9+R()*3, n=14, dil=6, sz=z=>sarkma?sarkma(x,z):0;
    for(let i=0;i<n;i++){
      const za=on+(arka-on)*i/n, zb=on+(arka-on)*(i+1)/n;
      for(let j=0;j<dil;j++){
        const a0=j/dil*Math.PI, a1=(j+1)/dil*Math.PI, am=(a0+a1)/2, nn=[Math.cos(am),-Math.sin(am),0];
        const p=(a,z)=>[x+Math.cos(a)*rr,y-rr-sz(z)-Math.sin(a)*rr,z];
        const m=[x+nn[0]*rr,y-rr-sz((za+zb)/2)+nn[1]*rr,(za+zb)/2];
        const goz=[-m[0],P.yukseklik-m[1],-m[2]]; if(nn[0]*goz[0]+nn[1]*goz[1]<=0) continue;
        cokgen3(P,[p(a0,za),p(a1,za),p(a1,zb),p(a0,zb)],golgele(renk,.3+.8*aydinlik(isik,m,nn)*(.9+((i*7+j)%3)*.05)));
      }
    }
    // kenar hatları ve damar
    const kenar=s=>Array.from({length:n+1},(_,i)=>{const z=on+(arka-on)*i/n; return [x+s*rr,y-rr-sz(z),z];});
    hat3(P,kenar(x<0?1:-1),MUREKKEP,.7,1.3,3340+k,2,1);
    hat3(P,Array.from({length:n+1},(_,i)=>{const z=on+(arka-on)*i/n; return [x,y-2*rr-sz(z),z];}),MUREKKEP,.35,1,3350+k,1,.8);
    for(let i=0;i<3;i++){const z0=on+R()*(arka-on-80), a=.6+R()*1.8; hat3(P,[[x+Math.cos(a)*rr,y-rr-sz(z0)-Math.sin(a)*rr,z0],[x+Math.cos(a)*rr,y-rr-sz(z0+50)-Math.sin(a)*rr,z0+50+R()*40]],[20,16,12],.5,.9,3360+k*5+i,1,.6);}
  }
  // tavanla duvarın birleştiği yer: koyu kuşak
  hat3(P,[[sol,y,on],[sol,y,arka],[sag,y,arka],[sag,y,on]],[0,0,0],.55,4,3370,1,0);
}

// Duvardaki dikdörtgen ya da kemerli delik (yerel nokta dizisi, duvar yerelinde: x yatay, y = -yükseklik)
export function bosluk(x0,x1,y0,y1,kemer=0){
  const n=[[x0,-y0],[x0,-(y1-kemer)]];
  if(kemer>0) for(let i=1;i<12;i++){const a=Math.PI-i/12*Math.PI; n.push([(x0+x1)/2+Math.cos(a)*(x1-x0)/2,-(y1-kemer)-Math.sin(a)*kemer]);}
  n.push([x1,-(y1-kemer)],[x1,-y0]); return n;
}
// duvar adı ve yerel (a: duvar boyunca, y: yükseklik, d: duvarın içine derinlik) → dünya noktası
export function duvarNoktasi(duvar,duz,a,y,d=0){
  if(duvar==='arka') return [a,y,duz+d];
  if(duvar==='sol') return [duz-d,y,a];
  return [duz+d,y,a];
}
const DUZ_AD={arka:DUZLEM.arka, sol:DUZLEM.sol, sag:DUZLEM.sag};
const duvarO=(duvar,duz)=>duvar==='arka'?[0,0,duz]:[duz,0,0];
// yerel duvar x'i (duzlemYol için): sağ duvarda yerel x = -Z
const yerelA=(duvar,a)=>duvar==='sag'?-a:a;

// Kapı ya da pencere boşluğu: dışarısı aşırı pozlanmış, iç söve (duvar kalınlığı) ışığı alır.
// duvar: 'arka'|'sol'|'sag', duz: duvarın düzlem değeri (arka Z, sol/sag X), a0..a1 duvar boyunca, y0..y1 yükseklik.
// aydinlik:false ise içerisi karanlıktır (iç ahır, kiler). kalin: duvar kalınlığı.
export function duvarBoslugu(P,isik,R,{duvar,duz,a0,a1,y0,y1,kalin=50,aydin=true,kemer=0,renk=RENK_EV.badana,cerceve=null}){
  const N=(a,y,d)=>duvarNoktasi(duvar,duz,a,y,d), O=duvarO(duvar,duz), D=DUZ_AD[duvar];
  const yerel=bosluk(yerelA(duvar,a0),yerelA(duvar,a1),y0,y1,kemer);
  tabana(); c.save(); c.beginPath(); duzlemYol(P,O,D,yerel); c.clip();
  if(aydin) aydinlikBosluk(P,[N(a0,y0,kalin+40),N(a0,y1,kalin+40),N(a1,y1,kalin+40),N(a1,y0,kalin+40)],R);
  else{c.fillStyle='rgb(10,10,8)'; c.fillRect(-50,-50,1100,850);}
  // görünen iç söve: makineye bakan yan
  const ax=duvar==='arka'?(a0>0?a1:a0):a1;
  const sv=[N(ax,y0,0),N(ax,y0,kalin),N(ax,y1,kalin),N(ax,y1,0)];
  const sAydin=aydin?.75:.2;
  cokgen3(P,sv,golgele(renk,sAydin));
  c.save(); c.beginPath(); yol3(P,sv); c.clip(); const sm=P.n(...N(ax,(y0+y1)/2,kalin*.3)); leke(sm[0],sm[1],40,120,[0,0,0],.35); tara(sm[0]-60,sm[1]-200,sm[0]+60,sm[1]+200,1.3,5,MUREKKEP,.3,(R()*1e5)|0,.8); c.restore();
  // lento altı (yüksekse) ya da pencere içi (alçaksa)
  if(y1>P.yukseklik) cokgen3(P,[N(a0,y1,0),N(a1,y1,0),N(a1,y1,kalin),N(a0,y1,kalin)],golgele(renk,aydin?.35:.12));
  if(y0>2&&y0<P.yukseklik) cokgen3(P,[N(a0,y0,0),N(a1,y0,0),N(a1,y0,kalin),N(a0,y0,kalin)],golgele(renk,aydin?.95:.25));
  if(cerceve) cerceve(N);
  c.restore();
  // ahşap lento ve mürekkep kenar
  kutu(P,isik,...lentoKutusu(duvar,duz,a0,a1,y1),RENK_EV.ahsap,(R()*1e5)|0,{ust:false,cizgi:.5});
  tabana(); titrek(()=>duzlemYol(P,O,D,yerel,false),MUREKKEP,.75,1.4,(R()*1e5)|0,2,1.2);
  if(aydin){const m=P.n(...N((a0+a1)/2,(y0+y1)/2,0)); leke(m[0],m[1],110,150,[220,214,190],.18);} // ışık taşması
}
function lentoKutusu(duvar,duz,a0,a1,y1){
  if(duvar==='arka') return [[a0-14,a1+14],[y1,y1+14],[duz-3,duz+2]];
  if(duvar==='sol') return [[duz-2,duz+3],[y1,y1+14],[a0-14,a1+14]];
  return [[duz-3,duz+2],[y1,y1+14],[a0-14,a1+14]];
}

// Boşluktan zemine düşen ışık: dört köşe (zemin noktaları) ve ışığın başladığı/bittiği iki nokta
// Kenarı yumuşak olsun diye merkezine doğru küçülen beş katman üst üste binilir.
export function isikDusmesi(P,dortgen,bas,son,alfa=.55,renk=[130,124,102]){
  const m=dortgen.reduce((a,q)=>[a[0]+q[0]/dortgen.length,a[1]+q[1]/dortgen.length,a[2]+q[2]/dortgen.length],[0,0,0]);
  const a=P.n(...bas), b=P.n(...son);
  tabana(); c.save(); c.globalCompositeOperation='lighter';
  for(const f of[1.08,.98,.88,.76,.62]){
    c.save(); c.beginPath(); yol3(P,dortgen.map(q=>lerp3(m,q,f))); c.clip();
    const g=c.createLinearGradient(a[0],a[1],b[0],b[1]); g.addColorStop(0,rgba(renk,alfa*.24)); g.addColorStop(1,rgba(renk,0)); c.fillStyle=g; c.fillRect(0,0,1000,750);
    c.restore();
  }
  c.restore();
}
// Havada ışık huzmesi (ustCiz için): ekranda dörtgen, açık toz
export function huzme(P,r,dortgen,bas,son,alfa=.16,toz=120){
  tabana(); c.save(); c.globalCompositeOperation='screen';
  c.beginPath(); yol3(P,dortgen); c.clip();
  const a=P.n(...bas), b=P.n(...son), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
  g.addColorStop(0,`rgba(130,126,108,${alfa})`); g.addColorStop(1,'rgba(130,126,108,0)'); c.fillStyle=g; c.fillRect(0,0,1000,750);
  const xs=dortgen.map(q=>P.n(...q)[0]), ys=dortgen.map(q=>P.n(...q)[1]), x0=Math.min(...xs), y0=Math.min(...ys), w=Math.max(...xs)-x0, h=Math.max(...ys)-y0;
  for(let i=0;i<toz;i++){c.fillStyle=`rgba(225,220,200,${.05+r()*.14})`; c.fillRect(x0+r()*w,y0+r()*h,1,1);}
  c.restore();
}

// Dörtgen yüzeye (3B) doku: q0→q1 boyunca uzanan, q0→q3 boyunca dizilen çizgiler (tahta damarı, kumaş dokusu, yorgan dikişi)
export function yuzDoku(P,q,R,{sik=10,renk=MUREKKEP,alfa=.35,kalin=.8,dalga=.6,lek=3}={}){
  tabana(); c.save(); c.beginPath(); yol3(P,q); c.clip();
  for(let i=0;i<sik;i++){
    const t=(i+.3+R()*.5)/sik, a=lerp3(q[0],q[3],t), b=lerp3(q[1],q[2],t), m=lerp3(a,b,.3+R()*.4);
    const sa=P.n(...a), sb=P.n(...b), sm=P.n(...m);
    titrek(()=>{c.moveTo(sa[0],sa[1]); c.quadraticCurveTo(sm[0]+(R()-.5)*dalga*4,sm[1]+(R()-.5)*dalga*4,sb[0],sb[1]);},renk,alfa,kalin,(R()*1e5)|0,1,.5);
  }
  const xs=q.map(p=>P.n(...p)), mx=xs.reduce((s,p)=>s+p[0]/4,0), my=xs.reduce((s,p)=>s+p[1]/4,0);
  const ex=Math.max(...xs.map(p=>p[0]))-Math.min(...xs.map(p=>p[0])), ey=Math.max(...xs.map(p=>p[1]))-Math.min(...xs.map(p=>p[1]));
  for(let i=0;i<lek;i++) leke(mx+(R()-.5)*ex*.8,my+(R()-.5)*ey*.8,ex*(.1+R()*.2),ey*(.1+R()*.2),R()<.6?[0,0,0]:[200,190,160],.12+R()*.12);
  c.restore();
}
// Kutunun görünen yüzleri (kalem.kutu ile aynı sıra) için dörtgenler
export function kutuYuzleri(P,[x0,x1],[y0,y1],[z0,z1]){
  const y={on:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]]};
  if(y1<P.yukseklik) y.ust=[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
  if(x1<0) y.yan=[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]];
  if(x0>0) y.yan=[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]];
  return y;
}
// Yere oturan her şeyin altına: yumuşak temas gölgesi (ışığın tersine kaymış)
export function tabanGolgesi(P,isik,x0,x1,z0,z1,alfa=.6,uzun=.5){
  const m=[(x0+x1)/2,0,(z0+z1)/2], L=isik.konum, d=[m[0]-L[0],m[2]-L[2]], u=Math.hypot(...d)||1;
  const k=[m[0]+d[0]/u*(x1-x0)*uzun*.5,0,m[2]+d[1]/u*(z1-z0)*uzun*.5], s=P.n(...k), o=P.olcek(...k);
  tabana(); leke(s[0],s[1],((x1-x0)*.75+12)*o,((z1-z0)*.3+6)*o,[0,0,0],alfa);
  const s2=P.n(...m); leke(s2[0],s2[1]+2,((x1-x0)*.55+4)*o,((z1-z0)*.18+3)*o,[0,0,0],alfa*.8);
}

// Ahşap sandık: demir şeritli, kapağın çizgisi, kilit plakası. eski: kenarları kırık, renk soluk
export function sandik(P,isik,R,x,z,{en=96,boy=48,h=52,renk=RENK_EV.ahsap,eski=0,tohum=1}={}){
  const X=[x-en/2,x+en/2], Y=[0,h], Z=[z-boy/2,z+boy/2];
  tabanGolgesi(P,isik,X[0],X[1],Z[0],Z[1],.65);
  kutu(P,isik,X,Y,Z,renk,tohum,{cizgi:.7});
  const y=kutuYuzleri(P,X,Y,Z);
  yuzDoku(P,y.on,R,{sik:6,alfa:.3+eski*.2,lek:3+eski*4});
  if(y.ust) yuzDoku(P,y.ust,R,{sik:5,alfa:.25,lek:2});
  if(y.yan) yuzDoku(P,y.yan,R,{sik:5,alfa:.3,lek:2});
  hat3(P,[[X[0],h-10,Z[0]-.5],[X[1],h-10,Z[0]-.5]],MUREKKEP,.7,1.2,tohum+5,2,.8); // kapak çizgisi
  for(const f of[.12,.88]){const xx=X[0]+en*f; cokgen3(P,[[xx-3,0,Z[0]-.6],[xx+3,0,Z[0]-.6],[xx+3,h,Z[0]-.6],[xx-3,h,Z[0]-.6]],golgele([60,58,54],.6+eski*.2)); if(y.ust) cokgen3(P,[[xx-3,h+.3,Z[0]],[xx+3,h+.3,Z[0]],[xx+3,h+.3,Z[1]],[xx-3,h+.3,Z[1]]],[50,48,44]);}
  cokgen3(P,[[x-6,h-22,Z[0]-.8],[x+6,h-22,Z[0]-.8],[x+6,h-8,Z[0]-.8],[x-6,h-8,Z[0]-.8]],[70,66,58]); // kilit
  const k=P.n(x,h-15,Z[0]-1); tabana(); c.fillStyle='rgba(8,8,6,.9)'; c.fillRect(k[0]-.8,k[1]-1.5,1.6,3);
  // alt kenarda aşınma, köşede çatlak
  hat3(P,[[X[0]+8,2,Z[0]],[X[0]+20,10,Z[0]],[X[0]+16,20,Z[0]]],MUREKKEP,.4+eski*.3,1,tohum+9,1,.6);
  return {X,Y,Z};
}

// Yatak yığını (döşek, yorgan, yastık): üst üste yumuşak katmanlar; her katın önü çizgili ya da düz
export function yatakYigini(P,isik,R,x,z,katlar,{en=120,boy=70,tohum=1}={}){
  let y=0;
  for(const [i,k] of katlar.entries()){
    const kx=x+(R()-.5)*10, e=(k.en||en)*(.94+R()*.08), b=(k.boy||boy)*(.92+R()*.08);
    const X=[kx-e/2,kx+e/2], Z=[z-b/2,z+b/2], Y=[y,y+k.h];
    if(!i) tabanGolgesi(P,isik,X[0],X[1],Z[0],Z[1],.6);
    const yz=yumusakKutu(P,isik,R,X,Y,Z,k.renk,tohum+i*3,{yuvarlak:.3,cizgi:.65});
    tabana(); c.save(); c.beginPath(); yol3(P,yz.on); c.clip();
    if(k.desen==='serit') for(let s=1;s<7;s++){const xx=X[0]+(X[1]-X[0])*(s/7)+(R()-.5)*3; hat3(P,[[xx,Y[0]+1,Z[0]-.3],[xx+(R()-.5)*2,Y[1]-1,Z[0]-.3]],golgele(k.renk,.4),.85,Math.max(1.4,2.6*P.olcek(xx,y,Z[0])),tohum+i*11+s,1,.3);}
    if(k.desen==='dikis') for(let s=1;s<4;s++){const xx=X[0]+(X[1]-X[0])*s/4; hat3(P,[[xx,Y[0]+2,Z[0]-.3],[xx,Y[1]-2,Z[0]-.3]],MUREKKEP,.35,.7,tohum+i*17+s,1,.3);}
    c.restore();
    y+=k.h*(.92+R()*.05);
  }
  return y;
}

// Gazyağı tenekesi (kare, 24×24×35): kenar kabartmaları, tepede kapak ve tel kulp. yatik: yan yatmış
export function teneke(P,isik,R,x,z,{y=0,en=24,h=35,renk=RENK_EV.teneke,tohum=1,ezik=0}={}){
  const X=[x-en/2,x+en/2], Y=[y,y+h], Z=[z-en/2,z+en/2];
  if(!y) tabanGolgesi(P,isik,X[0],X[1],Z[0],Z[1],.55,.8);
  kutu(P,isik,X,Y,Z,renk,tohum,{cizgi:.6});
  const yz=kutuYuzleri(P,X,Y,Z);
  for(const f of[.18,.82]){hat3(P,[[X[0],y+h*f,Z[0]-.2],[X[1],y+h*f,Z[0]-.2]],[20,20,18],.45,1,tohum+2+f*10,1,.3); if(yz.yan){const sx=yz.yan[0][0]; hat3(P,[[sx,y+h*f,Z[0]],[sx,y+h*f,Z[1]]],[20,20,18],.4,1,tohum+4+f*10,1,.3);}}
  tabana(); c.save(); c.beginPath(); yol3(P,yz.on); c.clip();
  const m=P.n(x,y+h/2,Z[0]), o=P.olcek(x,y,Z[0]);
  leke(m[0]-en*.25*o*(isik.konum[0]<x?1:-1),m[1],en*.18*o,h*.5*o,[235,232,220],.35); // metal parıltısı
  for(let i=0;i<2+ezik*3;i++) leke(m[0]+(R()-.5)*en*o,m[1]+(R()-.5)*h*.6*o,(3+R()*5)*o,(3+R()*6)*o,[0,0,0],.3+R()*.2); // ezik, pas
  c.restore();
  if(yz.ust){ // kapak ve kulp
    const k=P.n(X[1]-6,Y[1],Z[0]+7), ko=P.olcek(X[1]-6,Y[1],Z[0]+7);
    tabana(); c.fillStyle='rgb(40,38,34)'; c.beginPath(); c.ellipse(k[0],k[1]-1.5*ko,2.6*ko,1.5*ko,0,0,TAU); c.fill();
    hat3(P,[[X[0]+4,Y[1],z],[x,Y[1]+5,z],[X[1]-4,Y[1],z]],[30,30,28],.7,1,tohum+8,1,.4);
  }
  return Y[1];
}

// Gaz lambası (ekrana paralel çizilir, küçük nesne): ayak, hazne, fitil düğmesi, şişe. yanik: alev ve parıltı
export function gazLambasi(P,X,Y,Z,{yanik=false,olc=1,tohum=1}={}){
  const s=P.n(X,Y,Z), o=P.olcek(X,Y,Z)*olc;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(0,0,9,2.2,[0,0,0],.6);
  const govde=()=>{c.moveTo(-6,0); c.lineTo(6,0); c.lineTo(4.4,-2); c.lineTo(2.4,-3); c.quadraticCurveTo(8.5,-6,7.5,-10.5); c.quadraticCurveTo(6,-14,2.4,-14.5); c.lineTo(2.4,-16); c.lineTo(-2.4,-16); c.lineTo(-2.4,-14.5); c.quadraticCurveTo(-6,-14,-7.5,-10.5); c.quadraticCurveTo(-8.5,-6,-2.4,-3); c.lineTo(-4.4,-2); c.closePath();};
  c.beginPath(); govde(); c.fillStyle=yanik?'rgb(120,96,60)':'rgb(70,66,56)'; c.fill();
  c.save(); c.clip(); leke(-3,-10,3,4,[230,220,190],yanik?.7:.35); leke(4,-7,4,6,[0,0,0],.4); c.restore();
  titrek(govde,MUREKKEP,.8,.5,tohum,2,.4);
  c.fillStyle='rgb(50,46,40)'; c.fillRect(-3.4,-18,6.8,2.2); c.fillRect(3.4,-17.6,2,1.2); // fitil kovanı ve düğme
  const sise=()=>{c.moveTo(-2.6,-18); c.quadraticCurveTo(-6.2,-21,-5.6,-25); c.quadraticCurveTo(-5,-28,-2.2,-30); c.lineTo(-2.1,-37); c.lineTo(2.1,-37); c.lineTo(2.2,-30); c.quadraticCurveTo(5,-28,5.6,-25); c.quadraticCurveTo(6.2,-21,2.6,-18); c.closePath();};
  c.beginPath(); sise(); c.fillStyle=yanik?'rgba(255,236,190,.75)':'rgba(150,150,140,.25)'; c.fill();
  if(yanik){c.save(); c.beginPath(); sise(); c.clip(); leke(0,-23.5,3,5.5,[255,252,235],1); leke(0,-22,5,7,[255,230,170],.6); c.restore();}
  else{c.save(); c.beginPath(); sise(); c.clip(); leke(0,-31,4,6,[20,18,14],.5); c.restore();} // isli şişe
  titrek(sise,yanik?[150,120,80]:[210,206,190],.6,.4,tohum+1,2,.3);
  c.strokeStyle='rgba(240,236,220,.55)'; c.lineWidth=.6; c.beginPath(); c.moveTo(-3.8,-21); c.quadraticCurveTo(-4.6,-25,-3,-28); c.stroke();
  c.restore();
  return [s[0],s[1]-27*o];
}

// Duvar nişi (arka duvarda kemerli oyuk): içi karanlık, tabanı ve görünen yanı ışık alır. Dönüş: niş tabanının ortası
export function nis(P,isik,R,{duz,x0,x1,y0,y1,derin=30,kemer=0,renk=RENK_EV.badana}){
  const O=[0,0,duz], D=DUZLEM.arka, yerel=bosluk(x0,x1,y0,y1,kemer);
  tabana(); c.save(); c.beginPath(); duzlemYol(P,O,D,yerel); c.clip();
  c.fillStyle=rgba(golgele(renk,.16),1); c.fillRect(-50,-50,1100,850);
  const ic=[[x0,y0,duz+derin],[x1,y0,duz+derin],[x1,y1,duz+derin],[x0,y1,duz+derin]];
  cokgen3(P,ic,golgele(renk,aydinlik(isik,[(x0+x1)/2,(y0+y1)/2,duz+derin],[0,0,-1])*.55));
  if(y0<P.yukseklik) cokgen3(P,[[x0,y0,duz],[x1,y0,duz],[x1,y0,duz+derin],[x0,y0,duz+derin]],golgele(renk,aydinlik(isik,[(x0+x1)/2,y0,duz+derin/2],[0,1,0])*.95));
  const ax=x0>0?x1:x0, sv=[[ax,y0,duz],[ax,y0,duz+derin],[ax,y1,duz+derin],[ax,y1,duz]];
  cokgen3(P,sv,golgele(renk,aydinlik(isik,[ax,(y0+y1)/2,duz+derin/2],[x0>0?-1:1,0,0])*.8));
  const t=P.n((x0+x1)/2,y1,duz); leke(t[0],t[1],(x1-x0)*P.olcek(0,y1,duz)*.7,40,[0,0,0],.55); // üst gölgede
  c.restore();
  tabana(); titrek(()=>duzlemYol(P,O,D,yerel,false),MUREKKEP,.75,1.3,(R()*1e5)|0,2,1);
  return [(x0+x1)/2,y0,duz+derin/2];
}

// Ekrana paralel küçük şişe (niş, raf): gövde, boyun, mantar; ışık kenarı
export function sise(P,X,Y,Z,{h=22,w=7,ton=.5,tohum=1,sol=true}={}){
  const s=P.n(X,Y,Z), o=P.olcek(X,Y,Z);
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(0,0,w*.9,1.6,[0,0,0],.5);
  const y=()=>{c.moveTo(-w/2,0); c.lineTo(-w/2,-h*.6); c.quadraticCurveTo(-w/2,-h*.72,-w*.18,-h*.78); c.lineTo(-w*.16,-h*.95); c.lineTo(w*.16,-h*.95); c.lineTo(w*.18,-h*.78); c.quadraticCurveTo(w/2,-h*.72,w/2,-h*.6); c.lineTo(w/2,0); c.closePath();};
  c.beginPath(); y(); c.fillStyle=rgba([110*ton+20,108*ton+20,96*ton+18],1); c.fill();
  c.save(); c.clip(); leke((sol?-1:1)*w*.25,-h*.4,w*.12,h*.3,[235,232,215],.55); leke(0,-h*.15,w*.5,h*.2,[0,0,0],.3); c.restore();
  c.fillStyle='rgb(80,66,50)'; c.fillRect(-w*.17,-h,w*.34,h*.07);
  titrek(y,MUREKKEP,.7,.5,tohum,2,.3);
  c.restore();
}

// Ekrana paralel tas/kase (yerde ya da rafta): ağız elipsi, gövde, içinde süt ya da boş
export function tas(P,isik,X,Y,Z,{r=9,h=5,ic=null,tohum=1,renk=[150,140,120]}={}){
  const s=P.n(X,Y,Z), o=P.olcek(X,Y,Z), e=.42;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(1.5,0,r*1.25,r*e*1.2,[0,0,0],.55);
  c.beginPath(); c.moveTo(-r,-h); c.quadraticCurveTo(-r*.9,0,0,0); c.quadraticCurveTo(r*.9,0,r,-h); c.ellipse(0,-h,r,r*e,0,0,Math.PI,true); c.closePath();
  c.fillStyle=rgba(golgele(renk,.7),1); c.fill(); c.save(); c.clip(); leke(-r*.4,-h*.5,r*.35,h*.6,golgele(renk,1.4),.5); c.restore();
  c.beginPath(); c.ellipse(0,-h,r,r*e,0,0,TAU); c.fillStyle=rgba(golgele(renk,.35),1); c.fill();
  if(ic){c.beginPath(); c.ellipse(0,-h+.4,r*.82,r*e*.78,0,0,TAU); c.fillStyle=rgba(ic,1); c.fill();}
  titrek(()=>{c.ellipse(0,-h,r,r*e,0,0,TAU);},MUREKKEP,.7,.5,tohum,2,.3);
  titrek(()=>{c.moveTo(-r,-h); c.quadraticCurveTo(-r*.9,0,0,0); c.quadraticCurveTo(r*.9,0,r,-h);},MUREKKEP,.6,.5,tohum+1,1,.3);
  c.restore();
}

// Duvarda çivi/ağaç çivi (yerel düzlem çerçevesinde çizilir)
export function agacCivi(x,y){c.fillStyle='rgba(0,0,0,.45)'; c.fillRect(x+.5,y+1.5,3,2.5); c.fillStyle='rgb(70,58,44)'; c.fillRect(x-1.5,y-1.5,3.5,3.5); c.fillStyle='rgba(200,180,140,.5)'; c.fillRect(x-1.5,y-1.5,3.5,1);}

// Bakır güğüm (ekrana paralel): şişkin gövde, dar boyun, ağız, kulp, emzik
export function gugum(P,X,Z,{y=0,olc=1,tohum=1,renk=RENK_EV.bakir,isikSol=true}={}){
  const s=P.n(X,y,Z), o=P.olcek(X,y,Z)*olc;
  tabana(); c.save(); c.translate(s[0],s[1]); c.scale(o,o);
  leke(isikSol?4:-4,0,18,4,[0,0,0],.6);
  const g=()=>{c.moveTo(-7,0); c.quadraticCurveTo(-15,-2,-15,-13); c.quadraticCurveTo(-15,-24,-6,-28); c.lineTo(-4,-36); c.lineTo(-6,-39); c.lineTo(6,-39); c.lineTo(4,-36); c.lineTo(6,-28); c.quadraticCurveTo(15,-24,15,-13); c.quadraticCurveTo(15,-2,7,0); c.closePath();};
  c.beginPath(); g(); c.fillStyle=rgba(golgele(renk,.6),1); c.fill();
  c.save(); c.clip(); const k=isikSol?-1:1; leke(k*7,-16,4,10,[245,220,180],.55); leke(-k*8,-12,9,14,[0,0,0],.45); for(let i=0;i<4;i++){c.strokeStyle='rgba(20,12,8,.35)'; c.lineWidth=.5; c.beginPath(); c.ellipse(0,-6-i*6,15-Math.abs(i-1.5)*1.5,2,0,0,Math.PI); c.stroke();} c.restore();
  titrek(g,MUREKKEP,.8,.6,tohum,2,.4);
  titrek(()=>{c.moveTo(-5,-34); c.bezierCurveTo(-22,-38,-24,-16,-13,-10);},golgele(renk,.5),.95,2.2,tohum+1,1,.2); // kulp
  titrek(()=>{c.moveTo(12,-20); c.quadraticCurveTo(20,-24,23,-31);},golgele(renk,.55),.95,2.4,tohum+2,1,.2);     // emzik
  c.restore();
}
