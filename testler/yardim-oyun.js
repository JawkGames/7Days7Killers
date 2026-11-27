// Diyalog ve oyun testlerinin ortak kurulumu (Vite'ta içerik import.meta.glob ile toplanır).
import {koy as koyTemel} from '../src/icerik/index.js';
import {cekirdekListesi} from '../src/icerik/olay-cekirdekleri/index.js';
export const koy={...koyTemel,cekirdekler:cekirdekListesi};
// Cümlede kalmaması gereken artıklar: doldurulmamış yer tutucu, seçenek ayracı, "undefined", "null", çift boşluk.
export const ARTIK=/[{}[\]|]|undefined|null|NaN|\s{2}/;
