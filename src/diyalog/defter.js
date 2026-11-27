// Defter: oyuncunun bildikleri. Düz veri (JSON'a yazılır, src/platform/kayit.js `defter` alanına olduğu gibi girer).
// İşlevler defteri değiştirmez, yenisini döndürür. Defterde gerçek yoktur: yalnızca görülen, duyulan ve
// oyuncunun kendi işaretleri. Oyun yanlış bir çıkarımı düzeltmez; işaret oyuncunun yazdığı gibi kalır.
// Rewind'de defter korunur (her kayıt hangi döngüde yazıldığını taşır).
//
// {
//   surum: 1,
//   sayac: n,                                   // kayıt kimlikleri için
//   cinayetler: [{id, kurban, mekan, zaman, bulan, fotografGunu, gun, dongu}],   // gün başında masaya gelen fotoğraflar
//   izler:      [{iz, cinayet, gun, dongu}],    // fotoğrafta bulunan fiziksel izler (her iz bir kez)
//   ifadeler:   [Ifade],
//   celiskiler: [{id, a, b, konu, gun, dongu}],  // oyuncunun yan yana koyup tuttuğu çelişkiler
//   isaretler:  {kisi: 'supheli'|'temiz'},
// }
// Ifade: {id:'f3', kisi, soru:{id, tur, ...}, olgu|null, iddialar:[Iddia], metin, tepki, gun, dongu}
//
// Iddia (konuşanın ağzından çıkan, doğru ya da yalan): tek tek denetlenebilir önermeler.
//   {tur:'konum',  kisi, zaman, mekan}        kisi o an oradaydı
//   {tur:'degil',  kisi, zaman, mekan}        kisi o an orada değildi ("yatağı boştu")
//   {tur:'siluet', zaman, mekan, ortu, tahmin?}  orada şu örtüyü giymiş biri vardı
//   {tur:'ses',    zaman, mekan, ses}
//   {tur:'sahip',  iz, kisi}                  bu iz kisi'nin
//   {tur:'sahip-degil', iz, kisi}             bu iz kisi'nin değil
//   {tur:'adaylar', iz, kisiler}              bu iz şunlardan birinin olabilir
//   {tur:'fail',   cinayet, kisi}
//   {tur:'sir',    sahip, sir}                bir sır açıldı
//   {tur:'sir-yok', sahip}                    "benim saklayacak bir şeyim yok"
//   {tur:'dolayli', alt, kisi, zaman, esya?, ortu?, iz}
//   {tur:'iliski', kisi, hedef, iliskiler}
//   {tur:'susar'} | {tur:'bilmez'}

export const DEFTER_SURUMU=1;

export function defterYeni(){
  return {surum:DEFTER_SURUMU,sayac:0,cinayetler:[],izler:[],ifadeler:[],celiskiler:[],isaretler:{}};
}

// Kayıttan gelen defter biçimce sağlam mı? Sağlamsa null, değilse sorun.
export function defterSorunu(d){
  if(!d||typeof d!=='object') return 'defter nesne değil';
  if(d.surum!==DEFTER_SURUMU) return 'bilinmeyen defter sürümü: '+d.surum;
  for(const a of ['cinayetler','izler','ifadeler','celiskiler']) if(!Array.isArray(d[a])) return a+' dizi değil';
  if(!d.isaretler||typeof d.isaretler!=='object') return 'işaretler nesne değil';
  if(!Number.isInteger(d.sayac)) return 'sayaç tam sayı değil';
  return null;
}

const kimlik=(d,on)=>({sayac:d.sayac+1,id:on+(d.sayac+1)});

// Fotoğraf masaya geldi: cinayetin herkesin bildiği yüzü (kurban, yer, aşağı yukarı saat, bulan).
export function cinayetEkle(d,{id,kurban,mekan,zaman,bulan,fotografGunu},{gun,dongu}){
  if(d.cinayetler.some(c=>c.id===id)) return d;
  return {...d,cinayetler:[...d.cinayetler,{id,kurban,mekan,zaman,bulan,fotografGunu,gun,dongu}]};
}

export const izBulunduMu=(d,iz)=>d.izler.some(x=>x.iz===iz);
// Fiziksel iz bulundu. Bir iz bir kez yazılır (Rewind'den sonra da).
export function izEkle(d,{iz,cinayet},{gun,dongu}){
  if(izBulunduMu(d,iz)) return d;
  return {...d,izler:[...d.izler,{iz,cinayet,gun,dongu}]};
}

// Yeni ifade. Döner: {defter, ifade}
export function ifadeEkle(d,{kisi,soru,olgu=null,iddialar=[],metin,tepki=null},{gun,dongu}){
  if(!kisi||!soru||typeof metin!=='string') throw new Error('ifadeEkle: kisi, soru ve metin gerekli');
  const {sayac,id}=kimlik(d,'f');
  const ifade={id,kisi,soru,olgu,iddialar,metin,tepki,gun,dongu};
  return {defter:{...d,sayac,ifadeler:[...d.ifadeler,ifade]},ifade};
}

export const ifadeBul=(d,id)=>d.ifadeler.find(f=>f.id===id)||null;
export const ifadeleri=(d,{kisi,soru}={})=>d.ifadeler.filter(f=>(kisi==null||f.kisi===kisi)&&(soru==null||f.soru.id===soru));
// Aynı kişi aynı soruya daha önce (hangi döngüde olursa olsun) cevap verdi mi?
export const soruldu=(d,kisi,soruId)=>d.ifadeler.some(f=>f.kisi===kisi&&f.soru.id===soruId);
// Bugünkü sorguda bu kişiye kaç soru soruldu (sabrı defterden hesaplanır; kayıttan dönünce de doğru çıkar).
export const bugunSorulan=(d,kisi,{gun,dongu})=>d.ifadeler.filter(f=>f.kisi===kisi&&f.gun===gun&&f.dongu===dongu&&f.soru.tur!=='selam').length;

