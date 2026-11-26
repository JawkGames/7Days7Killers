// Köy verisini kurar ve doğrular. Dosya okumaz: kişi ve mekân listesini dışarıdan alır,
// böylece tarayıcıda, testte ve araçlarda aynı kod çalışır.

export const MIZACLAR=['gururlu','sert','ofkeli','kurnaz','dedikoducu','saf','sakin','korkak'];
export const ORTULER=['aba','entari','palto','cubbe','kaput','onluk','kepenek']; // alt gövdeyi gizleyen giysi (bacak çizilmez)
export const KAYIP_TURLERI=['aile','yalniz','kimsesiz','hayvan','is'];
export const MEKAN_TURLERI=['ev','ortak','is','kir'];
// İlişki bir kez, tek tarafın dosyasında yazılır; karşı yönü burada üretilir.
export const SIMETRIK=['es','sozlu','sevgili','dost','hasim','ortak'];
export const TERS={ebeveyn:'cocuk',borclu:'alacakli',isveren:'calisan',sever:'sevilen',korkar:'korkulan',korur:'korunan'};
export const ILISKI_TURLERI=[...SIMETRIK,...Object.keys(TERS)];

// Döner: {kisiler:{id:kisi}, mekanlar:{id:mekan}, iliskiler:[{kimden,kime,tur}], iliskileri(id)}
// iliskiler iki yönü de içerir: {kimden:'mahmut',kime:'cemil',tur:'ebeveyn'} ve {kimden:'cemil',kime:'mahmut',tur:'cocuk'}
export function koyKur(kisiListesi,mekanListesi){
  const kisiler=Object.fromEntries(kisiListesi.map(k=>[k.id,k]));
  const mekanlar=Object.fromEntries(mekanListesi.map(m=>[m.id,m]));
  const iliskiler=[];
  for(const k of kisiListesi) for(const i of k.iliskiler){
    iliskiler.push({kimden:k.id,kime:i.kim,tur:i.tur});
    iliskiler.push({kimden:i.kim,kime:k.id,tur:SIMETRIK.includes(i.tur)?i.tur:TERS[i.tur]});
  }
  return {kisiler,mekanlar,iliskiler,iliskileri:id=>iliskiler.filter(i=>i.kimden===id)};
}

// Döner: hata cümleleri listesi (boşsa veri sağlam). metinler = dil/<kod>/kisiler.js, terimler = dil/<kod>/terimler.js
export function dogrula(kisiListesi,mekanListesi,metinler,terimler){
  const h=[], kimlik=new Set(), mekan=new Set(mekanListesi.map(m=>m.id)), ciftler=new Set(), bagli=new Set();
  const kisiVar=new Set(kisiListesi.map(k=>k.id));
  if(kisiListesi.length<20||kisiListesi.length>25) h.push(`kişi sayısı 20-25 olmalı: ${kisiListesi.length}`);
  for(const m of mekanListesi){
    if(!MEKAN_TURLERI.includes(m.tur)) h.push(`${m.id}: bilinmeyen mekân türü ${m.tur}`);
    if(terimler&&!terimler.mekan[m.id]) h.push(`${m.id}: mekân adı dil dosyasında yok`);
  }
  for(const k of kisiListesi){
    const e=m=>h.push(`${k.id}: ${m}`);
    if(kimlik.has(k.id)) e('kimlik tekrar ediyor'); kimlik.add(k.id);
    if(!/^[a-z-]+$/.test(k.id)) e('kimlik yalnızca küçük harf ve tire içermeli');
    if(!(k.yas>=16&&k.yas<=90)) e('yaş 16-90 olmalı');
    if(k.cinsiyet!=='E'&&k.cinsiyet!=='K') e('cinsiyet E ya da K olmalı');
    if(!MIZACLAR.includes(k.mizac)) e(`bilinmeyen mizaç ${k.mizac}`);
    if(!ORTULER.includes(k.ortu)) e(`bilinmeyen örtü ${k.ortu}`);
    if(!mekan.has(k.ev)) e(`ev mekânı yok: ${k.ev}`);
    if(k.is!=null&&!mekan.has(k.is)) e(`iş mekânı yok: ${k.is}`);
    if(!k.esyalar||k.esyalar.length<2) e('en az 2 ayırt edici eşya gerekli (iz bırakabilsin)');
    if(!k.sirlar||k.sirlar.length<1) e('en az 1 sır gerekli (sebep doğabilsin)');
    for(const s of k.sirlar||[]) for(const o of s.kimler){ if(!kisiVar.has(o)) e(`sır ${s.id}: kişi yok ${o}`); if(o===k.id) e(`sır ${s.id}: kendini gösteriyor`); }
    for(const i of k.iliskiler||[]){
      if(!ILISKI_TURLERI.includes(i.tur)) e(`bilinmeyen ilişki türü ${i.tur}`);
      if(!kisiVar.has(i.kim)) e(`ilişki: kişi yok ${i.kim}`);
      if(i.kim===k.id) e('kendisiyle ilişki');
      const anahtar=SIMETRIK.includes(i.tur)?[k.id,i.kim].sort().join('|')+'|'+i.tur:`${k.id}|${i.kim}|${i.tur}`;
      if(ciftler.has(anahtar)) e(`ilişki iki kez yazılmış: ${i.kim} ${i.tur}`); ciftler.add(anahtar);
      bagli.add(k.id); bagli.add(i.kim);
    }
    if(!k.kayip||!KAYIP_TURLERI.includes(k.kayip.tur)) e('kayıp sahnesi türü eksik ya da bilinmiyor');
    else{ if(!mekan.has(k.kayip.mekan)) e(`kayıp mekânı yok: ${k.kayip.mekan}`); for(const o of k.kayip.bekleyenler) if(!kisiVar.has(o)) e(`kayıp: bekleyen kişi yok ${o}`); }
    if(metinler){
      const t=metinler[k.id];
      if(!t) e('dil dosyasında metni yok');
      else{
        for(const a of['ad','lakap','tanim','kayip']) if(!t[a]) e(`metin eksik: ${a}`);
        for(const s of k.sirlar||[]) if(!t.sirlar||!t.sirlar[s.id]) e(`sır metni eksik: ${s.id}`);
        for(const s of k.esyalar||[]) if(!t.esyalar||!t.esyalar[s]) e(`eşya metni eksik: ${s}`);
      }
    }
    if(terimler){ if(!terimler.meslek[k.meslek]) e(`meslek adı dil dosyasında yok: ${k.meslek}`); }
  }
  for(const k of kisiListesi){
    const sirda=kisiListesi.some(o=>o.id!==k.id&&o.sirlar.some(s=>s.kimler.includes(k.id)));
    if(!bagli.has(k.id)&&!sirda) h.push(`${k.id}: kimseyle bağı yok`);
  }
  return h;
}
