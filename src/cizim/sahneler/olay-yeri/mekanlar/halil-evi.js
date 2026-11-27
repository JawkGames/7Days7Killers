// Kör Halil'in evi: katırcının evi; ev ile ahır iç içe. Solda yaşanan yer: duvar dibinde yük denkleri, gazyağı tenekeleri,
// duvardaki askılıkta katır koşumu. Sağda alçak taş bölmenin ardı ahır: bölmenin üstüne atılmış semerler, yerde saman,
// arka duvarda iç ahıra açılan kapkara ağız. Tek ışık: sol duvardaki açık kapı (gün ışığı).
//
// Dosyanın altındaki EV ORTAK bölümü öbür köy evlerinin de (gulsum-evi, sultan-evi, ebe-evi, irgat-evi) kullandığı
// parçalardır: oda (duvar, kirişli tavan), kapı/pencere boşluğu, niş, yatak yığını, teneke, sandık, gaz lambası.
// Ortaklaştırılmalı (mekan-yardim.js'e taşınmalı); şimdilik başka ajanların dosyalarına dokunmamak için burada.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,clamp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,silindir,cokgen3,hat3,yol3,aydinlik,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,tasOrgu,zemin,aydinlikBosluk,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';

/* ════════════════════════ EV ORTAK (ortaklaştırılmalı) ════════════════════════ */

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

