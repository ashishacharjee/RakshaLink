# Agent prompts by role (paste AFTER `ANTIGRAVITY_KICKOFF_PROMPT.md`)

Each role works only in its own folder. Contract: `docs/API_CONTRACT.md`. States: `DESIGN.md` section 15. Rules: `RULES.md`.

## Stitch strip list (Roles C and D: remove from any Stitch export)
Incident IDs (`#RL-8492`, `#EMG-88219`, `RL-KOL-2024-...`), "Station Node", "Unit AMB-04", "Emergency Unit", telemetry or live-coordinates text, radio channels, queue statuses "Assigned" and "Pending", incident types "Sensor alert", "Citizen Report", "Industrial Hazard", "Cardiac Distress", "Wearable SOS", "Cell Broadcast Relay", "GPS Lock", "Network cascade queue active", "Instant emergency sync", "GNSS", "Mesh Node", "Node v1.0 / Secured Dispatch", profile icons and user menus, "Estimated Arrival Time", "Adjust Caller ETA", "Scene reached (0 mins remaining)", "0.0 km remaining", hard-coded counts ("5 Active", "6 Events Recorded"), and any map that is not OpenStreetMap or coordinates that are not the event's. Keep the layout, colours, fonts and component structure.

---

## Role B: Backend (`/server`)
```
My role: B. My folder: /server. Work through these in order and stop after each acceptance test.
1. Express skeleton on 0.0.0.0:PORT, CORS on, .env loading (DEMO_MODE, PROVIDER, BASE_URL, ESCALATE_AFTER_S). GET /health returns {"ok":true}. TEST: curl /health.
2. Data layer behind one function findNearest(types, lat, lng, limit). Try Postgres+PostGIS in Docker for at most 20 minutes, otherwise use in-memory haversine. Same interface either way.
3. Seed script using OpenStreetMap Overpass (amenity=hospital, police, fuel; shop=car_repair) within 15 km of two presets: GNIT campus 22.6951, 88.3788 and an NH-19 sample point I will give you. Cache the result in a JSON file so a failed Overpass call never blocks us. Phones come from DEMO_WHITELIST and every row is marked is_demo. TEST: count per type for each preset.
4. triage/rules.ts: medical->hospital, accident->hospital+police, breakdown->mechanic, fuel->fuel_pump, with unit tests. POST /api/sos exactly as docs/API_CONTRACT.md, sorted by distance. TEST: curl all four categories.
5. Dispatch behind PROVIDER=mock|twilio. Mock writes the would-be SMS/voice to dispatch_log and labels it "SIMULATED DISPATCH". Accept links use random tokens stored as hashes.
6. Accept/decline/status endpoints (/r/:token/...), GET /api/sos/:id real step flags, GET /api/events, SSE /api/stream, POST /api/dev/reset (DEMO_MODE only), GET /api/metrics (n and median, no hard-coded numbers).
7. Tier 2 only after the Tier 1 gate: escalation worker (ESCALATE_AFTER_S=20), on_duty filter, role filter, offline SMS inbound parser.
Never: contact real numbers outside DEMO_WHITELIST, invent data, or say help is coming before an accept.
```

## Role C: Mobile (`/mobile`)
```
My role: C. My folder: /mobile. Build in this order and stop after each acceptance test.
1. Expo app (verify which modules run in Expo Go before adding native ones). Home screen matching DESIGN.md and the reference images: 4 emergency tiles, location card with a DEMO preset switch (campus and NH-19 sample), Drive Mode card, a filled red Call 112 button that only opens the dialer on tap. No dead tabs or buttons.
2. API client using API_BASE_URL from config. Tapping a tile calls POST /api/sos. Status screen polls GET /api/sos/:id every 2 seconds and shows ONLY real flags (sent, notified, accepted, on the way, arrived, resolved). Show an estimate only if responder_eta_minutes is not null, labelled "Responder's estimate". If unanswered: "No responder answered. Call 112."
3. Drive Mode: a pure detector (idle, armed, verifying, countdown, SOS) plus a Simulate crash button that replays traces (crash, speed_breaker, pothole, hard_brake, stationary_drop). Crash goes to a 20-second countdown with alarm, haptics and a big "I'm OK" button. At zero send trigger=crash_auto with peak_g and pre_impact_kmh. A bump must show "Bump ignored".
4. Tier 2: live sensor mode with a Mock speed switch, offline ladder (NetInfo, save to a local queue, retry every 3 s, Morse with screen flash plus torch plus beep, prefilled SMS fallback), "Delivered from queue" tag.
Never: show an ETA the system computed, claim "on the way" before the responder presses it, or send raw motion data.
```

## Role D: Web (`/web`)
```
My role: D. My folder: /web. The Express server serves this folder.
1. Serve /console and /r/:token from /web. If /web/design exists (Stitch export), use it as the markup and CSS base; remove everything in the Stitch strip list and replace hard-coded text with API data.
2. Console: queue from GET /api/events?responder_id=, live updates from SSE /api/stream with a 3-second polling fallback, an "Enable sound" button and a chime on new alerts. Leaflet with OpenStreetMap tiles, a dashed straight line, "Open in Maps" link, and the text "© OpenStreetMap contributors".
3. Implement ONE function render(state) for the state table in DESIGN.md section 15 (S0 incoming, S1 accepted, S2 on the way, S3 arrived, S4 resolved). Never mix states: before accept the Accepted step is unchecked, buttons are disabled and the countdown runs; after accept the Accept buttons and countdown disappear and only the next step button is enabled.
4. Accept page /r/:token for phones: same states, same rules, no tab bar. It calls the same endpoints as the console.
5. Tier 2: On duty toggle (POST /api/responders/:id/duty), role view selector (DEMO_MODE only), step buttons. Tier 3: history, operations overview.
Never show: rider phone numbers, priority tags, invented statistics, a computed ETA, or "Coming soon" on the open screen.
```

## Role A: Lead (`/docs` and the repo)
```
My role: A. My folder: /docs plus the repo root. Tasks:
1. Keep docs/API_CONTRACT.md in sync with what B actually built.
2. After each gate update the README status table: tick only items that ran, never anything unbuilt.
3. Write the demo script and the 2-minute backup video script from docs/DEMO.md.
4. Prepare README screenshots (assets/screens/), the final README, and the Devfolio text from DEVFOLIO_SUBMISSION.md using only facts that are true.
5. Update the deck with real screenshots, the crash flow, the console and "what is simulated".
```
