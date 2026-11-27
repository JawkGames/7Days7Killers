import { getLocationById, getClueTypeById } from '../data/locations.js';

export class CrimeSceneRenderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
    this.murder = null;
    this.discoveredClueIds = new Set();
    this.hoveredClueId = null;
    this.hitBoxes = [];
  }

  setMurder(murderObj, discoveredCluesList = []) {
    this.murder = murderObj;
    this.discoveredClueIds = new Set(discoveredCluesList.map((c) => c.id));
    this.hoveredClueId = null;
    this.render();
  }

  markDiscovered(clueId) {
    this.discoveredClueIds.add(clueId);
    this.render();
  }

  hitTest(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((clientY - rect.top) / rect.height) * this.canvas.height;

    for (let i = this.hitBoxes.length - 1; i >= 0; i--) {
      const b = this.hitBoxes[i];
      const dx = x - b.cx;
      const dy = y - b.cy;
      if (dx * dx + dy * dy <= b.r * b.r) {
        return b.photoClue;
      }
    }
    return null;
  }

  render() {
    const ctx = this.ctx;
    const W = (this.canvas.width = 960);
    const H = (this.canvas.height = 600);
    this.hitBoxes = [];

    ctx.clearRect(0, 0, W, H);
    if (!this.murder) return;

    const loc = getLocationById(this.murder.locationId);
    const locImg = loc ? this.assets.locations[loc.id] : null;

    // Aged photo border
    ctx.fillStyle = '#cfc5b0';
    ctx.fillRect(14, 10, W - 28, H - 20);
    ctx.strokeStyle = '#181512';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 10, W - 28, H - 20);

    const px = 38;
    const py = 32;
    const pw = W - 76;
    const ph = H - 102;

    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();

    if (locImg) {
      ctx.filter = 'sepia(0.24) contrast(1.08) brightness(0.88)';
      ctx.drawImage(locImg, px, py, pw, ph);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#1d211d';
      ctx.fillRect(px, py, pw, ph);
    }

    // Place ONLY simulation-backed physical clues onto hotspots
    const hotspots = loc?.hotspots || [
      { x: 0.25, y: 0.75 },
      { x: 0.52, y: 0.69 },
      { x: 0.77, y: 0.74 }
    ];

    for (const pc of this.murder.photoClues || []) {
      const pcUid = pc.id || `d${this.murder.day}_c${pc.index ?? pc.hotspotIndex ?? 0}`;
      pc.id = pcUid;
      const anchor = pc.hotspot || hotspots[(pc.hotspotIndex ?? pc.index ?? 0) % hotspots.length] || { x: 0.5, y: 0.7 };
      const cx = px + pw * anchor.x;
      const cy = py + ph * anchor.y;
      const clueDef = getClueTypeById(pc.clueTypeId);
      const clueImg = clueDef ? this.assets.clues[clueDef.id] : null;
      const found = this.discoveredClueIds.has(pcUid);
      const hovered = this.hoveredClueId === pcUid;

      // Ground contact shadow so prop sits naturally inside flash photo
      const sg = ctx.createRadialGradient(cx, cy + 16, 4, cx, cy + 16, 46);
      sg.addColorStop(0, 'rgba(8, 8, 7, 0.72)');
      sg.addColorStop(1, 'rgba(8, 8, 7, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 16, 44, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      const size = hovered ? 92 : 84;
      if (clueImg) {
        const aspect = clueImg.width / clueImg.height;
        const dw = aspect >= 1 ? size : size * aspect;
        const dh = aspect >= 1 ? size / aspect : size;
        ctx.save();
        ctx.filter = hovered
          ? 'sepia(0.15) brightness(1.12) contrast(1.08)'
          : 'sepia(0.28) brightness(0.92) contrast(1.1)';
        ctx.drawImage(clueImg, cx - dw * 0.5, cy - dh * 0.5, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = '#8b2626';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Red grease-pencil circle when discovered
      if (found) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 34, 28, 0.92)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 48, 38, -0.14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy - 1, 45, 36, 0.08, 0.2, Math.PI * 1.85);
        ctx.stroke();
        ctx.restore();
      } else if (hovered) {
        ctx.save();
        ctx.strokeStyle = 'rgba(222, 192, 112, 0.65)';
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      this.hitBoxes.push({ cx, cy, r: 54, photoClue: pc });
    }

    // Harsh vintage camera flash vignette
    const fv = ctx.createRadialGradient(px + pw * 0.5, py + ph * 0.52, pw * 0.16, px + pw * 0.5, py + ph * 0.5, pw * 0.64);
    fv.addColorStop(0, 'rgba(255, 248, 224, 0.06)');
    fv.addColorStop(0.7, 'rgba(12, 12, 10, 0.28)');
    fv.addColorStop(1, 'rgba(6, 6, 5, 0.72)');
    ctx.fillStyle = fv;
    ctx.fillRect(px, py, pw, ph);

    ctx.restore();

    // Bottom Polaroid handwritten caption strip
    ctx.fillStyle = '#241f1b';
    ctx.font = 'bold 21px Georgia, serif';
    ctx.fillText(
      `GÜN ${this.murder.day} — ${loc ? loc.name.toUpperCase() : ''}`,
      42,
      H - 34
    );
  }
}
