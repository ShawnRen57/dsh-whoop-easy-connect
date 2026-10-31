#!/usr/bin/env node
/**
 * Server-render smoke test for the WHOOP client bundle.
 *
 * This does not replace in-page verification: it proves the bundle parses, the
 * remote contribution descriptor is well-formed, and the dashboard + settings
 * components render populated markup in both languages without throwing.
 *
 * Requires React 18 resolvable from /tmp/whoop-render (test-only, not a plugin
 * dependency); skips cleanly when that environment is absent.
 *
 * Usage: node scripts/test-render.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const renderEnv = '/tmp/whoop-render';
const requireFromRenderEnv = createRequire(join(renderEnv, 'package.json'));
let React;
let ReactDOMServer;
try {
  React = requireFromRenderEnv('react');
  ReactDOMServer = requireFromRenderEnv('react-dom/server');
} catch {
  console.log('test-render: React test environment missing at /tmp/whoop-render; skipping.');
  process.exit(0);
}

const bundlePath = join(root, 'lib/client.js');
if (!existsSync(bundlePath)) {
  console.error('test-render: lib/client.js is missing; run node scripts/build-client.mjs first.');
  process.exit(1);
}

/** Evaluate the browser bundle and capture its module factory. */
function loadBundle() {
  let captured;
  const fakeWindow = {
    __ModuleLoader__: {
      load(spec) {
        captured = spec;
      },
    },
  };
  const factorySource = readFileSync(bundlePath, 'utf8');
  // eslint-disable-next-line no-new-func
  new Function('window', factorySource)(fakeWindow);
  if (!captured || typeof captured.factory !== 'function') {
    throw new Error('bundle did not register a factory on window.__ModuleLoader__');
  }
  const moduleExports = captured.factory((specifier) => {
    if (specifier === 'react') return React;
    throw new Error(`unexpected require(${JSON.stringify(specifier)}) in client bundle`);
  });
  return moduleExports;
}

function assert(condition, message) {
  if (!condition) throw new Error(`assertion failed: ${message}`);
}

function renderText(Component, props) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props));
}

const moduleExports = loadBundle();
assert(typeof moduleExports.apply === 'function', 'client bundle exports apply()');
assert(Array.isArray(moduleExports.inject), 'client bundle exports inject[]');
assert(moduleExports.__test && typeof moduleExports.__test === 'object', 'client bundle exposes __test');

const contribution = moduleExports.__test.remoteContribution();
assert(contribution && contribution.package === 'dsh-whoop-easy-connect', 'remote contribution package name');
const method = contribution.descriptors[0];
assert(method && method.namespace === 'whoop' && method.method === 'request', 'remote descriptor endpoint');
assert(method.parameters[0].wire === 'request', 'remote descriptor parameter wire');
assert(method.parameters[0].codec.mode === 'strict', 'remote descriptor strict codec');

const { demoSnapshot } = await import('../lib/demo-data.js');
const demo = demoSnapshot({ days: 30, now: new Date('2026-10-25T10:00:00+08:00') });
const liveSnapshot = { mode: 'live', updatedAt: '2026-10-25T02:00:00.000Z', ...demo };
const unboundSnapshot = { mode: 'demo', updatedAt: '2026-10-25T02:00:00.000Z', ...demo };

const language = moduleExports.__test.language();
const whoopUI = moduleExports.__test.whoopUI();
assert(whoopUI && typeof whoopUI.openSettings === 'function', 'WHOOP_UI bridge is exposed');
assert(whoopUI.openSettings() === false, 'WHOOP_UI.openSettings reports false before settings launcher is mounted');
const Dashboard = moduleExports.__test.Dashboard();
const SettingsSection = moduleExports.__test.SettingsSection();
assert(typeof Dashboard === 'function', 'WHOOP.Dashboard is a component');
assert(typeof SettingsSection === 'function', 'WHOOP.SettingsSection is a component');

const fakeStatus = {
  connected: false,
  mode: 'demo',
  profile: null,
  expiresAt: null,
  pending: false,
  loginUrl: null,
  lastError: null,
  demoMode: true,
  configured: {
    clientId: '',
    clientSecretSaved: false,
    redirectUri: 'https://localhost:8443/whoop/oauth/callback',
    callbackPath: '/whoop/oauth/callback',
    localCallbackPort: 8443,
    dataDir: '/tmp/whoop-test-state',
    demoMode: true,
  },
};

