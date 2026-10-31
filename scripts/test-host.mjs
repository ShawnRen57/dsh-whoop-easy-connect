/**
 * Offline unit tests for the host-side WHOOP integration.
 *
 * Run with: node --test scripts/test-host.mjs
 *
 * Every HTTP call is served by an injected fake `fetchImpl`; nothing here
 * touches the network, the filesystem, or the DSH profile.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WHOOP_DEFAULTS,
  WhoopApi,
  WhoopApiError,
  aggregateSnapshot,
  normalizeTokens,
  tokensExpiring,
} from '../lib/whoop-api.js';
import { demoSnapshot } from '../lib/demo-data.js';

/* ========================================================================== *
 * Test doubles
 * ========================================================================== */

/**
 * Build a JSON `Response`-like object for the injected fetch.
 *
 * @param {unknown} body
 * @param {{ status?: number, headers?: Record<string, string> }} [options]
 * @returns {object}
 */
function jsonResponse(body, { status = 200, headers = {} } = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => normalized[String(name).toLowerCase()] ?? null },
    async json() {
      return body;
    },
  };
}

/**
 * Build an empty (204) `Response`-like object, as returned by token revocation.
 *
 * @param {number} [status]
 * @returns {object}
 */
function emptyResponse(status = 204) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    async json() {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  };
}

/**
 * Build a 2xx `Response`-like object whose JSON body cannot be parsed.
 *
 * @returns {object}
 */
function brokenJsonResponse() {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    async json() {
      throw new SyntaxError('Unexpected token < in JSON');
    },
  };
}

/**
 * Create a configured `WhoopApi` whose fetch is a recording fake.
 *
 * @param {(url: string, init: object, callIndex: number) => object|Promise<object>} handler
 * @param {object} [overrides] Extra constructor options.
 * @returns {{ api: WhoopApi, calls: Array<{url: string, init: object}> }}
 */
function makeApi(handler, overrides = {}) {
  const calls = [];
  const api = new WhoopApi({
    clientId: 'client-123',
    clientSecret: 'secret-456',
    redirectUri: 'https://example.com/whoop/oauth/callback',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return handler(url, init, calls.length);
    },
    ...overrides,
  });
  return { calls, api };
}

/**
 * Assert that an async call rejects with a `WhoopApiError` with the given code.
 *
 * @param {Promise<unknown>} promise
 * @param {string} code
 * @param {(error: WhoopApiError) => void} [extra]
 * @returns {Promise<WhoopApiError>}
 */
async function rejectsWithCode(promise, code, extra) {
  let thrown = null;
  await assert.rejects(promise, (error) => {
    thrown = error;
    assert.ok(error instanceof WhoopApiError, 'expected WhoopApiError');
    assert.ok(error instanceof Error, 'expected Error subclass');
    assert.equal(error.name, 'WhoopApiError');
    assert.equal(error.code, code);
    return true;
  });
  if (extra) extra(/** @type {WhoopApiError} */ (thrown));
  return thrown;
}

/* ========================================================================== *
 * OAuth
 * ========================================================================== */

test('WHOOP_DEFAULTS exposes the official endpoints and scope set', () => {
  assert.deepEqual(WHOOP_DEFAULTS, {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    apiBase: 'https://api.prod.whoop.com/developer',
    scopes:
      'offline read:profile read:body_measurement read:cycles read:recovery read:sleep read:workout',
  });
});

test('buildAuthorizeUrl includes every required OAuth parameter', () => {
  const { api } = makeApi(() => jsonResponse({}));
  const authorizeUrl = new URL(api.buildAuthorizeUrl('state-abcdefgh'));
  assert.equal(`${authorizeUrl.origin}${authorizeUrl.pathname}`, WHOOP_DEFAULTS.authUrl);
  assert.equal(authorizeUrl.searchParams.get('client_id'), 'client-123');
  assert.equal(
    authorizeUrl.searchParams.get('redirect_uri'),
    'https://example.com/whoop/oauth/callback',
  );
  assert.equal(authorizeUrl.searchParams.get('response_type'), 'code');
  assert.equal(authorizeUrl.searchParams.get('scope'), WHOOP_DEFAULTS.scopes);
  assert.equal(authorizeUrl.searchParams.get('state'), 'state-abcdefgh');
});

test('buildAuthorizeUrl honors endpoint and scope overrides', () => {
  const { api } = makeApi(() => jsonResponse({}), {
    authUrl: 'https://auth.example.test/oauth/authorize',
    scopes: ['offline', 'read:profile'],
  });
  const authorizeUrl = new URL(api.buildAuthorizeUrl('state-abcdefgh'));
  assert.equal(authorizeUrl.origin, 'https://auth.example.test');
  assert.equal(authorizeUrl.searchParams.get('scope'), 'offline read:profile');
});

test('buildAuthorizeUrl rejects a missing or too-short state', () => {
  const { api } = makeApi(() => jsonResponse({}));
  assert.throws(() => api.buildAuthorizeUrl(''), TypeError);
  assert.throws(() => api.buildAuthorizeUrl('short'), TypeError);
  assert.throws(() => api.buildAuthorizeUrl(/** @type {any} */ (undefined)), TypeError);
  assert.throws(() => api.buildAuthorizeUrl(/** @type {any} */ (12345678)), TypeError);
});

test('configured requires client id, client secret and redirect URI', () => {
  const { api } = makeApi(() => jsonResponse({}));
  assert.equal(api.configured, true);
  assert.equal(new WhoopApi({ clientId: 'a' }).configured, false);
  assert.equal(new WhoopApi({ clientId: 'a', clientSecret: 'b' }).configured, false);
  assert.equal(
    new WhoopApi({ clientId: 'a', clientSecret: 'b', redirectUri: 'https://x' }).configured,
    true,
  );
});

test('unconfigured clients reject OAuth operations with api_error', async () => {
  const unconfigured = new WhoopApi({ fetchImpl: async () => jsonResponse({}) });
  await rejectsWithCode(unconfigured.exchangeCode('code-1'), 'api_error');
  await rejectsWithCode(unconfigured.refreshTokens({ refreshToken: 'refresh-1' }), 'api_error');
  assert.throws(() => unconfigured.buildAuthorizeUrl('state-abcdefgh'), WhoopApiError);
});

test('exchangeCode posts a form-encoded authorization_code grant', async () => {
  const { api, calls } = makeApi(() =>
    jsonResponse({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
      scope: 'offline read:profile',
      expires_in: 3600,
    }),
  );
  const tokens = await api.exchangeCode('auth-code-1');

  assert.equal(calls.length, 1);
  const [{ url, init }] = calls;
  assert.equal(url, WHOOP_DEFAULTS.tokenUrl);
  assert.equal(init.method, 'POST');
  assert.match(init.headers['Content-Type'], /^application\/x-www-form-urlencoded/);
  const body = new URLSearchParams(init.body);
  assert.equal(body.get('grant_type'), 'authorization_code');
  assert.equal(body.get('code'), 'auth-code-1');
  assert.equal(body.get('client_id'), 'client-123');
  assert.equal(body.get('client_secret'), 'secret-456');
  assert.equal(body.get('redirect_uri'), 'https://example.com/whoop/oauth/callback');

  assert.equal(tokens.accessToken, 'access-1');
  assert.equal(tokens.refreshToken, 'refresh-1');
  assert.equal(tokens.tokenType, 'bearer');
  assert.equal(tokens.scope, 'offline read:profile');
  assert.ok(Number.isFinite(Date.parse(tokens.expiresAt)));
  assert.ok(Math.abs(Date.parse(tokens.expiresAt) - Date.now() - 3600000) < 120000);
});

