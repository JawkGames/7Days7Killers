// Ses tarifleri: her efektin ve ortam olayının sayıları burada, saf veri olarak üretilir.
// Web Audio'yu tanımaz; aynı tohum hep aynı tarifi verir (testler/ses.test.js).
// Çalan taraf (efektler.js, ortamlar.js) bu tarifi düğümlere çevirir.

// Kulağa ölçü: bütün frekanslar alçak-orta bölgede tutulur, parlak ve tiz bir şey yoktur.

export const EFEKTLER=Object.freeze(['daktilo','kapi-ac','kapi-kapa','sandalye','adim','sayfa','kalem','iz','gun','geri-sar','hukum']);
// Ortamların içinde kendiliğinden çalan olaylar (dışarıdan da `efekt` ile çağrılabilir).
export const ORTAM_OLAYLARI=Object.freeze(['tahta','havlama','baykus','hisirti','tik','citirti','tas','cam','bagiris','tezahurat']);
export const ORTAMLAR=Object.freeze(['sorgu-odasi','fotograf-masasi','gece-koy','kayip','pencere-cosku','pencere-ofke']);

const ara=(r,a,b)=>a+(b-a)*r();
const sinirla=(x,a,b)=>Math.min(b,Math.max(a,x));
export const siddetAl=s=>Number.isFinite(s)?sinirla(s,0,1.5):1;

// Rastgele yürüyen eğri (setValueCurveAtTime için). Uçlar bas/son'a çekilir.
export function yuruyenEgri(r,n,{bas=1,son=1,oynama=.15,yumusak=.7}={}){
  const e=new Float32Array(n); let y=0;
  for(let i=0;i<n;i++){
    y=y*yumusak+(r()*2-1)*oynama*(1-yumusak);
    const t=n>1?i/(n-1):0;
    e[i]=bas+(son-bas)*t+y*4;
  }
  e[0]=bas; e[n-1]=son;
  return e;
}

// Gıcırtı (kapı, tahta, sandalye): sürtünme-kayma titreşimi; hız eğrisi ve tahta rezonansları.
function gicirti(r,{sure,taban,tepe,kazanc,bas=0}){
  const n=Math.max(8,Math.round(sure*40)), hiz=new Float32Array(n);
  let y=0;
  for(let i=0;i<n;i++){
    const t=i/(n-1), kabarma=Math.sin(Math.PI*Math.pow(t,.7));
    y=y*.8+(r()*2-1)*.2;
    hiz[i]=Math.max(8,taban+(tepe-taban)*kabarma+y*taban*.6);
  }
  const zarf=yuruyenEgri(r,n,{bas:0,son:0,oynama:.35,yumusak:.55});
  for(let i=0;i<n;i++){const t=i/(n-1); zarf[i]=sinirla(Math.sin(Math.PI*t)*(.7+zarf[i]),0,1.2);}
  zarf[0]=0; zarf[n-1]=0;
  const rez=[
    {f:ara(r,330,430),q:ara(r,6,9),g:1},
    {f:ara(r,760,960),q:ara(r,8,11),g:.55},
    {f:ara(r,1450,1750),q:ara(r,9,12),g:.18}
  ];
  return {bas,sure,hiz,zarf,rez,kazanc};
}

// Kısa gövde vuruşu: alçak sinüs + süzülmüş gürültü (adım, kapı çarpması, hüküm).
const vurus=(r,{zaman=0,f,dus=.7,sure,gurultuF,kazanc,gurultuKazanc=.6})=>({zaman,f:f*ara(r,.95,1.05),dus,sure,gurultuF,kazanc,gurultuKazanc});

