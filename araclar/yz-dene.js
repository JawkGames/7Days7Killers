// Yapay zekâ katmanını yerel bir modelle dener: bir oyunu kendi kendine oynatıp her sözü yan yana basar.
//
// KULLANIM
//   1) LM Studio'da bir model yükle (ör. Qwen3.5-4B ya da Gemma 4 E4B) ve Developer sekmesinden sunucuyu başlat
//      (varsayılan adres http://localhost:1234). Ollama için: ollama serve, adres http://localhost:11434, --model ver.
//   2) node araclar/yz-dene.js --adres http://localhost:1234 --tohum 77 --n 12
//
// SEÇENEKLER
//   --adres URL     OpenAI uyumlu sunucu (varsayılan http://localhost:1234)
//   --model AD      model adı (boş: sunucudaki ilk/yüklü model)
//   --tohum N       vaka tohumu (varsayılan 77)
//   --n N           kaç söz denensin (varsayılan 12)
//   --zaman MS      bir istek için en uzun bekleme (varsayılan 20000; oyunda 6000)
//   --soru "..."    ek serbest soru (birden çok verilebilir)
//
// ÇIKTI: her söz için
//   Soru       müfettişin sorusu (motorun hazır sorusu)
//   Kalıp      motorun cümlesi (anlam; deftere bu yazılır)
//   Yapay zekâ modelin cümlesi (denetimden geçmese de gösterilir)
//   Denetim    geçti / reddedildi (neden) / zaman aşımı; tavır (motorun kararı: dogru, yalan, susar, abarti, bilmez) ve süre
// Sonra birkaç serbest soru hazır sorulara eşlenir; eşlenen sorunun cevabı da söyletilir.
// Not: bu araç geliştirici içindir; kimin katil olduğunu "(suçlu)" diye gösterir.

import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {koyKur} from '../src/icerik/kur.js';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,sorular} from '../src/oyun/oyun.js';
import {yzKur,yerelSunucu} from '../src/yz/index.js';
import {onerilenSorular} from '../src/arayuz/soru-oneri.js';
import {kisiYazi} from '../src/diyalog/adlar.js';

const kok=new URL('..',import.meta.url).pathname;
const oku=async d=>Promise.all(fs.readdirSync(kok+d).filter(f=>f.endsWith('.js')&&f!=='index.js').sort().map(async f=>(await import(pathToFileURL(`${kok}${d}/${f}`))).default));
const kisiler=await oku('src/icerik/kisiler'), mekanlar=await oku('src/icerik/mekanlar');
const cekirdekler=fs.existsSync(kok+'src/icerik/olay-cekirdekleri')?(await oku('src/icerik/olay-cekirdekleri')).filter(x=>x&&x.id):[];
const koy={...koyKur(kisiler,mekanlar),cekirdekler};

const arg=process.argv.slice(2);
const al=(ad,v)=>{const i=arg.indexOf(ad); return i>=0&&arg[i+1]!=null?arg[i+1]:v;};
if(arg.includes('--yardim')||arg.includes('-h')){ console.log(fs.readFileSync(new URL(import.meta.url),'utf8').split('\n').filter(l=>l.startsWith('//')).map(l=>l.slice(3)).join('\n')); process.exit(0); }
const adres=al('--adres','http://localhost:1234'), model=al('--model',''), tohum=Number(al('--tohum',77)), N=Number(al('--n',12)), zaman=Number(al('--zaman',20000));
const ekSorular=arg.flatMap((a,i)=>a==='--soru'&&arg[i+1]?[arg[i+1]]:[]);

const uc=yerelSunucu({adres,model});
const yz=yzKur({arkaUc:uc,kisiler:koy.kisiler,zamanAsimi:zaman});
const b=baglamKur({tohum,koy});
const katil=new Set(b.vaka.cinayetler.flatMap(c=>[c.katil,c.yardimci]).filter(Boolean));
const ad=id=>kisiYazi(id)+(katil.has(id)?' (suçlu)':'');

const C=process.stdout.isTTY?{s:'\x1b[2m',y:'\x1b[32m',k:'\x1b[31m',b:'\x1b[1m',x:'\x1b[0m'}:{s:'',y:'',k:'',b:'',x:''};
const satir=(et,m)=>console.log(`  ${et.padEnd(11)}${m}`);
const sn=ms=>(ms/1000).toFixed(1)+' sn';

console.log(`${C.b}7 Days 7 Killers — yapay zekâ denemesi${C.x}  adres ${adres}  tohum ${tohum}  n ${N}`);
try{ console.log(`Model: ${await uc.modelBul()}`); }
catch(e){ console.log(`${C.k}Sunucuya ulaşılamadı (${e.message}). LM Studio'da sunucu açık mı? Adres doğru mu?${C.x}`); process.exit(1); }

