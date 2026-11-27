// Arayüzün küçük ortak yardımcıları: metin anahtarı doldurma, DOM öğesi kurma, bekleme.
import {metin} from '../dil/index.js';

// Arayüz metni: anahtar dil dosyasından gelir, {ad} yer tutucuları değerlerle dolar (ek almaz; ekli cümle kalıp motorundan gelir).
export function M(anahtar,degerler){
  const s=metin(anahtar);
  return degerler?s.replace(/\{(\w+)\}/g,(m,k)=>degerler[k]!=null?String(degerler[k]):m):s;
}

// el('button',{sinif:'ana', yazi:'...', tik:fn, ozellik:{'aria-label':'...'}}, ...cocuklar)
export function el(etiket,o={},...cocuk){
  const e=document.createElement(etiket);
  if(o.sinif) e.className=o.sinif;
  if(o.yazi!=null) e.textContent=o.yazi;
  if(o.tik) e.addEventListener('click',o.tik);
  if(o.tur) e.type=o.tur;
  else if(etiket==='button') e.type='button';
  if(o.ozellik) for(const [a,v] of Object.entries(o.ozellik)) if(v!=null&&v!==false) e.setAttribute(a,v===true?'':String(v));
  if(o.devre) e.disabled=true;
  for(const c of cocuk.flat()) if(c!=null&&c!==false) e.append(c);
  return e;
}

export const bekle=ms=>new Promise(r=>setTimeout(r,ms));
export const sonrakiKare=()=>new Promise(r=>requestAnimationFrame(()=>r()));

// localStorage/sessionStorage erişimi hata atabilir (gizli pencere): sessizce geç.
export function oturumOku(a){try{return sessionStorage.getItem(a);}catch{return null;}}
export function oturumYaz(a,v){try{if(v==null) sessionStorage.removeItem(a); else sessionStorage.setItem(a,v);}catch{/* depo yok */}}
