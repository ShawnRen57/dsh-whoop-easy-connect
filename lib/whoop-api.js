/**
 * Dependency-free WHOOP Developer API v2 client and snapshot aggregation for
 * the `dsh-whoop-easy-connect` DSH plugin.
 *
 * The module performs no I/O at import time. Every network call goes through an
 * injectable `fetchImpl`, which keeps the unit tests offline and lets the Host
 * entry decide how requests are made. Failures are surfaced as
 * {@link WhoopApiError} with a stable machine-readable `code` so the plugin Host
 * can map them onto its own Remote envelope codes.
 *
 * @module dsh-whoop-easy-connect/whoop-api
 */

/** Space-separated WHOOP OAuth scopes required by this plugin. */
const DEFAULT_SCOPES =
  'offline read:profile read:body_measurement read:cycles read:recovery read:sleep read:workout';

/**
 * WHOOP OAuth / API defaults.
 *
 * @type {Readonly<{ authUrl: string, tokenUrl: string, apiBase: string, scopes: string }>}
 */
export const WHOOP_DEFAULTS = Object.freeze({
  authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
  tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
  apiBase: 'https://api.prod.whoop.com/developer',
  scopes: DEFAULT_SCOPES,
});

/** Collection page size (WHOOP API maximum). */
const PAGE_LIMIT = 25;

/** Safety cap on paginated requests per collection. */
const MAX_PAGES = 20;

/** Timeout applied to every HTTP request, in milliseconds. */
const REQUEST_TIMEOUT_MS = 20000;

/** OAuth rejection codes that mean the stored authorization is unusable. */
const TOKEN_AUTH_ERRORS = new Set([
  'invalid_grant',
  'invalid_token',
  'invalid_refresh_token',
  'unauthorized',
  'access_denied',
]);

/**
 * @typedef {'network'|'unauthorized'|'rate_limited'|'api_error'|'bad_response'} WhoopApiErrorCode
 */

/**
 * Error raised for every WHOOP client failure.
 *
 * `code` is stable across releases:
 * - `network` — DNS/TCP/TLS/timeout failure; no HTTP response was received
 * - `unauthorized` — HTTP 401/403, or a rejected OAuth grant (re-authorize)
 * - `rate_limited` — HTTP 429; `retryAfter` carries WHOOP's Retry-After seconds
 * - `api_error` — any other HTTP error status, or missing client configuration
 * - `bad_response` — HTTP 2xx whose body could not be parsed or validated
 */
export class WhoopApiError extends Error {
  /**
   * @param {WhoopApiErrorCode} code Stable machine-readable error code.
   * @param {string} message Human-readable description (never contains tokens).
   * @param {{ status?: number|null, retryAfter?: number|null }} [options]
   *   `status` is the HTTP status when one was received; `retryAfter` is the
   *   `Retry-After` header value in seconds when WHOOP sent one.
   */
  constructor(code, message, options = {}) {
    super(message);
    const { status = null, retryAfter = null } = options || {};
    this.name = 'WhoopApiError';
    /** @type {WhoopApiErrorCode} */
    this.code = code;
    /** @type {number|null} */
    this.status = Number.isFinite(status) ? Number(status) : null;
    /** @type {number|null} */
    this.retryAfter = Number.isFinite(retryAfter) ? Number(retryAfter) : null;
  }
}

/**
 * Normalize a WHOOP OAuth token response into the plugin's token shape.
 *
 * Tolerant input: passing an already-normalized token bundle through again
 * returns it unchanged (safe no-op), so callers cannot accidentally corrupt
 * stored tokens by normalizing twice.
 *
 * @param {object|null|undefined} tokenResponse Raw token endpoint JSON
 *   (`access_token`, `refresh_token`, `token_type`, `scope`, `expires_in`), or
 *   an already-normalized token bundle.
 * @param {Date|string|number} [now] Clock used to compute `expiresAt`.
 * @returns {{ accessToken: string, refreshToken: string|null, tokenType: string,
 *   scope: string|null, expiresAt: string|null }}
 *   Camel-cased token bundle; `expiresAt` is an ISO string (null if the server
 *   did not send `expires_in`).
 * @throws {WhoopApiError} `bad_response` when the access token is missing.
 */
export function normalizeTokens(tokenResponse, now = new Date()) {
  const payload = tokenResponse && typeof tokenResponse === 'object' ? tokenResponse : {};
  if (
    typeof payload.access_token !== 'string' &&
    typeof payload.accessToken === 'string' &&
    payload.accessToken.length > 0
  ) {
    const existingExpiryMs = timestampOrNull(payload.expiresAt);
    return {
      accessToken: payload.accessToken,
      refreshToken:
        typeof payload.refreshToken === 'string' && payload.refreshToken.length > 0
          ? payload.refreshToken
          : null,
      tokenType:
        typeof payload.tokenType === 'string' && payload.tokenType.length > 0
          ? payload.tokenType
          : 'Bearer',
      scope: typeof payload.scope === 'string' ? payload.scope : null,
      expiresAt: existingExpiryMs === null ? null : new Date(existingExpiryMs).toISOString(),
    };
  }
  const accessToken =
    typeof payload.access_token === 'string' && payload.access_token.length > 0
      ? payload.access_token
      : null;
  if (!accessToken) {
    throw new WhoopApiError('bad_response', 'WHOOP token response did not include an access token.');
  }
  const refreshToken =
    typeof payload.refresh_token === 'string' && payload.refresh_token.length > 0
      ? payload.refresh_token
      : null;
  const tokenType =
    typeof payload.token_type === 'string' && payload.token_type.length > 0
      ? payload.token_type
      : 'Bearer';
  const scope = typeof payload.scope === 'string' ? payload.scope : null;
  const expiresInSeconds = Number(payload.expires_in);
  const nowMs = timestampOrNull(now);
  const expiresAt =
    Number.isFinite(expiresInSeconds) && expiresInSeconds > 0 && nowMs !== null
      ? new Date(nowMs + expiresInSeconds * 1000).toISOString()
      : null;
  return { accessToken, refreshToken, tokenType, scope, expiresAt };
}

