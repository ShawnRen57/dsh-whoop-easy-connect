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
