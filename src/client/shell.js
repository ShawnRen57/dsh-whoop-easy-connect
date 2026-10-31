/**
 * dsh-whoop-easy-connect — browser shell.
 *
 * Owns the plugin activation: mounts the package-private Remote contribution,
 * injects the stylesheet, and registers the three UI surfaces:
 *
 *   sidebar.panellist / id "whoop-easy-connect"  → sidebar entry + WHOOP icon
 *   main             / key "whoop-easy-connect"  → the personal health dashboard
 *   settings.section / id "whoop-account"  → the WHOOP account binding page
 *
 * The dashboard and settings components are provided by the sibling fragments
 * as `WHOOP.Dashboard` and `WHOOP.SettingsSection`.
 */

/* ------------------------------------------------------------------*
 * Package-private Remote contribution
 * ------------------------------------------------------------------*/

var WHOOP_REQUEST_CODEC = {
  mode: 'strict',
  typeSymbol: 'dsh-whoop-easy-connect#WhoopRequest',
  create: function createRequestCodec() {
    return {
      parse: function parseRequest(value) {
        return value;
      },
    };
  },
};

var WHOOP_RESULT_CODEC = {
  mode: 'strict',
  typeSymbol: 'dsh-whoop-easy-connect#WhoopResponse',
  create: function createResultCodec() {
    return {
      parse: function parseResult(value) {
        return value;
      },
    };
  },
};

var WHOOP_REMOTE_METHOD = {
  id: 'dsh-whoop-easy-connect#whoop/request',
  service: 'whoop',
  namespace: 'whoop',
  method: 'request',
  invocation: { kind: 'direct' },
  parameters: [
    {
      name: 'request',
      wire: 'request',
      source: 'json',
      codec: WHOOP_REQUEST_CODEC,
      strictCodec: WHOOP_REQUEST_CODEC,
    },
  ],
  result: WHOOP_RESULT_CODEC,
};

var WHOOP_REMOTE_CONTRIBUTION = {
  package: 'dsh-whoop-easy-connect',
  methods: { 'whoop/request': WHOOP_REMOTE_METHOD },
  descriptors: [WHOOP_REMOTE_METHOD],
};

/* ------------------------------------------------------------------*
 * Render-error boundary: a crashing component must never blank a host slot.
 * ------------------------------------------------------------------*/

var WHOOP_ErrorBoundary = (function makeErrorBoundary() {
  function WhoopErrorBoundary(props) {
    React.Component.call(this, props);
    this.state = { error: null };
  }
  WhoopErrorBoundary.prototype = Object.create(React.Component.prototype);
  WhoopErrorBoundary.prototype.constructor = WhoopErrorBoundary;

  WhoopErrorBoundary.getDerivedStateFromError = function getDerivedStateFromError() {
    return { error: true };
  };

  WhoopErrorBoundary.prototype.render = function render() {
    if (this.state.error) {
      return h(
        'div',
        {
          role: 'alert',
          style: {
            margin: '48px auto',
            maxWidth: '460px',
            padding: '20px 24px',
            borderRadius: '16px',
            border: '1px solid var(--dsw-alias-border-l1, #e7e9ee)',
            background: 'var(--dsw-alias-bg-layer-1, #ffffff)',
            color: 'var(--dsw-alias-label-primary, #1d2433)',
            font: 'inherit',
            fontSize: '14px',
            lineHeight: 1.6,
          },
        },
        h('strong', { style: { display: 'block', marginBottom: '6px' } }, 'WHOOP健康'),
        '看板加载失败，请刷新页面重试。 / The WHOOP view failed to render. Please reload the page.',
      );
    }
    return this.props.children;
  };

  return WhoopErrorBoundary;
})();

function withWhoopBoundary(Component) {
  return function WhoopBoundedComponent(props) {
    return h(WHOOP_ErrorBoundary, null, h(Component, props));
  };
}

/* ------------------------------------------------------------------*
 * Sidebar icon — same 16/18px line-icon style as the shipped panel rows,
 * WHOOP-flavoured: a sensor ring with an ECG pulse.
 * ------------------------------------------------------------------*/

function WhoopPanelIcon(props) {
  var size = (props && props.size) || 18;
  var active = !!(props && props.active);
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: active ? 1.9 : 1.8,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
    },
    h('circle', { cx: 12, cy: 12, r: 9.1, strokeOpacity: active ? 1 : 0.82 }),
    h('path', { d: 'M5.4 12.1h3.2l1.55-3.4 2.8 6.9 1.7-3.5h3.9' }),
  );
}

