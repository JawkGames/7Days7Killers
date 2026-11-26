// Olay yeri fotoğrafı: mekân şablonu + yuvalara yerleşen izler + (istenirse) örtülü kurban → masada duran kâğıt baskı.
import {c,hedefAyarla} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {FOTO,ISARET} from './ayar.js';
import {kameraKur} from './perspektif.js';
import {tabanAyarla,tabana} from './kalem.js';
import {yerlestir} from './yerlesim.js';
import {tonla,yipranma,kagitKur} from './baski.js';
import {kurbanCiz} from './kurban.js';
import {MEKANLAR,IZLER} from './kutuphane.js';

// metinden tohum (iz kimliği her fotoğrafta aynı sapmayı alsın diye)
const karma=(s,t)=>{let h=t|0; for(const ch of String(s)) h=Math.imul(h^ch.charCodeAt(0),2654435761); return h>>>0;};

export function mekanBul(m){const M=typeof m==='string'?MEKANLAR[m]:m; if(!M) throw new Error('Bilinmeyen mekân: '+m); return M;}

// Yuvanın fotoğraftaki yeri ve ölçeği (simülasyon ve araçlar için): {x, y, olcek (birim/cm), duzlem, yuzey}
export function yuvaBilgisi(mekan,ad){
  const M=mekanBul(mekan), y=M.yuvalar[ad]; if(!y) throw new Error(`${M.id}: yuva yok: ${ad}`);
  const P=kameraKur(M.kamera), s=P.n(...y.konum);
  return {x:s[0], y:s[1], olcek:P.olcek(...y.konum), duzlem:y.duzlem, yuzey:y.yuzey, alan:y.alan||12};
}

