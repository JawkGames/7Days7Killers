// Yapay zekâ arka uçları. Hepsinin biçimi aynı: soyle(mesajlar) → Promise<string> (modelin ham cevabı).
//
// - yerelSunucu: OpenAI uyumlu yerel sunucu (LM Studio: http://localhost:1234, Ollama: http://localhost:11434).
//   Geliştirme ve deneme içindir; oyuncunun bilgisayarında çalışmaz.
// - sahte: testler için; verilen işlevle cevap üretir.
// - Steam sürümünde oyunla birlikte gelen model node-llama-cpp ile çalışacak; o arka uç masaüstü paketiyle eklenecek.

import {CEVAP_SEMASI} from './istem.js';

/**
 * @param {{adres?:string, model?:string, sicaklik?:number, enCokToken?:number, fetch?:Function}} s
 */
export function yerelSunucu({adres='http://localhost:1234',model='',sicaklik=.7,enCokToken=200,fetch:f=globalThis.fetch}={}){
  const url=adres.replace(/\/+$/,'')+'/v1/chat/completions';
  return {
    ad:'yerel-sunucu',
    async soyle(mesajlar,{sinyal}={}){
      const govde={model,messages:mesajlar,temperature:sicaklik,max_tokens:enCokToken,stream:false,
        response_format:{type:'json_schema',json_schema:{name:'cevap',strict:true,schema:CEVAP_SEMASI}}};
      const y=await f(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(govde),signal:sinyal});
      if(!y.ok) throw new Error(`yerel sunucu ${y.status}`);
      const j=await y.json();
      const m=j?.choices?.[0]?.message;
      return m?.content??'';
    }
  };
}

export function sahte(uret){
  return {ad:'sahte',async soyle(mesajlar){ return uret(mesajlar); }};
}

// Modelin ham cevabından cümleyi çıkarır: düşünme bloğunu atar, JSON'u ayıklar; JSON değilse düz metni alır.
export function cevapAyikla(ham){
  if(typeof ham!=='string') return null;
  let s=ham.replace(/<think>[\s\S]*?<\/think>/gi,'').trim();
  const bas=s.indexOf('{'), son=s.lastIndexOf('}');
  if(bas>=0&&son>bas){
    try{ const j=JSON.parse(s.slice(bas,son+1)); if(typeof j.cevap==='string') return j.cevap.trim(); }catch{ /* düz metne düş */ }
  }
  s=s.replace(/^["«“]|["»”]$/g,'').trim();
  return s||null;
}
