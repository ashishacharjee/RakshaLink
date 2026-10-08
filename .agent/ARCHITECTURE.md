# Architecture — RakshaLink

Flow (matches PPT slide 5): Mobile App -> RakshaLink API -> Triage Agent -> Match + DB -> SMS/Voice/Maps -> Responder Dispatched

## Stack (fixed by the PPT — do not swap without a reason)
- **Mobile:** React Native (use **Expo with a development build**; plain Expo Go may block torch/audio modules)
- **Backend:** Node.js + Express
- **DB:** PostgreSQL + PostGIS
- **Comms:** STT, TTS, SMS gateway, Morse module
- **Suggested providers:** Twilio (SMS and Voice), device STT (Expo speech / Android SpeechRecognizer) or Whisper API, OSM Overpass for responder data, Leaflet/OSM or Google Maps for map links

## Data model
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE responders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital','mechanic','police','fuel_pump')),
  phone TEXT,                       -- demo numbers only in DEMO_MODE
  geom GEOGRAPHY(Point,4326) NOT NULL,
  source TEXT NOT NULL,             -- 'osm' | 'demo_seed'
  osm_id BIGINT,
  is_demo BOOLEAN DEFAULT false
);
CREATE INDEX responders_geom_idx ON responders USING GIST (geom);

CREATE TABLE sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('fuel','breakdown','accident','medical')),
  channel TEXT NOT NULL CHECK (channel IN ('api','sms','queued')),
  geom GEOGRAPHY(Point,4326) NOT NULL,
  transcript TEXT,
  status TEXT NOT NULL DEFAULT 'received',  -- received|matched|dispatched|failed
  created_at TIMESTAMPTZ DEFAULT now(),
  client_ts TIMESTAMPTZ
);

CREATE TABLE dispatch_log (
  id SERIAL PRIMARY KEY,
  sos_id UUID REFERENCES sos_events(id),
  responder_id INT REFERENCES responders(id),
  method TEXT CHECK (method IN ('sms','voice')),
  provider_ref TEXT,
  ok BOOLEAN,
  error TEXT,
  at TIMESTAMPTZ DEFAULT now()
);
```

## Triage agent (deterministic first, LLM optional)
Category to responder types:
| Category | Dispatch to |
|---|---|
| medical | hospital (nearest 1) |
| accident | hospital (nearest 1) **and** police (nearest 1) |
| breakdown | mechanic (nearest 1) |
| fuel | fuel_pump (nearest 1) |

Matching query:
```sql
SELECT id, name, type, phone,
       ST_Distance(geom, ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography) AS meters
FROM responders
WHERE type = ANY($types)
ORDER BY geom <-> ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography
LIMIT 3;
```
Voice classification: keyword rules first (EN + Hindi + Bengali keywords such as "petrol", "tyre", "accident", "chest pain"). An LLM may be a fallback ONLY if it returns strict JSON validated against the 4-value enum. Confidence below threshold means read the guess back with TTS and ask for confirmation. **Never auto-dispatch on an unconfirmed low-confidence voice guess.**

## API
- `POST /api/sos` body `{category, lat, lng, transcript?, client_ts?}` returns `{id, matches:[...], dispatch:[...]}`
- `POST /api/sms/inbound` (Twilio webhook) parses the compact payload `RL1|<M|A|B|F>|<lat>,<lng>|<unix_ts>` and runs the same pipeline
- `GET /api/sos/:id` returns status for the live status screen
- `GET /api/responders/nearby?lat=&lng=&type=` is used by the map
- `GET /health`

## Offline ladder (client logic)
```
on SOS tap:
  start Morse (torch + beep) if connectivity check fails
  try POST /api/sos (timeout 4s)
    ok    -> show status screen
    fail  -> open prefilled SMS to gateway number (payload above)
           -> save to local queue (AsyncStorage)
  NetInfo listener: when online, flush queue (dedupe by client id)
