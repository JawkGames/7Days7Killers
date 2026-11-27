// Zaman çizelgesi: kişi × dilim ızgarası. Hücre = o dilimdeki mekân (renk + kısaltma), nedeni ipucunda.
// Ada tıklamak satırları süzer, mekâna tıklamak mekânı vurgular, cinayet sütununa tıklamak ilgilileri süzer.
import {T,esc,ad,kd,yer,esya,sirMetni,cumle,an,gunu,dilimi,dilimSayisi,ham,parca} from './metin.js';
import {nedenParca,nedenSinif} from './veri.js';
import {mekanRenkleri,BILINMEZ_RENK} from './yerlesim.js';

let RENK=null;
export function renk(B,m){
  RENK??=mekanRenkleri(Object.values(B.koy.mekanlar));
  return RENK[m]??BILINMEZ_RENK;
}
export const kisa=m=>m==null?'':(T.mekanKisa[m]??String(m).slice(0,3));

// Çizelgedeki `neden` anahtarını söze çevirir.
export function nedenMetin(B,k,n){
  if(n==null) return T.bos;
  const [tur,arg]=nedenParca(n);
  const kal=T.neden[tur];
  if(kal==null) return ham(n);
  const v=B.vaka;
  const d={c:arg??'',kim:kd(arg)};
  if(tur==='sir'){
    const s=(v.sirlar||[]).find(x=>x.sahip===k&&x.id===arg)??(v.sirlar||[]).find(x=>x.id===arg);
    d.sir=s?sirMetni(s.sahip,s.id):ham(arg);
  }
  if(tur==='hirsizlik'||tur==='ot-alma'){
    const o=B.olayById[arg];
    d.sahip=kd(o?.sahip); d.esya=o?esya(o.sahip,o.esya):ham(arg);
  }
  return parca(kal,d);
}

const ROL_SIRA={katil:0,kurban:1,masum:2};
export function siraliKisiler(B,sira){
  const l=[...B.ids];
  if(sira==='rol') l.sort((a,b)=>(ROL_SIRA[B.rolSinif(a)]-ROL_SIRA[B.rolSinif(b)])||ad(a).localeCompare(ad(b),'tr'));
  return l;
}

// Bir hücrenin HTML'i (çizelgede ve kişi sayfasında ortak).
export function hucre(B,k,t,{etiketli=false}={}){
  const v=B.vaka;
  const m=v.cizelge?.[k]?.[t]??null, n=v.neden?.[k]?.[t]??null;
  const sinif=['h'];
  const s=nedenSinif(n);
  if(s) sinif.push('h-'+s);
  if(m==null) sinif.push('h-bos');
  const c=(v.cinayetler||[]).find(x=>x.zaman===t&&x.kurban===k);
  if(c) sinif.push('h-kurban');
  const r=m!=null?renk(B,m):null;
  const baslik=`${ad(k)} · ${an(t)} · ${m==null?T.bos:yer(m)} — ${nedenMetin(B,k,n)}`;
  const stil=r?` style="--z:${r.zemin};--k:${r.kenar}"`:'';
  const ic=etiketli?`${esc(kisa(m))}<small>${esc(T.dilimKisa[dilimi(t)]??'')}</small>`:esc(kisa(m));
  return `<td class="${sinif.join(' ')}" data-k="${esc(k)}" data-t="${t}" data-m="${esc(m??'')}" title="${esc(baslik)}"${stil}>${ic}</td>`;
}

