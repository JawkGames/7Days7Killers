// Çözüm: çözücünün her cinayette bulduğu zincirler adım adım, işaretler, en az sorgu planı ve çelişkiler.
import {T,esc,etiket,ad,yer,izAdi,cumle,anSaat,kisiBag,kisiBaglar,liste} from './metin.js';
import {izBul,soruMetin,degerYaz} from './bolum-yalanlar.js';
import {dolayliCumle} from './bolum-izler.js';

const gunler=f=>f.ilkGun===f.sonGun||f.sonGun==null?cumle(T.cozum.gunTek,{a:f.ilkGun??'?'}):cumle(T.cozum.gunAraligi,{a:f.ilkGun,b:f.sonGun});

function cevapYaz(B,f){
  if(!f) return T.bos;
  switch(f.cevap){
    case 'soyledi': return '«'+degerYaz(B,f.olgu,f.soylenen)+'»';
    case 'sustu': return T.cozum.sustu;
    case 'bilmiyor': return T.cozum.bilmiyor;
    case 'olu': return T.cozum.olu;
    default: return '⟨'+f.cevap+'⟩';
  }
}

function izAdim(B,id){
  const i=izBul(B,id);
  if(!i) return `<li><code class="ham">${esc(id)}</code></li>`;
  if(i.tur==='dolayli') return `<li class="adim">${esc(cumle(T.cozum.adimDolayli,{d:id,i:i.id,cumle:dolayliCumle(i)}))}</li>`;
  const aday=i.adaylar?.length>1?' — '+liste(i.adaylar.map(ad)):'';
  return `<li class="adim${i.yaniltici?' yaniltici':''}">${esc(cumle(T.cozum.adimFoto,{ad:izAdi(i),f:id,i:i.id,aday}))}</li>`;
}
function ifadeAdim(B,cz,id){
  const f=cz.ifadeler?.[id];
  if(!f) return `<li><code class="ham">${esc(id)}</code></li>`;
  return `<li class="adim"><span class="soluk">${esc(id)}</span> ${esc(gunler(f))}: ${kisiBag(f.konusan)} — ${esc(soruMetin(B,f.olgu,f.konusan))}: <b>${esc(cevapYaz(B,f))}</b></li>`;
}

function zincirCiz(B,cz,z,{bagimsiz,plan,katil}){
  const etk=[bagimsiz?'✓':'',plan?'★':''].join('');
  const tur=`${etiket(T.zincirTur,z.tur)}${z.alt?' · '+etiket(T.zincirAlt,z.alt):''}${z.not?' · <code>'+esc(z.not)+'</code>':''}`;
  const adimlar=[
    ...(z.izler||[]).map(id=>izAdim(B,id)),
    ...(z.ifadeler||[]).map(id=>ifadeAdim(B,cz,id)),
    ...(z.eleme||[]).map(e=>`<li class="adim eleme">${kisiBag(e.kisi)} — ${etiket(T.elemeTur,e.tur)}${e.kaynaklar?.length?' ('+esc(liste(e.kaynaklar.map(ad)))+')':''}</li>`),
  ];
  const kaynak=(z.sabit||[]).map(s=>s.startsWith('k:')?ad(s.slice(2)):s.startsWith('iz:')?s.slice(3):s).join(' + ');
  return `<details class="zincir${bagimsiz?' bagimsiz':''}${katil?'':' masum'}" ${bagimsiz?'open':''}>
    <summary><b class="isaret">${esc(etk)}</b> <span class="iz-id">${esc(z.id)}</span> ${tur} <span class="soluk">[${esc(kaynak)}]</span> ${kisiBag(z.kisi)}</summary>
    <ol class="adimlar">${adimlar.join('')}<li class="adim sonuc">${esc(cumle(T.cozum.sonuc,{kim:ad(z.kisi)}))}</li></ol></details>`;
}

function isaretCiz(i){
  const durum=(i.durum||[]).map(d=>`${kisiBag(d.kisi)}: ${d.aciklama?etiket(T.cozucuYol,d.aciklama)+(d.acikTam?.guc?` <span class="soluk">(${esc(d.acikTam.guc)})</span>`:''):`<b class="kirmizi">${esc(T.cozum.aciklamaYok)}</b>`}`).join('; ');
  const ne=i.tur==='iz'?(i.anahtar??i.iz):i.tur==='siluet'?(i.ortu??''):(Array.isArray(i.alt)?i.alt.join(', '):i.alt??'');
  return `<li><span class="rozet">${etiket(T.isaretTur,i.tur)}</span> <code>${esc(ne)}</code> ${i.iz?`<span class="soluk">${esc(i.iz)}</span>`:''} — ${durum||kisiBaglar(i.adaylar||[])}</li>`;
}

