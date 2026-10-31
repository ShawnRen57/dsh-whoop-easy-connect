// dashboard.js — the WHOOP health dashboard page (main panel).
// Loaded inside the shared client factory scope (no imports/exports/JSX).
// `React` and `h` (= React.createElement) are available; data comes only from
// WHOOP_API (never fetch), copy only from WHOOP_T, formatting only from WHOOP_FMT.
//
// Exports: WHOOP.Dashboard — a zero-required-prop page component that loads
// WHOOP_API.snapshot({ force: true }) once on mount. Unbound states
// (auth_required / not_configured / token_expired / snapshot.mode === 'demo')
// render ONLY the minimal "connect WHOOP account" fallback with a settings CTA
// (WHOOP_UI.openSettings, see docs/UX-REDESIGN.md §四); connected snapshots
// render the full page (sticky header + language toggle + refresh + hero rings +
// today's metrics + trend charts + sleep detail + workouts + body/profile) and
// survive partial data (null -> '—', never NaN or fabricated zeros). Real
// transport failures keep a localized error + retry state.
//
// Test hook (used by the Lead's SSR smoke test only): props.initialSnapshot —
// when it is a snapshot-shaped object, render it immediately and skip the mount
// fetch. Production callers pass no props.

WHOOP.Dashboard = (function () {
  var F = WHOOP_FMT;
  var CH = WHOOP_CHARTS;
  var T = WHOOP_T;

  var RECOVERY_GOOD = 67;
  var RECOVERY_FAIR = 34;
  var STRAIN_MAX = 21;
  var METRIC_SPARK_DAYS = 14;

  var ACCENT = {
    recovery: 'var(--wh-recovery, #16a34a)',
    strain: 'var(--wh-strain, #0ea5b7)',
    sleep: 'var(--wh-sleep, #6366f1)',
    sleepSoft: 'var(--wh-sleep-soft, #a5b4fc)',
    warn: 'var(--wh-warn, #e0a008)',
    danger: 'var(--wh-danger, #ef4444)',
    brand: 'var(--dsw-alias-brand-primary, #4d6bfe)',
    muted: 'var(--wh-muted, #94a3b8)'
  };

  var STAGE_COLORS = {
    light: 'var(--wh-stage-light, #93c5fd)',
    deep: 'var(--wh-stage-deep, #4338ca)',
    rem: 'var(--wh-stage-rem, #a78bfa)',
    awake: 'var(--wh-stage-awake, #fbbf24)',
    noData: 'var(--wh-stage-nodata, #cbd5e1)'
  };

  // -------------------------------------------------------------------------
  // Small utilities
  // -------------------------------------------------------------------------
  function isNum(value) {
    return typeof value === 'number' && isFinite(value);
  }

  function toNum(value) {
    return isNum(value) ? value : null;
  }

  function el(tag, cls, props) {
    var rest = Array.prototype.slice.call(arguments, 3);
    var next = {};
    var key;
    if (props) {
      for (key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) next[key] = props[key];
      }
    }
    if (cls) next.className = cls;
    return h.apply(null, [tag, next].concat(rest));
  }

  function div(cls, props) {
    return el.apply(null, ['div', cls, props].concat(Array.prototype.slice.call(arguments, 2)));
  }

  function span(cls, props) {
    return el.apply(null, ['span', cls, props].concat(Array.prototype.slice.call(arguments, 2)));
  }

  function para(cls, props) {
    return el.apply(null, ['p', cls, props].concat(Array.prototype.slice.call(arguments, 2)));
  }

  function dash() {
    return F.dash;
  }

  function anyNumber(values) {
    if (!Array.isArray(values)) return false;
    for (var i = 0; i < values.length; i += 1) {
      if (isNum(values[i])) return true;
    }
    return false;
  }

  function avgNumber(values) {
    if (!Array.isArray(values)) return null;
    var sum = 0;
    var count = 0;
    for (var i = 0; i < values.length; i += 1) {
      if (!isNum(values[i])) continue;
      sum += values[i];
      count += 1;
    }
    return count ? sum / count : null;
  }

  function todayOf(snapshot) {
    return (snapshot && snapshot.today) || {};
  }

  function daysOf(snapshot) {
    return snapshot && Array.isArray(snapshot.days) ? snapshot.days.filter(Boolean) : [];
  }

  // Reads `section.key` from a DayEntry, tolerating null entries.
  function dayPathValue(day, path) {
    if (!day) return null;
    var parts = String(path).split('.');
    var node = day;
    for (var i = 0; i < parts.length; i += 1) {
      if (node === null || node === undefined) return null;
      node = node[parts[i]];
    }
    return toNum(node);
  }

  function seriesFrom(days, path) {
    return days.map(function (day) {
      return dayPathValue(day, path);
    });
  }

  function recoveryColor(score) {
    if (!isNum(score)) return ACCENT.muted;
    if (score >= RECOVERY_GOOD) return ACCENT.recovery;
    if (score >= RECOVERY_FAIR) return ACCENT.warn;
    return ACCENT.danger;
  }

  function recoveryVerdict(score) {
    if (!isNum(score)) return T('hero.noData');
    if (score >= RECOVERY_GOOD) return T('hero.recoveryGood');
    if (score >= RECOVERY_FAIR) return T('hero.recoveryFair');
    return T('hero.recoveryLow');
  }

  function strainVerdict(strain) {
    if (!isNum(strain)) return T('hero.noData');
    if (strain < 8) return T('hero.strainLight');
    if (strain < 14) return T('hero.strainModerate');
    return T('hero.strainHigh');
  }

  function sleepVerdict(performance) {
    if (!isNum(performance)) return T('hero.noData');
    if (performance >= 85) return T('hero.sleepGreat');
    if (performance >= 70) return T('hero.sleepOk');
    return T('hero.sleepLow');
  }

  function rangeLabelFor(range) {
    if (range === 14) return T('trends.range14');
    if (range === 30) return T('trends.range30');
    return T('trends.range7');
  }

  function chartAria(title, range) {
    return T('chart.aria', { title: title, range: rangeLabelFor(range) });
  }

  function avgLabel(values, formatter) {
    var average = avgNumber(values);
    if (average === null) return null;
    return T('trends.avg', { value: formatter(average) });
  }

  function isSnapshotShape(value) {
    return (
      !!value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value.mode !== undefined || value.today !== undefined || Array.isArray(value.days))
    );
  }

  // Result codes that mean "no WHOOP account is bound" rather than a real
  // transport failure (docs/UX-REDESIGN.md §四). A demo snapshot counts as
  // unbound too — the fallback never shows demo data or a demo badge.
  var UNBOUND_CODES = { auth_required: true, not_configured: true, token_expired: true };

  function isUnboundSnapshot(snapshot) {
    return !!(snapshot && snapshot.mode === 'demo');
  }

  function isUnboundState(state) {
    if (isUnboundSnapshot(state.snapshot)) return true;
    return !!(state.error && UNBOUND_CODES[state.error.code] === true);
  }

  // WHOOP_UI is provided by the shell (docs/UX-REDESIGN.md §二).
  // Shell may be missing in isolation (SSR/smoke tests) or not attached yet, so
  // every access is guarded and never throws into React.
  function uiSafe() {
    try {
      return typeof WHOOP_UI !== 'undefined' && WHOOP_UI ? WHOOP_UI : null;
    } catch (err) {
      return null;
    }
  }

  function uiSetConnected(connected) {
    var ui = uiSafe();
    if (!ui || typeof ui.setConnected !== 'function') return;
    try {
      ui.setConnected(!!connected);
    } catch (err) {
      // The shell owns the settings-nav ordering; a failure must not break the page.
    }
  }

  function uiOpenSettings() {
    var ui = uiSafe();
    if (!ui || typeof ui.openSettings !== 'function') return false;
    try {
      return ui.openSettings() !== false;
    } catch (err) {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Inline SVGs: UI glyphs + sport artwork (emoji-free)
  // -------------------------------------------------------------------------
  var UI_GLYPHS = {
    refresh: ['M16.4 10a6.4 6.4 0 1 1-1.88-4.53', 'M16.6 2.6v3.6h-3.6'],
    alert: ['M10 3.2 17.6 16.8H2.4L10 3.2Z', 'M10 8.2v3.6', 'M10 14.2h.01'],
    info: ['M10 17.6a7.6 7.6 0 1 0 0-15.2 7.6 7.6 0 0 0 0 15.2Z', 'M10 9.2v4', 'M10 6.4h.01'],
    user: ['M10 9.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z', 'M3.8 17.2c0-3.1 2.8-5 6.2-5s6.2 1.9 6.2 5'],
    activity: ['M2.5 10h4l2.2-5.4 3 10.8 2.1-5.4h4.7']
  };

  var SPORT_GLYPHS = {
    run: ['M13.4 4.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z', 'M11.6 6.6 8.6 9.9l3.3 2.2-1 4.6', 'M12.7 8 16 9.6l1.9-.8', 'M9.4 12.6 6.7 15.6'],
    bike: ['M5.2 16.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z', 'M14.8 16.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z', 'M5.2 13.8 9 6.6h3.4l2.4 7.2', 'M8.2 6.6h4.4'],
    swim: ['M3 11.6c1.4-1.4 2.6-1.4 4 0s2.6 1.4 4 0 2.6-1.4 4 0', 'M3 15c1.4-1.4 2.6-1.4 4 0s2.6 1.4 4 0 2.6-1.4 4 0', 'M12.8 7.4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
    strength: ['M3 10h14', 'M5.2 6.8v6.4', 'M14.8 6.8v6.4', 'M2 8.4v3.2', 'M18 8.4v3.2'],
    hiit: ['M11.4 2.6 4.8 11h4.4l-1 6.4L15.2 9h-4.4l.6-6.4Z'],
    yoga: ['M10 6.6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M10 7.6v3.6', 'M6.2 10.4 10 12l3.8-1.6', 'M5.6 16.4c1.6-1.6 7.2-1.6 8.8 0'],
    row: ['M3 14.2h14l-2.2 3H5.2l-2.2-3Z', 'M6.4 11.4 10 4.6l3.6 6.8', 'M10 11.4v2.8'],
    walk: ['M12.8 4.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M11.4 6.4 9.6 10l2.2 1.6-.8 4.6', 'M12.4 8.2l2.6 1.2'],
    hike: ['M2.6 16.4 8 6.6l3 4.8 2-2.8 4.4 7.8H2.6Z', 'M2.6 16.4h14.8'],
    ball: ['M10 17.6a7.6 7.6 0 1 0 0-15.2 7.6 7.6 0 0 0 0 15.2Z', 'M2.8 8.4h14.4', 'M2.8 11.6h14.4'],
    racket: ['M13.4 6.6a4.4 4.4 0 1 0-6.2 6.2 4.4 4.4 0 0 0 6.2-6.2Z', 'M8.8 11.2 3.8 16.2', 'M8 9.4l4.4 4.4'],
    box: ['M6.4 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z', 'M13.6 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z', 'M5.4 8.8c.8 1.6 2.6 2.6 4.6 2.6s3.8-1 4.6-2.6'],
    golf: ['M6.6 3v13.4', 'M6.6 3.4 15 6.4l-8.4 3', 'M4 16.6h11.4'],
    elliptical: ['M6.6 5.8a2.2 3 0 1 0 0 4.4 2.2 3 0 0 0 0-4.4Z', 'M13.4 9.8a2.2 3 0 1 0 0 4.4 2.2 3 0 0 0 0-4.4Z', 'M8.6 8.8h5.2', 'M4 16.4h12'],
    activity: ['M2.5 10h4l2.2-5.4 3 10.8 2.1-5.4h4.7']
  };

  function Glyph(props) {
    var paths = UI_GLYPHS[props.name] || UI_GLYPHS.info;
    var size = isNum(props.size) ? props.size : 16;
    return h(
      'svg',
      {
        className: 'wh-glyph' + (props.className ? ' ' + props.className : ''),
        viewBox: '0 0 20 20',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false'
      },
      paths.map(function (path, index) {
        return h('path', { key: index, d: path });
      })
    );
  }

  function SportIcon(props) {
    var paths = SPORT_GLYPHS[props.glyph] || SPORT_GLYPHS.activity;
    return h(
      'svg',
      {
        className: 'wh-sport-icon',
        viewBox: '0 0 20 20',
        width: 20,
        height: 20,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false'
      },
      paths.map(function (path, index) {
        return h('path', { key: index, d: path });
      })
    );
  }

  // -------------------------------------------------------------------------
  // Sport resolution: WHOOP sport ids -> localized label + artwork
  // -------------------------------------------------------------------------
  var SPORT_GROUPS = [
    { key: 'running', glyph: 'run', matches: ['running', 'run', 'jogging', 'trail-running', 'treadmill', 'indoor-running', 'outdoor-running', 'track-running'] },
    { key: 'cycling', glyph: 'bike', matches: ['cycling', 'biking', 'bike', 'spin', 'spinning', 'indoor-cycling', 'mountain-biking', 'road-cycling', 'virtual-cycling'] },
    { key: 'swimming', glyph: 'swim', matches: ['swimming', 'swim', 'open-water-swimming', 'pool-swimming'] },
    { key: 'strength', glyph: 'strength', matches: ['weightlifting', 'weight-lifting', 'strength', 'strength-training', 'functional-fitness', 'functional-training', 'powerlifting', 'lifting', 'cross-training', 'circuit-training'] },
    { key: 'hiit', glyph: 'hiit', matches: ['hiit', 'hiit-cardio', 'high-intensity-interval-training', 'interval-training', 'crossfit', 'metcon'] },
    { key: 'yoga', glyph: 'yoga', matches: ['yoga', 'pilates', 'stretching', 'mobility', 'meditation'] },
    { key: 'rowing', glyph: 'row', matches: ['rowing', 'indoor-rowing', 'rowing-machine'] },
    { key: 'walking', glyph: 'walk', matches: ['walking', 'walk', 'casual-walking'] },
    { key: 'hiking', glyph: 'hike', matches: ['hiking', 'hike', 'trail-walking', 'mountaineering'] },
    { key: 'basketball', glyph: 'ball', matches: ['basketball'] },
    { key: 'soccer', glyph: 'ball', matches: ['soccer', 'football'] },
    { key: 'tennis', glyph: 'racket', matches: ['tennis', 'squash', 'badminton', 'pickleball', 'table-tennis', 'racket-sports'] },
    { key: 'boxing', glyph: 'box', matches: ['boxing', 'kickboxing', 'martial-arts', 'mma', 'muay-thai'] },
    { key: 'golf', glyph: 'golf', matches: ['golf'] },
    { key: 'elliptical', glyph: 'elliptical', matches: ['elliptical', 'stair-climbing', 'stairmaster', 'indoor-cardio'] }
  ];

  function normalizeSportId(value) {
    return String(value === undefined || value === null ? '' : value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function resolveSport(workout) {
    var raw = workout ? workout.sport : null;
    var display = workout ? workout.sportName : null;
    var normalized = normalizeSportId(raw || display);
    for (var i = 0; i < SPORT_GROUPS.length; i += 1) {
      var group = SPORT_GROUPS[i];
      for (var j = 0; j < group.matches.length; j += 1) {
        if (normalized === group.matches[j] || normalized.indexOf(group.matches[j]) === 0) {
          return { label: T('sport.' + group.key), glyph: group.glyph };
        }
      }
    }
    return { label: display || raw || T('sport.other'), glyph: 'activity' };
  }

  // -------------------------------------------------------------------------
  // Real error / empty state copy per host error code (docs/PLUGIN_SPEC.md §4.1).
  // auth_required / not_configured / token_expired never reach here: they are
  // unbound states and render the minimal fallback (see UnboundView).
  // -------------------------------------------------------------------------
  function stateCopy(code) {
    switch (code) {
      case 'rate_limited':
        return { icon: 'info', tone: 'warn', title: T('state.rateTitle'), body: T('state.rateBody'), hint: '', action: T('app.retry'), alert: true };
      case 'network':
        return { icon: 'info', tone: 'warn', title: T('state.networkTitle'), body: T('state.networkBody'), hint: '', action: T('app.retry'), alert: true };
      case 'storage_error':
        return { icon: 'info', tone: 'warn', title: T('state.storageTitle'), body: T('state.storageBody'), hint: '', action: T('app.retry'), alert: true };
      case 'bad_request':
      case 'transport':
      case 'remote_error':
        return { icon: 'info', tone: 'warn', title: T('state.miscTitle'), body: T('state.miscBody'), hint: '', action: T('app.retry'), alert: true };
      case 'api_error':
        return { icon: 'alert', tone: 'danger', title: T('state.apiTitle'), body: T('state.apiBody'), hint: '', action: T('app.retry'), alert: true };
      case 'empty':
        return { icon: 'activity', tone: 'muted', title: T('state.emptyTitle'), body: T('state.emptyBody'), hint: '', action: T('app.retry'), alert: false };
      default:
        return { icon: 'alert', tone: 'danger', title: T('state.errorTitle'), body: T('state.miscBody'), hint: '', action: T('app.retry'), alert: true };
    }
  }

  // -------------------------------------------------------------------------
  // Header + controls
  // -------------------------------------------------------------------------
  function LangButton() {
    WHOOP_LANG.use();
    var lang = WHOOP_LANG.get();
    var target = lang === 'zh' ? 'en' : 'zh';
    var label = target === 'en' ? T('lang.switchToEn') : T('lang.switchToZh');
    return h(
      'button',
      {
        type: 'button',
        className: 'wh-btn wh-btn--icon wh-lang-btn',
        'aria-label': label,
        title: label,
        onClick: function () {
          WHOOP_LANG.set(target);
        }
      },
      h('span', { className: 'wh-lang-mark', 'aria-hidden': 'true' }, target === 'en' ? 'EN' : '中')
    );
  }

  function RefreshButton(props) {
    WHOOP_LANG.use();
    var label = T('app.refreshAria');
    return h(
      'button',
      {
        type: 'button',
        className: 'wh-btn wh-btn--refresh',
        'aria-label': label,
        title: label,
        'aria-busy': props.loading ? 'true' : 'false',
        disabled: !!props.loading,
        onClick: props.onRefresh
      },
      props.loading
        ? h('span', { className: 'wh-spinner', 'aria-hidden': 'true' })
        : h(Glyph, { name: 'refresh', size: 14 }),
      h('span', { className: 'wh-btn-text' }, T('app.refresh'))
    );
  }

  function TopBar(props) {
    WHOOP_LANG.use();
    var statusText;
    if (props.loading) statusText = T('app.refreshing');
    else if (props.updatedAt) statusText = T('app.updated', { time: F.timeShort(props.updatedAt) });
    else statusText = T('app.notSynced');
    return h(
      'header',
      { className: 'wh-topbar' },
      h(
        'div',
        { className: 'wh-topbar-inner' },
        h(
          'div',
          { className: 'wh-heading' },
          h('div', { className: 'wh-heading-row' }, h('h1', { className: 'wh-title' }, T('app.title'))),
          props.minimal
            ? null
            : h(
                'div',
                { className: 'wh-heading-meta' },
                h('span', { className: 'wh-subtitle' }, T('app.subtitle')),
                h('span', { className: 'wh-live', role: 'status', 'aria-live': 'polite' }, statusText)
              )
        ),
        h('div', { className: 'wh-controls' }, h(LangButton), h(RefreshButton, { loading: props.loading, onRefresh: props.onRefresh }))
      )
    );
  }

  // WHOOP sensor-ring mark used by the unbound fallback (ring + ECG pulse).
  function WhoopMark(props) {
    var size = isNum(props.size) ? props.size : 28;
    return h(
      'svg',
      {
        className: 'wh-whoop-mark',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false'
      },
      h('circle', { key: 'ring', cx: 12, cy: 12, r: 9.1, strokeOpacity: 0.85 }),
      h('path', { key: 'pulse', d: 'M5.4 12.1h3.2l1.55-3.4 2.8 6.9 1.7-3.5h3.9' })
    );
  }

  // Unbound fallback (docs/UX-REDESIGN.md §四): WHOOP icon + title + one short
  // line + a single settings CTA. Never renders error codes, retry or demo
  // disclosure; the only extra line appears when WHOOP_UI.openSettings() fails.
  function UnboundView() {
    WHOOP_LANG.use();
    var hintPair = React.useState(false);
    var showHint = hintPair[0];
    var setShowHint = hintPair[1];

    function bindAccount() {
      uiSetConnected(false);
      var opened = uiOpenSettings();
      setShowHint(!opened);
    }

    return h(
      'section',
      { className: 'wh-unbound', 'aria-label': T('unbound.title') },
      h('div', { key: 'mark', className: 'wh-unbound-mark', 'aria-hidden': 'true' }, h(WhoopMark, { size: 30 })),
      h('h2', { key: 'title', className: 'wh-unbound-title' }, T('unbound.title')),
      h('p', { key: 'body', className: 'wh-unbound-body' }, T('unbound.body')),
      h(
        'div',
        { key: 'action', className: 'wh-unbound-action' },
        h('button', { type: 'button', className: 'wh-btn wh-btn--primary wh-unbound-btn', onClick: bindAccount }, T('unbound.cta'))
      ),
      showHint ? h('p', { key: 'hint', className: 'wh-unbound-hint', role: 'status' }, T('unbound.hint')) : null
    );
  }

  // -------------------------------------------------------------------------
  // Shared building blocks
  // -------------------------------------------------------------------------
  function SectionHead(props) {
    return h(
      'div',
      { className: 'wh-section-head' },
      h(
        'div',
        { className: 'wh-section-head-text' },
        h('h2', { className: 'wh-section-title' }, props.title),
        props.subtitle ? h('p', { className: 'wh-section-sub' }, props.subtitle) : null
      ),
      props.children ? h('div', { className: 'wh-section-head-right' }, props.children) : null
    );
  }

  function EmptyNote(props) {
    WHOOP_LANG.use();
    return h(
      'div',
      { className: 'wh-empty', role: 'status' },
      h(Glyph, { name: 'activity', size: 20, className: 'wh-empty-icon' }),
      h(
        'div',
        { className: 'wh-empty-text' },
        h('p', { className: 'wh-empty-title' }, props.title),
        props.body ? h('p', { className: 'wh-empty-body' }, props.body) : null
      )
    );
  }

  function LoadingView() {
    WHOOP_LANG.use();
    var heroCards = [0, 1, 2].map(function (index) {
      return h(
        'div',
        { key: index, className: 'wh-skel wh-skel-hero-card' },
        h('div', { className: 'wh-skel wh-skel-ring' }),
        h('div', { className: 'wh-skel wh-skel-line', style: { width: '58%' } }),
        h('div', { className: 'wh-skel wh-skel-line', style: { width: '82%' } })
      );
    });
    var metricTiles = [];
    for (var i = 0; i < 8; i += 1) {
      metricTiles.push(
        h(
          'div',
          { key: i, className: 'wh-skel wh-skel-metric' },
          h('div', { className: 'wh-skel wh-skel-line', style: { width: '52%' } }),
          h('div', { className: 'wh-skel wh-skel-line wh-skel-line--value', style: { width: '38%' } })
        )
      );
    }
    return h(
      'div',
      { className: 'wh-loading', 'aria-busy': 'true' },
      h('span', { className: 'wh-sr', role: 'status', 'aria-live': 'polite' }, T('loading.title')),
      h('div', { className: 'wh-skel-hero' }, heroCards),
      h('div', { className: 'wh-skel-metrics' }, metricTiles),
      h(
        'div',
        { className: 'wh-skel-charts' },
        h('div', { className: 'wh-skel wh-skel-chart' }),
        h('div', { className: 'wh-skel wh-skel-chart' })
      ),
      h('p', { className: 'wh-loading-hint' }, T('loading.hint'))
    );
  }

  function StateView(props) {
    WHOOP_LANG.use();
    var copy = stateCopy(props.code);
    var kids = [];
    kids.push(h('div', { key: 'icon', className: 'wh-state-icon wh-state-icon--' + copy.tone }, h(Glyph, { name: copy.icon, size: 22 })));
    kids.push(h('h2', { key: 'title', className: 'wh-state-title' }, copy.title));
    kids.push(h('p', { key: 'body', className: 'wh-state-body' }, copy.body));
    if (copy.hint) kids.push(h('p', { key: 'hint', className: 'wh-state-hint' }, copy.hint));
    if (props.message) kids.push(h('p', { key: 'detail', className: 'wh-state-detail' }, String(props.message)));
    kids.push(
      h('div', { key: 'actions', className: 'wh-state-actions' }, h('button', { type: 'button', className: 'wh-btn wh-btn--primary', onClick: props.onRetry }, copy.action))
    );
    return h(
      'section',
      { className: 'wh-state', role: copy.alert ? 'alert' : 'status' },
      h('div', { className: 'wh-state-card' }, kids)
    );
  }

  function InlineError(props) {
    WHOOP_LANG.use();
    var copy = stateCopy(props.code);
    return h(
      'div',
      { className: 'wh-inline-error', role: 'alert' },
      h(Glyph, { name: 'alert', size: 16, className: 'wh-inline-error-icon' }),
      h(
        'div',
        { className: 'wh-inline-error-text' },
        h('strong', { className: 'wh-inline-error-title' }, copy.title),
        props.message ? h('span', { className: 'wh-inline-error-msg' }, String(props.message)) : null
      ),
      h('button', { type: 'button', className: 'wh-btn wh-btn--ghost', onClick: props.onRetry }, T('app.retry'))
    );
  }

  // -------------------------------------------------------------------------
  // 1. Hero — recovery / strain / sleep rings
  // -------------------------------------------------------------------------
  function HeroCard(props) {
    WHOOP_LANG.use();
    var kids = [];
    kids.push(
      h(
        'div',
        { key: 'head', className: 'wh-hero-head' },
        h('span', { key: 'dot', className: 'wh-hero-dot', style: { background: props.color } }),
        h('span', { key: 'label', className: 'wh-hero-label' }, props.title),
        h('span', { key: 'verdict', className: 'wh-hero-verdict' + (props.empty ? ' is-empty' : '') }, props.verdict)
      )
    );
    kids.push(
      h(
        'div',
        { key: 'ring', className: 'wh-hero-ring' },
        h(CH.ScoreRing, {
          value: props.ringValue,
          max: props.ringMax,
          display: props.display,
          cap: props.cap,
          color: props.color,
          ariaLabel: props.ariaLabel
        })
      )
    );
    if (props.note) kids.push(h('p', { key: 'note', className: 'wh-hero-note' }, props.note));
    kids.push(
      h(
        'div',
        { key: 'subs', className: 'wh-hero-subs' },
        props.subs.map(function (sub, index) {
          return h(
            'div',
            { key: index, className: 'wh-submetric' },
            h('span', { key: 'label', className: 'wh-submetric-label' }, sub.label),
            h('span', { key: 'value', className: 'wh-submetric-value' }, sub.value)
          );
        })
      )
    );
    return h('article', { className: 'wh-hero-card wh-hero-card--' + props.accent }, kids);
  }

  function Hero(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var today = todayOf(snapshot);
    var recovery = today.recovery || null;
    var cycle = today.cycle || null;
    var sleep = today.sleep || null;

    var recoveryScore = recovery ? toNum(recovery.score) : null;
    var strain = cycle ? toNum(cycle.strain) : null;
    var sleepPerformance = sleep ? toNum(sleep.performance) : null;

    var recoveryEmpty = recoveryScore === null;
    var recoveryNote = recoveryEmpty ? T('hero.recoveryPending') : null;
    var recoveryStatusText = recoveryEmpty
      ? recovery && recovery.calibrating
        ? T('hero.calibrating')
        : T('hero.noData')
      : recoveryVerdict(recoveryScore);

    return h(
      'section',
      { className: 'wh-hero', 'aria-label': T('app.title') },
      h(HeroCard, {
        key: 'recovery',
        accent: 'recovery',
        color: recoveryColor(recoveryScore),
        title: T('hero.recovery'),
        verdict: recoveryStatusText,
        empty: recoveryEmpty,
        ringValue: recoveryScore,
        ringMax: 100,
        display: recoveryEmpty ? dash() : F.num(recoveryScore, 0),
        cap: '/100',
        note: recoveryNote,
        ariaLabel: T('hero.ringAria', { label: T('hero.recovery'), value: recoveryEmpty ? dash() : F.num(recoveryScore, 0) }),
        subs: [
          { label: T('hero.hrv'), value: recovery ? F.msValue(recovery.hrv) : dash() },
          { label: T('hero.restingHr'), value: recovery ? F.bpm(recovery.rhr) : dash() },
          { label: T('hero.spo2'), value: recovery ? F.pct(recovery.spo2, 0) : dash() }
        ]
      }),
      h(HeroCard, {
        key: 'strain',
        accent: 'strain',
        color: ACCENT.strain,
        title: T('hero.strain'),
        verdict: strainVerdict(strain),
        empty: strain === null,
        ringValue: strain,
        ringMax: STRAIN_MAX,
        display: strain === null ? dash() : F.num(strain, 1),
        cap: '/' + STRAIN_MAX,
        note: null,
        ariaLabel: T('hero.ringAria', { label: T('hero.strain'), value: strain === null ? dash() : F.num(strain, 1) }),
        subs: [
          { label: T('hero.energy'), value: cycle ? F.kj(cycle.kilojoule) : dash() },
          { label: T('hero.avgHr'), value: cycle ? F.bpm(cycle.avgHr) : dash() },
          { label: T('hero.maxHr'), value: cycle ? F.bpm(cycle.maxHr) : dash() }
        ]
      }),
      h(HeroCard, {
        key: 'sleep',
        accent: 'sleep',
        color: ACCENT.sleep,
        title: T('hero.sleep'),
        verdict: sleepVerdict(sleepPerformance),
        empty: sleepPerformance === null,
        ringValue: sleepPerformance,
        ringMax: 100,
        display: sleepPerformance === null ? dash() : F.num(sleepPerformance, 0),
        cap: '%',
        note: null,
        ariaLabel: T('hero.ringAria', { label: T('hero.sleep'), value: sleepPerformance === null ? dash() : F.pct(sleepPerformance, 0) }),
        subs: [
          { label: T('hero.sleepDuration'), value: sleep ? F.duration(sleep.totalSleepMs) : dash() },
          { label: T('hero.efficiency'), value: sleep ? F.pct(sleep.efficiency, 0) : dash() },
          { label: T('hero.consistency'), value: sleep ? F.pct(sleep.consistency, 0) : dash() }
        ]
      })
    );
  }

  // -------------------------------------------------------------------------
  // 2. Today's metrics grid
  // -------------------------------------------------------------------------
  var METRIC_DEFS = [
    { key: 'hrv', labelKey: 'metric.hrv', section: 'today.recovery', path: 'recovery.hrv', digits: 0, unit: 'ms', accent: 'recovery', sparkPath: 'recovery.hrv' },
    { key: 'rhr', labelKey: 'metric.rhr', section: 'today.recovery', path: 'recovery.rhr', digits: 0, unit: 'bpm', accent: 'strain', sparkPath: 'recovery.rhr' },
    { key: 'respiratory', labelKey: 'metric.respiratory', section: 'today.sleep', path: 'sleep.respiratoryRate', digits: 1, unit: 'rpm', accent: 'sleep', sparkPath: 'sleep.respiratoryRate' },
    { key: 'spo2', labelKey: 'metric.spo2', section: 'today.recovery', path: 'recovery.spo2', digits: 0, unit: '%', accent: 'strain', sparkPath: 'recovery.spo2' },
    { key: 'skinTemp', labelKey: 'metric.skinTemp', section: 'today.recovery', path: 'recovery.skinTemp', digits: 1, unit: '°C', accent: 'warn', sparkPath: 'recovery.skinTemp' },
    { key: 'steps', labelKey: 'metric.steps', section: 'today.cycle', path: 'cycle.steps', digits: 0, unitKey: 'unit.steps', accent: 'brand', sparkPath: 'cycle.steps', format: 'num' },
    { key: 'energy', labelKey: 'metric.energy', section: 'today.cycle', path: 'cycle.kilojoule', digits: 0, unit: 'kJ', accent: 'strain', sparkPath: 'cycle.kilojoule' },
    { key: 'sleepDuration', labelKey: 'metric.sleepDuration', section: 'today.sleep', path: 'sleep.totalSleepMs', accent: 'sleep', sparkPath: 'sleep.totalSleepMs', format: 'duration' },
    { key: 'sleepEfficiency', labelKey: 'metric.sleepEfficiency', section: 'today.sleep', path: 'sleep.efficiency', accent: 'sleep', sparkPath: 'sleep.efficiency', format: 'pct' },
    { key: 'sleepConsistency', labelKey: 'metric.sleepConsistency', section: 'today.sleep', path: 'sleep.consistency', accent: 'sleep', sparkPath: 'sleep.consistency', format: 'pct' }
  ];

  function metricDisplay(def, value) {
    if (def.format === 'duration') return F.duration(value);
    if (def.format === 'pct') return F.pct(value, 0);
    var digits = isNum(def.digits) ? def.digits : 0;
    return F.num(value, digits);
  }

  function MetricTile(props) {
    WHOOP_LANG.use();
    var kids = [];
    kids.push(h('div', { key: 'head', className: 'wh-metric-head' }, h('span', { key: 'label', className: 'wh-metric-label' }, props.label)));
    kids.push(
      h(
        'div',
        { key: 'body', className: 'wh-metric-body' },
        h('span', { key: 'value', className: 'wh-metric-value' + (props.hasValue ? '' : ' wh-metric-value--empty') }, props.text),
        props.unit ? h('span', { key: 'unit', className: 'wh-metric-unit' }, props.unit) : null
      )
    );
    if (props.spark && anyNumber(props.spark)) {
      kids.push(
        h(
          'div',
          { key: 'spark', className: 'wh-metric-spark' },
          h(CH.Sparkline, {
            values: props.spark,
            color: props.accent,
            ariaLabel: T('metric.sparkAria', { label: props.label })
          })
        )
      );
    }
    return h('div', { className: 'wh-metric' }, kids);
  }

  function MetricsSection(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var today = todayOf(snapshot);
    var days = daysOf(snapshot);
    var recent = days.slice(Math.max(0, days.length - METRIC_SPARK_DAYS));
    var tiles = METRIC_DEFS.map(function (def) {
      var node = today;
      var parts = def.path.split('.');
      for (var i = 0; i < parts.length; i += 1) {
        if (node === null || node === undefined) {
          node = null;
          break;
        }
        node = node[parts[i]];
      }
      var value = toNum(node);
      var unit = def.unit;
      if (!unit && def.unitKey) unit = T(def.unitKey);
      return h(MetricTile, {
        key: def.key,
        label: T(def.labelKey),
        hasValue: value !== null,
        text: value === null ? dash() : metricDisplay(def, value),
        unit: unit,
        accent: ACCENT[def.accent] || ACCENT.muted,
        spark: seriesFrom(recent, def.sparkPath)
      });
    });
    return h(
      'section',
      { className: 'wh-section' },
      h(SectionHead, { title: T('metrics.title'), subtitle: T('metrics.subtitle') }),
      h('div', { className: 'wh-metrics' }, tiles)
    );
  }

  // -------------------------------------------------------------------------
  // 3. Trends — 7 / 14 / 30 day selector + pure SVG charts from snapshot.days
  // -------------------------------------------------------------------------
  function ChartCard(props) {
    WHOOP_LANG.use();
    var kids = [];
    var headKids = [];
    headKids.push(
      h(
        'div',
        { key: 'text', className: 'wh-chart-head-text' },
        h('h3', { key: 'title', className: 'wh-chart-title' }, props.title),
        props.subtitle ? h('p', { key: 'sub', className: 'wh-chart-sub' }, props.subtitle) : null
      )
    );
    if (props.avg) headKids.push(h('span', { key: 'avg', className: 'wh-chart-avg' }, props.avg));
    kids.push(h('div', { key: 'head', className: 'wh-chart-head' }, headKids));
    if (props.legend && props.legend.length) {
      kids.push(
        h(
          'div',
          { key: 'legend', className: 'wh-chart-legend' },
          props.legend.map(function (item, index) {
            return h(
              'span',
              { key: index, className: 'wh-legend-item' },
              h('span', { key: 'dot', className: 'wh-legend-dot', style: { background: item.color } }),
              h('span', { key: 'label' }, item.label)
            );
          })
        )
      );
    }
    kids.push(h('div', { key: 'body', className: 'wh-chart-body' }, props.chart));
    return h('div', { className: 'wh-card wh-chart-card' }, kids);
  }

  function TrendsSection(props) {
    WHOOP_LANG.use();
    var rangePair = React.useState(7);
    var range = rangePair[0];
    var setRange = rangePair[1];
    var snapshot = props.snapshot || {};
    var days = daysOf(snapshot);
    var windowDays = days.slice(Math.max(0, days.length - range));
    var labels = windowDays.map(function (day) {
      return range <= 7 ? F.weekdayShort(day.date) : F.axisDate(day.date);
    });
    var tips = windowDays.map(function (day) {
      return F.dateShort(day.date);
    });

    var recovery = seriesFrom(windowDays, 'recovery.score');
    var hrv = seriesFrom(windowDays, 'recovery.hrv');
    var rhr = seriesFrom(windowDays, 'recovery.rhr');
    var strain = seriesFrom(windowDays, 'cycle.strain');
    var performance = seriesFrom(windowDays, 'sleep.performance');
    var consistency = seriesFrom(windowDays, 'sleep.consistency');

    var rangeControl = h(
      'div',
      { className: 'wh-seg', role: 'group', 'aria-label': T('trends.rangeLabel') },
      [7, 14, 30].map(function (value) {
        return h(
          'button',
          {
            key: value,
            type: 'button',
            className: 'wh-seg-btn' + (range === value ? ' is-active' : ''),
            'aria-pressed': range === value ? 'true' : 'false',
            onClick: function () {
              setRange(value);
            }
          },
          rangeLabelFor(value)
        );
      })
    );

    var recoveryChart = h(CH.LineChart, {
      series: [
        {
          key: 'recovery',
          label: T('chart.series.recovery'),
          color: ACCENT.recovery,
          values: recovery,
          domain: [0, 100],
          area: true,
          digits: 0
        },
        {
          key: 'hrv',
          label: T('chart.series.hrv'),
          color: ACCENT.brand,
          values: hrv,
          axis: 'right',
          digits: 0,
          unit: 'ms'
        }
      ],
      labels: labels,
      tooltipLabels: tips,
      height: 200,
      ariaLabel: chartAria(T('trends.recoveryHrv'), range),
      emptyText: T('chart.noData')
    });

    var rhrChart = h(CH.LineChart, {
      series: [
        {
          key: 'rhr',
          label: T('chart.series.rhr'),
          color: ACCENT.strain,
          values: rhr,
          area: true,
          digits: 0,
          unit: 'bpm'
        }
      ],
      labels: labels,
      tooltipLabels: tips,
      height: 190,
      ariaLabel: chartAria(T('trends.rhr'), range),
      emptyText: T('chart.noData')
    });

    var strainChart = h(CH.BarChart, {
      values: strain,
      labels: labels,
      tooltipLabels: tips,
      color: ACCENT.strain,
      domain: [0, STRAIN_MAX],
      digits: 1,
      seriesLabel: T('chart.series.strain'),
      height: 190,
      ariaLabel: chartAria(T('trends.strain'), range),
      emptyText: T('chart.noData')
    });

    var sleepChart = h(CH.LineChart, {
      series: [
        {
          key: 'performance',
          label: T('chart.series.performance'),
          color: ACCENT.sleep,
          values: performance,
          domain: [0, 100],
          digits: 0,
          unit: '%'
        },
        {
          key: 'consistency',
          label: T('chart.series.consistency'),
          color: ACCENT.sleepSoft,
          values: consistency,
          domain: [0, 100],
          digits: 0,
          unit: '%'
        }
      ],
      labels: labels,
      tooltipLabels: tips,
      height: 190,
      ariaLabel: chartAria(T('trends.sleep'), range),
      emptyText: T('chart.noData')
    });

    return h(
      'section',
      { className: 'wh-section' },
      h(SectionHead, { title: T('trends.title'), subtitle: T('trends.subtitle') }, rangeControl),
      h(
        'div',
        { className: 'wh-charts' },
        h(ChartCard, {
          key: 'recovery',
          title: T('trends.recoveryHrv'),
          subtitle: T('trends.recoveryHrvSub'),
          avg: avgLabel(recovery, function (value) {
            return F.num(value, 0);
          }),
          legend: [
            { color: ACCENT.recovery, label: T('chart.series.recovery') },
            { color: ACCENT.brand, label: T('chart.series.hrv') }
          ],
          chart: recoveryChart
        }),
        h(ChartCard, {
          key: 'rhr',
          title: T('trends.rhr'),
          subtitle: T('trends.rhrSub'),
          avg: avgLabel(rhr, function (value) {
            return F.bpm(value);
          }),
          chart: rhrChart
        }),
        h(ChartCard, {
          key: 'strain',
          title: T('trends.strain'),
          subtitle: T('trends.strainSub'),
          avg: avgLabel(strain, function (value) {
            return F.num(value, 1);
          }),
          chart: strainChart
        }),
        h(ChartCard, {
          key: 'sleep',
          title: T('trends.sleep'),
          subtitle: T('trends.sleepSub', { days: range }),
          avg: avgLabel(performance, function (value) {
            return F.pct(value, 0);
          }),
          legend: [
            { color: ACCENT.sleep, label: T('chart.series.performance') },
            { color: ACCENT.sleepSoft, label: T('chart.series.consistency') }
          ],
          chart: sleepChart
        })
      )
    );
  }

  // -------------------------------------------------------------------------
  // 4. Sleep detail — stages, needed vs actual, timing, disturbances
  // -------------------------------------------------------------------------
  function latestSleep(snapshot) {
    var data = snapshot || {};
    var days = daysOf(data);
    var todayDate = days.length ? days[days.length - 1].date : null;
    var today = todayOf(data);
    if (today.sleep) return { sleep: today.sleep, date: todayDate };
    for (var i = days.length - 1; i >= 0; i -= 1) {
      if (days[i] && days[i].sleep) return { sleep: days[i].sleep, date: days[i].date };
    }
    return null;
  }

  function CompareRow(props) {
    return h(
      'div',
      { className: 'wh-compare-row' },
      h(
        'div',
        { key: 'head', className: 'wh-compare-head' },
        h('span', { key: 'label', className: 'wh-compare-label' }, props.label),
        h('span', { key: 'value', className: 'wh-compare-value' }, props.value)
      ),
      h(
        'div',
        { key: 'track', className: 'wh-meter' },
        h('span', {
          className: 'wh-meter-fill' + (props.muted ? ' is-muted' : ''),
          style: { width: Math.max(0, Math.min(100, props.percent)) + '%', background: props.color }
        })
      )
    );
  }

  function SleepSection(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var days = daysOf(snapshot);
    var todayDate = days.length ? days[days.length - 1].date : null;
    var found = latestSleep(snapshot);

    if (!found) {
      return h(
        'section',
        { className: 'wh-section' },
        h(SectionHead, { title: T('sleep.title'), subtitle: T('sleep.subtitle') }),
        h('div', { className: 'wh-card' }, h(EmptyNote, { title: T('sleep.emptyTitle'), body: T('sleep.emptyBody') }))
      );
    }

    var sleep = found.sleep;
    var dateLabel = found.date && found.date === todayDate ? T('sleep.lastNight') : found.date ? T('sleep.nightOf', { date: F.dateShort(found.date) }) : T('sleep.lastNight');

    var light = toNum(sleep.lightMs);
    var deep = toNum(sleep.deepMs);
    var rem = toNum(sleep.remMs);
    var awake = toNum(sleep.awakeMs);
    var knownTotal = 0;
    if (light !== null) knownTotal += light;
    if (deep !== null) knownTotal += deep;
    if (rem !== null) knownTotal += rem;
    if (awake !== null) knownTotal += awake;

    var inBed = toNum(sleep.inBedMs);
    var totalSleep = toNum(sleep.totalSleepMs);
    var base = inBed !== null ? inBed : totalSleep !== null ? totalSleep + (awake || 0) : knownTotal;
    var unrecorded = Math.max(0, base - knownTotal);

    var segments = [];
    if (light !== null && light > 0) segments.push({ key: 'light', label: T('sleep.light'), ms: light, color: STAGE_COLORS.light, valueText: F.duration(light) });
    if (deep !== null && deep > 0) segments.push({ key: 'deep', label: T('sleep.deep'), ms: deep, color: STAGE_COLORS.deep, valueText: F.duration(deep) });
    if (rem !== null && rem > 0) segments.push({ key: 'rem', label: T('sleep.rem'), ms: rem, color: STAGE_COLORS.rem, valueText: F.duration(rem) });
    if (awake !== null && awake > 0) segments.push({ key: 'awake', label: T('sleep.awake'), ms: awake, color: STAGE_COLORS.awake, valueText: F.duration(awake) });
    if (unrecorded > 60000) segments.push({ key: 'nodata', label: T('sleep.noData'), ms: unrecorded, color: STAGE_COLORS.noData, valueText: F.duration(unrecorded) });

    var stageLegend = [];
    for (var i = 0; i < segments.length; i += 1) {
      stageLegend.push(
        h(
          'span',
          { key: segments[i].key, className: 'wh-stage-legend-item' },
          h('span', { key: 'dot', className: 'wh-stage-dot', style: { background: segments[i].color } }),
          h('span', { key: 'label', className: 'wh-stage-legend-label' }, segments[i].label),
          h('span', { key: 'value', className: 'wh-stage-legend-value' }, segments[i].valueText)
        )
      );
    }

    var needed = toNum(sleep.neededMs);
    var maxCompare = Math.max(totalSleep || 0, needed || 0, 1);
    var compareRows = [
      h(CompareRow, {
        key: 'actual',
        label: T('sleep.actual'),
        value: F.duration(totalSleep),
        percent: totalSleep === null ? 0 : (totalSleep / maxCompare) * 100,
        color: ACCENT.sleep
      }),
      h(CompareRow, {
        key: 'needed',
        label: T('sleep.needed'),
        value: F.duration(needed),
        percent: needed === null ? 0 : (needed / maxCompare) * 100,
        color: ACCENT.muted,
        muted: true
      })
    ];

    var stats = [
      { key: 'performance', label: T('sleep.performance'), value: F.pct(sleep.performance, 0) },
      { key: 'efficiency', label: T('sleep.efficiency'), value: F.pct(sleep.efficiency, 0) },
      { key: 'consistency', label: T('sleep.consistency'), value: F.pct(sleep.consistency, 0) },
      { key: 'respiratory', label: T('sleep.respiratory'), value: F.rpm(sleep.respiratoryRate) },
      { key: 'bedtime', label: T('sleep.bedtime'), value: F.timeShort(sleep.start) },
      { key: 'wake', label: T('sleep.wake'), value: F.timeShort(sleep.end) },
      { key: 'inBed', label: T('sleep.inBed'), value: F.duration(inBed) },
      { key: 'disturbances', label: T('sleep.disturbances'), value: F.num(sleep.disturbances, 0) }
    ];

    var stageAria = T('sleep.stages') + ' · ' + T('sleep.actual') + ' ' + F.duration(totalSleep);

    return h(
      'section',
      { className: 'wh-section' },
      h(
        SectionHead,
        { title: T('sleep.title'), subtitle: T('sleep.subtitle') },
        h('span', { className: 'wh-chip' }, dateLabel)
      ),
      h(
        'div',
        { className: 'wh-card wh-sleep-card' },
        segments.length
          ? h(
              'div',
              { key: 'stages', className: 'wh-sleep-stages' },
              h(
                'div',
                { key: 'head', className: 'wh-sleep-stages-head' },
                h('h3', { key: 'title', className: 'wh-sleep-label' }, T('sleep.stages')),
                h('span', { key: 'meta', className: 'wh-sleep-meta' }, T('sleep.actual') + ' ' + F.duration(totalSleep))
              ),
              h('div', { key: 'bar', className: 'wh-stage-bar-wrap' }, h(CH.StageBar, { segments: segments, height: 16, ariaLabel: stageAria })),
              h('div', { key: 'legend', className: 'wh-stage-legend' }, stageLegend)
            )
          : h('div', { key: 'stages', className: 'wh-sleep-stages' }, h(EmptyNote, { title: T('sleep.emptyTitle'), body: T('sleep.emptyBody') })),
        h('div', { key: 'compare', className: 'wh-sleep-compare' }, compareRows),
        h(
          'div',
          { key: 'stats', className: 'wh-sleep-stats' },
          stats.map(function (stat) {
            return h(
              'div',
              { key: stat.key, className: 'wh-sleep-stat' },
              h('span', { key: 'label', className: 'wh-sleep-stat-label' }, stat.label),
              h('span', { key: 'value', className: 'wh-sleep-stat-value' }, stat.value)
            );
          })
        )
      )
    );
  }

  // -------------------------------------------------------------------------
  // 5. Workouts — sport art, stats, HR-zone mini bar
  // -------------------------------------------------------------------------
  function WorkoutCard(props) {
    WHOOP_LANG.use();
    var workout = props.workout || {};
    var sport = resolveSport(workout);
    var meta = [];
    if (isNum(workout.durationMs)) meta.push({ key: 'duration', label: T('workouts.duration'), value: F.duration(workout.durationMs) });
    if (isNum(workout.avgHr)) meta.push({ key: 'avg', label: T('workouts.avgHr'), value: F.bpm(workout.avgHr) });
    if (isNum(workout.maxHr)) meta.push({ key: 'max', label: T('workouts.maxHr'), value: F.bpm(workout.maxHr) });
    if (isNum(workout.kilojoule)) meta.push({ key: 'energy', label: T('workouts.energy'), value: F.kj(workout.kilojoule) });
    if (isNum(workout.distanceM)) meta.push({ key: 'distance', label: T('workouts.distance'), value: F.km(workout.distanceM) });

    var zones = Array.isArray(workout.zones) ? workout.zones : [];
    var zoneLabels = zones.map(function (ms, index) {
      return T('workouts.zoneAria', { n: index, duration: F.duration(ms) });
    });
    var hasZoneData = false;
    for (var i = 0; i < zones.length; i += 1) {
      if (isNum(zones[i]) && zones[i] > 0) {
        hasZoneData = true;
        break;
      }
    }

    var mainKids = [];
    mainKids.push(
      h(
        'div',
        { key: 'head', className: 'wh-workout-head' },
        h('span', { key: 'name', className: 'wh-workout-name' }, sport.label),
        h('time', { key: 'date', className: 'wh-workout-date', dateTime: workout.date || undefined }, F.dateShort(workout.date))
      )
    );
    if (meta.length) {
      mainKids.push(
        h(
          'div',
          { key: 'meta', className: 'wh-workout-meta' },
          meta.map(function (item) {
            return h('span', { key: item.key, className: 'wh-meta-item' }, item.label + ' ' + item.value);
          })
        )
      );
    }
    if (hasZoneData) {
      mainKids.push(
        h(
          'div',
          { key: 'zones', className: 'wh-workout-zones' },
          h(CH.HrZoneBar, {
            zones: zones,
            labels: zoneLabels,
            height: 7,
            ariaLabel: T('workouts.zones') + ' · ' + sport.label
          })
        )
      );
    }

    var strain = toNum(workout.strain);
    return h(
      'li',
      { className: 'wh-workout' },
      h('div', { key: 'icon', className: 'wh-workout-icon' }, h(SportIcon, { glyph: sport.glyph })),
      h('div', { key: 'main', className: 'wh-workout-main' }, mainKids),
      h(
        'div',
        { key: 'strain', className: 'wh-workout-strain' },
        h('span', { key: 'value', className: 'wh-workout-strain-value' + (strain === null ? ' is-empty' : '') }, strain === null ? dash() : F.num(strain, 1)),
        h('span', { key: 'label', className: 'wh-workout-strain-label' }, T('workouts.strain'))
      )
    );
  }

  function WorkoutsSection(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var workouts = Array.isArray(snapshot.workouts) ? snapshot.workouts.filter(Boolean) : [];
    var body;
    if (!workouts.length) {
      body = h('div', { className: 'wh-card' }, h(EmptyNote, { title: T('workouts.emptyTitle'), body: T('workouts.emptyBody') }));
    } else {
      body = h(
        'ul',
        { className: 'wh-workouts' },
        workouts.map(function (workout, index) {
          return h(WorkoutCard, { key: workout.id === undefined || workout.id === null ? 'workout-' + index : String(workout.id), workout: workout });
        })
      );
    }
    return h(
      'section',
      { className: 'wh-section' },
      h(SectionHead, { title: T('workouts.title'), subtitle: T('workouts.subtitle') }, workouts.length ? h('span', { className: 'wh-chip' }, T('workouts.count', { count: workouts.length })) : null),
      body
    );
  }

  // -------------------------------------------------------------------------
  // 6. Body & profile
  // -------------------------------------------------------------------------
  function BodySection(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var profile = snapshot.profile || null;
    var body = snapshot.body || null;

    var name = '';
    var initials = '';
    if (profile) {
      var first = profile.firstName ? String(profile.firstName) : '';
      var last = profile.lastName ? String(profile.lastName) : '';
      name = (first + ' ' + last).trim();
      var firstChar = first ? Array.from(first)[0] : '';
      var lastChar = last ? Array.from(last)[0] : '';
      initials = (firstChar + lastChar).toUpperCase();
    }

    var heightM = body ? toNum(body.heightM) : null;
    var weightKg = body ? toNum(body.weightKg) : null;
    var maxHr = body ? toNum(body.maxHr) : null;
    var bmi = heightM !== null && weightKg !== null && heightM > 0 ? weightKg / (heightM * heightM) : null;

    var stats = [
      { key: 'height', label: T('body.height'), value: heightM === null ? dash() : F.num(heightM, 2) + ' m' },
      { key: 'weight', label: T('body.weight'), value: weightKg === null ? dash() : F.num(weightKg, 1) + ' kg' },
      { key: 'maxHr', label: T('body.maxHr'), value: maxHr === null ? dash() : F.bpm(maxHr) },
      { key: 'bmi', label: T('body.bmi'), value: bmi === null ? dash() : F.num(bmi, 1) }
    ];

    return h(
      'section',
      { className: 'wh-section' },
      h(SectionHead, { title: T('body.title'), subtitle: T('body.subtitle') }),
      h(
        'div',
        { className: 'wh-card wh-body-card' },
        h(
          'div',
          { key: 'profile', className: 'wh-profile' },
          h('div', { key: 'avatar', className: 'wh-avatar', 'aria-hidden': 'true' }, initials || 'W'),
          h(
            'div',
            { key: 'text', className: 'wh-profile-text' },
            h('div', { key: 'name', className: 'wh-profile-name' }, name || T('body.unknownName')),
            profile && profile.email ? h('div', { key: 'email', className: 'wh-profile-email' }, String(profile.email)) : null
          )
        ),
        h(
          'div',
          { key: 'stats', className: 'wh-body-stats' },
          stats.map(function (stat) {
            return h(
              'div',
              { key: stat.key, className: 'wh-body-stat' },
              h('span', { key: 'label', className: 'wh-body-stat-label' }, stat.label),
              h('span', { key: 'value', className: 'wh-body-stat-value' }, stat.value)
            );
          })
        ),
        h('p', { key: 'note', className: 'wh-footnote' }, T('body.fromWhoop'))
      )
    );
  }

  function PageFooter(props) {
    WHOOP_LANG.use();
    var snapshot = props.snapshot || {};
    var rangeDays = snapshot.range && isNum(snapshot.range.days) ? snapshot.range.days : daysOf(snapshot).length;
    return h(
      'footer',
      { className: 'wh-footer' },
      h('span', { key: 'source', className: 'wh-footer-item' }, T('app.footnote')),
      isNum(rangeDays) && rangeDays > 0 ? h('span', { key: 'range', className: 'wh-footer-item' }, T('app.rangeHint', { days: rangeDays })) : null
    );
  }

  // -------------------------------------------------------------------------
  // Dashboard page
  // -------------------------------------------------------------------------
  function Dashboard(props) {
    WHOOP_LANG.use();
    var inputProps = props || {};
    var hasInitial = isSnapshotShape(inputProps.initialSnapshot);
    var initial = hasInitial ? inputProps.initialSnapshot : null;

    var statePair = React.useState(
      initial
        ? { phase: 'ready', snapshot: initial, error: null, loadedAt: initial.updatedAt || null }
        : { phase: 'loading', snapshot: null, error: null, loadedAt: null }
    );
    var state = statePair[0];
    var setState = statePair[1];
    var seqRef = React.useRef(0);
    var aliveRef = React.useRef(true);
    var startedRef = React.useRef(false);
    var skipFetchRef = React.useRef(hasInitial);

    var refresh = React.useCallback(function () {
      var seq = seqRef.current + 1;
      seqRef.current = seq;
      setState(function (prev) {
        return {
          phase: prev.snapshot ? 'refreshing' : 'loading',
          snapshot: prev.snapshot,
          error: null,
          loadedAt: prev.loadedAt
        };
      });

      function isCurrent() {
        return aliveRef.current && seqRef.current === seq;
      }

      function apply(updater) {
        if (!isCurrent()) return;
        setState(updater);
      }

      function fail(code, message) {
        if (!isCurrent()) return;
        // Auth-style failures mean the account is unbound: keep the shell's
        // settings-nav ordering in the "unbound" shape. Real errors leave the
        // last known connected state untouched.
        if (UNBOUND_CODES[code] === true) uiSetConnected(false);
        setState(function (prev) {
          return {
            phase: 'error',
            snapshot: prev.snapshot || null,
            error: { code: code || 'api_error', message: message || '' },
            loadedAt: prev.loadedAt
          };
        });
      }

      var request;
      try {
        request = WHOOP_API.snapshot({ force: true });
      } catch (err) {
        fail('api_error', err && err.message ? String(err.message) : '');
        return;
      }
      Promise.resolve(request).then(
        function (result) {
          if (!result || result.ok !== true) {
            fail(result && result.code ? String(result.code) : 'api_error', result && result.message ? String(result.message) : '');
            return;
          }
          var snapshot = result.snapshot && typeof result.snapshot === 'object' ? result.snapshot : null;
          if (!isCurrent()) return;
          if (snapshot) uiSetConnected(!isUnboundSnapshot(snapshot));
          setState(function () {
            return {
              phase: 'ready',
              snapshot: snapshot,
              error: null,
              loadedAt: (snapshot && snapshot.updatedAt) || new Date().toISOString()
            };
          });
        },
        function (err) {
          fail('network', err && err.message ? String(err.message) : '');
        }
      );
    }, []);

    React.useEffect(
      function () {
        aliveRef.current = true;
        if (skipFetchRef.current) {
          // Test hook path: no fetch, but still keep WHOOP_UI's nav ordering in
          // sync with the injected snapshot (no-op without a shell/SSR).
          uiSetConnected(!isUnboundSnapshot(initial));
        } else if (!startedRef.current) {
          startedRef.current = true;
          refresh();
        }
        return function () {
          aliveRef.current = false;
        };
      },
      [refresh]
    );

    var snapshot = state.snapshot;
    var error = state.error;
    var busy = state.phase === 'loading' || state.phase === 'refreshing';
    var initialLoading = state.phase === 'loading' && !snapshot;
    // Unbound = needs binding, not an error: minimal fallback only, no demo
    // data/badge, no error code, no retry (docs/UX-REDESIGN.md §四).
    var unbound = isUnboundState(state);
    var updatedAt = state.loadedAt || (snapshot && snapshot.updatedAt) || null;

    var pageKids = [h(TopBar, { key: 'topbar', minimal: unbound, loading: busy, updatedAt: updatedAt, onRefresh: refresh })];

    if (initialLoading) {
      pageKids.push(h(LoadingView, { key: 'loading' }));
    } else if (unbound) {
      pageKids.push(h(UnboundView, { key: 'unbound' }));
    } else if (!snapshot) {
      pageKids.push(h(StateView, { key: 'state', code: error ? error.code : 'empty', message: error ? error.message : '', onRetry: refresh }));
    } else {
      if (error) pageKids.push(h(InlineError, { key: 'inline-error', code: error.code, message: error.message, onRetry: refresh }));
      pageKids.push(h(Hero, { key: 'hero', snapshot: snapshot }));
      pageKids.push(h(MetricsSection, { key: 'metrics', snapshot: snapshot }));
      pageKids.push(h(TrendsSection, { key: 'trends', snapshot: snapshot }));
      pageKids.push(h(SleepSection, { key: 'sleep', snapshot: snapshot }));
      pageKids.push(h(WorkoutsSection, { key: 'workouts', snapshot: snapshot }));
      pageKids.push(h(BodySection, { key: 'body', snapshot: snapshot }));
    }

    if (!unbound) pageKids.push(h(PageFooter, { key: 'footer', snapshot: snapshot }));

    return h('div', { className: 'wh-root' }, h('div', { className: 'wh-page' }, pageKids));
  }

  return Dashboard;
})();
