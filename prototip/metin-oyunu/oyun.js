// Metin arayüzü: aynı oyun katmanını (src/oyun/oyun.js) tarayıcıda oynatır. Görsel yok; defter paneli,
// soru seçenekleri düğme olarak. Kayıt src/platform/kayit.js ile (localStorage). Metinler src/dil/tr/oyun.js'te.
// Sorguda en çok 3 önerilen soru (src/arayuz/soru-oneri.js), kalanlar katlanmış "Başka soru" listesinde; yapay zekâ
// açıksa (src/arayuz/yz-ayar.js) oyuncu kendi sorusunu yazabilir ve sözler karakterin ağzından söylenir.
import {koy as koyTemel} from '/src/icerik/index.js';
import {cekirdekListesi} from '/src/icerik/olay-cekirdekleri/index.js';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,defterGorunumu,durumKur,ekran,kisiListesi,hukumAdaylari,sorular} from '/src/oyun/oyun.js';
import {onerilenSorular} from '/src/arayuz/soru-oneri.js';
import {yzAyarOku,yzAyarYaz,yzOlustur,sozSoylet} from '/src/arayuz/yz-ayar.js';
import {kaydet,yukle,sil,kayitVerisi} from '/src/platform/kayit.js';
import {doldur} from '/src/diyalog/kalip.js';
import {DIL_TR} from '/src/diyalog/adlar.js';

const koy={...koyTemel,cekirdekler:cekirdekListesi};
const A=DIL_TR.oyun.arayuz;
const $=id=>document.getElementById(id);
const el=(etiket,ozellik={},...cocuk)=>{const e=document.createElement(etiket); Object.assign(e,ozellik); for(const c of cocuk) e.append(c); return e;};

let b=null, d=null, sekme='ifadeler', secili=[], hukumSecimi=new Set(), hukumKipi=false;
// Sorgu: önceki turda listede olan sorular (yeni açılanları öne almak için) ve yapay zekâ beklerken kilit.
let onceki=null, oncekiSorgu=null, kilit=false;
let yzAyar=yzAyarOku(), yz=yzOlustur(yzAyar,{kisiler:koy.kisiler});
const azHareket=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}})();

$('baslik').textContent=A.baslik;
$('defterBaslik').textContent=A.defter;
$('defterAc').textContent=A.defter;
$('defterKapat').textContent=A.kapat;
$('yeni').textContent=A.yeniOyun;
$('defterAc').onclick=()=>$('defter').classList.add('acik');
$('defterKapat').onclick=()=>$('defter').classList.remove('acik');
$('yeni').onclick=()=>{sil(); girisEkrani();};
$('yzAc').textContent=A.yzAyar;
$('yzAc').onclick=()=>{const k=$('yzAyar'); k.hidden=!k.hidden; if(!k.hidden) ayarCiz();};

// Yapay zekâ ayarı: kapalı / yerel sunucu (adres, model). localStorage'da durur.
function ayarCiz(){
  const k=$('yzAyar'); k.replaceChildren();
  const ad='yzKip';
  const secim=(deger,yazi)=>{const r=el('input',{type:'radio',name:ad,value:deger,checked:yzAyar.kip===deger}); return el('label',{className:'secim'},r,el('span',{textContent:yazi}));};
  const adres=el('input',{type:'url',value:yzAyar.adres,spellcheck:false});
  const model=el('input',{type:'text',value:yzAyar.model,spellcheck:false});
  const alan=el('div',{className:'alanlar'},el('label',{},el('span',{textContent:A.yzAdres}),adres),el('label',{},el('span',{textContent:A.yzModel}),model));
  const kip=()=>k.querySelector('input[name="yzKip"]:checked')?.value==='yerel'?'yerel':'kapali';
  const guncelle=()=>{alan.hidden=kip()!=='yerel';};
  const kaydet=el('button',{type:'button',className:'ana',textContent:A.yzKaydet});
  kaydet.onclick=()=>{
    yzAyar={kip:kip(),adres:adres.value.trim()||'http://localhost:1234',model:model.value.trim()};
    yzAyarYaz(yzAyar); yz=yzOlustur(yzAyar,{kisiler:koy.kisiler}); k.hidden=true; yzDurumYaz(); if(d) ciz();
  };
  k.append(el('div',{className:'secimler'},secim('kapali',A.yzKapali),secim('yerel',A.yzYerel)),alan,kaydet);
  k.onchange=guncelle; guncelle();
}
function yzDurumYaz(){ $('yzAc').title=yz.acik?doldur(A.yzDurumAcik,{adres:yzAyar.adres}):A.yzDurumKapali; $('yzAc').classList.toggle('acik',yz.acik); }
yzDurumYaz();

