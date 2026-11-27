// Köy okulu, tek derslik: arka duvarda tebeşir yazılı kara tahta, solunda Türkiye haritası, en solda pencere; önde iki sıra
// halinde arkalıklı çift kişilik tahta sıralar, ortada geçit; sağda dökme demir soba, borusu duvara gider, yanında odun;
// tahtanın önünde öğretmen masası (zil, kitaplar). Tek ışık: pencere (sol arka). Gölgeler sağa ve makineye doğru.
import {c} from '../../../teknik/tuval.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {cokgen3,hat3,yol3,golgele,aydinlik} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,MUREKKEP,kenarIsigi} from '../mekan-yardim.js';
import {badanaDuvar,etekBandi,dipGolgesi,kutuDoku,tahtaYuzey,torna,pencere,gunesLekesi} from '../ic-yardim.js';

const SIVA=[188,182,164], AHSAP=[120,98,70], SIRA=[104,84,60], DEMIR=[78,76,70], KARA=[34,38,34];
const ARKA=520, SOL=-252, SAG=252, TAVAN=250;
const PEN={x:[-236,-160], y:[100,206]};
const TAHTA={x:[-12,168], y:[92,196]};
const HARITA={x:[-140,-34], y:[126,182]};
const SOBA={x:142, z:330, r:23};
const MASA={x:[34,160], y:[0,76], z:[458,508]};
const isik={konum:[-198,160,488], guc:1.6, menzil:420, ortam:.36};
const GUNES=[.34,-.8,-1];

// Türkiye haritasının kaba sınırı (0..100 × 0..45, y aşağı): küçük boyda tanınacak kadar
const TURKIYE=[[2,10],[6,6],[12,5],[15,8],[17,8],[22,6],[30,5],[38,3],[46,2],[55,4],[62,3],[70,4],[78,6],[85,5],[92,7],[98,10],[97,16],[99,22],[96,28],[92,30],
  [85,31],[76,32],[70,33],[67,38],[63,36],[60,34],[54,35],[48,33],[43,36],[38,37],[33,36],[27,38],[22,37],[17,35],[12,34],[8,30],[6,26],[4,22],[7,18],[4,15],[8,13],[14,12],[16,10],[12,11],[6,13],[2,13]];

// Arkalıklı çift kişilik sıra: yan tahtalar, öndeki kapalı bölme, eğik yazı yüzü, oturak ve arkalık. zs: arkalığın Z'si
function sira(P,[x0,x1],zs,R,t){
  const top=[[x0,72,zs+36],[x1,72,zs+36],[x1,80,zs+70],[x0,80,zs+70]];
  // yan tahtalar
  for(const x of[x0,x1-4]) kutuDoku(P,isik,[x,x+4],[0,80],[zs,zs+70],SIRA,t+x,{doku:'tahta',en:10,cizgi:.5,kenar:.3});
  kutuDoku(P,isik,[x0+4,x1-4],[34,78],[zs+66,zs+70],golgele(SIRA,.95),t+1,{doku:'tahta',en:11,ust:false}); // ön bölme
  kutuDoku(P,isik,[x0+4,x1-4],[52,54],[zs+40,zs+66],golgele(SIRA,.7),t+2,{doku:'duz',cizgi:.4,kenar:0}); // kitap rafı
  // eğik yazı yüzü
  const a=aydinlik(isik,[(x0+x1)/2,76,zs+52],[0,.97,-.23]);
  cokgen3(P,top,golgele(SIRA,a*1.05));
  c.save(); c.beginPath(); yol3(P,top); c.clip();
  for(let i=0;i<8;i++){const f=(i+.5)/8; hat3(P,[[x0,72+8*f,zs+36+34*f],[x1,72+8*f+(R()-.5)*.6,zs+36+34*f]],[0,0,0],.12,.8,t+10+i,1,.4);}
  for(let i=0;i<5;i++){const s=P.n(x0+R()*(x1-x0),76,zs+52), o=P.olcek(x0,76,zs+52); leke(s[0],s[1],(6+R()*14)*o,(2+R()*4)*o,R()<.5?[10,8,10]:[200,180,140],.18);} // mürekkep lekesi, aşınma
  for(const f of[.25,.75]){const s=P.n(x0+(x1-x0)*f,79,zs+66), o=P.olcek(x0,79,zs+66); c.fillStyle='rgba(8,8,8,.85)'; c.beginPath(); c.ellipse(s[0],s[1],2.4*o,1.1*o,0,0,TAU); c.fill();} // hokka yuvası
  c.restore();
  hat3(P,top,MUREKKEP,.6,1.1,t+3,2,1,true); kenarIsigi(P,top[0],top[1],R,{alfa:.4});
  // oturak ve arkalık
  kutuDoku(P,isik,[x0+4,x1-4],[38,42],[zs+2,zs+28],golgele(SIRA,1.05),t+4,{doku:'tahta',en:8,kenar:.4});
  kutuDoku(P,isik,[x0+4,x1-4],[50,58],[zs,zs+3],golgele(SIRA,.95),t+5,{doku:'tahta',en:8,kenar:.4});
  kutuDoku(P,isik,[x0+4,x1-4],[64,71],[zs,zs+3],golgele(SIRA,.95),t+6,{doku:'tahta',en:8,kenar:.4});
}

