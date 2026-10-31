/**
 * Minimal WHOOP-hosted OAuth callback page.
 *
 * Served by the Host's `webServer` route; opened in the user's system browser,
 * so it must be self-contained HTML (no app assets, no theme tokens) and
 * must not echo the authorization code or tokens.
 */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Render the OAuth result page.
 * @param {object} result
 * @param {boolean} result.ok - whether the account was connected.
 * @param {string} result.titleZh - Chinese headline.
 * @param {string} result.titleEn - English headline.
 * @param {string} result.messageZh - Chinese explanation.
 * @param {string} result.messageEn - English explanation.
 * @param {string} [result.detail] - optional safe diagnostic (already sanitized).
 * @returns {string} complete HTML document.
 */
export function renderCallbackPage(result) {
  const ok = result.ok === true;
  const accent = ok ? '#12b76a' : '#ef4444';
  const glyph = ok ? '✓' : '!';
  const detail = result.detail
    ? `<p class="detail">${escapeHtml(result.detail)}</p>`
    : '';
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ok ? 'WHOOP 已连接' : 'WHOOP 连接失败'} · WHOOP Health</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #f5f6f8; color: #1d2433;
    font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
      "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    padding: 24px;
  }
  .card {
    width: min(460px, 100%); background: #fff; border-radius: 20px;
    border: 1px solid #e7e9ee; box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
    padding: 30px 30px 26px; text-align: center;
  }
  .glyph {
    width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
    margin: 0 auto 16px; font-size: 26px; font-weight: 600; color: #fff;
    background: ${accent};
  }
  h1 { margin: 0 0 8px; font-size: 19px; font-weight: 600; letter-spacing: .01em; }
  .en { margin: 0 0 16px; color: #667085; font-size: 13.5px; }
  p { margin: 0 0 10px; }
  .hint { color: #667085; font-size: 13px; }
  .detail {
    margin-top: 14px; padding: 10px 12px; border-radius: 10px; text-align: left;
    background: #f7f8fa; border: 1px solid #eceef2; color: #7a8496;
    font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-word;
  }
  button {
    margin-top: 20px; min-width: 148px; height: 38px; padding: 0 18px; cursor: pointer;
    border: 0; border-radius: 999px; background: #1d2433; color: #fff;
    font: inherit; font-size: 14px;
  }
  button:hover { background: #333d52; }
  @media (prefers-color-scheme: dark) {
    body { background: #0e1118; color: #e7eaf0; }
    .card { background: #161b26; border-color: #262d3b; box-shadow: none; }
    .en, .hint { color: #98a2b3; }
    .detail { background: #10151f; border-color: #242b39; color: #8f9bb0; }
    button { background: #e7eaf0; color: #10151f; }
    button:hover { background: #fff; }
  }
</style>
</head>
<body>
  <main class="card" role="main">
    <div class="glyph" aria-hidden="true">${glyph}</div>
    <h1>${escapeHtml(result.titleZh)}</h1>
    <p class="en">${escapeHtml(result.titleEn)}</p>
    <p>${escapeHtml(result.messageZh)}</p>
    <p class="hint">${escapeHtml(result.messageEn)}</p>
    ${detail}
    <button type="button" onclick="window.close()">关闭页面 / Close</button>
  </main>
</body>
</html>`;
}

/** Convenience wrapper for a successful connection. */
export function renderSuccessPage(profile) {
  const name = profile && (profile.firstName || profile.first_name)
    ? `${profile.firstName || profile.first_name} ${profile.lastName || profile.last_name || ''}`.trim()
    : '';
  return renderCallbackPage({
    ok: true,
    titleZh: 'WHOOP 账号已连接',
    titleEn: 'WHOOP account connected',
    messageZh: name ? `已成功绑定 ${name} 的 WHOOP 账号。` : '已成功绑定 WHOOP 账号。',
    messageEn: 'Go back to DeepSeek Harness — the dashboard will now read live WHOOP data.',
  });
}

/** Convenience wrapper for a failed connection. */
export function renderFailurePage(messageZh, messageEn, detail) {
  return renderCallbackPage({
    ok: false,
    titleZh: 'WHOOP 连接失败',
    titleEn: 'WHOOP connection failed',
    messageZh,
    messageEn,
    detail,
  });
}
