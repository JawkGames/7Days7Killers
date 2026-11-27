// Dedektif Defteri, Çelişki Eşleştirme, Rewind Kalıcılığı ve Kayıt Yönetimi

import { getPersonById } from '../data/townspeople.js';
import { getLocationById } from '../data/locations.js';

export const SAVE_KEY = 'jawk_7d7k_save_v1';
export const SAVE_VERSION = 1;

export function createGameSession(seedInput, dailySummonLimit = 4) {
  return {
    version: SAVE_VERSION,
    seedInput: String(seedInput),
    day: 1,
    loopCount: 1,
    summonsLeft: dailySummonLimit,
    dailySummonLimit,
    currentSuspectId: null,
    protectedByDay: {},
    inspectedPhotos: {},
    discoveredClues: [],
    statements: [],
    contradictions: [],
    suspectMarks: {},
    askedKeys: {},
    phase: 'desk'
  };
}

export function getPhotoClueUid(murderDay, photoClue) {
  return photoClue.id || `d${murderDay}_c${photoClue.index ?? photoClue.hotspotIndex ?? 0}`;
}

export function discoverPhotoClue(session, murderDay, photoClue, locationObj, clueTypeObj) {
  const uid = getPhotoClueUid(murderDay, photoClue);
  const existing = session.discoveredClues.find((c) => c.id === uid);
  if (existing) {
    return { added: false, entry: existing };
  }

  const entry = {
    id: uid,
    murderDay,
    index: photoClue.index ?? 0,
    clueTypeId: photoClue.clueTypeId,
    locationId: locationObj?.id || '',
    label: clueTypeObj?.name || photoClue.label || photoClue.clueTypeId,
    linkedPersonId: photoClue.linkedPersonId || photoClue.redHerringOwnerId || null,
    isRedHerring: Boolean(photoClue.isRedHerring),
    inspectionText: photoClue.inspectionText || ''
  };
  session.discoveredClues.push(entry);
  return { added: true, entry };
}

export function recordStatement(session, stmtInput) {
  const id = stmtInput.id || `st_L${session.loopCount}_d${session.day}_${session.statements.length + 1}`;
  const existingIdx = session.statements.findIndex(
    (s) =>
      s.loop === session.loopCount &&
      s.speakerId === stmtInput.speakerId &&
      s.murderDay === stmtInput.murderDay &&
      s.kind === stmtInput.kind &&
      s.refClueTypeId === (stmtInput.refClueTypeId || null) &&
      s.subjectId === (stmtInput.subjectId || null)
  );

  const entry = {
    id: existingIdx >= 0 ? session.statements[existingIdx].id : id,
    loop: session.loopCount,
    day: session.day,
    murderDay: stmtInput.murderDay || session.day,
    speakerId: stmtInput.speakerId,
    kind: stmtInput.kind, // 'alibi_claim' | 'alibi_disprove' | 'saw_killer' | 'clue_defense' | 'stolen_notice' | 'argument' | 'cover_alibi' | 'confession_crack'
    claimedLocId: stmtInput.claimedLocId || null,
    subjectId: stmtInput.subjectId || null,
    refClueTypeId: stmtInput.refClueTypeId || null,
    isLie: Boolean(stmtInput.isLie),
    text: stmtInput.text
  };

  if (existingIdx >= 0) {
    session.statements[existingIdx] = entry;
  } else {
    session.statements.push(entry);
  }
  return entry;
}

