// Silüetler: insanlar yalnızca karanlık, oturan ya da uzun giysili sabit kütle. Yüz, el, bacak yok.
// Hayvanlar da silüet: kedi, köpek, katır, eşek, koyun sırtı. Işığa bakan kenarda ince bir parıltı okunurluk verir.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,DURUM,hat,leke,tara,yerel,isikYonu,sekil} from './cizer.js';

const KARA='#070808';

// kenar ışığı: biçimi ışığa doğru kaydırıp açık renkle bas, üstüne karanlık biçimi koy
// yol tek işlev ya da işlev dizisi olabilir; dizideki parçalar ayrı doldurulur (üst üste binen yollar delik açmasın)
function silBas(yol,o){
  o=o||{}; const yon=isikYonu(0), a=o.kenar==null?.22:o.kenar, P=Array.isArray(yol)?yol:[yol];
  const doldur=()=>{for(const p of P){c.beginPath(); p(); c.fill();}};
  if(a>0){c.save(); c.translate(yon*(o.kay||3),-1.5); c.fillStyle=rgba(o.kenarRenk||DURUM.isikRenk,a); doldur(); c.restore();}
  c.fillStyle=o.renk||KARA; doldur();
  c.save(); c.beginPath(); P[0](); c.clip(); leke(yon*-30,-60,140,200,R.siyah,.5); c.restore();
  for(let i=0;i<P.length;i++) hat(P[i],R.murekkep,.7,1.6,(o.seed||5)+i,2,2.2);
}

/* yerde bağdaş kurup oturan insan. tip: 'erkek' | 'kadin' | 'cocuk'. Taban (0,0); yükseklik ≈ 250 birim */
export function oturan(x,y,s,o){
  o=o||{}; const tip=o.tip||'erkek', r=rng(o.seed||3), egik=o.egik||0; // egik: başı öne düşmüş
  const ortulu=tip==='kadin'||(tip==='cocuk'&&o.kiz);
  yerel(x,y,s*(tip==='cocuk'?.62:1),()=>{
    const bas=tip==='cocuk'?1.25:1, b=(r()-.5)*8;
    const govde=()=>{
      c.moveTo(-108,0); c.bezierCurveTo(-112,-48,-86,-70,-70,-96);
      c.bezierCurveTo(-62,-140,-64,-168,-46,-182); c.quadraticCurveTo(-24,-194+egik*6,-14,-196+egik*10);
      c.lineTo(14,-196+egik*10); c.quadraticCurveTo(24,-194+egik*6,46+b,-182);
      c.bezierCurveTo(64,-168,62,-140,70,-96); c.bezierCurveTo(86,-70,112,-48,108,0); c.closePath();
    };
    const hy=-224+egik*18-(bas-1)*20, hx=egik*4;
    const kafa=()=>{
      if(ortulu){ // yemeni başı ve omuzları örter: tek parça kütle
        c.moveTo(hx-30*bas,hy+6); c.bezierCurveTo(hx-34*bas,hy-40*bas,hx+34*bas,hy-40*bas,hx+30*bas,hy+6);
        c.bezierCurveTo(hx+40,hy+40,56,-176,66,-150); c.lineTo(-66,-150); c.bezierCurveTo(-56,-176,hx-40,hy+40,hx-30*bas,hy+6); c.closePath();
      } else {
        c.ellipse(hx,hy,25*bas,31*bas,egik*.2,0,TAU);
        if(tip==='erkek'&&o.kasket!==false){c.moveTo(hx-28,hy-12); c.quadraticCurveTo(hx,hy-44,hx+28,hy-12); c.lineTo(hx+34,hy-8); c.lineTo(hx-28,hy-8); c.closePath();}
      }
    };
    const hepsi=()=>{govde(); kafa();};
    silBas(hepsi,o);
  });
}

