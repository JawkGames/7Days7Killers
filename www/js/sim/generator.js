// Deterministic 7-day murder mystery generator with Rewind Time protection & solver validation

import { createPRNG, hashSeed } from './prng.js';
import { solveCase } from './solver.js';
import { LOCATIONS, TIME_SLOTS, CLUE_TYPES, getLocationById, getClueTypeById } from '../data/locations.js';
import { TOWNSPEOPLE, getPersonById } from '../data/townspeople.js';
import { STORY_CORES } from '../data/storyCores.js';

const NIGHT_TIME_WINDOWS = [
  '22:15 - 22:50',
  '22:40 - 23:15',
  '23:05 - 23:40',
  '23:30 - 00:05',
  '00:10 - 00:45',
  '00:35 - 01:10',
  '01:00 - 01:35'
];

const RED_HERRING_REASONS = ['fled_witness', 'stolen_tool', 'daytime_visit'];

/**
 * Helper: Victims of Day `d` are ALIVE on Days `1..(d-1)` and dead from Day `d` onward.
 * All 7 killers and the 6 non-victim innocents remain alive through Day 7.
 * Can be called as `aliveOnDay(caseData, personId, day)` or `caseData.aliveOnDay(personId, day)`.
 */
export function aliveOnDay(caseData, personId, day) {
  if (!personId) return false;
  const deathDay = caseData?.deathDayByPerson?.[personId];
  if (typeof deathDay === 'number') {
    return day < deathDay;
  }
  return true;
}

function getProtectedTargetForDay(protectedByDay, day) {
  if (!protectedByDay || typeof protectedByDay !== 'object') return null;
  return protectedByDay[day] || protectedByDay[String(day)] || null;
}

function chooseCrimeLocation(rng, killer, victim, usedLocations) {
  const preferredIds = [
    killer.workLoc,
    victim.workLoc,
    killer.freqLoc,
    victim.freqLoc
  ].filter(Boolean);

  const unusedPreferred = preferredIds.filter((locId) => !usedLocations.has(locId));
  if (unusedPreferred.length > 0) {
    return rng.pick(unusedPreferred);
  }
  const allUnused = LOCATIONS.map((l) => l.id).filter((id) => !usedLocations.has(id));
  if (allUnused.length > 0 && rng.chance(0.75)) {
    return rng.pick(allUnused);
  }
  return rng.pick(preferredIds) || rng.pick(LOCATIONS).id;
}

function chooseAlternateLocation(rng, originalLocId) {
  const orig = getLocationById(originalLocId);
  const candidates = (orig?.adjacentIds || []).filter((id) => id !== originalLocId);
  if (candidates.length > 0) {
    return rng.pick(candidates);
  }
  return rng.pick(LOCATIONS.filter((l) => l.id !== originalLocId)).id;
}

function buildConspiracies(rng, killerIds, selectedCores) {
  const groups = [
    [killerIds[0], killerIds[1], killerIds[2]],
    [killerIds[3], killerIds[4]],
    [killerIds[5], killerIds[6]]
  ];
  const linkTypes = ['pact', 'blackmail', 'coverup'];

  return groups.map((memberIds, idx) => {
    const core = selectedCores[idx] || STORY_CORES[idx];
    const linkType = linkTypes[idx % linkTypes.length];
    const lead = getPersonById(memberIds[0]);
    const second = getPersonById(memberIds[1]);
    const sharedClueTypeId = rng.pick(core.preferredClueTypes) || 'torn_letter';

    return {
      id: `conspiracy_${idx + 1}`,
      memberIds,
      linkType,
      storyCoreId: core.id,
      sharedClueTypeId,
      summaryText: `${lead.name} ve ${second.name}, "${core.title}" sırrının açığa çıkmaması için karanlık bir ortaklık kurdu.`,
      noteClueText: `${core.blackmailText} (${lead.name} ile ${second.name} arasındaki gizli mutabakat izi.)`
    };
  });
}

