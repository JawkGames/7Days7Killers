// Pure deductive solver engine for 7 Days 7 Killers (no cheating: evaluates observable evidence only)

import { TOWNSPEOPLE, getPersonById } from '../data/townspeople.js';
import { getLocationById, getClueTypeById } from '../data/locations.js';

/**
 * Checks whether a person is alive on `day` (1..7) during daytime investigation.
 * Victims of day `d` are alive on days `1..(d-1)` and dead from day `d` onward.
 */
function isAliveForInvestigation(caseData, personId, day) {
  if (!personId) return false;
  if (caseData?.deathDayByPerson && Object.prototype.hasOwnProperty.call(caseData.deathDayByPerson, personId)) {
    return day < caseData.deathDayByPerson[personId];
  }
  const murders = caseData?.murders || [];
  for (const m of murders) {
    if (m.victimId === personId && m.day <= day) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether a person has a corroborated truthful alibi at a non-crime location on `day` `'gece'`.
 */
function hasCorroboratedNightAlibi(caseData, murder, personId) {
  const day = murder.day;
  const crimeLoc = murder.locationId;
  const actualNightMap = caseData?.schedule?.[day]?.gece || {};
  const claimedNightMap = caseData?.claimedSchedule?.[day]?.gece || actualNightMap;

  const claimedLoc = claimedNightMap[personId];
  const actualLoc = actualNightMap[personId];
  if (!claimedLoc || claimedLoc === crimeLoc) return false;
  if (actualLoc !== claimedLoc) return false;

  // Must have at least one other living, non-accomplice witness actually present at `claimedLoc`
  for (const other of TOWNSPEOPLE) {
    if (other.id === personId) continue;
    if (other.id === murder.accompliceId) continue;
    if (!isAliveForInvestigation(caseData, other.id, day)) continue;
    if (actualNightMap[other.id] === claimedLoc && claimedNightMap[other.id] === claimedLoc) {
      return true;
    }
  }
  return false;
}

/**
 * Deductively checks whether a red herring photo clue has >= 1 valid refutation path
 * backed by living witnesses and schedule/stolen-item records.
 */
function verifyRedHerringRefutation(caseData, murder, clue) {
  const day = murder.day;
  const crimeLoc = murder.locationId;
  const ownerId = clue.redHerringOwnerId || clue.linkedPersonId;
  const owner = getPersonById(ownerId);
  const clueMeta = getClueTypeById(clue.clueTypeId);

  if (!owner || !isAliveForInvestigation(caseData, ownerId, day)) {
    return { refuted: false, summary: 'Yanıltıcı ipucu sahibi sorgulanabilir durumda değil.', steps: 0 };
  }

  const events = Array.isArray(murder.witnessEvents) ? murder.witnessEvents : [];
  const daySchedule = caseData?.schedule?.[day] || {};

  // Path A: Fled witness — seen fleeing early by a living truthful witness + safe night presence
  const fleeWitnessEvent = events.find(
    (ev) =>
      ev.type === 'saw_red_herring_flee' &&
      ev.subjectId === ownerId &&
      ev.isTruthful !== false &&
      ev.witnessId !== ownerId &&
      isAliveForInvestigation(caseData, ev.witnessId, day)
  );
  if (fleeWitnessEvent && hasCorroboratedNightAlibi(caseData, murder, ownerId)) {
    const w = getPersonById(fleeWitnessEvent.witnessId);
    return {
      refuted: true,
      summary: `fled_witness: ${w ? w.name : fleeWitnessEvent.witnessId}, ${owner.genitive} panikle erken kaçtığını doğruladı ve gece alibisi teyit edildi.`,
      steps: 2
    };
  }

  // Path B: Stolen tool — reported missing on or before `day` with living witness + corroborated night alibi
  const stolenRecord = (caseData?.stolenItems || []).find(
    (st) =>
      st.ownerId === ownerId &&
      st.clueTypeId === clue.clueTypeId &&
      st.reportedDay <= day &&
      (!st.witnessId || isAliveForInvestigation(caseData, st.witnessId, day))
  );
  const stolenWitnessEvent = events.find(
    (ev) =>
      ev.type === 'stolen_item_notice' &&
      ev.subjectId === ownerId &&
      (!ev.clueTypeId || ev.clueTypeId === clue.clueTypeId) &&
      ev.isTruthful !== false &&
      ev.witnessId !== ownerId &&
      isAliveForInvestigation(caseData, ev.witnessId, day)
  );
  if ((stolenRecord || stolenWitnessEvent) && hasCorroboratedNightAlibi(caseData, murder, ownerId)) {
    return {
      refuted: true,
      summary: `stolen_tool: ${owner.genitive} ${clueMeta ? clueMeta.name.toLowerCase() : 'eşyası'} önceden çalındı ve gece başka yerde sağlam alibisi var.`,
      steps: 2
    };
  }

  // Path C: Daytime visit / passed earlier — visited `crimeLoc` in sabah/ikindi + corroborated night alibi elsewhere
  const visitedEarlier =
    daySchedule?.sabah?.[ownerId] === crimeLoc || daySchedule?.ikindi?.[ownerId] === crimeLoc;
  if (visitedEarlier && hasCorroboratedNightAlibi(caseData, murder, ownerId)) {
    return {
      refuted: true,
      summary: `daytime_visit: ${owner.name} olay yerine gündüz uğradı; cinayet gecesi başka mekanda doğrulanmış alibisi var.`,
      steps: 2
    };
  }

  return {
    refuted: false,
    summary: `unrefuted: ${owner.name} için geçerli çürütme zinciri bulunamadı.`,
    steps: 0
  };
}

/**
 * Purely deductively evaluates independent incriminating evidence chains against ANY suspect `candidateId`.
 * Does NOT check `candidateId === murder.killerId`.
 */
function evaluateSuspectChains(caseData, murder, candidateId, refutedRedHerringOwnersByClue) {
  const day = murder.day;
  const crimeLoc = murder.locationId;
  const candidate = getPersonById(candidateId);
  if (!candidate) return { chains: [], steps: 0 };

  const chains = [];
  let steps = 0;

  const events = Array.isArray(murder.witnessEvents) ? murder.witnessEvents : [];
  const actualNightMap = caseData?.schedule?.[day]?.gece || {};
  const claimedNightMap = caseData?.claimedSchedule?.[day]?.gece || actualNightMap;
  const corroboratedAlibi = hasCorroboratedNightAlibi(caseData, murder, candidateId);

  // Chain 1: Unrefuted physical trace clue matching candidate's items + lacks corroborated innocent alibi
  const matchingUnrefutedClue = (murder.photoClues || []).find((clue, idx) => {
    const refutedOwner = refutedRedHerringOwnersByClue.get(idx);
    if (refutedOwner === candidateId) return false;
    if (clue.isRedHerring && refutedOwner) return false;
    return Array.isArray(candidate.clues) && candidate.clues.includes(clue.clueTypeId);
  });

  if (matchingUnrefutedClue && !corroboratedAlibi) {
    const clueMeta = getClueTypeById(matchingUnrefutedClue.clueTypeId);
    chains.push(
      `physical_trace: Olay yerinde çürütülemeyen ${clueMeta ? clueMeta.name : matchingUnrefutedClue.clueTypeId} bulundu ve ${candidate.genitive} doğrulanmış gece alibisi yok.`
    );
    steps += 2;
  }

  // Chain 2: Credible living witness sighting placing candidate at/fleeing crime scene on `day` `'gece'`
  const sceneSighting = events.find(
    (ev) =>
      ev.type === 'saw_killer_near_scene' &&
      ev.subjectId === candidateId &&
      ev.isTruthful !== false &&
      ev.witnessId !== candidateId &&
      isAliveForInvestigation(caseData, ev.witnessId, day)
  );
  if (sceneSighting) {
    const w = getPersonById(sceneSighting.witnessId);
    const loc = getLocationById(crimeLoc);
    chains.push(
      `witness_sighting: ${w ? w.name : sceneSighting.witnessId}, cinayet gecesi ${candidate.accusative} ${loc ? loc.locative : crimeLoc} yakınında gördü.`
    );
    steps += 1;
  }

  // Chain 3: Alibi contradiction (claims `claimedLoc !== crimeLoc`, disproved by truthful witness at `claimedLoc`)
  const claimedLoc = claimedNightMap[candidateId];
  const actualLoc = actualNightMap[candidateId];
  if (claimedLoc && claimedLoc !== crimeLoc && actualLoc !== claimedLoc) {
    const disprovingWitnessEvent = events.find(
      (ev) =>
        ev.type === 'alibi_disprove_killer_lie' &&
        ev.subjectId === candidateId &&
        ev.isTruthful !== false &&
        ev.witnessId !== candidateId &&
        isAliveForInvestigation(caseData, ev.witnessId, day)
    );

    const scheduleTruthWitness = TOWNSPEOPLE.find(
      (p) =>
        p.id !== candidateId &&
        p.id !== murder.accompliceId &&
        isAliveForInvestigation(caseData, p.id, day) &&
        actualNightMap[p.id] === claimedLoc &&
        claimedNightMap[p.id] === claimedLoc
    );

    if (disprovingWitnessEvent || scheduleTruthWitness) {
      const wId = disprovingWitnessEvent ? disprovingWitnessEvent.witnessId : scheduleTruthWitness.id;
      const w = getPersonById(wId);
      const fakeLoc = getLocationById(claimedLoc);
      chains.push(
        `alibi_contradiction: ${candidate.name} gece ${fakeLoc ? fakeLoc.locative : claimedLoc} olduğunu iddia etti fakat ${w ? w.name : wId} bu yalanı çürüttü.`
      );
      steps += 2;
    }
  }

  // Chain 4: Conspiracy / blackmail note OR stolen-tool + bitter argument secondary chain
  const linkedConspiracy = (caseData?.conspiracies || []).find(
    (c) => c.id === murder.conspiracyId && Array.isArray(c.memberIds) && c.memberIds.includes(candidateId)
  );
  const hasBlackmailLink =
    murder.blackmailNote &&
    murder.blackmailNote.exists &&
    murder.blackmailNote.toId === candidateId;

  const secondaryMethodClue = (murder.photoClues || []).find(
    (c) =>
      !c.isRedHerring &&
      (c.role === 'method_or_motive_trace' ||
        (murder.storyCore?.preferredClueTypes || []).includes(c.clueTypeId))
  );

  const argumentWitness = events.find(
    (ev) =>
      ev.type === 'suspicious_argument' &&
      ev.subjectId === candidateId &&
      ev.secondaryPersonId === murder.victimId &&
      ev.isTruthful !== false &&
      ev.witnessId !== candidateId &&
      isAliveForInvestigation(caseData, ev.witnessId, day)
  );

  const thiefStolenRecord = (caseData?.stolenItems || []).find(
    (st) => st.thiefId === candidateId && st.reportedDay <= day
  );

  if (((hasBlackmailLink || linkedConspiracy) && (secondaryMethodClue || argumentWitness)) || (thiefStolenRecord && argumentWitness)) {
    chains.push(
      `conspiracy_motive: Şantaj/komplo bağı (${murder.storyCore ? murder.storyCore.title : 'gizli anlaşma'}) ve tanıklı husumet izi ${candidate.accusative} işaret ediyor.`
    );
    steps += 2;
  }

  return { chains, steps };
}

/**
 * Evaluates an entire 7-day generated case purely deductively.
 * @param {object} caseData
 */
export function solveCase(caseData) {
  const murders = Array.isArray(caseData?.murders) ? caseData.murders : [];
  const killerScores = {};
  const chainSummaries = [];
  let unrefutedRedHerrings = 0;
  let difficultySteps = 0;
  let allDaysValid = murders.length === 7;

  // Verify 7 distinct killers and no killer dies as a victim
  const killerSet = new Set(murders.map((m) => m.killerId));
  const victimSet = new Set(murders.map((m) => m.victimId));
  if (killerSet.size !== 7 || victimSet.size !== 7) {
    allDaysValid = false;
  }
  for (const kId of killerSet) {
    if (victimSet.has(kId)) {
      allDaysValid = false;
    }
  }

  for (const murder of murders) {
    const day = murder.day;
    const photoClues = Array.isArray(murder.photoClues) ? murder.photoClues : [];
    if (photoClues.length < 3) {
      allDaysValid = false;
    }

    // Verify all witnessEvents on this murder belong to witnesses alive on `day`
    for (const ev of murder.witnessEvents || []) {
      if (!isAliveForInvestigation(caseData, ev.witnessId, day)) {
        allDaysValid = false;
      }
    }

    // Step 1: Check every red herring clue on the scene
    const refutedRedHerringOwnersByClue = new Map();
    const refutationTexts = [];
    const redHerrings = photoClues
      .map((clue, idx) => ({ clue, idx }))
      .filter((entry) => entry.clue.isRedHerring);

    if (redHerrings.length === 0) {
      allDaysValid = false;
    }

    for (const { clue, idx } of redHerrings) {
      const refResult = verifyRedHerringRefutation(caseData, murder, clue);
      if (refResult.refuted) {
        refutedRedHerringOwnersByClue.set(idx, clue.redHerringOwnerId || clue.linkedPersonId);
        refutationTexts.push(refResult.summary);
        difficultySteps += refResult.steps;
      } else {
        unrefutedRedHerrings += 1;
        refutationTexts.push(refResult.summary);
        allDaysValid = false;
      }
    }

    // Step 2: Evaluate deductive evidence chains across ALL living suspects on `day`
    const livingCandidates = TOWNSPEOPLE.filter(
      (p) => p.id !== murder.victimId && isAliveForInvestigation(caseData, p.id, day)
    );

    let killerEval = { chains: [], steps: 0 };
    let maxInnocentScore = 0;

    for (const person of livingCandidates) {
      const evalResult = evaluateSuspectChains(caseData, murder, person.id, refutedRedHerringOwnersByClue);
      if (person.id === murder.killerId) {
        killerEval = evalResult;
      } else if (evalResult.chains.length > maxInnocentScore) {
        maxInnocentScore = evalResult.chains.length;
      }
    }

    const kScore = killerEval.chains.length;
    killerScores[murder.killerId] = kScore;
    difficultySteps += 3 + killerEval.steps; // 3 hotspot inspections + chain verification steps

    // Killer must have >= 2 independent chains AND strictly beat every other suspect (with others <= 1)
    if (kScore < 2 || maxInnocentScore >= kScore || maxInnocentScore >= 2) {
      allDaysValid = false;
    }

    chainSummaries.push({
      day,
      killerId: murder.killerId,
      chains: killerEval.chains,
      redHerringRefutation: refutationTexts.join(' | ')
    });
  }

  const solvable = Boolean(allDaysValid && unrefutedRedHerrings === 0);

  return {
    solvable,
    killerScores,
    unrefutedRedHerrings,
    difficultySteps,
    chainSummaries
  };
}