/* ayakta, uzun giysili, kıpırtısız insan. Etek yere kadar iner; ayak görünmez. Yükseklik ≈ 470 birim */
export function ayakta(x,y,s,o){
  o=o||{}; const tip=o.tip||'erkek', r=rng(o.seed||4);
  const cocuk=tip==='cocuk', ortulu=tip==='kadin'||(cocuk&&o.kiz);
  yerel(x,y,s*(cocuk?.5:1),()=>{
    if(cocuk) c.scale(1.22,.9);
    const bas=cocuk?1.4:1, b=(r()-.5)*6, egik=o.egik||0;
    const govde=()=>{
      c.moveTo(-74,0); c.bezierCurveTo(-70,-120,-50,-230,-48,-300); c.bezierCurveTo(-50,-350,-60,-380,-50,-398);
      c.quadraticCurveTo(-30,-412,-14,-414); c.lineTo(14,-414); c.quadraticCurveTo(30,-412,50+b,-398);
      c.bezierCurveTo(60,-380,50,-350,48,-300); c.bezierCurveTo(50,-230,70,-120,74,0);
      c.quadraticCurveTo(0,8,-74,0); c.closePath();
    };
    const hy=-444+egik*14-(bas-1)*24, hx=egik*5;
    const kafa=()=>{
      if(ortulu){
        c.moveTo(hx-28*bas,hy+8); c.bezierCurveTo(hx-34*bas,hy-42*bas,hx+34*bas,hy-42*bas,hx+28*bas,hy+8);
        c.bezierCurveTo(hx+40,hy+46,58,-380,60,-330); c.lineTo(-60,-330); c.bezierCurveTo(-58,-380,hx-40,hy+46,hx-28*bas,hy+8); c.closePath();
      } else {
        c.ellipse(hx,hy,24*bas,30*bas,0,0,TAU);
        if(tip==='erkek'&&o.kasket!==false){c.moveTo(hx-27,hy-12); c.quadraticCurveTo(hx,hy-44,hx+27,hy-12); c.lineTo(hx+33,hy-8); c.lineTo(hx-27,hy-8); c.closePath();}
      }
    };
    silBas(()=>{govde(); kafa();},o);
  });
}

/* kedi. poz: 'otur' (oturup bakar) | 'yat' (çöreklenmiş) | 'bak' (sırtı dönük, kapıya bakar). yon: +1 sağa. Oturan ≈ 90 birim */
export function kedi(x,y,s,o){
  o=o||{}; const poz=o.poz||'otur', yon=o.yon||1;
  yerel(x,y,s,()=>{
    c.save(); c.scale(yon,1);
    let yol, kuyruk;
    if(poz==='yat'){
      yol=()=>{
        c.moveTo(-46,0); c.bezierCurveTo(-52,-26,-30,-40,0,-40); c.bezierCurveTo(22,-40,30,-34,36,-30);
        c.lineTo(38,-44); c.lineTo(46,-36); c.lineTo(54,-46); c.lineTo(56,-30); c.bezierCurveTo(62,-22,60,-8,52,-4);
        c.bezierCurveTo(40,2,10,2,-46,0); c.closePath();
      };
      kuyruk=()=>{c.moveTo(-40,-4); c.bezierCurveTo(-62,-2,-64,12,-40,10); c.lineTo(10,8); c.lineTo(10,2); c.closePath();}; // öne dolanır
    } else {
      yol=()=>{
        // gövde: aşağıda geniş, göğse doğru daralan damla
        c.moveTo(-30,0); c.bezierCurveTo(-40,-30,-30,-58,-14,-66); c.lineTo(-12,-72);
        // baş ve kulaklar
        c.bezierCurveTo(-22,-74,-24,-90,-17,-98); c.lineTo(-19,-116); c.lineTo(-6,-104);
        c.quadraticCurveTo(0,-106,6,-104); c.lineTo(17,-117); c.lineTo(17,-98);
        c.bezierCurveTo(24,-90,22,-74,12,-70); c.bezierCurveTo(22,-58,34,-36,28,0);
        c.closePath();
      };
      kuyruk=()=>{c.moveTo(20,-2); c.bezierCurveTo(48,-2,56,-16,50,-30); c.bezierCurveTo(48,-36,42,-34,44,-28); c.bezierCurveTo(48,-16,40,-8,20,-8); c.closePath();}; // yerde kıvrılır
    }
    silBas([yol,kuyruk],{kenar:o.kenar==null?.3:o.kenar,kenarRenk:o.kenarRenk,seed:o.seed||9,kay:2});
    if(o.goz&&poz!=='bak'){ // karanlıkta parlayan iki göz
      const gy=poz==='yat'?-30:-88, gx=poz==='yat'?44:0, ara=poz==='yat'?6:8;
      for(const d of[-1,1]){c.fillStyle=rgba(o.gozRenk||[170,170,110],.85); c.beginPath(); c.ellipse(gx+d*ara,gy,2.6,1.8,0,0,TAU); c.fill(); leke(gx+d*ara,gy,9,7,o.gozRenk||[170,170,110],.25);}
    }
    c.restore();
  });
}

