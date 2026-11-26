// Bütün görünüş dosyalarını toplar. Yeni karakter: bu klasöre <kimlik>.js koymak yeter.
const topla=m=>Object.values(m).map(x=>x.default);
export const gorunusListesi=topla(import.meta.glob(['./*.js','!./index.js'],{eager:true}));
export const gorunusBul=id=>gorunusListesi.find(g=>g.id===id)||null;
