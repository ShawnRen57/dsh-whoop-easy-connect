/**
 * Deterministic demo dataset for the `dsh-whoop-easy-connect` dashboard.
 *
 * Used when the plugin runs in demo mode (no WHOOP account bound). The output
 * has the exact shape produced by `aggregateSnapshot()` in `whoop-api.js`
 * (`profile`/`body`/`today`/`days`/`workouts`/`range` plus `updatedAt`), so the
 * client renders demo and live data through the same code path.
 *
 * Determinism: every value is derived from a PRNG seeded with the local
 * calendar date (`YYYY-MM-DD`) of the day it describes, never from wall-clock
 * time-of-day. Two calls on the same calendar day therefore describe the same
 * 30 days of health data (only `updatedAt`/`range.end` reflect the passed
 * `now`); generating 7 vs 30 days yields identical values for overlapping
 * dates. Nothing here is real data and nothing claims to be.
 *
 * Day layout matches the wake-date bucketing in `aggregateSnapshot()`: a day's
 * cycle starts that morning, its recovery was scored that morning and its sleep
 * ended that morning, so feeding the data back through the aggregator keeps
 * every row on its own local date.
 *
 * @module dsh-whoop-easy-connect/demo-data
 */

/** Demo profile, as required by the plugin spec. */
const DEMO_PROFILE = Object.freeze({
  firstName: 'Alex',
  lastName: 'Chen',
  email: 'alex.chen@example.com',
  userId: 1000001,
});

/** Demo body measurements, as required by the plugin spec. */
const DEMO_BODY = Object.freeze({ heightM: 1.78, weightKg: 70.2, maxHr: 191 });

/** Hourly pace (km/h) and physiological ranges per demo sport. */
const SPORTS = [
  { sport: 'running', distance: true, speedKmh: [9, 13], strain: [7, 18.5], avgHr: [138, 168] },
  { sport: 'cycling', distance: true, speedKmh: [18, 27], strain: [6, 17], avgHr: [124, 156] },
  { sport: 'functional_fitness', distance: false, strain: [8, 19], avgHr: [128, 162] },
  { sport: 'swimming', distance: true, speedKmh: [2, 2.8], strain: [5, 15], avgHr: [122, 152] },
  { sport: 'hiking', distance: true, speedKmh: [3.5, 5], strain: [3.5, 12], avgHr: [102, 132] },
  { sport: 'rowing', distance: true, speedKmh: [8, 12], strain: [6, 16], avgHr: [128, 158] },
  { sport: 'weightlifting', distance: false, strain: [3.5, 12], avgHr: [98, 136] },
  { sport: 'basketball', distance: false, strain: [8, 19], avgHr: [138, 172] },
  { sport: 'tennis', distance: false, strain: [5, 15], avgHr: [122, 156] },
  { sport: 'yoga', distance: false, strain: [2, 6], avgHr: [82, 112] },
  { sport: 'soccer', distance: true, speedKmh: [6, 9], strain: [9, 19.5], avgHr: [142, 176] },
  { sport: 'boxing', distance: false, strain: [9, 19], avgHr: [142, 172] },
];

/**
 * Build the deterministic demo snapshot.
 *
 * @param {object} [options]
 * @param {number} [options.days=30] Number of trailing local calendar days.
 * @param {Date|string|number} [options.now=new Date()] Reference time.
 * @returns {{
 *   updatedAt: string,
 *   range: { start: string, end: string, days: number },
 *   profile: object,
 *   body: object,
 *   today: object,
 *   days: object[],
 *   workouts: object[],
 *   warnings: string[],
 * }} Same shape as `aggregateSnapshot()`.
 */
export function demoSnapshot({ days = 30, now = new Date() } = {}) {
  const nowDate = validDate(now) ?? new Date();
  const dayCount = clampDayCount(days);
  const baseYear = nowDate.getFullYear();
  const baseMonth = nowDate.getMonth();
  const baseDay = nowDate.getDate();

  /** @type {string[]} */
  const dates = [];
  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    dates.push(localDateKey(new Date(baseYear, baseMonth, baseDay - offset)));
  }

  /** @type {object[]} */
  const days_ = [];
  /** @type {Array<{ startMs: number, entry: object }>} */
  const workoutEntries = [];

  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    const isToday = index === dates.length - 1;
    const [year, month, day] = date.split('-').map(Number);
    const cycle = buildCycle(date, year, month, day, isToday);
    const recovery = buildRecovery(date);
    const sleep = buildSleep(date, year, month, day);
    days_.push({ date, recovery, cycle, sleep });
    workoutEntries.push(...buildWorkouts(date, year, month, day));
  }

  workoutEntries.sort((left, right) => right.startMs - left.startMs);
  const workouts = workoutEntries.slice(0, 50).map((item) => item.entry);

  const lastDay = days_[days_.length - 1];
  const today = {
    date: lastDay.date,
    recovery: lastDay.recovery,
    cycle: lastDay.cycle,
    sleep: lastDay.sleep,
  };

  return {
    updatedAt: nowDate.toISOString(),
    range: {
      start: new Date(baseYear, baseMonth, baseDay - (dayCount - 1)).toISOString(),
      end: new Date(nowDate.getTime()).toISOString(),
      days: dayCount,
    },
    profile: { ...DEMO_PROFILE },
    body: { ...DEMO_BODY },
    today,
    days: days_,
    workouts,
    warnings: [],
  };
}

