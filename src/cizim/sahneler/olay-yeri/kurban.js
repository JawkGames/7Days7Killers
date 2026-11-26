// Kurban: ayrıntı çizilmez. Üstüne kilim ya da çul örtülmüş, yere çökmüş karanlık bir kütle.
// Gövde birkaç yumru olarak tanımlanır; örtü bu yumruların üstüne düşer (her noktada en yakın tepeden eğimle iner).
import {c} from '../../teknik/tuval.js';
import {leke,tara} from '../../teknik/firca.js';
import {hex,clamp,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {hat,golgele} from './kalem.js';

// gövde yumruları: [u merkez, w merkez, u yarıçap, w yarıçap, yükseklik] (cm; u boyuna, w enine)
const GOVDE=[
  [-72,2,12,10,15],   // baş
  [-46,0,18,22,19],   // omuzlar
  [-18,1,32,20,19],   // gövde (omuzdan kalçaya tek kütle)
  [12,0,18,19,17],    // kalça
  [42,-6,28,8,12], [42,7,28,8,12], // bacaklar
  [72,-6,8,6,12], [72,7,8,6,11]    // ayak uçları örtüyü biraz kaldırır
];
const ORTU={kilim:{boy:196,en:106,renk:hex('#5a4c3c'),desen:true}, cul:{boy:190,en:100,renk:hex('#4a4536'),desen:false}};

export function kurbanCiz(P,isik,yuva,{ortu='kilim',aci=0},r){
  const T=ORTU[ortu]||ORTU.kilim, O=yuva.konum, Y0=O[1];
  const au=[Math.cos(aci),0,Math.sin(aci)], aw=[-Math.sin(aci),0,Math.cos(aci)];
  const du=3, dw=3, nu=Math.round(T.boy/du), nw=Math.round(T.en/dw);
  // gövde yüksekliği
  const govde=(u,w)=>{let h=0; for(const g of GOVDE){const d=((u-g[0])/g[2])**2+((w-g[1])/g[3])**2; if(d<1) h=Math.max(h,g[4]*1.45*Math.sqrt(1-d));} return h;};
  const ham=[]; for(let i=0;i<=nu;i++){ham[i]=[]; for(let j=0;j<=nw;j++) ham[i][j]=govde(-T.boy/2+i*du,-T.en/2+j*dw);}
  // örtü: her noktada en yakın tepeden 1.1 eğimle iner; düz yerde buruşuk
  const hO=[], kat=rng(Math.floor(r()*1e6));
  const kir=[]; for(let q=0;q<9;q++) kir.push([kat()*T.boy-T.boy/2,kat()*T.en-T.en/2,.6+kat()*1.6,10+kat()*20,kat()*Math.PI]);
  for(let i=0;i<=nu;i++){hO[i]=[]; for(let j=0;j<=nw;j++){
    let h=0; const u=-T.boy/2+i*du, w=-T.en/2+j*dw;
    for(let a=0;a<=nu;a+=1) for(let b=0;b<=nw;b+=1){const hb=ham[a][b]; if(hb<=h) continue; const d=Math.hypot((a-i)*du,(b-j)*dw); h=Math.max(h,hb-d*1.2);}
    let kirisik=0; for(const q of kir){const dd=Math.hypot(u-q[0],w-q[1]); if(dd<q[3]) kirisik+=q[2]*Math.cos(dd*.55+q[4])*(1-dd/q[3]);}
    const kenarU=Math.min(i,nu-i)*du, kenarW=Math.min(j,nw-j)*dw, sark=Math.min(1,Math.min(kenarU,kenarW)/16); // kenarlar yere sarkar
    hO[i][j]=Math.max(.4,(h+kirisik*(h<6?1:.12))*sark*sark*(3-2*sark));
  }}
  for(let gec=0;gec<3;gec++){ // örtü sivri tepe yapmaz: yumuşat
    const e=hO.map(s=>s.slice());
    for(let i=1;i<nu;i++) for(let j=1;j<nw;j++) hO[i][j]=Math.max(.4,(e[i-1][j]+e[i+1][j]+e[i][j-1]+e[i][j+1]+e[i][j]*2)/6);
  }
  const D=(u,w,h)=>[O[0]+au[0]*u+aw[0]*w, Y0+h, O[2]+au[2]*u+aw[2]*w];
  const nokta=(i,j)=>D(-T.boy/2+i*du,-T.en/2+j*dw,hO[i][j]);
  // yere düşen gölge: kütlenin altı kapkara, çevresi yumuşak
  c.save();
  const kose=[nokta(0,0),nokta(nu,0),nokta(nu,nw),nokta(0,nw)].map(q=>P.n(q[0],Y0,q[2]));
  const mx=kose.reduce((s,q)=>s+q[0]/4,0), my=kose.reduce((s,q)=>s+q[1]/4,0);
  const ex=Math.max(...kose.map(q=>q[0]))-Math.min(...kose.map(q=>q[0])), ey=Math.max(...kose.map(q=>q[1]))-Math.min(...kose.map(q=>q[1]));
  leke(mx,my+ey*.04,ex*.62,ey*.7,[0,0,0],.75);
  // yüzeyi dörtgenlerle boya (uzaktan yakına)
  const dortgen=[];
  for(let i=0;i<nu;i++) for(let j=0;j<nw;j++){
    const q=[nokta(i,j),nokta(i+1,j),nokta(i+1,j+1),nokta(i,j+1)];
    const m=[(q[0][0]+q[2][0])/2,(q[0][1]+q[2][1])/2,(q[0][2]+q[2][2])/2];
    // yumuşak normal: yüksekliğin iki hücre üstünden farkı (düz yüzeyli dörtgen basamakları görünmesin)
    const H=(x,y)=>hO[Math.max(0,Math.min(nu,x))][Math.max(0,Math.min(nw,y))];
    const hu=(H(i+2,j)+H(i+2,j+1)-H(i-1,j)-H(i-1,j+1))/(6*du), hw=(H(i,j+2)+H(i+1,j+2)-H(i,j-1)-H(i+1,j-1))/(6*dw);
    let n=[-(hu*au[0]+hw*aw[0]),1,-(hu*au[2]+hw*aw[2])]; const nl=Math.hypot(...n); n=n.map(v=>v/nl);
    dortgen.push({q,m,n,i,j,d:P.derinlik(...m)});
  }
  dortgen.sort((a,b)=>b.d-a.d);
  // dış çizgi ve yüzeyde tarama (gölgeli yanda)
  const kenar=[];
  for(let i=0;i<=nu;i++) kenar.push(nokta(i,0)); for(let j=0;j<=nw;j++) kenar.push(nokta(nu,j));
  for(let i=nu;i>=0;i--) kenar.push(nokta(i,nw)); for(let j=nw;j>=0;j--) kenar.push(nokta(0,j));
  const yol=()=>kenar.forEach((q,k)=>{const s=P.n(...q); if(k)c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);});
  hat(yol,[6,6,8],.8,1.4,Math.floor(r()*1e5),2,1.4); // görünmeyen kısmı dörtgenler örter
  // ışık yönü (yerel u,w) ve yüksekliği: kütle kendi gölgesini örtünün düz yerine düşürür
  const L=[isik.konum[0]-O[0],isik.konum[1]-Y0,isik.konum[2]-O[2]], Lu=L[0]*au[0]+L[2]*au[2], Lw=L[0]*aw[0]+L[2]*aw[2], Ly=Math.hypot(Lu,Lw)||1;
  const egim=Math.max(.15,Math.min(3,(L[1]-10)/Ly)), yu=Lu/Ly, yw=Lw/Ly, Ld=L.map(v=>v/Math.hypot(...L));
  const yuks=(u,w)=>{const i=Math.round((u+T.boy/2)/du), j=Math.round((w+T.en/2)/dw); return i<0||j<0||i>nu||j>nw?0:hO[i][j];};
  const golgede=(u,w,h)=>{let e=0; for(let s=3;s<90;s+=3) e=Math.max(e,yuks(u+yu*s,w+yw*s)-h-s*egim); return Math.min(1,Math.max(0,e/5));}; // yumuşak gölge kenarı
  for(const d of dortgen){
    const u=-T.boy/2+(d.i+.5)*du, w=-T.en/2+(d.j+.5)*dw, h=hO[d.i][d.j];
    const dif=Math.max(0,d.n[0]*Ld[0]+d.n[1]*Ld[1]+d.n[2]*Ld[2]);
    let a=.22+.95*dif*(1-.65*golgede(u,w,h));
    if(T.desen){ // kilim deseni: enine şeritler ve ortada baklava gözler
      const s=((u+T.boy/2)%26+26)%26, bant=Math.floor((u+T.boy/2)/26);
      if(s<3||s>23) a*=.72; else if(bant%2&&Math.abs(((u%26)+26)%26-13)+Math.abs(((w%26)+39)%26-13)<7) a*=.8;
      if(Math.abs(w)>T.en/2-8) a*=.82; // kenar şeridi
    }else{ a*=.88+kat()*.1; }
    a*=.6+.4*clamp(h/6,0,1); // örtünün yere değdiği yer kararır, kabarık yer ışık toplar
    c.beginPath(); d.q.forEach((p,k)=>{const s=P.n(...p); if(k)c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]);}); c.closePath();
    const renk=golgele(T.renk,a); c.fillStyle=rgba(renk,1); c.fill(); c.strokeStyle=rgba(renk,1); c.lineWidth=.6; c.stroke();
  }
  c.save(); c.beginPath(); yol(); c.clip();
  const xs=kenar.map(q=>P.n(...q)[0]), ys=kenar.map(q=>P.n(...q)[1]);
  tara(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),.7,7,[6,6,8],.35,Math.floor(r()*1e5),1);
  // ışıktan uzak yarı biraz daha karanlık
  leke(mx+(mx-P.n(...isik.konum)[0])*.15,my,ex*.4,ey*.5,[0,0,0],.35);
  c.restore();
  // kısa uçlardaki saçaklar yere serilir
  if(T.desen) for(const uc of [0,nu]){
    const yon=uc?1:-1;
    for(let j=1;j<nw;j+=1){
      const w=-T.en/2+j*dw, u=-T.boy/2+uc*du, a=D(u,w,.3), b=D(u+yon*(6+r()*4),w+(r()-.5)*3,.2);
      hat(()=>{const s=P.n(...a), e=P.n(...b); c.moveTo(s[0],s[1]); c.lineTo(e[0],e[1]);},[150,140,118],.35,.8,j+uc*100,1,.6);
    }
  }
  c.restore();
}
