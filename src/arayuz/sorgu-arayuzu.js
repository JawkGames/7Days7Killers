// Sorgu sahnesinin geçici arayüzü: alt yazı ve iki deneme düğmesi.
import {metin} from '../dil/index.js';
import {konus,sus,konusmaOlay} from '../diyalog/konusma.js';
import {giris,girisBaslat,girisOlay} from '../cizim/sahneler/sorgu-odasi/giris.js';

export function sorguArayuzuKur(){
  const el=id=>document.getElementById(id);
  const kutu=el('kutu'), altyazi=el('altyazi'), dugme=el('konustur'), tekrar=el('tekrar');
  document.title=metin('sayfa.baslik');
  el('sahne').setAttribute('aria-label',metin('sahne.aciklama'));
  dugme.textContent=metin('dugme.konustur'); tekrar.textContent=metin('dugme.girisTekrar');

  konusmaOlay.basla=()=>{altyazi.textContent=''; dugme.classList.add('soluk'); dugme.textContent=metin('dugme.tekrarKonustur');};
  konusmaOlay.yaz=m=>{altyazi.textContent=m;};
  konusmaOlay.bit=()=>{dugme.classList.remove('soluk');};
  girisOlay.basla=()=>{sus(); altyazi.textContent=''; dugme.classList.add('soluk');};
  girisOlay.bit=()=>{dugme.classList.remove('soluk');};

  kutu.addEventListener('click',()=>{ if(!giris.aktif) konus(metin('ornek.cumle')); });
  tekrar.addEventListener('click',e=>{e.stopPropagation(); girisBaslat();});
}
