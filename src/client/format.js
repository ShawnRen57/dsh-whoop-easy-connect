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
