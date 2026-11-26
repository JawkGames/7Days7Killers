// Giriş: kapı açılır, figür siluet olarak belirir, yürür, sandalyeye oturur.
import {c} from '../../teknik/tuval.js';
import {leke,tara} from '../../teknik/firca.js';
import {PAL} from '../../teknik/palet.js';
import {hex,clamp,yumusak} from '../../../cekirdek/matematik.js';
import {azHareket} from '../../../platform/tercih.js';
import {GIRIS} from './ayar.js';

export const giris={aktif:false,bas:null,d:0,ayakta:0,kapi:0,gorun:1,sal:0,zip:0,faz:0,karart:0};
export const girisOlay={basla:null,bit:null}; // arayüz buraya bağlanır

export function girisBaslat(){
  if(azHareket) return; // az hareket tercihinde doğrudan oturur hâlde kalır
  Object.assign(giris,{aktif:true,bas:null,d:1,ayakta:1,kapi:0,gorun:0,sal:0,zip:0,faz:0,karart:.9});
  if(girisOlay.basla) girisOlay.basla();
}
export function girisGuncelle(t){
  const G=giris, Z=GIRIS.zaman; if(!G.aktif) return;
  if(G.bas==null) G.bas=t; const z=t-G.bas;
  G.kapi=yumusak(Z.kapiAc[0],Z.kapiAc[1],z)*(1-yumusak(Z.kapiKapat[0],Z.kapiKapat[1],z));
  G.gorun=yumusak(Z.belir[0],Z.belir[1],z);
  const y=clamp((z-Z.yuru[0])/(Z.yuru[1]-Z.yuru[0]),0,1), yy=.5-.5*Math.cos(y*Math.PI);
  G.d=1-yy; G.faz=yy*GIRIS.adim; G.sal=Math.sin(G.faz*Math.PI); G.zip=Math.abs(G.sal);
  const o=clamp((z-Z.otur[0])/(Z.otur[1]-Z.otur[0]),0,1), e=o<.5?4*o*o*o:1-Math.pow(-2*o+2,3)/2;
  G.ayakta=1-e;
  G.karart=clamp(.64*G.d+.3*G.ayakta,0,.92);
  if(z>Z.bitis){Object.assign(G,{aktif:false,d:0,ayakta:0,kapi:0,gorun:1,sal:0,zip:0,karart:0}); if(girisOlay.bit) girisOlay.bit();}
}
export function kapiIsigi(){ // koridordan sızan soğuk ışık
  const a=giris.kapi; if(a<.01) return;
  const K=GIRIS.kapi;
  c.beginPath(); c.moveTo(K[0][0],K[0][1]); for(let i=1;i<4;i++) c.lineTo(K[i][0],K[i][1]); c.closePath();
  const g=c.createLinearGradient(0,K[1][1],0,K[2][1]); g.addColorStop(0,`rgba(92,108,104,${.36*a})`); g.addColorStop(1,`rgba(140,150,138,${.5*a})`);
  c.fillStyle=g; c.fill();
  c.save(); c.clip(); tara(K[3][0],K[1][1],K[2][0],K[2][1],1.35,9,PAL.murekkep,.3*a,750); c.restore();
  leke(GIRIS.kapiX,960,230,64,hex('#8c968a'),.2*a); leke(GIRIS.kapiX,520,330,520,hex('#6f7c78'),.09*a);
}