test('refreshTokens posts grant_type=refresh_token and preserves a rotated-out refresh token', async () => {
  const { api, calls } = makeApi(() => jsonResponse({ access_token: 'access-2', expires_in: 900 }));
  const tokens = await api.refreshTokens({
    accessToken: 'access-1',
    refreshToken: 'refresh-old',
    expiresAt: '2026-01-01T00:00:00.000Z',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, WHOOP_DEFAULTS.tokenUrl);
  const body = new URLSearchParams(calls[0].init.body);
  assert.equal(body.get('grant_type'), 'refresh_token');
  assert.equal(body.get('refresh_token'), 'refresh-old');
  assert.equal(body.get('scope'), 'offline');
  assert.equal(body.get('client_id'), 'client-123');
  assert.equal(body.get('client_secret'), 'secret-456');
  assert.equal(tokens.accessToken, 'access-2');
  assert.equal(tokens.refreshToken, 'refresh-old');
});

test('refreshTokens without a refresh token fails as unauthorized', async () => {
  const { api, calls } = makeApi(() => jsonResponse({}));
  await rejectsWithCode(api.refreshTokens({ accessToken: 'access-1' }), 'unauthorized');
  assert.equal(calls.length, 0);
});

test('token endpoint OAuth rejections map to unauthorized with the OAuth detail', async () => {
  const { api } = makeApi(() =>
    jsonResponse(
      { error: 'invalid_grant', error_description: 'refresh token expired' },
      { status: 400, headers: { 'content-type': 'application/json' } },
    ),
  );
  await rejectsWithCode(api.refreshTokens({ refreshToken: 'refresh-1' }), 'unauthorized', (error) => {
    assert.equal(error.status, 400);
    assert.match(error.message, /invalid_grant/);
    assert.match(error.message, /refresh token expired/);
    assert.equal(error.retryAfter, null);
  });
});

test('revoke sends a bearer DELETE and treats 401 as already revoked', async () => {
  const responses = [emptyResponse(204), emptyResponse(401)];
  const { api, calls } = makeApi(() => responses.shift());

  assert.equal(await api.revoke('access-1'), true);
  assert.equal(calls[0].url, `${WHOOP_DEFAULTS.apiBase}/v2/user/access`);
  assert.equal(calls[0].init.method, 'DELETE');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer access-1');

  assert.equal(await api.revoke('access-1'), false);
});

/* ========================================================================== *
 * Data endpoints
 * ========================================================================== */

test('fetchProfile and fetchBody GET the documented paths with a bearer token', async () => {
  const profile = { user_id: 1000001, email: 'a@example.com', first_name: 'Alex', last_name: 'Chen' };
  const body = { height_meter: 1.78, weight_kilogram: 70.2, max_heart_rate: 191 };
  const { api, calls } = makeApi((url) =>
    url.endsWith('/v2/user/profile/basic') ? jsonResponse(profile) : jsonResponse(body),
  );

  assert.deepEqual(await api.fetchProfile('access-1'), profile);
  assert.deepEqual(await api.fetchBody('access-1'), body);

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, `${WHOOP_DEFAULTS.apiBase}/v2/user/profile/basic`);
  assert.equal(calls[1].url, `${WHOOP_DEFAULTS.apiBase}/v2/user/measurement/body`);
  for (const call of calls) {
    assert.equal(call.init.method, 'GET');
    assert.equal(call.init.headers.Authorization, 'Bearer access-1');
    assert.equal(call.init.headers.Accept, 'application/json');
  }
});

test('paginated collections follow next_token and send limit/start/end', async () => {
  const start = '2026-05-01T00:00:00.000Z';
  const end = '2026-06-01T00:00:00.000Z';
  const { api, calls } = makeApi((_url, _init, callIndex) =>
    callIndex === 1
      ? jsonResponse({ records: [{ id: 1 }, { id: 2 }], next_token: 'page-2-token' })
      : jsonResponse({ records: [{ id: 3 }], next_token: null }),
  );

  const records = await api.fetchCycles('access-1', { start, end });
  assert.deepEqual(records, [{ id: 1 }, { id: 2 }, { id: 3 }]);

  assert.equal(calls.length, 2);
  const first = new URL(calls[0].url);
  assert.equal(first.pathname, '/developer/v2/cycle');
  assert.equal(first.searchParams.get('limit'), '25');
  assert.equal(first.searchParams.get('start'), start);
  assert.equal(first.searchParams.get('end'), end);
  assert.equal(first.searchParams.get('nextToken'), null);

  const second = new URL(calls[1].url);
  assert.equal(second.searchParams.get('nextToken'), 'page-2-token');
  assert.equal(second.searchParams.get('limit'), '25');
  for (const call of calls) {
    assert.equal(call.init.headers.Authorization, 'Bearer access-1');
  }
});

test('pagination stops at the 20-page safety cap', async () => {
  const { api, calls } = makeApi(() => jsonResponse({ records: [{ id: 1 }], next_token: 'again' }));
  const records = await api.fetchRecovery('access-1');
  assert.equal(calls.length, 20);
  assert.equal(records.length, 20);
});

test('all four collection methods hit the documented WHOOP paths', async () => {
  const { api, calls } = makeApi(() => jsonResponse({ records: [], next_token: null }));
  await api.fetchRecovery('access-1');
  await api.fetchSleep('access-1');
  await api.fetchCycles('access-1');
  await api.fetchWorkouts('access-1');
  assert.deepEqual(
    calls.map((call) => new URL(call.url).pathname),
    [
      '/developer/v2/recovery',
      '/developer/v2/activity/sleep',
      '/developer/v2/cycle',
      '/developer/v2/activity/workout',
    ],
  );
  for (const call of calls) {
    assert.equal(new URL(call.url).searchParams.get('limit'), '25');
    assert.equal(new URL(call.url).searchParams.get('start'), null);
    assert.equal(new URL(call.url).searchParams.get('end'), null);
  }
});

/* ========================================================================== *
 * Error mapping
 * ========================================================================== */

test('401 responses map to unauthorized', async () => {
  const { api } = makeApi(() => jsonResponse({ error: 'unauthorized' }, { status: 401 }));
  await rejectsWithCode(api.fetchRecovery('access-1'), 'unauthorized', (error) => {
    assert.equal(error.status, 401);
  });
});

test('429 responses map to rate_limited and expose Retry-After', async () => {
  const { api } = makeApi(() =>
    jsonResponse({ error: 'rate_limited' }, { status: 429, headers: { 'retry-after': '7' } }),
  );
  await rejectsWithCode(api.fetchSleep('access-1'), 'rate_limited', (error) => {
    assert.equal(error.status, 429);
    assert.equal(error.retryAfter, 7);
  });
});

test('other HTTP failures map to api_error with the status and body detail', async () => {
  const { api } = makeApi(() => jsonResponse({ message: 'upstream exploded' }, { status: 500 }));
  await rejectsWithCode(api.fetchWorkouts('access-1'), 'api_error', (error) => {
    assert.equal(error.status, 500);
    assert.match(error.message, /HTTP 500/);
    assert.match(error.message, /upstream exploded/);
  });
});