export function isaretle(d,kisi,isaret){
  if(isaret!=null&&isaret!=='supheli'&&isaret!=='temiz') throw new Error('Bilinmeyen işaret: '+isaret);
  const isaretler={...d.isaretler};
  if(isaret==null) delete isaretler[kisi]; else isaretler[kisi]=isaret;
  return {...d,isaretler};
}

/* ---------------- Çelişki ---------------- */

// Bir ifadenin konum önermeleri: {kisi, zaman, mekan, olumlu}
export function konumOnermeleri(f){
  const l=[];
  for(const i of f.iddialar||[]){
    if(i.tur==='konum') l.push({kisi:i.kisi,zaman:i.zaman,mekan:i.mekan,olumlu:true});
    else if(i.tur==='degil') l.push({kisi:i.kisi,zaman:i.zaman,mekan:i.mekan,olumlu:false});
  }
  return l;
}

/**
 * İki ifade gerçekten birbirini tutmuyor mu? Yalnızca söylenenlere bakar, gerçeğe değil.
 * Döner: null ya da {tur, ...konu}. tur: 'konum' | 'sahip' | 'sir' | 'fail'
 */
export function celiskiBul(fa,fb){
  if(!fa||!fb||fa.id===fb.id) return null;
  for(const x of konumOnermeleri(fa)) for(const y of konumOnermeleri(fb)){
    if(x.kisi!==y.kisi||x.zaman!==y.zaman) continue;
    if(x.olumlu&&y.olumlu&&x.mekan!==y.mekan) return {tur:'konum',kisi:x.kisi,zaman:x.zaman,mekanlar:[x.mekan,y.mekan]};
    if(x.olumlu!==y.olumlu&&x.mekan===y.mekan) return {tur:'konum',kisi:x.kisi,zaman:x.zaman,mekanlar:[x.mekan,y.mekan]};
  }
  const A=fa.iddialar||[], B=fb.iddialar||[];
  for(const [P,Q] of [[A,B],[B,A]]) for(const x of P) for(const y of Q){
    if(x.tur==='sahip'&&y.tur==='sahip-degil'&&x.iz===y.iz&&x.kisi===y.kisi) return {tur:'sahip',iz:x.iz,kisi:x.kisi};
    if(x.tur==='adaylar'&&y.tur==='sahip-degil'&&x.iz===y.iz&&x.kisiler.length===1&&x.kisiler[0]===y.kisi) return {tur:'sahip',iz:x.iz,kisi:y.kisi};
    if(x.tur==='sahip'&&y.tur==='sahip'&&x.iz===y.iz&&x.kisi!==y.kisi) return {tur:'sahip',iz:x.iz,kisi:x.kisi,diger:y.kisi};
    if(x.tur==='sir'&&y.tur==='sir-yok'&&x.sahip===y.sahip) return {tur:'sir',sahip:x.sahip,sir:x.sir};
    if(x.tur==='fail'&&y.tur==='fail'&&x.cinayet===y.cinayet&&x.kisi!==y.kisi) return {tur:'fail',cinayet:x.cinayet,kisiler:[x.kisi,y.kisi]};
  }
  return null;
}

const ciftAnahtar=(a,b)=>[a,b].sort().join('|');
export const celiskiKayitli=(d,a,b)=>d.celiskiler.some(c=>ciftAnahtar(c.a,c.b)===ciftAnahtar(a,b));

/**
 * Oyuncu iki ifadeyi yan yana koyar. Çelişiyorsa deftere yazılır.
 * Döner: {defter, celiski|null, yeni:boolean}
 */
export function karsilastir(d,a,b,{gun,dongu}){
  const fa=ifadeBul(d,a), fb=ifadeBul(d,b);
  if(!fa||!fb) throw new Error('karsilastir: ifade bulunamadı');
  const konu=celiskiBul(fa,fb);
  if(!konu) return {defter:d,celiski:null,yeni:false};
  const var_=d.celiskiler.find(c=>ciftAnahtar(c.a,c.b)===ciftAnahtar(a,b));
  if(var_) return {defter:d,celiski:var_,yeni:false};
  const {sayac,id}=kimlik(d,'k');
  const celiski={id,a,b,konu,gun,dongu};
  return {defter:{...d,sayac,celiskiler:[...d.celiskiler,celiski]},celiski,yeni:true};
}

// Defterde adı geçen herkes (ifade veren, ifadede anılan, iz adayı, kurban, bulan).
export function anilanlar(d){
  const s=new Set();
  for(const c of d.cinayetler){s.add(c.kurban); if(c.bulan) s.add(c.bulan);}
  for(const f of d.ifadeler){
    s.add(f.kisi);
    for(const i of f.iddialar||[]){
      for(const k of ['kisi','hedef','sahip','tahmin']) if(typeof i[k]==='string') s.add(i[k]);
      for(const k of i.kisiler||[]) s.add(k);
    }
  }
  return s;
}

// Öğrenilen sırlar (ifadelerden): [{sahip, sir, ifade}]
export function ogrenilenSirlar(d){
  const l=[];
  for(const f of d.ifadeler) for(const i of f.iddialar||[]) if(i.tur==='sir'&&!l.some(x=>x.sahip===i.sahip&&x.sir===i.sir)) l.push({sahip:i.sahip,sir:i.sir,ifade:f.id});
  return l;
}
