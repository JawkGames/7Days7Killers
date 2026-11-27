// Görüntü efektleri: eskitme katmanı. Varsayılan hepsi açık; oyuncu rahatsız olursa tek tek kapatabilir.
// Tarayıcıda "az hareket" tercihi varsa hareketli olanlar (titreme, kaynama, bant) baştan kapalı gelir.
// Ayar bu tarayıcıda saklanır (localStorage); okunamazsa varsayılanlar kullanılır.

import {azHareket} from './tercih.js';

const ANAHTAR='7d7k-goruntu';

// film: film kumu, çizikler ve tozlar · titreme: lambanın titremesi ve ara sıra sönüp yanması
// kaynama: hatların saniyede birkaç kez titremesi · bant: ekranda yavaşça kayan soluk bant (eski tüp ekran)
export const EFEKTLER=['film','titreme','kaynama','bant'];

const varsayilan=()=>({film:true,titreme:!azHareket,kaynama:!azHareket,bant:!azHareket});

function oku(){
  const v=varsayilan();
  try{
    const s=JSON.parse(globalThis.localStorage?.getItem(ANAHTAR)||'null');
    if(s&&typeof s==='object') for(const k of EFEKTLER) if(typeof s[k]==='boolean') v[k]=s[k];
  }catch{ /* saklama yok ya da bozuk: varsayılan */ }
  return v;
}

// Çizim kodu her karede buradan okur; ayar değişince hemen etkili olur.
export const goruntu=oku();

export function goruntuAyarla(ad,deger){
  if(!EFEKTLER.includes(ad)) throw new Error('Bilinmeyen görüntü efekti: '+ad);
  goruntu[ad]=!!deger;
  try{ globalThis.localStorage?.setItem(ANAHTAR,JSON.stringify(goruntu)); }catch{ /* saklanamadı: bu oturumda geçerli */ }
}