test('transport failures map to network', async () => {
  const { api } = makeApi(() => {
    throw new TypeError('fetch failed');
  });
  await rejectsWithCode(api.fetchCycles('access-1'), 'network', (error) => {
    assert.match(error.message, /fetch failed/);
    assert.equal(error.status, null);
  });
});

test('unparsable JSON maps to bad_response', async () => {
  const { api } = makeApi(() => brokenJsonResponse());
  await rejectsWithCode(api.fetchProfile('access-1'), 'bad_response');
});

test('a collection payload without a records array maps to bad_response', async () => {
  const { api } = makeApi(() => jsonResponse({ items: [] }));
  await rejectsWithCode(api.fetchRecovery('access-1'), 'bad_response');
});

test('a missing access token fails as unauthorized before any request', async () => {
  const { api, calls } = makeApi(() => jsonResponse({}));
  await rejectsWithCode(api.fetchProfile(/** @type {any} */ (undefined)), 'unauthorized');
  await rejectsWithCode(api.fetchSleep(''), 'unauthorized');
  assert.equal(calls.length, 0);
});

/* ========================================================================== *
 * Token helpers
 * ========================================================================== */

test('normalizeTokens converts a WHOOP token response into the plugin shape', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');
  const tokens = normalizeTokens(
    {
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
      scope: 'offline read:sleep',
      expires_in: 3600,
    },
    now,
  );
  assert.deepEqual(tokens, {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    tokenType: 'bearer',
    scope: 'offline read:sleep',
    expiresAt: '2026-06-15T13:00:00.000Z',
  });
});

test('normalizeTokens rejects a response without an access token', () => {
  assert.throws(() => normalizeTokens({}), WhoopApiError);
  assert.throws(() => normalizeTokens(null), WhoopApiError);
});

test('normalizeTokens passes an already-normalized bundle through unchanged', () => {
  const first = normalizeTokens(
    { access_token: 'access-1', refresh_token: 'refresh-1', expires_in: 60 },
    new Date('2026-06-15T12:00:00.000Z'),
  );
  const second = normalizeTokens(first, new Date('2026-06-15T13:00:00.000Z'));
  assert.deepEqual(second, first);
  assert.equal(second.expiresAt, '2026-06-15T12:01:00.000Z');
});

test('tokensExpiring handles missing, expiring and fresh tokens', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');
  assert.equal(tokensExpiring(null, 120000, now), true);
  assert.equal(tokensExpiring({}, 120000, now), true);
  assert.equal(
    tokensExpiring(
      { accessToken: 'a', expiresAt: '2026-06-15T13:00:00.000Z' },
      120000,
      now,
    ),
    false,
  );
  assert.equal(
    tokensExpiring(
      { accessToken: 'a', expiresAt: '2026-06-15T12:01:00.000Z' },
      120000,
      now,
    ),
    true,
  );
  assert.equal(
    tokensExpiring({ accessToken: 'a', expiresAt: '2026-06-15T11:59:00.000Z' }, 120000, now),
    true,
  );
  // Unknown expiry: attempt the request rather than forcing a refresh loop.
  assert.equal(tokensExpiring({ accessToken: 'a', expiresAt: null }, 120000, now), false);
});

/* ========================================================================== *
 * Aggregation fixture
 * ========================================================================== */

const REFERENCE_NOW = new Date('2026-06-15T12:00:00.000Z');

const CYCLE_KEYS = ['avgHr', 'end', 'kilojoule', 'maxHr', 'start', 'steps', 'strain'];
const RECOVERY_KEYS = ['calibrating', 'hrv', 'rhr', 'score', 'skinTemp', 'spo2', 'state'];
const SLEEP_KEYS = [
  'awakeMs',
  'consistency',
  'deepMs',
  'disturbances',
  'efficiency',
  'end',
  'inBedMs',
  'lightMs',
  'nap',
  'neededMs',
  'performance',
  'remMs',
  'respiratoryRate',
  'start',
  'totalSleepMs',
];
const DAY_KEYS = ['cycle', 'date', 'recovery', 'sleep'];
const WORKOUT_KEYS = [
  'avgHr',
  'date',
  'distanceM',
  'durationMs',
  'id',
  'kilojoule',
  'maxHr',
  'sport',
  'sportName',
  'strain',
  'zones',
];
const PROFILE_KEYS = ['email', 'firstName', 'lastName', 'userId'];
const BODY_KEYS = ['heightM', 'maxHr', 'weightKg'];

/**
 * @param {number} value
 * @returns {string}
 */
function pad2(value) {
  return String(value).padStart(2, '0');
}

/**
 * @param {Date} date
 * @returns {string} `YYYY-MM-DD` in the host's local calendar.
 */
function localDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * The trailing `count` local date keys, ascending, ending on `now`'s local date.
 *
 * @param {Date} now
 * @param {number} count
 * @returns {string[]}
 */
function localDates(now, count) {
  const dates = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    dates.push(localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)));
  }
  return dates;
}

/**
 * @param {string} dateKey
 * @param {number} hour UTC hour.
 * @returns {string} ISO instant.
 */
function utcAt(dateKey, hour) {
  return `${dateKey}T${pad2(hour)}:00:00.000Z`;
}

/**
 * @param {string} dateKey
 * @param {number} hour Local hour.
 * @param {number} [minute] Local minute.
 * @returns {string} ISO instant.
 */
function localAt(dateKey, hour, minute = 0) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0).toISOString();
}

/**
 * @param {string} dateKey
 * @returns {string} ISO instant of local midnight.
 */
function localMidnight(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toISOString();
}

/**
 * Shift a `YYYY-MM-DD` key by calendar days (local-calendar arithmetic).
 *
 * @param {string} dateKey
 * @param {number} days
 * @returns {string}
 */
function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return localDateKey(new Date(year, month - 1, day + days));
}

/**
 * WHOOP `timezone_offset` string for a host-local instant (e.g. `"+08:00"`).
 *
 * Fixtures use this so they exercise the same date bucketing on any machine
 * time zone.
 *
 * @param {string} instant ISO instant.
 * @returns {string}
 */
function hostOffsetAt(instant) {
  const minutesEast = -new Date(Date.parse(instant)).getTimezoneOffset();
  const sign = minutesEast >= 0 ? '+' : '-';
  const absolute = Math.abs(minutesEast);
  return `${sign}${pad2(Math.floor(absolute / 60))}:${pad2(absolute % 60)}`;
}

/**
 * @param {string} offset `+HH:MM` / `-HH:MM` offset.
 * @returns {number} Offset in minutes east of UTC.
 */
