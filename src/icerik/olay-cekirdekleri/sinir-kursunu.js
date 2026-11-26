// Gülsüm'ün kocası sınırda vuruldu: kurşun Onbaşı'nın, kaçan Kör Halil. Gülsüm çekirdeği saklıyor.
export default {
  id:'sinir-kursunu', agirlik:1,
  gerekli:['gulsum','riza','halil'],
  ciftler:[
    {katil:'riza', kurban:'gulsum', carpan:3},
    {katil:'halil', kurban:'gulsum', carpan:2},
    {katil:'gulsum', kurban:'riza', carpan:2.5},
    {katil:'gulsum', kurban:'halil', carpan:2}
  ],
  baglar:[{tur:'ortme', ortan:'halil', ortulen:'riza'}]
};
