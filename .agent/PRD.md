# PRD — RakshaLink

**Event:** Recursive Hackathon (Shift-8), GNIT — first ACM-sponsored hackathon at GNIT
**Team:** InitToWinIt | **Theme:** Road Safety & Emergency Response Tech
**One-liner (from our PPT):** Not just an SOS button — a triage agent that knows exactly who to call, online or off.

## 0. Event constraints and tiers (updated 3 Oct)
Event: Thu 8 Oct 2026, 8-hour in-person sprint, team of 2 to 4. All code and designs are created inside the window. Tiers decide what gets built first (see PHASES.md).

| Tier | Features |
|---|---|
| **T1 must** | F1 one-tap SOS, F2 matching, F3 dispatch (`PROVIDER=mock or twilio`), F6 live status with real flags, F8 accept page, F8b Responder Console, F7a Drive Mode with *Simulate crash* + 20 s countdown + auto SOS, F14 demo location override, demo reset |
| **T2** | F9 escalation, F5 offline ladder (Morse, queue, SMS fallback), F7b real sensor crash detector, F10 family alert, F11 time-to-dispatch metric |
| **T3** | F4 voice SOS, F12 language toggle (EN/HI/BN), F13 Share location, History/Settings/Location tabs, map polish, bystander mode |

New small features:
- **F12 Language toggle:** English, Hindi, Bengali labels from one strings file. Have a native speaker on the team review the text.
- **F13 Share:** the Share button on the location card opens the phone's share sheet with an OpenStreetMap link.
- **F14 Demo location override (dev/demo only):** two presets, "GNIT campus" (22.6951, 88.3788) and "NH-19 sample point" (pick a point from a map on the day, label it sample). Responders are seeded near both so matching is predictable indoors.
- **Demo reset (dev/demo only):** one call or button clears events so the demo can be re-run.

Screens: Home, Status, Crash countdown, Responder Console, Accept page are T1. Offline screen is T2. Voice, Settings, History, Location tab are T3. Rule: no dead buttons. Hide or label "Coming soon".

## 1. Problem (source: our PPT, citing MoRTH "Road Accidents in India 2023")
- 4,80,583 road accidents and 1,72,890 deaths in 2023 (highest recorded); about 20 deaths per hour.
- Highways are a small share of the road network but a large share of deaths. The PPT says "5% of roads, 59% of deaths".
- Most emergency apps assume signal. Highways often have patchy coverage.
- Four situations we cover: **Fuel runs out, Breakdown, Road accident, Medical SOS.**

> Verify before presenting: the 5%/59% figure. MoRTH reports national and state highways separately. Label it exactly as the MoRTH table states it (likely "National + State Highways"). Do not add numbers for the 2023 donut chart that we have not read in the MoRTH report.

## 2. Users
- Primary: a driver/rider/passenger stuck on a highway, possibly stressed, possibly with weak signal.
- Secondary: responders (hospital, mechanic, police, fuel pump) who receive the alert.

## 3. Core features (MVP — in this order of priority)
| # | Feature | Acceptance criterion |
|---|---|---|
| F1 | One-tap SOS with 4 categories | Tap category, GPS captured, event created in under 3 s on good network |
| F2 | Smart matching (triage agent) | Returns the nearest right-type responder(s) from PostGIS, ordered by real distance |
| F3 | Dispatch via SMS + AI voice call | Responder receives SMS with map link and a TTS voice call (Twilio or equivalent) |
| F4 | Voice SOS ("just speak it") | Speech to category via STT + keyword rules; user confirms by tap or spoken yes |
| F5 | Offline fallback ladder | See section 4 |
| F6 | Live status screen | Shows "Alert sent / Responder notified / Responder accepted" |

**Stretch (only after F1-F6 work end to end):** responder accept link, ETA display, Hindi/Bengali UI strings.
**Out of scope:** custom hardware, payments, real ambulance integration, accounts/KYC, ML model training.

## 4. The offline story (our differentiator — be precise, judges will probe it)
1. **Data available:** app calls our API.
2. **No data but cellular SMS works:** app opens a prefilled SMS to our gateway number with a compact payload. Gateway webhook parses it and runs the same triage.
3. **No signal at all:** app runs the **Morse SOS** pattern on torch and speaker (··· --- ···) so people nearby can notice, and **queues** the SOS. It auto-retries when signal returns.

Honest limits to say out loud: Morse does not reach a responder by itself. It is a local visual/audible signal plus a queue. iOS and Play-Store Android do not allow silent background SMS, so the user taps Send on the prefilled message.

## 5. Success criteria for the demo
- A live end-to-end run: tap Medical, GPS sent, nearest hospital matched, SMS arrives on a team phone, voice call rings.
- Airplane-mode run: Morse flashes, SOS queued, then delivered when airplane mode is turned off.
- Matching result visibly changes when the category changes (Fuel gives a pump, Medical gives a hospital).

## 6. Roadmap claims (from the PPT — keep them as roadmap, not as built)
Phase 1 pilot highway, Phase 2 state highways, Phase 3 national network. Partnerships (Highway patrol, NHAI, petrol pumps) are proposed sustainability ideas, not signed deals. Never say "partnered".

