import {describe,it,expect} from 'vitest';
import {rng} from '../src/cekirdek/rastgele.js';
import {hex,rgba,lerp,clamp,yumusak,bez} from '../src/cekirdek/matematik.js';

describe('tohumlu rastgele',()=>{
  it('aynı tohum aynı diziyi verir',()=>{
    const a=rng(42), b=rng(42);
    for(let i=0;i<100;i++) expect(a()).toBe(b());
  });
  it('farklı tohum farklı dizi verir',()=>{
    const a=rng(1), b=rng(2);
    expect([a(),a(),a()]).not.toEqual([b(),b(),b()]);
  });
  it('değerler [0,1) aralığında kalır',()=>{
    const r=rng(7);
    for(let i=0;i<5000;i++){const v=r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1);}
  });
  it('dizi sürümler arasında değişmez (kayıtlı tohumlar bozulmasın)',()=>{
    const r=rng(9);
    expect([r(),r(),r()].map(v=>v.toFixed(6))).toMatchInlineSnapshot(`
      [
        "0.198729",
        "0.851211",
        "0.141766",
      ]
    `);
  });
});

describe('matematik',()=>{
  it('hex ve rgba',()=>{expect(hex('#ff0080')).toEqual([255,0,128]); expect(rgba([1,2,3],.5)).toBe('rgba(1,2,3,0.5)');});
  it('lerp ve clamp',()=>{expect(lerp(10,20,.25)).toBe(12.5); expect(clamp(5,0,3)).toBe(3); expect(clamp(-1,0,3)).toBe(0);});
  it('yumusak uçlarda 0 ve 1',()=>{expect(yumusak(2,4,1)).toBe(0); expect(yumusak(2,4,9)).toBe(1); expect(yumusak(2,4,3)).toBe(.5);});
  it('bez uç noktalardan geçer',()=>{const P=[0,0,1,5,4,5,6,2]; expect(bez(P,0)).toEqual([0,0]); expect(bez(P,1)).toEqual([6,2]);});
});
