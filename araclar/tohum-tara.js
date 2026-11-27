// Tohum tarayıcı: çok sayıda tohumu üretir, kalite eleğinin sonuçlarını özetler.
//   node araclar/tohum-tara.js [adet=1000] [--ornek=3]
// Basar: ilk denemede geçen tohum sayısı, eleme nedenleri, zorluk dağılımı, katil olma sıklığı, yöntem dağılımı,
// zincir türleri ve birkaç örnek vakanın çözüm zinciri. Geliştirici aracıdır: etiketler oyun metni değildir.

import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {koyKur} from '../src/icerik/kur.js';
import {vakaUret,kaliteRaporu} from '../src/simulasyon/index.js';
import tr from '../src/dil/tr/kisiler.js';
import T from '../src/dil/tr/terimler.js';
import {ekle,kisiAdi} from '../src/dil/tr/ekler.js';

const kok=new URL('..',import.meta.url).pathname;
const oku=async d=>Promise.all(fs.readdirSync(kok+d).filter(f=>f.endsWith('.js')&&f!=='index.js').sort().map(async f=>(await import(pathToFileURL(`${kok}${d}/${f}`))).default));
const koy={...koyKur(await oku('src/icerik/kisiler'),await oku('src/icerik/mekanlar')),cekirdekler:await oku('src/icerik/olay-cekirdekleri')};

const arg=process.argv.slice(2);
const N=Number(arg.find(a=>/^\d+$/.test(a))??1000);
const ORNEK=Number((arg.find(a=>a.startsWith('--ornek='))||'--ornek=3').split('=')[1]);
const ad=id=>id==null?'—':tr[id]?.lakap??id;
const yuzde=(n,top)=>`${(100*n/top).toFixed(1)}%`;
const say=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
const sirala=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
const cubuk=(n,en)=>'#'.repeat(Math.round(30*n/Math.max(1,en)));

const NEDEN={'zincir-eksik':'bir katile iki bağımsız zincir yok','masum-zincir':'bir masuma zincir gidiyor','curutulemeyen-yaniltici':'çürütülemeyen yanıltıcı iz',
  'cok-kolay':'çok kolay','cok-zor':'çok zor (sorgu hakkına sığmıyor)'};
const t0=Date.now();
let ilk=0, sonunda=0, denemeTop=0;
const ilkNeden={}, ilkNedenVaka={}, sorguD={}, adimD={}, katil={}, yontem={}, silah={}, zincirTur={}, zincirSay={}, elenmeSay={};
const ornekler=[];
for(let s=1;s<=N;s++){
  const v=vakaUret(s,koy);
  const el=v.kalite.elenenDenemeler||[];
  denemeTop+=el.length+1;
  say(elenmeSay,Math.min(el.length,5));
  if(!el.length&&v.kalite.gecti) ilk++;
  if(v.kalite.gecti) sonunda++;
  if(el.length){
    for(const n of el[0].nedenler) say(ilkNeden,n);
    for(const n of new Set(el[0].nedenler)) say(ilkNedenVaka,n);
  }
  say(sorguD,v.kalite.zorluk.sorgu); say(adimD,Math.floor(v.kalite.zorluk.adim/5)*5);
  for(const c of v.cinayetler){say(katil,c.katil); say(yontem,c.yontem); say(silah,c.silah?(c.silah.mekanAleti?'yerin aleti':c.silah.calinti?'çalıntı eşya':'kendi eşyası'):'silahsız');}
  if(s<=200||ornekler.length<ORNEK){
    const r=kaliteRaporu(v);
    for(const k of r.katiller){say(zincirSay,Math.min(k.zincirSayisi,4)); for(const z of k.zincirler) if(k.bagimsiz.includes(z.id)) say(zincirTur,z.tur);}
    if(ornekler.length<ORNEK&&r.gecti&&s%7===0) ornekler.push({s,v,r});
  }
}
const sure=((Date.now()-t0)/1000).toFixed(1);
let o=`TOHUM TARAMASI: ${N} tohum, ${sure} sn (${((Date.now()-t0)/N).toFixed(0)} ms/tohum, ortalama ${(denemeTop/N).toFixed(2)} deneme)\n\n`;
o+=`İlk denemede elekten geçen: ${ilk}/${N} (${yuzde(ilk,N)})\n`;
o+=`Yeniden denemeyle sonunda geçen: ${sonunda}/${N} (${yuzde(sonunda,N)})\n`;
o+=`Elenen deneme sayısı: ${sirala(elenmeSay).sort((a,b)=>a[0]-b[0]).map(([k,n])=>`${k==='5'?'5+':k}: ${n}`).join(', ')}\n\n`;
o+=`İLK DENEMEDE ELENENLERİN NEDENLERİ (vaka sayısı; bir vakanın birden çok nedeni olabilir)\n`;
const elenenIlk=N-ilk;
for(const [k,n] of sirala(ilkNedenVaka)) o+=`  ${(NEDEN[k]??k).padEnd(38)} ${String(n).padStart(5)} vaka (${yuzde(n,elenenIlk)} elenenlerin)   ${ilkNeden[k]} kez\n`;
o+=`\nZORLUK: en az sorgu (iki bağımsız zincir + yanıltıcıların çürütülmesi için)\n`;
const enS=Math.max(...Object.values(sorguD));
for(const [k,n] of Object.entries(sorguD).sort((a,b)=>a[0]-b[0])) o+=`  ${String(k).padStart(3)} sorgu ${String(n).padStart(5)}  ${cubuk(n,enS)}\n`;
o+=`ZORLUK: çözücünün adım sayısı (ifade + iz + eleme)\n`;
const enA=Math.max(...Object.values(adimD));
for(const [k,n] of Object.entries(adimD).sort((a,b)=>a[0]-b[0])) o+=`  ${String(k).padStart(3)}-${String(Number(k)+4).padEnd(3)} ${String(n).padStart(5)}  ${cubuk(n,enA)}\n`;
o+=`\nKATİL OLMA SIKLIĞI (${N} vakada)\n`;
for(const id of Object.keys(koy.kisiler).sort((a,b)=>(katil[b]||0)-(katil[a]||0))) o+=`  ${ad(id).padEnd(18)} ${yuzde(katil[id]||0,N).padStart(6)}  ${cubuk(katil[id]||0,N*.6)}\n`;
const C=Object.values(yontem).reduce((a,b)=>a+b,0); // toplam cinayet
o+=`\nYÖNTEM DAĞILIMI\n`;
for(const [k,n] of sirala(yontem)) o+=`  ${k.padEnd(12)} ${yuzde(n,C).padStart(6)}\n`;
o+=`SİLAH\n`;
for(const [k,n] of sirala(silah)) o+=`  ${k.padEnd(14)} ${yuzde(n,C).padStart(6)}\n`;
const zt=Object.values(zincirTur).reduce((a,b)=>a+b,0);
o+=`\nBAĞIMSIZ ZİNCİR TÜRLERİ (ilk ${Math.min(N,200)} tohum)\n`;
for(const [k,n] of sirala(zincirTur)) o+=`  ${k.padEnd(10)} ${yuzde(n,zt).padStart(6)}\n`;
o+=`KATİL BAŞINA BAĞIMSIZ ZİNCİR: ${Object.entries(zincirSay).sort().map(([k,n])=>`${k==='4'?'4+':k}: ${n}`).join(', ')}\n`;

