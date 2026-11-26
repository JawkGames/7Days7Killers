// Çizelge: herkes, her gün, her dilimde hangi mekânda ve neden orada.
// Tek değerli dizi: bir kişi bir dilimde yalnızca bir yerdedir. Ölen kişi ölüm diliminden sonra null olur.
// Yerleştirme `koy` üzerinden yapılır; cinayet, tanıklık ve bulma gibi sonradan bozulmaması gereken
// dilimler kilitlenir ve kilitli dilimin üstüne yazmak hata verir (kod hatasıdır, tohum sorunu değil).

export function cizelgeKur(d){
  const T=d.zaman.T, yer={}, neden={}, kilit={};
  for(const k of d.ids){yer[k]=Array(T).fill(null); neden[k]=Array(T).fill(null); kilit[k]=Array(T).fill(false);}
  return {
    yer,neden,T,
    koy(k,t,m,n,kilitle=false){
      if(kilit[k][t]) throw new Error(`çizelge: ${k} için ${t} dilimi kilitli`);
      yer[k][t]=m; neden[k][t]=n; if(kilitle) kilit[k][t]=true;
    },
    kilitle(k,t){kilit[k][t]=true;},
    kilitli:(k,t)=>kilit[k][t],
    bos:(k,t)=>t>=0&&t<T&&!kilit[k][t]&&yer[k][t]!==null, // canlı ve oynatılabilir
    canli:(k,t)=>t>=0&&t<T&&yer[k][t]!==null,
    orada:(m,t)=>d.ids.filter(k=>yer[k][t]===m),
    oldur(k,t){
      for(let u=t+1;u<T;u++){
        if(kilit[k][u]) throw new Error(`çizelge: ölen ${k} için ${u} dilimi kilitli`);
        yer[k][u]=null; neden[k][u]='olu'; kilit[k][u]=true;
      }
    },
  };
}

const varMi=(d,m)=>!!d.koy.mekanlar[m];

// Gizli ya da düzenli etkinlikler: sırlardan ve ilişkilerden okunur. Her biri gün başına bir kez yoklanır.
// {kimler:[...], dilimler:[...], olasilik, yer:(z)=>mekan, neden:{kisi:neden}, katilim?:{kisi:olasilik}}
function etkinlikler(d){
  const l=[], tekBasina=id=>(d.evHalki[d.kisi(id).ev]||[]).length===1;
  const issiz=d.mekanIds.filter(m=>d.mekanTuru(m)==='kir'&&!d.ids.some(k=>d.kisi(k).ev===m||d.kisi(k).is===m));
  const kirdaYasayan=id=>d.mekanTuru(d.kisi(id).ev)==='kir';
  const sirSahibi=(id,tur)=>d.sirlar.some(s=>s.sahip===id&&s.tur===tur);
  const goruldu=new Set();
  for(const s of d.sirlar){
    const A=s.sahip;
    // Karşılıklı yasak aşk: biri yalnız yaşıyorsa gece onun evinde; değilse akşam ıssız bir yerde.
    if(s.tur==='yasak-ask') for(const B of s.kimler){
      const karsi=d.sirlar.find(x=>x.sahip===B&&x.tur==='yasak-ask'&&x.kimler.includes(A));
      if(karsi){
        const anahtar=[A,B].sort().join('|'); if(goruldu.has(anahtar)) continue; goruldu.add(anahtar);
        const ev=tekBasina(B)&&d.kisi(A).cinsiyet==='E'?d.kisi(B).ev:tekBasina(A)&&d.kisi(B).cinsiyet==='E'?d.kisi(A).ev:null;
        const neden={[A]:'sir:'+s.id,[B]:'sir:'+karsi.id};
        if(ev) l.push({kimler:[A,B],dilimler:['gece'],olasilik:.35,yer:()=>ev,neden});
        else if(issiz.length) l.push({kimler:[A,B],dilimler:['aksam'],olasilik:.25,yer:z=>z.sec(issiz),neden});
      }else{
        // Karşılıksız sevda: akşamları sevdiğinin evine bakan bir yerde.
        const yakin=(d.harita[d.kisi(B).ev]||[]).filter(m=>d.mekanTuru(m)!=='ev');
        if(yakin.length) l.push({kimler:[A],dilimler:['aksam'],olasilik:.2,yer:z=>z.sec(yakin),neden:{[A]:'sir:'+s.id}});
      }
    }
    // Köy dışından mal getiren: bazı geceler iş yerinde (sınırda). Pay alan da o gece oradadır.
    if(s.tur==='kacakcilik'&&d.kisi(A).is&&d.mekanTuru(d.kisi(A).is)==='kir'){
      const yer=d.kisi(A).is, eslik=d.sirlar.filter(x=>x.tur==='rusvet'&&x.kimler.includes(A));
      const neden={[A]:'sir:'+s.id}, katilim={};
      for(const x of eslik){neden[x.sahip]='sir:'+x.id; katilim[x.sahip]=.7;}
      l.push({kimler:[A,...eslik.map(x=>x.sahip)],dilimler:['gece'],olasilik:.4,yer:()=>yer,neden,katilim});
    }
    // Köy dışında saklanan bir kaçağa yemek taşıyan (sırrın içinde mağarada yaşayan bir kaçak var).
    const kacak=s.kimler.find(k=>k!==A&&kirdaYasayan(k)&&sirSahibi(k,'firar'));
    if(kacak) l.push({kimler:[A],dilimler:['aksam','gece'],olasilik:.25,yer:()=>d.kisi(kacak).ev,neden:{[A]:'sir:'+s.id}});
    // Kimseye bağlı olmayan "bilgi" sırrı (gece dolaşan meczup): geceleri köyü dolaşır.
    if(s.tur==='bilgi'&&!s.kimler.length&&!d.kisi(A).is){
      const yerler=d.mekanIds.filter(m=>d.mekanTuru(m)==='ortak'||d.mekanTuru(m)==='ev');
      l.push({kimler:[A],dilimler:['gece'],olasilik:.7,yer:z=>z.sec(yerler),neden:{[A]:'sir:'+s.id}});
    }
    // İntikam peşindeki: ikindileri mezarlıkta.
    if(s.tur==='intikam'&&varMi(d,'mezarlik')) l.push({kimler:[A],dilimler:['ikindi'],olasilik:.15,yer:()=>'mezarlik',neden:{[A]:'mezar-ziyareti'}});
  }
  // Suç ortakları ara sıra akşam buluşur (birinin köy içindeki iş yerinde ya da evinde).
  for(const A of d.ids) for(const i of d.iliskiler[A]){
    if(i.tur!=='ortak'||i.kime<A) continue;
    const B=i.kime, koyIci=id=>[d.kisi(id).is,d.kisi(id).ev].find(m=>m&&d.mekanTuru(m)!=='kir');
    const yer=koyIci(A)||koyIci(B);
    if(yer) l.push({kimler:[A,B],dilimler:['aksam'],olasilik:.12,yer:()=>yer,neden:{[A]:'ortaklik:'+B,[B]:'ortaklik:'+A}});
  }
  return l;
}

