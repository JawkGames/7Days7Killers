// Vaka inceleyici: bir tohumun bütün gerçeğini okunur Türkçe metinle basar.
//   node araclar/vaka.js <tohum> [--ifadeler] [--cizelge]
// Geliştirici aracıdır: buradaki etiketler oyun metni değildir (oyun cümleleri src/dil/ içinde).

import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {koyKur} from '../src/icerik/kur.js';
import {vakaUret} from '../src/simulasyon/index.js';
import tr from '../src/dil/tr/kisiler.js';
import T from '../src/dil/tr/terimler.js';
import {ekle,kisiAdi,mekanAdi} from '../src/dil/tr/ekler.js';

const kok=new URL('..',import.meta.url).pathname;
const oku=async d=>Promise.all(fs.readdirSync(kok+d).filter(f=>f.endsWith('.js')&&f!=='index.js').sort().map(async f=>(await import(pathToFileURL(`${kok}${d}/${f}`))).default));
const kisiler=await oku('src/icerik/kisiler'), mekanlar=await oku('src/icerik/mekanlar');
const cekirdekler=fs.existsSync(kok+'src/icerik/olay-cekirdekleri')?await oku('src/icerik/olay-cekirdekleri'):[];
const koy={...koyKur(kisiler,mekanlar),cekirdekler};

const arg=process.argv.slice(2);
const tohumYazi=arg.find(a=>!a.startsWith('--'))??'1';
const tohum=/^\d+$/.test(tohumYazi)?Number(tohumYazi):tohumYazi;
const v=vakaUret(tohum,koy);

const ad=id=>id==null?'—':tr[id]?.lakap??id;
const adE=(id,...e)=>id==null?'—':ekle(kisiAdi(ad(id)),...e); // "Kör Halil'i", "Muhtarın"
const yerE=(m,...e)=>m==null?'—':ekle(mekanAdi(yer(m)),...e); // "ağa konağında"
const tamAd=id=>`${tr[id].lakap} (${tr[id].ad})`;
const yer=m=>m==null?'—':T.mekan[m]??m;
const D=v.ayar.dilimler.length;
const DILIM={gece:'gece',sabah:'sabah',ogle:'öğle',ikindi:'ikindi',aksam:'akşam'};
const an=t=>`${Math.floor(t/D)+1}. gün ${DILIM[v.ayar.dilimler[t%D]]}`;
const esya=(sahip,e)=>tr[sahip]?.esyalar?.[e]??e;
const sir=(sahip,id)=>tr[sahip]?.sirlar?.[id]??id;
const SEBEP={susturma:'susturmak için',intikam:'intikam için',husumet:'husumetten',borc:'borcu yüzünden',korku:'korkudan',koruma:'birini korumak için',
  kiskanclik:'kıskançlıktan',namus:'namus meselesi',miras:'miras için',zorlama:'şantajla zorlandığı için',santaj:'şantajcıdan kurtulmak için',ceza:'cezalandırmak için',ihanet:'ihanete karşı',zulum:'zulme karşı'};
const YONTEM={bicak:'bıçakla',darbe:'başına vurarak',bogma:'boğarak',zehir:'zehirleyerek',tufek:'tüfekle',  'suda-bogma':'suda boğarak'};
const kaynakYaz=k=>{
  if(!k) return '';
  if(k.tur==='sir') return `sır: "${sir(k.sahip,k.sir)}"`;
  if(k.tur==='iliski') return `ilişki: ${T.iliski[k.iliski]??k.iliski}`;
  if(k.tur==='rekabet') return `${ad(k.uzerine)} üzerine rekabet`;
  if(k.tur==='koruma') return `${adE(k.korunan,'i')} korumak (${k.iliski?T.iliski[k.iliski]:`sır: "${sir(k.sir.sahip,k.sir.sir)}"`})`;
  if(k.tur==='santaj') return `${ad(k.zorlayan)} onun sırrını biliyor: "${sir(k.sahip,k.sir)}"`;
  return JSON.stringify(k);
};
const NEDEN={'katil-birakti':'katil bıraktı','yardimci-birakti':'yardımcı bıraktı','tanik-kacarken':'kaçan tanık düşürdü','onceden-gecti':'daha önce oradan geçti',
  'kurbanin':'kurbanın','zehir-kaynagi':'zehrin kaynağı','calinti-silah':'çalıntı silah','katil-silahi':'katilin silahı','yontem':'yöntem',gordu:'gördü',duydu:'duydu',
  'katil-disaridaydi':'katil dışarıdaydı','gizli-isi-vardi':'gizli işi vardı','katilin-giysisi':'katilin giysisi','kurban-tirmaladi':'kurban tırmaladı',
  'olay-yerinde-dusurdu':'olay yerinde düşürdü','saldiriya-ugradi':'saldırıya uğradı','kacarken-dusurdu':'kaçarken düşürdü','calinmisti':'çalınmıştı'};
