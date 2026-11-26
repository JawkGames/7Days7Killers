// Kullanıcı "az hareket" istiyorsa giriş, titreme ve kum hareketi kapatılır.
export const azHareket=typeof window!=='undefined'&&!!window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
