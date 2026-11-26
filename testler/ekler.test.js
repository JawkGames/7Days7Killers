import {describe,it,expect} from 'vitest';
import {ekle,ozelAd,kisiAdi,mekanAdi,iyelikliMi,degerCoz,sayiSonSozcuk,ekAdiCoz,EK_ADLARI,
  bulunma,ayrilma,yonelme,belirtme,tamlayan,ile,cogul,iyelik} from '../src/dil/tr/ekler.js';
import terimler from '../src/dil/tr/terimler.js';
import kisiler from '../src/dil/tr/kisiler.js';

const O=ozelAd, K=kisiAdi, M=mekanAdi;
const ad=d=>typeof d==='object'?d.metin:String(d);
// [değer, ek(ler), beklenen]
function tablo(baslik,satirlar){
  describe(baslik,()=>{
    it.each(satirlar.map(([d,e,b])=>[ad(d),e,b,d]))('%s + %s → %s',(_,e,b,d)=>{
      expect(ekle(d,...e.split(' '))).toBe(b);
    });
  });
}

tablo('ünlü uyumu (cins ad)',[
  ['ev','de','evde'], ['okul','de','okulda'], ['köy','de','köyde'], ['göl','den','gölden'],
  ['oda','e','odaya'], ['ev','e','eve'], ['okul','i','okulu'], ['ev','i','evi'], ['köy','i','köyü'], ['kız','i','kızı'],
  ['ev','in','evin'], ['oda','in','odanın'], ['kapı','in','kapının'], ['köprü','in','köprünün'],
  ['ev','ler','evler'], ['oda','ler','odalar'], ['göz','ler','gözler'], ['kuş','ler','kuşlar'],
  ['ev','le','evle'], ['oda','le','odayla'], ['kedi','le','kediyle'], ['tarla','si','tarlası'], ['ev','si','evi'], ['göz','si','gözü'],
]);

tablo('ünsüz sertleşmesi (-te/-ta, -ten/-tan, -ti)',[
  ['kitap','de','kitapta'], ['ağaç','de','ağaçta'], ['konak','de','konakta'], ['sepet','de','sepette'], ['baş','den','baştan'],
  ['tespih','de','tespihte'], ['raf','de','rafta'], ['kas','den','kastan'], ['mezarlık','de','mezarlıkta'],
  ['ağaç','den','ağaçtan'], ['konak','di','konaktı'], ['kasket','dir','kaskettir'],
]);

tablo('ünsüz yumuşaması (cins ad)',[
  ['konak','i','konağı'], ['konak','e','konağa'], ['kitap','i','kitabı'], ['ağaç','e','ağaca'], ['kırbaç','i','kırbacı'],
  ['çocuk','in','çocuğun'], ['renk','i','rengi'], ['orak','i','orağı'], ['çarık','si','çarığı'], ['gözlük','i','gözlüğü'],
  ['kanat','i','kanadı'], ['dört','i','dördü'], ['kurt','e','kurda'], ['kâğıt','i','kâğıdı'],
  // tek heceliler ve -t ile bitenler kural olarak yumuşamaz
  ['top','i','topu'], ['saç','i','saçı'], ['at','i','atı'], ['kasket','i','kasketi'], ['sepet','i','sepeti'], ['bulut','i','bulutu'],
  // istisnalar: yumuşamayan çok heceliler
  ['ahlak','i','ahlakı'], ['ittifak','e','ittifaka'],
  // ünsüzle başlayan ekte yumuşama olmaz
  ['konak','le','konakla'], ['kitap','ler','kitaplar'],
]);

tablo('ünlü düşmesi ve ikileşme',[
  ['oğul','i','oğlu'], ['oğul','de','oğulda'], ['ağız','i','ağzı'], ['burun','e','burna'], ['şehir','e','şehre'], ['zehir','i','zehri'],
  ['akıl','in','aklın'], ['sır','i','sırrı'], ['sır','ler','sırlar'], ['hak','i','hakkı'], ['his','i','hissi'], ['af','e','affa'],
]);

tablo('kaynaştırma harfleri',[
  ['oda','i','odayı'], ['kedi','e','kediye'], ['kapı','in','kapının'], ['tarla','si','tarlası'], ['oda','le','odayla'],
  ['su','i','suyu'], ['su','in','suyun'], ['su','si','suyu'], ['su','e','suya'], ['su','le','suyla'], ['su','de','suda'],
]);