const sayac={toplam:0,yz:0,red:0,zaman:0};
async function sozBas(p,soru,oyuncuSorusu=null){
  const r=await yz.soyle({kisi:p.kisi,soru:p.anlam?.soru??null,oyuncuSorusu,kalip:p.metin,tavir:p.anlam?.tavir,gerginlik:p.anlam?.gerginlik,tepki:p.tepki,yalan:p.anlam?.yalan??null});
  sayac.toplam++;
  satir('Soru',soru??C.s+'(kapıdan girer)'+C.x);
  satir('Kalıp',p.metin);
  satir('Yapay zekâ',r.ham??r.metin);
  const t=`tavır ${p.anlam?.tavir??'?'}${p.anlam?.yalan?' +yalan bilgisi':''}, ${sn(r.sure)}`;
  if(r.kaynak==='yz'||r.kaynak==='onbellek'){ sayac.yz++; satir('Denetim',`${C.y}geçti${C.x} (${t})`); }
  else if(/zaman/.test(r.neden||'')){ sayac.zaman++; satir('Denetim',`${C.k}zaman aşımı → kalıp${C.x} (${t})`); }
  else{ sayac.red++; satir('Denetim',`${C.k}reddedildi: ${r.neden} → kalıp${C.x} (${t})`); }
  console.log();
}

// Gün 1: fotoğraflardaki bütün izleri bul, sonra çağır.
let d=acilis(b,oyunBaslat({tohum})).durum;
d=uygula(b,d,{tur:'ilerle'}).durum;
for(const s of secenekler(b,d).filter(s=>s.eylem.tur==='incele')) d=uygula(b,d,s.eylem).durum;
d=uygula(b,d,{tur:'ilerle'}).durum;
const ilk=b.vaka.cinayetler.find(c=>c.fotografGunu<=1);
const sira=[...new Set([ilk?.katil,ilk?.bulunma?.bulan,...b.ids].filter(Boolean))];
let serbestYapildi=false, sayi=0;
for(const k of sira){
  if(sayi>=N||d.zaman.adim!=='cagirma') break;
  if(!secenekler(b,d).some(s=>s.eylem.tur==='cagir'&&s.eylem.kisi===k)) continue;
  console.log(`${C.b}── ${ad(k)} (${d.zaman.gun}. gün) ──${C.x}`);
  const r=uygula(b,d,{tur:'cagir',kisi:k}); d=r.durum;
  for(const p of r.goster.filter(p=>p.tur==='soz')){ await sozBas(p,null); sayi++; }
  if(!serbestYapildi){
    serbestYapildi=true;
    console.log(`${C.b}  Serbest sorular (${ad(k)})${C.x}`);
    const adaylar=sorular(b,d).map(q=>({id:q.id,etiket:q.etiket}));
    for(const m of ["dün gece neredeydin","Hacı Ağa'yı sevmez miydin","katil sen misin",...ekSorular]){
      const e=await yz.soruEsle({metin:m,adaylar,kisi:k});
      satir('Oyuncu',`«${m}»`);
      if(e.id==='yok'){
        satir('Eşleme',`yok${e.neden?' ('+e.neden+')':''}, ${sn(e.sure)}`);
        const c=await yz.kacamak({kisi:k,metin:m});
        satir('Kaçamak',`${c.metin} ${C.s}[${c.kaynak}${c.neden?': '+c.neden:''}]${C.x}`);
        console.log(); continue;
      }
      satir('Eşleme',`${e.id} — «${e.etiket}», ${sn(e.sure)}`);
      const x=uygula(b,d,{tur:'sor',soru:e.id,metin:m}); // denemedir: durum ilerletilmez
      const p=x.goster.find(p=>p.tur==='soz');
      if(p) await sozBas(p,`«${m}»`,m);
    }
  }
  const {oneri}=onerilenSorular(sorular(b,d),null);
  for(const q of oneri){
    if(sayi>=N||d.zaman.adim!=='sorgu') break;
    const x=uygula(b,d,{tur:'sor',soru:q.id}); d=x.durum;
    for(const p of x.goster.filter(p=>p.tur==='soz')){ await sozBas(p,q.etiket); sayi++; }
  }
  if(d.zaman.adim==='sorgu') d=uygula(b,d,{tur:'ilerle'}).durum;
}
console.log(`${C.b}Özet:${C.x} ${sayac.toplam} söz; yapay zekâ ${sayac.yz}, reddedilen ${sayac.red}, zaman aşımı ${sayac.zaman}.`);
