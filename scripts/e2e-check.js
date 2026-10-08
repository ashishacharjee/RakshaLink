const assert = require('node:assert');
// Use native fetch (Node 18+)
// Or just use native fetch if available (Node 18+)
const app = require('../server/index');
const store = require('../server/store');

async function run() {
  console.log('Starting E2E check...');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.on('listening', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  
  try {
    store.reset();
    
    // 1. Rider creates SOS
    const res1 = await fetch(`${baseUrl}/api/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'accident', lat: 22.6951, lng: 88.3788, trigger: 'crash_auto' })
    });
    assert.strictEqual(res1.status, 201);
    const event = await res1.json();
    assert.ok(event.id);
    
    // 2. Triage dispatches
    const dispatches = store.getDispatchLog();
    assert.ok(dispatches.length > 0, 'Should dispatch to responders');
    const token = dispatches[0].token;
    
    // 3. Responder accepts
    const res2 = await fetch(`${baseUrl}/api/r/${token}/accept`, { method: 'POST' });
    assert.strictEqual(res2.status, 200);
    
    // 4. Responder marks Enroute
    const res3 = await fetch(`${baseUrl}/api/r/${token}/status`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'enroute', eta_minutes: 10 })
    });
    assert.strictEqual(res3.status, 200);
    
    // 5. Rider checks status
    const res4 = await fetch(`${baseUrl}/api/sos/${event.id}`);
    const finalEvent = await res4.json();
    assert.strictEqual(finalEvent.steps.enroute, true);
    assert.strictEqual(finalEvent.responder_eta_minutes, 10);
    
    console.log('E2E Check PASSED: Rider SOS -> Triage -> Dispatch -> Accept -> Enroute');
  } catch (err) {
    console.error('E2E Check FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

run();
