import {describe,it,expect} from 'vitest';
import {sorulariUret,bilinenAnlar} from '../src/diyalog/soru.js';
import {defterYeni,cinayetEkle,izEkle,ifadeEkle,isaretle,karsilastir} from '../src/diyalog/defter.js';
import {SORU_KALIPLARI} from '../src/dil/tr/kaliplar.js';
import {ARTIK} from './yardim-oyun.js';
import kisilerTr from '../src/dil/tr/kisiler.js';
import {koy} from './yardim-oyun.js';

const an={gun:2,dongu:1};
const kisiler=Object.fromEntries(Object.values(koy.kisiler).map(k=>[k.id,{ev:k.ev,ortu:k.ortu}]));
const kamu=(S=6)=>({dilimler:['gece','sabah','ogle','ikindi','aksam'],sorguZamani:S,kisiler,canli:(id)=>id!=='nihat',
  izler:{i1:{ad:'kırmızı yün ipi',cinayet:'c1',sorulabilir:true},i2:{ad:'göğsünde bıçak yarası',cinayet:'c1',sorulabilir:false},i3:{ad:'aba tiftiği',cinayet:'c1',sorulabilir:true,ortu:'aba'}}});
const temel=()=>{
  let d=cinayetEkle(defterYeni(),{id:'c1',kurban:'nihat',mekan:'okul',zaman:5,bulan:'bekir',fotografGunu:2},an);
  return d;
};
const uret=(d,kisi='halil',S=6)=>sorulariUret({defter:d,kisi,gun:2,tohum:1,kamu:kamu(S)});

describe('soru üretimi',()=>{
  it('boş defterde yalnızca kendine dönük sorular',()=>{
    const l=sorulariUret({defter:defterYeni(),kisi:'halil',gun:1,tohum:1,kamu:kamu(1)});
    expect(l.map(s=>s.tur)).toEqual(['sir-kendi']);
  });
  it('fotoğraf deftere girince yer-zaman, görme, fail, fark ve kurban soruları açılır',()=>{
    const l=uret(temel());
    const turler=new Set(l.map(s=>s.tur));
    for(const t of ['yer','gordu','fail','fark','iliski','sir','sir-kendi']) expect(turler.has(t),t).toBe(true);
    expect(l.find(s=>s.tur==='yer').etiket).toMatch(/dün gece|yatsıdan|sabaha karşı/i);
    expect(l.some(s=>s.tur==='iz')).toBe(false); // iz bulunmadan gösterilemez
  });
  it('bulunan iz gösterilebilir; yara gösterilmez; kendi giysisinin lifi "senin mi" diye sorulur',()=>{
    let d=izEkle(izEkle(izEkle(temel(),{iz:'i1',cinayet:'c1'},an),{iz:'i2',cinayet:'c1'},an),{iz:'i3',cinayet:'c1'},an);
    const l=uret(d,'halil'); // Kör Halil aba giyer
    expect(l.find(s=>s.id==='iz:i1').etiket).toMatch(/kırmızı yün ipi/);
    expect(l.some(s=>s.id==='iz:i2')).toBe(false);
    expect(l.find(s=>s.id==='iz:i3').etiket).toMatch(/senin|Senin/);
  });
  it('gelecekteki ve sorgu anından sonraki cinayetler sorulmaz',()=>{
    const l=uret(temel(),'halil',5);
    expect(l.some(s=>s.zaman===5)).toBe(false);
  });
  it('yeni ifade yeni sorular açar ve sorulan soru kaybolur',()=>{
    let d=temel();
    const once=uret(d,'emine');
    ({defter:d}=ifadeEkle(d,{kisi:'elif',soru:{id:'gordu:5',tur:'gordu'},iddialar:[{tur:'konum',kisi:'gulsum',zaman:5,mekan:'okul'}],metin:'…'},an));
    const sonra=uret(d,'emine');
    expect(once.some(s=>s.id==='baskasi:gulsum:5')).toBe(false);
    expect(sonra.find(s=>s.id==='baskasi:gulsum:5').etiket).toMatch(/Dul Gülsüm/);
    ({defter:d}=ifadeEkle(d,{kisi:'emine',soru:{id:'yer:5',tur:'yer'},iddialar:[],metin:'…'},an));
    expect(uret(d,'emine').some(s=>s.id==='yer:5')).toBe(false);
  });
  it('şüpheli işareti başkasını sorma ve sır yoklama açar',()=>{
    const d=isaretle(temel(),'kazim','supheli');
    const l=uret(d,'emine');
    expect(l.some(s=>s.id==='baskasi:kazim:5')).toBe(true);
    expect(l.some(s=>s.id==='sir:kazim')).toBe(true);
    expect(l.some(s=>s.id==='iliski:kazim')).toBe(true);
  });
  it('çelişki kendiliğinden yüzleştirme açmaz; oyuncu yan yana koyunca konuşanlara açılır',()=>{
    let d=temel();
    ({defter:d}=ifadeEkle(d,{kisi:'cemil',soru:{id:'yer:5',tur:'yer'},iddialar:[{tur:'konum',kisi:'cemil',zaman:5,mekan:'aga-konagi'}],metin:'…'},an));
    ({defter:d}=ifadeEkle(d,{kisi:'dursun',soru:{id:'gordu:5',tur:'gordu'},iddialar:[{tur:'konum',kisi:'cemil',zaman:5,mekan:'okul'}],metin:'…'},an));
    expect(uret(d,'cemil').some(s=>s.tur==='yuzlesme')).toBe(false);
    d=karsilastir(d,'f1','f2',an).defter;
    const c=uret(d,'cemil').find(s=>s.tur==='yuzlesme');
    expect(c.etiket).toMatch(/Muhtar/); expect(c.etiket).toMatch(/köy okulunda/);
    expect(uret(d,'dursun').find(s=>s.tur==='yuzlesme').etiket).toMatch(/Küçük Ağa/);
    expect(uret(d,'elif').some(s=>s.tur==='yuzlesme')).toBe(false);
    expect(uret(d,'cemil')[0].tur).toBe('yuzlesme'); // en öncelikli
  });
  it('etiketler temiz ve belirlenimci; her soru kalıbı her kişiyle dolar',()=>{
    let d=izEkle(temel(),{iz:'i1',cinayet:'c1'},an);
    d=isaretle(d,'gulsum','supheli');
    expect(uret(d)).toEqual(uret(d));
    for(const s of uret(d)) expect(s.etiket).not.toMatch(ARTIK);
    expect(bilinenAnlar(d,6).cinayet).toEqual([5]);
    for(const id of Object.keys(kisilerTr)){
      const e=isaretle(d,id,'supheli');
      for(const s of uret(e,id==='halil'?'emine':'halil')) expect(s.etiket).not.toMatch(ARTIK);
    }
    expect(Object.keys(SORU_KALIPLARI).length).toBeGreaterThan(15);
  });
});
