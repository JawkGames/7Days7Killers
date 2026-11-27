// Yalanlar: kişi × cinayet matrisi (her hücrede beş soru), seçilen hücrenin ifadeleri,
// yalan söyleyen ya da susan masumlar ve bütün doğru olmayan ifadeler.
import {T,esc,etiket,ad,kd,md,yer,ortu,sesAdi,izAdi,cumle,an,kisiBag,liste,ham} from './metin.js';
import {SORULAR,enIlginc} from './veri.js';
import {siraliKisiler} from './bolum-cizelge.js';
import {dolayliCumle} from './bolum-izler.js';

// İz kimliği: gerçek (i12), çözücünün opak fotoğraf (f3) ya da dolaylı (d2) kimliği.
export function izBul(B,id){
  if(B.izById[id]) return B.izById[id];
  if(!B.eslem||typeof id!=='string') return null;
  const g=id.startsWith('d')?B.eslem.dolayliIz(id):B.eslem.fizikselIz(id);
  return g?B.izById[g]??null:null;
}
const izKisa=(B,id)=>{const i=izBul(B,id); if(!i) return String(id); return `${i.tur==='dolayli'?T.izAlt[i.alt]??i.alt:izAdi(i)} (${id}${i.id!==id?'='+i.id:''})`;};

// İfadenin sorusu
export function soruMetin(B,o,konusan){
  if(!o) return T.bos;
  const S=T.yalanlar.soru;
  switch(o.tur){
    case 'konum': return o.kisi===konusan?cumle(S.konumKendi,{an:an(o.zaman)}):cumle(S.konum,{kisi:kd(o.kisi),an:an(o.zaman)});
    case 'gorulen': return cumle(S.gorulen,{an:an(o.zaman)});
    case 'fail': return cumle(S.fail,{c:o.cinayet??''});
    case 'esya': return cumle(S.esya,{iz:izKisa(B,o.iz)});
    case 'fark': return cumle(S.fark,{c:o.cinayet??''});
    default: return ham(JSON.stringify(o));
  }
}

// Söylenen ya da bilinen değer
export function degerYaz(B,o,x){
  if(x==null) return T.bos;
  if(!o) return ham(JSON.stringify(x));
  switch(o.tur){
    case 'konum':
      if(x.deger!==undefined) return x.deger==null?T.bos:yer(x.deger);
      if(x.degil) return cumle(T.yalanlar.degildi,{y:md(x.degil)});
      break;
    case 'gorulen': {
      const l=x.deger; if(!Array.isArray(l)) break;
      if(!l.length) return T.kimse;
      return l.map(e=>{
        if(e.ses) return sesAdi(e.ses);
        let s=e.kisi?ad(e.kisi):'?';
        if(e.kesinlik==='siluet') s=e.kisi?`${ad(e.kisi)} (${T.izler.siluet}${e.ortu?', '+ortu(e.ortu):''})`:`${T.izler.siluet}${e.ortu?' ('+ortu(e.ortu)+')':''}`;
        if(e.isimsiz) s+=' · '+T.yalanlar.isimsiz;
        if(e.abarti?.tahmin) s+=` → «${ad(e.abarti.tahmin)}»`;
        else if(e.abarti) s+=' +';
        if(e.mekan) s+=` @${T.mekanKisa[e.mekan]??e.mekan}`;
        return s;
      }).join(', ');
    }
    case 'fail': if('deger' in x) return x.deger?ad(x.deger):T.kimse; break;
    case 'esya':
      if('deger' in x) return x.deger?ad(x.deger):T.kimse;
      if(x.adaylar) return liste(x.adaylar.map(ad));
      break;
    case 'fark': {
      const l=x.deger??x; if(!Array.isArray(l)) break;
      if(!l.length) return T.kimse;
      return l.map(k=>{const i=izBul(B,k.iz); return i&&i.tur==='dolayli'?dolayliCumle(i):`${T.izAlt[k.alt]??k.alt}: ${ad(k.kisi)}`;}).join(' ');
    }
  }
  return ham(JSON.stringify(x));
}

const TAVIR_SINIF={dogru:'t-dogru',yalan:'t-yalan',susar:'t-susar',abarti:'t-abarti',bilmez:'t-bilmez',olu:'t-olu'};
function kare(f,s){
  if(!f) return '<i class="k t-yok"></i>';
  if(f.hata) return `<i class="k t-ham" title="${esc(f.hata)}"></i>`;
  let c=TAVIR_SINIF[f.tavir]??'t-ham';
  if(f.tavir==='dogru'&&s==='gorulen'&&Array.isArray(f.bilgi?.deger)&&!f.bilgi.deger.length) c='t-bilmez';
  if(f.tavir==='dogru'&&!f.bilgi) c='t-bilmez';
  return `<i class="k ${c}" title="${esc(T.yalanlar.sorular[SORULAR.indexOf(s)]+': '+(T.tavir[f.tavir]??f.tavir))}"></i>`;
}

