// İmleç ve dokunma tek olay olarak gelir. Telefonu eğme sonradan buraya eklenecek.
export function isaretciDinle(fn){
  addEventListener('pointermove',fn,{passive:true});
  addEventListener('pointerdown',fn,{passive:true});
}
