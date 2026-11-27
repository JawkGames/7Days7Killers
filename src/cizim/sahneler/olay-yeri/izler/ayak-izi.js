// Ayak izi (1943 köyü). p.tip:
//   'carik'    ham deri çarık: tek parça, topuksuz, kenarı yumuşak ve büzgülü, kalkık burnu hafif basar
//   'postal'   kabaralı asker postalı: ayrı topuk, topukta demir nal, tabanın çevresi ve ortası kabara noktalı
//   'cizme'    kabaralı çizme: postaldan biraz uzun ve geniş, iki sıra kabara
//   'yalin'    yalın ayak: topuk, dış kenar, tarak ve beş parmak
//   'nal'      katır nalı: U biçimli nal, açığı geriye bakar; çivi delikleri, ortada çatal
//   'ters-nal' ters çakılmış nal: açık uç ileri bakar (iz, gidilen yönün tersini gösterir)
// Eski alan p.cesit hâlâ geçer ('cizme', 'carik', 'ayak'→'yalin'); p.tip varsa o kazanır.
// p.sayi: 1-4 adım; p.yon (radyan); p.yuzey: yuvanın yüzeyini ezer (ör. 'un').
// Yüzeye göre: çamur ve toprakta çukur (kabaran kenar ışık alır), unda koyu baskı, taşta ve tahtada soluk çamur lekesi.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu,serit} from '../kalem.js';

// Elips üstünde eşit aralıklı noktalar (kabara sırası)
const sira=(cx,cy,rx,ry,a0,a1,n)=>Array.from({length:n},(_,i)=>{const a=a0+(a1-a0)*i/(n-1); return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];});

// Postal/çizme tabanı: burun -y, topuk +y (cm). k: ölçek (çizme biraz büyük)
function kunduraTabani(k,cizme){
  const s=(x,y)=>[x*k,y*k];
  const taban=()=>{const m=(x,y,f)=>{const q=s(x,y); f(q[0],q[1]);};
    m(0,-14.2,(x,y)=>c.moveTo(x,y));
    c.bezierCurveTo(...s(4.4,-14.1),...s(5.5,-9),...s(5.3,-4)); c.bezierCurveTo(...s(5.1,-.5),...s(4,1.6),...s(3.8,3.6));
    c.lineTo(...s(-3.3,3.6)); c.bezierCurveTo(...s(-3.6,1.2),...s(-5,-2),...s(-4.9,-6)); c.bezierCurveTo(...s(-4.7,-11.5),...s(-3.2,-14.3),...s(0,-14.2)); c.closePath();};
  const topuk=()=>{c.moveTo(...s(-3.7,6.6)); c.lineTo(...s(3.9,6.6)); c.bezierCurveTo(...s(4.1,10.6),...s(3.4,14.2),...s(0,14.4)); c.bezierCurveTo(...s(-3.3,14.2),...s(-4,10.8),...s(-3.7,6.6)); c.closePath();};
  // kabaralar: tabanın kenarından 1 cm içeride bir sıra, tarakta küçük bir küme; çizmede ikinci seyrek sıra
  const kab=[...sira(.2*k,-5*k,4*k,8.4*k,Math.PI*.98,Math.PI*2.02,13).filter(q=>q[1]<2.6*k)];
  kab.push(...[[0,-9.6],[-1.6,-7.4],[1.6,-7.4],[0,-5.2],[-1.4,-2.8],[1.4,-2.8]].map(([x,y])=>s(x,y)));
  if(cizme) kab.push(...sira(.2*k,-5.4*k,2.3*k,6*k,Math.PI*1.1,Math.PI*1.9,6));
  const topukKab=[[-1.6,9.6],[1.6,9.6],[0,11.4]].map(([x,y])=>s(x,y));
  // topuk demiri: arka kenarı saran U
  const demir=()=>{c.moveTo(...s(-3.2,9)); c.bezierCurveTo(...s(-3.2,12.8),...s(-1.6,13.6),...s(0,13.6)); c.bezierCurveTo(...s(1.6,13.6),...s(3.4,12.8),...s(3.4,9));};
  return {boy:28*k, yol(){taban(); topuk();}, kabara:[...kab,...topukKab], kabR:.55*k, demir, yumusak:.25};
}

