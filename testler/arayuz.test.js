// Görsel oyun arayüzünün saf parçaları: iz eşleme tablosu ve sahne yöneticisi.
import {describe,it,expect,beforeAll} from 'vitest';
import {IZ_ESLEME,ESLEME_BOSLUKLARI,BILINMEYEN_IZ,izEsle,izAnahtari,izleriYerlestir} from '../src/arayuz/iz-esleme.js';
import {sahneYoneticisi} from '../src/arayuz/sahne-yoneticisi.js';
import {ESYA,MEKAN_ALETI,ORTU_IZ} from '../src/simulasyon/tablolar.js';

// Olay yeri modülleri içe aktarılırken DOMMatrix ister (yalnızca kurulum; çizim yapılmaz).
let MEKANLAR, IZLER, DUZLEMLER;
beforeAll(async()=>{
  globalThis.DOMMatrix??=class{multiply(){return this;} inverse(){return this;}};
  ({MEKANLAR,IZLER}=await import('../src/cizim/sahneler/olay-yeri/kutuphane.js'));
  DUZLEMLER=Object.fromEntries(Object.entries(IZLER).map(([t,i])=>[t,i.duzlemler]));
});

// Simülasyonun bırakabileceği bütün fiziksel iz anahtarları (yara hariç: kurbana dokunarak bulunur)
const tumAnahtarlar=()=>[...new Set([
  ...Object.values(ESYA).map(e=>e.iz),
  ...Object.values(MEKAN_ALETI).flat().map(a=>a.iz),
  ...Object.values(ORTU_IZ),
  'durmus-saat',
])];

describe('iz eşleme tablosu',()=>{
  it('simülasyonun her iz anahtarının bir karşılığı var',()=>{
    const eksik=tumAnahtarlar().filter(a=>!IZ_ESLEME[a]);
    expect(eksik).toEqual([]);
  });
  it('her karşılık fotoğraf sahnesinde var olan bir iz türü',()=>{
    for(const [a,e] of Object.entries(IZ_ESLEME)) expect(IZLER[e.tur],a).toBeTruthy();
    expect(IZLER[BILINMEYEN_IZ.tur]).toBeTruthy();
  });
  it('boşluk listesi yalnızca yaklaşık eşlemeleri içerir',()=>{
    expect(ESLEME_BOSLUKLARI.length).toBeGreaterThan(0);
    for(const b of ESLEME_BOSLUKLARI) expect(IZ_ESLEME[b.anahtar].yaklasik).toBe(true);
  });
  it('kurbanın eşyası eşyanın iziyle, durmuş saat dilimin saatiyle çizilir',()=>{
    expect(izAnahtari({alt:'kurban-esyasi',anahtar:'terzi-makasi'})).toBe('makas');
    expect(izEsle({alt:'kurban-esyasi',anahtar:'terzi-makasi'}).tur).toBe('alet');
    const s=izEsle({alt:'kurban-esyasi',anahtar:'durmus-saat',gercek:{gosterdigiDilim:'aksam'}});
    expect(s).toMatchObject({tur:'saat'}); expect(s.saat).toMatch(/^\d\d:\d\d$/);
  });
  it('yara fotoğraf izi değildir; tanınmayan anahtar çökmez',()=>{
    expect(izEsle({alt:'yara',anahtar:'bicak-yarasi'})).toBeNull();
    expect(izEsle({alt:'esya',anahtar:'yeni-bir-sey'})).toMatchObject({tur:BILINMEYEN_IZ.tur});
  });
});

describe('izleri yuvalara yerleştirme',()=>{
  const ornek=[
    {id:'i1',alt:'yara',anahtar:'ezik-yara'},
    {id:'i2',alt:'esya',anahtar:'carik-izi'},
    {id:'i3',alt:'esya',anahtar:'kirmizi-yun-ipi'},
    {id:'i4',alt:'silah',anahtar:'balta'},
    {id:'i5',alt:'kurban-esyasi',anahtar:'durmus-saat',gercek:{gosterdigiDilim:'gece'}},
    {id:'i6',alt:'esya',anahtar:'gaz-damlasi'},
  ];
  it('her mekânda uygun düzleme, beden dışı yuvaya konur ve belirlenimcidir',()=>{
    for(const M of Object.values(MEKANLAR)){
      const a=izleriYerlestir({izler:ornek,yuvalar:M.yuvalar,duzlemler:DUZLEMLER,tohum:5});
      const b=izleriYerlestir({izler:ornek,yuvalar:M.yuvalar,duzlemler:DUZLEMLER,tohum:5});
      expect(a).toEqual(b);
      expect(a.yerlesmeyen,M.id).toEqual([]);
      expect(a.izler.map(i=>i.kimlik)).toEqual(['i2','i3','i4','i5','i6']);
      for(const iz of a.izler){
        const y=M.yuvalar[iz.yuva];
        expect(iz.yuva).not.toBe('beden');
        expect(DUZLEMLER[iz.tur],`${M.id}/${iz.tur}`).toContain(y.duzlem);
        expect(y.uygunsuz||[]).not.toContain(iz.tur);
      }
    }
  });
  it('uygun yuva yoksa iz yerleşmeyenlere düşer',()=>{
    const r=izleriYerlestir({izler:[{id:'x',alt:'esya',anahtar:'gaz-damlasi'}],yuvalar:{duvar:{duzlem:'arka',konum:[0,100,400]}},duzlemler:DUZLEMLER});
    expect(r).toEqual({izler:[],yerlesmeyen:['x']});
  });
});

describe('sahne yöneticisi',()=>{
  const sahte=(kayit,ad)=>({baslat:()=>kayit.push('+'+ad),durdur:()=>kayit.push('-'+ad)});
  it('aynı anda tek sahne çalışır: geçişte eskisi durur, yenisi başlar',()=>{
    const k=[], y=sahneYoneticisi();
    y.gec('a',sahte(k,'a')); y.gec('b',sahte(k,'b')); y.durdur();
    expect(k).toEqual(['+a','-a','+b','-b']);
    expect(y.ad).toBeNull();
  });
  it('sahnenin hatası öbürünü engellemez',()=>{
    const k=[], hatalar=[], y=sahneYoneticisi({hata:(e,ad)=>hatalar.push(ad)});
    y.gec('a',{baslat(){}, durdur(){throw new Error('x');}});
    y.gec('b',sahte(k,'b'));
    expect(k).toEqual(['+b']); expect(hatalar).toEqual(['a']); expect(y.ad).toBe('b');
  });
});
