// Mağara: kireçtaşı yamaçtaki mağaranın içinden ağzına doğru bakılır. Ağız aşırı pozlanmış (dışarısı bembeyaz, tepeler
// soluk karaltı); kaya kaburgaları içeriden ağza doğru açılır. Yerde taşla çevrili sönmüş ocak (kül, kömürleşmiş çırpılar),
// solda saman yatak, sağda düz kaya yüzü ve dibinde su testisi; tavanda ocağın isi.
// Tek ışık: mağara ağzından gelen gün ışığı. Ağza yakın her şey aydınlık, içeri doğru kararır; kenarlar ağza bakan yüzden ışık alır.
import {c} from '../../../teknik/tuval.js';
import {TAU,rgba,lerp} from '../../../../cekirdek/matematik.js';
import {rng} from '../../../../cekirdek/rastgele.js';
import {yol3,golgele,silindir} from '../kalem.js';
import {DUZLEM} from '../perspektif.js';
import {duzlemde,karanlik,atmosfer,leke,tara,titrek,MUREKKEP} from '../mekan-yardim.js';
import {kaya,kirZemin} from './harman-yeri.js';

const AGIZ_Z=930;
const isik={konum:[10,150,AGIZ_Z+40], guc:1.25, menzil:900, ortam:.3};
const KAYA=[164,154,132], TOPRAK=[150,136,112], SAMAN=[204,190,148];
const OCAK={x:120,z:600}, YATAK={x:-215,z:690,en:120,boy:190};
const YUZ_X=250;                                    // sağdaki düz kaya yüzü (sag düzlemi)
// kaburgalar: [Z, yarı genişlik, tavan yüksekliği, aydınlık]
const KABURGA=[[AGIZ_Z,215,250,1,0],[820,250,284,.86,-30],[700,310,300,.7,10],[580,290,292,.56,40],[470,280,270,.44,-10],[380,250,250,.36,20],[300,240,226,.3,0]];

// kaburga ağzının dünya noktaları (alttan ekran dışına iner, tavanı düzensiz kemer)
function agizNoktalari(Z,w,h,R,dx=0){
  const n=[[-w*1.05+dx,0,Z]];
  for(let i=0;i<=22;i++){const t=i/22, a=Math.PI*(1-t), j=1+(R()-.5)*.14;
    const x=Math.cos(a)*w*j+dx, y=Math.pow(Math.sin(a),.62)*h*(1+(R()-.5)*.1); n.push([x,Math.max(y,0),Z]);}
  n.push([w*1.05+dx,0,Z]);
  return n;
}

