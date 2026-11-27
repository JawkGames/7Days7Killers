// Deterministic PRNG utilities (xfnv1a + mulberry32) for 7 Days 7 Killers

/**
 * Hashes any string or number input into an unsigned 32-bit integer using xfnv1a.
 * @param {number|string} input
 * @returns {number} Unsigned 32-bit integer
 */
export function hashSeed(input) {
  if (typeof input === 'number' && Number.isFinite(input) && Number.isInteger(input)) {
    return input >>> 0;
  }
  const str = String(input ?? '7days7killers');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Creates a deterministic mulberry32 PRNG instance from a numeric or string seed.
 * @param {number|string} seed
 */
export function createPRNG(seed) {
  const seedNum = hashSeed(seed);
  let state = seedNum >>> 0;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min, max) {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return Math.floor(next() * (hi - lo + 1)) + lo;
  }

  function pick(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[int(0, arr.length - 1)];
  }

  function shuffle(arr) {
    const copy = Array.isArray(arr) ? [...arr] : [];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function chance(p) {
    return next() < p;
  }

  return {
    seedNum,
    next,
    int,
    pick,
    shuffle,
    chance
  };
}
