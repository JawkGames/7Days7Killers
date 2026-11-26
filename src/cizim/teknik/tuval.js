// Çizim hedefi. `c` canlı bağdır: ön belleğe çizerken hedefAyarla ile geçici olarak değişir.
export let cv=null, ana=null, c=null;
export function tuvalKur(el){cv=el; ana=el.getContext('2d'); c=ana;}
export function hedefAyarla(k){c=k;}
