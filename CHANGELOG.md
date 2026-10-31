# Changelog

## [1.0.0] — 2026-10-31

First public release.

- **Easy connect**: a four-step setup wizard in DSH Settings creates the WHOOP app, copies the local HTTPS callback URL, stores the Client ID / Secret on-device, and runs the OAuth authorization.
- **Automatic sync**: the dashboard loads the latest 30 days on every visit and refreshes access tokens with the `offline` scope.
- **Dedicated dashboard**: recovery / strain / sleep rings, today's metrics, 7/14/30-day trends, sleep stages, workout log with heart-rate zones, and body/profile data.
- Bilingual UI (Chinese / English), light and dark theme support, manual refresh, and a built-in local HTTPS OAuth callback with an auto-generated self-signed certificate.
- Privacy: tokens and credentials stay local (`state.json`, mode 0600); only the official WHOOP API is contacted.
