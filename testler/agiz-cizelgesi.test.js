import {describe,it,expect} from 'vitest';
import {cizelgeKur} from '../src/diyalog/agiz-cizelgesi.js';
import {KONUSMA} from '../src/diyalog/konusma.js';
import tr from '../src/dil/tr/agiz.js';

const kur=m=>cizelgeKur(m,KONUSMA,tr);

describe('ağız çizelgesi',()=>{
  it('her harf için bir adım üretir, süreler toplanır',()=>{
    const C=kur('Ma.');
    expect(C.adimlar.map(a=>a.sekil)).toEqual(['kapali','yarim','kapali']);
    expect(C.adimlar.map(a=>a.bas)).toEqual([0,88,218]);
    expect(C.bitis).toBe(458);
  });
  it('Türkçe büyük İ ve I doğru küçülür',()=>{
    expect(kur('İ').adimlar[0].sekil).toBe('ince');
    expect(kur('I').adimlar[0].sekil).toBe('ince');
  });
  it('ünlem son ünlüyü vurgular',()=>{
    expect(kur('Dur!').adimlar[1].sekil).toBe('genis');
  });
  it('bütün şekiller tanımlıdır',()=>{
    for(const a of kur('Değirmende ne gördün, söyle bakalım?').adimlar) expect(KONUSMA.sekiller[a.sekil]).toBeDefined();
  });
});
