const test = require('node:test');
const assert = require('node:assert');
const { createCore, TRIAGE } = require('../core');
const seed = require('../data/responders.json');
const P = { lat: 22.6951, lng: 88.3788 };
function mk() { let t = 1000000; const c = createCore({ seed, now: () => t, escalateAfterMs: 20000 }); return { c, adv: ms => { t += ms; c.tick(); } }; }
const types = c => [...new Set(c.S.dispatches.map(d => d.type))].sort();

test('triage mapping', () => {
  assert.deepStrictEqual(TRIAGE, { medical: ['hospital'], accident: ['hospital', 'police'], breakdown: ['mechanic'], fuel: ['fuel_pump'] });
});
test('each category notifies the right responder types, nearest first', () => {
  const want = { medical: ['hospital'], accident: ['hospital', 'police'], breakdown: ['mechanic'], fuel: ['fuel_pump'] };
  for (const [cat, w] of Object.entries(want)) {
    const { c } = mk(); c.createEvent({ category: cat, ...P });
    assert.deepStrictEqual(types(c), w.slice().sort(), cat);
  }
  const { c } = mk(); c.createEvent({ category: 'medical', ...P });
  assert.strictEqual(c.S.dispatches[0].distance_m, 4200);
});
test('accident: accept, steps must go in order, estimate only after accept', () => {
  const { c } = mk(); const { event } = c.createEvent({ category: 'accident', trigger: 'crash_auto', peak_g: 8.4, pre_impact_kmh: 86, ...P });
  const h = c.S.dispatches.find(d => d.type === 'hospital');
  assert.strictEqual(c.step(h, 'enroute').code, 409);
  assert.strictEqual(c.step(h, null, 8).code, 409);
  assert.ok(c.accept(h).ok);
  assert.strictEqual(c.step(h, 'arrived').code, 409);
  assert.ok(c.step(h, 'enroute', 8).ok);
  assert.strictEqual(c.view(event).responder_eta_minutes, 8);
  assert.ok(c.step(h, 'arrived').ok); assert.ok(c.step(h, 'resolved').ok);
  assert.strictEqual(c.view(event).status, 'resolved');
  assert.strictEqual(c.step(h, null, 999).code, 400);
});
test('rider never sees accepted before a responder accepts', () => {
  const { c } = mk(); const { event } = c.createEvent({ category: 'medical', ...P });
  const v = c.view(event);
  assert.strictEqual(v.steps.accepted, false); assert.strictEqual(v.status, 'dispatched');
  assert.strictEqual(v.responder_eta_minutes, null);
});
test('escalation: no accept in 20 s goes to the next-nearest, then unanswered after 3', () => {
  const { c, adv } = mk(); const { event } = c.createEvent({ category: 'medical', ...P });
  assert.strictEqual(c.S.dispatches.length, 1);
  adv(19000); assert.strictEqual(c.S.dispatches.length, 1);
  adv(1500); assert.strictEqual(c.S.dispatches.length, 2);
  assert.strictEqual(c.S.dispatches[0].status, 'missed');
  adv(21000); assert.strictEqual(c.S.dispatches.length, 3);
  adv(21000);
  assert.strictEqual(c.S.dispatches.length, 3);
  assert.strictEqual(c.view(event).status, 'unanswered');
  const names = c.S.dispatches.map(d => d.responderId); assert.strictEqual(new Set(names).size, 3);
});
test('decline escalates immediately; late accept of a missed dispatch is refused', () => {
  const { c, adv } = mk(); c.createEvent({ category: 'fuel', ...P });
  const d1 = c.S.dispatches[0]; assert.ok(c.decline(d1).ok); assert.strictEqual(c.S.dispatches.length, 2);
  const d2 = c.S.dispatches[1]; adv(21000); assert.strictEqual(d2.status, 'missed');
  assert.strictEqual(c.accept(d2).code, 409);
});
test('off-duty responders are skipped', () => {
  const { c } = mk(); c.S.responders.filter(r => r.type === 'hospital').forEach(r => { r.on_duty = false; });
  const { event } = c.createEvent({ category: 'medical', ...P });
  assert.strictEqual(c.view(event).status, 'unanswered');
});
test('idempotent by client_id', () => {
  const { c } = mk(); const a = c.createEvent({ category: 'fuel', client_id: 'x1', ...P }); const b = c.createEvent({ category: 'fuel', client_id: 'x1', ...P });
  assert.strictEqual(b.duplicate, true); assert.strictEqual(a.event.id, b.event.id); assert.strictEqual(c.S.events.size, 1);
});
test('queued delivery is tagged, role view filters, tokens expire', () => {
  const { c, adv } = mk(); const { event } = c.createEvent({ category: 'accident', queued: true, client_ts: '2026-10-08T10:00:00Z', ...P });
  assert.strictEqual(c.view(event).delivered_from_queue, true);
  assert.ok(c.view(event).event_log.some(l => l.event === 'Delivered from queue'));
  const hosp = c.S.responders.find(r => r.id === c.S.dispatches.find(d => d.type === 'hospital').responderId);
  assert.strictEqual(c.eventsFor(hosp.id).length, 1);
  const other = c.S.responders.find(r => r.type === 'mechanic'); assert.strictEqual(c.eventsFor(other.id).length, 0);
  const url = c.S.dispatches[0].accept_url.split('/r/')[1];
  assert.ok(c.dispatchByToken(url)); assert.strictEqual(c.dispatchByToken('0'.repeat(32)), null);
  adv(3 * 60 * 60 * 1000); assert.strictEqual(c.dispatchByToken(url), null);
});
test('metrics are computed from real events only', () => {
  const { c } = mk(); assert.strictEqual(c.metrics().median_dispatch_ms, null);
  c.createEvent({ category: 'fuel', ...P }); assert.strictEqual(c.metrics().n_dispatch, 1);
});
