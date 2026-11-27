// OpenAI uyumlu sahte yapay zekâ sunucusu (testler ve uçtan uca deneme için; gerçek model yok).
//   node testler/yardim/sahte-yz-sunucu.js [port=5241] [--gecikme ms]
//   import {sahteSunucuBaslat} from './yardim/sahte-yz-sunucu.js'; const s=await sahteSunucuBaslat({port:0}); s.adres; await s.kapat();
//
// /v1/models: tek model. /v1/chat/completions:
//   - eşleme (şema adı "esleme"): oyuncunun sorusuyla en çok ortak kelimesi olan hazır soru; hiç yoksa "yok".
//     "katil", "öldür" geçen soru, "öldürdü" geçen hazır soruya gider.
//   - söyletme: "Valla müfettiş bey. " + anlam (kalıp cümle).
//   - kaçamak (anlam yok): sabit, bilgi vermeyen bir cümle.
// Tarayıcıdan çağrılabilsin diye CORS başlıkları döner.
import http from 'node:http';
import {pathToFileURL} from 'node:url';

const kucuk=s=>s.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9\s]/g,' ');
const BOS=new Set(['misin','mısın','musun','müsün','bir','var','bil','söyl','bakal','beyim','sen','ben','şey']);
const kelimeler=s=>new Set(kucuk(s).split(/\s+/).filter(k=>k.length>=3).map(k=>k.slice(0,5)).filter(k=>!BOS.has(k)));

export function sahteCevap(govde){
  const mesaj=(govde.messages||[]).map(m=>m.content).join('\n');
  const ad=govde.response_format?.json_schema?.name;
  if(ad==='esleme'){
    const soru=(mesaj.match(/Müfettişin yazdığı soru: "([\s\S]*?)"\s*$/)||[])[1]||'';
    const liste=[...mesaj.matchAll(/^(s\d+): (.*)$/gm)].map(m=>({kod:m[1],etiket:m[2]}));
    const k=kelimeler(soru);
    let en={kod:'yok',puan:0};
    if(/katil|öldür/i.test(soru)){ const f=liste.find(x=>/öldürdü/.test(x.etiket)); if(f) en={kod:f.kod,puan:9}; }
    for(const x of liste){ const p=[...kelimeler(x.etiket)].filter(w=>k.has(w)).length; if(p>en.puan) en={kod:x.kod,puan:p}; }
    return {soru:en.kod};
  }
  const anlam=(mesaj.match(/Söyleyeceğin ANLAM: "([\s\S]*?)"\n/)||[])[1];
  if(anlam) return {cevap:'Valla müfettiş bey. '+anlam};
  return {cevap:'Ne diyorsun beyim, benim aklım böyle şeylere ermez.'};
}

export function sahteSunucuBaslat({port=5241,gecikme=0}={}){
  const istekler=[];
  const sunucu=http.createServer((q,y)=>{
    y.setHeader('access-control-allow-origin','*');
    y.setHeader('access-control-allow-headers','content-type');
    y.setHeader('access-control-allow-methods','GET,POST,OPTIONS');
    if(q.method==='OPTIONS'){ y.writeHead(204); return y.end(); }
    if(q.method==='GET'&&q.url.startsWith('/v1/models')){ y.writeHead(200,{'content-type':'application/json'}); return y.end(JSON.stringify({data:[{id:'sahte-model'}]})); }
    if(q.method==='POST'&&q.url.startsWith('/v1/chat/completions')){
      let g=''; q.on('data',p=>g+=p); q.on('end',()=>{
        let govde; try{ govde=JSON.parse(g); }catch{ y.writeHead(400); return y.end(); }
        istekler.push(govde);
        const icerik=JSON.stringify(sahteCevap(govde));
        setTimeout(()=>{ y.writeHead(200,{'content-type':'application/json'}); y.end(JSON.stringify({choices:[{message:{role:'assistant',content:icerik}}]})); },gecikme);
      });
      return;
    }
    y.writeHead(404); y.end();
  });
  return new Promise(res=>sunucu.listen(port,'127.0.0.1',()=>{
    const p=sunucu.address().port;
    res({adres:`http://127.0.0.1:${p}`,port:p,istekler,kapat:()=>new Promise(r=>{sunucu.closeAllConnections?.(); sunucu.close(()=>r());})});
  }));
}

if(import.meta.url===pathToFileURL(process.argv[1]||'').href){
  const a=process.argv.slice(2), i=a.indexOf('--gecikme');
  const s=await sahteSunucuBaslat({port:Number(a.find(x=>/^\d+$/.test(x)&&a.indexOf(x)!==i+1)??5241),gecikme:i>=0?Number(a[i+1]):0});
  console.log('sahte yapay zekâ sunucusu: '+s.adres);
}
