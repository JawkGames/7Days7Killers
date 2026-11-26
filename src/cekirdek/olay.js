// Küçük olay bildirimi. Çizim ve arayüz modülleri birbirini tanımadan bununla haberleşir:
// biri bildirir, ilgilenen abone olur. Bir abone hata atarsa diğerleri yine çağrılır.

export function olayKanali({hata=(e,ad)=>console.error(`olay "${ad}" abonesi hata attı:`,e)}={}){
  const aboneler=new Map(); // ad -> Set<fn>

  function birak(ad,fn){
    const k=aboneler.get(ad);
    if(!k) return;
    k.delete(fn);
    if(!k.size) aboneler.delete(ad);
  }

  // Abone olur; bırakmak için dönen işlevi çağırın.
  function abone(ad,fn){
    if(typeof fn!=='function') throw new TypeError(`abone: "${ad}" için işlev bekleniyordu`);
    if(!aboneler.has(ad)) aboneler.set(ad,new Set());
    aboneler.get(ad).add(fn);
    return ()=>birak(ad,fn);
  }

  // Yalnızca ilk bildirimde çağrılır, sonra kendiliğinden bırakılır.
  function birKez(ad,fn){
    const sar=veri=>{cik(); fn(veri);};
    const cik=abone(ad,sar);
    return cik;
  }

  // Bütün abonelere veriyi iletir. Bildirim sırasında abone olan ya da bırakan,
  // o anki bildirimi etkilemez (kopya üzerinde dönülür). Çağrılan abone sayısını döndürür.
  function bildir(ad,veri){
    const k=aboneler.get(ad);
    if(!k) return 0;
    let n=0;
    for(const fn of [...k]){
      n++;
      try{fn(veri);}catch(e){hata(e,ad);}
    }
    return n;
  }

  function temizle(ad){if(ad===undefined) aboneler.clear(); else aboneler.delete(ad);}
  const aboneSayisi=ad=>aboneler.get(ad)?.size??0;

  return {abone,birKez,birak,bildir,temizle,aboneSayisi};
}

// Oyunun ortak kanalı. Modüller isterse kendi kanallarını da kurabilir.
export const olaylar=olayKanali();
