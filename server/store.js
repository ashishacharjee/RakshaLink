'use strict';
const crypto = require('crypto');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// In-memory store. Demo data only; it resets with POST /api/dev/reset or a restart.
class Store {
  constructor(seed) { this.seed = seed || []; this.reset(); }
  reset() {
    this.events = new Map();
    this.dispatches = [];
    this.tokens = new Map(); // sha256(token) -> { sosId, responderId, expiresAt }
    this.responders = JSON.parse(JSON.stringify(this.seed));
  }
  responder(id) { return this.responders.find(r => r.id === id); }
  findNearest(lat, lng, types, excludeIds = []) {
    return this.responders
      .filter(r => r.on_duty && types.includes(r.type) && !excludeIds.includes(r.id))
      .map(r => ({ ...r, distance_m: haversine(lat, lng, r.lat, r.lng) }))
      .sort((a, b) => a.distance_m - b.distance_m);
  }
  createToken(sosId, responderId, now, ttlMs) {
    const raw = crypto.randomBytes(16).toString('hex'); // 128-bit, unguessable
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    this.tokens.set(hash, { sosId, responderId, expiresAt: now + ttlMs });
    return raw;
  }
  verifyToken(raw, now) {
    if (typeof raw !== 'string' || raw.length < 16) return null;
    const t = this.tokens.get(crypto.createHash('sha256').update(raw).digest('hex'));
    return t && now <= t.expiresAt ? t : null;
  }
}
module.exports = { Store, haversine };