function offsetMinutes(offset) {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  assert.ok(match, `invalid timezone offset ${offset}`);
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/**
 * Expected bucket date when an instant is resolved with an explicit offset.
 *
 * @param {string} instant ISO instant.
 * @param {string} offset `+HH:MM` / `-HH:MM`.
 * @returns {string} `YYYY-MM-DD`.
 */
function dateKeyAfterOffset(instant, offset) {
  return new Date(Date.parse(instant) + offsetMinutes(offset) * 60000).toISOString().slice(0, 10);
}

/**
 * Raw WHOOP sleep score payload for fixture sleeps.
 *
 * @param {number} inBedMs Total in-bed time.
 * @param {number} [disturbances] Disturbance count.
 * @returns {object}
 */
function makeSleepScore(inBedMs, disturbances = 4) {
  return {
    stage_summary: {
      total_in_bed_time_milli: inBedMs,
      total_awake_time_milli: 1800000,
      total_no_data_time_milli: 0,
      total_light_sleep_time_milli: 15000000,
      total_slow_wave_sleep_time_milli: 6000000,
      total_rem_sleep_time_milli: 5000000,
      sleep_cycle_count: 5,
      disturbance_count: disturbances,
    },
    sleep_needed: {
      baseline_milli: 28800000,
      need_from_sleep_debt_milli: 1800000,
      need_from_recent_strain_milli: 1200000,
      need_from_recent_nap_milli: 0,
    },
    respiratory_rate: 14.2,
    sleep_performance_percentage: 88,
    sleep_consistency_percentage: 85,
    sleep_efficiency_percentage: 92,
  };
}

/**
 * Build raw WHOOP payloads that exercise wake-date bucketing, null fills,
 * dedupe and sorting. Dates are host-local and `timezone_offset` values are
 * derived from the host, so the fixture behaves the same on any machine.
 *
 * @returns {{keys: string[], input: object}}
 */
function buildAggregateFixture() {
  const keys = localDates(REFERENCE_NOW, 6);
  const [d0, d1, d2, d3, d4, d5] = keys;

  const cycles = [
    {
      // Bedtime start on the evening of d0 -> activity date d1.
      id: 101,
      start: localAt(d0, 22, 30),
      end: localAt(d1, 22, 30),
      timezone_offset: hostOffsetAt(localAt(d0, 22, 30)),
      score_state: 'SCORED',
      score: { strain: 12.4, kilojoule: 8200, average_heart_rate: 71, max_heart_rate: 152 },
      step_count: 9120,
    },
    {
      // Wake-start cycle on d2 morning -> stays on d2.
      id: 102,
      start: localAt(d2, 8),
      end: null,
      timezone_offset: hostOffsetAt(localAt(d2, 8)),
      score_state: 'PENDING_SCORE',
      score: {},
      step_count: 1200,
    },
    {
      // Bedtime start on the evening of d2 -> activity date d3.
      id: 103,
      start: localAt(d2, 23),
      end: localAt(d3, 22, 30),
      timezone_offset: hostOffsetAt(localAt(d2, 23)),
      score_state: 'SCORED',
      score: { strain: 9.1, kilojoule: 6400, average_heart_rate: 66, max_heart_rate: 141 },
      step_count: 7400,
    },
    {
      // Current bedtime-start cycle from the evening of d4 -> activity date d5.
      // d4 itself stays empty to exercise null-filled days.
      id: 104,
      start: localAt(d4, 22, 30),
      end: null,
      timezone_offset: hostOffsetAt(localAt(d4, 22, 30)),
      score_state: 'SCORED',
      score: { strain: 4.2, kilojoule: 2300, average_heart_rate: 61, max_heart_rate: 128 },
      step_count: 3100,
    },
  ];

  const recoveries = [
    // Older duplicate for the d1 recovery: must lose against the later one.
    {
      cycle_id: 101,
      sleep_id: 201,
      created_at: localAt(d1, 5),
      score_state: 'SCORED',
      score: {
        user_calibrating: false,
        recovery_score: 50,
        resting_heart_rate: 58,
        hrv_rmssd_milli: 44,
        spo2_percentage: 96,
        skin_temp_celsius: 33.1,
      },
    },
    {
      cycle_id: 101,
      sleep_id: 202,
      created_at: localAt(d1, 6, 30),
      score_state: 'SCORED',
      score: {
        user_calibrating: false,
        recovery_score: 72,
        resting_heart_rate: 52,
        hrv_rmssd_milli: 68.2,
        spo2_percentage: 97.1,
        skin_temp_celsius: 33.6,
      },
    },
    // Scored on the d2 morning.
    {
      cycle_id: 102,
      sleep_id: 203,
      created_at: localAt(d2, 6, 15),
      score_state: 'SCORED',
      score: {
        user_calibrating: false,
        recovery_score: 61,
        resting_heart_rate: 55,
        hrv_rmssd_milli: 55.5,
        spo2_percentage: 96.4,
        skin_temp_celsius: 33.2,
      },
    },
    // Unscored recovery must be ignored.
    {
      cycle_id: 104,
      sleep_id: 205,
      created_at: localAt(d5, 6),
      score_state: 'PENDING_SCORE',
      score: {},
    },
    // Recovery whose cycle is not in the payload: buckets by created_at date.
    {
      cycle_id: 777,
      sleep_id: 999,
      created_at: localAt(d0, 6),
      score_state: 'SCORED',
      score: { user_calibrating: true, recovery_score: 33 },
    },
  ];

  const sleeps = [
    {
      // Night ending on d1: two candidates, longest in-bed record must win.
      id: 201,
      cycle_id: 101,
      start: localAt(d0, 23),
      end: localAt(d1, 7),
      timezone_offset: hostOffsetAt(localAt(d1, 7)),
      nap: false,
      score_state: 'SCORED',
      score: makeSleepScore(27000000, 3),
    },
    {
      id: 202,
      cycle_id: 101,
      start: localAt(d0, 22, 15),
      end: localAt(d1, 7),
      timezone_offset: hostOffsetAt(localAt(d1, 7)),
      nap: false,
      score_state: 'SCORED',
      score: makeSleepScore(30000000, 5),
    },
    {
      // Nap on d2: ignored.
      id: 203,
      cycle_id: 102,
      start: localAt(d2, 6),
      end: localAt(d2, 7),
      nap: true,
      score_state: 'SCORED',
      score: makeSleepScore(3600000, 1),
    },
    {
      // Night ending on d3.
      id: 204,
      cycle_id: 103,
      start: localAt(d2, 23, 15),
      end: localAt(d3, 7),
      timezone_offset: hostOffsetAt(localAt(d3, 7)),
      nap: false,
      score_state: 'SCORED',
      score: makeSleepScore(28000000),
    },
    {
      // Night ending on d5.
      id: 205,
      cycle_id: 104,
      start: localAt(d4, 23),
      end: localAt(d5, 7),
      timezone_offset: hostOffsetAt(localAt(d5, 7)),
      nap: false,
      score_state: 'SCORED',
      score: makeSleepScore(26000000),
    },
    {
      // Orphan sleep (cycle not fetched): started the evening before d0 but
      // wakes on d0, so wake-date bucketing puts it on d0.
      id: 206,
      cycle_id: 999,
      start: localAt(shiftDateKey(d0, -1), 22, 45),
      end: localAt(d0, 6, 45),
      timezone_offset: hostOffsetAt(localAt(d0, 6, 45)),
      nap: false,
      score_state: 'SCORED',
      score: makeSleepScore(25000000, 2),
    },
  ];

  const runningZones = {
    zone_zero_milli: 60000,
    zone_one_milli: 120000,
    zone_two_milli: 300000,
    zone_three_milli: 900000,
    zone_four_milli: 1200000,
    zone_five_milli: 1020000,
  };

  const workouts = [
    {
      id: 301,
      start: localAt(d1, 10),
      end: localAt(d1, 11),
      timezone_offset: hostOffsetAt(localAt(d1, 10)),
      sport_name: 'running',
      score_state: 'SCORED',
      score: {
        strain: 8.4,
        average_heart_rate: 145,
        max_heart_rate: 168,
        kilojoule: 1200,
        percent_recorded: 98,
        distance_meter: 8200,
        zone_durations: runningZones,
      },
    },
    {
      id: 302,
      start: localAt(d5, 9),
      end: localAt(d5, 10),
      timezone_offset: hostOffsetAt(localAt(d5, 9)),
      sport_name: 'cycling',
      score_state: 'SCORED',
      score: {
        strain: 6.1,
        average_heart_rate: 132,
        max_heart_rate: 155,
        kilojoule: 900,
        percent_recorded: 100,
        distance_meter: 21000,
        zone_durations: runningZones,
      },
    },
    {
      id: 303,
      start: localAt(d2, 18),
      end: localAt(d2, 19),
      timezone_offset: hostOffsetAt(localAt(d2, 18)),
      sport_name: 'yoga',
      score_state: 'PENDING_SCORE',
      score: {},
    },
  ];

  return {
    keys,
    input: {
      profile: {
        user_id: 1000001,
        email: 'alex.chen@example.com',
        first_name: 'Alex',
        last_name: 'Chen',
      },
      body: { height_meter: 1.78, weight_kilogram: 70.2, max_heart_rate: 191 },
      recoveries,
      sleeps,
      cycles,
      workouts,
      days: 6,
      now: REFERENCE_NOW,
    },
  };
}

/**
 * Assert that a value tree contains no `undefined` values and no `NaN` numbers.
 *
 * @param {unknown} value
 * @param {string} [path]
 * @returns {void}
 */
function assertClean(value, path = '$') {
  if (value === undefined) assert.fail(`undefined value at ${path}`);
  if (typeof value === 'number' && Number.isNaN(value)) assert.fail(`NaN value at ${path}`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertClean(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) assertClean(child, `${path}.${key}`);
  }
}

/**
 * @param {string[]} actual
 * @param {string[]} expected
 * @param {string} [label]
 * @returns {void}
 */
function assertKeys(actual, expected, label = 'object') {
  assert.deepEqual([...actual].sort(), [...expected].sort(), `unexpected keys on ${label}`);
}

/* ========================================================================== *
 * Aggregation
 * ========================================================================== */

test('aggregateSnapshot buckets wake-date days, fills gaps and sorts ascending', () => {
  const { keys, input } = buildAggregateFixture();
  const snapshot = aggregateSnapshot(input);
  const [d0, d1, d2, d3, d4, d5] = keys;

  assert.deepEqual(snapshot.days.map((day) => day.date), keys);
  for (const day of snapshot.days) assertKeys(Object.keys(day), DAY_KEYS, `day ${day.date}`);

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));

  // Day 0: an orphan recovery and an orphan sleep (both without their cycle in
  // the payload) land on their own created/wake date.
  assert.equal(byDate[d0].cycle, null);
  assert.equal(byDate[d0].recovery.score, 33);
  assert.equal(byDate[d0].recovery.calibrating, true);
  assert.equal(byDate[d0].sleep.inBedMs, 25000000);
  assert.equal(byDate[d0].sleep.disturbances, 2);

  // Day 1: bedtime-start cycle from the evening before, that morning's recovery
  // and the longest of two in-bed sleep records.
  assert.equal(byDate[d1].cycle.strain, 12.4);
  assert.equal(byDate[d1].cycle.kilojoule, 8200);
  assert.equal(byDate[d1].cycle.avgHr, 71);
  assert.equal(byDate[d1].cycle.maxHr, 152);
  assert.equal(byDate[d1].cycle.steps, 9120);
  assert.equal(byDate[d1].cycle.start, localAt(d0, 22, 30));
  assert.equal(byDate[d1].cycle.end, localAt(d1, 22, 30));
  assert.equal(byDate[d1].recovery.score, 72);
  assert.equal(byDate[d1].recovery.state, 'SCORED');
  assert.equal(byDate[d1].recovery.hrv, 68.2);
  assert.equal(byDate[d1].recovery.rhr, 52);
  assert.equal(byDate[d1].recovery.spo2, 97.1);
  assert.equal(byDate[d1].recovery.skinTemp, 33.6);
  assert.equal(byDate[d1].recovery.calibrating, false);
  assert.equal(byDate[d1].sleep.inBedMs, 30000000);
  assert.equal(byDate[d1].sleep.totalSleepMs, 26000000);
  assert.equal(byDate[d1].sleep.neededMs, 31800000);
  assert.equal(byDate[d1].sleep.performance, 88);
  assert.equal(byDate[d1].sleep.efficiency, 92);
  assert.equal(byDate[d1].sleep.consistency, 85);
  assert.equal(byDate[d1].sleep.respiratoryRate, 14.2);
  assert.equal(byDate[d1].sleep.disturbances, 5);
  assert.equal(byDate[d1].sleep.lightMs, 15000000);
  assert.equal(byDate[d1].sleep.deepMs, 6000000);
  assert.equal(byDate[d1].sleep.remMs, 5000000);
  assert.equal(byDate[d1].sleep.awakeMs, 1800000);
  assert.equal(byDate[d1].sleep.nap, false);

  // Day 2: wake-start pending cycle shows steps with null scores; the only
  // sleep that day is a nap, so sleep stays null.
  assert.equal(byDate[d2].cycle.strain, null);
  assert.equal(byDate[d2].cycle.avgHr, null);
  assert.equal(byDate[d2].cycle.end, null);
  assert.equal(byDate[d2].cycle.steps, 1200);
  assert.equal(byDate[d2].recovery.score, 61);
  assert.equal(byDate[d2].sleep, null);

  // Day 3: bedtime-start cycle + sleep, no scored recovery.
  assert.equal(byDate[d3].cycle.strain, 9.1);
  assert.equal(byDate[d3].recovery, null);
  assert.equal(byDate[d3].sleep.inBedMs, 28000000);

  // Day 4: intentionally empty -> every field null-filled.
  assert.deepEqual(byDate[d4], { date: d4, recovery: null, cycle: null, sleep: null });

  // Day 5: in-progress bedtime-start cycle, unscored recovery ignored.
  assert.equal(byDate[d5].cycle.strain, 4.2);
  assert.equal(byDate[d5].cycle.end, null);
  assert.equal(byDate[d5].recovery, null);
  assert.equal(byDate[d5].sleep.inBedMs, 26000000);

  // today is the last bucket.
  assert.deepEqual(snapshot.today, {
    date: d5,
    recovery: byDate[d5].recovery,
    cycle: byDate[d5].cycle,
    sleep: byDate[d5].sleep,
  });

  assertClean(snapshot);
});

