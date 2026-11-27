// İzler: cinayet başına fiziksel izler, tanıklar, dolaylı izler; yanıltıcılar ayrı renkte, masum açıklaması ve çürütme yoluyla.
import {parca,T,esc,etiket,etiketMetin,ad,kd,md,yer,ortu,esya,izAdi,sesAdi,cumle,an,anSaat,kisiBag,kisiBaglar,liste,ham,sirMetni,dilimAdi} from './metin.js';

export function fizikselSatir(B,i){
  const p=[`<b>${esc(izAdi(i))}</b> <span class="soluk">(${etiket(T.izAlt,i.alt)}${i.anahtar?`, <code>${esc(i.anahtar)}</code>`:''})</span>`];
  if(i.alt==='yara'){
    if(i.esya) p.push(esc(esyaSahip(i)));
  }else{
    if(i.sahip) p.push(esc(parca(T.izler.sahibi,{kim:ad(i.sahip)})));
    else if(i.mekanAleti) p.push(esc(T.izler.sahipsiz)+' ('+esc(yer(i.mekanAleti))+')');
    if(i.gercek?.neden) p.push(esc(parca(T.izler.birakilma,{neden:etiketMetin(T.izNeden,i.gercek.neden),an:an(i.zaman)})));
    if(i.gercek?.gosterdigiDilim!=null) p.push(esc(parca(T.izler.durmusSaat,{dilim:dilimAdi(i.gercek.gosterdigiDilim)})));
    const ad_=(i.adaylar||[]);
    if(ad_.length>1) p.push(`${esc(T.izler.adaylarBaslik)} ${kisiBaglar(ad_)}`);
    else if(ad_.length===1&&i.alt!=='kurban-esyasi') p.push(`<span class="rozet">${esc(T.izler.tekAday)}</span>`);
  }
  return p.join(' · ');
}
const esyaSahip=i=>i.sahip?`${esya(i.sahip,i.esya)} (${ad(i.sahip)})`:esya(null,i.esya);

export function tanikCumle(i,B){
  const d={tanik:kd(i.tanik),nereden:i.nereden&&i.nereden===B?.vaka?.kisiler?.[i.tanik]?.ev&&B?.koy?.mekanlar?.[i.nereden]?.tur==='ev'?{metin:'evi',ozelAd:false,iyelikli:true}:md(i.nereden),gorulen:kd(i.gorulen),ortu:ortu(i.ortu),ses:sesAdi(i.anahtar)};
  if(i.alt==='ses') return cumle(T.izler.tanikSes,d);
  if(i.kesinlik==='yuz') return cumle(T.izler.tanikYuz,d);
  if(i.kesinlik==='siluet') return cumle(i.ortu?T.izler.tanikSiluet:T.izler.tanikSiluetBilinmez,d);
  return cumle(T.izler.tanikSiluetBilinmez,d)+' '+ham(i.kesinlik);
}

export function dolayliCumle(i){
  const kal=T.dolayli[i.alt]??T.dolayli.genel;
  const s=cumle(kal,{fark_eden:kd(i.fark_eden),kisi:kd(i.kisi),an:an(i.zaman),yer:md(i.mekan),esya:esya(i.kisi,i.esya)});
  return T.dolayli[i.alt]?s:s+' '+ham(i.alt);
}

function izLi(B,i,ic){
  const s=['iz'];
  if(i.yaniltici) s.push('yaniltici');
  const etk=[i.yaniltici?`<span class="rozet kirmizi">${esc(T.izler.yaniltici)}</span>`:'',i.gercek?.tamamlama?`<span class="rozet">${esc(T.izler.tamamlama)}</span>`:''].join('');
  return `<li class="${s.join(' ')}" id="iz-${esc(i.id)}"><span class="iz-id">${esc(i.id)}</span> ${ic} ${etk}</li>`;
}

function olayMetin(B,o){
  if(!o) return T.bos;
  const kim=liste((o.kisiler||[]).map(ad));
  let ek='';
  if(o.esya) ek=` · ${esya(o.sahip,o.esya)}${o.sahip?' ('+ad(o.sahip)+')':''}`;
  if(o.sir) ek+=` · «${sirMetni(o.sir.sahip,o.sir.sir)}»`;
  if(o.nereden) ek+=` · ${yer(o.nereden)} →`;
  return `${etiketMetin(T.olayTur,o.tur)}: ${kim}, ${anSaat(o.zaman)}, ${yer(o.mekan)}${ek}`;
}

function olguMetin(B,o){
  if(!o) return T.bos;
  const c=o.cinayet??'';
  switch(o.tur){
    case 'konum': return cumle(T.yalanlar.soru.konum,{kisi:kd(o.kisi),an:an(o.zaman)});
    case 'gorulen': return cumle(T.yalanlar.soru.gorulen,{an:an(o.zaman)});
    case 'fail': return cumle(T.yalanlar.soru.fail,{c});
    case 'esya': return cumle(T.yalanlar.soru.esya,{iz:B.izById[o.iz]?izAdi(B.izById[o.iz]):o.iz});
    case 'fark': return cumle(T.yalanlar.soru.fark,{c});
    default: return ham(JSON.stringify(o));
  }
}
export {olguMetin};