function satirKur(p){
  const e=el('p',{className:p.tur+' yeni'});
  if(p.tur==='soz') e.append(el('b',{textContent:DIL_TR.kisiler[p.kisi]?.lakap+': '}),'«'+p.metin+'»');
  else if(p.tur!=='ayrac') e.textContent=p.metin;
  if(p.tepki) e.dataset.gerginlik=p.tepki.gerginlik;
  return e;
}
// Yapay zekâ söyletirken: söz satırı önce "…" ile açılır, cümle gelince harf harf yazılır.
async function sozYaz(p,soz){
  const g=$('gunluk');
  const e=el('p',{className:'soz yeni'},el('b',{textContent:DIL_TR.kisiler[p.kisi]?.lakap+': '}));
  const m=el('span',{className:'dusunuyor',textContent:A.dusunuyor});
  e.append(m); g.append(e);
  if(p.tepki) e.dataset.gerginlik=p.tepki.gerginlik;
  e.scrollIntoView({block:'nearest'});
  const s=await soz;
  m.className='';
  const metin='«'+s.metin+'»';
  if(azHareket){m.textContent=metin; return;}
  for(let i=1;i<=metin.length;i++){ m.textContent=metin.slice(0,i); await new Promise(r=>setTimeout(r,18)); }
}
async function yazYz(goster,{oyuncuSorusu=null,soruGizle=false}={}){
  const sozler=new Map((goster||[]).filter(p=>p.tur==='soz').map(p=>[p,sozSoylet(yz,p,{tohum:b.tohum,dongu:d.zaman.dongu,oyuncuSorusu})]));
  for(const p of goster||[]){
    if(soruGizle&&p.tur==='soru') continue;
    if(p.tur==='soz') await sozYaz(p,sozler.get(p));
    else $('gunluk').append(satirKur(p));
  }
}

function yaz(goster,temizle=false){
  const g=$('gunluk');
  if(temizle) g.replaceChildren();
  for(const p of goster||[]) g.append(satirKur(p));
  // Günlük çok uzamasın: son 220 satır kalır (her şey zaten defterde).
  while(g.children.length>220) g.firstChild.remove();
}

async function kaydetSessiz(){
  const r=await kaydet(kayitVerisi({zaman:d.zaman,defter:d.defter}));
  if(!r.tamam) console.warn(A.kayitHata,r);
}

async function eylemYap(e,{oyuncuSorusu=null,soruGizle=false}={}){
  const r=uygula(b,d,e);
  d=r.durum;
  if(e.tur==='karsilastir'&&r.celiski) secili=[];
  kaydetSessiz();
  if(yz.acik&&r.goster.some(p=>p.tur==='soz'&&p.anlam)){
    kilit=true; ciz();
    try{ await yazYz(r.goster,{oyuncuSorusu,soruGizle}); } finally{ kilit=false; }
  }else yaz(soruGizle?r.goster.filter(p=>p.tur!=='soru'):r.goster);
  ciz();
  if(e.tur!=='karsilastir'&&e.tur!=='isaretle') $('secenekler').scrollIntoView({block:'end',behavior:'smooth'});
}

// Oyuncunun kendi sorusu: yapay zekâ hazır sorulardan birine eşler (cevabı motor verir); eşlenmezse karakter kaçamak
// konuşur ve deftere bir şey girmez.
async function serbestSor(metin){
  kilit=true; ciz();
  try{
    yaz([{tur:'soru',metin}]);
    const kisi=d.zaman.sorgudaki;
    const adaylar=sorular(b,d).map(q=>({id:q.id,etiket:q.etiket}));
    const g=$('gunluk'), bekle=el('p',{className:'sahne yeni'},el('span',{className:'dusunuyor',textContent:A.dusunuyor}));
    g.append(bekle);
    const e=await yz.soruEsle({metin,adaylar,kisi}).catch(()=>({id:'yok'}));
    bekle.remove();
    if(e.id!=='yok'&&adaylar.some(a=>a.id===e.id)){ kilit=false; await eylemYap({tur:'sor',soru:e.id,metin},{oyuncuSorusu:metin,soruGizle:true}); return; }
    await sozYaz({kisi},yz.kacamak({kisi,metin,anahtar:`${b.tohum}|${d.zaman.dongu}|${d.zaman.gun}`}));
  }finally{ kilit=false; ciz(); }
}