tablo('son hecesi ince okunan istisnalar',[
  ['saat','de','saatte'], ['saat','i','saati'], ['saat','e','saate'], ['saat','ler','saatler'], ['saat','le','saatle'],
  ['hâl','de','hâlde'], ['hâl','i','hâli'], ['hal','e','hale'], ['kalp','i','kalbi'], ['kalp','de','kalpte'],
  ['rol','i','rolü'], ['rol','de','rolde'], ['alkol','den','alkolden'], ['kabul','i','kabulü'], ['dikkat','e','dikkate'],
  [O('Kemal'),'e',"Kemal'e"], [O('Celal'),'in',"Celal'in"],
  // şapkalı ama son ünlüsü kalın: istisna değil
  [O('Kâzım'),'e',"Kâzım'a"], [O('Kâzım'),'in',"Kâzım'ın"], ['dükkân','e','dükkâna'], ['kâhya','in','kâhyanın'],
]);

tablo('özel adlar: kesme, yazıda yumuşama yok',[
  [O('Antep'),'de',"Antep'te"], [O('Antep'),'e',"Antep'e"], [O('Antep'),'den',"Antep'ten"], [O('Antep'),'de ki',"Antep'teki"],
  [O('Halil'),'in',"Halil'in"], [O('Elif'),'e',"Elif'e"], [O('Elif'),'le',"Elif'le"], [O('Nihat'),'le',"Nihat'la"],
  [O('Mahmut'),'i',"Mahmut'u"], [O('Mahmut'),'de',"Mahmut'ta"], [O('Bekir'),'e',"Bekir'e"], [O('Yusuf'),'i',"Yusuf'u"],
  [O('Kılıç'),'e',"Kılıç'a"], [O('Çelik'),'i',"Çelik'i"], [O('Bektaş'),'de',"Bektaş'ta"], [O('Abdullah'),'de',"Abdullah'ta"],
  [O('Rıza'),'in',"Rıza'nın"], [O('Rıza'),'i',"Rıza'yı"], [O('Naciye'),'i',"Naciye'yi"], [O('Zeliha'),'e',"Zeliha'ya"],
  [O('Hatice'),'le',"Hatice'yle"], [O('Gülsüm'),'in',"Gülsüm'ün"], [O('Gülsüm'),'i',"Gülsüm'ü"], [O('Süleyman'),'e',"Süleyman'a"],
  [O('İsmail'),'in',"İsmail'in"], [O('Aksoy'),'i',"Aksoy'u"], [O('Samsun'),'den',"Samsun'dan"], [O('Sarıkuyu'),'e',"Sarıkuyu'ya"],
  [O('Sarıkuyu'),'in',"Sarıkuyu'nun"], [O('Halil'),'ler',"Halil'ler"], [O('Halil'),'di',"Halil'di"], [O('Elif'),'mis',"Elif'miş"],
  [{metin:'Kuşadası',ozelAd:true,iyelikli:true},'e',"Kuşadası'na"],
]);

tablo('büyük harf ve kısaltma',[
  [O('ANTEP'),'de',"ANTEP'TE"], [O('SARIKUYU'),'e',"SARIKUYU'YA"], [O('IRMAK'),'de',"IRMAK'TA"], ['TBMM','e',"TBMM'ye"], ['PTT','de',"PTT'de"],
]);

tablo('sayılar ve saatler (okunuşa göre)',[
  ['22:40','de',"22:40'ta"], ['3','de',"3'te"], ['1943','de',"1943'te"], ['1940','de',"1940'ta"], ['22:00','de',"22:00'de"],
  ['07:05','den',"07:05'ten"], ['12:30','e',"12:30'a"], ['6','de',"6'da"], ['9','de',"9'da"], ['10','de',"10'da"],
  ['2','i',"2'yi"], ['4','i',"4'ü"], ['5','i',"5'i"], ['7','in',"7'nin"], ['8','in',"8'in"], ['40','i',"40'ı"],
  ['60','den',"60'tan"], ['50','e',"50'ye"], ['100','e',"100'e"], ['2000','de',"2000'de"], ['0','e',"0'a"], ['3,5','de',"3,5'te"],
  ['1940','ler de',"1940'larda"], [1943,'de',"1943'te"], ['saat 3','de',"saat 3'te"], ['22:40','de dim',"22:40'taydım"],
]);

