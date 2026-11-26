// Çeşme başı: sivri kemerli taş çeşme, önünde uzun yalak, iki yanda kuru taş duvar; ardında toprak damlı evlerin karaltısı.
// Tek ışık: soldan, alçaktan gelen soluk sabah ışığı. Yalağın önü çamur, su birikintileri göğü yansıtır.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,cokgen3,hat3,yol3,golgele,tabana} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,duzlemYol,tasOrgu,zemin,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';

const TAS=[132,124,104], KURU=[104,98,84], TOPRAK=[84,76,60], CAMUR=[58,54,44], GOK=[196,196,184];
const ON=560;                                   // çeşme cephesinin yüzü
const CEPHE={x:[-112,112], y:[0,232]};
const KEMER={x:[-52,52], alt:34, omuz:150, tepe:192, derin:22};
const YALAK={x:[-138,138], y:[0,48], z:[488,ON], kalin:11};
const isik={konum:[-1100,520,160], guc:1.15, menzil:3200, ortam:.26};

// sivri kemer: yerel cephe düzleminde nokta dizisi (y aşağı); tam izdüşümle çizilir
function kemerNoktalari(pay=0,k=KEMER){
  const x0=k.x[0]-pay, x1=k.x[1]+pay, w=(x1-x0)/2, m=(x0+x1)/2, n=[[x0,-k.alt],[x0,-k.omuz]];
  const q=(a,b,cc,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*cc[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*cc[1]];
  for(let i=1;i<=10;i++) n.push(q([x0,-k.omuz],[x0+w*.12,-k.tepe+18-pay*.3],[m,-k.tepe-pay],i/10));
  for(let i=1;i<=10;i++) n.push(q([m,-k.tepe-pay],[x1-w*.12,-k.tepe+18-pay*.3],[x1,-k.omuz],i/10));
  n.push([x1,-k.alt]); return n;
}

function evler(P,r){
  // uzak toprak damlı evler: düz dam, parapet, çörten; sisle açılır
  const ev=[[-1500,-650,2400,300],[-760,-180,2700,360],[-300,240,3300,280],[260,900,2600,330],[900,1700,2300,300]];
  for(const [i,e] of ev.entries()){
    const [x0,x1,z,h]=e, a=P.n(x0,0,z), b=P.n(x1,h,z);
    c.fillStyle=rgba([58+i*4,60+i*4,54+i*4],1); c.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);
    c.fillStyle='rgba(20,20,18,.55)'; c.fillRect(a[0],b[1],b[0]-a[0],2.2); // dam kenarı
    for(let j=0;j<3;j++){const w=P.n(x0+(x1-x0)*(.2+j*.28),h*.55,z); c.fillStyle='rgba(12,12,10,.8)'; c.fillRect(w[0],w[1],4,5);}
    for(let x=x0+40;x<x1;x+=70){const q=P.n(x,h-24,z); c.fillStyle='rgba(16,16,14,.75)'; c.fillRect(q[0],q[1],1.6,1.6);} // damı taşıyan hatıl uçları
    const kp=P.n(x0+(x1-x0)*.45,0,z), ku=P.n(x0+(x1-x0)*.45,180,z); c.fillStyle='rgba(16,16,14,.7)'; c.fillRect(kp[0],ku[1],5,kp[1]-ku[1]);
    const ct=P.n(x0+(x1-x0)*.7,h-10,z); c.strokeStyle='rgba(20,20,18,.7)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(ct[0],ct[1]); c.lineTo(ct[0]+6,ct[1]+1); c.stroke(); // çörten
  }
  // sağda yapraksız dut ağacı: yalnızca karaltı
  const k=P.n(560,0,1500), u=P.olcek(560,0,1500);
  c.fillStyle='rgb(34,34,30)'; c.beginPath(); c.moveTo(k[0]-9*u,k[1]); c.quadraticCurveTo(k[0]-2*u,k[1]-120*u,k[0]+2*u,k[1]-230*u); c.lineTo(k[0]+7*u,k[1]-230*u); c.quadraticCurveTo(k[0]+6*u,k[1]-120*u,k[0]+11*u,k[1]); c.closePath(); c.fill();
  for(let i=0;i<9;i++){const y=k[1]-(120+r()*110)*u, a=-Math.PI/2+(r()-.5)*1.8, l=(60+r()*90)*u; titrek(()=>{c.moveTo(k[0]+3*u,y); c.quadraticCurveTo(k[0]+Math.cos(a)*l*.5,y+Math.sin(a)*l*.5,k[0]+Math.cos(a)*l,y+Math.sin(a)*l);},[34,34,30],.75,1.4,510+i,2,1);}
  // sis: uzak her şeyi göğe yaklaştırır
  const g=c.createLinearGradient(0,60,0,300); g.addColorStop(0,'rgba(196,196,184,.05)'); g.addColorStop(1,'rgba(196,196,184,.55)');
  c.fillStyle=g; c.fillRect(0,0,1000,330);
}

