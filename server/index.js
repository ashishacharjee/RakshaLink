'use strict';
const express = require('express');
const path = require('path');
const { createCore } = require('./core');
const { TRIAGE, TRIGGERS } = require('./triage');

const PRESETS = [
  { id: 'campus', name: 'GNIT campus, Sodepur (demo)', lat: 22.6951, lng: 88.3788 },
  { id: 'nh19', name: 'NH-19 sample point (demo)', lat: 23.2542, lng: 87.8731 }
];
const SMS_CAT = { M: 'medical', A: 'accident', B: 'breakdown', F: 'fuel' };

function parseSOS(b) {
  b = b || {};
  if (!TRIAGE[b.category]) return { error: 'invalid_category' };
  const trigger = b.trigger === undefined ? 'manual' : b.trigger;
  if (!TRIGGERS.includes(trigger)) return { error: 'invalid_trigger' };
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { error: 'invalid_location' };
  const num = (v, max) => v === undefined || v === null ? null : (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= max ? Number(v) : NaN);
  const peak_g = num(b.peak_g, 50), pre = num(b.pre_impact_kmh, 400);
  if (Number.isNaN(peak_g) || Number.isNaN(pre)) return { error: 'invalid_crash_data' };
  const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : null;
  return { data: { category: b.category, trigger, lat, lng, peak_g, pre_impact_kmh: pre, client_id: str(b.client_id, 64),
    client_ts: str(b.client_ts, 40), queued: b.queued === true, via: b.via === 'sms' ? 'sms' : 'api' } };
}

