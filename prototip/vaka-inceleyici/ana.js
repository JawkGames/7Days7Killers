// Vaka inceleyici: tohum girişi, kalite özeti, sekmeler ve kişi paneli. Adres: ?tohum=77[&kisi=cemil]#cizelge
import {T,esc,etiket,etiketMetin,ad,kisiBag,an,yer} from './metin.js';
import {vakaKur,tohumCoz} from './veri.js';
import {ozetCiz,kopyaMetni} from './bolum-ozet.js';
import {cizelgeCiz,nedenMetin} from './bolum-cizelge.js';
import {haritaCiz} from './bolum-harita.js';
import {izlerCiz} from './bolum-izler.js';
import {yalanlarCiz} from './bolum-yalanlar.js';
import {cozumCiz} from './bolum-cozum.js';
import {kisiCiz} from './bolum-kisi.js';

const $=s=>document.querySelector(s);
const BOLUMLER={ozet:ozetCiz,cizelge:cizelgeCiz,harita:haritaCiz,izler:izlerCiz,yalanlar:yalanlarCiz,cozum:cozumCiz};
let B=null, durum=null, sekme='ozet';

function iskelet(){
  document.title=`${T.baslik} — 7 Days 7 Killers`;
  $('#baslik').textContent=T.baslik;
  $('#altBaslik').textContent=T.altBaslik;
  $('#tohumEtiket').textContent=T.tohum;
  $('#git').textContent=T.git;
  $('#onceki').textContent=T.onceki; $('#onceki').title=T.oncekiIpucu; $('#onceki').setAttribute('aria-label',T.oncekiIpucu);
  $('#sonraki').textContent=T.sonraki; $('#sonraki').title=T.sonrakiIpucu; $('#sonraki').setAttribute('aria-label',T.sonrakiIpucu);
  $('#rasgele').textContent=T.rasgele;
  $('#kopyala').textContent=T.kopyala;
  $('#kisiKapat').textContent=T.kisi.kapat;
  $('#sekmeler').innerHTML=Object.entries(T.sekmeler).map(([k,m])=>`<button type="button" role="tab" data-sekme="${k}">${esc(m)}</button>`).join('');
  $('main').innerHTML=Object.keys(T.sekmeler).map(k=>`<section class="bolum" id="b-${k}" role="tabpanel" hidden></section>`).join('');
}

function adres({tohum,kisi}={}){
  const u=new URL(location.href);
  if(tohum!==undefined) u.searchParams.set('tohum',String(tohum));
  if(kisi!==undefined){ if(kisi) u.searchParams.set('kisi',kisi); else u.searchParams.delete('kisi'); }
  u.hash=sekme;
  return u;
}

function kaliteCiz(){
  const v=B.vaka, q=v.kalite||{}, z=q.zorluk||{};
  const ned=(q.nedenler||[]).map(n=>etiket(T.kalite.nedenler,typeof n==='string'?n:n?.tur));
  const parca=[
    `<b class="${q.gecti?'yesil':'kirmizi'}">${esc(q.gecti?T.kalite.gecti:T.kalite.gecemedi)}</b>${ned.length?' ('+ned.join(', ')+')':''}`,
    esc(T.kalite.deneme.replace('{n}',v.deneme??'?')),
    esc((q.elenenDenemeler||[]).length?T.kalite.elenen.replace('{n}',q.elenenDenemeler.length):T.kalite.elenenYok),
    esc(T.kalite.sorgu.replace('{n}',z.sorgu??'?'))+(z.sigar===false?' · <b class="kirmizi">'+esc(T.kalite.sigmaz)+'</b>':''),
    esc(T.kalite.adim.replace('{n}',z.adim??'?')),
    esc(T.kalite.tekTanik.replace('{n}',z.tekTanik??'?')),
    esc(T.kalite.fotograf.replace('{n}',z.fotograf??'?')),
    esc(T.kalite.celiski.replace('{n}',q.celiski??'?')),
  ];
  const elenen=(q.elenenDenemeler||[]).map(e=>`#${esc(e.deneme)}: ${(e.nedenler||[]).map(n=>etiket(T.kalite.nedenler,typeof n==='string'?n:n?.tur)).join(', ')}`).join(' · ');
  const zincir=Object.entries(q.zincirler||{}).map(([k,n])=>`${kisiBag(k)} <b class="${n>=2?'':'kirmizi'}">${esc(n)}</b>`).join(' · ');
  $('#kalite').innerHTML=`<p>${parca.join(' · ')} · <span class="soluk">${esc(T.sure.replace('{ms}',B.ms))}</span></p>
    <p><span class="etiket">${esc(T.kalite.zincirler)}</span> ${zincir||esc(T.bos)}</p>
    <p class="soluk"><span class="etiket">${esc(T.kalite.cekirdekler)}</span> ${esc((v.cekirdekler||[]).join(', ')||T.bos)}</p>${elenen?`<p class="soluk"><span class="etiket">${esc(T.kalite.elenenBaslik)}</span> ${elenen}</p>`:''}`;
}

