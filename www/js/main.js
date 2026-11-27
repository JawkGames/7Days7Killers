import { GAME_CONFIG, isNativeMobileApp } from '../config.js';
import { TOWNSPEOPLE, getPersonById } from './data/townspeople.js';
import { getLocationById, getClueTypeById } from './data/locations.js';
import { generateValidatedCase } from './sim/generator.js';
import { UI_TR } from './lang/tr.js';
import {
  createGameSession,
  discoverPhotoClue,
  checkAndLinkContradiction,
  toggleSuspectMark,
  setNightProtection,
  performRewind,
  saveSession,
  loadSession,
  clearSession
} from './state/notebook.js';
import { getAvailableQuestions, answerQuestion } from './dialogue/interrogation.js';
import { loadAllGameAssets } from './render/assetLoader.js';
import { InterrogationRenderer } from './render/interrogationRenderer.js';
import { CrimeSceneRenderer } from './render/crimeSceneRenderer.js';
import { EndingRenderer } from './render/endingRenderer.js';
import { sfx } from './audio/sfx.js';

class GameController {
  constructor() {
    this.assets = null;
    this.caseData = null;
    this.session = null;
    this.sceneRenderer = null;
    this.crimeRenderer = null;
    this.endingRenderer = null;

    this.activePhotoDay = 1;
    this.activeNotebookTab = 'statements';
    this.selectedStmtIds = [];
    this.verdictSelectedIds = new Set();

    // Subtitle / Viseme playback state
    this.speech = {
      active: false,
      fullText: '',
      timeline: null,
      elapsedMs: 0,
      pauseLeftMs: 0,
      emotion: 'neutral',
      gazeShift: 0
    };

    // 3-Stage Ending Sequence state
    this.endingFlow = {
      stage: 'none', // 'loss' | 'window' | 'truth'
      chosenIds: [],
      lossIndex: 0,
      correctCount: 0
    };

    this.toastTimer = null;
  }

