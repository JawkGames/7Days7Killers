// Etkin dil. Yeni dil eklemek: dil/<kod>/ klasörü açıp buraya kaydetmek.
import trArayuz from './tr/arayuz.js';
import trAgiz from './tr/agiz.js';

const DILLER={tr:{arayuz:trArayuz,agiz:trAgiz}};
let etkin='tr';
export function dilSec(kod){if(!DILLER[kod]) throw new Error('Bilinmeyen dil: '+kod); etkin=kod;}
export function metin(anahtar){const m=DILLER[etkin].arayuz[anahtar]; if(m==null) throw new Error('Eksik metin: '+anahtar); return m;}
export function agizTablosu(){return DILLER[etkin].agiz;}