function sekmeGoster(ad_){
  if(!BOLUMLER[ad_]) ad_='ozet';
  sekme=ad_;
  document.querySelectorAll('#sekmeler button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.sekme===ad_)));
  document.querySelectorAll('main .bolum').forEach(s=>{s.hidden=s.id!=='b-'+ad_;});
  const kok=$('#b-'+ad_);
  if(B&&!kok.dataset.cizildi){
    try{ BOLUMLER[ad_](B,kok,durum); kok.dataset.cizildi='1'; }
    catch(e){ console.error(e); kok.innerHTML=`<p class="hata">${esc(T.bolumHata)}: ${esc(e.message)}</p>`; }
  }
  history.replaceState(null,'',adres());
}

function ac(tohumYazi){
  const tohum=tohumCoz(tohumYazi);
  $('#tohum').value=String(tohum);
  $('#kalite').innerHTML=`<p class="soluk">${esc(T.yukleniyor)}</p>`;
  document.querySelectorAll('main .bolum').forEach(s=>{s.innerHTML=''; delete s.dataset.cizildi;});
  try{ B=vakaKur(tohum); }
  catch(e){ console.error(e); B=null; $('#kalite').innerHTML=`<p class="hata">${esc(T.kurulamadi)}: ${esc(e.message)}</p>`; return; }
  durum={sira:'rol',suz:new Set(),mekan:null,t:null};
  document.title=`${T.tohum} ${tohum} — ${T.baslik}`;
  kaliteCiz();
  history.replaceState(null,'',adres({tohum}));
  sekmeGoster(sekme);
  const k=new URL(location.href).searchParams.get('kisi');
  if(k) kisiAc(k); else kisiKapat(false);
}

function kisiAc(k){
  if(!B) return;
  const p=$('#kisiPanel');
  try{ $('#kisiIcerik').innerHTML=kisiCiz(B,k); }
  catch(e){ console.error(e); $('#kisiIcerik').innerHTML=`<p class="hata">${esc(T.bolumHata)}: ${esc(e.message)}</p>`; }
  p.hidden=false; document.body.classList.add('panel-acik');
  $('#kisiIcerik').scrollTop=0;
  history.replaceState(null,'',adres({kisi:k}));
}
function kisiKapat(adresYaz=true){
  $('#kisiPanel').hidden=true; document.body.classList.remove('panel-acik');
  if(adresYaz) history.replaceState(null,'',adres({kisi:null}));
}

async function kopyala(){
  if(!B) return;
  const m=kopyaMetni(B);
  const not=$('#kopyaNot');
  try{ await navigator.clipboard.writeText(m); not.textContent=T.kopyalandi; not.hidden=false; $('#kopyaMetin').hidden=true; }
  catch{ const ta=$('#kopyaMetin'); ta.value=m; ta.hidden=false; ta.select(); not.textContent=T.kopyalanamadi; not.hidden=false; }
  setTimeout(()=>{not.hidden=true;},2500);
}

iskelet();
$('#tohumForm').onsubmit=e=>{e.preventDefault(); ac($('#tohum').value);};
const kay=d=>{const t=tohumCoz($('#tohum').value); ac(typeof t==='number'?t+d:1);};
$('#onceki').onclick=()=>kay(-1);
$('#sonraki').onclick=()=>kay(1);
$('#rasgele').onclick=()=>ac(1+Math.floor(Math.random()*99999));
$('#kopyala').onclick=kopyala;
$('#sekmeler').onclick=e=>{const b=e.target.closest('[data-sekme]'); if(b) sekmeGoster(b.dataset.sekme);};
$('#kisiKapat').onclick=()=>kisiKapat();
$('#kisiPanel').onclick=e=>{if(e.target.id==='kisiPanel') kisiKapat();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#kisiPanel').hidden) kisiKapat();});
// Her yerde: kişi bağlantısı kişi sayfasını açar.
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-kisi]');
  if(b&&!b.closest('td')){e.preventDefault(); kisiAc(b.dataset.kisi); return;}
  // Kişi sayfasındaki rota hücresi: ayrıntı satırı
  const td=e.target.closest('#kisiIcerik td.h');
  if(td){
    const k=td.dataset.k, t=Number(td.dataset.t);
    const p=$('#kisiIcerik .cz-ayrinti');
    if(p) p.textContent=`${an(t)} · ${td.dataset.m?yer(td.dataset.m):T.bos} — ${nedenMetin(B,k,B.vaka.neden?.[k]?.[t])}`;
  }
});
window.addEventListener('hashchange',()=>sekmeGoster(location.hash.slice(1)));

const ilk=new URL(location.href);
sekme=BOLUMLER[ilk.hash.slice(1)]?ilk.hash.slice(1):'ozet';
ac(ilk.searchParams.get('tohum')??'77');
// Geliştirici konsolu için
window.inceleyici={get b(){return B;},ac,etiketMetin,ad};