## 7. Addition: Auto Crash Detection ("Drive Mode") — NOT in the submitted PPT
**Why:** the tap/voice SOS fails when the victim is unconscious or can't reach the phone. Drive Mode closes that gap.
**Flow:** user starts Drive Mode, then phone senses a crash pattern, then a 20 s countdown with alarm, then (no cancel) automatic `accident` SOS (hospital + police) with location.

| # | Feature | Acceptance criterion |
|---|---|---|
| F7 | Drive Mode crash detection | Replayed crash trace triggers the countdown. Replayed speed-breaker/pothole trace does NOT. No cancel in 20 s means an `accident` SOS is created with `trigger=crash_auto`. Cancel means nothing is sent and the event is logged locally as a false alarm |

**Detection logic (multi-signal, so speed breakers are filtered):** driving context (GPS speed above a threshold), then impact spike, then within ~3 s a sharp speed drop / near-stillness (and optionally a gyro rotation spike for a rollover). Spike but speed continues means discard.

**Known weak spots (say them before judges do):**
- Two-wheelers are the biggest slice in our own "who dies" chart, but a phone in a pocket gives noisier data. Best results are with a mounted phone or a bag.
- Not validated on real crashes. It is a heuristic, not a medical-grade system.
- Background operation is limited (see ARCHITECTURE).

**"How is this different from built-in crash detection?"** To my knowledge, newer Pixel and iPhone models have crash detection, but only on certain devices, and they contact general emergency services. RakshaLink works on a wide range of phones with an accelerometer, routes to the *right type* of nearby responder, and has the offline ladder. Verify the current state of those features before stating it on stage.

**Pitch note:** the PPT does not mention this yet. Slides 4 (Solution), 5 (Stack/architecture) and 6 (Methodology) need a "Crash detected, countdown, auto-SOS" step before the final presentation.

## 8. Additions for the win (see WINNING.md)
| # | Feature | Acceptance criterion |
|---|---|---|
| F8 | Responder accept page | SMS contains a link. Opening it shows the alert and map with Accept / Can't respond. Accept sets `accepted_at` and the user's status screen shows "Responder accepted" |
| F9 | Auto-escalation | No accept within `ESCALATE_AFTER_S` means the next-nearest responder is contacted. After 3 attempts per type with no accept, the user sees "No responder answered. Call 112" |
| F10 | Family alert | Up to 2 opted-in contacts receive an SMS with a map link at SOS time |
| F11 | Time-to-dispatch metric | Computed from logs, displayed with n, never hard-coded |

Extras (only if time remains): bystander mode, Hindi/Bengali labels.

## 9. Two-surface demo: User App + Responder Console (team decision)
Like Rapido has a rider app and a Captain app, RakshaLink has two surfaces:
- **User App (phone):** SOS tiles, voice, Drive Mode, offline ladder.
- **Responder Console (laptop, web):** what hospitals, police, mechanics and fuel pumps would see. A live queue of incoming alerts, a map, Accept / Can't respond, and an escalation countdown.

| # | Feature | Acceptance criterion |
|---|---|---|
| F8b | Responder Console (desktop web) | An SOS from the phone appears on the laptop within about 2 s (live push). Accept on the laptop updates the phone timeline. Ignore it and the escalation countdown fires and the next responder gets it |

The SMS and voice call still go to a team phone, as proof that the real channel works. The console shows the responder experience. It is a **simulated responder network**: no real hospital or police station is connected, and the screen says so.

## 10. Responder Console v2: Captain-style workflow (added 3 Oct)
Inspired by ride-hailing driver apps: go on duty, a request rings with a countdown, accept, travel, arrive, finish. Desktop screens are specified in `STITCH_DESKTOP_PROMPT.md`.

| # | Feature | Tier | Acceptance criterion |
|---|---|---|---|
| F8b | Console core: live alert queue, map with rider pin, detail panel, Accept / Can't respond, escalation countdown | T1 | Alert appears within about 2 s. Accept updates the rider's status |
| F15 | **On duty toggle** | T2 | An off-duty responder is not matched or contacted. Turning it on restores matching |
| F16 | **Status progression:** On the way, Arrived, Resolved | T2 | Each step is set only by the responder. The rider's timeline shows each real step |
| F17 | **Role views:** hospital sees medical and accident; police sees accident; mechanic sees breakdown; fuel pump sees fuel | T2 | The "view as" selector (DEMO_MODE only) filters the queue by role |
| F18 | Responder ETA estimate (typed by the responder, shown to the rider as "Responder's estimate") | T3 | Never shown unless the responder entered it |
| F19 | History table | T3 | Lists past alerts, response, time to accept, outcome |
| F20 | Operations overview (dark control-room view of all alerts and responders, for the big screen) | T3 | Shows live events across responders, labelled DEMO |

Not included on purpose: earnings, ratings, rider phone numbers, a driving-route ETA computed by us (distance is straight-line only).
