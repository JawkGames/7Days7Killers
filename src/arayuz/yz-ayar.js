// Yapay zekâ ayarı (kapalı / yerel sunucu) ve arayüzün yapay zekâ yardımcıları. Görsel ve metin sürümü birlikte kullanır.
// Ayar localStorage'da durur; erişilemezse (gizli pencere) varsayılan: kapalı.
import {yzKur,yerelSunucu} from '../yz/index.js';

const ANAHTAR='7d7k-yz';
export const YZ_VARSAYILAN=Object.freeze({kip:'kapali',adres:'http://localhost:1234',model:''});

export function yzAyarOku(){
  try{
    const j=JSON.parse(localStorage.getItem(ANAHTAR)||'null');
    if(!j||typeof j!=='object') return {...YZ_VARSAYILAN};
    return {kip:j.kip==='yerel'?'yerel':'kapali',adres:typeof j.adres==='string'&&j.adres.trim()?j.adres.trim():YZ_VARSAYILAN.adres,model:typeof j.model==='string'?j.model.trim():''};
  }catch{ return {...YZ_VARSAYILAN}; }
}
export function yzAyarYaz(a){
  try{ localStorage.setItem(ANAHTAR,JSON.stringify({kip:a.kip,adres:a.adres,model:a.model})); return true; }catch{ return false; }
}

export function yzOlustur(ayar,{kisiler=null,zamanAsimi=6000}={}){
  const arkaUc=ayar?.kip==='yerel'?yerelSunucu({adres:ayar.adres||YZ_VARSAYILAN.adres,model:ayar.model||''}):null;
  return yzKur({arkaUc,kisiler,zamanAsimi});
}

// Ayar ekranındaki "Bağlantıyı dene": modeli bulabiliyor mu?
export async function baglantiDene(ayar,ms=4000){
  const s=yerelSunucu({adres:ayar.adres||YZ_VARSAYILAN.adres,model:''});
  const ac=new AbortController(), z=setTimeout(()=>ac.abort(),ms);
  try{ const m=ayar.model||await s.modelBul(ac.signal); return {tamam:true,model:m}; }
  catch(e){ return {tamam:false,neden:ac.signal.aborted?'zaman aşımı':String(e?.message||e)}; }
  finally{ clearTimeout(z); }
}

// Oyun katmanının 'soz' parçasını karakterin ağzından söyletir (yapay zekâ kapalıysa ya da anlam yoksa kalıp).
//   anahtar: (tohum, döngü, soru kimliği) — kişi yz içinde ayrıca anahtara girer.
export function sozSoylet(yz,p,{tohum,dongu,oyuncuSorusu=null}){
  if(!yz?.acik||!p.anlam) return Promise.resolve({metin:p.metin,kaynak:'kalip'});
  return yz.soyle({kisi:p.kisi,soru:p.anlam.soru,oyuncuSorusu:p.anlam.soru?oyuncuSorusu:null,kalip:p.metin,
    tavir:p.anlam.tavir,gerginlik:p.anlam.gerginlik,tepki:p.tepki,yalan:p.anlam.yalan??null,anahtar:`${tohum}|${dongu}|${p.anlam.id}`})
    .catch(()=>({metin:p.metin,kaynak:'kalip'}));
}
