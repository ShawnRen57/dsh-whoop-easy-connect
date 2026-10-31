#!/usr/bin/env node
/**
 * Build the browser bundle `lib/client.js` from the plain-JavaScript client
 * fragments in `src/client/`.
 *
 * The DSH web client loads a plugin bundle through
 * `window.__ModuleLoader__.load({ id, factory(require) })`. Everything inside
 * the factory shares one function scope, so the fragments communicate through
 * the `WHOOP` namespace object, `React`, and `h` (React.createElement).
 *
 * Build order matters:
 *   api.js        — remote RPC facade (`WHOOP_API`)
 *   i18n.js       — dictionaries + language store (`WHOOP_I18N`, `WHOOP_LANG`, `WHOOP_T`)
 *   format.js     — number/date formatting helpers (`WHOOP_FMT`)
 *   charts.js     — pure-SVG chart components (`WHOOP_CHARTS`)
 *   dashboard.js  — the main dashboard page (`WHOOP.Dashboard`)
 *   settings-i18n.js — account-settings copy merged into the dictionaries
 *   settings.js   — the WHOOP account settings section (`WHOOP.SettingsSection`)
 *   shell.js      — plugin exports, slot registrations, remote contribution
 *
 * Usage: node scripts/build-client.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

const PACKAGE_NAME = 'dsh-whoop-easy-connect';

const FRAGMENTS = [
  'src/client/api.js',
  'src/client/i18n.js',
  'src/client/format.js',
  'src/client/charts.js',
  'src/client/dashboard.js',
  'src/client/settings-i18n.js',
  'src/client/settings.js',
  'src/client/shell.js',
];

const css = JSON.stringify(read('src/client/styles.css'));
const settingsCss = JSON.stringify(read('src/client/settings.css'));

const body = FRAGMENTS.map((rel) => `// ---- ${rel} ----\n${read(rel)}`).join('\n');

const output = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PACKAGE_NAME)},
  factory(require) {
    var React = require('react');
    var h = React.createElement;
    var module = { exports: {} };
    var exports = module.exports;
    var WHOOP_CSS = ${css};
    var WHOOP_SETTINGS_CSS = ${settingsCss};
${body}
    return module.exports;
  },
});
`;

const target = join(root, 'lib/client.js');
writeFileSync(target, output);
const size = statSync(target).size;
console.log(`built ${target} (${(size / 1024).toFixed(1)} KiB, ${FRAGMENTS.length} fragments)`);