function distributeIntoPairedLocations(rng, peopleIds, allowedLocIds, fixedAssignments = {}) {
  const result = { ...fixedAssignments };
  const unassigned = peopleIds.filter((id) => !result[id]);
  if (unassigned.length === 0) return result;

  // Pick 2..3 active locations so every active location gets >= 2 people
  const maxBuckets = Math.max(1, Math.min(allowedLocIds.length, Math.floor(unassigned.length / 2)));
  const bucketLocs = allowedLocIds.slice(0, Math.min(3, maxBuckets));

  unassigned.forEach((personId, idx) => {
    const bucketLoc = bucketLocs[idx % bucketLocs.length];
    result[personId] = bucketLoc;
  });

  // Ensure no bucket has just 1 person if there are >= 2 unassigned people
  const counts = {};
  for (const id of Object.keys(result)) {
    const loc = result[id];
    counts[loc] = (counts[loc] || 0) + 1;
  }
  for (const personId of unassigned) {
    const loc = result[personId];
    if (counts[loc] === 1 && bucketLocs.length > 1) {
      const targetLoc = bucketLocs.find((b) => b !== loc && (counts[b] || 0) >= 1) || bucketLocs[0];
      counts[loc] -= 1;
      result[personId] = targetLoc;
      counts[targetLoc] = (counts[targetLoc] || 0) + 1;
    }
  }

  return result;
}

/**
 * Generates a single deterministic 7-day case attempt from `seedNum` and `options`.
 * @param {number} seedNum
 * @param {object} options `{ protectedByDay?: Record<number|string, string>, _killerSeedNum?: number }`
 */
