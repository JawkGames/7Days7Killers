// Silüetler: insanlar yalnızca karanlık, oturan ya da uzun giysili sabit kütle. Yüz, el, bacak yok.
// Hayvanlar da silüet: kedi, köpek, katır, eşek, koyun sırtı. Işığa bakan kenarda ince bir parıltı okunurluk verir.
import {c} from '../../teknik/tuval.js';
import {TAU,rgba} from '../../../cekirdek/matematik.js';
import {rng} from '../../../cekirdek/rastgele.js';
import {R,DURUM,hat,leke,tara,yerel,isikYonu} from './cizer.js';

const KARA='#070808';

// kenar ışığı: biçimi ışığa doğru kaydırıp açık renkle bas, üstüne karanlık biçimi koy
function silBas(yol,o){
  o=o||{}; const yon=isikYonu(0), a=o.kenar==null?.22:o.kenar;
  if(a>0){c.save(); c.translate(yon*(o.kay||3),-1.5); c.fillStyle=rgba(o.kenarRenk||DURUM.isikRenk,a); c.beginPath(); yol(); c.fill(); c.restore();}
  c.fillStyle=o.renk||KARA; c.beginPath(); yol(); c.fill();
  c.save(); c.beginPath(); yol(); c.clip(); leke(yon*-30,-60,140,200,R.siyah,.5); c.restore();
  hat(yol,R.murekkep,.7,1.6,o.seed||5,2,2.2);
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
    let yol;
    if(poz==='yat'){
      yol=()=>{
        c.moveTo(-46,0); c.bezierCurveTo(-52,-26,-30,-40,0,-40); c.bezierCurveTo(22,-40,30,-34,36,-30);
        c.lineTo(38,-44); c.lineTo(46,-36); c.lineTo(54,-46); c.lineTo(56,-30); c.bezierCurveTo(62,-22,60,-8,52,-4);
        c.bezierCurveTo(40,2,10,2,-46,0); c.closePath();
        c.moveTo(-40,-2); c.bezierCurveTo(-60,-2,-64,12,-40,10); c.lineTo(10,6); c.closePath(); // kuyruk öne dolanır
      };
    } else {
      yol=()=>{
        // gövde: aşağıda geniş, göğse doğru daralan damla
        c.moveTo(-30,0); c.bezierCurveTo(-40,-30,-30,-58,-14,-66); c.lineTo(-12,-72);
        // baş ve kulaklar
        c.bezierCurveTo(-22,-74,-24,-90,-17,-98); c.lineTo(-19,-116); c.lineTo(-6,-104);
        c.quadraticCurveTo(0,-106,6,-104); c.lineTo(17,-117); c.lineTo(17,-98);
        c.bezierCurveTo(24,-90,22,-74,12,-70); c.bezierCurveTo(22,-58,34,-36,28,0);
        c.closePath();
        // kuyruk yerde kıvrılır
        c.moveTo(24,-2); c.bezierCurveTo(48,-2,56,-16,50,-30); c.bezierCurveTo(48,-36,42,-34,44,-28); c.bezierCurveTo(48,-16,40,-8,24,-8); c.closePath();
      };
    }
    silBas(yol,{kenar:o.kenar==null?.3:o.kenar,kenarRenk:o.kenarRenk,seed:o.seed||9,kay:2});
    if(o.goz&&poz!=='bak'){ // karanlıkta parlayan iki göz
      const gy=poz==='yat'?-30:-88, gx=poz==='yat'?44:0, ara=poz==='yat'?6:8;
      for(const d of[-1,1]){c.fillStyle=rgba(o.gozRenk||[170,170,110],.85); c.beginPath(); c.ellipse(gx+d*ara,gy,2.6,1.8,0,0,TAU); c.fill(); leke(gx+d*ara,gy,9,7,o.gozRenk||[170,170,110],.25);}
    }
    c.restore();
  });
}

/* yatan çoban köpeği, başı ön patilerinin üstünde ya da kalkık. Uzunluk ≈ 280 birim */
export function kopek(x,y,s,o){
  o=o||{}; const yon=o.yon||1, kalkik=o.kalkik?1:0;
  yerel(x,y,s,()=>{
    c.save(); c.scale(yon,1);
    const by=-40-kalkik*26;
    const yol=()=>{
      c.moveTo(-130,0); c.bezierCurveTo(-150,-10,-146,-58,-110,-66); // sağrı
      c.bezierCurveTo(-60,-78,10,-76,50,-62);                        // sırt
      c.bezierCurveTo(70,-60,80,by-14,96,by-24);                     // ense
      c.bezierCurveTo(112,by-34,128,by-30,136,by-20); c.lineTo(162,by-8); c.bezierCurveTo(168,by-4,166,by+6,158,by+8); // burun
      c.lineTo(130,by+14); c.bezierCurveTo(118,by+20,108,-20,100,-14);
      c.lineTo(150,-10); c.bezierCurveTo(160,-8,160,0,150,0);        // öne uzanmış patiler
      c.closePath();
      // sarkık kulak
      c.moveTo(112,by-28); c.bezierCurveTo(104,by-20,102,by-4,108,by+4); c.bezierCurveTo(116,by,120,by-14,122,by-26); c.closePath();
      // kuyruk yerde
      c.moveTo(-136,-8); c.bezierCurveTo(-170,-6,-190,4,-200,2); c.bezierCurveTo(-190,10,-160,8,-130,0); c.closePath();
    };
    silBas(yol,{kenar:o.kenar==null?.28:o.kenar,kenarRenk:o.kenarRenk,seed:o.seed||8,kay:3});
    c.restore();
  });
}

