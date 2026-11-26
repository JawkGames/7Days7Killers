// Fotoğraf içinde çizim yardımcıları. Teknik araçlar (leke, tara, titrek) fotoğraf koordinatında çalışır;
// buradakiler perspektifli düzlemlerde ve 3B noktalarla çizmeyi kolaylaştırır.
// Ana kural: düzlemde çizilen hattın kalınlığı ekranda sabit kalır (yatay hat ezilip incelmez).
import {c} from '../../teknik/tuval.js';
import {rgba,clamp,TAU} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';

let TABAN=new DOMMatrix(), TABAN_TERS=new DOMMatrix();
// fotoğraf birimini aygıt pikseline çeviren dönüşüm (sahne kurucu ayarlar)
export function tabanAyarla(m){TABAN=DOMMatrix.fromMatrix(m); TABAN_TERS=TABAN.inverse();}
export function tabana(){c.setTransform(TABAN);}

// Titrek mürekkep hattı: yol o anki dönüşümde kurulur, kalınlık fotoğraf biriminde (ekranda sabit) verilir.
export function hat(yol,renk,alfa,kalin,tohum,kat=2,oynama=1.4){
  const M=c.getTransform(), yerel=TABAN_TERS.multiply(M), r=rng(tohum);
  c.lineCap='round'; c.lineJoin='round';
  for(let i=0;i<kat;i++){
    c.setTransform(TABAN.translate((r()-.5)*oynama,(r()-.5)*oynama).multiply(yerel));
    c.beginPath(); yol();
    c.setTransform(TABAN);
    c.strokeStyle=rgba(renk,alfa*(.6+r()*.4)); c.lineWidth=kalin*(.65+r()*.7); c.stroke();
  }
  c.setTransform(M);
}
// Düz dolgu (o anki dönüşümde)
export function dolgu(yol,renk,alfa=1){c.beginPath(); yol(); c.fillStyle=rgba(renk,alfa); c.fill();}

/* ─── 3B yardımcılar (P: kameraKur sonucu, noktalar [X,Y,Z] cm) ─── */
export function yol3(P,noktalar,kapali=true){
  noktalar.forEach((q,i)=>{const s=P.n(q[0],q[1],q[2]); if(i)c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);});
  if(kapali) c.closePath();
}
export function cokgen3(P,noktalar,renk,alfa=1){c.beginPath(); yol3(P,noktalar); c.fillStyle=rgba(renk,alfa); c.fill();}
export function hat3(P,noktalar,renk,alfa,kalin,tohum,kat,oynama,kapali=false){hat(()=>yol3(P,noktalar,kapali),renk,alfa,kalin,tohum,kat,oynama);}

// Tek ışık kaynağı: yüzeyin aldığı ışık (0..1). isik = {konum:[X,Y,Z], guc, menzil, ortam}
export function aydinlik(isik,nokta,normal){
  const d=[isik.konum[0]-nokta[0],isik.konum[1]-nokta[1],isik.konum[2]-nokta[2]], u=Math.hypot(d[0],d[1],d[2])||1;
  const dif=Math.max(0,(d[0]*normal[0]+d[1]*normal[1]+d[2]*normal[2])/u);
  const dus=1/(1+(u/isik.menzil)**2);
  return clamp(isik.ortam+isik.guc*dif*dus,0,1);
}
// Renk × aydınlık (renk [r,g,b])
export const golgele=(renk,a)=>[renk[0]*a,renk[1]*a,renk[2]*a];

// Kutu: [x0,x1] [y0,y1] [z0,z1]. Makineden görünen yüzleri ışığa göre boyar, kenarları mürekkeple çizer.
export function kutu(P,isik,[x0,x1],[y0,y1],[z0,z1],renk,tohum,{cizgi=.55,ust=true}={}){
  const yuzler=[];
  yuzler.push({n:[0,0,-1], q:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]]}); // ön
  if(ust&&y1<P.yukseklik) yuzler.push({n:[0,1,0], q:[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]});
  if(x1<0) yuzler.push({n:[1,0,0], q:[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]]});
  if(x0>0) yuzler.push({n:[-1,0,0], q:[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]});
  for(const y of yuzler){
    const m=y.q.reduce((s,q)=>[s[0]+q[0]/4,s[1]+q[1]/4,s[2]+q[2]/4],[0,0,0]);
    cokgen3(P,y.q,golgele(renk,aydinlik(isik,m,y.n)));
  }
  if(cizgi) for(const [i,y] of yuzler.entries()) hat3(P,y.q,[8,7,10],cizgi,1.3,tohum+i,2,1.6,true);
  return yuzler;
}

// Dik silindir (kütük, değirmen taşı, örs ayağı): merkez [X,Z], yarıçap, y0..y1
export function silindir(P,isik,X,Z,yc,y0,y1,renk,tohum,{dilim=28,cizgi=.55,ustRenk=null}={}){
  const halka=y=>Array.from({length:dilim},(_,i)=>{const a=i/dilim*TAU; return [X+Math.cos(a)*yc,y,Z+Math.sin(a)*yc];});
  const alt=halka(y0), ust=halka(y1), seritler=[];
  for(let i=0;i<dilim;i++){
    const j=(i+1)%dilim, a=(i+.5)/dilim*TAU, n=[Math.cos(a),0,Math.sin(a)];
    const m=[X+n[0]*yc,(y0+y1)/2,Z+n[2]*yc];
    // makineye bakan yüz (normal ile makineye yön ters değilse)
    const goz=[-m[0],P.yukseklik-m[1],-m[2]]; if(n[0]*goz[0]+n[2]*goz[2]<=0) continue;
    seritler.push({q:[alt[i],alt[j],ust[j],ust[i]], m, n});
  }
  seritler.sort((a,b)=>P.derinlik(...b.m)-P.derinlik(...a.m));
  for(const s of seritler) cokgen3(P,s.q,golgele(renk,aydinlik(isik,s.m,s.n)));
  if(y1<P.yukseklik) cokgen3(P,ust,golgele(ustRenk||renk,aydinlik(isik,[X,y1,Z],[0,1,0])));
  if(cizgi){
    hat3(P,ust,[8,7,10],cizgi,1.2,tohum,2,1.4,true);
    // dış kenarlar: görünen yayın iki ucu + alt yay
    const gorunen=alt.filter((q,i)=>{const n=[Math.cos(i/dilim*TAU),0,Math.sin(i/dilim*TAU)]; return n[0]*(-q[0])+n[2]*(-q[2])>0;});
    if(gorunen.length>1) hat3(P,gorunen.sort((a,b)=>P.n(...a)[0]-P.n(...b)[0]),[8,7,10],cizgi*.9,1.2,tohum+1,2,1.4);
  }
  return {alt,ust};
}

// Yerdeki bölgeyi (zemin düzleminde dörtgen) doldur
export const zeminDortgen=(P,x0,x1,z0,z1,y=0)=>[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]];
