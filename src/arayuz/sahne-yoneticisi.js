// Sahne yöneticisi: çizim modülleri tek ortak canvas'ı ve `gor`u paylaştığı için aynı anda yalnızca bir sahne
// döngüsü çalışır. Yeni sahneye geçerken eskisi durdurulur, yenisi başlatılır (ön belleklerini kendisi yeniden kurar).
// Saf: DOM bilmez; sahne = {baslat(), durdur()} (ikisi de isteğe bağlı).
//
//   const y=sahneYoneticisi();
//   y.gec('sorgu', sorguSahnesi(...));   // önceki durur, bu başlar
//   y.ad                                 // etkin sahnenin adı ya da null
//   y.durdur()                           // etkin sahneyi durdurur

export function sahneYoneticisi({hata=(e,ad)=>console.error(`sahne "${ad}":`,e)}={}){
  let etkin=null, ad=null, sayac=0;
  const guvenli=(fn,a)=>{try{fn();}catch(e){hata(e,a);}};
  return {
    get ad(){return ad;},
    get etkin(){return etkin;},
    get gecisSayisi(){return sayac;},
    gec(yeniAd,sahne){
      if(etkin?.durdur){const s=etkin, a=ad; guvenli(()=>s.durdur(),a);}
      etkin=sahne||null; ad=sahne?yeniAd:null; sayac++;
      if(etkin?.baslat){const s=etkin; guvenli(()=>s.baslat(),yeniAd);}
      return etkin;
    },
    durdur(){
      if(etkin?.durdur){const s=etkin, a=ad; guvenli(()=>s.durdur(),a);}
      etkin=null; ad=null;
    },
  };
}