const TABAN={
  carik:{boy:27, yumusak:.9, kabara:[], kabR:0,
    yol(){c.moveTo(.8,-14); c.bezierCurveTo(3.6,-12.6,5.6,-8,5.3,-2.5); c.bezierCurveTo(5,3.5,4.2,10.4,.2,12.6); c.bezierCurveTo(-3.9,10.6,-4.4,4.6,-4.2,-.5); c.bezierCurveTo(-4.4,-6,-4.6,-11.6,.8,-14); c.closePath();},
    // büzgü: kenar boyunca içe kıvrılan kısa kırışıklar (deri bağcıkla büzülmüş)
    buzgu:sira(0,-.4,4.2,11.2,0,TAU,22),
    burun:true},
  yalin:{boy:25, yumusak:.45, kabara:[], kabR:0,
    yol(){c.moveTo(0,-7.2); c.bezierCurveTo(3.8,-7.2,4.4,-3,3.9,0); c.bezierCurveTo(3.3,4,3.5,8,2.7,10.6); c.bezierCurveTo(1.7,12.7,-2.1,12.8,-2.9,10.4); c.bezierCurveTo(-3.3,7.4,-1.3,3.6,-2.4,0); c.bezierCurveTo(-3.6,-3.3,-3.4,-7.2,0,-7.2); c.closePath();
      for(const[x,y,r]of[[-2.3,-9.5,1.45],[.15,-10.4,1.05],[2,-10,.95],[3.5,-8.9,.8],[4.6,-7.4,.7]]){c.moveTo(x+r,y); c.ellipse(x,y,r,r*1.2,0,0,TAU);}}}
};

// Nal: toynak izi (12×13 cm) ve U biçimli demir. ters: açık uç ileri (−y)
function nalTabani(ters){
  const d=ters?-1:1;
  const toynak=()=>{c.moveTo(0,-6.6); c.bezierCurveTo(4.6,-6.6,6.1,-2.6,6,1); c.bezierCurveTo(5.9,4.4,4,6.4,2.6,6.4); c.lineTo(-2.6,6.4); c.bezierCurveTo(-4,6.4,-5.9,4.4,-6,1); c.bezierCurveTo(-6.1,-2.6,-4.6,-6.6,0,-6.6); c.closePath();};
  // demir: kalın U şerit (orta hattı), açık uç d yönünde (+y: geri)
  const u=()=>{c.moveTo(-4.4,5.6*d); c.bezierCurveTo(-5.6,1*d,-5.4,-4.6*d,0,-5.6*d); c.bezierCurveTo(5.4,-4.6*d,5.6,1*d,4.4,5.6*d);};
  const civi=[[-4.9,1.6],[-4.6,-1.6],[-3.4,-4.2],[4.9,1.6],[4.6,-1.6],[3.4,-4.2]].map(([x,y])=>[x,y*d]);
  // çatal: toynağın arka yarısında, ucu ileri bakan V (nalın yönünden bağımsız)
  const catal=()=>{c.moveTo(-2.2,5.4); c.lineTo(0,-.4); c.lineTo(2.2,5.4);};
  return {boy:13, nal:true, yol:toynak, u, civi, catal, uclar:[[-4.4,5.6*d],[4.4,5.6*d]], kabara:[], kabR:0, yumusak:.3};
}

function tabanSec(p){
  let t=p.tip||p.cesit||'postal'; if(t==='ayak') t='yalin';
  if(t==='postal') return kunduraTabani(1,false);
  if(t==='cizme') return kunduraTabani(1.04,true);
  if(t==='nal'||t==='ters-nal') return nalTabani(t==='ters-nal');
  return TABAN[t]||kunduraTabani(1,false);
}

// yumuşak kenar: bulanıklık, o anki dönüşümün ölçeğine göre (cm cinsinden yarıçap)
function bulanik(cm){const M=c.getTransform(), s=Math.hypot(M.a,M.b); c.filter=cm>0?`blur(${Math.max(.3,cm*s).toFixed(2)}px)`:'none';}