/* yatan çoban köpeği (kangal): göğsü yerde, başı kalkık, ön patileri önünde uzanır. Uzunluk ≈ 300 birim */
export function kopek(x,y,s,o){
  o=o||{}; const yon=o.yon||1, k=o.kalkik?1:0;
  yerel(x,y,s,()=>{
    c.save(); c.scale(yon,1);
    const by=-70-k*20; // başın tepe hizası
    const govde=()=>{
      c.moveTo(-150,0); c.bezierCurveTo(-170,-8,-168,-56,-136,-72);                 // sağrı, yere çökmüş arka bacak
      c.bezierCurveTo(-90,-88,-10,-82,40,-80);                                       // sırt
      c.bezierCurveTo(64,-80,74,by+4,86,by-4);                                       // ense (kalın tüylü)
      c.lineTo(110,by-10); c.bezierCurveTo(124,by-8,130,by,134,by+6);                // kafa üstü
      c.lineTo(168,by+20); c.bezierCurveTo(174,by+24,172,by+36,164,by+38);           // uzun burun
      c.lineTo(132,by+42); c.bezierCurveTo(118,by+46,108,by+56,104,-30);             // çene altı, boğaz
      c.lineTo(104,-14);                                                             // göğüs
      c.bezierCurveTo(60,-6,-60,-2,-150,0); c.closePath();
    };
    const patiler=()=>{c.moveTo(70,-16); c.lineTo(176,-14); c.bezierCurveTo(186,-12,186,0,176,0); c.lineTo(70,0); c.closePath();
      c.moveTo(60,-6); c.lineTo(150,-4);};
    const kulak=()=>{c.moveTo(100,by-8); c.bezierCurveTo(86,by+4,84,by+30,92,by+44); c.bezierCurveTo(100,by+40,112,by+22,116,by-6); c.closePath();};
    const kuyruk=()=>{c.moveTo(-150,-30); c.bezierCurveTo(-190,-30,-214,-10,-212,4); c.bezierCurveTo(-200,8,-180,0,-150,-6); c.closePath();};
    silBas([govde,patiler,kuyruk],{kenar:o.kenar==null?.3:o.kenar,kenarRenk:o.kenarRenk,seed:o.seed||8,kay:3});
    // sarkık kulak: gövdeden bir ton açık, kenarı belli
    c.fillStyle='#16140f'; c.beginPath(); kulak(); c.fill(); hat(kulak,R.murekkep,.8,1.4,(o.seed||8)+7,2,1);
    c.fillStyle='#020202'; c.beginPath(); c.ellipse(160,by+28,7,6,0,0,TAU); c.fill(); // kara maske, burun
    hat(()=>{c.moveTo(-120,-76); c.bezierCurveTo(-80,-92,-20,-90,30,-84);},R.murekkep,.4,1.2,(o.seed||8)+9,2,3); // tüy
    c.restore();
  });
}

/* katır ya da eşek, yandan, dinlenir duruşta. Taban (0,0) toynak hizası; sırt ≈ 180 birim.
   Gövde, boyun ve baş TEK yol: ense yeleyle yukarı kalkar, alın öne iner, uzun burun, yuvarlak yanak, gırtlak göğse
   bağlanır (ayrı döndürülmüş kafa parçası yok). Kulaklar uzun ve ayrı çizilir; ışığa bakan üst kenarlarda ince parıltı.
   yuk: semer, iki yanda sarkan kıl denk (çuval) ve üstte bağlı yük; urganlar çapraz. Bacaklar karanlıkta / bölme arkasında. */
