// Çözücü: vakayı YALNIZCA oyuncu görünümüyle (gorunum.js) çözmeye çalışır.
// Vakanın kendisini almaz; gerçeğe (katil, izin sahibi, yanıltıcı) erişimi yoktur.
//
// Akıl yürütme (README "Çözücü" bölümü ayrıntılı anlatır):
//   1. Bütün fotoğrafları görür, her cinayet için yaşayan herkese her soruyu sorar (konum, gördükleri, fail, iz, fark).
//      Cevap sorgu gününe göre değişmez (yalnızca ölüm ve "henüz olmadı" sınırlar); bu yüzden her soru cinayetin
//      fotoğraf gününde bir kez sorulur, fark sorusu fotoğraf gününden iki gün sonrasına kadar her gün.
//   2. Güven kuralı (oyuncunun sezgisi): başkası hakkındaki SUÇLAYICI söz (onu olay yerinde gördüm, evde değildi,
//      giysisi kanlıydı) inanılır; AKLAYICI söz (benimleydi) ancak çelişmiyorsa ve kişiyi gösteren doğrudan bir iz
//      yoksa kabul edilir. Kişinin kendisi hakkındaki sözü tek başına hiçbir şeyi kanıtlamaz.
//   3. İşaretler: fotoğraftaki iz (adaylar), olay yerinde yüzünden görülme, silüet (örtü), dolaylı iz (kanlı giysi,
//      tırmık, düşürülen eşya). Her işaret bir aday kümesi verir.
//   4. Zincir: bir işaret + adaylardan başkalarını eleyen kabul edilmiş mazeretler, sonunda tek kişi kalır.
//      Tanık zinciri: yüzünden gören tanık + (aynı tanığın suçlaması ya da kişinin olay yerinde olmayı inkârı).
//   5. Bağımsızlık: iki zincirin kaynakları (iz ya da konuşan kişi; şüphelinin kendi sözleri hariç) ayrıksa bağımsızdır.
//   6. Açıklama: bir işaretin gösterdiği ama zinciri olmayan kişi için masum açıklama (mazeret, tanığın anlatımı,
//      aletinin çalındığını önceden söylemesi). Bu, yanıltıcı izlerin çürütülme yoludur.
//   7. En az sorgu: her cinayet için en ucuz zincir ve doğrudan işaret edilen her masumun en ucuz açıklaması seçilir
//      (açgözlü), konuşanlar gün pencerelerine göre günlük sorgu hakkına yerleştirilir.

const KANLI_YARA=['bicak-yarasi','ezik-yara'];
const TIRMIK_YARA=['bogaz-morlugu','islak-ceset','ip-izi','dusme-yarasi'];