// izler: [{tur, yuva, kimlik, ...parametreler}]. kurban: true | false | {yuva:'beden', ortu:'kilim'|'cul', aci}
// cozunurluk: fotoğraf birimi başına piksel (ekran genişliği ve dpr'ye göre seçilir)
export function fotografKur({mekan,izler=[],tohum=1,kurban=true,cozunurluk=1.2}){
  const M=mekanBul(mekan), P=kameraKur(M.kamera), isik=M.isik, R=cozunurluk;
  const W=FOTO.genislik, H=FOTO.yukseklik;
  const t=document.createElement('canvas'); t.width=Math.ceil(W*R); t.height=Math.ceil(H*R);
  const k=t.getContext('2d'), eski=c, nesneler=[];
  hedefAyarla(k);
  try{
    tabanAyarla(new DOMMatrix([R,0,0,R,0,0])); tabana();
    M.ciz(P,rng(tohum*31+1));
    if(kurban){
      const kb=kurban===true?{}:kurban, yuva=M.yuvalar[kb.yuva||'beden'];
      if(yuva){const rk=rng(tohum*17+5); nesneler.push({kurban:true, d:P.derinlik(...yuva.konum), ciz:()=>kurbanCiz(P,isik,yuva,{ortu:kb.ortu||yuva.ortu||'kilim', aci:(kb.aci??yuva.aci??0)+(rk()-.5)*.12},rk)});}
    }
    const sayac={};
    for(const iz of izler){
      const tanim=IZLER[iz.tur]; if(!tanim) throw new Error('Bilinmeyen iz türü: '+iz.tur);
      const yuva=M.yuvalar[iz.yuva]; if(!yuva) throw new Error(`${M.id}: yuva yok: ${iz.yuva}`);
      if(tanim.duzlemler&&!tanim.duzlemler.includes(yuva.duzlem)) throw new Error(`${iz.tur} izi ${yuva.duzlem} düzlemine konamaz (${iz.yuva})`);
      const ri=rng(karma(iz.kimlik??iz.tur,tohum)), alan=yuva.alan??12, kap=tanim.kapsam(iz,yuva);
      const n=sayac[iz.yuva]=(sayac[iz.yuva]||0)+1; // aynı yuvadaki ikinci, üçüncü iz yana kayar
      const yan=n>1?(n%2?1:-1)*Math.ceil((n-1)/2)*(kap.r*1.9+6):0;
      const sapma={du:(ri()-.5)*2*alan+yan, dv:(ri()-.5)*2*alan*.6, aci:(iz.yon||0)+(tanim.serbestAci?ri()*TAU:(ri()-.5)*2*(tanim.aciSapma??.25))};
      const kk=yerlestir(P,isik,yuva,sapma), g=tanim.kur(iz,ri,kk);
      const mrk=kk.nokta(kap.dx||0,kap.dy||0,kap.h||0), rr=Math.max(kap.r*kk.olcek,FOTO.enAzBolge);
      nesneler.push({iz,tanim,k:kk,g,d:P.derinlik(...kk.O)-(yuva.duzlem==='zemin'?0:1),
        bolge:{kimlik:iz.kimlik, tur:iz.tur, sekil:'daire', x:mrk[0], y:mrk[1], r:rr}});
    }
    nesneler.sort((a,b)=>b.d-a.d);
    for(const o of nesneler){tabana(); c.save(); if(o.kurban) o.ciz(); else o.tanim.ciz(o.k,o.g,o.iz); c.restore();}
    tabana(); if(M.ustCiz) M.ustCiz(P,rng(tohum*31+2));
    c.setTransform(1,0,0,1,0,0); tonla(k,t.width,t.height,tohum);
    // seçici renk: parlaklık baskıdan kalır, yalnızca ton gelir
    c.save(); c.globalCompositeOperation='color';
    for(const o of nesneler) if(o.tanim&&o.tanim.renk){tabana(); c.save(); o.tanim.renk(o.k,o.g,o.iz); c.restore();}
    c.restore();
    tabana(); yipranma(k,tohum);
  }finally{hedefAyarla(eski);}

  const baski=kagitKur(t,R,tohum), bolgeler=nesneler.filter(o=>o.bolge).map(o=>o.bolge);
  const isaretler=new Set(), ra=rng(tohum*5+9), aci=(ra()-.5)*.05;
  let sonMatris=null;

  const f={
    mekan:M.id, tohum, bolgeler, isaretler, aci, tuval:baski.tuval,
    genislik:baski.genislik, yukseklik:baski.yukseklik, // baskının (kenar dahil) fotoğraf birimi ölçüsü
    // fotoğraf koordinatındaki noktaya dokunulan izin kimliği (yoksa null). Birden çok bölge varsa merkezi en yakın olan.
    izBul(x,y){
      let en=null, enD=Infinity;
      for(const b of bolgeler){
        let d;
        if(b.sekil==='daire') d=Math.hypot(x-b.x,y-b.y)/b.r;
        else d=Math.max(Math.abs(x-b.x)/(b.g/2),Math.abs(y-b.y)/(b.y2/2));
        if(d<=1&&d<enD){en=b; enD=d;}
      }
      return en?en.kimlik:null;
    },
    isaretle(kimlik){if(bolgeler.some(b=>b.kimlik===kimlik)) isaretler.add(kimlik); return f;},
    // hedef bağlama çizer: (x,y) baskı merkezi, genislik baskının kenar dahil genişliği (bağlamın birimi)
    ciz(hk,{x,y,genislik}){
      const s=genislik/baski.genislik, K=FOTO.kenar;
      hk.save(); hk.translate(x,y); hk.rotate(aci); hk.scale(s,s); hk.translate(-baski.genislik/2,-baski.yukseklik/2);
      sonMatris=hk.getTransform();
      const ds=Math.hypot(sonMatris.a,sonMatris.b); // aygıt pikseli / baskı birimi (gölge ölçüleri dönüşümden etkilenmez)
      // masaya düşen gölge
      hk.save(); hk.shadowColor='rgba(0,0,0,.78)'; hk.shadowBlur=16*ds; hk.shadowOffsetX=5*ds; hk.shadowOffsetY=9*ds;
      hk.drawImage(baski.tuval,0,0,baski.genislik,baski.yukseklik); hk.restore();
      // masa lambasının ışığı: üst sol aydınlık, alt sağ kararır
      hk.save(); hk.globalCompositeOperation='multiply';
      const g=hk.createRadialGradient(baski.genislik*.3,baski.yukseklik*.22,40,baski.genislik*.45,baski.yukseklik*.45,baski.genislik*.85);
      g.addColorStop(0,'rgb(255,250,236)'); g.addColorStop(1,'rgb(128,120,102)');
      hk.fillStyle=g; hk.fillRect(0,0,baski.genislik,baski.yukseklik);
      hk.restore();
      // bulunan izler: kopya kalemiyle ince halka
      hk.translate(K,K);
      for(const b of bolgeler) if(isaretler.has(b.kimlik)) halka(hk,b,ds);
      hk.restore();
    },
    // hedef bağlamın biriminden fotoğraf koordinatına. oran: aygıt pikseli / olay birimi (ör. devicePixelRatio)
    ekrandanFotoya(ex,ey,oran=1){
      if(!sonMatris) return null;
      const q=sonMatris.inverse().transformPoint(new DOMPoint(ex*oran,ey*oran));
      return [q.x-FOTO.kenar,q.y-FOTO.kenar];
    }
  };
  return f;
}

// El çizimi halka: biraz taşan, kapanırken üst üste binen elips
function halka(hk,b,olcek){
  const r=rng(karma(b.kimlik,77)), rx=(b.sekil==='daire'?b.r:b.g/2)*ISARET.pay, ry=(b.sekil==='daire'?b.r:b.y2/2)*ISARET.pay*.86;
  const a0=r()*TAU, don=(r()-.5)*.5;
  hk.save(); hk.translate(b.x,b.y); hk.rotate(don); hk.lineCap='round';
  for(let kat=0;kat<2;kat++){
    hk.beginPath();
    for(let i=0;i<=60;i++){
      const f=i/60, a=a0+f*TAU*1.1, w=1+(r()-.5)*.03+Math.sin(f*7+kat)*.02;
      const x=Math.cos(a)*rx*w*(1+f*.06), y=Math.sin(a)*ry*w*(1+f*.06);
      if(i) hk.lineTo(x,y); else hk.moveTo(x,y);
    }
    hk.strokeStyle=rgba(ISARET.renk,ISARET.alfa*(kat?.45:1)); hk.lineWidth=Math.max(ISARET.kalin,1.4/olcek)*(kat?.7:1); hk.stroke();
  }
  hk.restore();
}