// kara tahta: tahta çerçeve, silinmiş tebeşir bulutları, yazılar, tebeşirlik
function karaTahta(P,R){
  const [x0,x1]=TAHTA.x, [y0,y1]=TAHTA.y;
  kutuDoku(P,isik,[x0-6,x1+6],[y0-6,y1+6],[ARKA-3,ARKA],golgele(AHSAP,.8),4000,{doku:'tahta',en:6,ust:false});
  const q=[[x0,y0,ARKA-3.5],[x1,y0,ARKA-3.5],[x1,y1,ARKA-3.5],[x0,y1,ARKA-3.5]];
  cokgen3(P,q,golgele(KARA,aydinlik(isik,[(x0+x1)/2,140,ARKA],[0,0,-1])*1.3));
  c.save(); c.beginPath(); yol3(P,q); c.clip();
  for(let i=0;i<9;i++){const s=P.n(x0+R()*(x1-x0),y0+R()*(y1-y0),ARKA); leke(s[0],s[1],30+R()*60,10+R()*20,[150,156,146],.08+R()*.08,(R()-.5)*.4);} // silgi izi
  duzlemde(P,[x0,y1,ARKA-3.6],DUZLEM.arka,()=>{
    c.fillStyle='rgba(210,214,204,.8)'; c.font='italic 9px serif'; c.textBaseline='top';
    c.fillText('Çarşamba',8,6); c.fillText('125',22,24); c.fillText('+ 38',18,35);
    c.fillRect(17,46,24,.8); c.fillText('163',22,49);
    c.fillText('7 × 8 = 56',80,26); c.fillText('9 × 6 = 54',80,40); c.fillText('Tarla, çapa,',80,62); c.fillText('orak, harman.',80,74);
    c.strokeStyle='rgba(210,214,204,.5)'; c.lineWidth=.6; c.beginPath(); c.moveTo(72,20); c.lineTo(72,94); c.stroke();
  });
  c.restore();
  kutuDoku(P,isik,[x0,x1],[y0-8,y0-6],[ARKA-10,ARKA],golgele(AHSAP,.8),4001,{doku:'duz',kenar:.4}); // tebeşirlik
  for(const [x,l] of[[30,6],[38,4],[120,5]]){const s=P.n(x,y0-5.6,ARKA-6), e=P.n(x+l,y0-5.6,ARKA-5); c.strokeStyle='rgb(220,220,210)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(e[0],e[1]); c.stroke();}
  // silgi
  kutuDoku(P,isik,[140,152],[y0-6,y0-2],[ARKA-9,ARKA-4],[80,70,60],4002,{doku:'duz',cizgi:.4,kenar:0});
}

function harita(P){
  const [x0,x1]=HARITA.x, [y0,y1]=HARITA.y;
  duzlemde(P,[x0,y1,ARKA-1],DUZLEM.arka,()=>{
    const w=x1-x0, h=y1-y0;
    c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(3,3,w,h);
    c.fillStyle='rgb(170,176,168)'; c.fillRect(0,0,w,h);             // deniz
    c.save(); c.translate(w*.05,h*.12); c.scale(w*.9/100,h*.76/45);
    c.beginPath(); TURKIYE.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath();
    c.fillStyle='rgb(208,196,160)'; c.fill(); c.strokeStyle='rgba(40,34,26,.8)'; c.lineWidth=.6; c.stroke();
    c.fillStyle='rgba(120,90,60,.35)'; for(const [x,y,rx,ry] of[[40,18,12,5],[70,20,14,6],[86,14,8,5],[60,30,10,3]]){c.beginPath(); c.ellipse(x,y,rx,ry,0,0,TAU); c.fill();} // dağlar
    c.strokeStyle='rgba(40,40,60,.45)'; c.lineWidth=.4; c.beginPath(); c.moveTo(50,8); c.quadraticCurveTo(56,18,52,30); c.moveTo(78,10); c.quadraticCurveTo(76,22,72,32); c.stroke(); // ırmaklar
    c.fillStyle='rgb(30,26,20)'; for(const [x,y] of[[13,10],[34,16],[68,33],[84,24]]){c.beginPath(); c.arc(x,y,.9,0,TAU); c.fill();}
    c.restore();
    c.fillStyle='rgba(30,26,20,.7)'; c.fillRect(w*.3,h*.9,w*.4,1.2); // başlık şeridi
    c.strokeStyle='rgba(20,16,12,.8)'; c.lineWidth=1; c.strokeRect(0,0,w,h);
    c.fillStyle='rgb(70,54,36)'; c.fillRect(-3,-3,w+6,3); c.fillRect(-3,h,w+6,3);    // üst ve alt çıta
    c.strokeStyle='rgb(40,34,26)'; c.lineWidth=.6; c.beginPath(); c.moveTo(w*.2,-3); c.lineTo(w/2,-14); c.lineTo(w*.8,-3); c.stroke(); // askı ipi
    c.fillStyle='rgba(40,30,20,.25)'; c.fillRect(w*.62,h*.05,w*.3,h*.9);              // sararmış, kıvrık yer
  });
}

// dökme demir soba: dört ayak, gövde, kapak, üst halka; boru yukarı çıkıp arka duvara kıvrılır
function soba(P,R){
  const {x:X,z:Z,r:rr}=SOBA;
  duzlemde(P,[X,0,Z],DUZLEM.zemin,()=>{leke(16,-30,40,26,[0,0,0],.45);}); // gölge sağa geri
  for(const a of[.8,2.3,3.9,5.5]) hat3(P,[[X+Math.cos(a)*rr*.8,16,Z+Math.sin(a)*rr*.8],[X+Math.cos(a)*rr*1.05,0,Z+Math.sin(a)*rr*1.05]],DEMIR,1,3.2,4100+a*10,1,.2);
  torna(P,isik,X,Z,[[rr*.9,14],[rr,18],[rr,84],[rr*1.08,88],[rr*1.08,92],[rr*.6,94]],DEMIR,4110,{dilim:24,ustRenk:[50,48,44]});
  // kapak ve hava deliği
  const kp=[[X-10,52,Z-rr+1],[X+6,52,Z-rr+1],[X+6,72,Z-rr+1],[X-10,72,Z-rr+1]];
  cokgen3(P,kp,[30,28,26]); hat3(P,kp,MUREKKEP,.7,1.1,4120,1,.4,true);
  hat3(P,[[X+2,62,Z-rr],[X+8,62,Z-rr]],[150,146,130],.8,1.4,4121,1,.2);
  kenarIsigi(P,[X-rr*.9,20,Z-rr*.35],[X-rr*.9,84,Z-rr*.35],R,{alfa:.5,parca:4});
  // boru: dik çıkar, dirsekle duvara gider
  torna(P,isik,X,Z,[[5.5,94],[5.5,206]],golgele(DEMIR,.95),4130,{dilim:14,ust:false});
  for(let y=112;y<206;y+=36) hat3(P,[[X-5.5,y,Z-1],[X+5.5,y,Z-1]],[20,20,18],.5,1,4131+y,1,.2);
  const a=P.n(X,212,Z), b=P.n(X,212,ARKA), o=P.olcek(X,212,Z), o2=P.olcek(X,212,ARKA);
  c.fillStyle='rgb(44,42,38)'; c.beginPath(); c.moveTo(a[0]-5.5*o,a[1]-6*o); c.lineTo(b[0]-5.5*o2,b[1]-6*o2); c.lineTo(b[0]+5.5*o2,b[1]+6*o2); c.lineTo(a[0]+5.5*o,a[1]+6*o); c.closePath(); c.fill();
  c.strokeStyle='rgba(170,166,150,.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(a[0]-4*o,a[1]+4*o); c.lineTo(b[0]-4*o2,b[1]+4*o2); c.stroke();
  torna(P,isik,X,Z,[[6,204],[6,214]],golgele(DEMIR,.9),4140,{dilim:14,ust:false});
  duzlemde(P,[X,212,ARKA],DUZLEM.arka,()=>{leke(0,-10,24,30,[0,0,0],.4);}); // duvardaki is
  // odun yığını ve kömür kovası
  for(let i=0;i<11;i++){const k=i<5?0:i<9?1:2, j=k===0?i:k===1?i-5:i-9, x=X+30+j*9+k*4.5, y=4.5+k*8, zz=Z+48;
    const s=P.n(x,y,zz-26), e=P.n(x+(R()-.5)*4,y,zz+30), o2=P.olcek(x,y,zz-26);
    c.strokeStyle=`rgb(${70+R()*30|0},${58+R()*20|0},${44+R()*16|0})`; c.lineWidth=8*o2; c.lineCap='round'; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(e[0],e[1]); c.stroke();
    c.fillStyle='rgb(112,96,74)'; c.beginPath(); c.ellipse(s[0],s[1],4*o2,3.6*o2,0,0,TAU); c.fill(); c.strokeStyle='rgba(30,22,14,.7)'; c.lineWidth=.8; c.stroke(); c.fillStyle='rgba(40,28,18,.6)'; c.beginPath(); c.arc(s[0]+(R()-.5)*o2,s[1],1.1*o2,0,TAU); c.fill();}
}

export default {
  id:'okul',
  kamera:{odak:860, yukseklik:166, egim:.25},
  isik,
  yuvalar:{
    'zemin-on':  {duzlem:'zemin', konum:[-40,0,226], yuzey:'tahta', alan:12, aci:1.5},
    'zemin-orta':{duzlem:'zemin', konum:[8,0,490], yuzey:'tahta', alan:5, aci:1.5},
    'zemin-kose':{duzlem:'zemin', konum:[-78,0,506], yuzey:'tahta', alan:3},
    'duvar':     {duzlem:'arka', konum:[-198,66,ARKA], yuzey:'siva', alan:4},
    'soba-dibi': {duzlem:'zemin', konum:[96,0,282], yuzey:'tahta', alan:5},
    'sira-ustu': {duzlem:'ust', konum:[-150,42,334], yuzey:'tahta', alan:5, uygunsuz:['un']},
    'masa-ustu': {duzlem:'ust', konum:[74,MASA.y[1],482], yuzey:'tahta', alan:5},
    'beden':     {duzlem:'zemin', konum:[-2,0,352], aci:1.5, ortu:'kilim'}
  },
  ciz(P,r){
    const R=rng(7341), Mz=MASA;
    c.fillStyle='#16150f'; c.fillRect(0,0,1000,750);
    tahtaYuzey(P,isik,[0,TAVAN,0],DUZLEM.ust,[SOL,SAG,-ARKA,-150],[150,140,118],R,{en:12,yon:'u',boy:[300,500],asinma:0,derz:.45}); // tahta tavan
    c.save(); c.beginPath(); c.rect(0,0,1000,750); yol3(P,[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1],PEN.y[0],ARKA]]); c.clip('evenodd');
    badanaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-TAVAN,0],SIVA,R,{is:.15,yama:1});
    etekBandi(P,[0,0,ARKA],DUZLEM.arka,[SOL,SAG],84,R,.4);
    c.restore();
    badanaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[150,ARKA,-TAVAN,0],SIVA,R,{is:.15,yama:0});
    badanaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-150,-TAVAN,0],SIVA,R,{is:.15,yama:0});
    etekBandi(P,[SAG,0,0],DUZLEM.sag,[-ARKA,-150],84,R,.4);
    // tahta döşeme: boyuna tahtalar
    tahtaYuzey(P,isik,[0,0,0],DUZLEM.zemin,[SOL,SAG,-ARKA,-150],[128,110,84],R,{en:17,yon:'v',boy:[200,380],asinma:.8});
    const pk=[[PEN.x[0],PEN.y[0],ARKA],[PEN.x[1],PEN.y[0],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[0],PEN.y[1],ARKA]];
    gunesLekesi(P,pk,GUNES,.34,{parmak:1});
    dipGolgesi(P,[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]],7,.45);
    pencere(P,isik,ARKA,PEN.x,PEN.y,R,{derin:34,parmak:1});
    harita(P);
    karaTahta(P,R);
    // öğretmen masası: dört ayak, çekmece, üstte kitaplar ve zil
    for(const x of[Mz.x[0]+3,Mz.x[1]-7]) kutuDoku(P,isik,[x,x+4],[0,Mz.y[1]-4],[Mz.z[0]+2,Mz.z[0]+6],AHSAP,4200+x,{doku:'tahta',en:4,yonOn:'v',kenar:0});
    kutuDoku(P,isik,[Mz.x[0],Mz.x[1]],[Mz.y[1]-16,Mz.y[1]-4],[Mz.z[0],Mz.z[1]],golgele(AHSAP,.9),4201,{doku:'tahta',en:12,ust:false});
    kutuDoku(P,isik,[Mz.x[0]-3,Mz.x[1]+3],[Mz.y[1]-4,Mz.y[1]],[Mz.z[0]-3,Mz.z[1]],AHSAP,4202,{doku:'tahta',en:12,kenar:.45});
    { const k=P.n((Mz.x[0]+Mz.x[1])/2,Mz.y[1]-10,Mz.z[0]); c.fillStyle='rgb(24,20,16)'; c.fillRect(k[0]-3,k[1]-1,6,2); }
    kutuDoku(P,isik,[120,148],[Mz.y[1],Mz.y[1]+4],[472,492],[120,60,50],4203,{doku:'duz',kenar:.3});
    kutuDoku(P,isik,[122,146],[Mz.y[1]+4,Mz.y[1]+7],[474,490],[70,80,100],4204,{doku:'duz',kenar:.3});
    torna(P,isik,104,476,[[4.4,Mz.y[1]],[3.2,Mz.y[1]+6],[1.6,Mz.y[1]+8],[.8,Mz.y[1]+13],[1.6,Mz.y[1]+15]],[160,130,80],4205,{dilim:14,ustRenk:[40,30,20]}); // zil
    hat3(P,[[44,Mz.y[1]+.4,470],[100,Mz.y[1]+.4,500]],[200,190,160],.8,1.6,4206,1,.2); // cetvel
    // sıralar: arkadan öne
    sira(P,[-238,-100],410,R,4710); sira(P,[-238,-100],316,R,4616); sira(P,[88,238],410,R,4810);
    soba(P,R);
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.08,leke:.07});
    c.save(); c.globalCompositeOperation='screen';
    const a=P.n(-198,180,ARKA), b=P.n(-110,0,330), g=c.createLinearGradient(a[0],a[1],b[0],b[1]);
    g.addColorStop(0,'rgba(140,136,116,.14)'); g.addColorStop(1,'rgba(140,136,116,0)');
    c.beginPath(); yol3(P,[[PEN.x[0],PEN.y[1],ARKA],[PEN.x[1],PEN.y[1],ARKA],[PEN.x[1]+90,0,300],[PEN.x[0]+60,0,310]]); c.fillStyle=g; c.fill();
    c.restore();
    karanlik([[1000,80,240,200,.38],[1000,740,220,150,.3],[0,740,200,140,.25],[0,40,160,120,.2]]);
  }
};