function durumCiz(){
  const z=d.zaman;
  const parca=[doldur(A.gun,{gun:z.gun}),doldur(A.dongu,{n:z.dongu})];
  if(['cagirma','sorgu','fotograf','gun-basi'].includes(z.adim)) parca.push(doldur(A.hak,{n:z.sorguKalan}));
  $('durum').textContent=A.altBaslik+' · '+parca.join(' · ');
}

function seceneklerCiz(){
  const k=$('secenekler'); k.replaceChildren();
  if(d.zaman.adim==='bitti') return;
  if(hukumKipi){
    k.append(el('div',{className:'not',textContent:doldur(A.hukumBaslik,{n:hukumSecimi.size})}));
    const izgara=el('div',{className:'hukum'});
    for(const id of hukumAdaylari(b,d)){
      const bt=el('button',{type:'button',textContent:DIL_TR.kisiler[id].lakap});
      bt.setAttribute('aria-pressed',hukumSecimi.has(id));
      bt.onclick=()=>{hukumSecimi.has(id)?hukumSecimi.delete(id):hukumSecimi.size<7&&hukumSecimi.add(id); seceneklerCiz();};
      izgara.append(bt);
    }
    k.append(izgara);
    const onay=el('button',{type:'button',className:'ana',textContent:A.hukumOnay,disabled:hukumSecimi.size!==7});
    onay.onclick=()=>{hukumKipi=false; eylemYap({tur:'hukum',kisiler:[...hukumSecimi]});};
    k.append(onay);
    return;
  }
  if(kilit) return;
  if(d.zaman.adim==='sorgu') return sorguSecenekleri(k);
  // Çağırma seçenekleri (24 kişi) sıkışık ızgarada, öbürleri alt alta.
  const izgara=el('div',{className:'izgara'});
  for(const s of secenekler(b,d)){
    const bt=el('button',{type:'button',textContent:s.etiket,className:s.eylem.tur==='ilerle'||s.eylem.tur==='geriSar'?'ana':''});
    bt.onclick=()=>{
      if(s.eylem.tur==='hukum'){hukumKipi=true; hukumSecimi=new Set(); seceneklerCiz(); return;}
      eylemYap(s.eylem);
    };
    if(s.eylem.tur==='cagir'){ if(!izgara.parentNode) k.append(izgara); izgara.append(bt); }
    else k.append(bt);
  }
}

// Sorgu: en çok 3 önerilen soru, kalanlar katlanmış "Başka soru" listesinde, kendi sorusu (yapay zekâ açıkken), bitir.
function sorguSecenekleri(k){
  const z=d.zaman, sorgu=`${z.dongu}|${z.gun}|${z.sorgudaki}`;
  if(sorgu!==oncekiSorgu){onceki=null; oncekiSorgu=sorgu;}
  const l=secenekler(b,d);
  const sorS=new Map(l.filter(s=>s.eylem.tur==='sor').map(s=>[s.eylem.soru,s]));
  const liste=sorular(b,d).filter(q=>sorS.has(q.id));
  const {oneri,diger}=onerilenSorular(liste,onceki);
  onceki=new Set(liste.map(q=>q.id));
  const sd=q=>{const bt=el('button',{type:'button',textContent:q.etiket}); bt.onclick=()=>eylemYap(sorS.get(q.id).eylem); return bt;};
  for(const q of oneri) k.append(sd(q));
  if(diger.length){
    const dt=el('details',{className:'baska'},el('summary',{textContent:doldur(A.baskaSoru,{n:diger.length})}));
    const ic=el('div',{className:'baska-liste'}); for(const q of diger) ic.append(sd(q));
    dt.append(ic); k.append(dt);
  }
  if(yz.acik){
    const giris=el('input',{type:'text',maxLength:200,placeholder:A.kendiSorun,autocomplete:'off'});
    giris.setAttribute('aria-label',A.kendiSorun);
    const form=el('form',{className:'serbest'},giris,el('button',{type:'submit',textContent:A.sor}));
    form.onsubmit=ev=>{ev.preventDefault(); const m=giris.value.trim(); if(m) serbestSor(m);};
    k.append(form);
  }
  for(const s of l){
    if(s.eylem.tur==='sor') continue;
    const bt=el('button',{type:'button',textContent:s.etiket,className:'ana'});
    bt.onclick=()=>eylemYap(s.eylem);
    k.append(bt);
  }
}