export function coz(g){
  const G=g.ayar.gunSayisi, ids=g.kisiIdleri, K=g.kisiler, hak=g.ayar.gunlukSorguHakki;
  const fotolar=[...g.fotograflar(G)].sort((a,b)=>a.zaman-b.zaman);
  const sonGunu={}; // kurban: sorgulanabileceği son gün (öldüğü sabahtan önceki gün)
  for(const f of fotolar) sonGunu[f.kurban]=f.gun-1;
  const sonGun=k=>sonGunu[k]??G;
  const olumAni={}; for(const f of fotolar) olumAni[f.kurban]=f.zaman;

  // --- 1. Sorgular ---
  const ifadeler=[], ifadeById={};
  let sayac=0;
  const kaydet=(k,o,gun,r,ek={})=>{const b={id:'s'+(++sayac),konusan:k,olgu:o,ilkGun:gun,sonGun:sonGun(k),cevap:r.cevap,soylenen:r.soylenen,...ek}; ifadeler.push(b); ifadeById[b.id]=b; return b;};
  const vakalar=[];
  for(const f of fotolar){
    const t=f.zaman, gun=f.gun;
    const v={f,t,m:f.mekan,
      konum:{}, // X -> [{kaynak, ifade, at?|degil?}]
      kendi:{}, // X -> ifade
      gorulen:{}, // k -> ifade
      suclama:[], // {kaynak, kisi, ifade}
      esya:[], // {kaynak, iz, ifade, deger}
      fark:[], // {kaynak, kayit, ifade}
    };
    for(const k of ids){
      if(k===f.kurban||gun>sonGun(k)) continue;
      const gr=g.sorgula(k,{tur:'gorulen',zaman:t},gun);
      const gb=kaydet(k,{tur:'gorulen',zaman:t},gun,gr); v.gorulen[k]=gb;
      for(const X of ids){
        if(X===f.kurban||(olumAni[X]!=null&&olumAni[X]<t)) continue;
        const o={tur:'konum',kisi:X,zaman:t}, r=g.sorgula(k,o,gun);
        if(r.cevap!=='soyledi'&&!(X===k)) continue;
        const b=kaydet(k,o,gun,r);
        if(X===k){v.kendi[X]=b; continue;}
        if(!r.soylenen) continue;
        if(r.soylenen.deger!=null) (v.konum[X]??=[]).push({kaynak:k,ifade:b.id,at:r.soylenen.deger});
        else if(r.soylenen.degil) (v.konum[X]??=[]).push({kaynak:k,ifade:b.id,degil:r.soylenen.degil});
      }
      if(gr.cevap==='soyledi') for(const e of gr.soylenen.deger) if(e.kisi&&e.kisi!==k&&e.kisi!==f.kurban) (v.konum[e.kisi]??=[]).push({kaynak:k,ifade:gb.id,at:e.mekan,gordu:true});
      const fr=g.sorgula(k,{tur:'fail',cinayet:f.cinayet},gun);
      if(fr.cevap==='soyledi'&&fr.soylenen.deger&&fr.soylenen.deger!==k) v.suclama.push({kaynak:k,kisi:fr.soylenen.deger,ifade:kaydet(k,{tur:'fail',cinayet:f.cinayet},gun,fr).id});
      for(const iz of f.izler){
        if(!iz.adaylar.length||iz.alt==='kurban-esyasi') continue;
        const o={tur:'esya',iz:iz.id}, r=g.sorgula(k,o,gun);
        if(r.cevap==='soyledi'&&r.soylenen.deger) v.esya.push({kaynak:k,iz:iz.id,deger:r.soylenen.deger,ifade:kaydet(k,o,gun,r).id});
      }
      const gorulenKayit=new Set();
      for(let gg=gun;gg<=Math.min(gun+2,sonGun(k));gg++){
        const o={tur:'fark',cinayet:f.cinayet}, r=g.sorgula(k,o,gg);
        if(r.cevap!=='soyledi') continue;
        for(const e of r.soylenen.deger){
          if(gorulenKayit.has(e.id)) continue;
          gorulenKayit.add(e.id);
          v.fark.push({kaynak:k,kayit:e,ifade:kaydet(k,o,gg,{cevap:r.cevap,soylenen:{deger:[e]}}).id});
        }
      }
    }
    vakalar.push(v);
  }

  // --- 2-6. Her cinayet için işaret, mazeret, açıklama, zincir ---
  const cinayetler=[], celiskiler=[];
  for(const v of vakalar) cinayetler.push(cinayetiCoz(v));

  function cinayetiCoz(v){
    const {f,t,m}=v;
    const yara=f.izler.find(i=>i.alt==='yara');
    const canli=X=>X!==f.kurban&&!(olumAni[X]!=null&&olumAni[X]<t);
    const kendiYeri=X=>{const b=v.kendi[X]; return b&&b.cevap==='soyledi'&&b.soylenen&&b.soylenen.deger!=null?b.soylenen.deger:null;};
    const iddialar=X=>(v.konum[X]||[]);
    // Olay yerinde yüzünden görülme (suçlayıcı, inanılır).
    const yerinde=X=>iddialar(X).filter(c=>c.at===m);

    // Doğrudan işaretler (tek kişiyi gösteren suçlayıcı sözler).
    const dogrudan={}; // X -> [{tur, kaynaklar, ifadeler, izler}]
    const dogrudanEkle=(X,p)=>(dogrudan[X]??=[]).push(p);
    for(const X of ids) if(canli(X)) for(const c of yerinde(X)){
      const suc=v.suclama.find(s=>s.kaynak===c.kaynak&&s.kisi===X);
      const ky=kendiYeri(X);
      if(suc) dogrudanEkle(X,{tur:'tanik',alt:'suclama',kaynaklar:[c.kaynak],ifadeler:[c.ifade,suc.ifade],izler:[]});
      else if(ky&&ky!==m) dogrudanEkle(X,{tur:'tanik',alt:'inkar',kaynaklar:[c.kaynak],ifadeler:[c.ifade,v.kendi[X].id],izler:[]});
    }
    const izByAnahtar=a=>f.izler.filter(i=>i.anahtar===a&&i.alt!=='kurban-esyasi');
    for(const d of v.fark){
      const e=d.kayit, X=e.kisi;
      if(!canli(X)||d.kaynak===X) continue;
      if(e.alt==='kanli-giysi'&&yara&&KANLI_YARA.includes(yara.anahtar)) dogrudanEkle(X,{tur:'dolayli',alt:e.alt,kaynaklar:[d.kaynak],ifadeler:[d.ifade],izler:[]});
      if(e.alt==='tirmik'&&yara&&TIRMIK_YARA.includes(yara.anahtar)) dogrudanEkle(X,{tur:'dolayli',alt:e.alt,kaynaklar:[d.kaynak],ifadeler:[d.ifade],izler:[]});
      if(e.alt==='eksik-esya'&&e.anahtar) for(const iz of izByAnahtar(e.anahtar)) if(iz.adaylar.includes(X))
        dogrudanEkle(X,{tur:'dolayli',alt:e.alt,kaynaklar:[d.kaynak,'iz:'+iz.id],ifadeler:[d.ifade],izler:[iz.id]});
    }

    // Mazeret: X'i olay yeri dışında bir yere koyan, X dışındaki biri. Çelişen ya da doğrudan işaretle çürüyen mazeret düşer.
    const mazeretler={}, curuyen={};
    for(const X of ids){
      if(!canli(X)) continue;
      const l=iddialar(X), ky=kendiYeri(X);
      let en=null;
      for(const y of [...new Set(l.filter(c=>c.at&&c.at!==m).map(c=>c.at))].sort()){
        const ok=l.filter(c=>c.at===y), karsi=l.filter(c=>c.degil===y||(c.at&&c.at!==y));
        const red=karsi.length||(ky&&ky!==y)||dogrudan[X];
        if(red){(curuyen[X]??=[]).push({yer:y,onaylayan:ok,karsi,dogrudan:!!dogrudan[X]}); continue;}
        const aday={yer:y,kaynaklar:[...new Set(ok.map(c=>c.kaynak))].sort(),ifadeler:ok.map(c=>c.ifade),guc:new Set(ok.map(c=>c.kaynak)).size>=2?'saglam':'zayif'};
        if(!en||(aday.guc==='saglam'&&en.guc!=='saglam')||aday.kaynaklar.length>en.kaynaklar.length) en=aday;
      }
      if(en) mazeretler[X]=en;
    }
    // Çelişkiler.
    for(const X of ids){
      if(!canli(X)) continue;
      const ky=kendiYeri(X), l=iddialar(X);
      if(ky) for(const c of l) if((c.degil&&c.degil===ky)||(c.at&&c.at!==ky))
        celiskiler.push({tur:'mazeret-curudu',cinayet:f.cinayet,zaman:t,kisi:X,iddia:ky,ifadeler:[v.kendi[X].id,c.ifade],karsi:c.kaynak,...(c.at?{gercek:c.at}:{degil:c.degil})});
      for(const c of curuyen[X]||[]) if(c.dogrudan) for(const o of c.onaylayan)
        celiskiler.push({tur:'sahte-mazeret',cinayet:f.cinayet,zaman:t,kisi:X,onaylayan:o.kaynak,yer:c.yer,ifadeler:[o.ifade,...dogrudan[X].flatMap(p=>p.ifadeler)]});
      for(let i=0;i<l.length;i++) for(let j=i+1;j<l.length;j++){
        const a=l[i], b=l[j];
        if(a.kaynak===b.kaynak) continue;
        const cel=(a.at&&b.at&&a.at!==b.at)||(a.at&&b.degil===a.at)||(b.at&&a.degil===b.at);
        if(cel) celiskiler.push({tur:'ifade-celiskisi',cinayet:f.cinayet,zaman:t,kisi:X,ifadeler:[a.ifade,b.ifade],kaynaklar:[a.kaynak,b.kaynak]});
      }
    }
    const suclananlar=[...new Set(v.suclama.map(s=>s.kisi))];
    if(suclananlar.length>1) celiskiler.push({tur:'suclama-celiskisi',cinayet:f.cinayet,zaman:t,kisiler:suclananlar.sort(),ifadeler:v.suclama.map(s=>s.ifade)});

    // Masum açıklamalar (kişi başına, işaretten bağımsız olanlar).
    const aciklama={}; // X -> [{tur, kaynaklar, ifadeler}]
    const aciklamaEkle=(X,a)=>(aciklama[X]??=[]).push(a);
    for(const X of ids){
      if(!canli(X)) continue;
      const mz=mazeretler[X];
      if(mz) aciklamaEkle(X,{tur:'mazeret',guc:mz.guc,yer:mz.yer,kaynaklar:mz.kaynaklar,ifadeler:mz.ifadeler});
      // Tanığın anlatımı: olay yerinde olduğunu kendisi söylüyor ve orada başka birini/bir sesi anlatıyor.
      const gb=v.gorulen[X];
      if(kendiYeri(X)===m&&gb&&gb.cevap==='soyledi'&&gb.soylenen.deger.some(e=>(e.kisi&&e.kisi!==X)||e.kesinlik==='siluet'||e.ses))
        aciklamaEkle(X,{tur:'tanik-anlatimi',kaynaklar:[X],ifadeler:[v.kendi[X].id,gb.id]});
      for(const d of v.fark) if(d.kayit.alt==='yirtik-giysi'&&d.kayit.kisi===X&&d.kaynak!==X)
        aciklamaEkle(X,{tur:'saldiriya-ugradi',kaynaklar:[d.kaynak],ifadeler:[d.ifade]});
    }
    // İzin açıklaması: aleti cinayetten önce çalınmış (sahibi kendisi söyledi).
    const calinti=(X,iz)=>v.fark.filter(d=>d.kaynak===X&&d.kayit.alt==='eksik-alet'&&d.kayit.kisi===X&&d.kayit.zaman<t&&d.kayit.anahtar===iz.anahtar);

    // --- İşaretler ve zincirler ---
    const isaretler=[], zincirler=[];
    const elemeli=(S,isaret,izId)=>{
      // S içinden zinciri olabilecek tek kişiyi arar. Döner: {kisi, eleme:[{kisi, tur, kaynaklar, ifadeler}], not} | null
      const l=S.filter(canli);
      const durum=l.map(X=>{
        if(izId){
          const cl=calinti(X,f.izler.find(i=>i.id===izId));
          if(cl.length) return {X,acik:{tur:'calinti',kaynaklar:[X],ifadeler:cl.map(d=>d.ifade)}};
        }
        const ta=(aciklama[X]||[]).find(a=>a.tur==='tanik-anlatimi'||a.tur==='saldiriya-ugradi');
        if(ta&&!dogrudan[X]) return {X,acik:ta};
        const mz=mazeretler[X];
        if(mz) return {X,acik:{tur:'mazeret',guc:mz.guc,kaynaklar:mz.kaynaklar,ifadeler:mz.ifadeler}};
        return {X,acik:null};
      });
      const acik=durum.filter(d=>!d.acik), zayif=durum.filter(d=>d.acik&&d.acik.tur==='mazeret'&&d.acik.guc==='zayif');
      let sec=null, not=null;
      if(acik.length===1) sec=acik[0].X;
      else if(!acik.length&&zayif.length===1&&durum.length>1){sec=zayif[0].X; not='zayif-mazeret';}
      return {durum,sec,not};
    };
    const zincirEkle=(z)=>{z.id=f.cinayet+'z'+(zincirler.length+1); zincirler.push(z);};
    // Doğrudan zincirler.
    for(const [X,l] of Object.entries(dogrudan)) for(const p of l){
      // Düşürdüğü eşya olay yerinde, ama olay yerinde olduğunu kendisi anlatıyor ya da saldırıya uğradığı görülmüş: tanıktır.
      if(p.alt==='eksik-esya'&&(aciklama[X]||[]).some(a=>a.tur==='tanik-anlatimi'||a.tur==='saldiriya-ugradi')) continue;
      zincirEkle({kisi:X,tur:p.tur,alt:p.alt,kaynaklar:p.kaynaklar.map(k=>k.startsWith('iz:')?k:'k:'+k),ifadeler:p.ifadeler,izler:p.izler,eleme:[]});
    }
    // Fiziksel izler.
    for(const iz of f.izler){
      if(!iz.adaylar.length||iz.alt==='kurban-esyasi') continue;
      const e=elemeli(iz.adaylar,'iz',iz.id);
      isaretler.push({tur:'iz',iz:iz.id,anahtar:iz.anahtar,adaylar:[...iz.adaylar],durum:e.durum.map(d=>({kisi:d.X,aciklama:d.acik?d.acik.tur:null}))});
      if(e.sec){
        const eleme=e.durum.filter(d=>d.X!==e.sec);
        zincirEkle({kisi:e.sec,tur:'iz',alt:iz.alt,not:e.not,kaynaklar:['iz:'+iz.id,...eleme.flatMap(d=>d.acik.kaynaklar.map(k=>'k:'+k))],
          ifadeler:eleme.flatMap(d=>d.acik.ifadeler),izler:[iz.id],eleme:eleme.map(d=>({kisi:d.X,tur:d.acik.tur,kaynaklar:d.acik.kaynaklar}))});
      }
    }
    // Silüetler.
    const siluetler=new Map();
    for(const [k,gb] of Object.entries(v.gorulen)) if(gb.cevap==='soyledi') for(const e of gb.soylenen.deger)
      if(e.kesinlik==='siluet'&&e.mekan===m&&e.ortu&&!siluetler.has(e.ortu+'|'+k)) siluetler.set(e.ortu+'|'+k,{ortu:e.ortu,kaynak:k,ifade:gb.id});
    for(const s of siluetler.values()){
      const S=ids.filter(X=>K[X].ortu===s.ortu&&X!==s.kaynak);
      const e=elemeli(S,'siluet',null);
      isaretler.push({tur:'siluet',ortu:s.ortu,kaynak:s.kaynak,adaylar:S,durum:e.durum.map(d=>({kisi:d.X,aciklama:d.acik?d.acik.tur:null}))});
      if(e.sec){
        const eleme=e.durum.filter(d=>d.X!==e.sec);
        zincirEkle({kisi:e.sec,tur:'siluet',alt:s.ortu,not:e.not,kaynaklar:['k:'+s.kaynak,...eleme.flatMap(d=>d.acik.kaynaklar.map(k=>'k:'+k))],
          ifadeler:[s.ifade,...eleme.flatMap(d=>d.acik.ifadeler)],izler:[],eleme:eleme.map(d=>({kisi:d.X,tur:d.acik.tur,kaynaklar:d.acik.kaynaklar}))});
      }
    }
    // Yokluk (gece evinde değildi): zayıf işaret, tek başına zincir kurmaz.
    for(const X of ids){
      if(!canli(X)) continue;
      const yok=iddialar(X).filter(c=>c.degil&&c.degil===K[X].ev);
      const fy=v.fark.filter(d=>d.kayit.alt==='gece-yoklugu'&&d.kayit.kisi===X);
      if(yok.length||fy.length) isaretler.push({tur:'yokluk',kisi:X,kaynaklar:[...new Set([...yok.map(c=>c.kaynak),...fy.map(d=>d.kaynak)])].sort(),adaylar:[X]});
    }
    for(const [X,l] of Object.entries(dogrudan)) isaretler.push({tur:'dogrudan',kisi:X,adaylar:[X],alt:l.map(p=>p.alt)});

    // Şüpheliler: zinciri olanlar; bağımsız zincir sayısına göre.
    const kisiZinciri={};
    for(const z of zincirler){
      z.kaynaklar=[...new Set(z.kaynaklar.filter(k=>k!=='k:'+z.kisi))].sort();
      z.ifadeler=[...new Set(z.ifadeler)];
      (kisiZinciri[z.kisi]??=[]).push(z);
    }
    const supheliler=Object.entries(kisiZinciri).map(([X,l])=>{
      const bag=bagimsizlar(l);
      return {kisi:X,zincirler:l.map(z=>z.id),bagimsiz:bag.map(z=>z.id),bagimsizSayisi:bag.length};
    }).sort((a,b)=>b.bagimsizSayisi-a.bagimsizSayisi||b.zincirler.length-a.zincirler.length||(a.kisi<b.kisi?-1:1));
    // Açıklamalar: zinciri olmayan, bir işaretin gösterdiği herkes.
    const isaretli=new Set(isaretler.flatMap(i=>i.tur==='yokluk'||i.tur==='dogrudan'?[i.kisi]:i.adaylar).filter(canli));
    const aciklamalar={};
    for(const X of [...isaretli].sort()){
      if(kisiZinciri[X]) continue;
      const l=[...(aciklama[X]||[])];
      for(const i of isaretler) if(i.tur==='iz'&&i.adaylar.includes(X)){
        const cl=calinti(X,f.izler.find(z=>z.id===i.iz));
        if(cl.length) l.push({tur:'calinti',iz:i.iz,kaynaklar:[X],ifadeler:cl.map(d=>d.ifade)});
      }
      // Yalnızca yokluk ya da kalabalık bir aday kümesi gösteriyorsa: zinciri yok, işaret onu tek başına seçmiyor.
      const tekGosteren=isaretler.some(i=>(i.tur==='iz'||i.tur==='siluet')&&i.durum.filter(d=>!d.aciklama).length===1&&i.durum.find(d=>d.kisi===X&&!d.aciklama));
      if(!l.length&&!tekGosteren&&!dogrudan[X]) l.push({tur:'zayif-isaret',kaynaklar:[],ifadeler:[]});
      aciklamalar[X]=l;
    }
    return {cinayet:f.cinayet,zaman:t,mekan:m,kurban:f.kurban,fotografGunu:f.gun,supheliler,zincirler,isaretler,aciklamalar,
      dogrudanIsaretli:Object.keys(dogrudan).sort()};
  }

  // --- 7. En az sorgu ---
  const secilen=new Set(), secilenIz=new Set(), secilenKisi=new Set();
  const maliyet=ifs=>new Set(ifs.map(id=>ifadeById[id].konusan).filter(k=>!secilenKisi.has(k))).size;
  const ekleSecim=(ifs,izs=[])=>{for(const i of ifs){secilen.add(i); secilenKisi.add(ifadeById[i].konusan);} for(const i of izs) secilenIz.add(i);};
  const plan=[];
  for(const c of cinayetler){
    const ana=c.supheliler[0];
    if(!ana){plan.push({cinayet:c.cinayet,zincir:null}); continue;}
    const zs=c.zincirler.filter(z=>z.kisi===ana.kisi).sort((a,b)=>maliyet(a.ifadeler)-maliyet(b.ifadeler)||a.ifadeler.length-b.ifadeler.length||(a.id<b.id?-1:1));
    ekleSecim(zs[0].ifadeler,zs[0].izler);
    const aciklanan=[];
    // Doğrudan işaret edilen (tek kişiyi gösteren) ama zinciri olmayanların en ucuz açıklaması.
    for(const i of c.isaretler){
      if(i.tur!=='iz'&&i.tur!=='siluet') continue;
      const tek=i.adaylar.filter(X=>X!==c.kurban);
      if(tek.length!==1||c.supheliler.some(s=>s.kisi===tek[0])) continue;
      const l=(c.aciklamalar[tek[0]]||[]).filter(a=>a.ifadeler.length);
      if(!l.length) continue;
      const a=[...l].sort((x,y)=>maliyet(x.ifadeler)-maliyet(y.ifadeler)||x.ifadeler.length-y.ifadeler.length)[0];
      ekleSecim(a.ifadeler); aciklanan.push({kisi:tek[0],tur:a.tur});
    }
    plan.push({cinayet:c.cinayet,zincir:zs[0].id,kisi:ana.kisi,aciklanan});
  }
  const takvim=sorguTakvimi([...secilen].map(id=>ifadeById[id]),G,hak);
  const tekTanik=plan.filter(p=>{
    const z=p.zincir&&cinayetler.find(c=>c.cinayet===p.cinayet).zincirler.find(z=>z.id===p.zincir);
    return z&&z.tur==='tanik'&&z.kaynaklar.length===1&&!z.eleme.length;
  }).length;

  return {
    cinayetler, celiskiler,
    failler:[...new Set(cinayetler.flatMap(c=>c.supheliler.slice(0,1).map(s=>s.kisi)))].sort(),
    enAzSorgu:{sorgu:takvim.oturumlar.length,sigar:takvim.sigar,gunler:takvim.gunler,oturumlar:takvim.oturumlar,
      adim:secilen.size+secilenIz.size+plan.reduce((s,p)=>{const c=cinayetler.find(c=>c.cinayet===p.cinayet), z=p.zincir&&c.zincirler.find(z=>z.id===p.zincir); return s+(z?z.eleme.length:0);},0),
      ifade:secilen.size,iz:secilenIz.size,tekTanik,plan},
    ifadeler:ifadeById,
    istatistik:{soru:ifadeler.length},
  };
}

