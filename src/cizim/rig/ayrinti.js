// Yüzdeki küçük ayrıntılar (yalnızca yeni yol, G.ozel): gözlük, perdeli göz, yara izi, ben, kırık burun,
// un ya da is lekesi, dinlenme hâlindeki gülümseme kırışığı. Hepsi yüz koordinatlarında: göz merkezleri (±gozAralik, 0),
// burun ucu ~110, ağız ~150 (+ağız kayması), çene ~215. Işık soldan-yukarıdan gelir.
import {c} from '../teknik/tuval.js';
import {leke,titrek} from '../teknik/firca.js';
import {PAL} from '../teknik/palet.js';
import {TAU,hex,rgba,clamp} from '../../cekirdek/matematik.js';
import {rng} from '../../cekirdek/rastgele.js';
import {poz} from './poz.js';
import {G,karistir} from './gorunus.js';

const dz=k=>typeof k==='string'?hex(k):k;

/* ───────── perdeli göz: göz kırpılmışken, iris yerine çizilir (göz koordinatları) ───────── */
export function perdeliGoz(ix,iy,ust){
  const F=G.gozFarki, A=F.renk?dz(F.renk):[176,178,168];
  let g=c.createRadialGradient(ix-2,iy-1,1,ix,iy,13);
  g.addColorStop(0,rgba(karistir(A,'#e4e0d0',.35),1)); g.addColorStop(.55,rgba(A,1));
  g.addColorStop(.9,rgba(karistir(A,[40,40,38],.4),1)); g.addColorStop(1,rgba(karistir(A,[0,0,0],.6),.8));
  c.fillStyle=g; c.beginPath(); c.arc(ix,iy,12.5,0,TAU); c.fill();
  c.fillStyle='rgba(110,110,102,.3)'; c.beginPath(); c.arc(ix+.5,iy+.5,4.2,0,TAU); c.fill(); // bulanık, seçilmeyen gözbebeği
  leke(ix-1,iy,24,14,[214,212,198],.42); // bütün göze yayılan süt perdesi
  for(let i=0;i<3;i++){c.strokeStyle=rgba([226,222,206],.28); c.lineWidth=1; c.beginPath(); c.arc(ix,iy,5+i*2.6,-.4+i,.9+i); c.stroke();} // perdenin damarlı bulanıklığı
  g=c.createLinearGradient(0,ust-4,0,ust+22); g.addColorStop(0,'rgba(6,5,8,.95)'); g.addColorStop(1,'rgba(6,5,8,0)');
  c.fillStyle=g; c.fillRect(-36,-26,72,48);
  c.fillStyle=rgba([236,230,210],.35*poz.isik); c.beginPath(); c.ellipse(ix-3,iy-4,2.8,1.8,-.3,0,TAU); c.fill(); // donuk, yayvan parıltı
}

/* ───────── tel çerçeveli yuvarlak gözlük (göz ve kaştan sonra) ───────── */
export function gozluk(fx){
  const Z=G.gozluk, Y=G.yuz, e=Y.en, ga=Y.gozAralik, k=poz.kaynama, I=poz.isik, M=dz(Z.renk);
  const rx=(Z.en||1)*38*Y.gozEn, ry=(Z.en||1)*34, cy=Z.y==null?2:Z.y;
  // çerçevenin ve camın yanağa düşen gölgesi
  for(const s of[-1,1]){const x=s*ga+fx;
    c.save(); c.strokeStyle='rgba(4,3,5,.3)'; c.lineWidth=3.2; c.beginPath(); c.ellipse(x+4,cy+8,rx,ry,0,.15,Math.PI-.15); c.stroke(); c.restore();}
  for(const s of[-1,1]){
    const x=s*ga+fx;
    c.save(); c.beginPath(); c.ellipse(x,cy,rx,ry,0,0,TAU); c.clip();
    // cam: kenarı kalınlıktan koyu, ışık yanında çapraz yansıma
    c.lineWidth=7; c.strokeStyle='rgba(10,10,12,.2)'; c.beginPath(); c.ellipse(x,cy,rx,ry,0,0,TAU); c.stroke();
    const p=s<0?1:.35;
    leke(x-10,cy-12,26,10,[205,210,198],.16*p*I,-.7);
    c.lineCap='round';
    c.strokeStyle=rgba([226,228,214],.42*p*I); c.lineWidth=3.4;
    c.beginPath(); c.moveTo(x-rx*.62,cy+ry*.2); c.lineTo(x-rx*.02,cy-ry*.7); c.stroke();
    c.strokeStyle=rgba([226,228,214],.25*p*I); c.lineWidth=1.4;
    c.beginPath(); c.moveTo(x-rx*.32,cy+ry*.42); c.lineTo(x+rx*.2,cy-ry*.5); c.stroke();
    c.restore();
    // çerçeve: ince, titrek tel
    titrek(()=>{c.ellipse(x,cy,rx,ry,0,0,TAU);},M,.95,2.3,960+s+k,2,.9);
    c.strokeStyle=rgba([196,184,150],.5*I*(s<0?1:.5)); c.lineWidth=1; c.beginPath(); c.ellipse(x,cy,rx-.6,ry-.6,0,Math.PI*1.08,Math.PI*1.5); c.stroke(); // telin parıltısı
    // sap: menteşeden şakağa, kulağa doğru (yüzün yanından geçer)
    const hx=x+s*rx, ux=s*(Y.en*150);
    titrek(()=>{c.moveTo(hx,cy-6); c.quadraticCurveTo((hx+ux)/2,cy-14,ux,cy-12);},M,s<0?.9:.7,2.2,964+s+k,2,1);
    c.strokeStyle='rgba(4,3,5,.25)'; c.lineWidth=2.4; c.beginPath(); c.moveTo(hx+s*4,cy-1); c.quadraticCurveTo((hx+ux)/2,cy-7,ux,cy-5); c.stroke(); // sapın şakağa gölgesi
    c.fillStyle=rgba(M,1); c.beginPath(); c.arc(hx,cy-5,2.4,0,TAU); c.fill(); // menteşe
  }
  // köprü: burnun üstünden kavisle
  titrek(()=>{c.moveTo(-ga+rx*.9+fx,cy-9); c.quadraticCurveTo(fx,cy-22,ga-rx*.9+fx,cy-9);},M,.95,2.3,968+k,2,.9);
  void e;
}