/**
 * Whether a token bundle is missing or close enough to expiry to refresh it.
 *
 * Missing/blank tokens count as expiring because the caller has to (re)authorize
 * before a request can succeed. Tokens without an `expiresAt` are treated as
 * usable (the API call itself will report an expired token).
 *
 * @param {{ accessToken?: string, expiresAt?: string|null }|null|undefined} tokens
 * @param {number} [skewMs=120000] Refresh when expiry is within this many ms.
 * @param {Date|string|number} [now] Clock used for the comparison.
 * @returns {boolean}
 */
export function tokensExpiring(tokens, skewMs = 120000, now = new Date()) {
  const accessToken =
    tokens && typeof tokens === 'object'
      ? tokens.accessToken ?? tokens.access_token ?? null
      : null;
  if (typeof accessToken !== 'string' || accessToken.length === 0) return true;
  const expiresAt = tokens.expiresAt ?? tokens.expires_at ?? null;
  const expiresMs = timestampOrNull(expiresAt);
  if (expiresMs === null) return false;
  const nowMs = timestampOrNull(now) ?? Date.now();
  const skew = Number.isFinite(Number(skewMs)) ? Number(skewMs) : 120000;
  return expiresMs - nowMs <= skew;
}

/**
 * WHOOP Developer API v2 client.
 *
 * Covers the OAuth code exchange / refresh flow, token revocation, and the
 * paginated v2 collections used by the dashboard. Construct one instance with
 * the plugin config; tokens are passed in per call so the Host owns storage.
 */
export class WhoopApi {
  /**
   * @param {object} [options]
   * @param {string} [options.clientId] WHOOP OAuth client id.
   * @param {string} [options.clientSecret] WHOOP OAuth client secret.
   * @param {string} [options.redirectUri] Redirect URI registered with WHOOP.
   * @param {string|string[]} [options.scopes] Scope override (string or array).
   * @param {string} [options.authUrl] Authorize endpoint override.
   * @param {string} [options.tokenUrl] Token endpoint override.
   * @param {string} [options.apiBase] Developer API base override.
   * @param {typeof fetch} [options.fetchImpl] Injectable fetch for tests.
   */
  constructor(options = {}) {
    const opts = options && typeof options === 'object' ? options : {};
    this.clientId = optionalString(opts.clientId);
    this.clientSecret = optionalString(opts.clientSecret);
    this.redirectUri = optionalString(opts.redirectUri);
    this.scopes = normalizeScopes(opts.scopes);
    this.authUrl = nonBlankString(opts.authUrl) ?? WHOOP_DEFAULTS.authUrl;
    this.tokenUrl = nonBlankString(opts.tokenUrl) ?? WHOOP_DEFAULTS.tokenUrl;
    this.apiBase = nonBlankString(opts.apiBase) ?? WHOOP_DEFAULTS.apiBase;
    this.fetchImpl = typeof opts.fetchImpl === 'function' ? opts.fetchImpl : resolveFetch();
  }

  /**
   * Whether client id, client secret and redirect URI are all configured.
   * @returns {boolean}
   */
  get configured() {
    return Boolean(this.clientId && this.clientSecret && this.redirectUri);
  }

