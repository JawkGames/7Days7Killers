// Yakınlaştırılmış görünüm: telefonda dikey ekranda fotoğraf küçük kalır; oyuncu yakınlaştırıp sürükleyerek gezer.
// Sahne arayüzü değişmez: fotografKur dönüşündeki ciz(ctx,{x,y,genislik}) zaten büyük genişlik ve kaydırılmış merkez
// alır, ekrandanFotoya da son çizimin dönüşümünü tersine çevirir. Buradaki yardımcı yalnızca yakınlık/kaydırma
// durumunu tutar, sınırlar ve ciz için {x,y,genislik} üretir; girdi bağlayıcısı (tekerlek, çift dokunma, iki parmak,
// sürükleme) isteğe bağlıdır.
import {FOTO} from './ayar.js';

const ORAN=(FOTO.genislik+2*FOTO.kenar)/(FOTO.yukseklik+2*FOTO.kenar); // baskının en/boy oranı (kenar dahil)

// alan: {x,y,w,h} bağlam birimi (CSS pikseli). Dönüş: durum ve yöntemler.
export function gorunumKur({enAz=1,enCok=4,pay=.97,kenarPay=24}={}){
  const g={
    zoom:1, panX:0, panY:0, enAz, enCok,
    // zoom=1'de baskının alana sığan genişliği
    temel(alan){return Math.min(alan.w*pay,alan.h*pay*ORAN);},
    // kaydırmayı sınırla: büyütülmüş baskı alanın dışına kaçmasın (kenarPay kadar boşluk kalabilir)
    sinirla(alan){
      const gen=g.temel(alan)*g.zoom, yuk=gen/ORAN;
      const mx=Math.max(0,(gen-alan.w)/2+kenarPay), my=Math.max(0,(yuk-alan.h)/2+kenarPay);
      g.panX=Math.max(-mx,Math.min(mx,g.panX)); g.panY=Math.max(-my,Math.min(my,g.panY));
      if(g.zoom<=1){g.panX=0; g.panY=0;}
    },
    // f.ciz(ctx, g.yerlesim(alan)) için
    yerlesim(alan){
      g.sinirla(alan);
      return {x:alan.x+alan.w/2+g.panX, y:alan.y+alan.h/2+g.panY, genislik:g.temel(alan)*g.zoom};
    },
    // (px,py) ekran noktası yerinde kalacak biçimde yakınlaştır
    yakinlastir(z,alan,px,py){
      const z1=Math.max(enAz,Math.min(enCok,z)), f=z1/g.zoom;
      if(px==null){px=alan.x+alan.w/2; py=alan.y+alan.h/2;}
      const cx=alan.x+alan.w/2+g.panX, cy=alan.y+alan.h/2+g.panY;
      g.zoom=z1; g.panX=px+(cx-px)*f-(alan.x+alan.w/2); g.panY=py+(cy-py)*f-(alan.y+alan.h/2);
      g.sinirla(alan); return g;
    },
    kaydir(dx,dy,alan){g.panX+=dx; g.panY+=dy; if(alan) g.sinirla(alan); return g;},
    sifirla(){g.zoom=1; g.panX=0; g.panY=0; return g;},
    // bu yakınlıkta keskin baskı için fotografKur cozunurluk değeri (dpr: aygıt pikseli/CSS pikseli). Çeyrek adımlı:
    // küçük yakınlık değişimlerinde baskı yeniden kurulmasın.
    cozunurluk(alan,dpr=1,enCokR=4){
      const px=g.temel(alan)*g.zoom*dpr/(FOTO.genislik+2*FOTO.kenar);
      return Math.min(enCokR,Math.max(.5,Math.ceil(px*4)/4));
    }
  };
  return g;
}

// Girdi bağlayıcısı. eleman: tuval; alanAl(): o anki alan; secenek:
//   dokun(x,y)     tek dokunma (sürüklenmemiş): iz aramak için
//   degisti()      yakınlık ya da kaydırma değişti: yeniden çiz
//   ciftZoom       çift dokunmada gidilecek yakınlık (zaten yakınsa geri döner)
// Koordinatlar elemanın sol üstüne göredir (CSS pikseli): alan da aynı birimde olmalı.
// Dönüş: birak() dinleyicileri kaldırır.
export function yakinlikDinle(eleman,g,alanAl,{dokun=()=>{},degisti=()=>{},ciftZoom=2.6,esik=8,ciftSure=320}={}){
  const imler=new Map(); let surukle=null, cimdik=null, sonDokunma=null;
  const nokta=e=>{const r=eleman.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top];};
  function asagi(e){
    eleman.setPointerCapture?.(e.pointerId);
    imler.set(e.pointerId,nokta(e));
    if(imler.size===1){const p=nokta(e); surukle={bas:p, son:p, zaman:performance.now(), oynadi:false};}
    if(imler.size===2){const [a,b]=[...imler.values()]; cimdik={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1, z:g.zoom}; surukle=null;}
  }
  function hareket(e){
    if(!imler.has(e.pointerId)) return;
    imler.set(e.pointerId,nokta(e));
    if(cimdik&&imler.size>=2){
      const [a,b]=[...imler.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1])||1;
      g.yakinlastir(cimdik.z*d/cimdik.d,alanAl(),(a[0]+b[0])/2,(a[1]+b[1])/2); degisti(); return;
    }
    if(!surukle) return;
    const p=nokta(e);
    if(!surukle.oynadi&&Math.hypot(p[0]-surukle.bas[0],p[1]-surukle.bas[1])>esik) surukle.oynadi=true;
    if(surukle.oynadi&&g.zoom>1){g.kaydir(p[0]-surukle.son[0],p[1]-surukle.son[1],alanAl()); degisti();}
    surukle.son=p;
  }
  function yukari(e){
    if(!imler.has(e.pointerId)) return;
    imler.delete(e.pointerId);
    if(cimdik){if(imler.size<2) cimdik=null; surukle=null; return;}
    if(!surukle) return;
    const s=surukle; surukle=null;
    if(s.oynadi) return;
    const p=s.bas, t=performance.now();
    if(sonDokunma&&t-sonDokunma.t<ciftSure&&Math.hypot(p[0]-sonDokunma.p[0],p[1]-sonDokunma.p[1])<30){
      sonDokunma=null;
      if(g.zoom>1.05) g.sifirla(); else g.yakinlastir(ciftZoom,alanAl(),p[0],p[1]);
      degisti(); return;
    }
    sonDokunma={t,p};
    dokun(p[0],p[1]);
  }
  function tekerlek(e){
    e.preventDefault();
    const p=nokta(e); g.yakinlastir(g.zoom*Math.exp(-e.deltaY*(e.deltaMode?.05:.0015)),alanAl(),p[0],p[1]); degisti();
  }
  const iptal=e=>{imler.delete(e.pointerId); cimdik=null; surukle=null;};
  eleman.addEventListener('pointerdown',asagi); eleman.addEventListener('pointermove',hareket);
  eleman.addEventListener('pointerup',yukari); eleman.addEventListener('pointercancel',iptal);
  eleman.addEventListener('wheel',tekerlek,{passive:false});
  return {birak(){
    eleman.removeEventListener('pointerdown',asagi); eleman.removeEventListener('pointermove',hareket);
    eleman.removeEventListener('pointerup',yukari); eleman.removeEventListener('pointercancel',iptal);
    eleman.removeEventListener('wheel',tekerlek);
  }};
}
