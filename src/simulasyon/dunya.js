// Köy verisinden motorun her aşamasının kullandığı türetilmiş bilgiler.
// Sıra her zaman kimliğe göre alfabetiktir: dosyaların okunma sırası vakayı değiştirmez.

export function dunyaKur(koy,ayar){
  const ids=Object.keys(koy.kisiler).sort();
  const mekanIds=Object.keys(koy.mekanlar).sort();
  const kisi=id=>koy.kisiler[id];
  const iliskiler={};
  for(const id of ids) iliskiler[id]=[];
  for(const i of koy.iliskiler||[]) if(iliskiler[i.kimden]&&koy.kisiler[i.kime]) iliskiler[i.kimden].push({kime:i.kime,tur:i.tur});
  for(const id of ids) iliskiler[id].sort((a,b)=>a.kime<b.kime?-1:a.kime>b.kime?1:a.tur<b.tur?-1:a.tur>b.tur?1:0);
  const rel=(a,b)=>iliskiler[a].filter(i=>i.kime===b).map(i=>i.tur);
  const sirlar=[];
  for(const id of ids) for(const s of kisi(id).sirlar||[]) sirlar.push({sahip:id,id:s.id,tur:s.tur,kimler:(s.kimler||[]).filter(k=>koy.kisiler[k])});
  const evHalki={};
  for(const id of ids)(evHalki[kisi(id).ev]??=[]).push(id);
  const mekanTuru=m=>koy.mekanlar[m]?.tur;
  const D=ayar.dilimler.length, T=ayar.gunSayisi*D;
  const zaman={
    D,T,
    t:(gun,dilim)=>(gun-1)*D+ayar.dilimler.indexOf(dilim),
    gun:t=>Math.floor(t/D)+1,
    dilim:t=>ayar.dilimler[t%D],
  };
  // Masum birinin "olağan" yeri: soruya verilecek sıradan cevap. Yalancının uydurduğu yer budur.
  const masumYer=(id,dilim)=>{const k=kisi(id); return (dilim==='gece'||dilim==='aksam'||!k.is)?k.ev:k.is;};
  return {koy,ayar,ids,mekanIds,kisi,iliskiler,rel,sirlar,evHalki,mekanTuru,zaman,masumYer,
    yakinlik(a,b,tablo){let c=1; for(const t of rel(a,b)) if(tablo[t]!=null) c=Math.min(c,tablo[t]); return c;},
    sirlariOf:id=>sirlar.filter(s=>s.sahip===id),
  };
}
