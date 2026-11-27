// Jandarma karakolu odası: arka duvar yarıya kadar koyu yağlı boyalı; solda yüksek, demir parmaklıklı pencere; ortada
// tahta tüfeklikte dört dikili tüfek; sağda perçinli demir kapı; önde sağda ağır yazı masası: açık nöbet defteri, hokka,
// divit, gaz lambası; masanın ardında sandalye. Tek ışık: parmaklıklı pencere (sol üst arka); parmaklık gölgesi yere düşer.
import {c} from '../../../teknik/tuval.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,MUREKKEP,kenarIsigi} from '../mekan-yardim.js';
import {badanaDuvar,etekBandi,dipGolgesi,kutuDoku,tahtaYuzey,tasDoseme,torna,pencere,gunesLekesi} from '../ic-yardim.js';

const SIVA=[184,178,160], AHSAP=[112,90,64], DEMIR=[96,98,96], ZEMIN=[150,144,128];
const ARKA=500, SOL=-250, SAG=250, TAVAN=250;
const PEN={x:[-226,-150], y:[128,194]};
const TUF={x:[-128,-6], z:[474,ARKA]};
const KAPI={x:[96,186], ust:196};
const MASA={x:[112,252], y:[0,78], z:[292,372]};
const isik={konum:[-188,168,470], guc:1.65, menzil:430, ortam:.36};
const GUNES=[.3,-.72,-1];

// dikili tüfek (yerel düzlem: dipçik ucu 0,0; yukarı eksi y)
function tufek(t){
  c.fillStyle='rgba(0,0,0,.4)'; c.save(); c.translate(4,1); c.beginPath(); c.moveTo(-7,0); c.lineTo(7,0); c.lineTo(3,-76); c.lineTo(1.5,-128); c.lineTo(-1.5,-128); c.lineTo(-3,-76); c.closePath(); c.fill(); c.restore(); // duvara gölge
  c.fillStyle='rgb(20,20,18)'; c.fillRect(-1.6,-130,3.2,62);                   // namlu
  c.fillStyle=`rgb(${146+t%10},${112+t%8},${74})`;
  c.beginPath(); c.moveTo(-6.5,0); c.lineTo(7,0); c.lineTo(5,-20); c.lineTo(3.4,-34); c.lineTo(3.2,-78); c.lineTo(-3.2,-78); c.lineTo(-3.6,-36); c.lineTo(-6,-22); c.closePath(); c.fill(); // dipçik, kundak
  c.fillStyle='rgb(26,26,24)'; c.fillRect(-3.6,-46,7.2,7); c.fillRect(2,-55,6,2.2); c.fillRect(-3.4,-1.8,10.2,1.8); // mekanizma, kol, dipçik demiri
  c.fillStyle='rgba(26,26,24,.9)'; c.fillRect(-3.4,-64,6.8,2); c.fillRect(-3.4,-30,6.8,1.6);   // bilezikler
  c.fillStyle="rgba(230,220,190,.25)"; c.fillRect(-2.6,-76,1,70); c.fillRect(-1.2,-128,.7,52); // ışık çizgisi
}

function tufeklik(P,R){
  const [x0,x1]=TUF.x, [z0,z1]=TUF.z;
  kutuDoku(P,isik,[x0,x1],[100,108],[z0+4,z1],AHSAP,5000,{doku:'tahta',en:8});      // üst kol (çentikli)
  for(const x of[x0,x1-6]) kutuDoku(P,isik,[x,x+6],[0,140],[z0+10,z1],AHSAP,5001+x,{doku:'tahta',en:6,yonOn:'v'});
  kutuDoku(P,isik,[x0,x1],[0,18],[z0,z1],golgele(AHSAP,.95),5002,{doku:'tahta',en:9});  // dipçik kutusu
  for(let i=0;i<4;i++){
    const x=x0+18+i*28;
    duzlemde(P,[x,14,z0+12],DUZLEM.arka,()=>tufek(i*7));
    const s=P.n(x,108.2,z0+6), o=P.olcek(x,108,z0+6); c.fillStyle='rgba(10,8,6,.8)'; c.fillRect(s[0]-3*o,s[1]-1.2*o,6*o,2.4*o); // çentik
  }
  kutuDoku(P,isik,[x0,x1],[100,108],[z0,z0+5],AHSAP,5003,{doku:'tahta',en:8,kenar:.45}); // üst kolun ön çıtası (tüfeklerin önünden geçer)
  kutuDoku(P,isik,[x0-2,x1+2],[18,22],[z0-2,z1],golgele(AHSAP,1.05),5004,{doku:'tahta',en:8,kenar:.45});
  duzlemde(P,[(x0+x1)/2,0,z0],DUZLEM.zemin,()=>{leke(20,-10,90,20,[0,0,0],.35);});
}

