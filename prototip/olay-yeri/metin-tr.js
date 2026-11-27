// Olay yeri deneme sayfasının Türkçe metinleri.
// `iz` nesnesi src/dil/tr/terimler.js'e olduğu gibi taşınmaya hazırdır: orada "iz" anahtarı olarak durur
// (terimler.iz.ad[tur], terimler.iz.renk[...]). Adı alt türe göre değişen izlerde ad[tur] bir nesnedir; alt tür
// iz parametresinin `tip`, `cesit` ya da `sekil` alanıdır. Dizgedeki {renk} ve {saat} yer tutuculardır.
export const iz={
  "ad": {
    "ip": "Yerde {renk} yün ipi",
    "ayak-izi": {
      "carik": "Çarık izi",
      "postal": "Kabaralı postal izi",
      "cizme": "Kabaralı çizme izi",
      "yalin": "Yalın ayak izi",
      "nal": "Katır nalı izi",
      "ters-nal": "Ters çakılmış nal izi"
    },
    "alet": {"cekic": "Yerde bir çekiç", "orak": "Yerde bir orak", "kama": "Boynuz saplı kama", "makas": "Terzi makası"},
    "civi": {
      "cekic": "Boş çivi; duvarda asılı bir çekicin izi",
      "orak": "Boş çivi; duvarda bir orağın izi",
      "masa": "Boş çivi; duvarda bir maşanın izi",
      "cerceve": "Boş çivi; duvarda bir çerçevenin izi",
      "tufek": "Boş çivi; duvarda bir tüfeğin izi",
      "yok": "Duvarda boş bir çivi"
    },
    "saat": "Durmuş saat: {saat}",
    "devrik": {"gugum": "Devrilmiş bakır güğüm", "lamba": "Devrilmiş gaz lambası"},
    "esya": {"dugme": "Kopmuş bir düğme", "tespih": "Yere düşmüş tespih", "cakmak": "Fitilli çakmak", "tabaka": "Tütün tabakası"},
    "kan": "Koyu bir leke",
    "un": "Dökülmüş un izi"
  },
  // eski `cesit` değerlerinin karşılığı (ayak-izi: cizme→cizme, carik→carik, ayak→yalin)
  "eskiTip": {"ayak-izi": {"ayak": "yalin"}},
  "renk": {"kirmizi": "kırmızı", "lacivert": "lacivert", "yesil": "yeşil", "sari": "sarı", "kahve": "kahverengi", "beyaz": "beyaz", "mor": "mor"},
  "bilinmeyen": "Bir iz"
};

// İzin okunur adı. sozluk: yukarıdaki `iz` biçiminde nesne (oyunda terimler.iz)
export function izAdi(p,sozluk=iz){
  const m=sozluk.ad[p.tur]; if(!m) return sozluk.bilinmeyen;
  if(typeof m==='string') return m.replace('{renk}',sozluk.renk[p.renk]||'').replace('{saat}',p.saat||'');
  let alt=p.tip||p.cesit||p.sekil;
  alt=(sozluk.eskiTip[p.tur]&&sozluk.eskiTip[p.tur][alt])||alt;
  return m[alt]||sozluk.bilinmeyen;
}

export default {
  baslik:'Olay yeri fotoğrafı',
  mekan:'Mekân',
  tohum:'Tohum',
  baskaTohum:'Başka tohum',
  izKaristir:'İzleri karıştır',
  kurban:'Örtülü kurban',
  ipucu:'Fotoğraftaki izlere dokun. Çift dokunma ya da tekerlek: yakınlaştır.',
  bos:'…',
  iz
};