tablo('iyelik ve iyelikten sonra hâl ekleri (zamir n\'si)',[
  ['ev','si de','evinde'], ['baş','si e','başına'], ['oda','si i','odasını'], ['oda','si den','odasından'], ['ev','si in','evinin'], ['ev','si le','eviyle'],
  [M('Muhtarın evi'),'de','muhtarın evinde'], [M('Çeşme başı'),'e','çeşme başına'], [M('Çeşme başı'),'de','çeşme başında'],
  [M('Ağa konağı'),'den','ağa konağından'], [M('Köy odası'),'i','köy odasını'], [M('Su değirmeni'),'de','su değirmeninde'],
  [M('Harman yeri'),'in','harman yerinin'], [M('Ağa konağı'),'de dim','ağa konağındaydım'], [M('Muhtarın evi'),'de ki','muhtarın evindeki'],
  [M('Su değirmeni'),'di','su değirmeniydi'],
  ['gümüş köstekli cep saati','i','gümüş köstekli cep saatini'], ['gümüş köstekli cep saati','si','gümüş köstekli cep saati'],
  ['kurdeleyle bağlı mektuplar','si','kurdeleyle bağlı mektupları'],
  // iyeliksiz: sonu ı/i ile bitse de kök
  ['bakır sini','si','bakır sinisi'], ['mor oyalı yemeni','i','mor oyalı yemeniyi'], ['eski kapı','de','eski kapıda'],
  ['yeni köprü','de','yeni köprüde'], [{metin:'eski kantarcı',iyelikli:false},'de','eski kantarcıda'], [{metin:'başı',iyelikli:true},'de','başında'],
]);

tablo('ek-eylem ve soru eki',[
  ['ev','de dim','evdeydim'], ['değirmen','de dim','değirmendeydim'], ['konak','de mis','konaktaymış'], ['oda','di','odaydı'],
  ['değirmen','de ken','değirmendeyken'], ['ev','dir','evdir'], ['gün','ki','günkü'], ['o gece','mi','o gece mi'],
  [O('Halil'),'mi','Halil mi'], ['yatsıdan sonra','mi','yatsıdan sonra mı'], [O('Antep'),'den mi',"Antep'ten mi"],
]);

tablo('takma adlar',[
  [O('Antep'),'ta',"Antep'te"], ['değirmen','dan','değirmenden'], [O('Elif'),'ya',"Elif'e"], ['ev','nın','evin'], ['oda','sı','odası'],
  ['ev','lar','evler'], ['ev','bulunma','evde'], ['ev','de+ydim','evdeydim'],
]);

// Depodaki bütün mekân adları: bulunma, yönelme, ayrılma, belirtme
const MEKAN_BEKLENEN={
  'aga-konagi':['ağa konağında','ağa konağına','ağa konağından','ağa konağını'],
  'koy-odasi':['köy odasında','köy odasına','köy odasından','köy odasını'],
  'muhtar-evi':['muhtarın evinde','muhtarın evine','muhtarın evinden','muhtarın evini'],
  'cami':['cami ve avlusunda','cami ve avlusuna','cami ve avlusundan','cami ve avlusunu'],
  'okul':['köy okulunda','köy okuluna','köy okulundan','köy okulunu'],
  'karakol':['jandarma karakolunda','jandarma karakoluna','jandarma karakolundan','jandarma karakolunu'],
  'demirci-dukkani':['demirci dükkânında','demirci dükkânına','demirci dükkânından','demirci dükkânını'],
  'bakkal':['bakkalda','bakkala','bakkaldan','bakkalı'],
  'degirmen':['su değirmeninde','su değirmenine','su değirmeninden','su değirmenini'],
  'cesme':['çeşme başında','çeşme başına','çeşme başından','çeşme başını'],
  'mezarlik':['mezarlıkta','mezarlığa','mezarlıktan','mezarlığı'],
  'harman-yeri':['harman yerinde','harman yerine','harman yerinden','harman yerini'],
  'fistiklik':['fıstıklıkta','fıstıklığa','fıstıklıktan','fıstıklığı'],
  'bag-evi':['bağ evinde','bağ evine','bağ evinden','bağ evini'],
  'magara':['mağarada','mağaraya','mağaradan','mağarayı'],
  'sinir-patikasi':['sınır patikasında','sınır patikasına','sınır patikasından','sınır patikasını'],
  'agil':['ağılda','ağıla','ağıldan','ağılı'],
  'halil-evi':["Kör Halil'in evinde","Kör Halil'in evine","Kör Halil'in evinden","Kör Halil'in evini"],
  'gulsum-evi':["Dul Gülsüm'ün evinde","Dul Gülsüm'ün evine","Dul Gülsüm'ün evinden","Dul Gülsüm'ün evini"],
  'sultan-evi':["Kedili Nine'nin evinde","Kedili Nine'nin evine","Kedili Nine'nin evinden","Kedili Nine'nin evini"],
  'ebe-evi':["Ebe Ana'nın evinde","Ebe Ana'nın evine","Ebe Ana'nın evinden","Ebe Ana'nın evini"],
  'irgat-evi':['ırgat evinde','ırgat evine','ırgat evinden','ırgat evini'],
};
describe('depodaki mekân adları',()=>{
  it('her mekânın beklentisi yazılmış',()=>expect(Object.keys(MEKAN_BEKLENEN).sort()).toEqual(Object.keys(terimler.mekan).sort()));
  it.each(Object.entries(MEKAN_BEKLENEN))('%s',(id,b)=>{
    const v=M(terimler.mekan[id]);
    expect(['de','e','den','i'].map(e=>ekle(v,e))).toEqual(b);
  });
});

