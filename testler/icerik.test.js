import {describe,it,expect} from 'vitest';
import {kisiListesi,mekanListesi,koy} from '../src/icerik/index.js';
import {dogrula} from '../src/icerik/kur.js';
import trKisiler from '../src/dil/tr/kisiler.js';
import trTerimler from '../src/dil/tr/terimler.js';

describe('köy içeriği',()=>{
  it('şema ve metinler eksiksiz',()=>{
    expect(dogrula(kisiListesi,mekanListesi,trKisiler,trTerimler)).toEqual([]);
  });
  it('dosya adı kimlikle aynı',()=>{
    const yollar=Object.keys(import.meta.glob('../src/icerik/kisiler/*.js'));
    expect(yollar.map(y=>y.match(/([^/]+)\.js$/)[1]).sort()).toEqual(kisiListesi.map(k=>k.id).sort());
  });
  it('ilişkiler iki yönlü kurulur',()=>{
    expect(koy.iliskileri('cemil')).toContainEqual({kimden:'cemil',kime:'mahmut',tur:'cocuk'});
    expect(koy.iliskileri('mahmut')).toContainEqual({kimden:'mahmut',kime:'cemil',tur:'ebeveyn'});
    expect(koy.iliskileri('arif').filter(i=>i.tur==='alacakli').map(i=>i.kime).sort()).toEqual(['ismail','kazim']);
  });
  it('hatalı veriyi yakalar',()=>{
    const bozuk=kisiListesi.map(k=>k.id==='elif'?{...k,ev:'yok-boyle-yer',mizac:'neseli'}:k);
    const h=dogrula(bozuk,mekanListesi,trKisiler,trTerimler);
    expect(h).toContain('elif: ev mekânı yok: yok-boyle-yer');
    expect(h).toContain('elif: bilinmeyen mizaç neseli');
  });
});