  /**
   * Build the WHOOP authorize URL for the authorization-code flow.
   *
   * @param {string} state Opaque CSRF state; must be at least 8 characters.
   * @returns {string} Absolute authorize URL with client_id, redirect_uri,
   *   response_type=code, scope and state.
   * @throws {TypeError} When `state` is not a string of at least 8 characters.
   * @throws {WhoopApiError} `api_error` when the OAuth client is not configured.
   */
  buildAuthorizeUrl(state) {
    if (typeof state !== 'string' || state.trim().length < 8) {
      throw new TypeError('WHOOP OAuth state must be a string of at least 8 characters.');
    }
    this.#requireConfigured();
    const url = new URL(this.authUrl);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scopes);
    url.searchParams.set('state', state.trim());
    return url.toString();
  }

  /**
   * Exchange an OAuth authorization code for a token bundle.
   *
   * @param {string} code The `code` query parameter received on the redirect.
   * @returns {Promise<{ accessToken: string, refreshToken: string|null,
   *   tokenType: string, scope: string|null, expiresAt: string|null }>}
   * @throws {WhoopApiError} `network`/`unauthorized`/`rate_limited`/`api_error`/
   *   `bad_response` as described on {@link WhoopApiError}.
   */
  async exchangeCode(code) {
    this.#requireConfigured();
    if (typeof code !== 'string' || code.length === 0) {
      throw new WhoopApiError('bad_response', 'A WHOOP authorization code is required.');
    }
    const payload = await this.#tokenRequest({
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });
    return normalizeTokens(payload, new Date());
  }

  /**
   * Refresh an access token using a stored refresh token.
   *
   * WHOOP may rotate the refresh token; when the response omits it, the previous
   * refresh token is preserved so the caller can keep using the bundle.
   *
   * @param {{ refreshToken?: string, refresh_token?: string }|string} tokens
   *   Stored token bundle, or the refresh token itself.
   * @returns {Promise<{ accessToken: string, refreshToken: string|null,
   *   tokenType: string, scope: string|null, expiresAt: string|null }>}
   * @throws {WhoopApiError} `unauthorized` when no refresh token is available,
   *   plus the usual transport/HTTP mappings.
   */
  async refreshTokens(tokens) {
    this.#requireConfigured();
    const refreshToken = extractRefreshToken(tokens);
    if (!refreshToken) {
      throw new WhoopApiError(
        'unauthorized',
        'No WHOOP refresh token is available; the account must be authorized again.',
      );
    }
    const payload = await this.#tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'offline',
    });
    const normalized = normalizeTokens(payload, new Date());
    return {
      ...normalized,
      refreshToken: normalized.refreshToken ?? refreshToken,
    };
  }

  /**
   * Revoke a WHOOP access token (also revokes the paired refresh token).
   *
   * @param {string} accessToken Token to revoke.
   * @returns {Promise<boolean>} `true` when WHOOP confirmed the revocation;
   *   `false` when WHOOP reported the token as already invalid (HTTP 401), which
   *   the Host should treat as a successful disconnect.
   * @throws {WhoopApiError} On network errors, rate limiting, or other failures.
   */
  async revoke(accessToken) {
    const headers = bearerHeaders(accessToken);
    const url = buildApiUrl(this.apiBase, '/v2/user/access');
    const response = await this.#send(url, { method: 'DELETE', headers });
    if (!response || typeof response !== 'object') {
      throw new WhoopApiError('bad_response', 'WHOOP API returned an unexpected revoke response.');
    }
    if (Number(response.status) === 401) return false;
    if (!response.ok) throw await this.#httpError(response);
    return true;
  }

  /**
   * Fetch the basic user profile (`GET /v2/user/profile/basic`).
   *
   * @param {string} accessToken Bearer token.
   * @returns {Promise<object>} Raw WHOOP profile payload.
   * @throws {WhoopApiError}
   */
  async fetchProfile(accessToken) {
    return this.#requestJson('/v2/user/profile/basic', { accessToken });
  }

  /**
   * Fetch body measurements (`GET /v2/user/measurement/body`).
   *
   * @param {string} accessToken Bearer token.
   * @returns {Promise<object>} Raw WHOOP body measurement payload.
   * @throws {WhoopApiError}
   */
  async fetchBody(accessToken) {
    return this.#requestJson('/v2/user/measurement/body', { accessToken });
  }

  /**
   * Fetch recovery records (`GET /v2/recovery`, paginated).
   *
   * @param {string} accessToken Bearer token.
   * @param {{ start?: string|Date, end?: string|Date }} [range] ISO date-time window.
   * @returns {Promise<object[]>} All recovery records for the window.
   * @throws {WhoopApiError}
   */
  async fetchRecovery(accessToken, range = {}) {
    return this.#fetchCollection(accessToken, '/v2/recovery', range);
  }

  /**
   * Fetch sleep records (`GET /v2/activity/sleep`, paginated).
   *
   * @param {string} accessToken Bearer token.
   * @param {{ start?: string|Date, end?: string|Date }} [range] ISO date-time window.
   * @returns {Promise<object[]>} All sleep records for the window.
   * @throws {WhoopApiError}
   */
  async fetchSleep(accessToken, range = {}) {
    return this.#fetchCollection(accessToken, '/v2/activity/sleep', range);
  }

  /**
   * Fetch physiological cycle records (`GET /v2/cycle`, paginated).
   *
   * @param {string} accessToken Bearer token.
   * @param {{ start?: string|Date, end?: string|Date }} [range] ISO date-time window.
   * @returns {Promise<object[]>} All cycle records for the window.
   * @throws {WhoopApiError}
   */
  async fetchCycles(accessToken, range = {}) {
    return this.#fetchCollection(accessToken, '/v2/cycle', range);
  }

  /**
   * Fetch workout records (`GET /v2/activity/workout`, paginated).
   *
   * @param {string} accessToken Bearer token.
   * @param {{ start?: string|Date, end?: string|Date }} [range] ISO date-time window.
   * @returns {Promise<object[]>} All workout records for the window.
   * @throws {WhoopApiError}
   */
  async fetchWorkouts(accessToken, range = {}) {
    return this.#fetchCollection(accessToken, '/v2/activity/workout', range);
  }

  /**
   * @returns {void}
   * @throws {WhoopApiError} `api_error` when the OAuth client is incomplete.
   */
  #requireConfigured() {
    if (!this.configured) {
      throw new WhoopApiError(
        'api_error',
        'WHOOP OAuth client is not configured (clientId, clientSecret and redirectUri are required).',
      );
    }
  }

  /**
   * POST a form-urlencoded OAuth token request and return the JSON payload.
   *
   * @param {Record<string, string>} fields
   * @returns {Promise<object>}
   */
  async #tokenRequest(fields) {
    const body = new URLSearchParams(fields).toString();
    const response = await this.#send(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    });
    if (!response || typeof response !== 'object') {
      throw new WhoopApiError('bad_response', 'WHOOP token endpoint returned an unexpected response.');
    }
    if (!response.ok) {
      const failure = await readErrorPayload(response);
      const status = Number(response.status) || 0;
      const retryAfter = parseRetryAfter(response);
      const oauthError = failure && typeof failure.error === 'string' ? failure.error : null;
      const description =
        failure && typeof failure.error_description === 'string' ? failure.error_description : null;
      const detail = [oauthError, description].filter(Boolean).join(' — ');
      if (Number(response.status) === 401 || (oauthError && TOKEN_AUTH_ERRORS.has(oauthError))) {
        throw new WhoopApiError(
          'unauthorized',
          `WHOOP token request was rejected (HTTP ${status || 'unknown'})${detail ? `: ${detail}` : ''}.`,
          { status, retryAfter },
        );
      }
      if (Number(response.status) === 429) {
        throw new WhoopApiError(
          'rate_limited',
          'WHOOP token endpoint rate limit exceeded (HTTP 429); retry later.',
          { status, retryAfter },
        );
      }
      throw new WhoopApiError(
        'api_error',
        `WHOOP token request failed (HTTP ${status || 'unknown'})${detail ? `: ${detail}` : ''}.`,
        { status, retryAfter },
      );
    }
    const payload = await readJsonResponse(response, 'token endpoint');
    if (!payload || typeof payload !== 'object') {
      throw new WhoopApiError('bad_response', 'WHOOP token endpoint returned an unexpected payload.');
    }
    return payload;
  }

  /**
   * Perform one HTTP request with the timeout/network-error mapping.
   *
   * @param {string} url
   * @param {RequestInit} requestInit
   * @returns {Promise<object>} Fetch Response-like object.
   */
  async #send(url, requestInit) {
    if (typeof this.fetchImpl !== 'function') {
      throw new WhoopApiError('network', 'No fetch implementation is available to call the WHOOP API.');
    }
    /** @type {RequestInit} */
    const init = { ...requestInit };
    const signal = createTimeoutSignal(REQUEST_TIMEOUT_MS);
    if (signal) init.signal = signal;
    try {
      const response = await this.fetchImpl(url, init);
      return response;
    } catch (error) {
      throw toNetworkError(error);
    }
  }

  /**
   * Map a non-2xx HTTP response to a {@link WhoopApiError}.
   *
   * @param {object} response Fetch Response-like object.
   * @returns {Promise<WhoopApiError>}
   */
  async #httpError(response) {
    const status = Number(response && response.status) || 0;
    const retryAfter = parseRetryAfter(response);
    if (status === 401) {
      return new WhoopApiError(
        'unauthorized',
        'WHOOP authorization is invalid or expired (HTTP 401); re-authorize the account.',
        { status, retryAfter },
      );
    }
    if (status === 403) {
      return new WhoopApiError(
        'unauthorized',
        'WHOOP denied access to this resource (HTTP 403); the granted scopes may be insufficient.',
        { status, retryAfter },
      );
    }
    if (status === 429) {
      return new WhoopApiError(
        'rate_limited',
        'WHOOP API rate limit exceeded (HTTP 429); retry later.',
        { status, retryAfter },
      );
    }
    const detail = await describeHttpFailure(response);
    return new WhoopApiError(
      'api_error',
      `WHOOP API request failed (HTTP ${status || 'unknown'})${detail ? `: ${detail}` : ''}.`,
      { status, retryAfter },
    );
  }

  /**
   * JSON GET against the WHOOP developer API.
   *
   * @param {string} path Absolute API path such as `/v2/cycle`.
   * @param {{ accessToken?: string, query?: Record<string, string|number|null|undefined>,
   *   method?: string }} [options]
   * @returns {Promise<object>}
   */
  async #requestJson(path, { accessToken, query, method = 'GET' } = {}) {
    const headers = bearerHeaders(accessToken);
    const url = buildApiUrl(this.apiBase, path, query);
    const response = await this.#send(url, { method, headers });
    if (!response || typeof response !== 'object') {
      throw new WhoopApiError('bad_response', `WHOOP ${path} returned an unexpected response object.`);
    }
    if (!response.ok) throw await this.#httpError(response);
    const payload = await readJsonResponse(response, path);
    if (!payload || typeof payload !== 'object') {
      throw new WhoopApiError('bad_response', `WHOOP ${path} returned an unexpected payload.`);
    }
    return payload;
  }

  /**
   * Follow `next_token` for a paginated WHOOP collection.
   *
   * @param {string} accessToken
   * @param {string} path
   * @param {{ start?: string|Date, end?: string|Date }} [range]
   * @returns {Promise<object[]>}
   */
  async #fetchCollection(accessToken, path, range) {
    const records = [];
    let nextToken = null;
    const rangeStart = toRangeIso(range && range.start);
    const rangeEnd = toRangeIso(range && range.end);
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const payload = await this.#requestJson(path, {
        accessToken,
        query: { limit: PAGE_LIMIT, start: rangeStart, end: rangeEnd, nextToken },
      });
      if (!Array.isArray(payload.records)) {
        throw new WhoopApiError(
          'bad_response',
          `WHOOP ${path} response is missing the records array.`,
        );
      }
      records.push(...payload.records);
      nextToken = typeof payload.next_token === 'string' && payload.next_token ? payload.next_token : null;
      if (!nextToken) break;
    }
    return records;
  }
}