export function binek(x,y,s,o){
  o=o||{}; const yon=o.yon||1, esek=o.tur==='esek', egik=Math.min(1,o.basEgik||0);
  yerel(x,y,s*(esek?.84:1),()=>{
    c.save(); c.scale(yon,1);
    const kul=esek?1.2:1, e=egik*34; // e: baş ne kadar aşağıda
    const govde=()=>{
      c.moveTo(-204,-150); c.bezierCurveTo(-200,-176,-178,-186,-150,-182);              // sağrı
      c.bezierCurveTo(-90,-174,-16,-170,40,-184);                                         // sırt
      c.bezierCurveTo(84,-196,118,-226+e*.4,146,-252+e);                                  // yele, ense
      c.lineTo(162,-258+e);                                                               // tepe
      c.bezierCurveTo(176,-250+e,196,-212+e*1.1,210,-180+e*1.2);                         // alın, burun sırtı
      c.bezierCurveTo(218,-166+e*1.2,228,-152+e*1.2,224,-140+e*1.2);                     // burun ucu
      c.bezierCurveTo(222,-128+e*1.2,206,-124+e*1.2,196,-130+e*1.2);                     // dudak
      c.bezierCurveTo(186,-136+e*1.1,178,-144+e,170,-156+e);                              // çene
      c.bezierCurveTo(162,-170+e,148,-176+e*.8,140,-168+e*.6);                            // yanak
      c.bezierCurveTo(134,-150,130,-120,128,-92);                                         // gırtlak, göğüs
      c.lineTo(126,-6); c.lineTo(132,0); c.lineTo(108,0); c.lineTo(106,-6); c.lineTo(102,-74); // ön bacak
      c.bezierCurveTo(60,-84,-40,-86,-106,-84);                                           // karın
      c.bezierCurveTo(-112,-60,-114,-30,-116,-6); c.lineTo(-110,0); c.lineTo(-136,0); c.lineTo(-138,-8); // arka bacak
      c.bezierCurveTo(-142,-44,-152,-70,-170,-92); c.bezierCurveTo(-194,-112,-208,-130,-204,-150); c.closePath();
    };
    const uzakBacak=()=>{c.moveTo(80,-80); c.lineTo(84,-6); c.lineTo(96,0); c.lineTo(74,0); c.lineTo(66,-80); c.closePath();
      c.moveTo(-82,-84); c.lineTo(-90,-8); c.lineTo(-84,0); c.lineTo(-106,0); c.lineTo(-104,-84); c.closePath();};
    const kuyruk=()=>{c.moveTo(-200,-160); c.bezierCurveTo(-216,-130,-218,-90,-212,-52); c.lineTo(-204,-50); c.bezierCurveTo(-206,-92,-202,-130,-190,-158); c.closePath();};
    const kulak=(bx,uz,ac)=>()=>{const tx=bx-26*ac, ty=-258+e-82*uz*kul; c.moveTo(bx-7,-254+e); c.bezierCurveTo(bx-16,-280+e,tx-6,ty+22,tx,ty); c.bezierCurveTo(tx+12,ty+18,bx+4,-280+e,bx+8,-252+e); c.closePath();};
    const kulaklar=[kulak(150,1,.55),kulak(164,.96,.2)];
    const yI=isikYonu(0)*yon, renk=o.kenarRenk||DURUM.isikRenk;
    const parca=[uzakBacak,kuyruk,govde,...kulaklar];
    // kenar ışığı: ışık yukarıdan ve yandan; biçim ışığa doğru kaydırılıp açık renkle basılır
    c.save(); c.translate(yI*3,-3.5); c.fillStyle=rgba(renk,.3); for(const p of parca){c.beginPath(); p(); c.fill();} c.restore();
    c.fillStyle='#0a0a09'; for(const p of parca){c.beginPath(); p(); c.fill();}
    c.save(); c.globalAlpha=.6; c.fillStyle='#040404'; c.beginPath(); uzakBacak(); c.fill(); c.restore();
    // gövdenin içinde çok koyu tarama ve kıl dokusu: düz siyah kalmasın
    c.save(); c.beginPath(); govde(); c.clip();
    leke(-40,-120,170,70,R.siyah,.6); leke(180,-200+e,40,50,renk,.05);
    tara(-210,-260,230,0,1.2,7,[40,38,30],.35,(o.seed||7)+20,1);
    c.restore();
    hat(govde,R.murekkep,.85,1.8,o.seed||7,3,2.2);
    for(const k of kulaklar) hat(k,R.murekkep,.8,1.4,(o.seed||7)+3,2,1.4);
    hat(()=>{c.moveTo(186,-176+e*1.1); c.quadraticCurveTo(192,-170+e*1.1,198,-174+e*1.1);},[60,58,50],.5,1.2,(o.seed||7)+4,1,0); // göz kapağı çizgisi (göz yok: kapalı)
    hat(()=>{c.moveTo(214,-150+e*1.2); c.lineTo(218,-146+e*1.2);},[40,38,34],.6,1.6,(o.seed||7)+5,1,0); // burun deliği
    // yele: enseden sırta kısa dik kıllar
    for(let i=0;i<9;i++){const t=i/8, mx=40+t*110, my=-184-t*(68-e)-Math.sin(t*3)*4; hat(()=>{c.moveTo(mx,my); c.lineTo(mx-4,my-9);},R.murekkep,.7,1.6,(o.seed||7)+40+i,1,.6);}
    if(o.yuk){
      // semer
      const semer=()=>{c.moveTo(-118,-176); c.bezierCurveTo(-108,-212,14,-214,44,-182); c.lineTo(34,-158); c.lineTo(-112,-156); c.closePath();};
      c.fillStyle='#19150f'; c.beginPath(); semer(); c.fill(); hat(semer,R.murekkep,.85,1.6,701,2,2);
      // yandaki kıl denk: gövdenin yanına sarkan dolu çuval
      // yandaki kıl denk: semerin altından gövdenin yanına sarkan, dibi şişkin çuval (karnın üstünde biter)
      const denk=()=>{c.moveTo(-96,-184); c.bezierCurveTo(-60,-190,-10,-190,16,-182); c.bezierCurveTo(28,-156,30,-126,18,-104); c.bezierCurveTo(-6,-92,-62,-92,-88,-104); c.bezierCurveTo(-104,-126,-106,-160,-96,-184); c.closePath();};
      sekil(denk,[30,25,18],[-106,-190,30,-92],{seed:702,aralik:5,aci:.35,taraA:.5,isikRenk:renk,isik:.05,koyu:.55});
      for(let i=0;i<5;i++){const xx=-78+i*22; hat(()=>{c.moveTo(xx,-184); c.bezierCurveTo(xx-3,-150,xx+2,-122,xx-2,-98);},[12,10,6],.6,1.8,703+i,1,1.2);} // kıl dokuma şeritleri
      // üstte bağlı yük: enine yatan dolu çuval
      const ust=()=>{c.moveTo(-84,-186); c.bezierCurveTo(-92,-216,-56,-228,-30,-222); c.bezierCurveTo(-4,-230,22,-220,22,-196); c.bezierCurveTo(22,-186,6,-182,-10,-184); c.closePath();};
      sekil(ust,[34,28,20],[-92,-230,22,-182],{seed:710,aralik:5,aci:.5,taraA:.45,isikRenk:renk,isik:.08,koyu:.5});
      // urganlar: çapraz bağ, loşta seçilecek kadar açık
      hat(()=>{c.moveTo(-80,-214); c.lineTo(8,-104); c.moveTo(14,-216); c.lineTo(-80,-102); c.moveTo(-98,-146); c.bezierCurveTo(-40,-138,0,-140,26,-146);},[96,82,54],.55,1.8,712,2,1);
      // ışık yükün yalnız tepesine vurur
      c.save(); c.strokeStyle=rgba(renk,.4); c.lineWidth=2; c.beginPath(); c.moveTo(-86,-190); c.bezierCurveTo(-92,-216,-56,-228,-30,-222); c.bezierCurveTo(-4,-230,18,-222,22,-204); c.stroke(); c.restore();
    }
    if(o.can){ // boynunda pirinç çan
      const cn=()=>{c.moveTo(150,-146); c.lineTo(162,-114); c.lineTo(138,-114); c.closePath();};
      hat(()=>{c.moveTo(134,-172); c.quadraticCurveTo(150,-158,150,-146);},[60,50,30],.8,1.4,709,1,0);
      c.fillStyle='#4a3816'; c.beginPath(); cn(); c.fill(); hat(cn,R.murekkep,.8,1.2,710,2,1); leke(150,-128,16,14,renk,.2);
    }
    c.restore();
  });
}

