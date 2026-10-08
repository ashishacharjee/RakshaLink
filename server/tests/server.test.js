const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const store = require('../store');

// Mock request helper (since no supertest allowed)
const http = require('http');
let server;
let baseUrl;

test.before((t) => {
  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after((t) => {
  server.close();
});

test.beforeEach(() => {
  store.reset();
});

async function req(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

test('GET /health', async (t) => {
  const res = await req('GET', '/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ok');
});

test('POST /api/sos - Validation & Idempotency', async (t) => {
  // Invalid category
  let res = await req('POST', '/api/sos', { category: 'invalid', lat: 10, lng: 10 });
  assert.strictEqual(res.status, 400);

  // Missing lat/lng
  res = await req('POST', '/api/sos', { category: 'medical' });
  assert.strictEqual(res.status, 400);

  // Success
  res = await req('POST', '/api/sos', { category: 'medical', lat: 22.6, lng: 88.4, client_id: 'c1' });
  assert.strictEqual(res.status, 201);
  const id = res.data.id;

  // Idempotency
  const res2 = await req('POST', '/api/sos', { category: 'medical', lat: 22.6, lng: 88.4, client_id: 'c1' });
  assert.strictEqual(res2.status, 201);
  assert.strictEqual(res2.data.id, id);
});

test('Responder accept/status flow', async (t) => {
  // Trigger SOS
  const sosRes = await req('POST', '/api/sos', { category: 'medical', lat: 22.6951, lng: 88.3788 });
  const event = sosRes.data;
  assert.strictEqual(event.steps.notified, true);
  
  // Extract mock dispatch token
  const dispatches = store.getDispatchLog();
  assert.ok(dispatches.length > 0);
  const token = dispatches[0].token;

  // Verify status before accept
  const beforeRes = await req('GET', `/api/sos/${event.id}`);
  assert.strictEqual(beforeRes.data.steps.accepted, false);

  // Accept
  const acceptRes = await req('POST', `/api/r/${token}/accept`);
  assert.strictEqual(acceptRes.status, 200);

  // Accept twice should work or state conflict if resolved, but simple accept should just ok
  // Wait, let's verify step order rules (enroute -> arrived -> resolved)
  
  // Status: Arrived (should fail, skip enroute)
  let statusRes = await req('POST', `/api/r/${token}/status`, { step: 'arrived' });
  assert.strictEqual(statusRes.status, 409);

  // Status: Enroute
  statusRes = await req('POST', `/api/r/${token}/status`, { step: 'enroute', eta_minutes: 5 });
  assert.strictEqual(statusRes.status, 200);

  // Status: Arrived
  statusRes = await req('POST', `/api/r/${token}/status`, { step: 'arrived' });
  assert.strictEqual(statusRes.status, 200);
  
  // Status: Resolved
  statusRes = await req('POST', `/api/r/${token}/status`, { step: 'resolved' });
  assert.strictEqual(statusRes.status, 200);

  // Verify final state
  const finalRes = await req('GET', `/api/sos/${event.id}`);
  assert.strictEqual(finalRes.data.steps.resolved, true);
  assert.strictEqual(finalRes.data.responder_eta_minutes, 5);
});