/**
 * Join raw WHOOP v2 payloads into the dashboard snapshot shape defined by the
 * plugin spec (§4.1). `mode` and any Host-side fields are added by the caller.
 *
 * Date bucketing follows the WHOOP app's "wake-date" day rather than the raw
 * cycle start, so data from the same physiological day lands under one date:
 * - one bucket per local calendar date for the last `days` local dates,
 *   ascending; missing data stays `null`;
 * - cycles use an activity date from `start` shifted by `timezone_offset` (UTC
 *   fallback): a local start hour of 17:00 or later is a bedtime-start cycle
 *   and lands on the NEXT local date, otherwise (wake-start / after-midnight
 *   cycle) it stays on its own local date;
 * - recoveries land on the local date of `created_at` (the morning the recovery
 *   was scored), resolved with the owning cycle's `timezone_offset` when that
 *   cycle is present in the payload and host-local time otherwise;
 * - sleeps land on the local date of `end` (wake time) using the sleep's own
 *   `timezone_offset` (host-local fallback); naps are ignored and the longest
 *   in-bed record wins per date;
 * - workouts are `SCORED` only, bucketed by local start date, newest first,
 *   capped at 50;
 * - output never contains `undefined` or `NaN`.
 *
 * The collection inputs accept either plain arrays (what the client fetch
 * methods return) or raw `{ records, next_token }` page payloads.
 *
 * @param {object} [input]
 * @param {object|null} [input.profile] Raw `/v2/user/profile/basic` payload.
 * @param {object|null} [input.body] Raw `/v2/user/measurement/body` payload.
 * @param {object[]|{records: object[]}} [input.recoveries] Recovery records.
 * @param {object[]|{records: object[]}} [input.sleeps] Sleep records.
 * @param {object[]|{records: object[]}} [input.cycles] Cycle records.
 * @param {object[]|{records: object[]}} [input.workouts] Workout records.
 * @param {number} [input.days=30] Number of local dates to include (1–366).
 * @param {Date|string|number} [input.now] Reference time (defaults to now).
 * @returns {{
 *   updatedAt: string,
 *   range: { start: string, end: string, days: number },
 *   profile: { firstName: string|null, lastName: string|null, email: string|null,
 *     userId: number|string|null } | null,
 *   body: { heightM: number|null, weightKg: number|null, maxHr: number|null } | null,
 *   today: { date: string|null, recovery: object|null, cycle: object|null, sleep: object|null },
 *   days: object[],
 *   workouts: object[],
 *   warnings: string[],
 * }}
 */
