const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const TRIAGE = {
  medical: ['hospital'],
  accident: ['hospital', 'police'],
  breakdown: ['mechanic'],
  fuel: ['fuel_pump']
};

class Store {
  constructor() {
    this.reset();
  }

  reset() {
    this.events = new Map();
    this.dispatches = [];
    this.tokens = new Map(); // SHA256 -> data
    this.responders = this.loadResponders();
  }

  loadResponders() {
    try {
      const dataPath = path.join(__dirname, 'data', 'responders.json');
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (err) {}
    return [];
  }

  getResponders() { return this.responders; }
  getEvents() { return Array.from(this.events.values()); }
  getDispatchLog() { return this.dispatches; }
  getEvent(id) { return this.events.get(id); }

  createEvent(data) {
    // idempotent check
    if (data.client_id) {
      for (const ev of this.events.values()) {
        if (ev.client_id === data.client_id) return ev;
      }
    }
    const id = crypto.randomUUID();
    const event = {
      id,
      client_id: data.client_id,
      category: data.category,
      trigger: data.trigger || 'manual',
      lat: data.lat,
      lng: data.lng,
      peak_g: data.peak_g,
      pre_impact_kmh: data.pre_impact_kmh,
      created_at: Date.now(),
      escalation_level: 0,
      responder_eta_minutes: null,
      steps: {
        sent: true,
        notified: false,
        accepted: false,
        enroute: false,
        arrived: false,
        resolved: false,
        unanswered: false
      }
    };
    this.events.set(id, event);
    return event;
  }

  findNearest(lat, lng, types, excludeResponderIds = []) {
    const available = this.responders.filter(r => r.on_duty && types.includes(r.type) && !excludeResponderIds.includes(r.id));
    const withDist = available.map(r => ({ ...r, distance_m: haversine(lat, lng, r.lat, r.lng) }));
    withDist.sort((a, b) => a.distance_m - b.distance_m);
    
    // Max 3 per type over escalation logic? The spec says "max 3 per type, then unanswered".
    // Return all valid matches, escalation loop will pick next.
    return withDist;
  }

  createToken(sosId, responderId) {
    const rawToken = crypto.randomBytes(16).toString('hex'); // 128-bit
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    this.tokens.set(hash, {
      sosId,
      responderId,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 h
    });
    return { rawToken, hash };
  }

  verifyToken(rawToken) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const data = this.tokens.get(hash);
    if (!data) return null;
    if (Date.now() > data.expiresAt) return null;
    return data;
  }
}

module.exports = new Store();
module.exports.haversine = haversine;
module.exports.TRIAGE = TRIAGE;
