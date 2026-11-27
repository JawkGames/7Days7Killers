// Özet: yedi cinayet kartı, katiller arası bağlar, oyuncu tedbirleri. Ayrıca panoya kopyalanan kısa özet metni.
import {mekanDeger} from '/src/diyalog/adlar.js';
import {T,trTerimler,esc,etiket,etiketMetin,ad,kd,md,yer,esya,sirMetni,cumle,an,anSaat,kisiBag,ham} from './metin.js';

export function kaynakCumle(kaynak,katil,kurban){
  if(!kaynak) return '';
  const K=kd(katil), U=kd(kurban);
  switch(kaynak.tur){
    case 'sir': return cumle(T.kaynak.sir,{sahip:kd(kaynak.sahip),sir:sirMetni(kaynak.sahip,kaynak.sir)});
    case 'iliski': {
      const kal=T.iliskiKaynak[kaynak.iliski]??T.iliskiKaynak.genel;
      return cumle(kal,{katil:K,kurban:U,etiket:trTerimler.iliski[kaynak.iliski]??ham(kaynak.iliski)});
    }
    case 'rekabet': return cumle(T.kaynak.rekabet,{uzerine:kd(kaynak.uzerine)});
    case 'koruma': {
      let s=cumle(T.kaynak.koruma,{katil:K,korunan:kd(kaynak.korunan)});
      if(kaynak.iliski){
        const kal=T.korumaKaynak[kaynak.iliski]??T.korumaKaynak.genel;
        s+=' '+cumle(kal,{korunan:kd(kaynak.korunan),kurban:U,etiket:trTerimler.iliski[kaynak.iliski]??ham(kaynak.iliski)});
      }
      if(kaynak.sir) s+=' '+cumle(T.kaynak.korumaSir,{kurban:U,sahip:kd(kaynak.sir.sahip),sir:sirMetni(kaynak.sir.sahip,kaynak.sir.sir)});
      return s;
    }
    case 'santaj': return cumle(T.kaynak.santaj,{zorlayan:kd(kaynak.zorlayan),katil:K,sir:sirMetni(kaynak.sahip,kaynak.sir)});
    default: return ham(JSON.stringify(kaynak));
  }
}

export function silahCumle(c){
  const s=c.silah;
  if(!s) return c.yontem==='zehir'?'':T.ozet.silahYok;
  let ne;
  if(s.mekanAleti) ne=cumle(T.ozet.silahYerin,{yer:md(s.mekanAleti),esya:esya(null,s.esya)})+(s.getirildi?', '+T.ozet.silahGetirildi:'');
  else if(s.calinti) ne=cumle(T.ozet.silahCalinti,{sahip:kd(s.sahip),esya:esya(s.sahip,s.esya)});
  else if(s.sahip) ne=cumle(T.ozet.silahKendi,{sahip:kd(s.sahip),esya:esya(s.sahip,s.esya)});
  else ne=esya(null,s.esya);
  ne+=', '+(s.birakildi?T.ozet.silahKaldi:T.ozet.silahGitti);
  return cumle(T.ozet.silah,{silah:ne});
}

// Mekân değeri: kurbanın kendi eviyse "evinde", konuşanın kendi eviyse "evdeydim".
const yerD=(m,{konusan,konu}={},v,B)=>{if(B?.koy?.mekanlar?.[m]?.tur!=='ev') return md(m); try{return mekanDeger(m,{konusanEv:v?.kisiler?.[konusan]?.ev,konuEv:v?.kisiler?.[konu]?.ev});}catch{return md(m);}};
export function cinayetCumle(c,v,B){
  const y=T.yontem[c.yontem], yr=yerD(c.mekan,{konu:c.kurban},v,B);
  return y?cumle(T.ozet.cinayetCumlesi,{katil:kd(c.katil),kurban:kd(c.kurban),yer:yr,yontem:y})
    :cumle(T.ozet.cinayetCumlesiYontemsiz,{katil:kd(c.katil),kurban:kd(c.kurban),yer:yr})+' ('+ham(c.yontem)+')';
}

function bulunmaCumle(c){
  const b=c.bulunma; if(!b) return '';
  return cumle(T.ozet.bulan[b.neden]??T.ozet.bulan.genel,{bulan:kd(b.bulan),an:an(b.zaman)});
}