function defterCiz(){
  const g=defterGorunumu(b,d);
  const S=$('sekmeler'); S.replaceChildren();
  for(const [ad,yazi] of Object.entries(A.sekmeler)){
    const bt=el('button',{type:'button',textContent:yazi+(g[ad]?` (${g[ad].length})`:'')});
    bt.setAttribute('aria-pressed',sekme===ad);
    bt.onclick=()=>{sekme=ad; defterCiz();};
    S.append(bt);
  }
  const L=$('liste'); L.replaceChildren();
  const K=$('karsilastir'); K.replaceChildren();
  if(sekme==='kisiler'){
    for(const k of kisiListesi(b,d)){
      const sat=el('div',{className:'satir kisi'});
      sat.append(el('span',{className:'ad'+(k.canli?'':' olu'),textContent:k.ad+(k.canli?'':' ('+A.olu+')')}));
      const dg=el('span',{className:'dugmeler'});
      for(const [is,yazi] of [['supheli',A.supheli],['temiz',A.temiz]]){
        const bt=el('button',{type:'button',className:is,textContent:yazi});
        bt.setAttribute('aria-pressed',k.isaret===is);
        bt.onclick=()=>eylemYap({tur:'isaretle',kisi:k.id,isaret:k.isaret===is?null:is});
        dg.append(bt);
      }
      sat.append(dg); L.append(sat);
    }
    return;
  }
  const l=g[sekme]||[];
  if(!l.length) L.append(el('div',{className:'satir',textContent:A.bos}));
  if(sekme==='ifadeler'){
    for(const f of [...l].reverse()){
      const cb=el('input',{type:'checkbox',checked:secili.includes(f.id)});
      cb.onchange=()=>{secili=cb.checked?[...secili.filter(x=>x!==f.id),f.id].slice(-2):secili.filter(x=>x!==f.id); defterCiz();};
      L.append(el('div',{className:'satir'},el('label',{},cb,el('span',{textContent:f.metin}))));
    }
    K.append(el('span',{textContent:A.karsilastirIpucu}));
    const bt=el('button',{type:'button',textContent:A.karsilastir,disabled:secili.length!==2});
    bt.onclick=()=>eylemYap({tur:'karsilastir',a:secili[0],b:secili[1]});
    const tm=el('button',{type:'button',textContent:A.secimTemizle,disabled:!secili.length});
    tm.onclick=()=>{secili=[]; defterCiz();};
    K.append(bt,tm);
    return;
  }
  for(const x of l) L.append(el('div',{className:'satir',textContent:x.metin}));
}

function ciz(){durumCiz(); seceneklerCiz(); defterCiz();}

function oyunaGir(tohum,durum=null){
  b=baglamKur({tohum,koy});
  secili=[]; hukumKipi=false;
  if(durum){ d=durum; yaz(ekran(b,d),true); }
  else{ const a=acilis(b,oyunBaslat({tohum})); d=a.durum; yaz(a.goster,true); kaydetSessiz(); }
  ciz();
}

function girisEkrani(kayitli=null){
  $('gunluk').replaceChildren(...DIL_TR.oyun.akis.acilis.slice(0,1).map(m=>el('p',{className:'baslik',textContent:m})));
  $('secenekler').replaceChildren();
  $('durum').textContent=A.altBaslik;
  const kutu=el('div',{className:'giris'});
  if(kayitli){
    kutu.append(el('span',{className:'not',textContent:doldur(A.devam,{gun:kayitli.zaman.gun,n:kayitli.zaman.dongu})}));
    const dv=el('button',{type:'button',className:'ana',textContent:'▶'});
    dv.onclick=()=>oyunaGir(kayitli.zaman.tohum,durumKur(kayitli));
    kutu.append(dv);
  }
  const tohum=el('input',{type:'number',value:String(Number(new URLSearchParams(location.search).get('tohum'))||Math.floor(Math.random()*100000)),ariaLabel:A.tohum});
  const bs=el('button',{type:'button',textContent:A.basla});
  bs.onclick=()=>oyunaGir(Number(tohum.value)||1);
  kutu.append(el('span',{textContent:A.tohum}),tohum,bs);
  $('secenekler').append(kutu);
}

const y=await yukle();
const istenen=new URLSearchParams(location.search).get('tohum');
if(istenen&&!(y.tamam&&y.veri.tohum===Number(istenen))) oyunaGir(Number(istenen));
else girisEkrani(y.tamam?y.veri:null);
