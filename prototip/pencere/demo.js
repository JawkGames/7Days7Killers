// Pencere sahnesi deneme sayfası. Adres parametreleri: ?dogru=0..7&tohum=N&an=saniye (an: kareyi sabitler, sınama için)
import {tuvalKur} from '/src/cizim/teknik/tuval.js';
import {pencereBaslat} from '/src/cizim/sahneler/pencere/sahne.js';
import TR from './tr.js';

const q=new URLSearchParams(location.search);
const el=id=>document.getElementById(id);
document.title=TR['sayfa.baslik'];
el('sahne').setAttribute('aria-label',TR['sahne.aciklama']);
el('dogruEtiket').textContent=TR['secici.etiket'];
el('dogru').title=TR['secici.aciklama'];
el('tohumEtiket').textContent=TR['tohum.etiket'];
el('tekrar').textContent=TR['dugme.tekrar'];
for(let i=0;i<=7;i++){const o=document.createElement('option'); o.value=o.textContent=String(i); el('dogru').appendChild(o);}
el('dogru').value=q.get('dogru')??'7';
el('tohum').value=q.get('tohum')??'1';
if(q.has('gizle')) el('panel').hidden=true;

tuvalKur(el('sahne'));
const an=q.has('an')?Number(q.get('an')):null;
let sahne=null;
function oynat(){
  if(sahne) sahne.durdur();
  el('durum').textContent='';
  sahne=pencereBaslat({dogru:Number(el('dogru').value),tohum:Number(el('tohum').value)||1,
    zaman:an==null?null:()=>an,
    bitince:()=>{el('durum').textContent=TR['durum.bitti']; document.body.dataset.bitti='1';}});
  window.pencere=sahne;
}
el('tekrar').addEventListener('click',oynat);
el('dogru').addEventListener('change',oynat);
el('tohum').addEventListener('change',oynat);
oynat();