export default {
  id:'cesme',
  kamera:{odak:820, yukseklik:155, egim:.17},
  isik,
  yuvalar:{
    'zemin-on':    {duzlem:'zemin', konum:[-10,0,252], yuzey:'camur', alan:18},
    'zemin-orta':  {duzlem:'zemin', konum:[138,0,290], yuzey:'camur', alan:10},
    'zemin-kose':  {duzlem:'zemin', konum:[-232,0,420], yuzey:'toprak', alan:10},
    'tas-doseme':  {duzlem:'zemin', konum:[96,0,458], yuzey:'tas', alan:10},
    'yalak-kenari':{duzlem:'ust', konum:[86,YALAK.y[1],YALAK.z[0]+5], yuzey:'tas', alan:5, aci:0},
    'duvar':       {duzlem:'arka', konum:[78,118,ON], yuzey:'tas', alan:4, uygunsuz:['saat']},
    'beden':       {duzlem:'zemin', konum:[-56,0,368], aci:.12, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(5521), Y=YALAK, K=KEMER;
    // gök: bulutlu sabah, ufka doğru açılır
    let g=c.createLinearGradient(0,0,0,300); g.addColorStop(0,'rgb(150,152,140)'); g.addColorStop(1,'rgb(210,208,192)');
    c.fillStyle=g; c.fillRect(0,0,1000,750);
    for(let i=0;i<8;i++) leke(R()*1000,R()*140,120+R()*220,20+R()*30,[120,122,112],.25);
    evler(P,R);
    // kuru taş duvarlar (cepheden iki yana)
    tasOrgu(P,isik,[0,0,ON+6],DUZLEM.arka,[-520,CEPHE.x[0],-128,0],KURU,R,{sira:15,harc:[16,16,13],duzensiz:.6});
    tasOrgu(P,isik,[0,0,ON+6],DUZLEM.arka,[CEPHE.x[1],520,-122,0],KURU,R,{sira:15,harc:[16,16,13],duzensiz:.6});
    for(const yan of[-1,1]) for(let i=0;i<12;i++){ // duvar üstüne dizili taşlar
      const x=yan*(130+i*34+R()*10), s=P.n(x,125+R()*6,ON+6), o=P.olcek(x,125,ON+6);
      const w=(12+R()*8)*o, h=(4+R()*5)*o, yol=()=>{c.moveTo(s[0]-w,s[1]); c.lineTo(s[0]-w*.7,s[1]-h*(.6+R()*.4)); c.lineTo(s[0]+w*(R()-.5)*.6,s[1]-h); c.lineTo(s[0]+w*.8,s[1]-h*(.5+R()*.4)); c.lineTo(s[0]+w,s[1]); c.closePath();};
      c.fillStyle=rgba(golgele(KURU,.5+R()*.4),1); c.beginPath(); yol(); c.fill();
      titrek(yol,MUREKKEP,.4,.8,520+i+yan*20,1,.6);
    }
    // cephe: kesme taş; üstte saçak
    c.save(); tabana(); c.beginPath(); c.rect(0,0,1000,750);
    duzlemYol(P,[0,0,ON],DUZLEM.arka,kemerNoktalari());
    c.clip('evenodd');
    tasOrgu(P,isik,[0,0,ON],DUZLEM.arka,[CEPHE.x[0],CEPHE.x[1],-CEPHE.y[1],0],TAS,R,{sira:21,harc:[30,30,26]});
    c.restore();
    kutu(P,isik,[CEPHE.x[0]-8,CEPHE.x[1]+8],[CEPHE.y[1],CEPHE.y[1]+12],[ON-10,ON+4],TAS,601);
    kutu(P,isik,[CEPHE.x[0]-3,CEPHE.x[1]+3],[CEPHE.y[1]+12,CEPHE.y[1]+40],[ON+2,ON+8],golgele(TAS,.9),602,{cizgi:.4});
    // kemerin içi: derin, karanlık; dipte kitabe taşı ve lüle
    const ic=[0,0,ON+K.derin];
    c.save(); tabana(); c.beginPath(); duzlemYol(P,ic,DUZLEM.arka,kemerNoktalari()); c.fillStyle='rgb(40,40,34)'; c.fill(); c.clip();
    tasOrgu(P,{...isik,ortam:.12},ic,DUZLEM.arka,[K.x[0],K.x[1],-K.tepe,-K.alt],TAS,R,{sira:22});
    duzlemde(P,ic,DUZLEM.arka,()=>{
      c.fillStyle='rgba(120,116,98,.5)'; c.fillRect(-30,-158,60,34); // kitabe (yazısı okunmaz)
      for(let i=0;i<3;i++){c.fillStyle='rgba(20,20,16,.35)'; c.fillRect(-25,-152+i*10,50,2);}
    });
    tabana(); c.fillStyle='rgba(0,0,0,.42)'; c.fillRect(0,0,1000,750); const km=P.n(K.x[1],100,ON+K.derin); leke(km[0],km[1],60,160,[0,0,0],.5);
    c.restore();
    // kemer kenarı (iki çizgi: yüz ve içe dönen kalınlık)
    tabana(); titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kemerNoktalari(0),false),MUREKKEP,.8,1.4,611,2,1.6);
    titrek(()=>duzlemYol(P,[0,0,ON],DUZLEM.arka,kemerNoktalari(7),false),MUREKKEP,.45,1,612,2,1.6);
    cokgen3(P,[[K.x[1],K.alt,ON],[K.x[1],K.omuz,ON],[K.x[1],K.omuz,ON+K.derin],[K.x[1],K.alt,ON+K.derin]],golgele(TAS,.55));
    cokgen3(P,[[K.x[0],K.alt,ON],[K.x[0],K.omuz,ON],[K.x[0],K.omuz,ON+K.derin],[K.x[0],K.alt,ON+K.derin]],golgele(TAS,.28));
    cokgen3(P,[[K.x[0],K.alt,ON],[K.x[1],K.alt,ON],[K.x[1],K.alt,ON+K.derin],[K.x[0],K.alt,ON+K.derin]],golgele(TAS,.6));
    // lüle ve akan su
    // lüle: taşa gömülü pirinç boru, ucundan ince su
    const l0=P.n(0,98,ON+K.derin), l1=P.n(0,94,ON+K.derin-22), o=P.olcek(0,96,ON);
    duzlemde(P,[0,0,ON+K.derin],DUZLEM.arka,()=>{leke(0,-98,14,10,[0,0,0],.6); c.fillStyle='rgba(60,56,44,1)'; c.beginPath(); c.arc(0,-98,5,0,TAU); c.fill();});
    titrek(()=>{c.moveTo(l0[0],l0[1]); c.lineTo(l1[0],l1[1]);},[96,86,60],1,3.2*o,620,1,0);
    titrek(()=>{c.moveTo(l0[0],l0[1]-1.2*o); c.lineTo(l1[0],l1[1]-1.2*o);},[210,196,150],.5,.8*o,621,1,0);
    const su=P.n(0,Y.y[1]-5,ON+K.derin-24);
    c.strokeStyle='rgba(225,226,216,.6)'; c.lineWidth=1.3*o; c.beginPath(); c.moveTo(l1[0],l1[1]+1); c.quadraticCurveTo(l1[0]+1,l1[1]+6,su[0]+1,su[1]); c.stroke();
    // zemin: çamur, yalak önünde taş döşeme
    zemin(P,isik,[-520,520],[180,ON],TOPRAK,R,{tohum:640,doku:1.2});
    // yalak önünde yassı döşeme taşları; araları çamur dolu (her taş tam izdüşümle)
    cokgen3(P,[[-176,0,412],[176,0,416],[176,0,Y.z[0]],[-176,0,Y.z[0]]],[26,26,22]);
    for(let z=414;z<Y.z[0];){const h=20+R()*16; for(let x=-176+R()*10;x<170;){const w=30+R()*38, xe=Math.min(x+w,176), ze=Math.min(z+h,Y.z[0]);
      cokgen3(P,[[x+2,0,z+1.5],[xe-2,0,z+1+R()*2],[xe-2-R()*3,0,ze-1.5],[x+2+R()*3,0,ze-1]],golgele(TAS,.3+R()*.22)); x+=w;} z+=h;}
    { const a=P.n(-176,0,412), b=P.n(176,0,Y.z[0]); c.save(); c.beginPath(); yol3(P,[[-176,0,412],[176,0,416],[176,0,Y.z[0]],[-176,0,Y.z[0]]]); c.clip(); tara(a[0],b[1],b[0],a[1],.1,4,MUREKKEP,.25,641,.8); leke((a[0]+b[0])/2,(a[1]+b[1])/2,180,16,[190,192,182],.12); c.restore(); }
    // çamur: yalağın önünden makineye doğru, tekerlek ve hayvan izleriyle bozulmuş
    duzlemde(P,[0,0,330],DUZLEM.zemin,()=>{
      leke(0,10,320,120,CAMUR,.7); leke(-150,-40,160,60,[10,10,8],.35); leke(170,30,140,60,[10,10,8],.3);
      for(let i=0;i<30;i++) leke((R()-.5)*600,(R()-.5)*220,10+R()*40,4+R()*12,R()<.6?[6,6,5]:[140,140,126],.12+R()*.2,R()*.6-.3);
      // birikintiler: gök yansır (açık), kenarı keskin
      for(const [x,y,rx,ry] of [[-240,-20,40,18],[170,-60,30,13],[-70,105,18,9]]){
        const n=Array.from({length:16},(_,i)=>{const t=i/16*TAU, w=.55+R()*.6; return [x+Math.cos(t)*rx*w,y+Math.sin(t)*ry*w];});
        leke(x,y,rx*1.4,ry*1.6,[0,0,0],.35); // birikintinin çevresi koyu, ıslak
        c.beginPath(); n.forEach((q,i)=>{const s=n[(i+1)%n.length]; if(!i)c.moveTo((q[0]+s[0])/2,(q[1]+s[1])/2); c.quadraticCurveTo(s[0],s[1],(s[0]+n[(i+2)%n.length][0])/2,(s[1]+n[(i+2)%n.length][1])/2);});
        c.fillStyle='rgba(120,122,114,.5)'; c.fill();
        c.save(); c.clip(); leke(x-rx*.25,y,rx*.7,ry*.5,[220,220,210],.35); tara(x-rx,y-ry,x+rx,y+ry,0,2.4,[20,20,18],.25,700+x|0,.5); c.restore();
      }
      for(let i=0;i<140;i++){const x=(R()-.5)*640, y=(R()-.5)*250, u=3+R()*12; c.strokeStyle=`rgba(150,148,130,${.1+R()*.18})`; c.lineWidth=.8+R(); c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+u*.5,y-1.5,x+u,y+(R()-.5)*2); c.stroke(); c.strokeStyle='rgba(0,0,0,.3)'; c.beginPath(); c.moveTo(x+1,y+1.6); c.lineTo(x+u+1,y+1.6); c.stroke();}
      tara(-320,-130,320,130,.04,5,MUREKKEP,.25,650,1);
    });
    // soldan gelen ışıkla yalağın sağa düşen gölgesi
    cokgen3(P,[[Y.x[1],0,Y.z[0]],[Y.x[1]+70,0,Y.z[0]+14],[Y.x[1]+70,0,ON],[Y.x[1],0,ON]],[0,0,0],.35);
    // yalak: kalın taş kenarlar, içinde kara su
    kutu(P,isik,Y.x,Y.y,Y.z,TAS,660);
    tasOrgu(P,isik,[0,0,Y.z[0]],DUZLEM.arka,[Y.x[0],Y.x[1],-Y.y[1],0],TAS,R,{sira:25,harc:[30,30,26]});
    const su0=[[Y.x[0]+Y.kalin,Y.y[1]-5,Y.z[0]+Y.kalin],[Y.x[1]-Y.kalin,Y.y[1]-5,Y.z[0]+Y.kalin],[Y.x[1]-Y.kalin,Y.y[1]-5,Y.z[1]-2],[Y.x[0]+Y.kalin,Y.y[1]-5,Y.z[1]-2]];
    cokgen3(P,su0,[34,36,32]);
    c.save(); c.beginPath(); yol3(P,su0); c.clip(); const sm=P.n(-40,Y.y[1]-5,Y.z[0]+30); leke(sm[0],sm[1],180,14,[200,202,192],.35); leke(su[0],su[1]+2,30,6,[230,230,220],.4); c.restore();
    hat3(P,su0,MUREKKEP,.6,1.1,661,2,1,true);
    // yalağın taştığı yerde ıslak iz
    const ta=P.n(Y.x[1]-20,0,Y.z[0]-4); leke(ta[0],ta[1]+6,40,10,[0,0,0],.4);
    // cephe dibi gölgesi
    for(const yan of[-1,1]){const a=P.n(yan*CEPHE.x[1],0,ON), b=P.n(yan*520,0,ON+6); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=6; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();}
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.1,leke:.1});
    karanlik([[1000,560,300,320,.55],[0,720,300,200,.45],[1000,20,240,160,.25],[500,800,700,120,.4]]);
  }
};
