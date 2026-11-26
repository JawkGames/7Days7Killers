// Bütün içerik dosyalarını toplar. Yeni kişi ya da mekân eklemek: klasöre dosya koymak.
import {koyKur} from './kur.js';

const topla=m=>Object.values(m).map(x=>x.default);
export const kisiListesi=topla(import.meta.glob('./kisiler/*.js',{eager:true}));
export const mekanListesi=topla(import.meta.glob('./mekanlar/*.js',{eager:true}));
export const koy=koyKur(kisiListesi,mekanListesi);