/* ───────── yara izi, ben (çizgilerden sonra) ───────── */
export function izler(fx,mx,dyA){
  const R=G.renk, k=poz.kaynama;
  G.iz.forEach((z,i)=>{
    const x=(z.x||0)+fx*.7, y=(z.y||0)+(z.agiz?dyA:0);
    if(z.tur==='yara'){
      const L=(z.boy||60)/2, a=z.aci||0, cx=Math.cos(a)*L, sy=Math.sin(a)*L, b=z.egri||6;
      // çekmiş ten: uçlara doğru incelen, eni değişen soluk şerit; bir yanında çöküntü gölgesi, kaşı ve kirpiği böler
      const nk=14, nokta=t=>{const q=1-t, px=q*q*(x-cx)+2*q*t*(x+b*Math.sin(a))+t*t*(x+cx), py=q*q*(y-sy)+2*q*t*(y-b*Math.cos(a))+t*t*(y+sy); return [px,py];};
      const rr=rng(970+i); c.save(); c.lineCap='round';
      for(let j=0;j<nk;j++){const [x0,y0]=nokta(j/nk), [x1,y1]=nokta((j+1)/nk), w=(z.gen||1)*(1.2+2.8*Math.sin((j+.5)/nk*Math.PI))*(.7+rr()*.6);
        c.strokeStyle=rgba(R.tenDerin,.3); c.lineWidth=w+2; c.beginPath(); c.moveTo(x0+1.6,y0+1); c.lineTo(x1+1.6,y1+1); c.stroke();
        c.strokeStyle=rgba(karistir(R.tenIsik,[186,140,124],.3),.6); c.lineWidth=w; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke();
        c.strokeStyle=rgba(karistir(R.tenIsik,[220,196,176],.3),.25*poz.isik); c.lineWidth=w*.35; c.beginPath(); c.moveTo(x0-.6,y0-.6); c.lineTo(x1-.6,y1-.6); c.stroke();}
      c.restore();
      c.setLineDash([L*.3,8,L*.5,14]); titrek(()=>{const [x0,y0]=nokta(.08); c.moveTo(x0+3,y0); for(let j=1;j<=10;j++){const [px,py]=nokta(.08+j*.084); c.lineTo(px+3,py);}},PAL.murekkep,.32,1,980+i+k,2,1); c.setLineDash([]);
      if(z.dikis){ // eski dikiş izleri: yaranın iki yanında kısa enine çentikler
        const n=Math.max(3,Math.round(L/9));
        titrek(()=>{for(let j=1;j<n;j++){const t=j/n*2-1, px=x+cx*t+b*Math.sin(a)*(1-t*t)*.5, py=y+sy*t-b*Math.cos(a)*(1-t*t)*.5;
          c.moveTo(px-Math.sin(a)*6,py+Math.cos(a)*6); c.lineTo(px+Math.sin(a)*6,py-Math.cos(a)*6);}},PAL.murekkep,.5,1.1,984+i+k,2,1);
      }
    } else if(z.tur==='ben'){
      const r=z.r||4;
      leke(x+1,y+1,r*1.6,r*1.4,R.tenDerin,.35);
      c.fillStyle=rgba(karistir(R.tenDerin,'#3a2418',.5),.92); c.beginPath(); c.ellipse(x,y,r,r*.88,.3,0,TAU); c.fill();
      c.fillStyle=rgba(karistir(R.tenIsik,[255,240,210],.2),.35*poz.isik); c.beginPath(); c.arc(x-r*.35,y-r*.35,r*.35,0,TAU); c.fill();
      if(z.kil){c.strokeStyle=rgba(R.sacKoyu,.7); c.lineWidth=.8; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+3,y+5,x+2,y+10); c.stroke();}
    }
  });
}

