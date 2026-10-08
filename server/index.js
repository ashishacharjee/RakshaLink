const express = require('express');
const path = require('path');
const store = require('./store');
const { TRIAGE } = store;

const app = express();
app.use(express.json());

// Rate Limiting
const rateLimits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const records = rateLimits.get(ip) || [];
  const valid = records.filter(ts => now - ts < 60000); // 1 min window
  if (valid.length >= 30) return res.status(429).json({ error: 'Too many requests' });
  valid.push(now);
  rateLimits.set(ip, valid);
  next();
}

app.use('/api', rateLimit);

// Serve static pages
const webPath = path.join(__dirname, '../web');
app.use(express.static(webPath));
app.get('/rider', (req, res) => res.sendFile(path.join(webPath, 'rider/index.html')));
app.get('/console', (req, res) => res.sendFile(path.join(webPath, 'console/index.html')));
app.get('/r/:token', (req, res) => res.sendFile(path.join(webPath, 'accept/index.html')));

// SSE Setup
const clients = new Set();
function broadcast(event, data) {
  for (const res of clients) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

setInterval(() => {
  for (const res of clients) {
    res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
  }
}, 15000);

// API Endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/dev/reset', (req, res) => { store.reset(); broadcast('reset', {}); res.json({ ok: true }); });
app.get('/api/metrics', (req, res) => res.json({ events: store.getEvents().length, dispatches: store.getDispatchLog().length }));
app.get('/api/dispatch-log', (req, res) => res.json(store.getDispatchLog()));
app.get('/api/events', (req, res) => res.json(store.getEvents()));
app.get('/api/responders', (req, res) => res.json(store.getResponders()));

app.post('/api/responders/:id/duty', (req, res) => {
  const r = store.getResponders().find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.on_duty = !!req.body.on_duty;
  res.json({ ok: true });
});

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

// Create SOS
function dispatchToNearest(event) {
  const neededTypes = TRIAGE[event.category];
  const excludes = store.dispatches.filter(d => d.sosId === event.id).map(d => d.responderId);
  const candidates = store.findNearest(event.lat, event.lng, neededTypes, excludes);
  
  if (candidates.length === 0 || event.escalation_level >= 3) {
    event.steps.unanswered = true;
    broadcast('status', event);
    return;
  }
  
  // Pick one per needed type (if available)
  for (const type of neededTypes) {
    const r = candidates.find(c => c.type === type);
    if (r) {
      const { rawToken } = store.createToken(event.id, r.id);
      store.dispatches.push({
        id: crypto.randomUUID(),
        sosId: event.id,
        responderId: r.id,
        token: rawToken, // in memory only, hash stored in store.tokens
        status: 'pending',
        distance_m: r.distance_m,
        created_at: Date.now()
      });
      console.log(`[SIMULATED DISPATCH] SOS ${event.id} -> ${r.name} (${type}) | Link: /r/${rawToken}`);
    }
  }
  event.steps.notified = true;
  event.escalation_level++;
  broadcast('alert', event);
}

app.post('/api/sos', (req, res) => {
  const { category, lat, lng } = req.body;
  if (!TRIAGE[category] || !lat || !lng) return res.status(400).json({ error: 'Invalid' });
  
  const event = store.createEvent(req.body);
  dispatchToNearest(event);
  res.status(201).json(event);
});

app.get('/api/sos/:id', (req, res) => {
  const ev = store.getEvent(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  
  // Include associated dispatches
  const dispatches = store.getDispatchLog().filter(d => d.sosId === ev.id);
  const responders = store.getResponders().filter(r => dispatches.some(d => d.responderId === r.id));
  res.json({ ...ev, dispatches, responders });
});

// Responder Actions
app.get('/api/r/:token', (req, res) => {
  const tk = store.verifyToken(req.params.token);
  if (!tk) return res.status(403).json({ error: 'Invalid or expired token' });
  const ev = store.getEvent(tk.sosId);
  const dispatch = store.getDispatchLog().find(d => d.sosId === tk.sosId && d.responderId === tk.responderId);
  res.json({ event: ev, dispatch });
});

app.post('/api/r/:token/accept', (req, res) => {
  const tk = store.verifyToken(req.params.token);
  if (!tk) return res.status(403).json({ error: 'Invalid or expired token' });
  const ev = store.getEvent(tk.sosId);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  
  if (ev.steps.resolved || ev.steps.unanswered) return res.status(409).json({ error: 'Alert closed' });
  
  ev.steps.accepted = true;
  const dispatch = store.getDispatchLog().find(d => d.sosId === tk.sosId && d.responderId === tk.responderId);
  if (dispatch) dispatch.status = 'accepted';
  
  broadcast('status', ev);
  res.json({ ok: true });
});

app.post('/api/r/:token/decline', (req, res) => {
  const tk = store.verifyToken(req.params.token);
  if (!tk) return res.status(403).json({ error: 'Invalid' });
  const dispatch = store.getDispatchLog().find(d => d.sosId === tk.sosId && d.responderId === tk.responderId);
  if (dispatch) dispatch.status = 'declined';
  
  const ev = store.getEvent(tk.sosId);
  if (ev) dispatchToNearest(ev); // Escalate immediately
  res.json({ ok: true });
});

app.post('/api/r/:token/status', (req, res) => {
  const tk = store.verifyToken(req.params.token);
  if (!tk) return res.status(403).json({ error: 'Invalid' });
  const ev = store.getEvent(tk.sosId);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  
  const { step, eta_minutes } = req.body;
  if (eta_minutes) ev.responder_eta_minutes = eta_minutes;
  
  // Strict order enforcement: accepted -> enroute -> arrived -> resolved
  if (step === 'enroute') {
    if (!ev.steps.accepted) return res.status(409).json({ error: 'Must accept first' });
    ev.steps.enroute = true;
  } else if (step === 'arrived') {
    if (!ev.steps.enroute) return res.status(409).json({ error: 'Must be enroute first' });
    ev.steps.arrived = true;
  } else if (step === 'resolved') {
    if (!ev.steps.arrived) return res.status(409).json({ error: 'Must arrive first' });
    ev.steps.resolved = true;
  } else {
    return res.status(400).json({ error: 'Invalid step' });
  }
  
  broadcast('status', ev);
  res.json({ ok: true });
});

// Background Escalation worker
const ESCALATE_AFTER_MS = parseInt(process.env.ESCALATE_AFTER_S || '20') * 1000;
setInterval(() => {
  const now = Date.now();
  for (const ev of store.getEvents()) {
    if (ev.steps.accepted || ev.steps.resolved || ev.steps.unanswered) continue;
    
    // Check if the latest dispatch for this event is older than 20s
    const dispatches = store.getDispatchLog().filter(d => d.sosId === ev.id);
    if (dispatches.length > 0) {
      const latest = dispatches[dispatches.length - 1];
      if (latest.status === 'pending' && (now - latest.created_at > ESCALATE_AFTER_MS)) {
        dispatchToNearest(ev);
      }
    }
  }
}, 5000);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`API running on http://localhost:${port}`);
  });
}
