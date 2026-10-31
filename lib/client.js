window.__ModuleLoader__.load({
  id: "dsh-whoop-easy-connect",
  factory(require) {
    var React = require('react');
    var h = React.createElement;
    var module = { exports: {} };
    var exports = module.exports;
    var WHOOP_CSS = "/* styles.css — WHOOP health dashboard visual system. Injected globally by shell.js from WHOOP_CSS. Every\n * selector is scoped under .wh-root except the two documented exceptions: the macOS top-clearance rule for\n * the sticky page heading and `body[data-ds-dark-theme]` overrides for the few literal accent colors.\n * Surfaces/text/borders come from --dsw-alias-* tokens with literal fallbacks; metric accents are fixed\n * artwork colors. No @import, no external URLs, no element selectors outside .wh-root. */\n\n/* Theme tokens */\n.wh-root {\n  --wh-page-pad: 24px; --wh-bg: var(--dsw-alias-bg-base, #f7f8fa); --wh-card: var(--dsw-alias-bg-layer-1, #ffffff);\n  --wh-card-2: var(--dsw-alias-bg-layer-2, #f3f4f7); --wh-border: var(--dsw-alias-border-l1, #ececf1);\n  --wh-border-strong: var(--dsw-alias-border-l2, #dfe2e9); --wh-text: var(--dsw-alias-label-primary, #1f2329);\n  --wh-text-2: var(--dsw-alias-label-secondary, #7b8494);\n  --wh-hover: var(--dsw-alias-interactive-bg-hover, rgba(15, 23, 42, 0.055));\n  --wh-brand: var(--dsw-alias-brand-primary, #4d6bfe); --wh-recovery: #16a34a; --wh-strain: #0ea5b7;\n  --wh-sleep: #6366f1; --wh-sleep-soft: #a5b4fc; --wh-warn: #e0a008; --wh-danger: #ef4444; --wh-muted: #94a3b8;\n  --wh-stage-light: #93c5fd; --wh-stage-deep: #4338ca; --wh-stage-rem: #a78bfa; --wh-stage-awake: #fbbf24;\n  --wh-stage-nodata: #d1d5db; --wh-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 30px rgba(15, 23, 42, 0.05);\n  --wh-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04); box-sizing: border-box; height: 100%; overflow-y: auto;\n  overflow-x: hidden; background: var(--wh-bg); color: var(--wh-text); -webkit-font-smoothing: antialiased;\n  text-rendering: optimizeLegibility;\n}\n.wh-root *,\n.wh-root *::before,\n.wh-root *::after { box-sizing: border-box }\n\n/* Page frame */\n.wh-root .wh-page { max-width: 1080px; margin: 0 auto; padding: 0 var(--wh-page-pad) 48px }\n\n/* Sticky header — controls (language / refresh) live top-right as required. */\n.wh-root .wh-topbar {\n  position: sticky; top: 0; z-index: 20; margin: 0 calc(var(--wh-page-pad) * -1); padding: 14px var(--wh-page-pad) 10px;\n  background: var(--wh-bg);\n}\n.wh-root .wh-topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px }\n.wh-root .wh-heading { min-width: 0 }\n.wh-root .wh-heading-row { display: flex; align-items: center; gap: 8px; min-width: 0 }\n.wh-root .wh-title { margin: 0; font-size: 21px; line-height: 1.2; font-weight: 650; letter-spacing: -0.015em; white-space: nowrap }\n.wh-root .wh-heading-meta { display: flex; align-items: baseline; gap: 10px; margin-top: 3px; min-width: 0 }\n.wh-root .wh-subtitle { font-size: 12.5px; color: var(--wh-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }\n.wh-root .wh-live {\n  display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--wh-text-2);\n  font-variant-numeric: tabular-nums; white-space: nowrap;\n}\n.wh-root .wh-live::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.55; flex: none }\n.wh-root .wh-controls { display: flex; align-items: center; gap: 8px; flex: none }\n\n/* Buttons, badge, chip, segmented control */\n.wh-root .wh-btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; padding: 0 12px;\n  border: 1px solid var(--wh-border); border-radius: 10px; background: var(--wh-card); color: var(--wh-text);\n  font: inherit; font-size: 12.5px; font-weight: 550; line-height: 1; cursor: pointer;\n  transition: background 0.15s ease, border-color 0.15s ease, transform 0.06s ease;\n}\n.wh-root .wh-btn:hover:not(:disabled) { background: var(--wh-hover) }\n.wh-root .wh-btn:active:not(:disabled) { transform: translateY(1px) }\n.wh-root .wh-btn:focus-visible { outline: 2px solid var(--wh-brand); outline-offset: 2px }\n.wh-root .wh-btn:disabled { opacity: 0.55; cursor: default }\n.wh-root .wh-btn--icon { width: 34px; padding: 0 }\n.wh-root .wh-btn--primary {\n  background: var(--dsw-alias-button-primary-fill, var(--wh-brand));\n  border-color: var(--dsw-alias-button-primary-fill, var(--wh-brand));\n  color: var(--dsw-alias-label-primary-foreground, #fff);\n}\n.wh-root .wh-btn--primary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover, var(--wh-brand));\n  border-color: var(--dsw-alias-button-primary-hover, var(--wh-brand));\n  filter: brightness(1.03);\n}\n.wh-root .wh-btn--ghost { background: transparent; border-color: transparent }\n.wh-root .wh-lang-btn { letter-spacing: 0.02em }\n.wh-root .wh-lang-mark { font-size: 12px; font-weight: 650; letter-spacing: 0.02em }\n.wh-root .wh-glyph { display: block; flex: none }\n.wh-root .wh-spinner {\n  width: 14px; height: 14px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent;\n  opacity: 0.7; animation: wh-spin 0.8s linear infinite;\n}\n.wh-root .wh-chip {\n  display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px;\n  background: var(--wh-card-2); color: var(--wh-text-2); font-size: 11.5px; font-weight: 550; white-space: nowrap;\n}\n.wh-root .wh-seg { display: inline-flex; padding: 2px; border: 1px solid var(--wh-border); border-radius: 9px; background: var(--wh-card-2) }\n.wh-root .wh-seg-btn {\n  height: 26px; padding: 0 10px; border: 0; border-radius: 7px; background: transparent; color: var(--wh-text-2);\n  font: inherit; font-size: 11.5px; font-weight: 600; cursor: pointer;\n}\n.wh-root .wh-seg-btn:hover { color: var(--wh-text) }\n.wh-root .wh-seg-btn.is-active { background: var(--wh-card); color: var(--wh-text); box-shadow: var(--wh-shadow-sm) }\n.wh-root .wh-seg-btn:focus-visible { outline: 2px solid var(--wh-brand); outline-offset: 1px }\n\n/* Unbound fallback — minimal: WHOOP mark + title + one line + settings CTA */\n.wh-root .wh-unbound {\n  display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 46vh;\n  max-width: 420px; margin: 0 auto; padding: 48px 20px 64px; text-align: center;\n}\n.wh-root .wh-unbound-mark {\n  display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%;\n  color: var(--wh-brand); background: rgba(77, 107, 254, 0.1); box-shadow: 0 6px 20px rgba(77, 107, 254, 0.12);\n}\n.wh-root .wh-whoop-mark { display: block }\n.wh-root .wh-unbound-title { margin: 18px 0 0; font-size: 19px; font-weight: 650; letter-spacing: -0.01em }\n.wh-root .wh-unbound-body { margin: 8px 0 0; max-width: 360px; font-size: 13px; line-height: 1.6; color: var(--wh-text-2) }\n.wh-root .wh-unbound-action { margin-top: 22px }\n.wh-root .wh-unbound-btn { height: 38px; padding: 0 18px; border-radius: 12px; font-size: 13px }\n.wh-root .wh-unbound-hint {\n  margin: 14px 0 0; max-width: 360px; font-size: 11.5px; line-height: 1.55; color: var(--wh-text-2);\n}\n\n/* Cards + section headings */\n.wh-root .wh-section { margin-top: 30px }\n.wh-root .wh-section-head {\n  display: flex; align-items: flex-end; justify-content: space-between; gap: 12px 16px; margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n.wh-root .wh-section-head-text { min-width: 0 }\n.wh-root .wh-section-title { margin: 0; font-size: 15.5px; font-weight: 650; letter-spacing: -0.01em }\n.wh-root .wh-section-sub { margin: 3px 0 0; font-size: 12px; color: var(--wh-text-2) }\n.wh-root .wh-section-head-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap }\n.wh-root .wh-card { background: var(--wh-card); border: 1px solid var(--wh-border); border-radius: 18px; box-shadow: var(--wh-shadow-sm) }\n\n/* 1. Hero — three WHOOP-style score rings */\n.wh-root .wh-hero { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 20px }\n.wh-root .wh-hero-card {\n  position: relative; overflow: hidden; min-width: 0; padding: 16px 18px 18px; border: 1px solid var(--wh-border);\n  border-radius: 20px; background: var(--wh-card); box-shadow: var(--wh-shadow);\n}\n.wh-root .wh-hero-card::before { content: ''; position: absolute; inset: -55% -25% auto; height: 85%; pointer-events: none; border-radius: 50% }\n.wh-root .wh-hero-card--recovery::before { background: radial-gradient(closest-side, rgba(22, 163, 74, 0.17), transparent) }\n.wh-root .wh-hero-card--strain::before { background: radial-gradient(closest-side, rgba(14, 165, 183, 0.17), transparent) }\n.wh-root .wh-hero-card--sleep::before { background: radial-gradient(closest-side, rgba(99, 102, 241, 0.2), transparent) }\n.wh-root .wh-hero-head { position: relative; display: flex; align-items: center; gap: 7px; min-width: 0 }\n.wh-root .wh-hero-dot { width: 7px; height: 7px; border-radius: 50%; flex: none }\n.wh-root .wh-hero-label { font-size: 12.5px; font-weight: 600; letter-spacing: 0.01em; white-space: nowrap }\n.wh-root .wh-hero-verdict {\n  margin-left: auto; font-size: 11px; color: var(--wh-text-2); white-space: nowrap; overflow: hidden;\n  text-overflow: ellipsis;\n}\n.wh-root .wh-hero-verdict.is-empty { opacity: 0.75 }\n.wh-root .wh-hero-ring { position: relative; display: flex; justify-content: center; margin: 8px 0 2px }\n.wh-root .wh-hero-note { position: relative; margin: 2px 0 0; text-align: center; font-size: 11px; color: var(--wh-warn) }\n.wh-root .wh-hero-subs {\n  position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 12px;\n  padding-top: 12px; border-top: 1px solid var(--wh-border);\n}\n.wh-root .wh-submetric { display: flex; flex-direction: column; gap: 2px; min-width: 0 }\n.wh-root .wh-submetric-label { font-size: 10.5px; color: var(--wh-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }\n.wh-root .wh-submetric-value {\n  font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* Score ring */\n.wh-root .wh-ring { position: relative; width: var(--wh-ring-size, 156px); height: var(--wh-ring-size, 156px); flex: none }\n.wh-root .wh-ring-svg { display: block; width: 100%; height: 100% }\n.wh-root .wh-ring-track { stroke: var(--wh-border-strong); opacity: 0.7 }\n.wh-root .wh-ring-value {\n  stroke: var(--wh-ring-color, var(--wh-strain)); filter: drop-shadow(0 0 6px var(--wh-ring-color, transparent));\n  transition: stroke-dashoffset 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);\n}\n.wh-root .wh-ring-center {\n  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;\n  gap: 2px; pointer-events: none;\n}\n.wh-root .wh-ring-num {\n  font-size: calc(var(--wh-ring-size, 156px) * 0.27); line-height: 1; font-weight: 650; letter-spacing: -0.03em;\n  font-variant-numeric: tabular-nums;\n}\n.wh-root .wh-ring-cap { font-size: 11.5px; font-weight: 550; letter-spacing: 0.02em; color: var(--wh-text-2) }\n.wh-root .wh-ring--empty .wh-ring-num { color: var(--wh-text-2); font-weight: 550 }\n\n/* 2. Today's metric grid */\n.wh-root .wh-metrics { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 10px }\n.wh-root .wh-metric {\n  min-width: 0; padding: 12px 14px 10px; border: 1px solid var(--wh-border); border-radius: 14px;\n  background: var(--wh-card); box-shadow: var(--wh-shadow-sm);\n}\n.wh-root .wh-metric-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px }\n.wh-root .wh-metric-label { font-size: 11.5px; font-weight: 550; color: var(--wh-text-2) }\n.wh-root .wh-metric-body { display: flex; align-items: baseline; gap: 3px; margin-top: 6px; min-width: 0 }\n.wh-root .wh-metric-value {\n  font-size: 25px; line-height: 1.05; font-weight: 650; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n.wh-root .wh-metric-value--empty { color: var(--wh-text-2); font-weight: 500 }\n.wh-root .wh-metric-unit { font-size: 11.5px; color: var(--wh-text-2); white-space: nowrap }\n.wh-root .wh-metric-spark { margin-top: 8px }\n.wh-root .wh-sparkline { display: block; width: 100% }\n\n/* 3. Trend charts */\n.wh-root .wh-charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px }\n.wh-root .wh-chart-card { padding: 16px 18px 12px }\n.wh-root .wh-chart-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px }\n.wh-root .wh-chart-head-text { min-width: 0 }\n.wh-root .wh-chart-title { margin: 0; font-size: 13.5px; font-weight: 650 }\n.wh-root .wh-chart-sub { margin: 2px 0 0; font-size: 11.5px; color: var(--wh-text-2) }\n.wh-root .wh-chart-avg {\n  flex: none; padding: 3px 8px; border-radius: 999px; background: var(--wh-card-2); color: var(--wh-text-2);\n  font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap;\n}\n.wh-root .wh-chart-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 8px; font-size: 11px; color: var(--wh-text-2) }\n.wh-root .wh-legend-item { display: inline-flex; align-items: center; gap: 5px }\n.wh-root .wh-legend-dot { width: 7px; height: 7px; border-radius: 2px; flex: none }\n.wh-root .wh-chart-body { margin-top: 6px }\n.wh-root .wh-chart { position: relative }\n.wh-root .wh-chart-svg { display: block; width: 100%; height: auto; touch-action: pan-y }\n.wh-root .wh-chart-axis { fill: var(--wh-text-2); font-size: 10.5px; font-family: inherit }\n.wh-root .wh-chart-grid { stroke: var(--wh-border); stroke-width: 1 }\n.wh-root .wh-chart-cross { stroke: var(--wh-text-2); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.55 }\n.wh-root .wh-chart-hover-dot { stroke: var(--wh-card); stroke-width: 2 }\n.wh-root .wh-chart-bar { opacity: 0.85; transition: opacity 0.12s ease }\n.wh-root .wh-chart-bar.is-hover { opacity: 1 }\n.wh-root .wh-chart-empty {\n  display: flex; align-items: center; justify-content: center; min-height: 140px; border-radius: 12px;\n  background: var(--wh-card-2); color: var(--wh-text-2); font-size: 12px;\n}\n.wh-root .wh-chart-tip {\n  position: absolute; top: 2px; transform: translateX(-50%); z-index: 3; min-width: 118px; padding: 7px 10px;\n  border: 1px solid var(--wh-border-strong); border-radius: 10px; background: var(--wh-card);\n  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12); font-size: 11.5px; pointer-events: none;\n}\n.wh-root .wh-chart-tip-title { margin-bottom: 4px; font-weight: 600 }\n.wh-root .wh-chart-tip-row { display: flex; align-items: center; gap: 6px; line-height: 1.5 }\n.wh-root .wh-chart-tip-dot { width: 6px; height: 6px; border-radius: 50%; flex: none }\n.wh-root .wh-chart-tip-label { color: var(--wh-text-2) }\n.wh-root .wh-chart-tip-value { margin-left: auto; padding-left: 10px; font-weight: 600; font-variant-numeric: tabular-nums }\n\n/* 4. Sleep detail */\n.wh-root .wh-sleep-card { padding: 16px 18px }\n.wh-root .wh-sleep-stages { min-width: 0 }\n.wh-root .wh-sleep-stages-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px }\n.wh-root .wh-sleep-label { margin: 0; font-size: 12.5px; font-weight: 650 }\n.wh-root .wh-sleep-meta { font-size: 11.5px; color: var(--wh-text-2); font-variant-numeric: tabular-nums }\n.wh-root .wh-stage-bar-wrap { margin: 10px 0 12px }\n.wh-root .wh-stage-bar { display: block; width: 100% }\n.wh-root .wh-stage-bar--empty { height: 16px; border-radius: 8px; background: var(--wh-card-2) }\n.wh-root .wh-stage-legend { display: flex; flex-wrap: wrap; gap: 8px 16px }\n.wh-root .wh-stage-legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--wh-text-2) }\n.wh-root .wh-stage-dot { width: 8px; height: 8px; border-radius: 2px; flex: none }\n.wh-root .wh-stage-legend-label { white-space: nowrap }\n.wh-root .wh-stage-legend-value { color: var(--wh-text); font-weight: 600; font-variant-numeric: tabular-nums }\n.wh-root .wh-sleep-compare {\n  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 22px; margin-top: 18px; padding-top: 16px;\n  border-top: 1px solid var(--wh-border);\n}\n.wh-root .wh-compare-row { min-width: 0 }\n.wh-root .wh-compare-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 6px }\n.wh-root .wh-compare-label { font-size: 11.5px; color: var(--wh-text-2) }\n.wh-root .wh-compare-value { font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums }\n.wh-root .wh-meter { height: 7px; border-radius: 999px; background: var(--wh-card-2); overflow: hidden }\n.wh-root .wh-meter-fill { display: block; height: 100%; border-radius: 999px; opacity: 0.9 }\n.wh-root .wh-meter-fill.is-muted { opacity: 0.42 }\n.wh-root .wh-sleep-stats {\n  display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 12px 16px; margin-top: 18px;\n  padding-top: 16px; border-top: 1px solid var(--wh-border);\n}\n.wh-root .wh-sleep-stat { display: flex; flex-direction: column; gap: 2px; min-width: 0 }\n.wh-root .wh-sleep-stat-label { font-size: 11px; color: var(--wh-text-2) }\n.wh-root .wh-sleep-stat-value { font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap }\n\n/* 5. Workouts */\n.wh-root .wh-workouts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px }\n.wh-root .wh-workout {\n  display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--wh-border);\n  border-radius: 16px; background: var(--wh-card); box-shadow: var(--wh-shadow-sm);\n}\n.wh-root .wh-workout-icon {\n  display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex: none;\n  border: 1px solid rgba(14, 165, 183, 0.18); border-radius: 12px; background: rgba(14, 165, 183, 0.1);\n  color: var(--wh-strain);\n}\n.wh-root .wh-sport-icon { display: block }\n.wh-root .wh-workout-main { flex: 1 1 auto; min-width: 0 }\n.wh-root .wh-workout-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap }\n.wh-root .wh-workout-name { font-size: 13.5px; font-weight: 650 }\n.wh-root .wh-workout-date { font-size: 11.5px; color: var(--wh-text-2) }\n.wh-root .wh-workout-meta {\n  display: flex; flex-wrap: wrap; align-items: center; gap: 2px 14px; margin-top: 5px; font-size: 11.5px;\n  color: var(--wh-text-2);\n}\n.wh-root .wh-meta-item { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap }\n.wh-root .wh-workout-zones { margin-top: 9px }\n.wh-root .wh-workout-strain { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex: none; padding-left: 6px }\n.wh-root .wh-workout-strain-value {\n  font-size: 20px; line-height: 1.1; font-weight: 650; font-variant-numeric: tabular-nums; color: var(--wh-strain);\n}\n.wh-root .wh-workout-strain-value.is-empty { color: var(--wh-text-2) }\n.wh-root .wh-workout-strain-label { font-size: 10.5px; color: var(--wh-text-2) }\n\n/* 6. Body & profile */\n.wh-root .wh-body-card { padding: 18px 20px }\n.wh-root .wh-profile { display: flex; align-items: center; gap: 14px }\n.wh-root .wh-avatar {\n  display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; flex: none;\n  border-radius: 50%; background: linear-gradient(135deg, #0ea5b7, #6366f1); color: #fff; font-size: 15px;\n  font-weight: 650; letter-spacing: 0.02em;\n}\n.wh-root .wh-profile-text { min-width: 0 }\n.wh-root .wh-profile-name { font-size: 15px; font-weight: 650 }\n.wh-root .wh-profile-email { margin-top: 2px; font-size: 12px; color: var(--wh-text-2); word-break: break-all }\n.wh-root .wh-body-stats {\n  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 16px; padding-top: 16px;\n  border-top: 1px solid var(--wh-border);\n}\n.wh-root .wh-body-stat { display: flex; flex-direction: column; gap: 2px; min-width: 0 }\n.wh-root .wh-body-stat-label { font-size: 11px; color: var(--wh-text-2) }\n.wh-root .wh-body-stat-value { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap }\n.wh-root .wh-footnote { margin: 16px 0 0; font-size: 11px; color: var(--wh-text-2) }\n\n/* Empty notes */\n.wh-root .wh-empty { display: flex; align-items: flex-start; gap: 10px; padding: 6px 2px }\n.wh-root .wh-empty-icon { flex: none; margin-top: 1px; color: var(--wh-text-2) }\n.wh-root .wh-empty-text { min-width: 0 }\n.wh-root .wh-empty-title { margin: 0; font-size: 13px; font-weight: 600 }\n.wh-root .wh-empty-body { margin: 3px 0 0; font-size: 12px; line-height: 1.55; color: var(--wh-text-2) }\n\n/* Loading skeleton */\n.wh-root .wh-loading { margin-top: 20px }\n.wh-root .wh-skel { position: relative; overflow: hidden; background: var(--wh-card-2); border-radius: 10px }\n.wh-root .wh-skel::after {\n  content: ''; position: absolute; inset: 0; transform: translateX(-100%);\n  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);\n  animation: wh-shimmer 1.4s ease-in-out infinite;\n}\n.wh-root .wh-skel-hero { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px }\n.wh-root .wh-skel-hero-card {\n  display: flex; flex-direction: column; align-items: center; gap: 12px; height: 258px; padding: 20px 18px;\n  border: 1px solid var(--wh-border); border-radius: 20px; background: var(--wh-card);\n}\n.wh-root .wh-skel-hero-card::after { display: none }\n.wh-root .wh-skel-ring { width: 132px; height: 132px; border-radius: 50% }\n.wh-root .wh-skel-line { height: 12px; border-radius: 6px }\n.wh-root .wh-skel-line--value { height: 22px }\n.wh-root .wh-skel-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px }\n.wh-root .wh-skel-metric {\n  display: flex; flex-direction: column; gap: 12px; height: 92px; padding: 14px; border-radius: 14px;\n  background: var(--wh-card); border: 1px solid var(--wh-border);\n}\n.wh-root .wh-skel-metric::after { display: none }\n.wh-root .wh-skel-charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px }\n.wh-root .wh-skel-chart { height: 230px; border-radius: 18px }\n.wh-root .wh-loading-hint { margin-top: 16px; text-align: center; font-size: 12px; color: var(--wh-text-2) }\n\n/* Full-page states (not connected / config / transport errors / empty) */\n.wh-root .wh-state { margin: 44px auto 0; max-width: 520px }\n.wh-root .wh-state-card {\n  padding: 36px 28px; border: 1px solid var(--wh-border); border-radius: 20px; background: var(--wh-card);\n  box-shadow: var(--wh-shadow); text-align: center;\n}\n.wh-root .wh-state-icon {\n  display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; margin-bottom: 14px;\n  border-radius: 50%; background: rgba(77, 107, 254, 0.1); color: var(--wh-brand);\n}\n.wh-root .wh-state-icon--warn { background: rgba(224, 160, 8, 0.12); color: var(--wh-warn) }\n.wh-root .wh-state-icon--danger { background: rgba(239, 68, 68, 0.1); color: var(--wh-danger) }\n.wh-root .wh-state-icon--muted { background: var(--wh-card-2); color: var(--wh-text-2) }\n.wh-root .wh-state-title { margin: 0 0 8px; font-size: 17px; font-weight: 650; letter-spacing: -0.01em }\n.wh-root .wh-state-body { margin: 0 auto; max-width: 400px; font-size: 13px; line-height: 1.6; color: var(--wh-text-2) }\n.wh-root .wh-state-hint { margin: 8px auto 0; max-width: 400px; font-size: 12px; color: var(--wh-text-2) }\n.wh-root .wh-state-detail {\n  margin: 14px auto 0; max-width: 420px; padding: 8px 10px; border-radius: 8px; background: var(--wh-card-2);\n  color: var(--wh-text-2); font-size: 11px; line-height: 1.5; word-break: break-word;\n}\n.wh-root .wh-state-actions { display: flex; justify-content: center; margin-top: 20px }\n.wh-root .wh-inline-error {\n  display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding: 10px 14px;\n  border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; background: rgba(239, 68, 68, 0.07); font-size: 12px;\n}\n.wh-root .wh-inline-error-icon { flex: none; color: var(--wh-danger) }\n.wh-root .wh-inline-error-text { display: flex; flex-direction: column; gap: 1px; flex: 1 1 auto; min-width: 0 }\n.wh-root .wh-inline-error-title { font-weight: 600 }\n.wh-root .wh-inline-error-msg { font-size: 11px; color: var(--wh-text-2); word-break: break-word }\n\n/* Footer + screen-reader-only helper */\n.wh-root .wh-footer {\n  display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 32px; padding-top: 16px;\n  border-top: 1px solid var(--wh-border); font-size: 11px; color: var(--wh-text-2);\n}\n.wh-root .wh-footer-item { display: inline-flex; align-items: center; gap: 6px }\n.wh-root .wh-sr {\n  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0);\n  white-space: nowrap; border: 0;\n}\n\n/* macOS desktop: entry-page top clearance for the sticky heading */\n[data-platform='darwin'] .wh-root .wh-topbar { padding-top: calc(28px + var(--dsh-frame-top-clearance, 0px)) }\n\n/* Responsive: the main panel can be as narrow as ~380px */\n@media (max-width: 900px) {\n  .wh-root .wh-charts,\n  .wh-root .wh-skel-charts { grid-template-columns: minmax(0, 1fr) }\n}\n@media (max-width: 760px) {\n  .wh-root .wh-hero,\n  .wh-root .wh-skel-hero { grid-template-columns: minmax(0, 1fr) }\n  .wh-root .wh-hero-card { padding: 16px }\n  .wh-root .wh-skel-hero-card { height: 220px }\n  .wh-root .wh-skel-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)) }\n}\n@media (max-width: 620px) {\n  .wh-root { --wh-page-pad: 14px }\n  .wh-root .wh-title { font-size: 18px }\n  .wh-root .wh-btn-text { display: none }\n  .wh-root .wh-btn--refresh { width: 34px; padding: 0 }\n  .wh-root .wh-body-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) }\n  .wh-root .wh-sleep-compare { grid-template-columns: minmax(0, 1fr) }\n  .wh-root .wh-workout { align-items: flex-start; padding: 12px 14px; gap: 10px }\n  .wh-root .wh-workout-icon { width: 38px; height: 38px; border-radius: 10px }\n  .wh-root .wh-workout-strain-value { font-size: 17px }\n  .wh-root .wh-section { margin-top: 26px }\n  .wh-root .wh-unbound { min-height: 40vh; padding: 32px 16px 48px }\n}\n@media (max-width: 420px) {\n  .wh-root .wh-subtitle { display: none }\n  .wh-root .wh-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px }\n  .wh-root .wh-metric { padding: 11px 12px 9px }\n  .wh-root .wh-metric-value { font-size: 22px }\n  .wh-root .wh-sleep-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) }\n  .wh-root .wh-state-card { padding: 28px 20px }\n}\n\n/* Motion preferences */\n@media (prefers-reduced-motion: reduce) {\n  .wh-root .wh-spinner,\n  .wh-root .wh-skel::after { animation: none }\n  .wh-root .wh-ring-value,\n  .wh-root .wh-btn,\n  .wh-root .wh-chart-bar { transition: none }\n}\n\n/* Dark theme: the host sets body[data-ds-dark-theme]; adjust the literal accent/artwork colors and the few\n * hard-coded tints. */\nbody[data-ds-dark-theme] .wh-root {\n  --wh-bg: var(--dsw-alias-bg-base, #17191e); --wh-card: var(--dsw-alias-bg-layer-1, #202329);\n  --wh-card-2: var(--dsw-alias-bg-layer-2, #282c34); --wh-border: var(--dsw-alias-border-l1, #333842);\n  --wh-border-strong: var(--dsw-alias-border-l2, #41464f); --wh-text: var(--dsw-alias-label-primary, #eceef2);\n  --wh-text-2: var(--dsw-alias-label-secondary, #9aa3b2);\n  --wh-hover: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.06));\n  --wh-brand: var(--dsw-alias-brand-primary, #7d92ff); --wh-recovery: #22c55e; --wh-strain: #22b8cf;\n  --wh-sleep: #818cf8; --wh-sleep-soft: #6366f1; --wh-warn: #f0b429; --wh-danger: #f87171; --wh-muted: #7d8797;\n  --wh-stage-light: #3b82f6; --wh-stage-deep: #6366f1; --wh-stage-rem: #8b5cf6; --wh-stage-awake: #f59e0b;\n  --wh-stage-nodata: #4b5563; --wh-shadow: none; --wh-shadow-sm: none;\n}\nbody[data-ds-dark-theme] .wh-root .wh-hero-card--recovery::before {\n  background: radial-gradient(closest-side, rgba(34, 197, 94, 0.22), transparent);\n}\nbody[data-ds-dark-theme] .wh-root .wh-hero-card--strain::before { background: radial-gradient(closest-side, rgba(34, 184, 207, 0.22), transparent) }\nbody[data-ds-dark-theme] .wh-root .wh-hero-card--sleep::before { background: radial-gradient(closest-side, rgba(129, 140, 248, 0.26), transparent) }\nbody[data-ds-dark-theme] .wh-root .wh-unbound-mark { background: rgba(125, 146, 255, 0.16); box-shadow: none }\nbody[data-ds-dark-theme] .wh-root .wh-avatar { background: linear-gradient(135deg, #0e7490, #4338ca) }\nbody[data-ds-dark-theme] .wh-root .wh-workout-icon { background: rgba(34, 184, 207, 0.12); border-color: rgba(34, 184, 207, 0.24) }\nbody[data-ds-dark-theme] .wh-root .wh-skel::after { background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent) }\nbody[data-ds-dark-theme] .wh-root .wh-chart-tip { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) }\nbody[data-ds-dark-theme] .wh-root .wh-inline-error { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.25) }\nbody[data-ds-dark-theme] .wh-root .wh-state-icon { background: rgba(125, 146, 255, 0.14) }\n@keyframes wh-spin {\n  to { transform: rotate(360deg) }\n}\n@keyframes wh-shimmer {\n  100% { transform: translateX(100%) }\n}\n";
    var WHOOP_SETTINGS_CSS = "/**\n * WHOOP account settings section styles.\n *\n * Scoped under `.wps-root`; every selector is `.wps-` prefixed. Colors come\n * from the host theme tokens (with literal fallbacks) so light/dark themes\n * work without page-level overrides. The layout mirrors the shipped settings\n * sections and renders the four onboarding step cards from\n * docs/UX-REDESIGN.md §三.\n */\n\n/* ------------------------------------------------------------------ *\n * Page shell\n * ------------------------------------------------------------------ */\n\n.wps-root {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  width: 100%;\n  max-width: 640px;\n  color: var(--dsw-alias-label-primary, #1d2433);\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.wps-root *,\n.wps-root *::before,\n.wps-root *::after {\n  box-sizing: border-box;\n}\n\n.wps-head {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.wps-title {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n.wps-desc {\n  margin: 0;\n  font-size: 13px;\n  color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary, #9aa3b2));\n}\n\n/* ------------------------------------------------------------------ *\n * Cards\n * ------------------------------------------------------------------ */\n\n.wps-card {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 16px;\n  background: var(\n    --dsw-alias-settings-card-fill,\n    var(--dsw-alias-bg-layer-1, #ffffff)\n  );\n  border: 0.5px solid\n    var(--dsw-alias-settings-card-stroke, var(--dsw-alias-border-l1, #ececf1));\n  border-radius: var(--dsw-radius-xl, 16px);\n}\n\n.wps-step {\n  gap: 12px;\n}\n\n.wps-skeleton-card {\n  gap: 10px;\n}\n\n.wps-card--error {\n  border-color: rgba(214, 69, 69, 0.3);\n  border-color: color-mix(\n    in srgb,\n    var(--dsw-alias-state-error-primary, #d64545) 30%,\n    transparent\n  );\n}\n\n.wps-card-title {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n/* ------------------------------------------------------------------ *\n * Step cards\n * ------------------------------------------------------------------ */\n\n.wps-step-head {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\n.wps-step-index {\n  flex: 0 0 auto;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border: 0.5px solid rgba(79, 124, 255, 0.24);\n  border-radius: 50%;\n  background: rgba(79, 124, 255, 0.1);\n  background: color-mix(\n    in srgb,\n    var(--dsw-alias-brand-primary, #4f7cff) 11%,\n    transparent\n  );\n  color: var(--dsw-alias-brand-primary, #4f7cff);\n  font-size: 12px;\n  font-weight: 600;\n  line-height: 1;\n  font-variant-numeric: tabular-nums;\n}\n\n.wps-step-title {\n  margin: 0;\n  min-width: 0;\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 1.4;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n.wps-step-list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin: 0;\n  padding-left: 20px;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n  font-size: 12.5px;\n  line-height: 1.55;\n}\n\n.wps-step-list li::marker {\n  color: var(--dsw-alias-label-tertiary, #9aa3b2);\n}\n\n.wps-step-text {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.6;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n}\n\n.wps-step-actions {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  margin-top: 2px;\n}\n\n/* ------------------------------------------------------------------ *\n * Redirect URI + copy\n * ------------------------------------------------------------------ */\n\n.wps-redirect {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 10px 12px;\n  border: 0.5px solid var(--dsw-alias-border-l1, #ececf1);\n  border-radius: var(--dsw-radius-lg, 10px);\n  background: var(--dsw-alias-bg-layer-2, #f5f6f8);\n}\n\n.wps-redirect-label {\n  margin: 0;\n  font-size: 12px;\n  font-weight: 500;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n}\n\n.wps-copy-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n}\n\n.wps-redirect-value {\n  flex: 1 1 auto;\n  min-width: 0;\n  padding: 6px 8px;\n  border: 0.5px solid var(--dsw-alias-border-l1, #ececf1);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-base, #ffffff);\n  color: var(--dsw-alias-label-primary, #1d2433);\n  font-family: var(\n    --dsw-font-mono,\n    ui-monospace,\n    SFMono-Regular,\n    Menlo,\n    monospace\n  );\n  font-size: 12px;\n  line-height: 1.5;\n  overflow-wrap: anywhere;\n  user-select: text;\n}\n\n/* ------------------------------------------------------------------ *\n * Credentials\n * ------------------------------------------------------------------ */\n\n.wps-cred-grid {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n  gap: 10px;\n}\n\n.wps-field {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 0;\n}\n\n.wps-label {\n  font-size: 12.5px;\n  font-weight: 500;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n.wps-input {\n  width: 100%;\n  height: 34px;\n  padding: 0 10px;\n  border: 0.5px solid var(--dsw-alias-border-l2, #e3e6ec);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-base, #ffffff);\n  color: var(--dsw-alias-label-primary, #1d2433);\n  font: inherit;\n  font-size: 13px;\n}\n\n.wps-input::placeholder {\n  color: var(--dsw-alias-label-tertiary, #9aa3b2);\n}\n\n.wps-input[readonly] {\n  cursor: default;\n}\n\n.wps-input--editing {\n  border-color: var(--dsw-alias-brand-primary, #4f7cff);\n  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.12);\n}\n\n.wps-input[aria-invalid='true'] {\n  border-color: var(--dsw-alias-state-error-primary, #d64545);\n}\n\n.wps-cred-foot {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.wps-cred-foot .wps-hint {\n  flex: 1 1 220px;\n}\n\n/* ------------------------------------------------------------------ *\n * Hints\n * ------------------------------------------------------------------ */\n\n.wps-hint {\n  margin: 0;\n  font-size: 12.5px;\n  line-height: 1.55;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n}\n\n.wps-hint--warn {\n  color: var(--dsw-alias-state-warn-primary, #c47b0a);\n}\n\n.wps-hint-list {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin: 0;\n  padding-left: 18px;\n  color: var(--dsw-alias-state-warn-primary, #c47b0a);\n  font-size: 12.5px;\n  line-height: 1.55;\n}\n\n/* ------------------------------------------------------------------ *\n * Buttons\n * ------------------------------------------------------------------ */\n\n.wps-btn {\n  appearance: none;\n  display: inline-flex;\n  flex: 0 0 auto;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  height: 32px;\n  padding: 0 14px;\n  border: 0.5px solid transparent;\n  border-radius: var(--dsw-radius-lg, 10px);\n  font: inherit;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 20px;\n  cursor: pointer;\n  text-decoration: none;\n  white-space: nowrap;\n  transition:\n    background-color 0.16s ease,\n    border-color 0.16s ease,\n    opacity 0.16s ease;\n}\n\n.wps-btn--primary {\n  background: var(--dsw-alias-button-primary-fill, #0f1115);\n  border-color: var(--dsw-alias-button-primary-fill, #0f1115);\n  color: var(--dsw-alias-label-primary-foreground, #ffffff);\n}\n\n.wps-btn--primary,\n.wps-btn--primary:visited,\n.wps-btn--primary:hover {\n  color: var(--dsw-alias-label-primary-foreground, #ffffff);\n}\n\n.wps-btn--primary:not(:disabled):hover {\n  background: var(--dsw-alias-button-primary-hover, #61666b);\n  border-color: var(--dsw-alias-button-primary-hover, #61666b);\n}\n\n.wps-btn--ghost {\n  background: transparent;\n  border-color: var(--dsw-alias-border-l2, #e3e6ec);\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n.wps-btn--ghost:not(:disabled):hover {\n  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));\n}\n\n.wps-btn--danger {\n  background: transparent;\n  border-color: var(--dsw-alias-state-error-primary, #d64545);\n  color: var(--dsw-alias-state-error-primary, #d64545);\n}\n\n.wps-btn--danger:not(:disabled):hover {\n  background: rgba(214, 69, 69, 0.08);\n  background: color-mix(\n    in srgb,\n    var(--dsw-alias-state-error-primary, #d64545) 10%,\n    transparent\n  );\n}\n\n.wps-btn--small {\n  height: 28px;\n  padding: 0 10px;\n  border-radius: 8px;\n  font-size: 12px;\n}\n\n.wps-btn:disabled {\n  opacity: 0.55;\n  cursor: default;\n}\n\n.wps-btn:focus-visible,\n.wps-input:focus-visible,\n.wps-raw-details summary:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary, #4f7cff);\n  outline-offset: 2px;\n}\n\n.wps-input:focus-visible {\n  outline-offset: 1px;\n}\n\n.wps-spinner {\n  flex: 0 0 auto;\n  width: 12px;\n  height: 12px;\n  border: 1.5px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: wps-spin 0.7s linear infinite;\n}\n\n@keyframes wps-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n/* ------------------------------------------------------------------ *\n * Notices / errors\n * ------------------------------------------------------------------ */\n\n.wps-notice {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 10px 12px;\n  border: 0.5px solid transparent;\n  border-radius: var(--dsw-radius-lg, 10px);\n  font-size: 12.5px;\n  line-height: 1.55;\n}\n\n.wps-notice-main {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 0;\n}\n\n.wps-notice-text {\n  margin: 0;\n}\n\n.wps-notice--error {\n  background: rgba(214, 69, 69, 0.07);\n  border-color: rgba(214, 69, 69, 0.26);\n  color: var(--dsw-alias-state-error-primary, #d64545);\n}\n\n.wps-notice--success {\n  background: rgba(34, 160, 107, 0.08);\n  border-color: rgba(34, 160, 107, 0.26);\n  color: var(--dsw-alias-state-success-primary, #22a06b);\n}\n\n.wps-notice--warn {\n  background: rgba(196, 123, 10, 0.08);\n  border-color: rgba(196, 123, 10, 0.26);\n  color: var(--dsw-alias-state-warn-primary, #c47b0a);\n}\n\n.wps-inline-error {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 10px 12px;\n  border: 0.5px solid rgba(214, 69, 69, 0.26);\n  border-radius: var(--dsw-radius-lg, 10px);\n  background: rgba(214, 69, 69, 0.07);\n  color: var(--dsw-alias-state-error-primary, #d64545);\n  font-size: 12.5px;\n  line-height: 1.55;\n}\n\n.wps-inline-error-text {\n  margin: 0;\n  font-weight: 500;\n}\n\n.wps-raw-details {\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n}\n\n.wps-raw-details summary {\n  width: max-content;\n  max-width: 100%;\n  cursor: pointer;\n  border-radius: 4px;\n}\n\n.wps-raw-details code {\n  display: block;\n  margin-top: 6px;\n  padding: 8px 10px;\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-layer-2, #f5f6f8);\n  color: var(--dsw-alias-label-secondary, #7b8494);\n  font-family: var(\n    --dsw-font-mono,\n    ui-monospace,\n    SFMono-Regular,\n    Menlo,\n    monospace\n  );\n  font-size: 11.5px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n\n/* ------------------------------------------------------------------ *\n * Pending OAuth\n * ------------------------------------------------------------------ */\n\n.wps-pending {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px;\n  border: 1px dashed var(--dsw-alias-border-l2, #e3e6ec);\n  border-radius: var(--dsw-radius-lg, 10px);\n  background: var(--dsw-alias-bg-layer-2, #f5f6f8);\n}\n\n.wps-pending-title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n/* ------------------------------------------------------------------ *\n * Loading skeleton\n * ------------------------------------------------------------------ */\n\n.wps-loading {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.wps-skel {\n  display: block;\n  border-radius: 6px;\n  background: var(--dsw-alias-bg-layer-2, #f5f6f8);\n  animation: wps-pulse 1.4s ease-in-out infinite;\n}\n\n.wps-skel--title {\n  width: 42%;\n  height: 16px;\n}\n\n.wps-skel--line {\n  width: 100%;\n  height: 12px;\n}\n\n.wps-skel--short {\n  width: 62%;\n}\n\n@keyframes wps-pulse {\n  0%,\n  100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.5;\n  }\n}\n\n/* ------------------------------------------------------------------ *\n * Connected account card\n * ------------------------------------------------------------------ */\n\n.wps-account {\n  gap: 12px;\n}\n\n.wps-status-head {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.wps-dot {\n  flex: 0 0 auto;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--dsw-alias-label-tertiary, #9aa3b2);\n}\n\n.wps-dot--success {\n  background: var(--dsw-alias-state-success-primary, #22a06b);\n  box-shadow: 0 0 0 3px rgba(34, 160, 107, 0.16);\n}\n\n.wps-profile {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n}\n\n.wps-profile-name {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary, #1d2433);\n}\n\n.wps-profile-email {\n  margin: 0;\n  font-size: 12.5px;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n  word-break: break-all;\n}\n\n.wps-meta {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  font-size: 12.5px;\n  color: var(--dsw-alias-label-secondary, #7b8494);\n}\n\n.wps-meta-warn {\n  color: var(--dsw-alias-state-warn-primary, #c47b0a);\n}\n\n/* ------------------------------------------------------------------ *\n * Accessibility + responsive\n * ------------------------------------------------------------------ */\n\n.wps-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n@media (max-width: 560px) {\n  .wps-cred-grid {\n    grid-template-columns: minmax(0, 1fr);\n  }\n\n  .wps-step-actions {\n    align-items: stretch;\n  }\n\n  .wps-step-actions .wps-btn {\n    flex: 1 1 auto;\n  }\n\n  .wps-copy-row {\n    align-items: stretch;\n  }\n\n  .wps-redirect-value {\n    flex-basis: 100%;\n  }\n\n  .wps-copy-row .wps-btn {\n    flex: 0 0 auto;\n    align-self: flex-start;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .wps-root .wps-spinner,\n  .wps-root .wps-skel {\n    animation: none;\n  }\n\n  .wps-root .wps-btn,\n  .wps-root .wps-input {\n    transition: none;\n  }\n}\n";
// ---- src/client/api.js ----
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

// ---- src/client/i18n.js ----
// i18n.js — bilingual dictionary + language store for the WHOOP health dashboard.
// Loaded inside the shared client factory scope (no imports/exports/JSX).
// Exports: WHOOP_I18N, WHOOP_LANG, WHOOP_T.
//
// Key scheme (dot namespaces, settings-view owns the separate `acct.*` space):
//   lang.*     language-switch labels / aria copy
//   app.*      page chrome: header, refresh, footer
//   loading.*  initial load skeleton copy
//   unbound.*  minimal fallback shown when no WHOOP account is bound
//   state.*    empty / not-connected / configuration / transport error states
//   hero.*     recovery, strain and sleep ring cards
//   metrics.*  today's metric grid
//   trends.*   range selector + chart card titles
//   chart.*    chart empty copy, aria templates, per-series legend labels
//   sleep.*    sleep detail section
//   workouts.* workout list card copy
//   sport.*    localized workout sport names
//   body.*     body & profile card
//
// WHOOP_T(key, vars) interpolates `{name}` placeholders and falls back
// current language -> English -> the raw key (so a missing key is visible,
// never blank).

var WHOOP_I18N = {
  zh: {
    // -- language switch ----------------------------------------------------
    'lang.switchToEn': '切换到英文',
    'lang.switchToZh': '切换到中文',

    // -- page chrome --------------------------------------------------------
    'app.title': 'WHOOP健康',
    'app.subtitle': '恢复 · 负荷 · 睡眠 · 训练',
    'app.updated': '更新于 {time}',
    'app.notSynced': '尚未同步',
    'app.refreshing': '正在刷新…',
    'app.refresh': '刷新',
    'app.refreshAria': '刷新健康数据',
    'app.retry': '重试',
    'app.footnote': '数据来自 WHOOP',
    'app.rangeHint': '近 {days} 天',

    // -- loading ------------------------------------------------------------
    'loading.title': '正在加载健康数据',
    'loading.hint': '正在从 WHOOP 同步数据…',

    // -- unbound fallback (no WHOOP account bound) --------------------------
    'unbound.title': '还没有绑定 WHOOP 账号',
    'unbound.body': '绑定后即可查看恢复、负荷、睡眠与训练数据。',
    'unbound.cta': '去绑定 WHOOP 账号',
    'unbound.hint': '请打开左下角「设置 → WHOOP账户」完成绑定。',

    // -- empty / error / not-connected states -------------------------------
    'state.errorTitle': '无法加载健康数据',
    'state.emptyTitle': '还没有健康数据',
    'state.emptyBody': '佩戴 WHOOP 并完成一次同步后，恢复、负荷与睡眠数据会出现在这里。',
    'state.rateTitle': 'WHOOP 请求过于频繁',
    'state.rateBody': '请稍等片刻后重试。',
    'state.networkTitle': '网络连接失败',
    'state.networkBody': '请检查网络连接后重试。',
    'state.apiTitle': 'WHOOP 返回了错误',
    'state.apiBody': '请稍后重试；若持续出现，可在设置中重新授权。',
    'state.storageTitle': '本地数据读取失败',
    'state.storageBody': '请重试；若持续出现，请检查插件数据目录权限。',
    'state.miscTitle': '数据加载失败',
    'state.miscBody': '请重试；若持续出现，请检查插件配置。',

    // -- hero rings ---------------------------------------------------------
    'hero.recovery': '恢复',
    'hero.strain': '负荷',
    'hero.sleep': '睡眠表现',
    'hero.recoveryPending': '今日恢复数据尚未生成',
    'hero.calibrating': '校准中',
    'hero.noData': '暂无数据',
    'hero.hrv': 'HRV',
    'hero.restingHr': '静息心率',
    'hero.spo2': '血氧',
    'hero.energy': '能量',
    'hero.avgHr': '平均心率',
    'hero.maxHr': '最高心率',
    'hero.sleepDuration': '睡眠时长',
    'hero.efficiency': '睡眠效率',
    'hero.consistency': '睡眠一致性',
    'hero.recoveryGood': '恢复良好',
    'hero.recoveryFair': '恢复一般',
    'hero.recoveryLow': '恢复不足',
    'hero.strainLight': '轻负荷',
    'hero.strainModerate': '中等负荷',
    'hero.strainHigh': '高负荷',
    'hero.sleepGreat': '睡眠优秀',
    'hero.sleepOk': '睡眠良好',
    'hero.sleepLow': '睡眠偏低',
    'hero.ringAria': '{label}：{value}',

    // -- today's metrics ----------------------------------------------------
    'metrics.title': '今日指标',
    'metrics.subtitle': '关键身体数据一览',
    'metric.hrv': 'HRV',
    'metric.rhr': '静息心率',
    'metric.respiratory': '呼吸频率',
    'metric.spo2': '血氧饱和度',
    'metric.skinTemp': '皮肤温度',
    'metric.steps': '步数',
    'metric.energy': '能量消耗',
    'metric.sleepDuration': '睡眠时长',
    'metric.sleepEfficiency': '睡眠效率',
    'metric.sleepConsistency': '睡眠一致性',
    'metric.sparkAria': '{label}近 14 天趋势',
    'unit.steps': '步',

    // -- trends -------------------------------------------------------------
    'trends.title': '趋势',
    'trends.subtitle': '近期恢复、负荷与睡眠变化',
    'trends.rangeLabel': '时间范围',
    'trends.range7': '7天',
    'trends.range14': '14天',
    'trends.range30': '30天',
    'trends.recoveryHrv': '恢复与 HRV',
    'trends.recoveryHrvSub': '恢复分数（左轴）与 HRV（右轴）',
    'trends.rhr': '静息心率',
    'trends.rhrSub': '次/分钟，数值越低越好',
    'trends.strain': '每日负荷',
    'trends.strainSub': '0–21 区间',
    'trends.sleep': '睡眠表现与一致性',
    'trends.sleepSub': '最近 {days} 天的百分比趋势',
    'trends.avg': '平均 {value}',

    // -- chart internals ----------------------------------------------------
    'chart.noData': '暂无数据',
    'chart.aria': '{title}，最近 {range}',
    'chart.series.recovery': '恢复',
    'chart.series.hrv': 'HRV',
    'chart.series.rhr': '静息心率',
    'chart.series.strain': '负荷',
    'chart.series.performance': '睡眠表现',
    'chart.series.consistency': '一致性',

    // -- sleep detail -------------------------------------------------------
    'sleep.title': '睡眠详情',
    'sleep.subtitle': '睡眠结构、时长与恢复',
    'sleep.lastNight': '最近一夜',
    'sleep.nightOf': '{date} 夜间',
    'sleep.stages': '睡眠结构',
    'sleep.light': '浅睡',
    'sleep.deep': '深睡',
    'sleep.rem': 'REM',
    'sleep.awake': '清醒',
    'sleep.noData': '未记录',
    'sleep.actual': '实际睡眠',
    'sleep.needed': '睡眠需求',
    'sleep.inBed': '卧床时间',
    'sleep.bedtime': '入睡',
    'sleep.wake': '起床',
    'sleep.disturbances': '干扰次数',
    'sleep.performance': '睡眠表现',
    'sleep.efficiency': '睡眠效率',
    'sleep.consistency': '睡眠一致性',
    'sleep.respiratory': '呼吸频率',
    'sleep.nap': '小睡',
    'sleep.emptyTitle': '暂无睡眠数据',
    'sleep.emptyBody': '睡眠结果会在 WHOOP 同步后显示在这里。',

    // -- workouts -----------------------------------------------------------
    'workouts.title': '训练记录',
    'workouts.subtitle': '最近训练与心率区间分布',
    'workouts.count': '{count} 次',
    'workouts.emptyTitle': '暂无训练记录',
    'workouts.emptyBody': '完成训练并同步后，训练记录会出现在这里。',
    'workouts.duration': '时长',
    'workouts.strain': '负荷',
    'workouts.avgHr': '平均心率',
    'workouts.maxHr': '最高心率',
    'workouts.energy': '能量',
    'workouts.distance': '距离',
    'workouts.zones': '心率区间',
    'workouts.zoneAria': '心率区间 {n}：{duration}',

    // -- sports -------------------------------------------------------------
    'sport.running': '跑步',
    'sport.cycling': '骑行',
    'sport.swimming': '游泳',
    'sport.strength': '力量训练',
    'sport.hiit': '高强度间歇',
    'sport.yoga': '瑜伽',
    'sport.rowing': '划船',
    'sport.walking': '步行',
    'sport.hiking': '徒步',
    'sport.basketball': '篮球',
    'sport.soccer': '足球',
    'sport.tennis': '网球',
    'sport.boxing': '拳击',
    'sport.golf': '高尔夫',
    'sport.elliptical': '椭圆机',
    'sport.other': '训练',

    // -- body & profile -----------------------------------------------------
    'body.title': '身体与账户',
    'body.subtitle': '来自 WHOOP 的个人资料',
    'body.height': '身高',
    'body.weight': '体重',
    'body.maxHr': '最大心率',
    'body.bmi': 'BMI',
    'body.unknownName': 'WHOOP 用户',
    'body.fromWhoop': '以上数据来自 WHOOP'
  },

  en: {
    // -- language switch ----------------------------------------------------
    'lang.switchToEn': 'Switch to English',
    'lang.switchToZh': 'Switch to Chinese',

    // -- page chrome --------------------------------------------------------
    'app.title': 'WHOOP Health',
    'app.subtitle': 'Recovery · Strain · Sleep · Workouts',
    'app.updated': 'Updated {time}',
    'app.notSynced': 'Not synced yet',
    'app.refreshing': 'Refreshing…',
    'app.refresh': 'Refresh',
    'app.refreshAria': 'Refresh health data',
    'app.retry': 'Retry',
    'app.footnote': 'Data from WHOOP',
    'app.rangeHint': 'Last {days} days',

    // -- loading ------------------------------------------------------------
    'loading.title': 'Loading health data',
    'loading.hint': 'Syncing data from WHOOP…',

    // -- unbound fallback (no WHOOP account bound) --------------------------
    'unbound.title': 'No WHOOP account connected yet',
    'unbound.body': 'Connect your account to see recovery, strain, sleep and workouts.',
    'unbound.cta': 'Connect WHOOP account',
    'unbound.hint': 'Open Settings → WHOOP Account from the bottom-left corner to connect.',

    // -- empty / error / not-connected states -------------------------------
    'state.errorTitle': 'Couldn’t load health data',
    'state.emptyTitle': 'No health data yet',
    'state.emptyBody': 'Wear your WHOOP and sync once — recovery, strain and sleep data will appear here.',
    'state.rateTitle': 'WHOOP is rate limiting requests',
    'state.rateBody': 'Wait a moment and try again.',
    'state.networkTitle': 'Network connection failed',
    'state.networkBody': 'Check your connection and try again.',
    'state.apiTitle': 'WHOOP returned an error',
    'state.apiBody': 'Try again later; if it persists, re-authorize in Settings.',
    'state.storageTitle': 'Local data could not be read',
    'state.storageBody': 'Try again; if it persists, check the plugin data directory permissions.',
    'state.miscTitle': 'Could not load data',
    'state.miscBody': 'Try again; if it persists, check the plugin configuration.',

    // -- hero rings ---------------------------------------------------------
    'hero.recovery': 'Recovery',
    'hero.strain': 'Strain',
    'hero.sleep': 'Sleep performance',
    'hero.recoveryPending': 'Today’s recovery isn’t ready yet',
    'hero.calibrating': 'Calibrating',
    'hero.noData': 'No data',
    'hero.hrv': 'HRV',
    'hero.restingHr': 'Resting HR',
    'hero.spo2': 'SpO₂',
    'hero.energy': 'Energy',
    'hero.avgHr': 'Avg HR',
    'hero.maxHr': 'Max HR',
    'hero.sleepDuration': 'Sleep',
    'hero.efficiency': 'Efficiency',
    'hero.consistency': 'Consistency',
    'hero.recoveryGood': 'Well recovered',
    'hero.recoveryFair': 'Moderate recovery',
    'hero.recoveryLow': 'Low recovery',
    'hero.strainLight': 'Light load',
    'hero.strainModerate': 'Moderate load',
    'hero.strainHigh': 'High load',
    'hero.sleepGreat': 'Excellent',
    'hero.sleepOk': 'Good',
    'hero.sleepLow': 'Below target',
    'hero.ringAria': '{label}: {value}',

    // -- today's metrics ----------------------------------------------------
    'metrics.title': 'Today',
    'metrics.subtitle': 'Key measurements at a glance',
    'metric.hrv': 'HRV',
    'metric.rhr': 'Resting HR',
    'metric.respiratory': 'Respiratory rate',
    'metric.spo2': 'SpO₂',
    'metric.skinTemp': 'Skin temp',
    'metric.steps': 'Steps',
    'metric.energy': 'Energy',
    'metric.sleepDuration': 'Sleep duration',
    'metric.sleepEfficiency': 'Sleep efficiency',
    'metric.sleepConsistency': 'Sleep consistency',
    'metric.sparkAria': '{label} trend over the last 14 days',
    'unit.steps': 'steps',

    // -- trends -------------------------------------------------------------
    'trends.title': 'Trends',
    'trends.subtitle': 'Recent recovery, strain and sleep',
    'trends.rangeLabel': 'Range',
    'trends.range7': '7d',
    'trends.range14': '14d',
    'trends.range30': '30d',
    'trends.recoveryHrv': 'Recovery & HRV',
    'trends.recoveryHrvSub': 'Recovery score (left) and HRV (right)',
    'trends.rhr': 'Resting heart rate',
    'trends.rhrSub': 'Beats per minute — lower is better',
    'trends.strain': 'Daily strain',
    'trends.strainSub': 'On the 0–21 scale',
    'trends.sleep': 'Sleep performance & consistency',
    'trends.sleepSub': 'Percentage trends over the last {days} days',
    'trends.avg': 'Avg {value}',

    // -- chart internals ----------------------------------------------------
    'chart.noData': 'No data',
    'chart.aria': '{title}, last {range}',
    'chart.series.recovery': 'Recovery',
    'chart.series.hrv': 'HRV',
    'chart.series.rhr': 'Resting HR',
    'chart.series.strain': 'Strain',
    'chart.series.performance': 'Sleep performance',
    'chart.series.consistency': 'Consistency',

    // -- sleep detail -------------------------------------------------------
    'sleep.title': 'Sleep detail',
    'sleep.subtitle': 'Stages, timing and recovery',
    'sleep.lastNight': 'Last night',
    'sleep.nightOf': 'Night of {date}',
    'sleep.stages': 'Sleep stages',
    'sleep.light': 'Light',
    'sleep.deep': 'Deep',
    'sleep.rem': 'REM',
    'sleep.awake': 'Awake',
    'sleep.noData': 'Unrecorded',
    'sleep.actual': 'Actual sleep',
    'sleep.needed': 'Sleep needed',
    'sleep.inBed': 'In bed',
    'sleep.bedtime': 'Bedtime',
    'sleep.wake': 'Wake',
    'sleep.disturbances': 'Disturbances',
    'sleep.performance': 'Performance',
    'sleep.efficiency': 'Efficiency',
    'sleep.consistency': 'Consistency',
    'sleep.respiratory': 'Respiratory rate',
    'sleep.nap': 'Nap',
    'sleep.emptyTitle': 'No sleep data yet',
    'sleep.emptyBody': 'Sleep results appear here after your WHOOP syncs.',

    // -- workouts -----------------------------------------------------------
    'workouts.title': 'Workouts',
    'workouts.subtitle': 'Recent sessions and heart-rate zones',
    'workouts.count': '{count} sessions',
    'workouts.emptyTitle': 'No workouts yet',
    'workouts.emptyBody': 'Finish a workout and sync — sessions will appear here.',
    'workouts.duration': 'Duration',
    'workouts.strain': 'Strain',
    'workouts.avgHr': 'Avg HR',
    'workouts.maxHr': 'Max HR',
    'workouts.energy': 'Energy',
    'workouts.distance': 'Distance',
    'workouts.zones': 'HR zones',
    'workouts.zoneAria': 'Heart-rate zone {n}: {duration}',

    // -- sports -------------------------------------------------------------
    'sport.running': 'Running',
    'sport.cycling': 'Cycling',
    'sport.swimming': 'Swimming',
    'sport.strength': 'Strength',
    'sport.hiit': 'HIIT',
    'sport.yoga': 'Yoga',
    'sport.rowing': 'Rowing',
    'sport.walking': 'Walking',
    'sport.hiking': 'Hiking',
    'sport.basketball': 'Basketball',
    'sport.soccer': 'Soccer',
    'sport.tennis': 'Tennis',
    'sport.boxing': 'Boxing',
    'sport.golf': 'Golf',
    'sport.elliptical': 'Elliptical',
    'sport.other': 'Workout',

    // -- body & profile -----------------------------------------------------
    'body.title': 'Body & account',
    'body.subtitle': 'Profile from WHOOP',
    'body.height': 'Height',
    'body.weight': 'Weight',
    'body.maxHr': 'Max HR',
    'body.bmi': 'BMI',
    'body.unknownName': 'WHOOP member',
    'body.fromWhoop': 'Provided by WHOOP'
  }
};

// ---------------------------------------------------------------------------
// WHOOP_LANG — tiny observable language store + React hook.
//   WHOOP_LANG.get()          -> 'zh' | 'en'
//   WHOOP_LANG.set(lang)      -> normalize + notify subscribers
//   WHOOP_LANG.subscribe(fn)  -> unsubscribe function
//   WHOOP_LANG.use()          -> React hook: current language, re-renders on change
//   WHOOP_LANG.toggle()       -> flip zh <-> en
// ---------------------------------------------------------------------------
var WHOOP_LANG = (function () {
  var SUPPORTED = ['zh', 'en'];
  var DEFAULT_LANG = 'zh';
  var current = DEFAULT_LANG;
  var listeners = new Set();

  function normalize(lang) {
    return SUPPORTED.indexOf(lang) === -1 ? DEFAULT_LANG : lang;
  }

  function get() {
    return current;
  }

  function set(lang) {
    var next = normalize(lang);
    if (next === current) return current;
    current = next;
    var snapshot = Array.from(listeners);
    for (var i = 0; i < snapshot.length; i += 1) {
      try {
        snapshot[i](current);
      } catch (err) {
        // A broken listener must never break the language switch.
      }
    }
    return current;
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.add(fn);
    return function () {
      listeners.delete(fn);
    };
  }

  // React hook — every component that renders copy calls this once so a
  // language toggle re-renders it.
  function use() {
    var pair = React.useState(get());
    var lang = pair[0];
    var setLang = pair[1];
    React.useEffect(function () {
      return subscribe(function (next) {
        setLang(next);
      });
    }, []);
    return lang;
  }

  return {
    get: get,
    set: set,
    subscribe: subscribe,
    use: use,
    toggle: function () {
      return set(current === 'zh' ? 'en' : 'zh');
    },
    supported: SUPPORTED.slice()
  };
})();

// ---------------------------------------------------------------------------
// WHOOP_T(key, vars) — localized copy with `{var}` interpolation.
// ---------------------------------------------------------------------------
var WHOOP_T = (function () {
  function lookup(lang, key) {
    var dict = WHOOP_I18N[lang];
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return undefined;
  }

  function interpolate(template, vars) {
    if (!vars) return template;
    return String(template).replace(/\{(\w+)\}/g, function (match, name) {
      var value = vars[name];
      return value === undefined || value === null ? match : String(value);
    });
  }

  return function (key, vars) {
    if (key === undefined || key === null) return '';
    var text = lookup(WHOOP_LANG.get(), key);
    if (text === undefined) text = lookup('en', key);
    if (text === undefined) text = String(key);
    return interpolate(text, vars);
  };
})();

// ---- src/client/format.js ----
// format.js — language-aware formatting helpers for the WHOOP health dashboard.
// Loaded inside the shared client factory scope (no imports/exports/JSX).
// Every helper reads the active language from WHOOP_LANG at call time and
// returns the em dash '—' for null / undefined / NaN — never NaN or fake zeros.
//
// Required by docs/PLUGIN_SPEC.md §5:
//   num, pct, dateShort, dateLong, timeShort, duration, km, kj, weekdayShort
// Extras used by the dashboard (harmless for settings-view):
//   axisDate, tempC, bpm, msValue, rpm, dash

var WHOOP_FMT = (function () {
  var DASH = '—';
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAY_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WEEKDAY_LONG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var formatterCache = {};

  function lang() {
    return typeof WHOOP_LANG !== 'undefined' && WHOOP_LANG && WHOOP_LANG.get ? WHOOP_LANG.get() : 'zh';
  }

  function isZh() {
    return lang() === 'zh';
  }

  function numeric(value) {
    if (typeof value === 'number') return isFinite(value) ? value : null;
    if (typeof value === 'string' && value.trim() !== '') {
      var n = Number(value);
      return isFinite(n) ? n : null;
    }
    return null;
  }

  function digitsOf(digits) {
    if (digits === undefined || digits === null) return 0;
    var d = Math.floor(Number(digits));
    if (!isFinite(d) || d < 0) return 0;
    return d > 6 ? 6 : d;
  }

  // Intl.NumberFormat with a deterministic comma-grouping fallback.
  function grouped(n, digits) {
    var key = lang() + ':' + digits;
    var fmt = formatterCache[key];
    if (fmt === undefined) {
      try {
        fmt = new Intl.NumberFormat(isZh() ? 'zh-CN' : 'en-US', {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits
        });
      } catch (err) {
        fmt = null;
      }
      formatterCache[key] = fmt;
    }
    if (fmt) {
      try {
        return fmt.format(n);
      } catch (err) {
        // fall through to the manual fallback
      }
    }
    var parts = n.toFixed(digits).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function parseDate(iso) {
    if (iso === null || iso === undefined || iso === '') return null;
    if (iso instanceof Date) return isNaN(iso.getTime()) ? null : iso;
    if (typeof iso === 'number') {
      var fromNumber = new Date(iso);
      return isNaN(fromNumber.getTime()) ? null : fromNumber;
    }
    if (typeof iso !== 'string') return null;
    var dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (dateOnly) {
      // A calendar date (snapshot.days[].date) is a local date — never parse it
      // as UTC or the weekday/date can shift by one around midnight.
      var local = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
      return isNaN(local.getTime()) ? null : local;
    }
    var parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return {
    dash: DASH,

    // 72, 68.4 — localized grouping/decimals, '—' for missing data.
    num: function (value, digits) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n === 0 ? 0 : n, digitsOf(digits));
    },

    // '72%'
    pct: function (value, digits) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n === 0 ? 0 : n, digitsOf(digits)) + '%';
    },

    // '10月25日' / 'Oct 25'
    dateShort: function (iso) {
      var d = parseDate(iso);
      if (!d) return DASH;
      if (isZh()) return d.getMonth() + 1 + '月' + d.getDate() + '日';
      return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate();
    },

    // '2026年10月25日 周日' / 'Sunday, Oct 25, 2026'
    dateLong: function (iso) {
      var d = parseDate(iso);
      if (!d) return DASH;
      var weekday = d.getDay();
      if (isZh()) {
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEKDAY_ZH[weekday];
      }
      return WEEKDAY_LONG_EN[weekday] + ', ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    },

    // '23:41' / '11:41 PM'
    timeShort: function (iso) {
      var d = parseDate(iso);
      if (!d) return DASH;
      var h = d.getHours();
      var mi = d.getMinutes();
      var mm = mi < 10 ? '0' + mi : String(mi);
      if (isZh()) {
        var hh = h < 10 ? '0' + h : String(h);
        return hh + ':' + mm;
      }
      var h12 = h % 12;
      if (h12 === 0) h12 = 12;
      return h12 + ':' + mm + (h < 12 ? ' AM' : ' PM');
    },

    // '7小时32分' / '7h 32m'
    duration: function (ms) {
      var n = numeric(ms);
      if (n === null) return DASH;
      var totalMinutes = Math.round(Math.max(0, n) / 60000);
      var hours = Math.floor(totalMinutes / 60);
      var minutes = totalMinutes % 60;
      if (isZh()) {
        if (hours > 0 && minutes > 0) return hours + '小时' + minutes + '分';
        if (hours > 0) return hours + '小时';
        return minutes + '分';
      }
      if (hours > 0 && minutes > 0) return hours + 'h ' + minutes + 'm';
      if (hours > 0) return hours + 'h';
      return minutes + 'm';
    },

    // '5.2 km'
    km: function (meters) {
      var n = numeric(meters);
      if (n === null) return DASH;
      var km = Math.max(0, n) / 1000;
      return grouped(km, km >= 100 ? 0 : 1) + ' km';
    },

    // '1,980 kJ'
    kj: function (value) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(Math.round(n === 0 ? 0 : n), 0) + ' kJ';
    },

    // '周一' / 'Mon'
    weekdayShort: function (iso) {
      var d = parseDate(iso);
      if (!d) return DASH;
      return isZh() ? WEEKDAY_ZH[d.getDay()] : WEEKDAY_SHORT_EN[d.getDay()];
    },

    // '10/25' — compact calendar date for chart axes
    axisDate: function (iso) {
      var d = parseDate(iso);
      if (!d) return DASH;
      return d.getMonth() + 1 + '/' + d.getDate();
    },

    // '34.2 °C'
    tempC: function (value) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n, 1) + ' °C';
    },

    // '58 bpm'
    bpm: function (value) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n, 0) + ' bpm';
    },

    // '64 ms'
    msValue: function (value) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n, 0) + ' ms';
    },

    // '14.2 rpm'
    rpm: function (value) {
      var n = numeric(value);
      if (n === null) return DASH;
      return grouped(n, 1) + ' rpm';
    }
  };
})();