// Bağımsız zincirler: kaynak kümeleri ayrık en çok zinciri açgözlü seçer (küçük kaynak kümesi önce).
export function bagimsizlar(zincirler){
  const l=[...zincirler].sort((a,b)=>a.kaynaklar.length-b.kaynaklar.length||(a.id<b.id?-1:1));
  const kullanilan=new Set(), sec=[];
  for(const z of l){
    if(z.kaynaklar.some(k=>kullanilan.has(k))) continue;
    sec.push(z); for(const k of z.kaynaklar) kullanilan.add(k);
  }
  return sec;
}

// Gereken ifadeleri sorgu oturumlarına böler ve günlere yerleştirir.
// Bir konuşanın ifadeleri ortak bir günde sorulabiliyorsa tek oturumdur; değilse (arada ölüyorsa) birden çok.
// Yerleştirme: her gün en çok `hak` oturum, son günü en erken olan önce (tek birimlik işlerde en iyisi budur).
export function sorguTakvimi(ifadeler,G,hak){
  const kisiye={};
  for(const b of ifadeler) (kisiye[b.konusan]??=[]).push([b.ilkGun,b.sonGun]);
  const oturumlar=[];
  for(const [k,l] of Object.entries(kisiye).sort((a,b)=>a[0]<b[0]?-1:1)){
    l.sort((a,b)=>a[1]-b[1]);
    let i=0;
    while(i<l.length){
      const p=l[i][1]; let a=l[i][0], b=p;
      while(i<l.length&&l[i][0]<=p){a=Math.max(a,l[i][0]); b=Math.min(b,l[i][1]); i++;}
      oturumlar.push({kisi:k,ilk:a,son:b,gun:null});
    }
  }
  const gunler=Array.from({length:G},()=>[]);
  let sigar=true;
  for(let gun=1;gun<=G;gun++){
    const bekleyen=oturumlar.filter(o=>o.gun==null&&o.ilk<=gun&&o.son>=gun).sort((x,y)=>x.son-y.son||(x.kisi<y.kisi?-1:1));
    for(const o of bekleyen.slice(0,hak)){o.gun=gun; gunler[gun-1].push(o.kisi);}
  }
  if(oturumlar.some(o=>o.gun==null||o.ilk>o.son)) sigar=false;
  return {oturumlar,gunler,sigar};
}
