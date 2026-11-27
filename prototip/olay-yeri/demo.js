// Olay yeri fotoğrafı deneme sayfası: mekân seç, tohum değiştir, rastgele 3-4 iz koy, dokununca izin adını göster.
// Çift dokunma ya da tekerlek yakınlaştırır; yakındayken sürükleyerek gezilir, iki parmakla çimdiklenir.
import {fotografKur} from '/src/cizim/sahneler/olay-yeri/sahne.js';
import {gorunumKur,yakinlikDinle} from '/src/cizim/sahneler/olay-yeri/yakinlik.js';
import {MEKANLAR,IZLER} from '/src/cizim/sahneler/olay-yeri/kutuphane.js';
import {masaZemini} from '/src/cizim/sahneler/olay-yeri/masa-zemini.js';
import {rng} from '/src/cekirdek/rastgele.js';
import terimler from '/src/dil/tr/terimler.js';
import M,{izAdi} from './metin-tr.js';

const $=id=>document.getElementById(id);
const tuval=$('masa'), k=tuval.getContext('2d');
const durum={mekan:'degirmen', tohum:1943, kurban:true, izler:[], foto:null, masa:null, yaziZaman:0, R:0, bulunan:new Set()};
const gor=gorunumKur({enCok:4});

// rastgele iz üreticileri (parametreler deneme içindir; oyunda simülasyondan gelir)
const sec=(r,a)=>a[r()*a.length|0];
const URET={
  ip:r=>({renk:sec(r,['kirmizi','kirmizi','lacivert','yesil','sari'])}),
  'ayak-izi':r=>({tip:sec(r,['carik','carik','postal','cizme','yalin','nal','ters-nal']), sayi:2+(r()*2|0)}),
  alet:r=>({cesit:sec(r,['cekic','orak','kama','makas'])}),
  civi:r=>({sekil:sec(r,['cekic','orak','masa','cerceve'])}),
  saat:r=>({saat:`${String(r()*24|0).padStart(2,'0')}:${String((r()*12|0)*5).padStart(2,'0')}`}),
  devrik:r=>({cesit:sec(r,['gugum','lamba'])}),
  esya:r=>({cesit:sec(r,['dugme','tespih','cakmak','tabaka'])}),
  kan:r=>({buyukluk:sec(r,['kucuk','orta'])}),
  un:()=>({})
};
function izleriKaristir(tohum){
  const r=rng(tohum*7919+13), Mk=MEKANLAR[durum.mekan];
  const yuvalar=Object.keys(Mk.yuvalar).filter(a=>a!=='beden');
  for(let i=yuvalar.length-1;i>0;i--){const j=r()*(i+1)|0; [yuvalar[i],yuvalar[j]]=[yuvalar[j],yuvalar[i]];}
  const n=3+(r()*2|0), kullanilan=new Set(), izler=[];
  for(const y of yuvalar){
    if(izler.length>=n) break;
    const Y=Mk.yuvalar[y], uygun=Object.keys(URET).filter(t=>!kullanilan.has(t)&&IZLER[t].duzlemler.includes(Y.duzlem)&&!(Y.uygunsuz||[]).includes(t));
    if(!uygun.length) continue;
    const tur=sec(r,uygun); kullanilan.add(tur);
    izler.push({tur, yuva:y, kimlik:`${tur}-${izler.length+1}`, ...URET[tur](r)});
  }
  return izler;
}

