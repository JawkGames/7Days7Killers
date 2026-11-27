// Sorgu ekranının sadeleştirilmesi: her turda en çok 3 önerilen soru, kalanlar katlanmış "Başka soru" listesinde.
// Saf işlev; görsel sürüm (oyun-arayuzu.js) ve metin sürümü (prototip/metin-oyunu) birlikte kullanır.
//
//   onerilenSorular(sorular, onceki, n) → {oneri:[Soru], diger:[Soru]}
//   sorular: oyun.js `sorular(b,d)` listesi (öncelik sırasıyla), onceki: bir önceki turda listede olan soru kimlikleri
//   (Set; sorgunun ilk turunda null: o zaman "yeni açılan" diye bir şey yoktur).
//
// Sıra: (1) yüzleştirme ve başkasının yönlendirdiği konu, (2) bu turda yeni açılanlar, (3) cinayet anı (yer, gördü),
// (4) kalanlar öncelik sırasıyla. Öneride aynı türden en çok 2 soru olur (üçü de "X neredeydi?" olmasın).

const ACIL=q=>q.tur==='yuzlesme'||q.oncelik>=95;
const CINAYET_ANI=q=>q.tur==='yer'||q.tur==='gordu';

export function onerilenSorular(sorular,onceki=null,n=3){
  const l=sorular||[];
  const yeni=q=>onceki!=null&&!onceki.has(q.id);
  const sira=[...l.filter(ACIL),...l.filter(q=>!ACIL(q)&&yeni(q)),...l.filter(q=>!ACIL(q)&&!yeni(q)&&CINAYET_ANI(q)),...l];
  const oneri=[], tur={};
  for(const q of sira){
    if(oneri.length>=n) break;
    if(oneri.includes(q)||(tur[q.tur]||0)>=2) continue;
    oneri.push(q); tur[q.tur]=(tur[q.tur]||0)+1;
  }
  // Tür sınırı yüzünden 3'e varmadıysa sınırsız doldur.
  for(const q of l){ if(oneri.length>=n) break; if(!oneri.includes(q)) oneri.push(q); }
  return {oneri,diger:l.filter(q=>!oneri.includes(q))};
}
