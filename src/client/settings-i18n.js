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