function demirKapi(P,R){
  const [x0,x1]=KAPI.x, u=KAPI.ust, Z=ARKA-2;
  kutuDoku(P,isik,[x0-10,x1+10],[0,u+12],[ARKA-4,ARKA],[150,146,132],5100,{doku:'tas',kenar:.4,ust:false}); // söve
  const q=[[x0,0,Z-2.5],[x1,0,Z-2.5],[x1,u,Z-2.5],[x0,u,Z-2.5]];
  cokgen3(P,q,golgele(DEMIR,.7));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  for(let i=0;i<14;i++){const s=P.n(x0+R()*(x1-x0),R()*u,Z); leke(s[0],s[1],8+R()*24,8+R()*30,R()<.55?[40,30,22]:[150,150,140],.15+R()*.15);} // pas ve parlama
  const L=P.n(x0+20,120,Z), Lo=P.olcek(x0,120,Z); leke(L[0],L[1],30*Lo,90*Lo,[180,180,170],.18);
  // kuşaklar ve perçinler
  for(const y of[18,96,174]){const b=[[x0,y,Z-3],[x1,y,Z-3],[x1,y+12,Z-3],[x0,y+12,Z-3]]; cokgen3(P,b,golgele(DEMIR,.82)); hat3(P,b,MUREKKEP,.5,.9,5110+y,1,.4,true);
    for(let x=x0+6;x<x1;x+=10){const s=P.n(x,y+6,Z-3.5), o=P.olcek(x,y,Z); c.fillStyle='rgb(30,30,28)'; c.beginPath(); c.arc(s[0],s[1],1.4*o,0,TAU); c.fill(); c.fillStyle='rgba(220,220,210,.5)'; c.fillRect(s[0]-1*o,s[1]-1*o,.8*o,.8*o);}}
  c.restore();
  hat3(P,q,MUREKKEP,.8,1.3,5120,2,1,true);
  // menteşeler, sürgü, kilit, gözetleme deliği
  for(const y of[30,150]) cokgen3(P,[[x1-2,y,Z-4],[x1+8,y,Z-4],[x1+8,y+10,Z-4],[x1-2,y+10,Z-4]],[34,34,32]);
  kutuDoku(P,isik,[x0+6,x0+22],[84,104],[Z-8,Z-3],golgele(DEMIR,.6),5130,{doku:'duz',cizgi:.6,kenar:.3});
  { const s=P.n(x0+14,90,Z-8.2); c.fillStyle='rgb(8,8,8)'; c.fillRect(s[0]-1,s[1]-3,2,5); }
  hat3(P,[[x0+8,120,Z-4],[x0+44,120,Z-4]],[30,30,28],1,3,5131,1,.2); // sürgü
  const g=[[x0+30,140,Z-3],[x0+58,140,Z-3],[x0+58,160,Z-3],[x0+30,160,Z-3]]; cokgen3(P,g,[10,10,10]);
  for(let i=1;i<4;i++) hat3(P,[[x0+30+i*7,140,Z-3.5],[x0+30+i*7,160,Z-3.5]],[90,92,90],1,1.4,5140+i,1,.1);
  kutuDoku(P,isik,[x0-4,x1+4],[0,4],[Z-12,Z],[90,88,80],5150,{doku:'tas',kenar:.4}); // eşik
}

