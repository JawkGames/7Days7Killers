// Metinle oynanan 7 Days 7 Killers (terminal).
//   node araclar/oyna.js [tohum]            numara seçerek oyna
//   node araclar/oyna.js [tohum] --oto      kendi kendine oynayan dedektifle baştan sona (duman testi)
//   seçenekler: --geri=N (otoda kaç kez REWIND, varsayılan 1), --gercek (otonun sonunda geliştirici özeti)
// Komutlar (elle oynarken): numara | d (defter) | k a b (iki ifadeyi yan yana koy, ör. "k f3 f7") |
//   s kimlik / t kimlik / x kimlik (şüpheli / temiz / işareti sil) | q (çık)

import fs from 'node:fs';
import readline from 'node:readline';
import {pathToFileURL} from 'node:url';
import {koyKur} from '../src/icerik/kur.js';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,defterGorunumu,kisiListesi,hukumAdaylari} from '../src/oyun/oyun.js';
import {otoOyna,supheHesapla} from '../src/oyun/oto.js';
import {kisiYazi} from '../src/diyalog/adlar.js';

const kok=new URL('..',import.meta.url).pathname;
const oku=async d=>Promise.all(fs.readdirSync(kok+d).filter(f=>f.endsWith('.js')&&f!=='index.js').sort().map(async f=>(await import(pathToFileURL(`${kok}${d}/${f}`))).default));
const kisiler=await oku('src/icerik/kisiler'), mekanlar=await oku('src/icerik/mekanlar');
const cekirdekler=fs.existsSync(kok+'src/icerik/olay-cekirdekleri')?(await oku('src/icerik/olay-cekirdekleri')).filter(x=>x&&x.id):[];
const koy={...koyKur(kisiler,mekanlar),cekirdekler};

const arg=process.argv.slice(2);
const tohumYazi=arg.find(a=>!a.startsWith('--'));
const tohum=tohumYazi!=null&&/^\d+$/.test(tohumYazi)?Number(tohumYazi):(Date.now()%100000);
const b=baglamKur({tohum,koy});

const BICIM={baslik:m=>`\n== ${m} ==`,anlatim:m=>m,soru:m=>`  — ${m}`,soz:(m,p)=>`  ${p.kisiAd}: «${m}»`,sahne:m=>`    (${m})`,sistem:m=>`  [${m}]`,ayrac:()=>'\n· · ·'};
const adi=id=>kisiYazi(id);
function bas(goster){
  for(const p of goster||[]){
    const f=BICIM[p.tur]??(m=>m);
    console.log(f(p.metin,{...p,kisiAd:p.kisi?adi(p.kisi):''}));
  }
}

if(arg.includes('--oto')){
  const geri=Number((arg.find(a=>a.startsWith('--geri='))||'--geri=1').split('=')[1]);
  const {durum,secilenler}=otoOyna(b,{geriSarma:geri,yaz:(g,s)=>{if(s&&s.eylem.tur!=='sor') console.log(`\n> ${s.etiket}`); else if(s) console.log(''); bas(g);}});
  if(arg.includes('--gercek')){
    const kat=new Set(b.vaka.katiller.map(k=>k.kisi));
    const p=supheHesapla(b,durum);
    console.log('\n[geliştirici] seçilen:',secilenler.map(k=>adi(k)+(kat.has(k)?'*':'')).join(', '));
    console.log('[geliştirici] doğru:',secilenler.filter(k=>kat.has(k)).length,'/ 7; ifade:',durum.defter.ifadeler.length,'çelişki:',durum.defter.celiskiler.length);
    console.log('[geliştirici] şüphe:',Object.entries(p).sort((x,y)=>y[1]-x[1]).slice(0,12).map(([k,v])=>adi(k)+(kat.has(k)?'*':'')+'='+v.toFixed(1)).join(' '));
  }
  process.exit(0);
}

// ---- Elle oyna ----
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const sor=q=>new Promise(res=>rl.question(q,res));
let d=oyunBaslat({tohum});
{const a=acilis(b,d); d=a.durum; bas(a.goster);}
console.log(`\n(Tohum ${tohum}. Komutlar: numara, d = defter, k f1 f2 = karşılaştır, s/t/x kimlik = işaret, q = çık)`);

function defterBas(){
  const g=defterGorunumu(b,d);
  const blok=(ad,l)=>{console.log(`\n-- ${ad} --`); if(!l.length) console.log('  —'); for(const x of l) console.log('  '+(x.id&&/^[fk]\d/.test(x.id)?x.id+' ':'')+x.metin);};
  blok('Cinayetler',g.cinayetler); blok('İzler',g.izler); blok('İfadeler',g.ifadeler); blok('Çelişkiler',g.celiskiler); blok('Sırlar',g.sirlar); blok('İşaretler',g.isaretler);
  console.log('\n  Kişiler: '+kisiListesi(b,d).map(k=>`${k.id}${k.canli?'':'†'}`).join(' '));
}

while(d.zaman.adim!=='bitti'){
  const l=secenekler(b,d);
  console.log('');
  l.forEach((s,i)=>console.log(`  ${i+1}) ${s.etiket}`));
  const g=(await sor('> ')).trim();
  if(g==='q') break;
  if(g==='d'){defterBas(); continue;}
  try{
    let e=null;
    const m=g.match(/^([kstx])\s+(\S+)(?:\s+(\S+))?$/);
    if(m&&m[1]==='k') e={tur:'karsilastir',a:m[2],b:m[3]};
    else if(m) e={tur:'isaretle',kisi:m[2],isaret:{s:'supheli',t:'temiz',x:null}[m[1]]};
    else{
      const s=l[Number(g)-1];
      if(!s){console.log('  ?'); continue;}
      e=s.eylem;
      if(e.tur==='hukum'){
        const ad=hukumAdaylari(b,d);
        console.log('  Adaylar: '+ad.join(' '));
        const sec=(await sor('  Yedi kimlik (boşlukla): ')).trim().split(/\s+/);
        e={tur:'hukum',kisiler:sec};
      }
    }
    const r=uygula(b,d,e); d=r.durum; bas(r.goster);
  }catch(err){console.log('  ['+err.message+']');}
}
rl.close();
