// Silüetler: insanlar yalnızca karanlık, oturan ya da uzun giysili sabit kütle. Yüz, el, bacak yok.
// Hayvanlar da silüet: kedi, köpek, katır, eşek, koyun sırtı. Işığa bakan kenarda ince bir parıltı okunurluk verir.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,DURUM,hat,leke,tara,yerel,isikYonu} from './cizer.js';

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
   Parçalar ayrı ayrı doldurulur (üst üste binen yollar delik açmasın). basEgik 0..1 başı ensede öne düşürür. */
export function binek(x,y,s,o){
  o=o||{}; const yon=o.yon||1, esek=o.tur==='esek', egik=o.basEgik||0;
  yerel(x,y,s*(esek?.82:1),()=>{
    c.save(); c.scale(yon,1);
    const kul=esek?1.25:1;
    const govde=()=>{
      c.moveTo(-196,-158); c.bezierCurveTo(-190,-176,-170,-180,-150,-176);            // sağrı
      c.bezierCurveTo(-90,-168,-20,-166,40,-178);                                      // sırt
      c.bezierCurveTo(80,-186,112,-206,150,-238); c.lineTo(176,-252);                  // yele, ense
      c.bezierCurveTo(166,-210,156,-176,146,-150); c.bezierCurveTo(140,-126,134,-104,128,-86); // boyun altı, göğüs
      c.lineTo(126,-6); c.lineTo(132,0); c.lineTo(110,0); c.lineTo(110,-6); c.lineTo(104,-74); // ön bacak
      c.bezierCurveTo(60,-84,-40,-86,-104,-84);                                        // karın
      c.bezierCurveTo(-112,-60,-114,-30,-116,-6); c.lineTo(-110,0); c.lineTo(-134,0); c.lineTo(-136,-8); // arka bacak
      c.bezierCurveTo(-140,-44,-150,-70,-168,-92); c.bezierCurveTo(-190,-112,-200,-136,-196,-158); c.closePath();
    };
    const uzakBacak=()=>{c.moveTo(80,-80); c.lineTo(84,-6); c.lineTo(96,0); c.lineTo(74,0); c.lineTo(66,-80); c.closePath();
      c.moveTo(-82,-84); c.lineTo(-90,-8); c.lineTo(-84,0); c.lineTo(-106,0); c.lineTo(-104,-84); c.closePath();};
    const kuyruk=()=>{c.moveTo(-194,-160); c.bezierCurveTo(-210,-130,-212,-90,-206,-56); c.lineTo(-200,-56); c.bezierCurveTo(-202,-96,-198,-130,-186,-156); c.closePath();};
    const bas=()=>{ // ense (0,0) noktasına göre: alın öne-aşağı iner, burun yuvarlak, çene geri döner
      c.moveTo(-8,-6); c.bezierCurveTo(16,-10,34,20,52,62); c.bezierCurveTo(62,84,70,100,66,112);
      c.bezierCurveTo(62,124,46,126,38,118); c.bezierCurveTo(26,100,14,84,0,74); c.bezierCurveTo(-14,64,-24,40,-26,20); c.closePath();
    };
    const kulak=(dx,uz)=>()=>{c.moveTo(dx-6,0); c.bezierCurveTo(dx-14,-30*uz,dx-26,-62*uz,dx-34,-80*uz); c.bezierCurveTo(dx-22,-70*uz,dx-6,-40*uz,dx+8,-4); c.closePath();};
    const parca=[uzakBacak,kuyruk,govde];
    const basla=fn=>{c.save(); c.translate(170,-246); c.rotate(egik*.55); fn(); c.restore();};
    const yI=isikYonu(0)*yon, renk=o.kenarRenk||DURUM.isikRenk;
    // kenar ışığı, sonra kara gövde; her parça ayrı
    const doldur=(stil,dx)=>{
      c.fillStyle=stil;
      for(const p of parca){c.save(); c.translate(dx,-dx*.5); c.beginPath(); p(); c.fill(); c.restore();}
      basla(()=>{c.translate(dx,-dx*.5); for(const p of[bas,kulak(4,kul),kulak(-6,kul*.95)]){c.beginPath(); p(); c.fill();}});
    };
    doldur(rgba(renk,.24),yI*3);
    doldur('#0b0b0a',0);
    c.save(); c.globalAlpha=.6; c.fillStyle='#050505'; c.beginPath(); uzakBacak(); c.fill(); c.restore(); // uzak bacaklar daha karanlık
    hat(govde,R.murekkep,.7,1.6,o.seed||7,2,2);
    basla(()=>{hat(bas,R.murekkep,.7,1.4,(o.seed||7)+1,2,1.4); hat(kulak(4,kul),R.murekkep,.6,1.2,(o.seed||7)+2,1,1);});
    if(o.yuk){ // koyu semer, iki yanında sarkan kıl heybe
      const semer=()=>{c.moveTo(-120,-172); c.bezierCurveTo(-110,-208,10,-212,40,-178); c.lineTo(30,-152); c.lineTo(-114,-150); c.closePath();};
      c.fillStyle='#17140e'; c.beginPath(); semer(); c.fill(); hat(semer,R.murekkep,.8,1.6,701,2,2);
      c.save(); c.beginPath(); semer(); c.clip(); leke(-40,-200,80,16,renk,.14); c.restore();
      const denk=()=>{c.moveTo(-118,-176); c.bezierCurveTo(-130,-210,-110,-246,-70,-246); c.bezierCurveTo(-50,-256,-20,-256,-4,-244); c.bezierCurveTo(30,-246,46,-214,36,-180); c.closePath();};
      c.fillStyle='#211b12'; c.beginPath(); denk(); c.fill();
      c.save(); c.beginPath(); denk(); c.clip(); leke(-40,-250,90,26,renk,.1); leke(-40,-180,100,30,R.siyah,.55); tara(-130,-260,50,-170,.4,6,R.murekkep,.4,703); c.restore();
      hat(denk,R.murekkep,.85,1.6,702,2,2);
      hat(()=>{c.moveTo(-60,-250); c.bezierCurveTo(-70,-210,-74,-190,-80,-150); c.moveTo(0,-246); c.bezierCurveTo(-4,-210,0,-190,6,-150);},[90,76,50],.6,1.6,705,1,1); // urgan
    }
    if(o.can){ // boynunda pirinç çan
      const cn=()=>{c.moveTo(150,-150); c.lineTo(162,-118); c.lineTo(138,-118); c.closePath();};
      hat(()=>{c.moveTo(136,-176); c.quadraticCurveTo(150,-160,150,-150);},[60,50,30],.8,1.4,709,1,0);
      c.fillStyle='#4a3816'; c.beginPath(); cn(); c.fill(); hat(cn,R.murekkep,.8,1.2,710,2,1); leke(150,-132,16,14,renk,.2);
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
