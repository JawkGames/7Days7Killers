// Modelin cümlesini oyuna koymadan önce denetler. Geçmezse oyun kalıp cümleyi kullanır.
// Asıl güvence: model, anlamda (kalıp cümlede) ve soruda geçmeyen hiçbir kişi, yer, eşya, zaman sözü ya da suçlama
// söyleyemez; anlamdaki kişi ve yer adlarını da atlayamaz. Böylece bir masumu suçlayamaz, katili ele veremez,
// olmayan bir olay uyduramaz, oyuncunun ipucunu yutamaz.

import {DIL_TR} from '../diyalog/adlar.js';

const HARF='a-zçğıöşü';
// Küçük harf, tek tür kesme işareti, şapkasız (Kâzım = Kazım, dükkân = dukkan).
export const kucuk=s=>s.toLocaleLowerCase('tr').replace(/[’'`´]/g,"'").replace(/â/g,'a').replace(/î/g,'i').replace(/û/g,'u');

// Türkçe ek zinciri: bir adın arkasına gelebilecek çekim ekleri (en çok 5 parça). Kelimenin kendisi tam aranır;
// böylece "Halil" "halini" içinde, "Ağa" "ağaç" içinde bulunmaz.
const V='[aeıioöuü]';
const EKLER=[
  'l[ae]r', `n?[dt][ae]n?`, `[nys]?${V}n?`, `y?l[ae]`, '[cç][ae]', 'ki', `y?[dt]${V}[mnkz]?`, `y?${V}[mz]`,
  `s${V}n`, `m${V}[sş]`, `[dt]${V}r`, 'y?ken', `n${V}z`, `m${V}z`,
].join('|');
const EK_ZINCIRI=`(?:'?(?:${EKLER}){0,5})`;

// Kelime sonu ünsüz yumuşaması (konak → konağı, mezarlık → mezarlığa, kitap → kitabı).
const YUMUSAK={k:'[kğg]',p:'[pb]',t:'[td]','ç':'[çc]'};
const kelimeDeseni=k=>{
  const kacis=k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const son=k.slice(-1);
  return YUMUSAK[son]&&k.length>2?kacis.slice(0,-1)+YUMUSAK[son]:kacis;
};

const desenOnbellek=new Map();
function adDeseni(ad){
  if(desenOnbellek.has(ad)) return desenOnbellek.get(ad);
  const kel=kucuk(ad).replace(/'[a-zçğıöşü]*/g,'').split(/\s+/).filter(Boolean);
  const d=kel.length?new RegExp(`(^|[^${HARF}])(${kel.map(k=>kelimeDeseni(k)+EK_ZINCIRI).join('\\s+')})(?![${HARF}])`,'gu'):null;
  desenOnbellek.set(ad,d);
  return d;
}

// Bir adın metinde geçip geçmediği: ek almış hâlini de yakalar ("Kör Halil'in", "değirmende", "Hacı Ağa'ya").
export function adGeciyor(metin,ad){
  const d=adDeseni(ad);
  if(!d) return false;
  d.lastIndex=0;
  return d.test(kucuk(metin));
}

// Denetlenecek adlar: köydeki herkesin lakabı, tam adı ve ilk adı; mekân adları ve kısa söylenişleri; eşya adları.
// {tur, id, ad}. Aynı kişinin ya da mekânın birden çok söylenişi aynı kimliği taşır.
export function adListesi(dil=DIL_TR){
  const l=[], ekle=(tur,id,ad)=>{if(ad&&!l.some(x=>x.tur===tur&&x.id===id&&kucuk(x.ad)===kucuk(ad))) l.push({tur,id,ad});};
  for(const [id,t] of Object.entries(dil.kisiler)){
    ekle('kisi',id,t.lakap);
    if(t.ad){ ekle('kisi',id,t.ad); ekle('kisi',id,t.ad.split(/\s+/)[0]); }
    for(const [e,a] of Object.entries(t.esyalar||{})) ekle('esya',e,a.replace(/^(boynunda|kuşağında|kulağının arkasında)\s+/,''));
  }
  for(const [id,a] of Object.entries(dil.terimler.mekan||{})) ekle('mekan',id,a);
  for(const [id,l2] of Object.entries(dil.oyun?.yz?.mekanKok||{})) for(const a of l2) ekle('mekan',id,a);
  return l;
}

// Metinde geçen adlar ("tur:id" kümesi). Uzun ad önce aranır ve bulunan yer silinir: "Muhtarın Kızı" içinde
// ayrıca "Muhtar", "Kör Halil'in evi" içinde ayrıca "Kör Halil" bulunmaz.
export function adlariBul(metin,adlar){
  let m=kucuk(metin);
  const bulunan=new Set();
  const sirali=[...adlar].sort((a,b)=>b.ad.length-a.ad.length);
  for(const a of sirali){
    const d=adDeseni(a.ad);
    if(!d) continue;
    d.lastIndex=0;
    if(!d.test(m)) continue;
    bulunan.add(a.tur+':'+a.id);
    d.lastIndex=0;
    m=m.replace(d,(x,on,govde)=>on+' '.repeat(govde.length));
  }
  return bulunan;
}

const YASAK=[/yapay\s*zek/i,/\bmodel\b/i,/talimat/i,/\bjson\b/i,/[{}<>]/,/\bAI\b/,/\bprompt/i,/\bkural/i,/oyuncu/i,/\bsistem\b/i];

/**
 * @param {{cevap:string, kalip:string, soru?:?string, kisi:string, dil?:Object, adlar?:Array, kalipAdlari?:boolean}} g
 *   kalip: söylenecek anlam ('' ise hiçbir ad, zaman ve suçlama söylenemez: kaçamak cevap).
 *   soru: müfettişin (motorun) sorusu; adları ve zaman sözleri serbesttir ama atlanması denetlenmez.
 * @returns {{tamam:boolean, neden?:string}}
 */
export function cevapDenetle({cevap,kalip,soru=null,kisi,dil=DIL_TR,adlar=null}){
  if(typeof cevap!=='string') return {tamam:false,neden:'cevap yok'};
  const c=cevap.trim();
  if(c.length<2) return {tamam:false,neden:'boş'};
  if(c.length>320) return {tamam:false,neden:'çok uzun'};
  for(const y of YASAK) if(y.test(c)) return {tamam:false,neden:'yasak ifade: '+y.source};
  if(/[a-z]{3,}/i.test(c)&&!/[çğıöşüâîİ]/i.test(c)&&c.split(/\s+/).length>6) return {tamam:false,neden:'Türkçe görünmüyor'};
  const A=adlar||adListesi(dil);
  const kaynak=`${kalip||''} ${soru||''}`;
  const kendi='kisi:'+kisi;
  const cevapta=adlariBul(c,A), kaynakta=adlariBul(kaynak,A), kalipta=adlariBul(kalip||'',A);
  for(const a of cevapta){
    if(a===kendi) continue; // kendi adını anabilir
    if(!kaynakta.has(a)) return {tamam:false,neden:`anlamda olmayan ${a.split(':')[0]}: ${A.find(x=>x.tur+':'+x.id===a)?.ad}`};
  }
  // Anlamdaki kişi ve yer adları atlanamaz (oyuncunun ipucu kaybolmasın). Eşya adı başka sözle anılabilir.
  for(const a of kalipta){
    if(a===kendi||a.startsWith('esya:')) continue;
    if(!cevapta.has(a)) return {tamam:false,neden:`anlamdaki ad düşmüş: ${A.find(x=>x.tur+':'+x.id===a)?.ad}`};
  }
  // Rakam (saat, sayı) ancak kaynakta varsa.
  for(const s of c.match(/\d+/g)||[]) if(!kaynak.includes(s)) return {tamam:false,neden:'anlamda olmayan sayı: '+s};
  const Y=dil.oyun?.yz||{};
  for(const z of Y.zamanSozleri||[]) if(adGeciyor(c,z)&&!adGeciyor(kaynak,z)) return {tamam:false,neden:'anlamda olmayan zaman: '+z};
  const kc=kucuk(c), kk=kucuk(kaynak);
  for(const k of Y.suclama||[]) if(kc.includes(kucuk(k))&&!kk.includes(kucuk(k))) return {tamam:false,neden:'anlamda olmayan suçlama: '+k};
  return {tamam:true};
}
