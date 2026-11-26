// Olay yeri fotoğrafının ölçüleri ve tonu. Bütün mekânlar ve izler bu ölçülerle çizilir.
import {hex} from '../../../cekirdek/matematik.js';

// Fotoğraf koordinatları: görüntü alanı 1000×750 birim, sol üst (0,0). Beyaz kenar bunun dışındadır (eksi değerler).
export const FOTO={genislik:1000, yukseklik:750, kenar:42, enAzBolge:42};

// Siyah-beyaza yakın baskı tonu: gölgede küflü yeşile, ışıkta kirli sarıya kayan gümüş baskı.
export const TON={
  kara:[17,19,15],       // soluk baskıda siyah tam siyah değildir
  orta:[92,94,80],
  acik:[206,198,166],
  gama:.96,              // <1: orta tonlar biraz açılır
  kum:15                 // gümüş tanesi
};

export const KAGIT={on:hex('#cfc6a8'), arka:hex('#b9ad8a'), kir:hex('#6b5e3e'), golge:hex('#000000')};

// Kurşun kalemle işaret: 1940'ların kopya kalemi moru
export const ISARET={renk:hex('#8d6fa6'), alfa:.9, kalin:2.2, pay:1.35};

// İzlerin seçici rengi ('color' karışımıyla, parlaklığı bozmadan verilir). Değerler bilerek soluk.
export const RENK={
  kirmizi:hex('#a4302a'), lacivert:hex('#2c3b6e'), yesil:hex('#3f6b3a'), sari:hex('#b49a2e'),
  kahve:hex('#6e4a2c'), beyaz:hex('#d8d4c4'), mor:hex('#5b3a6a'), kan:hex('#5a1712'), bakir:hex('#8a4f2a'), kehribar:hex('#9a6420')
};
