// Olay yeri fotoğrafı deneme sayfası: mekân seç, tohum değiştir, rastgele 3-4 iz koy, dokununca izin adını göster.
import {fotografKur} from '/src/cizim/sahneler/olay-yeri/sahne.js';
import {MEKANLAR,IZLER} from '/src/cizim/sahneler/olay-yeri/kutuphane.js';
import {masaZemini} from '/src/cizim/sahneler/olay-yeri/masa-zemini.js';
import {rng} from '/src/cekirdek/rastgele.js';
import terimler from '/src/dil/tr/terimler.js';
import M from './metin-tr.js';

const $=id=>document.getElementById(id);
const tuval=$('masa'), k=tuval.getContext('2d');
const durum={mekan:'degirmen', tohum:1943, kurban:true, izler:[], foto:null, masa:null, yaziZaman:0};

// rastgele iz üreticileri (parametreler deneme içindir; oyunda simülasyondan gelir)
const sec=(r,a)=>a[r()*a.length|0];
const URET={
  ip:r=>({renk:sec(r,['kirmizi','kirmizi','lacivert','yesil','sari'])}),
  'ayak-izi':r=>({cesit:sec(r,['cizme','carik','ayak']), sayi:2+(r()*2|0)}),
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
  const yuvalar=Object.keys(Mk.yuvalar).filter(a=>a!=='beden').sort(()=>r()-.5);
  const n=3+(r()*2|0), kullanilan=new Set(), izler=[];
  for(const y of yuvalar){
    if(izler.length>=n) break;
    const uygun=Object.keys(URET).filter(t=>!kullanilan.has(t)&&IZLER[t].duzlemler.includes(Mk.yuvalar[y].duzlem));
    if(!uygun.length) continue;
    const tur=sec(r,uygun); kullanilan.add(tur);
    izler.push({tur, yuva:y, kimlik:`${tur}-${izler.length+1}`, ...URET[tur](r)});
  }
  return izler;
}
function izAdi(iz){
  const m=M.iz[iz.tur]; if(!m) return iz.tur;
  if(typeof m==='string') return m.replace('{renk}',M.renk[iz.renk]||'').replace('{saat}',iz.saat||'');
  return m[iz.cesit||iz.sekil]||iz.tur;
}

function yerlesim(){
  const vw=innerWidth, vh=innerHeight, ust=$('karistir').closest('.ust').getBoundingClientRect().bottom, alt=56;
  const W=1084, H=834, ag=vw-16, ay=vh-ust-alt-8;
  const g=Math.min(ag,ay*W/H);
  return {x:vw/2, y:ust+4+ay/2, genislik:g};
}
function kur(){
  const dpr=Math.min(devicePixelRatio||1,2.5), y=yerlesim();
  tuval.width=Math.round(innerWidth*dpr); tuval.height=Math.round(innerHeight*dpr);
  durum.masa=document.createElement('canvas'); durum.masa.width=tuval.width; durum.masa.height=tuval.height;
  masaZemini(durum.masa.getContext('2d'),tuval.width,tuval.height,durum.tohum);
  durum.foto=fotografKur({mekan:durum.mekan, izler:durum.izler, tohum:durum.tohum, kurban:durum.kurban, cozunurluk:Math.min(3,y.genislik*dpr/1084)});
  ciz();
}
function ciz(){
  const dpr=tuval.width/innerWidth;
  k.setTransform(1,0,0,1,0,0); k.drawImage(durum.masa,0,0);
  k.setTransform(dpr,0,0,dpr,0,0); durum.foto.ciz(k,yerlesim());
}
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
  $('mekan').onchange=e=>{durum.mekan=e.target.value; durum.izler=izleriKaristir(durum.tohum); kur(); yaz(M.ipucu);};
  $('tohum').onchange=e=>{durum.tohum=+e.target.value||1; durum.izler=izleriKaristir(durum.tohum); kur();};
  $('baska').onclick=()=>{durum.tohum=1+(Math.random()*99999|0); $('tohum').value=durum.tohum; durum.izler=izleriKaristir(durum.tohum); kur(); yaz(M.ipucu);};
  $('karistir').onclick=()=>{durum.izler=izleriKaristir(durum.tohum+(Math.random()*999|0)); kur(); yaz(M.ipucu);};
  $('kurban').onchange=e=>{durum.kurban=e.target.checked; kur();};
  tuval.addEventListener('pointerdown',e=>{
    const p=durum.foto.ekrandanFotoya(e.clientX,e.clientY,tuval.width/innerWidth); if(!p) return;
    const id=durum.foto.izBul(p[0],p[1]);
    if(id){durum.foto.isaretle(id); ciz(); yaz(izAdi(durum.izler.find(i=>i.kimlik===id)));}
    else yaz(M.bos);
  });
  let bekle=0; addEventListener('resize',()=>{clearTimeout(bekle); bekle=setTimeout(kur,150);});
  kur(); yaz(M.ipucu);
}
// Playwright ve konsoldan deneme: belirli izlerle kur, bölgeleri oku
window.olayYeri={
  get foto(){return durum.foto;}, get izler(){return durum.izler;},
  kur(o){Object.assign(durum,o); if(o.mekan) $('mekan').value=o.mekan; kur();},
  ekranda(kimlik){ // izin bölge merkezinin ekran (CSS piksel) koordinatı
    const b=durum.foto.bolgeler.find(x=>x.kimlik===kimlik), y=yerlesim(), f=durum.foto, s=y.genislik/f.genislik;
    const px=(b.x+42-f.genislik/2)*s, py=(b.y+42-f.yukseklik/2)*s, a=f.aci;
    return [y.x+px*Math.cos(a)-py*Math.sin(a), y.y+px*Math.sin(a)+py*Math.cos(a)];
  }
};
basla();