export default {
  tur:'ayak-izi', duzlemler:['zemin'], aciSapma:.35,
  kapsam:(p)=>({r:Math.max(16,(Math.min(4,p.sayi||2)-1)*36+14)}),
  kur(p,r){
    const T=tabanSec(p), n=Math.max(1,Math.min(4,p.sayi||2)), adim=[];
    const hayvan=!!T.nal, ara=hayvan?52:66, yan=hayvan?6:8;
    for(let i=0;i<n;i++){
      const sol=i%2===0, y=(i-(n-1)/2)*-ara+(r()-.5)*6;
      adim.push({x:(sol?-yan:yan)+(r()-.5)*2, y, aci:(hayvan?0:(sol?-.09:.09))+(r()-.5)*.12, ayna:sol?-1:1, kayma:r()<.25?(r()-.5)*3:0, derin:.75+r()*.35, tohum:r()*1e5|0});
    }
    return {T,adim};
  },
  ciz(k,g,p={}){
    const T=g.T, yz=p.yuzey||k.yuzey, cukur=yz==='camur'||yz==='toprak', gx=k.golgeYon[0], gy=k.golgeYon[1];
    for(const a of g.adim){
      const yer=()=>{k.duzlem(); c.translate(a.x,a.y); c.rotate(a.aci); c.scale(a.ayna,1);};
      const yg=[gx*Math.cos(-a.aci)-gy*Math.sin(-a.aci), gx*Math.sin(-a.aci)+gy*Math.cos(-a.aci)]; yg[0]*=a.ayna;
      const yumusak=T.yumusak||.3;
      if(cukur){
        const su=yz==='camur';
        // dışarı itilen çamur: ışığa bakan yanı parlak, yumuşak bir sırt
        yer(); c.translate(-yg[0]*.5,-yg[1]*.5); bulanik(yumusak*1.6); dolgu(T.yol,[160,156,134],.28*a.derin); c.filter='none';
        // çukur: kenarı tipe göre yumuşak
        yer(); bulanik(yumusak); dolgu(T.yol,[6,6,5],(T.nal?.5:.8)*a.derin); c.filter='none'; // toynak sığ, demir derin basar
        // çukurun dibi: çamurda su birikmiş (göğü yansıtır), toprakta ışığa bakan iç duvar aydınlık
        yer(); c.save(); c.beginPath(); T.yol(); c.clip();
        c.translate(yg[0]*1.2,yg[1]*1.2); bulanik(yumusak*.7); dolgu(T.yol,su?[118,120,110]:[86,80,64],su?.55:.75);
        c.translate(yg[0]*.7,yg[1]*.7); dolgu(T.yol,su?[90,92,84]:[54,50,40],.55); c.filter='none';
        if(T.burun) leke(0,-11,4.5,3.5,su?[110,110,100]:[110,102,82],.55); // kalkık burun derin basmaz
        if(T.nal){ // demir daha derin basar, çatal (toynağın yumuşak ortası) kabarık kalır
          serit(T.u,[3,3,2],.92,Math.max(1.4,2.3*k.olcek));
          for(const q of T.uclar) dolgu(()=>{c.moveTo(q[0]+1.1,q[1]); c.arc(q[0],q[1],1.1,0,TAU);},[3,3,2],.9); // nalın kalın uçları (mıh)
          serit(T.catal,[150,146,126],.2,Math.max(.8,1.1*k.olcek*.8));
          for(const q of T.civi) dolgu(()=>{c.moveTo(q[0]+.42,q[1]); c.arc(q[0],q[1],.42,0,TAU);},[160,156,136],.55);
        }
        for(const q of T.kabara) dolgu(()=>{c.moveTo(q[0]+T.kabR,q[1]); c.arc(q[0],q[1],T.kabR,0,TAU);},[4,4,3],.85);
        if(T.demir) serit(T.demir,[4,4,3],.8,Math.max(1,1.3*k.olcek*.8));
        if(T.buzgu) for(const [i,q] of T.buzgu.entries()){const l=1.2+((a.tohum>>(i%9))&3)*.35, d=Math.hypot(q[0],q[1])||1; serit(()=>{c.moveTo(q[0],q[1]); c.lineTo(q[0]-q[0]/d*l,q[1]-q[1]/d*l);},[16,14,11],.42,.6);}
        c.restore();
        yer(); bulanik(yumusak*.5); serit(T.yol,[8,8,6],(T.burun?.3:.5)*a.derin,.7); c.filter='none';
      }else if(yz==='un'){
        yer(); bulanik(yumusak*.6); dolgu(T.yol,[20,18,14],.72); c.filter='none';
        for(const q of T.kabara) dolgu(()=>{c.moveTo(q[0]+T.kabR,q[1]); c.arc(q[0],q[1],T.kabR,0,TAU);},[214,210,196],.55); // kabara unu geri iter
        if(T.nal) serit(T.u,[8,8,6],.6,Math.max(1,1.8*k.olcek*.8));
        if(T.demir) serit(T.demir,[8,8,6],.6,1);
      }else{
        // taşta/tahtada: yalnızca değen yerler çamur bırakır; kabara ve demir en belirgin
        yer(); c.save(); c.beginPath(); T.yol(); c.clip();
        for(let i=0;i<6;i++) leke((Math.sin(a.tohum+i)*3),(Math.cos(a.tohum*.7+i*2)*9),4,5,[8,7,5],.24);
        c.restore();
        yer(); bulanik(yumusak); serit(T.yol,[10,9,7],.22,.8); c.filter='none';
        for(const q of T.kabara) dolgu(()=>{c.moveTo(q[0]+T.kabR*.8,q[1]); c.arc(q[0],q[1],T.kabR*.8,0,TAU);},[10,9,7],.45);
        if(T.nal){serit(T.u,[10,9,7],.5,Math.max(1,1.8*k.olcek*.8)); for(const q of T.uclar) dolgu(()=>{c.moveTo(q[0]+1,q[1]); c.arc(q[0],q[1],1,0,TAU);},[10,9,7],.45);}
        if(T.demir) serit(T.demir,[10,9,7],.45,1);
      }
      if(a.kayma){yer(); c.translate(a.kayma,-3); bulanik(yumusak); dolgu(T.yol,[0,0,0],.12); c.filter='none';} // kayan adım
    }
  }
};
