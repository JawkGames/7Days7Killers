// Demirci dükkânı: solda közü sönmemiş ocak ve isli davlumbaz, yanında deri körük; ortada kütük üstünde örs;
// sağda arka duvarda çivilere asılı aletler. Tek ışık: makinenin arkasında, sokağa tümden açık dükkân ağzından giren
// gün ışığı (önden ve biraz yukarıdan); gölgeler duvarlara doğru düşer. Ocaktaki köz yalnızca sıcak bir parıltı verir.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {kutu,silindir,cokgen3,hat3,yol3,aydinlik,golgele} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,tasOrgu,sivaDuvar,zemin,karanlik,atmosfer,leke,MUREKKEP} from '../mekan-yardim.js';
import {isikDusmesi,yuzDoku} from './halil-evi.js';

const ISLI=[100,94,84], TAS=[128,120,104], SIVA=[132,124,108], TOPRAK=[100,92,78], AHSAP=[112,94,70], DEMIR=[92,92,90], DERI=[118,94,68];
const ARKA=480, SOL=-300, SAG=300;
const OCAK={x:[-246,-62], y:[0,72], z:[388,ARKA]}, KOZ=[-152,74,432];
const ORS={x:95, z:330, r:24, h:58};
const isik={konum:[70,200,30], guc:1.45, menzil:560, ortam:.3};

// arka duvarda çiviye asılı alet (yerel düzlem: çivi 0,0; y aşağı). Alet ışığı soldan alır, gölgesi sağa düşer.
function asili(P,X,Y,ciz,t){
  duzlemde(P,[X,Y,ARKA],DUZLEM.arka,()=>{
    c.save(); c.translate(4,3); c.globalAlpha=.55; ciz(true); c.restore(); // duvara düşen gölge
    ciz(false);
    c.fillStyle='rgba(30,28,24,1)'; c.beginPath(); c.arc(0,0,1,0,TAU); c.fill();
  });
}
const demirYol=(golge,renk=DEMIR)=>golge?'rgba(0,0,0,.8)':rgba(renk,1);