/* ───────── kırık burun: kemerin üstünde çıkıntı, uç bir yana kaymış (burun dönüşümünün içinde) ───────── */
export function kirikBurun(nx,z){
  const k=poz.kaynama, R=G.renk, d=(z.yon||1)*(z.guc==null?1:z.guc)*6, g=z.guc==null?1:z.guc;
  leke(16+nx+g*3,30,7,9,R.tenIsik,.3*poz.isik); leke(22+nx+d*.5,46,9,12,R.tenDerin,.45); // çıkıntının ışığı ve altındaki çukur
  titrek(()=>{c.moveTo(12+nx,-14); c.quadraticCurveTo(13+nx,10,19+nx+g*5,30); c.quadraticCurveTo(19+nx+d*.4,44,18+nx+d*.6,56);
    c.bezierCurveTo(21+nx+d,72,26+nx+d,86,27+nx+d,96); c.bezierCurveTo(30+nx+d,108,22+nx+d*.6,114,12+nx+d*.3,112);},PAL.murekkep,.75,1.6,520+k,2,1.8);
  titrek(()=>{c.moveTo(-5+nx,22); c.quadraticCurveTo(-1+nx+g*2,30,-4+nx,40);},PAL.murekkep,.35,1.1,524+k,2,1.2); // öbür yandaki kırık hattı
}

/* ───────── dinlenme hâlinde ağız köşesi: gülümseme ya da düşük köşe kırışığı ───────── */
export function gulumseme(mx,W,cL,cR){
  const I=G.ifade, k=poz.kaynama, R=G.renk;
  for(const s of[-1,1]){
    const ak=I.agizKose+poz.agizKose, ay=I.agizYan+poz.agizYan; // dinlenme ifadesi + anlık ifade
    const y=s<0?cL:cR, x=mx+s*W, up=ak+(s<0?-ay:ay)*.85;
    if(up>.15){ // gülen köşe: köşede çukur, üstünde yanak elması kabarır, yanaktan inen gülme çizgisi
      titrek(()=>{c.moveTo(x+s*1,y-14*up); c.quadraticCurveTo(x+s*10,y-2,x+s*4,y+12*up);},PAL.murekkep,.6*clamp(up,0,1),1.4,990+s+k,2,1.2);
      titrek(()=>{c.moveTo(x+s*10,y-46); c.quadraticCurveTo(x+s*22,y-20,x+s*14,y+6);},PAL.murekkep,.35*clamp(up,0,1),1.2,994+s+k,2,1.6);
      leke(x+s*24,y-34,26,14,R.tenIsik,.26*up*poz.isik*(s<0?1:.35));
      leke(x+s*8,y+2,6,9,R.tenDerin,.45*up);
    } else if(up<-.15){ // düşük köşe: köşeden aşağı inen kısa çizgi
      titrek(()=>{c.moveTo(x+s*2,y); c.quadraticCurveTo(x+s*5,y+10,x+s*3,y+20*-up);},PAL.murekkep,.4*clamp(-up,0,1),1.1,992+s+k,2,1.2);
    }
  }
}