export function generateCaseAttempt(seedNum, options = {}) {
  const protectedByDay = options?.protectedByDay || {};
  const killerSeedNum =
    typeof options?._killerSeedNum === 'number' ? options._killerSeedNum >>> 0 : hashSeed(seedNum);

  // Separate PRNG for core cast so Rewind Time (`protectedByDay`) NEVER changes who the 7 killers are!
  const castRng = createPRNG(killerSeedNum);
  const shuffledCast = castRng.shuffle(TOWNSPEOPLE.map((p) => p.id));
  const killerIds = shuffledCast.slice(0, 7);
  const killerSet = new Set(killerIds);
  const baseNonKillers = shuffledCast.slice(7); // 13 non-killers in deterministic priority order

  const shuffledCores = castRng.shuffle(STORY_CORES);
  const dayStoryCores = shuffledCores.slice(0, 7);
  const conspiracies = buildConspiracies(castRng, killerIds, dayStoryCores);

  // Main day-simulation PRNG
  const simRng = createPRNG((hashSeed(seedNum) ^ 0x9e3779b9) >>> 0);

  const victimIds = [];
  const deathDayByPerson = {};
  const usedCrimeLocations = new Set();
  const dayPlans = [];

  // Step 1: Select victims and crime scenes for Days 1..7 (honoring Rewind `protectedByDay`)
  for (let day = 1; day <= 7; day++) {
    const dayRng = createPRNG((hashSeed(seedNum) + day * 104729) >>> 0);
    const killerId = killerIds[day - 1];
    const killer = getPersonById(killerId);
    const storyCore = dayStoryCores[day - 1];

    const livingNonKillers = baseNonKillers.filter((id) => !deathDayByPerson[id]);

    // Prefer a target who has a personal relation with the killer if available on first choice
    const relatedTargets = livingNonKillers.filter((id) =>
      killer.relations.some((rel) => rel.targetId === id)
    );
    const originalVictimId =
      relatedTargets.length > 0 && dayRng.chance(0.6)
        ? relatedTargets[0]
        : livingNonKillers[0];

    const originalVictim = getPersonById(originalVictimId);
    const originalLocationId = chooseCrimeLocation(dayRng, killer, originalVictim, usedCrimeLocations);

    const protectedId = getProtectedTargetForDay(protectedByDay, day);
    let victimId = originalVictimId;
    let locationId = originalLocationId;
    let divertedByProtection = false;

    if (protectedId && protectedId === originalVictimId) {
      const altCandidates = livingNonKillers.filter((id) => id !== protectedId);
      if (altCandidates.length > 0) {
        victimId = altCandidates[dayRng.int(0, altCandidates.length - 1)];
        locationId = chooseAlternateLocation(dayRng, originalLocationId);
        divertedByProtection = true;
      }
    }

    victimIds.push(victimId);
    deathDayByPerson[victimId] = day;
    usedCrimeLocations.add(locationId);

    const conspiracy = conspiracies.find((c) => c.memberIds.includes(killerId)) || conspiracies[0];
    const accompliceCandidates = conspiracy.memberIds.filter((id) => id !== killerId);
    const accompliceId = accompliceCandidates.length > 0 ? dayRng.pick(accompliceCandidates) : null;

    dayPlans.push({
      day,
      killerId,
      accompliceId,
      victimId,
      originalVictimId,
      divertedByProtection,
      locationId,
      originalLocationId,
      storyCore,
      conspiracy
    });
  }

  const survivorInnocentIds = baseNonKillers.filter((id) => !deathDayByPerson[id]); // 6 full-week innocent survivors

  const schedule = {};
  const claimedSchedule = {};
  const stolenItems = [];
  const murders = [];

  // Step 2: Build daily schedules (`sabah`, `ikindi`, `gece`), clues, red herrings, and witness events
  for (const plan of dayPlans) {
    const {
      day,
      killerId,
      accompliceId,
      victimId,
      originalVictimId,
      divertedByProtection,
      locationId,
      originalLocationId,
      storyCore,
      conspiracy
    } = plan;

    const dayRng = createPRNG((hashSeed(seedNum) + day * 224737 + (divertedByProtection ? 9973 : 0)) >>> 0);
    const killer = getPersonById(killerId);
    const victim = getPersonById(victimId);
    const crimeLoc = getLocationById(locationId);

    // Living people during investigation on Day `day` (excludes victims of Days 1..day)
    const livingOnDayIds = TOWNSPEOPLE.map((p) => p.id).filter(
      (id) => !deathDayByPerson[id] || day < deathDayByPerson[id]
    );
    const livingInnocentsOnDay = livingOnDayIds.filter((id) => !killerSet.has(id));
    const truthfulWitnessPool = livingInnocentsOnDay.length >= 4
      ? livingInnocentsOnDay
      : livingOnDayIds.filter((id) => id !== killerId && id !== accompliceId);

    // Choose Clue 0 (Killer personal physical trace) & Clue 1 (Method/Motive/Timing physical trace)
    const killerClue0Id = killer.clues[day % killer.clues.length] || killer.clues[0];
    const preferredSecondClues = [
      ...storyCore.preferredClueTypes,
      killer.clues.find((c) => c !== killerClue0Id),
      'pocket_watch',
      'torn_letter',
      'empty_nail'
    ].filter((cId) => cId && cId !== killerClue0Id);
    const killerClue1Id = preferredSecondClues[0] || 'pocket_watch';

    // Choose Red Herring Owner (must be living innocent on `day`, preferring clue not owned by `killer`)
    const idealRedHerringOwners = dayRng.shuffle(livingInnocentsOnDay).filter((id) => {
      const p = getPersonById(id);
      return p.clues.some(
        (cId) => cId !== killerClue0Id && cId !== killerClue1Id && !killer.clues.includes(cId)
      );
    });
    const fallbackRedHerringOwners = dayRng.shuffle(livingInnocentsOnDay).filter((id) => {
      const p = getPersonById(id);
      return p.clues.some((cId) => cId !== killerClue0Id && cId !== killerClue1Id);
    });

    const redHerringOwnerId =
      idealRedHerringOwners[0] || fallbackRedHerringOwners[0] || livingInnocentsOnDay[0];
    const redHerringOwner = getPersonById(redHerringOwnerId);
    const redHerringClueId =
      redHerringOwner.clues.find(
        (cId) => cId !== killerClue0Id && cId !== killerClue1Id && !killer.clues.includes(cId)
      ) ||
      redHerringOwner.clues.find((cId) => cId !== killerClue0Id && cId !== killerClue1Id) ||
      redHerringOwner.clues[0];

    const innocentReason = RED_HERRING_REASONS[(day - 1 + simRng.int(0, 1)) % RED_HERRING_REASONS.length];

    // Pick 3 safe night locations (excluding crime scene `locationId`), starting with `fakeAlibiLocationId`
    const otherLocations = dayRng.shuffle(LOCATIONS.map((l) => l.id).filter((id) => id !== locationId));
    const fakeAlibiLocationId =
      otherLocations.find((id) => id === killer.workLoc || id === killer.freqLoc) || otherLocations[0];
    const safeLocs = [
      fakeAlibiLocationId,
      ...otherLocations.filter((id) => id !== fakeAlibiLocationId)
    ].slice(0, 3);

    // Daytime (`sabah` and `ikindi`) active people include everyone alive prior to Night `day` (so `victimId` is still alive during the day before nightfall!)
    const daytimeActiveIds = [...livingOnDayIds, victimId];
    const argumentLocId = killer.workLoc !== locationId ? killer.workLoc : safeLocs[0];

    const argumentWitnessCandidates = dayRng
      .shuffle(truthfulWitnessPool)
      .filter((id) => id !== redHerringOwnerId);
    const argumentWitnessId = argumentWitnessCandidates[0] || truthfulWitnessPool[0];

    const daytimeVisitWitnessId =
      argumentWitnessCandidates[1] || argumentWitnessCandidates[0] || truthfulWitnessPool[0];

    // Build `sabah` schedule
    const sabahFixed = {
      [killerId]: argumentLocId,
      [victimId]: argumentLocId,
      [argumentWitnessId]: argumentLocId
    };
    if (innocentReason === 'daytime_visit') {
      sabahFixed[redHerringOwnerId] = locationId;
      sabahFixed[daytimeVisitWitnessId] = locationId;
    }
    const sabahMap = distributeIntoPairedLocations(
      dayRng,
      daytimeActiveIds,
      LOCATIONS.map((l) => l.id),
      sabahFixed
    );

    // Build `ikindi` schedule
    const ikindiFixed = {};
    if (innocentReason === 'daytime_visit') {
      ikindiFixed[redHerringOwnerId] = locationId;
      ikindiFixed[daytimeVisitWitnessId] = locationId;
    } else {
      ikindiFixed[killerId] = killer.freqLoc;
      ikindiFixed[victimId] = victim.workLoc;
    }
    const ikindiMap = distributeIntoPairedLocations(
      dayRng,
      daytimeActiveIds,
      LOCATIONS.map((l) => l.id),
      ikindiFixed
    );

    // Build `gece` (MURDER NIGHT) schedule:
    // Guarantee >= 2 truthful living innocents in EACH of the 3 `safeLocs` (`6+ innocents / 3 safeLocs >= 2`!)
    // so EVERY innocent person has a rock-solid corroborated night alibi, AND `fakeAlibiLocationId` has >= 2 truthful witnesses!
    const geceMap = {
      [killerId]: locationId,
      [victimId]: locationId
    };

    const shuffledInnocents = dayRng.shuffle(livingInnocentsOnDay);
    // Place `redHerringOwnerId` at `safeLocs[1]` (away from crimeLoc and with at least 1 other innocent partner)
    const rhSafeLoc = safeLocs[1] || safeLocs[0];
    geceMap[redHerringOwnerId] = rhSafeLoc;

    const remainingInnocents = shuffledInnocents.filter((id) => id !== redHerringOwnerId);
    // Ensure `fakeAlibiLocationId` (`safeLocs[0]`), `safeLocs[1]`, `safeLocs[2]` each get >= 2 truthful innocents
    const bucketCounts = {
      [safeLocs[0]]: 0,
      [safeLocs[1]]: 1, // redHerringOwnerId is already here
      [safeLocs[2]]: 0
    };

    for (const innId of remainingInnocents) {
      // Pick the safeLoc with the lowest innocent count first
      const targetSafeLoc = [...safeLocs].sort((a, b) => bucketCounts[a] - bucketCounts[b])[0];
      geceMap[innId] = targetSafeLoc;
      bucketCounts[targetSafeLoc] += 1;
    }

    // Distribute the remaining 6 killers (who are NOT tonight's killer) across `safeLocs`
    const otherKillers = killerIds.filter((id) => id !== killerId);
    otherKillers.forEach((otherKId, idx) => {
      if (otherKId === accompliceId) {
        // Accomplice is elsewhere (not at `fakeAlibiLocationId` unless lying, keeping truthful witnesses cleanly decisive)
        geceMap[otherKId] = safeLocs[2] || safeLocs[1];
      } else {
        geceMap[otherKId] = safeLocs[idx % safeLocs.length];
      }
    });

    // Claimed schedule: everyone tells the truth except tonight's `killerId` who lies (`fakeAlibiLocationId`)
    const claimedGeceMap = { ...geceMap, [killerId]: fakeAlibiLocationId };

    schedule[day] = {
      sabah: sabahMap,
      ikindi: ikindiMap,
      gece: geceMap
    };
    claimedSchedule[day] = {
      sabah: { ...sabahMap },
      ikindi: { ...ikindiMap },
      gece: claimedGeceMap
    };

    // Select specific living truthful witnesses for structured witnessEvents
    const fakeAlibiTruthWitnesses = livingInnocentsOnDay.filter(
      (id) => geceMap[id] === fakeAlibiLocationId
    );
    const alibiDisproverId = fakeAlibiTruthWitnesses[0] || truthfulWitnessPool[0];

    const rhAlibiPartners = livingInnocentsOnDay.filter(
      (id) => id !== redHerringOwnerId && geceMap[id] === geceMap[redHerringOwnerId]
    );
    const rhAlibiWitnessId = rhAlibiPartners[0] || fakeAlibiTruthWitnesses[0] || truthfulWitnessPool[0];

    const sceneSighterCandidates = dayRng
      .shuffle(truthfulWitnessPool)
      .filter((id) => id !== alibiDisproverId);
    const sceneWitnessId = sceneSighterCandidates[0] || alibiDisproverId;

    const fakeLocMeta = getLocationById(fakeAlibiLocationId);
    const rhSafeLocMeta = getLocationById(geceMap[redHerringOwnerId]);
    const argLocMeta = getLocationById(argumentLocId);
    const clue0Meta = getClueTypeById(killerClue0Id);
    const clue1Meta = getClueTypeById(killerClue1Id);
    const rhClueMeta = getClueTypeById(redHerringClueId);

    const witnessEvents = [];

    // 1. `saw_killer_near_scene`
    const sceneWitness = getPersonById(sceneWitnessId);
    witnessEvents.push({
      id: `we_d${day}_scene`,
      day,
      slot: 'gece',
      type: 'saw_killer_near_scene',
      witnessId: sceneWitnessId,
      subjectId: killerId,
      secondaryPersonId: null,
      locationId,
      clueTypeId: killerClue0Id,
      isTruthful: true,
      statementText: `${sceneWitness.name}: "Gece sis çöktüğünde ${crimeLoc.ablative} hızlı adımlarla çıkan kişinin ${killer.name} olduğuna yemin ederim; ellerini paltosuna siliyordu."`
    });

    // 2. `alibi_disprove_killer_lie`
    const disprover = getPersonById(alibiDisproverId);
    witnessEvents.push({
      id: `we_d${day}_disprove`,
      day,
      slot: 'gece',
      type: 'alibi_disprove_killer_lie',
      witnessId: alibiDisproverId,
      subjectId: killerId,
      secondaryPersonId: accompliceId,
      locationId: fakeAlibiLocationId,
      clueTypeId: null,
      isTruthful: true,
      statementText: `${disprover.name}: "${killer.name} dün gece ${fakeLocMeta.locative} olduğunu söylüyorsa gözünün içine baka baka yalan söylüyor; bütün gece oradaydık, kapıdan bile geçmedi."`
    });

    // 3. `suspicious_argument`
    const argWitness = getPersonById(argumentWitnessId);
    witnessEvents.push({
      id: `we_d${day}_arg`,
      day,
      slot: 'sabah',
      type: 'suspicious_argument',
      witnessId: argumentWitnessId,
      subjectId: killerId,
      secondaryPersonId: victimId,
      locationId: argumentLocId,
      clueTypeId: killerClue1Id,
      isTruthful: true,
      statementText: `${argWitness.name}: "Sabah ${argLocMeta.locative} ${killer.name} ile ${victim.name} arasında '${storyCore.title}' yüzünden kan donduran bir kavga çıktı."`
    });

    // 4. `alibi_confirm` for Red Herring Owner (and safe location group)
    const rhPartner = getPersonById(rhAlibiWitnessId);
    witnessEvents.push({
      id: `we_d${day}_rhalibi`,
      day,
      slot: 'gece',
      type: 'alibi_confirm',
      witnessId: rhAlibiWitnessId,
      subjectId: redHerringOwnerId,
      secondaryPersonId: null,
      locationId: geceMap[redHerringOwnerId],
      clueTypeId: null,
      isTruthful: true,
      statementText: `${rhPartner.name}: "Cinayet saatinde ${redHerringOwner.name} benimle birlikte ${rhSafeLocMeta.locative} oturuyordu; yanımızdan hiç ayrılmadı."`
    });

    // 5. Red herring specific refutation witness event & optional stolen item record
    let refutationWitnessId = rhAlibiWitnessId;
    let refutationText = '';

    if (innocentReason === 'fled_witness') {
      const fleeWitnessId =
        truthfulWitnessPool.find((id) => id !== redHerringOwnerId && id !== sceneWitnessId) ||
        rhAlibiWitnessId;
      const fleeWitness = getPersonById(fleeWitnessId);
      refutationWitnessId = fleeWitnessId;
      refutationText = `${fleeWitness.name}, ${redHerringOwner.genitive} akşam karanlığı çökerken içerideki karaltıdan korkup ${rhClueMeta.accusative} düşürerek ${rhSafeLocMeta.dative} kaçtığını gördü.`;

      witnessEvents.push({
        id: `we_d${day}_rhflee`,
        day,
        slot: 'gece',
        type: 'saw_red_herring_flee',
        witnessId: fleeWitnessId,
        subjectId: redHerringOwnerId,
        secondaryPersonId: null,
        locationId,
        clueTypeId: redHerringClueId,
        isTruthful: true,
        statementText: `${fleeWitness.name}: "Cinayetten epey önce ${redHerringOwner.name} nefes nefese ${crimeLoc.ablative} fırlayıp yanımıza sığındı; korkudan ${rhClueMeta.accusative} orada düşürmüş."`
      });
    } else if (innocentReason === 'stolen_tool') {
      const theftWitnessId =
        truthfulWitnessPool.find((id) => id !== redHerringOwnerId) || rhAlibiWitnessId;
      const theftWitness = getPersonById(theftWitnessId);
      refutationWitnessId = theftWitnessId;
      const reportedDay = Math.max(1, day - 1);
      refutationText = `${theftWitness.name}, ${redHerringOwner.genitive} ${rhClueMeta.name.toLowerCase()} eşyasının cinayetten önce tezgahından çalındığını doğruladı.`;

      stolenItems.push({
        id: `stolen_d${day}_${redHerringOwnerId}`,
        ownerId: redHerringOwnerId,
        thiefId: killerId,
        clueTypeId: redHerringClueId,
        reportedDay,
        locationId: redHerringOwner.workLoc,
        witnessId: theftWitnessId,
        reportText: `${redHerringOwner.name}, ${rhClueMeta.accusative} ${reportedDay}. gün iş yerinden çaldırdığını ${theftWitness.dative} bildirmişti.`
      });

      witnessEvents.push({
        id: `we_d${day}_stolen`,
        day,
        slot: 'ikindi',
        type: 'stolen_item_notice',
        witnessId: theftWitnessId,
        subjectId: redHerringOwnerId,
        secondaryPersonId: killerId,
        locationId: redHerringOwner.workLoc,
        clueTypeId: redHerringClueId,
        isTruthful: true,
        statementText: `${theftWitness.name}: "${redHerringOwner.name} daha cinayet gecesi gelmeden ${rhClueMeta.accusative} kaybettiğini söyleyip her yerde aramıştı."`
      });
    } else {
      // `daytime_visit`
      const visitWitness = getPersonById(daytimeVisitWitnessId);
      refutationWitnessId = daytimeVisitWitnessId;
      refutationText = `${visitWitness.name}, ${redHerringOwner.genitive} ${crimeLoc.dative} sadece gündüz uğradığını, geceyi ise ${rhSafeLocMeta.locative} geçirdiğini doğruladı.`;

      witnessEvents.push({
        id: `we_d${day}_dayvisit`,
        day,
        slot: 'ikindi',
        type: 'alibi_confirm',
        witnessId: daytimeVisitWitnessId,
        subjectId: redHerringOwnerId,
        secondaryPersonId: null,
        locationId,
        clueTypeId: redHerringClueId,
        isTruthful: true,
        statementText: `${visitWitness.name}: "${redHerringOwner.name} ${crimeLoc.dative} gündüz gözüyle iş için uğradı; ${rhClueMeta.accusative} o sırada düşürmüştür, gece bizimle değildi diyen yalan söyler."`
      });
    }

    // Build the 3 `photoClues` placed on `crimeLoc.hotspots[0..2]`
    const hotspots = crimeLoc.hotspots;
    const photoClues = [
      {
        index: 0,
        clueTypeId: killerClue0Id,
        hotspot: { ...hotspots[0] },
        isRedHerring: false,
        role: 'killer_signature',
        linkedPersonId: killerId,
        innocentReason: null,
        label: clue0Meta.name,
        inspectionText: `${crimeLoc.locative} cesedin hemen yakınında ${clue0Meta.name.toLowerCase()} bulundu. ${clue0Meta.shortDesc}`
      },
      {
        index: 1,
        clueTypeId: killerClue1Id,
        hotspot: { ...hotspots[1] },
        isRedHerring: false,
        role: 'method_or_motive_trace',
        linkedPersonId: killerId,
        innocentReason: null,
        label: clue1Meta.name,
        inspectionText: `Boğuşma noktasında dikkat çeken ikinci bulgu: ${clue1Meta.name.toLowerCase()}. "${storyCore.title}" meselesiyle doğrudan örtüşüyor.`
      },
      {
        index: 2,
        clueTypeId: redHerringClueId,
        hotspot: { ...hotspots[2] },
        isRedHerring: true,
        role: 'red_herring',
        redHerringOwnerId,
        linkedPersonId: redHerringOwnerId,
        innocentReason,
        refutationWitnessId,
        label: rhClueMeta.name,
        inspectionText: `Kenarda göze çarpan ${rhClueMeta.name.toLowerCase()}, ilk bakışta ${redHerringOwner.accusative} şüpheli gibi gösteriyor; ancak sorguda doğrulanmalı.`,
        refutationText
      }
    ];

    const blackmailNote = {
      exists: true,
      clueTypeId: killerClue1Id,
      conspiracyId: conspiracy.id,
      fromId: victimId,
      toId: killerId,
      text: `${victim.name} tarafından saklanan not: "${storyCore.blackmailText}" — ${conspiracy.summaryText}`
    };

    murders.push({
      day,
      killerId,
      accompliceId,
      victimId,
      originalVictimId,
      divertedByProtection,
      locationId,
      originalLocationId,
      fakeAlibiLocationId,
      timeOfDeathSlot: 'gece',
      timeWindowText: NIGHT_TIME_WINDOWS[(day - 1) % NIGHT_TIME_WINDOWS.length],
      storyCore,
      conspiracyId: conspiracy.id,
      photoClues,
      witnessEvents,
      blackmailNote
    });
  }

  const caseData = {
    seedNum: hashSeed(seedNum),
    killerSeedNum,
    options: { protectedByDay: { ...protectedByDay } },
    timeSlots: [...TIME_SLOTS],
    killerIds,
    victimIds,
    survivorInnocentIds,
    deathDayByPerson,
    conspiracies,
    stolenItems,
    schedule,
    claimedSchedule,
    murders
  };

  Object.defineProperty(caseData, 'aliveOnDay', {
    value: (personId, day) => aliveOnDay(caseData, personId, day),
    enumerable: false,
    configurable: true
  });

  return caseData;
}