/* ------------------------------------------------------------------*
 * WHOOP_UI — settings navigation + account-state bridge for the UI fragments.
 *
 * DSH does not expose a public "open settings section" API. The plugin invokes
 * the registered `settings.open` command through the shortcuts registry, and
 * WHOOP账户 is registered first in the settings nav while no account is bound,
 * so opening Settings lands on it.
 * ------------------------------------------------------------------*/

var WHOOP_UI = {
  _ctx: null,
  _connected: null,
  _listeners: [],

  attach: function attach(ctx) {
    this._ctx = ctx;
  },

  getConnected: function getConnected() {
    return this._connected;
  },

  setConnected: function setConnected(connected) {
    var value = connected === true;
    var changed = this._connected !== value;
    this._connected = value;
    if (!changed) return;
    var listeners = this._listeners.slice();
    for (var index = 0; index < listeners.length; index += 1) {
      try {
        listeners[index](value);
      } catch (error) {
        /* one listener must not break the others */
      }
    }
  },

  subscribeConnected: function subscribeConnected(listener) {
    var self = this;
    this._listeners.push(listener);
    var removed = false;
    return function unsubscribe() {
      if (removed) return;
      removed = true;
      var index = self._listeners.indexOf(listener);
      if (index >= 0) self._listeners.splice(index, 1);
    };
  },

  /** Open the DSH Settings panel. Returns false when its command is unavailable. */
  openSettings: function openSettings() {
    return openSettingsThroughShortcut(this._ctx);
  },
};

/** Best-effort physical key label for a `KeyboardEvent.code`. */
function keyLabelFromCode(code) {
  var labels = {
    Comma: ',',
    Period: '.',
    Slash: '/',
    Backslash: '\\',
    Backquote: '`',
    Semicolon: ';',
    Quote: "'",
    BracketLeft: '[',
    BracketRight: ']',
    Minus: '-',
    Equal: '=',
    Space: ' ',
    Escape: 'Escape',
    Enter: 'Enter',
    Tab: 'Tab',
  };
  if (labels[code] !== undefined) return labels[code];
  if (code.indexOf('Key') === 0) return code.slice(3).toLowerCase();
  if (code.indexOf('Digit') === 0) return code.slice(5);
  return code;
}

/**
 * Invoke the DSH `settings.open` command.
 *
 * The settings panel is owned by the shell and exposes no public service. The
 * command registry does: `ctx.shortcuts.registry.dispatch` takes a normalized
 * gesture, so the plugin can run the exact registered command (including a
 * user-customized binding and the Desktop native-keyboard path). A plain DOM
 * keyboard event is the fallback for hosts without the registry.
 */