```

## Morse timing
Unit u = 300 ms. dot = 1u, dash = 3u, gap within letter = 1u, between letters = 3u, between words = 7u. SOS = `... --- ...`. Keep it a pure function `morseToTimeline(text)` so it can be unit-tested.

## Responder data
Seed from **OpenStreetMap Overpass** for one pilot corridor (tags: `amenity=hospital`, `amenity=police`, `amenity=fuel`, `shop=car_repair`). Store `source='osm'` and `osm_id`. OSM phone tags are often missing. Responders without phones get `is_demo=true` with team-owned test numbers in DEMO_MODE. Label them as demo in the UI.

## Safety / config
- `DEMO_MODE=true` routes ALL SMS and calls to a whitelist of team-owned verified numbers. Real responders are never contacted.
- The app always shows a separate **"Call 112"** button. India's unified emergency number is 112; we augment it, we do not replace it.
- Secrets in `.env`, never committed.
- **SMS in India:** commercial SMS needs DLT registration and Twilio trial accounts only reach verified numbers. Plan the demo around verified numbers and do not promise production SMS.

## Addendum: Crash detection module (Drive Mode)
**Mobile libs:** `expo-sensors` (Accelerometer, Gyroscope), `expo-location` (speed), `expo-keep-awake`, `expo-haptics`, `expo-av` (siren). Android foreground service (via a dev build) for background; iOS is foreground-only in the MVP.

**State machine (pure function, unit-testable, `crash/detector.ts`):**
```
IDLE --(speed >= ARM_SPEED_KMH for ARM_SECONDS)--> ARMED
ARMED --(|a| - g >= IMPACT_G)--> VERIFYING (3 s window)
VERIFYING:
   speed_after <= STOP_KMH or speed drop >= DROP_PCT  (+ low motion afterwards)  --> COUNTDOWN
   speed continues (bump/pothole/speed breaker)                                  --> ARMED (discard)
COUNTDOWN (20 s, siren + haptics):
   "I'm OK" --> ARMED (log false alarm locally)
   "Send now" or timer ends --> SEND_SOS(category='accident', trigger='crash_auto')
```
**Config (`crash/config.ts`) — starting values only, not validated:**
`ARM_SPEED_KMH=20, ARM_SECONDS=10, IMPACT_G=4.0, VERIFY_WINDOW_MS=3000, STOP_KMH=5, DROP_PCT=0.7, COUNTDOWN_S=20, SENSOR_HZ=50`.

**Schema migration:**
```sql
ALTER TABLE sos_events
  ADD COLUMN trigger TEXT NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual','voice','crash_auto')),
  ADD COLUMN peak_g REAL,
  ADD COLUMN pre_impact_kmh REAL;
```
**API:** `POST /api/sos` accepts optional `{trigger, peak_g, pre_impact_kmh}`. Triage still maps `accident` to hospital + police. If offline, the same ladder applies (queue, then SMS fallback). The queued SMS payload may append a `|C` flag for crash-triggered alerts.
**Responder-side wording:** the SMS/voice message must say "Automatic crash alert, victim may be unresponsive" so responders can prioritise.
**Tests (required):** synthetic traces for (a) crash, (b) speed breaker, (c) pothole, (d) phone drop while stationary (speed gate means no trigger), (e) hard braking. Only (a) may reach COUNTDOWN. Plus a dev `Simulate crash` button replaying trace (a) with mocked speed.

## Addendum: Responder loop, escalation, family alert, metrics
```sql
ALTER TABLE dispatch_log
  ADD COLUMN token_hash TEXT, ADD COLUMN token_expires TIMESTAMPTZ,
  ADD COLUMN accepted_at TIMESTAMPTZ, ADD COLUMN declined_at TIMESTAMPTZ,
  ADD COLUMN escalation_level INT NOT NULL DEFAULT 0;
ALTER TABLE sos_events
  ADD COLUMN accepted_by INT REFERENCES responders(id),
  ADD COLUMN bystander BOOLEAN NOT NULL DEFAULT false;
-- sos_events.status values: received | dispatched | accepted | escalating | unanswered | failed
```
- **Accept page:** `GET /r/:token` (mobile-first HTML served by Express) and `POST /r/:token/accept|decline`. The SMS to the responder carries `BASE_URL/r/<token>`. The page shows category, "AUTOMATIC CRASH ALERT" when `trigger=crash_auto`, distance, a map link, and the two buttons. Decline triggers immediate escalation.
- **Escalation worker:** `setInterval` every 5 s inside the Express process. Select events in `dispatched|escalating` with no `accepted_at` whose latest dispatch is older than `ESCALATE_AFTER_S` (default 60, demo 20) and `escalation_level < 2`. Contact the next-nearest responder of the needed type(s) not yet contacted. If none are left, set `unanswered`.
- **Status API:** `GET /api/sos/:id` returns real step flags (`sent`, `notified`, `accepted`, `unanswered`) for the app timeline.
- **Family alert:** `POST /api/sos` accepts `contacts: [{phone}]` (max 2), sends one SMS each, logs method `sms` with `responder_id` null. Contacts are not stored.
- **Metrics:** `GET /api/metrics` returns `{n, median_ms}` of first dispatch minus `created_at`. With no rows it returns `n=0` and no median.
- **Map link:** `https://www.openstreetmap.org/?mlat=<lat>&mlon=<lng>#map=16/<lat>/<lng>`.