/**
 * Generates a solver-validated 7-day case (`attempt = 0..60`, `seedNum + attempt * 7919`).
 * Preserves the seed's canonical 7 killers even when `options.protectedByDay` is used for Rewind Time!
 * @param {number|string} seedInput
 * @param {object} options `{ protectedByDay?: Record<number|string, string> }`
 */
export function generateValidatedCase(seedInput, options = {}) {
  const baseSeedNum = hashSeed(seedInput);
  const hasProtections =
    options?.protectedByDay && Object.keys(options.protectedByDay).length > 0;

  // Determine canonical killerSeedNum from unprotected seed so Rewind Time keeps the exact 7 killers
  let canonicalKillerSeed = baseSeedNum;
  if (hasProtections) {
    for (let baseAttempt = 0; baseAttempt <= 60; baseAttempt++) {
      const candidateSeed = (baseSeedNum + baseAttempt * 7919) >>> 0;
      const baseTry = generateCaseAttempt(candidateSeed, {});
      if (solveCase(baseTry).solvable) {
        canonicalKillerSeed = candidateSeed;
        break;
      }
    }
  }

  let lastCase = null;
  let lastReport = null;

  for (let attempt = 0; attempt <= 60; attempt++) {
    const attemptSeed = (baseSeedNum + attempt * 7919) >>> 0;
    const attemptOptions = hasProtections
      ? { ...options, _killerSeedNum: canonicalKillerSeed }
      : options;

    const data = generateCaseAttempt(attemptSeed, attemptOptions);
    const report = solveCase(data);
    data.seed = seedInput;
    data.attemptUsed = attempt;
    data.solverReport = report;

    lastCase = data;
    lastReport = report;

    if (report.solvable === true) {
      return data;
    }
  }

  // Fallback return if exhausted (attaching last solverReport for diagnostics)
  if (lastCase) {
    lastCase.solverReport = lastReport;
  }
  return lastCase;
}
