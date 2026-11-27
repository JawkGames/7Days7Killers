// Saf örnek üreteçleri: gürültü, yankı darbesi, alkış dokusu, ters çan.
// Hepsi Float32Array döndürür, Web Audio'yu tanımaz; Node'da test edilir.
// Rastgelelik dışarıdan verilen `r` (cekirdek/rastgele.js'teki rng) ile gelir.

// Döngüye girecek tamponların ek yerinde sıçrama olmasın diye sonu başa eşit güçle bindirilir:
// n+f örnek üretilir, ilk f örnek son f örnekle karıştırılır. out[0] = a[n], out[n-1] = a[n-1]; ek yeri süreklidir.
export function ekYeriniKapat(a,n,f){
  const out=new Float32Array(n);
  for(let i=0;i<n;i++) out[i]=a[i];
  for(let i=0;i<f;i++){
    const x=(i/f)*Math.PI/2;
    out[i]=a[i]*Math.sin(x)+a[n+i]*Math.cos(x);
  }
  return out;
}

const ortalamaCikar=a=>{let t=0; for(let i=0;i<a.length;i++) t+=a[i]; t/=a.length; for(let i=0;i<a.length;i++) a[i]-=t; return a;};

export function rmsHesapla(a){let t=0; for(let i=0;i<a.length;i++) t+=a[i]*a[i]; return Math.sqrt(t/(a.length||1));}

// RMS'i hedefe çeker; katman kazançları böylece gürültünün rengine bağlı kalmaz.
function rmsle(a,hedef){const r=rmsHesapla(a); if(r>0){const k=hedef/r; for(let i=0;i<a.length;i++) a[i]*=k;} return a;}

// tur: 'beyaz' | 'pembe' | 'kahverengi'. Ortalama sıfır, RMS 0.25, döngüde süreklidir.
export function gurultu(tur,n,r,{ekYeri=Math.min(4096,n>>2)}={}){
  const m=n+ekYeri, a=new Float32Array(m);
  if(tur==='pembe'){
    // Paul Kellet'in süzgeci
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(let i=0;i<m;i++){
      const w=r()*2-1;
      b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852;
      b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898;
      a[i]=b0+b1+b2+b3+b4+b5+b6+w*.5362; b6=w*.115926;
    }
  }else if(tur==='kahverengi'){
    let b=0;
    for(let i=0;i<m;i++){b=(b+.02*(r()*2-1))/1.02; a[i]=b;}
  }else{
    for(let i=0;i<m;i++) a[i]=r()*2-1;
  }
  ortalamaCikar(a);
  return rmsle(ekYeriniKapat(a,n,ekYeri),.25);
}

// Yankı darbesi: üstel sönen, gittikçe kararan gürültü. İki kanal birbirinden bağımsız.
// sure: saniye; parlaklik 0..1 (küçükse kuyruk daha çabuk kararır).
export function yankiDarbesi(sr,r,{sure=1.6,parlaklik=.35,on=.012}={}){
  const n=Math.max(1,Math.round(sr*sure)), kanallar=[];
  const tau=sure/6.9; // sure sonunda -60 dB
  for(let k=0;k<2;k++){
    const a=new Float32Array(n);
    let y=0;
    for(let i=0;i<n;i++){
      const t=i/sr;
      // süzgeç katsayısı zamanla küçülür: kuyruk karanlıklaşır
      const c=Math.max(.02,parlaklik*Math.exp(-t/(sure*.45)));
      y+=c*((r()*2-1)-y);
      const giris=t<on?t/on:1;
      a[i]=y*Math.exp(-t/tau)*giris;
    }
    kanallar.push(rmsle(a,.05));
  }
  return kanallar;
}

// Son kat sınırlayıcının eğrisi (WaveShaper). Önünde 1/aralik kazanç vardır: eğrinin x ∈ [-1, 1] alanı
// gerçek girişte [-aralik, aralik] demektir. |y| < diz doğrusaldır (dokunulmaz); üstü yumuşakça tavana yaslanır.
// Tavan 0.88 (≈ -1.1 dBFS): ne gelirse gelsin çıkış kırpılmaz.
export function sinirlayiciEgrisi(n=4096,{diz=.5,tavan=.88,aralik=2}={}){
  const e=new Float32Array(n), pay=tavan-diz;
  for(let i=0;i<n;i++){
    const y=(i/(n-1)*2-1)*aralik, m=Math.abs(y);
    e[i]=Math.sign(y)*(m<diz?m:diz+pay*Math.tanh((m-diz)/pay));
  }
  return e;
}

// Alkış dokusu: rastgele zamanlarda kısa, sönen gürültü patlamaları. Döngü için uçlar sarılır.
export function alkisDokusu(sr,n,r,{yogunluk=140}={}){
  const a=new Float32Array(n), adet=Math.round(yogunluk*n/sr);
  for(let k=0;k<adet;k++){
    const bas=Math.floor(r()*n), boy=Math.floor(sr*(.003+r()*.006)), g=.3+r()*.7;
    let y=0;
    for(let i=0;i<boy;i++){
      y+=.45*((r()*2-1)-y);
      a[(bas+i)%n]+=y*g*Math.exp(-i/(boy*.3));
    }
  }
  return rmsle(ortalamaCikar(a),.25);
}

// Ters çekilen ton (Rewind): alçak, uyumsuz kısmili bir çan sönümü üretilir ve ters çevrilir;
// böylece ses yavaşça kabarır ve ansızın kesilir. Kesilme yerinde 30 ms'lik bir kapanış var (tık olmasın).
export function tersTon(sr,r,{sure=2.4,temel=110,kismiler=[1,1.98,2.71,3.93]}={}){
  const n=Math.round(sr*sure), a=new Float32Array(n);
  for(const [j,k] of kismiler.entries()){
    const f=temel*k*(1+(r()-.5)*.006), faz=r()*Math.PI*2, sonum=sure*(.55-j*.09), g=1/(1+j*1.4);
    for(let i=0;i<n;i++){const t=i/sr; a[i]+=g*Math.sin(2*Math.PI*f*t+faz)*Math.exp(-t/sonum*2.2);}
  }
  // hafif hava: gürültü kuyruğu
  let y=0;
  for(let i=0;i<n;i++){const t=i/sr; y+=.04*((r()*2-1)-y); a[i]+=y*.9*Math.exp(-t/(sure*.5));}
  a.reverse();
  ortalamaCikar(a);
  const kapanis=Math.round(sr*.03), acilis=Math.round(sr*.005);
  for(let i=0;i<kapanis;i++) a[n-1-i]*=i/kapanis;
  for(let i=0;i<acilis;i++) a[i]*=i/acilis;
  return rmsle(a,.2);
}