export function aggregateSnapshot(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  const nowDate = validDate(raw.now) ?? new Date();
  const nowMs = nowDate.getTime();
  const dayCount = clampDayCount(raw.days);

  const baseYear = nowDate.getFullYear();
  const baseMonth = nowDate.getMonth();
  const baseDay = nowDate.getDate();

  /** @type {string[]} */
  const dates = [];
  for (let offset = dayCount - 1; offset >= 0; offset -= 1) {
    dates.push(localDateKey(new Date(baseYear, baseMonth, baseDay - offset)));
  }

  /** @type {Map<string, {date: string, recovery: object|null, cycle: object|null, sleep: object|null}>} */
  const buckets = new Map();
  for (const date of dates) {
    buckets.set(date, { date, recovery: null, cycle: null, sleep: null });
  }

  // Cycles: bucket by activity day (bedtime starts roll over to the next date)
  // and index every record id so recoveries can borrow its timezone offset.
  const cycleRecords = asRecords(raw.cycles);
  /** @type {Map<string, object>} */
  const cycleById = new Map();
  /** @type {Map<string, {rank: number, startMs: number}>} */
  const cycleMeta = new Map();
  for (const cycle of cycleRecords) {
    if (!cycle || typeof cycle !== 'object') continue;
    if (cycle.id !== null && cycle.id !== undefined) cycleById.set(String(cycle.id), cycle);
    const dateKey = cycleActivityDateKey(cycle);
    const bucket = dateKey ? buckets.get(dateKey) : null;
    if (!bucket) continue;
    const rank = cycle.score_state === 'SCORED' ? 2 : 1;
    const startMs = timestampOrNull(cycle.start) ?? Number.NEGATIVE_INFINITY;
    const previous = cycleMeta.get(dateKey);
    if (previous && (previous.rank > rank || (previous.rank === rank && previous.startMs >= startMs))) {
      continue;
    }
    cycleMeta.set(dateKey, { rank, startMs });
    bucket.cycle = mapCycle(cycle);
  }

  // Recoveries: bucket by the local date the recovery was scored on, borrowing
  // the owning cycle's timezone offset when known, and keep the latest record.
  /** @type {Map<string, number>} */
  const recoveryMeta = new Map();
  for (const recovery of asRecords(raw.recoveries)) {
    if (!recovery || typeof recovery !== 'object' || recovery.score_state !== 'SCORED') continue;
    const owningCycle =
      recovery.cycle_id !== null && recovery.cycle_id !== undefined
        ? cycleById.get(String(recovery.cycle_id))
        : null;
    const dateKey = dateKeyFromInstant(
      recovery.created_at,
      owningCycle ? owningCycle.timezone_offset : null,
      'local',
    );
    const bucket = dateKey ? buckets.get(dateKey) : null;
    if (!bucket) continue;
    const createdMs = timestampOrNull(recovery.created_at) ?? 0;
    const previous = recoveryMeta.get(bucket.date);
    if (previous !== undefined && previous >= createdMs) continue;
    recoveryMeta.set(bucket.date, createdMs);
    bucket.recovery = mapRecovery(recovery);
  }

  // Sleeps: bucket by the local date of the wake-up time (`end`), ignore naps
  // and keep the longest in-bed record per date.
  /** @type {Map<string, number>} */
  const sleepMeta = new Map();
  for (const sleep of asRecords(raw.sleeps)) {
    if (!sleep || typeof sleep !== 'object') continue;
    if (sleep.nap === true || sleep.score_state !== 'SCORED') continue;
    const dateKey = dateKeyFromInstant(sleep.end ?? sleep.start, sleep.timezone_offset, 'local');
    const bucket = dateKey ? buckets.get(dateKey) : null;
    if (!bucket) continue;
    const mapped = mapSleep(sleep);
    const inBedMs = mapped.inBedMs ?? Number.NEGATIVE_INFINITY;
    const previous = sleepMeta.get(bucket.date);
    if (previous !== undefined && previous >= inBedMs) continue;
    sleepMeta.set(bucket.date, inBedMs);
    bucket.sleep = mapped;
  }

  // Workouts: scored only, newest first, at most 50 entries.
  /** @type {Array<{startMs: number|null, entry: object}>} */
  const workoutEntries = [];
  for (const workout of asRecords(raw.workouts)) {
    if (!workout || typeof workout !== 'object' || workout.score_state !== 'SCORED') continue;
    workoutEntries.push({ startMs: timestampOrNull(workout.start), entry: mapWorkout(workout) });
  }
  workoutEntries.sort((left, right) => {
    const leftMs = left.startMs ?? Number.NEGATIVE_INFINITY;
    const rightMs = right.startMs ?? Number.NEGATIVE_INFINITY;
    const diff = rightMs - leftMs;
    return Number.isNaN(diff) ? 0 : diff;
  });
  const workouts = workoutEntries.slice(0, 50).map((item) => item.entry);

  /** @type {object[]} */
  const days = dates.map((date) => buckets.get(date));
  const lastDay = days.length > 0 ? days[days.length - 1] : null;
  const today = lastDay
    ? { date: lastDay.date, recovery: lastDay.recovery, cycle: lastDay.cycle, sleep: lastDay.sleep }
    : { date: null, recovery: null, cycle: null, sleep: null };

  return {
    updatedAt: nowDate.toISOString(),
    range: {
      start: new Date(baseYear, baseMonth, baseDay - (dayCount - 1)).toISOString(),
      end: new Date(nowMs).toISOString(),
      days: dayCount,
    },
    profile: mapProfile(raw.profile),
    body: mapBody(raw.body),
    today,
    days,
    workouts,
    warnings: [],
  };
}

