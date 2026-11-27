// Yapay zekâ arka uçları. Hepsinin biçimi aynı:
//   arkaUc.soyle(mesajlar, {sinyal, sema, semaAdi, sicaklik, enCokToken}) → Promise<string>  (modelin ham cevabı)
//   mesajlar: [{role:'system'|'user', content}], sema: beklenen JSON şeması (yapılandırılmış çıktı)
//
// - yerelSunucu: OpenAI uyumlu yerel sunucu (LM Studio: http://localhost:1234, Ollama: http://localhost:11434).
//   Geliştirme ve deneme içindir; oyuncunun bilgisayarında çalışmaz.
// - sahte: testler için; verilen işlevle cevap üretir.
// - Steam sürümünde oyunla birlikte gelen model node-llama-cpp ile çalışacak; o arka uç masaüstü paketiyle eklenecek.
//   Aynı biçimi uygulaması yeter (şemayı llama.cpp dilbilgisine çevirir, sinyal ile durdurulur); src/yz/index.js değişmez.

import {CEVAP_SEMASI} from './istem.js';

/**
 * @param {{adres?:string, model?:string, sicaklik?:number, enCokToken?:number, dusunmeKapat?:boolean, fetch?:Function}} s
 *   model boşsa sunucunun /v1/models listesindeki ilk model kullanılır (LM Studio'da yüklü olan).
 */
export function yerelSunucu({adres='http://localhost:1234',model='',sicaklik=.7,enCokToken=220,dusunmeKapat=true,fetch:f=globalThis.fetch}={}){
  const kok=adres.trim().replace(/\/+$/,'').replace(/\/v1$/,'');
  let modelAdi=model.trim()||null, modelSoz=null;
  // İstek biçimi: 0 şema + düşünme kapalı, 1 yalnız şema, 2 düz. Sunucu bir biçimi reddederse (400/422) bir sonrakine
  // geçilir ve öyle kalır.
  let duzey=dusunmeKapat?0:1;
  const fx=(...a)=>f(...a);

  async function modelBul(sinyal){
    if(modelAdi) return modelAdi;
    modelSoz??=(async()=>{
      const y=await fx(kok+'/v1/models',{signal:sinyal});
      if(!y.ok) throw new Error(`model listesi ${y.status}`);
      const j=await y.json();
      const id=j?.data?.[0]?.id??j?.models?.[0]?.name;
      if(!id) throw new Error('sunucuda yüklü model yok');
      return (modelAdi=id);
    })();
    try{ return await modelSoz; }catch(e){ modelSoz=null; throw e; }
  }

  return {
    ad:'yerel-sunucu',
    adres:kok,
    modelBul,
    async soyle(mesajlar,{sinyal,sema=CEVAP_SEMASI,semaAdi='cevap',sicaklik:s=sicaklik,enCokToken:n=enCokToken}={}){
      const m=await modelBul(sinyal);
      const govde=d=>({model:m,messages:mesajlar,temperature:s,max_tokens:n,stream:false,
        ...(d<2?{response_format:{type:'json_schema',json_schema:{name:semaAdi,strict:true,schema:sema}}}:{}),
        ...(d<1?{chat_template_kwargs:{enable_thinking:false}}:{})});
      const gonder=d=>fx(kok+'/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(govde(d)),signal:sinyal});
      let y=await gonder(duzey);
      while((y.status===400||y.status===422)&&duzey<2){ duzey++; y=await gonder(duzey); }
      if(!y.ok) throw new Error(`yerel sunucu ${y.status}`);
      const j=await y.json();
      const msg=j?.choices?.[0]?.message;
      return msg?.content??'';
    }
  };
}

/**
 * Testler için arka uç: uret(mesajlar, secenekler) cevap metnini (ya da Promise'ini) döndürür.
 * gecikme verilirse cevap o kadar ms sonra gelir; sinyal kesilirse reddedilir.
 */
export function sahte(uret,{gecikme=0}={}){
  return {
    ad:'sahte',
    cagrilar:[],
    async soyle(mesajlar,secenek={}){
      this.cagrilar.push({mesajlar,secenek});
      if(gecikme>0) await new Promise((res,rej)=>{
        const z=setTimeout(res,gecikme);
        secenek.sinyal?.addEventListener?.('abort',()=>{clearTimeout(z); rej(new Error('iptal'));});
      });
      return uret(mesajlar,secenek);
    }
  };
}

// Modelin ham cevabından istenen alanı çıkarır: düşünme bloğunu (<think>…</think>, kapanmamışsa sonuna kadar) atar,
// JSON'u ayıklar; JSON değilse düz metni alır.
export function cevapAyikla(ham,alan='cevap'){
  if(typeof ham!=='string') return null;
  let s=ham.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/i,'').trim();
  s=s.replace(/^```(?:json)?\s*|\s*```$/g,'').trim();
  const bas=s.indexOf('{'), son=s.lastIndexOf('}');
  if(bas>=0&&son>bas){
    try{ const j=JSON.parse(s.slice(bas,son+1)); if(typeof j[alan]==='string') return j[alan].trim()||null; return null; }catch{ /* düz metne düş */ }
  }
  s=s.replace(/^["«“]|["»”]$/g,'').trim();
  return s||null;
}
