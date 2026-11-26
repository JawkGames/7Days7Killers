import {tuvalKur} from './cizim/teknik/tuval.js';
import {PAL} from './cizim/teknik/palet.js';
import {poz} from './cizim/rig/poz.js';
import {OLCU} from './cizim/sahneler/sorgu-odasi/ayar.js';
import {sorguOdasiBaslat} from './cizim/sahneler/sorgu-odasi/sahne.js';
import {KONUSMA,konus} from './diyalog/konusma.js';
import {sorguArayuzuKur} from './arayuz/sorgu-arayuzu.js';

tuvalKur(document.getElementById('sahne'));
sorguArayuzuKur();
sorguOdasiBaslat();
window.sorgu={poz,PAL,OLCU,KONUSMA,konus}; // geliştirici konsolundan ifade ve ışığı sürmek için