/* ------------------------------------------------------------------------- *
 * Internal helpers
 * ------------------------------------------------------------------------- */

/**
 * @param {unknown} value
 * @returns {string|null}
 */
function optionalString(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * @param {unknown} value
 * @returns {string|null} Trimmed non-empty string, or null.
 */
function nonBlankString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
function stringOrNull(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * @param {unknown} value
 * @returns {number|null}
 */
function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * @param {unknown} value
 * @returns {number|string|null}
 */
function identifierOrNull(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.length > 0) return value;
  return null;
}

/**
 * @param {unknown} value
 * @returns {number|null} Unix milliseconds, or null.
 */
function timestampOrNull(value) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {Date|null}
 */
function validDate(value) {
  const ms = timestampOrNull(value ?? null);
  return ms === null ? null : new Date(ms);
}

/**
 * @param {unknown} value
 * @returns {string|null}
 */
function isoOrNull(value) {
  const ms = timestampOrNull(value);
  return ms === null ? null : new Date(ms).toISOString();
}

/**
 * Convert any accepted time value into an ISO query parameter.
 * @param {unknown} value
 * @returns {string|undefined}
 */
function toRangeIso(value) {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : undefined;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Date(value).toISOString() : undefined;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
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
 * Accept both plain arrays and raw `{records}` page payloads.
 * @param {unknown} value
 * @returns {object[]}
 */
function asRecords(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.records)) return value.records;
  return [];
}

/**
 * @param {unknown} scopes
 * @returns {string}
 */
function normalizeScopes(scopes) {
  if (Array.isArray(scopes)) {
    const joined = scopes
      .filter((scope) => typeof scope === 'string' && scope.trim().length > 0)
      .map((scope) => scope.trim())
      .join(' ');
    return joined.length > 0 ? joined : DEFAULT_SCOPES;
  }
  const single = nonBlankString(scopes);
  return single ?? DEFAULT_SCOPES;
}

/**
 * @returns {typeof fetch|null}
 */
function resolveFetch() {
  return typeof globalThis.fetch === 'function' ? globalThis.fetch : null;
}

/**
 * @param {string} base
 * @param {string} path
 * @returns {string}
 */
function joinUrl(base, path) {
  const left = nonBlankString(base)?.replace(/\/+$/, '') ?? WHOOP_DEFAULTS.apiBase;
  const right = path.startsWith('/') ? path : `/${path}`;
  return `${left}${right}`;
}

/**
 * @param {string} apiBase
 * @param {string} path
 * @param {Record<string, unknown>} [query]
 * @returns {string}
 */
function buildApiUrl(apiBase, path, query) {
  const url = new URL(joinUrl(apiBase, path));
  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * @param {unknown} accessToken
 * @returns {{ Authorization: string, Accept: string }}
 * @throws {WhoopApiError} `unauthorized` when the token is missing.
 */
function bearerHeaders(accessToken) {
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new WhoopApiError('unauthorized', 'A WHOOP access token is required for this request.');
  }
  return { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
}

/**
 * @param {unknown} tokens
 * @returns {string|null}
 */
function extractRefreshToken(tokens) {
  if (typeof tokens === 'string' && tokens.length > 0) return tokens;
  if (!tokens || typeof tokens !== 'object') return null;
  const candidates = [tokens.refreshToken, tokens.refresh_token];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }
  return null;
}

/**
 * @param {number} ms
 * @returns {AbortSignal|undefined}
 */
function createTimeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch {
    /* fall through without a timeout signal */
  }
  return undefined;
}

/**
 * @param {unknown} error
 * @returns {WhoopApiError}
 */