const reports = [];
for (const lang of ['zh', 'en']) {
  language.set(lang);
  const liveHtml = renderText(Dashboard, { initialSnapshot: liveSnapshot });
  const unboundHtml = renderText(Dashboard, { initialSnapshot: unboundSnapshot });
  const settingsHtml = renderText(SettingsSection, { initialStatus: fakeStatus });
  assert(liveHtml.length > 20000, `live dashboard renders meaningful markup (${lang}, got ${liveHtml.length} chars)`);
  assert(unboundHtml.length > 300 && unboundHtml.length < 6000, `unbound dashboard is a minimal fallback (${lang}, got ${unboundHtml.length} chars)`);
  assert(settingsHtml.length > 1000, `onboarding settings renders meaningful markup (${lang}, got ${settingsHtml.length} chars)`);
  assert(!/NaN/.test(liveHtml + settingsHtml + unboundHtml), `no NaN text (${lang})`);
  const unboundText = unboundHtml.replace(/<[^>]*>/g, ' ');
  assert(/还没有绑定|No WHOOP account/.test(unboundText), `unbound fallback copy present (${lang})`);
  assert(!/演示数据|Demo data/i.test(unboundText), `unbound fallback hides demo copy (${lang})`);
  const settingsText = settingsHtml.replace(/<[^>]*>/g, ' ');
  assert(/第一步|Step 1/.test(settingsText), `settings onboarding starts with step 1 (${lang})`);
  assert(/第四步|Step 4/.test(settingsText), `settings onboarding includes the bind step (${lang})`);
  assert(!/手动绑定|manual token/i.test(settingsText), `manual token binding is gone (${lang})`);
  assert(!/演示模式|Demo mode/i.test(settingsText), `demo-mode hint is gone (${lang})`);
  reports.push({ lang, live: liveHtml.length, unbound: unboundHtml.length, settings: settingsHtml.length });
}

language.set('zh');
const zhDashboard = renderText(Dashboard, { initialSnapshot: liveSnapshot });
language.set('en');
const enDashboard = renderText(Dashboard, { initialSnapshot: liveSnapshot });
assert(zhDashboard !== enDashboard, 'dashboard output follows the language switch');

// --- slot wiring components: sidebar icon + crash boundary wrappers ---
const PanelIcon = moduleExports.__test.panelIcon();
for (const size of [16, 18]) {
  for (const active of [false, true]) {
    const iconHtml = renderText(PanelIcon, { size, active });
    assert(/<svg[^>]*width="\d+"/.test(iconHtml), `panel icon renders as svg (${size}/${active})`);
    assert(iconHtml.includes('currentColor'), 'panel icon inherits currentColor');
  }
}
const BoundedDashboard = moduleExports.__test.boundedDashboard();
const BoundedSettings = moduleExports.__test.boundedSettings();
language.set('zh');
assert(renderText(BoundedDashboard, { initialSnapshot: liveSnapshot }).length > 20000, 'bounded dashboard renders');
assert(renderText(BoundedSettings, { initialStatus: fakeStatus }).length > 1000, 'bounded settings renders');

// --- sparse / partial data must degrade to em-dashes, never crash or show NaN ---
const dates = [];
for (let offset = 29; offset >= 0; offset -= 1) {
  const day = new Date(Date.UTC(2026, 9, 25));
  day.setUTCDate(day.getUTCDate() - offset);
  dates.push(day.toISOString().slice(0, 10));
}
const sparseDays = dates.map((date, index) => ({
  date,
  recovery: index % 3 === 0 ? null : { score: null, hrv: null, rhr: null, spo2: null, skinTemp: null, calibrating: true, state: 'PENDING_SCORE' },
  cycle: null,
  sleep: null,
}));
const sparseSnapshot = {
  mode: 'live',
  updatedAt: '2026-10-25T04:00:00.000Z',
  range: { start: `${dates[0]}T00:00:00.000Z`, end: '2026-10-25T04:00:00.000Z', days: 30 },
  profile: null,
  body: null,
  today: { date: dates[dates.length - 1], recovery: null, cycle: null, sleep: null },
  days: sparseDays,
  workouts: [],
  warnings: ['recovery', 'sleep'],
};
for (const lang of ['zh', 'en']) {
  language.set(lang);
  const sparseHtml = renderText(Dashboard, { initialSnapshot: sparseSnapshot });
  assert(sparseHtml.length > 2000, `sparse dashboard still renders (${lang})`);
  assert(!/NaN/.test(sparseHtml), `sparse dashboard has no NaN (${lang})`);
  assert(!/undefined/.test(sparseHtml.replace(/<[^>]*>/g, ' ')), `sparse dashboard has no undefined text (${lang})`);
}

// --- connected settings state must render the management actions ---
const connectedStatus = {
  connected: true,
  mode: 'live',
  profile: { firstName: 'Alex', lastName: 'Chen', email: 'alex.chen@example.com', userId: 1000001 },
  expiresAt: '2026-10-25T05:00:00.000Z',
  pending: false,
  loginUrl: null,
  lastError: null,
  demoMode: true,
  configured: {
    clientId: 'test-client-id',
    clientSecretSaved: true,
    redirectUri: 'https://localhost:8443/whoop/oauth/callback',
    callbackPath: '/whoop/oauth/callback',
    localCallbackPort: 8443,
    dataDir: '/tmp/whoop-test-state',
    demoMode: true,
  },
};
for (const lang of ['zh', 'en']) {
  language.set(lang);
  const connectedHtml = renderText(SettingsSection, { initialStatus: connectedStatus });
  assert(connectedHtml.length > 500, `connected settings renders (${lang})`);
  assert(!/NaN/.test(connectedHtml), `connected settings has no NaN (${lang})`);
  const connectedText = connectedHtml.replace(/<[^>]*>/g, ' ');
  assert(/Alex Chen|重新授权|Re-authorize/.test(connectedText), `connected settings shows account actions (${lang})`);
  assert(!/第一步|Step 1/.test(connectedText), `connected settings hides the onboarding steps (${lang})`);
}

language.set('zh');
console.log('test-render: OK', JSON.stringify(reports));
