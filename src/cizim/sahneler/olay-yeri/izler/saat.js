// Durmuş saat. p.saat: 'SS:DD' (ör. '22:40'). Duvar yuvasında ahşap kasalı duvar saati, yerde ve üst yüzeyde zincirli cep saati.
// Camı çatlak; akrep ve yelkovan verilen saatte durur.
import {c} from '../../../teknik/tuval.js';
import {leke} from '../../../teknik/firca.js';
import {TAU} from '../../../../cekirdek/matematik.js';
import {dolgu,serit,hat} from '../kalem.js';

const duvarda=k=>k.duzlemAdi==='arka'||k.duzlemAdi==='sol'||k.duzlemAdi==='sag';
function aciler(s){const [h,m]=String(s||'22:40').split(':').map(Number); return {akrep:((h%12)+(m||0)/60)/12*TAU, yelkovan:(m||0)/60*TAU};}

function kadran(R,a,t,cizgi){
  dolgu(()=>{c.moveTo(R,0); c.arc(0,0,R,0,TAU);},[150,146,128],1);
  leke(-R*.3,-R*.3,R*.9,R*.9,[200,196,176],.25); leke(R*.4,R*.4,R*.9,R*.9,[0,0,0],.3);
  for(let i=0;i<60;i++){const b=i/60*TAU, u=i%5?R*.92:R*.8; serit(()=>{c.moveTo(Math.sin(b)*u,-Math.cos(b)*u); c.lineTo(Math.sin(b)*R*.97,-Math.cos(b)*R*.97);},[20,20,18],i%5?.35:.85,i%15?cizgi*.4:cizgi*.9);}
  serit(()=>{c.moveTo(0,0); c.lineTo(Math.sin(a.akrep)*R*.52,-Math.cos(a.akrep)*R*.52);},[12,12,12],1,cizgi*1.4);
  serit(()=>{c.moveTo(-Math.sin(a.yelkovan)*R*.12,Math.cos(a.yelkovan)*R*.12); c.lineTo(Math.sin(a.yelkovan)*R*.8,-Math.cos(a.yelkovan)*R*.8);},[12,12,12],1,cizgi*.85);
  dolgu(()=>{c.moveTo(R*.07,0); c.arc(0,0,R*.07,0,TAU);},[12,12,12],1);
  // çatlak cam: darbe noktasından ışınsal kırıklar
  const r=t; const ox=(r[0]-.5)*R, oy=(r[1]-.5)*R;
  serit(()=>{for(let i=0;i<6;i++){let x=ox, y=oy, b=r[2+i]*TAU; c.moveTo(x,y); for(let s=0;s<4;s++){b+=(r[8+i+s]-.5)*.7; x+=Math.cos(b)*R*.3; y+=Math.sin(b)*R*.3; c.lineTo(x,y);}}},[220,218,200],.55,cizgi*.45);
  leke(-R*.35,-R*.45,R*.35,R*.16,[255,255,240],.22,-.6); // camda ışık
}

export default {
  tur:'saat', duzlemler:['zemin','ust','arka','sol','sag'], aciSapma:.03,
  kapsam:(p,yuva)=>(yuva.duzlem==='zemin'||yuva.duzlem==='ust')?{r:9}:{r:19,dy:2},
  kur(p,r){return {a:aciler(p.saat), t:Array.from({length:16},r), zincir:Array.from({length:10},()=>r()), donus:r()*TAU};},
  ciz(k,g){
    const cz=.9; // kadran çizgileri fotoğraf biriminde
    if(duvarda(k)){
      // ahşap kasa, duvara düşen gölge, alttaki sarkaç kutusu
      k.duzlem(); const gx=k.golgeYon[0]*3, gy=k.golgeYon[1]*3;
      leke(gx,gy+4,20,26,[0,0,0],.55);
      dolgu(()=>{c.moveTo(-6,14); c.lineTo(6,14); c.lineTo(5,26); c.lineTo(-5,26); c.closePath();},[40,32,24],1);
      hat(()=>{c.moveTo(-6,14); c.lineTo(6,14); c.lineTo(5,26); c.lineTo(-5,26); c.closePath();},[6,6,6],.7,.9,9,2,.6);
      dolgu(()=>{c.moveTo(16,0); c.arc(0,0,16,0,TAU);},[52,42,30],1);
      leke(-5,-6,14,12,[120,100,76],.3); leke(6,7,14,12,[0,0,0],.45);
      hat(()=>{c.moveTo(16,0); c.arc(0,0,16,0,TAU);},[6,6,6],.8,1,7,2,.6);
      kadran(12.5,g.a,g.t,cz);
      hat(()=>{c.moveTo(12.5,0); c.arc(0,0,12.5,0,TAU);},[6,6,6],.6,.8,8,2,.5);
      dolgu(()=>{c.moveTo(1.6,24); c.arc(0,22.5,1.6,0,TAU);},[110,100,70],.8); // sarkaç topu, kutunun camından
    }else{
      // cep saati: yere yüzü yukarı düşmüş; köstek kıvrılarak uzanır
      k.temas(0,0,3.6,3.6,.6,.4);
      k.duzlem(.5); c.rotate(g.donus);
      dolgu(()=>{c.moveTo(.6,-3.4); c.arc(0,-3.6,.7,0,TAU);},[120,116,100],1);
      serit(()=>{c.ellipse(0,-4.6,1.1,.9,0,0,TAU);},[120,116,100],1,.9);
      serit(()=>{let x=0, y=-5.4, b=-1.6; c.moveTo(x,y); for(const z of g.zincir){b+=(z-.5)*1.3; x+=Math.cos(b)*2; y+=Math.sin(b)*2; c.lineTo(x,y);}},[20,20,18],.8,1.9);
      serit(()=>{let x=0, y=-5.4, b=-1.6; c.moveTo(x,y); for(const z of g.zincir){b+=(z-.5)*1.3; x+=Math.cos(b)*2; y+=Math.sin(b)*2; c.lineTo(x,y);}},[150,146,128],.7,.9);
      dolgu(()=>{c.moveTo(3.1,0); c.arc(0,0,3.1,0,TAU);},[118,114,98],1);
      hat(()=>{c.moveTo(3.1,0); c.arc(0,0,3.1,0,TAU);},[10,10,10],.8,.7,5,2,.4);
      kadran(2.6,g.a,g.t,cz*.7);
    }
  }
};
