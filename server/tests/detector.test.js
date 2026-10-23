const test = require('node:test');
const assert = require('node:assert');
const D = require('../../web/shared/detector');

test('real crash: driving, impact, sudden stop -> countdown with peak and pre-impact speed', () => {
  const r = D.classify(D.TRACES.crash);
  assert.strictEqual(r.result, 'crash');
  assert.strictEqual(r.peak_g, 8.4);
  assert.strictEqual(r.pre_impact_kmh, 86);
});
test('speed breaker: spike but speed continues -> discarded', () => {
  const r = D.classify(D.TRACES.speed_breaker);
  assert.strictEqual(r.result, 'ignored');
  assert.strictEqual(r.reason, 'discarded');
});
test('pothole below the impact threshold is ignored', () => {
  const r = D.classify(D.TRACES.pothole);
  assert.strictEqual(r.result, 'ignored');
  assert.strictEqual(r.reason, 'below_threshold');
});
test('hard braking without an impact is ignored', () => {
  const r = D.classify(D.TRACES.hard_brake);
  assert.strictEqual(r.result, 'ignored');
  assert.strictEqual(r.reason, 'hard_brake_ignored');
});
test('a drop while stationary never arms the detector', () => {
  const r = D.classify(D.TRACES.stationary_drop);
  assert.strictEqual(r.result, 'ignored');
  assert.strictEqual(r.reason, 'ignored_not_driving');
});
test('a single spike with no driving history never fires', () => {
  const d = D.createDetector();
  const ev = d.push({ t: 0, g: 9, kmh: 60 });
  assert.ok(!ev.some(e => e.type === 'countdown'));
  assert.notStrictEqual(d.state(), 'countdown');
});