// yazı masası, sandalye ve üstündekiler
function masa(P,R){
  const [x0,x1]=MASA.x, [,y1]=MASA.y, [z0,z1]=MASA.z;
  // sandalye (masanın arkasında; arkalık görünür)
  const sx=190, sz=z1+34;
  for(const x of[sx-20,sx+16]) kutuDoku(P,isik,[x,x+4],[0,96],[sz+18,sz+22],golgele(AHSAP,.85),5200+x,{doku:'tahta',en:4,yonOn:'v',kenar:0});
  kutuDoku(P,isik,[sx-20,sx+20],[44,48],[sz-14,sz+20],golgele(AHSAP,.9),5202,{doku:'tahta',en:8});
  for(const y of[66,86]) kutuDoku(P,isik,[sx-20,sx+20],[y,y+6],[sz+18,sz+21],golgele(AHSAP,.9),5203+y,{doku:'tahta',en:6,kenar:.3});
  // masa: ayaklar, etek, kalın tabla
  for(const x of[x0+4,x1-10]) kutuDoku(P,isik,[x,x+6],[0,y1-4],[z0+4,z0+10],AHSAP,5210+x,{doku:'tahta',en:6,yonOn:'v'});
  kutuDoku(P,isik,[x0+2,x1-2],[y1-18,y1-4],[z0+2,z1-4],golgele(AHSAP,.85),5212,{doku:'tahta',en:14,ust:false});
  for(const x of[x0+28,x1-48]){const k=P.n(x+10,y1-11,z0+2); c.fillStyle='rgb(30,24,18)'; c.fillRect(k[0]-3,k[1]-1,6,2.4);} // çekmece kulpları
  kutuDoku(P,isik,[x0-3,x1+3],[y1-4,y1],[z0-3,z1],AHSAP,5213,{doku:'tahta',en:16,kenar:.5});
  // yeşil çuha altlık
  cokgen3(P,[[x0+10,y1+.2,z0+8],[x1-40,y1+.2,z0+8],[x1-40,y1+.2,z1-10],[x0+10,y1+.2,z1-10]],[96,112,90]);
  // nöbet defteri: açık iki sayfa, satırlar, el yazısı
  const D=[x0+24,x0+92], dz=[z0+16,z0+52], ort=(D[0]+D[1])/2;
  kutuDoku(P,isik,[D[0]-2,D[1]+2],[y1,y1+1.2],[dz[0]-2,dz[1]+2],[70,40,34],5240,{doku:'duz',cizgi:.4,kenar:0}); // cilt (alt kapak)
  for(const [a,b] of[[D[0],ort],[ort,D[1]]]){const q=[[a,y1+1.4,dz[0]],[b,y1+(a===D[0]?1:.9),dz[0]],[b,y1+1.4,dz[1]],[a,y1+1.6,dz[1]]]; cokgen3(P,q,[214,208,186]); hat3(P,q,MUREKKEP,.45,.8,5220+a,1,.3,true);
    for(let i=0;i<9;i++){const z=dz[1]-4-i*3.6, w=(b-a-6)*(.5+R()*.5); hat3(P,[[a+3,y1+1.6,z],[a+3+w,y1+1.6,z]],[40,40,50],.55,.7,5230+a+i,1,.3);}}
  hat3(P,[[ort,y1+.6,dz[0]],[ort,y1+.6,dz[1]]],[60,50,40],.7,1,5241,1,.2);
  // hokka ve divit
  torna(P,isik,x0+108,z0+40,[[4,y1],[4.4,y1+4],[2,y1+6],[2.2,y1+7.5]],[30,32,34],5250,{dilim:14,ustRenk:[8,8,8]});
  hat3(P,[[x0+98,y1+1,z0+22],[x0+118,y1+3,z0+40]],[20,18,16],1,1.4,5251,1,.2);
  // gaz lambası (sönük) masanın arka köşesinde
  const lx=x0+30, lz=z1-16;
  torna(P,isik,lx,lz,[[6,y1],[6,y1+1.5],[2.4,y1+3],[2.2,y1+7],[7,y1+11],[7.2,y1+15],[4,y1+19],[3.4,y1+21]],[150,146,130],5260,{dilim:18,ustRenk:[40,36,30]});
  torna(P,isik,lx,lz,[[3.6,y1+21],[4.8,y1+25],[4.6,y1+29],[2.4,y1+33],[2.2,y1+41]],[196,198,188],5261,{dilim:18,cizgi:.4,ustRenk:[30,28,24]});
  // kâğıt destesi
  for(let i=0;i<4;i++) cokgen3(P,[[x1-60+i,y1+.5+i*.4,z0+14-i],[x1-18+i,y1+.5+i*.4,z0+12+i],[x1-16,y1+.5+i*.4,z0+50],[x1-58,y1+.5+i*.4,z0+52-i]],i%2?[200,194,172]:[186,180,160]);
  kenarIsigi(P,[x0-3,y1,z0-3],[x1+3,y1,z0-3],R,{alfa:.4});
}

