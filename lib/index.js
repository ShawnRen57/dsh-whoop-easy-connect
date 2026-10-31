/**
 * dsh-whoop-easy-connect — Host half.
 *
 * A Contract-style DSH plugin: exposes a package-private Typert Remote method
 * (`whoop/request`) that the browser bundle calls through `ctx.remote.whoop`,
 * owns the WHOOP OAuth flow and token storage, and aggregates the WHOOP
 * Developer API v2 data into the dashboard snapshot.
 *
 * OAuth needs a reachable redirect URI. The plugin registers
 * `<webServer origin>/whoop/oauth/callback` on the DSH web server when that
 * service exists; a user-configured `redirectUri` (WHOOP requires an HTTPS
 * URI) takes precedence. When neither is usable the settings page still
 * supports manual token binding and demo data.
 */
import { execFileSync } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createServer as createHttpsServer } from 'node:https';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import z from '@deepseek-ai/schemastery';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';

import { demoSnapshot } from './demo-data.js';
import { renderFailurePage, renderSuccessPage } from './oauth-page.js';
import {
  WHOOP_DEFAULTS,
  WhoopApi,
  WhoopApiError,
  aggregateSnapshot,
  tokensExpiring,
} from './whoop-api.js';

export const name = 'whoop-easy-connect';

/** The gateway services are required for the Remote half of this plugin. */
export const inject = ['typert', 'typertGateway'];

const CALLBACK_PATH = '/whoop/oauth/callback';
const STATE_TTL_MS = 10 * 60 * 1000;
const TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;
const SNAPSHOT_CACHE_MS = 8 * 1000;
const DEFAULT_DAYS = 30;
const MIN_DAYS = 7;
const MAX_DAYS = 30;
const DEFAULT_SCOPES =
  (WHOOP_DEFAULTS && WHOOP_DEFAULTS.scopes) ||
  'offline read:profile read:body_measurement read:cycles read:recovery read:sleep read:workout';

/** Plugin configuration (editable in the profile's `cordis.patch.yml`). */
export const Config = z.object({
  /** Number of trailing local days loaded into the dashboard (7–30). */
  days: z.number().step(1).min(MIN_DAYS).max(MAX_DAYS).default(DEFAULT_DAYS),
  /** Serve deterministic demo data while no WHOOP account is bound. */
  demoMode: z.boolean().default(true),
  /** WHOOP Developer Dashboard client id. */
  clientId: z.string().default(''),
  /** WHOOP Developer Dashboard client secret. */
  clientSecret: z.string().default(''),
  /** Redirect URI registered in the WHOOP app; must be HTTPS (or a custom scheme). */
  redirectUri: z.string().default(''),
  /**
   * Local HTTPS listener that serves the OAuth callback. WHOOP only accepts
   * HTTPS redirect URIs, so the plugin can expose its own loopback TLS endpoint
   * (self-signed certificate) when no external HTTPS redirect exists.
   * Set to 0 to disable.
   */
  localCallbackPort: z.number().step(1).min(0).max(65535).default(8443),
  /** Loopback address the local HTTPS callback listens on. */
  localCallbackHost: z.string().default('localhost'),
  /** Certificate PEM path; defaults to <dataDir>/tls/cert.pem. */
  localCallbackCert: z.string().default(''),
  /** Private key PEM path; defaults to <dataDir>/tls/key.pem. */
  localCallbackKey: z.string().default(''),
  /** OAuth scopes requested when binding. */
  scopes: z.string().default(DEFAULT_SCOPES),
  /** Directory holding the token/state file; defaults to ~/.dsh-whoop-easy-connect. */
  dataDir: z.string().default(''),
  /** Optional API base override (e.g. a test double). */
  apiBaseUrl: z.string().default(''),
  /** Optional OAuth authorize URL override. */
  authBaseUrl: z.string().default(''),
  /** Optional OAuth token URL override. */
  tokenUrl: z.string().default(''),
});