  async init() {
    this.setupBrowserFullscreenButton();

    const fillEl = document.getElementById('loadingBarFill');
    const statusEl = document.getElementById('loadingStatus');

    this.assets = await loadAllGameAssets((ratio, src) => {
      if (fillEl) fillEl.style.width = `${Math.round(ratio * 100)}%`;
      if (statusEl) statusEl.textContent = `Görseller yükleniyor (%${Math.round(ratio * 100)}) — ${src.split('/').pop()}`;
    });

    this.sceneRenderer = new InterrogationRenderer(document.getElementById('sceneCanvas'), this.assets);
    this.crimeRenderer = new CrimeSceneRenderer(document.getElementById('crimePhotoCanvas'), this.assets);
    this.endingRenderer = new EndingRenderer(document.getElementById('endingCanvas'), this.assets);

    // Load saved session or generate fresh solvable seed
    const saved = loadSession();
    if (saved && saved.seedInput) {
      this.session = saved;
      this.rebuildCaseFromSession();
    } else {
      this.startFreshSeed(this.randomSeedCode());
    }

    this.bindEvents();
    this.refreshHud();

    if (this.session.currentSuspectId && this.isPersonAlive(this.session.currentSuspectId, this.session.day)) {
      const p = getPersonById(this.session.currentSuspectId);
      if (p) {
        this.sceneRenderer.summonSuspect(p);
        this.showInterrogationHud(p);
      }
    }

    document.getElementById('loadingOverlay')?.classList.add('hidden');

    let lastTs = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      this.updateSpeech(dt);
      this.sceneRenderer.update(dt);
      this.sceneRenderer.render();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  randomSeedCode() {
    return String(100000 + Math.floor(Math.random() * 899999));
  }

  setupBrowserFullscreenButton() {
    const btnFs = document.getElementById('btnFullscreen');
    if (!btnFs) return;
    if (isNativeMobileApp()) {
      btnFs.classList.add('hidden');
      return;
    }
    btnFs.addEventListener('click', async () => {
      sfx.unlock();
      sfx.play('click', 0.45);
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          if (screen.orientation && typeof screen.orientation.lock === 'function') {
            screen.orientation.lock('landscape').catch(() => {});
          }
        } else {
          await document.exitFullscreen();
        }
      } catch {
        // Tarayıcı izin vermezse sessiz geç
      }
    });
  }

  startFreshSeed(seedStr) {
    clearSession();
    this.session = createGameSession(seedStr, GAME_CONFIG.dailySummonLimit);
    this.rebuildCaseFromSession();
    saveSession(this.session);
    this.sceneRenderer?.dismissSuspect();
    document.getElementById('interrogationHud')?.classList.add('hidden');
    this.refreshHud();
    this.showToast(`Yeni kasaba vakası oluşturuldu (Tohum #${seedStr})`);
  }

  rebuildCaseFromSession() {
    this.caseData = generateValidatedCase(this.session.seedInput, {
      protectedByDay: this.session.protectedByDay || {}
    });
  }

  isPersonAlive(personId, day) {
    if (typeof this.caseData?.aliveOnDay === 'function') {
      return this.caseData.aliveOnDay(personId, day);
    }
    return !(this.caseData?.murders || []).some((m) => m.day <= day && m.victimId === personId);
  }

  getVictimMurderDay(personId, upToDay) {
    const m = (this.caseData?.murders || []).find((x) => x.day <= upToDay && x.victimId === personId);
    return m ? m.day : null;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.sceneRenderer.resize());

    // Pointer / Touch Parallax
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      this.sceneRenderer.setPointer(nx, ny);
    });

    // Mobile device tilt subtle parallax
    window.addEventListener('deviceorientation', (e) => {
      if (typeof e.gamma === 'number') {
        const nx = Math.max(-1, Math.min(1, e.gamma / 28));
        const ny = typeof e.beta === 'number' ? Math.max(-1, Math.min(1, (e.beta - 45) / 30)) : 0;
        this.sceneRenderer.setPointer(nx, ny);
      }
    });

    // Unlock real audio on first user gesture
    window.addEventListener('pointerdown', () => sfx.unlock(), { once: true });

    // Audio Mute Toggle
    const audioIcon = document.getElementById('audioIcon');
    if (audioIcon) audioIcon.textContent = sfx.muted ? '🔇' : '🔊';
    document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
      const muted = sfx.toggleMute();
      if (audioIcon) audioIcon.textContent = muted ? '🔇' : '🔊';
      if (!muted) sfx.play('click', 0.45);
    });

    // New Case / Seed prompt
    const promptSeed = () => {
      sfx.play('click', 0.45);
      const val = window.prompt(
        'Yeni vaka için bir tohum numarası gir (rastgele için boş bırak):',
        this.randomSeedCode()
      );
      if (val === null) return;
      const clean = val.trim() || this.randomSeedCode();
      this.startFreshSeed(clean);
    };
    document.getElementById('btnNewSeed')?.addEventListener('click', promptSeed);
    document.getElementById('hudSeedBadge')?.addEventListener('click', promptSeed);

    // Desk Hotbar Buttons
    document.getElementById('btnOpenPhotos')?.addEventListener('click', () => {
      sfx.play('page', 0.55);
      this.openPhotoModal(this.session.day);
    });

    document.getElementById('btnOpenSummon')?.addEventListener('click', () => {
      sfx.play('click', 0.5);
      this.openSummonModal();
    });

    document.getElementById('btnOpenNotebook')?.addEventListener('click', () => {
      sfx.play('page', 0.55);
      this.openNotebookModal();
    });

    document.getElementById('btnNextDay')?.addEventListener('click', () => {
      sfx.play('verdict', 0.55);
      this.handleEndDayOrDecision();
    });

    // Active Suspect Quick Marks & Dismiss
    document.getElementById('btnMarkKiller')?.addEventListener('click', () => {
      if (!this.session.currentSuspectId) return;
      sfx.play('clue', 0.5);
      const cur = this.session.suspectMarks[this.session.currentSuspectId];
      toggleSuspectMark(this.session, this.session.currentSuspectId, cur === 'killer' ? 'unsure' : 'killer');
      saveSession(this.session);
      this.updateActiveSuspectMarkButtons();
    });

    document.getElementById('btnMarkCleared')?.addEventListener('click', () => {
      if (!this.session.currentSuspectId) return;
      sfx.play('clue', 0.5);
      const cur = this.session.suspectMarks[this.session.currentSuspectId];
      toggleSuspectMark(this.session, this.session.currentSuspectId, cur === 'cleared' ? 'unsure' : 'cleared');
      saveSession(this.session);
      this.updateActiveSuspectMarkButtons();
    });

    document.getElementById('btnDismissSuspect')?.addEventListener('click', () => {
      sfx.play('door', 0.5);
      this.session.currentSuspectId = null;
      saveSession(this.session);
      this.speech.active = false;
      this.sceneRenderer.setSpeechFrame(0, 0, 'neutral', 0);
      this.sceneRenderer.dismissSuspect();
      document.getElementById('interrogationHud')?.classList.add('hidden');
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.play('click', 0.4);
        const id = btn.getAttribute('data-close');
        document.getElementById(id)?.classList.add('hidden');
      });
    });

    // Crime Photo Canvas Click & Hover
    const photoCanvas = document.getElementById('crimePhotoCanvas');
    photoCanvas?.addEventListener('pointermove', (e) => {
      const hit = this.crimeRenderer.hitTest(e.clientX, e.clientY);
      const hid = hit ? hit.id : null;
      if (this.crimeRenderer.hoveredClueId !== hid) {
        this.crimeRenderer.hoveredClueId = hid;
        this.crimeRenderer.render();
      }
    });
    photoCanvas?.addEventListener('pointerdown', (e) => {
      const hit = this.crimeRenderer.hitTest(e.clientX, e.clientY);
      if (!hit) return;
      const murder = this.caseData.murders[this.activePhotoDay - 1];
      const loc = getLocationById(murder.locationId);
      const clueDef = getClueTypeById(hit.clueTypeId);
      const res = discoverPhotoClue(this.session, murder.day, hit, loc, clueDef);
      this.crimeRenderer.markDiscovered(hit.id);
      sfx.play('clue', 0.65);
      saveSession(this.session);
      this.renderPhotoModalSidebar(murder);
      if (this.session.currentSuspectId) {
        this.renderQuestionsForSuspect(this.session.currentSuspectId);
      }
      if (res.added) {
        this.showToast(`Deftere yeni iz kaydedildi: ${clueDef?.name || hit.clueTypeId}`);
      }
    });

    // Notebook Tabs & Contradiction Pairing
    document.querySelectorAll('[data-nbtab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        sfx.play('page', 0.45);
        this.activeNotebookTab = tabBtn.getAttribute('data-nbtab');
        document.querySelectorAll('[data-nbtab]').forEach((b) => b.classList.toggle('active', b === tabBtn));
        this.renderNotebookBody();
      });
    });

    document.getElementById('btnTestContradiction')?.addEventListener('click', () => {
      if (this.selectedStmtIds.length !== 2) return;
      const [a, b] = this.selectedStmtIds;
      const res = checkAndLinkContradiction(this.session, a, b, this.caseData);
      if (res.matched) {
        sfx.play('verdict', 0.65);
        saveSession(this.session);
        this.showToast(`ÇELİŞKİ YAKALANDI! Yeni yüzleştirme sorusu açıldı.`);
        this.selectedStmtIds = [];
        if (this.session.currentSuspectId) {
          this.renderQuestionsForSuspect(this.session.currentSuspectId);
        }
      } else {
        sfx.play('click', 0.4);
        this.showToast(res.reasonText || 'Bu iki ifade arasında doğrudan bir çelişki bulunamadı.');
      }
      this.renderNotebookBody();
    });

    // Day 7 Decision: Rewind vs Final Verdict
    document.getElementById('btnChooseRewind')?.addEventListener('click', () => {
      sfx.play('verdict', 0.7);
      performRewind(this.session);
      this.rebuildCaseFromSession();
      saveSession(this.session);
      document.getElementById('day7DecisionModal')?.classList.add('hidden');
      this.sceneRenderer.dismissSuspect();
      document.getElementById('interrogationHud')?.classList.add('hidden');
      this.refreshHud();
      this.showToast(`Zaman 1. Güne geri sarıldı (Döngü ${this.session.loopCount}). Defterin korundu ve Gece Koruma açıldı!`);
    });

    document.getElementById('btnOpenVerdictPicker')?.addEventListener('click', () => {
      sfx.play('click', 0.55);
      document.getElementById('day7DecisionModal')?.classList.add('hidden');
      this.openVerdictModal();
    });

    document.getElementById('btnConfirmVerdict')?.addEventListener('click', () => {
      if (this.verdictSelectedIds.size !== 7) return;
      sfx.play('verdict', 0.75);
      document.getElementById('verdictModal')?.classList.add('hidden');
      this.startEndingSequence(Array.from(this.verdictSelectedIds));
    });

    document.getElementById('btnEndingNext')?.addEventListener('click', () => {
      sfx.play('page', 0.55);
      this.advanceEndingSequence();
    });
  }

  refreshHud() {
    const d = this.session.day;
    const dayLbl = document.getElementById('hudDayLabel');
    if (dayLbl) dayLbl.textContent = `GÜN ${d} / ${GAME_CONFIG.totalDays}`;

    const loopBadge = document.getElementById('hudLoopBadge');
    if (loopBadge) {
      if (this.session.loopCount > 1) {
        loopBadge.textContent = `DÖNGÜ ${this.session.loopCount}`;
        loopBadge.classList.remove('hidden');
      } else {
        loopBadge.classList.add('hidden');
      }
    }

    const sumLbl = document.getElementById('hudSummonsLabel');
    if (sumLbl) sumLbl.textContent = `SORGU HAKKI: ${this.session.summonsLeft}`;

    const seedLbl = document.getElementById('hudSeedBadge');
    if (seedLbl) seedLbl.textContent = `TOHUM: #${this.session.seedInput}`;

    const photoBtnLbl = document.getElementById('lblOpenPhotos');
    if (photoBtnLbl) photoBtnLbl.textContent = `OLAY YERİ FOTOĞRAFLARI (${d})`;

    const aliveCount = TOWNSPEOPLE.filter((p) => this.isPersonAlive(p.id, d)).length;
    const summonBtnLbl = document.getElementById('lblOpenSummon');
    if (summonBtnLbl) summonBtnLbl.textContent = `ŞÜPHELİ ÇAĞIR (${aliveCount} SAĞ)`;

    const nextBtnLbl = document.getElementById('lblNextDay');
    if (nextBtnLbl) {
      nextBtnLbl.textContent = d < GAME_CONFIG.totalDays
        ? `GÜN ${d} SONU → GECEYE GEÇ`
        : `7. GÜN KARARI (SON HÜKÜM / REWIND)`;
    }
  }

  /* ================== OLAY YERİ FOTOĞRAFLARI ================== */
  openPhotoModal(dayNum) {
    this.activePhotoDay = Math.max(1, Math.min(this.session.day, dayNum));
    const tabsEl = document.getElementById('photoDayTabs');
    tabsEl.innerHTML = '';

    for (let d = 1; d <= this.session.day; d++) {
      const m = this.caseData.murders[d - 1];
      const loc = getLocationById(m.locationId);
      const chip = document.createElement('button');
      chip.className = `tab-chip ${d === this.activePhotoDay ? 'active' : ''}`;
      chip.textContent = `GÜN ${d}: ${loc?.name || m.locationId}`;
      chip.addEventListener('click', () => {
        sfx.play('page', 0.45);
        this.openPhotoModal(d);
      });
      tabsEl.appendChild(chip);
    }

    const murder = this.caseData.murders[this.activePhotoDay - 1];
    this.session.inspectedPhotos[murder.day] = true;
    saveSession(this.session);

    this.crimeRenderer.setMurder(murder, this.session.discoveredClues);
    this.renderPhotoModalSidebar(murder);
    document.getElementById('photoModal')?.classList.remove('hidden');
  }

  renderPhotoModalSidebar(murder) {
    const victim = getPersonById(murder.victimId);
    const loc = getLocationById(murder.locationId);
    const banner = document.getElementById('murderVictimBanner');
    if (banner) {
      banner.innerHTML = `
        <strong>Maktul:</strong> ${victim ? `${victim.name} (${victim.title})` : murder.victimId}<br/>
        <strong>Mekân:</strong> ${loc ? loc.name : murder.locationId} — Gün ${murder.day} Gecesi
      `;
    }

    const listEl = document.getElementById('photoFoundCluesList');
    listEl.innerHTML = '';
    const foundForDay = this.session.discoveredClues.filter((c) => c.murderDay === murder.day);

    if (foundForDay.length === 0) {
      listEl.innerHTML = `<p class="hint-note">Bu fotoğrafta henüz bir iz işaretlenmedi. Fotoğrafın üzerindeki nesnelere dokun.</p>`;
      return;
    }

    for (const c of foundForDay) {
      const def = getClueTypeById(c.clueTypeId);
      const row = document.createElement('div');
      row.className = 'clue-card';
      row.innerHTML = `
        <img src="${def?.sprite || ''}" alt="${def?.name || ''}" />
        <div>
          <strong>${def?.name || c.clueTypeId}</strong>
          <div class="hint-note">${def?.shortDesc || 'Deftere fiziksel kanıt olarak işlendi.'}</div>
        </div>
      `;
      listEl.appendChild(row);
    }
  }

  /* ================== ŞÜPHELİ ÇAĞIRMA & GECE KORUMA ================== */
  openSummonModal() {
    const grid = document.getElementById('suspectGrid');
    const protectBar = document.getElementById('rewindProtectBar');
    grid.innerHTML = '';

    const nextDay = this.session.day + 1;
    const canProtect = this.session.loopCount > 1 && nextDay <= GAME_CONFIG.totalDays;
    const protectedId = this.session.protectedByDay?.[nextDay] || null;

    if (canProtect && protectBar) {
      const protPerson = protectedId ? getPersonById(protectedId) : null;
      protectBar.classList.remove('hidden');
      protectBar.innerHTML = protPerson
        ? `🛡 <strong>Döngü Koruması Aktif:</strong> Bu gece (Gün ${nextDay} öncesi) <strong>${protPerson.name}</strong> korunacak. Katil ona saldırırsa başka hedefe yönelecek.`
        : `🛡 <strong>Zaman Döngüsü Avantajı:</strong> Bu gece işlenecek Gün ${nextDay} cinayetine karşı sağ bir kasabalıyı koruma altına alabilirsin.`;
    } else if (protectBar) {
      protectBar.classList.add('hidden');
    }

    for (const p of TOWNSPEOPLE) {
      const alive = this.isPersonAlive(p.id, this.session.day);
      const deathDay = this.getVictimMurderDay(p.id, this.session.day);
      const mark = this.session.suspectMarks[p.id];
      const isCurrent = this.session.currentSuspectId === p.id;

      const card = document.createElement('div');
      card.className = `suspect-card ${alive ? '' : 'dead-card'}`;

      let ribbon = '';
      if (!alive) {
        ribbon = `<span class="tag-ribbon tag-killer">ÖLDÜ (GÜN ${deathDay})</span>`;
      } else if (mark === 'killer') {
        ribbon = `<span class="tag-ribbon tag-killer">ŞÜPHELİ</span>`;
      } else if (mark === 'cleared') {
        ribbon = `<span class="tag-ribbon tag-cleared">TEMİZ</span>`;
      }

      card.innerHTML = `
        ${ribbon}
        <img src="${p.sprite}" alt="${p.name}" />
        <div class="suspect-card-name">${p.name}</div>
        <div class="suspect-card-role">${p.title}</div>
        <div class="suspect-card-actions"></div>
      `;

      const actBox = card.querySelector('.suspect-card-actions');
      if (alive) {
        const btnCall = document.createElement('button');
        btnCall.className = 'img-plate-btn';
        btnCall.textContent = isCurrent ? 'MASADA' : `ÇAĞIR (${this.session.summonsLeft})`;
        btnCall.disabled = isCurrent || this.session.summonsLeft <= 0;
        btnCall.addEventListener('click', () => {
          this.summonPersonToRoom(p);
          document.getElementById('summonModal')?.classList.add('hidden');
        });
        actBox.appendChild(btnCall);

        if (canProtect) {
          const btnProt = document.createElement('button');
          btnProt.className = `img-plate-btn ${protectedId === p.id ? 'blood-plate' : ''}`;
          btnProt.textContent = protectedId === p.id ? '🛡 KORUNUYOR' : '🛡 KORU';
          btnProt.addEventListener('click', () => {
            sfx.play('clue', 0.55);
            const nextTarget = protectedId === p.id ? null : p.id;
            setNightProtection(this.session, nextDay, nextTarget);
            this.rebuildCaseFromSession();
            saveSession(this.session);
            this.openSummonModal();
          });
          actBox.appendChild(btnProt);
        }
      }

      grid.appendChild(card);
    }

    document.getElementById('summonModal')?.classList.remove('hidden');
  }

  summonPersonToRoom(person) {
    if (this.session.summonsLeft <= 0) {
      this.showToast('Bugünkü sorgu hakkın doldu. Günü bitirip yarına geçmelisin.');
      return;
    }
    this.session.summonsLeft -= 1;
    this.session.currentSuspectId = person.id;
    saveSession(this.session);
    this.refreshHud();

    sfx.play('door', 0.65);
    setTimeout(() => sfx.play('step', 0.45), 350);
    setTimeout(() => sfx.play('step', 0.45), 800);

    this.sceneRenderer.summonSuspect(person);
    this.showInterrogationHud(person);
    this.playSubtitleWithVisemes(
      `... Beni çağırtmışsınız Müfettiş. Ne soracaksanız sorun.`,
      { durationMs: 2100, chars: [], frames: [] },
      'neutral',
      0,
      250
    );
  }

  showInterrogationHud(person) {
    const hud = document.getElementById('interrogationHud');
    hud?.classList.remove('hidden');
    document.getElementById('activeSuspectName').textContent = person.name;
    document.getElementById('activeSuspectTitle').textContent = person.title;
    this.updateActiveSuspectMarkButtons();
    this.renderQuestionsForSuspect(person.id);
  }

  updateActiveSuspectMarkButtons() {
    const id = this.session.currentSuspectId;
    const mark = id ? this.session.suspectMarks[id] : null;
    document.getElementById('btnMarkKiller')?.classList.toggle('active-killer', mark === 'killer');
    document.getElementById('btnMarkCleared')?.classList.toggle('active-cleared', mark === 'cleared');
  }

  renderQuestionsForSuspect(suspectId) {
    const qBox = document.getElementById('questionList');
    qBox.innerHTML = '';
    const questions = getAvailableQuestions(this.caseData, this.session, suspectId);

    for (const q of questions) {
      const btn = document.createElement('button');
      const isConfront = q.type === 'contradiction' || q.type === 'confront';
      btn.className = `question-btn ${isConfront ? 'confront-btn' : ''} ${q.asked ? 'asked-question' : ''}`;
      btn.textContent = q.label || q.text;
      btn.addEventListener('click', () => {
        sfx.play('click', 0.45);
        const reply = answerQuestion(this.caseData, this.session, suspectId, q);
        saveSession(this.session);
        this.playSubtitleWithVisemes(
          reply.text,
          reply.visemeTimeline,
          reply.emotion,
          reply.gazeShift,
          reply.pauseMs || 120
        );
        this.renderQuestionsForSuspect(suspectId);
      });
      qBox.appendChild(btn);
    }
  }

  playSubtitleWithVisemes(text, timeline, emotion = 'neutral', gazeShift = 0, pauseMs = 0) {
    this.speech.active = true;
    this.speech.fullText = text;
    this.speech.timeline = timeline;
    this.speech.elapsedMs = 0;
    this.speech.pauseLeftMs = pauseMs;
    this.speech.emotion = emotion;
    this.speech.gazeShift = gazeShift;

    const subEl = document.getElementById('subtitleText');
    if (subEl) subEl.textContent = '';
    this.sceneRenderer.setSpeechFrame(0, 0, emotion, gazeShift);
  }

  updateSpeech(dt) {
    if (!this.speech.active) return;
    const dtMs = dt * 1000;

    if (this.speech.pauseLeftMs > 0) {
      this.speech.pauseLeftMs -= dtMs;
      return;
    }

    this.speech.elapsedMs += dtMs;
    const t = this.speech.elapsedMs;
    const tl = this.speech.timeline;
    const full = this.speech.fullText || '';

    const totalMs = tl?.durationMs || Math.max(1200, full.length * 36);
    let visibleChars = full.length;

    if (tl?.chars && tl.chars.length > 0) {
      let count = 0;
      for (let i = 0; i < tl.chars.length; i++) {
        if (tl.chars[i].tMs <= t) count = i + 1;
        else break;
      }
      visibleChars = count;
    } else {
      visibleChars = Math.min(full.length, Math.floor((t / totalMs) * full.length));
    }

    const subEl = document.getElementById('subtitleText');
    if (subEl) subEl.textContent = full.slice(0, visibleChars);

    // Viseme frame lookup
    let open = 0;
    let wide = 0;
    if (t < totalMs) {
      if (tl?.frames && tl.frames.length > 0) {
        let f = tl.frames[0];
        for (let i = 0; i < tl.frames.length; i++) {
          if (tl.frames[i].tMs <= t) f = tl.frames[i];
          else break;
        }
        open = f.open ?? 0;
        wide = f.wide ?? 0;
      } else {
        const ch = full[Math.max(0, visibleChars - 1)]?.toLowerCase() || ' ';
        if ('aeıioöuü'.includes(ch)) {
          open = 'aou'.includes(ch) ? 0.85 : 0.55;
          wide = 'eiü'.includes(ch) ? 0.5 : -0.15;
        } else if (ch !== ' ' && ch !== '.' && ch !== ',') {
          open = 0.22;
        }
      }
      this.sceneRenderer.setSpeechFrame(open, wide, this.speech.emotion, this.speech.gazeShift);
    } else {
      this.speech.active = false;
      this.sceneRenderer.setSpeechFrame(0, 0, this.speech.emotion, 0);
    }
  }

  /* ================== DEDEKTİF DEFTERİ & ÇELİŞKİ ================== */
  openNotebookModal() {
    this.selectedStmtIds = [];
    this.renderNotebookBody();
    document.getElementById('notebookModal')?.classList.remove('hidden');
  }

  renderNotebookBody() {
    const body = document.getElementById('notebookBody');
    const pairBar = document.getElementById('contradictionPairBar');
    const statusTxt = document.getElementById('contradictionStatusText');
    const testBtn = document.getElementById('btnTestContradiction');
    body.innerHTML = '';

    if (this.activeNotebookTab === 'statements') {
      pairBar?.classList.remove('hidden');
      if (testBtn) testBtn.disabled = this.selectedStmtIds.length !== 2;
      if (statusTxt) {
        statusTxt.textContent = this.selectedStmtIds.length === 0
          ? 'Çelişki yakalamak için defterden 2 ifadeye dokun.'
          : `Seçilen ifade: ${this.selectedStmtIds.length} / 2`;
      }

      const stmts = [...(this.session.statements || [])].reverse();
      if (stmts.length === 0) {
        body.innerHTML = `<p class="hint-note">Henüz kayıtlı bir sorgu ifadesi yok. Kasabalıları sorguya çağırarak ifadelerini topla.</p>`;
        return;
      }

      for (const st of stmts) {
        const speaker = getPersonById(st.speakerId);
        const selected = this.selectedStmtIds.includes(st.id);
        const row = document.createElement('div');
        row.className = `stmt-row ${selected ? 'selected-stmt' : ''}`;
        row.innerHTML = `
          <div class="stmt-meta">${speaker ? speaker.name : st.speakerId} — Cinayet Günü ${st.murderDay || st.day} (Döngü ${st.loop || 1})</div>
          <div class="stmt-text">"${st.text}"</div>
        `;
        row.addEventListener('click', () => {
          sfx.play('click', 0.38);
          if (selected) {
            this.selectedStmtIds = this.selectedStmtIds.filter((x) => x !== st.id);
          } else {
            if (this.selectedStmtIds.length >= 2) this.selectedStmtIds.shift();
            this.selectedStmtIds.push(st.id);
          }
          this.renderNotebookBody();
        });
        body.appendChild(row);
      }
    } else if (this.activeNotebookTab === 'clues') {
      pairBar?.classList.add('hidden');
      if (this.session.discoveredClues.length === 0) {
        body.innerHTML = `<p class="hint-note">Henüz olay yeri fotoğraflarından hiçbir fiziksel iz kaydedilmedi.</p>`;
        return;
      }
      for (const c of this.session.discoveredClues) {
        const def = getClueTypeById(c.clueTypeId);
        const loc = getLocationById(c.locationId);
        const row = document.createElement('div');
        row.className = 'clue-card';
        row.innerHTML = `
          <img src="${def?.sprite || ''}" alt="" />
          <div>
            <strong>Gün ${c.murderDay} (${loc?.name || c.locationId}) — ${def?.name || c.clueTypeId}</strong>
            <div class="hint-note">${def?.shortDesc || ''}</div>
          </div>
        `;
        body.appendChild(row);
      }
    } else {
      pairBar?.classList.add('hidden');
      if ((this.session.contradictions || []).length === 0) {
        body.innerHTML = `<p class="hint-note">Henüz yakalanmış bir çelişki yok. İfadeler sekmesinde çelişen iki ifadeyi karşılaştır.</p>`;
        return;
      }
      for (const ct of this.session.contradictions) {
        const row = document.createElement('div');
        row.className = 'stmt-row';
        row.innerHTML = `
          <div class="stmt-meta">YAKALANAN ÇELİŞKİ (Gün ${ct.murderDay || '?'})</div>
          <div class="stmt-text">${ct.summaryText || ct.reasonText || 'İki ifade birbiriyle çelişiyor.'}</div>
        `;
        body.appendChild(row);
      }
    }
  }

  /* ================== GÜN SONU & 7. GÜN KARARI ================== */
  handleEndDayOrDecision() {
    if (this.session.day < GAME_CONFIG.totalDays) {
      this.session.day += 1;
      this.session.summonsLeft = this.session.dailySummonLimit;
      this.session.currentSuspectId = null;
      saveSession(this.session);

      this.speech.active = false;
      this.sceneRenderer.dismissSuspect();
      document.getElementById('interrogationHud')?.classList.add('hidden');
      this.refreshHud();

      const newMurder = this.caseData.murders[this.session.day - 1];
      const victim = getPersonById(newMurder.victimId);
      const loc = getLocationById(newMurder.locationId);
      this.showToast(`Gece yeni bir cinayet işlendi: ${victim?.name || ''} (${loc?.name || ''}). Fotoğraf masada!`);
    } else {
      document.getElementById('day7DecisionModal')?.classList.remove('hidden');
    }
  }

  /* ================== SON HÜKÜM & 3 AŞAMALI SON SAHNELERİ ================== */
  openVerdictModal() {
    this.verdictSelectedIds.clear();
    // Pre-fill from player's 'killer' marks (up to 7)
    for (const p of TOWNSPEOPLE) {
      if (this.session.suspectMarks[p.id] === 'killer' && this.verdictSelectedIds.size < 7) {
        this.verdictSelectedIds.add(p.id);
      }
    }
    this.renderVerdictGrid();
    document.getElementById('verdictModal')?.classList.remove('hidden');
  }

  renderVerdictGrid() {
    const grid = document.getElementById('verdictSuspectGrid');
    const countEl = document.getElementById('verdictCount');
    const confirmBtn = document.getElementById('btnConfirmVerdict');
    grid.innerHTML = '';

    if (countEl) countEl.textContent = String(this.verdictSelectedIds.size);
    if (confirmBtn) confirmBtn.disabled = this.verdictSelectedIds.size !== 7;

    for (const p of TOWNSPEOPLE) {
      const alive = this.isPersonAlive(p.id, 7);
      const picked = this.verdictSelectedIds.has(p.id);
      const card = document.createElement('div');
      card.className = `suspect-card ${alive ? '' : 'dead-card'} ${picked ? 'selected-verdict' : ''}`;
      card.innerHTML = `
        ${picked ? '<span class="tag-ribbon tag-killer">HÜKÜM SEÇİLDİ</span>' : ''}
        <img src="${p.sprite}" alt="${p.name}" />
        <div class="suspect-card-name">${p.name}</div>
        <div class="suspect-card-role">${alive ? p.title : `${p.title} (Maktul)`}</div>
      `;
      if (alive) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          sfx.play('click', 0.42);
          if (this.verdictSelectedIds.has(p.id)) {
            this.verdictSelectedIds.delete(p.id);
          } else if (this.verdictSelectedIds.size < 7) {
            this.verdictSelectedIds.add(p.id);
          } else {
            this.showToast('En fazla 7 kişi seçebilirsin. Değiştirmek için önce bir seçimi kaldır.');
          }
          this.renderVerdictGrid();
        });
      }
      grid.appendChild(card);
    }
  }

  startEndingSequence(chosenIds) {
    const killerSet = new Set(this.caseData.killerIds);
    let correct = 0;
    for (const id of chosenIds) {
      if (killerSet.has(id)) correct += 1;
    }

    this.endingFlow = {
      stage: 'loss',
      chosenIds,
      lossIndex: 0,
      correctCount: correct
    };

    document.getElementById('endingOverlay')?.classList.remove('hidden');
    document.getElementById('endingCanvas')?.classList.remove('hidden');
    document.getElementById('endingTruthTable')?.classList.add('hidden');
    this.renderCurrentEndingStep();
  }

  renderCurrentEndingStep() {
    const f = this.endingFlow;
    const headerEl = document.getElementById('endingHeader');
    const narEl = document.getElementById('endingNarrative');
    const nextLbl = document.getElementById('lblEndingNext');
    const truthBox = document.getElementById('endingTruthTable');
    const canvasEl = document.getElementById('endingCanvas');

    if (f.stage === 'loss') {
      const pid = f.chosenIds[f.lossIndex];
      const person = getPersonById(pid);
      const isKiller = this.caseData.killerIds.includes(pid);
      const killerMurder = this.caseData.murders.find((m) => m.killerId === pid) || null;

      headerEl.textContent = `KAYIP SAHNESİ (${f.lossIndex + 1} / 7) — ${person.name.toUpperCase()}`;
      this.endingRenderer.renderLossScene(person, isKiller, killerMurder);

      narEl.textContent = isKiller
        ? `${person.lossScene?.killerSummary || `${person.name} götürüldükten sonra geride kalan sessiz odada kimsenin fark etmediği karanlık bir iz parlıyordu.`} ${person.lossScene?.hiddenEvidenceText || ''}`
        : `${person.lossScene?.innocentSummary || `${person.name} götürüldü. Ardında yalnızca sessizlik ve kimsenin dolduramayacağı bir boşluk kaldı.`}`;

      nextLbl.textContent = f.lossIndex < 6 ? `SONRAKİ KAYIP SAHNESİ (${f.lossIndex + 2}/7) →` : `PENCEREYE YÜRÜ →`;
    } else if (f.stage === 'window') {
      headerEl.textContent = `PENCERE SAHNESİ — KASABANIN YANKISI`;
      this.endingRenderer.renderWindowCrowdScene(f.correctCount, 7);

      if (f.correctCount === 7) {
        narEl.textContent = `Solundaki pencereye yürüdün ve aşağı baktın. Sisli meydanda kasabalılar sessiz fenerlerle toplanmış, ilk kez korkmadan yukarı bakıyor. Kasabanın üstündeki karabasan dağıldı.`;
      } else if (f.correctCount === 0) {
        narEl.textContent = `Pencereye yaklaştığın anda cama çarpan bir taş camı çatlatıyor! Aşağıda meşaleler ve tırpanlarla toplanmış öfkeli kalabalık haykırıyor; masumların bedeli ve dışarıda kalan katillerin gölgesi kasabayı ateşe verdi.`;
      } else {
        narEl.textContent = `Pencereden aşağı baktığında meydanın ikiye bölündüğünü görüyorsun (${f.correctCount} doğru, ${7 - f.correctCount} yanlış hüküm). Bir yanda fener tutanlar, diğer yanda öfkeyle meşale ve tırpan sallayanlar... Camda ince bir çatlak uzanıyor.`;
      }
      nextLbl.textContent = `GERÇEĞİN AÇIKLANMASI →`;
    } else if (f.stage === 'truth') {
      headerEl.textContent = `GERÇEĞİN AÇIKLANMASI — YAKALANANLAR: ${f.correctCount} / 7`;
      canvasEl?.classList.add('hidden');
      truthBox?.classList.remove('hidden');
      truthBox.innerHTML = '';

      narEl.textContent = f.correctCount === 7
        ? `Yedi katilin tamamını eksiksiz ortaya çıkardın. Hiçbir masum yanmadı.`
        : `${7 - f.correctCount} gerçek katil karanlıkta izini kaybettirdi ve kasabanın kaderini değiştirdi:`;

      for (const m of this.caseData.murders) {
        const killer = getPersonById(m.killerId);
        const victim = getPersonById(m.victimId);
        const loc = getLocationById(m.locationId);
        const caught = f.chosenIds.includes(m.killerId);

        const div = document.createElement('div');
        div.className = `truth-row ${caught ? 'caught-killer' : ''}`;
        div.innerHTML = `
          <strong>Gün ${m.day} (${loc?.name || m.locationId}) — Maktul: ${victim?.name || m.victimId}</strong><br/>
          Gerçek Katil: <strong>${killer?.name || m.killerId}</strong> —
          ${caught ? '<span style="color:#7ec98b">YAKALANDI</span>' : '<span style="color:#e06a64">KAÇTI! Kasabada karanlık izini sürdürdü.</span>'}
          <div class="hint-note">${m.storyCore?.motiveText || ''}</div>
        `;
        truthBox.appendChild(div);
      }

      nextLbl.textContent = `YENİ KASABA VAKASINA BAŞLA`;
    }
  }

  advanceEndingSequence() {
    const f = this.endingFlow;
    if (f.stage === 'loss') {
      if (f.lossIndex < 6) {
        f.lossIndex += 1;
        this.renderCurrentEndingStep();
      } else {
        f.stage = 'window';
        this.renderCurrentEndingStep();
      }
    } else if (f.stage === 'window') {
      f.stage = 'truth';
      this.renderCurrentEndingStep();
    } else {
      document.getElementById('endingOverlay')?.classList.add('hidden');
      this.startFreshSeed(this.randomSeedCode());
    }
  }

  showToast(msg) {
    const el = document.getElementById('toastBanner');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.add('hidden'), 3600);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameController();
  window.jawkGame = game;
  game.init();
});
