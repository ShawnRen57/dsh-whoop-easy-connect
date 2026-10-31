/**
 * Remote RPC facade used by every client fragment.
 *
 * The plugin's Host half exposes one Typert Remote method `whoop/request`.
 * `WHOOP_API` is installed by the shell (`ctx.remote.whoop.request`) and always
 * resolves an envelope object — it never throws — so React components can
 * render failures without try/catch noise.
 */
var WHOOP = {};

var WHOOP_API = {
  _ctx: null,

  /** Called once by the shell after the remote contribution is mounted. */
  attach: function attach(ctx) {
    this._ctx = ctx;
  },

  _call: async function _call(request) {
    try {
      var ctx = this._ctx;
      if (!ctx) {
        return {
          ok: false,
          code: 'transport',
          message: 'WHOOP client is not attached to the DSH page yet.',
        };
      }
      // Reading a cordis service without injecting it throws inside the page;
      // keep that failure inside this try so the facade always resolves.
      var remote;
      var namespace;
      try {
        remote = ctx.remote;
        namespace = remote && remote.whoop;
      } catch (accessError) {
        return {
          ok: false,
          code: 'transport',
          message:
            'WHOOP remote namespace access failed: ' +
            (accessError && accessError.message ? accessError.message : String(accessError)),
        };
      }
      if (!namespace || typeof namespace.request !== 'function') {
        return {
          ok: false,
          code: 'transport',
          message: 'WHOOP remote namespace is not mounted.',
        };
      }
      var result = await namespace.request(request);
      if (result && result.ok === true) {
        var value = result.value;
        if (value && value.ok === false) return value;
        return value === void 0 ? { ok: true } : value;
      }
      var error = result && result.error;
      var details = (error && error.details) || {};
      return {
        ok: false,
        code: details.code || details.endpoint || 'remote_error',
        message: (error && error.message) || 'WHOOP remote call failed.',
      };
    } catch (cause) {
      return {
        ok: false,
        code: 'transport',
        message: cause && cause.message ? cause.message : String(cause),
      };
    }
  },

  /** Load the dashboard snapshot. `{ force: true }` bypasses the host short cache. */
  snapshot: function snapshot(options) {
    return this._call({
      type: 'snapshot',
      force: !!(options && options.force),
      days: (options && options.days) || 0,
    });
  },

  /** Read the WHOOP account/connection status. */
  status: function status() {
    return this._call({ type: 'status' });
  },

  /** Create the WHOOP OAuth authorize URL. */
  startAuth: function startAuth() {
    return this._call({ type: 'auth/start' });
  },

  /** Bind an account with manually supplied tokens. */
  manual: function manual(input) {
    return this._call({
      type: 'auth/manual',
      accessToken: (input && input.accessToken) || '',
      refreshToken: (input && input.refreshToken) || '',
    });
  },

  /** Revoke + forget the bound WHOOP account. */
  disconnect: function disconnect() {
    return this._call({ type: 'auth/disconnect' });
  },

  /** Save the WHOOP app Client ID / Client Secret entered in settings. */
  saveCredentials: function saveCredentials(input) {
    return this._call({
      type: 'credentials/save',
      clientId: (input && input.clientId) || '',
      clientSecret: (input && input.clientSecret) || '',
    });
  },

  /** Forget the locally saved WHOOP app credentials. */
  clearCredentials: function clearCredentials() {
    return this._call({ type: 'credentials/clear' });
  },

  /** Whether a remote transport is attached (useful for early render states). */
  ready: function ready() {
    return this._ctx !== null && this._ctx !== void 0;
  },
};
