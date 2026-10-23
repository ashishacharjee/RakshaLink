# API

JSON everywhere. Categories: `fuel` `breakdown` `accident` `medical`. Triggers: `manual` `crash_auto`. Responder types: `hospital` `police` `mechanic` `fuel_pump`.

## Rider
**`POST /api/sos`**
```json
{ "category": "accident", "trigger": "crash_auto", "lat": 22.6951, "lng": 88.3788,
  "client_id": "c1abc", "client_ts": "2026-10-08T11:00:00Z", "peak_g": 8.4, "pre_impact_kmh": 86, "queued": false }
```
`201` returns `{ "id", "status": "dispatched", "duplicate": false, "matches": [{ "name", "type", "distance_m", "status" }], "dispatch": [{ "name", "method": "sms+voice", "simulated": true }] }`. Errors: `400 invalid_category | invalid_trigger | invalid_location | invalid_crash_data`, `429 rate_limited`. The same `client_id` returns the existing alert with `duplicate: true`.

**`GET /api/sos/:id`** returns `status` (`received dispatched accepted enroute arrived resolved unanswered`), `steps` (`sent notified accepted enroute arrived resolved unanswered`), `responder_eta_minutes` (null unless the responder typed one) and `responders`.

## Responder console (demo mode)
- `GET /api/responders`, `POST /api/responders/:id/duty` with `{ "on_duty": false }`
- `GET /api/events?responder_id=ID` returns `{ server_now, events: [...] }` where each event has `my` (that responder's dispatch: `status`, `distance_m`, `escalate_at`, step timestamps, `eta_minutes`, `accept_url`) and `event_log`
- `POST /api/console/:responder_id/events/:id/accept | decline`
- `POST /api/console/:responder_id/events/:id/status` with `{ "step": "enroute" | "arrived" | "resolved", "eta_minutes": 8 }` (either field optional; steps must go in order, the estimate needs an accepted alert)
- `GET /api/stream` Server-Sent Events: `alert status escalated unanswered duty reset heartbeat`

## Responder link (what the SMS opens)
- `GET /r/:token` the page, `GET /api/r/:token`, `POST /api/r/:token/accept | decline | status`. Same functions as the console. A wrong or expired token returns `403`.

## Other
- `POST /api/sms/inbound` with `{ "body": "RL1|A|22.6951,88.3788|1790000000|C" }`
- `GET /api/metrics` returns counts and median time-to-dispatch and time-to-accept, null until data exists
- `GET /api/config`, `GET /health`, `POST /api/dev/reset` (demo mode only)
