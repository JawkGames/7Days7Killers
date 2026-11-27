// Kişi sayfası: bir kişinin bu vakadaki her şeyi (rolü, 7 günlük rotası, gördükleri, yalanları, sırları).
import {T,trKisiler,trTerimler,esc,etiket,ad,kd,yer,ortu,esya,sirMetni,cumle,an,kisiBag,kisiBaglar,dilimSayisi,dilimler,ham,parca} from './metin.js';
import {nedenSinif} from './veri.js';
import {hucre,nedenMetin} from './bolum-cizelge.js';
import {fizikselSatir,tanikCumle,dolayliCumle} from './bolum-izler.js';
import {ifadeSatiri} from './bolum-yalanlar.js';

export function kisiCiz(B,k){
  const v=B.vaka, K=v.kisiler[k], koyK=B.koy.kisiler[k]??{}, tr=trKisiler[k]??{};
  if(!K) return `<p class="hata">${esc(ham(k))}</p>`;
  const R=B.roller[k]??{katil:[],yardimci:[],ortan:[],zorlayan:[],tanik:[],bulan:[],kacan:[],isaret:[]};
  const h=[];
  h.push(`<header class="kisi-bas"><h2>${esc(ad(k))} <span class="soluk">${esc(tr.ad??'')}</span></h2>
    <p>${esc(cumle(T.kisi.meslek,{yas:String(K.yas??'?'),meslek:trTerimler.meslek[koyK.meslek]??koyK.meslek??T.bos,mizac:trTerimler.mizac[K.mizac]??K.mizac??T.bos}))} · ${esc(T.cinsiyet[K.cinsiyet]??K.cinsiyet??'')}</p>
    <p class="soluk">${esc(tr.tanim??'')}</p>
    <p class="soluk">${esc(cumle(T.kisi.ev,{ev:yer(K.ev)}))}${K.is?' · '+esc(cumle(T.kisi.is,{is:yer(K.is)})):''} · ${esc(cumle(T.kisi.ortu,{ortu:ortu(K.ortu)}))} · ${esc(cumle(T.kisi.esyalar,{l:(K.esyalar||[]).map(e=>esya(k,e)).join(', ')||T.bos}))}</p></header>`);
  // Rol
  const rol=[];
  for(const c of R.katil){const x=B.cinById[c]; rol.push(parca(T.kisi.katil,{c,kurban:kd(x?.kurban)}));}
  if(R.kurban){const x=B.cinById[R.kurban]; rol.push(parca(T.kisi.kurban,{c:R.kurban,katil:kd(x?.katil)})); rol.push(cumle(T.kisi.oldu,{an:an(K.olum??x?.zaman),c:R.kurban}));}
  for(const c of R.yardimci) rol.push(parca(T.kisi.yardimci,{c,katil:kd(B.cinById[c]?.katil)}));
  for(const c of R.ortan) rol.push(parca(T.kisi.ortan,{c,katil:kd(B.cinById[c]?.katil)}));
  for(const c of R.zorlayan) rol.push(parca(T.kisi.zorlayan,{c,katil:kd(B.cinById[c]?.katil)}));
  if(R.engellendi) rol.push(T.rol.engellendi);
  for(const x of R.tanik) rol.push(parca(T.kisi.tanik,{c:x.c,alt:T.izAlt[x.alt]??x.alt}));
  for(const c of R.kacan) rol.push(parca(T.kisi.kacan,{c}));
  for(const c of R.bulan) rol.push(parca(T.kisi.bulan,{c}));
  for(const c of R.isaret) rol.push(parca(T.kisi.isaret,{c}));
  const rs=B.rolSinif(k);
  h.push(`<h3>${esc(T.kisi.rolu)} <span class="rozet r-${rs}">${esc(T.rol[rs]??rs)}</span></h3><ul class="liste">${(rol.length?rol:[T.kisi.masum]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`);
  // Rota
  const D=dilimSayisi(), G=Math.ceil(B.T/D);
  let rota=`<thead><tr><th></th>${dilimler().map(d=>`<th>${esc(T.dilim[d]??d)}</th>`).join('')}</tr></thead><tbody>`;
  for(let g=0;g<G;g++){
    rota+=`<tr><th>${esc(cumle(T.gun,{n:g+1}))}</th>`;
    for(let j=0;j<D;j++) rota+=hucre(B,k,g*D+j);
    rota+='</tr>';
  }
  h.push(`<h3>${esc(T.kisi.rota)}</h3><div class="kaydir"><table class="cz rota">${rota}</tbody></table></div><p class="cz-ayrinti soluk"></p>`);
  // Gizli işler
  const gizli=[];
  for(let t=0;t<B.T;t++){const n=v.neden?.[k]?.[t]; const s=nedenSinif(n); if(s==='gizli'||s==='cinayet'||s==='tanik') gizli.push(`<li><b>${esc(an(t))}</b>, ${esc(yer(v.cizelge?.[k]?.[t]))}: ${esc(nedenMetin(B,k,n))}</li>`);}
  if(gizli.length) h.push(`<h3>${esc(T.kisi.gizliIsler)}</h3><ul class="liste">${gizli.join('')}</ul>`);
  // Gördükleri
  const gor=(v.izler||[]).filter(i=>(i.tur==='tanik'&&i.tanik===k)||(i.tur==='dolayli'&&i.fark_eden===k));
  if(gor.length) h.push(`<h3>${esc(T.kisi.gordukleri)}</h3><ul class="liste">${gor.map(i=>`<li class="${i.yaniltici?'yaniltici':''}"><span class="iz-id">${esc(i.cinayet)} ${esc(i.id)}</span> ${esc(i.tur==='tanik'?tanikCumle(i,B):dolayliCumle(i))}</li>`).join('')}</ul>`);
  // Onu gösteren izler
  const gos=(v.izler||[]).filter(i=>(i.tur==='fiziksel'&&i.alt!=='yara'&&(i.sahip===k||(i.adaylar||[]).includes(k)))||(i.tur==='tanik'&&i.gorulen===k)||(i.tur==='dolayli'&&i.kisi===k));
  if(gos.length) h.push(`<h3>${esc(T.kisi.izleri)}</h3><ul class="liste">${gos.map(i=>`<li class="${i.yaniltici?'yaniltici':''}"><span class="iz-id">${esc(i.cinayet)} ${esc(i.id)}</span> ${i.tur==='fiziksel'?fizikselSatir(B,i):esc(i.tur==='tanik'?tanikCumle(i,B):dolayliCumle(i))}</li>`).join('')}</ul>`);
  // Yalanları
  const yal=B.ifadeler.hepsi.filter(f=>f.konusan===k);
  h.push(`<h3>${esc(T.kisi.yalanlari)}</h3>${yal.length?`<ul class="liste">${yal.map(f=>ifadeSatiri(B,f,{konusanGoster:false})).join('')}</ul>`:`<p class="soluk">${esc(T.kisi.yalanYok)}</p>`}`);
  // Sırlar
  const sir=(v.sirlar||[]).filter(s=>s.sahip===k);
  const sirLi=s=>`<li>«${esc(sirMetni(s.sahip,s.id))}» <span class="soluk">(${etiket(trTerimler.sirTuru,s.tur)} · ${etiket(T.kisi.sirRol,s.rol)}${s.kimler?.length?' · '+esc(T.kisi.sirKimler)+' '+kisiBaglar(s.kimler):''})</span></li>`;
  h.push(`<h3>${esc(T.kisi.sirlar)}</h3><ul class="liste">${sir.map(sirLi).join('')||`<li class="soluk">${esc(T.bos)}</li>`}</ul>`);
  const icinde=(v.sirlar||[]).filter(s=>s.sahip!==k&&(s.kimler||[]).includes(k));
  if(icinde.length) h.push(`<h3>${esc(T.kisi.sirIcinde)}</h3><ul class="liste">${icinde.map(s=>`<li>${kisiBag(s.sahip)}: «${esc(sirMetni(s.sahip,s.id))}» <span class="soluk">(${etiket(T.kisi.sirRol,s.rol)})</span></li>`).join('')}</ul>`);
  // İlişkiler
  const il=(v.iliskiler||[]).filter(i=>i.kimden===k);
  h.push(`<h3>${esc(T.kisi.iliskiler)}</h3><ul class="liste sik">${il.map(i=>`<li>${kisiBag(i.kime)} — ${etiket(trTerimler.iliski,i.tur)}</li>`).join('')||`<li class="soluk">${esc(T.bos)}</li>`}</ul>`);
  return h.join('');
}