test('aggregateSnapshot maps profile/body and the range envelope', () => {
  const { keys, input } = buildAggregateFixture();
  const snapshot = aggregateSnapshot(input);

  assertKeys(Object.keys(snapshot.profile), PROFILE_KEYS, 'profile');
  assert.deepEqual(snapshot.profile, {
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@example.com',
    userId: 1000001,
  });
  assertKeys(Object.keys(snapshot.body), BODY_KEYS, 'body');
  assert.deepEqual(snapshot.body, { heightM: 1.78, weightKg: 70.2, maxHr: 191 });

  assert.equal(snapshot.updatedAt, REFERENCE_NOW.toISOString());
  assert.deepEqual(snapshot.range, {
    start: localMidnight(keys[0]),
    end: REFERENCE_NOW.toISOString(),
    days: 6,
  });
  assert.deepEqual(snapshot.warnings, []);
});

test('aggregateSnapshot maps and sorts workouts newest first', () => {
  const { keys, input } = buildAggregateFixture();
  const snapshot = aggregateSnapshot(input);
  const [, d1, , , , d5] = keys;

  assert.equal(snapshot.workouts.length, 2);
  assert.deepEqual(
    snapshot.workouts.map((workout) => workout.id),
    [302, 301],
  );
  for (const workout of snapshot.workouts) {
    assertKeys(Object.keys(workout), WORKOUT_KEYS, `workout ${workout.id}`);
  }

  const [latest, older] = snapshot.workouts;
  assert.equal(latest.sport, 'cycling');
  assert.equal(latest.sportName, 'cycling');
  assert.equal(latest.date, d5);
  assert.equal(latest.durationMs, 3600000);
  assert.equal(latest.distanceM, 21000);

  assert.equal(older.sport, 'running');
  assert.equal(older.date, d1);
  assert.equal(older.durationMs, 3600000);
  assert.equal(older.strain, 8.4);
  assert.equal(older.avgHr, 145);
  assert.equal(older.maxHr, 168);
  assert.equal(older.kilojoule, 1200);
  assert.equal(older.distanceM, 8200);
  assert.deepEqual(older.zones, [60000, 120000, 300000, 900000, 1200000, 1020000]);

  assertClean(snapshot.workouts);
});

