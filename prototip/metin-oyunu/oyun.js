// Metin arayüzü: aynı oyun katmanını (src/oyun/oyun.js) tarayıcıda oynatır. Görsel yok; defter paneli,
// soru seçenekleri düğme olarak. Kayıt src/platform/kayit.js ile (localStorage). Metinler src/dil/tr/oyun.js'te.
import {koy as koyTemel} from '/src/icerik/index.js';
import {cekirdekListesi} from '/src/icerik/olay-cekirdekleri/index.js';
import {baglamKur,oyunBaslat,acilis,secenekler,uygula,defterGorunumu,durumKur,ekran,kisiListesi,hukumAdaylari} from '/src/oyun/oyun.js';
import {kaydet,yukle,sil,kayitVerisi} from '/src/platform/kayit.js';
import {doldur} from '/src/diyalog/kalip.js';
import {DIL_TR} from '/src/diyalog/adlar.js';

const koy={...koyTemel,cekirdekler:cekirdekListesi};
const A=DIL_TR.oyun.arayuz;
const $=id=>document.getElementById(id);
const el=(etiket,ozellik={},...cocuk)=>{const e=document.createElement(etiket); Object.assign(e,ozellik); for(const c of cocuk) e.append(c); return e;};

let b=null, d=null, sekme='ifadeler', secili=[], hukumSecimi=new Set(), hukumKipi=false;

$('baslik').textContent=A.baslik;
$('defterBaslik').textContent=A.defter;
$('defterAc').textContent=A.defter;
$('defterKapat').textContent=A.kapat;
$('yeni').textContent=A.yeniOyun;
$('defterAc').onclick=()=>$('defter').classList.add('acik');
$('defterKapat').onclick=()=>$('defter').classList.remove('acik');
$('yeni').onclick=()=>{sil(); girisEkrani();};

function yaz(goster,temizle=false){
  const g=$('gunluk');
  if(temizle) g.replaceChildren();
  for(const p of goster||[]){
    const e=el('p',{className:p.tur+' yeni'});
    if(p.tur==='soz') e.append(el('b',{textContent:DIL_TR.kisiler[p.kisi]?.lakap+': '}),'«'+p.metin+'»');
    else if(p.tur!=='ayrac') e.textContent=p.metin;
    if(p.tepki) e.dataset.gerginlik=p.tepki.gerginlik; // çizim katmanı için hazır veri
    g.append(e);
  }
  // Günlük çok uzamasın: son 220 satır kalır (her şey zaten defterde).
  while(g.children.length>220) g.firstChild.remove();
}

async function kaydetSessiz(){
  const r=await kaydet(kayitVerisi({zaman:d.zaman,defter:d.defter}));
  if(!r.tamam) console.warn(A.kayitHata,r);
}

function eylemYap(e){
  const r=uygula(b,d,e);
  d=r.durum;
  yaz(r.goster);
  if(e.tur==='karsilastir'&&r.celiski) secili=[];
  kaydetSessiz();
  ciz();
  if(e.tur!=='karsilastir'&&e.tur!=='isaretle') $('secenekler').scrollIntoView({block:'end',behavior:'smooth'});
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
  for(const s of secenekler(b,d)){
    const bt=el('button',{type:'button',textContent:s.etiket,className:s.eylem.tur==='ilerle'||s.eylem.tur==='geriSar'?'ana':''});
    bt.onclick=()=>{
      if(s.eylem.tur==='hukum'){hukumKipi=true; hukumSecimi=new Set(); seceneklerCiz(); return;}
      eylemYap(s.eylem);
    };
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