// Sıradan gün: ev, iş, çeşme, bakkal, köy odası, cami. Ağırlıklar mizaç, cinsiyet ve yaşla değişir.
function temelAdaylar(d,id,dilim){
  const k=d.kisi(id), ev=k.ev, is=k.is, kadin=k.cinsiyet==='K';
  const l=[];
  const ekle=(m,w,n)=>{if(m&&varMi(d,m)) l.push({m,w,n});};
  if(is&&is===ev&&d.mekanTuru(ev)==='kir'){ekle(ev,1,'is'); return l;} // ağılda, mağarada yaşayan
  if(dilim==='gece') ekle(ev,1,'ev');
  else if(dilim==='aksam'){
    ekle(ev,.7,'ev');
    if(kadin) ekle('cesme',.1,'su'); else {ekle('koy-odasi',.2,'sohbet'); ekle('cami',.1,'ibadet');}
  }else if(is){
    const isW=dilim==='sabah'?.85:dilim==='ogle'?.8:.65;
    ekle(is,isW,'is'); ekle(ev,dilim==='ikindi'?.1:.1,'ev');
    if(dilim!=='sabah') ekle('bakkal',.1,'alisveris');
    if(dilim==='ikindi') ekle(kadin?'cesme':'koy-odasi',.15,kadin?'su':'sohbet');
  }else if(kadin){
    ekle(ev,dilim==='sabah'?.5:.6,'ev'); ekle('cesme',dilim==='sabah'?.5:.15,'su');
    if(dilim!=='sabah'){ekle('bakkal',.15,'alisveris'); ekle('degirmen',.08,'ogutme');}
  }else{
    ekle(ev,.3,'ev'); ekle('koy-odasi',.4,'sohbet'); ekle('cami',.15,'ibadet');
    if(dilim!=='sabah') ekle('bakkal',.15,'alisveris');
    if(k.mizac==='saf') for(const m of d.mekanIds) if(d.mekanTuru(m)==='ortak') ekle(m,.1,'dolasma');
  }
  if(k.mizac==='dedikoducu'&&dilim!=='gece') for(const [m,n] of [['cesme','su'],['bakkal','alisveris'],['koy-odasi','sohbet']]) ekle(m,.15,n);
  if(k.yas>=70) for(const a of l) if(a.m===ev) a.w*=3;
  if(!l.length) ekle(ev,1,'ev');
  return l;
}

// Bütün köyün sıradan yedi gününü kurar. Dönen nesne cizelgeKur nesnesidir.
export function rutinKur(d,z){
  const cz=cizelgeKur(d), ay=d.ayar, liste=etkinlikler(d);
  for(let g=1;g<=ay.gunSayisi;g++){
    // 1) Sıradan yerler.
    for(const id of d.ids) for(const dl of ay.dilimler){
      const a=z.agirlikli(temelAdaylar(d,id,dl));
      cz.koy(id,d.zaman.t(g,dl),a.m,a.n);
    }
    // 2) Dost ziyareti (ikindi): dostu o sırada köy içinde neredeyse oraya gider.
    for(const id of d.ids) for(const i of d.iliskiler[id]){
      if(i.tur!=='dost'||!z.olasilik(.18)) continue;
      const t=d.zaman.t(g,'ikindi'); const m=cz.yer[i.kime][t];
      if(m&&d.mekanTuru(m)!=='kir'&&d.mekanTuru(cz.yer[id][t])!=='kir') cz.koy(id,t,m,'ziyaret:'+i.kime);
    }
    // 3) Gizli ve düzenli etkinlikler (sıradan yerin üstüne yazar).
    for(const e of liste){
      if(!z.olasilik(e.olasilik)) continue;
      const dl=z.sec(e.dilimler), t=d.zaman.t(g,dl), m=e.yer(z);
      if(!varMi(d,m)) continue;
      for(const k of e.kimler){
        if(e.katilim&&e.katilim[k]!=null&&!z.olasilik(e.katilim[k])) continue;
        cz.koy(k,t,m,e.neden[k]);
      }
    }
  }
  return cz;
}
