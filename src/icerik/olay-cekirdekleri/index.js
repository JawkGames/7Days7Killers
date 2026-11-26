// Bütün olay çekirdeklerini toplar (Vite ve Vitest için). Düz node'da araçlar klasörü fs ile okur.
// Şema ve kurallar: src/simulasyon/cekirdek.js ve src/simulasyon/README.md.
const topla=m=>Object.values(m).map(x=>x.default).filter(x=>x&&x.id);
export const cekirdekListesi=topla(import.meta.glob(['./*.js','!./index.js'],{eager:true}));