const TARIF={
  daktilo:(r,s)=>({sure:.07,kazanc:.05*s,pan:ara(r,-.12,.12),
    tik:{f:ara(r,1100,1700),q:ara(r,1.8,3),sure:.005},
    govde:{f:ara(r,140,210),sure:.03,kazanc:.7}}),

  'kapi-ac':(r,s)=>{
    const g=gicirti(r,{sure:ara(r,1.3,1.8),taban:ara(r,16,22),tepe:ara(r,45,62),kazanc:.32*s,bas:.08});
    return {sure:g.bas+g.sure+.3,pan:ara(r,-.35,-.15),gicirti:g,
      mandal:{zaman:0,f:ara(r,700,900),kazanc:.05*s},yanki:.3};
  },
  'kapi-kapa':(r,s)=>{
    const g=gicirti(r,{sure:ara(r,.45,.65),taban:ara(r,22,28),tepe:ara(r,50,70),kazanc:.16*s});
    const z=g.sure+.03;
    return {sure:z+.9,pan:ara(r,-.35,-.15),gicirti:g,
      carpma:vurus(r,{zaman:z,f:58,dus:.65,sure:.5,gurultuF:380,kazanc:.34*s}),
      mandal:{zaman:z+.02,f:ara(r,600,800),kazanc:.04*s},yanki:.35};
  },
  sandalye:(r,s)=>{
    const sure=ara(r,.55,.85), n=Math.round(sure*60);
    return {sure:sure+.35,pan:ara(r,-.1,.1),
      surtunme:{sure,fEgri:yuruyenEgri(r,n,{bas:ara(r,260,340),son:ara(r,380,480),oynama:30,yumusak:.6}),
        zarf:yuruyenEgri(r,n,{bas:0,son:0,oynama:.4,yumusak:.4}).map((v,i)=>sinirla(Math.sin(Math.PI*i/(n-1))*(.6+v),0,1.3)),q:2.2,kazanc:.2*s},
      gicirti:r()<.6?gicirti(r,{sure:ara(r,.2,.35),taban:30,tepe:55,kazanc:.07*s,bas:ara(r,.1,.3)}):null,
      oturma:vurus(r,{zaman:sure+.02,f:80,sure:.25,gurultuF:300,kazanc:.12*s})};
  },
  adim:(r,s,{sayi=1}={})=>{
    sayi=sinirla(Math.round(sayi)||1,1,12);
    const adimlar=[]; let t=0;
    for(let i=0;i<sayi;i++){
      adimlar.push(vurus(r,{zaman:t,f:ara(r,60,72),dus:.6,sure:.28,gurultuF:ara(r,180,260),kazanc:ara(r,.18,.24)*s,gurultuKazanc:.9}));
      t+=ara(r,.85,1.05);
    }
    return {sure:t+.2,pan:ara(r,-.15,.15),adimlar,gicirti:r()<.35?gicirti(r,{sure:.25,taban:24,tepe:40,kazanc:.04*s,bas:ara(r,.05,.15)}):null,yanki:.25};
  },
  sayfa:(r,s)=>{
    const sure=ara(r,.32,.42), n=24;
    const citir=[]; for(let i=0,k=3+Math.floor(r()*4);i<k;i++) citir.push({zaman:ara(r,0,sure),kazanc:ara(r,.3,1)});
    return {sure:sure+.15,pan:ara(r,-.1,.1),sure0:sure,
      supurme:{fEgri:yuruyenEgri(r,n,{bas:ara(r,500,700),son:ara(r,700,900),oynama:120,yumusak:.5}).map((v,i)=>v+900*Math.sin(Math.PI*i/(n-1))),q:.9,kazanc:.22*s},
      citir};
  },
  kalem:(r,s)=>{
    const cizgiler=[]; let t=0;
    for(let i=0,k=2+Math.floor(r()*3);i<k;i++){const d=ara(r,.07,.17); cizgiler.push({zaman:t,sure:d,f:ara(r,1100,1700),kazanc:ara(r,.6,1)}); t+=d+ara(r,.03,.09);}
    return {sure:t+.1,pan:ara(r,-.1,.1),cizgiler,kazanc:.16*s,q:1.3};
  },
  iz:(r,s)=>{
    const notalar=[392,415.3,440,466.16]; // alçak ve tek: bağırmayan bir hatırlatma
    return {sure:2.8,f:notalar[Math.floor(r()*notalar.length)]*ara(r,.998,1.002),kazanc:.075*s,ikinci:.06,acilis:.04,sonum:2.4,yanki:.4};
  },
  gun:(r,s)=>{
    const temel=ara(r,92,102);
    // çan kısmileri (alt uğultu, asıl, yarım ses düşük üçlü, beşli, oktav) ve sönümleri
    const kismiler=[[.5,.5,3.6],[1,1,2.8],[1.19,.45,1.9],[1.5,.3,1.5],[2,.22,1.2],[2.61,.1,.8]]
      .map(([k,g,d])=>({f:temel*k*ara(r,.997,1.003),g,d}));
    return {sure:5,kazanc:.11*s,kismiler,davul:vurus(r,{f:52,dus:.75,sure:.7,gurultuF:220,kazanc:.28*s}),yanki:.5};
  },
  'geri-sar':(r,s)=>({sure:2.5,tohum:Math.floor(r()*2**31),kazanc:.22*s,temel:ara(r,104,116),hiz:[.82,1.18],suzgec:[350,1800],yanki:.25}),
  hukum:(r,s)=>({sure:4.2,vurus:vurus(r,{f:50,dus:.72,sure:1.6,gurultuF:170,kazanc:.4*s,gurultuKazanc:.7}),
    alt:{f:34,sure:2.6,kazanc:.14*s},yanki:.55}),

  // ---- ortam olayları ----
  tahta:(r,s)=>{const g=gicirti(r,{sure:ara(r,.25,.6),taban:ara(r,18,26),tepe:ara(r,30,48),kazanc:.13*s}); return {sure:g.sure+.2,pan:ara(r,-.8,.8),gicirti:g,suzgec:1400,yanki:.5};},
  havlama:(r,s)=>{
    const havlamalar=[]; let t=0;
    for(let i=0,k=1+Math.floor(r()*3);i<k;i++){havlamalar.push({zaman:t,f:ara(r,330,420),sure:ara(r,.12,.18)}); t+=ara(r,.28,.5);}
    return {sure:t+.6,pan:ara(r,-.9,.9),havlamalar,formant:ara(r,650,850),suzgec:1100,kazanc:.032*s,yanki:.8};
  },
  baykus:(r,s)=>{
    const ulumalar=[]; let t=0;
    for(let i=0,k=2+Math.floor(r()*2);i<k;i++){const d=i===0?ara(r,.3,.4):ara(r,.45,.7); ulumalar.push({zaman:t,f:ara(r,340,380),dus:ara(r,.9,.95),sure:d}); t+=d+ara(r,.2,.35);}
    return {sure:t+.6,pan:ara(r,-.9,.9),ulumalar,kazanc:.05*s,yanki:.7};
  },
  hisirti:(r,s)=>({sure:ara(r,.25,.6),pan:ara(r,-.3,.3),f:ara(r,700,1300),q:.8,kazanc:ara(r,.025,.05)*s,parca:3+Math.floor(r()*4)}),
  tik:(r,s,{tok=false}={})=>({sure:.05,f:tok?ara(r,1050,1150):ara(r,1350,1450),govde:tok?520:600,kazanc:.09*s,pan:.25}),
  citirti:(r,s)=>({sure:.03,f:ara(r,1500,2300),kazanc:ara(r,.025,.06)*s,pan:ara(r,-.1,.1)}),
  tas:(r,s)=>({sure:1.1,pan:ara(r,-.6,.6),vurus:{f:ara(r,140,190),sure:.08,kazanc:.17*s},
    cinlama:[{f:ara(r,1250,1500),d:.35},{f:ara(r,2050,2400),d:.22},{f:ara(r,2900,3300),d:.12}],cinlamaKazanc:.03*s,yanki:.35}),
  cam:(r,s)=>{
    const parcalar=[]; for(let i=0,k=14+Math.floor(r()*10);i<k;i++) parcalar.push({zaman:Math.pow(r(),1.7)*.9,f:ara(r,1200,3400),kazanc:ara(r,.2,1)});
    return {sure:1.8,pan:ara(r,-.5,.5),vurus:{f:ara(r,120,160),sure:.12,kazanc:.15*s},parcalar,parcaKazanc:.03*s,
      kirilma:{f:1800,sure:.5,kazanc:.045*s},yanki:.4};
  },
  bagiris:(r,s)=>({sure:ara(r,1.2,2.6),pan:ara(r,-.7,.7),formantlar:[ara(r,480,620),ara(r,950,1200)],q:4,kazanc:ara(r,.45,.65)*s}),
  tezahurat:(r,s)=>({sure:ara(r,2,3.4),pan:ara(r,-.5,.5),f:ara(r,600,850),q:1.1,kazanc:ara(r,.15,.22)*s})
};