/* katır ya da eşek, yandan: gövdenin altı bölme tahtası, yalak ya da gölge arkasında kalır.
   Baş ensede (tepe noktası) döner; basEgik 0..1 başı öne düşürür. Uzun kulaklar geriye yatık. */
export function binek(x,y,s,o){
  o=o||{}; const yon=o.yon||1, esek=o.tur==='esek', egik=(o.basEgik||0)*.9;
  yerel(x,y,s*(esek?.8:1),()=>{
    c.save(); c.scale(yon,1);
    const kul=esek?1.3:1;
    const govde=()=>{
      c.moveTo(-210,20); c.bezierCurveTo(-226,-60,-214,-150,-178,-172);           // sağrı
      c.bezierCurveTo(-120,-186,10,-176,76,-178);                                 // sırt
      c.bezierCurveTo(110,-180,150,-200,178,-214);                                // boyun üstü (yele)
      c.lineTo(196,-196); c.bezierCurveTo(176,-150,156,-110,140,-70);              // boyun altı
      c.bezierCurveTo(132,-30,128,0,124,20); c.closePath();
    };
    const bas=()=>{ // ense noktasına göre: alın öne ve aşağı, uzun yüz, kulaklar geriye
      c.moveTo(-12,-6); c.bezierCurveTo(14,-14,40,-6,70,30); c.bezierCurveTo(92,54,104,80,104,94);
      c.bezierCurveTo(104,108,90,114,78,108); c.bezierCurveTo(56,96,30,70,10,50); c.bezierCurveTo(-4,36,-14,20,-16,4); c.closePath();
      c.moveTo(-6,-4); c.bezierCurveTo(-30,-40*kul,-52,-66*kul,-60,-78*kul); c.bezierCurveTo(-44,-70*kul,-22,-40*kul,4,-12); c.closePath(); // kulak
      c.moveTo(4,-8); c.bezierCurveTo(-10,-46*kul,-24,-74*kul,-28,-88*kul); c.bezierCurveTo(-12,-76*kul,4,-44*kul,14,-12); c.closePath(); // öbür kulak
    };
    const hepsi=()=>{govde(); c.save(); c.translate(186,-206); c.rotate(.35+egik*.75); bas(); c.restore();};
    // yol dönüşüm içeriyor: silBas yerine elle bas
    const yonI=isikYonu(0)*yon, a=.22;
    c.save(); c.translate(yonI*3,-1.5); c.fillStyle=rgba(o.kenarRenk||DURUM.isikRenk,a); c.beginPath(); hepsi(); c.fill(); c.restore();
    c.fillStyle=KARA; c.beginPath(); hepsi(); c.fill();
    hat(govde,R.murekkep,.7,1.6,o.seed||7,2,2.2);
    c.save(); c.translate(186,-206); c.rotate(.35+egik*.75); hat(bas,R.murekkep,.7,1.4,(o.seed||7)+1,2,1.6); c.restore();
    if(o.yuk){ // koyu semer ve iki yanda sarkan kıl çuvallar
      const semer=()=>{c.moveTo(-120,-176); c.bezierCurveTo(-110,-214,10,-218,40,-178); c.lineTo(34,-150); c.lineTo(-114,-150); c.closePath();};
      c.fillStyle='#16130e'; c.beginPath(); semer(); c.fill(); hat(semer,R.murekkep,.8,1.6,701,2,2);
      c.save(); c.beginPath(); semer(); c.clip(); leke(-40,-206,80,18,DURUM.isikRenk,.12); c.restore();
      const cuval=()=>{c.moveTo(-104,-190); c.bezierCurveTo(-130,-150,-128,-70,-100,-44); c.lineTo(10,-44); c.bezierCurveTo(36,-70,40,-150,20,-190); c.closePath();};
      c.fillStyle='#1d1a13'; c.beginPath(); cuval(); c.fill();
      c.save(); c.beginPath(); cuval(); c.clip(); leke(-20,-150,60,50,DURUM.isikRenk,.1); leke(-60,-60,90,50,R.siyah,.6); tara(-130,-190,40,-44,.5,6,R.murekkep,.4,703); c.restore();
      hat(cuval,R.murekkep,.85,1.5,702,2,2);
      for(const yy of[-150,-100]) hat(()=>{c.moveTo(-118,yy); c.quadraticCurveTo(-44,yy-8,30,yy);},R.murekkep,.5,1.2,704+yy,1,1); // ip
    }
    if(o.can){ // boynunda pirinç çan
      const cn=()=>{c.moveTo(150,-100); c.lineTo(162,-70); c.lineTo(138,-70); c.closePath();};
      c.fillStyle='#3d2e14'; c.beginPath(); cn(); c.fill(); hat(cn,R.murekkep,.8,1.2,710,2,1); leke(150,-84,16,14,DURUM.isikRenk,.18);
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
    if(r()<.3){const hx=x+(r()<.5?-1:1)*w*.8, hy=yy-h*.5; c.fillStyle=KARA; c.beginPath(); c.ellipse(hx,hy,12*s,18*s,r()-.5,0,TAU); c.fill(); hat(()=>{c.ellipse(hx,hy,12*s,18*s,0,0,TAU);},R.murekkep,.6,1.2,(hx|0),1,1);}
  }
}

// silüetin altındaki gölge
export function siluetGolge(x,y,w){leke(x,y+2,w,w*.16,R.siyah,.75);}
