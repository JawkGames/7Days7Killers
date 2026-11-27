import { TOWNSPEOPLE } from '../data/townspeople.js';
import { LOCATIONS, CLUE_TYPES } from '../data/locations.js';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve({ ok: true, img, src });
    img.onerror = () => resolve({ ok: false, img: null, src });
    img.src = src;
  });
}

export async function loadAllGameAssets(onProgress) {
  const manifest = [
    { group: 'room', key: 'bg', src: 'assets/room/room_bg.webp' },
    { group: 'room', key: 'desk', src: 'assets/room/fg_desk.png' },
    { group: 'room', key: 'chair', src: 'assets/room/chair.png' },
    { group: 'room', key: 'bulb', src: 'assets/room/bulb.png' },
    { group: 'room', key: 'doorAjar', src: 'assets/room/door_ajar.png' },

    { group: 'ui', key: 'btnDark', src: 'assets/ui/btn_dark.png' },
    { group: 'ui', key: 'btnBlood', src: 'assets/ui/btn_blood.png' },
    { group: 'ui', key: 'btnSquare', src: 'assets/ui/btn_square.png' },
    { group: 'ui', key: 'polaroid', src: 'assets/ui/polaroid_frame.png' },
    { group: 'ui', key: 'notebook', src: 'assets/ui/notebook_spread.webp' },

    { group: 'endings', key: 'family', src: 'assets/endings/loss_family.webp' },
    { group: 'endings', key: 'bench', src: 'assets/endings/loss_bench.webp' },
    { group: 'endings', key: 'cats', src: 'assets/endings/loss_cats.webp' },
    { group: 'endings', key: 'workshop', src: 'assets/endings/loss_workshop.webp' },
    { group: 'endings', key: 'crowdCalm', src: 'assets/endings/crowd_calm.webp' },
    { group: 'endings', key: 'crowdRiot', src: 'assets/endings/crowd_riot.webp' }
  ];

  for (const p of TOWNSPEOPLE) {
    manifest.push({ group: 'suspects', key: p.id, src: p.sprite || `assets/suspects/${p.id}.png` });
  }
  for (const loc of LOCATIONS) {
    manifest.push({ group: 'locations', key: loc.id, src: loc.photo || `assets/locations/${loc.id}.webp` });
  }
  for (const clue of CLUE_TYPES) {
    manifest.push({ group: 'clues', key: clue.id, src: clue.sprite || `assets/clues/${clue.id}.png` });
  }

  const assets = {
    room: {},
    ui: {},
    endings: {},
    suspects: {},
    locations: {},
    clues: {}
  };

  let done = 0;
  const total = manifest.length;

  await Promise.all(
    manifest.map(async (item) => {
      const res = await loadImage(item.src);
      assets[item.group][item.key] = res.img;
      done += 1;
      if (onProgress) onProgress(done / total, item.src, res.ok);
    })
  );

  return assets;
}
