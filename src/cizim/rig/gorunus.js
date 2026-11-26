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
export const BASLIKLAR=['yok','kasket','kep','yemeni','yazma','takke','sarik','sal'];
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

/* Ham veriyi rig'in kullandığı biçime çevirir: eksik alanları doldurur, renkleri diziye çevirir. */
export function gorunusKur(v){
  v=v||{};
  const erkek=v.cinsiyet==='E';
  const yuz={...YUZ_TEMEL,...(v.yuz||{})};
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
    dudak:r.dudak?dz(r.dudak):(erkek?karistir(ten.orta,'#4c2a31',.35):PAL.dudak),
    dudakGolge:r.dudakGolge?dz(r.dudakGolge):(erkek?karistir(ten.golge,'#2a141a',.5):PAL.dudakGolge),
    iris:r.iris?dz(r.iris):PAL.iris, irisOrta:r.irisOrta?dz(r.irisOrta):(r.iris?karistir(r.iris,'#1d211e',.45):hex('#6f786b')),
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
  return {id:v.id||'?', cinsiyet:erkek?'E':'K', yas:v.yas==null?30:v.yas, yuz, renk, yasIzi, sac, sakal, biyik, baslik, ortu, giysi,
    omuz:v.omuz==null?1:v.omuz, kulak, ortuyor, ham:v};
}

/* etkin görünüş: rig modülleri bunu okur (canlı bağ) */
export let G=gorunusKur(varsayilan);
export function karakterSec(v){
  G=v&&v.yuz&&v.renk&&v.ham?v:gorunusKur(v||varsayilan); // önceden kurulmuş görünüş de verilebilir
  YUZ.gozAralik=G.yuz.gozAralik;
  return G;
}
export const etkinGorunus=()=>G;