// Badanalı sıva duvar (sivaDuvar'ın denetimli hali): ışık ızgarası, is, akıntı lekeleri, birkaç çatlak;
// sıvası dökülmüş yamalar yalnızca istenen yerde (yamalar: [[x,y,w,h]] yerel cm, y = -yükseklik)
export function badanaDuvar(P,isik,O,D,[x0,x1,y0,y1],renk,R,{is=0,yamalar=[],catlak=5}={}){
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

/* ════════════════════════ KÖR HALİL'İN EVİ ════════════════════════ */

const SOL=-250, SAG=270, ARKA=480, TAVAN=250, ON=60;
const KAPI={x0:-236, x1:-160, y1:176};                // arka duvarda, sol köşede açık kapı
const BOLME={x:[66,SAG], y:96, z:[404,432]};           // ahırı ayıran alçak taş bölme (X boyunca)
const isik={konum:[-198,118,ARKA+40], guc:1.9, menzil:340, ortam:.28};
const {badana:BADANA, tas:TAS, toprak:TOPRAK, ahsap:AHSAP, cuval:CUVAL, deri:DERI}=RENK_EV;

// Semer: bölmenin üstüne ata biner gibi atılmış; yandan görünür. Kapitone keçe yastık, iki uçta ağaç kaş,
// öne sarkan kapak ve yere doğru kolan. Bölmenin ön yüzü düzleminde çizilir (küçük nesne).
function semer(P,x,t){
  const Z=BOLME.z[0]-3, y=BOLME.y;
  duzlemde(P,[x,y,Z],DUZLEM.arka,()=>{
    leke(6,26,46,26,[0,0,0],.55); // kapağın duvara düşen gölgesi
    // sarkan kapak (keçe), alt kenarı dalgalı
    const kapak=()=>{c.moveTo(-40,-6); c.lineTo(40,-6); c.quadraticCurveTo(43,14,40,36); c.quadraticCurveTo(20,40,4,37); c.quadraticCurveTo(-18,41,-38,36); c.quadraticCurveTo(-43,14,-40,-6); c.closePath();};
    c.beginPath(); kapak(); c.fillStyle=rgba(golgele(DERI,.8),1); c.fill();
    c.save(); c.clip(); leke(-16,4,26,18,golgele(DERI,1.25),.45); leke(18,24,30,20,[0,0,0],.45);
    for(let i=-3;i<=3;i++) titrek(()=>{c.moveTo(i*11,-4); c.lineTo(i*11+(i*.6),34);},[18,12,8],.45,.8,t+i+10,1,.4); // kapitone dikiş
    titrek(()=>{c.moveTo(-39,30); c.quadraticCurveTo(0,34,39,30);},[150,120,80],.3,.8,t+30,1,.4); // kenar şeridi
    c.restore(); titrek(kapak,MUREKKEP,.8,1.2,t,2,.8);
    // yastık sırtı
    const sirt=()=>{c.moveTo(-42,-4); c.bezierCurveTo(-40,-20,-20,-23,0,-21); c.bezierCurveTo(20,-23,40,-20,42,-4); c.closePath();};
    c.beginPath(); sirt(); c.fillStyle=rgba(golgele(DERI,.95),1); c.fill(); c.save(); c.clip(); leke(-10,-16,30,7,[200,170,130],.3); c.restore(); titrek(sirt,MUREKKEP,.75,1.1,t+1,2,.6);
    // iki uçta ağaç kaş: yukarı kalkık kemer
    for(const k of[-1,1]){const kas=()=>{c.moveTo(k*42,-4); c.quadraticCurveTo(k*45,-20,k*36,-27); c.lineTo(k*31,-24); c.quadraticCurveTo(k*37,-17,k*35,-4); c.closePath();};
      c.beginPath(); kas(); c.fillStyle=rgba(golgele(AHSAP,1.1),1); c.fill(); c.save(); c.clip(); leke(k*38,-18,3,8,[230,210,170],.4); c.restore(); titrek(kas,MUREKKEP,.85,1,t+2+k,2,.4);}
    // kolan: kapağın altından sarkan kayış, ucunda toka
    titrek(()=>{c.moveTo(22,36); c.quadraticCurveTo(26,60,18,84);},[34,26,18],.95,2.6,t+5,1,.2);
    c.strokeStyle='rgba(120,112,96,.9)'; c.lineWidth=1.2; c.strokeRect(15,82,7,5);
  });
}

// Yük denkleri: çuvala sarılıp urganla çaprazlama bağlanmış balyalar
function denk(P,R,x0,x1,y0,y1,z0,z1,t){
  if(!y0) tabanGolgesi(P,isik,x0,x1,z0,z1,.7);
  const yz=yumusakKutu(P,isik,R,[x0,x1],[y0,y1],[z0,z1],golgele(CUVAL,.95+R()*.1),t,{yuvarlak:.2});
  yuzDoku(P,yz.on,R,{sik:9,alfa:.22,kalin:.7,lek:3});
  if(yz.ust) yuzDoku(P,yz.ust,R,{sik:6,alfa:.18,kalin:.7,lek:1});
  // kırışıklar: bağın sıktığı yerden yayılan kısa hatlar
  for(let i=0;i<5;i++){const xx=x0+(x1-x0)*(.15+R()*.7), yy=y0+(y1-y0)*(.3+R()*.5); hat3(P,[[xx,yy,z0-1],[xx+(R()-.5)*14,yy+(R()-.5)*10,z0-1]],[20,18,14],.35,.8,t+40+i,1,.5);}
  const ip=n=>{hat3(P,n,[176,164,130],.9,2.2,t+n.length*7,1,.2); hat3(P,n,[24,20,14],.45,.6,t+n.length*7+1,1,.5);};
  for(const f of[.3,.72]){const xx=x0+(x1-x0)*f; ip([[xx,y0+3,z0-1],[xx-1,(y0+y1)/2,z0-2.5],[xx,y1-1,z0-1.5],[xx,y1+1.5,z0+(z1-z0)*.5],[xx,y1,z1]]);}
  ip([[x0+3,(y0+y1)*.5+2,z0-1],[(x0+x1)/2,(y0+y1)*.5,z0-2.5],[x1-3,(y0+y1)*.5+2,z0-1]]);
}

export default {
  id:'halil-evi',
  kamera:{odak:720, yukseklik:160, egim:.2},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[70,0,238], yuzey:'toprak', alan:16},
    'zemin-orta': {duzlem:'zemin', konum:[-96,0,374], yuzey:'toprak', alan:7},
    'zemin-kose': {duzlem:'zemin', konum:[-196,0,300], yuzey:'toprak', alan:5},
    'esik':       {duzlem:'zemin', konum:[-198,0,ARKA-12], yuzey:'tas', alan:4},
    'duvar':      {duzlem:'arka', konum:[8,126,ARKA], yuzey:'siva', alan:6},
    'ahir-onu':   {duzlem:'zemin', konum:[178,0,350], yuzey:'camur', alan:10},
    'teneke-ustu':{duzlem:'ust', konum:[-206,70,372], yuzey:'tas', alan:2, uygunsuz:['kan','un']},
    'beden':      {duzlem:'zemin', konum:[-26,0,306], aci:.2, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(8121), K=KAPI, B=BOLME;
    c.fillStyle='#0c0d0a'; c.fillRect(0,0,1000,750);
    const kapi=bosluk(K.x0,K.x1,0,K.y1);
    odaDuvarlari(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON,renk:BADANA,is:.3,catlak:4,
      yama:{arka:[[-60,-60,22,16]], sol:[[300,-150,30,24]]}, delik:{arka:[kapi]}});
    // ahır yanı badanasız: bölmenin ardında duvar moloz taş, isli
    // ahır yanı: hayvan nefesi ve isle kararmış duvar, dibinde ıslak kuşak
    for(let i=0;i<9;i++){const s0=P.n(B.x[0]+40+R()*(SAG-B.x[0]-40),40+R()*170,ARKA); leke(s0[0],s0[1],40+R()*60,30+R()*50,[0,0,0],.12+R()*.1);}
    { const s0=P.n(170,30,ARKA); leke(s0[0],s0[1],160,40,[0,0,0],.35); }
    tavanCiz(P,isik,R,{sol:SOL,sag:SAG,arka:ARKA,on:ON,y:TAVAN,kirisX:[-160,-30,100,215]});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:820,doku:.9});
    odaKenarlari(P,{sol:SOL,sag:SAG,arka:ARKA,tavan:TAVAN,on:ON});
    // kapı ve içeri düşen ışık
    duvarBoslugu(P,isik,R,{duvar:'arka',duz:ARKA,a0:K.x0,a1:K.x1,y0:0,y1:K.y1,kalin:50});
    kutu(P,{...isik,ortam:.55},[K.x0-6,K.x1+6],[0,6],[ARKA-10,ARKA+50],TAS,8131,{cizgi:.45}); // eşik taşı
    isikDusmesi(P,[[K.x0+2,0,ARKA-4],[K.x1-2,0,ARKA-4],[K.x1+150,0,210],[K.x0+10,0,210]],[-198,0,ARKA],[-120,0,220],.95);
    // yemlik: ahır yanında arka duvar dibinde taş tekne (bölmenin üstünden görünür)
    kutu(P,{...isik,ortam:.24},[120,256],[0,64],[ARKA-40,ARKA],TAS,8140,{cizgi:.5});
    cokgen3(P,[[128,64.5,ARKA-34],[248,64.5,ARKA-34],[248,64.5,ARKA-6],[128,64.5,ARKA-6]],[24,22,18]);
    for(let i=0;i<40;i++){const x=130+R()*116, z=ARKA-32+R()*24; hat3(P,[[x,65,z],[x+(R()-.5)*14,66+R()*5,z+(R()-.5)*6]],[170,150,100],.5,.8,8141+i,1,.3);} // yemlikte saman
    // bölme: alçak moloz taş duvar; sol ucunda tavana çıkan ağaç dikme
    tabanGolgesi(P,isik,B.x[0],B.x[1],B.z[0],B.z[1],.55);
    tasOrgu(P,{...isik,ortam:.42},[0,0,B.z[0]],DUZLEM.arka,[B.x[0],B.x[1],-B.y,0],TAS,R,{sira:16,duzensiz:.7,harc:[52,48,40]});
    tasOrgu(P,{...isik,ortam:.4},[B.x[0],0,0],DUZLEM.sag,[-B.z[1],-B.z[0],-B.y,0],TAS,R,{sira:16,duzensiz:.7,harc:[52,48,40]});
    cokgen3(P,[[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]],[B.x[1],B.y,B.z[1]],[B.x[0],B.y,B.z[1]]],golgele(TAS,1));
    yuzDoku(P,[[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]],[B.x[1],B.y,B.z[1]],[B.x[0],B.y,B.z[1]]],R,{sik:3,alfa:.3,lek:4});
    hat3(P,[[B.x[0],0,B.z[0]],[B.x[0],B.y,B.z[0]],[B.x[1],B.y,B.z[0]]],MUREKKEP,.75,1.3,8150,2,1);
    hat3(P,[[B.x[0],B.y,B.z[0]],[B.x[0],B.y,B.z[1]]],MUREKKEP,.6,1.2,8151,2,1);
    silindir(P,isik,B.x[0]+10,(B.z[0]+B.z[1])/2,8,B.y,TAVAN-20,AHSAP,8152,{cizgi:.6});
    // semerler bölmenin üstünde
    semer(P,128,8160); semer(P,222,8170);
    // askılık: arka duvarda ağaç çivili tahta; dizgin, yular, çıngıraklı boyunluk, heybe, kamçı
    kutu(P,isik,[-140,40],[184,192],[ARKA-5,ARKA],AHSAP,8180,{cizgi:.5,ust:false});
    duzlemde(P,[0,0,ARKA-5],DUZLEM.arka,()=>{
      for(const x of[-128,-90,-52,-14,22]) agacCivi(x,-182);
      const kayis=(x,u,g,t)=>{titrek(()=>{c.moveTo(x-2,-180); c.bezierCurveTo(x-g,-180+u*.6,x-g*.4,-180+u,x+2,-180+u); c.bezierCurveTo(x+g*.6,-180+u,x+g,-180+u*.6,x+3,-180);},[34,26,20],.95,2.6,t,1,.3); titrek(()=>{c.moveTo(x-2,-180); c.bezierCurveTo(x-g,-180+u*.6,x-g*.4,-180+u,x+2,-180+u);},[150,120,90],.35,.6,t+1,1,.3);};
      kayis(-128,60,16,8181); kayis(-125,44,9,8182);
      kayis(-90,38,13,8183); c.strokeStyle='rgba(60,56,50,1)'; c.lineWidth=1.6; c.beginPath(); c.arc(-90,-140,4,0,TAU); c.stroke(); titrek(()=>{c.moveTo(-90,-136); c.quadraticCurveTo(-86,-112,-92,-96);},[34,26,20],.9,2.2,8184,1,.3);
      // çıngıraklı boyunluk
      titrek(()=>{c.moveTo(-60,-180); c.bezierCurveTo(-74,-150,-64,-120,-50,-116); c.bezierCurveTo(-34,-120,-32,-150,-46,-180);},[40,30,22],.95,4.5,8185,1,.3);
      for(let i=0;i<6;i++){const a=.35+i*.45, x=-50+Math.cos(a+1.4)*13, y=-142+Math.sin(a+1.4)*22; leke(x+1,y+1.5,3,2.5,[0,0,0],.5); c.fillStyle='rgb(96,82,52)'; c.beginPath(); c.arc(x,y,2.4,0,TAU); c.fill(); c.fillStyle='rgba(230,214,160,.6)'; c.beginPath(); c.arc(x-.7,y-.7,.8,0,TAU); c.fill();}
      // heybe: dokuma iki gözlü torba (karaltı + birkaç çizgi)
      const hy=()=>{c.moveTo(-16,-181); c.lineTo(-30,-176); c.lineTo(-34,-134); c.quadraticCurveTo(-34,-126,-28,-126); c.lineTo(-2,-127); c.quadraticCurveTo(4,-127,3,-134); c.lineTo(0,-176); c.closePath();};
      leke(-12,-146,24,30,[0,0,0],.4); c.beginPath(); hy(); c.fillStyle='rgb(88,68,54)'; c.fill();
      c.save(); c.beginPath(); hy(); c.clip(); for(let i=0;i<4;i++){c.fillStyle='rgba(30,20,16,.45)'; c.fillRect(-28+i*8,-180,2.6,60);} for(let i=0;i<3;i++){c.fillStyle='rgba(190,170,130,.3)'; c.fillRect(-40,-166+i*13,50,1.6);} leke(-24,-150,8,18,[220,200,160],.2); c.restore();
      for(let i=0;i<9;i++) titrek(()=>{c.moveTo(-31+i*3.6,-126); c.lineTo(-31+i*3.6+(i%2?.6:-.6),-119);},[60,46,36],.8,.8,8190+i,1,.2); // saçak
      titrek(hy,MUREKKEP,.8,1,8186,2,.6);
      titrek(()=>{c.moveTo(22,-182); c.lineTo(24,-132); c.quadraticCurveTo(30,-104,18,-90);},[30,24,18],.9,1.6,8187,1,.3); // kamçı
    });
    // yük denkleri: arka duvar dibinde iki üst üste, yanında bir tane
    denk(P,R,-142,-56,0,50,ARKA-72,ARKA-6,8200); denk(P,R,-50,34,0,46,ARKA-68,ARKA-6,8210);
    denk(P,R,-132,-52,50,92,ARKA-66,ARKA-12,8220);
    // gazyağı tenekeleri: sol duvar dibinde, ışıkta; ikisinin üstünde bir üçüncü, biri yerde yan yatmış
    teneke(P,isik,R,-218,384,{tohum:8230}); teneke(P,isik,R,-194,384,{tohum:8231,ezik:1});
    teneke(P,isik,R,-206,372,{y:35,tohum:8240,ezik:1});
    teneke(P,isik,R,-226,346,{tohum:8245,ezik:2,h:28});
    // kapı yanında su güğümü
    gugum(P,-138,ARKA-20,{tohum:8248});
    // zeminde nal ve ayak izleriyle bozulmuş toprak; ahır önünde ıslak koyu çamur
    duzlemde(P,[-110,0,330],DUZLEM.zemin,()=>{for(let i=0;i<9;i++){const x=(R()-.5)*260, y=(R()-.5)*120; c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,4+R()*2,Math.PI*.15,Math.PI*.85+R()*.4); c.stroke();} for(let i=0;i<20;i++) leke((R()-.5)*260,(R()-.5)*120,6+R()*14,3+R()*5,[0,0,0],.12+R()*.1);});
    duzlemde(P,[180,0,360],DUZLEM.zemin,()=>{leke(0,0,90,40,[18,16,12],.55); for(let i=0;i<7;i++){const x=(R()-.5)*150, y=(R()-.5)*60; c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=1.4; c.beginPath(); c.arc(x,y,4.5,Math.PI*.1,Math.PI*.9); c.stroke(); c.strokeStyle='rgba(160,150,120,.2)'; c.beginPath(); c.arc(x,y-1,4.5,Math.PI*1.1,Math.PI*1.9); c.stroke();}});
    // dağılmış saman: bölmenin önünden makineye doğru seyrelir
    for(let i=0;i<220;i++){const x=40+R()*(SAG-40), z=200+R()*(B.z[0]-200)*(.4+R()*.6), s=P.n(x,0,z), o=P.olcek(x,0,z), a=R()*Math.PI, u=(4+R()*9)*o;
      tabana(); c.strokeStyle=`rgba(${160+R()*50|0},${144+R()*40|0},${96+R()*30|0},${.15+R()*.3})`; c.lineWidth=.8; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0]+Math.cos(a)*u,s[1]+Math.sin(a)*u*.4); c.stroke();}
    // ahır önünde dökülmüş nallar
    duzlemde(P,[92,0,300],DUZLEM.zemin,()=>{for(const [x,y,a] of[[0,0,.4],[14,10,2.2],[-8,16,4]]){c.save(); c.translate(x,y); c.rotate(a); leke(1,1,9,7,[0,0,0],.5); c.strokeStyle='rgb(58,56,52)'; c.lineWidth=2.6; c.beginPath(); c.arc(0,0,6,Math.PI*.15,Math.PI*1.85); c.stroke(); c.strokeStyle='rgba(200,196,180,.5)'; c.lineWidth=.6; c.beginPath(); c.arc(0,0,7,Math.PI*1.1,Math.PI*1.6); c.stroke(); c.restore();}});
    // önde: urgan yumağı ve sürüklenmiş ucu
    const u=P.n(-150,0,236), uo=P.olcek(-150,0,236);
    tabana(); leke(u[0]+8*uo,u[1]+2*uo,30*uo,9*uo,[0,0,0],.55);
    c.fillStyle='rgba(70,62,46,1)'; c.beginPath(); c.ellipse(u[0],u[1]-6*uo,16*uo,7*uo,0,0,TAU); c.fill();
    for(let i=0;i<12;i++){const a=i*.9; titrek(()=>{c.ellipse(u[0]+Math.cos(a)*3*uo,u[1]-6*uo+Math.sin(a)*1.5*uo,(15-i*.5)*uo,(6-i*.2)*uo,(R()-.5)*.3,0,TAU);},[170,156,120],.55,1.8,8250+i,1,.4);}
    titrek(()=>{c.moveTo(u[0]+14*uo,u[1]-3*uo); c.bezierCurveTo(u[0]+40*uo,u[1]+8*uo,u[0]+60*uo,u[1]-6*uo,u[0]+96*uo,u[1]+4*uo);},[170,156,120],.7,2,8270,1,.4);
  },
  ustCiz(P,r){
    const K=KAPI;
    atmosfer(r,{tarama:.08,leke:.09});
    huzme(P,r,[[K.x0,K.y1,ARKA],[K.x1,K.y1,ARKA],[K.x1+150,0,220],[K.x0+10,0,220]],[-198,150,ARKA],[-120,0,240],.15,140);
    karanlik([[1000,520,240,300,.55],[1000,40,320,180,.5],[0,40,200,140,.4],[1000,740,300,140,.45],[0,740,200,100,.3]]);
  }
};