/* sürü: ağıl duvarının arkasında yan yana yünlü sırtlar ve birkaç baş */
export function suru(x0,x1,y,s,o){
  o=o||{}; const r=rng(o.seed||12);
  for(let x=x0;x<x1;x+=(46+r()*30)*s){
    const yy=y-(r()*20)*s, w=(60+r()*24)*s, h=(40+r()*14)*s;
    const yol=()=>{c.moveTo(x-w,yy); for(let a=0;a<=6;a++){const t=Math.PI+a/6*Math.PI; c.quadraticCurveTo(x+Math.cos(t-.25)*w*1.15,yy+Math.sin(t-.25)*h*1.25,x+Math.cos(t)*w,yy+Math.sin(t)*h);} c.closePath();};
    c.fillStyle=rgba([30,29,24],1); c.beginPath(); yol(); c.fill();
    c.save(); c.beginPath(); yol(); c.clip(); leke(x+isikYonu(x)*w*.4,yy-h*.6,w*.7,h*.5,R.ay,.12+r()*.08); c.restore();
    hat(yol,R.murekkep,.6,1.3,(x|0),2,2);
    if(r()<.08){const hx=x+(r()<.5?-1:1)*w*.8, hy=yy-h*.5; c.fillStyle=KARA; c.beginPath(); c.ellipse(hx,hy,12*s,18*s,r()-.5,0,TAU); c.fill(); hat(()=>{c.ellipse(hx,hy,12*s,18*s,0,0,TAU);},R.murekkep,.6,1.2,(hx|0),1,1);}
  }
}

// silüetin altındaki gölge
export function siluetGolge(x,y,w){leke(x,y+2,w,w*.16,R.siyah,.75);}
