// Gerçek CC0 ses dosyalarıyla karışık torba (shuffle-bag) ses yöneticisi
// (Kodla üretilen / sentez ses kesinlikle kullanılmaz; konuşmada ses yoktur.)

const SFX_POOLS = {
  click: ['assets/sfx/click_1.ogg', 'assets/sfx/click_2.ogg', 'assets/sfx/click_3.ogg'],
  page: ['assets/sfx/page_1.ogg', 'assets/sfx/page_2.ogg', 'assets/sfx/page_3.ogg'],
  door: ['assets/sfx/door_1.ogg', 'assets/sfx/door_2.ogg'],
  step: ['assets/sfx/step_1.ogg', 'assets/sfx/step_2.ogg', 'assets/sfx/step_3.ogg'],
  clue: ['assets/sfx/clue_1.ogg', 'assets/sfx/clue_2.ogg'],
  verdict: ['assets/sfx/verdict_1.ogg', 'assets/sfx/verdict_2.ogg']
};

class ShuffleBagAudio {
  constructor() {
    this.muted = localStorage.getItem('jawk_7d7k_mute') === '1';
    this.bags = new Map();
    this.cache = new Map();
    this.unlocked = false;
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    for (const list of Object.values(SFX_POOLS)) {
      for (const src of list) {
        if (!this.cache.has(src)) {
          const a = new Audio(src);
          a.preload = 'auto';
          this.cache.set(src, a);
        }
      }
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('jawk_7d7k_mute', this.muted ? '1' : '0');
    return this.muted;
  }

  nextFromBag(eventKey) {
    const pool = SFX_POOLS[eventKey];
    if (!pool || !pool.length) return null;
    let bag = this.bags.get(eventKey);
    if (!bag || bag.length === 0) {
      bag = [...pool];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      this.bags.set(eventKey, bag);
    }
    return bag.pop();
  }

  play(eventKey, volume = 0.55) {
    if (this.muted) return;
    const src = this.nextFromBag(eventKey);
    if (!src) return;
    try {
      const base = this.cache.get(src) || new Audio(src);
      if (!this.cache.has(src)) this.cache.set(src, base);
      const node = base.cloneNode();
      node.volume = Math.max(0, Math.min(1, volume));
      node.play().catch(() => {});
    } catch {
      // Sessiz hata geçişi
    }
  }
}

export const sfx = new ShuffleBagAudio();
