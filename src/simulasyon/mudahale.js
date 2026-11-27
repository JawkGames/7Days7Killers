// Oyuncu müdahaleleri (Rewind'in anlamı): müfettişin bir gece için aldığı tedbirler simülasyona kilitli
// yerleştirme olarak girer; cinayet aşaması bu kilitlere uyarak yeniden koşar.
//
//   {tur:'alikoy', kisi, gun}   kisi o gece karakolda alıkonur: öldüremez, öldürülemez, evinde değildir.
//   {tur:'uyar',   kisi, gun}   kisi uyarılır: o gece kapısını sürgüler, evinden çıkmaz, ona ulaşılamaz.
//   {tur:'nobet',  mekan, gun}  mekâna jandarma nöbeti konur: o gece orada cinayet işlenemez.
//
// `gun` tedbirin alındığı gündür (gün sonu). Tedbirin penceresi o günün ikindisinden ertesi günün gecesine
// kadardır: tam olarak ertesi oyun gününün cinayet penceresi (ayar.cinayetPenceresi). Sorgu o günün
// sabahında olduğundan pencerenin hepsi oyuncunun henüz görmediği zamandır.

export const MUDAHALE_TURLERI=Object.freeze(['alikoy','uyar','nobet']);
export const ALIKOYMA_YERI='karakol';

// Tedbirin kapsadığı zamanlar: [ilk, son] (ikisi de dahil).
export function mudahalePenceresi(ayar,gun){
  const D=ayar.dilimler.length;
  const ilk=(gun-1)*D+ayar.dilimler.indexOf('ikindi'), son=gun*D+ayar.dilimler.indexOf('gece');
  return [ilk,son];
}

// Biçim denetimi: sorun yoksa null.
export function mudahaleSorunu(m,koy,ayar){
  if(!m||!MUDAHALE_TURLERI.includes(m.tur)) return 'bilinmeyen müdahale türü: '+(m&&m.tur);
  if(!Number.isInteger(m.gun)||m.gun<1||m.gun>=ayar.gunSayisi) return `müdahale günü 1..${ayar.gunSayisi-1} olmalı`;
  if(m.tur==='nobet'){ if(!koy.mekanlar[m.mekan]) return 'bilinmeyen mekân: '+m.mekan; }
  else if(!koy.kisiler[m.kisi]) return 'bilinmeyen kişi: '+m.kisi;
  return null;
}

// Müdahaleleri sıradan çizelgeye kilitli yerleştirme olarak uygular (cinayetlerden önce).
// Döner: {kesim, nobet(m,t), kilit(k,t), liste}. kesim: ilk müdahalenin başladığı an; ondan önceki her şey
// müdahalesiz vakayla birebir aynı kalır.
export function mudahaleKur(d,cz,liste){
  const nobetler=new Set(), kisiKilit=new Map();
  let kesim=Infinity;
  const sirali=[...liste].sort((a,b)=>a.gun-b.gun||(a.tur<b.tur?-1:a.tur>b.tur?1:0)||String(a.kisi??a.mekan).localeCompare(String(b.kisi??b.mekan)));
  for(const m of sirali){
    const [ilk,son]=mudahalePenceresi(d.ayar,m.gun);
    kesim=Math.min(kesim,ilk);
    for(let t=ilk;t<=Math.min(son,d.zaman.T-1);t++){
      if(m.tur==='nobet'){nobetler.add(m.mekan+'|'+t); continue;}
      const k=m.kisi;
      if(!cz.canli(k,t)||cz.kilitli(k,t)) continue;
      if(m.tur==='alikoy') cz.koy(k,t,ALIKOYMA_YERI,'alikonuldu',true);
      else cz.koy(k,t,d.kisi(k).ev,'uyarildi',true);
      kisiKilit.set(k+'|'+t,m.tur);
    }
  }
  return {kesim,liste:sirali,nobet:(m,t)=>nobetler.has(m+'|'+t),kilit:(k,t)=>kisiKilit.get(k+'|'+t)??null};
}