function createApp(opts = {}) {
  const env = opts.env || process.env;
  const DEMO = env.DEMO_MODE !== 'false';
  const escalateAfterMs = opts.escalateAfterMs != null ? opts.escalateAfterMs : parseInt(env.ESCALATE_AFTER_S || '20', 10) * 1000;
  const COUNTDOWN_S = parseInt(env.COUNTDOWN_S || '20', 10);
  const clients = new Set();
  const emit = (event, data) => { const m = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`; for (const r of clients) r.write(m); };
  const core = createCore({ seed: require('./data/responders.json'), now: opts.now, escalateAfterMs, emit });
  const now = opts.now || (() => Date.now());
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // OpenStreetMap tile servers require a Referer
    res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
    next();
  });
  app.use(express.json({ limit: '20kb' }));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));

  // Rate limit only the endpoints that create alerts (polling must never be throttled).
  const hits = new Map(), LIMIT = opts.rateLimit || 30;
  function limiter(req, res, next) {
    const t = now(), key = req.ip || 'x', arr = (hits.get(key) || []).filter(x => t - x < 60000);
    if (arr.length >= LIMIT) return res.status(429).json({ error: 'rate_limited' });
    arr.push(t); hits.set(key, arr); next();
  }
  const demoOnly = (req, res, next) => DEMO ? next() : res.status(403).json({ error: 'demo_mode_off' });
  const out = (res, r, okStatus = 200) => r.error ? res.status(r.code || 400).json({ error: r.error }) : res.status(okStatus).json(r);

  // ---- pages ----
  const web = path.join(__dirname, '..', 'web');
  app.get('/rider', (q, s) => s.sendFile(path.join(web, 'rider', 'index.html')));
  app.get('/console', (q, s) => s.sendFile(path.join(web, 'console', 'index.html')));
  app.get('/r/:token', (q, s) => s.sendFile(path.join(web, 'accept', 'index.html')));
  app.get(/^\/simulation$/, (q, s) => s.redirect(301, '/simulation/')); // exact match only: the page needs the trailing slash for banner.jpeg
  app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
  app.use(express.static(web));

  // ---- api ----
  app.get(['/health', '/api/health'], (q, s) => s.json({ ok: true }));
  app.get('/api/config', (q, s) => s.json({ countdown_s: COUNTDOWN_S, escalate_after_s: Math.round(escalateAfterMs / 1000), demo_mode: DEMO, presets: PRESETS }));
  app.get('/api/responders', (q, s) => s.json(core.S.responders.map(({ id, name, type, lat, lng, on_duty, preset, is_demo }) => ({ id, name, type, lat, lng, on_duty, preset, is_demo }))));
  app.post('/api/responders/:id/duty', demoOnly, (q, s) => {
    const r = core.S.responder(q.params.id);
    if (!r) return s.status(404).json({ error: 'not_found' });
    r.on_duty = q.body.on_duty === true; emit('duty', { id: r.id }); s.json({ ok: true, on_duty: r.on_duty });
  });
  app.post('/api/dev/reset', demoOnly, (q, s) => { core.reset(); emit('reset', {}); s.json({ ok: true }); });
  app.get('/api/metrics', (q, s) => s.json(core.metrics()));

  app.post('/api/sos', limiter, (q, s) => {
    const p = parseSOS(q.body);
    if (p.error) return s.status(400).json({ error: p.error });
    const { event, duplicate } = core.createEvent(p.data);
    const v = core.view(event);
    s.status(duplicate ? 200 : 201).json({ id: v.id, status: v.status, duplicate, matches: v.responders, dispatch: v.responders.map(r => ({ name: r.name, method: 'sms+voice', simulated: true })) });
  });
  app.get('/api/sos/:id', (q, s) => {
    const ev = core.S.events.get(q.params.id);
    if (!ev) return s.status(404).json({ error: 'not_found' });
    const { event_log, ...v } = core.view(ev); s.json(v);
  });
  app.post('/api/sms/inbound', limiter, (q, s) => {
    const body = String((q.body && (q.body.body || q.body.Body)) || '');
    const m = body.trim().match(/^RL1\|([MABF])\|(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\|(\d+)(\|C)?$/);
    if (!m) return s.status(400).json({ error: 'invalid_payload' });
    const p = parseSOS({ category: SMS_CAT[m[1]], trigger: m[5] ? 'crash_auto' : 'manual', lat: m[2], lng: m[3],
      client_id: 'sms-' + m[4] + '-' + m[1] + m[2], client_ts: new Date(Number(m[4]) * 1000).toISOString(), via: 'sms' });
    if (p.error) return s.status(400).json({ error: p.error });
    const { event } = core.createEvent(p.data); s.status(201).json({ ok: true, id: event.id });
  });

  // console (demo only): acts as the chosen responder through the same core functions as the SMS link
  app.get('/api/events', demoOnly, (q, s) => s.json({ server_now: now(), events: core.eventsFor(q.query.responder_id) }));
  const consoleAct = (act) => (q, s) => {
    const d = core.dispatchFor(q.params.rid, q.params.id);
    if (!d) return s.status(404).json({ error: 'not_found' });
    out(s, act(d, q.body || {}));
  };
  app.post('/api/console/:rid/events/:id/accept', demoOnly, consoleAct(d => core.accept(d)));
  app.post('/api/console/:rid/events/:id/decline', demoOnly, consoleAct(d => core.decline(d)));
  app.post('/api/console/:rid/events/:id/status', demoOnly, consoleAct((d, b) => core.step(d, b.step, b.eta_minutes)));

  // responder link (the page the SMS would open)
  const tokenAct = (act) => (q, s) => {
    const d = core.dispatchByToken(q.params.token);
    if (!d) return s.status(403).json({ error: 'invalid_or_expired' });
    out(s, act(d, q.body || {}));
  };
  app.get('/api/r/:token', (q, s) => {
    const d = core.dispatchByToken(q.params.token);
    if (!d) return s.status(403).json({ error: 'invalid_or_expired' });
    const r = core.S.responder(d.responderId), { event_log, ...ev } = core.view(core.S.events.get(d.sosId));
    const { accept_url, ...my } = core.myView(d);
    s.json({ server_now: now(), event: ev, my, responder: { name: r.name, type: r.type } });
  });
  app.post('/api/r/:token/accept', tokenAct(d => core.accept(d)));
  app.post('/api/r/:token/decline', tokenAct(d => core.decline(d)));
  app.post('/api/r/:token/status', tokenAct((d, b) => core.step(d, b.step, b.eta_minutes)));

  app.get('/api/stream', (q, s) => {
    s.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    s.write('retry: 2000\n\n'); clients.add(s); q.on('close', () => clients.delete(s));
  });
  app.use('/api', (q, s) => s.status(404).json({ error: 'not_found' }));

  function start() {
    const t1 = setInterval(() => core.tick(), 1000);
    const t2 = setInterval(() => { for (const r of clients) r.write(`event: heartbeat\ndata: ${Date.now()}\n\n`); }, 15000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }
  return { app, core, start, emit };
}
module.exports = { createApp, parseSOS };

if (require.main === module) {
  const { app, start } = createApp();
  start();
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => console.log(`RakshaLink running on http://localhost:${port}  (demo mode, dispatch is SIMULATED)`));
}