// Efekt ya da ortam olayının tarifi. Bilinmeyen ad için null.
export function efektTarifi(ad,{siddet,r,...ek}={}){
  const f=TARIF[ad];
  if(!f||typeof r!=='function') return null;
  const t=f(r,siddetAl(siddet),ek);
  t.ad=ad;
  return t;
}

// ---- ortam tarifleri ----
// katman türleri: gurultu (renk, süzgeçler, gezinme), ton (sürekli ses), alkis (doku), cirlama (cırcır böceği).
// gezinme: belirli aralıklarla kazancı ve ilk süzgecin frekansını rastgele yeni bir hedefe kaydırır (rüzgâr esintisi gibi).
// olaylar: Poisson'a yakın aralıklarla kendiliğinden çalan olaylar. ort/enAz saniye; ilk: ilk olayın aralığı.
// seviye: ortamın toplam kazancı. grup: pencere ortamında katmanın coşkuya mı öfkeye mi ait olduğu (`oran` ile karışır).
const ORTAM_TARIFLERI={
  'sorgu-odasi':{
    seviye:1.29,
    katmanlar:[
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'lowpass',f:120,q:.5}],kazanc:.05,gezinme:{aralik:[3,7],kazanc:[.85,1.05]}},
      {tur:'ton',isik:'ampul',kismiler:[[100,.011],[200,.005],[300,.002]],gezinme:{aralik:[.8,3],kazanc:[.6,1.1]}},
      {tur:'gurultu',isik:'lamba',renk:'pembe',suzgecler:[{tur:'bandpass',f:420,q:.7},{tur:'lowpass',f:1600,q:.5}],kazanc:.02,gezinme:{aralik:[.4,1.5],kazanc:[.7,1.1]}},
      {tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:1900,q:1.2},{tur:'lowpass',f:3200,q:.5}],kazanc:.007,gezinme:{aralik:[.3,1.2],kazanc:[.4,1.2]}},
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'bandpass',f:330,q:1.1}],kazanc:.17,pan:-.3,gezinme:{aralik:[1.5,4],kazanc:[.08,1],frekans:[240,460]}}
    ],
    olaylar:[
      {tur:'citirti',ort:2.2,enAz:.15,ilk:[.5,2]},
      {tur:'tahta',ort:16,enAz:6,ilk:[3,8]},
      {tur:'havlama',ort:55,enAz:25,ilk:[18,45]}
    ]
  },
  'fotograf-masasi':{
    seviye:1.48,
    katmanlar:[
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'lowpass',f:150,q:.5}],kazanc:.05,gezinme:{aralik:[4,8],kazanc:[.85,1.05]}},
      {tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:600,q:.6},{tur:'lowpass',f:1500,q:.5}],kazanc:.012}
    ],
    olaylar:[
      {tur:'tik',duzenli:1,ilk:[.3,.3]},
      {tur:'hisirti',ort:5.5,enAz:1.5,ilk:[1,3]},
      {tur:'tahta',ort:28,enAz:12,ilk:[9,20],kazanc:.6}
    ]
  },
  'gece-koy':{
    katmanlar:[
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'bandpass',f:380,q:.8}],kazanc:.17,gezinme:{aralik:[2,5],kazanc:[.15,1],frekans:[260,560]}},
      {tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:720,q:5},{tur:'lowpass',f:1400,q:.5}],kazanc:.022,pan:.35,gezinme:{aralik:[3,7],kazanc:[0,1],frekans:[560,900]}},
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'lowpass',f:110,q:.5}],kazanc:.04},
      {tur:'cirlama',f:[2500,3000],kazanc:.02,pan:-.45,nabiz:[3,4],aralik:[.55,.8],suzgec:3200},
      {tur:'cirlama',f:[2300,2800],kazanc:.013,pan:.55,nabiz:[2,3],aralik:[.7,1.1],suzgec:3000}
    ],
    olaylar:[
      {tur:'baykus',ort:20,enAz:9,ilk:[3,7]},
      {tur:'havlama',ort:70,enAz:30,ilk:[25,60],kazanc:.7}
    ]
  },
  kayip:{
    seviye:.87,
    katmanlar:[
      {tur:'ton',kismiler:[[55,.017],[55.35,.013],[82.6,.0085],[110.1,.0035]],suzgec:{tur:'lowpass',f:260,q:.5},gezinme:{aralik:[5,10],kazanc:[.55,1]},acilis:4},
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'bandpass',f:320,q:.7}],kazanc:.17,gezinme:{aralik:[3,7],kazanc:[.3,1],frekans:[220,480]}},
      {tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:640,q:6},{tur:'lowpass',f:1200,q:.5}],kazanc:.014,pan:-.4,gezinme:{aralik:[4,9],kazanc:[0,1],frekans:[480,780]}}
    ],
    olaylar:[]
  },
  pencere:{
    grupSeviye:{cosku:1.0,ofke:.8},
    katmanlar:[
      // ortak: kalabalığın uzak uğultusu
      {tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:420,q:.9},{tur:'lowpass',f:1500,q:.5}],kazanc:.08,gezinme:{aralik:[1,3],kazanc:[.55,1.05],frekans:[360,520]}},
      {tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'lowpass',f:220,q:.5}],kazanc:.05},
      // coşku: daha açık bir uğultu ve alkış
      {grup:'cosku',tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:780,q:1.1},{tur:'lowpass',f:2200,q:.5}],kazanc:.05,gezinme:{aralik:[.8,2.5],kazanc:[.25,1.2],frekans:[650,950]}},
      {grup:'cosku',tur:'alkis',suzgecler:[{tur:'bandpass',f:1300,q:.7},{tur:'lowpass',f:2600,q:.5}],kazanc:.06,gezinme:{aralik:[1.5,4],kazanc:[.3,1]}},
      // öfke: alçak, pürüzlü, dalgalanan uğultu
      {grup:'ofke',tur:'gurultu',renk:'kahverengi',suzgecler:[{tur:'bandpass',f:300,q:1.4}],kazanc:.1,gezinme:{aralik:[.6,2],kazanc:[.4,1.1],frekans:[240,380]}},
      {grup:'ofke',tur:'gurultu',renk:'pembe',suzgecler:[{tur:'bandpass',f:560,q:2.5},{tur:'lowpass',f:1400,q:.5}],kazanc:.045,gezinme:{aralik:[.7,2.2],kazanc:[.2,1.1],frekans:[480,680]}}
    ],
    olaylar:[
      {grup:'cosku',tur:'tezahurat',ort:2.8,enAz:1,ilk:[.5,2]},
      {grup:'ofke',tur:'bagiris',ort:2.4,enAz:.6,ilk:[.3,1.5]},
      {grup:'ofke',tur:'tas',ort:4.5,enAz:1.5,ilk:[1.5,3.5]},
      {grup:'ofke',tur:'cam',ort:22,enAz:10,ilk:[5,8],esik:.55}
    ]
  }
};

