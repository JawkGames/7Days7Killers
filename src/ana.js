// Başlangıç: tek ortak canvas'ı kurar ve görsel oyunu açar (src/arayuz/oyun-arayuzu.js).
import './arayuz/oyun.css';
import {tuvalKur} from './cizim/teknik/tuval.js';
import {oyunArayuzuKur} from './arayuz/oyun-arayuzu.js';
import {gorselleriYukle} from './platform/gorseller.js';

gorselleriYukle();

tuvalKur(document.getElementById('sahne'));
const oyun=oyunArayuzuKur();
if(import.meta.env?.DEV) window.oyun=oyun; // geliştirici konsolundan durumu görmek için