// Depodaki bütün kişi adları ve lakaplar: tamlayan, yönelme, belirtme
const KISI_BEKLENEN={
  'Mahmut Karaaslan':["Mahmut Karaaslan'ın","Mahmut Karaaslan'a","Mahmut Karaaslan'ı"],
  'Hacı Ağa':["Hacı Ağa'nın","Hacı Ağa'ya","Hacı Ağa'yı"],
  'Zeliha Karaaslan':["Zeliha Karaaslan'ın","Zeliha Karaaslan'a","Zeliha Karaaslan'ı"],
  'Hanımağa':['Hanımağanın','Hanımağaya','Hanımağayı'],
  'Cemil Karaaslan':["Cemil Karaaslan'ın","Cemil Karaaslan'a","Cemil Karaaslan'ı"],
  'Küçük Ağa':["Küçük Ağa'nın","Küçük Ağa'ya","Küçük Ağa'yı"],
  'Dursun Yıldız':["Dursun Yıldız'ın","Dursun Yıldız'a","Dursun Yıldız'ı"],
  'Muhtar':['Muhtarın','Muhtara','Muhtarı'],
  'Naciye Yıldız':["Naciye Yıldız'ın","Naciye Yıldız'a","Naciye Yıldız'ı"],
  'Muhtarın Naciye':["Muhtarın Naciye'nin","Muhtarın Naciye'ye","Muhtarın Naciye'yi"],
  'Elif Yıldız':["Elif Yıldız'ın","Elif Yıldız'a","Elif Yıldız'ı"],
  'Muhtarın Kızı':["Muhtarın Kızı'nın","Muhtarın Kızı'na","Muhtarın Kızı'nı"],
  'Abdullah Efe':["Abdullah Efe'nin","Abdullah Efe'ye","Abdullah Efe'yi"],
  'Hoca':['Hocanın','Hocaya','Hocayı'],
  'Nihat Erdem':["Nihat Erdem'in","Nihat Erdem'e","Nihat Erdem'i"],
  'Muallim':['Muallimin','Muallime','Muallimi'],
  'Rıza Demirtaş':["Rıza Demirtaş'ın","Rıza Demirtaş'a","Rıza Demirtaş'ı"],
  'Onbaşı':['Onbaşının','Onbaşıya','Onbaşıyı'],
  'Halil Kılıç':["Halil Kılıç'ın","Halil Kılıç'a","Halil Kılıç'ı"],
  'Kör Halil':["Kör Halil'in","Kör Halil'e","Kör Halil'i"],
  'Fadime Kılıç':["Fadime Kılıç'ın","Fadime Kılıç'a","Fadime Kılıç'ı"],
  "Halil'in Fadime":["Halil'in Fadime'nin","Halil'in Fadime'ye","Halil'in Fadime'yi"],
  'Bekir Çelik':["Bekir Çelik'in","Bekir Çelik'e","Bekir Çelik'i"],
  'Bekir Usta':["Bekir Usta'nın","Bekir Usta'ya","Bekir Usta'yı"],
  'Yusuf Çelik':["Yusuf Çelik'in","Yusuf Çelik'e","Yusuf Çelik'i"],
  'Demircinin Yusuf':["Demircinin Yusuf'un","Demircinin Yusuf'a","Demircinin Yusuf'u"],
  'Hatice Şahin':["Hatice Şahin'in","Hatice Şahin'e","Hatice Şahin'i"],
  'Ebe Ana':["Ebe Ana'nın","Ebe Ana'ya","Ebe Ana'yı"],
  'Arif Tok':["Arif Tok'un","Arif Tok'a","Arif Tok'u"],
  'Bakkal Arif':["Bakkal Arif'in","Bakkal Arif'e","Bakkal Arif'i"],
  'Kâzım Öztürk':["Kâzım Öztürk'ün","Kâzım Öztürk'e","Kâzım Öztürk'ü"],
  'Değirmenci':['Değirmencinin','Değirmenciye','Değirmenciyi'],
  'Hasan Kaya':["Hasan Kaya'nın","Hasan Kaya'ya","Hasan Kaya'yı"],
  'Çoban Hasan':["Çoban Hasan'ın","Çoban Hasan'a","Çoban Hasan'ı"],
  'Gülsüm Aksoy':["Gülsüm Aksoy'un","Gülsüm Aksoy'a","Gülsüm Aksoy'u"],
  'Dul Gülsüm':["Dul Gülsüm'ün","Dul Gülsüm'e","Dul Gülsüm'ü"],
  'Bektaş':["Bektaş'ın","Bektaş'a","Bektaş'ı"],
  'Deli Bektaş':["Deli Bektaş'ın","Deli Bektaş'a","Deli Bektaş'ı"],
  'Sultan Polat':["Sultan Polat'ın","Sultan Polat'a","Sultan Polat'ı"],
  'Kedili Nine':["Kedili Nine'nin","Kedili Nine'ye","Kedili Nine'yi"],
  'Kadir Bozkurt':["Kadir Bozkurt'un","Kadir Bozkurt'a","Kadir Bozkurt'u"],
  'Kâhya':['Kâhyanın','Kâhyaya','Kâhyayı'],
  'İsmail Uçar':["İsmail Uçar'ın","İsmail Uçar'a","İsmail Uçar'ı"],
  'Irgat İsmail':["Irgat İsmail'in","Irgat İsmail'e","Irgat İsmail'i"],
  'Emine Uçar':["Emine Uçar'ın","Emine Uçar'a","Emine Uçar'ı"],
  "İsmail'in Emine":["İsmail'in Emine'nin","İsmail'in Emine'ye","İsmail'in Emine'yi"],
  'Süleyman Aydın':["Süleyman Aydın'ın","Süleyman Aydın'a","Süleyman Aydın'ı"],
  'Çerçi':['Çerçinin','Çerçiye','Çerçiyi'],
};
describe('depodaki kişi adları ve lakaplar',()=>{
  it('her ad ve lakabın beklentisi yazılmış',()=>{
    const hepsi=Object.values(kisiler).flatMap(k=>[k.ad,k.lakap]);
    expect(Object.keys(KISI_BEKLENEN).sort()).toEqual([...new Set(hepsi)].sort());
  });
  it.each(Object.entries(KISI_BEKLENEN))('%s',(n,b)=>{
    expect(['in','e','i'].map(e=>ekle(K(n),e))).toEqual(b);
  });
  it('ad parçaları tek başına da doğru çekilir',()=>{
    expect(ekle(K('Kör Halil'),'le')).toBe("Kör Halil'le");
    expect(ekle(K('Muhtarın Kızı'),'de')).toBe("Muhtarın Kızı'nda");
    expect(ekle(K('Muhtarın Kızı'),'le')).toBe("Muhtarın Kızı'yla");
    expect(ekle(K('Bakkal Arif'),'den')).toBe("Bakkal Arif'ten");
    expect(ekle(K('Kâzım Öztürk'),'le')).toBe("Kâzım Öztürk'le");
    expect(ekle(K('Hoca'),'le')).toBe('Hocayla');
    expect(ekle(K('Ebe'),'den')).toBe("Ebe'den"); // kisiler.js'teki yazımla aynı
  });
});

