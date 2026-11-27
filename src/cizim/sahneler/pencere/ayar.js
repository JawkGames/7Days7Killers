// Pencere sahnesinin bütün ayarları. Sayılar tasarım birimidir (sahne yüksekliği 1200).
import {hex} from '../../../cekirdek/matematik.js';

export const OLCU={yukseklik:1200, enAzGenislik:700, pay:0, kaynamaHizi:7};

/* Oda tek kaçış noktalı perspektifle kurulur; kaçış noktası (kn) sağda, PC'de ekranın dışında: sol duvar ve içindeki
   büyük pencere neredeyse cepheden görünür, arka duvar sağ kenarda dar bir şerittir. İki el ayarı yerleşim var:
   telefon dikey (yarım genişlik 350) ve PC yatay (1066); aradaki ekranlar ikisinin arasından okunur.
   Dünya koordinatı: ekran x = kn.x + X*s, ekran y = kn.y + Y*s; s yakınlık (büyüdükçe kameraya yakın).
   Xd: sol duvar; Ytavan: tavan; taban müfettişin ayak hizasından çıkar. pencere.ust/alt dünya Y'sidir.
   kapi: arka duvardaki kapı, dünya X'i (iki kenar) ve üst Y. muf: ekran x'i ve s (başta, sonda), sondaki omuz y'si.
   masa: ön plandaki masanın sol ucu, arka ve ön kenar y'si (ekran). */
export const YERLESIM={
  dar:  {G:350,  kn:[600,330],  Xd:-940,  Ytavan:-780, sArka:.3, pencere:{sUzak:.574, sYakin:1.0, ust:-390, alt:490},
         masa:{x0:-10, arka:968, on:1078}, muf:{xBas:430, sBas:.42, xSon:196, sSon:.8, omuzSon:452}, kapi:[-780,-560,-300]},
  genis:{G:1066, kn:[1600,470], Xd:-2400, Ytavan:-600, sArka:.3, pencere:{sUzak:.617, sYakin:1.096, ust:-365, alt:484},
         masa:{x0:430, arka:902, on:990}, muf:{xBas:967, sBas:.3, xSon:338, sSon:.95, omuzSon:520}, kapi:[-2317,-1900,-250]}
};

/* Müfettiş: yerel birim omuz ortasından; s=1 iken bu ölçülerdedir. Bacak yok: palto ayak bileğine iner ve alt üçte biri
   karanlığa gömülür; alt gövdeyi önce masa, sonra kadraj alt kenarı gizler. */
export const MUFETTIS={omuzAyak:1000, etek:940, omuzEn:162, yuruAdim:7, salinim:.022, ziplama:9};

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

/* Kalabalık. Dış resim kendi birimindedir (900 x 700), pencere boşluğuna yerleştirilir.
   Derinlik z: 1 ön sıra, zUzak meydanın arka ucu; z<1 pencerenin dibindeki birkaç büyük figür (alt kenar keser). */
export const KALABALIK={
  resim:[900,700], ufuk:212, onY:790, zUzak:3.4, boy:150, yayilim:1300,
  sira:[11,13], siraKisi:[8,11],    // tohumla seçilir: kişi sayısı her oyunda başka
  yakin:[2,4],                      // pencerenin dibindeki büyük, ayrıntılı figür sayısı
  bosluk:.11,                       // iki grup arasındaki boş şerit (u biriminde)
  oranOynama:.05                    // grup oranına eklenen tohumlu sapma: kişi sayısından doğru sayısı okunmasın
};
/* Öfkeli grubun elindekiler ve olasılıkları; coşkulu grubun kol duruşları. */
export const OFKE_ESYA=[['mesale',.22],['tirpan',.16],['dirgen',.17],['orak',.12],['sopa',.09],['yumruk',.24]];
export const COSKU_DURUS=[['ikiKol',.36],['fenerYukari',.2],['fenerAlt',.14],['tekKol',.18],['kasketAt',.12]];

/* Giysi ve baş örtüsü türleri: hepsi uzun, alt gövdeyi örter. */
export const GIYSI=['aba','entari','kepenek','salta'];
export const BASLIK=['kasket','pusu','yemeni','kulah','basAcik'];

export const RENK={
  giysi:[hex('#17140f'),hex('#1d1813'),hex('#14171a'),hex('#1b1419'),hex('#191a12'),hex('#211a12')],
  ofkeAlev:hex('#f0b45a'), ofkeIsik:hex('#b4502a'), ofkeDuman:hex('#1a0d08'),
  coskuAlev:hex('#f4d28a'), coskuIsik:hex('#d29a50'),
  odaOfke:hex('#b8582e'), odaCosku:hex('#d8aa62'), kirliSari:hex('#a88a46'),
  ahsap:hex('#2a2016'), ahsapIsik:hex('#6e5434'), sivaIsik:hex('#4a4430'),
  kufYesil:hex('#243029'), morluk:hex('#4a3a52'), cam:hex('#9aa294'), camKir:hex('#3a3a26'),
  siva:hex('#1b1d17'), sivaKoyu:hex('#0d0e0b'), murekkep:hex('#050504')
};
