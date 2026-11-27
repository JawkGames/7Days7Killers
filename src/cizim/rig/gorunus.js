// Görünüş: bir karakterin bütün çizim verisi (yüz ölçüleri, renkler, yaş izleri, saç, sakal, başlık, giysi).
// Rig tek bir "etkin" görünüşle çizer. karakterSec(veri) onu değiştirir; hiç çağrılmazsa varsayılan kadın çizilir.
// Şema ve değer aralıkları: src/cizim/rig/README.md
import {PAL} from '../teknik/palet.js';
import {hex,clamp} from '../../cekirdek/matematik.js';
import {YUZ} from './poz.js';
import varsayilan from '../../icerik/gorunus/varsayilan.js';

export const SAC_BICIMLERI=['uzun','toplu','kisa','kel','dagnik'];
export const SAKAL_BICIMLERI=['yok','kirli','kisa','uzun','dagnik'];
export const BIYIK_BICIMLERI=['yok','ince','kalin','pala'];
export const BASLIKLAR=['yok','kasket','kep','yemeni','yazma','takke','sarik','sal','kulah','posu'];
export const KISA_SAC_TURLERI=['duz','acik','kabarik','yana','geri'];
export const YEMENI_BAGLARI=['cene','arka','yasmak'];
export const ONLUKLER=['bez','un','deri'];
export const ORTULER=['aba','entari','palto','cubbe','kaput','onluk','kepenek'];
export const IC_GIYSILER=['bluz','gomlek','yelek','entari'];

// iki rengi karıştırır (dizi ya da '#rrggbb'), dizi döner
export function karistir(a,b,t){
  a=typeof a==='string'?hex(a):a; b=typeof b==='string'?hex(b):b;
  return [0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t));
}
export const hexYaz=k=>'#'+k.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const dz=k=>typeof k==='string'?hex(k):k;

/* yüz ölçüleri: hepsi çarpan (1 = varsayılan kadın), gozAralik birim cinsinden */
const YUZ_TEMEL={en:1, boy:1, alin:1, elmacik:1, cene:1, ceneUc:1, gozAralik:66, gozEn:1, gozBoy:1, gozKapak:0,
  kasKalin:1, kasEgim:0, kasY:0, burunBoy:1, burunEn:1, dudakEn:1, dudakKalin:1, agizY:0, boyun:1};
// erkekte verilmeyen ölçüler için başlangıç: daha geniş çene, gür kaş, kalın boyun, ince dudak
const YUZ_ERKEK={...YUZ_TEMEL, en:1.04, cene:1.1, ceneUc:1.12, gozBoy:.88, kasKalin:1.35, kasY:3, burunEn:1.1, dudakKalin:.78, boyun:1.2};

// solgun ten (varsayılan kadın): PAL'deki değerler ve gövdedeki sabit tonlar
const TEN_SOLGUN={isik:PAL.tenIsik, ana:PAL.ten, orta:PAL.tenOrta, golge:PAL.tenGolge, derin:PAL.tenDerin,
  alin:hex('#d6cfb4'), boyun:['#1a181c','#59554b','#7c7767'], el:['#77725f','#3c3a36']};

// tek bir ana renkten beş tonlu ten paleti türetir
export function tenPaleti(ana){
  ana=dz(ana);
  const isik=karistir(ana,'#e6dfc6',.38), orta=karistir(ana,'#14121a',.3), golge=karistir(ana,'#1c1a26',.78), derin=karistir(PAL.tenDerin,ana,.05);
  return {isik, ana, orta, golge, derin, alin:karistir(isik,'#f0e8cc',.3),
    boyun:[hexYaz(karistir(golge,derin,.6)),hexYaz(karistir(orta,golge,.4)),hexYaz(karistir(ana,orta,.6))],
    el:[hexYaz(karistir(ana,orta,.75)),hexYaz(karistir(golge,ana,.15))]};
}

// yaş verilmeyen yaş izleri yaştan türetilir
function yasIziTuret(yas){
  const y=clamp((yas-25)/50,0,1);
  return {kirisik:y, gozAlti:.6+y*.8, cokukYanak:.4+y*.8, kirSac:clamp((yas-42)/30,0,1), lekeler:clamp((yas-50)/25,0,1)};
}

/* yüz yapısı: yaş ve cinsiyetten türetilir, veride `yapi` ile ezilir. Varsayılan kadında kullanılmaz (eski yol).
   cukur: göz çukurunun derinliği, dolgun: gençlik dolgunluğu (yanak, dudak, düz hat), sarkik: çene altı ve gıdı sarkması,
   sakak: şakak çukuru, kemik: elmacık ve çene kemiğinin belirginliği, kulak: kulak büyüklüğü (yaşla büyür) */
function yapiTuret(yas,erkek,iz){
  const y=clamp((yas-20)/55,0,1);
  return {cukur:.55+y*.75+(erkek?.12:0), dolgun:clamp(1-y*1.7,0,1), sarkik:clamp((yas-46)/26,0,1), sakak:clamp((yas-38)/34,0,1)*.8+iz.cokukYanak*.15,
    kemik:clamp((erkek?.45:.2)+iz.cokukYanak*.3+y*.25,0,1), kulak:1+y*.16};
}