export default {
  id:'magara',
  kamera:{odak:760, yukseklik:140, egim:.06},
  isik,
  yuvalar:{
    'zemin-on':   {duzlem:'zemin', konum:[60,0,300], yuzey:'toprak', alan:14},
    'zemin-orta': {duzlem:'zemin', konum:[230,0,780], yuzey:'toprak', alan:10},
    'ocak-onu':   {duzlem:'zemin', konum:[OCAK.x+10,0,OCAK.z-80], yuzey:'toprak', alan:8},
    'yatak':      {duzlem:'ust', konum:[YATAK.x+10,16,YATAK.z-20], yuzey:'toprak', alan:12, aci:Math.PI/2},
    'duvar':      {duzlem:'sag', konum:[YUZ_X,92,470], yuzey:'tas', alan:10, uygunsuz:['saat']},
    'esik':       {duzlem:'zemin', konum:[-20,0,AGIZ_Z-30], yuzey:'tas', alan:10},
    'beden':      {duzlem:'zemin', konum:[-80,0,430], aci:.85, ortu:'cul'}
  },
  ciz(P,r){
    const R=rng(8821);
    // dışarısı: bembeyaz gök, soluk tepe, çalı karaltıları
    c.fillStyle='rgb(238,236,224)'; c.fillRect(0,0,1000,750);
    const ufk=P.n(0,0,30000)[1];
    c.fillStyle='rgba(206,204,190,1)'; c.beginPath(); c.moveTo(0,ufk+30);
    for(let x=0;x<=1000;x+=20) c.lineTo(x,ufk-20-Math.sin(x*.008+1)*18-Math.sin(x*.023)*8); c.lineTo(1000,750); c.lineTo(0,750); c.closePath(); c.fill();
    c.fillStyle='rgba(186,184,168,1)'; c.beginPath(); c.moveTo(0,ufk+40);
    for(let x=0;x<=1000;x+=20) c.lineTo(x,ufk+18-Math.sin(x*.012+3)*10); c.lineTo(1000,750); c.lineTo(0,750); c.closePath(); c.fill();
    for(let i=0;i<14;i++){const x=300+R()*400, y=ufk+24+R()*30; leke(x,y,8+R()*14,5+R()*6,[120,118,104],.6);}
    leke(500,ufk,260,140,[255,255,250],.5);
    // zemin: ağza doğru aydınlanır (sisle "göğe" çekilmesi burada ağız ışığıdır)
    kirZemin(P,isik,{x:[-600,600],z:[200,AGIZ_Z+60],renk:TOPRAK,R,yogun:700,tohum:881,cakil:0,acik:.66,doku:1.4});
    // ağzın önündeki taş eşik ve dışarı inen kaya
    kaya(P,isik,-130,AGIZ_Z+10,{en:120,boy:24,derin:60,renk:KAYA,tohum:883,nA:10,nK:3,yogun:900});
    kaya(P,isik,150,AGIZ_Z,{en:90,boy:30,derin:50,renk:KAYA,tohum:884,nA:10,nK:3,yogun:900});
    // kaburgalar: uzaktan (ağız) yakına
    for(const [i,[Z,w,h,a,dx]] of KABURGA.entries()){
      const Rk=rng(900+i), n=agizNoktalari(Z,w,h,Rk,dx);
      const s=n.map(q=>P.n(...q)), mx=P.n(0,h*.45,Z);
      const by=s[0][1]; // kaburganın tabanı: zemine bu derinlikte oturur
      c.save(); c.beginPath(); c.moveTo(-30,by); c.lineTo(-30,-30); c.lineTo(1030,-30); c.lineTo(1030,s[s.length-1][1]); for(let k=s.length-1;k>=0;k--) c.lineTo(s[k][0],s[k][1]); c.closePath(); c.clip();
      c.fillStyle=rgba(golgele(KAYA,a*.42),1); c.fillRect(-20,-20,1040,790);
      // ağza bakan iç kenar ışık alır; dışa doğru kararır
      const yr=Math.max(...s.map(q=>Math.abs(q[0]-mx[0])));
      leke(mx[0],mx[1],yr*1.25,yr*1.0,golgele(KAYA,lerp(.6,1.15,a)),.85);
      for(let k=0;k<26;k++){const t=Rk(), q=s[1+(t*22|0)]; leke(q[0]+(Rk()-.5)*60,q[1]+(Rk()-.5)*40,30+Rk()*80,20+Rk()*50,Rk()<.55?[0,0,0]:golgele(KAYA,a*1.2),.12+Rk()*.18);}
      tara(-20,-20,1040,790,.9+i*.2,6,MUREKKEP,.12+(1-a)*.18,910+i,.9);
      for(let k=0;k<5;k++){let px=Rk()*1000, py=Rk()*300; titrek(()=>{c.moveTo(px,py); for(let m=0;m<6;m++){px+=(Rk()-.5)*40; py+=10+Rk()*30; c.lineTo(px,py);}},MUREKKEP,.4,1,920+i*7+k,1,.6);}
      if(i===3){ const ic=P.n(OCAK.x,240,OCAK.z); leke(ic[0],ic[1],180,90,[0,0,0],.55); leke(ic[0]-30,ic[1]+20,120,60,[0,0,0],.35); } // ocağın isi
      c.restore();
      // ağza bakan kenarda parlak hat, dışında mürekkep
      titrek(()=>{s.forEach((q,k)=>k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));},golgele(KAYA,lerp(.9,1.4,a)),.22,2.4,930+i,1,1.6);
      titrek(()=>{s.forEach((q,k)=>k?c.lineTo(q[0]+2,q[1]-2):c.moveTo(q[0]+2,q[1]-2));},MUREKKEP,.35,1.1,940+i,2,1.2);
      { const g=c.createLinearGradient(0,by-40,0,by); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.35)'); c.save(); c.beginPath(); c.moveTo(-30,by); c.lineTo(s[0][0],by); c.lineTo(s[0][0],by-40); c.lineTo(-30,by-40); c.moveTo(1030,by); c.lineTo(s[s.length-1][0],by); c.lineTo(s[s.length-1][0],by-40); c.lineTo(1030,by-40); c.fillStyle=g; c.fill(); c.restore(); }
      // kaburganın dibi zemine oturur: kenar boyunca koyu temas
      const d0=P.n(-w,0,Z), d1=P.n(w,0,Z); leke(d0[0],d0[1],40,10,[0,0,0],.55); leke(d1[0],d1[1],40,10,[0,0,0],.55);
      if(i===4) { // sağdaki düz kaya yüzü (duvar yuvası)
        const q=[[YUZ_X,0,575],[YUZ_X+6,0,372],[YUZ_X+10,60,360],[YUZ_X+4,150,372],[YUZ_X,182,420],[YUZ_X,190,500],[YUZ_X+6,150,560],[YUZ_X+10,70,585]];
        c.save(); c.beginPath(); yol3(P,q); c.fillStyle=rgba(golgele(KAYA,.46),1); c.fill(); c.clip();
        const m=P.n(YUZ_X,90,470); leke(m[0]-60,m[1]-30,150,130,golgele(KAYA,.78),.55); leke(m[0]+60,m[1]+60,120,90,[0,0,0],.45); for(let k=0;k<18;k++) leke(m[0]+(R()-.5)*220,m[1]+(R()-.5)*260,10+R()*40,8+R()*30,R()<.6?[0,0,0]:golgele(KAYA,.9),.12+R()*.15);
        duzlemde(P,[YUZ_X,0,0],DUZLEM.sag,()=>{for(let k=0;k<6;k++){const y=-20-k*28+R()*8; titrek(()=>{c.moveTo(-560,y); c.lineTo(-380,y+(R()-.5)*8);},MUREKKEP,.35,1,950+k,1,.6);}});
        tara(0,0,1000,750,1.3,5,MUREKKEP,.18,955,.8); c.restore();
        titrek(()=>yol3(P,q),MUREKKEP,.45,1.1,958,2,1.2);
        // dibinde su testisi
        duzlemde(P,[YUZ_X-30,0,430],DUZLEM.zemin,()=>leke(0,0,22,14,[0,0,0],.55));
        silindir(P,isik,YUZ_X-30,430,13,0,30,[150,112,82],960,{ustRenk:[60,44,34]});
        silindir(P,isik,YUZ_X-30,430,6,30,40,[150,112,82],961,{ustRenk:[20,16,12]});
      }
    }
    // sönmüş ocak: taş halka, kül, yarı yanmış çırpılar
    const O=OCAK;
    duzlemde(P,[O.x,0,O.z],DUZLEM.zemin,()=>{leke(0,0,60,44,[0,0,0],.45); leke(0,0,38,28,[200,198,188],.55); leke(4,2,20,14,[20,20,18],.6);
      for(let i=0;i<60;i++){const a=R()*TAU, u=R()*34; c.fillStyle=R()<.5?'rgba(230,228,220,.5)':'rgba(10,10,8,.6)'; c.fillRect(Math.cos(a)*u,Math.sin(a)*u*.8,1+R()*2,1+R()*1.4);}});
    for(let i=0;i<4;i++){const a=R()*Math.PI, l=30+R()*20, x0=O.x+Math.cos(a)*l*.5, z0=O.z+Math.sin(a)*l*.3, A=P.n(x0,2,z0), B=P.n(x0-Math.cos(a)*l,3,z0-Math.sin(a)*l*.6), o=P.olcek(O.x,0,O.z);
      c.strokeStyle='rgb(26,24,20)'; c.lineWidth=3.5*o; c.lineCap='round'; c.beginPath(); c.moveTo(A[0],A[1]); c.lineTo(B[0],B[1]); c.stroke();
      c.strokeStyle='rgba(220,218,206,.45)'; c.lineWidth=1.2*o; c.beginPath(); c.moveTo(A[0],A[1]-1); c.lineTo((A[0]+B[0])/2,(A[1]+B[1])/2-1); c.stroke();}
    const halka=[]; for(let i=0;i<11;i++){const a=i/11*TAU+R()*.2; halka.push([O.x+Math.cos(a)*44,O.z+Math.sin(a)*32,i]);}
    halka.sort((a,b)=>b[1]-a[1]).forEach(q=>kaya(P,isik,q[0],q[1],{en:22+R()*8,boy:8+R()*5,derin:16,renk:golgele(KAYA,.7),tohum:970+q[2],nA:7,nK:2,catlak:0,cizgi:.45}));
    // saman yatak: yere serilmiş saman, ayak ucunda dürülmüş eski çul
    const Y=YATAK;
    kaya(P,isik,Y.x,Y.z,{en:Y.en,boy:16,derin:Y.boy,renk:golgele(SAMAN,.8),tohum:980,nA:22,nK:3,puruz:.15,duz:true,us:.3,cizgi:0,catlak:0});
    { const s=P.n(Y.x,8,Y.z), o=P.olcek(Y.x,8,Y.z);
      for(let i=0;i<500;i++){const x=s[0]+(R()-.5)*Y.en*o*1.05, y=s[1]+(R()-.5)*Y.boy*o*.3, a=R()*TAU, l=(3+R()*8)*o; c.strokeStyle=R()<.5?'rgba(60,52,34,.45)':'rgba(220,208,166,.4)'; c.lineWidth=.6+R()*.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l*.4); c.stroke();} }
    // çul: yatağın dip ucunda rulo
    { const A=[Y.x-46,12,Y.z+Y.boy*.38], B=[Y.x+46,12,Y.z+Y.boy*.38+6];
      const s0=P.n(...A), s1=P.n(...B), o=P.olcek(...A); c.strokeStyle='rgb(70,64,52)'; c.lineWidth=18*o; c.lineCap='round'; c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(s1[0],s1[1]); c.stroke();
      c.strokeStyle='rgba(150,140,116,.5)'; c.lineWidth=5*o; c.beginPath(); c.moveTo(s0[0],s0[1]-5*o); c.lineTo(s1[0],s1[1]-5*o); c.stroke();
      titrek(()=>{c.moveTo(s0[0],s0[1]+8*o); c.lineTo(s1[0],s1[1]+8*o);},MUREKKEP,.5,1,985,2,.6); }
    // toplanmış çalı çırpı (sol önde): kuru dallar yığını, kesik uçları açık
    { const X=250, Z=345; duzlemde(P,[X,0,Z],DUZLEM.zemin,()=>leke(0,0,90,40,[0,0,0],.5));
      for(let i=0;i<46;i++){const a=(R()-.5)*.5+(R()<.5?0:Math.PI), l=60+R()*70, y=4+R()*22, z=Z+(R()-.5)*40, x0=X+(R()-.5)*60;
        const A=P.n(x0-Math.cos(a)*l/2,y,z-Math.sin(a)*8), B=P.n(x0+Math.cos(a)*l/2,y+(R()-.5)*10,z+Math.sin(a)*8), o=P.olcek(x0,y,z);
        c.strokeStyle=rgba(golgele([90,78,60],.5+R()*.6),1); c.lineWidth=(1.5+R()*2.2)*o; c.lineCap='round'; c.beginPath(); c.moveTo(A[0],A[1]); c.quadraticCurveTo((A[0]+B[0])/2,(A[1]+B[1])/2+(R()-.5)*6*o,B[0],B[1]); c.stroke();
        c.fillStyle='rgba(200,186,150,.6)'; c.beginPath(); c.arc(B[0],B[1],.9*o,0,TAU); c.fill();
        if(R()<.5){const m=[(A[0]+B[0])/2,(A[1]+B[1])/2]; c.lineWidth=.8*o; c.strokeStyle='rgba(40,34,26,.8)'; c.beginPath(); c.moveTo(m[0],m[1]); c.lineTo(m[0]+(R()-.5)*20*o,m[1]-(4+R()*10)*o); c.stroke();}} }
    // zemin: ayak altında sertleşmiş toprak, dökülmüş kül izi, kırıntı
    for(let i=0;i<260;i++){const Z=240+Math.pow(R(),1.3)*600, X=(R()-.5)*(Z*1.3), p=P.n(X,0,Z), o=P.olcek(X,0,Z), w=(1.5+R()*4)*o;
      leke(p[0],p[1],w*3,w*.9,R()<.6?[0,0,0]:golgele(KAYA,.8),.12+R()*.12); if(R()<.3){leke(p[0]+w*.2,p[1]+w*.2,w*1.2,w*.4,[0,0,0],.4); c.fillStyle=rgba(golgele(KAYA,.3+R()*.25),1); c.beginPath(); c.moveTo(p[0]-w,p[1]); c.lineTo(p[0]-w*.3,p[1]-w*.6); c.lineTo(p[0]+w*.8,p[1]-w*.4); c.lineTo(p[0]+w,p[1]); c.closePath(); c.fill();}}
    { const a=P.n(OCAK.x,0,OCAK.z-60), b=P.n(-60,0,300); for(let i=0;i<14;i++){const t=R(); leke(lerp(a[0],b[0],t)+(R()-.5)*40,lerp(a[1],b[1],t),10+R()*16,3+R()*4,[200,198,186],.18);} }
    // yerde kopmuş kaya parçaları
    for(const [i,[x,z,e]] of [[-300,560,50],[230,700,40],[-120,300,26],[-280,320,40],[200,820,30]].entries()) kaya(P,isik,x,z,{en:e,boy:e*.5,derin:e*.7,renk:KAYA,tohum:990+i,nA:8,nK:3});
  },
  ustCiz(P,r){
    atmosfer(r,{tarama:.07,leke:.07});
    karanlik([[0,0,300,260,.3],[1000,0,300,260,.3],[0,760,260,160,.35],[1000,760,260,160,.35]]);
  }
};
