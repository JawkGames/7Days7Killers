// Beş kayıp şablonu. Kişinin `kayip.tur` alanı şablonu seçer; şablon bir yer (yerler.js) üstüne
// kendi kuralını koyar: kimler bekler, hangi hayvanlar, ışık ne kadar zayıf.
// kur(k) => {ogeler:[...], ton:{karanlik, soguk}}; k = {yer, ip, kisi, bekleyenler, r}
import {rng} from '../../../cekirdek/rastgele.js';

// bekleyen kişinin silüet tipi: veri varsa cinsiyetinden, yoksa sırayla
function tipBul(k,i){
  const b=k.bekleyenler&&k.bekleyenler[i];
  if(b&&b.cinsiyet) return b.cinsiyet==='K'?'kadin':'erkek';
  return i%2?'erkek':'kadin';
}
// yerdeki boş oturma/ayakta durma noktalarından sırayla al
function yerAl(yer,tur,sira){const L=(tur==='ayakta'?yer.ayakta:yer.oturma)||[]; return L[sira];}

// ek bekleyenler: KOY-HALKI cümlesindeki çocuklar, kadınlar, borçlular
function ekler(k,ogeler,sayac){
  const e=k.ip.ekBekleyen; if(!e) return;
  const liste=Array.isArray(e)?e:[e];
  for(const b of liste) for(let i=0;i<b.sayi;i++){
    const tur=b.ayakta?'ayakta':'oturan', y=yerAl(k.yer,b.ayakta?'ayakta':'oturma',sayac[tur]++);
    if(!y) break;
    ogeler.push({siluet:tur,x:y[0],y:y[1],s:y[2],tip:b.tip||'cocuk',kiz:i%2===0,egik:(b.egik==null?.6:b.egik)*(i%3===1?.3:1),seed:30+i});
  }
}

export const SABLON={
  /* ailesi bekler: ev içi; bekleyenler karanlıkta oturan silüetler (sayısı bekleyenler.length), boş yer önde */
  aile:{varsayilanYer:'sofra', kur(k){
    const ogeler=[], sayac={oturan:0,ayakta:0}, n=k.ip.bekleyenGoster===false?0:(k.kisi.kayip&&k.kisi.kayip.bekleyenler||[]).length;
    for(let i=0;i<n;i++){
      const ayakta=k.ip.ayaktaBekleyen&&k.ip.ayaktaBekleyen.includes(i);
      const tur=ayakta?'ayakta':'oturan', y=yerAl(k.yer,ayakta?'ayakta':'oturma',sayac[tur]++);
      if(!y) break;
      ogeler.push({siluet:tur,x:y[0],y:y[1],s:y[2],tip:tipBul(k,i),egik:.8,seed:10+i});
    }
    ekler(k,ogeler,sayac);
    return {ogeler, ton:{karanlik:0,soguk:0}};
  }},

  /* yeri boş kalır: kimse yok; yarım kalmış iş ve kişinin eşyası */
  yalniz:{varsayilanYer:'oda', kur(k){
    const ogeler=[]; ekler(k,ogeler,{oturan:0,ayakta:0});
    return {ogeler, ton:{karanlik:.05,soguk:.1}};
  }},

  /* kimsesi yok: dışarıda boş bir yer ve geride tek eşya; ışık daha soğuk, karanlık daha geniş */
  kimsesiz:{varsayilanYer:'cami-avlu', kur(k){
    const ogeler=[];
    hayvanlar(k,ogeler); // çerçinin eşeği gibi
    return {ogeler, ton:{karanlik:.12,soguk:.35}};
  }},

  /* hayvanları bekler: sahibini bekleyen kediler, köpek, katırlar, sürü */
  hayvan:{varsayilanYer:'baraka', kur(k){
    const ogeler=[]; hayvanlar(k,ogeler); ekler(k,ogeler,{oturan:0,ayakta:0});
    return {ogeler, ton:{karanlik:.04,soguk:.15}};
  }},

  /* işi sahipsiz kalır: kapalı kapı, sönmüş ocak; işi bekleyenler (çocuklar) kapının önünde */
  is:{varsayilanYer:'dukkan', kur(k){
    const ogeler=[]; ekler(k,ogeler,{oturan:0,ayakta:0});
    return {ogeler, ton:{karanlik:.06,soguk:.1}};
  }}
};

// ip.hayvan = {tur:'kedi'|'kopek'|'katir'|'esek'|'koyun', sayi, ...}; yerin hayvan noktalarına dağıtılır
function hayvanlar(k,ogeler){
  const h=k.ip.hayvan; if(!h) return;
  const liste=Array.isArray(h)?h:[h], r=rng(k.ip.tohum+77);
  for(const a of liste){
    if(a.tur==='koyun'){const S=k.yer.suru; if(S) ogeler.push({suru:true,x0:S[0],x1:S[1],y:S[2],s:S[3],z:S[2]-60}); continue;}
    if(a.tur==='kopek'){const p=a.yer?k.yer.yer[a.yer]:[0,920]; ogeler.push({hayvan:'kopek',x:p[0],y:p[1],s:a.s||.95,yon:a.yon||1,kalkik:a.kalkik}); continue;}
    const N=k.yer.hayvan||[];
    for(let i=0;i<Math.min(a.sayi||1,N.length);i++){
      const [x,y,s,o]=N[i];
      ogeler.push({hayvan:a.tur,x,y,s,...o,yuk:a.yuk,can:a.can,goz:a.tur==='kedi'&&(o.poz!=='bak')&&r()<(a.goz==null?.7:a.goz),seed:50+i,basEgik:a.basEgik});
    }
  }
}