## Addendum: Responder Console (desktop web)
- One web app served by the same Express server: `GET /console` (desktop dashboard) and `GET /r/:token` (mobile accept page from the SMS). Both use the same API and design tokens.
- **Live updates:** Server-Sent Events, `GET /api/stream` (new event, accepted, escalated, unanswered). Auto-reconnect on the client. Polling every 3 s is an acceptable fallback.
- **Console layout:** header (signed-in-as, DEMO banner), left alert queue, right alert detail (category, trigger, location map, distance, Accept / Can't respond, escalation countdown), bottom event log.
- **Sign-in:** DEMO_MODE only, a "view as" selector listing demo responders (no password). A real deployment would need proper authentication, which is future work.
- **Map:** Leaflet with OpenStreetMap tiles (needs internet; keep a static fallback image of the pilot corridor for the demo).
- **Accept from console** calls the same endpoint as the SMS link, so there is one code path.

## Addendum: 8-hour build decisions (3 Oct)
- **Dispatch provider flag:** `PROVIDER=mock|twilio`. `mock` writes the would-be SMS/voice to `dispatch_log` and the console with the label "SIMULATED DISPATCH". `twilio` sends for real to whitelisted numbers only. Same interface, one switch.
- **DB fallback:** try Docker `postgis/postgis` for 20 minutes. If it does not work, use an in-memory/SQLite store with a haversine nearest search over the seeded responders (same API, same results). Say so honestly if asked.
- **Expo:** verify in the Expo docs which modules run in Expo Go (location, sensors, haptics, camera torch, audio, NetInfo should, but check the current SDK). Only move to a development build if a module truly needs it.
- **Demo location override:** the mobile app has a dev toggle with two presets (GNIT campus 22.6951, 88.3788; and an NH-19 sample point labelled sample). It sends the preset coordinates instead of GPS. Responders are seeded within 15 km of each preset (widen to 30 km if a type is missing).
- **Seeding:** Overpass query per preset for `amenity=hospital`, `amenity=police`, `amenity=fuel`, `shop=car_repair`. Write the script during the window. Show "© OpenStreetMap contributors".
- **Demo reset:** `POST /api/dev/reset` (DEMO_MODE only) clears events, dispatches and tokens.
- **Escalation timing:** `ESCALATE_AFTER_S=20` in demo, 60 otherwise.
- **Voice (T3):** record audio with the phone, POST to `/api/voice`, server transcribes with an API (key needed), keyword rules first, validated against the 4 categories, then confirm with the user.
- **Hosting and network:** backend runs on a team laptop. Phones join the laptop over a phone hotspot or the venue Wi-Fi. Use a tunnel (ngrok/cloudflared) only for the Twilio inbound webhook. Keep a 2-minute backup video.
- **Hardening basics (T2/T3):** `helmet`, rate limit on `POST /api/sos`, strict validation of category/lat/lng, hashed accept tokens, no secrets in the repo, `.env.example` committed.

## Addendum: Responder Console v2 (duty, status progression, roles)
```sql
ALTER TABLE responders ADD COLUMN on_duty BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE dispatch_log
  ADD COLUMN enroute_at TIMESTAMPTZ, ADD COLUMN arrived_at TIMESTAMPTZ,
  ADD COLUMN resolved_at TIMESTAMPTZ, ADD COLUMN eta_minutes INT;
-- sos_events.status values: received | dispatched | accepted | enroute | arrived | resolved | escalating | unanswered | failed
```
- **Duty:** `POST /api/responders/:id/duty {on_duty}`. Matching and escalation skip responders with `on_duty=false`. In the demo all seeded responders start on duty.
- **Status progression:** `POST /r/:token/status {step: enroute|arrived|resolved, eta_minutes?}` (same token as the accept link, also used by the console). Each call stamps its timestamp and updates `sos_events.status`. Steps must go in order. Only the responder can set them.
- **Rider status API:** `GET /api/sos/:id` returns flags `sent, notified, accepted, enroute, arrived, resolved, unanswered` plus `responder_eta_minutes` only if the responder entered it.
- **Role views (DEMO_MODE only):** `GET /api/events?responder_id=` and `GET /api/stream?responder_id=` filter by role: hospital gives medical and accident; police gives accident; mechanic gives breakdown; fuel_pump gives fuel. A "view as" selector picks the demo responder (no password).
- **Distance:** straight-line (haversine or PostGIS). No routing engine, no computed driving ETA. "Open in maps" is a deep link.
- **Operations overview (T3):** `GET /api/stream` with no filter, rendered as the control-room view.