export default {
  id:'karakol',
  kamera:{odak:860, yukseklik:152, egim:.21},
  isik,
  yuvalar:{
    'zemin-on':      {duzlem:'zemin', konum:[-26,0,236], yuzey:'tas', alan:14, aci:1.5},
    'zemin-orta':    {duzlem:'zemin', konum:[24,0,436], yuzey:'tas', alan:7, aci:1.5},
    'zemin-kose':    {duzlem:'zemin', konum:[-204,0,470], yuzey:'tas', alan:6},
    'tufeklik-dibi': {duzlem:'zemin', konum:[-70,0,456], yuzey:'tas', alan:5},
    'esik':          {duzlem:'zemin', konum:[116,4,494], yuzey:'tas', alan:4},
    'duvar':         {duzlem:'arka', konum:[42,150,ARKA], yuzey:'siva', alan:4},
    'masa-ustu':     {duzlem:'ust', konum:[124,MASA.y[1],318], yuzey:'tahta', alan:4, uygunsuz:['un']},
    'beden':         {duzlem:'zemin', konum:[-92,0,342], aci:.22, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(5813);
    c.fillStyle='#16150f'; c.fillRect(0,0,1000,750);
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[120,112,96],R,{en:14,yon:'u',boy:[300,500],asinma:0,derz:.45});
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1],PEN.y[0],ARKA]]); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.15,yama:1});
    etekBandi(P,[0,0,ARKA],DUZLEM.arka,[SOL,SAG],112,R,.5);
    c.restore();
    duzlemde(P,[0,0,ARKA],DUZLEM.arka,()=>{c.strokeStyle='rgba(20,18,14,.5)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(SOL,-112); c.lineTo(SAG,-112); c.stroke();}); // boya sınırı çizgisi
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.15,yama:0});
    etekBandi(P,[SOL,0,0],DUZLEM.sol,[150,ARKA],112,R,.5);
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.15,yama:0});
    etekBandi(P,[SAG,0,0],DUZLEM.sag,[-ARKA,-150],112,R,.5);
    tasDoseme(P,isik,[SOL,SAG],[150,ARKA],ZEMIN,R,{boy:44,derz:[80,74,62],sars:.18,asinma:.7});
    const pk=[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[1],PEN.y[0],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[0],PEN.y[1],ARKA]];
    gunesLekesi(P,pk,GUNES,.36,{parmak:4});
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    pencere(P,isik,ARKA,PEN.x,PEN.y,R,{derin:44,parmak:4,kanat:false});
    for(const y of[150,172]) hat3(P,[[PEN.x[0],y,ARKA+24],[PEN.x[1],y,ARKA+24]],[22,20,18],1,2.4,5300+y,1,.2);
    // duvarda: çerçeveli talimatname, takvim yaprağı, anahtar halkası
    duzlemde(P,[-40,186,ARKA-.5],DUZLEM.arka,()=>{c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(-12,-15,28,36); c.fillStyle='rgb(60,46,32)'; c.fillRect(-15,-18,30,38); c.fillStyle='rgb(200,194,170)'; c.fillRect(-12,-15,24,32);
      c.fillStyle='rgba(30,26,22,.8)'; c.fillRect(-8,-11,16,1.6); for(let i=0;i<8;i++) c.fillRect(-9,-6+i*2.6,18-((i*5)%7),.7);});
    duzlemde(P,[210,150,ARKA-.5],DUZLEM.arka,()=>{c.fillStyle='rgba(0,0,0,.3)'; c.fillRect(-7,-7,16,22); c.fillStyle='rgb(206,200,180)'; c.fillRect(-9,-9,16,22); c.fillStyle='rgb(130,40,34)'; c.fillRect(-9,-9,16,4); c.fillStyle='rgba(30,26,22,.85)'; c.font='bold 8px serif'; c.fillText('12',-6,8);});
    duzlemde(P,[66,120,ARKA-.5],DUZLEM.arka,()=>{c.strokeStyle='rgb(40,38,34)'; c.lineWidth=.9; c.beginPath(); c.arc(0,5,4,0,TAU); c.stroke(); c.fillStyle='rgb(40,38,34)'; c.fillRect(-1,8,1.4,9); c.fillRect(1.6,8,1.2,7); c.fillStyle='rgba(0,0,0,.3)'; c.fillRect(2,10,2,8);});
    tufeklik(P,R);
    demirKapi(P,R);
    masa(P,R);
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(-188,180,ARKA), b=P.n(-100,0,300), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(140,136,116,.15)'); g.addColorStop(1,'rgba(140,136,116,0)');
    c.beginPath(); yol3(P,[[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1]+110,0,280],[PEN.x[0]+70,0,300]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[1000,60,260,220,.4],[1000,740,240,160,.32],[0,740,200,140,.25]]);
  }
};
