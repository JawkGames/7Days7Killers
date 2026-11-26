// Metinden ağız çizelgesi: her harf için ağız şekli ve başlangıç zamanı (ms).
// K = {sure:{unlu,unsuz,dudak,bosluk,nokta}}, tablo = dil/<kod>/agiz.js
export function cizelgeKur(metin,K,tablo){
  const adimlar=[]; let z=0;
  [...metin].forEach((h,i)=>{
    const k=h.toLocaleLowerCase(tablo.yerel); let sekil,sure,unlu=false;
    if(/\s/.test(k)){sekil='kapali'; sure=K.sure.bosluk;}
    else if(/[.,;:?…]/.test(k)){sekil='kapali'; sure=K.sure.nokta;}
    else if(k==='!'){sekil='kapali'; sure=K.sure.nokta; for(let j=adimlar.length-1;j>=0;j--) if(adimlar[j].unlu){adimlar[j].sekil=tablo.vurgu; break;}}
    else if(tablo.harf[k]){sekil=tablo.harf[k]; unlu=sekil!=='kapali'; sure=unlu?K.sure.unlu:K.sure.dudak;}
    else{sekil=tablo.unsuz; sure=K.sure.unsuz;}
    adimlar.push({bas:z,sekil,harf:i+1,unlu}); z+=sure;
  });
  return {adimlar,bitis:z};
}