test('aggregateSnapshot accepts raw { records } page payloads', () => {
  const { input } = buildAggregateFixture();
  const plain = aggregateSnapshot(input);
  const wrapped = aggregateSnapshot({
    ...input,
    recoveries: { records: input.recoveries, next_token: 'ignored' },
    sleeps: { records: input.sleeps },
    cycles: { records: input.cycles },
    workouts: { records: input.workouts },
  });
  assert.deepEqual(wrapped.days, plain.days);
  assert.deepEqual(wrapped.workouts, plain.workouts);
  assert.deepEqual(wrapped.today, plain.today);
});

test('aggregateSnapshot buckets cycles by activity day (bedtime starts roll forward)', () => {
  const keys = localDates(REFERENCE_NOW, 7);
  const [k0, k1, k2, k3, k4, k5, k6] = keys;
  const cycle = (id, start, timezoneOffset, strain) => ({
    id,
    start,
    end: null,
    timezone_offset: timezoneOffset,
    score_state: 'SCORED',
    score: { strain },
    step_count: Math.round(strain * 100),
  });

  const snapshot = aggregateSnapshot({
    now: REFERENCE_NOW,
    days: 7,
    cycles: [
      // 16:59 local: still a wake-start cycle -> stays on k0.
      cycle(1, localAt(k0, 16, 59), hostOffsetAt(localAt(k0, 16, 59)), 4.4),
      // 08:00 local: wake-start -> stays on k1.
      cycle(2, localAt(k1, 8), hostOffsetAt(localAt(k1, 8)), 5.1),
      // Explicit non-host offset: 20:00Z + 08:00 is 04:00 local the next date,
      // a wake-start cycle -> k2.
      cycle(3, utcAt(k1, 20), '+08:00', 6.2),
      // 22:30 local on k2: bedtime start -> rolls to k3.
      cycle(4, localAt(k2, 22, 30), hostOffsetAt(localAt(k2, 22, 30)), 7.3),
      // 17:00 local exactly: bedtime start -> rolls to k4.
      cycle(5, localAt(k3, 17), hostOffsetAt(localAt(k3, 17)), 8.4),
      // 00:30 local on k5: after-midnight wake-start -> stays on k5.
      cycle(6, localAt(k5, 0, 30), hostOffsetAt(localAt(k5, 0, 30)), 9.5),
    ],
  });

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));
  assert.equal(byDate[k0].cycle.strain, 4.4);
  assert.equal(byDate[k1].cycle.strain, 5.1);
  assert.equal(byDate[k2].cycle.strain, 6.2);
  assert.equal(byDate[k2].cycle.steps, 620);
  assert.equal(byDate[k3].cycle.strain, 7.3);
  assert.equal(byDate[k4].cycle.strain, 8.4);
  assert.equal(byDate[k5].cycle.strain, 9.5);
  assert.equal(byDate[k6].cycle, null);
  assertClean(snapshot);
});

test('aggregateSnapshot falls back to UTC when cycle timezone_offset is missing', () => {
  const keys = localDates(REFERENCE_NOW, 4);
  const [k0, k1, k2, k3] = keys;
  const snapshot = aggregateSnapshot({
    now: REFERENCE_NOW,
    days: 4,
    cycles: [
      // 23:00 UTC without an offset: UTC hour 23 >= 17 -> next UTC date k1.
      {
        id: 1,
        start: utcAt(k0, 23),
        end: null,
        score_state: 'SCORED',
        score: { strain: 3.3 },
        step_count: 330,
      },
      // Explicit "Z" offset: 20:00Z rolls to the next UTC date k3.
      {
        id: 2,
        start: utcAt(k2, 20),
        end: null,
        timezone_offset: 'Z',
        score_state: 'SCORED',
        score: { strain: 2.2 },
        step_count: 220,
      },
    ],
  });

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));
  assert.equal(byDate[k0].cycle, null);
  assert.equal(byDate[k1].cycle.strain, 3.3);
  assert.equal(byDate[k2].cycle, null);
  assert.equal(byDate[k3].cycle.strain, 2.2);
  assertClean(snapshot);
});

test('aggregateSnapshot buckets recoveries by created_at, not cycle start', () => {
  const keys = localDates(REFERENCE_NOW, 5);
  const [k0, k1, k2, k3, k4] = keys;
  const cycle = (id, start, strain) => ({
    id,
    start,
    end: null,
    timezone_offset: hostOffsetAt(start),
    score_state: 'SCORED',
    score: { strain },
    step_count: Math.round(strain * 10),
  });

  const snapshot = aggregateSnapshot({
    now: REFERENCE_NOW,
    days: 5,
    cycles: [
      // 00:30 local on k0: after-midnight wake-start -> stays on k0.
      cycle(900, localAt(k0, 0, 30), 6.6),
      // 23:00 local on k1: bedtime start -> activity date k2.
      cycle(901, localAt(k1, 23), 7.7),
      // 08:00 local on k3: wake-start -> stays on k3.
      cycle(902, localAt(k3, 8), 8.8),
    ],
    recoveries: [
      // Scored the morning after cycle 901 started: lands on k2 with its cycle.
      {
        cycle_id: 901,
        created_at: localAt(k2, 6, 30),
        score_state: 'SCORED',
        score: { recovery_score: 66, user_calibrating: false },
      },
      // Scored on the k3 morning alongside the morning-start cycle.
      {
        cycle_id: 902,
        created_at: localAt(k3, 6, 45),
        score_state: 'SCORED',
        score: { recovery_score: 77, user_calibrating: false },
      },
      // Scored on k0 morning although its cycle is not in the payload.
      {
        cycle_id: 4242,
        created_at: localAt(k0, 6),
        score_state: 'SCORED',
        score: { recovery_score: 55, user_calibrating: true },
      },
      // Unscored recovery is ignored.
      {
        cycle_id: 901,
        created_at: localAt(k2, 7),
        score_state: 'PENDING_SCORE',
        score: {},
      },
    ],
  });

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));
  assert.equal(byDate[k0].cycle.strain, 6.6);
  assert.equal(byDate[k0].recovery.score, 55);
  assert.equal(byDate[k0].recovery.calibrating, true);
  assert.equal(byDate[k1].cycle, null); // old code bucketed the bedtime cycle here
  assert.equal(byDate[k1].recovery, null);
  assert.equal(byDate[k2].cycle.strain, 7.7);
  assert.equal(byDate[k2].recovery.score, 66); // cycle + recovery share the wake date
  assert.equal(byDate[k3].cycle.strain, 8.8);
  assert.equal(byDate[k3].recovery.score, 77);
  assert.equal(byDate[k4].recovery, null);
  assertClean(snapshot);
});