// fotoğrafın durduğu alan (CSS pikseli): üst çubuk ile alt yazı arası
function alan(){
  const vw=innerWidth, vh=innerHeight, ust=$('karistir').closest('.ust').getBoundingClientRect().bottom, alt=56;
  return {x:8, y:ust+4, w:vw-16, h:vh-ust-alt-8};
}
function yerlesim(){return gor.yerlesim(alan());}
const dprAl=()=>Math.min(devicePixelRatio||1,2.5);
function fotoKur(){
  durum.R=gor.cozunurluk(alan(),dprAl(),4);
  durum.foto=fotografKur({mekan:durum.mekan, izler:durum.izler, tohum:durum.tohum, kurban:durum.kurban, cozunurluk:durum.R});
  for(const id of durum.bulunan) durum.foto.isaretle(id);
}
function kur(){
  const dpr=dprAl();
  tuval.width=Math.round(innerWidth*dpr); tuval.height=Math.round(innerHeight*dpr);
  durum.masa=document.createElement('canvas'); durum.masa.width=tuval.width; durum.masa.height=tuval.height;
  masaZemini(durum.masa.getContext('2d'),tuval.width,tuval.height,durum.tohum);
  fotoKur(); ciz();
}
function ciz(){
  const dpr=tuval.width/innerWidth;
  k.setTransform(1,0,0,1,0,0); k.drawImage(durum.masa,0,0);
  k.setTransform(dpr,0,0,dpr,0,0); durum.foto.ciz(k,yerlesim());
}
// yakınlık değişince hemen eski baskıyla çiz; durunca gerekirse daha keskin baskı kur
let keskinBekle=0;
function yakinlikDegisti(){
  ciz(); clearTimeout(keskinBekle);
  keskinBekle=setTimeout(()=>{if(gor.cozunurluk(alan(),dprAl(),4)!==durum.R){fotoKur(); ciz();}},220);
}
function yeniFoto(){durum.bulunan.clear(); gor.sifirla(); kur();}
function yaz(s){$('altyazi').textContent=s;}

function basla(){
  for(const id of Object.keys(MEKANLAR)){const o=document.createElement('option'); o.value=id; o.textContent=terimler.mekan[id]||id; $('mekan').append(o);}
  $('mekanEt').textContent=M.mekan; $('tohumEt').textContent=M.tohum; $('baska').textContent=M.baskaTohum; $('karistir').textContent=M.izKaristir; $('kurbanEt').textContent=M.kurban;
  document.title=M.baslik;
  const q=new URLSearchParams(location.search);
  if(q.get('mekan')&&MEKANLAR[q.get('mekan')]) durum.mekan=q.get('mekan');
  if(q.get('tohum')) durum.tohum=+q.get('tohum')||1;
  if(q.get('kurban')==='0') durum.kurban=false;
  $('mekan').value=durum.mekan; $('tohum').value=durum.tohum; $('kurban').checked=durum.kurban;
  durum.izler=izleriKaristir(durum.tohum);
  $('mekan').onchange=e=>{durum.mekan=e.target.value; durum.izler=izleriKaristir(durum.tohum); yeniFoto(); yaz(M.ipucu);};
  $('tohum').onchange=e=>{durum.tohum=+e.target.value||1; durum.izler=izleriKaristir(durum.tohum); yeniFoto();};
  $('baska').onclick=()=>{durum.tohum=1+(Math.random()*99999|0); $('tohum').value=durum.tohum; durum.izler=izleriKaristir(durum.tohum); yeniFoto(); yaz(M.ipucu);};
  $('karistir').onclick=()=>{durum.izler=izleriKaristir(durum.tohum+(Math.random()*999|0)); yeniFoto(); yaz(M.ipucu);};
  $('kurban').onchange=e=>{durum.kurban=e.target.checked; kur();};
  yakinlikDinle(tuval,gor,alan,{
    degisti:yakinlikDegisti,
    dokun(x,y){
      const p=durum.foto.ekrandanFotoya(x,y,tuval.width/innerWidth); if(!p) return;
      const id=durum.foto.izBul(p[0],p[1]);
      if(id){durum.bulunan.add(id); durum.foto.isaretle(id); ciz(); yaz(izAdi(durum.izler.find(i=>i.kimlik===id),M.iz));}
      else yaz(M.bos);
    }
  });
  let bekle=0; addEventListener('resize',()=>{clearTimeout(bekle); bekle=setTimeout(kur,150);});
  kur(); yaz(M.ipucu);
}
// Playwright ve konsoldan deneme: belirli izlerle kur, bölgeleri oku
window.olayYeri={
  get foto(){return durum.foto;}, get izler(){return durum.izler;},
  get gorunum(){return gor;},
  kur(o){Object.assign(durum,o); if(o.mekan) $('mekan').value=o.mekan; durum.bulunan.clear(); kur();},
  ekranda(kimlik){ // izin bölge merkezinin ekran (CSS piksel) koordinatı
    const b=durum.foto.bolgeler.find(x=>x.kimlik===kimlik), y=yerlesim(), f=durum.foto, s=y.genislik/f.genislik;
    const px=(b.x+42-f.genislik/2)*s, py=(b.y+42-f.yukseklik/2)*s, a=f.aci;
    return [y.x+px*Math.cos(a)-py*Math.sin(a), y.y+px*Math.sin(a)+py*Math.cos(a)];
  }
};
basla();
