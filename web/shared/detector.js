/* RakshaLink Drive Mode crash detector: a pure state machine, runs in the browser and in Node tests.
   A single spike never triggers it. Needs: driving speed, an impact spike, then a sudden stop.
   Thresholds are starting values for a prototype and are NOT validated on real crashes. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.RLDetector = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const CONFIG = { ARM_KMH: 20, ARM_SECONDS: 3, IMPACT_G: 4.0, WATCH_G: 2.5, VERIFY_S: 3, STOP_KMH: 5 };
  const r1 = n => Math.round(n * 10) / 10;

  function createDetector(over) {
    const cfg = Object.assign({}, CONFIG, over);
    let st = 'idle', armT = null, impact = null, hist = [], watchT = -99;
    function push(s) { // s = { t (seconds), g (g-force magnitude), kmh }
      const ev = [];
      hist.push(s); while (hist.length && s.t - hist[0].t > 2) hist.shift();
      if (st === 'idle') {
        if (s.g >= cfg.IMPACT_G) { if (s.t - watchT > 1) ev.push({ type: 'ignored_not_driving' }); watchT = s.t; }
        if (s.kmh >= cfg.ARM_KMH) {
          if (armT === null) armT = s.t;
          if (s.t - armT >= cfg.ARM_SECONDS) { st = 'armed'; ev.push({ type: 'armed' }); }
        } else armT = null;
      } else if (st === 'armed') {
        if (s.kmh < cfg.ARM_KMH) {
          const recentMax = Math.max.apply(null, hist.map(h => h.kmh));
          st = 'idle'; armT = null;
          ev.push({ type: recentMax - s.kmh >= 20 ? 'hard_brake_ignored' : 'disarmed' });
        } else if (s.g >= cfg.IMPACT_G) {
          const pre = Math.max.apply(null, hist.filter(h => h.t < s.t).map(h => h.kmh).concat([s.kmh]));
          impact = { t: s.t, peak: s.g, pre }; st = 'verifying';
          ev.push({ type: 'impact', peak_g: r1(s.g), pre_impact_kmh: Math.round(pre) });
        } else if (s.g >= cfg.WATCH_G && s.t - watchT > 1) {
          watchT = s.t; ev.push({ type: 'below_threshold', peak_g: r1(s.g) });
        }
      } else if (st === 'verifying') {
        impact.peak = Math.max(impact.peak, s.g);
        if (s.kmh <= cfg.STOP_KMH) {
          st = 'countdown';
          ev.push({ type: 'countdown', peak_g: r1(impact.peak), pre_impact_kmh: Math.round(impact.pre) });
        } else if (s.t - impact.t >= cfg.VERIFY_S) {
          st = 'armed'; ev.push({ type: 'discarded', reason: 'speed_continued', peak_g: r1(impact.peak) });
        }
      }
      return ev;
    }
    return { push, state: () => st, reset: () => { st = 'idle'; armT = null; impact = null; hist = []; watchT = -99; }, config: cfg };
  }

  // Prepared sample traces at 10 Hz. Values are scripted samples, not real sensor data.
  function build(fn, dur) { const a = []; for (let i = 0; i <= dur * 10; i++) { const t = i / 10, o = fn(t); a.push({ t, g: o.g, kmh: o.kmh }); } return a; }
  const base = t => 1 + 0.05 * Math.sin(t * 7);
  const TRACES = {
    crash: build(t => ({ kmh: t < 5 ? 86 : Math.max(0, 86 * (1 - (t - 5) / 1.2)), g: t >= 5 && t < 5.1 ? 8.4 : base(t) }), 8),
    speed_breaker: build(t => ({ kmh: t < 5 ? 86 : 80, g: t >= 5 && t < 5.1 ? 4.6 : base(t) }), 9),
    pothole: build(t => ({ kmh: 86, g: t >= 5 && t < 5.1 ? 3.4 : base(t) }), 7),
    hard_brake: build(t => ({ kmh: t < 4 ? 86 : Math.max(0, 86 * (1 - (t - 4) / 3)), g: Math.min(1.6, base(t) + (t >= 4 && t < 7 ? .5 : 0)) }), 9),
    stationary_drop: build(t => ({ kmh: 0, g: t >= 3 && t < 3.1 ? 9 : base(t) }), 6)
  };
  // Runs a trace through a fresh detector. Returns the final decision for tests and the UI summary.
  function classify(trace, over) {
    const d = createDetector(over), events = [];
    trace.forEach(s => d.push(s).forEach(e => events.push(e)));
    const c = events.find(e => e.type === 'countdown');
    return c ? { result: 'crash', peak_g: c.peak_g, pre_impact_kmh: c.pre_impact_kmh, events }
      : { result: 'ignored', reason: (events.filter(e => e.type !== 'armed' && e.type !== 'disarmed').pop() || { type: 'none' }).type, events };
  }
  return { CONFIG, createDetector, TRACES, classify };
});
