// Ekran: tam ekran, yön (dikey/yatay), sayfanın gizlenip geri gelmesi.
// Destek yoksa işlevler sessizce hiçbir şey yapmaz. Dinleme işlevleri kaldırıcı döndürür.
// `belge` / `pencere` parametreleri testte sahte nesne vermek içindir.

const belgeAl=b=>b??globalThis.document;

export function tamEkranMi(belge){
  const b=belgeAl(belge);
  return !!(b&&(b.fullscreenElement||b.webkitFullscreenElement));
}

// Tam ekrana geçer. Tarayıcılar bunu yalnızca bir kullanıcı hareketinin içinden izin verir.
// Promise<boolean>: tam ekrana geçildiyse true. Hata atmaz.
export async function tamEkranAc(belge){
  const b=belgeAl(belge), el=b?.documentElement;
  const ac=el&&(el.requestFullscreen||el.webkitRequestFullscreen);
  if(!ac) return false;
  try{await ac.call(el); return true;}catch{return false;}
}

export async function tamEkranKapat(belge){
  const b=belgeAl(belge);
  if(!tamEkranMi(b)) return true;
  const kapat=b.exitFullscreen||b.webkitExitFullscreen;
  if(!kapat) return false;
  try{await kapat.call(b); return true;}catch{return false;}
}

export const tamEkranDegistir=belge=>tamEkranMi(belge)?tamEkranKapat(belge):tamEkranAc(belge);

// 'dikey' | 'yatay'
export function yon(pencere=globalThis){
  const m=pencere?.matchMedia?.('(orientation: portrait)');
  if(m&&typeof m.matches==='boolean') return m.matches?'dikey':'yatay';
  const g=pencere?.innerWidth, y=pencere?.innerHeight;
  return Number.isFinite(g)&&Number.isFinite(y)&&g>y?'yatay':'dikey';
}

// Yön değişince fn(yeniYon) çağrılır (aynı yön için tekrar çağrılmaz).
export function yonDinle(fn,pencere=globalThis){
  if(typeof pencere?.addEventListener!=='function') return ()=>{};
  let son=yon(pencere);
  const bak=()=>{const y=yon(pencere); if(y!==son){son=y; fn(y);}};
  pencere.addEventListener('resize',bak);
  pencere.addEventListener('orientationchange',bak);
  return ()=>{
    pencere.removeEventListener('resize',bak);
    pencere.removeEventListener('orientationchange',bak);
  };
}

// Sayfa gizlenince fn(true), geri gelince fn(false). Oyun döngüsü buna göre duraklatılır.
// Android'de (Capacitor) uygulama arka plana atılınca da WebView visibilitychange gönderir.
export function gorunurlukDinle(fn,belge){
  const b=belgeAl(belge);
  if(typeof b?.addEventListener!=='function') return ()=>{};
  let son=!!b.hidden;
  const bildir=gizli=>{if(gizli!==son){son=gizli; fn(gizli);}};
  const degisti=()=>bildir(!!b.hidden);
  const gitti=()=>bildir(true);
  const geldi=()=>bildir(!!b.hidden);
  b.addEventListener('visibilitychange',degisti);
  // pagehide/pageshow belgeye değil pencereye gelir; belge varsayılansa pencereyi de dinle.
  const p=b.defaultView;
  p?.addEventListener?.('pagehide',gitti);
  p?.addEventListener?.('pageshow',geldi);
  return ()=>{
    b.removeEventListener('visibilitychange',degisti);
    p?.removeEventListener?.('pagehide',gitti);
    p?.removeEventListener?.('pageshow',geldi);
  };
}

export const sayfaGizliMi=belge=>!!belgeAl(belge)?.hidden;
