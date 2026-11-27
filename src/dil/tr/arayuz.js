// Arayüz metinleri: kod yalnızca anahtarı bilir.
// Oyunun akış cümleleri (gün başı, sorular, cevaplar, son) oyun katmanından gelir (src/dil/tr/oyun.js);
// burada yalnızca görsel arayüzün düğme ve başlıkları durur.
export default {
  // sorgu odası deneme sayfası (prototip/karakterler/sahne.html, src/arayuz/sorgu-arayuzu.js)
  'sayfa.baslik':'Sorgu Odası',
  'sahne.aciklama':'Loş bir odada masanın karşısında oturup bize bakan kadın',
  'dugme.konustur':'Konuşması için dokunun',
  'dugme.tekrarKonustur':'Tekrar konuştur',
  'dugme.girisTekrar':'Girişi tekrar oynat',
  'ornek.cumle':'Merhaba.',

  // oyun
  'oyun.sayfa':'7 Days 7 Killers',
  'oyun.sahneAciklama':'Oyun sahnesi',
  'oyun.baslik':'7 Days 7 Killers',
  'oyun.altBaslik':'Sarıkuyu, 1943',
  'oyun.yeni':'Yeni oyun',
  'oyun.devam':'Devam et',
  'oyun.devamBilgi':'{gun}. gün, {n}. döngü',
  'oyun.tohum':'Tohum {tohum}',
  'oyun.hazirlaniyor':'Köy uyanıyor…',
  'oyun.gun':'{gun}. gün',
  'oyun.dongu':'{n}. döngü',
  'oyun.hak':'çağırma hakkı {n}',
  'oyun.kapat':'Kapat',
  'oyun.devamDugme':'Devam',
  'oyun.hata':'Bir şey ters gitti. Sayfayı yenileyin; oyun kayıttan sürer.',
  'oyun.kayitHata':'Kayıt yazılamadı.',

  // fotoğraf
  'foto.ipucu':'Fotoğrafa dokun, iz ara.',
  'foto.bos':'Büyüteç orada bir şey göstermedi.',
  'foto.zatenDefterde':'Defterinde: {iz}',
  'foto.onceki':'Önceki fotoğraf',
  'foto.sonraki':'Sonraki fotoğraf',
  'foto.sira':'Fotoğraf {i} / {n}',
  'foto.yakinlas':'Yakınlaştır',
  'foto.uzaklas':'Uzaklaştır',
  'foto.bulunanlar':'Bulduğun:',

  // çağırma
  'cagir.olu':'öldü',
  'cagir.geldi':'bugün geldi',

  // sorgu
  'sorgu.sen':'Sen',
  'sorgu.baskaSoru':'Başka soru ({n})',
  'sorgu.kendiSorun':'Kendi sorunu sor…',
  'sorgu.kendiSorunEtiket':'Kendi sorun',
  'sorgu.sor':'Sor',
  'sorgu.dusunuyor':'düşünüyor',

  // yapay zekâ ayarı
  'yz.ayar':'Ayarlar',
  'yz.baslik':'Yapay zekâ',
  'yz.kapali':'Kapalı (hazır kalıplar)',
  'yz.yerel':'Yerel sunucu (LM Studio, Ollama)',
  'yz.adres':'Adres',
  'yz.model':'Model adı (boş: sunucuda yüklü olan)',
  'yz.kaydet':'Kaydet',
  'yz.kapat':'Kapat',
  'yz.dene':'Bağlantıyı dene',
  'yz.deneniyor':'Deneniyor…',
  'yz.baglandi':'Bağlandı: {model}',
  'yz.baglanamadi':'Bağlanamadı ({neden}).',
  'yz.bilgi':'Karakterler cevabı motorun verdiği anlamla, kendi ağızlarıyla söyler. Sunucu cevap vermezse hazır cümle kullanılır.',

  // karar ve hüküm
  'karar.hukumBaslik':'Katil olduğuna inandığın {k} kişiyi seç ({n}/{k})',
  'karar.onay':'Hükmü ver',
  'karar.geri':'Geri',

  // son
  'son.kayipSira':'Götürülenler · {i} / {n}',
  'son.atla':'Geç',
  'son.yeniden':'Yeniden oyna',

  // defter
  'defter.baslik':'Defter',
  'defter.sekme.ifadeler':'İfadeler',
  'defter.sekme.izler':'İzler',
  'defter.sekme.kisiler':'Kişiler',
  'defter.sekme.cinayetler':'Cinayetler',
  'defter.sekme.sirlar':'Sırlar',
  'defter.sekme.celiskiler':'Çelişkiler',
  'defter.bos':'Henüz bir şey yok.',
  'defter.karsilastirIpucu':'İki ifadeye dokun, sonra yan yana koy.',
  'defter.secIpucu':'bir ifade seç',
  'defter.karsilastir':'Yan yana koy',
  'defter.secimTemizle':'Seçimi bırak',
  'defter.supheli':'şüpheli',
  'defter.temiz':'temiz',
  'defter.olu':'öldü',
};
