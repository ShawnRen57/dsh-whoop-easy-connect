/**
 * WHOOP account settings section (`WHOOP.SettingsSection`).
 *
 * Rendered by the shell into the `settings.section` slot as the “WHOOP账户”
 * page. Implements the four-step onboarding flow from docs/UX-REDESIGN.md §三:
 *
 *   1. sign in to the WHOOP Developer Dashboard
 *   2. create a WHOOP app and register the redirect URI (one-click copy)
 *   3. save the Client ID / Client Secret (double-click to edit)
 *   4. authorize the account (OAuth start + polling until connected)
 *
 * Connected state swaps the steps for an account card with re-authorize and a
 * two-step disconnect. Every status read notifies `WHOOP_UI.setConnected(...)`
 * so the shell can order the settings navigation.
 *
 * Fragments share one function scope (see docs/PLUGIN_SPEC.md §3): `React`,
 * `h`, `WHOOP`, `WHOOP_API`, `WHOOP_T`, `WHOOP_LANG` and `WHOOP_FMT` are
 * already defined when this file is concatenated after them.
 */
(function installWhoopSettingsSection() {
  'use strict';

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  /** How often a pending OAuth attempt re-reads `status`. */
  var POLL_INTERVAL_MS = 2500;
  /** Stop waiting for the browser after five minutes. */
  var POLL_TIMEOUT_MS = 5 * 60 * 1000;
  /** Stop polling after this many consecutive transport failures. */
  var MAX_POLL_FAILURES = 4;
  /** Keep raw error text short; never surface stack traces in the UI. */
  var RAW_MESSAGE_LIMIT = 400;
  /** How long the “确认解除绑定？” state stays armed. */
  var DISCONNECT_CONFIRM_MS = 5000;
  /** How long the “已复制” feedback stays visible. */
  var COPY_FEEDBACK_MS = 2000;
  /** WHOOP Developer Dashboard. */
  var DEVELOPER_DASHBOARD_URL = 'https://developer-dashboard.whoop.com/';

  /** Friendly copy for Host `status` / action error codes. */
  var STATUS_ERROR_KEYS = {
    not_configured: 'acct.error.not_configured',
    auth_required: 'acct.error.auth_required',
    auth_denied: 'acct.error.auth_denied',
    token_expired: 'acct.error.token_expired',
    network: 'acct.error.network',
    rate_limited: 'acct.error.rate_limited',
    api_error: 'acct.error.api_error',
    bad_request: 'acct.error.bad_request',
    storage_error: 'acct.error.storage_error',
    transport: 'acct.error.transport',
    remote_error: 'acct.error.transport',
    bad_response: 'acct.error.bad_response',
  };

  /** Friendly copy for `auth/start` / polling failures. */
  var AUTH_ERROR_KEYS = {
    not_configured: 'acct.auth_error.not_configured',
    redirect_insecure: 'acct.auth_error.redirect_insecure',
    redirect_unavailable: 'acct.auth_error.redirect_unavailable',
    network: 'acct.auth_error.network',
    transport: 'acct.auth_error.network',
    remote_error: 'acct.auth_error.network',
    bad_request: 'acct.auth_error.bad_request',
    storage_error: 'acct.auth_error.storage_error',
  };

  /** Friendly copy for `credentials/save` failures. */
  var CREDENTIAL_SAVE_ERROR_KEYS = {
    bad_request: 'acct.step3.saveError.bad_request',
    storage_error: 'acct.step3.saveError.storage_error',
    transport: 'acct.step3.saveError.unavailable',
    remote_error: 'acct.step3.saveError.unavailable',
  };

  /** Friendly copy for `credentials/clear` failures. */
  var CREDENTIAL_CLEAR_ERROR_KEYS = {
    bad_request: 'acct.error.bad_request',
    storage_error: 'acct.step3.clearError.storage_error',
    transport: 'acct.step3.clearError.unavailable',
    remote_error: 'acct.step3.clearError.unavailable',
  };

  /* ------------------------------------------------------------------ *
   * Small helpers
   * ------------------------------------------------------------------ */

  function t(key, vars) {
    return WHOOP_T(key, vars);
  }

  function errorText(map, code) {
    var key = code && map[code];
    return t(key || 'acct.error.generic');
  }

  function statusErrorText(code) {
    return errorText(STATUS_ERROR_KEYS, code);
  }

  function authErrorText(code) {
    return errorText(AUTH_ERROR_KEYS, code);
  }

  function saveCredentialErrorText(code) {
    return errorText(CREDENTIAL_SAVE_ERROR_KEYS, code);
  }

  function clearCredentialErrorText(code) {
    return errorText(CREDENTIAL_CLEAR_ERROR_KEYS, code);
  }

  /** `"[code] raw message"`, capped so a runaway error cannot flood the card. */
  function codeDetail(code, message) {
    var raw = message === null || message === void 0 ? '' : String(message);
    if (raw.length > RAW_MESSAGE_LIMIT) raw = raw.slice(0, RAW_MESSAGE_LIMIT - 1) + '…';
    if (code && raw) return '[' + code + '] ' + raw;
    if (code) return '[' + code + ']';
    return raw;
  }

  function formatDate(iso) {
    if (typeof WHOOP_FMT === 'object' && WHOOP_FMT !== null && typeof WHOOP_FMT.dateLong === 'function') {
      try {
        return WHOOP_FMT.dateLong(iso);
      } catch (error) {
        /* fall through to the language-neutral ISO date */
      }
    }
    return String(iso).slice(0, 10);
  }

  function formatTime(iso) {
    if (typeof WHOOP_FMT === 'object' && WHOOP_FMT !== null && typeof WHOOP_FMT.timeShort === 'function') {
      try {
        return WHOOP_FMT.timeShort(iso);
      } catch (error) {
        /* fall through to the language-neutral ISO time */
      }
    }
    return String(iso).slice(11, 16);
  }

  function nameOf(profile) {
    if (!profile || typeof profile !== 'object') return '';
    var parts = [];
    if (typeof profile.firstName === 'string' && profile.firstName) parts.push(profile.firstName);
    if (typeof profile.lastName === 'string' && profile.lastName) parts.push(profile.lastName);
    return parts.join(' ').trim();
  }

  function emailOf(profile) {
    if (!profile || typeof profile !== 'object') return '';
    return typeof profile.email === 'string' && profile.email ? profile.email : '';
  }

  /** `status.configured` (tolerates the pre-redesign boolean shape). */
  function configuredOf(status) {
    var configured = status && status.configured;
    return configured && typeof configured === 'object' ? configured : {};
  }

  /** Effective Client ID (a string; empty when nothing is configured). */
  function clientIdOf(configured) {
    if (!configured) return '';
    return typeof configured.clientId === 'string' ? configured.clientId : '';
  }

  /** Whether a Client Secret is stored (new shape + legacy fallback). */
  function secretSavedOf(configured) {
    if (!configured) return false;
    if (typeof configured.clientSecretSaved === 'boolean') return configured.clientSecretSaved;
    if (typeof configured.clientSecret === 'boolean') return configured.clientSecret;
    return false;
  }

  /** Redirect URI the user has to register in the WHOOP Developer Dashboard. */
  function redirectUriOf(configured) {
    if (!configured) return '';
    return typeof configured.redirectUri === 'string' ? configured.redirectUri : '';
  }

  /** The `WHOOP_UI` helper provided by the shell (may be absent during SSR). */
  function getWhoopUi() {
    try {
      if (typeof WHOOP_UI !== 'undefined' && WHOOP_UI) return WHOOP_UI;
    } catch (error) {
      /* not declared yet */
    }
    try {
      if (typeof window !== 'undefined' && window && window.WHOOP_UI) return window.WHOOP_UI;
    } catch (error) {
      /* no window (SSR) */
    }
    return null;
  }

  /** Tell the shell whether the account is bound so it can order the nav. */
  function notifyConnected(status) {
    var ui = getWhoopUi();
    if (!ui) return;
    try {
      if (typeof ui.setConnected === 'function') ui.setConnected(!!(status && status.connected));
    } catch (error) {
      /* shell helper failures must never break the settings page */
    }
  }

  /* ------------------------------------------------------------------ *
   * Presentational atoms
   * ------------------------------------------------------------------ */

  function WhoopSpinner() {
    return h('span', { className: 'wps-spinner', 'aria-hidden': 'true' });
  }

  function busyContent(label) {
    return h(React.Fragment, null, h(WhoopSpinner, null), h('span', null, label));
  }

  /** Collapsed raw error text (Host message only, never a stack trace). */
  function RawDetail(props) {
    if (!props || !props.message) return null;
    return h(
      'details',
      { className: 'wps-raw-details' },
      h('summary', null, t('acct.error.detail')),
      h('code', null, props.message),
    );
  }

  /** “number + title” head shared by the step cards. */
  function stepHead(number, titleKey) {
    var titleId = 'wps-step' + number + '-title';
    return h(
      'div',
      { className: 'wps-step-head' },
      h('span', { className: 'wps-step-index', 'aria-hidden': 'true' }, String(number)),
      h('h3', { className: 'wps-step-title', id: titleId }, t(titleKey)),
    );
  }

  /* ------------------------------------------------------------------ *
   * Component
   * ------------------------------------------------------------------ */

  WHOOP.SettingsSection = function SettingsSection(props) {
    // Re-render the whole page when the dashboard language toggle changes.
    var lang = WHOOP_LANG.use();

    // Test-only server-render preset (used by the Lead's smoke test): render
    // this status object immediately without fetching. Never carries tokens.
    var presetStatus =
      props && props.initialStatus && typeof props.initialStatus === 'object' ? props.initialStatus : null;
    var presetConfigured = presetStatus ? configuredOf(presetStatus) : {};

    var phaseState = useState(presetStatus ? 'ready' : 'loading');
    var phase = phaseState[0];
    var setPhase = phaseState[1];

    var statusState = useState(presetStatus || null);
    var status = statusState[0];
    var setStatus = statusState[1];

    var loadErrorState = useState(null);
    var loadError = loadErrorState[0];
    var setLoadError = loadErrorState[1];

    var busyState = useState(null);
    var busy = busyState[0];
    var setBusy = busyState[1];

    var pollState = useState(null);
    var poll = pollState[0];
    var setPoll = pollState[1];

    var noticeState = useState(null);
    var notice = noticeState[0];
    var setNotice = noticeState[1];

    var credEditState = useState(false);
    var credEdit = credEditState[0];
    var setCredEdit = credEditState[1];

    var credIdState = useState(clientIdOf(presetConfigured));
    var credId = credIdState[0];
    var setCredId = credIdState[1];

    var credSecretState = useState('');
    var credSecret = credSecretState[0];
    var setCredSecret = credSecretState[1];

    var credNoticeState = useState(null);
    var credNotice = credNoticeState[0];
    var setCredNotice = credNoticeState[1];

    var confirmDisconnectState = useState(false);
    var confirmDisconnect = confirmDisconnectState[0];
    var setConfirmDisconnect = confirmDisconnectState[1];

    var copyStateState = useState('idle');
    var copyState = copyStateState[0];
    var setCopyState = copyStateState[1];

    var aliveRef = useRef(true);
    var presetRef = useRef(presetStatus !== null);
    var dismissedPollRef = useRef(false);
    var credEditRef = useRef(false);
    var copyTimerRef = useRef(null);
    var confirmTimerRef = useRef(null);

    /** Retire the armed disconnect confirmation. */
    function cancelDisconnectConfirm() {
      if (confirmTimerRef.current !== null) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
      setConfirmDisconnect(false);
    }

    /** Keep the credential inputs in sync with a fresh status payload. */
    function syncCredentialFields(nextStatus, force) {
      if (credEditRef.current && !force) return;
      var configured = configuredOf(nextStatus);
      setCredId(clientIdOf(configured));
      setCredSecret('');
    }

    /** Shared success path for every envelope that carries a status object. */
    function applyStatus(nextStatus) {
      if (!nextStatus) return;
      setStatus(nextStatus);
      setPhase('ready');
      setLoadError(null);
      notifyConnected(nextStatus);
    }

    /**
     * Start (or keep) the pending-OAuth polling loop for a status payload that
     * reports an attempt waiting for the browser. Disabled for the SSR preset.
     */
    function ensurePendingPoll(nextStatus) {
      if (presetRef.current) return;
      if (!nextStatus || nextStatus.pending !== true) return;
      if (dismissedPollRef.current) return;
      setPoll(function pollReducer(current) {
        if (current) return current;
        return {
          deadline: Date.now() + POLL_TIMEOUT_MS,
          url: typeof nextStatus.loginUrl === 'string' ? nextStatus.loginUrl : '',
        };
      });
    }

    /** Read the Host status; `{ silent }` keeps the current UI while refreshing. */
    function loadStatus(options) {
      var silent = !!(options && options.silent);
      if (!silent) {
        setLoadError(null);
        setPhase('loading');
      }
      function onLoaded(envelope) {
        if (!aliveRef.current) return envelope || null;
        if (envelope && envelope.ok === true && envelope.status) {
          applyStatus(envelope.status);
          syncCredentialFields(envelope.status);
          ensurePendingPoll(envelope.status);
          return envelope;
        }
        var error = {
          code: (envelope && envelope.code) || 'network',
          message: (envelope && envelope.message) || '',
        };
        if (silent) {
          setNotice({ kind: 'error', source: 'status', code: error.code, message: error.message });
        } else {
          setLoadError(error);
          setPhase('error');
        }
        return envelope || null;
      }
      function onFailed() {
        if (!aliveRef.current) return null;
        if (silent) {
          setNotice({ kind: 'error', source: 'status', code: 'network', message: '' });
        } else {
          setLoadError({ code: 'network', message: '' });
          setPhase('error');
        }
        return null;
      }
      return WHOOP_API.status().then(onLoaded, onFailed);
    }

    /* ----------------------------------------------------------------*
     * Effects
     * ----------------------------------------------------------------*/

    // Mount: load status (or use the SSR preset) and clean up timers.
    useEffect(function onMount() {
      aliveRef.current = true;
      if (presetRef.current) {
        notifyConnected(presetStatus);
      } else {
        loadStatus();
      }
      return function onUnmount() {
        aliveRef.current = false;
        if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
        if (confirmTimerRef.current !== null) clearTimeout(confirmTimerRef.current);
        copyTimerRef.current = null;
        confirmTimerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pending-OAuth polling: every 2.5 s; stop on connected / pending cleared /
    // timeout / repeated transport failures.
    useEffect(
      function pollPendingAuth() {
        if (!poll) return undefined;

        var cancelled = false;
        var timer = null;
        var failures = 0;

        function stop(nextNotice) {
          if (cancelled) return;
          cancelled = true;
          if (timer !== null) clearTimeout(timer);
          // A finished/failed attempt should reveal the bind button again.
          if (nextNotice && nextNotice.kind !== 'success') dismissedPollRef.current = true;
          setPoll(null);
          if (nextNotice) setNotice(nextNotice);
        }

        function schedule() {
          if (cancelled) return;
          timer = setTimeout(tick, POLL_INTERVAL_MS);
        }

        function tick() {
          WHOOP_API.status().then(
            function onPolled(envelope) {
              if (cancelled) return;
              if (envelope && envelope.ok === true && envelope.status) {
                failures = 0;
                applyStatus(envelope.status);
                if (envelope.status.pending !== true) {
                  if (envelope.status.connected) {
                    stop({ kind: 'success', source: 'auth', textKey: 'acct.step4.success' });
                  } else if (envelope.status.lastError) {
                    stop({
                      kind: 'error',
                      source: 'auth',
                      code: envelope.status.lastError.code,
                      message: envelope.status.lastError.message,
                    });
                  } else {
                    stop({ kind: 'warn', source: 'auth', textKey: 'acct.step4.timeout' });
                  }
                  return;
                }
                if (Date.now() >= poll.deadline) {
                  stop({ kind: 'warn', source: 'auth', textKey: 'acct.step4.timeout' });
                  return;
                }
                schedule();
                return;
              }
              failures += 1;
              if (failures >= MAX_POLL_FAILURES || Date.now() >= poll.deadline) {
                stop({
                  kind: 'error',
                  source: 'auth',
                  code: (envelope && envelope.code) || 'network',
                  message: (envelope && envelope.message) || '',
                });
                return;
              }
              schedule();
            },
            function onPollFailed() {
              if (cancelled) return;
              failures += 1;
              if (failures >= MAX_POLL_FAILURES || Date.now() >= poll.deadline) {
                stop({ kind: 'error', source: 'auth', code: 'network', message: '' });
                return;
              }
              schedule();
            },
          );
        }

        schedule();
        return function cleanupPoll() {
          cancelled = true;
          if (timer !== null) clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [poll],
    );

    // Disarm the “确认解除绑定？” state after a few seconds.
    useEffect(
      function disarmDisconnectConfirm() {
        if (!confirmDisconnect) return undefined;
        if (confirmTimerRef.current !== null) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(function resetConfirm() {
          confirmTimerRef.current = null;
          if (aliveRef.current) setConfirmDisconnect(false);
        }, DISCONNECT_CONFIRM_MS);
        return function cleanupConfirm() {
          if (confirmTimerRef.current !== null) {
            clearTimeout(confirmTimerRef.current);
            confirmTimerRef.current = null;
          }
        };
      },
      [confirmDisconnect],
    );

    /* ----------------------------------------------------------------*
     * Actions
     * ----------------------------------------------------------------*/

    function handleOpenCredentialEditor() {
      if (busy) return;
      credEditRef.current = true;
      setCredEdit(true);
      setCredNotice(null);
      setCopyState('idle');
    }

    function handleCredentialFieldsChanged() {
      if (credNotice) setCredNotice(null);
    }

    function handleSaveCredentials() {
      if (busy) return;
      var nextClientId = String(credId || '').trim();
      var nextClientSecret = String(credSecret || '').trim();
      if (!nextClientId || !nextClientSecret) {
        setCredNotice({ kind: 'error', textKey: 'acct.step3.validation', validation: true });
        return;
      }
      if (!WHOOP_API || typeof WHOOP_API.saveCredentials !== 'function') {
        setCredNotice({ kind: 'error', textKey: 'acct.step3.saveError.unavailable' });
        return;
      }
      setBusy('credentials-save');
      setCredNotice(null);
      WHOOP_API.saveCredentials({ clientId: nextClientId, clientSecret: nextClientSecret }).then(
        function onSaved(envelope) {
          if (!aliveRef.current) return;
          setBusy(null);
          if (envelope && envelope.ok === true && envelope.status) {
            applyStatus(envelope.status);
            credEditRef.current = false;
            setCredEdit(false);
            syncCredentialFields(envelope.status, true);
            setCredNotice({ kind: 'success', textKey: 'acct.step3.saved' });
            return;
          }
          setCredNotice({
            kind: 'error',
            operation: 'save',
            code: (envelope && envelope.code) || 'network',
            message: (envelope && envelope.message) || '',
          });
        },
        function onSaveFailed() {
          if (!aliveRef.current) return;
          setBusy(null);
          setCredNotice({ kind: 'error', operation: 'save', code: 'network', message: '' });
        },
      );
    }

    function handleClearCredentials() {
      if (busy) return;
      if (!WHOOP_API || typeof WHOOP_API.clearCredentials !== 'function') {
        setCredNotice({ kind: 'error', textKey: 'acct.step3.clearError.unavailable' });
        return;
      }
      setBusy('credentials-clear');
      setCredNotice(null);
      WHOOP_API.clearCredentials().then(
        function onCleared(envelope) {
          if (!aliveRef.current) return;
          setBusy(null);
          if (envelope && envelope.ok === true && envelope.status) {
            applyStatus(envelope.status);
            credEditRef.current = false;
            setCredEdit(false);
            syncCredentialFields(envelope.status, true);
            setCredNotice({ kind: 'success', textKey: 'acct.step3.cleared' });
            return;
          }
          setCredNotice({
            kind: 'error',
            operation: 'clear',
            code: (envelope && envelope.code) || 'network',
            message: (envelope && envelope.message) || '',
          });
        },
        function onClearFailed() {
          if (!aliveRef.current) return;
          setBusy(null);
          setCredNotice({ kind: 'error', operation: 'clear', code: 'network', message: '' });
        },
      );
    }

    function handleCopyRedirectUri(redirectUri) {
      if (!redirectUri) return;
      function finish(copied) {
        if (!aliveRef.current) return;
        setCopyState(copied ? 'copied' : 'failed');
        if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(function resetCopyState() {
          copyTimerRef.current = null;
          if (aliveRef.current) setCopyState('idle');
        }, COPY_FEEDBACK_MS);
      }
      var clipboard = null;
      try {
        if (typeof navigator !== 'undefined' && navigator && navigator.clipboard) clipboard = navigator.clipboard;
      } catch (error) {
        clipboard = null;
      }
      if (!clipboard || typeof clipboard.writeText !== 'function') {
        finish(false);
        return;
      }
      var result;
      try {
        result = clipboard.writeText(redirectUri);
      } catch (error) {
        finish(false);
        return;
      }
      if (result && typeof result.then === 'function') {
        result.then(
          function copied() {
            finish(true);
          },
          function copyFailed() {
            finish(false);
          },
        );
        return;
      }
      finish(true);
    }

    function handleBind() {
      // The unbound step-4 button is disabled until `canBind`; re-authorizing a
      // connected account still attempts the flow so the Host can explain any
      // missing configuration with a localized error code.
      if (busy || pendingActive) return;
      cancelDisconnectConfirm();
      setBusy('auth');
      setNotice(null);
      if (!WHOOP_API || typeof WHOOP_API.startAuth !== 'function') {
        setBusy(null);
        setNotice({ kind: 'error', source: 'auth', textKey: 'acct.auth_error.unavailable' });
        return;
      }
      WHOOP_API.startAuth().then(
        function onStarted(envelope) {
          if (!aliveRef.current) return;
          setBusy(null);
          if (!envelope || envelope.ok !== true) {
            setNotice({
              kind: 'error',
              source: 'auth',
              code: (envelope && envelope.code) || 'network',
              message: (envelope && envelope.message) || '',
            });
            return;
          }
          var authorizeUrl = typeof envelope.authorizeUrl === 'string' ? envelope.authorizeUrl : '';
          if (!authorizeUrl) {
            setNotice({ kind: 'error', source: 'auth', code: 'bad_response', message: '' });
            return;
          }
          try {
            // `noopener` means some browsers return null even when the tab
            // opened; the waiting panel always offers an <a> fallback.
            window.open(authorizeUrl, '_blank', 'noopener');
          } catch (error) {
            /* popup blocked — the reopen link covers it */
          }
          dismissedPollRef.current = false;
          setPoll({ deadline: Date.now() + POLL_TIMEOUT_MS, url: authorizeUrl });
          setNotice(null);
        },
        function onStartFailed() {
          if (!aliveRef.current) return;
          setBusy(null);
          setNotice({ kind: 'error', source: 'auth', code: 'network', message: '' });
        },
      );
    }

    function handleReauthorize() {
      cancelDisconnectConfirm();
      handleBind();
    }

    function handleDisconnectClick() {
      if (busy) return;
      if (!confirmDisconnect) {
        setConfirmDisconnect(true);
        return;
      }
      cancelDisconnectConfirm();
      if (!WHOOP_API || typeof WHOOP_API.disconnect !== 'function') {
        setNotice({ kind: 'error', source: 'action', code: 'transport', message: '' });
        return;
      }
      setBusy('disconnect');
      setNotice(null);
      WHOOP_API.disconnect().then(
        function onDisconnected(envelope) {
          if (!aliveRef.current) return;
          setBusy(null);
          if (envelope && envelope.ok === true && envelope.status) {
            applyStatus(envelope.status);
            setNotice({ kind: 'success', source: 'action', textKey: 'acct.connected.disconnected' });
            // Re-read the Host status as required by the contract.
            loadStatus({ silent: true });
            return;
          }
          setNotice({
            kind: 'error',
            source: 'action',
            code: (envelope && envelope.code) || 'network',
            message: (envelope && envelope.message) || '',
          });
        },
        function onDisconnectFailed() {
          if (!aliveRef.current) return;
          setBusy(null);
          setNotice({ kind: 'error', source: 'action', code: 'network', message: '' });
        },
      );
    }

    /* ----------------------------------------------------------------*
     * Derived UI state
     * ----------------------------------------------------------------*/

    var configured = configuredOf(status);
    var connected = !!(status && status.connected);
    var pendingActive =
      poll !== null || (!!status && status.pending === true && dismissedPollRef.current !== true);
    var pendingUrl = (poll && poll.url) || (status && typeof status.loginUrl === 'string' ? status.loginUrl : '');
    var lastError = status && status.lastError ? status.lastError : null;
    var profile = status && status.profile ? status.profile : null;
    var profileName = nameOf(profile);
    var profileEmail = emailOf(profile);
    var clientIdValue = clientIdOf(configured);
    var secretSaved = secretSavedOf(configured);
    var redirectUri = redirectUriOf(configured);
    var canBind = !!(clientIdValue && secretSaved && redirectUri);

    var expiresAt = status && typeof status.expiresAt === 'string' ? status.expiresAt : '';
    var expiresText = '';
    var expired = false;
    if (connected && expiresAt) {
      var expiresTs = Date.parse(expiresAt);
      expired = Number.isFinite(expiresTs) && expiresTs < Date.now();
      var expiresDate = formatDate(expiresAt);
      var expiresTime = formatTime(expiresAt);
      expiresText = t('acct.connected.expires', {
        time: expiresTime ? expiresDate + ' ' + expiresTime : expiresDate,
      });
    }

    var bindBlockers = [];
    if (!clientIdValue) bindBlockers.push('acct.step4.needClientId');
    if (!secretSaved) bindBlockers.push('acct.step4.needSecret');
    if (!redirectUri) bindBlockers.push('acct.step4.needRedirect');

    /* ----------------------------------------------------------------*
     * Render helpers
     * ----------------------------------------------------------------*/

    function renderNotice(nextNotice) {
      if (!nextNotice) return null;
      var kind = nextNotice.kind === 'success' ? 'success' : nextNotice.kind === 'warn' ? 'warn' : 'error';
      var text = nextNotice.textKey
        ? t(nextNotice.textKey)
        : nextNotice.source === 'auth'
          ? authErrorText(nextNotice.code)
          : statusErrorText(nextNotice.code);
      var detail =
        nextNotice.code || nextNotice.message ? codeDetail(nextNotice.code, nextNotice.message) : '';
      return h(
        'div',
        { className: 'wps-notice wps-notice--' + kind, role: kind === 'error' ? 'alert' : 'status' },
        h(
          'div',
          { className: 'wps-notice-main' },
          h('p', { className: 'wps-notice-text' }, text),
          detail ? h(RawDetail, { message: detail }) : null,
        ),
      );
    }

    function renderCredentialNotice(nextNotice) {
      if (!nextNotice) return null;
      var kind = nextNotice.kind === 'success' ? 'success' : 'error';
      var text = nextNotice.textKey
        ? t(nextNotice.textKey)
        : nextNotice.operation === 'clear'
          ? clearCredentialErrorText(nextNotice.code)
          : saveCredentialErrorText(nextNotice.code);
      var detail =
        nextNotice.code || nextNotice.message ? codeDetail(nextNotice.code, nextNotice.message) : '';
      return h(
        'div',
        { className: 'wps-notice wps-notice--' + kind, role: kind === 'error' ? 'alert' : 'status' },
        h(
          'div',
          { className: 'wps-notice-main' },
          h('p', { className: 'wps-notice-text' }, text),
          detail ? h(RawDetail, { message: detail }) : null,
        ),
      );
    }

    function renderLastError() {
      if (!lastError) return null;
      var detail = codeDetail(lastError.code, lastError.message);
      return h(
        'div',
        { className: 'wps-inline-error', role: 'alert' },
        h('p', { className: 'wps-inline-error-text' }, statusErrorText(lastError.code)),
        detail ? h(RawDetail, { message: detail }) : null,
      );
    }

    function renderLoading() {
      return h(
        'div',
        { className: 'wps-loading', role: 'status', 'aria-live': 'polite' },
        h('span', { className: 'wps-sr-only' }, t('acct.loading')),
        h(
          'div',
          { className: 'wps-card wps-skeleton-card', 'aria-hidden': 'true' },
          h('span', { className: 'wps-skel wps-skel--title' }),
          h('span', { className: 'wps-skel wps-skel--line' }),
          h('span', { className: 'wps-skel wps-skel--line wps-skel--short' }),
        ),
        h(
          'div',
          { className: 'wps-card wps-skeleton-card', 'aria-hidden': 'true' },
          h('span', { className: 'wps-skel wps-skel--line' }),
          h('span', { className: 'wps-skel wps-skel--line wps-skel--short' }),
        ),
      );
    }

    function renderLoadError() {
      var code = loadError && loadError.code;
      var detail = codeDetail(code, loadError && loadError.message);
      return h(
        'section',
        { className: 'wps-card wps-card--error', role: 'alert' },
        h('p', { className: 'wps-card-title' }, statusErrorText(code)),
        detail ? h(RawDetail, { message: detail }) : null,
        h(
          'div',
          { className: 'wps-step-actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'wps-btn wps-btn--primary',
              onClick: function reload() {
                loadStatus();
              },
            },
            t('acct.action.retry'),
          ),
        ),
      );
    }

    function renderPendingPanel() {
      return h(
        'div',
        { className: 'wps-pending' },
        h(
          'p',
          { className: 'wps-pending-title', role: 'status' },
          h(WhoopSpinner, null),
          h('span', null, t('acct.step4.waiting')),
        ),
        h('p', { className: 'wps-hint' }, t('acct.step4.waitingHint')),
        pendingUrl
          ? h(
              'div',
              { className: 'wps-step-actions' },
              h(
                'a',
                {
                  className: 'wps-btn wps-btn--primary',
                  href: pendingUrl,
                  target: '_blank',
                  rel: 'noreferrer',
                },
                t('acct.step4.reopen'),
              ),
            )
          : null,
      );
    }

    function renderStepOne() {
      return h(
        'section',
        { className: 'wps-card wps-step', 'aria-labelledby': 'wps-step1-title' },
        stepHead(1, 'acct.step1.title'),
        h(
          'ol',
          { className: 'wps-step-list' },
          h('li', null, t('acct.step1.item1')),
          h('li', null, t('acct.step1.item2')),
        ),
        h(
          'div',
          { className: 'wps-step-actions' },
          h(
            'a',
            {
              className: 'wps-btn wps-btn--primary',
              href: DEVELOPER_DASHBOARD_URL,
              target: '_blank',
              rel: 'noreferrer',
            },
            t('acct.step1.open'),
          ),
        ),
      );
    }

    function renderStepTwo() {
      var copyLabel =
        copyState === 'copied'
          ? t('acct.step2.copied')
          : copyState === 'failed'
            ? t('acct.step2.copyFailed')
            : t('acct.step2.copy');
      return h(
        'section',
        { className: 'wps-card wps-step', 'aria-labelledby': 'wps-step2-title' },
        stepHead(2, 'acct.step2.title'),
        h(
          'ol',
          { className: 'wps-step-list' },
          h('li', null, t('acct.step2.item1')),
          h('li', null, t('acct.step2.item2')),
          h('li', null, t('acct.step2.item3')),
          h('li', null, t('acct.step2.item4')),
        ),
        h(
          'div',
          { className: 'wps-redirect' },
          h('p', { className: 'wps-redirect-label' }, t('acct.step2.redirectLabel')),
          h(
            'div',
            { className: 'wps-copy-row' },
            h('code', { className: 'wps-redirect-value' }, redirectUri || '—'),
            h(
              'button',
              {
                type: 'button',
                className: 'wps-btn wps-btn--ghost wps-btn--small',
                disabled: !redirectUri,
                onClick: function copyRedirect() {
                  handleCopyRedirectUri(redirectUri);
                },
              },
              copyLabel,
            ),
          ),
          h(
            'span',
            { className: 'wps-sr-only', role: 'status', 'aria-live': 'polite' },
            copyState === 'idle' ? '' : copyLabel,
          ),
          !redirectUri ? h('p', { className: 'wps-hint wps-hint--warn' }, t('acct.step2.redirectMissing')) : null,
          copyState === 'failed' && redirectUri
            ? h('p', { className: 'wps-hint wps-hint--warn' }, t('acct.step2.copyFailedHint'))
            : null,
        ),
      );
    }

    function renderStepThree() {
      var validationError = !!(credNotice && credNotice.validation);
      var hintId = 'wps-cred-hint';
      var editableClass = credEdit ? ' wps-input--editing' : '';
      return h(
        'section',
        { className: 'wps-card wps-step', 'aria-labelledby': 'wps-step3-title' },
        stepHead(3, 'acct.step3.title'),
        h(
          'ol',
          { className: 'wps-step-list' },
          h('li', null, t('acct.step3.item1')),
          h('li', null, t('acct.step3.item2')),
        ),
        h(
          'div',
          { className: 'wps-cred-grid' },
          h(
            'div',
            { className: 'wps-field' },
            h('label', { className: 'wps-label', htmlFor: 'wps-client-id' }, t('acct.step3.clientId')),
            h('input', {
              id: 'wps-client-id',
              className: 'wps-input' + editableClass,
              type: 'text',
              value: credId,
              readOnly: !credEdit,
              autoComplete: 'off',
              spellCheck: false,
              placeholder: t('acct.step3.clientIdPlaceholder'),
              'aria-invalid': validationError ? 'true' : 'false',
              'aria-describedby': hintId,
              onDoubleClick: handleOpenCredentialEditor,
              onChange: function clientIdChanged(event) {
                setCredId(event && event.target ? event.target.value : '');
                handleCredentialFieldsChanged();
              },
            }),
          ),
          h(
            'div',
            { className: 'wps-field' },
            h('label', { className: 'wps-label', htmlFor: 'wps-client-secret' }, t('acct.step3.clientSecret')),
            h('input', {
              id: 'wps-client-secret',
              className: 'wps-input' + editableClass,
              type: 'password',
              value: credSecret,
              readOnly: !credEdit,
              autoComplete: 'new-password',
              spellCheck: false,
              placeholder: secretSaved
                ? t('acct.step3.secretSavedPlaceholder')
                : t('acct.step3.secretPlaceholder'),
              'aria-invalid': validationError ? 'true' : 'false',
              'aria-describedby': hintId,
              onDoubleClick: handleOpenCredentialEditor,
              onChange: function clientSecretChanged(event) {
                setCredSecret(event && event.target ? event.target.value : '');
                handleCredentialFieldsChanged();
              },
            }),
          ),
        ),
        h(
          'div',
          { className: 'wps-cred-foot' },
          h('p', { className: 'wps-hint', id: hintId }, credEdit ? t('acct.step3.security') : t('acct.step3.dblclickHint')),
          !credEdit
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'wps-btn wps-btn--ghost wps-btn--small',
                  onClick: handleOpenCredentialEditor,
                },
                t('acct.step3.edit'),
              )
            : null,
        ),
        credEdit
          ? h(
              'div',
              { className: 'wps-step-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'wps-btn wps-btn--primary',
                  disabled: busy !== null,
                  'aria-busy': busy === 'credentials-save' ? 'true' : undefined,
                  onClick: handleSaveCredentials,
                },
                busy === 'credentials-save'
                  ? busyContent(t('acct.step3.saving'))
                  : t('acct.step3.save'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'wps-btn wps-btn--ghost',
                  disabled: busy !== null,
                  'aria-busy': busy === 'credentials-clear' ? 'true' : undefined,
                  onClick: handleClearCredentials,
                },
                busy === 'credentials-clear'
                  ? busyContent(t('acct.step3.clearing'))
                  : t('acct.step3.clear'),
              ),
            )
          : null,
        credNotice ? renderCredentialNotice(credNotice) : null,
      );
    }

    function renderStepFour() {
      var disabled = !canBind || busy !== null || pendingActive;
      return h(
        'section',
        { className: 'wps-card wps-step', 'aria-labelledby': 'wps-step4-title' },
        stepHead(4, 'acct.step4.title'),
        h('p', { className: 'wps-step-text' }, t('acct.step4.description')),
        pendingActive
          ? renderPendingPanel()
          : h(
              'div',
              { className: 'wps-step-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'wps-btn wps-btn--primary',
                  disabled: disabled,
                  'aria-busy': busy === 'auth' ? 'true' : undefined,
                  onClick: handleBind,
                },
                busy === 'auth' ? busyContent(t('acct.step4.binding')) : t('acct.step4.bind'),
              ),
            ),
        !pendingActive && bindBlockers.length
          ? h(
              'ul',
              { className: 'wps-hint-list' },
              bindBlockers.map(function blocker(key) {
                return h('li', { key: key }, t(key));
              }),
            )
          : null,
        !pendingActive ? h('p', { className: 'wps-hint' }, t('acct.step4.certHint')) : null,
        notice ? renderNotice(notice) : null,
        !pendingActive && !notice ? renderLastError() : null,
      );
    }

    function renderSteps() {
      return h(React.Fragment, null, renderStepOne(), renderStepTwo(), renderStepThree(), renderStepFour());
    }

    function renderConnected() {
      return h(
        React.Fragment,
        null,
        h(
          'section',
          { className: 'wps-card wps-account', 'aria-labelledby': 'wps-account-title' },
          h(
            'div',
            { className: 'wps-status-head' },
            h('span', { className: 'wps-dot wps-dot--success', 'aria-hidden': 'true' }),
            h('h3', { className: 'wps-card-title', id: 'wps-account-title' }, t('acct.connected.title')),
          ),
          h(
            'div',
            { className: 'wps-profile' },
            h('p', { className: 'wps-profile-name' }, profileName || t('acct.connected.noProfile')),
            profileEmail ? h('p', { className: 'wps-profile-email' }, profileEmail) : null,
          ),
          expiresText
            ? h(
                'ul',
                { className: 'wps-meta' },
                h('li', null, expiresText),
                expired ? h('li', { className: 'wps-meta-warn' }, t('acct.connected.expired')) : null,
              )
            : null,
          pendingActive ? renderPendingPanel() : null,
          notice ? renderNotice(notice) : null,
          pendingActive ? null : lastError && !notice ? renderLastError() : null,
          pendingActive
            ? null
            : h(
                'div',
                { className: 'wps-step-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'wps-btn wps-btn--primary',
                    disabled: busy !== null,
                    'aria-busy': busy === 'auth' ? 'true' : undefined,
                    onClick: handleReauthorize,
                  },
                  busy === 'auth'
                    ? busyContent(t('acct.connected.reauthorizing'))
                    : t('acct.connected.reauthorize'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'wps-btn wps-btn--danger',
                    disabled: busy !== null,
                    'aria-busy': busy === 'disconnect' ? 'true' : undefined,
                    onClick: handleDisconnectClick,
                  },
                  busy === 'disconnect'
                    ? busyContent(t('acct.connected.disconnecting'))
                    : confirmDisconnect
                      ? t('acct.connected.confirmDisconnect')
                      : t('acct.connected.disconnect'),
                ),
              ),
        ),
      );
    }

    /* ----------------------------------------------------------------*
     * Page
     * ----------------------------------------------------------------*/

    return h(
      'section',
      {
        className: 'wps-root',
        'aria-labelledby': 'wps-acct-title',
        'data-wps-lang': lang || 'zh',
      },
      h(
        'header',
        { className: 'wps-head' },
        h('h2', { className: 'wps-title', id: 'wps-acct-title' }, t('acct.title')),
        h(
          'p',
          { className: 'wps-desc' },
          t(connected ? 'acct.description.connected' : 'acct.description.unbound'),
        ),
      ),
      phase === 'loading' ? renderLoading() : null,
      phase === 'error' ? renderLoadError() : null,
      phase === 'ready' ? (connected ? renderConnected() : renderSteps()) : null,
    );
  };
})();