// ---- src/client/charts.js ----
// charts.js — dependency-free SVG chart components for the WHOOP dashboard.
// Loaded inside the shared client factory scope (no imports/exports/JSX).
// `React` and `h` (= React.createElement) are available; only theme-safe CSS
// classes are emitted, all data math stays in plain JavaScript.
//
// Exports (window-scope var WHOOP_CHARTS):
//   ScoreRing  — recovery / strain / sleep progress ring
//   LineChart  — multi-series line chart with optional right axis + hover tooltip
//   BarChart   — per-day bars with hover tooltip
//   StageBar   — stacked horizontal bar (sleep stages, HR zones)
//   HrZoneBar  — convenience wrapper over StageBar for the 6 WHOOP HR zones
//   Sparkline  — tiny inline trend line for metric tiles
//   ZONE_COLORS — fixed WHOOP-style HR zone palette
//
// Null values are gaps, never zeros: line series break, bars are skipped, and
// an all-null series renders an empty-state message instead of a fake chart.

var WHOOP_CHARTS = (function () {
  var F = WHOOP_FMT;
  var ZONE_COLORS = ['#60a5fa', '#38bdf8', '#0ea5b7', '#e0a008', '#f97316', '#ef4444'];

  function isNum(value) {
    return typeof value === 'number' && isFinite(value);
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function round2(value) {
    return Math.round(value * 100) / 100;
  }

  function numText(value, digits) {
    return F && F.num ? F.num(value, digits) : String(value);
  }

  function dash() {
    return F && F.dash ? F.dash : '—';
  }

  function hasAnyNumber(values) {
    for (var i = 0; i < values.length; i += 1) {
      if (isNum(values[i])) return true;
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // Scale helpers: "nice" y domains/ticks so auto-scaled axes get round labels.
  // -------------------------------------------------------------------------
  function niceStep(rawStep) {
    if (!isNum(rawStep) || rawStep <= 0) return 1;
    var magnitude = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10));
    var normalized = rawStep / magnitude;
    var step;
    if (normalized <= 1) step = 1;
    else if (normalized <= 2) step = 2;
    else if (normalized <= 2.5) step = 2.5;
    else if (normalized <= 5) step = 5;
    else step = 10;
    return step * magnitude;
  }

  function autoDomain(values, tickCount) {
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < values.length; i += 1) {
      var value = values[i];
      if (!isNum(value)) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    if (min === Infinity) return null;
    if (min === max) {
      min -= 1;
      max += 1;
    }
    var step = niceStep((max - min) / Math.max(1, tickCount));
    var low = Math.floor(min / step) * step;
    var high = Math.ceil(max / step) * step;
    if (high === low) high = low + step;
    return [low, high];
  }

  function niceTicks(low, high, tickCount) {
    var ticks = [];
    if (!isNum(low) || !isNum(high) || !(high > low)) return ticks;
    var step = niceStep((high - low) / Math.max(1, tickCount));
    var start = Math.ceil(low / step - 1e-9) * step;
    for (var value = start; value <= high + step * 1e-6; value += step) {
      ticks.push(Math.abs(value) < step * 1e-9 ? 0 : round2(value));
      if (ticks.length > 12) break;
    }
    return ticks;
  }

  function axisExtent(series, axis) {
    var explicit = null;
    var values = [];
    for (var i = 0; i < series.length; i += 1) {
      var entry = series[i];
      var entryAxis = entry.axis === 'right' ? 'right' : 'left';
      if (entryAxis !== axis) continue;
      if (
        Array.isArray(entry.domain) &&
        entry.domain.length === 2 &&
        isNum(entry.domain[0]) &&
        isNum(entry.domain[1]) &&
        entry.domain[1] > entry.domain[0]
      ) {
        explicit = [entry.domain[0], entry.domain[1]];
      }
      for (var j = 0; j < entry.values.length; j += 1) {
        if (isNum(entry.values[j])) values.push(entry.values[j]);
      }
    }
    return { explicit: explicit, values: values };
  }

  function domainFor(series, axis, tickCount) {
    var extent = axisExtent(series, axis);
    if (extent.explicit) return extent.explicit;
    if (!extent.values.length) return null;
    return autoDomain(extent.values, tickCount);
  }

  function seriesValueText(series, value) {
    if (!isNum(value)) return dash();
    var digits = isNum(series.digits) ? series.digits : 0;
    return numText(value, digits) + (series.unit ? ' ' + series.unit : '');
  }

  // -------------------------------------------------------------------------
  // Path builders — null values break the line (real data gaps, not zeros).
  // -------------------------------------------------------------------------
  function linePath(values, xAt, yAt) {
    var path = '';
    var open = false;
    for (var i = 0; i < values.length; i += 1) {
      if (!isNum(values[i])) {
        open = false;
        continue;
      }
      path += (open ? 'L' : 'M') + round2(xAt(i)) + ',' + round2(yAt(values[i]));
      open = true;
    }
    return path;
  }

  function areaPath(values, xAt, yAt, baseY) {
    var path = '';
    var run = [];
    function flush() {
      if (run.length < 2) {
        run = [];
        return;
      }
      path += 'M' + round2(xAt(run[0])) + ',' + round2(baseY);
      for (var k = 0; k < run.length; k += 1) {
        path += 'L' + round2(xAt(run[k])) + ',' + round2(yAt(values[run[k]]));
      }
      path += 'L' + round2(xAt(run[run.length - 1])) + ',' + round2(baseY) + 'Z';
      run = [];
    }
    for (var i = 0; i < values.length; i += 1) {
      if (isNum(values[i])) run.push(i);
      else flush();
    }
    flush();
    return path;
  }

  function labelIndexes(count, maxLabels) {
    var indexes = [];
    if (count <= 0) return indexes;
    var limit = Math.max(2, maxLabels || 7);
    var step = Math.max(1, Math.ceil(count / limit));
    for (var i = 0; i < count; i += step) indexes.push(i);
    var last = count - 1;
    if (indexes.indexOf(last) === -1) indexes.push(last);
    return indexes;
  }

  // -------------------------------------------------------------------------
  // Shared hover behavior (custom hook — called unconditionally in components).
  // -------------------------------------------------------------------------
  function useChartHover(viewBoxWidth, padLeft, plotWidth, count, fallbackWidth) {
    var pair = React.useState(null);
    var hover = pair[0];
    var setHover = pair[1];
    var ref = React.useRef(null);

    function onPointerMove(evt) {
      var node = ref.current;
      if (!node || !evt || typeof evt.clientX !== 'number') return;
      var rect = node.getBoundingClientRect();
      if (!rect || !rect.width) return;
      var viewX = ((evt.clientX - rect.left) / rect.width) * viewBoxWidth;
      var index;
      if (count <= 1) {
        index = 0;
      } else {
        index = Math.round(((viewX - padLeft) / Math.max(1, plotWidth)) * (count - 1));
      }
      setHover(clamp(index, 0, Math.max(0, count - 1)));
    }

    function onPointerLeave() {
      setHover(null);
    }

    return {
      hover: hover,
      ref: ref,
      onPointerMove: onPointerMove,
      onPointerLeave: onPointerLeave,
      fallbackWidth: fallbackWidth || 640
    };
  }

  function Tooltip(props) {
    var rows = props.rows || [];
    var children = [];
    if (props.title) {
      children.push(h('div', { key: 'title', className: 'wh-chart-tip-title' }, props.title));
    }
    for (var i = 0; i < rows.length; i += 1) {
      children.push(
        h(
          'div',
          { key: 'row' + i, className: 'wh-chart-tip-row' },
          h('span', { className: 'wh-chart-tip-dot', style: { background: rows[i].color } }),
          h('span', { className: 'wh-chart-tip-label' }, rows[i].label),
          h('span', { className: 'wh-chart-tip-value' }, rows[i].value)
        )
      );
    }
    return h(
      'div',
      {
        className: 'wh-chart-tip',
        style: { left: clamp(props.leftPct, 17, 83) + '%' }
      },
      children
    );
  }

  // -------------------------------------------------------------------------
  // LineChart
  // props: {
  //   series: [{ key, label, color, values, axis?, domain?, area?, digits?, unit? }],
  //   labels: string[], tooltipLabels?: string[], height?: number,
  //   ariaLabel: string, emptyText?: string, maxXLabels?: number
  // }
  // -------------------------------------------------------------------------
  function LineChart(props) {
    var allSeries = Array.isArray(props.series) ? props.series : [];
    var series = [];
    for (var i = 0; i < allSeries.length; i += 1) {
      if (allSeries[i] && Array.isArray(allSeries[i].values)) series.push(allSeries[i]);
    }
    var labels = Array.isArray(props.labels) ? props.labels : [];
    var tips = Array.isArray(props.tooltipLabels) ? props.tooltipLabels : labels;
    var count = labels.length;
    for (var s = 0; s < series.length; s += 1) {
      if (series[s].values.length > count) count = series[s].values.length;
    }

    var W = 640;
    var H = isNum(props.height) ? props.height : 200;
    var domains = { left: domainFor(series, 'left', 4), right: domainFor(series, 'right', 3) };
    var hasRight = domains.right !== null;
    var padL = 42;
    var padR = hasRight ? 46 : 16;
    var padT = 14;
    var padB = 26;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var baseY = padT + plotH;
    var hover = useChartHover(W, padL, plotW, Math.max(1, count));

    var leftDomain = domains.left || [0, 1];
    var leftTicks = niceTicks(leftDomain[0], leftDomain[1], 4);
    var rightTicks = hasRight ? niceTicks(domains.right[0], domains.right[1], 3) : [];

    function xAt(index) {
      if (count <= 1) return padL + plotW / 2;
      return padL + (index / (count - 1)) * plotW;
    }

    function yAtFor(entry, value) {
      var domain = entry.axis === 'right' && domains.right ? domains.right : leftDomain;
      var ratio = (value - domain[0]) / (domain[1] - domain[0]);
      return padT + plotH - clamp(ratio, -0.1, 1.1) * plotH;
    }

    var anyData = false;
    for (var q = 0; q < series.length; q += 1) {
      if (hasAnyNumber(series[q].values)) {
        anyData = true;
        break;
      }
    }
    if (!anyData) {
      return h(
        'div',
        { className: 'wh-chart-empty', role: 'img', 'aria-label': props.ariaLabel || '' },
        props.emptyText || dash()
      );
    }

    var nodes = [];
    // grid + left axis labels
    for (var t = 0; t < leftTicks.length; t += 1) {
      var gridY = padT + plotH - ((leftTicks[t] - leftDomain[0]) / (leftDomain[1] - leftDomain[0])) * plotH;
      nodes.push(
        h('line', {
          key: 'grid' + t,
          className: 'wh-chart-grid',
          x1: padL,
          x2: W - padR,
          y1: round2(gridY),
          y2: round2(gridY)
        })
      );
      nodes.push(
        h(
          'text',
          {
            key: 'ylabel' + t,
            className: 'wh-chart-axis',
            x: padL - 8,
            y: round2(gridY),
            textAnchor: 'end',
            dominantBaseline: 'middle'
          },
          numText(leftTicks[t], 0)
        )
      );
    }
    // right axis labels
    for (var rt = 0; rt < rightTicks.length; rt += 1) {
      var rightY =
        padT + plotH - ((rightTicks[rt] - domains.right[0]) / (domains.right[1] - domains.right[0])) * plotH;
      nodes.push(
        h(
          'text',
          {
            key: 'rylabel' + rt,
            className: 'wh-chart-axis',
            x: W - padR + 8,
            y: round2(rightY),
            textAnchor: 'start',
            dominantBaseline: 'middle'
          },
          numText(rightTicks[rt], 0)
        )
      );
    }
    // x axis labels
    var xIndexes = labelIndexes(count, props.maxXLabels || 7);
    for (var xi = 0; xi < xIndexes.length; xi += 1) {
      var index = xIndexes[xi];
      var anchor = index === 0 ? 'start' : index === count - 1 ? 'end' : 'middle';
      nodes.push(
        h(
          'text',
          {
            key: 'xlabel' + index,
            className: 'wh-chart-axis',
            x: round2(xAt(index)),
            y: H - 8,
            textAnchor: anchor
          },
          labels[index] === undefined ? '' : String(labels[index])
        )
      );
    }
    // series
    for (var si = 0; si < series.length; si += 1) {
      var entry = series[si];
      var color = entry.color || ZONE_COLORS[2];
      if (entry.area) {
        nodes.push(
          h('path', {
            key: 'area' + si,
            d: areaPath(entry.values, xAt, function (value) {
              return yAtFor(entry, value);
            }, baseY),
            fill: color,
            fillOpacity: 0.1,
            stroke: 'none'
          })
        );
      }
      nodes.push(
        h('path', {
          key: 'line' + si,
          d: linePath(entry.values, xAt, function (value) {
            return yAtFor(entry, value);
          }),
          fill: 'none',
          style: {
            stroke: color,
            strokeWidth: entry.strokeWidth || 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }
        })
      );
      if (count <= 16) {
        for (var pi = 0; pi < entry.values.length; pi += 1) {
          if (!isNum(entry.values[pi])) continue;
          nodes.push(
            h('circle', {
              key: 'dot' + si + '-' + pi,
              cx: round2(xAt(pi)),
              cy: round2(yAtFor(entry, entry.values[pi])),
              r: 2.4,
              style: { fill: color }
            })
          );
        }
      }
    }
    // hover crosshair / markers
    if (hover.hover !== null && count > 0) {
      var hoverIndex = clamp(hover.hover, 0, count - 1);
      nodes.push(
        h('line', {
          key: 'cross',
          className: 'wh-chart-cross',
          x1: round2(xAt(hoverIndex)),
          x2: round2(xAt(hoverIndex)),
          y1: padT,
          y2: baseY
        })
      );
      for (var hi = 0; hi < series.length; hi += 1) {
        var hoverValue = series[hi].values[hoverIndex];
        if (!isNum(hoverValue)) continue;
        nodes.push(
          h('circle', {
            key: 'hdot' + hi,
            className: 'wh-chart-hover-dot',
            cx: round2(xAt(hoverIndex)),
            cy: round2(yAtFor(series[hi], hoverValue)),
            r: 3.6,
            style: { fill: series[hi].color || ZONE_COLORS[2] }
          })
        );
      }
    }

    var tipRows = [];
    if (hover.hover !== null && count > 0) {
      var tipIndex = clamp(hover.hover, 0, count - 1);
      tipRows = series.map(function (entry) {
        return {
          color: entry.color || ZONE_COLORS[2],
          label: entry.label || '',
          value: seriesValueText(entry, entry.values[tipIndex])
        };
      });
    }

    return h(
      'div',
      {
        className: 'wh-chart',
        ref: hover.ref,
        onPointerMove: hover.onPointerMove,
        onPointerLeave: hover.onPointerLeave
      },
      h(
        'svg',
        {
          className: 'wh-chart-svg',
          viewBox: '0 0 ' + W + ' ' + H,
          role: 'img',
          'aria-label': props.ariaLabel || ''
        },
        nodes
      ),
      hover.hover !== null && count > 0
        ? h(Tooltip, {
            title: tips[clamp(hover.hover, 0, Math.max(0, tips.length - 1))],
            rows: tipRows,
            leftPct: (xAt(clamp(hover.hover, 0, count - 1)) / W) * 100
          })
        : null
    );
  }

  // -------------------------------------------------------------------------
  // BarChart
  // props: { values, labels, color?, domain?, height?, digits?, unit?,
  //          ariaLabel, emptyText?, tooltipLabels? }
  // -------------------------------------------------------------------------
  function BarChart(props) {
    var values = Array.isArray(props.values) ? props.values : [];
    var labels = Array.isArray(props.labels) ? props.labels : [];
    var tips = Array.isArray(props.tooltipLabels) ? props.tooltipLabels : labels;
    var count = Math.max(values.length, labels.length);
    var W = 640;
    var H = isNum(props.height) ? props.height : 200;
    var padL = 34;
    var padR = 16;
    var padT = 14;
    var padB = 26;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var baseY = padT + plotH;
    var hover = useChartHover(W, padL, plotW, Math.max(1, count));

    var domain;
    if (Array.isArray(props.domain) && props.domain.length === 2) {
      domain = [props.domain[0], props.domain[1]];
    } else {
      domain = autoDomain(values, 4) || [0, 1];
      domain[0] = Math.min(0, domain[0]);
    }
    if (!(domain[1] > domain[0])) domain = [0, 1];
    var ticks = niceTicks(domain[0], domain[1], 4);

    function yAt(value) {
      var ratio = (value - domain[0]) / (domain[1] - domain[0]);
      return padT + plotH - clamp(ratio, 0, 1) * plotH;
    }

    function slotWidth() {
      return count > 0 ? plotW / count : plotW;
    }

    function centerAt(index) {
      return padL + (index + 0.5) * slotWidth();
    }

    var anyData = hasAnyNumber(values);
    if (!anyData) {
      return h(
        'div',
        { className: 'wh-chart-empty', role: 'img', 'aria-label': props.ariaLabel || '' },
        props.emptyText || dash()
      );
    }

    var color = props.color || ZONE_COLORS[2];
    var barWidth = Math.max(4, Math.min(30, slotWidth() * 0.6));
    var nodes = [];
    for (var t = 0; t < ticks.length; t += 1) {
      var gridY = padT + plotH - ((ticks[t] - domain[0]) / (domain[1] - domain[0])) * plotH;
      nodes.push(
        h('line', {
          key: 'grid' + t,
          className: 'wh-chart-grid',
          x1: padL,
          x2: W - padR,
          y1: round2(gridY),
          y2: round2(gridY)
        })
      );
      nodes.push(
        h(
          'text',
          {
            key: 'ylabel' + t,
            className: 'wh-chart-axis',
            x: padL - 8,
            y: round2(gridY),
            textAnchor: 'end',
            dominantBaseline: 'middle'
          },
          numText(ticks[t], 0)
        )
      );
    }
    for (var b = 0; b < count; b += 1) {
      if (!isNum(values[b])) continue;
      var topY = yAt(values[b]);
      var height = Math.max(2, baseY - topY);
      nodes.push(
        h('rect', {
          key: 'bar' + b,
          className: 'wh-chart-bar' + (hover.hover === b ? ' is-hover' : ''),
          x: round2(centerAt(b) - barWidth / 2),
          y: round2(baseY - height),
          width: round2(barWidth),
          height: round2(height),
          rx: 3,
          style: { fill: color }
        })
      );
    }
    var xIndexes = labelIndexes(count, 8);
    for (var xi = 0; xi < xIndexes.length; xi += 1) {
      var index = xIndexes[xi];
      nodes.push(
        h(
          'text',
          {
            key: 'xlabel' + index,
            className: 'wh-chart-axis',
            x: round2(centerAt(index)),
            y: H - 8,
            textAnchor: 'middle'
          },
          labels[index] === undefined ? '' : String(labels[index])
        )
      );
    }

    var tipRows = [];
    if (hover.hover !== null && hover.hover >= 0 && hover.hover < count) {
      tipRows = [
        {
          color: color,
          label: props.seriesLabel || '',
          value: isNum(values[hover.hover])
            ? numText(values[hover.hover], isNum(props.digits) ? props.digits : 1) +
              (props.unit ? ' ' + props.unit : '')
            : dash()
        }
      ];
    }

    return h(
      'div',
      {
        className: 'wh-chart',
        ref: hover.ref,
        onPointerMove: hover.onPointerMove,
        onPointerLeave: hover.onPointerLeave
      },
      h(
        'svg',
        {
          className: 'wh-chart-svg',
          viewBox: '0 0 ' + W + ' ' + H,
          role: 'img',
          'aria-label': props.ariaLabel || ''
        },
        nodes
      ),
      hover.hover !== null && count > 0
        ? h(Tooltip, {
            title: tips[clamp(hover.hover, 0, Math.max(0, tips.length - 1))],
            rows: tipRows,
            leftPct: (centerAt(clamp(hover.hover, 0, count - 1)) / W) * 100
          })
        : null
    );
  }

  // -------------------------------------------------------------------------
  // StageBar — stacked horizontal bar. Segments with ms <= 0 are skipped.
  // props: { segments: [{ key, label, ms, color }], height?, ariaLabel? }
  // -------------------------------------------------------------------------
  function StageBar(props) {
    var raw = Array.isArray(props.segments) ? props.segments : [];
    var segments = raw.filter(function (segment) {
      return segment && isNum(segment.ms) && segment.ms > 0;
    });
    var W = 640;
    var H = isNum(props.height) ? props.height : 16;
    var ariaLabel = props.ariaLabel || '';
    var total = 0;
    for (var i = 0; i < segments.length; i += 1) total += segments[i].ms;
    if (!total) {
      return h('div', { className: 'wh-stage-bar wh-stage-bar--empty', role: 'img', 'aria-label': ariaLabel });
    }
    var gap = segments.length > 1 ? 2 : 0;
    var cursor = 0;
    var parts = [];
    for (var s = 0; s < segments.length; s += 1) {
      var segment = segments[s];
      var width = (segment.ms / total) * W;
      var rectX = cursor + gap / 2;
      var rectWidth = Math.max(1, width - gap);
      cursor += width;
      parts.push(
        h(
          'rect',
          {
            key: segment.key || 'seg' + s,
            x: round2(rectX),
            y: 0,
            width: round2(rectWidth),
            height: H,
            rx: Math.min(5, H / 2),
            style: { fill: segment.color || ZONE_COLORS[2] }
          },
          segment.label ? h('title', null, segment.label) : null
        )
      );
    }
    return h(
      'svg',
      {
        className: 'wh-stage-bar',
        viewBox: '0 0 ' + W + ' ' + H,
        preserveAspectRatio: 'none',
        role: 'img',
        'aria-label': ariaLabel,
        style: { height: H + 'px' }
      },
      parts
    );
  }

  // -------------------------------------------------------------------------
  // HrZoneBar — WHOOP's six heart-rate zones as a mini stacked bar.
  // props: { zones: number[], labels?: string[], height?, ariaLabel }
  // -------------------------------------------------------------------------
  function HrZoneBar(props) {
    var zones = Array.isArray(props.zones) ? props.zones : [];
    var labels = Array.isArray(props.labels) ? props.labels : [];
    var segments = [];
    for (var i = 0; i < zones.length; i += 1) {
      segments.push({
        key: 'zone' + i,
        ms: isNum(zones[i]) ? zones[i] : null,
        color: ZONE_COLORS[i % ZONE_COLORS.length],
        label: labels[i] || 'Z' + (i + 1)
      });
    }
    return h(StageBar, {
      segments: segments,
      height: isNum(props.height) ? props.height : 6,
      ariaLabel: props.ariaLabel
    });
  }

  // -------------------------------------------------------------------------
  // Sparkline — tiny non-interactive trend line (decorative, optional aria).
  // props: { values, color, height?, ariaLabel? }
  // -------------------------------------------------------------------------
  function Sparkline(props) {
    var values = Array.isArray(props.values) ? props.values : [];
    var count = values.length;
    if (!count || !hasAnyNumber(values)) return null;
    var W = 140;
    var H = isNum(props.height) ? props.height : 26;
    var pad = 2;
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < count; i += 1) {
      if (!isNum(values[i])) continue;
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
    }
    if (min === max) {
      min -= 1;
      max += 1;
    }
    var color = props.color || ZONE_COLORS[2];

    function xAt(index) {
      if (count <= 1) return W / 2;
      return pad + (index / (count - 1)) * (W - pad * 2);
    }

    function yAt(value) {
      return H - pad - ((value - min) / (max - min)) * (H - pad * 2);
    }

    var ariaLabel = props.ariaLabel;
    return h(
      'svg',
      {
        className: 'wh-sparkline',
        viewBox: '0 0 ' + W + ' ' + H,
        preserveAspectRatio: 'none',
        role: ariaLabel ? 'img' : undefined,
        'aria-label': ariaLabel || undefined,
        'aria-hidden': ariaLabel ? undefined : 'true',
        style: { height: H + 'px' }
      },
      h('path', {
        key: 'area',
        d: areaPath(values, xAt, yAt, H - pad),
        fill: color,
        fillOpacity: 0.12,
        stroke: 'none'
      }),
      h('path', {
        key: 'line',
        d: linePath(values, xAt, yAt),
        fill: 'none',
        vectorEffect: 'non-scaling-stroke',
        style: { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
      })
    );
  }

  // -------------------------------------------------------------------------
  // ScoreRing — 0..max progress ring with a big tabular number in the middle.
  // props: { value, max?, display?, cap?, color?, size?, ariaLabel }
  // -------------------------------------------------------------------------
  function ScoreRing(props) {
    var nominalSize = 156;
    var strokeWidth = 11;
    var max = isNum(props.max) && props.max > 0 ? props.max : 100;
    var value = isNum(props.value) ? props.value : null;
    var ratio = value === null ? 0 : clamp(value / max, 0, 1);
    var center = nominalSize / 2;
    var radius = (nominalSize - strokeWidth) / 2;
    var circumference = 2 * Math.PI * radius;
    var color = props.color || ZONE_COLORS[2];
    var wrapperStyle = {
      '--wh-ring-size': (isNum(props.size) ? props.size : 156) + 'px',
      '--wh-ring-color': color
    };
    var valueCircle = null;
    if (value !== null) {
      valueCircle = h('circle', {
        className: 'wh-ring-value',
        cx: center,
        cy: center,
        r: radius,
        fill: 'none',
        transform: 'rotate(-90 ' + center + ' ' + center + ')',
        style: {
          strokeWidth: strokeWidth,
          strokeDasharray: round2(circumference) + ' ' + round2(circumference),
          strokeDashoffset: round2(circumference * (1 - ratio)),
          strokeLinecap: 'round'
        }
      });
    }
    return h(
      'div',
      {
        className: 'wh-ring' + (value === null ? ' wh-ring--empty' : ''),
        style: wrapperStyle,
        role: 'img',
        'aria-label': props.ariaLabel || ''
      },
      h(
        'svg',
        {
          className: 'wh-ring-svg',
          viewBox: '0 0 ' + nominalSize + ' ' + nominalSize,
          'aria-hidden': 'true',
          focusable: 'false'
        },
        h('circle', {
          className: 'wh-ring-track',
          cx: center,
          cy: center,
          r: radius,
          fill: 'none',
          style: { strokeWidth: strokeWidth }
        }),
        valueCircle
      ),
      h(
        'div',
        { className: 'wh-ring-center' },
        h(
          'span',
          { className: 'wh-ring-num' },
          props.display === undefined || props.display === null
            ? value === null
              ? dash()
              : numText(value, 0)
            : props.display
        ),
        props.cap ? h('span', { className: 'wh-ring-cap' }, props.cap) : null
      )
    );
  }

  return {
    ScoreRing: ScoreRing,
    LineChart: LineChart,
    BarChart: BarChart,
    StageBar: StageBar,
    HrZoneBar: HrZoneBar,
    Sparkline: Sparkline,
    ZONE_COLORS: ZONE_COLORS
  };
})();

// ---- src/client/dashboard.js ----
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

// ---- src/client/settings-i18n.js ----
/**
 * WHOOP account settings copy (`acct.*`).
 *
 * This fragment is concatenated after `i18n.js`, so the zh/en dictionaries
 * already exist; it only merges the settings-page strings into them. The
 * component in `settings.js` resolves every visible string through `WHOOP_T`.
 *
 * The page is the four-step onboarding flow described in docs/UX-REDESIGN.md §三.
 */

Object.assign(WHOOP_I18N.zh, {
  /* Header ------------------------------------------------------------ */
  'acct.title': 'WHOOP账户',
  'acct.description.unbound': '按下面四步完成绑定，之后就能在这里看到你的健康数据。',
  'acct.description.connected': '你的 WHOOP 账号已绑定，可以随时重新授权或解除绑定。',
  'acct.loading': '正在读取账号状态…',
  'acct.action.retry': '重试',

  /* 第一步：登录 WHOOP 开发者平台 -------------------------------------- */
  'acct.step1.title': '第一步：登录 WHOOP 开发者平台',
  'acct.step1.item1': '在浏览器中打开 WHOOP 开发者平台。',
  'acct.step1.item2': '使用你的 WHOOP 账号登录。',
  'acct.step1.open': '打开 WHOOP 开发者平台',

  /* 第二步：创建 WHOOP 应用 ------------------------------------------- */
  'acct.step2.title': '第二步：创建 WHOOP 应用',
  'acct.step2.item1': '按个人偏好填写 App 名称、上传 Logo、填写邮箱和隐私声明（可选）。',
  'acct.step2.item2': '在 Redirect #1 中填入下面的回调地址。',
  'acct.step2.item3': '按个人偏好勾选需要的数据权限。',
  'acct.step2.item4': '点击「CREATE APP」完成创建。',
  'acct.step2.redirectLabel': '回调地址（Redirect #1）',
  'acct.step2.copy': '复制',
  'acct.step2.copied': '已复制',
  'acct.step2.copyFailed': '复制失败',
  'acct.step2.copyFailedHint': '自动复制失败，请手动选中上面的地址复制。',
  'acct.step2.redirectMissing': '暂时无法获取回调地址：请确认 DSH 客户端运行正常，然后刷新页面重试。',

  /* 第三步：获取 Client ID / Client Secret ---------------------------- */
  'acct.step3.title': '第三步：获取 Client ID / Client Secret',
  'acct.step3.item1': '点开已创建好的 WHOOP App。',
  'acct.step3.item2': '复制 Client ID 与 Client Secret，填入下面两个输入框。',
  'acct.step3.clientId': 'Client ID',
  'acct.step3.clientSecret': 'Client Secret',
  'acct.step3.clientIdPlaceholder': '粘贴 Client ID',
  'acct.step3.secretPlaceholder': '粘贴 Client Secret',
  'acct.step3.secretSavedPlaceholder': '已保存（不显示）',
  'acct.step3.edit': '编辑',
  'acct.step3.dblclickHint': '双击输入框可编辑已保存的凭据。',
  'acct.step3.security': 'Client Secret 只保存在本机，保存后不再显示。',
  'acct.step3.save': '保存',
  'acct.step3.saving': '正在保存…',
  'acct.step3.clear': '清空',
  'acct.step3.clearing': '正在清空…',
  'acct.step3.saved': '已保存',
  'acct.step3.cleared': '已清空',
  'acct.step3.validation': '请填写 Client ID 和 Client Secret。',
  'acct.step3.saveError.bad_request': '保存失败：Client ID 和 Client Secret 不能为空。',
  'acct.step3.saveError.storage_error': '保存失败：无法写入本机存储，请检查数据目录权限。',
  'acct.step3.saveError.unavailable': '凭据保存功能暂不可用，请刷新页面后重试。',
  'acct.step3.clearError.storage_error': '清空失败：无法写入本机存储，请检查数据目录权限。',
  'acct.step3.clearError.unavailable': '凭据清空功能暂不可用，请刷新页面后重试。',

  /* 第四步：授权绑定 WHOOP 账号 --------------------------------------- */
  'acct.step4.title': '第四步：授权绑定 WHOOP 账号',
  'acct.step4.description': '点击下面的按钮会打开 WHOOP 授权页面，登录并同意授权后回到 DSH 即完成绑定。',
  'acct.step4.bind': '绑定 WHOOP 账号',
  'acct.step4.binding': '正在打开授权页面…',
  'acct.step4.needClientId': '请先完成第三步：保存 Client ID。',
  'acct.step4.needSecret': '请先完成第三步：保存 Client Secret。',
  'acct.step4.needRedirect': '无法获取回调地址，请重启 DSH 客户端后重试。',
  'acct.step4.certHint': '首次打开授权页面时，浏览器可能提示证书不受信任，请选择「高级 → 继续前往 localhost」。',
  'acct.step4.waiting': '正在等待浏览器授权…',
  'acct.step4.waitingHint': '授权页面已打开。完成授权后此页面会自动刷新；如果没有打开，请点击下面的链接。',
  'acct.step4.reopen': '重新打开授权页面',
  'acct.step4.timeout': '等待授权超时（5 分钟），请重新点击「绑定 WHOOP 账号」。',
  'acct.step4.success': '授权完成，WHOOP 账号已绑定。',

  /* 已连接状态 --------------------------------------------------------- */
  'acct.connected.title': '已连接',
  'acct.connected.noProfile': 'WHOOP 账号已连接',
  'acct.connected.expires': '访问令牌有效期至 {time}',
  'acct.connected.expired': '访问令牌已过期，下次请求时会自动续期。',
  'acct.connected.reauthorize': '重新授权',
  'acct.connected.reauthorizing': '正在打开授权页面…',
  'acct.connected.disconnect': '解除绑定',
  'acct.connected.confirmDisconnect': '确认解除绑定？',
  'acct.connected.disconnecting': '正在解除…',
  'acct.connected.disconnected': '已解除 WHOOP 账号绑定。',

  /* Host error codes --------------------------------------------------- */
  'acct.error.detail': '查看原始信息',
  'acct.error.generic': '操作失败，请稍后重试。',
  'acct.error.bad_response': '服务返回的数据不完整，请重试。',
  'acct.error.not_configured': 'WHOOP 客户端尚未配置（缺少 Client ID 或 Client Secret）。',
  'acct.error.auth_required': '尚未绑定 WHOOP 账号，请先完成绑定。',
  'acct.error.auth_denied': 'WHOOP 授权被拒绝或已取消，请重新授权。',
  'acct.error.token_expired': 'WHOOP 授权已过期，请重新授权。',
  'acct.error.network': '网络请求失败，请检查网络后重试。',
  'acct.error.rate_limited': 'WHOOP 接口调用过于频繁，请稍后再试。',
  'acct.error.api_error': 'WHOOP 服务返回错误，请稍后重试。',
  'acct.error.bad_request': '请求参数不正确，请检查输入后重试。',
  'acct.error.storage_error': '本机存储读写失败，请检查插件的数据目录权限。',
  'acct.error.transport': '无法连接本机 DSH 服务，请确认插件已正常加载。',

  /* `auth/start` failures ---------------------------------------------- */
  'acct.auth_error.not_configured': '无法开始授权：请先在第三步保存 Client ID 和 Client Secret。',
  'acct.auth_error.redirect_unavailable': '无法开始授权：没有可用的回调地址。请确认 DSH 客户端运行正常后重试。',
  'acct.auth_error.redirect_insecure': '无法开始授权：WHOOP 要求回调地址使用 HTTPS。请检查回调地址配置。',
  'acct.auth_error.network': '无法开始授权：网络或本机服务异常，请稍后重试。',
  'acct.auth_error.bad_request': '无法开始授权：请求参数不正确，请检查回调地址配置。',
  'acct.auth_error.storage_error': '无法保存授权状态（本机存储错误），请重试。',
  'acct.auth_error.unavailable': '授权功能暂不可用，请刷新页面后重试。',
});

Object.assign(WHOOP_I18N.en, {
  /* Header ------------------------------------------------------------ */
  'acct.title': 'WHOOP Account',
  'acct.description.unbound': 'Complete the four steps below once, and your health data will appear here.',
  'acct.description.connected': 'Your WHOOP account is connected. You can re-authorize or disconnect at any time.',
  'acct.loading': 'Loading account status…',
  'acct.action.retry': 'Retry',

  /* Step 1: sign in to the WHOOP developer dashboard ------------------- */
  'acct.step1.title': 'Step 1: sign in to the WHOOP Developer Dashboard',
  'acct.step1.item1': 'Open the WHOOP Developer Dashboard in your browser.',
  'acct.step1.item2': 'Sign in with your WHOOP account.',
  'acct.step1.open': 'Open the WHOOP Developer Dashboard',

  /* Step 2: create a WHOOP app ----------------------------------------- */
  'acct.step2.title': 'Step 2: create a WHOOP app',
  'acct.step2.item1': 'Fill in the app name, upload a logo, and add your email and privacy statement as you prefer (optional).',
  'acct.step2.item2': 'Put the redirect URI below into Redirect #1.',
  'acct.step2.item3': 'Select the data permissions you need.',
  'acct.step2.item4': 'Click “CREATE APP” to finish creating the app.',
  'acct.step2.redirectLabel': 'Redirect URI (Redirect #1)',
  'acct.step2.copy': 'Copy',
  'acct.step2.copied': 'Copied',
  'acct.step2.copyFailed': 'Copy failed',
  'acct.step2.copyFailedHint': 'Copying failed automatically — select the URI above and copy it manually.',
  'acct.step2.redirectMissing': 'The redirect URI is not available yet. Make sure the DSH client is running, then reload this page.',

  /* Step 3: get the Client ID / Client Secret -------------------------- */
  'acct.step3.title': 'Step 3: get the Client ID / Client Secret',
  'acct.step3.item1': 'Open the WHOOP app you just created.',
  'acct.step3.item2': 'Copy the Client ID and Client Secret into the two fields below.',
  'acct.step3.clientId': 'Client ID',
  'acct.step3.clientSecret': 'Client Secret',
  'acct.step3.clientIdPlaceholder': 'Paste the Client ID',
  'acct.step3.secretPlaceholder': 'Paste the Client Secret',
  'acct.step3.secretSavedPlaceholder': 'Saved (hidden)',
  'acct.step3.edit': 'Edit',
  'acct.step3.dblclickHint': 'Double-click a field to edit the saved credentials.',
  'acct.step3.security': 'The Client Secret is stored on this machine only and is never shown again after saving.',
  'acct.step3.save': 'Save',
  'acct.step3.saving': 'Saving…',
  'acct.step3.clear': 'Clear',
  'acct.step3.clearing': 'Clearing…',
  'acct.step3.saved': 'Saved',
  'acct.step3.cleared': 'Cleared',
  'acct.step3.validation': 'Enter both the Client ID and the Client Secret.',
  'acct.step3.saveError.bad_request': 'Could not save: the Client ID and Client Secret must not be empty.',
  'acct.step3.saveError.storage_error': 'Could not save: writing to local storage failed. Check the data directory permissions.',
  'acct.step3.saveError.unavailable': 'Saving credentials is not available yet. Reload the page and try again.',
  'acct.step3.clearError.storage_error': 'Could not clear: writing to local storage failed. Check the data directory permissions.',
  'acct.step3.clearError.unavailable': 'Clearing credentials is not available yet. Reload the page and try again.',

  /* Step 4: authorize and bind the WHOOP account ----------------------- */
  'acct.step4.title': 'Step 4: authorize and bind your WHOOP account',
  'acct.step4.description': 'The button below opens the WHOOP authorization page. Sign in, approve the request, and you will be back in DSH with the account bound.',
  'acct.step4.bind': 'Bind WHOOP account',
  'acct.step4.binding': 'Opening the authorization page…',
  'acct.step4.needClientId': 'Finish step 3 first: save the Client ID.',
  'acct.step4.needSecret': 'Finish step 3 first: save the Client Secret.',
  'acct.step4.needRedirect': 'The redirect URI is unavailable. Restart the DSH client and try again.',
  'acct.step4.certHint': 'The first time the authorization page opens, the browser may warn about an untrusted certificate — choose “Advanced → Proceed to localhost”.',
  'acct.step4.waiting': 'Waiting for browser authorization…',
  'acct.step4.waitingHint': 'The authorization page was opened. This page refreshes automatically once you finish; if it did not open, use the link below.',
  'acct.step4.reopen': 'Reopen the authorization page',
  'acct.step4.timeout': 'Timed out after 5 minutes. Click “Bind WHOOP account” to try again.',
  'acct.step4.success': 'Authorization complete. Your WHOOP account is connected.',

  /* Connected state ---------------------------------------------------- */
  'acct.connected.title': 'Connected',
  'acct.connected.noProfile': 'WHOOP account connected',
  'acct.connected.expires': 'Access token expires {time}',
  'acct.connected.expired': 'The access token has expired; it renews automatically on the next request.',
  'acct.connected.reauthorize': 'Re-authorize',
  'acct.connected.reauthorizing': 'Opening the authorization page…',
  'acct.connected.disconnect': 'Disconnect',
  'acct.connected.confirmDisconnect': 'Confirm disconnect?',
  'acct.connected.disconnecting': 'Disconnecting…',
  'acct.connected.disconnected': 'WHOOP account disconnected.',

  /* Host error codes --------------------------------------------------- */
  'acct.error.detail': 'Show raw details',
  'acct.error.generic': 'Something went wrong. Please try again.',
  'acct.error.bad_response': 'The service returned an incomplete response. Please retry.',
  'acct.error.not_configured': 'The WHOOP client is not configured (the Client ID or Client Secret is missing).',
  'acct.error.auth_required': 'No WHOOP account is bound yet. Complete the binding first.',
  'acct.error.auth_denied': 'WHOOP authorization was denied or cancelled. Please authorize again.',
  'acct.error.token_expired': 'WHOOP authorization has expired. Please re-authorize.',
  'acct.error.network': 'Network request failed. Check your connection and try again.',
  'acct.error.rate_limited': 'WHOOP rate limit reached. Please try again later.',
  'acct.error.api_error': 'The WHOOP service returned an error. Please try again later.',
  'acct.error.bad_request': 'The request parameters are invalid. Check the input and try again.',
  'acct.error.storage_error': 'Local storage read/write failed. Check the plugin data directory permissions.',
  'acct.error.transport': 'Cannot reach the local DSH service. Make sure the plugin is loaded.',

  /* `auth/start` failures ---------------------------------------------- */
  'acct.auth_error.not_configured': 'Cannot start authorization: save the Client ID and Client Secret in step 3 first.',
  'acct.auth_error.redirect_unavailable': 'Cannot start authorization: no redirect URI is available. Make sure the DSH client is running and try again.',
  'acct.auth_error.redirect_insecure': 'Cannot start authorization: WHOOP requires an HTTPS redirect URI. Check the redirect URI configuration.',
  'acct.auth_error.network': 'Cannot start authorization: network or local service failure. Please try again.',
  'acct.auth_error.bad_request': 'Cannot start authorization: invalid request parameters. Check the redirect URI configuration.',
  'acct.auth_error.storage_error': 'Cannot persist the authorization state (local storage error). Please retry.',
  'acct.auth_error.unavailable': 'Authorization is not available yet. Reload the page and try again.',
});

// ---- src/client/settings.js ----
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

// ---- src/client/shell.js ----
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

    return module.exports;
  },
});
