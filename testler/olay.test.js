import {describe,it,expect,vi} from 'vitest';
import {olayKanali,olaylar} from '../src/cekirdek/olay.js';

describe('olay bildirimi',()=>{
  it('abonelere veri iletir, abone sayısını döndürür',()=>{
    const k=olayKanali(), a=vi.fn(), b=vi.fn();
    k.abone('soz',a); k.abone('soz',b);
    expect(k.bildir('soz',{metin:'merhaba'})).toBe(2);
    expect(a).toHaveBeenCalledWith({metin:'merhaba'});
    expect(b).toHaveBeenCalledOnce();
  });
  it('abonesi olmayan olay sessizce geçer',()=>{
    expect(olayKanali().bildir('yok')).toBe(0);
  });
  it('dönen işlev ve birak aboneliği kaldırır',()=>{
    const k=olayKanali(), a=vi.fn(), b=vi.fn();
    const cik=k.abone('x',a); k.abone('x',b);
    cik(); k.birak('x',b);
    k.bildir('x');
    expect(a).not.toHaveBeenCalled(); expect(b).not.toHaveBeenCalled();
    expect(k.aboneSayisi('x')).toBe(0);
    cik(); // iki kez bırakmak sorun değil
  });
  it('olaylar birbirine karışmaz',()=>{
    const k=olayKanali(), a=vi.fn();
    k.abone('a',a); k.bildir('b',1);
    expect(a).not.toHaveBeenCalled();
  });
  it('hata atan abone diğerlerini etkilemez ve hata işleyiciye gider',()=>{
    const hata=vi.fn(), k=olayKanali({hata}), son=vi.fn();
    k.abone('x',()=>{throw new Error('patladı');}); k.abone('x',son);
    expect(()=>k.bildir('x',5)).not.toThrow();
    expect(son).toHaveBeenCalledWith(5);
    expect(hata).toHaveBeenCalledOnce();
    expect(hata.mock.calls[0][0].message).toBe('patladı');
    expect(hata.mock.calls[0][1]).toBe('x');
  });
  it('birKez yalnızca ilk bildirimde çağrılır',()=>{
    const k=olayKanali(), a=vi.fn();
    k.birKez('x',a);
    k.bildir('x',1); k.bildir('x',2);
    expect(a).toHaveBeenCalledTimes(1); expect(a).toHaveBeenCalledWith(1);
    expect(k.aboneSayisi('x')).toBe(0);
  });
  it('birKez çağrılmadan bırakılabilir',()=>{
    const k=olayKanali(), a=vi.fn();
    k.birKez('x',a)(); k.bildir('x');
    expect(a).not.toHaveBeenCalled();
  });
  it('bildirim sırasında abone olunan ya da bırakılan, o bildirimi bozmaz',()=>{
    const k=olayKanali(), sira=[], yeni=vi.fn();
    let cikB;
    k.abone('x',()=>{sira.push('a'); cikB(); k.abone('x',yeni);});
    cikB=k.abone('x',()=>sira.push('b'));
    k.bildir('x');
    expect(sira).toEqual(['a','b']);
    expect(yeni).not.toHaveBeenCalled();
    k.bildir('x');
    expect(yeni).toHaveBeenCalledOnce();
  });
  it('aynı işlev iki kez abone olunca bir kez çağrılır',()=>{
    const k=olayKanali(), a=vi.fn();
    k.abone('x',a); k.abone('x',a); k.bildir('x');
    expect(a).toHaveBeenCalledOnce();
  });
  it('işlev olmayan abone reddedilir',()=>{
    expect(()=>olayKanali().abone('x',null)).toThrow(TypeError);
  });
  it('temizle bütün aboneleri ya da bir olayınkileri siler',()=>{
    const k=olayKanali();
    k.abone('a',()=>{}); k.abone('b',()=>{});
    k.temizle('a'); expect(k.aboneSayisi('a')).toBe(0); expect(k.aboneSayisi('b')).toBe(1);
    k.temizle(); expect(k.aboneSayisi('b')).toBe(0);
  });
  it('ortak kanal hazır',()=>{
    const a=vi.fn(), cik=olaylar.abone('deneme.ortak',a);
    olaylar.bildir('deneme.ortak',1); cik();
    expect(a).toHaveBeenCalledWith(1);
  });
});