function toNetworkError(error) {
  if (error instanceof WhoopApiError) return error;
  const name = error && typeof error === 'object' && typeof error.name === 'string' ? error.name : '';
  const detail =
    error && typeof error === 'object' && typeof error.message === 'string' && error.message
      ? error.message
      : String(error);
  if (name === 'AbortError' || name === 'TimeoutError') {
    return new WhoopApiError('network', `WHOOP API request timed out or was aborted: ${detail}`);
  }
  return new WhoopApiError('network', `WHOOP API request failed: ${detail}`);
}

/**
 * Read and validate a JSON response body.
 *
 * @param {object} response Fetch Response-like object.
 * @param {string} context Human-readable context for the error message.
 * @returns {Promise<unknown>}
 * @throws {WhoopApiError} `bad_response` when the body is not valid JSON.
 */
async function readJsonResponse(response, context) {
  if (!response || typeof response.json !== 'function') {
    throw new WhoopApiError('bad_response', `WHOOP ${context} response could not be read.`);
  }
  try {
    return await response.json();
  } catch {
    throw new WhoopApiError('bad_response', `WHOOP ${context} returned invalid JSON.`);
  }
}

/**
 * Read an OAuth error payload without throwing.
 *
 * @param {object} response Fetch Response-like object.
 * @returns {Promise<Record<string, unknown>|null>}
 */
async function readErrorPayload(response) {
  if (!response || typeof response.json !== 'function') return null;
  try {
    const payload = await response.json();
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

/**
 * @param {object} response Fetch Response-like object.
 * @returns {number|null} Retry-After in seconds.
 */
function parseRetryAfter(response) {
  const headers = response && response.headers;
  const raw = headers && typeof headers.get === 'function' ? headers.get('retry-after') : null;
  if (raw === null || raw === undefined || raw === '') return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds);
  const dateMs = Date.parse(String(raw));
  if (Number.isFinite(dateMs)) return Math.max(0, Math.round((dateMs - Date.now()) / 1000));
  return null;
}

/**
 * Extract a readable detail string from an HTTP error body.
 *
 * @param {object} response Fetch Response-like object.
 * @returns {Promise<string|null>}
 */
async function describeHttpFailure(response) {
  const payload = await readErrorPayload(response);
  if (!payload) return null;
  const code =
    typeof payload.error === 'string'
      ? payload.error
      : typeof payload.message === 'string'
        ? payload.message
        : null;
  const description =
    typeof payload.error_description === 'string'
      ? payload.error_description
      : typeof payload.detail === 'string'
        ? payload.detail
        : null;
  if (code && description && code !== description) return `${code} — ${description}`;
  return code || description;
}

/**
 * @param {Date} date
 * @returns {string} `YYYY-MM-DD` in the host's local calendar.
 */
function localDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * @param {Date} date
 * @returns {string} `YYYY-MM-DD` in UTC.
 */
function utcDateKey(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/**
 * @param {number} value
 * @returns {string}
 */
function pad2(value) {
  return String(value).padStart(2, '0');
}

/**
 * Parse a WHOOP `timezone_offset` (`"+08:00"`, `"-05:00"`, `"Z"`, or minutes).
 *
 * @param {unknown} value
 * @returns {number|null} Offset in milliseconds.
 */
function parseTimezoneOffset(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value * 60000;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === 'Z' || trimmed === 'z') return 0;
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return sign * (hours * 60 + minutes) * 60000;
}

/**
 * Resolve the local calendar date of an instant, honoring WHOOP's
 * `timezone_offset` when present.
 *
 * @param {unknown} instant ISO date-time.
 * @param {unknown} timezoneOffset WHOOP `timezone_offset` value.
 * @param {'utc'|'local'} fallback Used when no offset is available.
 * @returns {string|null} `YYYY-MM-DD`, or null for invalid instants.
 */
function dateKeyFromInstant(instant, timezoneOffset, fallback) {
  const ms = timestampOrNull(instant);
  if (ms === null) return null;
  const offsetMs = parseTimezoneOffset(timezoneOffset);
  if (offsetMs !== null) return utcDateKey(new Date(ms + offsetMs));
  return fallback === 'utc' ? utcDateKey(new Date(ms)) : localDateKey(new Date(ms));
}

/**
 * Shift a `YYYY-MM-DD` calendar key by a number of calendar days.
 *
 * @param {string} dateKey
 * @param {number} days
 * @returns {string} Shifted `YYYY-MM-DD` key.
 */
function addDaysToDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return utcDateKey(new Date(Date.UTC(year, month - 1, day + days)));
}

/**
 * Resolve the local "activity date" WHOOP assigns to a physiological cycle.
 *
 * WHOOP cycles either start at bedtime (and describe the day that follows) or
 * when the member wakes up. `start` is shifted by the cycle's `timezone_offset`
 * (UTC fallback); a local start hour of 17:00 or later is treated as a bedtime
 * start and rolls the activity date to the next local date, while earlier
 * starts (morning or after-midnight wake-start cycles) keep their own date.
 *
 * @param {object} cycle Raw WHOOP cycle.
 * @returns {string|null} `YYYY-MM-DD` activity date, or null for an invalid start.
 */
function cycleActivityDateKey(cycle) {
  const startMs = timestampOrNull(cycle.start);
  if (startMs === null) return null;
  const offsetMs = parseTimezoneOffset(cycle.timezone_offset);
  const shifted = new Date(startMs + (offsetMs === null ? 0 : offsetMs));
  const startDateKey = utcDateKey(shifted);
  return shifted.getUTCHours() >= 17 ? addDaysToDateKey(startDateKey, 1) : startDateKey;
}

/**
 * @param {object} record
 * @returns {Record<string, unknown>}
 */