const izNesne=i=>i.esya?esya(i.sahip,i.esya):i.ortu?`${T.ortu[i.ortu]} lifi`:i.anahtar;
const izYaz=i=>{
  const y=i.yaniltici?' [YANILTICI]':'';
  if(i.tur==='fiziksel'){
    if(i.alt==='yara') return `${i.id} yara: ${i.anahtar}${i.esya?` (${esya(i.sahip,i.esya)} mermisi)`:''}${y}`;
    const aday=i.adaylar&&i.adaylar.length>1?` — adaylar: ${i.adaylar.map(ad).join(', ')}`:'';
    return `${i.id} ${i.alt}: ${i.anahtar} = ${izNesne(i)}, sahibi ${ad(i.sahip)} (${NEDEN[i.gercek.neden]??i.gercek.neden}, ${an(i.zaman)})${aday}${y}`;
  }
  if(i.tur==='tanik'){
    if(i.alt==='ses') return `${i.id} ses: ${ad(i.tanik)} ${yerE(i.nereden,'den')} ${i.anahtar} duydu${y}`;
    return `${i.id} ${i.alt}: ${ad(i.tanik)} ${yerE(i.nereden,'den')} ${i.kesinlik==='yuz'?adE(i.gorulen,'i')+' yüzünden tanıdı':`${T.ortu[i.ortu]} giymiş bir silüet gördü (${ad(i.gorulen)})`}${y}`;
  }
  return `${i.id} dolaylı ${i.alt}: ${ad(i.fark_eden)}, ${an(i.zaman)} ${yerE(i.mekan,'de')} ${ad(i.kisi)} için fark etti${i.esya?` (${esya(i.kisi,i.esya)})`:''} (${NEDEN[i.gercek.neden]??i.gercek.neden})${y}`;
};

let s=`VAKA tohum=${v.tohum} deneme=${v.deneme} çekirdekler=${v.cekirdekler.join(', ')||'—'}\n`;
s+=`Katiller: ${v.katiller.map(k=>ad(k.kisi)).join(', ')}\n`;
s+=`Kurbanlar: ${v.cinayetler.map(c=>ad(c.kurban)).join(', ')}\n\n`;
for(const c of v.cinayetler){
  s+=`== ${c.id} (${c.fotografGunu}. gün fotoğrafı) ${tamAd(c.katil)} → ${tamAd(c.kurban)}\n`;
  s+=`   ${an(c.zaman)}, ${yerE(c.mekan,'de')}${c.cagrildi?' (kurban oraya çağrıldı)':''}; ${YONTEM[c.yontem]}`;
  if(c.silah) s+=`, silah ${esya(c.silah.sahip,c.silah.esya)}${c.silah.calinti?` (${adE(c.silah.sahip,'den')} çalındı)`:''}${c.silah.birakildi?', olay yerinde kaldı':''}`;
  s+='\n';
  s+=`   Sebep: ${SEBEP[c.sebep.tur]??c.sebep.tur} — ${kaynakYaz(c.sebep.kaynak)}\n`;
  if(c.sebep.asil) s+=`   Asıl sebep (${adE(c.zorlayan,'in')}): ${SEBEP[c.sebep.asil.tur]} — ${kaynakYaz(c.sebep.asil.kaynak)}\n`;
  for(const e of c.sebep.ek||[]) s+=`   + ${SEBEP[e.tur]??e.tur} — ${kaynakYaz(e.kaynak)}\n`;
  if(c.yardimci) s+=`   Yardımcı: ${ad(c.yardimci)}\n`;
  s+=`   Mazeret: ${Object.entries(c.iddialar).map(([k,m])=>`${ad(k)} "${yerE(m,'de','dim')}"${c.ortan&&k===c.katil?` (${ad(c.ortan)} doğrulayacak)`:''}`).join('; ')}\n`;
  s+=`   Bulunma: ${ad(c.bulunma.bulan)}, ${an(c.bulunma.zaman)} (${c.bulunma.neden})\n`;
  if(c.kacanTanik) s+=`   Kaçan tanık: ${ad(c.kacanTanik.kisi)} (${yerE(c.kacanTanik.nereden,'den')} geliyordu)\n`;
  for(const id of c.izler) s+=`   - ${izYaz(v.izler.find(i=>i.id===id))}\n`;
  s+='\n';
}
const BAG={santaj:b=>`${ad(b.zorlayan)}, ${adE(b.zorlanan,'i')} sırrıyla (${sir(b.sir.sahip,b.sir.sir)}) cinayete zorladı`,
  ortaklik:b=>`${ad(b.yardimci)}, ${adE(b.katil,'in')} cinayetinde yardımcı`,ortme:b=>`${ad(b.ortan)}, ${adE(b.ortulen,'e')} mazeret veriyor`};