test('aggregateSnapshot resolves recovery dates with the owning cycle timezone offset', () => {
  const keys = localDates(REFERENCE_NOW, 4);
  const [k0, k1] = keys;
  const hostOffset = hostOffsetAt(REFERENCE_NOW);
  // Choose an offset that differs from the host so a host-local fallback would
  // put the recovery on a different date than the explicit-offset resolution.
  const owningOffset = hostOffset === '+08:00' ? '-05:00' : '+08:00';
  const createdInstant = utcAt(k1, 20);
  const expectedDate = dateKeyAfterOffset(createdInstant, owningOffset);
  assert.notEqual(expectedDate, k0);

  const snapshot = aggregateSnapshot({
    now: REFERENCE_NOW,
    days: 4,
    cycles: [
      // 08:00Z resolves to a wake-start cycle on k0 under either test offset.
      {
        id: 902,
        start: utcAt(k0, 8),
        end: null,
        timezone_offset: owningOffset,
        score_state: 'SCORED',
        score: { strain: 1.1 },
        step_count: 110,
      },
    ],
    recoveries: [
      {
        cycle_id: 902,
        created_at: createdInstant,
        score_state: 'SCORED',
        score: { recovery_score: 44, user_calibrating: false },
      },
    ],
  });

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));
  assert.equal(byDate[k0].cycle.strain, 1.1);
  assert.equal(byDate[expectedDate].recovery.score, 44);
  // The recovery must not be bucketed by cycle start / host-local fallback.
  assert.equal(byDate[k0].recovery, null);
  assertClean(snapshot);
});

test('aggregateSnapshot buckets sleeps by wake date (end), not bedtime', () => {
  const keys = localDates(REFERENCE_NOW, 4);
  const [k0, k1, k2, k3] = keys;
  const snapshot = aggregateSnapshot({
    now: REFERENCE_NOW,
    days: 4,
    sleeps: [
      // Bedtime on k0, wakes on k1 -> k1.
      {
        id: 201,
        cycle_id: 101,
        start: localAt(k0, 23),
        end: localAt(k1, 6, 45),
        timezone_offset: hostOffsetAt(localAt(k1, 6, 45)),
        nap: false,
        score_state: 'SCORED',
        score: makeSleepScore(27000000, 3),
      },
      // Same wake date: the longest in-bed record wins.
      {
        id: 202,
        cycle_id: 101,
        start: localAt(k0, 22, 15),
        end: localAt(k1, 7, 15),
        timezone_offset: hostOffsetAt(localAt(k1, 7, 15)),
        nap: false,
        score_state: 'SCORED',
        score: makeSleepScore(30000000, 6),
      },
      // Nap on k2: ignored.
      {
        id: 203,
        cycle_id: 102,
        start: localAt(k2, 6),
        end: localAt(k2, 6, 45),
        nap: true,
        score_state: 'SCORED',
        score: makeSleepScore(2700000, 1),
      },
      // Missing timezone_offset -> host-local fallback, wakes on k3.
      {
        id: 204,
        cycle_id: 103,
        start: localAt(k2, 23, 30),
        end: localAt(k3, 7),
        nap: false,
        score_state: 'SCORED',
        score: makeSleepScore(25000000, 2),
      },
    ],
  });

  const byDate = Object.fromEntries(snapshot.days.map((day) => [day.date, day]));
  assert.equal(byDate[k0].sleep, null); // old start-date bucketing put the night here
  assert.equal(byDate[k1].sleep.inBedMs, 30000000);
  assert.equal(byDate[k1].sleep.disturbances, 6);
  assert.equal(byDate[k2].sleep, null);
  assert.equal(byDate[k3].sleep.inBedMs, 25000000);
  assertClean(snapshot);
});

test('aggregateSnapshot degrades gracefully with no data', () => {
  const snapshot = aggregateSnapshot({ now: REFERENCE_NOW });
  assert.equal(snapshot.days.length, 30);
  assert.deepEqual(snapshot.days.map((day) => day.date), localDates(REFERENCE_NOW, 30));
  for (const day of snapshot.days) {
    assert.deepEqual(day, { date: day.date, recovery: null, cycle: null, sleep: null });
  }
  assert.equal(snapshot.profile, null);
  assert.equal(snapshot.body, null);
  assert.deepEqual(snapshot.workouts, []);
  assert.deepEqual(snapshot.today, {
    date: localDateKey(REFERENCE_NOW),
    recovery: null,
    cycle: null,
    sleep: null,
  });
  assertClean(snapshot);
});

test('aggregateSnapshot caps workouts at 50 entries', () => {
  const rawWorkouts = Array.from({ length: 60 }, (_value, index) => ({
    id: 5000 + index,
    start: new Date(REFERENCE_NOW.getTime() - index * 3600000).toISOString(),
    end: new Date(REFERENCE_NOW.getTime() - index * 3600000 + 1800000).toISOString(),
    sport_name: 'running',
    score_state: 'SCORED',
    score: { strain: 5 },
  }));
  const snapshot = aggregateSnapshot({ now: REFERENCE_NOW, days: 5, workouts: rawWorkouts });
  assert.equal(snapshot.workouts.length, 50);
  assert.equal(snapshot.workouts[0].id, 5000);
  assert.equal(snapshot.workouts[49].id, 5049);
});

/* ========================================================================== *
 * Demo data
 * ========================================================================== */