export function checkAndLinkContradiction(session, stmtIdA, stmtIdB, caseData) {
  const a = session.statements.find((s) => s.id === stmtIdA);
  const b = session.statements.find((s) => s.id === stmtIdB);
  if (!a || !b || a.id === b.id) {
    return { matched: false, reasonText: 'Karşılaştırmak için iki farklı ifade seçmelisin.' };
  }

  if (a.murderDay !== b.murderDay) {
    return {
      matched: false,
      reasonText: `Bu iki ifade farklı gecelere ait (Gün ${a.murderDay} ve Gün ${b.murderDay}). Aynı cinayet gününe ait ifadeleri eşleştir.`
    };
  }

  const mDay = a.murderDay;
  const pair = [a, b];

  // Durum 1: Şüpheli X sahte alibi verdi ("fakeLoc'taydım"), Tanık Y ise "X o gece fakeLoc'a hiç uğramadı" dedi
  const alibiClaim = pair.find((s) => s.kind === 'alibi_claim' || s.kind === 'cover_alibi');
  const disproveStmt = pair.find((s) => s.kind === 'alibi_disprove');
  if (alibiClaim && disproveStmt) {
    const targetSuspectId = alibiClaim.kind === 'alibi_claim' ? alibiClaim.speakerId : alibiClaim.subjectId;
    if (disproveStmt.subjectId === targetSuspectId && alibiClaim.claimedLocId === disproveStmt.claimedLocId) {
      return registerContradiction(session, mDay, targetSuspectId, a, b, 'alibi_disproved');
    }
  }

  // Durum 2: Şüpheli X başka bir mekânda olduğunu iddia etti ("alibi_claim"), Tanık Z ise onu cinayet mahallinden çıkarken gördü ("saw_killer")
  const sawScene = pair.find((s) => s.kind === 'saw_killer');
  if (alibiClaim && sawScene) {
    const targetSuspectId = alibiClaim.kind === 'alibi_claim' ? alibiClaim.speakerId : alibiClaim.subjectId;
    if (sawScene.subjectId === targetSuspectId && alibiClaim.claimedLocId !== sawScene.claimedLocId) {
      return registerContradiction(session, mDay, targetSuspectId, a, b, 'seen_at_crime_scene');
    }
  }

  // Durum 3: Suç ortağı / sadık yakın X için yalan şahitlik yaptı, ancak tanık onun da orada olmadığını kanıtladı
  if (a.kind === 'alibi_claim' && b.kind === 'alibi_claim' && caseData) {
    const murder = caseData.murders?.[mDay - 1];
    if (murder && (a.speakerId === murder.killerId || b.speakerId === murder.killerId)) {
      const killerStmt = a.speakerId === murder.killerId ? a : b;
      const otherStmt = killerStmt === a ? b : a;
      if (otherStmt.claimedLocId === killerStmt.claimedLocId && !otherStmt.isLie) {
        const realGece = caseData.schedule?.[mDay]?.gece || {};
        if (realGece[killerStmt.speakerId] !== killerStmt.claimedLocId) {
          return registerContradiction(session, mDay, killerStmt.speakerId, a, b, 'schedule_mismatch');
        }
      }
    }
  }

  return {
    matched: false,
    reasonText: 'Bu iki ifade birbirini doğrudan çürütmüyor. Şüphelinin gece nerede olduğu iddiasıyla o mekândaki tanık ifadelerini karşılaştır.'
  };
}

function registerContradiction(session, murderDay, targetSuspectId, stmtA, stmtB, conflictType) {
  const cid = `ct_d${murderDay}_${targetSuspectId}`;
  const existing = session.contradictions.find((c) => c.id === cid);
  const suspect = getPersonById(targetSuspectId);
  const witnessId = stmtA.speakerId === targetSuspectId ? stmtB.speakerId : stmtA.speakerId;
  const witness = getPersonById(witnessId);
  const loc = getLocationById(stmtA.claimedLocId || stmtB.claimedLocId);

  const summaryText =
    conflictType === 'seen_at_crime_scene'
      ? `${suspect?.name || targetSuspectId} cinayet gecesi başka yerde olduğunu iddia etti, fakat ${witness?.name || witnessId} onu olay yerinden çıkarken gördü!`
      : `${suspect?.name || targetSuspectId} Gün ${murderDay} gecesi ${loc?.locative || 'orada'} olduğunu söyledi, fakat ${witness?.name || witnessId} onun bütün gece oraya hiç uğramadığını doğruladı!`;

  if (existing) {
    return { matched: true, contradiction: existing, reasonText: summaryText };
  }

  const contradiction = {
    id: cid,
    murderDay,
    targetSuspectId,
    witnessId,
    conflictType,
    stmtAId: stmtA.id,
    stmtBId: stmtB.id,
    summaryText
  };
  session.contradictions.push(contradiction);
  return { matched: true, contradiction, reasonText: summaryText };
}

export function toggleSuspectMark(session, personId, mark) {
  if (!mark || mark === 'unsure') {
    delete session.suspectMarks[personId];
  } else {
    session.suspectMarks[personId] = mark;
  }
}

export function setNightProtection(session, dayForNextNight, personId) {
  if (!session.protectedByDay) session.protectedByDay = {};
  if (!personId) {
    delete session.protectedByDay[dayForNextNight];
  } else {
    session.protectedByDay[dayForNextNight] = personId;
  }
}

export function performRewind(session) {
  session.loopCount = (session.loopCount || 1) + 1;
  session.day = 1;
  session.summonsLeft = session.dailySummonLimit;
  session.currentSuspectId = null;
  session.phase = 'desk';
  // Defter (discoveredClues, statements, contradictions, suspectMarks) ve koruma kararları saklanır!
  session.askedKeys = {};
  return session;
}

export function saveSession(session) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(session));
  } catch {
    // Depolama doluysa sessiz geç
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SAVE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Sessiz geç
  }
}
