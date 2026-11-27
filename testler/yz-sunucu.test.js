// yerelSunucu arka ucu, OpenAI uyumlu sahte HTTP sunucusuna karşı (gerçek ağ isteği, localhost).
import {describe,it,expect,beforeAll,afterAll} from 'vitest';
import {sahteSunucuBaslat} from './yardim/sahte-yz-sunucu.js';
import {yzKur,yerelSunucu} from '../src/yz/index.js';

let s;
beforeAll(async()=>{ s=await sahteSunucuBaslat({port:0}); });
afterAll(async()=>{ await s?.kapat(); });

describe('yerelSunucu',()=>{
  it('modeli sunucudan bulur, şemayla ister, cevabı denetleyip kullanır',async()=>{
    const yz=yzKur({arkaUc:yerelSunucu({adres:s.adres})});
    const r=await yz.soyle({kisi:'kazim',soru:'Dün gece neredeydin?',kalip:'Dün gece su değirmenindeydim.',tavir:'dogru'});
    expect(r).toMatchObject({kaynak:'yz',metin:'Valla müfettiş bey. Dün gece su değirmenindeydim.'});
    const g=s.istekler.at(-1);
    expect(g.model).toBe('sahte-model');
    expect(g.response_format.json_schema.name).toBe('cevap');
  });
  it('serbest soruyu eşler',async()=>{
    const yz=yzKur({arkaUc:yerelSunucu({adres:s.adres})});
    const adaylar=[{id:'gordu:0',etiket:'Dün gece bir şey gördün mü?'},{id:'yer:0',etiket:'Dün gece neredeydin?'},{id:'fail:c1',etiket:'Hacı Ağa\'yı kim öldürdü, bir bildiğin var mı?'}];
    expect((await yz.soruEsle({metin:'dün gece neredeydin',adaylar})).id).toBe('yer:0');
    expect((await yz.soruEsle({metin:'katil sen misin',adaylar})).id).toBe('fail:c1');
    expect((await yz.soruEsle({metin:'çay içer misin',adaylar})).id).toBe('yok');
  });
  it('sunucu kapalıysa kalıba düşer',async()=>{
    const yz=yzKur({arkaUc:yerelSunucu({adres:'http://127.0.0.1:9'}),zamanAsimi:2000});
    const r=await yz.soyle({kisi:'kazim',soru:'x',kalip:'Bilmem.',tavir:'bilmez'});
    expect(r).toMatchObject({kaynak:'kalip',metin:'Bilmem.'});
  });
});
