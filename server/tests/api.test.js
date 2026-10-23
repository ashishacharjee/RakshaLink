const test = require('node:test');
const assert = require('node:assert');
const { createApp, parseSOS } = require('../index');
let srv, base, ctx;
test.before(async () => {
  ctx = createApp({ escalateAfterMs: 20000, rateLimit: 1000 });
  await new Promise(r => { srv = ctx.app.listen(0, '127.0.0.1', r); });
  base = 'http://127.0.0.1:' + srv.address().port;
});
test.after(() => srv.close());
const j = (p, o = {}) => fetch(base + p, { ...o, headers: { 'Content-Type': 'application/json' }, body: o.body ? JSON.stringify(o.body) : undefined }).then(async r => ({ s: r.status, b: await r.json().catch(() => null) }));
const P = { lat: 22.6951, lng: 88.3788 };

test('health and config', async () => {
  assert.strictEqual((await j('/health')).b.ok, true);
  const c = (await j('/api/config')).b; assert.strictEqual(c.countdown_s, 20); assert.strictEqual(c.presets.length, 2);
});
test('validation', async () => {
  assert.strictEqual((await j('/api/sos', { method: 'POST', body: { category: 'nope', ...P } })).s, 400);
  assert.strictEqual((await j('/api/sos', { method: 'POST', body: { category: 'fuel', lat: 999, lng: 1 } })).s, 400);
  assert.strictEqual((await j('/api/sos', { method: 'POST', body: { category: 'fuel', trigger: 'voice', ...P } })).s, 400);
  assert.strictEqual(parseSOS({ category: 'fuel', ...P, peak_g: 'abc' }).error, 'invalid_crash_data');
});
test('full flow: SOS, console accept, steps, rider status', async () => {
  const r = await j('/api/sos', { method: 'POST', body: { category: 'accident', trigger: 'crash_auto', peak_g: 8.4, pre_impact_kmh: 86, client_id: 'api-1', ...P } });
  assert.strictEqual(r.s, 201); assert.strictEqual(r.b.matches.length, 2);
  const id = r.b.id, hosp = ctx.core.S.responders.find(x => x.name === 'Sample City Hospital').id;
  const ev = (await j('/api/events?responder_id=' + hosp)).b; assert.strictEqual(ev.events.length, 1); assert.strictEqual(ev.events[0].my.status, 'pending');
  assert.strictEqual((await j(`/api/console/${hosp}/events/${id}/status`, { method: 'POST', body: { step: 'enroute' } })).s, 409);
  assert.strictEqual((await j(`/api/console/${hosp}/events/${id}/accept`, { method: 'POST' })).s, 200);
  assert.strictEqual((await j(`/api/console/${hosp}/events/${id}/status`, { method: 'POST', body: { step: 'enroute', eta_minutes: 7 } })).s, 200);
  const st = (await j('/api/sos/' + id)).b;
  assert.strictEqual(st.steps.enroute, true); assert.strictEqual(st.responder_eta_minutes, 7); assert.strictEqual(st.event_log, undefined);
  assert.strictEqual((await j('/api/sos', { method: 'POST', body: { category: 'accident', client_id: 'api-1', ...P } })).b.duplicate, true);
});
test('token link: GET, accept, wrong token refused, no accept_url leaked', async () => {
  const r = await j('/api/sos', { method: 'POST', body: { category: 'breakdown', client_id: 'api-2', ...P } });
  const d = ctx.core.S.dispatches.find(x => x.sosId === r.b.id), tok = d.accept_url.split('/r/')[1];
  const g = await j('/api/r/' + tok); assert.strictEqual(g.s, 200); assert.strictEqual(g.b.my.accept_url, undefined); assert.strictEqual(g.b.responder.type, 'mechanic');
  assert.strictEqual((await j('/api/r/' + 'a'.repeat(32))).s, 403);
  assert.strictEqual((await j(`/api/r/${tok}/accept`, { method: 'POST' })).s, 200);
  assert.strictEqual((await j(`/api/r/${tok}/accept`, { method: 'POST' })).s, 409);
});
test('sms fallback payload creates an alert', async () => {
  const ok = await j('/api/sms/inbound', { method: 'POST', body: { body: 'RL1|A|22.6951,88.3788|1790000000|C' } });
  assert.strictEqual(ok.s, 201);
  const ev = ctx.core.S.events.get(ok.b.id); assert.strictEqual(ev.trigger, 'crash_auto'); assert.strictEqual(ev.via, 'sms');
  assert.strictEqual((await j('/api/sms/inbound', { method: 'POST', body: { body: 'hello' } })).s, 400);
});
test('duty toggle, reset, metrics, pages', async () => {
  const id = ctx.core.S.responders.find(x => x.type === 'fuel_pump').id;
  assert.strictEqual((await j(`/api/responders/${id}/duty`, { method: 'POST', body: { on_duty: false } })).b.on_duty, false);
  assert.strictEqual((await j('/api/metrics')).b.n_dispatch >= 1, true);
  assert.strictEqual((await j('/api/dev/reset', { method: 'POST' })).b.ok, true);
  assert.strictEqual((await j('/api/metrics')).b.events, 0);
  assert.strictEqual(ctx.core.S.responder(id).on_duty, true);
  for (const p of ['/', '/rider', '/console', '/simulation/', '/shared/detector.js', '/assets/emblem.svg', '/simulation/banner.jpeg', '/vendor/leaflet/leaflet.js', '/vendor/leaflet/leaflet.css', '/vendor/fonts/dm-sans-400.woff2', '/vendor/fonts/noto-serif-600.woff2']) {
    assert.strictEqual((await fetch(base + p)).status, 200, p);
  }
  assert.strictEqual((await fetch(base + '/simulation', { redirect: 'manual' })).status, 301);
});
test('referrer policy lets OpenStreetMap tiles load (they refuse requests with no referrer)', async () => {
  const r = await fetch(base + '/console');
  assert.strictEqual(r.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});
test('rate limit only applies to alert creation, never to polling', async () => {
  const c2 = createApp({ rateLimit: 3 }); const s2 = await new Promise(r => { const x = c2.app.listen(0, '127.0.0.1', () => r(x)); });
  const b = 'http://127.0.0.1:' + s2.address().port; const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await fetch(b + '/api/sos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'fuel', ...P }) })).status);
  assert.deepStrictEqual(codes, [201, 201, 201, 429, 429]);
  for (let i = 0; i < 50; i++) assert.strictEqual((await fetch(b + '/api/config')).status, 200);
  s2.close();
});
