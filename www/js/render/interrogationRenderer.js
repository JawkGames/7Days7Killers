import { GAME_CONFIG } from '../../config.js';

export class InterrogationRenderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
    this.ready = false;

    this.offSuspect = document.createElement('canvas');
    this.offSuspect.width = 720;
    this.offSuspect.height = 820;
    this.offCtx = this.offSuspect.getContext('2d');

    this.skinCache = new Map();

    this.state = {
      time: 0,
      boilSeed: 0,
      camX: 0,
      camY: 0,
      targetCamX: 0,
      targetCamY: 0,
      pointerNormX: 0,
      pointerNormY: 0,

      suspect: null,
      entryPhase: 'none', // 'none' | 'entering' | 'seated' | 'leaving'
      entryT: 0,
      doorOpen: 0,

      emotion: 'neutral',
      gazeX: 0,
      gazeY: 0,
      gazeBiasX: 0,
      blink: 0,
      blinkTimer: 2.8,
      mouthOpen: 0,
      mouthWide: 0,
      targetMouthOpen: 0,
      targetMouthWide: 0,

      bulbSwing: 0,
      bulbFlicker: 1,
      blackoutTimer: 9.5,

      smokeParticles: Array.from({ length: 18 }, (_, i) => ({
        x: 0.18 + (i % 3) * 0.008,
        y: 0.80 - (i / 18) * 0.30,
        drift: (i % 2 === 0 ? 1 : -1) * (0.012 + (i % 5) * 0.004),
        size: 14 + (i % 4) * 9,
        alpha: 0.06 + (i % 3) * 0.025,
        phase: i * 0.9
      }))
    };

    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      this.ready = false;
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ready = true;
  }

  setPointer(normX, normY) {
    const nx = Math.max(-1, Math.min(1, normX));
    const ny = Math.max(-1, Math.min(1, normY));
    this.state.pointerNormX = nx;
    this.state.pointerNormY = ny;
    this.state.targetCamX = -nx * GAME_CONFIG.parallaxMargin;
    this.state.targetCamY = -ny * 22;
  }

  summonSuspect(personObj) {
    this.state.suspect = personObj;
    this.state.entryPhase = personObj ? 'entering' : 'none';
    this.state.entryT = 0;
    this.state.emotion = 'neutral';
    this.state.gazeBiasX = 0;
    this.state.mouthOpen = 0;
    this.state.mouthWide = 0;
  }

  dismissSuspect() {
    if (!this.state.suspect) return;
    this.state.entryPhase = 'leaving';
    this.state.entryT = 0;
  }

  setSpeechFrame(openAmt, wideAmt, emotion = 'neutral', gazeShift = 0) {
    this.state.targetMouthOpen = Math.max(0, Math.min(1, openAmt));
    this.state.targetMouthWide = Math.max(-0.4, Math.min(1, wideAmt));
    if (emotion) this.state.emotion = emotion;
    this.state.gazeBiasX = gazeShift || 0;
  }

  sampleEyelidTone(personId, img) {
    if (this.skinCache.has(personId)) return this.skinCache.get(personId);
    const fallback = 'rgb(64, 56, 50)';
    if (!img) return fallback;
    try {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, 64, 64);
      const d = g.getImageData(28, 16, 8, 8).data;
      let r = 0, gr = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 180) {
          r += d[i];
          gr += d[i + 1];
          b += d[i + 2];
          n += 1;
        }
      }
      const color = n > 0
        ? `rgb(${Math.round((r / n) * 0.72)}, ${Math.round((gr / n) * 0.70)}, ${Math.round((b / n) * 0.68)})`
        : fallback;
      this.skinCache.set(personId, color);
      return color;
    } catch {
      return fallback;
    }
  }

  update(dt) {
    const s = this.state;
    s.time += dt;
    s.boilSeed = Math.floor(s.time * GAME_CONFIG.boilFps);

    const smooth = 1 - Math.exp(-dt * 5.5);
    s.camX += (s.targetCamX - s.camX) * smooth;
    s.camY += (s.targetCamY - s.camY) * smooth;

    // Door & Suspect Walk-in / Sit Timeline
    if (s.entryPhase === 'entering') {
      s.entryT = Math.min(1, s.entryT + dt * 0.58);
      if (s.entryT < 0.28) {
        s.doorOpen = s.entryT / 0.28;
      } else if (s.entryT > 0.72) {
        s.doorOpen = Math.max(0, 1 - (s.entryT - 0.72) / 0.28);
      } else {
        s.doorOpen = 1;
      }
      if (s.entryT >= 1) {
        s.entryPhase = 'seated';
        s.doorOpen = 0;
      }
    } else if (s.entryPhase === 'leaving') {
      s.entryT = Math.min(1, s.entryT + dt * 0.95);
      s.doorOpen = Math.sin(s.entryT * Math.PI) * 0.75;
      if (s.entryT >= 1) {
        s.suspect = null;
        s.entryPhase = 'none';
        s.doorOpen = 0;
      }
    }

    // Gaze & Blink
    const targetGX = s.pointerNormX * 0.45 + s.gazeBiasX;
    const targetGY = s.pointerNormY * 0.25;
    s.gazeX += (targetGX - s.gazeX) * (1 - Math.exp(-dt * 6));
    s.gazeY += (targetGY - s.gazeY) * (1 - Math.exp(-dt * 6));

    s.blinkTimer -= dt * (s.emotion === 'nervous' ? 1.7 : 1.0);
    if (s.blinkTimer <= 0) {
      s.blink = 1;
      s.blinkTimer = 2.4 + ((s.boilSeed * 37) % 28) * 0.12;
    } else if (s.blink > 0) {
      s.blink = Math.max(0, s.blink - dt * 8.5);
    }

    // Smooth Mouth
    s.mouthOpen += (s.targetMouthOpen - s.mouthOpen) * (1 - Math.exp(-dt * 18));
    s.mouthWide += (s.targetMouthWide - s.mouthWide) * (1 - Math.exp(-dt * 15));

    // Bare Bulb Sway & Flicker
    s.bulbSwing = Math.sin(s.time * 1.35) * 0.038 + Math.sin(s.time * 2.9) * 0.008;
    s.blackoutTimer -= dt;
    if (s.blackoutTimer <= 0) {
      s.bulbFlicker = 0.22;
      if (s.blackoutTimer < -0.11) {
        s.blackoutTimer = 6.5 + ((s.boilSeed * 19) % 70) * 0.12;
      }
    } else {
      const buzz = Math.sin(s.time * 43) * 0.025 + Math.cos(s.time * 67) * 0.018;
      s.bulbFlicker = Math.max(0.55, Math.min(1.06, 0.96 + buzz));
    }

    // Ashtray Smoke
    for (const p of s.smokeParticles) {
      p.y -= dt * 0.035;
      if (p.y < 0.45) p.y = 0.80;
    }
  }

  render() {
    if (!this.ready) this.resize();
    if (!this.ready) return;

    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const W = GAME_CONFIG.designWidth;
    const H = GAME_CONFIG.designHeight;

    const scale = Math.max(cw / W, ch / H);
    const ox = (cw - W * scale) * 0.5;
    const oy = (ch - H * scale) * 0.5;

    ctx.save();
    ctx.fillStyle = GAME_CONFIG.palette.voidBg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    const s = this.state;
    const d = GAME_CONFIG.depth;
    const boilX = ((s.boilSeed * 17) % 3 - 1) * 0.55;
    const boilY = ((s.boilSeed * 29) % 3 - 1) * 0.55;

    // 1) Background Wall
    this.drawBackground(ctx, W, H, s.camX * d.bg, s.camY * d.bg);

    // 2) Hallway Door Spill Light & Ajar Door Panel
    if (s.doorOpen > 0.01) {
      this.drawDoorLight(ctx, W, H, s.camX * d.door, s.camY * d.door, s.doorOpen);
    }

    // 3) Suspect Cast Shadow on Back Wall
    if (s.suspect && s.entryPhase !== 'none') {
      this.drawWallShadow(ctx, W, H, s.camX * d.shadow, s.camY * d.shadow);
    }

    // 4) Interrogation Chair
    this.drawChair(ctx, W, H, s.camX * d.chair, s.camY * d.chair);

    // 5) Suspect Character (Walk-in Silhouette -> Seated Animated Bust)
    if (s.suspect && s.entryPhase !== 'none') {
      this.drawSuspect(ctx, W, H, s.camX * d.suspect + boilX, s.camY * d.suspect + boilY);
    }

    // 6) Hanging Bare Bulb & Tungsten Light Cone
    this.drawHangingBulb(ctx, W, H, s.camX * d.bulb, s.camY * d.bulb);

    // 7) Foreground Interrogation Desk
    this.drawForegroundDesk(ctx, W, H, s.camX * d.desk, s.camY * d.desk);

    // 8) Rising Smoke + Film Grain + Noir Vignette
    this.drawSmokeAndFilmOverlay(ctx, W, H, s.camX * d.smoke);

    ctx.restore();
  }

  drawBackground(ctx, W, H, px, py) {
    const pad = GAME_CONFIG.parallaxMargin + 30;
    const bgImg = this.assets.room.bg;
    if (bgImg) {
      ctx.drawImage(bgImg, -pad + px, -26 + py, W + pad * 2, H + 52);
    } else {
      const grad = ctx.createRadialGradient(W * 0.5 + px, H * 0.35 + py, 60, W * 0.5, H * 0.5, W * 0.75);
      grad.addColorStop(0, '#2a352b');
      grad.addColorStop(0.6, '#1c1822');
      grad.addColorStop(1, '#0b0d0c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawDoorLight(ctx, W, H, px, py, amt) {
    const doorX = W * 0.25 + px;
    const doorY = H * 0.18 + py;
    const doorW = 195 * amt;
    const doorH = 490;

    ctx.save();
    const g = ctx.createLinearGradient(doorX, doorY, doorX + 380, doorY + doorH);
    g.addColorStop(0, `rgba(196, 206, 162, ${0.42 * amt})`);
    g.addColorStop(0.55, `rgba(155, 168, 128, ${0.14 * amt})`);
    g.addColorStop(1, 'rgba(20, 24, 20, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(doorX, doorY);
    ctx.lineTo(doorX + doorW, doorY + 12);
    ctx.lineTo(doorX + 430, doorY + doorH + 90);
    ctx.lineTo(doorX - 30, doorY + doorH + 40);
    ctx.closePath();
    ctx.fill();

    const doorImg = this.assets.room.doorAjar;
    if (doorImg) {
      ctx.globalAlpha = Math.min(1, amt * 1.15);
      ctx.drawImage(doorImg, doorX + doorW * 0.45, doorY - 8, 155, doorH + 16);
    }
    ctx.restore();
  }

  drawWallShadow(ctx, W, H, px, py) {
    const s = this.state;
    let t = 1;
    if (s.entryPhase === 'entering') t = s.entryT;
    else if (s.entryPhase === 'leaving') t = 1 - s.entryT;

    const cx = W * (0.28 + 0.22 * t) + px - s.bulbSwing * 280;
    const cy = H * 0.50 + py;
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, 245);
    g.addColorStop(0, `rgba(6, 7, 8, ${0.58 * s.bulbFlicker})`);
    g.addColorStop(1, 'rgba(6, 7, 8, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 215, 265, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  getDeskTopClipY(H) {
    const deskPy = this.state.camY * GAME_CONFIG.depth.desk;
    const deskY = H - 178 + deskPy;
    return deskY + 62;
  }

  drawChair(ctx, W, H, px, py) {
    const chairImg = this.assets.room.chair;
    const cw = 290;
    const ch = 390;
    const x = W * 0.5 - cw * 0.5 + px;
    const y = H * 0.57 + py;
    const clipBottomY = this.getDeskTopClipY(H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-200, -100, W + 400, clipBottomY + 100);
    ctx.clip();
    if (chairImg) {
      ctx.filter = `brightness(${0.78 * this.state.bulbFlicker})`;
      ctx.drawImage(chairImg, x, y, cw, ch);
    } else {
      ctx.fillStyle = '#1b1614';
      ctx.fillRect(x + 40, y + 30, cw - 80, ch - 60);
    }
    ctx.restore();
  }

  drawSuspect(ctx, W, H, px, py) {
    const s = this.state;
    const person = s.suspect;
    const img = this.assets.suspects[person.id];
    if (!img) return;

    // Entry interpolation (Falso Rule #5: small vertical height delta between standing & seated!)
    let walkProgress = 1;
    let silhouetteAmt = 0;
    if (s.entryPhase === 'entering') {
      const e = 1 - Math.pow(1 - s.entryT, 2.4);
      walkProgress = e;
      silhouetteAmt = Math.max(0, 1 - Math.pow(s.entryT, 1.55));
    } else if (s.entryPhase === 'leaving') {
      walkProgress = 1 - s.entryT;
      silhouetteAmt = Math.min(0.92, s.entryT * 1.2);
    }

    const stepBob = s.entryPhase === 'entering'
      ? Math.abs(Math.sin(s.entryT * Math.PI * 5)) * 9 * (1 - s.entryT)
      : 0;
    const standLift = (1 - walkProgress) * 34; // kept subtle per NOTLAR.md!
    const distScale = 0.80 + 0.20 * walkProgress;

    const breathSpeed = s.emotion === 'nervous' ? 3.2 : 1.7;
    const breathY = Math.sin(s.time * breathSpeed) * 2.8;
    const tremorX = s.emotion === 'nervous' ? Math.sin(s.time * 28) * 1.1 : 0;

    // Compose suspect on offscreen buffer with Pinned-Corner Mouth Warp & Soft Eyelid Blink
    const ow = this.offSuspect.width;
    const oh = this.offSuspect.height;
    const octx = this.offCtx;
    octx.clearRect(0, 0, ow, oh);

    const aspect = img.width / img.height;
    let drawH = oh * 0.92;
    let drawW = drawH * aspect;
    if (drawW > ow * 0.92) {
      drawW = ow * 0.92;
      drawH = drawW / aspect;
    }
    const dx = (ow - drawW) * 0.5;
    const dy = oh - drawH;

    octx.drawImage(img, dx, dy, drawW, drawH);

    // Rig anchors (normalized on bust bounding box)
    const rig = person.faceRig || { eyeY: 0.30, eyeSpan: 0.11, mouthY: 0.43, mouthW: 0.10 };
    const faceCX = dx + drawW * 0.51;
    const eyeY = dy + drawH * rig.eyeY;
    const eyeSpan = drawW * rig.eyeSpan;
    const mouthY = dy + drawH * rig.mouthY;
    const mouthHalfW = drawW * rig.mouthW * (1 + s.mouthWide * 0.14);

    // 1) Pinned-Corner Mouth Deformation (Zero detached jaw!)
    if (s.mouthOpen > 0.025 && silhouetteAmt < 0.75) {
      const maxDrop = Math.min(15, drawH * 0.022) * s.mouthOpen;
      const stripTop = Math.max(0, Math.round(mouthY));
      const stripH = Math.round(drawH * 0.095);
      const strips = 15;
      const leftX = faceCX - mouthHalfW;
      const totalW = mouthHalfW * 2;

      // Dark inner mouth shadow between parted lips
      octx.save();
      octx.beginPath();
      octx.moveTo(leftX, mouthY);
      octx.quadraticCurveTo(faceCX, mouthY - maxDrop * 0.18, leftX + totalW, mouthY);
      octx.quadraticCurveTo(faceCX, mouthY + maxDrop * 1.05, leftX, mouthY);
      octx.closePath();
      octx.fillStyle = 'rgba(22, 14, 15, 0.88)';
      octx.fill();
      octx.restore();

      // Bell-curve vertical warp of lower lip/chin strips while corners stay pinned at 0px!
      const srcScaleX = img.width / drawW;
      const srcScaleY = img.height / drawH;
      for (let i = 0; i < strips; i++) {
        const u0 = i / strips;
        const u1 = (i + 1) / strips;
        const uMid = (u0 + u1) * 0.5;
        const bell = Math.sin(Math.PI * uMid);
        const drop = maxDrop * bell * bell;
        if (drop < 0.35) continue;

        const sx = (leftX + u0 * totalW - dx) * srcScaleX;
        const sy = (stripTop - dy) * srcScaleY;
        const sw = (totalW / strips) * srcScaleX;
        const sh = stripH * srcScaleY;

        octx.drawImage(
          img,
          sx, sy, sw, sh,
          leftX + u0 * totalW,
          stripTop + drop * 0.78,
          totalW / strips + 0.6,
          stripH
        );
      }
    }

    // 2) Soft Skin-Toned Eyelid Blink & Subtle Gaze Shift
    if (silhouetteAmt < 0.7) {
      const lidColor = this.sampleEyelidTone(person.id, img);
      const eyeW = Math.max(11, drawW * 0.048);
      const eyeH = Math.max(6, drawH * 0.017);

      for (const side of [-1, 1]) {
        const ex = faceCX + side * eyeSpan * 0.52;
        // Subtle gaze pupil shadow shift
        if (s.blink < 0.55) {
          octx.fillStyle = 'rgba(12, 11, 13, 0.42)';
          octx.beginPath();
          octx.arc(ex + s.gazeX * 3.2, eyeY + s.gazeY * 1.8, eyeW * 0.22, 0, Math.PI * 2);
          octx.fill();
        }
        // Soft natural eyelid fold during blink
        if (s.blink > 0.05) {
          octx.save();
          octx.fillStyle = lidColor;
          octx.beginPath();
          octx.ellipse(ex, eyeY, eyeW * 0.65, eyeH * 0.85 * s.blink, 0, 0, Math.PI * 2);
          octx.fill();
          octx.strokeStyle = 'rgba(16, 13, 14, 0.82)';
          octx.lineWidth = 1.8;
          octx.beginPath();
          octx.moveTo(ex - eyeW * 0.62, eyeY + eyeH * 0.15 * s.blink);
          octx.quadraticCurveTo(ex, eyeY + eyeH * 0.48 * s.blink, ex + eyeW * 0.62, eyeY + eyeH * 0.15 * s.blink);
          octx.stroke();
          octx.restore();
        }
      }

      // Subtle brow shadow cue for emotion
      if (s.emotion === 'angry' || s.emotion === 'defensive' || s.emotion === 'nervous') {
        octx.save();
        octx.strokeStyle = 'rgba(15, 12, 14, 0.48)';
        octx.lineWidth = 2.6;
        const tilt = s.emotion === 'nervous' ? -3 : 4;
        octx.beginPath();
        octx.moveTo(faceCX - eyeSpan * 0.85, eyeY - eyeH * 1.4 - tilt);
        octx.lineTo(faceCX - eyeSpan * 0.2, eyeY - eyeH * 1.4 + tilt);
        octx.moveTo(faceCX + eyeSpan * 0.85, eyeY - eyeH * 1.4 - tilt);
        octx.lineTo(faceCX + eyeSpan * 0.2, eyeY - eyeH * 1.4 + tilt);
        octx.stroke();
        octx.restore();
      }
    }

    // 3) Silhouette darkening during doorway entry/exit
    if (silhouetteAmt > 0.02) {
      octx.save();
      octx.globalCompositeOperation = 'source-atop';
      octx.fillStyle = `rgba(9, 11, 10, ${silhouetteAmt * 0.93})`;
      octx.fillRect(0, 0, ow, oh);
      octx.restore();
    }

    // Place offscreen character onto main scene (clipped cleanly at desk surface)
    const targetX = W * (0.27 + 0.23 * walkProgress) + px + tremorX;
    const targetBottomY = H * 0.89 - standLift - stepBob + breathY + py;
    const finalW = 505 * distScale;
    const finalH = (oh / ow) * finalW;
    const clipBottomY = this.getDeskTopClipY(H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(-200, -100, W + 400, clipBottomY + 100);
    ctx.clip();
    ctx.filter = `brightness(${0.86 + 0.18 * s.bulbFlicker})`;
    ctx.drawImage(this.offSuspect, targetX - finalW * 0.5, targetBottomY - finalH, finalW, finalH);
    ctx.restore();
  }

  drawHangingBulb(ctx, W, H, px, py) {
    const s = this.state;
    const pivotX = W * 0.5 + px;
    const pivotY = -20 + py;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(s.bulbSwing);

    const bulbImg = this.assets.room.bulb;
    const cordLen = 195;
    if (bulbImg) {
      ctx.drawImage(bulbImg, -52, 0, 104, cordLen + 55);
    } else {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, cordLen);
      ctx.stroke();
      ctx.fillStyle = '#e8c978';
      ctx.beginPath();
      ctx.arc(0, cordLen + 16, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Single-source dirty tungsten light cone
    const cone = ctx.createRadialGradient(0, cordLen + 26, 8, 0, cordLen + 260, 620);
    cone.addColorStop(0, `rgba(235, 198, 114, ${0.34 * s.bulbFlicker})`);
    cone.addColorStop(0.35, `rgba(212, 174, 96, ${0.13 * s.bulbFlicker})`);
    cone.addColorStop(1, 'rgba(18, 20, 16, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.arc(0, cordLen + 210, 620, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawForegroundDesk(ctx, W, H, px, py) {
    const deskImg = this.assets.room.desk;
    const pad = GAME_CONFIG.parallaxMargin + 40;
    if (deskImg) {
      // Lowered so desk legs & under-apron stay completely below screen bottom even at max mouse parallax
      const dw = W + pad * 2;
      const dh = 330;
      const deskY = H - 178 + py;
      ctx.save();
      ctx.filter = `brightness(${0.82 + 0.16 * this.state.bulbFlicker})`;
      ctx.drawImage(deskImg, -pad + px, deskY, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#241913';
      ctx.fillRect(-pad + px, H * 0.82 + py, W + pad * 2, H * 0.22);
    }
  }

  drawSmokeAndFilmOverlay(ctx, W, H, px) {
    const s = this.state;

    // Subtle rising ashtray smoke wisps
    ctx.save();
    for (const p of s.smokeParticles) {
      const sx = W * p.x + Math.sin(s.time * 1.4 + p.phase) * 18 + px;
      const sy = H * p.y;
      const fade = Math.sin(((0.85 - p.y) / 0.43) * Math.PI);
      const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, p.size * 1.9);
      g.addColorStop(0, `rgba(176, 178, 166, ${Math.max(0, p.alpha * fade)})`);
      g.addColorStop(1, 'rgba(176, 178, 166, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Film scratches & boiling grain (7Hz noir boil)
    ctx.save();
    ctx.strokeStyle = 'rgba(215, 205, 180, 0.045)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const gx = ((s.boilSeed * 313 + i * 521) % W);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx + ((s.boilSeed + i) % 3 - 1) * 4, H);
      ctx.stroke();
    }

    // Heavy noir vignette
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.46, W * 0.24, W * 0.5, H * 0.5, W * 0.68);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.75, 'rgba(6, 8, 7, 0.42)');
    vig.addColorStop(1, 'rgba(3, 4, 4, 0.84)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}