export function bagCumle(b){
  switch(b.tur){
    case 'ortaklik': return cumle(T.bag.ortaklik,{yardimci:kd(b.yardimci),katil:kd(b.katil)});
    case 'ortme': return cumle(T.bag.ortmeYersiz,{ortan:kd(b.ortan),ortulen:kd(b.ortulen)});
    case 'santaj': return cumle(T.bag.santaj,{zorlayan:kd(b.zorlayan),zorlanan:kd(b.zorlanan),sir:b.sir?sirMetni(b.sir.sahip,b.sir.sir):T.bos});
    default: return ham(JSON.stringify(b));
  }
}

function kart(c,v,B){
  const p=[];
  const sebep=c.sebep||{};
  p.push(`<p class="buyuk">${kisiBag(c.katil)} <span class="ok">→</span> ${kisiBag(c.kurban)}</p>`);
  p.push(`<p class="cumle">${esc(cinayetCumle(c,v,B))} ${c.cagrildi?esc(T.ozet.cagrildi):''}</p>`);
  const sil=silahCumle(c);
  let zehir='';
  if(c.zehirKaynagi) zehir=cumle(T.ozet.zehirKaynagi,{kisi:kd(c.zehirKaynagi.kisi),esya:esya(c.zehirKaynagi.kisi,c.zehirKaynagi.esya)});
  if(sil||zehir) p.push(`<p><span class="etiket">${esc(T.ozet.yontemSilah)}</span> ${esc(sil)} ${esc(zehir)}</p>`);
  p.push(`<p><span class="etiket">${esc(T.ozet.sebep)}</span> <b>${etiket(T.sebep,sebep.tur)}</b>. ${esc(kaynakCumle(sebep.kaynak,c.katil,c.kurban))}</p>`);
  if(sebep.asil) p.push(`<p class="girinti"><span class="etiket">${esc(cumle(T.ozet.asilSebep,{kim:ad(c.zorlayan)}))}</span> ${etiket(T.sebep,sebep.asil.tur)}. ${esc(kaynakCumle(sebep.asil.kaynak,c.zorlayan,c.kurban))}</p>`);
  for(const e of sebep.ek||[]) p.push(`<p class="girinti soluk">${esc(T.ozet.ek)}: ${etiket(T.sebep,e.tur)}. ${esc(kaynakCumle(e.kaynak,c.katil,c.kurban))}</p>`);
  const bag=[];
  if(c.yardimci) bag.push(cumle(T.ozet.yardimciCumlesi,{kim:kd(c.yardimci)}));
  if(c.zorlayan) bag.push(cumle(T.ozet.zorlayanCumlesi,{kim:kd(c.zorlayan)}));
  if(bag.length) p.push(`<p><span class="etiket">${esc(T.ozet.baglar)}</span> ${esc(bag.join(' '))}</p>`);
  const maz=Object.entries(c.iddialar||{}).map(([k,m])=>cumle(T.ozet.mazeretCumlesi,{kim:kd(k),yer:yerD(m,{konusan:k},v,B)})+(c.ortan&&k===c.katil?' '+cumle(T.ozet.ortanDogrular,{ortan:kd(c.ortan)}):''));
  if(maz.length) p.push(`<p><span class="etiket">${esc(T.ozet.mazeret)}</span> ${esc(maz.join(' '))}</p>`);
  if(c.kacanTanik) p.push(`<p><span class="etiket">${esc(T.ozet.kacanTanik)}</span> ${esc(cumle(T.ozet.kacanCumlesi,{kim:kd(c.kacanTanik.kisi),nereden:md(c.kacanTanik.nereden)}))}</p>`);
  const goz=(c.gozTaniklari||[]).filter(k=>k!==c.katil&&k!==c.yardimci&&k!==c.kurban&&k!==c.kacanTanik?.kisi);
  if(goz.length) p.push(`<p><span class="etiket">${esc(T.ozet.gozTaniklari)}</span> ${goz.map(k=>kisiBag(k)).join(', ')}</p>`);
  p.push(`<p><span class="etiket">${esc(T.ozet.bulunma)}</span> ${esc(bulunmaCumle(c))}</p>`);
  const ust=`<span class="cid">${esc(c.id)}</span> ${esc(anSaat(c.zaman))} · ${esc(yer(c.mekan))}`;
  const alt=[cumle(T.ozet.fotograf,{n:c.fotografGunu}),T.yontemAd[c.yontem]??ham(c.yontem),c.cekirdek?cumle(T.ozet.cekirdek,{id:c.cekirdek}):null].filter(Boolean).join(' · ');
  return `<article class="kart cinayet-kart" id="kart-${esc(c.id)}"><header><h3>${ust}</h3><span class="soluk">${esc(alt)}</span></header>${p.join('')}</article>`;
}