export function ifadeSatiri(B,f,{konusanGoster=true}={}){
  const masum=!B.katilMi(f.konusan);
  const vurgu=masum&&(f.tavir==='yalan'||f.tavir==='susar');
  const soy=f.tavir==='susar'?`<i>${esc(T.tavir.susar)}</i>`:esc(degerYaz(B,f.olgu,f.soylenen));
  return `<li class="ifade${vurgu?' masum-yalan':''}">${konusanGoster?kisiBag(f.konusan)+', ':''}<span class="soluk">${esc(f.cinayet?f.cinayet+' · ':'')}</span>${esc(soruMetin(B,f.olgu,f.konusan))}:
    <b class="tv ${TAVIR_SINIF[f.tavir]??'t-ham'}">${etiket(T.tavir,f.tavir)}</b>
    — ${esc(T.yalanlar.soyler)} ${soy}; ${esc(T.yalanlar.gercek)} ${esc(degerYaz(B,f.olgu,f.bilgi))}
    ${f.kural?`<span class="soluk">(${esc(T.yalanlar.neden)} ${etiket(T.kural,f.kural)})</span>`:''}
    <span class="soluk">· ${esc(cumle(T.yalanlar.gerginlik,{g:String(f.gerginlik??T.bos)}))}</span></li>`;
}

export function yalanlarCiz(B,kok,durum){
  const v=B.vaka, M=B.ifadeler.M;
  const kisiler=siraliKisiler(B,durum.sira??'rol');
  const cin=v.cinayetler||[];
  let tablo=`<thead><tr><th class="yapis"></th>${cin.map(c=>`<th title="${esc(`${ad(c.katil)} → ${ad(c.kurban)}`)}"><span class="cid">${esc(c.id)}</span><small>${esc(ad(c.katil))}<br>→ ${esc(ad(c.kurban))}</small></th>`).join('')}</tr></thead><tbody>`;
  for(const k of kisiler){
    const rs=B.rolSinif(k);
    tablo+=`<tr class="r-${rs}"><th class="yapis">${kisiBag(k)}<span class="rol-nokta r-${rs}"></span></th>`;
    for(const c of cin){
      const h=M[k]?.[c.id];
      if(!h){tablo+=`<td class="ym-bos" title="${esc(T.rol.kurban)}">✕</td>`; continue;}
      const kareler=SORULAR.map(s=>kare(s==='esya'?enIlginc(h.esya):h[s],s)).join('');
      const kendi=c.katil===k?' ym-katil':c.yardimci===k?' ym-katil':'';
      tablo+=`<td class="ym${kendi}" data-k="${esc(k)}" data-c="${esc(c.id)}" tabindex="0">${kareler}</td>`;
    }
    tablo+='</tr>';
  }
  tablo+='</tbody>';
  const lej=Object.entries(TAVIR_SINIF).map(([t,c])=>`<span class="lej"><i class="k ${c}"></i>${esc(T.tavir[t])}</span>`).join('');
  const hepsi=B.ifadeler.hepsi;
  const masumlar=hepsi.filter(f=>!B.katilMi(f.konusan)&&(f.tavir==='yalan'||f.tavir==='susar'));
  const katiller=hepsi.filter(f=>B.katilMi(f.konusan));
  kok.innerHTML=`<p class="aciklama">${esc(T.yalanlar.aciklama)}</p>
    <div class="lej-satir">${lej}<span class="lej soluk">${T.yalanlar.sorular.map((s,i)=>`${i+1}. ${esc(s)}`).join(' · ')}</span></div>
    <div class="kaydir"><table class="ym-tablo">${tablo}</table></div>
    <div class="ym-ayrinti kart"><p class="soluk">${esc(T.yalanlar.sec)}</p></div>
    <h3>${esc(T.yalanlar.masumYalanci)} (${masumlar.length})</h3>
    ${masumlar.length?`<ul class="liste">${masumlar.map(f=>ifadeSatiri(B,f)).join('')}</ul>`:`<p class="soluk">${esc(T.yalanlar.masumYok)}</p>`}
    <h3>${esc(T.yalanlar.katilYalan)} (${katiller.length})</h3>
    <details><summary>${esc(T.yalanlar.katilYalan)}</summary><ul class="liste">${katiller.map(f=>ifadeSatiri(B,f)).join('')}</ul></details>
    <h3>${esc(T.yalanlar.hepsi)} (${hepsi.length})</h3>
    <details><summary>${esc(T.yalanlar.hepsi)}</summary><ul class="liste">${hepsi.map(f=>ifadeSatiri(B,f)).join('')}</ul></details>`;
  const ayr=kok.querySelector('.ym-ayrinti');
  const sec=td=>{
    kok.querySelectorAll('td.secili').forEach(x=>x.classList.remove('secili'));
    td.classList.add('secili');
    const k=td.dataset.k, c=td.dataset.c, h=M[k]?.[c];
    if(!h) return;
    const l=[...SORULAR.flatMap(s=>s==='esya'?h.esya:[h[s]])].filter(f=>f&&!f.hata&&!(f.tavir==='bilmez'));
    ayr.innerHTML=`<h4>${kisiBag(k)} · ${esc(c)} (${esc(an(B.cinById[c]?.zaman))})</h4><ul class="liste">${l.map(f=>ifadeSatiri(B,{...f,cinayet:null},{konusanGoster:false})).join('')||`<li class="soluk">${esc(T.tavir.bilmez)}</li>`}</ul>`;
  };
  kok.onclick=e=>{const td=e.target.closest('td.ym'); if(td) sec(td);};
  kok.onkeydown=e=>{if(e.key==='Enter'){const td=e.target.closest('td.ym'); if(td) sec(td);}};
}
