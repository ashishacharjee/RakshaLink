# Architecture

One Express server serves the API and every page. State is in memory, so there is no database to set up.

```text
/rider (phone)  -->  POST /api/sos  -->  triage  -->  nearest responders  -->  simulated dispatch (accept links)
                                                                   |
/console (laptop) <-- Server-Sent Events + 3 s polling ------------+     /r/<token> (phone) accepts the same alert
```

## Files
| File | Role |
|---|---|
| `server/triage.js` | The category to responder-type table and the role views |
| `server/store.js` | In-memory store, haversine nearest search, hashed expiring tokens |
| `server/core.js` | Events, dispatch, accept and steps, escalation, metrics. Takes an injectable clock so tests need no waiting |
| `server/index.js` | Express routes, validation, rate limit, SSE, static pages |
| `web/shared/detector.js` | Drive Mode crash detector, a pure state machine used by the browser and by tests |
| `web/rider`, `web/console`, `web/accept` | The three interfaces. `web/simulation/index.html` is the 3D simulation |
| `web/vendor` | Leaflet and the fonts, bundled so the app does not depend on a CDN. Only map tiles and Three.js (for the simulation) need internet |

## Triage
| Emergency | Notified |
|---|---|
| medical | nearest hospital |
| accident | nearest hospital and nearest police |
| breakdown | nearest mechanic |
| fuel | nearest fuel pump |

Each type is tracked on its own: an accident can be accepted by the hospital while the police alert escalates separately.

## Responder steps
Per dispatch: `pending`, then `accepted`, `enroute`, `arrived`, `resolved`, strictly in order, each set only by that responder (through the console or the token link). Other outcomes are `declined` and `missed` (no response in time). The rider view takes the furthest step reached. An estimate is stored only if the responder typed it (1 to 180 minutes). The system never computes an ETA.

## Escalation
A 1-second worker checks every open alert. If the latest dispatch of a type is still `pending` after `ESCALATE_AFTER_S`, it becomes `missed` and the next-nearest on-duty responder of that type is contacted. Maximum three per type. If nobody has accepted and nobody is pending, the alert becomes `unanswered` and the rider is told to call 112. Declining escalates immediately.

## Drive Mode detector
`idle` to `armed` (20 km/h held for 3 s), to `verifying` (a spike of at least 4 g), to `countdown` (speed at or below 5 km/h within 3 s) to an automatic alert. A spike where speed continues is discarded. Hard braking without an impact, a spike below the threshold, and a spike while parked are ignored. Thresholds are starting values, not validated on real crashes.

## Offline ladder
1. Online: `POST /api/sos`.
2. No signal: the alert is stored in the phone's local storage, a Morse SOS flashes the screen with a beep, and a prefilled SMS (`RL1|A|lat,lng|unix_time|C`) is offered. `POST /api/sms/inbound` parses that payload.
3. Signal returns: the saved alert is sent with `queued: true`, creating a "Delivered from queue" event. Alerts are idempotent by `client_id`, so a retry never creates a duplicate.

## Security basics
Accept links use 128-bit random tokens, stored only as SHA-256 hashes, valid for 2 hours. Input is validated (category, trigger, coordinates, crash data). Only alert creation is rate limited (30 per minute per IP), never polling. `X-Content-Type-Options`, `Permissions-Policy` and `Referrer-Policy: strict-origin-when-cross-origin` are set (OpenStreetMap tile servers refuse requests without a referrer). No secrets are needed or stored. Demo-only endpoints (console actions, reset, duty) are disabled when `DEMO_MODE=false`.
