/* RakshaLink shared helpers (browser global RL) */
window.RL = (function () {
  const CAT = {
    fuel: { label: 'Fuel runs out', color: 'green', hint: 'Nearest fuel pump', icon: 'fuel' },
    breakdown: { label: 'Breakdown', color: 'teal', hint: 'Nearest mechanic', icon: 'wrench' },
    accident: { label: 'Road accident', color: 'navy', hint: 'Nearest hospital + police', icon: 'car' },
    medical: { label: 'Medical SOS', color: 'maroon', hint: 'Nearest hospital', icon: 'cross' }
  };
  const COL = { green: '#274706', teal: '#1B4D4F', navy: '#2B3A67', maroon: '#5B1F2D' };
  const TYPE = { hospital: 'Hospital', police: 'Police', mechanic: 'Mechanic', fuel_pump: 'Fuel pump' };
  const P = {
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    cross: '<path d="M12 5v14M5 12h14" stroke-width="3"/>',
    fuel: '<path d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M4 21h12M15 9h2a2 2 0 012 2v5a1.5 1.5 0 003 0V8l-3-3"/><path d="M8 8h4"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    home: '<path d="M4 11l8-7 8 7M6 10v10h12V10"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    arrow: '<path d="M15 5l-7 7 7 7"/>'
  };
  const ic = (n, px, color) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="${px ? 'font-size:' + px + 'px;' : ''}${color ? 'color:' + color : ''}">${P[n]}</svg>`;
  const shield = (bg, fg, px) => `<svg viewBox="170 130 172 246" width="${px * 0.7}" height="${px}" aria-hidden="true"><path d="M256 138 L338 164 V248 C338 308 300 346 256 370 C212 346 174 308 174 248 V164 Z" fill="${bg}"/><g fill="none" stroke="${fg}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M229 198 V302"/><path d="M229 198 H262 C292 198 292 252 262 252 H229"/><path d="M259 252 L289 302"/></g></svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const km = m => (m / 1000).toFixed(1) + ' km';
  const hms = t => new Date(t).toLocaleTimeString('en-GB', { hour12: false });
  const ago = ms => { const s = Math.max(0, Math.round(ms / 1000)); return s < 10 ? 'just now' : s < 60 ? s + ' s ago' : Math.floor(s / 60) + ' min ago'; };
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };

  async function api(path, o) {
    o = o || {};
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), o.timeout || 8000);
    try {
      const r = await fetch(path, { method: o.method || 'GET', headers: { 'Content-Type': 'application/json' }, body: o.body ? JSON.stringify(o.body) : undefined, signal: ac.signal });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { const e = new Error(j.error || 'http_' + r.status); e.status = r.status; throw e; }
      return j;
    } finally { clearTimeout(t); }
  }

  // Audio needs one user gesture first. Everything degrades silently if audio is unavailable.
  let ac = null, osc = null, gain = null;
  function unlockAudio() {
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); gain = ac.createGain(); gain.gain.value = 0; gain.connect(ac.destination); osc = ac.createOscillator(); osc.type = 'square'; osc.frequency.value = 880; osc.connect(gain); osc.start(); }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { }
  }
  function tone(on, f) { try { if (!ac) return; if (f) osc.frequency.value = f; gain.gain.value = on ? 0.05 : 0; } catch (e) { } }
  function beep(f, ms) { tone(true, f); setTimeout(() => tone(false), ms || 150); }
  function chime() { beep(660, 140); setTimeout(() => beep(880, 220), 180); }
  const audioReady = () => !!ac && ac.state === 'running';

  return { CAT, COL, TYPE, ic, shield, esc, km, hms, ago, mmss, uid, store, api, unlockAudio, tone, beep, chime, audioReady };
})();