export function cizelgeCiz(B,kok,durum){
  const v=B.vaka, D=dilimSayisi(), G=Math.ceil(B.T/D);
  const cinT={}; for(const c of v.cinayetler||[]) (cinT[c.zaman]??=[]).push(c);
  const kisiler=siraliKisiler(B,durum.sira);
  const h=[];
  h.push(`<p class="aciklama">${esc(T.cizelge.aciklama)}</p>`);
  h.push(`<div class="arac-cubugu"><span>${esc(T.cizelge.sirala)}:</span>
    <button type="button" data-sira="rol" aria-pressed="${durum.sira==='rol'}">${esc(T.cizelge.siraRol)}</button>
    <button type="button" data-sira="ad" aria-pressed="${durum.sira==='ad'}">${esc(T.cizelge.siraAd)}</button>
    <button type="button" class="suz-temizle" ${durum.suz.size||durum.mekan?'':'disabled'}>${esc(T.cizelge.suzmeTemizle)}</button>
    <span class="suz-durum soluk">${[...durum.suz].map(ad).map(esc).join(', ')}${durum.mekan?' · '+esc(yer(durum.mekan)):''}</span></div>`);
  let t1=`<tr><th class="yapis" rowspan="2">${esc(T.cizelge.kisi)}</th>`;
  for(let g=1;g<=G;g++) t1+=`<th colspan="${D}" class="gun-bas">${esc(cumle(T.gun,{n:g}))}</th>`;
  t1+='</tr><tr>';
  for(let t=0;t<B.T;t++){
    const l=cinT[t];
    const d=dilimi(t);
    t1+=`<th class="dilim-bas${t%D===0?' gun-ayrac':''}${l?' cin-bas':''}" ${l?`data-cin="${esc(l.map(c=>c.id).join(','))}" title="${esc(l.map(c=>`${c.id}: ${ad(c.katil)} → ${ad(c.kurban)}, ${yer(c.mekan)}`).join('\n'))}"`:`title="${esc(an(t))}"`}>${esc(T.dilimKisa[d]??d)}${l?`<span class="cin-id">${esc(l.map(c=>c.id).join(' '))}</span>`:''}</th>`;
  }
  t1+='</tr>';
  let gov='';
  for(const k of kisiler){
    const rs=B.rolSinif(k);
    gov+=`<tr data-satir="${esc(k)}" class="r-${rs}"><th class="yapis"><button type="button" class="cz-ad" data-suz="${esc(k)}" aria-pressed="${durum.suz.has(k)}">${esc(ad(k))}</button><span class="rol-nokta r-${rs}" title="${esc(T.rol[rs]??rs)}"></span><button type="button" class="kisi-git" data-kisi="${esc(k)}" title="${esc(T.cizelge.kisiSayfasi)}" aria-label="${esc(T.cizelge.kisiSayfasi)}">↗</button></th>`;
    for(let t=0;t<B.T;t++) gov+=hucre(B,k,t).replace('<td class="h','<td class="h'+(t%D===0?' gun-ayrac':'')+(cinT[t]?' cin-sut':''));
    gov+='</tr>';
  }
  h.push(`<div class="kaydir"><table class="cz">${'<thead>'+t1+'</thead>'}<tbody>${gov}</tbody></table></div>`);
  h.push(`<p class="cz-ayrinti" aria-live="polite">${esc(T.cizelge.secHucre)}</p>`);
  // Lejant
  const isaret=Object.entries(T.cizelge.isaret).map(([s,m])=>`<span class="lej"><span class="h h-${s} lej-kutu"></span>${esc(m)}</span>`).join('');
  const mekanlar=Object.keys(B.koy.mekanlar).sort((a,b)=>yer(a).localeCompare(yer(b),'tr'));
  const mek=mekanlar.map(m=>{const r=renk(B,m); return `<button type="button" class="mek-dugme" data-mekan="${esc(m)}" aria-pressed="${durum.mekan===m}" style="--z:${r.zemin};--k:${r.kenar}"><b>${esc(kisa(m))}</b> ${esc(yer(m))}</button>`;}).join('');
  h.push(`<div class="lejant"><h4>${esc(T.cizelge.lejant)}</h4><div class="lej-satir">${isaret}</div><h4>${esc(T.cizelge.mekanlar)}</h4><div class="lej-satir">${mek}</div></div>`);
  kok.innerHTML=h.join('');
  suzUygula(kok,durum);

  kok.onclick=e=>{
    const el=e.target.closest('button,td,th');
    if(!el||!kok.contains(el)) return;
    if(el.dataset.sira){durum.sira=el.dataset.sira; cizelgeCiz(B,kok,durum); return;}
    if(el.classList.contains('suz-temizle')){durum.suz.clear(); durum.mekan=null; cizelgeCiz(B,kok,durum); return;}
    if(el.dataset.suz){const k=el.dataset.suz; durum.suz.has(k)?durum.suz.delete(k):durum.suz.add(k); cizelgeCiz(B,kok,durum); return;}
    if(el.dataset.mekan!==undefined&&el.classList.contains('mek-dugme')){durum.mekan=durum.mekan===el.dataset.mekan?null:el.dataset.mekan; cizelgeCiz(B,kok,durum); return;}
    if(el.dataset.cin){
      const ilgili=new Set();
      for(const id of el.dataset.cin.split(',')){
        const c=B.cinById[id]; if(!c) continue;
        [c.katil,c.kurban,c.yardimci,c.ortan,c.zorlayan,c.bulunma?.bulan,c.kacanTanik?.kisi,...(c.gozTaniklari||[])].forEach(x=>x&&ilgili.add(x));
        for(const iid of c.izler||[]){const i=B.izById[iid]; if(i?.tanik) ilgili.add(i.tanik); if(i?.fark_eden) ilgili.add(i.fark_eden);}
      }
      durum.suz=ilgili; cizelgeCiz(B,kok,durum); return;
    }
    if(el.tagName==='TD'&&el.dataset.k){
      const k=el.dataset.k, t=Number(el.dataset.t);
      kok.querySelectorAll('td.secili').forEach(x=>x.classList.remove('secili'));
      el.classList.add('secili');
      kok.querySelector('.cz-ayrinti').innerHTML=`<b>${esc(ad(k))}</b> · ${esc(an(t))} (${esc(cumle(T.gun,{n:gunu(t)}))}) · ${esc(el.dataset.m?yer(el.dataset.m):T.bos)} — ${esc(nedenMetin(B,k,B.vaka.neden?.[k]?.[t]))}`;
    }
  };
}

function suzUygula(kok,durum){
  const tablo=kok.querySelector('table.cz');
  if(durum.suz.size) tablo.querySelectorAll('tbody tr').forEach(tr=>{tr.hidden=!durum.suz.has(tr.dataset.satir);});
  if(durum.mekan){
    tablo.classList.add('mekan-vurgu');
    tablo.querySelectorAll('td.h').forEach(td=>td.classList.toggle('vurgu',td.dataset.m===durum.mekan));
  }
}