function openSettingsThroughShortcut(ctx) {
  var gesture = {
    code: 'Comma',
    control: false,
    alt: false,
    shift: false,
    meta: navigator.platform.indexOf('Mac') >= 0,
    repeat: false,
    composing: false,
    defaultPrevented: false,
  };
  try {
    var shortcuts = ctx && typeof ctx.get === 'function' ? ctx.get('shortcuts') : null;
    var registry = shortcuts && shortcuts.registry;
    if (registry && typeof registry.dispatch === 'function' && shortcuts.catalog) {
      var rows = shortcuts.catalog.getSnapshot();
      var row = null;
      if (Array.isArray(rows)) {
        for (var index = 0; index < rows.length; index += 1) {
          if (rows[index] && rows[index].id === 'settings.open') {
            row = rows[index];
            break;
          }
        }
      }
      var binding = row && row.binding;
      if (binding && typeof binding.code === 'string') {
        var modifiers = Array.isArray(binding.modifiers) ? binding.modifiers : [];
        gesture = {
          code: binding.code,
          control: modifiers.indexOf('control') >= 0,
          alt: modifiers.indexOf('alt') >= 0,
          shift: modifiers.indexOf('shift') >= 0,
          meta: modifiers.indexOf('meta') >= 0,
          repeat: false,
          composing: false,
          defaultPrevented: false,
        };
      }
      var result = registry.dispatch(
        gesture,
        { region: 'page', modal: null, target: null },
        function consume() {},
      );
      if (result && result.status === 'handled') return true;
      if (result && result.status === 'blocked') return false;
    }
  } catch (error) {
    /* fall through to the DOM route */
  }
  try {
    var event = new KeyboardEvent('keydown', {
      code: gesture.code,
      key: keyLabelFromCode(gesture.code),
      metaKey: gesture.meta,
      ctrlKey: gesture.control,
      altKey: gesture.alt,
      shiftKey: gesture.shift,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    return true;
  } catch (error) {
    return false;
  }
}

/* ------------------------------------------------------------------*
 * Surface registration
 * ------------------------------------------------------------------*/

function mountSurface(ctx) {
  // Hand the RPC facade a context that actually injects the `remote.whoop`
  // namespace: in DSH's Cordis proxy, reading a service this context has not
  // injected throws instead of returning undefined. The surface plugin injects
  // it, the root plugin context only injects `remote`.
  WHOOP_API.attach(ctx);

  // One stylesheet for the whole plugin, removed with the surface.
  var style = document.createElement('style');
  style.setAttribute('data-dsh-plugin', 'dsh-whoop-easy-connect');
  style.textContent = WHOOP_CSS + '\n' + WHOOP_SETTINGS_CSS;
  document.head.appendChild(style);
  ctx.effect(function cleanupStyles() {
    return function removeStyles() {
      style.remove();
    };
  }, 'whoop-easy-connect: stylesheet');

  WHOOP_UI.attach(ctx);

  ctx.slots.inject('sidebar.panellist', function registerPanel() {
    return ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: 'whoop-easy-connect',
        order: 5,
        label: 'WHOOP健康',
      },
      WhoopPanelIcon,
    );
  });

  ctx.slots.inject('main', function registerDashboard() {
    return ctx.slots.register(
      {
        name: 'main',
        key: 'whoop-easy-connect',
      },
      withWhoopBoundary(WHOOP.Dashboard),
    );
  });

  ctx.slots.inject('settings.section', function registerSettings() {
    var currentDispose = null;
    var unsubscribe = null;

    function register(connected) {
      try {
        if (currentDispose) currentDispose();
      } catch (error) {
        /* stale registration */
      }
      currentDispose = null;
      try {
        currentDispose = ctx.slots.register(
          {
            name: 'settings.section',
            id: 'whoop-account',
            order: connected === false ? -100 : -9,
            label: 'WHOOP账户',
          },
          withWhoopBoundary(WHOOP.SettingsSection),
        );
      } catch (error) {
        currentDispose = null;
      }
    }

    register(WHOOP_UI.getConnected());
    unsubscribe = WHOOP_UI.subscribeConnected(register);
    return function disposeSettingsSection() {
      try {
        if (unsubscribe) unsubscribe();
      } catch (error) {
        /* already disposed */
      }
      try {
        if (currentDispose) currentDispose();
      } catch (error) {
        /* already disposed */
      }
    };
  });
}

/* ------------------------------------------------------------------*
 * Plugin exports
 * ------------------------------------------------------------------*/

var inject = ['slots', 'locale', 'remote'];

async function apply(ctx) {
  var disposeRemote = await ctx.remote.$mount(WHOOP_REMOTE_CONTRIBUTION);
  ctx.effect(function ownRemoteContribution() {
    return disposeRemote;
  }, 'whoop-easy-connect: remote contribution');

  ctx.plugin({
    name: 'whoop-easy-connect:surface',
    inject: ['slots', 'locale', 'remote', 'remote.whoop'],
    apply: mountSurface,
  });
}

module.exports.inject = inject;
module.exports.apply = apply;

/**
 * Test-only surface (used by the Lead's server-render smoke test; harmless in
 * production because the loader only consumes apply/inject).
 */
module.exports.__test = {
  Dashboard: function () {
    return WHOOP.Dashboard;
  },
  SettingsSection: function () {
    return WHOOP.SettingsSection;
  },
  language: function () {
    return WHOOP_LANG;
  },
  i18n: function () {
    return WHOOP_I18N;
  },
  api: function () {
    return WHOOP_API;
  },
  remoteContribution: function () {
    return WHOOP_REMOTE_CONTRIBUTION;
  },
  whoopUI: function () {
    return WHOOP_UI;
  },
  panelIcon: function () {
    return WhoopPanelIcon;
  },
  boundedDashboard: function () {
    return withWhoopBoundary(WHOOP.Dashboard);
  },
  boundedSettings: function () {
    return withWhoopBoundary(WHOOP.SettingsSection);
  },
};
