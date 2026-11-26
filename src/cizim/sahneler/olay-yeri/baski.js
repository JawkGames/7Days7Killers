// Kâğıt baskı: sahneyi gümüş baskı tonuna çevirir, yüzey yıpranmasını ekler, tırtıklı beyaz kenarı ve köşe kıvrımını kurar.
import {TAU,clamp,rgba,lerp} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {TON,KAGIT,FOTO} from './ayar.js';

// Renkli sahneyi neredeyse renksiz baskıya çevirir (yerinde). Gölge küflü yeşile, ışık kirli sarıya kayar.
export function tonla(k,w,h,tohum){
  const d=k.getImageData(0,0,w,h), p=d.data, r=rng(tohum*7+3), ton=new Array(256);
  for(let i=0;i<256;i++){
    let t=Math.pow(i/255,TON.gama);
    t=t*t*(3-2*t)*.35+t*.65; // hafif S eğrisi
    const a=t<.5?TON.kara:TON.orta, b=t<.5?TON.orta:TON.acik, u=t<.5?t*2:(t-.5)*2;
    ton[i]=[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
  }
  for(let i=0;i<p.length;i+=4){
    const l=clamp((p[i]*.3+p[i+1]*.59+p[i+2]*.11+(r()-.5)*TON.kum)|0,0,255), t=ton[l];
    p[i]=t[0]; p[i+1]=t[1]; p[i+2]=t[2];
  }
  k.putImageData(d,0,0);
}

// Baskının yüzünde: kenar kararması, soluk kimyasal leke, toz, kıl çizikler. k: fotoğraf biriminde dönüşümlü bağlam
export function yipranma(k,tohum){
  const W=FOTO.genislik, H=FOTO.yukseklik, r=rng(tohum*13+5);
  // mercek kararması
  let g=k.createRadialGradient(W*.5,H*.47,H*.28,W*.5,H*.5,W*.68);
  g.addColorStop(0,'rgba(8,9,7,0)'); g.addColorStop(.7,'rgba(8,9,7,.38)'); g.addColorStop(1,'rgba(8,9,7,.82)');
  k.fillStyle=g; k.fillRect(0,0,W,H);
  // soluklaşma: banyo eşit yayılmamış, bir köşe sararmış
  const sx=r()<.5?W*.06:W*.94, sy=r()<.5?H*.1:H*.9;
  g=k.createRadialGradient(sx,sy,0,sx,sy,W*.45); g.addColorStop(0,'rgba(150,138,98,.16)'); g.addColorStop(1,'rgba(150,138,98,0)');
  k.fillStyle=g; k.fillRect(0,0,W,H);
  // genel solukluk: siyahlar griye çalar
  k.fillStyle='rgba(120,116,96,.06)'; k.fillRect(0,0,W,H);
  // toz ve kıl: negatif üstündeki toz baskıda açık leke olur
  for(let i=0;i<70;i++){
    const x=r()*W, y=r()*H, a=.05+r()*.18, s=.4+r()*1.4;
    k.fillStyle=r()<.75?`rgba(214,206,176,${a})`:`rgba(5,5,4,${a*.8})`;
    k.beginPath(); k.arc(x,y,s,0,TAU); k.fill();
  }
  k.lineCap='round';
  for(let i=0;i<6;i++){
    const x=r()*W, y=r()*H, u=8+r()*30, a=r()*TAU;
    k.strokeStyle=`rgba(210,202,170,${.08+r()*.12})`; k.lineWidth=.5+r()*.5;
    k.beginPath(); k.moveTo(x,y); k.quadraticCurveTo(x+Math.cos(a)*u*.5+(r()-.5)*10,y+Math.sin(a)*u*.5+(r()-.5)*10,x+Math.cos(a)*u,y+Math.sin(a)*u); k.stroke();
  }
  // uzun ince çizikler (baskı masalarda sürüklenmiş)
  for(let i=0;i<4;i++){
    const x=r()*W, y=r()*H, a=r()*TAU, u=80+r()*260;
    k.strokeStyle=`rgba(200,194,166,${.05+r()*.07})`; k.lineWidth=.4+r()*.5;
    k.beginPath(); k.moveTo(x,y); k.lineTo(x+Math.cos(a)*u,y+Math.sin(a)*u); k.stroke();
  }
}

// Tırtıklı (deckle) kenar yolu: baskının dış çizgisi. Kıvrılan köşe ayrıca kesilir.
function kenarNoktalari(w,h,r){
  const n=[], dis=(x,y)=>n.push([x,y]);
  const kenar=(x0,y0,x1,y1,nx,ny)=>{
    const u=Math.hypot(x1-x0,y1-y0), adim=7.5;
    for(let t=0;t<u;t+=adim){
      const f=t/u, d=(r()<.5?1:0)*1.6+r()*.8;
      dis(lerp(x0,x1,f)-nx*d,lerp(y0,y1,f)-ny*d);
      dis(lerp(x0,x1,f+adim*.5/u)-nx*(.2+r()*.5),lerp(y0,y1,f+adim*.5/u)-ny*(.2+r()*.5));
    }
  };
  kenar(0,0,w,0,0,-1); kenar(w,0,w,h,1,0); kenar(w,h,0,h,0,1); kenar(0,h,0,0,-1,0);
  return n;
}

// Baskıyı kurar. resim: tonlanmış fotoğraf tuvali; R: birim başına piksel. Döner: {tuval, kivrim}
export function kagitKur(resim,R,tohum){
  const K=FOTO.kenar, W=FOTO.genislik+K*2, H=FOTO.yukseklik+K*2, r=rng(tohum*29+11);
  const t=document.createElement('canvas'); t.width=Math.ceil(W*R); t.height=Math.ceil(H*R);
  const k=t.getContext('2d'); k.setTransform(R,0,0,R,0,0);
  // kıvrılan köşe ve kıvrım çizgisi
  const kose=r()*4|0, b1=48+r()*26, b2=40+r()*24;
  const koseN=[[0,0],[W,0],[W,H],[0,H]][kose];
  const yonX=kose===0||kose===3?1:-1, yonY=kose<2?1:-1;
  const A=[koseN[0]+yonX*b1,koseN[1]], B=[koseN[0],koseN[1]+yonY*b2]; // kıvrım çizgisinin uçları
  const kenar=kenarNoktalari(W,H,r);
  const disarida=(q)=>{ // kıvrımın köşe tarafında mı?
    const s=(B[0]-A[0])*(q[1]-A[1])-(B[1]-A[1])*(q[0]-A[0]), s0=(B[0]-A[0])*(koseN[1]-A[1])-(B[1]-A[1])*(koseN[0]-A[0]);
    return s*s0>0;
  };
  const sekil=()=>{k.beginPath(); kenar.forEach((q,i)=>i?k.lineTo(q[0],q[1]):k.moveTo(q[0],q[1])); k.closePath();};
  // kesim: tam dikdörtgen eksi köşe üçgeni (kıvrılan köşe artık kanat olarak çizilir)
  k.save();
  const D=[[-10,-10],[W+10,-10],[W+10,H+10],[-10,H+10]];
  const ucgen=[[A[0]+(A[0]-B[0])*.2,A[1]+(A[1]-B[1])*.2],[koseN[0]-yonX*12,koseN[1]-yonY*12],[B[0]+(B[0]-A[0])*.2,B[1]+(B[1]-A[1])*.2]];
  k.beginPath(); k.moveTo(D[0][0],D[0][1]); for(const q of D.slice(1)) k.lineTo(q[0],q[1]); k.closePath();
  k.moveTo(ucgen[0][0],ucgen[0][1]); k.lineTo(ucgen[1][0],ucgen[1][1]); k.lineTo(ucgen[2][0],ucgen[2][1]); k.closePath();
  k.clip('evenodd');
  // kâğıt
  sekil(); k.fillStyle=rgba(KAGIT.on,1); k.fill();
  k.save(); sekil(); k.clip();
  // kâğıt sararması ve kir
  for(let i=0;i<14;i++){
    const x=r()*W, y=r()*H, rr=30+r()*140, g=k.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,rgba(KAGIT.kir,.05+r()*.09)); g.addColorStop(1,rgba(KAGIT.kir,0)); k.fillStyle=g; k.fillRect(x-rr,y-rr,rr*2,rr*2);
  }
  const kg=k.createLinearGradient(0,0,W,H); kg.addColorStop(0,'rgba(90,76,44,.0)'); kg.addColorStop(1,'rgba(90,76,44,.16)'); k.fillStyle=kg; k.fillRect(0,0,W,H);
  // kenara yakın kirlenme (elden ele geçmiş)
  k.strokeStyle='rgba(80,66,40,.12)'; k.lineWidth=10; sekil(); k.stroke();
  // fotoğrafın kendisi; görüntü kenarı da hafif dalgalı
  k.drawImage(resim,K,K,FOTO.genislik,FOTO.yukseklik);
  k.strokeStyle='rgba(30,30,24,.35)'; k.lineWidth=.7; k.strokeRect(K,K,FOTO.genislik,FOTO.yukseklik);
  // kum (kâğıt dokusu)
  for(let i=0;i<900;i++){const x=r()*W, y=r()*H; k.fillStyle=`rgba(${r()<.5?'255,250,230':'40,34,20'},${.03+r()*.05})`; k.fillRect(x,y,.8+r(),.8+r());}
  // kıvrım çizgisinin yanında emülsiyon çatlağı ve kalkmış kâğıdın gölgesi
  const kd=[B[0]-A[0],B[1]-A[1]], kl=Math.hypot(kd[0],kd[1]), nx=-kd[1]/kl, ny=kd[0]/kl;
  const ic=disarida([A[0]+nx*5,A[1]+ny*5])?-1:1; // kıvrımın içe bakan normali
  k.save(); k.beginPath(); k.moveTo(A[0],A[1]); k.lineTo(B[0],B[1]); k.lineTo(B[0]+nx*ic*26,B[1]+ny*ic*26); k.lineTo(A[0]+nx*ic*26,A[1]+ny*ic*26); k.closePath();
  const gg=k.createLinearGradient(A[0],A[1],A[0]+nx*ic*26,A[1]+ny*ic*26); gg.addColorStop(0,'rgba(0,0,0,.32)'); gg.addColorStop(1,'rgba(0,0,0,0)'); k.fillStyle=gg; k.fill(); k.restore();
  k.strokeStyle='rgba(235,228,200,.55)'; k.lineWidth=.9; k.beginPath();
  for(let i=0;i<=12;i++){const f=i/12, x=lerp(A[0],B[0],f)+nx*ic*(1+r()*1.2), y=lerp(A[1],B[1],f)+ny*ic*(1+r()*1.2); if(i)k.lineTo(x,y); else k.moveTo(x,y);} k.stroke();
  k.restore();
  k.restore();
  // kıvrılmış kanat: köşe üçgeninin kıvrım çizgisine göre yansıması, arka yüzü (mat, daha sarı) görünür
  const yansit=q=>{const dx=q[0]-A[0], dy=q[1]-A[1], d=dx*nx+dy*ny; return [q[0]-2*d*nx,q[1]-2*d*ny];};
  const Ky=yansit(koseN), kanat=[A,B,[lerp(B[0],Ky[0],.9),lerp(B[1],Ky[1],.9)],[lerp(A[0],Ky[0],.9),lerp(A[1],Ky[1],.9)]]; // ucu hafif yuvarlanmış
  // kanadın altına düşen gölge
  k.save(); k.filter='blur(3px)'; k.beginPath(); kanat.forEach((q,i)=>i?k.lineTo(q[0]+3,q[1]+4):k.moveTo(q[0],q[1])); k.closePath(); k.fillStyle='rgba(0,0,0,.35)'; k.fill(); k.restore();
  k.beginPath(); kanat.forEach((q,i)=>i?k.lineTo(q[0],q[1]):k.moveTo(q[0],q[1])); k.closePath();
  const kgr=k.createLinearGradient(A[0],A[1],Ky[0],Ky[1]); kgr.addColorStop(0,rgba(KAGIT.arka,1)); kgr.addColorStop(1,rgba([KAGIT.arka[0]*1.08,KAGIT.arka[1]*1.06,KAGIT.arka[2]],1));
  k.fillStyle=kgr; k.fill(); k.strokeStyle='rgba(60,50,30,.35)'; k.lineWidth=.8; k.stroke();
  return {tuval:t, genislik:W, yukseklik:H, kose, kivrim:[A,B]};
}