const ADLAR={'pencere-cosku':['pencere',0],'pencere-ofke':['pencere',1]};
const kopya=o=>JSON.parse(JSON.stringify(o));

// Ortamın çözülmüş tarifi: {ad, temel, oran, seviye, grupSeviye, katmanlar, olaylar}.
// seviye ve grupSeviye ortamları birbirine denkleştirir (ölçümle ayarlandı: RMS ≈ -35 dBFS, düzey 1'de). Bilinmeyen ad için null.
// isik: sorgu odasında 'ampul' (100 Hz uğultu) ya da 'lamba' (gaz lambası hışırtısı).
export function ortamTarifi(ad,{oran,isik='ampul'}={}){
  const [temel,vars]=ADLAR[ad]??[ad,null];
  const t=ORTAM_TARIFLERI[temel];
  if(!t) return null;
  const o=Number.isFinite(oran)?sinirla(oran,0,1):(vars??0);
  const katmanlar=kopya(t.katmanlar).filter(k=>!k.isik||k.isik===isik);
  return {ad,temel,oran:o,seviye:t.seviye??1,grupSeviye:{...t.grupSeviye},katmanlar,olaylar:kopya(t.olaylar)};
}

// Bir sonraki olayın zamanı: enAz + üstel bekleme (ort-enAz ortalamalı), 4*ort ile sınırlı.
export function sonrakiZaman(r,simdi,{ort,enAz=0,duzenli}){
  if(duzenli) return simdi+duzenli;
  const b=Math.max(.01,ort-enAz);
  return simdi+enAz+Math.min(-Math.log(1-r()*.999999)*b,ort*4);
}

export const ilkZaman=(r,simdi,olay)=>simdi+(olay.ilk?ara(r,olay.ilk[0],olay.ilk[1]):sonrakiZaman(r,0,olay));

// Pencere: eşit güçlü karışım. oran 0 -> coşku, 1 -> öfke.
export const grupKazanci=(grup,oran)=>grup==='cosku'?Math.cos(oran*Math.PI/2):grup==='ofke'?Math.sin(oran*Math.PI/2):1;

// Bir olayın o an çalıp çalmayacağı: gruba ait olaylar oranla seyrekleşir (öfkede taş, coşkuda tezahürat).
export function olayCalsinMi(r,olay,oran){
  if(!olay.grup) return true;
  const p=olay.grup==='ofke'?oran:1-oran;
  if(olay.esik!==undefined&&p<olay.esik) return false;
  return r()<p;
}
