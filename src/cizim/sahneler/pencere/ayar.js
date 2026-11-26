// Pencere sahnesinin bütün ayarları. Sayılar tasarım birimidir (sahne yüksekliği 1200).
import {hex} from '../../../cekirdek/matematik.js';

export const OLCU={yukseklik:1200, enAzGenislik:700, pay:0, kaynamaHizi:7};

/* Oda tek kaçış noktalı perspektifle kurulur. İki el ayarı yerleşim var: telefon dikey (yarım genişlik 350)
   ve PC yatay (yarım genişlik 1066). Aradaki ekranlar ikisinin arasından okunur.
   Dünya koordinatı: ekran x = kn.x + X*s, ekran y = kn.y + Y*s; s yakınlık (1 = kameraya yakın, küçüldükçe uzak). */
export const YERLESIM={
  dar:  {G:350,  kn:[150,520], arka:[30,330,760],  sArka:.3, pencere:{sUzak:.45, sYakin:1.21, ust:-511, alt:200},
         masa:{x0:-110, arka:784, on:880}, muf:{xBas:250, xSon:118, omuzSon:476}, kapi:[196,300,450]},
  genis:{G:1066, kn:[160,540], arka:[-330,300,800], sArka:.3, pencere:{sUzak:.36, sYakin:.70, ust:-580, alt:280},
         masa:{x0:-560, arka:792, on:900}, muf:{xBas:470, xSon:-300, omuzSon:470}, kapi:[392,560,440]}
};

/* Müfettiş: yerel birim omuz ortasından; s=1 iken bu ölçülerdedir. Bacak yok: palto ayak bileğine iner,
   alt gövdeyi önce masa, sonra kadraj alt kenarı gizler. */
export const MUFETTIS={omuzAyak:1000, etek:940, omuzEn:162, sapkaUst:-178, yuruAdim:7, salinim:.022, ziplama:9};

/* Zaman çizelgesi (saniye). Taşlar `tas.bas` sonrasında atılır; sahne son taştan `bitisBekle` sonra biter. */
export const ZAMAN={
  acilis:[0,1.6],        // karanlıktan açılış
  belir:[.9,2.0],        // kapı ağzında belirme
  yuru:[1.2,6.6],        // kapıdan pencereye
  egil:[6.7,7.7],        // başını aşağı eğer
  tas:{bas:7.5, aralik:[.75,1.5], ucus:.62},
  bitisEnAz:10.5, bitisBekle:2.6,
  azHareketBekle:3       // az hareket tercihinde son durum bu kadar gösterilip haber verilir
};

/* Kalabalık. Dış resim kendi birimindedir (600 x 700), pencere boşluğuna yerleştirilir.
   Derinlik z: 1 en ön sıra (pencere alt kenarı keser), zUzak meydanın arka ucu. */
export const KALABALIK={
  resim:[600,700], ufuk:212, onY:742, zUzak:3.4, boy:150, yayilim:760,
  sira:[11,13], siraKisi:[7,10],    // tohumla seçilir: kişi sayısı her oyunda başka
  bosluk:.12,                       // iki grup arasındaki boş şerit (u biriminde)
  oranOynama:.05                    // grup oranına eklenen tohumlu sapma: kişi sayısından doğru sayısı okunmasın
};
/* Öfkeli grubun elindekiler ve olasılıkları; coşkulu grubun kol duruşları. */
export const OFKE_ESYA=[['mesale',.30],['tirpan',.16],['dirgen',.16],['orak',.10],['sopa',.10],['yumruk',.18]];
export const COSKU_DURUS=[['ikiKol',.42],['fenerYukari',.22],['fenerAlt',.18],['tekKol',.18]];

/* Giysi ve baş örtüsü türleri: hepsi uzun, alt gövdeyi örter. */
export const GIYSI=['aba','entari','kepenek','salta'];
export const BASLIK=['kasket','pusu','yemeni','kulah','basAcik'];

export const RENK={
  giysi:[hex('#17140f'),hex('#1d1813'),hex('#14171a'),hex('#1b1419'),hex('#191a12'),hex('#211a12')],
  ofkeAlev:hex('#f0b45a'), ofkeIsik:hex('#b4502a'), ofkeDuman:hex('#1a0d08'),
  coskuAlev:hex('#f4d28a'), coskuIsik:hex('#d29a50'),
  odaOfke:hex('#b8582e'), odaCosku:hex('#d8aa62'), kirliSari:hex('#a88a46'),
  ahsap:hex('#2a2016'), ahsapIsik:hex('#6e5434'), sivaIsik:hex('#4a4430'),
  kufYesil:hex('#243029'), morluk:hex('#4a3a52'), cam:hex('#9aa294'), camKir:hex('#3a3a26')
};