/* ------------------------------------------------------------------------- *
 * Day builders
 * ------------------------------------------------------------------------- */

/**
 * @param {string} date
 * @param {number} year
 * @param {number} month 1-based local month.
 * @param {number} day Local day of month.
 * @param {boolean} isToday Today's cycle is still in progress (`end: null`).
 * @returns {object} DayEntry cycle projection.
 */
function buildCycle(date, year, month, day, isToday) {
  const rng = createRng(`${date}:cycle`);
  const strain = round(clamp(2 + rng() * 17.5, 2, 19.5), 1);
  const kilojoule = Math.round(1800 + strain * 520 + rng() * 1600);
  const avgHr = Math.round(clamp(58 + strain * 1.7 + (rng() * 8 - 4), 55, 100));
  const maxHr = Math.round(clamp(avgHr + 25 + rng() * 30, 120, DEMO_BODY.maxHr));
  const steps = Math.round(clamp(2600 + strain * 620 + (rng() * 3000 - 1500), 1800, 19000));
  const startMinutes = 6 * 60 + 40 + Math.round(rng() * 40);
  const start = new Date(year, month - 1, day, 0, startMinutes).toISOString();
  const end = isToday ? null : new Date(year, month - 1, day, 23, 0 + Math.round(rng() * 50)).toISOString();
  return { strain, kilojoule, avgHr, maxHr, steps, start, end };
}

/**
 * @param {string} date
 * @returns {object} DayEntry recovery projection.
 */
function buildRecovery(date) {
  const rng = createRng(`${date}:recovery`);
  const score = Math.round(28 + 69 * ((rng() + rng()) / 2));
  const hrv = round(clamp(24 + ((score - 28) / 69) * 88 + (rng() * 12 - 6), 24, 115), 1);
  const rhr = Math.round(clamp(68 - ((score - 28) / 69) * 20 + (rng() * 4 - 2), 46, 68));
  const spo2 = round(clamp(94 + rng() * 5, 94, 99), 1);
  const skinTemp = round(clamp(32.8 + rng() * 2.6, 32.8, 35.4), 1);
  return {
    score,
    hrv,
    rhr,
    spo2,
    skinTemp,
    calibrating: false,
    state: 'SCORED',
  };
}

/**
 * @param {string} date
 * @param {number} year
 * @param {number} month 1-based local month.
 * @param {number} day Local day of month.
 * @returns {object} DayEntry sleep projection for the night ending on `date`.
 */
function buildSleep(date, year, month, day) {
  const rng = createRng(`${date}:sleep`);
  const baselineMs = 7.6 * 3600000 + rng() * 0.9 * 3600000;
  const sleepDebtMs = rng() * 40 * 60000;
  const strainNeedMs = 4 * 60000 + rng() * 14 * 60000;
  const neededMs = Math.round(baselineMs + sleepDebtMs + strainNeedMs);
  const totalSleepMs = Math.round(clamp(neededMs * (0.72 + rng() * 0.24), 5.5 * 3600000, 9 * 3600000));
  const awakeMs = Math.round(totalSleepMs * (0.03 + rng() * 0.07));
  const noDataMs = Math.round(totalSleepMs * (0.005 + rng() * 0.02));
  const inBedMs = totalSleepMs + awakeMs + noDataMs;
  const deepMs = Math.round(totalSleepMs * (0.15 + rng() * 0.1));
  const remMs = Math.round(totalSleepMs * (0.18 + rng() * 0.1));
  const lightMs = totalSleepMs - deepMs - remMs;
  const performance = Math.round(clamp((totalSleepMs / neededMs) * 100, 55, 99));
  const efficiency = Math.round(clamp((totalSleepMs / inBedMs) * 100, 80, 97));
  const consistency = Math.round(60 + rng() * 34);
  const respiratoryRate = round(clamp(12 + rng() * 7, 12, 19), 1);
  const disturbances = Math.round(rng() * 12);
  // Bedtime window 22:45–00:30 on the previous local calendar date.
  const bedtimeMinutes = 22 * 60 + 45 + Math.round(rng() * 105);
  const startMs = new Date(year, month - 1, day - 1, 0, bedtimeMinutes).getTime();
  const start = new Date(startMs).toISOString();
  const end = new Date(startMs + inBedMs).toISOString();
  return {
    performance,
    efficiency,
    consistency,
    respiratoryRate,
    disturbances,
    totalSleepMs,
    inBedMs,
    awakeMs,
    lightMs,
    deepMs,
    remMs,
    neededMs,
    start,
    end,
    nap: false,
  };
}