/* ------------------------------------------------------------------*
 * Remote method marker
 *
 * The plugin is authored in plain JavaScript, so the stage-3 `@Remote`
 * decorator is applied manually: its initializer is collected here and run
 * against each service instance, marking the class prototype exactly like the
 * decorator would.
 * ------------------------------------------------------------------*/

const remoteMethodInitializers = [];
(function markRequestRemote() {
  Remote(undefined, {
    kind: 'method',
    name: 'request',
    static: false,
    private: false,
    metadata: undefined,
    addInitializer(initializer) {
      remoteMethodInitializers.push(initializer);
    },
  });
})();

/* ------------------------------------------------------------------*
 * Small helpers
 * ------------------------------------------------------------------*/

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePort(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const port = Math.trunc(n);
  return port >= 0 && port <= 65535 ? port : fallback;
}

function clampDays(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_DAYS;
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.trunc(n)));
}

function normalizeConfig(config) {
  const input = config && typeof config === 'object' ? config : {};
  const dataDir = asText(input.dataDir) ? resolve(asText(input.dataDir)) : join(homedir(), '.dsh-whoop-easy-connect');
  return {
    days: clampDays(input.days === void 0 ? DEFAULT_DAYS : input.days),
    demoMode: input.demoMode !== false,
    clientId: asText(input.clientId),
    clientSecret: asText(input.clientSecret),
    redirectUri: asText(input.redirectUri),
    localCallbackPort: normalizePort(input.localCallbackPort, 8443),
    localCallbackHost: asText(input.localCallbackHost) || 'localhost',
    localCallbackCert: asText(input.localCallbackCert),
    localCallbackKey: asText(input.localCallbackKey),
    scopes: asText(input.scopes) || DEFAULT_SCOPES,
    dataDir,
    apiBaseUrl: asText(input.apiBaseUrl),
    authBaseUrl: asText(input.authBaseUrl),
    tokenUrl: asText(input.tokenUrl),
  };
}

function emptyState(credentials = null) {
  return { version: 1, tokens: null, profile: null, connectedAt: null, lastSyncAt: null, credentials };
}

function readJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeJsonFile(file, value) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, file);
  try {
    chmodSync(file, 0o600);
  } catch {
    /* best effort on filesystems without chmod */
  }
}

/**
 * Append one OAuth diagnostic event (never tokens, codes or secrets) so a
 * failed binding can be diagnosed from the plugin data directory.
 */
function appendOauthLog(dataDir, event, extra) {
  try {
    mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    const line = `${JSON.stringify({ at: new Date().toISOString(), event, ...extra })}\n`;
    writeFileSync(join(dataDir, 'oauth.log'), line, { flag: 'a', mode: 0o600 });
  } catch {
    /* diagnostics must never break the flow */
  }
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isLoopbackRedirect(uri) {
  try {
    const url = new URL(uri);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
  } catch {
    return false;
  }
}

function mapProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  return {
    firstName: asText(profile.first_name),
    lastName: asText(profile.last_name),
    email: asText(profile.email),
    userId: Number.isFinite(Number(profile.user_id)) ? Number(profile.user_id) : null,
  };
}

function failureEnvelope(error) {
  if (error instanceof WhoopApiError) {
    const code =
      error.code === 'unauthorized'
        ? 'token_expired'
        : error.code === 'bad_response'
          ? 'api_error'
          : error.code;
    return { ok: false, code, message: error.message };
  }
  return {
    ok: false,
    code: 'api_error',
    message: error instanceof Error ? error.message : String(error),
  };
}

/* ------------------------------------------------------------------*
 * Service
 * ------------------------------------------------------------------*/

