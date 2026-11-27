// Her karede değişen durum: bakış, göz açıklığı, ağız, nefes, ışık, kamera. İfade ve ışık buradan sürülür.
// Bütün karakterlerde aynıdır; karakterin kendisi (yüz ölçüleri, saç, giysi) gorunus.js içindeki etkin görünüştür.
//
// İfade ve beden dili alanları (ifade.js bunları sürer; README "İfade ve beden dili"). Hepsinin varsayılanı 0'dır
// ve 0 iken çizim birebir eskisi gibidir (sorgu odasının kareleri değişmez):
//   kasEgim: kaşın ek eğimi (artı: dış uç aşağı, hüzün; eksi: dış uç yukarı, öfke).
//   kasSol, kasSag: tek kaşın ek yüksekliği (birim; eksi = yukarı). gozAc: -1 kısık .. 1 iri açık. kirp: ek kapanma 0..1.
//   gozSegir: ekranda sol alt kapağın seğirmesi 0..1. bakisX, bakisY: bakışa eklenen yön (-1..1; bakisY artı = yere).
//   agizKose: -1 düşük .. 1 kalkık köşe; agizYan: tek yanlı köşe (artı = ekranda sağ köşe yukarı). dudakSik: dudak sıkma 0..1.
//   agizGer: ağzın yana gerilmesi (artı, korku) / büzülmesi (eksi), -1..1.
//   agizAralik: dudakların hafifçe aralanması 0..1 (şaşkınlık); konuşmanın açıklığıyla büyük olan alınır.
//   burunAc: burun deliği açılması 0..1. kizar: yanakta kan 0..1. yutkun: gırtlak hareketi 0..1 (eğri: 0→1→0).
//   basEgim: başın yana yatması (radyan, artı = saat yönü). basEg: baş öne-arkaya (artı = çene aşağı, eksi = baş geri, çene yukarı).
//   basDon: başın sağa-sola dönmesi (-1..1, hgx gibi). egil: öne eğilme (artı, bize doğru) / geri çekilme (eksi), -1..1.
//   omuzKalk: omuz kalkması (artı) / düşmesi (eksi), -1..1. nefesEk: sahnenin nefesine eklenen göğüs hareketi (-1..1).
export const poz={gx:0,gy:0,hgx:0,hgy:0,goz:.74,kasKaldir:0,kasCat:.25,agiz:-.2,agizAc:0,agizGen:1,nefes:0,sallanti:0,isik:1,kaynama:0,kam:0,
  kasEgim:0,kasSol:0,kasSag:0,gozAc:0,kirp:0,gozSegir:0,bakisX:0,bakisY:0,agizKose:0,agizYan:0,dudakSik:0,agizGer:0,agizAralik:0,burunAc:0,kizar:0,yutkun:0,
  basEgim:0,basEg:0,basDon:0,egil:0,omuzKalk:0,nefesEk:0};
// İfade alanlarının nötr değerleri (ifade.js sıfırlarken kullanır).
export const POZ_NOTR={kasKaldir:0,kasCat:.25,kasEgim:0,kasSol:0,kasSag:0,gozAc:0,kirp:0,gozSegir:0,bakisX:0,bakisY:0,agizKose:0,agizYan:0,dudakSik:0,agizGer:0,agizAralik:0,
  burunAc:0,kizar:0,yutkun:0,basEgim:0,basEg:0,basDon:0,egil:0,omuzKalk:0,nefesEk:0};
// Eski erişim için: etkin görünüşün göz aralığı (karakterSec günceller). Yeni kod G.yuz.gozAralik okur.
export const YUZ={gozAralik:66};