// Örnek çözümler
const izAdi=(r,id)=>{for(const c of r.cozum.cinayetler){const i=c.isaretler.find(x=>x.iz===id); if(i) return `${i.anahtar} (aday: ${i.adaylar.map(ad).join(', ')})`;} return id;};
const ZINCIR={tanik:'tanık',iz:'iz',siluet:'silüet',dolayli:'dolaylı',kesisim:'kesişim'};
const kaynakYaz=(r,k)=>k.startsWith('iz:')?`fotoğrafta ${izAdi(r,k.slice(3))}`:`${ekle(kisiAdi(ad(k.slice(2))),'in')} ifadesi`;
for(const {s,v,r} of ornekler){
  o+=`\n=== ÖRNEK: tohum ${s} (sorgu ${r.zorluk.sorgu}, adım ${r.zorluk.adim}, çelişki ${r.celiskiler.length})\n`;
  for(const k of r.katiller){
    const c=v.cinayetler.find(x=>x.id===k.cinayet);
    o+=`  ${c.id} ${c.fotografGunu}. gün: ${ad(c.kurban)} ${T.mekan[c.mekan]??c.mekan} — katil ${ad(k.kisi)}, ${k.zincirSayisi} bağımsız zincir\n`;
    for(const z of k.zincirler.filter(z=>k.bagimsiz.includes(z.id))){
      o+=`     [${ZINCIR[z.tur]??z.tur}${z.alt?' '+z.alt:''}] ${z.sabit.map(x=>kaynakYaz(r,x)).join(' + ')}`;
      if(z.eleme.length) o+=`; elenen: ${z.eleme.map(e=>`${ad(e.kisi)} (${e.tur}${e.kaynaklar.length?': '+e.kaynaklar.map(ad).join('/'):''})`).join(', ')}`;
      o+='\n';
    }
  }
  for(const y of r.yanilticilar) o+=`  yanıltıcı ${y.id} (${y.cinayet}, ${y.aciklama}) ${y.isaret.map(ad).join(', ')} → ${y.curutme.map(c=>c.yol?c.yol.map(p=>p.tur+(p.kaynaklar?.length?' ('+p.kaynaklar.map(ad).join('/')+')':'')).join(' | '):'çürütülemedi').join('; ')}\n`;
  o+=`  çelişkiler: ${[...new Set(r.celiskiler.map(c=>c.tur))].map(t=>`${t} ×${r.celiskiler.filter(c=>c.tur===t).length}`).join(', ')||'—'}\n`;
  o+=`  takvim: ${r.enAzSorgu.gunler.map((g,i)=>`${i+1}. gün ${g.map(ad).join(', ')||'—'}`).join(' | ')}\n`;
}
console.log(o);