export class WhoopHealthService extends TypertRemoteService {
  constructor(ctx, config) {
    super(ctx, 'whoop', { namespace: 'whoop' });

    for (const initialize of remoteMethodInitializers) initialize.call(this);

    this.pluginConfig = normalizeConfig(config);
    this.pendingAuth = null;
    this.lastError = null;
    this.cache = null;
    this.inflight = null;
    this.localCallback = null;

    this.installCallbackRoute(ctx);
    this.startLocalHttpsCallback(ctx);
  }

  /* ----------------------------------------------------------------*
   * Remote surface: the only method the browser bundle calls.
   * ----------------------------------------------------------------*/

  /**
   * Dispatch one browser request.
   * @param {object} request - `{ type, ... }` payload.
   * @returns {Promise<object>} JSON envelope (`{ ok: true, ... }` or `{ ok: false, code, message }`).
   */
  async request(request) {
    try {
      const payload = request && typeof request === 'object' ? request : {};
      const type = typeof payload.type === 'string' ? payload.type : '';
      switch (type) {
        case 'snapshot':
          return await this.handleSnapshot(payload);
        case 'status':
          return await this.handleStatus();
        case 'auth/start':
          return await this.handleStartAuth();
        case 'auth/manual':
          return await this.handleManual(payload);
        case 'auth/disconnect':
          return await this.handleDisconnect();
        case 'credentials/save':
          return await this.handleCredentialsSave(payload);
        case 'credentials/clear':
          return await this.handleCredentialsClear();
        default:
          return { ok: false, code: 'bad_request', message: `Unknown WHOOP request type "${type}".` };
      }
    } catch (error) {
      this.lastError = failureEnvelope(error);
      return failureEnvelope(error);
    }
  }

  /* ----------------------------------------------------------------*
   * Snapshot
   * ----------------------------------------------------------------*/

  async handleSnapshot(request) {
    const days = clampDays(request.days || this.pluginConfig.days);
    const force = request.force === true;
    const now = new Date();
    const state = this.readState();

    if (!state.tokens || !state.tokens.accessToken) {
      if (this.pluginConfig.demoMode) {
        const demo = demoSnapshot({ days, now });
        return {
          ok: true,
          snapshot: { mode: 'demo', updatedAt: now.toISOString(), ...demo },
        };
      }
      return {
        ok: false,
        code: 'auth_required',
        message: 'WHOOP account is not connected. Bind it in Settings → WHOOP账户.',
      };
    }

    if (!force && this.cache && this.cache.days === days && now.getTime() - this.cache.at < SNAPSHOT_CACHE_MS) {
      return { ok: true, snapshot: this.cache.snapshot };
    }

    try {
      const snapshot = await this.loadLiveSnapshot(days, now);
      this.cache = { at: Date.now(), days, snapshot };
      this.lastError = null;
      return { ok: true, snapshot };
    } catch (error) {
      const envelope = failureEnvelope(error);
      this.lastError = envelope;
      if (envelope.code === 'token_expired') {
        const cleared = this.readState();
        cleared.tokens = null;
        cleared.profile = null;
        this.writeState(cleared);
      }
      return envelope;
    }
  }