export function ozetCiz(B,kok){
  const v=B.vaka;
  const h=[];
  const katiller=(v.katiller||[]);
  h.push(`<div class="satirlar"><p><span class="etiket">${esc(T.ozet.katiller)}</span> ${katiller.map(k=>kisiBag(k.kisi)+(k.engellendi?` <span class="rozet">${esc(T.rol.engellendi)}</span>`:'')+(k.yardimEttigi?` <span class="soluk">(${esc(T.rol.yardimci)} ${esc(k.yardimEttigi)})</span>`:'')).join(', ')}</p>`);
  h.push(`<p><span class="etiket">${esc(T.ozet.kurbanlar)}</span> ${(v.cinayetler||[]).map(c=>kisiBag(c.kurban)).join(', ')}</p></div>`);
  h.push(`<div class="kartlar">${(v.cinayetler||[]).map(c=>{try{return kart(c,v,B);}catch(e){console.warn(e); return `<article class="kart hata">${esc(c.id)}: ${esc(e.message)}</article>`;}}).join('')}</div>`);
  h.push(`<h3>${esc(T.ozet.baglar)}</h3>`);
  h.push((v.baglar||[]).length?`<ul class="liste">${v.baglar.map(b=>`<li><span class="rozet">${etiket(T.bagAd,b.tur)}</span> ${esc(bagCumle(b))} <span class="soluk">(${esc(b.cinayet??T.bos)})</span></li>`).join('')}</ul>`:`<p class="soluk">${esc(T.ozet.bagYok)}</p>`);
  if(v.mudahaleler?.length||v.engellenen?.length){
    h.push(`<h3>${esc(T.ozet.mudahaleler)}</h3><ul class="liste">${(v.mudahaleler||[]).map(m=>`<li><code class="ham">${esc(JSON.stringify(m))}</code></li>`).join('')}</ul>`);
    if(v.engellenen?.length) h.push(`<p><span class="etiket">${esc(T.ozet.engellenen)}</span> ${v.engellenen.map(e=>`${kisiBag(e.katil)} → ${kisiBag(e.kurban)}`).join('; ')}</p>`);
  }
  kok.innerHTML=h.join('');
}

// Panoya: tohum + kısa özet.
export function kopyaMetni(B){
  const v=B.vaka, q=v.kalite||{};
  const durum=q.gecti?T.kalite.gecti:`${T.kalite.gecemedi} (${(q.nedenler||[]).map(n=>etiketMetin(T.kalite.nedenler,typeof n==='string'?n:n.tur)).join(', ')})`;
  const s=[cumle(T.kopya.baslik,{tohum:String(v.tohum),deneme:String((v.deneme??0)+1)}),
    cumle(T.kopya.kalite,{durum,sorgu:String(q.zorluk?.sorgu??T.bos),adim:String(q.zorluk?.adim??T.bos),celiski:String(q.celiski??T.bos)})];
  for(const c of v.cinayetler||[]){
    const ek=[c.yardimci?`+${ad(c.yardimci)}`:null,c.ortan?`örten ${ad(c.ortan)}`:null,c.zorlayan?`zorlayan ${ad(c.zorlayan)}`:null].filter(Boolean);
    s.push(yerTut(T.kopya.cinayet,{c:c.id,an:an(c.zaman),yer:yer(c.mekan),katil:ad(c.katil),kurban:ad(c.kurban),yontem:etiketMetin(T.yontemAd,c.yontem),sebep:etiketMetin(T.sebep,c.sebep?.tur),ek:ek.length?' ['+ek.join(', ')+']':''}));
  }
  if(v.baglar?.length) s.push(yerTut(T.kopya.bag,{l:v.baglar.map(b=>`${etiketMetin(T.bagAd,b.tur)} ${b.cinayet??''}`).join(', ')}));
  s.push(yerTut(T.kopya.adres,{url:location.href}));
  return s.join('\n');
}
// Ek getirmeyen düz yer tutucu doldurma (cümle başını büyütmez: "c1 …" küçük kalır).
const yerTut=(k,d)=>k.replace(/\{(\w+)\}/g,(t,a)=>d[a]??t);