/* Ham veriyi rig'in kullandığı biçime çevirir: eksik alanları doldurur, renkleri diziye çevirir. */
export function gorunusKur(v){
  v=v||{};
  const erkek=v.cinsiyet==='E';
  const yuz={...(erkek?YUZ_ERKEK:YUZ_TEMEL),...(v.yuz||{})};
  const r=v.renk||{};
  let ten;
  if(r.ten==null) ten=TEN_SOLGUN;
  else if(typeof r.ten==='string') ten=tenPaleti(r.ten);
  else{ const t=tenPaleti(r.ten.ana); ten={...t,...Object.fromEntries(Object.entries(r.ten).map(([a,b])=>[a,Array.isArray(b)&&typeof b[0]==='string'?b:dz(b)]))}; }
  const yasIzi={...yasIziTuret(v.yas==null?30:v.yas),...(v.yasIzi||{})};
  const sac={bicim:erkek?'kisa':'uzun', cizgi:erkek?-128:-150, ...(v.sac||{})};
  // saç rengi: verilmezse kara; kır saç oranında griye çalar
  const kir=yasIzi.kirSac;
  const sacAna=r.sac?dz(r.sac):hex('#0d0c0e'), kirRenk=[118,114,104];
  const renk={
    tenIsik:ten.isik, ten:ten.ana, tenOrta:ten.orta, tenGolge:ten.golge, tenDerin:ten.derin, alinIsik:ten.alin,
    boyun:ten.boyun, el:ten.el,
    // ten verilmiş köylüde dudak ve göz varsayılan kadının boyalı dudağı ve soluk yeşil gözü olmaz
    dudak:r.dudak?dz(r.dudak):(erkek?karistir(ten.orta,'#4c2a31',.2):r.ten==null?PAL.dudak:karistir(ten.orta,'#5a2c32',.4)),
    dudakGolge:r.dudakGolge?dz(r.dudakGolge):(erkek?karistir(ten.golge,'#2a141a',.25):r.ten==null?PAL.dudakGolge:karistir(ten.golge,'#2a141a',.4)),
    iris:r.iris?dz(r.iris):r.ten==null?PAL.iris:hex('#4a3c2c'),
    irisOrta:r.irisOrta?dz(r.irisOrta):(r.iris||r.ten!=null?karistir(r.iris||'#4a3c2c','#1d211e',.45):hex('#6f786b')),
    irisKenar:r.irisKenar?dz(r.irisKenar):PAL.irisKenar,
    // kır saç yoksa ve renk verilmemişse varsayılan dizgiler aynen kalır (eski kare birebir aynı çıksın)
    sac:(!r.sac&&!kir)?'#0d0c0e':hexYaz(karistir(sacAna,kirRenk,kir*.8)),
    sacArka:(!r.sac&&!kir)?'#070608':hexYaz(karistir(karistir(sacAna,[0,0,0],.45),kirRenk,kir*.6)),
    sacIsik:(!r.sac&&!kir)?PAL.sacIsik:karistir(r.sacIsik?dz(r.sacIsik):karistir(sacAna,'#6a604e',.6),'#b4ae9e',kir*.7),
    sacKoyu:(!r.sac&&!kir)?[8,7,9]:karistir(karistir(sacAna,[0,0,0],.4),kirRenk,kir*.5),
    kas:r.kas?dz(r.kas):(kir>.5?karistir(PAL.murekkep,'#5e5a52',(kir-.5)*1.2):PAL.murekkep)
  };
  const sakal={bicim:'yok', boy:1, ...(v.sakal||{})};
  const biyik={bicim:'yok', ...(v.biyik||{})};
  const baslik={tur:'yok', ...(v.baslik||{})};
  if(baslik.tur==='yazma') baslik.tur='yemeni';
  const giysi={ic:erkek?'gomlek':'bluz', ...(v.giysi||{})};
  const ortu=v.ortu||'palto';
  // başlık ve saç neyi açıkta bırakır
  const ortuyor=baslik.tur==='yemeni'||baslik.tur==='sal';
  const kulak=!ortuyor&&sac.bicim!=='uzun'&&sac.bicim!=='dagnik';
  const yas=v.yas==null?30:v.yas;
  // ozel: yeni çizim yolu (yüz yapısı, başlık kaynaşması, kumaş kıvrımı). Varsayılan kadın eski yolla, prototiple birebir çizilir.
  const ozel=(v.id||'?')!=='varsayilan';
  const yapi={...yapiTuret(yas,erkek,yasIzi),...(v.yapi||{})};
  // yalnızca yeni yolda okunan ayrıntılar (README: "Ayrıntılar"); hepsi isteğe bağlı
  const gozluk=v.gozluk?{bicim:'tel', renk:'#2c2820', ...v.gozluk}:null;
  const gozFarki=v.gozFarki&&v.gozFarki.perde?{kapak:.32, ...v.gozFarki}:null;
  const ifade={agizKose:0, agizYan:0, kasSol:0, kasSag:0, bakisX:0, bakisY:0, ...(v.ifade||{})};
  const iz=Array.isArray(v.iz)?v.iz:[];
  const toz=v.toz?{tur:'un', yuz:.5, sac:.5, giysi:.6, ...v.toz}:null;
  return {id:v.id||'?', cinsiyet:erkek?'E':'K', yas, yuz, renk, yasIzi, sac, sakal, biyik, baslik, ortu, giysi,
    omuz:v.omuz==null?1:v.omuz, kulak, ortuyor, ozel, yapi, gozluk, gozFarki, ifade, iz, toz,
    boy:v.boy==null?1:v.boy, iri:v.iri==null?1:v.iri, bas:v.bas==null?(ozel?(erkek?.95:.97):1):v.bas, ham:v};
}

/* etkin görünüş: rig modülleri bunu okur (canlı bağ) */
export let G=gorunusKur(varsayilan);
export function karakterSec(v){
  G=v&&v.yuz&&v.renk&&v.ham?v:gorunusKur(v||varsayilan); // önceden kurulmuş görünüş de verilebilir
  YUZ.gozAralik=G.yuz.gozAralik;
  return G;
}
export const etkinGorunus=()=>G;