function celiskiCiz(B,cz,c){
  const ifs=(c.ifadeler||[]).map(id=>cz.ifadeler?.[id]).filter(Boolean);
  return `<li><span class="rozet">${etiket(T.celiskiTur,c.tur)}</span> ${esc(c.cinayet??'')} ${c.kisi?kisiBag(c.kisi):''} <span class="soluk">${esc(anSaat(c.zaman))}</span>
    <ul class="liste sik">${ifs.map(f=>`<li>${kisiBag(f.konusan)} — ${esc(soruMetin(B,f.olgu,f.konusan))}: ${esc(cevapYaz(B,f))}</li>`).join('')}</ul></li>`;
}

export function cozumCiz(B,kok){
  const r=B.rapor;
  if(!r){kok.innerHTML=`<p class="hata">${esc(T.cozum.raporYok)} ${esc(B.raporHata?.message??'')}</p>`; return;}
  const cz=r.cozum;
  const plan=r.enAzSorgu?.plan||cz.enAzSorgu?.plan||[];
  const h=[`<p class="aciklama">${esc(T.cozum.aciklama)}</p>`];
  for(const c of cz.cinayetler||[]){
    const gc=B.cinById[c.cinayet];
    const p=plan.find(x=>x.cinayet===c.cinayet);
    const bag=new Set((c.supheliler||[]).flatMap(s=>s.bagimsiz||[]));
    const planZ=new Set(p?.zincirler||[]);
    const sup=(c.supheliler||[]).map(s=>{
      const gercek=gc&&(s.kisi===gc.katil||s.kisi===gc.yardimci);
      const masum=!B.katilMi(s.kisi);
      return `<li>${kisiBag(s.kisi)} — ${esc(cumle(T.cozum.bagimsiz,{n:s.bagimsizSayisi}))} ${gercek?`<span class="rozet yesil">${esc(T.cozum.gercekKatil)}</span>`:''}${masum?`<span class="rozet kirmizi">${esc(T.cozum.masumaZincir)}</span>`:''}</li>`;
    }).join('');
    const zincirler=(c.zincirler||[]).map(z=>zincirCiz(B,cz,z,{bagimsiz:bag.has(z.id),plan:planZ.has(z.id),katil:B.katilMi(z.kisi)})).join('');
    const pl=p?`<p class="soluk">${esc(T.cozum.plan)}: ${esc((p.zincirler||[]).join(', '))}${p.aciklanan?.length?' · '+esc(cumle(T.cozum.aciklananlar,{l:liste(p.aciklanan.map(a=>`${ad(a.kisi)} (${T.cozucuYol[a.tur]??a.tur})`))})):''}${p.tekTanik?' · '+esc(T.cozum.tekTanik):''}${p.fotograf?' · '+esc(T.cozum.fotograf):''}</p>`:'';
    h.push(`<section class="kart cozum-kart"><header><h3><span class="cid">${esc(c.cinayet)}</span> ${kisiBag(c.kurban)}</h3><span class="soluk">${esc(anSaat(c.zaman))} · ${esc(yer(c.mekan))} · ${esc(cumle(T.ozet.fotograf,{n:c.fotografGunu}))}</span></header>
      <h4>${esc(T.cozum.supheliler)}</h4><ul class="liste">${sup||`<li class="kirmizi">${esc(T.bos)}</li>`}</ul>${pl}
      ${zincirler}
      <details><summary>${esc(T.cozum.isaretler)}</summary><ul class="liste">${(c.isaretler||[]).map(isaretCiz).join('')}</ul></details>
    </section>`);
  }
  const e=r.enAzSorgu||{};
  const takvim=(e.gunler||[]).map((g,i)=>`<li><b>${esc(cumle(T.gun,{n:i+1}))}</b>: ${g.length?kisiBaglar(g):esc(T.bos)}</li>`).join('');
  h.push(`<section class="kart"><header><h3>${esc(T.cozum.enAzSorgu)}</h3><span class="soluk">${esc(cumle(T.kalite.sorgu,{n:e.sorgu??'?'}))} · ${esc(cumle(T.kalite.adim,{n:e.adim??'?'}))}${e.sigar===false?' · '+esc(T.kalite.sigmaz):''}</span></header>
    <h4>${esc(T.cozum.takvim)}</h4><ul class="liste sik">${takvim}</ul></section>`);
  const cel=r.celiskiler||cz.celiskiler||[];
  h.push(`<section class="kart"><header><h3>${esc(T.cozum.celiskiler)} (${cel.length})</h3></header>${cel.length?`<details><summary>${esc(T.cozum.celiskiler)}</summary><ul class="liste">${cel.map(c=>celiskiCiz(B,cz,c)).join('')}</ul></details>`:`<p class="soluk">${esc(T.cozum.celiskiYok)}</p>`}</section>`);
  kok.innerHTML=h.join('');
}
