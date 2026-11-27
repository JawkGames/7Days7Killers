// Vakayı motordan kurar ve bölümlerin ortak kullandığı türetilmiş tabloları hazırlar. Motoru yalnızca okur.
import {koy as koyTemel} from '/src/icerik/index.js';
import {cekirdekListesi} from '/src/icerik/olay-cekirdekleri/index.js';
import * as SIM from '/src/simulasyon/index.js';
import {zamanKur,ad} from './metin.js';

const koy={...koyTemel,cekirdekler:cekirdekListesi};

export const tohumCoz=s=>{const x=String(s??'').trim(); return /^-?\d+$/.test(x)?Number(x):x;};

const GIZLI=['sir','ortaklik','hirsizlik','ot-alma'];
const TANIK=['yoldan-gecerken','ses-duydu'];
const BULMA=['arama','rastlanti'];
export const nedenParca=n=>{if(n==null) return [null,null]; const i=String(n).indexOf(':'); return i<0?[n,null]:[n.slice(0,i),n.slice(i+1)];};
export function nedenSinif(n){
  const [tur]=nedenParca(n);
  if(tur==='cinayet'||tur==='cinayet-yardim') return 'cinayet';
  if(tur==='olu') return 'olu';
  if(GIZLI.includes(tur)) return 'gizli';
  if(TANIK.includes(tur)) return 'tanik';
  if(BULMA.includes(tur)) return 'bulma';
  return null;
}

export function vakaKur(tohum){
  const t0=performance.now();
  const vaka=SIM.vakaUret(tohum,koy);
  zamanKur(vaka);
  const b={vaka,tohum,koy,rapor:null,eslem:null,raporHata:null,motor:null};
  try{ b.rapor=SIM.kaliteRaporu(vaka); }catch(e){ b.raporHata=e; console.warn('kaliteRaporu',e); }
  try{ b.eslem=SIM.oyuncuGorunumu(vaka).eslem; }catch(e){ console.warn('oyuncuGorunumu',e); }
  try{ b.motor=SIM.ifadeMotoru(vaka); }catch(e){ console.warn('ifadeMotoru',e); }
  b.ms=Math.round(performance.now()-t0);
  turet(b);
  return b;
}

function turet(b){
  const v=b.vaka;
  b.ids=Object.keys(v.kisiler).sort((x,y)=>ad(x).localeCompare(ad(y),'tr'));
  b.T=(v.ayar?.gunSayisi??7)*(v.ayar?.dilimler?.length??5);
  b.izById=Object.fromEntries((v.izler||[]).map(i=>[i.id,i]));
  b.cinById=Object.fromEntries((v.cinayetler||[]).map(c=>[c.id,c]));
  b.olayById=Object.fromEntries((v.olaylar||[]).map(o=>[o.id,o]));
  // Rol: motorun `rol` alanı kurbanı katil olsa da "kurban" yazar; burada ikisi ayrı tutulur.
  const r={};
  for(const id of b.ids) r[id]={katil:[],kurban:null,yardimci:[],ortan:[],zorlayan:[],tanik:[],bulan:[],kacan:[],isaret:[],engellendi:false};
  const R=id=>r[id]??(r[id]={katil:[],kurban:null,yardimci:[],ortan:[],zorlayan:[],tanik:[],bulan:[],kacan:[],isaret:[],engellendi:false});
  for(const c of v.cinayetler||[]){
    R(c.katil).katil.push(c.id); R(c.kurban).kurban=c.id;
    if(c.yardimci) R(c.yardimci).yardimci.push(c.id);
    if(c.ortan) R(c.ortan).ortan.push(c.id);
    if(c.zorlayan) R(c.zorlayan).zorlayan.push(c.id);
    if(c.bulunma?.bulan) R(c.bulunma.bulan).bulan.push(c.id);
    if(c.kacanTanik?.kisi) R(c.kacanTanik.kisi).kacan.push(c.id);
  }
  for(const k of v.katiller||[]) if(k.engellendi) R(k.kisi).engellendi=true;
  for(const i of v.izler||[]) if(i.tur==='tanik'&&i.tanik) R(i.tanik).tanik.push({c:i.cinayet,alt:i.alt});
  for(const y of v.yanilticilar||[]) for(const p of y.isaret||[]) R(p).isaret.push(y.cinayet);
  b.roller=r;
  b.katilMi=id=>v.kisiler[id]?.rol==='katil'||r[id]?.katil.length>0||r[id]?.yardimci.length>0||r[id]?.engellendi;
  b.rolSinif=id=>b.katilMi(id)?'katil':r[id]?.kurban?'kurban':'masum';
  b.ifadeler=ifadeMatrisi(b);
}

// Kişi × cinayet × soru ifadeleri. vaka.ifadeler önceden hesaplananlardır; geri kalanı motor yeniden hesaplar.
export const SORULAR=['konum','gorulen','fail','esya','katilYeri'];
function ifadeMatrisi(b){
  const v=b.vaka, M={}, hepsi=[];
  const sor=(k,o,gun)=>{
    if(!b.motor) return null;
    try{ return b.motor.ifade(k,o,{gun}); }catch(e){ return {hata:e.message,konusan:k,olgu:o}; }
  };
  for(const c of v.cinayetler||[]){
    const gun=c.fotografGunu??Math.floor(c.zaman/5)+1;
    const fizik=(c.izler||[]).map(id=>b.izById[id]).filter(i=>i&&i.tur==='fiziksel'&&i.alt!=='yara');
    for(const k of b.ids){
      if(k===c.kurban) continue;
      const h={};
      h.konum=sor(k,{tur:'konum',kisi:k,zaman:c.zaman},gun);
      h.gorulen=sor(k,{tur:'gorulen',zaman:c.zaman},gun);
      h.fail=sor(k,{tur:'fail',cinayet:c.id},gun);
      h.esya=fizik.filter(i=>i.sahip===k||(i.adaylar||[]).includes(k)).map(i=>sor(k,{tur:'esya',iz:i.id},gun)).filter(Boolean);
      h.katilYeri=k===c.katil?null:sor(k,{tur:'konum',kisi:c.katil,zaman:c.zaman},gun);
      (M[k]??={})[c.id]=h;
      for(const s of SORULAR){
        const l=s==='esya'?h.esya:[h[s]];
        for(const f of l) if(f&&f.tavir&&f.tavir!=='dogru'&&f.tavir!=='bilmez'&&f.tavir!=='olu'&&!(s==='gorulen'&&bosGorulen(f))) hepsi.push({...f,cinayet:c.id,soru:s});
      }
    }
  }
  return {M,hepsi};
}
const bosGorulen=f=>f.tavir==='susar'&&!f.bilgi;
// Bir soru için en "ilginç" tavır: yalan > susar > abartı > doğru > bilmez
const SIRA={yalan:5,susar:4,abarti:3,dogru:2,bilmez:1,olu:0};
export function enIlginc(l){let e=null; for(const f of l) if(f&&(!e||(SIRA[f.tavir]??6)>(SIRA[e.tavir]??6))) e=f; return e;}