function curutmeMotor(B,c){
  switch(c.tur){
    case 'konum': return cumle(T.curutmeYol.konum,{kisi:kd(c.kisi),an:an(c.zaman)});
    case 'iz': { const i=B.izById[c.iz]; return cumle(T.curutmeYol.iz,{iz:c.iz})+(i?` (${i.tur==='dolayli'?dolayliCumle(i):izAdi(i)})`:''); }
    case 'ifade': return cumle(T.curutmeYol.ifade,{kisi:kd(c.kisi)})+(c.olgu?`: ${olguMetin(B,c.olgu)}`:'');
    case 'sir': return cumle(T.curutmeYol.sir,{sahip:kd(c.sahip)})+(c.sir?`: «${sirMetni(c.sahip,c.sir)}»`:'');
    default: return ham(JSON.stringify(c));
  }
}

function yanilticiKutu(B,y){
  const r=B.rapor?.yanilticilar?.find(x=>x.id===y.id);
  const cozucu=r?r.curutme.map(c=>`<li>${kisiBag(c.kisi)}: ${c.yol?c.yol.map(p=>`${etiket(T.cozucuYol,p.tur)}${p.kaynaklar?.length?` (${esc(liste(p.kaynaklar.map(ad)))})`:''}`).join('; '):`<b class="kirmizi">${esc(T.izler.curutulmedi)}</b>`}</li>`).join(''):`<li class="soluk">${esc(T.kalite.raporYok)}</li>`;
  return `<div class="yaniltici-kutu" id="y-${esc(y.id)}">
    <p><span class="iz-id">${esc(y.id)}</span> <b>${etiket(T.aciklama,y.aciklama)}</b>
      ${r?`<span class="rozet ${r.curutuldu?'':'kirmizi'}">${esc(r.curutuldu?T.izler.curutuldu:T.izler.curutulmedi)}</span>`:''}</p>
    <p><span class="etiket">${esc(T.izler.isaretBaslik)}</span> ${kisiBaglar(y.isaret||[])} · <span class="soluk">${esc((y.izler||[]).join(', '))}</span></p>
    <p><span class="etiket">${esc(T.izler.masumAciklama)}</span> ${esc(olayMetin(B,B.olayById[y.olay]))}</p>
    <p><span class="etiket">${esc(T.izler.curutme)}</span></p><ul class="liste sik">${(y.curutme||[]).map(c=>`<li>${esc(curutmeMotor(B,c))}</li>`).join('')||`<li>${esc(T.bos)}</li>`}</ul>
    <p><span class="etiket">${esc(T.izler.cozucuCurutme)}</span></p><ul class="liste sik">${cozucu}</ul>
  </div>`;
}

export function izlerCiz(B,kok){
  const v=B.vaka;
  const h=[`<p class="aciklama">${esc(T.izler.aciklama)}</p>`];
  for(const c of v.cinayetler||[]){
    const izler=(c.izler||[]).map(id=>B.izById[id]??{id,tur:'?',alt:'?'});
    const fiz=izler.filter(i=>i.tur==='fiziksel'), tan=izler.filter(i=>i.tur==='tanik'), dol=izler.filter(i=>i.tur==='dolayli');
    const diger=izler.filter(i=>!['fiziksel','tanik','dolayli'].includes(i.tur));
    const yan=(v.yanilticilar||[]).filter(y=>y.cinayet===c.id);
    const tanLi=i=>izLi(B,i,`${esc(tanikCumle(i,B))} <span class="soluk">(${etiket(T.izAlt,i.alt)})</span>`);
    h.push(`<section class="kart iz-kart" id="izler-${esc(c.id)}"><header><h3><span class="cid">${esc(c.id)}</span> ${kisiBag(c.katil)} → ${kisiBag(c.kurban)}</h3><span class="soluk">${esc(anSaat(c.zaman))} · ${esc(yer(c.mekan))}</span></header>
      <h4>${esc(T.izler.fiziksel)}</h4><ul class="liste">${fiz.map(i=>izLi(B,i,fizikselSatir(B,i))).join('')||`<li class="soluk">${esc(T.izler.yok)}</li>`}</ul>
      <h4>${esc(T.izler.tanik)}</h4><ul class="liste">${tan.map(tanLi).join('')||`<li class="soluk">${esc(T.izler.yok)}</li>`}</ul>
      <h4>${esc(T.izler.dolayli)}</h4><ul class="liste">${dol.map(i=>izLi(B,i,`${esc(dolayliCumle(i))} <span class="soluk">(${etiket(T.izNeden,i.gercek?.neden)})</span>`)).join('')||`<li class="soluk">${esc(T.izler.yok)}</li>`}</ul>
      ${diger.length?`<ul class="liste">${diger.map(i=>`<li><code class="ham">${esc(JSON.stringify(i))}</code></li>`).join('')}</ul>`:''}
      ${yan.length?`<h4>${esc(T.izler.yanilticilar)}</h4>${yan.map(y=>yanilticiKutu(B,y)).join('')}`:''}
    </section>`);
  }
  kok.innerHTML=h.join('');
}
