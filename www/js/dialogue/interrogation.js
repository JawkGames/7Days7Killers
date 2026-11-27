// Sorgu Soru Üretimi, Yalan/Kişilik Yanıt Motoru ve Ağız Harf Çizelgesi (Viseme)

import { getPersonById } from '../data/townspeople.js';
import { getLocationById, getClueTypeById } from '../data/locations.js';
import { getToneProfile } from '../lang/tr.js';
import { recordStatement } from '../state/notebook.js';

const VOWEL_SHAPES = {
  a: [0.92, 0.25],
  e: [0.64, 0.55],
  ı: [0.42, 0.35],
  i: [0.46, 0.62],
  o: [0.82, -0.25],
  ö: [0.68, -0.20],
  u: [0.52, -0.32],
  ü: [0.48, -0.26]
};

export function buildVisemeTimeline(text) {
  const clean = String(text || '');
  const chars = [];
  const frames = [];
  let tMs = 0;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const low = ch.toLowerCase();
    chars.push({ ch, tMs });

    let step = 34;
    let open = 0.08;
    let wide = 0;

    if (VOWEL_SHAPES[low]) {
      [open, wide] = VOWEL_SHAPES[low];
      step = 40;
    } else if (ch === ' ') {
      open = 0.04;
      step = 26;
    } else if (ch === ',' || ch === ';') {
      open = 0;
      step = 135;
    } else if (ch === '.' || ch === '!' || ch === '?' || ch === '…') {
      open = 0;
      step = 195;
    } else if ('mbp'.includes(low)) {
      open = 0.0;
      wide = 0.08;
      step = 34;
    } else {
      open = 0.24;
      wide = 0.1;
      step = 32;
    }

    frames.push({ tMs, open, wide });
    tMs += step;
  }

  frames.push({ tMs, open: 0, wide: 0 });
  return { durationMs: Math.max(900, tMs), chars, frames };
}

export function getAvailableQuestions(caseData, session, suspectId) {
  const suspect = getPersonById(suspectId);
  if (!suspect || !caseData) return [];

  const upToDay = session.day;
  const questions = [];

  // 1) Yakalanmış Çelişki / Yüzleştirme Soruları (En üstte vurgulu)
  for (const ct of session.contradictions || []) {
    if (ct.targetSuspectId === suspectId && ct.murderDay <= upToDay) {
      const qKey = `confront_${ct.id}`;
      questions.push({
        key: qKey,
        type: 'contradiction',
        murderDay: ct.murderDay,
        contradictionId: ct.id,
        asked: Boolean(session.askedKeys[qKey]),
        label: `⚖ YÜZLEŞTİR (Gün ${ct.murderDay}): Tanıklar alibini çürüttü! Gerçeği söyle!`
      });
    }
  }

  // 2) O güne kadarki cinayet geceleri için "Neredeydin?" alibi soruları
  for (let d = upToDay; d >= 1; d--) {
    const m = caseData.murders[d - 1];
    const loc = getLocationById(m.locationId);
    const qKey = `alibi_${suspectId}_d${d}`;
    questions.push({
      key: qKey,
      type: 'alibi',
      murderDay: d,
      asked: Boolean(session.askedKeys[qKey]),
      label: `Gün ${d} gecesi (${loc?.name || ''} cinayeti) neredeydin?`
    });
  }

  // 3) Tanıklık / Gözlem soruları ("Gördüğün şüpheli bir şey oldu mu?")
  for (let d = upToDay; d >= 1; d--) {
    const hasWitnessEvent = (caseData.murders[d - 1]?.witnessEvents || []).some(
      (we) => we.witnessId === suspectId
    );
    if (hasWitnessEvent || d === upToDay) {
      const qKey = `witness_${suspectId}_d${d}`;
      questions.push({
        key: qKey,
        type: 'witness',
        murderDay: d,
        asked: Boolean(session.askedKeys[qKey]),
        label: `Gün ${d} günü ve gecesi olağandışı kimi ya da neyi gördün?`
      });
    }
  }

  // 4) Defterdeki bulunan fiziksel izleri sorma
  for (const clueEntry of session.discoveredClues || []) {
    if (clueEntry.murderDay > upToDay) continue;
    const clueDef = getClueTypeById(clueEntry.clueTypeId);
    const murder = caseData.murders[clueEntry.murderDay - 1];
    const loc = getLocationById(murder.locationId);
    const ownsType = suspect.clues?.includes(clueEntry.clueTypeId);
    const directlyLinked = clueEntry.linkedPersonId === suspectId;
    const witnessedClue = (murder.witnessEvents || []).some(
      (we) => we.witnessId === suspectId && we.clueTypeId === clueEntry.clueTypeId
    );

    if (ownsType || directlyLinked || witnessedClue) {
      const qKey = `clue_${suspectId}_${clueEntry.id}`;
      questions.push({
        key: qKey,
        type: 'clue',
        murderDay: clueEntry.murderDay,
        clueEntry,
        asked: Boolean(session.askedKeys[qKey]),
        label: `🔎 Gün ${clueEntry.murderDay} (${loc?.name || ''}) fotoğrafındaki ${clueDef?.name || clueEntry.label} hakkında ne biliyorsun?`
      });
    }
  }

  // 5) Kişisel sır ve kasaba ilişkileri sorusu
  const secretKey = `secret_${suspectId}`;
  questions.push({
    key: secretKey,
    type: 'relations',
    murderDay: upToDay,
    asked: Boolean(session.askedKeys[secretKey]),
    label: `Kasabada kimlerle husumetin ya da gizlediğin bir hesabın var?`
  });

  // Sorulmamışları ve yüzleştirmeleri öne sırala, kalabalığı 8 seçenekle sınırla
  questions.sort((a, b) => {
    if (a.type === 'contradiction' && b.type !== 'contradiction') return -1;
    if (b.type === 'contradiction' && a.type !== 'contradiction') return 1;
    if (a.asked !== b.asked) return a.asked ? 1 : -1;
    return 0;
  });

  return questions.slice(0, 8);
}