s+=`BAĞLAR\n${v.baglar.map(b=>`- ${BAG[b.tur](b)} (${b.cinayet})`).join('\n')||'—'}\n\n`;
const ACIKLAMA={'calinti-silah':'silah çalınmıştı','tanik-kacti':'tanıktı, saldırıya uğradı, kaçtı','onceden-gecti':'daha önce oradan geçmişti','benzer-esya':'aynı izi bırakan başka eşya',
  'otu-vermisti':'otu o vermişti ama öldürmedi','gizli-isi-vardi':'o gece sırrı yüzünden dışarıdaydı'};
s+=`YANILTICILAR\n${v.yanilticilar.map(y=>`- ${y.id} (${y.cinayet}) ${y.isaret.map(ad).join(', ')} →  ${ACIKLAMA[y.aciklama]??y.aciklama}; izler ${y.izler.join(', ')}; çürütme: ${y.curutme.map(c=>c.tur==='konum'?`${ad(c.kisi)} ${an(c.zaman)} yeri`:c.tur==='iz'?c.iz:c.tur==='sir'?'sır':`${ad(c.kisi)} ifadesi`).join(', ')}`).join('\n')||'—'}\n\n`;
const TAVIR={yalan:'YALAN',susar:'susar',abarti:'abartır',dogru:'doğru',bilmez:'bilmez'};
const deger=(o,x)=>{
  if(x==null) return '—';
  if(o.tur==='konum') return x.deger!==undefined?yer(x.deger):x.degil?`${yerE(x.degil,'de')} değildi`:'?';
  if(o.tur==='gorulen') return (x.deger||[]).map(e=>e.kisi?`${ad(e.kisi)}${e.kesinlik==='siluet'?'(silüet)':''}${e.abarti?.tahmin?`→"${ad(e.abarti.tahmin)}"`:''}`:`ses:${e.ses}`).join(', ')||'hiç kimse';
  if(o.tur==='fail') return ad(x.deger);
  if(o.tur==='esya') return x.deger!==undefined?ad(x.deger):(x.adaylar||[]).map(ad).join('/');
  return String(x.deger);
};
s+='KİM NE SÖYLÜYOR (doğru olmayanlar)\n';
for(const f of v.ifadeler){
  if(f.tavir==='dogru'||f.tavir==='bilmez') continue;
  const o=f.olgu;
  const konu=o.tur==='konum'?`${o.kisi===f.konusan?'kendi yeri':adE(o.kisi,'in')+' yeri'} ${an(o.zaman)}`:o.tur==='gorulen'?`${an(o.zaman)} gördükleri`:o.tur==='fail'?`${o.cinayet} faili`:`${o.iz} kimin`;
  s+=`- ${ad(f.konusan)}, ${konu}: ${TAVIR[f.tavir]} (${f.kural}) — söyler: ${deger(o,f.soylenen)}${f.tavir==='abarti'?` +${f.soylenen?.abarti?.tur??''}`:''}; gerçek: ${deger(o,f.bilgi)}; gerginlik ${f.gerginlik}\n`;
}
if(arg.includes('--ifadeler')){
  s+='\nBÜTÜN İFADELER\n';
  for(const f of v.ifadeler) s+=`- ${ad(f.konusan)} ${JSON.stringify(f.olgu)}: ${f.tavir} ${f.kural??''} ${JSON.stringify(f.soylenen)}\n`;
}
if(arg.includes('--cizelge')){
  s+='\nÇİZELGE\n';
  for(const k of Object.keys(v.cizelge).sort()) s+=`${ad(k).padEnd(18)} ${v.cizelge[k].map((m,t)=>`${t%D===0?'| ':''}${m??'×'}`).join(' ')}\n`;
}
console.log(s);
