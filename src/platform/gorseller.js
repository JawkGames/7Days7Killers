// Üretilmiş resimler (varliklar/gorsel): mekânlar ve köylü portreleri.
// Resim varsa ve yüklendiyse sahne onu kullanır; yoksa ya da henüz yüklenmediyse kodla çizim sürer.
// Bütün resimler oyun açılırken arka planda yüklenir (gorselleriYukle).

// vite (ve vitest) yolları derleme sırasında çözer
const YOLLAR=import.meta.glob('../../varliklar/gorsel/{mekanlar,kisiler,oda,sonlar,kukla-parca,izler,kayip}/**/*.{png,webp}',{eager:true,query:'?url',import:'default'});

const resimler={}; // 'mekanlar/cami' → HTMLImageElement (yüklenince)

export function gorselleriYukle(){
  if(typeof Image==='undefined') return;
  for(const [yol,url] of Object.entries(YOLLAR)){
    const ad=yol.replace(/^.*varliklar\/gorsel\//,'').replace(/\.(png|webp)$/,'');
    if(resimler[ad]!==undefined) continue;
    resimler[ad]=null;
    const i=new Image(); i.decoding='async';
    i.onload=()=>{resimler[ad]=i;};
    i.src=url;
  }
}

// Yüklenmiş resim ya da null
export const resim=ad=>resimler[ad]||null;

// Mekânın olay yeri resmi (yoksa null)
export const mekanResmi=id=>resim('mekanlar/'+id);

// Köylü portresi: {temel, gozKapali, agizAcik} (temel yoksa null)
export function kisiResmi(id){
  const temel=resim(`kisiler/${id}/temel`); if(!temel) return null;
  return {temel, gozKapali:resim(`kisiler/${id}/goz-kapali`)||temel, agizAcik:resim(`kisiler/${id}/agiz-acik`)||temel};
}