test('demoSnapshot is deterministic for the same reference time', () => {
  const now = new Date('2026-10-25T11:18:00.000Z');
  const first = demoSnapshot({ now });
  const second = demoSnapshot({ now });
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test('demoSnapshot returns 30 contiguous local dates ending today', () => {
  const now = new Date('2026-10-25T11:18:00.000Z');
  const snapshot = demoSnapshot({ now });
  const expectedDates = localDates(now, 30);

  assert.equal(snapshot.days.length, 30);
  assert.deepEqual(snapshot.days.map((day) => day.date), expectedDates);
  assert.equal(snapshot.updatedAt, now.toISOString());
  assert.deepEqual(snapshot.range, {
    start: localMidnight(expectedDates[0]),
    end: now.toISOString(),
    days: 30,
  });
  assert.deepEqual(snapshot.today, snapshot.days[snapshot.days.length - 1]);
  assert.deepEqual(snapshot.warnings, []);
});

test('demoSnapshot mirrors the aggregate day/workout/profile/body shapes', () => {
  const snapshot = demoSnapshot({ now: REFERENCE_NOW });

  assert.equal(snapshot.profile.firstName, 'Alex');
  assert.equal(snapshot.profile.lastName, 'Chen');
  assert.equal(snapshot.profile.email, 'alex.chen@example.com');
  assert.equal(snapshot.profile.userId, 1000001);
  assert.deepEqual(snapshot.body, { heightM: 1.78, weightKg: 70.2, maxHr: 191 });

  for (const day of snapshot.days) {
    assertKeys(Object.keys(day), DAY_KEYS, `demo day ${day.date}`);
    assertKeys(Object.keys(day.recovery), RECOVERY_KEYS, 'demo recovery');
    assertKeys(Object.keys(day.cycle), CYCLE_KEYS, 'demo cycle');
    assertKeys(Object.keys(day.sleep), SLEEP_KEYS, 'demo sleep');
    // Every demo day is scored, including today.
    assert.equal(day.recovery.state, 'SCORED');
    assert.equal(day.recovery.calibrating, false);
    assert.equal(day.sleep.nap, false);
  }
  // Today's cycle is still in progress.
  assert.equal(snapshot.days[snapshot.days.length - 1].cycle.end, null);

  assert.ok(snapshot.workouts.length > 0);
  for (const workout of snapshot.workouts) {
    assertKeys(Object.keys(workout), WORKOUT_KEYS, `demo workout ${workout.id}`);
    assert.equal(workout.sportName, workout.sport);
    assert.equal(workout.date.length, 10);
  }
  assertClean(snapshot);
});

test('demoSnapshot values stay inside the documented plausible ranges', () => {
  const snapshot = demoSnapshot({ now: REFERENCE_NOW });
  const inRange = (value, min, max, label) => {
    assert.equal(typeof value, 'number', `${label} must be a number`);
    assert.ok(value >= min && value <= max, `${label} out of range: ${value} not in [${min}, ${max}]`);
  };

  for (const day of snapshot.days) {
    inRange(day.recovery.score, 28, 97, 'recovery score');
    inRange(day.recovery.hrv, 24, 115, 'hrv');
    inRange(day.recovery.rhr, 46, 68, 'rhr');
    inRange(day.recovery.spo2, 94, 99, 'spo2');
    inRange(day.recovery.skinTemp, 32.8, 35.4, 'skin temp');
    inRange(day.cycle.strain, 2, 19.5, 'strain');
    inRange(day.cycle.steps, 1000, 25000, 'steps');
    inRange(day.cycle.avgHr, 40, 120, 'cycle avg hr');
    inRange(day.cycle.maxHr, day.cycle.avgHr, 191, 'cycle max hr');
    inRange(day.sleep.performance, 55, 99, 'sleep performance');
    inRange(day.sleep.efficiency, 0, 100, 'sleep efficiency');
    inRange(day.sleep.consistency, 0, 100, 'sleep consistency');
    inRange(day.sleep.respiratoryRate, 12, 19, 'respiratory rate');
    inRange(day.sleep.totalSleepMs, 5.5 * 3600000, 9 * 3600000, 'total sleep');
    inRange(day.sleep.neededMs, 6 * 3600000, 10 * 3600000, 'needed sleep');
    inRange(day.sleep.lightMs + day.sleep.deepMs + day.sleep.remMs, day.sleep.totalSleepMs, day.sleep.totalSleepMs, 'stage sum');
    assert.ok(day.sleep.end > day.sleep.start, 'sleep must end after it starts');
  }

  const workoutDates = new Set(snapshot.workouts.map((workout) => workout.date));
  assert.ok(snapshot.workouts.length >= 7, `expected several workouts, got ${snapshot.workouts.length}`);
  assert.ok(snapshot.workouts.length <= 40, `too many workouts: ${snapshot.workouts.length}`);
  assert.ok(new Set(snapshot.workouts.map((workout) => workout.sport)).size >= 3, 'varied sports');
  for (const workout of snapshot.workouts) {
    assert.ok(workoutDates.has(workout.date));
    assert.ok(workout.durationMs > 0);
    inRange(workout.strain, 2, 19.5, 'workout strain');
    inRange(workout.avgHr, 60, 190, 'workout avg hr');
    inRange(workout.maxHr, workout.avgHr, 191, 'workout max hr');
    assert.equal(workout.zones.length, 6);
    for (const zone of workout.zones) assert.ok(Number.isFinite(zone) && zone >= 0);
    if (workout.distanceM !== null) assert.ok(workout.distanceM > 0);
  }
  // Workouts are newest first.
  for (let index = 1; index < snapshot.workouts.length; index += 1) {
    assert.ok(
      snapshot.workouts[index - 1].date >= snapshot.workouts[index].date,
      'workouts must be sorted newest first',
    );
  }
});

test('demoSnapshot days replay onto their own date through aggregateSnapshot', () => {
  const now = new Date('2026-10-25T11:18:00.000Z');
  const demo = demoSnapshot({ now });
  const cycles = [];
  const recoveries = [];
  const sleeps = [];

  demo.days.forEach((day, index) => {
    const cycleId = 1000 + index;
    cycles.push({
      id: cycleId,
      start: day.cycle.start,
      end: day.cycle.end,
      timezone_offset: hostOffsetAt(day.cycle.start),
      score_state: 'SCORED',
      score: {
        strain: day.cycle.strain,
        kilojoule: day.cycle.kilojoule,
        average_heart_rate: day.cycle.avgHr,
        max_heart_rate: day.cycle.maxHr,
      },
      step_count: day.cycle.steps,
    });
    recoveries.push({
      cycle_id: cycleId,
      created_at: localAt(day.date, 7, 30),
      score_state: 'SCORED',
      score: {
        user_calibrating: day.recovery.calibrating,
        recovery_score: day.recovery.score,
        resting_heart_rate: day.recovery.rhr,
        hrv_rmssd_milli: day.recovery.hrv,
        spo2_percentage: day.recovery.spo2,
        skin_temp_celsius: day.recovery.skinTemp,
      },
    });
    sleeps.push({
      id: 5000 + index,
      cycle_id: cycleId,
      start: day.sleep.start,
      end: day.sleep.end,
      timezone_offset: hostOffsetAt(day.sleep.end),
      nap: false,
      score_state: 'SCORED',
      score: {
        stage_summary: {
          total_in_bed_time_milli: day.sleep.inBedMs,
          total_awake_time_milli: day.sleep.awakeMs,
          total_no_data_time_milli: 0,
          total_light_sleep_time_milli: day.sleep.lightMs,
          total_slow_wave_sleep_time_milli: day.sleep.deepMs,
          total_rem_sleep_time_milli: day.sleep.remMs,
          sleep_cycle_count: 5,
          disturbance_count: day.sleep.disturbances,
        },
        sleep_needed: {
          baseline_milli: day.sleep.neededMs,
          need_from_sleep_debt_milli: 0,
          need_from_recent_strain_milli: 0,
          need_from_recent_nap_milli: 0,
        },
        respiratory_rate: day.sleep.respiratoryRate,
        sleep_performance_percentage: day.sleep.performance,
        sleep_consistency_percentage: day.sleep.consistency,
        sleep_efficiency_percentage: day.sleep.efficiency,
      },
    });
  });

  const replayed = aggregateSnapshot({ cycles, recoveries, sleeps, days: 30, now });
  // The demo layout survives the wake-date rules unchanged: each morning-start
  // cycle stays on its date, the recovery was scored that morning and the sleep
  // ended that morning.
  assert.deepEqual(replayed.days, demo.days);
  assert.deepEqual(replayed.today, demo.today);
  assert.deepEqual(replayed.range, demo.range);
  assert.equal(replayed.updatedAt, demo.updatedAt);
  assertClean(replayed);
});

test('demoSnapshot honors the days option and keeps overlapping days stable', () => {
  const now = new Date('2026-10-25T11:18:00.000Z');
  const full = demoSnapshot({ now });
  const week = demoSnapshot({ days: 7, now });
  assert.equal(week.days.length, 7);
  assert.deepEqual(week.days, full.days.slice(-7));
  const weekDates = new Set(week.days.map((day) => day.date));
  assert.deepEqual(
    week.workouts,
    full.workouts.filter((workout) => weekDates.has(workout.date)),
  );
  assert.equal(demoSnapshot({ days: 1, now }).days.length, 1);
});
