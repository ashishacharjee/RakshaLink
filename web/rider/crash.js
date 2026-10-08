function detectCrash(trace) {
  // Trace is array of { ts, ax, ay, az, speed }
  // We look for: speed > 20km/h, sudden stop, and peak_g > 4.0
  let peak_g = 0;
  let pre_impact_kmh = 0;
  let post_impact_speed = 999;
  
  if (trace.length < 5) return null;
  
  for (let i = 0; i < trace.length; i++) {
    const pt = trace[i];
    const g = Math.sqrt(pt.ax*pt.ax + pt.ay*pt.ay + pt.az*pt.az);
    if (g > peak_g) {
      peak_g = g;
      pre_impact_kmh = trace[Math.max(0, i-2)].speed;
    }
  }
  
  // Very simplistic rule:
  if (peak_g >= 4.0 && pre_impact_kmh > 15) {
    return { peak_g: parseFloat(peak_g.toFixed(1)), pre_impact_kmh };
  }
  return null;
}

const PREPARED_TRACES = {
  crash: [
    { ts: 0, ax: 0, ay: 0, az: 1, speed: 60 },
    { ts: 1, ax: 0, ay: 0, az: 1, speed: 60 },
    { ts: 2, ax: 5, ay: 5, az: 4.5, speed: 60 }, // Peak G = 8.4
    { ts: 3, ax: 0, ay: 0, az: 1, speed: 0 }
  ],
  speed_breaker: [
    { ts: 0, ax: 0, ay: 0, az: 1, speed: 40 },
    { ts: 1, ax: 0, ay: 0, az: 2, speed: 30 },
    { ts: 2, ax: 0, ay: 0, az: 1, speed: 40 }
  ],
  pothole: [
    { ts: 0, ax: 0, ay: 0, az: 1, speed: 50 },
    { ts: 1, ax: 0, ay: 0, az: 3.5, speed: 48 }, // Peak G = 3.5
    { ts: 2, ax: 0, ay: 0, az: 1, speed: 50 }
  ],
  hard_brake: [
    { ts: 0, ax: 0, ay: 0, az: 1, speed: 80 },
    { ts: 1, ax: 2, ay: 0, az: 1, speed: 40 }, // Peak G = 2.2
    { ts: 2, ax: 0, ay: 0, az: 1, speed: 10 }
  ],
  phone_drop_stationary: [
    { ts: 0, ax: 0, ay: 0, az: 1, speed: 0 },
    { ts: 1, ax: 5, ay: 5, az: 5, speed: 0 }, // Peak G = 8.6, but speed = 0
    { ts: 2, ax: 0, ay: 0, az: 1, speed: 0 }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = { detectCrash, PREPARED_TRACES };
}
