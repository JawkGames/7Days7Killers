// Kalkıp gitme: sorgu bitince kişi sandalyeden kalkar, başı önde döner, karanlığa çekilir.
// Giriş animasyonunun (sahneler/sorgu-odasi/giris.js) tersi; aynı alanları üretir, böylece sahne aynı yolla çizer:
// ayakta (altGovde görünür, bacak çizilmez), d (kapıya uzaklık: küçülür, kapıya kayar), sal/zip (adım salınımı),
// kapi (kapı ışığı), karart (figür karanlığa gömülür: yürürken yüz okunmaz, sırtını dönmesi gerekmez), gorun.
// Saf işlev: z (saniye, kalkışın başından beri) → {giris, poz, bitti}. Kullanım: README "Kalkıp gitme".
const yum=(a,b,z)=>{const t=Math.max(0,Math.min(1,(z-a)/(b-a))); return t*t*(3-2*t);};
const kub=o=>o<.5?4*o*o*o:1-Math.pow(-2*o+2,3)/2;
export const CIKIS={adim:10, zaman:{egil:[0,.7], kalk:[.35,1.75], kapiAc:[.9,2], yuru:[1.5,5.4], belirsiz:[4.5,5.5], kapiKapat:[5.3,6.4], bitis:6.6}};

export function cikisKaresi(z){
  const Z=CIKIS.zaman;
  const ayakta=kub(Math.max(0,Math.min(1,(z-Z.kalk[0])/(Z.kalk[1]-Z.kalk[0]))));
  const y=Math.max(0,Math.min(1,(z-Z.yuru[0])/(Z.yuru[1]-Z.yuru[0]))), d=.5-.5*Math.cos(y*Math.PI);
  const faz=d*CIKIS.adim, sal=Math.sin(faz*Math.PI);
  const kapi=yum(Z.kapiAc[0],Z.kapiAc[1],z)*(1-yum(Z.kapiKapat[0],Z.kapiKapat[1],z));
  const gorun=1-yum(Z.belirsiz[0],Z.belirsiz[1],z);
  const karart=Math.min(.94,.22*ayakta+1.5*d);
  // kalkmadan önce öne eğilir (ağırlığını verir), kalkarken doğrulur; baş önde, bakış yerde kalır
  const on=yum(Z.egil[0],Z.egil[1],z)*(1-yum(Z.kalk[0]+.3,Z.kalk[1],z));
  const bas=yum(0,.6,z);
  const bitti=z>=Z.bitis;
  return {
    // bas:null: sahnenin girisGuncelle'si giriş zaman çizelgesini başlatmasın (README)
    giris:{aktif:true,bas:null,d,ayakta,kapi,gorun:bitti?0:gorun,sal,zip:Math.abs(sal),faz,karart},
    poz:{egil:.45*on, basEg:.35*bas, bakisY:.55*bas},
    bitti
  };
}
