const test = require('node:test');
const assert = require('node:assert');
const { detectCrash, PREPARED_TRACES } = require('../../web/rider/crash');

test('detectCrash logic', (t) => {
  // Real crash
  const resCrash = detectCrash(PREPARED_TRACES.crash);
  assert.ok(resCrash);
  assert.strictEqual(resCrash.peak_g, 8.4);
  assert.strictEqual(resCrash.pre_impact_kmh, 60);

  // False positives shouldn't trigger
  assert.strictEqual(detectCrash(PREPARED_TRACES.speed_breaker), null);
  assert.strictEqual(detectCrash(PREPARED_TRACES.pothole), null);
  assert.strictEqual(detectCrash(PREPARED_TRACES.hard_brake), null);
  
  // High G but stationary (phone drop)
  assert.strictEqual(detectCrash(PREPARED_TRACES.phone_drop_stationary), null);
});
