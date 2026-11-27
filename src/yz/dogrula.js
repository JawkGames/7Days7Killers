// Modelin cümlesini oyuna koymadan önce denetler. Geçmezse oyun kalıp cümleyi kullanır.
// Asıl güvence: model, anlamda (kalıp cümlede) ve soruda geçmeyen hiçbir kişi, yer ya da eşya adını söyleyemez.
// Böylece bir masumu suçlayamaz, katili ele veremez, olmayan bir olay uyduramaz.

import {DIL_TR} from '../diyalog/adlar.js';

const kucuk=s=>s.toLocaleLowerCase('tr').replace(/[’'`]/g,"'");

// Bir adın metinde geçip geçmediği: ek almış hâlini de yakalar ("Kör Halil'in", "değirmende").
// Her kelimenin ilk 4 harfi (kısa kelimede tamamı) aranır; çok kelimeli adlarda bütün kelimeler yan yana olmalı.
function adGeciyor(metin,ad){
  const kel=kucuk(ad).replace(/'[a-zçğıöşü]*/g,'').split(/\s+/).filter(Boolean);
  if(!kel.length) return false;
  const kok=kel.map(k=>k.length<=4?k:k.slice(0,Math.max(4,k.length-2)));
  const desen=kok.map((k,i)=>(i===kok.length-1?k+"[a-zçğıöşü']*":k+"[a-zçğıöşü']*")).join("\\s+");
  return new RegExp(`(^|[^a-zçğıöşü])${desen}`,'u').test(kucuk(metin));
}

// Denetlenecek adlar: köydeki herkesin lakap ve adı, mekân adları, kişilerin eşya adları.
export function adListesi(dil=DIL_TR){
  const l=[];
  for(const [id,t] of Object.entries(dil.kisiler)){
    l.push({tur:'kisi',id,ad:t.lakap});
    if(t.ad&&t.ad!==t.lakap) l.push({tur:'kisi',id,ad:t.ad});
    for(const [e,a] of Object.entries(t.esyalar||{})) l.push({tur:'esya',id:e,ad:a.replace(/^(boynunda|kuşağında|kulağının arkasında)\s+/,'')});
  }
  for(const [id,a] of Object.entries(dil.terimler.mekan||{})) l.push({tur:'mekan',id,ad:a});
  return l;
}

const YASAK=[/yapay\s*zek/i,/\bmodel\b/i,/talimat/i,/\bjson\b/i,/[{}<>]/,/\bAI\b/,/\bprompt/i];

/**
 * @param {{cevap:string, kalip:string, soru?:?string, kisi:string, dil?:Object, adlar?:Array}} g
 * @returns {{tamam:boolean, neden?:string}}
 */
export function cevapDenetle({cevap,kalip,soru=null,kisi,dil=DIL_TR,adlar=null}){
  if(typeof cevap!=='string') return {tamam:false,neden:'cevap yok'};
  const c=cevap.trim();
  if(c.length<2) return {tamam:false,neden:'boş'};
  if(c.length>320) return {tamam:false,neden:'çok uzun'};
  for(const y of YASAK) if(y.test(c)) return {tamam:false,neden:'yasak ifade: '+y};
  if(/[a-z]{3,}/.test(c)&&!/[çğıöşüâî]/i.test(c)&&c.split(/\s+/).length>6) return {tamam:false,neden:'Türkçe görünmüyor'};
  const kaynak=`${kalip} ${soru||''}`;
  for(const a of adlar||adListesi(dil)){
    if(a.tur==='kisi'&&a.id===kisi) continue; // kendi adını anabilir
    if(adGeciyor(c,a.ad)&&!adGeciyor(kaynak,a.ad)) return {tamam:false,neden:`anlamda olmayan ${a.tur}: ${a.ad}`};
  }
  // Rakam (saat, sayı) ancak kaynakta varsa.
  for(const s of c.match(/\d+/g)||[]) if(!kaynak.includes(s)) return {tamam:false,neden:'anlamda olmayan sayı: '+s};
  // "Katil", "öldürdü" gibi suçlama sözcükleri ancak kaynakta varsa.
  for(const k of ['katil','öldürd','vurd','boğd','zehirle']) if(kucuk(c).includes(k)&&!kucuk(kaynak).includes(k)) return {tamam:false,neden:'anlamda olmayan suçlama: '+k};
  return {tamam:true};
}

export {adGeciyor};