function scoreOf(record) {
  if (!record || typeof record !== 'object') return {};
  return record.score && typeof record.score === 'object' ? record.score : {};
}

/**
 * @param {unknown} values
 * @returns {number|null} Sum of finite values, or null when none are present.
 */
function sumOrNull(values) {
  let total = 0;
  let seen = false;
  for (const value of values) {
    const numeric = numberOrNull(value);
    if (numeric === null) continue;
    total += numeric;
    seen = true;
  }
  return seen ? total : null;
}

/**
 * @param {object} cycle Raw WHOOP cycle.
 * @returns {object} DayEntry/Cycle projection.
 */
function mapCycle(cycle) {
  const score = scoreOf(cycle);
  return {
    strain: numberOrNull(score.strain),
    kilojoule: numberOrNull(score.kilojoule),
    avgHr: numberOrNull(score.average_heart_rate),
    maxHr: numberOrNull(score.max_heart_rate),
    steps: numberOrNull(cycle.step_count),
    start: isoOrNull(cycle.start),
    end: isoOrNull(cycle.end),
  };
}

/**
 * @param {object} recovery Raw WHOOP recovery.
 * @returns {object} Recovery projection.
 */
function mapRecovery(recovery) {
  const score = scoreOf(recovery);
  return {
    score: numberOrNull(score.recovery_score),
    hrv: numberOrNull(score.hrv_rmssd_milli),
    rhr: numberOrNull(score.resting_heart_rate),
    spo2: numberOrNull(score.spo2_percentage),
    skinTemp: numberOrNull(score.skin_temp_celsius),
    calibrating: score.user_calibrating === true,
    state: typeof recovery.score_state === 'string' ? recovery.score_state : null,
  };
}

/**
 * @param {object} sleep Raw WHOOP sleep.
 * @returns {object} Sleep projection.
 */
function mapSleep(sleep) {
  const score = scoreOf(sleep);
  const stage = score.stage_summary && typeof score.stage_summary === 'object' ? score.stage_summary : {};
  const needed = score.sleep_needed && typeof score.sleep_needed === 'object' ? score.sleep_needed : {};
  const lightMs = numberOrNull(stage.total_light_sleep_time_milli);
  const deepMs = numberOrNull(stage.total_slow_wave_sleep_time_milli);
  const remMs = numberOrNull(stage.total_rem_sleep_time_milli);
  return {
    performance: numberOrNull(score.sleep_performance_percentage),
    efficiency: numberOrNull(score.sleep_efficiency_percentage),
    consistency: numberOrNull(score.sleep_consistency_percentage),
    respiratoryRate: numberOrNull(score.respiratory_rate),
    disturbances: numberOrNull(stage.disturbance_count),
    totalSleepMs: sumOrNull([lightMs, deepMs, remMs]),
    inBedMs: numberOrNull(stage.total_in_bed_time_milli),
    awakeMs: numberOrNull(stage.total_awake_time_milli),
    lightMs,
    deepMs,
    remMs,
    neededMs: sumOrNull([
      numberOrNull(needed.baseline_milli),
      numberOrNull(needed.need_from_sleep_debt_milli),
      numberOrNull(needed.need_from_recent_strain_milli),
      numberOrNull(needed.need_from_recent_nap_milli),
    ]),
    start: isoOrNull(sleep.start),
    end: isoOrNull(sleep.end),
    nap: sleep.nap === true,
  };
}

/**
 * @param {object} workout Raw WHOOP workout.
 * @returns {object} Workout projection.
 */
function mapWorkout(workout) {
  const score = scoreOf(workout);
  const zones =
    score.zone_durations && typeof score.zone_durations === 'object' ? score.zone_durations : {};
  const startMs = timestampOrNull(workout.start);
  const endMs = timestampOrNull(workout.end);
  const durationMs = startMs !== null && endMs !== null && endMs >= startMs ? endMs - startMs : null;
  const sport = stringOrNull(workout.sport_name);
  return {
    id: identifierOrNull(workout.id),
    date: dateKeyFromInstant(workout.start, workout.timezone_offset, 'local'),
    sport,
    sportName: sport,
    strain: numberOrNull(score.strain),
    durationMs,
    avgHr: numberOrNull(score.average_heart_rate),
    maxHr: numberOrNull(score.max_heart_rate),
    kilojoule: numberOrNull(score.kilojoule),
    distanceM: numberOrNull(score.distance_meter),
    zones: [
      numberOrNull(zones.zone_zero_milli),
      numberOrNull(zones.zone_one_milli),
      numberOrNull(zones.zone_two_milli),
      numberOrNull(zones.zone_three_milli),
      numberOrNull(zones.zone_four_milli),
      numberOrNull(zones.zone_five_milli),
    ],
  };
}

/**
 * @param {unknown} profile Raw WHOOP profile payload.
 * @returns {{ firstName: string|null, lastName: string|null, email: string|null,
 *   userId: number|string|null }|null}
 */
function mapProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  return {
    firstName: stringOrNull(profile.first_name),
    lastName: stringOrNull(profile.last_name),
    email: stringOrNull(profile.email),
    userId: identifierOrNull(profile.user_id),
  };
}

/**
 * @param {unknown} body Raw WHOOP body measurement payload.
 * @returns {{ heightM: number|null, weightKg: number|null, maxHr: number|null }|null}
 */
function mapBody(body) {
  if (!body || typeof body !== 'object') return null;
  return {
    heightM: numberOrNull(body.height_meter),
    weightKg: numberOrNull(body.weight_kilogram),
    maxHr: numberOrNull(body.max_heart_rate),
  };
}
