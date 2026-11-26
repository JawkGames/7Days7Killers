// KOY-HALKI.md dosyasını veri dosyalarından üretir: npm run halk
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {koyKur,dogrula} from '../src/icerik/kur.js';
import tr from '../src/dil/tr/kisiler.js';
import T from '../src/dil/tr/terimler.js';

const oku=async d=>Promise.all(fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort().map(async f=>(await import(pathToFileURL(`${d}/${f}`))).default));
const kisiler=await oku('src/icerik/kisiler'), mekanlar=await oku('src/icerik/mekanlar');
const hatalar=dogrula(kisiler,mekanlar,tr,T);
if(hatalar.length){console.error(hatalar.join('\n')); process.exit(1);}
const koy=koyKur(kisiler,mekanlar), ad=id=>tr[id].lakap;

let s=`# Köy halkı\n\nBu dosya \`npm run halk\` ile \`src/icerik/kisiler/\` ve \`src/dil/tr/kisiler.js\` dosyalarından üretilir; elle düzenlenmez.\n\n`;
s+=`**${T.koy.ad} köyü, ${T.koy.il}, ${T.koy.yil}.** ${kisiler.length} kişi. Her oyunda yedisi katil olur; kim olduğu tohuma göre değişir. Aşağıdaki sırlar ve ilişkiler her oyunda aynıdır ve sebeplerin kaynağıdır.\n\n`;
s+=`| Lakap | Ad | Yaş | Meslek | Mizaç |\n| --- | --- | --- | --- | --- |\n`;
for(const k of kisiler) s+=`| ${tr[k.id].lakap} | ${tr[k.id].ad} | ${k.yas} | ${T.meslek[k.meslek]} | ${T.mizac[k.mizac]} |\n`;
for(const k of kisiler){
  const t=tr[k.id];
  s+=`\n## ${t.lakap} (${t.ad}, ${k.yas})\n\n${t.tanim}\n\n`;
  s+=`- **Meslek ve mizaç:** ${T.meslek[k.meslek]}, ${T.mizac[k.mizac]}\n`;
  s+=`- **Yeri:** ${T.mekan[k.ev]}${k.is&&k.is!==k.ev?`; gündüz ${T.mekan[k.is]}`:''}\n`;
  s+=`- **Giysi ve eşya:** ${T.ortu[k.ortu]}; ${k.esyalar.map(e=>t.esyalar[e]).join(', ')}\n`;
  const il=koy.iliskileri(k.id);
  if(il.length) s+=`- **İlişkiler:** ${il.map(i=>`${T.iliski[i.tur]} ${ad(i.kime)}`).join('; ')}\n`;
  s+=`- **Sırlar:**\n`+k.sirlar.map(x=>`    - ${t.sirlar[x.id]}${x.kimler.length?` *(ilgili: ${x.kimler.map(ad).join(', ')})*`:''}\n`).join('');
  s+=`- **Kaybedilince** (${T.kayipTuru[k.kayip.tur]}): ${t.kayip}\n`;
}
fs.writeFileSync('KOY-HALKI.md',s);
console.log(`KOY-HALKI.md yazıldı: ${kisiler.length} kişi`);