/**
 * Generate the workouts for one local date (0–2 entries, most days at most one).
 *
 * @param {string} date Local date key.
 * @param {number} year
 * @param {number} month 1-based local month.
 * @param {number} day Local day of month.
 * @returns {Array<{ startMs: number, entry: object }>}
 */
function buildWorkouts(date, year, month, day) {
  const rng = createRng(`${date}:workout`);
  const results = [];
  const workoutCount = rng() < 0.58 ? 1 : rng() < 0.06 ? 2 : 0;
  for (let index = 0; index < workoutCount; index += 1) {
    const sport = SPORTS[Math.floor(rng() * SPORTS.length) % SPORTS.length];
    const intensity = clamp(0.55 + rng() * 0.45, 0, 1);
    const durationMs = Math.round((25 + rng() * 65) * 60000);
    const durationHours = durationMs / 3600000;
    const strain = round(clamp(sport.strain[0] + (sport.strain[1] - sport.strain[0]) * intensity, 2, 19.5), 1);
    const avgHr = Math.round(sport.avgHr[0] + (sport.avgHr[1] - sport.avgHr[0]) * intensity);
    const maxHr = Math.round(clamp(avgHr + 20 + rng() * 30, 120, DEMO_BODY.maxHr));
    const kilojoule = Math.round(180 + durationHours * (700 + rng() * 500) + strain * 40);
    let distanceM = null;
    if (sport.distance) {
      const speed = sport.speedKmh[0] + (sport.speedKmh[1] - sport.speedKmh[0]) * intensity;
      distanceM = Math.round(durationHours * speed * 1000);
    }
    const zoneWeights = [
      0.12 + rng() * 0.06,
      0.16 + rng() * 0.06,
      0.2 + rng() * 0.08,
      0.2 + rng() * 0.08,
      0.14 + rng() * 0.06,
      0.08 + rng() * 0.05,
    ];
    const weightTotal = zoneWeights.reduce((total, weight) => total + weight, 0);
    const zones = zoneWeights.map((weight) => Math.round((durationMs * weight) / weightTotal));
    const startMinutes = 7 * 60 + Math.round(rng() * 12 * 60);
    const startMs = new Date(year, month - 1, day, 0, startMinutes).getTime();
    results.push({
      startMs,
      entry: {
        // Derived from the date so overlapping windows produce identical ids.
        id: Number(date.replace(/-/g, '')) * 10 + index,
        date,
        sport: sport.sport,
        sportName: sport.sport,
        strain,
        durationMs,
        avgHr,
        maxHr,
        kilojoule,
        distanceM,
        zones,
      },
    });
  }
  return results;
}

/* ------------------------------------------------------------------------- *
 * Deterministic PRNG + small helpers
 * ------------------------------------------------------------------------- */

/**
 * Create a seeded PRNG for one data stream.
 *
 * @param {string} seedText Stable seed text (date + stream name).
 * @returns {() => number} Function returning floats in [0, 1).
 */
function createRng(seedText) {
  return mulberry32(hashSeed(seedText));
}

/**
 * FNV-1a 32-bit hash of a string.
 *
 * @param {string} text
 * @returns {number} Unsigned 32-bit seed.
 */
function hashSeed(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG (small, fast, good enough for demo data).
 *
 * @param {number} seed Unsigned 32-bit seed.
 * @returns {() => number} Function returning floats in [0, 1).
 */
function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {unknown} value
 * @returns {Date|null}
 */
function validDate(value) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed) : null;
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {number} Clamped integer day count (default 30).
 */
function clampDayCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 30;
  return Math.min(366, Math.max(1, Math.trunc(numeric)));
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {number} value
 * @param {number} digits
 * @returns {number}
 */
function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * @param {Date} date
 * @returns {string} `YYYY-MM-DD` in the host's local calendar.
 */
function localDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * @param {number} value
 * @returns {string}
 */
function pad2(value) {
  return String(value).padStart(2, '0');
}
