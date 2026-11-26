// Mekân şablonlarını ve iz nesnelerini klasörden toplar. Yeni mekân ya da iz eklemek: klasöre dosya koymak.
const topla=m=>Object.fromEntries(Object.values(m).map(x=>[x.default.id||x.default.tur,x.default]));
export const MEKANLAR=topla(import.meta.glob('./mekanlar/*.js',{eager:true}));
export const IZLER=topla(import.meta.glob('./izler/*.js',{eager:true}));
