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
