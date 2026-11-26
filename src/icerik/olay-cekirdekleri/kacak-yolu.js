// Sınırdan gelen kaçak mal: Halil getirir, Onbaşı göz yumar, Çerçi satar ve susmak için para alır.
// Mağaradaki kaçak patikayı görür.
export default {
  id:'kacak-yolu', agirlik:1,
  gerekli:['halil','riza','suleyman','yusuf','dursun'],
  ciftler:[
    {katil:'riza', kurban:'suleyman', carpan:2.5},
    {katil:'dursun', kurban:'suleyman', carpan:2},
    {katil:'halil', kurban:'yusuf', carpan:2},
    {katil:'riza', kurban:'yusuf', carpan:2}
  ],
  baglar:[{tur:'ortaklik', katil:'riza', yardimci:'halil'}]
};
