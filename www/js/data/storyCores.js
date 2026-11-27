// 30 atmospheric dark small-town murder and conspiracy story cores for 7 Days 7 Killers

export const STORY_CORES = [
  {
    id: 'eski_degirmen_yangini',
    title: 'Eski Değirmen Yangını',
    motiveText: 'Yedi yıl önceki değirmen yangınında kapıyı dışarıdan kilitlediğini bilen tek görgü tanığını susturmak istedi.',
    coverupText: 'Yangın gecesi tutulan sahte tutanağı saklamak için suçu birbirlerinin nöbet saatine yıktılar.',
    blackmailText: 'Küllerin arasından çıkan erimiş kilit parçasını gösterip her ay sus payı istiyordu.',
    preferredClueTypes: ['brass_key', 'cigar_stub', 'muddy_boot']
  },
  {
    id: 'sahte_miras_muhru',
    title: 'Sahte Miras Mührü',
    motiveText: 'Ölen toprak ağasının vasiyetine son gece basılan sahte mührün ortaya çıkmasını engellemek için kan döktü.',
    coverupText: 'Belediye defterindeki mürekkep kaydını silip tanıkları han köşesinde tehdit ettiler.',
    blackmailText: 'Asıl vasiyetin yırtık sayfasını sakladığını söyleyerek kasabadaki dükkan payını talep etti.',
    preferredClueTypes: ['torn_letter', 'pocket_watch', 'brass_key']
  },
  {
    id: 'yasak_iliski_mektubu',
    title: 'Yasak İlişki Mektubu',
    motiveText: 'Kasabayı birbirine katacak gizli aşk mektuplarının pazar ayininde okunacağı tehdidine boyun eğmedi.',
    coverupText: 'Posta çantasından eksilen zarfları gece karanlığında yakıp küllerini nehre savurdular.',
    blackmailText: 'Tavan arasında bulduğu imzalı mektupları geri vermek için yüksek bir bedel biçmişti.',
    preferredClueTypes: ['torn_letter', 'red_yarn', 'broken_beads']
  },
  {
    id: 'kacak_ilac_sevkiyati',
    title: 'Kaçak İlaç Sevkiyatı',
    motiveText: 'Salgın kışında hastalara su katılmış ilaç satıp asıl şişeleri karaborsaya sürdüğünü öğrenen kurbanı ortadan kaldırdı.',
    coverupText: 'Gece kayıklarla taşınan sandıkların kaydını eczane defterinden kazıdılar.',
    blackmailText: 'Etiketi sökülmüş kehribar şişelerden birini saklayıp müfettişe göndermekle gözdağı veriyordu.',
    preferredClueTypes: ['amber_vial', 'bloodied_bandage', 'brass_key']
  },
  {
    id: 'nehirde_bogulan_cocuk',
    title: 'Nehirde Boğulan Çocuk',
    motiveText: 'Sisli bir sonbahar akşamı iskeleden suya itilen çocuğun kaza kurbanı olmadığını bilen tek kişiyi boğazladı.',
    coverupText: 'Kayıkhanedeki kırık küreği yenisiyle değiştirip o gece kimsenin suya inmediğine yemin ettiler.',
    blackmailText: 'Çocuğun boynundan kopan boncukları avucunda sıkarak gerçeği ailesine anlatacağını söylüyordu.',
    preferredClueTypes: ['muddy_boot', 'broken_beads', 'pocket_watch']
  },
  {
    id: 'santaj_defteri',
    title: 'Kayıp Şantaj Defteri',
    motiveText: 'Kasabanın ileri gelenlerinin gizli borçlarını ve günahlarını tutan siyah kaplı defteri ele geçirmek için saldırdı.',
    coverupText: 'Defterden koparılan sayfaları aralarında bölüşüp birbirlerine karşı sessizlik yemini ettiler.',
    blackmailText: 'Defterde kendi adının geçtiği satırı sildirmek istiyorsa başkasının kanına girmesini şart koştu.',
    preferredClueTypes: ['torn_letter', 'empty_nail', 'cigar_stub']
  },
  {
    id: 'mezar_soygunu',
    title: 'Gece Mezar Soygunu',
    motiveText: 'Yeni gömülen zengin cenazelerin altın dişlerini ve yüzüklerini söktüğünü gören kurbanın konuşmasından korktu.',
    coverupText: 'Şapel kapısının paslı kilidini yağlayıp toprağı sabaha karşı yeniden düzlediler.',
    blackmailText: 'Mezar taşının dibinde düşürülen aleti tanıdığını söyleyip payına düşen altını istedi.',
    preferredClueTypes: ['blacksmith_hammer', 'brass_key', 'muddy_boot']
  },
  {
    id: 'kuyu_zehirlenmesi',
    title: 'Kuyu Zehirlenmesi',
    motiveText: 'Rakip hanenin hayvanlarını telef etmek için kuyuya zehir döktüğünü fark eden komşusunu karanlıkta avladı.',
    coverupText: 'Zehir tortulu şişeleri kireç çukuruna gömüp hastalığı mevsim salgınından bildiler.',
    blackmailText: 'Kuyu taşında bulduğu şişe kırığını saklayıp bütün kasabayı ayağa kaldırmakla tehdit etti.',
    preferredClueTypes: ['amber_vial', 'muddy_boot', 'bloodied_bandage']
  },
  {
    id: 'veresiye_kan_borcu',
    title: 'Veresiye ve Kan Borcu',
    motiveText: 'Faiziyle katlanan tefeci borcu yüzünden evine el konulacağını öğrenince alacaklısına pusu kurdu.',
    coverupText: 'Senet koçanını sobaya atıp borcun günler önce kapandığına dair yalancı şahitlik yaptılar.',
    blackmailText: 'İmzalı senedi son gece tahsilata çıkaracağını söyleyerek dükkan anahtarlarını istedi.',
    preferredClueTypes: ['iron_shears', 'torn_letter', 'cigar_stub']
  },
  {
    id: 'saat_kulesi_kazasi',
    title: 'Çan Kulesi Düşüşü',
    motiveText: 'Şapel çanını onarırken ustasını bilerek boşluğa bıraktığını anlayan görgü tanığının nefesini kesti.',
    coverupText: 'Kesik halat uçlarını ziftle karartıp çürük ipin kendiliğinden koptuğunu ileri sürdüler.',
    blackmailText: 'Düşen ustanın durmuş cep saatini gösterip halattaki bıçak izini bildiğini fısıldadı.',
    preferredClueTypes: ['pocket_watch', 'iron_shears', 'broken_beads']
  },
  {
    id: 'yetimhane_odunegi',
    title: 'Çalınan Yetim Ödeneği',
    motiveText: 'Kasaba yetimleri için gönderilen kışlık yardım parasını zimmetine geçirdiğini belgeleyen kurbanı susturdu.',
    coverupText: 'Makbuz defterindeki rakamları değiştirip eksik erzakı farelerin yediğini iddia ettiler.',
    blackmailText: 'Posta havalesinin asıl koçanını cebinde taşıdığını söyleyip yarı hisse istedi.',
    preferredClueTypes: ['torn_letter', 'red_yarn', 'brass_key']
  },
  {
    id: 'curuk_iskele_cokusu',
    title: 'Çürük İskele Çöküşü',
    motiveText: 'Sağlam meşe keresteleri satıp iskeleyi çürük kavakla onardığı için yaşanan ölümlü kazanın hesabından kaçtı.',
    coverupText: 'Kırılan kirişleri gece akıntıya bırakıp fırtınayı bahane ettiler.',
    blackmailText: 'Satılan meşe kerestelerin kime gittiğini bildiğini söyleyerek susmak için altın istedi.',
    preferredClueTypes: ['blacksmith_hammer', 'muddy_boot', 'empty_nail']
  },
  {
    id: 'kayip_posta_cantasi',
    title: 'Kayıp Posta Çantası',
    motiveText: 'Vilayetten gelen ihbar mektuplarını yolda açıp yok ettiğini yakalayan kurbanı taş zemine serdi.',
    coverupText: 'Çantanın kayışını makasla kesip yolda eşkıya saldırısına uğradıkları yalanını uydurdular.',
    blackmailText: 'Açılmış mühürlü zarflardan birini sakladığını söyleyip her hafta haraç kesti.',
    preferredClueTypes: ['torn_letter', 'iron_shears', 'muddy_boot']
  },
  {
    id: 'gizli_ameliyat_kaydi',
    title: 'Karanlık Gece Müdahalesi',
    motiveText: 'Yaralı bir kaçağı gizlice tedavi edip karşılığında kanlı altın aldığını bilen tanığı ortadan kaldırdı.',
    coverupText: 'Kanlı bezleri kazan dairesinde yakıp gece boyu kimsenin kapıyı çalmadığını söylediler.',
    blackmailText: 'Arka bahçede gömülü kanlı sargıyı çıkardığını söyleyerek kasabadan gitmesini dayattı.',
    preferredClueTypes: ['bloodied_bandage', 'amber_vial', 'iron_shears']
  },
  {
    id: 'kacak_tutun_ambari',
    title: 'Kaçak Tütün Ambarı',
    motiveText: 'Jandarmaya kaçak tütün zulalarını ihbar etmeye hazırlanan ortağına gece baskını yaptı.',
    coverupText: 'Balya izlerini un çuvallarıyla gizleyip nöbetçiyi şarapla uyuttular.',
    blackmailText: 'Ambardaki gizli bölmenin anahtarını ele geçirdiğini söyleyip bütün kârı istedi.',
    preferredClueTypes: ['cigar_stub', 'brass_key', 'muddy_boot']
  },
  {
    id: 'kurbanlik_kasa_vurgunu',
    title: 'Hayır Kasası Vurgunu',
    motiveText: 'Şapelin bağış kutusunu yedek anahtarla boşalttığını fark eden kurbanı sunak taşının dibinde öldürdü.',
    coverupText: 'Kırık asma kilidi dışarıdan zorlanmış gibi çekiçle ezip suçu gezginlere attılar.',
    blackmailText: 'Mum ışığında anahtar uydururken onu gördüğünü söyleyip bağışların yarısını istedi.',
    preferredClueTypes: ['brass_key', 'broken_beads', 'blacksmith_hammer']
  },
  {
    id: 'sahte_olum_belgesi',
    title: 'Sahte Ölüm Raporu',
    motiveText: 'Yıllar önce işlenen bir boğma vakasına kalp durması raporu yazıldığını kanıtlayan kişiyi susturdu.',
    coverupText: 'Eski arşiv sandığının kilidini kırıp küflü defterleri rutubet bahanesiyle imha ettiler.',
    blackmailText: 'Mezarı açtırıp boyundaki kırığı ortaya çıkaracağını söyleyerek köşeye sıkıştırdı.',
    preferredClueTypes: ['amber_vial', 'torn_letter', 'pocket_watch']
  },
  {
    id: 'kilitli_mahzen_sirri',
    title: 'Kilitli Mahzen Sırrı',
    motiveText: 'Kış boyu mahzende saklanan kaçak malı ve mahpus izlerini tesadüfen gören kurbanın dilini bağladı.',
    coverupText: 'Mahzen kapağının üstüne ağır fıçılar devirip içeriden gelen sesleri rüzgara yordular.',
    blackmailText: 'Demir parmaklığa takılmış kumaş parçasını gösterip gerçeği halka duyurmakla tehdit etti.',
    preferredClueTypes: ['brass_key', 'red_yarn', 'empty_nail']
  },
  {
    id: 'gumus_emanet_hirsizligi',
    title: 'Emanet Gümüşlerin Kaybı',
    motiveText: 'Göç eden ailelerin emanet bıraktığı gümüşleri eritip sattığını anlayan hak sahibini karanlıkta bekledi.',
    coverupText: 'Döküm potasındaki gümüş kalıntılarını demir cürufuyla karıştırıp izleri sildiler.',
    blackmailText: 'Üzerinde aile damgası kalan tek parçayı gösterip tüm servetini talep etti.',
    preferredClueTypes: ['blacksmith_hammer', 'empty_nail', 'pocket_watch']
  },
  {
    id: 'tuzakli_av_pususu',
    title: 'Orman Sınırında Pusu',
    motiveText: 'Arazi sınırı yüzünden ormanda kurulan ölümcül kapanla birini sakat bıraktığını bilen tanığı avladı.',
    coverupText: 'Kanlı çizmeleri nehirde yıkayıp kapan zincirini demirci ocağında erittiler.',
    blackmailText: 'Çalılıklarda bulduğu sargı bezini ve tütün kesesini kimin düşürdüğünü bildiğini söyledi.',
    preferredClueTypes: ['muddy_boot', 'bloodied_bandage', 'cigar_stub']
  },
  {
    id: 'tapu_sicil_tahrifati',
    title: 'Tahrif Edilen Sınır Kaydı',
    motiveText: 'Değirmen suyunun kullanım hakkını hileyle kendi üstüne geçirdiğini ispatlayan eski kaydı yok etmek için öldürdü.',
    coverupText: 'Harita rulosunu mürekkeple lekeleyip su bendinin taşlarını gece değiştirdiler.',
    blackmailText: 'Asıl sınır taşının yerini ve eski tapuyu mahkemeye sunacağını ilan etti.',
    preferredClueTypes: ['torn_letter', 'pocket_watch', 'muddy_boot']
  },
  {
    id: 'salgin_karantina_yalani',
    title: 'Karantina Kumpası',
    motiveText: 'Sağlıklı bir aileyi bulaşıcı hastalık yalanıyla eve kapatıp mallarını yağmaladığını bilen tanığı boğdu.',
    coverupText: 'Kapıya vurulan kireç işaretini silip içeridekilerin kendi eceliyle öldüğünü yaydılar.',
    blackmailText: 'Karantina gecesi evden çıkarılan sandıkları gördüğünü söyleyip sus payı istedi.',
    preferredClueTypes: ['amber_vial', 'bloodied_bandage', 'brass_key']
  },
  {
    id: 'nehir_gecidi_haraci',
    title: 'Gece Geçidi Haracı',
    motiveText: 'Sisli gecelerde nehirden kaçak geçen mültecileri soyup tekneden attığını öğrenen kurbanı susturdu.',
    coverupText: 'Kıyıya vuran bohçaları sazlıkların dibine gömüp fenerleri erkenden söndürdüler.',
    blackmailText: 'Sazlıklarda bulduğu ıslak kolyeyi ve saati gösterip jandarmaya gideceğini söyledi.',
    preferredClueTypes: ['broken_beads', 'pocket_watch', 'muddy_boot']
  },
  {
    id: 'olu_askerin_altinlari',
    title: 'Cepheden Dönmeyen Emanet',
    motiveText: 'Cephede ölen askerin ailesine gönderdiği altın kesesini hiç teslim etmediğini öğrenen kişiyi katletti.',
    coverupText: 'Teslim defterine parmak basılmış sahte bir satır ekleyip zarfı yaktılar.',
    blackmailText: 'Askerin son mektubundaki altın sayısını bildiğini söyleyip hesabı sormaya geldi.',
    preferredClueTypes: ['torn_letter', 'pocket_watch', 'cigar_stub']
  },
  {
    id: 'zehirli_bugday_cuvali',
    title: 'Küflü Tohum Vurgunu',
    motiveText: 'Kasabaya tohumluk diye zehirli çavdar karışmış buğday sattığını anlayan kurbanın konuşmasını önledi.',
    coverupText: 'Çuvalların damgalı ağızlarını makasla kesip yeni çuvallara aktardılar.',
    blackmailText: 'Numune aldığı avuç dolusu kararmış tahılı kaymakama götüreceğini söyledi.',
    preferredClueTypes: ['iron_shears', 'red_yarn', 'amber_vial']
  },
  {
    id: 'gece_nobeti_ihaneti',
    title: 'Gece Nöbeti İhaneti',
    motiveText: 'Kasaba soygunu gecesi kapı sürgüsünü içeriden bilerek açık bıraktığını bilen nöbet arkadaşını öldürdü.',
    coverupText: 'Nöbet çizelgesindeki saati geri alıp uyuya kaldıkları yalanına sığındılar.',
    blackmailText: 'Sürgüdeki yağ izini ve dışarıda düşürülen çakmağı kimin bıraktığını bildiğini söyledi.',
    preferredClueTypes: ['pocket_watch', 'cigar_stub', 'brass_key']
  },
  {
    id: 'ifsa_edilen_itiraf',
    title: 'Karanlık Günah İtirafı',
    motiveText: 'Sarhoş bir gecede ağzından kaçırdığı eski kan davası cinayetini başkalarına anlatmaya kalkan sırdaşını vurdu.',
    coverupText: 'Han masasındaki şarap testisini kırıp kavganın sarhoşluktan çıktığı süsünü verdiler.',
    blackmailText: 'Anlattığı sırrı kelime kelimesine kağıda döktüğünü söyleyip boyun eğmesini istedi.',
    preferredClueTypes: ['broken_beads', 'cigar_stub', 'torn_letter']
  },
  {
    id: 'yanmis_cirak_izi',
    title: 'Kayıp Çırağın Akıbeti',
    motiveText: 'Geçen kış kasabadan kaçtı sanılan genç çırağın aslında darbeyle öldürülüp gömüldüğünü anlayan tanığı yok etti.',
    coverupText: 'Çırağın kırmızı atkısını ve eşyalarını bohçalayıp komşu kasabaya gitmiş gibi iz bıraktılar.',
    blackmailText: 'Döşeme altından çıkan kırmızı ip yumağını ve kan izini kimin sakladığını bildiğini söyledi.',
    preferredClueTypes: ['red_yarn', 'blacksmith_hammer', 'empty_nail']
  },
  {
    id: 'sahte_sahitlik_pazarligi',
    title: 'Yalancı Şahitlik Pazarlığı',
    motiveText: 'Masum bir köylüyü hapse göndermek için para karşılığı yalan ifade verdiğini kanıtlayan mektubu geri almak istedi.',
    coverupText: 'Mahkeme celbini saklayıp o gün kasaba dışında olduklarına dair sahte şahit buldular.',
    blackmailText: 'Aldığı rüşvetin makbuzunu mahpusun ailesine vereceğini söyleyerek sıkıştırdı.',
    preferredClueTypes: ['torn_letter', 'iron_shears', 'pocket_watch']
  },
  {
    id: 'demir_ocagi_hesaplasmasi',
    title: 'Kızgın Ocak Hesaplaşması',
    motiveText: 'Ortaklık bozulurken atölyedeki en değerli kalıpları ve aletleri gizlice sattığını yakalayan ortağını ezdi.',
    coverupText: 'Duvardaki boş alet askılarını hırsızlık süsüyle kırıp suçu dışarıdan gelenlere yıktılar.',
    blackmailText: 'Eksik aletlerin kimde olduğunu tek tek sayıp sabaha loncaya bildireceğini söyledi.',
    preferredClueTypes: ['blacksmith_hammer', 'empty_nail', 'bloodied_bandage']
  }
];

const STORY_CORE_MAP = new Map(STORY_CORES.map((core) => [core.id, core]));

export function getStoryCoreById(id) {
  return STORY_CORE_MAP.get(id) || null;
}