export default {
  id:'demirci-dukkani',
  kamera:{odak:880, yukseklik:150, egim:.27},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[60,0,215], yuzey:'toprak', alan:18},
    'ocak-onu':   {duzlem:'zemin', konum:[-150,0,338], yuzey:'toprak', alan:12},
    'ors-dibi':   {duzlem:'zemin', konum:[70,0,286], yuzey:'toprak', alan:6},
    'zemin-kose': {duzlem:'zemin', konum:[188,0,372], yuzey:'toprak', alan:8},
    'duvar':      {duzlem:'arka', konum:[205,166,ARKA], yuzey:'siva', alan:3},
    'ocak-kenari':{duzlem:'ust', konum:[-86,OCAK.y[1],404], yuzey:'tas', alan:5},
    'beden':      {duzlem:'zemin', konum:[-46,0,292], aci:.42, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(7731), O=OCAK;
    c.fillStyle='#090a08'; c.fillRect(0,0,1000,750);
    // duvarlar: kerpiç üstü sıva, isle kararmış; ocağın üstü kapkara
    sivaDuvar(P,isik,[0,0,ARKA],DUZLEM.arka,[SOL,SAG,-330,0],SIVA,R,{is:.3});
    duzlemde(P,[0,0,ARKA],DUZLEM.arka,()=>{leke(-150,-230,150,130,[0,0,0],.55); leke(-60,-280,240,90,[0,0,0],.35); for(let i=0;i<10;i++) leke((R()-.5)*560,-R()*300,30+R()*80,40+R()*90,[0,0,0],.12+R()*.15);});
    sivaDuvar(P,isik,[SOL,0,0],DUZLEM.sol,[100,ARKA,-330,0],SIVA,R,{is:.35});
    sivaDuvar(P,isik,[SAG,0,0],DUZLEM.sag,[-ARKA,-100,-330,0],SIVA,R,{is:.35});
    zemin(P,isik,[SOL,SAG],[150,ARKA],TOPRAK,R,{tohum:810,doku:1.3});
    // dükkân ağzından giren ışık: önde güçlü, derine doğru söner (kenarı yumuşak)
    isikDusmesi(P,[[-330,0,170],[330,0,170],[300,0,430],[-300,0,430]],[40,0,190],[0,0,440],.7);
    // kömür tozu ve tufal (dövülen demirden dökülen pul): örsün çevresinde parlak kırıntı
    duzlemde(P,[ORS.x,0,ORS.z],DUZLEM.zemin,()=>{leke(0,0,90,60,[0,0,0],.45); for(let i=0;i<90;i++){const a=R()*TAU, u=20+R()*70; c.fillStyle=R()<.3?'rgba(170,166,150,.5)':'rgba(10,10,10,.7)'; c.fillRect(Math.cos(a)*u,Math.sin(a)*u*.8,1+R()*1.6,1+R()*1.2);}});
    for(const q of[[SOL,ARKA,SAG,ARKA],[SOL,150,SOL,ARKA],[SAG,150,SAG,ARKA]]){const s0=P.n(q[0],0,q[1]), s1=P.n(q[2],0,q[3]); c.strokeStyle='rgba(0,0,0,.6)'; c.lineWidth=8; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();}
    // duvardaki aletler (soldan sağa): maşalar, iki çekiç, nallar, törpü; arada boş yer (duvar yuvası)
    asili(P,96,176,g=>{c.fillStyle=demirYol(g); c.beginPath(); c.moveTo(-1,0); c.lineTo(-4,48); c.lineTo(-2,58); c.lineTo(-.5,48); c.lineTo(1,0); c.closePath(); c.moveTo(1,0); c.lineTo(5,48); c.lineTo(3,58); c.lineTo(1.5,48); c.lineTo(-1,0); c.closePath(); c.fill(); c.beginPath(); c.arc(0,1,2.4,0,TAU); c.strokeStyle=demirYol(g); c.lineWidth=1.2; c.stroke();},901);
    asili(P,116,178,g=>{c.fillStyle=demirYol(g); c.beginPath(); c.moveTo(-1,0); c.lineTo(-3,42); c.lineTo(-5,52); c.lineTo(-1.6,44); c.lineTo(.8,0); c.closePath(); c.moveTo(1,0); c.lineTo(3.4,42); c.lineTo(6,51); c.lineTo(2,44); c.lineTo(-.6,0); c.closePath(); c.fill();},902);
    asili(P,142,172,g=>{c.fillStyle=g?'rgba(0,0,0,.8)':rgba(AHSAP,1); c.fillRect(-1.3,3,2.6,30); c.fillStyle=demirYol(g); c.fillRect(-6,-.5,12,4.2);},903);
    asili(P,160,170,g=>{c.fillStyle=g?'rgba(0,0,0,.8)':rgba(AHSAP,1); c.fillRect(-1.2,3,2.4,26); c.fillStyle=demirYol(g); c.fillRect(-4.5,-.5,9,3.6);},904);
    asili(P,180,174,g=>{for(let i=0;i<3;i++){c.strokeStyle=demirYol(g); c.lineWidth=2.4; c.beginPath(); c.arc(0,7+i*2.2,6,Math.PI*.1,Math.PI*.9+.0,true); c.stroke();}},905);
    asili(P,232,176,g=>{c.fillStyle=g?'rgba(0,0,0,.8)':rgba(AHSAP,1); c.fillRect(-1.6,0,3.2,10); c.fillStyle=demirYol(g); c.beginPath(); c.moveTo(-1.6,10); c.lineTo(1.6,10); c.lineTo(1,36); c.lineTo(-1,36); c.closePath(); c.fill(); if(!g){c.strokeStyle='rgba(20,20,18,.8)'; c.lineWidth=.4; for(let y=12;y<35;y+=1.6){c.beginPath(); c.moveTo(-1.4,y); c.lineTo(1.4,y+.6); c.stroke();}}},906);
    duzlemde(P,[160,174,ARKA],DUZLEM.arka,()=>{for(const q of[[96,176],[116,178],[142,172],[160,170],[180,174],[232,176]]) leke(q[0]-160+3,q[1]-174+22,10,30,[0,0,0],.2);});
    // ocağın arkasındaki duvara dayalı demir çubuklar
    for(let i=0;i<5;i++){const x=10+i*7+R()*3; hat3(P,[[x,0,ARKA-6],[x+8+R()*4,120+R()*30,ARKA-1]],DEMIR,.9,2.2,920+i,1,.5);}
    // ocak: taş seki, üstünde köz çukuru
    kutu(P,isik,O.x,O.y,O.z,TAS,930);
    tasOrgu(P,{...isik,ortam:.22,guc:1},[0,0,O.z[0]],DUZLEM.arka,[O.x[0],O.x[1],-O.y[1],0],ISLI,R,{sira:18,harc:[44,40,34],duzensiz:.4});
    tasOrgu(P,{...isik,ortam:.2,guc:.9},[O.x[1],0,0],DUZLEM.sag,[-O.z[1],-O.z[0],-O.y[1],0],ISLI,R,{sira:18,harc:[40,36,30],duzensiz:.4});
    cokgen3(P,[[O.x[0],O.y[1],O.z[0]],[O.x[1],O.y[1],O.z[0]],[O.x[1],O.y[1],O.z[1]],[O.x[0],O.y[1],O.z[1]]],[64,58,50]);
    duzlemde(P,[KOZ[0],O.y[1],KOZ[2]],DUZLEM.ust,()=>{
      c.fillStyle='rgb(14,12,10)'; c.beginPath(); c.ellipse(0,0,34,26,0,0,TAU); c.fill();
      leke(0,0,26,20,[255,220,150],.7);
      for(let i=0;i<90;i++){const a=R()*TAU, u=Math.sqrt(R())*28, x=Math.cos(a)*u*1.15, y=Math.sin(a)*u*.85, s=1.6+R()*3.2, sic=Math.max(0,1-u/24)*(.5+R()*.5);
        c.fillStyle=`rgb(${20+sic*150|0},${18+sic*110|0},${14+sic*60|0})`; c.beginPath(); c.moveTo(x-s,y); c.lineTo(x-s*.2,y-s*.8); c.lineTo(x+s,y-s*.2); c.lineTo(x+s*.4,y+s*.7); c.closePath(); c.fill();}
      leke(0,0,12,9,[255,246,210],.6);
    });
    // davlumbaz: ocağın üstünde sıvalı yaşmak; alt kenarında ağaç hatıl, yukarı doğru isle kararır, bacaya daralır
    const dv=[[O.x[0]-6,152,O.z[0]-10],[O.x[1]+6,152,O.z[0]-10],[O.x[1]-34,262,ARKA-26],[O.x[0]+34,262,ARKA-26]];
    const dvSag=[[O.x[1]+6,152,O.z[0]-10],[O.x[1]+6,152,ARKA],[O.x[1]-34,262,ARKA],[O.x[1]-34,262,ARKA-26]];
    cokgen3(P,dvSag,golgele(SIVA,.42)); yuzDoku(P,dvSag,R,{sik:4,alfa:.3,lek:2}); hat3(P,dvSag,MUREKKEP,.6,1.3,942,2,1.2,true);
    cokgen3(P,dv,golgele(SIVA,.85));
    c.save(); c.beginPath(); yol3(P,dv); c.clip(); const da=P.n(KOZ[0],152,O.z[0]-10), du=P.n(KOZ[0],262,ARKA-26);
    const dg=c.createLinearGradient(0,da[1],0,du[1]); dg.addColorStop(0,'rgba(0,0,0,0)'); dg.addColorStop(.55,'rgba(0,0,0,.25)'); dg.addColorStop(1,'rgba(0,0,0,.6)'); c.fillStyle=dg; c.fillRect(0,0,1000,750);
    leke(da[0],da[1]-6,90,18,[220,170,110],.25); // alttan köz ışığı
    for(let i=0;i<9;i++){const x=O.x[0]+10+R()*(O.x[1]-O.x[0]-20), s0=P.n(x,160,O.z[0]-10); leke(s0[0],s0[1]-40-R()*60,6+R()*10,50+R()*50,[0,0,0],.12+R()*.12);} // is akıntısı
    c.restore();
    yuzDoku(P,[dv[0],dv[1],dv[2],dv[3]],R,{sik:3,alfa:.18,lek:4});
    for(let i=0;i<3;i++){let x=O.x[0]+30+R()*120, y=240; const n=[]; for(let k=0;k<5;k++){n.push([x,y,O.z[0]-10+(y-152)/110*(ARKA-26-O.z[0]+10)]); x+=(R()-.5)*10; y-=12+R()*8;} hat3(P,n,MUREKKEP,.45,1,944+i,1,.6);} // çatlak
    kutu(P,isik,[O.x[0]-10,O.x[1]+10],[144,154],[O.z[0]-14,O.z[0]-6],AHSAP,943,{cizgi:.7}); // hatıl
    yuzDoku(P,[[O.x[0]-10,144,O.z[0]-14],[O.x[1]+10,144,O.z[0]-14],[O.x[1]+10,154,O.z[0]-14],[O.x[0]-10,154,O.z[0]-14]],R,{sik:3,alfa:.4,lek:1});
    hat3(P,dv,MUREKKEP,.75,1.5,941,2,1.4,true);
    // körük: ocağın sağında sehpa üstünde; deri kıvrımlı, üst tahtası kalkık, ucu ocağa girer
    const KX=[-40,70], KZ=[420,466], ky0=42;
    for(const x of[-30,58]) for(const z of[KZ[0]+4,KZ[1]-4]) kutu(P,isik,[x-3,x+3],[0,ky0],[z-3,z+3],AHSAP,950+x+z,{cizgi:.35});
    const alt=[[KX[0],ky0,KZ[0]],[KX[1],ky0,KZ[0]],[KX[1],ky0,KZ[1]],[KX[0],ky0,KZ[1]]];
    const ust=[[KX[0],ky0+8,KZ[0]+6],[KX[1],ky0+50,KZ[0]],[KX[1],ky0+50,KZ[1]],[KX[0],ky0+8,KZ[1]-6]];
    // deri: üst ve alt tahta arasında dışa şişen kıvrımlar (her kıvrımın sırtı ışık alır)
    const kat=5, govde=[alt[0],alt[1],ust[1],ust[0]];
    cokgen3(P,govde,golgele(DERI,.36));
    c.save(); c.beginPath(); yol3(P,govde); c.clip(); const kd=P.n(KX[0]+10,ky0+10,KZ[0]); leke(kd[0],kd[1],40,30,golgele(DERI,1.2),.4); leke(kd[0]+120,kd[1]-20,90,50,[0,0,0],.45); c.restore();
    for(let i=0;i<kat;i++){ // kıvrım sırtları ve araları
      const f=(i+.5)/kat, x=KX[0]+(KX[1]-KX[0])*f, h=8+42*f, x2=KX[0]+(KX[1]-KX[0])*(i+1)/kat;
      hat3(P,[[x,ky0+1,KZ[0]-1],[x-2,ky0+h*.5,KZ[0]-6*f-2],[x,ky0+h-1,KZ[0]-1]],golgele(DERI,1.6),.9,3.2,960+i,1,.4);
      hat3(P,[[x2,ky0+1,KZ[0]],[x2-1,ky0+(8+42*(i+1)/kat)*.5,KZ[0]-1],[x2,ky0+8+42*(i+1)/kat-1,KZ[0]]],[8,6,4],.9,2.2,965+i,1,.5);
    }
    cokgen3(P,ust,golgele(AHSAP,aydinlik(isik,[15,ky0+30,443],[-.4,.9,0])));
    hat3(P,ust,MUREKKEP,.7,1.2,970,2,1,true); hat3(P,govde,MUREKKEP,.75,1.3,971,2,1,true);
    hat3(P,[[KX[0],ky0+4,443],[O.x[1]-2,ky0+2,443]],[40,40,38],1,4.5,972,1,0); // körük borusu
    hat3(P,[[KX[1]-4,ky0+50,443],[KX[1]+16,260,452]],AHSAP,.9,4,973,1,.6);       // çekme sırığı
    // kömür yığını: ocağın solunda
    for(let i=0;i<60;i++){const x=-262+R()*70, z=332+R()*50, h=Math.max(0,22-Math.hypot(x+228,z-356)*.5)*R(), s=P.n(x,h,z), o=P.olcek(x,h,z), rr=(2+R()*3)*o;
      c.fillStyle=`rgb(${16+R()*24|0},${16+R()*22|0},${16+R()*18|0})`; c.beginPath(); c.moveTo(s[0]-rr,s[1]); c.lineTo(s[0]-rr*.3,s[1]-rr*.8); c.lineTo(s[0]+rr,s[1]-rr*.3); c.lineTo(s[0]+rr*.5,s[1]+rr*.6); c.closePath(); c.fill();
      if(R()<.4){c.fillStyle='rgba(150,140,120,.35)'; c.fillRect(s[0]-rr*.4,s[1]-rr*.5,rr*.5,1);}}
    // yere düşmüş yarım nallar ve çivi
    duzlemde(P,[112,0,252],DUZLEM.zemin,()=>{for(const [x,y,a] of[[0,0,.6],[16,8,2.6],[-10,14,4.4]]){c.save(); c.translate(x,y); c.rotate(a); leke(1,1,9,7,[0,0,0],.5); c.strokeStyle='rgb(62,60,56)'; c.lineWidth=2.6; c.beginPath(); c.arc(0,0,6,Math.PI*.15,Math.PI*1.85); c.stroke(); c.strokeStyle='rgba(210,206,190,.5)'; c.lineWidth=.6; c.beginPath(); c.arc(0,0,7,Math.PI*1.1,Math.PI*1.6); c.stroke(); c.restore();}});
    // örs kütüğü ve örs
    { const s=P.n(ORS.x,0,ORS.z), L=P.n(ORS.x+200,0,ORS.z+80); leke((s[0]+L[0])/2,(s[1]+L[1])/2,110,22,[0,0,0],.6); } // sağa uzun gölge
    silindir(P,isik,ORS.x,ORS.z,ORS.r,0,ORS.h,AHSAP,980,{ustRenk:[110,96,74]});
    duzlemde(P,[ORS.x,ORS.h,ORS.z],DUZLEM.ust,()=>{for(let i=1;i<5;i++){c.strokeStyle='rgba(30,24,16,.5)'; c.lineWidth=.8; c.beginPath(); c.arc(0,0,i*5,0,TAU); c.stroke();}});
    const Z0=ORS.z-6, Z1=ORS.z+6;
    const prof=[[78,0],[112,0],[110,6],[104,8],[103,16],[112,18],[125,22],[125,28],[75,28],[62,26],[44,24.5],[62,21],[75,19],[86,16],[85,8],[80,6]].map(([x,y])=>[x-95+ORS.x,y+ORS.h]); // profil: x=95 örsün ortası
    const on=prof.map(([x,y])=>[x,y,Z0]);
    for(let i=0;i<prof.length;i++){ // üst ve sol yüzler (makine yukarıdan bakar)
      const a=prof[i], b=prof[(i+1)%prof.length]; if(b[0]>=a[0]) continue;
      const q=[[a[0],a[1],Z0],[b[0],b[1],Z0],[b[0],b[1],Z1],[a[0],a[1],Z1]];
      const ust=Math.abs(b[1]-a[1])<4&&a[1]>ORS.h+18;
      cokgen3(P,q,ust?[150,150,140]:golgele(DEMIR,aydinlik(isik,[a[0],a[1],ORS.z],[-.6,.5,-.3])));
    }
    cokgen3(P,on,golgele(DEMIR,.5));
    c.save(); c.beginPath(); yol3(P,on); c.clip(); const om=P.n(ORS.x,ORS.h+14,Z0), oo=P.olcek(ORS.x,ORS.h,Z0); leke(om[0]-34*oo,om[1]-4*oo,26*oo,10*oo,[210,196,160],.45); leke(om[0]+20*oo,om[1]+4*oo,30*oo,14*oo,[0,0,0],.5); c.restore();
    hat3(P,on,MUREKKEP,.85,1.3,985,2,1,true);
    hat3(P,prof.filter(q=>q[1]>=ORS.h+24).map(([x,y])=>[x,y,Z0]),[210,206,190],.6,1,986,1,.4); // üst kenarda parlak çizgi
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.1,leke:.12});
    // közün sıcak parıltısı ve davlumbaza doğru duman
    c.save(); c.globalCompositeOperation='screen';
    const k=P.n(KOZ[0],KOZ[1]+8,KOZ[2]); leke(k[0],k[1],150,90,[200,160,100],.35); leke(k[0],k[1]-4,50,22,[255,230,170],.5);
    for(let i=0;i<5;i++) leke(k[0]+(r()-.5)*60,k[1]-60-r()*120,60+r()*60,30+r()*40,[120,116,104],.08);
    c.restore();
    karanlik([[1000,700,360,300,.7],[1000,120,300,220,.55],[0,720,260,180,.5],[500,800,700,140,.45]]);
  }
};
