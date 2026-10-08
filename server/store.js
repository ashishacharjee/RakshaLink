const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Haversine formula to calculate distance in meters
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-memory store
class Store {
  constructor() {
    this.events = new Map();
    this.dispatches = [];
    this.responders = this.loadResponders();
  }

  loadResponders() {
    try {
      const dataPath = path.join(__dirname, 'data', 'responders.json');
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (err) {
      console.error('Failed to load responders:', err);
    }
    return [];
  }

  getResponders() {
    return this.responders;
  }

  getEvents() {
    return Array.from(this.events.values());
  }

  createEvent(data) {
    const id = uuidv4();
    const event = {
      id,
      ...data,
      created_at: Date.now(),
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

  findNearest(lat, lng, types, limit = 3) {
    const available = this.responders.filter(r => r.on_duty && types.includes(r.type));
    const withDist = available.map(r => ({
      ...r,
      distance_m: haversine(lat, lng, r.lat, r.lng)
    }));
    withDist.sort((a, b) => a.distance_m - b.distance_m);
    return withDist.slice(0, limit);
  }
}

module.exports = new Store();
