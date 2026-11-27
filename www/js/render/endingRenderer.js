import { getClueTypeById } from '../data/locations.js';

export class EndingRenderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
  }

  renderLossScene(person, isActualKiller, killerMurderObj = null) {
    const ctx = this.ctx;
    const W = (this.canvas.width = 960);
    const H = (this.canvas.height = 540);
    ctx.clearRect(0, 0, W, H);

    const lossType = person?.lossScene?.type || 'bench';
    const bgImg = this.assets.endings[lossType] || this.assets.endings.bench;

    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#121514';
      ctx.fillRect(0, 0, W, H);
    }

    // Somber portrait inset on left
    const pImg = this.assets.suspects[person.id];
    if (pImg) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 12, 11, 0.78)';
      ctx.fillRect(34, H - 230, 168, 196);
      ctx.strokeStyle = '#4e473c';
      ctx.lineWidth = 2;
      ctx.strokeRect(34, H - 230, 168, 196);
      ctx.filter = 'grayscale(0.45) contrast(1.1)';
      ctx.drawImage(pImg, 42, H - 222, 152, 180);
      ctx.restore();
    }

    // PLAN.md Rule: If chosen person IS actually a killer, hidden evidence gleams in the corner!
    if (isActualKiller) {
      const clueId = killerMurderObj?.photoClues?.find((c) => !c.isRedHerring)?.clueTypeId || person.clues?.[0] || 'iron_shears';
      const clueDef = getClueTypeById(clueId);
      const clueImg = clueDef ? this.assets.clues[clueDef.id] : null;

      ctx.save();
      const gx = W - 135;
      const gy = H - 120;
      const glow = ctx.createRadialGradient(gx, gy, 8, gx, gy, 92);
      glow.addColorStop(0, 'rgba(180, 42, 34, 0.52)');
      glow.addColorStop(1, 'rgba(12, 10, 10, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(gx, gy, 92, 0, Math.PI * 2);
      ctx.fill();

      if (clueImg) {
        ctx.drawImage(clueImg, gx - 48, gy - 48, 96, 96);
      }
      ctx.strokeStyle = 'rgba(178, 48, 38, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(gx - 58, gy - 58, 116, 116);
      ctx.restore();
    }

    this.applyVignette(ctx, W, H);
  }

  renderWindowCrowdScene(correctCount, totalKillers = 7) {
    const ctx = this.ctx;
    const W = (this.canvas.width = 960);
    const H = (this.canvas.height = 540);
    ctx.clearRect(0, 0, W, H);

    const calmImg = this.assets.endings.crowdCalm;
    const riotImg = this.assets.endings.crowdRiot;
    const ratio = Math.max(0, Math.min(1, correctCount / totalKillers));

    if (ratio >= 0.99 && calmImg) {
      ctx.drawImage(calmImg, 0, 0, W, H);
    } else if (ratio <= 0.01 && riotImg) {
      ctx.drawImage(riotImg, 0, 0, W, H);
    } else if (calmImg && riotImg) {
      // Split crowd per PLAN.md: proportion shifts with how many killers were accurately caught!
      const splitX = Math.round(W * ratio);
      ctx.drawImage(riotImg, 0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX + 40, H);
      ctx.clip();
      ctx.drawImage(calmImg, 0, 0, W, H);
      ctx.restore();

      // Soft smoky blend seam between divided town factions
      const seam = ctx.createLinearGradient(splitX - 50, 0, splitX + 50, 0);
      seam.addColorStop(0, 'rgba(12,14,13,0)');
      seam.addColorStop(0.5, 'rgba(12,14,13,0.68)');
      seam.addColorStop(1, 'rgba(12,14,13,0)');
      ctx.fillStyle = seam;
      ctx.fillRect(splitX - 55, 0, 110, H);
    }

    // Foreground dark window muntins (looking down from interrogation building left window)
    ctx.save();
    ctx.strokeStyle = '#0d0f0e';
    ctx.lineWidth = 24;
    ctx.strokeRect(0, 0, W, H);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, 0);
    ctx.lineTo(W * 0.5, H);
    ctx.moveTo(0, H * 0.52);
    ctx.lineTo(W, H * 0.52);
    ctx.stroke();

    // Cracked glass impact if innocent townspeople were condemned!
    if (correctCount < totalKillers) {
      const cracks = totalKillers - correctCount;
      ctx.strokeStyle = 'rgba(218, 224, 218, 0.52)';
      ctx.lineWidth = 1.6;
      const impactX = W * 0.68;
      const impactY = H * 0.36;
      for (let i = 0; i < 5 + cracks * 2; i++) {
        const ang = (i / (5 + cracks * 2)) * Math.PI * 2 + 0.3;
        const len = 38 + (i % 3) * 44;
        ctx.beginPath();
        ctx.moveTo(impactX, impactY);
        ctx.lineTo(impactX + Math.cos(ang) * len, impactY + Math.sin(ang) * len);
        ctx.stroke();
      }
    }
    ctx.restore();

    this.applyVignette(ctx, W, H);
  }

  applyVignette(ctx, W, H) {
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.25, W * 0.5, H * 0.5, W * 0.68);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(5,6,6,0.78)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
}
