'use strict';
// RakshaLink core: events, triage dispatch (SIMULATED), accept/steps, escalation.
// Pure logic with an injectable clock so it can be tested without waiting.
const crypto = require('crypto');
const { Store } = require('./store');
const { TRIAGE, ROLE_CATEGORIES } = require('./triage');

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const LABEL = { medical: 'Medical SOS', accident: 'Road Accident', breakdown: 'Breakdown', fuel: 'Fuel runs out' };
const TYPE_LABEL = { hospital: 'hospital', police: 'police station', mechanic: 'mechanic', fuel_pump: 'fuel pump' };

function createCore({ seed, now = () => Date.now(), escalateAfterMs = 20000, emit = () => {} } = {}) {
  const S = new Store(seed);
  const dsFor = id => S.dispatches.filter(d => d.sosId === id);
  const log = (ev, event, details, by = 'System') => ev.event_log.push({ time: now(), event, details, by });
  const km = m => (m / 1000).toFixed(1) + ' km';

  function contact(ev, type) {
    const tried = dsFor(ev.id).filter(d => d.type === type);
    if (tried.length >= MAX_ATTEMPTS) return null;
    const cand = S.findNearest(ev.lat, ev.lng, [type], tried.map(d => d.responderId))[0];
    if (!cand) return null;
    const raw = S.createToken(ev.id, cand.id, now(), TOKEN_TTL_MS);
    const d = { id: crypto.randomUUID(), sosId: ev.id, responderId: cand.id, type, distance_m: Math.round(cand.distance_m),
      created_at: now(), status: 'pending', accepted_at: null, enroute_at: null, arrived_at: null, resolved_at: null,
      eta_minutes: null, accept_url: '/r/' + raw };
    S.dispatches.push(d);
    log(ev, tried.length ? 'Escalated' : 'Responder notified',
      `${cand.name} (${km(d.distance_m)}) · SIMULATED DISPATCH`);
    return d;
  }

  function checkUnanswered(ev) {
    if (ev.unanswered) return;
    const ds = dsFor(ev.id);
    if (ds.some(d => d.accepted_at)) return;
    const live = ds.some(d => d.status === 'pending');
    if (live) return;
    ev.unanswered = true;
    log(ev, 'No responder answered', 'every responder tried; rider told to call 112');
    emit('unanswered', { id: ev.id });
  }

  function createEvent(data) {
    if (data.client_id) {
      for (const e of S.events.values()) if (e.client_id === data.client_id) return { event: e, duplicate: true };
    }
    const t = now();
    const lat = Number.isFinite(Number(data.lat)) ? Number(data.lat) : 0;
    const lng = Number.isFinite(Number(data.lng)) ? Number(data.lng) : 0;
    const ev = { id: crypto.randomUUID(), client_id: data.client_id || null, category: data.category,
      trigger: data.trigger || 'manual', via: data.via || 'api', lat, lng,
      peak_g: data.peak_g ?? null, pre_impact_kmh: data.pre_impact_kmh ?? null,
      client_ts: data.client_ts || null, delivered_from_queue: !!data.queued,
      created_at: t, first_dispatch_at: null, unanswered: false, event_log: [] };
    S.events.set(ev.id, ev);
    const how = ev.trigger === 'crash_auto' ? 'automatic crash' : 'manual';
    const extra = ev.via === 'sms' ? ' via SMS fallback' : (ev.delivered_from_queue ? ' delivered from queue' : '');
    log(ev, 'Alert received', `${LABEL[ev.category]}, ${how}${extra} (demo location)`);
    if (ev.delivered_from_queue && ev.client_ts) log(ev, 'Delivered from queue', `created on the phone at ${ev.client_ts}`);
    const types = TRIAGE[ev.category];
    const picks = types.map(ty => S.findNearest(ev.lat, ev.lng, [ty])[0]).filter(Boolean);
    log(ev, 'Matching complete', picks.length
      ? picks.map(p => `${p.name} ${km(p.distance_m)}`).join(', ')
      : 'no on-duty responder of the needed type');
    const made = types.map(ty => contact(ev, ty)).filter(Boolean);
    if (made.length) ev.first_dispatch_at = now();
    checkUnanswered(ev);
    emit('alert', { id: ev.id, responder_ids: made.map(d => d.responderId) });
    return { event: ev, duplicate: false };
  }

  function view(ev) {
    const ds = dsFor(ev.id), any = k => ds.some(d => d[k]);
    const steps = { sent: true, notified: ds.length > 0, accepted: any('accepted_at'), enroute: any('enroute_at'),
      arrived: any('arrived_at'), resolved: any('resolved_at'), unanswered: ev.unanswered };
    const status = ev.unanswered ? 'unanswered' : steps.resolved ? 'resolved' : steps.arrived ? 'arrived'
      : steps.enroute ? 'enroute' : steps.accepted ? 'accepted' : steps.notified ? 'dispatched' : 'received';
    const etas = ds.filter(d => d.eta_minutes).map(d => d.eta_minutes);
    return { id: ev.id, client_id: ev.client_id, category: ev.category, label: LABEL[ev.category], trigger: ev.trigger,
      lat: ev.lat, lng: ev.lng, peak_g: ev.peak_g, pre_impact_kmh: ev.pre_impact_kmh, created_at: ev.created_at,
      client_ts: ev.client_ts, delivered_from_queue: ev.delivered_from_queue, status, steps,
      responder_eta_minutes: etas.length ? etas[etas.length - 1] : null,
      responders: ds.map(d => { const r = S.responder(d.responderId); return { name: r.name, type: d.type, distance_m: d.distance_m, status: d.status }; }),
      event_log: ev.event_log };
  }
  const myView = d => ({ dispatch_id: d.id, responder_id: d.responderId, status: d.status, distance_m: d.distance_m,
    created_at: d.created_at, escalate_at: d.status === 'pending' ? d.created_at + escalateAfterMs : null,
    accepted_at: d.accepted_at, enroute_at: d.enroute_at, arrived_at: d.arrived_at, resolved_at: d.resolved_at,
    eta_minutes: d.eta_minutes, accept_url: d.accept_url });
  function eventsFor(responderId) {
    const all = [...S.events.values()].sort((a, b) => b.created_at - a.created_at);
    if (!responderId) return all.map(view);
    return all.map(ev => {
      const d = dsFor(ev.id).filter(x => x.responderId === responderId).pop();
      return d ? { ...view(ev), my: myView(d) } : null;
    }).filter(Boolean);
  }

  function setStatus(d, status) { d.status = status; }
  const name = d => S.responder(d.responderId).name;
  function accept(d) {
    const ev = S.events.get(d.sosId);
    if (ev.unanswered) return { error: 'Alert closed', code: 409 };
    if (d.status !== 'pending') return { error: d.status === 'accepted' ? 'Already accepted' : 'Escalated to the next responder', code: 409 };
    d.accepted_at = now(); setStatus(d, 'accepted');
    log(ev, 'Alert accepted', `Accepted by ${name(d)}`, name(d));
    emit('status', { id: ev.id }); return { ok: true };
  }
  function decline(d) {
    const ev = S.events.get(d.sosId);
    if (d.status !== 'pending') return { error: 'Cannot decline now', code: 409 };
    setStatus(d, 'declined'); log(ev, 'Declined', `${name(d)} cannot respond`, name(d));
    contact(ev, d.type); checkUnanswered(ev);
    emit('escalated', { id: ev.id }); return { ok: true };
  }
  function step(d, stepName, eta) {
    const ev = S.events.get(d.sosId);
    if (eta !== undefined && eta !== null && eta !== '') {
      const n = Number(eta);
      if (!Number.isInteger(n) || n < 1 || n > 180) return { error: 'Estimate must be 1 to 180 minutes', code: 400 };
      if (!d.accepted_at) return { error: 'Accept first', code: 409 };
      // Fix: block ETA updates once the alert is fully resolved
      if (d.resolved_at) return { error: 'Alert already resolved', code: 409 };
      d.eta_minutes = n;
    }
    if (stepName) {
      const order = { enroute: ['accepted_at', 'enroute_at', 'On the way'], arrived: ['enroute_at', 'arrived_at', 'Arrived'], resolved: ['arrived_at', 'resolved_at', 'Resolved'] }[stepName];
      if (!order) return { error: 'Invalid step', code: 400 };
      if (!d[order[0]]) return { error: 'Steps must go in order', code: 409 };
      if (d[order[1]]) return { error: 'Already done', code: 409 };
      d[order[1]] = now();
      // Fix: advance dispatch.status so view() and eventsFor() reflect the true step
      if (stepName === 'enroute') setStatus(d, 'enroute');
      else if (stepName === 'arrived') setStatus(d, 'arrived');
      else if (stepName === 'resolved') setStatus(d, 'resolved');
      log(ev, order[2], `Marked by ${name(d)}`, name(d));
    } else if (d.eta_minutes) log(ev, 'Estimate', `${name(d)} estimates ${d.eta_minutes} min (responder's own estimate)`, name(d));
    emit('status', { id: ev.id }); return { ok: true };
  }

  // Escalation: per needed type, if nobody accepted in time, contact the next-nearest responder.
  function tick() {
    const t = now();
    for (const ev of S.events.values()) {
      if (ev.unanswered) continue;
      for (const type of TRIAGE[ev.category]) {
        const ds = dsFor(ev.id).filter(d => d.type === type);
        if (!ds.length || ds.some(d => d.accepted_at)) continue;
        const latest = ds[ds.length - 1];
        if (latest.status === 'pending' && t - latest.created_at >= escalateAfterMs) {
          setStatus(latest, 'missed');
          log(ev, 'No response', `${name(latest)} did not respond in ${Math.round(escalateAfterMs / 1000)} s`);
          contact(ev, type);
          emit('escalated', { id: ev.id });
        }
      }
      checkUnanswered(ev);
    }
  }
  function median(a) { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }
  function metrics() {
    const evs = [...S.events.values()];
    const disp = evs.filter(e => e.first_dispatch_at).map(e => e.first_dispatch_at - e.created_at);
    const acc = S.dispatches.filter(d => d.accepted_at).map(d => d.accepted_at - d.created_at);
    return { events: evs.length, n_dispatch: disp.length, median_dispatch_ms: median(disp), n_accept: acc.length, median_accept_ms: median(acc) };
  }
  const dispatchByToken = raw => {
    const tk = S.verifyToken(raw, now()); if (!tk) return null;
    return S.dispatches.find(d => d.sosId === tk.sosId && d.responderId === tk.responderId) || null;
  };
  const dispatchFor = (rid, eventId) => dsFor(eventId).filter(d => d.responderId === rid).pop() || null;
  return { S, createEvent, view, eventsFor, accept, decline, step, tick, metrics, dispatchByToken, dispatchFor,
    reset: () => S.reset(), escalateAfterMs, myView, name, LABEL, TYPE_LABEL, ROLE_CATEGORIES };
}
module.exports = { createCore, TRIAGE, LABEL };
