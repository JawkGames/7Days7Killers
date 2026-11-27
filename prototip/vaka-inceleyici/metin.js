// Kimlikten söze yardımcılar: kişi, mekân, eşya, zaman. Cümleleri src/diyalog/kalip.js ve ek motoruyla kurar.
// Bilinmeyen kimlik ya da anahtar çökertmez: ⟨ham⟩ olarak yazılır.
import trKisiler from '/src/dil/tr/kisiler.js';
import trTerimler from '/src/dil/tr/terimler.js';
import trOyun from '/src/dil/tr/oyun.js';
import {kisiAdi,mekanAdi} from '/src/dil/tr/ekler.js';
import {doldur} from '/src/diyalog/kalip.js';
import {esyaYazi,izAdi as oyunIzAdi} from '/src/diyalog/adlar.js';
import T from './tr.js';

export {T,trKisiler,trTerimler,trOyun};

export const ham=k=>`⟨${k}⟩`;
// HTML kaçışı
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Sözlükten etiket; yoksa ham anahtar (HTML).
export function etiket(sozluk,anahtar){
  if(anahtar==null) return esc(T.bos);
  const v=sozluk?.[anahtar];
  return v!=null&&typeof v!=='object'?esc(v):`<code class="ham" title="${esc(T.ham)}">${esc(anahtar)}</code>`;
}
// Aynısı, düz metin.
export const etiketMetin=(sozluk,anahtar)=>anahtar==null?T.bos:(sozluk?.[anahtar]!=null&&typeof sozluk[anahtar]!=='object'?sozluk[anahtar]:ham(anahtar));

export const ad=id=>id==null?T.bos:(trKisiler[id]?.lakap??ham(id));
export const tamAd=id=>trKisiler[id]?`${trKisiler[id].lakap} (${trKisiler[id].ad})`:ham(id);
export const kd=id=>trKisiler[id]?kisiAdi(trKisiler[id].lakap):{metin:id==null?T.bos:ham(id),ozelAd:true,iyelikli:false};
export const yer=m=>m==null?T.bos:(trTerimler.mekan[m]??ham(m));
export const md=m=>trTerimler.mekan[m]?mekanAdi(trTerimler.mekan[m]):{metin:m==null?T.bos:ham(m),ozelAd:true,iyelikli:false};
export const ortu=o=>o==null?T.bos:(trTerimler.ortu[o]??ham(o));
export const esya=(sahip,e)=>{
  if(e==null) return T.bos;
  try{ const a=esyaYazi(sahip,e); return a===trOyun.iz.tur.nesne&&!trOyun.iz.ad[e]?ham(e):a; }catch{ return ham(e); }
};
export const esyaTam=(sahip,e)=>trKisiler[sahip]?.esyalar?.[e]??trOyun.iz.ad[e]??ham(e);
export const sirMetni=(sahip,id)=>trKisiler[sahip]?.sirlar?.[id]??ham(id);
export function izAdi(iz){try{return oyunIzAdi(iz);}catch{return ham(iz?.anahtar??iz?.id);}}
export const sesAdi=s=>trOyun.ses?.[s]??ham(s);

// Liste: "A, B ve C"
export function liste(l){
  const x=l.filter(s=>s!=null&&s!=='');
  if(!x.length) return T.bos;
  return x.length===1?x[0]:x.slice(0,-1).join(', ')+' '+T.ve+' '+x[x.length-1];
}

// Kalıbı doldurur; bozulursa kalıbı ve hatayı gösterir, çökmez.
// buyuk:false → cümle başı büyütülmez ("c1: …", "evinde"); doldur yalnız ^ ve ". " sonrasını büyütür, başa sıfır
// genişlikli boşluk koymak baştaki büyütmeyi engeller.
export function cumle(kalip,degerler={},{buyuk=true}={}){
  if(typeof kalip!=='string') return ham(String(kalip));
  try{ return buyuk?doldur(kalip,degerler):doldur('\u200b'+kalip,degerler).replace(/^\u200b/,''); }
  catch(e){ console.warn('kalıp', kalip, e.message); return kalip.replace(/\{([^{}:]*)[^{}]*\}/g,(t,a)=>{const d=degerler[a]; return d==null?ham(a):(typeof d==='object'?d.metin:String(d));}); }
}

// Zaman
let D=5, DILIMLER=['gece','sabah','ogle','ikindi','aksam'], SAAT={};
export function zamanKur(vaka){DILIMLER=vaka.ayar?.dilimler??DILIMLER; D=DILIMLER.length; SAAT=vaka.ayar?.dilimSaatleri??{};}
export const gunu=t=>Math.floor(t/D)+1;
export const dilimi=t=>DILIMLER[((t%D)+D)%D];
export const dilimSayisi=()=>D;
export const dilimler=()=>DILIMLER;
export const dilimAdi=d=>T.dilim[d]??ham(d);
export const an=t=>t==null?T.bos:cumle(T.an,{gun:gunu(t),dilim:dilimAdi(dilimi(t))});
export const anSaat=t=>t==null?T.bos:(SAAT[dilimi(t)]?cumle(T.anSaat,{gun:gunu(t),dilim:dilimAdi(dilimi(t)),saat:SAAT[dilimi(t)]}):an(t));
// Küçük harfle başlayabilen parça (cümle başı büyütülmez).
export const parca=(kalip,d)=>cumle(kalip,d,{buyuk:false});
// cümle içinde ek alabilen zaman değeri ("1. gün gece")
export const anD=t=>({metin:an(t),ozelAd:false,iyelikli:false});

// Kişi bağlantısı (tıklayınca kişi sayfası)
export const kisiBag=(id,ek='')=>id==null?esc(T.bos):`<button type="button" class="kisi-bag" data-kisi="${esc(id)}">${esc(ad(id))}</button>${ek}`;
export const kisiBaglar=l=>l.length?l.map(k=>kisiBag(k)).join(', '):esc(T.bos);