  async loadLiveSnapshot(days, now, retried = false) {
    const api = this.createApi();
    const state = this.readState();
    const tokens = await this.ensureTokens(api, state);
    const accessToken = tokens.accessToken;

    const rangeEnd = now;
    const rangeStart = new Date(now.getTime() - (days + 4) * 24 * 60 * 60 * 1000);
    const range = { start: rangeStart.toISOString(), end: rangeEnd.toISOString() };

    const warnings = [];
    const settle = async (label, operation) => {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof WhoopApiError && error.code === 'unauthorized') throw error;
        warnings.push(label);
        this.ctx.logger?.warn?.(`whoop-easy-connect: ${label} fetch failed (${failureEnvelope(error).code})`);
        return null;
      }
    };

    let fetched;
    try {
      fetched = await Promise.all([
        settle('profile', () => api.fetchProfile(accessToken)),
        settle('body', () => api.fetchBody(accessToken)),
        settle('recovery', () => api.fetchRecovery(accessToken, range)),
        settle('sleep', () => api.fetchSleep(accessToken, range)),
        settle('cycle', () => api.fetchCycles(accessToken, range)),
        settle('workout', () => api.fetchWorkouts(accessToken, range)),
      ]);
    } catch (error) {
      // A token WHOOP has already invalidated can still look valid by our clock;
      // force one refresh and retry the whole load before asking for a re-bind.
      if (
        !retried &&
        error instanceof WhoopApiError &&
        error.code === 'unauthorized' &&
        state.tokens &&
        state.tokens.refreshToken
      ) {
        const forced = this.readState();
        if (forced.tokens) {
          forced.tokens = { ...forced.tokens, expiresAt: new Date(0).toISOString() };
          this.writeState(forced);
        }
        return this.loadLiveSnapshot(days, now, true);
      }
      throw error;
    }
    const [profile, body, recoveries, sleeps, cycles, workouts] = fetched;

    const aggregated = aggregateSnapshot({
      profile,
      body,
      recoveries,
      sleeps,
      cycles,
      workouts,
      days,
      now: rangeEnd,
    });

    const latest = this.readState();
    if (profile) latest.profile = mapProfile(profile);
    latest.lastSyncAt = rangeEnd.toISOString();
    this.writeState(latest);

    const inheritedWarnings = Array.isArray(aggregated.warnings) ? aggregated.warnings : [];
    const mergedWarnings = [...new Set([...inheritedWarnings.map(String), ...warnings])];

    return {
      ...aggregated,
      mode: 'live',
      updatedAt: aggregated.updatedAt || rangeEnd.toISOString(),
      warnings: mergedWarnings,
    };
  }

  /* ----------------------------------------------------------------*
   * Status / auth
   * ----------------------------------------------------------------*/

  async handleStatus() {
    const state = this.readState();
    const pending =
      this.pendingAuth && Date.now() - this.pendingAuth.createdAt < STATE_TTL_MS ? this.pendingAuth : null;
    if (this.pendingAuth && pending === null) this.pendingAuth = null;

    const redirectUri = this.effectiveRedirectUri();
    const connected = Boolean(state.tokens && state.tokens.accessToken);
    const credentials = this.storedCredentials();
    return {
      ok: true,
      status: {
        connected,
        mode: connected ? 'live' : this.pluginConfig.demoMode ? 'demo' : 'none',
        profile: state.profile || null,
        expiresAt: state.tokens && state.tokens.expiresAt ? state.tokens.expiresAt : null,
        pending: pending !== null,
        loginUrl: pending ? pending.authorizeUrl : null,
        lastError: this.lastError,
        demoMode: this.pluginConfig.demoMode,
        configured: {
          clientId: credentials.clientId,
          clientSecretSaved: credentials.clientSecretSaved,
          redirectUri: redirectUri || null,
          callbackPath: CALLBACK_PATH,
          localCallbackPort: this.pluginConfig.localCallbackPort,
          dataDir: this.pluginConfig.dataDir,
          demoMode: this.pluginConfig.demoMode,
        },
      },
    };
  }

  async handleStartAuth() {
    const redirectUri = this.effectiveRedirectUri();
    const credentials = this.storedCredentials();
    if (!credentials.clientId || !credentials.clientSecret) {
      return {
        ok: false,
        code: 'not_configured',
        message:
          'WHOOP Client ID / Client Secret are not configured. Set clientId and clientSecret in the dsh-whoop-easy-connect plugin config (or use manual token binding).',
      };
    }
    if (!redirectUri) {
      return {
        ok: false,
        code: 'redirect_unavailable',
        message:
          'No OAuth redirect URI is available. Configure redirectUri in the plugin config; WHOOP requires an HTTPS redirect URI registered in the WHOOP Developer Dashboard.',
      };
    }
    if (/^http:\/\//i.test(redirectUri) && !isLoopbackRedirect(redirectUri)) {
      return {
        ok: false,
        code: 'redirect_insecure',
        message:
          'WHOOP requires an HTTPS redirect URI (or a custom scheme). Configure an HTTPS redirectUri in the plugin config.',
      };
    }

    const api = this.createApi();
    if (!api.configured) {
      return {
        ok: false,
        code: 'not_configured',
        message: 'The WHOOP API client is not fully configured.',
      };
    }

    const state = randomBytes(16).toString('hex');
    let authorizeUrl;
    try {
      authorizeUrl = api.buildAuthorizeUrl(state);
    } catch (error) {
      return failureEnvelope(error);
    }
    this.pendingAuth = { state, authorizeUrl, redirectUri, createdAt: Date.now() };
    this.oauthLog('start', { redirectUri });
    return { ok: true, authorizeUrl, redirectUri, state };
  }

  async handleManual(request) {
    const accessToken = asText(request.accessToken);
    const refreshToken = asText(request.refreshToken);
    if (!accessToken) {
      return { ok: false, code: 'bad_request', message: 'An access token is required.' };
    }
    const api = this.createApi();
    let profile;
    try {
      profile = await api.fetchProfile(accessToken);
    } catch (error) {
      return failureEnvelope(error);
    }
    const now = new Date();
    const tokens = {
      accessToken,
      refreshToken: refreshToken || null,
      tokenType: 'bearer',
      scope: this.pluginConfig.scopes,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    };
    this.writeState({
      version: 1,
      tokens,
      profile: mapProfile(profile),
      connectedAt: now.toISOString(),
      lastSyncAt: null,
      credentials: this.readState().credentials,
    });
    this.pendingAuth = null;
    this.lastError = null;
    this.cache = null;
    this.oauthLog('manual-connected', {});
    return this.handleStatus();
  }

  async handleDisconnect() {
    const state = this.readState();
    if (state.tokens && state.tokens.accessToken) {
      try {
        await this.createApi().revoke(state.tokens.accessToken);
      } catch {
        /* best effort: forgetting the local token is what matters */
      }
    }
    this.writeState(emptyState(state.credentials));
    this.pendingAuth = null;
    this.cache = null;
    this.lastError = null;
    return this.handleStatus();
  }

  /* ----------------------------------------------------------------*
   * OAuth callback
   * ----------------------------------------------------------------*/

  installCallbackRoute(ctx) {
    ctx.inject(['webServer'], (webCtx) => {
      const webServer = webCtx.webServer;
      if (!webServer || typeof webServer.register !== 'function') return;
      webCtx.effect(
        () =>
          webServer.register({
            kind: 'exact',
            path: CALLBACK_PATH,
            handler: (req, res) => this.handleCallback(req, res),
          }),
        'whoop-easy-connect: oauth callback route',
      );
    });
  }

  async handleCallback(req, res) {
    const send = (status, html) => {
      res.writeHead(status, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      });
      res.end(html);
    };

    if (req.method !== 'GET') {
      send(405, renderFailurePage('仅支持 GET 请求。', 'Only GET requests are supported.'));
      return;
    }
    let url;
    try {
      url = new URL(req.url || CALLBACK_PATH, 'http://localhost');
    } catch {
      send(400, renderFailurePage('回调地址无效。', 'Invalid callback URL.'));
      return;
    }

    const denied = url.searchParams.get('error');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const pending = this.pendingAuth;
    const stateMatches = Boolean(pending && safeEqual(state || '', pending.state));
    this.oauthLog('callback', {
      hasError: Boolean(denied),
      hasCode: Boolean(code),
      hasState: Boolean(state),
      stateMatches,
      pending: Boolean(pending),
    });

    if (!pending || !stateMatches) {
      send(
        400,
        renderFailurePage(
          '授权状态已过期或无效，请在 DSH 的「设置 → WHOOP账户」中重新发起绑定。',
          'The authorization state is missing, expired or invalid. Start the binding again from Settings → WHOOP Account.',
        ),
      );
      return;
    }
    if (denied) {
      this.pendingAuth = null;
      this.lastError = { code: 'auth_denied', message: `WHOOP authorization was not granted (${denied}).` };
      send(
        401,
        renderFailurePage(
          'WHOOP 授权未完成，请重新发起绑定。',
          'WHOOP authorization was not granted. Start the binding again.',
          denied,
        ),
      );
      return;
    }
    if (!code) {
      send(
        400,
        renderFailurePage('缺少授权码，请重新发起绑定。', 'The authorization code is missing. Start the binding again.'),
      );
      return;
    }

    try {
      const api = this.createApi();
      const tokens = await api.exchangeCode(code);
      let profile = null;
      try {
        profile = await api.fetchProfile(tokens.accessToken);
      } catch {
        /* profile is cosmetic; the connection is already valid */
      }
      this.writeState({
        version: 1,
        tokens,
        profile: mapProfile(profile),
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
        credentials: this.readState().credentials,
      });
      this.pendingAuth = null;
      this.lastError = null;
      this.cache = null;
      this.oauthLog('connected', { profile: Boolean(profile) });
      send(200, renderSuccessPage(profile || {}));
    } catch (error) {
      const envelope = failureEnvelope(error);
      this.lastError = envelope;
      this.oauthLog('exchange-failed', { code: envelope.code });
      send(
        500,
        renderFailurePage(
          '授权码交换失败，请返回 DSH 重试。',
          'Exchanging the authorization code failed. Go back to DSH and retry.',
          envelope.code,
        ),
      );
    }
  }

  /* ----------------------------------------------------------------*
   * Token + storage plumbing
   * ----------------------------------------------------------------*/

  oauthLog(event, extra) {
    appendOauthLog(this.pluginConfig.dataDir, event, extra || {});
  }

  /** Credentials stored by the settings UI win over the profile config. */
  storedCredentials() {
    const state = this.readState();
    const stored = state.credentials && typeof state.credentials === 'object' ? state.credentials : {};
    const clientId = asText(stored.clientId) || this.pluginConfig.clientId;
    const clientSecret = asText(stored.clientSecret) || this.pluginConfig.clientSecret;
    return { clientId, clientSecret, clientSecretSaved: Boolean(clientSecret) };
  }

  async handleCredentialsSave(request) {
    const clientId = asText(request.clientId);
    const clientSecret = asText(request.clientSecret);
    if (!clientId || !clientSecret) {
      return { ok: false, code: 'bad_request', message: 'Client ID and Client Secret are required.' };
    }
    const state = this.readState();
    state.credentials = { clientId, clientSecret };
    try {
      this.writeState(state);
    } catch (error) {
      return failureEnvelope(error);
    }
    this.lastError = null;
    this.oauthLog('credentials-saved', {});
    return this.handleStatus();
  }

  async handleCredentialsClear() {
    const state = this.readState();
    state.credentials = null;
    try {
      this.writeState(state);
    } catch (error) {
      return failureEnvelope(error);
    }
    this.oauthLog('credentials-cleared', {});
    return this.handleStatus();
  }

  createApi() {
    const credentials = this.storedCredentials();
    const options = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri: this.effectiveRedirectUri() || '',
      scopes: this.pluginConfig.scopes,
    };
    if (this.pluginConfig.authBaseUrl) options.authUrl = this.pluginConfig.authBaseUrl;
    if (this.pluginConfig.tokenUrl) options.tokenUrl = this.pluginConfig.tokenUrl;
    if (this.pluginConfig.apiBaseUrl) options.apiBase = this.pluginConfig.apiBaseUrl;
    return new WhoopApi(options);
  }

  webOrigin() {
    try {
      const webServer = this.ctx.get('webServer');
      if (webServer && typeof webServer.getOrigin === 'function') return webServer.getOrigin();
    } catch {
      /* no web carrier or not bound yet */
    }
    return null;
  }

  /**
   * Serve the OAuth callback over a local HTTPS listener when configured.
   * WHOOP rejects plain-HTTP redirect URIs, so a loopback TLS endpoint with a
   * self-signed certificate lets a desktop install finish OAuth locally after
   * the user registers the exact URI in the WHOOP Developer Dashboard.
   */
  startLocalHttpsCallback(ctx) {
    const port = this.pluginConfig.localCallbackPort;
    if (!port) return;
    const host = this.pluginConfig.localCallbackHost;
    const certFile =
      this.pluginConfig.localCallbackCert || join(this.pluginConfig.dataDir, 'tls', 'cert.pem');
    const keyFile =
      this.pluginConfig.localCallbackKey || join(this.pluginConfig.dataDir, 'tls', 'key.pem');
    this.ensureLocalCertificate(certFile, keyFile);
    if (!existsSync(certFile) || !existsSync(keyFile)) {
      this.ctx.logger?.warn?.(
        `whoop-easy-connect: local HTTPS OAuth callback certificate missing at ${certFile}; falling back to the DSH web server callback`,
      );
      return;
    }
    const handler = (req, res) => {
      let pathname = CALLBACK_PATH;
      try {
        pathname = new URL(req.url || '/', `https://${host}:${port}`).pathname;
      } catch {
        /* keep default path */
      }
      if (pathname !== CALLBACK_PATH) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      Promise.resolve(this.handleCallback(req, res)).catch((error) => {
        this.ctx.logger?.warn?.(
          `whoop-easy-connect: local HTTPS callback failed (${error instanceof Error ? error.message : String(error)})`,
        );
        try {
          res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('WHOOP OAuth callback failed.');
        } catch {
          /* response already started */
        }
      });
    };
    // `localhost` resolves to both loopback families on macOS; bind both so the
    // browser reaches the callback whichever address it tries first.
    const bindHosts = host === 'localhost' ? ['127.0.0.1', '::1'] : [host];
    ctx.effect(() => {
      let cert;
      let key;
      try {
        cert = readFileSync(certFile);
        key = readFileSync(keyFile);
      } catch (error) {
        this.ctx.logger?.warn?.(
          `whoop-easy-connect: cannot read local HTTPS certificate (${error instanceof Error ? error.message : String(error)})`,
        );
        return;
      }
      const servers = [];
      for (const bindHost of bindHosts) {
        let server;
        try {
          server = createHttpsServer({ cert, key }, handler);
        } catch (error) {
          this.ctx.logger?.warn?.(`whoop-easy-connect: local HTTPS listener setup failed (${String(error)})`);
          continue;
        }
        server.on('error', (error) => {
          this.ctx.logger?.warn?.(`whoop-easy-connect: local HTTPS callback server error on ${bindHost}: ${error.message}`);
        });
        server.once('listening', () => {
          this.localCallback = { host, port, origin: `https://${host}:${port}` };
          this.ctx.logger?.info?.(
            `whoop-easy-connect: OAuth callback listening on https://${host}:${port}${CALLBACK_PATH} (${bindHost})`,
          );
        });
        try {
          server.listen(port, bindHost);
          servers.push(server);
        } catch (error) {
          this.ctx.logger?.warn?.(`whoop-easy-connect: cannot listen on ${bindHost}:${port} (${String(error)})`);
        }
      }
      return () => {
        this.localCallback = null;
        for (const server of servers) {
          try {
            server.close();
            server.closeAllConnections?.();
          } catch {
            /* already closed */
          }
        }
      };
    }, 'whoop-easy-connect: local https oauth callback');
  }

  /**
   * Generate the loopback TLS certificate on first run when `openssl` is
   * available; WHOOP only accepts HTTPS redirect URIs, so onboarding should not
   * require a manual certificate step.
   */
  ensureLocalCertificate(certFile, keyFile) {
    if (existsSync(certFile) && existsSync(keyFile)) return;
    try {
      mkdirSync(dirname(certFile), { recursive: true, mode: 0o700 });
      mkdirSync(dirname(keyFile), { recursive: true, mode: 0o700 });
      execFileSync(
        'openssl',
        [
          'req', '-x509', '-newkey', 'rsa:2048', '-sha256', '-nodes', '-days', '825',
          '-keyout', keyFile, '-out', certFile,
          '-subj', '/CN=localhost',
          '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
        ],
        { stdio: 'ignore', timeout: 15000 },
      );
      try {
        chmodSync(keyFile, 0o600);
        chmodSync(certFile, 0o644);
      } catch {
        /* best effort */
      }
      this.ctx.logger?.info?.(`whoop-easy-connect: generated local OAuth callback certificate at ${certFile}`);
    } catch (error) {
      this.ctx.logger?.warn?.(
        `whoop-easy-connect: could not generate local HTTPS certificate (${error instanceof Error ? error.message : String(error)}); OAuth callback falls back to the DSH web server`,
      );
    }
  }

  effectiveRedirectUri() {
    if (this.pluginConfig.redirectUri) return this.pluginConfig.redirectUri;
    if (this.localCallback) return `${this.localCallback.origin}${CALLBACK_PATH}`;
    const origin = this.webOrigin();
    return origin ? `${origin}${CALLBACK_PATH}` : null;
  }

  statePath() {
    return join(this.pluginConfig.dataDir, 'state.json');
  }

  readState() {
    const raw = readJsonFile(this.statePath());
    if (!raw || typeof raw !== 'object') return emptyState();
    const tokens = raw.tokens && typeof raw.tokens === 'object' ? raw.tokens : null;
    const rawCredentials = raw.credentials && typeof raw.credentials === 'object' ? raw.credentials : null;
    const credentials = rawCredentials
      ? { clientId: asText(rawCredentials.clientId), clientSecret: asText(rawCredentials.clientSecret) }
      : null;
    return {
      version: 1,
      tokens,
      profile: raw.profile && typeof raw.profile === 'object' ? raw.profile : null,
      connectedAt: typeof raw.connectedAt === 'string' ? raw.connectedAt : null,
      lastSyncAt: typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null,
      credentials,
    };
  }

  writeState(state) {
    try {
      writeJsonFile(this.statePath(), state);
    } catch (error) {
      this.ctx.logger?.warn?.(
        `whoop-easy-connect: could not persist token state (${error instanceof Error ? error.message : String(error)})`,
      );
      throw new WhoopApiError('storage_error', 'Could not persist the WHOOP token state.');
    }
  }

  async ensureTokens(api, state) {
    let tokens = state.tokens;
    if (!tokens || !tokens.accessToken) {
      throw new WhoopApiError('unauthorized', 'No WHOOP access token is stored.');
    }
    if (!tokensExpiring(tokens, TOKEN_REFRESH_SKEW_MS)) return tokens;
    if (!tokens.refreshToken) {
      throw new WhoopApiError('unauthorized', 'The WHOOP access token expired and no refresh token is stored.');
    }
    let response;
    try {
      response = await api.refreshTokens(tokens);
    } catch (error) {
      if (error instanceof WhoopApiError && error.code === 'unauthorized') {
        state.tokens = null;
        this.writeState(state);
        throw new WhoopApiError('unauthorized', 'WHOOP authorization expired. Bind the account again in Settings.');
      }
      throw error;
    }
    tokens = response;
    state.tokens = tokens;
    this.writeState(state);
    return tokens;
  }
}

/** Cordis entry point. */
export function apply(ctx, config) {
  return new WhoopHealthService(ctx, config);
}
