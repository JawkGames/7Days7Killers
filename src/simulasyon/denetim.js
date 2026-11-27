// Vaka tutarlılık denetimi: bir vakanın kendi içinde çelişmediğini sınar.
// Testler 200 tohumda bunu çalıştırır; çözücü ve araçlar da kullanabilir.
// Döner: hata cümleleri listesi (boşsa vaka tutarlı).

const ESYA_NEDENLERI=['katil-birakti','yardimci-birakti','tanik-kacarken'];

export function vakaDenetle(v){
  const h=[], e=m=>h.push(m);
  const ids=Object.keys(v.kisiler).sort(), D=v.ayar.dilimler.length, T=v.ayar.gunSayisi*D;
  const cz=v.cizelge, mekanVar=m=>Object.prototype.hasOwnProperty.call(v.harita,m);
  const olay=Object.fromEntries(v.olaylar.map(o=>[o.id,o])), cin=Object.fromEntries(v.cinayetler.map(c=>[c.id,c]));
  const orada=(m,t)=>ids.filter(k=>cz[k][t]===m);
  const komsu=(a,b)=>(v.harita[a]||[]).includes(b);

  // Roller
  const katiller=v.cinayetler.map(c=>c.katil), kurbanlar=v.cinayetler.map(c=>c.kurban);
  if(v.cinayetler.length!==v.ayar.katilSayisi) e(`cinayet sayısı ${v.cinayetler.length}, beklenen ${v.ayar.katilSayisi}`);
  if(new Set(katiller).size!==katiller.length) e('bir katil iki cinayet işlemiş');
  if(new Set(kurbanlar).size!==kurbanlar.length) e('bir kurban iki kez ölmüş');
  for(const k of kurbanlar) if(katiller.includes(k)) e(`${k} hem katil hem kurban`);
  for(const c of v.cinayetler){
    if(c.yardimci&&!katiller.includes(c.yardimci)) e(`${c.id}: yardımcı ${c.yardimci} katil değil`);
    if(c.yardimci===c.katil) e(`${c.id}: katil kendine yardımcı`);
    if(!c.sebep||!c.sebep.tur||!c.sebep.kaynak) e(`${c.id}: sebep eksik`);
    if(c.fotografGunu<1||c.fotografGunu>v.ayar.gunSayisi) e(`${c.id}: fotoğraf günü oyunun dışında (${c.fotografGunu})`);
  }

  // Çizelge: tek yer, ölü yürümez, mekânlar var
  for(const k of ids){
    const l=cz[k];
    if(!Array.isArray(l)||l.length!==T) {e(`${k}: çizelge uzunluğu ${l&&l.length}`); continue;}
    const olum=v.kisiler[k].olum;
    for(let t=0;t<T;t++){
      if(l[t]===null){if(olum==null||t<=olum) e(`${k}: ${t} diliminde yok ama ölmemiş`);}
      else{
        if(!mekanVar(l[t])) e(`${k}: bilinmeyen mekân ${l[t]}`);
        if(olum!=null&&t>olum) e(`${k}: ölümünden sonra ${t} diliminde ${l[t]}'de yürüyor`);
      }
    }
  }
  for(const c of v.cinayetler){
    if(v.kisiler[c.kurban].olum!==c.zaman) e(`${c.id}: kurbanın ölüm zamanı tutmuyor`);
    for(const k of [c.katil,c.kurban,...(c.yardimci?[c.yardimci]:[])]) if(cz[k][c.zaman]!==c.mekan) e(`${c.id}: ${k} cinayet anında olay yerinde değil`);
    const digerleri=orada(c.mekan,c.zaman).filter(k=>![c.katil,c.kurban,c.yardimci].includes(k)).sort();
    if(JSON.stringify(digerleri)!==JSON.stringify(c.gozTaniklari)) e(`${c.id}: göz tanıkları ${c.gozTaniklari} ama olay yerinde ${digerleri}`);
    const b=c.bulunma;
    if(cz[b.bulan][b.zaman]!==c.mekan) e(`${c.id}: bulan ${b.bulan} o anda olay yerinde değil`);
    if(b.zaman<=c.zaman) e(`${c.id}: ceset ölümden önce bulunmuş`);
  }

  // Olaylar: içindeki herkes o anda oradadır
  for(const o of v.olaylar){
    if(o.cinayet&&!cin[o.cinayet]) e(`${o.id}: bilinmeyen cinayet ${o.cinayet}`);
    for(const k of o.kisiler) if(cz[k][o.zaman]!==o.mekan) e(`${o.id} (${o.tur}): ${k} ${o.zaman} anında ${o.mekan}'de değil`);
  }

  // İzler: her iz gerçek bir olaya bağlı ve sahibi/tanığı o anda orada
  const yanIz=new Set(v.yanilticilar.flatMap(y=>y.izler));
  let kanitli=new Set();
  for(const i of v.izler){
    const c=cin[i.cinayet], o=olay[i.olay];
    if(!c){e(`${i.id}: bilinmeyen cinayet`); continue;}
    if(!o){e(`${i.id}: bağlı olduğu olay yok (${i.olay})`); continue;}
    if(i.yaniltici&&!yanIz.has(i.id)) e(`${i.id}: yanıltıcı ama açıklaması yok`);
    if(i.tur==='fiziksel'){
      if(i.mekan!==c.mekan) e(`${i.id}: fiziksel iz olay yerinde değil`);
      const n=i.gercek.neden;
      if(ESYA_NEDENLERI.includes(n)&&cz[i.sahip][i.zaman]!==i.mekan) e(`${i.id}: ${i.sahip} izi bıraktığı anda orada değil`);
      if(n==='onceden-gecti'&&(o.tur!=='gecis'||cz[i.sahip][o.zaman]!==i.mekan||o.zaman>=c.zaman)) e(`${i.id}: önceki geçiş tutarsız`);
      if(n==='calinti-silah'&&(o.tur!=='hirsizlik'||o.sahip!==i.sahip||o.esya!==i.esya||o.zaman>=c.zaman)) e(`${i.id}: çalıntı silahın hırsızlığı tutarsız`);
      if(n==='katil-silahi'&&i.sahip!==c.katil) e(`${i.id}: katilin silahı katilin değil`);
      if(n==='kurbanin'&&i.sahip!==c.kurban) e(`${i.id}: kurbanın eşyası kurbanın değil`);
      if(n==='zehir-kaynagi'&&(o.tur!=='ot-alma'||o.sahip!==i.sahip)) e(`${i.id}: zehir kaynağı tutarsız`);
      if(n==='yontem'&&i.kisi!==c.kurban) e(`${i.id}: yara kurbanda değil`);
      if(i.mekanAleti){
        if(i.sahip!=null) e(`${i.id}: yerin aletinin sahibi olmaz`);
        if(!mekanVar(i.mekanAleti)) e(`${i.id}: aletin mekânı yok (${i.mekanAleti})`);
        for(const k of i.adaylar||[]) if(v.kisiler[k].ev!==i.mekanAleti&&v.kisiler[k].is!==i.mekanAleti) e(`${i.id}: ${k} aletin mekânından değil`);
      }else{
        if(i.esya&&!v.kisiler[i.sahip].esyalar.includes(i.esya)) e(`${i.id}: ${i.esya} ${i.sahip}'in eşyası değil`);
        if(i.ortu&&v.kisiler[i.sahip].ortu!==i.ortu) e(`${i.id}: örtü ${i.sahip}'in değil`);
        if(i.adaylar&&!i.adaylar.includes(i.sahip)) e(`${i.id}: sahibi adaylarda yok`);
      }
      if(!i.yaniltici&&i.sahip===c.katil&&(n==='katil-birakti'||n==='katil-silahi')) kanitli.add(c.id);
      if(!i.yaniltici&&i.alt==='yara'&&i.sahip===c.katil) kanitli.add(c.id);
      if(!i.yaniltici&&n==='mekan-aleti'&&(i.adaylar||[]).includes(c.katil)) kanitli.add(c.id);
      if(!i.yaniltici&&i.alt==='yara'&&i.mekanAleti&&(i.adaylar||[]).includes(c.katil)) kanitli.add(c.id);
    }else if(i.tur==='tanik'){
      const ty=cz[i.tanik][i.zaman];
      if(ty!==i.nereden) e(`${i.id}: tanık ${i.tanik} o anda ${i.nereden}'de değil`);
      if(i.alt==='olay-tanigi'&&ty!==i.mekan) e(`${i.id}: göz tanığı olay yerinde değil`);
      if(i.alt!=='olay-tanigi'&&!komsu(i.mekan,ty)) e(`${i.id}: tanık komşu mekânda değil`);
      if(i.gorulen&&cz[i.gorulen][i.zaman]!==i.mekan) e(`${i.id}: görülen ${i.gorulen} orada değil`);
      if(i.zaman!==c.zaman) e(`${i.id}: tanıklık cinayet anında değil`);
      if(i.gorulen===c.katil) kanitli.add(c.id);
    }else if(i.tur==='dolayli'){
      if(cz[i.fark_eden][i.zaman]==null) e(`${i.id}: fark eden ölü`);
      if(i.alt==='gece-yoklugu'){
        if(cz[i.fark_eden][i.zaman]!==v.kisiler[i.kisi].ev) e(`${i.id}: fark eden evde değil`);
        if(cz[i.kisi][i.zaman]===v.kisiler[i.kisi].ev) e(`${i.id}: yok denen kişi evinde`);
      }else if(i.alt==='eksik-alet'){
        if(cz[i.fark_eden][i.zaman]!==i.mekan||o.tur!=='hirsizlik'||i.zaman<=o.zaman) e(`${i.id}: eksik alet tutarsız`);
      }else if(cz[i.fark_eden][i.zaman]!==cz[i.kisi][i.zaman]||cz[i.kisi][i.zaman]!==i.mekan) e(`${i.id}: fark eden ${i.kisi} ile aynı yerde değil`);
      if(i.zaman<c.zaman&&i.alt!=='eksik-alet') e(`${i.id}: cinayetten önce fark edilmiş`);
      if(!i.yaniltici&&i.kisi===c.katil) kanitli.add(c.id);
    }else e(`${i.id}: bilinmeyen iz türü ${i.tur}`);
  }
  for(const c of v.cinayetler){
    if(!kanitli.has(c.id)) e(`${c.id}: katile giden hiçbir iz yok`);
    for(const id of c.izler) if(!v.izler.some(i=>i.id===id&&i.cinayet===c.id)) e(`${c.id}: iz listesinde yabancı ${id}`);
  }
  for(const y of v.yanilticilar){
    const c=cin[y.cinayet];
    if(!c){e(`${y.id}: bilinmeyen cinayet`); continue;}
    if(!olay[y.olay]) e(`${y.id}: masum açıklamanın olayı yok`);
    if(!y.izler.length) e(`${y.id}: izsiz yanıltıcı`);
    for(const id of y.izler) if(!v.izler.some(i=>i.id===id&&i.yaniltici)) e(`${y.id}: ${id} yanıltıcı iz değil`);
    if(y.isaret.some(k=>k===c.katil||k===c.yardimci)) e(`${y.id}: yanıltıcı asıl faili gösteriyor`);
    if(!y.curutme.length) e(`${y.id}: çürütme yolu yok`);
  }

  // Kaybolan eşya geri gelmez: olay yerinde kalan nesne, çalınan alet sonra başka yerde iz bırakmaz.
  const kayip=new Map();
  const kayipYaz=(a,t)=>{if(!kayip.has(a)||kayip.get(a)>t) kayip.set(a,t);};
  const sahibi=i=>(i.sahip??i.mekanAleti)+'|'+i.esya;
  for(const i of v.izler) if(i.tur==='fiziksel'&&i.esya&&i.iztur==='nesne'&&i.alt!=='kurban-esyasi') kayipYaz(sahibi(i),i.zaman);
  for(const o of v.olaylar) if(o.tur==='hirsizlik') kayipYaz(o.sahip+'|'+o.esya,o.zaman);
  for(const i of v.izler) if(i.tur==='fiziksel'&&i.esya){
    const a=sahibi(i), t=kayip.get(a);
    const ayni=i.alt==='silah'||i.gercek.neden==='calinti-silah'||i.alt==='yara';
    if(t!=null&&i.zaman>t&&!ayni) e(`${i.id}: ${a} ${t} anında kaybolmuştu, ${i.zaman} anında yine iz bırakıyor`);
  }
  for(const c of v.cinayetler) if(c.silah&&!c.silah.calinti){
    const t=kayip.get((c.silah.sahip??c.silah.mekanAleti)+'|'+c.silah.esya);
    if(t!=null&&c.zaman>t) e(`${c.id}: silah ${c.silah.esya} daha önce kaybolmuştu`);
  }

  // Bağlar
  for(const b of v.baglar){
    if(b.tur==='ortaklik'&&!v.cinayetler.some(c=>c.katil===b.katil&&c.yardimci===b.yardimci)) e('ortaklık bağı cinayette yok');
    if(b.tur==='ortme'&&!v.cinayetler.some(c=>c.katil===b.ortulen&&c.ortan===b.ortan)) e('örtme bağı cinayette yok');
    if(b.tur==='santaj'&&!v.cinayetler.some(c=>c.katil===b.zorlanan&&c.zorlayan===b.zorlayan)) e('şantaj bağı cinayette yok');
    for(const k of [b.katil,b.yardimci,b.ortan,b.ortulen,b.zorlayan,b.zorlanan].filter(Boolean)) if(!katiller.includes(k)) e(`bağdaki ${k} katil değil`);
  }
  return h;
}