// Depodaki eşyalar: belirtme ve iyelik ("Halil'in ... kaması")
const ESYA_BEKLENEN={
  'boynuz saplı kama':['boynuz saplı kamayı','boynuz saplı kaması'],
  'gümüş köstekli cep saati':['gümüş köstekli cep saatini','gümüş köstekli cep saati'],
  'kehribar tespih':['kehribar tespihi','kehribar tespihi'],
  'sedef kakmalı çakmak':['sedef kakmalı çakmağı','sedef kakmalı çakmağı'],
  'muhtarlık mührü':['muhtarlık mührünü','muhtarlık mührü'],
  'gri kasket':['gri kasketi','gri kasketi'],
  'kırmızı yün hırka':['kırmızı yün hırkayı','kırmızı yün hırkası'],
  'pirinç düdük':['pirinç düdüğü','pirinç düdüğü'],
  'tel çerçeveli gözlük':['tel çerçeveli gözlüğü','tel çerçeveli gözlüğü'],
  'bakır güğüm':['bakır güğümü','bakır güğümü'],
  'örme kırbaç':['örme kırbacı','örme kırbacı'],
  'yamalı çarık':['yamalı çarığı','yamalı çarığı'],
  'bakır sini':['bakır siniyi','bakır sinisi'],
  'jandarma tüfeği':['jandarma tüfeğini','jandarma tüfeği'],
  'yanık izli deri önlük':['yanık izli deri önlüğü','yanık izli deri önlüğü'],
  'keçe kepenek':['keçe kepeneği','keçe kepeneği'],
};
describe('depodaki eşyalar',()=>{
  it('tablodaki eşyalar depoda var',()=>{
    const hepsi=new Set(Object.values(kisiler).flatMap(k=>Object.values(k.esyalar)));
    for(const e of Object.keys(ESYA_BEKLENEN)) expect(hepsi.has(e)).toBe(true);
  });
  it.each(Object.entries(ESYA_BEKLENEN))('%s',(e,b)=>expect([ekle(e,'i'),ekle(e,'si')]).toEqual(b));
  it('bütün eşyalar hatasız çekilir',()=>{
    for(const k of Object.values(kisiler)) for(const e of Object.values(k.esyalar)) for(const x of ['de','den','e','i','in','le','si'])
      expect(ekle(e,x)).toMatch(/^[^']+$/);
  });
});

describe('yardımcılar ve hatalar',()=>{
  it('sayının son okunan sözcüğü',()=>{
    expect([0,1,3,10,40,100,1943,1000,2000,1000000,30000].map(sayiSonSozcuk)).toEqual(['sıfır','bir','üç','on','kırk','yüz','üç','bin','bin','milyon','bin']);
  });
  it('iyelik sezgisi',()=>{
    expect(iyelikliMi('Çeşme başı')).toBe(true);
    expect(iyelikliMi('Mağara')).toBe(false);
    expect(iyelikliMi('Muhtarın Kızı',true)).toBe(true);
    expect(iyelikliMi('Kedili Nine',true)).toBe(false);
    expect(iyelikliMi('Sarıkuyu',true)).toBe(false);
    expect(iyelikliMi('bakır sini')).toBe(false);
  });
  it('değer çözümleme',()=>{
    expect(degerCoz('Ağa konağı')).toEqual({metin:'Ağa konağı',ozelAd:false,iyelikli:true});
    expect(degerCoz(3)).toEqual({metin:'3',ozelAd:true,iyelikli:false});
    expect(K('Hoca').ozelAd).toBe(false);
    expect(K('Kör Halil').ozelAd).toBe(true);
    expect(M('Kör Halil\'in evi').metin).toBe("Kör Halil'in evi");
    expect(M('Irgat evi').metin).toBe('ırgat evi');
  });
  it('kısa adlı işlevler',()=>{
    const a=O('Antep');
    expect([bulunma(a),ayrilma(a),yonelme(a),belirtme(a),tamlayan(a),ile(a),cogul(a),iyelik(a)])
      .toEqual(["Antep'te","Antep'ten","Antep'e","Antep'i","Antep'in","Antep'le","Antep'ler","Antep'i"]);
  });
  it('takma adlar kanonik eke iner',()=>{
    for(const [k,l] of Object.entries(EK_ADLARI)) for(const t of l) expect(ekAdiCoz(t)).toBe(k);
  });
  it('açık hatalar',()=>{
    expect(()=>ekle('ev','xyz')).toThrow(/Bilinmeyen ek/);
    expect(()=>ekle('','de')).toThrow(/boş/);
    expect(()=>ekle(M('Çeşme başı'),'ler')).toThrow(/çoğul/);
    expect(()=>ekle('brr','de')).toThrow(/Ünlüsüz/);
  });
  it('eksiz çağrı metni değiştirmez',()=>expect(ekle(O('Antep'))).toBe('Antep'));
});
