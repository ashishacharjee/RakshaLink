# Rules — RakshaLink (read before every session)

## R1. No fabrication (most important)
- Do not invent statistics, partnerships, responder phone numbers, response times, or "tested with" claims.
- Only use the PPT's stats: 4,80,583 accidents; 1,72,890 deaths; ~20 deaths/hour; 1.54 / 1.68 / 1.73 lakh for 2021 / 2022 / 2023; "5% of roads, 59% of highway fatalities". The source for all of these is MoRTH.
- Do not put numbers on the 2023 "who dies" donut chart. The PPT shows no values.
- Roadmap (Pilot Highway, State Highways, National) and partnerships (NHAI, patrol, petrol pumps) are **proposals**. Never write "partnered with" or "integrated with".
- If a value is unknown, display "unknown"/"demo data", not a plausible guess.

## R2. Never contact real emergency services or real businesses in dev/demo
- `DEMO_MODE=true` by default. Outbound SMS/voice goes only to whitelisted team numbers.
- Do not write code paths that dial 112/100/108 automatically. Only a manual "Call 112" button (tel: link).

## R3. Triage must be explainable and deterministic
- Category to responder type mapping lives in ONE file (`triage/rules.ts`) and is unit-tested.
- LLM output, if used, is validated against the enum. Invalid output means fall back to asking the user.
- No auto-dispatch from an unconfirmed low-confidence voice result. (The only automatic dispatch allowed is crash detection under R9.)

## R4. Offline claims must match what works
- Morse is a local signal plus queue. Do not describe it as "transmitting to responders".
- SMS fallback requires a user tap on the prefilled message. Do not claim silent background SMS.

## R5. Scope discipline
- Build order: F1, F2, F3, then F5, F4, F6. Do not start stretch items until the end-to-end demo works.
- No extra libraries for cosmetics. No custom hardware. No user accounts.
- Every feature must be demoable in under 60 seconds.

## R6. Privacy
- Store only what is needed: category, location, timestamp, transcript (optional). No names, no contact lists.
- Do not include team members' personal contact details anywhere in the app or repo.

## R7. Quality gates
- Unit tests: `morseToTimeline("SOS")`, triage mapping for all 4 categories, SMS payload parser, nearest-responder ordering.
- After each phase: run it, paste the real output in `MEMORY.md`. Do not write "works" without running it.
- Commit small, one phase per branch/tag.

## R8. Memory
- At the end of every session, update `MEMORY.md` (done, in progress, decisions, known bugs).

## R9. Crash detection (Drive Mode) — added after the PPT
- Auto-dispatch happens ONLY after the full countdown, with a loud alarm + vibration + a large visible cancel. Never silent, never instant.
- A single accelerometer spike must NEVER trigger. Require all of: driving context (GPS speed), impact spike, and post-impact verification (sharp speed drop / stillness). A bump where speed continues = discard (speed breaker, pothole).
- All thresholds live in one config file and are marked "starting values, not validated".
- Do NOT claim accuracy, detection rate, or false-positive rate. Say "prototype heuristic, tested on simulated and replayed traces".
- Motion data stays on the device. Only a summary (trigger type, peak g, pre-impact speed, location, time) is sent when an SOS fires.
- Testing: replay recorded/synthetic traces and a dev "Simulate crash" button. Never test with real collisions or by throwing/dropping phones. Speed-breaker negative tests are done at low speed by a passenger.
- Be honest about platform limits: the MVP runs as a foreground "Drive Mode"; reliable background detection needs an Android foreground service, and iOS restricts background sensing.
- Auto SOS in dev/demo goes through DEMO_MODE like every other dispatch.

## R10. Responder loop, escalation, family alerts, metrics
- **Never claim help is coming unless a responder accepted.** Status steps reflect real events only (`accepted_at` set). If all escalations fail, status = "No responder answered. Call 112" with the Call 112 button emphasised.
- Accept links use unguessable random tokens (128-bit), single responder each, expiring (default 2 hours). Store only a hash.
- Escalation never contacts a responder twice for the same event and stops after the 3 nearest per type.
- Family alerts require explicit opt-in. Contacts are chosen by the user, kept on the device, sent only at SOS time, and not stored server-side. In DEMO_MODE they go only to whitelisted numbers.
- Metrics are computed from real log rows only. Always show the sample size. Never put an unmeasured number on a slide.
- Live events console, if built, is DEMO_MODE-only (no real user data exposed).

## R11. Responder Console honesty
- The console always shows a visible "DEMO · SIMULATED RESPONDER NETWORK" banner while responders are seed/demo data.
- It never implies real police, hospital, or government systems are connected. In the pitch, say: "this is the interface responders would use; real onboarding is future work, ideally integrated with, not replacing, the official 112 system."
- The no-password "view as" selector exists only in DEMO_MODE and must be disabled otherwise.

## R12. Event rules and attribution
- All code and designs are created inside the 8-hour window. Before 10:00 on 8 Oct: plans, accounts, installs and throwaway practice only. No product code, no committed code, no product UI designs generated beforehand.
- If asked, disclose AI tools, libraries and APIs used.
- Show "© OpenStreetMap contributors" wherever OSM data or maps appear.

## R13. Honesty about simulation, and basic security
- `PROVIDER=mock` output is always labelled "SIMULATED DISPATCH". Never present it as a real SMS or call. Real-SMS proof is the provider's console log.
- The console and demo data are labelled "DEMO · SIMULATED RESPONDER NETWORK".
- Apply the hardening basics in ARCHITECTURE (rate limit, validation, hashed tokens, no secrets in the repo). A security judge may probe them.

## R14. No dead UI
Any button, tab or toggle that is not wired must be hidden or labelled "Coming soon". A judge tapping a dead control costs more than a missing feature.

## R15. Responder workflow honesty and brand hygiene
- Status steps (On the way, Arrived, Resolved) are set only by a responder action. Never auto-advance. The rider sees only real events.
- Show an ETA only if the responder typed it, labelled "Responder's estimate". Never show an ETA the system computed. Distance is straight-line.
- Never show a rider's phone number or personal data on the console.
- The console always carries the DEMO banner while responders are demo data. Never use real organisation names.
- Do not copy another brand's look or name into the UI (no ride-hailing logos, colours, or wording). The workflow is inspired by driver apps; the visuals are RakshaLink's.
