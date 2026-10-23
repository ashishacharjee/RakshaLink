/* End-to-end UI check: drives the real pages in a simulated browser against a real server.
   One-time setup:  npm i --no-save jsdom     then:  npm run check:ui                       */
let jsdom;
try { jsdom = require(process.env.JSDOM_PATH || 'jsdom'); } catch (e) { console.error('Install jsdom first: npm i --no-save jsdom'); process.exit(2); }
const { JSDOM, VirtualConsole } = jsdom;
const { createApp } = require('../server/index');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const errors = [];
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const ctx = createApp({ escalateAfterMs: 3000, rateLimit: 1000 }); const stop = ctx.start();
  const srv = await new Promise(r => { const s = ctx.app.listen(0, '127.0.0.1', () => r(s)); });
  const base = 'http://127.0.0.1:' + srv.address().port;
  // Fetch the page, inline its same-origin scripts, and drop external fonts/CDN tags (no network needed).
  const open = async path => {
    let html = await (await fetch(base + path)).text();
    html = html.replace(/<script src="\/vendor\/leaflet\/leaflet.js"><\/script>/, ''); // the map library needs a real browser; the drawn map is tested here
    for (const m of [...html.matchAll(/<script src="(\/[^"]+)"><\/script>/g)]) html = html.replace(m[0], '<script>' + (await (await fetch(base + m[1])).text()) + '</script>');
    const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(path + ': ' + e.message)); vc.on('error', e => errors.push(path + ': ' + e));
    return new JSDOM(html, { url: base + path, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(w) { w.fetch = (u, o) => { const { signal, ...r } = o || {}; return fetch(new URL(u, base), r); }; w.alert = m => errors.push('alert: ' + m); } }).window;
  };
  const q = (w, s) => w.document.querySelector(s), txt = (w, s) => (q(w, s) ? q(w, s).textContent : '');
  const click = (w, s) => q(w, s).click();

  console.log('Hub page');
  const hub = await open('/'); await sleep(200);
  ok(hub.document.querySelectorAll('.tabs button').length === 4 && q(hub, '#reset') && q(hub, '#how'), 'hub has four tabs (live, rider, console, 3D simulation), reset and how-to');

  console.log('Rider: tap Medical SOS');
  const r1 = await open('/rider'); await sleep(500);
  ok(r1.document.querySelectorAll('.tile').length === 4, 'four emergency tiles');
  ok(q(r1, '#call112').getAttribute('href') === 'tel:112', 'Call 112 is a manual tel: link');
  click(r1, '[data-cat="medical"]'); await sleep(900);
  ok(q(r1, '#status').classList.contains('on'), 'status screen opens');
  ok(/Waiting for a responder/.test(txt(r1, '#stH')), 'does NOT claim help is coming before an accept');
  ok(ctx.core.S.events.size === 1, 'server created the alert');

  console.log('Console: accept and walk every step');
  const c1 = await open('/console'); await sleep(900);
  ok(c1.document.querySelectorAll('#view option').length === 24, 'view-as lists all 24 sample responders');
  ok(txt(c1, '#qb') === '1' && c1.document.querySelectorAll('.qr').length === 1, 'alert appears in the queue');
  ok(!!q(c1, '#mapfb svg') || !!q(c1, '#leaf.leaflet-container'), 'map is drawn (fallback works offline)');
  ok(/Accept alert/.test(txt(c1, '#bAcc')) && /^\d\d:\d\d$/.test(txt(c1, '#cdv')), 'S0: Accept button and escalation countdown');
  ok(c1.document.querySelectorAll('#acts [data-step]:not(:disabled)').length === 0, 'S0: every step button disabled');
  ok(!/Alert accepted/.test(txt(c1, '#log')), 'S0: no "Alert accepted" log row yet');
  click(c1, '#bAcc'); await sleep(700);
  ok(!q(c1, '#bAcc') && !q(c1, '#cdv'), 'S1: Accept buttons and countdown gone');
  ok(/On my way/.test(txt(c1, '#bStep')) && /Alert accepted/.test(txt(c1, '#detail')), 'S1: banner "Alert accepted", only On my way');
  click(c1, '#bStep'); await sleep(700);
  ok(/Arrived/.test(txt(c1, '#bStep')) && /On the way/.test(txt(c1, '#detail')), 'S2: On the way, next is Arrived');
  q(c1, '#eta').value = '9'; click(c1, '#etaGo'); await sleep(700);
  ok(/9 min/.test(txt(c1, '#prog')), "responder's own estimate shown (typed, never computed)");
  click(c1, '#bStep'); await sleep(700); ok(/Resolved/.test(txt(c1, '#bStep')), 'S3: Arrived, next is Resolved');
  click(c1, '#bStep'); await sleep(700);
  ok(/Back to alerts/.test(txt(c1, '#detail')) && !!q(c1, '#detail button[disabled]'), 'S4: disabled Resolved plus Back to alerts');
  await sleep(2300);
  ok(/Resolved/.test(txt(r1, '#stH')), 'rider screen followed every real step');

  console.log('Rider: crash simulation');
  const n0 = ctx.core.S.events.size, r2 = await open('/rider'); await sleep(400);
  r2.__rider.runTrace('crash'); await sleep(5200);
  const cdn = Number(txt(r2, '#cdN')); ok(q(r2, '#countdown').classList.contains('on') && cdn >= 17 && cdn <= 20, 'impact + sudden stop -> 20 s countdown running (' + cdn + ' s left)');
  click(r2, '#cdNow'); await sleep(900);
  const ev = [...ctx.core.S.events.values()].pop();
  ok(ev.trigger === 'crash_auto' && ev.category === 'accident' && ev.peak_g === 8.4 && ev.pre_impact_kmh === 86, 'automatic Accident alert with crash data');
  ok(new Set(ctx.core.S.dispatches.filter(d => d.sosId === ev.id).map(d => d.type)).size === 2, 'accident notified hospital AND police');
  ok(/Automatic crash alert/.test(txt(r2, '#stBadges')), 'rider status labels it an automatic crash alert');
  const r3 = await open('/rider'); await sleep(400);
  const n1 = ctx.core.S.events.size; r3.__rider.runTrace('speed_breaker'); await sleep(5200);
  ok(/Speed breaker ignored/.test(txt(r3, '#dmMsg')) && ctx.core.S.events.size === n1, 'speed breaker ignored, nothing sent');
  const r3b = await open('/rider'); await sleep(300); r3b.__rider.runTrace('crash'); await sleep(4600); click(r3b, '#cdOk'); await sleep(300);
  ok(ctx.core.S.events.size === n1 && !q(r3b, '#countdown').classList.contains('on'), '"I\'m OK" cancels, nothing sent');

  console.log('Rider: offline mode');
  const r4 = await open('/rider'); await sleep(400), before = ctx.core.S.events.size;
  const fo = q(r4, '#fo'); fo.checked = true; fo.dispatchEvent(new r4.Event('change')); click(r4, '[data-cat="fuel"]'); await sleep(500);
  ok(!q(r4, '#fo2').hidden, 'offline screen offers a way to turn the signal back on');
  ok(q(r4, '#offline').classList.contains('on') && r4.__rider.queue().length === 1 && ctx.core.S.events.size === before, 'no signal: alert saved on the phone, nothing sent');
  let lit = false, dark = false; for (let i = 0; i < 12; i++) { q(r4, '#offline').classList.contains('lit') ? lit = true : dark = true; await sleep(100); }
  ok(lit && dark, 'Morse SOS flashes the screen');
  ok(/^sms:\?body=RL1%7CF%7C/.test(q(r4, '#smsBtn').getAttribute('href')), 'prefilled SMS fallback is built');
  click(r4, '#fo2'); await sleep(1000);
  const fev = [...ctx.core.S.events.values()].pop();
  ok(r4.__rider.queue().length === 0 && fev.category === 'fuel' && fev.delivered_from_queue === true, 'signal back: delivered from the saved queue');
  ok(/Delivered from queue/.test(txt(r4, '#stBadges')), 'tagged "Delivered from queue"');

  console.log('Escalation and the SMS link page');
  const es = ctx.core.createEvent({ category: 'breakdown', lat: 22.6951, lng: 88.3788 }).event;
  await sleep(4600);
  ok(ctx.core.S.dispatches.filter(d => d.sosId === es.id).length === 2, 'no response in time -> next-nearest responder contacted');
  const med = ctx.core.createEvent({ category: 'medical', lat: 22.6951, lng: 88.3788 }).event;
  const dd = ctx.core.S.dispatches.filter(d => d.sosId === med.id)[0];
  const a1 = await open(dd.accept_url); await sleep(900);
  ok(/Accept alert/.test(txt(a1, '#go')) && /^\d\d:\d\d$/.test(txt(a1, '#cdv')), 'SMS page: Accept and countdown');
  click(a1, '#go'); await sleep(900);
  ok(/Alert accepted/.test(txt(a1, '.banner')) && /On my way/.test(txt(a1, '#go')), 'SMS page after accept: one step button');
  const bad = await open('/r/' + 'a'.repeat(32)); await sleep(700);
  ok(/not valid/.test(txt(bad, '#body')), 'bad link shows a clear message');

  ok(errors.length === 0, 'no script errors in any page' + (errors.length ? ' -> ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`\n${pass} passed, ${fail} failed`); stop(); srv.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