/* ───────── un ya da is: yüz kırpılmışken boya katmanında ───────── */
export function izBoya(fx,fy,mx,dyA){
  const T=G.toz; if(!T||!(T.yuz>0)) return;
  const Y=G.yuz, e=Y.en, b=Y.boy, u=Y.alin, r=rng(940), q=T.yuz;
  if(T.tur==='is'){ // is: parmakla sürülmüş kara lekeler, yönlü kısa sürtme izleri
    const D=T.renk?dz(T.renk):[24,20,17];
    const sur=(x,y,rx,ry,a,guc)=>{leke(x,y,rx,ry,D,.42*guc*q,a);
      c.lineCap='round'; for(let i=0;i<40;i++){const t=r()*2-1, w=(r()-.5)*2*ry*.7, px=x+Math.cos(a)*t*rx-Math.sin(a)*w, py=y+Math.sin(a)*t*rx+Math.cos(a)*w;
        c.strokeStyle=rgba(D,(.12+r()*.22)*guc*q); c.lineWidth=1+r()*2.5; c.beginPath(); c.moveTo(px,py); c.lineTo(px+Math.cos(a)*(8+r()*14),py+Math.sin(a)*(8+r()*14)); c.stroke();}};
    sur(-60*e+fx*.5,-120*u,56,14,-.25,1);   // alında silinmiş is
    sur(-98*e+fx*.4,70*b,30,12,.9,.9);      // ışık yanında yanak
    sur(18+fx*1.2,40,10,26,1.45,.6);         // burun sırtı
    sur(90*e,170*b,40,10,-.6,.7);           // çene hattı
    leke(-30*e,-60,30,10,D,.2*q);
    return;
  }
  // un: soluk toz; kaşta, saç dibinde, burun sırtında ve elmacıkta toplanır, ince serpinti
  const U=T.renk?dz(T.renk):[222,216,196];
  leke(0,-150*u,140*e,40,U,.2*q); leke(-60*e+fx*.4,60*b,50,36,U,.16*q); leke(16+fx*1.2,30,14,40,U,.14*q);
  for(const s of[-1,1]) leke(s*Y.gozAralik+fx,-46+Y.kasY,46,12,U,.2*q);
  for(let i=0;i<700*q;i++){const x=(r()*2-1)*150*e, y=-200*u+r()*400*b; c.fillStyle=rgba(U,(.08+r()*.3)*(y<-100?1.2:.8));
    c.fillRect(x,y,.8+r()*1.6,.8+r()*1.6);}
  void mx; void dyA; void fy;
}
// saçtaki un: saç biçiminin üst bölgesinde soluk serpinti ve tozlu ışık
export function tozSac(){
  const T=G.toz; if(T.tur!=='un'||!(T.sac>0)||G.baslik.tur!=='yok') return;
  const Y=G.yuz, e=Y.en, u=Y.alin, h=G.sac.cizgi*u, U=T.renk?dz(T.renk):[222,216,196], r=rng(945);
  c.save(); c.beginPath(); c.ellipse(0,-140*u,176*e,110*u,0,0,TAU); c.rect(-400,h+10,800,600); c.clip('evenodd');
  leke(-40*e,-210*u,110*e,30,U,.22*T.sac);
  for(let i=0;i<500*T.sac;i++){const a=Math.PI*(1+r()), rr=Math.sqrt(r()), x=Math.cos(a)*170*e*rr, y=-60+Math.sin(a)*185*u*rr; if(y>h+6) continue;
    c.fillStyle=rgba(U,.12+r()*.35); c.fillRect(x,y,1+r()*1.5,1+r()*1.5);}
  c.restore();
}

/* ───────── ifade çizgileri (poz'dan; her iki yolda): kalkan kaşla alında yatay kıvrımlar, çatılan kaşla iki kaş arasında
   dikey çizgiler, iç uçları kalkan (hüzünlü) kaşla alnın ortasında kısa kıvrımlar. Nötr pozda hiçbiri çizilmez. ───────── */
export function ifadeCizgileri(fx){
  const k=poz.kaynama, e=G.yuz.en, u=G.yuz.alin, ga=G.yuz.gozAralik;
  const yasli=.55+.45*clamp((G.yas-25)/40,0,1);
  const kalk=clamp((poz.kasKaldir-.4)/1.1,0,1), ic=clamp((-poz.kasCat-.35)/.9,0,1), cat=clamp((poz.kasCat-.55)/1,0,1);
  const alin=Math.max(kalk,ic*.8);
  if(alin>.02){
    const w0=kalk>=ic*.8?1:.45; // hüzünde yalnızca alnın ortası kırışır
    for(let i=0;i<3;i++){
      const y=(-86-i*17)*u-poz.kasKaldir*3, w=(62-i*8)*e*w0;
      titrek(()=>{c.moveTo(-w+fx*.6,y+3); c.bezierCurveTo(-w*.35+fx*.6,y-4-ic*4,w*.3+fx*.6,y+3-ic*4,w+fx*.6,y-1);},PAL.murekkep,.36*alin*yasli*(1-i*.18),1.1,640+i+k,2,1.5);
    }
  }
  if(cat>.02){ // çatık kaş: kaşlar arasında iki dikey çizgi, burun kökünde kısa yatay kıvrım
    const x=fx*.8, kg=Math.min(14,ga*.2);
    titrek(()=>{c.moveTo(x-kg,-58); c.quadraticCurveTo(x-kg+3,-42,x-kg+1,-28); c.moveTo(x+kg-2,-60); c.quadraticCurveTo(x+kg-4,-44,x+kg-1,-30);},PAL.murekkep,.5*cat*yasli,1.3,646+k,2,1.4);
    titrek(()=>{c.moveTo(x-12,-16); c.quadraticCurveTo(x,-20,x+12,-15);},PAL.murekkep,.3*cat,1.1,648+k,2,1.2);
    leke(x+2,-40,16,20,G.renk.tenDerin,.25*cat);
  }
}
