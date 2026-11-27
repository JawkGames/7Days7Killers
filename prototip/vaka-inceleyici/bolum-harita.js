// Köy haritası: 22 mekânın komşuluk şeması (SVG) ve zaman kaydırıcısıyla o dilimde kim nerede.
import {T,esc,ad,yer,cumle,an,anSaat,kisiBag} from './metin.js';
import {KOORD} from './yerlesim.js';
import {renk,kisa} from './bolum-cizelge.js';

const GEN=1000, YUK=790;

function koordinatlar(B){
  const P={...KOORD};
  const eksik=Object.keys(B.koy.mekanlar).filter(m=>!P[m]);
  eksik.forEach((m,i)=>{P[m]=[60+i*90,770];}); // yeni mekân: alta dizilir
  return P;
}

export function haritaCiz(B,kok,durum){
  const v=B.vaka, P=koordinatlar(B);
  durum.t??=(v.cinayetler?.[0]?.zaman??0);
  const kenarlar=[];
  for(const [a,l] of Object.entries(v.harita||{})) for(const b of l) if(a<b&&P[a]&&P[b]) kenarlar.push([a,b]);
  const cinJump=(v.cinayetler||[]).map(c=>`<button type="button" data-git="${c.zaman}" title="${esc(`${ad(c.katil)} → ${ad(c.kurban)}`)}">${esc(c.id)}</button>`).join('');
  kok.innerHTML=`<p class="aciklama">${esc(T.harita.aciklama)}</p>
  <div class="arac-cubugu harita-arac">
    <button type="button" data-adim="-1" aria-label="-1">◀</button>
    <input type="range" min="0" max="${B.T-1}" step="1" value="${durum.t}" aria-label="${esc(T.harita.dilim)}" class="kaydirici">
    <button type="button" data-adim="1" aria-label="+1">▶</button>
    <button type="button" class="oynat">${esc(T.harita.oynat)}</button>
    <b class="an-yazi"></b>
    <span class="cin-git"><span class="soluk">${esc(T.harita.git)}:</span> ${cinJump}</span>
  </div>
  <div class="harita-duzen">
    <svg class="harita" viewBox="0 0 ${GEN} ${YUK}" role="img" aria-label="${esc(T.sekmeler.harita)}">
      <g class="kenarlar">${kenarlar.map(([a,b])=>`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" data-a="${esc(a)}" data-b="${esc(b)}"/>`).join('')}</g>
      <g class="dugumler"></g>
    </svg>
    <div class="dilim-listesi"></div>
  </div>`;
  const svg=kok.querySelector('svg .dugumler');
  const liste=kok.querySelector('.dilim-listesi');
  const kay=kok.querySelector('.kaydirici');
  const yaz=kok.querySelector('.an-yazi');

  function ciz(){
    const t=durum.t;
    kay.value=t; yaz.textContent=anSaat(t);
    const burada={};
    for(const k of B.ids){const m=v.cizelge?.[k]?.[t]; if(m!=null) (burada[m]??=[]).push(k);}
    const simdi=(v.cinayetler||[]).filter(c=>c.zaman===t);
    const gecmis=new Set((v.cinayetler||[]).filter(c=>c.zaman<t).map(c=>c.mekan));
    const secili=durum.suz;
    let g='';
    for(const m of Object.keys(P)){
      const [x,y]=P[m], r=renk(B,m), l=burada[m]||[];
      const cin=simdi.find(c=>c.mekan===m);
      const yaricap=22+Math.min(12,l.length*2);
      const vurgu=l.some(k=>secili.has(k));
      g+=`<g class="dugum${cin?' cin':''}${vurgu?' vurgu':''}${l.length?'':' bos'}" data-mekan="${esc(m)}" transform="translate(${x},${y})">`;
      if(cin) g+=`<circle r="${yaricap+11}" class="cin-halka"/>`;
      g+=`<circle r="${yaricap}" style="fill:${r.zemin};stroke:${r.kenar}"/>`;
      if(gecmis.has(m)) g+=`<text class="gecmis" x="${yaricap-4}" y="${-yaricap+6}">✕</text>`;
      g+=`<text class="say" y="6">${l.length||''}</text>`;
      g+=`<text class="ad" y="${yaricap+15}">${esc(yer(m))}</text>`;
      const goster=l.slice(0,4);
      goster.forEach((k,i)=>{g+=`<text class="kisi${secili.has(k)?' sec':''}${B.rolSinif(k)==='katil'?' katil':''}" y="${yaricap+31+i*14}">${esc(ad(k))}</text>`;});
      if(l.length>4) g+=`<text class="kisi soluk" y="${yaricap+31+4*14}">+${l.length-4}</text>`;
      if(cin) g+=`<text class="cin-yazi" x="${-yaricap-14}" y="${-yaricap+2}">${esc(cin.id)}</text>`;
      g+='</g>';
    }
    svg.innerHTML=g;
    const sirali=Object.keys(burada).sort((a,b)=>burada[b].length-burada[a].length||yer(a).localeCompare(yer(b),'tr'));
    liste.innerHTML=`<h4>${esc(T.harita.buDilimde)} · ${esc(an(t))}</h4>`+
      simdi.map(c=>`<p class="cin-not">${esc(cumle(T.harita.cinayetBurada,{c:c.id,kurban:ad(c.kurban)}))} (${esc(yer(c.mekan))})</p>`).join('')+
      `<ul class="liste sik">${sirali.map(m=>`<li><span class="mek-rozet" style="--z:${renk(B,m).zemin};--k:${renk(B,m).kenar}">${esc(kisa(m))}</span> <b>${esc(yer(m))}</b>: ${burada[m].map(k=>kisiBag(k)).join(', ')}</li>`).join('')}</ul>`;
  }
  ciz();
  let zamanlayici=null;
  const dur=()=>{clearInterval(zamanlayici); zamanlayici=null; kok.querySelector('.oynat').textContent=T.harita.oynat;};
  kay.oninput=()=>{durum.t=Number(kay.value); ciz();};
  kok.onclick=e=>{
    const el=e.target.closest('button');
    if(!el) return;
    if(el.dataset.adim){durum.t=Math.max(0,Math.min(B.T-1,durum.t+Number(el.dataset.adim))); ciz();}
    else if(el.dataset.git){durum.t=Number(el.dataset.git); ciz();}
    else if(el.classList.contains('oynat')){
      if(zamanlayici){dur(); return;}
      el.textContent=T.harita.durdur;
      zamanlayici=setInterval(()=>{ if(!kok.isConnected||kok.closest('[hidden]')){dur(); return;} durum.t=(durum.t+1)%B.T; ciz(); },700);
    }
  };
}