export function answerQuestion(caseData, session, suspectId, question) {
  const suspect = getPersonById(suspectId);
  const tone = getToneProfile(suspect.personality);
  const d = question.murderDay || session.day;
  const murder = caseData.murders[d - 1];

  session.askedKeys[question.key] = true;

  let text = '';
  let emotion = tone.defaultEmotion;
  let gazeShift = 0;
  let pauseMs = 140;
  let recorded = null;

  // 1) YÜZLEŞTİRME (Çelişki yakalandığında katilin savunması çatırdar!)
  if (question.type === 'contradiction') {
    emotion = 'nervous';
    gazeShift = -0.35;
    pauseMs = 420;
    text = tone.cracked(murder.storyCore?.title || 'eski hesap');
    recorded = recordStatement(session, {
      speakerId: suspectId,
      murderDay: d,
      kind: 'confession_crack',
      claimedLocId: murder.locationId,
      subjectId: murder.victimId,
      isLie: false,
      text
    });
  }
  // 2) ALİBİ SORUSU ("Gün X gecesi neredeydin?")
  else if (question.type === 'alibi') {
    if (murder.killerId === suspectId) {
      // Bu gecenin katili sahte mekân söyler!
      const fakeLoc = getLocationById(murder.fakeAlibiLocationId);
      text = tone.alibiLie(fakeLoc);
      emotion = suspect.personality === 'sogukkanli' ? 'neutral' : 'defensive';
      gazeShift = 0.28;
      pauseMs = 260;
      recorded = recordStatement(session, {
        speakerId: suspectId,
        murderDay: d,
        kind: 'alibi_claim',
        claimedLocId: murder.fakeAlibiLocationId,
        subjectId: suspectId,
        isLie: true,
        text
      });
    } else {
      // Masum (veya başka gecenin katili) o gece gerçekten bulunduğu mekânı ve yanındakini söyler
      const realLocId = caseData.schedule?.[d]?.gece?.[suspectId] || suspect.workLoc;
      const realLoc = getLocationById(realLocId);
      const geceMap = caseData.schedule?.[d]?.gece || {};
      const partnerId = Object.keys(geceMap).find(
        (pid) => pid !== suspectId && pid !== murder.victimId && geceMap[pid] === realLocId
      );
      const partner = partnerId ? getPersonById(partnerId) : { name: 'komşular', comitative: 'komşularla' };

      // Eğer katilin yakın ortağıysa ek olarak katili koruyan muğlak bir cümle de ekleyebilir
      if (murder.accompliceId === suspectId) {
        const killer = getPersonById(murder.killerId);
        const fakeLoc = getLocationById(murder.fakeAlibiLocationId);
        text = `${tone.alibiTruth(realLoc, partner)} Hem ${killer.name} de o gece ${fakeLoc.locative} civarındaydı diye duydum, üstüne gitmeyin.`;
        emotion = 'defensive';
        gazeShift = 0.22;
      } else {
        text = tone.alibiTruth(realLoc, partner);
        // Masumlar da korkaksa gerilir (PLAN.md kuralı: gerginlik tek başına kanıt değildir!)
        if (suspect.personality === 'korkak') {
          emotion = 'nervous';
          gazeShift = -0.2;
        }
      }

      recorded = recordStatement(session, {
        speakerId: suspectId,
        murderDay: d,
        kind: 'alibi_claim',
        claimedLocId: realLocId,
        subjectId: suspectId,
        isLie: false,
        text
      });
    }
  }
  // 3) TANIKLIK SORUSU ("Gün X'te kimi/neyi gördün?")
  else if (question.type === 'witness') {
    const myEvents = (murder.witnessEvents || []).filter((we) => we.witnessId === suspectId);
    if (myEvents.length > 0) {
      // En kritik tanıklığı öncelikle paylaş ve deftere yapılandırılmış kaydet
      const primary = myEvents[0];
      // Konuşmacı ön ekini temizle ("İsim: \"...\"" -> doğrudan konuşma)
      text = primary.statementText.replace(/^[^:]+:\s*"?|"?$/g, '');

      if (myEvents.length > 1 && suspect.personality === 'dedikoducu') {
        const extra = myEvents[1].statementText.replace(/^[^:]+:\s*"?|"?$/g, '');
        text += ` Üstelik bir şey daha var: ${extra}`;
      }

      let stmtKind = 'argument';
      let claimedLoc = primary.locationId;
      if (primary.type === 'alibi_disprove_killer_lie') stmtKind = 'alibi_disprove';
      else if (primary.type === 'saw_killer_near_scene') stmtKind = 'saw_killer';
      else if (primary.type === 'stolen_item_notice') stmtKind = 'stolen_notice';
      else if (primary.type === 'alibi_confirm' || primary.type === 'saw_red_herring_flee') stmtKind = 'clue_defense';

      recorded = recordStatement(session, {
        speakerId: suspectId,
        murderDay: d,
        kind: stmtKind,
        claimedLocId: claimedLoc,
        subjectId: primary.subjectId,
        refClueTypeId: primary.clueTypeId || null,
        isLie: false,
        text
      });
    } else {
      const realLocId = caseData.schedule?.[d]?.gece?.[suspectId] || suspect.workLoc;
      const realLoc = getLocationById(realLocId);
      const killerAtFake = murder.fakeAlibiLocationId === realLocId && murder.killerId !== suspectId;

      if (killerAtFake) {
        const killer = getPersonById(murder.killerId);
        text = `Bütün gece ${realLoc.locative} oturdum. Eğer ${killer.name} o gece yanımızda olduğunu iddia ediyorsa yalan söylüyor; kapıdan içeri adımını bile atmadı!`;
        recorded = recordStatement(session, {
          speakerId: suspectId,
          murderDay: d,
          kind: 'alibi_disprove',
          claimedLocId: realLocId,
          subjectId: murder.killerId,
          isLie: false,
          text
        });
      } else {
        text = `O gece sis o kadar yoğundu ki ${realLoc.locative} dışarıda kimin geçtiğini seçemedim Müfettiş.`;
      }
    }
  }
  // 4) FİZİKSEL İZ SORUSU
  else if (question.type === 'clue') {
    const ce = question.clueEntry;
    const clueDef = getClueTypeById(ce.clueTypeId);
    const fullPhotoClue = (murder.photoClues || []).find((pc) => pc.clueTypeId === ce.clueTypeId);
    const crimeLoc = getLocationById(murder.locationId);

    if (fullPhotoClue?.isRedHerring && fullPhotoClue.redHerringOwnerId === suspectId) {
      // Yanıltıcı izin masum sahibi gerçeği açıklar (doğrulanabilir masum açıklama!)
      emotion = 'nervous';
      pauseMs = 240;
      const witness = getPersonById(fullPhotoClue.refutationWitnessId);
      if (fullPhotoClue.innocentReason === 'fled_witness') {
        text = `Yemin ederim ben öldürmedim! Akşam karanlığı çökerken ${crimeLoc.dative} uğradığımda içeride bir karaltı üzerime yürüdü; can havliyle kaçarken ${clueDef.accusative} düşürdüm! ${witness ? witness.name + ' nefes nefese yanlarına sığındığımı gördü!' : ''}`;
      } else if (fullPhotoClue.innocentReason === 'stolen_tool') {
        text = `O ${clueDef.name.toLowerCase()} benim tezgâhımdan cinayetten önce çalındı! Daha olay gecesi gelmeden kaybolduğunu ${witness ? witness.dative : 'komşulara'} söylemiştim! Katil suçu üstüme yıkmak için kullanmış!`;
      } else {
        text = `Evet, ${clueDef.name.toLowerCase()} benim ama ${crimeLoc.dative} yalnızca gündüz iş için uğradığımda düşürmüşüm! Gece boyunca başka yerdeydim, ${witness ? witness.name + ' buna şahittir!' : ''}`;
      }
      recorded = recordStatement(session, {
        speakerId: suspectId,
        murderDay: d,
        kind: 'clue_defense',
        claimedLocId: murder.locationId,
        subjectId: suspectId,
        refClueTypeId: ce.clueTypeId,
        isLie: false,
        text
      });
    } else if (murder.killerId === suspectId) {
      // Gerçek katil izi inkâr eder / saptırır
      emotion = 'defensive';
      gazeShift = 0.3;
      text = tone.denyClue(clueDef || { name: ce.label });
      recorded = recordStatement(session, {
        speakerId: suspectId,
        murderDay: d,
        kind: 'clue_defense',
        claimedLocId: murder.locationId,
        subjectId: suspectId,
        refClueTypeId: ce.clueTypeId,
        isLie: true,
        text
      });
    } else {
      // Tanık bu izle ilgili bir şey biliyorsa anlatır
      const clueWe = (murder.witnessEvents || []).find(
        (we) => we.witnessId === suspectId && we.clueTypeId === ce.clueTypeId
      );
      if (clueWe) {
        text = clueWe.statementText.replace(/^[^:]+:\s*"?|"?$/g, '');
        recorded = recordStatement(session, {
          speakerId: suspectId,
          murderDay: d,
          kind: 'clue_defense',
          claimedLocId: clueWe.locationId,
          subjectId: clueWe.subjectId,
          refClueTypeId: ce.clueTypeId,
          isLie: false,
          text
        });
      } else {
        text = `${clueDef?.name || 'Bu eşya'} kasabada birkaç kişinin elinden geçmiştir Müfettiş; tek başına kimin bıraktığını bilemem.`;
      }
    }
  }
  // 5) KASABA İLİŞKİLERİ VE SIRLAR
  else {
    const rel = suspect.relations?.[0];
    const relTarget = rel ? getPersonById(rel.targetId) : null;
    emotion = suspect.personality === 'sogukkanli' ? 'neutral' : 'nervous';
    gazeShift = -0.18;
    text = `${rel ? `${relTarget?.name || ''} ile aramızdaki meseleyi kasabada bilmeyen yok: ${rel.note}` : ''} Hem herkesin sakladığı bir kusuru vardır... (${suspect.innocentSecret})`;
  }

  return {
    text,
    emotion,
    gazeShift,
    pauseMs,
    visemeTimeline: buildVisemeTimeline(text),
    statement: recorded
  };
}
